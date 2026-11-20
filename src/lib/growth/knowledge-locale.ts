import "server-only";

import { growthContentEn } from "@/data/growth-content-en";
import type { SiteConfig } from "@/lib/site-config";
import { getGrowthKnowledge } from "./knowledge";
import type { GrowthLocale } from "./locale";
import { localizeKnowledge } from "./localize";

/** getGrowthKnowledge 的語系版本：同一套 fail-closed 閘門，再換成指定語系的內容。 */
export async function getLocalizedKnowledge(locale: GrowthLocale, config?: SiteConfig) {
  const result = await getGrowthKnowledge(config);
  return { ...result, knowledge: localizeKnowledge(result.knowledge, locale, growthContentEn) };
}

export { growthContentEn };
