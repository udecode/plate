---
'@udecode/slate': major
---

`createTEditor`:

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
