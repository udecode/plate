---
date: 2026-04-11
problem_type: logic_error
component: testing_framework
root_cause: wrong_api
title: WebKit Playwright insertText is a direct-input ceiling not a direct composition lane
tags:
  - slate-browser
  - webkit
  - playwright
  - composition
  - ime
severity: high
---

# WebKit Playwright insertText is a direct-input ceiling not a direct composition lane

## What happened

After Firefox direct composition proved out through Playwright
`keyboard.insertText`, the next honest question was whether desktop WebKit could
do the same.

It cannot, at least in this environment.

On the debug IME surfaces, WebKit `insertText('すし')` produced:

- clean committed Slate text
- clean selection
- `beforeinput:insertText:すし`

But it did **not** produce:

- `beforeinput:insertCompositionText:*`
- `input:insertCompositionText:*`

Even wrapping it with synthetic `compositionstart` / `compositionend` did not
upgrade the browser event shape.

## Why this matters

This is better than nothing:

- it proves the WebKit row can commit text cleanly on the direct browser path

But it is still not the same thing as a direct composition proof lane.

So for WebKit:

- direct input proof exists
- direct composition proof does not
- proxy composition remains the honest ceiling in this environment

## Reusable rule

For desktop WebKit Playwright IME work:

- treat `keyboard.insertText` as a useful direct-input probe
- do not market it as direct composition proof
- keep the browser-level proxy composition lane until a browser path emits
  composition-specific input events for real
