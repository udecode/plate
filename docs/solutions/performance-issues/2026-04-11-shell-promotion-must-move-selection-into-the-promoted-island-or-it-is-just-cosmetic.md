---
title: Shell promotion must move selection into the promoted island or it is just cosmetic
date: 2026-04-11
category: docs/solutions/performance-issues
module: Slate v2 React runtime
problem_type: performance_issue
component: frontend_stimulus
symptoms:
  - "Shell-only islands removed far descendant work, but clicking a far shell still left the live caret at the old active island"
  - "A promoted shell could disappear without creating a real editing corridor"
  - "Without a selection jump, deep interaction would still type into the default live island instead of the promoted one"
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - slate-v2
  - slate-react
  - performance
  - huge-document
  - islands
  - corridor
  - selection
  - focus
---

# Shell promotion must move selection into the promoted island or it is just cosmetic

## Problem

Promoting a shell is not enough.

If the runtime only removes the shell wrapper but keeps selection at the old
active island, the user still is not editing where they clicked.

That is a fake corridor.

## Symptoms

- shell disappeared on mouse down
- mounted descendant count changed
- but the model selection stayed at the old default live island unless another
  path moved it later

## What Didn't Work

- treating shell promotion as purely visual state
- assuming browser focus alone would retarget editing correctly after promotion
- measuring shell disappearance without measuring “promote then type”

## Solution

On shell mouse down:

- promote the island
- select the start of the promoted top-level island in the model
- focus the real editor root

Kept files:

- [island-shell.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/island-shell.tsx)
- [editable-text-blocks.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx)

Then prove it in both places:

- runtime test: promoted shell lands selection in the promoted island
- browser bench: add `promoteTypeMs`

## Why This Works

The active corridor has to become the place where model selection lives.

Once shell promotion also moves selection:

- DOM selection sync retries against the newly mounted island
- typing goes into the promoted island instead of the old live island
- promotion becomes a real editing transition, not a cosmetic rerender

## Prevention

- never treat shell disappearance as proof of usable editing
- benchmark `promote then type`, not just `promote`
- if corridor entry does not move model selection, it is not a corridor

## Related Issues

- [2026-04-11-slate-v2-active-corridor-promotion-batch.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-active-corridor-promotion-batch.md)
- [2026-04-11-slate-v2-proof-first-large-document-layer-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-proof-first-large-document-layer-plan.md)
