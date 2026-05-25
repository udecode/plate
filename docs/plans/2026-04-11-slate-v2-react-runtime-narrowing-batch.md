---
date: 2026-04-11
topic: slate-v2-react-runtime-narrowing-batch
status: completed
source_repos:
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/plate-2
---

# Slate v2 React Runtime Narrowing Batch

## Goal

Run Phase 3 honestly:

- rebaseline huge-document browser lanes after the core fast path
- cut obvious `slate-react` subscription fanout before touching islands

## Kept Changes

- [editable-text-blocks.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx)
  - descendant binding collapsed to one selector
  - top-level runtime ids use structured comparison instead of string churn
  - text descendants pass resolved marks directly into `EditableText`
- [editable-text.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text.tsx)
  - bound text state collapsed to one selector
  - resolved runtime-bound text can skip redundant selector work when parent
    already owns text and marks
- small presentational `slate-react` components switched to explicit
  `createElement(...)` runtime ownership so browser benchmarks can run against
  source reliably under Next dev

## Verification

- `pnpm install`
- `pnpm turbo build --filter=./packages/slate-react`
- `pnpm turbo typecheck --filter=./packages/slate-react`
- `pnpm --filter slate-react test`
- `pnpm lint:fix`

## Results

### Huge-document gate lane (`1000` blocks)

- current v2:
  - ready `470.20ms`
  - type `13.78ms`
  - select-all `2.74ms`
  - paste `37.41ms`
- delta vs legacy:
  - ready `-160.17ms`
  - type `-6.90ms`
  - select-all `-71.49ms`
  - paste `-69.31ms`

### Chunking compare (`5000` blocks)

- before:
  - ready `881.50ms`
  - type `71.18ms`
  - select-all `19.36ms`
  - paste `96.68ms`
- after:
  - ready `824.89ms`
  - type `65.45ms`
  - select-all `17.63ms`
  - paste `93.44ms`
- delta vs legacy chunking after the cut:
  - ready `+2.75ms`
  - type `+47.63ms`
  - select-all `-23.33ms`
  - paste `-220.03ms`

### Chunking compare (`10000` blocks)

- current v2:
  - ready `1458.56ms`
  - type `166.76ms`
  - select-all `43.59ms`
  - paste `196.13ms`
- delta vs legacy chunking:
  - ready `+107.97ms`
  - type `+136.78ms`
  - select-all `-37.70ms`
  - paste `-430.56ms`

## Verdict

This batch was worth keeping.

It improved the large-document React lane without touching islands or chunking
architecture. It did **not** erase the typing gap at `10000` blocks.

That means the next honest work is still Phase 3 follow-up or early Phase 4:

- narrower runtime invalidation again if there is still obvious fanout left
- otherwise semantic islands / active corridor / adaptive occlusion

What is not left:

- pretending the remaining gap is still mostly core
- pretending chunking is already obsolete at `10000`
