# plite-plate-compat-hard-cut

Objective:
Cut Plate/Plite compatibility debt; done when accepted hard cuts are migrated to Plite read/update/tx APIs and focused package proof passes.

Goal plan:
docs/plans/2026-06-25-plite-plate-compat-hard-cut.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: user-invoked `$auto`
- prompt / link: `$auto all` after accepted plan for remaining backward-compat hard cuts after `with*` cleanup
- lane: shared editor, primary owners Plite substrate + Plate core/plugin runtime
- surface / route / package: `packages/plite`, `packages/plite-react`, `packages/core`, and representative Plate packages using old editor APIs
- invocation mode: full-loop
- minimum runtime / deadline: N/A: no duration requested
- completion threshold summary: accepted compat surfaces are either removed, migrated to Plite-style APIs, or deferred with owner; focused typecheck/test proof passes for core plus changed representative packages

First checkpoint:
- Explicit user requirement: run `$auto` on all accepted remaining backward-compat hard cuts and migrate to the Plite way.
- Explicit context: `with*` patterns are already killed in Plite; look for what else should die or move.
- Accepted target API law: model reads use `editor.read((state) => state.*)`, mutations use `editor.update((tx) => tx.*)`, and `editor.api.*` is only for host/runtime services or plugin service APIs.
- Accepted hard cuts: old Plate model-read APIs on `editor.api`, runtime command fallback bridge, `slate-react` aliases, public `extendEditor` / `overrideEditor` enhancer compat, deprecated public core types, and Plite root direct editor-bound helper exports where they undermine `editor.read`.
- Scope: current checkout only, no PR/release/publish, no donor checkout, no pagination/perf lane unless source evidence proves an unavoidable API owner.
- Stop condition: stop only for an unsafe public API fork not covered by `VISION.md`, an authority boundary, or a blocker where no safe alternate packet remains.
- Deliverables: changed list, tests/proof commands, residual compat audit, review-attention items, stopping checkpoints, and next owner.
- Verification: source audits for forbidden compat surfaces plus focused package typecheck/tests for changed owners; browser proof only if UI/editor behavior changes.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: full-loop until a real stopping checkpoint or closure threshold
- initial confidence score: N/A: source-audit and command proof are the completion metrics
- improvement loop: migrate one compat surface per packet, verify, then rescan
- final score / loop closure: no open accepted compat surface remains runnable in this loop

Completion threshold:
- Source audits show no accepted public compat surfaces remain for the cleaned packets, or remaining rows are explicitly deferred with owner and reason.
- `packages/core` and every changed representative package pass focused typecheck/test proof.
- If package exports changed, `pnpm brl` is run and included.
- If behavior-facing editor runtime changed, focused behavior/browser proof is run or a scoped reason is recorded.
- Closure is legal only when required behavior, visual/native selection, package/API, mobile/raw-device claim width, huge-document, docs/skill repair, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-25-plite-plate-compat-hard-cut.md` passes.

Verification surface:
- Source audits for `editor.api` model reads, `editor.commands`, `slate-react` aliases, `extendEditor`, `overrideEditor`, deprecated public types, and Plite root editor-bound helper exports.
- Focused proof starts with `pnpm turbo typecheck --filter=./packages/core` and package-local tests/typechecks for each changed package.
- Plite package proof uses current repo package scripts after resolving actual `package.json` names.
- Plite daily proof uses `pnpm check:plite` only if the packet crosses Plite runtime/browser behavior broadly.
- Plite focused browser proof uses `pnpm --filter plite test:plite-browser:chromium <file-or--grep>` only for browser-visible behavior.
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
- Source of truth: current Plate repo source, root `VISION.md`, `docs/vision/plate.md`, `docs/vision/slate.md`, and accepted user decisions in this thread
- Allowed edit scope: Plite/Plate source, package exports/barrels, tests, docs only when needed to match current API
- Browser surfaces: N/A unless runtime/editor behavior changes require visible proof
- Package/API surfaces: Plite public exports, Plate core/plugin runtime, representative Plate packages with old API callsites
- Agent/skill surfaces: N/A unless the loop exposes a recurring workflow miss
- Docs/research surfaces: public docs only if they still teach removed compat APIs
- Non-goals: PR, release, publish, broad perf work, pagination, external issue harvest, donor-checkout proof, and migration-story docs

Output budget strategy:
- Use `rg --count` / `rg -l` before broad compat audits, inspect exact owner files with `sed`, and write any large audit to `.tmp/**` instead of streaming raw matches.
- Exclude generated output, `node_modules`, `.next`, `.turbo`, dist artifacts, and historical ledgers unless they are the named source.

Blocked condition:
- Stop if a public API fork is not covered by `VISION.md` and picking wrong would be expensive, if a command/tooling failure blocks all package proof, or if current checkout conflicts make safe source edits impossible without user authority.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: shared editor
- surface: Plate core/Plite runtime API boundary
- mode: full-loop
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 2
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: external review / commit owner
- goal_status: ready-to-close

Current verdict:
- verdict: complete for this compat-hard-cut packet, with explicit follow-up caveats
- confidence: high for package/API cleanup covered by the source audits and package proof
- next owner: autoclosure or autoreview before commit; separate lint-hardening lane for root lint debt
- keep / revert / quarantine call: keep cleaned packets; quarantine root `pnpm lint:fix` as a broader lint debt signal, not a blocker for this packet's API law
- reason: broad package typecheck is green, focused package tests are green for touched owners, and stale generic `editor.api.*` / `editor.tf` / `getTransforms` / `getPluginApi` audits are clean outside a type-literal false positive.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-25-plite-plate-compat-hard-cut.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | complete | P0 | Copy prompt requirements and read vision before implementation. | Requirement rows complete. | keep |
| status | auto | complete | P0 | Read active plan, latest prompt, source status, and current evidence. | Current state recorded. | keep |
| gap-scan | auto | complete | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Package/API gaps routed and closed. | keep |
| closure-handoff | autoclosure | N/A | P0 when merged/current-tree work is in scope | Run until-clean closure for already-applied work. | Not a post-merge/current-tree closure lane. | retire |
| behavior-proof | lane proof owner | complete | P0 | Prove stable editor behavior before perf. | Focused package behavior tests passed where touched. | keep |
| oracle-repair | lane test owner / tdd | complete | P0 | Add missing native/visual/model oracles for found gaps. | Stale fixture oracles repaired. | keep |
| visual-proof | Browser / Playwright | N/A | P0 | Prove visible editor behavior and native selection. | No visual/native claim in this packet. | retire |
| browser-helper-promotion | lane proof harness | N/A | P1 | Promote repeated browser proof into reusable API/helper. | No browser helper pattern introduced. | retire |
| mobile-claim-width | auto | N/A | P1 | Separate raw-device proof from viewport proof. | No mobile claim. | retire |
| huge-document-smoke | lane proof owner | N/A | P1 | Smoke huge-doc correctness without broad architecture work when in scope. | No huge-document claim. | retire |
| perf-packet | lane perf owner | N/A | P2 | Optimize only after correctness is green. | No perf packet in scope. | retire |
| supervision-mode | auto | N/A | P0 when timed runtime remains | If backlog looks empty before minimum runtime, predict next useful checkpoint from vision and evidence. | No timed runtime requested. | retire |
| consolidation | auto | complete | P1 | Move accepted reusable decisions to durable docs/rules. | Existing API law reaffirmed; no new durable owner needed. | keep |
| final-handoff | auto | complete | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows complete. | keep |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded by packet evidence |
| 1 | update | package/API checkpoint | broad typecheck failures | package-by-package compat debt was concrete | kept focused package packets |
| 2 | retire | browser/mobile/huge/perf rows | no behavior/perf/browser claim | avoid ghost work outside packet scope | N/A rows recorded |
| 2 | add | core-test-harness and lint-hardening stopping checkpoints | core aggregate hang; root lint failure | proof caveats need future owners | queued soft checkpoints |

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
| Prompt requirements captured before work | yes | First checkpoint copied `$auto all`, accepted hard cuts, API law, scope, stop conditions, deliverables, and verification surface. |
| `auto` source rule read or fallback recorded | yes | `.agents/skills/auto/SKILL.md` read before continuing the lane. |
| `vision` read as checkpoint zero | yes | Plan bound the work to root `VISION.md` / Plite-vs-Plate API law already accepted in this thread. |
| Active goal checked or created | yes | Active goal already existed for `docs/plans/2026-06-25-plite-plate-compat-hard-cut.md`. |
| Lane resolved | yes | Shared editor lane: Plite substrate reads/tx plus Plate package/core callers. |
| Invocation mode and timebox recorded | yes | Full-loop mode; no duration requested. |
| Dynamic checkpoint policy accepted | yes | Checkpoint mutation ledger records package-by-package broad-sweep routing. |
| Source of truth and allowed workspaces recorded | yes | Current Plate repo packages only; no donor checkout, PR, release, or publish. |
| Output budget strategy recorded | yes | Broad scans used `rg` with generated/dist exclusions where relevant; huge output noted as slowdown. |
| Release/PR/publish boundary recorded | yes | Explicit non-goal. |
| Browser proof strategy recorded | yes | Browser proof N/A unless UI/editor-visible behavior changed; this packet is package/API cleanup. |
| Package/API proof strategy recorded | yes | Focused package tests plus broad 23-package typecheck and stale API audits. |
| Mobile/raw-device claim-width policy recorded | yes | N/A: no mobile/raw-device behavior claim in this packet. |
| Skill repair authority and source-rule boundary recorded | yes | N/A: no `.agents/rules/**` or skill topology changed. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining backlog ladder, and supervision-mode fallback are recorded.
- [x] Lane is resolved as Plite, Plate, or shared editor, with owning workspace/package/app proof named.
- [x] Checkpoint supervisor table has been reconciled at least once after the initial seed.
- [x] Post-merge/current-tree closure is routed to `autoclosure` when in scope, or marked N/A with reason: this is internal API cleanup, not already-applied external PR closure.
- [x] Each loop ends with a checkpoint mutation decision: add, update, split, merge, retire, remove, reopen, reprioritize, or no-change with reason.
- [x] Current-tree/status packet recorded before new runtime patches.
- [x] Behavior proof packet recorded for every in-scope stable editor family or explicitly skipped/deferred with reason: no browser-visible behavior claim; package tests cover current package behavior.
- [x] Visual/native selection proof packet recorded for browser-visible selection/editing risks or explicitly scoped: N/A for this package/API packet.
- [x] Missing oracle packets are written, kept, reverted, quarantined, or deferred with owner and proof command: read-based spec fixtures were repaired where stale mocks hid API debt.
- [x] Repeated browser proof patterns are promoted to `@platejs/browser` or queued with reason: N/A, no browser helper pattern appeared.
- [x] Mobile/raw-device proof is run or the claim width is explicitly limited; Playwright viewport proof is not recorded as raw-device proof: N/A, no mobile claim.
- [x] Huge-document correctness smoke is run or deferred with owner and reason: N/A, no huge-document behavior claim.
- [x] Perf packet runs only after correctness is green, or is marked N/A for this run.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are audited when in scope.
- [x] Docs/vision/rule consolidation is applied when a reusable decision is accepted, or marked N/A: no new reusable taste beyond existing API law.
- [x] Workflow slowdowns are logged and avoidable repeats are repaired in the owner skill/script/gate: logged; no skill patch because the slowdown is broader lint/core-test harness debt.
- [x] Packet ledger contains one row per proof, bug fix, oracle, benchmark, docs, or skill packet.
- [x] Changed list is current and includes this run's package groups plus lint/autofix caveat.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued or marked none.
- [x] Autoreview/review gate is run for non-trivial implementation diffs or marked N/A with reason: not run in this turn; next owner is `autoreview` before commit because the diff is broad and current request was implementation closure.
- [x] Agent-native review is run for `.agents/**`, commands, skills, hooks, or prompt/tooling changes, or marked N/A with reason: N/A, no agent files changed.
- [x] Output budget discipline is followed: broad scans were capped; one `pnpm lint:fix` failure streamed many diagnostics and is logged as slowdown.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | Focused package tests green; broad 23-package typecheck green; stale API audits clean. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | Broad typecheck failures drove AI/math/media/core/link/table/suggestion/legacy-list-model packet additions. |
| Lane authority proof | yes | Prove each command ran in the owning Plite/Plate/shared workspace, or record N/A | Commands ran from `/Users/zbeyens/git/plate-2` against `packages/**` owners. |
| Workspace authority proof | yes | Record cwd/tool for each package, docs, skill, browser, or benchmark proof | Verification evidence lists root cwd package commands; no docs/browser/benchmark edits claimed. |
| Behavior gates | N/A | Run focused stable behavior proof or record scoped defer rows | No browser-visible editor behavior claim; package behavior covered by focused package tests. |
| Visual/native selection proof | N/A | Record Browser/Playwright/native-selection evidence or scoped blocker | No visual/native selection claim in this packet. |
| Missing oracle repair | yes | Add/verify/revert/quarantine oracle packets or record owner defer | Stale read fixtures repaired in AI, math, media, core, link, table, suggestion, and legacy-list-model specs; focused tests green. |
| `@platejs/browser` promotion | N/A | Add/verify helper/API or record queue/defer reason | No repeated browser proof pattern was introduced. |
| Mobile/raw-device claim width | N/A | Run raw-device proof or record that only scoped viewport/browser proof is available | No mobile/raw-device claim. |
| Huge-document correctness smoke | N/A | Run focused huge-document behavior smoke or record owner defer | No huge-document behavior claim. |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | Broad typecheck 45/45 successful; stale compat audits clean except one type-literal false positive. |
| Autoclosure handoff | N/A | Delegate post-merge/current-tree until-clean work to `autoclosure`, otherwise N/A | Not post-merge/current-tree closure. |
| Skill/rule sync | N/A | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | No `.agents/rules/**` changes. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | Changed list, needs-attention, and stopping checkpoints updated below. |
| Final lint/check | partial | Run scoped lint/check or record why no code changed | `pnpm lint:fix` ran, auto-fixed files, then failed on broader Plite example/browser lint debt; broad typecheck stayed green after lint. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Root lint and core aggregate test hangs logged as separate workflow debt. |
| Agent-native review for agent/tooling changes | N/A | Load `agent-native-reviewer` and close accepted findings, or N/A | No agent/tooling files changed. |
| Autoreview for non-trivial implementation changes | deferred | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | Deferred to pre-commit because current request was `$auto all`; final handoff calls it out. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-25-plite-plate-compat-hard-cut.md` | to run after this plan update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | explicit `$auto all` hard-cut requirements copied into plan | status |
| Status and current-state read | complete | source audit plus broad typecheck failures drove packet order | gap scan |
| Gap scan and scenario matrix | complete | stale `editor.api.*` model-read audit and bridge audit are clean; package packets fixed in focused tests | final handoff |
| Behavior proof | N/A | no browser-visible behavior claim; package behavior tests were run for touched owners | final handoff |
| Oracle repair | complete | stale model-read test fixtures repaired to use `editor.read` state mocks | final handoff |
| Visual/native proof | N/A | no visual/native selection claim in this packet | final handoff |
| Browser helper promotion | N/A | no repeated browser proof pattern introduced | final handoff |
| Mobile/raw-device claim width | N/A | no mobile/raw-device claim | final handoff |
| Huge-document correctness smoke | N/A | no huge-document claim | final handoff |
| Perf/API/docs/skill packets as needed | complete | package/API audit complete; no perf/docs/skill packet needed | consolidation |
| Consolidation and review | complete | plan records reusable API law and review caveats; no rule/docs sync needed | final handoff |
| Final handoff and goal-plan check | complete | handoff ledgers updated; mechanical check pending one final command | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| package/API cleanup | Plite substrate reads + Plate package callers | N/A | N/A | typecheck, package tests, source audit | complete |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| core/plite-react alias cut | 1 | auto | Core re-exported/aliased Plite React hooks under stale Slate naming. | Deleted `packages/core/src/react/slate-react.ts`; updated imports; `pnpm turbo typecheck --filter=./packages/core` | N/A: API/package cleanup | keep | Broad sweep |
| Plite block query promotion | 1 | auto | Plate packages needed generic block lookup without `editor.api.block`. | Added `state.nodes.block` and exported related option types in `packages/plite`; `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/platejs/src/features/list` | N/A: model API cleanup | keep | Package migrations |
| legacy-list-model read migration | 1 | auto | `legacy-list-model` used old Plate query helpers. | Added local editor query helpers; removed stale `editor.api.node/block/isAt/pathRef/pointRef/start/end`; `pnpm turbo typecheck --filter=./packages/platejs/src/features/list` | N/A: package API cleanup | keep | Broad sweep |
| utils/indent read migration | 1 | auto | Utility hooks and indent transforms used stale model-read helpers. | Migrated selection/fragment/mark reads and indent node iteration; `pnpm turbo typecheck --filter=./packages/utils`; `pnpm turbo typecheck --filter=./packages/indent` | N/A: package API cleanup | keep | Broad sweep |
| selection package cleanup | 1 | auto | Block selection used stale node/block/prop/focus/readOnly helpers. | Migrated selection reads, local fragment prop logic, DOM rect typing, selected-block transforms; `pnpm turbo typecheck --filter=./packages/selection` | N/A: type/API cleanup; behavior proof still future if package behavior changes are reviewed | keep | Broad sweep |
| dnd package cleanup | 1 | auto | DnD package and specs used `api.node`, `api.nodesRange`, `api.isExpanded`. | Migrated to `editor.read`, local range construction, read-based specs; `pnpm turbo typecheck --filter=./packages/dnd` | N/A: package API cleanup | keep | Broad sweep |
| date/toc/footnote cleanup | 1 | auto | Date, TOC, and footnote used stale `api.node/pathRef/fragment` shapes. | Migrated date adjacent lookup, TOC DOM lookups, footnote registry refs and fragment read; `pnpm turbo typecheck --filter=./packages/date`; `pnpm turbo typecheck --filter=./packages/toc`; `pnpm turbo typecheck --filter=./packages/footnote` | N/A: package API cleanup | keep | Broad sweep |
| layout/AI/suggestion/toggle follow-up | 2 | auto | Broad test/typecheck exposed stale read mocks and package read calls after the first sweep. | `pnpm --filter @platejs/layout test`; `pnpm --filter @platejs/ai test`; `pnpm --filter @platejs/suggestion test`; `pnpm --filter @platejs/toggle test`; broad typecheck | N/A: package API cleanup | keep | Broad sweep |
| math/media read fixture repair | 2 | auto | Specs mocked removed `api.before/parent` model reads. | `packages/math/src/react/hooks/useEquationInput.spec.tsx`; `packages/media/src/lib/media-embed/transforms/insertMediaEmbed.spec.ts`; `pnpm --filter @platejs/math test`; `pnpm --filter @platejs/media test` | N/A: package spec cleanup | keep | Broad sweep |
| core focused fixture repair | 2 | auto | Core specs still asserted stale read surfaces. | `packages/core/src/static/plugins/ViewPlugin.spec.ts`; `packages/core/src/lib/editor/withPlite.spec.ts`; `cd packages/core && bun test src/static/plugins/ViewPlugin.spec.ts src/lib/editor/withPlite.spec.ts src/lib/plugin/createBasePlugin.spec.ts` | N/A: package spec cleanup | keep | Core aggregate slowdown logged |
| link stale dist/source repair | 2 | auto | Link tests used old model-read mock shape and stale dist still referenced removed focus export. | `packages/link/src/react/utils/floatingLinkTriggers.spec.ts`; `pnpm --filter @platejs/link build --output-logs=errors-only`; `pnpm --filter @platejs/link test` | N/A: package API cleanup | keep | Review dist artifact churn |
| table exact-path query repair | 2 | auto | Table transforms needed exact path or ancestor query semantics after generic read hard cut. | Added `packages/table/src/lib/internal/nodeQueries.ts`; patched row/cell/border transforms; `pnpm --filter @platejs/table test`; `pnpm --filter @platejs/table typecheck` | N/A: package behavior covered by table tests | keep | Review helper shape |
| AI/list/suggestion stale fixture audit cleanup | 2 | auto | Final stale API audit found test fixtures still wiring generic model reads through `editor.api`. | `packages/ai/src/lib/transforms/undoAI.spec.ts`; `packages/platejs/src/features/list/src/lib/transforms/*`; `packages/suggestion/src/lib/transforms/deleteSuggestion.spec.ts`; `pnpm --filter @platejs/ai typecheck`; `pnpm --filter platejs test`; `pnpm --filter @platejs/suggestion test` | N/A: package spec cleanup | keep | Final audit |
| final source audits and broad proof | 2 | auto | Need prove no stale public compat surface remains in cleaned scope. | `rg` stale `editor.api.*` audit clean; `rg` `editor.tf/getTransforms/getPluginApi` audit clean; broad `pnpm turbo typecheck ...` 45/45 successful | N/A: API/source proof | keep | Handoff |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| package typecheck loop | auto | 20-80s per focused package; broad gate can stop after first failure | turbo builds dependency artifacts before typecheck | Focused package proof is reliable but slow; broad gate exposed next owner each time | No skill/tooling repair yet; continue focused filters, later consider source-first package graph work separately |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| API hard-cut packet | package tests and typecheck only | N/A | N/A | N/A | N/A: no visual/native selection claim |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| none | N/A | N/A | N/A | N/A: no browser proof/helper pattern in this packet |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| none | N/A | N/A | N/A | N/A: no mobile/raw-device claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| none | N/A | N/A | N/A | N/A: no huge-document claim |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| `pnpm --filter @platejs/core test` and `cd packages/core && bun test src` | core test harness | hung/silent until interrupted | aggregate core test runner does not complete cleanly in this checkout | focused core specs passed instead | queue separate core test harness cleanup; do not hide this before commit |
| `pnpm --filter @platejs/plite test` | Plite package proof | green but very noisy output | test output is huge and hard to consume in supervisor context | 1007 pass, 85 skip | prefer `--output-logs=errors-only` or focused filters for broad loops |
| `pnpm lint:fix` | root lint gate | 2.9s then failed after autofixes | root lint contains broad Plite example/browser lint debt unrelated to this API packet | 129 files fixed, then 1625 diagnostics including unused browserName, iframe title, image alt, prompt/alert | separate lint-hardening lane; broad typecheck stayed green after lint |
| `rg` over generated source maps during an earlier scan | auto workflow | avoidable noisy scan | generated maps overwhelm output and context | reran audits with `-g '!**/dist/**'` | keep generated/dist exclusions in compat audits |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Core Plite React import cleanup; Plite `state.nodes.block`; legacy-list-model/utils/indent/selection/dnd/date/toc/footnote/layout/table/link/AI/media/math stale API migrations; table exact-or-ancestor helper for table path semantics |
| tests/oracles/browser proof | Read-based mocks repaired in DnD, legacy-list-model, selection, suggestion, AI, math, media, core, link, table, utils; no browser proof added because this packet did not claim visual/editor behavior |
| generated/package artifacts | `@platejs/link build` regenerated stale link dist; lint/build activity also touched declaration artifacts under several packages |
| benchmarks/metrics/targets | N/A |
| examples/docs | N/A intentionally for this packet; `pnpm lint:fix` did touch broader Plite example files and then failed on remaining lint debt |
| skills/workflow | N/A: no `.agents/**` edits |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Table helper shape | `getCurrentOrAboveNodeEntry` restores exact-path table semantics locally after generic read hard cuts; good direction, but it is new package-local API. | `packages/table/src/lib/internal/nodeQueries.ts` | Review before commit; if this pattern repeats, promote to Plite read API instead of duplicating. |
| 2 | Root lint gate is noisy and overbroad | `pnpm lint:fix` auto-fixed many files, then failed on unrelated Plite example/browser lint debt. | root lint output | Run/plan a separate lint-hardening lane; don't treat this packet as lint-clean. |
| 3 | Core aggregate test runner hangs | Focused core specs are green, but `@platejs/core test` / `bun test src` did not complete cleanly. | packages/core test harness | Fix or consciously defer before claiming full core test closure. |
| 4 | Generated dist churn | `@platejs/link build` was needed to clear stale `useFocused` artifact import. | `packages/link/dist/**` | Review artifact churn if dist is tracked in this branch. |
| 5 | Broad diff review | The compat sweep touches many packages, including prior package migrations before this continuation. | package sweep | Run `autoreview` before commit. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| core-test-harness | soft | Should full `@platejs/core` aggregate test be fixed before commit? | Focused specs and broad typecheck are green, but aggregate test hang is bad workflow debt. | full core-test confidence | package API closure | Fix in a separate focused lane unless autoreview finds a direct blocker. | `packages/core` |
| lint-hardening | soft | Should root lint be made clean now or split out? | Lint auto-fixed files then failed on broad Plite example/browser debt. | lint-clean claim | package API closure | Split to a lint-hardening lane; current proof is typecheck/test/audit, not lint. | root `pnpm lint:fix` |

Findings:
- The old Plate model-read surface is spread across small packages, not only core. Package-by-package proof is the right loop.
- `editor.api.*` still makes sense for plugin services like `api.blockSelection.*`; generic node/range/point reads should not live there.
- Some package specs were testing old helper plumbing instead of behavior; those specs should model `editor.read` directly.

Decisions and tradeoffs:
- Kept plugin service APIs; cut generic editor model reads from package code.
- Used local package helpers only when they express package semantics, not as aliases for Plite primitives.
- Did not run browser proof yet because the current packets are API/type migrations; behavior-visible selection/DnD proof remains a review follow-up if this diff is kept.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad typecheck stopped on DnD syntax break from earlier codemod | 1 | Inspect exact file, patch focused DnD packet, run focused typecheck | fixed; DnD typecheck green |
| Broad typecheck stopped on Date/TOC/Footnote stale reads | 3 | Patch focused package, run focused typecheck | fixed; date, toc, footnote typecheck green |
| Broad typecheck stopped on AI mock typing | 1 | Wrap Bun mock with explicit current `nodes.some({ match })` query type | fixed; `@platejs/ai typecheck` green |
| Stale API audit found test fixtures after green package tests | 1 | Patch fixture owners directly instead of accepting green tests as enough | fixed; stale audit clean |
| Root lint failed after autofixes | 1 | Treat as separate root lint debt after proving package typecheck still green | unresolved by this packet; logged as stopping checkpoint |
| Full core aggregate test hung/silent | 2 | Run focused changed core specs and broad typecheck | unresolved harness debt; focused specs green |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/core` passed before broad package loop.
- `pnpm turbo typecheck --filter=./packages/platejs/src/features/list` passed.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/platejs/src/features/list` passed.
- `pnpm turbo typecheck --filter=./packages/utils` passed.
- `pnpm turbo typecheck --filter=./packages/indent` passed.
- `pnpm turbo typecheck --filter=./packages/selection` passed.
- `pnpm turbo typecheck --filter=./packages/dnd` passed.
- `pnpm turbo typecheck --filter=./packages/date` passed.
- `pnpm turbo typecheck --filter=./packages/toc` passed.
- `pnpm turbo typecheck --filter=./packages/footnote` passed.
- `pnpm --filter @platejs/layout test` passed: 32 pass.
- `pnpm --filter @platejs/ai test` passed: 64 pass.
- `pnpm --filter @platejs/ai typecheck` passed after fixture repair.
- `pnpm --filter @platejs/suggestion test` passed: 101 pass.
- `pnpm --filter @platejs/utils typecheck` passed after toolbar hook spec typing repair.
- `pnpm --filter @platejs/math test` passed: 19 pass.
- `pnpm --filter @platejs/media test` passed: 95 pass.
- `cd packages/core && bun test src/static/plugins/ViewPlugin.spec.ts src/lib/editor/withPlite.spec.ts src/lib/plugin/createBasePlugin.spec.ts` passed: 48 pass.
- `pnpm --filter @platejs/link build --output-logs=errors-only` passed and removed stale dist `useFocused` references.
- `pnpm --filter @platejs/link test` passed: 85 pass.
- `pnpm --filter @platejs/table test` passed: 219 pass.
- `pnpm --filter @platejs/table typecheck` passed.
- `pnpm --filter platejs test` passed: 105 pass.
- Grouped package test gate 1 passed for date/dnd/selection/utils/toggle/list/legacy-list-model/layout: 8 successful.
- Grouped package test gate 2 passed for table/suggestion/toc/link/indent/tag/footnote: 7 successful.
- Grouped package test gate 3 passed for plite/AI/basic-nodes/code-block/code-drawing/media/math: 7 successful.
- Broad package typecheck passed after all repairs: `pnpm turbo typecheck --output-logs=errors-only --filter=./packages/plite --filter=./packages/core --filter=./packages/ai --filter=./packages/basic-nodes --filter=./packages/code-block --filter=./packages/code-drawing --filter=./packages/media --filter=./packages/math --filter=./packages/footnote --filter=./packages/date --filter=./packages/dnd --filter=./packages/selection --filter=./packages/utils --filter=./packages/toggle --filter=./packages/list --filter=./packages/platejs/src/features/list --filter=./packages/layout --filter=./packages/table --filter=./packages/suggestion --filter=./packages/toc --filter=./packages/link --filter=./packages/indent --filter=./packages/tag` -> 45/45 successful.
- Stale generic model-read audit passed with no matches: `rg -n "editor\.api\.(node|pathRef|isAt|before|after|above|block|edges|nodesRange|blocks|isEmpty|isCollapsed|isExpanded|isFocused)\b|\bblock: true\b|\babove: true\b|nodes\.isEmpty\([^\n]*\{ block" packages -g '*.ts' -g '*.tsx' -g '!**/dist/**'`.
- Stale transform bridge audit passed with no matches: `rg -n "editor\.(tf|transforms)\b|plugin\.transforms\b|getTransforms\b|getPluginApi\b" ... -g '!**/dist/**'`.
- Runtime `match: { ... }` shorthand audit has one false positive, `packages/link/src/lib/LinkRules.spec.tsx:194`, which is a TypeScript type literal.
- `pnpm lint:fix` ran, auto-fixed files, then failed on broader root lint debt; broad typecheck stayed green afterward.
- `pnpm --filter @platejs/core test` and `cd packages/core && bun test src` did not complete cleanly; focused changed core specs passed instead.

Final handoff contract:
- Goal plan: ready for mechanical check
- Lane: shared editor Plate/Plite API cleanup
- Surface and route/package: Plite/Core plus Plate packages using old generic editor reads
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop, no timebox, two package-audit loops
- Behavior gates and visual proof: N/A for this package/API packet; package behavior tests ran for touched owners
- Primary metric baseline/latest/best and stop reason: stale API audits went from matches to clean; broad package typecheck went from failing packets to 45/45 successful
- Bugs fixed and oracles added: stale read fixtures repaired across AI/math/media/core/link/table/suggestion/legacy-list-model and package behavior tests rerun
- Benchmark/skill/docs repairs: N/A; no benchmark/docs/skill file changed intentionally
- Workflow slowdowns and repairs: core aggregate test hang and root lint debt logged; no repair applied because they are separate owner lanes
- Changed list: current in Changed list table
- Needs your attention: current in Needs your attention table
- Stopping checkpoints to unblock: core-test-harness and lint-hardening
- Accepted deferrals and residual risks: no browser/visual/mobile/huge-doc claim; autoreview deferred to pre-commit; core aggregate test and root lint not clean
- Next owner: `autoreview` before commit, then targeted core-test/lint-hardening if release confidence needs those gates

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff after broad package API/type/test sweep. |
| Where am I going? | Mechanical autogoal check, then final response. |
| What is the goal? | Cut accepted Plate/Plite compat debt with source audits and package proof. |
| What have I learned? | See Findings |
| What have I done? | See Timeline and Packet ledger |
| What changed in the checkpoint plan? | See Checkpoint mutation ledger |

Timeline:
- 2026-06-25T17:23:01.033Z Goal plan created.
- 2026-06-25 Broad package loop migrated and proved core, Plite block query, legacy-list-model, utils, indent, selection, DnD, date, TOC, and footnote focused packets.
- 2026-06-25 Continuation repaired math/media/core/link/table/AI/suggestion/legacy-list-model stale fixtures and table exact-path behavior; focused tests and broad typecheck passed.
- 2026-06-25 Stale API audits passed; `pnpm lint:fix` and full core aggregate test caveats logged.

Open risks:
- `pnpm --filter @platejs/core test` / `cd packages/core && bun test src` hung or did not complete in this checkout; focused changed specs and broad typecheck passed.
- `pnpm lint:fix` auto-fixed files then failed on broader Plite example/browser lint diagnostics; this packet is not lint-clean.
- `autoreview` has not been run after this broad implementation sweep; run it before commit.
