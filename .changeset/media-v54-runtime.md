---
"@platejs/media": major
---

- Insert headless placeholders with `editor.plugin(BasePlaceholderPlugin).update.insert(mediaType, options)`
- Insert React upload placeholders with `editor.plugin(PlaceholderPlugin).update.insertMedia(files, options)`
- Use the scoped React update above instead of the standalone `insertMedia`, `insertMediaWithTx`, file classification, file-size conversion, and upload validation helpers
- Pass image uploads to `uploadImage` as data URL strings
- Upload programmatic image files at the application boundary, then call `insertImage(editor, url, options)`; remove `BaseImagePlugin.api.imageFromFiles` and `insertImageFromFiles`
- Remove the `withImage*`, `insertImagePlaceholder`, `setMediaNode`, `mediaStore`, `useMediaController*`, `placeholderStore`, and `usePlaceholder*` store and component-state exports
- Honor disabled file drops and upload configurations without a file-size limit
- Target image, embed, and placeholder insertion through exact `at` locations
- Publish pending upload state only after its placeholder transaction commits
- Expose `MediaPluginConfig` for floating-media URL controls
- Register media URLs, captions, and placeholder properties in compiled schemas
