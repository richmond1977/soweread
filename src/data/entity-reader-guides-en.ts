/**
 * 讀者指南的英文版（code-owned，管理方式同 growth-content-en.ts）。
 * 以 slug 對應 entity-reader-guides.ts 的中文指南；中文是正本，英文以中文為準。
 * zhDigest 是翻譯當時中文指南的摘要，中文改了而英文沒跟上時測試會失敗。
 * 連結一律指向英文版已存在的頁面（/en/...）；中文才有的文章不放進英文連結。
 */
import type { ReaderGuide } from "./entity-reader-guides";

export type EnglishReaderGuide = ReaderGuide & { zhDigest: string };
export type EnglishGuideSource = { title: string; publisher: string; version: string };

export const readerGuideSourcesEn: Record<string, EnglishGuideSource> = {
  "nutrition-format": {
    title: "Q&A on Nutrition Labelling for Packaged Food: Q5.2, PDF pp. 8–9",
    publisher: "Ministry of Health and Welfare",
    version: "Revised 2022-06-23",
  },
  "allergen-reading": {
    title: "Q&A on Food Allergen Labelling Rules: Q4 and Q7, PDF pp. 1–2",
    publisher: "Ministry of Health and Welfare",
    version: "Revised 2018-09-21",
  },
  "egg-systems": {
    title: "Definitions and Guidelines for Friendly Egg Production Systems: points 1–4, PDF pp. 1–3",
    publisher: "Ministry of Agriculture Regulations System",
    version: "Amended 2022-05-23",
  },
  "pesticide-mrl-std": {
    title: "Standards for Pesticide Residue Limits in Foods (Laws & Regulations Database)",
    publisher: "Ministry of Justice",
    version: "Amended 2026-04-21",
  },
  "pesticide-survey-data": {
    title: "Pesticide residue survey of fruit and vegetables on the market (dataset)",
    publisher: "Taiwan Food and Drug Administration (Government Open Data Platform)",
    version: "Page states last updated 2026-07-02",
  },
  "who-amr-2017": {
    title: "WHO guidelines on use of medically important antimicrobials in food-producing animals",
    publisher: "World Health Organization",
    version: "2017-11-07",
  },
  "amr-plan-2025": {
    title: "Launch of the national One Health action plan on antimicrobial resistance (2025)",
    publisher: "Ministry of Health and Welfare",
    version: "2025-01-01",
  },
  "woah-one-health": {
    title: "One Health (OHHLEP definition)",
    publisher: "World Organisation for Animal Health (WOAH)",
    version: "No update date stated",
  },
  "organic-act": {
    title: "Organic Agriculture Promotion Act: Article 3(6), Article 20(1), Article 29(1)",
    publisher: "Laws & Regulations Database (Ministry of Justice)",
    version: "Promulgated 2018-05-30, in force 2019-05-31",
  },
  "tfda-gmo-items": {
    title: "Genetically modified food items on the market in Taiwan (GM food section)",
    publisher: "Taiwan Food and Drug Administration",
    version: "Page states last updated 2025-05-05",
  },
  "tfda-gmo-registry": {
    title: "Search of permits for inspection and registration of genetically modified food ingredients",
    publisher: "Taiwan Food and Drug Administration (Food and Drug Consumer Section)",
    version: "Dynamic search interface; no update date stated",
  },
};

export const entityReaderGuidesEn: Record<string, EnglishReaderGuide> = {
  "nutrition-facts-label": {
    slug: "nutrition-facts-label",
    typeLabel: "Food labelling",
    title: "Comparing nutrition labels: check the unit first, then work out what you actually ate",
    introduction:
      "“One serving” is not necessarily the same size on two packs. Check the columns and the serving weight first, then convert both products to the same basis, so that a difference in serving size is not mistaken for a difference in nutrient content. This guide uses sodium as the worked example for reading the numbers and converting them.",
    sections: [
      {
        id: "read-format",
        title: "Step 1: Is the second column an amount or a percentage?",
        paragraphs: [
          "Question 5.2 of the Ministry of Health and Welfare Q&A gives two example formats for ordinary packaged food: one shows “per serving + per 100 g (or ml)”; the other shows “per serving + percentage of daily reference value”. Not every food has to show both per serving and per 100 g. The Q&A also sets separate format requirements for certain foods; this page does not assess whether any individual product complies.",
          "A “percentage of daily reference value” is a share of a reference value. It is not the amount per 100 g, and it is not a dietary target set for you personally. Read the column heading before comparing; to convert the figures yourself you also need the weight or volume of one serving printed on the pack.",
        ],
        steps: [
          "Find the “serving size” and the “servings per package”.",
          "Check whether the second column is per 100 g/ml or a percentage of the daily reference value.",
          "Compare the two products on the same weight or the same volume; do not mix grams and millilitres directly.",
        ],
        sourceIds: ["nutrition-format"],
      },
      {
        id: "compare-same-weight",
        title: "Step 2: Convert both foods to the same weight",
        paragraphs: [
          "The figures below are hypothetical teaching numbers written by So We Read. They are not product test results, and they are not a complete statutory nutrition label. Food A: 30 g per serving, 120 mg sodium. Food B: 50 g per serving, 150 mg sodium. Looking only at “per serving”, A seems to have less, but the two servings weigh different amounts.",
          "The formula: sodium per 100 g = sodium per serving ÷ grams per serving × 100. For A that is 120 ÷ 30 × 100 = 400 mg; for B, 150 ÷ 50 × 100 = 300 mg. At the same weight, in this set of hypothetical figures, B has less sodium.",
        ],
        table: {
          caption: "Hypothetical teaching comparison: read sodium after converting to the same weight (not a complete nutrition label)",
          columns: ["Hypothetical food", "Serving weight", "Sodium per serving", "Sodium per 100 g", "Sodium in 60 g eaten"],
          rows: [
            ["Hypothetical food A", "30 g", "120 mg", "400 mg", "240 mg"],
            ["Hypothetical food B", "50 g", "150 mg", "300 mg", "180 mg"],
          ],
        },
        sourceIds: [],
      },
      {
        id: "actual-portion",
        title: "Step 3: Then work out how much you actually ate",
        paragraphs: [
          "Sodium actually eaten = sodium per serving × (weight eaten ÷ serving weight). If you eat 60 g of each: for A that is 2 servings, or 240 mg of sodium; for B it is 1.2 servings, or 180 mg. You do not need to eat exactly one whole serving to do the conversion.",
          "Comparing at the same weight helps you understand how the foods differ; the portion you actually ate tells you this occasion’s intake. A whole pack may hold several servings, so do not read the per-serving figure as the figure for the whole pack. Less sodium does not make a food healthier overall: a single-nutrient comparison says nothing about the rest of your diet, other ingredients or your own needs.",
        ],
        sourceIds: [],
      },
    ],
    questions: [
      {
        question: "If the second column only shows percentages, can I still compare?",
        answer:
          "Yes: use the amount per serving and the serving weight to convert to the same weight. If the serving is given only as a number of pieces with no usable weight, do not guess how many grams a piece weighs; get enough information first, then compare by weight.",
      },
      {
        question: "Can this table tell me which food is healthier?",
        answer:
          "No. It only demonstrates converting sodium content to the same weight and to the portion actually eaten. It does not rank products by healthiness.",
      },
    ],
    links: [
      { href: "/en/entities/allergen-labeling", label: "Read next: where to find allergen information" },
      { href: "/en/entities/sodium-intake-reference", label: "Related: the sodium intake reference" },
      { href: "/en/topics/food-labeling", label: "Back to Food Labelling & Consumer Choice" },
    ],
    zhDigest: "c6539a1c",
  },
  "allergen-labeling": {
    slug: "allergen-labeling",
    typeLabel: "Food labelling",
    title: "Where is the allergen information? Read the product name, ingredients and warning statement together",
    introduction:
      "Do not just look for a single “allergens” box on the pack. The product name, the ingredient list and the warning statement each carry information, and only by reading them against each other can you see what still needs checking. This page shows you where to look; it does not decide whether a particular food is safe for you to eat.",
    sections: [
      {
        id: "three-places",
        title: "Step 1: Read three places, in order",
        paragraphs: [
          "Under Questions 4 and 7 of the Ministry of Health and Welfare Q&A, allergen information can be given in a prominent warning statement, or by naming every allergenic ingredient in the product name. Listing an allergen only in the ingredient list does not by itself meet either of those methods. Equally, the absence of a separate warning statement cannot be read as meaning the food contains no allergens.",
        ],
        steps: [
          "Read the product name first: which ingredients does it name? Is it just a flavour or a marketing name?",
          "Then read the full ingredient list: find the ingredients you need to avoid or check, not just the large print on the front.",
          "Finally, look for “This product contains…” or a statement with the same meaning, and check it against the first two. Where the information is unclear, write the question down and ask the manufacturer.",
        ],
        sourceIds: ["allergen-reading"],
      },
      {
        id: "practice-reading",
        title: "Reading practice: two extra words in the name can change the information",
        paragraphs: [
          "The table below is an original, hypothetical reading exercise that shows only part of the text for practice. It is not a real product, a complete label or a compliance template. Assume both foods use peanuts and milk as ingredients; practise finding what the text tells you, and do not decide from this fragment whether you can eat it.",
        ],
        table: {
          caption: "Hypothetical pack fragments: treat the gaps in the information as questions to check",
          columns: ["Where to read", "Hypothetical A", "Hypothetical B", "What the reader should notice"],
          rows: [
            ["Product name", "Peanut milk ice", "Peanut ice", "A’s name mentions peanut and milk; B’s mentions only peanut."],
            ["Ingredient fragment", "…peanuts, milk…", "…peanuts, milk…", "Both fragments mention milk, so the product name alone is not enough."],
            ["Warning statement check", "Still read the whole pack", "Look for a separate statement that it contains peanut and milk", "Not seeing a separate warning statement does not mean there are no allergens; a fragment is not enough to judge safety or compliance."],
          ],
        },
        sourceIds: ["allergen-reading"],
      },
      {
        id: "information-gap",
        title: "When the information is unclear, write down a specific question first",
        paragraphs: [
          "Note the product’s full name, the ingredients you need to confirm, and any wording where the product name and the ingredient list disagree or are hard to follow, then ask the manufacturer. That is more likely to get you a concrete answer than simply asking “Is this safe?”.",
          "This guide does not list every statutory item, exception or possible allergenic ingredient, and it does not assess cross-contact during manufacturing. “I didn’t see a label” is no guarantee that a food is safe for you. If you have an allergy, decide based on your own medical advice and on product information you can verify.",
        ],
        sourceIds: [],
      },
    ],
    questions: [
      {
        question: "Is it enough for the allergen to appear in the ingredient list?",
        answer:
          "Under Question 4 of the cited Q&A, setting out the ingredients in the ingredient list alone does not replace the required warning statement or naming the allergens in the product name. This page does not replace a compliance review of any individual label.",
      },
      {
        question: "If the product name says peanut, can I assume there is no milk?",
        answer:
          "No. The product name may not give the full ingredient information; you still need to read the ingredient list and the warning statement, and check further if in doubt.",
      },
    ],
    links: [
      { href: "/en/entities/nutrition-facts-label", label: "Read next: how to convert nutrition label servings" },
      { href: "/en/entities/prepared-beverage-labeling", label: "Related: labelling of freshly made drinks" },
      { href: "/en/topics/food-labeling", label: "Back to Food Labelling & Consumer Choice" },
    ],
    zhDigest: "b3940702",
  },
  "egg-friendly-production-system": {
    slug: "egg-friendly-production-system",
    typeLabel: "Husbandry system",
    title: "Barn, free-range or enriched cage? Three questions to ask before you buy eggs",
    introduction:
      "When a pack says “friendly”, look for the specific housing system first, then check whether the information can be traced back to the farm. A housing system describes the hens’ living environment; it is not proof of the eggs’ nutrition or of how drugs were used.",
    sections: [
      {
        id: "three-systems",
        title: "First, tell apart the three systems in the guidelines",
        paragraphs: [
          "The cited Definitions and Guidelines for Friendly Egg Production Systems divide the systems into three: free-range, barn and enriched cage. Conventional battery cages are not one of the three categories in these guidelines. An enriched cage is still a cage, and it cannot be equated with a cage-free system.",
        ],
        table: {
          caption: "So We Read reading comparison: a summary of differences in the hens’ environment, not a full facility checklist",
          columns: ["System", "Outdoor access", "Key points on space and facilities", "What to ask when buying"],
          rows: [
            ["Free-range", "Indoor and outdoor ground space where hens can move freely", "Requirements for a henhouse, perches and outdoor shelter", "Can you find the source farm and information about its outdoor area?"],
            ["Barn", "This definition has no requirement for an outdoor area", "Hens move inside the henhouse, which has perches, nest boxes and litter", "Does the information clearly describe the henhouse and the source?"],
            ["Enriched cage", "This definition has no requirement for an outdoor area", "Cages fitted with perches, nest boxes and facilities that support natural behaviour", "Is it clearly labelled as an enriched cage, rather than just “friendly”?"],
          ],
        },
        sourceIds: ["egg-systems"],
      },
      {
        id: "check-the-claim",
        title: "Turn the adjectives on the pack into questions you can check",
        paragraphs: [
          "Point 1 of the guidelines requires farms to keep records of their husbandry management, with a traceability function, to show that they meet the system they label. As a reader, start by checking whether there is a specific system name, a source and a way to look it up. A photo of a farm or the word “friendly” cannot on its own prove full compliance with the guidelines.",
        ],
        steps: [
          "Ask about the system: is it free-range, barn or enriched cage?",
          "Ask about the source: can you find traceability information on the farm, the batch or the producer?",
          "Ask about the basis: what management records or audit information can be checked to support the claim? If the information is missing, treat it as unknown.",
        ],
        sourceIds: ["egg-systems"],
      },
      {
        id: "buying-example",
        title: "A hypothetical shopping scenario: both boxes say “friendly”, so what next?",
        paragraphs: [
          "Suppose box A says only “friendly eggs” on the front, while box B says “barn” and offers a way to look up the source. All you can say at this point is that B gives more specific information that you can keep checking. You cannot yet declare that B has passed an audit, that A breaks the rules, or that one box is safer. This is an original teaching scenario, not a product review.",
          "Next, check whether B’s lookup result actually matches this box of eggs, and ask A’s producer which system it really uses. If outdoor access matters to you, look for a free-range system and the evidence for it; barn is not the same as free-range.",
          "None of the three systems by itself tells you that eggs are “drug-free”, have “zero residues” or are “more nutritious”. The guidelines set separate general compliance requirements for disease prevention, feed and treatment; the name of a housing system cannot answer questions about a particular batch’s test results or nutritional comparisons.",
        ],
        sourceIds: ["egg-systems"],
      },
    ],
    questions: [
      {
        question: "Do barn hens always go outdoors?",
        answer:
          "You cannot infer that from the word “barn”. The cited guidelines spell out indoor and outdoor space for free-range systems; the facility requirements for barn systems are mainly inside the henhouse.",
      },
      {
        question: "Is an enriched cage the same as a conventional battery cage?",
        answer:
          "The two terms should not be used interchangeably. An enriched cage is one of the three categories in the guidelines and has extra requirements such as perches and nest boxes, but it is still a cage system.",
      },
    ],
    links: [
      { href: "/en/entities/enriched-cage", label: "In depth: space rules for enriched cages and the animal welfare debate" },
      { href: "/en/entities/egg-shell-code-label", label: "Related: what the code printed on the eggshell tells you" },
      { href: "/en/entities/tap-traceability", label: "About TAP traceability information" },
      { href: "/en/topics/food-production", label: "Back to Food Production & Animal Husbandry" },
    ],
    zhDigest: "940050b1",
  },
  "pesticide-residue-limit": {
    slug: "pesticide-residue-limit",
    typeLabel: "Regulatory standard",
    title: "No residue limit listed for this pesticide? Start by understanding how the annex tables are organised",
    introduction:
      "The Standards for Pesticide Residue Limits in Foods are not one table but a set of tables. Before looking up a pesticide, work out which annex table and which crop group you need to match, and only then look at actual test results. The legal limit and the survey figure answer different questions; this page shows you how to read them separately.",
    sections: [
      {
        id: "five-tables",
        title: "Step 1: Which annex table is this pesticide in?",
        paragraphs: [
          "Under the cited regulation, besides the main table of residue limits, the standards contain a table of limits for exogenous pesticides, a list of pesticides exempt from limits, a list of banned pesticides and a classification of agricultural products — five parts in all. The same pesticide may appear in more than one table, or may not appear in any limit table at all because it is banned.",
          "Before you look anything up, confirm how the crop classification groups the item in your hand. Some leafy and root vegetables, for example, are not classified the way you might expect, and if you pick the wrong group you will match the wrong limit.",
        ],
        steps: [
          "First check whether the pesticide is on the list of banned pesticides.",
          "If it is not banned, check whether the residue limit table or the exogenous pesticide table lists this pesticide together with your crop group.",
          "If you cannot find the matching combination, note the pesticide name and the crop group and check with the announcement itself or the competent authority; do not assume the answer.",
        ],
        sourceIds: ["pesticide-mrl-std"],
      },
      {
        id: "law-vs-survey",
        title: "Step 2: The legal limit and the survey results are two different sets of data",
        paragraphs: [
          "The residue standards set an upper limit; the survey dataset records how much was actually found in a particular batch. You need both, but they answer different questions: the limit answers “what is the ceiling?”, and the survey answers “did the batches sampled this time exceed it?”.",
          "The survey dataset is the official pesticide residue survey of fruit and vegetables on the market, which according to the page is updated every three months. It reflects the batches that happened to be sampled; it does not mean every product on sale has been tested.",
        ],
        sourceIds: ["pesticide-mrl-std", "pesticide-survey-data"],
      },
    ],
    questions: [
      {
        question: "If a pesticide is not in the residue standards, does that mean it will never be detected?",
        answer:
          "You cannot conclude that. It may be missing because it is exempt from limits or banned, or because the classification or name did not match. This page does not judge whether any individual test result complies; check the full annex tables and the crop classification.",
      },
      {
        question: "If the survey shows a batch “passed”, does that guarantee the batch I bought passed too?",
        answer:
          "No. The dataset records the results for the specific batches that were sampled, not for every batch on the market; batches that were not tested are outside its scope.",
      },
    ],
    links: [
      { href: "/en/entities/glyphosate", label: "Case study: glyphosate’s residue limits and the international disagreement over its assessment" },
      { href: "/en/entities/veterinary-drug-residue-standard", label: "Compare: how the veterinary drug residue standard treats unlisted items" },
      { href: "/en/topics/pesticides-and-veterinary-drugs", label: "Back to Pesticides, Veterinary Drugs & Additives" },
    ],
    zhDigest: "a0f6859f",
  },
  "antimicrobial-resistance": {
    slug: "antimicrobial-resistance",
    typeLabel: "Risk concept",
    title: "Who becomes “resistant”? Get the subject right before you read on",
    introduction:
      "Everyday speech often talks about antimicrobial resistance as if it were a change in the person or animal. In fact, resistance is a tolerance that microorganisms evolve; it travels with the microorganisms and is not a reaction of the user’s body. Get this subject right and you will not read the policy recommendations that follow the wrong way round.",
    sections: [
      {
        id: "who-is-resistant",
        title: "Step 1: Resistance happens in microorganisms, not in people or animals",
        paragraphs: [
          "Antimicrobial resistance means that microorganisms become tolerant of antimicrobial agents that used to work against them, so that existing treatments stop being effective. The key subject is the microorganism, not the person or animal being treated — which is different from the everyday phrase “I’ve become resistant to this drug”.",
        ],
        sourceIds: [],
      },
      {
        id: "who-recommendation",
        title: "Step 2: Which kind of use does the WHO’s 2017 recommendation target?",
        paragraphs: [
          "The guidelines the WHO published in 2017 recommend stopping the routine use of antibiotics in healthy animals to promote growth or prevent disease. That sentence has two qualifiers: the animals are healthy, and the use is routine growth promotion or disease prevention. Treating animals that are already sick is not what this recommendation directly describes. For the full conditions and exceptions, consult the guidelines themselves; this page only summarises the published policy direction.",
        ],
        sourceIds: ["who-amr-2017"],
      },
      {
        id: "taiwan-plan",
        title: "Step 3: How Taiwan has built the issue into an action plan",
        paragraphs: [
          "In 2025 Taiwan launched the national One Health action plan on antimicrobial resistance, run jointly by the Centers for Disease Control, the Taiwan Food and Drug Administration and the Ministry of Agriculture. On the agricultural side, the work includes drawing up strategies to reduce antibiotic use in animals and assessing alternative substances. The issue spans public health and agriculture; no single ministry can handle it alone.",
        ],
        sourceIds: ["amr-plan-2025"],
      },
    ],
    questions: [
      {
        question: "Have I, or my animals, “become resistant to antibiotics”?",
        answer:
          "Strictly speaking, it is the microorganisms that become tolerant, not the body of the person or animal. Treatment fails because the infecting microorganisms are no longer sensitive to the drug, not because the body’s response to the drug has changed.",
      },
      {
        question: "Does the WHO recommendation amount to a total ban on antibiotics in animals?",
        answer:
          "No. The 2017 guidelines recommend stopping the routine use of antibiotics in healthy animals to promote growth or prevent disease; they do not ban treating animals that are sick. The full scope and exceptions are as stated in the guidelines themselves.",
      },
    ],
    links: [
      { href: "/en/entities/one-health", label: "Read next: what kind of cooperation framework is One Health?" },
      { href: "/en/entities/medicated-feed-additive", label: "Related: medicated feed additives" },
      { href: "/en/entities/veterinary-drug-residue-standard", label: "Compare: how the veterinary drug residue standard is defined" },
      { href: "/en/topics/pesticides-and-veterinary-drugs", label: "Back to Pesticides, Veterinary Drugs & Additives" },
    ],
    zhDigest: "48474fd9",
  },
  "one-health": {
    slug: "one-health",
    typeLabel: "Cross-sector framework",
    title: "One Health is not a slogan; it is a framework for decisions",
    introduction:
      "When you see “One Health”, first ask whether it is being used as a slogan or as a cooperation framework that is actually applied. This page starts with the official definition, then looks at how Taiwan has put it into a real policy instrument.",
    sections: [
      {
        id: "official-definition",
        title: "Step 1: What the official definition says",
        paragraphs: [
          "The OHHLEP definition cited by WOAH describes One Health as an integrated, unifying approach that aims to sustainably balance and optimise the health of people, animals and ecosystems. The point of the definition is that all three are optimised together. Animal disease control is not treated as an add-on to human health, and the definition is not only about ecology either.",
        ],
        sourceIds: ["woah-one-health"],
      },
      {
        id: "taiwan-application",
        title: "Step 2: How Taiwan actually uses the framework",
        paragraphs: [
          "Taiwan’s 2025 action plan on antimicrobial resistance uses One Health as the framework for cooperation between ministries, with the Centers for Disease Control, the Taiwan Food and Drug Administration and the Ministry of Agriculture running it jointly. In this case One Health is more than a concept: it is the reason given for putting three different authorities into a single action plan.",
        ],
        sourceIds: ["amr-plan-2025"],
      },
    ],
    questions: [
      {
        question: "Is One Health just a concept about animal disease control?",
        answer:
          "No. Under the cited OHHLEP definition it covers human health, animal health and ecosystem health; animal disease control is only one area where the framework is applied.",
      },
      {
        question: "What has One Health concretely done in Taiwan’s official documents?",
        answer:
          "According to published material, it serves as the cooperation framework for the 2025 cross-ministry action plan on antimicrobial resistance. This page does not cover the full content of that plan; see the original announcement and plan documents.",
      },
    ],
    links: [
      { href: "/en/entities/antimicrobial-resistance", label: "Further reading: the definition of antimicrobial resistance and Taiwan’s action plan" },
      { href: "/en/topics/pesticides-and-veterinary-drugs", label: "Back to Pesticides, Veterinary Drugs & Additives" },
    ],
    zhDigest: "73fb3621",
  },
  "organic-certification-mark": {
    slug: "organic-certification-mark",
    typeLabel: "Certification mark",
    title: "Seeing the word “organic”? First check whether the mark is there",
    introduction:
      "In law, “organic” is the name of a mark that may only be used after certification, not a marketing adjective. This page shows you how to look for the mark itself and then trace the certification body. Where you cannot find something, write the question down rather than deciding for yourself whether the product complies.",
    sections: [
      {
        id: "legal-basis",
        title: "Step 1: The legal definition of the mark and the threshold for using it",
        paragraphs: [
          "Under Article 3(6) of the Organic Agriculture Promotion Act, the organic agricultural product mark is the statutory mark used to certify that an agricultural product is organic. Under Article 20(1), only agricultural products that have passed certification under the Act may use it. In other words, the mark is a regulated entitlement, not something anyone can print on a pack.",
        ],
        sourceIds: ["organic-act"],
      },
      {
        id: "penalty",
        title: "Step 2: The penalty for using the mark without certification",
        paragraphs: [
          "Article 29(1) provides that anyone who uses the mark without having passed certification is liable to a fine of NT$200,000 to NT$2,000,000, which may be imposed for each violation. The penalty targets the act of using the mark. Whether a pack that only claims “organic” in words, with no mark, falls under the same penalty depends on the full text of the law and the facts of the case; this page does not decide whether anything is unlawful.",
        ],
        sourceIds: ["organic-act"],
      },
      {
        id: "buying-checklist",
        title: "Step 3: What to ask when buying organic produce",
        paragraphs: [
          "Once you have found the mark, go on to ask for the name of the certification body and the scope of the certification, rather than just checking that a mark is present. The mark shows that the product has passed certification; it is not the test result of a particular batch or a statement of its nutrients. The law defines these two things differently, so do not read one as a substitute for the other.",
        ],
        steps: [
          "Look for the mark itself, not just the word “organic”.",
          "Find the name of the certification body and check that it is a third party you can verify.",
          "If the information is incomplete, write down a specific question for the seller or the competent authority, rather than assuming the product complies or does not.",
        ],
        sourceIds: ["organic-act"],
      },
    ],
    questions: [
      {
        question: "Is it illegal if the pack just says “organic” with no mark?",
        answer:
          "The cited penalty provision expressly targets “using the mark”. Whether a claim in words alone is covered by the same penalty depends on the full text of the law and the facts of the case; this page does not decide whether anything is unlawful.",
      },
      {
        question: "How large is the fine for using the mark without certification?",
        answer:
          "Under Article 29(1), a fine of NT$200,000 to NT$2,000,000, which may be imposed for each violation. The amount in a particular case is decided by the competent authority.",
      },
    ],
    links: [
      { href: "/en/entities/tap-traceability", label: "Compare: how TAP traceability certification differs" },
      { href: "/en/topics/food-production", label: "Back to Food Production & Animal Husbandry" },
    ],
    zhDigest: "fd0dc22c",
  },
  tfda: {
    slug: "tfda",
    typeLabel: "Competent authority",
    title: "Article 22 of the food safety act says “announced separately”. Where do you find the announcement?",
    introduction:
      "Article 22 of the Act Governing Food Safety and Sanitation delegates the detailed format of nutrition labelling and genetically modified ingredient labelling to separate announcements by the competent authority. The article itself does not contain the details; you also have to find the announcement pages published by the TFDA. This page shows you how to find them and what to watch for once you have.",
    sections: [
      {
        id: "law-vs-announcement",
        title: "Step 1: Tell the article of law apart from the announcement",
        paragraphs: [
          "Article 22 of the Act lists ten mandatory labelling items, but how nutrition labelling and genetically modified ingredients must actually be presented is set by announcements of the central competent authority, which in practice are issued by the Ministry of Health and Welfare and the TFDA. Reading the article alone will not show you what those two items actually require.",
        ],
        sourceIds: [],
      },
      {
        id: "where-to-look",
        title: "Step 2: Which pages to look for on the TFDA website",
        paragraphs: [
          "Announcements and item lists for genetically modified food labelling are collected in the TFDA’s genetically modified food section. Records of approved registrations of genetically modified food ingredients are in the registration search on the Food and Drug Consumer Section, but that is a dynamic search interface, and the page itself states neither a total count nor an update date.",
        ],
        steps: [
          "Start in the genetically modified food section and find the relevant announcements and item lists; note the last-updated date shown on the page.",
          "To check whether a specific ingredient has an approved registration, switch to the registration search in the Consumer Section; do not use the list page in place of a search result.",
          "Where a page states no update date or total count, do not assume it covers all of the latest data.",
        ],
        sourceIds: ["tfda-gmo-items", "tfda-gmo-registry"],
      },
      {
        id: "version-caution",
        title: "Step 3: Second-hand summaries may differ from the current version",
        paragraphs: [
          "Figures in announcements and their annexes change when they are amended, and summaries circulating online may still reflect the version before an amendment. Once you have found a specific rule, make a habit of checking the date or version note on the official page before you cite it.",
        ],
        sourceIds: [],
      },
    ],
    questions: [
      {
        question: "How is the TFDA related to the Ministry of Health and Welfare?",
        answer:
          "The TFDA is an agency under the Ministry of Health and Welfare, responsible for the safety of food, drugs and cosmetics. Many provisions of the food safety act authorise the “central competent authority” to announce details, and in practice these are issued by the Ministry or the TFDA.",
      },
      {
        question: "Is the information on the TFDA website always the latest version?",
        answer:
          "Check for yourself. Where a page states a last-updated date, go by that date. For dynamic interfaces such as the registration search, which state no update date or total count, do not assume they cover all of the latest data.",
      },
    ],
    links: [
      { href: "/en/entities/gmo-food-labeling", label: "Read next: the scope of genetically modified food labelling" },
      { href: "/en/entities/nutrition-facts-label", label: "Related: how to compare nutrition labels" },
      { href: "/en/topics/food-labeling", label: "Back to Food Labelling & Consumer Choice" },
    ],
    zhDigest: "1fd8b606",
  },
};

export function findEnglishReaderGuide(slug: string): EnglishReaderGuide | undefined {
  return entityReaderGuidesEn[slug];
}
