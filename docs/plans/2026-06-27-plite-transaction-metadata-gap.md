# plite transaction metadata gap

Objective:
Fill Plite transaction metadata gap; done when NodeId no longer uses empty update hack and Core/Plite tests pass.

Goal plan:
docs/plans/2026-06-27-plite-transaction-metadata-gap.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: user-invoked `auto`
- prompt / link: `[$auto] fill plite gap first for absolute best`
- lane: shared editor, primary owner Plite substrate with Core consumer migration
- surface / route / package: `packages/plite`, `packages/plite-history`, `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts`
- invocation mode: full-loop
- minimum runtime / deadline: none
- completion threshold summary: Plite exposes a first-class active-transaction metadata primitive, NodeId uses it instead of the empty update hack, focused history/NodeId proof passes, and `check:core` passes.

First checkpoint:
- Requirement: fill the Plite gap first, not patch around it in Plate/Core.
- Requirement: choose the absolute best API shape, not a compatibility shim.
- Scope: transaction metadata ergonomics for active Plite updates, plus NodeId migration from empty-update metadata hack.
- Non-goals: broad NodeId insert/split semantic recovery, browser proof, docs rewrite, release, PR, package sweep, or runtime bridge deletion.
- Stop condition: stop when the primitive and consumer migration are proven, or when a public API fork requires `plite-plan`.
- Final handoff: changed list, proof commands, review attention, residual NodeId migration debt, and next owner.
- Verification surface: focused Plite metadata/history tests, focused Core NodeId tests, old empty-hack source audit, Plite/Core type/lint/test proof through `pnpm check:core`.
- First extraction status: complete.

Timed checkpoint:
- requested duration: none
- semantics: full-loop until completion threshold or unsafe API fork
- initial confidence score: 84/100
- improvement loop: design primitive, prove nested metadata, migrate NodeId, run focused and package proof
- final score / loop closure: 98/100; focused and broad proof passed. Remaining 2 points are normal public API taste review for whether `metadata.merge` is the exact preferred verb.

Completion threshold:
- Plite exposes a first-class active-transaction metadata mutation primitive.
- Plite has tests proving active transaction metadata controls history skip.
- Core NodeId uses the primitive instead of an empty nested `editor.update`.
- Source audit finds no `editor.update(() => {}, { metadata` hack in NodeId.
- Focused NodeId proof passes.
- `pnpm check:core` passes.
- Closure is legal only when required behavior, visual/native selection, package/API, mobile/raw-device claim width, huge-document, docs/skill repair, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plite-transaction-metadata-gap.md` passes.

Verification surface:
- Focused Plite proof: `pnpm --filter @platejs/plite-history exec bun test test/history-contract.ts --test-name-pattern "<metadata/history row>"` or equivalent focused package row.
- Focused Core proof: `pnpm --filter @platejs/core exec bun test src/lib/plugins/node-id/NodeIdPlugin.spec.tsx`.
- Source audit: `rg -n 'editor\\.update\\(\\(\\) => \\{\\}, \\{\\s*metadata' packages/core/src packages/plite/src packages/plite-history/src`.
- Package proof: `pnpm check:core`.
- Browser proof: N/A, no browser-visible UI path in this primitive packet.
- Mobile/raw-device proof: N/A, no mobile claim.
- Docs audit: N/A unless public docs are touched.
- Final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plite-transaction-metadata-gap.md`.

Constraints:
- Resolve lane first: Plite, Plate, or shared editor. Use `autoclosure` for post-merge/current-tree until-clean closure.
- Release, PR, and publish work are in scope only when the prompt explicitly asks for them or the active lane requires them.
- Plite-lane proof runs from the Plate repo root against transplanted Plite packages and routes. Do not use donor-checkout proof.
- Plate-lane proof runs in the owning Plate package, app, or docs route. Plite runtime proof does not prove Plate docs, registry, plugin, or package DX.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a stopping checkpoint routes to `plite-plan`.
- Do not patch Plate when the run is scoped to Plite. Do not patch Plite runtime when the run is scoped to Plate docs/product unless a shared-editor owner row names that boundary.
- Use root `VISION.md` and relevant `docs/vision/*.md` for durable taste.
- Do not create compatibility aliases or runtime shims unless the checkpoint explicitly requires them.

Boundaries:
- Source of truth: current Plite transaction runtime, Plite history extension/tests, Core NodeId plugin/tests.
- Allowed edit scope: `packages/plite/src/**`, `packages/plite/test/**`, `packages/plite-history/test/**`, `packages/core/src/lib/plugins/node-id/**`, and this goal plan.
- Browser surfaces: N/A for this packet.
- Package/API surfaces: Plite transaction API and Core NodeId consumer.
- Agent/skill surfaces: none.
- Docs/research surfaces: this plan only.
- Non-goals: broad NodeId insert/split recovery, Plate package sweep, docs, Browser proof, release, PR.

Output budget strategy:
- Use exact owner files and focused `rg`; no broad repo scans beyond bounded source audits. Cap command output and inspect test files in slices.

Blocked condition:
- Stop only if the primitive requires a public API naming fork that conflicts with existing `editor.update` semantics and cannot be resolved from source/vision.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: shared editor, primary Plite
- surface: transaction metadata primitive plus Core NodeId migration
- mode: full-loop
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 1
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: none
- goal_status: ready-for-close

Current verdict:
- verdict: keep
- confidence: 98/100 after proof
- next owner: user review, then auto can continue broader Plate/Core cleanup
- keep / revert / quarantine call: keep
- reason: Empty nested update worked but was bad API shape; Plite now owns active transaction metadata through `tx.metadata.merge`.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plite-transaction-metadata-gap.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | complete | P0 | Copy prompt requirements and read vision before implementation. | Requirement rows complete. | updated |
| status | auto | complete | P0 | Read active plan, latest prompt, source status, and current evidence. | Source read identified NodeId empty-update metadata hack and existing nested metadata merge behavior. | updated |
| gap-scan | auto | complete | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Gap resolved as missing Plite active-transaction metadata primitive. | updated |
| closure-handoff | autoclosure | N/A | P0 when merged/current-tree work is in scope | Run until-clean closure for already-applied work. | This was a focused primitive packet, not post-merge closure. | retired |
| behavior-proof | lane proof owner | complete | P0 | Prove stable editor behavior before perf. | Plite commit metadata, Plite history, and Core NodeId focused tests passed. | updated |
| oracle-repair | lane test owner / tdd | complete | P0 | Add missing native/visual/model oracles for found gaps. | Added Plite commit metadata and Plite history tests for `tx.metadata.merge`. | updated |
| visual-proof | Browser / Playwright | N/A | P0 | Prove visible editor behavior and native selection. | No browser-visible UI behavior changed; package/API primitive only. | retired |
| browser-helper-promotion | lane proof harness | N/A | P1 | Promote repeated browser proof into reusable API/helper. | No repeated browser proof pattern in this packet. | retired |
| mobile-claim-width | auto | N/A | P1 | Separate raw-device proof from viewport proof. | No mobile claim. | retired |
| huge-document-smoke | lane proof owner | N/A | P1 | Smoke huge-doc correctness without broad architecture work when in scope. | No huge-document behavior claim. | retired |
| perf-packet | lane perf owner | N/A | P2 | Optimize only after correctness is green. | No perf path changed. | retired |
| supervision-mode | auto | N/A | P0 when timed runtime remains | If backlog looks empty before minimum runtime, predict next useful checkpoint from vision and evidence. | No timed minimum. | retired |
| consolidation | auto | complete | P1 | Move accepted reusable decisions to durable docs/rules. | Primitive added to source owner; no doctrine/rule change needed. | updated |
| final-handoff | auto | complete | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Final handoff rows filled below. | updated |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | complete |
| 0 | update | checkpoint-zero, status, proof rows | user requested Plite gap first | Narrowed to transaction metadata primitive plus NodeId consumer migration. | complete |
| 1 | update | gap-scan, behavior-proof, oracle-repair | source and tests | Added `tx.metadata.merge` primitive and focused oracles. | complete |
| 1 | retire | visual/browser/mobile/huge/perf rows | scope audit | Package/API-only packet, no UI/mobile/perf claim. | complete |
| 1 | update | final-handoff | proof complete | Broad `check:core` passed. | complete |

Mutation rules:
- Add a checkpoint when a new failure, missing oracle, missing metric, API smell, visual proof gap, workflow slowdown, taste gap, or owner gap appears.
- Update a checkpoint when evidence changes its scope, priority, owner, command, exit rule, or proof surface.
- Split a checkpoint when it hides multiple owners or one prompt would become too large.
- Merge checkpoints when overlap confuses routing or two rows always close together.
- Retire or remove checkpoints that are stale, superseded, irrelevant, duplicated, or contradicted by current evidence. Record the reason in the mutation ledger.
- Reopen a closed checkpoint when new evidence invalidates its proof.
- Reprioritize after every loop. The next checkpoint is chosen from current evidence, not from the original row order.
- The supervisor is not stuck on this template or the initial prompt plan. The user's latest request, `vision`, and current source evidence outrank stale plan rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint records Plite gap first, absolute-best API, NodeId migration, non-goals, proof, and handoff. |
| `auto` source rule read or fallback recorded | yes | `auto` skill read from `.agents/skills/auto/SKILL.md`; user also pasted current skill body. |
| `vision` read as checkpoint zero | yes | Root `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md` read. |
| Active goal checked or created | yes | Active goal created for this plan. |
| Lane resolved | yes | Shared editor lane, primary Plite substrate. |
| Invocation mode and timebox recorded | yes | Full-loop, no timed minimum. |
| Dynamic checkpoint policy accepted | yes | Checkpoint supervisor remains active; irrelevant rows will close as N/A. |
| Source of truth and allowed workspaces recorded | yes | Boundaries section records package owners and edit scope. |
| Output budget strategy recorded | yes | Exact owner files and focused audits only. |
| Release/PR/publish boundary recorded | yes | Release/PR/publish out of scope. |
| Browser proof strategy recorded | yes | Browser proof N/A for non-visual runtime primitive packet. |
| Package/API proof strategy recorded | yes | Focused Plite/Core tests plus `pnpm check:core`. |
| Mobile/raw-device claim-width policy recorded | yes | N/A; no mobile claim. |
| Skill repair authority and source-rule boundary recorded | yes | No skill changes planned. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining backlog ladder, and supervision-mode fallback are recorded.
- [x] Lane is resolved as Plite, Plate, or shared editor, with owning workspace/package/app proof named.
- [x] Checkpoint supervisor table has been reconciled at least once after the initial seed.
- [x] Post-merge/current-tree closure is routed to `autoclosure` when in scope, or marked N/A with reason.
- [x] Each loop ends with a checkpoint mutation decision: add, update, split, merge, retire, remove, reopen, reprioritize, or no-change with reason.
- [x] Current-tree/status packet recorded before new runtime patches.
- [x] Behavior proof packet recorded for every in-scope stable editor family or explicitly skipped/deferred with reason.
- [x] Visual/native selection proof packet recorded for browser-visible selection/editing risks or explicitly scoped.
- [x] Missing oracle packets are written, kept, reverted, quarantined, or deferred with owner and proof command.
- [x] Repeated browser proof patterns are promoted to `@platejs/browser` or queued with reason.
- [x] Mobile/raw-device proof is run or the claim width is explicitly limited; Playwright viewport proof is not recorded as raw-device proof.
- [x] Huge-document correctness smoke is run or deferred with owner and reason.
- [x] Perf packet runs only after correctness is green, or is marked N/A for this run.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are audited when in scope.
- [x] Docs/vision/rule consolidation is applied when a reusable decision is accepted, or marked N/A.
- [x] Workflow slowdowns are logged and avoidable repeats are repaired in the owner skill/script/gate.
- [x] Packet ledger contains one row per proof, bug fix, oracle, benchmark, docs, or skill packet.
- [x] Changed list is current and includes only this run.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued or marked none.
- [x] Autoreview/review gate is run for non-trivial implementation diffs or marked N/A with reason.
- [x] Agent-native review is run for `.agents/**`, commands, skills, hooks, or prompt/tooling changes, or marked N/A with reason.
- [x] Output budget discipline is followed: broad scans are capped or written to artifacts instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | complete | Run the proof commands/artifacts named in this plan | Focused tests and `pnpm check:core` passed. |
| Dynamic checkpoint reconciliation | complete | Prove the plan was updated from evidence and not frozen to the initial seed | Checkpoint table and mutation ledger updated from source/test evidence. |
| Lane authority proof | complete | Prove each command ran in the owning Plite/Plate/shared workspace, or record N/A | Commands ran from `/Users/zbeyens/git/plate-2` with package filters. |
| Workspace authority proof | complete | Record cwd/tool for each package, docs, skill, browser, or benchmark proof | Proof commands listed below. |
| Behavior gates | complete | Run focused stable behavior proof or record scoped defer rows | Plite commit metadata, Plite history, and Core NodeId focused tests passed. |
| Visual/native selection proof | N/A | Record Browser/Playwright/native-selection evidence or scoped blocker | No browser-visible editor behavior changed. |
| Missing oracle repair | complete | Add/verify/revert/quarantine oracle packets or record owner defer | Added Plite contract and history consumer tests. |
| `@platejs/browser` promotion | N/A | Add/verify helper/API or record queue/defer reason | No browser helper pattern in scope. |
| Mobile/raw-device claim width | N/A | Run raw-device proof or record that only scoped viewport/browser proof is available | No mobile claim. |
| Huge-document correctness smoke | N/A | Run focused huge-document behavior smoke or record owner defer | No huge-document claim. |
| Package/API proof | complete | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | `pnpm check:core` passed. |
| Autoclosure handoff | N/A | Delegate post-merge/current-tree until-clean work to `autoclosure`, otherwise N/A | Not post-merge/current-tree closure. |
| Skill/rule sync | N/A | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | No `.agents/**` changes. |
| Changed list / review attention / stopping checkpoints | complete | Fill final handoff ledgers from current packet evidence | Filled below. |
| Final lint/check | complete | Run scoped lint/check or record why no code changed | `pnpm check:core` passed, including lint. |
| Workflow slowdown review | complete | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Only Bun path-filter retry; recorded below. |
| Agent-native review for agent/tooling changes | N/A | Load `agent-native-reviewer` and close accepted findings, or N/A | No agent/tooling changes. |
| Autoreview for non-trivial implementation changes | N/A | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | Focused source-owner primitive with `check:core` passed; user did not request autoreview for this packet. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plite-transaction-metadata-gap.md` | pending final checker run |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | Prompt requirements, vision, active goal, lane, and proof surface recorded. | gap scan |
| Status and current-state read | complete | Source read identified empty nested update metadata hack and Plite nested metadata merge behavior. | gap scan |
| Gap scan and scenario matrix | complete | Source smell was Core using empty nested update to mutate active commit metadata. | behavior proof |
| Behavior proof | complete | Focused Plite/Core tests passed. | oracle repair |
| Oracle repair | complete | Added source-owner tests for `tx.metadata.merge`. | visual proof |
| Visual/native proof | N/A | No visible/browser behavior change. | browser helper promotion |
| Browser helper promotion | N/A | No repeated browser helper. | mobile claim width |
| Mobile/raw-device claim width | N/A | No mobile claim. | huge-document smoke |
| Huge-document correctness smoke | N/A | No huge-document claim. | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | complete | Package/API proof passed; docs/skill/perf N/A. | consolidation |
| Consolidation and review | complete | Primitive lives in Plite source owner; no docs/rules touched. | final handoff |
| Final handoff and goal-plan check | complete | Handoff rows filled; final checker pending. | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| Plite metadata primitive | package API | active editor.update | tx.metadata.merge | commit metadata and history skip | complete |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| plite-metadata-primitive | 1 | Plite | Core needed to mutate active transaction metadata without fake nested updates. | `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/core/public-state.ts`, `packages/plite/src/index.ts`; focused Plite tests | `commit-metadata-contract.ts` and `history-contract.ts` passed | keep | none |
| node-id-consumer | 1 | Core | NodeId should use Plite transaction metadata directly instead of `editor.update(() => {}, { metadata })`. | `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts`; focused NodeId test | NodeId test passed; source audit no empty update hack | keep | none |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Commit metadata | `@platejs/plite` | `pnpm --filter @platejs/plite exec bun test ./test/commit-metadata-contract.ts` | N/A | 8 pass | none |
| History skip consumer | `@platejs/plite-history` | `pnpm --filter @platejs/plite-history exec bun test ./test/history-contract.ts` | N/A | 51 pass | none |
| NodeId consumer | `@platejs/core` | `pnpm --filter @platejs/core exec bun test ./src/lib/plugins/node-id/NodeIdPlugin.spec.tsx` | N/A | 14 pass | none |
| Core/Plite lane | repo root | `pnpm check:core` | N/A | pass | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| N/A | N/A | N/A | N/A | N/A | No browser-visible selection behavior changed. |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| N/A | N/A | N/A | N/A | No browser helper work in this package/API packet. |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| N/A | N/A | N/A | N/A | No mobile claim. |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| N/A | N/A | N/A | N/A | No huge-document claim. |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Focused Bun path commands | auto | under 1s retry | Initial command omitted `./`, so Bun interpreted paths as test filters. | Rerun with `./test/...` passed. | No skill/script repair needed; use explicit `./` in future Bun file commands. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Added `EditorTransactionMetadataApi`, `tx.metadata.merge`, and exported the type from `@platejs/plite`; migrated Core NodeId to use it. |
| tests/oracles/browser proof | Added Plite commit metadata contract coverage and Plite history skip coverage for transaction metadata. |
| benchmarks/metrics/targets | None. |
| examples/docs | Goal plan only; no public docs/examples touched. |
| skills/workflow | None. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `tx.metadata.merge` naming | This becomes a small public Plite transaction API. | `packages/plite/src/interfaces/editor.ts` | Keep unless you prefer a sharper verb like `tx.metadata.set` for merge semantics. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | N/A | None. | No blocker remains. | None. | Broader Plate/Core cleanup can continue. | Keep this packet. | N/A |

Findings:
- NodeId had an API smell: it used an empty nested `editor.update` only to merge history metadata into the active transaction.
- Plite already had the runtime ability to merge nested metadata, so the correct fix was a first-class active transaction API.

Decisions and tradeoffs:
- Added `tx.metadata.merge(metadata)` only on the active transaction, not as `editor.update.metadata.merge`, because a direct update method would invite empty commits.
- Kept the primitive general instead of history-specific, so future Core/Plate callers can merge selection/collab/origin metadata without new hacks.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Bun focused test paths without `./` were treated as filters. | 2 | Prefix file paths with `./`. | Rerun passed. |

Verification evidence:
- `rg -n -F "editor.update(() => {}," packages/core/src packages/plite/src packages/plite-history/src` produced no matches.
- `pnpm --filter @platejs/plite exec bun test ./test/commit-metadata-contract.ts` passed: 8 tests.
- `pnpm --filter @platejs/plite-history exec bun test ./test/history-contract.ts` passed: 51 tests.
- `pnpm --filter @platejs/core exec bun test ./src/lib/plugins/node-id/NodeIdPlugin.spec.tsx` passed: 14 tests.
- `pnpm check:core` passed.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-27-plite-transaction-metadata-gap.md`
- Lane: shared editor, primary Plite
- Surface and route/package: `@platejs/plite`, `@platejs/plite-history`, `@platejs/core` NodeId
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop, no timed minimum, one implementation loop
- Behavior gates and visual proof: package/API proof complete; visual/browser proof N/A
- Primary metric baseline/latest/best and stop reason: API smell fixed; `check:core` passed
- Bugs fixed and oracles added: `tx.metadata.merge`; Plite commit metadata test; Plite history skip test
- Benchmark/skill/docs repairs: none
- Workflow slowdowns and repairs: Bun path filter retry recorded; no durable repair needed
- Changed list: filled above
- Needs your attention: naming review for `tx.metadata.merge`
- Stopping checkpoints to unblock: none
- Accepted deferrals and residual risks: no browser/mobile/huge-doc proof because no visible/runtime behavior claim; public verb taste review remains
- Next owner: user review or broader `auto` Plate/Core cleanup

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff |
| Where am I going? | Close the goal after checker passes |
| What is the goal? | Fill Plite transaction metadata gap before Core cleanup |
| What have I learned? | NodeId needed active transaction metadata, not an empty update |
| What have I done? | Added `tx.metadata.merge`, migrated NodeId, added tests, ran `check:core` |
| What changed in the checkpoint plan? | Template rows retired as N/A where out of scope; proof rows completed |

Timeline:
- 2026-06-27T18:37:40.106Z Goal plan created.
- Implemented Plite `tx.metadata.merge` primitive.
- Added Plite commit metadata and Plite history tests.
- Migrated Core NodeId off empty nested update metadata hack.
- Ran focused tests and `pnpm check:core`.

Open risks:
- Only naming taste remains: `merge` accurately describes deep metadata merge, but it is a new public transaction verb.
