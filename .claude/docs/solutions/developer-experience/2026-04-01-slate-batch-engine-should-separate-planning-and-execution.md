---
title: Slate batch engine should separate planning and execution
date: 2026-04-01
category: docs/solutions/developer-experience
module: Slate batch engine
problem_type: developer_experience
component: tooling
symptoms:
  - "Reading `packages/slate/src/core/apply.ts` required keeping too many unrelated batch concepts in working memory"
  - "Batch segment detection, dirty-path strategies, and per-op batch dispatch were mixed into one file"
  - "Review feedback focused on maintainability and call-graph readability instead of semantics or performance"
root_cause: missing_tooling
resolution_type: code_fix
severity: medium
tags:
  - slate
  - batching
  - apply
  - readability
  - maintainability
---

# Slate batch engine should separate planning and execution

## Problem

The batch engine worked, but the structure was drifting toward “everything important lives in `apply.ts`”.

That made the code harder to review for the wrong reason:

- segment detection rules lived next to batch execution
- dirty-path math lived next to lifecycle dispatch
- the single-op `apply` entrypoint had to coexist with batch planner and executor details

The result was not semantic confusion. It was file-organization confusion.

## Solution

Split the engine by role:

- `packages/slate/src/core/apply.ts`
  - normal single-op dispatch only
  - decides between ordinary apply and batched apply
- `packages/slate/src/core/batching/planner.ts`
  - batch segment kinds
  - specialized segment detection
  - batch planning rules
- `packages/slate/src/core/batching/executor.ts`
  - batched execution
  - dirty-path batching helpers
  - in-batch staged-op dispatch

That keeps the runtime model readable:

- `apply.ts` answers “which mode are we in?”
- `batching/planner.ts` answers “what shape of batch is this?”
- `batching/executor.ts` answers “how do we execute that shape?”

## What mattered

The useful rule is simple:

- planner code should not live in the same file as executor code unless the planner is trivial

For this engine, the planner is not trivial anymore:

- same-parent insert
- same-parent move
- same-parent insert+move
- independent split
- independent merge
- generic fallback segments

Once those rules exist, burying them inside `apply.ts` just turns the file into a junk drawer.

## Result

The runtime behavior stayed the same, but the call graph got easier to follow:

- `apply.ts` is small again
- the batch planner is isolated
- the dirty-path execution strategies are isolated
- review feedback can focus on behavior instead of file archaeology

## Recommendation

Keep the split.

If the batch engine grows again:

- add new segment rules to the planner
- add new execution strategies to the batch executor
- do not dump either back into `apply.ts`

`apply.ts` should stay boring. That is the point.
