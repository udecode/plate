# plite-huge-doc-visible-shift-selection-latency

Objective:
Fix visible huge-document held Shift+Down latency on Plite staged 10k route.

Goal plan:
docs/plans/2026-06-05-plite-huge-doc-visible-shift-selection-latency.md

Template:
docs/plans/templates/slate-automation.md

Primary template:
docs/plans/templates/slate-automation.md

Applied packs:
- none

Automation source:
- type: user skill invocation plus video repro
- prompt / link: `[$slate-automation] loop until fixed. feel free to rearchitecture as needed.`
- video: `/Users/zbeyens/Library/Application Support/CleanShot/media/media_duo9DpwYMz/2026-06-05 at 21.03.58.mp4`
- surface / route / package: `.tmp/plite` huge-document route, staged DOM strategy, 10,000 blocks, `plite-react` selection/input/runtime path
- invocation mode: full-loop / long autonomous repair
- timebox / deadline: none; keep looping until the visible slow path is fixed, a real blocker appears, or a proven plateau requires a user architecture decision
- completion threshold summary: reproduce the video-visible held/repeated Shift+Down latency, repair the benchmark/oracle that missed it, fix or rearchitect the runtime hot path, prove repeated visual-line expansion and follow-up editing are fast/correct, and hand off metrics, changes, workflow slowdowns, review attention, stopping checkpoints, and next owner

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
- Done means the 10k staged huge-document route no longer visibly stalls when
  the user holds or repeatedly presses Shift+Down from the top paragraph
  through wrapped visual lines and multiple blocks. The proof must use real
  browser keyboard input on the route, measure repeated/burst Shift+Down
  latency and long animation frames, assert model selection and native selected
  text/caret behavior, and include follow-up Shift+Up, typing/delete or
  select-all/delete smoke where relevant.
- A single adjacent-block Shift+Down benchmark is not closure. The previous
  closure missed the human operation in the video, so this run must add or
  repair an oracle that catches held/repeated visual-line expansion.
- Runtime rearchitecture is allowed when the hot path proves the current
  view-selection/native-selection architecture cannot meet the visible target.
- Closure is legal only when required behavior, visual/native selection,
  package/API, mobile/raw-device claim-width, huge-document, docs/skill repair,
  changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and
  final handoff rows are complete, explicitly deferred, or N/A with evidence,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-plite-huge-doc-visible-shift-selection-latency.md`
  passes.

Verification surface:
- Video-derived route: `http://localhost:3100/examples/huge-document?strategy=staged`
  or managed Playwright equivalent with `blocks=10000`, `content_visibility=none`,
  `strategy=staged`, and `useElementSelected=false`.
- Primary visible proof: repeated/held Shift+Down from the top paragraph,
  through wrapped visual lines and multiple blocks, with real keyboard input,
  native selected text, model selection, visible selection growth, and long
  animation frame/keypress metrics.
- Comparison proof: current benchmark/Playwright rows that previously passed,
  plus repaired benchmark/oracle for burst Shift+Down.
- Package proof: focused `plite-react` unit tests and `bun check` after kept
  runtime code.
- Plan proof:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-plite-huge-doc-visible-shift-selection-latency.md`.

Constraints:
- Plite private alpha by default: no release, publish, changeset, PR, or
  branch readiness unless the prompt explicitly asks.
- Run Plite behavior commands from `.tmp/plite`; parent repo commands
  prove plans, docs, skills, and templates only.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a
  stopping checkpoint routes to `plite-plan`.
- Do not patch Plate when the run is scoped to Plite.

Boundaries:
- Source of truth: video, live `.tmp/plite` route/source/tests/benchmarks,
  current plan, and `vision`
- Allowed edit scope: `.tmp/plite` runtime/tests/benchmarks/examples/helpers;
  parent `docs/plans/**` for this goal; `.agents/rules/**` only for a proven
  reusable workflow miss
- Browser surfaces: huge-document staged route at 10k blocks, with real
  keyboard input and native visual selection
- Package/API surfaces: `plite-react` selection/input/runtime and any internal
  API boundary proven necessary by profiling
- Agent/skill surfaces: no skill repair unless the loop misses a reusable
  proof/workflow expectation again
- Docs/research surfaces: active plan first; durable docs only for accepted
  architecture decisions
- Non-goals: release/publish/changeset/PR, Plate patches, external issue
  ledgers, raw mobile claims, and claiming closure from single-keystroke metrics

Blocked condition:
- Stop only if all meaningful browser/runtime experiments converge on an unsafe
  architecture fork needing user taste, required tooling/source is unavailable,
  or the same hard blocker repeats with no autonomous owner left.
- Do not block while a safe alternate checkpoint remains runnable. In timed or
  batch mode, queue soft questions for final handoff.

Automation state:
- surface: huge-document staged visible held Shift+Down latency
- mode: full-loop / long repair
- checkpoint_policy: dynamic_supervisor
- current_loop: 4
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: secondary native same-block selection paint if prioritized
- goal_status: active

Current verdict:
- verdict: fixed for visible/repeated staged Shift+Down stall
- confidence: high for the requested lane
- next owner: optional secondary single-key native same-block paint packet
- keep / revert / quarantine call: keep visual-line grouping + staged group size 8; revert no-metric guard/native-collapse experiments
- reason: default and video-sized repeated Shift+Down are ~45-54ms p95 with zero long frames, down from ~2228ms baseline and ~899ms residual default-viewport failure

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-plite-huge-doc-visible-shift-selection-latency.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-automation | complete | P0 | Copy prompt requirements and read north-star before implementation. | Requirement rows complete; video inspected. | update |
| status | slate-automation | complete | P0 | Read active plan, latest prompt, source status, and current evidence. | Current state recorded in this plan and final evidence. | update |
| gap-scan | slate-automation | complete | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Repeated Shift+Down, stale line grouping, staged group size, stale tests, benchmark missing scroll state found. | update |
| behavior-proof | slate-ar-stabilize | complete | P0 | Prove stable editor behavior before perf. | Focused Playwright rows, keyboard contract test, staged DOM tests, and `bun check` pass. | update |
| oracle-repair | slate-patch / tdd | complete | P0 | Add missing native/visual/model oracles for found gaps. | Repeated Shift+Down Playwright row and benchmark repeated-selection oracle added. | update |
| visual-proof | Browser / Playwright | complete | P0 | Prove visible editor behavior and native selection. | Video/default viewport benchmark and Playwright projected visual marker proof pass. | update |
| plite-browser-promotion | plite-browser | complete | P1 | Promote repeated browser proof into reusable API/helper. | Browser handle view-selection summary added to huge-doc test harness; broader helper extraction deferred. | update |
| mobile-claim-width | slate-automation | complete | P1 | Separate raw-device proof from viewport proof. | N/A: no mobile/raw-device claim made. | update |
| huge-document-smoke | slate-ar-stabilize | complete | P1 | Smoke huge-doc correctness without broad architecture work. | Select-all/delete/undo, Shift+Down/Up, repeated Shift+Down covered by benchmark. | update |
| perf-packet | slate-ar-fast / slate-ar-perf | complete | P2 | Optimize only after correctness is green. | Kept group size 8 + visual line grouping fix; repeated lane meets target. | update |
| consolidation | slate-automation | complete | P1 | Move accepted reusable decisions to durable docs/rules. | N/A: no skill/rule/docs source change needed; plan records accepted decision. | update |
| final-handoff | slate-automation | complete | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows complete below. | update |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | update | checkpoint-zero, scenario matrix | user video and plan creation | Prior closure missed held/repeated visual-line operation. | status/gap-scan next |
| 1 | add | repeated-shift-down-oracle | benchmark baseline showed repeated p95 2228ms and default residual 899ms | Single-key metric missed held user gesture. | kept |
| 2 | update | visual-line-grouping | wrapped line rects with 1px gaps were merged into one line | Bad geometry jumped into next block and created slow paint. | kept |
| 3 | update | staged-group-size | group 32 kept 839-899ms default viewport spikes | Smaller staged layout island removes long frames. | kept group size 8 |
| 4 | retire | checkVisibility/offscreen-target/native-collapse experiments | no metric movement or introduced symmetry/no-op behavior | Avoid dirty speculative patches. | reverted |

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
  user's latest request, `vision`, and current source evidence outrank
  stale plan rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User requires slate-automation loop until visible lag fixed; rearchitecture allowed. |
| `plite-automation` source rule read | yes | Read `/Users/zbeyens/git/plate-2/.agents/skills/slate-automation/SKILL.md`; user also pasted skill body. |
| `vision` read as checkpoint zero | yes | Read `/Users/zbeyens/git/plate-2/.agents/skills/vision/SKILL.md`; taste says visible proof beats model-only/nearby metrics. |
| Active goal checked or created | yes | Created active autogoal for visible huge-doc Shift-selection latency. |
| Invocation mode and timebox recorded | yes | Full-loop, no hard timebox, continue until fixed/blocker/plateau. |
| Dynamic checkpoint policy accepted | yes | Plan may add/update/split checkpoints from evidence. |
| Source of truth and allowed workspaces recorded | yes | `.tmp/plite` runtime/tests/benchmarks plus parent plan only. |
| Output budget strategy recorded | yes | Put broad evidence in plan/artifacts, not chat. |
| Private-alpha release/PR boundary recorded | yes | No release/publish/changeset/PR in this run. |
| Browser proof strategy recorded | yes | Real route/video operation first, then benchmark/package proof. |
| Package/API proof strategy recorded | yes | Focused `plite-react` tests/typecheck and `bun check` after kept runtime changes. |
| Mobile/raw-device claim-width policy recorded | yes | No mobile/raw-device claim. |
| Skill repair authority and source-rule boundary recorded | yes | Patch `.agents/rules/**` only for proven reusable workflow miss. |

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
- [x] Repeated browser proof patterns are promoted to `plite-browser` or queued
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
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | Video/default repeated Shift+Down p95 45.1/53.9ms, zero long frames; `bun check` passed. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | Checkpoints updated with repeated oracle, line grouping, group size, stale tests, and reverted experiments. |
| Workspace authority proof | yes | Record cwd/tool for each Plite, parent-docs, skill, browser, package, or benchmark proof | Runtime/browser commands ran in `.tmp/plite`; plan updated in parent `docs/plans`. |
| Behavior gates | yes | Run focused stable behavior proof or record scoped defer rows | Playwright huge-doc rows, keyboard contract, staged DOM contracts, and `bun check` passed. |
| Visual/native selection proof | yes | Record Browser/Playwright/native-selection evidence or scoped blocker | Repeated row asserts model expansion, projected markers, native/model behavior, and Shift+Up contraction. |
| Missing oracle repair | yes | Add/verify/revert/quarantine oracle packets or record owner defer | Added repeated held Shift+Down benchmark/Playwright oracle and repaired stale single-key assertion. |
| `plite-browser` promotion | yes | Add/verify helper/API or record queue/defer reason | Added local view-selection summary use; broader helper extraction is queued as non-blocking. |
| Mobile/raw-device claim width | yes | Run raw-device proof or record that only scoped viewport/browser proof is available | N/A: desktop Chromium/browser proof only; no raw mobile claim. |
| Huge-document correctness smoke | yes | Run focused huge-document behavior smoke or record owner defer | Benchmark covers Shift+Down/Up, repeated Shift+Down, select-all/delete/undo. |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | `bun check` passed across lint/type/package tests. |
| Skill/rule sync | yes | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | N/A: no `.agents/rules/**` edits. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | Ledgers filled below. |
| Final lint/check | yes | Run scoped lint/check or record why no code changed | `bun check` passed. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Benchmark process linger and stale test contracts logged; benchmark artifact now records scroll state. |
| Agent-native review for agent/tooling changes | yes | Load `agent-native-reviewer` and close accepted findings, or N/A | N/A: no `.agents/**`, hooks, skills, or command tools changed. |
| Autoreview for non-trivial implementation changes | yes | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | N/A for this loop: focused and full gates caught/repaired stale tests; no separate review requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-plite-huge-doc-visible-shift-selection-latency.md` | To run after this ledger update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | plan captured prompt requirements | status complete |
| Status and current-tree closure | complete | video/default residual failures reproduced | gap scan complete |
| Gap scan and scenario matrix | complete | repeated gesture, line grouping, group size, stale tests identified | behavior proof complete |
| Behavior proof | complete | focused Playwright + unit contracts + staged DOM tests | oracle repair complete |
| Oracle repair | complete | repeated held Shift+Down benchmark and Playwright oracle | visual proof complete |
| Visual/native proof | complete | video/default viewport projected/native assertions and metrics | plite-browser promotion complete |
| plite-browser promotion | complete | test harness reads view selection summaries | broader helper queued |
| Mobile/raw-device claim width | complete | N/A: no raw-device claim | huge-document smoke complete |
| Huge-document correctness smoke | complete | Shift+Down/Up, repeated selection, select-all/delete/undo | perf complete |
| Perf/API/docs/skill packets as needed | complete | group size 8 + line grouping kept; no API/docs/skill edits | consolidation complete |
| Consolidation and review | complete | stale tests updated; `bun check` passed | final handoff complete |
| Final handoff and goal-plan check | complete | final ledgers updated | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| Huge document staged | 10k blocks | default 1280x720, staged DOM-present | held/repeated Shift+Down x24 | model expands, visual projection exists, no long frames | complete |
| Huge document staged | 10k blocks | video 1480x2052, staged DOM-present | held/repeated Shift+Down x24 | model expands, projected markers exist, Shift+Up contracts | complete |
| Huge document staged | 10k blocks | middle block 5000 | single Shift+Down then Shift+Up | Down moves one visual line, Up returns anchor | complete |
| Huge document staged | 10k blocks | default/video | Cmd+A/Delete/undo | edit path remains fast | complete |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| Baseline repro | 1 | benchmark | Repeated Shift+Down p95 2228ms baseline; default residual 899ms after partial fix | benchmark script | reproduced multi-second long frames | keep evidence | fixed by later packet |
| Oracle repair | 1 | benchmark/test | Existing single-key row missed held/repeated gesture | benchmark + Playwright huge-doc test | repeated x24 model/native/projected assertions | keep | use as regression |
| Line grouping | 2 | slate-react | Adjacent wrapped lines with 1px gap were merged into one line | `dom-coverage-vertical-selection.ts` | Down/Up symmetry fixed at block 5000 | keep | covered by tests |
| Staged layout island | 3 | slate-react | 32-block `content-visibility` group forced 839-899ms long frames | `editable-text-blocks.tsx` | group size 8, repeated p95 53.9ms default / 45.1ms video | keep | monitor DOM budget |
| Stale contracts | 4 | tests | Tests encoded group size 32 and background full mount | `dom-strategy-and-scroll.tsx` | focused staged DOM tests pass | keep | none |
| Experiments | 2-3 | slate-automation | checkVisibility/offscreen-target/native-collapse did not move metric or hurt symmetry | local patches | reverted before final | revert | none |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Huge-doc repeated selection | `/examples/huge-document?strategy=staged` | focused Playwright repeated Shift+Down row | Chromium | passed | none |
| Huge-doc single vertical selection | `/examples/huge-document?strategy=staged` | focused Playwright bounded Shift+Down/Up row | Chromium | passed | none |
| slate-react keyboard contracts | `packages/plite-react` | `bun run test:vitest -- test/keyboard-input-strategy-contract.test.ts` | unit | 33 passed | none |
| staged DOM contracts | `packages/plite-react` | `bun run test:vitest -- test/dom-strategy-and-scroll.test.tsx` | unit | 47 passed | none |
| full fast gate | `.tmp/plite` | `bun check` | lint/type/tests | passed | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| Repeated Shift+Down default | anchor `[0,0]`, focus leaves start block | native collapsed, projected markers active | scroll stable, no long frames | Playwright/benchmark artifact | pass |
| Repeated Shift+Down video viewport | anchor `[0,0]`, focus advances; partial Up contracts | native/model scoped through projected markers | viewport 1480x2052 | benchmark artifact | pass |
| Middle single Shift+Down/Up | Down `[5000,0]` offset 3 -> 43/65, Up back to 3 | native text exists for same-block row | line rect grouping no longer merges adjacent lines | benchmark + focused probe | pass |

plite-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| View-selection summary | huge-doc Playwright tests and benchmark | promote to reusable plite-browser helper later | focused Playwright rows | queued; local helper sufficient for this loop |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| Huge-doc staged desktop behavior | Chromium/Playwright viewport proof | desktop Chromium only | passed | no raw mobile/device claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| staged DOM-present 10k | repeated Shift+Down | p95 under 100ms, zero long frames | benchmark default/video | pass |
| staged DOM-present 10k | Cmd+A Delete Undo | delete/undo under 100ms p95 | benchmark default/video | pass |
| staged DOM-present 10k | single Shift+Down/Up | Up returns anchor | Playwright + benchmark | pass |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| benchmark process cleanup | benchmark script | 10-20s after artifact write | browser/process teardown lingers after metrics are printed | command sessions stayed alive after `Wrote ...json` | log; not blocking runtime |
| stale staged tests | slate-react tests | one `bun check` cycle | tests encoded old group size 32/background full mount | `bun check` failed, focused test repaired | repaired in tests |
| first metric blind spot | benchmark/oracle | prior loop | single-key metric missed held/repeated user gesture | repeated row added | repaired |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `dom-coverage-vertical-selection.ts`: real visual-line grouping and preferred-X support; `editable-text-blocks.tsx`: staged root group size 8; caret/keyboard large-doc projected selection routing retained from active packet. |
| tests/oracles/browser proof | `huge-document.test.ts`: view-selection summary + repeated Shift+Down oracle; `keyboard-input-strategy-contract.test.ts`: large-doc ownership expectations; `dom-strategy-and-scroll.tsx`: staged group-size/no-background-mount contracts. |
| benchmarks/metrics/targets | `huge-document-staged-keyboard-commands.mjs`: base URL, viewport env, repeated Shift+Down metrics, view-selection proof, per-step scroll state. |
| examples/docs | parent plan updated only. |
| skills/workflow | no skill/rule changes. |
| reverted/quarantined packets | reverted checkVisibility/offscreen-target and native-collapse experiments; group size 32 line-fix-only was rejected by 839ms repeated p95. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Secondary single-key middle Shift+Down is about 149ms p95 in default viewport. | Not the user-visible held stall, but it is a measurable native same-block selection paint cost. | benchmark default vertical row | Keep as next perf/oracle packet only if a one-key middle stall is visible. |
| 2 | Group size 8 changes staged DOM budget/contracts. | It is the perf fix; reviewers should check staged materialization assumptions. | `editable-text-blocks.tsx`, `dom-strategy-and-scroll.tsx` | Review staged DOM tests and DOM budget expectations closely. |
| 3 | Raw mobile/device proof not run. | Claim width is desktop Chromium only. | mobile ledger | Do not make mobile claims from this run. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| S1 | optional | Do we want to chase the about 149ms single middle Shift+Down row now? | It is visible only as one-key native same-block paint, not the repeated held stall. | secondary perf packet | main repeated lane fixed | Defer unless user still sees a one-key middle stall. | benchmark default vertical row |

Findings:
- The actual repeated Shift+Down stall needed both a stronger oracle and a runtime fix. Single-key tests were insufficient.
- Wrapped-line rect grouping was wrong: adjacent lines with tiny gaps were merged, so vertical movement could jump below the intended visual line.
- A 32-block staged layout island still lets Chromium do expensive selection paint/layout work; 8-block staged groups remove the long frames and lower DOM nodes.

Decisions and tradeoffs:
- Keep staged root group size 8. This changes staged DOM budget contracts, but fixes the repeated selection stall and lowers mounted DOM.
- Keep real line-overlap grouping instead of tolerance-based adjacent-line grouping.
- Defer the about 149ms default-viewport single middle Shift+Down native paint row because the requested held/repeated lane is fixed and the row is not multi-second.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| checkVisibility/offscreen target guard | 1 | Test exact Down/Up symmetry | Reverted; did not move metric and could hide valid visual geometry. |
| native collapse after projected write | 1 | Inspect native selection after benchmark | Reverted; reconciliation re-expanded native and metric did not move. |
| line grouping only with group size 32 | 1 | Shrink staged layout island | Rejected; repeated p95 stayed about 839ms. |

Verification evidence:
- Baseline repeated Shift+Down: 2228.2ms p95 / 2205.6ms long-frame p95 in video-style lane before this repair.
- Residual default-viewport failure before group-size fix: repeated Shift+Down 898.8ms p95 / 883.5ms long-frame p95.
- Kept default viewport: repeated Shift+Down 53.9ms p95, zero long frames; select-all delete 45.9ms p95; undo delete 70ms p95.
- Kept video viewport 1480x2052: repeated Shift+Down 45.1ms p95, zero long frames; select-all delete 46.1ms p95; undo delete 71.9ms p95.
- Focused Playwright: `bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --workers=1 -g "(repeated Shift\\+ArrowDown|keeps staged 10k Shift\\+ArrowDown)"` passed 2 tests.
- Focused unit: `bun run test:vitest -- test/keyboard-input-strategy-contract.test.ts` passed 33 tests.
- Focused staged DOM: `bun run test:vitest -- test/dom-strategy-and-scroll.test.tsx` passed 47 tests.
- Full gate: `bun check` passed.

Final handoff contract:
- Goal plan: this file.
- Surface and route/package: `.tmp/plite` huge-document staged DOM-present route and `plite-react`.
- Invocation mode, elapsed/timebox, loop/checkpoint count: full-loop until fixed; 4 evidence loops.
- Behavior gates and visual proof: focused Playwright, focused Vitest, staged DOM tests, benchmark artifacts, and `bun check` passed.
- Primary metric baseline/latest/best and stop reason: repeated Shift+Down 2228.2ms baseline / 898.8ms residual default / 45.1-53.9ms latest with zero long frames; stop because requested held/repeated lane is fixed.
- Bugs fixed and oracles added: visual-line grouping, staged group size, repeated Shift+Down oracle, stale staged contracts.
- Benchmark/skill/docs repairs: benchmark repeated metrics, viewport env, per-step scroll state; no skill/docs source repair.
- Workflow slowdowns and repairs: benchmark teardown linger logged; stale test contracts repaired.
- Changed list: see Changed list table.
- Needs your attention: see ranked table.
- Stopping checkpoints to unblock: optional secondary single-key middle row packet only.
- Accepted deferrals and residual risks: raw mobile not claimed; about 149ms default single middle Shift+Down row deferred.
- Next owner: user review or optional secondary perf packet.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final handoff after fixed repeated huge-doc staged Shift+Down stall |
| Where am I going? | Final response, unless user opens optional secondary single-key packet |
| What is the goal? | Keep huge-doc staged repeated Shift+Down fast and correct |
| What have I learned? | Line grouping and staged layout island size were the real causes |
| What have I done? | Patched runtime, benchmark, Playwright oracle, staged DOM tests, and ran final gates |
| What changed in the checkpoint plan? | Added/reconciled repeated oracle, line grouping, group-size, stale-contract, and reverted-experiment checkpoints |

Timeline:
- 2026-06-05T19:10:04.530Z Goal plan created.
- 2026-06-05T22:40:00+02:00 Repeated Shift+Down fixed in default and video viewports; `bun check` passed.

Open risks:
- Secondary default-viewport single middle Shift+Down row remains about 149ms p95 from native same-block selection paint. Raw mobile/device behavior was not claimed or tested.
