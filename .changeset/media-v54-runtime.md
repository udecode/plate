---
"@platejs/media": major
---

- Insert images with
  `editor.plugin(BaseImagePlugin).update.insert({ url }, options)`
- Insert embeds with
  `editor.plugin(BaseMediaEmbedPlugin).update.insert({ url }, options)`
- Insert headless placeholders with `editor.plugin(BasePlaceholderPlugin).update.insert(mediaType, options)`
- Insert React upload placeholders with `editor.plugin(PlaceholderPlugin).update.insertMedia(files, options)`
- Insert prompted image and embed URLs with `insertMediaUrl` from `@platejs/media/react`
- Remove the standalone `insertImage`, `insertMedia`, `insertMediaEmbed`,
  and `insertPlaceholder` helpers
- Remove `fileSizeToBytes`, `getMediaType`, `groupFilesByType`,
  `matchFileType`, `validateFileItem`, and `validateFiles`
- Pass image uploads to `uploadImage` as data URL strings
- Upload programmatic image files at the application boundary, then call
  `editor.plugin(BaseImagePlugin).update.insert({ url }, options)`; remove
  `editor.insert.imageFromFiles` and `insertImageFromFiles`
- Remove the `withImage*`, `insertImagePlaceholder`, `setMediaNode`, `mediaStore`, `useMediaController*`, `placeholderStore`, and `usePlaceholder*` store and component-state exports
- Honor disabled file drops and upload configurations without a file-size limit
- Target image, embed, and placeholder insertion through exact `at` locations
- Preserve plugin API inference in typed component integrations and accept
  arrays when inserting placeholder media
- Publish pending upload state only after its placeholder transaction commits
- Expose `MediaPluginConfig` for floating-media URL controls
- Register media properties and required direct inline caption children in
  compiled schemas.
- Normalize the published `caption: Descendant[]` property, including its
  single-block form, into direct inline children during normal or deferred
  complete-document loading before schema fitting.
- Accept caption strings or inline children as construction input and persist
  them as direct media children.
- Use `mediaEmbed` as the media-embed plugin identity while preserving
  `media_embed` elements and relative media widths.
- Preserve standalone media embeds through clipboard sanitization by carrying
  sanitized URL and normalized width metadata on the owning figure.

**Migration:** Remove `@platejs/caption` imports and caption plugin
registration. Store captions in each media element's direct children and render
that child slot as the caption. Document loading converts compatible persisted
`caption: Descendant[]` data without an application migration script.
