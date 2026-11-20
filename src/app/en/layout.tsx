import type { Metadata } from "next";
import { OG_LOCALE, UI } from "@/lib/growth/locale";

// 英文版的標題樣板與站名。root layout 的樣板是中文站名「%s｜潤讀知識站」，
// 英文頁面在這一層換成英文，不需要另外一個 root layout。
export const metadata: Metadata = {
  title: { default: UI.en.siteName, template: `%s | ${UI.en.siteName}` },
  description:
    "A reference site on Taiwanese food safety, nutrition and food labelling: topic hubs, a glossary of terms and traceable sources.",
  openGraph: { siteName: UI.en.siteName, locale: OG_LOCALE.en },
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return children;
}
