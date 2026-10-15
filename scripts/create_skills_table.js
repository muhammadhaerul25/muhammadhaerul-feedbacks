const prisma = require('../src/config/db');

async function main() {
  console.log('Creating skills table...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "skills" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "category" TEXT NOT NULL,
      "category_slug" TEXT,
      "accent_color" TEXT DEFAULT 'var(--blue)',
      "icon_svg" TEXT,
      "items" JSONB DEFAULT '[]'::jsonb,
      "tech_stack" JSONB DEFAULT '[]'::jsonb,
      "sort_order" INTEGER NOT NULL DEFAULT 0,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "skills_sort_order_created_at_idx" ON "skills"("sort_order" ASC, "created_at" DESC);
  `);

  console.log('Skills table and index created successfully!');
}

main().catch(console.error).finally(() => process.exit());
