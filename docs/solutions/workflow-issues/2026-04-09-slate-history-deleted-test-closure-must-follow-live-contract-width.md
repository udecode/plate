---
title: Slate history deleted test closure must follow live contract width
type: solution
date: 2026-04-09
status: completed
category: workflow-issues
module: slate-v2
tags:
  - slate
  - slate-v2
  - slate-history
  - deletion-closure
  - proof
  - tests
  - workflow
  - docs
---

# Problem

`packages/slate-history/test/**` had `17` deleted legacy fixtures, but they did
not all mean the same thing anymore.

Some still matched the live `slate-history` contract. Others depended on wider
legacy behavior that the current package no longer claims.

Without classifying that split first, the closure would either:

- resurrect dead behavior just to make the count look smaller
- or close the family with docs that outran the real proof

# Root Cause

The deleted family mixed three different buckets:

1. live history semantics that still belong in the current contract
2. harness residue with no contributor-facing value
3. legacy-width behavior that exceeds the current package claim

The tricky part was that the live package already advertises a narrower history
model:

- one outer transaction is one undo unit
- merge behavior is explicit through helper scopes
- fragment/delete proof is narrower than the old fixture corpus

If you treat the deleted file list as one undifferentiated “restore it all”
queue, you lose that distinction immediately.

# Solution

Close the deleted family against the **live contract**, not the raw legacy file
count.

For `slate-history`, that meant:

1. freeze the deleted inventory first
2. group the deleted files by current claim cluster
3. add direct proof only for the live supported seams
4. mark wider legacy rows as explicit skips instead of pretending they were
   recovered
5. update the roadmap/ledger language in the same turn so the docs match the
   proof

The recovered proof landed in
[history-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate-history/test/history-contract.ts)
and now directly covers:

- `History.isHistory(...)` across edit, undo, and redo lifecycle
- direct `insertText(...)` undo
- reverse block joins and reverse same-text deletes
- same-text delete undo with custom props and inline nodes
- delete-fragment selection restore after deselect/refocus
- `insertBreak()` undo
- current simple block fragment undo

The deleted rows that were wider than the live contract were cut explicitly:

- cross-block custom-prop delete fixture
- cross-inline multi-block delete fixture
- deep nested fragment fixture
- timing-based contiguous/non-contiguous auto-merge heuristics

The closure note for the family lives in
[2026-04-09-slate-v2-slate-history-deleted-test-family-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-slate-history-deleted-test-family-closure.md).

# Why This Works

The closure becomes honest because it follows the same thing the release claim
is supposed to follow: the **current proved surface**.

That avoids two bad failure modes:

- rebuilding dead legacy width just because deleted files existed
- quietly narrowing the contract without saying so

It also keeps parent-package truth clean.

In this batch, `packages/slate-history/test/**` could close, but
`packages/slate-history/**` had to stay open because sibling deleted residue
still exists in:

- `packages/slate-history/src/history.ts`
- `packages/slate-history/CHANGELOG.md`

# Prevention

- For deleted-family closure work, freeze the inventory first and group it by
  live claim cluster before writing any closeout language.
- Recover direct tests only for behavior the current package actually claims.
- If a deleted fixture depends on wider legacy behavior than the current
  package advertises, mark it as an explicit skip and say why.
- Do not let roadmap or ledger docs say a child bucket is open after fresh
  proof closes it.
- Do not let a closed child bucket silently close the parent package when
  sibling deleted residue still exists.
- For `slate-history` specifically, treat these as the live contract anchors:
  - one outer transaction is one undo unit
  - merge semantics are explicit helper decisions, not timing heuristics
  - fragment/delete width must match the current proved core seams
