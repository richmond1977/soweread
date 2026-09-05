-- CreateTable
CREATE TABLE "CitationBatchJob" (
    "id" TEXT NOT NULL,
    "batchJobId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "queriesJson" JSONB NOT NULL,
    "resultsJson" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CitationBatchJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CitationBatchJob_batchJobId_key" ON "CitationBatchJob"("batchJobId");

-- CreateIndex
CREATE INDEX "CitationBatchJob_status_idx" ON "CitationBatchJob"("status");
