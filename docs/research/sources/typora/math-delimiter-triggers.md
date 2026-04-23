---
title: Typora math delimiter triggers
type: source
status: partial
source_refs:
  - ../raw/typora/pages/auto-pair.json
  - ../raw/typora/pages/math.json
updated: 2026-04-09
related:
  - docs/research/entities/typora.md
  - docs/editor-behavior/markdown-editing-spec.md
  - docs/editor-behavior/editor-protocol-matrix.md
---

# Typora math delimiter triggers

## Purpose

This page isolates the Typora evidence for math-delimiter input triggers instead
of the broader math editing surface.

## Source set

- `auto-pair.json`
- `math.json`

## Strongest explicit signals

- Typora explicitly says `$` auto pair turns on when both:
  - `Auto pair common markdown syntax` is enabled
  - `inline math` is enabled
- The same Typora page explicitly distinguishes `$` from `~`, `=`, and `^`:
  - `~`, `=`, and `^` do not blindly insert a closing pair
  - `$` is grouped with the symbols whose pair behavior is turned on
- Typora explicitly says block math can be entered by:
  - typing `$$`
  - pressing `Return`

## Plate-relevant takeaways

- inline `$` pairing and block `$$` promotion are separate input-assist
  surfaces
- they belong to markdown-aware input behavior, not to parse/serialize law by
  themselves
- Typora is explicit enough to guide a profile-adjacent contract here

## What this source cluster is good for

Use this cluster when deciding:

- whether inline math delimiter auto-pair should exist as an explicit option
- whether block math promotion from `$$` + `Return` should be treated as a
  separate trigger
- how to keep math trigger law separate from generic parser coverage

## What this source cluster is not good for

This cluster is weaker for:

- deciding whether the trigger is a current shipped Plate feature
- proving the same trigger behavior in Obsidian or Milkdown
- broader equation editing behavior after the math node already exists

Those need repo evidence or other source clusters.
