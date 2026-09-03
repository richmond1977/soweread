import type { Metadata } from "next";
import { WebSiteJsonLd } from "@/components/json-ld";
import { getRequestSiteConfig } from "@/lib/request-site-config";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getRequestSiteConfig();

  if (config.isGrowth) {
    // The growth site is its own publication with its own domain. It must
    // self-canonicalise, otherwise it can never rank for its own pages.
    return {
      metadataBase: new URL(config.canonicalBaseUrl),
      title: {
        default: "潤讀知識站",
        template: "%s｜潤讀知識站",
      },
      description:
        "以食品安全、營養科學與飲食標示為核心的知識整理站：主題中心、實體頁與可追溯的來源。",
      robots: config.metaRobots,
      // A `*.vercel.app` growth host cannot use a DNS-verified Search Console
      // domain property, so verification goes through a meta tag instead.
      ...(process.env.GROWTH_SITE_VERIFICATION?.trim()
        ? { verification: { google: process.env.GROWTH_SITE_VERIFICATION.trim() } }
        : {}),
      alternates: { canonical: config.canonicalBaseUrl },
      openGraph: {
        type: "website",
        locale: "zh_TW",
        url: config.canonicalBaseUrl,
        siteName: "潤讀知識站",
        title: "潤讀知識站",
        description:
          "以食品安全、營養科學與飲食標示為核心的知識整理站：主題中心、實體頁與可追溯的來源。",
      },
    };
  }

  const siteUrl = config.primarySiteUrl;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "潤讀 So We Read",
      template: "%s｜潤讀 So We Read",
    },
    description:
      "以食品安全、營養知識與飲食文化為核心的內容發表平台，讓每一次閱讀都成為理解生活的起點。",
    keywords: ["食品安全", "營養知識", "飲食文化", "健康飲食", "潤讀", "So We Read"],
    authors: [{ name: "潤讀編輯部", url: siteUrl }],
    creator: "潤讀 So We Read",
    publisher: "潤讀 So We Read",
    robots: config.metaRobots,
    alternates: {
      canonical: siteUrl,
      types: { "application/rss+xml": `${siteUrl}/rss.xml` },
    },
    openGraph: {
      type: "website",
      locale: "zh_TW",
      url: siteUrl,
      siteName: "潤讀 So We Read",
      title: "潤讀 So We Read",
      description:
        "以食品安全、營養知識與飲食文化為核心的內容發表平台，讓每一次閱讀都成為理解生活的起點。",
      images: [{ url: "/assets/soweread-logo.png", width: 1200, height: 630, alt: "潤讀 So We Read" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "潤讀 So We Read",
      description:
        "以食品安全、營養知識與飲食文化為核心的內容發表平台，讓每一次閱讀都成為理解生活的起點。",
      images: ["/assets/soweread-logo.png"],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getRequestSiteConfig();

  return (
    <html lang="zh-Hant">
      <body>
        {/* The growth pages emit their own Organization/WebSite graph, so the
            soweread.com graph must not be asserted on the growth domain. */}
        {config.isGrowth ? null : <WebSiteJsonLd />}
        {children}
      </body>
    </html>
  );
}
