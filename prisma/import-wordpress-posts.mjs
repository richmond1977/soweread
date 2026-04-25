import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const sourcePath = new URL("./wordpress-posts.json", import.meta.url);

const wpPosts = JSON.parse(await readFile(sourcePath, "utf8"))
  .filter((post) => !/^post-\d+$/.test(post.slug))
  .sort((a, b) => new Date(b.date) - new Date(a.date));

const author = {
  id: "author-editorial",
  name: "潤讀編輯",
  email: "editor@soweread.com",
  role: "admin",
  bio: "以食品安全、營養知識與飲食文化為核心，整理值得慢讀也能落地生活的內容。",
};

const category = {
  id: "food-health",
  name: "食品與健康",
  slug: "food-health",
  description: "食品安全、營養知識、外食文化與日常飲食選擇。",
  sortOrder: 1,
};

await prisma.post.deleteMany();
await prisma.category.deleteMany();

await prisma.author.upsert({
  where: { id: author.id },
  update: author,
  create: author,
});

await prisma.category.create({ data: category });

for (const [index, post] of wpPosts.entries()) {
  const title = cleanText(post.title?.rendered ?? "");
  const content = wpHtmlToMarkdown(post.content?.rendered ?? "");
  const plain = cleanText(post.content?.rendered ?? "");
  const excerpt = buildExcerpt(post.excerpt?.rendered, plain);
  const coverImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? firstMarkdownImage(content);
  const tags = extractTags(plain);
  const readingMinutes = Math.max(3, Math.ceil(plain.length / 520));
  const publishedAt = new Date(post.date);

  await prisma.post.create({
    data: {
      id: `wp-${post.id}`,
      title,
      slug: `wp-${post.id}`,
      excerpt,
      coverImage,
      categoryId: category.id,
      authorId: author.id,
      status: "published",
      publishedAt,
      readingMinutes,
      views: 1600 - index * 83,
      comments: 0,
      featured: index < 3,
      tagsJson: JSON.stringify(tags),
      content,
      seoTitle: title,
      seoDescription: excerpt,
    },
  });
}

console.log(`Imported ${wpPosts.length} WordPress posts.`);
await prisma.$disconnect();

function wpHtmlToMarkdown(html) {
  return html
    .replace(/<figure[\s\S]*?<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>[\s\S]*?<\/figure>/gi, (_, src, alt) => {
      return `\n\n![${decodeHtml(alt)}](${decodeHtml(src)})\n\n`;
    })
    .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (_, text) => `\n\n### ${cleanText(text)}\n\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, text) => `\n- ${cleanText(text)}`)
    .replace(/<\/ul>|<\/ol>/gi, "\n\n")
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, text) => `\n\n> ${cleanText(text)}\n\n`)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, text) => `\n\n${cleanText(text)}\n\n`)
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildExcerpt(excerptHtml, fallback) {
  const excerpt = cleanText(excerptHtml ?? "").replace(/\s*\[…]\s*$/, "");
  if (excerpt && !excerpt.includes("Engaging Introductio")) return excerpt.slice(0, 160);
  return fallback.slice(0, 160);
}

function extractTags(text) {
  const tags = new Set();
  for (const match of text.matchAll(/#([^\s#]+)/g)) {
    tags.add(match[1].replace(/[，。、,.]+$/g, ""));
  }
  return [...tags].slice(0, 12);
}

function firstMarkdownImage(content) {
  const match = content.match(/!\[.*?]\((.*?)\)/);
  return match?.[1] ?? null;
}

function cleanText(value) {
  return decodeHtml(value)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value) {
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}
