# @platejs/basic-styles

## 54.0.0-beta.2

### Major Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Export `TextIndentPluginState` as the complete mutable state contract for `BaseTextIndentPlugin`.

  - Move line-height and alignment mutations to plugin-owned `editor.update.*.set` commands, use `editor.update.nodes.set` and `unset` for text indentation, and expose typed `clear` updates for foreground and background colors
  - Register validated font, alignment, indentation, and line-height properties with schema-owned persisted keys
  - Restrict `textAlign` to `start`, `left`, `center`, `right`, `end`, or `justify`
  - Decode and encode style properties through schema-inferred `codecs: ({ defineCodecs }) => defineCodecs({ 'text/html': ... })` constructor declarations

  **Migration:** Replace `setAlign(editor, value)` with `editor.update.textAlign.set(value)` and `setLineHeight(editor, value)` with `editor.update.lineHeight.set(value)`. Text alignment persists under `textAlign`; configure style targets through `targetPlugins`.

### Patch Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Define Markdown span codecs beside font and color style marks.

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
