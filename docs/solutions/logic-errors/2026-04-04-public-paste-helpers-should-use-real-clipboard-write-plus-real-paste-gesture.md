---
date: 2026-04-04
problem_type: logic_error
component: testing_framework
root_cause: logic_error
title: Public paste helpers should use real clipboard write plus real paste gesture
tags:
  - slate-browser
  - clipboard
  - paste
  - playwright
  - browser
severity: medium
---

# Public paste helpers should use real clipboard write plus real paste gesture

## What happened

The first candidate public paste helpers for `slate-browser` were synthetic
`paste` event tricks.

They looked small.
They were not honest enough for a public API.

The real question was:

- can the browser write actual clipboard content
- can the test trigger an actual paste gesture
- does Slate handle that path correctly?

In Chromium on the Slate examples, yes.

## What fixed it

The public paste helpers now use:

1. real clipboard write
   - `navigator.clipboard.writeText(...)`
   - or `navigator.clipboard.write([ClipboardItem(...)])`
2. real paste gesture
   - `ControlOrMeta+V`

That is a materially better public contract than fabricating a `paste` event
and hoping the same path runs.

## Why this matters

Clipboard architecture still stays clean:

- core/editor owns fragment meaning
- browser transport owns clipboard transport
- the public helper should prove the real transport path when it claims to test
  paste

Synthetic `paste` events are still fine for narrow legacy tests or experiments.

They are bad as the public default once a real browser path exists.

## Reusable rule

If `slate-browser/playwright` exposes paste helpers, they should:

- write to the real browser clipboard
- trigger a real paste gesture
- avoid synthetic `paste` event hacks as the public default

If the real path stops working in a browser, that helper should be considered
browser-limited there, not quietly downgraded back to fake paste.
