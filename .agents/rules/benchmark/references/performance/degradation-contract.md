# Degradation Contract

Use this when considering virtualization, shell islands, model-backed selection,
or staged mounting.

## Rule

Optimize the native DOM-present path first. Degrade only for named cohorts, and
state which native behaviors change.

## Contract

For each degraded mode, record:

- cohort threshold
- browser find behavior
- screen-reader behavior
- native selection behavior
- copy/paste behavior
- IME/composition behavior
- mobile behavior
- undo/history behavior
- collaboration behavior
- escape hatch or explicit opt-in

## Reject

- virtualization as a default before repeated-unit budgets are exhausted
- shell mode described as "same editor, just faster"
- model-backed copy/paste without visible contract
