# @udecode/plate-utils

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
