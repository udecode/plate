---
title: Text-substitution autoformat authority
type: open-question
status: open
updated: 2026-04-10
related:
  - docs/research/decisions/autoformat-families-are-profile-adjacent-input-assist-surfaces.md
  - docs/editor-behavior/markdown-editing-spec.md
  - docs/editor-behavior/editor-protocol-matrix.md
---

# Text-substitution autoformat authority

## Question

What should Plate treat as the authority stack for text-substitution autoformat
families such as smart quotes, punctuation replacement, arrows, legal symbols,
fractions, and other symbol shorthands?

## Current answer

This family is weaker than block shorthand or markdown-delimiter autoformat.

Current evidence is:

- strong for current Plate package behavior:
  - `@platejs/autoformat` ships the substitution tables
  - tests cover punctuation, legal symbols, smart quotes, division/per-mille,
    fractions, and undo-on-delete
- decent for mainstream typing norms:
  - smart quotes
  - em dash
  - ellipsis
  - angle quotes
- thin for direct cross-editor product authority on:
  - arrows
  - legal symbols
  - comparison/equality/operator symbol shorthands
  - fraction replacements
  - superscript/subscript unicode shorthand

The current usable authority split is:

- smart quotes, em dash, ellipsis, and angle quotes:
  - mainstream typographic norms + current Plate tests are enough to spec
- arrows, legal symbols, fractions, operator replacements, and unicode
  super/sub shorthand:
  - current Plate contract is explicit
  - stronger cross-editor authority is still thin

## Why this matters

Without this gap staying explicit, it is too easy to pretend:

- a local substitution table is universal editor truth
- markdown-native shorthand and plain symbol substitution belong to one family

They do not.

## Remaining gap

The unresolved question is how much of this family should be justified by:

- mainstream typing norms
- local current Plate contract
- future stronger Typora / Obsidian / Milkdown evidence

until that evidence is compiled, this family should stay explicit as a
profile-adjacent current contract with thinner external grounding than block or
mark shorthand
