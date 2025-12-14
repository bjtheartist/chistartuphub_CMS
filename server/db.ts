import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, platforms, posts, assets, postAssets, InsertPost, InsertAsset, InsertPlatform } from "../drizzle/schema";
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
