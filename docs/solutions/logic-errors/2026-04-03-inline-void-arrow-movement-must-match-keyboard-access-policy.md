---
module: Editor Behavior
date: 2026-04-03
problem_type: logic_error
component: inline_atoms
symptoms:
  - "Two inline voids with the same shape moved differently on left and right arrow."
  - "A later change treated atomic skipping as automatically correct even when keyboard entry was the desired UX."
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - inline-void
  - selection
  - keyboard
  - arrow-keys
  - accessibility
  - isSelectable
---

# Inline void arrow movement must match the keyboard-access policy

## Problem

`mention` and `date` are both inline void atoms, but they drifted into two
different arrow-key models.

That drift looked like a neat implementation trick, but it was really a policy
mistake: we changed `mention` to skip as a whole unit without first deciding
whether the product wanted inline voids to stay keyboard-accessible.

## Root Cause

We treated `isSelectable: false` as the answer instead of as one possible tool.

That flag only makes sense when the desired UX is "skip across the inline
void". It is wrong when the desired UX is "let arrow keys enter the inline void
child".

## Solution

Decide the keyboard-access policy first, then match the node contract to it.

- If the inline void should stay keyboard-accessible, do not force
  `isSelectable: false`.
- If the inline void should behave like an atomic chip that arrows skip over,
  add `isSelectable: false` and test both directions.

For the current editor-behavior profile, `mention` and `date` both follow the
keyboard-accessible path.

## Prevention

- Do not treat two similar inline voids as different unless a strong product
  standard justifies the split.
- When changing arrow behavior, test the sibling inline-void families too.
- Never write a learning that says "always add `isSelectable: false`". That is
  a policy choice, not a universal fix.

## Verification

These checks passed:

```bash
bun test packages/mention/src/lib/BaseMentionPlugin.spec.tsx packages/date/src/lib/BaseDatePlugin.spec.tsx
pnpm turbo build --filter=./packages/mention --filter=./packages/date
pnpm turbo typecheck --filter=./packages/mention --filter=./packages/date
pnpm lint:fix
```
