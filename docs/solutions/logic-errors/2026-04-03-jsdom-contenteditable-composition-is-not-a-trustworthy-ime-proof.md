---
date: 2026-04-03
problem_type: logic_error
component: documentation
root_cause: inadequate_documentation
title: jsdom contenteditable composition is not a trustworthy IME proof
tags:
  - slate-react
  - ime
  - composition
  - jsdom
  - testing
severity: medium
---

# jsdom contenteditable composition is not a trustworthy IME proof

## What happened

The next exact seam after the zero-width renderer policy split was supposed to
be simple:

- remove FEFF from the empty-block line-break placeholder path
- prove IME composition still works

We tried to prove it with a jsdom test:

- render an empty editor
- strip the FEFF text node from the line-break placeholder
- dispatch native `CompositionEvent` start/update/end on the editable root

## Why this was not good enough

The event never reached the real `Editable` composition path in a trustworthy
way.

That means a failing jsdom composition test here cannot tell you whether:

- the no-FEFF path is actually broken
- or jsdom/react contenteditable composition is just not simulating the browser
  path honestly

That is a fake proof seam.

## Reusable rule

For IME work in Slate:

- do not treat jsdom contenteditable composition as authoritative unless you
  have already proved the event path is really reaching the same runtime seam
  the browser uses

If the harness cannot clear that bar, keep policy conservative and move to a
real-browser IME proof instead of pretending a unit test settled it.
