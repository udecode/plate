# @udecode/plate-dnd

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
