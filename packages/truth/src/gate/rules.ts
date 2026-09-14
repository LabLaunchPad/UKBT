import {
  ADMISSIBLE_TIERS,
  type ContentRecord,
  type GateFailureReason,
  type GateOptions,
  type GateResult,
} from './types.js';

/**
 * Evaluates one content record against truth-gate rules T1-T8
 * (knowledge/07-CONTENT-TRUTH-POLICY.yaml, bound by contracts/TRUTH-CONTRACT.md).
 *
 * T9 (derived provenance) is a composition rule for computed values, not a
 * per-record check — see `deriveProvenance` in gate/derive.ts.
 *
 * This supersedes the proof-of-concept
 * (artifacts/verification/truth-gate-poc/truth_gate.py, EV-20260826-020),
 * which proved the rule set was soundly implementable. This is the real,
 * production `packages/truth` implementation the proof-of-concept was
 * written against as a specification.
 */
export function evaluate(
  record: ContentRecord,
  options: GateOptions,
): GateResult {
  const reasons: GateFailureReason[] = [];
  const today = options.today ?? new Date();

  if (options.exemptFields.has(record.field)) {
    // knowledge/07 not_organization_claims — generic copy / UI labels are
    // explicitly exempt from provenance requirements.
    return { passed: true, reasons: [] };
  }

  if (record.status === 'draft') {
    // Draft never renders in a production build (T5 is enforced at build
    // time, separately, by scanning the resolved build output — see
    // contracts/CI-CONTRACT.md's placeholder-detection gate). A draft
    // record with no sources yet is not itself a gate failure.
    return { passed: true, reasons: [] };
  }

  // From here, status is 'pending_review' | 'approved' | 'published' — all
  // three are attempts to move a fact toward publication and are checked
  // in full.

  if (record.isPlaceholder && record.status === 'published') {
    reasons.push({
      rule: 'T5',
      detail:
        'placeholder sentinel present with status=published — not allowed in production',
    });
  }

  if (record.sources == null || record.sources.length === 0) {
    if (record.status === 'published' && record.approver == null) {
      reasons.push({
        rule: 'T1',
        detail: 'attempted publication bypassing the approval step entirely',
      });
    } else {
      reasons.push({
        rule: 'T1',
        detail: 'missing provenance — no sources[] present',
      });
    }
    return { passed: false, reasons };
  }

  const resolved: { id: string; tier: string }[] = [];
  for (const sourceId of record.sources) {
    const entry = options.registry.get(sourceId);
    if (!entry) {
      reasons.push({
        rule: 'T2',
        detail: `unresolvable source id '${sourceId}' — not in registry (unverified source)`,
      });
    } else {
      resolved.push({ id: entry.id, tier: entry.tier });
    }
  }

  if (reasons.length > 0) {
    return { passed: false, reasons };
  }

  const badTier = resolved.find(
    (r) =>
      !ADMISSIBLE_TIERS.includes(r.tier as (typeof ADMISSIBLE_TIERS)[number]),
  );
  if (badTier) {
    reasons.push({
      rule: 'T3',
      detail: `source tier ${badTier.tier} rejected (T4/T5 not admissible — missing authority)`,
    });
  }

  if (
    (record.status === 'approved' || record.status === 'published') &&
    !record.approver
  ) {
    reasons.push({
      rule: 'T6',
      detail: `status=${record.status} but no named approver recorded`,
    });
  }

  if (
    record.validUntil != null &&
    record.validUntil.getTime() < today.getTime()
  ) {
    reasons.push({
      rule: 'T4',
      detail: `evidence expired (valid_until ${record.validUntil.toISOString().slice(0, 10)} < today ${today.toISOString().slice(0, 10)}) — stale evidence`,
    });
  }

  if (record.conflictingValue !== undefined) {
    reasons.push({
      rule: 'T8',
      detail: 'conflicting evidence — two sources disagree on this claim',
    });
  }

  if (options.twoSourceFields.has(record.field)) {
    const distinctIds = new Set(resolved.map((r) => r.id));
    if (distinctIds.size < 2) {
      reasons.push({
        rule: 'T7',
        detail: `field '${record.field}' requires two distinct registry sources; found ${distinctIds.size}`,
      });
    }
  }

  return { passed: reasons.length === 0, reasons };
}
