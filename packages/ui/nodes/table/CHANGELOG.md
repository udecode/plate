# @udecode/plate-table-ui

## 21.3.2

## 21.3.0

## 21.1.5

## 21.1.4

## 21.1.2

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

- [#2289](https://github.com/udecode/plate/pull/2289) by [@zbeyens](https://github.com/zbeyens) – `PlateTableCellElement` / `PlateTablePopover`:
  - New popover button to toggle cell borders
  - style changes: cell only display right and bottom borders, except the leftmost and the topmost cells that display left and top borders.

## 20.3.2

## 20.3.1

## 20.3.0

### Minor Changes

- [#2276](https://github.com/udecode/plate/pull/2276) by [@12joan](https://github.com/12joan) – Pass rowIndex to TableCellElementResizable

## 20.2.0

### Patch Changes

- [#2273](https://github.com/udecode/plate/pull/2273) by [@12joan](https://github.com/12joan) – Get `minColumnWidth` from table plugin options

## 20.1.0

### Minor Changes

- [#2270](https://github.com/udecode/plate/pull/2270) by [@12joan](https://github.com/12joan) –
  - Make rows resizable in addition to columns

## 20.0.0

### Major Changes

- [#2251](https://github.com/udecode/plate/pull/2251) by [@zbeyens](https://github.com/zbeyens) – Headless components and hooks moved to `@udecode/plate-table`, so the following components have been renamed:
  - `TableElement` -> `PlateTableElement`
    - removed table border to set it at the cell level
    - `margin-left: 1px` to support cell borders
    - if all columns have a fixed size, the table will have a dynamic width instead of always 100%
  - `TableRowElement` -> `PlateTableRowElement`
  - `TableCellElement` -> `PlateTableCellElement`
    - removed td border in favor of td::before. The latter is responsible of having the border and the selected background color.
    - z-index: td is 0, td::before is 10, td::before in selected state is 20, handle is 30, handle resize is 40.
    - removed `selectedCell` div in favor of `::before`
  - `TablePopover` -> `PlateTablePopover`
    Styled props have been removed.

### Minor Changes

- [#2256](https://github.com/udecode/plate/pull/2256) by [@zbeyens](https://github.com/zbeyens) –
  - New component: `PlateTableCellHeaderElement`: extends `PlateTableCellElement` +
    - `td` -> `th`
    - styling

## 19.7.0

## 19.6.0

### Minor Changes

- [#2212](https://github.com/udecode/plate/pull/2212) by [@TomMorane](https://github.com/TomMorane) – Toolbar buttons: add default tooltip content

## 19.5.0

### Minor Changes

- [#2202](https://github.com/udecode/plate/pull/2202) by [@zbeyens](https://github.com/zbeyens) – Replace onMouseDown by onClick. Add aria-label.

## 19.4.4

## 19.4.2

## 19.3.0

## 19.2.0

## 19.1.1

## 19.1.0

## 19.0.3

## 19.0.1

## 19.0.0

## 18.15.0

## 18.13.0

## 18.12.1

## 18.11.0

## 18.9.0

## 18.7.0

## 18.6.0

## 18.2.0

## 18.1.2

## 18.1.1

## 17.0.3

## 17.0.2

## 17.0.1

## 17.0.0

## 16.8.0

## 16.6.0

## 16.5.0

## 16.4.2

### Patch Changes

- [#1821](https://github.com/udecode/plate/pull/1821) by [@zbeyens](https://github.com/zbeyens) –
  - Fixes https://github.com/udecode/editor-protocol/issues/77
  - Fixes #1820

## 16.4.0

### Minor Changes

- [#1800](https://github.com/udecode/plate/pull/1800) by [@zbeyens](https://github.com/zbeyens) – Light breaking changes:
  - `TableElementBase` has been removed for `TableElement`
  - in v16, `TableElement` `onRenderContainer` prop has been removed for `floatingOptions`. However, `TablePopover` has other props which you may want to control. So this release adds `popoverProps` prop has been added and `floatingOptions` prop is moved into `popoverProps.floatingOptions`.
  - Instead of using `onRenderContainer`, replace `ELEMENT_TABLE` in the `createPlateUI` function.

## 16.3.0

## 16.2.0

### Patch Changes

- [#1778](https://github.com/udecode/plate/pull/1778) by [@zbeyens](https://github.com/zbeyens) –
  - fix: table cells are now full height and not vertically centered anymore

## 16.1.0

### Patch Changes

- [#1768](https://github.com/udecode/plate/pull/1768) by [@zbeyens](https://github.com/zbeyens) – Fix:
  - Slate should not throw anymore when clicking around the table
  - Resizing columns should resize on drag. Moved the atoms into `tableStore`, `useTableStore`:
    - `hoveredColIndexAtom`
    - `resizingColAtom`
    - `selectedCellsAtom`

## 16.0.2

## 16.0.0

### Major Changes

- [#1721](https://github.com/udecode/plate/pull/1721) by [@zbeyens](https://github.com/zbeyens) –
  - `TableElementBase` props:
    - replace `onRenderContainer` by `floatingOptions`
  - `TablePopover` is now a floating instead of tippy
  - deps:
    - replaced `plate-ui-popover` by `plate-floating`

## 15.0.3

## 15.0.0

## 14.4.2

## 14.0.2

## 14.0.0

## 13.8.0

## 13.7.0

## 13.6.0

## 13.5.0

## 13.3.0

## 13.2.1

## 13.1.0

## 11.3.1

## 11.3.0

## 11.2.1

## 11.2.0

## 11.1.1

## 11.1.0

### Minor Changes

- [#1546](https://github.com/udecode/plate/pull/1546) by [@zbeyens](https://github.com/zbeyens) –
  - `TableElement`
    - set `table-layout: fixed`
    - `useSelectedCells`: set selected cells on selection change (memo)
  - `TableCellElement`
    - set bg color when cell is selected
    - `useIsCellSelected`

## 11.0.6

## 11.0.5

## 11.0.4

## 11.0.3

## 11.0.2

## 11.0.1

## 11.0.0

### Minor Changes

- [#1500](https://github.com/udecode/plate/pull/1500) by [@zbeyens](https://github.com/zbeyens) – updated deps:
  ```bash
  "jotai": "^1.6.6",
  "re-resizable": "^6.9.9"
  ```

## 10.8.0

### Minor Changes

- [#1513](https://github.com/udecode/plate/pull/1513) by [@jolsen314](https://github.com/jolsen314) – Added restriction to table resize when in readOnly mode (with override prop)

## 10.6.3

## 10.6.2

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

## 10.1.0

## 10.0.0

## 9.3.1

## 9.3.0

## 9.2.1

### Patch Changes

- [#1341](https://github.com/udecode/plate/pull/1341) by [@zbeyens](https://github.com/zbeyens) – Fix components using `usePlateEditorState` by introducing `withEditor` / `EditorProvider` hoc

## 9.2.0

## 9.1.3

## 9.1.1

## 9.0.0

## 8.3.0

## 8.1.0

## 8.0.0

## 7.0.3

## 7.0.2

## 7.0.1

## 7.0.0

### Major Changes

- [#1190](https://github.com/udecode/plate/pull/1190) by [@zbeyens](https://github.com/zbeyens) – renamed `ToolbarTable` to `TableToolbarButton`

## 6.4.2

### Patch Changes

- [#1187](https://github.com/udecode/plate/pull/1187) by [@zbeyens](https://github.com/zbeyens) – fix: show borders

## 6.4.1

## 6.4.0

## 6.3.0

### Minor Changes

- [#1177](https://github.com/udecode/plate/pull/1177) by [@zbeyens](https://github.com/zbeyens) –
  - `TableElement` new prop:
    - `onRenderContainer?: RenderFunction<TableElementProps>` - default is `TablePopover`

## 6.2.0

### Minor Changes

- [#1173](https://github.com/udecode/plate/pull/1173) by [@zbeyens](https://github.com/zbeyens) –
  - new deps: `@udecode/plate-ui-button` and `@udecode/plate-ui-popover`
  - `TableCellElement` new prop:
    - `hideBorder`
  - `TableElement`:
    - wrapping the table with `TablePopover` which displays a popover when selected.
    - new prop: `popoverProps`, can be used to override the popover content
  - new components:
    - `TablePopover` which displays a button to delete the table
    - `TableRowElement`

## 6.1.0

### Minor Changes

- [#1161](https://github.com/udecode/plate/pull/1161) by [@zbeyens](https://github.com/zbeyens) – Added support for resizing columns:
  - styles
  - `TableCellElement` component:
    - Show a blue vertical line when hovering between columns
    - Use of jotai to share resizing width, hovering column
  - `useTableColSizes` hook
  - `hoveredColIndexAtom`, `resizingColAtom` atoms
  - Support undo/redo
  - deps: `jotai` and `re-resizable`

## 6.0.0

## 5.3.5

### Patch Changes

- Updated dependencies [[`a6bf8c5e`](https://github.com/udecode/plate/commit/a6bf8c5e6897c6ab443e0ac3d69a30befeaddadf)]:
  - @udecode/plate-common@5.3.5
  - @udecode/plate-table@5.3.5
  - @udecode/plate-styled-components@5.3.5
  - @udecode/plate-toolbar@5.3.5

## 5.3.1

### Patch Changes

- Updated dependencies [[`8aec270f`](https://github.com/udecode/plate/commit/8aec270f8b06a3b25b8d7144c2e23b0dc12de118)]:
  - @udecode/plate-core@5.3.1
  - @udecode/plate-common@5.3.1
  - @udecode/plate-table@5.3.1
  - @udecode/plate-styled-components@5.3.1
  - @udecode/plate-toolbar@5.3.1

## 5.3.0

### Minor Changes

- [#1126](https://github.com/udecode/plate/pull/1126) [`1021397d`](https://github.com/udecode/plate/commit/1021397df42ee13006892372bd329446f362a930) Thanks [@zbeyens](https://github.com/zbeyens)! - pass rest of props to the root tag

### Patch Changes

- Updated dependencies [[`7ee21356`](https://github.com/udecode/plate/commit/7ee21356f0a4e67e367232b3dbc9957254a0c11e), [`1021397d`](https://github.com/udecode/plate/commit/1021397df42ee13006892372bd329446f362a930)]:
  - @udecode/plate-core@5.3.0
  - @udecode/plate-styled-components@5.3.0
  - @udecode/plate-common@5.3.0
  - @udecode/plate-table@5.3.0
  - @udecode/plate-toolbar@5.3.0

## 5.1.0

### Patch Changes

- Updated dependencies [[`503956fd`](https://github.com/udecode/plate/commit/503956fd9f71253249b3ad699b81c1c465351b0a)]:
  - @udecode/plate-common@5.1.0
  - @udecode/plate-table@5.1.0
  - @udecode/plate-styled-components@5.1.0
  - @udecode/plate-toolbar@5.1.0

## 5.0.1

### Patch Changes

- Updated dependencies [[`53d13cbc`](https://github.com/udecode/plate/commit/53d13cbcfc7af26040cb86182a7ea0ba9ae5abec)]:
  - @udecode/plate-toolbar@5.0.1

## 5.0.0

### Patch Changes

- Updated dependencies [[`9a091446`](https://github.com/udecode/plate/commit/9a091446ae393c23f64f0b011e431fb2d002aaf8), [`9a091446`](https://github.com/udecode/plate/commit/9a091446ae393c23f64f0b011e431fb2d002aaf8)]:
  - @udecode/plate-toolbar@5.0.0

## 4.4.0

### Patch Changes

- Updated dependencies [[`b22c06aa`](https://github.com/udecode/plate/commit/b22c06aad1cfed08069dadc7ec39bcbfb1d0af37)]:
  - @udecode/plate-common@4.4.0
  - @udecode/plate-table@4.4.0
  - @udecode/plate-styled-components@4.4.0
  - @udecode/plate-toolbar@4.4.0

## 4.3.7

### Patch Changes

- Updated dependencies [[`58f6fb53`](https://github.com/udecode/plate/commit/58f6fb53bf45a2e0509f4aca617aa21356952fca)]:
  - @udecode/plate-core@4.3.7
  - @udecode/plate-common@4.3.7
  - @udecode/plate-table@4.3.7
  - @udecode/plate-styled-components@4.3.7
  - @udecode/plate-toolbar@4.3.7

## 4.3.0

### Patch Changes

- Updated dependencies [[`6af469cd`](https://github.com/udecode/plate/commit/6af469cd5ac310e831eb8a99a71eba73bde62fc6)]:
  - @udecode/plate-core@4.3.0
  - @udecode/plate-common@4.3.0
  - @udecode/plate-table@4.3.0
  - @udecode/plate-styled-components@4.3.0
  - @udecode/plate-toolbar@4.3.0

## 4.2.0

### Patch Changes

- Updated dependencies [[`ea693250`](https://github.com/udecode/plate/commit/ea6932504e1639f38a28c177ac0ef7de5b9ea79d)]:
  - @udecode/plate-toolbar@4.2.0

## 4.0.0

### Patch Changes

- Updated dependencies [[`d5667409`](https://github.com/udecode/plate/commit/d5667409e4e53b4b41a14335a7298c260c52019e), [`a899c585`](https://github.com/udecode/plate/commit/a899c5850fbe09792113b2b3f4787d869568427d)]:
  - @udecode/plate-toolbar@4.0.0

## 3.5.1

### Patch Changes

- Updated dependencies [[`0db393e1`](https://github.com/udecode/plate/commit/0db393e1cebec792c89a633cb8929a0786943713)]:
  - @udecode/plate-styled-components@3.5.1
  - @udecode/plate-toolbar@3.5.1

## 3.4.0

### Patch Changes

- Updated dependencies [[`f1da7267`](https://github.com/udecode/plate/commit/f1da7267d46d94e207f4477f73e42b63736a9085), [`35caf35d`](https://github.com/udecode/plate/commit/35caf35d48fff851518648ff66e64a4268dcc97c)]:
  - @udecode/plate-common@3.4.0
  - @udecode/plate-core@3.4.0
  - @udecode/plate-table@3.4.0
  - @udecode/plate-styled-components@3.4.0
  - @udecode/plate-toolbar@3.4.0

## 3.2.0

### Minor Changes

- [#995](https://github.com/udecode/plate/pull/995) [`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4) Thanks [@dylans](https://github.com/dylans)! - update slate dependencies and peerDependencies to 0.66.\*

### Patch Changes

- Updated dependencies [[`56b2551b`](https://github.com/udecode/plate/commit/56b2551b2fa5fab180b3c99551144667f99f7afc), [`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4)]:
  - @udecode/plate-table@3.2.0
  - @udecode/plate-common@3.2.0
  - @udecode/plate-core@3.2.0
  - @udecode/plate-styled-components@3.2.0
  - @udecode/plate-toolbar@3.2.0

## 3.1.3

### Patch Changes

- Updated dependencies [[`f6c58134`](https://github.com/udecode/plate/commit/f6c581347cc5877b7afa0774ef1ad78ad227564e)]:
  - @udecode/plate-common@3.1.3
  - @udecode/plate-table@3.1.3
  - @udecode/plate-styled-components@3.1.3
  - @udecode/plate-toolbar@3.1.3

## 3.1.2

### Patch Changes

- Updated dependencies [[`1244bcb7`](https://github.com/udecode/plate/commit/1244bcb748411e6291d635647c2053b115704eb9), [`5651aed7`](https://github.com/udecode/plate/commit/5651aed704d69af85e2dd7d6f850e8dcabcd45f4)]:
  - @udecode/plate-table@3.1.2

## 3.1.0

### Patch Changes

- Updated dependencies [[`a1600e5f`](https://github.com/udecode/plate/commit/a1600e5f8cf1a1b4aa6a88048063431ecafbf766), [`03f2acdd`](https://github.com/udecode/plate/commit/03f2acdd1b34d1e4e574bcf296ae5b4796930c9a)]:
  - @udecode/plate-toolbar@3.1.0
  - @udecode/plate-styled-components@3.1.0

## 3.0.2

### Patch Changes

- Updated dependencies [[`83aaf31c`](https://github.com/udecode/plate/commit/83aaf31c02b24f388d1f178dcd4b80354ddab773)]:
  - @udecode/plate-table@3.0.2

## 3.0.1

### Patch Changes

- Updated dependencies [[`885a7799`](https://github.com/udecode/plate/commit/885a77995619c99293403b4a7ee0019eecf3dfd0)]:
  - @udecode/plate-styled-components@3.0.1
  - @udecode/plate-toolbar@3.0.1

## 3.0.0

### Major Changes

- [#955](https://github.com/udecode/plate/pull/955) [`348f7efb`](https://github.com/udecode/plate/commit/348f7efb9276735d8282652db1516b46c364b6ed) Thanks [@zbeyens](https://github.com/zbeyens)! - WHAT: moved `styled-components` from dependencies to peer dependencies.
  WHY: there was multiple instances of `styled-components` across all the packages.
  HOW: make sure to have `styled-components` in your dependencies.

### Patch Changes

- Updated dependencies [[`348f7efb`](https://github.com/udecode/plate/commit/348f7efb9276735d8282652db1516b46c364b6ed)]:
  - @udecode/plate-styled-components@3.0.0
  - @udecode/plate-toolbar@3.0.0

## 2.0.1

### Patch Changes

- Updated dependencies [[`099a86fa`](https://github.com/udecode/plate/commit/099a86faede3b3acf7da6842a78e4fab76815073)]:
  - @udecode/plate-table@2.0.1

## 2.0.0

### Patch Changes

- Updated dependencies [[`ec4d5b7b`](https://github.com/udecode/plate/commit/ec4d5b7bd01b6fd21ba14a28f782c143d32c7532)]:
  - @udecode/plate-common@2.0.0
  - @udecode/plate-table@2.0.0
  - @udecode/plate-styled-components@2.0.0
  - @udecode/plate-toolbar@2.0.0

## 1.1.7

### Patch Changes

- Updated dependencies [[`10064d24`](https://github.com/udecode/plate/commit/10064d24dde293768452abb7c853dc75cbde2c78)]:
  - @udecode/plate-styled-components@1.1.7
  - @udecode/plate-toolbar@1.1.7

## 1.1.6

### Patch Changes

- [#918](https://github.com/udecode/plate/pull/918) [`7d045d8d`](https://github.com/udecode/plate/commit/7d045d8db39515d4574c5313cc97287486c5866b) Thanks [@zbeyens](https://github.com/zbeyens)! - add `slate-history` as a peerDep

- Updated dependencies [[`7d045d8d`](https://github.com/udecode/plate/commit/7d045d8db39515d4574c5313cc97287486c5866b)]:
  - @udecode/plate-common@1.1.6
  - @udecode/plate-table@1.1.6
  - @udecode/plate-styled-components@1.1.6
  - @udecode/plate-toolbar@1.1.6

## 1.1.5

### Patch Changes

- Updated dependencies [[`f955b72c`](https://github.com/udecode/plate/commit/f955b72c0ab97e2e2ca54f17f9f8022f7d0f121b)]:
  - @udecode/plate-table@1.1.5

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
  - @udecode/slate-plugins-table@1.0.0-next.61
  - @udecode/slate-plugins-styled-components@1.0.0-next.61
  - @udecode/slate-plugins-toolbar@1.0.0-next.61

## 1.0.0-next.59

### Patch Changes

- Updated dependencies [[`3a3eb1b8`](https://github.com/udecode/slate-plugins/commit/3a3eb1b8565789b7ba49e8170479df8245ed5b22)]:
  - @udecode/slate-plugins-common@1.0.0-next.59
  - @udecode/slate-plugins-table@1.0.0-next.59
  - @udecode/slate-plugins-styled-components@1.0.0-next.59
  - @udecode/slate-plugins-toolbar@1.0.0-next.59

## 1.0.0-next.56

### Patch Changes

- Updated dependencies [[`75b39f18`](https://github.com/udecode/slate-plugins/commit/75b39f18901d38f80847573cd3431ece1d1d4b3d)]:
  - @udecode/slate-plugins-core@1.0.0-next.56
  - @udecode/slate-plugins-common@1.0.0-next.56
  - @udecode/slate-plugins-table@1.0.0-next.56
  - @udecode/slate-plugins-styled-components@1.0.0-next.56
  - @udecode/slate-plugins-toolbar@1.0.0-next.56

## 1.0.0-next.55

### Patch Changes

- Updated dependencies [[`abaf4a11`](https://github.com/udecode/slate-plugins/commit/abaf4a11d3b69157983b6cf77b023a6008478a79)]:
  - @udecode/slate-plugins-core@1.0.0-next.55
  - @udecode/slate-plugins-common@1.0.0-next.55
  - @udecode/slate-plugins-table@1.0.0-next.55
  - @udecode/slate-plugins-styled-components@1.0.0-next.55
  - @udecode/slate-plugins-toolbar@1.0.0-next.55

## 1.0.0-next.54

### Patch Changes

- Updated dependencies [[`f9e4cb95`](https://github.com/udecode/slate-plugins/commit/f9e4cb9505837dd7ba59df3f2598f7ed112d8896), [`d906095d`](https://github.com/udecode/slate-plugins/commit/d906095d20cf8755a200d254f6c20c510a748f29)]:
  - @udecode/slate-plugins-styled-components@1.0.0-next.54
  - @udecode/slate-plugins-common@1.0.0-next.54
  - @udecode/slate-plugins-toolbar@1.0.0-next.54
  - @udecode/slate-plugins-table@1.0.0-next.54

## 1.0.0-next.53

### Patch Changes

- Updated dependencies [[`42360b44`](https://github.com/udecode/slate-plugins/commit/42360b444d6a2959847d5619eda32319e360e3af)]:
  - @udecode/slate-plugins-core@1.0.0-next.53
  - @udecode/slate-plugins-common@1.0.0-next.53
  - @udecode/slate-plugins-table@1.0.0-next.53
  - @udecode/slate-plugins-styled-components@1.0.0-next.53
  - @udecode/slate-plugins-toolbar@1.0.0-next.53

## 1.0.0-next.51

### Patch Changes

- Updated dependencies [[`0c02cee8`](https://github.com/udecode/slate-plugins/commit/0c02cee8cc7b105ab27a329882991d86253c0517)]:
  - @udecode/slate-plugins-styled-components@1.0.0-next.51
  - @udecode/slate-plugins-toolbar@1.0.0-next.51

## 1.0.0-next.46

### Patch Changes

- Updated dependencies [[`6e9068f6`](https://github.com/udecode/slate-plugins/commit/6e9068f6f483b698b6b3aae6819333103504f41b)]:
  - @udecode/slate-plugins-common@1.0.0-next.46
  - @udecode/slate-plugins-table@1.0.0-next.46
  - @udecode/slate-plugins-toolbar@1.0.0-next.46

## 1.0.0-next.40

### Patch Changes

- Updated dependencies [[`15048e6f`](https://github.com/udecode/slate-plugins/commit/15048e6facbefc5fe21b0b9bd9a586f269cada89)]:
  - @udecode/slate-plugins-core@1.0.0-next.40
  - @udecode/slate-plugins-common@1.0.0-next.40
  - @udecode/slate-plugins-table@1.0.0-next.40
  - @udecode/slate-plugins-toolbar@1.0.0-next.40

## 1.0.0-next.39

### Patch Changes

- Updated dependencies [[`b444071e`](https://github.com/udecode/slate-plugins/commit/b444071e2673803dba05c770c5dfbbde14f7a631)]:
  - @udecode/slate-plugins-core@1.0.0-next.39
  - @udecode/slate-plugins-common@1.0.0-next.39
  - @udecode/slate-plugins-table@1.0.0-next.39
  - @udecode/slate-plugins-toolbar@1.0.0-next.39

## 1.0.0-next.37

### Patch Changes

- Updated dependencies []:
  - @udecode/slate-plugins-table@1.0.0-next.37
  - @udecode/slate-plugins-toolbar@1.0.0-next.37

## 1.0.0-next.36

### Patch Changes

- Updated dependencies [[`806e1632`](https://github.com/udecode/slate-plugins/commit/806e16322e655802822079d8540a6983a9dfb06e)]:
  - @udecode/slate-plugins-core@1.0.0-next.36
  - @udecode/slate-plugins-table@1.0.0-next.36
  - @udecode/slate-plugins-toolbar@1.0.0-next.36

## 1.0.0-next.32

### Patch Changes

- [#713](https://github.com/udecode/slate-plugins/pull/713) [`73b77853`](https://github.com/udecode/slate-plugins/commit/73b77853cb38f61d4bfb31a0d604e947c130ee0f) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: added the core dep to avoid duplicated stores in the build

- Updated dependencies [[`73b77853`](https://github.com/udecode/slate-plugins/commit/73b77853cb38f61d4bfb31a0d604e947c130ee0f)]:
  - @udecode/slate-plugins-table@1.0.0-next.32

## 1.0.0-next.30

### Patch Changes

- Updated dependencies []:
  - @udecode/slate-plugins-table@1.0.0-next.30
  - @udecode/slate-plugins-toolbar@1.0.0-next.30

## 1.0.0-next.29

### Minor Changes

- [#668](https://github.com/udecode/slate-plugins/pull/668) [`f1e6107c`](https://github.com/udecode/slate-plugins/commit/f1e6107cb1cd082f44bd48252fce0eefd576037c) Thanks [@zbeyens](https://github.com/zbeyens)! - The components/hooks can now be outside `SlatePlugins` and need the
  editor to be focused once to be functional.

### Patch Changes

- Updated dependencies [[`f1e6107c`](https://github.com/udecode/slate-plugins/commit/f1e6107cb1cd082f44bd48252fce0eefd576037c)]:
  - @udecode/slate-plugins-toolbar@1.0.0-next.29
  - @udecode/slate-plugins-table@1.0.0-next.29

## 1.0.0-next.26

### Patch Changes

- Updated dependencies []:
  - @udecode/slate-plugins-table@1.0.0-next.26
  - @udecode/slate-plugins-toolbar@1.0.0-next.26
