# @udecode/react-utils

## 46.0.9

### Patch Changes

- [#4171](https://github.com/udecode/plate/pull/4171) by [@12joan](https://github.com/12joan) – Add `useStableFn` hook to produce a stable version of a function that can be used in dependency arrays safely

## 44.0.1

### Patch Changes

- [`e55e3c1`](https://github.com/udecode/plate/commit/e55e3c18fbea917831874fcc7d16006b841defd6) by [@zbeyens](https://github.com/zbeyens) – Support React 19

## 43.0.0

### Minor Changes

- [#4019](https://github.com/udecode/plate/pull/4019) by [@zbeyens](https://github.com/zbeyens) – Upgrade dependencies to latest

## 42.0.0

### Patch Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) –
  - Added a new hook, `useMemoizedSelector`, which re-renders only when the selector’s result changes.

## 40.2.8

### Patch Changes

- [#3816](https://github.com/udecode/plate/pull/3816) by [@zbeyens](https://github.com/zbeyens) – Add useEffectOnce, useMemoOnce

## 39.0.0

### Patch Changes

- [#3597](https://github.com/udecode/plate/pull/3597) by [@zbeyens](https://github.com/zbeyens) – New component: MemoizedChildren

## 38.0.1

### Patch Changes

- [#3526](https://github.com/udecode/plate/pull/3526) by [@zbeyens](https://github.com/zbeyens) –
  - `withRef` support `typescript@5.6.x`
  - Upgrade dependencies

## 37.0.0

## 33.0.0

### Patch Changes

- [#3125](https://github.com/udecode/plate/pull/3125) by [@zbeyens](https://github.com/zbeyens) –
  - Fix `withRef`: Component props should be excluded from extended props.

## 31.0.0

## 29.0.1

### Patch Changes

- [#2841](https://github.com/udecode/plate/pull/2841) by [@zbeyens](https://github.com/zbeyens) – Fix `withRef` component type error in strict mode

## 29.0.0

### Minor Changes

- [#2829](https://github.com/udecode/plate/pull/2829) by [@zbeyens](https://github.com/zbeyens) – New package

  - `PortalBody`, `Text`, `Box`, `createPrimitiveComponent`, `createSlotComponent`, `withProviders` from `@udecode/plate-utils`
  - `createPrimitiveElement`: Creates a component from an element type
