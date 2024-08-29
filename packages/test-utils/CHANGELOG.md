# @udecode/plate-test-utils

## 37.0.0

### Patch Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) – Refactor

## 36.5.5

### Patch Changes

- [#3451](https://github.com/udecode/plate/pull/3451) by [@felixfeng33](https://github.com/felixfeng33) – Add equation jsx tag.

## 36.5.4

### Patch Changes

- [#3448](https://github.com/udecode/plate/pull/3448) by [@felixfeng33](https://github.com/felixfeng33) – Add callout and toc jsx tag.

## 36.5.0

### Patch Changes

- [#3436](https://github.com/udecode/plate/pull/3436) by [@felixfeng33](https://github.com/felixfeng33) – Add date plugin

## 30.5.3

### Patch Changes

- [`4cbed7159`](https://github.com/udecode/plate/commit/4cbed7159d51f7427051686e45bcf2a8899aeede) by [@zbeyens](https://github.com/zbeyens) – Move `@udecode/plate-common` to peerDeps to fix a bug when multiple instances were installed

## 24.3.2

### Patch Changes

- [`3f17d0bb`](https://github.com/udecode/plate/commit/3f17d0bbcd9e31437d1f1325c8458cac2db0e3da) by [@zbeyens](https://github.com/zbeyens) – fix build

## 24.3.1

### Patch Changes

- [#2659](https://github.com/udecode/plate/pull/2659) by [@zbeyens](https://github.com/zbeyens) – fix build (types)

## 24.3.0

### Minor Changes

- [#2652](https://github.com/udecode/plate/pull/2652) by [@shahriar-shojib](https://github.com/shahriar-shojib) – Building tool: from rollup to tsup

## 23.7.5

### Patch Changes

- [#2624](https://github.com/udecode/plate/pull/2624) by [@OliverWales](https://github.com/OliverWales) – Add jsx element for nli element

## 13.4.0

### Minor Changes

- [#1615](https://github.com/udecode/plate/pull/1615) by [@nemanja-tosic](https://github.com/nemanja-tosic) – Add support for pasting into mentions

### Patch Changes

- [#1619](https://github.com/udecode/plate/pull/1619) by [@nemanja-tosic](https://github.com/nemanja-tosic) – Merge lines, strip whitespaces

## 10.1.0

### Minor Changes

- [#1381](https://github.com/udecode/plate/pull/1381) by [@zbeyens](https://github.com/zbeyens) –
  - `jsx` now supports [slate-test-utils](https://github.com/mwood23/slate-test-utils)
  - exports `hjsx` for non-testing use-cases
  - better typing

## 3.2.0

### Minor Changes

- [#995](https://github.com/udecode/plate/pull/995) [`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4) Thanks [@dylans](https://github.com/dylans)! - update slate dependencies and peerDependencies to 0.66.\*

### Patch Changes

- [#995](https://github.com/udecode/plate/pull/995) [`5eb42cdd`](https://github.com/udecode/plate/commit/5eb42cdd47db4fd41936420b86b0bf7df9a8aa09) Thanks [@dylans](https://github.com/dylans)! - update to slate 0.66.x

## 1.0.0

### Major Changes

🎉 The **Slate Plugins** project has evolved to **Plate** 🎉

To migrate, install `@udecode/plate[-x]` then find and replace all
occurrences of:

- `slate-plugins` to `plate`
- `SlatePlugins` to `Plate`
- `SlatePlugin` to `PlatePlugin`
