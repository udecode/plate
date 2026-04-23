---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 unsetNodes should use the set_node properties/newProperties pair
tags:
  - slate-v2
  - unsetNodes
  - set-node
  - transforms
  - operations
severity: medium
---

# Slate v2 unsetNodes should use the set_node properties/newProperties pair

## What happened

Once `set_node` and `Transforms.setNodes(...)` were real, the next narrow
follow-on was `Transforms.unsetNodes(...)`.

The tempting shortcut was to invent a second removal-shaped node operation or
to make the wrapper read the committed snapshot to find the node's current
props.

Both approaches were wrong.

## What fixed it

The honest path was to keep property removal inside the existing `set_node`
seam.

`Transforms.unsetNodes(...)` now dispatches one `set_node` operation with:

- `properties`: the keys being removed
- `newProperties`: an empty object

Then the core applies the usual property updates first and removes any keys
listed in `properties` that are not still present in `newProperties`.

That does three useful things:

1. keeps property update and property removal inside one op family
2. avoids stale committed-snapshot reads inside an active transaction
3. keeps runtime ids stable because removal is still just node-property editing,
   not structural replacement

## Reusable rule

For Slate v2 node-property removal:

- do not invent a second removal op if `set_node` already owns the seam
- do not read `Editor.getSnapshot(...)` from a wrapper just to learn what the
  live draft already knows
- represent removals through the `properties/newProperties` pair and let the
  core decide which keys disappear

If property removal needs a second op family to work, the first op family is
not actually doing its job.
