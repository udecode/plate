---
date: 2026-04-11
problem_type: logic_error
component: testing_framework
root_cause: async_timing
title: Placeholder no-FEFF delayed plain typing can still land as ushis
tags:
  - slate-react
  - slate-browser
  - placeholder-no-feff
  - zero-width
  - typing
severity: high
---

# Placeholder no-FEFF delayed plain typing could land as ushis

## What happened

The placeholder IME surfaces looked mostly green once:

- FEFF placeholder was green
- no-FEFF composition was green
- mobile placeholder / inline-edge / void-edge rows were green

There was still a real no-FEFF typing bug.

On `placeholder-no-feff?debug=1`, slow per-key plain typing could land as:

- `ushis`

instead of:

- `sushi`

This originally showed up on:

- Chromium browser proof
- packaged iOS Simulator Safari typing proof
- packaged Android Chrome emulator typing proof

Whole-string insert paths like Playwright `keyboard.insertText('sushi')` could
still look green, so they were not enough to clear this row.

## What fixed it

The useful fix was not another transport change.

`commitFromDom(...)` was trusting a stale browser caret on the very first
no-FEFF insert. When the native input event committed text but left the DOM
selection at the old offset, the editor snapshot reused that stale caret and the
next characters inserted in the wrong place.

Repairing the leading insert selection inside `commitFromDom(...)` fixed:

- Chromium delayed plain typing on the no-FEFF placeholder path
- Android direct no-FEFF typing proof

## What is still open

The current iOS `agent-browser` route is not giving row truth here because the
example route is rendering only the Next shell and never exposing the editor
node. That is a transport/rendering problem, not proof that the behavior is
still wrong on the editor side.

## What was fixed nearby

There was also a broader stale-focus replay bug on the FEFF placeholder path.

Guarding the delayed focus restore so it does not replay a stale selection after
typing has already moved the model caret fixed the FEFF slow-typing row.

That did **not** close the no-FEFF row.

## Why this matters

Do not let “IME composition green” or “whole-string insert green” fool you into
calling the no-FEFF typing path closed too early.

The no-FEFF line-break placeholder is still its own behavior-bearing row.

## Reusable rule

For no-FEFF placeholder proof:

- test delayed per-key typing, not just composition or whole-string insert
- if the row lands as `ushis`, treat it as a real product bug and debug the
  first-insert selection path
- after fixing the editor path, re-separate behavior truth from transport truth:
  browser/mobile typing may be green while a specific transport is still blocked
