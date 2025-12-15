import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Brands API", () => {
  it("should return all brands", async () => {
    const brands = await db.getAllBrands();
    expect(brands).toBeDefined();
    expect(Array.isArray(brands)).toBe(true);
    expect(brands.length).toBeGreaterThanOrEqual(5);
  });

  it("should have the five seeded brands", async () => {
    const brands = await db.getAllBrands();
    const brandNames = brands.map((b: { name: string }) => b.name);
    
    expect(brandNames).toContain("ChiStartup Hub");
    expect(brandNames).toContain("Just AFC");
    expect(brandNames).toContain("Everett Home Staffing");
    expect(brandNames).toContain("Kivara Studios");
    expect(brandNames).toContain("BJN Fitness");
  });

  it("should get brand by slug", async () => {
    const brand = await db.getBrandBySlug("chistartuphub");
    expect(brand).toBeDefined();
    expect(brand?.name).toBe("ChiStartup Hub");
    expect(brand?.website).toBe("https://chistartuphub.com");
  });

  it("should get brand by id", async () => {
    const brands = await db.getAllBrands();
    const firstBrand = brands[0];
    
    const brand = await db.getBrandById(firstBrand.id);
    expect(brand).toBeDefined();
    expect(brand?.id).toBe(firstBrand.id);
    expect(brand?.name).toBe(firstBrand.name);
  });

  it("should have correct brand properties", async () => {
    const brand = await db.getBrandBySlug("bjn-fitness");
    expect(brand).toBeDefined();
    expect(brand?.industry).toBe("Fitness & Wellness");
    expect(brand?.primaryColor).toBeDefined();
    expect(brand?.tagline).toBeDefined();
  });
});
