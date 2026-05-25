---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: V2 renderer primitives should own node shapes not example markup
tags:
  - slate-v2
  - slate-react-v2
  - renderer
  - dom
  - zero-width
severity: medium
---

# V2 renderer primitives should own node shapes not example markup

## What happened

Once the browser proofs settled the zero-width policy, the remaining v2 proof
surfaces were still hand-writing the low-level DOM contract:

- `data-slate-node="text"`
- `data-slate-leaf`
- `data-slate-node="element"`
- `data-slate-spacer`

That is not a proof anymore.
That is a renderer layer pretending not to be one.

## What fixed it

`slate-react-v2` now owns the minimal renderer primitives directly:

- [SlateText](/Users/zbeyens/git/slate-v2/packages/slate-react-v2/src/components/slate-text.tsx)
- [SlateLeaf](/Users/zbeyens/git/slate-v2/packages/slate-react-v2/src/components/slate-leaf.tsx)
- [SlateElement](/Users/zbeyens/git/slate-v2/packages/slate-react-v2/src/components/slate-element.tsx)
- [SlateSpacer](/Users/zbeyens/git/slate-v2/packages/slate-react-v2/src/components/slate-spacer.tsx)
- [TextString](/Users/zbeyens/git/slate-v2/packages/slate-react-v2/src/components/text-string.tsx)
- [ZeroWidthString](/Users/zbeyens/git/slate-v2/packages/slate-react-v2/src/components/zero-width-string.tsx)

The v2 proof surfaces and matrix routes now consume those primitives instead of
restating the DOM shape by hand.

## Why this works

The browser proofs were valuable because they identified which DOM details were
real contracts and which were accidental.

Once that line is clear, the right move is not to keep copy-pasting the “good”
markup into examples.
The right move is to package the good markup into the smallest reusable
renderer stack and make examples depend on that.

That gives v2 a real renderer/input layer instead of a pile of increasingly
clever demo files.

## Reusable rule

For `slate-react-v2`:

- if a DOM shape is required by more than one proof surface, it belongs in a
  package primitive
- examples should prove package primitives, not replace them

Proof files are where you discover renderer contracts.
They are not where renderer contracts should keep living forever.

## Related issues

- [2026-04-04-v2-text-string-primitives-should-own-the-dom-text-boundary.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-text-string-primitives-should-own-the-dom-text-boundary.md)
- [2026-04-04-void-like-zero-width-ime-proofs-need-the-real-void-spacer-structure.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-void-like-zero-width-ime-proofs-need-the-real-void-spacer-structure.md)
