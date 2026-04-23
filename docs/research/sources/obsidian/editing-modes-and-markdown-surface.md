---
title: Obsidian editing modes and markdown surface
type: source
status: partial
source_refs:
  - ../raw/obsidian/help/en/Editing and formatting/Views and editing mode.md
  - ../raw/obsidian/help/en/Live preview update.md
  - ../raw/obsidian/help/en/Editing and formatting/Obsidian Flavored Markdown.md
updated: 2026-04-04
related:
  - docs/research/entities/obsidian.md
  - docs/research/systems/obsidian-behavior-map.md
---

# Obsidian editing modes and markdown surface

## Strongest explicit signals

- Obsidian separates views from modes:
  - reading view
  - editing view
  - live preview
  - source mode
- live preview hides most markdown syntax except near the cursor
- source mode shows full markdown syntax
- the newer editor engine explicitly made live preview a productized editing
  mode
- Obsidian Flavored Markdown is intentionally a combination of CommonMark, GFM,
  LaTeX, and Obsidian-specific extensions
- Obsidian explicitly does not render markdown syntax inside HTML elements

## Plate-relevant takeaways

- Obsidian is a strong product reference for dual editing-mode design
- live preview vs source mode is a clearer product split than many editors give
- Obsidian’s markdown surface includes product-specific syntax that should not
  be confused with strict markdown-native law

## Best use

Use this source cluster for:

- mode architecture
- source-vs-preview editing splits
- productized markdown extension behavior
