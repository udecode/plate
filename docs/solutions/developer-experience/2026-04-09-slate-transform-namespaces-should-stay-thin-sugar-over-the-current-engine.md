---
title: Slate transform namespaces should stay thin sugar over the current engine
type: solution
date: 2026-04-09
status: completed
category: developer-experience
module: slate-v2
tags:
  - slate
  - slate-v2
  - transforms
  - public-surface
  - architecture
  - applyBatch
---

# Problem

The docs and architecture notes still talked like `Transforms.applyBatch(...)`,
`Transforms.transform(...)`, and the legacy transform namespace objects were part
of the public surface, but the actual v2 barrel only exported a flat
`Transforms` object.

# Root Cause

The engine recovery work focused on the actual transform behavior first.

That was correct, but it left the public helper grouping half-recovered:

- behavior existed
- public grouping did not

# Solution

Restore the namespace objects, but keep them thin:

- `GeneralTransforms`
- `NodeTransforms`
- `SelectionTransforms`
- `TextTransforms`

Do **not** reintroduce a second transform engine behind those names.

`applyBatch(...)` should stay one outer transaction over ordered
`editor.apply(...)` calls, and `transform(...)` should stay direct
`editor.apply(...)` sugar.

# Why This Works

It recovers the public ergonomics without reintroducing architectural drift.

Consumers get the expected grouping.
The engine still has one real implementation path.

# Prevention

- Namespace recovery is good when it is just grouping.
- Namespace recovery is bad when it forks behavior.
- If a helper object comes back, make sure it rides the same core engine, not a
  shadow implementation.
