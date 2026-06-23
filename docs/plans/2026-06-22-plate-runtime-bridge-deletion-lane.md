# plate runtime bridge deletion lane

Objective:
Remove Plate runtime bridge debt; done when core runtime plus one representative package are clean, proved, and paused for review.

Goal plan:
docs/plans/2026-06-22-plate-runtime-bridge-deletion-lane.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: user-invoked `auto`
- prompt / link: Plate runtime bridge deletion lane.
- lane: Plate
- surface / route / package: `packages/core` runtime/plugin/editor bridge plus one representative Plate feature package.
- invocation mode: full-loop until the requested pause checkpoint.
- minimum runtime / deadline: N/A: no duration requested.
- completion threshold summary: core runtime bridge debt reduced or exact blocker proven, one representative package migrated/proved, and handoff pauses for API review before broad package sweep.

First checkpoint:
- Explicit requirements captured:
  - remove private `editor.tf`, `editor.transforms`, and `plugin.transforms` runtime bridge debt created during the API hard cut;
  - migrate the default Plate runtime toward Slate `editor.read`, `editor.update`, `editor.api`, and tx groups;
  - move package-by-package only when typecheck, test, and build pass;
  - do not create public compat aliases;
  - allow private bridges only when they have deletion gates;
  - pause after core runtime plus one representative package are clean so the user can review final API shape before broad package sweep.
- Scope boundary: Plate lane, starting in `packages/core`, then one representative package selected from source evidence.
- Non-goals: no PR, release, changeset, public docs rewrite, browser behavior claim, Slate package redesign, or broad package sweep before review.
- Stop condition: pause at the core-plus-one-package checkpoint even if more package rows remain.
- First checkpoint complete; continue to source/status audit.

Timed checkpoint:
- requested duration: N/A
- semantics: full-loop pause checkpoint, not timed mode
- initial confidence score: N/A: success is API/source proof plus package gates.
- improvement loop: run source audit, core runtime packet, one representative package packet, proof, then pause.
- final score / loop closure: record confidence and blockers at review pause.

Completion threshold:
- Core runtime has the smallest credible deletion of `editor.tf` / `editor.transforms` / `plugin.transforms` bridge debt, or an exact runtime blocker is recorded with owner and next API decision.
- One representative Plate feature package uses Slate-style `editor.api` / `editor.update` / tx groups without public compat aliases and passes package typecheck, test, and build.
- Private bridges that remain are named with owner, deletion gate, and proof route.
- Source audits prove no new public compat aliases were introduced.
- The run pauses before the broad package sweep with changed list, proof commands, review-attention items, residual risks, and next owner.
- Closure is legal only when required behavior, visual/native selection, package/API, mobile/raw-device claim width, huge-document, docs/skill repair, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-runtime-bridge-deletion-lane.md` passes.

Verification surface:
- Source audit:
  - `rg -n 'editor\\.tf|editor\\.transforms|plugin\\.transforms|legacyRuntimeUpdateBridge|extendTransforms|extendEditorTransforms|getTransforms' packages/core/src packages/*/src --glob '!**/dist/**'`
  - narrowed owner reads before patching.
- Core proof:
  - `pnpm turbo typecheck --filter=./packages/core`
  - `pnpm --filter @platejs/core test`
  - `pnpm --filter @platejs/core build`
- Representative package proof:
  - `pnpm turbo typecheck --filter=./packages/<package>`
  - `pnpm --filter @platejs/<package> test`
  - `pnpm --filter @platejs/<package> build`
- Facade proof if affected:
  - `pnpm --filter platejs build`
- Browser proof: N/A unless source changes affect browser-visible editor behavior.
- Docs audit: N/A unless public docs are touched.
- Skill sync: N/A unless `.agents/rules/**` changes.
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
- Source of truth: latest user prompt, active previous hard-cut plan, `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, and current `packages/core` / package source.
- Allowed edit scope: `packages/core/src/**`, one selected `packages/<representative>/src/**`, directly owned tests, and this plan.
- Browser surfaces: none initially; add only if editor-visible behavior changes.
- Package/API surfaces: Plate runtime/plugin/editor API internals and selected package tx/API usage.
- Agent/skill surfaces: none initially.
- Docs/research surfaces: this plan only unless a reusable decision must be consolidated.
- Non-goals: broad package sweep, release, PR, changeset, public docs rewrite, compatibility aliases, and full Slate substrate redesign.

Output budget strategy:
- Use `rg -l` / focused owner reads before broad `rg -n`.
- Exclude `dist`, generated output, donor checkouts, and browser artifacts.
- For large audits, capture filenames/counts first and inspect only owner slices.
- Keep command output capped; write artifacts only if an audit becomes broad enough to exceed chat usefulness.

Blocked condition:
- Stop if deleting the private bridge requires a public Plate v2 API fork beyond the accepted `api`/`tx` direction, if one representative package cannot be migrated without broad package sweep, or if proof shows the only safe next step is user review of final API shape.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: Plate
- surface: runtime bridge deletion
- mode: full-loop to review pause
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 0
- current_checkpoint: review-pause
- current_checkpoint_status: complete
- next_checkpoint: user API shape review before broad package sweep
- goal_status: ready for requested pause

Current verdict:
- verdict: pause for API review
- confidence: 0.82 after focused core + callout proof
- next owner: user review, then `auto` broad package sweep if accepted
- keep / revert / quarantine call: keep both packets
- reason: core bridge export is no longer public, one representative package migrated from `editor.tf` to Slate-style `editor.update`, and remaining debt is broad runtime/plugin API shape.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-runtime-bridge-deletion-lane.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | complete | P0 | Copy prompt requirements and read vision before implementation. | Requirements, vision, lane, scope, non-goals, proof, and pause condition recorded. | update: complete |
| status-source-audit | auto | complete | P0 | Read current runtime bridge owners and exact stale surfaces before edits. | Core audit found `getEditorPlugin`, `createPlateRuntimeEditor`, `OverrideEditor` typing, and `withSlate` bridge install as remaining owners; `callout` selected as representative package. | complete |
| core-runtime-packet | auto / packages/core | complete | P0 | Remove or shrink private runtime bridge debt at the owner. | `legacyRuntimeUpdateBridge` moved under `packages/core/src/internal/editor`, public barrel export removed, core typecheck/test/build passed. | keep |
| representative-package-packet | auto / package owner | complete | P0 | Migrate one package through final API shape before broad sweep. | `packages/callout` no longer uses `editor.tf` in source; typecheck/test/build passed. | keep |
| review-pause | auto | in_progress | P0 | Stop before broad package sweep so user can review final API shape. | Final handoff records remaining runtime API decisions. | keep |
| closure-handoff | autoclosure | N/A | P3 | Run until-clean closure for already-applied work. | N/A: this is active runtime implementation, not post-merge/current-tree closure. | retire for this run |
| behavior-proof | lane proof owner | complete | P2 | Prove stable editor behavior before perf. | N/A for browser behavior; package tests cover helper and tx-group contract. | scoped |
| oracle-repair | lane test owner / tdd | complete | P1 | Add missing model/API oracles for found gaps. | Existing callout tests covered the changed helper and tx group; no new oracle needed for this pause packet. | keep |
| visual-proof | Browser / Playwright | N/A initially | P3 | Prove visible editor behavior and native selection. | N/A unless browser-visible behavior changes. | update |
| browser-helper-promotion | lane proof harness | N/A initially | P3 | Promote repeated browser proof into reusable API/helper. | N/A unless repeated browser proof appears. | update |
| mobile-claim-width | auto | N/A | P3 | Separate raw-device proof from viewport proof. | N/A: no mobile claim. | update |
| huge-document-smoke | lane proof owner | N/A | P3 | Smoke huge-doc correctness without broad architecture work when in scope. | N/A: no huge-document claim. | update |
| perf-packet | lane perf owner | N/A | P3 | Optimize only after correctness is green. | N/A: no perf claim. | update |
| supervision-mode | auto | N/A | P3 | Timed-mode fallback. | N/A: no timed mode. | update |
| consolidation | auto | complete | P1 | Move accepted reusable decisions to durable docs/rules. | N/A: no reusable doctrine changed; this is implementation closure. | keep |
| final-handoff | auto | complete | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows complete for the requested review pause. | keep |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded by runtime lane rows |
| 0 | update/split/retire | checkpoint-zero, status-source-audit, core-runtime-packet, representative-package-packet, review-pause | latest prompt + vision read | Narrow Auto template to Plate runtime bridge deletion and review pause. | complete |
| 1 | update/complete | status-source-audit, core-runtime-packet, representative-package-packet | focused source audit + package proof | Core export debt and one small package could be fixed safely before API review; broader `editor.tf` runtime interception needs user approval. | complete |

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
| Prompt requirements captured before work | yes | First checkpoint lists scope, non-goals, stop condition, proof, and review pause. |
| `auto` source rule read or fallback recorded | yes | `.agents/skills/auto/SKILL.md` read before plan creation. |
| `vision` read as checkpoint zero | yes | `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md` read. |
| Active goal checked or created | yes | `create_goal` created this active goal after `get_goal` returned none. |
| Lane resolved | yes | Plate runtime bridge deletion lane. |
| Invocation mode and timebox recorded | yes | Full-loop review pause; no timed runtime. |
| Dynamic checkpoint policy accepted | yes | Checkpoint supervisor narrowed from template to source-audit/core/one-package/review-pause. |
| Source of truth and allowed workspaces recorded | yes | Boundaries section lists source and edit scope. |
| Output budget strategy recorded | yes | Output budget strategy section filled before broad scans. |
| Release/PR/publish boundary recorded | yes | Non-goals exclude PR/release/changeset. |
| Browser proof strategy recorded | yes | N/A unless visible behavior changes. |
| Package/API proof strategy recorded | yes | Core and representative package proof commands named. |
| Mobile/raw-device claim-width policy recorded | yes | N/A: no mobile claim. |
| Skill repair authority and source-rule boundary recorded | yes | N/A unless workflow miss appears; source rules only if needed. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining backlog ladder, and supervision-mode fallback are recorded.
- [x] Lane is resolved as Slate, Plate, or shared editor, with owning workspace/package/app proof named.
- [x] Checkpoint supervisor table has been reconciled at least once after the initial seed.
- [x] Post-merge/current-tree closure is routed to `autoclosure` when in scope, or marked N/A with reason.
- [x] Each loop ends with a checkpoint mutation decision: add, update, split, merge, retire, remove, reopen, reprioritize, or no-change with reason.
- [x] Current runtime/status source audit recorded before new runtime patches.
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
| Named verification threshold | yes | Run core and representative package proof. | Core typecheck/test/build passed earlier in this goal; callout typecheck/test/build passed after migration. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed. | Checkpoint supervisor narrowed to source audit, core packet, callout packet, and review pause. |
| Lane authority proof | yes | Prove each command ran in the owning Plate workspace. | All commands ran from `/Users/zbeyens/git/plate-2`; package filters targeted `@platejs/core` and `@platejs/callout`. |
| Workspace authority proof | yes | Record cwd/tool for each package proof. | See Verification evidence. |
| Behavior gates | scoped | Run focused package behavior proof or record scoped defer rows. | Callout helper/tx tests passed; no browser-visible behavior lane claimed. |
| Visual/native selection proof | no | Record scoped blocker. | N/A: no browser selection or visual behavior was changed. |
| Missing oracle repair | scoped | Add/verify/revert/quarantine oracle packets or record owner defer. | Existing callout helper and tx tests covered the changed paths; no new oracle added. |
| `@platejs/browser` promotion | no | Add/verify helper/API or record queue/defer reason. | N/A: no browser proof repetition in this lane. |
| Mobile/raw-device claim width | no | Run raw-device proof or record no mobile claim. | N/A: no mobile claim. |
| Huge-document correctness smoke | no | Run smoke or record owner defer. | N/A: no huge-document claim. |
| Package/API proof | yes | Source-audit and run package/type/test proof. | Callout source audit clean; core and callout proof passed. |
| Autoclosure handoff | no | Delegate post-merge/current-tree until-clean work to `autoclosure`, otherwise N/A. | N/A: active implementation lane, not post-merge closure. |
| Skill/rule sync | no | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A. | N/A: no skill/rule edits. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence. | Filled below. |
| Final lint/check | yes | Run scoped lint/check. | Biome check passed for changed callout files; core/callout package proof passed. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A. | Logged below. |
| Agent-native review for agent/tooling changes | no | Load `agent-native-reviewer` and close accepted findings, or N/A. | N/A: no `.agents/**`, command, skill, hook, or tooling source changed. |
| Autoreview for non-trivial implementation changes | scoped | Run or defer for explicit user API pause. | Deferred: user requested pause for API shape review before broad sweep; run `autoreview` after shape approval or before commit. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-runtime-bridge-deletion-lane.md`. | To run after this plan update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | prompt requirements copied into plan | source audit |
| Status and current-state read | complete | focused core audit plus package search | core packet |
| Core runtime packet | complete | public barrel no longer exports bridge; core proof passed | representative package |
| Representative package packet | complete | callout uses `editor.update`; proof passed | review pause |
| Browser/helper/mobile/huge-doc/perf lanes | N/A | no browser/perf/mobile/huge-doc claim in prompt | none |
| Consolidation and review | complete | no reusable doctrine change | final handoff |
| Final handoff and goal-plan check | complete | check-complete gate ready after this plan update | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| Core runtime API | package source | N/A | N/A | export/public-surface audit + package proof | complete |
| Callout package | package source | N/A | insert callout / emoji icon write | helper test + tx group test + source audit | complete |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| Source audit | 1 | auto | Broad package scan is too noisy; inspect core owners and one representative package before patching. | focused `rg` / source reads in `packages/core/src` and `packages/callout/src` | N/A | keep | use focused package rows for sweep |
| Core internalization | 1 | `packages/core` | Public export of `legacyRuntimeUpdateBridge` keeps bridge debt discoverable as package API. | moved bridge to `packages/core/src/internal/editor`; removed `packages/core/src/lib/editor/index.ts` export; `pnpm brl`; core typecheck/test/build | package API proof only | keep | broad runtime API decision remains |
| Callout migration | 1 | `packages/callout` | A small package can show the final style: helper/hook writes through `editor.update` and tx groups, not `editor.tf`. | `insertCallout.ts`, `useCalloutEmojiPicker.ts`; callout source audit; typecheck/test/build | package tests | keep | use as first pattern for broad sweep |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Callout helper and tx group | `packages/callout` | `pnpm --filter @platejs/callout test` | N/A | 4 pass, 0 fail | none |
| Browser-visible behavior | N/A | N/A | N/A | N/A: no browser route changed | add Browser proof only when migrating visible UI behavior or examples |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| Runtime bridge deletion lane | N/A | N/A | N/A | N/A | no selection/visual claim |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| none | none | none | N/A | N/A |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| none | none | N/A | N/A | no mobile claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| none | none | N/A | N/A | no huge-document claim |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Initial broad bridge audit | auto | short but noisy | `rg` over all packages produced too much legacy-surface noise to guide a safe packet. | narrowed audit to core owners and one package. | keep focused owner-first audit for broad sweep |
| Parallel core proof attempt | auto | transient | Running `pnpm brl`, core typecheck, and core build in parallel produced a transient `@udecode/utils` source-resolution failure despite the file existing. | serialized rerun of core typecheck passed. | run package gates serially during this migration |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Moved `legacyRuntimeUpdateBridge` under `packages/core/src/internal/editor`; removed its public barrel export; migrated callout helper/hook from `editor.tf` to `editor.update` and `editor.api.findPath`. |
| tests/oracles/browser proof | No new tests; existing callout tests cover changed helper and inferred tx group. |
| benchmarks/metrics/targets | none |
| examples/docs | Updated this goal plan only. |
| skills/workflow | none |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Keep `editor.api` + `editor.update`/tx as the Plate package migration target? | Callout now demonstrates this shape cleanly, but override-heavy packages still depend on `plugin.transforms` / `OverrideEditor` concepts. | `packages/callout/src/lib/transforms/insertCallout.ts`, `packages/callout/src/react/hooks/useCalloutEmojiPicker.ts` | approve before broad package sweep |
| 2 | What to do with runtime override interception? | `createPlateRuntimeEditor`, `getEditorPlugin`, and `OverrideEditor` still carry `tf`/`transforms` compatibility. Removing them is a bigger Plate v2 API decision than a package cleanup. | `packages/core/src/react/editor/createPlateRuntimeEditor.ts`, `packages/core/src/lib/plugin/getEditorPlugin.ts`, `packages/core/src/react/plugin/PlatePlugin.ts` | plan a core API packet after reviewing callout shape |
| 3 | Autoreview timing | Running autoreview before your API-shape review would probably produce broad noise against an intentionally paused lane. | this plan | run after API shape approval or before commit |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| api-shape-review | hard pause | Approve the callout-style migration target: public helpers may stay, but implementation writes through `editor.update`; React hooks resolve explicit paths through `editor.api`; no public compat alias. | This determines the broad package sweep style. | all remaining package migrations | none until approved, per prompt | approve with one caveat: override-heavy packages need a dedicated core packet |
| core-runtime-override-owner | soft checkpoint | Decide whether `plugin.transforms`/`OverrideEditor` is kept temporarily as private bridge or redesigned now. | This is the real leftover debt after the safe core/export packet. | core runtime bridge deletion | callout-style package migrations that do not touch override interception | defer until after reviewing one or two more representative packages |

Findings:
- `legacyRuntimeUpdateBridge` no longer needs to be exported from `packages/core/src/lib/editor/index.ts`; it can be internal.
- `packages/callout` was the right first representative package: simple, already tx-group based, and fully migratable without `any`.
- Remaining bridge debt is not just call-site cleanup. The hard part is runtime/plugin interception: `createPlateRuntimeEditor`, `getEditorPlugin`, and `OverrideEditor` still preserve `tf`/`transforms` concepts.

Decisions and tradeoffs:
- Kept `insertCallout(editor, options)` as a public helper name but changed the implementation to `editor.update`.
- Used `editor.api.findPath(element)` in the React hook instead of the old node-object `at` convenience. That is more explicit and closer to Slate runtime boundaries.
- Did not add public compat aliases or runtime shims.
- Did not run Browser proof because no browser route, selection path, or visible editor behavior changed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad all-package bridge audit was too noisy | 1 | Narrow to core owners and selected package. | Completed focused audit and package packet. |
| Parallel core gates created transient package-resolution noise | 1 | Run package migration gates serially. | Serialized core typecheck passed; callout gates were run serially. |

Verification evidence:
- `pnpm exec biome check --fix packages/core/src/internal/editor/legacyRuntimeUpdateBridge.ts packages/core/src/lib/editor/withSlate.ts packages/core/src/lib/editor/index.ts` passed.
- `pnpm brl` passed.
- `pnpm turbo typecheck --filter=./packages/core` passed on serialized rerun.
- `pnpm --filter @platejs/core test` passed: 951 pass, 0 fail.
- `pnpm --filter @platejs/core build` passed.
- `pnpm exec biome check --fix packages/callout/src/lib/transforms/insertCallout.ts packages/callout/src/react/hooks/useCalloutEmojiPicker.ts` passed.
- `rg -n 'editor\\.tf|editor\\.transforms|plugin\\.transforms|getTransforms|extendTransforms|extendEditorTransforms' packages/callout/src --glob '!**/dist/**'` returned no matches.
- `pnpm turbo typecheck --filter=./packages/callout` passed.
- `pnpm --filter @platejs/callout test` passed: 4 pass, 0 fail.
- `pnpm --filter @platejs/callout build` passed.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-22-plate-runtime-bridge-deletion-lane.md`
- Lane: Plate
- Surface and route/package: `packages/core` runtime bridge + `packages/callout` representative package
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop to requested pause; no timed minimum; one implementation loop after checkpoint zero
- Behavior gates and visual proof: scoped to package tests; Browser/visual/native N/A for this packet
- Primary metric baseline/latest/best and stop reason: source cleanup/proof, not perf; stop because user requested pause after core + one package
- Bugs fixed and oracles added: no runtime bug; no new oracle needed
- Benchmark/skill/docs repairs: none; plan updated
- Workflow slowdowns and repairs: broad audit noise and parallel command transient logged
- Changed list: see Changed list table
- Needs your attention: see ranked table
- Stopping checkpoints to unblock: `api-shape-review` hard pause
- Accepted deferrals and residual risks: runtime override interception remains in core until reviewed
- Next owner: user review, then `auto` broad package sweep

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Requested pause after core + one representative package. |
| Where am I going? | User API review, then broad package sweep if approved. |
| What is the goal? | Remove Plate runtime bridge debt without public compat aliases. |
| What have I learned? | Callout is clean with `editor.update`; core runtime override interception remains the real debt. |
| What have I done? | Internalized the core bridge export and migrated callout off `editor.tf`. |
| What changed in the checkpoint plan? | Generic auto rows were narrowed to core packet, callout packet, and review pause. |

Timeline:
- 2026-06-22T21:03:48.677Z Goal plan created.
- 2026-06-22: Core bridge internalization completed and proved.
- 2026-06-22: Callout representative package migrated and proved.
- 2026-06-22: Paused for API shape review before broad package sweep.

Open risks:
- `plugin.transforms` / `OverrideEditor` deletion is still unresolved and should not be hidden inside package-by-package cleanup.
- Override-heavy packages may need a dedicated core API packet before they can migrate cleanly.
