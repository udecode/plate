# @platejs/dnd

## 52.0.1

### Patch Changes

- [#4750](https://github.com/udecode/plate/pull/4750) by [@zbeyens](https://github.com/zbeyens) – Add React Compiler support.

## 52.0.0

### Major Changes

- [#4747](https://github.com/udecode/plate/pull/4747) by [@zbeyens](https://github.com/zbeyens) – ESM-only

## 51.1.3

### Patch Changes

- [#4735](https://github.com/udecode/plate/pull/4735) by [@zbeyens](https://github.com/zbeyens) – Avoid accessing ref during render

## 51.1.2

### Patch Changes

- [#4732](https://github.com/udecode/plate/pull/4732) by [@zbeyens](https://github.com/zbeyens) – Format code with Biome

## 51.0.0

## 50.3.1

### Patch Changes

- [#4657](https://github.com/udecode/plate/pull/4657) by [@sneridagh](https://github.com/sneridagh) – Fixed support for dnd a node into another editor, it removes now the node from origin editor.

## 49.2.22

### Patch Changes

- [#4603](https://github.com/udecode/plate/pull/4603) by [@delijah](https://github.com/delijah) – Fix: Drop line is not visible when hovering white space inside the editor

## 49.2.20

### Patch Changes

- [#4597](https://github.com/udecode/plate/pull/4597) by [@delijah](https://github.com/delijah) – Hide drop line, whenever drag happens outside the editor

## 49.2.19

### Patch Changes

- [#4595](https://github.com/udecode/plate/pull/4595) by [@delijah](https://github.com/delijah) – Enable dnd between editors

## 49.2.18

### Patch Changes

- [#4592](https://github.com/udecode/plate/pull/4592) by [@delijah](https://github.com/delijah) – Hide drop line when user leaves document or drops (also besides editor)

## 49.2.10

### Patch Changes

- [#4555](https://github.com/udecode/plate/pull/4555) by [@delijah](https://github.com/delijah) – Respect `canDrop` option of `react-dnd`

## 49.2.7

### Patch Changes

- [#4544](https://github.com/udecode/plate/pull/4544) by [@delijah](https://github.com/delijah) – Fix missing target path onDropFiles

## 49.2.2

### Patch Changes

- [#4528](https://github.com/udecode/plate/pull/4528) by [@felixfeng33](https://github.com/felixfeng33) – Fix dnd preview behavior by adding `isAboutToDrag` state for better preview handling

## 49.1.7

### Patch Changes

- [#4481](https://github.com/udecode/plate/pull/4481) by [@felixfeng33](https://github.com/felixfeng33) – Added support for dragging multiple blocks using editor's native selection

  - Multiple blocks can now be dragged using the editor's native selection, not just with block-selection
  - Simplified `useDndNode` hook implementation by removing complex preview logic

## 49.0.8

### Patch Changes

- [#4393](https://github.com/udecode/plate/pull/4393) by [@felixfeng33](https://github.com/felixfeng33) –
  - Fix the drag preview display error.

## 49.0.7

### Patch Changes

- [#4385](https://github.com/udecode/plate/pull/4385) by [@felixfeng33](https://github.com/felixfeng33) –
  - Fixed an issue where drag and drop functionality would not work properly with multiple selected blocks.
  - Added logic to ensure only one drop position exists between any two nodes to prevent visual blinking during drag operations.

## 49.0.0

### Major Changes

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –

  - The following plugins now default to `editOnly: true`. This means their core functionalities (handlers, rendering injections, etc.) will be disabled when the editor is in read-only mode. To override this behavior for a specific plugin, configure its `editOnly` field. For example, `SomePlugin.configure({ editOnly: false })`.

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –
  - Renamed all `@udecode/plate-*` packages to `@platejs/*`. Replace `@udecode/plate-` with `@platejs/` in your code.

# @udecode/plate-dnd

## 48.0.0

## 46.0.6

### Patch Changes

- [#4146](https://github.com/udecode/plate/pull/4146) by [@12joan](https://github.com/12joan) – Fix: `onDropNode` uses a stale `element` object for the dragged node, resulting in incorrect drag operations.

## 44.0.0

## 43.0.1

### Patch Changes

- [#4020](https://github.com/udecode/plate/pull/4020) by [@felixfeng33](https://github.com/felixfeng33) – Fix dnd from file system

## 43.0.0

## 42.2.4

### Patch Changes

- [#4012](https://github.com/udecode/plate/pull/4012) by [@zbeyens](https://github.com/zbeyens) – Fix overrideEditor insertText missing options

## 42.2.3

### Patch Changes

- [#4010](https://github.com/udecode/plate/pull/4010) by [@zbeyens](https://github.com/zbeyens) –
  - `useDndNode`: `onDropHandler` can return `void`

## 42.2.2

### Patch Changes

- [#4000](https://github.com/udecode/plate/pull/4000) by [@12joan](https://github.com/12joan) – Improve performance of drag and drop

## 42.0.0

## 41.0.2

### Patch Changes

- [#3878](https://github.com/udecode/plate/pull/3878) by [@zbeyens](https://github.com/zbeyens) – Additional breaking changes to v41:

  - Remove `useDraggableState`. Use `const { isDragging, previewRef, handleRef } = useDraggable`
  - Remove `useDraggableGutter`. Set `contentEditable={false}` to your gutter element
  - Remove `props` from `useDropLine`. Set `contentEditable={false}` to your drop line element
  - Remove `withDraggable`, `useWithDraggable`. Use [`DraggableAboveNodes`](https://github.com/udecode/plate/pull/3878/files#diff-493c12ebed9c3ef9fd8c3a723909b18ad439a448c0132d2d93e5341ee0888ad2) instead

## 41.0.0

### Major Changes

- [#3861](https://github.com/udecode/plate/pull/3861) by [@zbeyens](https://github.com/zbeyens) –

  - Removed `useDndBlock`, `useDragBlock`, and `useDropBlock` hooks in favor of `useDndNode`, `useDragNode`, and `useDropNode`.
  - Removed `DndProvider` and `useDraggableStore`. Drop line state is now managed by `DndPlugin` as a single state object `dropTarget` containing both `id` and `line`.
  - `useDropNode`: removed `onChangeDropLine` and `dropLine` options

  Migration steps:

  - Remove `DndProvider` from your draggable component (e.g. `draggable.tsx`)
  - Replace `useDraggableStore` with `useEditorPlugin(DndPlugin).useOption`

### Minor Changes

- [#3861](https://github.com/udecode/plate/pull/3861) by [@zbeyens](https://github.com/zbeyens) –
  - `useDndNode` now supports horizontal orientation. New option is `orientation?: 'horizontal' | 'vertical'`. Default is `vertical`.
  - `useDraggableState`, `useDndNode`: add `canDropNode` callback option to query if a dragged node can be dropped onto a hovered node.
  - `useDropLine`:
    - Added `id` option to show dropline only for hovered element. Default is `useElement().id`.
    - Added `orientation` option to filter droplines by orientation (`'horizontal' | 'vertical'`). Default is `vertical`.
    - Returns empty dropline if orientation doesn't match (e.g., horizontal dropline in vertical orientation)
    - Returns empty dropline if elementId doesn't match current hovered element

### Patch Changes

- [#3830](https://github.com/udecode/plate/pull/3830) by [@felixfeng33](https://github.com/felixfeng33) – Replace `findNodePath` with `findPath`

## 40.0.0

### Minor Changes

- [#3744](https://github.com/udecode/plate/pull/3744) by [@zbeyens](https://github.com/zbeyens) –
  - Dragging `dropEffect` is now `move` instead of `copy`
  - Fix drag bug when dragging an element without id

### Patch Changes

- [#3745](https://github.com/udecode/plate/pull/3745) by [@12joan](https://github.com/12joan) – Fix: `useDndNode` calls a state setter during its render function

## 39.3.0

### Patch Changes

- [#3708](https://github.com/udecode/plate/pull/3708) by [@felixfeng33](https://github.com/felixfeng33) – Add `enableFile` option to check whether to enable the DnD plugin for files dragged in from outside the browser.

## 39.0.0

### Major Changes

- [#3597](https://github.com/udecode/plate/pull/3597) by [@zbeyens](https://github.com/zbeyens) – The following changes were made to improve performance:

  - Refactored `useDraggable` hook to focus on core dragging functionality:
    - Removed `dropLine`. Use `useDropLine().dropLine` instead.
    - Removed `groupProps` from the returned object – `isHovered`, and `setIsHovered` from the returned state. Use CSS instead.
    - Removed `droplineProps`, and `gutterLeftProps` from the returned object. Use `useDropLine().props`, `useDraggableGutter().props` instead.

### Minor Changes

- [#3597](https://github.com/udecode/plate/pull/3597) by [@zbeyens](https://github.com/zbeyens) –
  - New hooks:
    - `useDraggableGutter`: Returns props for the draggable gutter.
    - `useDropLine`: Returns the current drop line state and props.
  - Added `DraggableProvider` and `useDraggableStore` for managing draggable state:
    - `dropLine`: The direction of the drop line.

## 38.0.0

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createDndPlugin` -> `DndPlugin`
  - Remove `editor.isDragging`, use `editor.getOptions(DndPlugin).isDragging` instead
  - Move `dndStore` to `DndPlugin`

## 36.0.8

### Patch Changes

- [#3366](https://github.com/udecode/plate/pull/3366) by [@zbeyens](https://github.com/zbeyens) – Remove `getNodesRange`, import it from `@udecode/plate-common` instead

## 36.0.0

## 34.0.0

### Minor Changes

- [#3241](https://github.com/udecode/plate/pull/3241) by [@felixfeng33](https://github.com/felixfeng33) – Add selection after dragging ends.

## 33.0.0

## 32.0.0

## 31.2.1

### Patch Changes

- [#3078](https://github.com/udecode/plate/pull/3078) by [@zbeyens](https://github.com/zbeyens) – Fix `handleRef` type

## 31.0.0

## 30.5.3

### Patch Changes

- [`4cbed7159`](https://github.com/udecode/plate/commit/4cbed7159d51f7427051686e45bcf2a8899aeede) by [@zbeyens](https://github.com/zbeyens) – Move `@udecode/plate-common` to peerDeps to fix a bug when multiple instances were installed

## 30.5.2

### Patch Changes

- [#2961](https://github.com/udecode/plate/pull/2961) by [@zbeyens](https://github.com/zbeyens) – Move `@udecode/plate-common` to peerDeps to fix a bug when multiple instances were installed

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

### Patch Changes

- [#2708](https://github.com/udecode/plate/pull/2708) by [@12joan](https://github.com/12joan) – Reduce performance overhead of draggable component

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

### Major Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – Removed:
  - `Draggable`
  - `DraggableBlock`
  - `DraggableBlockToolbar`
  - `DraggableBlockToolbarWrapper`
  - `DraggableDropline`
  - `DraggableGutterLeftProps`
  - `DraggableRoot`
  - `DragHandle`

## 21.5.0

## 21.4.2

## 21.4.1

## 21.3.2

## 21.3.0

## 21.1.5

## 21.1.1

### Patch Changes

- [#2357](https://github.com/udecode/plate/pull/2357) by [@zbeyens](https://github.com/zbeyens) – fix: add delay to DnD scroller

## 21.0.0

## 20.7.2

## 20.7.0

## 20.6.4

### Patch Changes

- [#2328](https://github.com/udecode/plate/pull/2328) by [@reinvanimschoot](https://github.com/reinvanimschoot) –
  - add an **optional** `onDropHandler` to the `draggableProps` property. This handler takes the same arguments as the `drop`function in the `useDropNode` hook and should return `boolean`.If the function returns `true`, the default onDropNode behavior will not be called since it would be considered handled. If the function returns `false`, the default onDropNode will be triggered.
  - add an `editorId` property to the `dragItem` property so there is always a reference to the editor from which the item was dragged. This allows for better support and more control when working with nested editors.

## 20.4.0

## 20.3.2

## 20.0.0

### Minor Changes

- [#2237](https://github.com/udecode/plate/pull/2237) by [@TomMorane](https://github.com/TomMorane) – New package extracting unstyled logic from `@udecode/plate-ui-dnd`
