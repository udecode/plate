---
title: Slate history typing bursts need legacy-style merge heuristics before anything else
date: 2026-04-11
category: docs/solutions/performance-issues
module: Slate v2 history runtime
problem_type: performance_issue
component: frontend_stimulus
symptoms:
  - "The first strict RC history compare lane made large-document typing-burst undo and redo look catastrophically slow"
  - "A 20-character typing burst on a 5000-block document was taking roughly 490ms to undo or redo in current slate-history"
  - "Legacy Slate was much faster on the same lane because contiguous text edits merged into one history batch"
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - slate-v2
  - slate-history
  - performance
  - undo
  - redo
  - history
  - typing
---

# Slate history typing bursts need legacy-style merge heuristics before anything else

## Problem

The missing strict RC history lane exposed a real issue.

Current `slate-history` was recording contiguous typing bursts as separate undo
units unless the caller explicitly forced merging.

That made burst undo/redo pay repeated full restore cost and turned the first
benchmark read into nonsense.

## Symptoms

- `20` typed characters on a `5000`-block document were taking about `~490ms`
  to undo and redo in the compare lane
- legacy Slate was vastly faster on the same benchmark family
- the cost came from history batching policy before any deeper undo/redo
  implementation discussion even mattered

## What Didn't Work

- treating every committed text insert as its own history unit by default
- jumping straight to deeper replay optimization before restoring the obvious
  merge behavior for contiguous text edits
- using the strict history lane without first checking whether burst typing was
  even grouped sensibly

## Solution

Restore legacy-style merge heuristics in
[with-history.ts](/Users/zbeyens/git/slate-v2/packages/slate-history/src/with-history.ts):

- contiguous `insert_text` operations on the same path merge
- contiguous backward `remove_text` operations on the same path merge
- explicit history flags still override the default when the caller asks

After that fix, the same strict lane dropped from roughly `~490ms` to the low
`20ms` range.

## Why This Works

Typing bursts are one user intention, not twenty unrelated history moments.

If the history layer refuses to merge them, every later undo/redo benchmark is
measuring batching policy failure before it measures replay cost.

Once the burst becomes one history batch again:

- undo/redo cost falls back into the actual restore path cost
- strict RC history coverage becomes interpretable
- deeper optimization can be judged honestly instead of through a broken batch
  policy

## Prevention

- before benchmarking history replay, verify the batch policy matches the user
  intention being benchmarked
- if contiguous typing does not merge, fix that first
- do not let strict benchmark lanes harden a fake problem created by bad batch
  boundaries

## Related Issues

- [2026-04-11-slate-v2-history-perf-batch.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-history-perf-batch.md)
- [2026-04-09-slate-history-withnewbatch-must-split-at-the-commit-writer.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-09-slate-history-withnewbatch-must-split-at-the-commit-writer.md)
