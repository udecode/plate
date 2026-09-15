# Degradation Contract

Use this when considering virtualization, shell islands, model-backed selection,
or another surface that omits canonical content from native DOM.

## Rule

Optimize the native DOM-present path first. Degrade only for named cohorts, and
state which native behaviors change.

## Contract

For each degraded mode, record:

- named cohort and explicit product choice
- browser find behavior
- screen-reader behavior
- native selection behavior
- copy/paste behavior
- IME/composition behavior
- mobile behavior
- undo/history behavior
- collaboration behavior
- complete-DOM alternative

## Reject

- automatic or threshold-selected virtualization
- shell mode described as "same editor, just faster"
- model-backed copy/paste without visible contract
