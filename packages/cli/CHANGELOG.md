# @udecode/plate-ui

## 30.1.0

### Minor Changes

- [#2877](https://github.com/udecode/plate/pull/2877) by [@zbeyens](https://github.com/zbeyens) –
  - add support for `plate-components.json` to avoid conflict with shadcn's `components.json`. If `plate-components.json` does not exist, `components.json` will be used.
  - add support for custom ui dir in `components.json`: use `aliases > plate-ui`.

## 29.0.0

### Minor Changes

- [#2829](https://github.com/udecode/plate/pull/2829) by [@zbeyens](https://github.com/zbeyens) –
  - Remove `utils` aliases: `@udecode/cn` dependency is now used
  - Remove `clsx` dependency

## 28.1.0

### Minor Changes

- [#2824](https://github.com/udecode/plate/pull/2824) by [@zbeyens](https://github.com/zbeyens) –
  - add support for custom tailwind prefix
  - minify build

## 24.1.1

### Patch Changes

- [`7b13d52a`](https://github.com/udecode/plate/commit/7b13d52a1de3639098eb19bbb2e2cba26659b988) by [@zbeyens](https://github.com/zbeyens) –
  - Fixes #2641

## 24.1.0

### Minor Changes

- [#2642](https://github.com/udecode/plate/pull/2642) by [@zbeyens](https://github.com/zbeyens) –
  - Add command `-a` for adding all available components

## 22.0.3

### Patch Changes

- [#2499](https://github.com/udecode/plate/pull/2499) by [@zbeyens](https://github.com/zbeyens) – use single quote instead of double quote

## 22.0.0

### Major Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – This package is now a CLI to generate components. Install it as a dev dependency. See https://platejs.org/docs/components/cli.
