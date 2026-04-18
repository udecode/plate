---
title: Obsidian corpus overview
type: source
status: partial
source_refs:
  - ../raw/obsidian/README.md
  - ../raw/obsidian/help-en-catalog.md
  - ../raw/obsidian/developer-en-catalog.md
updated: 2026-04-04
related:
  - docs/research/entities/obsidian.md
  - docs/research/sources/obsidian/editor-behavior-priority-map.md
---

# Obsidian corpus overview

## Purpose

This page is the first compiled summary of the official Obsidian docs corpus.

It bridges:

- the raw help docs repo in `../raw/obsidian/help`
- the raw developer docs repo in `../raw/obsidian/developer`
- the compiled Obsidian source pages in `docs/research/sources/obsidian`

## Corpus shape

Current raw sources:

- help docs repo
- developer docs repo

Current English markdown counts:

- help docs: `171`
- developer docs: `1312`

The developer repo is much larger because it includes TypeScript API reference
pages and CSS-variable reference pages.

## Structural take

Obsidian's useful behavior truth is split across two very different lanes:

1. product help docs
   - editing modes
   - internal links
   - backlinks
   - outline
   - search
   - Obsidian Flavored Markdown
2. developer docs
   - editor extensions
   - editor API
   - markdown post-processing
   - CodeMirror-facing extension seams

That means Obsidian is both:

- a product reference
- a developer platform reference

## Plate-relevant use

Use Obsidian when the question is about:

- live preview vs source mode
- linked-note navigation
- backlinks and note graph UX
- plugin/editor extension seams

Do not use Obsidian as the one primary markdown-native authority. That still
belongs to Typora.
