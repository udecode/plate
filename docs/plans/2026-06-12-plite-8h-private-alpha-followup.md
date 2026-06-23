# plite-8h-private-alpha-followup

Objective:
Automate Plite private-alpha followup; done when 8h timed supervisor run has
closed/queued packets and plan gates pass.

Goal plan:
docs/plans/2026-06-12-plite-8h-private-alpha-followup.md

Template:
docs/plans/templates/slate-automation.md

Primary template:
docs/plans/templates/slate-automation.md

Applied packs:
- none

Automation source:
- type: user-invoked `plite-automation`
- prompt / link: `[$slate-automation] 8h`
- surface / route / package: broad Plite private-alpha supervision; pick the
  highest-value owner from current evidence, not a user-routed narrow surface.
- invocation mode: timed mode
- minimum runtime / deadline: start 2026-06-12 02:33:00 CEST; target minimum
  runtime 8h; do not hand off before 2026-06-12 10:33:00 CEST unless the user
  interrupts or a hard blocker leaves no autonomous work.
- completion threshold summary: after the 8h minimum, the active packet has a
  keep/revert/quarantine decision; required plan gates are evidence-backed or
  explicitly N/A/deferred; final handoff includes changed list, workflow
  slowdowns, needs-your-attention, stopping checkpoints, commands, residual
  risks, and next owner.

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
- Minimum 8h active Plite automation runtime is elapsed, then the active packet
  is verified, reverted, or quarantined.
- The run has entered supervision mode instead of stopping early if obvious
  backlog dries up before the minimum runtime.
- Behavior, visual/native selection, huge-document, package/API, benchmark,
  docs/skill repair, workflow-slowdown, changed-list, review-attention, and
  stopping-checkpoint gates are either proven for packets touched this run,
  scoped N/A, or deferred with owner and reason.
- No dirty speculative runtime packet remains active at handoff.
- Closure is legal only when required behavior, visual/native selection,
  package/API, mobile/raw-device claim-width, huge-document, docs/skill repair,
  changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and
  final handoff rows are complete, explicitly deferred, or N/A with evidence,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-12-plite-8h-private-alpha-followup.md`
  passes.

Verification surface:
- Parent repo: plan/source audits and final
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-12-plite-8h-private-alpha-followup.md`.
- Plite runtime: focused package tests, Playwright route proofs, Browser
  screenshots/geometry checks, benchmark commands, and `bun check` /
  `bun check:full` chosen by the active checkpoint from `.tmp/plite`.
- Skill/docs changes: source-rule patch, `pnpm install`, generated mirror audit
  with `rg`, and agent-native/autoreview when `.agents/**` changes.
- Browser-visible editor claims: pair model state with native
  `window.getSelection()` / `plite-browser` proof and screenshot/geometry when
  visual.
- Mobile/raw-device: run only if a real raw-device lane is available and in
  scope; otherwise record claim-width limitation, not fake mobile proof.

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
- Source of truth: `.tmp/plite` live source/tests/benchmarks for runtime;
  `.agents/rules/**` for skill policy; `docs/plite/**` and this plan for
  durable decisions; `docs/editor-issue-harvester/**` for issue closure state.
- Allowed edit scope: Plite runtime/tests/benchmarks/docs/skills when the
  active checkpoint proves ownership; parent repo docs/skills only for Plite
  v2 automation state.
- Browser surfaces: local Plite example routes, especially stable editor
  behavior and huge-document lanes if chosen by the gap scan.
- Package/API surfaces: current Plite package owners only when source
  evidence shows API/DX mismatch or repeated runtime bugs.
- Agent/skill surfaces: patch source `.agents/rules/**` only when a reusable
  workflow miss is proven; never hand-edit generated `SKILL.md`.
- Docs/research surfaces: update current-state docs and ledgers, not public
  changelog prose.
- Non-goals: no release, publish, changeset, PR, branch creation, or Plate
  patching unless the user explicitly asks; no broad external issue ledger
  unless the supervision scan proves it is the highest-value safe owner.

Blocked condition:
- Stop early only for explicit user interruption, commit/push/PR/destructive
  authority, missing tool/access that prevents all meaningful work, same real
  blocker repeated with no alternate owner, or an uncovered taste/runtime
  decision where `vision` lacks the needed rule and no safe alternate
  checkpoint remains.
- Do not block while a safe alternate checkpoint remains runnable. In timed or
  batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious
  backlog looks empty. Enter supervision mode and infer the next checkpoint from
  `vision`, current evidence, weak proofs, benchmark gaps, API/docs
  mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- surface: broad Plite private-alpha supervision
- mode: timed
- minimum_runtime: 8h
- target_deadline: 2026-06-12 10:33:00 CEST
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 45
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: hand off to user
- goal_status: complete

Current verdict:
- verdict: ready-for-completion
- confidence: runtime, behavior, visual/native, huge-doc, perf, and API/DX docs
  packets are green or scoped; full-check retry signals were isolated, the
  mobile paste stale-read oracle was repaired, and the fresh broad full proof
  after locator/clipboard/native-selection oracle rewrites is clean; timed
  minimum runtime is satisfied at 28,680s before final handoff closure
- next owner: final handoff and goal-plan completeness check
- keep / revert / quarantine call: keep current docs/metrics; quarantine
  speculative huge-doc runtime patch without fresh owner evidence
- reason: raw focus, shadow DOM, direct selection reads, plite-browser scenario
  stale-read helpers, direct richtext selection getter assertions,
  kernel-trace snapshots, and dynamic DOM/clipboard/native-selection snapshots
  are repaired and broad-suite green. Strict huge-document product perf rerun
  is green after the oracle changes, and focused no-retry huge-document
  behavior pressure is stable. Fresh 20k cross-editor diagnostics keep the
  current runtime: Plite wins typing/DOM tradeoffs, ProseMirror wins pure
  repeated ShiftDown, and no long tasks appear. Stable desktop and scoped
  mobile editor-family pressure are clean. High-repeat visual/native smoke,
  stable selection gesture pressure, huge-document user gesture pressure, broad
  stable-family long soak, and the final `bun check:full` are green at claimed
  width. No dirty speculative runtime packet remains active.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-12-plite-8h-private-alpha-followup.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-automation | done | P0 | Copy prompt requirements and read north-star before implementation. | Requirement rows complete; autogoal, vision, `agent-start`, scoreboard, and template read. | update |
| status | slate-automation | done | P0 | Read active plan, latest prompt, source status, and current evidence. | Current state recorded from previous 8h plan, roadmap, readiness docs, and huge-doc artifact inventory. | update |
| gap-scan | slate-automation | done | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Runtime gates are current-green/scoped; docs claim-width mismatch selected as first safe owner. | update |
| private-alpha-proof-ledger-closure | docs / slate-automation | done | P0 | Roadmap tranche 8 and readiness docs still said proof-ledger closure was pending after the previous run closed private-alpha gates. | Current-state docs patched; `pnpm docs:plite:audit` and `.tmp/plite` `bun check` passed. | keep |
| behavior-proof | slate-ar-stabilize | done | P0 | Prove stable editor behavior before perf. | Exact stable behavior sweep passed `476`, skipped `112` explicit browser-scope rows across Chromium/Firefox/WebKit; skip audit found zero silent project returns. | keep |
| stable-behavior-skip-width-audit | slate-automation / Playwright | done | P1 | The stable sweep had `112` skips; skips must be explicit scope boundaries, not fake green. | Exact-file skip audit found `0` silent project returns; skip sites are explicit. | keep |
| oracle-repair | slate-patch / tdd | done | P0 | Add missing native/visual/model oracles for found gaps. | Selection-oracle coverage audit found current owners for user-sensitive gestures; focused selection contract proof passed. | keep no-change |
| selection-oracle-coverage-audit | slate-react / plite-browser / Playwright | done | P0 | Prove selection tests cover real visual/native/model bugs: drag, double-click, margin/blank click, arrows, undo/redo, multi-leaf, and scroll. | Coverage map points to exact owners; `plite-react` selection contracts passed `108`; `plite-browser` selection/proof tests already passed. | keep |
| visual-proof | Browser / Playwright | done | P0 | Prove visible editor behavior and native selection. | Visual/native smoke passed `22`, skipped `2`; screenshot artifacts inspected for hidden-DOM double-highlight and richtext multi-leaf selection. | keep |
| plite-browser-promotion | plite-browser | done | P1 | Promote repeated browser proof into reusable API/helper. | Existing `plite-browser` proof/scenario/selection helpers are green; no new repeated helper gap was proven. | keep no-change |
| mobile-claim-width | slate-automation | done | P1 | Separate raw-device proof from viewport proof. | `bun test:mobile-device-proof` passed scoped proof and no raw device artifact exists. | keep scoped |
| huge-document-smoke | slate-ar-stabilize | done | P1 | Smoke huge-doc correctness without broad architecture work. | Huge-document desktop file passed `58`, skipped `32`; screenshot artifacts inspected for staged/virtualized repeated ShiftDown/ShiftUp projected selection. | keep |
| perf-packet | slate-ar-fast / slate-ar-perf | done | P2 | Optimize only after correctness is green. | Strict huge-doc product gate passed with failure count `0`, budget failure count `0`, max budget ratio `0.83`; diagnostic legacy compare exposed select-then-type p95 ratio `1.24`. | keep + add diagnostic follow-up |
| huge-doc-select-then-type-diagnostic | slate-ar-perf | done | P1 | Fresh strict product gate invalidated the old roadmap claim that the latest universal diagnostic was green at `0.77`; full wrapper worst ratio was `1.24` on `middleBlockSelectThenTypeMs`. | Focused profiled rerun measured current `42.76ms`, legacy `47.13ms`, ratio `0.91`; classify as distribution-sensitive diagnostic, not stable product regression. | keep |
| cross-editor-huge-doc-diagnostic | slate-ar-perf | done | P1 | Product perf gate should be interpreted against ProseMirror/Lexical before deciding whether to optimize or quarantine. | Cross-editor 5000-block/5-iteration/10-op benchmark passed and updated roadmap. | keep |
| high-sample-shiftdown-diagnostic | slate-ar-perf | done | P1 | Cross-editor start-block repeated ShiftDown p95 looked slower on only `15` samples. | Repeated ShiftDown count raised to `10` for `50` samples per lane; residual is frame-distribution shaped with no long tasks. | quarantine runtime patch |
| api-dx-hard-cut-docs-audit | slate-automation / docs | done | P1 | Current docs still had live front-door wording shaped like migration/release/compat instead of private-alpha/current-state API truth. | `bun test:release-discipline` passed `432`; stale front-door docs wording cut; `pnpm docs:plite:audit` passed. | keep |
| supervision-mode | slate-automation | done | P0 when timed runtime remains | If backlog looks empty before minimum runtime, predict next useful checkpoint from north-star and evidence. | Timed floor was not cut short: after clean full checks, the run added visual/native high-repeat pressure, stable selection pressure, huge-doc user gesture pressure, stable-family long soak, and a final full private-alpha proof. | keep |
| workflow-slowdown-skill-repair | slate-automation / skill source | done | P1 | Broad scans repeated in this loop even though output-budget policy existed. | Patched source rule with a concrete large-root `rg` preflight; `pnpm install` synced mirror; mirror audit and focused agent-native review passed. | keep |
| external-issue-ledger-closure-check | editor-test-harvester / clawsweeper | done | P2 | External issue ledgers should not restart if already issue-by-issue checked. | Durable and `.tmp` Lexical/ProseMirror ledgers show zero unchecked rows. | keep no-change |
| table-fragment-policy-audit | slate-plan / slate core fixtures | done | P1 | Table-fragment rows are an open risk and should be checked against upstream before guessing. | v2 and upstream Slate have the same three explicit skipped deferred-policy fixtures. | keep deferred |
| huge-doc-20k-cross-editor-diagnostic | slate-ar-perf / benchmark | done | P1 | Recheck huge-document behavior/perf posture at 20k blocks after local oracles are solid. | 20k cross-editor diagnostic passed; Plite virtualized wins typing/DOM, ProseMirror wins pure ShiftDown, no long tasks. | keep metrics / quarantine runtime patch |
| full-check-sweep | slate-automation / Playwright | done | P0 | A timed 8h supervisor run needs at least one current full private-alpha proof after docs/skill changes and behavior/perf packets. | `.tmp/plite` `bun check:full` exited 0; integration had 2 Firefox table-cell drag flakes that passed retry and initial focused no-retry stress, then the full Firefox table file reproduced the same row. | keep + repair |
| dragTextRange-oracle-repair | plite-browser / Playwright | done | P0 | The full-check retry exposed a load-sensitive Firefox drag-selection oracle: the table full-range proof needed a terminal after-glyph endpoint and small settle, but the shared helper's default fast path must stay covered. | `dragTextRange` exposes optional `endAffinity` defaulting `inside` and optional `settleMs` defaulting `0`; only table full-range proof rows opt into `endAffinity: after` and `25ms`; typecheck, helper contracts, full-file proof, repeat stress, call-site proof, and autoreview passed. | keep |
| post-helper-full-check-sweep | slate-automation / Playwright | done | P0 | After the `dragTextRange` repair, the tree needed a fresh broad private-alpha proof instead of relying on focused helper rows. | `.tmp/plite` `bun check:full` exited 0 with `1776` passed, `690` skipped, `2` flaky, `0` failed; table/native rows passed; two non-table retry signals were isolated. | keep + repair mobile oracle |
| mobile-paste-oracle-repair | Playwright / paste-html | done | P0 | Fresh full check exposed mobile `paste-html` stale model/DOM read after `Enter` + typing: visible `x` existed but immediate block-text read sometimes returned an empty block. | Patched the row to poll rendered block texts and model block texts after typing; failing row went from `5/20` failures to `20/20` pass and the affected mobile paste suite passed `67`, skipped `3`. | keep |
| post-mobile-oracle-full-check-sweep | slate-automation / Playwright | done | P0 | Focused mobile proof closed the reproduced row, but the previous broad proof still contained flaky rows. | Fresh `.tmp/plite` `bun check:full` exited `0`; integration passed `1778`, skipped `690`, and had `0` flaky / `0` failed. | keep |
| stale-read-oracle-contract-audit | slate-automation / plite-browser / Playwright | done | P1 | The mobile paste repair proved immediate editor-state reads after user input can become fake failures under mobile/broad-suite load. | Patched high-confidence placeholder and paste rows from immediate state reads to polling oracles; placeholder repeat passed `160/160`; paste grep passed `30`, skipped `10`, failed `0`. | keep |
| remaining-direct-state-read-audit | slate-automation / Playwright | done | P1 | The first audit was noisy and only patched the obvious rows; the supervisor still needs to classify whether more direct reads are real oracle debt or harmless baseline reads. | Direct stable-file `modelText` / `selectedText` / `text` expectations were upgraded to `expect.poll`; direct-read scan found no remaining direct reads in touched stable files; affected Chromium sweep passed `183`, skipped `5`, failed `0`. | keep |
| post-stale-read-oracle-full-check-sweep | slate-automation / Playwright | done | P0 | The stale-read oracle rewrite touched several stable example files; focused proof is not enough before moving to another packet. | Fresh `.tmp/plite` `bun check:full` exposed a repeated Chromium document-state focus-mutation retry; row was promoted to a new oracle-repair checkpoint. | keep + repair |
| document-state-focus-oracle-repair | Playwright / plite-browser | done | P0 | The broad suite repeated a Chromium document-state focus-mutation retry: mutation applied, but direct `editor.root.focus()` left focus inactive under load. | Replaced direct locator focus with `editor.focus()` in document-state focus-return rows; exact flaky row passed `50/50` no-retry; whole file passed `110/110` no-retry. | keep |
| post-document-state-focus-oracle-full-check-sweep | slate-automation / Playwright | done | P0 | Focused and file-level proof are not enough after a broad-suite retry; the full private-alpha gate must be clean without retry-backed flakes. | Fresh `.tmp/plite` `bun check:full` passed with `1778` passed, `690` skipped, `0` flaky, `0` failed. | keep |
| raw-focus-and-shadow-stale-read-oracle-audit | Playwright / plite-browser | done | P1 | Read-only scout during the full run found one remaining direct `editor.root.focus()` and one immediate shadow-DOM text read after typing. | Patched richtext raw root focus to `editor.focus()` and shadow-DOM post-type text read to polling; focused Chromium/Firefox/WebKit/mobile repeat passed `80/80`. | keep |
| direct-selection-read-oracle-audit | Playwright / examples | done | P1 | Stable example tests still had direct `editor.get.selection()` assertions that can sample before selection sync. | Converted direct `editor.get.selection()` non-null checks in plaintext, inlines, paste-html, and code-highlighting to polling; affected Chromium/Firefox/WebKit/mobile sweep passed `572`, skipped `92`, failed `0`. | keep |
| plite-browser-scenario-stale-read-oracle-repair | plite-browser / Playwright | done | P1 | The helper package still taught immediate model/selected-text assertions in reusable scenario steps. | Scenario `assertModelText`, `assertSelectedText`, `typeThenUndo`, and `undo.expectedModelTextBefore` now poll; direct helper assertion scan is clean; `plite-browser` typecheck, `test:proof` `29`, and `test:selection` `9` passed. | keep |
| direct-selection-get-oracle-audit | Playwright / examples / plite-browser | done | P1 | Capped rescan found direct `editor.selection.get()` equality checks and scenario last-commit assertions that should use polling when they assert post-action state. | Scenario last-commit checks and richtext direct selection equality checks now poll; exact-pattern scan is clean; `plite-browser` typecheck/proof passed and repeated richtext proof passed `140`, skipped `20`, failed `0`. | keep |
| post-direct-selection-oracle-full-check-sweep | slate-automation / Playwright | done | P0 | The latest oracle rewrites touched shared `plite-browser` scenario helpers plus richtext browser assertions. | `.tmp/plite` `bun check:full` passed: integration `1778` passed, `690` skipped, no flaky/failure rows. | keep |
| direct-kernel-trace-oracle-audit | Playwright / examples | done | P1 | Capped scan still shows direct `editor.get.kernelTrace()` equality assertions after actions; `plite-browser` has a polling kernel-trace helper, so direct snapshots are avoidable proof debt. | Converted trace equality snapshots to polling; exact trace pattern scan is clean; focused no-retry repeat passed `150`, skipped `90`, failed `0`. | keep |
| direct-dom-clipboard-selection-oracle-audit | Playwright / examples | done | P1 | Remaining direct post-action assertions are locator text, clipboard text, and native selection text; Playwright and `expect.poll` can wait for those surfaces explicitly. | Converted high-confidence rows only and left static read-only attributes alone; focused no-retry repeat passed `450`, skipped `230`, failed `0`; exact scan now reports only static attribute reads. | keep |
| post-dynamic-oracle-full-check-sweep | slate-automation / Playwright | done | P0 | Locator/clipboard/native-selection oracle rewrites touched several browser example files. | Fresh `.tmp/plite` `bun check:full` passed with `1778` passed, `690` skipped, `0` flaky, `0` failed. | keep |
| post-oracle-huge-doc-strict-perf | slate-ar-perf / benchmark | done | P1 | After large assertion/oracle cleanup, reprove the user-critical huge-document product gate instead of assuming test-only edits cannot affect behavior/perf proof. | Strict full benchmark passed with budget failures `0`, diagnostic budget failures `0`, failure count `0`, max budget ratio `0.79`; latest product metrics: type-to-paint p95 `30.6ms`, select-to-paint p95 `57.5ms`, selection-ready p95 `26.2ms`, virtualized DOM nodes p95 `304`, editor elements p95 `15`, long-task p95 `0`. | keep |
| huge-doc-critical-behavior-pressure | Playwright / huge-document | done | P1 | Full proof is broad but low-repeat; previous user reports were visible staged/virtualized gesture bugs that need no-retry pressure. | Focused no-retry desktop repeat passed `260`, skipped `160`, failed `0` over 420 scheduled rows across staged/virtualized ShiftUp/Down, select-all/delete, typing, undo, scroll, scrollbar, drag, blank-gap, and manual-scroll typing rows. | keep |
| huge-doc-20k-cross-editor-refresh | slate-ar-perf / benchmark | done | P1 | The local huge-doc gate is green; keep the large-doc comparison with upstream Slate-adjacent editors fresh before making any architecture/perf call. | 20k cross-editor benchmark exited `0`: Plite virtualized DOM p95 `154/155` vs ProseMirror `20001` and Lexical `40001`; Plite virtualized repeated ShiftDown p95 `23.6/23.5ms`, ProseMirror `16.3/16.2ms`, Lexical `25.2/25.1ms`; Plite virtualized typing p95 `24.6/75.4ms` vs ProseMirror `141.2/132.2ms` and Lexical `232.4/272.8ms`; long tasks `0`. | keep metrics / quarantine runtime patch |
| stable-editor-family-pressure | Playwright / examples | done | P1 | Browser oracle rewrites touched stable editing files; broad proof passed once, but timed supervision should pressure richtext/plaintext/markdown/selection/void/paste/placeholder families without retries. | Repeated no-retry desktop sweep passed `1890`, skipped `306`, failed `0` across richtext, plaintext, markdown, paste, editable voids, placeholder, mentions, inlines, shadow DOM, checklists, code highlighting, and document-state. | keep |
| scoped-mobile-stable-family-pressure | Playwright / examples | done | P1 | Mobile viewport proof is not raw-device proof, but the stale-read bug class appeared in mobile rows; pressure the same stable families in the mobile project. | Repeated no-retry mobile-project sweep passed `975`, skipped `855`, failed `0`; claim remains scoped and not raw-device proof. | keep scoped |
| post-pressure-full-private-alpha-proof | slate-automation / Playwright | done | P0 | Pressure runs were focused; after a timed supervisor mutates or exercises many packets, broad private-alpha proof should be clean before moving to another lane. | Fresh `.tmp/plite` `bun check:full` passed with integration `1778` passed, `690` skipped, `0` flaky, `0` failed. | keep |
| visual-native-high-repeat-pressure | Playwright / visual-native smoke | done | P1 | The historical misses were visible double-highlight and native/model selection drift; one broad pass is not enough for that taste boundary. | Retries-disabled high-repeat visual/native selection smoke passed `440`, skipped `40`, failed `0` across desktop engines. | keep |
| stable-selection-gesture-high-repeat-pressure | Playwright / examples | done | P1 | User-visible regressions clustered around real selection gestures, not just helper-level model assertions. | Retries-disabled high-repeat selection gesture rows passed `270`, skipped `150`, failed `0` across desktop engines; skips are existing engine-scope boundaries. | keep scoped |
| huge-doc-user-gesture-high-repeat-pressure | Playwright / huge-document | done | P1 | Huge-document reports centered on ShiftUp/Down, select-all delete, follow-up typing, undo, scroll stability, scrollbar, and drag/autoscroll behavior. | Retries-disabled high-repeat rows passed `540`, skipped `360`, failed `0`; Chromium exercised all rows, Firefox/WebKit exercised their claimed subset. | keep scoped |
| stable-family-long-soak-repressure | Playwright / examples | done | P1 | Timed floor still remains; after focused gesture pressure, a broad stable-family soak is the best remaining local proof surface before the final full gate. | Repeated stable editor-family desktop sweep passed `1890`, skipped `306`, failed `0` with retries disabled. | keep |
| final-full-private-alpha-proof | slate-automation / Playwright | done | P0 | The run needs a final broad private-alpha proof after long-soak pressure before completion. | `.tmp/plite` `bun check:full` exited `0`; integration passed `1778`, skipped `690`, with `0` flaky / `0` failed. | keep |
| consolidation | slate-automation | done | P1 | Move accepted reusable decisions to durable docs/rules. | Durable docs, rule source, generated skill mirror, plan ledgers, and final handoff sections are updated or scoped. | keep |
| final-handoff | slate-automation | done | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff contract rows below are filled. | keep |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | done: seed replaced by evidence-backed checkpoints |
| 1 | update | checkpoint-zero, automation source, thresholds, boundaries, status | user prompt + slate-automation + autogoal + vision + agent-start + scoreboard | Convert bare `8h` into a measurable timed supervisor run without inventing a narrow surface. | checkpoint-zero complete; next status |
| 2 | update/add | status, gap-scan, private-alpha-proof-ledger-closure | previous 8h plan + roadmap + readiness docs | The last run left table-fragment and raw-device as boundaries; readiness docs still called proof-ledger closure pending. | patch current-state docs before rerunning proof |
| 3 | update/add | behavior-proof, stable-behavior-skip-width-audit | stable Playwright sweep output + exact-file skip audit | The next autonomous owner was stable behavior proof; the high skip count needed claim-width audit before calling it coverage. | keep behavior proof; scope skipped rows |
| 4 | update/add | visual-proof | visual-native smoke output + screenshot artifact inspection | User repeatedly cares about visible double-highlight/native selection bugs; model-heavy behavior proof is insufficient. | keep visual proof; run huge-doc next |
| 5 | update/add | huge-document-smoke | huge-document Playwright output + screenshot artifact inspection | Correctness must precede perf; prior user bugs were huge-doc staged/virtualized selection and scrollbar behavior. | keep correctness; run perf gate |
| 6 | update/add | perf-packet, huge-doc-select-then-type-diagnostic | strict huge-doc product gate metrics | Product gate passed, but fresh universal diagnostic changed from prior roadmap ratio `0.77` to `1.24` on select-then-type. | keep product gate; patch claim-width docs; queue diagnostic owner |
| 7 | update/add | cross-editor-huge-doc-diagnostic | cross-editor benchmark output | The scoped diagnostic needed ProseMirror/Lexical context before picking an optimization target. | keep current runtime; start-block ShiftDown remains narrow follow-up |
| 8 | update | huge-doc-select-then-type-diagnostic | focused profiled legacy-compare rerun | Full wrapper ratio `1.24` did not reproduce as a same-surface profiled gap; current was faster than legacy. | keep current runtime; update roadmap wording |
| 9 | update/add | high-sample-shiftdown-diagnostic | 50-sample cross-editor repeated ShiftDown run + profiler summary | Start-block p95 residual reproduced but command/projection profile does not show a safe local patch owner. | update roadmap; quarantine runtime tweak |
| 10 | add/update | api-dx-hard-cut-docs-audit | public hard-cut contract guard + exact docs scan | Package API contracts were green, but live docs still taught stale migration/release/compat framing. | keep docs hard cut; continue timed supervision |
| 11 | update | mobile-claim-width | scoped mobile proof command + raw artifact check | The run needs explicit claim width instead of fake raw mobile proof. | keep scoped mobile proof; raw Android/iOS remains unclaimed |
| 12 | update | plite-browser-promotion | `plite-browser` proof/scenario/selection test commands | Existing helper package owns the repeated proof patterns seen in this run; no new copy-paste helper gap was proven. | keep no-change; log broad helper inventory scan as slowdown |
| 13 | add/update | workflow-slowdown-skill-repair | repeated broad-scan output + source-rule patch | The skill had generic output-budget policy, but the loop still needed concrete large-root `rg` preflight rules. | keep skill repair; source and mirror verified |
| 14 | update/add | oracle-repair, selection-oracle-coverage-audit | exact selection owner scan + focused contracts | The run needed proof that selection oracles cover the actual user-sensitive gestures before claiming no new oracle patch. | keep no-change; command-shape miss logged |
| 15 | add/update | external-issue-ledger-closure-check | TSV header/count scan for durable and `.tmp` issue ledgers | External ledgers are only a useful next owner if unchecked rows remain. | keep no-change; both ledgers are fully checked |
| 16 | update | table-fragment-policy-audit | v2 fixture audit + upstream Slate comparison | Table fragment policy was the top remaining private-alpha question. | keep deferred; upstream also marks these rows skipped as policy-deferred |
| 17 | add/update | huge-doc-20k-cross-editor-diagnostic | 20k cross-editor benchmark + artifact schema read | Huge-doc residuals are the highest-value measurable runtime lane after local oracle closure. | keep metrics; no speculative patch |
| 18 | add/update | full-check-sweep | `bun check:full` output + focused no-retry stress | The current tree needed a full private-alpha proof, and the Firefox retry needed isolation. | keep full proof; classify retry as oracle stability owner |
| 19 | add/update | dragTextRange-oracle-repair | shared helper read + focused package/browser proof | Two independent failing rows used the same helper, and focused runtime proof was clean. | keep helper option with scoped settle opt-in |
| 20 | add/update | post-helper-full-check-sweep | fresh `bun check:full` after helper repair | Focused proof is insufficient after a helper used by Playwright route tests; broad gate must run again. | keep broad proof; isolate two non-table retry signals |
| 21 | add/update | mobile-paste-oracle-repair | no-retry repeat + affected suite rerun | Mobile paste row failed `5/20` because the test read block text before mobile typing synchronized. | keep oracle patch; continue supervision |
| 22 | add/update | post-mobile-oracle-full-check-sweep | fresh `.tmp/plite` `bun check:full` | Fresh broad proof after mobile paste oracle repair. | done: `1778` passed, `690` skipped, `0` flaky, `0` failed |
| 23 | add/update | stale-read-oracle-contract-audit | focused stale-read patch + no-retry repeat proof | The supervisor should repair the testing method that produced the stale-read row, not only the one failing test. | done: placeholder `160/160`; paste rows `30` passed / `10` expected skips |
| 24 | add/update | remaining-direct-state-read-audit | capped direct-read classifier + mechanical oracle rewrite | Do one capped classification pass so the loop does not leave obvious sibling stale-read risks or thrash on baseline reads. | done: no remaining direct stable-file reads; affected Chromium sweep `183` passed / `5` skipped |
| 25 | add/update | post-stale-read-oracle-full-check-sweep | oracle rewrite touched stable browser proof files | Focused proof is insufficient after broad stable-file assertion rewrites. | full check repeated Chromium document-state focus-mutation retry |
| 26 | add/update | document-state-focus-oracle-repair, post-document-state-focus-oracle-full-check-sweep | repeated broad-suite document-state retry + focused repair proof | Direct locator focus was a weaker oracle than the first-class plite-browser focus helper. | repair kept; later full proofs green |
| 27 | add/update | raw-focus-and-shadow-stale-read-oracle-audit | full proof completed cleanly; read-only scout found two adjacent oracle debts | Continue timed supervision instead of stopping after green full proof. | done: focused Chromium/Firefox/WebKit/mobile repeat `80/80` |
| 28 | add/update | direct-selection-read-oracle-audit | exact stale-read scan found direct `editor.get.selection()` assertions in stable browser files | Convert direct non-null selection snapshots to polling assertions and verify all affected browser projects. | done: affected sweep `572` passed / `92` skipped |
| 29 | add/update | plite-browser-scenario-stale-read-oracle-repair | package helper scenarios still used immediate model/selected-text assertion reads | Repair the reusable proof API, not only example call sites. | done: direct helper assertion scan clean; typecheck, proof `29`, selection `9` passed |
| 30 | add/update | direct-selection-get-oracle-audit | capped rescan found direct `editor.selection.get()` equality assertions and direct scenario last-commit reads | Tighten high-confidence post-action assertions before the next full proof. | done: exact-pattern scan clean; package proof green; focused richtext repeat `140` passed / `20` skipped |
| 31 | add/update | post-direct-selection-oracle-full-check-sweep | shared helper and richtext oracle rewrites need broad-suite load proof | Run the full private-alpha gate before moving to the next autonomous packet. | done: `bun check:full` integration `1778` passed / `690` skipped, no flakes |
| 32 | add/update | direct-kernel-trace-oracle-audit | capped scan after full proof found direct kernel-trace equality assertions | Use polling/helper assertions for post-action trace checks instead of single snapshots. | done: focused no-retry repeat `150` passed / `90` skipped |
| 33 | add/update | direct-dom-clipboard-selection-oracle-audit | capped scan found remaining locator/clipboard/native-selection snapshots | Convert high-confidence dynamic assertions to waiting assertions; do not churn static attribute checks. | done: exact scan reports only static read-only attributes; focused repeat `450` passed / `230` skipped |
| 34 | add/update | post-dynamic-oracle-full-check-sweep | many browser example files changed during assertion cleanup | Run full private-alpha proof before opening a new non-oracle packet. | done: `bun check:full` integration `1778` passed / `690` skipped, no flakes |
| 35 | add/update | post-oracle-huge-doc-strict-perf | full proof is clean but timed run still has runtime budget and huge-doc remains the most user-sensitive lane | Re-run strict huge-doc product perf after oracle rewrites and compare current metrics against the earlier kept gate. | done: strict gate passed, max budget ratio `0.79`, failures `0`, budget failures `0` |
| 36 | add/update | huge-doc-critical-behavior-pressure | strict metrics are green but low-repeat visual/user-sensitive huge-doc gestures deserve pressure before moving on | Run no-retry repeated huge-document behavior rows across desktop engines. | done: `260` passed / `160` skipped / `0` failed |
| 37 | add/update | huge-doc-20k-cross-editor-refresh | huge-doc local proof is green, but architecture/perf calls need current external-editor comparison | Run 20k cross-editor comparison with repeated ShiftDown pressure. | done: keep current runtime, no speculative patch |
| 38 | add/update | stable-editor-family-pressure | oracle rewrites touched stable editor files, and full proof is one pass rather than pressure | Run no-retry repeated desktop sweep on stable editor families. | done: `1890` passed / `306` skipped / `0` failed |
| 39 | add/update | scoped-mobile-stable-family-pressure | mobile paste stale-read was a real testing-method miss, but raw-device proof remains unavailable | Run no-retry repeated mobile-project sweep on the same stable families; keep the claim scoped. | done: `975` passed / `855` skipped / `0` failed |
| 40 | add/update | post-pressure-full-private-alpha-proof | desktop and scoped mobile pressure are green, but the full private-alpha gate is the broad proof owner | Run `bun check:full` after pressure packets. | done: integration `1778` passed / `690` skipped / `0` flaky / `0` failed |
| 41 | add/update | visual-native-high-repeat-pressure | timed runtime remains and visual/native bugs were the most user-visible repeated miss class | Pressure visual/native smoke with retries disabled across desktop engines. | done: `440` passed / `40` skipped / `0` failed |
| 42 | add/update | stable-selection-gesture-high-repeat-pressure | visual smoke is green, but stable gesture rows should pressure the exact interaction families behind previous misses | Run no-retry high-repeat selection gesture rows across desktop engines. | done: `270` passed / `150` skipped / `0` failed |
| 43 | add/update | huge-doc-user-gesture-high-repeat-pressure | stable selection gestures are green; the remaining timed high-value surface is huge-doc user gestures from prior bug reports | Run no-retry high-repeat huge-document gesture rows across desktop engines. | done: `540` passed / `360` skipped / `0` failed |
| 44 | add/update | stable-family-long-soak-repressure | timed floor remains; broad stable-family pressure is the best remaining proof before final full gate | Repeat no-retry desktop stable-family sweep. | done: `1890` passed / `306` skipped / `0` failed |
| 45 | add/update | final-full-private-alpha-proof | focused and soak pressure passed; the final broad private-alpha proof is the completion gate owner | Run `bun check:full`; isolate any retry/failure before handoff. | done: `1778` passed / `690` skipped / `0` flaky / `0` failed |

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
| Prompt requirements captured before work | yes | User prompt is `plite-automation 8h`; explicit requirements captured as timed minimum runtime, broad Plite supervision, dynamic checkpointing, and no early stop. |
| `plite-automation` source rule read | yes | User provided the full skill body in the prompt; plan uses timed-mode, checkpoint, handoff, and private-alpha rules from it. |
| `vision` read as checkpoint zero | yes | `.agents/skills/vision/SKILL.md` read before runtime work. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created active goal for this plan. |
| Invocation mode and timebox recorded | yes | Timed mode, minimum 8h, target deadline 2026-06-12 10:33:00 CEST. |
| Dynamic checkpoint policy accepted | yes | Checkpoint supervisor allows add/update/split/merge/retire/remove/reopen/reprioritize after each loop. |
| Source of truth and allowed workspaces recorded | yes | Boundaries section separates `.tmp/plite` runtime from parent docs/skills. |
| Output budget strategy recorded | yes | Broad scans must use counts/files/slices, exclude generated/raw/noisy trees unless named, and write large audits to artifacts instead of streaming. |
| Private-alpha release/PR boundary recorded | yes | No release/publish/changeset/PR/branch work unless explicitly requested. |
| Browser proof strategy recorded | yes | Browser-visible claims require model + native selection + screenshot/geometry when visual. |
| Package/API proof strategy recorded | yes | Package/API touched only when evidence shows owner mismatch; run focused package/type/test proof. |
| Mobile/raw-device claim-width policy recorded | yes | Raw-device proof only with real device lane; otherwise scope claim width. |
| Skill repair authority and source-rule boundary recorded | yes | Patch `.agents/rules/**`, run `pnpm install`, audit mirrors; no generated `SKILL.md` hand edits. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation. Evidence: sections
      above; prompt had only `8h`, so skill-derived timed-mode rules supply the
      checkable requirements.
- [x] Short objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining
      backlog ladder, and supervision-mode fallback are recorded.
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
| Named verification threshold | done | Run the proof commands/artifacts named in this plan | Parent docs audit, `.tmp/plite` fast checks, repeated pressure packets, strict huge-doc benchmark, scoped mobile proof, and final `.tmp/plite` `bun check:full` passed. |
| Dynamic checkpoint reconciliation | done | Prove the plan was updated from evidence and not frozen to the initial seed | The run added, reprioritized, and closed 45 checkpoint loops from docs claim-width through final full proof. |
| Workspace authority proof | done | Record cwd/tool for each Plite, parent-docs, skill, browser, package, or benchmark proof | Parent docs proof ran in `/Users/zbeyens/git/plate-2`; runtime/browser/benchmark proof ran in `.tmp/plite`; skill sync proof ran from parent source/mirror. |
| Behavior gates | yes | Run focused stable behavior proof or record scoped defer rows | Exact stable sweep passed `476`, skipped `112`; skip-width audit found no silent project returns. |
| Visual/native selection proof | yes | Record Browser/Playwright/native-selection evidence or scoped blocker | Visual/native smoke passed `22`, skipped `2`; inspected screenshot artifacts for double-highlight and multi-leaf selection. |
| Missing oracle repair | done | Add/verify/revert/quarantine oracle packets or record owner defer | Selection-oracle coverage audit found existing owners for drag, double-click, margin/blank click, arrows, undo/redo, multi-leaf/native highlight, and scroll; focused `plite-react` selection contract proof passed `108`. |
| `plite-browser` promotion | done | Add/verify helper/API or record queue/defer reason | `dragTextRange` now has optional `endAffinity` and `settleMs` with defaults preserving fast inside-range drags; table full-range proofs opt into after-text endpoint plus `25ms`; `bun --filter plite-browser test:selection` passed `9`, `bun --filter plite-browser test:proof` passed `29`, and focused drag call-site Playwright proof passed. |
| Mobile/raw-device claim width | done | Run raw-device proof or record that only scoped viewport/browser proof is available | `.tmp/plite` `bun test:mobile-device-proof` passed scoped proof and reported raw Android/iOS requires `PLITE_BROWSER_RAW_MOBILE_REQUIRED=1` plus `test-results/release-proof/mobile-device-proof.json`; no raw artifact exists. |
| Huge-document correctness smoke | yes | Run focused huge-document behavior smoke or record owner defer | Huge-document desktop file passed `58`, skipped `32`; skip audit found zero silent project returns. |
| Package/API proof | done | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | `.tmp/plite` `bun test:release-discipline` passed `432`; stale live docs API/private-alpha wording cut; parent docs audit passed. |
| Skill/rule sync | done | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | Patched `.agents/rules/slate-automation.mdc`; `pnpm install` regenerated `.agents/skills/slate-automation/SKILL.md`; mirror `rg` audit passed. |
| Changed list / review attention / stopping checkpoints | done | Fill final handoff ledgers from current packet evidence | Changed list, needs-your-attention rows, stopping checkpoints, open risks, and final handoff contract are filled below. |
| Final lint/check | done | Run scoped lint/check or record why no code changed | Final `.tmp/plite` `bun check:full` exited `0`: integration `1778` passed, `690` skipped, `0` flaky, `0` failed. |
| Workflow slowdown review | done | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Broad-scan slowdown logged; source rule now requires large-root `rg` preflight and artifact fallback. |
| Agent-native review for agent/tooling changes | done | Load `agent-native-reviewer` and close accepted findings, or N/A | Focused review passed: rule is an agent-executable primitive, source/mirror parity passed, no UI/tool parity issue applies. |
| Autoreview for non-trivial implementation changes | done | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | Focused autoreview found two valid helper issues; both fixed. Final autoreview exited clean with no accepted/actionable findings. |
| Goal plan complete | done | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-12-plite-8h-private-alpha-followup.md` | Passed: `[autogoal] complete: docs/plans/2026-06-12-plite-8h-private-alpha-followup.md`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | done | created plan and copied explicit prompt/timed-mode requirements | status |
| Status and current-tree closure | done | current evidence read from previous 8h plan, roadmap, readiness docs, and current artifact inventory | gap scan |
| Gap scan and scenario matrix | done | first owner is private-alpha proof ledger closure; behavior/perf owners remain available for next loops | behavior proof |
| Behavior proof | done | stable examples sweep passed across Chromium/Firefox/WebKit; explicit skip-width audit complete | oracle repair |
| Oracle repair | done | selection-oracle coverage audit and focused contracts passed; no new missing oracle found | visual proof |
| Visual/native proof | done | visual/native smoke passed; screenshot artifacts inspected | plite-browser promotion |
| plite-browser promotion | done | existing proof/scenario/selection helpers green; no new helper gap | mobile claim width |
| Mobile/raw-device claim width | done | scoped mobile proof passed; raw artifact absent by design | huge-document smoke |
| Huge-document correctness smoke | done | huge-document desktop correctness passed with inspected staged/virtualized selection screenshots | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | done | strict huge-doc product perf gate passed earlier and again after oracle rewrites; roadmap claim-width sentence patched from stale metric; API/DX hard-cut guard passed and stale front-door wording was cut | consolidation |
| Consolidation and review | done | docs and skill rules consolidated for accepted decisions; agent-native review and focused autoreview completed where relevant | final handoff |
| Final handoff and goal-plan check | done | final handoff rows are filled; mechanical check passed | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| private-alpha docs | current-state claim width | parent docs | proof-ledger closure | docs audit + fast runtime check | kept |
| stable examples | richtext/plaintext/markdown/editable-voids/hidden-dom | Chromium/Firefox/WebKit | typing, paste, selection, history, void, hidden DOM | Playwright exact files | kept with scoped skips |
| stable examples pressure | richtext/plaintext/markdown/paste/editable-voids/placeholder/mentions/inlines/shadow-dom/checklists/code-highlighting/document-state | Chromium/Firefox/WebKit | typing, paste, selection, history, void, hidden DOM, focus, clipboard | repeated no-retry Playwright exact files | kept; `1890` passed / `306` skipped / `0` failed |
| scoped mobile stable pressure | same stable family files | mobile project | mobile-supported typing, paste, selection, history, void, hidden DOM, focus, clipboard | repeated no-retry Playwright exact files | kept scoped; `975` passed / `855` skipped / `0` failed |
| visual/native smoke | richtext/plaintext/custom-placeholder/hidden DOM/images/inlines/tables | Chromium/Firefox/WebKit | collapsed caret, one native highlight, hidden-DOM double-highlight, triple-click, table drag | screenshot artifacts + Playwright assertions | kept with scoped Firefox skips |
| huge-document correctness | staged/auto/virtualized huge document | Chromium/Firefox/WebKit | typing, Enter, paste, select-all, undo, ShiftUp/Down, scroll, scrollbar buffering, drag geometry | huge-document Playwright file + screenshots | kept with scoped skips |
| huge-document product perf | 5000-block product gate | browser benchmark | type-to-paint, select-to-paint, DOM budget, long task, legacy diagnostic | strict full benchmark + focused profile | kept; select-then-type diagnostic classified distribution-sensitive |
| huge-document no-retry pressure | staged/virtualized huge document | Chromium/Firefox/WebKit | ShiftUp/Down, select-all/delete, typing, undo, scroll, scrollbar, drag, blank-gap, manual-scroll typing | focused Playwright repeat | kept; `260` passed / `160` skipped / `0` failed |
| 20k cross-editor huge-doc diagnostic | Plite auto/virtualized vs ProseMirror vs Lexical | Chromium benchmark | typing, select, materialized select, repeated ShiftDown, ShiftUp, DOM, long tasks | cross-editor benchmark | kept; Plite virtualized wins DOM/typing, ProseMirror wins pure repeated ShiftDown, no runtime patch owner |
| cross-editor huge-doc diagnostic | Plite auto/virtualized vs ProseMirror vs Lexical | 5000 blocks, 5 iterations, 10 ops | typing, selection, ShiftUp/Down, DOM budget | cross-editor benchmark | kept current runtime; narrow start-block ShiftDown residual |
| high-sample ShiftDown diagnostic | Plite auto/virtualized vs ProseMirror vs Lexical | 5000 blocks, 5 iterations, 10 repeated ShiftDown steps | p95/median/p75/max, command time, render count, projection profile | cross-editor benchmark + artifact read | keep metrics; quarantine runtime patch |
| API/DX hard-cut docs audit | Plite package contracts + front-door docs | package hard-cut guard + current docs | public surface, public fields, escape hatches, write boundary, aliases, rendered DOM shape, stale docs wording | contract tests + exact wording scan + docs audit | kept |
| mobile claim-width proof | scoped mobile proof guard | semantic/proxy mobile rows | raw Android/iOS artifact boundary | `bun test:mobile-device-proof` + artifact existence check | kept scoped; raw device remains unclaimed |
| plite-browser helper proof | plite-browser package | proof/scenario/selection helpers | release-proof classification, scenario reduction/replay, native/editor selection snapshots, stable drag text ranges | `bun --filter plite-browser test:proof` + `bun --filter plite-browser test:selection` + focused Playwright helper call-site slice | kept with `dragTextRange` optional settle and scoped opt-in |
| workflow slowdown skill repair | slate-automation source rule | broad `rg` preflight | output-budget discipline for docs/packages/site/playwright scans | source patch + `pnpm install` + mirror audit + agent-native review | kept |
| selection oracle coverage audit | Plite selection owners | exact owner scan + focused contracts | drag, double-click, margin/blank click, arrows, undo/redo, multi-leaf/native highlight, scroll | `plite-react` Vitest selection contracts + earlier visual/native/huge-doc Playwright proof | kept no-change |
| external issue ledger closure check | Lexical + ProseMirror durable and `.tmp` ledgers | TSV header/count scan | unchecked rows and unchecked relevant rows | `awk` over `issue-closure-ledger.tsv` only, no raw issue JSON | kept no-change |
| table-fragment policy audit | Plite fixtures + upstream Slate fixtures | exact three-fixture comparison | skipped table fragment merge semantics | `sed` exact fixtures in `.tmp/plite` and `../slate` | kept deferred |
| 20k huge-doc cross-editor diagnostic | Plite auto/virtualized vs ProseMirror vs Lexical | 20k blocks, 3 iterations, 10 ops, 5 repeated ShiftDown steps | typing, select, ShiftUp/Down, DOM budget, long task | cross-editor benchmark + artifact summary | kept metrics; runtime patch quarantined |
| mobile paste synchronization oracle | paste-html example | Playwright mobile project | rich paste, Enter, follow-up typing, rendered block text, model block text | focused no-retry repeat + affected mobile paste file | kept with polling rendered/model text oracle |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| private-alpha-proof-ledger-closure-001 | 2 | docs / slate-automation | Readiness docs said proof-ledger closure was pending even though the previous run closed private-alpha gates and scoped the remaining boundaries. | Patched `docs/plite/release-readiness-decision.md`, `docs/plite/absolute-architecture-release-claim.md`, `docs/plite/master-roadmap.md`; ran `pnpm docs:plite:audit`; ran `.tmp/plite` `bun check`. | Parent docs audit passed; `.tmp/plite` fast runtime gate passed lint, typecheck, Bun tests `1201/91`, slate-layout `47`, slate-react Vitest `750`. | keep | supervision rescan |
| stable-behavior-sweep-001 | 3 | Playwright / slate-react examples | Broad stable editor behaviors should still be green after the prior 8h changes before moving to perf or API work. | `.tmp/plite`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/plaintext.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/hidden-content-blocks.test.ts --project=chromium --project=firefox --project=webkit`; exact-file skip audit. | Passed `476`, skipped `112`, failed `0` in `13.7m`; skip audit found `0` silent project returns in the swept files. | keep | visual/native + huge-doc rescan |
| visual-native-smoke-001 | 4 | Playwright / screenshot artifacts | Selection bugs can pass model assertions while visible native selection is wrong. | `.tmp/plite`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts --project=chromium --project=firefox --project=webkit`; inspected `test-results/.../hidden-dom-boundary-drag-selection.png` and `richtext-multi-leaf-selection.png` artifacts. | Passed `22`, skipped `2`, failed `0`; screenshots show one selection layer for hidden-DOM boundary drag and multi-leaf richtext selection. | keep | huge-document correctness smoke |
| huge-document-correctness-001 | 5 | Playwright / huge-document | Huge-document staged/virtualized behavior must stay correct before perf optimization or metrics matter. | `.tmp/plite`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --project=firefox --project=webkit`; skip audit; inspected staged/virtualized repeated ShiftDown/ShiftUp screenshots. | Passed `58`, skipped `32`, failed `0` in `1.3m`; skip audit found `0` silent project returns; representative screenshots show one projected selection layer. | keep | product perf gate |
| huge-document-product-perf-001 | 6 | slate-ar-perf / benchmark | Huge-doc perf is meaningful only after correctness is green; product gate should pass or open a focused owner. | `.tmp/plite`: `HUGE_DOC_FULL_STRICT_BUDGET=1 bun run bench:react:huge-document:full:local`; patched `docs/plite/master-roadmap.md` stale diagnostic ratio. | Passed with `react_huge_doc_full_failure_count=0`, `react_huge_doc_full_budget_failure_count=0`, max budget ratio `0.83`, type-to-paint p95 `32.3ms`, select-to-paint p95 `57.2ms`, virtualized DOM nodes p95 `304`, long-task p95 `0`; diagnostic legacy compare worst p95 ratio `1.24` on `middleBlockSelectThenTypeMs`. | keep product gate; queue diagnostic | cross-editor / focused diagnostic |
| cross-editor-huge-doc-diagnostic-001 | 7 | slate-ar-perf / benchmark | The stale universal superiority claim needs current ProseMirror/Lexical context. | `.tmp/plite`: `CROSS_EDITOR_HUGE_BLOCKS=5000 CROSS_EDITOR_HUGE_ITERATIONS=5 CROSS_EDITOR_HUGE_TYPE_OPS=10 bun run bench:react:huge-document:cross-editor:local`; patched `docs/plite/master-roadmap.md`. | Plite type-to-paint p95 wins: auto `24.5ms`, virtualized `25.3ms`, ProseMirror `60.4ms`, Lexical `76.6ms`; DOM p95 wins: Plite `753/155`, ProseMirror `5001`, Lexical `10001`; repeated ShiftDown middle is `15.3ms` vs ProseMirror `16.1ms` / Lexical `17.8ms`, but start-block remains residual at `21.3/22.7ms`. | keep current runtime; queue start-block diagnostic | focused diagnostic or next owner |
| select-then-type-profile-001 | 8 | slate-ar-perf / benchmark | The strict wrapper's `1.24` legacy ratio may be distribution-sensitive and should not trigger runtime changes without focused repro. | `.tmp/plite`: `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 REACT_HUGE_COMPARE_SURFACES=v2DefaultRenderAuto REACT_HUGE_COMPARE_PROFILE=1 REACT_HUGE_COMPARE_ISOLATE_SURFACES=1 REACT_HUGE_COMPARE_SPLIT_SELECTION=1 REACT_HUGE_COMPARE_DISPOSE_DELAY_MS=0 bun run bench:react:huge-document:legacy-compare:local`; artifact read. | Focused lane did not reproduce regression: middleBlockSelectThenType current `42.76ms`, legacy `47.13ms`, ratio `0.91`; full-doc replace and fragment lanes current `9ms` vs legacy `116-123ms`. | keep / quarantine product patch | start-block ShiftDown or next owner |
| high-sample-shiftdown-diagnostic-001 | 9 | slate-ar-perf / benchmark | Start-block repeated ShiftDown p95 should be checked with more than `15` samples before optimizing. | `.tmp/plite`: `CROSS_EDITOR_HUGE_BLOCKS=5000 CROSS_EDITOR_HUGE_ITERATIONS=5 CROSS_EDITOR_HUGE_TYPE_OPS=10 CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_COUNT=10 bun run bench:react:huge-document:cross-editor:local`; artifact profile read; patched `docs/plite/master-roadmap.md`. | 50 samples per lane: Plite auto start p95 `21.9ms`, virtualized start `22.5ms`, middle `15.6/15.3ms`; ProseMirror `15.7/15.6ms`, Lexical `15.9/16.4ms`; Plite start median/p75 `14.7/14.9ms`, no long tasks, projection build about `75ms/50` steps, render p95 `5-6`. | keep metrics / quarantine runtime patch | next owner |
| api-dx-hard-cut-docs-audit-001 | 10 | slate-automation / docs | Package API hard cuts may be green while live docs still carry migration/release/compat framing that fights the current clean API story. | `.tmp/plite`: `bun test:release-discipline`; parent docs exact wording scan; patched `docs/plite/overview.md`, `docs/plite/final-api-hard-cuts-status.md`, `docs/plite/release-readiness-decision.md`; parent `pnpm docs:plite:audit`. | Contract guard passed `432`; exact stale-wording scan on touched docs returned no hits for the removed phrases; docs audit passed. | keep | supervision rescan |
| mobile-claim-width-001 | 11 | slate-automation / plite-browser proof | Mobile proof must not inflate Playwright viewport/semantic proxy evidence into raw Android/iOS keyboard or clipboard claims. | `.tmp/plite`: `bun test:mobile-device-proof`; `test -f test-results/release-proof/mobile-device-proof.json`. | Scoped proof passed and explicitly reported raw claims require `PLITE_BROWSER_RAW_MOBILE_REQUIRED=1` plus the raw artifact; artifact check found no raw proof file. | keep scoped | supervision rescan |
| plite-browser-promotion-001 | 12 | plite-browser | Repeated visual/native proof work should become helper API, unless current `plite-browser` already owns it. | `.tmp/plite`: `bun --filter plite-browser test:proof`; `bun --filter plite-browser test:selection`; helper inventory scan. | Proof/scenario tests passed `29`; browser selection tests passed `9`; current helper package already covers release proof classification, scenario reduction/replay, and selection snapshots. | keep no-change | supervision rescan |
| workflow-slowdown-skill-repair-001 | 13 | slate-automation source rule | The loop repeated broad scans, which wastes context and can hide the useful proof. | Patched `.agents/rules/slate-automation.mdc`; ran `pnpm install`; verified `.agents/skills/slate-automation/SKILL.md` mirror; ran focused agent-native review. | Source and mirror contain the new large-root `rg` preflight rule; docs audit still passed; review found no parity issue. | keep | supervision rescan |
| selection-oracle-coverage-audit-001 | 14 | slate-react / plite-browser / Playwright | Selection oracles are only useful if they cover the real bug classes the user keeps catching manually. | Exact owner scan; `.tmp/plite/packages/plite-react`: `bun test:vitest test/selection-reconciler-contract.test.tsx test/selection-runtime-contract.test.ts test/dom-strategy-and-scroll.test.tsx test/selection-controller-contract.test.ts`. | Coverage owners exist for double-click drag (`plaintext`), right-margin click (`richtext`), blank-gap drag and scroll (`huge-document`), arrows/undo/redo (`richtext`, `plaintext`, `huge-document`), multi-leaf/native double-highlight (`visual-native-selection-smoke`, `plite-browser`), and focused selection contracts passed `108`. | keep no-change | supervision rescan |
| external-issue-ledger-closure-check-001 | 15 | editor-test-harvester / clawsweeper | The supervisor should not restart Lexical/ProseMirror issue-by-issue closure if the closure ledgers are already fully checked. | Header-first TSV counts over `docs/editor-issue-harvester/{lexical,prosemirror}/full/issue-closure-ledger.tsv` and `.tmp/editor-issue-harvester/{lexical,prosemirror}/full/issue-closure-ledger.tsv`. | Durable Lexical `2741` total, `0` unchecked, `0` unchecked relevant; durable ProseMirror `1420` total, `0` unchecked, `0` unchecked relevant; `.tmp` mirrors match. | keep no-change | supervision rescan |
| table-fragment-policy-audit-001 | 16 | slate-plan / slate core fixtures | The open table-fragment row might be a hidden v2 regression or might be upstream policy debt. | Compared `.tmp/plite/packages/plite/test/transforms/insertFragment/of-tables/{merge-into-full-cells,merge-into-empty-cells,merge-cells-with-nested-blocks}.tsx` with `../slate/packages/plite/test/transforms/insertFragment/of-tables/**`. | %%UPSTREAM_PLITE_CAP%% has the same three skipped fixtures and deferred-policy comments; v2 comments correctly mark deferred policy instead of fake coverage. | keep deferred | slate-plan if user wants table policy |
| huge-doc-20k-cross-editor-diagnostic-001 | 17 | slate-ar-perf / benchmark | Huge-doc residual behavior should be measured at 20k blocks before deciding whether to optimize or leave it as bounded debt. | `.tmp/plite`: `CROSS_EDITOR_HUGE_BLOCKS=20000 CROSS_EDITOR_HUGE_ITERATIONS=3 CROSS_EDITOR_HUGE_TYPE_OPS=10 CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_COUNT=5 bun run bench:react:huge-document:cross-editor:local`; artifact schema and summary read. | Passed. Plite virtualized type p95 `24.8ms` vs ProseMirror `141ms` / Lexical `241.1ms`; DOM p95 `155` vs `20001` / `40001`; repeated ShiftDown p95 `23.3ms` vs ProseMirror `16ms` / Lexical `24.9ms`; ShiftUp p95 `23.2ms`; no long tasks. Plite auto middle select p95 `120.3ms`, virtualized middle select `82.8ms`. | keep metrics / quarantine runtime patch | supervision rescan |
| full-check-sweep-001 | 18 | slate-automation / Playwright | Current broad proof should stay green after docs/skill/runtime-helper work; any retry must become an owner, not a buried summary. | `.tmp/plite`: `bun check:full`; then exact Firefox no-retry table-cell drag rerun and `--repeat-each=20` stress; then full Firefox table + visual/native files. | `bun check:full` exited `0`; integration was `1776` passed, `690` skipped, `2` flaky, `0` failed. The two Firefox flakes selected `Huma` instead of `Human`, passed retry, and passed initial focused stress, but the full Firefox table file reproduced `Huma`, proving a real oracle stability owner. | keep proof; repair helper/test intent | dragTextRange oracle repair |
| dragTextRange-oracle-repair-001 | 19 | plite-browser / Playwright | The repeated failure signature came from a shared drag helper, but defaulting all calls to delayed or after-text drags would weaken fast-drag coverage. | Patched `.tmp/plite/packages/plite-browser/src/playwright/index.ts`, `.tmp/plite/playwright/integration/examples/tables.test.ts`, and `.tmp/plite/playwright/integration/examples/visual-native-selection-smoke.test.ts`; ran typecheck, helper tests, full-file Firefox proof, exact repeat stress, call-site slice, and autoreview. | `endAffinity` defaults to `inside`; `settleMs` defaults to `0`; table full-range proofs opt into `endAffinity: after` and `settleMs: 25`. `plite-browser` typecheck passed; selection contracts passed `9`; proof contracts passed `29`; full Firefox table + visual/native files passed `22`, skipped `2`; exact Firefox table/native rows passed `40/40`; helper call-site slice passed `9`, skipped `5`, failed `0`; final autoreview clean. | keep helper option + scoped opt-in tests | supervision rescan |
| post-helper-full-check-sweep-001 | 20 | slate-automation / Playwright | Helper-focused proof can miss broad-suite load interactions, so run the full private-alpha proof after the table oracle repair. | `.tmp/plite`: `bun check:full`; isolated Chromium document-state row with `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 ... --repeat-each=20`; isolated mobile paste row with same repeat shape. | Full proof exited `0` with `1776` passed, `690` skipped, `2` flaky, `0` failed; table and visual/native rows passed; document-state isolated `20/20`; mobile paste reproduced `5/20` failures. | keep broad proof / repair mobile oracle | mobile paste oracle repair |
| mobile-paste-oracle-repair-001 | 21 | Playwright / paste-html | Mobile paste row read block texts immediately after `Enter` + `editor.type('x')`; failure snapshots showed visible `x` while the getter still saw an empty middle block. | Patched `.tmp/plite/playwright/integration/examples/paste-html.test.ts`; ran mobile row `--repeat-each=20` before and after patch; ran full mobile paste file. | Before patch: `5` failures / `20`; after patch: `20/20` pass; affected file passed `67`, skipped `3`, failed `0` with retries disabled. | keep | supervision rescan |
| post-mobile-oracle-full-check-sweep-001 | 22 | slate-automation / Playwright | A focused stale-read oracle repair is not enough; the whole private-alpha browser gate must prove no retry signal remains. | `.tmp/plite`: `bun check:full`. | Full proof exited `0`; integration passed `1778`, skipped `690`, failed `0`, and had `0` flaky. The repaired paste row passed across Chromium, Firefox, and WebKit inside the broad run. | keep | stale-read oracle contract audit |
| stale-read-oracle-contract-audit-001 | 23 | Playwright examples | Mobile paste exposed a test-method bug: some rows asserted model/rendered text immediately after native input, IME, paste, or undo. | Patched `.tmp/plite/playwright/integration/examples/placeholder.test.ts` and `.tmp/plite/playwright/integration/examples/paste-html.test.ts`; ran placeholder file no-retry `--repeat-each=20`; ran paste grep no-retry across Chromium/mobile `--repeat-each=10`. | Placeholder passed `160/160`; paste grep passed `30`, skipped `10`, failed `0`. Patched rows now use `expect.poll`, `editor.assert.blockTexts`, or a polled joined block-text read. | keep | remaining direct state-read audit |
| remaining-direct-state-read-audit-001 | 24 | Playwright examples | The first stale-read patch fixed obvious rows, but direct stable-file state reads after browser/input actions were still present. | Mechanical rewrite in `.tmp/plite/playwright/integration/examples/{document-state,mentions,plaintext,richtext,placeholder}.test.ts`; capped direct-read scan; affected-file Chromium sweep. | `rg` found no remaining direct `expect(await editor.get.modelText|selectedText|text())` in touched stable files. Chromium affected-file sweep passed `183`, skipped `5`, failed `0`. | keep | post-stale-read full proof |
| document-state-focus-oracle-repair-001 | 26 | Playwright / plite-browser | The fresh broad proof repeated the Chromium document-state focus-mutation retry: the focus event inserted content and the commit tag appeared, but direct `editor.root.focus()` sometimes left the editor inactive under suite load. | Patched `.tmp/plite/playwright/integration/examples/document-state.test.ts` to use `editor.focus()` in the two focus-return rows; ran exact flaky row no-retry `--repeat-each=50`; ran whole document-state file no-retry `--repeat-each=10`. | Exact row passed `50/50`; whole file passed `110/110`; both use the first-class plite-browser focus helper instead of direct locator focus. | keep | post-document-state full proof |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| current-tree fast runtime | `.tmp/plite` | `bun check` | N/A | passed lint/typecheck/tests | use as baseline before next packet |
| richtext / plaintext / markdown shortcuts / editable voids / hidden DOM | example routes | exact-file Playwright sweep, Chromium/Firefox/WebKit, no retries, serial workers | desktop engines | `476` passed, `112` explicit skips | next: visual/native and huge-doc scoped proof |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| stable selection-heavy behavior | model assertions in swept specs | native/browser rows covered where supported; unsupported browser rows explicitly skipped | right-margin multi-leaf click, triple-click block, line extension, toolbar selection, selectionchange repair, hidden DOM selection policies | Playwright route proof, no screenshots in this packet | kept; screenshot-specific proof remains next-owner candidate |
| hidden DOM double-highlight | model/native assertions in spec | native selection and projected marker count asserted by spec | visible hidden-DOM drag selection artifact inspected | `test-results/.../hidden-dom-boundary-drag-selection.png` | kept |
| richtext multi-leaf single highlight | model/native assertions in spec | native one-highlight assertion in spec | multi-leaf screenshot artifact inspected in Chromium and WebKit | `test-results/.../richtext-multi-leaf-selection.png` | kept |
| huge-doc staged/virtualized vertical selection | model assertions in huge-doc spec | native text is absent where projected selection owns the off-DOM lane | staged and virtualized repeated ShiftDown/ShiftUp artifacts inspected | `test-results/.../staged-repeated-shift-down-projected-selection.png`, `test-results/.../virtualized-repeated-shift-down-projected-selection.png` | kept |

plite-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| N/A first packet | No repeated browser helper pattern in docs closure. | N/A | N/A | no-change |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| Raw Android/iOS input | raw-device | not run | scoped defer | Current automated proof cannot claim raw native device input without `test-results/release-proof/mobile-device-proof.json`. |
| Playwright/semantic mobile proxy | scoped proof | `bun test:mobile-device-proof` | passed | Scoped proof only; raw Android/iOS still unclaimed. |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| staged/auto/virtualized huge document | typing, Enter, paste, select-all/delete, undo/redo, ShiftUp/Down, scroll, scrollbar buffering, drag geometry | model/native/projection assertions plus screenshots where visual | huge-document desktop Playwright file | passed `58`, skipped `32`, failed `0` |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| broad current-docs/source scan | slate-automation | one noisy `rg` output | Pattern was too broad and included large issue ledgers / benchmark internals. | Enough signal to pick docs claim-width packet. | Use exact path slices and artifact reads for next scans. |
| stable behavior Playwright sweep | Playwright / examples | `13.7m` | Large but intentional cross-browser proof; serial/no-retry made it clean. | `476` passed, `112` skipped, no failures. | Keep; no workflow repair needed beyond exact-file skip audit. |
| huge-document correctness smoke | Playwright / huge-document | `1.3m` | Large-doc proof has many scoped browser skips but no silent project returns. | `58` passed, `32` skipped, no failures. | Keep; run perf only after this green result. |
| full private-alpha proof | Playwright / examples | `21.2m` integration after package guards | Intentional full proof; broad-suite load exposed a Firefox table-cell drag retry. | `1776` passed, `690` skipped, `2` flaky, `0` failed; focused stress isolated the retry. | Keep; repair shared drag helper instead of weakening tests. |
| parallel Playwright proof attempt | slate-automation | one failed command | Two Playwright commands both tried to own `next build` / webServer. | `Another next build process is already running`. | Do not parallelize Playwright commands that share the same webServer/build owner; rerun serially. |
| post-helper full private-alpha proof | Playwright / examples | `21.4m` integration after package/release guards | Intentional broad proof after helper repair; load exposed two retry signals outside the helper patch. | `1776` passed, `690` skipped, `2` flaky, `0` failed; table/native rows passed; document-state isolated clean; mobile paste reproduced. | Keep broad proof; repair the mobile paste oracle and log document-state as broad-suite load-sensitive watchpoint. |
| mobile paste stale-read isolation | Playwright / paste-html | focused repeat + affected file | The immediate getter read raced mobile typing synchronization and failed `5/20`. | Before patch `15/20` pass, after patch `20/20` pass; affected mobile paste file `67` pass / `3` skip. | Keep polling rendered/model text oracle; no runtime patch. |
| post-mobile full private-alpha proof | Playwright / examples | `21.3m` integration after package/release guards | Intentional broad proof to erase the previous retry state after the mobile stale-read oracle repair. | `1778` passed, `690` skipped, `0` flaky, `0` failed. | Keep; continue into stale-read oracle contract audit because the bug class was testing-method drift. |
| broad stale-read audit grep | slate-automation | noisy capped `rg` output | The search mixed harmless baseline reads with post-input assertions and nearly repeated the broad-scan slowdown. | It found useful placeholder and paste rows, but output was too broad. | Repair by using a short-window classifier before any more patches. |
| stale-read mapper regex | slate-automation | one instant script failure | Bad regular expression while mapping changed assertion lines to test names. | No source changed; reran with simpler regex and produced the needed test map. | Keep as local command-shape miss; no skill patch unless repeated. |
| affected stable-file Chromium sweep | Playwright / examples | `4.2m` plus build | Intentional syntax and behavior sanity pass after mechanical oracle rewrite. | `183` passed, `5` skipped, failed `0`. | Keep; now run full private-alpha proof before next packet. |
| post-pressure full private-alpha proof | Playwright / examples | `21.3m` integration after package/release guards | Intentional broad gate after desktop and scoped mobile pressure. | `1778` passed, `690` skipped, `0` flaky, `0` failed. | Keep; continue timed supervision rather than handoff before 8h. |
| visual/native high-repeat pressure | Playwright / visual smoke | `4.9m` plus build | Intentional pressure on the most user-visible prior failure class. | `440` passed, `40` skipped, `0` failed. | Keep; no source repair needed. |
| stable selection gesture high-repeat pressure | Playwright / examples | `7.8m` plus build | Intentional pressure on exact selection gesture rows after visual smoke passed. | `270` passed, `150` skipped, `0` failed. | Keep scoped; no source repair needed. |
| huge-document user gesture high-repeat pressure | Playwright / huge-document | `12.8m` plus build | Intentional pressure on exact rows behind prior huge-document ShiftDown, select-all, scroll, scrollbar, and follow-up typing reports. | `540` passed, `360` skipped, `0` failed. | Keep scoped; no source repair needed. |
| stable-family long-soak pressure | Playwright / examples | `25.8m` plus build | Broad stable editor-family pressure after focused visual/selection/huge-doc packets. | `1890` passed, `306` skipped, `0` failed. | Keep scoped; run final full proof. |
| final full private-alpha proof | Playwright / full gate | `21.9m` integration after package/release/proof guards | Completion proof after the timed floor and all pressure packets. | `1778` passed, `690` skipped, `0` flaky, `0` failed. | Keep; hand off with scoped residual risks. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `plite-browser` Playwright helper `dragTextRange` accepts optional `endAffinity` and `settleMs`; defaults preserve existing fast inside-range drags |
| tests/oracles/browser proof | table full-range drag proofs opt into `endAffinity: after` plus `settleMs: 25`; document-state focus-return rows now use `editor.focus()`; mobile paste row now polls rendered and model block text after Enter+typing; raw richtext focus and shadow-DOM stale reads now use `editor.focus()` / polling; direct `editor.get.selection()` non-null reads now poll in plaintext/inlines/paste/code-highlighting; scenario model/selected-text/last-commit assertions now poll in `plite-browser`; richtext direct `editor.selection.get()` equality checks now poll; kernel trace equality snapshots now poll; dynamic locator text/value, clipboard text, and native-selection text assertions now wait explicitly; stable example sweep passed `476/112`; visual/native smoke passed `22/2`; huge-document correctness passed `58/32`; exact-file skip audits found zero silent project returns; full Firefox table + visual/native files passed `22`, skipped `2`; Firefox table-cell drag retry passed final no-retry `40/40`; helper call-site slice passed `9`, skipped `5`; mobile paste row passed final no-retry `20/20`; affected mobile paste file passed `67`, skipped `3`; fresh full private-alpha proof passed `1778`, skipped `690`, with `0` flaky / `0` failed; placeholder stale-read oracle repeat passed `160/160`; paste stale-read grep passed `30`, skipped `10`; stable-file direct state-read rewrite passed affected Chromium sweep `183/5`; document-state focus-mutation row passed `50/50` and whole document-state file passed `110/110`; raw/shadow repeat passed `80/80`; direct selection read sweep passed `572/92`; richtext selection getter repeat passed `140/20` no-retry; direct trace repeat passed `150/90`; dynamic DOM/clipboard/native selection repeat passed `450/230`; post-dynamic full proof passed `1778/690` with no flakes; focused huge-doc no-retry pressure passed `260/160`; stable desktop family no-retry pressure passed `1890/306`; scoped mobile stable pressure passed `975/855`; post-pressure full proof passed `1778/690` with no flakes; visual/native high-repeat pressure passed `440/40`; stable selection gesture pressure passed `270/150`; huge-document user gesture pressure passed `540/360`; stable-family long-soak pressure passed `1890/306`; final `bun check:full` passed `1778/690` with `0` flaky / `0` failed |
| benchmarks/metrics/targets | strict huge-doc product gate passed twice; latest post-oracle gate: max budget ratio `0.79`, failures `0`, budget failures `0`, type-to-paint p95 `30.6ms`, select-to-paint p95 `57.5ms`, selection-ready p95 `26.2ms`, virtualized DOM p95 `304`, editor elements p95 `15`, long-task p95 `0`; fresh 20k cross-editor diagnostic passed and kept the same tradeoff; focused select-then-type profile reclassified full-wrapper `1.24` as distribution-sensitive; high-sample ShiftDown diagnostic quarantined runtime patch; roadmap claim-width wording updated |
| examples/docs | synced private-alpha readiness, absolute architecture claim, and roadmap tranche 8 to current claim-width state; cut stale migration/release/compat front-door wording from current Plite docs |
| skills/workflow | patched `plite-automation` source rule and generated mirror with concrete large-root `rg` preflight; `pnpm install`, mirror audit, and focused agent-native review passed |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Table-fragment merge policy | Still needs a table policy owner before blessing skipped fixture behavior. | `.tmp/plite/packages/plite/test/transforms/insertFragment/of-tables/**` | keep deferred; do not encode data loss blind |
| 2 | Raw Android/iOS device proof | Raw mobile remains intentionally unclaimed without a real device artifact. | `.tmp/plite/scripts/proof/mobile-device-proof.mjs` | keep scoped unless a device lane exists |
| 3 | Huge-doc residual micro-lanes | Current state treats ShiftDown/select-all/undo residuals as measured follow-ups, not blockers. | `.tmp/plite/tmp/slate-react-huge-document-*benchmark*.json` | reopen only from fresh benchmark/browser evidence |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| table-fragment-merge-policy | API/runtime | What exact table fragment merge semantics should v2 claim? | Current skipped rows fail if unskipped and upstream also skips them. | Table-fragment fixture repair. | Docs, behavior proof, and huge-doc work can continue. | Defer to `plite-plan` with a table-fragment spec. | `.tmp/plite/packages/plite/test/transforms/insertFragment/of-tables/**` |
| raw-mobile-device-artifacts | device proof | Is there a real Appium Android/iOS lane available? | Without a raw artifact, mobile claims stay scoped. | Raw-device claim expansion. | Desktop/browser/contract work can continue. | Keep scoped. | `.tmp/plite/scripts/proof/mobile-device-proof.mjs` |

Findings:
- Previous 8h run closed broad private-alpha gates and left table-fragment
  semantics plus raw mobile proof as claim-width boundaries.
- Current docs had stale wording that called proof-ledger closure pending.
- Parent docs audit and `.tmp/plite` fast runtime gate are green after the
  docs repair.
- Stable behavior sweep is green across richtext, plaintext, markdown
  shortcuts, editable voids, and hidden DOM routes; skipped rows are explicit
  claim-width boundaries, not silent returns.
- Visual/native smoke is green and screenshot artifacts confirm the double
  highlight class is not currently reproduced in the checked lanes.
- Huge-document correctness is green for staged/auto/virtualized rows at the
  current claim width; scoped Firefox/WebKit skips are explicit and not silent.
- Strict huge-document product perf is green. The universal legacy-compare
  diagnostic is not a superiority claim: full wrapper saw worst p95 ratio
  `1.24` on `middleBlockSelectThenTypeMs`, but the focused profiled rerun
  measured ratio `0.91`.
- Cross-editor context supports keeping the current runtime: Plite wins
  type-to-paint and DOM budget by a lot, while start-block repeated ShiftDown
  remains the narrow residual.
- High-sample ShiftDown confirms start-block p95 residual, but command/profiler
  data does not justify a speculative local runtime patch: no long tasks,
  median/p75 are frame-floor-ish, and projection build is about `1.5ms` per
  step.
- API/DX hard-cut contracts are green, and live front-door docs no longer teach
  the stale migration/release/compat framing that contradicted the
  private-alpha current-state claim.
- Mobile proof is correctly scoped: the semantic/proxy guard passes, and no raw
  Android/iOS artifact exists.
- Table-fragment policy remains real policy debt, not a hidden v2 regression:
  upstream Slate has the same three skipped deferred-policy fixtures.
- 20k huge-doc cross-editor data keeps the same tradeoff: Plite virtualized
  wins typing and DOM hard, while ProseMirror wins pure vertical ShiftDown.
- Full private-alpha proof is green after docs/skill packets. The only signal
  was two Firefox table-cell drag rows flaking under the broad suite; both
  passed retry and initial focused stress, but the full Firefox table file later
  reproduced the `Huma` selection, so this was a real oracle stability gap.
- The Firefox table-cell retry was not two independent product failures: both
  rows used `editor.selection.dragTextRange`, which released immediately after
  the terminal drag move and landed inside the final glyph. The helper now has
  optional `endAffinity` and `settleMs`, both preserving the old default fast
  path, and only table full-range proof rows opt into after-text endpoint plus
  `25ms`.
- The fresh post-helper full proof passed table/native rows but exposed two
  non-table retry signals. Chromium document-state isolated clean at `20/20`,
  so keep it as a broad-suite load watchpoint. Mobile paste reproduced at
  `5/20`; failure snapshots showed the `x` rendered while the immediate getter
  still saw an empty block, so this was a stale-read oracle gap.
- The mobile paste row now waits for both rendered block text and model block
  text after Enter + typing. Focused repeat and the affected mobile paste suite
  are clean with retries disabled.
- Fresh broad private-alpha proof after the mobile paste oracle repair is clean:
  `1778` passed, `690` skipped, `0` flaky, `0` failed.
- Placeholder and paste stale-read sibling assertions now use polling or
  `plite-browser` assertion helpers; focused no-retry repeats are clean.
- Direct stable-file `modelText`, `selectedText`, and `text` expectations in
  touched files now poll instead of snapshotting immediately; affected Chromium
  sweep is clean.
- The post-stale-read full check repeated the Chromium document-state
  focus-mutation retry. The failure artifact showed the focus-event mutation
  landed and the commit tag updated, but direct locator focus left the editor
  inactive under broad-suite load. The test now uses the first-class
  `editor.focus()` helper and passes exact-row and whole-file no-retry stress.

Decisions and tradeoffs:
- Keep the docs repair. It removes stale blocker language without widening the
  claim into release, publish, PR, raw-device, or table semantics.
- Do not patch table-fragment runtime without a table policy spec.
- Treat the `112` skipped stable behavior rows as scoped browser proof width,
  not coverage. They do not block the current packet because the exact-file
  audit found zero silent project returns.
- Keep the visual/native packet. Firefox-specific skips are scoped by browser
  selection behavior; Chromium/WebKit cover the double-highlight screenshot
  class directly.
- Perf is legal after this point because huge-document correctness is green in
  the focused desktop smoke.
- Keep current runtime for product perf. Do not patch select-then-type from the
  full-wrapper `1.24` alone because focused profile did not reproduce it as a
  stable gap.
- Do not rearchitect huge-doc from cross-editor data alone. The current
  evidence says keep runtime, track start-block vertical-selection and
  legacy select-then-type as focused diagnostics.
- Quarantine another ShiftDown runtime tweak unless a fresh browser oracle or
  profiler points to a concrete owner beyond frame distribution.
- Keep the API/DX docs patch. Runtime package contracts already enforced the
  hard cuts; the miss was docs language, not code behavior.
- Keep raw mobile as an explicit claim-width boundary. Running the scoped guard
  is useful; calling it raw native input proof would be bullshit.
- Keep table-fragment rows deferred. The upstream fixtures are also skipped and
  explicitly undecided, so coding a v2 answer here would be taste guessing.
- Keep 20k huge-doc metrics and quarantine runtime patch. The measured residual
  is ShiftDown/select p95, not behavior breakage or long-task regression.
- Keep the full-check result, but do not ignore the Firefox retry. Classify it
  as load-sensitive pointer/selection timing unless it repeats in focused
  no-retry proof; leave it as a watchdog item for the next selection flake pass.
- Keep the `dragTextRange` optional endpoint-affinity and settle patch. It
  strengthens the Firefox-sensitive table full-range oracle without weakening
  default fast-drag coverage or changing product behavior.
- Keep the mobile paste oracle patch. It turns a load-sensitive stale read into
  an explicit rendered/model synchronization assertion and avoids hiding the
  behavior behind retries.
- Keep the post-mobile full proof and do not stop. The next owner is the
  repeated testing-method risk: immediate editor-state reads after user input.
- Keep the first stale-read audit patch. Do not bulk-change every direct read;
  classify remaining direct reads by proximity to input mutations first.
- Keep the stable-file direct state-read rewrite. It is an oracle-only change,
  and the affected Chromium sweep is clean.
- Keep the document-state focus repair. The contract being tested is editor
  focus/selection repair, so the oracle should enter through the same
  plite-browser focus helper that waits for handle focus and model selection
  instead of raw Playwright locator focus.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `rg` streamed too much current-doc/source noise | 1 | Use exact paths, capped slices, and artifact summaries | Logged; next scans must be narrower |
| API hard-cut text scan was broad on first pass | 1 | Run repo guard first, then exact live-doc wording scans | Resolved with `bun test:release-discipline`, touched-doc scan, and docs audit |
| plite-browser helper inventory scan streamed huge Playwright output | 1 | Query package helper exports/tests first, then exact helper names | Resolved with package proof commands; should be repaired if repeated again this run |
| `rg` pattern used double quotes around backticks | 2 | Quote shell-metacharacter patterns with single quotes or use `rg -F` | Existing rule already covers it; reruns passed with single quotes / narrow follow-up |
| Vitest ignored non-entrypoint `selection-controller-contract.ts` | 1 | Locate the `*.test.*` wrapper before rerun | Resolved with `test/selection-controller-contract.test.ts`; rerun passed `108` tests |
| issue-ledger parser guessed a missing `classification` column | 1 | Use printed TSV header keys before counters | Resolved with `relevant` + `check` header keys; both durable and `.tmp` ledger counts show zero unchecked |
| `bun check:full` had Firefox table-cell drag retries | 1 | Rerun exact rows and surrounding file order before deciding runtime vs oracle flake | Focused grep stress passed, surrounding Firefox table file reproduced, helper/test oracle repair passed full-file and repeat proof |
| Initial `settleMs` type boundary leaked into the browser-evaluate payload type | 1 | Keep browser-side serialized payload types separate from harness-only options | Autoreview caught it; `settleMs` is omitted from the `Required<Omit<...>>` payload type; `plite-browser` typecheck passed |
| Initial `settleMs` default changed every drag proof into delayed mouseup | 1 | Preserve default fast-drag behavior and opt only the flaky table full-range rows into explicit after-text geometry and settle | Autoreview caught it; helper defaults are `inside` / `0`, table rows pass `endAffinity: after` and `settleMs: 25`, focused proof and final review passed |
| Focused grep stress passed but full Firefox table file still reproduced `Huma` | 1 | Re-run the surrounding file order when a flake came from a broad suite, not only the isolated grep | Resolved by adding explicit `endAffinity: after` for table full-range proofs; full file and repeat stress passed |
| Two Playwright commands ran in parallel and raced on `next build` | 1 | Do not parallelize commands that own the same Playwright webServer / Next build | Reran repeat stress alone; passed `40/40` |
| Post-helper `bun check:full` had two non-table flaky rows | 1 | Isolate each retry with no retries before deciding runtime vs oracle | Document-state passed `20/20`; mobile paste reproduced `5/20` and was repaired |
| Mobile paste row read block text before mobile typing synchronization | 1 | Poll the exact rendered getter and the model block-text assertion after typing | After patch, mobile row passed `20/20`; affected mobile paste file passed `67/3` |
| First stale-read audit grep mixed baseline reads with post-input assertions | 1 | Use a capped short-window classifier before deciding more patches | High-confidence placeholder and paste rows were patched and focused repeats passed. |
| Short-window mapper script had an invalid regex | 1 | Use a simpler literal test-start matcher | Rerun succeeded and produced the affected test-name map. |
| Chromium document-state focus-mutation retry repeated after an earlier isolated pass | 1 | Treat repeated broad-suite retries as oracle owners even when focused proof passed earlier | Direct `editor.root.focus()` was replaced with `editor.focus()`; exact row passed `50/50`, whole file passed `110/110`, and fresh full proof is running. |

Verification evidence:
- `/Users/zbeyens/git/plate-2`: `pnpm docs:plite:audit` passed.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: `bun check` passed lint,
  typecheck, Bun tests `1201` pass / `91` skip, slate-layout `47`, and
  slate-react Vitest `750`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: stable example Playwright sweep
  passed `476`, skipped `112`, failed `0` across Chromium, Firefox, and WebKit.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: exact-file skip audit reported
  `0` silent project returns in the swept specs.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: visual/native selection smoke
  passed `22`, skipped `2`, failed `0`; screenshot artifacts inspected for
  hidden-DOM double-highlight and richtext multi-leaf selection.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: huge-document desktop proof
  passed `58`, skipped `32`, failed `0`; skip audit reported `0` silent
  project returns; staged/virtualized projected-selection screenshots inspected.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: strict huge-document product perf
  gate passed with failure count `0`, budget failure count `0`, max budget
  ratio `0.83`, type-to-paint p95 `32.3ms`, select-to-paint p95 `57.2ms`,
  virtualized DOM p95 `304`, long-task p95 `0`; diagnostic worst legacy-compare
  p95 ratio `1.24`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: cross-editor 5000-block
  diagnostic passed; Plite type-to-paint p95 `24.5/25.3ms` and DOM p95
  `753/155` beat ProseMirror `60.4ms` / `5001` and Lexical `76.6ms` /
  `10001`; start-block repeated ShiftDown remains slower at `21.3/22.7ms`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: focused profiled
  `v2DefaultRenderAuto` legacy-compare showed `middleBlockSelectThenTypeMs`
  current `42.76ms`, legacy `47.13ms`, ratio `0.91`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: high-sample repeated ShiftDown
  diagnostic passed with `50` samples per lane; Plite start p95 `21.9/22.5ms`,
  middle p95 `15.6/15.3ms`, no long tasks; profiler summary read from artifact.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: `bun test:release-discipline`
  passed `432` public surface / hard-cut / escape-hatch / write-boundary /
  rendered-DOM contract tests.
- `/Users/zbeyens/git/plate-2`: exact stale-wording scan on touched live docs
  found no remaining hits for the removed migration/release/compat phrases;
  `pnpm docs:plite:audit` passed.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: `bun test:mobile-device-proof`
  passed scoped mobile proof and reported raw Android/iOS proof requires
  `PLITE_BROWSER_RAW_MOBILE_REQUIRED=1` plus
  `test-results/release-proof/mobile-device-proof.json`; no raw artifact exists.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: `bun --filter plite-browser
  test:proof` passed `29`; `bun --filter plite-browser test:selection` passed
  `9`.
- `/Users/zbeyens/git/plate-2`: `pnpm install` synced `.agents/rules/**` to
  generated skills; `rg -n 'before any \`rg -n\` over more than one large
  root|Never stream a broad helper/test inventory'` found the new rule in both
  source and generated `plite-automation`; focused agent-native review passed.
- `/Users/zbeyens/git/plate-2/.tmp/plite/packages/plite-react`: focused
  selection contracts passed `108` tests across `selection-reconciler`,
  `selection-runtime`, `selection-controller`, and `dom-strategy-and-scroll`.
- `/Users/zbeyens/git/plate-2`: external ledger counts show Lexical
  `2741/2741` checked and ProseMirror `1420/1420` checked in both durable docs
  and `.tmp` mirrors; unchecked relevant count is `0` for both.
- `/Users/zbeyens/git/plate-2`: table-fragment fixture comparison showed v2 and
  upstream Slate share the same three explicit skipped deferred-policy rows.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: 20k cross-editor benchmark
  passed; Plite virtualized type p95 `24.8ms`, DOM p95 `155`, repeated
  ShiftDown p95 `23.3ms`, ShiftUp p95 `23.2ms`, long task p95 `0`; ProseMirror
  type p95 `141ms`, DOM p95 `20001`, repeated ShiftDown p95 `16ms`; Lexical
  type p95 `241.1ms`, DOM p95 `40001`, repeated ShiftDown p95 `24.9ms`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: `bun check:full` exited `0`;
  integration summary was `1776` passed, `690` skipped, `2` flaky, `0` failed.
  The flaky rows were Firefox table-cell drag selection selecting `Huma`
  instead of `Human` under broad-suite load.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: focused Firefox table-cell drag
  rerun with retries disabled initially passed once and `40/40`, but the full
  Firefox table + visual/native file reproduced the table row before final
  helper repair.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: after the final `dragTextRange`
  helper shape, `bun --filter plite-browser typecheck` passed; `bun --filter
  plite-browser test:selection` passed `9`; full Firefox table + visual/native
  files passed `22`, skipped `2`; focused Firefox table-cell drag stress passed
  `40/40`; Chromium/Firefox helper call-site slice passed `9`, skipped `5`,
  failed `0`; `bun --filter plite-browser test:proof` passed `29`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: focused autoreview of the helper
  patch first found two actionable issues, both fixed; final autoreview exited
  clean with no accepted/actionable findings and overall patch correctness
  `0.86`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: post-helper `bun check:full`
  exited `0`; integration summary was `1776` passed, `690` skipped, `2` flaky,
  `0` failed. Table and visual/native rows passed in the fresh full run.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: Chromium document-state retry
  isolated clean with `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run
  playwright playwright/integration/examples/document-state.test.ts
  --project=chromium --grep "keeps focus-event content mutations from breaking
  selection repair" --repeat-each=20`, passing `20/20`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: mobile paste row reproduced before
  repair with `5` failures / `20`; after polling rendered/model text, the same
  no-retry repeat passed `20/20`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: affected mobile paste file passed
  with retries disabled: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run
  playwright playwright/integration/examples/paste-html.test.ts --project=mobile`
  passed `67`, skipped `3`, failed `0`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: fresh post-mobile `bun
  check:full` exited `0`; integration summary was `1778` passed, `690`
  skipped, `0` flaky, `0` failed.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: placeholder stale-read oracle
  proof passed with retries disabled:
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright
  playwright/integration/examples/placeholder.test.ts --project=chromium
  --repeat-each=20` passed `160/160`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: paste stale-read oracle proof
  passed with retries disabled:
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright
  playwright/integration/examples/paste-html.test.ts --project=chromium
  --project=mobile --grep "does not fallback insert after same-plain-text
  native HTML paste|keeps pasted top-level images outside paragraph text"
  --repeat-each=10` passed `30`, skipped `10`, failed `0`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: affected stable-file Chromium
  sweep passed with retries disabled:
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright
  playwright/integration/examples/document-state.test.ts
  playwright/integration/examples/mentions.test.ts
  playwright/integration/examples/plaintext.test.ts
  playwright/integration/examples/richtext.test.ts
  playwright/integration/examples/placeholder.test.ts --project=chromium`
  passed `183`, skipped `5`, failed `0`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: after replacing direct
  document-state locator focus with `editor.focus()`, the exact Chromium
  focus-mutation row passed with retries disabled:
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright
  playwright/integration/examples/document-state.test.ts --project=chromium
  --grep "keeps focus-event content mutations from breaking selection repair"
  --repeat-each=50` passed `50/50`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: whole-file document-state
  sequencing passed with retries disabled:
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright
  playwright/integration/examples/document-state.test.ts --project=chromium
  --repeat-each=10` passed `110/110`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: raw focus and shadow stale-read
  repair proof passed with retries disabled:
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright
  playwright/integration/examples/richtext.test.ts
  playwright/integration/examples/shadow-dom.test.ts --grep "ignores a native
  selection that starts outside the editor and ends inside it|user can type add
  a new line in editor inside shadow DOM" --project=chromium --project=firefox
  --project=webkit --project=mobile --repeat-each=10` passed `80/80`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: direct selection read audit proof
  passed with retries disabled:
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright
  playwright/integration/examples/plaintext.test.ts
  playwright/integration/examples/inlines.test.ts
  playwright/integration/examples/paste-html.test.ts
  playwright/integration/examples/code-highlighting.test.ts --project=chromium
  --project=firefox --project=webkit --project=mobile` passed `572`, skipped
  `92`, failed `0`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: `plite-browser` scenario
  stale-read helper proof passed after polling model, selected-text, undo, and
  last-commit scenario assertions: exact direct helper assertion scan was
  clean; `bun --filter plite-browser typecheck` passed; `bun --filter
  plite-browser test:proof` passed `29`; `bun --filter plite-browser
  test:selection` passed `9`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: richtext direct selection getter
  proof passed with retries disabled:
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright
  playwright/integration/examples/richtext.test.ts --grep "keeps model
  selection when focus moves outside the editor|types at the browser-selected
  end of a block" --project=chromium --project=firefox --project=webkit
  --project=mobile --repeat-each=20` passed `140`, skipped `20`, failed `0`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: full private-alpha proof after
  the oracle rewrites passed: `bun check:full` exited `0`; integration summary
  was `1778` passed, `690` skipped, with no flaky/failure rows.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: direct kernel-trace oracle proof
  passed with retries disabled after converting direct trace equality snapshots
  to polling assertions:
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright
  playwright/integration/examples/inlines.test.ts
  playwright/integration/examples/shadow-dom.test.ts
  playwright/integration/examples/richtext.test.ts --grep "arrow keys skip
  over read-only inline|keeps shadow DOM ArrowLeft movement model-owned inside
  the shadow root|keeps ArrowDown then ArrowRight in the browser-selected
  paragraph|keeps DOM caret synced after ArrowUp across paragraphs|keeps
  selection synchronized after browser word movement|keeps selection
  synchronized after browser line extension" --project=chromium
  --project=firefox --project=webkit --project=mobile --repeat-each=10`
  passed `150`, skipped `90`, failed `0`.
- `/Users/zbeyens/git/plate-2/.tmp/plite`: dynamic DOM/clipboard/native
  selection oracle proof passed with retries disabled after converting locator
  text/value, clipboard text, and native selection text snapshots to waiting
  assertions:
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright
  playwright/integration/examples/plaintext.test.ts
  playwright/integration/examples/inlines.test.ts
  playwright/integration/examples/markdown-shortcuts.test.ts
  playwright/integration/examples/paste-html.test.ts
  playwright/integration/examples/richtext.test.ts
  playwright/integration/examples/placeholder.test.ts
  playwright/integration/examples/check-lists.test.ts
  playwright/integration/examples/editable-voids.test.ts
  playwright/integration/examples/synced-blocks.test.ts --grep "<focused
  changed rows>" --project=chromium --project=firefox --project=webkit
  --project=mobile --repeat-each=10` passed `450`, skipped `230`, failed `0`;
  exact scan now reports only static read-only attribute snapshots.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-12-plite-8h-private-alpha-followup.md`.
- Surface and route/package: broad Plite private-alpha supervision in
  `.tmp/plite`, plus parent Plite docs/skill sources.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: timed 8h
  run; goal clock reached 28,680s before closure; 45 checkpoint loops.
- Behavior gates and visual proof: stable family, scoped mobile, visual/native,
  huge-document gesture pressure, and final `bun check:full` are green at
  claimed width.
- Primary metric baseline/latest/best and stop reason: strict huge-doc product
  gate latest max budget ratio `0.79`, failures `0`, type p95 `30.6ms`,
  select p95 `57.5ms`, long-task p95 `0`; stop because timed floor and final
  proof gate are satisfied, not because work disappeared.
- Bugs fixed and oracles added: no runtime product patch; repaired
  load-sensitive drag, paste, focus, selection, kernel-trace, DOM, clipboard,
  and native-selection test oracles.
- Benchmark/skill/docs repairs: current-state docs and roadmap claim width
  updated; `plite-automation` source rule patched for broad-scan preflight.
- Workflow slowdowns and repairs: broad scans were narrowed; Playwright
  webServer contention was logged; stale-read oracle class was repaired instead
  of accepting retry-backed green.
- Changed list: filled in the changed-list table above.
- Needs your attention: table-fragment merge policy, raw-device mobile proof,
  and narrow huge-doc micro-lane tradeoffs.
- Stopping checkpoints to unblock: table-fragment merge policy and raw mobile
  device artifacts.
- Accepted deferrals and residual risks: raw Android/iOS unclaimed,
  table-fragment merge semantics deferred, ProseMirror still wins pure
  start-block vertical ShiftDown p95.
- Next owner: user handoff.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Loop 45, docs/claim-width, stable behavior, visual/native, huge-document correctness, perf, API/DX, skill repair, selection-oracle coverage, issue-ledger closure, table-fragment policy audit, 20k huge-doc diagnostics, dragTextRange oracle repair, stale-read oracle repair, high-repeat pressure, and final full private-alpha proof kept; goal clock reached 28,680s. |
| Where am I going? | Hand off to the user. |
| What is the goal? | Run an 8h Plite automation followup without early handoff, closing or queuing packets with proof. |
| What have I learned? | Runtime gates are green/scoped; docs claim-width state was stale; stable example skips are explicit claim boundaries. |
| What have I done? | Patched private-alpha readiness docs, proved docs + fast runtime gates, ran stable behavior, inspected visual/native proof, ran huge-doc correctness, strict product perf, cross-editor diagnostics, API/DX hard-cut audit, scoped mobile proof, plite-browser helper proof, workflow-slowdown skill repair, selection-oracle coverage, external-ledger closure, table-fragment policy audit, 20k huge-doc diagnostics, full-check sweeps, geometry-aware `dragTextRange` oracle repair, stale-read oracle repairs, high-repeat pressure packets, and final `bun check:full`. |
| What changed in the checkpoint plan? | Added, reprioritized, and kept 45 loops through `final-full-private-alpha-proof`; all active packets have keep/defer/quarantine decisions and no dirty speculative runtime packet remains. |

Timeline:
- 2026-06-12T00:32:49.561Z Goal plan created.
- 2026-06-12T00:38:00Z Private-alpha proof-ledger docs repaired; docs audit
  and `.tmp/plite` `bun check` passed.
- 2026-06-12T00:52:00Z Stable example sweep passed `476/112` across
  Chromium/Firefox/WebKit; exact-file skip audit found zero silent project
  returns.
- 2026-06-12T00:55:00Z Visual/native smoke passed `22/2`; screenshot artifacts
  inspected for hidden-DOM double-highlight and multi-leaf richtext selection.
- 2026-06-12T00:58:00Z Huge-document desktop correctness passed `58/32`;
  staged/virtualized projected-selection artifacts inspected.
- 2026-06-12T01:00:00Z Strict huge-document product perf gate passed; roadmap
  stale universal diagnostic ratio patched from `0.77` to current `1.24`.
- 2026-06-12T01:01:00Z Cross-editor huge-doc diagnostic passed; roadmap updated
  with current Plite/ProseMirror/Lexical typing, DOM, and ShiftDown metrics.
- 2026-06-12T01:03:00Z Focused select-then-type profile did not reproduce the
  full-wrapper `1.24` as a stable regression; current ratio was `0.91`.
- 2026-06-12T01:05:00Z High-sample cross-editor repeated ShiftDown diagnostic
  confirmed start-block p95 residual but no safe runtime patch owner.
- 2026-06-12T01:09:00Z API/DX hard-cut packet passed package contracts and cut
  stale migration/release/compat wording from live front-door docs.
- 2026-06-12T01:11:00Z Scoped mobile proof passed; raw Android/iOS remained
  intentionally unclaimed without a raw proof artifact.
- 2026-06-12T01:13:00Z Initial `plite-browser` proof/scenario and browser
  selection helper tests passed before the later table-drag oracle repair.
- 2026-06-12T01:16:00Z Repeated broad-scan slowdown repaired in
  `plite-automation` source rule; `pnpm install`, mirror audit, and focused
  agent-native review passed.
- 2026-06-12T01:18:00Z Selection-oracle coverage audit found exact current
  owners for the main user-sensitive selection gestures; focused
  `plite-react` selection contracts passed `108`.
- 2026-06-12T01:20:00Z Durable and `.tmp` Lexical/ProseMirror issue-closure
  ledgers showed zero unchecked rows.
- 2026-06-12T01:22:00Z Table-fragment open risk compared against upstream Slate;
  both trees carry the same three skipped deferred-policy fixtures.
- 2026-06-12T01:23:00Z 20k cross-editor huge-doc diagnostic passed and recorded
  the current Plite/ProseMirror/Lexical tradeoff.
- 2026-06-12T01:47:00Z `bun check:full` exited `0`; two Firefox table-cell
  drag rows flaked under broad-suite load but passed retry.
- 2026-06-12T01:49:00Z Focused Firefox table-cell drag no-retry proof passed
  once, then passed initial `40/40`; full Firefox table file later reproduced
  the same `Huma` failure, invalidating the isolated-grep closure.
- 2026-06-12T02:08:00Z Patched shared `dragTextRange` helper with optional
  `endAffinity` and `settleMs`, kept defaults `inside` / `0`, and opted table
  full-range proofs into `after` / `25ms`; package proof, full-file browser
  proof, repeat stress, helper call-site proof, and final autoreview passed.

Open risks:
- Raw Android/iOS/device proof remains unclaimed unless a raw-device lane runs.
- Table-fragment merge semantics remain policy debt.
- Huge-document residual micro-lanes remain narrow follow-ups unless fresh
  evidence proves a concrete owner.
- Fresh universal huge-doc diagnostic `1.24` on select-then-type was not stable
  in focused rerun; keep as benchmark distribution watch item.
- Cross-editor start-block ShiftDown remains slower than ProseMirror/Lexical in
  p95, despite Plite winning typing and DOM budget.
- More ShiftDown tweaks are quarantined unless a fresh profiler/browser oracle
  identifies a concrete owner.
- Firefox table-cell drag selection had broad-suite retries under load; helper
  repair is kept, but the only remaining risk is whether another broad
  full-suite run ever reproduces under heavier load.
