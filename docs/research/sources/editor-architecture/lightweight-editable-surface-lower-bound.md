---
title: Lightweight editable-surface lower bound
type: source
status: partial
source_refs:
  - ../edix/README.md
  - ../use-editable/README.md
  - ../rich-textarea/README.md
updated: 2026-04-14
related:
  - docs/research/entities/edix.md
  - docs/research/entities/use-editable.md
  - docs/research/entities/rich-textarea.md
  - docs/research/systems/editor-architecture-landscape.md
---

# Lightweight editable-surface lower bound

## Purpose

Compile the lower-bound references that keep the full editor architecture from
turning into overbuilt nonsense.

## Strongest evidence

- edix is a small `contenteditable` state manager for modern apps
- use-editable is a renderable editable hook that restores DOM expectations for
  React
- rich-textarea keeps native textarea behavior while adding highlighting,
  autocomplete, and caret-aware UI

## What this means

### 1. Not every editable surface needs the full overlay system

These repos are useful because they define the lower bound honestly.

They show where:

- native text or small editable surfaces win
- caret-position APIs are enough
- full document-runtime semantics would be overkill

### 2. Lower-bound references sharpen the scope of the heavy architecture

The right reaction to these repos is not “copy them into Slate v2”.

It is:

- keep the heavy overlay architecture for serious document editors
- avoid dragging that architecture into lightweight surfaces that do not need it

## Take for Slate v2

- design the overlay system for the serious editor lane
- keep small-surface APIs explicit and narrow when that lane eventually matters
