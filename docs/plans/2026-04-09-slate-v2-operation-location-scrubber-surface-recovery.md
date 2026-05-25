---
date: 2026-04-09
topic: slate-v2-operation-location-scrubber-surface-recovery
status: completed
---

# Slate v2 Operation Location Scrubber Surface Recovery

## Goal

Recover the remaining small utility layer still claimed by the docs:

- `Location.*`
- `Span.*`
- `Operation.*`
- `Scrubber.*`

## Completed

- restored `Location.isLocation(...)`, `Location.isPath(...)`,
  `Location.isPoint(...)`, `Location.isRange(...)`, and `Location.isSpan(...)`
- restored `Span.isSpan(...)`
- restored `Operation.*`:
  - `isNodeOperation`
  - `isOperation`
  - `isOperationList`
  - `isSelectionOperation`
  - `isTextOperation`
  - `inverse`
- restored `Scrubber.setScrubber(...)` and `Scrubber.stringify(...)`
- widened `set_selection` to carry full `properties` / `newProperties` state so
  `Operation.inverse(...)` is honest for selection operations
- widened the source barrel exports accordingly
- synced the operation and scrubber docs to the live surface

## Verification

- `yarn test:custom`
- `yarn lint:typescript`
