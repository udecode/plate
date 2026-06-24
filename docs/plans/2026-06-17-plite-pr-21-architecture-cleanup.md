# slate pr 21 architecture cleanup

Objective:
Audit merged Plite PR #21 architecture; done when changed files are ranked, safe cleanups verified, and this plan closes.

Goal plan:
docs/plans/2026-06-17-slate-pr-21-architecture-cleanup.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- none

Cleanup source:
- type: merged GitHub PR
- id / link: https://github.com/udecode/slate/pull/21
- title: feat(yjs): add Plite Yjs collaboration package
- merge commit: f33726b7a920e81abe5533b70a68dfb1196e9539
- base: v2
- requested surface: every file changed by PR #21, with code-shape focus on the new `packages/plite-yjs` package and its touched Plite integration files
- cleanup intent: ensure the merged Yjs package and related proof/examples/scripts are architecturally consistent, not AI-split/confetti code, and safe for the upcoming Plite into Plate migration
- acceptance criteria: PR #21 changed files are inventoried, at least five candidate areas are scored, safe behavior-neutral cleanups are applied and verified, and any broader runtime/API concerns are routed instead of half-patched

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.
- Explicit prompt requirements:
  - PR #21 was merged.
  - Run `$architecture-cleanup`.
  - Surface is all files changed by PR #21.
  - Goal is consistency cleanup after merge.
  - Patch safe cleanup issues if found.
  - Do not turn this into the broader Plite into Plate migration.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A
- initial confidence / cleanliness score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- PR #21 changed files are inventoried from the merge commit, source/proof owners are mapped, at least five candidate areas are scored, every candidate gets a keep/merge/inline/defer/reject/plan decision, safe packets are verified, and no speculative dirty work remains.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-pr-21-architecture-cleanup.md`
  passes.

Verification surface:
- PR #21 merge diff inventory from `.tmp/plite`.
- Source/importer audits over `packages/plite-yjs`, touched Plite integration files, examples, scripts, and docs/proof files.
- Focused `packages/plite-yjs` typecheck/test after any code cleanup.
- Broader `.tmp/plite` fast gate if import churn or cross-package source changes are applied.

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Do not change public API, product UX, or behavior under a cleanup packet.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.

Boundaries:
- Source of truth: PR #21 merge commit, live `.tmp/plite` source/tests, root `VISION.md`, `docs/vision/slate.md`, `docs/vision/common.md`, and the architecture-cleanup skill.
- Allowed edit scope: files changed by PR #21 in `.tmp/plite` plus this plan.
- Plite / Plate boundary: Plite only; no Plate migration in this run.
- Public API boundary: no public API or package export changes unless a source-backed issue is found and verified.
- Browser surface: examples and Playwright/proof scripts are in scope for source audit; browser proof only if visible behavior code changes.
- Package/API surface: `packages/plite-yjs` package config/exports and touched Plite packages are in scope.
- Non-goals: no Plite into Plate package transplant, no docs IA migration, no Yjs feature work, no release/publish, no PR/commit unless separately requested.

Output budget strategy:
- Use merge diff names/stats first. Inspect source slices and symbol outlines instead of dumping full files. Exclude `bun.lock`, generated output, `.next`, `node_modules`, and large transient proof artifacts unless directly needed.

Blocked condition:
- Stop if the next useful cleanup changes Yjs runtime semantics, collaboration protocol, package public API, or browser-visible behavior without a narrow proof owner.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: major-audit
- current_phase: closeout
- current_phase_status: complete
- next_phase: maintainer review or commit when requested
- goal_status: ready-to-close

Current verdict:
- verdict: keep repaired packet
- cleanliness confidence: high after focused package proof and full `bun check`
- next owner: maintainer review or commit when requested
- keep / revert / quarantine call: keep
- reason: PR #21 had real merge drift against current Plite root/value/public-hook/release-proof policy; drift is repaired and verified.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-pr-21-architecture-cleanup.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Explicit prompt requirements copied into First checkpoint. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `architecture-cleanup` loaded | yes | User provided full skill body for `/Users/zbeyens/git/plate-2/.agents/skills/architecture-cleanup/SKILL.md`; workflow applied. |
| Active goal checked or created | yes | No active goal existed; created goal for this plan. |
| Source of truth read before analysis | yes | Read VISION, slate/common vision detail, autogoal, PR metadata, and merge diff inventory. |
| VISION fit gate read | yes | Cleanup must keep Plite raw-substrate boundaries and avoid line-count splitting. |
| Plite / Plate boundary selected | yes | Plite PR #21 only; no Plate migration. |
| Cleanup surface selected | yes | Files changed by PR #21 merge commit `f33726b7...`. |
| Non-goals recorded | yes | See Boundaries. |
| Output budget strategy recorded | yes | See Output budget strategy. |
| Implementation authority decided | yes | Behavior-neutral cleanups only; runtime/API/protocol changes route to owner. |
| Proof strategy selected | yes | Source audits plus focused slate-yjs proof; broad gate if code changes need it. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Source map records largest files, owner files, package exports, public /
      private boundaries, tests, and proof owners for the surface.
- [x] Deslop inventory records wrappers, pass-through modules, duplicate
      helpers, vague names, stale compatibility, over-broad barrels, orphan
      tests, and stale source-owner oracles.
- [x] Candidate matrix ranks at least five candidates unless the prompt names a
      smaller surface.
- [x] Every candidate has a decision: delete, merge, inline, simplify, split,
      keep, defer, reject, or plan.
- [x] Every candidate records an agent-navigation score: files-to-read,
      owners-touched, proof clarity, public/private clarity, and net effect.
- [x] Anti-confetti rule applied: no split is accepted without durable owner,
      stable name, focused proof, and lower future navigation cost.
- [x] Merge/delete/inline are considered as seriously as extraction.
- [x] VISION fit is recorded; missing reusable taste routes to `vision` or
      `sync-vision`.
- [x] Implementation packets are behavior-neutral, public-API-neutral, narrow,
      reversible, and have focused proof.
- [x] Each implementation packet ends keep, revert, or quarantine.
- [x] Source-owner oracle is added or repaired when ownership moves, or N/A
      reason is recorded.
- [x] Focused proof is run before broad proof for changed code.
- [x] Broad proof is run after multiple packets, import churn, or public/package
      boundary changes.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source audits, focused package proof, and fast gate | `bun check` passed in `.tmp/plite`; focused `@slate/yjs`, `slate`, `plite-react`, `plite-browser`, site, and public import gates also passed. |
| Source map complete | yes | Record current owners, largest files, exports, tests, and proof owners | PR #21 local merge diff: 144 files, 26151 insertions, 47 deletions; meaningful code/proof slice: 68 files, 15552 insertions, 42 deletions. Largest new source files recorded in Candidate matrix. |
| Deslop inventory complete | yes | Record concrete stale/shallow/duplicated/over-split surfaces | Found and deleted dead `tmp/yjs-collaboration-soak.mjs` compatibility wrapper; found merge drift in root value reads, public decoration API, export barrel, and release-proof script oracle. |
| Candidate matrix complete | yes | Rank candidates with facts, action, owner, proof, and decision | Candidate matrix has 9 rows with keep/delete/repair/plan decisions. |
| Agent-navigation score complete | yes | Record files-to-read / owner / proof clarity changes | Each candidate records before/after navigation score. Net packet removes a dead wrapper and aligns tests with source owners. |
| Anti-confetti gate | yes | Prove accepted splits reduce navigation cost or record no split accepted | No split accepted. Large files were kept or routed because no durable smaller owner justified churn. |
| Delete / merge / inline gate | yes | Record considered simplifications and why accepted/rejected | One delete accepted; merge/inline not useful for cohesive Yjs projection/controller files. |
| VISION fit gate | yes | Confirm fit to VISION.md or record sync-vision/stop decision | Fits VISION: no public `main` root, no fake aliases, current-state docs, proof before claim, behavior-neutral cleanup. |
| Implementation packet gate | yes | For every code packet, record keep/revert/quarantine and focused proof | Packets P1-P6 kept after focused and broad proof. |
| Source-owner oracle gate | yes | Repair or add tests/oracles when ownership moves, or N/A | Repaired plite-browser scenario oracle; kept Yjs package config oracle; no ownership moved. |
| Public API / behavior safety gate | yes | Prove no unintended public API/product behavior changed | Restored expected `plite-browser/core` export; switched Yjs React to public hook; public import smoke passed. |
| Package/API proof | yes | Run relevant package/export/type/build proof when package boundaries changed, or N/A | Package typechecks passed; public package import smoke passed. |
| Browser proof | no | Run Browser/Playwright proof when visible behavior changed, or N/A | N/A: no browser-visible behavior changed; site examples only type/read current value and badge metadata were fixed. |
| Final lint/check | yes | Run focused/broad lint/typecheck/test appropriate to touched files | `bun check` passed from `.tmp/plite`. |
| Output budget discipline | yes | Verify no unbounded high-volume output was streamed, or record recovery | One broad `rg` accidentally hit `.next`; recovery recorded and later searches excluded generated output. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish current packet cleanly; otherwise N/A | N/A: no duration requested. |
| Final handoff contract | yes | Fill changed list, cleanup counts, proof, needs-review, residual risks, and next owner | Filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-pr-21-architecture-cleanup.md` | Ready to run after this closeout update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | PR #21 metadata and merge commit read. | source map |
| Source map | complete | Merge diff and largest Yjs files inventoried. | deslop inventory |
| Deslop inventory | complete | Dead wrapper and API drift surfaces recorded. | candidate matrix |
| Candidate matrix | complete | 9 candidates scored and decided. | cleanup packets / owner routing |
| Cleanup packets / owner routing | complete | Six narrow packets applied, larger splits routed to later owner. | verification |
| Verification | complete | Focused and broad gates passed. | closeout |
| Closeout | complete | Plan updated; final response next. | final response |

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | strong | Dead Yjs soak wrapper | `tmp/yjs-collaboration-soak.mjs` | Wrapper only forwarded to `scripts/proof/yjs-collaboration-soak.mjs`; exact scoped `rg` found no references. | Before: one extra stale hop under committed `tmp`; after: direct script owner only. | delete | architecture-cleanup | exact `rg`, package config test, `bun check` | deleted |
| 2 | strong | Rootless primary value drift | `packages/plite-yjs/src/core/editor-adapter.ts`, Yjs examples | PR still read `state.value.get().roots.main`, but public value now exposes primary root as `children`. | Before: agents must remember private `main`; after: current public value API. | simplify | slate-yjs | `@slate/yjs` typecheck, 243 Yjs tests, site typecheck, `bun check` | repaired |
| 3 | strong | Private Plite React decoration source import | `packages/plite-yjs/src/react/index.ts` | `createRangeDecorationSource` is not exported from `plite-react`; public hook is `usePliteRangeDecorationSource`. | Before: package compiles only against private mental model; after: one public hook owner plus Yjs DOM refresh. | simplify | slate-yjs / slate-react | `@slate/yjs` typecheck, Yjs React contract, slate-react surface contract | repaired |
| 4 | strong | Runtime-impact narrowing drift | `packages/plite/src/core/runtime-impact.ts`, `public-state.ts` | `operationChangesTextContent` returned boolean, so TypeScript could not narrow `operation.path`. | Before: generic helper not type-safe; after: helper is a type guard. | simplify | slate core | slate typecheck, snapshot contract, `bun check` | repaired |
| 5 | strong | plite-browser export/oracle drift | `packages/plite-browser/src/core/index.ts`, `packages/plite-browser/test/core/scenario.test.ts` | `createPersistentBrowserSoakProofArtifact` existed and scripts imported it, but core barrel dropped it; scenario test expected persistent soak inside `test:release-proof` while package config keeps long soaks manual-only. | Before: tests contradicted source/package policy; after: export and oracle agree. | repair oracle | plite-browser | public import smoke, plite-browser core tests, `bun check` | repaired |
| 6 | medium | Yjs example badges | `site/constants/examples.ts` | Site badge type only accepts `alpha`; PR added `new`, which also violates current-state docs taste. | Before: site type error and changelog-style label; after: existing alpha badge path. | simplify | site examples | site typecheck, `bun check` | repaired |
| 7 | medium | Large Yjs document projection file | `packages/plite-yjs/src/core/document.ts` | 1695 lines, but one cohesive owner: Plite/Yjs document projection, raw/visible children, virtual moved placeholders, path/read/write helpers. | Split would add hops without a proven smaller owner. | plan later only if touched | slate-yjs | source outline and package tests | kept |
| 8 | medium | Large Yjs React entry file | `packages/plite-yjs/src/react/index.ts` | 656 lines with plausible sub-owners: provider hooks, remote cursor decoration source, overlay positions. | Potential future split into private modules, but current repair already reduced private API drift. | plan later | slate-yjs | React contract and typecheck | deferred |
| 9 | low | `@slate/yjs/internal` export | `packages/plite-yjs/package.json`, `src/internal/index.ts` | `./internal` re-exports core and package config asserts it. No imports found in PR surface. | Public/private boundary deserves API review, not cleanup deletion. | route to API review | slate-yjs / slate-auto | package config contract | deferred |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Result | Next |
|--------|--------|-------|-------|-------|--------|------|
| P1 | Delete dead tmp wrapper | architecture-cleanup | `tmp/yjs-collaboration-soak.mjs` | exact scoped `rg`, package config contract, `bun check` | keep | none |
| P2 | Replace private `roots.main` reads with public `children` | slate-yjs/site | `editor-adapter.ts`, Yjs examples | Yjs tests, site typecheck, `bun check` | keep | none |
| P3 | Switch Yjs cursor decoration source to public Plite React hook while preserving Yjs DOM focus refresh | slate-yjs | `src/react/index.ts` | Yjs React contract, `@slate/yjs` typecheck, slate-react surface contract | keep | none |
| P4 | Make runtime-impact text helper a type guard | slate core | `runtime-impact.ts`, import order in `public-state.ts` | slate typecheck, snapshot contract, `bun check` | keep | none |
| P5 | Restore plite-browser core export and update release-proof script oracle | plite-browser | `core/index.ts`, `scenario.test.ts` | public import smoke, plite-browser core, `bun check` | keep | none |
| P6 | Replace Yjs example `new` badges with existing `alpha` badge | site examples | `site/constants/examples.ts` | site typecheck, `bun check` | keep | none |

Cleanup counts:
- delete: 1
- merge: 0
- inline: 0
- simplify: 4
- split: 0
- keep: 3
- defer: 2
- reject: 0
- plan: 2

Changed list:
- code/runtime/API: `packages/plite-yjs/src/core/editor-adapter.ts`, `packages/plite-yjs/src/react/index.ts`, `packages/plite/src/core/runtime-impact.ts`, `packages/plite/src/core/public-state.ts`, `packages/plite-browser/src/core/index.ts`, site Yjs examples.
- tests/oracles: `packages/plite-browser/test/core/scenario.test.ts` updated to match manual-only persistent soak policy.
- docs/plans: this plan updated with source map, candidate matrix, packets, proof, risks.
- skills/workflow: none.
- deleted: `tmp/yjs-collaboration-soak.mjs`.
- reverted/quarantined: none.

Needs review:
- API review before beta: decide whether `@slate/yjs/internal` should exist, because it currently re-exports core and is asserted by package config.
- Future architecture review only if Yjs churn continues: `document.ts` and `react/index.ts` are large but not obviously over-split/under-split today.
- No user action needed for current rootless primary repair: it matches the no-public-`main` decision.

Verification evidence:
- `gh pr view 21 --repo udecode/slate --json ...`: PR #21 merged at `2026-06-17T10:11:13Z`; merge commit `f33726b7a920e81abe5533b70a68dfb1196e9539`.
- `git diff --shortstat f33726b7...^1 f33726b7...`: 144 files changed, 26151 insertions, 47 deletions.
- `rg -n "tmp/yjs-collaboration-soak\\.mjs|tmp/yjs-collaboration-soak" package.json packages scripts site docs .changeset autoresearch.research --glob '*.{json,ts,tsx,mjs,md}' --glob '!**/.next/**' --glob '!**/node_modules/**' --glob '!**/dist/**'`: no references.
- `bun install`: installed missing local Yjs/Hocuspocus packages after merge.
- `bun --filter ./packages/plite-yjs typecheck`: passed.
- `bun test ./packages/plite-yjs/test --path-ignore-patterns ''`: 243 pass, 0 fail.
- `bun --filter ./packages/plite typecheck`: passed.
- `bun --filter ./packages/plite-react typecheck`: passed.
- `bun test ./packages/plite/test/snapshot-contract.ts --path-ignore-patterns ''`: 225 pass, 0 fail.
- `bun test ./packages/plite-react/test/surface-contract.tsx --path-ignore-patterns ''`: 53 pass, 0 fail.
- `bun typecheck:site`: passed.
- `bun test ./packages/plite/test/public-package-import-smoke.test.ts --path-ignore-patterns ''`: 15 pass, 0 fail.
- `bun --filter plite-browser test:core`: 80 pass, 0 fail.
- `bun test ./packages/plite-yjs/test/package-config-contract.spec.ts ./packages/plite/test/public-package-import-smoke.test.ts --path-ignore-patterns ''`: 23 pass, 0 fail.
- `bun check`: passed; package/site/root typechecks passed; default Bun tests 1184 pass, 85 skip; plite-browser core 80 pass; slate-layout 51 pass; slate-react Vitest 59 files / 826 tests passed.

Error attempts:
- GitHub raw PR diff failed with HTTP 406 because the diff exceeded 20000 lines; local merge commit diff became the authority.
- First focused Yjs proof failed before install because local `node_modules` lacked newly merged `yjs`; `bun install` fixed the install graph.
- One broad `rg` accidentally searched generated `.next` output and streamed too much; subsequent searches were scoped with `--glob '!**/.next/**'`, `node_modules`, and `dist` exclusions.
- Early `bun check` failures were real merge drift and were repaired: unused import/order, site type errors, plite-browser public export, and stale release-proof script oracle.

Final handoff contract:
- Source roots inspected: PR #21 merge diff, `packages/plite-yjs`, touched `slate`, `plite-react`, `plite-browser`, site examples, scripts/proof, package config tests, and VISION/common/slate vision docs.
- Candidate count and top recommendation: 9 candidates; top action was delete the dead tmp wrapper and repair current API drift.
- Cleanup counts: 1 delete, 4 simplifications, 1 oracle repair, 3 keeps, 2 defers, 0 splits.
- Agent-navigation score changes: removed one stale wrapper hop, replaced private `main` root reads with public `children`, replaced missing private decoration import with public hook, and made release-proof policy testable from one owner.
- Packets applied with keep/revert/quarantine result: P1-P6 all keep.
- Proof commands/source audits: listed in Verification evidence.
- Rejected/deferred candidates: no large-file split now; `document.ts`, `react/index.ts`, and `@slate/yjs/internal` need future owner review if churn continues.
- Needs-review list: `@slate/yjs/internal` export before beta; otherwise no immediate reviewer action.
- Residual risks: Yjs package is large and new; full browser/provider soak was not run because this cleanup touched no browser-visible runtime behavior and long soaks are manual-only.
- Next owner and exact first command/file: if reviewing public API, start at `packages/plite-yjs/package.json` export `./internal` and `packages/plite-yjs/src/internal/index.ts`.

Timeline:
- 2026-06-17T10:12:12.865Z Architecture-cleanup goal plan created.
- 2026-06-17T11:32:25Z Active goal created for PR #21 architecture cleanup.
- 2026-06-17T11:33:00Z PR #21 metadata read: merged at 2026-06-17T10:11:13Z, title `feat(yjs): add Plite Yjs collaboration package`, merge commit `f33726b7...`.
- 2026-06-17T11:34:00Z Full local merge diff inventoried: 144 files changed, 26151 insertions, 47 deletions; GitHub raw diff was too large, so local merge diff is the authority.
- 2026-06-17T12:05:00Z Dead tmp wrapper deleted; Yjs root/public-hook/type drift repaired.
- 2026-06-17T12:16:00Z Site examples and plite-browser release-proof/export drift repaired.
- 2026-06-17T12:22:00Z `bun check` passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete for PR #21 architecture cleanup. |
| Where am I going? | Run autogoal check-complete, close active goal, hand off. |
| What is the goal? | Audit merged PR #21 changed files for architecture consistency and patch safe cleanup. |
| What have I learned? | PR #21 mostly had a coherent Yjs package, but it was merged against stale assumptions: public `main` root reads, a missing Plite React public export, stale plite-browser release-proof expectations, and a dead tmp wrapper. |

Open risks:
- `@slate/yjs/internal` may be public API debt; review before beta.
- Yjs source is large and new; no split is justified today, but repeat churn in `document.ts` or `react/index.ts` should trigger a focused private-module architecture packet.
- Full browser/provider soak was not run in this cleanup pass; long soaks remain manual-only by package policy.
