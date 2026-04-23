---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: V2 text surfaces should bind runtime ids from paths and use zero-length projections for mark placeholders
tags:
  - slate-v2
  - slate-react-v2
  - projections
  - mark-placeholder
  - runtime-id
severity: medium
---

# V2 text surfaces should bind runtime ids from paths and use zero-length projections for mark placeholders

## What happened

After the first decorated-text proof went green, two remaining bits of renderer
truth were still too manual:

- every proof surface still had to derive `text` and `runtimeId` from a path
- mark placeholders still looked like a special case instead of “collapsed
  projected text”

That was more boilerplate than signal.

## What fixed it

`EditableText` now supports:

- `path={[...]}`
  so it can derive both `text` and `runtimeId` from the committed snapshot
- zero-length projection slices
  rendered as `data-slate-mark-placeholder` zero-width leaves

That let the browser proof render a mark placeholder from a collapsed projected
range and then compose text through it without any route-local runtime-id glue.

## Why this works

A collapsed projected range already contains the right semantic fact:

- same text node
- exact insertion point
- no visible range length

That is exactly what a mark placeholder is.

So the renderer does not need a second model for it.
It just needs to treat zero-length slices as a renderable leaf at the correct
boundary.

Likewise, if a text surface already knows the Slate path it is rendering, it
should be able to find its own runtime id and text content.
Making every caller do that work is just leaking internals.

## Reusable rule

For `slate-react-v2` text surfaces:

- path-based binding should be the default ergonomic lane
- zero-length projected ranges should be the default mark-placeholder lane

If callers have to pass both path and runtime id for the same text node, or if
collapsed ranges need a separate rendering model, the package surface is still
too low-level.

## Related issues

- [2026-04-04-v2-editable-text-should-split-leaves-from-projection-slices.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-text-should-split-leaves-from-projection-slices.md)
- [2026-04-04-decorated-multi-leaf-text-needs-cumulative-offset-mapping.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-decorated-multi-leaf-text-needs-cumulative-offset-mapping.md)
