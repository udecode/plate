---
title: Milkdown corpus overview
type: source
status: partial
source_refs:
  - ../raw/milkdown/sync-metadata.json
  - ../raw/milkdown/repo/packages
  - ../raw/milkdown/repo/e2e/tests
updated: 2026-04-04
related:
  - docs/research/entities/milkdown.md
  - docs/research/sources/milkdown/editor-behavior-priority-map.md
  - docs/editor-behavior/README.md
---

# Milkdown corpus overview

## Purpose

This page is the first compiled summary of the Milkdown reference corpus.

It bridges:

- the upstream raw clone at `../raw/milkdown/repo`
- the raw entrypoint in `../raw/milkdown`
- the older repo-safe inventory docs that previously lived under
  `docs/editor-behavior/references/milkdown`

## Corpus shape

Current snapshot:

- clone head: `6a4db480b00db8dd0322b517117dfa2154f3e2e2`
- packages: `30`
- api docs: `29`
- e2e specs: `48`
- package unit tests: `28`
- e2e examples: `9`
- storybook stories: `14`
- fixtures: `14`
- root docs: `4`

## Baseline before this pass

Before this pass, Plate already had a strong repo-safe Milkdown inventory:

- package catalog
- API-doc catalog
- e2e catalog
- examples catalog
- storybook catalog
- unit-test catalog
- metadata snapshot

That older setup was already useful, but it was still an inventory surface more
than a reusable compiled research layer.

## What this pass adds

This pass adds:

1. a raw-layer entrypoint in `../raw/milkdown`
2. a compiled research layer in `docs/research/sources/milkdown`

So the delta is:

- future agents now have one raw entrypoint and one upstream raw clone
- the old TSV shim is gone
- Milkdown can now be reused outside the narrow editor-behavior folder
- the corpus can be summarized by behavior lane, not just by file inventory

## Structural take

Milkdown's behavior truth is split across several lanes:

1. e2e input tests
2. e2e shortcut tests
3. e2e transform tests
4. package-local unit tests
5. preset-commonmark and preset-gfm packages
6. transformer parser and serializer packages
7. API docs
8. examples and storybook

That means tests beat docs when the question is behavior, and docs beat tests
when the question is package surface or public API ownership.
