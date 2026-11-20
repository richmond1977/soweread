/**
 * 名詞類型的讀者用標籤。
 *
 * 資料庫存的 entityType 是給程式用的代碼（例如 `production-method`），
 * 直接印在頁面上讀者看不懂。這裡把它轉成中文標籤，並附一個英文眉標，
 * 對應主站「英文斜體眉標＋中文標題」的雙語層級。
 *
 * 沒有列在表上的新類型會退回代碼本身，而不是顯示空白：寧可難看，也不要
 * 讓讀者以為這則名詞沒有類型。
 */
const ENTITY_TYPE_LABELS: Record<string, { zh: string; en: string }> = {
  certification: { zh: "驗證標章", en: "Certification" },
  concept: { zh: "概念", en: "Concept" },
  crop: { zh: "作物", en: "Crop" },
  institution: { zh: "機關組織", en: "Institution" },
  "labeling-requirement": { zh: "標示規定", en: "Labelling Rule" },
  "livestock-breed": { zh: "畜禽品種", en: "Breed" },
  "official-guidance": { zh: "官方指引", en: "Official Guidance" },
  "official-standard": { zh: "官方標準", en: "Official Standard" },
  pesticide: { zh: "農藥", en: "Pesticide" },
  "production-method": { zh: "飼養方式", en: "Production Method" },
  "reference-value": { zh: "參考數值", en: "Reference Value" },
  regulation: { zh: "法規", en: "Regulation" },
  "regulation-concept": { zh: "法規概念", en: "Regulatory Concept" },
  statistic: { zh: "統計數據", en: "Statistic" },
  technology: { zh: "技術", en: "Technology" },
};

export function entityTypeLabel(entityType: string): { zh: string; en: string } {
  return ENTITY_TYPE_LABELS[entityType] ?? { zh: entityType, en: "Entry" };
}

/** 別名裡第一個拉丁字母開頭的名稱，用作辭典條目旁的英文對照。 */
export function latinAlias(aliases: string[]): string | null {
  return aliases.find((alias) => /^[A-Za-z]/.test(alias)) ?? null;
}

/**
 * 把名詞敘述拆成「釋義」與其後的段落。
 *
 * 名詞敘述目前存成一整段文字。這裡只做排版上的切分，不改動任何字：
 * 第一句是釋義，其餘句子每兩到三句併成一段，讓長敘述可以掃讀。
 * 句號只在括號與引號外才算斷句，避免把《…。》或「…。」從中切開。
 * 編輯若已在敘述中用空行分段，就尊重原本的分段。
 */
export function splitEntityDescription(description: string): {
  definition: string;
  paragraphs: string[];
} {
  const text = description.trim();
  if (!text) return { definition: "", paragraphs: [] };

  if (text.includes("\n\n")) {
    const blocks = text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
    return { definition: blocks[0], paragraphs: blocks.slice(1) };
  }

  const sentences = splitSentences(text);
  const [definition, ...rest] = sentences;
  const paragraphs: string[] = [];
  let current = "";
  for (const sentence of rest) {
    if (current && (current.length >= 110 || current.length + sentence.length > 220)) {
      paragraphs.push(current);
      current = "";
    }
    current += sentence;
  }
  if (current) paragraphs.push(current);
  return { definition, paragraphs };
}

const OPENERS = new Set(["「", "『", "《", "（", "(", "〈", "【"]);
const CLOSERS = new Set(["」", "』", "》", "）", ")", "〉", "】"]);

function splitSentences(text: string): string[] {
  const sentences: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (OPENERS.has(char)) depth += 1;
    else if (CLOSERS.has(char)) depth = Math.max(0, depth - 1);
    else if (char === "。" && depth === 0) {
      sentences.push(text.slice(start, index + 1));
      start = index + 1;
    }
  }
  if (start < text.length) sentences.push(text.slice(start));
  return sentences.map((sentence) => sentence.trim()).filter(Boolean);
}
