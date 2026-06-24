# History And Undo Shard

Sources sampled:
- ProseMirror history source and test suite.
- Lexical history source.
- Legacy Plite history source.
- Plite history extension and current history contracts.

Top lead:
- ProseMirror covers the case where a skipped/non-history delete overlaps a
  saved edit. The important invariant is not "undo should restore old state";
  it is stricter: skipped edits stay authoritative, and obsolete saved undo
  batches are remapped or dropped.

Coverage map:
- Plite already covers simple local `withoutSaving` text rebase, non-main
  split rebase, cross-root merge isolation, composition merge/cancel, native
  burst selection, state-patch history, remote text rebase, and selected
  replacement with collab metadata.
- Missing exact row: skipped local delete covering a saved insertion. That row
  should drop the saved undo batch and make undo a no-op for the deleted text.

Promoted proof:
- Add `drops saved undo batches deleted by local withoutSaving edits` to
  `packages/plite-history/test/history-contract.ts`.

Result:
- Kept. Focused overlap-delete row passed; full history contract, related
  history contracts, collab-history runtime contract, and `plite-history`
  typecheck passed.
