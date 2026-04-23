---
title: Slate React rerender breadth is mostly local and useSlate is the only broad hook left
date: 2026-04-11
category: docs/solutions/performance-issues
module: Slate v2 React runtime
problem_type: performance_issue
component: frontend_stimulus
symptoms:
  - "Huge-document typing was still behind chunking, so it was unclear whether more React invalidation cleanup was still needed"
  - "Older Slate issues kept pointing at selection breadth, many-leaf breadth, and deep ancestor breadth as likely renderer pain families"
  - "The runtime had local selector wins already, but no stable breadth lane tying the issue families together"
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - slate-v2
  - slate-react
  - performance
  - rerender
  - selection
  - leaves
  - ancestors
  - benchmark
---

# Slate React rerender breadth is mostly local and useSlate is the only broad hook left

## Problem

The next roadmap decision depended on one question:

Is `slate-react` still broadly invalidating on edits and selection changes, or
is the remaining huge-document typing gap already downstream of something else?

Without a real breadth lane, that question was still hand-wavy.

## Symptoms

- `5000` and `10000` huge-document typing still lagged legacy chunking
- earlier runtime cuts had improved things, but there was no kept benchmark for
  the `#5131`, `#3656`, and `#4141` families
- it was still too easy to blame “React rerenders” in the abstract

## What Didn't Work

- treating `useSlate()` complaints as proof that the whole runtime still had
  broad invalidation
- using only user-facing huge-document latency numbers to infer render breadth
- reaching for islands before proving whether descendant invalidation was
  actually still red

## Solution

Add a kept breadth lane in
[slate-react-rerender-breadth-benchmark.tsx](/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx)
and wire it as
`pnpm bench:react:rerender-breadth:local`.

The lane measures three issue families:

1. `#5131` selection-driven breadth
2. `#3656` many-leaf breadth inside one block
3. `#4141` deep ancestor breadth on one low-level edit

Measured result:

- selection lane:
  - `20` selection changes -> `20` `useSlate()` rerenders
  - `20` selection changes -> `20` `useSlateSelection()` rerenders
  - unrelated top-level block slices rerender: `0`
- many-leaf lane:
  - edited leaf rerenders: `1`
  - sibling leaves rerender: `0`
  - parent block rerenders: `0`
- deep ancestor lane:
  - deep edited leaf rerenders: `1`
  - rerendered ancestors: `0`
  - sibling branch rerenders: `0`

## Why This Works

The benchmark separates two different stories that were getting lumped together:

1. **Broad hooks are broad by design.**
   If a component uses `useSlate()`, it is asking for whole-editor reactivity.
   The selection lane proves that still happens.
2. **Descendant invalidation is mostly local.**
   The many-leaf and deep-ancestor lanes show that one edited leaf does not
   fan out into sibling leaves, parent blocks, or ancestor chains anymore.

That means the runtime is no longer failing on the old breadth complaints in
the way legacy Slate did.

## Prevention

- benchmark breadth directly instead of inferring it from latency alone
- separate “broad hook by contract” from “runtime invalidation bug”
- do not escalate to semantic islands until sibling-leaf and ancestor-chain
  breadth are actually measured and shown to still be red
- treat `useSlate()` rerenders as hook-contract debt, not automatic proof that
  the whole runtime is still broadly invalidating

## Related Issues

- [benchmark-candidate-map.md](/Users/zbeyens/git/plate-2/docs/slate-issues/benchmark-candidate-map.md)
- [2026-04-11-slate-v2-rerender-breadth-batch.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-rerender-breadth-batch.md)
