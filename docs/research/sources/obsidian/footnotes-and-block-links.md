---
title: Obsidian footnotes and block links
type: source
status: partial
source_refs:
  - ../raw/obsidian/help/en/Editing and formatting/Basic formatting syntax.md
  - ../raw/obsidian/help/en/Editing and formatting/Obsidian Flavored Markdown.md
  - ../raw/obsidian/help/en/Linking notes and files/Internal links.md
  - ../raw/obsidian/developer/en/Reference/TypeScript API/CachedMetadata.md
updated: 2026-04-04
related:
  - docs/research/entities/obsidian.md
  - docs/research/systems/obsidian-behavior-map.md
---

# Obsidian footnotes and block links

## Strongest explicit signals

- Obsidian supports normal footnote syntax:
  - `[^id]`
  - `[^id]: definition`
- named footnotes are allowed, but still render numerically
- multiline footnotes are supported with indentation
- inline footnotes are supported with `^[...]`
- inline footnotes only work in reading view, not in Live Preview
- Obsidian also supports block references and block-link search as a distinct
  link system
- developer API docs expose cached metadata for footnotes and footnote refs

## Plate-relevant takeaways

- Obsidian is useful for syntax and product constraints around footnotes
- the reading-view-only inline-footnote rule is an important product choice
- Obsidian’s block-reference system is stronger than a plain markdown editor’s
  and belongs in the same family as linked-note navigation rather than pure
  CommonMark/GFM semantics

## Best use

Use this source cluster for:

- comparing footnote syntax support across products
- understanding how Obsidian treats inline footnotes vs live editing
- understanding the broader note-link and block-link context around footnotes
