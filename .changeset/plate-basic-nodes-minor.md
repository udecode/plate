---
'@udecode/plate-basic-nodes': minor
---

- New `toggle` Transforms Added:
  - Block plugins with new `toggle` transforms: `BlockquotePlugin`, `H1Plugin`, `H2Plugin`, `H3Plugin`, `H4Plugin`, `H5Plugin`, `H6Plugin`.
  - All mark plugins in this package now also feature a `toggle` transform, including: `BoldPlugin`, `ItalicPlugin`, `UnderlinePlugin`, `CodePlugin`, `StrikethroughPlugin`, `SubscriptPlugin`, `SuperscriptPlugin`, `KbdPlugin`, `HighlightPlugin`.
- Individual Heading Plugins Available:
  - `H1Plugin`, `H2Plugin`, `H3Plugin`, `H4Plugin`, `H5Plugin`, and `H6Plugin` offer a flexible alternative to the general `HeadingPlugin`, allowing granular control over heading level inclusion and configuration (e.g., custom components, shortcuts per level).
- Plugin Consolidations into `@udecode/plate-basic-nodes`:
  - `KbdPlugin` (formerly from `@udecode/plate-kbd`).
  - `HighlightPlugin` (formerly from `@udecode/plate-highlight`).
