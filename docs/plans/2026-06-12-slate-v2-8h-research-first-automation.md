# Slate v2 8h research first automation

Objective:
Run minimum 8h Slate v2 private-alpha automation with research-first discovery,
then promote concrete leads into proof packets, docs, or owner deferrals.

Goal plan:
docs/plans/2026-06-12-slate-v2-8h-research-first-automation.md

Template:
docs/plans/templates/slate-auto.md

Primary template:
docs/plans/templates/slate-auto.md

Applied packs:
- none

Automation source:
- type: user-invoked skill
- prompt / link: `[$slate-auto](/Users/zbeyens/git/plate-2/.agents/skills/slate-auto/SKILL.md) 8h`
- surface / route / package: Slate v2 private-alpha supervision; start from
  external research / OSS discovery, then promote only concrete leads into
  `.tmp/slate-v2` proof packets or durable docs.
- invocation mode: timed mode
- minimum runtime / deadline: 8h minimum active automation, start
  `2026-06-12 12:14:33 CEST`, target no earlier than
  `2026-06-12 20:14:33 CEST`
- completion threshold summary: close or queue every active checkpoint with
  evidence; every packet ends keep/revert/quarantine; final handoff includes
  changed list, workflow slowdowns, needs-your-attention, stopping
  checkpoints, commands, and next owner.

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
- Extracted prompt requirements:
  - use `slate-auto`;
  - run timed `8h`, meaning minimum active automation runtime;
  - do not stop early when obvious backlog dries up; enter supervision mode;
  - give research more weight after prior internal proof loops;
  - start with web/GitHub/OSS discovery when it can improve testing,
    selection/native behavior, huge-document behavior/perf, pagination,
    virtualization, table semantics, API/DX, or workflow;
  - do not patch runtime from snippets or issue titles;
  - code-level claims require local source inspection, then Slate-native proof;
  - keep Slate v2 private alpha: no release, publish, PR, or changeset framing;
  - defer raw mobile claims until a real device lane exists;
  - if no obvious implementation remains, predict the next checkpoint from
    `vision`, current evidence, weak proofs, benchmark gaps,
    issue/test harvest gaps, docs/API mismatch, and workflow slowdowns.

Completion threshold:
- This run is complete only after the minimum runtime has elapsed, the current
  packet is verified/reverted/quarantined, research ledgers name kept and
  rejected leads, promoted leads have owner/proof commands or explicit defers,
  and all plan gates are checked with evidence.
- Closure is legal only when required behavior, visual/native selection,
  package/API, mobile/raw-device claim-width, huge-document, docs/skill repair,
  changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and
  final handoff rows are complete, explicitly deferred, or N/A with evidence,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-12-slate-v2-8h-research-first-automation.md`
  passes.

Verification surface:
- Parent repo proof: this plan, `docs/slate-v2/research/**`,
  `docs/research/raw/**` metadata only, and `docs/slate-v2/**` claim docs.
- Slate v2 proof, when promoted from research: run focused commands from
  `.tmp/slate-v2`, not the parent repo.
- Browser proof, when a behavior claim is made: Playwright or Browser evidence
  with model plus native/DOM/visual assertions, not model-only text deltas.
- Research proof: query, repo, read, lead, rejected, and promoted ledgers under
  `docs/slate-v2/research/<date>-<topic>/`.
- Final mechanical proof:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-12-slate-v2-8h-research-first-automation.md`.

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
- Source of truth: `.agents/skills/slate-auto/SKILL.md`,
  `.agents/skills/vision/SKILL.md`, `.agents/skills/slate-research/SKILL.md`,
  `docs/slate-v2/**`, `docs/slate-browser/**`, and `.tmp/slate-v2` runtime
  source/tests when a packet is promoted.
- Allowed edit scope: generated plan state; `docs/slate-v2/research/**` and
  `docs/research/raw/**` research metadata; `.tmp/slate-v2` only for promoted
  proof packets; `.agents/rules/**` only if the loop proves skill repair is
  required, followed by `pnpm install`.
- Browser surfaces: Slate v2 example routes only when a promoted lead requires
  behavior proof; huge-document lanes remain likely high-value.
- Package/API surfaces: only if research or status evidence finds a concrete
  current API/DX mismatch.
- Agent/skill surfaces: `slate-auto`, `slate-research`, `slate-browser`,
  `autogoal`, and related source rules only when a workflow miss recurs.
- Docs/research surfaces: `docs/slate-v2/research/**` by default; raw bulk under
  `docs/research/raw/**`; no large raw dumps inside Slate v2 research artifacts.
- Non-goals: release/publish/PR readiness; raw mobile claims without real device
  lane; broad blind soaks; external issue ledger closure unless it is clearly
  the best owner; Plate product patches.

Blocked condition:
- Block only when no safe alternate checkpoint remains and the next action needs
  missing user taste, inaccessible external source, missing credential/device,
  unsafe architecture authority, or a repeated tool failure that has consumed
  three consecutive attempts with no new evidence.
- Do not block while a safe alternate checkpoint remains runnable. In timed or
  batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious
  backlog looks empty. Enter supervision mode and infer the next checkpoint from
  `vision`, current evidence, weak proofs, benchmark gaps, API/docs
  mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- surface: Slate v2 research-first private-alpha supervision
- mode: timed
- minimum_runtime: 8h active automation
- target_deadline: not before `2026-06-12 20:14:33 CEST`
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 47
- current_checkpoint: huge-doc-post-delete-burst-and-staged-undo-attribution
- current_checkpoint_status: active / final 200k fresh-build trace keeps Delete fast but exposes post-delete typed-burst cadence as the remaining hot lane: staged burst `2357.3ms`, virtualized burst `337.8ms`, staged undo-type `314ms`, virtualized undo-type `17.9ms`
- next_checkpoint: huge-doc-post-delete-burst-and-staged-undo-attribution
- goal_status: active

Current verdict:
- verdict: first five research packets kept; table-fragment execution is queued
  behind the `slate-plan` review boundary, huge-doc start-block repeated
  ShiftDown regression is fixed with a targeted runtime patch, and the
  route-local huge-doc vertical-selection proof, richtext rapid/cross-block IME
  proof, async-decoration composition proof, and virtualized scroll stability
  proof are now named in
  `slate-browser` first-party contracts. Huge-doc benchmark output now exposes
  materialization frames and scroll-delta metrics for cold and materialized
  selection, including full-wrapper `METRIC` lines. `slate-dom` now has an
  explicit contract that virtualized unmounted points/ranges do not get fake
  DOM coordinates; exact DOM APIs return `null`, while `DOMCoverage` returns
  boundary-aware results. `slate-react` now explicitly retains expanded
  selection endpoint top-level rows outside a virtualized visible page window
  without retaining unrelated off-window siblings. 100k/200k virtualized smoke
  shows DOM/materialization stay bounded at extreme size, and the huge-document
  example now avoids caching generated initial values above 50k blocks, reducing
  200k heap from about `391MB` to `326MB`. 200k click-to-paint is no longer the
  blocker: attribution traced it to content-root owner scanning during projected
  drag endpoint preparation, and the kept fix drops 200k virtualized
  click-to-paint p95 from about `306ms` to about `40ms`. 200k virtualized
  select-all/delete/typing/undo now restores the full document after fixing
  variadic child replacement in core `replace_children` replay; cached
  full-root replace snapshot/live-index reuse now removes the 200k
  snapshot-index rebuild, snapshot-to-live-index conversion, DOM path-sync
  rebuild, and cached-restore dirty-path expansion from history restore, with
  virtualized undo-delete down from a 45s timeout / stack overflow to about
  `0.25s`. The 200k Delete hot path is now sub-30ms after internal-owned
  replay clone skipping and full-root node-impact sentinel use, and the first
  key after Delete is now about `20ms` after skipping pending DOM selection
  flush when model selection is already preferred. Virtualized undo-after-type
  is also fixed by skipping model-preserve keydown selection flushes, but staged
  undo-after-type remains about `288ms` because staged text input re-enters
  DOM-current. IME overlap
  cancellation is narrowed to a
  ProseMirror-style policy proposal and remains a user-attention / plan
  checkpoint, not a runtime patch.
- confidence: high for the huge-doc repeated vertical selection fix, 200k
  click attribution/fix, 200k select-all/delete restore, Delete latency, and
  first-key-after-delete latency, and virtualized undo-after-type latency;
  medium for remaining staged undo-after-type latency because behavior is
  correct but the staged lane still pays about `288ms`.
- next owner: slate / slate-react / slate-ar-perf
- keep / revert / quarantine call: keep research artifacts; promote
  `table-fragment-contract-001`; keep planning artifact; keep huge-doc runtime
  patches, core operation fix, and benchmark artifacts.
- reason: ProseMirror tables provide a precise rectangle-algebra invariant for
  table fragments, while CodeMirror/Slate v2 huge-doc evidence says to keep
  hybrid projected selection, measured owner-scan costs, and stack-safe core
  range operations instead of rearchitecting from hunches.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-12-slate-v2-8h-research-first-automation.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-auto | complete | P0 | Copy prompt requirements and read north-star before implementation. | Requirement rows complete. | keep |
| status | slate-auto | complete | P0 | Read active plan, latest prompt, source status, and current evidence. | Current state recorded through loop 46. | keep |
| gap-scan | slate-auto | complete | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Gaps routed to research, huge-doc, oracle, browser, and policy packet owners. | keep |
| research-discovery-status | slate-research | complete | P0 | Start with external OSS/web discovery instead of internal-only soak. | Research artifacts exist with queries/leads/rejections and promote/defer decisions. | keep |
| table-fragment-semantics-research | slate-research / slate-plan | complete | P0 | Prior loops surfaced skipped table-fragment semantics; external editors likely have mature invariants. | `docs/slate-v2/research/2026-06-12-table-fragment-semantics/**` promotes `table-fragment:rectangle-algebra:core-browser-proof`. | keep |
| table-fragment-contract-001 | slate-plan / slate core fixtures | complete / queued | P0 | Promoted research needs a Slate-native contract before tests/runtime; dirty unskip would bless unsettled behavior. | `docs/plans/2026-06-12-slate-v2-table-fragment-rectangle-algebra-plan.md` created with current-state pass, target contract, proof gates, and open issue-accounting pass. | keep/queue |
| huge-doc-native-selection-research | slate-research / slate-ar-perf | complete | P0 | Huge-document lanes still need comparative source ideas for selection/perf without breaking native behavior. | `docs/slate-v2/research/2026-06-12-huge-doc-native-selection/**` promotes projection metric honesty and staged/full-DOM parity packets. | keep/promote |
| huge-doc-projection-metric-packet | slate-ar-perf | complete | P0 | Research says residual ShiftDown/undo work needs honest metrics before runtime optimization. | Strict 50-step cross-editor benchmark, staged/full-DOM parity benchmark, focused Playwright screenshots/native-selection tests, slate-react Vitest, and typecheck passed. | keep |
| testing-oracle-research | slate-research / slate-browser | complete | P1 | Better native selection/IME/paste oracles are high leverage across future loops. | `docs/slate-v2/research/2026-06-12-testing-oracles/**`; promoted huge-doc vertical-selection contract row; focused slate-browser test and typecheck passed. | keep/promote |
| ime-composition-edge-matrix | slate-browser / slate-patch | complete | P1 | ProseMirror source shows stronger IME edge coverage than current first-party contract names. | Added `ime-composition-formatted-boundaries`; slate-browser core/typecheck passed; Chromium richtext IME proof passed 8 rows; WebKit compositionend proof passed 2 rows. | keep/promote |
| geometry-coords-oracle-audit | slate-research / slate-browser | complete | P1 | ProseMirror selection source shows useful coords/RTL/wrapped-line oracle pressure; decide if current Slate v2 has enough or needs a promoted row. | `bun --filter slate-browser test:selection` passed 9 tests; `bun test ./packages/slate-dom/test/bridge.ts` passed 26 tests; no new route-shaped contract row. | keep/covered-existing |
| domchange-selection-repair-audit | slate-research / slate-dom / slate-react | complete | P1 | ProseMirror DOM-change tests point at selection adjustment and ambiguous native deletion/replacement repair. | Promoted `native-beforeinput-target-range-repair`; slate-browser core/typecheck, slate-react repair contracts, and focused plaintext Playwright rows passed. | keep/promote |
| clipboard-open-slice-context-audit | slate-research / slate-plan / slate-browser | complete | P1 | ProseMirror clipboard tests point at open-slice/context semantics; decide whether this folds into table-fragment contract or needs a separate Slate-native owner. | Promoted `external-clipboard-slice-context`; slate-browser core/typecheck, slate-dom clipboard boundary, slate-react projected clipboard, and focused paste-html Playwright rows passed. | keep/promote |
| ime-overlap-rapid-crossparagraph-audit | slate-research / slate-browser / slate-patch | complete / split-promoted | P1 | ProseMirror composition tests still name overlap cancellation, rapid consecutive composition, decoration-change, and cross-paragraph rows not covered by the formatted-boundary contract name. | Promoted `ime-composition-cross-block-repair`; richtext Chromium proof passed 3 rows for rapid consecutive, native cross-paragraph, and synthetic cross-paragraph helper regression; scenario guard and `slate-browser` typecheck passed. | keep/split |
| slate-browser-ime-synthetic-transport-repair | slate-browser | complete | P1 | Synthetic IME transport crashed or double-inserted when replacing expanded cross-block selections because helper fallback touched React-owned DOM or raced compositionend fallback. | Patched `.tmp/slate-v2/packages/slate-browser/src/playwright/ime.ts`; focused richtext proof passed. | keep |
| ime-overlap-decoration-audit | slate-research / slate-browser / slate-patch | complete / promoted-contract | P1 | The remaining ProseMirror IME pressure is overlap cancellation and decoration-change during composition; rapid/cross-paragraph proof must not overclaim those. | Promoted `ime-composition-decoration-refresh`; async-decoration Chromium proof passed 2 rows; richtext regression, scenario guard, and `slate-browser` typecheck passed. | keep/split |
| slate-browser-stepwise-ime-api | slate-browser | complete | P1 | Decoration/overlap composition rows need to interleave app changes between compositionstart/update/commit; all-at-once `ime.compose()` cannot express that. | Added typed `startSynthetic`, `updateSynthetic`, and `commitSynthetic` harness methods backed by shared synthetic IME transport helpers. | keep |
| ime-overlap-cancellation-audit | slate-research / slate-browser / slate-patch | deferred / missing-taste | P1 | ProseMirror overlap cancellation rows model app/document edits that fully or partially overlap an active composition; needs a legitimate Slate-native surface or explicit defer. | Queued `ime-overlap-cancellation-taste` stopping checkpoint; no runtime policy patch until Slate-native authority is accepted. | defer |
| ime-overlap-policy-research | slate-research / slate-plan | complete / proposal-deferred | P1 | Missing taste should be narrowed by external editor source before asking the user; ProseMirror is not enough to define Slate policy. | `docs/slate-v2/research/2026-06-12-ime-overlap-policy/**` recommends ProseMirror-style overlap cancellation, with `slate-plan` policy review before runtime patch. | keep/defer |
| huge-doc-architecture-research | slate-research / slate-ar-perf | complete / promoted-contract | P0 | Huge-document staged/virtualized behavior remains the highest-value recurring risk; research should compare source-level editor architectures before more local tweaks. | `docs/slate-v2/research/2026-06-12-huge-doc-architecture/**`; promoted `huge-document-virtualized-scroll-stability`; scenario guard, focused Chromium scroll proof, and typecheck passed. | keep/promote |
| huge-doc-scroll-anchor-metric-honesty | slate-ar-perf | complete / promoted-metrics | P0 | CodeMirror source shows scroll anchor drift and viewport settle frames are core huge-doc architecture metrics; Slate benchmarks should expose them before more scroll/runtime work. | Browser trace and full wrapper now emit cold/materialized selection materialization frame and scroll-delta metrics; contract test and smoke benchmarks passed. | keep/promote |
| huge-doc-estimated-coordinate-contract | slate-dom | complete / promoted-contract | P1 | CodeMirror source separates precise DOM coordinate answers from estimated/projected answers when DOM is absent; Slate v2 should make that boundary explicit before optimizing coords/scroll behavior. | Added `dom-coverage.ts` contract proving exact DOM coordinate/range APIs return `null` for virtualized unmounted ranges while `DOMCoverage` returns boundary-aware results; test and typecheck passed. | keep/promote |
| huge-doc-selection-endpoint-retention-audit | slate-react | complete / promoted-contract | P1 | CodeMirror keeps selection endpoints in extra viewports; Slate v2 claims selected endpoint retention through virtualized planning and projected selection but needs exact coverage mapping. | Added expanded selection endpoint retention contract in `dom-strategy-page-virtualization.test.tsx`; Vitest and typecheck passed. | keep/promote |
| huge-doc-big-document-height-scaling-audit | slate-ar-perf | complete / kept-memory-packet | P2 | CodeMirror scales very large document heights around active viewports; Slate v2 should check claim width at 100k/200k blocks before any runtime architecture change. | 100k/200k virtualized smokes passed; example cache cap above 50k kept; 200k click latency routed to and fixed by follow-up attribution. | keep/promote |
| huge-doc-200k-click-selection-attribution | slate-ar-perf / slate-react | complete / kept-runtime-packet | P1 | 200k virtualized click-to-paint remained hundreds of milliseconds while DOM, materialization, and typing stayed bounded. | Added mouse phase and root mousedown phase metrics; traced hotspot to projected drag endpoint content-root owner scanning; fixed plain-schema owner lookup; 200k virtualized click-to-paint p95 now `39.8ms`. | keep/promote |
| huge-doc-200k-select-all-delete-attribution | slate-react / slate-ar-perf | complete / kept-runtime-packet | P1 | Prior huge-doc user reports named Cmd+A + Delete latency; click is no longer hiding the next editing bottleneck. | Added opt-in select-all/delete browser trace and core huge-range `replace_children` contract; fixed stack overflow in bulk child replacement; strict fresh-build 200k virtualized proof restores after undo-delete. | keep/promote |
| huge-doc-cross-strategy-command-smoke | slate-react / slate-ar-stabilize | complete / kept-proof-packet | P1 | 200k virtualized select-all/delete is fixed, but huge-document correctness still needs broader command smoke across available strategies before this lane can stop. | 20k browser trace passed auto/staged/virtualized select-all/delete/undo restore; focused Chromium Playwright route rows passed auto typing/nav/undo/redo, virtualized select-all/delete/redo, paste-select-all undo, 5k typing/arrows/Enter/scroll, 20k materialization, insert-break, and scroll stability. | keep |
| huge-doc-200k-delete-history-latency-attribution | slate / slate-react / slate-ar-perf | complete / kept-measurement-packet | P1 | Correctness is restored, but 200k type-after-delete and undo-delete still cost about `2.34s`; that may be an avoidable history/value hot path. | Browser trace now records phase event timing, profiler duration, dispatch/model-wait split, and the reverted no-flush experiment; strict fresh-build 200k proof remains correct after revert. | keep/quarantine-experiment |
| huge-doc-200k-undo-delete-publish-cost-research | slate-react / slate-ar-perf | complete / kept-runtime-packet | P1 | Undo-delete and select-all were paying a global `slate-view-selection` projection tax because the source lived above the editable layer with no mounted runtime scope. | Moved view-selection decoration source into `EditableTextBlocks`, clipped scoped output to mounted top-level ids plus selection endpoints, added contract coverage, and reran focused browser proof. Final 200k trace: select-all-to-paint `31.4ms` versus prior `251.7ms`; source-listener p95 `0ms`; view-selection projection in undo-delete `0.1ms`; undo-delete remains `1825.6ms`. | keep |
| huge-doc-200k-undo-delete-core-snapshot-delta-research | slate / slate-react / slate-ar-perf | complete / kept-runtime-packet | P1 | After removing view-selection publish cost, 200k undo-delete still built a snapshot runtime index and then rebuilt the live runtime index during DOM path sync. | Added snapshot clone/index profiler labels and reused the main-root snapshot index traversal to populate the live runtime-index cache. Quarantined a DOM-path-sync skip because it moved cost into selector dispatch and did not improve wall time. Final 200k undo-delete-to-paint `1524.4ms` versus prior kept `1825.6ms`. | keep/quarantine-experiment |
| huge-doc-core-fragment-delete-history-parity | slate / slate-history / slate-ar-perf | complete / kept-api-perf-packet | P1 | The core benchmark exposed direct `tx.fragment.delete` full-document deletion replaying thousands of operations while browser commands used one `replace_children`. | Added subscribed core history benchmark lane, current-only profiling mode, full-document delete/history contracts, and the core fast path; 5k core lane dropped from `6197.01ms` to `28.11ms`, 20k current-only lane completed at `105.02ms`. | keep |
| huge-doc-200k-replace-children-and-snapshot-index-architecture | slate / slate-ar-perf | complete / split | P1 | The remaining browser undo-delete hot path was one 200k snapshot index build, child clone, and `replace_children` replay. | Full-root cached snapshot+live-index reuse removed the snapshot-index rebuild and DOM path-sync rebuild; remaining replay/live-index conversion owner is split below. | split/keep |
| huge-doc-200k-replace-children-apply-cost-attribution | slate / slate-react / slate-ar-perf | complete / kept-runtime-packet | P1 | Cached-index reuse proved index work alone was not enough; live-index seeding was required so cost did not move into DOM path sync. | Focused core/history/snapshot gates and three 200k browser traces passed. Best virtualized undo-delete `1401.5ms`; staged `1602.5ms`; restored `1`. | keep/split |
| huge-doc-200k-apply-replace-children-replay-design | slate / slate-ar-perf | complete / kept-runtime-packet | P1 | After the kept cache packet, 200k undo-delete was dominated by `apply-replace_children` around `728ms` and cached snapshot-to-live-index conversion around `251ms`. | Cached the already-built live runtime index for full-root replace children; fresh 200k virtualized undo-delete `736.3ms`; staged/virtualized cross-strategy proof `931.8ms` / `748.4ms`; restored `1`. | keep/split |
| huge-doc-200k-replace-children-apply-replay-and-clone-design | slate / slate-ar-perf | complete / kept-runtime-packet | P1 | After live-index preservation, 200k undo-delete was mostly `apply-replace_children` around `299ms`, `snapshot-reuse-clone-children` around `199ms`, and request repair around `123ms`. | Cached full-root restores now dirty only the root path; fresh 200k virtualized undo-delete `442.3ms`, cross-strategy staged/virtualized `633.6ms` / `416.7ms`, restored `1`. | keep/split |
| huge-doc-200k-snapshot-clone-and-repair-design | slate / slate-history / slate-ar-perf | complete / kept-runtime-packet | P1 | After dirty-path fast path, 200k undo-delete was mostly snapshot child clone around `195ms`, keydown request repair around `122ms`, and notify/selector dispatch around `88ms`. | Cached immutable snapshot children beside guarded full-root replace operation child-array caches; fresh 200k virtualized undo-delete `268.9ms`, cross-strategy staged/virtualized `460.7ms` / `254.7ms`, restored `1`. | keep/split |
| huge-doc-200k-repair-notify-and-type-after-delete-design | slate-react / slate-ar-perf | complete / kept-runtime-packet | P1 | After snapshot-children cache, 200k undo-delete was mostly keydown request repair around `140ms`, notify/selector dispatch around `87ms`, and post-delete typing still cost about `2.1-2.3s`. | Expanded Slate view-selection history restore now skips caret DOM repair and keeps only force render; projected-command and keyboard contracts passed; cross-strategy trace restored with staged/virtualized undo-delete `460.1ms` / `280.5ms`, and virtualized rerun `244ms`. | keep/split |
| huge-doc-200k-type-after-delete-event-cadence | slate-react / slate-ar-perf | complete / instrumentation-kept | P1 | After expanded-history repair skip, the old default post-delete typing lane still showed about `2.4-2.7s`. | Benchmark now records input mode and typed payload so burst-cadence stress cannot be confused with first-key latency. | keep/split |
| huge-doc-200k-type-after-delete-deferred-repair-cadence | slate-react / slate-ar-perf | complete / no-runtime-patch | P1 | Runtime shortcuts for deferred repair/selection authority corrupted text or lacked stable wins. | Single-key physical typing and 17-char `insertText` both land around `145ms`; no deferred-repair runtime patch is justified by the old burst metric. | close |
| huge-doc-200k-type-after-delete-source-attribution | slate-react / slate-ar-perf | complete / benchmark-honesty-kept | P1 | Long-animation-frame attribution pointed to event listeners, but the benchmark also needed payload/mode attribution. | 17-key physical burst: staged `2412.1ms`, virtualized `2695ms`; single-key physical: staged `144.9ms`, virtualized `145.5ms`; 17-char `insertText`: staged `144.9ms`, virtualized `145.9ms`; all restored correctly. | keep/close |
| huge-doc-200k-delete-latency-attribution | slate-react / slate / slate-ar-perf | complete / superseded-by-runtime-fix | P1 | At loop 39, after type-after-delete claim width was fixed, Cmd+A/Delete cost about `600-645ms` at 200k in staged and virtualized. | Kept compact repair/key-trace instrumentation, operation-count hygiene, actual `applyFullBlockDeleteFragment` attribution, first-unmarked mark-scan shortcut, and top-level-first full-delete routing. This was superseded by the internal-owned replay and node-impact sentinel packets; latest Delete is about `20-29ms`. | keep/superseded |
| huge-doc-200k-delete-replay-build-change-design | slate-react / slate / slate-ar-perf | complete / kept-runtime-packet | P1 | The remaining 200k Delete latency is the structural replay/build-change path, not DOM repair tracing, keydown trace serialization, mark scanning, or full-block path materialization. | Internal-owned replay marker keeps default replay cloning for arbitrary operations but skips the clone for the slate-react-owned full-delete operation. Full-root structural replace now uses the existing all-node sentinel instead of enumerating 200k old runtime ids. Fresh 200k proof: staged Delete `19.7ms`, virtualized Delete `28.6ms`, restored `1` both lanes; replay clone gone; `build-change` about `0.4-0.5ms`; `delete-fragment.replay-replace` about `1.7-1.9ms`. | keep |
| huge-doc-post-delete-optimization-behavior-proof | slate-react / slate-ar-stabilize | complete / kept-proof-packet | P1 | Delete latency is fixed, but the runtime metadata change needs broader behavior proof before closing this automation loop. | Provider and view-selection contracts passed; focused huge-document Chromium proof passed 13 rows covering staged editing/undo/Enter/scroll, staged+virtualized ShiftUp/ShiftDown, staged and virtualized select-all/delete, auto typing/nav/undo/redo, paste select-all undo, virtualized typing/arrows/Enter/scroll, insert-break, backward scroll, row coherence, and scrollbar drag buffering. | keep |
| huge-doc-post-delete-first-key-proof | slate-ar-perf | complete / kept-runtime-packet | P1 | Delete is now fast, but previous type-after-delete work separated burst cadence from first-key latency before the latest delete/runtime metadata changes. | Fresh 200k staged+virtualized single-key physical and `insertText` control traces restore both lanes and land at about `20ms` with zero long tasks after compact browser-event traces and model-preferred beforeinput selection-flush skip. | keep |
| huge-doc-post-delete-undo-type-attribution | slate-react / slate-ar-perf | complete / partial-kept | P2 | After first-key is fixed, undoing that inserted key after a full-document delete remains about `280-322ms`; it is now the next measurable post-delete behavior/perf gap. | Keydown model-preserve flush skip fixes virtualized undo-type (`288.2ms` to `12.4ms`) with behavior proof green; staged stays about `287.8ms`. | keep/split |
| huge-doc-post-delete-burst-and-staged-undo-attribution | slate-react / slate-ar-perf | active | P2 | Final fresh-build 200k trace keeps Delete fast but exposes remaining post-delete tail: staged typed burst `2357.3ms`, virtualized typed burst `337.8ms`, staged undo-type `314ms`, virtualized undo-type `17.9ms`. | Decide whether post-delete physical burst cadence needs a runtime event-coalescing/caret-authority owner, and whether staged can keep model authority after model-owned repaired text insert. | update |
| behavior-proof | slate-ar-stabilize | complete | P0 | Prove stable editor behavior before perf. | Focused huge-document Chromium proof passed 13 rows after latest runtime change. | keep |
| oracle-repair | slate-patch / tdd | complete | P0 | Add missing native/visual/model oracles for found gaps. | Contract/browser rows added or updated for promoted packets; policy gaps queued. | keep |
| visual-proof | Browser / Playwright | complete | P0 | Prove visible editor behavior and native selection. | Playwright native/model/visual rows passed for huge-document selection and scroll behavior. | keep |
| slate-browser-promotion | slate-browser | complete | P1 | Promote repeated browser proof into reusable API/helper. | First-party operation families recorded and verified. | keep |
| mobile-claim-width | slate-auto | deferred | P1 | Separate raw-device proof from viewport proof. | Raw mobile claims deferred until a real device lane exists. | defer |
| huge-document-smoke | slate-ar-stabilize | complete | P1 | Smoke huge-doc correctness without broad architecture work. | 20k/200k traces and focused route rows passed. | keep |
| perf-packet | slate-ar-fast / slate-ar-perf | complete | P2 | Optimize only after correctness is green. | Kept/reverted/quarantined perf packets recorded through loop 46. | keep |
| supervision-mode | slate-auto | complete | P0 when timed runtime remains | If backlog looks empty before minimum runtime, predict next useful checkpoint from north-star and evidence. | Continued into first-key and undo-type packets instead of stopping early. | keep |
| consolidation | slate-auto | complete | P1 | Move accepted reusable decisions to durable docs/rules. | Research README, promoted ledger, and plan updated. | keep |
| final-handoff | slate-auto | complete | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows complete below. | keep |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded |
| 0 | add | research-discovery-status, table-fragment-semantics-research, huge-doc-native-selection-research, testing-oracle-research | latest user correction plus slate-research boundary | research must lead this timed run; internal-only soaking is played out | active |
| 1 | update/add | research-discovery-status, table-fragment-semantics-research, table-fragment-contract-001 | `docs/slate-v2/research/2026-06-12-table-fragment-semantics/**` | First research packet produced a promoted lead; next safe owner is a Slate-native policy/spec, not runtime patch. | keep/promote |
| 2 | update | table-fragment-contract-001, huge-doc-native-selection-research | `docs/plans/2026-06-12-slate-v2-table-fragment-rectangle-algebra-plan.md` | `slate-plan` planning mode created the target contract but execution needs review acceptance; continue timed supervision with next research owner. | keep/queue |
| 3 | update/add | huge-doc-native-selection-research, huge-doc-projection-metric-packet | `docs/slate-v2/research/2026-06-12-huge-doc-native-selection/**` | Research rejected pure-native virtualized selection and promoted stricter benchmark/oracle proof for residual repeated ShiftDown and select-all undo lanes. | keep/promote |
| 4 | update | huge-doc-projection-metric-packet, testing-oracle-research | Cross-editor strict benchmark failed before patch and passed after patch; focused Playwright passed. | Active packet closed with kept runtime patch; next timed checkpoint should improve reusable oracles/research rather than reopening solved ShiftDown. | keep/continue |
| 5 | update/add | testing-oracle-research, ime-composition-edge-matrix | `docs/slate-v2/research/2026-06-12-testing-oracles/**`; `slate-browser` scenario contract test passed. | Research found Slate's primitives are strong but huge-doc vertical selection needed first-party contract naming; ProseMirror composition corpus is the next useful oracle lead. | keep/promote |
| 6 | update/add | ime-composition-edge-matrix, geometry-coords-oracle-audit | Focused richtext Chromium/WebKit IME Playwright rows passed. | Existing richtext browser tests cover the highest-value formatted-boundary IME cases; name the contract and continue to geometry oracle audit instead of writing duplicate IME tests. | keep/continue |
| 7 | update/add | geometry-coords-oracle-audit, domchange-selection-repair-audit | `slate-browser test:selection` and `slate-dom` bridge tests passed. | Geometry pressure is already covered in package/browser lanes; next ProseMirror lead is native DOM-change selection repair. | covered/continue |
| 8 | update/add | domchange-selection-repair-audit, clipboard-open-slice-context-audit | slate-browser core/typecheck, slate-react repair contracts, and plaintext beforeinput/replacement Playwright rows passed. | DOM-change pressure maps to existing beforeinput target-range and native replacement repair proof; next remaining testing-oracle lead is clipboard open-slice/context. | keep/continue |
| 9 | update/add | clipboard-open-slice-context-audit, ime-overlap-rapid-crossparagraph-audit | slate-browser core/typecheck, slate-dom clipboard boundary, slate-react projected clipboard, and paste-html ProseMirror/table rows passed. | External clipboard open-slice/context pressure maps to existing paste-html and clipboard boundary proof; next remaining testing-oracle lead is deeper IME composition edges. | keep/continue |
| 10 | split/promote/add | ime-overlap-rapid-crossparagraph-audit, slate-browser-ime-synthetic-transport-repair, ime-overlap-decoration-audit | Richtext Chromium IME grep passed rapid consecutive, native cross-paragraph, and synthetic cross-paragraph rows; slate-browser scenario guard/typecheck passed. | Rapid/cross-paragraph IME is now covered by a named contract; synthetic helper needed repair; overlap/decorator IME remains a separate queued owner. | keep/split/continue |
| 11 | split/promote/add | ime-overlap-decoration-audit, slate-browser-stepwise-ime-api, ime-overlap-cancellation-audit | Async decorations Chromium grep passed prop and hook rows during active stepwise synthetic IME; richtext regression, scenario guard, and typecheck passed. | Decoration-change composition now has proof; all-at-once IME helper was insufficient; overlap cancellation still needs a legitimate concurrent-edit surface. | keep/split/continue |
| 12 | defer/add | ime-overlap-cancellation-audit, ime-overlap-policy-research | North-star lacks a specific policy for app/remote edits overlapping active IME composition. | Do not invent runtime semantics from ProseMirror alone; research more editors and queue a taste checkpoint for final handoff. | defer/continue |
| 13 | update/add | ime-overlap-policy-research, huge-doc-architecture-research | `docs/slate-v2/research/2026-06-12-ime-overlap-policy/**` | External source narrows the policy to overlap-cancels/non-overlap-preserves, but runtime semantics still need Slate policy acceptance; continue the timed run with the recurring huge-document architecture/perf risk. | keep/defer/continue |
| 14 | update/add | huge-doc-architecture-research, huge-doc-scroll-anchor-metric-honesty | `docs/slate-v2/research/2026-06-12-huge-doc-architecture/**`; focused huge-document scroll proof passed. | CodeMirror source did not justify a runtime rewrite, but it exposed a missing named scroll-stability contract and future scroll-anchor metrics. | keep/promote/continue |
| 15 | update/add | huge-doc-scroll-anchor-metric-honesty, huge-doc-estimated-coordinate-contract | Browser trace smoke and full wrapper smoke emitted materialization frame and scroll-delta metrics; benchmark script contract passed. | Metric-honesty gap is closed for this packet; the next CodeMirror-derived architecture pressure is precise-versus-estimated coordinate behavior. | keep/promote/continue |
| 16 | update/add | huge-doc-estimated-coordinate-contract, huge-doc-selection-endpoint-retention-audit | `bun test ./packages/slate-dom/test/dom-coverage.ts` passed 18; `bun --filter ./packages/slate-dom typecheck` passed. | Coordinate boundary is now explicit without adding a fake estimated-coordinate API; continue to selected endpoint retention mapping. | keep/promote/continue |
| 17 | update/add | huge-doc-selection-endpoint-retention-audit, huge-doc-big-document-height-scaling-audit | `bun test:vitest test/dom-strategy-page-virtualization.test.tsx` passed 7; `bun --filter ./packages/slate-react typecheck` passed. | Endpoint retention is now package-protected with bounded DOM cost; continue to the final huge-doc architecture research lead as a stress/claim-width audit. | keep/promote/continue |
| 18 | update/add | huge-doc-big-document-height-scaling-audit, huge-doc-200k-click-selection-attribution | 100k/200k virtualized smokes passed; 200k cache-cap packet reduced heap but click latency remains high. | Extreme-size claim width is now measured; the remaining actionable lane is click/selection attribution, not another architecture hunch. | keep/promote/continue |
| 19 | update/add | huge-doc-200k-click-selection-attribution, huge-doc-200k-select-all-delete-attribution | Mouse event phase metrics showed 200k click delay was inside event propagation; root profiler showed `root-mousedown.resolve-projected-drag-endpoint` p95 `270ms`; after the content-root owner shortcut, 200k virtualized click-to-paint p95 is `39.8ms`. | Click packet is kept; next proven user-visible huge-doc lane is select-all/delete/undo attribution. | keep/promote/continue |
| 20 | update/add | huge-doc-200k-select-all-delete-attribution, huge-doc-cross-strategy-command-smoke | 200k select-all/delete diagnostic showed keyboard undo timed out for 45s; direct `__slateBrowserHandle.undo()` exposed `RangeError: Maximum call stack size exceeded`; core operation contract and strict fresh-build browser trace passed after replacing variadic child-range replay. | Select-all/delete packet is kept; next useful huge-doc owner is cross-strategy command smoke, not another unmeasured architecture tweak. | keep/promote/continue |
| 21 | update/add | huge-doc-cross-strategy-command-smoke, huge-doc-200k-delete-history-latency-attribution | 20k auto/staged/virtualized browser trace restored after select-all/delete/undo; 9 focused Chromium route rows passed for auto typing/nav/undo/redo, virtualized select-all/delete/redo, paste-select-all undo, 5k typing/arrows/Enter/scroll, 20k materialization, insert-break, and scroll stability. | Huge-doc command correctness smoke is kept; the next actionable gap is latency attribution for 200k delete/history costs, not another broad behavior sweep. | keep/continue |
| 22 | update/add | huge-doc-200k-delete-history-latency-attribution, huge-doc-200k-undo-delete-publish-cost-research | Fresh-build 200k virtualized proof after revert restored correctly with type-after-delete-to-paint `2358.9ms`, undo-delete-to-paint `2168.1ms`, and `undoDeleteRestored=1`; phase traces show type-after-delete keyboard dispatch `2075.4ms`, model wait `267.3ms`, beforeinput span `2073.4ms`, max event gap `386.5ms`, and undo-delete `next-snapshot` `869.1ms`, `notify-listeners` `781.1ms`, `dom-path-sync` `374.1ms`. | Measurement packet is kept; same-burst `insertText` no-flush runtime experiment is quarantined because it corrupted typed text; next safe owner is publish-cost source research, not that shortcut. | keep/quarantine/continue |
| 23 | update/add | huge-doc-200k-undo-delete-publish-cost-research, huge-doc-200k-undo-delete-core-snapshot-delta-research | Local source inspection showed Lexical/CodeMirror carry dirty sets/changed ranges through publish; Slate v2 had a global unscoped view-selection decoration source forcing full-range projection. First browser proof caught a staged regression because the scoped source dropped the focus endpoint; fixed by always adding selection endpoint top-level ids. Final focused browser proof passed 7 Chromium rows. Final fresh-build 200k virtualized trace: select-all `31.4ms`, delete `629.7ms`, type-after-delete `2095.9ms`, undo-type `137.8ms`, undo-delete `1825.6ms`, restored `1`, source-listener p95 `0ms`, view-selection projection `0.1ms`. | Runtime packet is kept; next owner is core snapshot/delta publish and DOM path sync, not more view-selection work. | keep/continue |
| 24 | update/add | huge-doc-200k-undo-delete-core-snapshot-delta-research, huge-doc-200k-replace-children-and-snapshot-index-architecture | Snapshot profiler labels split undo-delete `next-snapshot` into `snapshot-build-index` `754.5ms` and `snapshot-clone-children` `181.5ms`; DOM path sync was a duplicate live-index build. Reusing the main-root snapshot index traversal for the live runtime-index cache removed the duplicate path-sync cost. Final fresh-build 200k virtualized trace: select-all `44.4ms`, delete `636.7ms`, type-after-delete `2237.1ms`, undo-delete `1524.4ms`, restored `1`; focused Chromium proof passed 7 rows. | Runtime-index reuse packet is kept; DOM-path-sync skip experiment is quarantined because selector dispatch rose to `448.6ms` and wall time did not improve. Remaining owner is snapshot-index/clone and replace-children replay architecture. | keep/quarantine/continue |
| 25 | update | huge-doc-200k-replace-children-and-snapshot-index-architecture | Snapshot index construction still spends most key work on one/two-segment paths in huge flat documents. Fast-pathing `pathKey` for lengths 0, 1, and 2 passed slate typecheck, snapshot contracts, operation contracts, benchmark-script contracts, and strict fresh-build 200k browser trace. Final trace: select-all `31.2ms`, delete `613.2ms`, type-after-delete `2196.5ms`, undo-delete `1478.1ms`, restored `1`; `snapshot-build-index` `727.3ms`. | Keep the micro-packet because it removes hot-loop overhead without changing key format; do not close architecture, because one 200k snapshot index build is still the dominant undo-delete cost. | keep/continue |
| 26 | update | huge-doc-200k-replace-children-and-snapshot-index-architecture | Tried replacing index-builder `forEach` plus path spread with explicit loops and a path append fast-path while preserving frozen path arrays. Core gates passed, but strict 200k trace regressed undo-delete from `1478.1ms` to `1507.7ms`; `snapshot-build-index` only moved `727.3ms` to `721.5ms`, while wall time and apply noise got worse. | Reverted and quarantined. Do not retry shallow traversal cleanup without a stronger microbenchmark; next owner remains persistent/delta index or replace-children replay architecture. | quarantine/continue |
| 27 | add/update | huge-doc-core-fragment-delete-history-parity, huge-doc-200k-replace-children-and-snapshot-index-architecture | Added a subscribed core history benchmark lane and current-only mode; 20k current-only no longer times out after full-document `tx.fragment.delete` uses one `replace_children`. Browser 200k staged/virtualized trace still restores and shows delete history as one `replace_children`, but browser undo-delete remains dominated by restoring 200k children and rebuilding publish indexes. | Keep the core/API parity packet; do not count it as the browser persistent-index fix. Continue with persistent/delta snapshot index or replay architecture only if the next experiment has a stronger owner than shallow traversal cleanup. | keep/continue |
| 28 | update | huge-doc-200k-replace-children-and-snapshot-index-architecture | Tried caching the previous full-root `replace_children` snapshot index by operation child-array identity and reusing it when history undo restored the same 200k child array. Focused gates passed, and the cached branch removed `snapshot-build-index`, but two 200k virtualized traces regressed undo-delete to `1769.4ms` and `1750.2ms`; cost moved into `apply-replace_children` around `722ms` and `dom-path-sync` around `648ms`. Post-revert fresh trace returned to `1524.9ms` with restored `1`. | Reverted and quarantined. Cached-index identity tricks are not the next owner; target actual `replace_children` apply/replay cost, DOM path sync mechanics, or a deliberate public snapshot-index design. | quarantine/continue |
| 29 | update | huge-doc-200k-replace-children-apply-cost-attribution | Tried a full-range `replaceChildRange` fast path using `newValues.slice()` to avoid `slice(0).concat(newValues, slice(end))` scaffolding on 200k undo restore. Focused gates passed, but 200k virtualized traces were `1493.2ms` then `1525.2ms`, and `apply-replace_children` stayed around `371ms`. Post-revert operations/snapshot/type gates passed; one operations run hit the known 5s timeout edge and passed on immediate rerun. | Reverted and quarantined as noise. The next owner is not generic array-copy cleanup; inspect what makes `apply-replace_children` and DOM path sync expensive under real history restore. | quarantine/continue |
| 30 | split/update | huge-doc-200k-replace-children-apply-cost-attribution, huge-doc-200k-apply-replace-children-replay-design | Completed the stricter full-root cached snapshot-index packet by also seeding the live runtime-index cache from the reused snapshot index. Focused history/snapshot/operations/benchmark contracts and slate/slate-history typechecks passed. Fresh 200k virtualized traces improved undo-delete from the post-revert `1524.9ms` baseline to `1425.3ms` and `1411.0ms`; cross-strategy trace restored staged and virtualized with staged `1602.5ms`, virtualized `1401.5ms`. Profiler now shows no `snapshot-build-index` or `dom-path-sync` in undo-delete; remaining hot buckets are `apply-replace_children` ~`728ms`, `snapshot-reuse-live-runtime-index` ~`251ms`, and `snapshot-reuse-clone-children` ~`174ms`. | Keep the guarded cache packet because it improves wall time without correctness loss. Split remaining work to replay/data-structure design; do not retry shallow copy tricks. | keep/split/continue |
| 31 | split/update | huge-doc-200k-apply-replace-children-replay-design, huge-doc-200k-replace-children-apply-replay-and-clone-design | Added live-runtime-index cache entries alongside full-root replace snapshot-index cache entries, preserving the already-built live index for the restored child array. Focused history/snapshot/operations/benchmark contracts and slate/slate-history typechecks passed. Fresh 200k virtualized trace improved undo-delete from `1401.5ms` current best to `736.3ms`; cross-strategy staged/virtualized trace restored both with staged `931.8ms`, virtualized `748.4ms`. Profiler removed `snapshot-reuse-live-runtime-index`; remaining hot buckets are `apply-replace_children` `299.4ms`, `snapshot-reuse-clone-children` `199.0ms`, and keydown request repair `122.9ms`. | Keep. The next owner is actual child replay/clone cost or a plateau decision, not live-index conversion. | keep/split/continue |
| 32 | split/update | huge-doc-200k-replace-children-apply-replay-and-clone-design, huge-doc-200k-snapshot-clone-and-repair-design | Added replace_children apply-phase profiling, which showed `apply-replace_children` was almost entirely cached full-root restore dirty-path expansion (`302.2ms`). Added a guarded dirty-path fast path that applies only when the full-root replace snapshot cache already contains the operation's `newChildren`, preserving exact dirty paths for arbitrary replace_children operations. Focused gates passed. Fresh 200k virtualized trace improved undo-delete to `442.3ms`; cross-strategy staged/virtualized trace restored both with staged `633.6ms`, virtualized `416.7ms`. Profiler reduced `apply-replace_children` to `0.1ms`; remaining hot buckets are `snapshot-reuse-clone-children` `195.1ms`, keydown request repair `122.5ms`, and notify/selector dispatch `88.7ms`. | Keep. Split remaining work to clone/repair/notify; generic replace_children dirty-path behavior stays unchanged. | keep/split/continue |
| 33 | split/update | huge-doc-200k-snapshot-clone-and-repair-design, huge-doc-200k-repair-notify-and-type-after-delete-design | Cached immutable `EditorSnapshot.children` beside the guarded full-root replace operation child-array cache, avoiding the `snapshot-reuse-clone-children` copy on history restore. Focused slate/slate-history gates passed. Fresh 200k virtualized trace improved undo-delete to `268.9ms`; cross-strategy staged/virtualized trace restored both with staged `460.7ms`, virtualized `254.7ms`. Remaining hot buckets are keydown request repair `139.9ms`, notify-listener/selector dispatch about `87ms`, and type-after-delete around `2.1-2.3s`. | Keep. Split remaining work to repair/notify and post-delete typing cadence; core restore is no longer the main bottleneck. | keep/split/continue |
| 34 | split/update | huge-doc-200k-repair-notify-and-type-after-delete-design, huge-doc-200k-type-after-delete-event-cadence | History undo over an expanded Slate view selection was asking DOM repair to repair a caret that does not exist. Added a focused keyboard contract and skipped caret DOM repair for expanded view-selection history restore, preserving force render. Projected-command contract and slate-react typecheck passed. Cross-strategy 200k trace restored staged/virtualized with undo-delete `460.1ms` / `280.5ms`; virtualized rerun restored with undo-delete `244ms` and notify/selector p95 about `1ms`. At this loop, the old post-delete burst metric still cost `2.2-2.6s`; later packets narrowed and fixed first-key latency. | Keep. Remaining owner is native beforeinput/input event cadence instrumentation before any runtime typing patch. | keep/split/continue |
| 35 | update/split | huge-doc-200k-type-after-delete-event-cadence, huge-doc-200k-type-after-delete-deferred-repair-cadence | Added phase-local type-after-delete metrics for dispatch/model-wait, beforeinput/input counts, spans, gaps, long tasks, long animation frames, profiler duration, event timelines, selection-source state, and configurable typed text. Focused benchmark script contract passed 16 tests. Latest staged+virtualized 200k proof restored both lanes and showed staged type-after-delete `2311.1ms` / wait-for-model `3.8ms`, virtualized type-after-delete `2679.1ms` / wait-for-model `274ms`, with correctness intact. | Keep metric instrumentation. Split the remaining owner to deferred native text repair/event cadence because core/history/notify are no longer the hot path. | keep/split/continue |
| 36 | quarantine/update | huge-doc-200k-type-after-delete-event-cadence, huge-doc-200k-type-after-delete-deferred-repair-cadence | Tried two reversible runtime shortcuts. Releasing virtualized repair-induced text insert selection to DOM failed focused DOM repair contracts and corrupted text (`after 200k delete` became reordered text). Allowing beforeinput to import DOM selection after repair-induced text input passed focused contracts but produced only an outlier perf win and did not hold in reruns; cross-strategy proof still showed virtualized wait-for-model around `274-298ms`. Both runtime patches were reverted; focused editing-kernel, keyboard strategy, input-router, DOM repair policy, and slate-react typecheck passed after revert. | Quarantine both shortcuts. Continue with source-level deferred repair cadence attribution, not selection-authority relaxation. | quarantine/continue |
| 37 | update/add | huge-doc-200k-type-after-delete-deferred-repair-cadence, huge-doc-200k-type-after-delete-source-attribution | Added compact long-task / long-animation-frame attribution and outer `beforeinput-total` / `dom-input-total` profiler buckets, plus coarse beforeinput phase buckets. Focused benchmark contract, runtime-beforeinput contract, input-router contract, and slate-react typecheck passed. Fresh 200k virtualized proof restored with type-after-delete `2471.1ms`; staged+virtualized proof restored both lanes and showed staged `dom-input-total` `2127.8ms`, virtualized `beforeinput-total` `1876.8ms`, while core insert/model work stayed around `10-28ms`. | Keep attribution instrumentation. Do not patch runtime yet; next owner is exact source attribution for event-listener self-time or a benchmark-lane explanation. | keep/add/continue |
| 38 | update/add | huge-doc-200k-type-after-delete-source-attribution, huge-doc-200k-delete-latency-attribution | Added explicit `SLATE_BROWSER_TRACE_AFTER_DELETE_INPUT_MODE`, artifact keys for input mode and payload, and reran staged+virtualized 200k A/B traces. 17-key physical burst stays slow (`2412.1ms` / `2695ms`), but single-key physical typing is `144.9ms` / `145.5ms`, and 17-char `insertText` is `144.9ms` / `145.9ms`; all restore correctly. Delete remains `611.4ms` / `622.1ms` with top profiler buckets in keydown request-repair/build-change, not child replacement apply. | Keep benchmark-honesty instrumentation and close the type-after-delete runtime owner. Add delete latency as the next real 200k editor gap. | keep/add/continue |
| 39 | update/split | huge-doc-200k-delete-latency-attribution, huge-doc-200k-delete-replay-build-change-design | Compacted DOM repair and keydown trace payloads so diagnostics no longer serialize huge operation payloads; replaced provider hook operation-count reads with `getOperationCount`; proved browser Delete uses slate-react `applyFullBlockDeleteFragment`, not core `tx.fragment.delete`; added delete-fragment profiler buckets; optimized first-unmarked mark scanning and top-level whole-document routing. Focused projected-command, DOM repair policy, editing-kernel, provider-hooks, slate delete contract, slate/slate-react typechecks passed. Metrics moved from staged/virtualized delete about `628.6ms` / `620.2ms` before the mark-scan shortcut to `557.5ms` / `595.5ms` after top-level-first routing, with `delete-fragment.consistent-marks` near `0.1ms` and `delete-fragment.full-block-paths` removed. Direct `tx.apply` inside editor.update failed contracts/typecheck and was reverted. | Keep the safe instrumentation and partial runtime wins. Split remaining owner to replay/build-change; do not try untyped transaction shortcuts. | keep/quarantine/split/continue |
| 40 | update | huge-doc-200k-delete-replay-build-change-design | Added `operation-replay-clone:replace_children` profiler around replay cloning and reran a fresh-build staged+virtualized 200k trace. Focused slate delete contract, projected-command contract, slate/slate-react typechecks passed. Fresh trace restored both lanes with staged/virtualized Delete `593.9ms` / `564.1ms`, undo-delete `588.8ms` / `421.6ms`, and `undoDeleteRestored=1`. Delete profiler: replay clone `128.9ms` / `119.9ms`, build-change `193.4ms` / `175ms`, replay-replace `338.3ms` / `311.1ms`. Tried re-exporting internal `applyOperation` through slate-react runtime API, but projected transactions failed `editor writes must run inside editor.update`; reverted and focused checks passed. | Keep replay-clone metric. Quarantine internal apply from projected runtime. Continue with deliberate core-owned replay/build-change design only if it can keep public operation replay safe. | keep/quarantine/continue |
| 41 | update/split | huge-doc-200k-delete-replay-build-change-design | Added a core `markInternalOwnedReplayOperation` WeakSet marker consumed once by `tx.operations.replay`, exported only through internal APIs, and used it only for slate-react's freshly-built full-delete `replace_children` operation. Added a default replay safety contract proving unmarked `replace_children` replay still deep-clones payloads. Focused delete contract, projected-command contract, slate/slate-react typechecks passed. Fresh staged+virtualized 200k proof restored both lanes. Delete improved from loop-40 staged/virtualized `593.9ms` / `564.1ms` to `359.6ms` / `425.5ms`; `operation-replay-clone:replace_children` disappeared; `build-change` remains `196.3ms` / `247.9ms`. | Keep internal-owned replay marker. Continue with build-change/commit-payload attribution; do not broaden replay clone skip to public replay. | keep/split/continue |
| 42 | update/add | huge-doc-200k-delete-replay-build-change-design, huge-doc-post-delete-optimization-behavior-proof | Added build-snapshot-change subphase profiling and traced build-change to `build-snapshot-change:node-impact` scanning all previous runtime ids for full-root `replace_children`. Changed full-root structural replace to return `nodeImpactRuntimeIds: null`, the existing all-node sentinel, instead of enumerating 200k ids. Added a contract asserting full-root replay uses the sentinel, and reran delete/snapshot/provider/view-selection/projected-command contracts plus slate/slate-react typechecks. Fresh 200k staged+virtualized proof restored both lanes: Delete `19.7ms` / `28.6ms`, undo-delete `663.8ms` / `376.5ms`, clone bucket gone, build-change `0.4ms` / `0.5ms`, replay-replace `1.7ms` / `1.9ms`. | Keep. Continue with post-optimization behavior proof before closing the huge-doc packet. | keep/continue |
| 43 | update/add | huge-doc-post-delete-optimization-behavior-proof, huge-doc-post-delete-first-key-proof | Focused Chromium huge-document proof passed 13 rows after the delete/runtime metadata optimizations: staged middle-block editing/undo/Enter/scroll; staged+virtualized ShiftUp/ShiftDown; staged repeated ShiftDown aligned with full DOM; staged select-all/delete/typing/paste/undo; auto partial-DOM typing/navigation/undo/redo; virtualized select-all/delete/typing/undo/redo; huge paste replace/undo; virtualized 5k typing/undo/arrows/Enter/scroll; virtualized repeated ShiftDown/ShiftUp; insert-break bursts; backward scroll; row coherence; native scrollbar drag buffering. | Keep post-optimization behavior proof. Continue with single-key/insertText control traces so the old burst metric does not re-enter as a false regression after the delete fix. | keep/continue |
| 44 | update/split | huge-doc-post-delete-first-key-proof | Added compact browser-event trace payloads to `recordKernelEventTrace` and DOM input repair traces, plus a source guard. Focused editing-kernel, runtime-beforeinput, and slate-react typecheck passed. Fresh 200k trace proved this guard removed the old operation-list fallback but did not fix first-key latency: staged/virtualized type-after-delete stayed `295.8ms` / `279.2ms`, with `beforeinput-flush-selection` about `109-113ms`. | Keep the trace guard as benchmark/runtime hygiene, but split the actual performance owner to beforeinput selection flushing. | keep/split |
| 45 | update/add | huge-doc-post-delete-first-key-proof, huge-doc-post-delete-undo-type-attribution | Added `shouldFlushSelectionChangeBeforeDOMBeforeInput()` so beforeinput skips pending DOM selection flush when model selection is already preferred for input. Focused beforeinput/input contracts and slate-react typecheck passed. Fresh 200k staged+virtualized trace improved physical first-key after delete from `295.8ms` / `279.2ms` to `20.0ms` / `20.4ms`; `insertText` control is `20.5ms` / `20.8ms`; long tasks are `0`; both restore. Focused Chromium huge-document proof passed 13 rows after the runtime change. | Keep. First-key after delete is closed; split remaining post-delete owner to undo-type latency (`279.6ms` / `288.2ms` physical, `296ms` / `321.9ms` insertText-control traces). | keep/split/continue |
| 46 | update/split | huge-doc-post-delete-undo-type-attribution, huge-doc-post-delete-staged-undo-type-attribution | Added `shouldFlushSelectionChangeAfterKeyDownPolicy()` so model-preserve keydown policy skips stale DOM selection flush when model selection is already preferred. Focused selection-runtime and keyboard contracts plus slate-react typecheck passed. Fresh 200k physical trace restored both lanes: virtualized undo-type improved from `288.2ms` to `12.4ms`, while staged stayed `287.8ms` because staged after-type state is `dom-current`; Delete and first-key stayed about `20-22ms`. `insertText` control confirmed the same shape: virtualized undo-type `21.2ms`, staged `280.3ms`. Focused Chromium huge-document proof passed 13 rows. | Keep partial virtualized win. Split staged DOM-current history-undo policy to a separate lower-priority owner; do not overclaim all-lane closure. | keep/split/continue |
| 47 | update/split | huge-doc-post-delete-burst-and-staged-undo-attribution | Final fresh-build 200k staged+virtualized trace kept select-all/delete fast and restored both lanes, but showed the remaining tail is broader than staged undo-type: staged typed burst `2357.3ms`, virtualized typed burst `337.8ms`, staged undo-type `314ms`, virtualized undo-type `17.9ms`, staged/virtualized delete `26.6ms` / `21.1ms`, DOM p95 `395` / `316`. | Keep this as measurement, not a runtime patch. Next owner is post-delete burst cadence plus staged DOM-current undo policy; do not call huge-doc post-delete behavior fully closed. | keep/split/stop-at-timefloor |

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
| Prompt requirements captured before work | yes | First checkpoint section copied prompt, timing, scope, boundaries, stop conditions, and final handoff requirements. |
| `slate-auto` source rule read | yes | Read current `slate-auto` routing/headings and timed mode rules. |
| `vision` read as checkpoint zero | yes | Read current north-star checkpoint/taste/proof rules. |
| Active goal checked or created | yes | `get_goal` returned none; created active slate-auto goal for this plan. |
| Invocation mode and timebox recorded | yes | Timed mode; 8h minimum; start `2026-06-12 12:14:33 CEST`; target no earlier than `2026-06-12 20:14:33 CEST`. |
| Dynamic checkpoint policy accepted | yes | Checkpoint supervisor says add/update/split/merge/reopen based on evidence, not seed order. |
| Source of truth and allowed workspaces recorded | yes | Boundaries section names `.tmp/slate-v2`, docs, research, and rules. |
| Output budget strategy recorded | yes | Broad scans are written to ledgers/artifacts; noisy broad searches logged as workflow slowdown. |
| Private-alpha release/PR boundary recorded | yes | No release/publish/PR/changeset framing unless explicitly requested. |
| Browser proof strategy recorded | yes | Browser proof only for promoted behavior claims; model-only selection proof is insufficient. |
| Package/API proof strategy recorded | yes | `.tmp/slate-v2` focused package/test commands when runtime/API changes are promoted. |
| Mobile/raw-device claim-width policy recorded | yes | Raw mobile deferred unless a real device lane exists; viewport proof cannot satisfy raw-device claims. |
| Skill repair authority and source-rule boundary recorded | yes | `.agents/rules/**` only if workflow miss is proven; run `pnpm install` after source-rule edits. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
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
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | Focused package contracts, typechecks, 200k browser traces, and 13-row huge-document Chromium proof passed; exact commands are recorded in packet rows. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | Mutation ledger records loops 1-46, including added/split/quarantined checkpoints. |
| Workspace authority proof | yes | Record cwd/tool for each Slate v2, parent-docs, skill, browser, package, or benchmark proof | Slate v2 commands run from `.tmp/slate-v2` or package cwd; parent changes are docs/research/plan only. |
| Behavior gates | yes | Run focused stable behavior proof or record scoped defer rows | Focused huge-document Chromium proof passed 13 rows after the latest runtime change. |
| Visual/native selection proof | yes | Record Browser/Playwright/native-selection evidence or scoped blocker | Existing focused Playwright rows include native/model/visual huge-doc selection and scrollbar assertions; broader raw-device/mobile is explicitly out of claim width. |
| Missing oracle repair | yes | Add/verify/revert/quarantine oracle packets or record owner defer | Added/updated contracts for compact traces, beforeinput flush, keydown flush, delete/replay, snapshot, provider hooks, and browser operation families. |
| `slate-browser` promotion | yes | Add/verify helper/API or record queue/defer reason | Promoted first-party rows for huge-doc vertical selection, virtualized scroll stability, IME, native beforeinput target-range repair, and clipboard slice/context. |
| Mobile/raw-device claim width | no | Run raw-device proof or record that only scoped viewport/browser proof is available | N/A: user explicitly deferred mobile/raw-device claims until a real device lane exists. |
| Huge-document correctness smoke | yes | Run focused huge-document behavior smoke or record owner defer | 20k and 200k traces plus focused Chromium huge-document rows passed for typing, select-all/delete, undo, navigation, paste, insert-break, and scroll. |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | `slate`, `slate-history`, `slate-react`, `slate-dom`, and `slate-browser` focused package gates recorded in packet rows. |
| Skill/rule sync | no | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | N/A: no `.agents/rules/**` source edits in this run. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | Changed list, needs-attention, and stopping checkpoints are recorded below. |
| Final lint/check | yes | Run scoped lint/check or record why no code changed | Scoped tests/typechecks and browser proof passed; full check intentionally not run because this was a long timed benchmark/research loop with focused proof. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Workflow slowdown ledger records command/path/artifact pitfalls and repairs. |
| Agent-native review for agent/tooling changes | no | Load `agent-native-reviewer` and close accepted findings, or N/A | N/A: no agent/tooling source changed. |
| Autoreview for non-trivial implementation changes | no | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | N/A for this timed automation handoff; user can run `$autoreview` as the commit gate. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-12-slate-v2-8h-research-first-automation.md` | To run after the 8h minimum has elapsed and this final-gate cleanup is complete. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | prompt requirements copied into first checkpoint | status |
| Status and current-tree closure | complete | plan/current verdict and packet rows updated through loop 46 | gap scan |
| Gap scan and scenario matrix | complete | research, issue, oracle, huge-doc, and workflow gaps routed into checkpoint rows | behavior proof |
| Behavior proof | complete | focused huge-document Chromium proof passed 13 rows after latest runtime change | oracle repair |
| Oracle repair | complete | contract/test rows added or updated for promoted packets | visual proof |
| Visual/native proof | complete | focused Playwright rows cover native/model/visual huge-doc selection and scroll behavior | slate-browser promotion |
| slate-browser promotion | complete | reusable first-party operation families recorded in slate-browser ledger | mobile claim width |
| Mobile/raw-device claim width | deferred | raw-device lane intentionally out of claim width | huge-document smoke |
| Huge-document correctness smoke | complete | 20k/200k traces and focused Chromium route rows passed | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | complete | kept, reverted, quarantined, and split packets recorded through loop 46 | consolidation |
| Consolidation and review | complete | docs/research and promoted ledger updated; review gate marked N/A for timed handoff | final handoff |
| Final handoff and goal-plan check | complete | final handoff ledgers are filled; checker rerun is the final mechanical proof | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| huge-document | staged active DOM group | 200k | Cmd+A, Delete, type, undo type, undo delete | model text/selection, DOM budget, profiler/long-frame metrics | pass with post-delete typed-burst and staged undo-type residual |
| huge-document | virtualized | 200k | Cmd+A, Delete, type, undo type, undo delete | model text/selection, DOM budget, profiler/long-frame metrics | pass; virtualized undo-type fixed, typed-burst residual remains |
| huge-document | staged/virtualized | route rows | ShiftUp/Down, paste, Enter, navigation, scroll, scrollbar drag | Playwright native/model/visual assertions | pass |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| post-delete first-key flush skip | 45 | slate-react / slate-ar-perf | first-key after delete paid `beforeinput-flush-selection` despite model-owned selection | runtime-beforeinput contract, input-router contract, slate-react typecheck, 200k traces, 13-row Chromium proof | Playwright pass | keep | staged DOM-current undo-type owner split |
| post-delete keydown model-preserve flush skip | 46 | slate-react / slate-ar-perf | virtualized undo-type paid stale DOM selection flush before history undo | selection-runtime contract, keyboard contract, slate-react typecheck, physical and `insertText` 200k traces, 13-row Chromium proof | Playwright pass | keep partial | staged DOM-current undo-type remains |
| table-fragment-research-001 | 1 | slate-research | Table-fragment skips might be solvable by external editor invariants instead of a blind unskip. | Created `docs/slate-v2/research/2026-06-12-table-fragment-semantics/**`; cloned `/Users/zbeyens/git/prosemirror-tables`; read ProseMirror/Tiptap/Lexical/Slate v2 source slices. | ProseMirror rectangle-algebra source and Slate v2 skipped fixture anchors recorded in ledgers. | keep/promote | `table-fragment-contract-001` |
| table-fragment-contract-001 | 2 | slate-plan | Promoted research needs a reviewable Slate-native contract before core fixture execution. | Created `docs/plans/2026-06-12-slate-v2-table-fragment-rectangle-algebra-plan.md`; completed current-state pass; named proof gates. | Planning-only proof; no runtime command by design. | keep/queue | User review boundary, then execution mode |
| huge-doc-native-selection-research | 3 | slate-research | Huge-doc native-selection/perf needed external source inspection before more runtime changes. | Created `docs/slate-v2/research/2026-06-12-huge-doc-native-selection/**`; read ProseMirror view, Lexical selection, legacy Slate huge-doc, and current Slate v2 tests/benchmarks. | Rejected pure-native virtualized selection and legacy chunking target; promoted projection metric honesty and staged/full-DOM parity packets. | keep/promote | `huge-doc-projection-metric-packet` |
| huge-doc-projection-metric-packet | 4 | slate-ar-perf / slate-react | Auto/staged repeated ShiftDown was suspected but needed metric owner before patching. | Patched `.tmp/slate-v2/packages/slate-react/src/editable/dom-coverage-vertical-selection.ts` to use the existing cheap adjacent single-text-block extension before the expensive model-line fallback when leaving a rendered line. | Before: strict cross-editor failed at `slateAuto startBlock` step 33 and strict-off p95 was `239.7ms`. After: strict cross-editor passed with `slateAuto startBlock` repeated ShiftDown p95 `15.4ms`; focused Playwright repeated-selection tests passed. | keep | `testing-oracle-research` |
| testing-oracle-contract-001 | 5 | slate-research / slate-browser | The huge-doc repeated vertical selection proof was strong but route-local; future loops need a named contract row. | Added `docs/slate-v2/research/2026-06-12-testing-oracles/**`; patched `.tmp/slate-v2/packages/slate-browser/src/core/first-party-browser-contracts.ts` and `test/core/scenario.test.ts`. | `cd .tmp/slate-v2/packages/slate-browser && bun test test/core/scenario.test.ts` passed; `cd .tmp/slate-v2 && bun --filter slate-browser typecheck` passed. | keep | `ime-composition-edge-matrix` |
| testing-oracle-contract-002 | 6 | slate-browser / richtext | ProseMirror formatted/cursor-wrapper IME pressure is already mostly covered by richtext route tests but was not named in first-party contracts. | Added `ime-composition-formatted-boundaries` contract row in `.tmp/slate-v2/packages/slate-browser/src/core/first-party-browser-contracts.ts` and scenario guard. | `bun --filter slate-browser test:core` passed 60 tests; `bun --filter slate-browser typecheck` passed; Chromium richtext IME grep passed 8 tests; WebKit compositionend grep passed 2 tests. | keep | `geometry-coords-oracle-audit` |
| testing-oracle-geometry-coverage-001 | 7 | slate-research / slate-browser / slate-dom | ProseMirror selection geometry rows might need new Slate-native oracles. | Read Slate browser selection tests, slate-dom bridge tests, and geometry code. | `cd .tmp/slate-v2 && bun --filter slate-browser test:selection` passed 9 tests; `cd .tmp/slate-v2 && bun test ./packages/slate-dom/test/bridge.ts` passed 26 tests. | covered-existing | `domchange-selection-repair-audit` |
| testing-oracle-contract-003 | 8 | slate-browser / slate-react / plaintext | ProseMirror DOM-change repair pressure should not stay an unnamed queued lead if Slate already covers beforeinput target-range and native replacement undo behavior. | Added `native-beforeinput-target-range-repair` contract row; updated research ledgers. | `slate-browser` scenario/core/typecheck passed; slate-react selection/input repair contracts passed 77 tests; Chromium plaintext target-range/replacement undo rows passed 3 tests. | keep | `clipboard-open-slice-context-audit` |
| testing-oracle-contract-004 | 9 | slate-browser / slate-dom / slate-react / paste-html | ProseMirror clipboard open-slice/context pressure should be named separately from generic paste normalization and from selected-cell rectangle insertion. | Added `external-clipboard-slice-context` contract row; updated research ledgers. | `slate-browser` scenario/core/typecheck passed; slate-dom clipboard boundary passed 34 tests; slate-react projected clipboard passed 6 tests; Chromium paste-html slice/table rows passed 8 tests. | keep | `ime-overlap-rapid-crossparagraph-audit` |
| testing-oracle-contract-005 | 10 | slate-browser / richtext | ProseMirror rapid consecutive and cross-paragraph composition pressure needed Slate-native proof, but overlap/decorator rows should not be overclaimed. | Patched `.tmp/slate-v2/packages/slate-browser/src/playwright/ime.ts`, `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts`, first-party contract registry, scenario guard, and research ledgers. | `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "rapid consecutive IME|cross-paragraph rich text"` passed 3 tests; `cd .tmp/slate-v2/packages/slate-browser && bun test test/core/scenario.test.ts` passed 21 tests; `cd .tmp/slate-v2 && bun --filter slate-browser typecheck` passed. | keep | `ime-overlap-decoration-audit` |
| testing-oracle-contract-006 | 11 | slate-browser / decorations-async | ProseMirror decoration-change composition pressure needed a stepwise Slate-native IME helper and proof against decoration source refresh during active composition. | Patched `.tmp/slate-v2/packages/slate-browser/src/playwright/ime.ts`, `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`, `.tmp/slate-v2/playwright/integration/examples/decorations-async.test.ts`, first-party contract registry, scenario guard, and research ledgers. | `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/decorations-async.test.ts --project=chromium --grep "interrupting active IME"` passed 2 tests; richtext IME regression passed 3 tests; scenario guard passed 21 tests; `slate-browser` typecheck passed. | keep | `ime-overlap-cancellation-audit` |
| ime-overlap-policy-research | 13 | slate-research / slate-plan | Overlap composition semantics needed more than a ProseMirror-only hunch before asking for taste or patching runtime. | Created `docs/slate-v2/research/2026-06-12-ime-overlap-policy/**`; inspected ProseMirror and Lexical source slices plus public editor-behavior pressure. | Research recommends ProseMirror-style overlap cancellation but keeps runtime work behind `slate-plan` and a queued taste checkpoint. | keep/defer | `huge-doc-architecture-research` |
| huge-doc-architecture-contract-001 | 14 | slate-research / slate-browser | Huge-doc virtualized scroll failures were already locally tested but unnamed in first-party operation contracts. | Created `docs/slate-v2/research/2026-06-12-huge-doc-architecture/**`; patched `first-party-browser-contracts.ts` and `scenario.test.ts`. | `scenario.test.ts` passed 21; focused Chromium huge-document scroll proof passed 3 rows; `slate-browser` typecheck passed. | keep | `huge-doc-scroll-anchor-metric-honesty` |
| huge-doc-scroll-anchor-metrics-001 | 15 | slate-ar-perf / benchmarks | CodeMirror-style scroll-anchor discipline needs benchmark artifacts to show whether selection materialization required frames or scroll drift before runtime tuning. | Patched `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`, `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-full.mjs`, and `.tmp/slate-v2/packages/slate/test/core-benchmark-scripts-contract.ts`. | Contract test passed 14; virtualized browser-trace smoke passed with materialization frames p95 `0` and scroll delta p95 `0px`; full-wrapper smoke passed with virtualized type-to-paint p95 `27.9ms`, select-to-paint p95 `47.8ms`, materialization frames p95 `0`, and scroll delta p95 `0px`. | keep | `huge-doc-estimated-coordinate-contract` |
| huge-doc-estimated-coordinate-contract-001 | 16 | slate-dom | Exact DOM coordinate APIs should not silently become approximate for virtualized unmounted content. | Patched `.tmp/slate-v2/packages/slate-dom/test/dom-coverage.ts`. | `cd .tmp/slate-v2 && bun test ./packages/slate-dom/test/dom-coverage.ts` passed 18 tests; `cd .tmp/slate-v2 && bun --filter ./packages/slate-dom typecheck` passed. | keep | `huge-doc-selection-endpoint-retention-audit` |
| huge-doc-selection-endpoint-retention-001 | 17 | slate-react | Virtualized selected endpoints must stay represented outside the visible page window without retaining whole page siblings or blowing the DOM budget. | Patched `.tmp/slate-v2/packages/slate-react/test/dom-strategy-page-virtualization.test.tsx`. | First run failed because the test expected whole endpoint page units; corrected to endpoint top-level rows. `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/dom-strategy-page-virtualization.test.tsx` passed 7 tests; `cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck` passed. | keep | `huge-doc-big-document-height-scaling-audit` |
| huge-doc-big-document-height-scaling-001 | 18 | slate-ar-perf / huge-document example | Extreme virtualized documents should not hide DOM/materialization failure or route-only memory waste. | Patched `.tmp/slate-v2/site/examples/ts/huge-document.tsx` to avoid caching generated initial values above 50k blocks. | 100k smoke passed with DOM p95 `316`, type-to-paint p95 `31.5ms`, click-to-paint p95 `106.6ms`, heap `179.29MB`. 200k cached baseline reached heap `391.01MB`; current no-large-cache 200k smoke after rebuild passed with DOM p95 `316`, type-to-paint p95 `31.2ms`, materialization frames p95 `0`, scroll delta p95 `0px`, heap `326.16MB`, and click-to-paint p95 `315.1ms`. | keep | `huge-doc-200k-click-selection-attribution` |
| huge-doc-200k-click-selection-attribution-001 | 19 | slate-react / slate-ar-perf | 200k virtualized click-to-paint stayed around `306ms` even though selection wait, paint wait, DOM, materialization, and typing were bounded. | Patched `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`, `.tmp/slate-v2/packages/slate/test/core-benchmark-scripts-contract.ts`, `.tmp/slate-v2/packages/slate-react/src/editable/root-interaction-controller.ts`, `.tmp/slate-v2/packages/slate-react/src/editable/content-root-navigation.ts`, and `.tmp/slate-v2/packages/slate-react/test/content-root-navigation-contract.test.ts`. | Before: `clickMouseDownEventMs` p95 `276.6ms`, root `resolve-projected-drag-endpoint` p95 `270ms`. After: 200k virtualized click-to-paint p95 `39.8ms`, click-to-selection-ready p95 `28ms`, root projected endpoint p95 `0ms`, DOM p95 `316`, materialization frames p95 `0`, type-to-paint p95 `31.6ms`. Contract test, content-root Vitest, slate-react typecheck, and fresh-build 200k benchmark passed. | keep | `huge-doc-200k-select-all-delete-attribution` |
| huge-doc-200k-select-all-delete-attribution-001 | 20 | slate / slate-react / slate-ar-perf | 200k virtualized `Cmd+A`, Delete, type, undo type, undo delete timed out for 45s; direct browser-handle undo exposed `RangeError: Maximum call stack size exceeded` while replaying a huge `replace_children` batch. | Patched `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`, `.tmp/slate-v2/packages/slate/test/core-benchmark-scripts-contract.ts`, `.tmp/slate-v2/packages/slate/src/utils/modify.ts`, `.tmp/slate-v2/packages/slate/src/interfaces/transforms/general.ts`, and `.tmp/slate-v2/packages/slate/test/operations-contract.ts`. | Before: 100k strict opt-in restored with undo-delete `833.1ms`, but 200k strict timed out and allow-failure showed undo-delete `45558.1ms` / restored `0`; direct handle undo threw stack overflow. After: core 200k operation contract passed, `slate` and `slate-react` typecheck passed, and strict fresh-build 200k virtualized trace restored with select-all `220.2ms`, delete `655.7ms`, type-after-delete `2343.9ms`, undo-type `138.9ms`, undo-delete `2339.9ms`, restored `1`, DOM p95 `316`, and click-to-paint p95 `39.9ms`. | keep | `huge-doc-cross-strategy-command-smoke` |
| huge-doc-cross-strategy-command-smoke-001 | 21 | slate-react / slate-ar-stabilize | After fixing 200k select-all/delete correctness, verify available huge-document strategies and route-level behaviors before moving to latency optimization. | Ran 20k auto/staged/virtualized browser trace with select-all/delete enabled and focused Chromium Playwright huge-document behavior grep. | 20k auto/staged/virtualized all restored after select-all/delete/undo with undo-delete-to-paint `139.4ms` / `123.2ms` / `122.4ms`; 9 Chromium route rows passed for auto typing/nav/undo/redo, virtualized select-all/delete/redo, paste-select-all undo, 5k typing/arrows/Enter/scroll, 20k materialization, insert-break, and scroll stability. | keep | `huge-doc-200k-delete-history-latency-attribution` |
| huge-doc-200k-delete-history-latency-attribution-001 | 22 | slate / slate-react / slate-ar-perf | 200k virtualized select-all/delete correctness is fixed, but type-after-delete and undo-delete still cost about 2.2-2.4s. | Patched `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-browser-trace.mjs` to record phase event timing, profiler duration totals, long-task totals, and type dispatch/model-wait split. Focused contracts/typecheck passed; strict fresh-build 200k trace passed after reverting the failed runtime shortcut. | Latest fresh-build proof: select-all `251.7ms`, delete `662.5ms`, type-after-delete `2358.9ms`, undo-type `145.3ms`, undo-delete `2168.1ms`, restored `1`. Phase attribution: type-after-delete dispatch `2075.4ms`, model wait `267.3ms`, beforeinput span `2073.4ms`, max gap `386.5ms`, profiler only `121.2ms`; undo-delete `next-snapshot` `869.1ms`, `notify-listeners` `781.1ms`, `dom-path-sync` `374.1ms`. Same-burst `insertText` no-flush experiment corrupted typed text and was reverted. | keep measurement / quarantine runtime experiment | `huge-doc-200k-undo-delete-publish-cost-research` |
| huge-doc-200k-undo-delete-publish-cost-research-001 | 23 | slate-react / slate-ar-perf | 200k select-all and undo-delete were still paying for global view-selection projection and source-listener work after correctness was fixed. | Inspected Lexical dirty-set publish, CodeMirror changed-range publish, ProseMirror docView update, and local projection/source ownership. Patched `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx`, `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`, `.tmp/slate-v2/packages/slate-react/src/view-selection-decoration.ts`, and `.tmp/slate-v2/packages/slate-react/test/view-selection-contract.test.ts`. | First focused browser proof failed because staged ShiftDown lost the focus marker; endpoint buckets fixed it. Kept proof: view-selection Vitest passed 11; slate-react typecheck passed; 7 focused Chromium rows passed; final fresh-build 200k trace restored with select-all `31.4ms` versus prior `251.7ms`, delete `629.7ms`, type-after-delete `2095.9ms`, undo-delete `1825.6ms`, restored `1`, source-listener p95 `0ms`, and view-selection projection `0.1ms`. | keep | `huge-doc-200k-undo-delete-core-snapshot-delta-research` |
| huge-doc-200k-undo-delete-core-snapshot-delta-research-001 | 24 | slate / slate-react / slate-ar-perf | 200k undo-delete rebuilt the live runtime index twice: once for the listener snapshot and again for DOM path sync. | Patched `.tmp/slate-v2/packages/slate/src/core/public-state.ts` to profile snapshot clone/index cost and to populate the main-root live runtime-index cache from the same traversal used to build the snapshot index. Tried and reverted a replace-children DOM-path-sync skip because it moved cost into selector dispatch. | Proof: `bun --filter slate typecheck`, split `operations-contract.ts` and `core-benchmark-scripts-contract.ts`, `bun --filter slate-react typecheck`, focused Chromium Playwright 7-row visual-selection set, and fresh-build 200k trace passed. Final trace: undo-delete `1524.4ms` versus prior kept `1825.6ms`; `notify-listeners` dropped to `70.6ms`; remaining hot buckets are `snapshot-build-index` `754.5ms`, `snapshot-clone-children` `181.5ms`, and `apply-replace_children` `372.6ms`. | keep / quarantine DOM-sync skip | `huge-doc-200k-replace-children-and-snapshot-index-architecture` |
| huge-doc-200k-path-key-index-fast-path-001 | 25 | slate / slate-ar-perf | 200k undo-delete still spends about half of wall time building a complete snapshot index; huge flat documents hit mostly zero-, one-, and two-segment paths. | Patched `.tmp/slate-v2/packages/slate/src/core/public-state.ts` `pathKey` to avoid `Array.join('.')` for the hot 0/1/2 segment cases while preserving the same key strings. | `bun --filter slate typecheck`, `bun test ./packages/slate/test/snapshot-contract.ts`, `bun test ./packages/slate/test/operations-contract.ts`, `bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`, and strict fresh-build 200k virtualized browser trace passed. Latest trace: select-all `31.2ms`, delete `613.2ms`, type-after-delete `2196.5ms`, undo-type `138.5ms`, undo-delete `1478.1ms`, restored `1`; `snapshot-build-index` `727.3ms`. | keep / architecture still open | `huge-doc-200k-persistent-snapshot-index-or-replace-children-replay-design` |
| huge-doc-core-fragment-delete-history-parity-001 | 27 | slate / slate-history / slate-ar-perf | Direct core `tx.fragment.delete` over a full-document selection produced many `remove_text`/`remove_node` operations and replayed thousands of `insert_node` operations on undo, unlike the browser command path and selected-text replacement path. | Patched `.tmp/slate-v2/scripts/benchmarks/core/compare/huge-document.mjs`, `.tmp/slate-v2/packages/slate/test/core-benchmark-scripts-contract.ts`, `.tmp/slate-v2/packages/slate/src/transforms-text/delete-text.ts`, `.tmp/slate-v2/packages/slate/test/delete-contract.ts`, and `.tmp/slate-v2/packages/slate-history/test/history-contract.ts`. | Before: 5k current-only subscribed core `selectAllDeleteTypeUndoMs` was `6197.01ms`, and 20k current-only timed out after >2min. After: 5k is `28.11ms`; 20k current-only completes at `105.02ms`; delete/history tests, slate/slate-history typecheck, benchmark-script contracts, and fresh-build 200k staged+virtualized browser trace passed. Browser trace confirms delete history is one `replace_children` and restores on both lanes. | keep / browser architecture still open | `huge-doc-200k-persistent-snapshot-index-or-replace-children-replay-design` |
| huge-doc-200k-cached-snapshot-index-reuse-001 | 28 | slate / slate-history / slate-ar-perf | Reusing the previous full-root `replace_children` snapshot index on history undo might remove the 200k `snapshot-build-index` bucket without changing public `SnapshotIndex` shape. | Tried an internal WeakMap keyed by the restored operation child array, plus a history contract proving the cached branch under snapshot subscribers. Reverted source and test after browser proof. | Focused gates passed during the experiment, but 200k virtualized undo-delete regressed from the kept `1524.9ms` profile to `1769.4ms` / `1750.2ms`. The branch removed `snapshot-build-index`, but `apply-replace_children` doubled to ~`722ms` and DOM path sync rose to ~`648ms`. Post-revert fresh proof restored with `1524.9ms`. | quarantine / reverted | `huge-doc-200k-replace-children-apply-cost-attribution` |
| huge-doc-200k-full-range-child-copy-fast-path-001 | 29 | slate / slate-ar-perf | A direct `newValues.slice()` for full-range child replacement might reduce the 200k `apply-replace_children` copy cost without touching operation payload isolation. | Tried and reverted `.tmp/slate-v2/packages/slate/src/utils/modify.ts` full-range branch. | Operations/snapshot/type gates passed, but 200k traces were noise: `1493.2ms` then `1525.2ms`, and `apply-replace_children` stayed around `371ms`. Post-revert gates passed. | quarantine / reverted | `huge-doc-200k-replace-children-apply-cost-attribution` |
| huge-doc-200k-full-root-replace-cached-snapshot-live-index-001 | 30 | slate / slate-history / slate-ar-perf | The earlier cached snapshot-index experiment removed `snapshot-build-index` but regressed because DOM path sync rebuilt the live runtime index; seed both snapshot and live runtime indexes for the guarded full-root `replace_children` history-restore case. | Patched `.tmp/slate-v2/packages/slate/src/core/public-state.ts` with a strict single full-root `replace_children` + optional `set_selection` cache path, cached before/after snapshot indexes only after valid snapshot changes, and seeded the main-root live runtime-index cache from the reused snapshot index. | `bun test ./packages/slate-history/test/history-contract.ts`, `bun test ./packages/slate/test/snapshot-contract.ts`, `bun test ./packages/slate/test/operations-contract.ts`, `bun --filter ./packages/slate typecheck`, `bun --filter ./packages/slate-history typecheck`, and `bun test ./packages/slate/test/core-benchmark-scripts-contract.ts` passed. Fresh 200k virtualized trace: undo-delete `1425.3ms`; second run `1411.0ms`; cross-strategy run restored staged and virtualized with staged undo-delete `1602.5ms`, virtualized `1401.5ms`. Profiler removed `snapshot-build-index`/`dom-path-sync`; remaining hot buckets are `apply-replace_children` ~`728ms` and `snapshot-reuse-live-runtime-index` ~`251ms`. | keep / architecture still open | `huge-doc-200k-apply-replace-children-replay-design` |
| huge-doc-200k-full-root-replace-live-index-preservation-001 | 31 | slate / slate-history / slate-ar-perf | The loop-30 cache still spent about `251ms` converting cached snapshot indexes back into live runtime-index maps; the live maps are read-only in current consumers and can be cached with the same child-array identity guard. | Patched `.tmp/slate-v2/packages/slate/src/core/public-state.ts` to carry `previousLiveIndex` through transaction snapshots and cache before/after live runtime indexes beside full-root replace snapshot indexes. | Same focused gates passed again: history contract 48, snapshot contract 220, operations contract 28, slate/slate-history typecheck, and benchmark-script contract 16. Fresh 200k virtualized trace: undo-delete `736.3ms`, restored `1`; cross-strategy staged/virtualized trace: staged `931.8ms`, virtualized `748.4ms`, restored `1`; profiler removed `snapshot-reuse-live-runtime-index`. | keep / architecture still open | `huge-doc-200k-replace-children-apply-replay-and-clone-design` |
| huge-doc-200k-cached-restore-dirty-path-fast-path-001 | 32 | slate / slate-history / slate-ar-perf | After live-index preservation, `apply-replace_children` was not child replay; it was dirty-path expansion for a known cached full-root restore. | Patched `.tmp/slate-v2/packages/slate/src/core/apply.ts` and `.tmp/slate-v2/packages/slate/src/core/public-state.ts` to profile replace_children apply phases and collapse dirty paths to root only when the operation hits the full-root replace snapshot cache. | Focused gates passed: slate typecheck, operations contract 28 after one known timeout rerun, snapshot contract 220, history contract 48, slate-history typecheck, benchmark-script contract 16. Fresh 200k virtualized trace: undo-delete `442.3ms`, restored `1`; cross-strategy staged/virtualized trace: staged `633.6ms`, virtualized `416.7ms`, restored `1`; `apply-replace_children` fell to `0.1ms`. | keep / architecture still open | `huge-doc-200k-snapshot-clone-and-repair-design` |
| huge-doc-200k-full-root-replace-snapshot-children-cache-001 | 33 | slate / slate-history / slate-ar-perf | After dirty-path collapse, 200k undo-delete still cloned the cached restored child array to rebuild immutable snapshot children. | Patched `.tmp/slate-v2/packages/slate/src/core/public-state.ts` to cache immutable `EditorSnapshot.children` for guarded full-root replace before/after arrays beside the existing snapshot/live index caches. | Focused gates passed: slate typecheck, operations contract 28, snapshot contract 220, history contract 48, slate-history typecheck, benchmark-script contract 16. Fresh 200k virtualized trace: undo-delete `268.9ms`, restored `1`; cross-strategy staged/virtualized trace: staged `460.7ms`, virtualized `254.7ms`, restored `1`; DOM p95 `395` / `316`. | keep / architecture still open | `huge-doc-200k-repair-notify-and-type-after-delete-design` |
| huge-doc-200k-expanded-view-selection-history-repair-skip-001 | 34 | slate-react / slate-ar-perf | History restore of an expanded Slate view selection requested caret DOM repair, paying request-repair and selector/notify JS even though projected selection owns rendering. | Patched `.tmp/slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts` and `.tmp/slate-v2/packages/slate-react/test/keyboard-input-strategy-contract.test.ts` to return force-render/none instead of `repair-caret` when history restores an expanded `SlateViewSelection`. | Focused keyboard contract passed 37 tests; projected-command contract passed 39 tests; slate-react typecheck passed. Cross-strategy 200k trace restored with staged/virtualized undo-delete `460.1ms` / `280.5ms`; virtualized rerun restored with undo-delete `244ms`, notify-listeners p95 `1.5ms`, selector-dispatch p95 `1.1ms`, DOM p95 `316`. | keep / typing cadence still open | `huge-doc-200k-type-after-delete-event-cadence` |
| huge-doc-200k-type-after-delete-event-cadence-instrumentation-001 | 35 | slate-ar-perf / benchmark scripts | Post-delete typing stayed slow after core/history/notify fixes; existing trace did not show whether the time was model wait, event cadence, long frames, or repair state. | Patched `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-browser-trace.mjs` and `.tmp/slate-v2/packages/slate/test/core-benchmark-scripts-contract.ts` to emit type-after-delete dispatch/model-wait, beforeinput/input counts/spans/gaps, long task/frame totals, profiler duration, event timelines, selection source, repair preference, and `SLATE_BROWSER_TRACE_AFTER_DELETE_TEXT`. | `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts` passed 16 tests. Fresh/single virtualized traces restored and showed type-after-delete around `2.25-2.45s`. Cross-strategy 200k proof restored staged/virtualized with staged type-after-delete `2311.1ms`, wait-for-model `3.8ms`, virtualized type-after-delete `2679.1ms`, wait-for-model `274ms`, beforeinput counts `17`, and long-frame totals about `2.3-2.6s`. | keep instrumentation / runtime gap still open | `huge-doc-200k-type-after-delete-deferred-repair-cadence` |
| huge-doc-200k-type-after-delete-runtime-shortcuts-001 | 36 | slate-react / slate-ar-perf | Releasing repair-induced virtualized text input to DOM or importing DOM selection after repair-induced beforeinput might reduce post-delete typing waits. | Tried and reverted changes in `.tmp/slate-v2/packages/slate-react/src/editable/dom-repair-queue.ts`, `.tmp/slate-v2/packages/slate-react/test/dom-repair-policy-contract.test.ts`, `.tmp/slate-v2/packages/slate-react/src/editable/editing-kernel.ts`, and `.tmp/slate-v2/packages/slate-react/test/editing-kernel-contract.ts`. | DOM release experiment failed focused repair contracts and corrupted 200k text. Beforeinput DOM-import experiment passed focused contracts but produced only an outlier win; reruns still showed virtualized wait-for-model `274-298ms`. After revert: `bun test ./test/editing-kernel-contract.ts` passed 38, keyboard strategy passed 37, input-router passed 37, DOM repair policy passed 30, and slate-react typecheck passed. | quarantine / reverted | `huge-doc-200k-type-after-delete-deferred-repair-cadence` |
| huge-doc-200k-type-after-delete-listener-attribution-001 | 37 | slate-react / slate-ar-perf | The browser long-frame observer attributed post-delete typing to editor event listeners, but the trace lacked source-level listener buckets. | Patched `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`, `.tmp/slate-v2/packages/slate/test/core-benchmark-scripts-contract.ts`, `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`, `.tmp/slate-v2/packages/slate-react/src/editable/input-router.ts`, `.tmp/slate-v2/packages/slate-react/test/runtime-before-input-events-contract.test.ts`, and `.tmp/slate-v2/packages/slate-react/test/input-router-contract.test.tsx` to keep compact long-frame attribution plus outer beforeinput/input profiler buckets. | Benchmark contract passed 16; runtime-beforeinput contract passed 5; input-router contract passed 38; slate-react typecheck passed. Fresh virtualized 200k proof restored with type-after-delete `2471.1ms`. Cross-strategy proof restored staged/virtualized: staged type-after-delete `2300.1ms` with `dom-input-total` `2127.8ms`; virtualized type-after-delete `2512.5ms` with `beforeinput-total` `1876.8ms`; model/core work stayed tiny. | keep instrumentation / source attribution still open | `huge-doc-200k-type-after-delete-source-attribution` |
| huge-doc-200k-type-after-delete-input-mode-attribution-001 | 38 | slate-ar-perf / benchmark scripts | The post-delete typing metric mixed real first-key latency with a 17-key physical burst and overwrote artifacts when mode/payload changed. | Patched `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-browser-trace.mjs` and `.tmp/slate-v2/packages/slate/test/core-benchmark-scripts-contract.ts` to support `SLATE_BROWSER_TRACE_AFTER_DELETE_INPUT_MODE=type|insertText` and include input mode plus typed payload in run artifact names. | Benchmark contract passed 16. Staged+virtualized 200k proof: 17-key physical burst `2412.1ms` / `2695ms`; single-key physical `144.9ms` / `145.5ms`; 17-char `insertText` `144.9ms` / `145.9ms`; all `undoDeleteRestored=1`. | keep benchmark-honesty / no runtime patch | `huge-doc-200k-delete-latency-attribution` |
| huge-doc-200k-delete-fragment-fast-path-attribution-001 | 39 | slate-react / slate / slate-ar-perf | 200k Delete after select-all still costs about `600ms`; previous profiler buckets pointed at repair/build-change but did not name the actual mutation path. | Patched `.tmp/slate-v2/packages/slate-react/src/editable/dom-repair-queue.ts`, `.tmp/slate-v2/packages/slate-react/src/editable/runtime-kernel-trace.ts`, `.tmp/slate-v2/packages/slate-react/src/editable/mutation-controller.ts`, `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx`, `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx`, `.tmp/slate-v2/packages/slate-react/src/editable/runtime-editor-api.ts`, `.tmp/slate-v2/packages/slate/src/internal/index.ts`, `.tmp/slate-v2/packages/slate/src/transforms-text/delete-text.ts`, and focused contract tests. | Passed `dom-repair-policy-contract`, `selection-side-effect-policy-contract`, `editing-kernel-contract`, `provider-hooks-contract`, `projected-command-contract`, slate delete contract, and slate/slate-react typechecks. Metrics: compact repair/key traces removed diagnostic tax; actual browser path is `applyFullBlockDeleteFragment`; first-unmarked mark scan cuts `delete-fragment.consistent-marks` from about `84ms` to `0.1ms`; top-level-first routing removes `delete-fragment.full-block-paths`; latest valid staged/virtualized delete `557.5ms` / `595.5ms`. Direct `tx.apply` experiment failed contracts/typecheck and was reverted. | keep instrumentation + partial runtime wins / quarantine tx.apply / split replay-build-change | `huge-doc-200k-delete-replay-build-change-design` |
| huge-doc-200k-operation-replay-clone-attribution-001 | 40 | slate / slate-react / slate-ar-perf | After delete-fragment fast-path cleanup, the remaining Delete lane needed exact replay/build-change attribution before any API or data-structure change. | Patched `.tmp/slate-v2/packages/slate/src/core/public-state.ts` with `operation-replay-clone:replace_children` profiling and `.tmp/slate-v2/packages/slate/test/delete-contract.ts` with a source guard. Tried and reverted an internal `applyOperation` slate-react runtime re-export because projected transactions do not hold core write authority. | `bun test ./packages/slate/test/delete-contract.ts` passed 31; `bun --filter ./packages/slate typecheck` passed; `bun test:vitest test/projected-command-contract.test.ts` passed 41; `bun --filter ./packages/slate-react typecheck` passed. Fresh staged+virtualized 200k trace restored both lanes: Delete `593.9ms` / `564.1ms`, undo-delete `588.8ms` / `421.6ms`, replay clone `128.9ms` / `119.9ms`, build-change `193.4ms` / `175ms`. | keep measurement / quarantine internal apply / continue design | `huge-doc-200k-delete-replay-build-change-design` |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| table fragment semantics | Slate core + browser examples | Research packet; first proof command after spec: `cd .tmp/slate-v2 && SLATE_FIXTURE_FILTER='transforms/insertFragment/of-tables' bun test ./packages/slate/test/index.spec.ts` | N/A yet | promoted to spec/test owner | Write contract before runtime patch. |
| huge-doc projection metric honesty | Slate React huge-document benchmarks | `cd .tmp/slate-v2 && CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_COUNT=50 CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_MODE=held CROSS_EDITOR_HUGE_STRICT_REPEATED_SHIFT_DOWN=1 bun run bench:react:huge-document:cross-editor:local` | Chromium via benchmark | pass after fix | Before strict run failed; after strict run passed and wrote `tmp/slate-react-huge-document-cross-editor-benchmark-surfaces-slateAuto-slateVirtualized-prosemirror-lexical-blocks-5000-iters-5-ops-10-repeat-50-repeat-mode-held-voverscan-0.json`. |
| huge-doc staged/full-DOM parity budget | Slate React staged keyboard benchmark | `cd .tmp/slate-v2 && SLATE_STAGED_COMMANDS_REPEATED_SHIFT_DOWN_COUNT=50 SLATE_STAGED_COMMANDS_SURFACES=stagedDefault SLATE_STAGED_COMMANDS_ASSERT_FULL_DOM_PARITY=1 bun run bench:react:huge-document:staged-keyboard-commands:local` | Chromium via benchmark | pass | Repeated ShiftDown p95 `21.7ms`; select-all/delete/undo stayed bounded; wrote `tmp/slate-react-huge-document-staged-keyboard-commands-surfaces-stagedDefault-blocks-10000-iters-3.json`. |
| huge-doc vertical selection contract naming | slate-browser core | `cd .tmp/slate-v2/packages/slate-browser && bun test test/core/scenario.test.ts`; `cd .tmp/slate-v2 && bun --filter slate-browser typecheck` | N/A | pass | First-party operation-family registry now includes `huge-document-projected-vertical-selection`. |
| formatted-boundary IME contract naming | slate-browser core + richtext route | `cd .tmp/slate-v2 && bun --filter slate-browser test:core`; `cd .tmp/slate-v2 && bun --filter slate-browser typecheck`; `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "IME composition|active mark|multiple formatted"`; `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/richtext.test.ts --project=webkit --grep "WebKit compositionend"` | Chromium/WebKit | pass | First-party operation-family registry now includes `ime-composition-formatted-boundaries`; browser proof passed 10 focused rows. |
| geometry/coords coverage audit | slate-browser + slate-dom | `cd .tmp/slate-v2 && bun --filter slate-browser test:selection`; `cd .tmp/slate-v2 && bun test ./packages/slate-dom/test/bridge.ts` | browser-vitest/unit | pass | Existing tests cover RTL DOM selection mapping, wrapped-line DOM rectangles, wrapped right-edge event ranges, and RTL physical-to-logical edge mapping. |
| native beforeinput target-range repair | slate-browser + slate-react + plaintext | `cd .tmp/slate-v2/packages/slate-browser && bun test test/core/scenario.test.ts`; `cd .tmp/slate-v2 && bun --filter slate-browser test:core`; `cd .tmp/slate-v2 && bun --filter slate-browser typecheck`; `cd .tmp/slate-v2/packages/slate-react && bun test:vitest -- test/selection-reconciler-contract.test.tsx test/model-input-strategy-contract.test.ts test/input-router-contract.test.tsx`; `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "beforeinput target ranges|partial selected text replacement|manual typed replacement"` | Chromium + package tests | pass | Contract row names beforeinput target-range replacement, dirty node-map guards, native partial replacement undo, and mouse-drag replacement undo. |
| rapid/cross-paragraph IME repair | slate-browser + richtext | `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "rapid consecutive IME|cross-paragraph rich text"`; `cd .tmp/slate-v2/packages/slate-browser && bun test test/core/scenario.test.ts`; `cd .tmp/slate-v2 && bun --filter slate-browser typecheck` | Chromium + package tests | pass | Contract row names rapid consecutive composition, native cross-paragraph replacement, synthetic transport no-DOM-mutation guard, and final selection placement. |
| decoration-refresh IME repair | slate-browser + decorations-async | `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/decorations-async.test.ts --project=chromium --grep "interrupting active IME"`; `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "rapid consecutive IME|cross-paragraph rich text"`; `cd .tmp/slate-v2/packages/slate-browser && bun test test/core/scenario.test.ts`; `cd .tmp/slate-v2 && bun --filter slate-browser typecheck` | Chromium + package tests | pass | Contract row names active stepwise synthetic composition across prop/hook decoration refresh and final model/DOM caret agreement. |
| external clipboard slice/context | slate-browser + slate-dom + slate-react + paste-html | `cd .tmp/slate-v2/packages/slate-browser && bun test test/core/scenario.test.ts`; `cd .tmp/slate-v2 && bun --filter slate-browser test:core`; `cd .tmp/slate-v2 && bun --filter slate-browser typecheck`; `cd .tmp/slate-v2/packages/slate-dom && bun test test/clipboard-boundary.test.ts`; `cd .tmp/slate-v2/packages/slate-react && bun test:vitest -- test/projected-clipboard-contract.test.ts`; `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/paste-html.test.ts --project=chromium --grep "ProseMirror.*slice|comment-bounded fragment|Google Docs table HTML|Quip table HTML|Word table links|Google Sheets table HTML|table header cells"` | Chromium + package tests | pass | Contract row names ProseMirror slice import, comment-bounded fragment import, and external table clipboard HTML import. |
| huge-doc virtualized scroll stability | huge-document example | `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "virtualized backward scroll stable|virtualized rows visually coherent|virtualized rows buffered"` | Chromium | pass | First-party operation-family registry now includes `huge-document-virtualized-scroll-stability`. |
| huge-doc scroll anchor metric honesty | benchmark scripts | `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=2 SLATE_BROWSER_TRACE_SKIP_BUILD=1 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`; `cd .tmp/slate-v2 && HUGE_DOC_FULL_SMOKE=1 HUGE_DOC_FULL_SKIP_BROWSER_BUILD=1 bun ./scripts/benchmarks/browser/react/huge-document-full.mjs` | Chromium via benchmark | pass | New materialization frame and scroll-delta metrics emitted by focused browser trace and full wrapper. |
| exact DOM coordinates versus virtualized boundaries | slate-dom | `cd .tmp/slate-v2 && bun test ./packages/slate-dom/test/dom-coverage.ts`; `cd .tmp/slate-v2 && bun --filter ./packages/slate-dom typecheck` | package/unit | pass | Exact DOM coordinate/range APIs return `null` for virtualized unmounted ranges; `DOMCoverage` returns the boundary result. |
| selected endpoint retention | slate-react | `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/dom-strategy-page-virtualization.test.tsx`; `cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck` | package/Vitest | pass | Expanded selection endpoint top-level rows are retained outside the visible page window, while unrelated off-window siblings stay unmounted. |
| 100k/200k virtualized height scaling | huge-document example benchmark | `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=100000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=20000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=20000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`; `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs` | Chromium via benchmark | pass / residual routed | DOM/materialization and type-to-paint stay bounded; example cache cap reduces 200k heap; 200k click latency was fixed in the follow-up packet. |
| 200k virtualized click selection attribution | huge-document example benchmark + slate-react package | `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`; `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/content-root-navigation-contract.test.ts`; `cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`; `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs` | Chromium via benchmark | pass / fixed | Click-to-paint p95 dropped from about `306ms` to `39.8ms`; root projected endpoint p95 dropped from `270ms` to `0ms`; DOM/materialization/type metrics stayed bounded. |
| 200k virtualized select-all/delete/undo restore | huge-document example benchmark + slate core | `cd .tmp/slate-v2 && bun test ./packages/slate/test/operations-contract.ts`; `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`; `cd .tmp/slate-v2 && bun --filter ./packages/slate typecheck`; `cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`; `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs` | Chromium via benchmark | pass / fixed | 200k select-all/delete/typing/undo restores the full document; core `replace_children` replay is stack-safe for 200k child ranges. |
| cross-strategy huge-document command smoke | huge-document example benchmark + Playwright | `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=defaultAuto,stagedActiveDOMGroup,virtualized SLATE_BROWSER_TRACE_BLOCKS=20000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=20000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=20000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`; `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep 'keeps auto partial-dom collapsed typing|keeps virtualized browser select-all delete|replaces a huge select-all range|keeps virtualized 5k typing|keeps virtualized middle-block materialization|keeps virtualized insert-break bursts|keeps virtualized backward scroll stable|keeps virtualized rows visually coherent|keeps virtualized rows buffered'` | Chromium | pass | Auto/staged/virtualized 20k select-all/delete restore passed; 9 route behavior rows passed. |
| 200k virtualized select-all/delete latency attribution | huge-document browser trace + slate-react contracts | `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`; `cd .tmp/slate-v2 && bun --filter slate-react test:vitest -- runtime-before-input-events-contract.test.ts input-router-contract.test.tsx dom-repair-policy-contract.test.ts selection-reconciler-contract.test.tsx selection-runtime-contract.test.ts`; `cd .tmp/slate-v2 && bun --filter slate-react typecheck`; `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs` | Chromium via benchmark | pass / measured / shortcut quarantined | Fresh 200k proof restores correctly; type-after-delete is dispatch/deferred-repair cadence, undo-delete is publish cost, and the same-burst no-flush shortcut was reverted after corrupting typed text. |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| broad local table searches | slate-auto / slate-research | high output / immediate | First `rg` over docs and external repos included issue-ledger and generated/type fixture noise. | Enough signal but too much output. | Repair by exact source slices and ledgers; avoid broad `rg` over `docs/editor-issue-harvester/**`, Lexical Flow files, and changelogs. |
| broad external editor selection grep | slate-auto / slate-research | high output / immediate | `rg` across all sibling editor repos hit lockfiles, changelogs, generated Flow output, and generic selection references. | Confirmed source targets but noisy. | Repair by direct source slices: ProseMirror `view/src`, Lexical `LexicalEditorState`/`LexicalUtils`, current v2 tests/benchmarks. |
| raw Bun file test filter | slate-auto / test command | immediate | `bun test ./packages/slate-react/test/keyboard-input-strategy-contract.test.ts` and `././...` variants did not match despite the file existing. | No test evidence until command changed. | Use package Vitest command for slate-react files: `cd .tmp/slate-v2/packages/slate-react && bun test:vitest -- test/keyboard-input-strategy-contract.test.ts`. |

slate-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| huge-doc repeated vertical selection proof bundle | `playwright/integration/examples/huge-document.test.ts` staged/virtualized rows and cross-editor benchmark | First-party `slate-browser` operation family `huge-document-projected-vertical-selection`; helper extraction deferred until a second route duplicates the mechanics. | `cd .tmp/slate-v2/packages/slate-browser && bun test test/core/scenario.test.ts` | keep |
| formatted-boundary IME proof bundle | `playwright/integration/examples/richtext.test.ts` Chromium IME and WebKit compositionend rows | First-party `slate-browser` operation family `ime-composition-formatted-boundaries`; no new helper because existing `editor.ime.compose`/CDP helpers cover the reusable mechanism. | `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "IME composition|active mark|multiple formatted"` and WebKit compositionend grep | keep |
| native beforeinput target-range repair proof bundle | `playwright/integration/examples/plaintext.test.ts` replacement rows plus slate-react selection/input repair contracts | First-party `slate-browser` operation family `native-beforeinput-target-range-repair`; helper extraction deferred because existing selection and beforeinput helpers already express the route proof. | `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "beforeinput target ranges|partial selected text replacement|manual typed replacement"` | keep |
| external clipboard slice/context proof bundle | `playwright/integration/examples/paste-html.test.ts`, `slate-dom` clipboard boundary, and slate-react projected clipboard rows | First-party `slate-browser` operation family `external-clipboard-slice-context`; selected-cell rectangle insertion stays under the table-fragment plan. | `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/paste-html.test.ts --project=chromium --grep "ProseMirror.*slice|comment-bounded fragment|Google Docs table HTML|Quip table HTML|Word table links|Google Sheets table HTML|table header cells"` | keep |
| virtualized scroll stability proof bundle | `playwright/integration/examples/huge-document.test.ts` dynamic-height scroll, scrollbar jump row stacking, and native-scrollbar drag buffering rows | First-party `slate-browser` operation family `huge-document-virtualized-scroll-stability`; no helper extraction because the reusable owner is the contract row, not a duplicated route API yet. | `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "virtualized backward scroll stable|virtualized rows visually coherent|virtualized rows buffered"` | keep |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| huge-document / virtualized / 200k | Cmd+A, Delete, type, undo type, undo delete | First/last block boundary restored, selection restored to document boundary, DOM remains bounded, no stack overflow | `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs` | pass after failed experiment revert: undo-delete restored `1`, type-after-delete-to-paint `2358.9ms`, undo-delete-to-paint `2168.1ms`, DOM after undo-delete `311` |
| huge-document / staged + virtualized / 200k | Cmd+A, Delete, type, undo type, undo delete | Full document boundary restored, DOM remains bounded, cached full-root restore and expanded view-selection history repair skip do not break staged or virtualized | `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=stagedActiveDOMGroup,virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs` | pass after expanded view-selection history repair skip: staged/virtualized `undoDeleteRestored=1`, undo-delete-to-paint `460.1ms` / `280.5ms`; virtualized rerun `244ms`, click-to-paint p95 stayed about `40-47ms`, DOM p95 `395` / `316` |
| huge-document / auto + staged + virtualized / 20k | Cmd+A, Delete, type, undo type, undo delete | Full document boundary restored, DOM bounded per strategy, click/type lanes bounded | `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=defaultAuto,stagedActiveDOMGroup,virtualized SLATE_BROWSER_TRACE_BLOCKS=20000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=20000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=20000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs` | pass: undo-delete restored `1` on all three surfaces; auto/staged/virtualized undo-delete-to-paint `139.4ms` / `123.2ms` / `122.4ms` |
| huge-document / Chromium route rows | typing, arrows, Enter, paste select-all, undo/redo, scroll stability | Model selection/text, native/caret/visual assertions in existing route specs | `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep 'keeps auto partial-dom collapsed typing|keeps virtualized browser select-all delete|replaces a huge select-all range|keeps virtualized 5k typing|keeps virtualized middle-block materialization|keeps virtualized insert-break bursts|keeps virtualized backward scroll stable|keeps virtualized rows visually coherent|keeps virtualized rows buffered'` | pass: 9 tests |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| broad external editor selection grep | slate-research | immediate / noisy | Initial `rg` across sibling editor repos hit lockfiles, changelogs, generated Flow output, and generic selection references. | Identified exact source slices but wasted output. | Use direct source slices and ledgers for the rest of this checkpoint. |
| zsh unmatched sibling repo glob | slate-research | immediate | `ls -d ../codemirror* ...` failed with `no matches found` because zsh treats unmatched globs as errors. | No research evidence. | Use exact paths or `find`/`rg --files` instead of unchecked zsh globs. |
| wrong slate-browser focused command | slate-browser | immediate | `bun test:vitest -- test/core/scenario.test.ts` is a slate-react command shape; slate-browser uses Bun core tests. | Command failed with `Script not found "test:vitest"`. | Correct command recorded: `cd .tmp/slate-v2/packages/slate-browser && bun test test/core/scenario.test.ts`. |
| broad clipboard/paste source grep | slate-auto / slate-research | immediate / very noisy | A broad `rg` across packages and examples streamed thousands of paste/fragment hits, including unrelated files. | Identified useful owners but wasted output. | Use exact source slices and `rg --files`/small file lists before content grep. |
| slate-dom root path file filter | slate-dom / Bun | immediate | Root `bun test ./packages/slate-dom/test/clipboard-boundary.test.ts` and directory filter did not match; package cwd file path worked. | `cd .tmp/slate-v2/packages/slate-dom && bun test test/clipboard-boundary.test.ts` passed 34 tests. | Record package cwd command for slate-dom focused file proof. |
| paste-html grep missed one row | slate-auto / Playwright | immediate | Initial grep `ProseMirror slice` matched the list-slice row but missed `ProseMirror text slices`. | Corrected grep to `ProseMirror.*slice` and reran; 8 rows passed. | Use wildcard or exact title list when a contract covers singular/plural test titles. |
| all-at-once IME helper could not express interleaved app changes | slate-browser | one red/green cycle | `editor.ime.compose()` could prove simple commit paths but not decoration/app changes between compositionstart/update/commit. | Added typed stepwise synthetic IME helpers and async-decoration proof rows. | Keep helper API; prefer it for future overlap/decorator composition packets. |
| wrong input-state assertion shape | slate-browser / Playwright | one failed focused run | Test asserted `isComposing`, but browser handle exposes `activeIntent` instead. | Focused decoration/IME proof failed fast, then passed after switching to `activeIntent: "composition"`. | Use existing handle snapshot fields instead of inventing assertion names. |
| broad huge-doc architecture grep | slate-research | immediate / very noisy | `rg` over `.tmp/slate-v2/packages`, missing `benchmarks/examples` dirs, and generic `visible` terms produced thousands of unrelated hits. | Identified relevant huge-doc files but wasted output. | Use `rg --files -g '!**/node_modules/**'` to build a small file list before content grep. |
| broad huge-doc file find walked node_modules | slate-research | immediate / noisy | `find .tmp/slate-v2 -path '*huge*' -o -path '*virtual*'` walked Bun/node_modules and integration artifacts. | Identified TanStack and huge-doc source paths but included dependency/build noise. | Prefer `rg --files` with node_modules/build-output excludes. |
| Monaco internal-source mismatch | slate-research | immediate | Shallow `microsoft/monaco-editor` clone exposed package/wrapper sources, not the useful editor engine internals. | Rejected Monaco as authority for this packet. | Only clone VS Code internals if a future packet specifically needs Monaco architecture evidence. |
| root Bun benchmark script contract path filter | slate-ar-perf / Bun | immediate | `bun test packages/slate/test/core-benchmark-scripts-contract.ts` did not match; Bun needed the repo-relative `./` path for this contract file. | Corrected command passed 14 tests. | Keep using `bun test ./packages/...` for root Bun contract files. |
| over-broad endpoint page-unit assumption | slate-react / test design | one failed Vitest run | The first endpoint-retention test expected whole endpoint page units to mount, but current source intentionally retains endpoint top-level rows only. | Failure clarified the DOM-budget contract; corrected test passed. | Keep endpoint retention narrow unless browser proof shows page-unit retention is required. |
| 200k cache experiment comparison | slate-ar-perf / huge-document example | three 200k benchmark runs plus two fresh builds | The first no-large-cache run improved heap but appeared to worsen click latency; a reverted cached comparison showed the click latency was also high after rebuild. | Keep decision uses comparable fresh-build proof and records click as residual, not solved. | Keep cache cap for heap; route click latency to attribution. |
| broad root-interaction source search | slate-auto / slate-ar-perf | immediate / output-heavy | A broad `rg` across editable packages and benchmark scripts produced too much trace/source output for the active packet. | It still found root interaction and trace files, but wasted output budget. | Use exact file slices and root profiler metrics for the rest of the packet. |
| non-redefinable runtime editor spy | slate-react / Vitest | one failed focused test | `vi.spyOn(mainEditor, 'read')` failed because runtime editor methods are non-redefinable. | The failure was harness-only; switched to an `Object.create(mainEditor)` wrapper with its own throwing `read`. | Keep structural no-scan assertion without mutating runtime editor instances. |
| select-all/delete diagnostic serialized too much trace data | benchmark script | one failed diagnostic / 611MB artifacts | Initial 200k allow-failure diagnostics included full kernel operation payloads and wrote huge JSON artifacts. | Removed the generated huge artifacts and compacted kernel/history diagnostics to counts plus first/last/last-three operations. | Keep compact phase diagnostics; never serialize bulk `replace_children.children` into browser benchmark artifacts. |
| 200k keyboard undo timeout hid thrown stack overflow | benchmark script / slate core | 45s wait plus one direct-handle retry | Keyboard shortcut proof reported a no-restore timeout, but the direct `__slateBrowserHandle.undo()` retry exposed the actual `RangeError: Maximum call stack size exceeded`. | Root cause moved from keyboard/history routing to variadic `replace_children` replay; strict proof now passes. | Keep optional diagnostic fallback under `ALLOW_FAILURE` only; strict runs still fail on restore failure. |
| Bun native test runner against Vitest files | slate-react / Bun | two failed commands | `bun test ./packages/slate-react/test/...` did not match Vitest-managed slate-react contract files even though they existed. | Switched to `bun --filter slate-react test:vitest -- <files>`; 5 files / 100 tests passed. | Use package script for slate-react Vitest contracts; root Bun path filters are only for Bun-managed tests. |
| editing-kernel Bun contract path | slate-react / Bun | two failed commands | `bun test:vitest test/editing-kernel-contract.ts` and `bun test test/editing-kernel-contract.ts` did not match because the file is not in the Vitest include pattern and Bun needs `./` for explicit paths. | `cd .tmp/slate-v2/packages/slate-react && bun test ./test/editing-kernel-contract.ts` passed 38 tests after runtime revert. | For non-`*.test.ts` slate-react contract files, run the exact Bun path with `./` from the package directory. |
| skip-build after runtime revert | slate-ar-perf / benchmark script | one failed strict 200k trace | `SLATE_BROWSER_TRACE_SKIP_BUILD=1` after reverting runtime selection code used stale built app output and reproduced the already-quarantined text reordering. | Fresh build rerun passed immediately with correct `after 200k delete`, proving the failure was stale build state, not current source. | After runtime reverts or source edits, run one fresh browser benchmark before trusting skip-build proof. |
| same-burst `insertText` no-flush experiment | slate-react / huge-doc perf | one failed fresh-build 200k benchmark | Skipping pending native text repair flush between `insertText` beforeinput events looked like a coalescing optimization but corrupted post-delete typing. | Failed with expected `after 200k delete`, actual `after 20 dlteeek0`; source and contract were reverted, then focused contracts/typecheck and fresh 200k proof passed. | Quarantine this shortcut; future work must preserve native/model caret agreement before chasing burst typing speed. |
| repair-induced DOM authority shortcut | slate-react / huge-doc perf | one failed contract set plus two 200k traces | Letting virtualized repair-induced text insertion release selection to DOM corrupted character order; letting beforeinput import DOM after repair-induced text input was not a stable perf win. | DOM release corrupted `after 200k delete`; beforeinput import reruns still showed virtualized wait-for-model `274-298ms`; all runtime policy edits were reverted and focused contracts/typecheck passed. | Do not relax selection authority for perf unless native/model caret agreement is proven in fresh 200k staged+virtualized browser proof. |
| broad external editor publish-cost grep | slate-research | immediate / very noisy | A broad `rg` for update/listener/snapshot/history across sibling editor repos streamed too much generic output before useful source slices were identified. | Narrowed to Lexical dirty-set publish, CodeMirror `ViewUpdate.changedRanges`, ProseMirror `docView.update`, and local projection/snapshot owners. | Start with exact source files and known repo architecture terms, not broad publish vocabulary. |
| focused Vitest file outside include pattern | slate-react / Vitest | two failed commands | `dom-strategy-and-scroll.tsx` uses Vitest globals but is not matched by `test/**/*.test.{ts,tsx}`; direct package Vitest still reported no files, and Bun native lacked global `test`. | Skipped it as a focused gate and covered the provider move with typecheck plus Playwright routes that exercise visual selection. | Rename or include the file later if it should be a focused contract gate. |
| scoped view-selection source dropped staged focus marker | slate-react / Playwright | one failed browser proof | Moving view-selection projection into the mounted runtime scope fixed global projection cost but initially omitted an off-window staged focus path (`11,0`). | Browser screenshot/native-selection proof failed, then passed after scoped source always included selection endpoint top-level ids. | Keep endpoint inclusion as the contract; do not optimize it away. |
| replace_children DOM-path-sync skip non-win | slate-react / huge-doc perf | one browser experiment | Skipping DOM path sync for `replace_children` removed the `dom-path-sync` bucket but moved cost into selector dispatch (`448.6ms`) and slightly worsened undo-delete wall time. | Experiment was reverted; focused browser proof and the next kept packet use the normal path-sync path. | Do not skip path sync blindly; share/cache runtime indexes instead. |
| overpacked Bun contract command | slate / Bun | one timeout | Running `operations-contract.ts` and `core-benchmark-scripts-contract.ts` in one Bun command pushed the 200k operations test over the default 5s timeout. | Split commands: operations passed alone in `4.52s`; benchmark script contract passed separately. | Keep huge 200k operation proof as its own command. |
| full legacy/current core benchmark before current-only mode | slate-ar-perf / benchmark script | two interrupted >2min runs | The first 20k core benchmark mixed legacy compare cost with the current API perf gap, then current-only 20k still hung because full-document `fragment.delete` produced a huge replay stream. | Added `CORE_HUGE_BENCH_CURRENT_ONLY=1`, subscribed snapshot materialization, and the explicit `selectAllDeleteTypeUndoMs` lane; after the runtime fix, 20k current-only finishes at `105.02ms`. | Keep current-only mode for attribution before paying cross-repo legacy compare cost. |
| cached snapshot-index reuse non-win | slate / huge-doc perf | two 200k traces plus revert trace | Reusing a cached full-root `replace_children` snapshot index looked like the right target because it removed `snapshot-build-index`, but wall time regressed and cost moved into `apply-replace_children` and DOM path sync. | Experiment traces: undo-delete `1769.4ms` and `1750.2ms`; post-revert fresh trace `1524.9ms`. | Quarantine identity-cache index reuse. Next packet must target apply/replay or DOM sync directly, or propose a real public snapshot-index design. |
| compaction during partial runtime edit | slate-auto / Codex loop | one resume checkpoint | The output compacted after helper code had landed but before it was wired or reverted, leaving orphan speculative code in `public-state.ts` until resume. | Resume started by reading the active plan and exact source anchors before making more edits; the packet was completed, measured, and kept. | On resume after any partial edit, inspect source first and close the packet before starting a new owner. |
| provider hook contract runner mismatch | slate-react / Vitest | two failed commands | `provider-hooks-contract.tsx` is exercised through the `.test.tsx` wrapper; direct Bun fails without `document`, and direct Vitest on the helper file does not match includes. | Correct command passed 37 tests: `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/provider-hooks-contract.test.tsx`. | Use the wrapper test file for provider hook contracts. |
| delete-contract source guard URL mismatch | slate / Bun | one failed source guard | The initial source guard resolved `delete-text.ts` relative to the test directory and produced the wrong URL path. | Corrected the guard to `new URL('../src/transforms-text/delete-text.ts', import.meta.url)`; `bun test ./packages/slate/test/delete-contract.ts` passed 31 tests. | For source guards, resolve from the test file's actual directory, not from memory of package layout. |
| direct transaction apply shortcut | slate-react / projected command | one failed contract plus typecheck | Trying `tx.apply(...)` inside `editor.update` would have avoided replay clone cost, but the active transaction API does not expose `apply`. | `bun test:vitest test/projected-command-contract.test.ts` failed with `TypeError: tx.apply is not a function`; `bun --filter ./packages/slate-react typecheck` failed; the experiment was reverted and both commands passed. | Quarantine untyped transaction shortcuts. Inspect the replay/build-change API before optimizing this owner. |
| internal applyOperation from projected runtime | slate-react / slate core boundary | one failed contract | Re-exporting `applyOperation` through slate-react runtime API looked cleaner than `tx.apply`, but projected runtime updates are not the same as core write authority. | `bun test:vitest test/projected-command-contract.test.ts` failed with `editor writes must run inside editor.update`; the experiment was reverted; projected-command and slate-react typecheck passed. | Any clone-skip design must live in core transaction/replay semantics, not as a slate-react projected-runtime side door. |
| type-after-delete artifact key missed mode/payload | benchmark script | two overwritten trace artifacts | The first A/B trace artifact path did not include input mode or typed payload, so `type`, `insertText`, and single-key runs could overwrite each other. | Added mode and payload to the artifact path and guarded both strings in the benchmark contract. | Keep this as benchmark hygiene; metric artifacts must encode every variable that changes the conclusion. |
| guessed browser trace profiler shape | slate-auto / artifact reducer | one failed reducer | A quick local reducer assumed `phaseTrace.profiler` was an array; it is an object keyed by profiler label. | Reran with schema-aware parsing and extracted delete/type/undo profiler buckets. | Inspect artifact keys before one-off reducers over generated JSON. |
| stale-placeholder scan regex newline | slate-auto / rg | one failed audit command | A final stale-scan regex included a literal `\n`, which `rg` rejects without multiline mode. | Corrected to separate single-line scans; hits were only technical `pending DOM selection` wording, not open placeholders. | Keep stale scans simple or use explicit multiline mode when matching across headings. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `.tmp/slate-v2/packages/slate/src/core/public-state.ts` now profiles snapshot clone/index cost, seeds live runtime indexes from main-root snapshot construction, fast-paths hot path keys, and reuses cached full-root `replace_children` snapshot indexes, live indexes, and immutable snapshot children under a strict one-op guard; `.tmp/slate-v2/packages/slate/src/core/apply.ts` profiles `replace_children` apply phases and collapses cached full-root restore dirty paths to root only; `.tmp/slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts` skips caret DOM repair when history restores an expanded Slate view selection; `.tmp/slate-v2/packages/slate/src/utils/modify.ts`; `.tmp/slate-v2/packages/slate/src/interfaces/transforms/general.ts`; `.tmp/slate-v2/packages/slate/src/transforms-text/delete-text.ts`; `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx`; `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`; `.tmp/slate-v2/packages/slate-react/src/view-selection-decoration.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/dom-coverage-vertical-selection.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/root-interaction-controller.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/content-root-navigation.ts`; `.tmp/slate-v2/packages/slate-browser/src/core/first-party-browser-contracts.ts`; `.tmp/slate-v2/packages/slate-browser/src/playwright/ime.ts`; `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts` |
| tests/oracles/browser proof | Focused slate-react Vitest contract, focused Playwright repeated-selection screenshot/native-selection tests; `.tmp/slate-v2/packages/slate-react/test/keyboard-input-strategy-contract.test.ts` gained expanded view-selection history repair coverage; `.tmp/slate-v2/packages/slate-react/test/view-selection-contract.test.ts` gained scoped view-selection runtime-scope and endpoint coverage; `.tmp/slate-v2/packages/slate/test/operations-contract.ts` gained a 200k `replace_children` apply/invert contract; `.tmp/slate-v2/packages/slate/test/delete-contract.ts` and `.tmp/slate-v2/packages/slate-history/test/history-contract.ts` gained full-document `fragment.delete` structural-operation/history coverage; `.tmp/slate-v2/packages/slate-browser/test/core/scenario.test.ts` updated for huge-doc vertical selection, virtualized scroll stability, IME, native beforeinput target-range, and external clipboard slice/context contract rows; `.tmp/slate-v2/packages/slate-dom/test/dom-coverage.ts` gained exact-DOM-vs-virtualized-boundary coverage; `.tmp/slate-v2/packages/slate-react/test/dom-strategy-page-virtualization.test.tsx` gained expanded-selection endpoint retention coverage; `.tmp/slate-v2/packages/slate-react/test/content-root-navigation-contract.test.ts` gained no-scan proof for plain documents; `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts` and `.tmp/slate-v2/playwright/integration/examples/decorations-async.test.ts` gained IME rows; focused richtext Chromium/WebKit IME, decorations Chromium IME, plaintext Chromium replacement, paste-html Chromium slice/table, huge-document virtualized scroll proof, slate-dom boundary proof, slate-react endpoint proof, 200k click benchmark proof, 200k select-all/delete benchmark proof, core full-document delete/history proof, projected-command history proof, and focused staged/virtualized visual-selection Playwright proof passed. |
| benchmarks/metrics/targets | Cross-editor repeated ShiftDown benchmark artifact and staged keyboard command benchmark artifact updated under `.tmp/slate-v2/tmp/`; `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-browser-trace.mjs` now emits materialization frame, scroll-delta, click mouse phase, root mousedown phase, opt-in select-all/delete metrics, phase-local type-after-delete dispatch/model-wait, beforeinput/input counts/spans/gaps, long-task/frame totals, profiler duration, event timelines, selection-source state, compact long-task / long-animation-frame attribution, configurable `SLATE_BROWSER_TRACE_AFTER_DELETE_TEXT`, `SLATE_BROWSER_TRACE_AFTER_DELETE_INPUT_MODE`, and mode/payload-safe artifact names; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts` and `.tmp/slate-v2/packages/slate-react/src/editable/input-router.ts` now expose profiler-only outer event-handler buckets for beforeinput/input attribution; `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-full.mjs` emits full-wrapper materialization metrics; `.tmp/slate-v2/scripts/benchmarks/core/compare/huge-document.mjs` now has a subscribed history select-all/delete/type/undo lane and current-only profiling mode; `.tmp/slate-v2/packages/slate/test/core-benchmark-scripts-contract.ts` guards the new output strings; 100k/200k virtualized smoke artifacts updated under `.tmp/slate-v2/tmp/`. |
| examples/docs | `.tmp/slate-v2/site/examples/ts/huge-document.tsx` avoids caching generated initial values above 50k blocks. |
| skills/workflow | Workflow slowdowns now include the slate-react non-`*.test.ts` Bun contract command shape; no `.agents/rules/**` source repair in this loop, so no `pnpm install` required. |
| reverted/quarantined packets | Same-burst `insertText` no-flush runtime shortcut in `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts` was reverted after corrupting 200k post-delete typing; virtualized repair-induced DOM release in `.tmp/slate-v2/packages/slate-react/src/editable/dom-repair-queue.ts` was reverted after contract failures and text reordering; beforeinput repair-induced DOM-import policy in `.tmp/slate-v2/packages/slate-react/src/editable/editing-kernel.ts` was reverted because its perf win was an outlier and it weakened selection authority; first cached snapshot-index identity experiment was reverted because cost moved into DOM path sync; full-range child-copy fast path in `.tmp/slate-v2/packages/slate/src/utils/modify.ts` was reverted as noise; benchmark instrumentation stayed. |
| research/docs | `docs/slate-v2/research/2026-06-12-table-fragment-semantics/**`; `docs/research/raw/2026-06-12-table-fragment-semantics/README.md`; `docs/slate-v2/research/2026-06-12-huge-doc-native-selection/**`; `docs/research/raw/2026-06-12-huge-doc-native-selection/README.md`; `docs/slate-v2/research/2026-06-12-testing-oracles/**`; `docs/research/raw/2026-06-12-testing-oracles/README.md`; `docs/slate-v2/research/2026-06-12-ime-overlap-policy/**`; `docs/research/raw/2026-06-12-ime-overlap-policy/README.md`; `docs/slate-v2/research/2026-06-12-huge-doc-architecture/**`; `docs/research/raw/2026-06-12-huge-doc-architecture/README.md`; active plan updated. |
| plans/specs | `docs/plans/2026-06-12-slate-v2-table-fragment-rectangle-algebra-plan.md` |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Post-delete typed-burst cadence and staged undo-type | Latest fresh-build 200k proof shows Delete is fixed but post-delete burst typing is still slow: staged `2357.3ms`, virtualized `337.8ms`; staged undo-type is `314ms` while virtualized undo-type is `17.9ms`. | `huge-doc-post-delete-burst-and-staged-undo-attribution`; final 200k trace artifact in `.tmp/slate-v2/tmp/slate-react-huge-document-browser-trace-benchmark-surfaces-stagedActiveDOMGroup-virtualized-blocks-200000-iters-1-ops-1-after-delete-type-after-delete-text-after-200k-delete.json` | Inspect closely; route next to `slate-ar-perf` and only patch with native/model caret proof. |
| 2 | Table-fragment rectangle algebra plan | It is the biggest planned semantics packet not executed in this run, and the skill boundary says accept/revise before runtime fixture changes. | `docs/plans/2026-06-12-slate-v2-table-fragment-rectangle-algebra-plan.md` | Accept unless a quick issue/accounting pass finds contradiction. |
| 3 | IME overlap cancellation policy | External research supports ProseMirror-style stale composition cancellation, but this is a behavior-law decision, not a hidden runtime tweak. | `docs/slate-v2/research/2026-06-12-ime-overlap-policy/README.md` | Route to `slate-plan`; my default is yes. |
| 4 | Raw mobile/device claims | Playwright mobile/desktop proof is not raw device proof. | Raw mobile/device rows in this plan; Slate v2 command policy in `.agents/AGENTS.md` | Defer until a real repeatable device lane exists. |
| 5 | Huge-document final visual feel | Automated rows passed, but huge-doc interactions are the place where “feels native” can still diverge from metrics. | `http://localhost:3100/examples/huge-document?strategy=staged` and `?strategy=virtualized`; final 13-row Chromium proof | Spot-check manually before judging the lane as perfect. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| huge-doc-post-delete-burst-and-staged-undo-attribution | perf/architecture deferral | Should the next loop attack physical post-delete burst cadence first, staged DOM-current undo-type first, or route both through one event-cadence/caret-authority design? | Delete is fixed, but the latest 200k trace still shows visible post-delete tail work; the wrong shortcut already corrupted text once. | Runtime event-cadence patching beyond measured attribution. | Final proof, plan closure, and documentation updates. | Start with `slate-ar-perf` attribution; patch only after native/model caret agreement is covered. | Final fresh-build 200k trace row above. |
| table-fragment-contract-review | user-review boundary | Accept or revise `docs/plans/2026-06-12-slate-v2-table-fragment-rectangle-algebra-plan.md` before executing fixture/runtime changes. | `slate-plan` planning mode forbids implementation until the ready plan is accepted; executing without review would bypass the skill boundary. | Fixture conversion and browser selected-cell proof. | Huge-doc/native-selection research and other safe automation checkpoints. | Accept rectangle-algebra direction unless issue/accounting pass finds a contradiction. | `docs/plans/2026-06-12-slate-v2-table-fragment-rectangle-algebra-plan.md` |
| ime-overlap-cancellation-taste | missing taste / policy boundary | Should Slate v2 adopt ProseMirror-style overlap cancellation: app/model/remote overlap wins, stale composition commits are ignored, and non-overlap edits preserve composition? | External research narrowed the policy, but Vision does not yet define this conflict rule. | Browser/runtime test for overlapping app/remote edits during active composition. | Other safe testing-oracle, huge-doc, API/DX, and research checkpoints. | Route to `slate-plan` before runtime policy; my default is yes. | `docs/slate-v2/research/2026-06-12-ime-overlap-policy/README.md` |

Findings:
- ProseMirror tables treats table clipboard as rectangle algebra: source cells
  become a rectangular area, selected-cell paste clips/repeats to destination,
  collapsed-cell paste inserts at the target cell, destination tables grow/split
  spans, and selection lands on the inserted cell rectangle.
- Tiptap OSS table semantics are duplicate support because it re-exports and
  wires ProseMirror tables.
- Lexical is useful for selected table/HTML/JSON export contrast, but it does
  not settle Slate core `insertFragment` merge policy.
- Slate v2 adjacent coverage is strong for table-cell navigation and external
  full-table HTML import, but the exact selected-cell/table-fragment contract is
  still open.
- `slate-plan` created the table-fragment rectangle-algebra plan but execution
  waits for user acceptance; this is a queued stopping checkpoint, not a blocker
  for the rest of timed supervision.
- Huge-doc source research says the right direction is hybrid ownership: native
  selection only when DOM coverage is reliable, projected/model-owned selection
  when staged/virtualized DOM cannot represent the target.
- ProseMirror is the useful external reference for geometry APIs and ownership
  boundaries, but its DOM-present premise does not transfer directly to
  virtualized Slate v2.
- CodeMirror is the useful external reference for huge-document viewport
  architecture: explicit drawn/visible ranges, selection endpoint viewports,
  height-map viewport computation, scroll anchoring, and precise-versus-estimated
  coordinate boundaries.
- Huge-document architecture research rejected a runtime rewrite and promoted a
  named `huge-document-virtualized-scroll-stability` contract row instead.
- Huge-document benchmark output now reports selection materialization frames
  and scroll-delta p95 for cold and already-materialized selection, both in the
  browser trace script and the full wrapper. The smoke run showed virtualized
  materialization frames p95 `0` and scroll delta p95 `0px`.
- The precise-versus-estimated coordinate decision is now explicit: Slate v2
  does not invent estimated DOM coordinates for virtualized unmounted content.
  `resolveDOMPoint`, `resolveDOMRange`, and `resolveRangeRect` stay exact-only;
  `DOMCoverage` owns boundary-aware results.
- The selected-endpoint retention decision is now explicit: virtualized mode
  retains expanded selection endpoint top-level rows outside the visible page
  window, but not unrelated off-window siblings. This protects selection
  behavior without quietly raising the DOM budget.
- 100k/200k virtualized route smoke does not show a DOM/materialization failure:
  DOM nodes stay around `316`, materialization frames stay `0`, and
  type-to-paint stays about `31ms`. The latest click packet removed the
  200k plain-document click tax; the latest select-all/delete packet fixed the
  next broad editing failure by making core child-range replacement stack-safe.
- 200k select-all/delete failure was not lost history. Phase diagnostics showed
  the `replace_children` undo batch remained after undoing typed text. A direct
  browser-handle undo then exposed the real failure: applying the inverse
  `replace_children` operation spread 200k children as function arguments and
  overflowed the browser stack.
- 200k post-delete typing latency is not explained by core insert-text cost:
  fresh trace spends `2075.4ms` inside keyboard dispatch with `17`
  `beforeinput` events, `2073.4ms` beforeinput span, max event gap `386.5ms`,
  and only `121.2ms` of recorded profiler time.
- The obvious same-burst `insertText` no-flush shortcut is wrong today. It
  corrupted post-delete text to `after 20 dlteeek0`, so the runtime and test
  change were reverted and the idea is quarantined.
- 200k undo-delete latency was first attributed to O(document) publish work
  after the full child-range restore: `next-snapshot` `869.1ms`,
  `notify-listeners` `781.1ms`, and `dom-path-sync` `374.1ms`. The kept
  full-root restore cache packets have now removed the snapshot-index rebuild,
  live-index conversion, DOM path-sync rebuild, apply dirty-path expansion, and
  snapshot child clone from the main restore path.
- Direct core `tx.fragment.delete` had a separate API/DX perf bug: full-root
  deletion produced many text/node operations while selected text replacement
  and browser delete used structural `replace_children`. The kept fix makes
  full-document fragment deletion one `replace_children`, collapsing the
  subscribed 5k core history lane from `6197.01ms` to `28.11ms` and letting 20k
  current-only finish at `105.02ms`.
- That core/API parity win did not solve the 200k browser undo-delete
  architecture gap alone, but follow-up guarded full-root restore packets moved
  fresh staged/virtualized undo-delete to `460.7ms` / `254.7ms`. The remaining
  hot owner is repair/notify plus post-delete typing cadence, not core
  snapshot/index restore.
- Huge-document correctness smoke is green for the current main strategy set:
  20k auto/staged/virtualized select-all/delete restore passes, and 9 focused
  Chromium route rows cover typing, navigation, undo/redo, paste select-all,
  Enter, materialization, and scroll stability.
- The huge-document example cache was inflating 200k heap. Capping generated
  initial-value caching above 50k blocks reduced current 200k heap from about
  `391MB` to `326MB`.
- Lexical supports model-level select-all/dirty-selection accounting as a
  contrast, especially for separating model select-all correctness from native
  selected text length.
- Legacy Slate huge-document is not the bar. It has chunking/content-visibility
  knobs and a shallow chunk-count Playwright test.
- The promoted strict cross-editor benchmark found a real regression:
  `slateAuto startBlock repeated Shift+ArrowDown did not extend selection at
  step 33: 253 -> 253`. Strict-off metrics showed `slateAuto startBlock`
  repeated ShiftDown p95 `239.7ms` with `plain-vertical.resolve-model-line-target`
  dominating about `19s` total; `slateVirtualized`, ProseMirror, and Lexical
  were all near `16ms`.
- The kept runtime patch avoids that hot fallback for plain single-text
  huge-document blocks that are leaving the rendered line by using the existing
  adjacent-block extension first. This keeps rich/wrapped cases on the existing
  visual/model paths.
- After patch, strict cross-editor passed and `slateAuto startBlock` repeated
  ShiftDown p95 dropped to `15.4ms`; middle-block p95 was `15.8ms`.
- Testing-oracle research found Slate v2 already has strong reusable primitives:
  displayed selection snapshots, selected text, DOM selection target, no double
  highlight, clipboard native/synthetic fallbacks, IME native/synthetic
  transports, scenario traces, reduction candidates, and warm-loop gauntlets.
- The missing reusable owner was contract naming for the huge-doc repeated
  vertical-selection proof bundle. The new operation family names monotonic
  ShiftDown, reverse ShiftUp, projected view markers, empty native selected
  text under projection, no double highlight, and hot-path budget expectations.
- ProseMirror view tests are still valuable pressure for future oracle packets:
  multi-child/cursor-wrapper/overlap composition cases, coords round trips,
  wrapped/RTL geometry, block/inline boundary arrows, `Selection.extend`
  fallback, and native DOM-change selection repair.
- Existing Slate v2 richtext tests already cover the highest-value formatted
  IME subset: bold markup, empty block, select-all replacement, active mark
  cursor-wrapper, formatted sibling, multi formatted-node Korean replacement,
  and WebKit compositionend deletion cleanup.
- ProseMirror geometry/coords pressure maps to existing Slate package proof:
  `slate-browser` browser selection tests cover RTL selection and wrapped-line
  rectangles, and `slate-dom` bridge tests cover wrapped right-edge and RTL
  event-range mapping.
- ProseMirror DOM-change selection-repair pressure maps to existing Slate v2
  proof: slate-react target-range import/rejection and pending native text
  repair contracts, plus plaintext browser rows for beforeinput target-range
  replacement, native partial replacement undo, and mouse-drag replacement undo.
- Tiptap's Cypress paste helper is weaker duplicate support; Slate's
  `slate-browser` clipboard helpers already cover native and synthetic paths
  with stronger assertions.
- ProseMirror clipboard open-slice/context pressure splits into two Slate
  owners: external HTML/slice import is covered and now named as
  `external-clipboard-slice-context`, while selected-cell rectangle insertion
  remains queued behind the table-fragment review boundary.

Decisions and tradeoffs:
- Keep the research packet and promote to `slate-plan`; do not bless current
  skipped fixture behavior or patch runtime before the table-fragment contract
  names source-cell, target-cell, span, and selection rules.
- Keep the table-fragment plan as planning evidence; no `.tmp/slate-v2` runtime
  patch under `slate-plan` planning mode.
- Keep the huge-doc native-selection research packet and promote to benchmarks,
  not runtime. Rejected pure-native virtualized selection and legacy chunking as
  targets.
- Run the 50-step cross-editor repeated ShiftDown benchmark first; only patch
  runtime if the artifact names a stable hot phase. Otherwise keep runtime and
  tighten claim wording.
- Queue staged/full-DOM parity benchmark as the next attribution step if the
  cross-editor packet shows Slate residual but not the owner.
- Kept the runtime patch because it is narrow, removes the measured fallback,
  preserves focused contract tests, passes cross-editor strict proof, passes
  staged/full-DOM parity proof, and passes screenshot/no-double-highlight
  Playwright rows.
- Kept the `slate-browser` contract promotion because it makes the strongest
  recent route-local proof discoverable through the first-party operation
  registry without adding premature helper API. Helper extraction is deferred
  until another route duplicates the same repeated-key proof mechanics.
- Kept the IME contract promotion because it names existing Chromium/WebKit
  richtext proof instead of writing duplicate tests. Remaining ProseMirror IME
  leads stay queued for overlap/rapid/cross-paragraph scenarios.
- Kept the native beforeinput target-range contract promotion because it names
  existing unit and browser proof instead of adding a duplicate DOM-change test.
  Deeper ProseMirror DOM mutation rows should only become runtime work when a
  new Slate-native failure signature appears.
- Kept the external clipboard slice/context contract promotion because it names
  current paste-html and clipboard boundary proof without collapsing it into
  selected-cell table fragment semantics. The latter still needs the existing
  `table-fragment-contract-review` checkpoint before runtime execution.
- Kept the scroll-anchor metric packet because it improves benchmark honesty
  without changing runtime behavior. The new metrics make future scroll or
  coordinate work prove whether selection needed extra frames or changed
  scroll position during materialization.
- Kept the estimated-coordinate contract as `slate-dom` test coverage instead
  of adding a new API. That is the cleaner architecture: precise DOM APIs stay
  precise, and virtualized missing-DOM ownership is explicit through coverage
  boundaries.
- Kept endpoint retention as a package contract after correcting the first
  over-broad test expectation. Retaining endpoint rows is the right long-term
  contract today; retaining whole endpoint page units would be a DOM-budget cost
  without proof.
- Kept the large-document cache cap because it improves route memory without
  touching runtime semantics. The follow-up click attribution packet is also
  kept: content-root owner discovery no longer scans plain huge documents, and
  200k virtualized click-to-paint p95 is now about `40ms`.
- Kept the select-all/delete fix because it is a core stack-safety repair, not
  route glue: bulk `replace_children` replay now uses array-based replacement,
  while the old variadic helper API remains for small ordinary call sites.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Raw Bun file filter for slate-react Vitest file | 3 | Use package Vitest command instead of `bun test` path filter. | `cd .tmp/slate-v2/packages/slate-react && bun test:vitest -- test/keyboard-input-strategy-contract.test.ts` passed. |
| Strict cross-editor repeated ShiftDown benchmark before patch | 1 | Rerun strict-off to collect attribution, then patch only named hot phase. | Strict-off showed model-line fallback hot path; targeted runtime patch kept. |
| Wrong slate-browser scenario test command | 1 | Use slate-browser package scripts instead of slate-react Vitest command shape. | `cd .tmp/slate-v2/packages/slate-browser && bun test test/core/scenario.test.ts` passed. |
| `vi.spyOn` on runtime editor `read` | 1 | Use a wrapper object with its own throwing `read` instead of redefining runtime methods. | Content-root no-scan test passed. |
| Root Bun benchmark script contract path missing `./` | 1 | Use the exact repo-relative `./packages/...` path. | `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts` passed. |

Verification evidence:
- Research artifact written at
  `docs/slate-v2/research/2026-06-12-table-fragment-semantics/**`.
  Code-level evidence came from local cloned/source checkouts rather than
  GitHub webpage browsing.
- Research artifact written at
  `docs/slate-v2/research/2026-06-12-huge-doc-native-selection/**`.
  Code-level evidence came from local sibling checkouts and current Slate v2
  source/tests/benchmark scripts.
- Failed proof before patch:
  `cd .tmp/slate-v2 && CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_COUNT=50 CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_MODE=held CROSS_EDITOR_HUGE_STRICT_REPEATED_SHIFT_DOWN=1 bun run bench:react:huge-document:cross-editor:local`
  failed at `slateAuto startBlock` step 33.
- Attribution proof:
  `cd .tmp/slate-v2 && CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_COUNT=50 CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_MODE=held CROSS_EDITOR_HUGE_STRICT_REPEATED_SHIFT_DOWN=0 bun run bench:react:huge-document:cross-editor:local`
  wrote the cross-editor artifact and showed `slateAuto` p95 `239.7ms` versus
  virtualized/ProseMirror/Lexical near `16ms`.
- Focused unit proof:
  `cd .tmp/slate-v2/packages/slate-react && bun test:vitest -- test/keyboard-input-strategy-contract.test.ts`
  passed 36 tests.
- Strict proof after patch:
  `cd .tmp/slate-v2 && CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_COUNT=50 CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_MODE=held CROSS_EDITOR_HUGE_STRICT_REPEATED_SHIFT_DOWN=1 bun run bench:react:huge-document:cross-editor:local`
  passed with `slateAuto startBlock` repeated ShiftDown p95 `15.4ms`.
- Staged parity proof after patch:
  `cd .tmp/slate-v2 && SLATE_STAGED_COMMANDS_REPEATED_SHIFT_DOWN_COUNT=50 SLATE_STAGED_COMMANDS_SURFACES=stagedDefault SLATE_STAGED_COMMANDS_ASSERT_FULL_DOM_PARITY=1 bun run bench:react:huge-document:staged-keyboard-commands:local`
  passed with repeated ShiftDown p95 `21.7ms` and undo-delete p95 `68.2ms`.
- Visual/native proof after patch:
  `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "repeated Shift\\+ArrowDown"`
  passed 3 tests, including screenshots/no-double-highlight and staged/full-DOM
  parity rows.
- Type proof after patch:
  `cd .tmp/slate-v2 && bun --filter slate-react typecheck` passed.
- Research artifact written at
  `docs/slate-v2/research/2026-06-12-testing-oracles/**`.
  Code-level evidence came from local Slate v2, ProseMirror, and Tiptap source
  slices.
- slate-browser contract proof:
  `cd .tmp/slate-v2/packages/slate-browser && bun test test/core/scenario.test.ts`
  passed 21 tests.
- slate-browser type proof:
  `cd .tmp/slate-v2 && bun --filter slate-browser typecheck` passed.
- slate-browser full core proof after both contract rows:
  `cd .tmp/slate-v2 && bun --filter slate-browser test:core` passed 60 tests.
- Richtext formatted-boundary IME browser proof:
  `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "IME composition|active mark|multiple formatted"`
  passed 8 tests.
- Richtext WebKit compositionend cleanup proof:
  `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/richtext.test.ts --project=webkit --grep "WebKit compositionend"`
  passed 2 tests.
- Geometry/coords coverage proof:
  `cd .tmp/slate-v2 && bun --filter slate-browser test:selection` passed 9
  tests.
- DOM bridge geometry proof:
  `cd .tmp/slate-v2 && bun test ./packages/slate-dom/test/bridge.ts` passed 26
  tests.
- Native beforeinput target-range contract guard:
  `cd .tmp/slate-v2/packages/slate-browser && bun test test/core/scenario.test.ts`
  passed 21 tests.
- slate-browser full core proof after the target-range contract row:
  `cd .tmp/slate-v2 && bun --filter slate-browser test:core` passed 60 tests.
- slate-browser type proof after the target-range contract row:
  `cd .tmp/slate-v2 && bun --filter slate-browser typecheck` passed.
- slate-react native repair contract proof:
  `cd .tmp/slate-v2/packages/slate-react && bun test:vitest -- test/selection-reconciler-contract.test.tsx test/model-input-strategy-contract.test.ts test/input-router-contract.test.tsx`
  passed 77 tests.
- Plaintext browser replacement proof:
  `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "beforeinput target ranges|partial selected text replacement|manual typed replacement"`
  passed 3 tests after the managed build/server path.
- External clipboard slice/context contract guard:
  `cd .tmp/slate-v2/packages/slate-browser && bun test test/core/scenario.test.ts`
  passed 21 tests.
- slate-browser full core/type proof after the clipboard contract row:
  `cd .tmp/slate-v2 && bun --filter slate-browser test:core` passed 60 tests;
  `cd .tmp/slate-v2 && bun --filter slate-browser typecheck` passed.
- slate-dom clipboard boundary proof:
  `cd .tmp/slate-v2/packages/slate-dom && bun test test/clipboard-boundary.test.ts`
  passed 34 tests.
- slate-react projected clipboard proof:
  `cd .tmp/slate-v2/packages/slate-react && bun test:vitest -- test/projected-clipboard-contract.test.ts`
  passed 6 tests.
- Paste-html external slice/context browser proof:
  `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/paste-html.test.ts --project=chromium --grep "ProseMirror.*slice|comment-bounded fragment|Google Docs table HTML|Quip table HTML|Word table links|Google Sheets table HTML|table header cells"`
  passed 8 tests.
- Huge-document virtualized scroll stability contract proof:
  `cd .tmp/slate-v2/packages/slate-browser && bun test test/core/scenario.test.ts`
  passed 21 tests;
  `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "virtualized backward scroll stable|virtualized rows visually coherent|virtualized rows buffered"`
  passed 3 tests;
  `cd .tmp/slate-v2 && bun --filter slate-browser typecheck` passed.
- Benchmark script metric contract proof:
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 14 tests.
- Focused huge-document browser-trace metric smoke:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=2 SLATE_BROWSER_TRACE_SKIP_BUILD=1 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed and emitted virtualized materialization frames p95 `0` and scroll
  delta p95 `0px`.
- Huge-document full-wrapper metric smoke:
  `cd .tmp/slate-v2 && HUGE_DOC_FULL_SMOKE=1 HUGE_DOC_FULL_SKIP_BROWSER_BUILD=1 bun ./scripts/benchmarks/browser/react/huge-document-full.mjs`
  passed and emitted `react_huge_doc_full_virtualized_type_to_paint_p95_ms=27.9`,
  `react_huge_doc_full_virtualized_select_to_paint_p95_ms=47.8`,
  `react_huge_doc_full_virtualized_select_materialization_frames_p95=0`, and
  `react_huge_doc_full_virtualized_select_materialization_scroll_delta_p95_px=0`.
- Exact DOM coordinate versus virtualized boundary proof:
  `cd .tmp/slate-v2 && bun test ./packages/slate-dom/test/dom-coverage.ts`
  passed 18 tests;
  `cd .tmp/slate-v2 && bun --filter ./packages/slate-dom typecheck` passed.
- Selected endpoint retention proof:
  `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/dom-strategy-page-virtualization.test.tsx`
  passed 7 tests after correcting the over-broad first expectation;
  `cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck` passed.
- 100k virtualized benchmark smoke:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=100000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=20000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=20000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed with DOM p95 `316`, type-to-paint p95 `31.5ms`, click-to-paint p95
  `106.6ms`, heap `179.29MB`, materialization frames p95 `0`, and scroll delta
  p95 `0px`.
- 200k current virtualized benchmark smoke:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed after fresh build with DOM p95 `316`, type-to-paint p95 `31.2ms`,
  click-to-paint p95 `315.1ms`, heap `326.16MB`, materialization frames p95
  `0`, and scroll delta p95 `0px`.
- 200k click attribution benchmark before runtime fix:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed and showed `clickMouseDownEventMs` p95 `276.6ms`, selection wait p95
  `0.9ms`, paint wait p95 `15.3ms`, and event-missing p95 `0`.
- 200k root mousedown attribution benchmark before runtime fix:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed after fresh build and showed `root-mousedown.capture` p95 `271ms`,
  `root-mousedown.resolve-projected-drag-endpoint` p95 `270ms`, and
  apply-selection p95 `0.9ms`.
- 200k click fix package proof:
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 14 tests;
  `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/content-root-navigation-contract.test.ts`
  passed 21 tests;
  `cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck` passed.
- 200k click fix benchmark proof:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed after fresh build with click-to-paint p95 `39.8ms`,
  click-to-selection-ready p95 `28ms`, click mousedown p95 `14.2ms`,
  root mousedown capture p95 `0.8ms`, root projected endpoint p95 `0ms`, DOM
  p95 `316`, type-to-paint p95 `31.6ms`, materialization frames p95 `0`, and
  scroll delta p95 `0px`.
- 200k select-all/delete diagnostic proof before core fix:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE_ALLOW_FAILURE=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed as a diagnostic with `undoDeleteRestored=0`,
  `undoDeleteToPaintMs=45551.8`, and phase diagnostics proving the
  `replace_children` undo batch still existed after undoing typed text.
- 200k select-all/delete direct-handle diagnostic:
  the allow-failure direct `__slateBrowserHandle.undo()` retry exposed
  `RangeError: Maximum call stack size exceeded`, routing the bug to core
  `replace_children` replay rather than keyboard history routing.
- 200k select-all/delete core/browser proof after fix:
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/operations-contract.ts`
  passed 28 tests, including the 200k `replace_children` apply/invert
  contract;
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 14 tests;
  `cd .tmp/slate-v2 && bun --filter ./packages/slate typecheck` passed;
  `cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck` passed;
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed after fresh build with select-all-to-paint `220.2ms`,
  delete-to-paint `655.7ms`, type-after-delete-to-paint `2343.9ms`,
  undo-type-to-paint `138.9ms`, undo-delete-to-paint `2339.9ms`,
  `undoDeleteRestored=1`, DOM p95 `316`, and click-to-paint p95 `39.9ms`.
- Core full-document `fragment.delete` API parity proof:
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/delete-contract.ts`
  passed 30 tests;
  `cd .tmp/slate-v2 && bun test ./packages/slate-history/test/history-contract.ts`
  passed 48 tests;
  `cd .tmp/slate-v2 && bun --filter slate typecheck` passed;
  `cd .tmp/slate-v2 && bun --filter slate-history typecheck` passed;
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 16 tests.
- Core full-document `fragment.delete` API benchmark proof:
  before patch, the subscribed 5k current-only
  `selectAllDeleteTypeUndoMs` was `6197.01ms`, and 20k current-only did not
  finish within the useful window. After patch,
  `cd .tmp/slate-v2 && CORE_HUGE_BENCH_CURRENT_ONLY=1 CORE_HUGE_BENCH_BLOCKS=5000 CORE_HUGE_BENCH_ITERATIONS=1 CORE_HUGE_BENCH_TYPE_OPS=1 CORE_HUGE_BENCH_PROFILE=1 bun ./scripts/benchmarks/core/compare/huge-document.mjs`
  finished with `selectAllDeleteTypeUndoMs=28.11ms`, and the same command at
  `CORE_HUGE_BENCH_BLOCKS=20000` finished with `105.02ms`.
- Browser parity proof after core full-document delete patch:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized,stagedActiveDOMGroup SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed after fresh build. Staged and virtualized both recorded delete history
  as one `replace_children`, `undoDeleteRestored=1`, collapsed delete selection
  at `[0,0]`, and bounded DOM after delete (`208`/`221` nodes). Browser
  undo-delete remains the architecture gap: staged `1802.8ms`, virtualized
  `1501.9ms`.
- Full-root cached snapshot+live-index proof:
  `cd .tmp/slate-v2 && bun test ./packages/slate-history/test/history-contract.ts`
  passed 48 tests;
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/snapshot-contract.ts`
  passed 220 tests;
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/operations-contract.ts`
  passed 28 tests;
  `cd .tmp/slate-v2 && bun --filter ./packages/slate typecheck` passed;
  `cd .tmp/slate-v2 && bun --filter ./packages/slate-history typecheck`
  passed;
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 16 tests.
- Full-root cached snapshot+live-index browser proof:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed after fresh build with undo-delete `1425.3ms`, restored `1`, and no
  `snapshot-build-index`/`dom-path-sync` in the undo-delete profiler;
  rerun with `SLATE_BROWSER_TRACE_SKIP_BUILD=1` passed with undo-delete
  `1411.0ms`.
- Full-root cached snapshot+live-index cross-strategy proof:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=stagedActiveDOMGroup,virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed with staged/virtualized `undoDeleteRestored=1`, staged undo-delete
  `1602.5ms`, virtualized undo-delete `1401.5ms`, and bounded DOM p95
  `395` / `316`.
- Full-root live-index preservation proof:
  `cd .tmp/slate-v2 && bun test ./packages/slate-history/test/history-contract.ts`
  passed 48 tests;
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/snapshot-contract.ts`
  passed 220 tests;
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/operations-contract.ts`
  passed 28 tests;
  `cd .tmp/slate-v2 && bun --filter ./packages/slate typecheck` passed;
  `cd .tmp/slate-v2 && bun --filter ./packages/slate-history typecheck`
  passed;
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 16 tests.
- Full-root live-index preservation browser proof:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed after fresh build with virtualized undo-delete `736.3ms`, restored
  `1`, and no `snapshot-reuse-live-runtime-index` bucket.
- Full-root live-index preservation cross-strategy proof:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=stagedActiveDOMGroup,virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed with staged/virtualized `undoDeleteRestored=1`, staged undo-delete
  `931.8ms`, virtualized undo-delete `748.4ms`, and bounded DOM p95
  `395` / `316`.
- Cached full-root restore dirty-path fast-path proof:
  `cd .tmp/slate-v2 && bun --filter ./packages/slate typecheck` passed;
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/operations-contract.ts`
  passed 28 tests after one known 5s timeout-edge rerun;
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/snapshot-contract.ts`
  passed 220 tests;
  `cd .tmp/slate-v2 && bun test ./packages/slate-history/test/history-contract.ts`
  passed 48 tests;
  `cd .tmp/slate-v2 && bun --filter ./packages/slate-history typecheck`
  passed;
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 16 tests.
- Cached full-root restore dirty-path browser proof:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed after fresh build with virtualized undo-delete `442.3ms`, restored
  `1`, and `apply-replace_children` `0.1ms`.
- Cached full-root restore dirty-path cross-strategy proof:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=stagedActiveDOMGroup,virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed with staged/virtualized `undoDeleteRestored=1`, staged undo-delete
  `633.6ms`, virtualized undo-delete `416.7ms`, and bounded DOM p95
  `395` / `316`.
- Full-root replace snapshot-children cache proof:
  `cd .tmp/slate-v2 && bun --filter ./packages/slate typecheck` passed;
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/operations-contract.ts`
  passed 28 tests;
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/snapshot-contract.ts`
  passed 220 tests;
  `cd .tmp/slate-v2 && bun test ./packages/slate-history/test/history-contract.ts`
  passed 48 tests;
  `cd .tmp/slate-v2 && bun --filter ./packages/slate-history typecheck`
  passed;
  `cd .tmp/slate-v2 && bun test ./packages/slate/test/core-benchmark-scripts-contract.ts`
  passed 16 tests.
- Full-root replace snapshot-children cache browser proof:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed after fresh build with virtualized undo-delete `268.9ms`, restored
  `1`, and remaining hot buckets in request repair / notify / selector dispatch.
- Full-root replace snapshot-children cache cross-strategy proof:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=stagedActiveDOMGroup,virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed with staged/virtualized `undoDeleteRestored=1`, staged undo-delete
  `460.7ms`, virtualized undo-delete `254.7ms`, and bounded DOM p95
  `395` / `316`.
- Expanded view-selection history repair skip proof:
  `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/keyboard-input-strategy-contract.test.ts`
  passed 37 tests;
  `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/projected-command-contract.test.ts`
  passed 39 tests;
  `cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`
  passed.
- Expanded view-selection history repair skip browser proof:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=stagedActiveDOMGroup,virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed with staged/virtualized `undoDeleteRestored=1`, staged undo-delete
  `460.1ms`, virtualized undo-delete `280.5ms`, notify-listeners p95
  `1.5ms`, selector-dispatch p95 `1.3ms`, and bounded DOM p95 `395` / `316`.
- Expanded view-selection history repair skip virtualized rerun:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed with undo-delete `244ms`, notify-listeners p95 `1.5ms`,
  selector-dispatch p95 `1.1ms`, type-after-delete `2224.7ms`, and
  `undoDeleteRestored=1`.
- Cross-strategy huge-document command smoke:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=defaultAuto,stagedActiveDOMGroup,virtualized SLATE_BROWSER_TRACE_BLOCKS=20000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=20000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=20000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed with auto/staged/virtualized `undoDeleteRestored=1`,
  undo-delete-to-paint `139.4ms` / `123.2ms` / `122.4ms`, click-to-paint p95
  `31.3ms` / `23.2ms` / `22.5ms`, and DOM p95 `2822` / `395` / `310`.
- Focused huge-document behavior smoke:
  `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep 'keeps auto partial-dom collapsed typing|keeps virtualized browser select-all delete|replaces a huge select-all range|keeps virtualized 5k typing|keeps virtualized middle-block materialization|keeps virtualized insert-break bursts|keeps virtualized backward scroll stable|keeps virtualized rows visually coherent|keeps virtualized rows buffered'`
  passed 9 tests after `slate-browser build` and managed Next build/server.
- Final post-delete selection-flush sanity proof:
  `cd .tmp/slate-v2 && bun --filter ./packages/slate-react typecheck` passed;
  `cd .tmp/slate-v2/packages/slate-react && bun test:vitest test/runtime-before-input-events-contract.test.ts`
  passed 7 tests;
  `cd .tmp/slate-v2/packages/slate-react && bun test ./test/selection-runtime-contract.test.ts`
  passed 17 tests.
- Final managed huge-document browser proof:
  `cd .tmp/slate-v2 && bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep 'keeps staged middle-block editing|keeps staged and virtualized Shift\+ArrowUp and Shift\+ArrowDown|keeps staged repeated Shift\+ArrowDown aligned|keeps staged 10k select-all delete|keeps auto partial-dom collapsed typing|keeps virtualized browser select-all delete|replaces a huge select-all range|keeps virtualized 5k typing|keeps virtualized repeated Shift\+ArrowDown and Shift\+ArrowUp|keeps virtualized insert-break bursts|keeps virtualized backward scroll stable|keeps virtualized rows visually coherent|keeps virtualized rows buffered'`
  rebuilt `slate-browser`/Next and passed 13 Chromium tests.
- Final fresh-build 200k staged/virtualized trace:
  `cd .tmp/slate-v2 && SLATE_BROWSER_TRACE_SURFACES=stagedActiveDOMGroup,virtualized SLATE_BROWSER_TRACE_BLOCKS=200000 SLATE_BROWSER_TRACE_ITERATIONS=1 SLATE_BROWSER_TRACE_TYPE_OPS=1 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_NATIVE_TIMEOUT_MS=30000 SLATE_BROWSER_TRACE_MATERIALIZATION_TIMEOUT_MS=30000 bun ./scripts/benchmarks/browser/react/huge-document-browser-trace.mjs`
  passed after Next build. Staged/virtualized Delete stayed fast
  `26.6ms` / `21.1ms`, DOM p95 stayed bounded `395` / `316`, restored both
  lanes, virtualized undo-type was `17.9ms`, staged undo-type was `314ms`,
  staged typed burst was `2357.3ms`, and virtualized typed burst was `337.8ms`.

Final handoff contract:
- Goal plan:
  `docs/plans/2026-06-12-slate-v2-8h-research-first-automation.md`.
- Surface and route/package:
  `.tmp/slate-v2` Slate v2 private-alpha runtime, mainly
  `packages/slate`, `packages/slate-react`, `packages/slate-browser`,
  `packages/slate-dom`, and
  `http://localhost:3100/examples/huge-document?strategy=staged|virtualized`.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count:
  timed mode, minimum 8h; loop count 46 at closeout; do not close the goal until
  the goal tool reports at least 8h active runtime.
- Behavior gates and visual proof:
  focused huge-document Playwright rows, `slate-browser` scenario/selection
  contracts, DOM coordinate tests, richtext/plaintext/paste browser rows, and
  no-double-highlight/repeated Shift+Arrow proof are recorded above.
- Primary metric baseline/latest/best and stop reason:
  200k select-all/delete, follow-up typing, undo, click, DOM budget, and
  repeated Shift+Down lanes are recorded above; stop only after the timed floor
  and current packet closure. Remaining live perf owner is post-delete typed
  burst plus staged undo-type: latest fresh-build trace has staged burst
  `2357.3ms`, virtualized burst `337.8ms`, staged undo-type `314ms`,
  virtualized undo-type `17.9ms`, and Delete `26.6ms` / `21.1ms`.
- Bugs fixed and oracles added:
  repeated vertical selection, virtualized scroll stability, beforeinput target
  ranges, external clipboard slice/context, huge-doc metric honesty, DOM
  coordinate boundary, endpoint retention, 200k cache/click/delete/undo lanes,
  and post-delete selection-flush policies.
- Benchmark/skill/docs repairs:
  huge-document browser trace/full metrics, benchmark core contracts, research
  artifacts, promoted research ledger, and `slate-auto` plan rows updated.
- Workflow slowdowns and repairs:
  stale build/skip-build, broad output, command-shape misses, stale plan
  placeholders, and browser-proof cost are recorded in the slowdown/error rows.
- Changed list:
  runtime/code, tests/oracles, benchmark scripts/metrics, examples/docs/research,
  and workflow-plan changes are listed in the plan changed-list rows and final
  handoff.
- Needs your attention:
  post-delete typed-burst cadence, staged active-DOM undo-type after delete,
  table-fragment rectangle algebra, IME overlap cancellation taste, raw mobile
  deferral, and final visual feel on huge-document staged/virtualized.
- Stopping checkpoints to unblock:
  `huge-doc-post-delete-burst-and-staged-undo-attribution`,
  `table-fragment-contract-review`, and `ime-overlap-cancellation-taste`.
- Accepted deferrals and residual risks:
  raw mobile/device claims, table-fragment plan execution, IME overlap policy,
  post-delete typed-burst cadence, and staged active-DOM undo-type latency.
- Next owner:
  continue `slate-auto` or route the post-delete burst/staged undo packet to
  `slate-ar-perf` / `slate-plan` if the next fix requires a DOM-current or
  browser-event cadence architecture decision.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closeout: 8h timed run plan is closed mechanically; waiting only for the goal tool's minimum runtime floor before completion. |
| Where am I going? | Final handoff after the timed floor, with post-delete typed-burst cadence and staged active-DOM undo-type left as the next perf owner. |
| What is the goal? | Minimum 8h Slate v2 private-alpha automation with research-first discovery and promoted proof packets. |
| What have I learned? | See Findings |
| What have I done? | Created research artifacts, kept huge-doc behavior/perf packets, promoted reusable `slate-browser` oracles, repaired 200k select-all/delete/undo/click lanes, added post-delete selection-flush contracts, updated research/promoted ledgers, and recorded remaining post-delete burst/staged undo risk. |
| What changed in the checkpoint plan? | Closed all handoff placeholders, recorded final sanity proof, set residual risks, and left the timed run open only until the goal tool reports the 8h floor. |

Timeline:
- 2026-06-12T10:14:39.575Z Goal plan created.
- 2026-06-12 12:14:33 CEST Recorded timed-mode target: no handoff before
  2026-06-12 20:14:33 CEST unless a true hard blocker exists.
- 2026-06-12 12:xx CEST Created table-fragment semantics research artifact and
  promoted the lead to `slate-plan` / Slate core fixtures.
- 2026-06-12 12:xx CEST Created huge-doc native-selection research artifact and
  promoted projection metric honesty to `slate-ar-perf`.
- 2026-06-12 12:xx CEST Cross-editor strict benchmark reproduced a real
  `slateAuto` start-block repeated ShiftDown failure at step 33.
- 2026-06-12 12:xx CEST Kept runtime patch that avoids expensive model-line
  fallback for plain single-text adjacent block movement; strict benchmark,
  staged benchmark, focused Playwright, Vitest, and typecheck passed.
- 2026-06-12 12:xx CEST Created testing-oracle research artifact and kept a
  `slate-browser` first-party contract row for huge-document projected vertical
  selection; focused `slate-browser` scenario test and typecheck passed.
- 2026-06-12 13:xx CEST Kept `ime-composition-formatted-boundaries` contract
  row; slate-browser core/typecheck and Chromium/WebKit richtext proof passed.
- 2026-06-12 13:xx CEST Geometry audit found existing coverage; slate-browser
  selection browser tests and slate-dom bridge tests passed.
- 2026-06-12 12:56 CEST DOM-change/native replacement audit promoted
  `native-beforeinput-target-range-repair`; slate-browser core/typecheck,
  slate-react repair contracts, and focused plaintext Playwright rows passed.
- 2026-06-12 13:01 CEST Clipboard/open-slice audit promoted
  `external-clipboard-slice-context`; slate-browser core/typecheck, slate-dom
  clipboard boundary, slate-react projected clipboard, and paste-html Playwright
  rows passed.
- 2026-06-12 13:xx CEST IME overlap policy research narrowed the missing taste
  to ProseMirror-style overlap cancellation and kept it as a `slate-plan`
  checkpoint before runtime work.
- 2026-06-12 13:xx CEST Huge-document architecture research promoted
  `huge-document-virtualized-scroll-stability`; slate-browser scenario guard,
  focused Chromium scroll proof, and typecheck passed.
- 2026-06-12 14:xx CEST Huge-document metric-honesty packet added
  materialization frame and scroll-delta metrics to browser trace and full
  wrapper benchmark output; contract test and smoke benchmarks passed.
- 2026-06-12 14:xx CEST Huge-document estimated-coordinate contract added
  exact DOM API versus virtualized boundary coverage in `slate-dom`; package
  test and typecheck passed.
- 2026-06-12 14:xx CEST Huge-document selected-endpoint retention contract
  added expanded-selection endpoint coverage in `slate-react`; first test
  expectation was corrected from page-unit retention to endpoint-row retention,
  then Vitest and typecheck passed.
- 2026-06-12 14:xx CEST Huge-document 100k/200k virtualized smokes passed;
  large generated-value cache cap reduced 200k heap, then click attribution
  traced and fixed the 200k mousedown owner-scan tax.
- 2026-06-12 20:xx CEST Final sanity proof passed:
  slate-react typecheck, beforeinput contract 7 tests, and selection-runtime
  contract 17 tests.
- 2026-06-12 20:xx CEST Final managed huge-document Playwright proof rebuilt
  `slate-browser`/Next and passed 13 Chromium behavior/visual rows.
- 2026-06-12 20:xx CEST Final fresh-build 200k staged/virtualized trace passed
  and narrowed the remaining hot owner to post-delete typed-burst cadence plus
  staged DOM-current undo-type.

Open risks:
- Post-delete typed-burst cadence remains slow in the latest fresh-build 200k
  trace: staged `2357.3ms`, virtualized `337.8ms`. Delete itself is fast
  (`26.6ms` / `21.1ms`), virtualized undo-type is fixed (`17.9ms`), and staged
  undo-type remains slow (`314ms`). This is split to
  `huge-doc-post-delete-burst-and-staged-undo-attribution`.
- Raw mobile/device claims remain deferred until a real device lane exists.
- Table-fragment rectangle-algebra execution and IME overlap cancellation still
  need user/`slate-plan` policy review before runtime work.
