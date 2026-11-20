import type { Metadata } from "next";
import { GlossaryView, glossaryMetadata } from "@/components/growth-pages/index-pages";

// Same rendering strategy as the other growth index routes: this page is a
// full listing of everything published, so it must not be baked at build time
// from whatever the database happened to hold then.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return glossaryMetadata("zh");
}

export default async function EntitiesIndexPage() {
  return <GlossaryView locale="zh" />;
}
