import { eq, desc, and, or, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, platforms, posts, assets, postAssets, goals, postGoals, intelligence, userSettings, brands, templates, InsertPost, InsertAsset, InsertPlatform, InsertGoal, InsertIntelligence, InsertUserSettings, InsertBrand, InsertTemplate } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== PLATFORM OPERATIONS =====

export async function getAllPlatforms() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(platforms).where(eq(platforms.isActive, 1));
}

export async function getPlatformById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(platforms).where(eq(platforms.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPlatform(platform: InsertPlatform) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(platforms).values(platform);
  return result;
}

// ===== POST OPERATIONS =====

export async function getAllPosts(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (userId) {
    return await db.select().from(posts).where(eq(posts.userId, userId)).orderBy(desc(posts.createdAt));
  }
  
  return await db.select().from(posts).orderBy(desc(posts.createdAt));
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPostsByStatus(status: "draft" | "scheduled" | "published" | "archived", userId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (userId) {
    return await db.select().from(posts)
      .where(and(eq(posts.status, status), eq(posts.userId, userId)))
      .orderBy(desc(posts.createdAt));
  }
  
  return await db.select().from(posts)
    .where(eq(posts.status, status))
    .orderBy(desc(posts.createdAt));
}

export async function createPost(post: InsertPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(posts).values(post);
  return result;
}

export async function updatePost(id: number, post: Partial<InsertPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.update(posts).set(post).where(eq(posts.id, id));
  return result;
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete associated post-asset relationships first
  await db.delete(postAssets).where(eq(postAssets.postId, id));
  
  // Delete the post
  const result = await db.delete(posts).where(eq(posts.id, id));
  return result;
}

// ===== ASSET OPERATIONS =====

export async function getAllAssets(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (userId) {
    return await db.select().from(assets).where(eq(assets.userId, userId)).orderBy(desc(assets.createdAt));
  }
  
  return await db.select().from(assets).orderBy(desc(assets.createdAt));
}

export async function getAssetById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(assets).where(eq(assets.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAssetsByCategory(category: string, userId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (userId) {
    return await db.select().from(assets)
      .where(and(eq(assets.category, category), eq(assets.userId, userId)))
      .orderBy(desc(assets.createdAt));
  }
  
  return await db.select().from(assets)
    .where(eq(assets.category, category))
    .orderBy(desc(assets.createdAt));
}

export async function createAsset(asset: InsertAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(assets).values(asset);
  return result;
}

export async function deleteAsset(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete associated post-asset relationships first
  await db.delete(postAssets).where(eq(postAssets.assetId, id));
  
  // Delete the asset
  const result = await db.delete(assets).where(eq(assets.id, id));
  return result;
}

// ===== POST-ASSET RELATIONSHIP OPERATIONS =====

export async function linkPostToAsset(postId: number, assetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(postAssets).values({ postId, assetId });
  return result;
}

export async function getAssetsForPost(postId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      asset: assets,
    })
    .from(postAssets)
    .innerJoin(assets, eq(postAssets.assetId, assets.id))
    .where(eq(postAssets.postId, postId));
  
  return result.map(r => r.asset);
}

// ===== GOAL OPERATIONS =====

export async function getAllGoals(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (userId) {
    return await db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
  }
  
  return await db.select().from(goals).orderBy(desc(goals.createdAt));
}

export async function getGoalById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(goals).where(eq(goals.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getGoalsByStatus(status: "active" | "completed" | "paused" | "cancelled", userId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (userId) {
    return await db.select().from(goals)
      .where(and(eq(goals.status, status), eq(goals.userId, userId)))
      .orderBy(desc(goals.createdAt));
  }
  
  return await db.select().from(goals)
    .where(eq(goals.status, status))
    .orderBy(desc(goals.createdAt));
}

export async function createGoal(goal: InsertGoal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(goals).values(goal);
  return result;
}

export async function updateGoal(id: number, goal: Partial<InsertGoal>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.update(goals).set(goal).where(eq(goals.id, id));
  return result;
}

export async function deleteGoal(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete associated post-goal relationships first
  await db.delete(postGoals).where(eq(postGoals.goalId, id));
  
  // Delete the goal
  const result = await db.delete(goals).where(eq(goals.id, id));
  return result;
}

// ===== POST-GOAL RELATIONSHIP OPERATIONS =====

export async function linkPostToGoal(postId: number, goalId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(postGoals).values({ postId, goalId });
}

// ===== INTELLIGENCE OPERATIONS =====

export async function getAllIntelligence(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (userId) {
    return await db.select().from(intelligence)
      .where(eq(intelligence.userId, userId))
      .orderBy(desc(intelligence.createdAt));
  }
  
  return await db.select().from(intelligence)
    .orderBy(desc(intelligence.createdAt));
}

export async function getIntelligenceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(intelligence).where(eq(intelligence.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getIntelligenceBySource(source: string, userId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (userId) {
    return await db.select().from(intelligence)
      .where(and(eq(intelligence.source, source), eq(intelligence.userId, userId)))
      .orderBy(desc(intelligence.createdAt));
  }
  
  return await db.select().from(intelligence)
    .where(eq(intelligence.source, source))
    .orderBy(desc(intelligence.createdAt));
}

export async function createIntelligence(intel: InsertIntelligence) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(intelligence).values(intel);
  return result[0].insertId;
}

export async function updateIntelligence(id: number, updates: Partial<InsertIntelligence>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(intelligence).set(updates).where(eq(intelligence.id, id));
}

export async function deleteIntelligence(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(intelligence).where(eq(intelligence.id, id));
}

// ===== USER SETTINGS OPERATIONS =====

export async function getUserSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserSettings(settings: InsertUserSettings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(userSettings).values(settings);
  return result[0].insertId;
}

export async function updateUserSettings(userId: number, updates: Partial<InsertUserSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(userSettings).set(updates).where(eq(userSettings.userId, userId));
}

export async function getOrCreateUserSettings(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let settings = await getUserSettings(userId);
  
  if (!settings) {
    // Create default settings for new user
    await createUserSettings({ userId });
    settings = await getUserSettings(userId);
  }
  
  return settings;
}

export async function getGoalsForPost(postId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      goal: goals,
    })
    .from(postGoals)
    .innerJoin(goals, eq(postGoals.goalId, goals.id))
    .where(eq(postGoals.postId, postId));
  
  return result.map(r => r.goal);
}

// ===== BRAND OPERATIONS =====

export async function getAllBrands() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(brands).where(eq(brands.isActive, 1)).orderBy(brands.name);
}

export async function getBrandById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBrandBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBrand(brand: InsertBrand) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(brands).values(brand);
  return result[0].insertId;
}

export async function updateBrand(id: number, updates: Partial<InsertBrand>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(brands).set(updates).where(eq(brands.id, id));
}

export async function deleteBrand(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Soft delete by setting isActive to 0
  await db.update(brands).set({ isActive: 0 }).where(eq(brands.id, id));
}

// ===== TEMPLATE OPERATIONS =====

export async function getAllTemplates(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get system templates (userId is null) and user's own templates
  if (userId) {
    return await db.select().from(templates)
      .where(or(isNull(templates.userId), eq(templates.userId, userId)))
      .orderBy(desc(templates.createdAt));
  }
  
  // Only system templates if no user
  return await db.select().from(templates)
    .where(isNull(templates.userId))
    .orderBy(desc(templates.createdAt));
}

export async function getTemplateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTemplatesByPlatform(platformId: number, userId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (userId) {
    return await db.select().from(templates)
      .where(and(
        eq(templates.platformId, platformId),
        or(isNull(templates.userId), eq(templates.userId, userId))
      ))
      .orderBy(desc(templates.createdAt));
  }
  
  return await db.select().from(templates)
    .where(and(eq(templates.platformId, platformId), isNull(templates.userId)))
    .orderBy(desc(templates.createdAt));
}

export async function getTemplatesByCategory(category: string, userId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (userId) {
    return await db.select().from(templates)
      .where(and(
        eq(templates.category, category),
        or(isNull(templates.userId), eq(templates.userId, userId))
      ))
      .orderBy(desc(templates.createdAt));
  }
  
  return await db.select().from(templates)
    .where(and(eq(templates.category, category), isNull(templates.userId)))
    .orderBy(desc(templates.createdAt));
}

export async function createTemplate(template: InsertTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(templates).values(template);
  return result[0].insertId;
}

export async function updateTemplate(id: number, updates: Partial<InsertTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(templates).set(updates).where(eq(templates.id, id));
}

export async function deleteTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(templates).where(eq(templates.id, id));
}
