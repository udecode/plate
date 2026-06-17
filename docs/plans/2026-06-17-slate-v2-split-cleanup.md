# slate v2 split cleanup

Objective:
Clean Slate v2 over-splits without changing behavior or public API.

Goal plan:
docs/plans/2026-06-17-slate-v2-split-cleanup.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Cleanup source:
- type: user follow-up from architecture-cleanup review
- id / link: chat instruction "ok go all"
- title: Merge back the over-split uncommitted Slate v2 files
- requested surface: `.tmp/slate-v2` Slate v2 checkout plus parent repo skill/docs cleanup artifacts
- cleanup intent: reduce pointless file hops created by architecture-deepening split packets while keeping the durable owner splits
- acceptance criteria:
  - merge back obvious micro-owner files called out in the review;
  - do not re-expand large legitimate owners such as the Slate browser harness or runtime-impact;
  - preserve behavior, public API, docs intent, and tests;
  - keep every packet reversible with focused proof;
  - compress parent durable docs where the 7k-line loop artifact is review-hostile;
  - do not commit, push, or create a PR.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: no timed minimum requested; close when all named cleanup packets are either kept, rejected, or routed
- initial confidence / cleanliness score: 62/100
- improvement loop: raise score by reducing one-use tiny files, preserving API exports, running focused Slate checks, and compressing parent analysis docs
- final score / loop closure: 88/100 after merge-back packets, stale-import audits, and `bun check`

Completion threshold:
- Done when the accepted merge-back packets reduce the obvious micro-owner count, no deleted file is still imported, focused Slate checks pass or a concrete blocker is recorded, parent skill topology is not left with active stale owner refs, the giant parent analysis artifact is made reviewable or explicitly deferred, and this plan passes check-complete.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-split-cleanup.md`
  passes.

Verification surface:
- Source audits:
  - untracked Slate v2 file counts before/after;
  - no imports remain for deleted helper files;
  - parent active stale-ref audit for old architecture skill name.
- Focused Slate proof:
  - `bun test packages/slate/test/public-surface-contract.ts packages/slate/test/transaction-contract.ts packages/slate/test/delete-contract.ts`
  - `bun test packages/slate-browser/test/core/scenario.test.ts`
  - `bun check` if focused packets pass.
- Parent proof:
  - `pnpm install` when `.agents/rules/**` or generated skill mirrors change;
  - autogoal `check-complete` for this plan.

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Do not change public API, product UX, or behavior under a cleanup packet.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.

Boundaries:
- Source of truth: root `VISION.md`, `docs/vision/common.md`, `docs/vision/slate.md`, `.agents/skills/architecture-cleanup/SKILL.md`, live `.tmp/slate-v2` source/tests
- Allowed edit scope: `.tmp/slate-v2/packages/slate*`, `.tmp/slate-v2/packages/slate-browser`, parent docs/plans/analysis/skill-routing artifacts already involved in the cleanup
- Slate / Plate boundary: Slate substrate only; no Plate product/plugin behavior cleanup
- Public API boundary: no public API rename/removal; exported symbols stay exported when they already were
- Browser surface: no visible behavior change intended; browser proof only if Slate browser harness packet changes behavior-facing helpers
- Package/API surface: Slate package source and private proof harness source
- Non-goals: no broad pagination/virtualization architecture, no release/publish, no commit/stage unless explicitly requested

Output budget strategy:
- Use counts, filename lists, importer audits, and bounded file slices. Avoid dumping large generated diffs, lockfiles, or full 7k-line analysis artifacts into context.

Blocked condition:
- Stop only if a merge-back would require behavior/API judgment, focused checks reveal non-mechanical failures without a safe owner, or a git index operation would require staging/commit authority not granted by the user.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete after check-complete

Current verdict:
- verdict: complete
- cleanliness confidence: 88/100
- next owner: architecture-cleanup
- keep / revert / quarantine call: keep the applied cleanup packets
- reason: the obvious micro-owner files were merged back, legitimate multi-owner splits were kept, stale imports are clean, and `bun check` passes

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-split-cleanup.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User asked to do all reviewed cleanup: Slate v2 split merge-backs, parent analysis compression, and active stale-owner audit |
| Timed checkpoint parsed | no | No duration requested |
| `architecture-cleanup` loaded | yes | `.agents/skills/architecture-cleanup/SKILL.md` read |
| Active goal checked or created | yes | Goal created for this plan |
| Source of truth read before analysis | yes | `VISION.md`, `docs/vision/common.md`, `docs/vision/slate.md`, and live `.tmp/slate-v2` source read |
| VISION fit gate read | yes | Root and Slate vision require behavior-neutral cleanup and Slate substrate ownership |
| Slate / Plate boundary selected | yes | Slate v2 checkout only; no Plate product code changed |
| Cleanup surface selected | yes | `.tmp/slate-v2` code splits plus parent analysis ledger |
| Non-goals recorded | yes | No pagination architecture, no release, no PR/commit/stage |
| Output budget strategy recorded | yes | Bounded reads, counts, targeted import audits, no full diff dumps |
| Implementation authority decided | yes | Safe behavior-neutral cleanup packets only |
| Proof strategy selected | yes | Focused tests, package typechecks, stale-import audit, full `bun check` |
| Agent-native pack selected | yes | Active skill topology was part of the surrounding cleanup; no new `.agents/**` source changed in this pass |
| Agent-facing action surface identified | yes | `$architecture-cleanup` and parent analysis ledger are the agent-facing surfaces |
| Source rule versus generated mirror boundary identified | yes | No generated skill mirror edited in this pass |
| `agent-native-reviewer` loaded or waiver recorded | yes | Reviewer read; no new orphan agent action found |

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
- [x] Agent-native pack: no generated skill mirror was edited by hand in this pass.
- [x] Agent-native pack: `$architecture-cleanup` remains discoverable from the generated skill and parent routing.
- [x] Agent-native pack: generated mirror sync is N/A because this pass did not edit `.agents/rules/**`.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named tests/audits | `bun check` passed in `.tmp/slate-v2` |
| Source map complete | yes | Record current owners, largest files, exports, tests, and proof owners | Source roots and candidate matrix below |
| Deslop inventory complete | yes | Record concrete stale/shallow/duplicated/over-split surfaces | 113 untracked files before, 37 under 80 lines; one-use helpers identified |
| Candidate matrix complete | yes | Rank candidates with facts, action, owner, proof, and decision | Matrix below |
| Agent-navigation score complete | yes | Record before/after file-hop changes | 13 helper files removed, 1 consolidated plan file added; untracked files 113 -> 101, sub-80-line files 37 -> 25 |
| Anti-confetti gate | yes | Prove no accepted split lacks durable owner | Kept multi-owner files; merged one-owner helpers |
| Delete / merge / inline gate | yes | Record considered simplifications | Packet ledger below |
| VISION fit gate | yes | Confirm fit to VISION.md | Behavior-neutral Slate substrate cleanup fits root/Slate vision |
| Implementation packet gate | yes | Record keep/revert/quarantine and proof | All applied packets kept after `bun check` |
| Source-owner oracle gate | yes | Repair or add tests/oracles when ownership moves, or N/A | Existing source-owner tests caught alias regression; fixed by removing `DeletePoint`/`DeleteRange` aliases |
| Public API / behavior safety gate | yes | Prove no public API/product behavior changed | Public-surface contract plus typechecks passed |
| Package/API proof | yes | Run relevant package/export/type/build proof | Slate, Slate React, Slate Browser typechecks and `bun check` passed |
| Browser proof | no | No visible browser behavior changed | N/A: proof harness code changed; core Slate Browser tests passed instead |
| Final lint/check | yes | Run broad lint/typecheck/test | `bun check` passed |
| Output budget discipline | yes | Verify bounded output | Used focused reads, counts, `rg`, and capped output; no full 7k-line dump |
| Timed checkpoint | no | No duration requested | N/A |
| Final handoff contract | yes | Fill changed list, cleanup counts, proof, needs-review, residual risks, and next owner | Completed below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-split-cleanup.md` | Final command before closeout |
| Agent source / generated sync | no | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | N/A: this pass did not edit `.agents/rules/**` |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `$architecture-cleanup` loaded and old active ref audit clean |
| Agent-native review | yes | Load reviewer and close accepted findings | Reviewer loaded; no generated mirror hand-edit or orphan agent action introduced |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Skill, autogoal, VISION, common/slate vision, Slate v2 source inspected | Source map |
| Source map | complete | Untracked file counts and package owner map recorded | Deslop inventory |
| Deslop inventory | complete | One-owner tiny helpers identified | Candidate matrix |
| Candidate matrix | complete | Matrix below | Cleanup packets |
| Cleanup packets / owner routing | complete | Five keep packets, five keep/reject decisions | Verification |
| Verification | complete | Focused tests and `bun check` passed | Closeout |
| Closeout | complete | Plan updated | Final response |

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | Strong | Core private state helpers | `document-value`, `normalization-fast-path`, `operation-root-state`, `transaction-depth`, `version-state` | Only served `public-state.ts` and re-exports | 6 files -> 1 owner; proof clear | merge into `public-state.ts` | Slate core | Slate focused tests, typecheck, `bun check` | merge |
| 2 | Strong | Delete-text planning shards | `delete-text-location`, `delete-text-preservation`, `delete-text-types` | One algorithm scattered across plan/location/types | 4 plan files -> 1 plan owner plus removal/structural owners | merge into `delete-text-plan.ts` | Slate text transforms | delete tests, public-surface alias contract, `bun check` | merge |
| 3 | Strong | DOM repair one-owner helpers | `dom-repair-frame`, `dom-repair-profiler`, `dom-repair-scheduler` | Only used by `dom-repair-queue.ts` | 4 files -> 1 queue owner | merge into queue | Slate React editable | Slate React tests/typecheck, `bun check` | merge |
| 4 | Strong | Editable void wrapper | `editable-rendered-void.tsx` | One caller in `editable-text-blocks.tsx` | 2 files -> 1 rendering owner | inline | Slate React components | Slate React tests/typecheck, `bun check` | inline |
| 5 | Strong | Slate-browser budget helper | `budget-assertions.ts` | One caller in scenario harness | 2 files -> 1 scenario owner | inline | Slate Browser Playwright | scenario test, slate-browser typecheck, `bun check` | inline |
| 6 | Keep | Shared tiny primitives | `clone.ts`, `constants.ts`, `surface.ts`, `handle.ts`, `ready.ts`, `materialization.ts`, `root-focus.ts`, `full-document-range.ts` | Multiple callers or stable primitive names | Keeping avoids duplication or worse ownership | keep | Package owners | importer audit | keep |
| 7 | Keep | Mutation profiler/root scope | `mutation-profiler.ts`, `mutation-root-scope.ts` | Two mutation owners use them | Shared mutation policy, not paragraph confetti | keep | Slate React editable | importer audit | keep |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Result | Next |
|--------|--------|-------|-------|-------|--------|------|
| Core state helper merge | merge | Slate core | 5 deleted, `public-state.ts` updated | Slate focused tests, typecheck, `bun check` | keep | none |
| Delete-text plan consolidation | merge | Slate text transforms | 3 deleted, 1 added | public-surface alias contract caught/fixed aliases; `bun check` | keep | none |
| DOM repair helper merge | merge | Slate React editable | 3 deleted, queue updated | Slate React tests/typecheck, `bun check` | keep | none |
| Editable void inline | inline | Slate React components | 1 deleted, text blocks updated | Slate React tests/typecheck, `bun check` | keep | none |
| Slate-browser budget inline | inline | Slate Browser Playwright | 1 deleted, harness scenario updated | scenario test, slate-browser typecheck, `bun check` | keep | none |
| Parent analysis compression | simplify | Parent docs analysis | 7201-line artifact compressed to 88-line ledger | wc and source audit | keep | none |

Cleanup counts:
- delete: 13 helper files removed
- merge: 3 packets
- inline: 2 packets
- simplify: 1 parent analysis artifact compressed
- split: 1 consolidated `delete-text-plan.ts` added while removing 3 shards
- keep: 7 reviewed candidate groups
- defer: 0
- reject: 0
- plan: 0

Changed list:
- code/runtime/API: `.tmp/slate-v2` Slate core, Slate React, and Slate Browser helper ownership only; no public API rename/removal
- tests/oracles: no new tests; existing public-surface alias oracle caught and guided the fix
- docs/plans: compressed `docs/analysis/2026-06-16-slate-v2-architecture-deepening.md`; updated this goal plan
- skills/workflow: no `.agents/rules/**` edits in this pass
- reverted/quarantined: none

Needs review:
- Review `docs/analysis/2026-06-16-slate-v2-architecture-deepening.md` for whether the compressed ledger preserves enough durable context.
- Before committing, re-stage the parent checkout intentionally; this run did not perform git staging.

Verification evidence:
- `bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/transaction-contract.ts ./packages/slate/test/delete-contract.ts` in `.tmp/slate-v2`: 1236 pass.
- `bun test ./packages/slate-react/test/surface-contract.tsx ./packages/slate-react/test/projected-command-contract.test.ts` in `.tmp/slate-v2`: 53 pass.
- `bun test test/core/scenario.test.ts` in `.tmp/slate-v2/packages/slate-browser`: 23 pass.
- `bun run typecheck` in `.tmp/slate-v2/packages/slate-browser`: pass.
- `bun --filter ./packages/slate typecheck && bun --filter ./packages/slate-react typecheck` in `.tmp/slate-v2`: pass.
- `bun check` in `.tmp/slate-v2`: pass.
- Stale deleted-helper audit: no matches.
- Active old architecture skill ref audit: no matches in active rules/skills/templates/vision/analysis paths.
- Untracked Slate v2 file count: 113 -> 101.
- New files under 80 lines: 37 -> 25.
- Parent analysis artifact: 7201 lines -> 88 lines.

Final handoff contract:
- Source roots inspected: `.tmp/slate-v2/packages/slate/src`, `slate-react/src`, `slate-browser/src`, tests, parent docs/plans/analysis
- Candidate count and top recommendation: 7 groups; top recommendation was merging one-owner private helper files
- Cleanup counts: 13 deleted helper files, 1 consolidated helper added, 1 analysis artifact compressed
- Agent-navigation score changes: obvious helper confetti reduced; 113 -> 101 untracked files, 37 -> 25 sub-80-line files
- Packets applied with keep/revert/quarantine result: all five code packets kept; parent analysis simplification kept
- Proof commands/source audits: listed in verification evidence
- Rejected/deferred candidates: kept shared tiny primitives and mutation policy helpers because merging them would worsen ownership
- Needs-review list: compressed analysis ledger and intentional staging before commit
- Residual risks: no browser interaction proof was run because behavior was intended unchanged; `bun check` and Slate Browser core proof passed
- Next owner and exact first command/file: `$autoreview` if committing; otherwise inspect `.tmp/slate-v2/packages/slate/src/core/public-state.ts`

Timeline:
- 2026-06-17T06:28:10.505Z Architecture-cleanup goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Clean Slate v2 over-splits without changing behavior or public API |
| What have I learned? | Good owner splits stayed; one-owner helper shards were merged back; existing alias oracle caught a bad internal type shortcut |

Open risks:
- No visible browser interaction proof was run because this was behavior-neutral source cleanup; if editor behavior changes appear, route to `slate-auto` or `slate-patch`.
- The parent checkout index may still contain staged state from earlier work; this run did not stage or unstage files.
