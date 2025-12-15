import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Social media platforms supported by the CMS
 */
export const platforms = mysqlTable("platforms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(), // LinkedIn, X, Instagram, etc.
  slug: varchar("slug", { length: 50 }).notNull().unique(), // linkedin, x, instagram
  color: varchar("color", { length: 20 }), // Brand color for UI
  icon: varchar("icon", { length: 50 }), // Icon identifier
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Platform = typeof platforms.$inferSelect;
export type InsertPlatform = typeof platforms.$inferInsert;

/**
 * Social media content posts
 */
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Author
  platformId: int("platformId").notNull(), // Target platform
  brandId: int("brandId"), // Which brand this post is for
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "archived"]).default("draft").notNull(),
  postType: varchar("postType", { length: 50 }), // carousel, story, text, video, etc.
  scheduledFor: timestamp("scheduledFor"), // When to publish
  publishedAt: timestamp("publishedAt"), // Actual publish time
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

/**
 * Asset library for images, videos, templates
 */
export const assets = mysqlTable("assets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Uploader
  name: varchar("name", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3 key
  url: text("url").notNull(), // S3 URL
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"), // bytes
  width: int("width"), // for images
  height: int("height"), // for images
  category: varchar("category", { length: 50 }), // branding, social, campaigns
  assetType: varchar("assetType", { length: 50 }), // image, template, video
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;

/**
 * Link posts to assets (many-to-many)
 */
export const postAssets = mysqlTable("postAssets", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  assetId: int("assetId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostAsset = typeof postAssets.$inferSelect;
export type InsertPostAsset = typeof postAssets.$inferInsert;

/**
 * SMART goals for tracking quarterly objectives
 */
export const goals = mysqlTable("goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Goal owner
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  // SMART criteria
  specific: text("specific"), // What exactly do you want to achieve?
  measurable: text("measurable"), // How will you measure success?
  achievable: text("achievable"), // Is this realistic?
  relevant: text("relevant"), // Why is this important?
  timeBound: text("timeBound"), // When will you achieve this?
  // Tracking
  targetValue: int("targetValue"), // Target metric value
  currentValue: int("currentValue").default(0), // Current progress
  metricType: varchar("metricType", { length: 50 }), // followers, posts, engagement, etc.
  status: mysqlEnum("status", ["active", "completed", "paused", "cancelled"]).default("active").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;

/**
 * Link posts to goals for tracking contribution
 */
export const postGoals = mysqlTable("postGoals", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  goalId: int("goalId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostGoal = typeof postGoals.$inferSelect;
export type InsertPostGoal = typeof postGoals.$inferInsert;

/**
 * Market intelligence notes for competitive research and brainstorming
 */
export const intelligence = mysqlTable("intelligence", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  source: varchar("source", { length: 100 }), // TechCrunch, Twitter, Competitor Blog, Internal
  url: varchar("url", { length: 500 }),
  tags: text("tags"), // JSON array of tags
  convertedToPostId: int("convertedToPostId"), // Reference to post if converted
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Intelligence = typeof intelligence.$inferSelect;
export type InsertIntelligence = typeof intelligence.$inferInsert;

/**
 * User settings and preferences
 */
export const userSettings = mysqlTable("userSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  // Profile
  bio: text("bio"),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  // Platform Connections
  linkedinConnected: int("linkedinConnected").default(0), // 0 = not connected, 1 = connected
  xConnected: int("xConnected").default(0),
  instagramConnected: int("instagramConnected").default(0),
  linkedinApiKey: text("linkedinApiKey"),
  xApiKey: text("xApiKey"),
  instagramApiKey: text("instagramApiKey"),
  // Content Preferences
  defaultVisibility: varchar("defaultVisibility", { length: 20 }).default("public"),
  autoSaveFrequency: int("autoSaveFrequency").default(30), // seconds
  defaultPlatformId: int("defaultPlatformId"),
  timezone: varchar("timezone", { length: 50 }).default("America/Chicago"),
  // Notification Settings
  emailNotifications: int("emailNotifications").default(1),
  calendarReminders: int("calendarReminders").default(1),
  weeklyReports: int("weeklyReports").default(1),
  // Brand Settings
  companyLogoUrl: varchar("companyLogoUrl", { length: 500 }),
  brandColorPrimary: varchar("brandColorPrimary", { length: 20 }).default("#3B82F6"),
  brandColorSecondary: varchar("brandColorSecondary", { length: 20 }).default("#EAB308"),
  defaultHashtags: text("defaultHashtags"), // JSON array
  signatureText: text("signatureText"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

/**
 * Brands/businesses managed in the CMS
 */
export const brands = mysqlTable("brands", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  website: varchar("website", { length: 255 }),
  description: text("description"),
  industry: varchar("industry", { length: 100 }),
  logoUrl: varchar("logoUrl", { length: 500 }),
  primaryColor: varchar("primaryColor", { length: 20 }),
  secondaryColor: varchar("secondaryColor", { length: 20 }),
  accentColor: varchar("accentColor", { length: 20 }),
  tagline: varchar("tagline", { length: 255 }),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = typeof brands.$inferInsert;