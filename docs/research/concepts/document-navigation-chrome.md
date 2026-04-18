---
title: Document navigation chrome
type: concept
status: strong
updated: 2026-04-04
related:
  - docs/research/sources/typora/navigation-search-outline-and-toc.md
  - docs/editor-behavior/editor-protocol-matrix.md
---

# Document navigation chrome

## Definition

This is the persistent navigation UI around a document rather than editing
inside the document body itself.

Examples:

- search panels
- outline panels
- TOC generation and navigation

## Why this matters

If you mix this with core paragraph editing law, the spec gets muddy fast.

Search, outline, and TOC are related, but they are not the same thing:

- search is query-driven navigation
- outline is persistent heading chrome
- TOC is a document artifact or block

## Current research conclusion

Typora gives strong evidence for this interaction class and helps separate:

- body editing law
- document navigation law
- app-shell behavior

## Use

Use this concept when deciding whether a feature belongs in:

- editor-body law
- document navigation
- app shell
