---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Slate v2 no-FEFF line-break placeholders need DOM-owned BR interiors
tags:
  - slate-v2
  - slate-react-v2
  - ime
  - zero-width
  - br
  - feff
severity: medium
---

# Slate v2 no-FEFF line-break placeholders need DOM-owned BR interiors

## What happened

The next honest `slate-v2` proof after the FEFF-backed placeholder path was the
real question:

- keep the zero-width wrapper
- keep the line-break `<br />`
- remove the FEFF sentinel
- run real Chromium IME against that exact path

The first no-FEFF proof did not just fail selection or text.
It blew up the editor surface with:

- `NotFoundError: Failed to execute 'removeChild' on 'Node'`

React lost the editable entirely.

## What didn't work

- The bridge was already fine.
  This was not another “teach the bridge `<br>`” problem.
- The earlier composition fix still mattered, but it was not enough on its own.
  Committing on `compositionend` did not save the no-FEFF path while React
  still owned the inner `<br />` child.
- Treating the crash as proof that Chromium IME fundamentally needs FEFF would
  have been the wrong conclusion.

## What fixed it

The working renderer boundary was:

- React owns the zero-width wrapper span
- the no-FEFF branch renders its inner `<br />` as DOM-owned interior, not as a
  React child fiber

In the proof surface that meant:

- FEFF path:
  React renders `'\uFEFF'` plus `<br />`
- no-FEFF path:
  React renders the wrapper span, but the inner `<br />` comes from
  `dangerouslySetInnerHTML`

With that boundary in place, the no-FEFF Chromium proof passed:

- placeholder shape stayed `{ hasBr: true, hasFEFF: false, kind: 'n' }`
- IME committed `すし`
- final Slate selection landed at `0.0:2|0.0:2`
- the shared v2 renderer seam could move into `slate-react-v2`

The shared v2 component now lives in:

- [zero-width-string.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react-v2/src/components/zero-width-string.tsx)

Its current policy is intentionally split:

- line-break placeholders:
  no FEFF by default, DOM-owned `<br />` interior
- non-linebreak zero-width placeholders:
  FEFF retained

The browser matrix that pins that split lives in:

- [slate-v2-zero-width-matrix.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/slate-v2-zero-width-matrix.test.ts)

## Why this works

The browser mutates the empty line-break placeholder subtree during IME.

If React owns the exact `<br />` child the browser rewrites, React later tries
to reconcile stale child bookkeeping against a subtree the browser has already
changed.
That is where the `removeChild` crash came from.

Once React ownership stops at the wrapper boundary, the browser can mutate the
interior during composition and React can still replace the whole empty branch
cleanly when the committed text arrives.

So the important distinction is:

- FEFF is not the only thing making the path viable
- the renderer ownership boundary is part of the viability story
- the policy split belongs in a shared renderer seam, not ad hoc example markup

## Reusable rule

For `slate-v2` line-break placeholder paths that drop FEFF:

- prove the path in a real browser, not jsdom theater
- keep the mutable `<br />` interior DOM-owned if the browser rewrites it
- let React own the stable wrapper boundary, not the IME-mutated child
- keep non-linebreak zero-width paths conservative until they have equivalent
  browser proof

If a no-FEFF path crashes with a React `removeChild` error, do not immediately
conclude that FEFF is mandatory.
First check whether React is owning the wrong DOM node.

## Related issues

- [2026-04-03-br-line-break-placeholders-are-already-bridge-compatible.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-br-line-break-placeholders-are-already-bridge-compatible.md)
- [2026-04-03-legacy-line-break-placeholders-still-keep-feff-until-ime-proof-exists.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-legacy-line-break-placeholders-still-keep-feff-until-ime-proof-exists.md)
- [2026-04-04-slate-v2-placeholder-ime-proofs-must-commit-on-compositionend.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-slate-v2-placeholder-ime-proofs-must-commit-on-compositionend.md)
