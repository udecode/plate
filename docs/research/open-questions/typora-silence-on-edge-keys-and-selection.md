---
title: Typora silence on edge keys and selection
type: open-question
status: open
updated: 2026-04-04
related:
  - docs/research/entities/typora.md
  - docs/research/systems/typora-behavior-map.md
  - docs/editor-behavior/markdown-editing-reference-audit.md
---

# Typora silence on edge keys and selection

## Question

Where is Typora still thin as a direct source for Plate behavior decisions?

## Current answer

Typora is strong on broad editing intent and many interaction surfaces, but it
is still thinner on:

- some destructive edge-key behavior
- some reverse navigation cases
- structural multi-block selection law
- some atom-boundary details

## Why this matters

These gaps are exactly where agents are tempted to over-lock the spec from
vibes.

That should not happen.

## Current rule

When Typora is thin here:

- use stronger adjacent evidence if it exists
- otherwise keep the area explicit as a Plate-owned decision
- do not pretend Typora settled it
