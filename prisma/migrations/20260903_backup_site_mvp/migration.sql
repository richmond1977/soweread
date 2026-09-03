ALTER TABLE "Post"
  ADD COLUMN "sourceType" TEXT NOT NULL DEFAULT 'native',
  ADD COLUMN "externalSourceId" TEXT,
  ADD COLUMN "sourceCanonicalUrl" TEXT,
  ADD COLUMN "sourceModifiedAt" TIMESTAMP(3),
  ADD COLUMN "sourceHash" TEXT,
  ADD COLUMN "lastSyncedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Post_externalSourceId_key" ON "Post"("externalSourceId");
CREATE INDEX "Post_sourceType_status_idx" ON "Post"("sourceType", "status");

CREATE TABLE "SyncState" (
  "key" TEXT NOT NULL,
  "lastAttemptAt" TIMESTAMP(3),
  "lastSuccessAt" TIMESTAMP(3),
  "lastError" TEXT,
  "lastSuccessSummary" TEXT,
  "syncedItemCount" INTEGER NOT NULL DEFAULT 0,
  "lastDurationMs" INTEGER,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SyncState_pkey" PRIMARY KEY ("key")
);
