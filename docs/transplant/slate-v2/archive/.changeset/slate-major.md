---
"slate": major
---

Replace the mutable editor and `Transforms` surface with the Slate v2 runtime API.

**Migration:**

- Create editors with `createEditor({ initialValue })`.
- Read editor state through `editor.read(...)`.
- Mutate document, selection, marks, roots, state fields, and operations through `editor.update((tx) => ...)`.
- Replace `Transforms.*` calls and direct editor mutation with transaction groups such as `tx.nodes`, `tx.selection`, `tx.text`, `tx.value`, and `tx.roots`; write persistent state fields with `tx.setField(...)` and replay remote state changes with `tx.statePatches.replay(...)`.
- Replace helper value namespaces with `ElementApi`, `LocationApi`, `NodeApi`, `OperationApi`, `PathApi`, `PointApi`, `RangeApi`, `SpanApi`, and `TextApi`; keep model names such as `Element`, `Node`, `Range`, and `Text` as types.
- Move editor-root normalizers to `normalizers.editor`; keep non-root node normalizers in `normalizers.node`.
- Import through the package root export; `slate/internal` is the only supported internal subpath.
