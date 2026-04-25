---
title: Math delimiter trigger audits must split selection-wrap, pair-on-type, and block detection
date: 2026-04-09
category: best-practices
module: editor-behavior
problem_type: best_practice
component: documentation
symptoms:
  - Math trigger law gets flattened into one fake `$` / `$$` surface with one supposed winner.
  - Obsidian looks absent when it actually owns a narrower selection-wrap or block-detection variant.
  - Protocol rows overfit Typora-style pair-on-type behavior and hide real product disagreement.
root_cause: inadequate_documentation
resolution_type: documentation_update
severity: medium
tags: [editor-behavior, markdown, math, obsidian, typora, milkdown, specs]
---

# Math delimiter trigger audits must split selection-wrap, pair-on-type, and block detection

## Problem

Math delimiter input behavior looks deceptively simple. It is easy to talk about
`$...$` and `$$...$$` as one surface and then assign one editor as the
authority.

That is wrong.

The actual behavior splits at least three ways:

- selection-wrap with `$` over an existing selection
- pair-on-type with `$` at an empty insertion point
- block detection or promotion with `$$`

## Symptoms

- Obsidian gets described as “partial” even though it explicitly owns part of
  the surface.
- Typora and Milkdown appear to settle the whole question because their
  pair-on-type behavior is easier to spot.
- Protocol rows describe one blended trigger story even when the sources prove
  different sub-surfaces.

## What Didn't Work

- Treating `$` selection-wrap and `$` pair-on-type as the same rule.
- Treating `$$` line-shaped block detection and `$$` plus `Enter` promotion as
  the same rule.
- Asking which editor “wins math triggers” instead of asking which editor owns
  each concrete row.

## Solution

Split the surface before choosing authority.

For Plate's math-trigger lane, the safer split is:

1. selected text + `$`
2. empty selection + `$`
3. `$$` block trigger

Then assign authority per row:

- Obsidian is explicit for conservative `$` selection-wrap and for `$$` block
  detection / preview history
- Typora is explicit for `$` pair-on-type and `$$` plus `Return` promotion
- Milkdown is explicit executable-style evidence for pair-on-type and block
  trigger mechanics

Once the rows are split, the spec can say something honest:

- Obsidian matters here
- Typora also matters here
- they are not proving the same mechanic

## Why This Works

It stops the authority model from smearing different behaviors together.

That matters because the product choices are different:

- selection-wrap is conservative and safer for markdown-sensitive symbols
- pair-on-type is faster but more aggressive
- block detection can exist without `Enter`-driven promotion

If those are written as one row, one editor always looks wrong or absent when
it is actually proving a different branch of the decision tree.

## Prevention

- For math input work, never ask for one global “math trigger winner.”
- Split `$` selection-wrap from `$` pair-on-type before assigning authority.
- Split `$$` block detection from `$$` plus `Enter` promotion before assigning
  authority.
- When Obsidian evidence comes from release-note history, treat that as real
  product evidence instead of downgrading it to syntax-only.

## Related Issues

- [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
- [editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
- [math-delimiters-and-pair-settings.md](docs/research/sources/obsidian/math-delimiters-and-pair-settings.md)
- [math-delimiter-trigger-authority.md](docs/research/open-questions/math-delimiter-trigger-authority.md)
