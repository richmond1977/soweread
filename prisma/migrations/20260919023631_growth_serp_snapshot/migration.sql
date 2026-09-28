-- CreateTable
CREATE TABLE "SerpSnapshot" (
    "id" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "maxQueries" INTEGER NOT NULL,
    "totalCandidates" INTEGER NOT NULL,
    "resultsJson" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SerpSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SerpSnapshot_site_endDate_key" ON "SerpSnapshot"("site", "endDate");
