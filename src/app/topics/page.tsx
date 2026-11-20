import type { Metadata } from "next";
import { TopicsIndexView, topicsIndexMetadata } from "@/components/growth-pages/index-pages";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return topicsIndexMetadata("zh");
}

export default async function TopicsIndexPage() {
  return <TopicsIndexView locale="zh" />;
}
