---
date: 2026-05-30
status: complete
skill: slate-plan
lane: pagination-architecture-review
score: 0.98
current_pass: closure-score-and-final-gates
current_pass_status: complete
next_pass: none
next_action: none
slate_plan_lane_status: complete
final_handoff_status: complete
---

# Plite pagination architecture review

## Objective

Review whether the current pagination architecture in `Plate repo root` is clean,
spaghetti, or needs decoupling. Close the Plite Plan only after every scheduled
pass, issue/reference sync row, Evidence Kit mapping, pressure review, score
gate, and final handoff is complete.

One activation completes one pass. This activation closes pass 12:
closure score and final gates.

## Current verdict

Strong take: it is not core spaghetti, but it is not clean enough.

Keep the direction:

- `plite-layout` owns derived page snapshots, projection, Pretext measurement,
  provider-owned boxes/units, page-break snapshots, and page mount plans.
- `PagedEditable` is the right public composition surface: page chrome as fixed
  surfaces, editable overlay as one Plite editor, page virtualization as a view
  policy.
- `plite-react` should keep DOM materialization, coverage boundaries,
  selection, clipboard, IME, and native-editable ownership.

Decouple the mess:

- the canonical pagination example is now a 1620-line stress harness mixing
  controls, URL state, fixtures, table row generation, provider layout, row
  windowing, DOM coverage boundaries, page chrome, renderers, and metrics;
- that is acceptable for proving the feature, but bad DX as the public example;
- the next architecture move should split the example into call-site, fixtures,
  controls, and provider/render modules, and only promote a helper when the same
  provider/windowing pattern is reused outside this example.

Do not rewrite the package architecture. Do not create raw Plite Markdown/table
product packages. The useful abstraction is the generic layout/projection
substrate, not a product table kit.

## Start gates

| Gate | Status | Evidence |
| --- | --- | --- |
| Active goal checked or created | complete | `get_goal` returned no active goal; created Plite Plan planning goal for this lane. |
| Plite Plan template used | complete | `node .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs --template slate-plan --title "Plite pagination architecture review"` created this plan. |
| Live `Plate repo root` source grounded | complete | Read `site/examples/ts/pagination.tsx`, `packages/plite-layout/src/react.tsx`, `packages/plite-layout/src/page-mount-plan.ts`, `packages/plite-layout/src/index.ts`, `packages/plite-react/src/components/editable-text-blocks.tsx`. |
| Prior plan/research checked | complete | Read 2026-05-23 virtualization plan, 2026-05-03 virtualization decoupling plan, research index/log, Pretext pagination page, TanStack virtualization page. |
| `docs/solutions` checked | complete | Read pagination DX solution and raw-Plite table/Markdown ownership solution. |
| Evidence Kit baseline read | complete | Read benchmark registry and health: active artifacts 23, rows 801, no missing required artifacts, next actions 3. |
| Live command proof baseline | complete | `cwd=Plate repo root`: `bun --filter plite-layout test -- page-layout-contract` passed: 37 tests. |

## Live source current state

| Surface | Current owner | Current shape | Verdict |
| --- | --- | --- | --- |
| Example controls and URL state | `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:80-138`, `:1343-1463` | URL-backed controls for DOM strategy, page layout, rows, media split/height, page overscan, stress pages. | Keep controls; split them out of the main example body. |
| Example fixture/stress mutation | `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:906-1008` | Effects mutate table rows and stress blocks in the editor model. | Useful stress harness; not best public DX. Needs separation from the canonical API call-site. |
| Provider-owned table/media sizing | `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:1010-1058` | Example `nodeLayout` returns table row units and image boxes with split policy. | Correct substrate demonstration. Keep as example-local provider until a second consumer justifies helper/API. |
| Layout snapshot and projection | `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:1059-1155` | Example subscribes to `usePliteLayout`, computes geometry/projection, decorations, visible flow paths. | This is the noisy part. Package APIs exist, but the example still looks like a mini layout engine. |
| Public paged surface | `packages/plite-layout/src/react.tsx:378-384`, `:422-691`, `:707-780` | `PagedEditable` wraps `Editable`, owns page surfaces plus editor overlay, passes layout data into `Editable`. | Keep. This is the right package boundary. |
| Page mount plan | `packages/plite-layout/src/page-mount-plan.ts:57-126`, `:177-206` | Groups pages/spreads, maps page fragments to top-level indexes and unit paths, filters by viewport/overscan. | Keep. This is good decoupling already. |
| Page virtualization bridge | `packages/plite-layout/src/react.tsx:491-607`, `:647-679` | `PagedEditable` computes page mount items and exposes page/top-level layout items to `Editable`. | Keep as an internal bridge; revision keeps the only follow-up as memoized returned arrays or profiler proof, not a new public API. |
| Plite React DOM strategy | `packages/plite-react/src/components/editable-text-blocks.tsx:1758-1853`, `:2115-2175`, `:2328-2428` | Generic DOM strategy still handles virtualized plans, metrics, placeholders, and DOM coverage. | Not pagination-specific spaghetti, but still broad. Reuse existing virtualization decoupling plan; do not add pagination hacks here. |
| Table row windowing | `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:229-321`, `:736-779` | Example computes visible row ranges from fragments and inserts `slots.contentBoundary` for hidden rows. | Architecture smell. Keep local for now, but mark as first candidate for a small reusable provider/windowing helper if another structured node needs it. |
| Layout primitives | `packages/plite-layout/src/index.ts:105-129`, `:245-280`, `:1840-1888`, `:2408-2495` | Boxes/units/split policy, projections, decoration rects, cached Pretext preparation, derived layout store. | Strong. This is the part to protect. |
| Tests | `packages/plite-layout/test/page-layout-contract.test.ts:1602-1818`, `apps/www/tests/plite-browser/donor/examples/pagination.test.ts` | Package contracts cover page mount plans; Playwright has broad pagination rows including virtualized click/drag/typing/fast scroll. | Better than most experimental features, but issue #5944 still not closable without page-boundary stability proof. |

## Intent / boundary record

Status: complete in this pass after consuming issue-ledger results.

Intent:

- answer the user's actual question: is pagination spaghetti, and should we
  decouple?
- stop more fixes from piling onto a 1620-line example/proof harness;
- preserve the package substrate that already has a sane boundary.

Outcome:

- a user-review-ready plan that says package architecture stays;
- example/provider/proof harness gets decoupled;
- performance and issue-closure claims stay benchmark/browser-proof gated.

In scope:

- `plite-layout` public layout entrypoint and snapshot semantics;
- `PagedEditable` as the public paged rendering surface;
- `EditableLayout.getVirtualizedPageItems` as the current bridge into
  `plite-react` DOM materialization;
- provider-owned boxes/units/split policy for tables, media, and BFC-like
  blocks;
- canonical pagination example DX;
- package tests, Playwright rows, and Evidence Kit benchmark candidates needed
  to make future execution honest.

Non-goals:

- no `Plate repo root` implementation edits while the plan is still pending;
- no raw Plite Markdown/table product package;
- no AST table splitting for visual page fragments;
- no CSS-float pagination;
- no public TanStack/virtualizer API;
- no public ignore-cursor API for `#5924`;
- no `Fixes` or `Improves` claim for `#5944`, `#790`, or `#5924`.

Hard boundaries:

| Boundary | Decision | Evidence / reason |
| --- | --- | --- |
| Package graph | keep | `usePliteLayout` creates the derived layout store from editor/options; `PagedEditable` consumes layout snapshots and passes a small `EditableLayout` bridge into `Editable`. |
| Example/proof harness | split | The example mixes controls, URL state, fixtures, stress mutation, provider layout, renderers, row windowing, page chrome, and metrics. That is proof glue, not public DX. |
| Table/media layout policy | provider-owned | `nodeLayout` already returns text fallback, boxes, or units with split policy. That is the right generic substrate. |
| Table row windowing helper | local candidate | Current hidden-child ranges plus `contentBoundary` are useful, but one consumer is not enough for package API. |
| Page breaks for strict fidelity | opt-in metadata | `pageBreaks` read/write already exists; strict collab/export can use it without making visual pages part of the Plite value. |
| Issue closure | blocked by proof, not by architecture opinion | `#5944` needs page-boundary stability proof; `#790` needs mount/edit/scroll benchmarks and DOM/native-behavior proof; `#5924` stays not claimed. |

Execution adoption story:

1. Split the example with no behavior change first.
2. Keep the top-level example shaped around `usePliteLayout` plus
   `PagedEditable`.
3. Move fixtures, controls, provider logic, renderers, and optional table-window
   glue one import away.
4. Add package/helper API only if a second structured-node provider repeats the
   same non-product pattern or the inline provider remains unreadable after the
   split.
5. Prove browser behavior before claim text changes.

Unresolved user-decision points:

- none for planning;
- execution still requires explicit user acceptance of the final plan.

## Decision brief

Status: complete in this pass after consuming issue-ledger results.

Decision:

Keep `plite-layout` and `PagedEditable`; decouple the pagination example and
proof harness. Do not rewrite packages. Do not promote product-flavored helpers
into raw Plite.

Principles:

1. Plite core owns generic document and selection substrate, not product table
   UX.
2. Derived page layout is not document structure.
3. Page virtualization is a repeated-unit mount policy, not the editor API.
4. Examples must show the public API shape first, then advanced provider logic.
5. Promote helpers only after repeated use or real call-site complexity.

Top drivers:

| Driver | Weight | Consequence |
| --- | ---: | --- |
| Keep active editing hot paths small | high | Pretext/page projection and provider geometry stay derived, cached, and subscribed through layout snapshots. |
| Preserve native editing contracts | high | `plite-react` keeps DOM materialization, selection, clipboard, IME, placeholders, and coverage boundaries. |
| Make public DX honest | high | The canonical example should show the API, not a pile of stress-harness internals. |
| Avoid product scope creep | high | Tables, Markdown-shaped fixtures, image boxes, and app-specific rows stay example/provider concerns. |
| Keep issue accounting clean | high | No new fixed/improved claims until browser and benchmark proof match the issue. |
| Keep migration substrate useful | medium | Provider-owned boxes/units and optional `pageBreaks` support Plate, slate-yjs, strict export, and app-level policy without forcing a word-processor schema into Plite. |

Viable options:

| Option | Verdict | Reason |
| --- | --- | --- |
| Leave as-is | reject | The package substrate is promising, but the example is too large and keeps attracting bug fixes in local glue. |
| Rewrite pagination into a new editor/runtime | reject | Current `plite-layout` and `PagedEditable` already have the right backbone and passing contracts. |
| Decouple example/provider modules, keep package architecture | choose | Best long-term move: improves DX and maintainability without inventing a fake abstraction. |
| Promote table/windowing into raw Plite package APIs now | reject for now | Only one example uses it; prior solution says raw Plite should not own product table packages. |
| Create one generic structured-node page-window helper after second use | keep as candidate | Hidden child ranges plus `contentBoundary` may be reusable, but needs another consumer or a very small API proof. |
| Make page breaks part of Plite document data | reject | Page layout is derived state; strict-fidelity users can opt into `pageBreaks` metadata without polluting the value. |

Chosen option:

- Keep `plite-layout` + `PagedEditable`.
- Split the pagination example into:
  - `pagination.tsx` call-site shell;
  - `pagination-controls.tsx`;
  - `pagination-fixtures.ts`;
  - `pagination-layout-provider.ts`;
  - `pagination-renderers.tsx`;
  - optional local `pagination-table-window.tsx`.
- Do not promote example helpers into package API in the first cleanup unless
  the pass proves a repeated non-product substrate.

Invalidated alternatives:

- "Pagination is core spaghetti": false. The core package boundary is decent;
  the call-site/proof harness is the mess.
- "Fix by moving table pagination into Plite": wrong owner. It would turn a
  generic editor into a product table package.
- "Fix by exposing virtualizer knobs": wrong API. `domStrategy` and `pageView`
  keep this Plite-shaped.
- "Close `#5944` from architecture": not enough proof. It needs browser
  stability rows.

Consequences:

- Future patches should reduce `pagination.tsx` complexity before adding new
  pagination features.
- Runtime fixes belong in `plite-layout`, `PagedEditable`, or `plite-react`
  only when the behavior is generic and testable outside the example.
- Benchmark work should target `react-pagination-page-virtualization` rather
  than broad "pagination is fast" claims.
- PR/issue text stays no-claim until the proof surface changes.

## Source-backed architecture north star

Target shape:

```tsx
const layout = usePliteLayout(editor, {
  nodeLayout,
  page: pageSettings,
  root: 'main',
  textChangeRefresh: 'deferred',
  typography,
})

return (
  <PagedEditable
    decorate={decorate}
    domStrategy={domStrategy}
    layout={layout}
    pageView={{ gap: PAGE_GAP, mode: pageLayoutMode }}
    renderElement={renderElement}
    renderLeaf={renderLeaf}
    renderPage={renderPage}
  />
)
```

The call-site should fit on screen. Stress fixtures and table/media providers
can be one import away. The public API should still look like Plite plus a
layout object, not a word processor framework.

Rejected drift:

- no CSS-float pagination;
- no AST table splitting for visual page fragments;
- no raw Plite TableKit;
- no public TanStack options;
- no example-only hit-testing hacks once a reusable layout projection exists.

## Initial scorecard

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.75 | `PagedEditable` uses `useSyncExternalStore` snapshots and memoized projections, but scroll viewport state updates in `react.tsx:520-591` plus example model mutation/stress effects need pressure. No dedicated active pagination benchmark artifact is registered. |
| Plite-close unopinionated DX | 0.20 | 0.68 | `PagedEditable` API is Plite-close, but `pagination.tsx` is 1620 lines and makes provider/windowing logic look mandatory. |
| Plate and slate-yjs migration backbone | 0.15 | 0.80 | Provider-owned boxes/units and page-break snapshots are good substrate; ecosystem pass now assigns strict collab/export authority to the app while raw Plite owns the protocol. |
| Regression-proof testing strategy | 0.20 | 0.84 | `bun --filter plite-layout test -- page-layout-contract` passed 37 tests; pagination Playwright file has many browser rows, and high-risk proof gates now map the browser rows. Mobile/a11y stay explicit non-claims until direct proof exists. |
| Research evidence completeness | 0.15 | 0.92 | Pretext, TanStack, Tiptap, Premirror, and local solution evidence now maps directly to the chosen boundary; remaining risk is execution proof, browser/device parity, and issue sync, not architecture direction. |
| shadcn-style composability/minimalism | 0.10 | 0.70 | Controls are URL-backed and practical, but the example shell is dense and renderer/provider concerns are tangled. |

Weighted score: `0.76`.

Current weighted score after related issue discovery: `0.78`.

Current weighted score after issue-ledger pass: `0.80`.

Current weighted score after intent/boundary and decision brief: `0.82`.

Current weighted score after research/ecosystem/live-source refresh: `0.84`.

Current weighted score after pressure pass: `0.86`.

Current weighted score after maintainer-objection pass: `0.88`.

Current weighted score after high-risk deliberate mode: `0.90`.

Current weighted score after ecosystem maintainer pass: `0.92`.

Current weighted score after revision pass: `0.94`.

Current weighted score after issue sync accounting: `0.96`.

Current weighted score after closure/final gates: `0.98`.

Closure threshold is met. The remaining `0.02` risk is execution proof, browser
traces, and benchmark evidence after implementation, not planning
incompleteness.

## Evidence Kit benchmark mapping

Read:

- `benchmarks/editor/research/benchmark-registry.json`
- `benchmarks/editor/benchmarks/results/benchmark-health-latest.json`

Current health:

- active artifacts: `23`
- required active artifacts missing: `0`
- row count: `801`
- next actions: optional `core-transaction-current`, optional
  `history-retained-memory`, ignore/delete historical unregistered artifacts.

Mapping:

| Pagination claim | Registered artifact | Status |
| --- | --- | --- |
| Generic large-document React perf | `react-huge-document-*`, `react-active-typing-breakdown` | covered indirectly |
| Page-level pagination mount/edit/scroll perf | none exact | coverage gap / candidate benchmark |
| Page virtualization fast-scroll | no registered exact artifact | coverage gap; Playwright proof exists, benchmark artifact missing |
| Table spanning 10 pages | no registered exact artifact | browser proof exists in pagination suite; benchmark candidate if perf claim is made |
| Middle-document typing in paged mode | no registered exact artifact | Playwright metrics exist; not Evidence Kit active evidence yet |

Candidate benchmark:

- `react-pagination-page-virtualization`: page count, mounted page surfaces,
  mounted rows/cells, scroll frames, middle typing p95/p99, fast-scroll recovery.

## Related issue discovery

Status: complete for this pass.

Decision: do not run broad live issue discovery or ClawSweeper again in this
activation. The same pagination/page-virtualization surface is already covered
by completed durable ledger sections, and this plan changes no fixed/improved
claim text.

Evidence read:

- generated live current rows:
  `docs/plite-issues/gitcrawl-live-open-ledger.md:37`, `:41`, `:646`
- fast-scroll pagination sync:
  `docs/plite-issues/gitcrawl-v2-sync-ledger.md:110-148`
- Pretext pagination/page virtualization sync:
  `docs/plite-issues/gitcrawl-v2-sync-ledger.md:623-647`
- coverage matrix:
  `docs/plite/ledgers/issue-coverage-matrix.md:426-475`
- fork dossier:
  `docs/plite/ledgers/fork-issue-dossier.md:7828-7857`
- test-candidate maps:
  `docs/plite-issues/test-candidate-map/5994-5918.md:317-329`,
  `:402-414`,
  `docs/plite-issues/test-candidate-map/2694-790.md:409-418`
- PR reference:
  `docs/plite/references/pr-description.md:295-315`

ClawSweeper related-issue pass:

- status: reused existing completed coverage;
- trigger: pagination architecture touches browser/runtime/example issue-facing
  behavior;
- reason no new run: existing Pretext pagination and fast-scroll sync rows cover
  `#5944`, `#790`, `#5924`, accessibility/custom-surface guards, and large-doc
  carryover claims; this pass only reviews architecture cleanliness and does not
  add a fixed or improved issue claim.

Issue matrix:

| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
| --- | --- | --- | --- | --- | --- | --- |
| `#5944` stable per-line pagination | Related, not fixed | Do not claim fixed or improved. | Direct pagination pressure. Existing ledgers require browser proof for page-boundary flicker, caret mapping, stable edits, and page-break stability before any claim. | Existing pagination Playwright rows plus future stability/flicker rows. | `issue-reviewed, unchanged`; generated live row read. | related matrix only; existing rows unchanged |
| `#790` dynamic rendering | Related proof-route backlog | Do not claim fixed or improved. | Page/spread virtualization targets the shape, but existing ledgers require mount/edit/scroll benchmarks, mounted-count proof, DOM coverage proof, and native-behavior proof. | Existing fast-scroll Playwright proof plus candidate Evidence Kit benchmark. | `proof-route backlog, unchanged`; generated live row read. | related matrix only; existing rows unchanged |
| `#5924` structural DOM exclusion | Not claimed | Keep not claimed. | Page chrome/table/debug DOM should route through DOM coverage, mount policy, provider fragments, and content boundaries, not a public ignore-cursor API. | No direct test candidate; advanced-layout note only. | `not claimed, unchanged`; generated live row read. | related matrix only; existing rows unchanged |
| `#4141` nested rerenders | Existing improves unchanged / guardrail | No claim promotion. | Layout/page subscriptions must preserve affected-range locality. | Rerender breadth gates; performance pass owns exact rows. | unchanged | unchanged |
| `#5131`, `#2051` subscription/rerender perf | Guardrail rows | No claim promotion. | Pagination cleanup must not widen snapshot consumers, fragment hooks, page windows, selection changes, or simple typing. | Rerender breadth / active typing proof later. | unchanged | unchanged |
| `#2793`, `#2572` a11y / missing DOM | Release guard / policy non-claim | No claim promotion. | Page-virtualized missing DOM cannot claim screen-reader/native parity without assistive-tech proof or explicit degradation docs. | Future a11y or degradation docs proof. | unchanged | unchanged |
| `#3892` custom surfaces | Policy non-claim | No claim promotion. | Generic layout substrate helps custom surfaces, but product custom layout engines stay outside raw Plite closure. | no direct claim | unchanged | unchanged |
| `#5945`, `#4056`, `#5992` large docs/copy/cut | Existing improves unchanged | No promotion from pagination architecture. | Large-document operation/clipboard claims are owned by existing benchmark rows. | Evidence Kit large-doc/clipboard rows. | improves-claimed, unchanged | unchanged |
| `#5826` refocus autoscroll | Existing fixes unchanged | No broadening. | Fast-scroll pagination must not broaden or regress the exact long-editor refocus floor. | existing fixed floor | fixes-claimed, unchanged | unchanged |

Reference sync status:

- generated live gitcrawl rows read: complete for `#5944`, `#5924`, `#790`.
- manual v2 sync ledger update: unchanged; existing rows already cover this
  no-claim architecture surface.
- fork issue dossier update: unchanged; existing Pretext pagination section
  covers this surface.
- issue coverage matrix update: unchanged; existing Pretext pagination and
  provider-fragment sections cover this surface.
- PR description sync: unchanged; current PR reference already says pagination
  remains a small beta API target and adds no fixed/improved issue claim.

The full issue-ledger pass below closes the remaining ledger-family scan.

## Issue-ledger pass

Status: complete.

Decision: no durable ledger or PR-reference edit is needed for this architecture
review. The existing issue sync rows already say the correct thing: pagination
is related architecture pressure, page virtualization is proof-route backlog,
and this review adds no fixed or improved issue claim.

Full ledger family read:

| Source | Evidence | Pagination architecture implication |
| --- | --- | --- |
| Generated live open ledger | `docs/plite-issues/gitcrawl-live-open-ledger.md:37`, `:41`, `:646` | `#5944`, `#5924`, and `#790` are current live singleton rows, so no live cluster merge changes the accounting. |
| Gitcrawl cluster overlay | `rg "5944|5924|790|pagination|dynamic|layout" docs/plite-issues/gitcrawl-clusters.md` returned no rows | Current live overlay adds no new pagination/dynamic-rendering cluster beyond the generated live issue rows. |
| Frozen cluster ledger | `docs/plite-issues/open-issues-ledger.md:150`, `:192`, `:343`, `:501`, `:505`, `:1162` | Large-document performance is benchmark-gated; pagination/layout composition stays `issue-reviewed`; `#5944` needs a current reproduction; `#5924` remains stale/not claimed; `#790` stays benchmark-gated. |
| Macro issue clusters | `docs/plite-issues/issue-clusters.md:57-65` | The corpus does not ask for a different data model. It points at runtime boundaries and high-leverage performance work, which supports keeping layout derived and benchmarked. |
| Package impact matrix | `docs/plite-issues/package-impact-matrix.md:56-60`, `:64-72`, `:75-84`, `:110-119` | Package ownership stays split: core model in `slate`, React/runtime behavior in `plite-react`, DOM translation in `plite-dom`, examples as examples. Pagination cleanup should not become a raw Plite product package. |
| Requirements from issues | `docs/plite-issues/requirements-from-issues.md:385-387`, `:401-411` | Examples are supported surfaces, but performance claims must be tied to reproducible workloads. That supports example cleanup plus a pagination benchmark candidate, not a package rewrite. |
| Benchmark candidate map | `docs/plite-issues/benchmark-candidate-map.md:518-544` | `#790` already has the right benchmark lane: huge realistic document, initial mount/first scroll, DOM node count, first-edit latency, and no windowing baseline that breaks DOM lookup. |
| Current v2 sync ledger | `docs/plite-issues/gitcrawl-v2-sync-ledger.md:110-150`, `:623-647` | Existing fast-scroll and Pretext pagination rows already record no fixed/improved claims for `#5944`, `#790`, `#5924`, a11y/custom-surface rows, and large-doc carryover claims. |
| PR reference | `docs/plite/references/pr-description.md:295-315` | Current PR text already defines the small beta pagination target and explicitly says it adds no fixed/improved issue claim. |

Issue-accounting decision table:

| Surface | Update? | Reason |
| --- | --- | --- |
| `docs/plite-issues/gitcrawl-v2-sync-ledger.md` | no | Existing rows already cover this exact no-claim architecture surface. Adding another row would duplicate the same state. |
| `docs/plite/ledgers/issue-coverage-matrix.md` | no | No fixed/improved issue claim changed. Existing related matrix rows remain the durable location. |
| `docs/plite/ledgers/fork-issue-dossier.md` | no | No new per-issue finding or maintainer-facing claim changed. |
| `docs/plite/references/pr-description.md` | no | The PR reference already states the accepted beta target and the no-claim boundary. |

Architectural consequence:

- The package graph is not spaghetti.
- The example/proof harness is too tangled.
- Decoupling should happen at example/provider/proof boundaries first.
- `plite-layout` and `PagedEditable` should stay as the public substrate.
- Table/media/paged-fragment behavior should stay provider-owned until a second
  structured-node consumer proves a reusable helper is worth promoting.

Follow-up status: the intent/boundary record and decision brief are now
refreshed; the next runnable pass is the React/performance/TDD/DX pressure pass.

## Research / ecosystem / live-source refresh

Status: complete.

Read:

- `docs/research/sources/editor-architecture/pretext-pagination-page-virtualization.md:28-52`,
  `:82-117`, `:119-187`
- `docs/research/sources/editor-architecture/tanstack-virtual-and-github-large-surface-virtualization.md:24-76`,
  `:81-122`, `:160-178`
- `docs/solutions/developer-experience/2026-05-21-slate-layout-source-entry-and-paged-editable-dx.md:88-125`,
  `:361-391`, `:444-498`
- `docs/solutions/developer-experience/2026-05-22-raw-slate-should-not-own-markdown-table-product-packages.md:18-70`
- live `Plate repo root` source rows for `usePliteLayout`, `PagedEditable`,
  `EditableLayout`, page overlay rendering, `pageBreaks`, table/media
  `nodeLayout`, table row windowing, and TanStack virtualized root planning.

Current live-source corrections:

| Surface | Current fact | Plan implication |
| --- | --- | --- |
| TanStack version | `Plate repo root/bun.lock:145`, `:773-775` resolves `@tanstack/react-virtual@3.13.25` and `@tanstack/virtual-core@3.15.0`. | The prior "upgrade TanStack" research action is already satisfied in this checkout. Do not keep it as future architecture work. |
| TanStack ownership | `packages/plite-react/src/dom-strategy/use-virtualized-root-plan.ts:400-424`, `:572-640` uses `rangeExtractor`, stable keys, `scrollToOffset`, `scrollToIndex`, and disables `measureElement` for page-layout items. | TanStack remains internal range machinery. Plite still owns retained pages, DOM coverage, materialization, selection, and missing-DOM policy. |
| Layout entrypoint | `packages/plite-layout/src/react.tsx:117-150` creates/destroys a layout store from editor/options; `:188-205` exposes snapshot/fragments via `useSyncExternalStore` and context. | Keep `usePliteLayout` as the public derived-layout entrypoint. |
| Paged surface | `packages/plite-layout/src/react.tsx:378-384`, `:422-455`, `:707-780` keeps `PagedEditable` as page chrome plus a single editable overlay. | Keep `PagedEditable`; this matches the Premirror-like page-surface/overlay lesson. |
| Editable bridge | `packages/plite-layout/src/react.tsx:647-684` passes `getVirtualizedPageItems`, `getVisibleVirtualizedPageItems`, and `getVirtualizedTopLevelItems` into `Editable`. | Good enough as a current internal bridge; do not turn it into public API unless profiler proof or a second consumer proves the current bridge is too wide. |
| Provider/split protocol | `packages/plite-layout/src/index.ts:105-129`, `:411-420`, `:1549-1566` defines boxes/units/split policy and passes `measurementProfile` into `nodeLayout`. | Keep provider-owned boxes/units/split policy. Do not promote table/media product policy into raw Plite. |
| Strict page breaks | `packages/plite-layout/src/index.ts:2488-2534` reads/writes page-break snapshots with `documentKey`, `measurementProfile`, `root`, `version`, and `writerId`. | Strict collab/export fidelity belongs in opt-in `pageBreaks`, not in the Plite value. |
| Example complexity | `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:80-138`, `:229-321`, `:1010-1066`, `:1518-1526` still mixes controls, table child windowing, provider layout, layout subscription, and `PagedEditable`. | Public example DX still needs the split; the source refresh does not weaken that verdict. |

Ecosystem synthesis:

| System | Mechanism to steal | What to reject | Plite target | Current verdict |
| --- | --- | --- | --- | --- |
| Pretext | Measure/prepare text once, then perform arithmetic layout and page projection over cached prepared runs. | Any default promise of server/client/cross-browser identical page breaks while measurement still depends on canvas/browser font metrics. | Default Pretext-backed `plite-layout` engine with measurement-profile-aware snapshots and optional strict `pageBreaks`. | Keep. Right engine, honest contract. |
| Premirror | Derived snapshot -> measure -> compose -> render; page chrome outside document content; one editable overlay across page surfaces. | Treating pages as document nodes or putting editable content inside page chrome. | `PagedEditable` fixed page surfaces plus one editor overlay. | Keep. This is the rendering shape to preserve. |
| TanStack Virtual | Internal range extraction, retained indexes, stable item keys, measured sizes, overscan, and scroll alignment for extreme repeated-unit surfaces. | Public TanStack option pass-through or letting the virtualizer own selection/copy/IME/a11y semantics. | Plite-shaped `domStrategy={{ type: 'virtualized' }}` plus page/spread mount items when paged. | Keep internal. Current checkout already has the latest targeted version. |
| Tiptap Pages | Failure taxonomy: BFC blocks, tables, figures, styled containers, oversized media, page content rects, manual split semantics, export/import, collab. | CSS-float page gaps, AST node splitting for visual pages, and product `TableKit` as raw Plite API. | Provider-owned boxes/units/split policy, table/media proof rows, no raw Plite TableKit. | Use as negative evidence. |
| Plate/app layer | Product Markdown/table parsing, commands, cell-selection UX, GFM, app policy. | Shipping those as raw Plite packages, even if opt-in. | Raw Plite exposes substrate; Plate/app packages build product behavior. | Keep boundary hard. |

Research-backed architecture decision:

- Pretext stays the default layout engine.
- Page/spread virtualization is the repeated unit in paged mode; block
  virtualization remains for continuous/pathological documents.
- `pageView` and `domStrategy` stay the public knobs; TanStack stays internal.
- `pageBreaks` remains opt-in authoritative metadata for strict collaboration
  and export.
- Tables/media/BFC-like blocks route through provider-owned boxes, units, and
  split policy.
- Browser/device proof must cover page-boundary editing, table/image bounds,
  mixed font metrics, clipboard, IME, a11y/missing DOM, and profile drift before
  native-parity or issue-closure claims.

## Performance / DX / migration / regression / simplicity pressure

Status: complete.

Read:

- live pressure source:
  `packages/plite-layout/src/react.tsx:520-684`,
  `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx:906-1008`,
  `:1067-1184`, `:1206-1220`, `:1430-1465`, `:1488-1498`,
  `packages/plite-react/src/components/editable-text-blocks.tsx:1758-1858`,
  `:1894-1995`, `:2115-2205`, `:2220-2295`
- package/browser proof rows:
  `packages/plite-layout/test/page-layout-contract.test.ts:477-509`,
  `:973-1035`, `:1602-1822`,
  `apps/www/tests/plite-browser/donor/examples/pagination.test.ts:2295-2335`,
  `:2566-2710`, `:2792-2968`, `:2970-3192`, `:3431-3570`,
  `apps/www/tests/plite-browser/donor/examples/query-controls.test.ts:118-160`
- pressure lenses:
  `.agents/skills/performance/SKILL.md`, `.agents/skills/performance-oracle/SKILL.md`,
  `.agents/skills/tdd/SKILL.md`, `.agents/skills/react-useeffect/SKILL.md`

Applicable implementation-skill review matrix:

| Lens | Status | Finding | Plan delta |
| --- | --- | --- | --- |
| vercel-react-best-practices | applied via relevant React/perf rules | Scroll listeners are passive and viewport updates are guarded by 1px equality, but `flushSync` on scroll and per-render layout getter allocations stay pressure points. | Keep the package shape, but require trace/profiler proof before claiming virtualized scrolling is production-fast. |
| performance-oracle | applied | Main risk is not obvious O(n²); it is repeated allocation and projection over pages, blocks, rows, hidden boundaries, and DOM strategy metadata at 1000-page scale. | Budget repeated units and keep page/spread as the paged-mode unit. |
| performance | applied | Cohorts, repeated-unit budgets, p95/p99 interaction rows, memory/DOM tags, and degradation policy are required before issue closure. | Candidate Evidence Kit benchmark remains mandatory for perf claims. |
| tdd | applied | Existing tests hit public package APIs and the route, not private helpers. That is good. Cleanup must keep behavior tests stable and avoid tests that assert file splits. | Execution should add/keep behavior rows for mount plan, provider units, URL controls, virtualized typing, fast scroll, margin hit testing, and table materialization. |
| react-useeffect | applied | `PagedEditable` effects sync external scroll/resize systems and are valid. Example row/stress effects sync URL controls to the editor model, but they are expensive and should move behind the split into fixture/control ownership. | Do not add new render-derived effects. Keep effects for browser/editor synchronization only. |
| shadcn | applied lightly | Example controls are UI surface, but this is not a shadcn registry/API change. | Keep controls familiar and URL-backed; do not turn the example into a design-system task. |

Pressure verdict:

The architecture survives pressure. The package graph is still the right shape.
The part that fails pressure is the example/proof harness and one bridge detail:
`EditableLayout` currently exposes getter functions that allocate mapped arrays
when `EditableTextBlocks` reads them during render. That is tolerable as an
internal bridge while the feature is experimental, but execution should either
return memoized arrays or prove the getter calls are bounded in React profiler
traces before calling this production-grade.

### Performance

- applicability: applied
- Vercel rules used:
  - `client-passive-event-listeners`: `PagedEditable` scroll listener is passive.
  - `rerender-dependencies`: layout/page effects use primitive option deps where
    practical; pressure remains around broad snapshot/projection dependencies.
  - `rerender-defer-reads`: callbacks and materialization should avoid subscribing
    to data that only event handlers need.
  - `js-index-maps` / `js-set-map-lookups`: existing layout maps are the right
    direction for block/path/page lookup pressure.
  - `advanced-event-handler-refs` / `advanced-use-latest`: candidate if scroll or
    materialization handlers start reattaching because callbacks need fresh
    state.
- extra rules used:
  - cohort segmentation
  - repeated-unit budget
  - interaction INP matrix
  - memory/DOM tagging
  - degradation contract
  - editor-native behavior proof
  - effect/subscription budget
- repeated unit:
  - paged mode: page/spread mount item first;
  - structured blocks: provider-owned units such as table rows;
  - continuous/pathological mode: top-level runtime id.
- cohorts:
  - normal: staged/default pagination route with the rich Markdown fixture;
  - large: multi-page table with 240 rows;
  - stress: virtualized 1000-page document plus 10-page table;
  - pathological: 1000 rows, 2000 stress pages, 960px rows, 1200px media, or
    high overscan.
- current budgets from browser proof:
  - virtualized dropdown readiness: `selectReturnedMs <= 5000`, `readyMs <= 5000`;
  - 1000-page stress default: total elements `< 1000`, page surfaces `<= 8`;
  - table scrolled into range: total elements `< 1400`, page surfaces `<= 8`,
    rows `<= 80`, cells `<= 240`;
  - overscan 4: total elements `< 3600`, page surfaces `<= 14`;
  - selected row retention: page surfaces `<= 18`, rows `<= 220`, cells `<= 660`,
    total elements `< 3600`;
  - middle typing: p95 event-to-paint `<= 80ms`;
  - fast wheel scroll: p50 event-to-paint `<= 80ms`, p95 `<= 500ms`.
- target budget:
  - preserve the current browser budgets after decoupling;
  - add Evidence Kit `react-pagination-page-virtualization` before any PR claims
    "fast pagination" broadly.
- degradation contract:
  - virtualized mode is opt-in;
  - missing DOM uses content boundaries and model-backed materialization;
  - native browser find/screen-reader/native traversal are not native-parity
    claims until assistive tech and missing-DOM proof exists.
- dashboard/RUM gap:
  - not required for plan readiness, but production adoption should tag document
    page count, table row count, strategy, overscan, mounted pages, DOM nodes,
    event-to-paint, browser, mobile, IME, and degradation mode.

### React / Effects

Keep:

- `useSyncExternalStore` for layout snapshots.
- Passive scroll listener plus `ResizeObserver` in `PagedEditable`, because that
  effect synchronizes with external browser scroll/resize state.
- `flushSync` only as an explicit scroll-position correctness tradeoff; it needs
  trace proof, not blind expansion.

Pressure:

- `PagedEditable` computes viewport on scroll with layout reads and synchronous
  state on the scroll path. If traces show dropped frames, move viewport tracking
  into a `requestAnimationFrame` / external-store bridge while preserving no
  blank page gaps during fast scroll.
- `EditableLayout.getVirtualizedPageItems()` maps `pageMountPlan.items` whenever
  `EditableTextBlocks` reads it. Keep it internal, but either memoize returned
  arrays or prove render frequency and allocation stay bounded.
- The example's `applyTableRows` and `applyStressPages` effects mutate the
  editor model from controls. That is acceptable as a stress harness, not as
  canonical example DX. The split should make control -> fixture mutation
  ownership explicit and idempotent.

### TDD / Regression

Current coverage is stronger than a typical experiment:

- package contracts cover deferred text refresh, provider-owned table row units
  without AST splitting, single/spread page mount plans, viewport filtering, and
  selected/promoted/composing page retention;
- browser rows cover route smoke, URL controls, virtualized dropdown startup,
  split projected paragraph click/navigation/editing, 1000-page table bounds,
  middle-document typing latency, burst typing, deferred input offset reset, fast
  wheel scrolling, scaled page-surface alignment, fixture shape, and rich
  Markdown bounds.

Required execution test stance:

- split files without adding tests that assert filenames or helper names;
- keep tests behavior-first through package APIs and `/examples/pagination`;
- add focused package coverage only if a new helper/API is promoted;
- rerun focused package tests and pagination Playwright rows before claiming the
  split is behavior-preserving.

Remaining regression gaps:

- Chromium-only rows are not device/a11y proof.
- `#5944` still needs page-boundary flicker/stability proof.
- strict `pageBreaks` policy is answered, but production collab/export fidelity
  still needs app-authority proof before any parity claim.
- native find/screen-reader traversal remain degradation/non-claim territory.

### DX / Simplicity

- `pagination.tsx` is currently 1620 lines. That is the DX problem.
- The cleanup should keep one canonical `/examples/pagination` route; do not add
  another fake `pagination-basic` route.
- Split into controls, fixtures, provider/renderers, and optional local
  table-window glue.
- Keep the public call-site centered on `usePliteLayout` and `PagedEditable`.
- Promote no helper until it either removes repeated complexity after the split
  or a second structured-node provider proves the pattern.

### Migration

- Plate/app packages can own product Markdown/table behavior on top of the same
  provider layout substrate.
- slate-yjs/export strictness can use `pageBreaks` snapshots with measurement
  profile, root, version, document key, and writer id.
- Do not require current Plate/slate-yjs adapters for raw Plite plan readiness;
  the required substrate is generic boxes/units/split policy plus optional
  authoritative page-break metadata.

## Plite maintainer objection ledger

Status: complete.

Verdict: the plan still stands under maintainer pressure. The strongest
objection is not "pagination is spaghetti"; it is "the example and proof
harness are teaching too much local policy as if it were the API." That is a
real problem and it is exactly where the decoupling should happen.

| Objection | Severity | Answer | Plan delta |
| --- | --- | --- | --- |
| Why is pagination in Plite at all? | high | Raw Plite is not getting a product Pages feature. `plite-layout` exposes derived layout snapshots, provider boxes/units, and page projections outside the document value. `PagedEditable` composes that with `Editable`. | Keep the package boundary; do not turn pages into document nodes. |
| This smells like a word processor package. | high | Only the example is word-processor-like. The package APIs are generic: `usePliteLayout`, `PagedEditable`, `nodeLayout`, boxes, units, split policy, and `pageBreaks`. | Split the example so product fixtures/renderers are obviously optional. |
| The 1620-line example makes the API look impossible. | high | Agreed. Controls, URL state, rich fixtures, table row generation, stress pages, provider layout, row windowing, projection, renderers, metrics, and page chrome are all in one file. | First execution move is example decoupling, not a package rewrite. |
| Selection, clipboard, IME, and find cannot rely on missing DOM. | high | Correct. `plite-react` remains the owner of DOM materialization, coverage boundaries, selection, clipboard, and IME. Page virtualization cannot claim native parity until proof exists. | Keep missing-DOM behavior as an explicit degradation boundary and proof gate. |
| Pretext uses browser/canvas measurement, so strict page breaks drift. | high | Correct for strict fidelity. Default layout is within-browser derived layout. Strict collaboration/export uses opt-in `pageBreaks` snapshots with document key, root, version, measurement profile, and writer id. | Keep `pageBreaks` as metadata, not Plite value structure. |
| Tables spanning pages will corrupt the AST if visual fragments become nodes. | high | The plan explicitly rejects AST table splitting. Table rows are provider-owned units; visual fragments are projection/rendering state. | Keep provider units local unless a reusable generic helper earns promotion. |
| TanStack Virtual could leak into the API. | medium | It should not. The public knob stays `domStrategy={{ type: 'virtualized' }}` plus `pageView`. TanStack stays internal range machinery. | No public TanStack option pass-through. |
| `flushSync` on scroll and page item getter allocations are risky. | medium | Agreed. They are pressure points, not architecture blockers. `flushSync` needs scroll-trace proof; getters should return memoized arrays or prove bounded calls. | High-risk pass must name profiler/trace gates before closure. |
| Table row windowing deserves a helper now. | medium | Not yet. One example consumer is not enough. The candidate helper is `structured child units + visible child ranges + content boundaries`, but promotion needs a second consumer or unreadable call-site after the split. | Keep it local in the first cleanup. |
| A11y and native find claims are unsafe with page virtualization. | medium | Agreed. The plan keeps those as non-claims until assistive-tech/native traversal proof exists. | Handoff must say virtualized pagination has a degradation contract. |
| Why not solve everything in `plite-react` virtualized root planning? | medium | Because page geometry and page break policy are layout concerns; `plite-react` should only materialize DOM according to a plan. | Keep layout/projection in `plite-layout`; keep DOM/native behavior in `plite-react`. |
| Does this create a migration burden for Plate or slate-yjs? | medium | The substrate helps migration because it avoids product schema commitments. Plate can own Markdown/table UX; slate-yjs/export can opt into authoritative `pageBreaks`. | No current Plate/slate-yjs adapter is required for raw Plite plan closure. |

Maintainer decision record:

- Keep: `plite-layout`, `usePliteLayout`, `PagedEditable`, provider-owned
  boxes/units/split policy, page/spread virtualization, opt-in `pageBreaks`.
- Split: canonical pagination example, controls, fixtures, provider/renderers,
  stress mutation, row-windowing glue, metrics/debug chrome.
- Defer: reusable structured-node row-window helper until reuse or call-site
  proof.
- Reject: pages as AST nodes, raw Plite table/Markdown product APIs, public
  TanStack option pass-through, native/a11y parity claims without proof, issue
  closure from architecture alone.

Maintainer acceptance conditions for this plan:

- The public call-site stays centered on `usePliteLayout` plus `PagedEditable`.
- Package APIs remain generic and documented as derived layout state.
- The example split proves the API shape without hiding essential complexity in
  magical helpers.
- Browser proof covers page-boundary clicking, margin hit testing, text
  selection, table spanning, fast scroll, middle typing, and virtualized DOM
  counts.
- Performance proof covers p95/p99 interaction latency, DOM count, mounted page
  surfaces, rows/cells, and memory pressure for the 1000-page route.
- Issue/reference text keeps `#5944`, `#790`, and native/a11y rows as related or
  proof-route backlog until the proof exists.

## High-risk deliberate mode

Status: complete.

Triggered because this lane touches browser runtime, selection, virtualization,
rendering contracts, strict page-break metadata, and package/example
boundaries.

Deliberate-mode verdict:

- no package rewrite;
- no public TanStack API;
- no AST page/table fragments;
- no raw Plite product table/Markdown APIs;
- no native find, screen-reader, or strict export parity claim without direct
  proof;
- yes to example/proof-harness split first;
- yes to proof gates before any `#5944`, `#790`, native/a11y, or production-fast
  claim.

High-risk gates:

| Risk | Failure mode | Owner | Required proof before execution closeout |
| --- | --- | --- | --- |
| Hidden DOM selection drift | Page virtualization or row windowing selects the wrong block, jumps to a table, or loses margin hit testing. | `plite-react` DOM materialization + `PagedEditable` projection | Keep/fix pagination Playwright rows for first-page margins/corners, current visible page corners, left/right paragraph margins, virtualized block clicks, virtualized page-line drag selection, virtualized line-start margin clicks, and split projected paragraph click/edit alignment: `apps/www/tests/plite-browser/donor/examples/pagination.test.ts:1722-2106`, `:2338-2709`. |
| Table fragment corruption | A visual table fragment becomes document structure or copy/edit crosses page units incorrectly. | provider-owned units + `plite-react` coverage boundaries | Keep package table-unit contract and browser table rows: `packages/plite-layout/test/page-layout-contract.test.ts:973-1035`, browser table render/edit/copy rows at `apps/www/tests/plite-browser/donor/examples/pagination.test.ts:1573-1718`, deferred table input row at `:2709-2785`, and 1000-page table row at `:2792-2968`. |
| Scroll long tasks / blank pages | Fast scrolling through virtualized pages blocks React, loses content, or overmounts DOM. | `PagedEditable` viewport tracking + `plite-react` page mount plan | Keep startup/dropdown latency rows and fast-scroll row: `apps/www/tests/plite-browser/donor/examples/pagination.test.ts:2228-2335`, `:3431-3570`; preserve p50 `<= 80ms`, p95 `<= 500ms`, DOM `< 1400`, rows `<= 80`, cells `<= 240`, page surfaces `<= 10`. |
| Middle-document typing lag | Typing in a 1000-page document drops or reorders characters. | layout refresh scheduling + `EditableTextBlocks` text sync | Keep deferred refresh package contract and browser typing rows: `packages/plite-layout/test/page-layout-contract.test.ts:477-509`, `apps/www/tests/plite-browser/donor/examples/pagination.test.ts:2970-3192`, `:3194-3302`, `:3315-3418`; preserve p95 event-to-paint `<= 80ms` and bounded DOM `< 1400`. |
| Page-surface alignment drift | Scaled or virtualized page chrome no longer matches editable overlay coordinates. | `plite-layout` geometry/projection + `PagedEditable` page surfaces | Keep scaled page surface alignment and projected click rows: `apps/www/tests/plite-browser/donor/examples/pagination.test.ts:2566-2709`, `:3573-3657`. |
| Over-decoupling | Split files but hide the same policy tangle behind magical helpers. | example owner | Add a decoupling guard in execution: canonical `/examples/pagination` call-site must stay centered on `usePliteLayout` + `PagedEditable`; fixtures, controls, provider/renderers, metrics, and stress mutation move one import away; no test asserts filenames. |
| Public API bloat | Local table/windowing glue becomes a raw Plite product API too early. | `plite-layout` API owner | Helper promotion requires either a second structured-node provider or a post-split call-site that is still unreadable. Until then, table row windowing remains example-local. |
| Strict page-break drift | Browser/canvas measurement drift makes collab/export page breaks disagree. | `plite-layout` `pageBreaks` metadata | Keep opt-in page-break contracts at `packages/plite-layout/test/page-layout-contract.test.ts:364-437`, `:1064-1143`, and source profile checks at `packages/plite-layout/src/index.ts:2488-2534`; app-level authority owns writer/server/client policy. |
| Native/a11y overclaim | Virtualized missing DOM is sold as native browser find or screen-reader parity. | release narrative + docs | Keep as non-claim until there is assistive-tech/native traversal proof. The final handoff must explicitly call this a degradation boundary, not solved behavior. |
| Issue-claim inflation | Architecture review accidentally claims `#5944` or `#790`. | issue/reference sync owner | Closure must re-read issue ledgers and PR reference. No fixed/improved claim unless the browser/perf rows above are green and issue-specific proof is mapped. |

Proof commands for execution mode:

| Command | Cwd | Required when |
| --- | --- | --- |
| `bun --filter plite-layout test -- page-layout-contract` | `Plate repo root` | Any layout/provider/page-break/page-mount change. |
| focused pagination Playwright rows named above | `Plate repo root` | Any pagination example, `PagedEditable`, projection, DOM strategy, selection, table, or scroll change. |
| `bun test playwright/integration/examples/query-controls.test.ts --grep pagination` or repo-local equivalent | `Plate repo root` | Any URL control/example split change. |
| Evidence Kit `react-pagination-page-virtualization` refresh once registered | `plate-2` | Any broad performance claim or issue `#790` claim. |

Release blockers created by this pass:

- `#5944` stays related until page-boundary editing, margin hit testing, and
  flicker/stability rows cover the exact failure.
- `#790` stays proof-route backlog until the 1000-page route has active
  benchmark evidence, not only Playwright assertions.
- Native find/screen-reader parity stays not claimed.
- Strict collab/export page-break fidelity stays opt-in; app-level authority
  owns writer policy.
- Example cleanup is required before new pagination features. Otherwise we keep
  pouring concrete into a 1620-line stress harness.

## Ecosystem maintainer pass

Status: complete.

Ecosystem verdict:

- Pretext is still the right default engine, but only with an honest
  measurement contract.
- Premirror remains the rendering shape to preserve: derived snapshot,
  measurement, composition, page chrome outside the document, one editable
  overlay.
- TanStack Virtual stays internal range machinery.
- Tiptap Pages remains negative evidence: steal the failure taxonomy, reject the
  CSS-float/page-gap mechanism and product table kit.
- Raw Plite owns generic layout/projection substrate; Plate/app packages own
  Markdown syntax, table UX, export policy, and app-specific collaboration
  guarantees.

Evidence used:

- `docs/research/sources/editor-architecture/pretext-pagination-page-virtualization.md:28-52`
  says Pretext avoids hot-path DOM reflow but still depends on
  canvas/browser measurement, so Plite must not promise cross-client or
  server-stable page breaks by default.
- `docs/research/sources/editor-architecture/pretext-pagination-page-virtualization.md:54-80`
  records profile-sensitive drift and requires measurement-profile vocabulary
  before strict fidelity claims.
- `docs/research/sources/editor-architecture/pretext-pagination-page-virtualization.md:119-157`
  maps Tiptap page-limit failures to Plite proof requirements while rejecting
  CSS floats, AST node splitting, and raw product TableKit scope.
- `docs/research/sources/editor-architecture/pretext-pagination-page-virtualization.md:159-187`
  keeps Premirror's derived layout shape, TanStack as internal range machinery,
  page-level virtualization, opt-in authoritative page breaks, and browser proof
  before native parity.
- `docs/research/sources/editor-architecture/layout-measurement-and-ime-lanes.md:24-64`
  keeps layout derived and measurement separate from ordinary overlay policy.
- `docs/solutions/developer-experience/2026-05-22-raw-slate-should-not-own-markdown-table-product-packages.md:45-79`
  keeps raw Plite focused on substrate and leaves Markdown/table product UX to
  Plate/app packages.
- `packages/plite-layout/test/page-layout-contract.test.ts:364-437`
  proves opt-in, profile-checked, shared, persistent page-break snapshots.
- `packages/plite-layout/test/page-layout-contract.test.ts:1064-1143`
  proves provider-owned unit fragments can write/read authoritative page breaks
  without splitting the table node.

### Authoritative page-break policy

Best long-term API/DX decision: raw Plite exposes the `pageBreaks` protocol;
the app chooses the authority.

| Mode | Owner | Contract | Claim allowed |
| --- | --- | --- | --- |
| Default editing | local client | Compute layout locally from document, page settings, typography, engine, and measurement profile. Do not persist page breaks unless requested. | Same-browser responsive layout only. |
| Single-user print/export | current client or export worker | Write `pageBreaks` with `writerId`, document key, document version, root, and measurement profile; export reads the same snapshot. | Strict for that writer/profile only. |
| Live collaboration | app-level authority | One elected client, server worker, or app coordinator writes the accepted snapshot into a shared/persistent field; other clients read it if document/profile/root/version match, else mark stale and recompute locally. | Agreed page breaks for peers that accept the same profile. |
| Server/PDF/DOCX export | server/export pipeline | Use an explicit measurement profile. Until Pretext has a fully headless browser-equivalent measurer, this likely means a browser-backed worker or an app-owned export engine. | Export fidelity for that export engine/profile, not universal browser parity. |

Raw Plite should not choose one authority because that turns an editor substrate
into a collaboration/export product. The substrate should make the policy easy:
`read`, `write`, `writerId`, `documentKey`, `version`, `root`,
`measurementProfile`, accepted/stale status, and history-skipped shared state.

### Collab/export answer

- Page breaks are derived metadata, not document value and not undo history.
- `pageBreaks` may be shared and persisted, but it must be profile-checked.
- If the snapshot is stale by document key, root, version, or measurement
  profile, clients ignore it for strict layout and recompute locally.
- Strict collab/export must name the authority before claiming exact page
  agreement.
- A future headless Pretext engine can improve authority choice, but the current
  API should already support server/client authority without changing the Plite
  value shape.

### Ecosystem answers

| Objection | Answer |
| --- | --- |
| Pretext is not headless yet. | True. Keep it anyway for hot-path layout, but make profile-aware local layout the default and strict page breaks opt-in. |
| Server export needs deterministic breaks. | Then the export pipeline must be the authority and write/read a snapshot with its measurement profile. Raw Plite cannot promise server-browser identity by default. |
| Live collab peers need the same page count. | They can read an app-authoritative snapshot. If their measurement profile is stale or incompatible, they should show local layout or a stale/readonly state, not pretend parity. |
| Tiptap has Pages/TableKit. | Use its failure list, not its architecture. CSS floats, manual document splitting, and product table behavior are exactly what raw Plite should avoid. |
| TanStack can virtualize everything. | It can drive internal ranges. It cannot own Plite selection, clipboard, IME, missing DOM, a11y, or issue claims. |
| Plate needs real product tables/Markdown. | Good. Plate/app packages should build that on top of raw Plite's provider boxes/units, selection primitives, and layout projection substrate. |

Plan change from this pass:

- The open `pageBreaks` owner question is answered: app-level authority owns
  strict policy; raw Plite owns only the protocol and stale/accepted state.
- Strict collab/export becomes a clean extension point, not a reason to put page
  fragments in the Plite document.
- Ecosystem evidence strengthens the existing decision: decouple the example,
  keep the package substrate, and do not promote product table/Markdown APIs.

## Issue sync accounting

Status: complete.

Final sync decision: update the manual sync ledger and PR reference; no coverage
matrix or fork dossier edit is needed because the related/not-claimed issue
classifications already match the final plan.

Evidence re-read:

- Live generated open rows still list `#5944`, `#5924`, and `#790` as singleton
  current rows: `docs/plite-issues/gitcrawl-live-open-ledger.md:37`,
  `:41`, `:646`.
- Existing manual sync already had the fast-scroll and Pretext pagination
  no-claim rows: `docs/plite-issues/gitcrawl-v2-sync-ledger.md:110-150`,
  `:623-647`.
- Issue coverage matrix already classifies Pretext/pagination rows correctly:
  `docs/plite/ledgers/issue-coverage-matrix.md:426-475`.
- Coverage matrix exact issue rows keep `#5924` not claimed and `#790`
  proof-route backlog: `docs/plite/ledgers/issue-coverage-matrix.md:589`,
  `:757`.
- Fork issue dossier already has Pretext pagination issue accounting:
  `docs/plite/ledgers/fork-issue-dossier.md:7828-7857`.
- PR reference already described the small beta pagination API and no issue
  claim: `docs/plite/references/pr-description.md:304-317`.

Edits made:

- Added `2026-05-30 Pagination Architecture Review Final Sync Notes` to
  `docs/plite-issues/gitcrawl-v2-sync-ledger.md:649-673`.
- Updated `docs/plite/references/pr-description.md:312-317` to say apps or
  export pipelines own authoritative `pageBreaks` writer policy while raw Plite
  owns only the protocol and accepted/stale status.

Final classification table:

| Issue / cluster | Final status | Why no broader claim |
| --- | --- | --- |
| `#5944` stable pagination | issue-reviewed, unchanged | Directly related, but needs browser proof for page-boundary flicker, caret mapping, stable edits, and page-break stability across fragments. |
| `#790` dynamic rendering | proof-route backlog, unchanged | Page/spread virtualization targets the problem, but still needs active benchmark proof, mounted-count proof, DOM coverage proof, and browser native-behavior proof. |
| `#5924` structural DOM exclusion | not claimed, unchanged | Page chrome/table/media/debug DOM route through DOM coverage, mount policy, and provider-owned fragments, not a public ignore-cursor API. |
| `#5131`, `#2051`, `#4141` | guardrails unchanged | Layout snapshots, fragments, and page virtualization must preserve narrow subscriptions and rerender breadth. |
| `#2793`, `#2572` | release guard / policy non-claim unchanged | Missing-DOM/page-virtualized modes cannot claim screen-reader or accessibility parity without assistive-tech proof or explicit degradation docs. |
| `#3892` | policy non-claim unchanged | Generic layout substrate helps custom surfaces, but product custom layout engines remain outside raw Plite closure. |
| `#5945`, `#4056`, `#5992` | existing improves unchanged | Existing large-document operation/clipboard claims remain owned by their current proof rows and are not promoted by this pagination review. |

Reference-sync consequence:

- The plan remains a no-new-claim architecture review.
- PR/reference wording now matches the final strict-fidelity policy.
- Closure can now decide final readiness without another issue-ledger pass.

## Execution phases after user acceptance

Planning only. Execution requires user acceptance of the final plan.

1. Split the example with no behavior change.
2. Keep `/examples/pagination` as the canonical route.
3. Preserve package APIs: `usePliteLayout`, `PagedEditable`, provider
   boxes/units/split policy, internal DOM strategy bridge, and opt-in
   `pageBreaks`.
4. Decide whether table row windowing
   remains local or becomes a tiny generic helper.
5. Rerun package tests, focused pagination Playwright rows, query controls, and
   the Evidence Kit benchmark if registered or if a broad performance claim is
   made.
6. Sync issue/reference rows only if proof changes a claim; otherwise keep
   `#5944`, `#790`, and native/a11y rows as non-claims.

## Fast driver gates

| Gate | Cwd | Command / proof | Status |
| --- | --- | --- | --- |
| Layout contract | `Plate repo root` | `bun --filter plite-layout test -- page-layout-contract` | passed, 37 tests |
| Pagination browser sweep | `Plate repo root` | focused `playwright/integration/examples/pagination.test.ts` rows | execution gate named; not run in planning |
| Example query controls | `Plate repo root` | `playwright/integration/examples/query-controls.test.ts` pagination row | execution gate named; not run in planning |
| Evidence Kit refresh | `plate-2` | `npm run bench:editor:refresh` | candidate benchmark gap; required before broad perf or `#790` claim |
| Plan completion check | `plate-2` | Plite Plan closure audit | passed; generic autogoal script not run because this plan uses the Plite Plan markdown shape |

## Pass schedule and state

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| Current-state read and initial score | complete | live source reads, prior plan/research reads, docs/solutions reads, Evidence Kit health, `plite-layout` test pass | initial verdict: keep substrate, decouple example/provider layers | score 0.76; later passes closed issue sync | related issue discovery |
| Related issue discovery | complete | generated live rows, v2 sync ledger, coverage matrix, fork dossier, test-candidate maps, PR reference | reused existing pagination/fast-scroll issue coverage; no new ClawSweeper or broad live issue sweep | score 0.78, next pass completed below | issue-ledger pass |
| Issue-ledger pass | complete | full ledger family scan: live rows, frozen cluster ledger, macro clusters, package impact matrix, issue requirements, benchmark candidate map, current sync ledger, PR reference | no durable ledger/reference update needed then; score 0.80; decouple example/provider/proof boundaries, not packages | final sync closed in issue-sync pass | intent/boundary and decision brief |
| Intent/boundary and decision brief | complete | refreshed intent, scope, non-goals, hard boundaries, adoption story, decision drivers, invalidated alternatives, consequences | score 0.82; package substrate kept; example/proof harness split made explicit | none known | research/ecosystem/live-source refresh |
| Research/ecosystem/live-source refresh | complete | Pretext, Premirror, TanStack, Tiptap, Plate/app-boundary, local solutions, and current `Plate repo root` source rows | score 0.84; TanStack upgrade action marked already satisfied; ecosystem synthesis closed; pageBreaks/provider/overlay boundary confirmed | none from research | performance/DX/migration/regression/simplicity pressure |
| Performance/DX/migration/regression/simplicity pressure | complete | React/performance/TDD/effect/DX pressure rows; Playwright/package test budgets; live source pressure rows | score 0.86; package architecture survives; example/proof harness and getter allocations remain pressure points | maintainer objections closed below | Plite maintainer objection ledger |
| Plite maintainer objection ledger | complete | twelve maintainer objections with keep/split/defer/reject decisions and acceptance conditions | score 0.88; package boundary stands; high-risk proof rows now need exact gates | none from objections | high-risk deliberate mode |
| High-risk deliberate mode | complete | proof gates for hidden DOM, table fragments, scroll, middle typing, page-surface alignment, over-decoupling, API bloat, page-break drift, native/a11y non-claims, and issue-claim inflation | score 0.90; exact execution proof rows and release blockers named | none from high-risk pass | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | Pretext measurement contract, authoritative page-break policy, collab/export authority modes, Tiptap/Premirror/TanStack/Plate ownership answers | score 0.92; app-level authority owns strict page-break policy; raw Plite owns protocol only | none from ecosystem | revision pass |
| Revision pass | complete | stale bridge, scorecard, page-break, execution-phase, fast-gate, and open-question wording reconciled | score 0.94; plan now reads as settled architecture review with only sync/closure remaining | issue sync closed below | issue sync accounting |
| Issue sync accounting | complete | re-read live rows, manual sync ledger, coverage matrix, fork dossier, and PR reference; added final 2026-05-30 sync row and PR pageBreaks authority wording | score 0.96; no new fixed/improved claims; no coverage matrix/fork dossier edits needed | closure/final handoff closed below | closure score and final gates |
| Closure score and final gates | complete | audited frontmatter, pass schedule, fast gates, issue/reference sync, execution-only risks, and final handoff | score 0.98; lane ready for user review; no planning pass remains runnable | none | none |

## Plan deltas from this pass

- Added hard verdict: not core spaghetti; example/provider layer needs
  decoupling.
- Added source-backed boundary between `plite-layout`, `PagedEditable`,
  `plite-react`, and the example.
- Added initial score `0.76`.
- Added candidate benchmark for pagination page virtualization.
- Added no-raw-Plite-table-package guardrail from `docs/solutions`.
- Left final issue/reference sync for the dedicated sync pass, then closed it
  before final gates.
- Related issue discovery pass reused existing ledger coverage for `#5944`,
  `#790`, `#5924`, a11y/custom-surface guards, and large-doc carryover; no
  fixed/improved issue claims changed.
- Full issue-ledger pass read the live rows, frozen ledger rows, macro clusters,
  package impact matrix, requirements, benchmark candidate map, current sync
  ledger, and PR reference.
- Confirmed no new durable no-claim row is useful: existing sync and PR text
  already cover this pagination architecture review.
- Raised score to `0.80` because issue accounting is closed; kept the lane
  pending because intent/decision refresh, pressure lenses, objection ledger,
  and final gates remain.
- Refreshed the intent/boundary record after issue-ledger accounting: package
  graph stays, example/proof harness splits, issue closure stays proof-gated.
- Refreshed the decision brief with drivers, invalidated alternatives,
  adoption story, and consequences.
- Raised score to `0.82`; kept the lane pending because ecosystem synthesis,
  pressure lenses, maintainer objections, revision, sync recheck, and final
  gates remain.
- Refreshed research/ecosystem/live-source evidence: Pretext stays the engine,
  Premirror stays the page-overlay shape, TanStack stays internal and is already
  on the targeted version, Tiptap remains negative evidence, and Plate/app
  packages keep product table/Markdown ownership.
- Confirmed `pageBreaks` read/write already supplies the strict-fidelity
  extension point without polluting Plite document values.
- Raised score to `0.84`; kept the lane pending because pressure lenses,
  maintainer objections, revision, sync recheck, and final gates remain.
- Applied React/performance/TDD/effect/DX pressure: package architecture
  survives, but `flushSync` scroll correctness, `EditableLayout` getter
  allocations, and the 1620-line example/proof harness stay high-pressure
  execution concerns.
- Converted the strongest maintainer objections into explicit keep/split/defer
  and reject decisions: keep generic layout substrate, split example/proof glue,
  defer reusable row-window helpers, reject AST page/table fragments and public
  TanStack option pass-through.
- Raised score to `0.88`; kept the lane pending because high-risk proof gates,
  ecosystem maintainer pass, revision, issue sync recheck, and final gates
  remain.
- Closed high-risk deliberate mode with execution proof gates for hidden DOM
  selection drift, table fragment integrity, scroll latency, middle-document
  typing, page-surface alignment, over-decoupling, premature API promotion,
  strict page-break drift, native/a11y non-claims, and issue-claim inflation.
- Raised score to `0.90`; kept the lane pending because ecosystem/collab/export
  answers, revision, issue sync recheck, and closure gates remain.
- Closed the ecosystem maintainer pass: Pretext stays default with
  profile-aware local layout; strict collab/export uses opt-in authoritative
  `pageBreaks`; app-level authority owns writer policy; raw Plite owns protocol
  only.
- Raised score to `0.92`; kept the lane pending because revision, issue sync
  recheck, and closure gates remain.
- Closed the revision pass by removing stale current-state language around the
  `EditableLayout` bridge, strict page-break ownership, regression mapping,
  execution phases, fast driver gates, and open questions.
- Raised score to `0.94`; kept the lane pending because issue sync accounting
  and closure gates remain.
- Closed issue sync accounting by adding the final manual ledger row, updating
  the PR reference for app/export `pageBreaks` authority, and preserving all
  related/not-claimed classifications.
- Raised score to `0.96`; kept the lane pending because closure audit and final
  handoff remain.
- Closed the final gates: every scheduled pass is complete, issue/reference
  accounting is synced, execution-only risks have owners, and no planning pass
  remains runnable.
- Raised score to `0.98`; the lane is ready for user review.

## Execution-only follow-up

- `react-pagination-page-virtualization` is required before any broad
  performance or `#790` claim, not before the behavior-preserving example split.
- `EditableLayout` stays an internal bridge unless profiler proof or a second
  consumer justifies a smaller named contract.
- Table row windowing stays example-local unless execution proves reuse or
  unreadable call-site complexity after the split.

## Closure score and final gates

Status: complete.

Closure audit:

| Requirement | Status | Evidence |
| --- | --- | --- |
| Live-source current state recorded | complete | `Live source current state` and `Research / ecosystem / live-source refresh` cite current `Plate repo root` owners. |
| Issue/reference accounting complete | complete | `Issue sync accounting` updated the manual sync ledger and PR reference. |
| Evidence Kit mapping complete | complete | `Evidence Kit benchmark mapping` records current coverage and the `react-pagination-page-virtualization` candidate. |
| React/performance/TDD pressure complete | complete | `Performance / DX / migration / regression / simplicity pressure` records React, performance, TDD, effect, and DX findings. |
| Decision brief complete | complete | `Decision brief` names principles, drivers, options, rejected alternatives, consequences, and follow-ups. |
| Maintainer objections complete | complete | `Plite maintainer objection ledger` records keep/split/defer/reject answers. |
| High-risk gates complete | complete | `High-risk deliberate mode` names proof rows and release blockers. |
| Ecosystem/collab/export policy complete | complete | `Ecosystem maintainer pass` assigns strict `pageBreaks` authority to apps/export pipelines. |
| Revision pass complete | complete | `Revision pass` row is complete in the pass schedule. |
| Final handoff complete | complete | `Final handoff` below is the user-review-ready handoff. |

Closure score: `0.98`.

The plan does not score `1.00` because execution still needs browser traces,
focused Playwright rows, and benchmark evidence before production-fast,
native/a11y, strict export, `#5944`, or `#790` claims. That is execution risk,
not planning incompleteness.

No planning pass remains runnable.

## Final handoff

Verdict: pagination is not core spaghetti. The packages are mostly right; the
canonical example/proof harness is the mess and should be split before more
features land.

Keep:

- `plite-layout` as the derived layout/projection substrate.
- `usePliteLayout` as the public layout entrypoint.
- `PagedEditable` as page chrome plus one Plite editable overlay.
- Provider-owned boxes, units, split policy, and measurement profile handling.
- Page/spread virtualization behind virtualized `domStrategy`.
- Opt-in `pageBreaks` for strict-fidelity metadata.

Split first:

- `pagination.tsx` call-site shell.
- controls and URL state.
- rich fixtures and stress mutation.
- layout provider logic.
- renderers/page chrome/metrics.
- optional local table row-window glue.

Do not do:

- no package rewrite;
- no extra `/examples/pagination-basic`;
- no raw Plite Markdown/table product packages;
- no public TanStack options;
- no AST table splitting for visual fragments;
- no public ignore-cursor API;
- no native find, screen-reader, strict export, `#5944`, or `#790` claim from architecture alone.

Authority rules:

- raw Plite owns the `pageBreaks` protocol, profile checks, and accepted/stale
  status;
- apps or export pipelines own the authoritative writer policy for
  collaboration/export;
- table/media/BFC-like layout policy stays provider-owned until reuse proves a
  generic helper is worth promoting.

Execution proof gates:

- keep package contract coverage for layout, provider units, page mount plans,
  and `pageBreaks`;
- keep focused pagination Playwright rows for click, selection, margin hit
  testing, table fragments, middle typing, fast scroll, and virtualized DOM
  counts;
- keep query-control rows for URL-backed controls;
- register or run `react-pagination-page-virtualization` before broad perf or
  `#790` claims.

Ready for user review. Execution starts only after explicit acceptance.

## Execution closeout

Status: complete.

Implementation:

- Split `/examples/pagination` without changing the canonical route or package
  APIs.
- Kept `site/examples/ts/pagination.tsx` as the visible call-site around
  `usePliteLayout` and `PagedEditable`; it is now `539` lines instead of the
  prior `1620`.
- Added example-local modules:
  - `site/examples/ts/pagination-constants.ts` for state field, query parsers,
    control types, and layout constants.
  - `site/examples/ts/pagination-controls.tsx` for URL-backed toolbar controls.
  - `site/examples/ts/pagination-fixtures.ts` for rich Markdown/stress/table
    fixtures.
  - `site/examples/ts/pagination-renderers.tsx` for projected renderers,
    leaf rendering, and local table row-window glue.
  - `site/examples/ts/pagination-page-view.tsx` for page chrome and
    `PagedEditable` viewport composition.
- Accepted autoreview's stale-path finding in
  `packages/plite-react/src/editable/root-interaction-controller.ts`: coordinate
  placement now returns `null` when a stale DOM `data-plite-path` no longer
  exists, allowing the existing event-range fallback instead of throwing.

Issue/reference sync:

- No new `Fixes #...` or `Improves #...` claim.
- `#5944`, `#790`, `#5924`, native/a11y, and strict export remain proof-gated
  as documented above.
- No PR-reference or issue-ledger claim text changed during execution.

Verification:

| Command | Cwd | Result |
| --- | --- | --- |
| `bunx biome check packages/plite-react/src/editable/root-interaction-controller.ts site/examples/ts/pagination.tsx site/examples/ts/pagination-constants.ts site/examples/ts/pagination-controls.tsx site/examples/ts/pagination-fixtures.ts site/examples/ts/pagination-page-view.tsx site/examples/ts/pagination-renderers.tsx --fix` | `Plate repo root` | passed; no fixes needed on final run |
| `bunx eslint packages/plite-react/src/editable/root-interaction-controller.ts site/examples/ts/pagination.tsx site/examples/ts/pagination-controls.tsx site/examples/ts/pagination-page-view.tsx site/examples/ts/pagination-renderers.tsx` | `Plate repo root` | passed |
| `bun typecheck:site` | `Plate repo root` | passed |
| `bun --filter plite-react typecheck` | `Plate repo root` | passed |
| `bun --filter plite-layout test -- page-layout-contract` | `Plate repo root` | passed, 37 tests |
| `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/pagination.test.ts playwright/integration/examples/query-controls.test.ts --project=chromium --grep "pagination"` | `Plate repo root` | passed, 33 Chromium tests |
| `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local` | `Plate repo root` | clean on rerun; no accepted/actionable findings |

No accepted execution item remains runnable.
