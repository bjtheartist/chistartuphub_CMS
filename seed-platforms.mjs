import { drizzle } from "drizzle-orm/mysql2";
import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";
import dotenv from "dotenv";

dotenv.config();

// Define platforms table inline for seeding
const platforms = mysqlTable("platforms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  color: varchar("color", { length: 20 }),
  icon: varchar("icon", { length: 50 }),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

const db = drizzle(process.env.DATABASE_URL);

const platformData = [
  { name: "LinkedIn", slug: "linkedin", color: "#0A66C2", icon: "linkedin", isActive: 1 },
  { name: "X (Twitter)", slug: "x", color: "#000000", icon: "twitter", isActive: 1 },
  { name: "Instagram", slug: "instagram", color: "#E4405F", icon: "instagram", isActive: 1 },
  { name: "Facebook", slug: "facebook", color: "#1877F2", icon: "facebook", isActive: 1 },
  { name: "YouTube", slug: "youtube", color: "#FF0000", icon: "youtube", isActive: 1 },
];

async function seed() {
  console.log("Seeding platforms...");
  
  for (const platform of platformData) {
    try {
      await db.insert(platforms).values(platform).onDuplicateKeyUpdate({ set: { isActive: platform.isActive } });
      console.log(`✓ ${platform.name}`);
    } catch (error) {
      console.error(`✗ ${platform.name}:`, error.message);
    }
  }
  
  console.log("Seeding complete!");
  process.exit(0);
}

seed();
