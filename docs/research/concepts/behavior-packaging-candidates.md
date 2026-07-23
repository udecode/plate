---
title: Behavior packaging candidates
type: concept
status: strong
updated: 2026-07-23
related:
  - docs/research/sources/typora/markdown-native-editing-foundations.md
  - docs/research/decisions/strict-mode-and-auto-pair-need-independent-packaging.md
  - docs/research/systems/editor-behavior-architecture.md
  - docs/editor-behavior/markdown-editing-spec.md
---

# Behavior packaging candidates

## Definition

These behaviors matter for editor feel but are not automatically one global
default law. That makes them packaging candidates, not automatically options or
plugins.

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

Non-universal behavior starts the packaging decision. It does not finish it:

- invariants stay in their feature owner;
- parameters stay in inferred `options`;
- substitutable capabilities may become ordinary plugins;
- product policy stays inline in an app kit unless reuse or another hard
  boundary earns independent identity.

## Current research conclusion

Typora treats strict mode, auto pair, and other shorthand-driven input assist
as explicit optional behavior.

That means Plate should not make them silent global law. Each family still
needs the promotion protocol in
[editor-behavior-architecture.md](../systems/editor-behavior-architecture.md):
stable user job, real omission/replacement need or hard boundary, valid
fallback, closed dependencies, independent proof, and an unchanged default
preset.

## Use

Use this concept when a behavior:

- changes input acceptance
- changes pairing assistance
- changes parser strictness
- changes shorthand-driven input transforms
- should be configurable without redefining the whole editing model

Then classify it. Do not use “optional” or “profile-adjacent” as the packaging
answer.
