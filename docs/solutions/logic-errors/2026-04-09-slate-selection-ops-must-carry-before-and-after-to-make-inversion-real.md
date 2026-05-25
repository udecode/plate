---
title: Slate selection ops must carry before and after to make inversion real
type: solution
date: 2026-04-09
status: completed
category: logic-errors
module: slate-v2
tags:
  - slate
  - slate-v2
  - operations
  - selection
  - inverse
  - history
  - utility-surface
---

# Problem

`Operation.inverse(...)` was part of the documented utility surface, but
`set_selection` in `slate-v2` only carried the next selection:

```ts
{ type: 'set_selection', selection: next }
```

That makes inversion fake. There is no previous state to swap back to.

# Root Cause

The transaction engine had narrowed `set_selection` for convenience, but the
public operation utility layer still implied true inversion semantics.

That mismatch is small, but it is a real contract bug.

# Solution

Restore `set_selection` to carry both sides:

```ts
{
  type: 'set_selection',
  properties: previous,
  newProperties: next,
}
```

Then:

- build all internal selection ops through one helper
- apply `newProperties` in the core reducer
- let `Operation.inverse(...)` swap the two sides directly

# Why This Works

Selection inversion becomes honest again because the operation itself now owns
the full state transition.

It also gives history/debug tooling a better operation record instead of a
write-only next-state blob.

# Prevention

- If an operation claims to be invertible, it must carry enough information to
  actually invert.
- Do not collapse an operation payload just because the reducer only needs the
  destination state.
- Small utility layers rot fast when nobody asks whether the data shape still
  matches the claim.
