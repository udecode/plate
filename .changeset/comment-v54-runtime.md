---
'platejs': major
---

- Replace `@platejs/comment` plugins and comment marks with `CommentsPlugin` from `platejs/comments/react`, conversation records, and durable range attachments
- Keep thread rows in the app's own tables and save `api.ranges()`, a record of plain ranges keyed by thread ID, with each document revision. Load both through `initialState.initialComments` as `{ threads, ranges }`. Reload starts a fresh local undo stack
- `api.ranges()` includes creates and draft publishes still waiting on `mutate`. It stays readable in every layout and passive cleanup, and throws once the editor is destroyed. Creating a comment changes no document value, so `api.subscribeRanges(listener)` tells an app that saves on change when a thread gains or loses its saved range
- Load each thread row and range on its own. A malformed thread, a duplicate ID or a range outside the document drops alone and appears in `getSnapshot().issues`. A range whose thread did not load is kept as an orphan that maps and saves until its thread loads or `api.discardOrphan(id)` removes it
- Replace every comment for the full document with `api.replace({ threads, ranges })` after replacing the matching document; late mutations from the retired snapshot cannot publish
- `initialState.mutate` receives the range a create or draft publish saves as `request.range`
- Await comment actions and configure `initialState.mutate` for authorization and persistence before publication; reopen resolved discussions independently of document undo
- Report a throwing comment listener or decoration refresher to `lifecycleErrorSink`, so later listeners still run and a saved action still answers `applied`; a listener may call any action
- Join successful local thread creation to document history and serialize its replay with later mutations of the same thread
- Resolve comment attachments and discussion positions in each mounted editor's projection while retaining one conversation and target
- Comment on text in a board note or another named root. `begin`, `createThread`, `createDraft`, `initialComments` and `replace` take a range whose points name its root, and a command range without a root is in the root of the view that runs it. `api.ranges()` keeps a note thread's root on both points. Each view highlights only the threads in its own root, the page's view reads a thread in any root through its own projection, `idsAt` finds threads in the root of the location it gets, and a nested view reads another root's thread as `unavailable`. `exportDocx` leaves a note thread's comment out with a `comment-range` warning, since Word export does not write note text
- Export `extractLegacyCommentRanges` from `platejs/migrations` for offline conversion of comment marks into a sanitized document, one range per thread ID and a report. Empty texts, voids and inline element edges never split a thread; a thread split by visible unmarked text gets no range and a `split-group` row that lists each part's range. Comment marks in a media caption are removed and reported at the media element's path: a thread's mark as an `invalid-range` row, and a malformed, anonymous or draft-only mark with the row it gets in the document body
- Record threads, replies and resolutions as the author of the view the action runs through, such as `createEditorView(editor, { authorId: 'ai' })`, else as the editor's `userId`, or as the local user, `'local'`, when the editor has none
- Carry app data on threads and messages. Pass `data`, a JSON object typed `CommentData`, to `createThread`, `createDraft` and `reply(id, body, { data })`, and change it with `setData(id, data, { messageId })`, which runs through `mutate` with the operation `'setData'`; `null` removes it. A saved or committed `data: null` reads as no data; a saved row whose `data` is any other value that is not a JSON object drops with an `invalid-thread` load issue

**Migration:** Supply thread rows and the ranges saved with the same document revision as the editor value:

```tsx
import { CommentsPlugin } from 'platejs/comments/react';
import { createEditor } from 'platejs/react';

const editor = createEditor({
  plugins: [
    CommentsPlugin.configure({
      initialState: { initialComments: { ranges, threads }, users },
    }),
  ],
  initialValue,
  userId,
});

const revision = {
  commentRanges: editor.plugin(CommentsPlugin).api.ranges(),
  document: editor.read.value(),
};
```

Run `extractLegacyCommentRanges` before loading persisted documents that contain legacy comment properties, and pass its document and ranges to one `migrateDocument` call:

```ts
const { document, ranges, report } = extractLegacyCommentRanges(legacy, {
  threadIds,
});
const migrated = migrateDocument(document, { migrations, ranges, source: 53 });
```
