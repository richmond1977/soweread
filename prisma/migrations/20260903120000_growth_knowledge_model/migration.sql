-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "definition" TEXT NOT NULL DEFAULT '',
    "keyQuestionsJson" TEXT NOT NULL DEFAULT '[]',
    "publicationStatus" TEXT NOT NULL DEFAULT 'draft',
    "seoTitle" TEXT NOT NULL DEFAULT '',
    "seoDescription" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliasesJson" TEXT NOT NULL DEFAULT '[]',
    "description" TEXT NOT NULL,
    "canonicalUrl" TEXT,
    "publicationStatus" TEXT NOT NULL DEFAULT 'draft',
    "seoTitle" TEXT NOT NULL DEFAULT '',
    "seoDescription" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityRelation" (
    "id" TEXT NOT NULL,
    "subjectEntityId" TEXT NOT NULL,
    "predicate" TEXT NOT NULL,
    "objectEntityId" TEXT NOT NULL,
    "sourceId" TEXT,
    "confidence" TEXT NOT NULL DEFAULT 'reported',
    "note" TEXT NOT NULL DEFAULT '',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntityRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'web',
    "publishedAt" TIMESTAMP(3),
    "retrievedAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "editorialStatus" TEXT NOT NULL DEFAULT 'draft',
    "authorName" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL DEFAULT '',
    "seoTitle" TEXT NOT NULL DEFAULT '',
    "seoDescription" TEXT NOT NULL DEFAULT '',
    "primaryCtaUrl" TEXT,
    "primaryCtaLabel" TEXT NOT NULL DEFAULT '',
    "datePublished" TIMESTAMP(3),
    "dateModified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "topicId" TEXT,

    CONSTRAINT "GrowthArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicEntity" (
    "topicId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TopicEntity_pkey" PRIMARY KEY ("topicId","entityId")
);

-- CreateTable
CREATE TABLE "ArticleEntity" (
    "articleId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'mentions',

    CONSTRAINT "ArticleEntity_pkey" PRIMARY KEY ("articleId","entityId")
);

-- CreateTable
CREATE TABLE "ArticleSource" (
    "articleId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ArticleSource_pkey" PRIMARY KEY ("articleId","sourceId")
);

-- CreateTable
CREATE TABLE "EntitySource" (
    "entityId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EntitySource_pkey" PRIMARY KEY ("entityId","sourceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "Topic_publicationStatus_sortOrder_idx" ON "Topic"("publicationStatus", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_slug_key" ON "Entity"("slug");

-- CreateIndex
CREATE INDEX "Entity_publicationStatus_entityType_idx" ON "Entity"("publicationStatus", "entityType");

-- CreateIndex
CREATE INDEX "EntityRelation_objectEntityId_idx" ON "EntityRelation"("objectEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "EntityRelation_subjectEntityId_predicate_objectEntityId_key" ON "EntityRelation"("subjectEntityId", "predicate", "objectEntityId");

-- CreateIndex
CREATE INDEX "Source_publisher_idx" ON "Source"("publisher");

-- CreateIndex
CREATE UNIQUE INDEX "GrowthArticle_slug_key" ON "GrowthArticle"("slug");

-- CreateIndex
CREATE INDEX "GrowthArticle_editorialStatus_datePublished_idx" ON "GrowthArticle"("editorialStatus", "datePublished");

-- CreateIndex
CREATE INDEX "TopicEntity_entityId_idx" ON "TopicEntity"("entityId");

-- CreateIndex
CREATE INDEX "ArticleEntity_entityId_idx" ON "ArticleEntity"("entityId");

-- CreateIndex
CREATE INDEX "ArticleSource_sourceId_idx" ON "ArticleSource"("sourceId");

-- CreateIndex
CREATE INDEX "EntitySource_sourceId_idx" ON "EntitySource"("sourceId");

-- AddForeignKey
ALTER TABLE "EntityRelation" ADD CONSTRAINT "EntityRelation_subjectEntityId_fkey" FOREIGN KEY ("subjectEntityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityRelation" ADD CONSTRAINT "EntityRelation_objectEntityId_fkey" FOREIGN KEY ("objectEntityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityRelation" ADD CONSTRAINT "EntityRelation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthArticle" ADD CONSTRAINT "GrowthArticle_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicEntity" ADD CONSTRAINT "TopicEntity_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicEntity" ADD CONSTRAINT "TopicEntity_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleEntity" ADD CONSTRAINT "ArticleEntity_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "GrowthArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleEntity" ADD CONSTRAINT "ArticleEntity_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleSource" ADD CONSTRAINT "ArticleSource_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "GrowthArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleSource" ADD CONSTRAINT "ArticleSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitySource" ADD CONSTRAINT "EntitySource_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitySource" ADD CONSTRAINT "EntitySource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

