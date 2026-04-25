---
title: Milkdown tests beat docs for behavior
type: decision
status: accepted
updated: 2026-04-04
source_refs:
  - docs/research/sources/milkdown/behavior-test-lanes.md
  - docs/research/sources/milkdown/docs-and-package-surface-map.md
related:
  - docs/research/concepts/executable-behavior-truth.md
  - docs/editor-behavior/markdown-editing-reference-audit.md
---

# Milkdown tests beat docs for behavior

## Question

When Milkdown docs and tests both exist, which should carry more weight for
behavior work?

## Decision

Tests win for behavior.
Docs win for ownership and API mapping.

## Why

Milkdown splits truth across many lanes.

The executable lanes are:

- e2e input
- e2e shortcut
- e2e transform
- package-local unit tests

Those are stronger than README or docs/api pages when the question is "what
does it really do?"
