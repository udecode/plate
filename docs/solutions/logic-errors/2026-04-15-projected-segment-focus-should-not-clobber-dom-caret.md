---
date: 2026-04-15
problem_type: logic_error
component: frontend_stimulus
root_cause: logic_error
title: Projected segment focus should not clobber the browser caret
tags:
  - slate-v2
  - slate-react
  - projections
  - selection
  - markdown-preview
  - backspace
severity: medium
---

# Projected segment focus should not clobber the browser caret

## What happened

`markdown-preview` rendered bold markdown through projection slices. Clicking
inside the projected bold span visually placed the browser caret in the bold
text, but Slate focus restoration snapped the DOM selection back to the default
Slate selection.

Backspace then ran against the wrong Slate selection and became a no-op.

## What fixed it

`Editable` focus restoration now checks whether the browser already has a real
DOM selection inside the editor before restoring the initial/default Slate
selection on the delayed focus pass.

The key rule:

- if the DOM selection maps to a Slate range and differs from the focus fallback,
  select the DOM-derived Slate range instead of clobbering it

`Editable` key handling also syncs from the current DOM selection before
handling plain `Enter`, `Backspace`, and `Delete`, so keyboard actions use the
actual browser caret when projected text wrappers are involved.

## Why This Works

Projected segments introduce extra DOM wrappers around a single Slate text node.
The DOM bridge can map those points correctly, but only if the focus handler
does not overwrite the browser selection first.

The fix keeps the browser's real caret as the source of truth when it is already
inside the editor.

## Reusable rule

For Slate v2 projected text:

- never restore a fallback Slate selection over a valid in-editor DOM selection
- sync key-driven structural commands from DOM selection before executing them
- test projected spans with real click/key browser paths, not only semantic
  helper selection

Regression owner:

- [markdown-preview.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/markdown-preview.test.ts)
