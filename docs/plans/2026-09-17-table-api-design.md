---
review_scopes: [table]
review_basis: [2026-09-17-table-public-contract-final-pass]
work_kind: implementation
---

# Table API, complete content and explicit ownership

Status: Complete — the accepted 21-method contract, complete-content laws, mounted-view ownership, copied UI, codecs, docs, doctrine, generated artifacts and ledger adoption are implemented. Focused package, browser and frozen runtime proof pass; the unrelated broad-check blockers and excluded claims remain recorded below.

Objective:

Select the smallest truthful table API and a concrete adoption plan for complete-content preservation, root-aware explicit targets, and exact-view selection ownership.

Completion threshold:

Source-linked public decisions, complete implementation of the accepted 21-method contract and content/selection laws, package/UI/docs/doctrine adoption, and passing required source, package, browser and frozen runtime proof. Publication remains outside this request. Historical failed runtime controls remain evidence; only a passing final-source packet can close the runtime gate.

Acceptance sources: [Task workflow](../../.agents/rules/task/references/workflow.md), [Best API](../../.agents/skills/best-api/SKILL.md), [Plate Plan](../../.agents/skills/plate-plan/SKILL.md), and the [final table review](../research/decisions/table-ownership.md). The user's “go” accepts that review's proposed Task design/plan step.

Constraints:

Keep independent Plate features separate. Preserve the single canonical document/change owner, rich cells and complete slices, roots, history, authored semantics, mounted-view permission and lifetime. No public compatibility aliases, parallel table selection store, or speculative controller. Existing private plans must earn retention; deletion is not predetermined.

Boundaries:

`platejs/table`, `platejs/table/react`, copied table/static/toolbar UI, table-owned codecs, teaching and proof. Plite transaction/slice/selection owners change only for the feature's accepted command, fitting and root-ownership handoffs. Disposable evidence lives under this plan's artifacts.

Verification surface:

Current source and call sites, prior source-bound failure probes, bounded architecture probes, planning link/structure checks. Production package/browser/scale verification is specified in the adoption slices.

Blocked condition:

A decision-changing behavior cannot be observed or a candidate fails its frozen correctness/scale contract. Preserve its evidence and select a supported alternative or leave that exact decision provisional; do not claim readiness from prose.

Work Checklist:

- [x] Capture scope, authority, hard laws and prior review corrections.
- [x] Inventory every public method, type and option with a disposition and real consumer job.
- [x] Resolve target syntax, result semantics, complete-content policy and typed call sites.
- [x] Compare private mutation planning with canonical candidate construction using executable evidence; preserve failed scale acceptance.
- [x] Resolve selection read/cache and mounted paint ownership with bounded evidence.
- [x] Map codec, registry, docs, doctrine and package adoption without dropping prior findings.
- [x] Specify ordered execution slices, failure/rollback boundaries and exact proof.
- [x] Reconcile all review findings; inspect the final plan and run its completion check.

Execution Checklist:

- [x] Close the parallel retained-insertion runtime gate without weakening its frozen contract.
- [x] Adopt canonical command refusal and explicit fallback across every classified wrapper.
- [x] Implement the structural target, exact selection/cache and policy owner.
- [x] Implement complete-content merge/split/paste, root ownership, codec fidelity and atomic rejection.
- [x] Adopt the 21-method API across React, copied UI, tests and public exports.
- [x] Pass source/package/browser/runtime proof and close docs, doctrine, changeset, generated artifacts and ledger adoption.

## Decision

**Reduce 47 table-owned methods to 21, preserve whole content and surviving identities, and make explicit targets authoritative.** Keep one private geometry/planning owner in Plate and canonical changes/fitting in Plite. Keep table/row/cell descriptors and their automatic dependencies. Keep the existing mounted selection DOM hook and resize split. Cut the public detached constructor, compiler/context/metrics, unused navigation helpers, transfer provenance and the orphan selected-cell drag protocol.

The durable target does not depend on deleting every intermediate plan. Detached source repair, deterministic diagnostics and simulation are independent current jobs. Direct canonical candidates did not cover those jobs; replacing whole table children lost identities. A private plan is not a second committed document. Do not add a blanket transaction-spec wrapper to every table operation. Use canonical moves for merge and canonical complete-slice fitting for paste; remove redundant writes that precede that fitting.

The shared command correction is narrow: `handle(false)` declines; an `around` callback delegates only with `next()`/`next.after()`, and returns `false` to reject. This avoids a new public result union and gives table replacement an honest failure result. Adopt the dependent wrappers together.

Value order: complete content/identity and truthful rejection first; exact targets/view selection second; public reduction third; presentation/teaching fidelity fourth. Dependency order differs and is specified in the execution slices.

## Source and evidence

Verification evidence:

Current owners: [headless table](../../packages/platejs/src/features/table/lib/BaseTablePlugin.ts), [public types](../../packages/platejs/src/features/table/lib/types.ts), [private selection](../../packages/platejs/src/features/table/lib/internal/selection.ts), [mutation](../../packages/platejs/src/features/table/lib/internal/mutation.ts), [paste](../../packages/platejs/src/features/table/lib/internal/paste.ts), [codec](../../packages/platejs/src/features/table/lib/internal/codec.ts), [React integration](../../packages/platejs/src/react/features/table/TablePlugin.tsx), [live UI](../../apps/www/src/registry/components/editor/table.tsx), [static UI](../../apps/www/src/registry/components/editor/table-static.tsx).

The [AST inventory](artifacts/2026-09-17-table-design/inventory.json) records all 47 owned methods, top-level declarations/reexports, production `around` callbacks and source hashes. Its method-name caller matches are search candidates, not proof of namespace ownership; the source review and dispositions below resolve them. It covers package source and www TS/TSX, not downstream npm consumers. [Rerun](artifacts/2026-09-17-table-design/inventory.mjs) uses the installed TypeScript 6 parser; TypeScript 7's installed compiler entry does not expose that parser API.

| Evidence | Result and limit |
| --- | --- |
| [Prior final review](../research/decisions/table-ownership.md) and [original failure probe](artifacts/2026-09-16-table-api-review/probe-result.json) | Seven reproduced/source-compared API defects, plus the bounded 14-member feature census. Reused, not presented as newly fixed. |
| [Command contract/probe](artifacts/2026-09-17-table-design/commands/contract.md), [baseline](artifacts/2026-09-17-table-design/commands/baseline.json), [candidate](artifacts/2026-09-17-table-design/commands/candidate.json) | Eight cases each: fallback, rejection, explicit delegation, input rewriting, direct candidate, rejected continuation rollback, invalid delegated result and read-only. Candidate rejection makes zero downstream calls; explicit delegation remains one/native-equivalent. Source transformed only in the disposable process. |
| [Complete call-shape feasibility](artifacts/2026-09-17-table-design/types/call-shape.ts), [config](artifacts/2026-09-17-table-design/types/tsconfig.json), [log](artifacts/2026-09-17-table-design/types/typecheck.log) | Source-first TypeScript passes all 21 proposed methods, four options, structural target unions, XOR insertion placement, nullable reads, boolean updates, nonempty resize variants, `tx.plugin(descriptor/name)`, and negative calls. This proves descriptor inference and the exact proposed call shape, not the future production implementation. |
| [Selection/paint investigation](artifacts/2026-09-17-table-design/view/recommendation.md) | Reproduced diagonal membership inflation and shared-index authored cache contamination. Real React/source comparison rejected the existing view-attribute host as a replacement at large/stress sizes. Happy DOM/development React, not native paint proof. |
| [Mutation summary](artifacts/2026-09-17-table-design/mutation/summary.json), [frozen contract](artifacts/2026-09-17-table-design/mutation/contract.md), [isolated follow-up](artifacts/2026-09-17-table-design/mutation/isolated-summary.json) | Rich canonical-move merge preserves surviving keys; complete-slice unit paste preserves owned roots; named-root/rollback/detached-repair probes recorded. Corrected unit paste passes all three isolated cohorts. Retained insertion still fails stress; no wholesale/runtime/browser claim. |

Prior unchanged-source partitions were 236 headless tests and 48 React tests. They establish regression coverage, not correctness of the proposed fixes. No current production/browser suite was rerun merely to repeat those green counts. Planning adds disposable probes, not production tests; no production test was deleted or changed.

## Public contract

Before, callers pass a mixture of cell paths, alternate `fromCell`/`fromRow`, raw cells, implicit selection and supplied coordinates, and can inspect compiler state. After, every contextual operation resolves one canonical target; returned data describes the table job.

```ts
import { TablePlugin } from 'platejs/table/react';

const table = editor.plugin(TablePlugin);
table.update.insert({ rows: 3, columns: 4, header: true });
table.update.insertColumn({ at: cellKey, before: true });

const selected = table.read.selection({ at: nodeSelection });
if (table.read.canMerge({ at: nodeSelection })) {
  const merged = table.update.merge({ at: nodeSelection }); // boolean
}

const cell = table.read.cell({ at: cellKey }); // TableCellInfo | null
const widths = table.api.columnWidths(tableElement);

editor.update(tx => {
  tx.plugin(TablePlugin).setCellBackground({ at: nodeSelection, color: '#eee' });
});
```

These are target signatures, not shipped APIs. Descriptor/name selection follows the existing nominal/inference/decoupling law; no `tx[plugin.name]` or new selector is introduced.

```ts
type TableNodeTarget = NodeTarget<
  TableElement | TableRowElement | TableCellElement
>;
type TableTargetOptions = { at?: TableNodeTarget | NodeSelection };
type TableCreateOptions = { rows?: number; columns?: number; header?: boolean };
type TableInsertPlacementBase = Omit<BlockInsertOptions, 'at' | 'after'>;
type TableInsertPlacement =
  | (TableInsertPlacementBase & {
      at?: BlockInsertOptions['at'];
      after?: never;
    })
  | (TableInsertPlacementBase & {
      at?: never;
      after: NonNullable<BlockInsertOptions['after']>;
    });

type TableSelection = Readonly<{
  table: ElementEntry<TableElement>;
  tableKey: NodeKey;
  cells: ReadonlyArray<ElementEntry<TableCellElement>>;
  anchor: NodeKey;
  focus: NodeKey;
  bounds: TableSelectionBounds;
  rectangular: boolean;
  root?: NamedRootKey;
}>;

type TableCellInfo = Readonly<{
  entry: ElementEntry<TableCellElement>;
  root?: NamedRootKey;
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
  borders: TableResolvedCellBorders;
  size: Readonly<{ width: number; minHeight: number }>;
}>;

type TableResolvedCellBorder = Readonly<Required<TableCellBorder>>;
type TableResolvedCellBorders = Readonly<{
  bottom: TableResolvedCellBorder;
  right: TableResolvedCellBorder;
  left?: TableResolvedCellBorder;
  top?: TableResolvedCellBorder;
}>;

type TableAxisInsertOptions = TableTargetOptions & {
  before?: boolean;
  header?: boolean;
  select?: boolean;
};
type TableColumnResize = Readonly<{ colIndex: number; width: number }>;
type TableResize =
  | Readonly<{ edge: 'bottom'; height: number; rowIndex: number }>
  | Readonly<{
      columns: readonly [TableColumnResize, ...TableColumnResize[]];
      edge: 'left';
      marginLeft: number;
    }>
  | Readonly<{
      columns: readonly [TableColumnResize, ...TableColumnResize[]];
      edge: 'right';
    }>;
type TableResizeOptions = { at?: TableNodeTarget; resize: TableResize };
type TableColumnWidthOptions = {
  at?: TableNodeTarget;
  colIndex: number;
  width: number;
};
type TableRowHeightOptions = {
  at?: TableNodeTarget;
  height: number;
  rowIndex: number;
};
```

The compiled call-shape artifact declares every method, including complete border inputs and negative cases. `cell()` narrows its live-node input further to `NodeTarget<TableCellElement>`. Locations and keys remain runtime-validated because their static type does not carry schema identity. Resizing and absolute sizing take one options object (`resize({ at, resize })`, `setColumnWidth({ at, colIndex, width })`, `setRowHeight({ at, rowIndex, height })`), so target and payload cannot drift across positional arguments. Horizontal resize commits contain at least one column; left-edge commits require `marginLeft`, while right-edge commits cannot carry it.

`NodeTarget` already includes path, point, range, live node and NodeKey. Omitted `at` uses the invoking view's current selection. Explicit `at` never falls back to that selection. Paths are local to the invoking root; root-bearing points/ranges/node selections retain their root. A foreign/deleted key or detached node fails closed. Cross-root targets use canonical root-aware resolution, not `nodes.path(key)` followed by a primary-root lookup. No target descriptor/cache/controller is public.

`selection()` returns null when there is no one-table selection; row/table targets expand to their contained cells. Its cells preserve exact NodeSelection membership and direction. Bounds summarize membership; they never fill holes. `rectangular` means exact span coverage tiles a valid rectangle. A range-based native drag may deliberately span-close before publishing NodeSelection. A diagonal/L-shaped node selection remains nonrectangular. `cell({at?: NodeTarget<TableCellElement>})` requires one cell and returns null otherwise; ranges spanning cells and NodeSelection are not a shortcut for picking the first cell.

Both selection and cell answers qualify their entry paths with `root`; omitted means the primary root, not the caller's currently focused root. Selection cache validity includes the effective document/projection, exact canonical selection including direction and membership, root and view context. Reuse the existing effective `state.runtime.snapshot().selection` and live `state.selection.nodes()` answers; add no new public selection getter or parallel store. Transaction reads remain draft-aware. Capability reads separately evaluate current policy and exact-view permission so a stable geometric answer cannot keep an obsolete `canMerge` result alive.

All 14 table update methods return boolean: true means a document or selection change was accepted; false means missing/inapplicable target, policy rejection, unfit content or an unchanged request. Invalid programmer dimensions/options throw before publication. Read-only follows the canonical update rejection contract; capability reads return false. A rejected structural edit publishes no partial document, selection, owned-root, history or authored change. `canMerge`/`canSplit` and the action share target/policy/geometry resolution but the action rechecks at execution time.

`insert(options?, placement?)` retains every canonical `BlockInsertOptions` field through the XOR `TableInsertPlacement`. `{at}` means insertion at that location; `{after}` is the explicit after-block job and cannot coexist with `at` at compile time or runtime. Omitted placement inserts after the containing table/block using the existing block insertion owner. Creation defaults are 2×2, with positive safe integer rows/columns and a first-row header option; zero/negative/nonfinite counts throw. The grammar-valid constructor is private to insertion, source repair and codecs. No public repeated rich-child template, empty-row constructor or detached constructor without a demonstrated independent caller.

`insertRow`/`insertColumn` accept `{at?, before?, header?, select?}`. A cell resolves its logical span edge, not its final physical path index. Before uses the leading boundary; after uses the trailing boundary. Row targets select that row's boundary; table targets prepend/append the table boundary. A multi-cell target uses its outer row/column boundary only when structurally applicable. Removals resolve the targeted logical rows/columns, reject invalid partial structural coverage, and remove the table if its final row/column would disappear. `remove({at?})` removes the containing table explicitly. Surviving content outside the requested edit remains intact.

## Complete public disposition

The target has **2 pure APIs, 5 reads and 14 updates**. Automatic schema/property operations are canonical descriptor machinery, not extra table-owned methods. Keep the `platejs/table` and `platejs/table/react` dependency boundary.

| Current method(s) | Target / disposition | Current user job and adoption |
| --- | --- | --- |
| `api.create`, `createCell`, `createRow` | Private only | Insertion, mutation/source repair and codecs need grammar-valid construction; no executable production consumer independently constructs a detached table. Public docs/type tests do not earn a separate runtime method. Orphan drag usage disappears; canonical schema construction remains available to advanced authors. |
| `api.getCellChildren`, `isCell`, `isRectangular` | Delete public methods; inline/private predicates as needed | Array-copy convenience and internal classification do not earn API. |
| `api.getColSpan`, `getRowSpan` | `read.cell` fields; private detached normalization | Live/static rendering shares logical span semantics. |
| `api.getColumnCount`, `getOverriddenColumnSizes` | `api.columnWidths(table): readonly number[]` | One resolved-width answer; count is its length. Remove public preview Map argument; UI overlays its local preview. |
| `api.createResize` | Keep pure delta → `TableResize` function | Gesture-free constrained preview is a documented headless customization job; the public React hook is one consumer, not its owner. |
| `api.writeSelection` | Move behind React/DOM adapter; delete public headless method | Only table copy/cut uses DataTransfer. Preserve host clipboard authority. |
| `read.getCellIndicesByKey`, `getCellIndices`, `getCellBorders`, `getCellSize` | `read.cell({at?}): TableCellInfo | null` | Coordinates/borders/logical dimensions, one private geometry read. Cut caller-supplied coordinates, widths and row sizes. No eager all-cell layout or new cache. |
| `read.selection` | Keep small `TableSelection | null` | Exact membership, direction, table identity and row bounds. |
| `read.canMerge`, `canSplit` | Keep with `TableTargetOptions` | Reactive controls share execution policy; keep separate from geometry cache. |
| `read.getSelectedCellsBorders` | `read.borders({at?}): TableBorderStates | null` | Six tri-state predicates for the existing border menu. No caller cell arrays/options. |
| `read.getAdjacentCell`, `getCellInNextRow`, `getCellInPreviousRow`, `getNextCell`, `getPreviousCell`, `getEntries` | Delete public methods | Private navigation/shared-edge lookup where needed; no located independent production caller. Canonical traversal stays available. |
| `read.isBorderHidden`, `isSelectedCellBorder`, `isSelectedCellBordersNone`, `isSelectedCellBordersOuter` | Private aggregation shared by border read/write | One physical-edge owner, no exported predicate family. |
| `update.insert`, `insertColumn`, `insertRow`, `removeColumn`, `removeRow`, `remove`, `merge`, `split` | Keep with explicit targets/results above | Structural table editing; preserve identities/roots and atomicity. |
| `update.moveSelection`, `selectAll`, `tab` | Private command behavior in table integration | Keyboard/native selection behavior survives without public command aliases. Preserve supported tab/shift-tab and last-cell row insertion. |
| `update.setCellBackground` | Keep `{at?, color: string | null}` | Selected-cell formatting; null unsets the property. Exact membership, including nonrectangular sets. |
| `update.toggleBorders` | Keep `{at?, border: side | 'none' | 'outer'}` | Existing toolbar toggle job, uniform state on/off behavior. |
| `update.setBorderWidth` | Replace with `setBorders({at?, border: side | 'all' | 'outer', value: TableCellBorder | null})` | One complete persisted border format job: width/style/color. The value replaces the edge record; omitted fields use renderer defaults rather than preserving prior fields. Null removes the override; width 0 hides. No width-only sibling. |
| `update.resize`, `setColumnWidth`, `setRowHeight` | Keep; one options object containing narrow `{at?: TableNodeTarget}` placement instead of `TableFindOptions` | Documented custom resize commits versus independent absolute programmatic sizing. Preserve width/index validation and one commit. |

`TableBorderStates` maps top/right/bottom/left/none/outer to `true | false | 'mixed'`. Predicates aggregate the relevant physical edges of exact coverage. `outer` includes hole boundaries; never expand membership to its bounding rectangle. Toggles change all-on to off and off/mixed to on; `none` toggles the no-border predicate. One resolver handles shared borders so an adjoining unselected cell renders the same shared edge, without changing its other edges. Both UI providers must handle mixed explicitly, not by truthiness. Live/static rendering honors supported persisted color/style/width rather than reducing all visible borders to token-colored 1px classes.

Public type dispositions: retain descriptor values, `TableDefinition`, inferred `TableElement`/`TableRowElement`/`TableCellElement`, `TablePluginState`, persisted `TableCellBorder`/`TableCellBorders`, `BorderDirection`, domain-only `TableSelectionBounds`, narrowed `TableBorderStates`, discriminated/nonempty `TableResizeTarget`/`TableResize` and `TableResizeHandle`. Add `TableResolvedCellBorder`/`TableResolvedCellBorders` only for computed renderer answers plus the published contracts named above. Delete exports of `TableContext`, `TableGrid`, `TableGridAnchor`, `TableGridCompilerMetrics`, `TableGridProblem`, `TableSelectionView`, `TableSelectionViewMetrics`, `TableSelectionEdge`, `TableSelectionExpansion`, `TableSelectionNeighborDirection`, `TableStoreSizeOverrides`, `CreateCellOptions`, `GetEmptyRowNodeOptions`, `GetEmptyTableNodeOptions`, `TableFindOptions`, `CellIndices`, `BorderStylesDefault` and `SetBorderWidthOptions`; keep required implementation types private. No public compatibility aliases. Keep React descriptors, `useTableResize` and `useTableSelectionDOM`.

## Options and ownership

| Current option | Decision |
| --- | --- |
| `disableMerge` | Replace with positive `allowCellSpanEditing: boolean`, default true. Both capability reads and both commands enforce it; the no-merge demo uses the same owner. The precise name matters because the policy gates both merge and split actions while existing or pasted spans remain supported. Do not add a second split flag. |
| `disableExpandOnInsert` | Replace with positive `expandOnPaste: boolean`, default true. It governs table-paste growth only. False rejects overflow atomically; it does not crop source content or prohibit explicit row/column insertion. |
| `disableMarginLeft` | Cut from the semantic plugin. Copied live/static presentation can hide indentation/left handle locally when an application needs that presentation. Normal rendering honors persisted indentation; no global store option erases it. No dedicated new presentation prop is required without a real caller. |
| `enableUnsetSingleColSize` | Cut. No located production configuration; normalization deletes authored width and its JSDoc says the opposite. Preserve explicit single-column width. No replacement flag. |
| `initialTableWidth` | Rename to `defaultTableWidth: number | null`. The value supplies layout for missing widths and constrains insertion/resize calculations beyond initial construction, so `initial` is false precision. Validate a non-null value as positive and finite; reads never persist the fallback. |
| `minColumnWidth` | Keep the resize constraint job and validate a positive finite value. Preserve valid imported widths below this gesture minimum until an actual edit requires a change. |

This deliberately rejects the sidecar suggestion to retain `disableMarginLeft`: the concrete job is presentation, and it does not justify semantic plugin state. It accepts the sidecar's evidence that the existing no-merge UI prohibits split as well. Controls subscribe to capability/policy changes through the actual store/read subscription path; `store.get()` alone does not establish reactive permission.

Row minimum children stays zero because a valid row can be entirely covered by rowspan. Table minimum stays one row; ordinary cells contain rich block content. Keep the single cell type with header property and automatic table → row → cell dependencies. No new table package, generic spreadsheet model, controller, stored selection or renderer prop bag.

## Complete content and structural edits

Merge retains the destination cell and rows. Move every complete source child through canonical live identity before removing the emptied source cells, then update spans. Preserve media-only, nested tables, empty-but-semantic nodes, marks/attributes and owned roots in row-major order. Text emptiness never decides whether a subtree matters. The canonical movement owner handles root ownership, anchors, history and authored changes. Remove placeholder content only through the schema's established empty/default-child rule, never `NodeApi.string` alone. Split keeps original content in its existing anchor cell and creates empty peer cells without duplicating owned roots.

Paste accepts a **complete ContentSlice**, not extracted node arrays. Content, open depths and the reachable owned-root graph survive through fitting. Codec/DOM precedence is resolved before this boundary; `ContentSlice` carries no format provenance, so no model/HTML/CSV/TSV tag survives or influences structural fitting. Table geometry may plan destinations; only canonical grouped fitting imports/remaps owned source roots and publishes the result.

Extend the Plite grouped fitter rather than remapping one flattened root pool. For each placement, derive its reachable root closure and clone/remap roots marked `ownership: 'exclusive'` independently; preserve one mapped identity for roots marked `ownership: 'shared'` when multiple placements intentionally reference them. Materialize all placement root graphs and child writes in the same candidate transaction, then validate ownership and every target before publication. Any missing root, duplicate exclusive owner, failed fit or stale target rolls back the whole group. Never write a raw root-owning source subtree into the target before its root has been materialized. Remove unit-paste `replace-children` writes duplicated by fitting and defer selection until fitting completes instead of applying it twice. Retain private structural repair/expansion plans where they have a job; do not add a second committed-change interpreter.

| Input/target | Accepted behavior |
| --- | --- |
| `openStart === 0`, `openEnd === 0`, and content is exactly one table | The only structural table-grid paste shape. Validate the complete source geometry first; no sibling extraction. All table-owned structural Copy emits this closed one-table shape. |
| Any open slice, top-level row/cell list, or table with siblings | Never synthesize a table wrapper or select the first table. Treat the complete slice as ordinary rich content at the resolved target through canonical fitting; reject atomically when grammar cannot fit it. |
| Paragraph + table + paragraph, nested mixed content | Preserve the whole slice. Inside one cell use normal rich-content fitting; for multi-cell content broadcast fit the whole slice in each exact selected cell. Unsupported nesting rejects atomically. |
| Ordinary rich content into multiple cells | Broadcast the complete slice to each exact cell, even for nonrectangular membership; canonical fitting remaps owned roots per placement. |
| Table into one cell/caret | Place the entire source beginning at the resolved logical cell. Grow when permitted. With growth disabled, reject any overflow. |
| Table into a selected rectangle | Permit exact integral tiling, including 1×1 broadcast. Reject partial/cropped tiles, nonrectangular destination or span boundaries crossing the intended coverage. No modulo clipping. |
| Destination merged cells | Fully covered spans may be split/replaced through the private policy and canonical writes. Reject a partial intersected span; preserve unselected content. |
| Explicit `{at}` outside the current table | Resolve that target first and delegate the whole slice to its canonical owner. Current caret cannot claim the operation. |
| Malformed exact clipboard/table, root-remap or fitting failure | Return model failure, commit nothing, and consume DOM input where necessary to prevent lower-fidelity fallback. Do not disguise rejection as an empty successful edit. |
| CSV/TSV decoder output | Return its actual single table slice from the adapter instead of adding synthetic empty paragraph siblings. Ordinary block fitting owns placement/caret; never strip arbitrary empty paragraphs in the general table planner. |

Every adapter must preserve canonical node membership, not just the new public reader. The current `deleteFragment`, `replaceSlice`, `insertText` and slice get/export wrappers explicitly obtain a representative text range before reading table selection; that round-trip must go. Resolve omitted input from the effective canonical selection and explicit input from that input alone. Structural cell Delete clears only selected cell contents and preserves the exact cell selection/root/direction. Typing clears only that set, inserts once at the canonical focus cell and places the text caret there, in one rollback-capable continuation; the last row-major cell is not a substitute for focus. Ordinary text selection in one cell and generic whole-block table selection retain their canonical behavior.

Structural cell Copy/Cut requires a rectangular span-complete selection that can be represented honestly as a table slice. For a nonrectangular cell set, consume/refuse structural copy/cut without exporting a filled bounding rectangle or deleting content; write no clipboard data and change no document, selection or history. Do not introduce sparse-clipboard topology metadata or leak unselected cells through native fallback. Such a set still supports exact Delete, typing, formatting and ordinary-rich-content broadcast paste. Rectangular Copy emits one closed table, then the canonical export closure retains every transitively reachable selected root and prunes roots owned only by unselected cells. A selected/unselected sibling fixture with distinct exclusive roots proves both retention and pruning. Cut clears the selected cells only after a successful clipboard write; denied/failed writes leave content unchanged. Whole-table block copy remains the canonical block-slice job.

Do not infer paste policy from an unused model/HTML/CSV/TSV WeakMap stack. Delete that stack after the DOM/codec adapter has chosen and decoded the input into a canonical slice. Keep exact-transfer precedence and malformed-exact refusal in the clipboard owner; the table fitter receives no provenance side channel. `api.writeSelection(DataTransfer)` moves to the private DOM integration: copy/cut retains exact model slice, HTML, CSV/TSV/text fallbacks and successful-write-before-cut behavior. Table textual fallbacks quote delimiter/newline/quote-containing fields symmetrically with the decoder; they intentionally lose rich formatting, while exact model/HTML carry supported structure. Do not claim CSV preserves spans/media.

HTML import preserves row groups: clamp both positive rowspan and rowspan=0 to the remaining source row group before flattening; do not borrow body rows for a header span. Scope nested tables correctly. Replace silent budget fallback to colSpan=1 with an honest import failure. Before dense materialization, bound logical occupied area and placement work using the existing 10,000 import-work ceiling as an initial rejection bound, with checked arithmetic. This is an import resource guard, **not** a demonstrated 10,000-cell performance promise or a universal Plite document limit. Validate the exact bound with bounded boundary probes before adoption. Existing model tables outside that import bound must remain intact; guard malformed/hostile model geometry before allocation and report inapplicable geometry rather than rewriting content. A sparse grid rewrite is not selected by this plan.

Markdown export rejects rowspan/colspan it cannot represent, using the existing unsupported-node/error contract; HTML is the explicit structure-preserving alternative. Preserve current rich-cell unsupported-content errors. Do not introduce a second table export API or silent flattening option. CSV and Markdown remain distinct feature owners; only their table transfer boundaries change.

## Shared Plite command adoption

Owner: [command registry](../../packages/plitejs/src/core/command-registry.ts), [public command types](../../packages/plitejs/src/interfaces/editor.ts), [command tests](../../packages/plitejs/test/command-spec.test.ts). Keep `EditorCommandResult = false | TransactionSpec` and delegated-result/once-only/continuation rules. An empty transaction can still represent intentionally consumed no-op input, but never successful table replacement after fitting rejection. DOM event consumption and model replacement success are different boundaries.

The source inventory contains 36 production `around` calls: 32 command and four read wrappers. Read middleware is unaffected. Thirteen command wrappers contain literal false returns; twelve rely on implicit fallback in at least one branch:

| Callers | Adoption |
| --- | --- |
| Code block `insertBreak`; details `delete` | They never call command `next`; use `handle` for their existing claim-or-decline job. A local variable named `next` in details is a node lookup, not delegation. |
| Media `insertBreak`; details `insertBreak`; multiselect `delete`; affinity `delete`; override `insertBreak`/`delete`; both list `insertBreak` wrappers | Change non-applicable pre-delegation and final fallbacks to explicit `next()`. Preserve `return false` after a delegated result fails. Do not blanket replace every false. |
| Markdown-shortcuts and richtext raw examples `insertBreak` | Same explicit fallback adoption; preserve downstream failure propagation. These are adjacent examples, not feature consolidation. |
| Affinity `move` | Its literal false follows `next()` failure and stays false; explicit final next already exists. Counted by literal-false scan, but no implicit fallback change. |
| Other command wrappers | Inspect the recorded bodies; pass-through, rewritten input and continuation uses keep their meaning. Table `replaceSlice` uses `around` so not-applicable can delegate and invalid claimed content can reject. |

The inventory has 13 callbacks with literal false (including affinity move); twelve need fallback/classification adoption. Reconcile exact counts when source changes. Existing property-model `around-false` expectations in command-spec must adopt terminal rejection; preserve handle fallback, native-equivalence, metadata, draft state, nested continuation, named-root and read-only tests. Update plugin-methods teaching in both language mirrors. Do not create a third handler kind or rejection enum.

## Runtime comparison and remaining readiness

| Candidate | Decision and evidence |
| --- | --- |
| Delete private plans; direct canonical candidates everywhere | Reject wholesale adoption. Direct insertion covered a subset; direct paste still used detached repair planning. Normal/large timing did not prove all jobs, and stress failed. |
| Wrap every existing private plan in one canonical candidate | Reject blanket wrapping. Insert authored an extra spec with the same nine node writes/18 canonical sections in the 8×8 count probe. Existing merge identity/data loss survives wrapping. |
| Transform detached whole table and replace its children | Reject. It loses surviving row/cell identities and was materially slower in recorded diagnostics. |
| Retain private planning, correct merge/paste lowering | Selected minimal correctness target. Rich merge move and complete-root fitting probes pass bounded guards; isolated corrected unit paste and final retained insertion pass their frozen contracts. No new store/index/commit owner. Full shapes and history/authored behavior remain package-proof obligations. |
| Replace DOM hook with plugin view attributes | Reject for this adoption. At 25×20: p95 8.75ms DOM versus 48.79ms candidate; at 50×40: 35.71 versus 163.52ms. Candidate causes 15,045/60,045 cell renders across measured actions versus zero. Fan-out 32-table case favored candidate, but did not satisfy the whole frozen contract. |
| Existing DOM hook + corrected semantic reader | Keep ownership. Preserve incremental cell markers/caret restoration and exact table ref. A future optimized generic attribute host would require a new justified investigation. |

Mutation timing was interrupted after observed process RSS of approximately 1.83 GiB. Every 48×48 insert variant exceeded the frozen 600ms p95 budget (current 911ms; direct 822ms; compiled 1,010ms; detached 2,510ms). Stress paste and pathological span insert did not finish, and the original harness did not flush raw samples before interruption. The summaries are diagnostic, not a passing scale receipt or a speed claim. The plan cannot honestly be called fully runtime-ready. Keep this gate visible; do not relax the budget, shrink supported cohorts or call baseline parity success.

The single [repaired isolated run](artifacts/2026-09-17-table-design/mutation/isolated-contract.md) fixed sample persistence and fixture release, used a fresh process per cohort/operation and retained the frozen latency/noise budgets. Raw JSONL, identity, phase/call counters, observer release and RSS were flushed. No product source changed, and no failing timing was retried unchanged. A parse-only setup error preceded target execution and remains recorded.

| Isolated rich 2×2 unit paste | Current p95 | Corrected p95 | Corrected contract |
| --- | ---: | ---: | --- |
| 8×8 table | 11.44ms | 8.53ms | pass |
| 24×24 table | 40.60ms | 29.73ms | pass |
| 48×48 table | 138.02ms | 101.14ms | pass |

The intervention preserves private planning while omitting four fit-owned child writes and deferring one duplicate early selection. Complete value/selection equality, rich content, geometry, input immutability, outside state, one commit and observer release pass. Its receipt accepts this unit-paste path only. The crossing-span observation still accepts a shape the final policy will reject; it is current-behavior evidence, not final-policy acceptance.

The preserved retained 48×48 insertion control failed: p95 **1,337.67ms** against 600ms, with MAD/median **29%** and approximately **441MiB peak sampled RSS**. Its 49 structural writes triggered 49 runtime-index mapping calls, but the overlapping nested durations did not isolate an exclusive cause. A matched packet isolated eager planner selection simulation: deferring selection reduced p50 from 381.05ms to 246.13ms and p95 from 434.17ms to 308.80ms with exact work-count and correctness parity. The file-exact production repair now resolves the logical selection request once from the live transaction draft after all writes. The final-source packet passes at p50 **209.19ms**, p95 **265.18ms**, MAD/median **4.86%**, approximately **508.48MiB peak sampled RSS**, 49 writes, 98 canonical sections, 49 mappings, 48 publications and one commit. The earlier failure remains preserved; the [runtime decision](artifacts/2026-09-17-table-design/mutation/retained-insert-decision.md) and final summary carry the receipts. No Plite runtime-index optimization is justified by this result.

The layout call consolidation uses the existing private grid/width owner once per requested cell, with no eager all-cell array/cache. For one cell, sum only the columns covered by its span using persisted widths and the shared fallback calculation; do not allocate the whole table's resolved-width vector for every cell. Selector equality projects only consumer fields. Its repeated cost must be measured on the final implementation; the paint prototype is not proof of a new layout runtime. The import-area boundary likewise needs its bounded preallocation proof before shipping.

## Mounted view, UI and native proof

Keep `useTableSelectionDOM(tableRef)` and `useTableResize({element, tableRef, onResize, onResizeEnd})`. The mounted view owns root, authored selection, read-only, DOM lifetime and retirement. Model editor identity must not choose a sibling mount. Preview state/8px control column/deferred resize layout remain local copied UI; pure resize math stays headless. Resize commits once on pointerup; cancel, blur, permission change, replaced table/root and unmount discard it. Zero delta is a no-op.

Read-only fences edits and controls, without erasing valid passive selection paint. Static rendering installs no selection/pointer owner. Native drag paints exactly selected cells once, suppresses competing native highlight, and suppresses only the anchor caret. Reverse direction moves that suppression. Collapse/clear/replacement/unmount restore prior styles. Preserve text editing inside a single cell and actual row DnD (same editor/parent, refocus, same-row handles allowed, multirow handles hidden). Delete selected-cell MIME/capture/drop handlers and synthetic-handle-only tests, retaining shared fitting/row drag evidence.

The existing paint pixel test saw zero changed pixels when it expected >200 on both historical baseline and candidate. That positive control remains a blocker for visible-paint claims. Reproduce controlled absent/single/duplicate paint on the exact current route; do not weaken its threshold or substitute marker counts. DOM replacement under an unchanged cell key, `td`→`th`, remount and authored-view changes need real mounted evidence; add no speculative observer/store before reproducing a lifetime defect.

## Ordered execution and proof

Each row is an implementation acceptance slice, not work claimed completed by this planning checklist. Product execution needs acceptance of this plan; publication still needs its own authority. Task owns all slices; one writer per mutable owner.

The semantic dependency chain is 1 → 2 → 3 → 4. Runtime gate 0 runs in parallel because its noisy retained-insertion failure is not a dependency of command, target or transfer correctness; it joins before final browser/package acceptance in slice 5. Slice 6 closes only after both lanes pass.

| Slice | Entry → exit | Exact adoption/proof |
| --- | --- | --- |
| 0. Parallel runtime-readiness gate | Passing isolated unit-paste receipt plus failed/noisy retained-insert control → source-grounded retained-insert diagnosis/repair and passing same-contract rerun | Start alongside slices 1–4. Sample flushing/lifetime repair is done. Preserve failures; separate planner selection simulation from per-write index publication. Keep unit-paste receipt scoped; final spanning-policy/current-vs-final proof remains required. Do not accept a partial variant as general replacement. |
| 1. Canonical command refusal | Settled command law → explicit delegation with existing semantics preserved elsewhere | Registry/types plus classified wrappers/examples; `bun test ./packages/plitejs/test/command-spec.test.ts`; affected Plite development lane and focused feature commands. Actual browser/native routing refusal remains covered at slice 5. |
| 2. Target/selection owner | Shared command law and current source inventory → exact membership/root/view cache, nullable cell/selection and matching policy | Table headless owner; meaningful regressions for explicit outside target, spanned column, foreign/deleted/detached target, diagonal/L-shaped selection, authored accepted/proposed same-index cache, policy flip and read-only. Types prove inferred callbacks/targets/results without callback annotations. |
| 3. Content and identity | Exact targets → complete merge/split/paste with atomic rejection | Merge media-only/rich/owned-root children and retained NodeKeys; exact closed-table classifier; mixed/open whole-slice delegation; selected-copy reachable-root pruning; per-placement exclusive-root cloning with shared-root identity; growth/tiling/rejection table; named target; history undo/redo and authored projection/rollback. Fix HTML group/area guard, CSV adapter table shape, Markdown span refusal and quoted textual fallbacks at their owners. Retire orphan cell drag/source stack. |
| 4. Public/UI adoption | Semantic owner fixed → 21-method surface consumed everywhere | Both copied table renderers, toolbar/popovers, positive cell-span policy/no-merge demo, fixtures, static/header/span/border/width cases, React private clipboard/keyboard adapters. Remove exports and generate barrels. Preserve row DnD and both UI providers. Consolidated layout read runs current/final workload without added all-cell work. |
| 5. Browser and full runtime proof | Slices 1–4 plus passing runtime gate 0 and matching source/registry build → native interaction and exact-view assertions pass | Existing table selection/resize/subscription suites on `/blocks/table-demo` and table example; two mounts of one model plus independent editors, different authored selections, named roots, one read-only, callback retirement, DOM replacement and follow-up typing. Restore the pixel positive control. Rerun same frozen mutation and mounted-work contracts on final production path. |
| 6. Teaching/package closure | Final API and proof → coherent source rules, docs, release metadata, public package artifacts and ledger adoption evidence | Docs, JSDoc, current-state EN/CN references; doctrine version and generated mirrors; reconcile `.changeset/table-block-insert.md` with the final 21-method surface and remove stale helper/constructor teaching; barrel/registry generation; source-first types, focused tests, packed import/type contract where exports changed, final source identity and review-ledger evidence. No release/PR implied. |

Use the [Verify Plate commands](../../.agents/rules/verify-plate/references/commands.md) for runner/source identity. Focused package lanes are `pnpm --filter platejs typecheck:partition:table`, `typecheck:partition:table-react`, `test:partition:table`, `test:partition:table-react`; command owner uses `pnpm check:plite:dev` then the applicable strict handoff lane. Resolve codec/CSV/Markdown partitions from the entrypoint DAG rather than inventing filters. Run affected lint.

The existing www lane is `pnpm --filter www test:www-browser:chromium tests/browser/table-selection.spec.ts tests/browser/table-resize.spec.ts tests/browser/table-element-subscriptions.spec.ts`. Bind fresh served source/registry/build identity, zero retries and the actual browser. Serialize managed browser runs. Native paint/caret needs retry-free repeat packets and real positive/negative controls. Narrow mouse viewport does not prove touch/device behavior. No physical-device claim is required here.

On `next`, registry changes require `pnpm --filter www build:registry` and generated output. Export/file changes require `pnpm brl`. Templates remain CI output. Reuse valid checks; rerun only changed/failed/uncovered claims. Add tests only for costly uncovered public regressions; delete obsolete API/dead-drag tests instead of testing that old symbols are absent. Do not duplicate every prototype case into production tests.

## Teaching and artifact adoption

| Owner | Required change |
| --- | --- |
| Table JSDoc and [EN](../../content/docs/(plugins)/(elements)/table.mdx)/[CN](../../content/docs/(plugins)/(elements)/table.cn.mdx) reference | New method/type inventory, exact targets/null/results, four options, valid creation, rich/complete transfer and honest codec limits. Document current behavior only, no migration narrative. |
| [Plugin methods](../../content/docs/(guides)/plugin-methods.mdx) and mirrored reference | Explicit around delegation/terminal false; no teaching of implicit fallback or void callback annotations. |
| [Plate UI source rule](../../.agents/rules/plate-ui.mdc), its ownership rules | Replace stale `useTableResizeController` teaching with retained `useTableResize`; domain selection answer, hook-owned paint, local preview and copied presentation. |
| [Best API source](../../.agents/rules/best-api.mdc), [Plugin Creator source](../../.agents/rules/plate-plugin-creator.mdc), relevant behavior/inference references | Audit exact-target, inference, truthful results and canonical transfer/transaction teaching. Repair only stale affected guidance, through Maintain Workflow. Never edit generated SKILL.md directly. |
| [Plate vision](../vision/plate.md), [Plite vision](../vision/plite.md), Plate Next doctrine | Smallest durable-law repair for complete rich transfer/selection and command rejection if not already stated; append version, preserve immutable history/attestations, regenerate via owner workflow and prove mirrors. |
| [Existing major changeset](../../.changeset/table-block-insert.md) | Rewrite the final public contract and migration example around the 21 retained methods. Remove `api.create`, `getCellIndices`, `getAdjacentCell`, width-only borders and any old option names; preserve unrelated valid release notes. |
| Generated API reference/registry, public exports, ledger | Regenerate from final sources; include table/React entrypoints and public import/type smoke. Ledger review stays reviewed; adoption/proof progress only with actual implementation receipts. Link this plan without overwriting immutable review records. |

No source rule or public documentation is changed by the planning pass. Doctrine repair is carried by execution and is a required closure gate, not an optional later cleanup.

The local review index links this plan and retains `reviewed / not-assessed / partial`. Structural ledger validation passes (808 features, 3,680 files, 64 scopes, 96 records), and its generated view matches. Full current-inventory validation fails on unrelated `browser/ai-session` source drift; this planning pass does not refresh or change AI review state. The prior table review's file freshness also detects the changed no-merge demo. Its current `disableMerge: true` configuration was re-read and supports the demonstrated policy job; the target gives that job the truthful positive name `allowCellSpanEditing`. Immutable review hashes remain unchanged.

## Risk and prior-finding reconciliation

1. A failed fit after structural prewrites can orphan roots or publish partial selection/history. Build/apply within the canonical rollback boundary, pass complete slices and assert zero commit/value/key/selection change on rejection.
2. A target or cache keyed only by document index can edit/paint a sibling view or wrong root. Resolve explicit inputs before current selection; cache exact selection/view/root; reject foreign keys and retired mounts.
3. A merge implemented as reconstructed row children can retain JSON but destroy identity/anchors/collaboration semantics. Move canonical source children before removing cells and assert surviving keys, roots, history and authored behavior, not merely serialized equality.

Break adoption is one cut, with no public shim. Keep changes reviewable by vertical slice. An implementation failure returns to the affected owner/slice; do not ship both old/new state stores or use whole-document replacement as rollback. Git rollback/publication is outside current authority.

| Review finding | Accounted for |
| --- | --- |
| Image-only merge, retained identity and owned roots | Complete-content law; canonical-move prototype; slice 3 regressions. |
| Mixed-slice sibling loss, target ignored, spanned column mismatch | Whole-slice classifier, one target resolver, logical boundaries; slices 2–3. |
| Open-slice ambiguity and first-table extraction | Only one closed table is structural; every other complete shape delegates or rejects; slice 3. |
| Selected-copy root leakage and broadcast root collisions | Reachable-root pruning plus ownership-aware per-placement remapping in one Plite rollback boundary; slice 3. |
| False merge restriction, fabricated coordinates, invalid constructor | Owner policy, nullable `cell`, valid creation; slice 2/types/UI. |
| False option/type states | Positive policy/default-width names, structural live-node targets, XOR placement, resolved border answers and discriminated nonempty resize commits; types/UI. |
| Grid/context/metrics/navigation/DataTransfer leakage | All 47 method/type dispositions; private DOM adapter; slice 4. |
| Authored cache contamination and exact-membership inflation | Fresh reproductions; cache/membership target and two-view proof. |
| HTML row group/area, Markdown span fidelity, CSV padding | Explicit codec decisions and import preallocation gate. |
| Empty-success replacement and unused paste-source stack | Shared around refusal law, DOM/model boundary, provenance deletion. |
| Orphan cell drag versus real row DnD | Remove only the unreachable cell protocol; preserve row controls. |
| Paint alternative and unresolved pixel control | Tested alternative rejected; existing hook retained; visible-paint gate preserved. |
| Resize, margin, single-column width, border fidelity | Existing math/lifetime split; local margin presentation; destructive option cut; exact rendered borders/widths. |
| Private-plan deletion claim | Corrected: retain independent planning jobs; reject whole-table replacement and unproved wholesale candidates. |
| Scale/source freshness | Failed control retained; causal repair and exact final-source retained-insertion packet pass with source hashes and frozen work/correctness counts. |

The prior census remains 14/14 classified: table capability/entrypoint, table row/cell descriptors, React entrypoint, live/static/toolbar/node-selection UI, no-merge demo, shared value fixture, raw Plite table example and the table selection/resize browser owners. Raw Plite's minimal containment example remains separate; no unrelated Plate feature is absorbed. Adjacent command wrappers and format adapters change only where this accepted contract requires it.

## Handoff

The execution closes the adoption gates. Exact target and span behavior, rich merge/split/paste, retained identity and root ownership, history/authored rollback, import boundaries, final layout work and mounted selection paint are covered by the focused production tests and browser packet. The old accidental public table protocol and selected-cell drag stack are absent; row drag and copied presentation remain independent.

Focused proof passes: 203 headless table tests, 37 React table tests, 143 slow table cases with 22,713 expectations, the affected Plite/CSV/Markdown/AI/DnD lanes, public type contracts, lint, registry/API-reference/docs generation and Plate Next v205 validation. A fresh isolated Chromium server on port 3100 passes all 12 selection, resize and subscription cases with zero retries. The final 48×48 retained-insertion packet passes at p50 209.19ms, p95 265.18ms, MAD/median 4.86% and approximately 508.48MiB peak RSS. The earlier 1,337.67ms failing control remains preserved.

The broad package typecheck still stops on unrelated TS6307 errors from authored files omitted from Plite entrypoint project lists. Physical-device behavior, native Find, publication and release are outside this execution claim.

The final hostile reviews found and repaired the remaining plan defects: root-qualified entries and exact adapter membership; the unearned public constructor; unconstrained live-node targets; non-XOR placement; persisted/resolved border conflation; invalid resize states; false option names; selected-copy root leakage; one-pool placement remapping; ambiguous open-slice classification; unnecessary benchmark serialization; and stale changeset teaching. The final consumer sweep also repaired copied DnD, AI table-selection and table renderer call sites plus second-select-all escalation and browser fixture assumptions.

Next action: none for this plan. Publication remains outside the authorized scope.
