---
date: 2026-04-03
topic: slate-dom-v2-zero-width-selection-proof-plan
status: completed
---

# Slate DOM v2 Zero-Width Selection Proof Plan

## Goal

Implement the first real `slate-dom-v2` fix for zero-width / DOM selection
anchor debt without pretending the whole sentinel strategy is solved in one shot.

## Working Hypothesis

The smallest honest first cut is likely:

- harden DOM point/range translation when the expected zero-width sentinel is
  missing or empty
- keep the fix in `slate-dom-v2`
- prove it with a focused DOM bridge test, not with broad browser folklore

## Likely First Proof

- target `toDOMRange` / DOM-point resolution around empty text or zero-width
  boundaries
- tolerate current DOM shape variation instead of crashing on a one-character
  offset assumption

## Chosen First Cut

Public surface:

- `DOMBridge.toDOMPoint(editor, point)`
- `DOMBridge.toDOMRange(editor, range)`

Proof semantics:

- DOM reverse lookup uses committed `path -> runtimeId` and DOM bindings
- zero-width handling clamps native offsets to the actual DOM node length
  instead of blindly forcing `1`
- the first proof is DOM-bridge-only:
  no React selection sync loop, no full sentinel strategy rewrite

## Phases

### Phase 0

Map current bridge semantics and issue-backed failure shapes.

### Phase 1

Write the first failing DOM bridge contract test.

### Phase 2

Implement the minimal bridge fix.

### Phase 3

Verify, deslop, re-verify, architect review, cleanup.

## Progress Log

### 2026-04-03

- mapped the current `slate-dom-v2` bridge and the `#5760` issue pressure
- chose the first honest cut:
  - add `DOMBridge.toDOMPoint(editor, point)`
  - add `DOMBridge.toDOMRange(editor, range)`
  - make zero-width offsets clamp to actual DOM node length
- landed the reverse bridge seam in `../slate-v2`
- added bridge tests for:
  - reverse point lookup
  - zero-width range clamping when sentinel text is missing
  - zero-width native offset `1` when sentinel text exists
  - zero-width native offset `1` mapping back to Slate offset `0`
- architect initially rejected the one-way zero-width normalization
- fixed the read path so zero-width sentinel offsets normalize in both
  directions
- deslop pass found no worthwhile simplification beyond the verified fix
- fresh verification evidence:
  - `zsh -lc 'yarn workspace slate-dom-v2 test'`
  - `zsh -lc 'yarn build:rollup'`
  - `zsh -lc 'yarn lint:typescript'`
  - LSP diagnostics `0` on changed files
- final architect verdict: `APPROVE`
- reusable note captured in:
  [2026-04-03-zero-width-dom-selection-bridges-must-normalize-both-directions.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-zero-width-dom-selection-bridges-must-normalize-both-directions.md)
