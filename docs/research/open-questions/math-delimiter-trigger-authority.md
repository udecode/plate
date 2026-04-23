---
title: Math delimiter trigger authority
type: open-question
status: answered
updated: 2026-04-09
related:
  - docs/research/sources/typora/math-delimiter-triggers.md
  - docs/editor-behavior/markdown-editing-spec.md
  - docs/editor-behavior/editor-protocol-matrix.md
  - docs/editor-behavior/markdown-parity-matrix.md
---

# Math delimiter trigger authority

## Question

What should Plate treat as the authority stack for `$...$` and `$$...$$`
typing-trigger behavior?

## Current answer

This is no longer one clean winner row. It is at least three sub-surfaces:

- `$` selection-wrap over selected text
- `$` pair-on-type at an empty insertion point
- `$$` block-math detection or promotion

Current evidence is:

- strong for Typora:
  - `$` auto-pair when inline math is enabled
  - `$$` + `Return` to enter block math
- strong for Milkdown:
  - inline math input rule for `$...$`
  - block math input rule for `$$` trigger behavior
- strong for Obsidian:
  - math syntax docs exist for `$...$` and `$$`
  - pair settings exist for markdown syntax
  - `$` is explicitly in the markdown auto-pair family
  - `$` selection-wrap is explicitly documented in release history
  - block `$$` detection in-editor and block preview in Live Preview are both
    explicitly documented
- absent in current Plate runtime:
  - explicit insert APIs exist
  - current autoformat rules do not implement `$` / `$$` triggers

## Why this matters

Without this gap being explicit, it is too easy to confuse:

- parser support for math delimiters
- explicit insert transforms
- selection-wrap input assist
- pair-on-type input assist
- block detection or promotion input assist

Those are not the same surface.

## Current product answer

Plate's default rich-mode answer is now explicit:

- ship explicit-closing `$...$` conversion
- ship `$$` + `Enter` block promotion
- do not ship empty-selection opening-delimiter pair-on-type by default
- do not ship `$` selection-wrap by default

Reason:

- `$` and `$$` already share the same symbol family in the rich editor
- adding default `$` selection-wrap increases trigger ambiguity and collision
  pressure
- the Obsidian-style conservative selection-wrap branch is still valid evidence,
  but it fits better as a markdown/source-first profile decision than as the
  default rich-editor contract
