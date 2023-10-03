# @udecode/plate-resizable

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
