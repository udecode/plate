---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Void-like zero-width IME proofs need the real void spacer structure
tags:
  - slate-v2
  - ime
  - zero-width
  - void
  - feff
severity: medium
---

# Void-like zero-width IME proofs need the real void spacer structure

## What happened

After the `slate-v2` line-break and inline-edge proofs turned green, the next
behavior seam was the FEFF-backed void-like zero-width path.

The first proof said the path was dead in Chromium IME.

That conclusion was wrong.

The proof surface was not mirroring real void rendering.

## What didn't work

The first v2 void proof put everything inside one non-editable wrapper:

- the visible void chrome
- the zero-width text leaf

That is not how real Slate voids render.

With that fake structure, Chromium never committed text and the root stayed at
`"\uFEFFvoid"`.

Treating that as a real policy conclusion would have been bullshit.

## What fixed it

The proof surface had to match the real void seam from legacy Slate:

- a `data-slate-void="true"` element
- a non-editable content wrapper for the visible void chrome
- a separate absolutely positioned `data-slate-spacer` sibling containing the
  zero-width text leaf

Once the v2 proof surface matched that structure, the FEFF-backed void-like
path passed in Chromium:

- IME committed `すし`
- final Slate selection landed at `0.0:2|0.0:2`

## Why this works

Void behavior is not just “zero-width leaf next to some UI.”

The spacer is part of the contract.
Legacy Slate routes selection and DOM behavior through a separate invisible
spacer leaf, not through the visible non-editable void content.

If the proof collapses those roles into one wrapper, it is measuring a fake DOM
shape and will happily invent fake policy limits.

## Reusable rule

For void-like browser proofs:

- do not build an ad hoc “looks close enough” wrapper
- mirror the real void seam:
  non-editable content wrapper plus separate spacer leaf
- only draw policy conclusions from proofs that clear that bar

The current honest `slate-v2` zero-width split is:

- line-break path:
  no FEFF works in Chromium with the DOM-owned `<br />` interior
- inline-edge path:
  FEFF-backed behavior is green in Chromium
- void-like path:
  FEFF-backed behavior is also green once the proof uses the real void spacer
  structure
- non-linebreak no-FEFF paths:
  still unproved and therefore still conservative

## Related issues

- [2026-04-04-slate-v2-no-feff-line-break-placeholders-need-dom-owned-br-interiors.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-slate-v2-no-feff-line-break-placeholders-need-dom-owned-br-interiors.md)
- [2026-04-04-inline-edge-ime-proofs-should-set-selection-semantically-before-composition.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-inline-edge-ime-proofs-should-set-selection-semantically-before-composition.md)
