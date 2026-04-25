---
title: Milkdown latex trigger surface
type: source
status: partial
source_refs:
  - ../raw/milkdown/repo/packages/crepe/src/feature/latex/input-rule.ts
  - ../raw/milkdown/repo/packages/crepe/src/feature/latex/index.ts
  - ../raw/milkdown/repo/packages/crepe/src/feature/top-bar/config.ts
updated: 2026-04-09
related:
  - docs/research/entities/milkdown.md
  - docs/editor-behavior/markdown-editing-spec.md
  - docs/editor-behavior/editor-protocol-matrix.md
---

# Milkdown latex trigger surface

## Purpose

This page isolates Milkdown's inspectable implementation evidence for math
delimiter triggers.

## Source set

- `packages/crepe/src/feature/latex/input-rule.ts`
- `packages/crepe/src/feature/latex/index.ts`
- `packages/crepe/src/feature/top-bar/config.ts`

## Strongest explicit signals

- Milkdown Crepe ships an inline math input rule:
  - typing `$...$` creates an inline math node
- Milkdown Crepe ships a block math input rule:
  - `$$` plus trailing whitespace/newline creates a LaTeX block surface
- the latex feature wires both input rules into the editor feature stack
- the top bar also exposes an explicit math insertion action

## Plate-relevant takeaways

- Milkdown is no longer just a thin cross-check for this surface
- it provides executable-style implementation evidence for both inline and
  block math triggers
- this makes Milkdown a real secondary authority for trigger mechanics, not
  merely a syntax companion

## What this source cluster is good for

Use this cluster when deciding:

- whether `$...$` trigger behavior is a real editor surface
- whether block-math trigger behavior should be modeled separately from inline
  pairing
- whether the surface belongs in input-assist law instead of parser law

## What this source cluster is not good for

This cluster is weaker for:

- deciding whether Plate already ships the same trigger behavior
- deciding whether Obsidian shares the same concrete trigger mechanics
- broader product preferences around live preview vs source presentation
