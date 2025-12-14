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