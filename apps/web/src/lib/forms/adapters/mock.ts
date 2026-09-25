import type { FormResult, JoinApplication } from '../submit-form';

/**
 * Default v1 adapter: no endpoint exists, so a submit can never truthfully be
 * reported as delivered. The honesty rule (binding —
 * `docs/superpowers/specs/2026-09-26-join-form-design.md`) forbids a success
 * state while data is discarded, so this adapter always returns
 * `unavailable` and never `ok`. A `Worker` adapter replaces this module
 * alone when the endpoint ships.
 */
export function mockAdapter(_payload: JoinApplication): Promise<FormResult> {
  return Promise.resolve({ status: 'unavailable' });
}
