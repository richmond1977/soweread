/**
 * Import exported SQLite data into Neon PostgreSQL.
 * Prerequisites:
 *   1. Set DATABASE_URL and DATABASE_DIRECT_URL in .env to your Neon connection strings
 *   2. Run: npm run db:push  (to create schema in Neon)
 *   3. Run: node prisma/import-to-neon.mjs
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const prisma = new PrismaClient();

async function main() {
  const raw = readFileSync("prisma/sqlite-export.json", "utf-8");
  const { authors, categories, posts } = JSON.parse(raw);

  console.log("Importing authors...");
  for (const a of authors) {
    await prisma.author.upsert({
      where: { id: a.id },
      update: a,
      create: a,
    });
  }

  console.log("Importing categories...");
  for (const c of categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }

  console.log("Importing posts...");
  for (const p of posts) {
    await prisma.post.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
