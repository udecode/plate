# Affinity Redesign Plan

## Goal

Make affinity semantics cheap by default.

## Current read

- semantic behavior is correct but split between editor transforms and always-on leaf DOM
- the expensive part is paid by every hard-affinity leaf even though the feature matters only at the active boundary

## Target architecture

1. keep affinity semantics in the editor engine
2. move hard-edge DOM from always-on leaf wrappers to active-boundary-only rendering
3. keep public plugin config unchanged
4. verify with saved before/after code benchmarks and affinity behavior tests

## Execution

1. freeze before benchmarks for code census + code direct leaf + code full pipe
2. add behavior tests for active-boundary affinity semantics
3. introduce editor-level affinity boundary state
4. render boundary DOM only for the active boundary
5. rerun benchmarks
6. keep or revert based on measured gain and behavior parity

## Risks

- mouse boundary placement
- IME / browser-specific caret quirks
- snapshot churn from removing always-on spacer nodes

## Exit criteria

- hard-affinity tests still pass
- `bun check` passes
- code lane improves materially versus saved before artifacts
