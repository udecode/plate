# Atomic updates and document changes

Page: https://claude.ai/artifact/D17heqLZLTZZRkwSZC5aky

The ledger asks what becomes observable when updates commit, nest, fail or repair content, and which overlapping mutation authorities can disappear. An update publishes once. Updates never nest, a failed author throws its draft away, and every update author must return synchronously. One guard in `public-state.ts` enforces that, and `synchronous-transaction-authors.test.ts` covers 14 entry forms. An update returns its callback's answer, or `undefined` when the editor refuses it before publication, and every call that opens its own update forwards that answer, while `tx` methods report the draft. A plugin's update methods run inside that update, and small markers in `tx-only.ts` tell the runtime how to treat a method: usable only inside an open update, or where its location arguments land when a command runs on another document. Every direct call refuses a plugin's reads, because the transaction guard knows where each member came from.

## Public API

A plugin method runs inside an update, either through the one-call shortcut or on `tx`.

```ts
// content/docs/api/editor-api.mdx
editor.update.links.toggle({ href });

editor.update((tx) => {
  tx.links.toggle({ href });
});
```

A plugin's reads go in `read`. They appear on `tx`, where they see the update's draft, and every direct call refuses them.

```ts
// packages/plitejs/test/synchronous-transaction-authors.test.ts
const plugin = definePlugin('mixed', {
  read: () => ({
    read: shared,
    nested: { read: shared },
    markedRead: () => result,
  }),
  update: ({ tx }) => ({
    writeAlias: shared,
```

Plate merges each plugin's read capabilities as they are, with no marker.

```ts
// packages/platejs/src/internal/plugin/resolvePlugins.ts
return mergePluginCapabilities({ kind, owner }, ...values);
```

A control that only means something inside an open update is wrapped with `txOnly`. It stays on `tx`, the direct-call types leave it out, and a direct call throws on it.

```ts
// packages/plitejs/src/history/history-plugin.ts
const createHistoryControl = <V extends Value>(
  tx: HistoryTransaction<V>,
  mode: HistoryMode
): HistoryControlTx =>
  txOnly(() => {
    tx.tags.add(
      mode === 'push'
        ? 'history-push'
        : mode === 'merge'
          ? 'history-merge'
          : 'history-skip'
    );
  });
```

A block insert takes one placement, and `replaceEmpty` only beside `after` or the selection default. Plate narrows `after` to one block through the type parameter.

```ts
// packages/plitejs/src/interfaces/editor.ts
export type BlockInsertOptions<
  TAfter extends NodeSelectionTarget = NodeSelectionTarget,
> = (
  | {
      after?: TAfter;
      at?: never;
      before?: never;
      /**
       * Replace the empty editable text block the blocks land after, instead
       * of keeping it.
       */
      replaceEmpty?: boolean;
    }
  | { after?: never; at?: never; before: NodeTarget; replaceEmpty?: never }
  | {
      after?: never;
      /** Insert at this exact path, a slot among its parent's children. */
      at: Path;
      before?: never;
      replaceEmpty?: never;
    }
) & { select?: boolean; voids?: boolean };
```

The insert returns the keys of the top-level blocks that landed, in order, or `undefined` when nothing landed.

```ts
// packages/plitejs/test/transforms-contract.ts
const inserted = editor.update.blocks.insert(paragraph('inserted'), {
  replaceEmpty: true,
  select: true,
});

assert.deepEqual(inserted, [editor.key([1])]);
```

A Plate feature acts on the returned key instead of looking up the node it passed.

```ts
// packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts
const inserted = tx.blocks.insert(element, options);

if (!inserted) return false;

const [key] = inserted;
```

Plate's option types derive from Plite's without `Omit`, which collapsed the union.

```ts
// packages/platejs/src/lib/editor/pluginRuntimeTypes.ts
export type BlockInsertOptions = PliteBlockInsertOptions<NodeTarget>;

export type BlockUpsertOptions = Exclude<BlockInsertOptions, { at: Path }> & {
  replaceEmpty?: never;
};
```

A spec builder reads a key the same way an update does, including for a node the draft just wrote. A typed `nodes.get` read hands `key` an element.

```ts
// packages/plitejs/test/native-transaction-spec-contract.test.ts
const spec = editor.read((state) =>
  state.transaction((tx) => {
    tx.text.insert('!');
    tx.nodes.wrap({ type: 'quote', children: [] }, { at: [0] });
    const [quote] = tx.nodes.get([0], { type: 'quote' })!;
    const [paragraph] = tx.nodes.get([0, 0], { type: 'paragraph' })!;

    drafted = [tx.key(quote), tx.key(paragraph)];
  })
);
```

The spec builder types `key` with its own doc comment, which says when a prepared key goes live, and keeps `plugins` out.

```ts
// packages/plitejs/src/interfaces/editor.ts
> = Omit<EditorCoreUpdateTransaction<V, EditorSelection>, 'plugins' | 'key'> &
  Readonly<{
    /**
     * Return the key for a node or location in this draft. A node the draft
     * created carries a prepared key, which becomes its live key when the
     * editor adopts this draft.
     */
    key: EditorKeyApi;
    plugin: EditorTransactionPluginPortal<
```

In a closed schema, removing the last owner of a shared root removes the root at commit, and a root nested in a removed root goes with it. An open schema keeps a shared root after its last owner.

```ts
// packages/plitejs/test/content-root-lifecycle-contract.test.ts, closed schema
editor.update((tx) => {
  tx.selection.set(acrossTheOwner);
  tx.fragment.delete();
});
// commits; "shared:1" is gone with its last owner
```

A raw slice write whose content names a content root returns false when the schema would reject the result.

```ts
// packages/plitejs/test/slice-roots-contract.test.ts
editor.update((tx) => {
  result = tx.slice.replace(ContentSlice.closed([rootOwner('body:1')]), { at });
});
// result is false and the document is unchanged
```

A direct update call answers `undefined` when the editor refuses the update it opened, and its type says so.

```ts
// packages/plitejs/src/interfaces/editor.ts, EditorCoreUpdateMethods
slice: EditorDirectMethods<Pick<EditorTransactionSliceApi<V>, 'replace'>>;
// editor.update.slice.replace(slice): boolean | undefined
// undefined when the editor refuses the update this call opened
```

The callback form returns the callback's answer, or `undefined` when the editor refuses the update. Inside the callback, `tx` methods keep reporting the draft.

```ts
// packages/plitejs/src/interfaces/editor.ts, EditorUpdate
<R = void>(
  fn: (
    transaction: EditorUpdateTransaction<V, TPlugins>,
    context: EditorUpdateContext<BaseEditor<V, TPlugins>>
  ) => R
): R | undefined;
```

`editor.update.command` answers the same way, while `tx.command` keeps its draft boolean, so the direct form gets its own dispatch type.

```ts
// packages/plitejs/src/interfaces/editor.ts, EditorCoreUpdateMethods
/** Dispatch a typed semantic command in one update. */
command: EditorDirectCommandDispatch<BaseEditor<V, TPlugins>>;
```

The DOM clipboard inserts and the React command dispatcher open their own update when no update is open, so they answer `undefined` for a refusal too.

```ts
// packages/plitejs/src/dom/plugin/dom-editor.ts and packages/plitejs/src/react/hooks/use-plite-runtime.tsx
insertData: (data: DataTransfer) => boolean | undefined;
insertFragmentData: (data: DataTransfer) => boolean | undefined;
insertTextData: (data: DataTransfer) => boolean | undefined;
export type CommandDispatcher<TCommand extends EditorCommandDescriptor> = (
  ...input: CommandArgs<TCommand>
) => boolean | undefined;
```

`runTransfer` reads its own update's answer instead of listening for any refusal while it runs. Every exit of its callback that writes the move returns `true`, so only a refused update reads as a refusal.

```ts
// packages/plitejs/src/core/transfer.ts, runTransfer
let accepted: true | undefined;

try {
  accepted = editor.update((tx) => {
    // each exit that writes the move ends with
    return true;
  });
```

## Layer and owner

One draft and change owner and one commit boundary serve every entrance. Commands also need a non-publishing preparation phase: an input rule builds a prefix, evaluates downstream behavior against it, and discards or continues it, and Media's break handler extends the downstream spec before publication.

```text
synchronous update or command author
  → existing draft and canonical change
  → commit publication
  → observers and afterCommit
```

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| An async transaction API | Draft lifetime, concurrency and rebase obligations with no requirement; async work finishes before a fresh synchronous update. |
| Deleting the direct and configured update forms | They enter the same boundary; deleting them adds callback ceremony. |
| Deleting prepared specs and running every command live | Loses non-publishing evaluation, discarded prefixes and downstream composition. |
| Merging `DocumentChange`, `TransactionSpec` and `Commit` | A change transforms and maps, a spec adds revision-bound selection, effects and tags, a commit records an observed revision. |
| The synchronous guard in Plate | Raw Plite, descriptor portals and headless builders shared the defect. |
| Replacing every update with a prepared command | Immediate updates also stage extension publication and after-commit work. |

Before the guard, an extension method or command builder that inserted `!`, awaited, then inserted `?` published `one!` and then failed, a partial operation ([synchronous authors plan](../2026-09-11-synchronous-transaction-authors.md)).

## Main changes

- `packages/plitejs/src/core/public-state.ts` owns the update: one publish, the synchronous-author guard, the guarded `tx` groups and the command frame. The guard answers whether each plugin member came from the update group, and the command frame keeps a callable method's members.
- `packages/plitejs/src/core/plugin-dispatch.ts` holds one path walker and one dispatch. The update shortcut, both forms of `editor.plugin(P).update`, and Plate's plugin portal and `ctx.update` call them. The dispatch refuses a `txOnly` value anywhere on the path, then a member the guard reports as a plugin read, and checks the method itself even through `.call` or `.apply`. Built-in groups such as `plugins` never pass the guard, so they still run.
- `packages/plitejs/src/core/plugin-registry.ts` refuses a plugin group named after a built-in `tx` member other than `plugin`, from a table typed against the transaction's keys.
- `packages/plitejs/src/core/tx-only.ts` keeps `txOnly` and the location markers in side tables on the global object, keyed by the method, so the callable tree holds no extra keys and two copies of `plitejs` in one app agree.
- Plate's plugin resolver, `packages/platejs/src/internal/plugin/resolvePlugins.ts`, merges read capabilities without marking them. Plate's portal and `ctx.update` reach the shared dispatch through `plitejs/internal`.
- `insertBlocks` in `packages/plitejs/src/core/public-state.ts` reads the key of each landed top-level block from its slot, in the landing root, before it removes an empty source, and returns them. A landing that wrote nothing returns `undefined`.
- AI chat's insert below selects the returned keys, and its insert after a block ends the caret at the last returned key.
- Media's `insertUrl` captures the key of the block it resolves before the URL wait, checks that key is still live, and passes the caller's options through whole, so a target in another root works and a conflicting placement throws once its block resolves.
- In a schema with `unknown: 'reject'`, commit drops a shared content root with its last owner, as it already drops an exclusive one (`getOrphanedElementOwnedRoots` in `packages/plitejs/src/core/editor-schema.ts`). An open schema keeps it.
- `finalizeWithoutOrphanedRoots` in `public-state.ts` repeats its orphan pass until none drops, so roots owned inside a dropped root go too, and each deleted root gets a fresh empty owner index.
- A raw `tx.slice.replace` whose content names a content root takes the checked spec path that carried roots already take (`writeSliceAtRange`, `namesContentRoot` in `content-slice-roots.ts`), so it returns false where commit would have thrown.

- `runEditorTransaction` in `packages/plitejs/src/core/public-state.ts` keeps the author callback's answer and returns it when the update commits or changes nothing, and returns `undefined` when an `EditorRefusalError` rolls the update back before publication. A refusal error thrown after publication publishes no refusal and takes the path any other error after publication takes. `updateEditor`, the editor runtime and the view runtime forward that answer.
- `tabTable` in `packages/platejs/src/react/features/table/TablePlugin.tsx` returns its update's answer instead of a flag set inside the draft. A refused Tab answers `undefined`, which the shortcut dispatcher already treats as handled.
- `packages/plitejs/src/core/editor-lifecycle-api.ts` and `packages/plitejs/src/core/plugin.ts` return the update's answer from every direct method, the command facade and both plugin portals, and delete their captured results.
- `runCommandChain` and `applyCommandEvaluation` in `packages/plitejs/src/core/command-registry.ts`, `insertDataTransfer` in `packages/plitejs/src/dom/plugin/data-transfer-format.ts` and the `insert-data` command in `packages/plitejs/src/react/editable/mutation-controller.ts` return the update's answer when they open the update, and the draft answer inside an open one.
- `runTransfer` in `packages/plitejs/src/core/transfer.ts` reads its update's answer and drops its refusal subscription.
- Plate's `createUpdateFacade` in `packages/platejs/src/lib/plugin/createPluginContext.internal.ts` returns the update's answer, and Plate's update overloads in `packages/platejs/src/lib/editor/pluginRuntimeTypes.ts` return `R | undefined`.
- Media's `insertUrl` in `packages/platejs/src/features/media/lib/BaseMediaPlugin.ts` answers `false` for a refused insert. AI chat's `decideCurrentChange` is unchanged, because a `decide` update never reaches a commit refusal.
- The projected view-selection paste in `packages/plitejs/src/react/editable/mutation-controller.ts` answers its update's answer and keeps the view selection when the paste is refused, instead of clearing it and answering `true`.
- `EditorDirectMethods` in `packages/plitejs/src/interfaces/editor.ts` recurses into nested method groups, so a nested direct plugin method is typed `| undefined` too.
- `packages/plitejs/src/core/change/join.ts` owns a join's shape. `joinsOf` reads each section that deletes the boundary between two sibling lines. `rebaseOverJoins`, which `RootChange.transformInDocument` calls before its separated-ranges return, rebases over a join by position with the meeting texts kept apart. It moves whole lines restored between the two lines after the joined line and settles each junction by a rule on its two texts. It returns null, so base's transform runs, when a joined line moves, the two orders disagree, or a settled line lacks an inline element's spacer ([join plan](../2026-10-18-join-travels-as-join.md)).
- The Yjs export writes each join as a move of the second line's children, with the joined lines' text edits from the commit's sections. The import reads the batch's joins back from those moves before it diffs the rest, whole-root recovery included. History's character map follows each letter of a joined line through the change itself, so an undo inside two lines a peer joined lands in the joined line.

## What other editors do

This page's 2026-10-13 review read the Lexical (`dd5c41b13`), Slate (`945a484df`), Tiptap (`91c51be53`), `prosemirror-transform` (`662b7a937`) and `prosemirror-commands` (`52a84a842`) checkouts beside the repository and ran none of them. None marks a method as usable only inside an open update in its types, and none remaps a command's location arguments onto another document for it.

| Editor | A helper usable only inside an open update | A command's location arguments when the document it decides on changes |
| --- | --- | --- |
| ProseMirror | No marker; a command is `(state, dispatch?)` and runs anywhere | The caller maps positions through `Mapping.map` (`prosemirror-transform` `src/map.ts:252`) |
| Lexical | `$` helpers and node methods throw outside `editor.update` or `read` (`packages/lexical/src/LexicalUpdates.ts:103`), a naming rule with no type | No remapping; commands read the selection from the active state |
| Slate | No marker; transforms take `at` and run anywhere | `PathRef` and `PointRef` follow operations (`packages/slate/src/interfaces/path-ref.ts:24`) |
| Tiptap | No marker; a command runs directly, in `chain()` or as `can()` (`packages/core/src/CommandManager.ts:51`) | The caller's job |
| Plite | `txOnly` brands the type, and every direct call refuses it at runtime | Each command or method declares where its locations land on the review tree's proposed document |

The 2026-10-15 placement review read the same Slate, Lexical, ProseMirror and Tiptap checkouts. None takes more than one placement for an insert, and none returns a coordinate that is wrong outside one tree. Lexical's insert hands back the inserted node, the closest model to Plite's returned keys.

The 2026-10-16 spec key review read the Lexical (`dd5c41b13`), Slate (`945a484df`), ProseMirror (`prosemirror-state` `ffad5d9`, `prosemirror-transform` `662b7a9`) and Tiptap (`91c51be53`) checkouts and ran none of them. None has a pure transaction builder that hands out node identity, because none but Lexical has a live node identity at all.

| Editor | Node identity | Built ahead of time, then applied |
| --- | --- | --- |
| Lexical | `getKey()` on every node, stable across the writable copies an update makes (`packages/lexical/src/LexicalNode.ts:1008`) | No; an update runs against the live state |
| ProseMirror | None; positions, remapped through `tr.mapping` | A `Transaction` is a `Transform` built off a state and dispatched later (`prosemirror-state` `src/transaction.ts:42`) |
| Slate | None; paths | No |
| Tiptap | None; ProseMirror positions | Commands build on ProseMirror's `Transaction` |
| Plite | `NodeKey` through `editor.key`, `state.key`, an update's `tx.key` and a spec builder's `tx.key` | A `TransactionSpec`, whose builder reads draft keys |

The 2026-10-16 refused-result review read the ProseMirror (`prosemirror-state` `ffad5d9`, `prosemirror-view` `ca4c78e`), Lexical, Slate and Tiptap checkouts. None reports whether a dispatched edit survived a whole-update refusal: ProseMirror's paste and commands return `true` after `dispatch` even when a `filterTransaction` dropped the transaction. Plite's update returns its own answer, or `undefined` when it was refused.

## Open work

- The shortcut's type, `editor.update.<name>`, rebuilds each plugin method from its parameters and return, so a callable member's children vanish and an unbranded generic result becomes `unknown`. This predates the tx-markers build. owner: zbeyens. stop: the next change to `EditorBivariantMethods`, or a report of a plugin method that types wrong through the shortcut.
- Diff round 3's type change, which makes the direct-call types offer nothing for a group wrapped in `txOnly`, had no panel round after it. owner: zbeyens. stop: a review of the next change to the direct-call types in `packages/plitejs/src/interfaces/editor.ts`.
- Plate's shortcut keys accept `txOnly` names, so a shortcut naming a control compiles and throws when pressed. owner: zbeyens. stop: the next change to `PluginShortcutUpdateKey` or `inspectPluginUpdateMethods`.
- Plate's `ctx.update` falls back to the whole `tx`, untyped, when a plugin has no group. owner: zbeyens. stop: an API decision to type or cut it.
- Plite and Plate each build the same portal proxy. owner: zbeyens. stop: the `ctx.update` fallback decision above.
- The guard reads a member's origin from a second object, and an update member defined by a getter shows on `tx` only when the plugin also has a read group. owner: zbeyens. stop: the next change to `guardTransactionValue`'s origin rule.
- History's read group is callable, so its reads never reach `tx`, and the shortcut reports them not callable. owner: zbeyens. stop: the next change to history's read factory.
- History's update factory wraps three fresh closures in `txOnly` on every update. owner: zbeyens. stop: the next history performance review.
- The API reference generator publishes the declaration bundler's `$N` renames as aliases, as `schema$1` shows. owner: zbeyens. stop: the next change to `apps/www/scripts/build-api-reference.mts`.
- The command frame keeps its own path walker in `frameUpdateMethods`, which is the suggestions plan's P1.8 code. owner: zbeyens. stop: the P1.8 iteration closes.
- Two authored recording-law slow cases timed out at the final freeze, and no control isolates their cause. owner: zbeyens. stop: the next slow run on a host under load 6, which either passes them or names their cause.
- T has no verdict under the shared runner. Its three attempts on this shared host were inconclusive, with noise between two copies of the same code up to 0.096 on small updates. owner: zbeyens. stop: a run of `perf/t2-config.json` on an idle host, after `perf/setup-t2.sh` recreates its worktrees; a conclusive miss sends the design back to `architect`.
- A same-code arm cannot see noise in base, which moves every arm in a packet together. owner: zbeyens. stop: the owner adds a second base arm to the runner or declines it.
- The runner has run only on the headless Plite bench. The `benchmark` rule's Harness Repair asks a shared stats helper to prove itself on a current React artifact too. owner: zbeyens. stop: the first React line that uses the runner, which runs that proof first.
- No review read the runner's round 3 fixes, its noise pick among them. owner: zbeyens. stop: the owner's look at the `noise-revert` row, or the runner's next panel.
- The runner's load limit has no bound against the core count, and its arms have no timeout. owner: zbeyens. stop: the runner's next change.
- The paired-timing runner lives in this repository's `benchmark` rule, though nothing in it is Plate-specific. owner: zbeyens. stop: the owner moves it to the shared dotai source or keeps it here.
- No run checked the whole API reference manifest under the real config, because another session's `SchemaRoot` and `SchemaRootInput` exports are missing from `apps/www/api-reference.config.json`. owner: zbeyens. stop: those exports are listed, then `api-reference:check` runs clean.
- An inserted live node, or a fresh block holding one, from any root gets its source's key, so `tx.blocks.insert` returns a key that can resolve to the source, and inside a transaction spec the seeding can rekey the source. owner: the owner, through suggested task `t_365a2462`. stop: that task lands or is dropped.
- `tx.nodes.insert`, `tx.nodes.replace`, `tx.blocks.duplicate` and AI chat's replace path still report no keys for what they copy. owner: the owner, through suggested task `t_bcec338b`. stop: that task lands or is dropped.
- A live element from another root fails as a target, entry reads through a key from another root disagree with `nodes.path`, and List's join walks root-local paths. owner: the owner, through suggested task `task_4ed42f14`. stop: that task lands or is dropped.
- Media's `insertUrl` rejects a conflicting placement only after the URL dialog, because checking first would copy Plite's placement rules. owner: the owner. stop: Plite exports its placement check.
- The no-placement check repeats in `applyBlockInsertion`, table, Media, code block and the generated insert. owner: the owner. stop: a refactor of `applyBlockInsertion`.
- The registry JSON under `apps/www/public/r/` still shows the old insert docs and `TableInsertPlacement`. owner: the owner. stop: the checkout's next `build:registry` or `pnpm check`.
- A checked slice write, a paste or a raw `tx.slice.replace` naming a root, drops a root whose owner it covers at its own step, so a later step in the same update that puts that owner back throws at commit. owner: the owner, through suggested task `t_2fb99e63`. stop: that task lands or is dropped.
- A closed schema now drops a shared root with its last owner, so a collaborator who still shows that root loses it on merge, as an exclusive root already does. No collaboration test covers it. owner: zbeyens. stop: the next Yjs content-root review.
- The root-name check that raw slice writes run has no cost verdict. Two paired runs were inconclusive on a host above load 36, and the large cohort scored 1.123 against a line of 1.10 with same-code noise of 0.199. owner: zbeyens. stop: a run of `docs/plans/artifacts/2026-10-16-raw-root-writes/probes/raw-slice-cost.config.json` on a host under load 36, after its base, same and planted worktrees are recreated as `build/plant.mjs` and the config's paths say; a conclusive miss moves the check behind the schema's own root-type set.
- The platejs test partitions, the plitejs typecheck and the public types smoke fail at base. owner: the owner, through suggested task `t_54844d26`. stop: that task lands. The package build fails at base on a plitejs JSDoc that names Plite. owner: the owner, through suggested task `t_1436558e`. stop: that task lands.
- The Vision's promise that acceptance adopts a prepared key holds only when the draft is adopted, and replay may re-derive keys; this change lets every Plite spec author read those keys. Keys read inside `createEditor`'s internal `initialize` builder never survive, because the editor re-keys that document; only `plitejs/internal` exports it, and Plate's one caller ignores its `tx`. owner: the owner, through suggested task `t_3041aa10`, which this run folds the finding into. stop: that task lands or is dropped.
- Plate types the `tx` of its commands and input rules as an update transaction, though they run on spec drafts, so those types promise `command` and `txOnly` controls the runtime withholds. owner: the owner, through suggested task `t_b75959c5`. stop: that task lands or is dropped.
- `replaceBlocksAtSite` in `packages/plitejs/src/core/public-state.ts` receives the spec builder but reads keys through `getStateView(editor).key`, which `tx.key` can now replace. Suggested task `t_b78aada2`, started in another session, is moving that paste resolver code. owner: the owner. stop: `t_b78aada2` lands, then the next change to `replaceBlocksAtSite`.
- Six `editor.read.key(...)` calls in Plite's contract tests fail the test typecheck, because `editor.read` leaves out `key` and `editor.key` is the direct reader. owner: the owner, through suggested task `t_d4703034`. stop: that task lands or is dropped.
- [Authored root deletion](../2026-10-17-authored-root-deletion.md) lifted the refusal to suggest deleting a block that owns an exclusive content root. Suggesting a move of such a block still fails validation, which reports two owners of its root. owner: the owner, through session card `task_04df43cd`. stop: that session lands or is dropped.
- A move keeps its landing guard on until after commit observers run, so an update a commit listener opens during a move throws `lossy` and its write is lost. owner: the owner, through suggested task `t_b6f088b9`. stop: that task lands or is dropped.
- AI chat's suggestion publish stores the change id it captured before a refused commit. owner: the owner, through suggested task `task_bb870590`. stop: that task lands or is dropped.
- The registry link editor's text-only edit calls a `void` upsert, then hides its popover even when a table's Suggesting veto refuses the edit. owner: zbeyens. stop: the next change to the link editor's submit.
- A descriptor portal and Plate's context `update` types omit the `undefined` a refused call answers, and `EditorGenericMethod` does not require a return that admits it. owner: zbeyens. stop: the next change to `EditorDirectUpdate` or `EditorGenericMethod`.
- `editor.api.dom.clipboard.insert*` returns a boolean rather than the explicit outcome `docs/vision/plite.md` asks of an `api` service. owner: zbeyens. stop: an API decision on the clipboard service's outcome.
- An error that reaches `runEditorTransaction`'s final catch after publication rethrows, though `docs/vision/plite.md` sends a post-publication failure to `lifecycleErrorSink`. owner: zbeyens. stop: the next change to the transaction's notification error path.
- Plate's `on` handler pipe in `packages/platejs/src/react/utils/pipeHandler.internal.ts` counts `undefined` as unhandled, so a handler that returns a refused call's answer passes its event on, and a refused paste can reach Plite's own paste. owner: the owner, through suggested task `t_7d051d7b`. stop: that task lands or is dropped.
- `tx.dom.insertData` is typed `boolean | undefined` though a draft call never answers `undefined`. Narrowing it needs the broad editor type that reads the DOM plugin's update unprojected. owner: the owner, through suggested task `t_f9fb1a96`. stop: that task lands or is dropped.
