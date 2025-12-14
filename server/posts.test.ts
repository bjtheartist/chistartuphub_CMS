import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("posts API", () => {
  it("should list posts for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.posts.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter posts by status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.posts.list({ status: "draft" });

    expect(Array.isArray(result)).toBe(true);
    result.forEach(post => {
      expect(post.status).toBe("draft");
    });
  });

  it("should get upcoming scheduled posts", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.posts.getUpcoming();

    expect(Array.isArray(result)).toBe(true);
    // All returned posts should be scheduled
    result.forEach(post => {
      expect(post.status).toBe("scheduled");
      expect(post.scheduledFor).toBeDefined();
    });
  });
});

describe("platforms API", () => {
  it("should list all active platforms", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.platforms.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    // Verify we have the seeded platforms
    const platformSlugs = result.map(p => p.slug);
    expect(platformSlugs).toContain("linkedin");
    expect(platformSlugs).toContain("x");
    expect(platformSlugs).toContain("instagram");
  });
});

describe("dashboard API", () => {
  it("should return dashboard stats", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.stats();

    expect(result).toBeDefined();
    expect(typeof result.totalFollowers).toBe("number");
    expect(typeof result.engagementRate).toBe("number");
    expect(typeof result.postsScheduled).toBe("number");
    expect(typeof result.mentions).toBe("number");
  });
});

describe("assets API", () => {
  it("should list assets for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.assets.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter assets by category", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.assets.list({ category: "social" });

    expect(Array.isArray(result)).toBe(true);
    result.forEach(asset => {
      expect(asset.category).toBe("social");
    });
  });
});
