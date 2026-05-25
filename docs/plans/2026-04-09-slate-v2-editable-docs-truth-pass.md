---
date: 2026-04-09
topic: slate-v2-editable-docs-truth-pass
status: completed
---

# Slate v2 Editable Docs Truth Pass

## Goal

Align the public docs with the actual rich-text editing surface:
`EditableBlocks` / `EditableTextBlocks` for structured rendering, `Editable` for
the lower-level DOM snapshot seam.

## Current Batch

1. fix `Editable` reference docs so they describe the current low-level surface
2. retarget stale rendering/walkthrough examples to `EditableBlocks`
3. remove overclaims for unsupported legacy props like `renderPlaceholder` and
   `renderText`
4. sync RC truth docs if the public guidance changes materially

## Result

- rewrote the `Editable` reference doc so it describes the current low-level
  DOM snapshot seam and the structured `EditableBlocks` / `EditableTextBlocks`
  surface separately
- updated the main install, rendering, TypeScript, event-handling, formatting,
  commands, persistence, and collaboration docs to use `EditableBlocks` for the
  structured rich-text surface
- recovered `renderElement.attributes` on `EditableBlocks`, which makes the
  current example shape honest again for callers who want to own the element
  host directly
- updated the RC proof ledger to call out the recovered render-element host seam

## Verification

- targeted readback on the touched docs
- `yarn workspace slate-react run test -- --test-name-pattern "EditableBlocks exposes renderElement attributes so callers can own the element host|EditableBlocks exposes renderLeaf so callers can own the leaf host"`
- `yarn workspace slate-react run test`
- `yarn test:custom`
- `yarn lint:typescript`
