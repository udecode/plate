---
date: 2026-04-03
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Zero-width DOM selection bridges must normalize both directions
tags:
  - slate-dom-v2
  - zero-width
  - selection
  - dom-bridge
  - ios
severity: medium
---

# Zero-width DOM selection bridges must normalize both directions

## What happened

The first `slate-dom-v2` zero-width fix only patched the write path:

- Slate point or range
- to DOM point or range

That avoided out-of-bounds native offsets when the zero-width sentinel text was
missing.

It still left the read path wrong.

If the browser handed back a native offset of `1` inside a zero-width marker,
`toSlatePoint` returned Slate offset `1` for an empty leaf.

That is garbage.

## What fixed it

The bridge needed symmetric ownership:

- `toDOMRange` clamps zero-width native offsets to actual DOM reality
- `toSlatePoint` maps zero-width native offset `1` back to Slate offset `0`

The key rule is simple:

- zero-width sentinel behavior is DOM implementation detail
- it must not leak into Slate offsets

## Reusable rule

For DOM selection bridges around zero-width leaves:

- normalize write-path offsets
- normalize read-path offsets
- test the round-trip explicitly

If only one direction is normalized, the bridge still leaks browser sentinel
semantics into the editor model.
