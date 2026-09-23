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
// Individual full profiles (bio, stats) remain UNKNOWN and are stated
// as such rather than invented; no stats tables, no quotations.
import { type ContentRecord, createRegistry, evaluate } from '@ukbt/truth/gate';
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
// All-Rounder is a verified tag ONLY for the two players named in
// EV-20260911-002 (client direction 2026-09-11; Chowdhury additionally
// corroborated by his gated batting+bowling styles). It must never be
// set for any other player without its own evidenced record.
const AR_TAG = 'All-Rounder';

interface RawPlayer {
  name: string;
  country?: string;
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
    alsoUppsala: true,
    allRounder: true,
    photoSlug: 'mohammad-chowdhury',
  },
  {
    name: 'Shakib Al Hasan',
    country: 'Bangladesh',
    alsoUppsala: true,
    allRounder: true,
    photoSlug: 'shakib-al-hasan',
  },
  { name: 'Mark James', country: 'England', photoSlug: 'mark-james' },
  {
    name: 'Karanbir Singh',
    country: 'Austria',
    alsoUppsala: true,
    photoSlug: 'karanbir-singh',
  },
  { name: 'Wayne Parnel', country: 'South Africa', photoSlug: 'wayne-parnel' },
  { name: 'Junaid Siddique', country: 'Canada', photoSlug: 'junaid-siddique' },
  {
    name: 'Owen Palmer',
    country: 'England',
    alsoUppsala: true,
    wicketKeeper: true,
    photoSlug: 'owen-palmer',
  },
  {
    name: 'Shaheryar Butt',
    country: 'Belgium',
    alsoUppsala: true,
    photoSlug: 'shaheryar-butt',
  },
  {
    name: 'Chad Potgieter',
    country: 'South Africa',
    alsoUppsala: true,
    photoSlug: 'chad-potgieter',
  },
  {
    name: 'Roushan Singh',
    country: 'Portugal',
    alsoUppsala: true,
    wicketKeeper: true,
    photoSlug: 'roushan-singh',
  },
  { name: 'Juan Henry', country: 'Portugal', photoSlug: 'juan-henry' },
  {
    name: 'Shabbir Rahman',
    country: 'Bangladesh',
    photoSlug: 'shabbir-rahman',
  },
  { name: 'Kennar Lewis', country: 'West Indies', photoSlug: 'kennar-lewis' },
  {
    name: 'Jaspreet Singh',
    country: 'Italy',
    alsoUppsala: true,
    photoSlug: 'jaspreet-singh',
  },
  { name: 'Peter Robert', country: 'England', photoSlug: 'peter-robert' },
  { name: 'Amahl Nathaniel', country: 'West Indies' },
  {
    name: 'Armaan Randhawa',
    country: 'Austria',
    alsoUppsala: true,
    photoSlug: 'armaan-randhawa',
  },
  { name: 'Sufyan Mehmood', country: 'Oman', photoSlug: 'sufyan-mehmood' },
  { name: 'Arafat Bhuiyan', country: 'England', photoSlug: 'arafat-bhuiyan' },
  {
    name: 'Jawid Stanigze',
    country: 'Afghanistan',
    alsoUppsala: true,
    photoSlug: 'jawid-stanigze',
  },
  { name: 'Rajesh Sharma', country: 'India' },
  {
    name: 'Chinthaka Rajapaksha',
    country: 'Sri Lanka',
    alsoUppsala: true,
    photoSlug: 'chinthaka-rajapaksha',
  },
  { name: 'Elias Sunny', country: 'Bangladesh', photoSlug: 'elias-sunny' },
  { name: 'Ruman Ahmed', country: 'Bangladesh' },
  { name: 'Forhad Reza', country: 'Bangladesh', photoSlug: 'forhad-reza' },
  {
    name: 'Tasaduq Hussain',
    country: 'Sweden',
    alsoUppsala: true,
    photoSlug: 'tasaduq-hussain',
  },
  { name: 'Tawfique Khan Tushar', country: 'Bangladesh' },
  {
    name: 'Lemar Momand',
    country: 'Afghanistan',
    alsoUppsala: true,
    photoSlug: 'lemar-momand',
  },
  {
    name: 'Humayun Kabir Jyoti',
    country: 'USA',
    alsoUppsala: true,
    wicketKeeper: true,
    photoSlug: 'humayun-kabir-jyoti',
  },
  { name: 'Raminda Wijesooriya', country: 'Sri Lanka' },
  { name: 'Towker Khan', country: 'USA', photoSlug: 'towker-khan' },
  {
    name: 'Prashant Shukla',
    country: 'India',
    alsoUppsala: true,
    photoSlug: 'prashant-shukla',
  },
  { name: 'Anop Ravi', country: 'Canada' },
  {
    name: 'Qudratullah Mir Afzal',
    country: 'Sweden',
    alsoUppsala: true,
    photoSlug: 'qudratullah-mir-afzal',
  },
  { name: 'Elliot Green', country: 'England' },
  {
    name: 'Hamid Mahmood',
    country: 'Sweden',
    alsoUppsala: true,
    photoSlug: 'hamid-mahmood',
  },
  {
    name: 'Anas Zaheer',
    country: 'Sweden',
    alsoUppsala: true,
    under19: true,
    photoSlug: 'anas-zaheer',
  },
  {
    name: 'Essa Farooq',
    country: 'Sweden',
    alsoUppsala: true,
    under19: true,
    photoSlug: 'essa-farooq',
  },
  {
    name: 'Dhrubonil Roy',
    country: 'Sweden',
    alsoUppsala: true,
    under19: true,
    photoSlug: 'dhrubonil-roy',
  },
  { name: 'Dhavalkumar Norotam', country: 'Portugal' },
  { name: 'Musa Ahmad', country: 'Netherlands', photoSlug: 'musa-ahmad' },
  { name: 'Jeremy Martins', country: 'Portugal', photoSlug: 'jeremy-martins' }, // NOT on Uppsala's own squad list — EV-0831-06
  { name: 'Abu Bakkar', newFromPhotos: true, photoSlug: 'abu-bakkar' },
  { name: 'Asif Taniwal', newFromPhotos: true, photoSlug: 'asif-taniwal' },
  { name: 'Ayyan Warraich', newFromPhotos: true, photoSlug: 'ayyan-warraich' },
  { name: 'CP Rizwan', newFromPhotos: true, photoSlug: 'cp-rizwan' },
  { name: 'Danish Sarhadi', newFromPhotos: true, photoSlug: 'danish-sarhadi' },
  {
    name: 'Ibrahim Maqsood',
    newFromPhotos: true,
    photoSlug: 'ibrahim-maqsood',
  },
  { name: 'Ibrar Ahmed', newFromPhotos: true, photoSlug: 'ibrar-ahmed' },
  { name: 'Jack Jakir', newFromPhotos: true, photoSlug: 'jack-jakir' },
  { name: 'Junaid Shamsu', newFromPhotos: true, photoSlug: 'junaid-shamsu' },
  { name: 'Krish Anand', newFromPhotos: true, photoSlug: 'krish-anand' },
  { name: 'Muhsin Ali', newFromPhotos: true, photoSlug: 'muhsin-ali' },
  { name: 'Saghir Ahmad', newFromPhotos: true, photoSlug: 'saghir-ahmad' },
  { name: 'Sibet Hussain', newFromPhotos: true, photoSlug: 'sibet-hussain' },
  { name: 'Syed Aziz', newFromPhotos: true, photoSlug: 'syed-aziz' },
  { name: 'Taimoor Ali', newFromPhotos: true, photoSlug: 'taimoor-ali' },
  { name: 'Zohair Iqbal', newFromPhotos: true, photoSlug: 'zohair-iqbal' },
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
      status: 'pending_review',
      sources: r.sources,
    }) as ContentRecord;
    const result = evaluate(rec, gateOptions);
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
      tags: tagsFor(p),
      note:
        p.name === 'Roushan Singh'
          ? 'Country was unconfirmed across three conflicting documents; resolved to Portugal once his own supplied photo and its filename both corroborated it (EV-0831-08).'
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
      // its own source; every other record's source set is unchanged.
      ...(p.allRounder ? ['EV-20260911-002'] : []),
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
