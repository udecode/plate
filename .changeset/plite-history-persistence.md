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
- Expose undo and redo as document-wide `editor.api.history` services with explicit `applied`, `empty`, and authored-conflict results
- Expose `editor.read.history.hasUndo()` and `hasRedo()` for availability, while retaining `editor.read.history()` for full immutable branch inspection
- Keep transaction history controls limited to grouping, skipping, and restoration; replay is rejected from active reads and updates
- Prepare history, authored state, anchors, plugin configuration, and document changes before publishing one coherent commit
