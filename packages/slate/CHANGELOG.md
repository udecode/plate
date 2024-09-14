# @udecode/slate

## 38.0.4

### Patch Changes

- [#3537](https://github.com/udecode/plate/pull/3537) by [@felixfeng33](https://github.com/felixfeng33) – Missing export

## 38.0.3

### Patch Changes

- [#3534](https://github.com/udecode/plate/pull/3534) by [@felixfeng33](https://github.com/felixfeng33) – Sync slate add `withMerging`

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) – `createTEditor`:

  - Implement default methods for `slate-react` and `slate-history` in `createTEditor`
  - Add `noop` function to provide default implementations for unimplemented editor methods

  Types:

  - Merge `ReactEditor` and `HistoryEditor` interfaces into `TEditor`, removing `TReactEditor` and `THistoryEditor`
  - Remove `Value` generic type parameter from function signatures and type definitions
  - Replace `V extends Value` with `E extends TEditor` for improved type inference
  - Simplify `TEditor<V>` to `TEditor` in many places
  - Refactor element-related types, where `E extends TEditor` in all cases:
    - `EElement<V>` to `ElementOf<E>`
    - `EText<V>` to `TextOf<E>`
    - `ENode<V>` to `NodeOf<E>`
    - `EDescendant<V>` to `DescendantOf<E>`
    - `EAncestor<V>` to `AncestorOf<E>`
    - `EElementOrText<V>` to `ElementOrTextOf<E>`
  - Update `TNodeEntry` related types:
    - `ENodeEntry<V>` to `NodeEntryOf<E>`
    - `EElementEntry<V>` to `ElementEntryOf<E>`
    - `ETextEntry<V>` to `TextEntryOf<E>`
    - `EAncestorEntry<V>` to `AncestorEntryOf<E>`
    - `EDescendantEntry<V>` to `DescendantEntryOf<E>`
  - Remove unused types:
    - `EElementEntry<V>`
    - `ETextEntry<V>`
    - `EDescendantEntry<V>`

## 36.0.6

### Patch Changes

- [#3354](https://github.com/udecode/plate/pull/3354) by [@yf-yang](https://github.com/yf-yang) – feat: add option parameter to normalizeNode following slate#5295

## 32.0.1

### Patch Changes

- [#3164](https://github.com/udecode/plate/pull/3164) by [@felixfeng33](https://github.com/felixfeng33) – Add writeHistory

## 31.0.0

## 25.0.0

### Minor Changes

- [#2719](https://github.com/udecode/plate/pull/2719) by [@12joan](https://github.com/12joan) – Add `removeEmpty: boolean | QueryNodeOptions` option to insertNodes

## 24.3.6

### Patch Changes

- [#2671](https://github.com/udecode/plate/pull/2671) by [@zbeyens](https://github.com/zbeyens) – Fix lodash import

## 24.3.5

### Patch Changes

- [#2669](https://github.com/udecode/plate/pull/2669) by [@zbeyens](https://github.com/zbeyens) – Replace lodash by lodash-es

## 24.3.2

### Patch Changes

- [`3f17d0bb`](https://github.com/udecode/plate/commit/3f17d0bbcd9e31437d1f1325c8458cac2db0e3da) by [@zbeyens](https://github.com/zbeyens) – fix build

## 24.3.1

### Patch Changes

- [#2659](https://github.com/udecode/plate/pull/2659) by [@zbeyens](https://github.com/zbeyens) – fix build (types)

## 24.3.0

## 23.7.4

### Patch Changes

- [#2622](https://github.com/udecode/plate/pull/2622) by [@12joan](https://github.com/12joan) – Ensure the return type of `unhangRange` matches the argument type

## 22.0.2

### Patch Changes

- [`f44dbd3`](https://github.com/udecode/plate/commit/f44dbd3f322a828753da31ec28576587e63ea047) by [@zbeyens](https://github.com/zbeyens) – v22

## 21.4.1

## 21.3.0

### Minor Changes

- [#2410](https://github.com/udecode/plate/pull/2410) by [@zbeyens](https://github.com/zbeyens) –
  - ✨ `addRangeMarks`: Add marks to each node of a range.
  - ✨ `unhangCharacterRange`: Unhang the range of length 1 so both edges are in the same text node.

## 21.0.0

### Major Changes

- [#2369](https://github.com/udecode/plate/pull/2369) by [@zbeyens](https://github.com/zbeyens) – Support `slate@0.94.0`, `slate-react@0.94.0` and `slate-history@0.93.0` by upgrading the peer dependencies.

## 19.8.0

### Minor Changes

- [#2289](https://github.com/udecode/plate/pull/2289) by [@zbeyens](https://github.com/zbeyens) –
  - `getNodeEntry`: now returns `undefined` instead of throwing if not found.
