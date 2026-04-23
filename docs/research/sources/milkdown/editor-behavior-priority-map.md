---
title: Milkdown editor-behavior priority map
type: source
status: partial
source_refs:
  - ../raw/milkdown/repo/e2e/tests
  - ../raw/milkdown/repo/packages
  - ../raw/milkdown/repo/docs/api
updated: 2026-04-04
related:
  - docs/research/entities/milkdown.md
  - docs/research/sources/milkdown/corpus-overview.md
  - docs/editor-behavior/markdown-editing-reference-audit.md
---

# Milkdown editor-behavior priority map

## Purpose

This page says which Milkdown lanes matter most for Plate behavior work.

## Tier 1: direct behavior lanes

These are the highest-value lanes to read first:

- `e2e/tests/input/*`
- `e2e/tests/shortcut/*`
- `e2e/tests/transform/*`
- `packages/plugins/preset-commonmark/src`
- `packages/plugins/preset-gfm/src`
- `packages/plugins/plugin-indent/src`
- `packages/transformer/src/parser`
- `packages/transformer/src/serializer`

Why:

- this is where executable behavior lives
- these lanes expose typing, shortcuts, transforms, and markdown package seams
- they are more useful than README files when the question is behavior

## Tier 2: package-local and product-layer support

These are important supporting lanes:

- package-local unit tests under `packages/**/__tests__` and `*.test.*`
- `docs/api/*.md`
- `e2e/src/*`
- `storybook/stories/*`
- `crepe` e2e lanes
- `plugin-automd` e2e lanes

Why:

- package tests capture narrower behavior edges
- API docs show public surface ownership
- product-layer demos help connect tests to runnable examples

## Lower-priority lanes

Usually not first-read for Plate behavior decisions:

- package README files
- CHANGELOGs
- repo governance docs

Useful later, not first.

## First compile order

Recommended order:

1. e2e input / shortcut / transform lanes
2. preset-commonmark and preset-gfm
3. transformer parser / serializer
4. plugin-indent
5. package-local unit tests
6. API docs, examples, and storybook
7. crepe and plugin-automd product-layer lanes
