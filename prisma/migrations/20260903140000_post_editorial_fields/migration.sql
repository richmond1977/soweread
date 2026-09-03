-- These Post columns were added to schema.prisma in earlier commits but
-- never had a migration, so the production database was missing them and
-- every prisma.post query failed into the seed-content fallback.

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "contentUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "coverImageAlt" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "showFaq" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourcesJson" TEXT NOT NULL DEFAULT '[]';

