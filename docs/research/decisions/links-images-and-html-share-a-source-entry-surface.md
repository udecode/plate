---
title: Links, images, and HTML share a source-entry surface
type: decision
status: accepted
updated: 2026-04-04
source_refs:
  - docs/research/sources/typora/links-images-and-html-behavior.md
related:
  - docs/research/concepts/source-entry-surface.md
  - docs/editor-behavior/markdown-editing-spec.md
---

# Links, images, and HTML share a source-entry surface

## Question

How should Plate think about rendered markdown-native links, images, and HTML
blocks?

## Decision

Treat them as one interaction family: source-entry surfaces.

## Why

Typora shows the same deeper pattern across all three:

- rendered state is not the end of the story
- plain click and mod-click differ
- there is a real source-oriented edit seam behind the rendered surface

This is a better mental model than treating each one as a totally separate
special case.
