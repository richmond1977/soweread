import { getGrowthKnowledge } from "@/lib/growth/knowledge";
import { publishedArticles, publishedTopics } from "@/lib/growth/knowledge-core";

export const dynamic = "force-dynamic";

/**
 * llms.txt for the growth knowledge site only.
 *
 * The primary site (soweread.com) is editorial/narrative content, not a
 * structured knowledge base, and is out of scope here — it gets nothing,
 * exactly as it does today (no llms.txt existed for either site before this
 * route).
 */
export async function GET() {
  const { config, knowledge } = await getGrowthKnowledge();
  if (!config.isGrowth || !config.canServeGrowthContent) {
    return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex, follow" } });
  }

  const baseUrl = config.canonicalBaseUrl;
  const topics = publishedTopics(knowledge);
  const articles = publishedArticles(knowledge).slice(0, 50);

  const topicLines = topics
    .map((topic) => `- [${topic.name}](${baseUrl}/topics/${topic.slug}): ${topic.summary}`)
    .join("\n");
  const articleLines = articles
    .map((article) => `- [${article.title}](${baseUrl}/articles/${article.slug}): ${article.summary}`)
    .join("\n");

  const body = `# 潤讀知識站 So We Read Knowledge

Structured knowledge base for food safety, nutrition science, food labeling
and agriculture in Taiwan. Pages distinguish definitions, regulatory
standards, factual claims, and contested issues. Primary sources are cited
on every entity and article page.

## Topics
${topicLines || "(none published)"}

## Entity index
${baseUrl}/entities

## Articles
${articleLines || "(none published)"}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
