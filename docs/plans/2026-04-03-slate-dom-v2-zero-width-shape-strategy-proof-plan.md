---
date: 2026-04-03
topic: slate-dom-v2-zero-width-shape-strategy-proof-plan
status: completed
---

# Slate DOM v2 Zero-Width Shape Strategy Proof Plan

## Goal

Prove the next honest slice of the larger sentinel-strategy question:

- which zero-width DOM shapes the `slate-dom-v2` bridge can already support
- where `<br>` is viable
- where FEFF-like sentinel text still stays because of IME/native selection debt

## Working Hypothesis

The first real proof should not try to remove sentinels globally.

It should:

- prove bridge compatibility for `<br>`-style line-break placeholders
- keep current sentinel read/write normalization intact
- capture the policy line:
  line-break placeholders can move toward `<br>` shape, but IME-sensitive empty
  inline/void/start-of-block cases still keep sentinel text for now

## Phases

### Phase 0

Ground the legacy DOM shape and current v2 bridge tolerance.

### Phase 1

Add red tests for `<br>` placeholder bridge behavior.

### Phase 2

Implement only the missing bridge tolerance if needed.

### Phase 3

Verify, deslop, re-verify, architect review, cleanup.

## Progress Log

### 2026-04-03

- grounded the strategy seam against:
  - the approved zero-width round-trip bridge proof
  - legacy `string.tsx` zero-width rendering
  - legacy `dom-editor.ts` zero-width DOM translation
- chose the first honest cut:
  prove whether `<br>`-style line-break placeholders already work through the
  `slate-dom-v2` bridge before pretending to redesign the whole sentinel story
- added bridge tests for:
  - `toDOMPoint` over `<br>` line-break placeholders
  - `toDOMRange` over `<br>` line-break placeholders
  - `toSlatePoint` from both `[br, 0]` and `[zeroWidth, 1]`
- result:
  the bridge already supports `<br>`-style line-break placeholders with no
  product-code changes required
- architect verdict: `APPROVE`
- deslop pass found no worthwhile simplification beyond the proof tests
- verification evidence:
  - `zsh -lc 'yarn workspace slate-dom-v2 test'`
  - `zsh -lc 'yarn build:rollup'`
  - `zsh -lc 'yarn lint:typescript'`
  - LSP diagnostics `0` on changed files
- reusable note captured in:
  [2026-04-03-br-line-break-placeholders-are-already-bridge-compatible.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-br-line-break-placeholders-are-already-bridge-compatible.md)
