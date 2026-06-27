# core type contracts gate

Objective:
Make `check:core` prove Core type contracts; done when Core/Plite type-contract, typecheck, lint, and test gates pass.

Goal plan:
docs/plans/2026-06-26-core-type-contracts-gate.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: user correction after false-green diagnosis
- prompt / link: "ok go then fix all !!!" after IDE showed errors in `packages/core/type-tests/plate-editor-value-contracts.ts`
- lane: shared Plate/Plite package API/type-contract lane
- surface / route / package: `packages/core`, `packages/plite*`, root type-test tooling
- invocation mode: one-shot execution
- minimum runtime / deadline: N/A: no timed checkpoint requested
- completion threshold summary: `check:core` includes the Core type-contract lane, `pnpm test:types` is not silently skipped/crashing, and focused Core/Plite package proof passes

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: pending
- semantics: pending
- initial confidence score: pending
- improvement loop: pending
- final score / loop closure: pending

Completion threshold:
- `check:core` runs Core type-contract proof instead of only `src` typecheck.
- `pnpm test:types` passes or is repaired into an equivalent non-crashing type-contract command with the same coverage.
- Type errors surfaced in `packages/core/type-tests/plate-editor-value-contracts.ts` are fixed without weakening inference expectations.
- Focused Core/Plite proof passes: `pnpm check:core`.
- Closure is legal only when package/API proof, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-core-type-contracts-gate.md` passes.

Verification surface:
- Source audit: `tooling/scripts/check-core.mjs`, `packages/core/tsconfig.json`, `tooling/config/tsconfig.type-tests.json`, `packages/core/type-tests/**`.
- Focused diagnosis: `pnpm test:types`, isolated `tsc` against `packages/core/type-tests/plate-editor-value-contracts.ts` when needed.
- Final package/API proof: `pnpm check:core`.
- Final goal proof: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-core-type-contracts-gate.md`.
- Browser, visual/native selection, mobile/raw-device, huge-document, benchmarks, docs, release, and PR proof are N/A: this is a package type-contract/tooling gate, not browser/runtime behavior.

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
- Source of truth: current checkout, root `VISION.md`, `docs/vision/plite.md`, `docs/vision/plate.md`, Core/Plite package source and type-contract files.
- Allowed edit scope: root scripts/package scripts, `tooling/scripts/check-core.mjs`, type-test config, `packages/core/**`, `packages/plite*/**` only as needed to make current API/type contracts honest.
- Browser surfaces: N/A.
- Package/API surfaces: Core plugin/editor value typing, Plite/Core source-vs-dist type resolution, type-test command coverage.
- Agent/skill surfaces: N/A unless workflow itself needs recurring skill repair; current expected fix is repo tooling/code.
- Docs/research surfaces: active goal plan only.
- Non-goals: no browser proof, no release/publish, no PR/commit, no broad Plate v2 redesign beyond type/API fixes required by the failing contracts.

Output budget strategy:
- Use focused `rg`, `sed`, and single-package commands only. Cap high-volume TypeScript output and inspect first error families by file/line instead of streaming full compiler traces.

Blocked condition:
- Block only if TypeScript itself crashes after a minimized current-checkout repro and no equivalent type-contract command can be built without changing package semantics, or if fixing the errors requires a public API taste decision not covered by root vision.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: shared Plate/Plite package API/type-contract
- surface: `packages/core` type contracts and Core/Plite package type resolution
- mode: one-shot execution
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: N/A: no timed loop requested
- current_loop: 1
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: none
- goal_status: ready_to_close

Current verdict:
- verdict: fixed; `check:core` now runs Core type contracts and the IDE-only type errors are gone
- confidence: high after `pnpm check:core`, table typecheck/lint/test, and `pnpm test:types`
- next owner: none for this packet
- keep / revert / quarantine call: keep
- reason: improves public plugin/editor inference and closes the false-green gate

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-core-type-contracts-gate.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | in_progress | P0 | Copy prompt requirements and read vision before implementation. | Requirement rows complete. | seed |
| status | auto | pending | P0 | Read active plan, latest prompt, source status, and current evidence. | Current state recorded. | seed |
| gap-scan | auto | pending | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Gaps routed to packet owners. | seed |
| closure-handoff | autoclosure | pending | P0 when merged/current-tree work is in scope | Run until-clean closure for already-applied work. | Closure delegated or N/A. | seed |
| behavior-proof | lane proof owner | pending | P0 | Prove stable editor behavior before perf. | Focused behavior commands pass or failures routed. | seed |
| oracle-repair | lane test owner / tdd | pending | P0 | Add missing native/visual/model oracles for found gaps. | New proof fails before fix or coverage gap is explicit. | seed |
| visual-proof | Browser / Playwright | pending | P0 | Prove visible editor behavior and native selection. | Browser/screenshot/geometry evidence recorded. | seed |
| browser-helper-promotion | lane proof harness | pending | P1 | Promote repeated browser proof into reusable API/helper. | Helper added, queued, or N/A with reason. | seed |
| mobile-claim-width | auto | pending | P1 | Separate raw-device proof from viewport proof. | Raw proof command passes or scoped blocker recorded. | seed |
| huge-document-smoke | lane proof owner | pending | P1 | Smoke huge-doc correctness without broad architecture work when in scope. | Typing/Enter/paste/select-all/undo/nav/scroll proof recorded or N/A. | seed |
| perf-packet | lane perf owner | pending | P2 | Optimize only after correctness is green. | Metric target or plateau recorded. | seed |
| supervision-mode | auto | pending | P0 when timed runtime remains | If backlog looks empty before minimum runtime, predict next useful checkpoint from vision and evidence. | New checkpoint added/run, or hard blocker recorded. | seed |
| consolidation | auto | pending | P1 | Move accepted reusable decisions to durable docs/rules. | Durable owner updated or N/A. | seed |
| final-handoff | auto | pending | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows complete. | seed |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | pending |

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
| Prompt requirements captured before work | yes | Latest prompt was to fix all after `check:core` missed IDE type errors. Plan captured type-contract gate, no commit, and focused package proof. |
| `auto` source rule read or fallback recorded | yes | Continued active `auto`/`autogoal` lane from current plan summary; no new skill source edits needed. |
| `vision` read as checkpoint zero | yes | Existing plan had Plate/Plite boundary and no-compat doctrine copied from root vision. No new taste fork surfaced. |
| Active goal checked or created | yes | Active goal: make `check:core` prove Core type contracts. |
| Lane resolved | yes | Shared Core/Plite package API/type-contract lane, with table package checked because a table file was touched. |
| Invocation mode and timebox recorded | yes | One-shot execution; no timed checkpoint. |
| Dynamic checkpoint policy accepted | yes | Added table package proof after evidence showed table was touched. |
| Source of truth and allowed workspaces recorded | yes | Current checkout, `tooling/scripts/check-core.mjs`, Core type-tests, Core/Plite/Table packages. |
| Output budget strategy recorded | yes | Compiler output was capped; proof reruns used focused commands before final `check:core`. |
| Release/PR/publish boundary recorded | yes | N/A: no release, PR, commit, or publish requested. |
| Browser proof strategy recorded | no | N/A: package type-contract/tooling fix with no browser-rendered surface. |
| Package/API proof strategy recorded | yes | `pnpm test:types`, `pnpm check:core`, and `@platejs/table` typecheck/lint/test. |
| Mobile/raw-device claim-width policy recorded | no | N/A: no mobile/browser behavior claim. |
| Skill repair authority and source-rule boundary recorded | no | N/A: repaired repo script, not `.agents` skills/rules. |

Work Checklist:
- [x] Prompt requirement captured: fix all IDE/type-contract errors and make `check:core` stop false-greening.
- [x] Objective, threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Invocation mode recorded as one-shot; timed/runtime supervision is N/A.
- [x] Lane resolved as shared Core/Plite package API/type-contract work.
- [x] Checkpoint plan reconciled after evidence: added table package proof because `packages/table` changed.
- [x] Post-merge/current-tree autoclosure is N/A: this was an active local fix, not PR/current-tree closure.
- [x] Behavior, browser, native selection, mobile, huge-doc, perf, benchmark, and docs proof are N/A for this package type gate.
- [x] Package/API proof completed with `pnpm test:types`, `pnpm check:core`, and table package typecheck/lint/test.
- [x] Workflow slowdown logged: `check:core` skipped `packages/core/type-tests/**`.
- [x] Changed list, review attention, stopping checkpoints, verification evidence, reboot status, and risks are current.
- [x] Autoreview is N/A for this narrow compiler/tooling packet unless requested before commit.
- [x] Agent-native review is N/A: no `.agents/**` or skill/rule source changed.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | `pnpm check:core` passed with `type contracts` included. |
| Dynamic checkpoint reconciliation | yes | Table package proof added after `packages/table` edits. |
| Lane authority proof | yes | Commands ran from repo root against Core/Plite/Table package owners. |
| Workspace authority proof | yes | Root package commands and `@platejs/table` package commands recorded below. |
| Behavior gates | no | N/A: no behavior/runtime bug claim beyond existing unit tests. |
| Visual/native selection proof | no | N/A: no browser-visible selection/editing change. |
| Missing oracle repair | yes | `pnpm test:types` is now part of `pnpm check:core`; type contracts stop false-green. |
| `@platejs/browser` promotion | no | N/A: no browser proof helper repeated. |
| Mobile/raw-device claim width | no | N/A: no mobile claim. |
| Huge-document correctness smoke | no | N/A: no huge-document behavior claim. |
| Package/API proof | yes | Core/Plite `check:core` and Table typecheck/lint/test passed. |
| Autoclosure handoff | no | N/A: not post-merge/current-tree closure. |
| Skill/rule sync | no | N/A: no `.agents/rules/**` edit. |
| Changed list / review attention / stopping checkpoints | yes | Final handoff rows below are filled. |
| Final lint/check | yes | `pnpm check:core`; `pnpm turbo typecheck --filter=./packages/table`; `pnpm --filter @platejs/table lint`; `pnpm --filter @platejs/table test`. |
| Workflow slowdown review | yes | False-green gate repaired by adding `pnpm test:types` to `check:core`. |
| Agent-native review for agent/tooling changes | no | N/A: no agent/tooling source outside package scripts. |
| Autoreview for non-trivial implementation changes | no | N/A unless requested before commit. |
| Goal plan complete | yes | Run after this plan update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | Plan captured false-green, type-contract gate, no browser/release scope. | done |
| Status and current-state read | complete | `pnpm test:types` exposed the IDE type errors. | done |
| Gap scan and scenario matrix | complete | Gap was package type-contract/tooling, not browser behavior. | done |
| Behavior proof | n/a | No editor behavior change claimed; package tests still ran through `check:core` and table test. | done |
| Oracle repair | complete | `pnpm test:types` wired into `pnpm check:core`. | done |
| Visual/native proof | n/a | No browser surface. | done |
| Browser helper promotion | n/a | No browser helper. | done |
| Mobile/raw-device claim width | n/a | No mobile claim. | done |
| Huge-document correctness smoke | n/a | No huge-document claim. | done |
| Perf/API/docs/skill packets as needed | complete | API/type inference packet completed; docs/skills not needed. | done |
| Consolidation and review | complete | Plan updated; table package proof added. | done |
| Final handoff and goal-plan check | complete | Ready for check-complete and final response. | done |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| pending | pending | pending | pending | pending | pending |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| pending | pending | pending | pending | pending | pending | pending | pending |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| pending | pending | pending | pending | pending | pending |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| pending | pending | pending | pending | pending | pending |

Browser helper promotion ledger:
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
| `pnpm check:core` before this run | Core tooling | false-green | It skipped `packages/core/type-tests/**`, so IDE-only public contract errors survived. | `pnpm test:types` failed before the repair. | Added `run('type contracts', 'pnpm', ['test:types'])` to `tooling/scripts/check-core.mjs`. |
| TypeScript plugin inference | Core API types | repeated deep-instantiation errors | Public helpers inferred through full plugin object structures. | `TS2589` in Core type-tests and Table package source-first typecheck. | Added type-only `__config?: C` anchor and taught editor/plugin helpers to infer from it. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Added a type-only plugin config anchor in `PluginBase`; updated Core/React helper inference for `createBaseEditor`, `createPlateEditor`, `useEditorPlugin`, `getOption`, and runtime plugin contexts. |
| tests/oracles/browser proof | Repaired Core type-test config and kept public editor value/plugin inference contracts strict; adjusted table runtime spec helper to avoid testing generic inference in a runtime behavior spec. |
| benchmarks/metrics/targets | N/A. |
| examples/docs | N/A. |
| skills/workflow | `tooling/scripts/check-core.mjs` now runs `pnpm test:types`. |
| reverted/quarantined packets | Reverted the attempted broad `BasePlugin` addition to `PlateRuntimePluginInput`; kept local spec erasure instead. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Type-only `__config?: C` anchor | This is a deliberate TypeScript inference aid on plugin base types. It is optional/runtime-absent but visible in public types. | `packages/core/src/lib/plugin/PluginBase.ts` | Keep. It is the cleanest fix found for avoiding structural plugin recursion while preserving inference. |
| 2 | Runtime spec erasure in table test | `TableExtension.spec.ts` now uses a tiny `RuntimeSpecEditor` shape because it is a runtime behavior spec, not a generic inference spec. | `packages/table/src/lib/TableExtension.spec.ts` | Keep unless you want all runtime specs to carry public generic inference as a policy. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | N/A | No user decision needed. | Gate is green. | None. | None. | Continue with normal Core/Plate v2 migration work when desired. | N/A |

Findings:
- `check:core` was false-green for public type contracts because `packages/core/type-tests/**` were outside the gate.
- Public plugin/editor helper inference was too structural and could recurse through full plugin object graphs.
- A type-only config anchor gives helpers a cheap inference path without weakening the public type-test expectations.

Decisions and tradeoffs:
- Kept public contract tests strict: invalid `tx`, invalid selector args, invalid editor API args, and value narrowing still fail as expected.
- Used implementation erasure only in private runtime/spec glue where the test does not own public generic inference.
- Table package was included in proof because a table file changed during the fix.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `PlateRuntimePluginInput` widened to include `BasePlugin` | 1 | Do not broaden runtime public input to fix a runtime spec. | Reverted; spec helper casts plugin input locally. |
| `getOption<TOverride>` overload swallowed invalid selector args | 1 | Remove public override overload and cast internal loose read. | Fixed; type-test invalid selector arg is enforced. |

Verification evidence:
- `pnpm test:types` passed.
- `pnpm check:core` passed after adding the `type contracts` stage.
- `pnpm turbo typecheck --filter=./packages/table` passed.
- `pnpm --filter @platejs/table lint` passed.
- `pnpm --filter @platejs/table test` passed: 219 pass, 0 fail.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-26-core-type-contracts-gate.md`.
- Lane: shared Core/Plite package API/type-contract.
- Surface and route/package: `packages/core`, `packages/plite*`, `packages/table`, `tooling/scripts/check-core.mjs`.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: one-shot, no timed minimum, one repair loop.
- Behavior gates and visual proof: N/A; no browser-visible behavior change claimed.
- Primary metric baseline/latest/best and stop reason: baseline `check:core` missed `test:types`; latest/best `check:core` includes and passes it; stopped because all named gates are green.
- Bugs fixed and oracles added: false-green type-contract gate fixed; plugin/editor inference type-contracts pass.
- Benchmark/skill/docs repairs: no benchmark or skill repair; goal plan updated.
- Workflow slowdowns and repairs: `check:core` now runs `pnpm test:types`.
- Changed list: see changed list table.
- Needs your attention: see ranked table.
- Stopping checkpoints to unblock: none.
- Accepted deferrals and residual risks: no browser/raw-device/perf proof because no such claim; possible follow-up is broader public-type API review before commit if desired.
- Next owner: none for this packet.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff. |
| Where am I going? | Close the active goal after check-complete. |
| What is the goal? | Make `check:core` prove Core type contracts. |
| What have I learned? | The missing gate was `pnpm test:types`; full plugin structural inference caused TypeScript recursion. |
| What have I done? | Repaired type config, inference helpers, check-core wiring, and table package typecheck fallout. |
| What changed in the checkpoint plan? | Added table proof and marked browser/mobile/perf/docs rows N/A for this package type-contract lane. |

Timeline:
- 2026-06-26T07:34:59.042Z Goal plan created.
- 2026-06-26T08:xxZ `pnpm test:types` repaired and passed.
- 2026-06-26T08:xxZ `pnpm check:core` repaired and passed.
- 2026-06-26T08:xxZ `@platejs/table` typecheck/lint/test passed after table helper cleanup.

Open risks:
- None blocking this goal. The only review-worthy choice is the public type-only `__config?: C` anchor.
