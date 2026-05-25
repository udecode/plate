---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: V2 editable text primitives should compose leaf text zero-width and placeholder
tags:
  - slate-v2
  - slate-react-v2
  - text
  - zero-width
  - placeholder
severity: medium
---

# V2 editable text primitives should compose leaf text zero-width and placeholder

## What happened

Even after `TextString`, `SlateText`, `SlateLeaf`, `ZeroWidthString`, and
`SlatePlaceholder` existed, the proof surfaces were still assembling the same
composition by hand:

- text node wrapper
- leaf wrapper
- text branch vs zero-width branch
- optional placeholder overlay

That was one layer too low.

## What fixed it

`slate-react-v2` now owns an `EditableText` primitive:

- [editable-text.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react-v2/src/components/editable-text.tsx)

It composes:

- `SlateText`
- `SlateLeaf`
- `TextString`
- `ZeroWidthString`
- optional `SlatePlaceholder`

The v2 placeholder, inline-edge, void-edge, and matrix proof surfaces now use
that one component instead of restating the same branch logic over and over.

## Why this works

At this point the repeated contract was no longer “a few useful helpers.”
It was already a minimal text renderer.

If every proof surface still decides for itself how to branch between text,
zero-width, and placeholder DOM, then the package primitives exist but the real
contract still lives in example files.

`EditableText` moves that branch logic into the package where it belongs.

## Reusable rule

For `slate-react-v2`:

- once a renderer contract has both low-level primitives and repeated branch
  logic, package the branch logic too
- examples should assemble behavior from package surfaces, not from piles of
  package internals

If three or more proof surfaces are copying the same “if text else zero-width
plus maybe placeholder” shape, you already have a missing component.

## Related issues

- [2026-04-04-v2-text-string-primitives-should-own-the-dom-text-boundary.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-text-string-primitives-should-own-the-dom-text-boundary.md)
- [2026-04-04-v2-placeholder-primitives-should-own-overlay-attrs-and-style.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-placeholder-primitives-should-own-overlay-attrs-and-style.md)
- [2026-04-04-v2-renderer-primitives-should-own-node-shapes-not-example-markup.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-renderer-primitives-should-own-node-shapes-not-example-markup.md)
