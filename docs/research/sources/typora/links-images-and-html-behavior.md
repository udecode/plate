---
title: Typora links, images, and HTML behavior
type: source
status: partial
source_refs:
  - ../raw/typora/pages/links.json
  - ../raw/typora/pages/images.json
  - ../raw/typora/pages/html.json
  - ../raw/typora/pages/markdown-reference.json
updated: 2026-04-04
related:
  - docs/research/entities/typora.md
  - docs/research/systems/typora-behavior-map.md
  - docs/editor-behavior/markdown-editing-spec.md
---

# Typora links, images, and HTML behavior

## Purpose

This page compiles the Typora sources that matter most for interactive link,
image, and HTML editing behavior.

## Source set

- `links.json`
- `images.json`
- `html.json`
- `markdown-reference.json`

## Strongest explicit signals

- links support inline, internal, local-file, and reference-link forms
- plain click expands or edits the link surface, while Command/Ctrl-click opens
  the target
- images support markdown insertion, drag/drop, clipboard paste, local file
  selection, and path policy options
- image behavior explicitly includes relative path policy and optional `./`
  prefix behavior
- HTML blocks can enter edit mode by cursor movement, click on a non-interactive
  part, or Command/Ctrl-click
- Typora treats HTML blocks like a source/output editing surface rather than as
  plain rendered content only

## Plate-relevant takeaways

- Typora is the strongest owner for markdown-native interactive preview and
  source-entry behavior
- links and images are not just serialization forms; they have explicit click,
  mod-click, and source-edit behavior
- HTML blocks belong in the same interaction family as math-source or
  source-biased editing surfaces

## What this source cluster is good for

Use this cluster when deciding:

- plain click vs mod-click on links
- link edit vs open behavior
- image insertion behavior from files, drag/drop, and clipboard
- image path policies
- HTML block edit entry

## What this source cluster is not good for

This cluster is weaker for:

- generic block structural keys
- table/document navigation

Those belong elsewhere.
