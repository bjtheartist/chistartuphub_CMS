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

describe("goals API", () => {
  it("should list goals for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.goals.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter goals by status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.goals.list({ status: "active" });

    expect(Array.isArray(result)).toBe(true);
    result.forEach(goal => {
      expect(goal.status).toBe("active");
    });
  });

  it("should create a new goal", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.goals.create({
      title: "Test Goal",
      description: "Test description",
      specific: "Increase LinkedIn followers",
      measurable: "Reach 10,000 followers",
      achievable: "Post 3x per week",
      relevant: "Grow brand awareness",
      timeBound: "By end of Q1 2025",
      targetValue: 10000,
      metricType: "followers",
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });

    expect(result.success).toBe(true);
    expect(typeof result.id).toBe("number");
  });

  it("should update goal status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a goal
    const created = await caller.goals.create({
      title: "Test Goal to Update",
      specific: "Test specific",
      measurable: "Test measurable",
      targetValue: 100,
      metricType: "posts",
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });

    // Then update it
    const result = await caller.goals.update({
      id: created.id,
      status: "completed",
    });

    expect(result.success).toBe(true);
  });
});

describe("post creation with templates", () => {
  it("should create a post with platform and type", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get platforms first
    const platforms = await caller.platforms.list();
    expect(platforms.length).toBeGreaterThan(0);

    const linkedInPlatform = platforms.find(p => p.slug === "linkedin");
    expect(linkedInPlatform).toBeDefined();

    // Create a post
    const result = await caller.posts.create({
      platformId: linkedInPlatform!.id,
      title: "Test LinkedIn Post",
      content: "This is a test post with LinkedIn template",
      postType: "article",
      status: "draft",
    });

    expect(result.success).toBe(true);
    expect(typeof result.id).toBe("number");
  });

  it("should schedule a post for future date", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const platforms = await caller.platforms.list();
    const xPlatform = platforms.find(p => p.slug === "x");
    expect(xPlatform).toBeDefined();

    const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

    const result = await caller.posts.create({
      platformId: xPlatform!.id,
      title: "Scheduled X Post",
      content: "This post will be published tomorrow",
      postType: "thread",
      status: "scheduled",
      scheduledFor: scheduledDate,
    });

    expect(result.success).toBe(true);
  });
});
