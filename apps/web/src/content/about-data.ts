// About Us page content bound to @ukbt/truth's gate — same discipline as
// homepage-data.ts. Facts here are About-specific (founding/legal entity,
// leadership, mission facts); shared site-wide facts (nav, social) are
// imported from homepage-data.ts rather than re-declared, so they are
// gated exactly once.
import { type ContentRecord, createRegistry, evaluate } from '@ukbt/truth/gate';
import { ContentRecordSchema } from '@ukbt/truth/schema';

const registry = createRegistry([
  { id: 'EV-026', tier: 'T1', url: 'artifacts/evidence/EV-20260826-026.yaml' },
  { id: 'EV-028', tier: 'T2', url: 'artifacts/evidence/EV-20260826-028.yaml' },
  { id: 'EV-029', tier: 'T1', url: 'artifacts/evidence/EV-20260826-029.yaml' },
  {
    id: 'EV-0909-01',
    tier: 'T1',
    url: 'artifacts/evidence/EV-20260909-001.yaml',
  },
  {
    id: 'EV-20260910-001',
    tier: 'T2',
    url: 'artifacts/evidence/EV-20260910-001.yaml',
  },
  {
    id: 'EV-20260910-002',
    tier: 'T2',
    url: 'artifacts/review/LEGACY-ABOUT-INVENTORY.md',
  },
  {
    id: 'EV-20260910-003',
    tier: 'T2',
    url: 'artifacts/evidence/EV-20260910-003.yaml',
  },
]);

const exemptFields = new Set<string>();
const twoSourceFields = new Set([
  'org.tagline',
  'org.stat_career_matches',
  'org.stat_active_players',
  'org.management_story',
  'org.founder_story',
]);
const gateOptions = { registry, exemptFields, twoSourceFields };

interface Fact<T> {
  field: string;
  value: T;
  sources: string[];
}

// RM-5: Zod-validated, not just TS-shaped — see provenance.ts's
// ContentRecordSchema doc comment.
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
  tagline: {
    field: 'org.tagline',
    value: 'We are not only a team, but also an institute for learning.',
    sources: ['EV-028', 'EV-029'],
  },
  founded: { field: 'org.founded', value: '2020', sources: ['EV-029'] },
  legalEntity: {
    field: 'org.legal_entity',
    value: 'UK Bangla Tigers Cricket Club CIC',
    sources: ['EV-028'],
  },
  statPlayers: {
    field: 'org.stat_players',
    value: '40+',
    sources: ['EV-026', 'EV-0909-01'],
  },
  statTournaments: {
    field: 'org.stat_tournaments',
    value: '7+',
    sources: ['EV-026'],
  },
  founderCeo: {
    field: 'org.leader.founder_ceo',
    value: { name: 'Mohammad Chowdhury', role: 'Founder & CEO, Club Captain' },
    sources: ['EV-026', 'EV-029'],
  },
  actingChairman: {
    field: 'org.leader.acting_chairman',
    value: { name: 'MD Shahidul Alam Ratan', role: 'Acting Chairman' },
    sources: ['EV-026', 'EV-029'],
  },
  viceChairman: {
    field: 'org.leader.vice_chairman',
    value: { name: 'Sayem Rahman', role: 'Vice-Chairman' },
    sources: ['EV-029'],
  },
  founderStory: {
    field: 'org.founder_story',
    value: [
      'Mohammad Chowdhury founded UK Bangla Tigers in 2020 after nearly 20 years of competitive cricket and five years of coaching, starting with players from England, Bangladesh, India, West Indies, Afghanistan and the USA at the Asian Challengers Trophy in Nepal.',
      'After Covid-19 cut short that first outing, he built franchises across countries — including the Safari International T20 Cup in Dubai — to give hardworking players who missed out through lack of support a stage at the highest level.',
    ],
    sources: ['EV-20260910-001', 'EV-20260910-002'],
  },
  statCareerMatches: {
    field: 'org.stat_career_matches',
    value: '450+',
    sources: ['EV-20260910-001', 'EV-20260910-002'],
  },
  statActivePlayers: {
    field: 'org.stat_active_players',
    value: '40+',
    sources: ['EV-20260910-001', 'EV-20260910-003'],
  },
  heroSubline: {
    field: 'org.about_subline',
    value: 'Building a legacy of cricket excellence in the United Kingdom',
    sources: ['EV-20260910-001', 'EV-20260910-002'],
  },
  managementStory: {
    field: 'org.management_story',
    value: [
      'The leadership of UK Bangla Tigers Cricket Club is driven by CEO Mohammad Chowdhury, whose extensive playing and coaching experience inspired the club’s founding in 2020. His vision has created opportunities for players to compete on international stages despite significant challenges.',
      'Acting Chairman Shahidul Alam Ratan brings over 25 years of global cricket development experience, contributing through elite coaching, administration and impactful grassroots programmes that have shaped players worldwide.',
      'Vice-Chairman Sayem Rahman, a British-Bangladeshi entrepreneur and community leader, strengthens the club’s growth through his expertise in business, media and sports development. Together, the management team is committed to nurturing talent and building pathways for players to succeed internationally.',
    ],
    sources: ['EV-20260910-001', 'EV-20260910-002'],
  },
  // Title-column intro (owner direction 2026-09-11): the managementStory
  // passage compressed for SEO/marketing into the LeadershipGrid title
  // column, replacing the hardcoded committee line. Same facts, same
  // sources — a restatement, not a new claim. The roster hedge is kept
  // ("More committee roles to be announced") so the three cards never
  // read as a complete-committee claim.
  leadershipIntro: {
    field: 'org.leadership_intro',
    value:
      'Led by founder and CEO Mohammad Chowdhury, UK Bangla Tigers was founded in 2020 to open pathways for players to compete on international stages. Acting Chairman Shahidul Alam Ratan brings over 25 years of global cricket development; Vice-Chairman Sayem Rahman, a British-Bangladeshi entrepreneur and community leader, drives growth across business, media and sport. More committee roles to be announced.',
    sources: ['EV-20260910-001', 'EV-20260910-002'],
  },
  viceChairmanBio: {
    field: 'org.leader.vice_chairman_bio',
    value: [
      'Sayem Rahman is a British-Bangladeshi entrepreneur, media presenter and community leader, and CEO of SR Global Corp — spanning SR Printing, SR Creative Hub and Joshan of Wye — and a TV presenter on Islam Channel Bangla and TV ONE UK.',
      'He serves as President of Royal Tigers Sports Club and Founder of Kent Elite Sporting Society, Joint Treasurer at Ashford Muslim Association and International Secretary at Organisation Bismillah UK Charity.',
      'He is Chief Advisor at Cricket with Sami, a Director at S Brothers International Ltd, and an Independent Advisor to Kent Police.',
    ],
    sources: ['EV-20260910-001', 'EV-20260910-002'],
  },
} satisfies Record<string, Fact<unknown>>;

const allRecords: ContentRecord[] = Object.values(facts).map((f) => record(f));

for (const rec of allRecords) {
  const result = evaluate(rec, gateOptions);
  if (!result.passed) {
    throw new Error(
      `Truth gate failed for '${rec.field}': ${result.reasons.map((r) => `${r.rule}: ${r.detail}`).join('; ')}`,
    );
  }
}

export const about = {
  tagline: facts.tagline.value,
  founded: facts.founded.value,
  legalEntity: facts.legalEntity.value,
  stats: {
    players: facts.statPlayers.value,
    tournaments: facts.statTournaments.value,
  },
  missionFacts: [
    {
      title: 'International Cricket',
      body: 'Competing on the international stage, from the Safari International T20 Cup to the upcoming Nordic Lights and Global T20 Championship.',
    },
    {
      title: 'Community & Learning',
      body: facts.tagline.value,
    },
    {
      title: 'Sister Franchise Network',
      body: 'Part of a multi-franchise family alongside Uppsala Tigers (Sweden).',
    },
    {
      title: 'Registered Organisation',
      body: `Founded in ${facts.founded.value} · registered as ${facts.legalEntity.value}.`,
    },
  ],
  storyParagraphs: [
    facts.tagline.value,
    `Founded in ${facts.founded.value} · registered as ${facts.legalEntity.value}, competing as a cricket franchise on the international stage while building a sister-franchise network with Uppsala Tigers in Sweden.`,
  ],
  leaders: [
    {
      ...facts.founderCeo.value,
      photo: {
        src: '/media/founder-trophy.webp',
        alt: 'Mohammad Chowdhury, Founder and CEO of UK Bangla Tigers',
        width: 1000,
        height: 1252,
      },
    },
    {
      ...facts.actingChairman.value,
      photo: {
        src: '/media/shahidul-alam-ratan.webp',
        alt: 'MD Shahidul Alam Ratan, Acting Chairman of UK Bangla Tigers',
        width: 1321,
        height: 1322,
      },
    },
    {
      ...facts.viceChairman.value,
      photo: {
        src: '/media/sayem-rahman.jpg',
        alt: 'Sayem Rahman, Vice-Chairman of UK Bangla Tigers',
        width: 1200,
        height: 1200,
      },
    },
  ],
  leadershipGraphic: {
    src: '/media/management-team.webp',
    alt: 'Club graphic introducing the management team: Mohammad Chowdhury (Founder and CEO), MD Shahidul Alam Ratan (Acting Chairman) and Sayem Rahman (Vice-Chairman)',
    width: 1000,
    height: 1333,
  },
  founder: {
    story: facts.founderStory.value,
    stats: {
      careerMatches: facts.statCareerMatches.value,
      activePlayers: facts.statActivePlayers.value,
    },
    image: {
      src: '/media/founder-trophy.webp',
      alt: 'Mohammad Chowdhury holding the Safari T20 Cup trophy',
      width: 1000,
      height: 1252,
    },
  },
  sayem: {
    name: facts.viceChairman.value.name,
    role: facts.viceChairman.value.role,
    bio: facts.viceChairmanBio.value,
    photo: {
      src: '/media/sayem-rahman.jpg',
      alt: 'Sayem Rahman, Vice-Chairman of UK Bangla Tigers',
      width: 1200,
      height: 1200,
    },
  },
  // Acting-Chairman spotlight (EV-20260911-001, owner-supplied portrait).
  // Name/role reuse the gated leader fields; photo is an ungated literal
  // like sayem.photo. No bio was supplied — the card renders photo +
  // name + role only (bio rows render only when present).
  ratan: {
    name: facts.actingChairman.value.name,
    role: facts.actingChairman.value.role,
    bio: [] as string[],
    photo: {
      src: '/media/shahidul-alam-ratan.webp',
      alt: 'MD Shahidul Alam Ratan, Acting Chairman of UK Bangla Tigers',
      width: 1321,
      height: 1322,
    },
  },
  heroSubline: facts.heroSubline.value,
  managementStory: facts.managementStory.value,
  // Compressed title-column intro (see fact comment above). managementStory
  // is retained unrendered (same pattern as sayem/ratan/leadershipGraphic)
  // so the full passage stays on record without duplicating page copy.
  leadershipIntro: facts.leadershipIntro.value,
};
