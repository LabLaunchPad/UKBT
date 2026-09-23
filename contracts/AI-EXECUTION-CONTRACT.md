# AI Execution Contract

Status: FROZEN (2026-09-15). Changing this file is a re-approval event
(contracts/README.md rule 4: amendments need a new evidence record naming
the observation that invalidated the current text).

Authority: this contract is the single normative source for how AI agents
execute non-trivial work in this repository. `AGENTS.md`, `CLAUDE.md`,
and `knowledge/12-AI-CONTROL-PLANE.yaml` point here; where they overlap,
this contract governs. It extends — never replaces — the session-level
state machine in `CLAUDE.md`
(`ADMIT → BASELINE → FALSIFY → CONTRACT-FREEZE → PLAN → APPROVE →
IMPLEMENT → VERIFY → RELEASE → LEARN → REPLAY`): that machine governs a
working session, the machine below governs a task inside a session.
§2 states the mapping; any contradiction between the two is a defect in
this file, to be resolved by amendment, not by improvisation.

## 1. Absolute principle

NO CODE BEFORE GROUNDING. The required order is fixed:

REQUEST → GROUND → AUDIT → HISTORY → IMPACT → PLAN → IMPLEMENT →
VERIFY → ADVERSARIAL REVIEW → RELEASE

No step may be skipped. Code changes before PLAN_READY are a contract
violation, not a shortcut.

## 2. Task state machine (fail-closed)

Task states (task granularity; session granularity stays in CLAUDE.md):

```
REQUESTED → GROUNDING → AUDIT → HISTORY_AUDIT → IMPACT_ANALYSIS →
PLAN_READY → IMPLEMENTATION_AUTHORIZED → IMPLEMENTING → VERIFYING →
ADVERSARIAL_REVIEW → RELEASE_GATE → COMPLETE
```

Any state may transition to BLOCKED on missing evidence or failed
verification. BLOCKED exits only via re-plan or explicit scope reduction —
never by editing a gate, test, or threshold to obtain PASS.

Mapping to the session machine: GROUNDING/AUDIT/HISTORY_AUDIT =
BASELINE+FALSIFY; IMPACT_ANALYSIS/PLAN_READY = CONTRACT-FREEZE+PLAN;
IMPLEMENTATION_AUTHORIZED = APPROVE; IMPLEMENTING = IMPLEMENT;
VERIFYING = VERIFY; ADVERSARIAL_REVIEW = (independent falsification,
CLAUDE.md reviewer role); RELEASE_GATE/COMPLETE = RELEASE+receipt;
every task writes its lesson to LEARN (ERROR-CATALOG.md / knowledge/).

Entry/exit evidence per state (each exit requires the listed artifact;
without it the state is UNKNOWN and the task is BLOCKED):

| State | Entry requires | Exit requires |
|---|---|---|
| REQUESTED | task id, goal, requester | scope bounds (non-goals) |
| GROUNDING | scope bounds | FILES_INSPECTED list + current SHA |
| AUDIT | grounded file list | repo-convention findings (which contracts/knowledge apply) |
| HISTORY_AUDIT | audit findings | GIT_HISTORY_INSPECTED (log/blame/show refs) + prior-incident check |
| IMPACT_ANALYSIS | history findings | CHANGE_IMPACT_MATRIX (§4) + RISK/BLOCKER list |
| PLAN_READY | impact matrix | bounded CHANGE_PLAN + TEST_PLAN + ROLLBACK_PLAN, approved |
| IMPLEMENTATION_AUTHORIZED | approved plan | explicit authorization record (who/what/when) |
| IMPLEMENTING | authorization | diff confined to FILES_EXPECTED_TO_CHANGE |
| VERIFYING | diff | VERIFICATION_RESULTS: fresh gate/test runs with exit codes |
| ADVERSARIAL_REVIEW | verification results | break-attempt record per §9 (or INAPPLICABLE with reason) |
| RELEASE_GATE | adversarial record | `deploy:verify` fresh PASS + receipt per schemas/receipt.schema.json |
| COMPLETE | release receipt | lesson recorded (catalog ID or knowledge fact) |

Self-declaration rule: an agent must not claim a later state without the
exit evidence of every earlier state. Skipping a state forces BLOCKED.

## 3. Required evidence record

Every non-trivial task records all of: TASK_ID, REQUEST, SCOPE,
REPOSITORY_SHA, FILES_INSPECTED, GIT_HISTORY_INSPECTED,
DEPENDENCIES_INSPECTED, PLATFORM_RESEARCH, CURRENT_BEHAVIOR,
DESIRED_BEHAVIOR, RISKS, BLOCKERS, CHANGE_PLAN, AFFECTED_CONTRACTS,
TEST_PLAN, ROLLBACK_PLAN, VERIFICATION_RESULTS. Machine shape:
contracts/task-contract.template.yaml (fields added 2026-09-15 for this
section; unfilled fields are UNKNOWN, never assumed).

Grounding-truth hierarchy (highest first; lower never overrides higher):
current working repository → fresh execution → current Git history →
current generated artifacts → current production behavior → current
official platform documentation → current architecture/contract documents
→ previous incidents/learnings → previous reports → model memory.

Fail-closed conversions (absolute): UNKNOWN stays UNKNOWN; unproven
invariant ⇒ BLOCKED; failing test ⇒ NOT READY. Converting any of these
by weakening the check is forbidden (hard invariant, AGENTS.md).

## 4. Change-impact engine

Any architectural, configuration, dependency, routing, or contract change
produces a CHANGE_IMPACT_MATRIX over: build, runtime, routing, hosting,
assets, SEO, accessibility, performance, security, CI, deployment,
environment variables, caching, service worker, observability, rollback,
documentation. Each cell: UNAFFECTED (with reason) / AFFECTED (with
handling) / UNKNOWN (⇒ BLOCKED until resolved). The production-404
postmortem (I-1: adapter activated, serve mapping unexamined) is the
reference example of a missing matrix.

## 5. Change budget (declared before implementation)

FILES_EXPECTED_TO_CHANGE, FILES_FORBIDDEN_TO_CHANGE,
DEPENDENCIES_ALLOWED, DEPENDENCIES_FORBIDDEN, CONFIG_ALLOWED, SCOPE_LIMIT.
Default forbidden (require explicit approval): `.git/**`, `.env*`,
`**/*.pem`, `**/secrets/**`, contracts/* (amendment procedure, not
drive-by edit), CI thresholds/budgets (any numeric relaxation is gate
weakening). Any change outside the declared budget ⇒ BLOCKED → REVIEW.

## 6. Test-first failure model

For risky behavior, define the failing test BEFORE the fix: what fails
now, the smallest fix, proof it passes after. Tests prove observable
contracts (HTTP status/body, built-output artifacts, gate exit codes),
not implementation details. Regression rule: every repeatable failure
becomes a permanent check (gate/test) or a documented operational check
if automation is impossible.

## 7. Anti-hallucination rules

An agent must not invent: paths, APIs, package versions, platform
behavior, repository conventions, architecture, test results, deployment
state, production results. Every uncertain claim is UNKNOWN until
investigated with deterministic tools (read/grep/glob/execution);
LLM judgment is advisory, never authorization. Evidence classes from
CLAUDE.md apply: FACT, DERIVED, OBSERVED, MEASURED, INFERRED, PROPOSED,
APPROVED, UNKNOWN, STALE, SUPERSEDED, VALIDATION_RESULT.

## 8. Anti-overengineering rules

Before adding any dependency, framework, library, abstraction, service,
runtime, or configuration, answer WHY / ALTERNATIVES / COST / RISK /
REVERSIBILITY / MAINTENANCE / REPOSITORY FIT. Prefer existing capability,
native platform features, and small local abstractions. New dependencies
must pass scripts/check-dependency-allowlist.mjs (allowlist is the
enforcement, this section is the reasoning). CMS (TinaCMS) is an
editorial layer only: it must never bypass @ukbt/truth, provenance,
SEO, accessibility, performance, security, or deployment contracts.

## 9. Adversarial review (mandatory before release)

Assume the implementation is wrong and attempt to break: routing, build,
deployment, security, performance, accessibility, responsive behavior,
ClientRouter navigation (load, nav, back/forward, revisit, resize),
CMS variability, browser support, rollback, CI, production. Record each
attempt and its outcome; the implementing agent never approves its own
work — independence means a separate session, not a subagent inheriting
the same context. Untestable-in-scope items are listed as residual risks,
not silently dropped.

## 10. UI/motion/router/production-parity policies

- Visual work: DESIGN INTENT → COMPONENT → STATE → TRIGGER → MOTION →
  FALLBACK → ACCESSIBILITY → PERFORMANCE → LIFECYCLE → VERIFICATION.
  Motion stays code-owned (tokens-first per MOTION-CONTRACT.md); CMS
  must not control animation architecture. Five evidence kinds or
  NOT_VERIFIED: structural, visual, responsive, interaction,
  accessibility — at real viewports, never shrunken desktop.
- Page-bound behavior must account for initial load, ClientRouter
  navigation, back/forward, revisit, resize, dynamic content. Working
  on full reload only is NOT complete.
- LOCAL_BUILD = PASS is never proof of PRODUCTION = PASS. Prove the
  chain: source → build → deploy bundle → platform routing → HTTP
  behavior → browser behavior. Deployments succeed only when the
  post-deploy smoke check passes (scripts/smoke-deploy.mjs).

## 11. Deployment contract (normative restatement)

ACTUAL BUILD OUTPUT must match DEPLOYMENT CONFIGURATION must match
PLATFORM SERVING BEHAVIOR. Never assume a build directory: inspect
generated output. Enforced by scripts/check-deploy-mapping.mjs
(pre-deploy, in `deploy:verify` and CI) and scripts/smoke-deploy.mjs
(post-deploy). Full incident record: contracts/DEPLOYMENT-CONTRACT.md
2026-09-15 amendment; catalog AL-026.

## 12. Completion evidence language

Final claims use exactly: VERIFIED (evidence exists and is cited),
VERIFIED_WITH_LIMITATIONS (evidence exists; residual unknowns listed),
BLOCKED (missing evidence/invariant — named), FAILED (test/check failed
— named). Vague language ("probably", "should work", "looks good",
"likely fixed") is not a status and never closes a task.

## 13. Control-plane self-audit

After any change to this contract, its gates, or its knowledge, answer:
can a weak model skip planning? edit before investigation? hide a
failure? weaken a test? bypass a gate? declare deployment successful
without HTTP proof? ignore Git history? repeat a known incident?
introduce an unapproved dependency? modify forbidden files? Any YES ⇒
the control plane is defective: BLOCKED until fixed. Automated subset:
scripts/check-control-plane.mjs.

## 14. Reversal condition

This contract reverses only if the repository abandons machine-checked
gates as an enforcement mechanism (a documented architectural decision
with its own evidence record) — in which case its gates move with it,
and no agent improvises a replacement workflow.
