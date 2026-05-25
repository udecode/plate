---
date: 2026-04-12
topic: firefox-browser-weirdness-tranche-plan
status: draft
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/slate
---

# Firefox Browser Weirdness Tranche Plan

## Purpose

Define the next exact Firefox tranche after the main IME surfaces reached:

- direct composition proof
- direct focus/selection recovery proof
- zero-width normalization proof

The remaining Firefox work should stop being “go find another weird bug” and
become named closure rows with an explicit bucket.

## Governing Rule

Every candidate row must be classified **before** implementation:

- `product-bug`
- `transport-bug`
- `missing-proof-row`
- `justified-omission-candidate`

No new work starts without:

1. exact legacy behavior reference
2. bucket
3. current owner
4. closure condition

## Why This Tranche Exists

Current state:

- Firefox IME composition on the main placeholder / inline-edge / void-edge
  rows is now directly proved
- Firefox blur/focus and zero-width selection rows are now directly proved
- the ledger still names broader Firefox-specific debt:
  - selection reads can lie
  - nested editable focus bounce
  - multi-range table selection
- Firefox drag/drop cleanup after dragged-node unmount is now directly proved

The mistake to avoid now is random row-poking.

## Candidate Rows

### Row A: Firefox table multi-range selection

Legacy reference:

- [editable.tsx](/Users/zbeyens/git/slate/packages/slate-react/src/components/editable.tsx)
  comment around:
  “In firefox if there is more then 1 range and we call setDomSelection we
  remove the ability to select more cells in a table”

Current bucket:

- `closed-proof-row`

Current owner hypothesis:

- [table-multi-range-firefox.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/table-multi-range-firefox.tsx)
- [table-multi-range-firefox.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/table-multi-range-firefox.test.ts)
- [editable.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx)

Current blocker:

- none

Closure condition:

- [x] current table example exposes native Firefox table selection as
  `rangeCount > 1`
- [x] forced editor selection sync does not collapse the live multi-range
- [x] proof uses native mouse selection, not scripted `Selection.addRange(...)`

### Row B: Firefox drag/drop cleanup after dragged-node unmount

Legacy reference:

- [editable.tsx](/Users/zbeyens/git/slate/packages/slate-react/src/components/editable.tsx)
  global `dragend` / `drop` workaround

Current bucket:

- `closed-proof-row`

Current owner hypothesis:

- current mounted `Editable`
- example-owned drag capture around the current editor surface
- drag/drop cleanup example
- Firefox proof lane

Current blocker:

- none

Closure condition:

- [x] current drag/drop example mutates structure on drop
- [x] Firefox proof drags the same void twice after drop-triggered unmount
- [x] document-level `dragend` / `drop` cleanup remains active after the
  example-owned drop path short-circuits the internal handler
- evidence:
  [drag-drop-cleanup.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/drag-drop-cleanup.test.ts),
  [drag-drop-cleanup.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/drag-drop-cleanup.tsx),
  [editable.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx)

### Row C: Firefox nested editable focus bounce

Legacy reference:

- [editable.tsx](/Users/zbeyens/git/slate/packages/slate-react/src/components/editable.tsx)
  comment:
  “If the editor has nested editable elements, the focus can go to them. In
  Firefox, this must be prevented”

Current bucket:

- `closed-proof-row`

Current blocker:

- none

Closure condition:

- [x] real current nested-editable surface exists
- [x] Firefox proof shows clicking the nested editable keeps active focus on the
  outer editor
- evidence:
  [firefox-nested-editable-focus.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/firefox-nested-editable-focus.tsx),
  [firefox-nested-editable-focus.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/firefox-nested-editable-focus.test.ts),
  [editable.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx)

## Chosen Order

1. Row B first: drag/drop cleanup
   reason:
   completed; real current browser row with proof
2. Row A second: table multi-range
   reason:
   completed; current Firefox native table selection now has a real proof row
3. Row C last: nested editable
   reason:
   completed; Firefox tranche is now exhausted locally

## Explicit Non-Goals

- no generic Firefox safari/chromium comparisons with no named legacy row
- no random browser pokes that do not map back to the ledger
- no closure language for table multi-range unless a real current seam exists

## Acceptance

This tranche is only successful if it does one of:

1. adds a real Firefox drag/drop proof row
2. adds a real Firefox multi-range table seam plus proof
3. produces an explicit justified-omission package for one row with sign-off

Anything else is drift.
