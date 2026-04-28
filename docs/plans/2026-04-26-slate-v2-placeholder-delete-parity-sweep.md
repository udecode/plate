# Slate v2 Placeholder Delete Parity Sweep

## Status

Paused by user request.

## Goal

Sweep the placeholder/delete-to-empty regression class against legacy Slate so
the user does not have to report each placeholder bug one by one.

## Scope

- Active code repo: `/Users/zbeyens/git/slate-v2`.
- Legacy comparison repo: `/Users/zbeyens/git/slate`.
- Browser route family: `/examples/*` surfaces that use `Editable`
  placeholders.
- Primary class: placeholder visibility, placeholder children, overlay style,
  root height, and focus/caret state after:
  - initial empty render
  - type into empty editor
  - delete all text back to empty
  - repeat type/delete once where cheap

## Non-Goals

- Do not fix unrelated selection, richtext, or markdown behavior unless the
  sweep proves it is the same placeholder/delete-to-empty class.
- Do not manually patch example files when the owner is `slate-react`.
- Do not claim parity from jsdom only. Browser proof is required.

## Known Prior Fix

- `EditableTextBlocks` subscribes to placeholder-visible state.
- `EditableText` skips custom `renderPlaceholder` when no placeholder value is
  present.
- Existing proof: `custom-placeholder` restores placeholder children and root
  height after type/delete.

## Plan

1. Inventory v2 and legacy examples that pass `placeholder` to `Editable`.
2. Start or reuse both dev servers.
3. Run a browser sweep that records initial empty, after type, and after
   delete-to-empty states for each route.
4. Classify differences:
   - `same-class bug`: placeholder missing, child missing, overlay wrong, root
     height wrong, or focus lost after delete-to-empty.
   - `example-specific`: route intentionally differs or is not editable in the
     same way.
   - `out-of-scope`: non-placeholder behavior.
5. Patch the smallest shared owner for same-class bugs.
6. Add package-level regression coverage for each owner-level gap.
7. Verify with focused tests, `slate-react` package gates, lint, and real browser
   sweep.

## Evidence Log

- 2026-04-26: User requested a sweep review against legacy for the same
  placeholder regression class instead of reporting each bug one by one.
- 2026-04-26: Targeted browser sweep finished before interruption. User then
  asked to stop testing placeholder, so no further classification or patching
  is being pursued in this lane.

## Changeset

Required if `slate-react` package behavior changes.
