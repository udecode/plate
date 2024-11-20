# @udecode/plate-selection

## 40.1.0

### Minor Changes

- [#3774](https://github.com/udecode/plate/pull/3774) by [@felixfeng33](https://github.com/felixfeng33) – Fix the issue of slow scrolling speed when the cursor is at the bottom.(areaOption needs to be removed to fix the issue.)
  If there are no special requirements, there is no need to pass areaOptions; the default configuration is the optimal one.

## 40.0.0

### Minor Changes

- [#3744](https://github.com/udecode/plate/pull/3744) by [@zbeyens](https://github.com/zbeyens) –
  - New plugin `CursorOverlayPlugin`
  - `useCursorOverlay` now supports collapsed selection using `minSelectionWidth = 1`
  - selectable depends now on `data-block-id` instead of `data-key`
  - Fix a bug when deleting selected blocks without id
  - Fix `useBlockSelected`: use `id` parameter if defined

## 39.3.7

### Patch Changes

- [#3740](https://github.com/udecode/plate/pull/3740) by [@felixfeng33](https://github.com/felixfeng33) – Fix enter can't unselect.

## 39.3.6

### Patch Changes

- [#3738](https://github.com/udecode/plate/pull/3738) by [@felixfeng33](https://github.com/felixfeng33) – New api `editor.getApi(BlockSelectionPlugin).blockSelection.focus();`
  Fix the issue where block selection should not be unselect when the block context menu is open.

- [`0b9be462fb6cefa2e75f02f2ade0a20c833aca31`](https://github.com/udecode/plate/commit/0b9be462fb6cefa2e75f02f2ade0a20c833aca31) by [@felixfeng33](https://github.com/felixfeng33) – Fix: clicking the left or right padding of the editor did not deselect.

## 39.3.5

### Patch Changes

- [`49c275252b5a24fac53729e5522f0c8192c643f5`](https://github.com/udecode/plate/commit/49c275252b5a24fac53729e5522f0c8192c643f5) by [@felixfeng33](https://github.com/felixfeng33) – Fix the issue where BlockSelection occasionally fails to delete the selected node.

## 39.2.12

### Patch Changes

- [`86487a3357dbe6005a0b4e37c2510c97f2ad4d96`](https://github.com/udecode/plate/commit/86487a3357dbe6005a0b4e37c2510c97f2ad4d96) by [@zbeyens](https://github.com/zbeyens) – Remove data-key when not mounted

## 39.2.3

### Patch Changes

- [`0842bf3c81c88d154510cd46d0b57d16570c8ec3`](https://github.com/udecode/plate/commit/0842bf3c81c88d154510cd46d0b57d16570c8ec3) by [@zbeyens](https://github.com/zbeyens) – Fix: prevent scroll on block selection

## 39.2.0

### Minor Changes

- [#3644](https://github.com/udecode/plate/pull/3644) by [@felixfeng33](https://github.com/felixfeng33) –
  - Add `editor.tf.setBlockSelectionIndent` `editor.tf.insertBlocksAndSelect`
  - `BlockMenuPlugin`: Now when the left mouse button is clicked and the menu is open, the default event will not be prevented.

## 39.1.4

### Patch Changes

- [#3616](https://github.com/udecode/plate/pull/3616) by [@zbeyens](https://github.com/zbeyens) –
  - Add `useBlockSelectionNodes`, `useBlockSelectionFragment`, `useBlockSelectionFragmentProp`
  - `BlockSelectionPlugin`:
    - Make `setSelectedIds` options optional
    - Rename option `getSelectedBlocks` -> `getNodes`
    - Extend api: `duplicate`, `removeNodes`, `select`, `setNodes`, `setTexts`
  - Rename `BlockContextMenuPlugin` to `BlockMenuPlugin`
  - `BlockMenuPlugin` options:
    - `position`
    - `openId`
  - `BlockMenuPlugin` api:
    - `hide`
    - `show`
    - `showContextMenu`

## 39.1.2

### Patch Changes

- [`a5a8e1eb6eb0d769f0560cb8d595eb0a1b4c7b12`](https://github.com/udecode/plate/commit/a5a8e1eb6eb0d769f0560cb8d595eb0a1b4c7b12) by [@zbeyens](https://github.com/zbeyens) –
  - Add `isSelecting`, `isSelectingOrFocused`, `useIsSelecting`
  - Add `ids` option to `api.blockSelection.setSelectedIds` as an alternative way to set selected ids

## 39.0.0

### Major Changes

- [#3597](https://github.com/udecode/plate/pull/3597) by [@zbeyens](https://github.com/zbeyens) – The following changes were made to improve performance:

  - Removed `useHooksBlockSelection` in favor of `BlockSelectionAfterEditable`
  - Removed `slate-selected` class from `BlockSelectable`. You can do it on your components using `useBlockSelected()` instead, or by using our new `block-selection.tsx` component.
  - Introduced `useBlockSelectableStore` for managing selectable state.

### Minor Changes

- [#3597](https://github.com/udecode/plate/pull/3597) by [@zbeyens](https://github.com/zbeyens) –
  - `BlockSelectableProvider`, `useBlockSelectableStore` to store `selectable` state.
  - Introduced `isSelectionAreaVisible` option in `BlockSelectionPlugin` config. Useful to hide some UI when `true`.
  - New `useBlockSelected` hook for checking if a block is selected.

## 38.0.11

### Patch Changes

- [#3578](https://github.com/udecode/plate/pull/3578) by [@felixfeng33](https://github.com/felixfeng33) – If `defaultPrevented` is true stop keydown handlers.

## 38.0.9

### Patch Changes

- [#3569](https://github.com/udecode/plate/pull/3569) by [@felixfeng33](https://github.com/felixfeng33) – Remove the Div rendered above the editor.

  This div is to solve the issue of the browser's default scrolling behavior being too fast.

  However, it caused some other issues and complicated configurations, such as being unable to focus on the editor when clicking the padding-right area.

  If you think this issue is more important, you refer to the flowing code.

  ```tsx
    BlockSelectionPlugin.configure({
      render: {
        aboveEditable: ({ children }) => {
      return ( <div style={{ position: 'relative', width: '100%' }}>
        {/*
         *select text then move cursor to the very bottom will trigger the default browser behavior
         *this div is a workaround to prevent the default browser behavior (set userSelect: none)
         *Make sure the div with is the same with the editor's padding-right
         */}

        {/* TODO: click to focus the node */}
        <div
          style={{
            height: '100%',
            position: 'absolute',
            right: 0,
            top: 0,
            userSelect: 'none',
            width: editorPaddingRight ?? 'max(5%, 24px)',
            zIndex: 1,
          }}
          data-plate-selectable
        />
        {children}
        </div>)
    },
      },
    }),
  ```

## 38.0.7

### Patch Changes

- [#3566](https://github.com/udecode/plate/pull/3566) by [@felixfeng33](https://github.com/felixfeng33) – Fix width issues caused by hover scrollbars.

## 38.0.0

## 37.0.6

### Patch Changes

- [#3499](https://github.com/udecode/plate/pull/3499) by [@felixfeng33](https://github.com/felixfeng33) – Add `rightSelectionAreaClassName` to the above component to control the width.

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - Rename `createSelectionPlugin` to `BlockSelectionPlugin`
  - Remove `isNodeBlockSelected`, `isBlockSelected`, `hasBlockSelected`, `useBlockSelected` functions
    - Use `editor.getOptions(BlockSelectionPlugin)` or `editor.useOptions(BlockSelectionPlugin)` instead
  - Remove `addSelectedRow` function
    - Use `editor.api.blockSelection.addSelectedRow` instead
  - Remove `withSelection` HOC
  - Rename `onCloseBlockSelection` to `onChangeBlockSelection`
  - Moved `blockSelectionStore` to `BlockSelectionPlugin`
  - Moved `blockContextMenuStore` to `BlockContextMenuPlugin`
  - Remove `BlockStartArea` and `BlockSelectionArea` components
    - Use `areaOptions` in `BlockSelectionPlugin` for configuration instead
  - Remove dependency on `@viselect/vanilla` package
    - Forked and integrated selection functionality locally
  - Add `BlockContextMenuPlugin`, which is now used by `BlockSelectionPlugin`
    - No need to add it manually
  - Fix scroll-related bugs in the selection functionality
  - Improve performance and reliability of block selection

## 36.5.1

### Patch Changes

- [#3440](https://github.com/udecode/plate/pull/3440) by [@felixfeng33](https://github.com/felixfeng33) – Add test to `onKeyDownSelection`

## 36.4.1

### Patch Changes

- [#3437](https://github.com/udecode/plate/pull/3437) by [@felixfeng33](https://github.com/felixfeng33) – Add default `selectionContainerClass`

## 36.1.0

### Minor Changes

- [`6cced55ed14d02832ceb62e347d399479b358867`](https://github.com/udecode/plate/commit/6cced55ed14d02832ceb62e347d399479b358867) by [@felixfeng33](https://github.com/felixfeng33) – Remove the no longer used option `selectedColor`.

## 36.0.8

### Patch Changes

- [#3366](https://github.com/udecode/plate/pull/3366) by [@zbeyens](https://github.com/zbeyens) – Rename `isBlockSelected` to `isNodeBlockSelected`

## 36.0.0

### Patch Changes

- [#3339](https://github.com/udecode/plate/pull/3339) by [@felixfeng33](https://github.com/felixfeng33) – Replace `addSelectedRow` with `blockSelectionStore` to add to the editor.

## 35.3.0

### Minor Changes

- [#3329](https://github.com/udecode/plate/pull/3329) by [@felixfeng33](https://github.com/felixfeng33) – Custom scrolling element option

## 34.1.0

### Patch Changes

- [#3289](https://github.com/udecode/plate/pull/3289) by [@felixfeng33](https://github.com/felixfeng33) – Fix: can't close menu in production build

## 34.0.0

### Minor Changes

Breaking change: The `selectedColor` option for `BlockSelectable` has been deprecated. Please use `useBlockSelected` to customize the style of each node component.

- [#3241](https://github.com/udecode/plate/pull/3241) by [@felixfeng33](https://github.com/felixfeng33) – Add logic for the `block-context-menu` and improved the user experience for `block-selection`, such as interactions related to keyboard shortcuts, bug fixes.Starting from this version, a single Cmd+A will no longer select the entire document but will select the entire block instead. Double Cmd+A will use the blockSelection plugin to select all blocks. To disable this behavior, pass handlers: { onKeyDown: null }.

## 33.0.0

## 32.0.0

## 31.0.0

## 30.5.3

### Patch Changes

- [`4cbed7159`](https://github.com/udecode/plate/commit/4cbed7159d51f7427051686e45bcf2a8899aeede) by [@zbeyens](https://github.com/zbeyens) – Move `@udecode/plate-common` to peerDeps to fix a bug when multiple instances were installed

## 30.4.5

## 30.1.2

## 30.0.0

## 29.1.0

## 29.0.1

## 29.0.0

## 28.0.0

## 27.0.3

## 27.0.0

### Patch Changes

- [#2763](https://github.com/udecode/plate/pull/2763) by [@12joan](https://github.com/12joan) – Update Zustood imports

## 25.0.1

## 25.0.0

## 24.5.2

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

## 23.6.0

## 23.3.1

## 23.3.0

## 22.0.2

## 22.0.1

## 22.0.0

## 21.5.0

## 21.4.2

## 21.4.1

## 21.3.2

## 21.3.0

## 21.1.5

## 21.1.3

### Patch Changes

- [#2384](https://github.com/udecode/plate/pull/2384) by [@zbeyens](https://github.com/zbeyens) – Fixes #2321

## 21.0.0

## 20.7.2

## 20.7.0

## 20.4.0

## 20.3.2

## 20.0.0

## 19.7.0

## 19.5.0

## 19.4.4

## 19.4.2

## 19.2.0

## 19.1.1

## 19.1.0

## 19.0.5

### Patch Changes

- [#2117](https://github.com/udecode/plate/pull/2117) by [@OliverWales](https://github.com/OliverWales) – Fixes #2117

## 19.0.3

## 19.0.1

## 19.0.0

## 18.15.0

## 18.14.3

### Patch Changes

- [#2090](https://github.com/udecode/plate/pull/2090) by [@OliverWales](https://github.com/OliverWales) – Respect editor read-only state in block selection hooks

## 18.13.0

## 18.9.0

## 18.7.0

## 18.6.0

## 18.5.0

### Minor Changes

- [#1947](https://github.com/udecode/plate/pull/1947) by [@zbeyens](https://github.com/zbeyens) –
  - new dep: `copy-to-clipboard`
  - `blockSelectionStore`
    - new state: `isSelecting` - can be true even with no block selected
    - action `reset` renamed to `resetSelectedIds`
    - new action: `unselect`
  - moved hooks from `BlockSelectionArea` to `useHooksBlockSelection`
  - when block selection is updating, an invisible input element is added to the document to capture the following events:
    - `escape`: unselect
    - `mod+z`: undo
    - `mod+shift+z`: redo
    - `enter`: focus the end of the first selected block
    - `delete`: delete selected blocks
    - `copy`
    - `cut`
    - `paste`
  - we no longer reset block selection on focus but rather on change when the editor selection gets defined
  - new plugin option: `onKeyDownSelecting`

## 18.2.1

### Patch Changes

- [#1928](https://github.com/udecode/plate/pull/1928) by [@zbeyens](https://github.com/zbeyens) – `SelectionArea` props:

  - new prop: `getBoundaries` to customize `boundaries`

- [#1929](https://github.com/udecode/plate/pull/1929) by [@zbeyens](https://github.com/zbeyens) – Types: `BlockStartArea` `placement` and `size` props are now optional

## 18.2.0

## 18.1.1

## 17.0.3

## 17.0.2

## 17.0.1

## 17.0.0

## 16.8.1

### Patch Changes

- [#1862](https://github.com/udecode/plate/pull/1862) by [@zbeyens](https://github.com/zbeyens) – fix: support string ids on selectable blocks

## 16.8.0

### Minor Changes

- [#1856](https://github.com/udecode/plate/pull/1856) by [@zbeyens](https://github.com/zbeyens) – New plugin: Block Selection
