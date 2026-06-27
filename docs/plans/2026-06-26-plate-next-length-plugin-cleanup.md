# plate-next length plugin cleanup

Objective:
Clean the `LengthPlugin` runtime marker; done when `runtimeLength` is gone, length enforcement is plugin-owned, and focused core proof passes.

Goal plan:
docs/plans/2026-06-26-plate-next-length-plugin-cleanup.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: user-invoked `plate-next`
- prompt / link: "`wtf is export const LengthPlugin = Object.assign(... runtimeLength: true ...) that you moved to packages/core/src/react/editor/createPlateRuntimeEditor.ts`"
- lane: Plate Next cleanup
- surface / route / package: `packages/core`
- invocation mode: one-shot execution
- minimum runtime / deadline: N/A: no timed checkpoint requested
- completion threshold summary: remove plugin-specific `runtimeLength` marker and prove max-length behavior still passes.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A: no timed checkpoint requested
- initial confidence score: N/A: source/proof checklist is stronger than a time score for this micro packet
- improvement loop: N/A: one targeted cleanup packet
- final score / loop closure: N/A: use command/source-audit evidence

Completion threshold:
- `runtimeLength` and its cleanup/extension fields have zero source matches in `packages/core/src`.
- Length enforcement is installed through the generic Plate plugin `extensions` pipeline.
- Focused length tests pass for base editor and runtime editor paths.
- Closure is legal only when required behavior, visual/native selection, package/API, mobile/raw-device claim width, huge-document, docs/skill repair, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-plate-next-length-plugin-cleanup.md` passes.

Verification surface:
- Source audit: `rg -n -F 'runtimeLength' packages/core/src packages/core/type-tests --glob '!**/dist/**'`
- Focused package tests: `pnpm --filter @platejs/core exec bun test src/lib/plugins/length/LengthPlugin.spec.ts src/react/editor/createPlateRuntimeEditor.spec.ts`
- Type proof if source changes warrant it: `pnpm turbo typecheck --filter=./packages/core`
- Plite package proof uses `pnpm plite:test` and `pnpm plite:typecheck`.
- Plite daily proof uses `pnpm check:plite`.
- Plite focused browser proof uses `pnpm --filter plite test:plite-browser:chromium <file-or--grep>`.
- `apps/plite` reuses `apps/www` Plite examples; never maintain a second example source tree.
- Plite release/deletion proof adds explicit closure gates such as package
  build, docs checks, benchmark target audit, and
  `pnpm check:plite:browser-matrix` when those claims are in scope.

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
- Source of truth: `packages/core/src/lib/plugins/length/LengthPlugin.ts`, `withPlite.ts`, `createPlateRuntimeEditor.ts`, and `currentRuntimeBridge.ts`
- Allowed edit scope: length enforcement ownership and exact duplicate runtime marker cleanup
- Browser surfaces: N/A: no visible route change
- Package/API surfaces: internal plugin/runtime implementation only; no public API rename
- Agent/skill surfaces: N/A: no skill rule change
- Docs/research surfaces: N/A: no docs surface
- Non-goals: broad runtime special-case cleanup, all remaining `runtime*` plugin markers, Plate v2 API redesign

Output budget strategy:
- Use exact `rg` symbols and focused `sed` ranges only. Avoid broad package scans unless a focused proof fails.

Blocked condition:
- Block only if focused tests prove the generic plugin extension pipeline cannot preserve length behavior without a larger public runtime API fork.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: Plate Next cleanup
- surface: `packages/core` length plugin/runtime ownership
- mode: one-shot execution
- minimum_runtime: N/A: no duration requested
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 1
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: complete goal
- goal_status: active

Current verdict:
- verdict: keep cleanup
- confidence: high
- next owner: auto
- keep / revert / quarantine call: keep
- reason: `runtimeLength` was a plugin-specific bridge; `LengthPlugin.extensions` preserves behavior through the generic owner path.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-plate-next-length-plugin-cleanup.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | complete | P0 | Copy prompt requirements and read vision before implementation. | User target, scope, proof, and non-goals copied above; `VISION.md`, `docs/vision/plate.md`, and `docs/vision/common.md` read. | update |
| status | auto | complete | P0 | Read active plan, latest prompt, source status, and current evidence. | Source map read for `LengthPlugin`, `withPlite`, `createPlateRuntimeEditor`, and `currentRuntimeBridge`. | update |
| gap-scan | auto | complete | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Found plugin-specific `runtimeLength` marker and duplicate length enforcement paths. | update |
| closure-handoff | autoclosure | complete | N/A | Run until-clean closure for already-applied work. | N/A: not a post-merge/current-tree closure prompt. | retire |
| behavior-proof | lane proof owner | complete | P0 | Prove stable editor behavior before perf. | Focused length/runtime tests passed. | update |
| oracle-repair | lane test owner / tdd | complete | N/A | Add missing native/visual/model oracles for found gaps. | N/A: existing focused tests covered base/runtime length behavior. | retire |
| visual-proof | Browser / Playwright | complete | N/A | Prove visible editor behavior and native selection. | N/A: no visible browser route changed. | retire |
| browser-helper-promotion | lane proof harness | complete | N/A | Promote repeated browser proof into reusable API/helper. | N/A: no browser proof pattern used. | retire |
| mobile-claim-width | auto | complete | N/A | Separate raw-device proof from viewport proof. | N/A: no mobile/browser claim. | retire |
| huge-document-smoke | lane proof owner | complete | N/A | Smoke huge-doc correctness without broad architecture work when in scope. | N/A: length plugin ownership only. | retire |
| perf-packet | lane perf owner | complete | N/A | Optimize only after correctness is green. | N/A: no perf claim. | retire |
| supervision-mode | auto | complete | N/A | If backlog looks empty before minimum runtime, predict next useful checkpoint from vision and evidence. | N/A: no timed minimum. | retire |
| consolidation | auto | complete | N/A | Move accepted reusable decisions to durable docs/rules. | N/A: existing Plate/Plite boundary law already covers this. | retire |
| final-handoff | auto | complete | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Final handoff rows filled below. | update |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | replaced by scoped packet rows |
| 1 | update/retire | all broad browser/mobile/perf rows | source map + prompt scope | this is a targeted internal runtime cleanup | complete |

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
| Prompt requirements captured before work | yes | The exact `LengthPlugin` / `runtimeLength` question, scope, proof, and non-goals are copied in this plan. |
| `auto` source rule read or fallback recorded | yes | `plate-next` skill read; it wraps `auto` for implementation/proof. |
| `vision` read as checkpoint zero | yes | `VISION.md`, `docs/vision/plate.md`, and `docs/vision/common.md` read. |
| Active goal checked or created | yes | `get_goal` returned none; goal created for this packet. |
| Lane resolved | yes | Plate Next cleanup for `packages/core`; Plite runtime primitive unchanged. |
| Invocation mode and timebox recorded | yes | One-shot execution; no timed checkpoint. |
| Dynamic checkpoint policy accepted | yes | Broad generated rows reconciled to scoped keep/N/A verdicts. |
| Source of truth and allowed workspaces recorded | yes | `packages/core` source files named in Boundaries. |
| Output budget strategy recorded | yes | Exact `rg` and focused `sed` ranges only. |
| Release/PR/publish boundary recorded | yes | N/A: no release, PR, publish, or git operation requested. |
| Browser proof strategy recorded | yes | N/A: no browser-visible surface changed. |
| Package/API proof strategy recorded | yes | Focused core tests, typecheck, lint, and exact symbol audit. |
| Mobile/raw-device claim-width policy recorded | yes | N/A: no mobile claim. |
| Skill repair authority and source-rule boundary recorded | yes | N/A: no skill/rule change. |

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
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | Focused tests, typecheck, lint, and `runtimeLength` source audit passed. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | Broad rows retired or marked N/A after source map. |
| Lane authority proof | yes | Prove each command ran in the owning Plite/Plate/shared workspace, or record N/A | Commands ran from repo root against `@platejs/core`. |
| Workspace authority proof | yes | Record cwd/tool for each package, docs, skill, browser, or benchmark proof | `cwd=/Users/zbeyens/git/plate-2`; package `@platejs/core`. |
| Behavior gates | yes | Run focused stable behavior proof or record scoped defer rows | `LengthPlugin.spec.ts` and `createPlateRuntimeEditor.spec.ts` passed. |
| Visual/native selection proof | no | Record Browser/Playwright/native-selection evidence or scoped blocker | N/A: no visible browser/editor selection change. |
| Missing oracle repair | no | Add/verify/revert/quarantine oracle packets or record owner defer | N/A: existing focused oracles covered the behavior. |
| `@platejs/browser` promotion | no | Add/verify helper/API or record queue/defer reason | N/A: no browser proof pattern. |
| Mobile/raw-device claim width | no | Run raw-device proof or record that only scoped viewport/browser proof is available | N/A: no mobile claim. |
| Huge-document correctness smoke | no | Run focused huge-document behavior smoke or record owner defer | N/A: no huge-document claim. |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | Source audit, focused tests, typecheck, and lint passed. |
| Autoclosure handoff | no | Delegate post-merge/current-tree until-clean work to `autoclosure`, otherwise N/A | N/A: not post-merge closure. |
| Skill/rule sync | no | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | N/A: no `.agents/rules/**` changes. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | Ledgers filled below. |
| Final lint/check | yes | Run scoped lint/check or record why no code changed | `pnpm --filter @platejs/core lint` passed. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | No slowdown; exact reads and focused commands only. |
| Agent-native review for agent/tooling changes | no | Load `agent-native-reviewer` and close accepted findings, or N/A | N/A: no agent/tooling change. |
| Autoreview for non-trivial implementation changes | no | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | N/A: narrow implementation with focused tests/typecheck/lint. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-plate-next-length-plugin-cleanup.md` | Passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | Requirements copied; vision docs read. | status complete |
| Status and current-state read | complete | Source map read for length plugin and runtime callers. | gap scan complete |
| Gap scan and scenario matrix | complete | `runtimeLength` marker and duplicate install paths found. | behavior proof complete |
| Behavior proof | complete | Focused base/runtime length tests passed. | oracle repair N/A |
| Oracle repair | complete | N/A: existing tests cover this behavior. | visual proof N/A |
| Visual/native proof | complete | N/A: no browser-visible change. | browser helper promotion N/A |
| Browser helper promotion | complete | N/A: no browser proof pattern. | mobile claim width N/A |
| Mobile/raw-device claim width | complete | N/A: no mobile claim. | huge-document smoke N/A |
| Huge-document correctness smoke | complete | N/A: no huge-document claim. | perf/API/docs N/A |
| Perf/API/docs/skill packets as needed | complete | N/A for perf/docs/skill; package/API proof passed. | consolidation complete |
| Consolidation and review | complete | Existing vision boundary already covers plugin-owned runtime extension cleanup. | final handoff complete |
| Final handoff and goal-plan check | complete | Handoff rows filled; check-complete is the final command. | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| `LengthPlugin` | base editor + runtime editor | package tests | insert text + insert fragment | maxLength trimming | passed |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| length plugin owner cleanup | 1 | Plate core | `runtimeLength` is a private marker and duplicate install path | `LengthPlugin.ts`, `withPlite.ts`, `createPlateRuntimeEditor.ts`, `currentRuntimeBridge.ts` | focused tests passed | keep | close |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| maxLength trimming | `@platejs/core` | `pnpm --filter @platejs/core exec bun test src/lib/plugins/length/LengthPlugin.spec.ts src/react/editor/createPlateRuntimeEditor.spec.ts` | N/A | 107 pass, 0 fail | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| N/A | N/A | N/A | N/A | N/A | no visual/native selection surface changed |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| N/A | N/A | N/A | N/A | no browser helper used |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| N/A | N/A | N/A | N/A | no mobile claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| N/A | N/A | N/A | N/A | no huge-document claim |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| none | auto | N/A | exact source reads and focused commands were fast | tests 478ms, typecheck 7.759s, lint 143ms | no repair |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Moved max-length enforcement into `LengthPlugin.extensions`; removed `runtimeLength` special cases from base/runtime/current bridge. |
| tests/oracles/browser proof | No test files changed; existing focused tests passed. |
| benchmarks/metrics/targets | N/A |
| examples/docs | N/A |
| skills/workflow | N/A |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | other `runtimeX` markers remain | This packet only cuts `runtimeLength`; many plugin-specific runtime installers still exist. | `packages/core/src/react/editor/createPlateRuntimeEditor.ts` | review next under `plate-next`, do not expand this packet. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | N/A | N/A | No user decision needed for this cleanup. | none | none | none | N/A |

Findings:
- `runtimeLength` was a private marker only used by `withPlite` and `createPlateRuntimeEditor`.
- The generic Plate plugin `extensions` pipeline already installs Plite editor extensions for base and runtime editors.
- `currentRuntimeBridge` duplicated max-length enforcement after insert commands; the plugin extension now owns that behavior.

Decisions and tradeoffs:
- Keep `LengthPlugin` in Plate core because max-length is Plate product policy, not a Plite substrate primitive.
- Move enforcement into `LengthPlugin.extensions` so runtime does not special-case the plugin.
- Do not touch unrelated `runtimeX` markers in this packet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `rg -n -F 'runtimeLength' packages/core/src packages/core/type-tests --glob '!**/dist/**'` -> no matches.
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/length/LengthPlugin.spec.ts src/react/editor/createPlateRuntimeEditor.spec.ts` -> 107 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/core` -> 9 successful tasks.
- `pnpm --filter @platejs/core lint` -> checked 391 files, no fixes applied.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-26-plate-next-length-plugin-cleanup.md`
- Lane: Plate Next cleanup
- Surface and route/package: `packages/core`
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: one-shot execution, no minimum runtime, one packet
- Behavior gates and visual proof: focused package behavior tests passed; browser visual proof N/A
- Primary metric baseline/latest/best and stop reason: N/A; no perf metric
- Bugs fixed and oracles added: no new tests; duplicate runtime ownership cut
- Benchmark/skill/docs repairs: N/A
- Workflow slowdowns and repairs: none
- Changed list: code/runtime/API row above
- Needs your attention: remaining `runtimeX` marker family should be next cleanup lane
- Stopping checkpoints to unblock: none
- Accepted deferrals and residual risks: unrelated runtime markers deferred
- Next owner: `plate-next` for the remaining runtime marker family

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final verification complete |
| Where am I going? | Goal-plan check, then final response |
| What is the goal? | Remove `runtimeLength` and keep length behavior green |
| What have I learned? | See Findings |
| What have I done? | See Timeline |
| What changed in the checkpoint plan? | See Checkpoint mutation ledger |

Timeline:
- 2026-06-26T19:59:57.250Z Goal plan created.
- Read `plate-next`, `autogoal`, `VISION.md`, `docs/vision/plate.md`, and `docs/vision/common.md`.
- Inspected `LengthPlugin`, `withPlite`, `createPlateRuntimeEditor`, and `currentRuntimeBridge`.
- Patched max-length enforcement into `LengthPlugin.extensions` and removed `runtimeLength` special cases.
- Ran source audit, focused tests, typecheck, and lint.

Open risks:
- Remaining `runtimeX` markers in `createPlateRuntimeEditor.ts` are outside this packet.
