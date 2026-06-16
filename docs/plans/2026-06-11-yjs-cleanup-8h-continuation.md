# Yjs cleanup 8h continuation

Objective:
Use the full 8h budget to keep polishing `@slate/yjs` in sibling `../slate-v2` while Yjs tests stay green.

Goal plan:
docs/plans/2026-06-11-yjs-cleanup-8h-continuation.md

Template:
docs/plans/templates/slate-automation.md

Primary template:
docs/plans/templates/slate-automation.md

Applied packs:
- none

Automation source:
- type: user correction after early closeout
- prompt / link: `必须用8小时 来做这个事情 反复打磨`
- surface / route / package: `/Users/felixfeng/Desktop/repos/slate-v2/packages/slate-yjs`
- invocation mode: timed mode, strict budget usage
- timebox / deadline: 8h loop-start budget, started 2026-06-11T10:54:43+0800, deadline 2026-06-11T18:54:43+0800.
- completion threshold summary: do not mark complete before the 8h budget is exhausted unless a hard stop appears. Continue safe cleanup/proof packets across `packages/slate-yjs/src/**` and `packages/slate-yjs/test/**`; keep package tests/typecheck/build/lint green after kept packets; isolate unrelated root failures.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable rows: scope, non-goals, timing,
  stop conditions, deliverables, final handoff sections, verification surfaces,
  and success criteria.
- The initial checkpoint list is only the seed. After every loop, the
  supervisor must reconcile this plan against new evidence and may add, update,
  split, merge, retire, remove, reprioritize, or reopen checkpoints.
- Do not continue into implementation until first extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Hard timing rule: this continuation is not complete until 2026-06-11T18:54:43+0800 or until there is no safe autonomous Yjs cleanup/proof packet left and that no-safe-work state is proven in this plan.
- Each packet must end in `keep`, `revert`, or `quarantine`; only `keep` packets count.
- Required recurring proof after kept implementation/test-support changes: `bun test ./packages/slate-yjs/test`, `bun --filter @slate/yjs typecheck`, `bun --filter @slate/yjs build`, and `bun lint` at checkpoint boundaries.
- Browser proof is required only if a packet changes route-visible Yjs collaboration, provider, awareness, selection, or structural replay behavior.
- Root `bun check` remains useful as broad sanity, but the known non-Yjs Slate React failure must stay isolated instead of blocking this Yjs cleanup lane.
- Closure is legal only when required behavior, visual/native selection,
  package/API, mobile/raw-device claim-width, huge-document, docs/skill repair,
  changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and
  final handoff rows are complete, explicitly deferred, or N/A with evidence,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-11-yjs-cleanup-8h-continuation.md`
  passes.

Verification surface:
- Source audit: `packages/slate-yjs/src/**`, `packages/slate-yjs/test/**`, package exports/config, and previous plan `docs/plans/2026-06-11-yjs-cleanup-8h.md`.
- Recurring package proof from `/Users/felixfeng/Desktop/repos/slate-v2`: `bun test ./packages/slate-yjs/test`, focused tests matching touched files, `bun --filter @slate/yjs typecheck`, `bun --filter @slate/yjs build`, `bun lint`.
- Broad check: `bun check` only at large checkpoint boundaries; if it fails outside Yjs, isolate the failing row and keep looping on safe Yjs work.
- Browser/provider proof: focused Playwright/Browser only when source changes are browser-visible.
- Benchmark/perf: N/A unless audit finds actual Yjs performance debt.
- Final plan proof: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-11-yjs-cleanup-8h-continuation.md`, but only after the timebox rule is satisfied.

Constraints:
- Slate v2 private alpha by default: no release, publish, changeset, PR, or
  branch readiness unless the prompt explicitly asks.
- Run Slate v2 behavior commands from `.tmp/slate-v2`; parent repo commands
  prove plans, docs, skills, and templates only.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a
  stopping checkpoint routes to `slate-plan`.
- Do not patch Plate when the run is scoped to Slate v2.

Boundaries:
- Source of truth: live sibling checkout `/Users/felixfeng/Desktop/repos/slate-v2`; parent `plate-copy` owns this plan/control ledger.
- Allowed edit scope: `packages/slate-yjs/src/**`, `packages/slate-yjs/test/**`, focused package config/export files if cleanup requires it, this plan, and prior plan notes when needed.
- Browser surfaces: Yjs collaboration/provider routes only if touched behavior is visible in browser.
- Package/API surfaces: public `@slate/yjs` exports stay stable unless an API cleanup is clearly the long-term fix and proven.
- Agent/skill surfaces: no skill/rule edits unless this early-stop miss needs reusable workflow repair.
- Docs/research surfaces: plan ledger only unless a reusable Slate v2 decision must be consolidated.
- Non-goals: no commit, push, PR, publish, release, branch creation, Plate package patching, or cosmetic churn.

Blocked condition:
- Hard stop only for commit/push/PR/release authority, destructive cleanup, external credentials, unsafe public API fork with no repo-backed winner, repeated same-signal Yjs failure after focused repair, no safe Yjs cleanup/proof packet left, or actual timebox expiry after the active packet is resolved.
- Do not block while a safe alternate checkpoint remains runnable. In timed or
  batch mode, queue soft questions for final handoff.

Automation state:
- surface: `/Users/felixfeng/Desktop/repos/slate-v2/packages/slate-yjs`
- mode: timed 8h strict-continuation
- checkpoint_policy: dynamic_supervisor
- current_loop: 0
- current_checkpoint: checkpoint-zero
- current_checkpoint_status: in_progress
- next_checkpoint: status
- goal_status: active

Current verdict:
- verdict: continuation baseline green; keep polishing
- confidence: high for package proof; more safe cleanup packets remain to audit
- next owner: gap-scan
- keep / revert / quarantine call: keep
- reason: C0 baseline passed package tests/typecheck/build/lint

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-11-yjs-cleanup-8h-continuation.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-automation | complete | P0 | Copy prompt requirements and read north-star before implementation. | User correction captured; prior plan read; strict 8h continuation rule recorded. | update: completed |
| status | slate-automation | in_progress | P0 | Read active plan, latest prompt, source status, and current evidence without proactive git checks. | New baseline commands recorded. | update: next owner |
| gap-scan | slate-automation | pending | P0 | Keep finding safe cleanup/proof packets through the 8h budget. | New packets routed until deadline or proven no-safe-work. | update: strict continuation |
| behavior-proof | slate-ar-stabilize | pending | P0 | Keep all Yjs tests passing before and after each packet. | `bun test ./packages/slate-yjs/test` pass after each kept packet. | update: package tests are hard guardrail |
| oracle-repair | slate-patch / tdd | pending | P0 | Add missing native/visual/model oracles for found gaps. | New proof fails before fix or coverage gap is explicit. | seed |
| visual-proof | Browser / Playwright | pending | P0 | Prove visible editor behavior and native selection. | Browser/screenshot/geometry evidence recorded. | seed |
| slate-browser-promotion | slate-browser | pending | P1 | Promote repeated browser proof into reusable API/helper. | Helper added, queued, or N/A with reason. | seed |
| mobile-claim-width | slate-automation | pending | P1 | Separate raw-device proof from viewport proof. | Raw proof command passes or scoped blocker recorded. | seed |
| huge-document-smoke | slate-ar-stabilize | pending | P1 | Smoke huge-doc correctness without broad architecture work. | Typing/Enter/paste/select-all/undo/nav/scroll proof recorded. | seed |
| perf-packet | slate-ar-fast / slate-ar-perf | pending | P2 | Optimize only after correctness is green. | Metric target or plateau recorded. | seed |
| consolidation | slate-automation | pending | P1 | Move accepted reusable decisions to durable docs/rules. | Durable owner updated or N/A. | seed |
| final-handoff | slate-automation | pending | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows complete. | seed |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded by strict continuation extraction |
| 0 | update | checkpoint-zero, status, gap-scan, behavior-proof | user correction, prior plan, live package file counts | Prior closeout was too early; this run must continue safe packets until timebox expiry. | baseline next |

Mutation rules:
- Add a checkpoint when a new failure, missing oracle, missing metric, API smell,
  visual proof gap, workflow slowdown, taste gap, or owner gap appears.
- Update a checkpoint when evidence changes its scope, priority, owner, command,
  exit rule, or proof surface.
- Split a checkpoint when it hides multiple owners or one prompt would become
  too large.
- Merge checkpoints when overlap confuses routing or two rows always close
  together.
- Retire or remove checkpoints that are stale, superseded, irrelevant,
  duplicated, or contradicted by current evidence. Record the reason in the
  mutation ledger.
- Reopen a closed checkpoint when new evidence invalidates its proof.
- Reprioritize after every loop. The next checkpoint is chosen from current
  evidence, not from the original row order.
- The supervisor is not stuck on this template or the initial prompt plan. The
  user's latest request, `vision`, and current source evidence outrank
  stale plan rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User explicitly corrected that the work must use 8h and repeatedly polish; scope remains Yjs cleanup in `../slate-v2`; keep Yjs tests passing. |
| `slate-automation` source rule read | yes | User supplied full skill body earlier in this thread; this is a continuation of that invocation. |
| `vision` read as checkpoint zero | yes | Previous run read `.agents/skills/vision/SKILL.md`; its strict timed/batch rule is applied here. |
| Active goal checked or created | yes | New active goal created for strict 8h continuation. |
| Invocation mode and timebox recorded | yes | timed mode, strict continuation, start 2026-06-11T10:54:43+0800, deadline 2026-06-11T18:54:43+0800. |
| Dynamic checkpoint policy accepted | yes | Plan says keep adding/splitting packets until deadline or proven no-safe-work. |
| Source of truth and allowed workspaces recorded | yes | Runtime work in `/Users/felixfeng/Desktop/repos/slate-v2`; plan in `plate-copy`. |
| Output budget strategy recorded | yes | Evidence goes to plan; broad scans are capped; command output summarized. |
| Private-alpha release/PR boundary recorded | yes | No release, publish, branch, commit, or PR unless asked. |
| Browser proof strategy recorded | yes | Browser proof only for route-visible Yjs behavior changes. |
| Package/API proof strategy recorded | yes | Focused package tests/typecheck/build/lint at checkpoints. |
| Mobile/raw-device claim-width policy recorded | yes | N/A unless mobile-specific behavior is touched. |
| Skill repair authority and source-rule boundary recorded | yes | Patch `.agents/rules/**` only if this early-stop miss needs reusable workflow repair. |

Work Checklist:
- [ ] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [ ] Short objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [ ] Invocation mode, timebox/deadline, stop-question policy, and remaining
      backlog ladder are recorded.
- [ ] Checkpoint supervisor table has been reconciled at least once after the
      initial seed.
- [ ] Each loop ends with a checkpoint mutation decision: add, update, split,
      merge, retire, remove, reopen, reprioritize, or no-change with reason.
- [ ] Current-tree/status packet recorded before new runtime patches.
- [ ] Behavior proof packet recorded for every in-scope stable editor family or
      explicitly skipped/deferred with reason.
- [ ] Visual/native selection proof packet recorded for browser-visible
      selection/editing risks or explicitly scoped.
- [ ] Missing oracle packets are written, kept, reverted, quarantined, or
      deferred with owner and proof command.
- [ ] Repeated browser proof patterns are promoted to `slate-browser` or queued
      with reason.
- [ ] Mobile/raw-device proof is run or the claim width is explicitly limited;
      Playwright viewport proof is not recorded as raw-device proof.
- [ ] Huge-document correctness smoke is run or deferred with owner and reason.
- [ ] Perf packet runs only after correctness is green, or is marked N/A for
      this run.
- [ ] Package/API hard cuts, aliases, exports, and docs/API consistency are
      audited when in scope.
- [ ] Docs/north-star/rule consolidation is applied when a reusable decision is
      accepted, or marked N/A.
- [ ] Workflow slowdowns are logged and avoidable repeats are repaired in the
      owner skill/script/gate.
- [ ] Packet ledger contains one row per proof, bug fix, oracle, benchmark,
      docs, or skill packet.
- [ ] Changed list is current and includes only this run.
- [ ] Needs-your-attention list is ranked and capped at five items.
- [ ] Stopping checkpoints are queued or marked none.
- [ ] Autoreview/review gate is run for non-trivial implementation diffs or
      marked N/A with reason.
- [ ] Agent-native review is run for `.agents/**`, commands, skills, hooks, or
      prompt/tooling changes, or marked N/A with reason.
- [ ] Output budget discipline is followed: broad scans are capped or written
      to artifacts instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the proof commands/artifacts named in this plan | pending |
| Dynamic checkpoint reconciliation | pending | Prove the plan was updated from evidence and not frozen to the initial seed | pending |
| Workspace authority proof | pending | Record cwd/tool for each Slate v2, parent-docs, skill, browser, package, or benchmark proof | pending |
| Behavior gates | pending | Run focused stable behavior proof or record scoped defer rows | pending |
| Visual/native selection proof | pending | Record Browser/Playwright/native-selection evidence or scoped blocker | pending |
| Missing oracle repair | pending | Add/verify/revert/quarantine oracle packets or record owner defer | pending |
| `slate-browser` promotion | pending | Add/verify helper/API or record queue/defer reason | pending |
| Mobile/raw-device claim width | pending | Run raw-device proof or record that only scoped viewport/browser proof is available | pending |
| Huge-document correctness smoke | pending | Run focused huge-document behavior smoke or record owner defer | pending |
| Package/API proof | pending | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | pending |
| Skill/rule sync | pending | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | pending |
| Changed list / review attention / stopping checkpoints | pending | Fill final handoff ledgers from current packet evidence | pending |
| Final lint/check | pending | Run scoped lint/check or record why no code changed | pending |
| Workflow slowdown review | pending | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | pending |
| Agent-native review for agent/tooling changes | pending | Load `agent-native-reviewer` and close accepted findings, or N/A | pending |
| Autoreview for non-trivial implementation changes | pending | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-11-yjs-cleanup-8h-continuation.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | in_progress | created plan | status |
| Status and current-tree closure | pending | | gap scan |
| Gap scan and scenario matrix | pending | | behavior proof |
| Behavior proof | pending | | oracle repair |
| Oracle repair | pending | | visual proof |
| Visual/native proof | pending | | slate-browser promotion |
| slate-browser promotion | pending | | mobile claim width |
| Mobile/raw-device claim width | pending | | huge-document smoke |
| Huge-document correctness smoke | pending | | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | pending | | consolidation |
| Consolidation and review | pending | | final handoff |
| Final handoff and goal-plan check | pending | | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| `packages/slate-yjs/src/**` | attributes, document, operations, replacement, provider lifecycle, split history, React hooks | package source | cleanup packets | source ownership, API stability, contract tests | active |
| `packages/slate-yjs/test/**` | contract tests and shared support | package tests | focused touched-file tests plus full suite | behavior, provider sync, structure, selection | active |
| browser collaboration routes | conditional only | Chromium first if touched | collaboration/provider gestures | visible text, native selection, peer convergence | conditional |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| C0-baseline | 0 | slate-automation | Continuation must start from green Yjs package proof after previous cleanup. | `bun test ./packages/slate-yjs/test` -> 173 pass, 0 fail; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package proof pass | keep | gap scan |
| C1-react-test-dom-api-helper | 1 | slate-automation | React contract tests duplicate raw editor DOM API casts; shared support should own test-only DOM API patching. | Added `setEditorDomApi` in `test/support/collaboration.ts`; replaced three raw `(peer.editor as any).api` blocks in `react-contract.spec.tsx`; `bun test ./packages/slate-yjs/test/react-contract.spec.tsx` -> 5 pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/react proof pass | keep | gap scan |
| C2-provider-history-test-helper | 2 | slate-automation | Provider contract still had the only remaining Yjs `any` casts for Slate history access. | Added `getHistoryUndoCount` and `undoEditorHistory` in `test/support/collaboration.ts`; updated `provider-contract.spec.ts`; `bun test ./packages/slate-yjs/test/provider-contract.spec.ts` -> 26 pass; `rg "\bas any\b|: any\b|<any>|@ts-expect-error|TODO|FIXME|eslint-disable" packages/slate-yjs/src packages/slate-yjs/test` -> no matches; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/provider proof pass | keep | gap scan |
| C3-shared-provider-test-double | 3 | slate-automation | React and provider contract tests duplicated provider event mocks, risking drift in status/sync payload semantics. | Added configurable `FakeProvider` in `test/support/collaboration.ts`; removed local provider mocks from `react-contract.spec.tsx` and `provider-contract.spec.ts`; `bun test ./packages/slate-yjs/test/provider-contract.spec.ts` -> 26 pass; `bun test ./packages/slate-yjs/test/react-contract.spec.tsx` -> 5 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass after import-format fix. | package/provider/react proof pass | keep | gap scan |
| C4-react-hook-selector-helpers | 4 | slate-automation | React hooks repeated the same Yjs revision subscription/read pattern. | Added internal `useYjsRevision`, `useYjsAwarenessValue`, and `useYjsProviderValue` helpers in `src/react/index.ts`; public hook names and return values unchanged; `bun test ./packages/slate-yjs/test/react-contract.spec.tsx` -> 5 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/react proof pass | keep | gap scan |
| C5-controller-subscriber-notifier | 5 | slate-automation | Awareness and provider revisions hand-rolled identical subscriber loops in `YjsController`. | Added `notifySubscribers` and used it for awareness/provider revision notifications; `bun test ./packages/slate-yjs/test/awareness-contract.spec.ts ./packages/slate-yjs/test/provider-contract.spec.ts ./packages/slate-yjs/test/react-contract.spec.tsx` -> 39 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/provider/awareness/react proof pass | keep | gap scan |
| C6-paragraph-fixture-helper-seed | 6 | slate-automation | Several contract tests duplicated the same paragraph fixture factory. | Added shared `paragraph` fixture in `test/support/collaboration.ts`; replaced local factories in awareness, selection, React, and simple operation contracts; focused tests -> 28 pass; `bun --filter @slate/yjs typecheck` -> pass; first `bun lint` caught import order only; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; rerun `bun lint` -> pass. | package/test-support proof pass | keep | expand fixture cleanup |
| C7-paragraph-fixture-helper-expand | 7 | slate-automation | Remaining operation contract files duplicated the same paragraph fixture factory. | Replaced local paragraph factories in split/remove/provider/fragment/merge/wrap/unwrap/lift/move/split-merge contracts; focused affected tests -> 107 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass. | package/test-support proof pass | keep | handle structural soak |
| C8-structural-soak-paragraph-fixture | 8 | slate-automation | Structural soak still carried its own paragraph factory after C7. | Replaced structural soak paragraph helper with shared support `paragraph`; `bun test ./packages/slate-yjs/test/structural-soak-contract.spec.ts` -> 22 pass; repeated factory scan now only finds support helper; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/soak proof pass | keep | gap scan |
| C9-document-yjs-node-guard | 9 | slate-automation | `document.ts` repeated Yjs node instance checks in raw child filtering and path lookup. | Added private `isYjsNode` guard and reused it in `getRawYjsChildren` and `getYjsNode`; focused document/operation/soak tests -> 39 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; first `bun lint` caught format only; rerun `bun lint` -> pass. | package/document proof pass | keep | gap scan |
| C10-replacement-attribute-assertion | 10 | slate-automation | `replacement.ts` duplicated the same forbidden `children`/`text` attribute check in both attribute patch loops. | Added private `assertYjsAttributeCanBeSet`; focused set/replace/simple/soak tests -> 46 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/replacement proof pass | keep | gap scan |
| C11-operations-empty-text-helper | 11 | slate-automation | `operations.ts` defined `isEmptyYjsText` but `removeRedundantEmptyYjsText` still duplicated the text-content check. | Reused `isEmptyYjsText`; focused simple/delete/soak tests -> 36 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/operation proof pass | keep | gap scan |
| C12-operations-trace-factories | 12 | slate-automation | `operations.ts` hand-built identical operation and traceable-fallback trace objects in many switch branches. | Added private `operationTrace` and `traceableFallback`; preserved fallback strings; focused operation tests -> 51 pass; trace-object scan only finds the helper definitions; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/operation proof pass | keep | gap scan |
| C13-provider-shape-fixture-options | 13 | slate-automation | Provider contract used `delete (provider as Partial<FakeProvider>)` to simulate missing provider fields. | Added `exposeDoc` and `exposeSynced` options to shared `FakeProvider`; replaced provider contract deletes and direct status/synced test setup with constructor options where appropriate; provider+React focused tests -> 31 pass; delete/status/synced mutation scan now only finds the `seedProviderDoc` helper assignment; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/provider proof pass | keep | gap scan |
| C14-provider-seed-helper-api | 14 | slate-automation | `seedProviderDoc` still set provider synced state directly after C13. | Changed `seedProviderDoc` to call `provider.emitSync(true)`; provider focused tests -> 26 pass; provider mutation scan now empty for delete/status/synced writes; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/provider proof pass | keep | gap scan |
| C14b-root-check-isolation | 14 | slate-automation | Large checkpoint should run broad sanity and isolate unrelated failures. | `bun check` passed repo lint, package/site/root typecheck, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, matching known non-Yjs failure from baseline. | broad non-Yjs failure isolated | quarantine | continue Yjs packets |
| C15-provider-support-split | 15 | slate-automation | `test/support/collaboration.ts` had grown into both peer sync helpers and provider/awareness test doubles. | Added `test/support/provider.ts`; moved `FakeAwareness` and `FakeProvider` there; re-exported them from `collaboration.ts` so test imports stay stable; focused provider/awareness/react/selection tests -> 45 pass; `collaboration.ts` reduced from 428 to 239 lines; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; first `bun lint` caught import order only; rerun `bun lint` -> pass. | package/test-support proof pass | keep | gap scan |
| C16-selection-length-local | 16 | slate-automation | `selection.ts` read the same Yjs text length twice while clamping a Slate point. | Stored `getYjsLength(target)` in a local `length`; focused selection/awareness/react tests -> 19 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/selection proof pass | keep | gap scan |
| C17-provider-payload-record-guard | 17 | slate-automation | `provider.ts` repeated object/null guards while normalizing status and synced payloads. | Added private `isRecord`; focused provider+React tests -> 31 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; first `bun lint` caught formatting only; rerun `bun lint` -> pass. | package/provider proof pass | keep | gap scan |
| C18-fake-awareness-event-simplify | 18 | slate-automation | `FakeAwareness.on/off` checked `event === 'change'` even though the type only permits `change`. | Removed unreachable branches in `test/support/provider.ts`; focused awareness/provider/react tests -> 39 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/test-support proof pass | keep | gap scan |
| C19-awareness-relative-range-helper | 19 | slate-automation | `awareness.ts` decoded awareness relative-position JSON in both read and equality paths. | Added private `readYjsAwarenessRelativeRange`; focused awareness/selection/react tests -> 19 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/awareness proof pass | keep | gap scan |
| C20-test-support-yjs-node-guard | 20 | slate-automation | `getYjsNodeAt` in test support repeated inline Yjs node instance filtering. | Added local `isYjsNode` in `test/support/collaboration.ts`; focused split/merge/replace/simple tests -> 33 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/test-support proof pass | keep | gap scan |
| C21-fake-provider-listener-routing | 21 | slate-automation | `FakeProvider.on/off` duplicated status/sync/synced listener routing. | Unified listener sets as `YjsProviderEventHandler` and added private `listenersFor`; provider+React focused tests -> 31 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass. | package/test-support proof pass | keep | gap scan |
| C22-document-empty-text-predicate | 22 | slate-automation | `document.ts` inlined the empty text/no attributes predicate while removing redundant Yjs text nodes. | Added `isEmptyAttributeFreeYjsText`; focused document/operation/soak tests -> 48 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; first `bun lint` caught formatting only; rerun `bun lint` -> pass. | package/document proof pass | keep | gap scan |
| C23-document-remove-wrapper-delete | 23 | slate-automation | `document.ts` had a one-line `removeAttribute` wrapper with no extra domain meaning. | Removed the wrapper and called `removeAttribute` on Yjs nodes directly in virtual unwrap cleanup; focused move/unwrap/wrap/soak tests -> 41 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/document proof pass | keep | gap scan |
| C24-split-history-guard-candidate | 24 | slate-automation | `isSplitHistory` repeatedly cast the same unknown value while checking split-history metadata. | Rewrote guard to narrow once to `Partial<SplitHistory>`; focused split/merge/soak tests -> 43 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/split-history proof pass | keep | gap scan |
| C25-undo-manager-pop-helper | 25 | slate-automation | Undo manager adapter duplicated pop-and-assert logic for redo-to-undo and undo-to-redo moves. | Added private `popExpectedStackItem`; focused undo-manager/split/soak tests -> 39 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/undo proof pass | keep | gap scan |
| C26-undo-manager-stack-item-guard | 26 | slate-automation | `isStackItem` cast the unknown stack item inline while checking `meta`. | Rewrote guard to narrow object/null first and then check `Partial<YjsUndoManagerStackItem>.meta`; focused undo-manager/split tests -> 17 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass. | package/undo proof pass | keep | gap scan |
| C27-package-config-json-types | 27 | slate-automation | Package config contract used `Record<string, any>` in its JSON reader. | Added typed `PackageJson` and `TsConfigJson` shapes plus generic `readJson`; package-config test -> 3 pass; Yjs src/test debt scan for `any`/TODO/ts-expect-error/etc. -> no matches; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/config proof pass | keep | gap scan |
| C28-react-remote-cursor-range-reader | 28 | slate-automation | React decoration and overlay paths both read remote cursors and filtered out cursors without selections. | Added private `readYjsRemoteCursorRanges`; decoration source and overlay position readers now share cursor/range filtering; React contract -> 5 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass. | package/react proof pass | keep | gap scan |
| C29-react-shallow-equal-key-cache | 29 | slate-automation | React `shallowEqual` cached left object keys but read right object keys inline. | Stored `bKeys` beside `aKeys`; React contract -> 5 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/react proof pass | keep | gap scan |
| C30-controller-commit-skip-guard | 30 | slate-automation | `YjsController.handleCommit` had two adjacent early-return blocks for the same skip-export decision. | Added private `shouldSkipCommit`; focused simple/selection/provider/soak tests -> 63 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/controller proof pass | keep | gap scan |
| C31-structural-soak-peer-ids | 31 | slate-automation | Structural soak duplicated peer id literals and cast them back to `PeerId` in `allPeers`. | Added `peerIds` tuple and derived `PeerId` from it; structural soak -> 22 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; first `bun lint` caught formatting only; rerun `bun lint` -> pass. | package/soak proof pass | keep | gap scan |
| C32-structural-soak-command-cleanup | 32 | slate-automation | Structural soak repeated full-peer reconnect blocks and anonymous set-role commands after helper extraction. | Added `connectAll`, replaced consecutive all-peer reconnects, and reused `setFirstBlockRole` for equivalent inline commands; structural soak -> 22 pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/soak proof pass | keep | gap scan |
| C33-controller-selection-point-helpers | 33 | slate-automation | Controller import/export selection sanitizers duplicated anchor/focus traversal and offset boundary checks. | Added `rangePoints`, `isValidYjsSelectionPoint`, and `isValidImportSelectionPoint`; reused `currentSelection()` in import; focused simple/selection/provider/soak tests -> 63 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; first `bun lint` caught formatting only; rerun `bun lint` -> pass. | package/controller proof pass | keep | gap scan |
| C34-provider-insert-helper | 34 | slate-automation | Provider contract repeated inline editor updates for appending `!` to the first block, with hard-coded `alpha`/`remote` offsets. | Added `insertFirstBlockTextAtEnd`; replaced repeated insert blocks; hard-coded insert scan -> no matches; provider focused tests -> 26 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; first `bun lint` caught import order only; rerun `bun lint` -> pass. | package/provider proof pass | keep | gap scan |
| C35-split-node-remove-aliases | 35 | slate-automation | Split-node contract hid imported helpers behind local aliases, adding jump cost without domain meaning. | Removed `yjsState`/`yjsUpdate`/`paragraphTexts`/`yjsNodeAt`/`syncConnected`/`assertAllTexts` aliases and used imported helper names directly; alias scan for the file -> no matches; split-node focused tests -> 11 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/split proof pass | keep | remove sibling aliases |
| C36-replace-fragment-remove-aliases | 36 | slate-automation | Replace-fragment contract had the same local helper aliases as split-node. | Removed aliases and used imported helper names directly; alias scan for the file -> no matches; replace-fragment focused tests -> 7 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/replace proof pass | keep | remove sibling aliases |
| C37-merge-remove-remove-aliases | 37 | slate-automation | Merge-node and remove-node contracts had the same local helper aliases as split/replace. | Removed aliases and used imported helper names directly in both files; alias scan for both files -> no matches; focused merge/remove tests -> 10 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/merge-remove proof pass | keep | gap scan |
| C38-disconnect-clear-trace-helper-simple | 38 | slate-automation | Simple operation contracts repeated the same two-step Yjs setup: disconnect, then clear trace. | Added `disconnectAndClearYjsTrace` in shared support preserving the two separate updates; replaced four simple-operation setup blocks; local pair scan -> no matches; simple focused tests -> 9 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/simple proof pass | keep | expand helper |
| C39-disconnect-clear-trace-helper-expand | 39 | slate-automation | The same two-step disconnect/clearTrace setup remained across operation contract families. | Replaced exact same-variable adjacent pairs in replace/insert/split/merge/wrap/move/set/delete/lift/remove contracts; exact pair scan for contract specs -> no matches; focused touched tests -> 80 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/operation proof pass | keep | gap scan |
| C39b-root-check-isolation | 39 | slate-automation | Large checkpoint after support/test-wide cleanup should re-run broad sanity. | `bun check` passed repo lint, package/site/root typecheck including `@slate/yjs`, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs failure as C14b. | broad non-Yjs failure isolated | quarantine | continue Yjs packets |
| C40-operations-element-target-helper | 40 | slate-automation | `replace_fragment` and `replace_children` duplicated root-or-node target resolution and XmlElement assertion. | Added private `getYjsElementOperationTarget`; replaced both branches; duplicate target scan -> no matches; focused replace/simple/exhaustiveness tests -> 18 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/operation proof pass | keep | gap scan |
| C41-provider-synced-record-narrowing | 41 | slate-automation | `normalizeYjsProviderSynced` repeated `isRecord(value)` for `state` and `synced` payload shapes. | Narrowed once to `record` and reused it; duplicate record-guard scan -> no matches; provider+React focused tests -> 31 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/provider proof pass | keep | gap scan |
| C42-fake-provider-payload-emitter | 42 | slate-automation | `FakeProvider` repeated listener loops and payload casts in every emit method. | Added `emitProviderPayload` and routed status/sync/synced emitters through it; duplicate loop/cast scan -> no matches; provider/awareness/React focused tests -> 39 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/test-support proof pass | keep | gap scan |
| C43-controller-split-operation-guards | 43 | slate-automation | `createSplitHistory` inlined two heavy operation predicates for text split and element split detection. | Added private `isTextSplitOperation` and `isElementSplitOperation`; focused split/split-merge/undo/soak tests -> 39 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/controller-split proof pass | keep | gap scan |
| C44-controller-external-event-lifecycle | 44 | slate-automation | Constructor and `destroy` mirrored awareness/provider event registration inline. | Added private `bindExternalEvents` and `unbindExternalEvents`; focused provider/awareness/React tests -> 39 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/controller-lifecycle proof pass | keep | gap scan |
| C45-provider-initial-editor-helper | 45 | slate-automation | Provider contract helper variants duplicated `createEditor` plus initial `Editor.replace`. | Added `createInitialEditor` and reused it in provider editor helpers; provider focused tests -> 26 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/provider proof pass | keep | gap scan |
| C46-react-shallow-equal-record-guard | 46 | slate-automation | React `shallowEqual` narrowed objects with inline checks but still cast both values to records. | Added local `isRecord` guard and removed the record casts; cast scan for React file -> no matches; React focused test -> 5 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/react proof pass | keep | gap scan |
| C47-undo-manager-stack-candidate | 47 | slate-automation | Undo manager stack item guard used a `Partial<YjsUndoManagerStackItem>` cast only to read `meta`. | Added explicit `StackItemCandidate` guard and removed the partial cast; focused undo/split tests -> 17 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/undo proof pass | keep | gap scan |
| C48-document-public-attributes-helper | 48 | slate-automation | `document.ts` repeated copy-attributes-then-delete-internal-attributes in text uniformity, Slate read, and clone paths. | Added `getPublicAttributes` and `getPublicYjsAttributes`; old deletion/copy scan -> no matches; focused document/simple/soak tests -> 32 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/document proof pass | keep | gap scan |
| C49-yjs-attribute-setter-adapter | 49 | slate-automation | Raw Yjs `setAttribute` casts were spread across `attributes.ts` and document internals. | Added `setYjsAttribute` as the single cast adapter; routed attribute helpers and document internal flags through it; `as never` scan now only finds that adapter; focused document/move/unwrap/soak tests -> 44 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; first `bun lint` caught formatting only; rerun `bun lint` -> pass. | package/attributes-document proof pass | keep | gap scan |
| C50-document-set-attribute-boundary | 50 | slate-automation | `document.ts` still wrote internal Yjs attributes directly after C49. | Routed Slate type, hidden, virtual-child, placeholder, and node-id writes through `setYjsAttribute`; raw `setAttribute` scan now only finds `attributes.ts`; focused document/move/wrap/unwrap/soak tests -> 42 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/document proof pass | keep | gap scan |
| C51-structural-soak-node-path-cast | 51 | slate-automation | Structural soak `getNodeAtPath` used a final cast to `Descendant` after walking from a synthetic root. | Added an explicit root sentinel and return `null` for the synthetic root; removed the cast; structural soak -> 22 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/soak proof pass | keep | gap scan |
| C52-history-operation-signatures | 52 | slate-automation | History rejection scanned batches while re-stringifying rejected operations for every candidate comparison. | Added `operationSignature` / `operationMatchesSignature`; precomputed rejected operation signatures once per stack cleanup; provider/simple focused tests -> 35 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/history proof pass | keep | gap scan |
| C53-split-history-delta-guard | 53 | slate-automation | Split-history text append and trailing-repair loops repeated the same non-empty string delta guard. | Added `isNonEmptyStringDelta`; old guard scan -> no matches; focused split/split-merge/soak tests -> 37 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/split-history proof pass | keep | gap scan |
| C54-slate-type-setter-adapter | 54 | slate-automation | `setSlateYjsAttribute` still used raw `setAttribute` for Slate type bridging after the setter adapter existed. | Routed the Slate type branch through `setYjsAttribute`; raw `setAttribute` scan now finds only adapter body; focused set/document/simple tests -> 18 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/attributes proof pass | keep | gap scan |
| C55-controller-seed-or-import-helper | 55 | slate-automation | Initial seed and provider-sync reconcile repeated the same empty-root seed vs non-empty import flow. | Added private `seedInitialValueOrImportFromYjs`; `seed` and `reconcileProviderOwnedDocAfterSync` now share it; provider/simple/React focused tests -> 40 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/controller-provider proof pass | keep | gap scan |
| C55b-root-check-isolation | 55 | slate-automation | Large checkpoint after another controller/source batch should re-run broad sanity. | `bun check` passed repo lint, package/site/root typecheck including `@slate/yjs`, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs failure as C14b/C39b. | broad non-Yjs failure isolated | quarantine | continue Yjs packets |
| C56-replacement-text-attributes-type | 56 | slate-automation | `getTextAttributes` in `replacement.ts` cast text attributes because its parameter type omitted arbitrary text marks. | Widened the parameter to `{ text: string } & Record<string, unknown>` and removed the cast; focused set/replace/simple tests -> 24 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/replacement proof pass | keep | gap scan |
| C57-split-history-candidate-guard | 57 | slate-automation | `isSplitHistory` used a `Partial<SplitHistory>` cast to inspect unknown metadata. | Added explicit `SplitHistoryCandidate` guard and removed the partial cast; focused split/split-merge/soak tests -> 37 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; first `bun lint` caught formatting only; rerun `bun lint` -> pass. | package/split-history proof pass | keep | gap scan |
| C58-yjs-text-format-adapter | 58 | slate-automation | Yjs text formatting still had two scattered `Record<string, never>` casts in replacement and split-history paths. | Added `formatYjsTextAttributes` beside the Yjs attribute setter adapter; routed replacement text patching and split-undo cleanup through it; cast/format scan now finds only the adapter body; focused set/replace/split/split-merge/soak tests -> 52 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/attributes proof pass | keep | gap scan |
| C59-document-text-attribute-cast-removal | 59 | slate-automation | `createYjsNode` cast text-node rest attributes even though Slate `Text` already carries a string index signature. | Removed the redundant local `textAttributes` cast and passed destructured attributes directly; local cast scan -> no matches; focused simple/provider/soak tests -> 57 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/document proof pass | keep | gap scan |
| C60-operation-property-attribute-boundary | 60 | slate-automation | Split/set operation property casts were repeated across Yjs operation application and split-history capture. | Added `toYjsAttributeRecord` and routed split text, split element, set node, and controller split-history property conversion through it; old property-cast scan -> no matches; focused set/split/split-merge/simple/soak tests -> 54 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; first `bun lint` caught import ordering only; rerun `bun lint` -> pass. | package/operation-controller proof pass | keep | gap scan |
| C61-document-read-element-cast-removal | 61 | slate-automation | `readSlateNodeFromYjs` cast reconstructed element objects to `Descendant` even though the object already matches Slate `Element`. | Typed reconstructed `children` as `Descendant[]` and returned the element object without the final cast; focused simple/delete/replace/soak tests -> 43 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; first `bun lint` caught formatting only; rerun `bun lint` -> pass. | package/document proof pass | keep | gap scan |
| C62-controller-selection-and-children-types | 62 | slate-automation | Controller cast `selectionBefore` to its own declared type and cast editor children snapshots to `Element[]`. | Removed the redundant `selectionBefore` cast; changed editor child readers to explicit `Element[]` return types instead of tail casts; first typecheck showed `Descendant[]` was too broad for `EditorApi.replace`, so the final version keeps the correct top-level element type; focused provider/simple/split-merge/soak tests -> 61 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; first `bun lint` caught formatting only; rerun `bun lint` -> pass. | package/controller proof pass | keep | gap scan |
| C63-controller-import-selection-root | 63 | slate-automation | Controller cast current editor selection and a synthetic `{ children }` object to Slate node types for import-selection validation. | Returned `state.selection.get()` directly; replaced the synthetic root cast with a valid temporary Slate `Element` root; focused selection/provider/react/soak tests -> 59 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; first `bun lint` caught formatting only; rerun `bun lint` -> pass. | package/controller-selection proof pass | keep | gap scan |
| C64-replace-fragment-fixture-cast-removal | 64 | slate-automation | Replace-fragment multi-leaf fixture cast a valid Slate element to `Descendant`. | Removed the redundant fixture cast; local cast scan -> no matches; replace-fragment focused test -> 7 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/test-fixture proof pass | keep | gap scan |
| C65-structural-soak-peer-map-types | 65 | slate-automation | Structural soak used `Object.fromEntries` and snapshot-child casts for helper return types. | Replaced the peer map cast with an explicit four-peer object and gave `editorValueOf` a `Descendant[]` return type without a tail cast; local cast scan -> no matches for those patterns; structural soak -> 22 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/soak proof pass | keep | gap scan |
| C66-test-node-transform-never-removal | 66 | slate-automation | Set-node and structural soak tests used `as never` around supported node transform props/keys. | Removed all four `as never` casts from `tx.nodes.unset` and `tx.nodes.set` calls; focused set-node/soak tests -> 30 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/test-transform proof pass | keep | gap scan |
| C67-shared-paragraph-attributes | 67 | slate-automation | Set-node carried a local paragraph fixture only because the shared helper did not accept attributes. | Extended shared `paragraph(text, attributes)` and removed the set-node local paragraph helper; focused set/simple/selection/react tests -> 28 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/test-support proof pass | keep | broad checkpoint |
| C67b-root-check-isolation | 67 | slate-automation | Broad checkpoint after type/fixture cleanup should confirm no new repo-wide failure. | `bun check` passed repo lint, package/site/root typecheck including `@slate/yjs`, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs failure as previous broad checkpoints. | broad non-Yjs failure isolated | quarantine | continue Yjs packets |
| C68-controller-complete-split-history-helper | 68 | slate-automation | Controller built the same completed split-history object in both pending and immediate split paths. | Added `completeSplitHistory` with explicit domain name and reused it in both branches; focused split/split-merge/undo/soak tests -> 39 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/controller-split proof pass | keep | gap scan |
| C69-insert-fragment-text-assertion | 69 | slate-automation | Insert-fragment contract used `text!` after destructuring paragraph text. | Replaced the non-null assertion with `assert.equal(typeof text, 'string')` before using the length; non-null scan -> no matches; insert-fragment focused test -> 6 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/test-assertion proof pass | keep | gap scan |
| C70-document-stack-pop-assertions | 70 | slate-automation | Document traversal used `stack.pop()!` in hidden-descendant and node-id lookup loops. | Rewrote both loops as explicit pop loops; non-null assertion scan -> no matches; focused move/wrap/unwrap/soak tests -> 41 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/document proof pass | keep | gap scan |
| C71-shared-yjs-attribute-presence | 71 | slate-automation | Document and operations checked Yjs attribute presence with duplicated `Object.keys(getYjsAttributes()).length` logic. | Added `hasYjsAttributes` to `attributes.ts` and reused it in document/operations; focused simple/delete/move/soak tests -> 43 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; first `bun lint` caught unused import only; rerun `bun lint` -> pass. | package/attributes proof pass | keep | gap scan |
| C72-provider-apply-doc-helper | 72 | slate-automation | Provider contract repeated `Y.applyUpdate(provider.doc, createYjsUpdate(...))` for remote document setup. | Added `applyProviderDoc` and reused it in seed and remote-content setup paths; provider focused test -> 26 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/provider proof pass | keep | gap scan |
| C73-controller-rejected-history-helper | 73 | slate-automation | Controller repeated the paired current-history and post-commit history cleanup calls for rejected Yjs operations. | Added `removeRejectedOperationsFromHistory` and reused it in unsafe-provider and local-fallback rejection paths while preserving the pre-replace cleanup call; focused provider/simple/merge/soak tests -> 63 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/controller-history proof pass | keep | gap scan |
| C74-operations-move-first-child-guard | 74 | slate-automation | Move-node handling used a non-null assertion on the first destination child after checking array length. | Stored the first destination child in a local and guarded it explicitly before `isEmptyYjsText`; focused move/soak tests -> 29 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/operations proof pass | keep | gap scan |
| C75-document-array-access-guards | 75 | slate-automation | Document traversal and insertion helpers used non-null assertions for visible child slot array access. | Replaced child traversal with `entries()` and added explicit slot guards for reverse deletion and insert raw-index lookup; focused move/wrap/unwrap/soak tests -> 41 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/document proof pass | keep | gap scan |
| C76-replacement-child-access-guards | 76 | slate-automation | Replacement-compatible child patching used non-null assertions for old/new child arrays after a compatibility precheck. | Removed both assertions and let existing Slate text/element guards narrow possible `undefined` children; focused replace/set/simple tests -> 24 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/replacement proof pass | keep | gap scan |
| C77-test-peer-array-guards | 77 | slate-automation | Structural soak and unwrap tests used non-null assertions when taking peers from generated arrays. | Replaced indexed assertions with destructuring plus explicit failure messages; narrow non-null assertion scan -> no matches; focused unwrap/soak tests -> 27 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/test-helper proof pass | keep | gap scan |
| C78-test-support-visible-child-reuse | 78 | slate-automation | Candidate: replace test-support raw Yjs child filtering with core `getYjsChildren`. | Rejected after full Yjs tests: wrap/unwrap tests failed because `getYjsNodeAt` intentionally needs raw hidden children while `getYjsChildren` filters hidden nodes; reverted the candidate; reran wrap/unwrap -> 12 pass, full Yjs -> 173 pass, typecheck/build/lint -> pass. | package/regression proof pass | revert | remember raw-vs-visible boundary |
| C79-test-support-raw-child-helper | 79 | slate-automation | After C78, test support still had raw child traversal inline, making the raw-vs-visible boundary easy to miss. | Added local `getRawYjsChildren` in test support and routed `getYjsNodeAt` through it; focused wrap/unwrap/split/replace tests -> 30 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/test-support proof pass | keep | gap scan |
| C80-document-hide-helper-reuse | 80 | slate-automation | Document virtual-move helpers wrote the hidden Yjs attribute directly despite an existing `hideYjsNode` helper. | Routed hidden-node writes through `hideYjsNode` in virtual move, placeholder creation, unwrap cleanup, and hidden-parent removal; focused move/wrap/unwrap/merge/soak tests -> 47 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/document-virtual proof pass | keep | gap scan |
| C80b-root-check-isolation | 80 | slate-automation | Broad checkpoint after document/test-support cleanup should confirm no new repo-wide failure. | `bun check` passed repo lint, package/site/root typecheck including `@slate/yjs`, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs failure as previous broad checkpoints. | broad non-Yjs failure isolated | quarantine | continue Yjs packets |
| C81-document-internal-attribute-list | 81 | slate-automation | Internal Yjs attribute cleanup manually deleted five constants one by one, making future internal attributes easy to miss. | Added `INTERNAL_YJS_ATTRIBUTES` tuple and looped through it in `deleteInternalAttributes`; focused split/move/wrap/soak tests -> 47 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/document-attributes proof pass | keep | gap scan |
| C82-operations-move-source-placeholder-helper | 82 | slate-automation | `move_node` repeated cross-parent source virtual-placeholder cleanup in both virtual-wrapper and placeholder insertion paths. | Added a block-local `removeSourceVirtualPlaceholder` helper and reused it in both cross-parent branches while leaving same-parent cleanup in place; focused move/soak tests -> 29 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/operations-move proof pass | keep | gap scan |
| C83-shared-record-guard | 83 | slate-automation | Provider normalization and React shallow equality duplicated the same unknown-object record guard. | Added internal `core/record.ts` with `isRecord` and reused it in provider and React; focused provider/react tests -> 31 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; first `bun lint` caught import ordering only; rerun `bun lint` -> pass. | package/provider-react proof pass | keep | gap scan |
| C84-record-guard-expand | 84 | slate-automation | Split-history and undo-manager adapters still carried local object/null candidate guards after C83. | Reused shared `isRecord` in `split-history.ts` and `undo-manager-adapter.ts`, removing local candidate types/guards; focused split/split-merge/undo/soak tests -> 39 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/record-boundary proof pass | keep | gap scan |
| C85-replacement-record-guard | 85 | slate-automation | Replacement Slate node guards still hand-rolled object/null checks and local property casts. | Reused shared `isRecord` in `isSlateText` and `isSlateElement`; focused replace/set/simple tests -> 24 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/replacement proof pass | keep | gap scan |
| C86-awareness-record-guard | 86 | slate-automation | Awareness selection guard still hand-rolled the object/null check after shared `isRecord` existed. | Reused shared `isRecord` in `isYjsAwarenessSelection`; focused awareness/selection/react tests -> 19 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; first `bun lint` caught import ordering only; rerun `bun lint` -> pass. | package/awareness proof pass | keep | gap scan |
| C87-provider-test-emitter-cast | 87 | slate-automation | Provider test emitter used an inline function cast with a leading semicolon. | Added `YjsProviderPayloadHandler` and used a named local handler before dispatch; focused provider/awareness/react tests -> 39 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/test-support proof pass | keep | gap scan |
| C88-lift-test-yjs-action-helpers | 88 | slate-automation | Lift-node collaboration tests repeated raw Yjs disconnect/connect/undo/redo calls and sync plumbing across first/only/last/middle child scenarios. | Added a local `TestPeer` type plus `disconnectPeer`, `connectAndSync`, `undoAndSync`, and `redoAndSync`; focused lift-nodes tests -> 19 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/lift-test proof pass | keep | gap scan |
| C89-shared-yjs-action-helpers | 89 | slate-automation | C88's lifecycle helpers were useful but should not remain local to one spec while other specs repeat the same Yjs plumbing. | Promoted disconnect/connect+sync/undo+sync/redo+sync helpers into `test/support/collaboration.ts` and rewired lift-node tests to use them; focused lift/simple/provider tests -> 54 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/test-support proof pass | keep | migrate more specs |
| C90-simple-operations-yjs-action-helpers | 90 | slate-automation | Simple operation collaboration tests repeated raw Yjs lifecycle calls across insert/remove/insert_node/replace_children scenarios. | Added local `TestPeer` alias and rewired disconnect plus connect/undo/redo+sync paths to shared support helpers, preserving the special offline undo as direct `runYjsUpdate`; focused simple/lift tests -> 28 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/simple-ops proof pass | keep | migrate more specs |
| C91-move-node-yjs-action-helpers | 91 | slate-automation | Move-node collaboration tests repeated the same Yjs lifecycle plumbing across same-parent and cross-parent scenarios. | Added local `TestPeer` alias and rewired disconnect plus connect/undo/redo+sync paths to shared support helpers; focused move/lift tests -> 26 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/move proof pass | keep | migrate more specs |
| C92-wrap-unwrap-yjs-action-helpers | 92 | slate-automation | Wrap and unwrap collaboration tests repeated lifecycle plumbing while still needing direct `runYjsUpdate` for trace clearing. | Added local `TestPeer` aliases and rewired disconnect plus connect/undo/redo+sync paths to shared support helpers, preserving clear-trace calls; focused wrap/unwrap tests -> 12 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/wrap-unwrap proof pass | keep | migrate more specs |
| C93-delete-insert-fragment-yjs-action-helpers | 93 | slate-automation | Delete/insert fragment collaboration tests repeated lifecycle plumbing and direct `ReturnType<typeof createPeer>` helper signatures. | Added local `TestPeer` aliases and rewired disconnect plus connect/undo/redo+sync paths to shared support helpers; focused delete/insert fragment tests -> 11 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/fragment proof pass | keep | replace-fragment special case |
| C94-replace-fragment-yjs-action-helpers | 94 | slate-automation | Replace-fragment collaboration tests repeated lifecycle plumbing but also had intentional single-peer undo/redo and trace-clear assertions. | Rewired only disconnect plus connect/undo/redo+sync collaboration paths to shared helpers, preserving direct single-peer history/trace calls; focused replace/delete/insert fragment tests -> 18 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/replace-fragment proof pass | keep | scan remaining lifecycle |
| C95-remove-node-yjs-action-helpers | 95 | slate-automation | Remove-node collaboration tests repeated lifecycle plumbing without any trace/history special cases. | Rewired disconnect plus connect/undo/redo+sync paths to shared support helpers and removed the direct `runYjsUpdate` import; focused remove/delete tests -> 9 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/remove proof pass | keep | merge-node |
| C96-merge-node-yjs-action-helpers | 96 | slate-automation | Merge-node tests repeated lifecycle plumbing while also using direct trace clear and reconcile operations. | Rewired standard disconnect/connect/undo/redo+sync paths to shared helpers and preserved direct `clearTrace`/`reconcile`; focused merge/remove tests -> 10 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/merge proof pass | keep | set-node |
| C97-set-node-yjs-action-helpers | 97 | slate-automation | Set-node tests repeated lifecycle plumbing and direct helper signatures across element attributes and text marks. | Added local `TestPeer` alias and rewired disconnect plus connect/undo/redo+sync paths to shared support helpers; focused set/simple tests -> 17 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/set proof pass | keep | split-node |
| C98-split-node-yjs-action-helpers | 98 | slate-automation | Split-node tests repeated lifecycle plumbing but include deliberate offline undo and single-peer history replay cases. | Rewired disconnect plus connect/undo/redo+sync paths for `a`/`b` peers to shared helpers while preserving unsynced offline undo and single-peer history assertions; focused split/split-merge tests -> 15 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/split proof pass | keep | remaining lifecycle scan |
| C99-selection-awareness-residual-helpers | 99 | slate-automation | Residual cleanup: awareness needed a no-sync connect helper, and selection still repeated `ReturnType<typeof createPeer>` signatures. | Added `connectYjsPeer`, reused it in `connectYjsPeerAndSync`, rewired awareness disconnect/connect calls, and added a local selection `TestPeer`; focused awareness/selection/react tests -> 19 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/selection-awareness proof pass | keep | residual scan |
| C100-unsynced-yjs-history-helpers | 100 | slate-automation | Single-peer undo/redo calls still used raw `runYjsUpdate` while synced undo/redo had shared helpers. | Added `undoYjsPeer` and `redoYjsPeer`, made synced helpers reuse them, updated split/replace/simple/structural-soak callers, and kept direct `runYjsUpdate` only for trace/reconcile/custom update closures; focused split/replace/simple/soak tests -> 49 pass; first `bun lint` caught import ordering only, fixed; final `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass. | package/history-helper proof pass | keep | residual scan |
| C100b-root-check-isolation | 100 | slate-automation | Broad checkpoint after test-support lifecycle helper consolidation should confirm no new repo-wide failure. | `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs failure isolated in prior broad checkpoints. | broad non-Yjs failure isolated | quarantine | continue Yjs packets |
| C101-react-cursor-cast-boundaries | 101 | slate-automation | React cursor hooks duplicated DOM API casts and default cursor data generic casts. | Added `getYjsDOMApi` and `createDefaultCursorData` to centralize those boundary casts; focused react/provider/awareness tests -> 39 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/react proof pass | keep | source cast scan |
| C102-controller-split-operation-types | 102 | slate-automation | `redoSplit` rebuilt split operations with broad `as Operation` casts even though `SplitNodeOperation` already existed. | Replaced both casts with explicit `SplitNodeOperation` objects before replay; focused split/split-merge tests -> 15 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/controller-split proof pass | keep | source cast scan |
| C103-clear-trace-reconcile-helpers | 103 | slate-automation | Tests still used raw `runYjsUpdate` for one-line `clearTrace` and `reconcile` calls after lifecycle helpers existed. | Added `clearYjsTrace` and `reconcileYjsPeer`, updated simple trace/reconcile call sites, and kept raw `runYjsUpdate` only for custom closures; focused split-merge/replace/selection/merge/wrap/unwrap/awareness/soak tests -> 65 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 173 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/test-support proof pass | keep | residual scan |
| C104-package-export-contract | 104 | slate-automation | Package config tests pinned Yjs/provider dependencies but did not guard the public export map. | Added an export-map contract for `.`, `./core`, `./internal`, and `./react` dist type/import/default paths; focused package-config tests -> 4 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/export proof pass | keep | source cleanup |
| C105-remove-text-point-shape | 105 | slate-automation | `resolveYjsTextPoint` returned either a text point, a raw Yjs node, or null, forcing `deleteYjsTextRange` to re-check impossible shapes. | Moved the non-text target error into `resolveYjsTextPoint`, leaving `deleteYjsTextRange` with only text-point/null flow; focused simple/delete/remove/exhaustiveness tests -> 20 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/operations proof pass | keep | source cleanup |
| C106-replace-fragment-target-length | 106 | slate-automation | `replace_fragment` read `getYjsLength(target)` twice around a single delete. | Stored `targetLength` once before deleting existing children; focused replace/exhaustiveness/simple tests -> 18 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/operations proof pass | keep | source cleanup |
| C107-document-yjs-node-type-alias | 107 | slate-automation | `document.ts` repeated raw Yjs element/text union annotations even though the package already exposes `YjsNode`. | Imported `YjsNode`, renamed the local runtime guard to `isYjsContentNode`, and replaced repeated raw union annotations; focused document/move/wrap/unwrap/merge/soak tests -> 48 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/document type cleanup proof pass | keep | source cleanup |
| C108-source-yjs-node-type-alias-expand | 108 | slate-automation | `replacement.ts`, `operations.ts`, and `split-history.ts` still hand-wrote raw Yjs element/text unions after `YjsNode` existed. | Reused `YjsNode` for replacement child arrays, empty-text checks, and split-history recursive text readers; focused replace/set/simple/split/split-merge/merge/soak tests -> 67 pass; raw union source scan now only finds the `YjsNode` definition; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/source type cleanup proof pass | keep | test-support cleanup |
| C109-test-support-yjs-node-type-alias | 109 | slate-automation | Test support kept its own raw Yjs element/text union even after source code standardized on `YjsNode`. | Imported `YjsNode` into `test/support/collaboration.ts` and used it for raw-child guards plus visible/raw node accessors; focused split/replace/wrap/unwrap/move/soak tests -> 59 pass; raw union scan across source core plus support now only finds the `YjsNode` definition; `bun --filter @slate/yjs typecheck` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass; `bun lint` -> pass. | package/test-support type cleanup proof pass | keep | residual scan |
| C110-client-id-array-shorthand | 110 | slate-automation | Yjs collaboration specs used `Array<keyof typeof clientIds>` repeatedly for peer id lists. | Mechanically changed those helper parameters to `(keyof typeof clientIds)[]`; focused affected collaboration specs -> 83 pass; scan shows no remaining `Array<keyof typeof clientIds>`; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/test type cleanup proof pass | keep | peer type cleanup |
| C110b-root-check-isolation | 110 | slate-automation | Broad checkpoint after type cleanup should confirm Yjs did not introduce a repo-wide failure. | `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs failure isolated in prior broad checkpoints. | broad non-Yjs failure isolated | quarantine | continue Yjs packets |
| C111-test-peer-type-alias | 111 | slate-automation | Collaboration specs repeated `ReturnType<typeof createPeer>` even though support already exports the shared `Peer` shape. | Replaced local `TestPeer` aliases with `Peer` imports in affected specs; first mechanical import sort introduced literal parentheses and was fixed before keeping; focused affected specs -> 72 pass; scan shows no remaining `ReturnType<typeof createPeer>`; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass. | package/test type cleanup proof pass | keep | residual scan |
| C112-client-id-type-alias | 112 | slate-automation | Collaboration specs repeated `keyof typeof clientIds` in local peer factories and id-list helpers. | Added local `ClientId` aliases and rewired peer factory/list parameters; first mechanical pass produced `type ClientId = ClientId`, fixed before keeping; focused affected specs -> 83 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/test type cleanup proof pass | keep | residual scan |
| C113-split-repair-type | 113 | slate-automation | `findSplitUndoTextRepairs` hid a domain repair record shape in an inline `Array<{...}>` annotation. | Added internal `SplitUndoTextRepair` and used `SplitUndoTextRepair[]`; focused split/split-merge/merge/soak tests -> 43 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/split-history type cleanup proof pass | keep | residual scan |
| C114-react-cursor-range-type | 114 | slate-automation | React remote-cursor readers returned an anonymous cursor/range object array. | Added internal `YjsRemoteCursorRange` and used it for `readYjsRemoteCursorRanges`; focused react/provider/awareness/selection tests -> 45 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/react type cleanup proof pass | keep | residual scan |
| C115-react-decoration-data-cast | 115 | slate-automation | React cursor contract cast the same decoration slice data twice with optional access. | Added a slice existence assertion and cast the decoration data once before asserting client id and payload; focused React contract -> 5 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/react-test cleanup proof pass | keep | residual scan |
| C116-react-domrect-fixture | 116 | slate-automation | React overlay contract built a DOMRect-shaped object and cast it to `DOMRect`. | Replaced the object cast with real `new DOMRect(...)` fixtures for initial and updated cursor rectangles; focused React contract -> 5 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/react-test cleanup proof pass | keep | residual scan |
| C117-structural-soak-range-cast | 117 | slate-automation | Structural soak asserted selection shape with an inline `{ anchor; focus }` cast. | Imported Slate `Range` and cast the selected value as `Range | null` at the read boundary; focused structural soak -> 22 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/soak-test cleanup proof pass | keep | residual scan |
| C118-split-repair-shared-type | 118 | slate-automation | Controller rebuilt the same split undo repair shape as `split-history.ts` and used `as const` to hold it together. | Exported `SplitUndoTextRepair`, annotated controller `getSplitUndoTextRepair`, and removed the return `as const`; focused split/controller specs -> 52 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/controller-split type cleanup proof pass | keep | residual scan |
| C119-provider-normalizer-unknown | 119 | slate-automation | Provider normalizers used `Payload | unknown`, which collapses to plain `unknown` and falsely suggests a stronger input type. | Changed `normalizeYjsProviderStatus` and `normalizeYjsProviderSynced` parameters to `unknown` and removed unused payload imports; focused provider/react/awareness tests -> 39 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/provider type cleanup proof pass | keep | broad check |
| C120b-root-check-isolation | 120 | slate-automation | Broad checkpoint after provider and test cleanup should confirm no Yjs-induced repo-wide failure. | `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs failure isolated in prior broad checkpoints. | broad non-Yjs failure isolated | quarantine | continue Yjs packets |
| C121-yjs-text-point-type | 121 | slate-automation | `resolveYjsTextPoint` returned an anonymous point object consumed by range deletion. | Added internal `YjsTextPoint` and annotated the resolver return as `YjsTextPoint | null`; focused text/remove/exhaustiveness tests -> 20 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/operations type cleanup proof pass | keep | residual scan |
| C122-visible-child-slot-type | 122 | slate-automation | `document.ts` inferred the virtual-visible child slot shape from anonymous `{ node, rawIndex }` objects. | Added internal `YjsVisibleChildSlot` and annotated `getYjsVisibleChildSlots`; focused document/move/wrap/unwrap/merge/soak tests -> 48 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/document type cleanup proof pass | keep | residual scan |
| C123-yjs-text-delta-part-type | 123 | slate-automation | `getYjsTextContent` inlined the Yjs delta part shape inside a map callback. | Added internal `YjsTextDeltaPart` and used it at the Yjs text-delta boundary; focused document/text/soak tests -> 37 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/document type cleanup proof pass | keep | residual scan |
| C124-split-delta-part-name | 124 | slate-automation | `split-history.ts` named a single text delta part `YjsTextDelta`, while document cleanup uses delta-part terminology. | Renamed the internal type to `YjsTextDeltaPart` and updated the non-empty delta guard; focused split/split-merge/merge/soak tests -> 43 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/split-history naming cleanup proof pass | keep | residual scan |
| C125-test-peer-alias-removal | 125 | slate-automation | C111 left `type TestPeer = Peer` aliases in collaboration specs. | Removed the intermediate aliases and used `Peer` directly in helper parameters; focused affected specs -> 72 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/test type cleanup proof pass | keep | residual scan |
| C126-react-empty-deps | 126 | slate-automation | React cursor hooks allocated fresh empty dependency arrays when callers omit `deps`. | Added shared `EMPTY_DEPS` and reused it for decoration and overlay refresh dependency lists; focused React contract -> 5 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/react cleanup proof pass | keep | residual scan |
| C127-react-domrect-fields | 127 | slate-automation | `rectsEqual` manually compared every DOMRect field inline. | Added a `DOM_RECT_FIELDS` tuple and compared those fields with `every`; focused React contract -> 5 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/react cleanup proof pass | keep | residual scan |
| C128-react-paths-equal-reuse | 128 | slate-automation | React cursor range equality duplicated path comparison logic already owned by core `pathsEqual`. | Reused `pathsEqual` in `pointsEqual`; focused React contract -> 5 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/react cleanup proof pass | keep | residual scan |
| C129-react-tuple-return | 129 | slate-automation | `useYjsRemoteCursorOverlayPositions` returned `as const` despite an explicit readonly tuple return type. | Removed the redundant assertion and let the function return type context type the tuple; focused React contract -> 5 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/react cleanup proof pass | keep | broad check |
| C130b-root-check-isolation | 130 | slate-automation | Broad checkpoint after React hook cleanup should confirm no Yjs-induced repo-wide failure. | `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs failure isolated in prior broad checkpoints. | broad non-Yjs failure isolated | quarantine | continue Yjs packets |
| C131-text-delta-helper | 131 | slate-automation | `document.ts` and `split-history.ts` each owned part of the Yjs text delta boundary. | Added internal `core/text-delta.ts` with shared `YjsTextDeltaPart`, text extraction, and non-empty text guard helpers; rewired document and split-history; focused document/split/text tests -> 58 pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass. | package/text-delta cleanup proof pass | keep | residual scan |
| C132-document-delta-guard-reuse | 132 | slate-automation | `getUniformTextAttributes` still had its own non-empty text delta guard after C131. | Reused `isNonEmptyYjsTextDeltaPart` in document text-attribute normalization; focused document/text/set/soak tests -> 40 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/document cleanup proof pass | keep | residual scan |
| C133-create-yjs-nodes-helper | 133 | slate-automation | Slate child arrays were converted with repeated `children.map(createYjsNode)` across document and operation paths. | Added exported `createYjsNodes` and reused it in document creation, root replacement, and `replace_fragment`; focused document/simple/insert/replace/soak tests -> 45 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/document-operation cleanup proof pass | keep | residual scan |
| C134-replace-children-create-yjs-nodes | 134 | slate-automation | `replace_children` still created each inserted Slate child through the scalar factory even after the batch helper existed. | Routed `replace_children` new-child creation through `createYjsNodes` while preserving per-child `insertYjsChild` virtual-index semantics; focused simple/replace/insert/soak tests -> 44 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/operation cleanup proof pass | keep | residual scan |
| C135-yjs-attribute-interop-types | 135 | slate-automation | `attributes.ts` hid Yjs attribute type mismatch behind anonymous casts and `as never`. | Added local `YjsAttributeReader`, `YjsAttributeWriter`, and `YjsTextFormatter` boundaries; replaced anonymous double-cast and `as never` call sites; focused document/simple/set/split/replace/soak tests -> 58 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/attribute interop proof pass | keep | residual scan |
| C136-yjs-length-reader | 136 | slate-automation | `document.ts` still used an anonymous Yjs length cast at a hot helper boundary. | Added local `YjsLengthReader` and rewrote `getYjsLength` through that named interop boundary; focused document/simple/delete/insert/replace/split/soak tests -> 61 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/document interop proof pass | keep | residual scan |
| C137-undo-manager-adapter-type | 137 | slate-automation | `YjsController` named its undo adapter field through `ReturnType<typeof createYjsUndoManagerAdapter>`, leaking factory mechanics into controller state. | Exported `YjsUndoManagerAdapter` from the adapter module and used it in controller; focused undo/simple/split/split-merge/merge/soak tests -> 54 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/controller type cleanup proof pass | keep | residual scan |
| C138-editor-yjs-accessors | 138 | slate-automation | React runtime and test support each owned local casts for reading the `yjs` editor state/tx extension. | Added internal `core/editor-yjs.ts` with `getEditorYjsState` and `getEditorYjsTx`; rewired React state reads and collaboration test support tx/state helpers; focused react/awareness/provider/simple/soak tests -> 70 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/editor-extension interop proof pass | keep | residual scan |
| C139-awareness-peer-type | 139 | slate-automation | Awareness test helper typed its peer argument with `ReturnType<typeof createAwarePeer>['peer']` despite shared `Peer` support type. | Replaced the helper parameter with `Peer`; focused awareness/react/provider/simple tests -> 48 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/test-support cleanup proof pass | keep | broad checkpoint |
| C140-root-check-isolation | 140 | slate-automation | Broad checkpoint after editor-yjs accessor and test-support cleanup should confirm no Yjs-induced repo-wide failure. | `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs failure isolated in prior broad checkpoints. | broad non-Yjs failure isolated | quarantine | continue Yjs packets |
| C141-react-contract-source-types | 141 | slate-automation | React contract tests inferred decoration source types through hook `ReturnType` blocks and cast default cursor data. | Added explicit `CursorData` and `LabelDecorationData` test types, typed sources as `SlateDecorationSource<...>`, and removed the decoration data cast; focused React contract -> 5 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/react test cleanup proof pass | keep | residual scan |
| C142-delete-fragment-range-type | 142 | slate-automation | Delete-fragment helpers typed selections by reverse-engineering `Editor.getSnapshot()` instead of naming the Slate shape they require. | Replaced both helper parameters with `Range`; focused delete/insert/replace/soak tests -> 40 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/delete-fragment test cleanup proof pass | keep | residual scan |
| C143-test-support-editor-type | 143 | slate-automation | Collaboration test support typed editors as `ReturnType<typeof createEditor>` instead of the Slate editor contract. | Imported `Editor as SlateEditor` type and used it for `Peer.editor` and `TestEditor`; focused simple/provider/react/soak tests -> 62 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/test-support type cleanup proof pass | keep | residual scan |
| C144-remote-cursor-data-reader | 144 | slate-automation | `YjsController.remoteCursor` cast awareness payload data inline to the caller-selected cursor data generic. | Added `readRemoteCursorData` helper to name the awareness payload/generic boundary while preserving existing undefined-only omission semantics; focused awareness/react/provider/soak tests -> 61 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/controller awareness cleanup proof pass | keep | residual scan |
| C145-future-operation-fixture | 145 | slate-automation | Operation exhaustiveness test embedded an unsafe fake future operation cast directly in the assertion setup. | Added `futureSlateOperation` fixture helper and routed the future-operation case through it; focused operation-exhaustiveness/simple tests -> 11 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/operation test cleanup proof pass | keep | residual scan |
| C146-unsupported-operation-type-reader | 146 | slate-automation | `unsupportedYjsOperation` used an inline `{ type?: unknown }` cast while preserving an exhaustiveness-only `never` parameter. | Added `OperationTypeReader` and `getUnsupportedOperationType` to name the runtime defensive read; focused operation-exhaustiveness/simple/soak tests -> 33 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/operation source cleanup proof pass | keep | residual scan |
| C147-provider-sync-event-tuple | 147 | slate-automation | Provider `sync` and `synced` lifecycle events were duplicated in bind/unbind despite sharing the same handler. | Added typed `PROVIDER_SYNC_EVENTS` tuple and used it for provider sync event bind/unbind loops while leaving status binding separate; focused provider/react/simple/soak tests -> 62 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/provider lifecycle cleanup proof pass | keep | residual scan |
| C148-public-yjs-element-attributes | 148 | slate-automation | `readSlateNodeFromYjs` read generic public attributes and then manually deleted the internal Slate type attribute in the element branch. | Added `getPublicYjsElementAttributes` to own element-specific public attribute filtering and moved text attribute read into the text branch; focused document/set/replace/soak tests -> 38 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/document attribute cleanup proof pass | keep | residual scan |
| C149-trailing-split-undo-text-type | 149 | slate-automation | `getTrailingSplitUndoText` built the same `{ length, offset, value }` shape in two return paths without a named type. | Added local `TrailingSplitUndoText` and `createTrailingSplitUndoText`; focused split/split-merge/merge/soak tests -> 43 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/split-history cleanup proof pass | keep | broad checkpoint |
| C150-root-check-isolation | 150 | slate-automation | Broad checkpoint after operation, provider, document, and split-history cleanup should confirm no Yjs-induced repo-wide failure. | `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs failure isolated in prior broad checkpoints. | broad non-Yjs failure isolated | quarantine | continue Yjs packets |
| C151-slate-text-like-type | 151 | slate-automation | `replacement.ts` had an element-like type but repeated the text-like Slate shape inline. | Added `SlateTextLike` and reused it in the text guard and text-attribute extractor; focused simple/set/replace/soak tests -> 46 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/replacement type cleanup proof pass | keep | residual scan |
| C152-provider-payload-handler-boundary | 152 | slate-automation | Fake provider narrowed union event handlers on every emit instead of once at listener registration. | Added `toProviderPayloadHandler`, stored listener sets as `YjsProviderPayloadHandler`, and kept `on/off` API typed as `YjsProviderEventHandler`; focused provider/react/awareness/soak tests -> 61 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/provider test-support cleanup proof pass | keep | residual scan |
| C153-structural-soak-selection-read | 153 | slate-automation | Structural soak cast editor selection reads to `Range | null` even though Slate state already returns that shape. | Removed the selection cast and dead `Range` import; focused structural soak -> 22 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/soak test cleanup proof pass | keep | residual scan |
| C154-relative-range-equality | 154 | slate-automation | Awareness equality compared Yjs relative range anchor/focus directly even though relative range semantics belong to selection helpers. | Added `yjsRelativeRangesEqual` in `selection.ts` and reused it from awareness; focused selection/awareness/react/soak tests -> 41 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/selection-awareness cleanup proof pass | keep | residual scan |
| C155-selection-offset-clamp | 155 | slate-automation | Selection conversion clamped Slate/Yjs text offsets with duplicate `Math.max/Math.min` expressions. | Added `clampTextOffset` and reused it in both Slate->Yjs and Yjs->Slate point conversion; focused selection/awareness/soak tests -> 36 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/selection cleanup proof pass | keep | residual scan |
| C156-empty-history-batch-helper | 156 | slate-automation | Rejected-operation history cleanup inlined the post-splice empty-batch condition in the main scan loop. | Added `isEmptyHistoryBatch` and used it after removing rejected operations; focused provider/simple/split/soak tests -> 68 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/history cleanup proof pass | keep | residual scan |
| C157-history-suffix-start-helper | 157 | slate-automation | History rejected-operation cleanup mixed suffix matching and splice-start calculation inside the stack scan loop. | Added `getHistoryBatchOperationSuffixStart` so the loop asks whether a batch ends with the rejected operations and receives the splice start; focused provider/simple/split/soak tests -> 68 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/history cleanup proof pass | keep | residual scan |
| C158-selection-root-type-constant | 158 | slate-automation | Import selection sanitization embedded the temporary selection-root sentinel type inline. | Added `SELECTION_ROOT_TYPE` and used it when building the temporary Slate root for import selection validation; focused selection/simple/soak tests -> 37 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/controller selection cleanup proof pass | keep | residual scan |
| C159-yjs-child-removal-mode | 159 | slate-automation | `removeYjsChild` returned an inline string union for important visible/hidden removal semantics. | Added exported `YjsChildRemovalMode` and used it as the `removeYjsChild` return type; focused remove/move/lift/simple/soak tests -> 61 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/document operation type cleanup proof pass | keep | residual scan |
| C160-root-check-isolation | 160 | slate-automation | Broad checkpoint after C151-C159 should confirm no Yjs-induced repo-wide failure. | `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs failure isolated in prior broad checkpoints. | broad non-Yjs failure isolated | quarantine | continue Yjs packets |
| C161-unsupported-operation-type-guard | 161 | slate-automation | Unsupported-operation error reporting read `operation.type` through a local cast even though the value is intentionally future/unknown at runtime. | Reused `isRecord` and changed `getUnsupportedOperationType` to accept `unknown`, preserving the `never` exhaustiveness boundary in `unsupportedYjsOperation`; focused operation-exhaustiveness/simple/soak tests -> 33 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/operation source cleanup proof pass | keep | residual scan |
| C162-sorted-awareness-client-ids | 162 | slate-automation | `remoteCursors` embedded awareness-state key extraction and numeric sorting inside cursor collection. | Added `getSortedAwarenessClientIds` and reused it before mapping client ids to remote cursors; focused awareness/react/provider/soak tests -> 61 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/controller awareness cleanup proof pass | keep | residual scan |
| C163-clone-visible-yjs-nodes | 163 | slate-automation | `split_node` owned the "clone visible children and drop unresolved virtual placeholders" loop inline. | Added `cloneVisibleYjsNodes` in `document.ts` and used it for split right-child cloning; focused split/split-merge/merge/move/simple/soak tests -> 59 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/document-operation cleanup proof pass | keep | residual scan |
| C164-undo-manager-stack-reader | 164 | slate-automation | UndoManager adapter cast the whole private Yjs manager shape before asserting the pinned stack contract. | Replaced the whole-manager cast with `isRecord` plus explicit `undoStack`/`redoStack` reads before `assertStack`; first focused run caught a too-clever dynamic stack key, fixed to explicit fields; focused undo/split/simple/soak tests -> 48 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/undo-manager adapter cleanup proof pass | keep | residual scan |
| C165-undo-manager-adapter-explicit-type | 165 | slate-automation | `YjsUndoManagerAdapter` was exported as `ReturnType<typeof createYjsUndoManagerAdapter>`, tying the public internal contract to function inference. | Replaced it with an explicit exported adapter shape and annotated `createYjsUndoManagerAdapter`; focused undo/split/simple/soak tests -> 48 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/undo-manager adapter type cleanup proof pass | keep | residual scan |
| C166-public-yjs-attribute-readers | 166 | slate-automation | `attributes.ts` cast Yjs nodes/text to local reader/formatter interfaces even though the pinned Yjs declarations expose `getAttributes` and `Y.XmlText#format`. | Removed the redundant reader/formatter shim, routed `getYjsAttributes` through direct public methods plus `toYjsAttributeRecord`, and kept the write-side cast where Yjs `XmlElement` defaults still narrow attributes to strings; focused set/replace/split/simple/soak tests -> 57 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/attribute boundary cleanup proof pass | keep | residual scan |
| C167-react-dom-api-guard | 167 | slate-automation | React cursor overlay code cast the whole editor to a DOM resolver just to read optional `api.dom` methods. | Replaced the cast with `isYjsDOMApi`, validating optional `isFocused` and `resolveRangeRect` functions before use; focused react/awareness/provider/soak tests -> 61 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/react DOM boundary cleanup proof pass | keep | residual scan |
| C168-history-state-guard | 168 | slate-automation | History cleanup cast Slate editor state to a local history view before reading optional undo/redo stack accessors. | Added an `isHistoryState` runtime guard with `isRecord` and function checks before reading history; focused simple/split/merge/remove/soak tests -> 56 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/history state boundary cleanup proof pass | keep | residual scan |
| C169-public-yjs-length-reader | 169 | slate-automation | `getYjsLength` cast Yjs nodes to a local `{ length }` reader even though pinned Yjs declarations expose `length` on `XmlText` and `XmlFragment`. | Removed `YjsLengthReader` and read `node.length` directly; focused simple/selection/split/merge/replace/soak tests -> 61 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 174 pass; `bun --filter @slate/yjs build` -> pass. | package/document accessor cleanup proof pass | keep | broad checkpoint |
| C170-root-check-isolation | 170 | slate-automation | Broad checkpoint after public Yjs declaration cleanup should confirm no repo-wide Yjs regression. | `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs failure isolated in prior broad checkpoints. | broad non-Yjs failure isolated | quarantine | continue Yjs packets |
| C171-fallback-element-type | 171 | slate-automation | `createYjsNode` used `'element'` as the fallback Yjs nodeName but wrote `slate:type` from `String(type)`, which becomes `'undefined'` for typeless elements. | Introduced one `elementType` value for both nodeName and `slate:type`; added a document contract for typeless element round-trip; first focused run caught pre-integration Yjs attribute reads, fixed test to assert after insertion; focused document/simple/soak tests -> 33 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 175 pass; `bun --filter @slate/yjs build` -> pass. | package/document fallback oracle proof pass | keep | residual scan |
| C172-split-element-type-attribute-filter | 172 | slate-automation | `createSplitElement` wrote a fallback/string split element type, then replayed the whole properties object and could overwrite `slate:type` with a non-string value. | Removed `type` from the attribute patch before `setSlateYjsAttributes` and added a split contract that preserves the original element type while keeping other attributes; first focused test exposed pre-integration Yjs attribute reads, fixed by integrating original/right elements before assertions; focused split/replace/set/simple/soak tests -> 58 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 176 pass; `bun --filter @slate/yjs build` -> pass. | package/split replacement oracle proof pass | keep | residual scan |
| C173-commit-operation-filter-helpers | 173 | slate-automation | `handleCommit` mixed selection-send detection and Yjs operation filtering into the top-level commit flow. | Added `shouldSendCommitSelection` and `getYjsCommitOperations`, then routed `handleCommit` through those named decisions; focused simple/selection/awareness/provider/soak tests -> 71 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 176 pass; `bun --filter @slate/yjs build` -> pass. | package/controller commit-flow cleanup proof pass | keep | residual scan |
| C174-provider-lifecycle-status-predicate | 174 | slate-automation | Provider lifecycle sync hid the disconnect-protection rule inside `!fallbackConnected && status === 'connected'`. | Added `shouldIgnoreProviderStatusForLifecycleFallback` and routed lifecycle status sync through it; focused provider/react/simple/soak tests -> 62 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 176 pass; `bun --filter @slate/yjs build` -> pass. | package/controller provider lifecycle cleanup proof pass | keep | residual scan |
| C175-record-guard-excludes-arrays | 175 | slate-automation | Shared `isRecord` treated arrays as records, loosening provider payload, React DOM API, operation-error, and shallow-equality guards. | Updated `isRecord` to require a non-array object; focused provider/react/operation/split/replace/soak tests -> 74 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 176 pass; `bun --filter @slate/yjs build` -> pass. | package/shared guard cleanup proof pass | keep | residual scan |
| C176-record-guard-contract | 176 | slate-automation | The tightened `isRecord` behavior needed a direct oracle so arrays do not drift back into record handling. | Added `record-contract.spec.ts` covering plain object, array, and null cases; focused record/provider/react/operation tests -> 34 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 177 pass; `bun --filter @slate/yjs build` -> pass. | package/shared guard oracle proof pass | keep | residual scan |
| C177-remote-cursor-data-record-guard | 177 | slate-automation | Remote cursor data accepted every non-undefined awareness payload, so `null` or arrays could be exposed as `TCursorData extends Record<string, unknown>`. | `readRemoteCursorData` now returns data only when `isRecord(data)` passes; added awareness contract proving null and array cursor data are omitted; focused awareness/react/provider/soak tests -> 62 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 178 pass; `bun --filter @slate/yjs build` -> pass. | package/controller awareness data oracle proof pass | keep | residual scan |
| C178-provider-reader-return-types | 178 | slate-automation | Provider status/synced reader helpers relied on inference for their public internal return shape. | Added explicit `YjsProviderStatus | null` and `boolean | null` return types; focused provider/react/simple/soak tests -> 62 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 178 pass; `bun --filter @slate/yjs build` -> pass. | package/provider type cleanup proof pass | keep | residual scan |
| C179-package-config-json-reader | 179 | slate-automation | Package config tests used a generic JSON reader that implied validation while only casting. | Replaced it with `readJsonRecord`, explicit `readPackageJson`, and `readTsConfigJson`, asserting config files parse to JSON objects before typed use; focused package-config/record tests -> 5 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 178 pass; `bun --filter @slate/yjs build` -> pass. | package/config test boundary cleanup proof pass | keep | broad checkpoint |
| C180-root-check-isolation | 180 | slate-automation | Broad checkpoint after record/cursor/package-config cleanup should confirm no repo-wide Yjs regression. | `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs failure isolated in prior broad checkpoints. | broad non-Yjs failure isolated | quarantine | continue Yjs packets |
| C181-remote-cursor-record-data-name | 181 | slate-automation | The remote cursor data reader now enforces record payloads, but its name still sounded like any data shape was accepted. | Renamed `readRemoteCursorData` to `readRemoteCursorRecordData`; focused awareness/react/provider/soak tests -> 62 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 178 pass; `bun --filter @slate/yjs build` -> pass. | package/controller awareness naming cleanup proof pass | keep | residual scan |
| C182-remote-cursor-range-helper | 182 | slate-automation | React cursor range collection embedded the "cursor must have a selection" projection inside a `flatMap`. | Added `getRemoteCursorRange` and reused it in `readYjsRemoteCursorRanges`; focused react/awareness/provider/soak tests -> 62 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun lint` -> pass; `bun test ./packages/slate-yjs/test` -> 178 pass; `bun --filter @slate/yjs build` -> pass. | package/react cursor cleanup proof pass | keep | residual scan |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Yjs package contracts | `packages/slate-yjs` | `bun test ./packages/slate-yjs/test` | N/A | pass: 173 pass, 0 fail | continue packets |
| React cursor contracts | `packages/slate-yjs/test/react-contract.spec.tsx` | `bun test ./packages/slate-yjs/test/react-contract.spec.tsx` | N/A | pass: 5 pass, 0 fail | keep helper |
| Provider history contracts | `packages/slate-yjs/test/provider-contract.spec.ts` | `bun test ./packages/slate-yjs/test/provider-contract.spec.ts` | N/A | pass: 26 pass, 0 fail | keep helper |
| Shared provider test double | `packages/slate-yjs/test/support/collaboration.ts` | provider + react contract focused tests | N/A | pass: 31 pass, 0 fail across touched focused tests | keep shared fake |
| React hook contracts | `packages/slate-yjs/src/react/index.ts` | `bun test ./packages/slate-yjs/test/react-contract.spec.tsx` | N/A | pass: 5 pass, 0 fail | keep selector helpers |
| Controller revision subscribers | `packages/slate-yjs/src/core/controller.ts` | awareness + provider + react focused contracts | N/A | pass: 39 pass, 0 fail | keep notifier |
| Shared paragraph fixture | `packages/slate-yjs/test/support/collaboration.ts` | focused affected contracts plus full package tests | N/A | pass: 22 soak, 173 full; repeated factory scan clean except support | keep |
| Document node guard | `packages/slate-yjs/src/core/document.ts` | document + operation + soak focused tests | N/A | pass: 39 pass, 0 fail | keep |
| Replacement attribute guard | `packages/slate-yjs/src/core/replacement.ts` | set/replace/simple/soak focused tests | N/A | pass: 46 pass, 0 fail | keep |
| Operation empty text helper | `packages/slate-yjs/src/core/operations.ts` | simple/delete/soak focused tests | N/A | pass: 36 pass, 0 fail | keep |
| Operation trace factories | `packages/slate-yjs/src/core/operations.ts` | simple/merge/move/replace/soak focused tests | N/A | pass: 51 pass, 0 fail | keep |
| Provider shape fixtures | `packages/slate-yjs/test/support/collaboration.ts` | provider + react focused tests | N/A | pass: 31 pass, 0 fail | keep |
| Provider seed helper | `packages/slate-yjs/test/provider-contract.spec.ts` | provider focused test | N/A | pass: 26 pass, 0 fail; mutation scan empty | keep |
| Root broad sanity | repo root | `bun check` | N/A | fail: known non-Yjs Slate React test at `dom-repair-policy-contract.test.ts:698`; Yjs package proofs remain green | isolate, keep looping |
| Support split | `packages/slate-yjs/test/support/provider.ts` | provider/awareness/react/selection focused tests | N/A | pass: 45 pass, 0 fail | keep |
| Selection point conversion | `packages/slate-yjs/src/core/selection.ts` | selection/awareness/react focused tests | N/A | pass: 19 pass, 0 fail | keep |
| Provider payload normalization | `packages/slate-yjs/src/core/provider.ts` | provider + react focused tests | N/A | pass: 31 pass, 0 fail | keep |
| Fake awareness event hooks | `packages/slate-yjs/test/support/provider.ts` | awareness/provider/react focused tests | N/A | pass: 39 pass, 0 fail | keep |
| Awareness relative-range decode | `packages/slate-yjs/src/core/awareness.ts` | awareness/selection/react focused tests | N/A | pass: 19 pass, 0 fail | keep |
| Test support raw Yjs lookup | `packages/slate-yjs/test/support/collaboration.ts` | split/merge/replace/simple focused tests | N/A | pass: 33 pass, 0 fail | keep |
| Fake provider listener routing | `packages/slate-yjs/test/support/provider.ts` | provider + react focused tests | N/A | pass: 31 pass, 0 fail | keep |
| Document empty text predicate | `packages/slate-yjs/src/core/document.ts` | document/operation/soak focused tests | N/A | pass: 48 pass, 0 fail | keep |
| Document virtual unwrap cleanup | `packages/slate-yjs/src/core/document.ts` | move/unwrap/wrap/soak focused tests | N/A | pass: 41 pass, 0 fail | keep |
| Split history metadata guard | `packages/slate-yjs/src/core/split-history.ts` | split/merge/soak focused tests | N/A | pass: 43 pass, 0 fail | keep |
| Undo manager stack movement | `packages/slate-yjs/src/core/undo-manager-adapter.ts` | undo-manager/split/soak focused tests | N/A | pass: 39 pass, 0 fail | keep |
| Undo manager stack item guard | `packages/slate-yjs/src/core/undo-manager-adapter.ts` | undo-manager/split focused tests | N/A | pass: 17 pass, 0 fail | keep |
| Package config JSON typing | `packages/slate-yjs/test/package-config-contract.spec.ts` | package-config focused test plus debt scan | N/A | pass: 3 pass, 0 fail; scan clean | keep |
| React remote cursor range reader | `packages/slate-yjs/src/react/index.ts` | React cursor contract | N/A | pass: 5 pass, 0 fail | keep |
| React shallow equality | `packages/slate-yjs/src/react/index.ts` | React cursor contract | N/A | pass: 5 pass, 0 fail | keep |
| Controller commit skip guard | `packages/slate-yjs/src/core/controller.ts` | simple/selection/provider/soak focused tests | N/A | pass: 63 pass, 0 fail | keep |
| Structural soak peer topology | `packages/slate-yjs/test/structural-soak-contract.spec.ts` | structural soak focused test | N/A | pass: 22 pass, 0 fail | keep |
| Structural soak command helpers | `packages/slate-yjs/test/structural-soak-contract.spec.ts` | structural soak focused test | N/A | pass: 22 pass, 0 fail | keep |
| Controller selection sanitizers | `packages/slate-yjs/src/core/controller.ts` | simple/selection/provider/soak focused tests | N/A | pass: 63 pass, 0 fail | keep |
| Provider insert helper | `packages/slate-yjs/test/provider-contract.spec.ts` | provider focused test | N/A | pass: 26 pass, 0 fail | keep |
| Split-node helper aliases | `packages/slate-yjs/test/split-node-contract.spec.ts` | split-node focused test | N/A | pass: 11 pass, 0 fail | keep |
| Replace-fragment helper aliases | `packages/slate-yjs/test/replace-fragment-contract.spec.ts` | replace-fragment focused test | N/A | pass: 7 pass, 0 fail | keep |
| Merge/remove helper aliases | `packages/slate-yjs/test/merge-node-contract.spec.ts`, `packages/slate-yjs/test/remove-node-contract.spec.ts` | merge/remove focused tests | N/A | pass: 10 pass, 0 fail | keep |
| Disconnect and trace setup helper | `packages/slate-yjs/test/simple-operations-contract.spec.ts`, `packages/slate-yjs/test/support/collaboration.ts` | simple focused test | N/A | pass: 9 pass, 0 fail | keep |
| Disconnect and trace setup expansion | operation contract specs | focused touched operation contracts | N/A | pass: 80 pass, 0 fail | keep |
| Operations element target helper | `packages/slate-yjs/src/core/operations.ts` | replace/simple/exhaustiveness focused tests | N/A | pass: 18 pass, 0 fail | keep |
| Provider synced payload narrowing | `packages/slate-yjs/src/core/provider.ts` | provider + React focused tests | N/A | pass: 31 pass, 0 fail | keep |
| Fake provider payload emitter | `packages/slate-yjs/test/support/provider.ts` | provider/awareness/React focused tests | N/A | pass: 39 pass, 0 fail | keep |
| Controller split operation guards | `packages/slate-yjs/src/core/controller.ts` | split/split-merge/undo/soak focused tests | N/A | pass: 39 pass, 0 fail | keep |
| Controller external event lifecycle | `packages/slate-yjs/src/core/controller.ts` | provider/awareness/React focused tests | N/A | pass: 39 pass, 0 fail | keep |
| Provider initial editor helper | `packages/slate-yjs/test/provider-contract.spec.ts` | provider focused test | N/A | pass: 26 pass, 0 fail | keep |
| React shallow equality guard | `packages/slate-yjs/src/react/index.ts` | React focused test | N/A | pass: 5 pass, 0 fail | keep |
| Undo manager stack candidate guard | `packages/slate-yjs/src/core/undo-manager-adapter.ts` | undo/split focused tests | N/A | pass: 17 pass, 0 fail | keep |
| Document public attributes helper | `packages/slate-yjs/src/core/document.ts` | document/simple/soak focused tests | N/A | pass: 32 pass, 0 fail | keep |
| Yjs attribute setter adapter | `packages/slate-yjs/src/core/attributes.ts`, `packages/slate-yjs/src/core/document.ts` | document/move/unwrap/soak focused tests | N/A | pass: 44 pass, 0 fail | keep |
| Document attribute write boundary | `packages/slate-yjs/src/core/document.ts` | document/move/wrap/unwrap/soak focused tests | N/A | pass: 42 pass, 0 fail | keep |
| Structural soak node path cast | `packages/slate-yjs/test/structural-soak-contract.spec.ts` | structural soak focused test | N/A | pass: 22 pass, 0 fail | keep |
| History operation signatures | `packages/slate-yjs/src/core/history.ts` | provider/simple focused tests | N/A | pass: 35 pass, 0 fail | keep |
| Split-history delta guard | `packages/slate-yjs/src/core/split-history.ts` | split/split-merge/soak focused tests | N/A | pass: 37 pass, 0 fail | keep |
| Slate type setter adapter | `packages/slate-yjs/src/core/attributes.ts` | set/document/simple focused tests | N/A | pass: 18 pass, 0 fail | keep |
| Controller seed/import helper | `packages/slate-yjs/src/core/controller.ts` | provider/simple/React focused tests | N/A | pass: 40 pass, 0 fail | keep |
| Replacement text attributes typing | `packages/slate-yjs/src/core/replacement.ts` | set/replace/simple focused tests | N/A | pass: 24 pass, 0 fail | keep |
| Split-history candidate guard | `packages/slate-yjs/src/core/split-history.ts` | split/split-merge/soak focused tests | N/A | pass: 37 pass, 0 fail | keep |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| pending | pending | pending | pending | pending | pending |

slate-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| pending | pending | pending | pending | pending |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| pending | pending | pending | pending | pending |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| pending | pending | pending | pending | pending |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| pending | pending | pending | pending | pending | pending |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | React hook subscription/read helpers added in `packages/slate-yjs/src/react/index.ts`; controller subscriber notification helper added |
| tests/oracles/browser proof | baseline package tests/typecheck/build/lint pass; React contract DOM API setup helper added; provider history test helpers added; Yjs `any`/TODO/ts-expect-error scan empty; shared provider fake added; shared paragraph fixture seeded |
| benchmarks/metrics/targets | none |
| examples/docs | continuation plan created and strict 8h rule recorded |
| skills/workflow | none |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| pending | pending | pending | pending | pending |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| pending | pending | pending | pending | pending | pending | pending | pending |

Findings:
- React contract tests contained three raw `(peer.editor as any).api` DOM setup blocks; C1 moved them to shared test support.
- Provider contract had the remaining two Yjs `any` casts for history access; C2 moved them to shared test support and left the Yjs package scan clean.
- React and provider contracts duplicated provider test doubles; C3 consolidated status/sync listener semantics in shared test support.
- React hooks repeated the same revision subscription/read pattern; C4 consolidated it without changing public hook names or behavior.
- Awareness and provider revision notification used duplicate loops; C5 shares one notifier while focused subscriber tests stay green.
- Multiple simple contract files duplicated identical `paragraph(text)` fixtures; C6 seeded a shared test-support helper and proved the first replacement batch.
- C7 expanded the shared paragraph fixture through the remaining simple operation contract files; only structural soak still has a local paragraph helper.
- C8 moved structural soak onto the shared paragraph fixture; duplicate paragraph factory scan is clean except for support.
- `document.ts` repeated Yjs node instance checks; C9 now uses one private guard.
- `replacement.ts` repeated forbidden attribute validation across two loops; C10 now shares one assertion helper.
- `operations.ts` had an unused local helper in the same removal path; C11 uses it instead of duplicating text-content logic.
- `operations.ts` repeated trace object assembly across operation branches; C12 centralizes it while keeping trace payload strings unchanged.
- Provider tests simulated missing fields by deleting properties; C13 uses explicit `FakeProvider` shape options instead.
- Provider seed helper still wrote synced state directly; C14 routes through the fake provider event API.
- Root `bun check` still fails in unrelated Slate React DOM repair policy test, not in `@slate/yjs`.
- Support test doubles now live in `test/support/provider.ts`; `collaboration.ts` is back to peer/Yjs helper scope.
- `selection.ts` now clamps against one local Yjs text length read instead of reading length twice.
- `provider.ts` now uses one `isRecord` guard for provider status/synced payload parsing.
- `FakeAwareness` no longer carries unreachable event-name branches in on/off.
- `awareness.ts` now decodes awareness relative ranges through one helper for read and equality paths.
- Test support raw Yjs node lookup now has one local guard instead of an inline filter predicate.
- `FakeProvider` now routes listener add/delete through one `listenersFor` helper.
- `document.ts` now names the empty text/no attributes predicate used during redundant text cleanup.
- `document.ts` no longer has a one-line remove-attribute wrapper; virtual unwrap cleanup calls Yjs directly.
- `split-history.ts` now narrows unknown metadata once before checking split-history fields.
- Undo manager adapter now has one helper for pop-and-assert stack moves.
- Undo manager stack item guard now narrows unknown values before reading `meta`.
- Package config contract no longer uses `any` for JSON reads; Yjs src/test debt scan is clean.
- React cursor decoration and overlay readers now share one remote cursor/range filtering helper.
- React overlay shallow equality now caches both key arrays before comparing.
- `YjsController.handleCommit` now delegates skip-export checks to `shouldSkipCommit`.
- Structural soak derives `PeerId` from one `peerIds` tuple and no longer casts in `allPeers`.
- Structural soak now uses `connectAll` for consecutive full-peer reconnects and reuses `setFirstBlockRole` instead of anonymous duplicate commands.
- `YjsController` now shares anchor/focus traversal and selection point validity checks across Yjs export and Slate import sanitizers.
- Provider contract appends text through one helper instead of repeating editor update blocks with hard-coded offsets.
- Split-node contract now uses imported Yjs helper names directly instead of local aliases.
- Replace-fragment contract now uses imported Yjs helper names directly instead of local aliases.
- Merge-node and remove-node contracts now use imported Yjs helper names directly instead of local aliases.
- Shared support now owns the repeated two-step disconnect/clearTrace setup, preserving update order.
- The disconnect/clearTrace support helper now covers exact repeated setup pairs across operation contract families.
- `operations.ts` now resolves element operation targets through one helper for replace_fragment and replace_children.
- `provider.ts` now narrows synced payload objects once before reading `state`/`synced`.
- `FakeProvider` now emits provider payloads through one helper instead of repeating listener loops and casts.
- `YjsController.createSplitHistory` now delegates split-node classification to named private guards.
- `YjsController` now names external event binding and unbinding instead of mirroring listener calls inline.
- Provider contract now creates seeded Slate editors through one helper.
- React remote cursor shallow equality now uses a real record guard instead of casts.
- Undo manager adapter now reads stack item metadata through an explicit candidate guard instead of a partial cast.
- `document.ts` now strips internal Yjs attributes through one public-attribute helper.
- Raw Yjs attribute value casting is now centralized in `setYjsAttribute`.
- `document.ts` now writes internal Yjs attributes through the centralized setter.
- Structural soak path lookup now uses a root sentinel instead of a terminal cast.
- History cleanup now precomputes rejected operation signatures once per stack scan.
- Split-history delta loops now share one non-empty string delta guard.
- Raw Yjs `setAttribute` calls are now confined to `setYjsAttribute`.
- `YjsController` now shares the seed-or-import path used by initial seed and provider-owned doc sync.
- `replacement.ts` now types text attributes directly instead of casting the rest object.
- `split-history.ts` now narrows unknown split metadata through an explicit candidate guard.

Decisions and tradeoffs:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| C3 first `bun lint` failed on import sorting/format only | 1 | Apply exact Biome formatting/import order fix, then rerun lint | Resolved; rerun `bun lint` passed |
| C6 first `bun lint` failed on import order only | 1 | Apply exact import-order fix, then rerun lint | Resolved; rerun `bun lint` passed |
| C9 first `bun lint` failed on line wrapping only | 1 | Apply exact Biome wrapping, then rerun lint | Resolved; rerun `bun lint` passed |
| C15 first `bun lint` failed on new-file import order only | 1 | Apply exact import order, then rerun lint | Resolved; rerun `bun lint` passed |
| C17 first `bun lint` failed on formatting only | 1 | Apply exact Biome formatting, then rerun lint | Resolved; rerun `bun lint` passed |
| C22 first `bun lint` failed on formatting only | 1 | Apply exact Biome formatting, then rerun lint | Resolved; rerun `bun lint` passed |
| C31 first `bun lint` failed on formatting only | 1 | Apply exact Biome formatting, then rerun lint | Resolved; rerun `bun lint` passed |
| C33 first `bun lint` failed on formatting only | 1 | Apply exact Biome formatting, then rerun lint | Resolved; rerun `bun lint` passed |
| C34 first `bun lint` failed on import order only | 1 | Apply exact import order, then rerun lint | Resolved; rerun `bun lint` passed |
| C49 first `bun lint` failed on formatting only | 1 | Apply exact Biome formatting, then rerun lint | Resolved; rerun `bun lint` passed |
| C57 first `bun lint` failed on formatting only | 1 | Apply exact Biome formatting, then rerun lint | Resolved; rerun `bun lint` passed |

Verification evidence:
- `/Users/felixfeng/Desktop/repos/slate-v2`: continuation baseline `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: continuation baseline `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: continuation baseline `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: continuation baseline `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C1 `bun test ./packages/slate-yjs/test/react-contract.spec.tsx` passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C1 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C1 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C1 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C1 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C2 `bun test ./packages/slate-yjs/test/provider-contract.spec.ts` passed: 26 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C2 Yjs debt scan found no `any`, `TODO`, `FIXME`, `@ts-expect-error`, or `eslint-disable` matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C2 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C2 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C2 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C2 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C3 `bun test ./packages/slate-yjs/test/provider-contract.spec.ts` passed: 26 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C3 `bun test ./packages/slate-yjs/test/react-contract.spec.tsx` passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C3 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C3 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C3 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C3 first `bun lint` failed on formatting/import order only; exact formatting fix applied; rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C4 `bun test ./packages/slate-yjs/test/react-contract.spec.tsx` passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C4 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C4 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C4 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C4 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C5 `bun test ./packages/slate-yjs/test/awareness-contract.spec.ts ./packages/slate-yjs/test/provider-contract.spec.ts ./packages/slate-yjs/test/react-contract.spec.tsx` passed: 39 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C5 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C5 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C5 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C5 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C6 focused affected contracts passed: 28 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C6 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C6 first `bun lint` failed on import order only; exact import order fix applied.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C6 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C6 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C6 rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C7 focused affected contracts passed: 107 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C7 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C7 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C7 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C7 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C8 `bun test ./packages/slate-yjs/test/structural-soak-contract.spec.ts` passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C8 repeated paragraph factory scan found only `test/support/collaboration.ts`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C8 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C8 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C8 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C8 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C9 focused document/operation/soak tests passed: 39 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C9 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C9 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C9 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C9 first `bun lint` failed on wrapping only; exact formatting fix applied; rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C10 focused set/replace/simple/soak tests passed: 46 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C10 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C10 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C10 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C10 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C11 focused simple/delete/soak tests passed: 36 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C11 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C11 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C11 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C11 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C12 focused operation tests passed: 51 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C12 trace-object scan only found `operationTrace` and `traceableFallback` helper definitions.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C12 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C12 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C12 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C12 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C13 provider+React focused tests passed: 31 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C13 provider shape mutation scan removed test-body `delete` usage; only `seedProviderDoc` sets synced as fixture state.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C13 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C13 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C13 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C13 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C14 `bun test ./packages/slate-yjs/test/provider-contract.spec.ts` passed: 26 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C14 provider mutation scan found no test-body delete/status/synced writes.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C14 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C14 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C14 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C14 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C14b `bun check` failed only after broad Slate React Vitest reached `packages/slate-react/test/dom-repair-policy-contract.test.ts:698`; repo lint, typecheck, Bun tests, and slate-layout tests passed before that failure.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C15 focused provider/awareness/react/selection tests passed: 45 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C15 `collaboration.ts` line count dropped from 428 to 239 after moving provider doubles.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C15 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C15 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C15 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C15 first `bun lint` failed on import order only; exact import order fix applied; rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C16 focused selection/awareness/react tests passed: 19 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C16 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C16 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C16 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C16 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C17 provider+React focused tests passed: 31 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C17 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C17 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C17 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C17 first `bun lint` failed on formatting only; exact formatting fix applied; rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C18 focused awareness/provider/react tests passed: 39 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C18 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C18 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C18 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C18 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C19 focused awareness/selection/react tests passed: 19 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C19 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C19 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C19 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C19 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C20 focused split/merge/replace/simple tests passed: 33 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C20 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C20 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C20 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C20 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C21 provider+React focused tests passed: 31 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C21 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C21 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C21 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C21 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C22 focused document/operation/soak tests passed: 48 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C22 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C22 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C22 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C22 first `bun lint` failed on formatting only; exact formatting fix applied; rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C23 focused move/unwrap/wrap/soak tests passed: 41 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C23 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C23 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C23 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C23 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C24 focused split/merge/soak tests passed: 43 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C24 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C24 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C24 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C24 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C25 focused undo-manager/split/soak tests passed: 39 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C25 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C25 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C25 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C25 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C26 focused undo-manager/split tests passed: 17 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C26 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C26 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C26 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C26 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C27 `bun test ./packages/slate-yjs/test/package-config-contract.spec.ts` passed: 3 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C27 Yjs src/test debt scan found no `any`, `TODO`, `FIXME`, `@ts-expect-error`, or `eslint-disable` matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C27 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C27 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C27 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C27 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C28 `bun test ./packages/slate-yjs/test/react-contract.spec.tsx` passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C28 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C28 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C28 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C28 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C29 `bun test ./packages/slate-yjs/test/react-contract.spec.tsx` passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C29 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C29 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C29 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C29 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C30 focused simple/selection/provider/soak tests passed: 63 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C30 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C30 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C30 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C30 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C31 `bun test ./packages/slate-yjs/test/structural-soak-contract.spec.ts` passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C31 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C31 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C31 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C31 first `bun lint` failed on formatting only; exact formatting fix applied; rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C32 `bun test ./packages/slate-yjs/test/structural-soak-contract.spec.ts` passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C32 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C32 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C32 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C32 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C33 focused simple/selection/provider/soak tests passed: 63 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C33 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C33 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C33 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C33 first `bun lint` failed on formatting only; exact formatting fix applied; rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C34 provider hard-coded insert scan found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C34 `bun test ./packages/slate-yjs/test/provider-contract.spec.ts` passed: 26 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C34 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C34 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C34 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C34 first `bun lint` failed on import order only; exact import order fix applied; rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C35 split-node alias scan found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C35 `bun test ./packages/slate-yjs/test/split-node-contract.spec.ts` passed: 11 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C35 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C35 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C35 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C35 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C36 replace-fragment alias scan found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C36 `bun test ./packages/slate-yjs/test/replace-fragment-contract.spec.ts` passed: 7 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C36 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C36 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C36 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C36 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C37 merge/remove alias scan found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C37 focused merge/remove tests passed: 10 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C37 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C37 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C37 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C37 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C38 simple operation disconnect/clearTrace pair scan found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C38 `bun test ./packages/slate-yjs/test/simple-operations-contract.spec.ts` passed: 9 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C38 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C38 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C38 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C38 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C39 exact disconnect/clearTrace pair scan for contract specs found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C39 focused touched operation contracts passed: 80 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C39 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C39 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C39 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C39 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C39b `bun check` passed repo lint, package/site/root typecheck, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C40 duplicate element target scan found no matches in `operations.ts`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C40 focused replace/simple/exhaustiveness tests passed: 18 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C40 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C40 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C40 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C40 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C41 provider synced record-guard scan found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C41 focused provider+React tests passed: 31 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C41 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C41 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C41 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C41 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C42 fake provider emit loop/cast scan found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C42 focused provider/awareness/React tests passed: 39 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C42 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C42 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C42 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C42 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C43 focused split/split-merge/undo/soak tests passed: 39 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C43 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C43 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C43 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C43 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C44 focused provider/awareness/React tests passed: 39 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C44 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C44 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C44 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C44 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C45 `bun test ./packages/slate-yjs/test/provider-contract.spec.ts` passed: 26 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C45 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C45 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C45 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C45 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C46 React record-cast scan found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C46 `bun test ./packages/slate-yjs/test/react-contract.spec.tsx` passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C46 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C46 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C46 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C46 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C47 old undo-manager partial-cast scan found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C47 focused undo/split tests passed: 17 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C47 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C47 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C47 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C47 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C48 old document attribute deletion/copy scan found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C48 focused document/simple/soak tests passed: 32 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C48 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C48 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C48 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C48 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C49 `as never` scan in attributes/document now finds only `setYjsAttribute`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C49 focused document/move/unwrap/soak tests passed: 44 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C49 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C49 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C49 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C49 first `bun lint` failed on formatting only; exact formatting fix applied; rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C50 raw setAttribute scan now finds only `attributes.ts` boundary calls.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C50 focused document/move/wrap/unwrap/soak tests passed: 42 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C50 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C50 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C50 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C50 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C51 structural soak node-path cast scan found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C51 `bun test ./packages/slate-yjs/test/structural-soak-contract.spec.ts` passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C51 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C51 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C51 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C51 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C52 focused provider/simple tests passed: 35 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C52 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C52 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C52 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C52 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C53 old split-history delta guard scan found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C53 focused split/split-merge/soak tests passed: 37 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C53 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C53 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C53 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C53 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C54 raw setAttribute scan found only the adapter body.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C54 focused set/document/simple tests passed: 18 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C54 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C54 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C54 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C54 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C55 focused provider/simple/React tests passed: 40 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C55 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C55 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C55 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C55 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C55b `bun check` passed repo lint, package/site/root typecheck, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C56 replacement text-attribute cast scan found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C56 focused set/replace/simple tests passed: 24 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C56 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C56 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C56 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C56 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C57 split-history Partial cast scan found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C57 focused split/split-merge/soak tests passed: 37 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C57 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C57 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C57 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C57 first `bun lint` failed on formatting only; exact formatting fix applied; rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C58 `Record<string, never>`/`.format(` scan finds only `attributes.ts` adapter body.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C58 focused set/replace/split/split-merge/soak tests passed: 52 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C58 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C58 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C58 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C58 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C59 local `textAttributes` / `attributes as Record<string, unknown>` scan in `document.ts` found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C59 focused simple/provider/soak tests passed: 57 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C59 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C59 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C59 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C59 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C60 old operation/controller property-cast scan found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C60 focused set/split/split-merge/simple/soak tests passed: 54 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C60 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C60 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C60 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C60 first `bun lint` failed on import ordering only; exact import-order fix applied; rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C61 source `document.ts` `} as Descendant` scan found no match after adding explicit `Descendant[]` children.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C61 focused simple/delete/replace/soak tests passed: 43 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C61 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C61 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C61 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C61 first `bun lint` failed on formatting only; exact formatting fix applied; rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C62 first `bun --filter @slate/yjs typecheck` attempt showed `Descendant[]` was too broad for `EditorApi.replace`; revised child readers to `Element[]` return types without tail casts.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C62 scan for `selectionBefore as` and `as Element[]` in `controller.ts` found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C62 focused provider/simple/split-merge/soak tests passed: 61 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C62 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C62 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C62 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C62 first `bun lint` failed on formatting only; exact formatting fix applied; rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C63 scan for `selection.get()` casts, `SlateNodeRoot`, and `{ children } as` found no matches in `controller.ts`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C63 focused selection/provider/react/soak tests passed: 59 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C63 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C63 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C63 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C63 first `bun lint` failed on formatting only; exact formatting fix applied; rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C64 replace-fragment local `as Descendant` scan found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C64 `bun test ./packages/slate-yjs/test/replace-fragment-contract.spec.ts` passed: 7 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C64 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C64 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C64 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C64 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C65 structural-soak scan for `Object.fromEntries`, `as Record<PeerId, Peer>`, and `children as Descendant[]` found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C65 `bun test ./packages/slate-yjs/test/structural-soak-contract.spec.ts` passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C65 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C65 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C65 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C65 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C66 local set-node/soak `as never` scan found no matches after removing four casts.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C66 focused set-node/soak tests passed: 30 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C66 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C66 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C66 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C66 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C67 local set-node paragraph factory scan found no match; shared `paragraph` owns optional attributes.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C67 focused set/simple/selection/react tests passed: 28 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C67 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C67 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C67 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C67 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C67b `bun check` passed repo lint, package/site/root typecheck including `@slate/yjs`, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C68 focused split/split-merge/undo/soak tests passed: 39 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C68 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C68 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C68 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C68 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C69 non-null assertion scan for insert-fragment/Yjs src+tests found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C69 `bun test ./packages/slate-yjs/test/insert-fragment-contract.spec.ts` passed: 6 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C69 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C69 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C69 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C69 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C70 non-null assertion scan for Yjs src+tests found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C70 focused move/wrap/unwrap/soak tests passed: 41 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C70 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C70 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C70 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C70 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C71 focused simple/delete/move/soak tests passed: 43 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C71 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C71 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C71 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C71 first `bun lint` failed on unused import only; exact import cleanup applied; rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C72 `bun test ./packages/slate-yjs/test/provider-contract.spec.ts` passed: 26 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C72 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C72 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C72 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C72 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C73 focused provider/simple/merge/soak tests passed: 63 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C73 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C73 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C73 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C73 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C74 focused move/soak tests passed: 29 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C74 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C74 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C74 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C74 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C75 focused move/wrap/unwrap/soak tests passed: 41 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C75 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C75 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C75 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C75 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C76 focused replace/set/simple tests passed: 24 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C76 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C76 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C76 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C76 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C77 narrow non-null assertion scan for Yjs src+tests found no matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C77 focused unwrap/soak tests passed: 27 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C77 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C77 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C77 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C77 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C78 candidate failed full Yjs with wrap/unwrap hidden-child lookup regressions: 171 pass, 2 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C78 reverted test-support `getYjsChildren` candidate because raw hidden children are required by `getYjsNodeAt`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C78 post-revert wrap/unwrap tests passed: 12 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C78 post-revert `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C78 post-revert `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C78 post-revert `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C78 post-revert `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C79 focused wrap/unwrap/split/replace tests passed: 30 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C79 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C79 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C79 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C79 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C80 focused move/wrap/unwrap/merge/soak tests passed: 47 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C80 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C80 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C80 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C80 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C80b `bun check` passed repo lint, package/site/root typecheck including `@slate/yjs`, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C81 focused split/move/wrap/soak tests passed: 47 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C81 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C81 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C81 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C81 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C82 focused move/soak tests passed: 29 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C82 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C82 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C82 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C82 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C83 focused provider/react tests passed: 31 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C83 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C83 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C83 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C83 first `bun lint` failed on import ordering only; exact import-order fix applied; rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C84 focused split/split-merge/undo/soak tests passed: 39 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C84 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C84 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C84 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C84 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C85 focused replace/set/simple tests passed: 24 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C85 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C85 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C85 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C85 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C86 focused awareness/selection/react tests passed: 19 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C86 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C86 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C86 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C86 first `bun lint` failed on import ordering only; exact import-order fix applied; rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C87 focused provider/awareness/react tests passed: 39 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C87 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C87 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C87 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C87 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C88 focused lift-nodes tests passed: 19 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C88 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C88 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C88 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C88 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C89 focused lift/simple/provider tests passed: 54 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C89 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C89 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C89 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C89 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C90 focused simple/lift tests passed: 28 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C90 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C90 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C90 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C90 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C91 focused move/lift tests passed: 26 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C91 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C91 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C91 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C91 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C92 focused wrap/unwrap tests passed: 12 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C92 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C92 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C92 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C92 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C93 focused delete/insert fragment tests passed: 11 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C93 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C93 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C93 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C93 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C94 focused replace/delete/insert fragment tests passed: 18 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C94 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C94 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C94 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C94 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C95 focused remove/delete tests passed: 9 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C95 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C95 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C95 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C95 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C96 focused merge/remove tests passed: 10 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C96 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C96 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C96 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C96 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C97 focused set/simple tests passed: 17 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C97 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C97 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C97 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C97 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C98 focused split/split-merge tests passed: 15 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C98 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C98 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C98 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C98 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C99 focused awareness/selection/react tests passed: 19 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C99 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C99 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C99 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C99 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C100 focused split/replace/simple/soak tests passed: 49 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C100 first `bun lint` failed on import ordering only; exact import-order fix applied.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C100 rerun `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C100 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C100 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C100 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C100b `bun check` passed lint, package/site/root typecheck including `@slate/yjs`, Bun tests, and slate-layout tests; failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C101 focused react/provider/awareness tests passed: 39 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C101 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C101 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C101 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C101 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C102 focused split/split-merge tests passed: 15 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C102 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C102 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C102 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C102 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C103 focused split-merge/replace/selection/merge/wrap/unwrap/awareness/soak tests passed: 65 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C103 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C103 `bun test ./packages/slate-yjs/test` passed: 173 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C103 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C103 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C104 focused package-config tests passed: 4 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C104 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C104 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C104 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C104 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C105 focused simple/delete/remove/exhaustiveness tests passed: 20 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C105 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C105 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C105 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C105 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C106 focused replace/exhaustiveness/simple tests passed: 18 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C106 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C106 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C106 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C106 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C107 focused document/move/wrap/unwrap/merge/soak tests passed: 48 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C107 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C107 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C107 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C107 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C108 focused replace/set/simple/split/split-merge/merge/soak tests passed: 67 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C108 source raw Yjs union scan now only finds `YjsNode` definition.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C108 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C108 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C108 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C108 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C109 focused split/replace/wrap/unwrap/move/soak tests passed: 59 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C109 raw Yjs union scan across source core plus test support now only finds the `YjsNode` definition.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C109 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C109 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C109 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C109 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C110 focused affected collaboration specs passed: 83 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C110 scan shows no remaining `Array<keyof typeof clientIds>`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C110 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C110 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C110 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C110 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C110b `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C110b `bun check` failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs isolated failure as prior broad checkpoints.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C111 first mechanical import reorder inserted literal parentheses; focused tests/lint caught syntax errors before the packet was kept.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C111 fixed import syntax and focused affected specs passed: 72 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C111 scan shows no remaining `ReturnType<typeof createPeer>`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C111 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C111 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C111 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C111 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C112 first mechanical alias pass produced `type ClientId = ClientId`; scan caught it before the packet was kept.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C112 fixed aliases and focused affected specs passed: 83 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C112 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C112 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C112 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C112 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C113 focused split/split-merge/merge/soak tests passed: 43 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C113 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C113 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C113 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C113 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C114 focused react/provider/awareness/selection tests passed: 45 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C114 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C114 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C114 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C114 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C115 focused React contract passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C115 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C115 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C115 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C115 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C116 focused React contract passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C116 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C116 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C116 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C116 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C117 focused structural soak passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C117 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C117 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C117 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C117 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C118 focused split/controller specs passed: 52 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C118 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C118 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C118 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C118 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C119 focused provider/react/awareness tests passed: 39 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C119 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C119 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C119 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C119 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C120b `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C120b `bun check` failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs isolated failure as prior broad checkpoints.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C121 focused text/remove/exhaustiveness tests passed: 20 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C121 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C121 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C121 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C121 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C122 focused document/move/wrap/unwrap/merge/soak tests passed: 48 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C122 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C122 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C122 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C122 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C123 focused document/text/soak tests passed: 37 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C123 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C123 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C123 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C123 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C124 focused split/split-merge/merge/soak tests passed: 43 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C124 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C124 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C124 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C124 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C125 focused affected specs passed: 72 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C125 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C125 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C125 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C125 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C126 focused React contract passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C126 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C126 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C126 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C126 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C127 focused React contract passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C127 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C127 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C127 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C127 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C128 focused React contract passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C128 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C128 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C128 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C128 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C129 focused React contract passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C129 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C129 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C129 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C129 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C130b `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C130b `bun check` failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs isolated failure as prior broad checkpoints.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C131 focused document/split/text tests passed: 58 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C131 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C131 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C131 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C131 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C132 focused document/text/set/soak tests passed: 40 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C132 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C132 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C132 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C132 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C133 focused document/simple/insert/replace/soak tests passed: 45 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C133 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C133 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C133 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C133 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C134 focused simple/replace/insert/soak tests passed: 44 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C134 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C134 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C134 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C134 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C135 focused document/simple/set/split/replace/soak tests passed: 58 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C135 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C135 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C135 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C135 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C136 focused document/simple/delete/insert/replace/split/soak tests passed: 61 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C136 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C136 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C136 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C136 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C137 focused undo/simple/split/split-merge/merge/soak tests passed: 54 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C137 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C137 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C137 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C137 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C138 focused react/awareness/provider/simple/soak tests passed: 70 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C138 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C138 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C138 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C138 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C139 focused awareness/react/provider/simple tests passed: 48 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C139 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C139 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C139 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C139 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C140 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C140 `bun check` failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs isolated failure as prior broad checkpoints.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C141 focused React contract passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C141 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C141 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C141 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C141 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C142 focused delete/insert/replace/soak tests passed: 40 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C142 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C142 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C142 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C142 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C143 focused simple/provider/react/soak tests passed: 62 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C143 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C143 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C143 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C143 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C144 focused awareness/react/provider/soak tests passed: 61 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C144 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C144 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C144 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C144 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C145 focused operation-exhaustiveness/simple tests passed: 11 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C145 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C145 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C145 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C145 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C146 focused operation-exhaustiveness/simple/soak tests passed: 33 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C146 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C146 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C146 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C146 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C147 focused provider/react/simple/soak tests passed: 62 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C147 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C147 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C147 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C147 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C148 focused document/set/replace/soak tests passed: 38 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C148 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C148 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C148 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C148 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C149 focused split/split-merge/merge/soak tests passed: 43 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C149 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C149 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C149 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C149 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C150 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C150 `bun check` failed only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`, same non-Yjs isolated failure as prior broad checkpoints.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C151 focused simple/set/replace/soak tests passed: 46 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C151 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C151 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C151 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C151 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C152 focused provider/react/awareness/soak tests passed: 61 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C152 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C152 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C152 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C152 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C153 focused structural soak passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C153 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C153 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C153 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C153 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C154 focused selection/awareness/react/soak tests passed: 41 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C154 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C154 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C154 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C154 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C155 focused selection/awareness/soak tests passed: 36 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C155 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C155 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C155 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C155 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C156 focused provider/simple/split/soak tests passed: 68 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C156 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C156 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C156 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C156 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C157 focused provider/simple/split/soak tests passed: 68 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C157 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C157 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C157 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C157 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C158 focused selection/simple/soak tests passed: 37 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C158 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C158 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C158 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C158 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C159 focused remove/move/lift/simple/soak tests passed: 61 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C159 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C159 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C159 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C159 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C160 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C161 focused operation-exhaustiveness/simple/soak tests passed: 33 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C161 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C161 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C161 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C161 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C162 focused awareness/react/provider/soak tests passed: 61 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C162 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C162 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C162 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C162 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C163 focused split/split-merge/merge/move/simple/soak tests passed: 59 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C163 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C163 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C163 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C163 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C164 first focused undo/split/simple/soak test run failed because dynamic stack-key construction hid literal `undoStack`/`redoStack` from the adapter source contract; explicit field reads fixed it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C164 focused undo/split/simple/soak tests passed after repair: 48 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C164 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C164 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C164 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C164 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C165 focused undo/split/simple/soak tests passed: 48 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C165 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C165 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C165 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C165 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C166 focused set/replace/split/simple/soak tests passed: 57 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C166 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C166 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C166 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C166 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C167 focused react/awareness/provider/soak tests passed: 61 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C167 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C167 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C167 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C167 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C168 focused simple/split/merge/remove/soak tests passed: 56 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C168 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C168 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C168 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C168 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C169 focused simple/selection/split/merge/replace/soak tests passed: 61 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C169 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C169 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C169 `bun test ./packages/slate-yjs/test` passed: 174 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C169 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C170 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C171 first focused document/simple/soak run failed because the new test read a Yjs attribute before integrating the node into a document; moved assertion after insertion.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C171 focused document/simple/soak tests passed after repair: 33 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C171 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C171 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C171 `bun test ./packages/slate-yjs/test` passed: 175 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C171 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C172 first focused split/replace/set/simple/soak run failed because the new direct split-element test read Yjs attributes before document integration; final test integrates original/right nodes before assertions and has no warning output.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C172 focused split/replace/set/simple/soak tests passed after repair: 58 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C172 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C172 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C172 `bun test ./packages/slate-yjs/test` passed: 176 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C172 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C173 focused simple/selection/awareness/provider/soak tests passed: 71 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C173 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C173 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C173 `bun test ./packages/slate-yjs/test` passed: 176 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C173 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C174 focused provider/react/simple/soak tests passed: 62 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C174 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C174 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C174 `bun test ./packages/slate-yjs/test` passed: 176 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C174 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C175 focused provider/react/operation/split/replace/soak tests passed: 74 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C175 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C175 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C175 `bun test ./packages/slate-yjs/test` passed: 176 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C175 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C176 focused record/provider/react/operation tests passed: 34 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C176 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C176 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C176 `bun test ./packages/slate-yjs/test` passed: 177 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C176 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C177 focused awareness/react/provider/soak tests passed: 62 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C177 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C177 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C177 `bun test ./packages/slate-yjs/test` passed: 178 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C177 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C178 focused provider/react/simple/soak tests passed: 62 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C178 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C178 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C178 `bun test ./packages/slate-yjs/test` passed: 178 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C178 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C179 focused package-config/record tests passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C179 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C179 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C179 `bun test ./packages/slate-yjs/test` passed: 178 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C179 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C180 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C181 focused awareness/react/provider/soak tests passed: 62 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C181 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C181 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C181 `bun test ./packages/slate-yjs/test` passed: 178 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C181 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C182 focused react/awareness/provider/soak tests passed: 62 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C182 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C182 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C182 `bun test ./packages/slate-yjs/test` passed: 178 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C182 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C183 removed unused private clone wrapper exports from `core/document.ts`; `cloneVisibleYjsNodes` now calls the shared clone root helper directly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C183 focused split/split-merge/merge/move/soak tests passed: 51 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C183 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C183 clone wrapper scan confirmed only `cloneVisibleYjsNodes` remains imported outside `document.ts`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C183 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C183 `bun test ./packages/slate-yjs/test` passed: 178 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C183 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C184 made virtual-placeholder helpers and `YjsChildRemovalMode` private to `core/document.ts`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C184 focused move/wrap/unwrap/lift/remove/soak tests passed: 64 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C184 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C184 helper scan confirmed virtual-placeholder helpers remain file-local only.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C184 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C184 `bun test ./packages/slate-yjs/test` passed: 178 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C184 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C185 made `YjsTextDeltaPart` private to `core/text-delta.ts`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C185 focused split/document/soak tests passed: 40 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C185 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C185 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C185 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C185 `bun test ./packages/slate-yjs/test` passed: 178 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C186 added `createSplitNodeOperation` and routed redo split operation construction through it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C186 focused split/simple/soak/undo tests passed: 49 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C186 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C186 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C186 `bun test ./packages/slate-yjs/test` passed: 178 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C186 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C187 strengthened `isSplitHistory` to validate paths, numeric positions, property records, and optional booleans.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C187 added `split-history-contract.spec.ts` for valid and malformed split-history metadata.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C187 focused split-history/split/simple/soak/undo tests passed: 51 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C187 first `bun --filter @slate/yjs typecheck` caught missing `typeof number` narrowing; fixed before keeping.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C187 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C187 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C187 `bun test ./packages/slate-yjs/test` passed: 180 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C187 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C188 removed redundant empty-path root branches in `core/operations.ts`; `getYjsNode/getYjsNodeIf` already resolve empty path to root.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C188 focused insert/replace/simple/move/soak tests passed: 51 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C188 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C188 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C188 `bun test ./packages/slate-yjs/test` passed: 180 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C188 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C189 removed the same redundant empty-path root branch from `getYjsParent`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C189 focused simple/move/remove/merge/split/soak tests passed: 60 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C189 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C189 empty-path branch scan found no remaining matches in Yjs core.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C189 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C189 `bun test ./packages/slate-yjs/test` passed: 180 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C189 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C190 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C191 narrowed `getYjsTextForInsert` to return only `Y.XmlText | null` instead of leaking non-text nodes to the caller.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C191 focused simple/insert/operation-exhaustiveness/soak tests passed: 39 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C191 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C191 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C191 `bun test ./packages/slate-yjs/test` passed: 180 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C191 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C192 added document path contract coverage for empty-path root resolution and root-parent rejection.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C192 focused document/simple/soak tests passed: 34 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C192 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C192 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C192 `bun test ./packages/slate-yjs/test` passed: 181 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C192 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C193 tightened provider status normalization to accept only `connected`, `connecting`, and `disconnected`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C193 added provider normalize contract coverage for unknown status strings and objects.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C193 focused provider/react/awareness/soak tests passed: 63 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C193 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C193 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C193 `bun test ./packages/slate-yjs/test` passed: 182 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C193 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C194 added selection relative-position coverage for negative and out-of-bounds Slate offsets.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C194 focused selection/awareness/react/soak tests passed: 43 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C194 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C194 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C194 `bun test ./packages/slate-yjs/test` passed: 183 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C194 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C195 guarded remote cursor overlay rectangles with a DOMRect-like structural check.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C195 added React contract coverage for malformed `resolveRangeRect` results.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C195 focused react/provider/awareness/soak tests passed: 64 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C195 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C195 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C195 `bun test ./packages/slate-yjs/test` passed: 184 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C195 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C196 simplified `createSplitElement` type handling by using a single string `elementType`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C196 focused split/set/replace/soak tests passed: 49 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C196 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C196 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C196 `bun test ./packages/slate-yjs/test` passed: 184 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C196 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C197 narrowed `YjsProviderStatus` to the three statuses accepted by runtime normalization.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C197 focused provider/react/awareness/soak tests passed: 64 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C197 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C197 first `bun lint` failed only Biome formatting for the narrowed status union; fixed before keeping.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C197 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C197 `bun test ./packages/slate-yjs/test` passed: 184 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C197 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C198 tied the provider status runtime set to the `YjsProviderStatus` literal union with `satisfies`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C198 focused provider/react/soak tests passed: 55 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C198 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C198 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C198 `bun test ./packages/slate-yjs/test` passed: 184 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C198 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C199 simplified provider connected-state derivation now that `YjsProviderStatus` is closed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C199 focused provider/react/soak tests passed: 55 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C199 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C199 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C199 `bun test ./packages/slate-yjs/test` passed: 184 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C199 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C200 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C201 replaced package-config JSON casts with structured package and tsconfig readers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C201 focused package-config/record tests passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C201 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C201 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C201 `bun test ./packages/slate-yjs/test` passed: 184 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C201 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C202 made test `Peer.editor` use a DOM-API-aware `TestEditor` and removed the `setEditorDomApi` cast.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C202 focused react/provider/selection/soak tests passed: 62 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C202 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C202 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C202 `bun test ./packages/slate-yjs/test` passed: 184 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C202 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C203 changed internal DOM `resolveRangeRect` API typing to return `unknown` and rely on the DOMRect-like guard.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C203 removed the malformed DOMRect test cast.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C203 focused react/provider/selection/soak tests passed: 62 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C203 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C203 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C203 `bun test ./packages/slate-yjs/test` passed: 184 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C203 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C204 added direct provider synced normalization coverage for boolean, `{ state }`, `{ synced }`, and malformed payloads.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C204 focused provider/react/soak tests passed: 56 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C204 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C204 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C204 `bun test ./packages/slate-yjs/test` passed: 185 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C204 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C205 documented the Yjs attribute writer cast as an interop boundary and added attribute round-trip coverage for non-string values.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C205 first focused attributes/set/split/soak test exposed unattached Yjs type reads; fixed the test by inserting the text into a Y.Doc root before asserting.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C205 focused attributes/set/split/soak tests passed: 43 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C205 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C205 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C205 `bun test ./packages/slate-yjs/test` passed: 186 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C205 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C206 removed the dead `unsupported` trace mode and unreachable controller branch; unsupported operations throw in the encoder.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C206 focused operation-exhaustiveness/simple/soak tests passed: 33 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C206 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C206 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C206 unsupported trace scan found no remaining matches.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C206 `bun test ./packages/slate-yjs/test` passed: 186 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C206 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C207 renamed the stale provider status helper to `isStaleConnectedProviderStatus`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C207 focused provider/react/soak tests passed: 56 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C207 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C207 first `bun lint` failed only controller formatting; fixed before keeping.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C207 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C207 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C207 `bun test ./packages/slate-yjs/test` passed: 186 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C208 extracted `isProviderOwnedEmptyDoc` for provider seed/reject/wait decisions.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C208 focused provider/soak tests passed: 50 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C208 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C208 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C208 `bun test ./packages/slate-yjs/test` passed: 186 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C208 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C209 added direct `connectedFromYjsProviderStatus` coverage for known statuses and null fallback.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C209 focused provider/react/soak tests passed: 57 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C209 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C209 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C209 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C209 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C210 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C211 added a closed `YjsTraceFallback` union and typed `YjsTraceEntry.fallback` plus `traceableFallback` through it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C211 focused fallback operation tests passed: 72 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C211 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C211 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C211 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C211 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C212 made the split-history optional boolean validator a real `boolean | undefined` type guard.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C212 focused split-history/split/undo/soak tests passed: 42 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C212 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C212 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C212 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C212 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C213 routed `replace_fragment` broad fallback replacement through existing `replaceYjsChildren` instead of hand-writing delete/insert logic.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C213 focused replace/fragment/soak tests passed: 44 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C213 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C213 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C213 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C213 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C214 removed the unused nullable-root branch from Yjs node cloning and made virtual-placeholder detection a plain boolean predicate.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C214 focused clone/virtual/split/move/soak tests passed: 69 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C214 first `bun --filter @slate/yjs typecheck` failed on the stale virtual-placeholder type predicate; fixed by adding explicit `Y.XmlElement` narrowing.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C214 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C214 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C214 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C214 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C215 named the virtual child raw-index sentinel and replaced naked raw-index comparisons with `hasRawYjsChildSlot`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C215 focused virtual-child/remove/move/soak tests passed: 61 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C215 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C215 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C215 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C215 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C216 extracted provider boolean payload property reading for `state`/`synced` normalization.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C216 focused provider/react/awareness/soak tests passed: 66 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C216 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C216 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C216 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C216 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C217 added explicit return types to exported selection relative-position helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C217 focused selection/awareness/react/soak tests passed: 44 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C217 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C217 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C217 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C217 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C218 removed obsolete `assertNoRootSnapshot` calls and helper after `root-snapshot` had already left the trace type.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C218 residual scan found no `assertNoRootSnapshot` or `root-snapshot` matches under `packages/slate-yjs/src` or `packages/slate-yjs/test`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C218 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C218 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C218 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C218 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C219 removed the unused `text` field from internal `YjsTextPoint`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C219 focused text-delete/remove/soak tests passed: 40 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C219 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C219 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C219 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C219 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C220 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C221 made Yjs test peer-list helper parameters readonly where helpers do not mutate arrays.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C221 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C221 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C221 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C221 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C222 made `YjsTraceEntry` fields readonly to match the readonly trace surface.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C222 focused trace-heavy tests passed: 50 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C222 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C222 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C222 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C222 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C223 made `YjsRemoteCursor` fields readonly and changed internal cursor construction to avoid post-create mutation.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C223 focused awareness/react/provider/selection/soak tests passed: 73 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C223 first `bun --filter @slate/yjs typecheck` failed on internal `cursor.data` mutation; fixed by constructing cursor values in one expression.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C223 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C223 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C223 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C223 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C224 made `YjsAwarenessSelection` fields readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C224 focused awareness/selection/react/soak tests passed: 44 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C224 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C224 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C224 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C224 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C225 made provider status/synced payload object fields readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C225 focused provider/react/awareness/soak tests passed: 66 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C225 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C225 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C225 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C225 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C226 made awareness change event arrays readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C226 focused awareness/provider/react/soak tests passed: 66 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C226 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C226 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C226 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C226 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C227 changed `YjsAwarenessLike.getStates()` to return a `ReadonlyMap`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C227 focused awareness/provider/react/soak tests passed: 66 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C227 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C227 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C227 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C227 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C228 made awareness local/remote state records readonly and updated cursor-data reading to accept readonly records.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C228 focused awareness/provider/react/soak tests passed: 66 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C228 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C228 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C228 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C228 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C229 changed remote cursor data generics to accept readonly records across core and React helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C229 focused react/awareness/provider/soak tests passed: 66 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C229 first `bun lint` failed only Biome formatting for longer readonly generic constraints; `bunx biome check --write` fixed the touched files.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C229 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C229 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C229 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C229 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C230 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C231 made React remote-cursor decoration/range/overlay value fields readonly and removed post-create decoration data mutation.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C231 focused react/awareness/provider/soak tests passed: 66 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C231 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C231 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C231 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C231 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C232 made React remote-cursor hook option fields readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C232 focused react/provider/awareness/soak tests passed: 66 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C232 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C232 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C232 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C232 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C233 made `remoteCursors()` and `useYjsRemoteCursors()` return readonly cursor arrays.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C233 focused awareness/react/provider/soak tests passed: 66 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C233 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C233 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C233 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C233 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C234 introduced `YjsRemoteCursorData` and replaced repeated readonly cursor-data generic constraints across core and React helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C234 focused react/awareness/provider/soak tests passed: 66 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C234 first `bun lint` failed only Biome formatting after the mechanical type alias replacement; `bunx biome check --write` fixed the touched files.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C234 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C234 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C234 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C234 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C235 split provider event handler union into named status and synced handler aliases.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C235 focused provider/react/awareness/soak tests passed: 66 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C235 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C235 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C235 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C235 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C236 made undo-manager adapter method fields and stack item meta reference readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C236 focused undo/split/provider/soak tests passed: 69 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C236 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C236 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C236 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C236 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C237 made private operations/document/split-history intermediate value objects readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C237 focused operations/document/split-history/soak tests passed: 49 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C237 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C237 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C237 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C237 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C238 made test `Peer` object fields readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C238 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C238 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C238 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C238 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C239 made test peer numeric-client-id maps readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C239 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C239 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C239 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C239 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C240 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C241 made package-config contract parsed config types readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C241 focused package-config/undo-manager/record tests passed: 7 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C241 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C241 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C241 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C241 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C242 made the provider-status runtime set a `ReadonlySet`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C242 focused provider/react/soak tests passed: 57 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C242 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C242 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C242 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C242 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C243 made test Yjs-node path helper parameters readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C243 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C243 first `bun lint` failed only Biome formatting in `test/support/collaboration.ts`; `bunx biome check --write` fixed it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C243 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C243 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C243 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C244 tied package-config Yjs dependency assertions to `SUPPORTED_YJS_UNDO_MANAGER_VERSION`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C244 focused package-config/undo-manager/record tests passed: 7 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C244 first `bun lint` failed only import ordering; `bunx biome check --write` fixed it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C244 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C244 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C244 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C244 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C245 introduced `YjsAwarenessState` and used it across awareness state reads and test provider support.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C245 focused awareness/provider/react/soak tests passed: 66 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C245 first `bun lint` failed only import ordering in `test/support/provider.ts`; `bunx biome check --write` fixed it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C245 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C245 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C245 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C245 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C246 changed `YjsTx.sendCursorData` and `sendSelection` cursor data parameters to `YjsRemoteCursorData`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C246 focused awareness/react/provider/soak tests passed: 66 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C246 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C246 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C246 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C246 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C247 introduced a package-config test `JsonRecord` alias for parsed JSON object reads.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C247 focused package-config/record tests passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C247 first `bun lint` failed only Biome formatting; `bunx biome check --write` fixed it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C247 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C247 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C247 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C247 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C248 replaced the remaining raw virtual-child sentinel comparison in `removeYjsChild` with `hasRawYjsChildSlot`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C248 focused remove/virtual/move/soak tests passed: 57 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C248 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C248 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C248 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C248 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C249 added an explanatory comment for the intentional future-operation cast in the exhaustiveness contract.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C249 focused operation-exhaustiveness/simple/soak tests passed: 33 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C249 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C249 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C249 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C249 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C250 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C251 tightened `seedValue` to accept readonly Slate children, matching the Yjs replacement boundary without changing Slate editor mutation calls.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C251 focused seed/provider/sync/commit tests passed: 49 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C251 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C251 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C251 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C251 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C252 tightened compatible replacement child-array parameters to readonly Yjs node lists.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C252 focused replace/set_node/split/merge/format tests passed: 49 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C252 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C252 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C252 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C252 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C253 exported the named `YjsAttributeRecord` alias from the attribute boundary.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C253 focused attribute/set_node/format/replace/split tests passed: 42 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C253 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C253 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C253 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C253 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C254 used `YjsAttributeRecord` for replacement patches, split-history meta, and split text append attributes.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C254 focused replace/split/merge/undo/redo/set_node/format tests passed: 63 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C254 first `bun lint` failed only Biome formatting in `core/replacement.ts`; `bunx biome check --write` fixed it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C254 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C254 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C254 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C254 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C255 used `YjsAttributeRecord` at the attribute/document conversion boundary.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C255 focused attribute/set_node/insert/remove/replace/split/merge/virtual tests passed: 75 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C255 first `bun lint` failed only Biome formatting in `core/document.ts`; `bunx biome check --write` fixed it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C255 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C255 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C255 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C255 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C256 made test `createYjsPeer` and `createSeededYjsPeers` accept readonly fixture children, copying once at the Slate replace boundary.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C256 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C256 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C256 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C256 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C257 tightened Yjs contract-test peer helper inputs and peer id lists to readonly arrays across provider/set-node/merge/lift/move/split/replace tests.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C257 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C257 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C257 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C257 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C258 tightened the remaining Yjs contract-test peer id-list helpers to readonly arrays and made split-node fixture children readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C258 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C258 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C258 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C258 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C259 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C260 tightened the remaining simple-operations peer id-list helper to readonly input.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C260 focused simple/insert_text/remove_text/replace_children/insert_node/remove_node tests passed: 19 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C260 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C260 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C260 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C260 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C261 made the generic `isRecord` guard narrow to readonly records and updated provider boolean-property reads accordingly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C261 focused provider/record/replace/set_node/cursor/awareness tests passed: 65 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C261 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C261 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C261 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C261 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C262 made replacement Slate-like node guards readonly and returned named Yjs attribute records from attribute extraction helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C262 focused replace/set_node/insert_fragment/replace_fragment/format tests passed: 24 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C262 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C262 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C262 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C262 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C263 tightened merge/move/lift test rest-children helpers to readonly rest arrays.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C263 focused merge/move/lift tests passed: 57 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C263 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C263 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C263 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C263 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C264 tightened the test `paragraph` helper attribute input to readonly records.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C264 focused set_node/merge/move/lift/replace/simple tests passed: 79 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C264 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C264 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C264 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C264 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C265 marked React remote-cursor range and overlay snapshot reader return arrays as readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C265 focused react/cursor/awareness/overlay/provider tests passed: 45 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C265 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C265 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C265 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C265 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C266 marked React/test DOM API capability shapes as readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C266 focused react/overlay/cursor/provider/selection tests passed: 59 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C266 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C266 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C266 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C266 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C267 changed core operation path helper parameters from raw `number[]` to Slate `Path`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C267 focused insert_text/remove_text/insert_node/remove_node/replace_children/replace_fragment/move_node/split_node/merge_node/simple tests passed: 55 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C267 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C267 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C267 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C267 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C268 made `YjsRelativeRange` a readonly value object.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C268 focused selection/awareness/cursor/provider tests passed: 61 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C268 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C268 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C268 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C268 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C269 made history batch `statePatches` readonly while preserving mutable operation stacks for rejected-operation removal.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C269 focused history/undo/redo/provider/rejected/fallback tests passed: 73 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C269 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C269 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C269 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C269 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C270 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C271 made `YjsState` and `YjsTx` method tables readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C271 focused provider/awareness/react/cursor/undo/redo/selection/trace tests passed: 93 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C271 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C271 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C271 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C271 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C272 marked stable split-history identity fields readonly while leaving mutable replay state fields writable.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C272 focused split/merge/undo/redo/offline/history tests passed: 86 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C272 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C272 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C272 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C272 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C273 made split-undo repair result objects readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C273 focused split/undo/redo/remote/offline/merge tests passed: 100 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C273 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C273 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C273 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C273 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C274 made `getYjsParent` return a readonly parent/index locator object.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C274 focused insert_node/remove_node/move_node/split_node/merge_node/replace/virtual/simple tests passed: 61 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C274 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C274 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C274 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C274 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C275 made text-delta attributes and attribute-record conversion inputs readonly while preserving mutable internal copies.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C275 focused set_node/format/replace/split/merge/text/attribute tests passed: 79 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C275 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C275 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C275 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C275 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C276 made text-delta `insert` readonly and preserved that narrowing in the non-empty text guard.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C276 focused text/split/merge/replace/format/set_node tests passed: 78 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C276 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C276 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C276 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C276 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C277 separated mutable package-config contract builder maps from readonly returned map shapes.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C277 focused package-config tests passed: 4 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C277 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C277 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C277 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C277 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C278 made structural-soak text-entry snapshots readonly and typed their paths as Slate `Path`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C278 focused structural-soak tests passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C278 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C278 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C278 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C278 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C279 made structural-soak fixture lookup tables readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C279 focused structural-soak tests passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C279 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C279 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C279 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C279 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C280 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C281 made the replace-fragment numeric client-id fixture map readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C281 focused replace-fragment tests passed: 7 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C281 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C281 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C281 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C281 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C282 typed the awareness-test selection helper path as Slate `Range['anchor']['path']`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C282 focused awareness and selection tests passed: 16 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C282 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C282 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C282 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C282 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C283 made the internal Yjs attribute writer capability method readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C283 focused attribute/set_node/format/replace/split tests passed: 42 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C283 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C283 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C283 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C283 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C284 marked provider and awareness capability method/reference fields readonly while leaving live status flags writable.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C284 focused provider/awareness/cursor/react/sync/connect/disconnect tests passed: 96 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C284 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C284 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C284 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C284 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C285 marked `YjsExtensionOptions` fields readonly to match configuration-as-input semantics.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C285 focused provider/seed/sync/awareness/react/package tests passed: 65 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C285 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C285 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C285 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C285 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C286 made `notifySubscribers` accept a readonly subscriber set.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C286 focused subscriber/awareness/provider/revision/connect/disconnect tests passed: 91 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C286 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C286 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C286 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C286 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C287 made sorted awareness client-id snapshots readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C287 focused awareness/cursor/remote/provider/react tests passed: 71 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C287 first `bun lint` failed only Biome formatting in `core/controller.ts`; `bunx biome check --write` fixed it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C287 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C287 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C287 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C287 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C288 removed the redundant `insertionIndex` alias from the `move_node` operation encoder branch.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C288 focused move and structural-soak tests passed: 29 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C288 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C288 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C288 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C288 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C289 renamed the merge encoder's previous-child guard to `previousHasVisibleChildren`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C289 focused merge/split/structural-soak tests passed: 32 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C289 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C289 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C289 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C289 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C290 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C291 tightened the split-merge text fixture rest parameter to readonly strings.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C291 focused split-merge tests passed: 4 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C291 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C291 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C291 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C291 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C292 made `sanitizeImportSelection` accept readonly children and copy only at the temporary Slate root boundary.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C292 focused selection/provider/import/sync/remote/cursor/fallback tests passed: 98 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C292 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C292 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C292 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C292 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C293 made `readEditorChildren` return a readonly editor snapshot and copied only at the Slate baseline-editor replace boundary.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C293 focused seed/provider/commit/sync/import/fallback tests passed: 61 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C293 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C293 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C293 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C293 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C294 typed the React contract selection helper path as Slate `Range['anchor']['path']` and made cursor test data value objects readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C294 focused react contract tests passed: 6 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C294 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C294 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C294 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C294 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C295 made the fake provider payload emitter accept readonly listener sets.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C295 focused provider/awareness/react tests passed: 44 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C295 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C295 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C295 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C295 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C296 made fake provider constructor option fields readonly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C296 focused provider/react tests passed: 35 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C296 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C296 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C296 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C296 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C297 added explicit return types to package-config JSON reader helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C297 focused package-config tests passed: 4 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C297 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C297 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C297 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C297 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C298 made structural-soak peer-map helper parameters readonly records.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C298 focused structural-soak tests passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C298 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C298 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C298 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C298 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C299 made structural-soak editor snapshot reads return readonly Slate children.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C299 focused structural-soak tests passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C299 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C299 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C299 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C299 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C300 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C301 added an explicit boolean return type to `connectedFromYjsProviderStatus`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C301 focused provider tests passed: 29 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C301 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C301 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C301 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C301 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C302 added explicit return types to the exported Yjs length/text-content helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C302 focused text/split/merge/replace/simple/structural tests passed: 88 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C302 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C302 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C302 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C302 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C303 added explicit return types to exported Yjs children/visible-children helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C303 focused insert/remove/move/split/merge/replace/virtual/structural tests passed: 93 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C303 first `bun lint` failed only Biome formatting in `core/document.ts`; `bunx biome check --write` fixed it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C303 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C303 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C303 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C303 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C304 added an explicit nullable Yjs node return type to `getYjsNodeIf`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C304 focused move/selection/insert/remove/split/merge/replace/virtual tests passed: 93 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C304 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C304 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C304 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C304 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C305 added explicit return types to `createYjsNodes` and `replaceYjsChildren`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C305 focused replace/insert/split/merge/provider/seed/simple tests passed: 101 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C305 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C305 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C305 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C305 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C306 added explicit return types to document constructors, virtual-node mutators, and virtual-node predicates.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C306 focused move/wrap/unwrap/insert/remove/split/merge/replace/virtual/structural tests passed: 102 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C306 first `bun lint` failed only Biome formatting in `core/document.ts`; `bunx biome check --write` fixed it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C306 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C306 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C306 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C306 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C307 added explicit return types to the replacement noop predicate, Yjs attribute mutator, and split-element constructor.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C307 focused replacement tests passed: 49 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C307 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C307 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C307 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C307 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C308 added explicit return types to React Yjs state readers, revision hooks, DOM/cursor comparison helpers, and revision getters.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C308 focused react/awareness/provider/cursor/selection tests passed: 61 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C308 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C308 first `bun lint` failed only Biome formatting in `src/react/index.ts`; `bunx biome check --write` fixed it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C308 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C308 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C308 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C309 added explicit return types to core path and Yjs attribute helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C309 focused attribute/format/set_node/path-operation tests passed: 72 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C309 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C309 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C309 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C309 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C310 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C311 added explicit return types to controller subscriber, range-point, commit-operation, and provider-status helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C311 focused provider/awareness/selection/sync/commit/cursor/fallback/history tests passed: 100 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C311 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C311 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C311 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C311 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C312 added explicit return types to rejected-history signature, suffix matching, stack mutation, and post-commit cleanup helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C312 focused undo/redo/history/rejected/fallback/provider/split/merge/remote tests passed: 113 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C312 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C312 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C312 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C312 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C313 added explicit return types to operation text deletion, empty-text pruning, merge compatibility, unsupported-type, element-target, and move cleanup helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C313 focused text/merge/move/replace/fallback/simple/structural tests passed: 77 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C313 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C313 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C313 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C313 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C314 added explicit return types to document raw-child, hidden-node, empty-text, virtual-placeholder, and raw-slot predicates.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C314 focused virtual/move/merge/unwrap/wrap/insert/remove/replace/structural/provider/seed tests passed: 122 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C314 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C314 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C314 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C314 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C315 added explicit return types to public Yjs attribute and uniform-text attribute conversion helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C315 focused attribute/format/set_node/provider/seed/sync/replace/split/merge/simple tests passed: 103 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C315 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C315 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C315 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C315 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C316 added explicit return types to document internal-attribute deletion, node-id, Slate-node match, and hidden-descendant helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C316 focused virtual/move/remove/replace/merge/split/structural/unwrap/wrap/provider/seed tests passed: 124 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C316 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C316 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C316 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C316 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C317 added explicit return types to replacement equality, text-format patch, attribute guard, shared-prefix/suffix, and text replacement helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C317 focused replace/set_node/split/merge/format/fragment tests passed: 54 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C317 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C317 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C317 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C317 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C318 added explicit return types to split-history text append, trailing marker, marker clearing, and repair collection helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C318 focused split/undo/redo/remote/offline/merge/fallback/history tests passed: 104 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C318 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C318 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C318 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C318 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C319 added explicit return types to selection offset clamping, Yjs text-delta text extraction, and undo-manager private stack adapter helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C319 focused selection/cursor/awareness/undo/redo/split/merge/text/package/provider tests passed: 137 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C319 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C319 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C319 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C319 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C320 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C321 added explicit return types to Yjs collaboration test-support helpers and state/update utilities.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C321 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C321 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C321 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C321 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C322 added explicit return types to fake provider and fake awareness test doubles.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C322 focused provider/awareness/react/cursor/sync/connect/disconnect tests passed: 96 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C322 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C322 first `bun lint` failed only Biome formatting in `test/support/provider.ts`; `bunx biome check --write` fixed it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C322 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C322 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C322 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C323 added explicit return types to simple-operation contract fixtures, peer factories, and action helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C323 focused simple-operation tests passed: 9 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C323 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C323 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C323 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C323 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C324 added explicit return types to selection contract fixtures, root reader, peer factories, and action helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C324 focused selection contract tests passed: 7 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C324 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C324 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C324 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C324 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C325 added explicit return types to insert-fragment contract fixtures, peer factories, action helpers, and operation-type collector.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C325 focused insert-fragment tests passed: 6 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C325 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C325 first `bun lint` failed only Biome import ordering in `test/insert-fragment-contract.spec.ts`; `bunx biome check --write` fixed it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C325 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C325 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C325 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C326 added explicit return types to delete-fragment contract fixtures, peer factories, action helpers, and operation-type collector.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C326 focused delete-fragment tests passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C326 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C326 first `bun lint` failed only Biome formatting in `test/delete-fragment-contract.spec.ts`; `bunx biome check --write` fixed it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C326 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C326 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C326 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C327 added explicit return types to replace-fragment contract fixtures, peer factory, and action helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C327 focused replace-fragment tests passed: 7 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C327 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C327 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C327 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C327 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C328 added explicit return types to set-node contract fixtures, peer factories, action helpers, and operation recorder.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C328 focused set-node tests passed: 8 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C328 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C328 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C328 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C328 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C329 added explicit return types to merge-node contract fixtures, peer factories, and action helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C329 focused merge-node tests passed: 6 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C329 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C329 first `bun lint` failed only Biome formatting in `test/merge-node-contract.spec.ts`; `bunx biome check --write` fixed it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C329 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C329 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C329 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C330 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C331 added explicit return types to move-node contract fixtures, peer factories, text readers, action helpers, and operation collector.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C331 focused move-node tests passed: 7 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C331 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C331 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C331 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C331 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C332 added explicit return types to lift-nodes contract fixtures, peer factories, text reader, action helpers, and operation collector.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C332 focused lift-nodes tests passed: 19 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C332 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C332 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C332 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C332 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C333 added explicit return types to wrap-nodes contract fixtures, peer factories, top-level type reader, action helpers, and operation collector.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C333 focused wrap-nodes tests passed: 7 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C333 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C333 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C333 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C333 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C334 added explicit return types to unwrap-nodes contract fixtures, wrapped peer factories, type reader, action helpers, and operation collector.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C334 focused unwrap-nodes tests passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C334 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C334 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C334 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C334 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C335 added explicit return types to split-node contract fixtures, peer factory, and action helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C335 focused split-node tests passed: 12 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C335 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C335 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C335 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C335 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C336 added explicit return types to split-merge contract fixtures, peer factories, split/merge action helpers, and structural assertions.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C336 focused split-merge tests passed: 4 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C336 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C336 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C336 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C336 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C337 added explicit return types to remove-node contract fixtures, peer factory, and action helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C337 focused remove-node tests passed: 4 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C337 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C337 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C337 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C337 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C338 added explicit return types to awareness contract fixtures and remote-selection helper.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C338 focused awareness tests passed: 9 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C338 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C338 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C338 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C338 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C339 added explicit return types to provider contract provider doubles, seed/update helpers, editor factories, and cleanup helper.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C339 focused provider contract tests passed: 29 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C339 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C339 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C339 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C339 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C340 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C341 added explicit return types to React contract fixtures, render helper, and remote-selection helper.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C341 focused React contract tests passed: 6 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C341 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C341 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C341 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C341 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C342 typed the split-history contract fixture as `SplitHistory` and the malformed cases as readonly unknown values.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C342 focused split-history tests passed: 2 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C342 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C342 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C342 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C342 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C343 added explicit return types to structural-soak top-level fixtures, peer factories, peer readers, and paragraph assertions.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C343 focused structural-soak tests passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C343 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C343 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C343 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C343 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C344 added explicit void return types to structural-soak middle assertions, sync runners, connection helpers, and incremental command runner.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C344 focused structural-soak tests passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C344 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C344 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C344 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C344 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C345 added explicit void return types to structural-soak command helpers from text append/split/move through replace, wrap, fragment, undo/redo, and text-boundary assertions.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C345 focused structural-soak tests passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C345 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C345 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C345 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C345 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C346 narrowed the remaining set-node operation recorder from `string[]` to `Operation['type'][]`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C346 focused set-node tests passed: 8 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C346 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C346 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C346 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C346 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C347 extracted a provider contract cleanup helper type used by provider editor fixtures.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C347 focused provider contract tests passed: 29 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C347 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C347 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C347 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C347 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C348 added explicit return types to YjsController lifecycle, provider lifecycle, subscription, seed-decision, and commit-boundary methods.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C348 focused provider/commit/seed/sync/connect/disconnect/awareness/history tests passed: 122 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C348 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C348 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C348 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C348 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C349 added explicit return types to YjsController seed/import, awareness selection, operation trace, split redo/undo, import-selection, and remote split repair methods.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C349 focused split/selection/import/provider/awareness/undo/redo/remote/offline/fallback/structural tests passed: 157 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C349 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C349 first `bun lint` failed only Biome formatting in `src/core/controller.ts`; `bunx biome check --write` fixed it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C349 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C349 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C349 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C350 `bun check` passed repo lint, all package/site/root typechecks including `@slate/yjs`, Bun tests, and slate-layout tests before failing only in `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` with `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C351 extracted React contract editor probe props and added explicit return types to local probe components.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C351 focused React contract tests passed: 6 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C351 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C351 first `bun lint` failed only Biome formatting in `test/react-contract.spec.tsx`; `bunx biome check --write` fixed it.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C351 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C351 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C351 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C352 changed `createSplitElement` to accept readonly Yjs children and copy only at the Yjs insert boundary.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C352 focused split/merge/replace/lift/wrap/unwrap tests passed: 71 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C352 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C352 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C352 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C352 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C353 changed controller editor replacement to accept readonly children and copy only at the Slate replace boundary.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C353 focused import/fallback/provider/structural/replace/sync/reconcile/selection tests passed: 89 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C353 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C353 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C353 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C353 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C354 added an explicit boolean return type to awareness selection equality.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C354 focused awareness/selection/cursor/react tests passed: 36 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C354 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C354 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C354 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C354 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C355 added an explicit return type to `createYjsExtension` and explicit void returns to extension cleanup/commit hooks.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C355 focused provider/simple/react/commit/cleanup/sync/awareness tests passed: 55 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C355 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C355 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C355 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C355 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C356 narrowed the delete-fragment operation collector to store operation types directly instead of full operations.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C356 focused delete-fragment tests passed: 5 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C356 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C356 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C356 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C356 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C357 extracted shared `recordOperationTypes` test support and replaced repeated peer operation-recorder extensions in insert/move/lift/wrap/unwrap/set contracts.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C357 focused recorder contract tests passed: 52 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C357 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C357 `bun lint` passed after Biome import formatting.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C357 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C357 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C358 split `recordEditorOperationTypes` under the shared test helper and reused it for pure delete-fragment operation capture.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C358 focused recorder/delete-fragment contract tests passed: 57 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C358 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C358 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C358 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C358 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C359 added the missing explicit `void` return type to the document cleanup recursion helper.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C359 focused document/structural tests passed: 56 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C359 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C359 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C359 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C359 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C360 `bun check` passed repo lint, all package typechecks including `@slate/yjs`, site/root typecheck, Bun tests, and slate-layout tests.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C360 `bun check` failed only at known non-Yjs `packages/slate-react/test/dom-repair-policy-contract.test.ts:698`, `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C361 narrowed wrap/unwrap `topLevelTypes` helpers from `unknown[]` to `string[]` with explicit string normalization.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C361 focused wrap/unwrap tests passed: 12 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C361 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C361 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C361 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C361 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C362 reused shared `getParagraphTexts` in structural soak and removed the duplicate local paragraph text helper.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C362 focused structural soak tests passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C362 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C362 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C362 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C362 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C363 removed the dead `liftOnlyNestedBlock` alias and replaced stale references with `liftFirstNestedBlock`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C363 first focused lift run caught four stale alias references; fixed before keeping the packet.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C363 focused lift tests passed after fix: 19 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C363 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C363 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C363 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C363 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C364 simplified `normalizeYjsProviderSynced` to use an early non-record return instead of a nullable ternary branch.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C364 focused provider/react tests passed: 35 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C364 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C364 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C364 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C364 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C365 replaced the history operation-signature truthy guard with an explicit undefined check.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C365 focused history/split tests passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C365 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C365 `bun lint` passed after Biome formatting.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C365 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C365 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C366 rewrote `isPromiseLike` to use explicit null/object/function checks instead of wrapping truthiness in `Boolean`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C366 focused provider tests passed: 29 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C366 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C366 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C366 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C366 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C367 replaced React Yjs adapter truthiness checks with explicit `=== true` focus and `next !== undefined` overlay comparisons.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C367 focused react/awareness/selection tests passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C367 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C367 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C367 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C367 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C368 added shared `readPeerSlateValue` test support and replaced repeated `readSlateValueFromYjs(getYjsState(peer).root())` chains in split/merge/wrap/structural contracts.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C368 focused split/merge/wrap/structural tests passed: 39 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C368 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C368 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C368 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C368 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C369 added shared `getYjsTrace` test support and replaced repeated trace access in insert/delete/remove/set/simple/replace contracts.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C369 focused trace contract tests passed: 39 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C369 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C369 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C369 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C369 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C370 `bun check` passed repo lint, all package typechecks including fresh `@slate/yjs`, site/root typecheck, Bun tests, and slate-layout tests.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C370 `bun check` failed only at known non-Yjs `packages/slate-react/test/dom-repair-policy-contract.test.ts:698`, `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C371 replaced the remaining direct trace reads with shared `getYjsTrace` in wrap/unwrap/move/split/lift/merge/selection/awareness contracts.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C371 focused trace contract tests passed: 72 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C371 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C371 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C371 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C371 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C372 replaced controller provider/doc and import-selection truthiness guards with explicit undefined checks.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C372 focused provider/selection/import tests passed: 77 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C372 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C372 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C372 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C372 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C373 replaced structural-soak truthiness guards with explicit undefined/null checks.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C373 focused structural soak tests passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C373 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C373 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C373 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C373 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C374 added shared awareness test readers for remote cursors and awareness revision, then replaced direct state reads in the awareness contract.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C374 focused awareness tests passed: 9 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C374 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C374 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C374 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C374 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C375 added shared `isYjsPeerConnected` test support and reused it inside sync helpers and structural soak.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C375 focused shared-sync tests passed: 60 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C375 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C375 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C375 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C375 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C376 added shared provider status/synced test readers and reused them in the nullable-provider contract.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C376 focused provider tests passed: 29 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C376 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C376 `bun lint` passed after Biome formatting.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C376 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C376 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C377 added shared `readPeerChildren` and `readPeerSelection` test readers, then reused them in split/merge/wrap contracts and `getParagraphTexts`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C377 first focused run caught one leftover direct snapshot selection read; fixed before keeping the packet.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C377 focused split/merge/wrap tests passed after fix: 17 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C377 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C377 `bun lint` passed after Biome formatting.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C377 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C377 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C378 replaced direct snapshot children reads in the set_node contract with shared `readPeerChildren`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C378 focused set_node tests passed: 8 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C378 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C378 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C378 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C378 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C379 reused `readPeerChildren` in unwrap and structural-soak helpers, removing direct internal snapshot reads from those files.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C379 focused unwrap/structural tests passed: 27 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C379 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C379 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C379 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C379 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C380 `bun check` passed repo lint, all package typechecks including fresh `@slate/yjs`, site/root typecheck, Bun tests, and slate-layout tests.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C380 `bun check` failed only at known non-Yjs `packages/slate-react/test/dom-repair-policy-contract.test.ts:698`, `expected true to be false`.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C381 reused `readPeerChildren` inside move/lift text readers while keeping `Editor.string` for text projection.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C381 focused move/lift tests passed: 26 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C381 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C381 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C381 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C381 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C382 simplified `connectedFromYjsProviderStatus` to an expression-bodied helper.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C382 focused provider tests passed: 29 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C382 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C382 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C382 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C382 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C383 simplified React cursor decoration data creation to an expression-bodied object factory.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C383 focused react/awareness tests passed: 15 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C383 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C383 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C383 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C383 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C384 added shared `getYjsRoot` test support and reused it in selection/structural root assertions.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C384 focused selection/structural tests passed: 29 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C384 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C384 `bun lint` passed after Biome formatting.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C384 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C384 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C385 removed the local selection-contract `root(peer)` alias and called shared `getYjsRoot` directly.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C385 focused selection tests passed: 7 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C385 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C385 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C385 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C385 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C386 simplified replace/remove `createPeers` helpers from block returns to expression-bodied helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C386 focused replace/remove tests passed: 11 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C386 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C386 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C386 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C386 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C387 added shared `subscribeYjsAwareness` test support and removed the last direct peer state read from awareness tests.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C387 focused awareness tests passed: 9 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C387 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C387 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C387 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C387 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C388 narrowed fake provider call history from `string[]` to a `ProviderCall` literal union.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C388 focused provider tests passed: 29 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C388 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C388 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C388 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C388 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C389 tightened package-config dependency maps from optional string values to required string values after JSON validation.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C389 focused package-config tests passed: 4 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C389 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C389 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C389 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C389 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C390 root `bun check` passed repo lint, all package typechecks including `@slate/yjs`, site/root typecheck, root Bun tests, and slate-layout; failed only at known non-Yjs `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` (`expected true to be false`).
- `/Users/felixfeng/Desktop/repos/slate-v2`: C391 reused shared `getParagraphTexts` in lift/move contracts and removed duplicate local top-level text helpers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C391 focused lift/move tests passed: 26 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C391 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C391 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C391 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C391 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C392 added shared `getPeerTopLevelTypes` test support and removed duplicate wrap/unwrap top-level type readers.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C392 focused wrap/unwrap tests passed: 12 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C392 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C392 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C392 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C392 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C393 renamed misleading test helper `getParagraphTexts` to `getPeerTopLevelTexts` with no compatibility alias.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C393 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C393 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C393 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C393 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C394 made Yjs selection conversion nullable checks explicit (`null` instead of truthiness).
- `/Users/felixfeng/Desktop/repos/slate-v2`: C394 focused selection tests passed: 7 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C394 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C394 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C394 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C394 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C395 made history null/undefined guards explicit in rejected-operation cleanup.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C395 focused split-history/provider tests passed: 31 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C395 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C395 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C395 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C395 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C396 made operation null guards explicit for optional Yjs nodes/text points.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C396 focused simple/delete/move/insert tests passed: 27 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C396 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C396 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C396 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C396 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C397 made document helper guards explicit for virtual children, visible slots, uniform attributes, and optional Slate node matching.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C397 focused simple/split/wrap/unwrap/move/lift tests passed: 51 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C397 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C397 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C397 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C397 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C398 made controller nullable guards explicit for awareness, remote cursor state, operation traces, split-history peeks, import selection, and split repair trailing text.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C398 focused awareness/selection/provider/split-history/structural tests passed: 69 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C398 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C398 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C398 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C398 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C399 made test support optional guards explicit for seed updates, first seeded client, missing Yjs child, and wrapped peer setup.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C399 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C399 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C399 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C399 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C400 root `bun check` passed repo lint, all package typechecks including fresh `@slate/yjs`, site/root typecheck, root Bun tests, and slate-layout; failed only at known non-Yjs `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` (`expected true to be false`).
- `/Users/felixfeng/Desktop/repos/slate-v2`: C401 made split-history trailing text and repair guards explicit for non-empty strings, undefined children, null repairs, and missing right siblings.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C401 focused split-history/structural tests passed: 24 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C401 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C401 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C401 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C401 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C402 replaced replacement attribute `== null` with explicit `null`/`undefined` checks.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C402 focused set-node/replace-fragment/split-merge tests passed: 19 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C402 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C402 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C402 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C402 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C403 made controller provider/status/cursor/range checks explicit without changing boolean feature flags.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C403 focused provider/awareness/selection/react tests passed: 51 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C403 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C403 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C403 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C403 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C404 made document clone helper null handling explicit for virtual children and skipped clones.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C404 focused move/lift/wrap/split-merge tests passed: 37 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C404 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C404 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C404 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C404 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C405 made React bridge DOM resolver, rect, remote cursor range, and cursor data option checks explicit.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C405 focused react/awareness tests passed: 15 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C405 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C405 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C405 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C405 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C406 removed duplicate fake awareness state lookup when emitting remote awareness changes.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C406 focused awareness/provider tests passed: 38 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C406 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C406 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C406 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C406 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C407 made package-config contract optional object handling explicit for dependency maps, exports, and tsconfig compiler options.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C407 focused package-config tests passed: 4 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C407 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C407 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C407 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C407 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C408 made structural-soak helper guards explicit for missing child nodes, nullable text entries, optional first block, and null selections.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C408 focused structural-soak tests passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C408 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C408 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C408 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C408 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C409 renamed structural-soak `assertPeerParagraphTexts` to `assertPeerTopLevelTexts` to match actual top-level text semantics.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C409 focused structural-soak tests passed: 22 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C409 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C409 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C409 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C409 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C410 made React cursor hook optional `decorate` and `requestAnimationFrame` checks explicit.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C410 focused react tests passed: 6 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C410 `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C410 `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C410 `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C410 `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C411 final audit scans found no stale `getParagraphTexts`/`assertPeerParagraphTexts`/`topLevelTexts`/`topLevelTypes`, no `== null`, no TODO/FIXME/disable comments, and only two intentional casts at Yjs/test boundary.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C411 final `bun --filter @slate/yjs typecheck` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C411 final `bun lint` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C411 final `bun test ./packages/slate-yjs/test` passed: 187 pass, 0 fail.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C411 final `bun --filter @slate/yjs build` passed.
- `/Users/felixfeng/Desktop/repos/slate-v2`: C412 final root `bun check` passed repo lint, all package typechecks including fresh `@slate/yjs`, site/root typecheck, root Bun tests, and slate-layout; failed only at known non-Yjs `packages/slate-react/test/dom-repair-policy-contract.test.ts:698` (`expected true to be false`).

Final handoff contract:
- Goal plan: completed after strict 8h Slate Yjs cleanup continuation.
- Surface and route/package: `/Users/felixfeng/Desktop/repos/slate-v2/packages/slate-yjs` source, React bridge, and Yjs contract tests; parent ledger only in `/Users/felixfeng/Desktop/repos/plate-copy/docs/plans/2026-06-11-yjs-cleanup-8h-continuation.md`.
- Invocation mode, elapsed/timebox, loop/checkpoint count: slate-automation/autogoal loop from 2026-06-11T10:54:43+0800 through 2026-06-11T18:54:45+0800; continuation checkpoints reached C412.
- Behavior gates and visual proof: no browser/UI surface changed; package-facing behavior verified through focused contracts, full Yjs tests, typecheck, lint, build, and root check isolation.
- Primary metric baseline/latest/best and stop reason: latest Yjs package gates passed (`@slate/yjs typecheck`, `bun lint`, 187 Yjs tests, `@slate/yjs build`); stopped because 8h timebox completed.
- Bugs fixed and oracles added: no new behavior oracle needed; cleanup preserved existing Yjs contract coverage.
- Benchmark/skill/docs repairs: no benchmark or skill repair needed; ledger kept current.
- Workflow slowdowns and repairs: root `bun check` remains blocked only by known non-Yjs `packages/slate-react/test/dom-repair-policy-contract.test.ts:698`.
- Changed list: Yjs core nullish/readability cleanup, React cursor bridge cleanup, test support consolidation/renames, provider/package-config/structural-soak test cleanup, and parent continuation ledger.
- Needs your attention: the unrelated slate-react DOM repair failure still needs its own owner if root `bun check` must go green.
- Stopping checkpoints to unblock: none for Yjs; final C411 package gates passed and C412 root check isolated the same non-Yjs blocker.
- Accepted deferrals and residual risks: two intentional casts remain at Yjs boundary/test oracle (`attributes.ts` writer, unsupported operation test); raw provider test handler cast was left alone because changing it would add risk without payoff.
- Next owner: Yjs cleanup lane can stop here; separate slate-react owner should handle `dom-repair-policy-contract.test.ts:698`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Dynamic checkpoint loop through final handoff |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |
| What changed in the checkpoint plan? | See Checkpoint mutation ledger |

Timeline:
- 2026-06-11T02:54:35.132Z Goal plan created.
- 2026-06-11T02:55Z Requirement extraction recorded strict 8h continuation rule.
- 2026-06-11T02:56Z Continuation baseline package tests/typecheck/build/lint passed.

Open risks:
- Pending.
