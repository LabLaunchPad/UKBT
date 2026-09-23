// Homepage content bound to @ukbt/truth's gate — every organizational
// fact below is checked against T1-T8 at build time, not hard-coded past
// the truth architecture. Status is 'pending_review' throughout: this is
// a first visual-review build (Stage 7G), not a formally approved
// publication — 'approved'/'published' require a named human approver
// (T6), which does not yet exist. See artifacts/brand/UKBT-BRAND-FOUNDATION.md
// and artifacts/pages/HOMEPAGE-CONTRACT.md for the decisions this data reflects.
import { type ContentRecord, createRegistry, evaluate } from '@ukbt/truth/gate';
import { ContentRecordSchema } from '@ukbt/truth/schema';
import { captainPhoto } from './captain-data';
import { primaryCta, primaryNav, secondaryNav } from './navigation-data';

const registry = createRegistry([
  { id: 'EV-026', tier: 'T1', url: 'artifacts/evidence/EV-20260826-026.yaml' },
  { id: 'EV-028', tier: 'T2', url: 'artifacts/evidence/EV-20260826-028.yaml' },
  { id: 'EV-029', tier: 'T1', url: 'artifacts/evidence/EV-20260826-029.yaml' },
  { id: 'EV-030', tier: 'T1', url: 'artifacts/evidence/EV-20260826-030.yaml' },
  {
    id: 'EV-0909-01',
    tier: 'T1',
    url: 'artifacts/evidence/EV-20260909-001.yaml',
  },
]);

const exemptFields = new Set([
  'nav.home',
  'nav.about',
  'nav.captain',
  'nav.players',
  'nav.franchises',
  'nav.tournaments',
  'nav.contact',
  'cta.primary.label',
]);

// Tagline is corroborated by two independent sources (EV-028 WebSearch,
// EV-029 client image) — genuinely, not nominally, so it's the one field
// held to T7's two-distinct-source rule.
const twoSourceFields = new Set(['org.tagline']);

interface Fact<T> {
  field: string;
  value: T;
  sources: string[];
}

// RM-5 (contracts/DEPLOYMENT-CONTRACT.md; see provenance.ts's
// ContentRecordSchema doc comment): Zod-validated, not just TS-shaped.
function record(f: Fact<unknown>): ContentRecord {
  // `as ContentRecord`: Zod already validated every field at runtime above;
  // the cast reconciles a TS quirk where `z.unknown()` makes `value`
  // structurally optional (unknown includes undefined) even though the
  // object literal always supplies it.
  return ContentRecordSchema.parse({
    field: f.field,
    value: f.value,
    status: 'pending_review',
    sources: f.sources,
  }) as ContentRecord;
}

const facts = {
  taglineLong: {
    field: 'org.tagline',
    value: 'We are not only a team, but also an institute for learning.',
    sources: ['EV-028', 'EV-029'],
  },
  taglineShort: {
    field: 'org.tagline_short',
    value: 'United by Passion. Driven by Cricket.',
    sources: ['EV-030'],
  },
  statPlayers: {
    field: 'org.stat_players',
    value: '40+',
    sources: ['EV-026', 'EV-0909-01'],
  },
  statCountries: {
    field: 'org.stat_countries',
    value: '15+',
    sources: ['EV-026'],
  },
  statTournaments: {
    field: 'org.stat_tournaments',
    value: '7+',
    sources: ['EV-026'],
  },
  founded: { field: 'org.founded', value: '2020', sources: ['EV-029'] },
  captainName: {
    field: 'org.captain_name',
    value: 'Mohammad Chowdhury',
    sources: ['EV-026', 'EV-029'],
  },
  captainRole: {
    field: 'org.captain_role',
    value: 'Founder & CEO, Club Captain',
    sources: ['EV-029', 'EV-026'],
  },
  franchiseName: {
    field: 'org.sister_franchise',
    value: 'Uppsala Tigers',
    sources: ['EV-026', 'EV-029'],
  },
} satisfies Record<string, Fact<string>>;

const tournamentUpcoming = [
  {
    name: 'Nordic Lights',
    when: 'September 2026',
    where: 'Norway',
    field: 'org.tournament.nordic_lights',
    sources: ['EV-026'],
  },
  {
    name: 'Global T20 Championship',
    when: 'October 2026',
    where: 'Romania',
    field: 'org.tournament.global_t20',
    sources: ['EV-026'],
  },
];

const socialLinks = [
  {
    platform: 'facebook',
    url: 'https://www.facebook.com/UKBanglaTigers',
    field: 'org.social.facebook',
    sources: ['EV-026'],
  },
  {
    platform: 'instagram',
    url: 'https://www.instagram.com/ukbanglatigers/',
    field: 'org.social.instagram',
    sources: ['EV-026'],
  },
  {
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@uk.bangla.tigers',
    field: 'org.social.tiktok',
    sources: ['EV-026'],
  },
  {
    platform: 'x',
    url: 'https://x.com/ukbanglatigers',
    field: 'org.social.x',
    sources: ['EV-026'],
  },
];

const gateOptions = { registry, exemptFields, twoSourceFields };

// Fail-closed: any org-fact that doesn't pass the truth gate stops the
// build rather than silently rendering. Real enforcement, not a comment.
const allRecords: ContentRecord[] = [
  ...Object.values(facts).map((f) => record(f)),
  ...tournamentUpcoming.map((t) =>
    record({ field: t.field, value: t, sources: t.sources }),
  ),
  ...socialLinks.map((s) =>
    record({ field: s.field, value: s, sources: s.sources }),
  ),
];

for (const rec of allRecords) {
  const result = evaluate(rec, gateOptions);
  if (!result.passed) {
    throw new Error(
      `Truth gate failed for '${rec.field}': ${result.reasons.map((r) => `${r.rule}: ${r.detail}`).join('; ')}`,
    );
  }
}

export const homepage = {
  tagline: facts.taglineLong.value,
  taglineShort: facts.taglineShort.value,
  // HOMEPAGE-CONTRACT.md assigns the founding year to "Club introduction"
  // (ClubIntro.astro) specifically — Stage 8 red team F2 found it was
  // rendering only inside WhyChooseUs, a section outside the frozen
  // structure, so it would have silently vanished if that section were
  // ever removed. Same gated fact as about-data.ts's org.founded.
  founded: facts.founded.value,
  stats: {
    players: facts.statPlayers.value,
    countries: facts.statCountries.value,
    tournaments: facts.statTournaments.value,
  },
  captain: {
    name: facts.captainName.value,
    role: facts.captainRole.value,
    photo: captainPhoto,
  },
  sisterFranchise: facts.franchiseName.value,
  upcomingTournaments: tournamentUpcoming,
  social: socialLinks,
  primaryCta,
  secondaryNav,
  nav: primaryNav,
};

// Club contact channels — client-supplied directly (chat 2026-09-09),
// rendered as mailto:/tel: links. Plain export, not truth-gated:
// contact strings are client-provided literals like the captain
// profile URLs (captain-data.ts), not org facts requiring evidence.
export const contact = {
  email: 'info@ukbanglatigers.co.uk',
  phoneDisplay: '+44 7827 627997',
  phoneHref: 'tel:+447827627997',
};
