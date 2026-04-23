---
date: 2026-04-04
problem_type: logic_error
component: testing_framework
root_cause: async_timing
title: Slate browser Playwright helpers must normalize zero-width selection and wait for selection sync
tags:
  - slate-browser
  - playwright
  - zero-width
  - selection
  - clipboard
severity: medium
---

# Slate browser Playwright helpers must normalize zero-width selection and wait for selection sync

## What happened

The first real `slate-browser` Playwright tranche exposed two fake assumptions
at once:

- the helper that claimed to return a Slate selection was just echoing native
  DOM offsets
- the helper that tried to prove clipboard copy contracts fired too early after
  `Cmd/Ctrl+A`

On the empty placeholder path, the browser caret really sits inside the FEFF
marker at native offset `1`.

That is fine for DOM assertions.
It is wrong for Slate assertions.

On the rich copy path, DOM selection looked expanded immediately, but Slate’s
copy handler still needed a short settle before synthetic `copy` captured the
real payload.

## Why this mattered

Without normalization, `assertSelection(...)` lies about Slate semantics on the
exact zero-width path the browser framework is supposed to pin.

Without the settle, synthetic copy tests look random:

- DOM selection appears ready
- the copy payload is still empty
- the test blames clipboard transport when the real problem is selection sync

That is how bad helper APIs create bullshit failures.

## What fixed it

1. Keep two different helpers with two different truths:
   - `assertDomSelection(...)` returns raw browser offsets
   - `assertSelection(...)` maps FEFF zero-width native offset `1` back to
     Slate offset `0`
2. Treat `selectAllInEditor(...)` as asynchronous editor work, not an instant
   fact:
   - wait until selection is semantically ready
   - then give Slate a short settle before firing selection-sensitive synthetic
     copy assertions
3. Keep the clipboard contract test on DOM transport:
   - select real content in the editor
   - dispatch a synthetic `copy` event with an instrumented `clipboardData`
     sink
   - assert the HTML/plaintext payload written by Slate

## Reusable rule

For Slate browser helpers:

- DOM selection helpers should expose raw native offsets
- Slate selection helpers must normalize zero-width marker offsets
- synthetic copy tests must wait for editor selection sync after
  `Cmd/Ctrl+A`

If a helper returns native FEFF offset `1` and calls it a Slate selection, or
fires copy immediately after select-all, the helper is the bug.
