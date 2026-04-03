---
date: 2026-04-03
topic: slate-v2-clipboard-boundary-proof-plan
status: in_progress
---

# Slate v2 Clipboard Boundary Proof Plan

## Goal

Produce an approved consensus plan for the missing Phase 4 clipboard-boundary proof in `../slate`, with a test-first execution shape.

## Context

- Context snapshot:
  [slate-v2-clipboard-boundary-proof-20260403T113138Z.md](/Users/zbeyens/git/plate-2/.omx/context/slate-v2-clipboard-boundary-proof-20260403T113138Z.md)

## Phases

1. Ground current v2 seam and legacy clipboard ownership
   - status: completed
2. Consensus planning loop
   - status: in_progress
3. Finalize approved plan artifact and handoff
   - status: pending

## Working Notes

- The v2 packages currently have no clipboard code.
- Current Slate splits clipboard behavior across core `getFragment`, DOM plugin helpers, and `Editable` event wiring.
- The plan must keep ownership in `slate-v2` + `slate-dom-v2`, not invent a new package.

## Progress Log

- 2026-04-03: Created context snapshot and plan shell.
- 2026-04-03: Grounded current v2 package surface and located current Slate clipboard seams.

## Open Questions

- Minimal proof slice size
- Earliest configurable format seam
- Exact first red tests
