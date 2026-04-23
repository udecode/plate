---
date: 2026-04-18
topic: slate-v2-slate-batch-engine
status: active
---

# Slate Batch Engine Reference

## Purpose

Keep the current batch-engine context available without letting it quietly own
the live queue.

## Rule

This is a reference doc, not a remaining-work owner.

Use it when you need:

- current batch-engine shape
- historical retrofit context
- why exact-path and mixed-op batching matter

Do **not** use it to override:

- merged contract corpus decisions
- roadmap order
- readiness truth

## Current Read

- batching remains relevant only as historical context and compatibility
  pressure
- exact-path and mixed-op behavior still matter as migration evidence
- this doc does **not** define the active `packages/slate` direction anymore
- the active direction is the native transaction/store-first redesign in
  [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)

## Why It Still Exists

Because the redesign still cares about:

- transaction semantics
- batch behavior correctness
- performance under mixed operations

But those are now subordinate to:

- the live transaction-first redesign target
- proof ownership
- live control docs
