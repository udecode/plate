---
date: 2026-04-09
topic: slate-v2-ref-docs-truth-pass
status: completed
---

# Slate v2 Ref Docs Truth Pass

## Goal

Stop the ref API docs from overclaiming legacy static transform helpers that the
current runtime-id/range-backed ref model does not actually expose.

## Completed

- removed the fake static-method sections from:
  - `path-ref.md`
  - `point-ref.md`
  - `range-ref.md`
- made the current contract explicit:
  - refs are created through `Editor.pathRef(...)`
  - refs are created through `Editor.pointRef(...)`
  - refs are created through `Editor.rangeRef(...)`
  - the editor owns ref updates
  - `unref()` is the public lifecycle seam

## Verification

- targeted grep over the docs stack to confirm no stale static ref helper claim
  remains
