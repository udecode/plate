---
date: 2026-04-11
topic: slate-v2-history-perf-batch
status: completed
source_repos:
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/plate-2
---

# Slate v2 History Perf Batch

## Goal

Close the missing `withHistory(createEditor())` perf lane for strict RC
acceptance and stop hand-waving about history cost.

## Kept Work

- added the compare lane:
  [history.mjs](/Users/zbeyens/git/slate-v2/scripts/benchmarks/core/compare/history.mjs)
- wired the command:
  `bun run bench:history:compare:local`
- restored legacy-style typing merge heuristics in
  [with-history.ts](/Users/zbeyens/git/slate-v2/packages/slate-history/src/with-history.ts)

## Result

Latest read at `5000` blocks, `20` typed characters, `200` inserted fragment
blocks:

- current typing undo `29.71ms`
- current typing redo `20.53ms`
- current fragment undo `27.21ms`
- current fragment redo `42.95ms`

Legacy:

- typing undo `0.36ms`
- typing redo `0.49ms`
- fragment undo `1.92ms`
- fragment redo `11.18ms`

So yes, current `slate-history` is still slower than legacy.

But the real blocker-level disaster was still fixed first:

- before restoring merge heuristics, typing-burst undo/redo was roughly
  `~490ms`
- after the fix, the same lane is back in the low `20-40ms` band

That is the difference between “RC blocker” and “strict-acceptance proof row
that stays slower than legacy but still comfortably fast.”

## Verdict

Keep the lane.

Do **not** reopen RC on this alone.

Reason:

- this is a headless compare lane, not a user-facing browser regression
- the remaining cost is real, but still lands in low tens of ms on a `5000`
  block document
- the deep-interview blocker policy already said slower-than-legacy can stay
  non-blocking when it is still comfortably fast in practice
