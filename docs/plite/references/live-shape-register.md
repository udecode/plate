---
date: 2026-07-20
topic: plite-live-shape-register
---

# Plite Live Shape Register

Committed editor snapshots have no allowed noncanonical shape exceptions.

Primitive steps inside an active transaction may temporarily contain adjacent
compatible text leaves, redundant empty leaves, block descendants in inline
content, or missing default content. These draft shapes are private. Transaction
finalization constructs one canonical change before publication.

Canonical construction merges equal adjacent text, preserves required inline
caret spacers, flattens invalid inline content, and fills compiled schema
defaults. Selection and runtime identity map through the same change.

External direct changes must already satisfy the canonical representation.
`editor.update.value.repair()` is the explicit all-root maintenance boundary
for imported raw data or rules installed after data already exists.

Proof lives in
[`normalization-contract.ts`](/Users/zbeyens/git/plate-2/packages/plite/test/normalization-contract.ts),
[`slice-fit-contract.test.ts`](/Users/zbeyens/git/plate-2/packages/plite/test/slice-fit-contract.test.ts),
and
[`architecture-contract.md`](/Users/zbeyens/git/plate-2/docs/plite/references/architecture-contract.md).
