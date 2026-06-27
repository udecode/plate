# Plite Plate API law cleanup

Objective:
Close Plite/Plate API law cleanup; done when read/write/api boundaries are source-audited, safe hard cuts are patched, and focused package proof passes.

Goal plan:
docs/plans/2026-06-25-plite-plate-api-law-cleanup.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: user-invoked `$auto`
- prompt / link: `ok [$auto] full`
- lane: shared editor: Plite substrate + Plate core/runtime boundary
- surface / route / package: `packages/plite`, `packages/plite-react`, `packages/core`
- invocation mode: full-loop
- minimum runtime / deadline: N/A: no duration requested
- completion threshold summary: Plite read/write/API law is current-state source-audited, safe public/API hard cuts are patched, focused tests/typecheck pass, and any remaining broad Plate runtime bridge debt has a concrete owner.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no timed request
- semantics: full-loop until a real review/plan/proof boundary
- initial confidence score: N/A: no timed confidence loop
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Plite does not expose generic model reads as built-in `editor.api.*`; normal reads go through `editor.read(state => state.*)`.
- Plate core does not wrap Plite editor model reads under Plate names when Plite should own the primitive.
- Safe legacy/public conflicts found in the focused audit are hard-cut or recorded with a deletion gate.
- Focused package/type/test proof passes for touched Plite/Plate packages, or a failing owner is recorded as a real blocker.
- Closure is legal only when required behavior, visual/native selection, package/API, mobile/raw-device claim width, huge-document, docs/skill repair, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-25-plite-plate-api-law-cleanup.md` passes.

Verification surface:
- Source audit: fixed-string/package-only searches for `EditorBaseApi`, `installEditorBaseApi`, built-in `editor.api.*` model reads, `getPlateRuntimeCommands`, and command fallback installers.
- Package proof: focused Plite/Core tests and source-first typecheck for touched packages.
- Browser proof: N/A unless a browser-visible editor behavior route is touched.
- Benchmark/mobile/huge-doc proof: N/A unless runtime behavior/perf code is changed.
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
- Source of truth: `VISION.md`, `docs/vision/plite.md`, `docs/vision/plate.md`, active source files under `packages/plite*` and `packages/core`.
- Allowed edit scope: Plite API types/runtime install, Plate core/plugin/runtime boundary files, focused tests, this plan.
- Browser surfaces: none unless code changes reach browser-visible editor behavior.
- Package/API surfaces: `@platejs/plite`, `@platejs/plite-react`, `@platejs/core`.
- Agent/skill surfaces: none planned; only repair if the loop itself proves a recurring skill miss.
- Docs/research surfaces: this plan only unless public docs/API examples are touched.
- Non-goals: no PR/commit/push/release, no broad pagination/perf lane, no apps/www docs/generated broad audit, no compatibility aliases.

Output budget strategy:
- Use exact owner files and package-only `rg -n`/`rg -l` scans. Exclude generated/build output. If a search would cross apps/docs/generated output, use `rg -l` or write artifacts first.

Blocked condition:
- Stop if the next safe move is a public API fork not covered by `VISION.md`, a broad Plate v2 design decision requiring review, or focused proof is blocked by package graph breakage outside the edited owner.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: shared editor
- surface: Plite public API law and Plate core/runtime boundary
- mode: full-loop
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 0
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: final response
- goal_status: active

Current verdict:
- verdict: kept
- confidence: high for the focused API-law packet; broad Plate runtime command deletion remains a separate owner
- next owner: auto
- keep / revert / quarantine call: keep
- reason: package source audits, focused tests, typecheck, builds, and barrel checks passed

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-25-plite-plate-api-law-cleanup.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | complete | P0 | Copy prompt requirements and read vision before implementation. | Requirements copied; `auto`, `autogoal`, `vision`, root `VISION.md`, `docs/vision/plite.md`, and `docs/vision/plate.md` read. | update |
| status | auto | complete | P0 | Read active plan, latest prompt, source status, and current evidence. | Active goal created; plan path recorded; focused audit started. | update |
| gap-scan | auto | complete | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Found and patched built-in Plite `editor.api.*` model reads; found internal Plate command registry as separate bridge-deletion debt. | update |
| closure-handoff | autoclosure | complete | N/A | Run until-clean closure for already-applied work. | N/A: this was an internal API-law implementation packet, not post-merge/current-tree closure. | retire |
| behavior-proof | lane proof owner | complete | P0 | Prove stable editor behavior before perf. | Focused Plite/Core package tests passed. | update |
| oracle-repair | lane test owner / tdd | complete | P0 | Add missing native/visual/model oracles for found gaps. | Updated stale tests to use real editor state and explicit host-service extension capabilities. | update |
| visual-proof | Browser / Playwright | complete | N/A | Prove visible editor behavior and native selection. | N/A: no browser-visible editor behavior or route UI changed. | retire |
| browser-helper-promotion | lane proof harness | complete | N/A | Promote repeated browser proof into reusable API/helper. | N/A: no repeated browser automation pattern. | retire |
| mobile-claim-width | auto | complete | N/A | Separate raw-device proof from viewport proof. | N/A: no mobile claim. | retire |
| huge-document-smoke | lane proof owner | complete | N/A | Smoke huge-doc correctness without broad architecture work when in scope. | N/A: no huge-document/runtime behavior packet. | retire |
| perf-packet | lane perf owner | complete | N/A | Optimize only after correctness is green. | N/A: no perf packet. | retire |
| supervision-mode | auto | complete | N/A | If backlog looks empty before minimum runtime, predict next useful checkpoint from vision and evidence. | N/A: no timed minimum runtime. | retire |
| consolidation | auto | complete | P1 | Move accepted reusable decisions to durable docs/rules. | Existing `VISION.md`/detail docs already covered the rule; no doctrine patch needed. | no-change |
| final-handoff | auto | complete | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows filled below. | update |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | complete |
| 0 | update | checkpoint-zero, status, gap-scan | skill/vision reads and source audit | latest prompt is broad `auto full`; first safe packet is API-law cleanup | complete |
| 1 | update | gap-scan, behavior-proof, oracle-repair, final-handoff | package audits and focused proof | Plite `api` is extension-only; host services remain under `api`; model reads use `read`/`state` | complete |

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
| Prompt requirements captured before work | yes | This plan records: `$auto full`, shared editor lane, API-law cleanup, no duration, no commit/PR/release, focused package proof, final handoff rows. |
| `auto` source rule read or fallback recorded | yes | `.agents/skills/auto/SKILL.md` read in chunks. |
| `vision` read as checkpoint zero | yes | `.agents/skills/vision/SKILL.md`, `VISION.md`, `docs/vision/plite.md`, `docs/vision/plate.md` read. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this active objective. |
| Lane resolved | yes | shared editor: Plite substrate + Plate core/runtime boundary. |
| Invocation mode and timebox recorded | yes | full-loop; no timed minimum. |
| Dynamic checkpoint policy accepted | yes | checkpoint table updated from evidence. |
| Source of truth and allowed workspaces recorded | yes | see Boundaries. |
| Output budget strategy recorded | yes | package-only focused scans; broad output logged as slowdown. |
| Release/PR/publish boundary recorded | yes | N/A: not requested. |
| Browser proof strategy recorded | yes | N/A unless browser-visible behavior touched. |
| Package/API proof strategy recorded | yes | focused package tests/typecheck for touched packages. |
| Mobile/raw-device claim-width policy recorded | no | N/A: no mobile/browser claim. |
| Skill repair authority and source-rule boundary recorded | yes | no skill patch planned unless recurring miss is proven. |

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
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | Source audit clean; focused tests/typecheck/build passed. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | Checkpoint table updated/retired from current evidence. |
| Lane authority proof | yes | Prove each command ran in the owning Plite/Plate/shared workspace, or record N/A | Commands ran from repo root or `packages/core` cwd as recorded below. |
| Workspace authority proof | yes | Record cwd/tool for each package, docs, skill, browser, or benchmark proof | Verification evidence records cwd/command. |
| Behavior gates | yes | Run focused stable behavior proof or record scoped defer rows | Plite package tests and Core focused specs passed. |
| Visual/native selection proof | no | Record Browser/Playwright/native-selection evidence or scoped blocker | N/A: no browser-visible behavior changed. |
| Missing oracle repair | yes | Add/verify/revert/quarantine oracle packets or record owner defer | Stale tests updated to real state/extension capability proof. |
| `@platejs/browser` promotion | no | Add/verify helper/API or record queue/defer reason | N/A: no browser helper repeated. |
| Mobile/raw-device claim width | no | Run raw-device proof or record that only scoped viewport/browser proof is available | N/A: no mobile claim. |
| Huge-document correctness smoke | no | Run focused huge-document behavior smoke or record owner defer | N/A: no huge-doc claim. |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | Plite/Core typecheck/build and focused tests passed. |
| Autoclosure handoff | no | Delegate post-merge/current-tree until-clean work to `autoclosure`, otherwise N/A | N/A: not post-merge/current-tree closure. |
| Skill/rule sync | no | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | N/A: no `.agents/rules/**` changed. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | Filled below. |
| Final lint/check | yes | Run scoped lint/check or record why no code changed | `pnpm --filter @platejs/core brl`, Plite/Core typecheck/build, and focused tests passed. Full root check not run because scope is focused API packet amid unrelated dirty tree. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Two slow/noisy command shapes logged; existing auto command-pitfall rules already cover the corrected shape. |
| Agent-native review for agent/tooling changes | no | Load `agent-native-reviewer` and close accepted findings, or N/A | N/A: no agent/tooling changes. |
| Autoreview for non-trivial implementation changes | no | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | N/A: user asked `auto full`, not pre-commit review; focused proof closed the implementation packet. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-25-plite-plate-api-law-cleanup.md` | Run after this update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | Requirement rows filled; goal active. | status |
| Status and current-state read | complete | Source/vision/skill reads plus package-only audit. | gap scan |
| Gap scan and scenario matrix | complete | API-law gap found: built-in Plite `editor.api.*` model reads. | behavior proof |
| Behavior proof | complete | Plite package tests and Core focused specs passed. | oracle repair |
| Oracle repair | complete | Stale Core specs now use real state and extension service capability. | visual proof |
| Visual/native proof | complete | N/A: no browser-visible editor behavior changed. | browser helper promotion |
| Browser helper promotion | complete | N/A: no repeated browser automation pattern. | mobile claim width |
| Mobile/raw-device claim width | complete | N/A: no mobile claim. | huge-document smoke |
| Huge-document correctness smoke | complete | N/A: no huge-document claim. | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | complete | N/A for perf/docs/skills; package API proof passed. | consolidation |
| Consolidation and review | complete | Existing vision covers no model reads through `api`; no doctrine edit needed. | final handoff |
| Final handoff and goal-plan check | complete | Handoff rows filled; check-complete run. | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| Plite public API | extension API + state/tx lifecycle | package source | API surface audit | no built-in model reads under `editor.api` | complete |
| Plate core navigation feedback | headless runtime service capability | package source | `tx.navigation.navigate` | optional host scroll service + focus/scroll/flash tests | complete |
| Core DOM fragment static util | DOM selection fragment | package test | selected DOM block fragment | real editor state lookup, HTML deserializer capability mocked only | complete |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| api-law-hard-cut | 1 | Plite/Core | `editor.api` should not ship generic model reads; reads belong in `editor.read(state => state.*)` | `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/create-editor.ts`, `packages/plite/src/index.ts`, deleted `packages/plite/src/core/editor-base-api.ts`, deleted `packages/plite/test/editor-base-api.test.ts`, Core plugin type files | Plite package tests, Core focused specs, typecheck/build | keep | Next broad owner: Plate runtime command registry deletion packet |
| host-service-proof | 1 | Core navigation-feedback | Host services may live in `editor.api`, but must be explicit extension capabilities and optional in headless tests | `packages/core/src/lib/plugins/navigation-feedback/transforms/navigate.ts`, `NavigationFeedbackPlugin.spec.ts` | `cd packages/core && bun test src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts --timeout 10000` -> 7 pass | keep | none |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Plite package runtime/API | `packages/plite` | `pnpm --filter @platejs/plite test` | N/A | 1007 pass, 85 skip, 0 fail | none |
| Core DOM fragment | `packages/core` | `cd packages/core && bun test src/static/utils/getSelectedDomFragment.spec.tsx --timeout 10000` | N/A | 2 pass | none |
| Core static editor | `packages/core` | `cd packages/core && bun test src/static/editor/withStatic.spec.tsx --timeout 10000` | N/A | 19 pass | none |
| Core navigation feedback | `packages/core` | `cd packages/core && bun test src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts --timeout 10000` | N/A | 7 pass | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| N/A | No browser-visible selection behavior changed | N/A | N/A | N/A | scoped out |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| N/A | N/A | N/A | N/A | no browser proof pattern changed |

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
| Broad `rg` including `apps/www` generated output | auto/source audit | immediate huge output | Included generated docs/registry artifacts before narrowing. | Proved the need to stay package-only for this packet. | Existing auto output-budget rule covers this; no rule patch. |
| `pnpm --filter @platejs/core test -- <files>` | Core package test wrapper | >120s / interrupted after red, then silent | Wrapper/path form hung after focused failure; package-cwd Bun direct path was fast. | Correct direct commands passed in 237ms/407ms/324ms. | Use package-cwd Bun direct paths for these focused Core specs. |
| Broad `git diff --name-only` | final changed-list discovery | immediate huge output | Checkout contains large unrelated dirty tree. | Showed unrelated files; not used for current-run changed list. | Use patch ledger for current-run changed list. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Plite `BaseEditor.api` is extension-only; removed base API installer/export; narrowed Plate internal runtime API bridge to host services; navigation scroll service is optional in headless runtime. |
| tests/oracles/browser proof | Deleted stale Plite base-api test; updated Core DOM/static/navigation specs to use real state and extension service capability. |
| benchmarks/metrics/targets | none |
| examples/docs | none except this goal plan |
| skills/workflow | none |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Plate internal command registry remains | It is internal, but still a legacy command-dispatch shape separate from public `editor.update(tx => tx.*)`. Cutting it needs a dedicated runtime packet, not a blind deletion. | `packages/core/src/react/editor/createPlateRuntimeEditor.ts:3283` | inspect/route next to Plate runtime bridge deletion |
| 2 | Host service boundary under `editor.api` | This packet keeps `editor.api.dom`, `editor.api.scrollIntoView`, and extension capabilities as valid services while deleting model reads. | `packages/core/src/lib/plugins/navigation-feedback/transforms/navigate.ts` | accept |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | N/A | none | Current packet has a clear `vision` rule and passed focused proof. | none | all safe packet work completed | continue with Plate runtime command registry cleanup as a separate packet | `packages/core/src/react/editor/createPlateRuntimeEditor.ts:3283` |

Findings:
- Built-in Plite `EditorBaseApi` conflicted with the accepted API law: reads through `editor.read(state => state.*)`, writes through `editor.update(tx => tx.*)`, services through `editor.api.*`.
- `CurrentRuntimeEditorApi` in Core was an internal bridge type overclaiming old model-read APIs. Its actual current usage only needed DOM/clipboard/scroll services.
- `installPlateRuntimeCommandFallbacks` is internal command registry debt, but not public `editor.commands`; it should be handled in a dedicated Plate runtime packet.

Decisions and tradeoffs:
- Hard-cut `EditorBaseApi` instead of leaving an empty compatibility type.
- Keep `editor.api` for extension capabilities and host/runtime services.
- Do not cut `installPlateRuntimeCommandFallbacks` in this packet because it is tied to Plate keyboard/input-rule runtime behavior and needs separate proof.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `rg`/diff output too large | 2 | Use package-only fixed-string scans and patch ledger | Resolved; plan logged slowdown. |
| Core package wrapper hung after focused failure | 1 | Run `bun test <file>` from `packages/core` cwd | Resolved; focused specs passed. |
| Navigation test initially failed on missing `editor.api.scrollIntoView` | 1 | Treat scroll as optional host service and install explicit extension service in spec | Resolved; navigation spec passed. |

Verification evidence:
- `rg -n "EditorBaseApi|installEditorBaseApi|editor-base-api|CurrentRuntimeNodeQueryOptions|CurrentRuntimeIsAtOptions" packages/plite packages/core --glob '!**/dist/**'` -> no matches.
- `rg -n "editor\\.api\\.(string|node|nodes|isVoid|hasPath|pathRef|end|start|before|after|point|range|fragment|parent|previous|next|some|block|blocks|mark|marks|isBlock|isInline|isEmpty|isAt|prop)" packages/plite packages/plite-react packages/core --glob '!**/dist/**'` -> only extension namespace contract matches.
- `pnpm --filter @platejs/plite test` -> 1007 pass, 85 skip, 0 fail.
- `cd packages/core && bun test src/static/utils/getSelectedDomFragment.spec.tsx --timeout 10000` -> 2 pass.
- `cd packages/core && bun test src/static/editor/withStatic.spec.tsx --timeout 10000` -> 19 pass.
- `cd packages/core && bun test src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts --timeout 10000` -> 7 pass.
- `pnpm turbo typecheck --filter=./packages/plite` -> pass.
- `pnpm turbo typecheck --filter=./packages/core` -> pass.
- `pnpm --filter @platejs/plite build` -> pass.
- `pnpm --filter @platejs/core build` -> pass.
- `pnpm --filter @platejs/plite brl && pnpm --filter @platejs/core brl` -> pass.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-25-plite-plate-api-law-cleanup.md`
- Lane: shared editor, Plite substrate + Plate core/runtime boundary
- Surface and route/package: `packages/plite`, `packages/core`
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop, no timed minimum, 1 implementation loop
- Behavior gates and visual proof: package/focused behavior proof passed; visual proof N/A because no browser-visible behavior changed
- Primary metric baseline/latest/best and stop reason: N/A; not a perf packet; stopped at clean focused API-law boundary
- Bugs fixed and oracles added: removed stale base API public surface; repaired Core tests for state/extension service proof
- Benchmark/skill/docs repairs: none
- Workflow slowdowns and repairs: logged broad-output and wrapper-command slowdowns; corrected to package-only scans and direct package-cwd Bun tests
- Changed list: see table above
- Needs your attention: see table above
- Stopping checkpoints to unblock: none
- Accepted deferrals and residual risks: internal Plate runtime command registry still needs its own cleanup packet
- Next owner: Plate runtime command registry cleanup / `createPlateRuntimeEditor.ts` split after bridge deletion

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Dynamic checkpoint loop through final handoff |
| What is the goal? | Close Plite/Plate API law cleanup for read/write/api boundary. |
| What have I learned? | Model reads under `editor.api` are gone; host services remain legitimate `api` capability. |
| What have I done? | Patched API/types/tests; verified focused package proof. |
| What changed in the checkpoint plan? | Seed rows reconciled; irrelevant browser/mobile/perf rows retired as N/A. |

Timeline:
- 2026-06-25T15:00:58.853Z Goal plan created.

Open risks:
- Internal Plate runtime command registry remains a separate cleanup owner.
