---
title: Autoformat families are profile-adjacent input-assist surfaces
type: decision
status: accepted
updated: 2026-04-09
source_refs:
  - docs/research/sources/typora/markdown-shorthand-and-inline-autoformat.md
  - docs/research/sources/milkdown/input-autoformat-lanes.md
  - docs/research/concepts/profile-adjacent-options.md
related:
  - docs/editor-behavior/markdown-editing-spec.md
  - docs/editor-behavior/editor-protocol-matrix.md
---

# Autoformat families are profile-adjacent input-assist surfaces

## Question

How should Plate model block shorthand, inline mark autoformat, and text
substitution autoformat?

## Decision

Treat them as profile-adjacent input-assist surfaces, not parser law.

Split them into at least three families:

- block shorthand autoformat
- inline mark autoformat
- text-substitution autoformat

## Why

- they change typing behavior and editor feel
- they do not define the canonical parse or serialize contract by themselves
- different families want different authorities and different guardrails
- some symbols are pair-on-type
- some are selection-wrap-first
- some are plain text substitutions with no markdown ownership at all

## Consequences

- editor-behavior law should not flatten them into one generic "autoformat"
  row
- protocol rows should split block, mark, and text-substitution scenarios
- parity should track them as profile-adjacent input-assist surfaces instead of
  pretending they are the core markdown parse contract
