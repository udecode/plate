---
title: Lightweight editable-surface lower bound
type: source
status: partial
source_refs:
  - ../edix/README.md
  - ../use-editable/README.md
  - ../rich-textarea/README.md
  - ../rich-textarea/src/textarea.tsx
  - ../markdown-editor/src/CustomEditor/CustomEditor.tsx
updated: 2026-10-25
related: []
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

### 3. A textarea with an overlay avoids offset accounting

rich-textarea renders a real `textarea` and paints the styled text on a backdrop behind it with `pointer-events: none` (`inokawa/rich-textarea@9652cad73d:src/textarea.tsx:30-65`, `:321`), so editing, selection and IME stay the browser's. markdown-editor projects Markdown into `contenteditable` instead and maps the caret by walking text nodes and counting characters (`ReactLibraries/markdown-editor@c75679cc36:src/CustomEditor/CustomEditor.tsx:150-216`). Its README warns that a custom component breaks when it changes the character count of its children (`README.md:137`). For a lightweight text surface, prefer the native textarea with an overlay (inferred, kept from the 2026 candidates review). Limit: source read on 2026-10-25, nothing run.

## Take for Slate v2

- design the overlay system for the serious editor lane
- keep small-surface APIs explicit and narrow when that lane eventually matters
