# @platejs/cursor

## 54.0.0-beta.2

### Major Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Keep refresh scheduling and resize observation inside `useCursorOverlayPositions`; remove the standalone `useRequestReRender` and `useRefreshOnResize` hooks. Keep cursor rendering in copied registry UI and remove the package `CursorOverlay` and `CursorOverlayContent` components.

  Accept the minimal Plite DOM and read capabilities used by cursor geometry helpers, including layered Plate editors, instead of requiring or rebuilding a complete `DOMEditor`. Own generic cursor overlay state, positioning, resize refresh, and minimum-width normalization in `@platejs/cursor`.

  **Migration:** Replace `Editor` annotations used with cursor geometry helpers with `DOMEditor` from `@platejs/plite-dom`. Build custom overlays from `useCursorOverlayPositions`.

### Minor Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Export `CursorOverlayPlugin` from `@platejs/cursor` for editor-selection overlays.

### Patch Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Clear stored selection overlays before primary focus enters a nested editable. Refresh visible selection-overlay geometry after document changes without reviving an overlay removed during the deferred refresh.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

## 53.0.0

## 52.3.10

### Patch Changes

- [#4897](https://github.com/udecode/plate/pull/4897) by [@zbeyens](https://github.com/zbeyens) – Fix declaration bundling by restoring the workspace `platejs` build edge during package builds

## 52.0.11

### Patch Changes

- [#4784](https://github.com/udecode/plate/pull/4784) by [@zbeyens](https://github.com/zbeyens) –
  - Fixed "Cannot find module 'react/compiler-runtime'" error for React 18 users

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

## 49.0.0

### Major Changes

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –
  - Renamed all `@udecode/plate-*` packages to `@platejs/*`. Replace `@udecode/plate-` with `@platejs/` in your code.

# @udecode/plate-cursor

## 48.0.0

## 44.0.0

## 43.0.0

## 42.0.0

## 41.0.0

## 40.0.0

### Patch Changes

- [#3744](https://github.com/udecode/plate/pull/3744) by [@zbeyens](https://github.com/zbeyens) – Deprecated, use `@udecode/plate-selection` instead.

## 39.2.11

### Patch Changes

- [#3666](https://github.com/udecode/plate/pull/3666) by [@felixfeng33](https://github.com/felixfeng33) – Fix overlay position when there a fixed height of editor.

## 39.0.0

## 38.0.0

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createCursorPlugin` -> `CursorPlugin`

## 36.0.0

## 34.0.0

## 33.0.2

### Patch Changes

- [#3187](https://github.com/udecode/plate/pull/3187) by [@zbeyens](https://github.com/zbeyens) – Fix types

## 33.0.0

## 32.0.0

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
