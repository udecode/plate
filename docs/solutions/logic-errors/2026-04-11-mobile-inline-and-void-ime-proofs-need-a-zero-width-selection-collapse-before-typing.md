---
date: 2026-04-11
problem_type: logic_error
component: testing_framework
root_cause: async_timing
title: Mobile inline and void IME proofs need a zero-width selection collapse before typing
tags:
  - slate-browser
  - agent-browser
  - appium
  - inline-edge
  - void-edge
  - zero-width
  - selection
severity: high
---

# Mobile inline and void IME proofs need a zero-width selection collapse before typing

## What happened

After mobile placeholder input went green, the next honest rows were
`inline-edge` and `void-edge`.

Plain root click plus typing was not enough.

On the debug surfaces:

- `beforeinput` fired
- mutation fired
- but `blockTexts` stayed empty
- `placeholderShape` stayed on the zero-width placeholder
- `slateSelection` stayed `none`

Desktop Chromium reproduced the same failure shape when using only:

- click editor root
- press a key

So this was not a mobile-only transport hallucination.
It was a missing selection-setup primitive for those edge rows.

## What fixed it

Before typing, collapse DOM selection onto the leading text leaf inside the
first `[data-slate-node="text"]` owner.

The winning primitive was:

1. click the editor root
2. `eval` / `execute` a DOM-selection script
3. type text
4. read back the debug JSON

The critical detail:

- when the leaf is zero-width-backed, collapse at offset `1`, not `0`

That matches the same sentinel-aware logic already needed in the Playwright
selection helpers.

## Why this matters

`inline-edge` and `void-edge` are not just “placeholder but elsewhere”.

They are selection-boundary rows.
If the proof runner does not establish the right DOM selection first, the input
lane can look broken even when the editor is fine.

## Reusable rule

For mobile/browser proof rows that start on a zero-width inline or void edge:

- do not trust root click alone
- establish DOM selection explicitly before typing
- collapse onto the leading zero-width text leaf at offset `1`
- only then treat typing and debug readback as meaningful proof
