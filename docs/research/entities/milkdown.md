---
title: Milkdown
type: entity
status: partial
updated: 2026-04-04
related:
  - docs/research/sources/milkdown/corpus-overview.md
  - docs/research/sources/milkdown/editor-behavior-priority-map.md
  - docs/research/systems/milkdown-behavior-map.md
  - docs/editor-behavior/markdown-standards.md
---

# Milkdown

Type: editor reference

Milkdown is Plate's main open-source markdown-editor cross-check.

## Role In This Research Layer

- open-source behavioral and architectural companion reference
- strongest inspectable repo for markdown-first engine behavior
- useful counterweight to Typora where product docs are thin
- especially useful when tests reveal behavior more clearly than docs

## Why it matters

- upstream raw repo clone is available in `../raw/milkdown/repo`
- behavior evidence exists in tests, package sources, docs, examples, and
  storybook
- it is broad enough to cross-check syntax, transforms, shortcuts, packaging,
  and product-layer surfaces

## Limits

Milkdown is not the primary markdown-native product authority.

It is strongest as:

- executable truth serum
- architecture cross-check
- package/docs ownership map

It is weaker than Typora when the question is pure product feel.
