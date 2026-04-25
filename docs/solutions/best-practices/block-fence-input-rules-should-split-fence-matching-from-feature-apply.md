---
title: Block fence input rules should split fence matching from feature apply
date: 2026-04-15
category: best-practices
module: core
problem_type: best_practice
component: tooling
symptoms:
  - Block math on `$$` plus Enter and code block on ``` plus the last backtick were implemented as separate package-specific rules even though the matcher shape was the same.
  - Switching a feature from "fire on the matching delimiter" to "fire on Enter after the fence" required rewriting the whole rule instead of changing one option.
  - Package rules kept repeating the same collapsed-selection, paragraph, block-end, and block-start-fence checks.
root_cause: inadequate_documentation
resolution_type: code_change
severity: medium
tags: [input-rules, api-design, markdown, code-block, math, fences]
---

# Block fence input rules should split fence matching from feature apply

## Problem

Some input rules are not really "insert text" or "insert break" rules in
spirit. They are **block fence** rules:

- match a fence at the start of the current block
- require the cursor at the end of that block
- then commit either when the fence becomes complete or when the user presses
  Enter

Block math and fenced code blocks both followed that shape, but the shared part
was buried inside separate package rules.

## What Didn't Work

- Treating block-fence matching as feature-specific package logic.
- Forcing each package to choose between a typed-character rule and an
  Enter-based rule with separate handwritten matcher code.
- Using a generic block-start matcher for cases that also need end-of-block and
  fence-completion semantics.

## Solution

Add a narrow core primitive for block fences:

```ts
createBlockFenceInputRule({
  fence: '```',
  on: 'match',
  block: KEYS.p,
  isBlocked,
  apply,
});
```

`on` expresses the real DX choice:

- `on: 'match'` fires when the last delimiter makes the fence complete
- `on: 'break'` fires when the completed fence is followed by Enter

Core owns the matcher:

- collapsed selection
- current block lookup
- block type gating
- cursor-at-block-end gating
- block-start fence text match

Packages still own semantics:

- code block insertion
- equation insertion
- any feature-specific transforms

## Why This Works

It extracts the repeated hot-path matcher without flattening feature ownership
into core.

- `@platejs/code-block` can switch between typed completion and Enter-based
  completion with one option.
- `@platejs/math` can use the same primitive for `$$` without carrying its own
  insert-break matcher.
- The public option says what the user cares about: **when the fence fires**.
  It does not leak runtime lanes like `insertText` vs `insertBreak`.

## Prevention

- When multiple packages repeat fence-at-block-start plus end-of-block checks,
  move that matcher to core.
- Keep the option semantic. Prefer `on: 'match' | 'break'` over names that leak
  implementation details.
- Do not move feature insertion logic into core just because the matcher is
  shared.

## Related Issues

- [2026-04-14-input-rules-recipe-registration-plan.md](../../plans/2026-04-14-input-rules-recipe-registration-plan.md)
