import { describe, expect, it } from 'vitest';
import { isPublishable } from './publish.js';
import { createRegistry } from './registry.js';
import type { ContentRecord, GateOptions } from './types.js';

/**
 * P0 closure Task 2 — production publishability (docs/adr-001).
 * `evaluate()` checks evidence validity (T1-T8); `isPublishable()` adds the
 * fail-closed lifecycle layer the truth contract requires: only approved /
 * published records with a named approver may render in production.
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

const goodSources = ['SRC-001', 'SRC-002'];
const approver = 'J. Rahman (Committee Chair)';

describe('truth gate — isPublishable() production lifecycle', () => {
  it('BLOCKS: pending_review with valid evidence must not publish', () => {
    const result = isPublishable(
      record({
        field: 'club_ground',
        status: 'pending_review',
        sources: goodSources,
      }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toContainEqual({
      rule: 'T6',
      detail: expect.stringContaining('not publishable'),
    });
  });

  it('BLOCKS: draft must not publish', () => {
    const result = isPublishable(
      record({ field: 'club_ground', status: 'draft', sources: goodSources }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toEqual([
      {
        rule: 'T6',
        detail: expect.stringContaining('not publishable'),
      },
    ]);
  });

  it('BLOCKS: approved without a named approver', () => {
    const result = isPublishable(
      record({
        field: 'club_ground',
        status: 'approved',
        sources: ['SRC-001'],
        approver: null,
      }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toContainEqual({
      rule: 'T6',
      detail: expect.stringContaining('approver'),
    });
  });

  it('BLOCKS: published without approver (approval step skipped)', () => {
    const result = isPublishable(
      record({
        field: 'club_ground',
        status: 'published',
        sources: ['SRC-001'],
        approver: null,
      }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toContainEqual({
      rule: 'T6',
      detail: expect.stringContaining('approver'),
    });
  });

  it('BLOCKS: invalid evidence (T4-tier source) even when approved', () => {
    const result = isPublishable(
      record({
        field: 'sponsor_name',
        status: 'approved',
        sources: ['SRC-003'],
        approver,
      }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toContainEqual({
      rule: 'T3',
      detail: expect.stringContaining('tier T4 rejected'),
    });
  });

  it('BLOCKS: stale/expired evidence obeys the lifecycle', () => {
    const result = isPublishable(
      record({
        field: 'club_ground',
        status: 'approved',
        sources: ['SRC-001'],
        approver,
        validUntil: new Date('2026-08-25'),
      }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toContainEqual({
      rule: 'T4',
      detail: expect.stringContaining('stale evidence'),
    });
  });

  it('BLOCKS: unsupported status values fail closed', () => {
    const result = isPublishable(
      record({
        field: 'club_ground',
        status: 'archived' as ContentRecord['status'],
        sources: goodSources,
        approver,
      }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toEqual([
      {
        rule: 'T1',
        detail: expect.stringContaining('unsupported status'),
      },
    ]);
  });

  it('BLOCKS: placeholder sentinel, even when approved', () => {
    const result = isPublishable(
      record({
        field: 'club_ground',
        status: 'approved',
        sources: goodSources,
        approver,
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

  it('BLOCKS: value-form placeholder sentinel without the flag', () => {
    const result = isPublishable(
      record({
        field: 'club_ground',
        status: 'approved',
        sources: goodSources,
        approver,
        value: '__PLACEHOLDER_CLUB_GROUND__',
      }),
      options,
    );
    expect(result.passed).toBe(false);
    expect(result.reasons).toContainEqual({
      rule: 'T5',
      detail: expect.stringContaining('not allowed in production'),
    });
  });

  it('PASSES: valid published record with approver and good evidence', () => {
    const result = isPublishable(
      record({
        field: 'club_ground',
        status: 'published',
        sources: goodSources,
        approver,
        validUntil: new Date('2027-08-26'),
      }),
      options,
    );
    expect(result.passed).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it('PASSES: valid approved record with approver and good evidence', () => {
    const result = isPublishable(
      record({
        field: 'club_ground',
        status: 'approved',
        sources: ['SRC-001'],
        approver,
      }),
      options,
    );
    expect(result.passed).toBe(true);
  });

  it('PASSES: exempt field renders without provenance', () => {
    const result = isPublishable(
      record({
        field: 'ui_button_text',
        status: 'pending_review',
        sources: null,
      }),
      options,
    );
    expect(result.passed).toBe(true);
  });

  it('PREVIEW: evidence-valid pending_review may render for review, never as production', () => {
    const rec = record({
      field: 'club_ground',
      status: 'pending_review',
      sources: goodSources,
    });
    expect(isPublishable(rec, options, 'preview').passed).toBe(true);
    expect(isPublishable(rec, options, 'production').passed).toBe(false);
  });
});
