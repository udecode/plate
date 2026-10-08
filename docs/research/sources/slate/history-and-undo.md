# Slate: history and undo

## Merge policy

- Legacy Slate's `withHistory` merges consecutive `insert_text` operations at adjacent offsets, and consecutive backward `remove_text` operations, on the same path into one undo batch, and never saves `set_selection`; it has no ProseMirror-style remapping of saved undo batches through edits made outside history. Evidence: `ianstormtaylor/slate@945a484df2497e4c448b33f417b0de2a49840032:packages/slate-history/src/with-history.ts:129-163`. The source calls this 'Legacy Plite', which is rename damage for legacy Slate.
