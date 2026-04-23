---
title: Typora media authoring and path policy
type: source
status: partial
source_refs:
  - ../raw/typora/pages/media.json
  - ../raw/typora/pages/images.json
  - ../raw/typora/pages/upload-image.json
updated: 2026-04-09
related:
  - docs/research/entities/typora.md
  - docs/research/sources/typora/links-images-and-html-behavior.md
  - docs/editor-behavior/markdown-editing-spec.md
---

# Typora media authoring and path policy

## Purpose

This page compiles the Typora evidence that matters for richer media and embed
authoring beyond the current minimal Plate contract.

## Source set

- `media.json`
- `images.json`
- `upload-image.json`

## Strongest explicit signals

- local video files use the same path rules as images
- local audio files follow the same rule as video
- iframe embeds are supported as a first-class embed path
- some script-based sharing snippets are supported only for selected cases and
  run in a sandboxed iframe
- Typora explicitly leaves room for an allowlist model for those script-based
  embeds in future updates
- PDF-in-iframe is not treated as a native baseline support path
- image authoring is not just insert-by-url:
  - drag and drop
  - clipboard paste
  - local file selection
  - copy/move/rename image path operations
  - root-path and relative-path policy
  - uploader integration and automatic upload modes

## Plate-relevant takeaways

- richer media authoring should not be treated as a totally separate contract
  from images; local video/audio/media paths belong to the same authoring
  family
- provider normalization is only part of the story; path policy and upload
  policy are real product behavior too
- script-based embeds need an explicit trust boundary and allowlist/sandbox
  story instead of open-ended execution
- PDF-in-iframe should not be assumed as a baseline supported media path just
  because generic iframe syntax exists

## What this source cluster is good for

Use this cluster when deciding:

- whether local media files follow image path policy
- whether upload and replacement behavior belongs in the same authoring family
- whether script-based embed support should be allowlisted and sandboxed
- whether PDF iframe support belongs in the baseline contract

## What this source cluster is not good for

This cluster is weaker for:

- low-level selection and destructive-key behavior
- richer provider schema design for Plate-specific data models

Those still need local contract choices and code evidence.
