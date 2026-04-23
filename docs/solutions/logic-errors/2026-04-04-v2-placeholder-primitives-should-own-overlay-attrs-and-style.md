---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: V2 placeholder primitives should own overlay attrs and style
tags:
  - slate-v2
  - slate-react-v2
  - placeholder
  - renderer
severity: medium
---

# V2 placeholder primitives should own overlay attrs and style

## What happened

After packaging the v2 node-shape and text-boundary primitives, the placeholder
proof surface was still hand-rolling the overlay DOM:

- `data-slate-placeholder`
- `contentEditable={false}`
- overlay positioning and interaction styles

That was the same mistake in smaller clothes.

## What fixed it

`slate-react-v2` now owns a reusable `SlatePlaceholder` primitive:

- [slate-placeholder.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react-v2/src/components/slate-placeholder.tsx)

The v2 placeholder proof surface now consumes that primitive instead of
repeating the overlay contract inline.

## Why this works

Placeholder overlays are part of the renderer/input contract, not decorative
markup.

Their DOM attrs and styles determine whether the browser treats them as real
editable content, whether they interfere with selection, and whether they sit
on the correct visual layer.

If each proof surface hand-writes that contract, drift is inevitable.

## Reusable rule

For `slate-react-v2`:

- node shapes belong in renderer primitives
- text boundaries belong in renderer primitives
- placeholder overlays also belong in renderer primitives

If a DOM contract affects browser editing behavior, it should not live forever
inside example files.

## Related issues

- [2026-04-04-v2-renderer-primitives-should-own-node-shapes-not-example-markup.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-renderer-primitives-should-own-node-shapes-not-example-markup.md)
- [2026-04-04-v2-text-string-primitives-should-own-the-dom-text-boundary.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-text-string-primitives-should-own-the-dom-text-boundary.md)
