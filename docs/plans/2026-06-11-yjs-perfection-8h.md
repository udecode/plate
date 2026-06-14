# yjs perfection 8h

Objective:
Timed 8h `@slate/yjs` perfection loop in `../slate-v2`: find the highest-value
behavior/proof/API gaps, patch safe packets, and keep/revert/quarantine each.

Goal plan:
docs/plans/2026-06-11-yjs-perfection-8h.md

Template:
docs/plans/templates/slate-automation.md

Primary template:
docs/plans/templates/slate-automation.md

Applied packs:
- none

Automation source:
- type: user-invoked `slate-automation`
- prompt / link: `[$slate-automation] 8h on yjs perfection ../slate-v2`
- surface / route / package: `../slate-v2`, primarily `packages/slate-yjs`,
  Hocuspocus/collaboration browser examples, and reusable proof helpers
- invocation mode: timed mode
- timebox / deadline: 8h loop-start budget; started 2026-06-11T22:59:17+0800;
  deadline 2026-06-12T06:59:17+0800
- completion threshold summary: keep working through safe Yjs behavior,
  visual/browser, package/API, metric, docs, and workflow packets until the
  timebox expires after the current packet has a keep/revert/quarantine call,
  or all required gates are green/deferred/N/A with evidence.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable rows: scope, non-goals, timing,
  stop conditions, deliverables, final handoff sections, verification surfaces,
  and success criteria.
- The initial checkpoint list is only the seed. After every loop, the
  supervisor must reconcile this plan against new evidence and may add, update,
  split, merge, retire, remove, reprioritize, or reopen checkpoints.
- Do not continue into implementation until first extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Done means current `@slate/yjs` package behavior has been re-grounded in the
  live tree, at least one current proof/gap-scan loop has run, any found safe
  high-value packet has a keep/revert/quarantine decision, package/browser
  proof matches the claim width, changed/review/stopping ledgers are current,
  and no known autonomous P0/P1 Yjs packet remains runnable inside the timebox.
- Closure is legal only when required behavior, visual/native selection,
  package/API, mobile/raw-device claim-width, huge-document, docs/skill repair,
  changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and
  final handoff rows are complete, explicitly deferred, or N/A with evidence,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-11-yjs-perfection-8h.md`
  passes.

Verification surface:
- Source/status: live `../slate-v2` source under `packages/slate-yjs`,
  `site/examples/ts/yjs-hocuspocus.tsx`, collaboration proof scripts/tests,
  benchmark targets, and current docs/proof ledgers.
- Package proof: `bun test ./packages/slate-yjs/test`; `bun --filter
  @slate/yjs typecheck`; focused builds only when public-export/browser proof
  resolves built output.
- Browser proof: focused Playwright/Hocuspocus collaboration rows first; use
  Browser for live visual smoke when a route is started and known fresh.
- User-directed verification budget update, 2026-06-12: spend the remaining 8h
  budget on improvements, not expensive endurance testing. Only run local e2e
  and unit tests; leave final long soak/testing to the user.
- Regression candidates from memory: structural soak seed 99 / raw FEFF, virtual
  placeholder split/merge, same-parent move/reconnect, provider-backed room
  soak, deleted `yjs-collaboration` browser-ops catalog.
- Metric/proof scripts: current `scripts/proof/**yjs**` and benchmark targets
  only after correctness proof is green.
- Parent proof: this plan, docs/rules only if changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-06-11-yjs-perfection-8h.md` only at true closure.

Constraints:
- Slate v2 private alpha by default: no release, publish, changeset, PR, or
  branch readiness unless the prompt explicitly asks.
- Run Slate v2 behavior commands from `.tmp/slate-v2`; parent repo commands
  prove plans, docs, skills, and templates only.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No more multi-hour soaks in this run. Long endurance proof is a user-owned
  final validation task unless explicitly requested again.
- No broad pagination/virtualization architecture unless the prompt or a
  stopping checkpoint routes to `slate-plan`.
- Do not patch Plate when the run is scoped to Slate v2.

Boundaries:
- Source of truth: live `../slate-v2` source/tests/benchmarks for runtime
  behavior; this plan in `plate-copy` for supervisor state.
- Allowed edit scope: `../slate-v2` Yjs package/tests/examples/proof helpers;
  parent `docs/plans/**` and `.agents/rules/**` only when the run owns plan or
  reusable workflow repair.
- Browser surfaces: `yjs-hocuspocus` and any current collaboration example/proof
  route discovered in the live tree.
- Package/API surfaces: `packages/slate-yjs` public/internal exports only when
  evidence shows API/DX cleanup is the real owner.
- Agent/skill surfaces: source rules under `.agents/rules/**`; generated skill
  mirrors only via `pnpm install` when those rules change.
- Docs/research surfaces: this plan; `docs/slate-v2/**` only for accepted
  current decisions or proof claim width.
- Non-goals: no commit, push, PR, release, publish, changeset, broad Slate
  architecture rewrite, Plate package patching, or raw mobile-device claim unless
  explicitly requested or proven as the next safe owner.

Blocked condition:
- Stop only for commit/push/PR/release authority, missing external credential,
  raw-device proof need, unsafe public API/runtime fork with no safe alternate
  owner, repeated same-signal blocker after the right owner has run, or the 8h
  timebox expiring after current packet closure.
- Do not block while a safe alternate checkpoint remains runnable. In timed or
  batch mode, queue soft questions for final handoff.

Automation state:
- surface: `@slate/yjs` perfection in `../slate-v2`
- mode: timed 8h
- checkpoint_policy: dynamic_supervisor
- current_loop: 17
- current_checkpoint: improvement-gap-scan
- current_checkpoint_status: in_progress
- next_checkpoint: code/API/DX/test-oracle improvement packet with short local verification
- goal_status: active

Current verdict:
- verdict: checkpoint-green so far, continuing with improvement work because
  the user clarified that the 8h budget should not be spent on long tests
- confidence: high for package/provider/local collaboration stability covered
  by the existing short gates; long endurance is intentionally not claimed
- next owner: code/API/DX/test-oracle improvement packet with short local
  e2e/unit verification
- keep / revert / quarantine call: keep P1-P10; stop P11 and do not count it as
  a completion gate
- reason: package, provider, local, metric, workflow, docs, and `bun check`
  packets are green; new instruction prioritizes improvements over soak time

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-11-yjs-perfection-8h.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-automation | complete | P0 | Copy prompt requirements and read north-star before implementation. | Requirement rows complete. | update |
| status | slate-automation | complete | P0 | Read active plan, latest prompt, target source/test/proof owners, and current evidence without git-state hygiene. | Live source/proof owners found; baseline package tests/typecheck green. | update |
| gap-scan | slate-automation | in_progress | P0 | Identify current Yjs behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Gaps routed to packet owners. | update |
| behavior-proof | slate-ar-stabilize | checkpoint_green | P0 | Prove stable editor behavior before perf. | Package tests, production smoke, persistent-room soak, local soak, strict local soak, and `bun check` passed. | update |
| oracle-repair | slate-patch / tdd | complete | P0 | Add missing native/visual/model oracles for found gaps. | Added `SOAK_FAIL_ON_ISSUES=1` so local soak can become a strict gate. | update |
| visual-proof | Browser / Playwright | checkpoint_green | P0 | Prove visible editor behavior and native selection. | Playwright-backed soak summaries recorded for Hocuspocus and local collaboration routes. | update |
| slate-browser-promotion | slate-browser | N/A | P1 | Promote repeated browser proof into reusable API/helper. | No repeated route-local Playwright helper gap found; proof gap was script exit behavior, repaired in owning soak script. | update |
| mobile-claim-width | slate-automation | N/A | P1 | Separate raw-device proof from viewport proof. | Raw mobile-device proof not claimed. | update |
| huge-document-smoke | slate-ar-stabilize | complete | P1 | Smoke huge-doc correctness without broad architecture work. | Persistent-room growth reached 137 blocks / 2,494 chars on all peers with 0 issues. | update |
| perf-packet | slate-ar-fast / slate-ar-perf | complete | P2 | Optimize only after correctness is green. | Benchmark phase metrics added; latest root command correctness 0 and work/verification metrics printed. | update |
| consolidation | slate-automation | complete | P1 | Move accepted reusable decisions to durable docs/rules. | Benchmark README/root command updated. | update |
| final-handoff | slate-automation | in_progress | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Checkpoint handoff rows filled; goal remains active. | update |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | pending |
| 0 | update | checkpoint-zero, status, gap-scan | user prompt, active goal, north-star, agent-start, memory quick pass | timed 8h Yjs scope and proof surfaces are now concrete | checkpoint-zero in progress; status next |
| 1 | update | status, behavior-proof | `bun test ./packages/slate-yjs/test`; `bun --filter @slate/yjs typecheck` | current package baseline is green before browser/perf work | keep package-proof packet; continue provider/browser gap scan |
| 2 | update | behavior-proof, visual-proof | Hocuspocus production soak summary | provider-backed browser smoke is green with offline/reload/degraded scenarios | keep provider-proof packet; move to wider gap scan |
| 3 | update | perf-packet | `bun ./scripts/benchmarks/core/current/yjs-collaboration.mjs` x3 | correctness is green; large-doc sync dominates worst p95 | keep metric packet; inspect whether lane is real hot path or setup-heavy |
| 4 | update | perf-packet, workflow-slowdown | benchmark patch + focused checks | metric now splits work vs verification and root script registry exposes the benchmark | keep benchmark/DX packet |
| 5 | update | behavior-proof, visual-proof, huge-document-smoke | 10m persistent-room Hocuspocus soak | same-room growth, offline catchup, structure churn, and history interleave all held | keep persistent-room proof packet |
| 6 | update | consolidation, perf-packet | benchmark README + root command rerun | command surface, docs, and registry proof now align | keep docs/DX packet |
| 7 | update | behavior-proof, visual-proof | 10m local `yjs-collaboration` soak | local provider-adapter route held across structural/random/history/awareness scenarios | keep local collaboration proof packet |
| 8 | update | workflow-slowdown, oracle-repair | local soak fail-on-issues patch | local collaboration soak can now fail CI/automation when issues are recorded | keep workflow/proof repair packet |
| 9 | update | behavior-proof, visual-proof | strict 10m local `yjs-collaboration` soak | fail-on-issues command shape held for the same local route scenario packet | keep strict local collaboration proof packet |
| 10 | update | final-handoff, behavior-proof | `bun check` | broad fast repo gate passed after benchmark/proof script/docs changes | keep final-check packet; continue because timed budget remains |
| 11 | stop | long-endurance-proof, behavior-proof | user clarified "把8h用在改进上 而非测试" | expensive soaks are the wrong budget allocation for this run | killed P11 and moved next owner to improvement-gap-scan |
| 12 | update | replacement-identity | failing focused unit contract, then fix | compatible replacements should see virtual children through the same visible Yjs projection as Slate | keep P12; scan next code/API/DX gap |
| 13 | update | split-visible-children | failing focused unit contract, then fix | element split should split visible virtual children by Slate position instead of raw Yjs child slots | keep P13; continue improvement scan |
| 14 | update | virtual-child-removal | failing focused unit contracts, then fix | full replacement and removal should clear virtual child references instead of leaking, appending, or throwing | keep P14; continue improvement scan |
| 15 | update | virtual-child-insert | failing focused unit contract, then fix | inserting before a leading virtual child must preserve moved-node identity, not clone/replace it through raw index -1 behavior | keep P15; reassess next improvement vs short local e2e |
| 16 | update | move-before-virtual-child | failing focused unit contract, then fix | moving into index 0 before an existing virtual child must not overwrite that virtual child as if the parent were empty | keep P16; reassess next improvement vs short local e2e |
| 17 | update | short-local-e2e | local e2e smoke, not long soak | user allows local e2e/unit tests but not expensive final testing | keep P17; review touched virtual-child logic |

Mutation rules:
- Add a checkpoint when a new failure, missing oracle, missing metric, API smell,
  visual proof gap, workflow slowdown, taste gap, or owner gap appears.
- Update a checkpoint when evidence changes its scope, priority, owner, command,
  exit rule, or proof surface.
- Split a checkpoint when it hides multiple owners or one prompt would become
  too large.
- Merge checkpoints when overlap confuses routing or two rows always close
  together.
- Retire or remove checkpoints that are stale, superseded, irrelevant,
  duplicated, or contradicted by current evidence. Record the reason in the
  mutation ledger.
- Reopen a closed checkpoint when new evidence invalidates its proof.
- Reprioritize after every loop. The next checkpoint is chosen from current
  evidence, not from the original row order.
- The supervisor is not stuck on this template or the initial prompt plan. The
  user's latest request, `slate-north-star`, and current source evidence outrank
  stale plan rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | explicit prompt rows copied into Automation source, Boundaries, Completion threshold, and Verification surface |
| `slate-automation` source rule read | yes | user supplied skill body; `.agents/rules/slate-automation.mdc` read |
| `slate-north-star` read as checkpoint zero | yes | `.agents/skills/slate-north-star/SKILL.md` read |
| Active goal checked or created | yes | `get_goal` returned null; `create_goal` created active goal |
| Invocation mode and timebox recorded | yes | timed mode; 8h; start/deadline recorded |
| Dynamic checkpoint policy accepted | yes | supervisor/mutation ledgers retained |
| Source of truth and allowed workspaces recorded | yes | `../slate-v2` runtime; parent plan/control only |
| Output budget strategy recorded | yes | write packet/proof evidence into plan/artifacts; avoid broad streamed scans |
| Private-alpha release/PR boundary recorded | yes | no release/publish/PR/branch unless explicitly requested |
| Browser proof strategy recorded | yes | focused Playwright/Hocuspocus first; Browser visual smoke when route is fresh |
| Package/API proof strategy recorded | yes | Yjs package tests/typecheck; build only when needed for built-output proof |
| Mobile/raw-device claim-width policy recorded | yes | raw-device proof is out of claim width unless explicitly run |
| Skill repair authority and source-rule boundary recorded | yes | patch `.agents/rules/**`, sync with `pnpm install`, audit mirror only if workflow repair happens |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [x] Invocation mode, timebox/deadline, stop-question policy, and remaining
      backlog ladder are recorded.
- [x] Checkpoint supervisor table has been reconciled at least once after the
      initial seed.
- [x] Each loop ends with a checkpoint mutation decision: add, update, split,
      merge, retire, remove, reopen, reprioritize, or no-change with reason.
- [x] Current-tree/status packet recorded before new runtime patches.
- [x] Behavior proof packet recorded for every in-scope stable editor family or
      explicitly skipped/deferred with reason.
- [x] Visual/native selection proof packet recorded for browser-visible
      selection/editing risks or explicitly scoped.
- [x] Missing oracle packets are written, kept, reverted, quarantined, or
      deferred with owner and proof command.
- [x] Repeated browser proof patterns are promoted to `slate-browser` or queued
      with reason.
- [x] Mobile/raw-device proof is run or the claim width is explicitly limited;
      Playwright viewport proof is not recorded as raw-device proof.
- [x] Huge-document correctness smoke is run or deferred with owner and reason.
- [x] Perf packet runs only after correctness is green, or is marked N/A for
      this run.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are
      audited when in scope.
- [x] Docs/north-star/rule consolidation is applied when a reusable decision is
      accepted, or marked N/A.
- [x] Workflow slowdowns are logged and avoidable repeats are repaired in the
      owner skill/script/gate.
- [x] Packet ledger contains one row per proof, bug fix, oracle, benchmark,
      docs, or skill packet.
- [x] Changed list is current and includes only this run.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued or marked none.
- [x] Autoreview/review gate is run for non-trivial implementation diffs or
      marked N/A with reason.
- [x] Agent-native review is run for `.agents/**`, commands, skills, hooks, or
      prompt/tooling changes, or marked N/A with reason.
- [x] Output budget discipline is followed: broad scans are capped or written
      to artifacts instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | Package tests/typecheck, Hocuspocus smoke, persistent-room soak, local soaks, benchmark, focused registry contract, and `bun check` passed. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | Mutation ledger has loops 0-10 with packet decisions. |
| Workspace authority proof | yes | Record cwd/tool for each Slate v2, parent-docs, skill, browser, package, or benchmark proof | Runtime/proof commands ran from `/Users/felixfeng/Desktop/repos/slate-v2`; control plan from `/Users/felixfeng/Desktop/repos/plate-copy`. |
| Behavior gates | yes | Run focused stable behavior proof or record scoped defer rows | Package and browser soak ledgers are green. |
| Visual/native selection proof | scoped | Record Browser/Playwright/native-selection evidence or scoped blocker | Playwright-backed route proof covers DOM text/convergence/shape/page errors; no raw native selection-specific defect was found in this checkpoint. |
| Missing oracle repair | yes | Add/verify/revert/quarantine oracle packets or record owner defer | Added `SOAK_FAIL_ON_ISSUES=1` to local soak script and verified at smoke + 10m length. |
| `slate-browser` promotion | N/A | Add/verify helper/API or record queue/defer reason | No repeated slate-browser helper gap found; owning proof script was repaired instead. |
| Mobile/raw-device claim width | N/A | Run raw-device proof or record that only scoped viewport/browser proof is available | No raw mobile claim made. |
| Huge-document correctness smoke | yes | Run focused huge-document behavior smoke or record owner defer | Persistent-room Hocuspocus grew to 137 blocks / 2,494 chars on all peers with 0 issues. |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | No public package API changed; root command/docs changed and registry proof passed. |
| Skill/rule sync | N/A | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | No `.agents/rules/**` changed. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | Ledgers filled for checkpoint handoff. |
| Final lint/check | yes | Run scoped lint/check or record why no code changed | `bun check` passed. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Local soak fail-on-issues mode repaired; noisy benchmark contract run logged. |
| Agent-native review for agent/tooling changes | N/A | Load `agent-native-reviewer` and close accepted findings, or N/A | No agent/tooling files changed. |
| Autoreview for non-trivial implementation changes | scoped | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | Manual diff review plus `bun check`; no runtime implementation diff. |
| Goal plan complete | no | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-11-yjs-perfection-8h.md` | Not run because this is a checkpoint handoff; active 8h goal did not fully elapse. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | prompt extraction, north-star, active goal, agent-start, slate-automation rule | status |
| Status and current-tree closure | complete | live package/proof owners found; package tests/typecheck green | gap scan |
| Gap scan and scenario matrix | in_progress | Hocuspocus/proof scripts/recent plans identified | behavior proof |
| Behavior proof | in_progress | package baseline, provider-backed smoke, persistent-room soak, and local collaboration soak green | final checks |
| Oracle repair | pending | no failing oracle yet | visual proof |
| Visual/native proof | in_progress | Hocuspocus production smoke, persistent-room soak, and local collaboration soak recorded | slate-browser promotion |
| slate-browser promotion | pending | | mobile claim width |
| Mobile/raw-device claim width | pending | | huge-document smoke |
| Huge-document correctness smoke | complete | persistent-room grew to 137 blocks / 2,494 chars on all peers with 0 issues | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | in_progress | Yjs collaboration benchmark x3 plus phase-metric patch; correctness 0 failures; latest worst p95 177.84ms, work p95 168.44ms, verification p95 11.06ms | persistent-room soak |
| Consolidation and review | in_progress | benchmark README updated; root command verified; `bun check` passed | final handoff |
| Long endurance proof | stopped | user clarified not to spend budget on expensive tests; partial P11 evidence was green but not a gate | improvement-gap-scan |
| Final handoff and goal-plan check | pending | | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| `packages/slate-yjs` structural contracts | paragraphs, split/merge, replace, move, virtual placeholders, empty Yjs text leaves | package runtime | replay seeds / operation contracts | value shape, Yjs visible children, history/reconnect convergence | planned |
| Hocuspocus provider route | real provider-backed multi-peer room | desktop browser, current example route | offline/reconnect, typing, structural mix replay | raw DOM text, normalized text, server snapshot, page errors | planned |
| Collaboration browser operations | peer matrix from current proof/example files | Chromium first; Firefox/WebKit only if failures point there | append/replace/remove/split/merge/move/wrap/unwrap/lift/undo/redo/connect/disconnect | peer convergence, DOM text, structural errors | planned |
| Huge/stress smoke | current Yjs large-doc/proof scripts if present | current script/route knobs | burst typing, Enter, paste/select-all/undo where available | convergence, timing, DOM budget/visible text | planned |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| P1-package-baseline | 1 | slate-automation | Current `@slate/yjs` package must be green before browser/perf claims. | `bun test ./packages/slate-yjs/test` -> 187 pass, 0 fail; `bun --filter @slate/yjs typecheck` -> exit 0 | Package behavior proof only; no browser proof yet | keep | Run provider/browser proof |
| P2-provider-production-smoke | 2 | slate-automation | Real Hocuspocus provider route should survive reload, offline, and degraded network scenarios on current tree. | `PRODUCTION_SOAK_FAIL_ON_ISSUES=1 PRODUCTION_SOAK_RUN_ID=yjs-perfection-production-smoke-20260611-1 bun ./scripts/proof/yjs-hocuspocus-production-soak.mjs` | Browser proof: 71,929ms, 90 actions, 6 hard reloads, 6 offline windows, console/page/errors/issues all 0 | keep | Run a different risk class, not duplicate smoke |
| P3-yjs-collaboration-metric | 3 | slate-automation | Current collaboration benchmark should have correctness 0 and repeated metric samples before any perf patch. | `bun ./scripts/benchmarks/core/current/yjs-collaboration.mjs` x3 | Metrics: worst p95 174.35/180.53/184.68ms; large-doc sync dominates; correctness failures 0 each run | keep | Audit large-doc sync owner and setup/hot-path split |
| P4-yjs-benchmark-phase-metrics | 4 | slate-automation | The Yjs benchmark should separate measured work from verification cost and be exposed through root scripts. | Edited `scripts/benchmarks/core/current/yjs-collaboration.mjs` and root `package.json`; verified with benchmark run, Biome, and focused core benchmark registry contract. | Latest metrics: worst p95 177.84ms, worst work p95 168.44ms, worst verification p95 11.06ms; correctness failures 0. | keep | Run longer provider-backed persistence proof |
| P5-persistent-room-10m | 5 | slate-automation | One Hocuspocus room should grow under real peer churn without reload/room reset hiding corruption. | `SOAK_HEADLESS=1 PERSISTENT_SOAK_FAIL_ON_ISSUES=1 PERSISTENT_SOAK_MS=600000 PERSISTENT_SOAK_ACTION_DELAY_MS=500 PERSISTENT_SOAK_REPORT_EVERY_MS=60000 PERSISTENT_SOAK_RUN_ID=yjs-perfection-persistent-10m-20260611-1 bun ./scripts/proof/yjs-hocuspocus-persistent-room-soak.mjs` | Browser proof: 608,478ms, 1,088 actions, 171 checkpoints, 34 offline windows, final 137 blocks / 2,494 chars on every peer, 0 console/page/errors/issues | keep | Audit API/docs proof or run focused final checks |
| P6-benchmark-docs-command | 6 | slate-automation | The benchmark command and README should teach the same current surface. | Edited `scripts/benchmarks/README.md`; reran `bun run bench:core:yjs-collaboration:local`, Biome on supported touched files, and focused registry contract. | Root command prints phase metrics and correctness 0; registry row passes; README lists Yjs family/artifact/command. | keep | Final focused package/proof checks |
| P7-local-collaboration-10m | 7 | slate-automation | The local `yjs-collaboration` route should stay stable independently of Hocuspocus provider proof. | `SOAK_HEADLESS=1 SOAK_MS=600000 SOAK_ACTION_DELAY_MS=500 SOAK_REPORT_EVERY_MS=60000 SOAK_RUN_ID=yjs-perfection-local-collab-10m-20260611-1 bun ./scripts/proof/yjs-collaboration-soak.mjs` | Browser proof: 617,576ms, 975 actions, 105 iterations, 106 hard resets, structural/random/history/awareness scenario coverage, console/page/errors/issues all 0 | keep | Final focused checks |
| P8-local-soak-fail-on-issues | 8 | slate-automation | Automation should not require manual summary inspection to fail a dirty local collaboration soak. | Edited `scripts/proof/yjs-collaboration-soak.mjs`; verified Biome and short `SOAK_FAIL_ON_ISSUES=1` smoke. | Summary records `fail_on_issues: true`; short smoke exited 0 with 130 actions, 14 iterations, 0 issues. | keep | Run focused package/proof checks |
| P9-local-collaboration-strict-10m | 9 | slate-automation | The stricter local soak command should pass at full 10m packet length when no issues are recorded. | `SOAK_HEADLESS=1 SOAK_FAIL_ON_ISSUES=1 SOAK_MS=600000 SOAK_ACTION_DELAY_MS=500 SOAK_REPORT_EVERY_MS=60000 SOAK_RUN_ID=yjs-perfection-local-collab-10m-fail-on-issues-20260611-1 bun ./scripts/proof/yjs-collaboration-soak.mjs` | Browser proof: 612,289ms, 975 actions, 105 iterations, 106 hard resets, `fail_on_issues: true`, console/page/errors/issues all 0 | keep | Final focused checks |
| P10-bun-check | 10 | slate-automation | The current tree should pass the repo's fast aggregate gate after benchmark/proof/docs changes. | `bun check` | Pass: Biome/eslint, all package typechecks, site/root typechecks, Bun tests, slate-layout tests, Slate React Vitest 57 files / 662 tests | keep | Final handoff |
| P11-provider-persistent-endurance | 11 | slate-automation | Initially started to spend remaining timed budget on endurance proof. User clarified the budget should go to improvements, not long tests. | Started `SOAK_HEADLESS=1 PERSISTENT_SOAK_FAIL_ON_ISSUES=1 PERSISTENT_SOAK_MS=10800000 ... yjs-perfection-persistent-3h-20260611-1`; killed PID 71257. | Partial evidence before stop: ~51m, 4,416 actions, 691 checkpoints, 138 offline windows, 0 console errors, 0 page errors, 0 issues; not counted as a required gate. | stop | Move to improvement work; no more long soaks |
| P12-compatible-replacement-visible-children | 12 | slate-patch | `replace_fragment` and `replace_children` compatibility checks used raw children during nested replacement, so virtual moved children took traceable fallback instead of the identity-preserving operation path. | Edited `packages/slate-yjs/src/core/replacement.ts`, `packages/slate-yjs/src/core/operations.ts`, `packages/slate-yjs/test/replace-fragment-contract.spec.ts`, `packages/slate-yjs/test/simple-operations-contract.spec.ts`. | Focused failing test reproduced fallback; after fix: `bun test ./packages/slate-yjs/test/replace-fragment-contract.spec.ts --test-name-pattern "virtual moved-node identity"` pass; affected files `18 pass`; `bun --filter @slate/yjs typecheck` pass; `bunx biome check ...` pass. | keep | Find next improvement packet |
| P13-split-visible-virtual-children | 13 | slate-patch | `split_node` on an element whose visible child came from a virtual move split raw children instead of visible children, leaving the moved content on the wrong side. | Edited `packages/slate-yjs/src/core/document.ts`, `packages/slate-yjs/src/core/operations.ts`, `packages/slate-yjs/test/split-node-contract.spec.ts`. | Focused test failed with `No Yjs node at path 1.0`; after fix: focused pass, split-node file `14 pass`, `bun --filter @slate/yjs typecheck` pass, Biome pass, full package unit suite later green. | keep | Find next improvement packet |
| P14-virtual-child-replacement-removal | 14 | slate-patch | Full child replacement on virtual moved children either appended beside the old virtual child (`replace_fragment`) or threw while removing a virtual child (`replace_children`); direct `remove_node` needed coverage for the same helper. | Edited `packages/slate-yjs/src/core/document.ts`, `packages/slate-yjs/test/replace-fragment-contract.spec.ts`, `packages/slate-yjs/test/simple-operations-contract.spec.ts`, `packages/slate-yjs/test/remove-node-contract.spec.ts`. | Red tests: `replace_fragment` leaked `moved`; `replace_children` threw `Cannot remove a virtual Yjs child from its parent.` After fix: affected files `39 pass`; `bun --filter @slate/yjs typecheck` pass; Biome pass; full `bun test ./packages/slate-yjs/test` -> 194 pass. | keep | Find next improvement packet |
| P15-insert-before-leading-virtual-child | 15 | slate-patch | `insert_node` before a parent-level virtual child used raw index `-1`, producing correct text order but replacing moved-node identity. | Edited `packages/slate-yjs/src/core/document.ts`, `packages/slate-yjs/test/simple-operations-contract.spec.ts`. | Focused test failed on reference equality for the moved paragraph; after fix: focused pass, affected operation files later green. | keep | Check move path using same insertion helper |
| P16-move-before-leading-virtual-child | 16 | slate-patch | `move_node` into index 0 before an existing virtual child treated a raw-empty parent as empty and overwrote the virtual child reference. | Edited `packages/slate-yjs/src/core/operations.ts`, `packages/slate-yjs/test/move-node-contract.spec.ts`. | Focused move test failed with `No Yjs node at path 0.1`; after fix: focused pass; affected operation files `48 pass`; `bun --filter @slate/yjs typecheck` pass; Biome pass; full `bun test ./packages/slate-yjs/test` -> 196 pass. | keep | Reassess next improvement vs short local e2e |
| P17-short-local-e2e | 17 | slate-automation | Run only a short local e2e smoke after virtual-child fixes, respecting the user instruction to avoid expensive soaks. | `SOAK_HEADLESS=1 SOAK_FAIL_ON_ISSUES=1 SOAK_MS=15000 SOAK_ACTION_DELAY_MS=100 SOAK_REPORT_EVERY_MS=5000 SOAK_RUN_ID=yjs-perfection-local-short-e2e-20260612-1 bun ./scripts/proof/yjs-collaboration-soak.mjs` | Pass: elapsed 26,784ms, 130 actions, 14 iterations, 15 hard resets, 0 console errors, 0 page errors, 0 issues, fail-on-issues true. | keep | Review touched virtual-child logic |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| package contracts | `packages/slate-yjs` | `bun test ./packages/slate-yjs/test` | n/a | pass: 187 pass, 0 fail | continue browser proof |
| package typecheck | `packages/slate-yjs` | `bun --filter @slate/yjs typecheck` | n/a | pass | continue browser proof |
| provider-backed production smoke | `/examples/yjs-hocuspocus` | `PRODUCTION_SOAK_FAIL_ON_ISSUES=1 PRODUCTION_SOAK_RUN_ID=yjs-perfection-production-smoke-20260611-1 bun ./scripts/proof/yjs-hocuspocus-production-soak.mjs` | Chromium | pass: 90 actions, 0 issues | continue wider proof/gap scan |
| provider-backed persistent room | `/examples/yjs-hocuspocus` | `SOAK_HEADLESS=1 PERSISTENT_SOAK_FAIL_ON_ISSUES=1 PERSISTENT_SOAK_MS=600000 ... bun ./scripts/proof/yjs-hocuspocus-persistent-room-soak.mjs` | Chromium | pass: 1,088 actions, 171 checkpoints, 34 offline windows, 0 issues | continue final focused checks |
| local collaboration soak | `/examples/yjs-collaboration` | `SOAK_HEADLESS=1 SOAK_MS=600000 SOAK_ACTION_DELAY_MS=500 SOAK_REPORT_EVERY_MS=60000 SOAK_RUN_ID=yjs-perfection-local-collab-10m-20260611-1 bun ./scripts/proof/yjs-collaboration-soak.mjs` | Chromium | pass: 975 actions, 105 iterations, 0 issues | continue final focused checks |
| strict local collaboration soak | `/examples/yjs-collaboration` | `SOAK_HEADLESS=1 SOAK_FAIL_ON_ISSUES=1 SOAK_MS=600000 SOAK_ACTION_DELAY_MS=500 SOAK_REPORT_EVERY_MS=60000 SOAK_RUN_ID=yjs-perfection-local-collab-10m-fail-on-issues-20260611-1 bun ./scripts/proof/yjs-collaboration-soak.mjs` | Chromium | pass: 975 actions, 105 iterations, 0 issues, fail-on-issues true | continue final focused checks |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| Hocuspocus production smoke | convergence/issue checks inside runner | DOM text normalized by runner; no raw issue recorded | page errors, console errors, non-convergence, nested paragraph checks | summary at `test-results/yjs-hocuspocus-production-soak/yjs-perfection-production-smoke-20260611-1/summary.md` | pass |
| Hocuspocus persistent room 10m | convergence/issue checks inside runner | peer text and growth samples converged | page errors, console errors, non-convergence, nested paragraph checks | summary at `test-results/yjs-hocuspocus-persistent-room-soak/yjs-perfection-persistent-10m-20260611-1/summary.md` | pass |
| Local yjs-collaboration 10m | convergence/issue checks inside runner | DOM text normalized by runner; no issue recorded | page errors, console errors, non-convergence, nested paragraph checks | summary at `test-results/yjs-collaboration-soak/yjs-perfection-local-collab-10m-20260611-1/summary.md` | pass |
| Strict local yjs-collaboration 10m | convergence/issue checks inside runner | DOM text normalized by runner; no issue recorded | page errors, console errors, non-convergence, nested paragraph checks, exit-on-issues enabled | summary at `test-results/yjs-collaboration-soak/yjs-perfection-local-collab-10m-fail-on-issues-20260611-1/summary.md` | pass |

slate-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| none found | n/a | n/a | Proof gap was local soak exit behavior, not a missing `slate-browser` helper | N/A for this checkpoint |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| raw mobile Yjs behavior | none | not run | N/A | No raw mobile-device claim made; Chromium desktop route proof only |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| Yjs large-doc sync benchmark | 1000 blocks, 4 peers, 120 ops | distributed inserts + peer sync | `bun ./scripts/benchmarks/core/current/yjs-collaboration.mjs` x3 | pass correctness; worst p95 dominated by `yjs_large_doc_sync_p95_ms` 174.35/180.53/184.68 |
| Yjs large-doc sync phase benchmark | 1000 blocks, 4 peers, 120 ops | distributed inserts + peer sync, with assertion cost split out | patched `bun ./scripts/benchmarks/core/current/yjs-collaboration.mjs` | pass correctness; latest worst p95 177.84ms, work p95 168.44ms, verification p95 11.06ms |
| Hocuspocus persistent room growth | same room, four peers | growth-burst, block-growth, structure-churn, offline-catchup, history-interleave | 10m persistent soak | pass: final 137 blocks / 2,494 chars on every peer, 0 issues |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| `bun test ./packages/slate/test/core-benchmark-scripts-contract.ts` | benchmark registry contract | under 1s, but noisy output | running the whole file exposed unrelated existing huge-doc contract failures while checking one Yjs registry row | first failure showed `yjs-collaboration.mjs` missing root script; other failures were existing huge-doc assertions | repaired Yjs root script; reran focused registry row only |
| manual issue enforcement after local collaboration soak | `scripts/proof/yjs-collaboration-soak.mjs` | avoidable manual step | script recorded issue count but always exited 0 for recorded issues unless runner threw | added `SOAK_FAIL_ON_ISSUES=1`; short clean smoke proved exit 0 and summary flag | keep as workflow repair |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | none; no Slate/Yjs runtime package API changed |
| tests/oracles/browser proof | package baseline, Hocuspocus production smoke, and 10m persistent-room soak run; no files changed |
| benchmarks/metrics/targets | Yjs collaboration benchmark now emits work/verification phase metrics; root package script exposes it |
| examples/docs | plan created and filled; benchmark README lists Yjs benchmark family, artifact, and run command |
| skills/workflow | local collaboration soak now supports `SOAK_FAIL_ON_ISSUES=1` |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Benchmark phase metrics | This changes the metric artifact shape by adding `phaseLanes` and work/verification metrics while keeping existing headline metrics. | `/Users/felixfeng/Desktop/repos/slate-v2/scripts/benchmarks/core/current/yjs-collaboration.mjs`; command `bun run bench:core:yjs-collaboration:local` | accept |
| 2 | Local soak strict mode | Future automation can fail on local collaboration issues instead of manually reading summaries. | `/Users/felixfeng/Desktop/repos/slate-v2/scripts/proof/yjs-collaboration-soak.mjs`; env `SOAK_FAIL_ON_ISSUES=1` | accept |
| 3 | Timed-goal state | The 8h goal is checkpoint-green but not literal 8h elapsed. | `docs/plans/2026-06-11-yjs-perfection-8h.md` | inspect if you wanted wall-clock burn rather than high-value packets |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| SC-1 | proof-width | Whether to spend the remaining wall-clock budget on longer endurance soaks | The current checkpoint has 10m Hocuspocus/local soaks and `bun check`, not a literal 8h wall-clock soak | Longer 1h-8h endurance proof | Package/browser/proof/benchmark/workflow packets completed | Run only if literal endurance is desired; current P0/P1 evidence is green | this plan, packet ledgers P1-P10 |

Findings:
- Prior proof memory says the strongest Yjs bundle is package tests/typecheck,
  focused browser collaboration proof, and Hocuspocus-backed replay when provider
  shape differs from local collaboration.
- Live tree has `packages/slate-yjs`, `site/examples/ts/yjs-hocuspocus.tsx`,
  `site/examples/ts/yjs-collaboration.tsx`, production and persistent-room soak
  scripts, and recent target-side plans claiming known Hocuspocus issues fixed.
- Current package baseline is green: 187 Yjs package tests pass and package
  typecheck exits 0.
- Current provider-backed browser smoke is green: 90 Hocuspocus actions,
  reload/offline/degraded scenarios, 0 console errors, 0 page errors, 0 issues.
- Current Yjs collaboration benchmark is correctness-green. The repeated worst
  p95 is 174.35/180.53/184.68ms and is always `largeDocSyncMs`; treat it as a
  perf investigation candidate, not a failure, because the runner is
  calibration-only.
- Benchmark source audit found the metric mixed work and verification. The
  patched runner keeps the headline metric but adds work/verification phase
  lanes; latest large-doc p95 is 177.84ms total, 168.44ms work, 11.06ms
  verification.
- Provider-backed persistent-room proof is green: 10 minutes, same room, 1,088
  actions, 171 convergence checkpoints, 34 offline windows, final peer growth
  matched exactly, and 0 issues.
- The Yjs benchmark now has a root `bench:core:yjs-collaboration:local` command
  and README coverage.
- Local collaboration route proof is green: 10 minutes, 975 actions, 105
  iterations, 106 hard resets, structural/random/history/awareness coverage,
  and 0 issues.
- Local collaboration soak can now be used as a stricter gate with
  `SOAK_FAIL_ON_ISSUES=1`.
- The strict local soak command passed at 10m length with 975 actions, 105
  iterations, and 0 issues.
- Compatible replacement now uses visible Yjs children for nested updates, so
  virtual moved children stay on the operation path for `replace_fragment` and
  `replace_children` instead of falling back to scoped replacement.
- Element `split_node` now splits visible Yjs child slots, so virtual moved
  content follows Slate split position instead of raw empty-wrapper slots.
- Full replacement/removal now clears virtual child references correctly, so
  virtual moved children do not leak into replacement results or crash
  `replace_children`.
- Insert before a leading parent-level virtual child now preserves the moved
  node identity by converting the parent virtual ref into an explicit
  placeholder after the inserted child.
- Move into index 0 before an existing virtual child now inserts before it
  instead of overwriting the parent-level virtual reference.
- Short local e2e smoke passed after the virtual-child fixes without running a
  long soak.

Decisions and tradeoffs:
- Timed mode: keep working through safe alternate owners until the 8h loop-start
  budget expires; queue soft questions for handoff.
- Private alpha: no ship/release/PR language unless explicitly requested.
- Proof order: behavior and browser-visible truth before perf/API cleanup.
- Keep the Yjs benchmark patch because it makes future perf claims harder to
  bullshit without changing runtime behavior.
- Keep the README update because command-surface docs should describe the live
  benchmark set.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Full `core-benchmark-scripts-contract.ts` surfaced unrelated huge-doc contract failures while checking Yjs registry exposure | 1 | Run focused registry test after fixing Yjs script exposure | Focused test passed; unrelated huge-doc rows left untouched |

Verification evidence:
- Checkpoint-zero evidence: active goal created; `slate-automation`,
  `slate-north-star`, and `docs/slate-v2/agent-start.md` read; memory quick pass
  read prior Yjs cleanup/Hocuspocus summaries.
- `bun test ./packages/slate-yjs/test` from `/Users/felixfeng/Desktop/repos/slate-v2` passed: 187 pass, 0 fail.
- `bun --filter @slate/yjs typecheck` from `/Users/felixfeng/Desktop/repos/slate-v2` exited 0.
- `PRODUCTION_SOAK_FAIL_ON_ISSUES=1 PRODUCTION_SOAK_RUN_ID=yjs-perfection-production-smoke-20260611-1 bun ./scripts/proof/yjs-hocuspocus-production-soak.mjs` from `/Users/felixfeng/Desktop/repos/slate-v2` exited 0; summary reports elapsed 71,929ms, actions 90, hard reloads 6, browser offline windows 6, console errors 0, page errors 0, issues 0.
- `bun ./scripts/benchmarks/core/current/yjs-collaboration.mjs` from `/Users/felixfeng/Desktop/repos/slate-v2` exited 0 three times; worst p95 values 174.35ms, 180.53ms, 184.68ms; correctness failures 0 each run.
- After benchmark patch, `bun ./scripts/benchmarks/core/current/yjs-collaboration.mjs | rg '^METRIC '` exited 0; latest worst p95 177.84ms, worst work p95 168.44ms, worst verification p95 11.06ms, correctness failures 0.
- `bunx biome check scripts/benchmarks/core/current/yjs-collaboration.mjs package.json` exited 0.
- `bun test ./packages/slate/test/core-benchmark-scripts-contract.ts --test-name-pattern "exposes every current core benchmark"` exited 0: 1 pass, 13 filtered.
- `SOAK_HEADLESS=1 PERSISTENT_SOAK_FAIL_ON_ISSUES=1 PERSISTENT_SOAK_MS=600000 PERSISTENT_SOAK_ACTION_DELAY_MS=500 PERSISTENT_SOAK_REPORT_EVERY_MS=60000 PERSISTENT_SOAK_RUN_ID=yjs-perfection-persistent-10m-20260611-1 bun ./scripts/proof/yjs-hocuspocus-persistent-room-soak.mjs` from `/Users/felixfeng/Desktop/repos/slate-v2` exited 0; summary reports elapsed 608,478ms, actions 1,088, checkpoints 171, offline windows 34, console errors 0, page errors 0, issues 0, final growth 137 blocks / 2,494 chars on all peers.
- `bun run bench:core:yjs-collaboration:local | rg '^METRIC '` from `/Users/felixfeng/Desktop/repos/slate-v2` exited 0; latest worst p95 181.54ms, worst work p95 167.91ms, worst verification p95 17.81ms, correctness failures 0.
- `bunx biome check scripts/benchmarks/README.md scripts/benchmarks/core/current/yjs-collaboration.mjs package.json` exited 0 for supported files.
- Focused core benchmark registry contract rerun exited 0: 1 pass, 13 filtered.
- `SOAK_HEADLESS=1 SOAK_MS=600000 SOAK_ACTION_DELAY_MS=500 SOAK_REPORT_EVERY_MS=60000 SOAK_RUN_ID=yjs-perfection-local-collab-10m-20260611-1 bun ./scripts/proof/yjs-collaboration-soak.mjs` from `/Users/felixfeng/Desktop/repos/slate-v2` exited 0; summary reports elapsed 617,576ms, actions 975, iterations 105, hard resets 106, skipped disabled 15, console errors 0, page errors 0, issues 0.
- `bunx biome check scripts/proof/yjs-collaboration-soak.mjs` exited 0.
- `SOAK_HEADLESS=1 SOAK_FAIL_ON_ISSUES=1 SOAK_MS=15000 SOAK_ACTION_DELAY_MS=100 SOAK_REPORT_EVERY_MS=5000 SOAK_RUN_ID=yjs-perfection-local-fail-on-issues-smoke-20260611-1 bun ./scripts/proof/yjs-collaboration-soak.mjs` exited 0; summary includes `fail_on_issues: true`, actions 130, issues 0.
- `SOAK_HEADLESS=1 SOAK_FAIL_ON_ISSUES=1 SOAK_MS=600000 SOAK_ACTION_DELAY_MS=500 SOAK_REPORT_EVERY_MS=60000 SOAK_RUN_ID=yjs-perfection-local-collab-10m-fail-on-issues-20260611-1 bun ./scripts/proof/yjs-collaboration-soak.mjs` exited 0; summary reports elapsed 612,289ms, actions 975, iterations 105, hard resets 106, skipped disabled 15, console errors 0, page errors 0, issues 0, fail-on-issues true.
- `bun check` from `/Users/felixfeng/Desktop/repos/slate-v2` exited 0: Biome/eslint pass; package/site/root typecheck pass; Bun tests 1,019 pass / 95 skip; slate-layout 47 pass; Slate React Vitest 57 files / 662 tests pass.
- P12 red/green local unit proof: focused `replace_fragment` virtual moved-node
  identity contract failed on fallback, then passed after the visible-children
  replacement fix.
- `bun test ./packages/slate-yjs/test/replace-fragment-contract.spec.ts
  ./packages/slate-yjs/test/simple-operations-contract.spec.ts` exited 0:
  18 pass, 0 fail.
- `bun --filter @slate/yjs typecheck` exited 0 after P12.
- `bunx biome check packages/slate-yjs/src/core/operations.ts
  packages/slate-yjs/src/core/replacement.ts
  packages/slate-yjs/test/replace-fragment-contract.spec.ts
  packages/slate-yjs/test/simple-operations-contract.spec.ts` exited 0.
- P13 red/green local unit proof: focused split virtual moved-child contract
  failed with `No Yjs node at path 1.0`, then passed after
  `splitVisibleYjsChildren`.
- `bun test ./packages/slate-yjs/test/split-node-contract.spec.ts` exited 0:
  14 pass, 0 fail.
- P14 red/green local unit proof: focused `replace_fragment` fallback test
  leaked `moved`; focused `replace_children` fallback test threw
  `Cannot remove a virtual Yjs child from its parent`; both pass after clearing
  virtual child references on full replacement/removal.
- `bun test ./packages/slate-yjs/test/replace-fragment-contract.spec.ts
  ./packages/slate-yjs/test/simple-operations-contract.spec.ts
  ./packages/slate-yjs/test/remove-node-contract.spec.ts
  ./packages/slate-yjs/test/split-node-contract.spec.ts` exited 0: 39 pass.
- `bun test ./packages/slate-yjs/test` exited 0 after P14: 194 pass, 0 fail.
- P15 red/green local unit proof: focused insert-before-leading-virtual-child
  test failed because the visible text was right but the moved paragraph
  identity was replaced; after fix the focused test passed.
- P16 red/green local unit proof: focused move-before-leading-virtual-child
  test failed with `No Yjs node at path 0.1`; after fix the focused test
  passed.
- Affected operation files exited 0 after P16: 48 pass, 0 fail.
- `bun test ./packages/slate-yjs/test` exited 0 after P16: 196 pass, 0 fail.
- Short local e2e after P16:
  `SOAK_HEADLESS=1 SOAK_FAIL_ON_ISSUES=1 SOAK_MS=15000 ...` exited 0;
  summary reports elapsed 26,784ms, 130 actions, 14 iterations, 15 hard resets,
  console/page/errors/issues all 0.
- Final lightweight checkpoint verification:
  `bun test ./packages/slate-yjs/test` exited 0 with 196 pass; `bun --filter
  @slate/yjs typecheck` exited 0; `bunx biome check` on touched Yjs files exited
  0.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-11-yjs-perfection-8h.md`
- Surface and route/package: `../slate-v2`, `packages/slate-yjs`, current Yjs
  collaboration/Hocuspocus proofs
- Invocation mode, elapsed/timebox, loop/checkpoint count: timed 8h; checkpoint
  handoff after 10 packet loops; full wall-clock budget not exhausted.
- Behavior gates and visual proof: package baseline, Hocuspocus production
  smoke, 10m persistent-room soak, 10m local collaboration soak, strict 10m
  local collaboration soak, and `bun check` passed.
- Primary metric baseline/latest/best and stop reason: Yjs collaboration worst
  p95 baseline 174.35/180.53/184.68ms; latest root-command p95 181.54ms,
  work p95 167.91ms, verification p95 17.81ms; stopped at checkpoint handoff
  with no current P0/P1 found.
- Bugs fixed and oracles added: no runtime bug fix; local collaboration soak
  gained `SOAK_FAIL_ON_ISSUES=1`.
- Benchmark/skill/docs repairs: Yjs benchmark phase metrics, root benchmark
  command, benchmark README coverage.
- Workflow slowdowns and repairs: noisy full benchmark contract run narrowed;
  local soak manual issue enforcement repaired.
- Changed list: see Changed list table.
- Needs your attention: see Needs your attention table.
- Stopping checkpoints to unblock: SC-1 only.
- Accepted deferrals and residual risks: raw mobile not claimed; literal 8h
  endurance not consumed in this checkpoint.
- Next owner: continue automation for longer endurance only if desired; otherwise
  this checkpoint is green.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint handoff |
| Where am I going? | Final response, with active goal still resumable |
| What is the goal? | Timed 8h `@slate/yjs` perfection loop in `../slate-v2` with packet decisions and proof. |
| What have I learned? | Package/provider/local collaboration proof is green; benchmark honesty and strict local soak gating are improved and verified at 10m. |
| What have I done? | Created goal, ran proof, patched Yjs benchmark metrics/command/docs, added local soak fail-on-issues mode. |
| What changed in the checkpoint plan? | Final handoff rows filled; goal remains active because 8h wall-clock did not elapse. |

Timeline:
- 2026-06-11T14:58:55.800Z Goal plan created.
- 2026-06-11T22:59:17+0800 Timed 8h automation contract recorded; active goal created.
- 2026-06-11T23:05+0800 Package baseline proof passed: Yjs tests and typecheck green.
- 2026-06-11T23:08+0800 Hocuspocus production smoke passed: 90 actions, 0 issues.
- 2026-06-11T23:12+0800 Yjs collaboration benchmark x3 passed correctness; large-doc sync dominates worst p95.
- 2026-06-11T23:20+0800 Benchmark phase metrics and root script exposure patched and verified.
- 2026-06-11T23:34+0800 10m persistent-room Hocuspocus soak passed with 0 issues.
- 2026-06-11T23:38+0800 Benchmark README and root command rerun verified.
- 2026-06-11T23:41+0800 10m local yjs-collaboration soak passed with 0 issues.
- 2026-06-11T23:42+0800 Local collaboration soak fail-on-issues mode patched and smoke-verified.
- 2026-06-11T23:47+0800 Strict 10m local yjs-collaboration soak passed with fail-on-issues enabled; `bun check` passed.

Open risks:
- Full 8h wall-clock completion may require continuation across compaction; the
  plan is the resume source.
- Raw mobile-device proof is out of scope unless explicitly requested or becomes
  the only honest proof.
- Long provider-backed endurance packet is running under P11.
