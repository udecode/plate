---
date: 2026-04-11
problem_type: logic_error
component: testing_framework
root_cause: wrong_api
title: Firefox Playwright keyboard insertText can provide a stronger-than-proxy composition lane
tags:
  - slate-browser
  - firefox
  - playwright
  - composition
  - ime
severity: high
---

# Firefox Playwright keyboard insertText can provide a stronger-than-proxy composition lane

## What happened

The existing non-Chromium IME helper used a pure proxy path:

- dispatch synthetic `compositionstart`
- dispatch synthetic `compositionupdate`
- mutate the DOM directly
- dispatch synthetic `compositionend`

That was enough for a fallback lane, but it was still proxy-shaped.

On Firefox, `page.keyboard.insertText('すし')` turned out to be materially
better on the debug IME surfaces.

Observed event trail on the placeholder row:

- `compositionstart`
- `compositionupdate:すし`
- `beforeinput:insertCompositionText:すし`
- `compositionend:すし`
- `input:insertCompositionText:すし`

The same direct pattern also worked on:

- no-FEFF placeholder
- inline-edge
- void-edge

with the expected committed Slate state.

## Why this matters

This is stronger than the old proxy lane because the browser is generating the
actual input events instead of the test mutating the DOM tree by hand.

It is still not “real user IME on real hardware,” but it is no longer just
synthetic composition theater.

## Reusable rule

For Firefox Playwright IME follow-up:

- try `page.keyboard.insertText(...)` before accepting that proxy is the ceiling
- if the debug surface shows `beforeinput:insertCompositionText:*` and
  `input:insertCompositionText:*`, count that as stronger-than-proxy evidence
- keep the old proxy helper as a backstop for WebKit or other browsers that do
  not expose the same behavior
