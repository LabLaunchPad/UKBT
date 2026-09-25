// Our Franchises page content, bound to @ukbt/truth's gate. The Uppsala
// Tigers squad is real evidence — originally an "Overseas Signings"
// graphic (EV-20260826-030), later a full squad list and country
// corrections (EV-20260831-001/-002), now superseded by the club's own
// "Uppsala Tigers Players & Managements List" (EV-20260831-005/-006),
// which supplies the full 20-player squad (9 overseas signings + 11
// domestic players, three of them U-19) plus team officials. "Nipo
// Khadem" was named for removal from any published squad list by the
// client (EV-20260826-027, CLIENT_REQ_008) and is absent from every
// squad list supplied since — excluded here, not rendered.
//
// Two conflicts resolved, not guessed:
// - Roushan Singh's country had three conflicting values across three
//   documents (Portugal, India, Netherlands) — left UNSET per
//   EV-20260831-006. EV-20260831-008 (his own supplied photo, showing
//   him in a Portugal national jersey — and the photo's own filename)
//   tipped the balance to Portugal: 3 sources agree, 1 each for the
//   other two. Resolved to Portugal on that evidence.
// - Jeremy Martins is on the UK Bangla Tigers master players list
//   (players-data.ts) but NOT on Uppsala Tigers' own squad list, despite
//   being live here previously — removed from this file; see
//   players-data.ts for where he now appears.
//
// `photo`/`photoAlt`: EV-20260831-008, the first roster photography this
// project has. All 20 squad members have one; Dhrubonil Roy's portrait is
// wired from the shared players asset (`/media/players/dhrubonil-roy.webp`,
// EV-20260912-001) rather than a dedicated `uppsala-squad/` file.
// Affiliation with Uppsala Tigers is independently visible in-photo
// (an "UPPSALA TIGERS" kit wordmark/crest) for everyone except Jaspreet
// Singh and Roushan Singh, who are pictured in their national jerseys —
// see apps/web/src/assets/MANIFEST.md's per-photo breakdown.
//
// `role`: owner-verbatim taxonomy for all 20 from the 2026-09-23 owner
// list (EV-20260923-002, registry id EV-0923-02) — roles ONLY; names,
// countries, photos, and spellings untouched (Roushan stays Portugal
// on the Uppsala side).
import {
  type ContentRecord,
  createRegistry,
  evaluate,
  isPublishable,
} from '@ukbt/truth/gate';
import { ContentRecordSchema } from '@ukbt/truth/schema';

const registry = createRegistry([
  { id: 'EV-026', tier: 'T1', url: 'artifacts/evidence/EV-20260826-026.yaml' },
  { id: 'EV-029', tier: 'T1', url: 'artifacts/evidence/EV-20260826-029.yaml' },
  { id: 'EV-030', tier: 'T1', url: 'artifacts/evidence/EV-20260826-030.yaml' },
  {
    id: 'EV-0831-01',
    tier: 'T1',
    url: 'artifacts/evidence/EV-20260831-001.yaml',
  },
  {
    id: 'EV-0831-02',
    tier: 'T1',
    url: 'artifacts/evidence/EV-20260831-002.yaml',
  },
  {
    id: 'EV-0831-05',
    tier: 'T1',
    url: 'artifacts/evidence/EV-20260831-005.yaml',
  },
  {
    id: 'EV-0831-06',
    tier: 'T1',
    url: 'artifacts/evidence/EV-20260831-006.yaml',
  },
  {
    id: 'EV-0831-08',
    tier: 'T1',
    url: 'artifacts/evidence/EV-20260831-008.yaml',
  },
  {
    id: 'EV-0923-02',
    tier: 'T1',
    url: 'artifacts/evidence/EV-20260923-002.yaml',
  },
]);
const exemptFields = new Set<string>();
const twoSourceFields = new Set<string>();
const gateOptions = { registry, exemptFields, twoSourceFields };

export interface SquadMember {
  name: string;
  country?: string;
  role?: string;
  tags?: string[];
  note?: string;
  photo?: string;
  photoAlt?: string;
}

const squad: { field: string; value: SquadMember; sources: string[] }[] = [
  {
    field: 'uppsala.squad.chowdhury',
    value: {
      name: 'Mohammad Chowdhury',
      country: 'England',
      role: 'All-rounder',
      tags: ['Captain', 'Overseas Signing'],
      // Current portrait (client-supplied 2026-09-09; see MANIFEST).
      photo: '/media/uppsala-squad/mohammad-chowdhury-captain.jpg',
    },
    sources: ['EV-030', 'EV-0831-01', 'EV-0831-05', 'EV-0831-08', 'EV-0923-02'],
  },
  {
    field: 'uppsala.squad.hasan',
    value: {
      name: 'Shakib Al Hasan',
      country: 'Bangladesh',
      role: 'All-rounder',
      tags: ['Overseas Signing'],
      note: 'Name spelled per the client corrections document (EV-0831-01); identity not independently asserted.',
      photo: '/media/uppsala-squad/shakib-al-hasan.jpg',
    },
    sources: [
      'EV-030',
      'EV-0831-01',
      'EV-0831-02',
      'EV-0831-05',
      'EV-0831-08',
      'EV-0923-02',
    ],
  },
  {
    field: 'uppsala.squad.singh_karanbir',
    value: {
      name: 'Karanbir Singh',
      country: 'Austria',
      role: 'All-rounder',
      tags: ['Overseas Signing'],
      photo: '/media/uppsala-squad/karanbir-singh.jpg',
    },
    sources: ['EV-0831-01', 'EV-0831-05', 'EV-0831-08', 'EV-0923-02'],
  },
  {
    field: 'uppsala.squad.palmer',
    value: {
      name: 'Owen Palmer',
      country: 'England',
      role: 'Wicket-keeper',
      tags: ['Overseas Signing', 'Wicketkeeper'],
      photo: '/media/uppsala-squad/owen-palmer.jpg',
    },
    sources: ['EV-0831-01', 'EV-0831-05', 'EV-0831-08', 'EV-0923-02'],
  },
  {
    field: 'uppsala.squad.butt',
    value: {
      name: 'Shaheryar Butt',
      country: 'Belgium',
      role: 'Batsman',
      tags: ['Overseas Signing'],
      photo: '/media/uppsala-squad/shaheryar-butt.jpg',
    },
    sources: ['EV-030', 'EV-0831-05', 'EV-0831-08', 'EV-0923-02'],
  },
  {
    field: 'uppsala.squad.potgieter',
    value: {
      name: 'Chad Potgieter',
      country: 'South Africa',
      role: 'Batsman',
      tags: ['Overseas Signing'],
      photo: '/media/uppsala-squad/chad-potgieter.jpg',
    },
    sources: [
      'EV-030',
      'EV-0831-01',
      'EV-0831-02',
      'EV-0831-05',
      'EV-0831-08',
      'EV-0923-02',
    ],
  },
  {
    field: 'uppsala.squad.singh_roushan',
    value: {
      name: 'Roushan Singh',
      country: 'Portugal',
      role: 'Wicket-keeper',
      tags: ['Overseas Signing', 'Wicketkeeper'],
      note: 'Country was unconfirmed across three conflicting documents (Portugal/India/Netherlands); resolved to Portugal once his own supplied photo (national jersey reading "PORTUGAL") and its filename both corroborated it (EV-0831-08).',
      photo: '/media/uppsala-squad/roushan-singh.jpg',
    },
    sources: [
      'EV-0831-01',
      'EV-0831-05',
      'EV-0831-06',
      'EV-0831-08',
      'EV-0923-02',
    ],
  },
  {
    field: 'uppsala.squad.singh_jaspreet',
    value: {
      name: 'Jaspreet Singh',
      country: 'Italy',
      role: 'Bowler',
      tags: ['Overseas Signing'],
      photo: '/media/uppsala-squad/jaspreet-singh.jpg',
    },
    sources: ['EV-0831-01', 'EV-0831-05', 'EV-0831-08', 'EV-0923-02'],
  },
  {
    field: 'uppsala.squad.randhawa',
    value: {
      name: 'Armaan Randhawa',
      country: 'Austria',
      role: 'Batsman',
      tags: ['Overseas Signing'],
      photo: '/media/uppsala-squad/armaan-randhawa.jpg',
    },
    sources: ['EV-0831-01', 'EV-0831-05', 'EV-0831-08', 'EV-0923-02'],
  },
  {
    field: 'uppsala.squad.stanigze',
    value: {
      name: 'Jawid Stanigze',
      country: 'Afghanistan',
      role: 'All-rounder',
      photo: '/media/uppsala-squad/jawid-stanigze.jpg',
    },
    sources: ['EV-0831-05', 'EV-0831-08', 'EV-0923-02'],
  },
  {
    field: 'uppsala.squad.rajapaksha',
    value: {
      name: 'Chinthaka Rajapaksha',
      country: 'Sri Lanka',
      role: 'All-rounder',
      photo: '/media/uppsala-squad/chinthaka-rajapaksha.jpg',
    },
    sources: ['EV-0831-05', 'EV-0831-08', 'EV-0923-02'],
  },
  {
    field: 'uppsala.squad.hussain',
    value: {
      name: 'Tasaduq Hussain',
      country: 'Sweden',
      role: 'Bowler',
      photo: '/media/uppsala-squad/tasaduq-hussain.jpg',
    },
    sources: ['EV-0831-05', 'EV-0831-08', 'EV-0923-02'],
  },
  {
    field: 'uppsala.squad.momand',
    value: {
      name: 'Lemar Momand',
      country: 'Afghanistan',
      role: 'Bowler',
      photo: '/media/uppsala-squad/lemar-momand.jpg',
    },
    sources: ['EV-0831-05', 'EV-0831-08', 'EV-0923-02'],
  },
  {
    field: 'uppsala.squad.jyoti',
    value: {
      name: 'Humayun Kabir Jyoti',
      country: 'USA',
      role: 'Wicket-keeper',
      tags: ['Wicketkeeper'],
      photo: '/media/uppsala-squad/humayun-kabir-jyoti.jpg',
    },
    sources: ['EV-0831-05', 'EV-0831-08', 'EV-0923-02'],
  },
  {
    field: 'uppsala.squad.shukla',
    value: {
      name: 'Prashant Shukla',
      country: 'India',
      role: 'Bowler',
      photo: '/media/uppsala-squad/prashant-shukla.jpg',
    },
    sources: ['EV-0831-05', 'EV-0831-08', 'EV-0923-02'],
  },
  {
    field: 'uppsala.squad.afzal',
    value: {
      name: 'Qudratullah Mir Afzal',
      country: 'Sweden',
      role: 'Bowler',
      photo: '/media/uppsala-squad/qudratullah-mir-afzal.jpg',
    },
    sources: ['EV-0831-05', 'EV-0831-08', 'EV-0923-02'],
  },
  {
    field: 'uppsala.squad.mahmood',
    value: {
      name: 'Hamid Mahmood',
      country: 'Sweden',
      role: 'Bowler',
      photo: '/media/uppsala-squad/hamid-mahmood.jpg',
    },
    sources: ['EV-0831-05', 'EV-0831-08', 'EV-0923-02'],
  },
  {
    field: 'uppsala.squad.zaheer',
    value: {
      name: 'Anas Zaheer',
      country: 'Sweden',
      role: 'Bowler',
      tags: ['U-19'],
      photo: '/media/uppsala-squad/anas-zaheer.jpg',
    },
    sources: ['EV-0831-05', 'EV-0831-08', 'EV-0923-02'],
  },
  {
    field: 'uppsala.squad.farooq',
    value: {
      name: 'Essa Farooq',
      country: 'Sweden',
      role: 'Bowler',
      tags: ['U-19'],
      photo: '/media/uppsala-squad/essa-farooq.jpg',
    },
    sources: ['EV-0831-05', 'EV-0831-08', 'EV-0923-02'],
  },
  {
    field: 'uppsala.squad.roy',
    value: {
      name: 'Dhrubonil Roy',
      country: 'Sweden',
      role: 'Bowler',
      tags: ['U-19'],
      photo: '/media/players/dhrubonil-roy.webp',
    },
    sources: ['EV-0831-05', 'EV-0923-02'],
  },
  // "Nipo Khadem" deliberately excluded — CLIENT_REQ_008.
];

for (const r of squad) {
  // RM-5: Zod-validated, not just TS-shaped — see provenance.ts's
  // ContentRecordSchema doc comment.
  const rec = ContentRecordSchema.parse({
    field: r.field,
    value: r.value,
    // U-23 closed 2026-09-23: owner approval EV-20260923-001
    // (Lablaunchpad/admin, all-current-facts, amendable) — approved, not
    // published (TRUTH-CONTRACT.md keeps approval and going live separate).
    status: 'approved',
    sources: r.sources,
    approver: 'Lablaunchpad (admin, 2026-09-23, EV-20260923-001)',
  }) as ContentRecord;
  // Production render boundary (contracts/TRUTH-CONTRACT.md, docs/adr-001):
  // only approved/published records may publish. Dev keeps evidence-valid
  // evaluate() so pending_review content stays reviewable.
  const result = import.meta.env.PROD
    ? isPublishable(rec, gateOptions)
    : evaluate(rec, gateOptions);
  if (!result.passed) {
    throw new Error(
      `Truth gate failed for '${rec.field}': ${result.reasons.map((r2) => `${r2.rule}: ${r2.detail}`).join('; ')}`,
    );
  }
}

export const uppsalaSquad: SquadMember[] = squad.map((r) => r.value);
export const uppsalaOverseasSignings: SquadMember[] = uppsalaSquad.filter((m) =>
  m.tags?.includes('Overseas Signing'),
);

export interface TeamOfficial {
  role: string;
  name: string;
  photo?: string;
  photoAlt?: string;
}

// EV-20260831-005 — "Uppsala Tigers Players & Managements List".
// Photos: EV-20260831-008. Only the Coach is pictured in Uppsala Tigers
// kit; the other three officials' photos show no team clothing/branding
// — affiliation there rests on the client's own naming, not on this
// project's independent visual confirmation (MANIFEST.md's breakdown).
export const uppsalaOfficials: TeamOfficial[] = [
  {
    role: 'Coach',
    name: 'Shaftab Khalid',
    photo: '/media/uppsala-squad/shaftab-khalid.jpg',
  },
  {
    role: 'Team Manager',
    name: 'AGM Sabbir',
    photo: '/media/uppsala-squad/agm-sabbir.jpg',
  },
  {
    role: 'Logistics Manager',
    name: 'MD Ashraful Alam',
    photo: '/media/uppsala-squad/md-ashraful-alam.jpg',
  },
  {
    role: 'Team Mentor',
    name: 'Javed Butt',
    photo: '/media/uppsala-squad/javed-butt.jpg',
  },
];

// EV-20260926-001 — owner-supplied intro copy (2026-09-26 instruction):
// Uppsala as the owned-and-managed franchise side, participating in
// the Nordic Smash T20. Replaces the "Based in Sweden" / past-tense
// "Competed in..." facts. The ICC-approval, Stockholm-venue, and
// 15-20 June 2026 date sub-claims rest on that client instruction
// alone (STATED_BUT_UNVERIFIED); see the record's KNOWN TENSION note
// re tournaments-data.ts, which is deliberately untouched.
export const uppsalaFacts = [
  {
    title: 'Nordic Smash T20',
    body: 'Uppsala Tigers is a franchise team, owned and managed by UK Bangla Tigers, to participate in the inaugural ICC approved franchise tournament in Stockholm, Sweden called Nordic Smash T20 to be held on the 15th till 20th of June 2026.',
  },
];

// The Our Franchises landing (/franchises) is a card grid, one entry per
// sister franchise, per the client's instruction that Uppsala Tigers sit
// under a clickable "Our Franchise" list "in future there will be more in
// the list" (EV-0831-01/EV-0831-02). Only Uppsala Tigers is evidenced
// today — this list is not pre-populated with any invented future entry.
//
// `logo` is Uppsala Tigers' own supplied crest (EV-20260831-004,
// apps/web/src/assets/MANIFEST.md), replacing the UK Bangla Tigers crest
// this page and the detail page fell back to before it was supplied.
export interface FranchiseSummary {
  slug: string;
  name: string;
  country: string;
  blurb: string;
  logo: string;
  logoAlt: string;
}

export const ourFranchises: FranchiseSummary[] = [
  {
    slug: 'uppsala-tigers',
    name: 'Uppsala Tigers',
    country: 'Sweden',
    blurb: "UK Bangla Tigers' sister franchise, competing internationally.",
    logo: '/brand/uppsala-tigers-crest.jpg',
    logoAlt: 'Uppsala Tigers crest',
  },
];
