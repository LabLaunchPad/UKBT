import { describe, expect, it } from 'vitest';
import { createRegistry } from './registry.js';
import { evaluate } from './rules.js';
import type { ContentRecord, GateOptions } from './types.js';

/**
 * Ports the 8 fixture cases from the proof-of-concept
 * (artifacts/verification/truth-gate-poc/truth_gate.py, EV-20260826-020)
 * into the real implementation, plus one new case (T7 two-source rule)
 * that the proof-of-concept did not cover. This is the production test
 * suite contracts/TRUTH-CONTRACT.md requires — the proof-of-concept was
 * the specification, this is the implementation being validated against it.
 *
 * All registry sources and field values below are synthetic fixtures.
 * None represents a real UK Bangla Tigers fact.
 */

const registry = createRegistry([
  {
    id: 'SRC-001',
    tier: 'T1',
    url: 'https://example-ukbt-official.test/about',
  },
  {
    id: 'SRC-002',
    tier: 'T1',
    url: 'https://example-ukbt-official.test/history',
  },
  {
    id: 'SRC-003',
    tier: 'T4',
    url: 'https://example-random-blog.test/ukbt-mentions',
  },
]);

const options: GateOptions = {
  registry,
  exemptFields: new Set(['page_title_label', 'ui_button_text']),
  twoSourceFields: new Set(['founded_year', 'honour_name']),
  today: new Date('2026-08-26T00:00:00Z'),
};

function record(
  overrides: Partial<ContentRecord> & Pick<ContentRecord, 'field' | 'status'>,
): ContentRecord {
  return { value: 'synthetic-test-value', ...overrides };
}

describe('truth gate — evaluate()', () => {
  it('PASS: valid provenance + valid authority + valid approver', () => {
    const result = evaluate(
      record({
        field: 'club_ground',
        status: 'approved',
        sources: ['SRC-001', 'SRC-002'],
        approver: 'J. Rahman (Committee Chair)',
        validUntil: new Date('2027-08-26'),
      }),
      options,
    );
    expect(result.passed).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it('FAIL: missing provenance', () => {
    const result = evaluate(
      record({
        field: 'player_name',
        status: 'approved',
        sources: null,
        approver: 'someone',
      }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toEqual([
      { rule: 'T1', detail: expect.stringContaining('missing provenance') },
    ]);
  });

  it('FAIL: empty sources array bypasses no sources — should fail T1', () => {
    const result = evaluate(
      record({
        field: 'player_name',
        status: 'approved',
        sources: [],
        approver: 'someone',
      }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toEqual([
      { rule: 'T1', detail: expect.stringContaining('missing provenance') },
    ]);
  });

  it('FAIL: missing authority (T4-tier source)', () => {
    const result = evaluate(
      record({
        field: 'sponsor_name',
        status: 'approved',
        sources: ['SRC-003'],
        approver: 'someone',
      }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toEqual([
      { rule: 'T3', detail: expect.stringContaining('tier T4 rejected') },
    ]);
  });

  it('FAIL: missing named approver', () => {
    const result = evaluate(
      record({
        field: 'club_ground',
        status: 'approved',
        sources: ['SRC-001'],
        approver: null,
      }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toEqual([
      { rule: 'T6', detail: expect.stringContaining('no named approver') },
    ]);
  });

  it('FAIL: expired/stale evidence', () => {
    const result = evaluate(
      record({
        field: 'club_ground',
        status: 'approved',
        sources: ['SRC-001'],
        approver: 'someone',
        validUntil: new Date('2026-08-25'),
      }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toEqual([
      { rule: 'T4', detail: expect.stringContaining('stale evidence') },
    ]);
  });

  it('FAIL: conflicting evidence', () => {
    const result = evaluate(
      record({
        field: 'club_ground',
        status: 'approved',
        sources: ['SRC-001', 'SRC-002'],
        approver: 'someone',
        conflictingValue: 'a-different-value',
      }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toContainEqual({
      rule: 'T8',
      detail: expect.stringContaining('conflicting evidence'),
    });
  });

  it('FAIL: unverified source (unresolvable registry id)', () => {
    const result = evaluate(
      record({
        field: 'player_name',
        status: 'approved',
        sources: ['SRC-999-DOES-NOT-EXIST'],
        approver: 'someone',
      }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toEqual([
      { rule: 'T2', detail: expect.stringContaining('unresolvable source id') },
    ]);
  });

  it('FAIL: attempted publication without required authority (approval step skipped entirely)', () => {
    const result = evaluate(
      record({
        field: 'sponsor_name',
        status: 'published',
        sources: null,
        approver: null,
      }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toEqual([
      {
        rule: 'T1',
        detail: expect.stringContaining('bypassing the approval step'),
      },
    ]);
  });

  it('FAIL: two-source rule violated for a founding fact with only one source', () => {
    const result = evaluate(
      record({
        field: 'founded_year',
        status: 'approved',
        sources: ['SRC-001'],
        approver: 'someone',
      }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toContainEqual({
      rule: 'T7',
      detail: expect.stringContaining('requires two distinct registry sources'),
    });
  });

  it('PASS: exempt field (generic UI label) requires no provenance at all', () => {
    const result = evaluate(
      record({ field: 'ui_button_text', status: 'published', sources: null }),
      options,
    );
    expect(result.passed).toBe(true);
  });

  it('PASS: draft status never fails the gate, even with no sources', () => {
    const result = evaluate(
      record({ field: 'player_name', status: 'draft', sources: null }),
      options,
    );
    expect(result.passed).toBe(true);
  });

  it('FAIL: placeholder sentinel present with status=published', () => {
    const result = evaluate(
      record({
        field: 'club_ground',
        status: 'published',
        sources: ['SRC-001', 'SRC-002'],
        approver: 'someone',
        isPlaceholder: true,
      }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toContainEqual({
      rule: 'T5',
      detail: expect.stringContaining('not allowed in production'),
    });
  });
});
