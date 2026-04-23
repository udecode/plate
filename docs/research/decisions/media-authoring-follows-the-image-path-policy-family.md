---
title: Media authoring follows the image path-policy family
type: decision
status: accepted
updated: 2026-04-09
source_refs:
  - docs/research/sources/typora/media-authoring-and-path-policy.md
related:
  - docs/research/sources/typora/links-images-and-html-behavior.md
  - docs/editor-behavior/markdown-editing-spec.md
  - docs/editor-behavior/editor-protocol-matrix.md
---

# Media authoring follows the image path-policy family

## Question

How should Plate think about richer media/embed authoring beyond the current
provider normalization contract?

## Decision

Treat local media files and current embed insertion as one authoring family led
by the image path-policy model instead of splitting image, video, audio, file,
and embed into unrelated insertion stories.

## Why

Typora is explicit that:

- local video follows the same path rules as images
- audio follows video
- upload and automatic upload are real authoring behavior
- script-based embeds need an explicit sandbox / allowlist boundary

This is a stronger model than treating media as “just a URL parser plus some
render components.”

## What this overrules

- the lazy assumption that richer media behavior is only provider metadata
- the idea that every embed-capable thing needs a separate authoring-path model

## Consequences

- richer media expansion should start with authoring/path-policy and trust
  boundaries, not only with new provider schema fields
- script-based embeds should remain explicit and constrained
- PDF iframe support should not be assumed as a baseline capability
