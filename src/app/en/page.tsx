import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GrowthHome } from "@/components/growth-home";
import { getLocalizedKnowledge } from "@/lib/growth/knowledge-locale";
import { languageAlternates, OG_LOCALE, UI } from "@/lib/growth/locale";
import { getRequestSiteConfig } from "@/lib/request-site-config";

const DESCRIPTION =
  "So We Read Knowledge: a reference site on Taiwanese food safety, nutrition and food labelling, with definitions, scope and traceable sources for every term.";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getRequestSiteConfig();
  // 英文版只存在於知識站；主站角色與備援角色一律不提供 /en。
  if (!config.isGrowth || !config.canServeGrowthContent) {
    return { robots: { index: false, follow: false } };
  }

  const alternates = languageAlternates(config.canonicalBaseUrl, "en", "/");
  return {
    // absolute：root layout 的 title template 是中文站名，英文首頁不套用。
    title: { absolute: `${UI.en.siteName} | Terms, definitions and sources` },
    description: DESCRIPTION,
    alternates,
    robots: config.metaRobots,
    openGraph: {
      type: "website",
      locale: OG_LOCALE.en,
      url: alternates.canonical,
      siteName: UI.en.siteName,
      title: UI.en.siteName,
      description: DESCRIPTION,
    },
  };
}

export default async function EnglishHomePage() {
  const config = await getRequestSiteConfig();
  if (!config.isGrowth || !config.canServeGrowthContent) notFound();

  const { knowledge } = await getLocalizedKnowledge("en", config);
  return <GrowthHome baseUrl={config.canonicalBaseUrl} knowledge={knowledge} locale="en" />;
}
