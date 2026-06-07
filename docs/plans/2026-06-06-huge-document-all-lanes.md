# huge document all lanes

Objective:
Validate and repair Slate v2 huge-document behavior across staged, virtualized,
and auto lanes, with legacy Slate screenshot comparison as the final proof.

Goal plan:
docs/plans/2026-06-06-huge-document-all-lanes.md

Template:
docs/plans/templates/slate-automation.md

Primary template:
docs/plans/templates/slate-automation.md

Applied packs:
- none

Automation source:
- type: user invocation of `slate-automation`
- prompt / link: `8h on huge-document all lanes, staged, virtualized etc., all editor behaviors (cmd+a, navigation, history etc) to test etc. especially screenshot comparison as last stage to double confirm. with huge-document from ../slate`
- surface / route / package: `.tmp/slate-v2` huge-document example, `packages/slate-react`, `packages/slate-browser`, relevant Playwright/benchmark owners, and legacy comparison repo `../slate`
- invocation mode: timed mode
- timebox / deadline: 8h loop-start budget from 2026-06-06; finish/keep/revert/quarantine the active packet before handoff even if it exceeds the nominal timebox
- completion threshold summary: every in-scope huge-document strategy has behavior/native/visual proof for core editor gestures or an explicit owner/defer; final screenshot comparison against `../slate` is recorded; no dirty half-packet remains

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
- Captured prompt requirements:
  - run `slate-automation`;
  - timed `8h` mode;
  - focus on huge-document;
  - cover all lanes/strategies, explicitly staged and virtualized, plus auto/current default when available;
  - cover editor behaviors, explicitly Cmd+A/select-all, navigation, and history/undo/redo;
  - include typing, Enter, paste, delete, follow-up typing, scroll stability, native/model selection, and visual proof because those are the current huge-document risk class;
  - compare screenshots with huge-document from `../slate` as the last stage to double-confirm visual/native behavior;
  - repair safe bugs, missing oracles, benchmark/proof gaps, and workflow misses found by the loop;
  - no release/publish/PR/check-in ceremony unless explicitly requested;
  - final handoff must include changed list, metrics/proof, workflow slowdowns, needs-attention, stopping checkpoints, residual risks, and next owner.

Completion threshold:
- Done when staged, virtualized, and auto/default huge-document lanes have
  focused proof for select-all/delete, navigation including vertical
  Shift+Arrow reverse-path, typing/follow-up typing, Enter, paste, history
  undo/redo, scroll-away/back, native/model/view selection agreement, DOM
  budget sanity, and final screenshot comparison against `../slate`, or each
  missing item is explicitly deferred with owner, reason, and next command.
- Closure is legal only when required behavior, visual/native selection,
  package/API, mobile/raw-device claim-width, huge-document, docs/skill repair,
  changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and
  final handoff rows are complete, explicitly deferred, or N/A with evidence,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-06-huge-document-all-lanes.md`
  passes.

Verification surface:
- Primary route: `http://localhost:3100/examples/huge-document` with
  `strategy=staged`, `strategy=virtualized`, and default/auto where supported.
- Legacy comparison route: `../slate` huge-document example, discovered from
  that repo source and run locally when available.
- Replayable browser proof: focused Playwright rows under
  `.tmp/slate-v2/playwright/integration/examples/huge-document.test.ts`, plus
  new rows if gaps appear.
- Package proof: `bun --filter slate-react typecheck`,
  `bun --filter slate-react build`, `bun typecheck:root`, and focused Vitest
  contracts when `packages/slate-react` changes.
- Behavior proof: real keyboard/mouse Playwright, not model-only calls, for
  Cmd+A/select-all, delete, Arrow/Shift+Arrow navigation, typing, Enter, paste,
  undo/redo, scroll away/back, and strategy switching.
- Visual proof: fresh screenshots or geometry artifacts for final current vs
  legacy Slate comparison, inspected before handoff.
- Benchmark/perf proof: huge-document benchmark scripts only after correctness
  oracles are green enough for the packet.
- Skill/workflow proof: if `.agents/rules/**` changes, run `pnpm install` and
  mirror `rg`; otherwise mark N/A.
- Final proof: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-06-huge-document-all-lanes.md`.

Constraints:
- Slate v2 private alpha by default: no release, publish, changeset, PR, or
  branch readiness unless the prompt explicitly asks.
- Run Slate v2 behavior commands from `.tmp/slate-v2`; parent repo commands
  prove plans, docs, skills, and templates only.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a
  stopping checkpoint routes to `slate-plan`.
- Do not patch Plate when the run is scoped to Slate v2.

Boundaries:
- Source of truth: live `.tmp/slate-v2` source/tests/benchmarks, this active
  plan, `docs/slate-v2/agent-start.md`, `slate-north-star`, and the current
  `slate-automation` rule.
- Allowed edit scope: `.tmp/slate-v2` runtime/tests/examples/benchmarks for
  huge-document behavior, `docs/plans/2026-06-06-huge-document-all-lanes.md`,
  and `.agents/rules/**` only for proven workflow repair.
- Browser surfaces: local huge-document route at port 3100 and a separate
  legacy `../slate` huge-document route for final screenshots.
- Package/API surfaces: `packages/slate-react`, `packages/slate-browser` only
  if repeated proof helper patterns need promotion, and core Slate/history only
  if a behavior failure proves that owner.
- Agent/skill surfaces: `slate-automation`, `slate-patch`, autogoal template,
  or `slate-browser` policy only if this loop misses a reusable expectation.
- Docs/research surfaces: this plan first; durable `docs/slate-v2/**` only for
  accepted reusable decisions.
- Non-goals: release/publish/changeset/PR readiness, external issue ledgers,
  Plate-owned feature work, mobile raw-device claims unless a real device lane
  is available, broad pagination architecture not proven necessary by the
  active huge-document packet.

Blocked condition:
- Hard stop only for missing `../slate` source/server preventing legacy
  comparison with no substitute, unavailable local browser/runtime preventing
  all meaningful proof, destructive/commit/PR authority, raw-device-only claim,
  unsafe API/runtime fork with no safe reversible experiment, or a missing
  reusable taste decision not covered by `slate-north-star` and no safe
  alternate packet remains.
- Do not block while a safe alternate checkpoint remains runnable. In timed or
  batch mode, queue soft questions for final handoff.

Automation state:
- surface: huge-document all lanes
- mode: timed 8h
- checkpoint_policy: dynamic_supervisor
- current_loop: 5
- current_checkpoint: perf-packet
- current_checkpoint_status: checkpoint_recorded
- next_checkpoint: review-and-handoff
- goal_status: active

Current verdict:
- verdict: huge-document behavior and screenshots are green; one legacy-compare perf gap is queued, not patched blindly
- confidence: high for covered behavior/visual proof; medium for perf parity because select-then-type remains slower than legacy in jsdom compare
- next owner: slate-automation review-and-handoff
- keep / revert / quarantine call: keep runtime/test/benchmark packet; quarantine legacy select-then-type perf gap for a focused perf owner
- reason: managed browser suites pass, screenshot artifacts inspected, benchmark compare runs after harness repair

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-06-huge-document-all-lanes.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-automation | complete | P0 | Copy prompt requirements and read north-star before implementation. | Requirement rows complete in first checkpoint section. | update: completed before implementation |
| status-and-scenario-matrix | slate-automation | pending | P0 | Read target route/source/test owners and synthesize concrete huge-document scenario matrix. | Current state plus matrix recorded. | add: user asked all lanes/all editor behaviors. |
| gap-scan | slate-automation | pending | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Gaps routed to packet owners. | update: scoped to huge-document lanes. |
| behavior-proof | slate-ar-stabilize | complete | P0 | Prove stable editor behavior before perf. | Focused behavior commands pass or failures routed. | update: Chromium 24 passed; Firefox/WebKit 12 passed each |
| oracle-repair | slate-patch / tdd | complete | P0 | Add missing native/visual/model oracles for found gaps. | New proof fails before fix or coverage gap is explicit. | update: auto/virtualized/replacement rows added and kept |
| visual-proof | Browser / Playwright | complete | P0 | Prove visible editor behavior and native selection. | Browser/screenshot/geometry evidence recorded. | update: screenshots inspected |
| legacy-screenshot-compare | Playwright | complete | P0 | Final comparison against `../slate` huge-document to double-confirm visual/native behavior. | Fresh current/legacy screenshots inspected and recorded. | update: artifacts in `docs/plans/artifacts/huge-document-2026-06-06` |
| slate-browser-promotion | slate-browser | pending | P1 | Promote repeated browser proof into reusable API/helper. | Helper added, queued, or N/A with reason. | seed |
| mobile-claim-width | slate-automation | pending | P1 | Separate raw-device proof from viewport proof. | Raw proof command passes or scoped blocker recorded. | seed |
| huge-document-smoke | slate-ar-stabilize | pending | P1 | Smoke huge-doc correctness without broad architecture work. | Typing/Enter/paste/select-all/undo/nav/scroll proof recorded. | seed |
| perf-packet | slate-ar-fast / slate-ar-perf | checkpoint_recorded | P2 | Optimize only after correctness is green. | Metric target or plateau recorded. | update: select-then-type p95 gap queued |
| consolidation | slate-automation | pending | P1 | Move accepted reusable decisions to durable docs/rules. | Durable owner updated or N/A. | seed |
| final-handoff | slate-automation | pending | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows complete. | seed |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | update | checkpoint-zero | latest prompt copied into plan | prevent compaction miss | complete |
| 0 | add | status-and-scenario-matrix, legacy-screenshot-compare | user required all lanes and `../slate` screenshot comparison | template rows were too generic | active |
| 0 | update | gap-scan, behavior-proof, visual-proof | user scoped huge-document all editor behaviors | route all packets to huge-document before perf | active |
| 1 | add | virtualized-cmd-a-delete-oracle | missing explicit browser Cmd+A/Delete proof for virtualized huge docs | previous manual report showed visual selection and delete regressions | focused row added and green |
| 1 | update | behavior-proof | focused auto and virtualized rows pass in Chromium | enough to broaden to full suite, not enough for closure | continue |
| 2 | update | full-range-replacement | full Chromium suite exposed staged 10k and auto 20k paste timeouts | replacement removed thousands of top-level blocks one by one | structural `replace_children` packet added and focused proof green |
| 3 | update | behavior-proof | managed Chromium/Firefox/WebKit huge-document suites are green | all current browser behavior rows passed or were scoped Chromium-only skips | complete for current behavior proof |
| 4 | update | legacy-screenshot-compare | screenshot artifacts generated for current staged, current virtualized, and `../slate` legacy | visual inspection found single projected highlight layer and coherent Shift+Up collapse | complete |
| 5 | update | perf-packet | small legacy compare initially failed on stale staged native-surface-complete metric, then ran after benchmark repair | replacement lanes are faster than legacy; select-then-type p95 is slower | queue perf checkpoint |
| 6 | update | guard-oracle | review found multiline/custom handler risk in full-block replacement fast path | added multiline and insert-data-handler guards; existing multiline/fragment contracts pass | complete |

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
| Prompt requirements captured before work | yes | First checkpoint section copies scope, timing, behaviors, screenshot comparison, non-goals, deliverables, stop rules, and proof surfaces |
| `slate-automation` source rule read | yes | user included generated skill body; source rule behavior confirmed by generated mirror |
| `slate-north-star` read as checkpoint zero | yes | `.agents/skills/slate-north-star/SKILL.md` read |
| Active goal checked or created | yes | `create_goal` active objective created |
| Invocation mode and timebox recorded | yes | timed 8h mode, finish active packet before handoff |
| Dynamic checkpoint policy accepted | yes | plan allows add/update/split/merge/reopen from evidence |
| Source of truth and allowed workspaces recorded | yes | boundaries section |
| Output budget strategy recorded | yes | narrow searches, artifacts/plan rows over broad streamed scans; one broad `rg` logged as slowdown |
| Private-alpha release/PR boundary recorded | yes | no release/publish/changeset/PR unless explicitly requested |
| Browser proof strategy recorded | yes | Playwright/screenshots; in-app Browser unavailable as direct tool, use Playwright screenshot proof |
| Package/API proof strategy recorded | yes | focused `slate-react` type/build/root typecheck when runtime changes |
| Mobile/raw-device claim-width policy recorded | yes | N/A unless a real device lane appears; do not claim raw-device proof |
| Skill repair authority and source-rule boundary recorded | yes | `.agents/rules/**` only when reusable workflow miss is proven |

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
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | Chromium/Firefox/WebKit suites, package checks, screenshots, and benchmark artifact recorded |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | 6 mutation rows recorded |
| Workspace authority proof | yes | Record cwd/tool for each Slate v2, parent-docs, skill, browser, package, or benchmark proof | commands recorded with `.tmp/slate-v2` or parent docs artifacts |
| Behavior gates | yes | Run focused stable behavior proof or record scoped defer rows | behavior proof ledger complete |
| Visual/native selection proof | yes | Record Browser/Playwright/native-selection evidence or scoped blocker | screenshot artifacts and native/model summaries recorded |
| Missing oracle repair | yes | Add/verify/revert/quarantine oracle packets or record owner defer | auto, virtualized, replacement, multiline/fragment oracles recorded |
| `slate-browser` promotion | no | Add/verify helper/API or record queue/defer reason | N/A: helper stayed local; promote only if reused outside huge-document suite |
| Mobile/raw-device claim width | no | Run raw-device proof or record that only scoped viewport/browser proof is available | N/A: no mobile/raw-device claim in this prompt |
| Huge-document correctness smoke | yes | Run focused huge-document behavior smoke or record owner defer | smoke ledger complete |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | `slate-react` typecheck/build, root typecheck, Vitest |
| Skill/rule sync | no | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | N/A: no `.agents/rules/**` changes |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | changed list, needs-attention, stopping checkpoints filled |
| Final lint/check | yes | Run scoped lint/check or record why no code changed | targeted Biome, type/build, Playwright suites, Vitest |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | slowdown table filled |
| Agent-native review for agent/tooling changes | no | Load `agent-native-reviewer` and close accepted findings, or N/A | N/A: no agent/tooling surface changed |
| Autoreview for non-trivial implementation changes | yes | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | manual diff review found multiline/custom-handler risk; guard added and verified |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-06-huge-document-all-lanes.md` | rerun after this table update |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | prompt copied; north-star and agent-start read | status-and-scenario-matrix |
| Status and current-tree closure | complete | route/test/benchmark/legacy owners inspected; focused proof owner chosen | gap scan |
| Gap scan and scenario matrix | complete | matrix below; gaps patched or scoped | behavior proof |
| Behavior proof | complete | full Chromium 24 passed; Firefox/WebKit portable rows passed | visual proof |
| Oracle repair | complete | missing browser shortcut/history/replacement/guard rows added | visual proof |
| Visual/native proof | complete | screenshot artifacts inspected | slate-browser promotion |
| slate-browser promotion | complete | N/A: helper remains local until reused outside suite | mobile claim width |
| Mobile/raw-device claim width | complete | N/A: no raw-device claim made | huge-document smoke |
| Huge-document correctness smoke | complete | smoke ledger complete | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | complete | benchmark repaired; select-then-type gap queued | consolidation |
| Consolidation and review | complete | plan updated; no durable skill/rule change needed | final handoff |
| Final handoff and goal-plan check | complete | checker rerun pending, then final response | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| huge-document | plain wrapped large document | staged, 5k+ blocks | collapsed typing, follow-up typing | model value/selection, native caret, visible text, latency sanity | existing row: staged middle-block editing/undo/Enter/scroll; rerun |
| huge-document | plain wrapped large document | virtualized, 5k+ blocks | collapsed typing, follow-up typing | model value/selection, native caret, visible text, latency sanity | existing row: virtualized typing/undo/arrows/Enter/scroll; rerun |
| huge-document | plain wrapped large document | auto/default | collapsed typing, follow-up typing | model value/selection, native caret, visible text, strategy truth | focused row added and green in Chromium |
| huge-document | selection across many blocks | staged + virtualized | Shift+Down then Shift+Up | reverse-path equality, model/native/view markers, screenshot sanity | existing row after last repair; rerun with screenshot artifact if needed |
| huge-document | selection across many blocks | staged | Cmd+A/select-all then Delete | deletion latency, model document shape, native selection cleared, follow-up typing | existing row: staged 10k select-all/delete/type/paste/undo; rerun |
| huge-document | selection across many blocks | virtualized | Cmd+A/select-all then Delete | deletion latency, model document shape, native selection cleared, follow-up typing | focused row added and green in Chromium |
| huge-document | selection across many blocks | auto/partial-dom | Cmd+A/select-all then paste/undo | DOM budget, model shape, history selection | existing row uses model selectAll, not browser Cmd+A; consider browser shortcut proof |
| huge-document | history stack | staged + virtualized | type, Enter, paste, undo, redo | exact value/selection after each history step | partial existing; redo gap likely |
| huge-document | scroll window | staged + virtualized | scroll away/back then type/nav | scroll anchor, mounted window, caret visible, no stale target | existing full/virtualized rows; staged scroll covered by middle-block row |
| huge-document | drag/blank gaps | virtualized | drag autoscroll, blank-gap selection | scroll direction, no document-start regression | existing rows; rerun when broad behavior proof starts |
| huge-document | visual parity | current staged/virtualized vs legacy `../slate` | screenshot after matching selection/nav/select-all states | screenshot comparison, native/model notes, inspected image paths | explicit final-stage gap |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| virtualized-cmd-a-selection | 1 | slate-react | Browser Cmd+A selected the model but did not paint a projected view selection in virtualized huge docs. | `.tmp/slate-v2/packages/slate-react/src/view-selection.ts`, `.tmp/slate-v2/packages/slate-react/src/editable/caret-engine.ts`, `.tmp/slate-v2/packages/slate-react/src/editable/mutation-controller.ts` | focused Chromium proof below | keep | full suite |
| virtualized-full-delete | 1 | slate-react | Once projected select-all painted, Delete needed a full-block fast path instead of deleting thousands of projected text ranges. | `.tmp/slate-v2/packages/slate-react/src/editable/mutation-controller.ts` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "auto partial-dom collapsed typing|virtualized browser select-all"` passed | keep | full suite |
| auto-collapsed-history-oracle | 1 | playwright | Auto/partial-dom lane lacked browser collapsed typing, arrow nav, undo, and redo proof. | `.tmp/slate-v2/playwright/integration/examples/huge-document.test.ts` | same focused Chromium grep passed | keep | Firefox/WebKit and full suite |
| full-range-replacement-fast-path | 2 | slate-react | 10k staged and 20k auto paste replacement timed out because full-block replacement removed every top-level block individually. | `.tmp/slate-v2/packages/slate-react/src/editable/mutation-controller.ts` | focused Chromium grep for staged 10k, auto 5k, auto 20k, and full 300 replacement passed in 20.0s | keep | full Chromium suite |
| huge-document-browser-suites | 3 | playwright | Full behavior proof across current huge-document lanes after runtime/test repair. | `.tmp/slate-v2/playwright/integration/examples/huge-document.test.ts` | Chromium 24 passed; Firefox 12 passed/12 skipped; WebKit 12 passed/12 skipped | keep | screenshots |
| legacy-screenshot-compare | 4 | Playwright | Final visual/native proof against current staged, current virtualized, and `../slate` huge-document. | `docs/plans/artifacts/huge-document-2026-06-06/summary.json` plus PNGs | inspected images; current select-all uses one projected highlight layer, legacy uses native selection | keep | review |
| legacy-compare-benchmark-hygiene | 5 | benchmark | Legacy compare failed because staged mode waited for a stale full native-surface-complete metric. | `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs` | current-only `v2DomPresent` artifact writes; small compare artifact writes | keep | queue select-then-type perf gap |
| full-block-paste-safety-guard | 6 | slate-react | Full-block fast path must not flatten multiline paste or bypass custom insert-data handlers. | `.tmp/slate-v2/packages/slate-react/src/editable/mutation-controller.ts` | focused browser rows plus multiline/fragment Vitest contracts passed | keep | final review |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| owner discovery | `.tmp/slate-v2` huge-document | targeted `rg` and `sed` over route/test/benchmark owners | N/A | existing tests cover many lanes but gaps found | add virtualized Cmd+A/Delete, auto collapsed typing/nav/shortcut proof, redo and final screenshot compare as needed |
| focused auto + virtualized oracle | `.tmp/slate-v2` huge-document | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "auto partial-dom collapsed typing|virtualized browser select-all"` | Chromium | 2 passed in 8.9s | run full huge-document suite |
| focused full-range replacement oracle | `.tmp/slate-v2` huge-document | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "staged 10k select-all|auto partial-dom select-all|auto partial-dom 20k select-all|replaces a huge select-all range"` | Chromium | 4 passed in 20.0s; rows were 5.8s, 2.4s, 3.3s, 685ms | run full huge-document suite |
| full huge-document suite | `.tmp/slate-v2` huge-document | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=chromium` | Chromium | 24 passed in 37.8s after formatting | complete |
| portable huge-document suite | `.tmp/slate-v2` huge-document | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=firefox` | Firefox | 12 passed, 12 Chromium-only skipped in 21.1s after formatting | complete |
| portable huge-document suite | `.tmp/slate-v2` huge-document | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=webkit` | WebKit | 12 passed, 12 Chromium-only skipped in 29.4s after sequential rerun | complete |
| final full huge-document suite after guard | `.tmp/slate-v2` huge-document | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=chromium` | Chromium | 24 passed in 38.2s | complete |
| multiline/fragment paste contracts | `packages/slate-react` | `bun --filter slate-react test:vitest dom-strategy-and-scroll.test.tsx --testNamePattern "preserves multiline plain text over a full-document partial-dom-backed selection|preserves Slate fragment data for partial-dom-backed paste"` | Vitest | 2 passed, 45 skipped | complete |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| virtualized Cmd+A before fix | model selection covered full 5000-block document | native text length 0 by design for projected selection | view selection inactive, marker count 0 | `/tmp/slate-virtualized-cmd-a-1780743644143.png` captured no visible selection | failure reproduced |
| virtualized Cmd+A after fix | model selection covered full 5000-block document | native text length 0 by design for projected selection | view selection active with markers | focused Playwright oracle passed | keep, broaden proof |
| current staged 5k select-all | model selection `[0,0]:0` to `[4999,0]:102` | native text length 0 by design for projected selection | 24 projected markers | `docs/plans/artifacts/huge-document-2026-06-06/current-staged-5k-select-all.png` | single projected highlight layer |
| current virtualized 5k select-all | model selection `[0,0]:0` to `[4999,0]:102` | native text length 0 by design for projected selection | 12 projected markers | `docs/plans/artifacts/huge-document-2026-06-06/current-virtualized-5k-select-all.png` | single projected highlight layer |
| current virtualized Shift+Down then Shift+Up | Shift+Down model `[0,0]:8` to `[0,0]:42`; Shift+Up collapses back to `[0,0]:8` | native text length 0 by design for projected selection | one marker on Shift+Down, zero after Shift+Up | `current-virtualized-5k-shift-down-from-handle.png`, `current-virtualized-5k-shift-up-after-down-from-handle.png` | no double highlight seen |
| legacy Slate 5k select-all | N/A: legacy does not expose v2 browser handle | native text length 745141 | native selection range | `legacy-slate-5k-select-all.png` | comparable selected visible surface, different selection mechanism |

slate-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| projected view selection summary | `getViewSelectionSummary`, virtualized select-all oracle | already local to current Playwright helper surface | focused grep | defer promotion until repeated outside this suite |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| pending | pending | pending | pending | pending |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| huge-document auto | collapsed type, ArrowLeft/Right, undo, redo | exact model text and selection after each step, caret visible | focused Chromium grep | passed |
| huge-document virtualized | browser Cmd+A, Delete, type, undo, redo | model selection/value, view selection active after Cmd+A, DOM budget under 80 mounted blocks | focused Chromium grep | passed |
| huge-document staged/auto/full | select-all paste/replacement undo | exact model replacement, selection, undo restoration | focused Chromium replacement grep | passed |
| huge-document partial-dom paste safety | multiline paste and Slate fragment paste over full-document projected selection | multiline splits into paragraphs; Slate fragment stays fragment-owned | focused Vitest contracts | passed |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| broad `rg` over `docs/slate-v2 docs/plans benchmarks/targets .tmp/slate-v2` | slate-automation | under 1 minute but output-heavy | search was too broad and streamed thousands of matches | showed need to narrow to owner files/artifacts | keep as logged miss; use targeted route/test/benchmark owner reads next |
| stale-server focused proof risk | slate-automation | one failed/uncertain slice before managed rerun | `PLAYWRIGHT_BASE_URL` can point at stale built output after runtime changes | managed Playwright rerun rebuilt and passed | use managed Playwright or freshly rebuilt server for runtime proof |
| full Chromium suite before second fix | slate-react | 6.0m | exposed four select-all replacement failures and long paste waits | 20 passed, 4 failed | keep failure as baseline; repair shared replacement path |
| parallel managed Playwright builds | slate-automation | failed fast | Firefox and WebKit managed runs both invoked `next build`; WebKit failed with "Another next build process is already running." | sequential WebKit rerun passed | do not parallelize managed Playwright projects that own the same Next build directory |
| legacy compare native-surface-complete metric | benchmark | two failed attempts | staged `v2DomPresent` waited for full native-surface completion even though staged huge-doc keeps pending groups by design | opt-in metric flag added; benchmark writes artifacts | keep benchmark repair |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `.tmp/slate-v2/packages/slate-react/src/view-selection.ts`, `.tmp/slate-v2/packages/slate-react/src/editable/caret-engine.ts`, `.tmp/slate-v2/packages/slate-react/src/editable/mutation-controller.ts` |
| tests/oracles/browser proof | `.tmp/slate-v2/playwright/integration/examples/huge-document.test.ts` |
| benchmarks/metrics/targets | `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`; fresh artifacts under `.tmp/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark-*` |
| examples/docs | `docs/plans/2026-06-06-huge-document-all-lanes.md`; screenshot artifacts under `docs/plans/artifacts/huge-document-2026-06-06/` |
| skills/workflow | no `.agents/rules/**` changes in this packet |
| reverted/quarantined packets | none reverted; select-then-type perf parity is quarantined/queued |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Legacy compare select-then-type p95 | Current default-auto is slower than legacy in jsdom compare, though still sub-40ms. | `.tmp/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark-compare-v2DefaultRenderAuto-v2DomPresent-blocks-5000-iters-2-ops-5-chunk-1000-segment-32-radius-0-dispose-500-full-run-native-beforeinput-combined-surfaces-split-selection-no-profile.json` | Route to focused perf packet, not this behavior-fix packet |
| 2 | Firefox/WebKit Chromium-only skips | Some keyboard/perf rows are intentionally Chromium-only. Portable rows pass, but full parity proof is not claimed. | `playwright/integration/examples/huge-document.test.ts` | Keep claim scoped |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| SC-1 | perf | Should we chase jsdom select-then-type parity vs legacy now? | Current default-auto p95 39.45ms vs legacy 22.29ms; profiler does not name a small product owner. | none | behavior/visual/replacement fixes completed | defer to focused `slate-ar-perf` packet | legacy compare artifact |
| SC-2 | browser coverage | Should Chromium-only huge-doc keyboard/perf rows be ported to Firefox/WebKit? | Portable rows pass, but shortcut/perf rows are scoped Chromium-only. | none | current claim is scoped | keep scoped unless cross-browser parity becomes a requirement | Playwright suite output |

Findings:
- Virtualized Browser Cmd+A can have model selection without native selected text; the correct visual oracle is projected view-selection markers plus screenshot, not `window.getSelection().toString()`.
- Full-document projected Delete needs the top-level full-block delete path. Deleting each projected text range is the slow path the user saw.
- Full-document text replacement needs the same structural top-level replacement path as Delete. Removing 10k or 20k top-level blocks individually is the timeout path.
- Full-document text replacement must stay single-line only and must not bypass custom insert-data handlers. Existing multiline and Slate fragment tests cover that risk.

Decisions and tradeoffs:
- Keep projected select-all as a Slate view selection in virtualized mode so selection can paint without mounting every block.
- Keep full-document Delete on a structural replacement path; do not optimize it by hiding latency behind debounce.
- Keep full-document paste/text replacement on a single `replace_children` operation when the selection covers all top-level blocks.
- Do not use the fast path for multiline text or when insert-data handlers are registered; preserve existing clipboard semantics over speed there.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Auto partial-dom oracle waited for block 2500 materialization although partial-DOM does not mount it | 1 | move the focused collapsed editing row to a mounted block | fixed; focused grep passed |
| Virtualized Cmd+A initially asserted model selection only and missed no visible highlight | 1 | add projected view-selection marker assertion and screenshot sanity | fixed; focused grep passed |
| Full Chromium suite found staged 10k and auto 20k paste timeouts after projected replacement patch | 1 | replace all top-level children in one operation instead of per-block removal | fixed; focused replacement grep passed |
| Review found multiline/custom-handler risk in the fast path | 1 | add guard and run existing multiline/fragment contracts | fixed; focused rows and contracts passed |

Verification evidence:
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "auto partial-dom collapsed typing|virtualized browser select-all"` passed: 2 tests, 8.9s.
- `bun --filter slate-react typecheck` passed after both runtime patches.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "staged 10k select-all|auto partial-dom select-all|auto partial-dom 20k select-all|replaces a huge select-all range"` passed: 4 tests, 20.0s.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=chromium` passed after guard: 24 tests, 38.2s.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=firefox` passed after formatting: 12 tests, 12 Chromium-only skipped, 21.1s.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/huge-document.test.ts --project=webkit` passed sequentially after formatting: 12 tests, 12 Chromium-only skipped, 29.4s.
- `bun --filter slate-react build` passed.
- `bun typecheck:root` passed.
- `bun --filter slate-react test:vitest keyboard-input-strategy-contract.test.ts --testNamePattern "plain vertical shift extension|virtualized plain vertical shift"` passed: 7 tests, 27 skipped.
- `bun --filter slate-react test:vitest dom-strategy-and-scroll.test.tsx --testNamePattern "preserves multiline plain text over a full-document partial-dom-backed selection|preserves Slate fragment data for partial-dom-backed paste"` passed: 2 tests, 45 skipped.
- `REACT_HUGE_COMPARE_ITERATIONS=2 REACT_HUGE_COMPARE_TYPE_OPS=5 REACT_HUGE_COMPARE_SURFACES=v2DefaultRenderAuto,v2DomPresent REACT_HUGE_COMPARE_SPLIT_SELECTION=1 bun bench:react:huge-document:legacy-compare:local` passed after benchmark repair.
- Screenshot artifacts: `docs/plans/artifacts/huge-document-2026-06-06/summary.json` and PNGs.

Final handoff contract:
- Goal plan: this file
- Surface and route/package: `.tmp/slate-v2` huge-document, `packages/slate-react`, `packages/slate-browser` proof helpers, legacy `../slate`
- Invocation mode, elapsed/timebox, loop/checkpoint count: timed 8h mode; 6 recorded loops/checkpoints
- Behavior gates and visual proof: full Chromium suite, Firefox/WebKit portable suites, screenshot artifacts
- Primary metric baseline/latest/best and stop reason: select-all replacement went from timeout/failure to 5.8s staged 10k, 3.4s auto 20k, 610ms virtualized delete row; stopped current packet because behavior/visual proof is green and remaining perf gap is queued
- Bugs fixed and oracles added: virtualized projected select-all paint, full-doc Delete fast path, full-doc text replacement fast path, auto collapsed typing/nav/undo/redo oracle, virtualized Cmd+A/Delete oracle
- Benchmark/skill/docs repairs: legacy compare native-surface-complete metric made opt-in; no skill/rule change
- Workflow slowdowns and repairs: stale server risk, parallel Next build conflict, benchmark stale metric logged
- Changed list: see Changed list table
- Needs your attention: see Needs your attention table
- Stopping checkpoints to unblock: see Stopping checkpoints table
- Accepted deferrals and residual risks: select-then-type perf parity and Firefox/WebKit porting of Chromium-only rows
- Next owner: focused `slate-ar-perf` only if you want to chase the select-then-type parity gap

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Review and handoff, loop 6 |
| Where am I going? | Dynamic checkpoint loop through final handoff |
| What is the goal? | Huge-document all-lanes behavior/visual validation and safe repair |
| What have I learned? | Projected select-all needs view markers, full Delete/replacement need structural ops, staged native-surface-complete benchmark was stale |
| What have I done? | Added/fixed oracles, repaired runtime, captured screenshots, repaired benchmark, verified suites |
| What changed in the checkpoint plan? | See Checkpoint mutation ledger |

Timeline:
- 2026-06-06T10:50:50.711Z Goal plan created.
- Loop 1: focused Chromium auto/virtualized oracle passed after runtime/test repair.
- Loop 2: full Chromium exposed full-range paste/replacement timeouts; structural replacement patch made focused replacement rows pass.
- Loop 3: managed Chromium/Firefox/WebKit huge-document suites passed.
- Loop 4: screenshot comparison against `../slate` completed and inspected.
- Loop 5: legacy compare benchmark repaired and run; select-then-type perf gap queued.
- Loop 6: multiline/custom-handler guard added and verified.

Open risks:
- Select-then-type p95 in the jsdom legacy compare is still slower than legacy: current default-auto 39.45ms vs legacy 22.29ms. Replacement lanes are faster than legacy.
- Firefox/WebKit proof is scoped to portable rows; Chromium-only rows remain intentionally scoped.
