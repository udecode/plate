---
title: Obsidian developer editor-extension surface
type: source
status: partial
source_refs:
  - ../raw/obsidian/developer/en/Plugins/Editor/Editor extensions.md
  - ../raw/obsidian/developer/en/Plugins/Editor/Editor.md
  - ../raw/obsidian/developer/en/Plugins/Editor/Markdown post processing.md
updated: 2026-04-04
related:
  - docs/research/entities/obsidian.md
  - docs/research/systems/obsidian-behavior-map.md
---

# Obsidian developer editor-extension surface

## Strongest explicit signals

- Obsidian’s editor is powered by CodeMirror 6
- editor extensions are CodeMirror extensions
- Obsidian exposes an `Editor` abstraction on top of the underlying editor
- developer docs distinguish:
  - edit-mode operations via `Editor`
  - reading-view customization via markdown post processors
- custom markdown code block processors are first-class extension seams

## Plate-relevant takeaways

- Obsidian is useful for architecture and extension-system comparisons
- it gives a clean example of separating reading-view post processing from
  edit-mode editor extensions
- it is a strong productized example of CM6 extension surfaces

## Best use

Use this source cluster for:

- editor-engine layering questions
- extension seam comparisons
- reading-view vs editing-view customization boundaries
