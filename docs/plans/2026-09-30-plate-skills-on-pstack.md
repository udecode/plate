# Plate skills on top of pstack

Status: done
Topic: pstack

## Outcome

Every Plate skill holds only Plate knowledge. pstack's poteto-mode and the pstack block in `AGENTS.md` own lifecycle, tests, review, plans and delivery. Skills that owned the same decision are merged, and every name the owner has typed still works as an alias or entry point. The 2026-09-30 pstack setup's regressions are fixed.

## Scope

In scope: `.agents/rules/**`, their generated skills, `AGENTS.md`, the scripts that read skill paths, the docs that route to skills, and the `sync-pstack` skill in `udecode/dotai`.

Out of scope: product code, the review-ledger schema, the issue-ledger consolidation and the `plate-next/rules/review-law.md` cut (deferred below).

## Decisions

- Typed counts come from all Codex and Claude Code history, deduplicated across forked sessions. A typed name keeps a typed-only alias; a never-typed skill merges without one.
- Merge only skills that own the same decision. Domain skills that own different decisions stay separate (the 2026-09-05 audit rejected a general master skill).
- `/plan` is a built-in Claude Code command, so the merged plan skill is `architecture`.
- `task` stays the ordinary plan-and-execute skill. `architecture` handles architecture and API adoption only.
- `best-api-review` becomes Plate-owned; only plate-2 installs it.

## Steps

### Phase 0. Setup regressions

- [x] F1 `sync-plate-ui` works in downstream apps again: its plan lives in `.plate-ui-sync/runs/**`, with no poteto-mode or `.agents/pstack` dependency.
- [x] F2 No skill asks to copy a deleted template (maintainer, release-lanes, slate-ar, clawsweeper, editor-test-harvester, sync-vision). Proof: `grep -rn "templates/" .agents/rules/*.mdc` lists only the benchmark and plate-feature templates.
- [x] F3 best-api-review's Pursue hands coupled work to `$task plan` and clear adoption to `architecture`; no route names pstack's Multi-phase plan; plate-plan's "bounded challenge" credits the Architecture decisions section.
- [x] F4 No live route names the deleted `patch` except through the restored `patch` entry point.
- [x] F6 A project exception allows runtime capability-gated `.skip`.
- [x] F7 The PR template and `CONTRIBUTING.md` name `apps/www/src/registry/changelog/entries/*.mdx`.
- [x] F8 `maintainer/references/slate-issue.md` names the PR template sections, not a "task-style body".
- [x] S2 Ledger drafts go to `docs/plans/artifacts/`.

### Phase 1. Typed entry points

- [x] S3 `task`: `task <goal>`, `task plan <goal>`, `task execute <plan>` or "go", `task full <goal>`; the plan format lives in the skill.
- [x] S4 `patch`: pstack's Bug fix playbook driven by Verify Plate. Rule: `.agents/rules/patch.mdc`.
- [x] S5 `autoclosure`: assess, repair, Babysit and PR cleanup; comments, closes and merges only on the owner's word. Rule: `.agents/rules/autoclosure.mdc`.

### Phase 2. Merges

- [x] M1 `architecture` absorbs plate-plan and plite-plan; `plate-plan` and `plite-plan` stay as aliases that preselect a layer.
- [x] M2 `verify-plate` absorbs testing; `testing` alias.
- [x] M3 `changeset` absorbs registry-changelog. Reference: `.agents/rules/changeset/references/registry.md`.
- [x] M4 `research` absorbs plite-research and research-wiki and picks what to research for any Plate or Plite feature; `plite-research` and `research-wiki` aliases.
- [x] M5 `sync-shadcn` gains a `parity` mode; `shadcn-parity` alias.
- [x] M6 `benchmark` absorbs slate-ar as `references/autoresearch.md`; `slate-ar` alias.
- [x] M7 slate-migration is retired. Retired in `.agents/rules/plate-next/scripts/sync-resources.mjs`.
- [x] M8 `best-api-review` is one Plate-owned rule; the dotai install and `best-api/references/review.md` are gone; `review-ledger.mjs` reads the new path.
- [x] Callers repointed: `AGENTS.md` routing, vision docs, research command docs, `CONTRIBUTING.md`, `version.mjs` required skills, `sync-resources.mjs` retired paths, the doctrine version.

### Phase 3. Trims

- [x] T1 Planning and audits: plate-next, hard-cut, architecture-cleanup, plate-review, editor-audit. Rules: `.agents/rules/architecture-cleanup.mdc`, `.agents/rules/plate-next.mdc`, `.agents/rules/editor-audit.mdc`.
- [x] T2 Research: editor-test-harvester, issue-harvester, clawsweeper, gpt-pro, sync-vision. Rule: `.agents/rules/editor-test-harvester.mdc` (1,029 to 398 lines).
- [x] T3 Build and UI: only the verbatim sync-shadcn duplicate was cut; the rest was dismissed after measuring 1-3 percent textual overlap and finding plate-ui law with no other owner. Measurement: 6-word shingle overlap, logged in `docs/plans/2026-09-30-plate-skills-on-pstack.decisions.tsv`.
- [x] T4 Release and public queue: maintainer and github-issue-reporter trimmed; the release-lanes fold was dismissed. Rule: `.agents/rules/maintainer.mdc`.
- [x] T5 API, proof and perf: dismissed; best-api owns the canonical hard-cut gate and benchmark's shared text is test-asserted. skip: measured overlap 0-3 percent; see the T5 row in `docs/plans/2026-09-30-plate-skills-on-pstack.decisions.tsv`.

### Phase 4. Shared layer in dotai

- [x] S6 `sync-pstack discover` counts typed invocations, and setup keeps every typed command unless the owner drops it.
- [x] F5 An optional `regen` config field renders the project's regeneration command; plate-2 uses `pnpm install`.
- [x] plate-2 owns `best-api-review` (owner's choice); dotai's copy is removed in dotai commit 4587e6e.

### Phase 5. Closest to pstack (owner: "go all")

- [x] P1 Plate Next doctrine versioning stops fingerprinting skill files; it versions package attestations only. Proof: `bun test ./.agents/rules/plate-next/scripts/version.test.mjs`.
- [x] P2 plate-next shrinks to doctrine sync and package review for the live packages; its plan template is deleted. Rule: `.agents/rules/plate-next.mdc`.
- [x] P3 verify-plate is renamed `verify`; `verify-plate` stays as an alias.
- [x] P4 Restated rules have one owner: Benchmark owns the pre-acceptance probe, the pstack block owns plan-open, plate-plugin-creator owns plugin capabilities. Link targets: `.agents/rules/benchmark.mdc` and `.agents/rules/plate-plugin-creator/rules/capabilities.md`.
- [x] P5 The testing, slate-ar and shadcn-parity aliases are dropped. Retired in `.agents/rules/plate-next/scripts/sync-resources.mjs`.
- [x] P6 gpt-pro moves to dotai as a global skill. dotai commit 71ae075.
- [x] P7 hard-cut folds into architecture-cleanup as its delete packet, with an alias. Rule: `.agents/rules/architecture-cleanup.mdc`.
- [x] P8 plate-review is deleted with its scorer, test and routes. Removed `tooling/scripts/plate-review-score.mjs`.
- [x] P9 clawsweeper merges into issue-harvester after a ledger schema check, with an alias. Reference: `.agents/rules/issue-harvester/references/slate-claims.md`.

### Close

- [x] `pnpm install`, then `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`.
- [x] `node .agents/rules/plate-next/scripts/version.mjs validate`.
- [x] `node tooling/scripts/review-ledger.mjs check`: fails only on another session's stale markdown-streaming inventory.
- [x] Focused tests: version, sync-resources, check-plate-feature, plate-review-score, benchmark-contract, collect-vision-diff, release. Ran `bun test` on the 8 files: 137 pass.
- [x] No dangling link this run created; two predate it (moved product files). Scan: the generated-skill link check in `docs/plans/2026-09-30-plate-skills-on-pstack.decisions.tsv`.
- [x] `sync-pstack check` passes for plate-2.
- [x] Read-only smoke tests in Claude Code and Codex route `$task plan`, `$research`, `$plite-plan`, `$patch`, `$testing audit` and `$best-api-review` to their owners.
- [x] `pnpm lint:fix` on touched code; changes left uncommitted for the owner.

## Deferred

- One owner for every issue ledger (issue-harvester absorbing `editor-test-harvester --issues` and clawsweeper's external-editor mode) after a schema check, because three ledger formats have drifted. owner: issue-harvester, tracked in this plan until its schema check runs.
- Cutting `plate-next/rules/review-law.md` after each owner confirms it covers the rule. owner: plate-next, tracked in this plan.
