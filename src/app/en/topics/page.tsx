import type { Metadata } from "next";
import { TopicsIndexView, topicsIndexMetadata } from "@/components/growth-pages/index-pages";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return topicsIndexMetadata("en");
}

export default async function TopicsIndexPage() {
  return <TopicsIndexView locale="en" />;
}
