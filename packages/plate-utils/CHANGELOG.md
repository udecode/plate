# @udecode/plate-utils

## 46.0.9

## 46.0.4

## 46.0.2

## 45.0.9

## 45.0.8

## 45.0.7

## 45.0.6

## 45.0.5

## 45.0.2

### Patch Changes

- [#4090](https://github.com/udecode/plate/pull/4090) by [@zbeyens](https://github.com/zbeyens) – Add `belowRootNodes` render option to render content below root element but above children. Similar to `belowNodes` but renders directly in the element rather than wrapping. This is used in `PlateElement` to render the `BlockSelection` component below the root element.

## 45.0.1

## 44.0.7

## 44.0.1

## 44.0.0

## 43.0.5

## 43.0.4

## 43.0.2

## 43.0.0

## 42.2.5

## 42.2.2

## 42.1.2

## 42.1.1

## 42.0.6

## 42.0.5

## 42.0.4

## 42.0.3

## 42.0.1

## 42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) –
  - Removed unused `moveSelectionByOffset`, `getLastBlockDOMNode`, `useLastBlock`, `useLastBlockDOMNode`

## 41.0.13

### Patch Changes

- [#3932](https://github.com/udecode/plate/pull/3932) by [@felixfeng33](https://github.com/felixfeng33) – Each `PlateElement` and `SlateElement` comes with a default `position: relative` style.
  Remove `relative` className from all components

## 41.0.5

## 41.0.2

## 41.0.0

### Patch Changes

- [#3830](https://github.com/udecode/plate/pull/3830) by [@felixfeng33](https://github.com/felixfeng33) – Replace `findNodePath` with `findPath`

## 40.3.1

## 40.2.8

## 40.2.7

### Patch Changes

- [#3809](https://github.com/udecode/plate/pull/3809) by [@zbeyens](https://github.com/zbeyens) –
  - Add `useEditorString`: Subscribes to the editor string on each change

## 40.0.3

## 40.0.2

## 40.0.1

## 40.0.0

### Minor Changes

- [#3744](https://github.com/udecode/plate/pull/3744) by [@zbeyens](https://github.com/zbeyens) –
  - `PlateElement` add `data-block-id` if `element.id` is defined, after editor mount to support SSR hydration.

## 39.2.21

## 39.2.20

## 39.2.15

## 39.2.13

## 39.2.12

## 39.2.1

## 39.1.8

### Patch Changes

- [#3626](https://github.com/udecode/plate/pull/3626) by [@zbeyens](https://github.com/zbeyens) – Add selectSiblingNodePoint

## 39.1.4

### Patch Changes

- [#3616](https://github.com/udecode/plate/pull/3616) by [@zbeyens](https://github.com/zbeyens) –
  - Update `useMarkToolbarButton().props.onClick`: focus editor after toggle mark
  - Add `useSelectionCollapsed`, `useSelectionExpanded`, `useSelectionWithinBlock`, `useSelectionAcrossBlocks`
  - Add `useSelectionFragment`, `useSelectionFragmentProp`

## 39.1.3

## 39.0.0

## 38.0.6

## 38.0.4

## 38.0.3

### Patch Changes

- [#3536](https://github.com/udecode/plate/pull/3536) by [@yf-yang](https://github.com/yf-yang) – Suppress all placeholders when element is composing

## 38.0.2

## 38.0.1

### Patch Changes

- [#3526](https://github.com/udecode/plate/pull/3526) by [@zbeyens](https://github.com/zbeyens) – Upgrade `clsx`

## 38.0.0

## 37.0.8

## 37.0.7

## 37.0.5

### Patch Changes

- [#3500](https://github.com/udecode/plate/pull/3500) by [@yf-yang](https://github.com/yf-yang) – Hide placeholder during composition

## 37.0.4

## 37.0.3

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - Remove `onKeyDownToggleElement`, use shortcuts instead.
  - Remove `onKeyDownToggleMark`, use shortcuts instead.

## 36.3.9

## 36.3.7

## 36.3.4

## 36.2.1

## 36.0.6

## 36.0.3

## 36.0.0

### Minor Changes

- [#3339](https://github.com/udecode/plate/pull/3339) by [@felixfeng33](https://github.com/felixfeng33) – Add `blockSelectedIds`,`hasBlockSelected`,`isBlockSelected` utils.

## 35.3.2

### Patch Changes

- [#3333](https://github.com/udecode/plate/pull/3333) by [@yf-yang](https://github.com/yf-yang) – fix: omit plate properties from createNodeHOC props

## 34.0.5

### Patch Changes

- [`1b6917cb95947779d161db2302078280245c91b3`](https://github.com/udecode/plate/commit/1b6917cb95947779d161db2302078280245c91b3) by [@felixfeng33](https://github.com/felixfeng33) – Check if the user has installed selection plugin for `addSelectedRow`.

## 34.0.4

## 34.0.2

### Patch Changes

- [#3133](https://github.com/udecode/plate/pull/3133) by [@PaulSinghDev](https://github.com/PaulSinghDev) – `useFormInputProps`: Generic form input props inside an editor

## 34.0.1

## 34.0.0

### Minor Changes

- [#3241](https://github.com/udecode/plate/pull/3241) by [@felixfeng33](https://github.com/felixfeng33) – Add `addSelectedRow` which depends on `blockSelection` plugin

## 33.0.4

### Patch Changes

- [#3199](https://github.com/udecode/plate/pull/3199) by [@zbeyens](https://github.com/zbeyens) – Fix `PlateElementProps` type

## 33.0.3

## 33.0.0

## 32.0.1

## 32.0.0

### Minor Changes

- [#3155](https://github.com/udecode/plate/pull/3155) by [@felixfeng33](https://github.com/felixfeng33) – Move `moveSelectionByOffset` from `@udecode/plate-mention` to `@udecode/plate-utils`

## 31.3.2

## 31.0.0

## 30.4.5

## 30.1.2

## 30.0.0

## 29.1.0

## 29.0.1

## 29.0.0

### Major Changes

- [#2829](https://github.com/udecode/plate/pull/2829) by [@zbeyens](https://github.com/zbeyens) –
  - Moved `withProps` to `@udecode/cn`
  - Moved `PortalBody`, `Text`, `Box`, `createPrimitiveComponent`, `createSlotComponent`, `withProviders` to `@udecode/react-utils`
  - Removed `getRootProps` (unused)

## 28.0.0

### Patch Changes

- [#2816](https://github.com/udecode/plate/pull/2816) by [@12joan](https://github.com/12joan) –
  - Replace `useEdtiorState` with `useEditorSelector`

## 27.0.3

## 27.0.0

## 25.0.1

## 25.0.0

## 24.5.2

### Patch Changes

- [#2708](https://github.com/udecode/plate/pull/2708) by [@12joan](https://github.com/12joan) – Do not re-render placeholder on every editor change

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

### Minor Changes

- [#2593](https://github.com/udecode/plate/pull/2593) by [@zbeyens](https://github.com/zbeyens) –
  - New prop in `createPrimitiveComponent`: `setProps` where the first parameter is the props returned by the "props hook". Returned attributes are passed to the component. You can use this prop to merge or override all props.
  - Plate components `className` and `style` props are now merged with the "props hook" ones if defined. To override instead of merging, use `setProps`.

## 23.6.0

## 23.3.1

## 23.3.0

## 22.0.2

## 22.0.1

## 22.0.0

### Major Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – Upgraded peer dependencies:
  - `slate-react: >=0.95.0`
    Removed:
  - `useElementPrpos`
  - `useWrapElement`
  - `createComponentAs`
  - `createElementAs`

### Minor Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – New components:
  - `PlateElement`: Headless element component
  - `PlateLeaf`: Headless leaf component
  - `Box`: Slot div component
  - `Text`: Slot text component
  - `PortalBody`
    New hooks:
  - `useMarkToolbarButton`
  - `usePlaceholder`
  - `useRemoveNodeButton`
    New functions:
  - `getRootProps`
  - `createSlotComponent`: Merges its props onto its immediate child. https://www.radix-ui.com/docs/primitives/utilities/slot
  - `createPrimitiveComponent`: Primitive component factory used by most Plate components. It uses hooks for managing state and props, and forwards references to child components.
    Component props:
  - `asChild`: If true, the component will be rendered as a `Slot` {@link https://www.radix-ui.com/docs/primitives/utilities/slot}.
  - `options`: Options passed to the state hook.
  - `state`: Provide your state instead of using the state hook.
  - `...props`: Props to be passed to the component.
    Props hook return value:
  - `ref`: Reference to be forwarded to the component.
  - `props`: Props to be passed to the component.
  - `hidden`: If true, the component will not be rendered.
    Example:
  ```tsx
  const MyButton = createPrimitiveComponent(Button)({
    stateHook: useButtonState,
    propsHook: useButton,
  });
  ```

## 21.5.0

## 21.4.2

## 21.4.1

## 21.3.2

## 21.3.0

## 21.1.5

## 21.0.0

## 20.7.2

## 20.7.0

## 20.4.0

## 20.3.2

### Patch Changes

- [#2285](https://github.com/udecode/plate/pull/2285) by [@12joan](https://github.com/12joan) – Ignore `defaultPrevented` keydown events

## 20.0.0
