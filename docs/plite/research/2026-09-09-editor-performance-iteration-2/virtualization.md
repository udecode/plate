# Virtualization is a separate editing contract

Keep the full-DOM benchmark as the reference for ordinary rich-text behavior. Virtualization can make huge documents usable by mounting less content, but a fast omitted-DOM result cannot establish equal full-DOM performance. The current Plite virtualized mode is experimental; this research does not promote it to a universal default.

The first experiment is a deletion at the current owner: missing-range plans copy all hidden node keys even though the boundary consumer uses only indexes and endpoint keys. The larger opportunity is visible-content-bounded work, with explicit native-service and materialization costs. Do not replace TanStack Virtual merely because another editor uses a height tree.

## Four mechanisms that must remain distinct

| Mechanism | DOM | Work it can avoid | Work it cannot automatically avoid | Main contract cost |
| --- | --- | --- | --- | --- |
| Full DOM | Every editable block is present | Ordinary keyed render/update locality | Mounting/layout of every node; whole-document model or parser work | Baseline browser editing services remain available to validate |
| Grouped/staged DOM | Content remains represented, with grouped or staged rendering behavior | Some React reconciliation and layout/paint work | Model scans, full-text highlighting, retained DOM memory | Containment can change geometry, overlays and activation behavior |
| `content-visibility: auto` | DOM remains present | Layout and painting of skipped content | DOM construction, model work, all JS effects | First activation, intrinsic sizing, print and selection behavior need proof |
| Viewport omission | Only visible and explicitly retained content is mounted | Most offscreen DOM creation/layout; potentially per-view work | Model, history, collaboration, parser or index work unless independently bounded | Missing DOM changes coordinate, selection, Find, print and accessibility jobs |

Plite's `create-segment-plan.ts` exposes ordinary `auto`, `full` and `staged` modes; `virtualized` is an explicit object configuration. The exact strategies and aliases belong to current source, not a synthetic benchmark label. The common nine-editor packet uses full DOM. Slate's comparison enables root chunk size 1,000 and does not enable `content-visibility` in that cohort.

## What the reference editors actually contribute

**CodeMirror:** `../codemirror-view/src/viewstate.ts` maintains a measured/estimated height model, a main viewport, extra viewports around offscreen selection endpoints, visible ranges and horizontal long-line gaps. It separates measurement from updates. A height scaler addresses browser pixel limits above 7,000,000 pixels. Printing changes the viewport policy. The useful mechanism is bounded work with explicit geometry truth; its text model and DOM contract cannot be pasted into arbitrary React rich-text nodes. The [official guide](https://codemirror.net/docs/guide/) also makes the limitation clear: missing offscreen layout cannot answer ordinary DOM-coordinate queries.

**ProseKit:** current page rendering creates a decoration for each top-level block; its layout leader batches work and scans page chunks to set padding. This is full-DOM pagination, not proof of viewport virtualization. Its pagination and virtual-selection tests still contribute portable selection, measurement and teardown invariants. Do not award a virtualization speed score from the feature name.

**Wordgard:** current view/content ownership and text chunks are useful comparison targets for bounded redraw and immutable values. The measured common packet is not a virtualized fixture. Its persistent chunks do not establish that any omitted-DOM strategy satisfies Plate's arbitrary React node views or native services.

**VS Code/Monaco:** line-oriented viewport rendering and piece-tree aggregates solve large source files. Rich-text paragraphs, tables, widgets and browser-native selection impose additional laws. VS Code's GPU capability check rejects RTL, overlong columns, non-regular decorations and unsupported CSS/pseudo-selectors. A universal GPU rewrite is rejected; targeted layout or indexing mechanisms remain independent leads.

**TanStack Virtual:** the existing imperative adapter already owns scroll measurement and range extraction. Compiler compatibility must be solved at the immutable values consumed by React, without assuming a mutable virtualizer object is a reactive snapshot. A compiler skip at that boundary may be correct.

**CSS containment:** [`content-visibility: auto`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content-visibility) retains DOM and participates in user-agent features such as Find and focus, unlike `hidden`. That platform contract is a reason to test it, not proof that nested editor geometry, print, selection painting and copied content are correct in this application.

## Current local ownership and deletion candidates

`packages/plitejs/src/react/dom-strategy/use-virtualized-root-plan.ts` combines virtualizer measurements, retained indexes, root-block items and missing ranges. It preserves selection endpoints, selected blocks and a promoted block outside the ordinary viewport. `packages/plitejs/src/pagination/page-mount-plan.ts` separately retains selected, promoted and composing pages. Keep those behaviors under one exact mounted-view authority; a global editor ID is insufficient for two views of the same model.

**E19 — remove hidden-key copies.** `getMissingRanges` slices every unmounted segment into a `nodeKeys` array, then uses its first/last entries. The consumer in `editable-text-blocks.tsx` builds the DOM coverage boundary from start/end indexes, boundary ID and endpoint keys; it does not read that array. The proposed private representation is:

```ts
type MissingRange = {
  startIndex: number;
  endIndex: number;
  boundaryId: string;
  anchorNodeKey: NodeKey | null;
  focusNodeKey: NodeKey | null;
};
```

This is an internal sketch using the current NodeKey law, not a new exported API. Read endpoint keys directly from the canonical top-level key array. Delete the copied range array and the unused private field. The disposable probe extracts the exact current function, checks 1,000 generated mounted-range arrangements and times 100 plan calls per sample. It cannot prove native scrolling or authorize product adoption. The first product proof must retain the exact boundary payload, backward scroll, scrollbar drag, dynamic heights and selection/copy across an omitted range.

**E20 — page visibility indexing.** `page-mount-plan.ts` filters all items to determine visibility. A binary search is valid only if ordered non-overlapping intervals are actually guaranteed. Spread pages, dynamic heights and retained pages can violate a naive assumption. First count inspected pages per frame at 800, 5k and 20k pages. Compare an existing-layout-index lookup, an interval search and a full scan. Stop when the scan is not material; reject any target with missing overlapping or retained pages.

**E21 — containment with retained DOM.** Keep the current keyed renderer and test `content-visibility: auto` on the existing block/group owner, using measured intrinsic sizes. Compare cold mount, first activation, forward/reverse scroll, selection and overlay settlement at 100/1k/10k. This deletes offscreen layout work only; no model or subscription gain is assumed. Reject it if native Find/focus/print, range geometry, accessibility or dynamic-height anchoring changes, even when warm scroll improves. Next owner: Benchmark on the actual grouped/full-DOM routes, with Verify Plate's native-service proof.

**E22 — bounded viewport rendering including materialization.** Compare the existing virtualized mode with full DOM and staged rendering, then intervene on one measured source of offscreen work. The target keeps the canonical document, exact mounted view and current selection-retention authority. Measure first click/type in an omitted block, backward scroll, scrollbar dragging, selection/copy across omitted content, and the time/heap needed for native Find or print. Reject a speedup that begins after materialization, delays the first intended edit, grows retained coverage without bound or loses complete-document services. Next owner: Benchmark on cold and warm virtualized interaction recipes; no default-mode or public API promotion follows from the current five-observation packet.

**E23 — immutable window snapshots.** Current code deliberately avoids memoizing the imperative TanStack return value. A useful internal change would publish one immutable `{items, ranges, totalSize, revision}` value when measurements change, and let React read it through the existing view owner. This might remove repeated mutable reads and compiler exclusions. It also creates a synchronization contract; retain the current adapter until the prototype proves no tearing, stale geometry, missed resize or extra render. No public VirtualWindow store is proposed.

Next owners remain independent: E19 goes to Best API for the private payload deletion and exact consumer proof; E20 goes to Benchmark for page-scan attribution; E23 goes to Benchmark for a disposable snapshot/measurement equivalence control. Each retains Defer until its named cost and proof earn adoption, except E19's already justified narrow deletion experiment.

## Required operation matrix

Every row must run against full DOM, staged/grouped, containment where applicable, and viewport omission. Keep each mode's result separate. The canonical target registry already has pagination bursts, real-editor pagination operations and huge-document virtualized traces; retain their original budgets and guards. Five trace samples are diagnostic, not a p95/p99 distribution.

| Family | Required actions and adverse state | Completion oracle |
| --- | --- | --- |
| Cold activation | Mount huge document; click/type in initially omitted block; jump to a far anchor; first resize | Target block exists, first intended character is committed, native/model caret agrees, view is settled |
| Warm text | Type burst, backspace, delete, marks, split/join, soft break, undo/redo | Complete text, marks, structure and selection; no lost staging state |
| Scroll | Wheel/touchpad, PageUp/Down, Home/End, fast reversal, scrollbar thumb, horizontal long line | No blank frame, jumping anchor, missing caret or unexpected retained growth |
| Selection | Pointer drag across range boundaries; Shift navigation; select all; offscreen endpoints; double/triple click | Exact model/native range and visible painting where the mode promises it |
| Clipboard | Copy/cut crossing omitted blocks; rich HTML/plain text paste; large payload; external app round trip | Complete content/structure, correct undo, no omission-based data loss |
| Rich layout | Tables, merged cells, images loading, font swaps, equations, nested views, custom block renderers | Geometry and coverage update without stale offsets or incorrect hit testing |
| Multi-view | Same model in two differently scrolled views; portals; duplicate IDs; read-only view | Commands, focus and retention stay with the exact view; model/history remain shared |
| Composition | IME spanning scroll/resize and composition endpoint retention | Actual native composition commits exactly once; raw device proof remains separate |
| Search | Editor Find next/previous/replace; native browser Find into offscreen text | All promised hits exist; active result materializes and positions correctly |
| Print/export | Browser print; selection print if supported; static HTML/PDF consumers | Complete document, correct pagination/styles and explicit materialization cost |
| Accessibility | Screen-reader navigation across omitted blocks; focus order; announcements; caret browsing | No missing logical content or misleading position; actual assistive-tech proof |
| Teardown/soak | Repeated mount/unmount, long scroll, history retention, remote updates into omitted ranges | Listener/observer/view cleanup; bounded retained DOM/heap; no stale updates |

Browser viewport emulation does not prove real mobile input or screen-reader behavior. A missing hardware lane stays open. There is no automatic browser capability gap merely because an old report said so; inspect the available native tool and route before deciding the exact row.

## What the current runs show

The registered pagination burst target passes with a 65.3 ms virtualized burst versus 62.0 ms for its staged table control, a 1.05 ratio. Its within-burst character metric is 7.4 ms at the runner's p95. The target retains 334 document DOM nodes and three page surfaces. This is one narrow warm-burst recipe, not a complete interaction score. [Raw burst receipt](../../../plans/artifacts/2026-09-09-editor-performance-research-iteration-2/browser-and-repaired-guards/react-pagination-virtualized-char-burst-slate-pagination-virtualized-char-burst-benchmark.json).

The separate real-editor pagination target preserves default and 800-row cohorts, with five observations per operation. Its published p95 is therefore the largest of those five observations; treat it as a diagnostic maximum, not a stable tail estimate. All correctness assertions pass, but several complete recipes remain expensive:

| Virtualized pagination operation | Largest observed duration across cohorts, ms |
| --- | --: |
| Click to caret | 108.0 |
| Drag selection | 190.3 |
| Click/insert break/type recipe | 364.6 |
| Preselected insert break | 200.0 |
| Preselected insert break and type | 284.0 |
| Preselected typing burst | 95.6 |
| Scroll and click | 124.3 |
| Undo and redo | 182.0 |

The same packet reports a 200 ms long task and 200.7 ms long animation frame. Passing the registered command does not make these operations responsive. The difference between a preselected edit and a click-plus-edit recipe makes first-interaction ownership a concrete attribution target. [All 12 operations, both cohorts and original clocks](../../../plans/artifacts/2026-09-09-editor-performance-research-iteration-2/browser-and-repaired-guards/react-pagination-virtualized-real-editor-ops-slate-pagination-virtualized-real-editor-ops-benchmark.json).

The separate 5,000-block virtualized trace has five observations per start/middle-block lane. Its largest start-block type-to-frame-opportunity value is 44.1 ms. Selection is 72.2 ms before materialization versus 49.9 ms in the already-materialized recipe; the corresponding selection-ready clocks are 42.4 and 19.7 ms. The initial native-surface check sees 15 mounted blocks and 4,985 pending blocks. That is bounded coverage, not complete native DOM coverage. The artifact names these clocks `*ToPaint`; this research treats them as frame opportunities because actual paint was not verified. [Standalone trace](../../../plans/artifacts/2026-09-09-editor-performance-research-iteration-2/browser-and-repaired-guards/react-huge-document-virtualized-type-to-paint-slate-react-huge-document-virtualized-browser-trace-benchmark.json).

The full huge-document target fails its legacy comparison: worst p95 ratio 7.97 against a 1.5 limit, with zero correctness failures. Its mode-specific favorable metrics cannot erase that failure. [Full target receipt](../../../plans/artifacts/2026-09-09-editor-performance-research-iteration-2/browser-and-repaired-guards/react-huge-document-full-slate-react-huge-document-full-benchmark.json).

The instrumented 752-case Plite breadth run independently detects slow interactions in large-document journeys: staged repeated Shift+ArrowDown reaches an observed 432 ms; staged 10k select-all/delete/typing/paste/undo and 20k partial-DOM select-all/paste/undo each reach 264 ms. These are single-journey Event Timing observations, including the control mode used by a journey, and do not isolate the cause or establish mode-to-mode ratios. The opt-in native pagination drag-autoscroll case also passes in a separate uninstrumented replay. [Per-case event evidence](../../../plans/artifacts/2026-09-09-editor-performance-research-iteration-2/journey-event-timing-summary.md), [native autoscroll receipt](../../../plans/artifacts/2026-09-09-editor-performance-research-iteration-2/native-autoscroll.json).

## Metrics and comparison rules

Measure input-to-model commit, input-to-actual paint when a recorder supports it, complete operation settlement, DOM count, retained heap, allocated bytes, layout/style work and blank/jump frames separately. Two `requestAnimationFrame` callbacks are frame opportunities, not verified paint. PerformanceObserver Event Timing is a useful stall detector, but its threshold and rounding censor fast events and its endpoint does not include all asynchronous editor work.

For scroll, report p50/p75/p95/max frame intervals and dropped/blank frames over a fixed trajectory, together with actual scroll distance and rendered range. For first activation, include materialization and focus restoration. For native Find and print, include the time and memory needed to expose the full document. A result that starts its timer after materialization is a different operation.

A candidate must beat repeated-control drift and produce a material absolute improvement. More overscan trades memory and mount work for fewer blanks; a fixed default cannot be chosen from a single warm forward-scroll trace. Start with the current policy, then test one change against forward/reverse scroll, thumb drag, keyboard jumps, variable heights and endpoint retention.

## Experimental decision

Pursue E19's private copy deletion first because its removed work and surviving authority are specific. Keep E20, E21, E22 and E23 conditional on their exact measurements and behavior gates. Keep full-DOM performance as an independent priority. The long-term target is one canonical document and one view-owned coverage/geometry contract with bounded visible work; not a second editor model, a parallel selection engine or a collection of feature-specific materialization hacks.
