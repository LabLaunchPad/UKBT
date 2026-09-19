/**
 * Central content-trust policy — REM-004 single authority for Tina/CMS field
 * classification (D-003, D-006). Tina is an editing interface, never a source
 * of truth (D-001): factual authority lives in @ukbt/truth records (D-002).
 *
 * Trust classes:
 * - PRESENTATION_COPY: editorial/prose/UI text. Renders escaped as text.
 *   May be fact-capable in prose (owner responsibility); NEVER feeds
 *   structured data (enforced by scripts/check-content-trust.mjs).
 * - NAVIGATION_URL: validated by apps/web/src/lib/allowed-urls.ts (REM-003).
 * - SECURITY_SENSITIVE: raw-sink-adjacent; safe only via its named renderer.
 * - TECHNICAL: flags/containers with no content semantics.
 * - DORMANT: schema-defined but unwired (no sink). Rewiring one requires
 *   reclassifying it to its target path in the same change.
 *
 * Keys are config-exact dotted paths from tina/config.ts. Every collection
 * field MUST appear here — the gate fails closed on unclassified fields.
 */

export type TrustClass =
  | 'PRESENTATION_COPY'
  | 'NAVIGATION_URL'
  | 'SECURITY_SENSITIVE'
  | 'TECHNICAL'
  | 'DORMANT';

export interface FieldTrust {
  cls: TrustClass;
  structured: boolean;
  note: string;
}

function p(note: string): FieldTrust {
  return { cls: 'PRESENTATION_COPY', structured: false, note };
}

export const TINA_FIELD_TRUST: Record<string, FieldTrust> = {
  // homepage collection (apps/web/content/homepage/homepage.json)
  'homepage.eyebrow': p('Hero kicker text.'),
  'homepage.headline': p(
    'Hero headline; identity-adjacent prose, text sink only.',
  ),
  'homepage.tagline': p(
    'Island prop only; main render uses gated homepage.taglineShort.',
  ),
  'homepage.metaDescription': {
    cls: 'PRESENTATION_COPY',
    structured: false,
    note: 'SEO-sensitive search snippet (FND-W2-150). Meta/OG/Twitter only; never JSON-LD.',
  },
  'homepage.heroImage': {
    cls: 'PRESENTATION_COPY',
    structured: false,
    note: 'img-src sink only; no script execution.',
  },
  'homepage.primaryCtaLabel': p('Button label, escaped text.'),
  'homepage.primaryCtaLink': {
    cls: 'NAVIGATION_URL',
    structured: false,
    note: 'REM-003 site-relative refine.',
  },
  'homepage.secondaryCtaLabel': p('Button label, escaped text.'),
  'homepage.secondaryCtaLink': {
    cls: 'NAVIGATION_URL',
    structured: false,
    note: 'REM-003 site-relative refine.',
  },
  'homepage.clubIntroLede': p(
    'Club intro prose; fact-capable (owner responsibility).',
  ),
  'homepage.whyChooseUs': {
    cls: 'TECHNICAL',
    structured: false,
    note: 'List container.',
  },
  'homepage.whyChooseUs.title': p('Card heading.'),
  'homepage.whyChooseUs.body': p(
    'Card body; fact-capable prose (FND-W1-041). Never structured.',
  ),
  // about collection — heroSubline/storyBody/leadershipIntro are wired in
  // about.astro (PageBanner/AboutStory/LeadershipGrid + aboutHero/Story/
  // Leadership islands). The image fields stay DORMANT: no sink; wiring
  // or removing them is an owner decision (schema change needs reindex).
  'about.heroSubline': p('About banner lede; PageBanner text sink.'),
  'about.storyBody': {
    cls: 'PRESENTATION_COPY',
    structured: false,
    note: 'Rich-text via TinaMarkdown renderer (AboutStory); never raw HTML.',
  },
  'about.aboutImage': { cls: 'DORMANT', structured: false, note: 'No sink.' },
  'about.aboutImageAlt': {
    cls: 'DORMANT',
    structured: false,
    note: 'No sink.',
  },
  'about.leadershipIntro': p('Leadership intro; LeadershipGrid text sink.'),
  'about.managementImage': {
    cls: 'DORMANT',
    structured: false,
    note: 'No sink.',
  },
  'about.managementImageAlt': {
    cls: 'DORMANT',
    structured: false,
    note: 'No sink.',
  },
  // faq collection (apps/web/content/faq/faq.json)
  'faq.pageHeading': {
    cls: 'PRESENTATION_COPY',
    structured: false,
    note: 'SEO-sensitive title (FND-W2-151); escaped text sink.',
  },
  'faq.pageEyebrow': p('Section eyebrow.'),
  'faq.items': { cls: 'TECHNICAL', structured: false, note: 'List container.' },
  'faq.items.question': p('Summary element, escaped text.'),
  'faq.items.answer': {
    cls: 'SECURITY_SENSITIVE',
    structured: false,
    note: 'set:html sink; safe ONLY via renderFaqAnswer (REM-001).',
  },
  'faq.items.visible': {
    cls: 'TECHNICAL',
    structured: false,
    note: 'Visibility flag; fail-open (!== false renders) documented.',
  },
  // siteSettings collection (apps/web/content/site/siteSettings.json)
  'siteSettings.siteTaglineShort': p('Footer/meta-adjacent tagline.'),
  'siteSettings.footerTagline': p('Footer text.'),
  'siteSettings.contact': {
    cls: 'TECHNICAL',
    structured: false,
    note: 'Object container.',
  },
  'siteSettings.contact.email': p(
    'Contact channel; fact-capable (authority: REM-021). Renders mailto:.',
  ),
  'siteSettings.contact.phoneDisplay': p('Contact channel display text.'),
  'siteSettings.contact.phoneHref': {
    cls: 'NAVIGATION_URL',
    structured: false,
    note: 'REM-003 tel: refine.',
  },
  'siteSettings.social': {
    cls: 'TECHNICAL',
    structured: false,
    note: 'List container; sunk in Footer with truth fallback.',
  },
  'siteSettings.social.platform': {
    cls: 'DORMANT',
    structured: false,
    note: 'No independent sink (renders inside footer social links).',
  },
  'siteSettings.social.url': {
    cls: 'NAVIGATION_URL',
    structured: false,
    note: 'REM-003 https: refine; sunk in Footer with truth fallback.',
  },
  'siteSettings.socialCard': {
    cls: 'DORMANT',
    structured: false,
    note: 'No sink; og:image uses DEFAULT_OG_IMAGE.',
  },
};

/**
 * Central exemption policy (D-006). The ONLY truth-gate exemptions in force.
 * Gate rule: every `exemptFields` literal in apps/web/src/content/*-data.ts
 * must appear here, or the content-trust gate fails.
 */
export const EXEMPT_POLICY: Record<
  string,
  { category: string; reason: string }
> = {
  'nav.home': {
    category: 'ui_labels',
    reason: 'Navigation label, no factual content.',
  },
  'nav.about': {
    category: 'ui_labels',
    reason: 'Navigation label, no factual content.',
  },
  'nav.captain': {
    category: 'ui_labels',
    reason: 'Navigation label, no factual content.',
  },
  'nav.players': {
    category: 'ui_labels',
    reason: 'Navigation label, no factual content.',
  },
  'nav.franchises': {
    category: 'ui_labels',
    reason: 'Navigation label, no factual content.',
  },
  'nav.tournaments': {
    category: 'ui_labels',
    reason: 'Navigation label, no factual content.',
  },
  'nav.contact': {
    category: 'ui_labels',
    reason: 'Navigation label, no factual content.',
  },
  'cta.primary.label': {
    category: 'ui_labels',
    reason: 'Button label, no factual content.',
  },
};

/** JSON-LD emitters whose inputs must be truth-sourced (D-005). */
export const STRUCTURED_EMITTERS = [
  'homepageGraph',
  'aboutGraph',
  'captainGraph',
];
