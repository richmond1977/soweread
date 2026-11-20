import type { Metadata } from "next";
import {
  EntityPageView,
  entityMetadata,
  entityStaticParams,
} from "@/components/growth-pages/entity-page";

// 英文版名詞頁：與中文版共用同一個元件，只差語系；ISR 策略同 src/app/entities/[slug]/page.tsx。
export const revalidate = 3600;
export async function generateStaticParams() {
  return entityStaticParams("en");
}

type EntityPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: EntityPageProps): Promise<Metadata> {
  const { slug } = await params;
  return entityMetadata("en", slug);
}

export default async function EntityPage({ params }: EntityPageProps) {
  const { slug } = await params;
  return <EntityPageView locale="en" slug={slug} />;
}
