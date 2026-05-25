---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: V2 editable roots should own mount selection sync and DOM commit
tags:
  - slate-v2
  - slate-react-v2
  - editable
  - selection
  - dom
severity: medium
---

# V2 editable roots should own mount selection sync and DOM commit

## What happened

Even after the text and element primitives were packaged, every v2 proof surface
was still hand-rolling the same root loop:

- mount the root into `slate-dom-v2`
- sync DOM selection from snapshot selection
- initialize collapsed selection on focus
- listen to native `input` / `compositionend`
- commit DOM text back into the editor snapshot

That was already the beginning of an `Editable`.

## What fixed it

`slate-react-v2` now owns a minimal `Editable` root:

- [editable.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react-v2/src/components/editable.tsx)

The v2 placeholder, inline-edge, and void-edge proof surfaces now use that
component instead of each keeping a private reconciliation loop.

## Why this works

Root mounting, selection sync, and DOM commit are not example glue.
They are the browser-facing contract of an editor surface.

If the package leaves that logic in example files, then the examples are still
secretly the source of truth for the editable runtime.

Packaging the root loop is what turns the renderer stack into an actual
editor-facing surface instead of a pile of useful pieces.

## Reusable rule

For `slate-react-v2`:

- once multiple proof surfaces duplicate the same root mount/selection/input
  loop, package it as an editable surface
- examples should prove the editable surface, not reimplement it

If the browser contract lives in three example files, it does not live in the
package yet.

## Related issues

- [2026-04-04-v2-editable-text-primitives-should-compose-leaf-text-zero-width-and-placeholder.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-text-primitives-should-compose-leaf-text-zero-width-and-placeholder.md)
- [2026-04-04-v2-element-primitives-should-compose-element-and-void-contracts.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-element-primitives-should-compose-element-and-void-contracts.md)
