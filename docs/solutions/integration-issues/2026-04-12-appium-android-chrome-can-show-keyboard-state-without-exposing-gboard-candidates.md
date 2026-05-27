---
date: 2026-04-12
problem_type: integration_issue
component: tooling
root_cause: wrong_api
title: Appium Android Chrome can show keyboard state without exposing Gboard candidates
tags:
  - slate-browser
  - appium
  - android
  - chrome
  - gboard
  - autocorrect
severity: high
---

# Appium Android Chrome can show keyboard state without exposing Gboard candidates

## What happened

The remaining Android legacy row was no longer structural editing.

It was real keyboard-feature behavior:

- autocorrect
- glide typing
- voice input

Direct local probes on the Android Chrome emulator showed that the stack is only
half-open:

- Appium can load the real Slate route
- Appium can focus the editor
- `/appium/device/is_keyboard_shown` returns `true`
- Appium exposes both `CHROMIUM` and `NATIVE_APP`

But the transport still does not expose the part that matters for autocorrect:

- `NATIVE_APP` element lookup returns zero
  `com.google.android.inputmethod.latin` nodes
- suggestion/candidate lookup returns zero nodes
- Appium native source only exposes Chrome, not the visible Gboard candidate
  strip

## What still failed

Hardware-style key injection is not an honest autocorrect proof here.

Typing `cant` plus space through Android keycodes produced literal text:

- `blockTexts: "cant "`
- recent events were plain `beforeinput:insertText:*`
- no correction was accepted

That proves the local transport can still drive literal text insertion while
missing the real candidate-acceptance path.

An ADB `uiautomator dump` follow-up with the keyboard visible also failed
cleanly enough to be unhelpful here, returning only `Killed` instead of a full
IME tree.

## Why this matters

This separates two different claims:

1. Android Chrome editor input is locally provable for ordinary typing and the
   structural rows
2. Android keyboard-feature behavior is **not** locally provable on the current
   Appium + Chrome stack

Do not treat visible keyboard state as proof that you can inspect or drive
Gboard suggestions.

## Reusable rule

For Android keyboard-feature parity on this repo:

- treat `keyboardShown: true` as setup truth only
- treat `NATIVE_APP` availability as setup truth only
- if Gboard candidate nodes are absent and keycodes only yield literal text,
  mark the row `tooling-blocked`
- do not pretend hardware keycodes are a substitute for autocorrect, glide, or
  voice-input proof
- move the remaining row to an external/manual or alternate-transport evidence
  lane
