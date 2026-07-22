---
"@platejs/caption": major
---

- Install caption navigation and schema metadata through `BaseCaptionPlugin`
- Preserve caption focus when selection changes cross caption-enabled elements

**Migration:** Remove direct `withCaption(editor)` calls and install
`BaseCaptionPlugin`. Configure caption targets through the plugin's top-level
`targetPluginKeys` field.
