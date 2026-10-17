# Uploads

Page: https://claude.ai/artifact/N8QhXGaSxd4cKQjR2ZHhuu

Who owns an upload after its draft moves, disappears, is undone or outlives its editor, and where does a dropped file land? `platejs/upload` admits a validated batch of files as `upload` drafts, starts each transfer after commit through a Files SDK client, keeps the file, progress and failure keyed to the live draft, and completes into the installed media schema. Removal, retagging, plugin cleanup and whole-document replacement revoke a request, and history never restarts one. The package specs prove those laws. The React plugin lands every dropped file at the block edge under the pointer, through the block-drag landing rules. In Chromium, the copied kit's picker and drop paths pass (`apps/www/tests/browser/files-sdk.spec.ts`), and so do drops into an editor set up as the upload guide shows (`apps/www/tests/browser/clipboard-upload.spec.ts`). Storage, gateway policy and durable URLs stay in the copied `upload-browser`, `upload-r2` and `upload-s3` recipes.

## Public API

The copied Upload kit configures the React plugin with a Files SDK client, a URL resolver and batch rules. Dropped files need no option.

```tsx
// apps/www/src/registry/components/editor/upload.tsx
export const UploadKit = [
  UploadPlugin.configure({
    component: UploadElement,
    initialState: {
      client,
      getUrl: ({ key }) => {
        const url = new URL(endpoint, window.location.origin);
        url.searchParams.set('op', 'download');
        url.searchParams.set('key', key);
        return url.href;
      },
      maxFiles: 5,
      onError: showUploadFailure,
      rules: {
        // The kit's audio, blob, pdf, text and video rules take the same shape.
        image: {
          kind: 'image',
          maxBytes: 4 * 1024 * 1024,
          maxFiles: 3,
          minFiles: 1,
        },
      },
    },
  }),
];
```

Callers submit files beside a block or into a draft slot, and cancel a live task.

```tsx
// content/docs/(guides)/upload.mdx
editor.plugin(UploadPlugin).update.submit(files, { after: blockKey });
editor.plugin(UploadPlugin).update.submit(files, { slot: draftKey });
editor.plugin(UploadPlugin).api.cancel(draftKey);
```

The media toolbar's file picker submits at the selection.

```tsx
// apps/www/src/registry/components/editor/media-toolbar-button.tsx
const upload = editor.plugin(UploadPlugin);
if (!upload.installed) return;

upload.update.submit(updatedFiles);
```

An app that keeps uploads but refuses dropped files vetoes file landings, so no edge admits them and the drop inserts nothing.

```tsx
// content/docs/(guides)/upload.mdx
import { transferVeto } from 'platejs';
import { definePlugin } from 'platejs/react';

export const RefuseFileDropsPlugin = definePlugin('refuseFileDrops', {
  contributions: [transferVeto.of(({ payload }) => payload.kind === 'files')],
});
```

## What other editors do

Read from each editor's source at the commits below; none was run. No editor has an on and off key for file drops: each turns them off by leaving out its file handler or adding a handler that runs first. CKEditor 5 alone computes the drop line and the drop from one target function, as Plate's kit does. Tiptap and Lexical let files win when a drop also carries HTML; ProseMirror, BlockNote and CKEditor 5 let HTML win.

| Editor | Where a dropped file lands | Drop line matches the landing | Turning file drops off | Files plus HTML on drop |
| --- | --- | --- | --- | --- |
| Tiptap (FileHandler) | The app's `onDrop` gets a text position from `posAtCoords` and inserts where it likes | No; Dropcursor shows the pointer position and never checks files | Leave out the extension or its `onDrop` | Files win; paste lets HTML through |
| Lexical | Rich text sets the selection at the drop caret, or after a non-text node, then the app's `DRAG_DROP_PASTE` listener inserts | No custom line; the draggable-block line ignores files | Leave out the listener, or register a `DROP_COMMAND` listener at higher priority | Files win; paste takes files only without HTML or text |
| ProseMirror | Core never inserts files; a `handleDrop` prop owns them | Dropcursor is optional and never checks files | Files are off by default | HTML wins unless `handleDrop` claims the drop |
| BlockNote | Before or after the nearest block by its vertical midpoint, or into an empty block, built in | No; the cursor and the file landing use different rules | `disableExtensions: ['dropFile']` | HTML wins |
| Slate | Core selects the drop caret and calls `insertData`; an app override inserts files | No; the browser caret only | Files are off by default | The app decides; core ignores files |
| CKEditor 5 | `DragDropTarget` picks the range for the marker and the drop; image insertion can shift a block image again | Yes, one target function | Disable `uploadImage`, or add a `clipboardInput` listener at higher priority | Non-empty HTML wins |

Sources: `ueberdosis/tiptap@91c51be53c4655ef07e29ec489471524debfa0ca:packages/extension-file-handler/src/FileHandlePlugin.ts`, `facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988:packages/lexical-rich-text/src/index.ts`, `ProseMirror/prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534:src/input.ts`, `ProseMirror/prosemirror-dropcursor@061f64ac887a9fac2bf5ef36d31ad4d13a4ecd36:src/dropcursor.ts`, `TypeCellOS/BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163:packages/core/src/api/clipboard/fromClipboard/handleFileInsertion.ts`, `ianstormtaylor/slate@945a484df2497e4c448b33f417b0de2a49840032:packages/slate-react/src/components/editable.tsx` and `ckeditor/ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da:packages/ckeditor5-clipboard/src/dragdroptarget.ts`.

## Layer and owner

| Job | Owner |
| --- | --- |
| Draft schema, batch admission, tasks, completion and revocation | `BaseUploadPlugin` in `platejs/upload` |
| Pasted files | `BaseUploadPlugin`'s `insertData` interceptor, after the caret's block |
| Dropped files with an indicator and landing rules | React `UploadPlugin` in `platejs/upload/react`, for every external drag that carries files; the copied DnD kit paints the line |
| Dropped files in an editor with only `BaseUploadPlugin` | Plite's default drop runs `insertData`, so the paste interceptor places them after the drop caret's block |
| Draft, progress and preview UI | Copied `upload.tsx` |
| Storage, gateway access and durable URLs | Copied `upload-browser`, `upload-r2` and `upload-s3` recipes over `lib/files.ts` |

A user picks files, sees their reserved places and progress, keeps editing, and can retry, cancel, undo or remove an upload. Completion changes only the intended live node, secondary roots included, through its root-aware `NodeKey` and the installed media descriptor's schema type. Invalid input leaves the document unchanged and invalid results stay visible as failures. A file, controller, progress, error or preview URL is a local resource; the document holds only draft intent, so reload or collaboration never invents a request. The plugin consumes the Files SDK's single-file `UploadClient` operation with the SDK's own types, and a synchronous `getUrl(UploadOutcome)` maps the outcome to a stable application address.

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| An app-written generic transport API or mirrored storage facade | The owner chose one supported SDK over replaceability; no other job survived. |
| Per-media pending nodes with optional `url` | Spreads the draft state across four media schemas, renderers and codecs without removing it. |
| Inserting only after upload completes, or a transient overlay | Loses reserved position, movement and undo while transport runs. |
| Requests owned by React, or duplicated per media plugin | Breaks the remount law and shared batch admission. |
| A general job scheduler in Plite, or a session framework | The bug was Plate discarding an identity Plite already had. |
| A runtime environment switch choosing the storage provider | One explicit provider recipe per app. |
| The `PlaceholderPlugin`, single-file `api.upload` plus batch `insertMedia` split, and caller-visible `replaceMedia` | Split count semantics let a three-image limit accept four, and bare-path completion wrote into the main root. |

## Main changes

- `BaseUploadPlugin` keys each task by draft `NodeKey` and admitting view, starts transfer after commit, and completes through the installed media descriptor, so authored and named-root identity stays in the admitting runtime.
- A transfer veto refuses a move that carries a draft into another root.
- DnD no longer routes files; the React plugin resolves file landings through `resolveDropTarget`'s `files` option.
- The React `UploadPlugin` handles every external drag that carries files. No state flag gates its `dragOver` and `drop` handlers.
- In an editor with the React plugin, a drag that carries files never reaches `BaseUploadPlugin`'s `insertData` interceptor. The interceptor still handles pasted files, and file drops in an editor that installs only `BaseUploadPlugin`; text and HTML drops still reach `insertData` and pass through it.
- The hover check stays approximate, as the 2026-10-02 landing plan recorded. It checks one `file`-kind stand-in per file, and an engine that hides the file count during `dragover` checks one stand-in in all; the drop checks every file but still with `file`-kind stand-ins.

## Open work

- Live S3, multipart, browser-native progress, a deployed route with real application session policy, native file drag outside Chromium and Firefox and WebKit are unproven; R2 ran live against a private bucket. owner: zbeyens. stop: a deployed provider run.
- The gateway must deny explicit-key writes in `authorize` and recheck write access for proxy PUT; Files SDK 2.6.0 serializes an app-thrown `FilesError` denial as 500, so a fixed release with verified 401 and 403 behavior, or an app response boundary, gates gateway publication. owner: zbeyens. stop: that release or boundary lands with a route test.
- Decide whether the Editable should draw the drop line itself, so an editor without the copied DnD kit shows where files and blocks land; `docs/vision/plate.md` line 1133 gives the line to the kit today, and the in-flight `layout` plan is changing `dnd.tsx`. owner: zbeyens. stop: the next `dnd` review, or 2026-11-30.
- A drop whose full file count no longer fits the edge shown during hover can land at another edge or be refused; only a browser that hides the count during `dragover` reaches it. owner: zbeyens. stop: a report of a misplaced file drop, or 2026-11-30.
- The hover and drop checks use `file`-kind stand-ins while `submit` creates each draft with its own kind, already tracked in `docs/plans/2026-10-02-dnd-schema-derived-landing.md`. Under a schema that constrains upload draft kind by position, a real Chromium drop throws `EditorSchemaValidationError` out of the handler as an uncaught page error, loses the drop and skips `onError` (`docs/plans/artifacts/2026-10-09-uploads-review/probes/kind-prefix-browser-a3.log`). No schema in this repository does that, as of 2026-10-10; the fix checks the real kinds before insertion. owner: zbeyens. stop: the first schema that constrains upload draft kind, or 2026-11-30.
- `resolveDropTarget`'s JSDoc in `packages/plitejs/src/dom/plugin/dom-editor.ts` says it resolves "the innermost block edge or side the transfer dry pass admits", but near a nested container's shared edge the band goes to the outermost admitting container (`dom-drag.ts` band loop). owner: zbeyens. stop: the next change to `dom-drag.ts` landing bands, or 2026-11-30.
