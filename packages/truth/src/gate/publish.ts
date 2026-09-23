import { isPlaceholderSentinel } from '../schema/provenance.js';
import { evaluate } from './rules.js';
import type { ContentRecord, GateOptions, GateResult } from './types.js';

export type PublishEnvironment = 'production' | 'preview';

/**
 * Production publishability (docs/adr-001, contracts/TRUTH-CONTRACT.md).
 *
 * `evaluate()` checks evidence validity (T1-T8) but says nothing about the
 * fact lifecycle — a `pending_review` record with good sources passes it,
 * and every `apps/web` content module treats that pass as render permission.
 * This function is the fail-closed lifecycle layer on top:
 *
 * - production (default): only `approved` / `published` with a named
 *   approver, no placeholder sentinel, plus a passing `evaluate()`.
 * - preview: an `evaluate()` pass is sufficient, so `pending_review`
 *   content may render for human review — never as production.
 *
 * Fail-closed default: omit the environment and you get production.
 */
export function isPublishable(
  record: ContentRecord,
  options: GateOptions,
  environment: PublishEnvironment = 'production',
): GateResult {
  if (options.exemptFields.has(record.field)) {
    // knowledge/07 not_organization_claims — generic copy / UI labels are
    // explicitly exempt from provenance requirements, in any environment.
    return { passed: true, reasons: [] };
  }

  if (environment === 'preview') {
    return evaluate(record, options);
  }

  if (record.status === 'draft' || record.status === 'pending_review') {
    return {
      passed: false,
      reasons: [
        {
          rule: 'T6',
          detail: `status=${record.status} is not publishable — production requires approved/published with a named approver`,
        },
      ],
    };
  }

  if (record.status !== 'approved' && record.status !== 'published') {
    return {
      passed: false,
      reasons: [
        {
          rule: 'T1',
          detail: `unsupported status '${record.status}' — fail closed, never publish unchecked`,
        },
      ],
    };
  }

  // Flag-form or value-form sentinel — knowledge/07 placeholder discipline
  // requires both to be machine-distinguishable, never plausible values.
  if (record.isPlaceholder || isPlaceholderSentinel(record.value)) {
    return {
      passed: false,
      reasons: [
        {
          rule: 'T5',
          detail: 'placeholder sentinel present — not allowed in production',
        },
      ],
    };
  }

  // Approved/published: approver presence, evidence, expiry, conflict and
  // two-source rules are all enforced by evaluate() — single source of truth.
  return evaluate(record, options);
}
