/**
 * Truth-gate core types. Rules T1-T9 are defined in
 * knowledge/07-CONTENT-TRUTH-POLICY.yaml and bound here per
 * contracts/TRUTH-CONTRACT.md. This module has no dependency on Astro or
 * any UI framework — see contracts/REPOSITORY-CONTRACT.md's dependency
 * direction (packages/truth never imports apps/web).
 */

export type SourceTier = 'T1' | 'T2' | 'T3' | 'T4' | 'T5';

/** T3: only T1-T3 are admissible; T4/T5 are rejected at the gate. */
export const ADMISSIBLE_TIERS: readonly SourceTier[] = ['T1', 'T2', 'T3'];

export interface RegistrySource {
  readonly id: string;
  readonly tier: SourceTier;
  readonly url: string;
}

/** T2: sources are registry IDs, never free text. */
export type SourceRegistry = ReadonlyMap<string, RegistrySource>;

import type { ContentStatus } from '../schema/provenance.js';

export type { ContentStatus } from '../schema/provenance.js';

export interface ContentRecord {
  readonly field: string;
  readonly value: unknown;
  readonly status: ContentStatus;
  /** null/undefined = no provenance recorded yet (fails T1 for an org-fact field). */
  readonly sources?: readonly string[] | null;
  /** T6: required when status is 'approved' or 'published'. */
  readonly approver?: string | null;
  /** T4: checked against "today" at build time. null is only valid for an immutable fact. */
  readonly validUntil?: Date | null;
  /** T8: presence means two sources disagree on this claim. */
  readonly conflictingValue?: unknown;
  /** T5: true marks this record as a placeholder sentinel, never valid in production. */
  readonly isPlaceholder?: boolean;
}

export type GateFailureReason =
  | { rule: 'T1'; detail: string }
  | { rule: 'T2'; detail: string }
  | { rule: 'T3'; detail: string }
  | { rule: 'T4'; detail: string }
  | { rule: 'T5'; detail: string }
  | { rule: 'T6'; detail: string }
  | { rule: 'T7'; detail: string }
  | { rule: 'T8'; detail: string };

export interface GateResult {
  readonly passed: boolean;
  readonly reasons: readonly GateFailureReason[];
}

export interface GateOptions {
  readonly registry: SourceRegistry;
  /** Fields exempt from provenance requirements — knowledge/07 not_organization_claims. */
  readonly exemptFields: ReadonlySet<string>;
  /** Fields requiring T7's two-distinct-source rule (founding facts, honours, headline statistics). */
  readonly twoSourceFields: ReadonlySet<string>;
  /** Injectable for deterministic testing; defaults to `new Date()`. */
  readonly today?: Date;
}
