import type { FormResult, JoinApplication } from '../submit-form';

/**
 * Default v1 adapter: no endpoint exists, so a submit can never truthfully be
 * reported as delivered. The honesty rule (binding —
 * `docs/superpowers/specs/2026-09-26-join-form-design.md`) forbids a success
 * state while data is discarded, so this adapter always returns
 * `unavailable` and never `ok`. A `Worker` adapter later swaps in through the
 * `setFormAdapter` seam on the `let adapter` binding in `../submit-form.ts`;
 * this module stays the registered default.
 */
export function mockAdapter(_payload: JoinApplication): Promise<FormResult> {
  return Promise.resolve({ status: 'unavailable' });
}
