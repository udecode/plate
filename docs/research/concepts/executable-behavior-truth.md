---
title: Executable behavior truth
type: concept
status: strong
updated: 2026-04-04
related:
  - docs/research/entities/milkdown.md
  - docs/research/sources/milkdown/behavior-test-lanes.md
  - docs/research/decisions/milkdown-tests-beat-docs-for-behavior.md
---

# Executable behavior truth

## Definition

When an open-source editor repo exposes both docs and tests, executable tests
are often the stronger evidence for real behavior.

## Why this matters

Docs describe intent or public API.
Tests describe what the system actually enforces.

## Current research conclusion

Milkdown is the clearest example of this in Plate's editor-reference stack.

For Milkdown:

- e2e and unit tests are strongest for behavior
- docs are strongest for package ownership and API surface

## Use

Use this concept when deciding how much weight to give:

- tests
- docs
- examples
- storybook

inside an open-source reference repo.
