# OSS History And Undo Architecture Research

Question: which portable history, undo, redo, and skipped-edit invariants from
mature editors should Plite promote into tests, docs, or runtime owners?

Scope:
- source-inspected history grouping, redo/undo replay, skipped/non-history
  edits, composition-aware grouping, selection restoration, and collaborative
  rebase paths;
- local sibling repositories only for code-level claims;
- promote only Plite-native proof gaps.

Exclusions:
- no runtime patch copied from other editors;
- no external issue ledger work;
- no release, publish, or PR readiness framing;
- no raw mobile claim.

Current verdict:
- ProseMirror has the strongest portable skipped-edit history signal. Its
  history stack stores maps beside undoable steps because non-history and remote
  changes must remap or erase older undo events.
- Lexical contributes merge-policy signal: composition state and explicit
  history tags decide whether changes merge, push, or are discarded.
- Legacy Plite contributes the baseline adjacent text merge model, but not the
  stronger skipped-edit rebase model.
- Plite already covers native burst selection, cross-root isolation,
  state-patch history, remote text rebase, and local withoutSaving insert
  rebase.
- Missing exact invariant: when a local `withoutSaving` delete overlaps and
  removes a saved text insertion, the saved undo batch must be dropped so undo
  does not resurrect or corrupt skipped content. Promote as a Plite-native
  `plite-history` contract.

Kept promotion target:
- `history:skipped-overlap-delete:drops-obsolete-undo-batch`

Focused proof:

```bash
bun test ./packages/plite-history/test/history-contract.ts --test-name-pattern "drops saved undo batches deleted by local withoutSaving edits"
```

Result: kept. Focused row passed, full `history-contract.ts` passed 49 tests,
related `plite-history` contracts passed 34 tests, `collab-history` runtime
contract passed 11 tests, and `plite-history` typecheck passed.
