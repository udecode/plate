---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 range liftNodes should rewrite selection from the lifted child span
tags:
  - slate-v2
  - liftNodes
  - selection
  - transforms
severity: medium
---

# Slate v2 range liftNodes should rewrite selection from the lifted child span

## What happened

Once exact-path `liftNodes(...)` was real, the next structural follow-on was
top-level wrapper-child range/current-selection lifting.

The tempting lie was to let the composed move/split/remove ops decide the final
selection incidentally.

That breaks down once multiple selected children move out of the same wrapper
span.

## What fixed it

The honest range/current-selection cut does two things:

1. lift the selected children in reverse order so indices stay stable
2. rewrite the selection from the lifted child span after the moves finish

That keeps the final selection on valid text paths inside the lifted blocks
instead of on stale wrapper-relative paths.

## Reusable rule

For Slate v2 range-based lifting:

- lift selected siblings in reverse index order
- rewrite the selection explicitly when the selected children change top-level
  positions

If range lift relies on incidental selection rebasing, it will drift.
