---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 range unwrapNodes should rewrite selection from wrapper child counts
tags:
  - slate-v2
  - unwrapNodes
  - selection
  - transforms
severity: medium
---

# Slate v2 range unwrapNodes should rewrite selection from wrapper child counts

## What happened

Once exact-path `unwrapNodes(...)` was real, the next structural follow-on was
top-level wrapper range/current-selection unwrapping.

The tempting lie was to trust the composed move/remove ops to leave a perfect
text selection behind automatically.

That breaks down once multiple wrappers are unwrapped in sequence. The child
counts matter, and the final text paths need to be rebuilt from them.

## What fixed it

The honest range/current-selection cut does two things:

1. unwrap the selected wrappers in reverse index order
2. rebuild the selection from the original wrapper child counts

That keeps the final selection pointed at valid text leaves inside the
unwrapped span instead of whatever incidental path the composed ops happened to
leave behind.

## Reusable rule

For Slate v2 range-based unwrapping:

- unwrap wrappers in reverse order so indices stay stable
- rewrite the selection explicitly when wrapper child counts change the final
  top-level positions

If range unwrap relies on incidental selection rebasing, it will drift as soon
as multiple wrappers are involved.
