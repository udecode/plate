---
date: 2026-04-09
topic: slate-v2-core-docs-truth-pass
status: completed
---

# Slate v2 Core Docs Truth Pass

## Goal

Align the high-signal core concepts and API pages with the recovered live
surface instead of leaving old Slate signatures in the docs.

## Completed

- updated the core concepts pages:
  - `concepts/01-interfaces.md`
  - `concepts/02-nodes.md`
  - `concepts/03-locations.md`
  - `concepts/07-editor.md`
- updated the main editor reference page:
  - `api/nodes/editor.md`
- corrected stale examples and signatures around:
  - `children: Descendant[]`
  - current marks shape
  - `onChange()`
  - delete option objects
  - `insertFragment(...)`
  - `insertNode(...)`
  - `Node.common(...)`

## Verification

- targeted grep over the docs tree for the stale signatures removed in this pass
- `yarn lint:typescript`
