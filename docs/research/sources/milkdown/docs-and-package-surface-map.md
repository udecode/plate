---
title: Milkdown docs and package surface map
type: source
status: partial
source_refs:
  - ../raw/milkdown/repo/docs/api
  - ../raw/milkdown/repo/packages
  - ../raw/milkdown/sync-metadata.json
updated: 2026-04-04
related:
  - docs/research/entities/milkdown.md
  - docs/research/systems/milkdown-behavior-map.md
---

# Milkdown docs and package surface map

## Purpose

This page compiles the Milkdown lanes that explain package ownership and public
surface shape.

## Strongest explicit signals

- `docs/api/*.md` maps public pages to real package ownership
- the repo `packages/*` tree tells us which workspace packages exist
- package-local READMEs and docs breadcrumbs show where ownership lives

## Plate-relevant takeaways

- docs are useful for locating the owning package
- docs are not automatically the final behavior truth
- Milkdown's package layout is useful for understanding how a markdown-first
  editor productizes presets, plugins, and transformer seams

## High-value pages and packages

- `docs/api/preset-commonmark.md`
- `docs/api/preset-gfm.md`
- `docs/api/plugin-indent.md`
- `@milkdown/preset-commonmark`
- `@milkdown/preset-gfm`
- `@milkdown/plugin-indent`
- `@milkdown/transformer`
- `@milkdown/crepe`

## What this source cluster is good for

Use it when deciding:

- which package owns a behavior
- how Milkdown exposes public API surfaces
- where to read next in the local clone
