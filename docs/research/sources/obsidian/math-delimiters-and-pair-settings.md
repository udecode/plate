---
title: Obsidian math delimiters, pairing, and trigger history
type: source
status: partial
source_refs:
  - ../raw/obsidian/help/en/Editing and formatting/Advanced formatting syntax.md
  - ../raw/obsidian/help/en/User interface/Settings.md
  - ../raw/obsidian/help/en/Editing and formatting/Views and editing mode.md
  - ../raw/obsidian/help/Release notes/v0.7.2.md
  - ../raw/obsidian/help/Release notes/v0.8.11.md
  - ../raw/obsidian/help/Release notes/v0.8.14.md
  - ../raw/obsidian/help/Release notes/v0.11.11.md
  - ../raw/obsidian/help/Release notes/v0.13.0.md
  - ../raw/obsidian/help/Release notes/v0.13.3.md
updated: 2026-04-09
related:
  - docs/research/entities/obsidian.md
  - docs/editor-behavior/markdown-editing-spec.md
  - docs/editor-behavior/editor-protocol-matrix.md
---

# Obsidian math delimiters, pairing, and trigger history

## Purpose

This page isolates the Obsidian evidence for math delimiter syntax, pair
settings, and math-trigger behavior.

## Source set

- `Advanced formatting syntax.md`
- `Settings.md`
- `Views and editing mode.md`
- `v0.7.2.md`
- `v0.8.11.md`
- `v0.8.14.md`
- `v0.11.11.md`
- `v0.13.0.md`
- `v0.13.3.md`
- broad grep over `../raw/obsidian/help/en`
- broad grep over `../raw/obsidian/developer/en`

## Official source entrypoints checked

- `https://help.obsidian.md/syntax`
- `https://help.obsidian.md/edit-and-read`
- `https://obsidian.md/changelog/`

## Direct raw files read

- `../raw/obsidian/help/en/Editing and formatting/Advanced formatting syntax.md`
- `../raw/obsidian/help/en/Editing and formatting/Views and editing mode.md`
- `../raw/obsidian/help/en/User interface/Settings.md`
- `../raw/obsidian/help/Release notes/v0.7.2.md`
- `../raw/obsidian/help/Release notes/v0.8.11.md`
- `../raw/obsidian/help/Release notes/v0.8.14.md`
- `../raw/obsidian/help/Release notes/v0.13.0.md`
- `../raw/obsidian/help/Release notes/v0.13.3.md`

## Strongest explicit signals

- Obsidian explicitly documents:
  - block math with `$$`
  - inline math with `$...$`
- Obsidian explicitly exposes:
  - `Auto-pair brackets`
  - `Auto-pair Markdown syntax`
- Obsidian explicitly documents the editing-mode context:
  - Live Preview hides most markdown syntax away from the cursor
  - Source mode shows the raw markdown syntax
- Obsidian explicitly records `$` inside the markdown auto-pair family:
  - `v0.8.14`: `$` auto-pairs when selecting text and pressing `$`
  - `v0.11.11`: `$` stops auto-pairing on empty typing and stays selection-wrap
    only because blind typing was annoying
  - `v0.13.3`: Live Preview implements auto-pairing for markdown formatting
    symbols including `$`
- Obsidian explicitly records block-math trigger behavior:
  - `v0.7.2`: block LaTeX is detected in the editor when `$$` is on its own
    line
  - `v0.13.0`: block `$$` LaTeX shows a preview in Live Preview
- Live Preview is a real editing mode that hides most markdown syntax away from
  the cursor

## Plate-relevant takeaways

- Obsidian is explicit about math delimiter syntax
- Obsidian is explicit that markdown-sensitive pair behavior exists as an
  editor setting
- Obsidian is explicit for a conservative `$` policy:
  - selection-wrap is real
  - math-sensitive pairing belongs to the markdown auto-pair family
  - free empty-input pairing is not the only sane behavior for `$`
- Obsidian is explicit for block `$$` detection and preview, even if it does
  not document the same `$$` + `Enter` promotion shape Typora uses
- the current developer corpus still does not add stronger plugin-level trigger
  mechanics beyond generic editor APIs and markdown post-processing docs

## What this source cluster is good for

Use this cluster when deciding:

- whether math delimiter triggers belong in a profile-adjacent input-assist
  lane
- whether `$` selection-wrap and `$` pair-on-type should be split into separate
  rows
- whether Obsidian adds product pressure for conservative markdown-sensitive
  pairing
- whether live-preview mode changes how delimiter syntax should be shown after
  entry

## What this source cluster is not good for

This cluster is weaker for:

- proving the exact current empty-selection `$` pair-on-type behavior in every
  editing mode
- proving whether `$$` should promote on `Enter` instead of just being detected
  as block math when the line shape is complete
- proving whether the trigger should create nodes immediately vs just pair or
  detect symbols
- replacing stronger explicit Typora or Milkdown trigger evidence
