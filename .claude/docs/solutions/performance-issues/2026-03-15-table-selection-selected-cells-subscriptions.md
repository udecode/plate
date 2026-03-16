---
module: Table
date: 2026-03-15
problem_type: performance_issue
component: selection-state subscriptions
symptoms:
  - "Selecting a `3 x 3` range on `/dev/table-perf` with a `40 x 40` table takes about `425 ms` mean with `0 ms` injected delay"
  - "Updating `TablePlugin.selectedCells` rerenders a large part of the table, including cells that are not part of the active selection"
  - "Selected-cell visuals are driven through React cell state instead of a narrow DOM update path"
  - "Selected cell node arrays stay in plugin options and require node-reference write-backs to keep toolbar actions working"
  - "After the first selection-state cleanup, repeated `getTableGridAbove(...)` calls still keep large-table selection around the `160 ms` mean range"
root_cause: broad_selection_state_fanout
resolution_type: render_path_optimization
severity: high
tags:
  - table
  - selection
  - react
  - performance
  - platejs
  - selector-subscriptions
  - dom-sync
---

# Table selection latency from broad `selectedCells` fanout

## Problem

The `dev/table-perf` page showed a clear selection bottleneck on large tables. On a `40 x 40` table, selecting a `3 x 3` area with `0 ms` injected delay landed around:

- mean: `425.00 ms`
- median: `424.60 ms`
- p95: `477.90 ms`

That made the problem visible enough to isolate as render-path cost rather than synthetic benchmark overhead.

## Root cause

Two paths were inflating selection cost.

### Full-array subscriptions in hot hooks

Several hooks subscribed to the entire `TablePlugin.selectedCells` array:

- `useIsCellSelected`
- `useTableCellElement`
- `useTableElement`
- `apps/www/src/registry/ui/table-node.tsx` cell presentation state

That meant a selection update woke far more of the table than necessary, even when most consumers only needed a boolean or membership check.

### Selected-cell highlighting lived in the React tree

Even after narrowing some reads, selected-cell visuals were still computed by cell components. That kept transient selection chrome tied to React rerenders instead of treating it as DOM state that can be updated directly from the table root.

### Selection state still materialized full node arrays

Even after moving highlight chrome onto the table root, the plugin still stored `selectedCells` and `selectedTables` as full node arrays. That kept selection changes tied to:

- repeated array writes into the plugin store
- node-reference rewrite effects in cell presentation hooks
- toolbar or dropdown consumers depending on stale node identity staying synced

### The same selection geometry was still recomputed several times

Even after the state cleanup, multiple paths still derived the same selection independently:

- the global selection sync hook
- table-root DOM highlighting
- merge-state checks
- the dev perf harness itself

Those calls all walked the same table selection through `getTableGridAbove(...)`, which is especially expensive on large tables and merged-cell ranges.

## Fix

The fix was to keep editor state minimal, move selected-cell chrome onto a narrow DOM sync path, and only persist lightweight selection metadata in the plugin store.

### 1. Keep persistent selection state lightweight

Instead of writing full node arrays into plugin options, keep only:

```ts
options: {
  _selectedCellIds: undefined as string[] | null | undefined,
  _selectedTableIds: undefined as string[] | null | undefined,
  _selectionVersion: 0,
}
```

`_selectedCellIds` handles cheap membership checks. `_selectionVersion` invalidates derived selectors when selected node references change without changing ids.

### 2. Derive `selectedCells` and `selectedTables` from editor selection

The compatibility entry points stay in place, but they are selectors now instead of stored arrays:

```ts
selectedCells: () => {
  void getOptions()._selectionVersion;

  return getSelectedCells(editor);
},
selectedTables: () => {
  void getOptions()._selectionVersion;

  return getSelectedTables(editor);
},
```

Imperative consumers such as `editor.getOption(TablePlugin, 'selectedCells')` still work, but the source of truth is the editor selection, not plugin-store arrays.

### 3. Remove selected-node write-backs from cell hooks

Once node arrays are derived on demand, cell presentation no longer needs to rewrite `selectedCells` just to keep references fresh:

```ts
const isCellSelected = usePluginOption(
  TablePlugin,
  'isCellSelected',
  element.id
);
```

The heavy "replace this selected node with the latest element ref" effect drops out completely.

### 4. Sync lightweight selection state from one global hook

React still needs a reactive signal for `usePluginOption(TablePlugin, 'selectedCells')`, but that signal can stay compact:

```ts
setOptions((draft) => {
  if (!hasSameIds(draft._selectedCellIds, nextSelectedCellIds)) {
    draft._selectedCellIds = nextSelectedCellIds;
  }

  draft._selectionVersion = (draft._selectionVersion ?? 0) + 1;
});
```

The hook only tracks selected-cell ids plus the current `editor.children` reference. That keeps the store fanout small while still letting derived selectors refresh when selected node objects change.

### 5. Cache repeated selection queries for the current editor state

Selection queries now reuse a per-editor cache keyed by the current selection and document reference:

```ts
const selectionQueryCache = new WeakMap<SlateEditor, SelectionQueryCache>();
```

That lets `getSelectedCellEntries`, `getSelectedCells`, `getSelectedCellIds`, and `getSelectedTables` share one table walk instead of rescanning the selection in each consumer.

### 6. Keep selected-cell visuals on table-root DOM sync

The table root subscribes once to the store-backed ordered list of selected cell ids and mutates only the DOM attributes whose state changed:

```ts
const selectedCellIds = usePluginOption(
  TablePlugin,
  'selectedCellIds',
  hasSameIds
);
```

Each cell only exposes a stable identifier and a CSS hook:

```tsx
<PlateElement
  attributes={{
    ...props.attributes,
    'data-table-cell-id': element.id,
  }}
  className={cn(
    'data-[table-cell-selected=true]:before:z-10',
    'data-[table-cell-selected=true]:before:bg-brand/5'
  )}
/>
```

### 7. Cache table-cell DOM lookups and skip redundant selection sync work

The table-root DOM sync no longer rescans the table subtree for every selected id on every render. It keeps a per-table `Map<string, HTMLElement>` and short-circuits when the selected id list has not changed:

```ts
const tableCellElementsByIdRef = React.useRef<Map<string, HTMLElement> | null>(
  null
);

if (!tableChanged && hasSameIds(selectedCellIds, previousSelectedCellIdsRefValue)) {
  return;
}
```

That moves the cost from repeated `querySelector(...)` calls during selection updates into one table-level index build, with per-id fallback only when the DOM changes under the same table element.

### 8. Keep the dev perf harness subscribed to ids without extra serialization

The `/dev/table-perf` simulator also stays on the lightweight id list directly instead of building a string signature for every change:

```ts
const selectedCellIds = usePluginOption(
  TablePlugin,
  'selectedCellIds',
  hasSameIds
);
```

That keeps the benchmark page closer to the real app path and avoids adding avoidable work inside the latency measurement environment.

### 9. Reuse table grid lookups during selection range expansion

The merged-cell range helper no longer resolves each grid coordinate by repeatedly scanning every cell in the table. It builds one cached `table -> grid entry` lookup and reuses that for:

- coordinate-to-cell resolution
- merged-range overflow expansion
- final selected-cell collection

That removes the old `selected area * all table cells` search pattern from `getTableMergeGridByRange(...)`, which mattered even when a large table had no merged cells because the merge-capable path is still the default.

### 10. Cache selection queries by selection reference, not serialized paths

Selection-derived table queries no longer rebuild a string key from `anchor.path` and `focus.path` on every read. The cache keys off `editor.children` and the `editor.selection` object reference directly, which trims fixed work from the selection hot path.

## Why this works

Selection updates happen often and touch many cells. The important optimization is not making the write itself slightly cheaper. The important optimization is preventing unrelated React subscribers from waking up and preventing the store from owning heavyweight selection payloads.

After the change:

- plugin store keeps ids plus a version, not full selected node arrays
- compatibility selectors derive selected nodes from editor state only when needed
- table-level consumers subscribe to a cheap slice instead of the full selection array
- selected-cell visuals are applied at the table root instead of by each cell render
- selected-node write-back effects disappear from cell presentation hooks
- repeated selection queries are cached per editor state instead of rescanning the same geometry
- table-root selection sync reuses cached cell elements instead of repeatedly querying the DOM
- merged selection range expansion reuses a cached table grid instead of repeatedly scanning the full table for each coordinate
- selection diffing avoids repeated serialization and only mutates DOM nodes whose selected state changed

That turns selection cost from "table-wide React selection churn plus store array writes" into "lightweight selection bookkeeping plus small DOM diffs."

## Residual hotspot

After the selection-state cleanup, the remaining cost was not only selection geometry. The registry `table-node` floating toolbar still mounted its expanded multi-cell content during selection updates.

That meant a `3 x 3` selection still paid for:

- `useTableMergeState()` on every selection update
- border-dropdown selection state reads even while the dropdown stayed closed
- the expanded toolbar content tree mounting before the selection had settled

Delaying only `Popover open` was not enough. The content and hooks still rendered, so latency stayed in roughly the `140 ms` range.

The effective fix was to keep the popover anchor stable but defer the expanded multi-cell toolbar content itself:

```tsx
const shouldRenderExpandedSelectionToolbar =
  isExpandedSelectionToolbarReady && isExpandedSelectionPending;

<Popover open={isToolbarOpen} modal={false}>
  <PopoverAnchor asChild>{children}</PopoverAnchor>
  {isCollapsedToolbarOpen && <CollapsedTableFloatingToolbarContent />}
  {shouldRenderExpandedSelectionToolbar && (
    <ExpandedSelectionTableFloatingToolbarContent />
  )}
</Popover>
```

That keeps collapsed table controls immediate, but removes expanded selection toolbar work from the hot selection path until the selection remains stable for the configured delay window.

## Verification

Fresh file-level verification for the changed paths passed:

```bash
bun test packages/table/src/lib/withTableCellSelection.spec.tsx
bun x tsc -p apps/www/tsconfig.json --noEmit
bun x @biomejs/biome check --write packages/table/src/lib/BaseTablePlugin.ts packages/table/src/lib/queries/getSelectedCells.ts packages/table/src/lib/queries/index.ts packages/table/src/lib/withTableCellSelection.spec.tsx packages/table/src/react/TablePlugin.tsx packages/table/src/react/components/TableCellElement/useIsCellSelected.ts packages/table/src/react/components/TableCellElement/useTableCellElement.ts packages/table/src/react/components/TableElement/useSelectedCells.ts packages/table/src/react/components/TableElement/useTableElement.ts packages/table/src/react/components/TableElement/useTableSelectionDom.ts apps/www/src/app/dev/table-perf/page.tsx apps/www/src/registry/ui/table-node.tsx
```

Fresh workspace-level verification is currently blocked by unrelated repository issues:

- `bun typecheck` shells out to `pnpm g:typecheck`, but the local `pnpm` is `9.5.0` and the repo requires `>=9.15.0`.
- A full `bun lint:fix` run is noisy because a copied `examples/tiptap` mirror brings in unrelated lint failures.

Browser verification on `http://localhost:3002/dev/table-perf` with `40 x 40`, `3 x 3` selected cells, and `0 ms` injected delay produced:

- mean: `135.57 ms`
- median: `134.30 ms`
- p95: `144.50 ms`
- min/max: `127.30 / 145.00 ms`

After deferring expanded multi-cell toolbar mount, browser verification on the same route and config produced:

- mean: `118.50 ms`
- median: `118.20 ms`
- p95: `119.70 ms`
- min/max: `116.20 / 130.30 ms`

Repeat browser verification on the same route and config produced:

- mean: `117.53 ms`
- median: `117.50 ms`
- p95: `119.20 ms`
- min/max: `116.30 / 119.90 ms`

## Prevention

- When a table cell only needs membership, subscribe to membership, not the full selection array.
- If consumers need selected nodes, derive them from editor selection instead of persisting node references in plugin state.
- Keep transient selection chrome out of per-cell React state when DOM attributes or overlays can express it.
- Keep plugin-store selection payloads compact. Ids plus a refresh signal are cheaper than node arrays.
- If multiple hooks need the same table selection geometry, cache it once per editor state instead of rerunning `getTableGridAbove(...)`.
- If DOM sync needs to touch the same cells repeatedly, cache the cell elements per table instead of calling `querySelector(...)` for every id diff.
- If merged selection code needs coordinate lookups, build one table-grid lookup per table instead of scanning all cells for every coordinate probe.
- If a floating toolbar depends on expensive selection-derived hooks, defer mounting the expanded toolbar content, not just the popover open state.
- Keep dev perf pages around. This regression was easy to reason about because the app already had a repeatable latency harness.
