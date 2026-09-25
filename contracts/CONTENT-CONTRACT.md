# Content Contract

**ID:** CONTRACT-CONTENT-01
**Status:** FROZEN · Stage 3 (Contract Freeze)
**Purpose:** Fix the typed content shape UKBT's future facts will live in,
before any real fact exists — so the truth gate (`TRUTH-CONTRACT.md`) has
a concrete schema to validate against at Stage 4.

## Outputs / Frozen content types (structure only — zero real values)

Each type below is a planned Zod schema in `packages/truth/content/`. No
instance of any type currently contains a real UKBT value
(`organization_facts_verified = 0`, `knowledge/07`).

| Type | Fields (representative, not exhaustive — finalized at Stage 4) | Org-fact? |
|---|---|---|
| `ClubInfo` | name, founded_year, ground, league_affiliation, description | Yes |
| `LeadershipMember` | name, role, bio, photo, term | Yes |
| `Player` | name, squad_number, position, photo, bio | Yes |
| `Fixture` | opponent, date, venue, competition | Yes |
| `Result` | fixture_ref, score, scorers, report | Yes |
| `Statistic` | metric, value, period, source | Yes |
| `MediaAsset` | file_ref, caption, credit, rights_status | Yes (rights_status is itself governed by `ASSET-CONTRACT.md`) |
| `ContactDetail` | channel, value, purpose | Yes |
| `GenericCopy` | body text with no org-specific claim | No — `not_organization_claims` per `knowledge/07` |
| `UIString` | button/nav labels | No — exempt per `knowledge/07` |

Every field on an org-fact type carries the truth-gate metadata
(`sources: RegistryId[]`, `status`, `validUntil`, `approver?`) as a
structural part of the schema, not an optional bolt-on — this is what
makes `T1`'s fail-closed default mechanically real: a new field added
without this metadata fails to compile against the base schema, not merely
fails a lint warning.

## Placeholder discipline (binding, restated from `knowledge/07`)

- Placeholder values use the sentinel `__PLACEHOLDER_<FIELD>__`, always
  paired with `status: draft` and `sources: []`.
- A plausible-looking invented value in a content fixture (a realistic
  name, date, or score) is never used — it is an invented fact, not a
  placeholder, and is prohibited absolutely (`knowledge/07`
  `placeholders.prohibited_absolutely`).
- Test fixtures use the sentinel form exclusively; CI checks its *absence*
  in production builds and its *presence* where fixtures expect it
  (`ARCHITECTURE-PROPOSAL-V3.md` §4).

## Invariants

- Content schemas and their provenance rules (`sources`, `validUntil`,
  `approver`) live together in `packages/truth`, never split into a
  separate package (`INV-013`).
- No content type instance is populated from `artifacts/extraction/` or
  any Adelux demo content (`LP-01`, `knowledge/06`).
- `not_organization_claims` (generic copy, UI labels, solicitor-supplied
  legal boilerplate) are the only fields exempt from the provenance
  requirement — the exemption list is closed, not inferred per-field by
  whoever is writing content.

## Forbidden behavior

- Inventing a plausible value for any org-fact field, ever, including
  "just for now" or "just for the demo."
- Widening the `not_organization_claims` exemption list without a
  recorded reason.
- Storing content outside `packages/truth/content/` (e.g. inline in an
  Astro page) for any org-fact type.

## Validation method

- Zod schema compilation itself rejects a content file missing required
  provenance fields.
- Truth-gate unit tests (`TRUTH-CONTRACT.md`) validate each type's fixture
  set covers at least the 8 cases already proven buildable
  (`EV-20260826-020`).
- `CI-CONTRACT.md`'s content-schema and truth-gate gates run on every PR.

## Owner

Track C (schema construction, exempt-field list, fixture discipline) —
none of this requires Track B, since no schema instance yet holds any
Adelux-derived or real UKBT value. Populating a real instance with a real
fact is gated by `TRUTH-CONTRACT.md`'s gate-authorization rule, not by
Track B (a content fact and a design/visual adaptation are different
gates).

## Dependency

`TRUTH-CONTRACT.md` (the gate this schema is validated by).
`REPOSITORY-CONTRACT.md` (`packages/truth/content/` location).

## Change authority

Adding a content type, or changing which fields are exempt from
provenance, requires stating the type/field and confirming against
`knowledge/07`'s `organization_claims` / `not_organization_claims` lists —
amend those lists first if the classification itself is wrong, rather than
special-casing a field inside this contract.

## Evidence required

None new. `knowledge/07-CONTENT-TRUTH-POLICY.yaml` is the source these
types are derived from.

## Reversibility

REVERSIBLE. No instance data exists yet; schema fields can be added or
renamed freely until the first real content file is written against them.

## Amendment, 2026-08-27: RM-5 resolved as Option A, with a real-shape finding

**Owner decision (RM-5, `artifacts/receipts/RELEASE.md`):** preserve the
compile-time/schema-validated provenance guarantee (Option A) rather than
amend this contract down to runtime-only (Option B).

**What implementing Option A actually found:** the aggregate types in
`packages/truth/src/schema/content-types.ts` (`ClubInfo`,
`LeadershipMember`, `Player`, `Fixture`, `Result`, `Statistic`) were
authored at Stage 3, before any real content existed
(`organization_facts_verified = 0` at the time). Once real content was
gathered, it took a different, per-field shape —
`{field, value, status, sources}`, one record per fact, e.g.
`org.tagline`, `captain.dob`, `uppsala.signing.chowdhury` — validated only
by the plain `ContentRecord` TypeScript interface in
`packages/truth/src/gate/types.ts` and the truth gate's T1-T8 rules. None
of the five real content files (`apps/web/src/content/*.ts`) actually
matches an aggregate type's shape: a `Fixture` requires `opponent`/`venue`;
a tournament-calendar entry (what `tournaments-data.ts` actually holds)
has neither. Forcing that fit would mean inventing placeholder values for
fields the content domain doesn't have — worse than the drift it would
supposedly fix.

**What was done instead, faithfully to Option A's actual invariant** (a
new field lacking provenance metadata fails validation, not just a lint
warning): added `ContentRecordSchema` to
`packages/truth/src/schema/provenance.ts` — a Zod mirror of the
`ContentRecord` interface itself, reusing `ContentStatusSchema` and
`RegistryIdSchema`. Every one of the five real content files now calls
`ContentRecordSchema.parse(...)` before `evaluate()` runs, closing the
literal gap this contract's finding named ("no file under
`apps/web/src/content/` imports or uses any of them") for the shape real
content actually uses, rather than the shape speculated before any of it
existed. Verified adversarially, not just asserted: a new test
(`packages/truth/src/schema/content-types.test.ts`) confirms an invalid
`status` value now throws at parse time — previously `gate/rules.ts`'s
`evaluate()` only special-cases `'draft'` and would silently run a typo'd
status (e.g. `'publised'`) through the full T1-T8 checks unflagged.

**What is still open, recorded rather than silently dropped:** the
Stage-3 aggregate types (`ClubInfo`, `LeadershipMember`, `Player`,
`Fixture`, `Result`, `Statistic`) remain unused by any real content file.
Whether to reshape real content to populate them, retire them, or leave
them as forward-looking schemas for content types not yet gathered
(fixtures/results genuinely don't exist yet) is a separate, smaller
decision than RM-5 was — not resolved here, not invented as a default.

## AMENDMENT 2026-09-25 (repo-sync) — R-01: zero-facts, location, reversibility superseded

**Status:** PROPOSED — needs owner re-approval at PR review (frozen text + 2026-08-27 amendment above preserved verbatim).

1. **Zero-facts (§ Outputs, lines 11-13):** superseded. Real gated instances exist: `apps/web/src/content/players-data.ts:12-23` (58 roster records + 4 officials, 50 pictured + 8 monograms) and `apps/web/src/content/franchises-data.ts:33-36,45-79` (Uppsala 20 + 4, all pictured), each gated via `ContentRecordSchema.parse` + `evaluate()` per file headers (`players-data.ts:26-32`; `franchises-data.ts:37-43`). `knowledge/07-CONTENT-TRUTH-POLICY.yaml:107-110` (updated 2026-09-25) records `organization_facts_verified: ">0"`, `evidence_registry_populated: true`; `knowledge/01-VERIFIED-FACTS.yaml:65,70` records both rosters KNOWN.
2. **Location rule (§ Forbidden behavior, line 65; § Dependency, line 89):** superseded. Content lives at `apps/web/src/content/*-data.ts` (8 modules, verified by listing) validated against `@ukbt/truth` — the enforced shape is `ContentRecordSchema` in `packages/truth/src/schema/provenance.ts:59` (per-field `{field, value, status, sources}` records), not the Stage-3 aggregate types; the 2026-08-27 amendment above (lines 115-146) already admits the real content files never matched aggregate shapes. INV-013 co-location holds at gate/schema level, not file-path level. `apps/web/src/content/` is the sanctioned location with its validation binding (`ContentRecordSchema.parse` before `evaluate()`, plus the parse-time proof in `packages/truth/src/schema/content-types.test.ts:57`).
3. **Reversibility (§ Reversibility, lines 104-107):** superseded. Instance data exists (58 + Uppsala 20+4); schema renames now migrate live content, not greenfield.
