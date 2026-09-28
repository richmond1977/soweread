-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "queriesJson" JSONB NOT NULL,
    "change" TEXT NOT NULL,
    "hypothesis" TEXT NOT NULL,
    "changedAt" TEXT NOT NULL,
    "reviewAfterDays" INTEGER NOT NULL DEFAULT 28,
    "baselineJson" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "decision" TEXT,
    "decidedAt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Experiment_site_status_idx" ON "Experiment"("site", "status");
