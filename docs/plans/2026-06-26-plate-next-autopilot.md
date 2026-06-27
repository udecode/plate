# plate-next autopilot

Objective:
Plate Next autopilot cleanup; done when one reviewed boundary packet is kept/proven or routed with owner.

Goal plan:
docs/plans/2026-06-26-plate-next-autopilot.md

Automation source:
- type: user-invoked skill
- prompt / link: `$plate-next` with no arguments
- lane: Plate Next boundary cleanup
- surface / route / package: autopilot; started with Core public API/runtime and Plate/Plite boundary surfaces
- invocation mode: one-shot autopilot packet
- minimum runtime / deadline: none requested
- completion threshold summary: requirements captured, VISION/Plate doctrine read, Core runtime/export surface scanned, one public API leak hard-cut and proven

Completion threshold:
Done when the no-arg `plate-next` autopilot requirements are captured, root `VISION.md` plus `docs/vision/common.md` and `docs/vision/plate.md` are read, the highest-risk Plate/Plite boundary surface is scanned, every inspected helper/API in the chosen packet gets a verdict, safe cleanup is implemented or a non-safe public API fork is routed to `plate-plan`, focused proof and exact legacy-name audits are recorded, and final handoff rows are filled.

Verification surface:
- Focused source audits for accidental public runtime exports and old compatibility names.
- Package proof for touched Core files: `pnpm --filter @platejs/core brl`, Core tests, Core build.
- `pnpm turbo typecheck --filter=./packages/core` was attempted and failed on broader Core/Plite migration type debt; no moved-module import errors were found by focused grep.
- Browser proof is N/A because no docs, examples, or browser-visible UI changed.
- Mobile/raw-device, huge-document, benchmark, skill-sync, and agent-native proof are N/A for this package API privacy packet.
- Final plan proof: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-plate-next-autopilot.md`.

Constraints:
- Resolve lane first: Plate Next boundary cleanup.
- No git staging, commit, push, PR, release, or publish work.
- No public compat aliases or runtime shims.
- Do not broaden into full Plate migration.
- Do not redesign Plite substrate unless routed to `plite-plan`.
- Do not start a public API fork without `plate-plan`.
- Use root `VISION.md` and relevant `docs/vision/*.md` for durable taste.

Boundaries:
- Source of truth: live source/tests in this checkout, root `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, and `.agents/skills/plate-next/SKILL.md`.
- Allowed edit scope: the selected Core runtime/export packet under `packages/core/src/react/editor/**`, plus generated barrel proof.
- Browser surfaces: N/A because no docs/examples/UI were edited.
- Package/API surfaces: Core React editor runtime modules and public barrel exports.
- Agent/skill surfaces: read-only for this run.
- Docs/research surfaces: N/A because no public docs described these implementation modules.
- Non-goals: command bridge deletion, runtime flag API redesign, Core typecheck repair, and broad package sweep.

Output budget strategy:
Use `rg -l` file lists before line dumps; inspect only candidate files for the chosen packet; cap command output; record the review matrix in this plan instead of streaming huge logs.

Blocked condition:
Block only when the next necessary move is a public API fork needing `plate-plan`, a destructive git action, an irreversible release/PR action, a missing credential/device, or a taste decision that changes root vision. This run did not hit a hard blocker.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | no-arg `$plate-next` copied as autopilot one-shot packet |
| `plate-next` source rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| `vision` read as checkpoint zero | yes | `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md` read |
| Active goal checked or created | yes | `create_goal` created the active goal |
| Lane resolved | yes | Plate Next boundary cleanup |
| Invocation mode and timebox recorded | yes | no timed minimum |
| Dynamic checkpoint policy accepted | yes | packet selected from scan evidence |
| Source of truth and allowed workspaces recorded | yes | live source/tests plus vision docs |
| Output budget strategy recorded | yes | file-list scans before line reads |
| Release/PR/publish boundary recorded | yes | no git/release action requested |
| Browser proof strategy recorded | yes | N/A because no docs/UI changed |
| Package/API proof strategy recorded | yes | Core brl/test/build/audits |
| Mobile/raw-device claim-width policy recorded | yes | N/A because no mobile claim |
| Skill repair authority and source-rule boundary recorded | yes | N/A because no skill/rule changes |

Review Matrix:
| File/API/helper | Verdict | Evidence | Decision |
|-----------------|---------|----------|----------|
| `packages/core/src/react/editor/runtimeInputRules.ts` | hard-cut public export, keep implementation | only used by `createPlateRuntimeEditor`; exported by barrel only | moved to `react/editor/internal/runtimeInputRules.ts` |
| `packages/core/src/react/editor/runtimeNodeId.ts` | hard-cut public export, keep implementation | only used by `createPlateRuntimeEditor`; exported by barrel only | moved to `react/editor/internal/runtimeNodeId.ts` |
| `packages/core/src/react/editor/runtimeParser.ts` | hard-cut public export, keep implementation | only used by `createPlateRuntimeEditor`; exported by barrel only | moved to `react/editor/internal/runtimeParser.ts` |
| `packages/core/src/react/editor/index.ts` | hard-cut accidental public surface | barrelsby re-exported implementation modules | regenerated without runtime installer exports |
| `packages/core/src/internal/currentRuntimeBridge.ts` | defer-with-owner | many Core/package tests and runtime paths still call `getCurrentRuntimeCommands` | next Plate Next packet, not this one |
| `PlateRuntimePlugin.runtimeInputRules/runtimeNodeId/runtimeParser` flags | defer-with-owner | still appear in exported `PlateRuntimePlugin` types | decide later whether public capability flags or private metadata |
| `runtimeTxExtensions.ts` | keep-in-plate | maps Plate plugin tx groups into Plite `editor.update` | keep |

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | done | P0 | Copy requirements and read vision before implementation. | Skill, root vision, common vision, and Plate vision read. | updated |
| status | auto | done | P0 | Read active plan and current evidence. | Existing plan shell read and goal created. | updated |
| gap-scan | auto | done | P0 | Identify API/runtime gaps. | Core compatibility and runtime export scans completed. | updated |
| package-api-proof | Core | done | P0 | Prove the public API hard cut and runtime behavior. | brl, tests, build, and audits completed. | updated |
| visual-proof | Browser | n/a | P0 | No visible route changed. | Browser proof scoped out. | retired |
| mobile-claim-width | auto | n/a | P1 | No mobile claim. | Raw-device proof scoped out. | retired |
| huge-document-smoke | auto | n/a | P1 | No huge-document claim. | Smoke scoped out. | retired |
| perf-packet | auto | n/a | P2 | No perf claim. | Metrics scoped out. | retired |
| final-handoff | auto | done | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Final handoff rows filled. | updated |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded |
| 1 | update | gap-scan, package/API proof | `rg` found accidental runtime module exports from `react/editor/index.ts` | public runtime installer modules are implementation plumbing | selected packet |
| 1 | retire | browser/mobile/huge-doc/perf/oracle rows | no visible/editor behavior claim changed | avoid fake proof scope | closed as N/A |
| 1 | defer | command bridge deletion | `getCurrentRuntimeCommands` has many package/test callers | too broad for one safe packet | next owner: Plate Next |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining backlog ladder, and supervision-mode fallback are recorded.
- [x] Lane is resolved as Plate Next, with owning workspace/package proof named.
- [x] Checkpoint supervisor table has been reconciled at least once after the initial seed.
- [x] Post-merge/current-tree closure is routed to `autoclosure` when in scope, or marked N/A with reason.
- [x] Each loop ends with a checkpoint mutation decision: selected one safe packet, retired non-applicable proof rows, deferred broad command bridge deletion.
- [x] Current-tree/status packet recorded before new runtime patches.
- [x] Behavior proof packet recorded as focused Core tests/build because no behavior logic changed.
- [x] Visual/native selection proof packet marked N/A because no browser-visible route changed.
- [x] Missing oracle packets marked N/A because no behavior gap was found.
- [x] Repeated browser proof patterns marked N/A because no browser proof was needed.
- [x] Mobile/raw-device proof marked N/A because no mobile claim was made.
- [x] Huge-document correctness smoke marked N/A because no huge-document behavior changed.
- [x] Perf packet marked N/A because no performance claim was made.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are audited for the chosen runtime module export packet.
- [x] Docs/vision/rule consolidation marked N/A because the existing doctrine already covers the decision.
- [x] Workflow slowdowns logged: Core typecheck currently fails from broader source/dist/type debt, not this packet.
- [x] Packet ledger contains one row for the runtime installer privacy packet.
- [x] Changed list is current and includes only this run.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued.
- [x] Autoreview/review gate marked N/A because this is a small mechanical public-export hard cut with direct tests/build.
- [x] Agent-native review marked N/A because no `.agents/**`, commands, skills, hooks, or prompt/tooling changed.
- [x] Output budget discipline followed: broad scans were file lists or capped outputs.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run proof named in this plan | `pnpm --filter @platejs/core brl`, Core tests twice, Core build, source audits |
| Dynamic checkpoint reconciliation | yes | Update plan from evidence | Broad command bridge deletion deferred; runtime installer privacy packet selected |
| Lane authority proof | yes | Run in Plate repo root / Core package | All commands ran from `/Users/zbeyens/git/plate-2` with `@platejs/core` filter |
| Workspace authority proof | yes | Record cwd/tool | Cwd is Plate checkout; no donor checkout used |
| Behavior gates | yes | Run focused stable behavior proof | Core test runner passed 733 tests twice |
| Visual/native selection proof | no | Record N/A | No UI/docs/browser route changed |
| Missing oracle repair | no | Record N/A | No behavior gap found |
| `@platejs/browser` promotion | no | Record N/A | No repeated browser proof pattern |
| Mobile/raw-device claim width | no | Record N/A | No mobile claim |
| Huge-document correctness smoke | no | Record N/A | No huge-document behavior change |
| Package/API proof | yes | Source-audit and package proof | Public barrel no longer exports runtime installer modules; Core build passed |
| Autoclosure handoff | no | Record N/A | Not post-merge/current-tree closure |
| Skill/rule sync | no | Record N/A | No `.agents/**` edits |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers | Ledgers below |
| Final lint/check | scoped | Run feasible proof and record broader blocker | Core build/tests passed; Core typecheck fails on broader existing unresolved `@platejs/plite`/migration debt |
| Workflow slowdown review | yes | Log slow/blocked gate | Typecheck failure recorded as next owner |
| Agent-native review for agent/tooling changes | no | Record N/A | No agent/tooling changes |
| Autoreview for non-trivial implementation changes | no | Record N/A | Small mechanical internal move; direct proof used |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-plate-next-autopilot.md` | Ready to run after this edit |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | done | plan filled from no-arg `$plate-next` | gap scan |
| Status and current-state read | done | existing plan and active goal checked | gap scan |
| Gap scan and scenario matrix | done | Core runtime/export scans | behavior proof |
| Behavior proof | done | Core tests passed | package proof |
| Oracle repair | n/a | no behavior gap | final handoff |
| Visual/native proof | n/a | no route changed | final handoff |
| Browser helper promotion | n/a | no browser proof pattern | final handoff |
| Mobile/raw-device claim width | n/a | no mobile claim | final handoff |
| Huge-document correctness smoke | n/a | no huge-doc claim | final handoff |
| Perf/API/docs/skill packets as needed | done | runtime installer modules made internal; command bridge/typecheck debt deferred | consolidation |
| Consolidation and review | done | decision logged in packet and stopping ledgers | final handoff |
| Final handoff and goal-plan check | done | handoff rows filled | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| Core React editor runtime installer modules | package API | N/A | N/A | public export audit + build/test | done |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| Runtime installer privacy | 1 | Plate Next | `runtimeInputRules`, `runtimeNodeId`, and `runtimeParser` were implementation modules accidentally exported from `@platejs/core/react` editor barrel | moved files to `packages/core/src/react/editor/internal/*`; updated `createPlateRuntimeEditor.ts`; ran brl/tests/build/audits | Core tests passed twice; no visual surface | keep | next: command bridge and runtime capability flags |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Core package runtime behavior | `@platejs/core` | `pnpm --filter @platejs/core test -- createPlateRuntimeEditor.spec.ts` | N/A | 733 pass | none |
| Parser/runtime coverage | `@platejs/core` | `pnpm --filter @platejs/core test -- ParserPlugin.spec.ts` | N/A | 733 pass | runner ignores filename and runs Core suite |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| N/A | no editor behavior changed | no browser route changed | no geometry claim | no Browser proof needed | scoped out |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| N/A | no browser proof pattern | none | N/A | scoped out |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| N/A | N/A | N/A | no claim | no mobile claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| N/A | N/A | N/A | no huge-document path touched | scoped out |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| `pnpm turbo typecheck --filter=./packages/core` | Plate Next / Core typing lane | about 9s before failure | broader source/dist split and migration type debt; many errors start with unresolved `@platejs/plite` and cascade, not caused by moved files | failure output recorded in chat; focused grep found no moved-module import errors | do not fix inside this privacy packet; next owner should repair Core source-first typecheck separately |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | moved `runtimeInputRules.ts`, `runtimeNodeId.ts`, `runtimeParser.ts` under `packages/core/src/react/editor/internal/`; updated `createPlateRuntimeEditor.ts`; regenerated `packages/core/src/react/editor/index.ts` |
| tests/oracles/browser proof | no test files changed; Core tests/build run |
| benchmarks/metrics/targets | none |
| examples/docs | none |
| skills/workflow | goal plan updated only |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Runtime feature flags are still public through `PlateRuntimePlugin` type | `runtimeInputRules`, `runtimeNodeId`, and `runtimeParser` remain capability flags, even though installer modules are private | `packages/core/src/react/editor/createPlateRuntimeEditor.ts` | Decide in a future Plate Next packet whether those flags become private plugin metadata or stay supported plugin authoring surface |
| 2 | Command bridge deletion is still the real cleanup | `getCurrentRuntimeCommands` has many package/test callers, so cutting it requires package migration | `packages/core/src/internal/currentRuntimeBridge.ts` | Next Plate Next packet should migrate packages off command bridge toward `editor.update`/plugin tx |
| 3 | Core typecheck gate is not trustworthy yet | It fails on broader unresolved Plite/migration type debt, not this packet | `packages/core/tsconfig.json` | Run a dedicated Core typecheck repair lane before claiming Core package fully green |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| SP-1 | soft | Are runtime capability flags public API or private plugin metadata? | They appear in exported types even after installer modules are private. | cutting the flags | command bridge cleanup and package migrations | Treat as private metadata unless docs prove plugin authors need them. | `packages/core/src/react/editor/createPlateRuntimeEditor.ts` |
| SP-2 | soft | Should command bridge removal happen package-by-package or after Core typecheck repair? | The bridge has broad callers and type debt makes regressions harder to prove. | hard deletion of `currentRuntimeBridge` | privacy hard cut completed | Repair typecheck first, then migrate command callers in batches. | `packages/core/src/internal/currentRuntimeBridge.ts` |

Findings:
- Core barrel was exporting implementation-only runtime installer modules.
- Moving those files under an `internal` subfolder prevents barrelsby from re-exporting them.
- The old command bridge is active and broad; direct deletion would be reckless in this packet.
- Core typecheck currently fails for broader unresolved Plite/migration type debt.

Decisions and tradeoffs:
- Kept the privacy packet because it narrows public API with no behavior change.
- Deferred command bridge deletion because callers span Core tests and several packages.
- Did not touch docs because no docs currently teach these runtime installer modules.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Core typecheck failed on broader migration/type debt | 1 | Use focused tests/build/audits for this packet and queue typecheck repair separately | recorded as workflow slowdown |

Verification evidence:
- `pnpm --filter @platejs/core brl` passed.
- `pnpm --filter @platejs/core test -- createPlateRuntimeEditor.spec.ts` passed: 733 pass, 0 fail.
- `pnpm --filter @platejs/core test -- ParserPlugin.spec.ts` passed: 733 pass, 0 fail.
- `pnpm --filter @platejs/core build` passed.
- Source audit found no `export * from './runtimeInputRules'`, `runtimeNodeId`, or `runtimeParser` in Core source/dist barrels.
- `pnpm turbo typecheck --filter=./packages/core` failed on broader unresolved `@platejs/plite` and migration type errors; no moved-module import errors were found by focused grep.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-26-plate-next-autopilot.md`
- Lane: Plate Next boundary cleanup
- Surface and route/package: `@platejs/core` React editor runtime modules
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: no-arg one-shot autopilot, no timed minimum, 1 loop
- Behavior gates and visual proof: Core tests/build passed; Browser proof N/A because no UI/docs route changed
- Primary metric baseline/latest/best and stop reason: N/A; no perf metric claimed
- Bugs fixed and oracles added: no behavior bug; accidental public runtime installer exports hard-cut
- Benchmark/skill/docs repairs: none
- Workflow slowdowns and repairs: Core typecheck broader debt logged for next owner
- Changed list: see Changed list table
- Needs your attention: runtime flags, command bridge deletion, Core typecheck
- Stopping checkpoints to unblock: SP-1 and SP-2
- Accepted deferrals and residual risks: command bridge and runtime flags deferred; typecheck remains dirty from broader lane
- Next owner: Plate Next command bridge/typecheck repair packet

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff |
| Where am I going? | Run plan completion check, then close the goal |
| What is the goal? | Plate Next autopilot cleanup with one reviewed boundary packet kept/proven or routed |
| What have I learned? | Runtime installer modules were public by barrel; command bridge remains broad active debt |
| What have I done? | Moved runtime installer modules internal, regenerated barrel, ran proof |
| What changed in the checkpoint plan? | Non-applicable proof rows retired; command bridge and runtime flags deferred |

Timeline:
- 2026-06-26: Goal plan created.
- 2026-06-26: Plate Next autopilot selected the runtime installer privacy packet.
- 2026-06-26: Runtime installer modules moved internal and Core proof run.

Open risks:
- Core typecheck is not green because broader Core/Plite migration type debt remains.
- Runtime capability flags remain in exported `PlateRuntimePlugin` types.
- `currentRuntimeBridge` remains an active command compatibility layer and needs a larger package-by-package deletion lane.
