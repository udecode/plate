---
"@platejs/plite-history": patch
---

- Add validated versioned history serialization and atomic restoration for canonical changes, selection state, and registered effects
- Persist compiled schema identity, reject mismatched snapshots before batch decoding, and reset incompatible branches during atomic schema migration
- Publish immutable lazy-mapped branches with configurable depth
- Store fitted slice replacements as one canonical undo/redo batch
- Rebase saved selections through skipped changes against each batch's source and target documents
