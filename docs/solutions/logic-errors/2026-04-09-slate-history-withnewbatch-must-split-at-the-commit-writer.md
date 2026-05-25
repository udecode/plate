---
title: Slate history withNewBatch must split at the commit writer
type: solution
date: 2026-04-09
status: completed
category: logic-errors
module: slate-v2
tags:
  - slate
  - slate-v2
  - slate-history
  - history
  - undo
  - batching
  - withNewBatch
  - writeHistory
  - commit
---

# Problem

`slate-history` claimed `HistoryEditor.withNewBatch(...)`,
`HistoryEditor.withoutMerging(...)`, and `editor.writeHistory(...)`, but the
live v2 source only had `withMerging(...)` and `withoutSaving(...)`.

That left two real problems:

- the public docs were ahead of the actual package surface
- the history writer had no override seam, so `writeHistory(...)` was cosmetic

# Root Cause

The v2 history package moved from legacy per-op wrapping to snapshot-based
commit subscribers.

That architecture shift was fine, but the helper recovery stopped halfway:

- the merge/save flags survived
- the split-once flag did not
- new history batches were still pushed directly into `history.undos` and
  `history.redos`

So the old helper names were missing, and the one instance seam serious callers
actually need never ran.

# Solution

Restore the helper surface in the shape the current engine can honestly support:

- add `SPLITTING_ONCE`
- restore `HistoryEditor.withNewBatch(...)`
- restore `HistoryEditor.withoutMerging(...)`
- restore `editor.writeHistory(stack, batch)`

Then apply the split-once rule at the commit-subscriber writer, not before it.

In `with-history.ts`, the correct flow is:

1. derive `save` and `merge` for the committed snapshot
2. if `SPLITTING_ONCE` is set, force `merge = false` for that commit only
3. clear `SPLITTING_ONCE`
4. write the fresh batch through `editor.writeHistory(...)`
5. let later commits inside the same `withNewBatch(...)` scope merge normally

# Why This Works

`withNewBatch(...)` is not “never merge inside this callback”.

It is:

- split from the previous saved batch once
- then merge normally for the rest of the scope

On a snapshot/commit model, that decision only makes sense at the place where a
commit is actually written to history.

Anything earlier is guessing.

Routing all push-style writes through `editor.writeHistory(...)` also makes the
public instance seam real again, so downstream packages can intercept undo/redo
batch writes without forking the history plugin.

# Prevention

- If a legacy helper is about history batching, recover it at the history write
  boundary, not at an arbitrary op-prep layer.
- Do not document `writeHistory(...)` unless commit-time writes actually route
  through it.
- For snapshot-based history, treat “split once” as a commit-writer concern.
- Keep one contract test for each helper family:
  - `withNewBatch(...)` splits once, then merges the rest of the scope
  - `withoutMerging(...)` forces a fresh batch
  - `writeHistory(...)` is the real stack-write seam
