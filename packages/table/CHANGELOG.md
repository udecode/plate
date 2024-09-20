# @udecode/plate-table

## 38.0.6

### Patch Changes

- [`f26ed56053b14e697fea2e6a7e33a73ce28593e4`](https://github.com/udecode/plate/commit/f26ed56053b14e697fea2e6a7e33a73ce28593e4) by [@12joan](https://github.com/12joan) – Add the `colspan` and `rowspan` attributes to `dangerouslyAllowAttributes` for TableCellPlugin and TableCellHeaderPlugin

## 38.0.5

### Patch Changes

- [#3552](https://github.com/udecode/plate/pull/3552) by [@natamox](https://github.com/natamox) – Fix unmerge & compute cell indices

  Remove computeAllCellIndices, use computeCellIndices instead

## 38.0.1

### Patch Changes

- [#3526](https://github.com/udecode/plate/pull/3526) by [@zbeyens](https://github.com/zbeyens) – Prefix base plugin with `Base`

## 38.0.0

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createTablePlugin` -> `TablePlugin`
  - NEW `TableRowPlugin`, `TableCellPlugin`, `TableCellHeaderPlugin`
  - Replace `insertTableColumn` with `editor.insert.tableColumn`
  - Replace `insertTableRow` with `editor.insert.tableRow`
  - Move `cellFactory` option to `create.cell` api
  - Move `getCellChildren` option to `table.getCellChildren` api

## 36.5.8

### Patch Changes

- [#3463](https://github.com/udecode/plate/pull/3463) by [@beeant0512](https://github.com/beeant0512) – fixed the judgment logic of deleting the last row of the table

## 36.5.7

### Patch Changes

- [#3461](https://github.com/udecode/plate/pull/3461) by [@beeant0512](https://github.com/beeant0512) – fix delete last row will cause editor crash when `enableMerging: true`

## 36.3.8

### Patch Changes

- [#3406](https://github.com/udecode/plate/pull/3406) by [@beeant0512](https://github.com/beeant0512) – fix: where total or num is a string

## 36.3.5

### Patch Changes

- [#3410](https://github.com/udecode/plate/pull/3410) by [@AHappyAtlas](https://github.com/AHappyAtlas) – Recalculate the split cells after unmerge

## 36.3.1

### Patch Changes

- [#3368](https://github.com/udecode/plate/pull/3368) by [@beeant0512](https://github.com/beeant0512) – fix table column count when first row has merged columns

## 36.2.0

### Patch Changes

- [#3383](https://github.com/udecode/plate/pull/3383) by [@EvanSmith93](https://github.com/EvanSmith93) – Fix table header property and apply header to only the top row of new tables

## 36.0.0

## 35.2.0

### Minor Changes

- [`a115f969d2032af53ea88c6add7d1dfa7cf3610f`](https://github.com/udecode/plate/commit/a115f969d2032af53ea88c6add7d1dfa7cf3610f) – Add `getCellChildren` option to `TablePlugin`

## 35.1.0

### Minor Changes

- [#3313](https://github.com/udecode/plate/pull/3313) by [@zbeyens](https://github.com/zbeyens) –
  - Add `cellFactory` option to `TablePlugin`, called each time a cell is created. Default is `getEmptyCellNode`
  - Remove `newCellChildren` option from `TablePlugin`, use `cellFactory` instead

## 34.0.0

## 33.0.7

### Patch Changes

- [#3222](https://github.com/udecode/plate/pull/3222) by [@dimaanj](https://github.com/dimaanj) – fix serializeHtml when overwriteByKey used

## 33.0.2

### Patch Changes

- [#3187](https://github.com/udecode/plate/pull/3187) by [@zbeyens](https://github.com/zbeyens) – Fix types

## 33.0.0

## 32.0.2

### Patch Changes

- [#3172](https://github.com/udecode/plate/pull/3172) by [@KorovinQuantori](https://github.com/KorovinQuantori) – Add computeCellIndices fallback for table insert functions

## 32.0.0

## 31.4.1

### Patch Changes

- [#3138](https://github.com/udecode/plate/pull/3138) by [@felixfeng33](https://github.com/felixfeng33) – Fix: adding marks in a cell is applying to the whole cell

## 31.4.0

### Patch Changes

- [#3118](https://github.com/udecode/plate/pull/3118) by [@felixfeng33](https://github.com/felixfeng33) – Missing exports

## 31.3.3

### Patch Changes

- [#3090](https://github.com/udecode/plate/pull/3090) by [@felixfeng33](https://github.com/felixfeng33) – fix can not remove table column when selection is expanded

## 31.3.2

### Patch Changes

- [#3086](https://github.com/udecode/plate/pull/3086) by [@felixfeng33](https://github.com/felixfeng33) – fix add/removeMark behavior When selection is aboving table.

## 31.3.1

### Patch Changes

- [#3037](https://github.com/udecode/plate/pull/3037) by [@KorovinQuantori](https://github.com/KorovinQuantori) – Hotfix: reset cell entries list when table is overflown

- [#3083](https://github.com/udecode/plate/pull/3083) by [@KorovinQuantori](https://github.com/KorovinQuantori) – Use getRowSpan\getColSpan instead of pointing at `rowspan` and `colspan` fields directly

## 31.0.0

## 30.9.4

### Patch Changes

- [#3037](https://github.com/udecode/plate/pull/3037) by [@KorovinQuantori](https://github.com/KorovinQuantori) – Hotfix: reset cell entries list when table is overflown

- [#3034](https://github.com/udecode/plate/pull/3034) by [@KorovinQuantori](https://github.com/KorovinQuantori) – canMerge = true only if user selected more than one cell

## 30.9.3

### Patch Changes

- [#3029](https://github.com/udecode/plate/pull/3029) by [@KorovinQuantori](https://github.com/KorovinQuantori) – Ensure that table selection is always a valid sub-table

## 30.9.2

### Patch Changes

- [#3026](https://github.com/udecode/plate/pull/3026) by [@KorovinQuantori](https://github.com/KorovinQuantori) – Copy rowSpan and colSpan properties of cell when set fragment data

## 30.9.1

### Patch Changes

- [#3013](https://github.com/udecode/plate/pull/3013) by [@adrwz](https://github.com/adrwz) – Set "not found" value to -1 instead of 0 for colIndex

## 30.5.3

### Patch Changes

- [`4cbed7159`](https://github.com/udecode/plate/commit/4cbed7159d51f7427051686e45bcf2a8899aeede) by [@zbeyens](https://github.com/zbeyens) – Move `@udecode/plate-common` to peerDeps to fix a bug when multiple instances were installed

## 30.4.5

## 30.1.2

## 30.0.1

### Patch Changes

- [#2873](https://github.com/udecode/plate/pull/2873) by [@zbeyens](https://github.com/zbeyens) – Fix: merging empty cells should result into a single empty paragraph

## 30.0.0

### Major Changes

- [#2867](https://github.com/udecode/plate/pull/2867) by [@12joan](https://github.com/12joan) – Fix: in v28, `TableProvider` was incorrectly shared by all tables in the editor. `TableProvider` must now be rendered as part of `TableElement`.

### Patch Changes

- [#2867](https://github.com/udecode/plate/pull/2867) by [@12joan](https://github.com/12joan) – Fix: Row and column size overrides not being applied correctly

## 29.1.0

### Patch Changes

- [#2860](https://github.com/udecode/plate/pull/2860) by [@johnrazeur](https://github.com/johnrazeur) – Remove unused code from withDeleteTable

## 29.0.1

## 29.0.0

## 28.1.2

### Patch Changes

- [#2833](https://github.com/udecode/plate/pull/2833) by [@AndreyMarchuk](https://github.com/AndreyMarchuk) – Fix lodash import

## 28.1.1

### Patch Changes

- [#2832](https://github.com/udecode/plate/pull/2832) by [@dimaanj](https://github.com/dimaanj) –
  - Fix: merge of header cells in table
  - Fix: #2831

## 28.0.0

### Patch Changes

- [#2816](https://github.com/udecode/plate/pull/2816) by [@12joan](https://github.com/12joan) –
  - Replace `useEdtiorState` with `useEditorSelector`

## 27.0.3

## 27.0.2

### Patch Changes

- [#2808](https://github.com/udecode/plate/pull/2808) by [@zbeyens](https://github.com/zbeyens) – Fix merging cells inside nested tables using the relative paths.

## 27.0.1

### Patch Changes

- [#2806](https://github.com/udecode/plate/pull/2806) by [@zbeyens](https://github.com/zbeyens) – Types: `TTableCellElement['attributes']` is now optional

## 27.0.0

### Patch Changes

- [#2763](https://github.com/udecode/plate/pull/2763) by [@12joan](https://github.com/12joan) –
  - Migrate store to jotai@2
  - Render `TableProvider` above editable

## 26.0.5

## 26.0.4

### Patch Changes

- [#2776](https://github.com/udecode/plate/pull/2776) by [@dimaanj](https://github.com/dimaanj) – Fix unmerging a single column

## 26.0.3

### Patch Changes

- [#2724](https://github.com/udecode/plate/pull/2724) by [@duckRabbitPy](https://github.com/duckRabbitPy) – Table row insertion: cells in a newly added row will now receive header styling only if they satisfy specific criteria:

  - Every cell in the column is a header cell,
  - The table contains more than one row, or
  - The column possesses a predefined header property.

- [`0b5962d0`](https://github.com/udecode/plate/commit/0b5962d06d6121526e09ff8b3e164d358bbc881c) by [@zbeyens](https://github.com/zbeyens) – Fix: `useTableMergeState` should return false values when `enableMerging: false`

## 26.0.2

### Patch Changes

- [#2771](https://github.com/udecode/plate/pull/2771) by [@KorovinQuantori](https://github.com/KorovinQuantori) – Fixed table insertion inside text nodes

## 26.0.1

### Patch Changes

- [#2768](https://github.com/udecode/plate/pull/2768) by [@KorovinQuantori](https://github.com/KorovinQuantori) – Fixed copy behaviour, when not all table cells are filled with some nodes

## 26.0.0

### Minor Changes

- [#2733](https://github.com/udecode/plate/pull/2733) by [@dimaanj](https://github.com/dimaanj) –
  - Table plugin has now merging support. To enable it, use option `enableMerging: true`

## 25.0.1

## 25.0.0

## 24.5.2

## 24.4.2

### Patch Changes

- [#2682](https://github.com/udecode/plate/pull/2682) by [@kristian-puccio](https://github.com/kristian-puccio) – newCellChildren is now passed as an option to insertTable or the plugin option is used

## 24.4.0

### Minor Changes

- [#2675](https://github.com/udecode/plate/pull/2675) by [@zbeyens](https://github.com/zbeyens) – Support slate-react 0.99.0

## 24.3.6

## 24.3.5

## 24.3.2

## 24.3.1

## 24.3.0

## 24.2.0

## 24.0.2

## 24.0.1

## 24.0.0

## 23.7.4

## 23.7.0

## 23.6.1

### Patch Changes

- [#2594](https://github.com/udecode/plate/pull/2594) by [@OliverWales](https://github.com/OliverWales) – Fix column deletion early return

## 23.6.0

## 23.4.1

### Patch Changes

- [#2581](https://github.com/udecode/plate/pull/2581) by [@OliverWales](https://github.com/OliverWales) – Modify insertTableRow and insertTableColumn to support header columns to preserve header columns if they exist + not blindly assume that it's a header row if the first cell in that row is a header cell.

## 23.3.1

## 23.3.0

## 23.1.0

### Minor Changes

- [#2557](https://github.com/udecode/plate/pull/2557) by [@zbeyens](https://github.com/zbeyens) – Add support of table cell background styles. To update the component, run:
  ```bash
  npx @udecode/plate-ui@latest add table-cell-element
  ```

### Patch Changes

- [#2555](https://github.com/udecode/plate/pull/2555) by [@zbeyens](https://github.com/zbeyens) – Major changes missing from 23.0.0:
  - Removed `TableCellElementResizable`. Use `useTableCellElementResizableState` and `useTableCellElementResizable` instead.

## 23.0.1

### Patch Changes

- [#2550](https://github.com/udecode/plate/pull/2550) by [@zbeyens](https://github.com/zbeyens) – Fix cell selection in firefox

## 23.0.0

## 22.0.2

## 22.0.1

## 22.0.0

### Major Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – Removed:
  - `TableCellElement`
  - `TableCellElementResizableWrapper`
  - `TableCellElementRoot`
  - `TableElement`
  - `TableElementCol`
  - `TableElementColGroup`
  - `TableElementRoot`
  - `TableElementTBody`
  - `TableRowElement`
  - `ArrowDropDownCircleIcon`
  - `BorderAllIcon`
  - `BorderBottomIcon`
  - `BorderLeftIcon`
  - `BorderNoneIcon`
  - `BorderOuterIcon`
  - `BorderRightIcon`
  - `BorderTopIcon`

### Minor Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – New hooks:
  - `useTableElement`
  - `useTableCellElement`

### Patch Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – Untab from first row cell should not throw anymore.

## 21.5.0

## 21.4.3

### Patch Changes

- [#2461](https://github.com/udecode/plate/pull/2461) by [@dimaanj](https://github.com/dimaanj) – Support copy paste content of a single table cell.

## 21.4.2

## 21.4.1

## 21.3.4

## 21.3.2

## 21.3.0

## 21.1.5

## 21.0.0

## 20.7.2

## 20.7.0

## 20.6.3

## 20.5.0

### Minor Changes

- [#2302](https://github.com/udecode/plate/pull/2302) by [@zbeyens](https://github.com/zbeyens) –
  - Table margin left resizing. Fixes #2301
  - Remove depedency on `re-resizable` in favor of new `@udecode/resizable` package.

## 20.4.0

### Minor Changes

- [#2289](https://github.com/udecode/plate/pull/2289) by [@zbeyens](https://github.com/zbeyens) – New queries:
  - `getTableCellBorders`
  - `getLeftTableCell`
  - `getTopTableCell`
  - `isTableBorderHidden`
    New transforms:
  - `setBorderSize`
    `TableCellElementState` new field:
  - `borders: BorderStylesDefault`

## 20.3.2

### Patch Changes

- [#2285](https://github.com/udecode/plate/pull/2285) by [@12joan](https://github.com/12joan) – Ignore `defaultPrevented` keydown events

## 20.3.0

### Minor Changes

- [#2276](https://github.com/udecode/plate/pull/2276) by [@12joan](https://github.com/12joan) – Table width is now preserved when resizing columns, except when resizing the last column

## 20.2.0

### Minor Changes

- [#2273](https://github.com/udecode/plate/pull/2273) by [@12joan](https://github.com/12joan) –
  - `TablePlugin` new option: `minColumnWidth` - Sets the minimum width a column can be resized to
  - `insertTableColumn` now shrinks columns if the new total width would exceed `initialTableWidth`

## 20.1.0

### Minor Changes

- [#2270](https://github.com/udecode/plate/pull/2270) by [@12joan](https://github.com/12joan) –
  - Make rows resizable in addition to columns
    - `TableCellElement.ResizableWrapper` no longer takes a `colIndex` prop
    - `TableCellElement.Resizable` now takes `stepX` and `stepY` as overrides for `step` to set the resize increments for the X and Y axes
    - `setTableRowSize` - sets the height of the selected row

## 20.0.0

### Major Changes

- [#2251](https://github.com/udecode/plate/pull/2251) by [@zbeyens](https://github.com/zbeyens) –
  - `TablePlugin` option `disableUnsetSingleColSize` has been renamed and inverted into `enableUnsetSingleColSize`. New default is disabled. **Migration**:
    - if using `disableUnsetSingleColSize: true`, the option can be removed
    - if using `disableUnsetSingleColSize: false`, use `enableUnsetSingleColSize: true`
  - `getTableColumnIndex` second parameter type is now: `cellNode: TElement`

### Minor Changes

- [#2251](https://github.com/udecode/plate/pull/2251) by [@zbeyens](https://github.com/zbeyens) –
  - `TablePlugin` new option: `initialTableWidth` – If defined, a normalizer will set each undefined table `colSizes` to this value divided by the number of columns. Merged cells not yet supported. If not defined, the table column sizes will stay to `auto`.
  - `insertTableColumn`: if option `initialTableWidth` is defined, the column size will be set to (a) the size of the next column if defined, (b) the size of the current column if it's the last one or (c) `initialTableWidth / colSizes.length`. If not defined, the column size stays to `auto`.
  - Headless UI:
    - `TableElement`:
      - `onMouseDown` will collapse the selection if some cells are selected
    - `TableCellElement`
      - new prop `resizableProps.step?: number`: Resize by step instead of by pixel.
    - `TableRowElement`

## 19.7.0

## 19.5.0

## 19.4.4

## 19.4.2

## 19.3.0

### Patch Changes

- [#2165](https://github.com/udecode/plate/pull/2165) by [@OliverWales](https://github.com/OliverWales) – Override setFragmentData for table range selections #2137

## 19.2.0

## 19.1.1

## 19.1.0

### Patch Changes

- [#2142](https://github.com/udecode/plate/pull/2142) by [@zbeyens](https://github.com/zbeyens) – fix: pass `deleteFragment` params

## 19.0.3

## 19.0.1

## 19.0.0

## 18.15.0

## 18.13.0

### Patch Changes

- [#1829](https://github.com/udecode/plate/pull/1829) by [@osamatanveer](https://github.com/osamatanveer) –
  - fix import

## 18.11.0

### Patch Changes

- [#2006](https://github.com/udecode/plate/pull/2006) by [@Raigen](https://github.com/Raigen) – `insertTableColumn`, `insertTableRow`: new option `at`

## 18.9.0

## 18.7.0

## 18.6.0

## 18.2.0

## 18.1.2

### Patch Changes

- [#1914](https://github.com/udecode/plate/pull/1914) by [@zbeyens](https://github.com/zbeyens) – fix: `deleteColumn` supports table with different row sizes

## 18.1.1

## 17.0.3

## 17.0.2

## 17.0.1

## 17.0.0

## 16.8.0

## 16.6.0

### Minor Changes

- [#1835](https://github.com/udecode/plate/pull/1835) by [@zbeyens](https://github.com/zbeyens) – New table plugin option: `disableUnsetSingleColSize`. Disable unsetting the first column width when the table has one column. Set it to true if you want to resize the table width when there is only one column. Keep it false if you have a full-width table.

## 16.5.0

### Patch Changes

- [#1832](https://github.com/udecode/plate/pull/1832) by [@zbeyens](https://github.com/zbeyens) – Refactor: use `editor.currentKeyboardEvent`

## 16.4.2

### Patch Changes

- [#1821](https://github.com/udecode/plate/pull/1821) by [@zbeyens](https://github.com/zbeyens) –

  - Fixes #1356
  - Fixes #1359

- [#1819](https://github.com/udecode/plate/pull/1819) by [@zbeyens](https://github.com/zbeyens) – Fix: https://github.com/udecode/editor-protocol/issues/76

## 16.3.0

### Minor Changes

- [#1796](https://github.com/udecode/plate/pull/1796) by [@zbeyens](https://github.com/zbeyens) –
  - Fixes #1795
  - Fixes #1794
  - Fixes #1793
  - Fixes #1791
  - Fixes #1798
  - `getTableCellEntry`:
    - renamed to `getTableEntries`
    - returns `table`, `row`, `cell`
    - is now working when selecting many blocks in a cell
  - `moveSelectionFromCell`:
    - new option `fromOneCell`
    - should not do anything when `at` is in a single cell, unless `fromOneCell` is `true`
  - `overrideSelectionFromCell`: Override the new selection if the previous selection and the new one are in different cells

## 16.2.0

### Minor Changes

- [#1778](https://github.com/udecode/plate/pull/1778) by [@zbeyens](https://github.com/zbeyens) –
  - on delete many cells:
    - replace cell children by a paragraph then reselect all the selected cells
  - on get fragment (copy):
    - copying in a single cell should not copy the table anymore
  - on insert fragment (paste):
    - pasting multiple blocks into many selected cells will replace these cells children by the same blocks
    - replace cell children by a paragraph then reselect all the selected cells
  - on insert text:
    - it should delete the cells content by preserving the cells
  - normalize cells:
    - wrap cell children in a paragraph if they are texts
  - normalize selection:
    - it was easy to destroy the table structure when selection goes beyond a table. The current fix is to normalize the selection so it selects the whole table (see the specs)
  - specs:
    - https://github.com/udecode/editor-protocol/issues/63
    - https://github.com/udecode/editor-protocol/issues/64
    - https://github.com/udecode/editor-protocol/issues/65
    - https://github.com/udecode/editor-protocol/issues/66
    - https://github.com/udecode/editor-protocol/issues/67
    - https://github.com/udecode/editor-protocol/issues/68
    - https://github.com/udecode/editor-protocol/issues/69

## 16.1.0

## 16.0.2

## 16.0.0

## 15.0.3

## 15.0.0

### Major Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –
  - remove `addRow` for `insertTableRow`
  - remove `addColumn` for `insertTableColumn`

## 14.4.2

## 14.0.2

## 14.0.0

## 13.8.0

## 13.7.0

## 13.6.0

## 13.5.0

## 13.3.0

### Patch Changes

- [#1604](https://github.com/udecode/plate/pull/1604) by [@zbeyens](https://github.com/zbeyens) – fix: table generics

## 13.2.1

### Patch Changes

- [#1600](https://github.com/udecode/plate/pull/1600) by [@dylans](https://github.com/dylans) – apply missing generic

## 13.1.0

## 11.3.1

### Patch Changes

- [#1573](https://github.com/udecode/plate/pull/1573) by [@zbeyens](https://github.com/zbeyens) – Table plugin: add `insertRow`, `insertColumn` options

## 11.3.0

### Minor Changes

- [#1569](https://github.com/udecode/plate/pull/1569) by [@zbeyens](https://github.com/zbeyens) –
  - https://github.com/udecode/editor-protocol/issues/32
  - `addRow` deprecated in favor of `insertTableRow`
  - `addColumn` deprecated in favor of `insertTableColumn`
  - `insertTableRow` now selects the cell below selected cell (previously it was selecting the last cell)

## 11.2.1

## 11.2.0

### Minor Changes

- [#1560](https://github.com/udecode/plate/pull/1560) by [@zbeyens](https://github.com/zbeyens) –
  - fix: tab / untab when composing with IME
  - update peerDeps:
    - `"slate": ">=0.78.0"`
    - `"slate-react": ">=0.79.0"`

### Patch Changes

- [#1554](https://github.com/udecode/plate/pull/1554) by [@mrganser](https://github.com/mrganser) – fix onKeyDownTable so it only acts with Tab key when selection is within a table, so default or others handlers can work outside

## 11.1.1

### Patch Changes

- [#1548](https://github.com/udecode/plate/pull/1548) by [@zbeyens](https://github.com/zbeyens) –
  - fix arrow navigation inside table cell having a block (e.g. paragraph)

## 11.1.0

### Minor Changes

- [#1546](https://github.com/udecode/plate/pull/1546) by [@zbeyens](https://github.com/zbeyens) –

  - `getTableGridAbove`: Get sub table above anchor and focus
  - `getTableGridByRange`: Get sub table between 2 cell paths.
  - `moveSelectionFromCell`: Move selection by cell unit.
  - `getCellTypes`: Get td and th types.
  - `getEmptyCellNode`, `getEmptyRowNode`, `getEmptyTableNode`: `cellChildren` option
  - `getEmptyTableNode`: `rowCount`, `colCount` options
  - `preventDeleteTableCell`
  - `withDeleteTable`: Prevent cell deletion
  - `withGetFragmentTable`: If selection is in a table, get subtable above
  - `withInsertFragmentTable`

  Cell selection:

  - https://github.com/udecode/editor-protocol/issues/26
  - https://github.com/udecode/editor-protocol/issues/27
  - https://github.com/udecode/editor-protocol/issues/28
  - https://github.com/udecode/editor-protocol/issues/29
  - https://github.com/udecode/editor-protocol/issues/15
  - https://github.com/udecode/editor-protocol/issues/17
  - https://github.com/udecode/editor-protocol/issues/30
  - https://github.com/udecode/editor-protocol/issues/31
  - https://github.com/udecode/editor-protocol/issues/12
  - https://github.com/udecode/editor-protocol/issues/25
  - https://github.com/udecode/editor-protocol/issues/20

  Copy/paste:

  - https://github.com/udecode/editor-protocol/issues/19
  - https://github.com/udecode/editor-protocol/issues/13
  - https://github.com/udecode/editor-protocol/issues/14

  Delete:

  - https://github.com/udecode/editor-protocol/issues/21
  - https://github.com/udecode/editor-protocol/issues/22
  - https://github.com/udecode/editor-protocol/issues/23

## 11.0.6

## 11.0.5

## 11.0.4

## 11.0.3

## 11.0.2

## 11.0.1

## 11.0.0

## 10.6.3

### Patch Changes

- [#1494](https://github.com/udecode/plate/pull/1494) by [@woodpeng](https://github.com/woodpeng) – prevent tab key event in table propagate to editor

## 10.5.3

## 10.5.2

## 10.5.0

## 10.4.2

## 10.4.1

## 10.4.0

## 10.3.0

### Patch Changes

- [#1429](https://github.com/udecode/plate/pull/1429) by [@zbeyens](https://github.com/zbeyens) – `TableElement`:
  - fix undefined case
  - fix warning "Unknown event handler property `onRenderContainer`. It will be ignored."

## 10.2.2

## 10.2.1

## 10.1.2

## 10.1.1

### Patch Changes

- [#1388](https://github.com/udecode/plate/pull/1388) by [@zbeyens](https://github.com/zbeyens) – fix for docs only: use `Array.from` instead of destructuring generators

## 10.1.0

## 10.0.0

## 9.3.1

## 9.3.0

## 9.2.1

## 9.2.0

### Patch Changes

- [#1334](https://github.com/udecode/plate/pull/1334) by [@Pedrobusou](https://github.com/Pedrobusou) – prevent extra nodes from being copy pasted

## 9.1.3

### Patch Changes

- [#1331](https://github.com/udecode/plate/pull/1331) by [@Pedrobusou](https://github.com/Pedrobusou) – add missing getPluginType usage

## 9.1.1

### Patch Changes

- [#1322](https://github.com/udecode/plate/pull/1322) by [@sctang2020](https://github.com/sctang2020) – fix #1216, set cusor to first cell for newly created table

## 9.0.0

## 8.3.0

## 8.1.0

## 8.0.0

## 7.0.2

## 7.0.1

## 7.0.0

## 6.4.1

## 6.4.0

## 6.3.0

## 6.2.0

## 6.1.0

### Minor Changes

- [#1161](https://github.com/udecode/plate/pull/1161) by [@zbeyens](https://github.com/zbeyens) – Added:
  - `getTableColumnCount`
  - `getTableColumnIndex`: Get table column index of a cell node.
  - `setTableColSize`
  - `TableNodeData: { colSizes?: number[] }`

## 6.0.0

## 5.3.5

### Patch Changes

- Updated dependencies [[`a6bf8c5e`](https://github.com/udecode/plate/commit/a6bf8c5e6897c6ab443e0ac3d69a30befeaddadf)]:
  - @udecode/plate-common@5.3.5

## 5.3.1

### Patch Changes

- Updated dependencies [[`8aec270f`](https://github.com/udecode/plate/commit/8aec270f8b06a3b25b8d7144c2e23b0dc12de118)]:
  - @udecode/plate-core@5.3.1
  - @udecode/plate-common@5.3.1

## 5.3.0

### Patch Changes

- Updated dependencies [[`7ee21356`](https://github.com/udecode/plate/commit/7ee21356f0a4e67e367232b3dbc9957254a0c11e)]:
  - @udecode/plate-core@5.3.0
  - @udecode/plate-common@5.3.0

## 5.1.0

### Patch Changes

- Updated dependencies [[`503956fd`](https://github.com/udecode/plate/commit/503956fd9f71253249b3ad699b81c1c465351b0a)]:
  - @udecode/plate-common@5.1.0

## 4.4.0

### Patch Changes

- Updated dependencies [[`b22c06aa`](https://github.com/udecode/plate/commit/b22c06aad1cfed08069dadc7ec39bcbfb1d0af37)]:
  - @udecode/plate-common@4.4.0

## 4.3.7

### Patch Changes

- Updated dependencies [[`58f6fb53`](https://github.com/udecode/plate/commit/58f6fb53bf45a2e0509f4aca617aa21356952fca)]:
  - @udecode/plate-core@4.3.7
  - @udecode/plate-common@4.3.7

## 4.3.0

### Patch Changes

- Updated dependencies [[`6af469cd`](https://github.com/udecode/plate/commit/6af469cd5ac310e831eb8a99a71eba73bde62fc6)]:
  - @udecode/plate-core@4.3.0
  - @udecode/plate-common@4.3.0

## 3.4.0

### Patch Changes

- Updated dependencies [[`f1da7267`](https://github.com/udecode/plate/commit/f1da7267d46d94e207f4477f73e42b63736a9085), [`35caf35d`](https://github.com/udecode/plate/commit/35caf35d48fff851518648ff66e64a4268dcc97c)]:
  - @udecode/plate-common@3.4.0
  - @udecode/plate-core@3.4.0

## 3.2.0

### Minor Changes

- [#995](https://github.com/udecode/plate/pull/995) [`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4) Thanks [@dylans](https://github.com/dylans)! - update slate dependencies and peerDependencies to 0.66.\*

### Patch Changes

- [#1006](https://github.com/udecode/plate/pull/1006) [`56b2551b`](https://github.com/udecode/plate/commit/56b2551b2fa5fab180b3c99551144667f99f7afc) Thanks [@tjramage](https://github.com/tjramage)! - Adds more natural default header option when inserting table columns

- Updated dependencies [[`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4)]:
  - @udecode/plate-common@3.2.0
  - @udecode/plate-core@3.2.0

## 3.1.3

### Patch Changes

- Updated dependencies [[`f6c58134`](https://github.com/udecode/plate/commit/f6c581347cc5877b7afa0774ef1ad78ad227564e)]:
  - @udecode/plate-common@3.1.3

## 3.1.2

### Patch Changes

- [#997](https://github.com/udecode/plate/pull/997) [`1244bcb7`](https://github.com/udecode/plate/commit/1244bcb748411e6291d635647c2053b115704eb9) Thanks [@z0al](https://github.com/z0al)! - fix(table): jump to next header cell on TAB

- [#994](https://github.com/udecode/plate/pull/994) [`5651aed7`](https://github.com/udecode/plate/commit/5651aed704d69af85e2dd7d6f850e8dcabcd45f4) Thanks [@z0al](https://github.com/z0al)! - fix(table): only mark first row as table header

## 3.0.2

### Patch Changes

- [#965](https://github.com/udecode/plate/pull/965) [`83aaf31c`](https://github.com/udecode/plate/commit/83aaf31c02b24f388d1f178dcd4b80354ddab773) Thanks [@dylans](https://github.com/dylans)! - insertTable was only inserting header cells

## 2.0.1

### Patch Changes

- [#948](https://github.com/udecode/plate/pull/948) [`099a86fa`](https://github.com/udecode/plate/commit/099a86faede3b3acf7da6842a78e4fab76815073) Thanks [@dylans](https://github.com/dylans)! - some table cell calls were missing th check

## 2.0.0

### Patch Changes

- Updated dependencies [[`ec4d5b7b`](https://github.com/udecode/plate/commit/ec4d5b7bd01b6fd21ba14a28f782c143d32c7532)]:
  - @udecode/plate-common@2.0.0

## 1.1.6

### Patch Changes

- [#918](https://github.com/udecode/plate/pull/918) [`7d045d8d`](https://github.com/udecode/plate/commit/7d045d8db39515d4574c5313cc97287486c5866b) Thanks [@zbeyens](https://github.com/zbeyens)! - add `slate-history` as a peerDep

- Updated dependencies [[`7d045d8d`](https://github.com/udecode/plate/commit/7d045d8db39515d4574c5313cc97287486c5866b)]:
  - @udecode/plate-common@1.1.6

## 1.1.5

### Patch Changes

- [#914](https://github.com/udecode/plate/pull/914) [`f955b72c`](https://github.com/udecode/plate/commit/f955b72c0ab97e2e2ca54f17f9f8022f7d0f121b) Thanks [@dylans](https://github.com/dylans)! - `deleteColumn` was not referring to TH and TD, but TD twice

## 1.0.0

### Major Changes

🎉 The **Slate Plugins** project has evolved to **Plate** 🎉

To migrate, install `@udecode/plate[-x]` then find and replace all
occurrences of:

- `slate-plugins` to `plate`
- `SlatePlugins` to `Plate`
- `SlatePlugin` to `PlatePlugin`

## 1.0.0-next.61

> This is the last version of `@udecode/slate-plugins[-x]`, please install
> `@udecode/plate[-x]`.

### Patch Changes

- Updated dependencies [[`7c26cf32`](https://github.com/udecode/slate-plugins/commit/7c26cf32e8b501d531c6d823ab55bf361e228bc3)]:
  - @udecode/slate-plugins-core@1.0.0-next.61
  - @udecode/slate-plugins-common@1.0.0-next.61

## 1.0.0-next.59

### Patch Changes

- Updated dependencies [[`3a3eb1b8`](https://github.com/udecode/slate-plugins/commit/3a3eb1b8565789b7ba49e8170479df8245ed5b22)]:
  - @udecode/slate-plugins-common@1.0.0-next.59

## 1.0.0-next.56

### Patch Changes

- Updated dependencies [[`75b39f18`](https://github.com/udecode/slate-plugins/commit/75b39f18901d38f80847573cd3431ece1d1d4b3d)]:
  - @udecode/slate-plugins-core@1.0.0-next.56
  - @udecode/slate-plugins-common@1.0.0-next.56

## 1.0.0-next.55

### Patch Changes

- Updated dependencies [[`abaf4a11`](https://github.com/udecode/slate-plugins/commit/abaf4a11d3b69157983b6cf77b023a6008478a79)]:
  - @udecode/slate-plugins-core@1.0.0-next.55
  - @udecode/slate-plugins-common@1.0.0-next.55

## 1.0.0-next.54

### Patch Changes

- Updated dependencies [[`d906095d`](https://github.com/udecode/slate-plugins/commit/d906095d20cf8755a200d254f6c20c510a748f29)]:
  - @udecode/slate-plugins-common@1.0.0-next.54

## 1.0.0-next.53

### Patch Changes

- Updated dependencies [[`42360b44`](https://github.com/udecode/slate-plugins/commit/42360b444d6a2959847d5619eda32319e360e3af)]:
  - @udecode/slate-plugins-core@1.0.0-next.53
  - @udecode/slate-plugins-common@1.0.0-next.53

## 1.0.0-next.46

### Patch Changes

- Updated dependencies [[`6e9068f6`](https://github.com/udecode/slate-plugins/commit/6e9068f6f483b698b6b3aae6819333103504f41b)]:
  - @udecode/slate-plugins-common@1.0.0-next.46

## 1.0.0-next.40

### Patch Changes

- Updated dependencies [[`15048e6f`](https://github.com/udecode/slate-plugins/commit/15048e6facbefc5fe21b0b9bd9a586f269cada89)]:
  - @udecode/slate-plugins-core@1.0.0-next.40
  - @udecode/slate-plugins-common@1.0.0-next.40

## 1.0.0-next.39

### Patch Changes

- Updated dependencies [[`b444071e`](https://github.com/udecode/slate-plugins/commit/b444071e2673803dba05c770c5dfbbde14f7a631)]:
  - @udecode/slate-plugins-core@1.0.0-next.39
  - @udecode/slate-plugins-common@1.0.0-next.39

## 1.0.0-next.37

### Patch Changes

- Updated dependencies [[`2cf618c3`](https://github.com/udecode/slate-plugins/commit/2cf618c3a0220ca03c1d95e0b51d1ff58d73578c)]:
  - @udecode/slate-plugins-common@1.0.0-next.37

## 1.0.0-next.36

### Patch Changes

- Updated dependencies [[`7cbd7bd9`](https://github.com/udecode/slate-plugins/commit/7cbd7bd95b64e06fde38dcd68935984de8f3a82f), [`806e1632`](https://github.com/udecode/slate-plugins/commit/806e16322e655802822079d8540a6983a9dfb06e)]:
  - @udecode/slate-plugins-common@1.0.0-next.36
  - @udecode/slate-plugins-core@1.0.0-next.36

## 1.0.0-next.32

### Patch Changes

- [#713](https://github.com/udecode/slate-plugins/pull/713) [`73b77853`](https://github.com/udecode/slate-plugins/commit/73b77853cb38f61d4bfb31a0d604e947c130ee0f) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: added the core dep to avoid duplicated stores in the build

## 1.0.0-next.30

### Patch Changes

- Updated dependencies [[`33605a49`](https://github.com/udecode/slate-plugins/commit/33605a495ccc3fd9b4f6cfdaf2eb0e6e59bd7a67), [`28f30c8a`](https://github.com/udecode/slate-plugins/commit/28f30c8a6b0a2d245d6f6403c8399f2e59d98b92), [`75e6d25d`](https://github.com/udecode/slate-plugins/commit/75e6d25de0f9cf2487adecff54c2993ebc795aa0)]:
  - @udecode/slate-plugins-core@1.0.0-next.30
  - @udecode/slate-plugins-common@1.0.0-next.30

## 1.0.0-next.29

### Patch Changes

- Updated dependencies [[`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3), [`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3)]:
  - @udecode/slate-plugins-core@1.0.0-next.29
  - @udecode/slate-plugins-common@1.0.0-next.29

## 1.0.0-next.26

### Patch Changes

- Updated dependencies [[`201a7993`](https://github.com/udecode/slate-plugins/commit/201a799342ff88405e120182d8554e70b726beea)]:
  - @udecode/slate-plugins-core@1.0.0-next.26
  - @udecode/slate-plugins-common@1.0.0-next.26
