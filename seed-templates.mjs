/**
 * Seed script for pre-built design templates
 * Run with: node seed-templates.mjs
 */

import mysql from "mysql2/promise";
import "dotenv/config";

// Fabric.js JSON templates for various social media formats
const templates = [
  // Instagram Post - Announcement
  {
    name: "Announcement - Instagram",
    description: "Bold announcement template for Instagram posts",
    width: 1080,
    height: 1080,
    category: "announcement",
    canvasJson: JSON.stringify({
      version: "6.0.0",
      objects: [
        {
          type: "rect",
          left: 0,
          top: 0,
          width: 1080,
          height: 1080,
          fill: "#3B82F6",
          selectable: false,
        },
        {
          type: "i-text",
          left: 540,
          top: 400,
          text: "BIG NEWS",
          fontSize: 120,
          fontFamily: "Inter, sans-serif",
          fontWeight: "bold",
          fill: "#FFFFFF",
          originX: "center",
          originY: "center",
          textAlign: "center",
        },
        {
          type: "i-text",
          left: 540,
          top: 550,
          text: "Your announcement here",
          fontSize: 48,
          fontFamily: "Inter, sans-serif",
          fill: "#FFFFFF",
          originX: "center",
          originY: "center",
          textAlign: "center",
          opacity: 0.9,
        },
        {
          type: "i-text",
          left: 540,
          top: 950,
          text: "@yourbrand",
          fontSize: 32,
          fontFamily: "Inter, sans-serif",
          fill: "#FFFFFF",
          originX: "center",
          originY: "center",
          opacity: 0.7,
        },
      ],
      background: "#3B82F6",
    }),
  },

  // Instagram Post - Quote
  {
    name: "Inspirational Quote - Instagram",
    description: "Elegant quote template for Instagram",
    width: 1080,
    height: 1080,
    category: "quote",
    canvasJson: JSON.stringify({
      version: "6.0.0",
      objects: [
        {
          type: "rect",
          left: 0,
          top: 0,
          width: 1080,
          height: 1080,
          fill: "#000000",
          selectable: false,
        },
        {
          type: "i-text",
          left: 540,
          top: 200,
          text: """,
          fontSize: 200,
          fontFamily: "Georgia, serif",
          fill: "#FCD34D",
          originX: "center",
          originY: "center",
        },
        {
          type: "i-text",
          left: 540,
          top: 500,
          text: "Your inspiring\nquote goes here",
          fontSize: 64,
          fontFamily: "Georgia, serif",
          fill: "#FFFFFF",
          originX: "center",
          originY: "center",
          textAlign: "center",
          lineHeight: 1.3,
        },
        {
          type: "i-text",
          left: 540,
          top: 750,
          text: "— Author Name",
          fontSize: 36,
          fontFamily: "Inter, sans-serif",
          fill: "#FCD34D",
          originX: "center",
          originY: "center",
        },
      ],
      background: "#000000",
    }),
  },

  // Instagram Story - Promo
  {
    name: "Sale Promo - Story",
    description: "Eye-catching sale promotion for Instagram Stories",
    width: 1080,
    height: 1920,
    category: "promo",
    canvasJson: JSON.stringify({
      version: "6.0.0",
      objects: [
        {
          type: "rect",
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          fill: "#FCD34D",
          selectable: false,
        },
        {
          type: "i-text",
          left: 540,
          top: 600,
          text: "SALE",
          fontSize: 200,
          fontFamily: "Inter, sans-serif",
          fontWeight: "bold",
          fill: "#000000",
          originX: "center",
          originY: "center",
        },
        {
          type: "i-text",
          left: 540,
          top: 850,
          text: "50% OFF",
          fontSize: 120,
          fontFamily: "Inter, sans-serif",
          fontWeight: "bold",
          fill: "#000000",
          originX: "center",
          originY: "center",
        },
        {
          type: "rect",
          left: 340,
          top: 1100,
          width: 400,
          height: 80,
          fill: "#000000",
          rx: 0,
          ry: 0,
        },
        {
          type: "i-text",
          left: 540,
          top: 1140,
          text: "SHOP NOW",
          fontSize: 36,
          fontFamily: "Inter, sans-serif",
          fontWeight: "bold",
          fill: "#FCD34D",
          originX: "center",
          originY: "center",
        },
        {
          type: "i-text",
          left: 540,
          top: 1700,
          text: "Swipe up ↑",
          fontSize: 32,
          fontFamily: "Inter, sans-serif",
          fill: "#000000",
          originX: "center",
          originY: "center",
          opacity: 0.7,
        },
      ],
      background: "#FCD34D",
    }),
  },

  // LinkedIn Post - Stats
  {
    name: "Stats Highlight - LinkedIn",
    description: "Showcase impressive statistics for LinkedIn",
    width: 1200,
    height: 627,
    category: "stats",
    canvasJson: JSON.stringify({
      version: "6.0.0",
      objects: [
        {
          type: "rect",
          left: 0,
          top: 0,
          width: 1200,
          height: 627,
          fill: "#1E3A8A",
          selectable: false,
        },
        {
          type: "i-text",
          left: 600,
          top: 150,
          text: "BY THE NUMBERS",
          fontSize: 32,
          fontFamily: "Inter, sans-serif",
          fontWeight: "bold",
          fill: "#60A5FA",
          originX: "center",
          originY: "center",
          charSpacing: 200,
        },
        {
          type: "i-text",
          left: 600,
          top: 320,
          text: "10,000+",
          fontSize: 140,
          fontFamily: "Inter, sans-serif",
          fontWeight: "bold",
          fill: "#FFFFFF",
          originX: "center",
          originY: "center",
        },
        {
          type: "i-text",
          left: 600,
          top: 450,
          text: "Happy Customers",
          fontSize: 48,
          fontFamily: "Inter, sans-serif",
          fill: "#FFFFFF",
          originX: "center",
          originY: "center",
          opacity: 0.9,
        },
        {
          type: "i-text",
          left: 600,
          top: 560,
          text: "Your Company Name",
          fontSize: 24,
          fontFamily: "Inter, sans-serif",
          fill: "#60A5FA",
          originX: "center",
          originY: "center",
        },
      ],
      background: "#1E3A8A",
    }),
  },

  // X/Twitter Post - Thread Starter
  {
    name: "Thread Starter - X",
    description: "Attention-grabbing thread opener for X/Twitter",
    width: 1600,
    height: 900,
    category: "announcement",
    canvasJson: JSON.stringify({
      version: "6.0.0",
      objects: [
        {
          type: "rect",
          left: 0,
          top: 0,
          width: 1600,
          height: 900,
          fill: "#000000",
          selectable: false,
        },
        {
          type: "i-text",
          left: 800,
          top: 350,
          text: "🧵 THREAD",
          fontSize: 80,
          fontFamily: "Inter, sans-serif",
          fontWeight: "bold",
          fill: "#FFFFFF",
          originX: "center",
          originY: "center",
        },
        {
          type: "i-text",
          left: 800,
          top: 500,
          text: "Your compelling hook\ngoes right here",
          fontSize: 56,
          fontFamily: "Inter, sans-serif",
          fill: "#FFFFFF",
          originX: "center",
          originY: "center",
          textAlign: "center",
          lineHeight: 1.4,
        },
        {
          type: "rect",
          left: 100,
          top: 50,
          width: 8,
          height: 800,
          fill: "#3B82F6",
        },
      ],
      background: "#000000",
    }),
  },

  // Facebook Cover
  {
    name: "Cover Photo - Facebook",
    description: "Professional cover photo for Facebook pages",
    width: 820,
    height: 312,
    category: "branding",
    canvasJson: JSON.stringify({
      version: "6.0.0",
      objects: [
        {
          type: "rect",
          left: 0,
          top: 0,
          width: 820,
          height: 312,
          fill: "#111827",
          selectable: false,
        },
        {
          type: "i-text",
          left: 410,
          top: 120,
          text: "Your Brand Name",
          fontSize: 56,
          fontFamily: "Inter, sans-serif",
          fontWeight: "bold",
          fill: "#FFFFFF",
          originX: "center",
          originY: "center",
        },
        {
          type: "i-text",
          left: 410,
          top: 190,
          text: "Your tagline or mission statement goes here",
          fontSize: 24,
          fontFamily: "Inter, sans-serif",
          fill: "#9CA3AF",
          originX: "center",
          originY: "center",
        },
        {
          type: "rect",
          left: 300,
          top: 240,
          width: 220,
          height: 4,
          fill: "#3B82F6",
        },
      ],
      background: "#111827",
    }),
  },

  // Instagram Post - Event
  {
    name: "Event Announcement - Instagram",
    description: "Promote your upcoming event on Instagram",
    width: 1080,
    height: 1080,
    category: "announcement",
    canvasJson: JSON.stringify({
      version: "6.0.0",
      objects: [
        {
          type: "rect",
          left: 0,
          top: 0,
          width: 1080,
          height: 1080,
          fill: "#7C3AED",
          selectable: false,
        },
        {
          type: "i-text",
          left: 540,
          top: 200,
          text: "YOU'RE INVITED",
          fontSize: 48,
          fontFamily: "Inter, sans-serif",
          fontWeight: "bold",
          fill: "#FFFFFF",
          originX: "center",
          originY: "center",
          charSpacing: 100,
        },
        {
          type: "i-text",
          left: 540,
          top: 450,
          text: "EVENT\nNAME",
          fontSize: 120,
          fontFamily: "Inter, sans-serif",
          fontWeight: "bold",
          fill: "#FFFFFF",
          originX: "center",
          originY: "center",
          textAlign: "center",
          lineHeight: 1.1,
        },
        {
          type: "rect",
          left: 240,
          top: 700,
          width: 600,
          height: 150,
          fill: "#FFFFFF",
          rx: 0,
          ry: 0,
        },
        {
          type: "i-text",
          left: 540,
          top: 750,
          text: "DECEMBER 25, 2024",
          fontSize: 36,
          fontFamily: "Inter, sans-serif",
          fontWeight: "bold",
          fill: "#7C3AED",
          originX: "center",
          originY: "center",
        },
        {
          type: "i-text",
          left: 540,
          top: 800,
          text: "Chicago, IL • 7:00 PM",
          fontSize: 24,
          fontFamily: "Inter, sans-serif",
          fill: "#7C3AED",
          originX: "center",
          originY: "center",
        },
      ],
      background: "#7C3AED",
    }),
  },

  // LinkedIn - Testimonial
  {
    name: "Testimonial Card - LinkedIn",
    description: "Share customer testimonials on LinkedIn",
    width: 1200,
    height: 627,
    category: "quote",
    canvasJson: JSON.stringify({
      version: "6.0.0",
      objects: [
        {
          type: "rect",
          left: 0,
          top: 0,
          width: 1200,
          height: 627,
          fill: "#FFFFFF",
          selectable: false,
        },
        {
          type: "rect",
          left: 0,
          top: 0,
          width: 1200,
          height: 8,
          fill: "#10B981",
        },
        {
          type: "i-text",
          left: 100,
          top: 100,
          text: "★★★★★",
          fontSize: 36,
          fontFamily: "Inter, sans-serif",
          fill: "#FCD34D",
          originX: "left",
          originY: "center",
        },
        {
          type: "i-text",
          left: 600,
          top: 280,
          text: ""This product changed\nour business completely.\nHighly recommended!"",
          fontSize: 42,
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          fill: "#1F2937",
          originX: "center",
          originY: "center",
          textAlign: "center",
          lineHeight: 1.4,
        },
        {
          type: "circle",
          left: 480,
          top: 470,
          radius: 40,
          fill: "#E5E7EB",
        },
        {
          type: "i-text",
          left: 600,
          top: 500,
          text: "Jane Smith",
          fontSize: 28,
          fontFamily: "Inter, sans-serif",
          fontWeight: "bold",
          fill: "#1F2937",
          originX: "center",
          originY: "center",
        },
        {
          type: "i-text",
          left: 600,
          top: 540,
          text: "CEO, TechCorp",
          fontSize: 20,
          fontFamily: "Inter, sans-serif",
          fill: "#6B7280",
          originX: "center",
          originY: "center",
        },
      ],
      background: "#FFFFFF",
    }),
  },
];

async function seedTemplates() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  console.log("Connected to database");

  try {
    // Clear existing system templates (userId IS NULL)
    await connection.execute("DELETE FROM templates WHERE userId IS NULL");
    console.log("Cleared existing system templates");

    // Insert new templates
    for (const template of templates) {
      await connection.execute(
        `INSERT INTO templates (name, description, width, height, category, canvasJson, userId, isPublic, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, NULL, 1, NOW(), NOW())`,
        [
          template.name,
          template.description,
          template.width,
          template.height,
          template.category,
          template.canvasJson,
        ]
      );
      console.log(`✓ Created template: ${template.name}`);
    }

    console.log(`\n✅ Successfully seeded ${templates.length} templates`);
  } catch (error) {
    console.error("Error seeding templates:", error);
  } finally {
    await connection.end();
  }
}

seedTemplates();

