# @udecode/plate-utils

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
