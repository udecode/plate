# fix all ci tests

Objective:
Fix the repository CI test suite; done when fast and slow tests pass with zero failures/errors and focused owner proofs plus review close; plan docs/plans/2026-08-14-fix-all-ci-tests.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-14-fix-all-ci-tests.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: direct user instruction following a completed CI failure audit
- prompt / link: current Codex task; evidence in `docs/plans/2026-08-14-run-ci-tests.md`
- lane: Plate with shared Core/schema ownership where failures prove it
- surface / route / package: fast and slow test lanes across Markdown, AI, Core schema fixtures, table/list, media/math exports, and www registry tests
- invocation mode: full-loop
- minimum runtime / deadline: N/A: no duration requested
- completion threshold summary: `pnpm test:all` exits 0 after focused owner repairs; affected type/lint gates and P2 autoreview pass

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: full-loop runs until the test threshold is green
- initial confidence score: N/A: exact failing counts are the baseline
- improvement loop: diagnose one failure family, patch its owner, run focused proof, then rerun the nearest lane and reprioritize
- final score / loop closure: zero fast/slow failures and errors

Completion threshold:
- Fast baseline `2,872 pass / 43 fail / 34 errors` reaches zero failures/errors.
- Slow baseline `1,421 pass / 54 fail / 12 errors` plus isolated shard failures reaches zero failures/errors.
- `pnpm test:all` exits 0 after a clean reinstall has already ruled out environment corruption.
- Affected package/app typechecks and scoped lint pass; exact P2 autoreview has no accepted/actionable findings.
- Stale tests are migrated to current intended APIs instead of restoring removed aliases solely for compatibility.
- Closure is legal only when required behavior, visual/native selection, package/API, mobile/raw-device claim width, huge-document, docs/skill repair, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-fix-all-ci-tests.md` passes.

Verification surface:
- Focused Bun specs for each failure family using exact runnable paths.
- `pnpm test` after fast-family closure; `pnpm test:slow` after slow-family closure; final `pnpm test:all`.
- Affected package/app source-first typechecks and scoped Biome/lint.
- Browser proof only if a runtime UI/component change is required; test-only fixture/expectation repairs use N/A with source-backed reason.
- Exact P2 autoreview and final plan checker.
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
- Source of truth: live failing specs and current production descriptors/exports, with root and Plate Vision defining API ownership.
- Allowed edit scope: package/app source and tests necessary to close the reproduced fast/slow failures, generated barrels only when exports legitimately change, this plan, and required release metadata.
- Browser surfaces: N/A until diagnosis proves a runtime-visible component path changes; then use the smallest owning registry demo.
- Package/API surfaces: AI, Markdown, Core/schema fixtures, table, list, media, math, Plate React exports, and registry composition tests.
- Agent/skill surfaces: N/A unless the repair exposes a reusable workflow miss; edit source rules only, never generated skills directly.
- Docs/research surfaces: active goal plan only unless a durable public/API behavior change requires current-state docs or changeset.
- Non-goals: no compatibility aliases for deleted APIs, no unrelated refactor, no browser/perf/mobile/huge-document expansion, no commit/PR/push.

Output budget strategy:
- Reuse `/tmp/plate-ci-test*-2026-08-14.log`; extract unique failure owners/counts first; inspect exact source/spec slices; save broad rerun logs under `/tmp` and return bounded summaries.

Blocked condition:
- Stop only if current source and Vision leave an unsafe public API/runtime fork with two credible incompatible repairs after focused proof, or the same external/tool blocker repeats three times with no autonomous alternative.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: Plate/shared editor
- surface: repository fast and slow CI tests
- mode: full-loop
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: N/A: no timed minimum runtime
- current_loop: 8
- current_checkpoint: final-handoff
- current_checkpoint_status: completed
- next_checkpoint: none
- goal_status: ready for completion

Current verdict:
- verdict: source drift spans several ownership families; fix current callers/tests and real owners without resurrecting cut APIs
- confidence: high
- next owner: auto
- keep / revert / quarantine call: keep only packets whose focused tests and nearest lane pass
- reason: clean reinstall reproduced identical failures; live source and Vision outrank stale test imports/expectations

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-fix-all-ci-tests.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | completed | P0 | Copy prompt requirements and read vision before implementation. | Requirements, root/common/Plate Vision, auto/testing/autogoal read. | completed |
| status | auto | completed | P0 | Read active plan, latest prompt, source status, and current evidence. | Current failure families and source owners recorded; CI order proved from workflow/scripts. | completed |
| gap-scan | auto | completed | P0 | Split deterministic failures by actual owner and stale-test versus runtime regression. | Fresh full build and fast lane classify the remaining slow-only owners. | completed |
| closure-handoff | autoclosure | completed | N/A | Current user explicitly authorized active repair; this is not post-merge handoff. | N/A. | retired |
| behavior-proof | lane proof owner | completed | P0 | Prove each focused failure family, then fast/slow aggregate lanes. | Final `pnpm check`, focused www/Table/Plite tests, and www typecheck pass. | completed |
| oracle-repair | lane test owner / tdd | completed | P0 | Add missing oracles for found gaps. | Added playground fixture and named-root selection-cache regressions plus Core compile contracts. | completed |
| visual-proof | Browser | completed | P1 | Prove the runtime-visible playground repair. | `/blocks/playground`: one editable, callout rendered, zero runtime error dialogs. | completed |
| browser-helper-promotion | lane proof harness | completed | N/A | Promote repeated browser proof into reusable API/helper. | N/A: one route-level regression check; no repeated helper pattern. | retired |
| mobile-claim-width | auto | completed | N/A | No mobile claim. | N/A. | retired |
| huge-document-smoke | lane proof owner | completed | N/A | No huge-document claim. | N/A. | retired |
| perf-packet | lane perf owner | completed | N/A | Correctness-only CI repair. | N/A. | retired |
| supervision-mode | auto | completed | N/A | No timed runtime remained after the named threshold. | N/A. | retired |
| consolidation | auto | completed | P1 | Move accepted reusable decisions to durable docs/rules. | Existing changesets and Plate Next v75 doctrine cover the accepted public contracts; no extra skill mutation required. | completed |
| final-handoff | auto | completed | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Ledgers below are complete; final plan checker is the only remaining command. | completed |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed and reprioritize | checkpoint zero, status, gap scan, visual/mobile/huge/perf | prompt, prior CI ledger, Vision | exact test closure outranks unrelated proof families | status is active; unrelated families retired or conditional |
| 1 | update and reprioritize | status, gap scan, behavior proof | CI workflow, package scripts, root build, focused Code Block build | standalone tests were reading stale/missing package artifacts; declaration build is the first genuine CI blocker | Code Block declaration boundary repaired; resume full build before test triage |
| 2 | update | gap scan, behavior proof, consolidation | full build plus Core/Table/Suggestion focused builds | one persisted property key can be declared in several placements; rejecting the key made legal atomic/dynamic object patches impossible | Core accepts the union of declared values and true string-indexed patches; focused declarations pass; repair stale mutation doctrine before closeout |
| 3 | split and reprioritize | behavior proof | fresh `pnpm test:all` | fast lane is fully green; only slow families and isolated slow mocks remain | split slow fixture/API adoption from List/Table structural behavior; handle cheap stale callers first |
| 4 | update | behavior proof, visual proof | green aggregate suites plus Browser `/blocks/playground` | generated registry entry was stale locally, but source fixture and demo ownership had two genuine runtime gaps | keep source repairs; restore generated registry output unchanged |
| 5 | update | package/API proof | `www` typecheck and Core contracts | wrapper props used a public dependency-erased definition against an exact configured definition | preserve exact plugin context and widen only wrapped element identity |
| 6 | reopen and repair | review | P2 finding on `getCompiledSchemaPropertyId` | reflected access widened the public return type to `any` | validate reflection, declare `string`, rebuild, regenerate API manifest |
| 7 | add oracle | Table named-root cache | reviewer concern plus snapshot-cache source audit | Plite snapshots are cached per root and own distinct indexes | keep index-keyed cache and add alternating-root regression proof |
| 8 | close | all checkpoints | final CI, www gate, Browser proof, and clean P2 autoreview | named threshold and every applicable proof row are satisfied | ready for goal checker |

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
| Prompt requirements captured before work | yes | Fix every reproduced CI test failure; stop only at zero fast/slow failures or a real blocker; no narrower partial claim. |
| `auto` source rule read or fallback recorded | yes | Loaded complete generated auto skill. |
| `vision` read as checkpoint zero | yes | Read root `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md`. |
| Active goal checked or created | yes | Previous verification goal is complete; new matching goal is created after this plan shell. |
| Lane resolved | yes | Plate/shared editor because failures span Plate packages, Core schema wiring, and www registry integration. |
| Invocation mode and timebox recorded | yes | Full-loop; no timebox. |
| Dynamic checkpoint policy accepted | yes | Reconcile after each focused repair family and aggregate rerun. |
| Source of truth and allowed workspaces recorded | yes | Live source/tests in `/Users/zbeyens/git/plate-2`; no donor checkout. |
| Output budget strategy recorded | yes | Reuse logs and inspect bounded owner slices. |
| Release/PR/publish boundary recorded | yes | No PR/publish; changesets only if published package behavior/API legitimately changes. |
| Browser proof strategy recorded | yes | Conditional only for runtime-visible UI/component changes; tests alone are not a browser claim. |
| Package/API proof strategy recorded | yes | Focused specs, source-first typechecks, aggregate fast/slow, and barrels if exports change. |
| Mobile/raw-device claim-width policy recorded | no | N/A: no mobile claim. |
| Skill repair authority and source-rule boundary recorded | yes | Repair `.agents/rules/**` only if a reusable workflow miss is proven; sync via `pnpm install`. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining backlog ladder, and supervision-mode fallback are recorded.
- [x] Lane is resolved as Plite, Plate, or shared editor, with owning workspace/package/app proof named.
- [x] Checkpoint supervisor table has been reconciled at least once after the initial seed.
- [x] Post-merge/current-tree closure is N/A: this was direct active repair, not a post-merge handoff.
- [x] Each loop has an explicit mutation decision in the ledger.
- [x] Current-tree/status packet was recorded before new runtime patches.
- [x] Behavior proof packets cover every reproduced family and the aggregate repository gates.
- [x] Visual proof covers the only browser-visible runtime repair; native selection is N/A because no native selection behavior changed.
- [x] Missing oracles were repaired with focused Core, playground, and Table named-root contracts.
- [x] Browser helper promotion is N/A: the one-off route check did not reveal a reusable browser primitive.
- [x] Mobile/raw-device proof is N/A: no mobile or device claim.
- [x] Huge-document proof is N/A: no huge-document claim.
- [x] Perf work is N/A: correctness was the named scope; the slowest gate remains below its hard budget.
- [x] Package/API contracts, exports, generated API reference, changesets, and current docs are consistent.
- [x] Existing Vision/Plate Next doctrine and changesets already own the reusable decisions; no extra rule mutation was required.
- [x] Workflow slowdowns are recorded; no failing or avoidably repeated gate remains.
- [x] Packet ledger contains every material repair and proof family.
- [x] Changed list is current and grouped to this run.
- [x] Needs-your-attention list is capped and records the one non-blocking warning.
- [x] Stopping checkpoints are none.
- [x] Exact P2 autoreview passed with no accepted/actionable findings after two repaired findings.
- [x] Agent-native review is N/A: no `.agents/**`, command, hook, or prompt/tooling source changed in this closure packet.
- [x] Broad command output was bounded and durable evidence is summarized here.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | `pnpm check` exits 0: 58/58 builds, 58/58 typechecks, 3,109 fast, 1,579 slow plus 60 skips, slowest gate green. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | Eight-loop mutation ledger records split, reopen, repair, oracle, and closure decisions. |
| Lane authority proof | yes | Prove each command ran in the owning workspace | All package/app/root commands ran in `/Users/zbeyens/git/plate-2`. |
| Workspace authority proof | yes | Record cwd/tool for package, docs, browser, and review proof | Package commands used the root shell; `/blocks/playground` used the in-app Browser; autoreview used the repo script. |
| Behavior gates | yes | Run focused stable behavior proof | Focused playground 2/2, Plite schema compiler 37/37, Table named-root family 21/21, full fast/slow lanes green. |
| Visual/native selection proof | yes | Record Browser/native evidence or scoped N/A | Browser `/blocks/playground` passed; native selection N/A because no native-selection behavior changed. |
| Missing oracle repair | yes | Add and verify oracle packets | Added Core wrapper compile contract, playground persisted-node test, and Table root-cache test. |
| `@platejs/browser` promotion | no | Record N/A reason | One route-level check; no repeated helper pattern. |
| Mobile/raw-device claim width | no | Record N/A reason | No mobile/raw-device claim. |
| Huge-document correctness smoke | no | Record N/A reason | No huge-document claim. |
| Package/API proof | yes | Run package/type/test proof and API parity | Core/Table/Plite typechecks pass; www editor/API/docs/registry/two-project typecheck passes. |
| Autoclosure handoff | no | Record N/A reason | Direct active repair, not post-merge/current-tree delegation. |
| Skill/rule sync | no | Record N/A reason | No `.agents/rules/**` source changed in this task packet. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers | Ledgers below are complete; no stopping checkpoint remains. |
| Final lint/check | yes | Run lint/check | `pnpm lint:fix`, `git diff --check`, and final `pnpm check` all pass. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable repeats | Root check is build-first by design; API manifest was regenerated after package build; remaining warning is below hard budget. |
| Agent-native review for agent/tooling changes | no | Record N/A reason | No agent/tooling source changed. |
| P2 autoreview for non-trivial implementation changes | yes | Close accepted/actionable findings | Final exact P2 autoreview is clean, confidence 0.86. |
| Goal plan complete | yes | Run the plan checker | Ready: all other gates are concrete and closed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | requirements, doctrine, boundaries, and proof gates recorded | status |
| Status and current-state read | complete | CI runs build before tests; standalone test baselines used stale/missing dist | gap scan |
| Gap scan and scenario matrix | complete | Every fast, slow, declaration, www, and Browser failure was assigned to an owner. | behavior proof |
| Behavior proof | complete | Focused suites and aggregate `pnpm check` pass. | oracle repair |
| Oracle repair | complete | Core compile, playground fixture, and named-root cache contracts added. | visual proof |
| Visual/native proof | complete | Browser playground route passed; native selection N/A. | browser helper promotion |
| Browser helper promotion | complete | N/A: no repeated pattern. | mobile claim width |
| Mobile/raw-device claim width | complete | N/A: no device claim. | huge-document smoke |
| Huge-document correctness smoke | complete | N/A: no huge-document claim. | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | complete | API reference regenerated; changesets/docs aligned; perf and skill mutation N/A. | consolidation |
| Consolidation and review | complete | Final P2 autoreview clean. | final handoff |
| Final handoff and goal-plan check | complete | Final ledgers complete; checker is the terminal command. | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| package import closure | Markdown and AI test helpers | Bun source-first workspace | import specs | modules resolve current dependencies without legacy aliases | passed |
| schema fixture closure | AI range helpers and markdown block-id tests | Bun editor construction | create editor from fixtures | closed schema accepts only intentionally installed persisted properties | passed |
| registry composition | MarkdownKit and editor presets | Bun plus Browser | build editor/preset metadata and render playground | neutral package ownership and explicit demo dependencies hold | passed |
| structural behavior | table and list owners | Bun slow lane | selection/mutation/list operations | current schema and descriptor portals preserve behavior | passed |
| React export adoption | media/math/footnote registry UI | Bun render and www typecheck | import and render components | callers use current exported descriptors/hooks | passed |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| baseline | 0 | testing | Clean reinstall still yields fast 43 failures/34 errors and slow 54 failures/12 errors plus isolated shards. | prior CI logs and ledger | pre/post reinstall identical; Browser N/A | keep | diagnose package import closure first |
| code-block declaration boundary | 1 | Code Block / Core typing | Fresh CI build fails TS7056 on two Base stages and two React adapters; public descriptors must remain inferred. | `packages/code-block/src/lib/BaseCodeBlockPlugin.ts`, `packages/code-block/src/react/CodeBlockPlugin.tsx`; `pnpm --filter @platejs/code-block build` | focused declaration build exits 0; runtime behavior unchanged, Browser N/A | keep | rerun full build |
| schema-owned object patches | 2 | Core typing, Table, Suggestion | Duplicate persisted keys across placements were typed as `undefined`; dynamic JSON records were rejected; Suggestion retained a stale node-generic call. | Core runtime types/type contract, Suggestion caller; Core/Table/Suggestion builds | all three focused declaration builds exit 0; negative wrong-value contract retained | keep | rerun full build, then repair stale mutation doctrine |
| fast stale caller closure | 3 | Markdown, AI integration, registry tests | Explicit block-ID callback missing; irrelevant persisted IDs in closed fixtures; MarkdownKit tests claimed renderer ownership; media mock hid FilePlugin. | four focused specs; fresh aggregate fast lane | 36 focused tests pass; aggregate fast 3,107/3,107 plus all isolated fast specs pass | keep | slow fixture/API packet |
| slow structural closure | 4 | List, Table, schema fixtures | Current descriptor/schema contracts exposed stale slow fixtures and cache assumptions. | focused List/Table/Core suites and `pnpm test:slow` | aggregate slow lane reaches zero failures | keep | browser/www closure |
| playground runtime closure | 5 | www registry | Playground persisted a callout without its required icon and used Code Drawing without declaring its kit. | playground value/demo/registry metadata and focused spec | Browser `/blocks/playground` renders one editable with zero error dialogs; focused tests 2/2 | keep | www typecheck |
| wrapper definition fidelity | 6 | Core React/static types | Wrapper aliases erased exact dependency carriers while configure required the exact adapted definition. | Core Plate/Base plugin types and compile contract | Core typecheck/contracts and www two-project TypeScript pass | keep | aggregate CI |
| schema property ID contract | 7 | Plite/API reference | Reflected identity widened `getCompiledSchemaPropertyId` from `string` to `any`. | schema compiler and generated API manifest | Plite typecheck, schema compiler 37/37, API reference check | keep | root-cache review |
| named-root cache oracle | 8 | Table/Plite snapshot index | Reviewer suspected root collisions after cache moved from snapshot object to stable snapshot index. | Table named-root slow contract | distinct root indexes and alternating reads proven; focused 21/21, aggregate slow 1,580 pass | keep | final review |
| final closure | 8 | repository | All repaired owners must coexist under the actual CI order. | `pnpm check`, `pnpm --filter www typecheck`, exact P2 autoreview | every command exits 0; final review has no P0-P2 findings | keep | complete |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Code Block declaration emit | `@platejs/code-block` | `pnpm --filter @platejs/code-block build` | N/A: exact type-only declaration boundary | pass | run package tests/typecheck after full build triage |
| schema-owned object patch typing | Core, Table, Suggestion | `pnpm --filter @platejs/core build`; `pnpm --filter @platejs/table build`; `pnpm --filter @platejs/suggestion build` | N/A: compile-only API contract; runtime primitive unchanged | pass | aggregate build/test lanes |
| Core wrapper definition fidelity | `@platejs/core` | `pnpm --filter @platejs/core typecheck` | N/A: compile-only contract | pass | www consumer proof |
| Plite property identity | `@platejs/plite` | package typecheck plus `bun test packages/plite/test/schema-compiler.test.ts` | N/A: compiler identity contract | 37/37 pass | generated API parity |
| Table root cache | `@platejs/table` | focused named-root slow family and package typecheck | N/A: model/cache proof | 21/21 pass | aggregate slow lane |
| www consumer closure | `apps/www` | `pnpm --filter www typecheck` | Browser paired separately | editor generation, API parity, docs parity, registry closure, and both TS projects pass | aggregate root proof |
| fast aggregate | repository | final `pnpm check` | Browser paired separately | 3,109/3,109 plus all isolated fast specs pass | none |
| slow aggregate | repository | final `pnpm check`; final `pnpm test:slow` after root oracle | N/A: model behavior lane | 1,579 then 1,580 pass; 60 intentional skips; zero failures | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| playground route | N/A: no selection change | N/A: no native selection claim | one editable mounted; no error dialog | Browser `/blocks/playground`; callout copy present | pass |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| route smoke extraction | one playground repair | no helper: one-off DOM/error assertion | Browser session evidence above | N/A: no repeated pattern |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| none | N/A | N/A | N/A | No mobile/raw-device claim. |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| none | N/A | N/A | N/A | N/A: no huge-document claim. |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| `pnpm check` | root CI | about 2 minutes | intentionally rebuilds and rechecks all packages before full tests | exact release-quality local gate | keep; this is the correct closure gate |
| API reference generation | www | seconds | reads built declaration artifacts | caught stale `any` after source annotation | regenerate after package build when public declarations change |
| P2 autoreview | repository | 1-4 minutes per pass | full local diff review | caught and closed the `any` leak; challenged root cache and drove an oracle | keep; final pass clean |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Code Block declaration contracts; Core property-patch and wrapper-definition inference; Plite correction/property identity; Table snapshot-index cache; current package/app API migrations. |
| tests/oracles/browser proof | Core compile contracts, playground persisted-node regression, Table named-root cache regression, focused owner suites, and Browser playground proof. |
| benchmarks/metrics/targets | No benchmark target changed; root slowest gate remains below the 20-second hard limit. |
| examples/docs | Playground value/demo/registry dependency closure, current docs/API prose, changesets, and regenerated API manifest. |
| skills/workflow | Existing Plate Next v75 doctrine validated; no new rule/skill source mutation in this closure packet. |
| reverted/quarantined packets | Temporary local generated-registry import refresh used only for Browser proof was restored byte-for-byte; no generated registry output retained. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Fast-suite timing is in the warning zone, not failing. | Latest measured 14.8s is below the 20s hard limit; two individual tests crossed the 200ms warning threshold. | `pnpm check` slowest report | Track separately as performance work; do not reopen this correctness closure. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | N/A | No decision is required. | Every applicable gate is green. | none | final handoff only | complete the goal | this plan |

Findings:
- Environment corruption is ruled out by a successful reinstall and identical reruns.
- Prior accepted MarkdownKit ownership says the neutral Markdown kit must not install renderer-specific Footnote composition; current expectations may be stale.
- Removed API names must not be re-exported merely to silence tests; live current call sites and descriptor owners decide the migration.
- CI truth is build-first: `.github/workflows/ci.yml` reaches `pnpm build` through the typecheck lane before `pnpm test:all`. Missing Plate modules/exports in the standalone baseline are stale-artifact evidence until a fresh build passes.
- The first genuine fresh-build blocker was Code Block TS7056. Compact read/decorator contracts plus exact private React dependency-adapter carriers make declaration emit pass without annotating either public plugin export.
- A persisted key may legally have several placement-specific declarations. Object patches accept the union of those declared values; wrong values remain rejected. A true string-indexed patch is the explicit dynamic-key path and must not be collapsed to `never`.
- Wrapper callbacks need exact plugin capabilities and dependencies, while only their wrapped element identity is widened for target plugins.
- Plite snapshot caches are root-scoped. Stable snapshot indexes therefore preserve root identity while avoiding selection-only cache churn.
- The final fast and slow lanes are green with zero failures; no reproduced CI defect remains.

Decisions and tradeoffs:
- Repair by failure family and owner, rerunning focused proof before aggregate lanes.
- Prefer migrating stale tests/callers to current APIs over restoring compatibility exports.
- Keep the stable snapshot-index cache after proving per-root isolation instead of adding a redundant root string to its key.
- Generate API reference artifacts after package declaration builds when exported signatures change.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Standalone `pnpm test:all` before package build classified missing dist as source failures | 1 | Follow the real CI build-first order, then triage only surviving tests | Fresh full build is now the active gate. |
| Code Block direct declaration emit exceeded TS7056 at four descriptors | 1 | Compact real capability boundaries and use documented private declaration carriers | Focused Code Block build passes. |
| Core rejected shared persisted keys and typed dynamic records in object patches | 1 | Validate against the union of declarations for that persisted key and accept explicit string-indexed patches | Core, Table, and Suggestion declaration builds pass. |
| Browser initially loaded stale checked-in generated registry imports | 1 | Temporarily refresh only the two imports for proof, repair source owners, then restore generated output byte-for-byte | Source playground route passed; generated registry file has no retained diff. |
| P2 review found `getCompiledSchemaPropertyId` emitted as `any` | 1 | Validate reflected data, declare `string`, rebuild packages, then regenerate API reference | Plite and API parity pass; manifest advertises `=> string`. |
| P2 review suspected named-root Table cache collision | 1 | Audit Plite snapshot ownership and add alternating-root proof | Distinct root indexes and isolated cached views pass 21/21. |

Verification evidence:
- Baseline evidence: `docs/plans/2026-08-14-run-ci-tests.md` and `/tmp/plate-ci-test*-2026-08-14.log`.
- Code Block declaration proof: `pnpm --filter @platejs/code-block build` exits 0 after the exact boundary repair.
- Object patch inference proof: Core, Table, and Suggestion focused declaration builds exit 0; Core retains a negative wrong-value assertion.
- Final root proof: `pnpm check` exits 0 with 58/58 package builds, 58/58 package typechecks, 3,109 fast tests, 1,579 slow tests, 60 intentional skips, and the slowest budget gate.
- Final post-oracle slow proof: `pnpm test:slow` reports 1,580 pass, 60 skip, and zero failures.
- www proof: `pnpm --filter www typecheck` passes editor generation, API reference, docs parity, registry closure, app TypeScript, and package-integration TypeScript.
- Focused proof: playground/Table tests 2/2; Plite schema compiler 37/37; Table named-root selection family 21/21; Core, Table, Plite, and www typechecks pass.
- Browser proof: `/blocks/playground` renders one editable, includes the callout content, and reports zero runtime error dialogs.
- Review proof: final exact P2 autoreview reports no findings and `patch is correct` at confidence 0.86.
- Hygiene proof: `pnpm lint:fix` and `git diff --check` pass.

Final handoff contract:
- Goal plan: complete evidence ledger at this file; checker is the terminal validation.
- Lane: Plate/shared editor.
- Surface and route/package: repository CI, Core/Plite/Table and affected packages, www registry, `/blocks/playground`.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop, no minimum runtime, eight reconciled loops.
- Behavior gates and visual proof: all focused/aggregate gates and playground Browser proof pass.
- Primary metric baseline/latest/best and stop reason: fast 43 failures/34 errors to zero; slow 54 failures/12 errors to zero; stop because every named threshold is green.
- Bugs fixed and oracles added: declaration/type/schema/cache/fixture/API ownership repairs plus Core, playground, and root-cache regressions.
- Benchmark/skill/docs repairs: no benchmark or skill source mutation; current docs/changesets and generated API reference aligned.
- Workflow slowdowns and repairs: build-first CI order respected; API generation moved after declarations; bounded review loop closed.
- Changed list: grouped above.
- Needs your attention: one non-blocking fast-suite timing warning, below the hard limit.
- Stopping checkpoints to unblock: none.
- Accepted deferrals and residual risks: performance tuning only; no correctness defer.
- Next owner: none; ready for user handoff.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff after clean CI and review. |
| Where am I going? | Goal-plan checker, goal completion, final response. |
| What is the goal? | Zero failures/errors in the repository fast and slow CI test lanes. |
| What have I learned? | CI is build-first; wrapper contexts require exact definitions; API manifests must follow declaration builds; root snapshot indexes are already root-scoped. |
| What have I done? | Repaired every reproduced owner, added missing oracles, passed full root/www/Browser proof, and closed P2 review. |
| What changed in the checkpoint plan? | The initial failure triage expanded into browser/www closure, API signature repair, and a named-root cache oracle before final closure. |

Timeline:
- 2026-08-14T20:32:56.509Z Goal plan created.
- 2026-08-15 Final root CI, www gate, Browser proof, named-root slow proof, and P2 autoreview completed.

Open risks:
- No blocking correctness risk remains.
- The fast suite measured 14.8 seconds against a 20-second hard limit and emitted a warning-zone advisory; performance tuning is separate from this completed CI repair.
