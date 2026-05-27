---
date: 2026-04-07
last_updated: 2026-04-26
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 cross-block delete should reuse the merge seam
tags:
  - slate-v2
  - editor-methods
  - delete
  - merge
  - transforms
severity: medium
---

# Slate v2 cross-block delete should reuse the merge seam

## What happened

Once `Editor.before(...)`, `Editor.after(...)`, and `Transforms.move(...)`
could cross supported top-level block boundaries, `delete(...)` still lagged on
that seam.

The tempting lie was to special-case cross-block deletion with a separate tree
rewrite path.

That would have duplicated block-join semantics that `mergeNodes(...)` already
owned.

## What fixed it

The honest follow-on kept the delete helper small:

1. delete edge text on the start/end sides when needed
2. reuse `mergeNodes(...)` for the adjacent block join
3. collapse the selection back to the computed start boundary

That keeps adjacent cross-block delete aligned with the same merge contract the
core already proves elsewhere, whether the range started collapsed or was
already explicit.

## Reusable rule

For Slate v2 adjacent cross-block deletion:

- if the behavior is an adjacent block join, reuse the merge seam
- do not fork a second block-join implementation into `delete(...)`

If block-boundary delete and block merge have separate semantics, one of them
will drift.

## Sweep guard

When reviewing core editor methods for this regression class, hunt for:

- private structural helpers that manually merge, split, lift, wrap, or unwrap
  where a primitive seam already owns the behavior
- optional transaction parameters that fall back to `editor.apply`
- preflight checks that read live selection before transaction target resolution
- direct `Transforms.*` use in the core mutation surface

The correct fix is usually to route the method through the owned primitive seam,
not to make the local helper smarter.
