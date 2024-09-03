# @udecode/plate-utils

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
