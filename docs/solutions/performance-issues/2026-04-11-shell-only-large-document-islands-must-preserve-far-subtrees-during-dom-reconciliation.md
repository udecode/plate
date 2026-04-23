---
title: Shell-only large-document islands must preserve far subtrees during DOM reconciliation
date: 2026-04-11
category: docs/solutions/performance-issues
module: Slate v2 React runtime
problem_type: performance_issue
component: frontend_stimulus
symptoms:
  - "The first honest large-document shell proof needed far islands to stop mounting editable descendants without breaking active typing"
  - "Structured DOM reconciliation in EditableBlocks still assumed every top-level subtree was mounted"
  - "Typing inside one live island would have consumed only mounted DOM text nodes and overwritten far shelled text with empty strings"
root_cause: logic_error
resolution_type: code_fix
severity: critical
tags:
  - slate-v2
  - slate-react
  - performance
  - huge-document
  - islands
  - dom-reconciliation
  - shell
---

# Shell-only large-document islands must preserve far subtrees during DOM reconciliation

## Problem

The first shell-only large-document experiment had a hidden correctness trap.

`EditableBlocks` reconciles from DOM by reading `[data-slate-node="text"]`
nodes and rebuilding text content in snapshot order. That works only when the
whole editable tree is mounted.

Once far islands become cheap shells, that assumption becomes false.

## Symptoms

- far islands intentionally stopped rendering `EditableText`
- DOM reconciliation still scanned only mounted text nodes
- active typing in one mounted island would have exhausted the mounted text list
  early and then filled far shelled text nodes with `''`

## What Didn't Work

- treating shell mode as only a rendering concern
- reusing the old “walk every text node in DOM order” reconciliation path
- assuming the shell experiment could be validated only with ready/type timing
  without checking snapshot correctness

## Solution

In
[editable-text-blocks.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx),
keep DOM reconciliation scoped to mounted top-level islands:

- active islands still reconcile from DOM text nodes
- shelled top-level islands are copied straight from the committed snapshot
- the reconciliation cursor consumes DOM text only for mounted top-level
  runtime ids

This keeps shell mode honest:

- render less
- mutate only what is actually mounted
- preserve far subtree text exactly

## Why This Works

The shell layer changed the runtime contract.

Before shells:

- mounted DOM text order matched full snapshot text order

After shells:

- mounted DOM text order matches only the active subset of top-level islands

So reconciliation must also become subset-aware. Once that happens:

- active typing updates only the live island
- far shells stay cheap
- far committed content survives untouched

## Prevention

- any shell or occlusion layer must audit DOM reconciliation assumptions before
  trusting perf wins
- if DOM-derived updates assume “the whole tree is mounted,” they are wrong for
  shell mode
- benchmark wins are not enough; check whether the snapshot model is still
  correct under partial mounts
- preserve non-mounted subtrees from the committed snapshot until they are live
  again

## Related Issues

- [2026-04-11-slate-v2-large-document-shell-proof-batch.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-large-document-shell-proof-batch.md)
- [2026-04-11-slate-v2-proof-first-large-document-layer-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-proof-first-large-document-layer-plan.md)
