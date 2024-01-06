# @udecode/plate-dnd

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
