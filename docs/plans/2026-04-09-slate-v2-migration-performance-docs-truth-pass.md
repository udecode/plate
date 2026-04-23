---
date: 2026-04-09
topic: slate-v2-migration-performance-docs-truth-pass
status: completed
---

# Slate v2 Migration/Performance Docs Truth Pass

## Goal

Remove the last obvious stale docs that still teach plugin-stack, `editor.exec`,
and `renderChunk` era ideas instead of the current recovered surface.

## Result

- rewrote `09-performance.md` around the current `Slate` /
  `EditableBlocks` / `EditableTextBlocks` surface
- removed stale `renderChunk` and chunking claims
- rewrote `xx-migrating.md` so it describes the current editor/provider/render
  seams instead of the old command-object and middleware story
- fixed the last install-guide provider note that still talked about the old
  `value` prop

## Verification

- targeted grep/readback on the touched docs
