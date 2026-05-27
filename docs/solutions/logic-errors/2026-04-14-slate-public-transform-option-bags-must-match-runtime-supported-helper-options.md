---
date: 2026-04-14
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate public transform option bags must match runtime-supported helper options
tags:
  - slate-v2
  - transforms
  - typescript
  - api
  - docs
  - ledgers
severity: medium
---

# Slate public transform option bags must match runtime-supported helper options

## What happened

`wrapNodes(...)`, `unwrapNodes(...)`, and `liftNodes(...)` still accepted broader
helper options in the runtime:

- `match`
- `mode`
- `split`
- `voids`

But the exported TypeScript option bags had been narrowed to mostly `{ at? }`.

That made the public surface lie in three places at once:

- TS users could not call supported behavior cleanly
- docs started documenting the narrower cut
- exact ledgers had to choose between fake green and fake skip

## What fixed it

Recover the public option bags to the runtime-supported shape instead of
pretending the hidden options are gone.

For this slice that meant:

- widen `WrapNodesOptions`
- widen `UnwrapNodesOptions`
- widen `LiftNodesOptions`
- add direct contract tests that call those recovered options through
  `Transforms.*`
- re-align docs and ledgers in the same turn

## Why this works

The engine already knew how to honor those options.

The real drift was at the public boundary, not in the transform bodies.

Once the exported types matched the callable runtime again, the docs and ledger
could tell the truth without inventing fake narrow seams.

## Reusable rule

For Slate public transform recovery work:

- do not leave runtime-supported helper options hidden behind narrower exported
  types
- if the runtime supports an option and the behavior is still part of the live
  claim, export it, document it, and ledger it as such
- if an option is truly outside the live contract, remove the behavior or mark
  the row `explicit-skip`; do not keep secret support and call it a cut

Hidden option bags are how a repo ends up green in behavior, red in types, and
confused in docs all at once.
