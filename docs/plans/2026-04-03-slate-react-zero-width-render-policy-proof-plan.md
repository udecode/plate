---
date: 2026-04-03
topic: slate-react-zero-width-render-policy-proof-plan
status: completed
---

# Slate React Zero-Width Render Policy Proof Plan

## Goal

Work the renderer policy split honestly:

- keep the future v2 target clear:
  line-break placeholders can move toward `<br>`-only once IME proof exists
- keep legacy Slate conservative:
  FEFF stays on the empty-block start-of-block line-break path until that IME
  proof exists
- keep FEFF-like sentinel text for IME-sensitive non-linebreak zero-width cases

## Working Hypothesis

The smallest honest legacy cut is:

- codify the split in comments and tests
- leave the legacy empty-block line-break path conservative for now
- prove renderer shape and selection sanity without overstating what is known

## Proof Priorities

1. empty block line-break placeholder renders `<br>` and still retains FEFF in legacy
2. focus / selection on an empty block still works
3. empty inline zero-width placeholder still retains FEFF

## Phases

### Phase 0

Freeze the proof seam and constraints.

### Phase 1

Write red tests for renderer shape and selection safety.

### Phase 2

Implement the smallest legacy renderer policy codification.

### Phase 3

Verify, deslop, re-verify, architect review, cleanup.

## Progress Log

### 2026-04-03

- grounded the split against:
  - the approved `<br>` bridge-tolerance proof
  - legacy `string.tsx`
  - legacy `dom-editor` selection behavior
- added red tests for:
  - empty-block line-break placeholders rendering `<br>` and retaining FEFF in legacy
  - FEFF retention for empty inline-edge zero-width placeholders
  - focus / selection sanity for an empty block
- attempted to drop FEFF on the legacy line-break path
- architect rejected that broader change because the evidence did not cover IME
  composition on the empty-block start-of-block path
- narrowed the conclusion and restored legacy FEFF retention on that path
- final result:
  legacy Slate keeps FEFF on the empty-block line-break path, while the future
  v2 policy line stays open for a stronger IME-backed split
- architect verdict: `APPROVE` on the narrowed conclusion
- deslop pass found no worthwhile simplification beyond the proof and comment
- verification evidence:
  - `zsh -lc 'yarn jest --config jest.config.js --runInBand --coverage=false'`
  - `zsh -lc 'yarn build:rollup'`
  - `zsh -lc 'yarn lint:typescript'`
  - LSP diagnostics `0` on changed files
- reusable note captured in:
  [2026-04-03-legacy-line-break-placeholders-still-keep-feff-until-ime-proof-exists.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-legacy-line-break-placeholders-still-keep-feff-until-ime-proof-exists.md)
