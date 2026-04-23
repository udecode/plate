---
title: Strict mode and auto pair are profile options
type: decision
status: accepted
updated: 2026-04-04
source_refs:
  - docs/research/sources/typora/markdown-native-editing-foundations.md
related:
  - docs/research/concepts/profile-adjacent-options.md
  - docs/editor-behavior/markdown-editing-spec.md
---

# Strict mode and auto pair are profile options

## Question

How should Plate model strict mode and auto pair?

## Decision

Treat them as explicit profile-adjacent options, not as silent universal law.

## Why

Typora treats both as optional behavior:

- strict mode changes parsing/input acceptance
- auto pair changes input assistance

Those are real behaviors, but they should not silently redefine the default
editing contract for every surface.
