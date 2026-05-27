---
title: Slate runtime-backed refs should not pretend to be legacy transformable structs
type: solution
date: 2026-04-09
status: completed
category: developer-experience
module: slate-v2
tags:
  - slate
  - slate-v2
  - refs
  - range-ref
  - path-ref
  - point-ref
  - docs
  - api-truth
---

# Problem

The ref docs still claimed:

- `PathRef.transform(...)`
- `PointRef.transform(...)`
- `RangeRef.transform(...)`

But the current ref model is not the old mutable helper-struct design.

`pathRef` is runtime-id backed.
`pointRef` rides the collapsed range-ref seam.
`rangeRef` has custom editor-owned rebasing for fragment insertion and other
current-proof cases.

# Root Cause

Legacy docs survived a runtime model change.

Static transform helpers made sense when refs were dumb mutable containers that
the caller could patch op-by-op.

They do not map cleanly onto current refs, because the editor owns the real
rebasing semantics.

# Solution

Cut the fake static helper claim from the docs.

Document the actual public contract instead:

- create refs through `Editor.*Ref(...)`
- read `current`
- call `unref()`
- let the editor own updates

# Why This Works

This is a better cut than fake parity.

Shipping a `RangeRef.transform(...)` that cannot honestly mirror the editor's
current rebasing rules would be worse than having no helper at all.

# Prevention

- Do not restore legacy helper names just because the docs remember them.
- If a runtime handle is editor-owned, document it as editor-owned.
- If a legacy helper cannot match current semantics without lying, cut the
  claim and say so plainly.
