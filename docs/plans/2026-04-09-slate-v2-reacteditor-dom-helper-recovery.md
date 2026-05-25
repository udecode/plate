---
date: 2026-04-09
topic: slate-v2-reacteditor-dom-helper-recovery
status: completed
---

# Slate v2 ReactEditor DOM Helper Recovery

## Goal

Close the next honest `ReactEditor` / `slate-dom` helper gap in one coherent
batch.

## Current Batch

1. split clipboard fragment-vs-text insertion on the current bridge
2. recover DOM target classification helpers
3. recover `findEventRange` over the mounted root and current point/range seam
4. widen runtime proof and sync docs/ledgers

## Notes

- do not recreate the old DOMEditor stack wholesale
- recover only the helpers the current mounted bridge can prove
- keep docs aligned to the live helper surface instead of legacy overclaim

## Result

- split the clipboard bridge into `insertFragmentData`, `insertTextData`, and
  the generic `insertData` path
- restored current DOM target classification helpers on `ReactEditor`:
  `hasTarget`, `hasEditableTarget`, `hasSelectableTarget`, and
  `isTargetInsideNonReadonlyVoid`
- restored `ReactEditor.findEventRange` over the mounted root caret APIs and
  the current void-target seam
- widened runtime proof for:
  custom clipboard format keys, split clipboard insertion, mounted target
  checks, and event-range resolution
- updated the ReactEditor docs and the RC ledgers so the recovered helper seam
  is explicit

## Verification

- `yarn workspace slate-react run test -- --test-name-pattern "withReact and ReactEditor expose|DOM target and event helpers expose"`
- `yarn workspace slate-react run test`
- `yarn test:custom`
- `yarn lint:typescript`
