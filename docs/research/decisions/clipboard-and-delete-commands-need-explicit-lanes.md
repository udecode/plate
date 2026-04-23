---
title: Clipboard and delete commands need explicit lanes
type: decision
status: accepted
updated: 2026-04-04
source_refs:
  - docs/research/sources/typora/clipboard-and-delete-behavior.md
related:
  - docs/research/concepts/delete-command-surface.md
  - docs/editor-behavior/editor-protocol-matrix.md
---

# Clipboard and delete commands need explicit lanes

## Question

Should clipboard behavior and delete commands be folded into ordinary editing
rows, or modeled as explicit lanes?

## Decision

They need explicit lanes.

## Why

Typora gives strong evidence that:

- clipboard behavior is multi-format and target-aware
- delete commands have context-specific semantics beyond ordinary Backspace

Treating them as generic side effects hides important behavior differences.
