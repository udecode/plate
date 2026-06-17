# uncommitted slate v2 split cleanup

Objective:
Review uncommitted Slate v2 splits and merge back fake owners when source evidence proves they add navigation without durable ownership.

Goal plan:
docs/plans/2026-06-17-uncommitted-slate-v2-split-cleanup.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- none

Cleanup source:
- type: user-invoked skill
- id / link: `$architecture-cleanup`
- title: uncommitted Slate v2 split cleanup
- requested surface: uncommitted files in `.tmp/slate-v2`
- cleanup intent: answer whether the uncommitted code was split too much and merge back source-backed over-splits
- acceptance criteria: uncommitted split candidates are ranked, at least five candidate areas inspected unless source facts narrow it, safe merge/inline packets are applied and verified, and broad risky architecture changes are routed instead of half-patched

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A
- initial confidence / cleanliness score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Every inspected uncommitted split candidate has a keep/merge/inline/defer/reject decision, any accepted merge-back packet is verified in the owning `.tmp/slate-v2` checkout, and the plan closes mechanically.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-uncommitted-slate-v2-split-cleanup.md`
  passes.

Verification surface:
- `.tmp/slate-v2` uncommitted file/status/diff audits scoped to changed and untracked Slate v2 files.
- Exact importer/caller scans for candidate split files.
- Focused package tests/typechecks for any changed package.
- `.tmp/slate-v2` `bun check` after multiple packets or import churn.
- Root `check-complete.mjs` for this plan.

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Do not change public API, product UX, or behavior under a cleanup packet.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.

Boundaries:
- Source of truth: latest user request, `architecture-cleanup` skill, root `VISION.md`, `docs/vision/common.md`, `docs/vision/slate.md`, `.agents/AGENTS.md`, prior Slate v2 architecture ledger, live `.tmp/slate-v2` source/tests.
- Allowed edit scope: `.tmp/slate-v2` source/tests only for safe behavior-neutral merge-back packets; this plan for evidence.
- Slate / Plate boundary: Slate v2 only.
- Public API boundary: no public API, docs, package export, or behavior change unless routed to a plan owner first.
- Browser surface: N/A unless visible behavior changes; current task is code-shape cleanup.
- Package/API surface: no package exports intended.
- Non-goals: no new splitting, no feature work, no perf architecture work, no release/readiness/PR work, no parent repo dirty-state cleanup.

Output budget strategy:
- Use status/diff name summaries first, then exact source slices and exact importer searches. Avoid unbounded whole-repo match dumps; write broad counts to artifacts only if needed.

Blocked condition:
- Stop and route if the only useful next cleanup has public API/runtime/product behavior blast radius, or if a candidate needs user taste beyond root VISION.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: ready to close

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-uncommitted-slate-v2-split-cleanup.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User asked whether uncommitted code was split too much and whether to merge some back; this plan records scope, non-goals, stop rules, deliverables, and proof. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `architecture-cleanup` loaded | yes | Read `/Users/zbeyens/git/plate-2/.agents/skills/architecture-cleanup/SKILL.md`. |
| Active goal checked or created | yes | Created active goal for this plan. |
| Source of truth read before analysis | yes | Read VISION, common/slate vision detail, `.agents/AGENTS.md`, and prior Slate architecture ledger. |
| VISION fit gate read | yes | Cleanup must prefer merge/delete/inline when it reduces real owner hops; no line-count splitting. |
| Slate / Plate boundary selected | yes | `.tmp/slate-v2` only. |
| Cleanup surface selected | yes | Uncommitted split footprint in `.tmp/slate-v2`. |
| Non-goals recorded | yes | See Boundaries. |
| Output budget strategy recorded | yes | See Output budget strategy. |
| Implementation authority decided | yes | Small behavior-neutral merge-back packets are allowed; broad API/runtime decisions route away. |
| Proof strategy selected | yes | Source audits first, focused tests/typechecks per touched package, `bun check` after churn. |

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
- [x] VISION fit is recorded; no reusable taste gap found.
- [x] Implementation packet is behavior-neutral, public-API-neutral, narrow,
      reversible, and has focused proof.
- [x] Implementation packet ends keep.
- [x] Source-owner oracle is added or repaired when ownership moves, or N/A
      reason is recorded.
- [x] Focused proof is run before broad proof for changed code.
- [x] Broad proof is run after import churn.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source audits, focused proof, and broad fast gate | `rg` stale import audit clean; `bun --filter ./packages/slate-react typecheck` passed; slate-react focused Vitest passed; `.tmp/slate-v2` `bun check` passed. |
| Source map complete | yes | Record current owners, largest files, exports, tests, and proof owners | Source map covers `slate-react` root groups/text blocks, `slate-browser` proof harness, `slate` public-state, history replay, selection triple-click, editable binding/equality, and browser proof primitives. |
| Deslop inventory complete | yes | Record concrete stale/shallow/duplicated/over-split surfaces | The only strong fake owner found was the one-caller root-group placeholder file; other small files had behavior, state, or proof ownership. |
| Candidate matrix complete | yes | Rank candidates with facts, action, owner, proof, and decision | Eight candidate rows recorded below. |
| Agent-navigation score complete | yes | Record before/after or expected files-to-read / owner / proof clarity changes | Root-group placeholder route improved from 3 files to 2 files for one staged-root-group behavior; kept splits preserve named proof owners. |
| Anti-confetti gate | yes | Prove accepted splits reduce navigation cost or record no split accepted | No new split accepted; one over-split merged back into the existing root-group owner. |
| Delete / merge / inline gate | yes | Record considered simplifications and why accepted/rejected | One merge accepted; seven merge-backs rejected as harmful or too broad. |
| VISION fit gate | yes | Confirm fit to VISION.md or record sync-vision/stop decision | Fits VISION: delete/merge fake owners, but keep durable behavior/proof owners. No vision gap found. |
| Implementation packet gate | yes | For every code packet, record keep/revert/quarantine and focused proof | Packet 1 kept after stale import audit, typecheck, focused Vitest, and `bun check`. |
| Source-owner oracle gate | no | Repair or add tests/oracles when ownership moves, or N/A | N/A: ownership moved into the existing root-group owner without behavior change; existing DOM strategy and coverage contract tests cover the behavior. |
| Public API / behavior safety gate | yes | Prove no public API/product behavior changed, or route to plan owner | No exports/docs/package manifests changed; only internal import/source locality changed. |
| Package/API proof | no | Run relevant package/export/type/build proof when package boundaries changed, or N/A | N/A: no package boundary changed; `slate-react` typecheck and broad `bun check` still passed. |
| Browser proof | no | Run Browser/Playwright proof when visible behavior changed, or N/A | N/A: no visible behavior changed; this is source-shape-only cleanup. |
| Final lint/check | yes | Run focused/broad lint/typecheck/test appropriate to touched files | `.tmp/slate-v2` `bun check` passed. |
| Output budget discipline | yes | Verify no unbounded high-volume output was streamed, or record recovery | Broad result stream from the first lost session was recovered by rerunning `bun check` with capped output and recording only the final evidence. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish current packet cleanly; otherwise N/A | N/A: no duration requested. |
| Final handoff contract | yes | Fill changed list, cleanup counts, proof, needs-review, residual risks, and next owner | Filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-uncommitted-slate-v2-split-cleanup.md` | To run after this plan update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read active plan, `architecture-cleanup`, `autogoal`, VISION/docs guidance, prior architecture ledger, and current Slate v2 source/diffs. | source map |
| Source map | complete | Mapped large split files and suspicious one-caller helpers across `slate-react`, `slate`, `slate-browser`, and `slate-history`. | deslop inventory |
| Deslop inventory | complete | Found one clear over-split; rejected file-count-only merge-backs. | candidate matrix |
| Candidate matrix | complete | Eight candidates ranked with keep/merge decisions. | cleanup packet |
| Cleanup packet | complete | Merged root-group placeholder into root-group owner; no other safe packet accepted. | verification |
| Verification | complete | Focused and broad Slate v2 checks passed. | closeout |
| Closeout | complete | Plan updated with proof, risks, and final handoff facts. | final response |

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | Strong | Root-group placeholder micro-file | `packages/slate-react/src/components/editable-root-group-placeholder.tsx`, `packages/slate-react/src/components/editable-root-groups.ts`, `packages/slate-react/src/components/editable-text-blocks.tsx` | Placeholder was a one-caller hidden staging node whose policy belongs with root-group mounting and coverage boundaries. | Before: 3 files for one root-group behavior; after: 2 files, same owner/proof, no export boundary. | Merge into root-group owner. | Slate React root-group DOM strategy | `rg` stale import audit; slate-react typecheck; focused Vitest; `bun check` | merge |
| 2 | Strong | Slate browser Playwright split | `packages/slate-browser/src/playwright/*`, `packages/slate-browser/test/core/*` | Large `index.ts` split creates durable proof owners: selection, screenshots, transports, scenarios, package contracts. | More files, but clearer owner/proof per browser behavior and lower future debug cost. | Keep. | slate-browser proof harness | `bun check` includes slate-browser core tests and package scripts contracts. | keep |
| 3 | Strong | Core public-state split | `packages/slate/src/core/public-state.ts`, related core state helpers | The parent file was a state pile; split helpers carry operation/runtime/index state ownership used by broad core call sites. | More hops for one file, but fewer mixed owners when debugging runtime/public state. | Keep; do not merge from line count alone. | Slate core runtime state | `bun check` includes slate package tests and typecheck. | keep |
| 4 | Strong | History replay helper | `packages/slate-history/src/history-replay.ts`, `packages/slate-history/src/history-extension.ts` | One caller, but it is the named internal bridge for replay semantics and history contract pressure. | Two files for replay behavior; proof clarity stays high. | Keep. | slate-history | `bun check` includes slate-history tests/typecheck. | keep |
| 5 | Strong | Triple-click selection helper | `packages/slate-react/src/editable/selection-triple-click.ts`, selection reconciler tests | One caller, but it names a risky native-selection behavior that already had user-visible bugs. | One extra file buys explicit behavior ownership. | Keep. | Slate React selection | `bun check` includes slate-react Vitest; focused DOM strategy proof passed. | keep |
| 6 | Strong | Descendant binding and node equality | `packages/slate-react/src/components/editable-descendant-binding.ts`, `packages/slate-react/src/components/editable-node-equality.ts` | These own render-selector binding/equality and are referenced by kernel authority audit. | More files, but lower risk than stuffing selector equality back into the rendering component. | Keep. | Slate React render selector | `bun --filter ./packages/slate-react typecheck`; `bun check` | keep |
| 7 | Strong | Browser proof primitives | `packages/slate-browser/src/playwright/dom-locators.ts`, `ready.ts`, `root-focus.ts`, materialization helpers | Small files, but names map to reusable first-party proof primitives rather than app behavior. | More files, clearer proof API surface for future browser tests. | Keep. | slate-browser Playwright subpath | slate-browser package contract rows passed in `bun check`. | keep |
| 8 | Worth exploring | Mutation profiler/root-scope helpers | `packages/slate-react/src/editable/mutation-profiler.ts`, `packages/slate-react/src/editable/mutation-root-scope.ts`, mutation controller | Small and low fan-in, but mutation-controller already has multiple concerns and these names are stable. | Same or slightly easier with split; merging risks recreating a controller pile. | Keep for now; revisit only with a mutation-controller specific cleanup packet. | Slate React mutation controller | `bun check` | keep |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Result | Next |
|--------|--------|-------|-------|-------|--------|------|
| 1 | merge | Slate React root-group DOM strategy | `editable-root-group-placeholder.tsx` removed; `EditableRootGroupPlaceholder` moved into `editable-root-groups.ts`; import updated in `editable-text-blocks.tsx` | stale import audit clean; slate-react typecheck passed; focused Vitest passed; `bun check` passed | keep | no extra packet this loop |

Cleanup counts:
- delete: 0
- merge: 1
- inline: 0
- simplify: 0
- split: 0
- keep: 7
- defer: 0
- reject: 0
- plan: 0

Changed list:
- code/runtime/API: `.tmp/slate-v2/packages/slate-react/src/components/editable-root-groups.ts`; `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`; removed `.tmp/slate-v2/packages/slate-react/src/components/editable-root-group-placeholder.tsx`.
- tests/oracles: none changed.
- docs/plans: `docs/plans/2026-06-17-uncommitted-slate-v2-split-cleanup.md`.
- skills/workflow: none changed.
- reverted/quarantined: none.

Needs review:
- Low: sanity-check the `EditableRootGroupPlaceholder` locality if you want, but I think merging it into `editable-root-groups.ts` is the right cleanup.
- No public API or behavior decision needs your attention from this packet.

Verification evidence:
- `rg -n "editable-root-group-placeholder|from './editable-root-group-placeholder'" packages --glob '*.{ts,tsx,md,json}'` in `/Users/zbeyens/git/plate-2/.tmp/slate-v2` -> no matches.
- `bun --filter ./packages/slate-react typecheck` in `/Users/zbeyens/git/plate-2/.tmp/slate-v2` -> passed.
- `bun test:vitest --run test/dom-strategy-and-scroll.tsx test/dom-coverage-native-bridge-contract.test.ts test/provider-hooks-contract.tsx` in `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react` -> passed, 1 file, 15 tests.
- `bun check` in `/Users/zbeyens/git/plate-2/.tmp/slate-v2` -> passed: lint, package/site/root typecheck, Bun unit tests, slate-browser core tests, slate-layout tests, and slate-react Vitest.
- Failed attempt recorded: direct `bun test ./packages/slate-react/test/...` from the Slate v2 root was the wrong runner/cwd for Vitest tests and failed with harness setup errors; resolved by using the package-owned `bun test:vitest --run ...` command.

Final handoff contract:
- Source roots inspected: `.tmp/slate-v2/packages/slate-react`, `.tmp/slate-v2/packages/slate`, `.tmp/slate-v2/packages/slate-browser`, `.tmp/slate-v2/packages/slate-history`, VISION/docs guidance, and the prior Slate v2 architecture ledger.
- Candidate count and top recommendation: 8 candidates; top recommendation was to merge the root-group placeholder micro-file back into the root-group owner.
- Cleanup counts: merge 1, keep 7, delete/inline/simplify/split/defer/reject/plan 0.
- Agent-navigation score changes: staged root-group placeholder behavior dropped from 3 files to 2 files; other kept splits preserve clearer owner/proof navigation.
- Packets applied with keep/revert/quarantine result: one packet kept.
- Proof commands/source audits: recorded under Verification evidence.
- Rejected/deferred candidates: no rejected/deferred candidates; seven inspected candidates were explicit keep decisions.
- Needs-review list: low-risk locality check only.
- Residual risks: broad uncommitted Slate v2 work remains outside this packet; this handoff claims only the merge-back review and root-group cleanup.
- Next owner and exact first command/file: architecture-cleanup can revisit `packages/slate-react/src/editable/mutation-controller.ts` later if mutation locality becomes painful.

Open risks:
- Low: the checkout still contains many unrelated uncommitted Slate v2 changes from earlier work. This cleanup only claims the root-group placeholder merge-back and the candidate keep/merge review.
- Low: no browser route was opened because no visible behavior changed.

Timeline:
- 2026-06-17T08:34:38.592Z Architecture-cleanup goal plan created.
- 2026-06-17T08:35:00Z First checkpoint filled: latest prompt asks for uncommitted Slate v2 split audit and merge-back of proven over-splits.
- 2026-06-17T10:38:00Z Merged `EditableRootGroupPlaceholder` into `editable-root-groups.ts` and removed the one-caller placeholder file.
- 2026-06-17T10:39:00Z Focused slate-react typecheck and Vitest passed.
- 2026-06-17T10:40:00Z `.tmp/slate-v2` `bun check` passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete. |
| Where am I going? | Final response after mechanical goal-plan check. |
| What is the goal? | Decide whether uncommitted Slate v2 was split too much, merge back proven fake owners, and verify the result. |
| What have I learned? | Yes, a few micro-splits went too far; one was clearly worth merging back. Most major splits are still justified by durable behavior/proof ownership. |
| What is done? | One merge-back kept, seven inspected candidates kept, focused and broad verification passed. |
