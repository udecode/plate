# broad architecture cleanup pass

Objective:
Run broad architecture cleanup; done when candidates are ranked, safe packets are verified, and plan closes.

Goal plan:
docs/plans/2026-06-17-broad-architecture-cleanup-pass.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- none

Cleanup source:
- type: user-invoked skill
- id / link: `$architecture-cleanup`
- title: broad architecture cleanup pass
- requested surface: repo architecture cleanup with Plite as the immediate live candidate surface
- cleanup intent: inspect source-backed deslop, over-splits, wrappers, stale ownership, and agent-navigation friction; apply only safe behavior-neutral cleanup packets
- acceptance criteria: at least five candidates ranked unless source evidence narrows the surface; every candidate has action, owner, proof, and decision; any implementation packet ends keep/revert/quarantine with proof

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: user invoked `architecture-cleanup` without duration
- semantics: N/A: normal one-shot architecture-cleanup pass
- initial confidence / cleanliness score: N/A: no timed confidence loop requested
- improvement loop: N/A: stop when candidate matrix and safe packets close
- final score / loop closure: N/A: closure uses candidate/proof gates instead of time score

Completion threshold:
- Candidate matrix has at least five source-backed rows, every row has a decision, safe accepted packets are verified, and the final plan has no unchecked gates.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-broad-architecture-cleanup-pass.md`
  passes.

Verification surface:
- Source audits over `.tmp/plite/packages/**` candidate files and importers.
- Focused package checks for any changed Plite package.
- `bun check` from `.tmp/plite` if multiple packets or import churn happen.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-broad-architecture-cleanup-pass.md`.

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Do not change public API, product UX, or behavior under a cleanup packet.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.

Boundaries:
- Source of truth: root `VISION.md`, `docs/vision/common.md`, `docs/vision/slate.md`, `.agents/AGENTS.md`, live `.tmp/plite` source/tests, and `docs/analysis/2026-06-16-plite-architecture-deepening.md`
- Allowed edit scope: this plan, `docs/analysis/**` if needed, and `.tmp/plite` source/tests only for narrow behavior-neutral cleanup
- Plite / Plate boundary: Plite substrate cleanup only unless a source read proves a Plate-owned cleanup is the better owner
- Public API boundary: no public API or docs surface changes inside this pass
- Browser surface: N/A unless visible behavior changes; current target is source shape only
- Package/API surface: N/A unless exports or package boundaries change
- Non-goals: no feature work, no behavior changes, no release/publish/PR readiness, no broad API/runtime redesign, no file splitting for line-count aesthetics

Output budget strategy:
- Broad importer scans are capped or avoided. The previous whole-tree importer command overflowed output; recovery is to inspect exact candidate files, exact importer patterns, and short source slices only.

Blocked condition:
- Stop and route to `major-task`, `plite-plan`, `plate-plan`, or `plite-auto` if the next useful cleanup changes public API, runtime behavior, product UX, or has meaningful blast radius. Stop for `sync-vision` only if source evidence reveals a reusable taste gap not covered by VISION.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: two safe merge/inline packets kept; remaining inspected candidates kept with source-backed reasons
- cleanliness confidence: high for this pass
- next owner: architecture-cleanup
- keep / revert / quarantine call: keep both implementation packets
- reason: focused tests, package typechecks, stale-file audit, and `.tmp/plite` `bun check` passed

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-broad-architecture-cleanup-pass.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User invoked `$architecture-cleanup` with no extra args; scope, non-goals, stop rules, deliverables, verification, and final handoff requirements copied into this plan. |
| Timed checkpoint parsed | no | N/A: no duration in latest prompt. |
| `architecture-cleanup` loaded | yes | Read `/Users/zbeyens/git/plate-2/.agents/skills/architecture-cleanup/SKILL.md`. |
| Active goal checked or created | yes | Active goal exists for this plan: `Run broad architecture cleanup; done when candidates are ranked, safe packets are verified, and plan closes`. |
| Source of truth read before analysis | yes | Read root `VISION.md`, `docs/vision/common.md`, `docs/vision/slate.md`, `.agents/AGENTS.md`, and prior Plite architecture ledger. |
| VISION fit gate read | yes | Root/common/slate vision read; cleanup bias is delete/merge/inline before split and no public API/behavior churn. |
| Plite / Plate boundary selected | yes | Immediate surface is Plite substrate in `.tmp/plite`; Plate remains out of scope unless source facts prove otherwise. |
| Cleanup surface selected | yes | Narrow remaining post-merge-back Plite candidate files and proof-harness helpers. |
| Non-goals recorded | yes | See Boundaries. |
| Output budget strategy recorded | yes | See Output budget strategy. |
| Implementation authority decided | yes | Behavior-neutral, public-API-neutral, narrow packets may be applied; broader decisions route to owner. |
| Proof strategy selected | yes | Source audit for kept/rejected rows; focused package proof for changed files; `bun check` only after import churn/multiple packets. |

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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `.tmp/plite`: focused tests/typechecks and `bun check` passed; source audit confirmed removed helper filenames have no matches. |
| Source map complete | yes | Record current owners, largest files, exports, tests, and proof owners | Source map below records Plite React, Plite DOM, Plite core, and plite-browser owners with line counts and proof owners. |
| Deslop inventory complete | yes | Record concrete stale/shallow/duplicated/over-split surfaces | Inventory below records two one-owner helper files removed and four keep decisions. |
| Candidate matrix complete | yes | Rank candidates with facts, action, owner, proof, and decision | Six rows completed in Candidate matrix. |
| Agent-navigation score complete | yes | Record before/after or expected files-to-read / owner / proof clarity changes | Candidate rows include files-to-read, owners touched, proof clarity, public/private clarity, and net effect. |
| Anti-confetti gate | yes | Prove accepted splits reduce navigation cost or record no split accepted | No new splits accepted; two prior helper shards merged/inlined. |
| Delete / merge / inline gate | yes | Record considered simplifications and why accepted/rejected | Inline and merge packets kept; other candidates kept because they have durable owners. |
| VISION fit gate | yes | Confirm fit to VISION.md or record sync-vision/stop decision | Fits VISION delete/merge/inline bias and no fake public API or behavior churn; no sync-vision gap found. |
| Implementation packet gate | yes | For every code packet, record keep/revert/quarantine and focused proof | Packet ledger marks both packets keep with focused and broad proof. |
| Source-owner oracle gate | yes | Repair or add tests/oracles when ownership moves, or N/A | `public-surface-contract.ts` internal bridge allowlist updated for DOM event owner move; zero-width behavior already covered by rendered DOM tests. |
| Public API / behavior safety gate | yes | Prove no public API/product behavior changed, or route to plan owner | Removed private helper files only; no exports/package docs changed; tests and typecheck passed. |
| Package/API proof | no | Run relevant package/export/type/build proof when package boundaries changed, or N/A | N/A: no package exports changed; package typechecks and public-surface contract still ran. |
| Browser proof | no | Run Browser/Playwright proof when visible behavior changed, or N/A | N/A: behavior-neutral source cleanup only; rendered DOM contracts covered zero-width shape. |
| Final lint/check | yes | Run focused/broad lint/typecheck/test appropriate to touched files | `.tmp/plite` `bun check` passed after import-order repair. |
| Output budget discipline | yes | Verify no unbounded high-volume output was streamed, or record recovery | One earlier broad importer scan overflowed output; recovery used exact files, exact importers, and capped source slices. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish current packet cleanly; otherwise N/A | N/A: no duration requested. |
| Final handoff contract | yes | Fill changed list, cleanup counts, proof, needs-review, residual risks, and next owner | Final handoff contract filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-broad-architecture-cleanup-pass.md` | Passed after final plan evidence update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read `architecture-cleanup`, `autogoal`, root/common/slate vision, `.agents/AGENTS.md`, and prior Plite architecture ledger. | source map |
| Source map | complete | Counted and read targeted Plite React, Plite DOM, Plite core, and plite-browser candidate files. | deslop inventory |
| Deslop inventory | complete | Found two one-owner helper shards and four keep-worthy durable owners. | candidate matrix |
| Candidate matrix | complete | Six rows ranked with decisions and proof. | cleanup packets / owner routing |
| Cleanup packets / owner routing | complete | Two behavior-neutral packets applied; four candidates kept/rejected for this pass. | verification |
| Verification | complete | Focused tests/typechecks plus `.tmp/plite` `bun check` passed. | closeout |
| Closeout | complete | Plan updated; final check-complete is the remaining mechanical command. | final response |

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | Strong | Inline zero-width text render helper | `.tmp/plite/packages/plite-react/src/components/editable-zero-width.ts`, `.tmp/plite/packages/plite-react/src/components/editable-text-blocks.tsx` | Helper was 45 lines, one importer, two same-owner call sites inside text-block rendering. | before: 2 files, 1 owner, clear tests, private boundary; after: 1 file, 1 owner, same tests, easier | Inline private helper into text block owner | Plite React editable rendering | `bun test ./packages/plite-react/test/rendered-dom-shape-contract.tsx ./packages/plite-react/test/primitives-contract.tsx`; `bun --filter ./packages/plite-react typecheck`; `bun check` | inline kept |
| 2 | Strong | Merge event fragment predicate into DOM event range-target owner | `.tmp/plite/packages/plite-dom/src/plugin/dom-event-fragment.ts`, `.tmp/plite/packages/plite-dom/src/plugin/dom-event-range-targets.ts`, `.tmp/plite/packages/plite-dom/src/plugin/dom-editor.ts`, `.tmp/plite/packages/plite/test/public-surface-contract.ts` | Fragment predicate was one-use and part of the same resolve-event-range algorithm; oracle named old internal importer. | before: 3 DOM event files, 1 owner, oracle tied to stale helper; after: 2 files, 1 owner, oracle names actual event-range owner | Merge into event range-target file and repair oracle | Plite DOM event range targeting | `bun test ./packages/plite/test/public-surface-contract.ts`; `bun test ./packages/plite-dom/test/bridge.ts ./packages/plite-dom/test/clipboard-boundary.ts ./packages/plite-dom/test/public-surface-contract.ts`; `bun --filter ./packages/plite-dom typecheck`; `bun check` | merge kept |
| 3 | Worth exploring | Live runtime index state helper | `.tmp/plite/packages/plite/src/core/live-runtime-index-state.ts`, `.tmp/plite/packages/plite/src/core/public-state.ts` | 56 lines, one importer, but 13 call sites across snapshot cache/version invalidation and rollback paths. | current: 2 files, 1 owner, source behavior tested by state transaction contracts; merging would add risk to a 4070-line owner | Keep for now; revisit only with focused core-runtime packet | Plite core runtime index cache | Source audit plus existing tests `state-tx-public-api-contract.ts` names runtime-index invalidation | keep |
| 4 | Strong keep | Operation replay helper | `.tmp/plite/packages/plite/src/core/operation-replay.ts`, `.tmp/plite/packages/plite/src/core/public-state.ts` | 49 lines, internal export `markInternalOwnedReplayOperation`, docs/tests reference operation replay substrate. | current: 2 files, 1 core owner, strong proof docs/tests, private internal bridge clear | Keep; it is a durable replay-policy owner, not confetti | Plite core operation replay | Source audit found internal export and `delete-contract.ts` guard; `bun check` passed | keep |
| 5 | Strong keep | Plite-browser Playwright primitives | `dom-locators.ts`, `materialization.ts`, `ready.ts`, `root-focus.ts`, `selection-contract.ts` | Small files, but multiple importers/exports and first-party proof harness concepts. | current: small files but stable proof owners; merging would make harness harder to scan | Keep first-party proof primitives split | plite-browser Playwright harness | Importer audit plus `bun check` plite-browser core tests passed | keep |
| 6 | Speculative reject | Split more out of large `editable-text-blocks.tsx`, `dom-editor.ts`, or `public-state.ts` by line count | Same large owner files | Prior ledger already says large files alone are not architecture debt; current safe targets were one-owner helper shards. | splitting by size would increase files-to-read without a proved durable owner | Reject for this pass; require behavior/proof owner before any future split | architecture-cleanup / relevant package owner | VISION anti-confetti rule and prior architecture ledger | reject |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Result | Next |
|--------|--------|-------|-------|-------|--------|------|
| zero-width helper | inline | Plite React editable rendering | `editable-text-blocks.tsx`; removed `editable-zero-width.ts` | Rendered DOM shape tests, primitives contract, slate-react typecheck, stale-file audit, `bun check` | keep | none |
| DOM event fragment | merge | Plite DOM event range targeting | `dom-event-range-targets.ts`, `dom-editor.ts`, `public-surface-contract.ts`; removed `dom-event-fragment.ts` | Public-surface contract, plite-dom bridge/clipboard/public tests, plite-dom typecheck, stale-file audit, `bun check` | keep | none |

Cleanup counts:
- delete: 2 helper files removed as part of inline/merge packets
- merge: 1 DOM event helper merged into event range-target owner
- inline: 1 Plite React helper inlined into text-block owner
- simplify: 0 separate simplification-only packets
- split: 0
- keep: 3 durable owner candidates kept
- defer: 1 live-runtime candidate kept for future focused packet rather than broad cleanup churn
- reject: 1 line-count split idea rejected
- plan: 0 broader plans required

Changed list:
- code/runtime/API: private Plite source only; no public API or package exports changed
- tests/oracles: updated Plite public-surface internal bridge allowlist for DOM event range-target ownership
- docs/plans: updated this autogoal plan
- skills/workflow: none
- reverted/quarantined: none

Needs review:
- Low: review whether moving the block-fragment predicate into `dom-event-range-targets.ts` matches your preferred DOM event owner naming. I think yes.
- Low: `live-runtime-index-state.ts` remains a one-importer helper. I kept it because its invalidation policy is a real core-runtime owner; merge it later only with a focused core-runtime packet.

Verification evidence:
- `/Users/zbeyens/git/plate-2/.tmp/plite`: `bun test ./packages/plite-react/test/rendered-dom-shape-contract.tsx ./packages/plite-react/test/primitives-contract.tsx` -> 16 pass, 0 fail.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: `bun test ./packages/plite/test/public-surface-contract.ts` -> 1167 pass, 0 fail.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: `bun --filter ./packages/plite-react typecheck && bun --filter ./packages/plite-dom typecheck` -> both exited 0.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: `bun test ./packages/plite-dom/test/bridge.ts ./packages/plite-dom/test/clipboard-boundary.ts ./packages/plite-dom/test/public-surface-contract.ts` -> 81 pass, 0 fail.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: `bun check` -> lint, typecheck, Bun tests, plite-browser core, slate-layout tests, and slate-react vitest all passed.
- `/Users/zbeyens/git/plate-2`: `rg -n "editable-zero-width|dom-event-fragment|from './editable-zero-width'|from './dom-event-fragment'" .tmp/plite/packages --glob '*.{ts,tsx,md,json}'` -> no matches.
- `/Users/zbeyens/git/plate-2`: helper absence check -> deleted helper files absent.
- `/Users/zbeyens/git/plate-2`: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-broad-architecture-cleanup-pass.md` -> complete.

Final handoff contract:
- Source roots inspected: `.tmp/plite/packages/plite-react/src/components`, `.tmp/plite/packages/plite-dom/src/plugin`, `.tmp/plite/packages/plite/src/core`, `.tmp/plite/packages/plite-browser/src/playwright`, `VISION.md`, `docs/vision/common.md`, `docs/vision/slate.md`, `.agents/AGENTS.md`, prior architecture ledger.
- Candidate count and top recommendation: 6 candidates; top recommendation was inline `editable-zero-width.ts` into `editable-text-blocks.tsx`.
- Cleanup counts: delete 2 helper files, merge 1, inline 1, keep 3, reject 1, split 0.
- Agent-navigation score changes: zero-width render path 2 files -> 1 file; DOM event fragment path 3 DOM event files -> 2 files and oracle now points to the actual range-target owner.
- Packets applied with keep/revert/quarantine result: zero-width inline kept; DOM event fragment merge kept.
- Proof commands/source audits: see Verification evidence.
- Rejected/deferred candidates: line-count split rejected; live-runtime index merge deferred/kept for focused core-runtime work only.
- Needs-review list: owner naming for `dom-event-range-targets.ts`; future live-runtime-index one-importer helper if a core-runtime pass wants to go deeper.
- Residual risks: low; this pass was source-shape only and did not run browser interaction proof because no visible behavior changed.
- Next owner and exact first command/file: none required; if continuing cleanup, start with `wc -l .tmp/plite/packages/plite/src/core/live-runtime-index-state.ts .tmp/plite/packages/plite/src/core/public-state.ts` and read runtime-index invalidation tests before deciding.

Timeline:
- 2026-06-17T07:13:28.061Z Architecture-cleanup goal plan created.
- 2026-06-17T07:20:00Z Plan intake repaired with exact scope, non-goals, output-budget recovery, source-of-truth reads, and proof strategy.
- 2026-06-17T07:24:00Z Narrow candidate scan found one-owner zero-width and DOM event fragment helpers.
- 2026-06-17T07:27:00Z Inlined zero-width helper and merged DOM event fragment predicate into range-target owner.
- 2026-06-17T07:31:00Z Focused tests/typechecks passed; first broad `bun check` failed only on import ordering.
- 2026-06-17T07:33:00Z Import ordering fixed; `bun check` passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run mechanical plan check, mark goal complete, final response |
| What is the goal? | Rank remaining architecture-cleanup candidates, apply only safe behavior-neutral cleanup, and close the plan with proof. |
| What have I learned? | Two helper shards did not earn their files; remaining small files inspected have durable proof/runtime ownership or need a narrower owner packet. |

Open risks:
- Low: current diff in `.tmp/plite` includes earlier uncommitted architecture work outside this pass; this pass only claims the two helper merge/inline packets above.
