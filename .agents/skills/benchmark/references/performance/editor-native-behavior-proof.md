# Editor Native Behavior Proof

Use this when a faster mode can change browser-native behavior.

## Rule

Performance wins do not count if they silently break core editor behavior.

## Proof Rows

- browser find
- screen-reader traversal
- native selection
- copy
- paste
- select-all
- IME/composition
- mobile touch selection
- undo/history
- collaboration/remote update
- follow-up typing after repair/materialization

## Contract

For every mode, state whether each row is:

- native
- model-backed
- materialize-first
- intentionally unsupported
- explicit opt-in only

Do not hide native behavior regressions inside timing wins.
