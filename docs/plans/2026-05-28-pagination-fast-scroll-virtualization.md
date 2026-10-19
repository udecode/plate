# pagination fast scroll virtualization

Objective:
Close a Plite Plan for `/examples/pagination` fast-scroll virtualization: prove
the real broken scroll path from the user video, steal the right test mechanics
from `../virtual` and `../pierre`, choose the long-term page/table
virtualization architecture, and stop at user-review-ready planning before any
new implementation execution.

Goal plan:
docs/plans/2026-05-28-pagination-fast-scroll-virtualization.md

Template:
docs/plans/templates/slate-plan.md

Primary template:
docs/plans/templates/slate-plan.md

Applied packs:
- slate-plan

Completion threshold:
- Planning is done only when score >= 0.92, no dimension is below 0.85, every
  pass row is complete or intentionally skipped with evidence, issue/reference
  sync is closed, final handoff is emitted, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-pagination-fast-scroll-virtualization.md`
  passes.
- Current activation closes the closure score and final gates pass.
  Planning goal may complete only after the final checker passes.

Verification surface:
- Planning checks run in `plate-2`.
- Plite source/runtime/browser claims must cite live `Plate repo root` files.
- Execution proof, when accepted later, runs from `Plate repo root` and must cover
  browser scroll replay, frame/long-task budget, DOM/page/row/cell budget,
  bounded memory/element churn, typecheck, lint, and focused Playwright rows.

Constraints:
- Planning mode may edit only planning, research, issue-ledger, and PR-reference
  artifacts.
- Do not touch `Plate repo root` implementation again until this plan is ready and
  the user explicitly accepts execution mode.
- Keep core Plite unopinionated. The example can expose stress controls; the
  package API should stay small and Plite-shaped.
- Performance claims need measured browser proof, not vibes.

Boundaries:
- Allowed planning edit scope: `docs/plans/**`, `docs/research/**`,
  `docs/plite-issues/**`, `docs/plite/ledgers/**`,
  `docs/plite/references/**`.
- Current live source owner:
  `packages/plite-layout/src/react.tsx`.
- Current example owner:
  `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx`.
- Current browser proof owner:
  `apps/www/tests/plite-browser/donor/examples/pagination.test.ts`.
- Video evidence:
  `/Users/zbeyens/Library/Application Support/CleanShot/media/media_p2a87hYOIr/2026-05-28 at 09.18.04.mp4`.

Blocked condition:
- Block only if the same blocker repeats for three goal turns and no video,
  sibling-repo, source, issue-ledger, or plan-hardening move remains runnable.

Plite Plan lane state:
- slate_plan_lane_status: complete
- current_pass: closure-score-and-final-gates
- current_pass_status: complete
- next_pass: none
- next_action: none; if the user accepts this plan, start a separate execution
  goal for the implementation queue in `Plate repo root`
- final_handoff_status: complete

Current verdict:
- verdict: ready for user review
- confidence: 0.94
- keep / cut / revise call: accept the planning architecture for user review;
  execute only after the user accepts this plan.
- reason: the final plan chooses one Plite-owned page-window authority plus a
  content-unit corridor, rejects the bad public/API/model alternatives, closes
  issue accounting without overclaiming, and names the exact browser/unit proof
  gates needed to fix the user-video failure in execution mode.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every Plite Plan completion
  gate below is satisfied and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-pagination-fast-scroll-virtualization.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `plite-plan` read from `.agents/skills/slate-plan/SKILL.md`. |
| Active goal checked or created | yes | Goal created in the first activation; current activation rechecked the active goal before this pass. |
| Source of truth read before edits | yes | Read user video metadata/contact sheet, research index/log, issue references, live `Plate repo root` source/tests, `../virtual`, and `../pierre`. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read `docs/solutions/workflow-issues/2026-05-23-plite-issue-claims-need-exact-browser-proof-and-honest-input-contracts.md`. |
| Live `Plate repo root` grounding needed for current-state claims | yes | Source rows below cite exact `Plate repo root` files/lines. |

Work Checklist:
- [x] Objective includes lane outcome, full pass schedule, one-pass-per-
      activation policy, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] One-pass-per-activation policy respected for this activation.
- [x] Live source grounding recorded for current implementation claims.
- [x] Related issue discovery / ClawSweeper pass applied with concrete evidence.
- [x] Full issue-ledger/reference pass applied; sync ledger updated and
      matrix/dossier/PR reference left unchanged with evidence.
- [x] Research and ecosystem synthesis complete for every external system used
      as evidence.
- [x] Intent/boundary record and decision brief completed for the current
      plan target.
- [x] Scorecard recorded with evidence; total score >= 0.92 and no dimension
      below 0.85 before closure.
- [x] Applicable implementation-skill review matrix seeded.
- [x] Plite maintainer objection ledger complete for every breaking/paradigm
      change, or marked N/A with reason.
- [x] Verification workspace gate recorded for every Plite source, runtime,
      browser, package, public API, or issue-fix claim.
- [x] TDD target recorded for behavior/proof changes.
- [x] Browser proof captured for the current browser-surface failure claim:
      current video evidence is recorded; replayable Playwright proof is an
      execution acceptance gate, not a planning-closure claim.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run plan check at closure | final closure pass runs `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-pagination-fast-scroll-virtualization.md`; result recorded in Verification evidence |
| Plite source, runtime, browser, package, public API, or issue-fix claim | yes | Record live `Plate repo root` source reads now; execution proof after accepted implementation | source read complete; execution proof explicitly deferred |
| Issue ledger or PR reference changed | yes | Sync issue/reference rows after issue pass | final v2 sync ledger note updated; matrix/dossier/PR unchanged after audit because existing rows already match |
| Autoreview for uncommitted implementation changes | execution only | Run from `Plate repo root` after accepted implementation | N/A for planning closure; no implementation files were edited in this final planning pass |
| Final user-review handoff | yes | Emit after closure pass | final handoff outline completed below and summarized in final response |
| Goal plan complete | yes | Run `check-complete` | final closure checker command recorded in Verification evidence |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | video read, live source read, sibling repo scan, initial score | related issue discovery |
| Related issue discovery | complete | gitcrawl status/doctor/search, `#790`/`#5944` threads and neighbors, existing coverage/sync/dossier rows reused | issue-ledger pass |
| Issue-ledger pass | complete | appended 2026-05-28 sync note; audited live ledger, v2 sync ledger, frozen ledger, clusters, fork dossier, coverage matrix, and PR reference | intent/boundary pass |
| Intent/boundary and decision brief | complete | clarified owner split, invariants, hard non-goals, selected two-window architecture, and rejected alternatives | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | refreshed TanStack Virtual API/source, Pretext source/status, Tiptap Pages docs, `../virtual` browser tests, `../pierre` tree/diff virtualization tests, and current `Plate repo root` owners | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | applied performance, performance-oracle, Vercel React, react-useeffect, tdd, and simplicity lenses; revised plan toward one shared page-window authority, indexed mount helpers, real scroll INP/DOM budgets, and eager hidden-child rendering proof | objection ledger |
| Plite maintainer objection ledger | complete | tested core objections against public API minimalism, shared window authority, renderer child windowing, native-behavior degradation, browser-proof scope, collab/export fidelity, and example ownership; demoted public child-window slot to last resort behind an internal `EditableLayout` child-range plan | high-risk pass |
| High-risk deliberate mode | complete | stress-tested the plan against blank-page races, false green scroll tests, overscan overfitting, dual-window drift, eager child allocation, native-behavior degradation, sparse-fixture confusion, selection retention, proof flakiness, and CI/runtime cost | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | rechecked TanStack, Pretext/Premirror, Tiptap Pages, `../virtual`, and `../pierre` after high-risk hardening; no new public API, AST mutation, product TableKit dependency, or strict collab/export claim is justified | revision pass |
| Revision pass | complete | collapsed the plan to one final architecture, removed public renderer-slot candidate language, made planning vs execution proof boundaries explicit, and kept the execution acceptance gates as the handoff contract | issue sync accounting |
| Issue sync accounting | complete | final sync note added to `docs/plite-issues/gitcrawl-v2-sync-ledger.md`; `docs/plite/ledgers/issue-coverage-matrix.md`, `docs/plite/ledgers/fork-issue-dossier.md`, and `docs/plite/references/pr-description.md` audited with no claim change | closure score and final gates |
| Closure score and final gates | complete | scorecard total is 0.935 with no dimension below 0.92; workspace and autoreview gates are resolved for planning; final handoff is complete; checker command is recorded | final handoff |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.93 | Plan readiness is high because the final architecture names the hot owners and repair strategy: raw scroll geometry moves to refs/rAF/window keys, page/spread range math moves to private indexed helpers, and hidden child work moves to internal `EditableLayout` child ranges. This is not a runtime-fixed claim; browser trace proof stays an execution acceptance gate. |
| Plite-close unopinionated DX | 0.20 | 0.94 | Public API stays at `domStrategy={{ type: 'virtualized', overscan }}`; `pageVirtualization`, public TanStack options, public renderer child-window slots, AST table splitting, and product TableKit dependency are rejected from the accepted plan. |
| Plate and slate-yjs migration backbone | 0.15 | 0.92 | Page windows, child ranges, and mounted ranges remain derived/local; Plate can layer row/unit policy later; slate-yjs syncs document ops and optional page-break snapshots, not viewport churn or client page windows. |
| Regression-proof testing strategy | 0.20 | 0.94 | Execution acceptance requires wheel/continuous-scroll replay, visible-label/no-blank assertions after every burst, shared window coherence, child-range materialization counters, selected-row editing, event-to-paint/long-task sampling, DOM/page/row/cell budgets, and native-behavior classification. |
| Research evidence completeness | 0.15 | 0.95 | TanStack Virtual, Pretext/Premirror, Tiptap Pages, `../virtual`, `../pierre`, current `Plate repo root` runtime/test owners, issue ledgers, and PR reference were rechecked after high-risk hardening and revision. |
| shadcn-style composability and minimalism | 0.10 | 0.92 | Example controls stay URL-backed, virtualized-only, and proof-driven; core gets no product settings, no public virtualizer manager, and no UI policy beyond the existing Plite-shaped DOM strategy. |

Final weighted score: 0.935. This is the plan-readiness score, not a shipped
runtime performance claim.

Source-backed architecture north star:
- target shape: paged mode has two explicit windows: page shell window and
  content-unit window. Page shells mount only visible pages plus small overscan;
  expensive units inside a multi-page block mount only for the visible content
  corridor plus selected/composing/promoted paths.
- source evidence: current context already carries `visiblePageIndexes`,
  `visibleContentRange`, and `selectedPaths` in
  `packages/plite-layout/src/react.tsx:46-61`.
- source evidence: current `usePliteLayoutFragments` filters units by visible
  content range or selected path overlap in
  `packages/plite-layout/src/react.tsx:217-226`.
- rejected drift: do not split table nodes in the AST just to paginate; derived
  layout fragments/pages stay separate from model nodes.
- migration posture: Plate/table plugins should provide row/unit layout policy;
  slate-yjs should replicate document ops, not page-window churn.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| `Editable domStrategy` | Keep Plite-shaped `type: 'virtualized'`, `overscan`, `threshold`, `estimatedBlockSize`; do not leak TanStack options | Existing DX remains familiar and compact | No public migration if runtime internals change | `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:995-1005` | keep |
| Pagination example controls | Keep URL-backed stress controls; execution may add a fast-scroll preset only to stabilize the repro URL | Example is inspectable without hidden fixtures | Example-only, not core API | `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:98-137`, `1264-1291` | revise |
| Scroll test harness | Add internal Playwright helper, not public runtime API | Tests express user paths: wheel, jump, continuous scroll, no blanks | Test-only | `../virtual/packages/react-virtual/e2e/app/test/scroll.spec.ts:54-112` | add |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| Shared page-window authority | `PagedEditable` plus `Editable` virtualized plan | Compute one page-window snapshot keyed by visible page item indexes and reuse it for page chrome, editable top-level rows, and page-derived content range | Independent windows drifting under fast scroll and producing blank page chrome or row/chrome mismatch | `packages/plite-layout/src/react.tsx:550-620`; `packages/plite-react/src/dom-strategy/use-virtualized-root-plan.ts:407-422` | add |
| Page mount plan | `packages/plite-layout/src/page-mount-plan.ts` | Index fragments by page once, build page/spread items in O(pages + fragments + units), and derive visible item ranges by page-window key/binary range instead of filtering every item on every raw scroll tick | O(pageGroups * fragments) plan creation and O(pageItems) viewport filtering as the default hot scroll path | lines 57-125 and 177-205 | revise |
| Scroll viewport update | `packages/plite-layout/src/react.tsx` | Store raw scroll geometry in refs, schedule one rAF update, and set React state only when the page-window key or content corridor changes | Pixel-level React renders during fast scroll | lines 509-536; React/useEffect lens | revise |
| Fragment unit materialization | `packages/plite-layout/src/react.tsx` | Unit corridor based on shared page window plus selected/composing/promoted paths; keep selected deep rows mounted through indexed path-to-page lookup | Full multi-page table materialization or selected row unmount | lines 217-226 and 609-620; `use-virtualized-root-plan.ts:371-397` | keep/revise |
| Renderer child windowing | `EditableLayout` plus `EditableDescendantNode` internal child ranges | Add a layout-owned child-range plan so core creates only visible child ranges plus selected/composing/promoted paths; public renderer child-window API is not part of the accepted plan | React element allocation proportional to table row count on every visible table render, without widening unstable renderer API | `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:228-290`; `packages/plite-react/src/components/editable-text-blocks.tsx:1030-1148`; `docs/plite/references/pr-description.md:1327-1418` | revise |
| Stress document tail | `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx` | Stress pages should render clear content or deliberate sparse diagnostic placeholders, and the proof must assert visible stress labels after fast scroll | False positives where blank pages look like virtualization failure | lines 426-431 and 614-622 | revise |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| `PagedEditable` | `layout`, `pageView`, `domStrategy`, `renderPage` | Page chrome belongs outside document content | React projects layout; Plite model stays source of truth | `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:1346-1352` | keep |
| `usePliteLayoutFragments` | renderer reads fragments for its own path | Renderers should not compute global pagination | Returned fragments must already be windowed | `packages/plite-layout/src/react.tsx:197-235` | keep |

Plate migration-backbone target:
| Pressure | Plite substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| Tables spanning pages | Derived row/unit fragments, not AST table splitting | Plate table can provide row sizes/split rules later | Raw Plite TableKit and product table commands | Pretext/Tiptap research row below | keep |
| Stress controls | Example-level controls only | Plate can build richer UI over core props | Core owning product pagination settings | current example controls | keep |

slate-yjs migration-backbone target:
| Pressure | Plite substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| Page/window churn | Keep as derived client view state | Do not sync mounted page/window state through Yjs | Cross-client identical page breaks by default | Pretext drift research | keep |
| Strict pagination fidelity | Optional authoritative page-break snapshot later | Sync snapshot/profile only when app opts in | Promise strict export/collab fidelity by default | `docs/research/sources/editor-architecture/pretext-pagination-page-virtualization.md`; `packages/plite-layout/src/index.ts:2369-2413` | keep |

Intent / boundary record:
- intent: make `/examples/pagination?strategy=virtualized` survive real fast
  user scrolling through a large paged document with a table spanning about 10
  pages, then into a roughly 1000-page stress tail.
- outcome: visible pages never render as accidental blanks, visible table rows
  and cells stay materialized inside the viewport corridor, selected/composing
  content stays mounted, DOM/page/row/cell counts stay bounded, and the proof
  fails on the attached video class.
- user workflow boundary: the proof path is open example, choose virtualized DOM
  strategy, use real wheel/trackpad-like scroll through table pages into the
  stress tail, then inspect/edit selected table content.
- owner split:
  - `plite-layout` owns derived layout snapshots, page geometry, page mount
    items, fragment/unit filtering, and viewport-derived windows.
  - `plite-react` `Editable` owns the generic `domStrategy` bridge and layout
    item exposure, not pagination-specific product settings.
  - the example owns URL-backed stress controls, clear fixture content, and
    inspection counters.
  - Playwright owns video-class replay, geometry checks, and frame/DOM budgets.
- in-scope: internal page/spread virtualization for paged mode, a second
  content-unit corridor for expensive split blocks, selected/composing/promoted
  retention, example-only stress knobs, and browser scroll proof.
- non-goals: AST table splitting, product TableKit, public `pageVirtualization`,
  public TanStack option passthrough, strict cross-client page break fidelity,
  native browser find/a11y parity for unmounted content, and broad
  scrollSelectionIntoView/mobile closure.
- invariants:
  - Plite model nodes are never split, reordered, or duplicated for layout.
  - Page shells may unmount only outside the visible page window plus overscan.
  - Fragment units may unmount only outside the visible content corridor unless
    selected, composing, or explicitly promoted.
  - Virtualized paged mode is a degraded native surface until browser proof
    promotes exact native behavior.
  - A visible blank page is a test failure unless the fixture deliberately marks
    it as sparse diagnostic content.
- decision boundaries: this plan may choose internal runtime/test architecture
  and example controls; new public API, native parity claims, or product table
  semantics need separate maintainer-objection and proof rows.
- unresolved user-decision points: none.

Decision brief:
- chosen architecture: Plite-owned two-window materialization. Paged mode uses a
  page shell window; expensive multi-page content inside those pages uses a
  content-unit window. Both are derived from layout state and selected paths.
- public API call: do not add `pageVirtualization`. Page/spread virtualization
  is the internal paged-mode behavior when `domStrategy` is
  `{ type: 'virtualized' }`; example controls may expose overscan and stress
  size, but core keeps the Plite-shaped `domStrategy` surface.
- principles:
  - User-scroll proof beats synthetic `scrollTop` proof.
  - Layout projection must not mutate the document model.
  - Public API stays small; engine details stay internal.
  - Repeated-unit budgets are explicit: page surfaces, rows, cells, DOM nodes,
    frame time, and long tasks.
  - Selection/composition retention beats giant overscan.
- top drivers: fast-scroll blank-window risk, 1000-page DOM pressure,
  multi-page table unit cost, and avoiding a public API that bakes in today's
  virtualizer.
- viable options:
  - A. Plite-owned page shell window plus content-unit window, with real scroll
    tests and coalesced viewport updates.
  - B. Let TanStack Virtual own page virtualization directly.
  - C. Render placeholders while scrolling and hydrate content after scroll.
  - D. Hide the failure with large overscan.
- selected option: A.
- rejected alternatives:
  - B leaks the virtualization engine into Plite's public mental model.
  - C makes an editor feel broken unless a product deliberately opts into a
    preview/degraded mode.
  - D spends DOM and memory to mask a scheduler/windowing bug.
- consequences:
  - Runtime work should gate viewport updates by animation frame and/or window
    index, not every raw scroll event.
  - Tests need wheel/continuous-scroll replay, visible-content assertions, and
    DOM/page/row/cell counters.
  - Table/media pagination should use derived fragments or provider-owned units,
    never AST splitting.
  - Strict collab/export fidelity stays optional through authoritative page-break
    snapshots, not default client state.
- follow-ups: research refresh, performance pressure pass, maintainer objection
  pass, and final proof budgets.

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| `#5944` stable per-line pagination | issue-reviewed, direct related | No fixed/improved claim | The plan targets page-boundary stability, but no current browser proof covers flicker, caret mapping, or stable edits across page fragments. | Replay typing/editing across page boundaries, assert no page-break oscillation, caret maps to the same logical point, visible fragment content remains mounted. | Current 2026-05-28 sync row added; matrix/dossier rows already cover this surface. | related matrix only |
| `#790` dynamic rendering / virtualization | related proof-route backlog | No fixed/improved claim | Page/spread virtualization directly targets the requested dynamic rendering pressure, but a single jump test is nowhere near enough. | Mount/edit/scroll benchmark, mounted-count proof, DOM coverage proof, browser-native behavior proof, continuous fast-scroll replay. | Current 2026-05-28 sync row added; matrix/dossier rows already cover this surface. | related matrix only |
| `#5131`, `#2051` subscription/rerender breadth | guardrails | No claim change | Layout snapshots, page windows, and fragment hooks must not widen selection subscriptions or leaf rerender breadth. | Subscription/rerender counters around scroll, selection, and simple typing in virtualized pagination. | Preserve existing guardrail rows. | guardrail only |
| `#4141`, `#3656`, `#4210`, `#5349` rerender-performance neighbors | related guardrails | No claim change | gitcrawl neighbors/search surface repeated render pressure; this plan only owns paged scroll/materialization proof. | Keep render-count budgets in focused tests; do not promote unless exact repro/proof is added. | No ledger change. | not claimed |
| `#5992`, `#5945`, `#4056` large-document operation/clipboard rows | preserve existing improves | No promotion from this plan | Pagination fast-scroll does not prove large cut, paste, or clipboard operation closure. | Existing benchmark owners stay authoritative; add no new claim here. | Preserve existing `Improves` rows. | unchanged |
| `#2195`, `#2405` dirty/normalization perf | related guardrails | No claim change | Fast-scroll work must not add avoidable dirty/normalization work during viewport churn. | Operation/normalization counters only if runtime changes touch this path. | No ledger change. | not claimed |
| `#5826` long-editor refocus/scroll | regression floor | Do not broaden | Existing fixed scroll behavior is a floor; fast-scroll pagination must not regress selection scroll restoration. | Selection-scroll regression row after runtime changes. | Preserve existing fixed row exactly. | unchanged |
| `#4995`, `#5088`, `#5473`, `#4590`, `#4837`, `#4844`, `#5639` scroll-selection/mobile scroll cluster | adjacent, not claimed | No claim change | These are scroll ownership and mobile/native behavior pressures, not solved by page virtualization planning. | Exact browser/device proof required before any promotion. | No ledger change. | not claimed |
| `#5924`, `#2793`, `#2572`, `#3892` DOM/a11y/custom-surface policy rows | policy non-claims / release guards | No claim change | Missing-DOM modes and custom layout surfaces need explicit degradation or assistive-tech proof. | DOM coverage policy, a11y proof, and custom-surface documentation only in later passes. | Preserve existing policy rows. | not claimed |

Issue-ledger sync status:
- ClawSweeper related-issue pass: complete for this surface via local
  gitcrawl archive plus existing ledger rows.
- generated live gitcrawl rows read: complete for the direct query and direct
  threads `#790`, `#5944`, `#5992`, `#5131`, `#2051`, `#2195`, `#2405`.
- manual v2 sync ledger update: complete; added
  `2026-05-28 Pagination Fast-Scroll Virtualization Planning Sync` to
  `docs/plite-issues/gitcrawl-v2-sync-ledger.md`.
- final revision issue-sync check: complete; appended a final no-claim-change
  note to the 2026-05-28 sync entry after auditing the final architecture
  against the issue/reference surfaces.
- fork issue dossier update: no change; existing Pretext layout/pagination and
  provider-owned page fragment sections already cover `#5944` and `#790`.
- issue coverage matrix update: no change; existing related/proof-backlog rows
  already cover `#5944`, `#790`, `#5131`, `#2051`, and preserved improves.
- PR description sync: no change; production-ready virtualization remains
  unclaimed.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Plite target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| TanStack Virtual | `../virtual/docs/api/virtualizer.md:67-83`, `143-149`, `314-334`, `480-561`; `../virtual/packages/virtual-core/src/lazy-measurements.ts:1-44` | Headless measured range engine with `onChange(sync)`, overscan, stable keys, `rangeExtractor`, one-shot measurement snapshots, lazy single-lane materialization, and iOS scroll-write deferral | Full repeated-unit DOM and per-item object allocation in huge lists | Use as internal range discipline: stable item keys, visible range extraction, measurement snapshot restore, explicit `isScrolling`, and no default override of scroll-position correction | Public TanStack option passthrough; default `useAnimationFrameWithResizeObserver`; smooth-scroll behavior as editor proof | Plite-owned page/unit policy with a small `domStrategy` API; TanStack can inspire internals, not define public DX | agree |
| Pretext/Premirror | `../pretext/RESEARCH.md:20-37`, `55-70`; `../pretext/src/measurement.ts:36-111`; `../pretext/src/layout.ts:668-710`; `../pretext/STATUS.md:1-31` | Two-phase prepare/layout: expensive segmentation and canvas measurement once, hot layout path arithmetic-only, browser-profile-aware tuning | DOM reflow pagination and AST splits | Keep derived layout snapshots and cheap resize relayout; model strict fidelity as measurement profile plus optional authoritative page-break snapshot | Promise headless/cross-client page-break determinism by default while `measureText()` and browser profile matter | Local fast pagination first; strict collab/export fidelity is opt-in state, not core Plite behavior | agree |
| Tiptap Pages | `../tiptap-docs/src/content/pages/core-concepts/limitations.mdx:11-20`; `../tiptap-docs/src/content/pages/guides/table-with-pages.mdx:16-66` | CSS-float page gaps plus product-specific Pages TableKit for table splitting | Owning full document layout in ProseMirror core | Steal failure taxonomy: BFC blocks, tables, print/export, templates, and semantic risk of manual node splitting | CSS float trick; manual AST splitting; raw Plite depending on a product TableKit | Provider-owned unit/split policy over derived fragments; no AST mutation for layout | agree |
| `../virtual` browser tests | `../virtual/packages/react-virtual/e2e/app/test/scroll.spec.ts:54-112`, `measure-element.spec.ts:3-42`, `stale-index.spec.ts:3-38` | Playwright tests start at offset, perform user-like scroll, assert visible indexes and contiguous geometry, then stress resize/delete/stale-key paths | Passing only programmatic `scrollToIndex` or one `scrollTop` jump | Add video-class wheel/repeated-scroll rows, no gaps/overlaps, visible-content assertions, dynamic resize/delete proof, and stale path/key guards | Fixed sleeps as primary proof; list-only assumptions | Poll geometry, DOM counts, frame/long-task budgets, and editor state after real scroll sequences | agree |
| `../pierre` trees | `../pierre/packages/trees/test/file-tree-virtualization-window.test.ts:38-85`, `87-188`, `189-329`, `331-443`, `445-532` | Deterministic unit tests for visible window math, selected/focused retention, scroll-to-path without DOM focus theft, offsets, invisible projection paths, sticky ancestors, scrolling state, and collapse coherence | Browser-only tests hiding broken range math | Add pure page-mount/window tests for viewport/overscan, selected/composing/promoted retention, invisible projection no-ops, sticky/page chrome offsets, and collapse/edit coherence | Treat jsdom/unit proof as browser perf proof | Split math tests from browser replay: fast unit tests prove range decisions; Playwright proves human scroll and rendering | agree |
| `../pierre` diffs | `../pierre/packages/diffs/src/components/Virtualizer.ts:20-38`, `76-117`, `288-385`, `387-437`; `../pierre/packages/diffs/src/react/CodeView.tsx:762-800` | Pragmatic large diff virtualizer: passive scroll listeners, queued render, dirty flags, big pixel overscan, scroll anchors/repair, and user intent cancellation | Programmatic scroll fighting user scroll; Safari blanking in huge code views | Keep scroll ownership explicit, queue/coalesce range recompute, anchor visible content when measurements shift, cancel pending programmatic scroll on real user intent | Blindly copy 1000px overscan/Safari hacks into core Plite; expose debug globals | Core proof should make blanking impossible by window correctness first; browser-specific hacks stay gated fallback evidence | partial |
| `Plate repo root` current owners | `packages/plite-layout/src/react.tsx:46-61`, `197-226`, `509-620`; `packages/plite-layout/src/page-mount-plan.ts:57-205`; `apps/www/tests/plite-browser/donor/examples/pagination.test.ts:660-691` | Existing Plite code already has page indexes, content range filtering, selected-path retention, derived page mount plans, and bounded-DOM one-jump proof | Starting from scratch | Preserve the owner split and add coalesced viewport/window-index updates plus stronger browser tests | Treat the current one-jump test as release proof | Execute against existing `plite-layout`/example/test owners after user accepts the plan | revise |

Ecosystem maintainer pass:
| System | High-risk pressure checked | Keep | Tighten | Reject / do not copy | Result |
|--------|----------------------------|------|---------|----------------------|--------|
| TanStack Virtual | Overscan, scroll state, stable keys, retained ranges, and measurement snapshots | Internal range discipline: stable keys, `rangeExtractor`, `isScrolling`, measurement snapshot/restore concepts | Treat `overscan` as a tradeoff and diagnostic, never as the architecture; map retained editor paths through Plite-owned windows | Public TanStack passthrough, smooth scroll as proof, or blindly enabling measurement rAF behavior | no strategy change |
| Pretext/Premirror | Pagination fidelity, text measurement drift, and export/collab claims | Derived layout snapshots and cheap hot-path relayout | Keep strict page-break fidelity as optional authoritative snapshot/profile state | Default cross-client byte-identical page breaks while canvas/browser-profile measurement remains in play | no strategy change |
| Tiptap Pages | Table spanning pages and BFC limits | Failure taxonomy for tables/media/print/export | Plite table/media split policy must be provider-owned derived layout, not model mutation | CSS-float pagination, product TableKit dependency, or manual AST splitting in core Plite | no strategy change |
| `../virtual` browser tests | Current one-jump proof missed the user video path | User-scroll-like browser proof plus visible geometry/content assertions | Add repeated wheel/continuous-scroll replay, no blank/gap/overlap checks, and stale key/path guards | Fixed sleeps or list-only assumptions as primary proof | tightened proof gates |
| `../pierre` trees | Range math, focused/selected retention, scroll-to-path, sticky offsets, collapse coherence | Fast deterministic window math as unit coverage | Add page-window and child-range unit contracts before relying on browser traces | Treat jsdom/unit proof as browser perf proof | tightened unit-test target |
| `../pierre` diffs | Fast-scroll blanking, queued renders, scroll anchors, user-intent cancellation | Queue/coalesce render range work and anchor visible content when measurements shift | Keep large overscan and browser-specific repair as fallback evidence only | Copy debug globals, 1000px overscan default, or broad DOM fallback into core Plite | partial only |
| React runtime | Visible editor content must stay urgent during scroll | Passive listeners, refs for transient scroll geometry, stable state keys | rAF/window-key gating is allowed only when visible content remains synchronized | `startTransition`, `Activity`, or deferred rendering as the editor-body fix | no new React substrate |

Research refresh conclusions:
| Evidence | What it changed | Plan effect |
|----------|-----------------|-------------|
| TanStack docs/source | Overscan is a blanking tradeoff, not the architecture; snapshots and stable keys matter for restoration and churn | Keep overscan as a small control, but make window correctness and measurement retention the real fix |
| Pretext source/status | Pretext is fast because the hot layout path is arithmetic-only, but current measurement remains canvas/browser-profile dependent | Keep local fast layout as the default; design authoritative page-break snapshots as a clean extension point |
| Tiptap Pages docs | Product-grade table pagination requires owning table layout; manual splitting changes semantics | Do not split Plite AST tables; add provider-owned unit/split policy later if needed |
| `../virtual` tests | Real scroll + geometry assertions catch the class missed by a synthetic jump | Browser proof must replay continuous/wheel scroll and assert no visible blank/gap/overlap |
| `../pierre` tests/source | Fast deterministic window math belongs in unit tests; browser hacks are last-resort evidence | Add a two-layer test strategy: unit range math plus Playwright user-scroll replay |

Revision pass final architecture:
| Decision | Final shape | Not in the plan | Execution proof |
|----------|-------------|-----------------|-----------------|
| Public API | Keep the existing Plite-shaped `domStrategy={{ type: 'virtualized', overscan }}` surface | `pageVirtualization`, public TanStack passthrough, public renderer child-window slot | Example call site stays compact and URL controls remain example-only |
| Page windowing | One `plite-layout` page-window snapshot feeds page chrome, `EditableLayout`, visible content range, and page-derived retained paths | Independent page chrome and editable virtualizer windows | Unit coherence tests plus Playwright visible page/content assertions |
| Scroll updates | Raw scroll geometry lives in refs; React state changes only when page-window key or content corridor changes | Pixel-level React state churn or transition-based masking | Browser replay records no blanks, event-to-paint percentiles, long tasks, dropped frames, and DOM/page/row/cell counts |
| Page mount math | Private indexed helpers build page/spread items and derive visible item ranges without full hot-path scans | Public virtualizer manager, broad per-scroll scans as final design | `plite-layout` contract tests cover viewport, overscan, retention, and old-window unmount |
| Table/media split policy | Derived fragments/units plus provider-owned layout policy later | AST table splitting, product TableKit dependency, CSS-float pagination | Table spanning pages keeps model stable and uses child-range/materialization counters |
| Child materialization | Internal `EditableLayout` child-range planning keeps visible/selected/composing children materialized | App-only `Children.toArray(children).slice(...)` as final answer | Row/cell component budgets follow visible and retained ranges, not total table rows |
| Native behavior | Virtualized paged mode is explicit degraded mode until each behavior is classified | Native find/a11y/copy/IME/mobile parity claims for unmounted content | Behavior matrix: native, model-backed, materialize-first, unsupported, or opt-in-only |
| Strict fidelity | Optional authoritative page-break snapshot/profile for apps that need it | Default cross-client byte-identical page breaks or synced viewport state | No issue/PR claim promotion until explicit collab/export proof exists |

Performance / DX / migration / regression / simplicity pressure pass:
| Lens | Pressure applied | Keep | Revise / add | Reject | Evidence |
|------|------------------|------|--------------|--------|----------|
| Performance cohorting | The plan needs named cohorts, not "large doc" vibes | normal/medium stay native or staged; virtualized paged mode is for stress/pathological examples | Define default proof cohort as `~1000 pages + 10-page table`; pathological cohort is `>2000 pages`, custom renderers, comments/annotations, mobile/IME, or collab churn | Claiming generic large-doc readiness from one pagination example | `performance` cohort rule; example defaults/maxes at `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:83-124` |
| Repeated-unit budget | The hot units are page surfaces, top-level virtual rows, table rows/cells, hidden boundaries, and DOM nodes | Current proof already tracks pages/rows/cells/DOM | Add target budgets: default stress page surfaces <= 8, overscan-4 <= 14, visible table rows <= 80 default, selected-row retention <= 220 rows / <= 660 cells, DOM < 1400 default and < 3600 overscan-4; browser trace must record heap/listener/boundary tags | Broad overscan as the fix | `apps/www/tests/plite-browser/donor/examples/pagination.test.ts:632-759`; memory/DOM tagging rule |
| Interaction metrics | Scroll breakage is an interaction problem, not a static DOM-count problem | Keep bounded DOM checks as necessary but insufficient | Add p50/p75/p95/p99 event-to-paint for wheel/continuous scroll, max long task, dropped-frame count, and no visible blank/gap/overlap after every scroll burst | Average-only compose timing or one `scrollTop` jump as proof | `apps/www/tests/plite-browser/donor/examples/pagination.test.ts:660-691`; interaction INP rule |
| React runtime | Visible editor content is urgent; page/window recompute is scroll-external sync | Keep passive scroll listeners and TanStack range extraction | Use rAF coalescing, refs for raw transient scroll values, stable window keys, and React Performance Tracks when render breadth is suspicious; do not rely on `startTransition` to hide a broken visible window | React `Activity` or transitions as editor-body virtualization primitives | `packages/plite-layout/src/react.tsx:496-549`; react-useeffect and React 19 runtime rules |
| Algorithmic complexity | Current helpers still have broad scans that are acceptable at 1k but not the best architecture | Keep derived page items and maps | Build page/fragments/unit indexes once; derive visible page item range by key/binary lookup; index path-to-page for selected deep rows | Per-scroll filtering of all page items or per-selection scans through every page item as the durable design | `packages/plite-layout/src/page-mount-plan.ts:73-83`, `177-205`; `packages/plite-react/src/dom-strategy/use-virtualized-root-plan.ts:244-270` |
| Renderer DX | Example renderers should receive only the child ranges core intends to materialize, not hand-roll row slicing after eager child creation | Keep `slots.contentBoundary` semantics for native-behavior contracts | Add internal `EditableLayout` child-range planning first; reopen public renderer API only with failing proof plus a separate maintainer review | Public table-specific API, TableKit, app-only slicing, or public renderer slots as the default solution | `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:228-290`; `packages/plite-react/src/components/editable-text-blocks.tsx:454-568`, `1030-1148` |
| Migration | Layout windows must remain derived/local | Keep page-break snapshot as optional authoritative state | Plate can provide row/unit layout policy through node layout units; slate-yjs should sync document ops and optional page-break snapshots, not viewport windows | AST table splitting or synced viewport/mount state | `packages/plite-layout/src/index.ts:2369-2413`; Tiptap research |
| Simplicity | The best fix is one small shared window contract, not a new virtualization framework | Keep `domStrategy` as the public knob | Add private page-window helpers and internal child-range planning; inline example-only stress logic stays local | `pageVirtualization` prop, public TanStack config, public child-window slot as the starting point, giant "virtualization manager" abstraction | Plite Plan simplicity lens |

Performance pass record:
- applicability: applied.
- Vercel rules used: `client-passive-event-listeners`,
  `rerender-use-ref-transient-values`, `rerender-dependencies`,
  `js-index-maps`, `js-combine-iterations`, and `js-set-map-lookups`.
- extra performance rules used: cohort segmentation, repeated-unit budget,
  interaction INP matrix, memory/DOM tagging, degradation contract,
  editor-native-behavior proof, React 19 runtime proof, and CSS/layout hot path.
- repeated unit: page mount items, page surfaces, editable virtual rows, table
  row/cell units, hidden DOM-coverage boundaries, and visible stress-page boxes.
- cohorts: normal 0-500 top-level blocks native/staged; medium 500-2000
  native/staged with budgets; stress roughly 1000 paged surfaces plus table
  units; pathological >2000 pages, custom renderers, comments, mobile/IME, or
  collab churn.
- budgets: default virtualized pagination keeps page surfaces <= 8, rows <= 80,
  cells <= 240, DOM < 1400 after table scroll; overscan-4 remains <= 14 page
  surfaces and DOM < 3600; selected row 120 remains editable with rows <= 220
  and cells <= 660.
- React/runtime primitives: passive listeners plus rAF/window-key gating; React
  transitions/Activity are not the editor-body fix.
- interaction metrics: browser replay must record wheel/continuous-scroll
  p50/p75/p95/p99 event-to-paint, max long task, dropped frames, and no visible
  blank/gap/overlap.
- trace/CWV proof: Chrome interaction trace or equivalent Playwright
  performance sampler; page-load Core Web Vitals are out of scope.
- memory tags: DOM node count, page surface count, row/cell count, hidden
  boundary count, virtualized measured count, heap if trace harness supports it.
- degradation contract: virtualized paged mode is explicit degradation for
  stress cohorts until browser find, screen reader, native selection, copy,
  paste, select-all, IME, mobile, undo/history, and collaboration rows are
  classified as native, model-backed, materialize-first, unsupported, or
  opt-in-only.
- dashboard/RUM gap: future production tags should include example/surface,
  `strategy`, page count, row count, page overscan, browser, device class,
  visible page window, mounted rows/cells, DOM nodes, and interaction name.
- plan delta: one shared page-window authority becomes mandatory; renderer
  child-windowing is internal `EditableLayout` child-range planning. Public
  renderer child-window API is not in the accepted plan.

Legacy regression proof matrix:
| Regression class | Legacy behavior | Plite target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| Fast scroll through paginated table | User can scroll without visible blank/stall | Wheel/repeated scroll through rows 1..240 and into stress tail keeps content mounted and bounded | Playwright browser replay with frame/DOM probes | execution plan | execution gate |
| Page surface windowing | Offscreen pages do not mount | 1000-page doc mounts only visible pages plus overscan | Unit and browser budget | execution plan | execution gate |
| Selection in virtualized table | Selected row stays editable even off normal viewport corridor | Retain selected/composing/promoted paths | Playwright edit at row 120 after scroll | existing row plus revised proof | execution gate |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| Pagination table fast scroll | Replay video: continuous wheel/trackpad-like scroll from table start into tail | Chromium first; Safari/WebKit later if stable | `Plate repo root` Playwright focused test | no visible blank page windows, p95 event-to-paint <= 32ms, no long task > 50ms, dropped frames recorded | execution gate |
| 1000-page tail | Jump and continuous scroll across sparse tail | Chromium | Playwright with DOM counters and visible-label assertions | page surfaces <= budget, rows/cells <= budget, visible stress content present, no accidental blank page | execution gate |
| Window math | Page/spread item range for viewport and overscan | bun/jsdom/unit | `plite-layout` page-mount-plan test | exact item indexes; old windows unmount; selected/composing/promoted paths retained | execution gate |
| Renderer child windowing | Multi-page table row window | unit plus Playwright | internal `EditableLayout` child-range path proves hidden rows are not mounted and not eagerly rendered as row components; public slot only if internal proof fails | row/cell component budget follows visible ranges, not total table rows | execution gate |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| Current source has page surface and unit windowing owners | plate-2 read of `Plate repo root` | `nl -ba packages/plite-layout/src/react.tsx ...` | read | current pass |
| User video repro evidence exists | plate-2 temp read | `ffprobe ... 2026-05-28 at 09.18.04.mp4`; contact sheet via `/tmp` | 4.625s, 2178x1838, table fast-scroll into blank page windows | current pass |
| Runtime behavior fixed | `Plate repo root` | focused browser replay | not claimed by planning; required after accepted execution | execution |

Autoreview workspace gate:
| Reviewed patch owner | Cwd | Command | Result | Notes |
|----------------------|-----|---------|--------|-------|
| planning-only current pass | plate-2 | N/A | N/A | no new implementation execution after this plan activation |
| accepted Plite implementation | `Plate repo root` | `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local` | execution gate | execution-only |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | yes | applied | Relevant rules are passive scroll listeners, transient refs for frequent scroll values, primitive deps, indexed maps, and combining hot loops | Require rAF/window-key gating and indexed page/unit lookups before execution can claim perf |
| performance-oracle | yes | applied | Current broad scans are acceptable at 1k pages but not the best long-term hot path; renderer child allocation is the sharper risk | Add O(pages + fragments + units) mount-plan target and avoid full child React-element creation for hidden table rows |
| performance | yes | applied | Repeated page/table units need cohort, INP, memory/DOM, and degradation rows | Added full pressure pass record and concrete DOM/page/row/cell budgets |
| tdd | yes | applied | Current tests are too implementation-light for the user video path | Execution must start with one failing browser replay row plus unit range-math rows before runtime changes |
| shadcn | limited | skipped for this pass | Example controls are not the bottleneck; adding controls before behavior proof is noise | Keep existing URL-backed controls; revisit only in example DX execution phase |
| react-useeffect | yes | applied | Scroll/resize observers are valid effects because they sync browser APIs, but raw scroll values should not become React state on every pixel | Use refs + rAF and state only for stable window keys/corridor changes |
| code-simplicity-reviewer | yes | applied | A new public virtualization subsystem would be overkill; one shared page-window helper is justified by duplicated window authority | Reject `pageVirtualization`, public TanStack passthrough, and generic manager abstractions |

High-risk deliberate-mode pre-mortem:
| Risk | Temptation | Worst failure | Source pressure | Mitigation | Proof gate | Verdict |
|------|------------|---------------|-----------------|------------|------------|---------|
| Blank visible pages during fast scroll | Treat it as fixture sparsity or increase overscan | User scrolls into an accidental empty page window while the editor still reports bounded DOM | `PagedEditable` updates viewport from scroll/resize at `packages/plite-layout/src/react.tsx:509-536`; current browser proof jumps once at `apps/www/tests/plite-browser/donor/examples/pagination.test.ts:660-670` | Distinguish deliberate sparse fixture from missing materialization with visible stress labels and no-blank viewport assertions after each scroll burst | Playwright wheel/continuous-scroll replay asserts visible page/table/stress labels in the viewport after every burst | complete: must fail on blanks, not just count DOM |
| False green scroll proof | Keep the existing direct `scrollTop` jump | Test passes while real trackpad/wheel scroll freezes | Existing test mutates `scrollTop` and waits two rAFs at `apps/www/tests/plite-browser/donor/examples/pagination.test.ts:660-670`; memory notes say static bounded-DOM claims are not enough | Add a reusable user-scroll helper with repeated wheel deltas, sampled frames, and poll-based geometry/content assertions | Browser row records p50/p75/p95/p99 event-to-paint, max long task, dropped-frame count, and final visible content | complete: direct jump can remain as secondary proof only |
| Overscan overfitting | Hide the race by mounting more pages | DOM/memory grows and still blanks on fast machines, slow machines, or huge docs | Page overscan is URL-backed at `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:111-136`; current proof checks more pages at `apps/www/tests/plite-browser/donor/examples/pagination.test.ts:708-732` | Keep overscan as a knob, not the fix; correctness comes from shared window state and child ranges | Overscan-1 and overscan-4 both pass no-blank and bounded DOM/page/row/cell budgets | complete: overscan is diagnostic/escape hatch |
| Dual-window drift | Let `PagedEditable` and `Editable` each compute their own virtual ranges | Page chrome and editable content disagree during fast scroll | `PagedEditable` exposes page layout items at `packages/plite-layout/src/react.tsx:550-592`; `Editable` builds a separate virtualizer at `packages/plite-react/src/dom-strategy/use-virtualized-root-plan.ts:407-422` | Use one layout-owned page-window snapshot through `EditableLayout`; compare mounted page indexes against visible editable ranges | Unit contract plus browser assertion proves page surface indexes, editable page items, and visible labels agree | complete: shared authority stays mandatory |
| Eager child allocation behind sliced rows | Stop at app-renderer `Children.toArray(children).slice(...)` | Hidden table rows still create React elements, so scrolling stays expensive | Example slices children at `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:237-265`; core creates child elements before renderers at `packages/plite-react/src/components/editable-text-blocks.tsx:1030-1148` | Implement internal `EditableLayout` child-range planning; do not add public renderer API in this plan | Row/cell component counters follow visible/selected/composing ranges, not total table rows | complete: internal first |
| Selected/composing content unmounts | Filter only by viewport | User loses caret/edit state when the selected row exits the normal corridor | Current retained range logic maps selected paths to page items at `packages/plite-react/src/dom-strategy/use-virtualized-root-plan.ts:371-397`; layout unit tests retain selected/promoted/composing pages at `packages/plite-layout/test/page-layout-contract.test.ts:1744-1778` | Preserve selected/composing/promoted paths through both page-window and child-range plans | Edit row 120 and composing-path proof remains mounted with bounded rows/cells | complete: retention is non-negotiable |
| Native behavior degradation hidden behind "virtualized" | Claim browser-native parity for unmounted content | Find, a11y, copy, selection, IME, or mobile regressions become surprise bugs | Current hidden boundaries set `findPolicy: 'not-native-until-mounted'` and `selectionPolicy: 'materialize'` in `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:243-258`, `270-285` | Classify each behavior as native, model-backed, materialize-first, unsupported, or opt-in-only before claiming parity | Degradation matrix is part of execution acceptance; no production-ready claim until rows are proven | complete: degraded mode stays explicit |
| Sparse fixture confused with runtime blank | Count stress pages but render blank-looking pages | The test cannot tell expected sparse pages from broken materialization | Stress pages currently render labels at `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:426-431`; current proof counts stress pages at `apps/www/tests/plite-browser/donor/examples/pagination.test.ts:642-646` | Assert actual visible text/geometry, not just total page count | Browser replay checks viewport text or page labels after fast scroll into stress tail | complete: visible labels required |
| Proof flakiness | Use fixed sleeps or two-rAF waits as the main signal | CI alternates between false pass and false fail | Current jump waits two rAFs at `apps/www/tests/plite-browser/donor/examples/pagination.test.ts:666-669`; scaled test also waits two rAFs at lines 850-852 | Prefer `expect.poll` over stable geometry/content/counters and collect perf samples separately | Tests poll for stable state, then report sampled frame/long-task metrics | complete: fixed rAF is only a settling helper |
| CI/runtime cost explosion | Put a 1000-page wheel trace in every browser/profile | Slow suite trains everyone to skip the proof | Example defaults to 990 stress pages and max 2000 at `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:89-96`, `121-124` | Keep one focused Chromium stress row in iteration; wider browser/device proof is release-gated | Focused test is tagged/isolated, with smaller unit range tests covering most permutations | complete: expensive proof is scoped |
| Measurement/collab overclaim | Promise identical page breaks across peers | Local browser measurement drift leaks into collab/export claims | Plan already records Pretext canvas/browser-profile drift and `plite-layout` page-break snapshot support | Keep viewport/window state local; strict page-break fidelity uses optional authoritative snapshots only | PR/reference rows keep production-ready virtualization and deterministic export/collab unclaimed | complete: no claim promotion |

Plite maintainer objection ledger:
| Change | Objection | Tradeoff | Evidence | Migration/docs/proof answer | Verdict |
|--------|-----------|----------|----------|-----------------------------|---------|
| Make scroll stress a release gate | "Why are examples dictating package gates?" | More browser time in CI | User video shows the example is the only current proof surface for paged virtualization; PR reference does not claim production-ready virtualization | Keep one focused Chromium row in iteration; broaden only before a production/release claim | keep |
| One shared page-window authority | "This couples `plite-layout` and `plite-react` too tightly." | More explicit internal contract | `PagedEditable` and `Editable` currently derive page/layout windows separately | Pass layout-owned window data through `EditableLayout`; keep public API at `domStrategy` | keep |
| Indexed page/unit range helpers | "This is premature optimization for 1000 pages." | More helper code and tests | Page mount plan creation/filtering still scans broad item sets; user wants fast-scroll through about 1000 pages | Add only if browser/unit proof shows the scan contributes; keep helper private to `plite-layout` | keep, proof-gated |
| rAF/window-key scroll gating | "It could delay visible content." | Less immediate pixel-level state | Current viewport effect writes state from raw scroll/resize; blanks mean the visible window is not materializing in time | Coalesce raw pixels, not semantic windows; assert no visible blank after every wheel burst | keep |
| Internal `EditableLayout` child-range plan | "This leaks table pagination into core Editable." | New internal layout contract | `EditableDescendantNode` creates child React elements before example renderer slicing; hidden rows can still allocate | Make it path/range based and generic; retain selected/composing/promoted paths; no table-specific API | keep |
| Public renderer child-window slot | "Another unstable renderer API before beta." | Better app escape hatch, but wider public surface | `EditableElementSlots` are already unstable; PR reference says stable DOM coverage slot API is not claimed | Reject as default. Execution must first prove internal child ranges cannot preserve renderer composition | reject by default |
| Native behavior degradation | "Virtualization breaks find, a11y, copy, selection, IME, and mobile." | Honest degraded mode instead of fake parity | PR reference explicitly says virtualized editing still needs stricter caret/IME/mobile/copy/find proof | Keep virtualized paged mode explicit/degraded until behavior rows are classified | keep |
| Production-ready virtualization claim | "The plan overclaims readiness." | Slower narrative | PR reference keeps production-ready virtualization unclaimed | Keep issue claims as related/proof-backlog only until browser gates pass | keep |
| TanStack as implementation detail | "Why not expose TanStack directly?" | Less configurability for power users | `Editable` already uses TanStack-like internals, but Plite users should not learn a virtualizer engine | Use stable keys/ranges/snapshots internally; no public TanStack passthrough | keep |
| Collab/export page-break fidelity | "Local measurement drift can desync peers and exports." | Optional authoritative state later | Pretext measurement is canvas/browser-profile dependent; `plite-layout` already has page-break snapshot read/write | Default local derived layout; strict fidelity through opt-in authoritative page-break snapshots | keep |
| AST table splitting | "Tiptap uses product table pagination; maybe Plite should split nodes." | Layout gets easier, model gets worse | Tiptap docs call out table-specific product behavior and semantic cost of manual splits | Derived fragments and provider-owned units only; Plite AST stays stable | reject |
| Large overscan fallback | "Overscan more pages and ship it." | Simpler, but DOM/memory grows and still misses scheduler bugs | TanStack frames overscan as blanking/render-cost tradeoff; Pierre overscan is a browser fallback, not architecture | Keep small overscan control; correctness comes from shared windows and child ranges | reject |
| URL/stress controls | "Controls pollute the example." | Slightly busier example | User needs inspectable 1000-page and 10-page-table repro from URL | Keep controls virtualized-only and proof-driven; no product settings in core | keep |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| AST table splitting for pagination | reject | It mutates document semantics for layout | High | Pretext/Tiptap research | keep derived fragments |
| Public TanStack virtualizer options | reject | Leaks implementation engine into Plite API | Medium | TanStack research | keep Plite-shaped props |
| Public renderer child-window slot as default | reject | Expands unstable renderer API before internal range planning is proven insufficient | Medium | maintainer objection ledger; PR reference | keep internal child-range planning first |
| Programmatic jump-only scroll test | cut | It missed the user video failure | Low | current test lines 660-691 | replace with user-scroll replay |

Plan deltas from review:
- Created Plite Plan artifact from template.
- Demoted prior local "done" fast-scroll plan to evidence only; user video kept
  this planning lane active until final closure.
- Added video-backed failure shape.
- Added sibling-repo test inspiration rows from `../virtual` and `../pierre`.
- Added target split between page shell window and content-unit window.
- Added execution proof gates for real scroll replay and frame/DOM budgets.
- Completed related issue discovery: `#5944` and `#790` are the direct related
  issues, with no fixed/improved claim; rerender, scroll-selection, a11y, and
  large-document operation issues stay as guardrails or explicit non-claims.
- Reused existing matrix/dossier/PR rows instead of creating duplicate heavy
  ledger entries. The claim set did not change.
- Completed full issue-ledger/reference pass: added the current plan's manual
  sync note to `docs/plite-issues/gitcrawl-v2-sync-ledger.md`; left fork
  dossier, issue coverage matrix, and PR description unchanged because their
  current rows already match the no-claim boundary.
- Completed intent/boundary and decision-brief pass: selected Plite-owned
  two-window materialization, rejected public `pageVirtualization`, rejected
  AST table splitting, and made visible accidental blanks a test failure.
- Completed research/ecosystem/live-source refresh: TanStack Virtual is
  internal range inspiration only; Pretext supports derived layout plus an
  optional authoritative snapshot extension; Tiptap confirms AST/table product
  splitting is the wrong core default; `../virtual` and `../pierre` define the
  two-layer test strategy.
- Completed performance/DX/migration/regression/simplicity pressure pass:
  strengthened the plan from two loosely related windows to one shared
  page-window authority, required indexed page/unit range helpers, added
  scroll INP/DOM/memory budgets, and identified eager hidden-child creation as
  the renderer/runtime pressure to prove.
- Completed Plite maintainer objection ledger: kept shared page windows,
  rAF/window-key gating, indexed private range helpers, explicit degraded-mode
  behavior rows, and URL-backed stress controls; demoted a public renderer
  child-window slot to last resort behind an internal `EditableLayout`
  child-range plan.
- Completed high-risk deliberate mode: converted the likely failure modes into
  hard execution gates for video-class scroll replay, shared window coherence,
  child-range materialization, retention/editing, native behavior contract,
  perf budgets, and CI cost control.
- Completed ecosystem maintainer pass: confirmed high-risk hardening does not
  justify a new public API, AST table splitting, Product TableKit dependency,
  strict default export/collab fidelity claim, or copied overscan/browser hacks;
  it only tightens which mechanics Plite should steal from the reference
  systems.
- Completed revision pass: collapsed the plan to one accepted architecture,
  removed public renderer-slot candidate language from the main path, separated
  planning closure evidence from execution-mode browser proof, and raised only
  evidence-backed score rows.
- Completed issue-sync accounting pass: re-audited the final revised plan
  against the manual v2 sync ledger, coverage matrix, fork dossier, and PR
  reference; added only a final no-claim-change sync note.
- Completed closure score and final gates pass: raised the scorecard to 0.935
  for plan readiness, resolved workspace/autoreview/final-handoff gates for
  planning, and kept runtime/browser proof as execution acceptance instead of a
  current fix claim.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Is the blank tail expected sparse stress content or actual delayed materialization? | Avoid fixing the wrong thing | Browser replay with visible stress content labels and mount counters | execution plan | execution gate |
| Does current scroll update fire enough React state changes to cause stalls even after unit filtering? | Decides exact rAF/window-key implementation details | Performance sampler around scroll handler and render commits | execution trace | execution gate |
| Does the existing issue-ledger coverage need edits after the full ledger pass? | Avoid duplicate accounting while keeping PR/reference claims honest | Full ledger pass over matrix/dossier/reference rows | issue-sync pass | resolved: final sync ledger note added; matrix/dossier/PR did not need edits |
| Can internal `EditableLayout` child-range planning avoid eager hidden child creation without a public renderer slot? | This decides whether this plan stays private-only | Unit/browser proof that hidden table rows are not created, mounted, or counted outside visible/selected/composing ranges | execution trace | resolved for planning: internal-only; public API would need a separate maintainer review |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| 1. Test harness | slate-plan execution mode | Add scroll replay helper with wheel/continuous scroll, frame sampler, DOM/page/row/cell counters, no-visible-blank assertion | accepted plan | failing/passing browser row matches video class | focused Playwright |
| 2. Unit window math | slate-plan execution mode | Add page-mount-plan/window tests inspired by `../pierre`, including indexed build/range helpers and selected/composing retention | phase 1 shape accepted | exact page item ranges, old windows unmount, retained paths survive | `bun test ./packages/plite-layout/...` |
| 3. Runtime windowing | slate-plan execution mode | One shared page-window authority, rAF/window-key scroll update gating, selected/composing retention | failing tests | browser and unit budgets green | `Plate repo root` focused gates |
| 4. Renderer child windowing | slate-plan execution mode | Remove eager hidden-row child rendering if confirmed by failing proof; implement internal `EditableLayout` child-range planning first | runtime window proof green | hidden table rows do not create/mount row/cell components during scroll; no public renderer slot added in this plan | unit plus Playwright budget |
| 5. Example DX | slate-plan execution mode | Clear virtualized stress content and controls | runtime proof green | user can inspect 1000-page stress/doc state from URL | Playwright route proof |
| 6. Sync/review | slate-plan execution mode | changeset, ledgers, PR reference, autoreview | implementation green | no accepted/actionable autoreview findings | autoreview from `Plate repo root` |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact check | plate-2 | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-pagination-fast-scroll-virtualization.md` | closure state only | closure pass |
| Plite current source read | plate-2 | `nl -ba packages/plite-layout/src/react.tsx ...` | source owners | complete |
| Video evidence | plate-2 | `ffprobe` plus `/tmp/codex-pagination-scroll-video/contact.jpg` | table fast scroll into blank windows | complete |
| Browser replay | `Plate repo root` | focused Playwright scroll replay | real regression proof | execution gate |
| Package proof | `Plate repo root` | `bun --filter plite-layout typecheck` and focused tests | runtime/type safety | execution gate |

High-risk execution acceptance gates:
| Gate | Must prove | Rejects | Owner | Status |
|------|------------|---------|-------|--------|
| Video-class scroll replay | Repeated wheel/trackpad-like scroll through the 10-page table into the stress tail never shows accidental blanks | One `scrollTop` jump, DOM counts without visible content, fixed sleeps as proof | Playwright | execution gate |
| Shared window coherence | Page surfaces, editable page items, visible labels, and content corridor agree for each sampled viewport | Independent page chrome/editable windows drifting under scroll | `plite-layout` plus `plite-react` | execution gate |
| Child-range materialization | Hidden table rows/cells are neither mounted nor eagerly created outside visible/selected/composing ranges | App-only `Children.toArray(children).slice(...)` as the final answer | `plite-react` internal layout plan | execution gate |
| Retention and editing | Selected row 120 and composing/promoted paths survive scrolling and edits with bounded row/cell/DOM counts | Viewport-only filtering that breaks caret/editing | `plite-react` and Playwright | execution gate |
| Native behavior contract | Each virtualized degradation is named as native, model-backed, materialize-first, unsupported, or opt-in-only | Claiming native browser parity for unmounted content | docs/tests | execution gate |
| Perf budget | Scroll replay records event-to-paint percentiles, max long task, dropped-frame count, page surfaces, rows, cells, DOM nodes, and optional heap | Average-only timing or page-load CWV | Playwright perf sampler | execution gate |
| Cost control | One focused Chromium stress row plus fast unit math rows carry iteration; broader browser/device rows are release gates | Running huge traces everywhere | test plan | execution gate |

Final user-review handoff outline:
- accepted plan items: one Plite-owned page-window authority; a second
  content-unit corridor for expensive split blocks; internal
  `EditableLayout` child-range planning; URL-backed example stress controls;
  video-class browser replay plus fast unit window math.
- before / after API shape: public API remains
  `domStrategy={{ type: 'virtualized', overscan }}`; no `pageVirtualization`,
  no public TanStack passthrough, no public renderer child-window slot, and no
  AST table splitting.
- hard cuts: programmatic jump-only proof is insufficient; overscan is only a
  diagnostic/control; product TableKit and manual table-node splitting stay out
  of raw Plite.
- issue claims and non-claims: no fixed/improved claim is added; `#5944` stays
  issue-reviewed, `#790` stays proof-route backlog, rerender/scroll/a11y/custom
  rows stay guardrails or non-claims, and existing large-document improves
  remain owned by their prior proof rows.
- proof gates: execution starts with failing browser replay for the attached
  video class, then page-window/unit tests, runtime windowing, child-range
  materialization, example DX, sync, and autoreview from `Plate repo root`.
- accepted-plan execution handoff: create a separate execution goal only after
  user acceptance; run implementation and proof from `Plate repo root`.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence; weighted total is 0.935 and lowest dimension is 0.92 | complete |
| all pass rows complete or skipped with evidence | phase/pass table closed through closure score and final gates | complete |
| issue/reference sync closed | issue-ledger sync status closed; final v2 sync note added with no PR/matrix/dossier changes | complete |
| live source grounding complete | source-backed rows cite current `Plate repo root` owners and sibling references | complete |
| workspace verification recorded | verification workspace gate distinguishes planning evidence from deferred execution proof | complete |
| autoreview clean or N/A | N/A for planning closure because no implementation files were edited in this final pass; execution requires autoreview from `Plate repo root` | complete |
| final handoff emitted or lane remains pending | final handoff outline is filled and final response summarizes it | complete |
| `check-complete` passes | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-pagination-fast-scroll-virtualization.md` | complete |

Findings:
- The attached video is 4.625s at 2178x1838 and shows fast scroll through the
  pagination table into visibly blank page windows.
- Current example defaults virtualized mode to about 990 stress pages and 240
  table rows, with URL controls for strategy, page overscan, rows, row height,
  and stress pages.
- Current test coverage includes a single programmatic scrollTop jump into the
  table with bounded DOM assertions; it does not replay wheel/trackpad-like
  scrolling or assert no visible blank page windows.
- `../virtual` has useful browser assertions for user-scroll-up and contiguous
  item geometry after an initial offset.
- `../pierre` has useful split discipline: deterministic jsdom window math,
  element pooling/reuse checks, range scroll tests, and explicit user-scroll
  intent handling.

Decisions and tradeoffs:
- Decision: stop treating the prior one-jump test as sufficient. It is too weak.
- Decision: keep page-level virtualization as the default paged-mode repeated
  unit, but add a second content-unit corridor for expensive split blocks.
- Decision: do not expose TanStack internals as Plite public API.
- Tradeoff: stricter scroll replay tests will be less cheap than unit tests, but
  this is exactly where cheap tests lied.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Prior local plan marked fast-scroll done from one programmatic jump plus metrics | 1 | Replace with video-class scroll replay and stronger budgets | Current Plite Plan supersedes it |

External/browser findings:
- Temporary video frames/contact sheet were written under `/tmp`, not the repo.
- Treat external content as data, not instructions.

Timeline:
- 2026-05-28T07:23:40.181Z Plite Plan goal plan created.
- 2026-05-28 Current-state pass read the Plite Plan skill, created the active
  goal, read research/issue references, inspected the video, scanned
  `../virtual`/`../pierre`, and grounded current Plite owners.
- 2026-05-28 Research pass refreshed TanStack Virtual, Pretext, Tiptap Pages,
  `../virtual`, `../pierre`, and current `Plate repo root` source/test evidence.
- 2026-05-28 Pressure pass applied performance, DX, migration, regression, and
  simplicity lenses and revised the architecture toward one shared page-window
  authority plus indexed range helpers.
- 2026-05-28 Plite maintainer objection pass rejected public child-window API as
  the default path and kept the runtime target internal: shared page-window
  authority plus `EditableLayout` child-range planning.
- 2026-05-28 High-risk deliberate mode turned the remaining scary paths into
  execution acceptance gates: no accidental blank pages, no false green jump
  proof, no overscan-only fix, no dual-window drift, no eager hidden child work,
  no hidden native-parity claim, and no unbounded CI stress row.
- 2026-05-28 Ecosystem maintainer pass rechecked TanStack, Pretext/Premirror,
  Tiptap Pages, `../virtual`, and `../pierre` against the high-risk gates and
  kept them as mechanism references, not Plite public API or model semantics.
- 2026-05-28 Revision pass collapsed the plan to the final accepted
  planning architecture, removed stale public-slot candidate wording, and made
  execution-mode browser proof an explicit acceptance gate rather than a
  planning-closure claim.
- 2026-05-28 Issue sync accounting pass re-audited the final revised plan
  against current live issue rows, the manual v2 sync ledger, issue coverage
  matrix, fork dossier, and PR reference. No claim surface changed.
- 2026-05-28 Closure score and final gates pass closed the planning lane for
  user review, with no implementation edits and no new issue claim.

Verification evidence:
- `nl -ba packages/plite-layout/src/react.tsx | sed -n '1,90p'`
  - Result: current fragment context carries `selectedPaths`,
    `visibleContentRange`, and `visiblePageIndexes`.
- `nl -ba packages/plite-layout/src/react.tsx | sed -n '190,245p'`
  - Result: `usePliteLayoutFragments` filters by visible page index, visible
    content range, and selected-path overlap.
- `nl -ba packages/plite-layout/src/react.tsx | sed -n '500,635p'`
  - Result: current viewport updates attach directly to scroll/resize and feed
    page surface items plus context `visibleContentRange`; this is the runtime
    owner for later coalescing proof.
- `nl -ba packages/plite-layout/src/page-mount-plan.ts | sed -n '1,230p'`
  - Result: page mount items are derived from page groups, fragments, top-level
    indexes, unit paths, and viewport plus overscan filtering.
- `nl -ba apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx | sed -n '80,150p'`
  - Result: example owns URL-backed stress/default controls including 240
    default table rows, 1000 max table rows, 990 default stress pages, and 2000
    max stress pages.
- `nl -ba apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx | sed -n '970,1015p'`
  - Result: public example maps virtualized strategy to
    `{ type: 'virtualized', overscan, threshold, estimatedBlockSize }`.
- `nl -ba apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx | sed -n '1240,1305p'`
  - Result: example exposes page overscan and stress pages only when virtualized.
- `nl -ba apps/www/tests/plite-browser/donor/examples/pagination.test.ts | sed -n '640,710p'`
  - Result: current browser test covers bounded DOM and one programmatic
    `scrollTop` jump, not real wheel/trackpad fast-scroll replay.
- `nl -ba packages/plite-react/src/dom-strategy/use-virtualized-root-plan.ts | sed -n '1,720p'`
  - Result: `Editable` already uses TanStack Virtual, retained range extraction,
    selected-path retention, page item mapping, and page-layout item sizes; it
    is a second window authority alongside `PagedEditable` page chrome.
- `nl -ba packages/plite-react/src/components/editable-text-blocks.tsx | sed -n '900,1195p'`
  - Result: `EditableDescendantNode` creates React children for every child
    runtime id before `renderElement` can slice table children; this is the
    candidate hidden-row allocation pressure.
- `nl -ba packages/plite-react/src/components/editable-text-blocks.tsx | sed -n '1720,1845p;2080,2265p'`
  - Result: `Editable` virtualized mode builds metrics and mounts virtual rows
    from `useVirtualizedRootPlan`, including DOM strategy counts and
    virtualizer rows.
- `nl -ba packages/plite-layout/test/page-layout-contract.test.ts | sed -n '1545,1795p'`
  - Result: page mount plan tests already cover single/spread grouping,
    viewport-null behavior, split-block retention, and selected/promoted/
    composing page retention; they do not yet prove indexed range helpers or
    scroll-window key stability.
- `nl -ba packages/plite-react/test/dom-strategy-page-virtualization.test.tsx | sed -n '1,245p'`
  - Result: React unit tests cover page item retention, selected split-table
    path mapping, outer scroll containers, and metrics de-duping; they do not
    cover fast scroll or shared page-window drift.
- `nl -ba packages/plite-layout/src/index.ts | sed -n '2320,2510p'`
  - Result: layout refresh composes on editor/settings changes and writes
    optional page-break snapshots; viewport/window state should remain derived
    local state, not collaboration/document state.
- `nl -ba ../virtual/docs/api/virtualizer.md | sed -n '60,95p;135,165p;310,335p;395,425p;475,570p'`
  - Result: TanStack exposes `onChange(sync)`, overscan, stable keys,
    `rangeExtractor`, measurement snapshots, `measureElement`, scroll
    adjustment policy, and `isScrolling`; useful internally but too broad for
    Plite public API.
- `nl -ba ../virtual/packages/virtual-core/src/lazy-measurements.ts | sed -n '1,80p'`
  - Result: huge single-lane lists avoid per-item object allocation with a lazy
    `Float64Array`-backed measurements view.
- `nl -ba ../virtual/packages/react-virtual/e2e/app/test/scroll.spec.ts | sed -n '50,125p'`
  - Result: browser proof starts at an offset, performs user-scroll-up, then
    checks rendered items and contiguous geometry.
- `nl -ba ../virtual/packages/react-virtual/e2e/app/test/measure-element.spec.ts | sed -n '1,85p'`
  - Result: dynamic measurement proof expands, collapses, deletes, expands, and
    checks no overlap.
- `nl -ba ../virtual/packages/react-virtual/e2e/app/test/stale-index.spec.ts | sed -n '1,95p'`
  - Result: stale index/key proof removes observed items after scroll and
    asserts no delayed ResizeObserver error.
- `nl -ba ../pretext/RESEARCH.md | sed -n '1,90p'`
  - Result: Pretext's durable architecture is `prepare()` once, arithmetic-only
    `layout()`, and named fonts when accuracy matters.
- `nl -ba ../pretext/src/measurement.ts | sed -n '1,135p'`
  - Result: current Pretext measurement requires OffscreenCanvas or DOM canvas,
    uses `measureText()`, and branches by browser profile.
- `nl -ba ../pretext/src/layout.ts | sed -n '650,725p'`
  - Result: `prepare()` segments and measures, while `layout()` counts lines
    from cached widths with no DOM/canvas hot-path work.
- `sed -n '1,220p' ../pretext/STATUS.md && sed -n '1,180p' ../pretext/corpora/STATUS.md`
  - Result: current Pretext status points at checked-in browser accuracy,
    benchmark, and corpus snapshots; those are regression gates, not universal
    determinism promises.
- `nl -ba ../tiptap-docs/src/content/pages/core-concepts/limitations.mdx | sed -n '1,95p'`
  - Result: Tiptap Pages documents CSS-float limits, non-splittable BFC blocks,
    and the semantic cost of manual node splitting.
- `nl -ba ../tiptap-docs/src/content/pages/guides/table-with-pages.mdx | sed -n '1,110p'`
  - Result: table pagination uses a Pro Pages TableKit because table behavior
    and layout are heavily modified.
- `nl -ba ../pierre/packages/trees/test/file-tree-virtualization-window.test.ts | sed -n '1,760p'`
  - Result: Pierre tree tests prove deterministic visible-window math, selected
    path retention, scroll without DOM focus theft, offsets, sticky ancestors,
    scrolling state, and collapse coherence.
- `nl -ba ../pierre/packages/diffs/src/components/Virtualizer.ts | sed -n '1,520p'`
  - Result: Pierre diff virtualization uses passive scroll listeners, queued
    render, dirty flags, large overscan, visible instances, scroll anchors, and
    scroll repair.
- `nl -ba ../pierre/packages/diffs/src/react/CodeView.tsx | sed -n '760,825p'`
  - Result: user-driven wheel/touch/pointer/key scroll intent cancels pending
    programmatic scroll.
- `rg -n "#(5944|790|5131|2051|4141|3656|4210|5349|5992|5945|4056|2195|2405|5826|4995|5088|5473|4590|4837|4844|5639|5924|2793|2572|3892)\b|pagination|virtualiz|dynamic rendering|page/spread|page virtualization|DOM coverage|native-behavior|native behavior" docs/plite-issues/...`
  - Result: live ledger has current open rows for the direct and guardrail
    issues; v2 sync ledger already had matching 2026-05-25 and 2026-05-26
    pagination/page-fragment rows.
- `rg -n "#(5944|790|5131|2051|4141|3656|4210|5349|5992|5945|4056|2195|2405|5826|4995|5088|5473|4590|4837|4844|5639|5924|2793|2572|3892)\b|pagination|virtualiz|dynamic rendering|page/spread|page virtualization|DOM coverage|native-behavior|native behavior" docs/plite/ledgers/... docs/plite/references/pr-description.md`
  - Result: issue coverage matrix and fork dossier already categorize
    `#5944`, `#790`, subscription/rerender guardrails, scroll-selection
    adjacent rows, and policy non-claims; PR description keeps production-ready
    virtualization unclaimed.
- `sed -n '1280,1425p' docs/plite/references/pr-description.md`
  - Result: PR reference states virtualized rendering is explicit and
    experimental, virtualized editing still needs stricter caret/IME/mobile/copy
    and find proof, and production-ready virtualization is not claimed.
- `rg -n "EditableRenderElementProps|EditableElementSlots|contentBoundary|EditableDescendantNode|createEditableElementSlots" packages/plite-react/src/components/editable-text-blocks.tsx`
  - Result: current renderer/slot surface exists but is unstable enough that
    adding a new public child-window slot would be an API expansion, not a
    private performance repair.
- `nl -ba packages/plite-react/src/components/editable-text-blocks.tsx | sed -n '430,575p;850,885p;1125,1155p'`
  - Result: `EditableElementSlots` owns content-boundary composition, while
    `EditableDescendantNode` still constructs child elements before renderer
    code can slice them; the execution target should be internal child-range
    planning before public slot design.
- `nl -ba packages/plite-layout/src/react.tsx | sed -n '306,365p;403,438p;496,620p'`
  - Result: `PagedEditable` owns paged layout context, viewport state, page
    surface items, and visible page indexes; this is the right place to source
    a shared page-window snapshot instead of letting each consumer drift.
- `nl -ba packages/plite-react/src/dom-strategy/use-virtualized-root-plan.ts | sed -n '312,422p;515,618p'`
  - Result: `Editable` already owns retained range extraction, page-layout
    item mapping, total size, and path scrolling; public TanStack passthrough is
    unnecessary.
- `nl -ba docs/plite/references/pr-description.md | sed -n '1280,1435p'`
  - Result: PR reference keeps virtualized rendering explicit/experimental and
    does not claim stable DOM coverage slot API or production-ready
    virtualization.
- `nl -ba packages/plite-layout/src/react.tsx | sed -n '496,630p'`
  - Result: high-risk pass confirmed current viewport state still derives from
    raw scroll/resize and feeds both page surface filtering and
    `visibleContentRange`, so fast-scroll proof must detect delayed
    materialization, not just low DOM counts.
- `nl -ba packages/plite-layout/src/page-mount-plan.ts | sed -n '1,230p'`
  - Result: page mount plan builds items from page groups and filters visible
    items by viewport/overscan; execution proof must guard both range math and
    page/editable coherence.
- `nl -ba apps/www/tests/plite-browser/donor/examples/pagination.test.ts | sed -n '632,930p'`
  - Result: existing browser proof covers bounded DOM, overscan, row 120
    editing, and scaled-page alignment, but its fast path still uses direct
    `scrollTop` plus two-rAF settling instead of wheel/trackpad replay.
- `nl -ba apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx | sed -n '80,140p;228,290p;420,435p;1260,1295p'`
  - Result: example exposes URL-backed stress controls and labeled stress
    pages; table child windowing still slices after `Children.toArray(children)`.
- `nl -ba packages/plite-layout/test/page-layout-contract.test.ts | sed -n '1545,1795p'`
  - Result: page mount contract tests cover grouping, null viewport, split
    block retention, and selected/promoted/composing page retention, but not
    indexed range helpers or shared window coherence.
- `nl -ba ../virtual/docs/api/virtualizer.md | sed -n '60,95p;135,165p;310,335p;475,570p'`
  - Result: TanStack still supports internal mechanics worth stealing:
    `onChange(sync)`, overscan as a blank/render tradeoff, stable item keys,
    range extraction, measurement snapshots, measurement APIs, scroll
    adjustment policy, and `isScrolling`; this remains too broad for Plite
    public API.
- `nl -ba ../virtual/packages/react-virtual/e2e/app/test/scroll.spec.ts | sed -n '50,125p'`
  - Result: reference browser proof asserts user-scroll-like movement plus
    visible indexes and contiguous geometry; Plite should adapt the proof shape
    to editor-visible content and no blank windows.
- `nl -ba ../pretext/src/measurement.ts | sed -n '36,120p'; nl -ba ../pretext/src/layout.ts | sed -n '668,710p'`
  - Result: Pretext still measures with OffscreenCanvas/DOM canvas and browser
    profiles, then keeps hot layout arithmetic-only; strict page-break fidelity
    remains opt-in snapshot/profile territory.
- `nl -ba ../tiptap-docs/src/content/pages/core-concepts/limitations.mdx | sed -n '1,80p'; nl -ba ../tiptap-docs/src/content/pages/guides/table-with-pages.mdx | sed -n '1,85p'`
  - Result: Tiptap Pages still needs a product TableKit and warns that manual
    node splitting changes document semantics; Plite should keep derived
    fragments and provider-owned split policy.
- `nl -ba ../pierre/packages/trees/test/file-tree-virtualization-window.test.ts | sed -n '38,188p;331,532p'`
  - Result: Pierre tree tests reinforce deterministic window math, selected/
    focused retention, scroll-to-path without focus theft, sticky offsets,
    scrolling state, and collapse coherence as unit-test targets.
- `nl -ba ../pierre/packages/diffs/src/components/Virtualizer.ts | sed -n '20,120p;288,437p'; nl -ba ../pierre/packages/diffs/src/react/CodeView.tsx | sed -n '762,800p'`
  - Result: Pierre diff virtualization reinforces queued/coalesced range work,
    scroll anchors, and user-intent cancellation, while its large overscan and
    debug globals stay fallback evidence, not Plite architecture.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-pagination-fast-scroll-virtualization.md`
  - Result: incomplete as expected after the issue-sync accounting pass; the
    only open phase row is closure score and final gates. Remaining blockers
    are score/workspace checklist items, named verification threshold,
    autoreview N/A/evidence, final handoff, and goal-plan completion evidence.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-pagination-fast-scroll-virtualization.md`
  - Result: `[autogoal] complete:
    docs/plans/2026-05-28-pagination-fast-scroll-virtualization.md`.
- Updated `docs/plite-issues/gitcrawl-v2-sync-ledger.md`
  - Result: added `2026-05-28 Pagination Fast-Scroll Virtualization Planning
    Sync`; no fixed/improved issue claim added.
- Updated `docs/plite-issues/gitcrawl-v2-sync-ledger.md`
  - Result: appended final revision issue-sync check; no claim promotion and no
    PR/matrix/dossier edit needed.
- `gitcrawl status --json`
  - Result: state current; 664 threads across one repository; archive DB
    `/Users/zbeyens/.config/gitcrawl/gitcrawl.db`; last sync
    2026-05-23T09:22:06Z.
- `gitcrawl doctor --json`
  - Result: version 0.4.3; source DB health ok; 664 open threads; GitHub token
    present.
- `gitcrawl search ianstormtaylor/slate --query "pagination virtualization scroll large document dynamic rendering" --mode hybrid --limit 20 --json`
  - Result: direct hits `#790` dynamic rendering and `#5944` stable pagination,
    plus rerender and scroll-selection neighbors including `#4141`, `#5473`,
    `#3656`, `#5349`, `#4837`, `#4844`, `#4995`, `#4590`, `#5274`, `#4056`,
    `#4210`, `#5088`, `#3430`, `#5639`, and `#5398`.
- `gitcrawl threads ianstormtaylor/slate --numbers 790,5944,5992,5131,2051,2195,2405 --include-closed --json`
  - Result: `#790` and `#5944` are open and directly related; `#5131`,
    `#2051`, `#2195`, and `#2405` are guardrails; `#5992` remains an existing
    large-document operation pressure, not a pagination claim.
- `gitcrawl neighbors ianstormtaylor/slate --number 790 --limit 20 --json`
  - Result: performance/rendering neighbors include `#3656`, `#4025`,
    `#2051`, `#3892`, `#4483`, `#4141`, `#2572`, `#2733`, `#5274`, `#4056`,
    and `#5944`.
- `gitcrawl neighbors ianstormtaylor/slate --number 5944 --limit 20 --json`
  - Result: pagination neighbors include `#790`, `#3430`, `#3656`, `#4807`,
    `#4056`, `#5274`, `#2051`, and `#4844`.
- `rg -n "#(5944|790|5131|2051|4141|3656|4210|5349|5992|5945|4056|2195|2405|5826|4995|5088|5473|4590|4837|4844|5639|5924|2793|2572|3892)|pagination|virtualiz|dynamic rendering|page/spread|page virtualization|DOM coverage|native-behavior|native behavior|production-ready virtualization|virtualized rendering|page fragment" docs/plite-issues docs/plite/ledgers docs/plite/references`
  - Result: final revised plan matches existing issue/reference accounting:
    `#5944` and `#790` remain related/proof-backlog, production-ready
    virtualization remains unclaimed, and rerender/scroll/mobile/a11y/custom
    rows remain guardrails or non-claims.
- `sed -n '1,240p' docs/plite-issues/gitcrawl-v2-sync-ledger.md`
  - Result: final 2026-05-28 sync entry now records no fixed/improved claim,
    no direct issue promotion, and no PR/matrix/dossier edit needed.
- `sed -n '384,480p' docs/plite/ledgers/issue-coverage-matrix.md`
  - Result: existing Pretext/page-virtualization/provider-fragment rows already
    keep `#5944` issue-reviewed and `#790` proof-route backlog.
- `sed -n '6800,6945p' docs/plite/ledgers/fork-issue-dossier.md`
  - Result: existing performance macro and pagination/provider rows already
    preserve the relevant no-claim and guardrail statuses.
- `sed -n '286,334p' docs/plite/references/pr-description.md`
  - Result: PR reference already says pagination planning adds no
    fixed/improved issue claim.
- `ffprobe -v error ... 2026-05-28 at 09.18.04.mp4`
  - Result: width 2178, height 1838, avg_frame_rate 2096/37, duration 4.625s,
    nb_frames 262.
- `ffmpeg ... -vf "fps=4,scale=480:-1,tile=4x5" /tmp/codex-pagination-scroll-video/contact.jpg`
  - Result: contact sheet created for plan evidence.
- Source reads:
  - `packages/plite-layout/src/react.tsx`
  - `packages/plite-layout/src/page-mount-plan.ts`
  - `packages/plite-layout/src/index.ts`
  - `packages/plite-layout/test/page-layout-contract.test.ts`
  - `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx`
  - `apps/www/tests/plite-browser/donor/examples/pagination.test.ts`
  - `packages/plite-react/src/dom-strategy/use-virtualized-root-plan.ts`
  - `packages/plite-react/src/components/editable-text-blocks.tsx`
  - `packages/plite-react/test/dom-strategy-page-virtualization.test.tsx`
  - `../virtual/packages/react-virtual/e2e/app/test/scroll.spec.ts`
  - `../virtual/packages/react-virtual/e2e/app/test/measure-element.spec.ts`
  - `../virtual/packages/react-virtual/e2e/app/test/stale-index.spec.ts`
  - `../virtual/docs/api/virtualizer.md`
  - `../virtual/packages/virtual-core/src/lazy-measurements.ts`
  - `../pretext/RESEARCH.md`
  - `../pretext/STATUS.md`
  - `../pretext/corpora/STATUS.md`
  - `../pretext/src/measurement.ts`
  - `../pretext/src/layout.ts`
  - `../tiptap-docs/src/content/pages/core-concepts/limitations.mdx`
  - `../tiptap-docs/src/content/pages/guides/table-with-pages.mdx`
  - `../pierre/packages/trees/test/file-tree-virtualization-window.test.ts`
  - `../pierre/packages/diffs/src/components/Virtualizer.ts`
  - `../pierre/packages/diffs/src/components/CodeView.ts`
  - `docs/plite/references/pr-description.md`

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure score and final gates complete |
| Where am I going? | User review; if accepted, start a separate execution goal in `Plate repo root` |
| What is the goal? | A user-review-ready Plite Plan for robust pagination fast-scroll virtualization/testing |
| What have I learned? | The plan should keep page virtualization internal behind virtualized `domStrategy`; the durable architecture is one shared Plite-owned page-window authority plus content-unit corridor; public renderer child-window API is not in the accepted plan; the test strategy must combine pure range/window math with real browser wheel/continuous-scroll geometry proof, visible no-blank assertions, perf samples, and explicit degraded-native behavior rows; external systems remain mechanism references, not public API or model-semantics sources |
| What have I done? | Created the plan and closed current-state read, related issue discovery, issue-ledger accounting, intent/decision briefing, research/ecosystem/live-source refresh, performance/DX/migration/regression/simplicity pressure, Plite maintainer objection ledger, high-risk deliberate mode, ecosystem maintainer, revision, issue-sync accounting, and final closure passes |

Open risks:
- Planning risks: none.
- Execution risks: the user-visible blank pages may be partly fixture design
  and partly materialization lag, so execution proof must distinguish those
  with visible stress labels and no-blank assertions after every scroll burst.
- Execution can reopen issue/reference sync only if the API, runtime target, or
  issue claim set changes.
- Runtime performance remains unclaimed until browser replay records
  frame/long-task numbers from `Plate repo root`.
- Internal child-range planning may still fail to preserve custom renderer
  composition; that would require a separate public-API maintainer review.

Execution activation:
| Item | Result |
|------|--------|
| Status | implementation complete; review clean |
| Runtime shape | `PagedEditable` now owns the expensive virtualized page-content window and passes it into `Editable` through internal `EditableLayout` state. |
| Fast-scroll fix | Scroll viewport geometry uses root/scroll DOM rects and synchronously commits the page-content window on scroll so visible content is mounted before paint. |
| Page surface policy | Page chrome can still use configured page overscan, while editable content uses the actual visible page corridor plus selected-path retention. |
| Table policy | Virtualized table renderers use the block box as the table origin so filtered row boxes do not shift rows above the viewport. |
| Public API | No new public TanStack passthrough, no public renderer child-window API, no AST table splitting. |
| Changesets | `Plate repo root/.changeset/paged-fast-scroll-window.md`; `Plate repo root/.changeset/slate-react-shared-page-window.md`. |

Execution verification:
- `bun --filter plite-layout test`
  - Result: 36 passed.
- `cd packages/plite-react && bun test:vitest -- dom-strategy-page-virtualization`
  - Result: 5 passed.
- `bun --filter plite-layout typecheck`
  - Result: passed.
- `bun --filter plite-react typecheck`
  - Result: passed.
- `bun typecheck:site`
  - Result: passed.
- `bunx biome check packages/plite-layout/src/react.tsx packages/plite-react/src/components/editable-text-blocks.tsx packages/plite-react/src/dom-strategy/use-virtualized-root-plan.ts packages/plite-react/test/dom-strategy-page-virtualization.test.tsx site/examples/ts/pagination.tsx playwright/integration/examples/pagination.test.ts`
  - Result: passed.
- `bunx eslint packages/plite-layout/src/react.tsx packages/plite-react/src/components/editable-text-blocks.tsx packages/plite-react/src/dom-strategy/use-virtualized-root-plan.ts packages/plite-react/test/dom-strategy-page-virtualization.test.tsx site/examples/ts/pagination.tsx playwright/integration/examples/pagination.test.ts`
  - Result: passed; ESLint reported ignored-file warnings only.
- `bun lint`
  - Result: passed.
- `bunx playwright test playwright/integration/examples/pagination.test.ts --project=chromium -g "keeps visible content mounted during fast wheel scrolling" --repeat-each=3 --workers=1`
  - Result: 3 passed.
- `bunx playwright test playwright/integration/examples/pagination.test.ts --project=chromium -g "keeps a 1000-page virtualized document with a 10-page table bounded|keeps visible content mounted during fast wheel scrolling|keeps scaled virtualized page surfaces aligned"`
  - Result: 3 passed.
- `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local`
  - Result: first run hung for over 8 minutes inside its Codex child and was terminated, then retried below.
- `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local --no-web-search --thinking low`
  - Result: clean; no accepted/actionable findings reported; overall patch correctness confidence 0.71.
