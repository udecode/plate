---
title: Autoformat families are distinct input-assist surfaces
type: decision
status: accepted
updated: 2026-07-23
source_refs:
  - docs/research/sources/typora/markdown-shorthand-and-inline-autoformat.md
  - docs/research/sources/milkdown/input-autoformat-lanes.md
  - docs/research/concepts/behavior-packaging-candidates.md
  - docs/research/systems/editor-behavior-architecture.md
related:
  - docs/editor-behavior/markdown-editing-spec.md
  - docs/editor-behavior/editor-protocol-matrix.md
---

# Autoformat families are distinct input-assist surfaces

## Question

How should Plate model block shorthand, inline mark autoformat, and text
substitution autoformat?

## Decision

Treat them as distinct input-assist surfaces, not parser law and not one
automatic packaging unit.

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
- parity should track them as input-assist surfaces instead of pretending they
  are the core markdown parse contract
- each family must independently pass the behavior-promotion protocol before it
  becomes a public plugin; non-universal behavior alone is not enough
