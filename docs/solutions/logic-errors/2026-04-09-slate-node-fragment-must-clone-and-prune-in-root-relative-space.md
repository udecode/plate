---
title: Slate Node fragment must clone and prune in root-relative space
type: solution
date: 2026-04-09
status: completed
category: logic-errors
module: slate-v2
tags:
  - slate
  - slate-v2
  - node
  - fragment
  - range
  - traversal
  - headless
---

# Problem

`Node.fragment(...)` was missing entirely in `slate-v2`, even though the public
node API still described it.

Porting it naively is easy to fuck up:

- mutate the live tree instead of a clone
- interpret the range against editor-global paths when the root is an element
- delete forward and invalidate later paths during the same pass

# Root Cause

`Node.fragment(...)` is a pure node-utility helper, not an editor transaction.

That means it has to work on any root ancestor and any range expressed relative
to that root, without leaning on editor-only fragment helpers or runtime ids.

# Solution

Use a clone-and-prune algorithm in root-relative space:

1. deep-clone the ancestor root's `children`
2. walk the cloned tree with `Node.nodes(...)` in reverse order
3. prune nodes outside the range from the bottom up
4. trim the start and end text leaves in place

The reverse walk matters because child removals would otherwise invalidate later
paths still waiting to be processed.

# Why This Works

The helper stays:

- pure
- root-relative
- safe for both editor roots and element roots

It also composes cleanly with the rest of the recovered `Node.*` traversal
surface, because the same path semantics drive both the walk and the pruning.

# Prevention

- Treat `Node.fragment(...)` as a node-utility operation, not an editor
  transaction helper.
- Clone before pruning. Never mutate the live root while slicing a fragment.
- When path-based pruning is involved, walk in reverse unless you enjoy
  invalidating your own cursor mid-loop.
