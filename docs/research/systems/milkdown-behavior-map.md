---
title: Milkdown behavior map
type: system
status: partial
updated: 2026-04-04
related:
  - docs/research/entities/milkdown.md
  - docs/research/sources/milkdown/corpus-overview.md
  - docs/research/sources/milkdown/editor-behavior-priority-map.md
  - docs/editor-behavior/README.md
---

# Milkdown behavior map

## Purpose

This page maps Milkdown into reusable research lanes for future agent work.

It bridges:

- the upstream raw clone at `../raw/milkdown/repo`
- the raw entrypoint in `../raw/milkdown`
- the compiled Milkdown source pages in `docs/research/sources/milkdown`
- the existing editor-behavior law stack

## Source clusters

### Executable behavior lanes

- [behavior-test-lanes.md](docs/research/sources/milkdown/behavior-test-lanes.md)

Covers:

- input tests
- shortcut tests
- transform tests
- unit tests

### Package and docs ownership lanes

- [docs-and-package-surface-map.md](docs/research/sources/milkdown/docs-and-package-surface-map.md)

Covers:

- docs/api ownership
- package layout
- public package surfaces

## Why this is better than the old setup alone

The older repo-safe inventories were already useful, but they were still
inventory-first.

This map plus the compiled source pages now make Milkdown usable as a reusable
research surface instead of a fork pointer plus TSV pile.

## Current role in Plate

Milkdown is:

- the main open-source cross-check
- the executable companion reference
- the architecture/productization cross-check

It is not the primary markdown-native product authority.
