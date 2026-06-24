---
date: 2026-04-07
topic: plite-target-b-richtext-render-first-slice
---

# Plite Target B Richtext Render-First Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/master-roadmap.md).

## Goal

Promote the `richtext` family from comparison-only to one honest current claim.

## Slice

Add a narrow current `richtext` surface through:

- `EditableBlocks`
- mark-aware `renderSegment(...)`
- app-owned rich element rendering
- one real browser proof lane

## Landed

- `EditableTextSegment` now carries leaf marks from the current text node
- `EditableBlocks` can render those marks through `renderSegment(...)`
- current example:
  - `/Users/zbeyens/git/plite/site/examples/ts/richtext.tsx`
- current browser proof:
  - `/Users/zbeyens/git/plite/playwright/integration/examples/richtext.test.ts`

## Proof

- runtime proof for mark-aware segment rendering
- rollup build for `plite-react`
- Chromium browser proof for:
  - `strong`
  - `em`
  - `code`
  - `blockquote`
  - continued typing on the paragraph lane

## Claim

This is a redefined current `richtext` family slice.

It is not blanket legacy richtext parity.
