---
date: 2026-04-15
topic: slate-v2-editable-one-shot-recovery
status: active
---

# Slate v2 Editable One-Shot Recovery

## Goal

Recover `packages/slate-react/src/components/editable.tsx` source-first against
legacy, plus any support files it truly depends on, instead of treating
specialist browser proof as enough.

## Source of Truth

- `.agents/rules/repair-drift.mdc`
- `/Users/zbeyens/git/slate/packages/slate-react/src/components/editable.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx`

## Current Findings

- legacy same-path file is ~2056 lines; current same-path file is ~928 lines
- current shared keydown path had dropped undo/redo hotkeys entirely
- current repo has no `packages/slate-react/src/hooks/android-input-manager/**`
  tree at all
- legacy `Editable` also depended on:
  - `useTrackUserInput`
  - `RestoreDOM`
  - `useChildren`
  - `use-decorations`
  - several `slate-dom` utility and weak-map seams
- docs had wrongly allowed specialist IME/browser proof to stand in for this
  same-path/shared-surface recovery

## Phases

1. restore the obvious shared hotkey/history regression in current `Editable`
2. map the minimum support-file set needed for the next editable recovery slice
3. backport missing support seams in package code
4. rerun package/site/browser proof after each meaningful slice

## Progress

- Phase 1 complete:
  - shared undo/redo hotkeys restored in current `Editable`
  - package and browser proof added and green
- Phase 2 in progress:
  - support-file inventory done
  - next decision is how much Android/restore-dom/input support can be restored
    honestly in the current architecture without fake compatibility layers
  - restored additional legacy-owned shared paths in `editable.tsx`:
    - richer selection-sync loop
    - focus / blur compat handling
    - click / cut handling
    - drag-state tracking moved back toward legacy stateful behavior
  - package verification is currently green again:
    - `pnpm turbo typecheck --filter=./packages/slate-react`
    - `pnpm lint:fix`
    - `pnpm --filter slate-react test`
  - targeted browser proof is still red on `plaintext`:
    - typing after clearing the root still reverses text (`!txetnialP ,olleH`)
    - this remains a real product/browser regression in the editable input path,
      not an accepted engine-owned exception
