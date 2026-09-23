// Sponsors section content, bound to @ukbt/truth's gate. The reference
// template has a partner-logo swiper (`.partnership-container`,
// `.swiperpartner`, `.partner-img` — artifacts/extraction/css-rule-graph.json)
// that Stage 8's build deliberately omitted (MissionWelcome.astro's own
// header comment: "no sponsor is evidenced"). WOLFFIT is the first real
// sponsor supplied since (EV-20260831-007) — this closes that omission
// with real content, not template filler.
//
// Structured as an array, one entry today, so a second sponsor can be
// added the same way later without inventing one now (the same
// forward-compatible pattern as franchises-data.ts's `ourFranchises`).
import { type ContentRecord, createRegistry, evaluate } from '@ukbt/truth/gate';
import { ContentRecordSchema } from '@ukbt/truth/schema';

const registry = createRegistry([
  {
    id: 'EV-0831-07',
    tier: 'T1',
    url: 'artifacts/evidence/EV-20260831-007.yaml',
  },
]);
const exemptFields = new Set<string>();
const twoSourceFields = new Set<string>();
const gateOptions = { registry, exemptFields, twoSourceFields };

export interface Sponsor {
  name: string;
  tagline?: string;
  logo: string;
  logoAlt: string;
}

const sponsors: { field: string; value: Sponsor }[] = [
  {
    field: 'org.sponsor.wolffit',
    value: {
      name: 'WOLFFIT',
      tagline: 'Fuel. Focus. Fitness.',
      logo: '/brand/sponsors/wolffit.jpg',
      logoAlt: 'WOLFFIT logo',
    },
  },
];

for (const s of sponsors) {
  // RM-5: Zod-validated, not just TS-shaped — see provenance.ts's
  // ContentRecordSchema doc comment.
  const rec = ContentRecordSchema.parse({
    field: s.field,
    value: s.value,
    status: 'pending_review',
    sources: ['EV-0831-07'],
  }) as ContentRecord;
  const result = evaluate(rec, gateOptions);
  if (!result.passed) {
    throw new Error(
      `Truth gate failed for '${rec.field}': ${result.reasons.map((r) => `${r.rule}: ${r.detail}`).join('; ')}`,
    );
  }
}

export const ourSponsors: Sponsor[] = sponsors.map((s) => s.value);
