---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: V2 text string primitives should own the DOM text boundary
tags:
  - slate-v2
  - slate-react-v2
  - text
  - renderer
  - ime
severity: medium
---

# V2 text string primitives should own the DOM text boundary

## What happened

After the zero-width policy was split and proved in Chromium, the v2 proof
surfaces were still hand-rolling ordinary text leaves with raw
`<span data-slate-string>` markup.

That is the same low-level seam legacy Slate already treats specially.

Leaving it ad hoc in every proof surface would have been lazy and brittle.

## What fixed it

`slate-react-v2` now owns a reusable `TextString` primitive:

- [text-string.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react-v2/src/components/text-string.tsx)

It follows the same real boundary as legacy Slate:

- render a stable `<span data-slate-string>`
- keep the initial text as the React child
- repair actual DOM `textContent` in a layout effect when it drifts

The proof surfaces and matrix routes now consume that primitive instead of
hand-rolled text spans.

## Why this works

For editable text, the DOM is not a passive output target.

Native typing, composition, spellcheck, and selection can all mutate the text
node outside React’s normal one-way expectations.
If the renderer surface leaves each caller to improvise a text span, it has no
single place to correct stale DOM text or protect the actual text-node
boundary.

Owning that boundary in one primitive is the first real v2 text-renderer seam.

## Reusable rule

For `slate-react-v2` renderer/input work:

- zero-width policy belongs in a shared `ZeroWidthString`
- ordinary text-node rendering belongs in a shared `TextString`
- proof surfaces should consume those primitives instead of restating the DOM
  contract by hand

If a renderer/input seam is already repeated in multiple proof surfaces, it is
past due to become a package primitive.

## Related issues

- [2026-04-04-slate-v2-no-feff-line-break-placeholders-need-dom-owned-br-interiors.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-slate-v2-no-feff-line-break-placeholders-need-dom-owned-br-interiors.md)
- [2026-04-04-void-like-zero-width-ime-proofs-need-the-real-void-spacer-structure.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-void-like-zero-width-ime-proofs-need-the-real-void-spacer-structure.md)
