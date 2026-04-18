---
title: Milkdown is the primary open-source cross-check
type: decision
status: accepted
updated: 2026-04-04
source_refs:
  - docs/research/sources/milkdown/corpus-overview.md
  - docs/research/sources/milkdown/behavior-test-lanes.md
related:
  - docs/research/entities/milkdown.md
  - docs/editor-behavior/markdown-standards.md
---

# Milkdown is the primary open-source cross-check

## Question

Which repo should be Plate's main open-source companion reference for
markdown-first behavior and architecture cross-checking?

## Decision

Milkdown wins.

## Why

- it is already cloned locally
- it has a rich mix of tests, package surfaces, API docs, examples, and stories
- it exposes markdown-first presets and transformer seams clearly
- it is more useful as a cross-check than as a primary authority
