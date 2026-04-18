---
title: Typora markdown-native editing foundations
type: source
status: partial
source_refs:
  - ../raw/typora/pages/markdown-reference.json
  - ../raw/typora/pages/shortcut-keys.json
  - ../raw/typora/pages/line-break.json
  - ../raw/typora/pages/strict-mode.json
  - ../raw/typora/pages/auto-pair.json
updated: 2026-04-04
related:
  - docs/research/entities/typora.md
  - docs/research/systems/typora-behavior-map.md
  - docs/editor-behavior/markdown-standards.md
---

# Typora markdown-native editing foundations

## Purpose

This page compiles the core Typora pages that define its markdown-native editing
model.

This is the source cluster for:

- markdown syntax families
- typing feel
- paragraph-vs-line-break behavior
- shortcut ownership
- strict parsing mode
- auto-pair as a profile option

## Source set

- `markdown-reference.json`
- `shortcut-keys.json`
- `line-break.json`
- `strict-mode.json`
- `auto-pair.json`

## Strongest explicit signals

- `markdown-reference` is the broad syntax and interaction baseline:
  paragraphs, headings, blockquotes, lists, task lists, code, math, tables,
  links, images, footnotes, YAML, TOC, and callouts all show up there.
- `shortcut-keys` gives real command ownership for paragraph indent/outdent,
  formatting commands, outline toggles, source mode, and document navigation
  chrome.
- `line-break` is very explicit that Enter creates new paragraphs and that
  ordinary single line breaks are not the normal rich-writing path.
- `strict-mode` clearly defines parser strictness as an option, not the one
  global default.
- `auto-pair` clearly defines pairing as input assist and makes markdown-symbol
  pairing an extra option beyond normal bracket/quote pairing.

## Plate-relevant takeaways

- Typora is strongest when Plate needs markdown-native editing intent rather
  than just parser semantics.
- Typora separates syntax semantics from input assist:
  strict mode and auto pair are optional profile behavior, not universal law.
- Typora treats paragraph creation as the normal writing path and soft line
  breaks as the exceptional path.
- Shortcut ownership belongs to the editor surface, not to random plugin-local
  guesses.

## What this source cluster is good for

Use this cluster when deciding:

- markdown-native paragraph behavior
- shortcut ownership for indent/outdent and editor chrome
- whether a behavior is parser strictness or editing law
- whether a behavior belongs in profile options instead of the default law

## What this source cluster is not good for

This cluster is weaker for:

- destructive edge-key behavior
- precise reverse navigation behavior
- complex selection semantics

For those, other Typora pages or Plate-owned decisions still matter more.
