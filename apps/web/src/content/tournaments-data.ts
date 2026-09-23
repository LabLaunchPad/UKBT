// International Tournaments/Events page content, bound to @ukbt/truth's
// gate. The full 5-event calendar from EV-20260826-026 (C-009) —
// tournament-level only, no match-by-match fixtures/results exist in
// evidence, so none are rendered.
import { type ContentRecord, createRegistry, evaluate } from '@ukbt/truth/gate';
import { ContentRecordSchema } from '@ukbt/truth/schema';

const registry = createRegistry([
  { id: 'EV-026', tier: 'T1', url: 'artifacts/evidence/EV-20260826-026.yaml' },
]);
const exemptFields = new Set<string>();
const twoSourceFields = new Set<string>();
const gateOptions = { registry, exemptFields, twoSourceFields };

interface Tournament {
  name: string;
  when: string;
  where: string;
  status: 'Upcoming' | 'Completed';
}

const events: { field: string; value: Tournament }[] = [
  {
    field: 'org.tournament.nordic_lights',
    value: {
      name: 'Nordic Lights',
      when: 'September 2026',
      where: 'Norway',
      status: 'Upcoming',
    },
  },
  {
    field: 'org.tournament.global_t20',
    value: {
      name: 'Global T20 Championship',
      when: 'October 2026',
      where: 'Romania',
      status: 'Upcoming',
    },
  },
  {
    field: 'org.tournament.safari_international',
    value: {
      name: 'Safari International T20 Cup',
      when: 'July 2026',
      where: 'UAE',
      status: 'Completed',
    },
  },
  {
    field: 'org.tournament.nordic_smash',
    value: {
      name: 'Nordic Smash T20',
      when: 'June 2026',
      where: 'Sweden',
      status: 'Completed',
    },
  },
  {
    field: 'org.tournament.asian_challengers',
    value: {
      name: 'Asian Challengers Trophy',
      when: 'January 2020',
      where: 'Nepal',
      status: 'Completed',
    },
  },
];

for (const e of events) {
  // RM-5: Zod-validated, not just TS-shaped — see provenance.ts's
  // ContentRecordSchema doc comment.
  const rec = ContentRecordSchema.parse({
    field: e.field,
    value: e.value,
    status: 'pending_review',
    sources: ['EV-026'],
  }) as ContentRecord;
  const result = evaluate(rec, gateOptions);
  if (!result.passed) {
    throw new Error(
      `Truth gate failed for '${rec.field}': ${result.reasons.map((r) => `${r.rule}: ${r.detail}`).join('; ')}`,
    );
  }
}

export const allTournaments = events.map((e) => e.value);
export const upcomingTournaments = allTournaments.filter(
  (t) => t.status === 'Upcoming',
);
export const completedTournaments = allTournaments.filter(
  (t) => t.status === 'Completed',
);
