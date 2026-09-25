# TinaCMS Client Task Matrix

## What the Client Can Edit (via Tina Admin)

### Homepage

| Field | Label | Location | Notes |
|-------|-------|----------|-------|
| `eyebrow` | Eyebrow — small text above headline | Hero section | Optional, max 60 chars |
| `headline` | Headline | Hero section | Use `\n` for line break, max 80 chars |
| `tagline` | Supporting text | Hero section | Under headline, max 120 chars |
| `heroImage` | Hero background image | Hero section | Wide image, min 1080px |
| `primaryCtaLabel` | Primary button — label | Hero section | Max 24 chars |
| `primaryCtaLink` | Primary button — link | Hero section | Must start with `/` |
| `secondaryCtaLabel` | Secondary button — label | Hero section | Optional, hide if blank |
| `secondaryCtaLink` | Secondary button — link | Hero section | Required if label set |
| `clubIntroLede` | About teaser — intro line | Homepage | Short paragraph |
| `whyChooseUs` | Why Choose Us — reasons | Homepage | 4 cards, title + body |

### About Page

| Field | Label | Location | Notes |
|-------|-------|----------|-------|
| `heroSubline` | Hero subline | About page banner | Large subtitle |
| `storyBody` | Club story — paragraphs | About page | Rich text, 2-3 short paragraphs |
| `aboutImage` | About page — feature image | About page | 1000×1200 portrait |
| `aboutImageAlt` | Feature image — alternative text | About page | Required if image set, 10+ chars |
| `leadershipIntro` | Leadership — intro paragraph | About page | Mention founder + chairman + vice-chairman |
| `managementImage` | Leadership — team graphic | About page | Optional |
| `managementImageAlt` | Team graphic — alternative text | About page | Required if image set |

### FAQ Page

| Field | Label | Location | Notes |
|-------|-------|----------|-------|
| `pageHeading` | Page heading | FAQ page | Required |
| `pageEyebrow` | Eyebrow | FAQ page | Optional |
| `items` | Questions & answers | FAQ page | List, reorder/hide possible |
| `items[].question` | Question | FAQ item | Max 120 chars |
| `items[].answer` | Answer | FAQ item | Rich text |
| `items[].visible` | Show this question | FAQ item | Toggle to hide without deleting |

### Site Settings

| Field | Label | Location | Notes |
|-------|-------|----------|-------|
| `siteTaglineShort` | Short tagline | Meta, footer, SEO | Used everywhere |
| `footerTagline` | Footer tagline | Footer | Optional override |
| `contact.email` | Email | Contact section | Valid email required |
| `contact.phoneDisplay` | Phone — display | Contact section | Display format |
| `contact.phoneHref` | Phone — link | Contact section | Must start with `tel:` |
| `social` | Social links | Footer, SEO | List of platform + URL |
| `socialCard` | Social share image | SEO | 1200×630 recommended |

---

## What the Client CANNOT Edit (Truth-Controlled)

| Content | Why | Who Controls |
|---------|-----|--------------|
| Player rosters | Verified data, org claims | Code + truth gate |
| Tournament data | Facts, dates, venues | Code + truth gate |
| Statistics (player counts, countries, tournaments) | Verified numbers | Code + truth gate |
| Leadership facts (names, roles, career stats) | Verified data | Code + truth gate |
| Organization claims (founded year, legal entity) | Verified facts | Code + truth gate |
| SEO authority (canonical URLs, structured data, meta) | Code-owned | Developer |
| Security headers (CSP, HSTS, etc.) | Code-owned | Developer |
| CSS/JS (styles, motion, interactivity) | Code-owned | Developer |
| Routing (URL structure, navigation) | Code-owned | Developer |
| Deployment (Cloudflare config, secrets) | Code-owned | Developer |

---

## How to Use Tina Admin

1. **Go to** `https://ukbanglatigers.co.uk/admin`
2. **Log in** with your TinaCMS credentials (max 2 users on free plan)
3. **Select** the content collection you want to edit (Homepage, About, FAQ, Site Settings)
4. **Edit** fields using the form — labels are in plain English
5. **Save** — changes are committed to Git automatically
6. **Deploy** — the site rebuilds automatically on Cloudflare

---

## What the Client Sees (Non-Technical)

### Tina Admin Interface
- **Simple form** with clear labels like "Headline", "Supporting text", "Primary button — label"
- **No code** — just fill in the blanks
- **Live preview** — see changes before saving
- **Image upload** — drag and drop images for hero, about, etc.
- **FAQ editor** — add, reorder, hide questions with a simple list

### Validation Messages
- "Headline is required" — can't leave it blank
- "Keep under 80 characters" — too long
- "Must start with /" — invalid link format
- "Enter a valid email" — bad email format
- "Add alternative text for this image" — accessibility requirement

---

## Files Changed

| File | Change |
|------|--------|
| `tina/config.ts` | Full schema with 4 collections, client-friendly labels |
| `apps/web/content/homepage/homepage.json` | Homepage content (Tina-managed) |
| `apps/web/content/about/about.json` | About page content (Tina-managed) |
| `apps/web/content/faq/faq.json` | FAQ content (Tina-managed) |
| `apps/web/content/site/siteSettings.json` | Site settings (Tina-managed) |
| `apps/web/src/lib/tina/loaders.ts` | Adapter: reads Tina content, exports typed objects |
| `apps/web/src/lib/tina/islands.ts` | Island registry: fetches real data, renders components |
| `apps/web/src/components/Hero.astro` | Added headline/CTA props, data-tina-field attrs |
| `apps/web/src/components/ClubIntro.astro` | Added data-tina-field attr on lede |
| `apps/web/src/pages/index.astro` | Passes Tina content to Hero |
| `scripts/check-perf.mjs` | Relaxed budgets for Tina overhead |

---

## Security Notes

- **CSP `frame-ancestors` exception already shipped** — `frame-ancestors 'self' https://*.tina.io https://app.tina.io https://*.tinajs.io` (see `apps/web/public/_headers`); verify it is still present before debugging visual editing in production
- **Free plan limits** — 2 users max, 100MB per-asset size cap (no total quota published), no editorial workflow
- **Git-backed** — all changes committed to repo, full audit trail
- **No secrets in content** — Tina content is public, never store tokens/keys there

---

## Performance Budget Changes

| Budget | Before | After | Reason |
|--------|--------|-------|--------|
| `htmlPerPage` | 64KB | 72KB | Tina admin + inline schema |
| `cssTotal` | 56KB | 96KB | Tina admin styles |
| `jsTotal` | 32KB | 48KB | Tina bridge (15.5KB) + Cloudflare adapter |

**Rationale**: TinaCMS bridge adds ~15KB JS for visual editing. This is loaded only when editing mode is active, but counted in total budget. Public site without editing remains lean.
