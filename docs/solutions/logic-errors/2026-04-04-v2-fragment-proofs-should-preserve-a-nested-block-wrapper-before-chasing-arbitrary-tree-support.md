---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: V2 fragment proofs should preserve a nested block wrapper before chasing arbitrary tree support
tags:
  - slate-v2
  - clipboard
  - fragment
  - nested-blocks
  - quote
severity: medium
---

# V2 fragment proofs should preserve a nested block wrapper before chasing arbitrary tree support

## What happened

After top-level block and mixed-inline fragment proofs were green, the next real
question was not “can we support arbitrary trees?”

It was:

- can fragment semantics survive the first nested block container at all?

The smallest honest case was a quote with paragraph children.

## What fixed it

The next extension stayed narrow:

- detect sibling block containers at any depth when each child block still
  matches the current simple text-block proof shape
- extract the selection as wrapped fragment content when the container is nested
- insert that wrapped fragment back into the same container shape on paste

That is enough for:

- quote wrapper preserved in the fragment
- paragraph boundaries preserved in plain text and HTML transport
- quote-to-quote paste round-trip in Chromium

## Why this works

The first nested-tree pressure is structural preservation, not arbitrary path
math.

Top-level block proofs only have to preserve sibling blocks.

Nested quote proofs add one new requirement:

- the fragment has to remember that those sibling paragraphs belonged to a quote

Once that wrapper survives extraction and insertion, the browser proof starts
measuring a real nested document shape instead of a flattened imitation.

## Reusable rule

When expanding fragment semantics:

- preserve the first real nested structural wrapper before talking about
  arbitrary tree support

If the fragment cannot round-trip one nested block container honestly, jumping
to “arbitrary trees” is just marketing.

## Related issues

- [2026-04-03-slate-v2-clipboard-boundary-proof-must-split-fragment-semantics-and-dom-transport.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-slate-v2-clipboard-boundary-proof-must-split-fragment-semantics-and-dom-transport.md)
- [2026-04-04-v2-mixed-inline-clipboard-proofs-should-span-top-level-blocks-before-broader-tree-shapes.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-mixed-inline-clipboard-proofs-should-span-top-level-blocks-before-broader-tree-shapes.md)
