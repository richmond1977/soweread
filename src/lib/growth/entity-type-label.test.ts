import test from "node:test";
import assert from "node:assert/strict";
import { entityTypeLabel, latinAlias, splitEntityDescription } from "./entity-type-label.ts";

test("known entity types map to reader labels; unknown ones fall back to the code", () => {
  assert.deepEqual(entityTypeLabel("production-method"), { zh: "飼養方式", en: "Production Method" });
  assert.deepEqual(entityTypeLabel("brand-new-type"), { zh: "brand-new-type", en: "Entry" });
});

test("latinAlias picks the first alias that starts with a Latin letter", () => {
  assert.equal(latinAlias(["豐富籠", "Enriched Cage", "豐富化籠"]), "Enriched Cage");
  assert.equal(latinAlias(["土雞", "紅羽土雞"]), null);
});

test("the first sentence becomes the definition and no characters are lost", () => {
  const description =
    "豐富化籠飼是《指南。附件》所定義的系統之一。籠內每隻雞活動面積應達 750 平方公分以上。指南提到「這是一句。」的說法。";
  const { definition, paragraphs } = splitEntityDescription(description);
  assert.equal(definition, "豐富化籠飼是《指南。附件》所定義的系統之一。");
  assert.equal(definition + paragraphs.join(""), description);
});

test("long remainders are grouped into several paragraphs", () => {
  const sentence = "這是一句大約四十個字的測試句子，用來確認長段落會被切成多段而不是一整段文字。";
  const description = `定義句。${sentence.repeat(8)}`;
  const { paragraphs } = splitEntityDescription(description);
  assert.ok(paragraphs.length > 1);
  assert.equal(paragraphs.join(""), sentence.repeat(8));
});

test("editor paragraph breaks are respected", () => {
  assert.deepEqual(splitEntityDescription("第一段。\n\n第二段。"), {
    definition: "第一段。",
    paragraphs: ["第二段。"],
  });
});

test("English descriptions split on sentence ends but not on abbreviations or inside parentheses", () => {
  const description =
    "An enriched cage is one of three systems (see Art. 2. of the guidelines). Each hen needs at least 750 cm². No. 2 applies, e.g. to colony cages. Critics disagree.";
  const { definition, paragraphs } = splitEntityDescription(description);
  assert.equal(definition, "An enriched cage is one of three systems (see Art. 2. of the guidelines).");
  assert.equal([definition, ...paragraphs].join(" "), description);
});
