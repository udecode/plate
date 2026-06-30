# plate-next parser command sweep

Objective:
Sweep Plate Core parser command drift; done when parser code is plugin-local, bridge/substrate gaps are audited, focused Core proof and plan check pass.

Goal plan:
docs/plans/2026-06-27-plate-next-parser-command-sweep.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: user correction after prior parser-drift repair
- prompt / link: "ok go sweep"
- lane: Plate Next / Core boundary cleanup
- surface / route / package: `packages/core`
- invocation mode: one-shot execution
- minimum runtime / deadline: N/A: no duration requested
- completion threshold summary: parser runtime is plugin-local, direct command mutation drift is cut or explicitly justified, related Core parser/clipboard drift is audited, focused Core proof passes, `pnpm check:core` passes, and this plan passes `check-complete`.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A: finish the scoped sweep to proof, not a timed loop
- initial confidence score: N/A: command/test gates are the metric
- improvement loop: N/A: one-shot cleanup packet
- final score / loop closure: N/A: record keep/revert/quarantine after proof

Completion threshold:
- `packages/core/src/internal/editor/runtimeParser.ts` is gone or justified by a durable multi-owner reason.
- Parser behavior is owned by `ParserPlugin`, not by a separate command bridge patch.
- `currentRuntimeBridge` no longer contains parser-only command tagging or parser-specific command state.
- Focused parser/runtime tests pass.
- Core typecheck/lint and `pnpm check:core` pass.
- Source audits show no stale `runtimeParser`, `installPlateRuntimeParserExtension`, or parser command marker leftovers.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-parser-command-sweep.md` passes.

Verification surface:
- Focused tests: `pnpm --filter @platejs/core exec bun test src/lib/plugins/ParserPlugin.spec.ts src/lib/plugins/dom/DOMPlugin.spec.ts src/react/editor/createPlateRuntimeEditor.spec.ts`.
- Package proof: `pnpm turbo typecheck --filter=./packages/core`, `pnpm --filter @platejs/core lint`, and `pnpm check:core`.
- Source audits: `rg -n 'runtimeParser|installPlateRuntimeParserExtension|__hasPluginInsertData' packages/core/src packages/core/type-tests --glob '!**/dist/**'` and targeted parser/clipboard audits.
- Final mechanical proof: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-parser-command-sweep.md`.

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
- Source of truth: Core source/tests in this checkout.
- Allowed edit scope: `packages/core/src/lib/plugins/ParserPlugin.ts`, `packages/core/src/internal/editor/runtimeParser.ts`, `packages/core/src/internal/currentRuntimeBridge.ts`, directly related Core tests, and this plan.
- Browser surfaces: N/A: no browser UI route touched.
- Package/API surfaces: internal Core parser/clipboard runtime only; no public API naming change.
- Agent/skill surfaces: N/A: no `.agents/**` or skill source changes.
- Docs/research surfaces: only this goal plan.
- Non-goals: broad Plate v2 sweep, release/PR work, browser proof, mobile proof, perf, package migration, and unrelated runtime flag cleanup.

Output budget strategy:
- Use targeted `sed` and exact `rg` patterns only. Avoid broad repo scans. Cap command output to source slices and pass/fail summaries.

Blocked condition:
- Stop only if the parser/clipboard ownership choice requires a public Plite API fork outside this Core packet, or if `pnpm check:core` exposes unrelated pre-existing failures that cannot be isolated from this patch.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: Plate Next / Core
- surface: parser plugin and current runtime command bridge
- mode: one-shot execution
- minimum_runtime: N/A
- target_deadline: N/A
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 1
- current_checkpoint: final-proof
- current_checkpoint_status: complete
- next_checkpoint: final-response
- goal_status: ready-to-close

Current verdict:
- verdict: keep
- confidence: high after focused tests, typecheck, lint, source audit, and `pnpm check:core`.
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: parser behavior is now plugin-local and the parser-only command marker is gone without changing focused behavior.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-parser-command-sweep.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | plate-next | complete | P0 | Copy prompt requirements before implementation. | Objective, scope, non-goals, proof, and blocked rows filled. | updated |
| status | plate-next | complete | P0 | Read current partial edits after interruption. | Inspected `ParserPlugin.ts`, `currentRuntimeBridge.ts`, and source audit. | updated |
| gap-scan | plate-next | complete | P0 | Find parser command drift. | `runtimeParser.ts` was single-owner glue and `__hasPluginInsertData` was parser-only bridge state. | updated |
| closure-handoff | autoclosure | N/A | N/A | Post-merge/current-tree closure not requested. | This is a scoped Plate Next packet. | retired |
| behavior-proof | core tests | complete | P0 | Preserve parser insert behavior. | Focused parser/DOM tests passed. | updated |
| oracle-repair | core tests | N/A | N/A | Existing parser tests covered parser, fallback, base editor, and replacement behavior. | No new behavior gap found. | retired |
| visual-proof | Browser / Playwright | N/A | N/A | No browser-visible UI surface touched. | Internal Core parser command cleanup only. | retired |
| browser-helper-promotion | browser harness | N/A | N/A | No repeated browser proof pattern touched. | Internal Core tests sufficient. | retired |
| mobile-claim-width | auto | N/A | N/A | No mobile claim in scope. | Internal Core parser command cleanup only. | retired |
| huge-document-smoke | lane proof owner | N/A | N/A | No huge-document claim in scope. | Internal Core parser command cleanup only. | retired |
| perf-packet | lane perf owner | N/A | N/A | No perf claim in scope. | Internal Core parser command cleanup only. | retired |
| supervision-mode | auto | N/A | N/A | No timed runtime requested. | One-shot execution finished. | retired |
| consolidation | plate-next | complete | P1 | Record durable decision in plan. | Parser plugin owns parser clipboard behavior; bridge marker cut. | updated |
| final-handoff | plate-next | complete | P0 | Emit changed list, proof, and risks. | Final handoff rows filled below. | updated |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | replaced by scoped rows |
| 1 | retire broad rows | visual/mobile/huge-doc/perf/browser | current scope | not touched by parser command sweep | N/A rows recorded |
| 1 | update | behavior-proof/package-proof | focused tests and `pnpm check:core` | proof surface is Core parser runtime | complete |

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
| Prompt requirements captured before work | yes | User prompt was "ok go sweep"; scoped to prior parser command drift. |
| `auto` source rule read or fallback recorded | yes | `plate-next` and `autogoal` skills read; `auto` not used directly because this is Plate Next cleanup. |
| `vision` read as checkpoint zero | no | N/A: no taste fork beyond established Plate/Plite boundary law from `plate-next`. |
| Active goal checked or created | yes | Active goal exists for this parser command sweep. |
| Lane resolved | yes | Plate Next / Core boundary cleanup. |
| Invocation mode and timebox recorded | yes | One-shot execution; no duration requested. |
| Dynamic checkpoint policy accepted | yes | Broad seed rows retired where out of scope; Core rows completed. |
| Source of truth and allowed workspaces recorded | yes | Core source/tests in `/Users/zbeyens/git/plate-2`. |
| Output budget strategy recorded | yes | Targeted reads and audits only. |
| Release/PR/publish boundary recorded | yes | N/A: not requested. |
| Browser proof strategy recorded | yes | N/A: no browser surface touched. |
| Package/API proof strategy recorded | yes | Focused Core tests, typecheck, lint, `pnpm check:core`. |
| Mobile/raw-device claim-width policy recorded | yes | N/A: no mobile claim. |
| Skill repair authority and source-rule boundary recorded | yes | N/A: no skill/rule changes. |

Work Checklist:
- [x] First checkpoint complete: explicit prompt, scope, non-goals, proof, stop condition, and final handoff rows recorded.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining backlog ladder, and supervision-mode fallback are recorded.
- [x] Lane is resolved as Plate Next / Core with owning package proof named.
- [x] Checkpoint supervisor table reconciled after the initial seed; irrelevant broad rows marked N/A.
- [x] Post-merge/current-tree closure marked N/A because this is not an autoclosure run.
- [x] Each loop ends with mutation decision recorded in the mutation ledger.
- [x] Current-tree/status packet recorded by targeted source reads before final proof.
- [x] Behavior proof packet recorded for parser insert behavior.
- [x] Visual/native selection proof marked N/A because no browser-visible editing UI changed.
- [x] Missing oracle packet marked N/A because existing parser tests cover parser, fallback, base editor, and replacement behavior.
- [x] Browser helper promotion marked N/A because no browser helper pattern changed.
- [x] Mobile/raw-device proof marked N/A because no mobile claim exists.
- [x] Huge-document correctness smoke marked N/A because no huge-document surface changed.
- [x] Perf packet marked N/A because no perf claim exists.
- [x] Package/API hard cuts audited with stale parser helper source search.
- [x] Docs/vision/rule consolidation marked N/A because decision is local to this plan and code owner.
- [x] Workflow slowdowns logged: none beyond expected `check:core` verbosity.
- [x] Packet ledger contains the parser-command sweep row.
- [x] Changed list is current and includes only this run.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints marked none.
- [x] Autoreview/review gate marked N/A: scoped internal cleanup with `pnpm check:core` pass; no separate review requested.
- [x] Agent-native review marked N/A: no `.agents/**`, commands, skills, hooks, or prompt/tooling changes.
- [x] Output budget discipline followed: targeted reads/searches, capped output.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run proof commands named in this plan | Focused tests, typecheck, lint, source audit, and `pnpm check:core` passed. |
| Dynamic checkpoint reconciliation | yes | Prove plan was updated from evidence and not frozen to seed | Broad rows retired; Core parser rows completed. |
| Lane authority proof | yes | Prove commands ran in owning workspace | All commands ran in `/Users/zbeyens/git/plate-2`; owning package is `@platejs/core`. |
| Workspace authority proof | yes | Record cwd/tool for each proof | Commands listed in Verification evidence. |
| Behavior gates | yes | Run focused behavior proof | `pnpm --filter @platejs/core exec bun test src/lib/plugins/ParserPlugin.spec.ts src/lib/plugins/dom/DOMPlugin.spec.ts` passed. |
| Visual/native selection proof | no | N/A | No browser-visible editing UI changed. |
| Missing oracle repair | no | N/A | Existing parser tests cover the affected behavior. |
| `@platejs/browser` promotion | no | N/A | No browser proof helper touched. |
| Mobile/raw-device claim width | no | N/A | No mobile claim. |
| Huge-document correctness smoke | no | N/A | No huge-document surface changed. |
| Package/API proof | yes | Source-audit and package checks | `pnpm turbo typecheck --filter=./packages/core`, `pnpm --filter @platejs/core lint`, and `pnpm check:core` passed. |
| Autoclosure handoff | no | N/A | Not post-merge/current-tree closure. |
| Skill/rule sync | no | N/A | No `.agents/rules/**` changes. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers | Rows filled below. |
| Final lint/check | yes | Run scoped lint/check | `pnpm --filter @platejs/core lint` and `pnpm check:core` passed. |
| Workflow slowdown review | yes | Log slow steps or N/A | `pnpm check:core` output is verbose but expected; no workflow repair needed. |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling changes. |
| Autoreview for non-trivial implementation changes | no | N/A | Scoped internal cleanup already covered by focused tests and `pnpm check:core`; no explicit autoreview requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-parser-command-sweep.md` | Ready to run after this update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | Objective/scope/proof rows filled. | done |
| Status and current-state read | complete | Inspected parser plugin, bridge, and stale symbol audit. | done |
| Gap scan and scenario matrix | complete | Found single-owner `runtimeParser.ts` and parser-only command marker. | done |
| Behavior proof | complete | Focused parser/DOM tests passed. | done |
| Oracle repair | N/A | Existing tests covered affected parser behavior. | done |
| Visual/native proof | N/A | No browser/UI surface changed. | done |
| Browser helper promotion | N/A | No browser helper pattern changed. | done |
| Mobile/raw-device claim width | N/A | No mobile claim. | done |
| Huge-document correctness smoke | N/A | No huge-document surface changed. | done |
| Perf/API/docs/skill packets as needed | complete | Internal Core API cleanup and plan update only. | done |
| Consolidation and review | complete | Decision recorded in this plan. | done |
| Final handoff and goal-plan check | complete | Verification evidence and final handoff rows filled. | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| Core parser clipboard insertion | base editor + Plate editor | N/A | `insertData` command | parser match, parser fallback, plain text fallback, plugin replacement | complete |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| parser-command-owner | 1 | plate-next | Parser behavior lived in an internal runtime helper and tagged command state instead of living on `ParserPlugin`. | `ParserPlugin.ts`, `currentRuntimeBridge.ts`, deleted `runtimeParser.ts`; focused tests + `pnpm check:core`. | Core tests passed; visual proof N/A. | keep | none |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Parser insertData behavior | `@platejs/core` | `pnpm --filter @platejs/core exec bun test src/lib/plugins/ParserPlugin.spec.ts src/lib/plugins/dom/DOMPlugin.spec.ts` | N/A | 8 pass, 0 fail | none |
| Core + Plite closure | root / `@platejs/core` | `pnpm check:core` | N/A | passed | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| N/A | No browser-visible selection surface touched. | N/A | N/A | N/A | scoped out |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| N/A | No browser helper pattern touched. | N/A | N/A | scoped out |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| N/A | N/A | N/A | N/A | no mobile claim made |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| N/A | N/A | N/A | N/A | no huge-document surface changed |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| `pnpm check:core` | root script | about 19s | Verbose because it covers Core + Plite typecheck, lint, Core test batches, and Plite tests. | passed | no repair; expected closure gate |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `ParserPlugin.ts` now owns parser clipboard behavior; `currentRuntimeBridge.ts` no longer tags parser insert commands; `runtimeParser.ts` deleted. |
| tests/oracles/browser proof | No test files changed; existing parser/DOM tests passed. |
| benchmarks/metrics/targets | N/A |
| examples/docs | N/A |
| skills/workflow | This goal plan updated only. |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | None blocking | The cleanup stayed internal and `pnpm check:core` passed. | `packages/core/src/lib/plugins/ParserPlugin.ts` | No review required unless you want to judge the parser wrapper shape. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | N/A | N/A | No user decision needed. | none | none | continue next Plate Next packet separately | N/A |

Findings:
- `packages/core/src/internal/editor/runtimeParser.ts` had one real owner: `ParserPlugin`.
- The `__hasPluginInsertData` marker in `currentRuntimeBridge` existed only to support the parser helper ordering; after moving parser behavior to plugin-owned clipboard API, it was dead migration glue.
- `createPlateRuntimeEditor.spec.ts` does not exist in this checkout, so focused proof used the actual parser and DOM plugin spec files.

Decisions and tradeoffs:
- Kept parser behavior in Core because Plate parser hooks are product/plugin composition, not generic Plite substrate.
- Used `ParserPlugin.extendExtension` with an `api.clipboard.insertData` wrapper instead of mutating `getCurrentRuntimeCommands`.
- Did not add new tests because existing parser tests already cover matching parser data, previous/fallback insertion, base editor route, plain text fallback, and parser replacement.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm --filter @platejs/core lint` formatting failure | 1 | Apply local formatting fix. | Fixed long `writeSelection` type line; lint passed. |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/ParserPlugin.spec.ts src/lib/plugins/dom/DOMPlugin.spec.ts` -> 8 pass, 0 fail.
- `rg -n 'runtimeParser|installPlateRuntimeParserExtension|createPlateRuntimeParserExtension|__hasPluginInsertData' packages/core/src packages/core/type-tests --glob '!**/dist/**'` -> zero matches.
- `pnpm turbo typecheck --filter=./packages/core` -> passed.
- `pnpm --filter @platejs/core lint` -> passed.
- `pnpm check:core` -> passed.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-27-plate-next-parser-command-sweep.md`
- Lane: Plate Next / Core boundary cleanup
- Surface and route/package: `packages/core`; no route
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: one-shot, no minimum runtime, one loop
- Behavior gates and visual proof: focused Core parser/DOM tests passed; visual proof N/A
- Primary metric baseline/latest/best and stop reason: stale helper audit baseline had matches; latest/best zero stale helper matches; stopped because `pnpm check:core` passed
- Bugs fixed and oracles added: no user-facing bug claimed; removed migration glue; no new oracles needed
- Benchmark/skill/docs repairs: N/A; goal plan updated
- Workflow slowdowns and repairs: `pnpm check:core` verbose but expected; no repair
- Changed list: see Changed list table
- Needs your attention: none blocking
- Stopping checkpoints to unblock: none
- Accepted deferrals and residual risks: no deferrals; residual risk limited to whether you prefer a future Plite clipboard middleware chain for parser hooks, but current Core behavior is green
- Next owner: next `plate-next` packet

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final proof complete. |
| Where am I going? | Run `check-complete`, then close the active goal. |
| What is the goal? | Sweep Plate Core parser command drift. |
| What have I learned? | Parser behavior had a single plugin owner and did not need internal command tagging. |
| What have I done? | Inlined parser runtime behavior into `ParserPlugin`, deleted helper, cut marker, and ran proof. |
| What changed in the checkpoint plan? | Broad auto rows retired as N/A; Core parser rows completed. |

Timeline:
- 2026-06-27T11:21:01.819Z Goal plan created.
- 2026-06-27 Parser behavior moved into `ParserPlugin`.
- 2026-06-27 Deleted `packages/core/src/internal/editor/runtimeParser.ts`.
- 2026-06-27 Removed `__hasPluginInsertData` marker from `currentRuntimeBridge`.
- 2026-06-27 Focused parser/DOM tests, source audit, typecheck, lint, and `pnpm check:core` passed.

Open risks:
- None blocking. Residual design taste only: a future Plite clipboard middleware chain could make this even cleaner, but this packet should not invent that public/substrate API.
