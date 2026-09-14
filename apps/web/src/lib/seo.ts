// Central SEO engine — the single source of truth for every production
// SEO output (canonical, robots, OG/Twitter, JSON-LD, sitemap registry).
// Values derive from the route's truth-gated content: pages pass gated
// vars in, this module shapes them. No organizational fact lives here —
// only mechanics (URL normalization, graph shapes, the route registry).
//
// Production domain supplied by the owner (2026-09-06):
// https://ukbanglatigers.co.uk/

/** Canonical production origin. HTTPS, single hostname, no trailing slash. */
export const SITE = 'https://ukbanglatigers.co.uk';

export const SITE_NAME = 'UK Bangla Tigers';

export const LOCALE = 'en-GB';

export interface OgImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * Default social preview image. Rights-approved, client-supplied
 * (MANIFEST.md: 1200x630, crest + wordmark + tagline). Absolute URL —
 * relative og:image URLs are ignored by most crawlers.
 */
export const DEFAULT_OG_IMAGE: OgImage = {
  url: `${SITE}/social-card.jpg`,
  alt: 'UK Bangla Tigers crest, wordmark and tagline',
  width: 1200,
  height: 630,
};

/** Crumb shape mirrors PageBanner's — one model feeds visible crumbs and BreadcrumbList. */
export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Canonical path normalization. Deterministic: root keeps its trailing
 * slash, every other route strips it, no query/hash ever canonicalized.
 */
export function normalizePath(pathname: string): string {
  const clean = pathname.split('?')[0].split('#')[0];
  if (clean.length > 1 && clean.endsWith('/')) return clean.slice(0, -1);
  return clean === '' ? '/' : clean;
}

/** Absolute canonical URL for an indexable route path. */
export function canonicalFor(pathname: string): string {
  return `${SITE}${normalizePath(pathname)}`;
}

/**
 * Route registry — the sitemap generator, the SEO gate, and the SEO tests
 * all read this list, and the SEO tests assert it matches the actual
 * built output, so it cannot drift into a second manual list.
 * `indexable: false` routes must also carry `noindex` on the page.
 */
export interface SeoRoute {
  path: string;
  indexable: boolean;
}

export const SEO_ROUTES: SeoRoute[] = [
  { path: '/', indexable: true },
  { path: '/about', indexable: true },
  { path: '/club-captain', indexable: true },
  { path: '/players', indexable: true },
  { path: '/franchises', indexable: true },
  { path: '/franchises/uppsala-tigers', indexable: true },
  { path: '/tournaments', indexable: true },
  { path: '/news', indexable: true },
  { path: '/community', indexable: true },
  { path: '/coaching', indexable: true },
  { path: '/contact', indexable: true },
  { path: '/faq', indexable: true },
  { path: '/services', indexable: false },
  { path: '/membership', indexable: false },
  { path: '/join', indexable: false },
  // Offline shell (PWA-lite): not public content.
  { path: '/offline', indexable: false },
];

export const ORG_ID = `${SITE}/#organization`;
export const WEBSITE_ID = `${SITE}/#website`;

function orgNode(input: {
  founded: string;
  description: string;
  sameAs: string[];
}): Record<string, unknown> {
  return {
    '@type': 'SportsOrganization',
    '@id': ORG_ID,
    name: SITE_NAME,
    alternateName: 'UKBT',
    url: SITE,
    logo: `${SITE}/brand/crest-512.png`,
    image: DEFAULT_OG_IMAGE.url,
    description: input.description,
    sport: 'Cricket',
    foundingDate: input.founded,
    sameAs: input.sameAs,
  };
}

function webSiteNode(): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE,
    name: SITE_NAME,
    inLanguage: LOCALE,
    publisher: { '@id': ORG_ID },
  };
}

export function breadcrumbItems(
  crumbs: Crumb[],
  pagePath: string,
): Record<string, unknown>[] {
  return crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.label,
    item: c.href ? canonicalFor(c.href) : canonicalFor(pagePath),
  }));
}

function breadcrumbNode(
  crumbs: Crumb[],
  pagePath: string,
): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems(crumbs, pagePath),
  };
}

function webPageNode(input: {
  pagePath: string;
  name: string;
  description?: string;
  type?: string;
}): Record<string, unknown> {
  const url = canonicalFor(input.pagePath);
  const node: Record<string, unknown> = {
    '@type': input.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: input.name,
    isPartOf: { '@id': WEBSITE_ID },
    inLanguage: LOCALE,
  };
  if (input.description) node.description = input.description;
  return node;
}

/**
 * Homepage graph: organization + website + webpage. `founded`,
 * `description` and `sameAs` must be the page's gated vars, not literals.
 */
export function homepageGraph(input: {
  founded: string;
  description: string;
  sameAs: string[];
}): Record<string, unknown>[] {
  const page = webPageNode({
    pagePath: '/',
    name: `${SITE_NAME} — Cricket Club`,
    description: input.description,
  });
  page.about = { '@id': ORG_ID };
  return [
    { '@context': 'https://schema.org', ...orgNode(input) },
    { '@context': 'https://schema.org', ...webSiteNode() },
    { '@context': 'https://schema.org', ...page },
  ];
}

/** About-page graph: AboutPage + breadcrumb, org referenced by @id (never repeated). */
export function aboutGraph(input: {
  description: string;
  crumbs: Crumb[];
}): Record<string, unknown>[] {
  const page = webPageNode({
    pagePath: '/about',
    name: `About Us — ${SITE_NAME}`,
    description: input.description,
    type: 'AboutPage',
  });
  page.about = { '@id': ORG_ID };
  return [
    { '@context': 'https://schema.org', ...page },
    {
      '@context': 'https://schema.org',
      ...breadcrumbNode(input.crumbs, '/about'),
    },
  ];
}

/**
 * Captain-profile graph: ProfilePage + Person + breadcrumb. Only gated
 * facts (name, role) — no DOB, nationality, or stats in schema.
 */
export function captainGraph(input: {
  name: string;
  role: string;
  photo: string;
  crumbs: Crumb[];
}): Record<string, unknown>[] {
  const url = canonicalFor('/club-captain');
  const personId = `${url}#person`;
  const page: Record<string, unknown> = {
    '@type': 'ProfilePage',
    '@id': `${url}#webpage`,
    url,
    name: `${input.name} — ${input.role}, ${SITE_NAME}`,
    isPartOf: { '@id': WEBSITE_ID },
    inLanguage: LOCALE,
    mainEntity: { '@id': personId },
  };
  return [
    { '@context': 'https://schema.org', ...page },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': personId,
      name: input.name,
      jobTitle: input.role,
      url,
      image: `${SITE}${input.photo}`,
      memberOf: { '@id': ORG_ID },
    },
    {
      '@context': 'https://schema.org',
      ...breadcrumbNode(input.crumbs, '/club-captain'),
    },
  ];
}
