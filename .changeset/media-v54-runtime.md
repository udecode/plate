---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Copy the media node renderers, `media-toolbar`, and `media-preview-dialog` for rendering, URL editing, preview state, navigation, scale, translation, and download behavior. Each copied renderer reads its typed element and primitive editor state directly. Remove public media UI stores, providers, monolithic components, and UI-only hooks.

Export complete `*PluginState` contracts for audio, file, video, image, media embed, and media upload descriptors.

- Insert images with `editor.plugin(BaseImagePlugin).update.insert({ url }, options)`
- Insert embeds with `editor.plugin(BaseMediaEmbedPlugin).update.insert({ url }, options)`
- Author an unbound draft with `editor.plugin(BaseMediaUploadPlugin).update.insert({ kind }, options)`
- Admit every file batch through `editor.plugin(BaseMediaUploadPlugin).update.submit(files, options)`, using either block insertion options or `{ slot: nodeKey }`
- Configure `transport(file, { signal, onProgress })`, `rules`, `maxFiles`, and one-shot `onError` handling on `BaseMediaUploadPlugin`
- Cancel a live request with `api.cancel(key)` and subscribe to its task through `store.get('task', key)`
- Keep draft intent as `{ type: 'upload', kind, children }`, bind request authority to its `NodeKey`, and complete through the installed media descriptor's schema type
- Insert prompted image and embed URLs through the installed media descriptor's `api.insertUrl(getUrl, options)`; copied UI supplies the prompt
- Remove the standalone `insertImage`, `insertMedia`, `insertMediaEmbed`, `insertPlaceholder`, and `getUploadingFile` helpers
- Remove `fileSizeToBytes`, `getMediaType`, `groupFilesByType`, `matchFileType`, `validateFileItem`, and `validateFiles`
- Pass image uploads to `uploadImage` as data URL strings
- Upload programmatic image files at the application boundary, then call `editor.plugin(BaseImagePlugin).update.insert({ url }, options)`; remove `editor.insert.imageFromFiles` and `insertImageFromFiles`
- Remove the `withImage*`, `insertImagePlaceholder`, `setMediaNode`, `mediaStore`, `useMediaController*`, `placeholderStore`, and `usePlaceholder*` store and component-state exports
- Honor disabled file drops and upload configurations without a file-size limit
- Keep package upload defaults limit-free; copied `MediaKit` owns concrete file counts and size quotas
- Target image, embed, and media-upload insertion through exact `at` locations or a live source node through `after`; `replaceEmpty` replaces only an empty writable text block
- Insert before an exact live block with `BlockInsertOptions.before`; the stable `NodeKey` resolves in the active root-aware transaction view
- Validate each submitted batch atomically and start configured uploads only after its draft transaction commits
- Preserve draft slots in Plate JSON and internal slices while omitting unresolved drafts from external HTML and static output
- Let a structural HTML encoder return `null` to omit that element while preserving serializable siblings
- Expose the `MediaPlugin` union for typed floating-media URL controls
- Rename `MediaPluginOptions` to `MediaPluginState`
- Use `MediaUploadPluginState` for the shared upload owner; the React `MediaUploadPlugin` adds optional native-drop adaptation
- Register media properties and required direct inline caption children in compiled schemas.
- Convert legacy v53 media identities, captions, missing URLs, and retired placeholder IDs through the shared `migrateV54` application document step.
- Accept caption strings or inline children as construction input and persist them as direct media children.
- Model image, file, audio, video, and embed as non-void objects with editable direct caption children. Keep empty-caption assets meaningful and transfer only selected caption text when the owner is not selected.
- Move the unselected caption suffix into a fresh paragraph on Enter without duplicating the media node, including expanded selections that cross into the following paragraph.
- Use capability name `mediaEmbed` and persisted element type `mediaEmbed`, persist media alignment as `textAlign`, and preserve relative media widths.
- Set media widths through the descriptor's standard update: `editor.plugin(ImagePlugin).update.set({ width }, { at: element })`.
- Preserve standalone media embeds through clipboard sanitization by carrying sanitized URL and normalized width metadata on the owning figure.
- Persist source image geometry as `naturalWidth` and `naturalHeight`, separate from the user-selected rendered `width`.
- Persist optional `name` only on File nodes; other media nodes share only URL, rendered width, and direct caption children.
- Validate intrinsic image dimensions as positive safe integers.

**Migration:** Remove `@platejs/caption` imports and caption plugin registration. Store captions in each media element's direct children and render that child slot as the caption. Add the shared v54 document step while loading persisted caption properties:

```tsx
import {
  defineDocumentMigrations,
  migrateDocument,
  migrateV54,
} from 'platejs/migrations';

import { fingerprint as v53Fingerprint } from './migrations/v54/from';

const migrations = defineDocumentMigrations({
  plugins: EditorKit,
  schema: EditorSchema,
  sourceFingerprints: { 53: v53Fingerprint },
  steps: { 54: migrateV54 },
});

const current = migrateDocument(saved, { migrations }).output;
```

The same application step handles legacy media identities and captions in one pass.

Use intrinsic image dimensions and semantic file video providers without upload workflow fields.
