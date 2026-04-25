---
title: Typora clipboard and delete behavior
type: source
status: partial
source_refs:
  - ../raw/typora/pages/copy-and-paste.json
  - ../raw/typora/pages/delete-range.json
updated: 2026-04-04
related:
  - docs/research/entities/typora.md
  - docs/research/systems/typora-behavior-map.md
  - docs/editor-behavior/markdown-editing-spec.md
---

# Typora clipboard and delete behavior

## Purpose

This page compiles the Typora sources that define clipboard behavior and delete
commands.

## Source set

- `copy-and-paste.json`
- `delete-range.json`

## Strongest explicit signals

- Typora copies multiple representations at once, especially HTML, rich text,
  and plain text, then relies on the target app to choose the strongest
  matching format.
- plain-text paste is an explicit separate action
- copy behavior is format-aware without needing a different visible command for
  every clipboard format
- delete-range behavior is context-specific:
  - paragraph or block delete
  - sentence or line delete
  - styled-scope delete
  - word delete
  - table-row delete
  - code-line delete
  - math-line delete
  - empty-block delete

## Plate-relevant takeaways

- clipboard should be treated as a first-class research lane, not as a side
  effect of serialization
- delete commands are not just bigger Backspace; they have their own context
  semantics
- table, code, and math destructive commands need explicit ownership instead of
  falling through generic paragraph logic

## What this source cluster is good for

Use this cluster when deciding:

- clipboard variants
- plain-text vs rich paste behavior
- delete-command semantics
- destructive command differences across paragraph, table, code, and math

## What this source cluster is not good for

This cluster is weaker for:

- ordinary collapsed Backspace/Delete key law
- block split/enter behavior

Those belong to other source clusters.
