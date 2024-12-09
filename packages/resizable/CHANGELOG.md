# @udecode/plate-resizable

## 40.0.0

## 39.1.6

### Patch Changes

- [#3622](https://github.com/udecode/plate/pull/3622) by [@zbeyens](https://github.com/zbeyens) – Hide ResizeHandle when read-only

## 39.0.0

## 38.0.0

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - Peer dependencies updated

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

## 30.4.5

## 30.1.2

## 30.0.0

## 29.1.0

## 29.0.1

## 29.0.0

## 28.0.0

### Patch Changes

- [#2816](https://github.com/udecode/plate/pull/2816) by [@12joan](https://github.com/12joan) –
  - Remove `{ fn: ... }` workaround for jotai stores that contain functions

## 27.0.3

## 27.0.0

### Major Changes

- [#2763](https://github.com/udecode/plate/pull/2763) by [@12joan](https://github.com/12joan) –
  - Migrate store to jotai@2
  - Resizable components must now be wrapped inside a `ResizableProvider`

## 26.0.5

### Patch Changes

- [#2781](https://github.com/udecode/plate/pull/2781) by [@dimaanj](https://github.com/dimaanj) – Add initial size for resize handle

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

## 23.1.0

### Patch Changes

- [#2555](https://github.com/udecode/plate/pull/2555) by [@zbeyens](https://github.com/zbeyens) – Major changes missing from 23.0.0:
  - `ResizeHandleOptions`: removed `style`, `width`, `startMargin`, `endMargin`, `zIndex`.

## 23.0.0

### Major Changes

- [#2541](https://github.com/udecode/plate/pull/2541) by [@zbeyens](https://github.com/zbeyens) –
  - Package renamed to `@udecode/plate-resizable`.
  - `ResizeHandle` is now fully headless: no style is applied by default. Add your own `Resizable`, `ResizeHandle` components:
    - `npx @udecode/plate-ui@latest add resizable`

## 22.0.2

## 22.0.1

## 22.0.0

## 20.5.3

## 20.5.2

## 20.5.1

## 20.5.0

### Minor Changes

- [#2425](https://github.com/udecode/plate/pull/2425) by [@Nmarinsiruela](https://github.com/Nmarinsiruela) – Added touch events to Resizable

  We were lacking touch-related events on `ResizeHandle.tsx`. That made it so that mobile users will not be able to resize an element.
  With the addition of the functions, this functionality should be available as it was prior to the latest major bump.
  Additionally, we were missing the 'resizable' alias in 'aliases-plate', which made the local development quite complex.

## 20.4.7

## 20.4.6

## 20.4.5

## 20.4.4

## 20.4.3

## 20.4.2

## 20.4.1

### Patch Changes

- [#2324](https://github.com/udecode/plate/pull/2324) by [@dylans](https://github.com/dylans) – Add missing peer dependencies to `@udecode/resizable`
