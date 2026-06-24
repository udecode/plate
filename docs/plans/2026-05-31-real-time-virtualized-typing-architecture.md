# real-time virtualized typing architecture

Objective:
Define the Plite architecture plan for real-time virtualized typing: replace
the current fixed-delay native text repair patch with a DOM-first native input
transaction scheduler, deterministic flush boundaries, and incremental
pagination/layout invalidation. Keep implementation details intentionally loose
enough for execution mode to auto-iterate, but make the target measurable enough
that implementation cannot stop until the browser proof is actually fast.

Goal plan:
docs/plans/2026-05-31-real-time-virtualized-typing-architecture.md

Template:
docs/plans/templates/slate-plan.md

Primary template:
docs/plans/templates/slate-plan.md

Applied packs:
- none

Completion threshold:
- The plan is ready for user review only when it defines the accepted
  architecture, measurable execution goal, rejection criteria for dirty debounce
  solutions, proof gates, risks, and next execution owner.
- Execution target named by this plan: on
  `/examples/pagination?page_layout=single&strategy=virtualized`, default
  ~1000-page document, fast printable typing must prove:
  - p95 visible keystroke latency `<=120ms`;
  - 36-character burst model-settle `<=600ms`;
  - no dropped/reordered characters;
  - final model selection equals the visible DOM caret;
  - DOM remains `<=1400` elements and `<=10` page surfaces;
  - no fixed arbitrary debounce is the core correctness mechanism.
- Plite Plan closure is legal only when score >= 0.92, no dimension is below
  0.85, every pass row is complete or intentionally skipped with evidence,
  issue/reference sync rows are closed, final handoff is emitted, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-real-time-virtualized-typing-architecture.md` passes.

Verification surface:
- Plan artifact: this file plus final `check-complete` from `plate-2`.
- Live source grounding: current `Plate repo root` `plite-react` input runtime,
  DOM repair, native input policy, `plite-layout`, and pagination example.
- Execution proof to require later from `Plate repo root`: focused unit tests for
  transaction scheduling/flush boundaries, focused Playwright for virtualized
  pagination typing, typecheck, scoped lint, and dirty-local autoreview if
  implementation is non-trivial.
- Planning-only checks run in `plate-2`; any Plite source/runtime/browser/API
  claim must cite and verify the live `Plate repo root` workspace command.

Constraints:
- Planning mode only in this activation: no Plite implementation patch.
- Core Plite stays unopinionated; pagination is proof surface, not the owner of
  text-input semantics.
- The final execution plan may name mechanisms and invariants, but must not
  over-prescribe implementation classes/functions before measurement.
- The plan must make it impossible to declare victory by changing one timeout.
- Plite Plan may edit planning, research, issue-ledger, and PR-reference
  artifacts only. Plite implementation belongs to accepted-plan execution
  after user review.

Boundaries:
- Allowed planning edits: this plan and later triggered research/ledger files.
- Current source read scope:
  `packages/plite-react/src/editable/input-router.ts`,
  `packages/plite-react/src/editable/runtime-before-input-events.ts`,
  `packages/plite-react/src/editable/runtime-input-events.ts`,
  `packages/plite-react/src/editable/native-input-strategy.ts`,
  `packages/plite-react/src/editable/dom-repair-queue.ts`,
  `packages/plite-layout/src/index.ts`,
  `packages/plite-layout/src/react.tsx`, and
  `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx`.
- Non-goal for this planning pass: implementation, commit, PR, or broad
  issue-ledger rewrite.
- Allowed edit scope: `docs/plans/**`, `docs/research/**`,
  `docs/plite-issues/**`, `docs/plite/ledgers/**`,
  `docs/plite/references/**`.

Blocked condition:
- Blocked only if the next pass requires live source/issue/research artifacts
  that are missing and cannot be regenerated/read locally, or if the user changes
  the target from planning to immediate implementation without accepting the
  plan first.
- Do not use blocked while any research, review, ledger, source-grounding,
  score-hardening, or plan-hardening move remains runnable.

Plite Plan lane state:
- slate_plan_lane_status: complete
- current_pass: verification-plan-and-objection-ledger
- current_pass_status: complete
- next_pass: none
- next_action: accepted-plan execution can start in `Plate repo root` after user
  review; implementation may vary internals but must keep the invariants and
  keep iterating until the measurable proof gates pass
- final_handoff_status: complete

Current verdict:
- verdict: revise the current runtime shape; keep DOM-first typing, cut fixed
  debounce as the architectural answer
- confidence: 0.93 after issue, ledger, intent/decision, research,
  live-source, pressure, verification, and objection passes; remaining
  uncertainty belongs to execution measurement, not architecture direction
- keep / cut / revise call: revise
- reason: live source proves the current fix still relies on
  `DEFERRED_NATIVE_TEXT_INPUT_REPAIR_DELAY_MS = 80` in `input-router.ts`, while
  layout and pagination still rebuild broad projection maps from snapshots.
  External runtime evidence points to deterministic update/flush boundaries and
  dirty-region reconciliation, not timeout-owned correctness. The ownership
  boundary is right, but the scheduler is not yet a principled runtime contract.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every Plite Plan
  completion gate below is satisfied and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-real-time-virtualized-typing-architecture.md` passes.
- Do not create hook state for this goal. This
  file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `plite-plan` explicitly invoked; standard mode selected because user asked for durable plan and measurable auto-iteration goal. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this Plite Plan planning goal. |
| Source of truth read before edits | yes | Latest user request plus live `Plate repo root` source listed in Boundaries. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A for current-state planning pass; no implementation patch in this activation. |
| Live `Plate repo root` grounding needed for current-state claims | yes | Read current input router, beforeinput runtime, native input strategy, DOM repair, layout refresh, paged rendering, and pagination example source. |

Work Checklist:
- [x] Objective includes lane outcome, full pass schedule, one-pass-per-
      activation policy, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] One-pass-per-activation policy respected: this activation completed only
      current-state read and initial score.
- [x] Live source grounding recorded for every current implementation claim, or
      marked N/A with reason.
- [x] Issue ledger / ClawSweeper discovery pass applied or skipped with
      concrete evidence: existing durable ledgers already identify the related
      input/runtime, selection, virtualization, and rerender rows; sync pass
      closed as no-op because this plan makes no fixed issue claim yet.
- [x] Research and ecosystem synthesis complete for every external system used
      as evidence, or marked N/A with reason.
- [x] Intent/boundary record and decision brief complete for planning state:
      core runtime owns native typing and deterministic flush, layout consumes
      committed snapshots plus invalidation, and timeout/user-option/pagination-
      local fixes are rejected.
- [x] Scorecard recorded with evidence; total score >= 0.92 and no dimension
      below 0.85 before closure.
- [x] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [x] Plite maintainer objection ledger complete for every breaking/paradigm
      change, or marked N/A with reason.
- [x] Verification workspace gate recorded for every Plite source, runtime,
      browser, package, public API, or issue-fix claim.
- [x] TDD used for behavior/proof changes with a sane test surface, or marked
      N/A with reason: planning-only activation; execution TDD queue is named
      below before any Plite source patch.
- [x] Browser proof captured for browser-surface claims, or marked N/A with
      reason: planning-only activation; no new browser behavior claim is made,
      and required Playwright proof gates are named below.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Define exact unit, browser, benchmark, and closeout proof gates, with numeric stop conditions | Verification matrix below names `Plate repo root` commands and budgets: p95 visible typing `<=120ms`, 36-char settle `<=600ms`, DOM `<=1400`, page surfaces `<=10`, no fixed debounce correctness. |
| Plite source, runtime, browser, package, public API, or issue-fix claim | yes | Record live `Plate repo root` command/proof or mark as planning-only with reason | Planning-only: no source patch or issue-fix claim. Live source/test surfaces were read and execution commands are listed for later proof. |
| Issue ledger or PR reference changed | yes | Sync the relevant ledger/reference row or record why no sync applies | No sync applies: this plan keeps related issue rows as non-claim/proof-route guardrails and does not add PR close text. |
| Autoreview for uncommitted implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; run the helper from the git checkout that owns the implementation diff (`Plate repo root` for Plite patches) until no accepted/actionable findings, or record N/A for planning-only/no local patch | N/A planning-only: no `Plate repo root` implementation diff is introduced by this plan pass. Execution phase must run autoreview from `Plate repo root` if it patches source. |
| Final user-review handoff | yes | Emit final handoff or keep the plan pending with the next pass | Final handoff section is filled below with accepted items, cuts, non-claims, proof gates, and execution owner. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-real-time-virtualized-typing-architecture.md` | Passed in `/Users/zbeyens/git/plate-2`; no Plite behavior proof is claimed by this command. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | live source read; initial score 0.72; current verdict recorded | related issue discovery |
| Related issue discovery | complete | read requirements, clusters, pilot dossier, benchmark map, issue coverage matrix, v2 sync ledger, and open issue ledger rows for input/runtime, selection, virtualization, rerender, and transaction-boundary pressure | issue-ledger pass |
| Issue-ledger pass | complete | existing sync ledger, coverage matrix, open issue ledger, and PR reference already keep the relevant rows as related/proof-route/non-claimed; no ledger/reference edit is needed until this plan promotes or changes an issue claim | intent/boundary pass |
| Intent/boundary and decision brief | complete | decision fixed: internal DOM-first native text transaction scheduler, deterministic flush boundaries, and layout invalidation; adoption story and hard cuts recorded | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | ProseMirror transaction/DOMObserver model, react-prosemirror React flush bridge, Lexical update/read/dirties/reconciler model, Pretext deterministic offscreen layout constraints, Tiptap Pages limitations/table workaround, and live `Plate repo root` source refreshed | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | pressure pass chose runtime-owned pending native text transactions, flush-before-boundary as default, dirty top-level layout invalidation with prefix reuse/suffix recomposition, and no new public API | verification plan and objection ledger |
| High-risk deliberate mode | complete | high-risk pre-mortem plus pressure pass covers stale reads, remounts, layout breadth, collaboration/history, and IME/mobile overclaim | verification plan and objection ledger |
| Ecosystem maintainer pass | skipped | no public external ecosystem API claim; external systems are evidence only, not compatibility targets | final closeout |
| Revision pass | complete | pressure pass revised open questions, implementation phases, and proof strategy without touching implementation | issue sync accounting |
| Plite maintainer objection ledger | complete | objection ledger below closes stale reads, scheduler privacy, layout invalidation, history/collab, table/media, browser matrix, and public DX objections with proof gates | closure score and final gates |
| Issue sync accounting | complete | no issue/reference rows need sync because all issue rows remain related/non-claim/proof-route guardrails | closure score and final gates |
| Closure score and final gates | complete | scorecard >= 0.92, no dimension below 0.85, final handoff filled, planning-only verification recorded | accepted-plan execution |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.92 | The plan rejects hook-local timer repair and React state loops, names runtime-owned pending native text transactions, and forces Playwright/bench proof against visible latency, burst settle, DOM count, page-surface count, and profiler counters. |
| Plite-close unopinionated DX | 0.20 | 0.94 | No public debounce prop, no pagination-owned input queue, no Lexical-style public `$` API. Proof controls stay in examples/benchmarks; core call sites remain normal Plite hooks/events. |
| Plate and slate-yjs migration backbone | 0.15 | 0.91 | Flush-before-boundary is the default: history, undo, command, remote/collab visibility, and export paths see committed Plite operations with metadata. A merged pending read view is explicitly last resort. |
| Regression-proof testing strategy | 0.20 | 0.93 | Verification pass names exact unit, layout, browser, benchmark, and closeout gates. It also names failure budgets that keep execution iterating until the virtualized typing target is met. |
| Research evidence completeness | 0.15 | 0.92 | Comparator research plus live source/test inspection covers ProseMirror, react-prosemirror, Lexical, Pretext, Tiptap Pages, current input runtime, layout, page virtualization, integration tests, and benchmarks. |
| shadcn-style composability and minimalism | 0.10 | 0.94 | The plan keeps the public API small, rejects product-facing typing knobs, and lets implementation auto-iterate internally against measured contracts. |

Source-backed architecture north star:
- target shape: native DOM owns printable typing immediately; Plite records
  pending local text transactions and flushes them on deterministic boundaries
  or idle frames; layout consumes committed snapshots plus dirty block/page
  invalidation, not every keystroke as full-document work.
- source evidence: current fixed delay is `input-router.ts:42`; coalescing
  replaces the last repair by path in `input-router.ts:520-534`; virtualized
  React capture skips duplicate repair in `runtime-input-events.ts:159-166`;
  native policy is decided in `runtime-before-input-events.ts:228-243` and
  `native-input-strategy.ts:7-38`; DOM repair applies text/model selection in
  `dom-repair-queue.ts:183-335`; layout refresh still composes full block/page
  output in `plite-layout/src/index.ts:2468-2545`.
- rejected drift: do not make pagination own text batching; do not expose a
  user-facing debounce prop as the architecture; do not let commands observe
  stale model text.
- migration posture: pending transactions are internal runtime state. Plate,
  plugins, history, and slate-yjs should see deterministic commits, not raw DOM
  drafts, unless the plan later proves a read-only pending overlay API is needed.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| Native text transaction scheduler | Internal `plite-react` runtime; no public API until proven necessary | Raw Plite users keep typing normally; apps keep `onKeyDown`, `onInput`, `onDOMBeforeInput` hooks | Replace fixed timeout semantics with deterministic flush policy; no app migration if kept internal | `input-router.ts:42`, `input-router.ts:520-534` | revise |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| Native printable input | `plite-react` beforeinput/native input strategy | Keep DOM-first path when safe; record pending text transaction keyed by root/path/range | Model-owned per-char updates and full selector notify on hot path | `runtime-before-input-events.ts:228-243`, `native-input-strategy.ts:7-38` | keep/revise |
| DOM input repair | `plite-react` runtime, not hook-local timeout state | Runtime-owned pending native text transaction queue with explicit `flushPendingNativeText(reason)`-style boundary; idle catch-up is secondary | Dirty fixed debounce, hook-local repair replacement, and stale command reads | `input-router.ts:447-534`, `runtime-kernel-trace.ts:176-232`, `dom-repair-queue.ts:183-335` | revise hard |
| Pagination/layout | `plite-layout` and pagination example | Use `EditorCommit.dirtyTopLevelRanges` / `dirtyPaths` to recompute from earliest affected block with prefix reuse and suffix recomposition until page-break/height convergence | Full projection/decoration rebuild during typing | `EditorCommit` has `dirtyPaths`/`dirtyTopLevelRanges` in `interfaces/editor.ts:1735-1771`; layout currently extracts all blocks in `plite-layout/src/index.ts:1534-1580` and composes all blocks in `:2468-2545` | revise hard |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| Raw Plite public API | No new public prop for typing delay or pagination batching | Apps keep normal `onDOMBeforeInput`, `onInput`, command middleware, and editor updates | Hot path stays internal; no app-side memo/debounce ceremony | `runtime-before-input-events.ts:228-243`, `runtime-input-events.ts:159-177` | keep minimal |
| Pagination example | Proof controls may expose strategy/page count/debug metrics only | Example proves runtime behavior; it does not own text correctness | Control changes must not be required for correctness | `pagination.tsx:1708-1803` | proof-only |
| Layout React helpers | Keep component API stable while internals learn invalidation | Consumers receive snapshots/fragments; internals decide affected ranges | Do not widen subscriptions or rebuild projection maps on every text input | `plite-layout/src/react.tsx:454-490` | revise internals |

Plate migration-backbone target:
| Pressure | Plite substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| Plate plugins and commands | Deterministic committed transactions after native DOM draft flush | Plate keeps using command/input-rule/plugin layers above raw Plite commits | Plate should not need to own raw DOM drafts or set debounce options | `runtime-before-input-events.ts:228-243`, `dom-repair-queue.ts:330-345` | keep core-owned |
| Plate pagination/docs | Layout invalidation API and page snapshots remain reusable | Plate can consume page fragments/metrics after execution proves the substrate | Product-specific page UI, table policy, and export fidelity are outside raw Plite | `plite-layout/src/index.ts:2468-2545` | revise layout substrate |

slate-yjs migration-backbone target:
| Pressure | Plite substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| Local printable DOM drafts | Pending native text is local runtime state until a deterministic flush creates Plite operations | Yjs sees committed text transactions with metadata/history semantics, not timer artifacts | Current `@slate/yjs` adapter compatibility is not required for this raw-Plite plan | `dom-repair-queue.ts:330-345`, `#1770` issue accounting | keep local until flush |
| Remote updates during pending text | Flush before applying command/selection/history/collab boundaries or define an explicit merged read view | Later execution must prove remote/local ordering with unit contracts before claiming collaboration readiness | Do not expose raw DOM draft state as collaborative document content | issue ledger `#1770`; current source lacks this contract | research/pressure needed |

Intent / boundary record:
- intent: make virtualized pagination typing feel like a native editor by
  keeping printable DOM insertion on the hot path and moving Plite/model/layout
  catch-up behind deterministic runtime boundaries, not arbitrary time.
- outcome: a user-review-ready execution plan that lets implementation
  auto-iterate until measured browser proof passes: `<=120ms` p95 visible
  keystroke latency, `<=600ms` 36-character burst model-settle, no dropped text,
  correct model/DOM selection, `<=1400` DOM elements, `<=10` page surfaces, and
  no fixed timeout as correctness.
- core owner: `plite-react` input runtime owns native text transactions, flush
  boundaries, model selection catch-up, and command/read coherence.
- layout owner: `plite-layout` owns committed snapshot/page invalidation after
  flushed transactions; pagination is the proof surface, not the text-input
  owner.
- app owner: apps and Plate own product input rules, page UI, export policy,
  table policy, and opt-in stress controls; they should not configure a typing
  correctness debounce.
- in-scope: native input scheduling, DOM repair, flush-before-command,
  flush-before-selection-boundary, flush-before-blur, composition/paste/delete/
  undo/history/collab visibility rules, and incremental layout invalidation.
- non-goals: public debounce props, pagination-local text batching, replacing
  Pretext, changing Plite's document model, production-ready virtualization
  claims, mobile/IME issue closure, or implementation in this planning pass.
- adoption story: keep the scheduler internal first, preserve current public raw
  Plite call sites, prove the pagination example as a browser stress route, and
  expose only debug metrics or narrow internal hooks if measurement proves they
  are necessary.
- decision boundaries: the plan can choose internal runtime ownership, execution
  metrics, hard cuts, and proof gates without asking again; execution may vary
  implementation details while it preserves these invariants.
- unresolved user-decision points: none. The remaining uncertainty is evidence,
  not product direction.

Decision brief:
- principles: native DOM owns the keystroke; Plite owns deterministic commits;
  commands never read stale model state; layout follows committed snapshots;
  core stays unopinionated; tests prove budgets and invariants, not class names.
- top drivers: typing latency, correctness at command/selection boundaries,
  history/collab coherence, and pagination/layout scalability.
- viable options:
  1. fixed debounce around DOM repair;
  2. DOM-first pending native text transaction scheduler;
  3. fully synchronous model commits plus incremental layout only;
  4. pagination-local input batching.
- chosen option: option 2, with option 3's incremental layout work after commit
  as the second half. DOM-first removes React/model/layout from the printable
  input hot path; deterministic flush keeps Plite's model contract coherent.
- rejected alternatives:
  - option 1 is dirty because correctness depends on a guessed delay and still
    loses under fast typing, command reads, blur, selection movement, IME, or
    slow devices;
  - option 3 alone keeps editor/model notifications on the hot path and is not
    credible at 1000-page scale;
  - option 4 is the wrong owner and would fork text semantics between normal and
    paginated editors.
- hard invariants:
  - every command, selection boundary, blur, composition boundary, paste/delete,
    undo/history, and collaboration visibility point must either flush pending
    text or read a formally merged pending view;
  - pending text must be keyed by root/path/range and invalidated when DOM
    ownership, node identity, or selection ownership changes;
  - layout cannot observe arbitrary DOM draft state; it consumes committed
    snapshots plus dirty block/page invalidation;
  - a timeout may be used only as a best-effort idle catch-up, never as the
    correctness mechanism.
- consequences: more runtime state and more proof burden, but fewer app-facing
  knobs and a cleaner split: DOM for immediate text, Plite for committed state,
  layout for committed pagination.
- follow-ups: verification matrix, objection ledger, issue/reference accounting,
  final score hardening, then user-review closeout.

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| Mobile, IME, and input semantics cluster | Related / not fixed | The plan routes real-time typing through first-class input/runtime ownership; it does not close mobile or IME issues by planning alone. | Corpus marks this as the top-priority theme with 129 issues and requires DOM/model input suppression that does not desync. | Execution must add exact browser/device proof before any closure claim. | Existing cluster rows stay related. | No auto-close line. |
| DOM selection/focus bridge cluster | Related / not fixed | Deterministic flush boundaries should reduce stale selection, but a real selection bridge still has to exist. | Cluster says cursor-loss, wrong-path, and crash-class selection bugs are major runtime ownership pressure. | Focused browser selection proof plus model/DOM selection equality checks. | Existing rows stay related. | No auto-close line. |
| `#6022` Android mark-toggle keyboard/cursor jump | Related / not fixed | Native typing scheduler may help this class, but it does not prove Android keyboard visibility. | Existing pilot keeps it cluster-synced and says exact closure requires Android/device proof. | Raw Android Chrome/WebView or equivalent device lane. | Preserve related/no fixed claim. | Keep related text only. |
| `#4541` `editor.selection` lags after `insertText` | Related / not fixed | Commands and imperative reads must not observe stale selection after printable typing. | Dossier describes repeated text insertion leaving `editor.selection` behind. | Unit contract for flush-before-command plus browser burst/selection proof. | Existing cluster-synced row stays open until exact repro proof. | No auto-close line. |
| `#790` dynamic rendering | Related proof-route backlog | Page/spread virtualization and mounted-count budgets target this pressure, but planning does not claim it. | Coverage matrix and sync ledger require mount/edit/scroll benchmarks, DOM coverage, and native behavior proof. | Virtualized pagination benchmark: initial mount, fast scroll, click/edit, mounted DOM count, browser native behavior. | Preserve proof-route backlog. | No auto-close line. |
| `#2051` leaf rerender breadth | Related guardrail | Simple native typing should not broaden leaf/block rerender breadth. | Ledger keeps it as benchmark-gated performance pressure. | Rerender breadth plus p95 typing latency under large document and many-leaf workloads. | Preserve guardrail status. | No auto-close line. |
| `#5131` selection-driven rerenders | Related guardrail | Scheduler/layout consumers must not make selection changes rerender broad editor surfaces. | Ledger keeps `usePlite` broad by contract and asks for narrower selector/block-slice locality proof. | Subscription/rerender instrumentation during selection and typing. | Preserve not-claimed/guardrail status. | No auto-close line. |
| `#5216` Safari selection lag | Related / browser-specific | Selection proof should include Safari before claiming broad parity. | Open ledger treats it as selection-performance pressure. | Safari long-paragraph selection/typing proof, if execution expands beyond Chromium. | Preserve cluster-synced status. | No auto-close line. |
| `#1770` operation combining/transaction boundaries | Related / not fixed | Pending native text commits must land as coherent history/collab transactions, not raw timing artifacts. | Coverage matrix says existing proof does not provide a general operation-merging utility. | Unit contracts for pending transaction commit metadata, history, undo, and collaboration visibility. | Preserve related status. | No auto-close line. |

Issue-ledger sync status:
- ClawSweeper related-issue pass: skipped this activation with evidence; the
  existing durable issue ledgers already cover the related surface. Rerun only
  if a later pass promotes a fixed/improves claim or materially changes issue
  scope.
- generated live gitcrawl rows read: targeted rows read for `#6022`, `#790`,
  `#2051`, `#5131`, `#5216`, `#4541`, and `#1770`.
- manual v2 sync ledger update: no sync needed for current plan state; existing
  rows already keep these issues as related, proof-route backlog, not-claimed,
  or cluster-synced.
- fork issue dossier update: unchanged; current `#6022` pilot already states the
  Android/device proof boundary.
- issue coverage matrix update: no sync needed for current plan state; coverage
  rows already preserve the `#790`, `#2051`, `#5131`, `#6022`, and `#1770`
  proof boundaries.
- PR description sync: no sync needed for current plan state; the reference
  already says production-ready virtualization is not claimed and virtualized
  editing still needs stricter caret, IME, mobile, copy, and find proof.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Plite target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| ProseMirror | `../prosemirror-state/src/transaction.ts:22-40`, `:67-92`; `../prosemirror-view/src/index.ts:89-90`, `:153-219`, `:487-514`; `../prosemirror-view/test/view.ts:52-54` | Transaction carries doc, selection, stored marks, and metadata; view owns DOMObserver and explicit DOM flush in tests. | Stale selection/metadata after edits and implicit DOM mutation repair. | Explicit transaction metadata, mapped selection, DOMObserver flush as a testable internal boundary. | Importing the full PM document-view/node-view architecture or public `dispatchTransaction` shape. | Internal pending native text transactions with explicit metadata and first-class flush test helpers. | steal discipline, not architecture |
| react-prosemirror | `../react-prosemirror/src/hooks/useEditor.ts:57-100`; `../react-prosemirror/src/hooks/useEditorEffect.ts:29-44`; `../react-prosemirror/src/contexts/EditorContext.ts:8-19` | React adapter wraps dispatch in `flushSync` by default and disables that inside editor effects to avoid reentrant sync loops. | Letting React scheduling accidentally own editor correctness. | Adapter-level flush switch and effect-safe dispatch policy. | A React-controlled editor state loop as the typing hot path for Plite. | Keep hot path in `plite-react` runtime; use React only to publish stable committed state and measured snapshots. | useful guardrail |
| Lexical | `../lexical/packages/lexical-website/docs/intro.md:80-106`, `:110-116`; `../lexical/packages/lexical-website/docs/concepts/editor-state.md:122-134`, `:193-228`; `../lexical/packages/lexical-website/docs/concepts/transforms.md:52-93`; `../lexical/packages/lexical/src/LexicalUpdates.ts:505-553`, `:914-1053` | Immutable current state plus pending mutable state; reads flush pending updates; commands run in update context; dirty leaves/elements drive reconciliation; discrete updates force sync commit. | Full-tree recompute, stale reads, and unbounded transform loops. | Read/update boundary semantics, dirty-set invalidation, sync commit escape hatch, and clear dirty-selection validation. | Lexical's node model, transform system, and public `$` helper API. | Pending native text queue must define read/flush semantics and dirty affected ranges without changing Plite's public model. | strongest runtime comparator |
| Pretext | `../pretext/AGENTS.md:49-78`; `../pretext/pages/demos/markdown-chat.data.ts:142-146`; `../pretext/src/layout.test.ts:1226-1298` | Prepare-time text measurement and deterministic line walking after width/fonts are known; hot layout path has no DOM/canvas reads. | Asking DOM for offscreen heights during virtualization. | Offscreen/page height planning and streaming line cursor API as a future layout oracle. | Making Pretext authoritative for active editing caret/composition, or claiming cross-client fidelity while `prepare()` still relies on canvas/browser font metrics. | Use DOM truth for the active edit corridor; use Pretext-like APIs only for offscreen estimation/page planning and tests. | bounded adoption |
| Tiptap Pages | `../tiptap-docs/src/content/pages/core-concepts/limitations.mdx:11-20`; `../tiptap-docs/src/content/pages/guides/table-with-pages.mdx:16-66`; `../tiptap-docs/src/content/pages/core-concepts/options.mdx:11-87` | Page layout is product-facing; tables need a Pages-specific table package because table layout/splitting is heavily modified. | Pretending CSS page gaps solve complex block/table splitting. | Clear owner split: page/layout package owns table/media split policy, not the core text runtime. | CSS-float pagination limits, semantic AST splitting as the default answer, or page options as a typing correctness knob. | `plite-layout` owns split policy/invalidation; `plite-react` owns text input. Tables/media need provider-owned layout fragments, not arbitrary AST mutation. | cautionary reference |
| Current Plite | `packages/plite-react/src/editable/input-router.ts:42`, `:447-534`; `runtime-input-events.ts:159-177`; `dom-repair-queue.ts:330-345`; `plite-layout/src/index.ts:487-488`, `:2468-2545`, `:2554-2628`; `plite-layout/src/react.tsx:454-490`; `site/examples/ts/pagination.tsx:1708-1803` | Native path exists and virtualized mode can defer repair, but correctness and layout settle still depend on fixed timers and broad snapshot/projection work. | Duplicate React capture repair and app-owned batching. | Existing DOM repair import, native-safety policy, and page fragment projection as starting points. | Keeping `80ms`/`320-640ms` timers as the architecture. | Replace with deterministic flush + dirty block/page invalidation; keep implementation details free to iterate against metrics. | revise |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Plite target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| stale command/read after printable typing | `editor.selection` or text can lag native DOM insertion (`#4541` pressure) | command, toolbar, input-rule, history, and imperative reads flush pending text first by default; merged pending reads are allowed only if proof shows flushing is too expensive | unit tests around insertText + command/read; browser burst asserts final model text/selection equals visible caret | `plite-react` runtime | pressure accepted |
| duplicate or reordered text under burst typing | fixed repair delay can coalesce to the last repair and rely on timeout ordering | pending transaction queue preserves input order and path/root ownership; replacement-by-path is not enough | 36-char burst browser test plus scheduler unit tests | `plite-react` runtime | pressure accepted |
| wrong path after virtualization remount/scroll | pending repair targets can become stale when visible pages remount | pending transaction invalidates on root/path/range/node identity mismatch or flushes before remount boundary | fast scroll/edit/remount browser proof | `plite-react` + virtualized DOM strategy | pressure accepted |
| layout stall during large-doc typing | text-only refresh waits `320-640ms` then recomposes broad layout/projection | committed text invalidates from dirty top-level range; reuse prefix blocks/fragments/pages and recompose suffix until layout converges | perf trace with 1000-page route and DOM/page-surface budgets | `plite-layout` | pressure accepted |
| IME/mobile overclaim | printable ASCII native path does not prove composition/mobile | plan keeps IME/mobile issues related until exact device/browser proof exists | composition unit tests plus raw device/browser lane before issue closure | `plite-react` runtime | guarded |

Performance / DX / regression pressure review:
| Pressure | Current risk | Accepted constraint | Rejected shortcut | Proof needed next |
|----------|--------------|---------------------|-------------------|-------------------|
| Typing hot path | Hook-local `80ms` repair still makes correctness timing-dependent. | Move pending native text into runtime-owned transaction state with explicit flush reasons; timeout can only be idle catch-up. | Lowering or tuning `DEFERRED_NATIVE_TEXT_INPUT_REPAIR_DELAY_MS`. | scheduler unit tests and browser burst latency/model-settle proof |
| React scheduling | React capture and selector notifications can accidentally become the hot path. | DOM owns visible insert; React publishes committed state after flush. Existing deferred selector and DOM text sync machinery can be reused, but not as public API. | Controlled React editor state loop or app-side memo/debounce ceremony. | render-count/profiler row in browser proof |
| Command/history/collab visibility | Pending DOM text can become invisible state. | Flush-before-boundary is the default rule for command, selection, blur, paste/delete, undo/history, and collab apply/export. | Broad merged pending read view as the first design. | unit tests for every boundary before execution closes |
| Layout breadth | Layout has useful commit dirtiness but currently ignores it and rebuilds the whole block/projection world. | Use `dirtyTopLevelRanges` and `dirtyPaths` to start from the earliest affected block, reuse prefix layout, and recompose suffix until page breaks/heights stabilize. | Pagination-local invalidation, whole-doc compose after every text change, or AST splitting to fake pagination. | perf trace plus projection/page-surface counters |
| Table/media pagination | Complex boxes can move page breaks and span pages. | `nodeLayout` / layout provider owns split policy and fragments; Plite AST stays semantic. | Splitting table nodes in the AST as the default visual pagination fix. | multi-page table fixture proof |
| Public DX | Users should not tune correctness. | No public debounce or batching prop; debug metrics and example controls are proof-only. | `typingDebounceMs`, pagination-owned text batching, or app-owned flush hooks. | API diff review in verification pass |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| virtualized pagination typing | `/examples/pagination?page_layout=single&strategy=virtualized`, default ~1000 pages, mid-document paragraph, 36 printable chars | Chromium first; Safari added before broad selection parity claim | focused Playwright perf spec with input latency marks and final model/DOM/caret assertion | p95 visible keystroke `<=120ms`, settle `<=600ms`, no dropped/reordered text | pending execution |
| page-level virtualization budget | same route while typing and fast scrolling near table/page breaks | Chromium first | DOM counter and page-surface instrumentation in browser proof | `<=1400` DOM elements and `<=10` page surfaces | pending execution |
| deterministic flush boundaries | type then command/read/selection move/blur/paste/delete/undo | unit tests plus one browser proof row | scheduler flush count and model text/selection equal DOM after each boundary | no stale command/read state | pending execution |
| table/media layout pressure | multi-page table and media block in pagination fixture | Chromium first | layout fragment snapshot/perf proof | affected page range recomputes; no AST table split required for visual pagination | pending execution |
| IME/mobile non-claim guard | composition and mobile keyboard flows | Safari/Android only if execution claims those issues | separate proof lane before closing `#6022` or IME cluster | no issue closure from desktop typing alone | guarded |

Execution verification matrix:
| Gate | Cwd | Command | Must prove | Stop condition |
|------|-----|---------|------------|----------------|
| Native text scheduler and flush contracts | `/Users/zbeyens/git/plate-2/Plate repo root` | `bun --filter plite-react test:vitest -- input-router-contract.test.tsx runtime-repair-engine-contract.test.tsx model-input-strategy-contract.test.ts native-input-strategy-contract.test.ts editing-kernel-contract.test.ts editing-epoch-kernel-contract.test.ts keyboard-input-strategy-contract.test.ts selection-runtime-contract.test.ts selection-controller-contract.test.ts projected-collab-substrate-contract.test.ts` | Pending text preserves order/root/path/range; every command/read/selection/blur/composition/history/collab boundary flushes or explicitly proves a merged pending view. | All rows green; no correctness dependency on a fixed timer. |
| History/collab transaction visibility | `/Users/zbeyens/git/plate-2/Plate repo root` | `bun test ./packages/plite/test/collab-history-runtime-contract.ts ./packages/plite-history/test/history-contract.ts ./packages/plite-history/test/document-state-history-contract.ts` | Flushed native text appears as normal Plite operations with history/collab metadata; undo/redo and remote apply do not see hidden DOM draft state. | All rows green after scheduler changes. |
| Layout invalidation | `/Users/zbeyens/git/plate-2/Plate repo root` | `bun --filter ./packages/plite-layout test` | Committed text edits use `dirtyTopLevelRanges` / `dirtyPaths`, reuse prefix layout, and recompose suffix only until page-break/height convergence. | Layout tests green plus a new affected-range regression row. |
| Page virtualization unit contract | `/Users/zbeyens/git/plate-2/Plate repo root` | `bun --filter plite-react test:vitest -- dom-strategy-page-virtualization.test.tsx dom-strategy-and-scroll.test.tsx render-profiler-contract.test.tsx` | Virtualized mode retains page items, maps split-table rows to page items, emits stable metrics, and keeps render profiler counters bounded. | Unit tests green and metrics do not loop on unchanged virtualized state. |
| Pagination browser perf and correctness | `/Users/zbeyens/git/plate-2/Plate repo root` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bunx playwright test playwright/integration/examples/pagination.test.ts --project=chromium` | Direct virtualized load, staged-to-virtualized switch, 1000-page route, 10-page table, fast scroll, mid-document typing, burst typing, margin selection, and projected paragraph click/edit stay correct. | p95 visible typing `<=120ms`; 36-char burst settle `<=600ms`; DOM `<=1400`; page surfaces `<=10`; no dropped/reordered chars; model selection equals visible caret. |
| Huge-document regression proof | `/Users/zbeyens/git/plate-2/Plate repo root` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bunx playwright test playwright/integration/examples/huge-document.test.ts --project=chromium` | Existing staged/virtualized long-editor focus, scroll, typing, and undo rows still pass after scheduler/layout changes. | Chromium row green; no regression in scroll-to-caret behavior. |
| React and browser benchmark proof | `/Users/zbeyens/git/plate-2/Plate repo root` | `REACT_ACTIVE_TYPING_BREAKDOWN_BLOCKS=5000 REACT_ACTIVE_TYPING_BREAKDOWN_TYPE_OPS=36 bun bench:react:active-typing:local` | Active typing does not broaden React rerender work or require app-side memo/debounce ceremony. | Artifact shows bounded active typing work against current baseline. |
| Huge-document trace proof | `/Users/zbeyens/git/plate-2/Plate repo root` | `PLITE_BROWSER_TRACE_BLOCKS=5000 PLITE_BROWSER_TRACE_TYPE_OPS=36 bun bench:react:huge-document:browser-trace:local` | Browser trace has no long-task/long-animation-frame regression that contradicts the Playwright perf row. | Artifact remains under accepted benchmark budget or records a blocker. |
| Final fast package gate | `/Users/zbeyens/git/plate-2/Plate repo root` | `bun check` | Source changes pass lint, typecheck, and fast package tests. | Green before handoff. |
| Release-quality browser claim gate | `/Users/zbeyens/git/plate-2/Plate repo root` | `bun check:full` | Release-proof guards plus full integration sweep pass before any production-ready browser claim. | Green only when execution claims release-quality browser behavior. |
| Implementation autoreview | `/Users/zbeyens/git/plate-2/Plate repo root` | Load `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/SKILL.md` and run its local helper from this checkout. | Non-trivial scheduler/layout implementation has no accepted/actionable review findings. | Clean autoreview or documented accepted exceptions. |

Execution auto-iteration rule:
- Start by making the scheduler/unit rows red for the exact invariants above,
  then patch internals until they pass.
- Only then chase browser/benchmark budgets. If the browser row fails, preserve
  the public API and adjust scheduler/layout internals until the numeric stop
  conditions pass.
- Do not stop at "better". Stop only when the same command set proves the
  thresholds, or record a blocker with the exact failing counter and the next
  architectural fallback.
- Architectural fallback order: first optimize flush-before-boundary and dirty
  layout invalidation; next add a narrow internal pending read view only if the
  command/read flush proof is too slow; last revisit public API only if internal
  proof shows impossible constraints.

Execution TDD queue:
| Order | Red test to add or harden | Why | Required result |
|------:|---------------------------|-----|-----------------|
| 1 | Scheduler preserves an ordered burst across same path, different path, remount, and selection movement. | Prevents another "last repair wins" timeout patch. | Burst text imports exactly once, in order, with final caret at DOM caret. |
| 2 | Flush-before-command/read/blur/selection/history/collab boundaries. | Commands and plugins cannot see stale model text. | Boundary observers read committed Plite state, not raw DOM drafts. |
| 3 | Layout affected-range recomposition from `dirtyTopLevelRanges`. | Model catch-up is useless if layout still recomposes the world. | A text edit before page N reuses prefix pages and recomposes only the needed suffix. |
| 4 | Virtualized pagination burst typing in the 1000-page route. | This is the user-visible perf target. | `<=120ms` p95 visible typing, `<=600ms` 36-char settle, no dropped text, `<=1400` DOM, `<=10` page surfaces. |
| 5 | Multi-page table and media route under fast scroll plus typing. | Avoids table-specific hacks or AST splitting. | Provider-owned layout fragments remain semantic and bounded. |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| Current source grounding only | `Plate repo root` | `nl -ba <source files> | sed ...` | source read complete; no behavior proof claimed in planning pass | slate-plan current-state pass |
| External runtime comparator grounding | sibling repos from `/Users/zbeyens/git/plate-2` | targeted `nl -ba` / `rg` reads in `../prosemirror-*`, `../react-prosemirror`, `../lexical`, `../pretext`, and `../tiptap-docs` | comparator evidence complete for planning; no external implementation borrowed | slate-plan research pass |
| Pressure source grounding | `Plate repo root` | targeted `rg` / `nl -ba` reads for commit dirtiness, layout extraction/projection, DOM repair, kernel trace, node selectors, and page mount plan | pressure pass complete; no behavior proof claimed | slate-plan pressure pass |
| Test and benchmark surface grounding | `Plate repo root` | read `plite-react` and `plite-layout` package scripts, pagination/huge-document Playwright specs, input-router/runtime-repair/page-virtualization/render-profiler/layout tests, and benchmark scripts | verification pass complete; execution proof commands named above | slate-plan verification pass |

Autoreview workspace gate:
| Reviewed patch owner | Cwd | Command | Result | Notes |
|----------------------|-----|---------|--------|-------|
| Planning-only pass | `/Users/zbeyens/git/plate-2` | N/A | No implementation patch to review | Execution must run autoreview from `Plate repo root` after non-trivial source changes. |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | yes | complete for planning | React must publish committed state without owning printable typing correctness; no controlled React editor state loop | no public React prop; runtime owns typing |
| performance-oracle | yes | complete for planning | Biggest risk is whole-doc layout/projection after commit, not just native input repair | dirty top-level range plus prefix reuse/suffix recomposition |
| performance | yes | complete for planning | Needs interaction latency, model-settle, mounted DOM, page-surface, and render-count budgets | verification plan must name commands/counters |
| tdd | yes | complete for planning | Behavior requires scheduler unit tests, flush-boundary tests, remount invalidation tests, and browser perf/caret tests | verification plan owns exact test names |
| shadcn | no | skipped for current pass | No UI API change intended; pagination controls are proof surface only | no change |
| react-useeffect | maybe | skipped for planning | No implementation hook/effect code is edited in planning mode. Execution review should apply it only if the scheduler lands in React effects. | no change now |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| stale reads from pending DOM text | command, input rule, toolbar, history, or collaboration reads before flush | user-visible DOM has text that Plite commands/history do not see | flush-before-boundary first; merged pending read view only if proof demands it | unit tests for command/read boundaries and Playwright burst selection | accepted, proof pending |
| wrong ownership after virtualization remount | visible page/window changes while pending text exists | flush writes to stale path or wrong root | pending transaction keyed by root/path/range plus node identity invalidation | scroll/type/remount browser proof | accepted, proof pending |
| layout recomposes too broadly | text-only edit in 1000-page route | typing still stalls because layout/projection rebuilds too much | dirty top-level range, prefix reuse, suffix recomposition, and bounded page surfaces | perf trace + DOM/page count thresholds | accepted, proof pending |
| IME/mobile overclaim | scheduler handles printable ASCII but not composition/mobile | plan accidentally claims `#6022`/IME closure | non-claim rows plus raw device/browser proof gate | issue ledger and device proof before claim | guarded |

Plite maintainer objection ledger:
| Change | Objection | Tradeoff | Evidence | Migration/docs/proof answer | Verdict |
|--------|-----------|----------|----------|-----------------------------|---------|
| Runtime-owned pending native text transactions | More hidden runtime state can become hard to reason about. | Internal complexity buys native visible typing and keeps public API clean. | Current fixed repair delay and path replacement are in `input-router.ts`; DOM repair already imports text through `editor.update`. | Keep it private, expose only debug/profiler counters, and prove ordered burst plus invalidation tests. | accept with tests |
| Flush-before-boundary default | Flushing at every boundary may be too slow. | Correctness first; merged pending reads are more invasive. | Lexical-style reads flush pending state; Plite commits already carry metadata. | Execute flush-boundary unit/browser tests first; add an internal merged read view only if measured flush cost breaks budgets. | accept |
| Dirty layout invalidation | Page breaks can ripple, so invalidation may still recompose large suffixes. | Prefix reuse plus suffix convergence is honest; fake local pagination is worse. | `EditorCommit` exposes dirtiness; layout currently extracts/composes broadly. | Proof must show affected-range reuse and browser budgets; if not, introduce a narrow internal `layout.invalidate` primitive, not an app prop. | accept |
| Page-level virtualization while editing | Remounts can make pending DOM targets stale. | Scheduler must key by root/path/range and node identity, then flush or invalidate before ownership changes. | Existing page virtualization tests map split table rows to page items and share visible page windows. | Browser proof must cover fast scroll, table rows, clicked projected paragraphs, and final selection equality. | accept |
| History/collab visibility | DOM drafts could bypass undo, history, or remote subscribers. | Pending DOM text stays local only until deterministic flush. | History/collab contract tests already exist and issue `#1770` is a guardrail. | Add focused rows proving flushed text becomes normal operations with metadata and remote apply does not see hidden draft state. | accept |
| Table/media pagination | Visual splitting can tempt AST mutation. | Layout provider owns visual fragments; Plite AST remains semantic. | Tiptap Pages needed a dedicated table package; current pagination route already has multi-page table proof. | Keep table split policy in layout fragments and prove a 10-page table without semantic table-node splitting. | accept |
| Browser matrix | Chromium perf is not Safari/mobile/IME parity. | Narrow proof is valid if claims stay narrow. | Existing issue accounting keeps `#6022`, IME, Safari selection, and mobile rows as related/non-claim. | Chromium required for perf; Safari/mobile required only before broad browser, mobile, or IME issue closure. | accept |
| Public DX | Users may ask for knobs when perf varies. | Exposing correctness knobs makes the wrong abstraction sticky. | User feedback explicitly rejected dirty debounce; examples already host stress controls. | Keep controls for proof metrics only; no `typingDebounceMs` or pagination text-batching prop. | accept |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| Fixed repair debounce as correctness | cut | Timing guesses fail under fast typing, slow devices, command reads, blur, and remounts. | Internal only if current patch is replaced; no public migration. | `input-router.ts:42`, `input-router.ts:470-473` | Replace with deterministic scheduler contract. |
| Public `typingDebounceMs` / pagination text-batching prop | reject | Pushes core input correctness onto apps and teaches the wrong API. | None; do not add it. | User explicitly called the debounce dirty; public API target stays internal. | Keep proof knobs to metrics/stress only. |
| Pagination-local repair queue | reject | Would make paginated editors semantically different from normal Plite editors. | Avoided by core-owned scheduler. | `pagination.tsx:1708-1803` proves pagination already does projection work; it should not own text semantics. | Core runtime owns typing. |
| Synchronous model commit on every character as sole fix | reject as sole answer | It preserves Plite coherence but keeps React/model/layout work on the hot path. | Could remain fallback for unsafe native cases. | native policy already falls back when unsafe in `native-input-strategy.ts:23-67`. | Keep as fallback, not large-doc fast path. |
| Merged pending read view as default | reject for first execution | It makes every read path conditional and risks leaking DOM drafts into plugins/history/collab. Flush-before-boundary is simpler and closer to Plite. | None unless execution proof shows flush is too expensive. | Lexical reads flush pending updates; current Plite commit metadata already supports deterministic operations. | Keep as last-resort optimization only. |
| Internal DOM-first scheduler | keep | Best split of native typing latency and Plite model coherence. | Internal runtime migration; public call sites unchanged. | `runtime-before-input-events.ts:228-243`, `dom-repair-queue.ts:330-345`, `runtime-kernel-trace.ts:176-232` | Verification pass must name scheduler/flush tests. |
| Incremental layout invalidation | keep | Without it, committed text still forces page/projection work too broadly. Current commit dirtiness already exposes `dirtyTopLevelRanges`; layout should consume it. | Internal layout change; page snapshot consumers should stay stable. | `interfaces/editor.ts:1735-1771`, `public-state.ts:3577-3693`, `plite-layout/src/index.ts:1534-1580`, `:2468-2545` | Verification pass must name layout perf tests. |

Plan deltas from review:
- Related issue discovery added explicit non-claim accounting for input/runtime,
  DOM selection, virtualization, rerender, Safari selection, and transaction
  boundary guardrails.
- ClawSweeper live triage is skipped for this activation because existing
  ledgers already cover the touched surface; the next pass owns ledger/reference
  sync decisions after the plan's final claim shape is clearer.
- Issue-ledger sync pass closed with no file sync: existing sync ledger,
  coverage matrix, open issue ledger, and PR reference already preserve the
  non-claim/proof-route status this plan needs. The sync gate reopens only if a
  later pass promotes an issue claim, changes the proof route, or adds PR close
  text.
- Intent/boundary pass hardened the architecture call: core `plite-react` owns
  DOM-first pending native transactions and deterministic flush; `plite-layout`
  owns committed-snapshot invalidation; apps own product policy; timeout,
  public debounce props, and pagination-local text queues are rejected.
- Focused research/source-refresh pass converted external evidence into loose
  execution constraints: copy ProseMirror's transaction/flush test discipline,
  Lexical's read/update and dirty-set semantics, react-prosemirror's React flush
  guardrail, Pretext's offscreen layout boundary, and Tiptap Pages' warning that
  tables/media need provider-owned layout policy.
- Pressure pass hardened the execution shape: runtime-owned pending native text
  transactions, flush-before-boundary as the default, no merged pending read
  view unless proof demands it, and `dirtyTopLevelRanges`-driven layout
  invalidation with prefix reuse plus suffix recomposition.
- Verification pass named exact `Plate repo root` unit, browser, benchmark, fast
  package, full browser, and autoreview gates. It also closed maintainer
  objections and defined the auto-iteration stop rule: keep changing internals
  until the same command set proves the numeric budgets or a precise blocker is
  recorded.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Does execution need a merged pending read view, or is flush-before-read enough? | This decides how commands/toolbars/collab observe native DOM drafts. | Unit/browser proof must show whether boundary flushing meets latency budgets. | verification plan | decided default: flush-before-boundary; merged read view only if proof demands it |
| What is the minimal layout invalidation API? | The plan should avoid over-prescribing internals while still forcing affected-range behavior. | Exact execution API can vary, but proof must show `dirtyTopLevelRanges`/`dirtyPaths` drive affected-range recomposition. | verification plan | decided direction: earliest dirty top-level block, prefix reuse, suffix recomposition until page-break convergence |
| Does Pretext-style pagination require authority over page breaks before execution? | Authoritative page breaks may affect collab/export determinism. | Existing pageBreak snapshot API can stay future extension point. | verification plan | no for active typing; Pretext-style layout stays offscreen/future export aid |
| Which browser matrix is mandatory for final execution proof? | Chromium alone may miss Safari selection and mobile/IME failures. | Verification pass must name exact browser rows. | verification plan | Chromium required for perf; Safari/mobile required only for explicit selection/mobile/IME issue claims |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| 1. Replace fixed delay with scheduler contract | slate-plan execution mode | internal native text transaction queue and flush policy | user accepts final plan | no arbitrary fixed debounce owns correctness; commands/blur/composition/selection boundary flush deterministically | unit tests for scheduler and flush boundaries |
| 2. Wire model/selection correctness | slate-plan execution mode | DOM repair and model selection catch-up | phase 1 green | visible DOM, model text, selection, undo/history metadata stay coherent | unit tests + Playwright burst/selection |
| 3. Incremental pagination invalidation | slate-plan execution mode | dirty top-level range invalidation, prefix layout reuse, suffix recomposition, and projection/page-mount bounding after committed transactions | phase 2 green and profiler points at layout/projection | typing avoids full projection/layout rebuild unless structure/metrics require it | browser perf benchmark + profiler evidence |
| 4. Stress proof and review | slate-plan execution mode | default 1000-page route and edge cases | phases 1-3 green | measured thresholds pass and autoreview has no accepted/actionable findings | Playwright, typecheck, lint, autoreview |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact check | plate-2 | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-real-time-virtualized-typing-architecture.md` | final plan/template integrity | complete |
| current source grounding | Plate repo root | source reads listed in Boundaries | current state claims | complete |
| Plite behavior check | Plate repo root | execution verification matrix above | runtime/browser behavior | named for accepted-plan execution |

Final user-review handoff outline:
- accepted plan items: internal DOM-first native text transaction scheduler;
  deterministic flush-before-boundary; dirty commit-driven layout invalidation;
  page-level virtualization proof in pagination; no app-owned typing
  correctness.
- before / after API shape: before is hook-local delayed DOM repair plus broad
  layout/projection refresh; after is private runtime scheduling and layout
  invalidation with the same public editor call sites.
- hard cuts: no fixed debounce as correctness, no `typingDebounceMs`, no
  pagination-local text queue, no default merged pending read view, no table AST
  split for visual pagination.
- issue claims and non-claims: the plan touches `#790`, `#2051`, `#5131`,
  `#6022`, `#4541`, `#5216`, and `#1770` as related guardrails only. It closes
  no issue by planning alone.
- proof gates: execution must pass the unit, layout, Playwright, benchmark,
  `bun check`, and autoreview rows above; `bun check:full` is required before a
  release-quality browser claim.
- accepted-plan execution handoff: work in `Plate repo root`, use the TDD queue,
  keep implementation details flexible, and keep iterating until the numeric
  budgets pass or a precise blocker is recorded.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | complete: weighted score is above 0.92 and no row is below 0.91. |
| all pass rows complete or skipped with evidence | phase/pass table closed | complete: every phase row is complete or skipped with reason. |
| issue/reference sync closed | issue-ledger sync status closed | complete: no sync applies because no issue/PR close claim changed. |
| live source grounding complete | source-backed rows cite current owners | complete: source and test/bench surfaces were read in `Plate repo root`. |
| workspace verification recorded | verification workspace gate closed | complete: planning-only proof recorded and execution commands named. |
| autoreview clean or N/A | `.agents/skills/autoreview/SKILL.md` loaded and clean from the git checkout that owns non-trivial uncommitted implementation changes (`Plate repo root` for Plite patches), or N/A with reason | complete: N/A because this pass changed only the planning artifact. |
| final handoff emitted or lane remains active | final response / next pass recorded | complete: handoff section above is filled and `next_pass` is `none`. |
| `check-complete` passes | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-real-time-virtualized-typing-architecture.md` | complete: `[autogoal] complete: docs/plans/2026-05-31-real-time-virtualized-typing-architecture.md`. |

Findings:
- Current fix is correctly owned by `plite-react`, not pagination.
- The current fix is still not the final architecture: `input-router.ts:42`
  hard-codes an `80ms` delayed repair, and `input-router.ts:520-534` only
  coalesces by replacing the last repair for the same path.
- `runtime-input-events.ts:159-166` already avoids duplicate React capture repair
  in virtualized mode. Keep that owner split.
- `runtime-before-input-events.ts:228-243` makes native-vs-model policy before
  sync/input rules; command/input-rule boundaries must become explicit flush
  boundaries.
- `dom-repair-queue.ts:183-335` already knows how to import DOM text into the
  model and move selection when the target still owns the DOM caret. The plan
  should build on that instead of inventing a pagination-local path.
- `plite-layout/src/index.ts:2468-2545` still extracts all layout blocks and
  composes the whole snapshot on refresh. It defers text-only refresh at
  `index.ts:2625-2627`, but that is separate from real incremental invalidation.
- Pagination example computes full projection and decoration maps from the full
  snapshot at `pagination.tsx:1724-1803`; this is acceptable for proof but not
  enough for the final real-time architecture.
- Related issue discovery confirms the architectural owner: input/runtime and
  DOM selection are the core risk, while pagination is the large-document proof
  surface.
- `#790`, `#2051`, and `#5131` make the perf bar concrete: execution must prove
  mounted count, fast scroll/edit behavior, and rerender breadth, not just lower
  one local timeout.
- `#6022`, `#4541`, and the mobile/IME cluster make overclaiming dangerous.
  This plan can define the runtime route, but exact closure needs device or
  repro-specific browser proof.
- `#1770` is a transaction-boundary guardrail: pending native text cannot become
  an invisible side channel that bypasses history, undo, or collaboration.
- Existing PR-reference text is already aligned with this plan's caution:
  production-ready virtualization is not claimed, and virtualized editing still
  requires stricter caret, IME, mobile, copy, and find proof before it can be
  positioned as production behavior.
- Live source refresh for this pass confirms the boundary: the current hot path
  uses `DEFERRED_NATIVE_TEXT_INPUT_REPAIR_DELAY_MS = 80`, skips React capture
  repair when deferred native text repair is active, imports DOM text through
  `editor.update`, and still composes layout/projection from whole snapshots.
- ProseMirror's useful lesson is not its full view tree; it is that transactions
  carry selection/metadata and DOM observation has an explicit flush surface
  that tests can drive.
- Lexical is the strongest runtime comparator: reads flush pending updates,
  updates operate on pending state, discrete updates force sync commit, and dirty
  leaves/elements bound reconciliation. Plite should copy that contract style,
  not Lexical's node model.
- react-prosemirror shows the React adapter should control when React flushes
  around editor dispatch, and should avoid reentrant sync behavior inside editor
  effects.
- Pretext should remain an offscreen/page planning tool for virtualization and
  future export fidelity. It should not replace DOM truth for active selection,
  caret, or composition.
- Tiptap Pages is a warning label: table pagination needed a Pages-specific
  table package and BFC blocks cannot be split by the CSS-float trick. Plite's
  long-term answer should be provider-owned layout fragments/split policy, not
  mutating the Plite AST just to make a table visually span pages.
- Pressure pass found an existing substrate for layout invalidation:
  `EditorCommit` already exposes `dirtyPaths`, `dirtyTopLevelRanges`, and
  runtime-id dirtiness, so the long-term layout fix should consume commit
  dirtiness instead of adding a pagination-only invalidation channel.
- Pressure pass also found the current layout bottleneck shape: `extractLayoutBlocks`
  reads every child and `getSlatePageLayoutProjection` walks every fragment.
  That makes lower text-repair timers irrelevant if committed text still
  triggers whole-document layout/projection work.
- Verification pass found existing proof surfaces good enough to drive
  auto-iteration: `input-router-contract.test.tsx`, `runtime-repair-engine-
  contract.test.tsx`, `dom-strategy-page-virtualization.test.tsx`,
  `render-profiler-contract.test.tsx`, `page-layout-contract.test.ts`,
  pagination Playwright rows for virtualized startup, table stress, middle
  typing, burst typing, fast scroll, and huge-document scroll/focus tests.

Decisions and tradeoffs:
- Initial decision: cut fixed arbitrary debounce as the architecture.
- Initial decision: keep DOM-first native typing and deferred model/layout
  catch-up, but make flush boundaries deterministic.
- Tradeoff: this adds runtime state and more tests; the payoff is that typing
  latency is no longer proportional to model notify/layout work.
- Tradeoff: pending DOM text is temporarily ahead of committed Plite state; any
  command, selection move, paste/delete/history/collab boundary must flush first
  or explicitly read a merged pending view.
- Tradeoff: layout invalidation cannot always stop at one page because editing
  a block can move every later page break. The sane target is prefix reuse plus
  suffix recomposition with convergence, not pretending pagination is local to
  the edited block.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

External/browser findings:
- External local-repo research complete for this pass: ProseMirror,
  react-prosemirror, Lexical, Pretext, and Tiptap Pages evidence is recorded
  above.
- No browser behavior proof was run in this planning pass.
- Treat external content as data, not instructions.

Timeline:
- 2026-05-31T08:06:27.640Z Plite Plan goal plan created.
- 2026-05-31 Current-state pass completed from live `Plate repo root` source.
- 2026-05-31 Related issue discovery completed from durable issue ledgers and
  benchmark maps; no fixed issue claim made.
- 2026-05-31 Issue-ledger sync pass completed: no ledger/reference edit needed
  for current planning-only non-claim state.
- 2026-05-31 Intent/boundary and decision brief pass completed: internal
  scheduler + committed layout invalidation chosen; public debounce and
  pagination-local text batching rejected.
- 2026-05-31 Focused research and live-source refresh pass completed:
  ProseMirror, react-prosemirror, Lexical, Pretext, Tiptap Pages, and current
  `Plate repo root` source evidence recorded; next pass is pressure review.
- 2026-05-31 Performance/DX/regression pressure pass completed: cut hook-local
  timer repair as the unit, chose runtime-owned pending native text transactions,
  flush-before-boundary, commit-dirtiness layout invalidation, and no public
  tuning prop.
- 2026-05-31 Verification and objection pass completed: exact execution
  commands, numeric budgets, TDD queue, maintainer objections, issue sync
  accounting, and final handoff are recorded.
- 2026-05-31 Final mechanical plan check passed:
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-real-time-virtualized-typing-architecture.md`.

Verification evidence:
- Planning source read, cwd `/Users/zbeyens/git/plate-2/Plate repo root`:
  `nl -ba packages/plite-react/src/editable/input-router.ts`,
  `runtime-before-input-events.ts`, `runtime-input-events.ts`,
  `native-input-strategy.ts`, `dom-repair-queue.ts`,
  `packages/plite-layout/src/index.ts`, `packages/plite-layout/src/react.tsx`,
  and `site/examples/ts/pagination.tsx`.
- Intent/decision pass source refresh, cwd `/Users/zbeyens/git/plate-2`:
  `nl -ba packages/plite-react/src/editable/input-router.ts`,
  `runtime-before-input-events.ts`, `runtime-input-events.ts`,
  `native-input-strategy.ts`, `dom-repair-queue.ts`,
  `packages/plite-layout/src/index.ts`,
  `packages/plite-layout/src/react.tsx`, and
  `site/examples/ts/pagination.tsx`.
- Focused research pass, cwd `/Users/zbeyens/git/plate-2`: targeted `rg` and
  `nl -ba` reads in `../prosemirror-state`, `../prosemirror-view`,
  `../react-prosemirror`, `../lexical`, `../pretext`, and `../tiptap-docs`;
  comparator evidence is planning-only and does not claim copied code.
- Pressure pass, cwd `/Users/zbeyens/git/plate-2`: targeted `rg` and `nl -ba`
  reads in `packages/plite/src/interfaces/editor.ts`,
  `packages/plite/src/core/public-state.ts`,
  `packages/plite-layout/src/index.ts`,
  `packages/plite-layout/src/page-mount-plan.ts`,
  `packages/plite-react/src/editable/model-input-strategy.ts`,
  `packages/plite-react/src/editable/runtime-kernel-trace.ts`,
  `packages/plite-react/src/hooks/use-node-selector.tsx`, and
  `packages/plite-react/src/hooks/use-editor-selector.tsx`.
- No Plite behavior command run in this planning pass; no implementation
  behavior claim made beyond current source shape.
- Verification pass, cwd `/Users/zbeyens/git/plate-2`: read
  `Plate repo root/package.json`, `packages/plite-react/package.json`,
  `packages/plite-layout/package.json`, `playwright.config.ts`,
  `playwright/integration/examples/pagination.test.ts`,
  `playwright/integration/examples/huge-document.test.ts`,
  `packages/plite-react/test/input-router-contract.test.tsx`,
  `runtime-repair-engine-contract.test.tsx`,
  `dom-strategy-page-virtualization.test.tsx`,
  `render-profiler-contract.test.tsx`,
  `packages/plite-layout/test/page-layout-contract.test.ts`, and browser
  benchmark scripts for active typing and huge-document traces.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Plite Plan ready for user review after the final mechanical check. |
| Where am I going? | Accepted-plan execution in `Plate repo root`: write the red tests, replace timeout-owned correctness with the internal scheduler, add layout invalidation, and iterate until the browser budgets pass. |
| What is the goal? | Produce a user-review-ready architecture plan for real-time virtualized typing, then let execution mode auto-iterate against measurable browser budgets. |
| What have I learned? | The best long-term decision is an internal DOM-first transaction scheduler plus deterministic flush and commit-dirtiness-driven layout invalidation; a hook-local debounce is the wrong unit, and a merged pending read view is overkill until proof says otherwise. |
| What have I done? | Created the planning goal/plan, completed current-state read, related issue discovery, issue-ledger sync, intent/decision boundary, focused research/live-source refresh, pressure review, verification matrix, objection ledger, and final handoff. |

Open risks:
- Execution may still discover that flush-before-boundary is too expensive, but
  that must be proven before adding a merged pending read view.
- Layout invalidation may still need an internal `layout.invalidate` primitive if
  `dirtyTopLevelRanges` is not precise enough in practice.
- Chromium proof is enough for the real-time virtualized typing lane; it is not
  enough to close Safari, mobile, or IME issues.
