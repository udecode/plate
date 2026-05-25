---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 remove_text should stay exact and rebase selection inward
tags:
  - slate-v2
  - remove-text
  - transforms
  - selection
  - operations
severity: medium
---

# Slate v2 remove_text should stay exact and rebase selection inward

## What happened

After `set_node` / `unsetNodes(...)`, the next missing low-level text seam was
`remove_text`.

The tempting mistake was obvious:

- pretend legacy `Transforms.delete(...)` already exists
- or add a broad text-deletion helper with distance/unit semantics immediately

That would have lied about the current engine.

## What fixed it

The honest slice stayed narrow:

1. add real `remove_text`
2. add exact `Transforms.removeText(editor, text, { at? })`
3. rebase selection inward after the removal

That means the helper removes the exact text payload at one point. It does not
claim:

- word/line/block deletion
- reverse deletion
- hanging deletion
- selection-spanning deletion

## Reusable rule

For Slate v2 text removal:

- ship the exact low-level op first
- make the helper match the real op semantics
- rebase the current selection inward so cursor and range movement stay
  consistent with the underlying removal
- do not name broad deletion behavior as shipped until the engine really owns it

If the helper is broader than the real operation, the API is doing marketing,
not engineering.
