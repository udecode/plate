---
'@udecode/plate-utils': minor
---

New components:
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
  propsHook: useButton
});
```
