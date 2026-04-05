---
title: AI placeholder templates must replace repeated tokens
category: test-failures
date: 2026-03-23
tags:
  - ai
  - placeholders
  - prompts
  - templates
---

# AI placeholder templates must replace repeated tokens

## Problem

`replacePlaceholders(...)` looked fine for one-off template tokens, but repeated placeholders were only replaced once.

That meant prompts like `Prompt: {prompt}\nAgain: {prompt}` or templates with repeated `{editor}`-style tokens could silently ship partially expanded text to the AI layer.

## Root Cause

The helper used `String.prototype.replace(...)`, which only replaces the first occurrence of a string token.

That was enough for happy-path tests, but it lied for real templates that reused the same placeholder more than once.

## Solution

Replace placeholders across the whole string instead of once:

```ts
let result = text.split('{prompt}').join(prompt || '');

result = result.split(placeholder).join(getMarkdown(editor, { type }));
```

Using `split(...).join(...)` keeps the logic simple and replaces every occurrence without regex escaping games.

## Prevention

- Any template helper gets one repeated-token test. No exceptions.
- Do not trust single-occurrence placeholder tests; they miss the most boring bug in the book.
- When placeholder values come from other helpers, keep those tests real instead of mocking the substitution path.
