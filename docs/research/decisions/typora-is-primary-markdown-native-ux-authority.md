---
title: Typora is the primary markdown-native UX authority
type: decision
status: accepted
updated: 2026-04-04
source_refs:
  - docs/research/sources/typora/markdown-native-editing-foundations.md
  - docs/research/sources/typora/links-images-and-html-behavior.md
related:
  - docs/research/concepts/markdown-native-editing-authority.md
  - docs/editor-behavior/markdown-standards.md
---

# Typora is the primary markdown-native UX authority

## Question

Which product should be the primary UX authority for Plate's markdown-native
editing lane?

## Decision

Typora wins.

## Why

- it is explicitly markdown-first
- it documents real editing behavior, not just syntax
- it covers links, images, HTML entry, clipboard, search, outline, TOC, strict
  mode, auto pair, and source-oriented behavior
- it is a better fit for markdown-native editing feel than Docs-, Notion-, or
  engine-first products

## Limits

This does not mean Typora wins everything.

It does not override:

- CommonMark or GFM syntax semantics
- Google Docs table/document behavior
- Notion block-editor-native behavior
- explicit Plate-owned decisions where Typora is silent
