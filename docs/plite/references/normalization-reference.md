---
date: 2026-07-20
topic: plite-normalization-reference
status: active
---

# Normalization Reference

## Canonical publication

Every successful update publishes one canonical document value. Primitive
writes may create temporary draft shapes, but transaction finalization builds
their canonical `DocumentChange` before the commit becomes visible.

Canonical construction:

- merges adjacent text leaves with equal registered properties;
- removes redundant empty leaves while preserving inline caret spacers;
- enforces root and element content defaults from the compiled schema;
- maps selection and node key through the construction change.

An externally supplied `DocumentChange` must already produce canonical editor
representation. Invalid or noncanonical direct changes fail atomically.

## Corrections

Extensions register structural corrections by event. The transaction seeds an
event-indexed worklist from classified changed paths, composes each correction
into the active change, and runs to a deterministic fixed point. Cycle
diagnostics identify the repeated target transition.

There is no per-operation dirty-path loop and no second post-publication
normalization pass.

## Explicit maintenance

`editor.update.value.repair()` runs installed corrections across every document
root in one history-skipped maintenance update. Use it for imported raw data or
rules installed after data already exists. Ordinary editor writes rely on
canonical construction plus the changed-range correction worklist.
