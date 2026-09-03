/**
 * 把 `src/data/growth-content.ts` 的內容 upsert 進 growth 資料庫。
 *
 * 設計原則：
 *
 *  - **Idempotent。** 重跑不會產生重複資料，也不會清空既有內容。所有寫入都是
 *    以 id 為鍵的 upsert；關聯表用「先刪該筆資料的舊關聯、再建新關聯」，
 *    範圍限縮在本檔管到的 id，不會動到其他來源建立的資料。
 *  - **不碰時間戳。** `datePublished` / `dateModified` 一律取自內容檔明確指定
 *    的值，不使用 `new Date()`。重跑 script 不得造成 dateModified 變動——
 *    那會對搜尋引擎謊報內容更新（計畫書 §9.3）。
 *  - **先驗證再寫入。** 引用不到的來源 id、指不到的實體 slug 一律在寫入前
 *    中止，避免資料庫留下半套的引用關係。
 *
 * 用法（DATABASE_URL 必須指向 growth 資料庫）：
 *
 *   DATABASE_URL="<neon pooled url>" node scripts/seed-growth-content.mjs
 *   DATABASE_URL="<neon pooled url>" node scripts/seed-growth-content.mjs --dry-run
 */

import path from "node:path";
import { pathToFileURL } from "node:url";

import { PrismaClient } from "@prisma/client";

const dryRun = process.argv.includes("--dry-run");

/**
 * 內容檔是 TypeScript，而這支 script 以純 Node 執行。
 * 用 Node 內建的型別剝離載入，不引入額外的建置步驟。
 */
async function loadContent() {
  const source = path.resolve("src/data/growth-content.ts");
  const { growthContent } = await import(pathToFileURL(source).href);
  return growthContent;
}

function toDate(value) {
  return value === null || value === undefined ? null : new Date(`${value}T00:00:00.000Z`);
}

/** 寫入前先確認所有引用都解析得到，避免資料庫留下斷掉的關聯。 */
function assertReferentialIntegrity(content) {
  const problems = [];
  const sourceIds = new Set(content.sources.map((item) => item.id));
  const entityBySlug = new Map(content.entities.map((item) => [item.slug, item]));
  const topicBySlug = new Map(content.topics.map((item) => [item.slug, item]));

  for (const entity of content.entities) {
    for (const id of entity.sourceIds) {
      if (!sourceIds.has(id)) problems.push(`實體 ${entity.slug} 引用不存在的來源 ${id}`);
    }
    for (const slug of entity.topicSlugs) {
      if (!topicBySlug.has(slug)) problems.push(`實體 ${entity.slug} 指向不存在的主題 ${slug}`);
    }
  }

  for (const relation of content.relations) {
    if (!entityBySlug.has(relation.subjectSlug)) {
      problems.push(`關係 ${relation.id} 的主體 ${relation.subjectSlug} 不存在`);
    }
    if (!entityBySlug.has(relation.objectSlug)) {
      problems.push(`關係 ${relation.id} 的客體 ${relation.objectSlug} 不存在`);
    }
    if (relation.sourceId !== null && !sourceIds.has(relation.sourceId)) {
      problems.push(`關係 ${relation.id} 引用不存在的來源 ${relation.sourceId}`);
    }
  }

  for (const article of content.articles) {
    if (article.topicSlug !== null && !topicBySlug.has(article.topicSlug)) {
      problems.push(`文章 ${article.slug} 指向不存在的主題 ${article.topicSlug}`);
    }
    for (const slug of article.entitySlugs) {
      if (!entityBySlug.has(slug)) problems.push(`文章 ${article.slug} 指向不存在的實體 ${slug}`);
    }
    for (const id of article.sourceIds) {
      if (!sourceIds.has(id)) problems.push(`文章 ${article.slug} 引用不存在的來源 ${id}`);
    }
  }

  if (problems.length > 0) {
    throw new Error(`內容引用不完整，未寫入任何資料：\n  - ${problems.join("\n  - ")}`);
  }
}

async function main() {
  const content = await loadContent();
  assertReferentialIntegrity(content);

  const counts = {
    sources: content.sources.length,
    topics: content.topics.length,
    entities: content.entities.length,
    relations: content.relations.length,
    articles: content.articles.length,
  };
  console.log("內容檔：", JSON.stringify(counts));

  if (dryRun) {
    console.log("--dry-run：引用完整性檢查通過，未連線資料庫。");
    return;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("缺少 DATABASE_URL，拒絕執行。");
  }

  const prisma = new PrismaClient();
  const entityIdBySlug = new Map(content.entities.map((item) => [item.slug, item.id]));
  const topicIdBySlug = new Map(content.topics.map((item) => [item.slug, item.id]));

  try {
    for (const source of content.sources) {
      const data = {
        title: source.title,
        publisher: source.publisher,
        url: source.url,
        sourceType: source.sourceType,
        publishedAt: toDate(source.publishedAt),
        retrievedAt: toDate(source.retrievedAt),
        note: source.note,
      };
      await prisma.source.upsert({
        where: { id: source.id },
        create: { id: source.id, ...data },
        update: data,
      });
    }
    console.log(`來源      upsert ${counts.sources} 筆`);

    for (const topic of content.topics) {
      const data = {
        slug: topic.slug,
        name: topic.name,
        summary: topic.summary,
        definition: topic.definition,
        keyQuestionsJson: JSON.stringify(topic.keyQuestions),
        publicationStatus: topic.publicationStatus,
        seoTitle: topic.seoTitle,
        seoDescription: topic.seoDescription,
        sortOrder: topic.sortOrder,
        reviewedAt: toDate(topic.reviewedAt),
      };
      await prisma.topic.upsert({
        where: { id: topic.id },
        create: { id: topic.id, ...data },
        update: data,
      });
    }
    console.log(`主題      upsert ${counts.topics} 筆`);

    for (const entity of content.entities) {
      const data = {
        slug: entity.slug,
        entityType: entity.entityType,
        name: entity.name,
        aliasesJson: JSON.stringify(entity.aliases),
        description: entity.description,
        canonicalUrl: entity.canonicalUrl,
        publicationStatus: entity.publicationStatus,
        seoTitle: entity.seoTitle,
        seoDescription: entity.seoDescription,
        reviewedAt: toDate(entity.reviewedAt),
      };
      await prisma.entity.upsert({
        where: { id: entity.id },
        create: { id: entity.id, ...data },
        update: data,
      });

      // 關聯表：只重建這個實體自己的連結，不影響其他資料。
      await prisma.topicEntity.deleteMany({ where: { entityId: entity.id } });
      await prisma.entitySource.deleteMany({ where: { entityId: entity.id } });

      await prisma.topicEntity.createMany({
        data: entity.topicSlugs.map((slug, index) => ({
          topicId: topicIdBySlug.get(slug),
          entityId: entity.id,
          sortOrder: index,
        })),
      });
      await prisma.entitySource.createMany({
        data: entity.sourceIds.map((sourceId, index) => ({
          entityId: entity.id,
          sourceId,
          sortOrder: index,
        })),
      });
    }
    console.log(`實體      upsert ${counts.entities} 筆（含主題與來源關聯）`);

    for (const relation of content.relations) {
      const data = {
        subjectEntityId: entityIdBySlug.get(relation.subjectSlug),
        predicate: relation.predicate,
        objectEntityId: entityIdBySlug.get(relation.objectSlug),
        sourceId: relation.sourceId,
        confidence: relation.confidence,
        note: relation.note,
      };
      await prisma.entityRelation.upsert({
        where: { id: relation.id },
        create: { id: relation.id, ...data },
        update: data,
      });
    }
    console.log(`知識關係  upsert ${counts.relations} 筆`);

    for (const article of content.articles) {
      const data = {
        slug: article.slug,
        title: article.title,
        summary: article.summary,
        content: article.content,
        editorialStatus: article.editorialStatus,
        authorName: article.authorName,
        reviewerName: article.reviewerName,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        primaryCtaUrl: article.primaryCtaUrl,
        primaryCtaLabel: article.primaryCtaLabel,
        // 時間戳一律取自內容檔，重跑不會謊報更新。
        datePublished: toDate(article.datePublished),
        dateModified: toDate(article.dateModified),
        topicId: article.topicSlug === null ? null : topicIdBySlug.get(article.topicSlug),
      };
      await prisma.growthArticle.upsert({
        where: { id: article.id },
        create: { id: article.id, ...data },
        update: data,
      });

      await prisma.articleEntity.deleteMany({ where: { articleId: article.id } });
      await prisma.articleSource.deleteMany({ where: { articleId: article.id } });

      await prisma.articleEntity.createMany({
        data: article.entitySlugs.map((slug) => ({
          articleId: article.id,
          entityId: entityIdBySlug.get(slug),
        })),
      });
      await prisma.articleSource.createMany({
        data: article.sourceIds.map((sourceId, index) => ({
          articleId: article.id,
          sourceId,
          sortOrder: index,
        })),
      });
    }
    console.log(`文章      upsert ${counts.articles} 筆（含實體與來源關聯）`);

    const [topics, entities, articles] = await Promise.all([
      prisma.topic.count({ where: { publicationStatus: "published" } }),
      prisma.entity.count({ where: { publicationStatus: "published" } }),
      prisma.growthArticle.count({ where: { editorialStatus: "published" } }),
    ]);
    console.log(`\n資料庫現況：公開主題 ${topics}、公開實體 ${entities}、公開文章 ${articles}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

