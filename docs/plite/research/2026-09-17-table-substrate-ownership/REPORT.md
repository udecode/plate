# Table ownership from first principles

**Pursue a focused redesign of Plate's table selection and mounted interaction.**
The strongest cut is the interaction machinery that every copied cell and table
renderer must install: per-cell resize targets, table-specific selection paint
bookkeeping, and range assembly for semantic table actions. Put those jobs in
the existing table integration, with a small headless selection API. Keep the
actual topology, span policy, and persisted widths with the table feature.

This is a research verdict, not an accepted runtime implementation. A shared
resize overlay and a different paint sink must pass the comparisons below.
Product code is unchanged.

## What the user needs

A user can select cells, rows, and columns; extend or shrink that selection;
format, copy, clear, merge, and paste the selected content; and resize a logical
boundary. Spans change which cells and boundaries those operations mean.
Selection direction, named roots, history, document changes, and independent
mounted views must remain coherent. A resize preview belongs to its mounted
view; committing dimensions changes the document once through the canonical
update path. Cancellation must discard the preview.

From scratch, those requirements justify three owners:

| Owner | Responsibility |
| --- | --- |
| Plite | Document identity, roots, canonical selection and mapping, transactions, history, generic mounted-host lifecycle and geometry. |
| Plate table | Span-aware topology; logical selection and navigation; table edit/transfer policy; width and height calculation and persistence. Its React adapter translates events and measured geometry into those operations. |
| Copied UI | Appearance, menu composition, which controls are offered, and the visual choice between live-width and guide-line previews. |

Neither a second selection store nor a public `TableController`, `GridManager`,
`ResizeManager`, or new table package is needed to express these jobs.

## What the external sources establish

The detailed evidence is in [PM/Tiptap](shards/pm.json),
[Lexical](shards/lexical.json) and
[local/adapter reads](shards/local-and-adapters.json). Each source read records
its revision and file identity. Upstream tests were inspected, not executed.
Tiptap, ProseKit, and Milkdown inherit ProseMirror table behavior; they are
different integration examples, not three additional independent engines.

| Source | Selection and resize ownership | Useful consequence |
| --- | --- | --- |
| ProseMirror | Core `Selection` is extensible. Optional `CellSelection` supplies cell ranges, mapping, content, replacement, and bookmarks. `TableMap` and `columnResizing` stay in `prosemirror-tables`. | First-class selection does not require tables in core. A custom selection protocol has substantial obligations beyond two endpoints. |
| Tiptap | Exposes `setCellSelection` and table commands, and installs PM editing/resizing. Supplies its own table view. | Application callers deserve semantic commands. Its source is not independent validation of PM's engine. |
| Lexical | Optional table selection implements core `BaseSelection`; table observers own browser behavior. Its playground supplies one editor-level resizer with two active-cell handles. | Keep structural selection and editing available below React. Its current source fixes earlier cleanup gaps; explicit cancellation and logical resize directions still need separate assessment. |
| ProseKit | Wraps PM table plugins; provides framework-neutral table controls and a separate generic resizable element. | Generic box resize and table boundary resize are distinct user jobs. Framework portability alone does not justify moving table semantics into the substrate. |
| Milkdown | Wraps PM table editing and exposes row/column/table selection commands used by table controls. | Promote semantic selection instead of asking copied UI to construct text ranges. Its delayed DOM selection handling is not a pattern to import. |

Current official documentation also describes [ProseKit's separate resizable
component](https://prosekit.dev/components/resizable/) and [Milkdown's selection
commands](https://milkdown.dev/docs/api/preset-gfm).
Documentation and open issues route source inspection; neither proves behavior
in Plate or the latest upstream browser build.

The retained comparison covers six repositories across five editor projects and two
independent table engines. Freshness checks include PM's canonical state repo,
current Tiptap owners/tests, current Lexical selection/observer/resizer deltas,
and ProseKit/Milkdown read-file comparisons.
PM table HEAD matches the inspected clone. ProseKit's selected files are
unchanged; Milkdown's selected-file differences are comments. The older broad
Lexical test reads remain snapshot-scoped. This is not a claim to have
audited each project's entire current branch or dependency graph.

## Promote logical selection into Plate

Current public table reads return a compact `TableSelection`, but constructing
and extending that selection is mostly private React logic.
`TablePlugin.tsx:110–238` owns logical expansion and Select All; the row handle
in `apps/www/src/registry/components/editor/table.tsx:870–899` constructs a text
range and invokes generic selection. This makes UI callers know how a table
selection is encoded.

Add selection commands to the existing headless table plugin. The same semantic
implementation should serve mouse, keyboard, row/column controls, and
programmatic callers. Retain DOM caret-edge measurements in the mounted
adapter: logical movement and native line-boundary detection are different jobs.

Proposed direction, **not a shipped or fully designed signature**:

```ts
const table = editor.plugin(TablePlugin);

table.update.select({ anchor: firstCell, focus: lastCell });
table.update.select({ at: cell, unit: 'row' });
table.update.select({ at: cell, unit: 'column' });

const selected = table.read.selection();
```

Use a discriminated input union, canonical node targets, inferred callbacks,
and explicit root propagation. Reject cross-table or cross-root endpoints.
The implementation computes span closure once and writes canonical selection;
callers do not build paths, grids, caches, or a second `TableSelection` object.
Design must compare one union against explicit `selectCells`, `selectRow`, and
`selectColumn` commands, settle invalid-target/result semantics, and distinguish
selecting a table node from selecting its contents. Do not publish all private
neighbor/grid helpers to achieve this.

Plite's directional `NodeSelection` already gives exact structural membership,
mapping, and root identity. Plate derives the table projection and intercepts
generic table-sensitive commands at its semantic owner. That is legitimate
feature policy, not evidence of a missing core table type.

There is one important choice to make explicitly: exact selected cells versus
an enduring rectangle/whole-column intent when another edit inserts cells.
Plite maps existing selected paths and drops deleted ones. PM can recompute
cell selection from endpoints and preserves whole-row/column extent on mapping.
Those are different semantics, not a benchmark result or an automatically
proven Plite bug. Preserve exact membership for ordinary node selection. If
the selected product contract requires enduring table intent through arbitrary
remote structural edits, compare a neutral canonical selection extension with
feature command integration. Do not hide that intent in React or enlarge every
node selection into a rectangle.

## Consolidate mounted interaction

`TableCellResizeControls` mounts a wrapper and bottom/right handles for every
editable cell, plus first-column left handles. An unmerged 50×40 table therefore
declares 4,050 handle elements and 2,000 wrappers before shared indicators.
This is a source-derived count, not a measured rendering cost. The handles are
pointer-only divs: the inspected component has no keyboard, focus, or ARIA
contract. In addition, the left handle is gated on the **ending** column index;
a first cell spanning several columns cannot offer that left handle. That is
a source trace, not a browser reproduction.

Compare a table-scoped active-boundary overlay against the current controls.
The table integration can hit-test the active cell, resolve the logical edge
through the existing topology owner, and expose a small number of controls.
Copied UI should style those controls and choose a preview renderer. It should
not implement span addressing, gesture validity, cancellation, or editor-root
lifetime. A focusable resize affordance or equivalent keyboard size controls
must serve the same semantic width/height operations without creating thousands
of tab stops. RTL, zoom, scroll, merged edges, omitted DOM, nested tables, and
selection dragging constrain this design.

This is an independently motivated cut; it is not a claim that all upstreams
use one overlay or that the candidate is faster. PM uses active-column
decorations, and Lexical has a shared active-cell resizer. Their different choices provide comparisons.

Keep the sound part of today's resize design:

- `api.createResize` calculates constrained deltas without editing the document.
- `useTableResize` owns the exact table, owner window, pointer, and retirement.
- `update.resize` commits table dimensions through the existing transaction owner.
- Copied presentation chooses live preview or a guide line.

The private `bindPointerSession` is already shared by table and media resizing.
Public promotion to Plite would currently relocate machinery without removing
a missing user capability. Keep it private unless another substrate consumer
establishes a neutral contract. Do not merge table width redistribution with
image aspect-ratio resizing. Decide explicitly whether unrelated content edits
should cancel a drag: the current session invalidates on table-node identity,
which is safe but broader than topology or dimension changes.

Keep width units explicit. Plate's current numeric column widths, height, and
left margin describe a pixel-oriented contract. A responsive width model would be a separate table-domain
capability, not a reason to promote resizing into Plite. Do not add unit modes
without a current responsive/import job; do not imply that the current numeric
API provides percentage fidelity. Logical inline edges and keyboard controls
should be assessed with the interaction design rather than adding a second
resize API for each input method.

## Fix paint ownership without repeating a failed experiment

The [local diagnostic](shards/local-paint.json) imports the actual table paint
hook and connected Plite DOM runtime. React replaces the selected anchor `td`
with a `th`, retaining the same node key, table element, and semantic selection.
All 11 controls pass, including another real `claimReactCommit` call. The final
assertion fails: the replacement lacks both `data-table-cell-selected` and the
transparent caret style. The unchanged existing hook spec passes.

The hook compares table identity, selected keys, and caret key. Its caches and
delta loops do not account for a different DOM host for the same key. Plite's
commit claim classifies owned mutations; it does not republish table paint.
The probe establishes DOM attributes/styles in Happy DOM, not visible pixels,
native caret behavior, or the full production renderer. Detached nodes retain
selection attributes after unmount; a live retained-host disposal scenario was
not reproduced.

The required invariant is generic: published view attributes must follow the
current host identity and be retired with their owner. Compare:

1. A narrow repair of the existing table hook, using actual host lifetimes.
2. Reusing the existing Plate `render.useViewElementAttributes` producer with a
   more efficient host binding and automatic reapplication on replacement.
3. A minimal Plite mounted-host capability only if its existing DOM owner cannot
   supply the lifetime required by the chosen Plate consumer.

The ideal target deletes the table-specific painter/cache and uses one existing
attribute publication authority. That target remains provisional. The previous
plan measured the straightforward React attribute path at p95 **48.79ms versus
8.75ms** for 25×20 and **163.52ms versus 35.71ms** for 50×40. It caused
15,045/60,045 cell renders across the measured actions versus zero. Those
recorded results defeat simply prescribing that same implementation again;
they do not validate today's replacement behavior or prove every generic host
binding is slow.

## Retained and rejected architecture

| Lane | Verdict and reason |
| --- | --- |
| Keep/configure everything | Reject: no configuration supplies semantic selection commands or fixes stale selected DOM hosts. |
| Change the existing table API | Pursue headless selection and logical navigation; keep compact read projections and canonical updates. |
| Add a generic selection-kind protocol | Defer until enduring intent or another unmet semantic job is established. PM shows the complete obligations; a local gap still needs proof. |
| Delete/merge/inline | Pursue removal of caller range assembly and copied gesture policy; compare deleting per-cell handles and the dedicated paint cache. Runtime candidates need measurement. |
| Move table code into Plite | Reject blanket promotion. Table schema, spans, clipboard tiling, merge policy, and neighbor-width redistribution remain feature semantics. |
| Move host lifetime into the existing substrate owner | Conditional, narrow candidate. A table bug alone does not justify a public generic registry. Reuse current view/root owners first. |
| Replace the table tree with a spreadsheet model | Reject: rich nested cell content, schema/codec dispatch, static rendering, and complete slices are current jobs. No spreadsheet/formula requirement justifies replacement. |
| Delete private mutation planning or add a new public grid package | Reject reopening without new evidence. Detached simulation, atomic diagnostics, and one committed-change authority were assessed in the accepted adoption. |

The raw Plite table example is a minimal containment demonstration with a
different schema. It is not a second consumer of Plate's complete span/resize
engine. It does not justify extracting a new table substrate.

## History, coverage, and proof

This review supersedes the broad “Stop further table redesign” conclusion of
the [closure record](../../../research/review-records/2026-09-17-table-canonical-api-closure.json).
It retains the adopted 21-method contract's content/target/transaction repairs
and their historical receipts. It does not turn those receipts into proof of
host replacement, accessibility, or an unbuilt shared interaction owner.

All 14 existing table census groups have a disposition: headless package and
table capability pursue selection commands; row/cell descriptors and headless/
React exports remain; React integration and copied table UI pursue interaction
ownership; toolbar, no-merge demo, rich fixture, and row-selection proof retain
their earlier jobs; the raw example remains independent; selection/resize
browser groups need targeted new assertions. This is a bounded ownership
reassessment, not a fresh exhaustive codec, normalization, transfer, browser,
or issue-corpus audit.

Before runtime adoption, prove the chosen selection contract across spans,
backward extension, partial membership, roots, history, and structural edits.
Replay actual browser selection after header/host replacement and remount;
verify independent views and cleanup. Compare complete selection/resize
operations across large and many-small-table documents: DOM count, React
renders, allocations, event/paint cost, and commit/undo behavior. Exercise
read-only changes, deletion, blur, pointer cancellation, keyboard controls,
RTL, and the browser-native drag path. Synthetic fallback cannot close a failed
natural gesture. Lexical's inspected tests contain such a fallback and a row
height assertion that normalizes the number; neither is a sufficient oracle
to copy for the stronger claim.

No candidate performance measurement, upstream test execution, full browser
replay, physical-device proof, or product implementation occurred in this run.
Source freshness, review, prior adoption, and runtime proof remain distinct.
The reproduced paint counterexample narrows current proof to partial; it does
not undo the prior implementation or its valid passing receipts.

Next owner: **`$task design plan table: promote semantic selection and consolidate
mounted table interactions`**. Task should settle the headless call shape,
shared control design, and paint/lifetime comparison together. Required adoption
teaching includes the Table API, copied UI, plugin/render guidance, and the
smallest relevant doctrine owner; follow normal doctrine versioning only when
the resulting API change is implemented. No downstream plan is created here.
