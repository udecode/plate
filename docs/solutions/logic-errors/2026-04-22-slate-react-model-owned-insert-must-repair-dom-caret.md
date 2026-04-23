---
title: Slate React model-owned insert must repair the DOM caret
date: 2026-04-22
category: docs/solutions/logic-errors
module: Slate React
problem_type: logic_error
component: frontend_stimulus
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - slate-react
  - caret
  - selection
  - contenteditable
  - browser-input
---

# Slate React model-owned insert must repair the DOM caret

## Problem

Typing through the browser at the end of a rich-text block updated the Slate
model correctly, but the visible browser caret could render in the wrong place.

The missed case was inserting before trailing punctuation in a custom-rendered
leaf. The model selection moved after the inserted text, but the DOM selection
stayed collapsed on a wrapper span at offset `0`, so Chrome painted the caret
before the inserted character.

## Why model-only tests missed it

The Slate selection and text were both correct:

- model text contained the inserted character
- model selection moved to the expected offset

But the browser selection was not canonical:

- anchor node was an element wrapper, not a text node
- anchor offset was `0`
- the visual caret painted before the inserted text

Model selection assertions and text assertions cannot catch this. Browser tests
must also assert the DOM caret node and offset, or compare caret rectangles.

## Fix

For model-owned `insertText` in `Editable`, schedule a DOM selection repair
after React commits the updated text.

Also avoid treating a collapsed wrapper-element DOM selection as good enough
just because it maps back to the same Slate range. If the browser caret is on a
wrapper instead of a text node, force the DOM selection to the canonical DOM
range for the current Slate selection.

## Prevention

- Add browser rows that assert text, model selection, and DOM caret location.
- Include insertion before punctuation and insertion inside a text leaf, not
  only append-at-end cases.
- Treat element-wrapper collapsed selections as suspicious after model-owned
  text insertion.
- Rebuild `slate-react` before Playwright rows that consume package `dist`;
  source-mode/dev-server proof alone can hide stale package output.
