---
date: 2026-04-11
problem_type: logic_error
component: testing_framework
root_cause: logic_error
title: Mobile placeholder proof failures should be falsified with direct desktop keypress before editing slate-react
tags:
  - slate-browser
  - slate-react
  - placeholder
  - playwright
  - agent-browser
  - appium
  - contenteditable
severity: high
---

# Mobile placeholder proof failures should be falsified with direct desktop keypress before editing slate-react

## What happened

The mobile placeholder-input proof lanes looked like a runtime bug:

- iOS had reported polluted placeholder text after typing
- Android had reported the same kind of bad readback
- the first instinct was to keep digging inside `slate-react`

That was the wrong first move.

A direct Chromium proof on the same `placeholder?debug=1` surface showed the
runtime seam was already clean:

- focus `#placeholder-ime`
- press a real key through Playwright
- read `#placeholder-ime-debug-json`

The debug output came back as:

- `blockTexts: "s"`
- `placeholderShape: null`
- `slateSelection: "0.0:1|0.0:1"`

So the editor was not swallowing placeholder text on the normal browser path.

At the same time, the failing `slate-react` unit test turned out to have a bad
fixture assumption:

- the empty placeholder DOM shape does **not** contain a
  `[data-slate-string="true"]` node
- it contains zero-width markup inside the text host

Fixing the test to mutate the text host directly made the package test green
again without inventing another editor patch.

## Why this matters

When mobile automation reports placeholder pollution, there are two very
different possibilities:

1. the editor DOM-commit seam is broken
2. the transport input path is lying or unstable

If you skip the direct desktop falsifier, you can waste time “fixing”
`slate-react` when the problem is really the transport or the test fixture.

## Reusable rule

For placeholder/input debugging on these proof surfaces:

- first run a direct desktop keypress on the exact same debug surface
- if desktop returns clean `blockTexts`, `placeholderShape`, and selection,
  stop blaming `slate-react`
- then inspect the transport semantics or the proof harness instead
- for empty placeholder unit tests, mutate the `[data-slate-node="text"]` host
  directly rather than assuming a `[data-slate-string="true"]` node exists
