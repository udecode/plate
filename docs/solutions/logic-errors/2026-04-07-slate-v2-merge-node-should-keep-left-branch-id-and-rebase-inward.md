---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 merge_node should keep the left-branch id and rebase inward
tags:
  - slate-v2
  - merge-node
  - transforms
  - runtime-id
  - selection
severity: medium
---

# Slate v2 merge_node should keep the left-branch id and rebase inward

## What happened

Once exact `split_node` existed, the matching `merge_node` half of the pair was
the next honest core-family step.

The tempting lie was to ship a broad `mergeNodes(...)` helper immediately.

That would have hidden the actual rule that matters:

- the left branch is the surviving logical node
- the right branch is the one being absorbed

## What fixed it

The honest first cut stayed narrow:

1. add exact `merge_node` for text paths first, then exact path-based element
   merges
2. add a narrow `Transforms.mergeNodes(editor, { at })`
3. require matching text props on both sides
4. keep the left branch id
5. rebase selection inward onto the surviving left branch

## Reusable rule

For Slate v2 merge semantics:

- keep the surviving left-branch id
- remove the absorbed right-branch id
- rebase selection inward onto the surviving branch
- do not claim broad `mergeNodes(...)` parity before the engine owns more than
  the exact merge case

If merge keeps the wrong id or hides branch ownership, downstream selector and
range-ref reasoning rots fast.
