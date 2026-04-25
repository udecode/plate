---
title: Typora behavior map
type: system
status: partial
updated: 2026-04-04
related:
  - docs/research/entities/typora.md
  - docs/research/sources/typora/corpus-overview.md
  - docs/research/sources/typora/editor-behavior-priority-map.md
  - docs/editor-behavior/README.md
---

# Typora behavior map

## Purpose

This page maps the raw Typora corpus into reusable source clusters for future
agent work.

It is the bridge between:

- the raw Typora corpus in `../raw/typora`
- the compiled Typora source layer in `docs/research/sources/typora`
- the existing normative editor-behavior docs in `docs/editor-behavior`

## Source clusters

### Markdown-native foundations

- [markdown-native-editing-foundations.md](docs/research/sources/typora/markdown-native-editing-foundations.md)

Covers:

- syntax families
- Enter vs line break expectations
- shortcut ownership
- strict mode
- auto pair

### Clipboard and delete behavior

- [clipboard-and-delete-behavior.md](docs/research/sources/typora/clipboard-and-delete-behavior.md)

Covers:

- multi-format copy
- plain-text paste
- delete command semantics

### Links, images, and HTML

- [links-images-and-html-behavior.md](docs/research/sources/typora/links-images-and-html-behavior.md)

Covers:

- link click and mod-click behavior
- image insertion and path policy
- HTML block edit entry

### Navigation and document chrome

- [navigation-search-outline-and-toc.md](docs/research/sources/typora/navigation-search-outline-and-toc.md)

Covers:

- search
- outline
- TOC

### Structured markdown surfaces

- [code-math-table-and-task-surfaces.md](docs/research/sources/typora/code-math-table-and-task-surfaces.md)

Covers:

- code fences
- math
- table editing
- task lists

## Why this is better than the old setup alone

The existing repo-safe Typora reference docs already did two useful things:

- inventory the corpus safely
- feed the editor-behavior law stack

What they did not do cleanly was give future agents a reusable compiled source
layer that can serve more than one goal.

This map plus the Typora source cluster pages fix that.

## What still comes later

This is still a source-oriented layer, not the final concept/decision layer.

Future work should promote recurring ideas into:

- `concepts/`
- `decisions/`

but only when the source support is strong enough.
