---
title: Markdown-native editing authority
type: concept
status: strong
updated: 2026-04-04
related:
  - docs/research/entities/typora.md
  - docs/research/sources/typora/markdown-native-editing-foundations.md
  - docs/research/decisions/typora-is-primary-markdown-native-ux-authority.md
  - docs/editor-behavior/markdown-standards.md
---

# Markdown-native editing authority

## Definition

This is the reference used when deciding how a markdown-native editing surface
should feel while the user is typing and navigating rich markdown content.

It is not just about parser correctness. It is about editing intent:

- paragraph creation
- line-break handling
- link and image interaction
- markdown-source expansion
- markdown-native keyboard ownership

## Current research conclusion

For Plate's markdown-native lane, Typora is the strongest practical authority.

Why:

- it is explicitly markdown-first
- it exposes a wide documented behavior surface
- it covers more than serialization
- it gives real product behavior for interactive markdown editing

## Limits

Typora is strong, but not universal.

It is weaker for:

- some destructive edge-key details
- broad document-style table feel
- collaboration and review surfaces
- block-editor-native constructs with no markdown-native counterpart

Those need other sources or explicit Plate-owned decisions.

## Use

Use this concept when a question is:

- "what should markdown-native editing feel like?"
- "who owns this markdown-native interaction?"
- "is this parser-only, or real editing law?"
