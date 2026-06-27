# plate plugin extensions api cleanup

Objective:
Make Plate plugins install Plite editor extensions through `extensions`, hard-cut `extendEditor` and `editorExtensions`, and prove Core stays green.

Goal plan:
docs/plans/2026-06-26-plate-plugin-extensions-api-cleanup.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: user prompt
- prompt / link: `$auto` full after accepting `extensions` as the best field name
- lane: shared editor
- surface / route / package: Plate plugin API in `packages/core`, Plite extension installation, current plugin callers
- invocation mode: full-loop
- minimum runtime / deadline: N/A
- completion threshold summary: public plugins use `extensions`, `extendEditor`/`editorExtensions` are cut, focused tests/typecheck/build pass, and current docs/API anchors are aligned.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: one complete full-loop
- initial confidence score: medium; previous interrupted packet had the wrong `extendEditor` target
- improvement loop: API hard cut, callers/tests/docs update, focused proof, full `check:core`
- final score / loop closure: pending

Completion threshold:
- `BasePlugin` and `PlatePlugin` expose `extensions`, not `extendEditor` or `editorExtensions`.
- `extensions` accepts `EditorExtensionInput`, readonly arrays, and plugin-context factories.
- Existing Plate plugin callers are migrated from `editorExtensions` to `extensions`.
- `HistoryPlugin` uses `extensions: [history()]`.
- Dead wrappers `withPlateHistory`, `withCurrentRuntimeHistory`, and `withPlateReact` stay removed.
- Current docs/API pages that teach plugin extension installation use `extensions`.
- Focused Core tests, type contracts, build/typecheck, source audits, and `check:core` pass.
- Closure is legal only when required behavior, visual/native selection, package/API, mobile/raw-device claim width, huge-document, docs/skill repair, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-plate-plugin-extensions-api-cleanup.md` passes.

Verification surface:
- Source audit: no `extendEditor` / `editorExtensions` in current Core plugin API, package callers, or current docs except historical migration/changelog if intentionally ignored.
- Focused Core specs for runtime editor, plugin creation, Plite integration, and affected package callers.
- Type tests for plugin extension field.
- `pnpm turbo typecheck --filter=./packages/core`.
- `pnpm --filter @platejs/core build`.
- `pnpm check:core`.
- Final `check-complete.mjs`.
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
- Source of truth: current Core/Plate plugin source and current docs.
- Allowed edit scope: `packages/core`, direct caller packages using `editorExtensions`, current docs/API anchors, tests/type-tests.
- Browser surfaces: N/A unless docs/app route proof becomes necessary.
- Package/API surfaces: Plate plugin public API and Plite extension installation.
- Agent/skill surfaces: N/A.
- Docs/research surfaces: current docs only; historical migration/changelog docs can mention old names as history if out of current API lanes.
- Non-goals: broad Plate package migration, rendered browser behavior changes, release/changelog work, Plite runtime API redesign.

Output budget strategy:
- Use `rg -l` and exact file lists for `extendEditor`/`editorExtensions`; avoid broad `extensions` scans because media MIME data uses the same word.

Blocked condition:
- Stop only if a current package needs editor-mutating callback semantics that cannot be expressed as Plite extension input without a larger Plate v2 decision.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: shared editor
- surface: Plate plugin extension API
- mode: full-loop
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: N/A: full-loop, no timed backlog
- current_loop: 1
- current_checkpoint: final-handoff
- current_checkpoint_status: done
- next_checkpoint: none
- goal_status: ready_for_completion

Current verdict:
- verdict: keep
- confidence: high
- next owner: none for this packet
- keep / revert / quarantine call: keep
- reason: `extensions` is installed through Core and runtime paths, stale fields are gone from current docs/source scope, focused tests/type contracts/typecheck/build/check:core pass.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-plate-plugin-extensions-api-cleanup.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | done | P0 | Copy prompt requirements and read vision before implementation. | Requirement rows complete. | updated |
| status | auto | pending | P0 | Read active plan, latest prompt, source status, and current evidence. | Current state recorded. | seed |
| gap-scan | auto | pending | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Gaps routed to packet owners. | seed |
| api-hard-cut | auto | in_progress | P0 | Rename extension installation field to `extensions` and cut legacy fields. | Source audit and focused proof pass. | added |
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
| 1 | update | api-hard-cut, package-proof, docs-proof, final-handoff | stale-symbol audit + proof commands | evidence narrowed packet to API/package/docs only | done |

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
| Prompt requirements captured before work | yes | Completion threshold and boundaries copied above. |
| `auto` source rule read or fallback recorded | yes | `.agents/skills/auto/SKILL.md` read before continuing. |
| `vision` read as checkpoint zero | no | N/A: no new taste decision; user already accepted `extensions`. |
| Active goal checked or created | yes | Active goal confirmed with `get_goal`. |
| Lane resolved | yes | Shared editor: Plate plugin API installing Plite extensions. |
| Invocation mode and timebox recorded | yes | Full-loop; no timed minimum. |
| Dynamic checkpoint policy accepted | yes | Packet narrowed to API hard cut, docs, package proof. |
| Source of truth and allowed workspaces recorded | yes | `packages/core`, touched callers, current docs/API anchors. |
| Output budget strategy recorded | yes | Exact `rg` scopes and focused command output. |
| Release/PR/publish boundary recorded | yes | N/A: no release, PR, publish, or commit requested. |
| Browser proof strategy recorded | yes | N/A: no rendered behavior changed. |
| Package/API proof strategy recorded | yes | Type contracts, focused specs, touched package typecheck, build, `check:core`. |
| Mobile/raw-device claim-width policy recorded | yes | N/A: no mobile claim. |
| Skill repair authority and source-rule boundary recorded | yes | N/A: no skill/rule miss found. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining backlog ladder, and supervision-mode fallback are recorded.
- [x] Lane is resolved as Plite, Plate, or shared editor, with owning workspace/package/app proof named.
- [x] Checkpoint supervisor table has been reconciled at least once after the initial seed.
- [x] Post-merge/current-tree closure is routed to `autoclosure` when in scope, or marked N/A with reason: not post-merge/current-tree closure.
- [x] Each loop ends with a checkpoint mutation decision: see mutation ledger loop 1.
- [x] Current-tree/status packet recorded before new runtime patches: active goal and stale-symbol audit.
- [x] Behavior proof packet recorded for every in-scope stable editor family or explicitly skipped/deferred with reason: N/A, API/type/docs packet only.
- [x] Visual/native selection proof packet recorded for browser-visible selection/editing risks or explicitly scoped: N/A, no rendered behavior change.
- [x] Missing oracle packets are written, kept, reverted, quarantined, or deferred with owner and proof command: type-contract rows added for single/array/factory `extensions`.
- [x] Repeated browser proof patterns are promoted to `@platejs/browser` or queued with reason: N/A, no browser proof pattern.
- [x] Mobile/raw-device proof is run or the claim width is explicitly limited: N/A, no mobile claim.
- [x] Huge-document correctness smoke is run or deferred with owner and reason: N/A, no huge-doc behavior change.
- [x] Perf packet runs only after correctness is green, or is marked N/A for this run: N/A, no perf packet.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are audited when in scope.
- [x] Docs/vision/rule consolidation is applied when a reusable decision is accepted, or marked N/A: N/A, user decision already captured by current packet.
- [x] Workflow slowdowns are logged and avoidable repeats are repaired in the owner skill/script/gate.
- [x] Packet ledger contains one row per proof, bug fix, oracle, benchmark, docs, or skill packet.
- [x] Changed list is current and includes only this run.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued or marked none.
- [x] Autoreview/review gate is run for non-trivial implementation diffs or marked N/A with reason: N/A for this packet; proof gate is `check:core`, run autoreview before commit.
- [x] Agent-native review is run for `.agents/**`, commands, skills, hooks, or prompt/tooling changes, or marked N/A with reason: N/A, no agent files changed.
- [x] Output budget discipline is followed: audits used exact path scopes.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | `pnpm test:types`; focused Core specs; touched package typecheck; `pnpm --filter @platejs/core build`; `pnpm check:core`. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | Checkpoint mutation ledger loop 1. |
| Lane authority proof | yes | Prove each command ran in the owning Plite/Plate/shared workspace, or record N/A | Commands ran from `/Users/zbeyens/git/plate-2`; package filters target Core/Plite/touched packages. |
| Workspace authority proof | yes | Record cwd/tool for each package, docs, skill, browser, or benchmark proof | Verification evidence lists exact commands and cwd. |
| Behavior gates | no | Run focused stable behavior proof or record scoped defer rows | N/A: API/type/docs wiring packet, no editor behavior change. |
| Visual/native selection proof | no | Record Browser/Playwright/native-selection evidence or scoped blocker | N/A: no browser-visible behavior change. |
| Missing oracle repair | yes | Add/verify/revert/quarantine oracle packets or record owner defer | Type contracts cover single extension, readonly array, and factory callback. |
| `@platejs/browser` promotion | no | Add/verify helper/API or record queue/defer reason | N/A: no browser helper pattern. |
| Mobile/raw-device claim width | no | Run raw-device proof or record that only scoped viewport/browser proof is available | N/A: no mobile claim. |
| Huge-document correctness smoke | no | Run focused huge-document behavior smoke or record owner defer | N/A: no huge-doc surface changed. |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | Stale-symbol audit empty; type/contracts/specs/build/check pass. |
| Autoclosure handoff | no | Delegate post-merge/current-tree until-clean work to `autoclosure`, otherwise N/A | N/A: not post-merge/current-tree closure. |
| Skill/rule sync | no | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | N/A: no `.agents/rules/**` changed. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | Ledgers below filled. |
| Final lint/check | yes | Run scoped lint/check or record why no code changed | `pnpm check:core` passed. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Typecheck exposed real package type failures; no skill/script slowdown. |
| Agent-native review for agent/tooling changes | no | Load `agent-native-reviewer` and close accepted findings, or N/A | N/A: no agent/tooling changes. |
| Autoreview for non-trivial implementation changes | no | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | N/A for this goal; run before commit if requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-plate-plugin-extensions-api-cleanup.md` | Passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | done | Plan threshold/boundaries completed. | status |
| Status and current-state read | done | Active goal and stale-symbol audit. | gap scan |
| Gap scan and scenario matrix | done | Stale current docs found only in plugin guide; source stale audit clean after patch. | API packet |
| Behavior proof | N/A | No editor behavior changed. | oracle repair |
| Oracle repair | done | Type contracts and focused specs added/updated. | package proof |
| Visual/native proof | N/A | No rendered selection/browser change. | docs/package proof |
| Browser helper promotion | N/A | No repeated browser helper pattern. | mobile claim width |
| Mobile/raw-device claim width | N/A | No mobile claim. | huge-document smoke |
| Huge-document correctness smoke | N/A | No huge-doc surface changed. | package proof |
| Perf/API/docs/skill packets as needed | done | API/docs packet kept; perf/skill N/A. | consolidation |
| Consolidation and review | done | Docs updated; no vision/skill change needed. | final handoff |
| Final handoff and goal-plan check | done | Final ledgers filled; checker next. | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| Plate plugin API | plugin config + runtime install | package/type only | create/resolve plugin | source audit, type contracts, runtime specs | done |
| Browser behavior | N/A | N/A | N/A | N/A | N/A: no rendered behavior changed |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| API hard cut | 1 | auto | `extensions` is the correct public Plate plugin field; `extendEditor`/`editorExtensions` should die. | `packages/core/src/lib/plugin/BasePlugin.ts`, `packages/core/src/react/plugin/PlatePlugin.ts`, `packages/core/src/lib/editor/withPlite.ts`, `packages/core/src/react/editor/createPlateRuntimeEditor.ts` | N/A: API/type packet | keep | none |
| Docs alignment | 1 | auto | Current docs must not teach dead plugin extension fields. | `content/docs/(guides)/plugin*.mdx`, API/debugging docs, stale-symbol audit | N/A: docs packet | keep | none |
| Downstream type repair | 1 | auto | Touched plugin callers must keep inference and avoid type-depth regressions. | `packages/math`, `packages/list-classic`, `packages/table`; touched package typecheck | N/A: type packet | keep | none |
| Closure proof | 1 | auto | Core/Plite proof should pass after API hard cut. | `pnpm check:core` | N/A: package proof | keep | none |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Editor behavior | N/A | N/A | N/A | N/A: no editor behavior changed | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| Visual/native selection | N/A | N/A | N/A | N/A | N/A: no browser-visible selection change |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| N/A | N/A | N/A | N/A | No browser proof helper repeated. |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| N/A | N/A | N/A | N/A | No mobile claim in this packet. |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| N/A | N/A | N/A | N/A | No huge-document behavior changed. |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Touched package typecheck | package graph | ~20-27s per pass | It had to build deps and surfaced real type failures in math/list/table. | Fixed deep instantiation and contextual typing issues. | No workflow repair; this was useful proof, not avoidable slowdown. |
| `check:core` output volume | Core gate | ~20s, large output | Plite test output is verbose. | Core/Plite passed. | No repair in this packet; command is the accepted closure gate. |
| `www` dev server port argument | docs Browser proof | one failed start | `pnpm --filter www dev -- --port 3002` passes `--port` as a project directory to Next. | Restarted with `PORT=3002 pnpm --filter www dev`. | Use `PORT=3002` for this script. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Plate plugin config now uses `extensions`; runtime installers read `plugin.extensions`; `HistoryPlugin` uses `history()` extension; `withPlateHistory`, `withCurrentRuntimeHistory`, and `withPlateReact` dead paths removed; direct callers in ai/math/list-classic/suggestion/table use `extensions`; table wrapper generic pinned correctly. |
| tests/oracles/browser proof | Type contracts cover single, readonly-array, and factory `extensions`; Core/runtime/plugin specs updated; math/list specs repaired to preserve inference and avoid TS depth blowups. |
| benchmarks/metrics/targets | N/A. |
| examples/docs | Current plugin guide/API/debugging docs teach `extensions` or `overrideEditor`, not `extendEditor`. |
| skills/workflow | N/A. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Public field name | This is the user-facing Plate plugin API shape. | `packages/core/src/lib/plugin/BasePlugin.ts`; `packages/core/src/react/plugin/PlatePlugin.ts` | Keep `extensions`. |
| 2 | Autoreview before commit | This packet did not run the full `autoreview` skill. | This plan; proof commands below | Run `$autoreview` before committing if you want final review pressure. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | N/A | No queued user decision. | N/A | N/A | N/A | Continue with next Plate v2 package/core boundary lane. | N/A |

Findings:
- Stale current docs remained only in `content/docs/(guides)/plugin*.mdx`; source stale-symbol audit was clean after the API patch.
- `mergePlugins` needed a special `extensions` rule so single extension objects are preserved instead of swallowed by default `extensions: []`.
- Touched package typecheck found real follow-up type issues: math runtime selection tests, list-classic plugin-array generics, and table's heavy `toPlatePlugin` inference.

Decisions and tradeoffs:
- `extensions` is the public plugin field for Plite substrate behavior.
- `overrideEditor` remains the behavior-wrapping path.
- `editor.api` is for reads/services; `editor.update` and tx groups are for mutations.
- Browser/visual proof is N/A for this packet because no rendered behavior changed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm turbo typecheck ...` failed in math with TS2589 | 2 | Use direct update method instead of callback where inference is not under test. | `BaseInlineEquationPlugin.spec.ts` now uses `editor.update.moveSelection`; tx inference test remains inferred. |
| `pnpm turbo typecheck ...` failed in list-classic | 1 | Type parser callback and use current plugin-array generic inference. | `BaseListPlugin.ts` and `BaseTodoListPlugin.spec.ts` patched. |
| `pnpm turbo typecheck ...` failed in table | 2 | Pin the correct `toPlatePlugin<TableConfig>` overload. | `TablePlugin.tsx` patched. |
| `pnpm check:core` failed formatter | 1 | Apply formatter-compatible wrapping. | `createPlateRuntimeEditor.ts` type field wrapped. |

Verification evidence:
- `pnpm brl` -> pass.
- `pnpm test:types` -> pass.
- `pnpm --filter @platejs/core exec bun test --preload ../../config/plite-source-test-setup.ts ./src/react/editor/createPlateRuntimeEditor.spec.ts ./src/react/plugin/createPlatePlugin.spec.ts ./src/lib/editor/withPlite.spec.ts ./src/lib/plugin/createBasePlugin.spec.ts ./src/lib/plugin/getBasePlugin.spec.ts` -> 152 pass.
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/ai --filter=./packages/math --filter=./packages/list-classic --filter=./packages/suggestion --filter=./packages/table` -> pass.
- `pnpm --filter @platejs/core build` -> pass.
- `pnpm --filter @platejs/math exec bun test --preload ../../config/plite-source-test-setup.ts ./src/lib/BaseInlineEquationPlugin.spec.ts` -> 4 pass.
- `pnpm --filter @platejs/list-classic exec bun test --preload ../../config/plite-source-test-setup.ts ./src/lib/BaseTodoListPlugin.spec.ts` -> 5 pass.
- `pnpm --filter @platejs/table typecheck` -> pass.
- `pnpm check:core` -> pass.
- `rg -n '\bextendEditor\b|\beditorExtensions\b' packages/core/src packages/core/type-tests packages/ai/src packages/math/src packages/list-classic/src packages/suggestion/src packages/table/src content/docs/api 'content/docs/(guides)' content/docs/plite --glob '!**/dist/**' --glob '!**/CHANGELOG.md'` -> no matches.
- `rg -n '\bwithPlateHistory\b|\bwithCurrentRuntimeHistory\b|\bwithPlateReact\b' packages/core/src packages/core/type-tests packages/ai/src packages/math/src packages/list-classic/src packages/suggestion/src packages/table/src --glob '!**/dist/**' --glob '!**/CHANGELOG.md'` -> no matches.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-plate-plugin-extensions-api-cleanup.md` -> pass.
- Browser docs proof: `PORT=3002 pnpm --filter www dev`; `http://localhost:3002/docs/plugin` renders `Install Plite Extensions`, has no exact rendered `extendEditor` or `editorExtensions`, and has no console errors.

Final handoff contract:
- Goal plan: docs/plans/2026-06-26-plate-plugin-extensions-api-cleanup.md
- Lane: shared editor.
- Surface and route/package: Plate plugin API in Core plus direct caller packages.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop, no minimum runtime, 1 loop.
- Behavior gates and visual proof: N/A, no rendered behavior changed.
- Primary metric baseline/latest/best and stop reason: package/API proof passed; no perf metric in scope.
- Bugs fixed and oracles added: single-extension merge/install bug fixed; type contracts added for `extensions`.
- Benchmark/skill/docs repairs: docs repaired; no benchmark/skill changes.
- Workflow slowdowns and repairs: typecheck passes exposed real package issues; no workflow repair needed.
- Changed list: see Changed list table.
- Needs your attention: public field shape and optional autoreview before commit.
- Stopping checkpoints to unblock: none.
- Accepted deferrals and residual risks: no browser proof or autoreview in this packet; both are intentionally out of scope unless preparing commit/release.
- Next owner: continue Plate v2 core/package boundary migration.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff checkpoint. |
| Where am I going? | Run autogoal completion checker, then close the active goal. |
| What is the goal? | Public Plate plugins use `extensions`; dead extension fields are cut; Core/Plite proof passes. |
| What have I learned? | `extensions` needed a merge rule; downstream package typecheck is necessary for this API change. |
| What have I done? | Implemented the API hard cut, docs update, type contracts, downstream type fixes, and proof runs. |
| What changed in the checkpoint plan? | Initial seed rows were narrowed to API/package/docs proof and N/A rows for browser/mobile/perf behavior. |

Timeline:
- 2026-06-26T19:24:32.995Z Goal plan created.
- 2026-06-26T19:35Z `extensions` API hard cut implemented.
- 2026-06-26T19:45Z stale docs patched.
- 2026-06-26T19:58Z touched package typecheck failures fixed.
- 2026-06-26T20:05Z `pnpm check:core` passed.
- 2026-06-26T20:06Z autogoal completion checker passed.
- 2026-06-26T20:08Z Browser docs proof passed for `/docs/plugin`.

Open risks:
- `autoreview` was not run in this packet; run it before commit if this is going straight to review.
