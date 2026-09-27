---
'plitejs': major
---

- Add validated versioned history serialization and atomic restoration for canonical changes, selection state, and registered effects
- Persist compiled schema identity, reject mismatched snapshots before batch decoding, and reset incompatible branches during atomic schema migration
- Require a non-null derived or named schema identity in memory and in History JSON format 4, and reject older envelope formats
- Publish immutable lazy-mapped branches with configurable depth
- Store fitted slice replacements as one canonical undo/redo batch
- Rebase saved selections through skipped changes against each batch's source and target documents
- Canonicalize text-only inverse batches before mapping skipped text changes so concurrent boundary inserts survive undo and redo
- Restore history selections against the editor view root that owns the batch
- Expose undo and redo as document-wide `editor.api.history` services with explicit `applied`, `empty`, `blocked`, and `busy` results
- Expose `editor.read.history.hasUndo()`, `hasRedo()`, and `pending()` for availability and live-session replay state, while retaining `editor.read.history()` for full immutable branch inspection
- Keep editing and remote collaboration live while an effect-only session replay awaits its external owner, then settle the claimed entry in call order
- Define fallible local replay effects with one `history: { replay }` value
- Dispatch mounted undo and redo through void-returning `useEditorHistory` controls, and report fulfilled outcomes to the initiating `Editable` through `onHistoryReplay`
- Keep transaction history controls limited to grouping, skipping, and restoration; replay is rejected from active reads and updates
- Prepare history, authored state, anchors, plugin configuration, and document changes before publishing one coherent commit
