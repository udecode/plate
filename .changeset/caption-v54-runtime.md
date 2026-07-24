---
"@platejs/caption": major
---

- Model captions as required exclusive content roots owned by configured media
  elements.
- Render caption content through Plate's typed interactive and static
  `slots.contentRoot('caption')` surface.
- Add `migrateLegacyCaptionDocument` for explicit conversion of embedded
  caption arrays into `EditorDocumentValue.roots`.
- Remove the textarea caption model, caption state hooks, and
  `withCaption` navigation override.

**Migration:** Configure caption owners through
`CaptionPlugin.configure({ targetPluginKeys })`, move each embedded `caption`
array into a document root, and persist its key as `childRoots.caption`.
`migrateLegacyCaptionDocument` performs that conversion once at the
persistence boundary. Render the root through `props.slots.contentRoot` instead
of `CaptionTextarea`.
