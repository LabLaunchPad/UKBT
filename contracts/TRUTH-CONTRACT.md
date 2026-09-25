# Truth Contract

**ID:** CONTRACT-TRUTH-01
**Status:** FROZEN · Stage 3 (Contract Freeze)
**Purpose:** Fix the truth-gate mechanism's rules, the fact-lifecycle
states, and — critically — the distinction between GATE CONSTRUCTION
(buildable and testable now) and GATE AUTHORIZATION (publishing a real
fact, which stays blocked on external evidence).

## The load-bearing distinction

```
GATE CONSTRUCTION  ≠  GATE AUTHORIZATION
```

- **Gate construction**: writing and testing the validation logic in
  `packages/truth` against synthetic fixture data. Requires no external
  authority. May proceed now, under Track C.
- **Gate authorization**: a real UKBT fact reaching `status: approved` or
  `status: published`. Requires U-22 (registry owner — who maintains the
  source registry) and U-23 (named human approver) to be resolved for that
  fact. Blocked until then, by design — this is `T6` and `T2` doing their
  job, not the system deadlocking itself.

"Fail closed" does not mean "the system can never operate." It means: no
fact passes the gate without meeting every rule; the mechanism itself is
free to exist, run, and be tested against fixtures indefinitely.

**Evidence that this distinction is not merely asserted but demonstrated:**
`EV-20260826-020` — a proof-of-concept implementation of rules T1-T9
(`artifacts/verification/truth-gate-poc/truth_gate.py`) was written and
executed against 8 synthetic fixtures (1 expected PASS, 7 expected FAIL,
each for a distinct rule: missing provenance, sub-threshold source tier,
missing approver, expired evidence, conflicting evidence, unresolvable
source id, and publication attempted with the approval step skipped
entirely). All 8 matched their expected outcome with a specific, correct
failure reason each time (`ALL_FIXTURES_MATCHED_EXPECTATION = True`),
re-run once for determinism. This proves the rule set is soundly
implementable now; it does not and cannot authorize a real fact — the
fixtures are fictitious source IDs and fictitious field values, never
presented as UKBT truth.

## Inputs

- `knowledge/07-CONTENT-TRUTH-POLICY.yaml` (rules T1-T9, permitted/
  prohibited sources, placeholder discipline)
- `knowledge/05-UNKNOWN-BLOCKER-POLICY.yaml` (U-22/U-23 worked example)
- `EV-20260826-020` (proof-of-concept validation)

## Outputs / Frozen rules (T1-T9, restated as binding — source of truth
remains `knowledge/07-CONTENT-TRUTH-POLICY.yaml`; this contract is where
the *implementation* of those rules is bound to `packages/truth`)

| Rule | Statement |
|---|---|
| T1 | Fail closed by default. Every org-fact string field requires provenance; an unannotated new field fails the build. |
| T2 | `sources[]` are registry IDs, never free-text URLs/strings. |
| T3 | Source tier enforced at the gate: T1-T3 admissible, T4-T5 rejected. |
| T4 | `valid_until` checked at build time; expired fails. |
| T5 | No placeholder sentinel in a production build. |
| T6 | `status: approved` requires a recorded, named human approver. An agent may prepare/classify/flag/block; an agent never signs. |
| T7 | Founding facts, honours, and headline statistics require two distinct registry IDs — two citations of one source is one source. |
| T8 | Conflicting sources on one claim fail; never silent last-write-wins. |
| T9 | A derived/computed value inherits the union of its inputs' provenance and the earliest `valid_until`. |

### Fact lifecycle (status field)

```
draft → pending_review → approved → published
```

- `draft`: author-entered, `sources[]` may be empty, never renders in a
  production build.
- `pending_review`: `sources[]` populated and tier/registry-valid; not yet
  human-approved.
- `approved`: T6 satisfied (named approver recorded). Still not
  necessarily rendered — a separate publish step exists so approval and
  going live are not conflated.
- `published`: rendered in the production build. Requires `approved`
  first — `T1`'s "attempted publication bypassing approval" fixture case
  (`EV-20260826-020`) is exactly the transition this lifecycle forbids
  skipping.

### Placeholder discipline

- Sentinel form: `__PLACEHOLDER_<FIELD>__`, `status: draft`,
  `sources: []`.
- A realistic-looking invented value (a plausible name, date, score,
  statistic, or quotation) is never used as a placeholder — it is an
  invented fact wearing a placeholder's coat (`knowledge/07`).
- CI greps production builds for placeholder-sentinel *absence* and test
  fixtures for its *presence* where expected.

## Invariants

- No code path in `packages/truth` reads from `artifacts/extraction/` or
  any Adelux-derived source. Design-source content and UKBT truth are
  structurally disjoint, not merely policy-separated
  (`ARCHITECTURE-PROPOSAL-V3.md` §4).
- Hand-authored JSON-LD is prohibited; structured data is emitted only
  from typed content that passed the gate (`A14`, `AEO/GEO` rationale in
  `knowledge/07`).
- An agent (including this one) never occupies the T6 approver role.

## Forbidden behavior

- Publishing (rendering in a production build) any org-fact field that has
  not reached `status: approved` with a named approver.
- Treating a fixture/synthetic PASS as evidence that a real fact may
  publish.
- Loosening T1-T9 to make a real, currently-unapprovable UKBT fact pass.
- Free-text `sources[]`.

## Validation method

- Unit tests in `packages/truth` port the proof-of-concept's 8 fixture
  cases (and the 9 numbered rules' individual failure modes) into the real
  TypeScript implementation at Stage 4 — the proof-of-concept is the
  specification these tests are written against, not a substitute for
  them.
- Build-time truth-gate check (`CI-CONTRACT.md`) runs on every PR.
- `current_state.organization_facts_verified = 0` remains accurate and
  expected at this stage (`knowledge/07`) — zero facts should pass the
  gate today, because the gate has nothing admissible to pass yet.

## Owner

Track C for gate construction (mechanism, tests, fixtures). Track B /
external authority for gate authorization of any real UKBT fact.

## Dependency

`REPOSITORY-CONTRACT.md` (location: `packages/truth`). `CONTENT-CONTRACT.md`
(schema shapes the gate validates).

## Change authority

Amending T1-T9 requires a new evidence record identifying the gap the
current rules missed. Loosening a rule specifically to obtain a PASS on a
real fact is never a valid change — that is gate weakening, forbidden by
`CLAUDE.md`'s hard invariants.

## Evidence required

`EV-20260826-020` (this contract's binding evidence). Future: one evidence
record per real UKBT fact that reaches `approved`, per
`contracts/evidence-contract.md`.

## Reversibility

REVERSIBLE at the mechanism level (rules can be corrected via change
control). NOT REVERSIBLE at the trust level once a fact is `published`
incorrectly — a false published fact is a real-world event (per AEO/GEO
rationale, other systems may quote it), which is why T1-T9 are strict
before publication rather than lenient-with-cleanup-after.

## AMENDMENT 2026-09-25 (repo-sync) — R-02: gate authorizes real facts

**Status:** PROPOSED — needs owner re-approval at PR review (frozen text above preserved verbatim).

§ Validation method, lines 122-124 (`organization_facts_verified = 0` … "zero facts should pass the gate today") is superseded. Roster facts pass the gate and publish: 58 names + Uppsala 20+4 (`apps/web/src/content/players-data.ts:12-23`; `apps/web/src/content/franchises-data.ts:24-27,33-36`; registries `players-data.ts:34-65`, `franchises-data.ts:45-79`; `knowledge/01-VERIFIED-FACTS.yaml:65,70`; `knowledge/07-CONTENT-TRUTH-POLICY.yaml:107-110`). The gate-authorization model (T6 approver) now operates on owner supplies EV-20260923-002 / EV-20260831-005/-006/-008, not on zero facts. T1-T9 themselves are unchanged — this amendment records that the gate has admissible facts to pass, not a rule loosening (gate weakening remains forbidden per § Change authority).
