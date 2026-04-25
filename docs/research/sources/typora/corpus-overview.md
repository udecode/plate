---
title: Typora corpus overview
type: source
status: partial
source_refs:
  - ../raw/typora/metadata.json
  - ../raw/typora/store.json
updated: 2026-04-04
related:
  - docs/research/entities/typora.md
  - docs/research/sources/typora/editor-behavior-priority-map.md
  - docs/editor-behavior/README.md
---

# Typora corpus overview

## Purpose

This page is the first compiled summary of the full raw Typora corpus now stored
in `../raw/typora`.

It exists to bridge two layers:

- the full private raw corpus in `../raw/typora`
- the older repo-safe Typora metadata entrypoints that used to live under
  `docs/editor-behavior/references/typora`

## Corpus shape

Current snapshot:

- entry count: `123`
- root pages: `112`
- Japanese pages: `7`
- Chinese pages: `4`

Main category counts:

- `how-to`: `48`
- `new`: `27`
- `basic`: `21`
- `reference`: `6`
- `tips`: `4`
- `announcement`: `2`

The corpus is broad, but only part of it is high-value for Plate's
editor-behavior and architecture work.

## Baseline before this pass

Before this pass, Plate already had useful Typora work in the repo:

- a repo-safe Typora metadata subtree under
  `docs/editor-behavior/references/typora` (now removed after migration)

And the editor-behavior stack already relied on Typora heavily:

- [markdown-standards.md](docs/editor-behavior/markdown-standards.md)
- [markdown-editing-reference-audit.md](docs/editor-behavior/markdown-editing-reference-audit.md)
- [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
- [editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)

That existing work was already good. But it was optimized for the
editor-behavior law stack, not for a general compiled research layer.

## What this pass adds

This pass adds two things the older setup did not give us cleanly:

1. a private raw evidence home in `../raw/typora`
2. the start of a reusable compiled research layer in `docs/research`

So the delta is not "we discovered Typora exists." The delta is:

- raw evidence is now stored where future agents can rely on it
- the Typora corpus can now be compiled for more than one goal
- the research layer can summarize Typora once and let many lanes reuse it

## What still does not exist yet

This corpus overview is only the first compiled page.

It does not yet provide:

- one summary per high-value Typora source page
- one reusable concept page per major Typora behavior area
- one stable system map for how Typora evidence feeds Plate decisions

Those should come next.

## Recommended next slices

Highest-value next compile slices:

1. markdown reference + shortcut keys
2. copy-and-paste + delete-range
3. links + images + html
4. search + outline + toc
5. strict-mode + auto-pair
6. release-note drift pages with real behavior signals

Lower-priority material can wait:

- licensing / purchase / activation
- theme customization
- OS support
- VS Code extension
- VLOOK pages

## Relationship to the old reference work

The old repo-safe reference work should stay.

It still does a different job:

- repo-safe metadata inventory
- editor-behavior lane entrypoint
- copyright boundary documentation

This page does not replace that.
It adds the first compiled research summary on top of the new private raw
corpus.
