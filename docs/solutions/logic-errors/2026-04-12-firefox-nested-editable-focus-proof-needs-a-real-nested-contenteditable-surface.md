---
date: 2026-04-12
problem_type: logic_error
component: testing_framework
root_cause: logic_error
title: Firefox nested editable focus proof needs a real nested contenteditable surface
tags:
  - slate-react
  - slate-browser
  - firefox
  - nested-editable
  - focus
severity: medium
---

# Firefox nested editable focus proof needs a real nested contenteditable surface

## What happened

The legacy Firefox row looked scary because Slate had an explicit runtime
carve-out:

- if a nested editable gets focus in Firefox
- force focus back to the outer editor

The easy modern candidate was the current `editable-voids` example.
That was the wrong proof surface.

It only exposed normal buttons and form controls.
It did not expose a true nested `contenteditable` descendant.

That meant the row could not honestly be closed or omitted from that example.

## What fixed it

Build a real current surface with:

1. an outer current `EditableBlocks`
2. a void block
3. a nested inner `div contentEditable`

Then prove the actual Firefox behavior:

- click the nested editable
- assert `document.activeElement` is still the outer editor root

That is the real modern equivalent of the old focus-bounce comment.

## Why this matters

This row was a good example of fake omission pressure.

Without a real nested-editable surface, it looked like maybe the row was gone.
Once the surface existed, the current runtime already passed.

So the right lesson is:

- do not omit a legacy browser row just because the current example set is too
  weak to expose it

## Reusable rule

For legacy browser quirks tied to a specific DOM shape:

- build the missing DOM shape first
- only then decide proof vs omission
- if the current runtime already passes on the real shape, close the row and
  move on
