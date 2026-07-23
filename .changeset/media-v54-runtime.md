---
"@platejs/media": major
---

- Insert images with `editor.plugin(BaseImagePlugin).update.insert(url, options)`
- Insert embeds with `editor.plugin(BaseMediaEmbedPlugin).update.insert(url, options)`
- Insert headless placeholders with `editor.plugin(BasePlaceholderPlugin).update.insert(mediaType, options)`
- Insert React upload placeholders with `editor.plugin(PlaceholderPlugin).update.insertMedia(files, options)`
- Insert prompted image and embed URLs with `insertMediaUrl` from `@platejs/media/react`
- Remove the standalone `insertImage`, `insertMedia`, `insertMediaEmbed`, `insertPlaceholder`, media-specific placeholder, `insertMediaWithTx`, file classification, file-size conversion, and upload validation helpers
- Pass image uploads to `uploadImage` as data URL strings
- Upload programmatic image files at the application boundary, then call `editor.plugin(BaseImagePlugin).update.insert(url, options)`; remove `BaseImagePlugin.api.imageFromFiles` and `insertImageFromFiles`
- Remove the `withImage*`, `insertImagePlaceholder`, `setMediaNode`, `mediaStore`, `useMediaController*`, `placeholderStore`, and `usePlaceholder*` store and component-state exports
- Honor disabled file drops and upload configurations without a file-size limit
- Target image, embed, and placeholder insertion through exact `at` locations
- Publish pending upload state only after its placeholder transaction commits
- Expose `MediaPluginConfig` for floating-media URL controls
- Register media URLs, captions, and placeholder properties in compiled schemas
