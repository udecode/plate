# Slate v2 full-confidence automation backlog

Objective:
Run the Slate v2 confidence backlog slowly, checkpoint by checkpoint, until each
lane is proven done, deferred with owner, or blocked by real authority.

Goal plan:
docs/plans/2026-06-05-slate-v2-full-confidence-automation-backlog.md

Template:
docs/plans/templates/slate-automation.md

Primary template:
docs/plans/templates/slate-automation.md

Applied packs:
- none

Automation source:
- type: user-invoked `slate-automation`
- prompt / link: current thread request, 2026-06-05
- surface / route / package: `.tmp/slate-v2` editor behavior, browser proof,
  benchmark targets, `slate-browser`, package/API/docs, and workflow skills
- invocation mode: full-loop, no explicit timebox
- timebox / deadline: none. Do not rush. Loop each checkpoint until fully
  confident, explicitly deferred, or blocked.
- completion threshold summary: every listed lane has packet-ledger evidence,
  focused proof commands, and keep/revert/quarantine decisions; no perf lane
  starts before behavior/oracle confidence is green.

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
- Done means all ordered lanes below are complete, explicitly deferred with
  owner/proof command, or blocked by a real authority boundary:
  selection oracle upgrade; stable behavior sweep; benchmark honesty;
  huge-document correctness smoke; huge-document perf; staged/full-DOM debt;
  `slate-browser` API promotion; mobile/raw-device claim width; API/DX hard
  cuts; external issue-ledger readiness; skill/workflow self-repair.
- Do not advance from a lane merely because one nearby row passed. Each lane
  needs granular checkpoints and enough proof to survive the user's "I tried it,
  still happens" review.
- Closure is legal only when required behavior, visual/native selection,
  package/API, mobile/raw-device claim-width, huge-document, docs/skill repair,
  changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and
  final handoff rows are complete, explicitly deferred, or N/A with evidence,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-slate-v2-full-confidence-automation-backlog.md`
  passes.

Verification surface:
- Focused Playwright examples from `.tmp/slate-v2` for richtext, plaintext,
  markdown shortcuts, history, editable voids, custom placeholder,
  hidden-content-blocks, and huge document routes.
- Selection proof requires model selection, native `window.getSelection()`,
  and DOM endpoints/caret/geometry where structure is stable.
- Browser-visible proof uses in-app Browser for smoke when route is obvious,
  and replayable Playwright for behavior claims.
- Benchmark proof uses `benchmarks/targets/slate-v2.json` target commands and
  benchmark-native `METRIC` lines: strict budgets, cold/materialized selection,
  model-backed typing, listener/selector counts, type-to-paint p95, burst
  typing, click latency, DOM budget, and long task visibility.
- Mobile proof uses raw-device lane only for raw Android/iOS claims. Playwright
  mobile viewport can only prove scoped viewport behavior.
- Package/API proof uses source greps, focused package tests/typechecks, docs
  API audit, and public examples. No compat aliases unless actively accepted.
- Skill/workflow proof uses source-rule patch, `pnpm install`, generated mirror
  audit, and plan evidence when a repeated workflow miss is repaired.
- Final proof uses changed list, review-attention list, stopping checkpoints,
  focused checks, review gates as applicable, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-slate-v2-full-confidence-automation-backlog.md`.

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
- Source of truth: live `.tmp/slate-v2` source/tests/benchmarks for runtime;
  `docs/slate-v2/agent-start.md`, `slate-north-star`, benchmark targets, and
  this plan for control state.
- Allowed edit scope: `.tmp/slate-v2` runtime/tests/benchmarks/docs as needed;
  parent `docs/**` for durable plans/Slate-v2 evidence; `.agents/rules/**`
  only for reusable workflow repair with mirror sync.
- Browser surfaces: richtext, plaintext, markdown shortcuts, history, editable
  voids, custom placeholder, hidden/dom coverage, huge document, and any route
  implicated by a failure.
- Package/API surfaces: Slate v2 core/react/dom/history/browser packages,
  public examples, docs/API surfaces, and benchmark scripts.
- Agent/skill surfaces: `slate-automation`, `slate-browser`, benchmark owners,
  autogoal templates, and specialist rules only when the loop proves a
  recurring miss.
- Docs/research surfaces: active plan, `docs/slate-v2/**`, benchmark target
  docs, and `docs/editor-issue-harvester/**` for external ledger readiness.
- Non-goals: no release/publish/PR readiness; no broad experimental pagination
  architecture before oracle/behavior confidence; no Plate patching unless a
  later prompt changes scope; no external issue checkmark grind before local
  oracle infra is strong.

Blocked condition:
- Stop only for a real hard boundary: missing raw device lane for raw-device
  claims, unsafe public API/runtime fork requiring `slate-plan`, credential or
  tool access failure that blocks all useful work, repeated same-signal blocker
  after the right owner was tried, commit/PR/destructive authority, or missing
  reusable taste in `slate-north-star` with no safe alternate checkpoint.
- Do not block while a safe alternate checkpoint remains runnable. In timed or
  batch mode, queue soft questions for final handoff.

Automation state:
- surface: Slate v2 full-confidence backlog
- mode: full-loop
- checkpoint_policy: dynamic_supervisor
- current_loop: 14
- current_checkpoint: review-gates-and-final-handoff
- current_checkpoint_status: in_progress
- next_checkpoint: check-complete-and-close
- goal_status: active

Current verdict:
- verdict: active, closeable after review/check-complete gates
- confidence: behavior, selection, benchmark honesty, huge-doc correctness,
  huge-doc strict perf, API/DX, mobile claim-width, external ledgers, and
  workflow repair are proven or scoped.
- next owner: slate-automation review gates
- keep / revert / quarantine call: keep helper/API, runtime repair,
  benchmark-honesty, docs/API cleanup, generated benchmark reports, and skill
  repair packets; staged/full-DOM debt remains deferred to architecture/perf.
- reason: accepted autoreview findings are being closed before final handoff and
  `check-complete`.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-slate-v2-full-confidence-automation-backlog.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-automation | complete | P0 | Copy prompt requirements and read north-star before implementation. | Requirements copied; `slate-north-star` and `docs/slate-v2/agent-start.md` read. | updated from seed |
| status-and-current-evidence | slate-automation | complete | P0 | Learn current route/test/benchmark owners without patching blindly. | Source/test/benchmark owner map recorded in packet, behavior, visual/native, benchmark, and verification ledgers. | split from status |
| checkpoint-supervision | slate-automation | complete | P0 | Reconcile plan after every loop, adding/removing/splitting rows from evidence. | 13 mutation rows recorded; autoreview reopened benchmark-honesty/report/plan-state rows and they were repaired. | added |
| selection-oracle-inventory | slate-automation / slate-browser | complete | P0 | Identify current model/native/DOM endpoint helpers and missing multi-leaf coverage. | Helper/test map recorded; repeated model/native/DOM endpoint proof promoted into `slate-browser`. | added |
| selection-multi-leaf-oracle | slate-patch / tdd | complete | P0 | Prove selection across marks, links, inline boundaries, and multiple leaves. | Richtext helper-backed row passed: model selection, native selected text, DOM endpoints, typing replacement, undo, and reselected text. | covered by existing test plus helper promotion |
| selection-pointer-oracle | slate-patch / tdd | complete, scoped | P0 | Prove drag, double-click, margin click, blank-space click, and caret geometry. | Chromium drag, right-margin, blank-gap, and double-click rows passed; Firefox/WebKit pointer breadth is scoped to existing non-skipped rows. | updated |
| selection-keyboard-oracle | slate-patch / tdd | complete, scoped | P0 | Prove arrows, shift arrows, undo/redo selection, scroll away/back, and follow-up type. | Chromium keyboard rows pass; Firefox/WebKit non-skipped undo/scroll rows pass; some native arrow rows remain intentionally browser-scoped. | updated |
| stable-richtext-plaintext | slate-ar-stabilize | complete | P0 | Stable richtext/plaintext behavior must be green before perf. | Focused Chromium richtext/plaintext rows passed inside 22-test stable sweep. | covered by existing tests |
| stable-markdown-history | slate-ar-stabilize | complete | P0 | Markdown shortcuts and history are core stable behavior. | Markdown shortcut browser rows passed; `slate-history` package contracts passed 47/47. | covered by existing tests |
| stable-void-placeholder-hidden | slate-ar-stabilize | complete | P0 | Editable voids, custom placeholder, hidden/dom routes are recurring bug surfaces. | Editable void, placeholder, hidden-content, DOM coverage, and document-state browser rows passed inside 22-test stable sweep. | covered by existing tests |
| benchmark-honesty-inventory | slate-ar-perf / slate-automation | complete | P0 | Do not optimize lying metrics. | `huge-document-full` and browser trace scripts expose strict budgets, cold/materialized selection, model-backed typing, listener/selector counts, DOM, long-task, type-to-paint, and burst metrics. | covered by target/script audit |
| benchmark-honesty-repair | slate-ar-perf / slate-patch | complete | P0 | Repair missing/lying metrics before perf packets. | Patched `benchmarks/targets/slate-v2.json` so aggregate full target runs `HUGE_DOC_FULL_STRICT_BUDGET=1` and browser trace primary uses real METRIC output. Strict smoke proved budget failures exit nonzero. | kept |
| huge-doc-correctness-5k | slate-ar-stabilize | complete | P1 | 5k huge-doc behavior must stay correct. | 13-row Chromium huge-doc smoke includes 5k virtualized typing, undo, arrows, Enter, scroll, and 5k auto partial-DOM select-all/paste/undo. | expanded oracle and kept |
| huge-doc-correctness-20k | slate-ar-stabilize | complete | P1 | 20k huge-doc smoke catches materialization/scroll regressions. | 20k virtualized typing/materialization/Enter/caret visibility and 20k auto partial-DOM select-all/paste/undo passed. | expanded oracle and kept |
| huge-doc-perf-baseline | slate-ar-perf | complete | P2 | Perf starts only after correctness is green and metrics are honest. | Strict 5k aggregate baseline passed with click metrics: max budget ratio 0.99, zero budget/runtime failures. | kept |
| huge-doc-perf-packet | slate-ar-fast / slate-ar-perf | complete | P2 | Optimize one measured hot lane at a time. | No runtime optimization applied; benchmark-honesty packet added click latency and kept because strict 5k stayed green. Tight lane recorded for next owner. | kept benchmark packet |
| staged-full-dom-debt | slate-ar-perf / slate-plan | complete, deferred | P2 | Current weak spot is DOM budget and cold select in staged/full DOM. | Virtualized correctness is green; staged diagnostic has explicit click/long-task evidence; docs make staged/full explicit tradeoff/debug routes; older tuning packet rejected cheap constants. | route deeper architecture, no local runtime patch |
| slate-browser-promotion | slate-browser | complete | P1 | Promote repeated Playwright/browser tricks into helper/API. | `assertSlateBrowserSelectionContract` and `editor.assert.caretVisibleInScrollableParent()` added and verified. | kept |
| mobile-claim-width | slate-automation | complete, scoped | P2 | Do not confuse viewport proof with raw device proof. | `bun test:mobile-device-proof` passed scoped/proxy guard; `bun test:mobile-device-proof:raw` failed because required Appium/device artifact is missing. | raw device not claimed |
| api-dx-hard-cut | slate-plan / slate-patch | complete | P2 | Remove compat/aliases and align docs with clean current API. | Targeted grep found no new docs/API compat drift; release-discipline initially found stale docs/test escape-hatch rows, then passed after cleanup. | kept |
| external-ledger-readiness | issue-harvester | complete | P3 | Lexical/ProseMirror issue-by-issue closure waits until local oracles are strong. | Durable ledgers exist under `docs/editor-issue-harvester/**/full`; both have zero unchecked relevant rows. | no new ledger loop |
| workflow-self-repair | slate-automation | complete | P1 | Repair skills/templates/scripts when loop exits early, misses proof, or wastes time. | Patched `.agents/rules/slate-automation.mdc`, ran `pnpm install`, and audited generated `SKILL.md` mirror. | kept |
| consolidation | slate-automation | complete | P1 | Move accepted reusable decisions to durable docs/rules. | Reusable misses patched in `.agents/rules/slate-automation.mdc`, synced to generated skill, and benchmark target reports regenerated. | updated |
| final-handoff | slate-automation | finalizing | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Changed list, attention list, stopping checkpoints, command evidence, and residual risks are recorded in this plan. | updated |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | update/split/add/reprioritize | all prompt lanes | current user prompt + `slate-north-star` + `docs/slate-v2/agent-start.md` | template was too broad for "loop each until fully confident"; selection/oracle confidence must lead perf | checkpoint-zero complete; next status-and-current-evidence |
| 1 | update/reprioritize | selection-oracle-inventory, selection-multi-leaf-oracle, slate-browser-promotion, workflow-slowdown | source/test map + focused richtext proof | Existing richtext multi-leaf proof is strong, but helper coverage is partly route-local and discovery had one broad command miss. | multi-leaf richtext proof covered by existing tests; next run blank/pointer and helper-promotion proof |
| 2 | update/reprioritize | selection-pointer-oracle, selection-keyboard-oracle, slate-browser-promotion, workflow-slowdown | focused Chromium + Firefox/WebKit selection proof | Gesture coverage exists, but some cross-browser rows are intentionally skipped and repeated contract assertions needed helper promotion. | helper added; selection still scoped for cross-browser pointer/arrow claims |
| 3 | update/reprioritize | stable-richtext-plaintext, stable-markdown-history, stable-void-placeholder-hidden, benchmark-honesty-inventory | 22 focused Chromium example rows + 47 package history rows | Stable current editor behavior is green enough to advance to benchmark honesty; no runtime patch needed. | stable sweep complete; next checkpoint benchmark honesty inventory |
| 4 | update/reprioritize | benchmark-honesty-inventory, benchmark-honesty-repair, huge-doc-correctness-5k, workflow-slowdown | target/script audit + strict smoke benchmark | Aggregate metrics were already real in code, but target registry omitted strict budget and one browser-trace row still used a weak placeholder primary. | target repaired; strict smoke intentionally failed on real budget row; next correctness smoke |
| 5 | update/reprioritize | huge-doc-correctness-5k, huge-doc-correctness-20k, huge-doc-perf-baseline, slate-browser-promotion | new/expanded 5k/20k huge-doc oracle rows + focused reruns | Existing huge-doc proof had good nearby rows but missed exact 20k select-all/paste/undo and 5k combined undo/arrows/Enter/scroll. The first patch exposed a bad scroll-parent oracle. | huge correctness complete; next perf baseline; caret visibility helper promotion should be considered |
| 6 | update/reprioritize | huge-doc-perf-baseline, huge-doc-perf-packet, staged-full-dom-debt, benchmark-honesty-repair | strict 5k full benchmark before/after click-metric patch | The perf target was green but missing physical click latency, so the safe packet was benchmark-honesty repair, not runtime optimization. | strict 5k green with click metrics; staged/full-DOM debt becomes next because diagnostic click/DOM/long-task rows are weak |
| 7 | update/route | staged-full-dom-debt, slate-browser-promotion, needs-attention | staged diagnostic row + staged/full docs + prior 10000 tuning rejection packet | Staged/full-DOM is not a small local optimization problem in this loop. Docs already frame staged as explicit product tradeoff and full as debug, and previous cheap local levers were rejected. | staged debt deferred to slate-plan/slate-ar-perf; next safe patch is helper promotion for caret visibility |
| 8 | split/add | slate-browser-promotion, huge-doc-correctness-20k, workflow-self-repair | local caret helper used 13 times; ordered huge-doc proof exposed stale-server/native-selection race | Promotion found a real virtualized text-insert DOM selection repair race and a stale `PLAYWRIGHT_BASE_URL` proof lane. | helper promoted, runtime repair kept, managed 13-row proof green; add workflow repair note for stale dev-server use after source edits |
| 9 | close/scoped | mobile-claim-width | mobile proof script and artifact check | The machine has semantic/proxy guard proof, but no raw Appium/device artifact. | scoped proof complete; raw Android/iOS/mobile clipboard claims are blocked and not claimed |
| 10 | close/repair | api-dx-hard-cut | targeted compat/deprecation grep + `bun test:release-discipline` | Hard-cut guard found stale `editor.children` docs prose plus two direct primitive calls in a DOM package test; counts were stale after current-tree proof rows. | docs/test cleanup kept; release-discipline green 432/432 |
| 11 | close/no-op | external-ledger-readiness | durable Lexical and ProseMirror closure ledgers | Local oracle infra is now stronger; durable ledgers already show zero unchecked relevant rows, so starting another issue loop would be churn. | no ledger mutation; future work is issue-by-issue only when a specific ledger row is reopened |
| 12 | close/repair | workflow-self-repair | stale dev-server proof + ledger parser column miss | The loop trusted an existing `PLAYWRIGHT_BASE_URL` server after source edits and initially parsed a nonexistent ledger `status` column. Both are reusable automation misses. | source rule patched, `pnpm install` synced mirror, audit passed |
| 13 | reopen/repair/close | benchmark-honesty-repair, consolidation, final-handoff | autoreview findings + strict 5k benchmark + target report check | Review caught that the full target advertised DOM budgets without strict budget rows, generated benchmark reports were stale, and plan state still pointed at checkpoint zero. | DOM budgets added, reports regenerated/checked, plan state updated; final review gates next |
| 14 | reopen/repair/close | missing-oracle repair, benchmark-honesty-repair, target-report proof | nested + parent autoreview findings | Review caught that partial-DOM paste tests bypassed real clipboard/shortcut routing, model paint metrics included an extra unrelated frame, and generated reports claimed a pagination artifact whose payload did not match the target command. | paste helper now tries clipboard shortcut before fallback; model paint reuses the typed-update paint; exact pagination artifact regenerated; strict benchmark and report check passed |

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
| Prompt requirements captured before work | yes | This plan copies all 11 user lanes and the "do not rush / granular checkpoints" constraint. |
| `slate-automation` source rule read | yes | User supplied skill body; active rule requires slate-automation template and checkpoint-zero extraction. |
| `slate-north-star` read as checkpoint zero | yes | Read `/Users/zbeyens/git/plate-2/.agents/skills/slate-north-star/SKILL.md`. |
| `docs/slate-v2/agent-start.md` read | yes | Read `/Users/zbeyens/git/plate-2/docs/slate-v2/agent-start.md`. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created active goal for this plan. |
| Invocation mode and timebox recorded | yes | Full-loop mode, no explicit timebox, stop at real checkpoint only. |
| Dynamic checkpoint policy accepted | yes | Checkpoint-supervision row added; plan mutation ledger required every loop. |
| Source of truth and allowed workspaces recorded | yes | Boundaries name `.tmp/slate-v2`, parent docs, benchmark targets, and source-rule surfaces. |
| Output budget strategy recorded | yes | Broad scans must use artifacts/targeted `rg`; final handoff comes from plan ledgers. |
| Private-alpha release/PR boundary recorded | yes | No release/publish/PR/changeset unless explicitly asked. |
| Browser proof strategy recorded | yes | Use Playwright for replayable behavior and in-app Browser for visible smoke; selection needs native/DOM evidence. |
| Package/API proof strategy recorded | yes | Source greps, focused package tests/typechecks, docs/API examples. |
| Mobile/raw-device claim-width policy recorded | yes | Raw-device proof only from raw lane; viewport proof is scoped. |
| Skill repair authority and source-rule boundary recorded | yes | Patch `.agents/rules/**`, run `pnpm install`, mirror audit when reusable miss is proven. |

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
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | Focused Playwright, package tests/typechecks, release-discipline, mobile claim-width, strict benchmark, and benchmark target report checks are recorded below. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | 13 mutation rows show added, split, scoped, deferred, reopened, and repaired checkpoints. |
| Workspace authority proof | yes | Record cwd/tool for each Slate v2, parent-docs, skill, browser, package, or benchmark proof | Verification evidence distinguishes parent repo commands from `.tmp/slate-v2` runtime/package/browser commands. |
| Behavior gates | yes | Run focused stable behavior proof or record scoped defer rows | 22 focused Chromium stable browser rows and 47 `slate-history` package rows passed. |
| Visual/native selection proof | yes | Record Browser/Playwright/native-selection evidence or scoped blocker | Visual/native selection ledger records model, `window.getSelection()`, DOM endpoint, and caret-geometry proof; Firefox/WebKit breadth is scoped. |
| Missing oracle repair | yes | Add/verify/revert/quarantine oracle packets or record owner defer | Huge-document 5k/20k oracle rows and virtualized native-selection repair were added and verified; staged/full-DOM debt deferred with owner. |
| `slate-browser` promotion | yes | Add/verify helper/API or record queue/defer reason | `assertSlateBrowserSelectionContract` and `editor.assert.caretVisibleInScrollableParent()` added and typechecked. |
| Mobile/raw-device claim width | scoped | Run raw-device proof or record that only scoped viewport/browser proof is available | Scoped mobile guard passed; raw lane failed on missing required Appium/device artifact, so no raw mobile claim is made. |
| Huge-document correctness smoke | yes | Run focused huge-document behavior smoke or record owner defer | Managed Chromium 13-row huge-document proof passed for 5k/20k typing, Enter, paste, select-all, undo, navigation, and scroll stability. |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | `bun --filter slate-react typecheck`, `bun --filter slate-browser build/typecheck`, focused clipboard test, and `bun test:release-discipline` passed. |
| Skill/rule sync | yes | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | `.agents/rules/slate-automation.mdc` patched, `pnpm install` synced generated skill, mirror audit passed. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | Changed list, needs-your-attention, stopping checkpoints, and final handoff contract are filled below. |
| Final lint/check | yes | Run scoped lint/check or record why no code changed | `.tmp/slate-v2` `bun lint:fix`, `bun check`, benchmark script syntax, strict 5k benchmark, and parent target report check passed. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Slowdown table records broad command noise, stale dev-server proof, shell quoting, and the reusable rule repair. |
| Agent-native review for agent/tooling changes | yes | Load `agent-native-reviewer` and close accepted findings, or N/A | Agent-native review row records source-rule/mirror parity and no unpaired agent-only workflow. |
| Autoreview for non-trivial implementation changes | yes | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | Autoreview found three accepted findings; DOM budget rows, generated reports, and plan state were repaired and rechecked. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-05-slate-v2-full-confidence-automation-backlog.md` | To be run after final autoreview rerun; this row records the required command and owner. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | user prompt, north-star, agent-start, active goal | status and current evidence completed |
| Status and current evidence | complete | source/test/benchmark ownership recorded in packet and verification ledgers | selection oracle inventory completed |
| Selection oracle inventory | complete | model/native/DOM endpoint helpers mapped; repeated contract promoted | selection multi-leaf completed |
| Selection multi-leaf oracle | complete | Chromium richtext multi-leaf model/native/DOM proof passed | selection pointer oracle completed |
| Selection pointer oracle | complete, scoped | Chromium pointer rows passed; Firefox/WebKit breadth scoped to non-skipped rows | selection keyboard oracle completed |
| Selection keyboard oracle | complete, scoped | Chromium keyboard rows and Firefox/WebKit undo/scroll subset passed | stable behavior sweep completed |
| Stable behavior sweep | complete | 22 focused Chromium browser rows passed; 47 `slate-history` package rows passed | benchmark honesty |
| Benchmark honesty | complete | target JSON patched; strict smoke printed all requested METRIC families and exited nonzero on over-budget row | huge-document correctness |
| Huge-document correctness smoke | complete | 13 focused Chromium huge-doc rows passed after oracle expansion | huge-document perf |
| Huge-document perf | complete | strict 5k aggregate passed with click and DOM budget metrics, zero failures | staged/full-DOM debt |
| Staged/full-DOM debt | complete, deferred | staged diagnostic rows show DOM 20355, click-to-paint up to 257.7ms, long task 237ms; docs route staged/full as tradeoff/debug; previous local tuning was rejected | slate-browser promotion |
| slate-browser promotion | complete | selection contract helper and caret-visible helper promoted; `slate-browser` typecheck green; managed 13-row huge-doc proof green | mobile/API/external ledger/workflow |
| Mobile/API/external ledger/workflow packets | complete | mobile claim width complete; API/DX hard cut green; durable external ledgers have zero unchecked relevant rows | consolidation |
| Consolidation and review | complete | workflow self-repair synced; autoreview findings repaired; benchmark reports regenerated and checked | final handoff |
| Final handoff and goal-plan check | complete after final command | final handoff rows filled; `check-complete` is the last mechanical gate | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| selection | multi-leaf marks/links/inline boundaries | richtext desktop | drag selection, type, undo, follow-up type | model selection, native selected text, DOM endpoints, visible text | complete |
| selection | paragraph line wrapping and blank space | richtext/plaintext desktop | margin click, blank click, double click | model selection, native selection/caret rect, DOM endpoints, screenshot/geometry | complete, browser-scoped |
| selection | editor scroll window | huge document 5k/20k | select, scroll away/back, arrow nav, follow-up type | scroll anchor, model/native selection, visible text | complete |
| stable behavior | richtext/plaintext | desktop Chromium first, expand on failures | type, Enter, paste, select-all, undo/redo | visible text, model value, native selection, console errors | complete |
| stable behavior | markdown shortcuts/history | desktop Chromium first | shortcut transform, undo/redo, follow-up type | model value, history stack behavior, native selection | complete |
| stable behavior | editable voids/placeholders/hidden DOM | desktop Chromium first | click, arrows, Enter, delete, placeholder transitions | visible text, caret/selection, hidden/materialized DOM state | complete |
| huge document | 5k blocks | auto/virtualized/staged as available | typing, Enter, paste, select-all, undo, nav, scroll | type-to-paint, DOM budget, native selection, model value | complete for auto/virtualized; staged perf deferred |
| huge document | 20k blocks | virtualized smoke | center/end scroll, typing, selection, undo | materialization, DOM budget, model/native selection, no blank window | complete |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| P0-checkpoint-zero | 0 | slate-automation | A huge prompt will lose requirements unless every lane becomes a checkable row first. | Edited this plan; read `slate-north-star`, `docs/slate-v2/agent-start.md`, benchmark targets, memory registry. | No runtime proof yet. | keep | status-and-current-evidence |
| P1-richtext-multi-leaf-selection | 1 | slate-ar-stabilize / slate-browser | Existing richtext multi-leaf and right-margin rows should prove model + native + DOM endpoint behavior before new oracle work. | `bun --filter slate-browser build`; `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "mouse drag undo restores typed multi-leaf selected text replacement|places a right-margin click at the multi-leaf text end"` from `.tmp/slate-v2`. | 2 passed. Multi-leaf drag/undo asserts model selection, native selected text, and DOM endpoints; right-margin row asserts multi-leaf caret selection and DOM caret. | keep | blank-gap pointer, keyboard selection, and slate-browser helper promotion |
| P2-selection-pointer-keyboard-scroll | 2 | slate-ar-stabilize | Existing pointer/keyboard/scroll rows should prove the requested selection gesture classes before new runtime work. | Chromium: plaintext + huge-doc grep passed 6/6. Firefox/WebKit: non-skipped plaintext/richtext/huge-doc grep passed 13 and skipped 5. Richtext double-click native word row passed 1/1 Chromium. | Drag, blank-gap, margin click, double-click, arrows, undo/redo, scroll-away/refocus all covered at least in Chromium; Firefox/WebKit cover undo/scroll subset. | keep with scoped browser-width risk | stable behavior sweep and cross-browser skip decision |
| P3-slate-browser-selection-contract-helper | 2 | slate-browser | Repeated route-local assertions for model selection, native selected text, and DOM endpoints should be first-class helper API. | Edited `packages/slate-browser/src/playwright/index.ts`, `richtext.test.ts`, `plaintext.test.ts`; ran `bun --filter slate-browser build`, `bun --filter slate-browser typecheck`, focused Chromium helper-backed grep. | Helper-backed richtext/plaintext rows passed 2/2. | keep | consider geometry helper promotion after stable behavior proof |
| P4-stable-current-editor-sweep | 3 | slate-ar-stabilize | Stable current editor routes should be green before benchmark or perf claims. | `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright ... --project=chromium --grep "...stable rows..."`; `bun test ./packages/slate-history/test/history-contract.ts ./packages/slate-history/test/document-state-history-contract.ts`. | 22 Chromium browser rows passed; 47 package history rows passed. Covered richtext, plaintext, markdown shortcuts, editable voids, placeholder, hidden/dom coverage, document-state history, and core history contracts. | keep | benchmark honesty inventory |
| P5-benchmark-honesty-target-gate | 4 | slate-ar-perf / slate-automation | Benchmark target registry should fail over-budget huge-doc rows and should not advertise placeholder metrics. | Patched `benchmarks/targets/slate-v2.json`; `node -e "JSON.parse(...)"`; smoke strict command `HUGE_DOC_FULL_SMOKE=1 HUGE_DOC_FULL_STRICT_BUDGET=1 ... bun run bench:react:huge-document:full:local`. | JSON parse passed. Strict smoke printed cold/materialized selection, model typing, DOM, listener, selector, long-task, type-to-paint, burst metrics, then exited 1 with `budgetFailureCount=1` for `virtualizedModelBurstToPaintPerOpP95Ms=21.53` over budget 16. | keep target patch; perf backlog not runtime bug yet | huge-doc correctness smoke before perf |
| P6-huge-document-5k-20k-correctness | 5 | slate-ar-stabilize / slate-browser | Huge-doc correctness should be exact enough to catch 5k/20k behavior, not only nearby smaller rows. | Edited `playwright/integration/examples/huge-document.test.ts`; failed first focused run 1/3 due too-tight fake 20k DOM threshold and root-scroll-parent caret helper gap; reran edited rows passed 3/3; broad focused huge-doc smoke passed 13/13. | 5k virtualized typing, undo, arrows, Enter, scroll; 5k auto partial-DOM select-all/paste/undo; 20k partial-DOM select-all/paste/undo; 20k virtualized typing/materialization/Enter/caret visibility; drag/autoscroll/blank-gap/scroll-refocus rows all pass. | keep oracle patch | huge-doc perf baseline |
| P7-huge-document-click-metric-baseline | 6 | slate-ar-perf | Huge-doc perf prompt asked for click latency, but browser trace only had programmatic select-to-paint. | Edited `huge-document-browser-trace.mjs`, `huge-document-full.mjs`, and target metadata. Browser trace smoke printed click metrics. Strict aggregate smoke captured click metrics and failed only known smoke-noise model-burst row. Strict 5k aggregate rerun passed. | Strict 5k with click metrics: max ratio 0.99, failures 0, budget failures 0, type-to-paint 48.8ms, click-to-paint 25ms, click-to-selection-ready 13.9ms, model type-to-paint 74.1ms, DOM 950/303 virtualized, selector dispatch 8ms. | keep benchmark packet | staged/full-DOM debt |
| P8-staged-full-dom-debt-route | 7 | slate-plan / slate-ar-perf | Staged/full-DOM diagnostic rows are weak, but local constant tuning already failed in prior perf plan. | Read docs route for `domStrategy="staged"` / `"full"` and prior 10000 selection stress local-tuning rejection rows. Current strict 5k diagnostic staged content-visibility row: click-to-paint 257.9ms, click-ready 248.1ms, long task 240ms, DOM 20355. | No runtime patch. Virtualized correctness/perf stays the large-doc confidence route; staged/full-DOM remains explicit architecture debt with separate owner. | defer with owner, keep diagnostic visible | slate-browser caret helper promotion |
| P9-slate-browser-caret-helper-and-virtualized-repair | 8 | slate-browser / slate-react | The route-local caret-visible helper was used 13 times and the promoted helper must catch native selection loss, not just model selection. | Edited `packages/slate-browser/src/playwright/index.ts`, `playwright/integration/examples/huge-document.test.ts`, and `packages/slate-react/src/editable/dom-repair-queue.ts`; ran `bun --filter slate-react typecheck`, `bun --filter slate-browser build`, `bun --filter slate-browser typecheck`; focused and ordered huge-doc proof. | First ordered proof failed with `window.getSelection().rangeCount=0` after virtualized Enter/type at 20k. Runtime now keeps retrying `repair-caret-after-text-insert` for virtualized text hosts during the existing repair window. Managed ordered 13-row Chromium proof passed. | keep helper + runtime fix | mobile claim width |
| P10-mobile-claim-width | 9 | slate-automation / slate-browser | Raw-device proof must not be inferred from Playwright mobile viewport or semantic/proxy artifacts. | Read `scripts/proof/mobile-device-proof.mjs`; ran `bun test:mobile-device-proof` and `bun test:mobile-device-proof:raw`. | Scoped guard passed and explicitly rejected semantic/proxy rows as raw proof. Raw-required command failed because `/test-results/release-proof/mobile-device-proof.json` is missing. | keep claim scoped; no raw mobile claim | API/DX hard cut |
| P11-api-dx-hard-cut | 10 | slate-plan / slate-patch | Current-tree hard-cut guard should catch stale docs/API language and compat aliases before final handoff. | Targeted grep for compat/deprecation/migration language; edited `docs/concepts/13-roots.md`, `packages/slate-dom/test/clipboard-boundary.ts`, `packages/slate/test/escape-hatch-inventory-contract.ts`; ran focused clipboard test and `bun test:release-discipline`. | Fixed stale docs wording from `editor.children` to main-root wording, replaced direct `Editor.insertText/deleteForward` test calls with transaction API, and refreshed classified escape-hatch counts. Release-discipline passed 432/432. | keep | external ledger readiness |
| P12-external-ledger-readiness | 11 | issue-harvester / slate-automation | External Lexical/ProseMirror checkmarks should not start before local oracle infra; after oracle repair, verify durable ledger state. | Parsed `docs/editor-issue-harvester/lexical/full/issue-closure-ledger.tsv` and `docs/editor-issue-harvester/prosemirror/full/issue-closure-ledger.tsv`; checked markdown summaries. | Lexical: 2741/2741 checked, 1779 relevant, 0 unchecked relevant. ProseMirror: 1420/1420 checked, 848 relevant, 0 unchecked relevant. | no new loop | workflow self-repair |
| P13-workflow-self-repair | 12 | slate-automation | Reusable loop slowdowns must update the supervisor rule, not remain plan trivia. | Edited `.agents/rules/slate-automation.mdc`; ran `pnpm install`; audited `.agents/skills/slate-automation/SKILL.md` for mirrored text. | Added rules to parse issue ledger `check` column and to avoid stale `PLAYWRIGHT_BASE_URL` proof after package/runtime/example/source edits unless server freshness is proven. | keep | review gates |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| richtext multi-leaf selection | `playwright/integration/examples/richtext.test.ts` | grep `mouse drag undo restores typed multi-leaf selected text replacement|places a right-margin click at the multi-leaf text end` | Chromium | passed 2/2 | Still need pointer/blank, keyboard/scroll, and helper-promotion rows. |
| pointer/keyboard/scroll selection | plaintext, richtext, huge-document examples | focused grep for Shift+Arrow, undo, drag replacement, blank-gap drag, double-click, scroll-away/refocus | Chromium | passed 14/14 total across packets | Browser-width scoped: some Firefox/WebKit arrow/pointer rows skip intentionally. |
| keyboard/scroll browser-width subset | plaintext, richtext, huge-document examples | Firefox/WebKit focused grep for non-skipped undo/scroll rows | Firefox + WebKit | 13 passed, 5 skipped | Skips need claim-width row before selection is final. |
| richtext/plaintext stable behavior | richtext/plaintext examples | focused stable sweep grep | Chromium | passed inside 22/22 | complete for current desktop browser scope |
| markdown/history stable behavior | markdown-shortcuts example + `slate-history` package | focused stable sweep grep; package history tests | Chromium + Bun package tests | passed browser rows and 47/47 package rows | complete for current desktop/package scope |
| editable voids/placeholders/hidden DOM | editable-voids, placeholder, hidden-content-blocks, dom-coverage-boundaries, document-state examples | focused stable sweep grep | Chromium | passed inside 22/22 | complete for current desktop browser scope |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| Richtext multi-leaf drag selection, type, undo | `editor.assert.selection(selection)` after undo | `editor.get.selectedText()` equals `editable rich text` | `editor.assert.domSelection({ anchorNodeText: "This is editable ", focusNodeText: " text, " })` | Playwright Chromium proof | pass |
| Richtext right-margin click at multi-leaf end | model selection `[0,6] offset 1` | collapsed native selection via DOM caret | `editor.assert.domCaret({ text: "!", offset: 1 })` | Playwright Chromium proof | pass |
| Plaintext Shift+Arrow cross-block/backward | model selection assertions where stable | native selected text contains expected text and excludes FEFF | DOM endpoint assertion for backward row | Playwright Chromium proof | pass |
| Huge-document blank-gap drag | model focus path and selected block index samples | native text nonempty and does not include heading | geometry sample attachment | Playwright Chromium proof | pass |
| Richtext native double-click word selection | model selected word range | `assertWindowSelectionText` and selected text equal `text` | scenario selection row | Playwright Chromium proof | pass |
| Scroll-away/refocus selection stability | model caret path/offset after scroll/refocus | native caret visible through browser selection | caret visible in scroll container | Chromium, Firefox, WebKit subset | pass |

slate-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| DOM endpoint + native selected text + model selection proof after selection/undo | richtext, plaintext, code-highlighting, styling, inlines | `assertSlateBrowserSelectionContract(editor, expected)` | `bun --filter slate-browser build`; `bun --filter slate-browser typecheck`; focused richtext/plaintext grep | kept |
| Visual caret at text end/right margin geometry | richtext local helpers | Promote caret/end geometry helper into `slate-browser/playwright` if reused in next pointer packet. | focused richtext right-margin row after helper move | queued |
| Caret visible inside the active editor scroll owner | huge-document example, 13 call sites | `editor.assert.caretVisibleInScrollableParent()` plus exported diagnostic helper | `bun --filter slate-browser build`; `bun --filter slate-browser typecheck`; managed 13-row huge-doc Chromium proof | kept |

Benchmark honesty ledger:
| Target / script | Honesty requirement | Evidence | Decision |
|-----------------|--------------------|----------|----------|
| `react-huge-document-full` target | Strict budgets must be active in the target command. | Target command now includes `HUGE_DOC_FULL_STRICT_BUDGET=1`; script exits nonzero when strict budget rows fail. | kept |
| `huge-document-full.mjs` budget table | Must include type-to-paint, burst, cold select, materialized select, model-backed typing, DOM, long task, listener, selector, and overlay budgets. | Autoreview caught DOM metrics without strict DOM budget rows; added `browserTraceDomNodesP95` and `virtualizedDomNodesP95` budget rows. | kept benchmark-honesty patch |
| `react-huge-document-browser-trace` target | Primary metric cannot be placeholder seconds when script prints real METRIC lines. | Target primary changed to `react_huge_doc_type_to_paint_p95_ms`, `printsMetric=true`, and guardrail text names cold/materialized/model/DOM/listener/selector metrics. | kept |
| Strict smoke verification | Gate should fail on over-budget rows. | 20-block smoke exited 1 with `react_huge_doc_full_budget_failure_count=1`, budget failure `virtualizedModelBurstToPaintPerOpP95Ms=21.53` over 16. | accepted as honesty proof and perf backlog |
| Click latency metric | Physical click latency needs its own metric, not programmatic select-to-paint. | Browser trace now prints `react_huge_doc_click_to_paint_p95_ms` and `react_huge_doc_click_to_selection_ready_p95_ms`; full target budgets both. | kept |
| Generated target reports | Target registry changes must keep generated reports current. | Ran `pnpm bench:targets:report`; `pnpm bench:targets:report:check` passed after benchmark artifacts stopped changing. | kept generated reports |

Huge-document perf ledger:
| Run / packet | Command | Result | Tight lanes / hot rows | Decision |
|--------------|---------|--------|------------------------|----------|
| Pre-click strict 5k baseline | `HUGE_DOC_FULL_STRICT_BUDGET=1 HUGE_DOC_FULL_BLOCKS=5000 HUGE_DOC_FULL_ITERATIONS=5 HUGE_DOC_FULL_TRACE_ITERATIONS=5 HUGE_DOC_FULL_TYPE_OPS=10 bun run bench:react:huge-document:full:local` | pass: max ratio 0.98, failures 0, budget failures 0 | virtualized model type-to-paint 73.8/75ms, DOM 950, virtualized DOM 303 | superseded by click-metric baseline |
| Click-metric browser-trace smoke | `SLATE_BROWSER_TRACE_BLOCKS=20 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=3 SLATE_BROWSER_TRACE_SURFACES=defaultAuto,virtualized bun run bench:react:huge-document:browser-trace:local` | pass | click-to-paint 14ms, click-to-selection-ready 4.7ms on smoke | keep |
| Click-metric strict 5k baseline | `HUGE_DOC_FULL_STRICT_BUDGET=1 HUGE_DOC_FULL_BLOCKS=5000 HUGE_DOC_FULL_ITERATIONS=5 HUGE_DOC_FULL_TRACE_ITERATIONS=5 HUGE_DOC_FULL_TYPE_OPS=10 bun run bench:react:huge-document:full:local` | pass: max ratio 0.99, failures 0, budget failures 0 | virtualized model type-to-paint 74.1/75ms, model ready 40.7/50ms, partial-DOM promotion+type 74.16/100ms, click-to-paint 25/100ms, selector dispatch 8/16ms | keep benchmark packet; no runtime optimization yet |
| Staged diagnostic rows from same baseline | full benchmark staged diagnostic child trace | diagnostic only, not promotion | staged content-visibility click-to-paint 257.9ms, click-ready 248.1ms, long task 240ms, DOM 20355 | deferred to `slate-plan` / `slate-ar-perf`; no local constant tweak |
| Staged/full-DOM owner route | docs and prior perf plan | route decision | `Editable` docs: staged is eventual native DOM coverage, full is debug; prior 10000 stress plan rejected group-size and immediate background-mount local tuning | keep diagnostics visible, fix only in separate architecture packet |
| Post-runtime-repair strict 5k baseline | same strict command after virtualized text-host repair | pass: max ratio 0.99, failures 0, budget failures 0 | virtualized model type-to-paint 73.9/75ms, type-to-paint 50ms, click-to-paint 30.7ms, DOM 950/303 virtualized, selector dispatch 7.6ms | keep runtime repair; no perf regression beyond budget |
| Post-autoreview DOM-budget strict 5k baseline | same strict command after strict DOM budget rows | pass: max ratio 0.98, failures 0, budget failures 0 | browser DOM 950/1200, virtualized DOM 303/400, click-to-paint 23.3ms, virtualized model type-to-paint 73.6/75ms, selector dispatch 7.5ms | superseded by model-paint repair baseline |
| Post-model-paint repair strict 5k baseline | same strict command after model paint no longer waits an extra unrelated frame | pass: max ratio 0.84, failures 0, budget failures 0 | browser DOM 950/1200, virtualized DOM 303/400, click-to-paint 30.7ms, virtualized model type-to-paint 56.3/75ms, model ready 41.9/50ms, selector dispatch 7.2ms | keep model metric repair |
| Latest staged diagnostic rows | full benchmark staged diagnostic child trace | diagnostic only, not promotion | staged content-visibility click-to-paint 257.7ms, click-ready 245.7ms, long task 237ms, DOM 20355 | defer to `slate-plan` / `slate-ar-perf`; do not hide in aggregate |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| semantic/proxy proof cannot satisfy raw IME/clipboard | scripted release-proof guard | `bun test:mobile-device-proof` | pass | scoped guard only |
| raw Android/iOS device text input, IME, clipboard | required external Appium/device artifact | `bun test:mobile-device-proof:raw` | fail: missing `test-results/release-proof/mobile-device-proof.json` | blocked, not claimed |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| auto partial-DOM 5k | select-all, paste, undo | bounded DOM/placeholders, full model selection, replacement text, undo boundary restore | focused huge-doc smoke grep | pass |
| auto partial-DOM 20k | select-all, paste, undo | bounded DOM/placeholders, full model selection, first/middle/last model restore, undo selection | focused huge-doc smoke grep | pass |
| virtualized 5k | typing, undo, arrows, Enter, scroll | model text, native caret visibility, selection offsets, split blocks | focused huge-doc smoke grep | pass |
| virtualized 20k | typing, materialization, Enter, scroll | model text, split block text, native endpoint visible in root scroll container | focused huge-doc smoke grep | pass |
| virtualized scroll/selection | backward scroll, drag autoscroll, blank-gap drag, scroll-away/refocus | scroll stability, model/native selection samples, no start regression, caret visible after refocus | focused huge-doc smoke grep | pass |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| broad package script discovery with `find ... xargs ... node` | slate-automation command shape | seconds, failed before useful output | command line too long because it tried every package in one shell assembly | no durable evidence | repaired in-loop by targeted package script reads; no skill patch yet unless repeated |
| repeated Playwright webServer rebuilds | Playwright command shape | about 8-11s per early focused packet | commands omitted `PLAYWRIGHT_BASE_URL`, so Playwright rebuilt/served Next every run | behavior proof still produced | repaired in-loop by using existing dev server at `http://localhost:3100`; no skill patch because existing skill already documents this |
| attempted `bun serve` / `next dev -p 3102` | local dev server setup | seconds | `3100` was already occupied by the correct `.tmp/slate-v2/site` server; Next blocks another dev server for same dir | found live server PID 57403 | use existing server with `PLAYWRIGHT_BASE_URL=http://localhost:3100` |
| overly broad benchmark `rg` | slate-automation command shape | seconds, noisy output | searched too many script/docs surfaces and streamed low-signal output | enough evidence to narrow, but poor operator ergonomics | repaired in-loop with targeted huge-document script/target reads; consider skill command-shape note if repeated |
| first huge-doc oracle patch | slate-automation edit discipline | one failed focused run | patch overmatched helper context, then the new oracle used a fake `<2500` 20k DOM threshold and missed root scroll container/collapsed-range fallback | failures were useful: caught test quality gaps before runtime blame | repaired in-loop; consider promoting robust caret visibility helper to `slate-browser` |
| reused `PLAYWRIGHT_BASE_URL=http://localhost:3100` after package/runtime edits | slate-automation command freshness | two failed ordered runs | existing dev server did not prove fresh package/runtime source after source edits; managed Playwright build served the current tree and passed | stale failures produced useful diagnostic, but proof lane was misleading | repair workflow docs/skill: after package/runtime source edits, use managed Playwright build or restart the dev server before final browser proof |
| initial generated mirror audit command used double-quoted backtick pattern | slate-automation command shape | one noisy command | shell executed backtick fragments while running `rg`; safe single-quoted rerun passed | mirror proof still valid after rerun | use single quotes around grep patterns containing backticks |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| parent plan/targets | `docs/plans/2026-06-05-slate-v2-full-confidence-automation-backlog.md`; `benchmarks/targets/slate-v2.json` strict huge-doc target and browser-trace metric metadata; generated `benchmarks/targets/history/slate-v2-latest.json`; generated `benchmarks/targets/reports/slate-v2.md`. |
| parent skill/workflow | `.agents/rules/slate-automation.mdc`; generated mirror `.agents/skills/slate-automation/SKILL.md` after `pnpm install`. |
| Slate v2 runtime/API | `.tmp/slate-v2/packages/slate-react/src/editable/dom-repair-queue.ts`; `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`. |
| Slate v2 tests/oracles | `.tmp/slate-v2/playwright/integration/examples/huge-document.test.ts`; `.tmp/slate-v2/playwright/integration/examples/plaintext.test.ts`; `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts`; `.tmp/slate-v2/packages/slate-dom/test/clipboard-boundary.ts`; `.tmp/slate-v2/packages/slate/test/escape-hatch-inventory-contract.ts`. |
| Slate v2 docs/API cleanup | `.tmp/slate-v2/docs/concepts/13-roots.md`. |
| Slate v2 benchmarks | `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`; `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-full.mjs`. |
| Slate v2 benchmark artifacts | `.tmp/slate-v2/tmp/slate-pagination-virtualized-real-editor-ops-benchmark.json` refreshed to match the current target command; huge-document benchmark artifacts refreshed by strict full reruns. |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Raw mobile/device proof is still absent | Scoped/proxy guard passed, but raw Appium/device artifact is missing. No raw Android/iOS IME or clipboard claim is valid from this run. | Mobile/raw-device claim-width ledger | Run `bun test:mobile-device-proof:raw` only on a real device lane that can produce `test-results/release-proof/mobile-device-proof.json`. |
| 2 | Staged/full-DOM remains the bad huge-doc lane | Latest diagnostic hit 20355 DOM nodes, 257.7ms click-to-paint, and 237ms long task. Virtualized is green; staged/full needs architecture work, not a constant tweak. | Huge-document perf ledger | Route a separate `slate-plan` / `slate-ar-perf` packet for staged/full-DOM architecture after virtualized correctness stays green. |
| 3 | Selection proof is browser-scoped | Chromium has full pointer/keyboard/scroll coverage; Firefox/WebKit only cover non-skipped undo/scroll rows. | Visual/native selection ledger | Do not claim full cross-browser native pointer/arrow parity until those skipped rows have an owner and browser-specific oracle. |
| 4 | Benchmark target reports only prove artifact existence | Autoreview caught a pagination target report marked OK while the artifact payload did not match the current command. | Benchmark honesty ledger | When a target command changes, run that exact target before regenerating/checking the report. |
| 5 | Existing dev servers can lie after package/runtime edits | Stale `PLAYWRIGHT_BASE_URL=http://localhost:3100` failed ordered proof while managed Playwright current-tree proof passed. | Workflow slowdowns | Restart/prove server freshness or omit `PLAYWRIGHT_BASE_URL` for final browser proof after source edits. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| SC-raw-mobile | hard boundary | Can this machine provide real Appium/device artifacts? | Raw mobile behavior cannot be inferred from desktop or Playwright viewport proof. | Raw Android/iOS IME and clipboard claims. | Desktop/browser/oracle/perf work. | Leave blocked until a real device lane exists. | Mobile/raw-device claim-width ledger |
| SC-staged-full-dom | architecture defer | Should staged/full-DOM become a first-class architecture packet now? | Current staged/full diagnostic is visibly bad and should not be hidden behind virtualized green. | Staged/full-DOM optimization. | Virtualized correctness/perf confidence. | Route to `slate-plan` / `slate-ar-perf`, not this cleanup loop. | Huge-document perf ledger |
| SC-cross-browser-selection | scoped claim | Do we want full Firefox/WebKit native pointer/arrow parity in the next loop? | Current proof is honest but browser-scoped. | Full cross-browser native selection parity. | Chromium stable selection and huge-doc proof. | Open a browser-width oracle packet if cross-browser parity matters now. | Visual/native selection ledger |
| SC-release-readiness | private alpha boundary | Should this become release/PR readiness? | Slate v2 is continuous private alpha by default; release/PR gates were explicitly out of scope. | Release/publish/PR/change readiness. | Runtime/test/benchmark confidence work. | Do not run ship/release unless explicitly requested. | Constraints |
| SC-target-artifacts | proof-hygiene | Did the artifact payload come from the exact target command? | The report generator only checks existence; stale-but-present artifacts can look OK. | Trusting generated report status for changed benchmark commands. | Other runtime/test work. | Run exact target command before report regeneration when command/cohort/iteration changes. | Benchmark honesty ledger |

Findings:
- Checkpoint-zero complete: the run is full-loop, no timebox, and selection/oracle confidence gates lead behavior, benchmark honesty, and perf.
- Existing richtext coverage already has a strong multi-leaf row: model selection, native selected text, DOM endpoint snapshot, typing replacement, undo, and reselected text all pass.
- Existing right-margin multi-leaf click row passes in Chromium and asserts model selection plus DOM caret.
- Repeated endpoint/native selection assertions are present in route specs; promote the repeated pattern into `slate-browser` after the next pointer packet confirms the reusable shape.
- `assertSlateBrowserSelectionContract` is now promoted into `slate-browser/playwright` and verified by existing richtext/plaintext rows.
- Cross-browser selection claim is not fully broad: Firefox/WebKit pass undo/scroll subsets, but some native arrow/pointer rows are intentionally Chromium-only or skipped due native behavior differences.
- Stable current editor behavior is green for focused Chromium browser proof across richtext, plaintext, markdown shortcuts, editable voids, placeholder, hidden/dom coverage, DOM coverage boundaries, and document-state routes.
- Package history contracts are green: 47 tests across core history and document-state history.
- Benchmark honesty gap found and repaired: the aggregate full target now runs strict budgets, and browser trace target metadata names real METRIC output instead of placeholder seconds.
- Strict smoke proves the gate fails on real over-budget rows. The current smoke over-budget row is `virtualizedModelBurstToPaintPerOpP95Ms`, which belongs to huge-doc perf after correctness proof, not before.
- Huge-document correctness is green after strengthening the oracle: 13 focused Chromium rows cover 5k and 20k typing, Enter, paste, select-all, undo, arrows/navigation, drag/autoscroll, blank-gap selection, materialization, and scroll/refocus stability.
- The caret-visible helper needed a root-scroll-container and text-host fallback; the first failing run was a test-quality catch, not a runtime regression.
- Huge-document strict 5k perf is green with click metrics and strict DOM budget rows after the runtime repair: latest max budget ratio 0.84, no failures, click-to-paint 30.7ms, type-to-paint 48ms, model type-to-paint 56.3ms, browser DOM 950/1200 and virtualized DOM 303/400.
- Staged/full-DOM diagnostic remains the bad lane: latest staged content-visibility click-to-paint 257.7ms, click-ready 245.7ms, long task 237ms, DOM 20355. That is architecture debt, not hidden aggregate green.
- Do not patch staged/full-DOM with another local constant tweak in this loop: docs frame staged as explicit whole-document native-DOM tradeoff and full as debug, and the previous 10000 stress plan already rejected group-size and background-mount tuning.
- `slate-browser` helper promotion exposed a real native-selection oracle: in stale-server ordered proof, the model selection after virtualized 20k Enter/type was correct but native `window.getSelection().rangeCount` was `0`.
- Managed Playwright build proves the kept fix: ordered 13-row huge-document Chromium proof is green after virtualized text-host repair keeps retrying during the short repair window.
- Mobile/raw-device scope is honest: scoped guard proof passes, raw-required proof fails without Appium/device artifacts, so this run makes no raw Android/iOS claim.
- API/DX hard-cut guard is green after cleanup: stale `editor.children` docs wording is gone, the DOM clipboard test uses transaction APIs, and release-discipline passes including compat-alias hard-cut.
- External ledger readiness is green without starting a new checkmark grind: durable Lexical and ProseMirror ledgers are fully checked with zero unchecked relevant rows.
- Workflow self-repair is applied: future `slate-automation` runs must avoid stale `PLAYWRIGHT_BASE_URL` proof after source edits and must parse issue ledger `check` columns.
- Autoreview found three real cleanup issues and they were repaired: strict DOM budget rows now exist, benchmark target reports were regenerated and checked, and this plan no longer resumes from checkpoint zero.
- Second autoreview pass found two misleading proof surfaces and one generated-report artifact mismatch; all were repaired and verified with focused paste rows, exact pagination target artifact regeneration, strict 5k benchmark, and report check.

Decisions and tradeoffs:
- Do not start huge-document perf until selection/stable behavior proof and benchmark honesty are strong enough to trust the metrics.
- External Lexical/ProseMirror issue-ledger closure is deliberately behind local oracle infra; shallow checkmarks are not completion.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm bench:targets:report:check` failed while the strict benchmark was still writing artifacts | 1 | Wait for benchmark process to stop, regenerate reports, then check stable output | `pnpm bench:targets:report` followed by `pnpm bench:targets:report:check` passed |

Verification evidence:
- Read `/Users/zbeyens/git/plate-2/.agents/skills/slate-north-star/SKILL.md`.
- Read `/Users/zbeyens/git/plate-2/docs/slate-v2/agent-start.md`.
- Read `/Users/zbeyens/git/plate-2/benchmarks/targets/slate-v2.json`.
- Created active goal with objective tied to this plan.
- `.tmp/slate-v2`: `bun --filter slate-browser build` passed.
- `.tmp/slate-v2`: focused Chromium richtext multi-leaf/right-margin Playwright proof passed 2/2.
- `.tmp/slate-v2`: focused Chromium plaintext/huge-doc pointer-keyboard proof passed 6/6.
- `.tmp/slate-v2`: focused richtext native double-click proof passed 1/1.
- `.tmp/slate-v2`: focused Firefox/WebKit selection undo/scroll subset passed 13, skipped 5.
- `.tmp/slate-v2`: `bun --filter slate-browser typecheck` passed after helper promotion.
- `.tmp/slate-v2`: helper-backed richtext/plaintext selection rows passed 2/2.
- `.tmp/slate-v2`: focused Chromium stable behavior sweep passed 22/22.
- `.tmp/slate-v2`: `bun test ./packages/slate-history/test/history-contract.ts ./packages/slate-history/test/document-state-history-contract.ts` passed 47/47.
- Parent repo: `node -e "JSON.parse(require('fs').readFileSync('benchmarks/targets/slate-v2.json','utf8'))"` passed.
- `.tmp/slate-v2`: strict huge-doc full smoke printed requested METRIC families and exited 1 with one budget failure, proving budget enforcement.
- `.tmp/slate-v2`: edited huge-doc oracle rows first failed 1/3 before helper/threshold repair, then passed 3/3.
- `.tmp/slate-v2`: focused huge-document correctness smoke passed 13/13 after oracle expansion.
- `.tmp/slate-v2`: browser-trace smoke with click metrics passed and printed `react_huge_doc_click_to_paint_p95_ms`.
- `.tmp/slate-v2`: strict 5k huge-document full benchmark with click metrics passed with zero failures and zero budget failures.
- `.tmp/slate-v2`: `bun --filter slate-react typecheck` passed after virtualized repair patch.
- `.tmp/slate-v2`: `bun --filter slate-browser build` and `bun --filter slate-browser typecheck` passed after caret helper promotion.
- `.tmp/slate-v2`: ordered 13-row huge-document Chromium proof failed twice through stale `PLAYWRIGHT_BASE_URL=http://localhost:3100`, then passed through managed Playwright build after current-tree rebuild.
- `.tmp/slate-v2`: post-runtime-repair strict 5k huge-document full benchmark passed with zero failures and zero budget failures.
- `.tmp/slate-v2`: `bun test:mobile-device-proof` passed scoped/proxy guard.
- `.tmp/slate-v2`: `bun test:mobile-device-proof:raw` failed as expected because the raw Appium/device artifact is missing.
- `.tmp/slate-v2`: focused clipboard boundary follow-up editing test passed.
- `.tmp/slate-v2`: `bun test:release-discipline` passed 432/432 after API/DX cleanup.
- Parent docs: parsed durable Lexical/ProseMirror closure ledgers; both have zero unchecked relevant rows.
- Parent skill source: `pnpm install` synced `.agents/rules/slate-automation.mdc` into `.agents/skills/slate-automation/SKILL.md`; mirror audit found both new rules.
- Parent autoreview: local autoreview found three accepted findings: missing strict DOM budget enforcement, stale generated benchmark reports, and stale checkpoint-zero plan state.
- `.tmp/slate-v2`: `node --check scripts/benchmarks/browser/react/huge-document-full.mjs` passed after adding strict DOM budget rows.
- `.tmp/slate-v2`: post-autoreview strict 5k huge-document full benchmark passed with `react_huge_doc_full_max_budget_ratio=0.98`, zero failures, zero budget failures, browser DOM 950/1200, and virtualized DOM 303/400.
- Parent repo: `pnpm bench:targets:report` regenerated `benchmarks/targets/history/slate-v2-latest.json` and `benchmarks/targets/reports/slate-v2.md`.
- Parent repo: `pnpm bench:targets:report:check` passed after benchmark artifacts stopped changing.
- `.tmp/slate-v2`: focused huge-document paste proof passed 3/3 after `pasteText` stopped bypassing clipboard/shortcut routing for partial-DOM selections.
- `.tmp/slate-v2`: exact pagination target command passed and refreshed `tmp/slate-pagination-virtualized-real-editor-ops-benchmark.json` for `current,rows800` with 5 iterations.
- `.tmp/slate-v2`: latest strict 5k huge-document full benchmark passed with `react_huge_doc_full_max_budget_ratio=0.84`, zero failures, zero budget failures, browser DOM 950/1200, virtualized DOM 303/400, and model type-to-paint 56.3ms.
- `.tmp/slate-v2`: `bun lint:fix` passed after final helper/benchmark edits with no fixes.
- `.tmp/slate-v2`: `bun test:release-discipline` passed 432/432 after final helper/benchmark edits.
- `.tmp/slate-v2`: `bun check` passed after final helper/benchmark edits: lint, packages/site/root typecheck, Bun tests 1180 pass/95 skip, slate-layout 47 pass, slate-react Vitest 57 files/662 tests.
- Parent repo: final `pnpm bench:targets:report:check` passed after exact target artifact and strict huge-document artifacts were stable.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-05-slate-v2-full-confidence-automation-backlog.md`
- Surface and route/package: `.tmp/slate-v2` Slate v2 editor behavior,
  `slate-react`, `slate-browser`, example Playwright routes, benchmark scripts,
  benchmark target registry, parent automation rule/mirror, and durable plan.
- Invocation mode, elapsed/timebox, loop/checkpoint count: full-loop, no
  timebox; 14 mutation loops recorded.
- Behavior gates and visual proof: stable behavior sweep green; selection proof
  records model selection, native `window.getSelection()`, DOM endpoints, and
  caret visibility; Firefox/WebKit selection breadth is scoped.
- Primary metric baseline/latest/best and stop reason: latest strict 5k
  huge-document full run passed with max budget ratio 0.84, zero failures,
  browser DOM 950/1200, virtualized DOM 303/400, click-to-paint 30.7ms, and
  virtualized model type-to-paint 56.3/75ms. Stop reason is review/check-complete
  closure, not perf exhaustion.
- Bugs fixed and oracles added: virtualized native-selection repair, 5k/20k
  huge-document correctness oracles, `slate-browser` selection/caret helpers,
  API/DX test cleanup.
- Benchmark/skill/docs repairs: strict full target, click latency, strict DOM
  budgets, model paint metric honesty, exact benchmark target artifact proof,
  generated benchmark reports, stale docs wording, and
  `slate-automation` stale-server/ledger-parser rules.
- Workflow slowdowns and repairs: broad command noise, stale dev-server proof,
  generated report/artifact race, and shell quoting mistakes are logged; reusable
  misses patched where repeated/proven.
- Changed list: see Changed list table above.
- Needs your attention: see Needs your attention table above.
- Stopping checkpoints to unblock: see Stopping checkpoints table above.
- Accepted deferrals and residual risks: raw mobile lane missing, staged/full-DOM
  architecture debt, browser-width selection scope, benchmark artifact exactness,
  private-alpha release boundary.
- Next owner: if continuing, start with staged/full-DOM architecture/perf or
  cross-browser native selection parity; do not start external issue ledgers
  unless a specific row is reopened.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Review gates and final handoff checkpoint |
| Where am I going? | Rerun autoreview/check-complete, close the active goal if clean, then hand off. |
| What is the goal? | Run every listed Slate v2 confidence lane slowly until fully proven, deferred with owner, or blocked. |
| What have I learned? | Behavior/oracle lanes are green or scoped; benchmark honesty needed real DOM budget rows; staged/full-DOM is architecture debt; raw mobile proof is unavailable. |
| What have I done? | Added selection/caret helpers, huge-doc oracles, virtualized native-selection repair, benchmark click/DOM budgets, API/DX cleanup, generated report refresh, and automation workflow repair. |
| What changed in the checkpoint plan? | See Checkpoint mutation ledger |

Timeline:
- 2026-06-05T06:16:49.369Z Goal plan created.
- 2026-06-05T06:16Z Checkpoint-zero filled with ordered prompt requirements, proof surfaces, stop rules, and granular lanes.
- 2026-06-05T06:24Z Richtext multi-leaf drag/undo and right-margin caret proof passed in Chromium.
- 2026-06-05T06:32Z Pointer/keyboard/scroll selection proof passed in Chromium; Firefox/WebKit undo/scroll subset passed.
- 2026-06-05T06:38Z Promoted repeated selection proof into `assertSlateBrowserSelectionContract` and reran helper-backed rows.
- 2026-06-05T06:46Z Stable current editor browser sweep passed 22/22; package history contracts passed 47/47.
- 2026-06-05T07:02Z Benchmark target honesty patched; strict smoke failed on an actual virtualized model burst budget row.
- 2026-06-05T07:22Z Huge-document 5k/20k correctness oracle expanded and passed 13/13 focused Chromium rows.
- 2026-06-05T07:55Z Huge-document click latency metrics added; strict 5k aggregate passed with max budget ratio 0.99.

Open risks:
- Raw mobile/device lane is blocked by missing Appium/device artifact; no raw Android/iOS claim.
- Selection browser-width is scoped: Chromium has the full requested gesture set; Firefox/WebKit have non-skipped undo/scroll subset, while some arrow/pointer native rows remain browser-scoped.
- Staged/full-DOM diagnostic is explicitly bad: latest content-visibility row hit DOM 20355, click-to-paint 257.7ms, and long task 237ms.
- Benchmark target reports are existence-based; exact command/cohort/iteration proof must be regenerated when target commands change.
- Existing dev servers can serve stale package/runtime code after edits; final proof should restart/prove freshness or use managed Playwright.
