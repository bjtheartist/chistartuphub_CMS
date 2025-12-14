import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Platform management
  platforms: router({
    list: publicProcedure.query(async () => {
      return await db.getAllPlatforms();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPlatformById(input.id);
      }),
  }),

  // Post management
  posts: router({
    list: protectedProcedure
      .input(z.object({ status: z.enum(["draft", "scheduled", "published", "archived"]).optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (input?.status) {
          return await db.getPostsByStatus(input.status, ctx.user.id);
        }
        return await db.getAllPosts(ctx.user.id);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPostById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        platformId: z.number(),
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        postType: z.string().optional(),
        status: z.enum(["draft", "scheduled", "published", "archived"]).default("draft"),
        scheduledFor: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createPost({
          userId: ctx.user.id,
          platformId: input.platformId,
          title: input.title,
          content: input.content,
          postType: input.postType,
          status: input.status,
          scheduledFor: input.scheduledFor,
        });
        return { success: true, id: Number((result as any)[0]?.insertId || 0) };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        content: z.string().min(1).optional(),
        postType: z.string().optional(),
        status: z.enum(["draft", "scheduled", "published", "archived"]).optional(),
        scheduledFor: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updatePost(id, updates);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePost(input.id);
        return { success: true };
      }),
    
    getUpcoming: protectedProcedure
      .query(async ({ ctx }) => {
        const scheduled = await db.getPostsByStatus("scheduled", ctx.user.id);
        // Sort by scheduledFor date
        return scheduled
          .filter(p => p.scheduledFor)
          .sort((a, b) => {
            if (!a.scheduledFor || !b.scheduledFor) return 0;
            return a.scheduledFor.getTime() - b.scheduledFor.getTime();
          })
          .slice(0, 10); // Return next 10 upcoming posts
      }),
  }),

  // Asset management
  assets: router({
    list: protectedProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (input?.category) {
          return await db.getAssetsByCategory(input.category, ctx.user.id);
        }
        return await db.getAllAssets(ctx.user.id);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAssetById(input.id);
      }),
    
    upload: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        fileData: z.string(), // Base64 encoded file
        mimeType: z.string(),
        category: z.string().optional(),
        assetType: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Decode base64 file data
        const buffer = Buffer.from(input.fileData, 'base64');
        const fileSize = buffer.length;
        
        // Generate unique file key
        const extension = input.mimeType.split('/')[1] || 'bin';
        const fileKey = `cms-assets/${ctx.user.id}/${nanoid()}.${extension}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        // Save to database
        const result = await db.createAsset({
          userId: ctx.user.id,
          name: input.name,
          fileKey,
          url,
          mimeType: input.mimeType,
          fileSize,
          width: input.width,
          height: input.height,
          category: input.category,
          assetType: input.assetType,
        });
        
        return { success: true, id: Number((result as any)[0]?.insertId || 0), url };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAsset(input.id);
        return { success: true };
      }),
    
    linkToPost: protectedProcedure
      .input(z.object({
        postId: z.number(),
        assetId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.linkPostToAsset(input.postId, input.assetId);
        return { success: true };
      }),
    
    getForPost: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAssetsForPost(input.postId);
      }),
  }),

  // Dashboard stats
  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      const allPosts = await db.getAllPosts(ctx.user.id);
      const scheduledPosts = allPosts.filter(p => p.status === "scheduled");
      const publishedPosts = allPosts.filter(p => p.status === "published");
      
      return {
        totalFollowers: 12450, // Mock data - would come from social platform APIs
        engagementRate: 5.2, // Mock data
        postsScheduled: scheduledPosts.length,
        mentions: 45, // Mock data
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
