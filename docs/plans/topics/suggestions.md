# Suggestions and tracked-change review

Page: https://claude.ai/artifact/Aq92ZtchKMEwkei3qT937r

Plite's native authored capability owns suggested edits: review marks in the stored document, change identity, review cards, dependencies, the accepted and proposed previews, and atomic accept and reject. Plate owns `BaseSuggestionPlugin` (suggestion mode and decorations), `SuggestionPlugin`, the copied `SuggestionKit` and discussion UI, and `AuthoredPlugin`, which stamps every write with the editor's `userId`. The ledger asks which proposed-edit, accept/reject and attribution policies belong to Suggestions, and which reuse native authored changes (`docs/research/review-scopes/suggestions.json`). Native authored ownership (2026-09-10), plugin-owned content attributes (2026-09-14), the direct replacement of fully selected pending changes (2026-09-22), one fixed user per editor for suggestions, comments and copied UI (2026-10-07), constructors that always create a new editor (2026-10-08) and the review-tree pivot, which keeps pending changes as review marks in the one stored document and groups them into cards (`docs/plans/2026-10-13-review-tree-pivot.md`), and Accept all and Reject all in the copied mode menu (`docs/plans/2026-10-17-suggestions-bulk-resolve.md`), have landed, with browser cases in `apps/www/tests/browser/suggestion.spec.ts`. An editor with no `userId` writes as the local user `'local'`. The `EditorRoot authored` view input takes an `edit` or `propose` intent, or an `accepted` or `proposed` preview. Under a preview, each block shows the cards of the stored content it shows, and the suggestion hooks and copied review UI read them by the block's key or path. `node tooling/scripts/review-ledger.mjs show suggestions` prints the scope's full history.

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

Saved suggestions from several authors load through `initialValue`. Each suggested node carries the review mark that names its change, author, time and kind.

```tsx
// apps/www/src/registry/examples/discussion-demo.tsx
const suggested = (
  change: string,
  author: string,
  at: string,
  kind: 'delete' | 'insert'
): { authored: AuthoredMark[] } => ({
  authored: [{ at: Date.parse(at), author, change, kind }],
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

Copied review UI reaches native authored decisions through the one authored plugin that suggestions and AI depend on, and reads each block's cards by the block's key.

```tsx
// apps/www/src/registry/components/editor/discussion.tsx
const authored = editor.plugin(AuthoredPlugin);
```

```tsx
// apps/www/src/registry/components/editor/discussion.tsx
const cards = useSuggestionGroups(blockKey);
```

The copied discussion's target panel reads the cards of the block it targets by that block's key.

```ts
// apps/www/src/registry/components/editor/discussion.tsx
const targetGroups = useEditorSelector(
  (current) =>
    suggestions && targetKey
      ? current.plugin(AuthoredPlugin).read.groups({ at: targetKey })
      : NO_GROUPS,
  { equalityFn: sameGroups }
);
```

The Plate hook reads the cards of the block key it renders.

```ts
// packages/platejs/src/react/features/suggestion/useSuggestion.ts
return useAuthoredRead(
  () => editor.plugin(AuthoredPlugin).read.groups({ at: blockKey }),
  { equal: sameGroups, when }
);
```

The copied discussion counts a block's threads by the block's key, and its block wrapper takes only that key.

```ts
// apps/www/src/registry/components/editor/discussion.tsx
<SuggestionDiscussionBlock blockKey={blockKey}>{children}</SuggestionDiscussionBlock>

const page = read.changes({ at: blockKey, cursor, limit: 200 });
```

Copied suggestion UI colors each change by the palette slot its card's id gives it.

```tsx
// apps/www/src/registry/components/editor/suggestion.tsx
`${scope} [data-editor-authored-color="${slot}"]{${colorDeclarations(color)}}`
```

Copied comment UI names the current user from the editor.

```tsx
// apps/www/src/registry/components/editor/comment.tsx
const currentUser = useCommentUser(useEditor().userId);
```

The homepage playground marks its three authors' suggestions on the nodes of its value.

```tsx
// apps/www/src/registry/examples/playground-demo.tsx
const added = mark('playground1', 'alice', 900_000, 'insert');
const removed = mark('playground2', 'bob', 800_000, 'delete');
const overlapChangeId = 'playground3';
const overlapped = mark(overlapChangeId, 'charlie', 700_000, 'insert');
```

Every constructor creates its own editor; a test that built a raw editor first now lets `createEditor` allocate it, and passing an `editor` option throws.

```tsx
// packages/platejs/src/lib/editor/withPlite.schema-plugins.spec.ts
const editor = createReactEditor();
```

The copied mode menu decides every pending change in one call. No package call changes.

```tsx
// apps/www/src/registry/components/editor/mode-toolbar-button.tsx
const authored = editor.plugin(AuthoredPlugin);
const changes: AuthoredChange[] = [];

for (let cursor: string | undefined; ;) {
  const page = authored.read.changes({ cursor, limit: 200 });

  changes.push(...page.items);
  if (!page.cursor) break;
  ({ cursor } = page);
}

const result = authored.update.decide({ action, changes });
```

## Main changes

- `packages/plitejs/src/authored/` owns authored identity. `authored({ authorId })` resolves the author once per write transaction and rejects a write without one; reads stay actorless. Its author ID rule leaves through `plitejs/internal` as `isAuthorId`.
- Every Plate constructor, `createEditor` from `platejs` and `platejs/react`, ends in one internal `buildEditor` in `packages/platejs/src/lib/editor/withPlite.ts`, which allocates the Plite editor with `id`, `lifecycleErrorSink`, `readOnly` and `maxLength` and builds it. `assertConstructorOptions` refuses an `editor` or `migrations` key on the options a caller passed, at every constructor and on every render of `useCreateEditor`; it counts a key that either `in` or an own-property check along the prototype chain sees, and never calls a getter.
- `packages/platejs/src/lib/editor/editorUser.internal.ts` checks `userId` with Plite's author rule and turns an omitted or empty `userId` into the local user `'local'`. Right after allocation, `buildEditor` defines `editor.userId` as a fixed data property and records the user in a map keyed by the editor, so construction callbacks and every view read the same user. The author read looks the user up through the runtime owner and throws `This editor has no user` for an editor no constructor built.
- `packages/platejs/src/authored/AuthoredPlugin.ts` is `definePlugin('authored', { dependencies: [authoredRecords] })` extended by a stage that returns Plite's `authored()` with the editor's user, so it takes no options. `BaseSuggestionPlugin`, `SuggestionPlugin` and `AIChatPlugin` depend on it.
- `BaseSuggestionPlugin` writes each suggested node's `data-editor-authored-*` attributes, the change ids, kinds, authors, cards and the color slot of its first card. In `packages/platejs/src/react/features/suggestion/useSuggestion.ts`, `useSuggestionGroups(blockKey)` reads the cards of the block with that key, so a nested key reads that block's own cards, and rereads them when the component renders and when a review delta names the block. `useSuggestionChanges(path)` reads the changes of the node at that path of the mounted view. It rereads on each commit that changes the document or its state, on a view switch, and when a review delta names the path's top-level block. A nested block's path returns its own changes and those of a container around it that the preview takes away, never the pending wrap or unwrap of a container the view still shows, which that container's own path returns. Neither hook maps a key or path to an index.
- The copied discussion (`apps/www/src/registry/components/editor/discussion.tsx`) reads its target panel's cards, counts a block's threads and anchors its popover by block key. Under a preview, the popover of a suggestion or a change thread anchors on the block whose trigger was pressed last, when that block shows the open thread, and positions by that block's element. A block shows the open thread when `read.groups({ at: lastTrigger })` holds the active suggestion's card, on the suggestion route, or the card of the open thread's change, on the change route, so a card that spans two blocks shows its threads on both. The discussion forgets that block when the view changes, and opens no popover when the block does not show the thread. The popover reads the comment anchor and the active suggestion's range through their own editor selectors with range equality, so a range that moves rerenders it and typing elsewhere does not. A thread opened from a list with no active suggestion opens its change's card in every view.
- The copied suggestion toast (`apps/www/src/registry/components/editor/suggestion.tsx`) shows a refusal's `message` in Suggesting when the refusal carries a reason, such as `crosses` or `reordered`, and otherwise tells the writer to switch to Editing. Editing keeps its hint to decide the nearby suggestion first.
- The author read warns once per editor through `editor.api.debug.warn`, which is silent in production, when a write or a comment is stamped with the local user while a published plugin is keyed `yjs`, because collaborators would then share one author.
- `packages/platejs/src/features/comments/BaseCommentsPlugin.ts` stamps thread creation, replies and resolution with the editor's user and keeps the `users` directory that copied UI also uses to name suggestion authors.
- `useCreateEditor` keys its editor on the normalized `userId` as it keys on `id`.
- The copied `ModeToolbarButton` (`apps/www/src/registry/components/editor/mode-toolbar-button.tsx`) adds **Accept all suggestions** and **Reject all suggestions** under its modes when `SuggestionPlugin` is installed. Each item pages every pending change through `AuthoredPlugin`'s `read.changes` and decides them in one `update.decide` call, so one undo restores them. Both items are disabled in Viewing mode and when nothing is pending. An `invalid` result shows a `sonner` error and changes nothing.
- `touches` in `packages/plitejs/src/authored/changes.ts` treats a pending `join` or `split` of blocks, not an inline cut, as covering no unit. It sits right before its block's first unit, so it touches the content that ends right before the block and the content that opens it. The kernel's `groupAuthoredChanges` and the ledger's `startsAfter` both reach `touches` through `continues`, so both give the same cards, and a card start still depends only on the change before it.
- `continuedOwnInsert` in `packages/plitejs/src/authored/tree/record.ts` is the one rule for which of one's own pending insertions a write continues. A write continues the insertion it lands in or one at its edge, looks past the empty leaf a text split leaves, and never looks across a block edge. Text typed into an empty block that one's own pending split opened continues that split's change. A second Enter continues an Enter's change only when that Enter continued one's typing. The block split and the inline cut of one Enter take the change it picks, through `splitOf` and `splitInline`.
- `blockOccurrencesOf` in `packages/plitejs/src/authored/changes.ts` also returns where each change ends in the block. That is its last occurrence, or the outermost insertion or deletion of that change at or around it, because an element ends after its content. The ledger's `startsAfter` in `packages/plitejs/src/authored/ledger/cards.ts` reads that end through `BlockChanges.ends` in `ledger/book.ts`, from the slot that holds the change last.
- `continues` in `changes.ts` joins a change to the next one of the same author when they touch, or when the next one starts inside the first one's inserted or deleted block. The kernel's `groupAuthoredChanges` and the ledger's `startsAfter` both fold with it. Both still compare only the change before, so a sync still rechecks only entries near a changed block.
- `groupAuthoredChanges` derives each change's end from the change's own occurrence list, not from the block walk, so the slow ledger law still checks the ledger against an independent fold.

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

For bulk accept and reject, read from local checkouts at the commits in the `review_upstreams` of `docs/plans/2026-10-17-suggestions-bulk-resolve.md`, and from the Google Docs and Microsoft Word help pages; Tiptap's and CKEditor's tracked-change engines are commercial and absent, so only their docs were read. Every editor with a full review UI offers both bulk actions, and none of the open implementations proves that a bulk accept matches accepting each change in turn, which Plite's laws do.

| Editor | Bulk accept and reject | How it applies | Where the control sits | Source |
| --- | --- | --- | --- | --- |
| prosemirror-suggest-changes `653fba7` | `applySuggestions`, `revertSuggestions`, plus range variants | One transaction that walks the document, then joins block boundaries | Demo buttons above the editor | `handlewithcarecollective/prosemirror-suggest-changes@653fba7:src/commands.ts:301-460`; `demo/main.ts:153-176` |
| manuscripts track-changes `62f4d19` | No all command; `setChangeStatuses(status, ids)` takes a caller's ID set | One appended transaction, structural changes first, then text sorted by update time | None in the plugin | `Atypon-OpenSource/manuscripts-track-changes-plugin@62f4d19:src/commands.ts:50-66`; `src/changeHelpers/updateChangesStatus.ts:34-109` |
| BlockNote `1e26f1c` | `applyAllSuggestions`, `revertAllSuggestions`, delegated to `@y/prosemirror` | Not in the checkout | No caller found | `TypeCellOS/BlockNote@1e26f1c:packages/core/src/y/extensions/Suggestions.ts:121-132` |
| Tiptap Pro (docs `916bd947`) | `acceptAllSuggestions`, `rejectAllSuggestions`, by user and by range | Not documented | Toolbar and above the suggestion list | `ueberdosis/tiptap-docs@916bd947:src/content/tracked-changes/api-reference/commands.mdx:85-148` |
| CKEditor 5 (docs `14e73cc`) | `acceptAllSuggestions`, `discardAllSuggestions` commands | Not in the checkout | Not confirmed from the checkout | `ckeditor/ckeditor5@14e73cc31b:docs/features/server-side-editor-api.md:227-249` |
| Lexical `dd5c41b` | None; mark primitives only | Not applicable | None | `facebook/lexical@dd5c41b13:packages/lexical-mark/src/index.ts:28-48` |
| Google Docs | Accept all, Reject all | Not disclosed | Review suggested edits box, opened from Tools | [Google Docs Help](https://support.google.com/docs/answer/6033474?hl=en) |
| Microsoft Word | Accept All Changes, Reject All Changes, and the Shown variants per reviewer | Not disclosed | Review tab's Accept and Reject menus | [Microsoft Support](https://support.microsoft.com/en-us/word/training/track-changes-in-word) |

## Layer and owner

Plite owns authored identity, retained content, properties, dependencies, views and atomic decisions; ordinary feature commands own valid schema changes; Plate owns descriptions, markers, navigation and review interaction; applications own access policy. Write intent and displayed content are separate: an editing view keeps pending changes visible and editable, and ordinary typing never accepts pending work. A visible replacement that fully contains every affected pending change resolves them and publishes the replacement in one undoable transaction; when a retained fragment or dependency reaches outside the selection, the editor keeps the selection and content. Saved suggestions load as a prepared authored document through `initialValue`, with threads through `initialState.initialThreads`. Suggestion paint reaches the content root through plugin-owned `render.contentAttributes`, so generic Editor skins hold no suggestion or comment selectors. Under a preview, Plite's authored reads decide which cards and changes each block shows, as `docs/plans/topics/authored.md` says, and Plate passes the key or path it holds. [One map of a preview's places](../2026-10-19-preview-places-on-next.md) puts its Plate changes in these layers, and `docs/plans/topics/authored.md` lists its Plite rows.

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| `useSuggestionGroups` reads by the block key it renders, and `useSuggestionChanges` reads by its path and also wakes when the review delta names its block | Plate | `platejs/suggestion/react` | Plate glue passes the place it holds and maps nothing |
| The discussion's target panel, thread counts and popover anchor use the block key, and the suggestion toast shows a moved-content refusal's message | Plate | `apps/www` registry, `discussion` and `suggestion` | Copied UI passes the place it holds and maps nothing |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Toggling presets, accepting proposals to display them, CSS-only restoration or save-switch-restore input handlers | None keeps direct editing and visible suggestions together. |
| A parallel suggestion store or `initialState.suggestions` | Accepted content, retained content, attribution and decisions load together. |
| Seeding fixtures by replaying edits under switched identities on mount | Relocates the problem; fixtures are prepared outside the mounted lifecycle. |
| `SuggestionPlugin` configuration for view intent | An editor-wide default that needs hidden precedence or a plugin-to-view protocol; `EditorRoot authored` owns the view. |
| Restoring `main`'s independent suggestion mutation engine | Boolean mark rejection, paragraph-only splits and incomplete structural and clipboard proof. |
| Parallel accept and reject aliases or a cast protocol such as `getSuggestionEditor` | Native authored reads, decisions and inferred plugin composition already serve them. |

## Hard cuts and app migration

- `SuggestionDiscussionBlock` in the copied discussion has no `blockIndex` prop, and `blockThreadCount` takes the block key. An app with a copied `discussion.tsx` re-copies it or makes the edits the Public API fences show.
- `useSuggestionGroups(blockKey)` reads the cards of the block with that key, so a nested key reads that block's own cards, not its top-level block's. This repository mounts badges only on top-level blocks.
- The empty paragraph a preview shows when a suggestion deletes the only block shows no badge or card, so that paragraph's card shows only in Editing. An empty paragraph it shows inside a quote can still show the card of the hidden paragraph it replaces. owner: the owner; stop: the filler card task lands or the owner drops it.
- On any view, a nested block's `useSuggestionChanges(path)` returns no pending wrap or unwrap of a container the view still shows, and neither does `useSuggestionGroups`. The container's own hook returns it.
- In this repository, six places pass a place to a preview read or anchor on one, and a seventh selects a stored range on the editor it was opened from. `useSuggestionGroups`, `useSuggestionChanges`, the discussion's `targetGroups` and `blockThreadCount` hold a view place and pass it, and `useSuggestionChanges` passes its path. The discussion popover anchors by block key under a preview, as Main changes says. The docx export maps comments onto a preview through its own diff (`projectAuthoredRange` in `packages/plitejs/src/authored/format.ts`), and the comment toolbar selects a change's stored `ranges[0]`, which can select a neighbour under a preview (Open work).

## Rules

These rules bind this feature alone, so they live here instead of in `docs/vision/`.

- Suggested-edit semantics come directly from Plite's native authored
  capability. Plate may provide copied registry presentation, mode controls,
  discussion composition, and product defaults, but it does not own another
  suggestion schema, mutation engine, review scan, decision command set, or
  global input mode. Suggestion hooks and copied review UI read cards and
  changes by the block key or path they hold, and never map a preview place
  to a stored one; Plite's authored reads own that map. Human and explicitly
  tracked AI edits use the same authored
  records and decisions; temporary AI drafts remain outside that lifecycle.
  Plate attributes every authored write to the editor's `userId`, or to the
  local user `'local'` when the application passes none, so a solo editor and
  its AI suggestions need no identity setup. Collaborators pass a stable user,
  and an editor with a Yjs plugin warns in development the first time it
  attributes something to the local user. Plite still requires a non-empty
  author at every write and invents none.
  Comments keeps its independent thread lifecycle. Load existing suggestions
  through the complete `initialValue`, records included, preserving
  authors and change IDs; initialization never replays edits under switched
  identities. `EditorRoot authored` configures the exact mounted view through
  the native owner. Changed intent or preview inputs reconfigure that view;
  equal values keep later view-local mode commands. Editing and Suggesting
  both show the review tree with its marks, and suggestion mode controls
  switch only the intent. A preview view has no intent. It throws on a plain
  edit, but some other writes still change the document through it, such as
  an update that makes a decision, and undo and redo; t_f485ac77 (owner
  zbeyens) decides which of them a preview refuses. Remote collaboration
  changes land whatever the view.

## Open work

- No family of the 44 Google Docs suggestion families is certified at full parity; real list and table commands, closed review history, withdrawal and partial publication failure are the gaps. owner: the next `suggestions` review. stop: a family's browser lifecycle proof.
- The copied mode menu's Accept all and Reject all have no Base UI build or browser proof, because the Base editor-ai consumer fails on `dnd.tsx`'s tooltip (found by `docs/plans/2026-10-17-suggestions-bulk-resolve.md`). Tracked as suggested task `t_f70e26df` in `docs/plans/suggested-tasks.decisions.tsv`. owner: zbeyens, who starts or drops that task. stop: `pnpm --filter www test:create-install editor-ai` builds both consumers, or the task is dropped.

- `pnpm check` runs no browser spec over the copied examples, so a new example that cannot type passes CI (found by `docs/plans/2026-10-07-editorkit-missing-user.md`). owner: zbeyens, who decides whether CI runs a typing smoke over registered examples. stop: that decision is recorded here.
- Comments has no signal that settles once its queued saves are published, so a comment change pending at a user switch is not carried to the new editor (found by the 2026-10-07 suggestions plan panel). owner: zbeyens, who decides whether Comments exposes one. stop: that decision is recorded here.
- Plate's `YjsPlugin`, which `yjs.mdx` teaches and the copied `CollaborationPlugin` builds on, installs only at creation and cannot sit in a plugin slot, so its Yjs binding holds its namespace for as long as the document exists and a new editor on that namespace throws, with or without the hook. Every Plate plugin fails the same way when installed after creation, and the errors do not say why. `useCreateEditor` also builds its editor inside `useMemo`, whose factory StrictMode runs twice in development, so an editor that claims an outside resource, such as a Yjs binding, throws on its first mount there. (found by the 2026-10-07 suggestions plan panel). owner: zbeyens, who decides whether a Plate plugin that claims an outside resource can be installed after creation or in a slot and whether the hook builds editors outside render. stop: that decision is recorded here.
- `AuthoredPlugin` exports a checked `InternalBasePluginRuntimeExtension` annotation, and `HistoryPlugin` (`packages/platejs/src/lib/plugins/HistoryPlugin.ts` lines 48-51) an `as unknown as` cast, both transitional debt under `docs/vision/plate.md`. The package declaration build (tsdown with tsgo) cannot print Plite's private plugin brand (TS4094) even when `plitejs/internal` exports it, so the repair belongs to Plite's brand design or the declaration build. owner: zbeyens, who decides that repair. stop: a `platejs` package build passes with both exports inferred, recorded here.
- `api-reference:check` fails at base on `HistoryApi`, which `apps/www/api-reference.config.json` neither includes nor excludes (the base run of `api-reference:check`), so the generated manifest still names Comments' `currentUserId`. owner: zbeyens, who records the `HistoryApi` decision. stop: the check passes and `pnpm --filter www api-reference` regenerates the manifest.
- The playground builds one extra full `EditorKit` editor per mount to save its comment's anchor, unmeasured. owner: zbeyens, who decides whether to measure the homepage mount or cache the saved document per locale. stop: that measurement or cache lands.
- A raw `plitejs/authored` descriptor with its own `authorId` can still sit beside Comments and split identity, and copied suggestion cards label the local user `local`. owner: zbeyens, who decides whether `buildEditor` asserts the authored descriptor and how copied UI names the local user. stop: those decisions are recorded here.
- Every unknown option key, such as a typo, falls into the root plugin's definition, untyped (found by plan iteration 3's panels and reviews). The same decision settles typing the root plugin's keys in `buildEditor`, letting React `createEditor` pass its options untouched so every inherited option survives, and folding the per-entry refusals into one check that returns the options it checked. owner: zbeyens, who decides whether Plate constructors take a closed option set. stop: a constructor-options plan records that decision as a Defaults row.
- With every editor allocated just before construction, the failure-path restores, the empty-document fit, `resolvePlugins`' publication guard and its `clearPluginStores` at entry, and `buildEditor`'s runtime-candidate clear may be dead or duplicated; plan iteration 3's panel found an early compile failure and a root minimum of 0 that reach two of them, and no test fails without the candidate clear. owner: zbeyens, who decides whether a cleanup plan proves each one. stop: that cleanup plan's Close, or the owner dropping the item.
- `apps/www/src/generated/api-reference-manifest.json` still lists the removed `currentUserId` 3 times (`rg -c currentUserId` on 2026-10-08), because `api-reference:check` fails at HEAD on `HistoryApi` and the manifest regenerates only from built declarations (found by plan iteration 3's reflect). owner: zbeyens, who regenerates it once that check passes. stop: `rg -c currentUserId apps/www/src/generated/api-reference-manifest.json` finds none.
- Cards around an Enter inside a link still split, as at HEAD, because a cut covers its whole link half and the end cut sorts before its content (found by `docs/plans/2026-10-17-card-grouping.md`). Suggested task t_3fbf4c17 tracks it. owner: zbeyens. stop: t_3fbf4c17 lands or is dropped.
- Typing, or a second Enter, at the start of a filled line one's own Enter made takes a new change in the same card, and so does a second Enter on the empty line a plain Enter made. The www spec that records the owner's key sequence pins a second Enter before struck text as a change of its own (the `follow` Default of `docs/plans/2026-10-17-card-grouping.md`). owner: zbeyens, who decides whether such a write joins the Enter's change. stop: the owner says follow, or drops it.
- The recording law "rejecting everything undoes a suggestion" fails at HEAD at seeds -353941099 and 426485304 (found by `docs/plans/2026-10-17-card-grouping.md`). Suggested task t_54844d26 holds both. owner: zbeyens. stop: t_54844d26 lands or is dropped.
- Another author's typing inside one's own suggested line still splits one's card around it, and so does an edit inside one's own struck line followed by striking the next line, as at base. Both need a card to keep its farthest member's end, which makes a card start depend on every earlier member. Suggested task t_72e8736d holds both. owner: zbeyens, who starts or drops that task. stop: t_72e8736d lands or is dropped.
- The ledger law never builds adjacent own whole-line changes, and the plugin tests read only the ledger, so no suite test reaches the kernel's new end. A probe on the final bytes shows the kernel and the ledger agree on six such cases (`docs/plans/artifacts/2026-10-17-card-own-split/probe-kernel-final-a2.log`). Suggested task t_17ead528 widens the law's generator. owner: zbeyens, who starts or drops that task. stop: t_17ead528 lands or is dropped.
- In WebKit, the playground image test's click on a paragraph lands on a Preview button and then on the sticky site header, and times out, at HEAD and at base too. Suggested task t_095b0272 holds it. owner: zbeyens, who starts or drops that task. stop: t_095b0272 lands or is dropped.
- On a loaded host the authored suite's large-document tests run past their 5 s limit, at base too. Suggested task t_0a13d914 holds them. owner: zbeyens, who starts or drops that task. stop: t_0a13d914 lands or is dropped.
- Suggesting now records typing, deleting and formatting inside a list item, and still refuses Enter, indenting and joining items (`docs/plans/2026-10-17-list-suggesting-insert.md`). The suggestions plan still says typing in a list item refuses, in its behavior row at line 79, its Defaults row at line 89, its P2.2 box and the refusal paragraph at line 177. S14 of the suggestions scenarios still expects Enter at a list item's end to suggest a new item, and the list refusal toast does not offer Switch to Editing. owner: zbeyens, through P3.1 of the suggestions plan. stop: P3.1's lists plan lands.
- The comment toolbar's jump from a thread to its suggestion selects the change's stored `ranges[0]` on the editor it was opened from (`apps/www/src/registry/components/editor/comment-toolbar-button.tsx`, `readCommentTarget`), so under a preview it can select a neighbour. owner: zbeyens, through a suggested task. stop: that task lands or is dropped.
- Under a preview, a thread opened from a list opens no popover unless its block's trigger was pressed last (`apps/www/src/registry/components/editor/discussion.tsx`, `snapshot.lastTrigger`), because no Plite read names the view blocks that show a change. A read built on the ledger's `places.readers`, which publication already uses, would anchor the popover and the comment toolbar's jump above. owner: zbeyens, through a suggested task. stop: that task lands or is dropped.
- DOCX export maps comment ranges through its own document diff (`packages/platejs/src/docx/export/lib/exportDocx.tsx`, `projectAuthoredRange`), so a comment beside a moved piece can still export at the wrong place. owner: zbeyens, through a suggested task. stop: that task lands or is dropped.
- `node tooling/scripts/review-ledger.mjs check` refuses `docs/plans/2026-10-12-suggestions-complete.md`, whose Evidence does not reconcile `2026-10-13-review-tree-pivot`. owner: zbeyens, through a suggested task. stop: that task lands or is dropped.
- The suggestion preview in `discussion.tsx:593` drops mentions, equations and dates, and no test proves mention deletion in suggestion mode under the authored-change model. Found on 2026-10-08 and unverified since. owner: Ziad. stop: each is fixed through the Bug fix playbook or dropped with a reason. Carried from the [2026-10-06 knowledge plan](../2026-10-06-knowledge-reorg.md).
- `apps/www/tests/browser/suggestion.spec.ts`'s case 'restores another author's suggestion after canceling text typed inside it' fails in Chromium, Firefox and WebKit, where the restored suggestion's text comes back inside "annotations" instead of inside "overlapping". It fails the same at `83634eef5e`, before phase B, and in a 2026-10-16 run (`docs/plans/2026-10-16-code-block-10k-typing.decisions.tsv` row 28), so this plan did not cause it (`docs/plans/artifacts/generated-id-split/step13/playtest-base/specs-a1.md`). From [Construction values](../2026-10-23-construction-values.md). owner: zbeyens. stop: the Bug fix playbook fixes it or the owner drops it.
