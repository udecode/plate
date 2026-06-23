# plate v2 api conflict execution

Objective:
Execute Plate v2 API conflict plan; done when core/package gates pass or next owner is proven.

Goal plan:
docs/plans/2026-06-22-plate-v2-api-conflict-execution.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: accepted Plate Plan execution through `auto`
- prompt / link: `go [$auto] that plan. feel free to update the initial plan if required to achieve best typing, especially plugin typing; do not regress type inference.`
- lane: Plate lane with shared Slate substrate typing gate
- surface / route / package: `packages/core`, `packages/plate`, Slate extension typing only if needed, then feature packages package-by-package
- invocation mode: full-loop
- minimum runtime / deadline: N/A: no duration requested
- completion threshold summary: execute the accepted plan until the core API boundary is green, package/type/test gates pass for touched owners, or a proven Slate/Plate plan owner remains.

First checkpoint:
- Explicit prompt requirements copied before implementation:
  - run `auto` on `docs/plans/2026-06-22-plate-v2-api-conflict-plan.md`;
  - execute, not just plan;
  - update the accepted plan when evidence shows that is required for best typing;
  - Slate package changes are allowed only when Plate implementation proves extension typing/runtime slots are too limited;
  - protect plugin typing and type inference; do not replace typed surfaces with `any`;
  - implement package-by-package with focused proof;
  - no public compatibility aliases or runtime shims;
  - stop only when package gates pass, a real owner remains, or a hard user authority boundary appears.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- First extraction complete.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: full-loop until completion threshold or real stopping checkpoint
- initial confidence score: N/A: concrete package/type/test gates are better than a score
- improvement loop: package-by-package execution packets
- final score / loop closure: N/A unless plan must be rescored after a public API fork

Completion threshold:
- Core public API/runtime conflict packet is implemented or explicitly routed.
- Touched packages pass focused typecheck/test/build gates.
- Public declaration/source audits show no public legacy `tf`, `transforms`, `getTransforms`, `getPluginApi`, or `@platejs/slate-legacy` exposure for the touched boundary, unless a private bridge row owns it with deletion gate.
- Plate plugins install feature APIs through Slate-native `api/state/tx` extension slots, or the accepted plan is updated with evidence that Slate substrate typing needs a patch.
- Plugin type inference is preserved by focused type contracts or package typecheck.
- No public compat aliases or shims are introduced.
- Docs/examples are updated only after the API target lands or explicitly deferred with owner.
- Closure is legal only when required behavior, visual/native selection, package/API, mobile/raw-device claim width, huge-document, docs/skill repair, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-v2-api-conflict-execution.md` passes.

Verification surface:
- `pnpm turbo typecheck --filter=./packages/core`
- `pnpm --filter @platejs/core test`
- `pnpm --filter @platejs/core build`
- public declaration/source audits for stale legacy API names in touched outputs
- `pnpm brl` when package exports/barrels change
- `pnpm turbo typecheck --filter=./packages/plate` and `pnpm --filter platejs build` if `packages/plate` exports change
- focused package typecheck/test for each migrated feature package
- `pnpm --filter www check:docs` only when docs content changes
- browser proof only when product-visible runtime behavior changes, not for pure type/API surgery
- final `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-v2-api-conflict-execution.md`
- Slate package proof uses `pnpm slate:test` and `pnpm slate:typecheck`.
- Slate daily proof uses `pnpm check:slate`.
- Slate focused browser proof uses `pnpm --filter slate test:slate-browser:chromium <file-or--grep>`.
- `apps/slate` reuses `apps/www` Slate examples; never maintain a second example source tree.
- Slate release/deletion proof adds explicit closure gates such as package
  build, docs checks, benchmark target audit, and
  `pnpm check:slate:browser-matrix` when those claims are in scope.

Constraints:
- Resolve lane first: Slate, Plate, or shared editor. Use `autoclosure` for post-merge/current-tree until-clean closure.
- Release, PR, and publish work are in scope only when the prompt explicitly asks for them or the active lane requires them.
- Slate-lane proof runs from the Plate repo root against transplanted Slate packages and routes. Do not use donor-checkout proof.
- Plate-lane proof runs in the owning Plate package, app, or docs route. Slate runtime proof does not prove Plate docs, registry, plugin, or package DX.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a stopping checkpoint routes to `slate-plan`.
- Do not patch Plate when the run is scoped to Slate. Do not patch Slate runtime when the run is scoped to Plate docs/product unless a shared-editor owner row names that boundary.
- Use root `VISION.md` and relevant `docs/vision/*.md` for durable taste.
- Do not create compatibility aliases or runtime shims unless the checkpoint explicitly requires them.

Boundaries:
- Source of truth: latest user request, root `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, accepted plan `docs/plans/2026-06-22-plate-v2-api-conflict-plan.md`, and live source.
- Allowed edit scope: `packages/core/**`, `packages/plate/**`, required feature packages one at a time, `packages/slate/**` only for proven extension typing/runtime gaps, docs only after API target lands, this execution plan.
- Browser surfaces: N/A until a product-visible behavior route changes.
- Package/API surfaces: `@platejs/core`, `platejs`, Slate extension APIs, feature package plugin APIs.
- Agent/skill surfaces: N/A unless workflow miss appears.
- Docs/research surfaces: accepted plan may be updated when evidence changes; public docs deferred until API surface lands.
- Non-goals: release/publish/PR, broad Plate v2 design beyond this accepted plan, pagination, mobile/raw-device proof, public compatibility aliases, public shims.

Output budget strategy:
- Use owner-file reads and `rg -l`/counts before line dumps.
- Exclude `dist`, `.next`, `out`, generated registry/public output, `node_modules`, coverage, and `.turbo` unless they are the named proof target.
- Inspect core typing/test contracts before broad feature-package scans.
- Write broad stale-symbol audits to artifacts if they exceed about 20 files.

Blocked condition:
- Block only if preserving plugin type inference requires a public API fork not covered by the accepted plan and no local proof can choose between options.
- Block if the active package cannot be made green without a user-only product/taste decision.
- Block if tooling/source access prevents all focused package proof.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: Plate
- surface: Plate v2 API conflict execution
- mode: full-loop
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 0
- current_checkpoint: facade-correction
- current_checkpoint_status: complete
- next_checkpoint: curate `platejs` facade exports after core API conflict rows are stable
- goal_status: checkpoint-complete

Current verdict:
- verdict: keep first API typing packet, revert direct-import consumer churn
- confidence: 0.9 after focused package proof
- next owner: auto Plate lane, facade-correction checkpoint
- keep / revert / quarantine call: keep core typing, revert consumer import churn
- reason: Slate-v2 runtime now infers installed Plate plugin `api` through `editor.api` and tx groups through `editor.update`; Plate feature packages should keep using the `platejs` product facade unless they intentionally need a low-level substrate owner.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-v2-api-conflict-execution.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | complete | P0 | Copy prompt requirements and read vision before implementation. | Requirement rows complete. | seed |
| status | auto | complete | P0 | Read active plan, latest prompt, source status, and current evidence. | Source audit recorded; core and package consumers chosen. | update: begin source audit |
| gap-scan | auto | complete | P0 | Identify API typing, package, docs, and workflow gaps. | Runtime inference gap patched; facade correction added. | update: narrow to API conflict execution |
| closure-handoff | autoclosure | N/A | P0 when merged/current-tree work is in scope | No post-merge/current-tree closure was requested in this loop. | no-change |
| behavior-proof | lane proof owner | N/A | P0 | Prove stable editor behavior before perf. | This loop changed API typing/import wiring only; no product-visible editor behavior route changed. | no-change |
| oracle-repair | lane test owner / tdd | complete | P0 | Add missing native/visual/model oracles for found gaps. | Runtime spec now asserts inferred `editor.api.*` and `editor.update(tx => tx.*)` instead of legacy helper paths. | update |
| visual-proof | Browser / Playwright | N/A | P0 | Prove visible editor behavior and native selection. | No browser-visible behavior changed. | no-change |
| browser-helper-promotion | lane proof harness | N/A | P1 | Promote repeated browser proof into reusable API/helper. | No repeated browser proof pattern in this API/package loop. | no-change |
| mobile-claim-width | auto | N/A | P1 | Separate raw-device proof from viewport proof. | No mobile claim. | no-change |
| huge-document-smoke | lane proof owner | N/A | P1 | Smoke huge-doc correctness without broad architecture work when in scope. | No huge-document claim. | no-change |
| perf-packet | lane perf owner | N/A | P2 | Optimize only after correctness is green. | No perf claim. | no-change |
| supervision-mode | auto | N/A | P0 when timed runtime remains | No timed runtime was requested. | no-change |
| consolidation | auto | complete | P1 | Move accepted reusable decisions to durable docs/rules. | Accepted plan corrected: `platejs` remains the Plate product facade; conflicts are fixed in the facade/API, not by broad consumer import churn. | update |
| final-handoff | auto | complete | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff ledgers filled for this checkpoint. | update |
| core-api-packet | auto / packages/core | complete | P0 | Remove public legacy API conflict while preserving Slate extension inference. | Core runtime typecheck/test/build passed; runtime declaration no longer exposes `getPluginApi/getTransforms` on `PlateRuntimeEditor`. | keep |
| slate-extension-typing-gate | auto / packages/slate | N/A | P0 if core typing fails | Core typing passed without Slate substrate changes. | no-change |
| package-entrypoint-packet | auto / packages/plate | deferred | P1 | Curate `platejs` facade exports after core API conflict rows are stable. | Do not force feature packages around the facade; fix the facade itself. | update |
| consumer-import-migration | auto / feature packages | reverted | P1 | Broad direct-owner import migration is not the right default for Plate feature packages. | `@platejs/autoformat` and `@platejs/juice` restored to `platejs` imports. | revert |
| facade-correction | auto / packages/plate | complete | P0 | Keep the Plate product facade as the internal feature-package import surface. | `packages/plate/src/index.tsx` already exports core/slate/utils; package consumers restored to `platejs`. | keep |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | complete |
| 0 | update | status, gap-scan | accepted plan + latest prompt | execute API conflict plan, not generic editor behavior soak | complete |
| 0 | add | core-api-packet, slate-extension-typing-gate, package-entrypoint-packet | accepted plan phases 1-2 | implementation starts at core public boundary | complete |
| 1 | update | core-api-packet | core source audit | `tf/transforms/getTransforms/getPluginApi` are still used by private runtime bridge and legacy package internals; the first clean cut is the Slate-v2 public route plus tests proving `api/tx` inference, not a fake repo-wide deletion. | complete |
| 1 | add | consumer-import-migration | `rg` over `platejs` imports | Initial thought was to migrate feature packages away from `platejs`; this was too strict. | reverted |
| 2 | add | facade-correction | user challenge + `packages/plate/src/index.tsx` audit | `platejs` is the Plate product facade. Feature packages should keep the product import and the facade should be curated instead. | complete |

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
| Prompt requirements captured before work | yes | First checkpoint section copies all explicit user requirements before implementation. |
| `auto` source rule read or fallback recorded | yes | Read `.agents/skills/auto/SKILL.md`. |
| `vision` read as checkpoint zero | yes | Read `.agents/skills/vision/SKILL.md`, root `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md`. |
| Active goal checked or created | yes | `get_goal` returned none; created this execution goal. |
| Lane resolved | yes | Plate lane with shared Slate extension typing gate. |
| Invocation mode and timebox recorded | yes | Full-loop; no duration requested. |
| Dynamic checkpoint policy accepted | yes | Checkpoint supervisor rows updated before implementation. |
| Source of truth and allowed workspaces recorded | yes | Boundaries section names plan, vision, and package scopes. |
| Output budget strategy recorded | yes | Output budget section completed. |
| Release/PR/publish boundary recorded | yes | Non-goals exclude release/publish/PR. |
| Browser proof strategy recorded | yes | Browser proof N/A until product-visible behavior changes. |
| Package/API proof strategy recorded | yes | Verification surface names core, plate, feature package gates. |
| Mobile/raw-device claim-width policy recorded | N/A | No mobile/raw-device claim in this API execution. |
| Skill repair authority and source-rule boundary recorded | yes | Agent/skill changes N/A unless workflow miss appears; source-rule only. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining backlog ladder, and supervision-mode fallback are recorded.
- [x] Lane is resolved as Slate, Plate, or shared editor, with owning workspace/package/app proof named.
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
| Named verification threshold | yes | Run focused package proof commands | Core, autoformat, and juice gates recorded below. |
| Dynamic checkpoint reconciliation | yes | Update plan from source evidence | Reverted consumer-import migration as the default; added facade-correction. |
| Lane authority proof | yes | Prove commands ran in owning packages | All commands ran from repo root with package filters. |
| Workspace authority proof | yes | Record cwd/tool for package proof | Commands recorded under Verification evidence. |
| Behavior gates | N/A | Record scoped defer rows | API/package import typing only; no behavior route changed. |
| Visual/native selection proof | N/A | Record scoped blocker | No browser-visible selection/editing change. |
| Missing oracle repair | yes | Add focused type/runtime oracle | Runtime spec now proves inferred `editor.api.*` and `editor.update(tx => tx.*)`. |
| `@platejs/browser` promotion | N/A | Record queue/defer reason | No browser helper pattern in scope. |
| Mobile/raw-device claim width | N/A | Record claim width | No mobile claim. |
| Huge-document correctness smoke | N/A | Record owner defer | No huge-document claim. |
| Package/API proof | yes | Run package/type/test/build proof | Core, autoformat, and juice package proof recorded. |
| Autoclosure handoff | N/A | Record why not delegated | This was not post-merge/current-tree closure. |
| Skill/rule sync | N/A | Record why not run | No `.agents/rules/**` changed. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers | Ledgers filled below. |
| Final lint/check | yes | Run scoped lint/check | `@platejs/core lint:fix`, typecheck, test, build; package proofs for autoformat and juice. |
| Workflow slowdown review | yes | Log slow steps | Parallel build/test race and no-test package behavior recorded. |
| Agent-native review for agent/tooling changes | N/A | Record why not run | No agent/tooling source changed. |
| Autoreview for non-trivial implementation changes | deferred | Record reason | Not run in this checkpoint; recommended before commit. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-v2-api-conflict-execution.md` | queued after ledger fill |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | Prompt requirements copied; vision and accepted plan read. | status |
| Status and current-state read | complete | Accepted plan, runtime source, package import surface, and consumer counts read. | gap scan |
| Gap scan and scenario matrix | complete | Runtime inference gap identified; facade-correction added after source/user review. | oracle repair |
| Behavior proof | N/A | No behavior route changed. | oracle repair |
| Oracle repair | complete | Core runtime spec now asserts inferred plugin API/tx path. | consolidation |
| Visual/native proof | N/A | No browser-visible behavior changed. | consolidation |
| Browser helper promotion | N/A | No browser helper pattern in scope. | consolidation |
| Mobile/raw-device claim width | N/A | No mobile claim. | consolidation |
| Huge-document correctness smoke | N/A | No huge-document claim. | consolidation |
| Perf/API/docs/skill packets as needed | complete | API/package import packets completed; docs and skills N/A. | consolidation |
| Consolidation and review | complete | Accepted plan and execution plan updated with consumer-before-entrypoint rule. | final handoff |
| Final handoff and goal-plan check | complete | Handoff ledgers filled and check queued. | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| Plate runtime API typing | `createPlateRuntimeEditor` / `createPlateEditor({ runtime: 'slate-v2' })` | package type/test/build | N/A | inferred `editor.api.*` and `editor.update(tx => tx.*)` | complete |
| Plate feature package imports | `@platejs/autoformat`, `@platejs/juice` | package type/test/build | N/A | use `platejs` product facade; no direct-owner churn unless package is intentionally low-level | complete |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| runtime plugin inference | 1 | `packages/core` | Runtime plugins install APIs/tx at runtime, but public typing should infer them through `editor.api` and `editor.update`, not legacy `getPluginApi/getTransforms`. | `packages/core/src/react/editor/createPlateRuntimeEditor.ts`; `packages/core/src/react/editor/createPlateRuntimeEditor.spec.ts`; `pnpm turbo typecheck --filter=./packages/core`; `pnpm --filter @platejs/core test`; `pnpm --filter @platejs/core build` | N/A: type/runtime package proof only | keep | Continue cutting legacy `PlateEditor/TPlateEditor` helpers after more consumers migrate. |
| facade imports: autoformat | 2 | `packages/autoformat` | Feature packages should import the Plate product facade instead of bypassing it. | `packages/autoformat/src/plugin.ts`; `packages/autoformat/package.json`; `pnpm turbo typecheck --filter=./packages/autoformat`; `pnpm --filter @platejs/autoformat build` | N/A | keep | Package has no tests; typecheck/build is the proof lane. |
| facade imports: juice | 2 | `packages/juice` | Feature package tests and runtime code should use the same public Plate facade as users. | `packages/juice/src/lib/JuicePlugin.ts`; `packages/juice/src/lib/JuicePlugin.spec.ts`; `packages/juice/package.json`; `pnpm turbo typecheck --filter=./packages/juice`; `pnpm --filter @platejs/juice test`; `pnpm --filter @platejs/juice build` | N/A | keep | Continue with facade curation, not direct import churn. |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| editor behavior | N/A | No product-visible editor behavior changed. | N/A | N/A | Browser proof deferred until runtime behavior/docs route changes. |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| N/A | No selection behavior changed. | N/A | N/A | N/A | scoped out |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| N/A | No browser proof pattern used. | N/A | N/A | no-change |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| N/A | N/A | N/A | N/A | no mobile/raw-device claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| N/A | N/A | N/A | N/A | no huge-document claim |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Parallel `@platejs/core` typecheck/test/build rerun | auto loop | about 3.5s failed test while build continued | Test read dependent `dist` while build rewrote artifacts, causing transient missing-module errors. | Sequential `pnpm --filter @platejs/core test` passed with 952 tests. | Do not parallelize package build and test in this lane. |
| `@platejs/autoformat` test lane | package proof | about 0.6s failed with no tests found | Package has no spec files. | Typecheck and build passed. | Treat no-test package as N/A test lane; do not count as runtime failure. |
| Initial `@platejs/autoformat` import replacement | package proof | one failed typecheck | `KEYS` is owned by `@platejs/utils`, which exposed the broader issue: bypassing `platejs` was churn, not the right DX. | Reverted feature packages to `platejs`; conflicts should be curated at the facade/API boundary. | Keep `platejs` as the default feature-package import. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `PlateRuntimeEditor` now infers installed plugin APIs into `editor.api`; `getPluginApi/getTransforms` moved behind a private legacy bridge cast; `@platejs/autoformat` and `@platejs/juice` restored to the `platejs` product facade. |
| tests/oracles/browser proof | Core runtime spec now asserts `editor.api.apiPlugin`, `editor.api.html`, `editor.api.debug`, and tx inference through `editor.update`; `juice` tests use the public `platejs` facade. |
| benchmarks/metrics/targets | N/A. |
| examples/docs | Accepted plan and execution plan updated; no public docs changed. |
| skills/workflow | N/A. |
| reverted/quarantined packets | Direct-owner import churn for `@platejs/autoformat` and `@platejs/juice` was reverted. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Legacy `PlateEditor/TPlateEditor` still expose `tf`, `transforms`, `getPluginApi`, and `getTransforms`. | Runtime route is cleaner now, but the legacy/default Plate editor type remains public debt until feature packages migrate. | `packages/core/src/react/editor/PlateEditor.ts` | Continue package-by-package migration before a final hard cut. |
| 2 | `packages/plate` facade still needs curation. | `platejs` should stay the Plate product facade, but it should not leak legacy/conflicting aliases forever. | `docs/plans/2026-06-22-plate-v2-api-conflict-plan.md` | Fix the facade/export surface directly after core API rows are stable. |
| 3 | `@platejs/autoformat` has no tests. | Build/typecheck prove import wiring, but no runtime behavior spec exists for this deprecated compatibility package. | `packages/autoformat` | Accept as N/A unless you want a tiny smoke test for the inert plugin. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| next-facade-curation | soft checkpoint | Curate `platejs` exports after core API conflict rows are stable. | Keeps public Plate DX simple while still removing legacy/conflicting API. | Bypassing the facade for ordinary feature packages. | Package-by-package API migration can continue through the facade. | Keep feature packages on `platejs`; direct-import owners only in substrate/low-level code. | `docs/plans/2026-06-22-plate-v2-api-conflict-execution.md` |

Findings:
- Runtime plugin API inference was missing from `PlateRuntimeEditor`; adding `InferPlateRuntimePluginApi` preserves plugin typing without changing Slate substrate.
- `platejs` is the Plate product facade; feature packages should not bypass it by default.

Decisions and tradeoffs:
- Keep this packet: it improves runtime typing and restores Plate feature packages to the product facade.
- Defer `packages/plate` facade curation until the core API conflict rows are stable.
- Defer browser proof because no browser-visible behavior changed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Parallel package build/test race caused transient missing-module test errors. | 1 | Rerun package proof sequentially. | Sequential core test passed. |
| `@platejs/autoformat` imported `KEYS` from `@platejs/core`. | 1 | Stop bypassing the product facade for feature packages. | Restored `platejs` imports and recorded facade-correction. |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/core` passed.
- `pnpm --filter @platejs/core test` passed: 952 tests.
- `pnpm --filter @platejs/core build` passed.
- `pnpm --filter @platejs/core lint:fix` passed and fixed formatting.
- `packages/core/dist/react/index.d.ts` shows `PlateRuntimeEditor` with inferred plugin `api` and no `getPluginApi/getTransforms` fields on that runtime type.
- `pnpm turbo typecheck --filter=./packages/autoformat` passed.
- `pnpm --filter @platejs/autoformat build` passed.
- `pnpm --filter @platejs/autoformat test` is N/A: no tests found in the package.
- `pnpm turbo typecheck --filter=./packages/juice` passed.
- `pnpm --filter @platejs/juice test` passed: 2 tests.
- `pnpm --filter @platejs/juice build` passed.
- `packages/autoformat` and `packages/juice` use the public `platejs` facade for feature-package imports.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-22-plate-v2-api-conflict-execution.md`
- Lane: Plate API conflict execution.
- Surface and route/package: `packages/core`, `packages/autoformat`, `packages/juice`, accepted plan docs.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop, no timed minimum, loop 1 complete.
- Behavior gates and visual proof: N/A for this package/API typing checkpoint.
- Primary metric baseline/latest/best and stop reason: package gates green; stopped at clean facade-correction checkpoint.
- Bugs fixed and oracles added: fixed runtime plugin API typing gap; strengthened core runtime API/tx inference tests.
- Benchmark/skill/docs repairs: accepted plan and execution plan updated; no benchmarks/skills changed.
- Workflow slowdowns and repairs: sequential package gates required; no-test package recorded as N/A.
- Changed list: see Changed list table.
- Needs your attention: legacy editor public helpers and `platejs` facade curation remain.
- Stopping checkpoints to unblock: curate `platejs` facade after core API rows stabilize.
- Accepted deferrals and residual risks: legacy `PlateEditor/TPlateEditor` helpers remain public until more package migration lands; browser proof deferred because behavior did not change.
- Next owner: `auto` facade-curation checkpoint.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | End of loop 2, facade-correction checkpoint. |
| Where am I going? | Continue package-by-package API migration through the `platejs` product facade, then curate facade exports. |
| What is the goal? | Execute the Plate v2 API conflict plan without regressing plugin inference. |
| What have I learned? | Runtime API/tx inference can be fixed in core without Slate substrate changes; `platejs` should stay the Plate product facade and conflicts should be fixed there. |
| What have I done? | Patched core runtime typing/tests and restored `autoformat` plus `juice` to the `platejs` facade. |
| What changed in the checkpoint plan? | Reverted consumer-import migration as the default and added facade-correction. |

Timeline:
- 2026-06-22T11:24:47.949Z Goal plan created.
- 2026-06-22 Loop 1: Core runtime inference packet kept; `@platejs/autoformat` and `@platejs/juice` direct-import packets initially tried.
- 2026-06-22 Loop 2: Feature package direct-import churn reverted; `platejs` facade direction kept.

Open risks:
- Legacy `PlateEditor/TPlateEditor` still expose old helper surfaces until feature package migration completes.
- `packages/plate` still exports Slate substrate because internal consumers are not fully migrated yet.
- Autoreview was deferred; run it before commit.

Open risks:
- Pending.
