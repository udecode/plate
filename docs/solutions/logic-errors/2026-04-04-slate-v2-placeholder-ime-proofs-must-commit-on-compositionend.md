---
date: 2026-04-04
problem_type: logic_error
component: testing_framework
root_cause: logic_error
title: Slate v2 placeholder IME proofs must commit on compositionend
tags:
  - slate-v2
  - slate-react-v2
  - ime
  - composition
  - zero-width
  - feff
severity: medium
---

# Slate v2 placeholder IME proofs must commit on compositionend

## What happened

The first real-browser `slate-v2` placeholder IME proof started red for the
right reason:

- the empty placeholder path rendered a FEFF zero-width span plus `<br />`
- Chromium IME composition reached the surface
- the final Slate selection and text were wrong

At first the example reconciled the editor from native `input` on every
composition step.

That looked reasonable and was wrong.

It turned transient composition text into committed document state, so the DOM
ended up as the concatenation of every IME step instead of the committed text.

## What didn't work

- Normalizing the bridge harder did not fix it.
  The bridge was not the main liar anymore.
- Replacing editor state on every `insertCompositionText` input broke the live
  composition region and appended each next IME step.
- Waiting for a final friendly `insertText` input was also bullshit on the
  clean path.
  Once transient composition input stopped forcing rerenders, Chromium finished
  with `compositionend` and no later commit-friendly `input` event.

## What fixed it

Treat transient composition and committed text as different phases:

- ignore `input` events while `event.isComposing` is true
- ignore `insertCompositionText` / `deleteCompositionText`
- reconcile the editor from DOM on `compositionend`
- still reconcile from normal `input` for non-IME text entry

That made the proof surface behave honestly:

- the DOM kept the live composition text inside the zero-width placeholder path
- the editor only committed once composition was finished
- the final browser proof landed at text `すし` with selection `0.0:2|0.0:2`

## Why this works

IME composition text is not stable document truth.

During composition, the browser owns a temporary native region and may rewrite
it several times before commit.
If the proof surface copies that transient DOM back into Slate on each step, it
destroys the composition lifecycle it is trying to measure.

`compositionend` is the first trustworthy point on this Chromium path where the
final committed text is already in the DOM and can be translated back into the
editor model without duplicating intermediate steps.

## Reusable rule

For `slate-v2` browser proof surfaces on IME-sensitive placeholder paths:

- do not commit transient composition text into the editor model
- do not assume a final commit-friendly `input` event will arrive after IME
- treat `compositionend` as the commit boundary unless the concrete browser
  proof shows a different contract

If a proof surface reconciles on every composition input, it is testing its own
bad input policy instead of the editor seam.

## Related issues

- [2026-04-03-jsdom-contenteditable-composition-is-not-a-trustworthy-ime-proof.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-jsdom-contenteditable-composition-is-not-a-trustworthy-ime-proof.md)
- [2026-04-03-legacy-line-break-placeholders-still-keep-feff-until-ime-proof-exists.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-legacy-line-break-placeholders-still-keep-feff-until-ime-proof-exists.md)
- [2026-04-04-slate-browser-playwright-helpers-must-normalize-zero-width-selection-and-wait-for-selection-sync.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-slate-browser-playwright-helpers-must-normalize-zero-width-selection-and-wait-for-selection-sync.md)
