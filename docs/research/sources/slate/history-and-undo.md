# Slate: history and undo

## Merge policy

- Legacy Slate's `withHistory` merges consecutive `insert_text` operations at adjacent offsets, and consecutive backward `remove_text` operations, on the same path into one undo batch, and never saves `set_selection`; it has no ProseMirror-style remapping of saved undo batches through edits made outside history. Evidence: `ianstormtaylor/slate@945a484df2497e4c448b33f417b0de2a49840032:packages/slate-history/src/with-history.ts:129-163`. The source calls this 'Legacy Plite', which is rename damage for legacy Slate.

## Lifecycle scopes

- Slate's Editor and HistoryEditor APIs express temporary normalization and history policy through callback scopes. `withoutNormalizing` defers normalization, while History exposes separate merge, new-batch and saving scopes. Source: `docs/plans/2026-07-15-plite-update-lifecycle-api.md:470`, citing https://docs.slatejs.org/api/nodes/editor and https://docs.slatejs.org/libraries/slate-history/history-editor as read on 2026-07-15. This row concerns upstream Slate, not the fork's earlier draft naming. The evidence is unversioned documentation and does not establish a particular runtime implementation or exception-safety result.
