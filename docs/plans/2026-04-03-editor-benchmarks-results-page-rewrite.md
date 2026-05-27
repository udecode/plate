# Editor Benchmarks Results Page Rewrite

## Goal

Replace the current `editor-benchmarks` homepage with a real table-first results
surface modeled on `js-framework-benchmark`, but implemented in the existing
Next + shadcn app.

## Scope

- reuse the `js-framework-benchmark` results structure/pattern
- keep shadcn / Next implementation
- erase the old benchmark dashboard shell
- use current local Slate/Plate data
- keep non-result surfaces secondary

## Constraints

- main page must answer "who wins on which lanes"
- charts are secondary
- controls should feel like the JS benchmark:
  - editor selection
  - benchmark selection
  - display mode
  - duration slice mode
  - compare-with baseline
- correctness / issue gating should be visible

## Plan

1. Inspect current `editor-benchmarks` page/data/components.
2. Inspect `js-framework-benchmark` result components that define the table and controls.
3. Replace the old page shell with:
   - compact header
   - sticky control bar
   - dense result table
   - issue / behavior gate rows
   - secondary sections for method/templates
4. Build and browser-check.

## Verification

- `npm run build:web` in `/Users/zbeyens/git/editor-benchmarks`
- browser verification on `http://localhost:3023`
