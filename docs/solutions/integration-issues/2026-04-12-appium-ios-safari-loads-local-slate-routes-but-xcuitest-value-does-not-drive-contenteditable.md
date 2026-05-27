---
date: 2026-04-12
problem_type: integration_issue
component: tooling
root_cause: wrong_api
title: Appium iOS Safari loads local Slate routes but XCUITest value does not drive contenteditable
tags:
  - slate-browser
  - appium
  - ios
  - safari
  - contenteditable
severity: high
---

# Appium iOS Safari loads local Slate routes but XCUITest value does not drive contenteditable

## What happened

The current `agent-browser` iOS provider became unreliable on local Next dev
example routes:

- routes opened
- but the page often exposed only the Next shell
- `#placeholder-ime` never appeared

Direct Appium + XCUITest Safari was a better transport for setup truth:

- it loads `/examples/placeholder?debug=1`
- it loads `/examples/placeholder-no-feff?debug=1`
- it can read the real editor HTML and body text from those routes

So Appium iOS is a better setup transport than the current `agent-browser` iOS
path here.

## What still failed

Typing through the standard WebDriver element value path is still red on iOS
Safari contenteditable surfaces.

Observed shape:

- repeated `input:undefined:[null]`
- `blockTexts` stays empty
- `slateSelection` stays `0.0:0|0.0:0`

That happened on both:

- FEFF placeholder
- no-FEFF placeholder

Additional follow-up probes did not unlock a better primitive:

- W3C key actions against the focused Safari page had no effect
- Appium XCUITest `mobile: keys` / `/wda/keys` against the focused Safari page
  also had no effect
- switching to `NATIVE_APP` after focus showed a real native context, but no
  `XCUIElementTypeKeyboard` or `XCUIElementTypeKey` nodes appeared
- even a native coordinate tap translated from the web element rect through
  `mobile: calibrateWebToRealCoordinatesTranslation` still did not surface the
  iOS keyboard

## Why this matters

This cleanly separates two iOS problems:

1. `agent-browser` iOS route/render reliability
2. Appium/XCUITest contenteditable input semantics

They are not the same failure.

Upstream follow-up:

- [appium/appium-xcuitest-driver#2803](https://github.com/appium/appium-xcuitest-driver/issues/2803)

## Reusable rule

For local iOS Safari proof on this repo:

- use direct Appium iOS when you need trustworthy route/setup truth
- do not treat XCUITest `element/value` as trustworthy contenteditable typing
  proof
- do not assume native-context tapping will surface an iPhone keyboard here just
  because `NATIVE_APP` exists; verify the keyboard tree first
- if Appium setup is green but typing is red, record the lane as
  `setup-green / behavior-red`
