---
date: 2026-04-03
topic: empty-block-linebreak-ime-proof-plan
status: blocked
---

# Empty-Block Line-Break IME Proof Plan

## Goal

Prove whether the empty-block line-break placeholder path can safely drop FEFF
in legacy Slate.

## Current Result

Blocked on harness quality.

## What Was Tried

- added a jsdom-based composition test on an empty editor
- manually removed the FEFF text node from the line-break placeholder while
  keeping `<br />`
- dispatched native `CompositionEvent` start/update/end on the editable root

## Why It Is Blocked

The event never reached the real `Editable` composition path in a trustworthy
way.

That means the test cannot distinguish between:

- a genuinely broken no-FEFF IME path
- and jsdom/react test limitations around contenteditable composition events

In other words:

- this is not a valid proof seam

## Honest Next Step

Do not widen legacy policy from this harness.

The next proof needs:

- a browser-capable IME harness
- or a narrower runtime seam closer to the real composition pipeline that still
  counts as meaningful evidence

Until then:

- legacy keeps FEFF on the empty-block start-of-block line-break path
- future v2 policy stays open, not proven
