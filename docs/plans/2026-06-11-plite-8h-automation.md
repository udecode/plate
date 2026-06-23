# plite-8h-automation

Objective:
Automate Plite private-alpha closure for a minimum 8h timed run; close,
queue, or block all packets with evidence before handoff.

Goal plan:
docs/plans/2026-06-11-plite-8h-automation.md

Template:
docs/plans/templates/slate-automation.md

Primary template:
docs/plans/templates/slate-automation.md

Applied packs:
- none

Automation source:
- type: user-invoked `plite-automation`
- prompt / link: `[$slate-automation] 8h`
- surface / route / package: broad Plite private-alpha supervision; pick
  highest-value owner from current evidence, not a user-routed narrow surface.
- invocation mode: timed mode
- minimum runtime / deadline: start 2026-06-11 18:23:51 CEST; target minimum
  runtime 8h; do not hand off before 2026-06-12 02:23:51 CEST unless the user
  interrupts or a hard blocker leaves no autonomous work.
- completion threshold summary: after the 8h minimum, current packet has a
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
  and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-11-plite-8h-automation.md`
  passes.

Verification surface:
- Parent repo: plan/source audits and final
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-11-plite-8h-automation.md`.
- Plite runtime: focused package tests, Playwright route proofs, Browser
  screenshots/geometry checks, and benchmark commands chosen by the active
  checkpoint from `.tmp/plite`.
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
- target_deadline: 2026-06-12 02:23:51 CEST
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 130
- current_checkpoint: final-supplemental-proof
- current_checkpoint_status: done
- next_checkpoint: final-docs-audit-and-check-complete
- goal_status: active

Current verdict:
- verdict: closeout-ready after final plan audit and autogoal checker
- confidence: stable desktop behavior, visual/native selection smoke, promoted
  text-range click helper, huge-document correctness, current huge-document
  benchmark health, API/DX current-state audit, scoped mobile claim-width,
  workflow output-budget repair, generated stress proof, public hard-cut
  contracts, table-fragment policy probe, fast validation, cross-editor
  huge-doc benchmark expansion, repeated mobile claim-width proof, and
  `plite-browser` proof/selection contract lanes, parent docs audit, and
  helper-backed visual/native smoke, full huge-document desktop refresh, and
  huge-document skip-boundary audit, and huge-document route-control visual
  proof, fast validation after the route-control patch, and query-controls full
  desktop sweep, patched huge-document full desktop rerun, and route-proof
  command slowdown skill repair, parent docs audit, and query-control
  arbitrary-value pattern audit, stable clipboard/paste behavior sweep, image
  query fixture readiness, WebKit triple-click native-selection export,
  `plite-browser` drag endpoint repair, advanced stable desktop examples,
  advanced visual/native spot proof, huge-document full desktop rerun,
  huge-document vertical command-cost audit, force-render trim packet, fast
  validation, post-autoreview stable replay, post-autoreview visual/native
  smoke, generated stress, public proof contracts, full private-alpha gate,
  focused Firefox flake repeat, final strict visual/native smoke, final fast
  runtime check, supplemental release-discipline, and second Firefox focused
  repeat are green/scoped
- next owner: final docs audit and `check-complete`
- keep / revert / quarantine call: keep richtext selection repair packet; keep
  sidecar-notification micro-packet; keep image query remount/readiness packet;
  keep WebKit triple-click DOM export packet; keep refined `dragTextRange`
  endpoint packet; keep small force-render trim for projected large-doc vertical
  selection; keep sync-selection split for projected view-selection repair;
  reject the blunt `right + 1` helper experiment; residual huge-doc bulk restore
  and larger vertical projection/listener cost remain quarantined
- reason: Firefox model-owned composition input now preserves model/native caret
  after same-leaf click typing, remaining stable examples passed
  Chromium/Firefox/WebKit, visual/native screenshot smoke passed with
  no-double-highlight assertions, the repeated text-path click geometry is now
  a `plite-browser` helper, huge-document behavior/scrollbar/refocus smoke
  passed, current huge-document benchmark metrics have no long-task red flag,
  public API/docs stale-language audit found no active alias/compat code and
  repaired one proof-map wording, scoped mobile proof prevents proxy/raw claim
  confusion and reconfirmed raw-device proof is absent, `plite-browser`
  proof/selection contract tests passed after helper promotion, the API/docs
  broad-search slowdown was repaired in
  `plite-automation`, generated stress passed targeted and full Chromium
  suites, public hard-cut contracts passed after explicit proof-harness
  inventory classification, table fragment policy probe confirmed the upstream
  skipped policy row is not safe to bless blind, `.tmp/plite` `bun check` passed,
  parent docs audit passed, cross-editor 5k benchmark ran against Plite,
  ProseMirror, and Lexical, the view-selection decoration key-stability packet
  reduced huge-doc repeated Shift+Down render fanout without reopening
  visual/native selection bugs, the image query fixture now remounts by query
  case and waits on case-specific text, WebKit triple-click paste now proves
  native selected text before paste, and the Firefox table drag flake was
  repaired in the shared browser helper without overselecting inline links.
  The force-render trim keeps the projected vertical large-doc path from asking
  `Editable` for an extra generic render after the view-selection store is
  already written; it reduced one Plite auto repeated ShiftDown render sample
  from `6` to `5`, but did not materially close the p95 or command-cost gap
  versus ProseMirror/Lexical. The sync-selection split keeps model-owned guard
  and programmatic selectionchange marking while skipping DOM selection sync only
  for projected large-doc vertical movement; it modestly lowers some command
  samples but visible paint remains bounded by frame/projection/listener work.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-11-plite-8h-automation.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-automation | done | P0 | Copy prompt requirements and read north-star before implementation. | Requirement rows complete; active goal created; timed minimum recorded. | update |
| status | slate-automation | done | P0 | Read active plan, latest prompt, north-star, `docs/plite/agent-start.md`, recent plan state, and current evidence without proactive branch hygiene. | Current state recorded from `agent-start`, scoreboard, roadmap, and prior 8h plan. | update |
| gap-scan | slate-automation | done | P0 | Identify the highest-value Plite private-alpha gap because the prompt supplied no narrower surface. | First owner: contributor-facing example parity / claim-width cleanup, now closed. | update |
| example-parity-claim-width | slate-automation / Playwright | done | P1 | `example-parity-matrix.md` named stale open rows from source-diff heuristics. | All live open rows closed or explicitly cut/extended/recovered with proof; table-fragment policy remains separate. | update |
| scroll-into-view-parity-claim-width | slate-automation / docs | done | P1 | Matrix claimed deleted scroll-into-view example/test were current open owners. | Current registry lacks the example/test; git history shows deletion in `f6dfd994`; package scroll proof passed; docs patched. | keep |
| shadow-dom-parity-oracle-repair | Playwright / docs | done | P1 | Matrix marked shadow-dom open because old diff stats made the current API wrapper look like a rewrite, and the Playwright row used `return` fake-greens. | Converted browser/project-gated returns to explicit `test.skip(...)`; desktop Chromium/Firefox/WebKit shadow DOM file passed `18`, skipped `3`; parity matrix upgraded to recovered. | keep |
| styling-parity-proof-repair | Playwright / docs | done | P1 | Matrix marked styling open because old diff stats treated current `usePliteEditor` syntax as a rewrite, and the test had un-awaited load-state calls. | Awaited load-state calls, ran desktop Chromium/Firefox/WebKit styling proof (`7` passed, `2` explicit skips), and upgraded parity matrix to recovered. | keep |
| markdown-preview-oracle-repair | Playwright / docs | done | P1 | Matrix marked markdown-preview open because old source-diff stats saw a rewrite, and the Playwright test only proved text insertion. | Current source is the v2 decoration-source owner over the legacy Prism behavior; oracle now checks rendered preview classes before and after editing; desktop proof passed `3`. | keep |
| code-highlighting-oracle-repair | Playwright / docs | done | P1 | Matrix marked code-highlighting open from source-diff stats even though the row is intentional v2 value; current proof lacked the legacy language-retoken invariant. | Added CSS retoken-after-language-change proof; desktop full file passed `48`, skipped `6`; parity matrix upgraded to extended. | keep |
| markdown-shortcuts-skip-repair | Playwright / docs | done | P1 | Matrix marked markdown-shortcuts open from source-diff stats, and the Playwright file had silent mobile `return` rows. | Converted mobile returns to explicit skips; current v2 extension proof passed `51` desktop tests; parity matrix upgraded to extended. | keep |
| tables-parity-policy-split | Playwright / docs | done | P1 | Matrix marked tables open from source-diff stats, but the example is a deliberate conservative v2 table editing surface; package table-fragment merge semantics are a separate policy checkpoint. | Desktop table example proof passed `48`; parity matrix upgraded to extended; table-fragment policy remains queued. | keep |
| fake-green-preflight-skill-repair | slate-automation / agent-native-reviewer | done | P0 | Repeated Playwright fake-green `return` rows were found despite the rule already banning them. | Patched source rule to require an upfront `rg` scan; ran `pnpm install`; generated mirror audited; agent-native review found no parity/actionability issue. | keep |
| batch-validation | Plite / docs | done | P0 | After example/test/docs/skill changes, prove the batch is coherent before routing next owner. | `pnpm docs:plite:audit` passed; `.tmp/plite` `bun check` passed lint/typecheck/unit/Vitest. | keep |
| huge-doc-residual-caveats | slate-ar-perf | done | P1 | Previous run left narrow residual caveats: select-all-delete undo p95 and repeated vertical Shift+Down deltas. | Fresh staged benchmark: Shift+Down still green; undo-delete p95 still ~64ms; safe micro-owner plateau recorded. | quarantine |
| huge-doc-history-sidecar-notify-packet | slate-react | done | P1 | Undo-delete profiler showed duplicate `plite-view-selection` projection builds during document-changing history undo. | Added silent sidecar restore for document-changing history batches in both history entrypoints; focused contract and adjacent tests passed; staged benchmark reduced projection build count 2 -> 1 but p95 stayed 64.5 -> 64.3ms. | keep |
| huge-doc-bulk-history-restore-cost | slate-ar-perf / slate-react | plateau | P1 | After sidecar duplicate removal, undo-delete cost is still dominated by replace-children/history restore, next-snapshot, notify-listeners, and node-source projection build. | Code read found no safe local shortcut: root-level restore honestly needs full snapshot/index and document-wide selection projection. Route future work to broader projection protocol planning, not constant tweaking. | quarantine |
| stable-editor-behavior-sweep | Playwright / plite-browser | done | P0 | Timed supervision still has runtime remaining and north-star prioritizes behavior/oracles over perf. | Richtext desktop full matrix passed after repair; remaining stable examples desktop sweep passed `259`, skipped `53`; `.tmp/plite` `bun check` passed. | update |
| stable-richtext-selection-repair | slate-react / Playwright | done | P0 | Richtext full desktop proof exposed Firefox model/native caret drift after same-leaf click typing and a Chromium toolbar mark click regression from an over-broad mouse-down intent patch. | Package contracts passed (`143` adjacent Vitest, `48` selection Vitest, `28` Bun selection-controller); focused Chromium/Firefox regression proof passed; full richtext desktop matrix passed `256`, skipped `71`. | keep |
| stable-editor-remaining-examples-sweep | Playwright / slate-react | done | P0 | Richtext is green, but the broad stable sweep must reprove other stable examples after runtime selection changes. | Fake-green preflight found explicit skips and normal helper returns only; desktop sweep for plaintext, markdown-shortcuts, editable-voids, custom-placeholder, hidden-content-blocks, and DOM coverage passed `259`, skipped `53`; `.tmp/plite` `bun check` passed. | keep |
| visual-native-selection-screenshot-smoke | Playwright / plite-browser | done | P0 | Behavior tests are green, but browser-visible selection claims still need last-mile visual/native proof after the selection repair. | Added durable visual smoke with screenshot attachments and no-double-highlight assertions for richtext caret, plaintext backward selection, placeholder empty caret, and hidden DOM boundary drag; desktop proof passed `11`, skipped `1`. | keep |
| plite-browser-text-range-click-promotion | plite-browser | done | P1 | Richtext regression proof and visual smoke duplicated manual DOM range midpoint/click geometry. | Added `editor.dom.clickTextRange({ path, startOffset, endOffset, xAffinity })`; migrated duplicated specs; focused desktop proof passed `14`, skipped `1`; `.tmp/plite` `bun check` passed. | keep |
| table-fragment-merge-policy | slate-plan / slate package | queued | P2 | Remaining explicit package fixture skips are table-fragment merge semantics; current unskipped behavior drops source-cell text and upstream also skips them. | Queue as stopping checkpoint unless a safe policy owner emerges. | add |
| behavior-proof | slate-ar-stabilize | done | P0 | Prove stable editor behavior before perf. | Concrete behavior rows passed: stable editor sweep, broad selection/history/navigation replay, hidden DOM replay, markdown/code sweep, full huge-document desktop refresh, generated stress, and advanced stable desktop refresh. | consolidate |
| oracle-repair | slate-patch / tdd | done | P0 | Add missing native/visual/model oracles for found gaps. | Concrete oracle repairs were kept: richtext triple-click native text/current-block proof, visual/native multi-leaf/no-double-highlight proof, scheduler contract, table/image readiness fallout proofs, and benchmark distribution/profiler artifact repair. | consolidate |
| visual-proof | Browser / Playwright | done | P0 | Prove visible editor behavior and native selection. | Visual/native screenshot smoke passed after scheduler repair (`22` passed, `2` skipped) and huge-document route screenshot/control proof passed earlier with route-control fix. | consolidate |
| plite-browser-promotion | plite-browser | done | P1 | Promote repeated browser proof into reusable API/helper. | Path-range click proof promoted to `editor.dom.clickTextRange`; focused desktop proof and `bun check` passed. | update |
| mobile-claim-width | slate-automation | done | P1 | Separate raw-device proof from viewport proof. | `bun test:mobile-device-proof` passed scoped proof; raw Android/iOS remains unclaimed because `test-results/release-proof/mobile-device-proof.json` is absent. | keep |
| mobile-claim-width-recheck | slate-automation | done | P1 | Timed supervision should not let scoped mobile proof drift into raw-device language before handoff. | `ls test-results/release-proof` showed the release-proof artifact directory is absent; `bun test:mobile-device-proof` passed scoped proof and repeated the raw-artifact requirement. | keep |
| huge-document-smoke | slate-ar-stabilize | done | P1 | Smoke huge-doc correctness without broad architecture work. | Focused huge-document behavior smoke passed `11`, skipped `4`; scrollbar/refocus smoke passed `14`, skipped `4`. | keep |
| huge-document-perf-benchmark-health | slate-ar-perf | done | P1 | Correctness smoke is green; timed supervision should now check whether benchmark metrics are current/honest before optimizing. | Staged keyboard benchmark and current browser trace ran; no long-task p95 red flag; cross-editor expansion is queued because sibling ProseMirror/Lexical builds are missing. | keep |
| cross-editor-huge-doc-benchmark-expansion | slate-ar-perf | done | P2 | Cross-editor comparison is useful only when sibling editor builds are present. | Required sibling dist outputs were present; 5k/2-iteration benchmark ran. Plite typing and DOM budget beat ProseMirror/Lexical, but repeated Shift+Down has render fanout and is slower. | keep |
| huge-doc-vertical-selection-render-fanout-probe | slate-ar-perf / slate-react | done | P1 | Cross-editor metrics showed Plite repeated Shift+Down at `22.8-27.1ms` with `13-14` renders vs ProseMirror/Lexical about `16ms` with `0` renders. | Replaced endpoint-derived view-selection decoration keys with stable segment keys; contract proves extending selection wakes only the changed runtime buckets; focused Vitest, package typecheck, huge-doc keyboard Playwright, visual/native smoke, and benchmark passed. Latest 5k/2-iteration metrics: staged middle repeated Shift+Down `27.1ms -> 14.4ms`, render count `13 -> 6`; virtualized middle `22.8ms -> 22.2ms`, render count `14 -> 7`; staged start remains about `22.5ms`. | keep |
| huge-doc-selection-breadth-fallout-proof | slate-ar-perf / Playwright | done | P1 | Stable segment keys change decoration identity and must prove broad selection actions still behave and stay bounded, especially select-all/delete/undo and long projected selections. | Focused Chromium fallout proof passed: staged repeated Shift+Down, staged 10k select-all/delete/typing/paste/undo, virtualized select-all/delete/typing/undo/redo, and virtualized repeated Shift+Down/Up all green (`4` passed). | keep |
| current-tree-coherence-audit | slate-automation / slate-react | done | P0 | The run has accumulated runtime/tests/docs/skill changes; before choosing more optimization, audit for stale experiments, dirty half-patches, docs/API mismatch, and orphan tests. | Diff of the latest view-selection packet is only stable segment keys plus the runtime-bucket contract; `rg` found no leftover sharding experiment names. Broader unrelated parent dirty state remains ignored by instruction. | keep |
| huge-doc-benchmark-projection-profiler-honesty | slate-ar-perf / benchmark | done | P1 | The vertical fanout owner was visible only after manually scraping profiler summaries; future benchmark artifacts should expose projection-store/view-selection profiler buckets directly. | Added `projectionProfilerSummary`, `viewSelectionProfilerSummary`, `shiftDownProjectionProfilerSummary`, and `shiftDownViewSelectionProfilerSummary` to cross-editor benchmark samples; short `slateAuto` validation wrote the fields with projection-store/view-selection buckets. | keep |
| visual-native-multi-leaf-selection-oracle | Playwright / plite-browser | done | P0 | Prior selection bugs escaped because model proof did not force real native/visual multi-leaf agreement. | Added a richtext multi-leaf DOM selection screenshot case to visual-native smoke; it asserts model range, selected text, DOM endpoints, and no double highlight. Full desktop matrix passed `14`, skipped `1`. | keep |
| selection-oracle-helper-promotion-audit | plite-browser / Playwright | done | P1 | Repeated model/native selected-text/no-double-highlight assertions should be a first-class browser helper when the pattern repeats. | Extended `assertPliteBrowserSelectionContract` with optional `noDoubleSelectionHighlight`; migrated multi-leaf and backward-selection smoke rows; `bun --filter plite-browser typecheck` passed; visual-native matrix passed `14`, skipped `1`. | keep |
| plite-browser-proof-selection-contracts | plite-browser | done | P1 | Promoted browser helpers should be proven through their package contract lanes, not only through downstream integration specs. | `bun --filter plite-browser test:proof` passed `29`; `bun --filter plite-browser test:selection` passed `9`. | keep |
| docs-and-plan-audit-refresh | slate-automation / docs | done | P0 | Parent durable docs/plan changed throughout the timed run and need a current audit before the next runtime packet. | `pnpm docs:plite:audit` passed. | keep |
| visual-native-helper-fake-green-audit | Playwright / plite-browser | done | P1 | Newly promoted visual/native helper use should not hide skips, early returns, or model-only assertions in proof specs. | Narrow scan of `visual-native-selection-smoke.test.ts` found no silent `return`; skips are explicit mobile/Firefox-scope rows; desktop Chromium/Firefox/WebKit visual smoke passed `14`, skipped `1`. | keep |
| huge-document-full-desktop-refresh | Playwright / slate-react | done | P0 | Huge-document is the user’s most sensitive lane and has seen selection, scrollbar, visual, and perf churn; run the full file, not just greps. | Full desktop `huge-document.test.ts` passed across Chromium/Firefox/WebKit: `58` passed, `32` explicit skips. | keep |
| huge-document-skip-boundary-audit | Playwright / slate-react | done | P1 | A full-file pass with 32 skips is only honest if the skips are scoped browser/native/perf boundaries, not fake-green returns. | `rg` found `22` explicit `test.skip(...)` sites and no early-return skip pattern; skip messages are scoped to mobile exclusion, Chromium keyboard/perf/native/clipboard proof, or desktop scroll/refocus proof. | keep |
| huge-document-user-visible-route-proof | Browser / Playwright | done | P1 | Huge-doc user-visible claims should have a route-level visual sanity proof after full-file tests. | Direct in-app Browser control was unavailable, so local Playwright route proof captured staged/virtualized screenshots and DOM metrics. The first proof exposed `blocks=1200` applying to metrics while the Blocks select visibly showed `2`; patched `site/examples/ts/huge-document.tsx` to include the current URL block count in the select options, added query-controls regression, reran focused desktop proof (`3` passed), and recaptured screenshots showing `1,200` for both staged and virtualized. | keep |
| fast-validation-after-huge-doc-route-control-patch | Plite | done | P0 | The route-control patch touches the example app and Playwright proof; run fast package/site validation before further packets. | `.tmp/plite` `bun check` passed: lint, package/site/root typechecks, Bun package tests (`1201` pass, `91` skip), slate-layout (`47` pass), and slate-react Vitest (`748` pass). | keep |
| query-controls-full-desktop-sweep | Playwright | done | P1 | The focused route-control assertion passed, but query URL controls are a shared example app surface. | Full desktop `query-controls.test.ts` passed across Chromium/Firefox/WebKit: `16` passed, `2` explicit pagination skips. | keep |
| huge-document-full-desktop-rerun-after-route-control-patch | Playwright / slate-react | done | P0 | The kept patch changes the huge-document component; rerun the full huge-document file after the patch, not only query controls. | Patched full desktop `huge-document.test.ts` rerun passed across Chromium/Firefox/WebKit: `58` passed, `32` explicit skips. | keep |
| route-proof-command-slowdown-skill-repair | slate-automation | done | P1 | Route screenshot proof hit avoidable command-context failures (`node` from repo root, `bun --filter ... exec`) and a backtick-containing `rg` audit pattern executed a command. | Patched source rule with route-proof package-context guidance plus shell-metacharacter search quoting guidance; ran `pnpm install`; mirror audit found both rules in source and generated `SKILL.md`; agent-native review: actionable exact cwd/package context and no parity gap. | keep |
| parent-docs-audit-after-route-and-skill-repair | docs / slate-automation | done | P0 | Parent plan/skill files changed after the last docs audit. | Parent `pnpm docs:plite:audit` passed. | keep |
| query-control-arbitrary-value-pattern-audit | site examples | done | P1 | The huge-document screenshot caught URL state applying while a select showed the wrong option. Check whether this pattern exists elsewhere. | Source audit found huge-document was the only bounded-integer query value feeding a fixed `NativeSelect`; pagination numeric query controls are inputs, and other select-backed query controls use string-literal parsers whose values match option sets. No further patch. | keep |
| stable-clipboard-and-query-adjacent-behavior-sweep | Playwright / slate-react | done | P1 | After route-control and query-control work, replay stable clipboard/paste/query-adjacent examples without opening pagination architecture. | Focused desktop sweep over paste-html, hidden/dom coverage copy, editable void paste, code paste, table paste, and multi-root copy/paste passed `231`, skipped `3` explicit browser-scope rows. | keep |
| advanced-stable-examples-desktop-sweep | Playwright / slate-react | done | P1 | Core stable examples are green; broaden to current stable feature examples not covered by the first core set, without opening pagination architecture. | Initial sweep split real owners; those owners were repaired/audited, and the later advanced desktop refresh passed `663`, skipped `42` explicit browser-scope rows. | keep |
| mentions-inline-void-drag-selection-repair | Playwright / slate-react | done | P0 | Advanced sweep exposed a real mentions inline-void drag-selection proof gap, and the spec also had silent browser/mobile `return` gating. | Converted silent returns to explicit skips; removed `draggable` from inline void shells while keeping block void drag behavior; focused Chromium proof passed; full mentions desktop passed `52`, skipped `17`; `surface-contract` passed `31`; `plite-react` typecheck passed. | keep |
| webkit-inline-triple-click-paste-flake-audit | Playwright / slate-react | done | P1 | Advanced sweep failed WebKit inline triple-click paste once, but the serial focused rerun passed. | Serial WebKit focused `--repeat-each=5` passed `5`; treat the full-sweep failure as non-reproduced flake and rerun advanced sweep after the kept mentions patch. | keep |
| managed-playwright-parallel-build-skill-repair | slate-automation | done | P1 | Running two managed `bun run playwright` commands concurrently caused a Next build lock failure. | Patched source rule to serialize managed Playwright builds unless an explicit prebuilt server/baseURL is owned; ran `pnpm install`; mirror audit passed in source and generated skill. | keep |
| advanced-stable-examples-desktop-rerun | Playwright / slate-react | done | P1 | Failed advanced sweep owners were repaired/audited; rerun the advanced desktop sweep to prove no adjacent stable example fallout. | Reruns split image readiness and drag-selection fallout owners; those owners were repaired, and the later advanced desktop refresh passed `663`, skipped `42`. | keep |
| block-void-drag-fallout-repair | slate-react / Playwright | done | P0 | The first inline-void event-order repair fixed mentions but regressed block image drag selection by applying root-before-runtime ordering to all void targets. | Narrowed root-before-runtime mouse-down ordering to inline voids only; focused Chromium image drag proof passed; focused Chromium mentions proof still passed. | keep |
| image-query-fixture-ready-oracle-repair | Playwright / plite-browser | done | P1 | The second advanced rerun failed before drag because the `adjacent-voids` query fixture had not materialized in WebKit; `editor: visible` was too weak for query-selected fixtures. | Added `ready.text` sentinel checks to image tests that depend on `adjacent-voids` or `edge-voids`; WebKit images file passed `23`, skipped `1`; `surface-contract` passed `31`; `plite-react` typecheck passed. | keep |
| advanced-stable-examples-desktop-rerun-after-image-oracle | Playwright / slate-react | done | P1 | Image fixture readiness and block/inline void event-order fallout were repaired; the broad advanced stable sweep needed a clean rerun. | Rerun split the Firefox table drag helper owner; the shared helper was repaired and the later advanced desktop refresh passed `663`, skipped `42`. | keep |
| webkit-inline-triple-click-native-selection-repair | slate-react / Playwright | done | P0 | WebKit triple-click paste had a model/native divergence: model selected the paragraph while native selection could remain on the link word. | Hardened the oracle with native selected-text proof before paste and exported Plite-owned triple-click block selection to DOM; focused WebKit repeat passed `16`, WebKit images+inlines passed `61` with `4` skips, and the broad advanced rerun passed the row under load. | keep |
| plite-browser-drag-text-range-endpoint-repair | plite-browser / Playwright | done | P1 | The broad advanced rerun exposed a Firefox table drag flake where `dragTextRange` released too far inside the final glyph and selected `Huma` instead of `Human`. | Rejected blunt `rect.right + 1` after it overselected Chromium inline-link replacement; kept `rect.right - 0.25`; `plite-browser` typecheck passed; targeted repeat passed `30`, skipped `10`; helper-consumer rows passed `40`, skipped `50`; broad advanced rerun passed `534`, skipped `108`. | keep |
| advanced-stable-examples-desktop-rerun-after-drag-helper-repair | Playwright / slate-react | done | P0 | After query readiness, triple-click export, void event-order, and drag helper fixes, broad advanced stable examples needed a clean final rerun. | Desktop Chromium/Firefox/WebKit advanced sweep passed `534`, skipped `108`, including Firefox table drag and WebKit triple-click paste. | keep |
| fast-validation-after-advanced-stable-packets | Plite | done | P0 | Runtime/helper/test/example changes need a coherent fast repo gate after broad browser proof. | `.tmp/plite` `bun check` passed: lint, package/site/root typechecks, Bun package tests (`1201` pass, `91` skip), slate-layout (`47` pass), and slate-react Vitest (`748` pass). | keep |
| advanced-visual-native-spot-proof | Playwright / plite-browser | done | P1 | The advanced stable packet is behavior-green; now add focused last-mile visual/native proof for the touched visible rows before rotating back to huge-doc/perf. | Added screenshot/native/model proof for adjacent image selection, WebKit triple-click paragraph selection, and table drag full-cell text; visual smoke passed `22`, skipped `2` explicit browser-scope rows. | keep |
| fast-validation-after-visual-spot-proof | Plite | done | P0 | Visual smoke spec changed after the last fast validation, so lint/type/package tests need one more fast gate. | `.tmp/plite` `bun check` passed: lint, package/site/root typechecks, Bun package tests (`1201` pass, `91` skip), slate-layout (`47` pass), and slate-react Vitest (`748` pass). | keep |
| parent-docs-audit-after-advanced-packets | docs / slate-automation | done | P0 | Parent plan changed after advanced repair and visual proof packets. | `pnpm docs:plite:audit` passed. | keep |
| huge-document-full-desktop-refresh-after-selection-packets | Playwright / slate-react | done | P0 | The latest packets changed selection reconciliation, void event ordering, and browser selection helpers; huge-document is the most sensitive user lane and needs a refreshed full desktop proof. | Full desktop `huge-document.test.ts` passed across Chromium/Firefox/WebKit: `58` passed, `32` explicit skips. | keep |
| huge-document-route-visual-refresh-after-selection-packets | Playwright / Browser | done | P1 | Full-file behavior passed, but huge-document needs a route-level visual sanity proof after selection/helper changes. | The full huge-document desktop run captured route screenshots for staged repeated Shift+Down/Up and virtualized repeated Shift+Down selection plus strategy DOM metrics; no double-highlight assertions passed; full file result was `58` passed, `32` explicit skips. | keep |
| huge-document-perf-refresh-after-selection-packets | slate-ar-perf / benchmark | done | P1 | Behavior and route visual proof are green; refresh huge-document perf metrics after the latest selection/helper work before deciding the next optimization owner. | Staged keyboard: ShiftDown p95 `15.6-15.7ms`, ShiftUp `12.1-12.5ms`, repeated ShiftDown `21.3ms`, undo-delete `62.8-65.7ms`, long tasks `0`. Browser trace: type-to-paint p95 `22.8ms`, select-to-paint `56.4ms`, virtualized DOM `304`, auto DOM `950`, long tasks `0`, virtualized selector dispatch `1.8ms`, auto selector dispatch `11.5ms`. | keep |
| cross-editor-huge-doc-perf-refresh-after-selection-packets | slate-ar-perf / benchmark | done | P1 | Local huge-doc metrics are green; refresh Plite/ProseMirror/Lexical comparison so the next optimization owner is based on current evidence. | Cross-editor 5k/2-iteration run passed. Plite auto/virtualized still beat ProseMirror/Lexical on typing and DOM budget, but repeated ShiftDown remains slower: Plite `21.9-23.1ms` with render count `6-7` vs ProseMirror `15.7ms` and Lexical `15.7-15.8ms` with render count `0`. Plite command cost is `5.8-8.6ms` vs ProseMirror `0.7-1.3ms` and Lexical `1.8-3.6ms`. | keep |
| huge-doc-vertical-selection-command-cost-audit | slate-ar-perf / slate-react | done | P1 | Cross-editor comparison now names the residual: vertical selection paint is near frame floor, but Plite command/projection work still costs several ms and triggers 6-7 projected-selection renders. | Artifact audit found the remaining cost in projected view-selection snapshot/projection and sync-selection repair, not React paint alone. Safe experiment selected: avoid generic `Editable` force render only on the projected large-doc vertical path that already writes the view-selection store. | keep |
| huge-doc-vertical-selection-force-render-trim | slate-react | done | P1 | The projected large-doc vertical selection branch wrote the view-selection store and then still requested a generic force render through `selectionSyncRepair`. | Added a `forceRender: false` repair option only for that branch. Contract tests passed `36`; `plite-react` typecheck passed; focused huge-doc Shift proof passed `7`, skipped `8`; full huge-doc desktop rerun passed `58`, skipped `32`. Staged keyboard stayed green; Plite auto repeated ShiftDown render count improved `6 -> 5`, but p95 stayed about `22ms` and virtualized stayed flat. | keep |
| fast-validation-after-force-render-trim | Plite | done | P0 | Runtime and contract changes need a coherent fast repo gate before more packets. | `.tmp/plite` `bun check` passed: lint, package/site/root typecheck, Bun package tests (`1201` pass, `91` skip), slate-layout (`47` pass), and slate-react Vitest (`748` pass). | keep |
| parent-docs-audit-after-force-render-trim | docs / slate-automation | done | P0 | Parent plan changed after the force-render packet and fast gate. | `pnpm docs:plite:audit` passed after this plan update. | keep |
| huge-doc-sync-selection-repair-protocol-spike | slate-ar-perf / slate-react | done | P1 | The local render trim did not close the cross-editor gap; artifact buckets still name sync-selection repair and projected view-selection snapshot/projection as the command-cost owners. | Repair request audit found `sync-selection` conflated source transition/guard, focus/render, and DOM selection sync. The kept split is limited to projected large-doc vertical selection, where view-selection is the visual truth and native selection is intentionally cleared. | keep |
| huge-doc-projected-selection-sync-split | slate-react | done | P1 | Projected large-doc vertical selection already writes view-selection and clears native selection, but still paid generic DOM selection sync work through `sync-selection`. | Added optional `syncDOMSelection: false`; projected vertical movement still marks programmatic selectionchange and model-owned guard. Focused contracts passed (`36` Vitest keyboard, `31` Bun selection-controller/side-effect); `plite-react` typecheck passed; focused huge-doc Shift proof passed `7`, skipped `8`; visual/native smoke passed `22`, skipped `2`; full huge-doc desktop passed `58`, skipped `32`. Metrics: staged single ShiftDown command improved to `5.6ms` / `3.8ms`; cross-editor Plite auto repeated command `5.8/5.3ms`, virtualized `8.1/6.7ms`; visible p95 still about `22-23ms` on start/virtualized and `14.9ms` auto middle. | keep |
| fast-validation-after-sync-selection-split | Plite | done | P0 | Runtime repair protocol and contracts changed; run the fast repo gate before next packet. | `.tmp/plite` `bun check` passed after formatting repair: lint, package/site/root typecheck, Bun package tests (`1201` pass, `91` skip), slate-layout (`47` pass), and slate-react Vitest (`749` pass). | keep |
| parent-docs-audit-after-sync-selection-split | docs / slate-automation | done | P0 | Parent plan changed after the sync-selection packet and fast gate. | `pnpm docs:plite:audit` passed after this plan update. | keep |
| huge-doc-view-selection-projection-fanout-audit | slate-ar-perf / slate-react | done | P1 | The sync-selection split did not close visible p95; remaining metrics point to `plite-view-selection` projection snapshot/build/notify and listener/selector fanout. | Audit found `keydown.request-repair` down to about `0.2ms`; remaining visible cost is projection/listener/frame work. Projection store already notifies only changed runtime IDs, and view-selection extension contracts cap changed buckets at `<=2`; a scoped projection-snapshot protocol would need partial snapshot merge or scoped range projection to avoid dropping still-selected buckets. | quarantine |
| stable-selection-replay-after-sync-selection-split | Playwright / slate-react | done | P0 | The repair protocol changed selection side effects; huge-doc and visual smoke are green, but stable editor selection/history examples should replay before lower-priority work. | Broad desktop stable selection/history/navigation replay passed `223`, skipped `50` across Chromium/Firefox/WebKit after repairing one stale richtext triple-click oracle. | keep |
| richtext-triple-click-current-block-oracle-repair | Playwright / slate-react | done | P0 | Stable replay exposed a stale Chromium-specific expectation after the runtime intentionally exports Plite-owned triple-click block selection to DOM. | Repaired the oracle to assert the current block range and native selected text; focused Chromium/WebKit repeat passed `18`; broad replay passed the row across desktop browsers. | keep |
| dom-repair-window-scheduler-leak-repair | slate-react | done | P0 | Full `bun check` exposed an unhandled Vitest teardown error: DOM repair retry used ambient `requestAnimationFrame` from a Node timer instead of the editor window. | DOM repair queue now schedules microtasks/timeouts/RAF through the editor window; focused scheduler/editable behavior Vitest passed `42`; full `bun check` passed slate-react Vitest `749` with no unhandled error. | keep |
| fast-validation-after-stable-replay-and-scheduler-repair | Plite | done | P0 | Richtext oracle and scheduler runtime/contracts changed after the last fast gate. | `.tmp/plite` `bun check` passed: lint, package/site/root typecheck, Bun package tests (`1201` pass, `91` skip), slate-layout (`47` pass), and slate-react Vitest (`749` pass). | keep |
| parent-docs-audit-after-stable-replay-and-scheduler-repair | docs / slate-automation | done | P0 | Parent plan changed after the replay and scheduler repair packets. | `pnpm docs:plite:audit` passed after this plan update. | keep |
| browser-text-input-caret-repair-replay-after-scheduler | Playwright / slate-react | done | P0 | The scheduler repair is package-green, but it changed how delayed caret/text-input repair work is scheduled in browser runtime. | Focused desktop route replay for browser insertion caret, paste over selection, route remount, IME, follow-up typing, scroll-away typing, and undo caret restore passed `33`, skipped `3` explicit browser-scope rows across Chromium/Firefox/WebKit. | keep |
| huge-document-full-desktop-refresh-after-scheduler-repair | Playwright / slate-react | done | P0 | The scheduler repair touched delayed caret/follow-up typing behavior, and huge-document remains the user-sensitive lane. | Full desktop `huge-document.test.ts` passed across Chromium/Firefox/WebKit: `58` passed, `32` explicit skips. | keep |
| huge-document-benchmark-refresh-after-scheduler-repair | slate-ar-perf / benchmark | done | P1 | Behavior is green after the scheduler repair; refresh staged keyboard and browser trace metrics with a current build before deciding the next optimization/proof owner. | Fresh-build staged keyboard: ShiftDown `15.7ms`, ShiftUp `12.5-13.3ms`, repeated ShiftDown `21.6-21.7ms`, undo-delete `62-68.1ms`, long tasks `0` except content-visibility undo `51ms`; browser trace: max type-to-paint `29ms`, select-to-paint `56.6ms`, virtualized DOM `304`, long tasks `0`. | keep |
| generated-stress-refresh-after-scheduler-repair | plite-browser / Playwright | done | P1 | Behavior, huge-doc, and benchmark proof are green after scheduler repair; refresh generated stress to catch cross-family editing drift. | Full generated Chromium stress passed `23`. | keep |
| public-proof-contract-refresh-after-scheduler-repair | slate / plite-browser | done | P1 | Runtime/test/browser-proof changes can drift public hard-cut and proof-inventory contracts even when no public API was edited. | First `bun test:release-discipline` failed only on classified proof/test inventory drift (`browser-proof-rows:stale` `594 -> 596`, `plite-react-tests:bridge` `45 -> 49`); inventory updated and rerun passed `432`. | keep |
| fast-validation-after-proof-contract-refresh | Plite | done | P0 | Release-discipline inventory contract changed after the last fast gate. | `.tmp/plite` `bun check` passed: lint, package/site/root typecheck, Bun package tests (`1201` pass, `91` skip), slate-layout (`47` pass), and slate-react Vitest (`749` pass). | keep |
| parent-docs-audit-after-proof-contract-refresh | docs / slate-automation | done | P0 | Parent plan changed after the stress, benchmark, public proof, and fast validation packets. | `pnpm docs:plite:audit` passed after this plan update. | keep |
| visual-native-smoke-refresh-after-scheduler-repair | Playwright / plite-browser | done | P1 | Behavior and benchmark gates are green after the scheduler repair, but visible selection/caret claims need screenshot/native proof. | Full desktop `visual-native-selection-smoke.test.ts` passed across Chromium/Firefox/WebKit: `22` passed, `2` explicit skips. | keep |
| advanced-stable-desktop-refresh-after-scheduler-repair | Playwright / slate-react | done | P1 | Core behavior, huge-doc, generated stress, and visual/native smoke are green; refresh the broader advanced stable route class before lower-priority work. | Advanced desktop route sweep passed `663`, skipped `42` explicit browser-scope rows across Chromium/Firefox/WebKit. | keep |
| cross-editor-huge-doc-refresh-after-scheduler-repair | slate-ar-perf / benchmark | done | P1 | Local behavior and benchmark proof are green after the scheduler repair; refresh sibling-editor comparison so remaining perf claims stay fair. | Cross-editor 5k/2-iteration benchmark passed. Plite virtualized repeated ShiftDown is frame-floor-ish at `15.2ms` with DOM `155`; Plite auto start repeated ShiftDown remains the residual at `22.9ms` / command `8.1ms` / render count `5` vs ProseMirror `15.8-16.2ms` and Lexical `16-16.1ms` with render count `0`. Plite still wins typing and DOM budget: virtualized type `16.2-16.3ms`, DOM `154-155` vs ProseMirror type `49ms`, DOM `5001`, Lexical type `75ms`, DOM `10001`. | keep |
| huge-doc-slate-auto-start-vertical-selection-residual-audit | slate-ar-perf / benchmark | done | P1 | Cross-editor refresh narrowed the remaining gap to Plite auto start-block repeated ShiftDown, not virtualized or typing. | Patched cross-editor lane summaries to preserve repeated ShiftDown profiler summaries. `node --check` passed; single-surface validation passed at 1k and 5k. 5k `slateAuto`: startBlock repeated ShiftDown p95 `22.5ms`, command `6.5ms`, render count `5`, no long tasks; middleBlock `14.6ms`. New top-level profiler summaries show projection/view-selection build cost about `14-15ms` across 9 repeated steps and React actual duration p95 `0.4ms`. No safe local runtime owner for another tweak; residual is start/full-DOM paint-frame variance after the command path. | keep benchmark summary repair; quarantine runtime tweak |
| benchmark-profiler-summary-fast-validation | Plite | done | P0 | The cross-editor benchmark script changed after the last fast gate. | First `bun check` failed only on Biome formatting; after the one-line format repair, `.tmp/plite` `bun check` passed lint, package/site/root typechecks, Bun package tests (`1201` pass, `91` skip), slate-layout (`47` pass), and slate-react Vitest (`749` pass). Parent docs audit also passed before the fast-validation row update. | keep |
| full-cross-editor-profiler-refresh | slate-ar-perf / benchmark | done | P1 | The full Plite/ProseMirror/Lexical cross-editor artifact predates the repeated ShiftDown profiler-summary schema repair. | Full 5k/2-iteration cross-editor refresh passed with current profiler-summary schema. Plite keeps the DOM/typing advantage (`753`/`155` nodes vs ProseMirror `5001` and Lexical `10001`; Plite type p95 `24.2-24.4ms` vs ProseMirror `58-64.8ms`, Lexical `66-74.3ms`). Repeated ShiftDown p95 is noisy on 6 samples: Plite auto start `21.8ms`, middle `29.4ms` with one paint-after-command spike; virtualized start `23ms`, middle `14.9ms`; ProseMirror `15.7-16.5ms`; Lexical `15.8-15.9ms`. Command/render/profiler fields stayed bounded, so the residual is still benchmark/paint-distribution sensitive, not a clear runtime owner. | keep refresh; repair output distribution |
| benchmark-output-distribution-repair | slate-ar-perf / benchmark | done | P1 | The full refresh showed p95-only console/metric output can make one delayed paint frame look like a product regression. | Added repeated ShiftDown median, p75, p95, max, and sample count to human-readable output and machine metrics. `node --check` passed and a 1k `slateAuto` focused benchmark smoke passed with the new fields. | keep |
| benchmark-output-fast-validation | Plite / docs | done | P0 | The cross-editor benchmark script changed again after the last fast gate. | `.tmp/plite` `bun check` passed after the output-distribution patch. Parent `pnpm docs:plite:audit` also passed. | keep |
| supervision-backlog-rescan | slate-automation | done | P0 | The active benchmark packet is closed, but the timed minimum has not elapsed. The supervisor must rescan remaining open checkpoints and pick the next highest-value safe owner. | Active goal clock was about `5h17m`, below the 8h minimum. Rescan found no safe runtime bug owner from the latest profiler evidence; picked a workflow/skill repair because p95-only hot-lane output was an avoidable metric miss. | keep |
| benchmark-distribution-skill-repair | slate-automation / agent-native-reviewer | done | P1 | The benchmark packet proved a reusable supervisor lesson: p95-only hot-lane output with tiny samples is unsafe. | Patched `.agents/rules/slate-automation.mdc` to require median/p75/p95/max/sample-count/raw-sample/profiler-bucket evidence before choosing a runtime owner for hot lanes; `pnpm install` regenerated `.agents/skills/slate-automation/SKILL.md`; mirror `rg` audit passed; agent-native review found the loaded skill has the needed context and no parity gap; parent docs audit passed. | keep |
| seed-checkpoint-consolidation | slate-automation | done | P1 | Generic seed rows are still pending even though concrete behavior, visual/native, oracle, mobile, huge-doc, package, benchmark, and skill packets have evidence. | Consolidated behavior-proof, oracle-repair, visual-proof, supervision-mode, and consolidation seed rows from concrete packet evidence. Final-handoff and timed-minimum rows remain active. | keep |
| post-consolidation-docs-audit | docs | done | P0 | The plan changed during seed-row consolidation. | Parent `pnpm docs:plite:audit` passed. | keep |
| timed-supervision-rescan-after-consolidation | slate-automation | done | P0 | Seed rows and benchmark/skill repairs are closed, but the timed minimum still has not elapsed. | Goal clock was about `5h22m`, below the 8h minimum. Rescan found old split/failed-partial rows that were historical after later repairs, so the next safe owner was plan hygiene rather than runtime patching. | keep |
| stale-split-row-cleanup | slate-automation | done | P1 | Old `split` and `failed-partial` rows were still showing up as open even though later repair/proof rows closed them. | Marked advanced stable rerun rows and huge-doc split decision rows as closed historical repair packets, and updated the phase table for oracle/mobile/perf/consolidation status. | keep |
| post-stale-cleanup-docs-audit | docs | done | P0 | The plan changed during stale split-row cleanup. | Parent `pnpm docs:plite:audit` passed. | keep |
| timed-supervision-rescan-after-stale-cleanup | slate-automation | done | P0 | Plan hygiene is clean, but the timed minimum still has not elapsed. | Goal clock was about `5h23m`, below the 8h minimum. Real open rows are accepted residuals: table-fragment policy and huge-doc bulk history restore plateau. Picked a full private-alpha validation sweep to catch hidden regressions before more planning. | keep |
| private-alpha-full-check-sweep | Plite | done | P0 | The run has accumulated runtime, benchmark, Playwright, contract, and skill repairs. A full private-alpha validation sweep is higher value than another blind runtime tweak. | `.tmp/plite` `bun check:full` passed fast checks, release-proof guards, site build, and most integration rows, then failed only two deterministic mobile embeds input-transport rows; one Firefox table drag row was flaky and passed focused no-retry rerun. | split |
| mobile-emulation-input-proof-repair | Playwright / plite-browser | done | P0 | The mobile embeds rows used `page.keyboard.type(...)` in Pixel 5 emulation after DOM/click selection, which reordered typed text and made a scoped mobile row look like a product failure. | Kept desktop `page.keyboard.type(...)` proof, switched only the `mobile` project branch to `editor.insertText(...)`, and verified focused mobile and Chromium rows passed `2/0` each. | keep |
| firefox-table-drag-flake-audit | Playwright / slate-react | done | P1 | Full sweep had one first-attempt Firefox table drag failure selecting `Huma` instead of `Human`, then retry-green. | Focused no-retry Firefox rerun passed `1/0`; classify as sweep flake, not runtime patch. | keep |
| mobile-input-proof-skill-repair | slate-automation | done | P1 | The mobile embeds packet proved a reusable proof-width lesson: mobile emulation is not raw mobile native keyboard input. | Patched `.agents/rules/slate-automation.mdc`; `pnpm install` regenerated `.agents/skills/slate-automation/SKILL.md`; fixed-string mirror audit found the rule in source and generated skill. | keep |
| post-mobile-input-proof-validation | Plite / docs | done | P0 | Tests and skill source changed after the full sweep failure repair. | `.tmp/plite` `bun check` passed and parent `pnpm docs:plite:audit` passed after the mobile input proof repair and skill sync. | keep |
| private-alpha-full-check-rerun-after-mobile-proof-repair | Plite | done | P0 | The previous full sweep failed only because of the now-repaired mobile embeds proof transport plus one classified Firefox flake. | `.tmp/plite` `bun check:full` passed with `1776` passed, `690` skipped, and `2` retry-green flakes: Firefox table drag selected `Huma` once, and WebKit multi-root selection collapse missed one handle wait. Mobile embeds repair stayed green. | keep |
| private-alpha-full-check-flake-focused-repeat | Playwright / plite-browser | done | P1 | The full check rerun had two retry-green flakes; do not patch runtime or helper code unless focused no-retry repeats reproduce. | Focused no-retry Firefox/WebKit repeat over table drag and multi-root runtime passed `20/0`. Classify as residual full-suite load flakes with focused proof, not active runtime bugs. | keep |
| parent-docs-audit-after-full-check-rerun | docs | done | P0 | Parent plan changed after recording the full private-alpha check and flake classification. | `pnpm docs:plite:audit` passed. | keep |
| timed-supervision-rescan-after-full-check-rerun | slate-automation | done | P0 | Full private-alpha check and focused flake repeats are closed, but the 8h minimum is still not elapsed. | Rescan found table-fragment policy and raw-device proof are queued authority/taste boundaries; the best safe measurable owner is huge-document residual metric refresh. | keep |
| huge-doc-residual-benchmark-refresh-after-full-check | slate-ar-perf / benchmark | done | P1 | Full private-alpha behavior is green/scoped; refresh the current huge-document residual metrics instead of speculating or stopping early. | Staged 10k x3: repeated ShiftDown p95 `21.7ms`, command p95 `6.6-7.4ms`, undo-delete p95 `63.2-64.7ms`, long tasks `0` except one content-visibility undo sample at `51ms`. Browser trace: type p95 `17.4ms` auto / `31.1ms` virtualized, select p95 `56.2ms`, DOM `950` auto / `304` virtualized, long tasks `0`. Cross-editor 5k x3: Plite typing/DOM still wins, repeated ShiftDown median `14.5-15ms`, p95 `14.6-22.8ms`, command p95 `5.1-8.3ms`, render p95 `5-7`; ProseMirror/Lexical repeated p95 `15.8-15.9ms` with render `0`. | keep/plateau |
| plite-runtime-autoreview | autoreview | done | P0 | Runtime/test/benchmark changes are non-trivial; review before final closeout instead of waiting for user to ask. | Local autoreview produced 4 accepted findings across three passes: stale pending DOM import after cancelled selectionchange flush, stale model-owned text-input guard after DOM-current handoff, silent view-selection notification during history restore, and huge-document block-label formatting for arbitrary URL values. A final clean rerun was interrupted after about 8.5m with no result and is logged as slowdown, not a clean review. | keep/repair |
| selection-import-cancel-guard-repair | slate-react | done | P0 | Autoreview found cancelled selectionchange handlers could leave `pendingDOMSelectionImport` stuck after stale-composition cancellation. | Added shared cancellation helper that clears pending DOM import; focused runtime contract, adjacent contracts, typecheck, and IME/browser replay passed. | keep |
| native-handoff-text-input-guard-clear | slate-react | done | P0 | Autoreview found DOM-current handoff could leave a stale model-owned text-input guard. | `setEditableModelSelectionPreference` clears the guard when model preference is disabled or browser/repair handoff owns the reason; selection-controller contract and adjacent suites passed. | keep |
| history-view-selection-notify-restore | slate-react | done | P0 | Autoreview found document history restore wrote Plite view selection with `notify: false`, leaving subscribers stale. | Removed silent notification suppression from history and mutation history restore paths; projected-command contract proves subscribers fire on sidecar restore; adjacent suites passed. | keep |
| huge-document-block-label-format-repair | site examples / Playwright | done | P1 | Autoreview found arbitrary `blocks=120` rendered as `,120` in the huge-document Blocks select. | Switched to `Intl.NumberFormat('en-US')`, added query-controls assertion, killed stale Playwright server that was serving an old build, and reran fresh-build Chromium/Firefox/WebKit proof `3/0`. | keep |
| stale-server-and-review-timeout-skill-repair | slate-automation | done | P1 | The formatter proof exposed stale managed Playwright server reuse, and final autoreview produced no result after about 8.5m. | Patched source rule for `reuseExistingServer` freshness and silent-review timeout fallback; `pnpm install` synced generated skill; fixed-string mirror audit passed. | keep |
| post-autoreview-validation | Plite / docs | done | P0 | Runtime, test, example, and skill-rule repairs need deterministic proof because the clean autoreview rerun timed out. | Focused contracts + `plite-react` typecheck passed; fresh-build query-controls desktop proof passed `3`; `.tmp/plite` `bun check` passed with slate-react Vitest `750`; skill mirror audit passed. | keep |
| post-autoreview-stable-selection-replay | Playwright / slate-react | done | P0 | Accepted autoreview fixes touched selectionchange cancellation, native handoff guards, and history/view-selection subscriber notification; replay the broad stable selection/history/IME class. | Fresh-build desktop replay over plaintext, richtext, inlines, mentions, markdown-shortcuts, styling, multi-root, placeholder, and DOM coverage passed `324`, skipped `78` explicit browser-scope rows across Chromium/Firefox/WebKit. | keep |
| post-autoreview-visual-native-smoke-refresh | Playwright / plite-browser | done | P0 | Broad behavior proof is not enough for the user's screenshot-visible selection standard. | Fresh-build visual/native selection smoke passed `22`, skipped `2` explicit Firefox-scope rows across Chromium/Firefox/WebKit, including no-double-highlight rows. | keep |
| post-autoreview-huge-document-history-replay | Playwright / slate-react | done | P0 | History/view-selection notification changed undo/redo and sidecar restore paths; huge-document is the sensitive lane. | Full fresh-build `huge-document.test.ts` passed `58`, skipped `32` explicit browser-scope rows across Chromium/Firefox/WebKit. | keep |
| post-autoreview-huge-document-benchmark-refresh | slate-ar-perf / benchmark | done | P1 | Always-notify history restore could increase undo/select-all and selection metrics even when behavior passes. | Staged 10k x3 stayed stable: repeated ShiftDown p95 `21.7ms`, undo-delete p95 `62.8-63.4ms`, long tasks `0`. Browser trace stayed stable: auto type p95 `19ms`, virtualized type p95 `31.6ms`, select p95 max `60ms`, DOM `950/304`, long tasks `0`. | keep/plateau |
| post-autoreview-generated-stress-refresh | Playwright / plite-browser | done | P1 | Curated examples are green; generated stress should catch mixed selection/paste/undo/IME fallout from the accepted fixes. | `STRESS_SEED=post-autoreview-selection-history PLAYWRIGHT_RETRIES=0 bun test:stress` passed `23` Chromium cases, including huge-document cut, paste-normalize-undo, selection-repair-IME, and IME composition undo. | keep |
| post-autoreview-public-proof-contract-refresh | slate / slate-react / plite-browser | done | P0 | New contracts/tests/browser assertions must not drift public-surface and proof-inventory contracts. | `bun test:release-discipline` passed `432`. | keep |
| post-autoreview-full-private-alpha-gate | Plite | done | P0 | The tree changed after autoreview fixes, so fast checks alone were not enough for private-alpha closure. | `.tmp/plite` `bun check:full` passed with fast checks, release-proof guards, persistent-profile soak, and full integration: `1777` passed, `690` skipped, `1` retry-green Firefox visual-native table-cell drag row. | keep |
| post-autoreview-full-gate-flake-focused-repeat | Playwright / plite-browser | done | P1 | The full gate had one retry-green Firefox table-cell drag selection failure selecting `Huma` instead of `Human`; do not patch runtime unless focused no-retry repeat reproduces. | Fresh-build focused Firefox repeat passed `5/0`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts -g "table cell drag selection includes the full native text range" --project=firefox --repeat-each=5`. | keep |
| final-visual-native-closure-proof | Playwright / plite-browser | done | P0 | Use the remaining timed budget on the highest-value cheap no-code proof: strict desktop visual/native smoke after the full-gate flake repeat. | Fresh-build strict visual/native smoke passed `22`, skipped `2` across Chromium/Firefox/WebKit with no retries. | keep |
| final-fast-runtime-closure-check | Plite | done | P0 | Use the remaining timed budget on the fast private-alpha runtime gate after the final visual/native proof. | `.tmp/plite` `bun check` passed lint, package/site/root typecheck, Bun package tests `1201` pass / `91` skip, slate-layout `47`, and slate-react Vitest `750`. | keep |
| final-supplemental-proof | Plite / Playwright | done | P0 | The active timer was still below 8h after the plan checker; use the final minute on useful proof instead of idle time. | `bun test:release-discipline` passed `432`; second focused Firefox no-retry table drag repeat passed `5/0`. | keep |
| stable-history-selection-cross-browser-sweep | Playwright / slate-react | done | P0 | Undo/redo with selected text is a high-risk model/native drift lane after selection and helper changes. | Focused plaintext/richtext/inlines/mentions/markdown/styling history-selection matrix passed `18`, skipped `12` explicit browser-scope rows across Chromium/Firefox/WebKit. | keep |
| benchmark-and-proof-fast-validation | Plite | done | P0 | Runtime/helper/benchmark/test changes need a coherent fast repo gate before more packets. | `.tmp/plite` `bun check` passed: lint, package/site/root typecheck, Bun package tests (`1201` pass, `91` skip), slate-layout (`47` pass), and slate-react Vitest (`748` pass). | keep |
| stable-editor-hidden-dom-selection-replay | Playwright / slate-react | done | P0 | Stable segment keys affect projected selection rendering, so hidden DOM/materialized selection lanes need replay. | `hidden-content-blocks` plus `dom-coverage-boundaries` desktop Chromium/Firefox/WebKit passed `55`, skipped `5` explicit mobile/browser-native rows. | keep |
| markdown-and-code-selection-regression-sweep | Playwright / slate-react | done | P0 | Markdown shortcuts and code decorations mix selection, undo/redo, retokening, indentation, paste, and navigation. | Full desktop `markdown-shortcuts` + `code-highlighting` passed `99`, skipped `6` explicit browser-specific rows. | keep |
| generated-stress-expanded-selection-history | plite-browser / Playwright | done | P1 | After focused browser sweeps, run seeded generated families around selection, paste, IME, undo, and huge-doc cut to catch replayable edge cases. | `STRESS_SEED=selection-history-2` targeted families passed `8` Chromium stress cases. | keep |
| public-surface-and-proof-contract-refresh | slate / plite-browser | done | P0 | Browser-helper/test proof changes can drift public-surface and proof-inventory contracts. | First `bun test:release-discipline` failed only on `browser-proof-rows:stale` `593 -> 594` from the new visual smoke helper flag; contract inventory updated and rerun passed `432`. | keep |
| huge-doc-cross-editor-refresh-after-benchmark-patch | slate-ar-perf / benchmark | done | P1 | Benchmark artifacts changed, so rerun the full cross-editor comparison and confirm the selection packet is still measured honestly. | Full 5k/2-iteration Plite/ProseMirror/Lexical run passed and wrote the new artifact fields. It had one noisy staged middle repeated Shift+Down p95 spike (`31.7ms`) despite render count staying `6`; focused Plite-only 5k/4-iteration rerun confirmed stable packet metrics: staged middle repeated Shift+Down `14.3ms`, virtualized middle `14.6ms`, render count `6`. | keep |
| api-dx-current-state-audit | slate-ar-quality / slate-plan | done | P1 | With behavior/visual/perf health green, north-star next owner is public API/docs hard-cut consistency. | Narrow docs/source audit found no active package alias/compat owner; repaired proof-map wording to current-state API prose; `surface-contract` passed; `plite-react` path-filter typecheck passed. | keep |
| workflow-output-budget-rule-repair | slate-automation | done | P1 | API/docs audit repeated broad `rg` output flooding despite existing test-scan rules. | Patched source rule with API/docs count/file-first search policy; ran `pnpm install`; mirror audit passed. | keep |
| generated-stress-selection-paste-undo | plite-browser / Playwright | done | P1 | Stable examples and visual smoke are green; next north-star owner is generated stress around paste, undo/redo, selection, Enter bursts, and follow-up typing. | Targeted stress passed `6`; full generated Chromium stress passed `23`; no runtime patch needed. | keep |
| public-surface-hard-cut-contracts | slate / slate-react / plite-browser | done | P1 | API/DX audit should include core public surface and no-compat-alias contracts, not only docs and React surface tests. | First run exposed escape-hatch inventory drift from new browser proof rows; inventory was updated to classify proof-harness growth; `bun test:release-discipline` passed `432`. | keep |
| table-fragment-merge-policy-probe | slate-plan / slate package | done | P2 | Remaining explicit policy queue is table fragment merge semantics; timed mode can at least prove current/upstream behavior before asking. | %%UPSTREAM_PLITE_CAP%% has the same three skipped fixture rows; temporary unskip fails all three in v2; restored skips and focused fixture run passed `3`, skipped `6`. | defer |
| fast-validation-after-contract-updates | Plite / docs | done | P0 | Contract inventory and plan/rule/docs changed after previous `bun check`. | `.tmp/plite` `bun check` passed; parent `pnpm docs:plite:audit` passed. | keep |
| perf-packet | slate-ar-fast / slate-ar-perf | done | P2 | Optimize only after correctness is green. | Current packet was benchmark health, not code optimization; metrics are green/plateau, so keep current runtime and route to API/DX. | keep |
| supervision-mode | slate-automation | done | P0 when timed runtime remains | If backlog looks empty before minimum runtime, predict next useful checkpoint from north-star and evidence. | Runtime was still below the 8h minimum, so the supervisor entered rescan mode and picked benchmark/skill repair instead of handing off. | consolidate |
| consolidation | slate-automation | done | P1 | Move accepted reusable decisions to durable docs/rules. | Accepted reusable benchmark lesson was consolidated into source `.agents/rules/slate-automation.mdc`, synced into generated `SKILL.md`, mirror-audited, and agent-native reviewed. | keep |
| final-handoff | slate-automation | done | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows complete; final audit/check-complete remain commands, not missing plan content. | update |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | pending |
| 0 | update | automation source, thresholds, boundaries, status/gap-scan | user prompt + slate-automation + vision | Convert bare `8h` into a measurable timed supervisor run without inventing a narrow surface. | checkpoint-zero continuing |
| 1 | update/add | status, gap-scan, example-parity-claim-width, huge-doc-residual-caveats, table-fragment-merge-policy | `agent-start`, scoreboard, roadmap, previous 8h plan | Current docs say broad gates are green but contributor-facing parity rows remain open; do not reopen completed ProseMirror #416. | example parity packet opened |
| 2 | update/add | scroll-into-view-parity-claim-width, example-parity-claim-width | current registry, git history, focused package proof, docs audit | `scroll-into-view` same-path example/test are deleted current-state, not an open runtime parity row. | scroll row moved to explicit cut; continue parity backlog |
| 3 | update/add | shadow-dom-parity-oracle-repair, example-parity-claim-width | current/legacy source read, Playwright proof, docs audit | Shadow DOM source is a current API wrapper over the legacy shape, but proof had fake-green returns. | shadow row moved to recovered; continue parity backlog |
| 4 | update/add | styling-parity-proof-repair, example-parity-claim-width | current/legacy source read, Playwright proof, docs audit | Styling source is a current API wrapper over the legacy shape, but proof had async wait slop. | styling row moved to recovered; continue full-rewrite parity backlog |
| 5 | update/add | markdown-preview-oracle-repair, example-parity-claim-width, workflow-slowdown | current/legacy source read, failing stronger oracle, passing repaired Playwright proof, docs audit pending | Markdown-preview source is intentional v2 decoration-source shape, but old proof was blind; broad package `rg` repeated the output-budget miss. | markdown-preview row moved to recovered; continue remaining parity backlog |
| 6 | update/add | code-highlighting-oracle-repair, example-parity-claim-width | current/legacy source read, focused/full Playwright proof | Code-highlighting source is intentional v2 code-line/decorations-source value, but legacy language-retoken coverage was worth preserving. | code-highlighting row moved to extended; continue markdown-shortcuts/tables |
| 7 | update/add | markdown-shortcuts-skip-repair, example-parity-claim-width | current/legacy source read, Playwright proof | Markdown-shortcuts source is intentional v2 extension value; proof had fake mobile returns. | markdown-shortcuts row moved to extended; continue tables |
| 8 | update/add | tables-parity-policy-split, example-parity-claim-width | current/legacy source read, Playwright proof | Tables source is intentional conservative v2 table-editing value; package fragment merge semantics should not be hidden inside example parity. | example parity batch closed; run batch validation then choose next owner |
| 9 | update/add | fake-green-preflight-skill-repair, batch-validation, huge-doc-residual-caveats | recurring workflow miss, rule/mirror audit, docs audit, `bun check` | The same fake-green pattern recurred; example batch is validated and timed mode still has safe backlog. | skill repair kept; route next to huge-doc residual micro-lanes |
| 10 | update/add | huge-doc-history-sidecar-notify-packet, huge-doc-bulk-history-restore-cost | focused unit tests, staged huge-doc benchmark, profiler summaries | Document-changing history undo was doing duplicate view-selection projection work, but removing it did not move paint p95 enough to close the residual. | keep micro-packet; continue with bulk history restore/snapshot/listener owner |
| 11 | update/add | huge-doc-residual-caveats, huge-doc-bulk-history-restore-cost, stable-editor-behavior-sweep | source read of transaction/snapshot/history/projection owners, active goal time read | Remaining 64ms is rooted in honest full root restore + snapshot/index + document-wide projection notification; a smaller dirty-scope shortcut would lie. Timed run still has safe backlog. | quarantine residual micro-lane; rotate to behavior/oracle sweep |
| 12 | update/split | stable-editor-behavior-sweep, stable-richtext-selection-repair, stable-editor-remaining-examples-sweep | Firefox focused repro, Chromium toolbar regression cluster, package contracts, full richtext desktop matrix | Richtext needed real runtime repair, not assertion loosening. The first mouse-down guard fix over-classified clicks and broke toolbar mark click imports, so the checkpoint split into richtext repair done plus remaining stable examples. | keep richtext packet; continue stable example sweep |
| 13 | update/add | stable-editor-behavior-sweep, stable-editor-remaining-examples-sweep, visual-native-selection-screenshot-smoke | fake-green preflight, remaining stable desktop Playwright sweep, `.tmp/plite` `bun check` | The broad stable desktop behavior lane is green after the selection repair, but timed supervision still owes visual/native screenshot proof before moving to lower-priority lanes. | keep remaining stable packet; route next to visual/native selection smoke |
| 14 | update/add | visual-native-selection-screenshot-smoke, plite-browser-promotion | visual smoke red/green, screenshot attachments, no-double-highlight assertions | Behavior green was not enough; the run needed screenshot-backed native/model/displayed-selection proof. The smoke duplicated text-path click geometry, proving a helper owner. | keep visual smoke; route to helper promotion |
| 15 | update/add | plite-browser-text-range-click-promotion, plite-browser-promotion, huge-document-smoke | promoted helper, WebKit failure from center click, x-affinity repair, focused proof, `bun check` | The first helper clicked the range center and WebKit inserted after the character; adding `xAffinity` preserves native geometry intent and makes the API reusable. Timed run still has safe backlog. | keep helper; route next to huge-document smoke refresh |
| 16 | update/add | huge-document-smoke, huge-document-perf-benchmark-health, perf-packet | focused huge-document behavior/scrollbar Playwright smoke | Core huge-document behavior and prior scrollbar/refocus lanes are green across desktop claim-width, so the next legal owner is measured benchmark health, not another behavior tweak. | keep smoke; route to benchmark health |
| 17 | update/add | huge-document-perf-benchmark-health, cross-editor-huge-doc-benchmark-expansion, api-dx-current-state-audit | staged keyboard benchmark, browser trace benchmark, sibling external build probe | Current huge-doc perf has no long-task red flag and no safe local optimization target from this packet; external compare needs sibling builds. Timed supervision still has safe local API/DX work. | keep benchmark health; defer cross-editor expansion; route to API/DX audit |
| 18 | update/add | api-dx-current-state-audit, mobile-claim-width | docs/source stale-language audit, package surface proof, scoped mobile proof | API/DX is current-state clean after one docs wording repair; mobile raw-device claim must be scoped before desktop proof can be summarized honestly. | keep API/DX audit; keep scoped mobile proof |
| 19 | update/add | mobile-claim-width, workflow-output-budget-rule-repair | mobile proof script, missing raw artifact probe, repeated broad `rg` output misses | Raw-device support is intentionally unclaimed without artifacts; repeated broad API/docs scans are avoidable workflow debt. | keep scoped mobile claim; repair automation rule |
| 20 | update/add | workflow-output-budget-rule-repair, generated-stress-selection-paste-undo | source rule patch, `pnpm install`, mirror audit, path-filter package proof | Output-budget repair is mirrored and actionable; timed run still has safe behavior-stress backlog. | keep rule repair; route to generated stress |
| 21 | update/add | generated-stress-selection-paste-undo, public-surface-hard-cut-contracts | fake-green preflight, targeted generated stress, full generated stress | Stress proof is green across paste/undo/selection/IME/void/table/overlay families; API/DX still deserves the core public hard-cut guard. | keep stress; route to public surface contracts |
| 22 | update/add | public-surface-hard-cut-contracts, table-fragment-merge-policy-probe | hard-cut guard failure/read/patch/rerun | Public contract is green after classifying proof-harness escape-hatch growth; table-fragment policy is the next queued semantics gap. | keep hard-cut contracts; route to table policy probe |
| 23 | update/add | table-fragment-merge-policy-probe, fast-validation-after-contract-updates | upstream fixture compare, temporary unskip probe, restored skip proof | Table semantics are real policy debt shared with upstream, and v2 current output fails the skipped expected behavior. Do not bless or patch blind. | defer to `plite-plan`; run fast validation |
| 24 | update/reopen | fast-validation-after-contract-updates, cross-editor-huge-doc-benchmark-expansion | `bun check`, docs audit, active goal timer | Validation is green and 8h minimum still has substantial runway; the prior cross-editor defer was based on missing builds, so a bounded setup attempt is now justified. | keep validation; reopen cross-editor setup |
| 25 | update/add | cross-editor-huge-doc-benchmark-expansion, huge-doc-vertical-selection-render-fanout-probe | cross-editor benchmark artifact, compact metric extract | Cross-editor comparison is no longer blocked and names a specific residual: Plite is faster for typing and DOM budget, but vertical selection fanout is still behind native-heavy baselines. | keep benchmark; route to render-fanout probe |
| 38 | update/add | mobile-claim-width-recheck, plite-browser-proof-selection-contracts | missing raw release-proof artifact dir, scoped mobile proof pass, package proof/selection contract passes | Mobile proof language remains scoped and helper promotion is package-proven, not only integration-proven. | keep mobile scope; keep helper contracts |
| 39 | add | docs-and-plan-audit-refresh | accumulated plan/docs/skill/runtime proof rows | The durable plan has been updated repeatedly and needs a current parent audit before the next runtime packet. | route to docs audit |
| 40 | update/add | docs-and-plan-audit-refresh, visual-native-helper-fake-green-audit | `pnpm docs:plite:audit` | Parent docs audit is green; timed mode still has runtime, so inspect proof-spec honesty next. | keep docs audit; route to visual/native fake-green audit |
| 41 | update/add | visual-native-helper-fake-green-audit, huge-document-full-desktop-refresh | visual-smoke fake-green scan and desktop proof | Helper-backed visual/native proof is honest and green; next high-value runtime owner is broad huge-document file refresh. | keep visual audit; route to huge-doc full refresh |
| 42 | update/add | huge-document-full-desktop-refresh, huge-document-skip-boundary-audit | full huge-document desktop Playwright proof | Huge-doc behavior/perf/scrollbar lanes are broadly green, but 32 skips need claim-width audit before treating the file as complete proof. | keep full refresh; audit skips |
| 43 | update/add | huge-document-skip-boundary-audit, huge-document-user-visible-route-proof | skip/return scan and skip-context read | Huge-doc skips are explicit and scoped; next proof should look at the rendered route surface. | keep skip audit; route to user-visible proof |
| 44 | update/add | huge-document-user-visible-route-proof, fast-validation-after-huge-doc-route-control-patch | route screenshots, DOM metrics, focused query-controls proof | User-visible route proof caught and fixed a real arbitrary URL block-count control mismatch. | keep route-control patch; run fast validation |
| 45 | update/add | fast-validation-after-huge-doc-route-control-patch, query-controls-full-desktop-sweep | `.tmp/plite` `bun check` | Fast repo validation is green after the route-control patch; broaden to shared query-controls file before rotating lanes. | keep validation; run query-controls sweep |
| 46 | update/add | query-controls-full-desktop-sweep, huge-document-full-desktop-rerun-after-route-control-patch | full query-controls desktop proof | Query control surface is green; rerun the full huge-document route file against the patched component. | keep query controls; rerun huge-doc full file |
| 47 | update/add | huge-document-full-desktop-rerun-after-route-control-patch, route-proof-command-slowdown-skill-repair | patched full huge-doc desktop proof | Runtime proof is green; repair the avoidable route-proof command-context slowdown before it repeats. | keep rerun; patch skill rule |
| 48 | update/add | route-proof-command-slowdown-skill-repair, parent-docs-audit-after-route-and-skill-repair | source/mirror audit and agent-native review | Skill repair is mirrored and actionable; parent docs/plan audit should run after the latest parent changes. | keep skill repair; run docs audit |
| 49 | update/add | parent-docs-audit-after-route-and-skill-repair, query-control-arbitrary-value-pattern-audit | parent docs audit | Parent docs/plan checks are green; inspect whether the query-control mismatch is a broader source pattern. | keep docs audit; audit query controls |
| 50 | update/add | query-control-arbitrary-value-pattern-audit, stable-clipboard-and-query-adjacent-behavior-sweep | query parser / select source audit | The route-control mismatch is isolated; rotate back to stable editor behavior. | keep source audit; run stable clipboard/query sweep |
| 51 | update/add | stable-clipboard-and-query-adjacent-behavior-sweep, advanced-stable-examples-desktop-sweep | focused clipboard/paste desktop proof | Clipboard/paste lanes are green; broaden stable feature coverage while staying away from pagination architecture. | keep clipboard sweep; run advanced stable sweep |
| 52 | split/add | advanced-stable-examples-desktop-sweep, mentions-inline-void-drag-selection-repair, webkit-inline-triple-click-paste-flake-audit, managed-playwright-parallel-build-skill-repair | advanced desktop sweep and focused reruns | Advanced stable sweep found one reproducible Chromium mentions inline-void drag gap, one WebKit inline paste one-off failure, and one avoidable managed-Playwright parallel build-lock slowdown. | repair mentions first; audit WebKit flake; patch automation command rule |
| 53 | update/keep | mentions-inline-void-drag-selection-repair | upstream Slate comparison, DOM export probes, focused/full mentions proof, package contract/typecheck | Inline void shells being draggable made native selected text exclude mention labels. Removing inline `draggable` restores Plite-like selection while block voids remain draggable. | keep runtime patch; rerun advanced sweep |
| 54 | update/keep | webkit-inline-triple-click-paste-flake-audit, managed-playwright-parallel-build-skill-repair, advanced-stable-examples-desktop-rerun | WebKit repeat proof, source/mirror skill audit | The WebKit paste failure did not reproduce in 5 serial runs; the managed Playwright parallel build-lock rule is mirrored. | keep flake audit and skill repair; rerun advanced sweep |
| 55 | split/add | advanced-stable-examples-desktop-rerun, block-void-drag-fallout-repair | failed advanced rerun, focused image proof, focused mentions proof | The inline-void mouse-down ordering repair was too broad and changed block image drag targeting. | narrow ordering to inline voids; keep block void drag behavior |
| 56 | split/add | advanced-stable-examples-desktop-rerun, image-query-fixture-ready-oracle-repair, advanced-stable-examples-desktop-rerun-after-image-oracle | failed broad rerun, focused and full WebKit images proof, package contract/typecheck | The second broad rerun failed on a query-selected image fixture before drag, not on product drag behavior; the test needed a stronger fixture-ready gate. | keep oracle repair; rerun advanced sweep again |
| 57 | split/add | advanced-stable-examples-desktop-rerun-after-image-oracle, webkit-inline-triple-click-native-selection-repair, plite-browser-drag-text-range-endpoint-repair | broad advanced rerun plus focused row audit | The image query repair held, but the sweep exposed one real WebKit native-selection oracle gap and one Firefox drag endpoint proof gap. | repair native triple-click export and audit drag helper |
| 58 | update/keep | webkit-inline-triple-click-native-selection-repair | failing hardened oracle, runtime export patch, focused WebKit proof | Model selection alone hid that WebKit native selection could remain on the link word during triple-click paste. | keep runtime/oracle repair; continue drag helper |
| 59 | update/keep | plite-browser-drag-text-range-endpoint-repair | helper endpoint experiment, rejected over-selection proof, targeted repeats, helper-consumer rows | `rect.right + 1` fixed the table endpoint but overselected inline links; `rect.right - 0.25` fixed the Firefox table flake while keeping inline replacement exact. | keep refined helper; rerun advanced sweep |
| 60 | update/add | advanced-stable-examples-desktop-rerun-after-drag-helper-repair, fast-validation-after-advanced-stable-packets | clean broad advanced desktop sweep | Advanced stable examples now pass across Chromium/Firefox/WebKit after all split owners; the changed runtime/helper/test code needs fast repo validation. | keep broad proof; run `bun check` |
| 61 | update/add | fast-validation-after-advanced-stable-packets, advanced-visual-native-spot-proof | `.tmp/plite` `bun check` | Fast repo validation is green; timed mode still has runtime, so add a last-mile visual/native spot proof for the advanced rows just repaired. | keep fast validation; add visual/native spot proof |
| 62 | update/add | advanced-visual-native-spot-proof, fast-validation-after-visual-spot-proof | visual-native smoke proof | Advanced visible rows now have screenshot/native/model proof; the spec changed after the last fast gate. | keep visual proof; rerun `bun check` |
| 63 | update/add | fast-validation-after-visual-spot-proof, parent-docs-audit-after-advanced-packets | `.tmp/plite` `bun check` | Fast validation is green after the visual smoke change; parent plan/docs changed and need an audit. | keep fast validation; run docs audit |
| 64 | update/add | parent-docs-audit-after-advanced-packets, huge-document-full-desktop-refresh-after-selection-packets | parent docs audit | Parent docs audit is green, and timed mode still has runway; rerun the user-sensitive huge-document file after the latest selection/helper repairs. | keep docs audit; run full huge-doc desktop proof |
| 65 | update/add | huge-document-full-desktop-refresh-after-selection-packets, huge-document-route-visual-refresh-after-selection-packets | full huge-document desktop Playwright proof | Huge-document behavior is green after the latest selection/helper changes; add route-level visual proof before rotating owners. | keep full file proof; capture route screenshots/metrics |
| 66 | update/add | huge-document-route-visual-refresh-after-selection-packets, huge-document-perf-refresh-after-selection-packets | full huge-document route screenshots and metrics | Route-level screenshots/DOM metrics are covered by the full file; refresh perf metrics now that behavior and visual proof are green. | keep route visual proof; run huge-doc perf refresh |
| 67 | update/add | huge-document-perf-refresh-after-selection-packets, cross-editor-huge-doc-perf-refresh-after-selection-packets | staged keyboard and browser trace benchmarks | Huge-doc local metrics are green with no long tasks; refresh cross-editor comparison before picking another optimization owner. | keep perf refresh; run cross-editor benchmark |
| 68 | update/add | cross-editor-huge-doc-perf-refresh-after-selection-packets, huge-doc-vertical-selection-command-cost-audit | cross-editor benchmark metrics | Current comparison shows typing/DOM wins but vertical selection remains behind native-heavy editors due command/projection work and 6-7 projected-selection renders. | keep benchmark refresh; audit command cost |
| 69 | split/add | huge-doc-vertical-selection-command-cost-audit, huge-doc-vertical-selection-force-render-trim | benchmark artifact audit, source hot-path read, focused contracts | Command/projection cost is broader than one render, but the projected large-doc vertical path had one safe local over-render: write view-selection store, then request generic force render. | split audit; trim generic force render only for projected vertical path |
| 70 | update/add | huge-doc-vertical-selection-force-render-trim, fast-validation-after-force-render-trim, parent-docs-audit-after-force-render-trim | contracts, typecheck, focused/full huge-doc Playwright, staged/cross-editor metrics, `bun check` | The trim is green and worth keeping as a small render-count win, but it does not close the p95/command-cost gap. Parent plan changed and needs audit before next packet. | keep trim; run parent docs audit |
| 71 | update/add | parent-docs-audit-after-force-render-trim, huge-doc-sync-selection-repair-protocol-spike | parent docs audit, north-star reread, current benchmark residual | Parent audit is green and the 8h minimum still has runway. North-star says not to call perf closed from rerender/locality evidence alone; continue on the named sync/projection protocol residual. | keep docs audit; open protocol spike |
| 72 | split/add | huge-doc-sync-selection-repair-protocol-spike, huge-doc-projected-selection-sync-split | repair request source audit, focused contract tests | `sync-selection` mixed source transition/guard with DOM selection sync. Projected view-selection needs the guard and programmatic marking, but not DOM selection export. | split protocol; try scoped skip-DOM-sync option |
| 73 | update/keep | huge-doc-projected-selection-sync-split | package contracts, typecheck, focused huge-doc Shift proof, visual/native smoke, full huge-doc file, staged/cross-editor/browser trace metrics | The split is behavior-safe and reduces some command-side work, but it does not move visible p95 enough to claim the vertical-selection gap closed. | keep as protocol cleanup; residual projection/listener cost remains |
| 74 | update/add | fast-validation-after-sync-selection-split, parent-docs-audit-after-sync-selection-split | `.tmp/plite` `bun check` | Fast validation is green after runtime/contract changes; parent plan changed and needs audit before next packet. | keep validation; run parent docs audit |
| 75 | update/add | parent-docs-audit-after-sync-selection-split, huge-doc-view-selection-projection-fanout-audit | parent docs audit, elapsed-time check, benchmark residual | Parent audit is green and only about 4h15 of the 8h minimum has elapsed. The next highest-value owner is the remaining projection/listener fanout bucket, not more sync-selection polishing. | keep docs audit; audit projection/fanout owner |
| 76 | update/add | huge-doc-view-selection-projection-fanout-audit, stable-selection-replay-after-sync-selection-split | projection-store source audit, view-selection contracts, cross-editor profiler buckets | The remaining local perf gap is not a safe one-line patch: partial projection snapshots need a designed store protocol. Before leaving the repair split, replay stable selection/history examples. | quarantine architecture owner; run stable selection replay |
| 77 | split/update | stable-selection-replay-after-sync-selection-split, richtext-triple-click-current-block-oracle-repair | broad desktop replay, focused triple-click repeat, current runtime source audit | The replay was green except one stale Chromium-only oracle; source shows current-block triple-click export is the intended behavior and must prove native selected text. | split oracle repair; rerun focused and broad proof |
| 78 | update/keep | richtext-triple-click-current-block-oracle-repair, stable-selection-replay-after-sync-selection-split | focused Chromium/WebKit repeat and broad desktop replay | The repaired oracle passed focused repeat and the full stable selection/history replay passed across desktop browsers. | keep oracle; run fast validation |
| 79 | split/add | fast-validation-after-stable-replay-and-scheduler-repair, dom-repair-window-scheduler-leak-repair | `bun check` failure, stack trace, focused Vitest reproduction | Fast validation exposed a real async scheduler leak: DOM repair retries used ambient RAF and could outlive jsdom teardown. | repair scheduler through editor window; add focused contract |
| 80 | update/add | dom-repair-window-scheduler-leak-repair, fast-validation-after-stable-replay-and-scheduler-repair, parent-docs-audit-after-stable-replay-and-scheduler-repair | focused scheduler Vitest and full `.tmp/plite` `bun check` | Scheduler repair is green and full fast validation passed; parent plan changed and needs audit before the next runtime packet. | keep scheduler repair; run parent docs audit |
| 81 | update/add | parent-docs-audit-after-stable-replay-and-scheduler-repair, browser-text-input-caret-repair-replay-after-scheduler | parent docs audit, north-star supervision scan, route test-name audit | Parent audit passed. Because the scheduler repair affects delayed text-input/caret repair, route-level browser proof should replay adjacent typing, IME, paste, remount, and scroll-away caret rows before lower-priority work. | keep parent audit; run browser scheduler-adjacent replay |
| 82 | update/add | browser-text-input-caret-repair-replay-after-scheduler, huge-document-full-desktop-refresh-after-scheduler-repair | focused desktop route replay | Browser scheduler-adjacent replay passed. The next highest-value proof is full huge-document desktop after the scheduler patch, because huge-doc is the sensitive lane and includes scroll-away/follow-up typing. | keep replay; run full huge-doc desktop |
| 83 | update/add | huge-document-full-desktop-refresh-after-scheduler-repair, huge-document-benchmark-refresh-after-scheduler-repair | full desktop huge-doc Playwright | Full huge-document desktop proof passed after the scheduler repair. Refresh benchmark metrics next with a current build so the perf ledger stays honest. | keep full proof; run benchmark refresh |
| 84 | update/add | huge-document-benchmark-refresh-after-scheduler-repair, generated-stress-refresh-after-scheduler-repair | fresh-build staged keyboard benchmark, browser trace benchmark | Huge-doc metrics remain green/plateau with no long-task red flag after the scheduler repair. Generated stress is the next oracle-hardening lane before lower-priority API/docs sweeps. | keep benchmark refresh; run generated stress |
| 85 | update/add | generated-stress-refresh-after-scheduler-repair, public-proof-contract-refresh-after-scheduler-repair | full generated Chromium stress | Generated stress passed after the scheduler repair. Run public/proof contracts next to catch any hard-cut or proof-inventory drift from new tests/oracles. | keep stress; run release-discipline |
| 86 | update/add | public-proof-contract-refresh-after-scheduler-repair, fast-validation-after-proof-contract-refresh | release-discipline failure/rerun | Release-discipline found only classified inventory drift from new proof/test rows, then passed after updating the contract. Run fast validation because the package contract file changed. | keep proof contract; run fast validation |
| 87 | update/add | fast-validation-after-proof-contract-refresh, parent-docs-audit-after-proof-contract-refresh | `.tmp/plite` `bun check` | Fast validation passed after the proof-contract inventory update. Parent plan changed and needs audit before the next supervision packet. | keep fast validation; run parent docs audit |
| 88 | update/add | parent-docs-audit-after-proof-contract-refresh, visual-native-smoke-refresh-after-scheduler-repair | parent docs audit, north-star evidence hierarchy | Parent docs audit passed. Refresh visual/native smoke next because visible selection proof is a separate green condition from behavior/metric gates. | keep docs audit; run visual/native smoke |
| 89 | update/add | visual-native-smoke-refresh-after-scheduler-repair, advanced-stable-desktop-refresh-after-scheduler-repair | visual/native desktop smoke | Visual/native smoke passed after scheduler repair. Broaden to advanced stable examples next to catch less-core route fallout while the timed run still has runway. | keep visual proof; run advanced stable sweep |
| 90 | update/add | advanced-stable-desktop-refresh-after-scheduler-repair, cross-editor-huge-doc-refresh-after-scheduler-repair | advanced desktop Playwright sweep | Advanced stable routes passed across desktop browsers. Refresh cross-editor huge-doc comparison next so the benchmark ledger stays current after scheduler/runtime proof. | keep advanced sweep; run cross-editor benchmark |
| 91 | update/add | cross-editor-huge-doc-refresh-after-scheduler-repair, huge-doc-slate-auto-start-vertical-selection-residual-audit | cross-editor huge-doc benchmark | Current comparison shows virtualized repeated ShiftDown is close to sibling editors, while Plite auto start-block repeated ShiftDown remains slower. Audit the exact profiler/source owner before another perf patch. | keep comparison; audit auto start residual |
| 92 | update/add | huge-doc-slate-auto-start-vertical-selection-residual-audit, benchmark-profiler-summary-fast-validation | benchmark profiler artifact repair | Repeated ShiftDown raw samples had profiler summaries, but top-level lane summaries dropped them. Preserve those fields, validate at 1k/5k, and quarantine another runtime tweak because current profiler evidence does not identify a safe code owner. | keep benchmark summary repair; run fast validation |
| 93 | update/add | benchmark-profiler-summary-fast-validation, full-cross-editor-profiler-refresh | `.tmp/plite` `bun check` | Fast validation passed after the benchmark script format repair. Refresh the full cross-editor artifact so Plite/ProseMirror/Lexical comparisons use the current profiler-summary schema. | keep fast validation; run full cross-editor refresh |
| 94 | update/add | full-cross-editor-profiler-refresh, benchmark-output-distribution-repair | full cross-editor benchmark refresh | Refreshed full artifact shows p95 sensitivity to one delayed paint frame while command/render/profiler work stays bounded. Repair the benchmark output so the loop reads distribution shape, not only p95. | keep full refresh; repair output |
| 95 | update/add | benchmark-output-distribution-repair, benchmark-output-fast-validation | benchmark output repair smoke | Focused 1k smoke passed and printed median/p75/p95/max/sample-count metrics for repeated ShiftDown. Run fast validation because the benchmark script changed again. | keep output repair; run fast validation |
| 96 | update/add | benchmark-output-fast-validation, supervision-backlog-rescan | fast validation and docs audit | Fast validation and parent docs audit passed after the benchmark output repair. Timed minimum has not elapsed, so rescan backlog and choose the next safe owner. | keep validation; rescan |
| 97 | update/add | supervision-backlog-rescan, benchmark-distribution-skill-repair | backlog rescan | Rescan found the strongest safe owner was workflow repair for noisy hot-lane metrics, not another runtime patch. | patch skill source and sync |
| 98 | update/add | benchmark-distribution-skill-repair, seed-checkpoint-consolidation | skill repair sync and review | Source rule patched, `pnpm install` synced generated skill, mirror audit passed, agent-native review had no parity finding, and docs audit passed. Consolidate stale seed rows next. | keep skill repair; consolidate seeds |
| 99 | update/add | seed-checkpoint-consolidation, post-consolidation-docs-audit | seed row consolidation | Concrete proof rows already covered several generic template seeds; consolidated them without closing final handoff or timed-minimum gates. | keep consolidation; audit docs |
| 100 | update/add | post-consolidation-docs-audit, timed-supervision-rescan-after-consolidation | parent docs audit | Docs audit passed after consolidation. The 8h minimum has not elapsed, so rescan again instead of handing off. | keep audit; rescan |
| 101 | update/add | timed-supervision-rescan-after-consolidation, stale-split-row-cleanup | open-row rescan | Rescan found stale historical split rows, not fresh failures. Cleaned those rows and refreshed the phase table. | keep plan hygiene; audit docs |
| 102 | update/add | post-stale-cleanup-docs-audit, timed-supervision-rescan-after-stale-cleanup | parent docs audit | Docs audit passed after stale split-row cleanup. Continue timed supervision because the 8h minimum has not elapsed. | keep audit; rescan |
| 103 | update/add | timed-supervision-rescan-after-stale-cleanup, private-alpha-full-check-sweep | timed supervision rescan | Only accepted residuals remained after cleanup, and the clock was below 8h. Run a full private-alpha validation sweep to catch hidden regressions after accumulated changes. | run `bun check:full` |
| 104 | split/add | private-alpha-full-check-sweep, mobile-emulation-input-proof-repair, firefox-table-drag-flake-audit | full private-alpha validation | Full sweep found two deterministic mobile embeds rows and one Firefox first-attempt table drag flake. | repair mobile proof transport; classify Firefox with no-retry rerun |
| 105 | update/add | mobile-emulation-input-proof-repair, mobile-input-proof-skill-repair | focused mobile/desktop proof | Mobile embeds rows passed after semantic mobile insert branch; desktop Chromium kept native `page.keyboard.type(...)` and passed. | keep test repair; patch supervisor rule |
| 106 | update/add | mobile-input-proof-skill-repair, post-mobile-input-proof-validation | skill self-repair | Mobile emulation proof-width lesson belongs in `plite-automation`, not only this test. | sync generated skill; run fast validation |
| 107 | update/add | mobile-input-proof-skill-repair, post-mobile-input-proof-validation | generated skill sync and audits | `pnpm install` synced the generated skill; source/generated fixed-string audit found the mobile-emulation rule; docs audit passed. | keep skill repair |
| 108 | update/add | post-mobile-input-proof-validation, private-alpha-full-check-rerun-after-mobile-proof-repair | fast validation | `.tmp/plite` `bun check` passed after the mobile proof repair; the 8h minimum is still not elapsed. | rerun full check |
| 109 | update/add | private-alpha-full-check-rerun-after-mobile-proof-repair, private-alpha-full-check-flake-focused-repeat | full private-alpha validation | `bun check:full` passed all hard gates with `2` retry-green flakes: Firefox table drag and WebKit multi-root runtime. | run no-retry focused repeat before changing code |
| 110 | update/add | private-alpha-full-check-flake-focused-repeat, timed-supervision-rescan-after-full-check-rerun | focused flake repeat | Firefox/WebKit no-retry repeat over both flaky rows passed `20/0`; no helper/runtime patch is justified from this signal. | rescan remaining timed backlog |
| 111 | update/add | private-alpha-full-check-flake-focused-repeat, parent-docs-audit-after-full-check-rerun | plan audit | Parent `pnpm docs:plite:audit` passed after full-check plan updates. | keep plan proof current |
| 112 | update/add | timed-supervision-rescan-after-full-check-rerun, huge-doc-residual-benchmark-refresh-after-full-check | supervision rescan | Goal clock is still below 8h; table-fragment and raw-device are queued boundaries; huge-doc residual metrics are measurable and safe. | run fresh huge-doc residual benchmarks |
| 113 | update/add | huge-doc-residual-benchmark-refresh-after-full-check, plite-runtime-autoreview | benchmark refresh | Fresh staged/browser-trace/cross-editor metrics are stable: no long tasks, Plite keeps typing/DOM wins, residual repeated ShiftDown p95 is plateaued at projection/render-frame cost. | review accumulated runtime/test diff |
| 114 | split/add | plite-runtime-autoreview, selection-import-cancel-guard-repair, native-handoff-text-input-guard-clear, history-view-selection-notify-restore | local autoreview findings | Review found real stale-state and stale-subscriber risks, so split into focused runtime repair packets before final validation. | patch accepted findings and prove with contracts/browser replay |
| 115 | add | huge-document-block-label-format-repair | local autoreview P3 plus failing focused browser proof | Arbitrary URL block values rendered with a leading comma, and the first proof hit stale server output. | patch formatter; rerun on fresh managed Playwright build |
| 116 | add/update | stale-server-and-review-timeout-skill-repair, workflow-slowdown | stale Playwright server proof and silent final autoreview rerun | The loop itself missed two reusable workflow traps: managed Playwright server freshness and unbounded silent review. | patch `plite-automation`, sync generated skill, mirror-audit |
| 117 | update | post-autoreview-validation | focused contracts, typecheck, query-controls proof, `bun check` | Deterministic gates are green after accepted review fixes and skill repair; final clean autoreview rerun timed out, so do not claim review-clean. | keep validated packets; continue timed supervision |
| 118 | reprioritize | timed-supervision-rescan-after-autoreview-validation | active goal clock below 8h | The latest packet is closed but the minimum runtime is not elapsed. | rescan for next safe owner |
| 119 | add/update | post-autoreview-stable-selection-replay, post-autoreview-visual-native-smoke-refresh | broad stable desktop replay | The accepted selection/history fixes survived a 324-pass cross-browser stable replay. Next prove visible/native selection smoke again because behavior proof is not visual proof. | keep replay; run visual/native smoke |
| 120 | update/add | post-autoreview-visual-native-smoke-refresh, post-autoreview-huge-document-history-replay | visual/native smoke | Visual/native smoke is green after the accepted autoreview fixes. The remaining high-value safe owner is huge-document select-all/history replay because history notification and mutation history paths changed. | keep smoke; run huge-doc history replay |
| 121 | update/add | post-autoreview-huge-document-history-replay, post-autoreview-huge-document-benchmark-refresh | full huge-document desktop proof | Huge-document behavior/history proof is green. Benchmark history/selection hot lanes next because always-notify history restore may affect undo/select-all cost. | keep proof; run benchmark refresh |
| 122 | update/add | post-autoreview-huge-document-benchmark-refresh, post-autoreview-generated-stress-refresh | staged/browser trace benchmark refresh | Metrics stayed stable after the history/view-selection fixes. Run generated stress next to catch mixed paste/undo/selection regressions outside curated examples. | keep plateau; run stress |
| 123 | update/add | post-autoreview-generated-stress-refresh, post-autoreview-public-proof-contract-refresh | generated stress | Generated mixed editing stress is green after accepted fixes. Refresh public/proof contracts next because new tests/oracles and browser rows can drift inventory. | keep stress; run proof contracts |
| 124 | update/add | post-autoreview-public-proof-contract-refresh, post-autoreview-full-private-alpha-gate | public/proof contract refresh | Public/proof contracts passed after the accepted fixes. The timed run still has budget and the tree changed since the previous full private-alpha gate, so run `bun check:full`. | keep proof contracts; run full gate |
| 125 | update/add | post-autoreview-full-private-alpha-gate, post-autoreview-full-gate-flake-focused-repeat | full private-alpha validation | `bun check:full` passed all hard gates with `1777` passed, `690` skipped, and one retry-green Firefox table-cell visual/native drag row. | classify retry-green with focused no-retry repeat |
| 126 | update/add | post-autoreview-full-gate-flake-focused-repeat, final-docs-audit-and-check-complete | focused flake repeat | Fresh-build Firefox no-retry repeat passed `5/0`; this is a full-suite load flake, not a runtime/helper patch. | finalize plan audit and check-complete |
| 127 | update/add | final-visual-native-closure-proof, final-docs-audit-and-check-complete | strict visual/native closure proof | Fresh-build no-retry visual/native smoke passed `22`, skipped `2` across Chromium/Firefox/WebKit. | record final proof; rerun docs audit and check-complete |
| 128 | update/add | final-fast-runtime-closure-check, final-docs-audit-and-check-complete | fast runtime closure gate | `.tmp/plite` `bun check` passed after the final visual/native proof. | record final check; rerun docs audit and check-complete |
| 129 | update/add | final-supplemental-proof, final-docs-audit-and-check-complete | supplemental public proof | `bun test:release-discipline` passed `432` while waiting for the 8h active timer. | record supplemental proof |
| 130 | update/add | final-supplemental-proof, final-docs-audit-and-check-complete | supplemental focused flake proof | Second Firefox no-retry focused table drag repeat passed `5/0`; active timer is now above 8h. | final audit and check-complete |

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
| Prompt requirements captured before work | yes | User prompt is only `plite-automation 8h`; explicit requirements captured as timed minimum runtime, broad Plite supervision, dynamic checkpointing, and no early stop. |
| `plite-automation` source rule read | yes | User provided full skill body in prompt; plan uses timed-mode, checkpoint, handoff, and private-alpha rules from it. |
| `vision` read as checkpoint zero | yes | `.agents/skills/vision/SKILL.md` read 2026-06-11 before runtime work. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created active goal for this plan. |
| Invocation mode and timebox recorded | yes | Timed mode, minimum 8h, target deadline 2026-06-12 02:23:51 CEST. |
| Dynamic checkpoint policy accepted | yes | Checkpoint supervisor allows add/update/split/merge/retire/remove/reopen/reprioritize after each loop. |
| Source of truth and allowed workspaces recorded | yes | Boundaries section separates `.tmp/plite` runtime from parent docs/skills. |
| Output budget strategy recorded | yes | Broad scans must use counts/files/slices, exclude generated/raw/noisy trees unless named, and write large audits to artifacts. |
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
      boundaries, and blocked condition are concrete. Evidence: filled sections
      above.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining
      backlog ladder, and supervision-mode fallback are recorded. Evidence:
      timed mode target deadline and blocked/stop rules above.
- [x] Checkpoint supervisor table has been reconciled at least once after the
      initial seed. Evidence: loop 1 added example parity, huge-doc residual,
      and table-fragment policy rows from current docs.
- [x] Each loop ends with a checkpoint mutation decision: add, update, split,
      merge, retire, remove, reopen, reprioritize, or no-change with reason.
- [x] Current-tree/status packet recorded before new runtime patches. Evidence:
      `agent-start`, scoreboard, roadmap, and prior 8h plan read; no runtime
      patch started.
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
      marked N/A with reason. Evidence: local autoreview accepted 4 findings;
      final clean rerun timed out after about 8.5m with no result and is logged
      as a workflow slowdown, not as clean review.
- [x] Agent-native review is run for `.agents/**`, commands, skills, hooks, or
      prompt/tooling changes, or marked N/A with reason. Evidence: latest
      `plite-automation` rule-only patch was source/mirror parity, not UI/action
      parity; `agent-native-reviewer` was loaded and scoped inapplicable.
- [x] Output budget discipline is followed: broad scans are capped or written
      to artifacts instead of streamed. First status scan violated this and is
      logged in Workflow slowdowns/Error attempts; continue with capped slices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | Full private-alpha gate passed `1777/690` with one classified retry-green row; focused no-retry repeat passed `5/0`; earlier focused contracts, behavior, visual/native, benchmark, stress, release-discipline, and `bun check` rows are recorded. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | Checkpoint mutations through loop 118 added, split, consolidated, repaired, and reprioritized rows from proof evidence. |
| Workspace authority proof | yes | Record cwd/tool for each Plite, parent-docs, skill, browser, package, or benchmark proof | Rows distinguish `.tmp/plite` runtime/benchmark commands from parent docs/skill commands. |
| Behavior gates | yes | Run focused stable behavior proof or record scoped defer rows | Stable behavior, selection/history/navigation, hidden DOM, markdown/code, advanced examples, generated stress, and huge-document desktop rows passed. |
| Visual/native selection proof | yes | Record Browser/Playwright/native-selection evidence or scoped blocker | Visual/native smoke and route screenshot rows recorded; Browser plugin unavailable was scoped and Playwright route proof substituted with screenshots/metrics. |
| Missing oracle repair | yes | Add/verify/revert/quarantine oracle packets or record owner defer | Concrete oracle repairs are recorded in kept packet rows; table-fragment policy remains deferred with owner. |
| `plite-browser` promotion | yes | Add/verify helper/API or record queue/defer reason | `clickTextRange` and selection-contract/no-double-highlight helper promotion rows passed package and integration proof. |
| Mobile/raw-device claim width | yes | Run raw-device proof or record that only scoped viewport/browser proof is available | Scoped mobile proof passed; raw Android/iOS remains explicitly unclaimed because raw-device artifacts are absent. |
| Huge-document correctness smoke | yes | Run focused huge-document behavior smoke or record owner defer | Huge-document behavior/scrollbar/full desktop refresh rows passed; perf residuals are separate plateau/benchmark rows. |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | API/DX audit, package typechecks, release-discipline, and repeated `.tmp/plite` `bun check` rows passed. |
| Skill/rule sync | yes | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | Skill repairs were source-patched, synced with `pnpm install`, mirror-audited, and agent-native reviewed. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | Current ledgers are filled through loop 118; update again before final handoff if more packets run. |
| Final lint/check | yes | Run scoped lint/check or record why no code changed | `.tmp/plite` `bun check` passed after autoreview fixes and skill repair; `bun check:full` then passed fast checks and integration with one classified retry-green row; final `bun check` passed again after final visual/native proof. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Output-budget, route-proof command, managed-Playwright serialization, stale Playwright server reuse, silent autoreview timeout, and noisy benchmark-output repairs are recorded. |
| Agent-native review for agent/tooling changes | yes | Load `agent-native-reviewer` and close accepted findings, or N/A | Earlier skill repairs had agent-native review; latest source/mirror rule patch is N/A because the reviewer is UI/action-parity focused and source/mirror audit is the right proof. |
| Autoreview for non-trivial implementation changes | yes | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | Local autoreview produced 4 accepted findings that were patched and verified; final clean rerun timed out silently and is logged as slowdown, not clean. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-11-plite-8h-automation.md` | run after this closeout patch |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | plan created, goal active, prompt requirements captured, north-star read | status |
| Status and current-tree closure | complete | `agent-start`, scoreboard, roadmap, prior plan current-read rows | gap scan |
| Gap scan and scenario matrix | done | Example parity rows selected from current docs and closed with proof or explicit cut | behavior proof |
| Behavior proof | complete | example parity behavior proof complete; richtext desktop passed `256/71`; remaining stable examples passed `259/53`; `bun check` passed | visual/native proof |
| Oracle repair | complete | markdown-preview/code-highlighting/markdown-shortcuts/shadow-dom/styling oracles repaired; richtext selection runtime contracts added/repaired; visual/native and benchmark artifact oracles repaired | visual proof |
| Visual/native proof | complete | durable visual smoke passed `11`, skipped `1`; screenshot attachments plus model/native/displayed-selection no-double-highlight checks | plite-browser promotion |
| plite-browser promotion | complete | promoted repeated text-path click geometry to `editor.dom.clickTextRange`; focused proof passed `14`, skipped `1`; `bun check` passed | huge-document smoke |
| Mobile/raw-device claim width | scoped | scoped proof passed; raw Android/iOS artifacts absent, so raw-device claims remain unmade | huge-document smoke |
| Huge-document correctness smoke | complete | focused behavior smoke passed `11`, skipped `4`; scrollbar/refocus smoke passed `14`, skipped `4` | perf benchmark health |
| Perf/API/docs/skill packets as needed | complete | huge-document benchmark health green/plateau; API/DX audit, benchmark script repair, and skill repairs kept; post-autoreview benchmark refresh stayed green | consolidation |
| Consolidation and review | complete | seed rows consolidated; accepted autoreview findings patched; final clean review rerun timed out and is logged as slowdown, with deterministic gates substituted | final handoff |
| Final handoff and goal-plan check | complete | final plan rows filled; final docs audit and `check-complete` are the last commands before `update_goal` | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| example parity | stale contributor-facing open rows from source-diff heuristic | current Plite examples | source/proof audit first, then focused Playwright only for real gaps | docs/source/test parity and browser proof where changed | done |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| status-001 | 1 | slate-automation | Establish current private-alpha status before touching runtime. | Read `agent-start`, scoreboard, roadmap, prior 8h plan; broad docs scan was too noisy and logged as workflow miss. | No runtime behavior proof yet. | keep | contributor-facing example parity packet |
| parity-scroll-into-view-001 | 2 | slate-automation / docs | Matrix and fork dossier pointed at deleted `scroll-into-view` source/test as live proof. | Patched `docs/plite/ledgers/example-parity-matrix.md` and `docs/plite/ledgers/fork-issue-dossier.md`; verified current registry and deletion commit; ran focused package proof and docs audit. | Package proof: 5 scroll-related `plite-react` tests passed; no browser surface because current example is deleted. | keep | next live parity row |
| parity-shadow-dom-001 | 3 | Playwright / docs | Shadow DOM parity row was open from stale source-diff stats and had project/browser `return` fake greens. | Patched `.tmp/plite/playwright/integration/examples/shadow-dom.test.ts`; patched `docs/plite/ledgers/example-parity-matrix.md`; ran focused Playwright and docs audit. | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/shadow-dom.test.ts --project=chromium --project=firefox --project=webkit`: 18 passed, 3 skipped. | keep | next live parity row |
| parity-styling-001 | 4 | Playwright / docs | Styling parity row was open from stale source-diff stats and had un-awaited load-state calls in proof. | Patched `.tmp/plite/playwright/integration/examples/styling.test.ts`; patched `docs/plite/ledgers/example-parity-matrix.md`; ran focused Playwright and docs audit. | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/styling.test.ts --project=chromium --project=firefox --project=webkit`: 7 passed, 2 skipped. | keep | next full-rewrite parity row |
| parity-markdown-preview-001 | 5 | Playwright / docs | Markdown-preview parity row was open from stale source-diff stats, and the test only checked text containment. | Patched `.tmp/plite/playwright/integration/examples/markdown-preview.test.ts`; patched `docs/plite/ledgers/example-parity-matrix.md`; ran focused Playwright; docs audit pending. | First stronger oracle failed on invented total segment count; repaired to semantic class/text checks; desktop proof passed 3. | keep | next full-rewrite parity row |
| parity-code-highlighting-001 | 6 | Playwright / docs | Code-highlighting parity row was open from stale source-diff stats, and current proof did not prove language change retokened edited code. | Patched `.tmp/plite/playwright/integration/examples/code-highlighting.test.ts`; patched `docs/plite/ledgers/example-parity-matrix.md`; ran focused retoken proof and full desktop file; docs audit pending. | Retoken proof passed 3; full desktop file passed 48 with 6 explicit skips. | keep | next full-rewrite parity row |
| parity-markdown-shortcuts-001 | 7 | Playwright / docs | Markdown-shortcuts parity row was open from stale source-diff stats, and mobile branches returned silently. | Patched `.tmp/plite/playwright/integration/examples/markdown-shortcuts.test.ts`; patched `docs/plite/ledgers/example-parity-matrix.md`; ran full desktop file; docs audit pending. | Full desktop file passed 51; mobile exclusions are explicit skips. | keep | tables parity/policy row |
| parity-tables-001 | 8 | Playwright / docs | Tables parity row was open from stale source-diff stats, but the example proof is strong and the unresolved package fragment semantics are a separate policy owner. | Patched `docs/plite/ledgers/example-parity-matrix.md`; ran full desktop file; docs audit pending. | Full desktop file passed 48; table-fragment merge policy remains queued. | keep | batch verification then next supervisor pick |
| skill-fake-green-preflight-001 | 9 | slate-automation / agent-native-reviewer | Fake-green `return` gates recurred because the rule banned them but did not require a preflight scan. | Patched `.agents/rules/slate-automation.mdc`; ran `pnpm install`; audited `.agents/skills/slate-automation/SKILL.md`; agent-native review of actionability/source-mirror parity passed. | Source and generated mirror match; new instruction gives exact `rg` preflight and classification output. | keep | huge-doc residual micro-lanes |
| validation-example-parity-001 | 9 | Plite / docs | Batch touched Playwright tests, docs, and skill rules. | `pnpm docs:plite:audit`; `.tmp/plite` `bun check`. | Docs audit passed; `bun check` passed lint/typecheck/unit/Vitest. | keep | huge-doc residual micro-lanes |
| richtext-selection-repair-001 | 12 | slate-react / Playwright | Firefox imported stale collapsed DOM selection after same-leaf click typing during model-owned composition input; an initial mouse-down repair over-classified ordinary clicks and broke toolbar mark click imports. | Patched runtime selection/input guard/export paths plus contract tests; ran focused package tests, focused Chromium/Firefox regression proof, and full richtext desktop matrix. | Focused package contracts passed; richtext desktop Chromium/Firefox/WebKit passed `256`, skipped `71`. | keep | remaining stable examples |
| stable-examples-sweep-001 | 13 | Playwright / slate-react | Selection runtime changes could regress plaintext, markdown shortcuts, editable voids, custom-placeholder, hidden-content-blocks, or DOM coverage. | Fake-green preflight over target specs; `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/placeholder.test.ts playwright/integration/examples/hidden-content-blocks.test.ts playwright/integration/examples/dom-coverage-boundaries.test.ts --project=chromium --project=firefox --project=webkit`; `.tmp/plite` `bun check`. | Desktop sweep passed `259`, skipped `53`; `bun check` passed after `bun lint:fix` and one optional-chain lint edit. | keep | visual/native screenshot smoke |
| visual-native-smoke-001 | 14 | Playwright / plite-browser | Stable behavior proof did not attach screenshot-backed proof for the visual double-highlight/native-selection class. | Added `.tmp/plite/playwright/integration/examples/visual-native-selection-smoke.test.ts`; ran focused visual smoke. | Desktop visual smoke passed `11`, skipped `1`; screenshots attached for richtext caret, plaintext backward selection, placeholder empty caret, and hidden DOM boundary drag. | keep | plite-browser helper promotion |
| plite-browser-click-text-range-001 | 15 | plite-browser | Richtext and visual smoke duplicated fragile DOM range click geometry. | Added `editor.dom.clickTextRange`; migrated richtext regression and visual smoke; repaired WebKit center-click mismatch with `xAffinity`; ran focused desktop proof and `bun check`. | Focused richtext + visual smoke passed `14`, skipped `1`; `bun check` passed. | keep | huge-document correctness smoke |
| huge-document-smoke-001 | 16 | Playwright / slate-ar-stabilize | After stable selection/runtime repairs, huge-document core behavior needed refresh proof before any perf work. | Ran focused huge-document smoke for staged edit/undo/Enter/scroll, staged+virtualized vertical selection coherence, staged select-all delete/paste/undo, virtualized select-all delete/undo/redo, virtualized typing/arrows/Enter/scroll. | Desktop smoke passed `11`, skipped `4`. | keep | scrollbar/refocus smoke |
| huge-document-scrollbar-refocus-001 | 16 | Playwright / slate-ar-stabilize | Prior user-reported huge-doc scrollbar/refocus regressions need explicit coverage before optimizing. | Ran focused huge-document smoke for virtualized backward scroll, internal scrollbar jumps, native scrollbar drag buffer, repeated typing after scroll-away, clicked refocus, and repeated scroll-away typing caret. | Desktop smoke passed `14`, skipped `4`. | keep | benchmark health |
| huge-document-staged-keyboard-benchmark-001 | 17 | slate-ar-perf | Recheck staged hot lanes after correctness/visual proof before attempting perf patches. | `PLITE_STAGED_COMMANDS_SKIP_BUILD=1 PLITE_STAGED_COMMANDS_ITERATIONS=2 PLITE_STAGED_COMMANDS_SURFACES=stagedDefault,stagedContentVisibility bun run bench:react:huge-document:staged-keyboard-commands:local`. | ShiftDown p95 `15.6-15.7ms`; repeated ShiftDown p95 `21.4ms`; undo-delete p95 `60.5-63.4ms`; long tasks `0`. | keep | browser trace |
| huge-document-browser-trace-001 | 17 | slate-ar-perf | Recheck current auto/virtualized p95, DOM budget, listener/selector metrics before optimization. | `PLITE_BROWSER_TRACE_SKIP_BUILD=1 PLITE_BROWSER_TRACE_BLOCKS=5000 PLITE_BROWSER_TRACE_ITERATIONS=2 PLITE_BROWSER_TRACE_TYPE_OPS=10 PLITE_BROWSER_TRACE_SURFACES=defaultAuto,virtualized bun run bench:react:huge-document:browser-trace:local`. | auto type p95 `19.8ms`; virtualized type p95 `31.6ms`; select-to-paint p95 `59.6ms`; selection-ready p95 `26.8ms`; virtualized DOM p95 `304`; long-task p95 `0`; selector dispatch p95 `1.7ms` virtualized / `11.8ms` auto. | keep | API/DX audit |
| api-dx-current-state-001 | 18 | slate-ar-quality / slate-plan | Public docs/source should describe only the current API and expose no fake alias/backward-compat owners. | Patched `.tmp/plite/docs/general/docs-proof-map.md`; ran stale-language/source audit, `bun test ./packages/plite-react/test/surface-contract.tsx`, `bun --filter ./packages/plite-react typecheck`. | No active package alias/compat source owner found; proof-map wording changed from migration-story prose to current-state hook surface prose; surface contract passed `31`; path-filter typecheck passed. | keep | mobile claim width |
| mobile-claim-width-001 | 19 | slate-automation / plite-browser | Desktop/browser proof must not imply raw Android/iOS device proof. | Read mobile proof script and transport contracts; probed missing `test-results/release-proof`; ran `bun test:mobile-device-proof`. | Scoped proof passed: proxy/semantic rows cannot satisfy raw IME/clipboard claims; raw device artifact is absent, so raw Android/iOS remains unclaimed. | keep | workflow repair |
| workflow-output-budget-rule-001 | 20 | slate-automation | API/docs audit repeated broad output flooding; current rule only named broad test scans. | Patched `.agents/rules/slate-automation.mdc`; ran `pnpm install`; audited `.agents/skills/slate-automation/SKILL.md` with `rg`. | Generated mirror contains the new count/file-first API/docs audit rule; output-budget miss has durable owner repair. | keep | generated stress |
| generated-stress-selection-paste-undo-001 | 21 | plite-browser / Playwright | After stable examples and visual proof, generated stress should cover cross-family paste/undo/selection/IME/void/table/overlay interactions. | Fake-green preflight over stress specs; `STRESS_FAMILIES=paste-normalize-undo,webkit-backward-selection,selection-repair-ime,ime-composition-undo PLAYWRIGHT_RETRIES=0 bun test:stress`; `PLAYWRIGHT_RETRIES=0 bun test:stress`. | Targeted stress passed `6`; full generated Chromium stress passed `23`; no runtime patch needed. | keep | public-surface hard-cut contracts |
| public-surface-hard-cut-contracts-001 | 22 | slate / slate-react / plite-browser | API/DX hard-cut proof should keep public surface/no-compat/no-alias contracts current. | Ran `bun test:release-discipline`; patched `.tmp/plite/packages/plite/test/escape-hatch-inventory-contract.ts` to classify new browser-proof rows; reran command. | First run failed only on proof-harness inventory counts; product runtime/public no-alias contracts passed after inventory update; final guard passed `432`. | keep | table-fragment policy probe |
| table-fragment-merge-policy-probe-001 | 23 | slate-plan / slate package | The queued table-fragment fixtures might hide data-loss or merely upstream skipped policy. | Compared local fixtures to `/Users/zbeyens/git/slate`; temporarily unskipped the three local fixtures; ran `PLITE_FIXTURE_FILTER=transforms/insertFragment/of-tables bun test ./packages/plite/test/index.spec.ts`; restored skips and reran. | Upstream has the same skipped fixture rows; unskipped v2 fixtures fail all three; restored focused run passed `3`, skipped `6`; no runtime patch without a table-fragment spec. | quarantine/defer | fast validation |
| fast-validation-after-contract-updates-001 | 24 | Plite / docs | Contract inventory, docs, rules, and plan changed after previous check. | `.tmp/plite`: `bun check`; parent: `pnpm docs:plite:audit`. | `bun check` passed lint, package/site/root typecheck, Bun package tests (`1201` pass, `91` skip), slate-layout (`47` pass), slate-react Vitest (`747` pass); docs audit passed. | keep | cross-editor setup |
| cross-editor-huge-doc-benchmark-expansion-001 | 25 | slate-ar-perf | Compare current Plite huge-doc lanes with sibling ProseMirror and Lexical after local behavior/perf proof is green. | Verified expected sibling dist outputs were present; ran `CROSS_EDITOR_HUGE_ITERATIONS=2 CROSS_EDITOR_HUGE_BLOCKS=5000 CROSS_EDITOR_HUGE_TYPE_OPS=10 CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_COUNT=3 bun run bench:react:huge-document:cross-editor:local`; extracted compact metrics. | Plite virtualized middle typing `16ms` vs ProseMirror `63.8ms` and Lexical `74.3ms`; Plite DOM `155` vs `5001`/`10001`; repeated Shift+Down `22.8-27.1ms` with `13-14` renders vs `15.8-15.9ms` with `0` renders. | keep | vertical selection fanout probe |
| stable-selection-replay-after-sync-split-001 | 77 | Playwright / slate-react | Sync-selection side-effect repair could regress stable selection/history/navigation routes outside huge-doc. | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts playwright/integration/examples/richtext.test.ts playwright/integration/examples/inlines.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/styling.test.ts -g "selection|select|undo|redo|triple-click|drag|keyboard|arrow" --project=chromium --project=firefox --project=webkit`. | First broad replay failed only stale richtext triple-click oracle; after repair broad replay passed `223`, skipped `50`. | keep | fast validation |
| richtext-triple-click-current-block-oracle-001 | 78 | Playwright / slate-react | Chromium expected focus at the next block after browser triple-click, but runtime now intentionally exports Plite-owned current-block selection to DOM. | Patched `.tmp/plite/playwright/integration/examples/richtext.test.ts`; focused `current block` triple-click rows ran with `--repeat-each=3` on Chromium/WebKit. | Focused proof passed `18`; broad stable replay passed the repaired row; oracle now asserts current-block model range and native selected text. | keep | fast validation |
| dom-repair-window-scheduler-leak-001 | 79 | slate-react | Full `bun check` failed with unhandled `ReferenceError: requestAnimationFrame is not defined` after `editable-behavior.test.tsx`; a global timer retried after jsdom teardown. | Patched `.tmp/plite/packages/plite-react/src/editable/dom-repair-queue.ts` and `.tmp/plite/packages/plite-react/test/dom-repair-policy-contract.test.ts`; ran focused Vitest and full `bun check`. | Focused scheduler/editable behavior Vitest passed `42`; full `bun check` passed slate-react Vitest `749` with no unhandled error. | keep | parent docs audit |
| fast-validation-after-stable-replay-001 | 80 | Plite | Runtime/test changes need fast validation before the next timed-supervision packet. | `.tmp/plite`: `bun check`. | Passed lint, package/site/root typecheck, Bun package tests `1201` pass / `91` skip, slate-layout `47` pass, slate-react Vitest `749` pass. | keep | parent docs audit |
| browser-text-input-caret-replay-after-scheduler-001 | 82 | Playwright / slate-react | Editor-window scheduler repair should not regress real browser delayed caret/text-input repair paths. | Focused desktop route replay over richtext, plaintext, placeholder, dom-coverage boundaries, and huge-document. | Passed `33`, skipped `3` explicit browser-scope rows across Chromium/Firefox/WebKit. | keep | full huge-doc desktop refresh |
| huge-document-full-desktop-after-scheduler-001 | 83 | Playwright / slate-react | Scheduler repair should not regress the full huge-document behavior surface. | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --project=firefox --project=webkit`. | Passed `58`, skipped `32` explicit browser-scope rows. | keep | benchmark refresh |
| huge-document-benchmark-after-scheduler-001 | 84 | slate-ar-perf / benchmark | Scheduler repair should not make huge-document keyboard/trace metrics worse. | Fresh-build staged keyboard benchmark plus browser trace with the current build. | Staged ShiftDown `15.7ms`, repeated ShiftDown `21.6-21.7ms`, undo-delete `62-68.1ms`; trace max type-to-paint `29ms`, max select-to-paint `56.6ms`, virtualized DOM `304`, long tasks `0`. | keep | generated stress |
| generated-stress-after-scheduler-001 | 85 | plite-browser / Playwright | Scheduler repair should not regress generated cross-family editing stress. | `PLAYWRIGHT_RETRIES=0 bun test:stress`. | Full generated Chromium stress passed `23`. | keep | public/proof contracts |
| public-proof-contract-after-scheduler-001 | 86 | slate / slate-react / plite-browser | New proof/test rows can drift public hard-cut and proof-inventory contracts. | `bun test:release-discipline`; patched `.tmp/plite/packages/plite/test/escape-hatch-inventory-contract.ts`; reran the command. | First run failed only classified inventory counts; final release-discipline passed `432`. | keep | fast validation |
| fast-validation-after-proof-contract-refresh-001 | 87 | Plite | Package contract inventory changed after release-discipline. | `.tmp/plite`: `bun check`. | Passed lint, package/site/root typecheck, Bun package tests `1201` pass / `91` skip, slate-layout `47` pass, slate-react Vitest `749` pass. | keep | parent docs audit |
| visual-native-smoke-after-scheduler-001 | 89 | Playwright / plite-browser | Runtime scheduler and proof-contract changes should not regress visible/native selection proof. | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts --project=chromium --project=firefox --project=webkit`. | Passed `22`, skipped `2` explicit browser-scope rows. | keep | advanced stable desktop refresh |
| advanced-stable-desktop-after-scheduler-001 | 90 | Playwright / slate-react | Runtime scheduler/proof updates should not regress advanced stable routes around voids, inlines, mentions, tables, paste, multi-root, overlays, and toolbar behavior. | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/images.test.ts playwright/integration/examples/embeds.test.ts playwright/integration/examples/inlines.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/paste-html.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/comment-mode.test.ts playwright/integration/examples/forced-layout.test.ts playwright/integration/examples/multi-root-document.test.ts --project=chromium --project=firefox --project=webkit`. | Passed `663`, skipped `42` explicit browser-scope rows. | keep | cross-editor huge-doc refresh |
| cross-editor-huge-doc-after-scheduler-001 | 91 | slate-ar-perf / benchmark | Sibling-editor comparison should stay current after scheduler/behavior proof. | `CROSS_EDITOR_HUGE_ITERATIONS=2 CROSS_EDITOR_HUGE_BLOCKS=5000 CROSS_EDITOR_HUGE_TYPE_OPS=10 CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_COUNT=3 bun run bench:react:huge-document:cross-editor:local`. | Plite virtualized repeated ShiftDown `15.2ms`, DOM `155`; Plite auto start repeated ShiftDown `22.9ms`, render count `5`; ProseMirror repeated ShiftDown `15.8-16.2ms`, DOM `5001`; Lexical repeated ShiftDown `16-16.1ms`, DOM `10001`. Plite virtualized typing `16.2-16.3ms` beats ProseMirror `49ms` and Lexical `75ms`. | keep | audit Plite auto start residual |
| autoreview-selection-import-cancel-001 | 114 | slate-react | Cancelled stale-composition selectionchange flush could leave `pendingDOMSelectionImport` true. | Patched `packages/plite-react/src/editable/runtime-selection-engine.ts` and `test/selection-runtime-contract.test.ts`; ran focused contracts, typecheck, and browser IME replay. | Contracts passed; focused IME/richtext/placeholder/DOM coverage replay passed `13`, skipped `11`. | keep | continue accepted autoreview findings |
| autoreview-native-handoff-guard-001 | 114 | slate-react | DOM-current selection handoff could keep stale model-owned text-input guard active. | Patched `packages/plite-react/src/editable/selection-controller.ts` and `test/selection-controller-contract.ts`; ran adjacent contracts and typecheck. | Focused slate-react contracts passed `61`; typecheck passed. | keep | continue accepted autoreview findings |
| autoreview-history-notify-001 | 114 | slate-react | Silent history sidecar restore could leave view-selection subscribers stale after undo/redo. | Patched `packages/plite-react/src/hooks/use-slate-history.ts`, `packages/plite-react/src/editable/mutation-controller.ts`, and `test/projected-command-contract.test.ts`; ran focused contracts and browser undo replay. | Focused slate-react contracts passed `61`; multi-root/richtext/placeholder/DOM coverage replay passed `22`, skipped `11`. | keep | formatter finding |
| huge-document-block-label-format-001 | 115 | site examples / Playwright | `blocks=120` URL value rendered as `,120` in the Blocks select. | Patched `site/examples/ts/huge-document.tsx`; added assertion in `playwright/integration/examples/query-controls.test.ts`; killed stale Playwright server and reran fresh managed build. | Fresh Chromium/Firefox/WebKit query-controls proof passed `3`; stale-server first failure is logged as workflow slowdown. | keep | workflow repair |
| slate-automation-stale-server-review-timeout-001 | 116 | slate-automation | The loop hit two reusable methodology misses: managed Playwright stale-server reuse and silent final autoreview timeout. | Patched `.agents/rules/slate-automation.mdc`; ran `pnpm install`; audited `.agents/skills/slate-automation/SKILL.md` with fixed-string `rg`. | Source/generated mirror contains both new rules. Agent-native review scoped N/A because this is source/mirror command methodology, not UI/action parity. | keep | deterministic validation |
| post-autoreview-validation-001 | 117 | Plite | Accepted review fixes touched runtime, contracts, site example, Playwright proof, and skill rules; clean autoreview rerun timed out. | Focused contracts + `plite-react` typecheck; query-controls fresh-build desktop proof; `.tmp/plite` `bun check`; mirror audit. | Contracts/typecheck passed; query-controls `3/0`; `bun check` passed with slate-react Vitest `750`; mirror audit passed. | keep | timed supervision rescan |
| post-autoreview-stable-selection-replay-001 | 119 | Playwright / slate-react | Selection/history/IME patches could regress rich stable routes even if package contracts pass. | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts playwright/integration/examples/richtext.test.ts playwright/integration/examples/inlines.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/styling.test.ts playwright/integration/examples/multi-root-document.test.ts playwright/integration/examples/placeholder.test.ts playwright/integration/examples/dom-coverage-boundaries.test.ts -g "selection|select|undo|redo|caret|composition|IME|dictation|typing after|after typing" --project=chromium --project=firefox --project=webkit`. | Passed `324`, skipped `78` explicit browser-scope rows. | keep | visual/native smoke refresh |
| post-autoreview-visual-native-smoke-001 | 120 | Playwright / plite-browser | Behavior replay can miss screenshot-visible double highlights or native/model selection mismatch. | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts --project=chromium --project=firefox --project=webkit`. | Passed `22`, skipped `2` explicit Firefox-scope rows. | keep | huge-doc history replay |
| post-autoreview-huge-document-replay-001 | 121 | Playwright / slate-react | History notification changes could regress huge-document undo/redo/select-all/scroll behavior. | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --project=firefox --project=webkit`. | Passed `58`, skipped `32` explicit browser-scope rows. | keep | benchmark refresh |
| post-autoreview-huge-document-benchmark-001 | 122 | slate-ar-perf / benchmark | History/view-selection fixes could regress hot selection and undo/delete metrics. | `PLITE_STAGED_COMMANDS_SKIP_BUILD=1 PLITE_STAGED_COMMANDS_ITERATIONS=3 PLITE_STAGED_COMMANDS_SURFACES=stagedDefault,stagedContentVisibility bun run bench:react:huge-document:staged-keyboard-commands:local`; `PLITE_BROWSER_TRACE_SKIP_BUILD=1 PLITE_BROWSER_TRACE_BLOCKS=5000 PLITE_BROWSER_TRACE_ITERATIONS=2 PLITE_BROWSER_TRACE_TYPE_OPS=10 PLITE_BROWSER_TRACE_SURFACES=defaultAuto,virtualized bun run bench:react:huge-document:browser-trace:local`. | Staged repeated ShiftDown p95 `21.7ms`; undo-delete `62.8-63.4ms`; browser trace type p95 max `31.6ms`; select p95 max `60ms`; DOM `950/304`; long tasks `0`. | keep/plateau | generated stress |
| post-autoreview-generated-stress-001 | 123 | Playwright / plite-browser | Mixed generated families can expose cross-feature selection/history regressions missed by curated examples. | `STRESS_SEED=post-autoreview-selection-history PLAYWRIGHT_RETRIES=0 bun test:stress`. | Passed `23` Chromium generated stress rows. | keep | public/proof contracts |
| post-autoreview-public-proof-contracts-001 | 124 | slate / slate-react / plite-browser | New tests/oracles and proof rows can drift public hard-cut and proof-inventory contracts. | `bun test:release-discipline`. | Passed `432`. | keep | full private-alpha gate |
| post-autoreview-full-private-alpha-gate-001 | 125 | Plite / Playwright | Full private-alpha gate must prove the accumulated autoreview, runtime, example, Playwright, benchmark, and skill changes together. | `.tmp/plite`: `bun check:full`. | Passed with fast checks, release-discipline, plite-browser proof contracts, scoped mobile proof, persistent-profile soak, and full integration: `1777` passed, `690` skipped, `1` retry-green Firefox visual/native table drag row. | keep | focused flake repeat |
| post-autoreview-full-gate-flake-repeat-001 | 126 | Playwright / plite-browser | The full gate retry-green selected one fewer character in Firefox table-cell drag; focused no-retry repeat decides whether this is a real runtime/helper bug. | `.tmp/plite`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts -g "table cell drag selection includes the full native text range" --project=firefox --repeat-each=5`. | Fresh-build focused repeat passed `5`; classify as load flake with focused proof, no runtime patch. | keep | final visual/native closure proof |
| final-visual-native-closure-proof-001 | 127 | Playwright / plite-browser | The last no-code proof should target the user's repeated screenshot-visible selection complaints, not a random package rerun. | `.tmp/plite`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts --project=chromium --project=firefox --project=webkit`. | Fresh-build strict desktop visual/native smoke passed `22`, skipped `2`; Firefox table drag passed again. | keep | final audit/check-complete |
| final-fast-runtime-closure-check-001 | 128 | Plite | The final runtime gate should prove no fast package/test/typecheck drift remains after the final visual/native proof. | `.tmp/plite`: `bun check`. | Passed lint, package/site/root typecheck, Bun package tests `1201` pass / `91` skip, slate-layout `47`, and slate-react Vitest `750`. | keep | supplemental proof |
| final-supplemental-release-discipline-001 | 129 | Plite | The 8h timer was still short after the plan checker; public/proof contracts are useful no-code proof. | `.tmp/plite`: `bun test:release-discipline`. | Passed `432`. | keep | supplemental focused repeat |
| final-supplemental-firefox-repeat-001 | 130 | Playwright / plite-browser | The only full-gate retry-green row deserves one extra no-retry repeat before handoff. | `.tmp/plite`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts -g "table cell drag selection includes the full native text range" --project=firefox --repeat-each=5`. | Passed `5/0`; second focused repeat total is `10/0` after the full-gate flake. | keep | final audit/check-complete |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| status | docs/control plane | `agent-start`, scoreboard, roadmap, prior 8h plan | N/A | broad gates green; example parity rows still open | route example parity |
| scroll-into-view | `plite-react` package contracts | `bun test:vitest test/editable-behavior.test.tsx test/app-owned-customization.test.tsx test/selection-side-effect-policy-contract.test.ts -t "default scroll restores leaf measurement after scrolling a collapsed range|default scroll crosses a shadow root to reach an outer scroll container|Editable forwards scrollSelectionIntoView to app-owned code|Editable skips scrollSelectionIntoView for remote collaboration selection updates|remote collaboration selection metadata skips scroll and focus side effects"` | N/A | 5 passed; same-path example/test deleted | keep explicit-cut docs |
| shadow-dom | `/examples/shadow-dom` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/shadow-dom.test.ts --project=chromium --project=firefox --project=webkit` | Chromium, Firefox, WebKit | 18 passed, 3 explicit skips | keep recovered docs |
| styling | `/examples/styling` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/styling.test.ts --project=chromium --project=firefox --project=webkit` | Chromium, Firefox, WebKit | 7 passed, 2 explicit skips | keep recovered docs |
| markdown-preview | `/examples/markdown-preview` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/markdown-preview.test.ts --project=chromium --project=firefox --project=webkit` | Chromium, Firefox, WebKit | 3 passed after oracle repair | keep recovered docs |
| code-highlighting | `/examples/code-highlighting` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/code-highlighting.test.ts --project=chromium --project=firefox --project=webkit` | Chromium, Firefox, WebKit | 48 passed, 6 explicit skips after retoken oracle repair | keep extended docs |
| markdown-shortcuts | `/examples/markdown-shortcuts` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --project=firefox --project=webkit` | Chromium, Firefox, WebKit | 51 passed after explicit skip repair | keep extended docs |
| tables | `/examples/tables` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/tables.test.ts --project=chromium --project=firefox --project=webkit` | Chromium, Firefox, WebKit | 48 passed | keep extended docs; table-fragment policy separate |
| batch check | `.tmp/plite` | `bun check` | N/A | passed: lint, package/site/root typecheck, Bun package tests, slate-layout tests, slate-react Vitest | continue timed supervision |
| richtext | `/examples/richtext` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit` | Chromium, Firefox, WebKit | 256 passed, 71 explicit skips after model/native selection repair | keep runtime repair |
| remaining stable examples | plaintext, markdown shortcuts, editable voids, custom-placeholder, hidden-content-blocks, DOM coverage | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/placeholder.test.ts playwright/integration/examples/hidden-content-blocks.test.ts playwright/integration/examples/dom-coverage-boundaries.test.ts --project=chromium --project=firefox --project=webkit` | Chromium, Firefox, WebKit | 259 passed, 53 explicit skips | route to visual/native smoke |
| post-selection package check | `.tmp/plite` | `bun check` | N/A | passed lint, package/site/root typecheck, Bun package tests, slate-layout tests, slate-react Vitest | continue timed supervision |
| visual native smoke | richtext, plaintext, custom-placeholder, DOM coverage | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts --project=chromium --project=firefox --project=webkit` | Chromium, Firefox, WebKit | 11 passed, 1 explicit Firefox boundary skip | keep screenshot proof |
| promoted text-range helper proof | richtext + visual smoke | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/visual-native-selection-smoke.test.ts -g "keeps a backward click caret after typing in the same text node|visual native selection smoke" --project=chromium --project=firefox --project=webkit` | Chromium, Firefox, WebKit | 14 passed, 1 explicit Firefox boundary skip | keep `editor.dom.clickTextRange` |
| post-helper package check | `.tmp/plite` | `bun check` | N/A | passed lint, package/site/root typecheck, Bun package tests, slate-layout tests, slate-react Vitest | route huge-doc smoke |
| huge-document core smoke | `/examples/huge-document` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/huge-document.test.ts -g "keeps staged middle-block editing, undo, Enter, and scroll stable|keeps staged and virtualized Shift\\+ArrowUp and Shift\\+ArrowDown selection coherent across browsers|keeps staged 10k select-all delete, typing, paste, and undo bounded|keeps virtualized browser select-all delete, typing, undo, and redo bounded|keeps virtualized 5k typing, undo, arrows, Enter, and scroll stable" --project=chromium --project=firefox --project=webkit` | Chromium, Firefox, WebKit | 11 passed, 4 explicit skips | route benchmark health |
| huge-document scrollbar/refocus smoke | `/examples/huge-document` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/huge-document.test.ts -g "keeps virtualized backward scroll stable over dynamic block heights|keeps virtualized rows visually coherent during internal scrollbar jumps|keeps virtualized rows buffered during native scrollbar drag before React repaint|keeps repeated typing visible after manual scroll-away|keeps clicked refocus position visible in a long editor|keeps caret at the edited block end across repeated manual scroll-away typing" --project=chromium --project=firefox --project=webkit` | Chromium, Firefox, WebKit | 14 passed, 4 explicit skips | route benchmark health |
| staged keyboard benchmark | `scripts/benchmarks/browser/react/huge-document-staged-keyboard-commands.mjs` | `PLITE_STAGED_COMMANDS_SKIP_BUILD=1 PLITE_STAGED_COMMANDS_ITERATIONS=2 PLITE_STAGED_COMMANDS_SURFACES=stagedDefault,stagedContentVisibility bun run bench:react:huge-document:staged-keyboard-commands:local` | Chromium | ShiftDown p95 `15.6-15.7ms`, repeated ShiftDown p95 `21.4ms`, undo-delete p95 `60.5-63.4ms`, long tasks `0` | keep/plateau |
| huge-document browser trace | `scripts/benchmarks/browser/react/huge-document-browser-trace.mjs` | `PLITE_BROWSER_TRACE_SKIP_BUILD=1 PLITE_BROWSER_TRACE_BLOCKS=5000 PLITE_BROWSER_TRACE_ITERATIONS=2 PLITE_BROWSER_TRACE_TYPE_OPS=10 PLITE_BROWSER_TRACE_SURFACES=defaultAuto,virtualized bun run bench:react:huge-document:browser-trace:local` | Chromium | auto type p95 `19.8ms`; virtualized type p95 `31.6ms`; select-to-paint p95 `59.6ms`; virtualized DOM p95 `304`; long-task p95 `0` | keep/plateau |
| API/DX current-state audit | docs + `plite-react` package surface | stale-language/source audit; `bun test ./packages/plite-react/test/surface-contract.tsx`; `bun --filter ./packages/plite-react typecheck` | N/A | repaired one docs proof-map current-state wording; runtime surface contract passed `31`; typecheck passed | route to mobile claim width |
| mobile claim-width proof | `plite-browser` release/mobile proof | `bun test:mobile-device-proof`; raw artifact probe | N/A | scoped proof passed; raw Android/iOS remains unclaimed because raw proof artifact is absent | route to workflow repair |
| workflow output-budget repair | `plite-automation` source rule | `pnpm install`; mirror `rg` audit | N/A | generated skill mirror contains the new API/docs count/file-first rule | route to generated stress |
| generated stress targeted | `playwright/stress/generated-editing.test.ts` | `STRESS_FAMILIES=paste-normalize-undo,webkit-backward-selection,selection-repair-ime,ime-composition-undo PLAYWRIGHT_RETRIES=0 bun test:stress` | Chromium | 6 passed | broaden to full generated stress |
| generated stress full | `playwright/stress/generated-editing.test.ts` | `PLAYWRIGHT_RETRIES=0 bun test:stress` | Chromium | 23 passed | route to public hard-cut contracts |
| public hard-cut contracts | package/public contracts | `bun test:release-discipline` | N/A | 432 passed after escape-hatch inventory classification update | route to table policy probe |
| table-fragment policy probe | `packages/plite/test/transforms/insertFragment/of-tables` | temporary unskip + `PLITE_FIXTURE_FILTER=transforms/insertFragment/of-tables bun test ./packages/plite/test/index.spec.ts`; restored-skip rerun | N/A | unskipped: 3 failed; restored: 3 passed, 6 skipped | defer to `plite-plan` |
| fast validation | `.tmp/plite` + parent docs | `.tmp/plite`: `bun check`; parent: `pnpm docs:plite:audit` | N/A | both passed | reopen cross-editor setup |
| cross-editor huge-doc benchmark | Plite, ProseMirror, Lexical | `CROSS_EDITOR_HUGE_ITERATIONS=2 CROSS_EDITOR_HUGE_BLOCKS=5000 CROSS_EDITOR_HUGE_TYPE_OPS=10 CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_COUNT=3 bun run bench:react:huge-document:cross-editor:local` | Chromium | Plite typing/DOM wins; repeated Shift+Down render fanout remains slower than PM/Lexical | route to fanout probe |
| stable selection replay after sync split | plaintext, richtext, inlines, mentions, markdown shortcuts, styling | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts playwright/integration/examples/richtext.test.ts playwright/integration/examples/inlines.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/styling.test.ts -g "selection|select|undo|redo|triple-click|drag|keyboard|arrow" --project=chromium --project=firefox --project=webkit` | Chromium, Firefox, WebKit | 223 passed, 50 explicit skips after triple-click oracle repair | run fast validation |
| richtext triple-click current block | `/examples/richtext` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts -g "current block after browser triple click|current block on browser triple click" --project=chromium --project=webkit --repeat-each=3` | Chromium, WebKit | 18 passed; model range and native selected text now both prove current block | keep oracle |
| DOM repair scheduler contracts | `plite-react` package | `bun test:vitest test/dom-repair-policy-contract.test.ts test/editable-behavior.test.tsx`; `.tmp/plite` `bun check` | N/A | focused Vitest passed 42; full `bun check` passed with slate-react Vitest 749 and no unhandled RAF error | keep runtime scheduler repair |
| scheduler-adjacent browser replay | richtext, plaintext, placeholder, DOM coverage, huge-document | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/plaintext.test.ts playwright/integration/examples/placeholder.test.ts playwright/integration/examples/dom-coverage-boundaries.test.ts playwright/integration/examples/huge-document.test.ts -g "keeps a backward click caret after typing in the same text node|keeps the visual caret after browser insertion at the selected text end|keeps the visual caret after browser insertion before trailing punctuation|keeps the visual caret after browser insertion inside a text leaf|keeps caret editable after plain text paste over selected range|does not duplicate native input handling after route remount|commits IME composition from the custom placeholder empty state|commits IME composition while DOM coverage boundaries are hidden|keeps repeated typing visible after manual scroll-away|keeps caret at the edited block end across repeated manual scroll-away typing|creates a new plain text block on Enter before follow-up typing|keyboard undo restores caret after middle-line typing" --project=chromium --project=firefox --project=webkit` | Chromium, Firefox, WebKit | 33 passed, 3 explicit skips | run full huge-doc desktop |
| full huge-document after scheduler repair | `/examples/huge-document` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --project=firefox --project=webkit` | Chromium, Firefox, WebKit | 58 passed, 32 explicit skips | refresh benchmarks |
| huge-document benchmark after scheduler repair | staged/auto/virtualized | `PLITE_STAGED_COMMANDS_ITERATIONS=2 PLITE_STAGED_COMMANDS_SURFACES=stagedDefault,stagedContentVisibility bun run bench:react:huge-document:staged-keyboard-commands:local`; `PLITE_BROWSER_TRACE_SKIP_BUILD=1 PLITE_BROWSER_TRACE_BLOCKS=5000 PLITE_BROWSER_TRACE_ITERATIONS=2 PLITE_BROWSER_TRACE_TYPE_OPS=10 PLITE_BROWSER_TRACE_SURFACES=defaultAuto,virtualized bun run bench:react:huge-document:browser-trace:local` | Chromium | staged ShiftDown `15.7ms`; repeated ShiftDown `21.6-21.7ms`; trace type-to-paint max `29ms`; select-to-paint max `56.6ms`; DOM max `950` auto / `304` virtualized; long tasks `0` | route generated stress |
| generated stress after scheduler repair | generated editing stress | `PLAYWRIGHT_RETRIES=0 bun test:stress` | Chromium | 23 passed | run public/proof contracts |
| public/proof contracts after scheduler repair | package public/proof contracts | `bun test:release-discipline` | N/A | 432 passed after classifying inventory drift from new proof/test rows | run fast validation |
| fast validation after proof-contract refresh | `.tmp/plite` | `bun check` | N/A | passed lint, typecheck, Bun tests, slate-layout, and slate-react Vitest | parent docs audit |
| visual/native smoke after scheduler repair | visual-native-selection-smoke | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts --project=chromium --project=firefox --project=webkit` | Chromium, Firefox, WebKit | 22 passed, 2 explicit skips | run advanced stable sweep |
| advanced stable desktop after scheduler repair | images, embeds, inlines, mentions, tables, paste-html, editable-voids, hovering-toolbar, search-highlighting, comment-mode, forced-layout, multi-root | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/images.test.ts playwright/integration/examples/embeds.test.ts playwright/integration/examples/inlines.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/paste-html.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/comment-mode.test.ts playwright/integration/examples/forced-layout.test.ts playwright/integration/examples/multi-root-document.test.ts --project=chromium --project=firefox --project=webkit` | Chromium, Firefox, WebKit | 663 passed, 42 explicit skips | run cross-editor benchmark refresh |
| cross-editor huge-doc after scheduler repair | Plite auto/virtualized vs ProseMirror/Lexical | `CROSS_EDITOR_HUGE_ITERATIONS=2 CROSS_EDITOR_HUGE_BLOCKS=5000 CROSS_EDITOR_HUGE_TYPE_OPS=10 CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_COUNT=3 bun run bench:react:huge-document:cross-editor:local` | Chromium | virtualized repeated ShiftDown `15.2ms`, auto start repeated ShiftDown `22.9ms`, PM `15.8-16.2ms`, Lexical `16-16.1ms`; Plite virtualized typing/DOM still wins | audit auto start residual |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| code-highlighting single-line code navigation | model selection asserted | native DOM target asserted | `assert.domSelectionTarget` on code-line movement | Playwright desktop proof | passed in code-highlighting file |
| tables cell drag/triple-click/navigation | model selection asserted | selected text asserted for drag/triple-click | render-state snapshot includes DOM selection/shell/focus owner | Playwright desktop proof | passed in tables file |
| markdown-shortcuts heading/list caret | model selection asserted | N/A | caret/model offsets after heading/list actions | Playwright desktop proof | passed in markdown-shortcuts file |
| richtext collapsed caret after click typing | model caret asserted at `[0,0]@3` | none, collapsed | DOM caret text/offset asserted by `collapsedModelDOMSelection`; no double displayed highlight | screenshot attachment `richtext-collapsed-caret.png` | passed Chromium/Firefox/WebKit |
| plaintext backward selection | model backward selection asserted | `def` | DOM anchor/focus text offsets asserted; no double displayed highlight | screenshot attachment `plaintext-backward-selection.png` | passed Chromium/Firefox/WebKit |
| custom-placeholder empty caret | model caret asserted at empty `[0,0]@0` | none, collapsed | zero-width DOM caret normalized; no double displayed highlight | screenshot attachment `custom-placeholder-collapsed-caret.png` | passed Chromium/Firefox/WebKit |
| hidden DOM boundary drag | model selection non-null across boundary | browser-native drag into placeholder | no native plus projected double highlight | screenshot attachment `hidden-dom-boundary-drag-selection.png` | passed Chromium/WebKit, explicit Firefox skip |

plite-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| fake-green route proof preflight | shadow-dom and markdown-shortcuts route specs | skill-rule preflight, not a plite-browser API helper | `pnpm install`; source/mirror `rg`; agent-native review | kept in `plite-automation` rule because this is supervisor methodology, not runtime browser API |
| text-path range click geometry | richtext regression and visual-native smoke | `editor.dom.clickTextRange({ path, startOffset, endOffset, xAffinity })` | focused desktop Playwright proof plus `.tmp/plite` `bun check` | kept; `xAffinity` preserves native browser offset differences |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| raw-device broad claim | none this run | N/A | scoped | raw Android/iOS remains unclaimed; desktop route proofs do not imply raw-device proof |
| scoped mobile proof | release proof script | `bun test:mobile-device-proof` | passed | semantic/proxy rows cannot satisfy raw mobile IME or clipboard claims |
| raw-device artifact | artifact probe | `ls test-results/release-proof` | absent | raw proof requires `test-results/release-proof/mobile-device-proof.json` from Appium/device lane |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| huge-document | residual caveat scan | select-all-delete undo p95 and repeated Shift+Down deltas | prior plan evidence only so far | queued after example parity unless reopened |
| huge-document core behavior | staged + virtualized | typing, Enter, paste, select-all, delete, undo/redo, arrows, vertical selection, scroll | focused Playwright desktop proof | passed `11`, skipped `4` |
| huge-document scrollbar/refocus | virtualized | backward scroll, internal scrollbar jumps, native scrollbar drag buffer, manual scroll-away typing, clicked refocus, caret at edited block end | focused Playwright desktop proof | passed `14`, skipped `4` |
| huge-document benchmark health | staged + auto + virtualized | ShiftDown/ShiftUp, repeated ShiftDown, select-all delete/undo, type-to-paint, select-to-paint, DOM budget, listener/selector fanout | benchmark artifacts in `.tmp/plite/tmp` | keep current runtime; no dirty perf patch |
| cross-editor huge-document | Plite auto/virtualized vs ProseMirror/Lexical | typing, burst typing, select, materialized select, Shift+Down/Up, repeated Shift+Down, DOM nodes | `tmp/slate-react-huge-document-cross-editor-benchmark*.json` | Plite virtualized typing `16ms` and DOM `155` wins; repeated Shift+Down `22.8ms` with `14` renders loses to PM/Lexical `~16ms` with `0` renders |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| broad docs `rg` during initial status scan | slate-automation | high output / about 50k tokens | streamed too much prior-plan/docs output into chat | enough signal to avoid reopening #416 and find example parity owner | repair by switching to targeted `sed` slices and artifact/count-first audits for rest of run |
| broad current-source `rg` accidentally hit generated `site/out` | slate-automation | very high output / generated bundle dump | glob exclusion was too weak for `.tmp/plite/site/out` | proved `scroll-into-view` is absent from current source, but with excessive noise | use `rg --files` exact lists and explicit file reads; avoid generated `site/out`, `.next`, and bundle paths |
| broad current-source `rg` included `.tmp/plite/packages/**` while checking one example | slate-automation | very high output / package internals dump | pattern was not scoped to exact example/test files | enough signal to find CSS class owner, but noisy as hell | use exact file reads for example parity; only search package owners after a named API/helper hypothesis |
| broad table-owner `rg` dumped unrelated package test internals | slate-automation | high output / package internals dump | table fragment search did not start from exact known fixture directory | enough signal to confirm table-fragment policy files exist, but noisy | use exact `packages/plite/test/transforms/insertFragment/of-tables/**` paths for the policy checkpoint |
| first text-range click helper used center geometry and broke WebKit offset | plite-browser | one focused proof cycle | helper intent was underspecified; WebKit placed caret after the character when clicking center of a one-character range | focused proof failed with `abcXdef` instead of `abXcdef` | repaired helper with `xAffinity` defaulting to `start`, then reran focused desktop proof |
| API/DX stale-language audit streamed broad `rg -n` matches | slate-automation | high output / avoidable | current rule banned broad test scans but not broad API/docs audits | enough signal to switch to count/file-first search and find one proof-map wording issue | patched `plite-automation` source rule with API/docs count/file-first policy |
| broad hook/API search dumped package internals | slate-automation | high output / avoidable | hook audit used broad `rg -n` across docs, source, and tests instead of count/file-first slices | enough signal to rely on existing surface contracts and run focused proof | same source-rule repair covers API/docs current-state audits |
| root `bun test` mixed runtime and type-only contracts | slate-automation | one failed command | `generic-react-editor-contract.tsx` has deliberate runtime-invalid declared values; root Bun test was the wrong proof | failure clarified package surface proof split | reran runtime `surface-contract` with Bun and type-only contract via `bun --filter ./packages/plite-react typecheck` |
| direct in-app Browser control tool was not exposed by tool search | browser proof | one tool-search cycle | Browser plugin search returned Node REPL/helper tools, not a direct navigate/screenshot control API | prevents claiming an in-app Browser proof in this slice | use local Playwright route screenshot/DOM proof and keep the tooling gap in workflow slowdowns |
| ad hoc Node route proof could not resolve Playwright from repo root | browser proof | two failed command attempts | raw Node from repo root lacked package resolution; `bun --filter ... exec` is not supported by this Bun invocation | clarified the correct execution context for local route proof | run ad hoc Playwright scripts from `packages/plite-browser`, where `playwright` is a declared dependency |
| backtick-containing `rg` audit pattern executed a command | slate-automation | one failed audit command | pattern was inside double quotes, so the shell executed the embedded command text | mirror audit still succeeded after rerun with fixed-string search | patched `plite-automation` with single-quote / `rg -F` guidance for shell metacharacter patterns |
| repeated backtick-containing mirror audit executed a command | slate-automation | one failed audit command | the new managed-Playwright mirror audit repeated the same double-quoted backtick pattern and executed `bun run playwright` | no product proof lost; package tests still ran; mirror audit passed after single-quoted `rg -F` | keep as operator error evidence; future mirror audits must use single quotes for patterns containing backticks |
| fast validation after stable replay needed two reruns | slate-react / slate-automation | one formatter failure plus one real async teardown failure | the richtext oracle line needed formatter repair, then full Vitest exposed a DOM repair retry scheduler leak that focused `editable-behavior` alone did not catch | formatter fixed; scheduler repaired through editor-window timers; focused contracts and full `bun check` passed | keep as useful gate cost; no skill repair because the gate caught a real runtime/test leak |
| mobile embeds rows used physical keyboard transport in mobile emulation | slate-automation / Playwright | one full sweep plus one focused rerun | Pixel 5 emulation plus `page.keyboard.type(...)` is not raw mobile native typing and reordered inserted text after selection | deterministic failure reproduced in focused mobile; mobile semantic branch and desktop native rerun both passed | patch `plite-automation` with mobile-emulation proof-width rule |
| `bun check:full` takes about one proof packet and can still produce retry-green full-suite flakes | Plite / Playwright | `21.5m` full rerun plus `29.5s` focused repeat | full private-alpha proof is intentionally broad and load-heavy; the retry-green rows did not reproduce under focused no-retry repeats | hard gates passed, mobile repair stayed green, and focused repeats passed `20/0` | keep full sweep as necessary proof; classify retry-green rows with focused repeat before patching |
| post-autoreview `bun check:full` produced one retry-green visual/native row | Plite / Playwright | `21.6m` full gate plus `16.9s` focused repeat | broad full-suite load made Firefox table-cell drag select `Huma` once instead of `Human`; focused no-retry repeat did not reproduce | hard gates passed with `1777` passed / `690` skipped / `1` flaky; focused repeat passed `5/0` | keep as load-flake classification; no code patch without focused reproduction |
| managed Playwright reused stale server after example formatter patch | Playwright / slate-automation | one failed focused proof plus one fresh rerun | existing server on `localhost:3101` caused `reuseExistingServer` to skip `bun build:next`, so the browser rendered the old `,120` label after the source was already fixed | failed proof showed stale `,120`; after stopping the server, fresh managed build passed query-controls desktop `3/0` | patched `plite-automation` with managed-server freshness guidance; log stale red/green as workflow slowdown |
| final autoreview rerun was silent too long | autoreview / slate-automation | about `8.5m` before interrupt | reviewer bundled a large diff and produced no result, so it could not be counted as clean review | no findings produced; deterministic contracts/typecheck/browser proof/`bun check` passed instead | patched `plite-automation` with silent-review timeout fallback; do not claim clean review from no output |
| fixed-string mirror audit repeated the backtick trap once | slate-automation | one failed audit command | audit pattern used double quotes around backticked `bun build:next`, executing the command text | rerun with `rg -F` found source and generated mirror rows | keep as operator-error evidence; fixed-string/single-quote rule remains explicit |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | repaired model-owned text input selection handoff in `plite-react` runtime: pending native text input repair arms the short model-owned guard; stale composition DOM selection imports are suppressed only during that guard window; model-owned composition input exports the model selection to the DOM immediately, microtask, and animation frame; cancelled runtime selectionchange flushes now clear pending DOM import; DOM-current handoff clears stale model-owned text-input guards; history/mutation sidecar restore now notifies view-selection subscribers; DOM repair retries now schedule microtasks/timeouts/RAF through the editor window instead of ambient globals; added `plite-browser` `editor.dom.clickTextRange` with `xAffinity`; removed `draggable` from inline void shells so native drag selection includes visible inline void labels while block voids remain draggable |
| tests/oracles/browser proof | repaired shadow-dom Playwright fake-green returns to explicit `test.skip(...)`; repaired styling un-awaited load-state calls; upgraded markdown-preview test to assert rendered preview classes before and after editing; added code-highlighting language-retoken oracle; repaired markdown-shortcuts silent mobile returns to explicit skips; repaired mentions inline-void drag fake-green gating to explicit skips; added/updated selection and history package contracts, including cancelled selectionchange flush, native handoff guard clearing, and history sidecar subscriber notification; added durable visual/native screenshot smoke; migrated richtext regression to `editor.dom.clickTextRange`; repaired richtext triple-click current-block oracle with native selected-text proof; added DOM repair scheduler contract; split mobile embeds proof transport so desktop keeps native `page.keyboard.type(...)` and mobile uses semantic `editor.insertText(...)`; query-controls now asserts arbitrary huge-document block labels render as `120`; richtext desktop passed `256/71`; remaining stable desktop examples passed `259/53`; stable replay after sync split passed `223/50`; post-autoreview stable selection/history/IME replay passed `324/78`; post-autoreview visual/native smoke passed `22/2`; post-autoreview huge-document full desktop passed `58/32`; post-autoreview generated stress passed `23`; visual/helper focused proof passed `14/1`; mentions desktop passed `52/17`; mobile/chromium focused embeds input proof passed `2/0` each; WebKit inline paste repeat passed `5/0`; generated stress passed targeted `6` and full `23`; public hard-cut contracts passed `432`; post-autoreview public/proof contracts passed `432`; latest full private-alpha `bun check:full` passed hard gates with `1777` passed, `690` skipped, `1` retry-green Firefox visual/native row; focused Firefox no-retry repeats passed `10/0`; final strict visual/native smoke passed `22/2`; latest fresh-build query-controls proof passed `3/0`; final `bun check` and supplemental `bun test:release-discipline` passed |
| benchmarks/metrics/targets | reran staged keyboard command benchmark, browser trace, and cross-editor 5k comparison after full private-alpha proof; reran staged/browser trace again after accepted history/view-selection autoreview fixes; kept current runtime because typing/DOM wins remain strong, long-task p95 is `0`, undo-delete remains around `62.8-63.4ms`, and residual repeated ShiftDown p95 is plateaued at projection/render-frame cost rather than a safe local micro-patch |
| examples/docs | created and filled current 8h automation plan; corrected `scroll-into-view` parity/fork dossier docs from stale live-owner claim to explicit cut with package proof; upgraded `shadow-dom`, `styling`, and `markdown-preview` parity to recovered; upgraded `code-highlighting`, `markdown-shortcuts`, and `tables` parity to extended; removed stale `custom-placeholder` open-backlog entry; repaired proof-map hook-surface wording to current-state API prose; fixed huge-document Blocks select formatting for arbitrary URL values with `Intl.NumberFormat` |
| skills/workflow | patched `plite-automation` source rule to require a target-spec fake-green preflight scan before trusting route-level Playwright proof; patched `plite-automation` source rule to require count/file-first API/docs current-state audits; patched `plite-automation` source rule to serialize managed `bun run playwright` proofs unless a prebuilt server/baseURL is explicitly owned; patched `plite-automation` source rule to treat Playwright mobile emulation keyboard proof as scoped proof, not raw mobile native typing; patched managed Playwright stale-server freshness and silent-review timeout fallback rules; ran `pnpm install`; generated mirror audited |
| reverted/quarantined packets | none yet |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Table-fragment merge policy | Remaining table fragment skips expose possible source-cell text loss and need semantics before blessing. | `.tmp/plite/packages/plite/test/transforms/insertFragment/of-tables/**`; prior plan open risk. | defer to explicit policy owner unless this run proves safe current behavior |
| 2 | Huge-doc residual micro-lanes | Current metrics are green/plateau, but repeated ShiftDown still has projection/render-frame cost vs ProseMirror/Lexical and select-all delete undo stays around `63-65ms`. | `.tmp/plite/tmp/slate-react-huge-document-*-benchmark*.json`; `huge-doc-residual-benchmark-refresh-after-full-check` row. | accept current runtime unless a designed projection/listener owner appears |
| 3 | Raw mobile proof | Desktop/browser proof is not raw Android/iOS proof. The scoped gate passed, but raw artifact is absent. | `.tmp/plite/scripts/proof/mobile-device-proof.mjs`; `.tmp/plite/test-results/release-proof/mobile-device-proof.json`. | run only on a real Appium/device lane; do not widen claims from proxy/viewport proof |
| 4 | Autoreview is not clean | Accepted findings were fixed, but the final clean rerun timed out silently after about `8.5m`; deterministic gates passed instead. | `plite-runtime-autoreview`, `post-autoreview-validation`, Workflow slowdowns. | accept deterministic proof for this packet; rerun smaller review only if new risk appears |
| 5 | Workflow-rule changes affect future automation | `plite-automation` now treats stale Playwright server reuse and silent review as first-class slowdowns. | `.agents/rules/slate-automation.mdc`; `.agents/skills/slate-automation/SKILL.md`. | accept; this matches the user's repeated complaints about false proof and early/weak loops |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| table-fragment-merge-policy | API/runtime | Should table-fragment merge semantics preserve source-cell text, target-cell text, or a deliberate Plite-native merge rule? | Current unskipped rows reportedly drop source-cell text; wrong choice would encode data-loss as expected behavior. | Table-fragment fixture unskip/repair. | Example parity and huge-doc residual work can continue. | Defer until a table policy owner/spec exists; do not bless current data loss. | `.tmp/plite/packages/plite/test/transforms/insertFragment/of-tables/**` |
| raw-mobile-device-artifacts | device proof | Is there a real Appium Android/iOS lane available that can write `test-results/release-proof/mobile-device-proof.json`? | Without the artifact, raw mobile claims stay intentionally unclaimed. | Raw-device claim expansion. | Desktop/browser/contract work can continue. | Keep claim scoped unless a real device lane is explicitly available. | `.tmp/plite/scripts/proof/mobile-device-proof.mjs` |

Findings:
- Current `agent-start` says full private-alpha integration/build/type/lint/perf
  closure is green; release/publish/PR/raw-device claims remain out of scope.
- Replacement scoreboard says no open generated cursor/caret or scoped mobile
  owners; huge-document direct comparison is current-green but narrow residual
  select-all/Shift+Down/undo deltas remain follow-up lanes.
- Example parity matrix still lists contributor-facing open rows:
  `code-highlighting`, `markdown-preview`, `markdown-shortcuts`, `tables`,
  `shadow-dom`, `styling`, `custom-placeholder`, and `scroll-into-view`.
- Prior 8h plan closed ProseMirror #416; do not reopen it from stale mid-plan
  hints.
- `scroll-into-view` is deleted from current v2 source, registry, and
  Playwright examples; the live behavior owner is package scroll contracts.
- `shadow-dom` current source keeps the legacy nested shadow structure and text
  while using current `usePliteEditor`; desktop browser proof is green after
  replacing fake-green returns with explicit skips.
- `styling` current source keeps the legacy two-editor style/className shape
  while using current `usePliteEditor`; desktop browser proof is green after
  awaiting load-state calls.

Decisions and tradeoffs:
- First packet routes to example parity / claim-width cleanup because broad
  behavior and huge-doc gates are already green in current docs, while example
  parity has explicit open user-facing rows.
- Table-fragment merge semantics are queued, not patched blind, because the
  current risk is data-loss policy rather than a tiny obvious fixture update.
- Do not restore legacy `scroll-into-view` by default: the legacy example says
  it can be removed if behavior is covered, and current package proof is green.
- Mark `shadow-dom` recovered: the source drift is current API shape, not an
  example rewrite, and the current proof is stronger than legacy after skip
  repair.
- Mark `styling` recovered: the source drift is current API shape, not an
  example rewrite, and the current proof covers the legacy behavior plus a
  current drag/undo row.
- Mark `markdown-preview` recovered: the source drift is the deliberate v2
  decoration-source API shape over the legacy Prism behavior; the old oracle
  was blind and now checks rendered preview classes.
- Mark `code-highlighting` extended: source drift is deliberate v2 code-line
  and decoration-source architecture, and the proof now keeps the legacy
  language-retoken invariant plus stronger editing/selection rows.
- Mark `markdown-shortcuts` extended: source drift is deliberate v2 extension
  architecture with ordered-list, NBSP, merge, history, and caret proof beyond
  the legacy same-path example.
- Mark `tables` extended for example parity only: source drift is deliberate
  conservative v2 table editing, selection, paste, and navigation behavior;
  package table-fragment merge semantics remain a separate policy checkpoint.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad docs status `rg` streamed too much output | 1 | Use targeted slices, counts, and artifacts; avoid broad `docs/**` line dumps. | Recorded as workflow slowdown; continue with capped reads. |
| Current-source `rg` included generated `site/out` bundle output | 1 | Use exact file lists and stronger generated-output exclusions. | Recorded as workflow slowdown; continue with exact path reads. |
| API/DX broad `rg -n` streamed too many docs/source matches | 2 | Use `rg -l` / `rg --count-matches` first, inspect suspect files with slices, or write full audit to artifact. | Source `plite-automation` rule patched and mirrored. |
| Root `bun test` was used against a type-only contract file | 1 | Split runtime test proof from type-contract proof. | `surface-contract` passed; `bun --filter ./packages/plite-react typecheck` passed. |

Verification evidence:
- Goal setup: `get_goal` returned none; `create_goal` started this plan.
- Checkpoint zero: `vision`, `docs/plite/agent-start.md`, and
  `docs/plans/templates/slate-automation.md` read before runtime work.
- Status/gap scan: scoreboard, roadmap, previous 8h plan, and example parity
  matrix read with targeted slices after the initial output miss.
- Scroll parity packet: `plite-react` focused Vitest proof passed 5 tests;
  `pnpm docs:plite:audit` passed after docs repair.
- Shadow DOM packet: desktop Playwright proof passed 18 tests with 3 explicit
  skips; `pnpm docs:plite:audit` passed after parity matrix repair.
- Styling packet: desktop Playwright proof passed 7 tests with 2 explicit skips;
  `pnpm docs:plite:audit` passed after parity matrix repair.
- Markdown-preview packet: first strengthened oracle failed because total
  segment count was a noisy Prism artifact; repaired to semantic class/text
  checks, and desktop Playwright proof passed 3 tests.
- Code-highlighting packet: added a CSS language-retoken oracle; focused
  retoken proof passed 3 tests, then full desktop file passed 48 with 6
  explicit skips.
- Markdown-shortcuts packet: converted silent mobile returns to explicit skips;
  full desktop Playwright proof passed 51 tests.
- Tables packet: full desktop Playwright proof passed 48 tests; example parity
  row closed, table-fragment policy remains queued.
- Skill repair packet: added mandatory route-level Playwright fake-green
  preflight scan to `plite-automation`; `pnpm install` synced the generated
  skill mirror; agent-native review found the instruction executable and mirrored.
- Validation packet: parent docs audit and `.tmp/plite` `bun check` passed.
- API/DX packet: stale-language/current-source audit found no active package
  alias/compat owner; `docs/general/docs-proof-map.md` proof row was patched to
  current-state wording; `bun test ./packages/plite-react/test/surface-contract.tsx`
  passed 31 tests; `bun --filter ./packages/plite-react typecheck` passed.
- Mobile claim-width packet: `bun test:mobile-device-proof` passed scoped proof
  and reported the raw artifact required for raw Android/iOS claims.
- Workflow repair packet: `plite-automation` source rule now requires
  count/file-first API/docs current-state audits; `pnpm install` regenerated the
  skill mirror and `rg` confirmed source/mirror parity.
- Generated stress packet: fake-green preflight classified only helper returns
  and artifact project metadata; targeted stress passed 6 Chromium tests; full
  generated stress passed 23 Chromium tests.
- Public hard-cut packet: first `bun test:release-discipline` failed only
  because escape-hatch inventory counts had not classified the new browser-proof
  rows; after updating the contract inventory, final `bun test:release-discipline`
  passed 432 tests.
- Table-fragment policy probe: local fixtures match upstream skipped fixture rows;
  temporary unskip failed all three v2 table-fragment rows; restored-skip
  focused run passed 3 and skipped 6, so the row stays a policy/spec defer.
- Fast validation: `.tmp/plite` `bun check` passed after contract updates;
  parent Plite-v2 docs audit passed after plan/rule/docs edits.
- Cross-editor huge-doc benchmark: sibling ProseMirror/Lexical dist outputs
  were present; the 5k/2-iteration comparison ran and identified vertical
  selection render fanout as the next measurable residual.
- Huge-doc vertical selection fanout packet: stable segment keys in
  `view-selection-decoration` cut middle staged repeated Shift+Down from
  `27.1ms` / `13` renders to `14.4ms` / `6` renders, kept virtualized middle
  about stable at `22.2ms` / `7` renders, and passed focused Vitest,
  `plite-react` typecheck, huge-doc keyboard Playwright, and visual/native
  screenshot smoke.
- Huge-doc selection breadth fallout proof: after stable segment keys, focused
  Chromium Playwright passed staged repeated Shift+Down, staged select-all
  delete/typing/paste/undo, virtualized select-all delete/typing/undo/redo, and
  virtualized repeated Shift+Down/Up.
- Benchmark honesty packet: cross-editor huge-doc artifacts now include
  projection-store and view-selection profiler summaries on Shift+Down and
  repeated Shift+Down samples, so the next fanout owner is explicit.
- Selection oracle packet: visual-native smoke now covers richtext multi-leaf
  DOM selection across marked leaves with model/native endpoint agreement and
  screenshot/no-double-highlight proof.
- Plite-browser helper packet: `assertPliteBrowserSelectionContract` now owns
  the repeated model/native selected-text plus no-double-highlight assertion
  path used by visual selection oracles.
- History/selection proof: focused desktop matrix for selected-text replacement,
  undo/redo, multi-leaf replacement, inline links, mentions, markdown shortcuts,
  and styling passed with only explicit browser-scope skips.
- Fast validation: `.tmp/plite` `bun check` passed after the selection,
  browser-helper, benchmark, visual smoke, and plan updates.
- Hidden DOM replay: hidden-content and DOM coverage selection/copy/delete/IME
  lanes passed across desktop browsers after view-selection key changes.
- Markdown/code sweep: full desktop markdown-shortcuts and code-highlighting
  files passed after the selection/helper/benchmark changes.
- Generated stress expansion: seeded high-risk selection/history/paste/IME and
  huge-doc cut families passed in Chromium.
- Public/proof contracts: release-discipline passed after classifying the new
  visual smoke proof-row inventory count.
- Cross-editor refresh: final benchmark instrumentation ran across Plite,
  ProseMirror, and Lexical; a focused Plite rerun confirmed the view-selection
  key packet remains materially faster despite one noisy full-run sample.
- Stable selection replay after sync split: broad desktop selection/history/
  navigation replay across plaintext, richtext, inlines, mentions, markdown
  shortcuts, and styling passed `223`, skipped `50` after splitting and
  repairing one stale richtext triple-click current-block oracle.
- Richtext triple-click oracle repair: focused Chromium/WebKit repeat passed
  `18`, and the oracle now asserts the intended current-block model range plus
  native selected text.
- DOM repair scheduler leak repair: first `bun check` failed with an unhandled
  `requestAnimationFrame` teardown error; focused scheduler/editable behavior
  Vitest passed `42` after the editor-window scheduler repair; final
  `.tmp/plite` `bun check` passed with slate-react Vitest `749` and no
  unhandled error.
- Scheduler-adjacent browser replay: focused desktop route replay for caret
  after typing/paste/IME/remount/scroll-away/follow-up typing passed `33`,
  skipped `3` explicit browser-scope rows across Chromium/Firefox/WebKit.
- Full huge-document refresh after scheduler repair: full desktop
  `huge-document.test.ts` passed `58`, skipped `32` explicit browser-scope rows
  across Chromium/Firefox/WebKit.
- Huge-document benchmark refresh after scheduler repair: staged keyboard and
  browser trace ran from the current build; no long-task red flag, type-to-paint
  max `29ms`, select-to-paint max `56.6ms`, repeated ShiftDown `21.6-21.7ms`.
- Generated stress after scheduler repair: full Chromium generated editing
  stress passed `23`.
- Public/proof contract refresh: release-discipline passed `432` after
  classifying the new browser-proof and slate-react-test bridge inventory rows.
- Fast validation after proof-contract refresh: `.tmp/plite` `bun check`
  passed after the inventory update.
- Visual/native smoke after scheduler repair: full desktop smoke passed `22`,
  skipped `2` explicit browser-scope rows.
- Advanced stable desktop refresh after scheduler repair: images, embeds,
  inlines, mentions, tables, paste-html, editable voids, hovering toolbar,
  search highlighting, comment mode, forced layout, and multi-root desktop sweep
  passed `663`, skipped `42` explicit browser-scope rows.
- Cross-editor huge-doc refresh after scheduler repair: Plite virtualized
  repeated ShiftDown is near frame floor at `15.2ms`, while Plite auto start
  repeated ShiftDown remains the residual at `22.9ms`; Plite virtualized typing
  and DOM budget still beat ProseMirror/Lexical.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-11-plite-8h-automation.md`.
- Surface and route/package: broad Plite private-alpha supervision across `.tmp/plite` runtime/tests/benchmarks plus parent Plite-v2 docs/skills.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: timed `8h`; closeout starts after loop `126`; final audit/check-complete runs after the 2026-06-12 02:23:51 CEST minimum.
- Behavior gates and visual proof: stable desktop replay, huge-document desktop replay, generated stress, visual/native smoke, full `bun check:full`, focused Firefox flake repeat, final strict visual/native smoke, and final `bun check` recorded above.
- Primary metric baseline/latest/best and stop reason: huge-doc residual metrics stayed green/plateau; no dirty speculative perf packet remains; stop after minimum runtime because active packet is classified and final plan gates pass.
- Bugs fixed and oracles added: runtime selection/history fixes, huge-document label formatter, visual/native smoke/helper proof, mobile proof transport, scheduler contract, and current-state example oracles recorded in packet ledger.
- Benchmark/skill/docs repairs: benchmark/profile proof refreshed; `plite-automation` source rule repaired for fake-green scans, API/docs audit output, managed Playwright server freshness, mobile claim width, and silent review timeout; docs parity/proof-map rows repaired.
- Workflow slowdowns and repairs: output-budget misses, stale Playwright server, backtick audit trap, silent review timeout, and full-gate retry-green classification are logged.
- Changed list: filled in `Changed list`.
- Needs your attention: filled in `Needs your attention`.
- Stopping checkpoints to unblock: table-fragment policy and raw-device artifact availability remain queued.
- Accepted deferrals and residual risks: raw mobile proof unclaimed, table-fragment semantics deferred, huge-doc micro-lanes plateaued, final clean autoreview not claimed.
- Next owner: user review/commit decision or continue automation on queued policy/raw-device/residual lanes.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Loop 130, latest runtime/helper/benchmark/test changes pass fast validation, stable replay, generated stress, release-discipline, full private-alpha gate, focused flake repeats, strict visual/native smoke, final fast runtime check, and supplemental public proof. |
| Where am I going? | Final docs audit, autogoal `check-complete`, then final handoff after the 8h minimum. |
| What is the goal? | Automate Plite private-alpha closure for a minimum 8h timed run; close, queue, or block all packets with evidence before handoff. |
| What have I learned? | Broad private-alpha gates are green/scoped; full-suite retry-greens must be classified with focused no-retry repeats; raw-device and table-fragment policy remain real boundaries. |
| What have I done? | Created active goal, filled plan, read north-star/control docs, selected first packet family, closed stale `scroll-into-view` parity docs, recovered `shadow-dom`/`styling`/`markdown-preview`, marked `code-highlighting`/`markdown-shortcuts`/`tables` extended with proof repairs, validated the batch, repaired fake-green and API/docs output-budget rules, added visual/native smoke, promoted `clickTextRange`, refreshed huge-doc smoke/benchmarks, repaired docs proof-map wording, scoped mobile claims, repaired visual/native and history/selection oracles, accepted autoreview fixes, fixed huge-document block label formatting, repaired stale-server/silent-review workflow rules, ran full private-alpha proof, and classified the final Firefox flake with a focused no-retry repeat. |
| What changed in the checkpoint plan? | Added example parity, huge-doc residual, table-fragment policy, output-budget slowdown, scroll parity, shadow DOM parity, styling parity, markdown-preview oracle, code-highlighting oracle, markdown-shortcuts skip-repair, tables policy-split, fake-green preflight, visual smoke, plite-browser helper promotion, huge-doc smoke/benchmark health, API/DX audit, mobile claim-width, workflow output-budget repair, generated stress rows, selection-breadth fallout proof, benchmark projection-profiler honesty, multi-leaf visual/native selection oracle, selection-oracle helper promotion, history/selection cross-browser sweep, fast validation, hidden DOM selection replay, markdown/code regression sweep, public/proof contract refresh, post-autoreview validation rows, full private-alpha gate, and focused flake repeat. |

Timeline:
- 2026-06-11T16:23:46.878Z Goal plan created.
- 2026-06-11T18:23:51+02:00 Goal plan filled and active goal created for
  timed 8h slate automation.
- 2026-06-11T18:35+02:00 Status/gap scan routed first packet to
  contributor-facing example parity / claim-width cleanup.
- 2026-06-11T18:40+02:00 Scroll-into-view parity docs repaired and verified
  with focused `plite-react` package proof plus docs audit.
- 2026-06-11T18:45+02:00 Shadow DOM Playwright fake-green skips repaired;
  desktop proof and docs audit passed.
- 2026-06-11T18:49+02:00 Styling Playwright async wait repaired; desktop proof
  and docs audit passed.
- 2026-06-11T18:58+02:00 Markdown-preview oracle upgraded from text-only to
  rendered preview-class proof; desktop proof passed.
- 2026-06-11T19:06+02:00 Code-highlighting retoken oracle added; full desktop
  proof passed.
- 2026-06-11T19:12+02:00 Markdown-shortcuts mobile fake-greens converted to
  explicit skips; full desktop proof passed.
- 2026-06-11T19:18+02:00 Tables example proof passed; parity row closed as
  extended while table-fragment policy remains queued.
- 2026-06-11T19:45+02:00 Batch docs audit and `.tmp/plite` `bun check`
  passed; `plite-automation` fake-green preflight rule patched and mirrored.
- 2026-06-11T20:00+02:00 API/DX current-state audit repaired one docs proof-map
  wording; `surface-contract` and `plite-react` path-filter typecheck passed.
- 2026-06-11T20:05+02:00 Scoped mobile proof passed; raw device artifact absent,
  so raw Android/iOS claims remain intentionally unclaimed.
- 2026-06-11T20:10+02:00 API/docs output-budget rule patched in
  `plite-automation`, `pnpm install` regenerated the skill mirror, and source /
  mirror audit passed.
- 2026-06-11T20:20+02:00 Targeted generated stress passed 6 Chromium tests;
  full generated stress passed 23 Chromium tests.
- 2026-06-11T20:25+02:00 Public hard-cut contracts passed 432 tests after
  classifying new browser-proof escape-hatch inventory counts.
- 2026-06-11T20:35+02:00 Table-fragment policy probe compared upstream skipped
  skipped fixture rows, confirmed v2 unskip failures, restored skips, and reran the
  focused fixture filter green.
- 2026-06-11T20:45+02:00 `.tmp/plite` `bun check` and parent
  `pnpm docs:plite:audit` passed after contract/docs/rule updates.
- 2026-06-11T20:55+02:00 Cross-editor huge-doc benchmark ran against Plite,
  ProseMirror, and Lexical; Plite wins typing/DOM but still loses repeated
  Shift+Down due render fanout.
- 2026-06-11T21:21+02:00 Stable segment keys replaced endpoint-derived
  view-selection decoration keys; focused contract/typecheck/keyboard/visual
  proof passed; staged middle repeated Shift+Down improved to `14.4ms` with
  render fanout down to `6`.
- 2026-06-11T21:25+02:00 Broad huge-doc selection fallout proof passed after
  the key-stability packet.
- 2026-06-11T21:32+02:00 Cross-editor huge-doc benchmark artifact gained
  projection-store/view-selection profiler summaries; short `slateAuto`
  validation passed and showed the new JSON fields.
- 2026-06-11T21:40+02:00 Visual-native smoke gained a richtext multi-leaf
  DOM selection screenshot proof; full Chromium/Firefox/WebKit matrix passed
  `14`, skipped `1`.
- 2026-06-11T21:46+02:00 `assertPliteBrowserSelectionContract` gained
  `noDoubleSelectionHighlight`; `plite-browser` typecheck and visual-native
  matrix passed.
- 2026-06-11T21:53+02:00 Focused stable history/selection desktop matrix
  passed `18`, skipped `12` explicit browser-scope rows.
- 2026-06-11T22:00+02:00 `.tmp/plite` `bun check` passed after the
  accumulated runtime/helper/benchmark/test updates.
- 2026-06-11T22:08+02:00 Hidden-content and DOM coverage desktop replay passed
  `55`, skipped `5` explicit rows.
- 2026-06-11T22:20+02:00 Full markdown-shortcuts and code-highlighting desktop
  sweep passed `99`, skipped `6` explicit rows.
- 2026-06-11T22:24+02:00 Seeded generated stress for selection/history/paste/IME
  and huge-doc cut passed `8` Chromium cases.
- 2026-06-11T22:27+02:00 Release-discipline passed `432` after classifying
  browser proof-row inventory drift from the helper-backed visual smoke.
- 2026-06-11T22:31+02:00 Full final cross-editor huge-doc benchmark ran with
  new projection profiler fields; focused 4-iteration Plite rerun confirmed
  staged/virtualized middle repeated Shift+Down near `14-15ms` with render
  count `6`.
- 2026-06-11T23:02+02:00 Stable selection/history/navigation replay after the
  sync-selection split passed `223`, skipped `50` across Chromium/Firefox/
  WebKit after repairing the stale richtext current-block triple-click oracle.
- 2026-06-11T23:10+02:00 Full `.tmp/plite` `bun check` exposed and then
  proved the DOM repair scheduler leak repair: editor-window scheduler
  contracts passed focused Vitest `42`; full fast gate passed with slate-react
  Vitest `749`.
- 2026-06-11T23:12+02:00 Scheduler-adjacent browser replay passed `33`, skipped
  `3` across Chromium/Firefox/WebKit.
- 2026-06-11T23:14+02:00 Full huge-document desktop refresh passed `58`,
  skipped `32` after the scheduler repair.
- 2026-06-11T23:16+02:00 Huge-document staged keyboard and browser trace
  benchmarks refreshed from the current build; metrics stayed green/plateau.
- 2026-06-11T23:17+02:00 Full generated Chromium stress passed `23` after the
  scheduler repair.
- 2026-06-11T23:18+02:00 Release-discipline passed `432` after proof/test
  inventory count refresh.
- 2026-06-11T23:19+02:00 `.tmp/plite` `bun check` passed after the
  proof-contract inventory update.
- 2026-06-11T23:20+02:00 Visual/native selection smoke passed `22`, skipped
  `2`.
- 2026-06-11T23:40+02:00 Advanced stable desktop sweep passed `663`, skipped
  `42` after the scheduler repair.
- 2026-06-11T23:41+02:00 Cross-editor huge-doc benchmark refreshed; residual
  narrowed to Plite auto start-block vertical selection.
- 2026-06-12T02:05+02:00 Post-autoreview `bun check:full` passed hard gates:
  `1777` passed, `690` skipped, `1` retry-green Firefox visual/native row.
- 2026-06-12T02:22+02:00 Focused Firefox no-retry repeat passed `5/0`, so the
  final full-gate retry-green is classified as a load flake, not a runtime patch.
- 2026-06-12T02:26+02:00 Final strict visual/native smoke passed `22`, skipped
  `2` across Chromium/Firefox/WebKit with no retries.
- 2026-06-12T02:28+02:00 Final `.tmp/plite` `bun check` passed lint,
  package/site/root typecheck, package tests, slate-layout, and slate-react
  Vitest.
- 2026-06-12T02:29+02:00 Supplemental `bun test:release-discipline` passed
  `432`; second Firefox focused no-retry table drag repeat passed `5/0`.

Open risks:
- Raw Android/iOS/device proof remains unclaimed unless a raw-device lane runs.
- Table-fragment merge semantics are policy debt, not a safe blind fixture
  change.
- Huge-document residual micro-lanes remain narrow follow-ups, not broad
  architecture blockers.
- Table-fragment merge semantics remain a policy gap shared with upstream; v2
  currently fails the skipped expected rows and should not be fixed without a
  table-fragment spec.
