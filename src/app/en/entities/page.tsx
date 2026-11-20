import type { Metadata } from "next";
import { GlossaryView, glossaryMetadata } from "@/components/growth-pages/index-pages";

// 英文版名詞索引；渲染策略同 src/app/entities/page.tsx。
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return glossaryMetadata("en");
}

export default async function EntitiesIndexPage() {
  return <GlossaryView locale="en" />;
}
