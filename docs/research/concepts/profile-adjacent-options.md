---
title: Profile-adjacent options
type: concept
status: strong
updated: 2026-04-04
related:
  - docs/research/sources/typora/markdown-native-editing-foundations.md
  - docs/research/decisions/strict-mode-and-auto-pair-are-profile-options.md
  - docs/editor-behavior/markdown-editing-spec.md
---

# Profile-adjacent options

## Definition

These are behaviors that matter for editor feel, but should not be mistaken for
the one global default law of the product.

Examples:

- strict mode
- auto pair
- block shorthand autoformat
- inline mark autoformat
- text-substitution autoformat
- math delimiter triggers

## Why this matters

Without this concept, agents tend to over-lock optional behavior as if it were
universal editor truth.

That is wrong.

Some behaviors belong in a profile or option layer:

- enabled in one mode
- disabled in another
- still real and spec-worthy
- but not universal

## Current research conclusion

Typora treats strict mode, auto pair, and other shorthand-driven input assist
as explicit optional behavior.

That means Plate should model them as profile-adjacent options, not as silent
default law.

## Use

Use this concept when a behavior:

- changes input acceptance
- changes pairing assistance
- changes parser strictness
- changes shorthand-driven input transforms
- should be configurable without redefining the whole editing model
