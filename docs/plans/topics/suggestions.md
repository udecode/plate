# Suggestions and tracked-change review

Page: https://claude.ai/artifact/Phwz4TDjXPEtjgqxpprE2v

Plite's native authored capability owns suggested edits: change identity, retained content, dependencies, the accepted, proposed and markup views, and atomic accept and reject. Plate owns `BaseSuggestionPlugin` (suggestion mode and decorations), `SuggestionPlugin`, the copied `SuggestionKit` and discussion UI, and `AuthoredPlugin`, which stamps every write with the editor's `userId`. The ledger asks which proposed-edit, accept/reject and attribution policies belong to Suggestions, and which reuse native authored changes (`docs/research/review-scopes/suggestions.json`). Native authored ownership (2026-09-10), the `EditorRoot authored` view input and its five intent and projection pairs (2026-09-17), plugin-owned content attributes (2026-09-14), the direct replacement of fully selected pending changes (2026-09-22) one fixed user per editor for suggestions, comments and copied UI (2026-10-07) and constructors that always create a new editor (2026-10-08) have landed, with browser cases in `apps/www/tests/browser/suggestion.spec.ts`. An editor with no `userId` writes as the local user `'local'`. `node tooling/scripts/review-ledger.mjs show suggestions` prints the scope's full history.

## Public API

An app with suggestions and comments passes its user once, to the editor. A solo editor passes none and writes as the local user.

```tsx
// content/docs/(plugins)/(collaboration)/discussion.mdx
const editor = useCreateEditor({
  plugins: [
    ...EditorKit,
    ...DiscussionKit,
    CommentsPlugin.configure({
      initialState: { initialComments, users },
    }),
  ],
  initialValue,
  userId,
});
```

Saved suggestions from several authors load through `initialValue`, with each revision's author stated.

```tsx
// apps/www/src/registry/examples/discussion-demo.tsx
const fixture = createEditor({
  plugins: EditorKit,
  initialValue: createAuthoredReviewDocument({
    accepted,
    revisions: [
      {
        id: 'playground2',
        authorId: 'bob',
        createdAt: Date.parse('2026-09-09T12:00:00.000Z'),
        change: DocumentChange.between(accepted, deleted),
      },
    ],
  }),
  userId: 'alice',
});
```

When the signed-in user changes, the app captures the outgoing editor's document and comments and passes them to the editor the hook builds for the new user.

```tsx
// content/docs/api/react-hooks.mdx
const [userId, setUserId] = useState(session.user.id);
const [snapshot, setSnapshot] = useState(saved);
const editor = useCreateEditor({
  initialValue: snapshot.document,
  plugins: [
    ...plugins,
    CommentsPlugin.configure({
      initialState: { initialComments: snapshot.comments },
    }),
  ],
  userId,
});

const switchUser = (nextUserId: string) => {
  setSnapshot({
    comments: editor.plugin(CommentsPlugin).api.toJSON(),
    document: editor.read.value(),
  });
  setUserId(nextUserId);
};
```

An app that wants revert beside suggestions configures the one authored plugin that suggestions and AI depend on. Retention is read once, when the editor is created.

```tsx
// apps/www/src/registry/examples/version-history-demo.tsx
AuthoredPlugin.configure({ initialState: { retainHistory: true } }),
```

Copied review UI reaches native authored decisions through that plugin.

```tsx
// apps/www/src/registry/components/editor/discussion.tsx
const authored = editor.plugin(AuthoredPlugin);
```

Copied suggestion UI picks the reader's own color from the editor's user.

```tsx
// apps/www/src/registry/components/editor/suggestion.tsx
if (authorId !== editor.userId) {
```

Copied comment UI names the current user from the editor.

```tsx
// apps/www/src/registry/components/editor/comment.tsx
const currentUser = useCommentUser(useEditor().userId);
```

The homepage playground loads its three authors' suggestions as data.

```tsx
// apps/www/src/registry/examples/playground-demo.tsx
initialValue: createAuthoredReviewDocument({
  accepted: baseline,
  revisions: [
    {
      id: 'playground1',
      authorId: 'alice',
      createdAt: createdAt - 900_000,
      change: DocumentChange.between(baseline, inserted),
    },
    {
      id: 'playground2',
      authorId: 'bob',
      createdAt: createdAt - 800_000,
      change: DocumentChange.between(inserted, deleted),
    },
    {
      id: overlapChangeId,
      authorId: 'charlie',
      createdAt: createdAt - 700_000,
      change: DocumentChange.between(deleted, capture()),
    },
  ],
}),
```

The version-history demo's "Edit as" control hands the document to a new editor for the chosen user.

```tsx
// apps/www/src/registry/examples/version-history-demo.tsx
onChange={(event) => {
  setSnapshot(editor.read.value());
  setAuthorId(event.target.value);
}}
```

Every constructor creates its own editor; a test that built a raw editor first now lets `createEditor` allocate it, and passing an `editor` option throws.

```tsx
// packages/platejs/src/lib/editor/withPlite.slow.ts
const editor = createReactEditor();
```

## Main changes

- `packages/plitejs/src/authored/` owns authored identity. `authored({ authorId, retainHistory })` resolves the author once per write transaction and rejects a write without one; reads stay actorless. Its author ID rule leaves through `plitejs/internal` as `isAuthorId`.
- Every Plate constructor, `createEditor` from `platejs` and `platejs/react` and `createStaticEditor`, ends in one internal `buildEditor` in `packages/platejs/src/lib/editor/withPlite.ts`, which allocates the Plite editor with `id`, `lifecycleErrorSink`, `readOnly` and `maxLength` and builds it. `assertConstructorOptions` refuses an `editor` or `migrations` key on the options a caller passed, at every constructor and on every render of `useCreateEditor` and `useStaticEditor`; it counts a key that either `in` or an own-property check along the prototype chain sees, and never calls a getter.
- `packages/platejs/src/lib/editor/editorUser.internal.ts` checks `userId` with Plite's author rule and turns an omitted or empty `userId` into the local user `'local'`. Right after allocation, `buildEditor` defines `editor.userId` as a fixed data property and records the user in a map keyed by the editor, so construction callbacks and every view read the same user. The author read looks the user up through the runtime owner and throws `This editor has no user` for an editor no constructor built.
- `packages/platejs/src/authored/AuthoredPlugin.ts` is `definePlugin('authored', { initialState: { retainHistory: false } })` extended by a stage that returns Plite's `authored()` with the editor's user and the configured retention. `BaseSuggestionPlugin`, `SuggestionPlugin` and `AIChatPlugin` depend on it.
- The author read warns once per editor through `editor.api.debug.warn`, which is silent in production, when a write or a comment is stamped with the local user while a published plugin is keyed `yjs`, because collaborators would then share one author.
- `packages/platejs/src/features/comments/BaseCommentsPlugin.ts` stamps thread creation, replies and resolution with the editor's user and keeps the `users` directory that copied UI also uses to name suggestion authors.
- `useCreateEditor` keys its editor on the normalized `userId` as it keys on `id`.

## What other editors do

Read from local checkouts at the commits named; CKEditor 5's users and track-changes packages are commercial and absent from its open-source checkout, so it was not read.

| Editor | Where the acting user lives | Tracked changes and comments share it | Changes while editing | Source |
| --- | --- | --- | --- | --- |
| BlockNote `1e26f1c` | A `userId` argument to the comment thread store, a separate `user` for presence, and a user ID on each suggestion attribution | No; only the `resolveUsers` directory is shared across comments, suggestions and versions | Not modeled | `TypeCellOS/BlockNote@1e26f1c5e:packages/core/src/y/comments/YjsThreadStore.ts:30-35`; `TypeCellOS/BlockNote@1e26f1c5e:packages/core/src/y/extensions/index.ts:28-42` |
| manuscripts track-changes `62f4d19` | `userID` plugin option held in plugin state, used for change author and reviewer | No comments | Yes, through a `setUserID` command | `Atypon-OpenSource/manuscripts-track-changes-plugin@62f4d19dd:src/plugin.ts:33-72`; `Atypon-OpenSource/manuscripts-track-changes-plugin@62f4d19dd:src/commands.ts:64-76` |
| Lexical `dd5c41b` | Playground collaboration context `name` | Yes; the comment author reads the same name as the cursor label | Not modeled | `facebook/lexical@dd5c41b13:packages/lexical-playground/src/plugins/CommentPlugin/index.tsx:709-713` |
| Tiptap `91c51be` | `CollaborationCaret` `user` object, presence only; tracked changes are not open source | No tracked changes | Not modeled | `ueberdosis/tiptap@91c51be53:packages/extension-collaboration-caret/src/collaboration-caret.ts:15-21` |
| y-prosemirror `9200946` | The Yjs client ID; a suggestion document swaps its client ID to attribute edits | No comments | Not modeled | `yjs/y-prosemirror@9200946f0:src/cursor-plugin.js:95-103` |
| prosemirror-suggest-changes `653fba7` | None; marks carry only a change ID and the app attributes | No comments | Not applicable | `handlewithcarecollective/prosemirror-suggest-changes@653fba70b:src/generateId.ts` |

## Open work

- `pnpm check` runs no browser spec over the copied examples, so a new example that cannot type passes CI (found by `docs/plans/2026-10-07-editorkit-missing-user.md`). owner: zbeyens, who decides whether CI runs a typing smoke over registered examples. stop: that decision is recorded here.
- Comments has no signal that settles once its queued saves are published, so a comment change pending at a user switch is not carried to the new editor (found by the 2026-10-07 suggestions plan panel). owner: zbeyens, who decides whether Comments exposes one. stop: that decision is recorded here.
- Plate's `YjsPlugin`, which `yjs.mdx` teaches and the copied `CollaborationPlugin` builds on, installs only at creation and cannot sit in a plugin slot, so its Yjs binding holds its namespace for as long as the document exists and a new editor on that namespace throws, with or without the hook. Every Plate plugin fails the same way when installed after creation, and the errors do not say why. `useCreateEditor` also builds its editor inside `useMemo`, whose factory StrictMode runs twice in development, so an editor that claims an outside resource, such as a Yjs binding, throws on its first mount there. (found by the 2026-10-07 suggestions plan panel). owner: zbeyens, who decides whether a Plate plugin that claims an outside resource can be installed after creation or in a slot and whether the hook builds editors outside render. stop: that decision is recorded here.
- `AuthoredPlugin` exports a checked `InternalBasePluginRuntimeExtension` annotation, and `HistoryPlugin` (`packages/platejs/src/lib/plugins/HistoryPlugin.ts` lines 48-51) an `as unknown as` cast, both transitional debt under `docs/vision/plate.md`. The package declaration build (tsdown with tsgo) cannot print Plite's private plugin brand (TS4094) even when `plitejs/internal` exports it, so the repair belongs to Plite's brand design or the declaration build. owner: zbeyens, who decides that repair. stop: a `platejs` package build passes with both exports inferred, recorded here.
- `api-reference:check` fails at base on `HistoryApi`, which `apps/www/api-reference.config.json` neither includes nor excludes (the base run of `api-reference:check`), so the generated manifest still names Comments' `currentUserId`. owner: zbeyens, who records the `HistoryApi` decision. stop: the check passes and `pnpm --filter www api-reference` regenerates the manifest.
- The playground builds one extra full `EditorKit` editor per mount to stage its three authors' revisions, unmeasured. owner: zbeyens, who decides whether to measure the homepage mount or cache the revision values per locale. stop: that measurement or cache lands.
- A raw `plitejs/authored` descriptor with its own `authorId` can still sit beside Comments and split identity, and copied suggestion cards label the local user `local`. owner: zbeyens, who decides whether `buildEditor` asserts the authored descriptor and how copied UI names the local user. stop: those decisions are recorded here.
- `createStaticEditor` is base `createEditor` with narrower types, and `useStaticEditor` is a memoized base editor that does not key on `userId` (found by plan iteration 3's panel). owner: zbeyens, who decides whether they keep separate names. stop: a `best-api-review` of the static entrypoint records the decision.
- Every unknown option key, such as a typo or `useStaticEditor`'s `enabled`, falls into the root plugin's definition, untyped (found by plan iteration 3's panels and reviews). The same decision settles typing the root plugin's keys in `buildEditor`, letting React `createEditor` pass its options untouched so every inherited option survives, and folding the per-entry refusals into one check that returns the options it checked. owner: zbeyens, who decides whether Plate constructors take a closed option set. stop: a constructor-options plan records that decision as a Defaults row.
- With every editor allocated just before construction, the failure-path restores, the empty-document fit, `resolvePlugins`' publication guard and its `clearPluginStores` at entry, and `buildEditor`'s runtime-candidate clear may be dead or duplicated; plan iteration 3's panel found an early compile failure and a root minimum of 0 that reach two of them, and no test fails without the candidate clear. owner: zbeyens, who decides whether a cleanup plan proves each one. stop: that cleanup plan's Close, or the owner dropping the item.
- `apps/www/src/generated/api-reference-manifest.json` still lists the removed `currentUserId` 3 times (`rg -c currentUserId` on 2026-10-08), because `api-reference:check` fails at HEAD on `HistoryApi` and the manifest regenerates only from built declarations (found by plan iteration 3's reflect). owner: zbeyens, who regenerates it once that check passes. stop: `rg -c currentUserId apps/www/src/generated/api-reference-manifest.json` finds none.
