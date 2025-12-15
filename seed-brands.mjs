import mysql from 'mysql2/promise';

const brands = [
  {
    name: 'ChiStartup Hub',
    slug: 'chistartuphub',
    website: 'https://chistartuphub.com',
    description: 'The Operating System for Chicago Founders. Zero gatekeeping. Just resources.',
    industry: 'Startup Community',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    accentColor: '#2563EB',
    tagline: 'The Operating System for Chicago Founders',
    isActive: 1
  },
  {
    name: 'Just AFC',
    slug: 'justafc',
    website: 'https://justafc.com',
    description: 'Adult Family Care home providing compassionate, family-like care for seniors.',
    industry: 'Senior Care',
    primaryColor: '#4A90A4',
    secondaryColor: '#F5F0E8',
    accentColor: '#7BA17B',
    tagline: 'Where Family Meets Care',
    isActive: 1
  },
  {
    name: 'Everett Home Staffing',
    slug: 'everett-home-staffing',
    website: 'https://everetthomestaffing.com',
    description: 'Professional home care staffing agency providing compassionate caregivers for seniors.',
    industry: 'Home Care Staffing',
    primaryColor: '#1E3A5F',
    secondaryColor: '#F5F0E8',
    accentColor: '#D4A853',
    tagline: 'Compassionate Care, Right at Home',
    isActive: 1
  },
  {
    name: 'Kivara Studios',
    slug: 'kivara-studios',
    website: 'https://kivarastudios.dev',
    description: 'Modern websites for businesses who don\'t have months to wait. 24-72 hour delivery.',
    industry: 'Web Development',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    accentColor: '#2563EB',
    tagline: 'Modern websites for businesses who don\'t have months to wait',
    isActive: 1
  },
  {
    name: 'BJN Fitness',
    slug: 'bjn-fitness',
    website: 'https://instagram.com/bjnfitness',
    description: 'Christian holistic fitness focused on faith, physical fitness, and mental wellness.',
    industry: 'Fitness & Wellness',
    primaryColor: '#1E3A5F',
    secondaryColor: '#FFFFFF',
    accentColor: '#D4A853',
    tagline: 'Faith. Fitness. Flourish.',
    isActive: 1
  }
];

async function seedBrands() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  console.log('Connected to database');

  for (const brand of brands) {
    try {
      // Check if brand already exists
      const [existing] = await connection.execute(
        'SELECT id FROM brands WHERE slug = ?',
        [brand.slug]
      );

      if (existing.length > 0) {
        console.log(`Brand "${brand.name}" already exists, skipping...`);
        continue;
      }

      await connection.execute(
        `INSERT INTO brands (name, slug, website, description, industry, primaryColor, secondaryColor, accentColor, tagline, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          brand.name,
          brand.slug,
          brand.website,
          brand.description,
          brand.industry,
          brand.primaryColor,
          brand.secondaryColor,
          brand.accentColor,
          brand.tagline,
          brand.isActive
        ]
      );
      console.log(`✓ Added brand: ${brand.name}`);
    } catch (error) {
      console.error(`Error adding brand ${brand.name}:`, error.message);
    }
  }

  await connection.end();
  console.log('Done seeding brands!');
}

seedBrands().catch(console.error);
