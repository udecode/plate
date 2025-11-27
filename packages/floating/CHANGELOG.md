# @platejs/floating

## 52.0.1

### Patch Changes

- [#4750](https://github.com/udecode/plate/pull/4750) by [@zbeyens](https://github.com/zbeyens) – Add React Compiler support.

## 52.0.0

### Major Changes

- [#4747](https://github.com/udecode/plate/pull/4747) by [@zbeyens](https://github.com/zbeyens) – ESM-only

## 51.1.2

### Patch Changes

- [#4732](https://github.com/udecode/plate/pull/4732) by [@zbeyens](https://github.com/zbeyens) – Format code with Biome

## 51.0.0

## 50.3.2

### Patch Changes

- [#4646](https://github.com/udecode/plate/pull/4646) by [@narraje](https://github.com/narraje) – Fix: Resolve infinite loop in useFloatingToolbar hook (v2)
  Problem: The floating toolbar was causing infinite re-renders under certain conditions, leading to performance issues and potential browser hangs. This occurred when users interacted with text selections while the toolbar was visible.

  WHY the change was made:

  - Infinite re-rendering was caused by the open dependency in the useEffect hook.
  - The open dependency was removed and the setOpen function was called with a functional update to access the previous state.

  HOW a consumer should update their code:

  - No action required. The change is internal and does not affect consumer code.

## 50.2.5

### Patch Changes

- [#4644](https://github.com/udecode/plate/pull/4644) by [@felixfeng33](https://github.com/felixfeng33) – Revert #4629

## 50.2.3

### Patch Changes

- [#4629](https://github.com/udecode/plate/pull/4629) by [@narraje](https://github.com/narraje) – Fix: infinite loop in useFloatingToolbar hook

## 49.0.0

### Major Changes

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –
  - Renamed all `@udecode/plate-*` packages to `@platejs/*`. Replace `@udecode/plate-` with `@platejs/` in your code.

# @udecode/plate-floating

## 48.0.0

## 47.3.1

### Patch Changes

- [#4267](https://github.com/udecode/plate/pull/4267) by [@zbeyens](https://github.com/zbeyens) – Update deps

## 44.0.0

## 43.0.0

### Minor Changes

- [#4019](https://github.com/udecode/plate/pull/4019) by [@zbeyens](https://github.com/zbeyens) – Upgrade dependencies to latest

## 42.0.0

## 41.0.0

## 40.0.0

## 39.1.6

### Patch Changes

- [#3622](https://github.com/udecode/plate/pull/3622) by [@zbeyens](https://github.com/zbeyens) – Add `getDOMSelectionBoundingClientRect`

## 39.1.4

### Patch Changes

- [#3616](https://github.com/udecode/plate/pull/3616) by [@zbeyens](https://github.com/zbeyens) –
  - `getSelectionBoundingClientRect` is now returning the bounding client rect of the editor selection instead of the dom selection. This is more robust for cases like floating toolbar.
  - Update floating toolbar position on value change, in addition to selection change.
  - Return `clickOutsideRef` from `useFloatingToolbar` so it can be used to close the toolbar when clicking outside of it. Use `ignore-click-outside/toolbar` class to ignore clicks outside of the toolbar.

## 39.0.0

## 38.0.1

### Patch Changes

- [#3526](https://github.com/udecode/plate/pull/3526) by [@zbeyens](https://github.com/zbeyens) – Upgrade `@floating-ui/core` and` @floating-ui/react`

## 38.0.0

## 37.0.3

### Patch Changes

- [#3493](https://github.com/udecode/plate/pull/3493) by [@zbeyens](https://github.com/zbeyens) –
  - Fixes #3492
  - Add `state.showWhenReadOnly` prop to show the toolbar when read-only

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - Remove unused generics

## 36.3.8

### Patch Changes

- [#3429](https://github.com/udecode/plate/pull/3429) by [@nklhtv](https://github.com/nklhtv) – export FloatingArrow

## 36.3.2

### Patch Changes

- [#3400](https://github.com/udecode/plate/pull/3400) by [@felixfeng33](https://github.com/felixfeng33) – Add the missing property `hideToolbar`.

## 36.0.0

## 34.1.1

### Patch Changes

- [#3302](https://github.com/udecode/plate/pull/3302) by [@felixfeng33](https://github.com/felixfeng33) – Fix: Floating toolbar can't open when mouse is released outside of editor.

## 34.0.6

### Patch Changes

- [#3270](https://github.com/udecode/plate/pull/3270) by [@felixfeng33](https://github.com/felixfeng33) – fix: floating toolbar is hidden when user select text by keyboard.

## 34.0.1

### Patch Changes

- [#3251](https://github.com/udecode/plate/pull/3251) by [@felixfeng33](https://github.com/felixfeng33) – fix: can't open dropdown menu

## 34.0.0

### Patch Changes

- [#3241](https://github.com/udecode/plate/pull/3241) by [@felixfeng33](https://github.com/felixfeng33) – Fix: only pop up `floating-toolbar` after the selection is complete.

## 33.0.0

## 32.0.0

## 31.0.0

### Minor Changes

- [#3040](https://github.com/udecode/plate/pull/3040) by [@zbeyens](https://github.com/zbeyens) – Updated minor dependencies

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

### Patch Changes

- [#2816](https://github.com/udecode/plate/pull/2816) by [@12joan](https://github.com/12joan) –
  - Replace `useEdtiorState` with `useEditorSelector`

## 27.0.3

## 27.0.0

## 26.0.4

### Patch Changes

- [#2777](https://github.com/udecode/plate/pull/2777) by [@zbeyens](https://github.com/zbeyens) – Vendor: remove radix-ui package

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

## 23.5.0

### Minor Changes

- [#2585](https://github.com/udecode/plate/pull/2585) by [@zbeyens](https://github.com/zbeyens) – `FloatingToolbar`:

  - soft br: `useFloatingToolbar` now returns `{ ref, props, hidden }`
  - feat: `useFloatingToolbarState`

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

## 21.0.0

## 20.7.2

## 20.7.0

## 20.4.0

### Minor Changes

- [#2289](https://github.com/udecode/plate/pull/2289) by [@zbeyens](https://github.com/zbeyens) –
  - updated dep: `"@floating-ui/react-dom-interactions": "^0.6.6"` -> `"@floating-ui/react": "^0.22.0"`
  - new dep: `"@radix-ui/react-dropdown-menu": "^2.0.4"`

## 20.3.2

## 20.3.1

### Patch Changes

- [#2282](https://github.com/udecode/plate/pull/2282) by [@haydencarlson](https://github.com/haydencarlson) – Add popover options prop

## 20.0.0

## 19.7.0

## 19.5.0

## 19.4.4

## 19.4.2

### Patch Changes

- [#2187](https://github.com/udecode/plate/pull/2187) by [@zbeyens](https://github.com/zbeyens) – fix: replace `useEditorState` by `usePlateEditorState` to support nested editors.

## 19.2.0

## 19.1.1

## 19.1.0

## 19.0.3

## 19.0.1

## 19.0.0

## 18.15.0

## 18.13.0

## 18.9.0

## 18.7.0

## 18.6.0

## 18.2.0

## 18.1.1

## 17.0.3

## 17.0.2

## 17.0.1

## 17.0.0

## 16.8.0

## 16.5.0

## 16.3.0

## 16.2.0

## 16.1.0

## 16.0.2

## 16.0.0

### Minor Changes

- [#1721](https://github.com/udecode/plate/pull/1721) by [@zbeyens](https://github.com/zbeyens) –
  - `Popover`: Popover displayed over children, rendering `content`
  - `ElementPopover`: Popover displayed over an element if not read-only, element selected

## 15.0.3

## 15.0.0

### Minor Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –
  - new package replacing `plate-popper`
  - dep:
    - `"@floating-ui/react-dom-interactions": "^0.6.6"`
  - re-exports `@floating-ui/react-dom-interactions`
  - utils:
    - `createVirtualElement`
    - `useVirtualFloating`
    - `getSelectionBoundingClientRect`
