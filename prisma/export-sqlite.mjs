/**
 * Export SQLite data to JSON for import into PostgreSQL (Neon).
 * Run: node prisma/export-sqlite.mjs
 * Output: prisma/sqlite-export.json
 */
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";

// Temporarily override DATABASE_URL to point at the SQLite file
process.env.DATABASE_URL = "file:./prisma/dev.db";

const prisma = new PrismaClient();

async function main() {
  const [authors, categories, posts] = await Promise.all([
    prisma.author.findMany(),
    prisma.category.findMany(),
    prisma.post.findMany(),
  ]);

  const data = { authors, categories, posts };
  writeFileSync("prisma/sqlite-export.json", JSON.stringify(data, null, 2));
  console.log(`Exported: ${authors.length} authors, ${categories.length} categories, ${posts.length} posts`);
  console.log("Output: prisma/sqlite-export.json");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
