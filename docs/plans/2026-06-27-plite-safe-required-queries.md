# plite safe required queries

Objective:
Automate Plite safe query API; done when safe-default reads, required strict reads, runtime required:true audit, focused tests, and Plite proof gates pass.

Goal plan:
docs/plans/2026-06-27-plite-safe-required-queries.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: user-invoked `auto`
- prompt / link: `$auto - make sure to not forget any plite runtime usage that should use required: true`
- lane: Plite
- surface / route / package: `packages/plite`, `packages/plite-react`, `packages/plite-dom`, `packages/plite-history`, `packages/plite-layout`, `packages/yjs`, and Plite-consuming Core call sites only where compile/runtime proof forces it
- invocation mode: full-loop
- minimum runtime / deadline: N/A, no timebox requested
- completion threshold summary: add safe-default plus `{ required: true }` query semantics, audit strict runtime call sites, prove with focused Plite tests/typecheck, and record any scoped defers

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: full-loop until packet is verified or a real stop checkpoint appears
- initial confidence score: 0.82
- improvement loop: close one API/runtime packet, not timed supervision
- final score / loop closure: 0.96 after focused query proof, Plite/Core type gates, `check:plite`, and `check:core`

Completion threshold:
- Plite query APIs are safe by default for user/app reads where missing locations are normal absence.
- Strict/invariant reads use `{ required: true }` instead of duplicated `try*`/`safe*` methods.
- Runtime/internal call sites that assume presence are audited and updated to `{ required: true }` where they must throw rather than silently proceed.
- Callback/matcher/mapper errors still propagate; safe means missing valid location only, not swallowing bugs.
- Focused tests prove default-safe, required-throws, callback propagation, and malformed/corrupt path behavior.
- Closure is legal only when required behavior, package/API, docs/skill repair, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plite-safe-required-queries.md` passes.

Verification surface:
- Focused Plite behavior proof: `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts test/query-contract.ts test/query-extension-contract.ts test/upstream-slate-helper-loss-contract.ts test/state-query-contract.ts`.
- Focused affected package proof as needed for edited package tests.
- Type proof: `pnpm turbo typecheck --filter=./packages/plite` plus affected Plite satellite packages when touched.
- Daily Plite proof if the packet touches shared runtime/public API broadly: `pnpm check:plite`.
- Browser proof: N/A unless runtime change touches browser-visible behavior; this packet is core query API semantics.
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
- Source of truth: root `VISION.md`, `docs/vision/plite.md`, current `packages/plite/**` source/tests, and affected Plite satellite package source/tests.
- Allowed edit scope: Plite runtime/query source, focused tests, docs plan, and compile-forced Plite-consuming call sites.
- Browser surfaces: N/A unless code path proves browser-visible editor behavior changed.
- Package/API surfaces: Plite `EditorStateNodesApi`, runtime query implementation, public static query helpers only if required by the accepted shape.
- Agent/skill surfaces: N/A unless workflow miss repeats.
- Docs/research surfaces: plan only unless public docs become stale after API change.
- Non-goals: no public `safePath`/`tryPath`, no method explosion, no Plate wrapper API, no release/PR/changelog, no broad browser/perf work.

Output budget strategy:
- Use targeted `sed` for owner files and capped `rg` for call-site audit. Do not stream full repo matches; write counts/artifacts only if needed.

Blocked condition:
- Block only if TypeScript cannot express safe-default plus required-true overloads without unacceptable API distortion, or if runtime usage has two equally plausible semantics not covered by `VISION.md`.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: Plite
- surface: safe-default query APIs with required strict mode
- mode: complete
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 1
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: none
- goal_status: ready-to-close

Current verdict:
- verdict: keep
- confidence: 0.96
- next owner: none
- keep / revert / quarantine call: keep
- reason: Safe default state reads and strict `{ required: true }` invariants are implemented, source-audited, and proven through focused query tests, Plite package gates, Chromium proof, and Core boundary checks.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plite-safe-required-queries.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | complete | P0 | Copy prompt requirements and read vision before implementation. | Requirements, boundaries, proof gates, and user-specific runtime audit captured. | update |
| status | auto | complete | P0 | Read active plan, latest prompt, source status, and current evidence. | Baseline evidence recorded; no git-state probe needed. | keep |
| gap-scan | auto | complete | P0 | Identify safe-default/required API gaps and strict runtime call sites. | `rg` audit covered Plite/Core source `state.nodes.get/path` usage; compile audit forced DOM/React/Core call-site fixes. | keep |
| closure-handoff | autoclosure | complete | N/A | Run until-clean closure for already-applied work. | N/A: this was active implementation, not post-merge/current-tree closure. | retire |
| behavior-proof | lane proof owner | complete | P0 | Prove stable editor behavior before perf. | Focused 111 Plite query tests, `pnpm check:plite`, and `pnpm check:core` passed. | keep |
| oracle-repair | lane test owner / tdd | complete | P0 | Add missing native/visual/model oracles for found gaps. | Added safe/default/required/callback-propagation state-query tests; repaired focused query test imports. | keep |
| visual-proof | Browser / Playwright | complete | P0 | Prove visible editor behavior and native selection. | `pnpm check:plite` ran Chromium browser proof; one known code-highlighting retry flake passed. | keep |
| browser-helper-promotion | lane proof harness | complete | N/A | Promote repeated browser proof into reusable API/helper. | N/A: no repeated browser helper pattern introduced. | retire |
| mobile-claim-width | auto | complete | N/A | Separate raw-device proof from viewport proof. | N/A: no mobile/raw-device claim made. | retire |
| huge-document-smoke | lane proof owner | complete | N/A | Smoke huge-doc correctness without broad architecture work when in scope. | N/A: no huge-document behavior touched. | retire |
| perf-packet | lane perf owner | complete | N/A | Optimize only after correctness is green. | N/A: not a perf packet. | retire |
| supervision-mode | auto | complete | N/A | If backlog looks empty before minimum runtime, predict next useful checkpoint from vision and evidence. | N/A: no timed minimum runtime. | retire |
| consolidation | auto | complete | N/A | Move accepted reusable decisions to durable docs/rules. | N/A: API decision is local to Plite source/tests; no reusable skill/vision change needed. | retire |
| final-handoff | auto | complete | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Changed list, review attention, stopping checkpoints, and risks filled below. | keep |
| required-runtime-audit | auto / package owners | complete | P0 | Do not forget Plite runtime usage that must still throw. | Source `state.nodes.get/path` audit complete; runtime/DOM/React invariants use `{ required: true }`, defensive fallback reads use optional-safe access. | keep |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | updated |
| 0 | update | checkpoint-zero, gap-scan, required-runtime-audit | user prompt + vision read + Plite source reads | implementation target changed from strict path law to safe-default plus required strict mode | complete |
| 1 | update | behavior-proof, oracle-repair, required-runtime-audit | red/green test, typecheck, grep audit, `check:plite`, `check:core` | evidence proved source/API packet and distinguished strict invariants from optional stale-DOM fallbacks | complete |
| 1 | retire | mobile, huge-doc, perf, autoclosure, browser-helper-promotion | scope review | not requested and no evidence routed this packet there | complete |

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
| Prompt requirements captured before work | yes | Captured safe-default query target, `{ required: true }`, runtime usage audit, no method explosion, proof gates, and non-goals. |
| `auto` source rule read or fallback recorded | yes | Read `.agents/skills/auto/SKILL.md`; user also pasted the skill body. |
| `vision` read as checkpoint zero | yes | Read `VISION.md` and `docs/vision/plite.md`. |
| Active goal checked or created | yes | `get_goal` returned null; created active Auto goal for Plite safe query API. |
| Lane resolved | yes | Plite lane. |
| Invocation mode and timebox recorded | yes | Full-loop, no duration. |
| Dynamic checkpoint policy accepted | yes | Required-runtime-audit checkpoint added from user correction. |
| Source of truth and allowed workspaces recorded | yes | Current Plate repo Plite source/tests; donor checkout excluded. |
| Output budget strategy recorded | yes | Targeted owner reads and capped `rg`; no broad streamed scans. |
| Release/PR/publish boundary recorded | yes | N/A: not requested. |
| Browser proof strategy recorded | yes | N/A unless browser-visible behavior is touched. |
| Package/API proof strategy recorded | yes | Focused Plite query tests, typecheck, and `check:plite` if broad runtime/API touched. |
| Mobile/raw-device claim-width policy recorded | yes | N/A: no mobile claim. |
| Skill repair authority and source-rule boundary recorded | yes | N/A unless workflow miss repeats; no `.agents/**` edit planned. |

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
| Named verification threshold | yes | Run focused query tests, `check:plite`, `check:core`, and Plite package typecheck | Focused 111 query tests passed; `pnpm check:plite` passed; `pnpm check:core` passed; `pnpm plite:typecheck` passed. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to seed | Added and closed `required-runtime-audit`; retired out-of-scope mobile/huge-doc/perf rows. |
| Lane authority proof | yes | Prove commands ran in owning workspace | All commands ran from `/Users/zbeyens/git/plate-2` against transplanted Plite/Core packages. |
| Workspace authority proof | yes | Record cwd/tool for each package proof | Commands recorded in Verification evidence. |
| Behavior gates | yes | Run focused behavior proof | Focused query tests and Plite/Core test gates passed. |
| Visual/native selection proof | yes | Record browser proof or scoped blocker | `pnpm check:plite` ran Chromium proof through `apps/plite`; no new native-selection-specific browser route was needed. |
| Missing oracle repair | yes | Add/verify oracle packet | Added state query contract for safe default, required strict, malformed paths, and callback propagation. |
| `@platejs/browser` promotion | N/A | Add helper or record no helper need | No repeated browser-helper pattern introduced. |
| Mobile/raw-device claim width | N/A | Run raw proof or narrow claim | No mobile/raw-device claim. |
| Huge-document correctness smoke | N/A | Run smoke or defer | No huge-document behavior touched. |
| Package/API proof | yes | Source-audit and package proof | Source `rg` audit done; Plite/Core type/test/lint gates passed. |
| Autoclosure handoff | N/A | Delegate when post-merge closure | Not post-merge/current-tree closure. |
| Skill/rule sync | N/A | Run sync when `.agents/**` changed | No `.agents/**` edits. |
| Changed list / review attention / stopping checkpoints | yes | Fill ledgers | Ledgers filled below. |
| Final lint/check | yes | Run scoped lint/check | `pnpm check:plite`, `pnpm check:core`, `pnpm plite:typecheck` passed. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable repeat | Bun path pitfall and Chromium flake recorded; import-harness repair applied. |
| Agent-native review for agent/tooling changes | N/A | Run for agent/tooling changes | No agent/tooling changes. |
| Autoreview for non-trivial implementation changes | N/A | Run if requested or before commit | Not requested; proof gates were stronger fit for this runtime packet. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plite-safe-required-queries.md` | To run after this plan update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | created plan, read `auto`, `VISION.md`, `docs/vision/plite.md`, captured user-specific runtime audit requirement | status |
| Status and current-state read | complete | `pnpm test:plite` and `pnpm check:plite` passed before packet; one flaky Chromium retry in code-highlighting row noted from prior preflight | gap scan |
| Gap scan and scenario matrix | complete | Source audit found strict Plite state reads in Plite DOM, React, and Core renderers; `state.nodes.path` source usage remained lifecycle-only. | behavior proof |
| Behavior proof | complete | Focused query tests passed; `pnpm check:plite` passed; `pnpm check:core` passed. | oracle repair |
| Oracle repair | complete | Added state-query contract rows for default safe reads, `{ required: true }`, malformed paths, and callback propagation; query contract imports repaired. | visual proof |
| Visual/native proof | complete | `pnpm check:plite` ran Chromium proof through `apps/plite`, 586 passed plus one flaky retry, then focused browser rows passed. | browser helper promotion |
| Browser helper promotion | complete | N/A: no new repeated browser helper pattern. | mobile claim width |
| Mobile/raw-device claim width | complete | N/A: no mobile/raw-device claim. | huge-document smoke |
| Huge-document correctness smoke | complete | N/A: no huge-document code path touched. | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | complete | N/A: not perf/docs/skill work. | consolidation |
| Consolidation and review | complete | No durable vision/skill change needed; plan records local API law. | final handoff |
| Final handoff and goal-plan check | complete | Final ledgers filled; check-complete to run after plan edit. | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| Plite node queries | runtime state/static query API | package-only | read missing path, read required path, finder callback errors | return `undefined` by default, throw with `{ required: true }`, propagate user errors | complete |
| Plite runtime call sites | DOM/React/Core consumers | package-only | strict invariant read | audit/use `{ required: true }` or guard safe result | complete |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| safe-default query API | 1 | Plite | App reads should not need try/catch for valid-but-missing locations; strict invariants still need a throwing path. | `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/core/public-state.ts`, `packages/plite/src/core/editor-lifecycle-api.ts`, `packages/plite/src/core/editor-query-runtime.ts`; focused query tests. | 111 focused query tests passed. | keep | none |
| runtime required audit | 1 | Plite DOM/React/Core | Runtime code that destructures node entries must not silently continue on impossible missing paths. | Plite DOM, Plite React, Core render-leaf call sites; `pnpm plite:typecheck`, `pnpm check:plite`, `pnpm check:core`. | Plite/Core type gates and Chromium proof passed. | keep | none |
| proof harness repair | 1 | Plite tests | Query contract files depended on missing static-helper imports under focused execution. | `packages/plite/test/query-contract.ts`, `packages/plite/test/query-extension-contract.ts`. | Focused query tests passed standalone. | keep | none |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Query API semantics | `packages/plite` | `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/query-contract.ts ./test/query-extension-contract.ts ./test/upstream-slate-helper-loss-contract.ts ./test/state-query-contract.ts` | N/A | 111 pass | none |
| Plite daily lane | root Plite packages + `apps/plite` | `pnpm check:plite` | Chromium | pass; one known code-highlighting retry flake, final exit 0 | flake logged |
| Core/Plite boundary | `packages/core`, `packages/plite` | `pnpm check:core` | N/A | pass | none |
| Plite type graph | Plite satellite packages + browser + yjs | `pnpm plite:typecheck` | N/A | pass | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| Plite browser proof | Package/model proof via `check:plite` | N/A | Chromium app proof through `apps/plite`; no new native selection packet | `pnpm check:plite` | pass with one retry flake |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| N/A | N/A | N/A | N/A | No new reusable browser helper pattern introduced. |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| N/A | N/A | N/A | N/A | No mobile/raw-device claim in this packet. |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| N/A | N/A | N/A | N/A | No huge-document behavior touched. |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Focused Bun path | Plite tests | seconds | First attempted focused file paths without `./`, which Bun did not resolve as intended. | Correct command used `./test/...`; focused tests passed. | Record as command pitfall; no skill edit needed for one-off. |
| Query contract hidden globals | Plite tests | minutes | Focused execution exposed missing helper imports in existing query tests. | Added explicit imports; focused tests passed. | Repaired in source. |
| Chromium code-highlighting row | Plite browser proof | one retry / 60s timeout | Known button-click flake in `apps/plite/tests/plite-browser/donor/examples/code-highlighting.test.ts`. | `pnpm check:plite` final exit 0 after retry. | Log only; not caused by this packet. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `EditorStateNodesApi.get/path` safe-default plus `{ required: true }`; public state helpers; lifecycle/query runtime typing; Plite DOM/React/Core invariant reads updated. |
| tests/oracles/browser proof | Added state query contract rows; updated upstream helper loss expectation; repaired query contract imports. |
| benchmarks/metrics/targets | None. |
| examples/docs | None. |
| skills/workflow | None. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Safe default is a real public API change | `state.nodes.get/path` now return `undefined` by default for valid missing locations. | `packages/plite/src/interfaces/editor.ts` | Review only if you disagree with safe-by-default app reads. |
| 2 | Chromium code-highlighting row flaked once | Same known timeout shape as earlier, final proof passed. | `apps/plite/tests/plite-browser/donor/examples/code-highlighting.test.ts` | Leave for separate browser-flake lane. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | none | No user decision needed. | The packet has a clear keep decision and no unresolved API fork. | none | none | Keep changes. | this plan |

Findings:
- `state.nodes.get` and `state.nodes.path` are now safe by default for valid missing locations and strict with `{ required: true }`.
- Malformed/corrupt paths still throw; safe default does not swallow invalid path shape.
- Collection helpers no longer swallow matcher/mapper callback errors in the covered state-query path.
- Runtime/DOM/React/Core destructures that assume the node exists now use `{ required: true }`; stale DOM/fallback reads use optional-safe access.
- `pnpm check:plite` passed with one flaky Chromium retry in `apps/plite/tests/plite-browser/donor/examples/code-highlighting.test.ts`; final exit was 0.

Decisions and tradeoffs:
- Public app queries should be safe by default where absence is normal.
- Strict/invariant reads use `{ required: true }`; do not add `safe*`/`try*` method variants.
- Runtime call sites that assume a node/path exists should opt into `{ required: true }` or explicitly guard the safe result.
- Static low-level internal helpers may remain strict when they are intentionally invariant surfaces, but public `editor.read`/`state` APIs should carry the safe/default split.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Focused Bun file paths without `./` | 1 | Use `./test/...` when invoking individual Plite Bun files. | Corrected command and focused tests passed. |
| Existing query contract files had implicit helper dependencies | 1 | Import static helpers explicitly from `@platejs/plite/internal`. | Repaired imports; focused tests passed standalone. |
| `pnpm check:core` lint failure after implementation | 1 | Apply lint/format fixes, then rerun the full gate. | `pnpm --filter @platejs/plite lint:fix` then `pnpm check:core` passed. |

Verification evidence:
- Red proof: `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/state-query-contract.ts` initially failed on missing safe read and swallowed callback error.
- Green focused proof: `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/query-contract.ts ./test/query-extension-contract.ts ./test/upstream-slate-helper-loss-contract.ts ./test/state-query-contract.ts` -> 111 pass.
- Type proof: `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/plite-dom --filter=./packages/plite-react --filter=./packages/plite-history --filter=./packages/plite-hyperscript --filter=./packages/plite-layout --filter=./packages/core` -> pass.
- Daily Plite proof: `pnpm check:plite` -> pass, with one flaky Chromium retry in code-highlighting row, final exit 0.
- Core boundary proof: `pnpm check:core` -> pass.
- Final Plite type graph: `pnpm plite:typecheck` -> pass.
- Source audit: `rg` over source `state.nodes.get` and `state.nodes.path` found only required strict reads, intentional optional stale-DOM/fallback reads, lifecycle forwarding, or tests.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-27-plite-safe-required-queries.md`
- Lane: Plite
- Surface and route/package: Plite query runtime, Plite DOM/React runtime consumers, Core render leaf consumers.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: full-loop, no timed minimum, one implementation/proof loop.
- Behavior gates and visual proof: focused query tests, `check:plite` Chromium proof, `check:core` all passed.
- Primary metric baseline/latest/best and stop reason: pass/fail gate, latest and best are green; stop because required API/runtime audit and proof gates are complete.
- Bugs fixed and oracles added: safe-default node/path reads, strict `{ required: true }`, callback propagation oracle, malformed-path oracle, focused-test import repair.
- Benchmark/skill/docs repairs: none.
- Workflow slowdowns and repairs: Bun `./test` path pitfall logged; query-test implicit import repair applied; code-highlighting browser flake logged.
- Changed list: filled above.
- Needs your attention: safe-default API shape only if you disagree; otherwise none.
- Stopping checkpoints to unblock: none.
- Accepted deferrals and residual risks: code-highlighting flake deferred to browser-flake lane; no mobile/huge-doc claim.
- Next owner: none.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff |
| Where am I going? | Close goal after `check-complete` passes |
| What is the goal? | Implement safe-default Plite query APIs with `{ required: true }` strict mode and audit runtime strict usages. |
| What have I learned? | Safe app DX and strict runtime invariants coexist cleanly with one `{ required: true }` option; compile audit is the right way to find required runtime reads. |
| What have I done? | Implemented the API/runtime change, repaired tests, audited runtime call sites, and ran focused, Plite, and Core gates. |
| What changed in the checkpoint plan? | Required runtime audit added and closed; out-of-scope mobile/huge-doc/perf rows retired. |

Timeline:
- 2026-06-27T08:29:46.343Z Goal plan created.
- 2026-06-27 checkpoint zero: requirements captured and Plite safe-default required-query packet opened.
- 2026-06-27 implementation loop: safe-default and required runtime audit implemented, proved, and kept.

Open risks:
- Code-highlighting Chromium row flaked once during `check:plite`; final gate passed after retry. Treat as separate browser-flake debt, not this packet.
- Static low-level helper APIs remain strict by design; this packet changed `editor.read` state query ergonomics, not every internal helper.
