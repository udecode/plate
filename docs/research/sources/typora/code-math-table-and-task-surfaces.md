---
title: Typora code, math, table, and task surfaces
type: source
status: partial
source_refs:
  - ../raw/typora/pages/code-fences.json
  - ../raw/typora/pages/math.json
  - ../raw/typora/pages/table-editing.json
  - ../raw/typora/pages/task-list.json
updated: 2026-04-04
related:
  - docs/research/entities/typora.md
  - docs/research/systems/typora-behavior-map.md
  - docs/editor-behavior/markdown-parity-matrix.md
---

# Typora code, math, table, and task surfaces

## Purpose

This page compiles the Typora sources that matter most for special structured
markdown surfaces.

## Source set

- `code-fences.json`
- `math.json`
- `table-editing.json`
- `task-list.json`

## Strongest explicit signals

- code fences expose code-local editing expectations like copy actions, auto
  indent, line-number visibility, wrapping, and Shift+Tab behavior
- math exposes both inline and block math, cross-reference, auto numbering,
  line breaking, and limitations
- table editing exposes row/column insert/delete, resize, alignment, movement,
  and menu-level operations
- task list defines the checkbox syntax and quick status toggling behavior

## Plate-relevant takeaways

- these surfaces should not be treated like ordinary paragraphs with fancy
  serialization
- code, math, table, and tasks each own local editing behavior
- tables are especially important because Typora gives markdown-native table
  evidence, but Google Docs still wins the broader document-style table feel

## What this source cluster is good for

Use this cluster when deciding:

- code-block local editing ownership
- math-block and inline-math behavior expectations
- markdown-native table surface expectations
- task-list syntax and quick status changes

## What this source cluster is not good for

This cluster is weaker for:

- collaboration or document-review behavior
- block-editor-native constructs with no markdown-native counterpart

Those need other references.
