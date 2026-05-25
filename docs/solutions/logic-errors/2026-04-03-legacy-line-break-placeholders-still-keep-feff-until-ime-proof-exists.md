---
date: 2026-04-03
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Legacy line-break placeholders still keep FEFF until IME proof exists
tags:
  - slate-react
  - zero-width
  - feff
  - br
  - ime
severity: medium
---

# Legacy line-break placeholders still keep FEFF until IME proof exists

## What happened

After proving that the v2 DOM bridge already tolerates `<br>`-style line-break
placeholders, the tempting next move was to drop FEFF from legacy
`isLineBreak` rendering too.

That was too broad.

The evidence only proved:

- renderer shape
- basic focus / selection sanity

It did **not** prove IME composition safety on the empty-block start-of-block
path.

## What fixed it

The honest legacy policy stays conservative:

- line-break placeholders still render `<br />`
- FEFF is still retained on the empty-block start-of-block line-break path
- non-linebreak zero-width cases also keep FEFF

That keeps legacy behavior aligned with the known IME-risk comments while still
making the future policy line explicit.

## What this means

The larger split still stands, but only as a **future v2 renderer policy**:

- the bridge already supports `<br>` line-break placeholders
- the remaining unknown is IME behavior on that path

So the next proof is not “can the bridge handle `<br>`?”

It is:

- can empty-block IME composition work without FEFF on the line-break path?

## Reusable rule

Do not widen a zero-width rendering policy beyond the evidence.

If the proof only covers DOM shape and selection sanity, keep the
IME-sensitive path conservative until IME behavior is proved directly.
