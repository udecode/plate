---
title: Typora navigation, search, outline, and TOC
type: source
status: partial
source_refs:
  - ../raw/typora/pages/outline.json
  - ../raw/typora/pages/search.json
  - ../raw/typora/pages/toc.json
  - ../raw/typora/pages/toc-levels.json
updated: 2026-04-04
related:
  - docs/research/entities/typora.md
  - docs/research/systems/typora-behavior-map.md
  - docs/editor-behavior/editor-protocol-matrix.md
---

# Typora navigation, search, outline, and TOC

## Purpose

This page compiles the Typora sources that define document-level navigation
chrome.

## Source set

- `outline.json`
- `search.json`
- `toc.json`
- `toc-levels.json`

## Strongest explicit signals

- search has a current-file find/replace surface
- search also branches into broader file-search and open-quickly territory,
  which is useful but not always core editor law
- outline supports heading navigation, current-heading highlight, and filter /
  search behavior
- TOC supports `[toc]` creation, auto-updating heading extraction, and export
  behavior
- TOC level control exists as a narrower supporting page, not the main TOC
  page

## Plate-relevant takeaways

- document navigation is its own interaction class, not just a side effect of
  cursor movement
- search, outline, and TOC are related but not identical:
  - search is query-driven navigation
  - outline is persistent heading chrome
  - TOC is a document artifact or block
- some of this surface belongs in app-shell behavior rather than core editing
  law, but Typora is still a strong reference for the split

## What this source cluster is good for

Use this cluster when deciding:

- current-file search behavior
- outline navigation
- current-heading highlight
- heading filtering
- TOC token insertion and auto-update expectations

## What this source cluster is not good for

This cluster is weaker for:

- structural editing keys inside normal content blocks
- block-editor-native TOC product shells beyond markdown-native expectations

Those need other sources or Plate decisions.
