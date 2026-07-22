---
"@platejs/plite-history": major
---

- Add validated versioned history serialization and atomic restoration for canonical changes, selection state, and registered effects
- Persist compiled schema identity, reject mismatched snapshots before batch decoding, and reset incompatible branches during atomic schema migration
- Encode exact derived or named schema identities in History JSON format 4 and reject older envelope formats
- Publish immutable lazy-mapped branches with configurable depth
- Store fitted slice replacements as one canonical undo/redo batch
- Rebase saved selections through skipped changes against each batch's source and target documents
- Add typed undo, redo, state-aware batching, history skipping, state reads, and redo-branch disposal
