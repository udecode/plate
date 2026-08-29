# @platejs/callout

## 54.0.0-beta.2

### Major Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Remove `useCalloutEmojiPicker`. Callout renderers compose `useEmojiPicker` directly with their local popover and node update.

  - Insert callouts through the descriptor's standard `editor.plugin(BaseCalloutPlugin).update.insert(props?, nodeOptions?)` update.
  - Register callout appearance properties and the materialized `💡` icon default in the compiled schema.

### Patch Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Define the callout Markdown codec on the callout plugin and derive its custom MDX tag from the resolved callout schema type. Decode the external Markdown paragraph wrapper without requiring a Plate paragraph plugin. Decode its phrasing children directly so a block-producing paragraph codec cannot be silently unwrapped into invalid callout content.

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

## 51.1.2

### Patch Changes

- [#4732](https://github.com/udecode/plate/pull/4732) by [@zbeyens](https://github.com/zbeyens) – Format code with Biome

## 51.0.0

## 49.0.0

### Major Changes

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –
  - Renamed all `@udecode/plate-*` packages to `@platejs/*`. Replace `@udecode/plate-` with `@platejs/` in your code.

# @udecode/plate-callout

## 48.0.0

## 44.0.0

## 43.0.0

## 42.0.0

## 41.0.0

## 40.0.0

## 39.2.18

### Patch Changes

- [#3685](https://github.com/udecode/plate/pull/3685) by [@felixfeng33](https://github.com/felixfeng33) – Fix set local storage

## 39.2.17

### Patch Changes

- [#3683](https://github.com/udecode/plate/pull/3683) by [@felixfeng33](https://github.com/felixfeng33) – `insertCallout`: Add an icon option; if none is provided, use the last one stored in local storage.

## 39.2.14

### Patch Changes

- [#3673](https://github.com/udecode/plate/pull/3673) by [@felixfeng33](https://github.com/felixfeng33) – Fix set icon.

## 39.2.13

### Patch Changes

- [#3469](https://github.com/udecode/plate/pull/3469) by [@felixfeng33](https://github.com/felixfeng33) –
  - Refactor to `useCalloutEmojiPicker`
  - Remove default variant

## 39.2.0

### Minor Changes

- [#3644](https://github.com/udecode/plate/pull/3644) by [@felixfeng33](https://github.com/felixfeng33) – Add `editor.tf.insert.callout`

## 39.0.0

## 38.0.1

### Patch Changes

- [#3526](https://github.com/udecode/plate/pull/3526) by [@zbeyens](https://github.com/zbeyens) – Prefix base plugin with `Base`

## 38.0.0

## 37.0.0

## 36.0.0

## 34.0.0

### Minor Changes

- [#3241](https://github.com/udecode/plate/pull/3241) by [@felixfeng33](https://github.com/felixfeng33) – Add new plugin `callout`
