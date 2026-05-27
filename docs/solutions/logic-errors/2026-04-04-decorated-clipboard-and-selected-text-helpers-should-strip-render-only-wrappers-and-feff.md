---
date: 2026-04-04
problem_type: logic_error
component: testing_framework
root_cause: logic_error
title: Decorated clipboard and selected-text helpers should strip render-only wrappers and FEFF
tags:
  - slate-browser
  - clipboard
  - selected-text
  - feff
  - decorations
severity: medium
---

# Decorated clipboard and selected-text helpers should strip render-only wrappers and FEFF

## What happened

After decorated-text and mark-placeholder browser proofs landed, two browser
semantics still needed to be made honest:

- copying decorated text should serialize fragment semantics, not visual
  decoration wrappers
- selected-text reads across mark placeholders should not leak FEFF sentinels

## What fixed it

Two changes closed the gap:

1. `slate-react-v2` `Editable` now owns the browser clipboard bridge through
   `ClipboardBridge.setFragmentData(...)` and `ClipboardBridge.insertData(...)`
2. `slate-browser` `get.selectedText()` now strips FEFF from the DOM selection
   string before returning it

That made the browser proofs line up with actual editor semantics:

- decorated copy writes the `application/x-slate-v2-fragment` payload plus
  clean HTML/plain text
- rendered highlight wrappers do not leak into clipboard HTML
- selecting through a mark placeholder still reads semantic text instead of
  `"a\uFEFF"`

## Why this works

Decorations and mark placeholders are renderer details.

They can and should affect what the user sees, but they are not the fragment
semantics the editor should transport through copy/paste, and they are not
real user text.

If the helper returns wrapper DOM or FEFF sentinel text, the helper is lying
about editor semantics.

## Reusable rule

For Slate browser helpers around rich text:

- selected-text helpers should normalize out zero-width sentinels
- clipboard helpers should prove fragment semantics, not renderer wrappers

If a copy payload contains decoration-only attrs or a selected-text read
contains FEFF, the browser layer is leaking implementation detail instead of
editor truth.

## Related issues

- [2026-04-04-decorated-multi-leaf-text-needs-cumulative-offset-mapping.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-decorated-multi-leaf-text-needs-cumulative-offset-mapping.md)
- [2026-04-04-v2-text-surfaces-should-bind-runtime-ids-from-paths-and-use-zero-length-projections-for-mark-placeholders.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-text-surfaces-should-bind-runtime-ids-from-paths-and-use-zero-length-projections-for-mark-placeholders.md)
