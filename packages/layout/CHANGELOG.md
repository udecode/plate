# @platejs/layout

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

## 49.2.1

### Patch Changes

- [#4518](https://github.com/udecode/plate/pull/4518) by [@felixfeng33](https://github.com/felixfeng33) – ### AI Streaming Improvements

  **@platejs/ai:**

  - Fixed empty paragraph removal logic in `streamInsertChunk` to only remove true empty paragraphs (no text content)
  - Enhanced streaming support for tables and columns with proper chunk insertion
  - Fixed interface name typo: `SteamInsertChunkOptions` → `StreamInsertChunkOptions`
  - Improved markdown streaming with better handling of incomplete patterns

  **@platejs/layout:**

  - Added streaming support for columns in `withColumn`
  - Fixed column width calculations to handle edge cases

  **@platejs/markdown:**

  - Enhanced column deserialization with proper attribute parsing
  - Added support for column groups in markdown rules
  - Improved attribute parsing in `customMdxDeserialize`

## 49.0.0

### Major Changes

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –

  - Delete backward from a column start will merge into the previous column

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –
  - Renamed all `@udecode/plate-*` packages to `@platejs/*`. Replace `@udecode/plate-` with `@platejs/` in your code.

# @udecode/plate-layout

## 48.0.0

## 44.0.0

## 43.0.0

## 42.1.1

### Patch Changes

- [#3974](https://github.com/udecode/plate/pull/3974) by [@felixfeng33](https://github.com/felixfeng33) – Remove useless html parser.

## 42.0.5

### Patch Changes

- [#3943](https://github.com/udecode/plate/pull/3943) by [@felixfeng33](https://github.com/felixfeng33) – Support deserialization from PlateStatic.

## 42.0.0

## 41.0.2

### Patch Changes

- [#3878](https://github.com/udecode/plate/pull/3878) by [@zbeyens](https://github.com/zbeyens) –

  - Add `setColumns`: set any number of columns of any size to a column group. Decreasing the number of columns will move the removed columns' content to the last remaining column.
  - `toggleColumnGroup`: now uses `setColumns` if we're already in a column group.
  - Remove `layout` prop from `column_group` nodes. We're now only relying on `column` `width` prop. You can unset `layout` prop or just leave it as it is since it's not read anymore.
  - `ColumnPlugin`: Added width normalization ensuring column widths always sum to 100% by automatically adjusting widths when columns are added or removed. If the sum of widths is not 100%, the difference is distributed evenly across all columns.

- [#3878](https://github.com/udecode/plate/pull/3878) by [@zbeyens](https://github.com/zbeyens) – Additional breaking changes to v41:

  - `insertColumnGroup`: rename `layout` to `columns`
  - Remove `setColumnWidth`, `useColumnState`. Use `setColumns` instead

## 41.0.0

### Patch Changes

- [#3830](https://github.com/udecode/plate/pull/3830) by [@felixfeng33](https://github.com/felixfeng33) – Replace `findNodePath` with `findPath`

## 40.0.0

### Major Changes

- [#3744](https://github.com/udecode/plate/pull/3744) by [@zbeyens](https://github.com/zbeyens) –
  - Remove `toggleColumns` in favor of `toggleColumnGroup`
  - Remove `insertEmptyColumn` in favor of `insertColumn`

### Minor Changes

- [#3744](https://github.com/udecode/plate/pull/3744) by [@zbeyens](https://github.com/zbeyens) –
  - `ColumnPlugin`:
    - unwrap columns when there is only one column
    - remove column group when it has no column children
    - remove column when it has no children
  - Add `insertColumnGroup`
  - Add `toggleColumnGroup`

## 39.0.0

## 38.0.1

### Patch Changes

- [#3526](https://github.com/udecode/plate/pull/3526) by [@zbeyens](https://github.com/zbeyens) – Prefix base plugin with `Base`

## 38.0.0

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createColumnPlugin` -> `ColumnPlugin`
  - NEW `ColumnItemPlugin`

## 36.0.0

## 34.0.0

### Minor Changes

- [#3241](https://github.com/udecode/plate/pull/3241) by [@felixfeng33](https://github.com/felixfeng33) – Add `toggleColumns` and fix select all.

## 33.0.2

### Patch Changes

- [#3187](https://github.com/udecode/plate/pull/3187) by [@zbeyens](https://github.com/zbeyens) – Fix types

## 33.0.0

## 32.0.0

## 31.4.2

### Patch Changes

- [#3142](https://github.com/udecode/plate/pull/3142) by [@felixfeng33](https://github.com/felixfeng33) – fix: `normalizeNode`

## 31.4.0

### Minor Changes

- [#3118](https://github.com/udecode/plate/pull/3118) by [@felixfeng33](https://github.com/felixfeng33) – Add `createColumnPlugin`
