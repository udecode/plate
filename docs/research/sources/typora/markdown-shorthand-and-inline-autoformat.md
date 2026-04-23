---
title: Typora markdown shorthand and inline autoformat
type: source
status: partial
source_refs:
  - ../raw/typora/pages/markdown-reference.json
  - ../raw/typora/pages/shortcut-keys.json
  - ../raw/typora/pages/auto-pair.json
updated: 2026-04-09
related:
  - docs/research/entities/typora.md
  - docs/editor-behavior/markdown-editing-spec.md
  - docs/editor-behavior/editor-protocol-matrix.md
---

# Typora markdown shorthand and inline autoformat

## Purpose

This page isolates the Typora evidence for markdown-triggered block shorthand
and inline autoformat behavior.

## Source set

- `markdown-reference.json`
- `shortcut-keys.json`
- `auto-pair.json`

## Strongest explicit signals

- Typora explicitly documents block shorthand typing flows:
  - `#` and heading text followed by `Return` create headings
  - `>` plus content creates a blockquote
  - `*`, `+`, or `-` plus content create unordered lists
  - `1.` plus content creates ordered lists
  - `- [ ]` and `- [x]` create task list items
  - `````plus`Return` creates a fenced code block
  - `---` or `***` on a blank line plus `Return` create a horizontal rule
- Typora explicitly documents inline markdown delimiters for:
  - emphasis
  - strong
  - inline code
  - strikethrough
  - inline math
  - subscript
  - superscript
  - highlight
- Typora explicitly documents auto-pair as a separate input-assist option:
  - normal brackets and quotes follow code-editor-style pairing
  - extended markdown symbols can opt into pairing
  - `~`, `=`, and `^` prefer selection-wrap instead of blind empty-input pair
    insertion

## Plate-relevant takeaways

- block shorthand is input assist, not parser law
- inline mark closure is a separate family from generic auto pair
- markdown-sensitive symbols do not all want the same behavior:
  - `*`, `_`, `` ` ``, and `$` can behave like pair-on-type
  - `~`, `=`, and `^` are explicitly safer as selection-wrap-first symbols
- block shorthand families are not mechanically identical:
  - headings retag
  - blockquotes wrap containers
  - lists build list structure
  - fenced code inserts a new editing owner

## What this source cluster is good for

Use this cluster when deciding:

- block shorthand trigger behavior for headings, quotes, lists, tasks, code
  fences, and horizontal rules
- inline markdown-delimiter autoformat
- whether a shorthand belongs to block retag, block wrap, or block insertion
- whether a symbol should pair on empty input or only wrap a selection

## What this source cluster is not good for

This cluster is weaker for:

- exact nested container edge cases
- exact invalid-match guardrails for intra-word mark syntax
- text-substitution shorthand like smart punctuation, arrows, and legal symbols

Those need Milkdown executable lanes or Plate-owned current-contract evidence.
