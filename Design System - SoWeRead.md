# 潤讀 So We Read | Design System & Content Audit

**Project**: 潤讀 (So We Read) - Knowledge Curation Platform  
**Date**: April 25, 2026  
**Site URL**: https://soweread.com/  
**Current Status**: Established Jan 2026 | Ready for optimization

---

## 📋 Content Structure & Information Architecture

### Site Pages (Current)
1. **Home / Landing** (`/home/`) - Hero, featured posts, CTA
2. **About** (`/about/`) - Origin story, community values, mission
3. **Manifesto** (`/home/manifesto/`) - Three core principles + visual callouts
4. **Blog / Posts** (`/?page_id=300`) - Paginated article listing
5. **Contact** (`/home/contact/`) - [Not fetched, assume contact form]
6. **Privacy Policy** (`/home/privacy-policy/`) - [Not fetched]

### Content Categories
- **食品與健康 (Food & Health)** - Primary category with 10+ articles visible
  - Topics: GMO foods, food safety, nutrition, eating habits, dining culture

### Navigation Elements
- Primary nav: Home, About, Features (Manifesto), Blog, Contact, Privacy
- CTA buttons: "開始閱讀" (Start Reading) - appears in header, hero, footer
- Dual nav (mobile-aware repetition visible in HTML)

---

## 🎨 Visual & Brand Elements

### Logo & Branding
- **Logo**: "潤讀 So We Read" (bilingual: Traditional Chinese + English)
- Asset: `wp-content/uploads/2026/02/So-We-Read-潤讀-logo-關於-1.png`
- Design: Appears minimal/clean (typical WordPress theme)

### Current Color Palette (Inferred)
- **Primary**: Off-white/white backgrounds (standard blog aesthetic)
- **Text**: Dark gray/black for readability
- **Accents**: Likely subtle grays and neutral tones (professional blog template)
- **Theme**: Astra (WordPress theme)

### Typography (Inferred)
- **Font Stack**: System fonts / Google Fonts (Astra defaults)
- **Heading Style**: Traditional serif or sans-serif blog headers
- **Body**: Legible serif/sans for long-form reading

---

## 📐 UI Components & Patterns

### Homepage Sections
1. **Navigation Bar** (sticky/fixed) - Logo + menu links + CTA
2. **Hero Section** - Tagline: "探索閱讀的無限可能" (Explore infinite reading possibilities)
3. **Article Grid/List** - Posts by category with:
   - Featured image placeholder
   - Title (h2/h3)
   - Category tag
   - Author + date metadata
   - Excerpt/preview text
   - "Read Post »" link
4. **Pagination** - Previous/next page navigation
5. **CTA Section** - "加入我們，開始探索知識之旅" (Join us on a knowledge journey)
   - Secondary copy + button
6. **Footer** - Links + copyright + "返回頂端" (Back to top)

### About Page Elements
- Large feature image (logo/branding visual)
- Blockquote: "潤讀是一個多元知識的平台，旨在篩選和整理重要資訊。"
- Two main sections:
  - 成立初衷 (Origin / Mission)
  - 讀者與社群 (Readers & Community)
- Same CTA + footer

### Manifesto Page Elements
- Hero image (stack of books, white aesthetic)
- Opening narrative copy
- Three pillar cards:
  1. **精選內容** (Selection) + icon
  2. **由淺入深** (Progression) + icon
  3. **宏觀的視角** (Optics) + icon
- Standard CTA + footer

---

## 🔍 Current Strengths
✓ Clear mission and values messaging  
✓ Clean, readable content structure  
✓ Functional pagination and navigation  
✓ Mobile-responsive nav (appears adaptive)  
✓ Strong category organization  
✓ Consistent branding language

## ⚠️ Potential Optimization Opportunities
- Visual hierarchy could be more pronounced
- Color palette appears neutral—may lack visual personality
- Icon treatment inconsistent (SVG placeholders visible)
- Typography scale not optimized for impact
- CTA frequency/placement could be refined
- Feature images / visual content strategy unclear
- Metadata display (author, date) could be more scannable
- "Hero" section copy lacks visual emphasis

---

## 📝 Brand Voice & Tone
**Formal, thoughtful, educational**: "用心梳理每一份資訊" (carefully curate every piece of info)  
**Community-oriented**: "以文會友，匯聚同好" (bond through writing, gather like-minded)  
**Accessible yet deep**: "由淺入深" (shallow to deep progression)

---

## 🎯 Next Steps for Optimization

**Questions to clarify your vision:**

1. What is the PRIMARY goal? (Traffic, engagement, community, retention, conversions?)
2. Do you want to keep the current WordPress setup, or migrate to a custom solution?
3. What aspects feel most misaligned with your vision? (visual identity, information flow, brand presence, user engagement?)
4. Do you have brand colors, typography, or design guidelines already? Or shall we create them?
5. Are there specific user journeys you want to optimize? (new reader discovery, article browsing, subscription/signup?)
6. How important are social sharing, comments, and community engagement features?
7. What tone/aesthetic appeals to you? (modern & minimal, warm & inviting, editorial & sophisticated, bold & energetic?)

