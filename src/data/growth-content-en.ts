/**
 * 潤讀知識站英文版的內容翻譯（code-owned，與讀者指南相同的管理方式）。
 * 以 slug／id 對應中文內容；中文內容是正本，英文以中文為準。
 * zhDigest 是翻譯當時中文欄位的摘要，中文改了而英文沒跟上時測試會失敗。
 */
export type EnglishTopic = { name: string; summary: string; definition: string; keyQuestions: string[]; seoTitle: string; seoDescription: string; zhDigest: string };
export type EnglishEntity = { name: string; aliases: string[]; description: string; seoTitle: string; seoDescription: string; zhDigest: string };
export type EnglishRelation = { predicate: string; note: string; zhDigest: string };
export type EnglishSource = { title: string | null; publisher: string; note: string; zhDigest: string };
export type GrowthContentEn = { topics: Record<string, EnglishTopic>; entities: Record<string, EnglishEntity>; relations: Record<string, EnglishRelation>; sources: Record<string, EnglishSource> };

const LAWS_DB = "Laws & Regulations Database of the Republic of China (Taiwan), Ministry of Justice";
const MOA_LAWS = "Ministry of Agriculture Regulations System";

export const growthContentEn: GrowthContentEn = {
  topics: {
    "pesticides-and-veterinary-drugs": {
      name: "Pesticides, Veterinary Drugs & Additives",
      summary:
        "With pesticides and veterinary drugs, the question is not whether they are used but which ones, how much, and how much residue counts as compliant. This topic sets out Taiwan’s regulatory framework, several terms that are often confused, and where international agencies agree and where they have not yet reached consensus.",
      definition:
        "This topic covers plant-protection products used on crops, veterinary drugs used in livestock, poultry and aquaculture (including medicated feed additives), and the residue controls directly linked to both. Taiwan’s legal basis runs along two lines: the “use” side is governed by the pesticide control regulations and the veterinary drug control regulations respectively, while the “residue” side is brought together under the residue limit standards issued under the authority of the Act Governing Food Safety and Sanitation.",
      keyQuestions: [
        "Is a “maximum residue limit” a safety threshold or a regulatory threshold?",
        "Does Taiwan still allow antibiotics to be added to animal feed?",
        "Why does IARC say glyphosate is “probably carcinogenic” while EFSA says it does not meet the criteria for carcinogenicity classification?",
        "Where can I find the official results of pesticide residue testing on fruit and vegetables?",
      ],
      seoTitle: "Pesticides & Veterinary Drugs in Taiwan: Rules and Residue Limits",
      seoDescription:
        "Taiwan’s regulatory framework for pesticides and veterinary drugs, what residue limits mean and where they stop, and why international agencies reach different conclusions on glyphosate.",
      zhDigest: "c096c0cd",
    },
    "food-production": {
      name: "Food Production & Animal Husbandry",
      summary:
        "An egg from a battery cage, an enriched cage, a barn or a free-range farm is, in law, a clearly defined and different thing. This topic sets out Taiwan’s official definitions of production and husbandry methods, and which labels actually have a legal basis and which do not.",
      definition:
        "This topic covers the official definitions of livestock and poultry husbandry methods (in particular the four housing systems for laying hens), the certification schemes for agricultural products (Traceable Agricultural Products and organic), and how production methods show up on package labels. The focus is on “how the law defines it”, not “which is better” — the latter depends on whether you care most about animal welfare, price or reliable supply.",
      keyQuestions: [
        "How does Taiwanese law define “barn”, “free-range” and “enriched cage” systems?",
        "How much usable space per laying hen does the law require?",
        "How do TAP certification and the organic label differ?",
        "Does Taiwan have an official animal welfare label?",
      ],
      seoTitle: "Food Production & Animal Husbandry in Taiwan: Official Definitions",
      seoDescription:
        "Legal definitions and space requirements for Taiwan’s four laying-hen housing systems, how TAP and organic certification differ in legal basis, and which official farm labels exist.",
      zhDigest: "eb000b1f",
    },
    "food-labeling": {
      name: "Food Labelling & Consumer Choice",
      summary:
        "The label on the package is the only structured information you can get at the moment of purchase. This topic sets out which fields are required by law and which are voluntary, and which questions a label can and cannot answer.",
      definition:
        "Food labelling means the information that must appear on the container or outer packaging under Article 22 of the Act Governing Food Safety and Sanitation and the announcements issued under it, including the product name, ingredients, net weight, food additives, manufacturer details, country of origin, expiry date, nutrition labelling and genetically modified ingredients. Labelling is legally required disclosure, not a health rating of the food.",
      keyQuestions: [
        "Which labels on packaged food are required by law?",
        "What is the difference between “per serving” and “per 100 g” on a nutrition label?",
        "Which allergens must be labelled in Taiwan?",
        "Does “non-GMO” mean a product is safer?",
      ],
      seoTitle: "Food Labelling in Taiwan: Mandatory Fields and How to Read Them",
      seoDescription:
        "The ten mandatory labelling items under Article 22 of Taiwan’s food safety act, current nutrition and allergen labelling rules, and the scope of GMO labelling.",
      zhDigest: "14e5e3c5",
    },
    "nutrition-and-eating-out": {
      name: "Eating Out & Nutrition",
      summary:
        "When you eat out, you have far less information than when you buy packaged food. This topic sets out what the official guidance says about portions, which food businesses must disclose what by law when you eat out, and how the official diagnostic criteria are worded. It does not judge which way of eating is healthier; that is not a question the law can answer.",
      definition:
        "This topic covers three things of different standing. First, the official dietary guidance tools (the Daily Food Guide and My Plate), which are health education advice rather than legal obligations. Second, mandatory labelling when eating out, based on announcements authorised by Article 25 of the Act Governing Food Safety and Sanitation, which currently cover only freshly prepared drinks sold by chain drink shops, convenience stores and fast-food businesses. Third, officially published criteria and Dietary Reference Intakes for nutrients. The three carry different legal weight and should not be confused.",
      keyQuestions: [
        "What is the official wording of the six My Plate slogans?",
        "When I buy a drink at a chain drink shop, what information must the business give me by law?",
        "Do ordinary restaurants and lunch-box shops have to label calories too?",
        "There are several daily figures for sodium. How do they differ?",
      ],
      seoTitle: "Eating Out & Nutrition in Taiwan: Guidance, Labelling and Criteria",
      seoDescription:
        "The official Daily Food Guide and My Plate, mandatory labelling and scope for freshly prepared drinks, sodium reference values and the criteria for metabolic syndrome.",
      zhDigest: "5dff0426",
    },
  },

  entities: {
    glyphosate: {
      name: "Glyphosate",
      aliases: ["Glyphosate herbicide"],
      description:
        "Glyphosate is a non-selective herbicide active ingredient. In Taiwan it is a registered, approved pesticide, and its residues on agricultural products are governed by the Standards for Pesticide Residue Limits in Foods. It is also the textbook international case of “hazard identification” and “risk assessment” reaching different conclusions: in 2015 IARC classified it as Group 2A, “probably carcinogenic to humans”, while EFSA’s 2023 assessment found that it does not meet the criteria for classification as carcinogenic. The two conclusions answer different questions.",
      seoTitle: "Glyphosate in Taiwan: Residue Rules and the Cancer Debate",
      seoDescription:
        "Glyphosate is a registered pesticide in Taiwan with residues governed by national limits. Why IARC’s 2015 Group 2A classification and EFSA’s 2023 assessment disagree.",
      zhDigest: "2d14e0ed",
    },
    "pesticide-residue-limit": {
      name: "Pesticide Maximum Residue Limits (MRLs)",
      aliases: ["MRL", "Maximum residue limit", "Standards for Pesticide Residue Limits in Foods"],
      description:
        "Pesticide maximum residue limits are regulatory values set by the Standards for Pesticide Residue Limits in Foods under the authority of Article 15, Paragraph 2 of the Act Governing Food Safety and Sanitation, laying down the maximum permitted residue of each pesticide on each category of agricultural product. The standards take the form of annexed tables: besides the residue limit table, they include a table of limits for pesticides from external sources, a list of pesticides exempt from limits, a list of banned pesticides and a classification of agricultural products.",
      seoTitle: "Pesticide Residue Limits (MRLs) in Taiwan: Legal Basis and Tables",
      seoDescription:
        "The legal basis of Taiwan’s pesticide residue limit standards, the structure of its five annexed tables, and where to look up official produce residue testing results.",
      zhDigest: "a5521cc0",
    },
    "medicated-feed-additive": {
      name: "Medicated Feed Additives",
      aliases: ["Antibiotics in animal feed", "In-feed antibiotics"],
      description:
        "Medicated feed additives are drugs that may be added to feed for livestock and poultry under Article 4 and Annex 2 of the Regulations Governing the Use of Veterinary Drugs. The uses listed in the current regulations include growth promotion, improving feed efficiency, and disease prevention and control. Since 2000 Taiwan has reviewed and cut the list year by year; according to a 2015 statement from the Bureau of Animal and Plant Health Inspection and Quarantine, 34 substances had been removed in total. There is no blanket ban, however: Annex 2 still lists permitted substances today.",
      seoTitle: "Medicated Feed Additives in Taiwan: Current Rules and Myths",
      seoDescription:
        "The legal basis and currently permitted uses of medicated feed additives in Taiwan, and why the claim that Taiwan has fully banned antibiotics in feed does not match current law.",
      zhDigest: "3547e925",
    },
    "veterinary-drug-residue-standard": {
      name: "Veterinary Drug Residue Standards",
      aliases: ["Veterinary drug residue limits", "Standards for Veterinary Drug Residue Limits in Foods"],
      description:
        "The Standards for Veterinary Drug Residue Limits in Foods are set under Article 15, Paragraph 2 of the Act Governing Food Safety and Sanitation and govern the permitted residues of veterinary drugs in food. The limits in the standards refer to the level of the “marker residue”, not the sum of all metabolites of the drug. For any item not listed in the standards, residues must be non-detectable.",
      seoTitle: "Veterinary Drug Residue Standards in Taiwan: What the Limits Mean",
      seoDescription:
        "The legal basis of Taiwan’s veterinary drug residue standards, what a marker residue is, and why items not listed in the tables must have no detectable residue.",
      zhDigest: "accb28cd",
    },
    "antimicrobial-resistance": {
      name: "Antimicrobial Resistance (AMR)",
      aliases: ["AMR", "Antibiotic resistance"],
      description:
        "Antimicrobial resistance is when microorganisms become tolerant of antimicrobial agents that used to work against them, so that existing treatments fail. In 2017 the WHO issued guidelines recommending an end to the routine use of antibiotics in healthy animals for growth promotion or disease prevention. In 2025 Taiwan launched the “National One Health Action Plan on Antimicrobial Resistance”, carried out jointly by the Taiwan Centers for Disease Control, the Taiwan Food and Drug Administration and the Ministry of Agriculture; its agricultural strand includes drawing up strategies to reduce antibiotic use in animals and assessing alternatives.",
      seoTitle: "Antimicrobial Resistance (AMR): WHO Advice and Taiwan’s Action Plan",
      seoDescription:
        "What antimicrobial resistance is, the WHO’s 2017 recommendations on antibiotics in food-producing animals, and Taiwan’s cross-agency action plan launched in 2025.",
      zhDigest: "e8b1d904",
    },
    "one-health": {
      name: "One Health",
      aliases: ["One Health approach"],
      description:
        "One Health is an integrated framework that treats human health, animal health and ecosystem health as interdependent. The OHHLEP definition cited by WOAH is “an integrated, unifying approach that aims to sustainably balance and optimize the health of people, animals and ecosystems”. Taiwan’s 2025 action plan on antimicrobial resistance uses One Health as the framework for cooperation across government agencies.",
      seoTitle: "What Is One Health? Definition and How Taiwan Applies It",
      seoDescription:
        "One Health manages the health of people, animals and the environment as one: drug-resistant bacteria move between all three, so guarding only one side cannot stop them. The international definition, and how Taiwan uses it to coordinate antimicrobial resistance work across government agencies.",
      zhDigest: "c68ee1b5",
    },
    iarc: {
      name: "International Agency for Research on Cancer (IARC)",
      aliases: ["IARC"],
      description:
        "IARC is the cancer research agency of the World Health Organization; its Monographs programme assesses the carcinogenic “hazard” of various agents. IARC’s classifications answer “can this agent cause cancer under some circumstances?”, not “how high is the risk at the levels people are actually exposed to?”. Understanding this is essential to reading classifications such as Group 2A correctly.",
      seoTitle: "IARC Cancer Classifications: What They Mean and Common Misreadings",
      seoDescription:
        "IARC’s carcinogen groups describe hazard, not risk — and why that distinction leads to misleading headlines.",
      zhDigest: "880964ac",
    },
    "egg-friendly-production-system": {
      name: "Welfare-Friendly Egg Production Systems",
      aliases: ["Welfare-friendly eggs", "Barn eggs", "Free-range eggs"],
      description:
        "The Definitions and Guidelines for Welfare-Friendly Egg Production Systems are an administrative rule issued by the Ministry of Agriculture governing welfare-friendly housing for laying hens; they were issued on 2015-12-31 and last amended on 2022-05-23. The current version requires at least 1,000 cm² of usable space per hen for free-range and barn systems (nest boxes excluded in both cases), and for enriched cages requires at least 750 cm² of space per hen inside the cage and at least 600 cm² of usable space, together with perches, nest boxes and claw-shortening material.",
      seoTitle: "Taiwan’s Welfare-Friendly Egg Systems: Barn, Free-Range, Enriched",
      seoDescription:
        "Taiwan’s official definitions and space requirements for welfare-friendly laying-hen systems, including stocking density and enriched-cage facilities, per the 2022 amendment.",
      zhDigest: "ada13492",
    },
    "enriched-cage": {
      name: "Enriched Cage",
      aliases: ["Enriched colony cage", "Furnished cage"],
      description:
        "An enriched cage is one of the three welfare-friendly production systems defined in the Definitions and Guidelines for Welfare-Friendly Egg Production Systems (issued by the Ministry of Agriculture on 2015-12-31 and last amended on 2022-05-23): a cage system that provides nest boxes, perches, claw-shortening material and facilities that encourage natural behaviours such as scratching and foraging. This is the main difference from conventional cages. The figures set by the guidelines: each hen must have at least 750 cm² of space inside the cage, usable space per hen (excluding the nest box) must be at least 600 cm², each cage must have a total area of at least 2,000 cm², and the cage must be at least 45 cm high at its lowest point; perches must be at least 15 cm long and have no sharp edges. By comparison, barn and free-range systems require at least 1,000 cm² of usable space per hen (likewise excluding nest boxes), neither is subject to cage restrictions, and free-range systems have additional rules on outdoor areas and shelter. Conventional cages have none of these facilities, are not one of the three welfare-friendly systems listed in the guidelines, and are given no space or facility standards by them. Under the rule announced by the Ministry of Agriculture on 2021-09-17 designating washed fresh eggs as agricultural products requiring traceability registration and setting the items and labelling to be registered (issued under Article 16, Paragraphs 2 and 3 of the Agricultural Production and Certification Act), washed fresh eggs produced in Taiwan must, from 2022-01-01, have a production-method code printed on the shell. Fact-checking reports citing the same policy give the codes as O (organic), F (free-range), B (barn), E (enriched cage) and C (conventional cage) — this site has not been able to check this mapping directly against the full text of the official annex, so readers should check it against the code actually printed on the shell and the official lookup system. Views on enriched cages differ on animal welfare grounds. The Environment & Animal Society of Taiwan calls for all cages (including enriched cages) to be phased out, quotes the Israeli government as saying that “building any cage system (including enriched cages) is unwise”, and states that enriched cages accounted for 43.2% of EU laying-hen housing in 2022; the European Commission also formally responded in 2021 to the “End the Cage Age” citizens’ initiative, committing to propose legislation to phase out cage systems. On the industry side, the Taiwan Premium Washed Egg Association and others have argued at Taiwan–Japan exchange events that “enriched cages are not battery cages”, holding that their facilities meet the same international animal welfare research standards as barn and free-range systems and should not be lumped together with conventional battery cages. Both positions are presented here; this site does not judge which is right.",
      seoTitle: "What Is an Enriched Cage? Taiwan’s Definition, Space Rules, Debate",
      seoDescription:
        "Enriched cages give laying hens nest boxes, perches and claw-shortening material. Taiwan’s official definition, space rules, how they differ from barn and free-range, and both sides of the debate.",
      zhDigest: "b2a90265",
    },
    "tap-traceability": {
      name: "Traceable Agricultural Products (TAP)",
      aliases: ["TAP", "TAP certification", "TAP traceability"],
      description:
        "Traceable Agricultural Products (TAP) is Taiwan’s certification scheme for agricultural products. Operators must keep records of production stages, operation times, sources of inputs and shipments in an information management system, must comply with Taiwan Good Agricultural Practices (TGAP), and are audited on site by third-party certification bodies. Certified products may carry the TAP mark, a traceability code and the name of the certification body. Current certification requirements follow the Certification Criteria for Traceable Agricultural Products, not the old regulations repealed on 2022-07-19. To look up a product’s TAP record, consumers can go to the Traceable Agricultural Products information website (taft.moa.gov.tw) and enter the traceability code on the label, or scan the QR code on the label with a phone, to see the operator’s name, the certified item, the certification body and the validity period of the certificate for that batch. TAP and the organic label are two separate certification schemes. TAP certifies whether the production process has left traceable records and complies with TGAP; it does not require cultivation or husbandry methods to meet the organic standards defined in the Organic Agriculture Promotion Act. The organic agricultural product mark is defined in Article 3, Subparagraph 6 of that Act and, under Article 20, Paragraph 1, may only be used after passing certification. The two differ in certification criteria, legal basis and logo, and a product may hold either certification or both.",
      seoTitle: "TAP Certification in Taiwan: How to Check It and How It Differs",
      seoDescription:
        "TAP record-keeping rules, third-party audits and what the mark shows; how to look up a product by its code or QR code; and how TAP differs from the organic label.",
      zhDigest: "deb1ceb1",
    },
    "egg-shell-code-label": {
      name: "Egg Shell Codes on Washed Eggs",
      aliases: ["Egg shell code", "Egg stamp", "Egg traceability code", "Egg production-method code"],
      description:
        "The egg shell code is the two lines of code printed on the shells of washed fresh eggs, set by the Ministry of Agriculture’s rule designating washed fresh eggs as agricultural products requiring traceability registration and setting the items and labelling to be registered: announced on 2021-09-17, printed on every egg from 2022-01-01, and last amended on 2026-06-30 with effect from 2026-07-01. The first line is a 6-character traceability code: characters 1–3 are the number of the farm the eggs came from, and characters 4–6 are the number of the egg washing plant. The second line has 7 characters: characters 1–6 are the packing date and character 7 is the production-method code: O organic, F free-range, B barn, E enriched cage, C conventional cage. The rule only says the packing date takes 6 characters and does not specify how it is written; the Council of Agriculture’s policy briefing slides of December 2021 use “A01001” and “220101F” as examples, but these are illustrations in a briefing, not the rule itself. The rule also does not specify where the code is printed; the briefing suggests the blunt end or the side of the egg. The rule defines character 7 as a “production-method code” used to distinguish organic, free-range, barn, enriched-cage and conventional-cage production; it is not a freshness or quality grade, and the Council of Agriculture’s briefing recommends judging freshness by the packing date together with the expiry date on the outer packaging. For the space and facility requirements of free-range, barn and enriched-cage systems, see the Definitions and Guidelines for Welfare-Friendly Egg Production Systems. The 2026 amendment widened the designated scope from washed fresh eggs supplied to school meals, military rations, convenience stores, supermarkets, hypermarkets, warehouse stores and online channels to all washed fresh eggs supplied by egg washing plants; the five production-method codes were unchanged. Washed fresh eggs supplied as processing ingredients, or for other uses approved by the Ministry of Agriculture, are exempt from printing but must still be registered with their recipients and uses. The printing requirement applies to washed fresh eggs supplied by egg washing plants; unwashed fresh eggs are not covered (although washing plants must still register the quantity of unwashed eggs they take in). According to the Council of Agriculture’s 2021 explanation, consumers can use the printed traceability code in the consumer lookup section of the Domestic Poultry Traceability Portal, run by the National Animal Industry Foundation with guidance from the Ministry of Agriculture, to find information on the washing plant and the source farm.",
      seoTitle: "How to Read Taiwan’s Egg Shell Codes: O, F, B, E and C Explained",
      seoDescription:
        "What the two lines on a washed egg mean: farm and washing-plant numbers, then packing date plus the production-method code (O, F, B, E, C), under the rules in force from 2026-07-01.",
      zhDigest: "a6511901",
    },
    "organic-certification-mark": {
      name: "Organic Agricultural Product Mark",
      aliases: ["Organic label", "Organic certification"],
      description:
        "The organic agricultural product mark is the mark defined in Article 3, Subparagraph 6 of the Organic Agriculture Promotion Act to certify that an agricultural product is organic. Under Article 20, Paragraph 1 of the same Act, only agricultural products that have passed certification under the Act may use the mark; under Article 29, Subparagraph 1, anyone who uses the mark without passing certification is fined between NT$200,000 and NT$2,000,000, and may be fined again for each further violation.",
      seoTitle: "Taiwan’s Organic Agricultural Product Mark: Law, Use and Penalties",
      seoDescription:
        "The legal definition of Taiwan’s organic mark, the requirement to pass certification before using it, and the fines for unauthorised use.",
      zhDigest: "3d6fd6d2",
    },
    "taiwan-native-chicken": {
      name: "Taiwanese Native Chicken",
      aliases: ["Taiwan native chicken", "Red-feathered native chicken", "Black-feathered native chicken"],
      description:
        "“Native chicken” (tu ji) is not a legal term in Taiwan. According to the Ministry of Agriculture’s Livestock Research Institute, native chicken refers broadly to Taiwan’s local chicken breeds, whose origins and dates of introduction are hard to trace; their shared traits include lead-coloured shanks, coloured plumage, high activity and light-brown eggs, and they tolerate heat and resist disease better than ordinary chickens. According to a summary by the former Council of Agriculture’s Department of Animal Industry in Agriculture Policy and Review (October 2010), the main native chicken types on the market are red-feathered native chicken, black-feathered native chicken, capons, game fowl, naked-neck chicken and black-boned (silkie-type) chicken, with red- and black-feathered native chickens making up more than 80% of the number raised in Taiwan. The two most practical differences between red- and black-feathered birds are, first, market age — the same source gives 12–13 weeks for typical red-feathered native chickens and 14–15 weeks for black-feathered ones — and second, the consumer market: northern consumers mostly buy cuts, and the “northern chicken” they need is mainly large red-feathered native chicken and game fowl, while central and southern consumers mostly buy whole birds, and the “southern chicken” is mainly the smaller black-feathered native chicken and black-boned chicken. As for differences in texture, this site found no official comparison and so does not offer a view. Ministry of Agriculture statistics for Q1 2025 show that in Taiwan and Fujian (Kinmen and Matsu), 1,026 farms held 25,898,679 white broilers, 1,565 farms held 12,396,967 red-feathered native chickens, 1,271 farms held 8,271,543 black-feathered native chickens, and 155 farms held 1,138,595 black-boned chickens; these are numbers on farms at one point in time, not annual slaughter figures. The commonly used name “black-feathered black-boned chicken” is not an official breed name: black-boned chicken is a separate category in the statistics, and the “Black Silky Fowl” bred by the Livestock Research Institute was approved for new breed registration by the former Council of Agriculture under the Animal Industry Act on 2019-04-29. The approval describes adults as having black silky plumage all over, a rose comb, extra toes and dark skin, with dark bones and dark meat in the carcass.",
      seoTitle: "Taiwanese Native Chicken: Red vs Black Feathered, Breeds, Stats",
      seoDescription:
        "Official descriptions of Taiwan’s native chickens, how red-feathered (12–13 weeks) and black-feathered (14–15 weeks) birds differ, regional buying habits, farm numbers and the Black Silky Fowl.",
      zhDigest: "833c8d26",
    },
    "taiwan-green-onion": {
      name: "Welsh Onion (Green Onion) in Taiwan",
      aliases: ["Green onion", "Welsh onion", "Spring onion", "Sanxing green onion"],
      description:
        "The scientific name of the Welsh onion is Allium fistulosum L. According to teaching material from the Ministry of Agriculture’s Hualien District Agricultural Research and Extension Station (published September 2024), green onions are available in Taiwan all year round, with around 4,000 hectares under cultivation in recent years. Most domestic green onions belong to two groups, “Japanese onion” and “northern onion”: the Japanese onion (the four-season onion, also called Japanese bunching onion or Kujo onion) is grown mainly in Yilan County, tolerates heat poorly and suits a cool climate, while the northern onion is grown mainly in Yunlin and Changhua counties. There is also the long onion, with deep green leaves and a white shaft about 30 cm long, which tolerates cold and suits autumn and winter growing. Based on the 2020–2022 averages in the Agricultural Statistics Yearbook, the five counties and cities with the largest area and output are, in order, Changhua County, Yunlin County, Yilan County, Taichung City and Kaohsiung City. “Sanxing green onion” means green onions grown in the Sanxing area of Yilan County; it is not a single variety. Growers there mainly plant four-season onions, which make up about 60% of Yilan County’s green onion output, and the main variety is “Lanyang No. 4” (sold as “Ching Yu”), bred by the Hualien station. As for the season, although green onions can be supplied all year, they prefer cool weather and are hard to grow in summer. The Hualien station notes that from July to October typhoons, torrential rain and other natural disasters often disrupt supply and cause price swings, and that it takes about 3 months from transplanting to harvest, so replanting after a disaster takes a long time and shortages last longer; this is the main reason green onion prices jump in summer and autumn. The name “fen cong” is easily confused: teaching material from the Ministry of Agriculture’s Taiwan Biodiversity Research Institute states that the shallot is academically called “fen cong” (Allium ascalonicum). It is the shallot used to make fried shallot crisps, a different crop from the green onion eaten as a vegetable. Based on 2020–2022 averages, shallots were grown on 1,176 hectares, with Tainan City, Yunlin County and Chiayi County together accounting for about 99.6% of national output. This site found no official statement on whether everyday usage also calls tillering green onions “fen cong”; when buying, go by the actual item.",
      seoTitle: "Green Onions in Taiwan: Varieties, Seasons and Sanxing Onions",
      seoDescription:
        "Taiwan’s main green onion types and growing areas, where Sanxing green onions come from, why prices swing from July to October, and why official material uses “fen cong” for the shallot.",
      zhDigest: "10bb6be4",
    },
    "nutrition-facts-label": {
      name: "Nutrition Labelling",
      aliases: ["Nutrition facts", "Nutrition facts panel", "Nutrition label"],
      description:
        "Nutrition labelling is the panel on packaged food that lists energy and specified nutrients in a fixed format. It is one of the mandatory labelling items listed in Article 22, Paragraph 1 of the Act Governing Food Safety and Sanitation, with detailed rules announced by the central competent authority as the “Regulations on Nutrition Labeling for Prepackaged Food Products”. That announcement was amended in 2022 and took effect on 2024-07-01. According to Q5.2 of the official Q&A, ordinary packaged foods may use either of two example formats, “per serving + per 100 g (ml)” or “per serving + percentage of daily reference value”; some specific foods have other format requirements, so it cannot be said in general that every product must show both per serving and per 100 g.",
      seoTitle: "Nutrition Labelling in Taiwan: Mandatory Items, Formats, Limits",
      seoDescription:
        "The two general example formats for Taiwan’s nutrition labels, how to compare per serving and equal weights, and what a nutrition label can and cannot tell you.",
      zhDigest: "fdaff916",
    },
    "allergen-labeling": {
      name: "Allergen Labelling",
      aliases: ["Food allergen labelling", "Allergen declaration"],
      description:
        "Taiwan’s food allergen labelling rules were announced under Article 22, Paragraph 1, Subparagraph 10 of the Act Governing Food Safety and Sanitation and took effect on 2020-07-01, increasing the number of allergens that must be labelled from 6 to 11: crustaceans, mango, peanuts, cow’s and goat’s milk, eggs, tree nuts, sesame, cereals containing gluten, soybeans, fish, and sulphites with a sulphur dioxide residue of 10 mg/kg or more, and products made from them.",
      seoTitle: "Food Allergen Labelling in Taiwan: The 11 Mandatory Allergens",
      seoDescription:
        "The 11 allergens that must be labelled in Taiwan since July 2020, the legal basis and the date the rules took effect.",
      zhDigest: "bd545d0f",
    },
    "gmo-food-labeling": {
      name: "GMO Food Labelling",
      aliases: ["GMO labelling", "Non-GMO labelling", "Genetically modified food labelling"],
      description:
        "Labelling of genetically modified food ingredients is one of the mandatory items listed in Article 22, Paragraph 1 of the Act Governing Food Safety and Sanitation, and applies to packaged food, food additives and food sold in bulk. According to the Ministry of Health and Welfare, the new rules lowered the threshold for unintentional presence from 5% to 3%, require highly processed products (such as soybean oil and corn syrup) to be labelled as well, and require the words “genetically modified” to be printed in type no smaller than 2 mm. The genetically modified food ingredients approved through inspection and registration in Taiwan fall into five categories: soybean, maize, cotton, rapeseed and sugar beet.",
      seoTitle: "GMO Food Labelling in Taiwan: Scope, Threshold, Approved Crops",
      seoDescription:
        "The scope of Taiwan’s GMO labelling, the 3% threshold for unintentional presence, type-size rules and the five approved categories of GM food ingredients.",
      zhDigest: "d274e112",
    },
    tfda: {
      name: "Taiwan Food and Drug Administration (TFDA)",
      aliases: ["TFDA"],
      description:
        "The Taiwan Food and Drug Administration is the central government agency responsible for the safety of food, drugs and cosmetics. In food labelling, Article 22 of the Act Governing Food Safety and Sanitation leaves the details of nutrition labelling and genetically modified ingredient labelling to be announced separately by the central competent authority; these announcements are issued by the Ministry of Health and Welfare and the TFDA.",
      seoTitle: "Taiwan Food and Drug Administration (TFDA)",
      seoDescription:
        "What the TFDA is responsible for, and its role in food labelling and in the inspection and registration of genetically modified food.",
      zhDigest: "1efa6464",
    },
    "daily-dietary-guidelines": {
      name: "Daily Food Guide",
      aliases: ["My Plate", "Taiwan Daily Food Guide", "Six food groups"],
      description:
        "The Daily Food Guide is a dietary guidance tool published by the Health Promotion Administration; the current edition is the October 2018 Daily Food Guide handbook. It divides food into six groups: whole grains and starches; beans, fish, eggs and meat; dairy; vegetables; fruit; and oils, nuts and seeds. It sets seven energy levels — 1,200, 1,500, 1,800, 2,000, 2,200, 2,500 and 2,700 kcal — each with different recommended servings. At 1,800 kcal, for example: 3 bowls of whole grains and starches, 5 servings of beans, fish, eggs and meat, 1.5 cups of dairy, 3 servings of vegetables, 2 servings of fruit and 5 servings of oils, nuts and seeds. My Plate is an education tool, launched in 2018, that turns the same ideas into a plate graphic and six slogans: “a cup of milk morning and evening”, “fruit the size of your fist at every meal”, “a little more vegetables than fruit”, “as much rice as vegetables”, “beans, fish, eggs and meat the size of your palm”, and “a teaspoon of nuts and seeds”. This is health education advice, not a legal obligation, and not an individual prescription.",
      seoTitle: "Taiwan’s Daily Food Guide and My Plate: Six Groups, Seven Levels",
      seoDescription:
        "The six food groups in Taiwan’s 2018 Daily Food Guide, recommended servings for the seven energy levels, and the six My Plate slogans and their source.",
      zhDigest: "dcb4414c",
    },
    "sodium-intake-reference": {
      name: "Sodium Intake Reference Values",
      aliases: ["CDRR", "Sodium CDRR", "Daily sodium limit", "Recommended sodium intake"],
      description:
        "The CDRR (Chronic Disease Risk Reduction Intake) is the sodium intake recommendation set for people aged 1 and over in the 8th edition of Taiwan’s Dietary Reference Intakes (DRIs). It is aimed at preventing chronic disease and is not a safety upper limit. Taiwan in fact has more than one official figure for sodium, belonging to different documents with different purposes, and they cannot be substituted for each other. First, the sodium chapter of the 8th edition DRIs (still a draft announced in 2022 as of 2026-09-15) explicitly sets no Tolerable Upper Intake Level (UL) for sodium, on the grounds that there is no toxicological evidence of risk from high sodium intake in healthy populations. What it sets is an Adequate Intake (AI) for infants (100 mg/day at 0–6 months and 320 mg/day at 7–12 months) and the CDRR for ages 1 and over: 1,300 mg/day at ages 1–3, 1,700 at 4–6, 2,000 at 7–9, and 2,300 for ages 10 and over and adults. Calling 2,300 mg an “upper limit” or “UL” is a mistake. Second, the daily reference value for sodium for people aged four and over in Table 1 of the TFDA’s Regulations on Nutrition Labeling for Prepackaged Food Products is 2,000 mg; that is a baseline for calculating labels, not a scientific recommendation, and not the CDRR. On conversion to salt, the Ministry of Health and Welfare’s health education page “A low-sodium diet is healthier” states that “adults’ total daily sodium intake should not exceed 2,400 mg (i.e. 6 g of salt)”. That page was created in 2010 and is yet another source with a different purpose from the two documents above; the three figures should not be quoted in place of one another.",
      seoTitle: "What Is the CDRR? Sodium Reference Values, Label Values and UL",
      seoDescription:
        "What the CDRR is, why Taiwan’s 8th edition DRIs set no sodium UL, CDRR values by age, and how it differs from the 2,000 mg daily reference value on nutrition labels.",
      zhDigest: "bfd28d1a",
    },
    "prepared-beverage-labeling": {
      name: "Labelling Rules for Freshly Prepared Drinks",
      aliases: ["Bubble tea labelling", "Chain drink shop labelling", "Sugar and calorie labelling for drinks"],
      description:
        "The “Labelling Rules for Freshly Prepared Drinks Sold by Chain Drink Shops, Convenience Stores and Fast-Food Businesses” are a labelling obligation announced under the authority of Article 25, Paragraph 2 of the Act Governing Food Safety and Sanitation. They were issued on 2015-07-20 and amended three times, on 2015-08-24, 2020-10-05 and 2022-06-07, with the latest version in effect from 2023-01-01. They apply to freshly prepared drinks sold by chain drink shops, convenience stores and fast-food businesses; according to Q2 of the official Q&A, Chinese and Western restaurants, breakfast shops and chain restaurants whose main business is serving meals are not covered. Businesses must label the total sugar and total energy of each cup, using either the actual value or the maximum value. For tea and coffee drinks containing caffeine, if labelled by band, the bands are 201 mg or more, 101–200 mg and 100 mg or less of caffeine per cup; the country of origin of tea leaves and coffee beans must be labelled; and drinks containing less than 10% fruit or vegetable juice may not use “juice” in their name. Labelling may be done on menus, price cards, signs or QR codes. Failure to label is fined between NT$30,000 and NT$3,000,000 under Article 25, Paragraph 2; false labelling is fined between NT$40,000 and NT$4,000,000 under Article 28, Paragraph 1.",
      seoTitle: "Freshly Prepared Drink Labelling in Taiwan: Scope, Items, Fines",
      seoDescription:
        "Mandatory labelling items for freshly prepared drinks at chain drink shops, convenience stores and fast-food outlets, caffeine bands, excluded businesses and fines.",
      zhDigest: "1b016704",
    },
    "metabolic-syndrome-criteria": {
      name: "Criteria for Metabolic Syndrome",
      aliases: ["Metabolic syndrome", "Metabolic syndrome criteria", "Metabolic syndrome indicators"],
      description:
        "Metabolic syndrome is assessed against 5 indicators (which the Health Promotion Administration calls components); meeting 3 or more of them means metabolic syndrome. The 5 indicators and their values are: (1) abdominal obesity: waist circumference ≥90 cm (35 in) for men and ≥80 cm (31 in) for women; (2) raised blood pressure: systolic ≥130 mmHg or diastolic ≥85 mmHg; (3) raised fasting blood glucose: fasting glucose ≥100 mg/dL; (4) raised fasting triglycerides: ≥150 mg/dL; (5) low HDL cholesterol: <40 mg/dL for men and <50 mg/dL for women. These are the adult criteria for metabolic syndrome published by the Health Promotion Administration, whose page gives the Metabolic Syndrome Learning Handbook (2016 edition) as its source. Note that the National Health Insurance Administration’s “National Health Insurance Metabolic Syndrome Prevention Programme” has a separate set of enrolment conditions: the values are the same, but each carries the proviso “or already receiving drug treatment”, and the waist criterion is relaxed to either the waist threshold or BMI ≥27. Those are conditions for enrolling patients in a reimbursed programme (open to insured people aged 20 to 64) and serve a different purpose from the HPA’s general criteria; the two should not be used interchangeably. This page sets out the wording of the criteria and does not constitute a diagnosis or medical advice.",
      seoTitle: "Metabolic Syndrome Criteria in Taiwan: The 5 Indicators and Values",
      seoDescription:
        "The 5 indicators of metabolic syndrome — waist, blood pressure, fasting glucose, triglycerides and HDL cholesterol — the HPA’s values, the 3-of-5 rule, and the NHIA enrolment criteria.",
      zhDigest: "5c680348",
    },
  },

  relations: {
    "rel-glyphosate-iarc": {
      predicate: "is classified as Group 2A by",
      note: "Classification published by IARC on 2015-03-20; it is a hazard identification.",
      zhDigest: "28dde21e",
    },
    "rel-glyphosate-residue-limit": {
      predicate: "has its residues governed by",
      note: "The specific values are in the annexed tables of the standards; this site does not quote values it has not checked.",
      zhDigest: "94c239ca",
    },
    "rel-feed-additive-residue-standard": {
      predicate: "has its residues governed by",
      note: "On the residue side, everything comes back to the standards set under the Act Governing Food Safety and Sanitation.",
      zhDigest: "d951a1be",
    },
    "rel-feed-additive-amr": {
      predicate: "is recommended by the WHO to be restricted to reduce",
      note: "This is an international recommendation, not Taiwanese law, and does not amount to a causal link established in Taiwan.",
      zhDigest: "00b57d8e",
    },
    "rel-amr-one-health": {
      predicate: "is addressed as an issue under the framework of",
      note: "Following the framework of the Ministry of Health and Welfare’s 2025 national action plan.",
      zhDigest: "c197777b",
    },
    "rel-nutrition-label-tfda": {
      predicate: "is regulated, with detailed rules announced, by",
      note: "Article 22 of the Act Governing Food Safety and Sanitation authorises the central competent authority to announce how nutrition labelling is done.",
      zhDigest: "a26456a1",
    },
    "rel-allergen-tfda": {
      predicate: "is regulated, with detailed rules announced, by",
      note: "Announced under Article 22, Paragraph 1, Subparagraph 10 of the Act Governing Food Safety and Sanitation.",
      zhDigest: "58fbbcdd",
    },
    "rel-gmo-label-tfda": {
      predicate: "is regulated, with detailed rules announced, by",
      note: "The full texts of the three sets of “regulations” are PDF attachments; this site only cites the key points described in the official press release.",
      zhDigest: "c5678dc5",
    },
    "rel-enriched-cage-friendly-system": {
      predicate: "is one of the three welfare production systems defined in",
      note: "Under the 2022-05-23 amendment of the Definitions and Guidelines for Welfare-Friendly Egg Production Systems, the welfare-friendly systems are free-range, barn and enriched cage.",
      zhDigest: "74cfbe0f",
    },
    "rel-egg-shell-code-enriched-cage": {
      predicate: "is marked with production-method code E for",
      note: "Under Point 3, Item (2) of the text as amended on 2026-06-30, character 7 of the second line is “E: enriched-cage production”.",
      zhDigest: "7e3cf235",
    },
  },

  sources: {
    "src-food-act-22": {
      title: "Act Governing Food Safety and Sanitation, Article 22",
      publisher: LAWS_DB,
      note: "The article page does not state when this article was last amended; the database was last updated on 2026-08-28.",
      zhDigest: "eb52c22d",
    },
    "src-food-act-21": {
      title: "Act Governing Food Safety and Sanitation, Article 21",
      publisher: LAWS_DB,
      note: "Legal basis for the inspection and registration of genetically modified food ingredients. The article page does not state when this article was last amended.",
      zhDigest: "f229c10b",
    },
    "src-food-act-3": {
      title: "Act Governing Food Safety and Sanitation, Article 3",
      publisher: LAWS_DB,
      note: "Subparagraph 11 is the legal definition of “genetic modification”. The article page does not state when this article was last amended.",
      zhDigest: "720eaa5b",
    },
    "src-vet-drug-act": {
      title: "Veterinary Drugs Control Act",
      publisher: LAWS_DB,
      note: "Article 32 is the legal basis for the usage regulations; Article 32-3 requires livestock, poultry and aquatic products on the market to meet the residue standards.",
      zhDigest: "2b58098f",
    },
    "src-vet-drug-usage": {
      title: "Regulations Governing the Use of Veterinary Drugs",
      publisher: LAWS_DB,
      note: "Article 4 and Annex 2 set the uses and substances permitted as medicated feed additives.",
      zhDigest: "9b14f8fe",
    },
    "src-vet-residue-std": {
      title: "Standards for Veterinary Drug Residue Limits in Foods",
      publisher: LAWS_DB,
      note: "Set under Article 15, Paragraph 2 of the Act Governing Food Safety and Sanitation; the limits refer to the level of the marker residue.",
      zhDigest: "03a49a1d",
    },
    "src-pesticide-residue-std": {
      title: "Standards for Pesticide Residue Limits in Foods",
      publisher: LAWS_DB,
      note: "The main text lists the structure of Tables 1 to 5; values for individual pesticides are in the table files, and this site does not quote values it has not checked.",
      zhDigest: "fb2b2ddf",
    },
    "src-organic-act": {
      title: "Organic Agriculture Promotion Act",
      publisher: LAWS_DB,
      note: "Promulgated 2018-05-30, in force 2019-05-31. Article 3, Subparagraph 6; Article 20; Article 29, Subparagraph 1.",
      zhDigest: "3c98b88f",
    },
    "src-egg-friendly": {
      title: "Definitions and Guidelines for Welfare-Friendly Egg Production Systems",
      publisher: MOA_LAWS,
      note: "Issued 2015-12-31, last amended 2022-05-23. The space figures cited on this site are from the current amended version.",
      zhDigest: "b5a281d1",
    },
    "src-tap-standard": {
      title: "Certification Criteria for Traceable Agricultural Products",
      publisher: MOA_LAWS,
      note: "Set under Article 4 of the Agricultural Production and Certification Act; issued 2020-12-25, last amended 2023-03-24.",
      zhDigest: "820be403",
    },
    "src-tap-portal": {
      title: "Traceable Agricultural Products information website: About TAP",
      publisher: "Ministry of Agriculture",
      note: "The page states it was updated on 2026-08-28.",
      zhDigest: "e2e298ce",
    },
    "src-tfda-gmo-items": {
      title: "Genetically modified food items on the market in Taiwan (GM food section)",
      publisher: "Taiwan Food and Drug Administration",
      note: "The page states it was last updated on 2025-05-05.",
      zhDigest: "7155f09f",
    },
    "src-tfda-gmo-registry": {
      title: "Search of permits for inspection and registration of genetically modified food ingredients",
      publisher: "Taiwan Food and Drug Administration (Food and Drug Consumer Section)",
      note: "A dynamic search interface; the page gives neither an update date nor a total count, so this site does not quote a specific number.",
      zhDigest: "38c7215d",
    },
    "src-gmo-label-2015": {
      title: "New labelling rules for genetically modified food take effect on 1 July",
      publisher: "Ministry of Health and Welfare",
      note: "Official press release. The full texts of the three sets of “regulations” are PDF attachments that this site could not obtain in readable form, so only the key points described in the press release are cited.",
      zhDigest: "7bac2f58",
    },
    "src-nutrition-label-2022": {
      title: "Announcement amending parts of the Regulations on Nutrition Labeling for Prepackaged Food Products",
      publisher: "Ministry of Health and Welfare",
      note: "Takes effect on 2024-07-01.",
      zhDigest: "c879e344",
    },
    "src-nutrition-format-qa": {
      title: "Q&A on the Regulations on Nutrition Labeling for Prepackaged Food Products: Q5.2, example formats for ordinary packaged food",
      publisher: "Ministry of Health and Welfare",
      note: "Q5.2 on pages 8–9 of the PDF gives two general example formats; some specific foods have other format requirements.",
      zhDigest: "f3c1150c",
    },
    "src-allergen-2018": {
      title: "Announcement of food allergen labelling rules: allergens to be labelled increased to 11",
      publisher: "Ministry of Health and Welfare",
      note: "The page states it was last updated on 2022-10-27; the rules took effect on 2020-07-01.",
      zhDigest: "46ddd758",
    },
    "src-aphia-feed-additive": {
      title: "Bureau has reviewed and cut 34 medicated feed additives since 2000, effectively reducing antibiotic use in animals",
      publisher: "Animal and Plant Health Inspection Agency, Ministry of Agriculture (then the Bureau of Animal and Plant Health Inspection and Quarantine, Council of Agriculture)",
      note: "Published 2015-12-01. The change in use described covers 2011 to 2014.",
      zhDigest: "f30f9f6b",
    },
    "src-amr-plan-2025": {
      title: "Launch in 2025 of the National One Health Action Plan on Antimicrobial Resistance",
      publisher: "Ministry of Health and Welfare",
      note: "Carried out jointly by the Taiwan Centers for Disease Control, the Taiwan Food and Drug Administration and the Ministry of Agriculture.",
      zhDigest: "cbda74e3",
    },
    "src-data-pesticide": {
      title: "Dataset: pesticide residues in fruit and vegetables from market surveys",
      publisher: "Taiwan Food and Drug Administration (Government Open Data Platform)",
      note: "The page states it was last updated on 2026-07-02 and is updated every 3 months.",
      zhDigest: "a07d6f26",
    },
    "src-data-gmo": {
      title: "Dataset: genetically modified food ingredients",
      publisher: "Taiwan Food and Drug Administration (Government Open Data Platform)",
      note: "The page states it was last updated on 2026-08-26 and is updated every 3 months.",
      zhDigest: "09b81206",
    },
    "src-iarc-glyphosate": {
      title: null,
      publisher: "International Agency for Research on Cancer (IARC), WHO",
      note: "IARC carries out hazard identification, not risk assessment of dietary exposure.",
      zhDigest: "5910c673",
    },
    "src-efsa-glyphosate": {
      title: null,
      publisher: "European Food Safety Authority (EFSA)",
      note: "EFSA carries out risk assessment, and also notes remaining data gaps.",
      zhDigest: "44546c90",
    },
    "src-who-amr-2017": {
      title: null,
      publisher: "World Health Organization",
      note: "An international recommendation, not Taiwanese law.",
      zhDigest: "c6cf096e",
    },
    "src-woah-one-health": {
      title: null,
      publisher: "World Organisation for Animal Health (WOAH)",
      note: "The page gives no publication or update date; the definition cited is the OHHLEP version.",
      zhDigest: "eac559ed",
    },
    "src-who-gmo": {
      title: null,
      publisher: "World Health Organization",
      note: "The page is dated 2014-05-01; the year should be stated when citing it.",
      zhDigest: "bed714a5",
    },
    "src-daily-diet-guide-2018": {
      title: "Daily Food Guide handbook",
      publisher: "Health Promotion Administration, Ministry of Health and Welfare",
      note: "The page states the October 2018 edition; the edition year should be given when citing it.",
      zhDigest: "49ed62c4",
    },
    "src-daily-diet-amounts": {
      title: "Recommended daily food amounts",
      publisher: "Health Promotion Administration, Ministry of Health and Welfare (Community Health Division)",
      note: "The page states it was published on 2013-09-14 and updated on 2021-11-15. The table of seven energy levels was cross-checked against two independent retrievals and the figures match. This page uses a variant character in the name of the whole grains group.",
      zhDigest: "646a8fa5",
    },
    "src-my-plate-slogans": {
      title: "Follow the six My Plate slogans to eat a balanced, healthy diet",
      publisher: "Ministry of Health and Welfare",
      note: "Word-for-word source of the six slogans. It was published by the Ministry of Health and Welfare itself, not the Health Promotion Administration, and must not be misattributed.",
      zhDigest: "e8db8ddc",
    },
    "src-my-plate-handbook": {
      title: "My Plate handbook",
      publisher: "Health Promotion Administration, Ministry of Health and Welfare",
      note: "The page gives no publication date for the handbook itself; the footer update date is 2026-09-14. The page has official descriptive text on how My Plate relates to the Daily Food Guide, but no announcement reference number could be found.",
      zhDigest: "c60c35cf",
    },
    "src-dietary-portion-standard": {
      title: "Healthy eating standards",
      publisher: "Health Promotion Administration, Ministry of Health and Welfare (Community Health Division)",
      note: "The page states it was published on 2018-03-13 and updated on 2024-12-04. Basis for the serving equivalents of each food group.",
      zhDigest: "3dc4d408",
    },
    "src-dris-8th-sodium": {
      title: "Dietary Reference Intakes (DRIs), 8th edition — Sodium (draft)",
      publisher: "Health Promotion Administration, Ministry of Health and Welfare",
      note: "PDF attachment of the draft pre-announced by the HPA on 2022-02-22, attached to the announcement page nodeid=129&pid=15039. As of the retrieval date it is still marked as a draft, and it must be cited as a draft.",
      zhDigest: "819d2192",
    },
    "src-dris-8th-page": {
      title: "Dietary Reference Intakes (DRIs), 8th edition",
      publisher: "Health Promotion Administration, Ministry of Health and Welfare",
      note: "The page states it was published on 2020-04-08 and updated on 2025-11-21. Sodium and potassium are chapters new in the 8th edition.",
      zhDigest: "6f2e7ef2",
    },
    "src-nutrition-label-rules": {
      title: "Regulations on Nutrition Labeling for Prepackaged Food Products",
      publisher: "Taiwan Food and Drug Administration",
      note: "The daily reference values in Table 1 are a baseline for labelling and serve a different purpose from the scientific recommendations in the DRIs; they cannot be substituted for each other.",
      zhDigest: "6160c477",
    },
    "src-prepared-beverage-rule": {
      title: "Amendment of the Labelling Rules for Freshly Prepared Drinks Sold by Chain Drink Shops, Convenience Stores and Fast-Food Businesses, effective 1 January 2023 (ROC year 112)",
      publisher: "Taiwan Food and Drug Administration",
      note: "The announcement page states only the effective date and does not list the labelling items; for the specific items see the TFDA’s Q&A. The original rules were issued on 2015-07-20 and amended three times, on 2015-08-24, 2020-10-05 and 2022-06-07.",
      zhDigest: "301f9c99",
    },
    "src-prepared-beverage-qa": {
      title: "Q&A on the Labelling Rules for Freshly Prepared Drinks Sold by Chain Drink Shops, Convenience Stores and Fast-Food Businesses",
      publisher: "Taiwan Food and Drug Administration",
      note: "The PDF header states it was announced on 2015-07-20 and amended on 2015-08-24, 2020-10-05 and 2022-06-07. The caffeine band thresholds (Q8) and the fine amounts (Q20) have been checked item by item.",
      zhDigest: "a5754ada",
    },
    "src-food-act-25": {
      title: "Act Governing Food Safety and Sanitation, Article 25",
      publisher: LAWS_DB,
      note: "Paragraph 2 is the authority for the labelling rules for freshly prepared drinks. This is an enabling provision and does not list specific labelling items.",
      zhDigest: "99bfab97",
    },
    "src-sodium-reduction-mohw": {
      title: "A low-sodium diet is healthier",
      publisher: "Ministry of Health and Welfare",
      note: "The page states it was created and updated on 2010-10-20. This is a recommended value from a health education page; it, the CDRR in the DRIs and the reference value for nutrition labelling come from three documents with different purposes.",
      zhDigest: "8413a17e",
    },
    "src-nhi-metabolic-syndrome-plan": {
      title: "National Health Insurance Metabolic Syndrome Prevention Programme",
      publisher: "National Health Insurance Administration, Ministry of Health and Welfare",
      note: "Patient enrolment conditions, not general diagnostic criteria. Open to insured people aged 20 to 64; each of the five conditions carries the proviso “or already receiving drug treatment”, and the waist criterion has the alternative “or BMI ≥27”.",
      zhDigest: "f8bf181b",
    },
    "src-metabolic-syndrome-hpa": {
      title: "Metabolic syndrome",
      publisher: "Health Promotion Administration, Ministry of Health and Welfare (Chronic Disease Prevention and Control Division)",
      note: "The page gives the Metabolic Syndrome Learning Handbook (2016 edition) as its source; the footer update date is 2026-09-14. These are the HPA’s general criteria and do not include the proviso “or already receiving drug treatment”.",
      zhDigest: "d17fbb69",
    },
    "src-tap-resume-lookup": {
      title: "How to look up production information from a TAP label",
      publisher: "Ministry of Agriculture (Traceable Agricultural Products information website)",
      note: "The page states it was last updated on 2026-09-24. It explains that consumers can enter the traceability code on the label on the TAP information website, or scan the QR code on the label with a mobile device; results include the operator’s name, the certified item, the certification body and the validity period of the certificate.",
      zhDigest: "d50ad1f1",
    },
    "src-egg-code-regulation": {
      title: "Designation of washed fresh eggs as agricultural products requiring traceability registration, and the items and labelling to be registered",
      publisher: MOA_LAWS,
      note: "Set under Article 16, Paragraphs 2 and 3 of the Agricultural Production and Certification Act. Promulgated 2021-09-17, last amended 2026-06-30 with effect from 2026-07-01. The rule requires a production-method code to be printed on the shells of washed fresh eggs; for the code table, the PDF of the text as amended on 2026-06-30 prevails.",
      zhDigest: "6c774081",
    },
    "src-egg-code-announcement": {
      title: "Printing of labels on every washed fresh egg officially starts on 1 January 2022 (ROC year 111)",
      publisher: "Council of Agriculture (now the Ministry of Agriculture)",
      note: "The press release states that washed fresh eggs must be printed with the traceability codes of the egg washing plant and the source farm, the packing date and a production-method code, starting officially on 2022-01-01; the body of the release does not give a table matching codes to husbandry methods.",
      zhDigest: "5aacf63a",
    },
    "src-egg-code-factcheck": {
      title: "[Misleading] Viral video claiming the codes printed on eggs show egg quality? Some claims lack full context",
      publisher: "MyGoPen (fact-checker)",
      note: "The fact-check cites the printing scheme announced by the Ministry of Agriculture in September 2021 and, “with reference to international practice”, lists O organic, F free-range, B barn, E enriched cage and C conventional cage. The official code table has since been checked against the original text as amended on 2026-06-30; this report serves only as a supplementary source.",
      zhDigest: "6d9eb80e",
    },
    "src-east-enriched-cage-eu": {
      title: "Treating animals well: global progress and timelines for going cage-free",
      publisher: "Environment & Animal Society of Taiwan (EAST)",
      note: "An advocacy article by an animal protection group calling for all cages (including enriched cages) to be phased out. It quotes the Israeli government as saying that “building any cage system (including enriched cages) is unwise” and gives EU-wide 2022 laying-hen housing shares (enriched cages 43.2%). This is the position of an advocacy group, not an official statistical source.",
      zhDigest: "b282d260",
    },
    "src-eu-eeas-end-cage-age": {
      title: null,
      publisher: "European Union External Action Service (republishing the European Commission’s response)",
      note: "The European Commission’s response to the European citizens’ initiative “End the Cage Age”, committing to propose legislation to phase out and eventually ban cage systems (covering cage systems for laying hens and other species), originally planned for proposal by the end of 2023.",
      zhDigest: "4a008ba4",
    },
    "src-ctee-enriched-cage-industry": {
      title: "Enriched cages are not battery cages! Taiwan–Japan exchange calls for diverse, affordable welfare for laying hens",
      publisher: "Commercial Times",
      note: "Reports the position of the Taiwan Premium Washed Egg Association and Japanese academics at a Taiwan–Japan exchange event that enriched-cage facilities meet the same international animal welfare research standards as barn and free-range systems and should not be lumped together with conventional battery cages. This is the position of an industry group and academics, not an official conclusion.",
      zhDigest: "ebdf1a31",
    },
    "src-egg-code-rule-2026": {
      title: "Designation of washed fresh eggs as agricultural products requiring traceability registration, and the items and labelling to be registered (text as amended on 30 June 2026, ROC year 115)",
      publisher: "Ministry of Agriculture",
      note: "PDF of the amended text attached in the Ministry of Agriculture Regulations System, amended 2026-06-30 and in force from 2026-07-01. The printing table in Point 3, Item (2): in the first-line traceability code, characters 1–3 are the number of the farm supplying fresh eggs to the egg washing plant and characters 4–6 are the number of the egg washing plant; in the second line, characters 1–6 are the packing date and character 7 is the production-method code (O organic production, F free-range production, B barn production, E enriched-cage production, C conventional-cage production). The text does not specify how the packing date is written or where the code is printed. The fonts in the PDF cannot be extracted as text, so this site checked the original page by page against images.",
      zhDigest: "9b249271",
    },
    "src-egg-code-amendment-2026": {
      title: "General explanation and comparison table for the amendment of the rule designating washed fresh eggs as agricultural products requiring traceability registration",
      publisher: "Ministry of Agriculture",
      note: "The 2026 amendment widened the designated scope from washed fresh eggs supplied to school meals, military rations, convenience stores, supermarkets, hypermarkets, warehouse stores and online channels to all washed fresh eggs supplied by egg washing plants; eggs supplied as processing ingredients or for other uses approved by the Ministry of Agriculture may be exempt from printing; and a new requirement was added to keep purchase and shipment records for the past three years. The production-method codes O, F, B, E and C are unchanged in the before-and-after comparison table.",
      zhDigest: "c176ede2",
    },
    "src-egg-code-briefing": {
      title: "Traceability management policy for printing on washed eggs (briefing slides)",
      publisher: "Council of Agriculture (now the Ministry of Agriculture)",
      note: "Policy briefing slides dated 2021-12-24. They use “A01001” and “220101F” as printing examples and show that the code may be printed on the blunt end or the side of the egg (vertically or horizontally); the packing date format and print position are examples in the slides and are not specified in the rule. The slides predate the 2026 amendment; the amended rule prevails on format.",
      zhDigest: "225f235a",
    },
    "src-poultry-trace-portal": {
      title: "Domestic Poultry Traceability Portal: consumer lookup section",
      publisher: "National Animal Industry Foundation (with guidance from the Ministry of Agriculture)",
      note: "The page gives no publication or update date. The portal lists consumer lookup systems such as the Taiwan egg printing management system, and the footer names the Ministry of Agriculture as the supervising body and the National Animal Industry Foundation as the operator; the Council of Agriculture’s briefing of 2021-12-24 states that looking up the printed traceability code gives information such as the egg washing plant and the farm the eggs came from.",
      zhDigest: "b9281436",
    },
    "src-native-chicken-industry": {
      title: "Results and outlook of support for the native chicken industry",
      publisher: "Ministry of Agriculture (formerly the Department of Animal Industry, Council of Agriculture)",
      note: "Agriculture Policy and Review, issue 220 (October 2010; the page gives only the year and month, so the 1st of the month is used as the day). It lists the main native chicken types, states that red- and black-feathered birds make up more than 80% of the number raised, describes the different consumer habits for “northern” and “southern” chickens, and gives typical market ages (12–13 weeks for red-feathered and 14–15 weeks for black-feathered birds).",
      zhDigest: "f7a4dc05",
    },
    "src-native-chicken-tlri": {
      title: "Characteristics and nutritional requirements of chicken breeds",
      publisher: "Livestock Research Institute, Ministry of Agriculture",
      note: "Briefing slides from the Livestock Research Institute; the page gives no publication date. States that “native chicken” refers broadly to Taiwan’s local breeds whose origins are hard to trace, and lists shared traits such as lead-coloured shanks, coloured plumage and light-brown eggs.",
      zhDigest: "88b80144",
    },
    "src-poultry-farm-stats-2025q1": {
      title: "Number of livestock and poultry farms and animals on farms in Taiwan and Fujian (Q1 2025, ROC year 114)",
      publisher: "Ministry of Agriculture",
      note: "The statistics period is Q1 2025; the page gives no publication date. The figures are animals on farms (the number held at one point in time), not annual slaughter.",
      zhDigest: "f51d0b36",
    },
    "src-black-silky-fowl-registration": {
      title: "Announcement approving new breed registration of the “Black Silky Fowl”, with approval document",
      publisher: "Council of Agriculture (Executive Yuan Gazette, Vol. 25, No. 80)",
      note: "Announcement No. 1080042730 of 2019-04-29, approved under Article 12 of the Animal Industry Act; bred by the Livestock Research Institute.",
      zhDigest: "2244c6f6",
    },
    "src-green-onion-teaching": {
      title: "Teaching material on domestic farm, fishery and livestock products: green onion",
      publisher: "Hualien District Agricultural Research and Extension Station, Ministry of Agriculture",
      note: "Published September 2024 (the page gives only the year and month, so the 1st of the month is used as the day). County area and output figures are 2020–2022 averages from the Ministry of Agriculture’s Agricultural Statistics Yearbook.",
      zhDigest: "c11976e4",
    },
    "src-shallot-teaching": {
      title: "Teaching material on domestic farm, fishery and livestock products: shallot",
      publisher: "Taiwan Biodiversity Research Institute, Ministry of Agriculture",
      note: "Published September 2024 (the page gives only the year and month, so the 1st of the month is used as the day). States that the shallot is academically called “fen cong”; area and output figures are 2020–2022 averages from the Agriculture and Food Agency’s agricultural situation reports.",
      zhDigest: "c67c4f41",
    },
    "src-green-onion-typhoon": {
      title: "Introduction to simple typhoon-proof net-house cultivation of green onions",
      publisher: "Hualien District Agricultural Research and Extension Station, Ministry of Agriculture",
      note: "August 2017 (the page gives only the year and month, so the 1st of the month is used as the day). States that green onions prefer cool weather, that natural disasters from July to October often disrupt supply and cause price swings, and that it takes about 3 months from transplanting to harvest.",
      zhDigest: "42c0b401",
    },
  },
};
