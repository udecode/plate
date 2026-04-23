---
title: V2 read-only should stay app-level until the editor surface owns it
date: 2026-04-06
category: docs/solutions/logic-errors
module: Slate v2 read-only surface
problem_type: logic_error
component: documentation
symptoms:
  - "A quick `readOnly` prop added to the current editor surface still rendered `contenteditable=true` and `role=textbox`, so the package contract lied"
  - "The current plain-text editorial family proved green faster than the read-only side because the editor-facing surface is still designed around active editing"
  - "Keeping the broken prop would have made the replacement matrix look greener than the actual package seam deserved"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - slate-v2
  - slate-react-v2
  - read-only
  - editorial-family
  - package-boundary
---

# V2 read-only should stay app-level until the editor surface owns it

## Problem

While widening the editorial family in the replacement matrix, `plaintext`
proved quickly.

`read-only` did not.

The tempting move was to force a `readOnly` prop onto the current `Editable`
surface and call the family covered.

That would have been a lie.

## Symptoms

- The current `read-only` matrix row still saw `contenteditable="true"`.
- The same surface still exposed `role="textbox"`.
- A supposedly read-only package seam still behaved like an active editing root.

## What Didn't Work

- Treating `readOnly` as a tiny prop-threading change.
  The public contract looked small, but the behavior was not honestly packaged.
- Trying to keep the new prop once the matrix showed it still rendered as an
  editable surface.
  That would have preserved fake progress.

## Solution

Remove the fake package contract and keep the current read-only surface
app-level.

The winning move was:

- keep `Editable` and `EditableBlocks` as active editing surfaces
- add a current `read-only` example surface built from existing render
  primitives
- prove that surface in the replacement matrix

That keeps the replacement story honest:

- the read-only family is covered
- but it is covered by a current surface built on the runtime primitives
- not by a prematurely stabilized package prop

## Why This Works

This preserves the real package boundary.

The current `slate-react` editor-facing surface is still optimized around
active editing:

- selection ownership
- clipboard ownership
- active DOM reconciliation

If a supposedly read-only option still exposes the active editing DOM contract,
the package is claiming more than it owns.

An app-level current surface is better than a lying package prop.

## Prevention

- When widening a family, prove the DOM contract before calling a new package
  prop “done”.
- If the behavior is green only through app composition, document it as
  app-level current surface, not package-level stable API.
- Do not keep a broken convenience prop just because the roadmap wants the
  family to move.

## Related Issues

- [2026-04-06-v2-html-paste-formatting-should-stay-app-owned-on-explicit-inline-elements.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-06-v2-html-paste-formatting-should-stay-app-owned-on-explicit-inline-elements.md)
- [2026-04-04-v2-editable-blocks-can-be-the-first-public-editor-surface.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-blocks-can-be-the-first-public-editor-surface.md)
