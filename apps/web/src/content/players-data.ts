// Players Profile page content, bound to @ukbt/truth's gate. The roster
// combines two owner supplies: the 42-name "Players Profile" / "List Of
// Players" document (EV-20260831-005, explicitly about the club's
// players) and the 2026-09-12 photo drop — 59 portraits plus the
// "Players & Managements List" PDF (EV-20260912-001: 20 players with
// Captain/Wk/U-19/country roles, 4 team officials). Owner direction:
// use all pictures as UK Bangla Tigers players with picture and name,
// roles from the PDF, new filename spellings win over the older roster
// (Juan Henry, Kennar Lewis, Peter Robert, Mark James).
//
// Result: 58 players (42 existing, 4 renamed, 16 new from filenames)
// + 4 officials. 50 players + 4 officials pictured (uniform 320px
// WebP thumbnails, `public/media/players/`); 8 names without photos
// stay text-only per CLIENT_REQ_006 — no placeholder silhouettes.
// One supplied file carries no name and is never rendered.
// Role + country for all 58 are owner-verbatim from the 2026-09-23 owner
// list (EV-20260923-002, supersedes EV-20260911-002's taxonomy ban).
// Renames applied: Kenner Lewis, Hamid Mehmood, Ellias Sunny, Abu Bakar,
// Sibet Ahmed. Humayun kabir Jyoti case + Srilanka/Sri lanka/Netherands
// spellings kept verbatim — never normalize.
// Individual full profiles (bio, stats) remain UNKNOWN and are stated
// as such rather than invented; no stats tables, no quotations.
import {
  type ContentRecord,
  createRegistry,
  evaluate,
  isPublishable,
} from '@ukbt/truth/gate';
import { ContentRecordSchema } from '@ukbt/truth/schema';

const registry = createRegistry([
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
    id: 'EV-20260912-001',
    tier: 'T1',
    url: 'artifacts/evidence/EV-20260912-001.yaml',
  },
  {
    id: 'EV-20260911-002',
    tier: 'T1',
    url: 'artifacts/evidence/EV-20260911-002.yaml',
  },
  {
    id: 'EV-20260923-002',
    tier: 'T1',
    url: 'artifacts/evidence/EV-20260923-002.yaml',
  },
]);
const exemptFields = new Set<string>();
const twoSourceFields = new Set<string>();
const gateOptions = { registry, exemptFields, twoSourceFields };

export interface RosterPlayer {
  name: string;
  country?: string;
  role?: string;
  tags?: string[];
  note?: string;
  photo?: string;
  photoAlt?: string;
}

// field-name-safe slug for each player, used only as the truth-gate
// record key — not rendered.
function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const UPPSALA_TAG = 'Also plays for Uppsala Tigers';
const WK_TAG = 'Wicket-keeper';
const U19_TAG = 'U-19';
// All-Rounder tag legacy (EV-20260911-002 named only Chowdhury + Shakib).
// Owner list 2026-09-23 (EV-20260923-002) supersedes that taxonomy ban:
// `role` now carries the owner-verbatim taxonomy for all 58. Tags below
// are intentionally untouched display markers (T3/T4 territory), not truth.
const AR_TAG = 'All-Rounder';

interface RawPlayer {
  name: string;
  country?: string;
  /** owner-verbatim taxonomy 2026-09-23 (EV-20260923-002) */
  role?: string;
  alsoUppsala?: boolean;
  wicketKeeper?: boolean;
  under19?: boolean;
  /** true only for Mohammad Chowdhury and Shakib Al Hasan (EV-20260911-002) */
  allRounder?: boolean;
  /** matches apps/web/public/media/players/<slug>.webp (EV-20260912-001 set) */
  photoSlug?: string;
  /** true for the 16 names known only from the 2026-09-12 photo drop
     (absent from the 42-name document) — sourced to the new EV only */
  newFromPhotos?: boolean;
}

const rawRoster: RawPlayer[] = [
  {
    name: 'Mohammad Chowdhury',
    country: 'England',
    role: 'All-rounder',
    alsoUppsala: true,
    allRounder: true,
    photoSlug: 'mohammad-chowdhury',
  },
  {
    name: 'Shakib Al Hasan',
    country: 'Bangladesh',
    role: 'All-rounder',
    alsoUppsala: true,
    allRounder: true,
    photoSlug: 'shakib-al-hasan',
  },
  { name: 'Mark James', country: 'England', role: 'All-rounder', photoSlug: 'mark-james' },
  {
    name: 'Karanbir Singh',
    country: 'Austria',
    role: 'All-rounder',
    alsoUppsala: true,
    photoSlug: 'karanbir-singh',
  },
  { name: 'Wayne Parnel', country: 'South Africa', role: 'Bowler', photoSlug: 'wayne-parnel' },
  { name: 'Junaid Siddique', country: 'Canada', role: 'Bowler', photoSlug: 'junaid-siddique' },
  {
    name: 'Owen Palmer',
    country: 'England',
    role: 'Wicket-keeper',
    alsoUppsala: true,
    wicketKeeper: true,
    photoSlug: 'owen-palmer',
  },
  {
    name: 'Shaheryar Butt',
    country: 'Belgium',
    role: 'Batsman',
    alsoUppsala: true,
    photoSlug: 'shaheryar-butt',
  },
  {
    name: 'Chad Potgieter',
    country: 'South Africa',
    role: 'Batsman',
    alsoUppsala: true,
    photoSlug: 'chad-potgieter',
  },
  {
    name: 'Roushan Singh',
    country: 'Netherlands',
    role: 'Wicket-keeper',
    alsoUppsala: true,
    wicketKeeper: true,
    photoSlug: 'roushan-singh',
  },
  { name: 'Juan Henry', country: 'Portugal', role: 'All-rounder', photoSlug: 'juan-henry' },
  {
    name: 'Shabbir Rahman',
    country: 'Bangladesh',
    role: 'Batsman',
    photoSlug: 'shabbir-rahman',
  },
  { name: 'Kenner Lewis', country: 'West Indies', role: 'Batsman', photoSlug: 'kenner-lewis' },
  {
    name: 'Jaspreet Singh',
    country: 'Italy',
    role: 'Bowler',
    alsoUppsala: true,
    photoSlug: 'jaspreet-singh',
  },
  { name: 'Peter Robert', country: 'England', role: 'Batsman', photoSlug: 'peter-robert' },
  { name: 'Amahl Nathaniel', country: 'West Indies', role: 'Batsman' },
  {
    name: 'Armaan Randhawa',
    country: 'Austria',
    role: 'Batsman',
    alsoUppsala: true,
    photoSlug: 'armaan-randhawa',
  },
  { name: 'Sufyan Mehmood', country: 'Oman', role: 'All-rounder', photoSlug: 'sufyan-mehmood' },
  { name: 'Arafat Bhuiyan', country: 'England', role: 'Bowler', photoSlug: 'arafat-bhuiyan' },
  {
    name: 'Jawid Stanigze',
    country: 'Afghanistan',
    role: 'All-rounder',
    alsoUppsala: true,
    photoSlug: 'jawid-stanigze',
  },
  { name: 'Rajesh Sharma', country: 'India', role: 'All-rounder' },
  {
    name: 'Chinthaka Rajapaksha',
    country: 'Srilanka',
    role: 'All-rounder',
    alsoUppsala: true,
    photoSlug: 'chinthaka-rajapaksha',
  },
  { name: 'Ellias Sunny', country: 'Bangladesh', role: 'Bowler', photoSlug: 'ellias-sunny' },
  { name: 'Ruman Ahmed', country: 'Bangladesh', role: 'Batsman' },
  { name: 'Forhad Reza', country: 'Bangladesh', role: 'All-rounder', photoSlug: 'forhad-reza' },
  {
    name: 'Tasaduq Hussain',
    country: 'Sweden',
    role: 'Bowler',
    alsoUppsala: true,
    photoSlug: 'tasaduq-hussain',
  },
  { name: 'Tawfique Khan Tushar', country: 'Bangladesh', role: 'Batsman' },
  {
    name: 'Lemar Momand',
    country: 'Afghanistan',
    role: 'Bowler',
    alsoUppsala: true,
    photoSlug: 'lemar-momand',
  },
  {
    name: 'Humayun kabir Jyoti',
    country: 'USA',
    role: 'Wicket-keeper',
    alsoUppsala: true,
    wicketKeeper: true,
    photoSlug: 'humayun-kabir-jyoti',
  },
  { name: 'Raminda Wijesooriya', country: 'Sri lanka', role: 'Batsman' },
  { name: 'Towker Khan', country: 'USA', role: 'All-rounder', photoSlug: 'towker-khan' },
  {
    name: 'Prashant Shukla',
    country: 'India',
    role: 'Bowler',
    alsoUppsala: true,
    photoSlug: 'prashant-shukla',
  },
  { name: 'Anop Ravi', country: 'Canada', role: 'Wicket-keeper' },
  {
    name: 'Qudratullah Mir Afzal',
    country: 'Sweden',
    role: 'Bowler',
    alsoUppsala: true,
    photoSlug: 'qudratullah-mir-afzal',
  },
  { name: 'Elliot Green', country: 'England', role: 'Bowler' },
  {
    name: 'Hamid Mehmood',
    country: 'Sweden',
    role: 'Bowler',
    alsoUppsala: true,
    photoSlug: 'hamid-mehmood',
  },
  {
    name: 'Anas Zaheer',
    country: 'Sweden',
    role: 'Bowler',
    alsoUppsala: true,
    under19: true,
    photoSlug: 'anas-zaheer',
  },
  {
    name: 'Essa Farooq',
    country: 'Sweden',
    role: 'Bowler',
    alsoUppsala: true,
    under19: true,
    photoSlug: 'essa-farooq',
  },
  {
    name: 'Dhrubonil Roy',
    country: 'Sweden',
    role: 'Bowler',
    alsoUppsala: true,
    under19: true,
    photoSlug: 'dhrubonil-roy',
  },
  { name: 'Dhavalkumar Norotam', country: 'Portugal', role: 'All-rounder' },
  { name: 'Musa Ahmad', country: 'Netherands', role: 'Batsman', photoSlug: 'musa-ahmad' },
  { name: 'Jeremy Martins', country: 'Portugal', role: 'Bowler', photoSlug: 'jeremy-martins' }, // NOT on Uppsala's own squad list — EV-0831-06
  { name: 'Abu Bakar', country: 'UAE', role: 'Bowler', newFromPhotos: true, photoSlug: 'abu-bakar' },
  {
    name: 'Asif Taniwal',
    country: 'Afghanistan',
    role: 'Batsman',
    newFromPhotos: true,
    photoSlug: 'asif-taniwal',
  },
  { name: 'Ayyan Warraich', country: 'Germany', role: 'Bowler', newFromPhotos: true, photoSlug: 'ayyan-warraich' },
  {
    name: 'CP Rizwan',
    country: 'UAE',
    role: 'All-rounder',
    newFromPhotos: true,
    photoSlug: 'cp-rizwan',
  },
  {
    name: 'Danish Sarhadi',
    country: 'UAE',
    role: 'Wicket-keeper',
    newFromPhotos: true,
    photoSlug: 'danish-sarhadi',
  },
  {
    name: 'Ibrahim Maqsood',
    country: 'UAE',
    role: 'Bowler',
    newFromPhotos: true,
    photoSlug: 'ibrahim-maqsood',
  },
  {
    name: 'Ibrar Ahmed',
    country: 'UAE',
    role: 'Bowler',
    newFromPhotos: true,
    photoSlug: 'ibrar-ahmed',
  },
  {
    name: 'Jack Jakir',
    country: 'England',
    role: 'Bowler',
    newFromPhotos: true,
    photoSlug: 'jack-jakir',
  },
  {
    name: 'Junaid Shamsu',
    country: 'UAE',
    role: 'All-rounder',
    newFromPhotos: true,
    photoSlug: 'junaid-shamsu',
  },
  {
    name: 'Krish Anand',
    country: 'England',
    role: 'Bowler',
    newFromPhotos: true,
    photoSlug: 'krish-anand',
  },
  {
    name: 'Muhsin Ali',
    country: 'England',
    role: 'Batsman',
    newFromPhotos: true,
    photoSlug: 'muhsin-ali',
  },
  {
    name: 'Saghir Ahmad',
    country: 'UAE',
    role: 'All-rounder',
    newFromPhotos: true,
    photoSlug: 'saghir-ahmad',
  },
  { name: 'Sibet Ahmed', country: 'England', role: 'All-rounder', newFromPhotos: true, photoSlug: 'sibet-ahmed' },
  {
    name: 'Syed Aziz',
    country: 'Scotland',
    role: 'All-rounder',
    newFromPhotos: true,
    photoSlug: 'syed-aziz',
  },
  { name: 'Taimoor Ali', country: 'UAE', role: 'Batsman', newFromPhotos: true, photoSlug: 'taimoor-ali' },
  {
    name: 'Zohair Iqbal',
    country: 'UAE',
    role: 'Bowler',
    newFromPhotos: true,
    photoSlug: 'zohair-iqbal',
  },
];

interface RawOfficial {
  name: string;
  role: string;
  photoSlug: string;
}

// Team Officials from the PDF list (EV-20260912-001) — rendered as a
// separate block on /players, same card component, role line instead
// of country (staff have no playing country).
const rawOfficials: RawOfficial[] = [
  { name: 'Shaftab Khalid', role: 'Coach', photoSlug: 'shaftab-khalid' },
  { name: 'AGM Sabbir', role: 'Team Manager', photoSlug: 'agm-sabbir' },
  {
    name: 'MD Ashraful Alam',
    role: 'Logistics Manager',
    photoSlug: 'md-ashraful-alam',
  },
  { name: 'Javed Butt', role: 'Team Mentor', photoSlug: 'javed-butt' },
];

function tagsFor(p: RawPlayer): string[] | undefined {
  const tags: string[] = [];
  if (p.alsoUppsala) tags.push(UPPSALA_TAG);
  if (p.wicketKeeper) tags.push(WK_TAG);
  if (p.under19) tags.push(U19_TAG);
  if (p.allRounder) tags.push(AR_TAG);
  return tags.length > 0 ? tags : undefined;
}

function gateRecords(
  entries: { field: string; value: RosterPlayer; sources: string[] }[],
) {
  for (const r of entries) {
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
}

const roster: { field: string; value: RosterPlayer; sources: string[] }[] =
  rawRoster.map((p) => ({
    field: `players.roster.${slug(p.name)}`,
    value: {
      name: p.name,
      country: p.country,
      role: p.role,
      tags: tagsFor(p),
      note:
        p.name === 'Roushan Singh'
          ? 'Country was unconfirmed across three conflicting documents; owner list 2026-09-23 corrects it to Netherlands (EV-20260923-002).'
          : undefined,
      photo: p.photoSlug ? `/media/players/${p.photoSlug}.webp` : undefined,
      photoAlt: p.photoSlug ? `${p.name} — UK Bangla Tigers` : undefined,
    },
    sources: [
      ...(p.newFromPhotos
        ? ['EV-20260912-001']
        : p.photoSlug
          ? ['EV-0831-05', 'EV-20260912-001']
          : ['EV-0831-05']),
      // The All-Rounder tag on the two EV-20260911-002 players carries
      // its own source; every roster record additionally cites EV-20260923-002
      // (owner-verbatim role+country for all 58).
      ...(p.allRounder ? ['EV-20260911-002'] : []),
      'EV-20260923-002',
    ],
  }));

gateRecords(roster);

const officials: { field: string; value: RosterPlayer; sources: string[] }[] =
  rawOfficials.map((o) => ({
    field: `players.officials.${slug(o.name)}`,
    value: {
      name: o.name,
      role: o.role,
      photo: `/media/players/${o.photoSlug}.webp`,
      photoAlt: `${o.name} — UK Bangla Tigers ${o.role}`,
    },
    sources: ['EV-20260912-001'],
  }));

gateRecords(officials);

export const fullRoster: RosterPlayer[] = roster.map((r) => r.value);
export const teamOfficials: RosterPlayer[] = officials.map((o) => o.value);
