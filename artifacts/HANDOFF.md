# 🔄 Agent Handoff — OKF Knowledge Bundle Integration

## Current State

**Repo**: `C:\ukbt-uk-bangla-tigers\UKBT-src` (git: `LabLaunchPad/UKBT.git`)
**Branch**: `main` (merged at commit `51bb451`)
**PR**: #76 — `feat: add OKF knowledge bundle index, update AGENTS.md, add opencode.json`
**All 18/18 CI checks PASSED**

### Files Changed
| File | Change | Lines |
|---|---|---|
| `AGENTS.md` | Updated — added OKF section, visual truth section, evidence classification, agent topology | +43 |
| `index.md` | Created — Full OKF v0.2 bundle index with YAML frontmatter | +229 |
| `opencode.json` | Created — References AGENTS.md, README.md, index.md | +1 |

### Key Details
- **pnpm monorepo**: `apps/*` and `packages/*` workspaces, Node >=22, pnpm >=10.33.0
- **deploy:verify order**: scaffold-self-test → check:control-plane → check:deps → lint → tokens:build → typecheck → test:unit → build → check:deploy-mapping → test:failure-injection → check:links → check:seo → check:ui → check:motion → check:security → check:perf
- **All 18 checks passed**: Build, Control plane, Dependency allowlist, Deploy failure injection, Deploy mapping, Governance scaffold, Install, Internal link integrity, Lint (Biome), Motion gate, Performance budgets, Playwright (4m22s), SEO gate, Secret scan, Security headers, Typecheck, UI gate, Unit/integration tests, Workers Builds
- **opencode.json**: Valid JSON with `instructions: ["AGENTS.md", "README.md", "index.md"]` and `username: "ukbt-agent"`
- **32 opencode agents** defined in `.opencode/agents/`
- **knowledge/ directory**: 13 YAML files with evidence-linked decision substrate
- **contracts/ directory**: 21 frozen Markdown contracts

### Agent Roles (from `knowledge/09-AGENT-HARNESS-POLICY.yaml`)
- Roles are accountability vocabulary, NOT a spawn list
- Independence requires SEPARATE_SESSION, not subagent
- Single writer for application code
- `.claude/agents/` is empty by design

---

## Recommended Agents for Next Steps

### 1. `engineering-knowledge-graph-engineer` — HIGH PRIORITY
**Why**: The `knowledge/` directory has 13 YAML files that could benefit from graph-based structuring. The `index.md` maps them but they're still flat files. This agent should:
- Structure the knowledge corpus as interconnected entity-relationship nodes
- Add provenance edges linking each knowledge file to its evidence sources (EV-xxxxx IDs)
- Build a queryable graph from the knowledge YAML files
- Ensure every claim in `01-VERIFIED-FACTS.yaml` traces to source nodes
- Cross-reference bi-directionally between knowledge files
- Flag orphan nodes and contested claims

### 2. `testing-reality-checker` — HIGH PRIORITY  
**Why**: The PR was merged but the Playwright test took 4m22s. This agent should:
- Verify the merged state in production
- Cross-check that `index.md`, `AGENTS.md`, and `opencode.json` render correctly
- Validate that the OKF bundle is properly structured
- Run the deploy mapping check to ensure wrangler.jsonc paths are correct
- Confirm the build output matches expectations

### 3. `marketing-ai-citation-strategist` — MEDIUM PRIORITY
**Why**: This is a new website project. AEO/GEO optimization should be considered early:
- Audit UKBT brand visibility across ChatGPT, Claude, Gemini, Perplexity
- Check if the OKF knowledge bundle structure helps AI citation
- Verify structured data and schema markup on key pages
- Recommend content fixes to improve AI citations
- The `knowledge/07-CONTENT-TRUTH-POLICY.yaml` already defines content truth rules

### 4. `marketing-seo-specialist` — MEDIUM PRIORITY
**Why**: SEO gates are part of `deploy:verify`. The SEO check passed but ongoing optimization needed:
- Review `docs/tina-integration.md` and `docs/tina-client-guide.md` for SEO implications
- Check `knowledge/11-VISUAL-TRUTH-POLICY.yaml` for visual SEO impact
- Verify `scripts/check-seo.mjs` findings are addressed
- Review the 12-page site for structured data opportunities
- Check `apps/web/public/llms.txt` for LLM crawler optimization

### 5. `security-architect` — MEDIUM PRIORITY
**Why**: Security checks passed but ongoing threats exist:
- Review `scripts/check-security.mjs` and `scripts/check-deploy-mapping.mjs` for gaps
- Check if `wrangler.jsonc` observability settings are properly configured
- Verify `tina/config.ts` doesn't expose secrets
- Check `.github/workflows/ci.yml` for any security gaps
- Review the 18 CI checks for any that could be bypassed

### 6. `engineering-code-reviewer` — LOW PRIORITY
**Why**: Review the new files for quality:
- Verify `index.md` YAML frontmatter is valid
- Check `opencode.json` schema compliance
- Review `AGENTS.md` for consistency with `CLAUDE.md`
- Ensure no hardcoded values that should be in contracts

### 7. `agents-orchestrator` — LOW PRIORITY
**Why**: Manage the next pipeline stage:
- Coordinate the handoff between agents above
- Track progress on knowledge graph construction
- Manage the QA loop for the merged changes
- Ensure all agents complete their tasks before marking done

---

## Other Recommended Things

### OpenCode Config Notes
- `opencode.json` has `instructions` array loading AGENTS.md, README.md, index.md
- 32 agents in `.opencode/agents/` are auto-loaded by opencode
- No `.opencode/skills/` or `.opencode/commands/` directories exist yet
- Consider adding `.opencode/skills/` for OKF-specific skills

### Knowledge Base Gaps to Address
1. **`knowledge/06-TEMPLATE-BOUNDARY.yaml`** — Adelux template boundary needs updating after merge
2. **`knowledge/12-AI-CONTROL-PLANE.yaml`** — Pipeline state may need updating after PR merge
3. **`knowledge/01-VERIFIED-FACTS.yaml`** — Add new verified facts about OKF integration
4. **`artifacts/receipts/`** — Should have a new receipt for the OKF integration

### Contract Considerations
- **`contracts/REPOSITORY-CONTRACT.md`** — May need to reference OKF as a new standard
- **`contracts/DESIGN-SYSTEM-CONTRACT.md`** — Design tokens should align with OKF structure
- **`contracts/CONTENT-CONTRACT.md`** — Content truth rules should reference OKF bundle format

### Pipeline Notes
- `deploy:verify` order includes `check:control-plane` and `test:failure-injection`
- The `scripts/check-deploy-mapping.mjs` validates `wrangler.jsonc` paths against build output
- `pnpm tokens:build` must run before `typecheck` and `build`
- `@astrojs/cloudflare` is a production dependency (not devDependency) in the merged state

---

## Verification Checklist for Incoming Agent

- [ ] `pnpm install` completed (deps verified)
- [ ] `pnpm deploy:verify` all 18 checks passed
- [ ] `opencode.json` valid JSON with 3 instructions
- [ ] `index.md` has valid YAML frontmatter with `okf_version: "0.2"`
- [ ] `AGENTS.md` has OKF section at top (lines 3-17)
- [ ] Git branch `main` synced with `origin/main`
- [ ] PR #76 merged at commit `51bb451`
- [ ] All 32 `.opencode/agents/` definitions intact
- [ ] `knowledge/` directory has 13 YAML files
- [ ] `contracts/` directory has 21 Markdown files
- [ ] `artifacts/` directory has 21 subdirectories

---

*Handoff created by: UKBT Agent | Date: 2026-09-15 | Commit: 51bb451*
