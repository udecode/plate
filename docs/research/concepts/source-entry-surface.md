---
title: Source-entry surface
type: concept
status: strong
updated: 2026-04-04
related:
  - docs/research/sources/typora/links-images-and-html-behavior.md
  - docs/editor-behavior/markdown-editing-spec.md
---

# Source-entry surface

## Definition

A source-entry surface is a rendered editor surface that still preserves a
clear path back into source-like editing.

Examples:

- links
- images
- HTML blocks

## Why this matters

These are not just rendered artifacts.

They have interaction law:

- plain click may edit
- mod-click may open or jump
- the rendered form still has a source-oriented editing seam

## Current research conclusion

Typora is especially strong on this class of behavior.

It gives a practical model for:

- plain click vs mod-click on links
- image insertion and source policies
- HTML block edit entry

## Use

Use this concept when deciding whether a rendered thing should:

- open directly
- edit directly
- jump into source mode
- stay in generic rendered content only
