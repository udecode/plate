---
date: 2026-04-04
problem_type: logic_error
component: testing_framework
root_cause: async_timing
title: Inline-edge IME proofs should set selection semantically before composition
tags:
  - slate-browser
  - slate-v2
  - ime
  - selection
  - inline
severity: medium
---

# Inline-edge IME proofs should set selection semantically before composition

## What happened

After landing the shared `slate-react-v2` zero-width renderer seam, the next
behavior proof was the FEFF-backed inline-edge path in Chromium IME.

The first red looked like the inline-edge renderer was broken.

It was not.

The test was clicking the root and then composing, assuming that generic focus
put the caret on the intended zero-width leaf.
On an inline-edge surface with adjacent inline chrome, that assumption is
sloppy.

## What didn't work

- `editor.focus()` by itself was not a trustworthy setup step here.
- The root click left selection outside the intended text leaf, so composition
  never reached the path the proof was supposed to measure.
- That made the failure look like IME/renderer debt when it was really
  selection setup debt.

## What fixed it

Set the selection semantically before composition:

- click/focus the editor root
- call `editor.selection.collapse({ path: [0, 0], offset: 0 })`
- then run `editor.ime.compose(...)`

With that setup, the FEFF-backed inline-edge path passed in Chromium:

- IME committed `すし`
- final Slate selection landed at `0.0:2|0.0:2`

## Why this works

Mixed-content roots are not precise caret targets.

If the root also contains inline chrome, chips, or other non-text siblings, a
generic click does not guarantee that native selection lands inside the exact
text leaf you intend to test.

For IME proofs, that matters.
Composition is only meaningful if the browser selection is already on the
semantic editor point the proof claims to measure.

## Reusable rule

For browser proofs around inline edges or other mixed-content roots:

- do not rely on generic click focus as your selection setup
- set the intended Slate selection semantically before composition-sensitive
  assertions

If a proof is about IME on a specific text leaf, the selection setup should be
just as specific.

## Related issues

- [2026-04-04-slate-browser-playwright-helpers-must-normalize-zero-width-selection-and-wait-for-selection-sync.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-slate-browser-playwright-helpers-must-normalize-zero-width-selection-and-wait-for-selection-sync.md)
- [2026-04-04-slate-v2-no-feff-line-break-placeholders-need-dom-owned-br-interiors.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-slate-v2-no-feff-line-break-placeholders-need-dom-owned-br-interiors.md)
