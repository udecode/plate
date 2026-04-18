---
title: Milkdown input autoformat lanes
type: source
status: partial
source_refs:
  - ../raw/milkdown/repo/e2e/tests/input/heading.spec.ts
  - ../raw/milkdown/repo/e2e/tests/input/blockquote.spec.ts
  - ../raw/milkdown/repo/e2e/tests/input/bullet-list.spec.ts
  - ../raw/milkdown/repo/e2e/tests/input/ordered-list.spec.ts
  - ../raw/milkdown/repo/e2e/tests/input/task-list.spec.ts
  - ../raw/milkdown/repo/e2e/tests/input/bold.spec.ts
  - ../raw/milkdown/repo/e2e/tests/input/strike-through.spec.ts
  - ../raw/milkdown/repo/e2e/tests/plugin/automd.spec.ts
updated: 2026-04-09
related:
  - docs/research/entities/milkdown.md
  - docs/editor-behavior/markdown-editing-spec.md
  - docs/editor-behavior/editor-protocol-matrix.md
---

# Milkdown input autoformat lanes

## Purpose

This page isolates the executable Milkdown lanes for markdown-triggered block
and mark autoformat behavior.

## Source set

- `input/heading.spec.ts`
- `input/blockquote.spec.ts`
- `input/bullet-list.spec.ts`
- `input/ordered-list.spec.ts`
- `input/task-list.spec.ts`
- `input/bold.spec.ts`
- `input/strike-through.spec.ts`
- `plugin/automd.spec.ts`

## Strongest explicit signals

- Milkdown has executable input proof for block shorthand:
  - `# ` creates headings
  - `> ` creates blockquotes and quote continuation
  - `* ` creates unordered lists
  - `1. ` creates ordered lists, including custom starts
  - `- [ ]` and `- [x]` create task-list items
- Milkdown has executable input proof for inline markdown-delimiter autoformat:
  - `__...__` and `**...**` create strong
  - `_..._` and `*...*` create emphasis
  - `~~...~~` creates strikethrough
  - `[text](url)` creates links in the automd lane
- Milkdown also has explicit invalid-match guardrails:
  - intra-word or escaped delimiters stay text
  - malformed delimiter runs do not silently become marks

## Plate-relevant takeaways

- Milkdown is strong executable cross-check evidence for current mark and block
  shorthand behavior
- it is especially useful where Typora is broad but underspecified:
  - invalid delimiter cases
  - list custom-start behavior
  - nested list continuation
- Milkdown proves the family split:
  - block shorthand input
  - inline mark autoformat
  - markdown link-style automd

## What this source cluster is good for

Use this cluster when deciding:

- whether a shorthand actually exists as live input behavior
- invalid-match guardrails for markdown-delimiter autoformat
- ordered-list restart behavior from typed shorthand
- list, quote, and task trigger behavior beyond broad product docs

## What this source cluster is not good for

This cluster is weaker for:

- smart punctuation and other non-markdown symbol substitutions
- product-level option framing for auto pair and strict mode
- conservative live-preview-specific symbol behavior where Obsidian is stronger
