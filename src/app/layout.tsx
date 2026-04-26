import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://soweread.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "潤讀 So We Read",
    template: "%s｜潤讀 So We Read",
  },
  description: "以食品安全、營養知識與飲食文化為核心的內容發表平台，讓每一次閱讀都成為理解生活的起點。",
  keywords: ["食品安全", "營養知識", "飲食文化", "健康飲食", "潤讀", "So We Read"],
  authors: [{ name: "潤讀編輯部", url: SITE_URL }],
  creator: "潤讀 So We Read",
  publisher: "潤讀 So We Read",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: SITE_URL,
    types: { "application/rss+xml": `${SITE_URL}/rss.xml` },
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: SITE_URL,
    siteName: "潤讀 So We Read",
    title: "潤讀 So We Read",
    description: "以食品安全、營養知識與飲食文化為核心的內容發表平台，讓每一次閱讀都成為理解生活的起點。",
    images: [{ url: "/assets/soweread-logo.png", width: 1200, height: 630, alt: "潤讀 So We Read" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "潤讀 So We Read",
    description: "以食品安全、營養知識與飲食文化為核心的內容發表平台，讓每一次閱讀都成為理解生活的起點。",
    images: ["/assets/soweread-logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
