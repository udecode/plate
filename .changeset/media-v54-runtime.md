---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Copy the media node renderers, `media-toolbar`, and `media-preview-dialog` for rendering, URL editing, preview state, navigation, scale, translation, and download behavior. Each copied renderer reads its typed element and primitive editor state directly. Remove public media UI stores, providers, monolithic components, and UI-only hooks.

Export complete `*PluginState` contracts for audio, file, video, image, media embed, and placeholder descriptors.

- Insert images with `editor.plugin(BaseImagePlugin).update.insert({ url }, options)`
- Insert embeds with `editor.plugin(BaseMediaEmbedPlugin).update.insert({ url }, options)`
- Insert headless placeholders with `editor.plugin(BasePlaceholderPlugin).update.insert({ mediaType }, options)`
- Insert upload placeholders with `editor.plugin(BasePlaceholderPlugin).update.insertMedia(files, options)`
- Configure `upload(file, { signal, onProgress })` on `BasePlaceholderPlugin`; it owns validation, request lifetime, and guarded replacement of the same live placeholder
- Start or cancel an existing placeholder's upload with `api.upload(key, file)` or `api.cancelUpload(key)`; subscribe to its progress through `store.get('uploadTask', key)`
- Insert prompted image and embed URLs through the installed media descriptor's `api.insertUrl(getUrl, options)`; copied UI supplies the prompt
- Remove the standalone `insertImage`, `insertMedia`, `insertMediaEmbed`, `insertPlaceholder`, and `getUploadingFile` helpers
- Remove `fileSizeToBytes`, `getMediaType`, `groupFilesByType`, `matchFileType`, `validateFileItem`, and `validateFiles`
- Pass image uploads to `uploadImage` as data URL strings
- Upload programmatic image files at the application boundary, then call `editor.plugin(BaseImagePlugin).update.insert({ url }, options)`; remove `editor.insert.imageFromFiles` and `insertImageFromFiles`
- Remove the `withImage*`, `insertImagePlaceholder`, `setMediaNode`, `mediaStore`, `useMediaController*`, `placeholderStore`, and `usePlaceholder*` store and component-state exports
- Honor disabled file drops and upload configurations without a file-size limit
- Keep package upload defaults limit-free; copied `MediaKit` owns concrete file counts and size quotas
- Target image, embed, and placeholder insertion through exact `at` locations or a live source node through `after`; `replaceEmpty` replaces only an empty writable text block
- Preserve plugin API inference in typed component integrations and accept arrays when inserting placeholder media
- Publish pending upload state only after its placeholder transaction commits
- Expose the `MediaPlugin` union for typed floating-media URL controls
- Rename `MediaPluginOptions` to `MediaPluginState`
- Use `PlaceholderPluginState` for the shared upload owner; the React `PlaceholderPlugin` adds DOM input adaptation
- Register media properties and required direct inline caption children in compiled schemas.
- Convert legacy v53 media identities, captions, missing URLs, and retired placeholder IDs through the shared `migratePlateV54` application document step.
- Accept caption strings or inline children as construction input and persist them as direct media children.
- Split media captions into a following paragraph on Enter without duplicating the media node.
- Use capability name `mediaEmbed` and persisted element type `mediaEmbed`, persist media alignment as `textAlign`, and preserve relative media widths.
- Set media widths through the descriptor's standard update: `editor.plugin(ImagePlugin).update.set({ width }, { at: element })`.
- Preserve standalone media embeds through clipboard sanitization by carrying sanitized URL and normalized width metadata on the owning figure.
- Persist source image geometry as `naturalWidth` and `naturalHeight`, separate from the user-selected rendered `width`.
- Persist optional `name` only on File nodes; other media nodes share only URL, rendered width, and direct caption children.
- Validate intrinsic image dimensions as positive safe integers.

**Migration:** Remove `@platejs/caption` imports and caption plugin registration. Store captions in each media element's direct children and render that child slot as the caption. Add the shared v54 document step while loading persisted caption properties:

```tsx
import { defineDocumentMigrations, migratePlateV54 } from 'platejs/migrations';

const migrations = defineDocumentMigrations(EditorSchema, {
  steps: { 54: migratePlateV54 },
  unversioned: 53,
});
```

The same application step handles legacy media identities and captions in one pass.

Use intrinsic image dimensions and semantic file video providers without upload workflow fields.
