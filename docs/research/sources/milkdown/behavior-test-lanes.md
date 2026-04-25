---
title: Milkdown behavior test lanes
type: source
status: partial
source_refs:
  - ../raw/milkdown/repo/e2e/tests
  - ../raw/milkdown/repo/packages
updated: 2026-04-04
related:
  - docs/research/entities/milkdown.md
  - docs/research/systems/milkdown-behavior-map.md
  - docs/editor-behavior/markdown-editing-reference-audit.md
---

# Milkdown behavior test lanes

## Purpose

This page compiles the executable behavior lanes inside Milkdown.

## Strongest explicit signals

- `input/*` lanes cover live typing behavior
- `shortcut/*` lanes cover shortcut ownership
- `transform/*` lanes cover markdown round-trip and transform behavior
- package-local unit tests capture narrower parser, serializer, keymap, and
  plugin edge cases

## Plate-relevant takeaways

- Milkdown is strongest when Plate needs executable cross-check evidence
- tests are the truth serum; package docs are the ownership map
- Milkdown is especially useful when Typora docs are broad but thin on edge
  cases

## High-value suites in the repo clone

- `input/blockquote.spec.ts`
- `input/bullet-list.spec.ts`
- `input/ordered-list.spec.ts`
- `input/task-list.spec.ts`
- `shortcut/list.spec.ts`
- `transform/blockquote.spec.ts`
- `transform/list.spec.ts`
- `transform/hardbreak.spec.ts`
- `plugin/clipboard.spec.ts`
- `plugin/automd.spec.ts`
- package-local tests like:
  - `preset-commonmark/.../trailing-space.spec.ts`
  - `preset-gfm/.../table-header-row.spec.ts`
  - `core/internal-plugin/keymap.test.ts`

## What this source cluster is good for

Use it when deciding:

- whether a behavior really exists in Milkdown
- whether a docs claim is backed by executable proof
- whether Plate behavior has an open-source cross-check lane
