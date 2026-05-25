---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 delete should start with exact path support only
tags:
  - slate-v2
  - delete
  - transforms
  - transactions
severity: medium
---

# Slate v2 delete should start with exact path support only

## What happened

The docs already exposed `Transforms.delete(...)`, but the package had no helper
at all.

The tempting lie was to jump straight to broad legacy delete semantics:

- point deletion
- range deletion
- unit/distance
- reverse
- hanging

That would have been more API than engine.

## What fixed it

The honest first cut stayed tiny:

- exact `{ at: Path }` support only
- reuse the existing `remove_node` seam
- work correctly inside an outer transaction against the live draft tree

## Reusable rule

For broad transform families in Slate v2:

- start from the exact case the engine already owns
- do not ship the whole legacy option bag before the semantics are real

If the helper surface is broader than the underlying engine seam, it is fake
progress.
