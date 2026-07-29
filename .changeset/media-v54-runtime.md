---
"@platejs/media": major
---

Export complete `*PluginState` contracts for audio, file, video, image, media
embed, media placeholder, and React placeholder descriptors.

- Insert images with
  `editor.plugin(BaseImagePlugin).update.insert({ url }, options)`
- Insert embeds with
  `editor.plugin(BaseMediaEmbedPlugin).update.insert({ url }, options)`
- Insert headless placeholders with `editor.plugin(BasePlaceholderPlugin).update.insert(mediaType, options)`
- Insert React upload placeholders with `editor.plugin(PlaceholderPlugin).update.insertMedia(files, options)`
- Manage upload records through `PlaceholderPlugin.api` and read one with
  `editor.plugin(PlaceholderPlugin).store.get('uploadingFile', id)`
- Insert prompted image and embed URLs with `insertMediaUrl` from `@platejs/media/react`
- Remove the standalone `insertImage`, `insertMedia`, `insertMediaEmbed`,
  `insertPlaceholder`, and `getUploadingFile` helpers
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
- Rename `MediaPluginOptions` to `MediaPluginState` and
  `MediaPlaceholderOptions` to `MediaPlaceholderPluginState`
- Register media properties and required direct inline caption children in
  compiled schemas.
- Export `MediaV54MigrationPlugin` from `@platejs/media/migrations` to convert
  the published `caption: Descendant[]` property, including its single-block
  form, into direct inline children before schema fitting.
- Accept caption strings or inline children as construction input and persist
  them as direct media children.
- Use `mediaEmbed` as the media-embed plugin identity while preserving
  `media_embed` elements and relative media widths.
- Preserve standalone media embeds through clipboard sanitization by carrying
  sanitized URL and normalized width metadata on the owning figure.

**Migration:** Remove `@platejs/caption` imports and caption plugin
registration. Store captions in each media element's direct children and render
that child slot as the caption. Add the versioned migration plugin while
loading persisted caption properties:

```tsx
import { MediaV54MigrationPlugin } from '@platejs/media/migrations';
import { ImagePlugin } from '@platejs/media/react';

const plugins = [MediaV54MigrationPlugin, ImagePlugin];
```

Remove `MediaV54MigrationPlugin` after every persisted document is resaved.
