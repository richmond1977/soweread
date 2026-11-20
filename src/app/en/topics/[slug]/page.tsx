import type { Metadata } from "next";
import { TopicPageView, topicMetadata, topicStaticParams } from "@/components/growth-pages/topic-page";

// 英文版主題頁：與中文版共用同一個元件；ISR 策略同 src/app/topics/[slug]/page.tsx。
export const revalidate = 3600;
export async function generateStaticParams() {
  return topicStaticParams("en");
}

type TopicPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  return topicMetadata("en", slug);
}

export default async function TopicHubPage({ params }: TopicPageProps) {
  const { slug } = await params;
  return <TopicPageView locale="en" slug={slug} />;
}
