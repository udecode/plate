---
title: Typora editor-behavior priority map
type: source
status: partial
source_refs:
  - ../raw/typora/metadata.json
  - ../raw/typora/pages/markdown-reference.json
updated: 2026-04-04
related:
  - docs/research/sources/typora/corpus-overview.md
  - docs/research/entities/typora.md
  - docs/editor-behavior/markdown-editing-reference-audit.md
---

# Typora editor-behavior priority map

## Purpose

This page says which Typora raw pages matter most for Plate's behavior work so
future compilers do not waste time on low-signal pages first.

## Tier 1: direct behavior sources

These are the strongest first pages to compile:

- `markdown-reference.json`
- `shortcut-keys.json`
- `copy-and-paste.json`
- `delete-range.json`
- `line-break.json`
- `table-editing.json`
- `task-list.json`
- `html.json`
- `images.json`
- `links.json`
- `math.json`
- `code-fences.json`
- `outline.json`
- `search.json`
- `toc.json`
- `strict-mode.json`
- `auto-pair.json`
- `yaml.json`

Why these win:

- they directly define editor behavior
- they are repeatedly cited by the existing editor-behavior stack
- they are likely to produce reusable source summaries, concepts, and decisions

## Tier 2: drift and release-note sources

These are not the first pages to summarize, but they matter because they
capture behavior that sometimes only appears in release notes:

- `what-s-new-0-9-84.json`
- `what-s-new-0-11.json`
- `what-s-new-1-8.json`
- `what-s-new-1-13.json`

This is the drift lane:

- footnote quick jump
- link open behavior
- callouts
- deletion bugs
- search improvements
- anchor and outline fixes

## Tier 3: lower-priority supporting pages

Useful later, but not first:

- `resize-image.json`
- `upload-image.json`
- `media.json`
- `toc-levels.json`
- `code-fences-language-support.json`

## Low-priority or mostly out-of-scope pages

Usually not worth compiling early for Plate:

- purchase / activation / license pages
- theme customization
- OS setup
- extension announcements
- export-heavy pages
- VLOOK install pages

Keep them in raw. Do not spend early research energy on them.

## First compile order

Recommended order:

1. `markdown-reference.json`
2. `shortcut-keys.json`
3. `copy-and-paste.json`
4. `delete-range.json`
5. `html.json`
6. `images.json`
7. `outline.json`
8. `search.json`
9. `toc.json`
10. `strict-mode.json`
11. `auto-pair.json`
12. the selected high-signal release notes
