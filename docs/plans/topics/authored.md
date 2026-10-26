# Authored changes and selective reversal

Page: https://claude.ai/artifact/6FpJFueXmmfsFVMGXU8R5p

Plite's native authored capability records who changed what, keeps pending suggestions reviewable, and decides them atomically. The ledger asks which native contract should retain authorship and reversible edits without requiring a particular review UI (`docs/research/review-scopes/authored.json`). Pending changes live in the editor's one stored document as review marks: inserted content carries an insert mark, and struck content stays in place under a delete mark (`packages/plitejs/src/authored/tree/record.ts`). Accepting or rejecting a change rewrites that document (`packages/plitejs/src/authored/tree/resolve.ts`), and the accepted and proposed previews are views of it that throw on a plain edit (`packages/plitejs/src/authored/tree/proposed.ts`). Some other writes still change the document through them, such as an update that makes a decision, and undo and redo; t_f485ac77 (owner zbeyens) decides which of them a preview refuses. Remote collaboration changes land whatever the view. The document's `records` hold the review facts marks cannot show (`packages/plitejs/src/authored/facts/records.ts`), and a ledger reads the marks into changes and cards, a card being one author's adjacent pending changes (`packages/plitejs/src/authored/ledger/cards.ts`). One map per preview run says which stored content each preview place shows, and the command frame, the recorder, review reads and the change delta all read it (`packages/plitejs/src/authored/ledger/places.ts`). The review-tree pivot (`docs/plans/2026-10-13-review-tree-pivot.md`) replaced the earlier design, in which a second, projected document held pending changes and every write became an operation in a causal graph. Suggestions, AI review and copied review UI build on this capability; `docs/plans/topics/suggestions.md` covers the Plate side. `node tooling/scripts/review-ledger.mjs show authored` prints the scope's full history.

## Public API

An editor records changes as its user once `AuthoredPlugin` or a plugin that depends on it is installed.

```tsx
// content/docs/(guides)/authored-changes.mdx
const editor = createEditor({
  plugins: [BaseParagraphPlugin, AuthoredPlugin],
  initialValue: [
    { type: "paragraph", children: [{ text: "Review this sentence." }] },
  ],
  userId: "alice",
});

const authored = editor.plugin(AuthoredPlugin);
```

A mounted view picks its input intent. Both intents show the stored document with its review marks.

```tsx
// content/docs/(plugins)/(collaboration)/suggestion.mdx
<EditorRoot editor={editor} authored={{ intent: 'propose' }}>
```

A preview shows every pending change accepted, or every one rejected, and throws on a plain edit, but some other writes still change the document through it, such as an update that makes a decision, and undo and redo; t_f485ac77 (owner zbeyens) decides which of them a preview refuses. Remote collaboration changes land whatever the view.

```tsx
// content/docs/(guides)/authored-changes.mdx
authored.api.setView({ preview: "proposed" });
```

A preview reads review changes by the key or path of a node it shows.

```tsx
// content/docs/plite/libraries/plite-authored.mdx
const preview = createEditorView(editor, {
  authored: { preview: 'proposed' },
});
const inBlock = preview.read.authored.changes({ at: blockKey });
```

An app reads a page of pending changes in document order and decides the changes it read.

```tsx
// content/docs/(guides)/authored-changes.mdx
const page = authored.read.changes({ authorId: "alice", limit: 50 });
const result = authored.update.decide({
  action: "accept",
  changes: page.items,
});
```

Copied review UI reads a block's cards by the block's key, then decides a card together with the changes a `blocked` result named.

```tsx
// apps/www/src/registry/components/editor/discussion.tsx
const cards = useSuggestionGroups(blockKey);
```

```tsx
// apps/www/src/registry/components/editor/discussion.tsx
const result = authored.update.decide([
  { action, groups: [group] },
  ...(relatedChanges.length > 0
    ? [{ action, changes: relatedChanges }]
    : []),
]);
```

A feature contributes a veto for blocks that review marks cannot hold yet, and Suggesting refuses each write that touches such a block. The veto's second input says whether the write changes only what the block holds. So the list veto lets typed and formatted text in an item record as suggestions, and refuses Enter, indenting and joins.

```ts
// packages/platejs/src/features/list/lib/BaseListPlugin.ts
authoredVeto.of((element, touch) =>
  element.listType && touch !== 'content' ? 'list' : null
),
```

Suggesting can delete a block that owns a content root. The block is struck and keeps its root, unmarked, until someone decides the deletion.

```ts
// packages/plitejs/test/authored-root-deletion.test.ts
const { editor, refusals } = make({
  selection: blockSelected,
  unknown,
  value: initial(unknown),
});

editor.update((tx) =>
  tx.command(editorCommands.replaceSlice, {
    slice: ContentSlice.closed([p('x')]),
  })
);

assert.deepEqual(refusals, []);
const { main, roots } = marked(editor);

assert.deepEqual(main[0], ['card', 'delete:bob:1', { body: 'b1' }]);
assert.deepEqual(roots, ['b1']);
```

Exports pick a projection explicitly.

```tsx
// content/docs/(guides)/authored-changes.mdx
const markdown = editor.api.markdown.serialize({ projection: "proposed" });
```

Inside plitejs, the recording map takes the resolve result's children together with the lines completion built, so no caller can drop them.

```ts
// packages/plitejs/src/authored/ledger/runs.ts, resolveRun
const { aligned, change: alignment } = changeOf(
  aligning,
  resolution ?? { children: output, unstored: NOTHING_UNSTORED },
  context
);
```

`ElementIdPlugin` marks its id `unique`, which also sets `copy` and `split` to `'drop'`, so the call leaves those two options out and no commit or load leaves two blocks with the same id. The type allows `unique` only on generated element metadata with an exact key. The compiler also requires a target that does not depend on place and that holds on every type that can take a held type's place, as Plate's block id does on every element or narrowed to blocks. A unique key has one declaration. It cannot be a set, and a block keeps it when its type changes or it lands somewhere new, as Plate's block id does.

```ts
// packages/platejs/src/lib/plugins/element-id/ElementIdPlugin.ts
id: schema.elementProperty(
  property.string({ generate: initialState.generateId }),
  {
    role: 'metadata',
    target: target.group('element'),
    typeChange: 'preserve-if-allowed',
    unique: true,
  }
),
```

`Batch`, the step type that `getHistory(editor)` returns in each stack, has one optional field that only undo steps carry. A redo step's `change` is what redo applies, and it leaves out what the original commit's settle stage wrote. The field is `unsettle`, since `HistorySettlement` already names the pending result of a history call (`docs/vision/plite.md`).

```ts
// packages/plitejs/src/history/history.ts
export interface Batch<_V extends Value = Value> {
  readonly change: DocumentChange;
  readonly effects: readonly EditorEffect[];
  readonly selectionAfter: Selection;
  readonly selectionAfterRoot?: string;
  readonly selectionBefore: Selection;
  readonly selectionBeforeRoot?: string;
  /** On an undo step whose commit settled shown values: the change from the step's base that takes back what the commit's settle stage wrote. A redo step never has it. */
  readonly unsettle?: DocumentChange;
}
```

## Document shape

Admission's validator, every decision, the change cards, Yjs and saved documents read a stacked format suggestion. Yjs merges `authored` as a set of whole members and each record set as a map keyed by record id. A stacked tag stores its links grouped by step, bottom step first, each with the linked tag's id and written value, plus `base`, the key's value with every tag on it undone.

Bob's blue over Alice's pending red:

```json
{
  "text": "word",
  "color": "blue",
  "authored": [
    { "id": "alice-t:1", "key": "color", "kind": "format", "change": "alice:1", "author": "alice", "at": 1000,
      "write": { "kind": "set", "value": "red" } },
    { "id": "bob-t:1", "key": "color", "kind": "format", "change": "bob:1", "author": "bob", "at": 1000,
      "before": "red", "base": { "kind": "remove" },
      "over": [[{ "id": "alice-t:1", "write": { "kind": "set", "value": "red" } }]],
      "write": { "kind": "set", "value": "blue" } }
  ]
}
```

Carol's Editing green over Alice's pending red keeps Alice's tag, puts Carol's accepted tag on top, and stores one landed record for Carol's write:

```json
{
  "text": "word",
  "color": "green",
  "authored": [
    { "id": "alice-t:1", "key": "color", "kind": "format", "change": "alice:1", "author": "alice", "at": 1000,
      "write": { "kind": "set", "value": "red" } },
    { "id": "carol-w:1", "key": "color", "kind": "format", "change": "~edit:carol", "author": "carol", "at": 1000,
      "before": "red", "base": { "kind": "remove" },
      "over": [[{ "id": "alice-t:1", "write": { "kind": "set", "value": "red" } }]],
      "write": { "kind": "set", "value": "green" } }
  ],
  "records": { "authored-landed": { "carol-w:1": { "at": 1000, "change": "~edit:carol" } } }
}
```

Rejecting Alice's red under Carol's Editing green leaves Carol's tag and record, so a later undo by Carol reads that Alice's red is gone:

```json
{
  "text": "word",
  "color": "green",
  "authored": [
    { "id": "carol-w:1", "key": "color", "kind": "format", "change": "~edit:carol", "author": "carol", "at": 1000,
      "before": "red", "base": { "kind": "remove" },
      "over": [[{ "id": "alice-t:1", "write": { "kind": "set", "value": "red" } }]],
      "write": { "kind": "set", "value": "green" } }
  ],
  "records": { "authored-landed": { "carol-w:1": { "at": 1000, "change": "~edit:carol" } } }
}
```

Accepting `alice:1` once nothing pending lies under her tag removes the tag and stores one landed record for the commit that wrote it, however many leaves that commit wrote. The record names the change's `inc` too when it has one:

```json
{ "records": { "authored-verdicts": { "…": "…" }, "authored-landed": { "alice-t:1": { "at": 1000, "change": "alice:1" } } } }
```

Every format tag one commit writes shares that commit's write id, so the record names the write. An Editing write on a property with no pending tag stores nothing. When Editing writers take turns over a pending tag, each turn stacks its own tag, linked to every tag below it.

`encodeHistoryValue` and `decodeHistoryValue` write and read saved history steps. An undo step whose commit settled carries `unsettle`, and the codec refuses it on a redo step, where it does not apply at its step's base, and where it writes anything but element properties. The version is 4.

```json
{ "change": { "...": "..." }, "effects": [], "selectionAfter": null, "selectionBefore": null, "unsettle": { "...": "..." } }
```

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Plite | Contribution identity, retained content, positions, atomic review decisions and the accepted and proposed views. |
| Plate | Review workflow and presentation. |
| Applications | The ordinary `initialValue` and `editor.read.value()` calls; there is no public authored loader, cache, trusted-input mode, worker protocol or background replay controller. Authentication and access policy stay outside the engine. |
| Writer identity | Every non-empty write through the capability needs a current author ID, accepted edits included, so accepted and proposed writes share one path. A resolver may return `null` while an editor only reads; the first write validates a non-empty ID. Plite never invents an anonymous or system author. |
| Added lines | Plite's authored resolver adds empty lines to a preview when accepting leaves a root or a container short of lines, and no stored node or key names them. The resolver, the map, the lens and the ledger's comparison all read which lines it built ([Typing at the end of a line a pending join pulls up](../2026-10-24-authored-joined-line-end.md), [A caret in a line the preview adds](../2026-10-25-authored-added-line-caret.md)). |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Accepted edits bypassing the authored path | A second mutation authority, and pending changes without complete facts. |
| Reducing every saved operation on open | Made opening depend on history the saved state already held. |
| An opaque live-state mirror | Stored 44.25 MB, was slower than replay, and either replayed to validate both or admitted inconsistent text. |
| A second projected document with a causal operation graph | Replaced by review marks on the one stored document ([review-tree pivot](../2026-10-13-review-tree-pivot.md)). |
| Copied hooks that map a preview block's key to its index and read the stored block there | A preview that drops or adds blocks shifts indexes, so a badge reads another block's cards ([preview places on next](../2026-10-19-preview-places-on-next.md)). |
| Previews that keep stored keys for the blocks they do not rewrite | A stored key cannot name a block the preview builds or merges, such as a joined line or a completion filler. |
| A second order map for commands beside the review map | Built from the resolver's raw landings, it disagrees with the filtered placements on where some merges land, so typing, cards and badges disagree, and it refuses overlapping or nested moves. |
| An option that reads stored places on a preview | No product code reads one there, and one place contract keeps every preview read exact. |
| Refusing Backspace or Delete across a moved block's edge while its join is pending | The recorder records it as the merge it makes. |
| Grouping a property step's tokens in stored order | It assumes each token maps forward of the last, so a crossing or select-all Bold records wrongly. |
| A refusal reason for a Suggesting merge that would give a content root two owners | The suggestion toast already tells the writer to switch to Editing. |
| A resolver origin for every token | A wider rewrite than one map of placements needs. |
| Pairing added lines with stored ones by shape | An added empty line has the shape of a stored one, so a letter typed at the end of a joined line landed in the line below. Two sets of better shape rules each broke other edits. |
| Storing the added lines | Changes stored documents and the cards they show, and the construction-values plan owns the spares completion takes. |
| Acting in the added line at a caret the preview draws there | Moving the command frame's caret into the added line threw on a block type change, a paste and typing in a titled root, lost a bold letter and moved an Editing view's caret into a line it does not show. |

The undo repair of [Undo finds what each node was](../2026-10-18-undo-repair-nodes.md) puts its changes in these layers:

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| The split write | Plite | `plitejs/yjs` | The bridge decides how a commit reaches the Yjs document |
| Kept runs of a change | Plite | `plitejs` core change | It walks the change's private sections, beside the other mapping functions |
| Applying an insertion beside a deletion in place | Plite | `plitejs` core change | The localized apply decides which changes apply without a token rebuild |
| Which node a replayed node was, and its repair | Plite | `plitejs/authored` admission | Only admission sees the decisions made since the write together with the change |

[One map of a preview's places](../2026-10-19-preview-places-on-next.md) puts its Plite changes in these layers, and `docs/plans/topics/suggestions.md` lists its Plate rows.

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| The resolver reports where it lands each piece a pending join moves, filtered to landings that pass a shown line, and which blocks it hides whole | Plite | `plitejs/authored` (`tree/resolve.ts`) | Only the resolver decides where a follower lands |
| One map per run of which stored content each preview place shows, used by the command frame, the recorder's breaks, review reads and the delta | Plite | `plitejs/authored` (`ledger/level.ts`, `ledger/places.ts`, `ledger/runs.ts`, `ledger/projection.ts`, `ledger/ledger.ts`) | The mode projection owns its runs, and one map keeps typing, cards and badges in agreement |
| The command frame asks the map where a caret or range goes and gets a placement or a refusal reason | Plite | `plitejs/core` (`command-document.ts`, `command-frame.ts`) | The range policy lives beside the map it reads, so core reads one placement |
| The recorder lowers a frame step across breaks, reads breaks from the one map, and maps a property step token by token | Plite | `plitejs/authored` (`tree/record.ts`, `refusal.ts`) | A grouped property step records a crossing Bold wrongly |
| A preview's review place reads map the view's place to the stored content it shows | Plite | `plitejs/authored` (`authored.ts`, `ledger/book.ts`, `ledger/cards.ts`) | The ledger owns the mode projection and the book |
| `subscribeChanges` names the view blocks whose cards changed | Plite | `plitejs/authored` (`ledger/book.ts`, `authored.ts`, `changes.ts`) | The same owner as the reads, so a badge wakes for what its read shows |

[Spare blocks in a shared room](../2026-10-24-spare-collaboration.md) puts its changes in these layers:

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Property edits of an element that keeps its key, written in place before the rest of a commit lowers, and each changed region of the rest lowered on its own | Plite | `plitejs/yjs` (`event-change-bridge.ts`) | The bridge decides how a commit reaches the Yjs document, and `lowerJoins` already splits a commit this way |
| A diff keeps the key of an element whose type stays while its properties and children both change | Plite | `plitejs` core (`root-change.ts`) | The diff decides which elements keep their keys for a received change, an app's value replace and an admission repair alike, and its alignment already pairs such an element; only its gate left it out |
| The canonical pass of room content builds an emptied container's or root's line from its unbuilt spare and marks that spare built, and the first edit in or beside a line only the editors hold inserts its highest missing node into the room with that mark | Plite | `plitejs` core canonical pass and `plitejs/yjs` (`event-change-bridge.ts`, `controller.ts`, `document.ts`), with spares from `plitejs/authored` | Every editor must build the same line from the same stored bytes, only the spare holds them, and only the bridge knows which lines the room lacks |
| A Suggesting write of a unique value lands in place, with no format tag | Plite | `plitejs/authored` (the recorder's format writes in `tree/command-values.ts`, `tree/record.ts`, `tree/carried.ts` and `tree/record-completion.ts`; `splitHistoryTags` keeps its tag) | The recorder decides what a suggestion stores, and an id names its block, so no decision may bring one back |
| The `unique` option on a generated element property, its defaults and its refusals | Plite | `plitejs` core schema (`interfaces/schema.ts`, `schema-definition.ts`, `schema-compiler.ts`) | Only the property's owner knows that its generator never repeats and that two equal values mean one copied identity |
| The repair of repeated unique values on every commit and load, over an index of unique values, and each import's repair lowered through the bridge from the document the import produced | Plite | `plitejs` core (`public-state.ts`, `document-admission.ts`) and `plitejs/yjs` (`controller.ts`) | Every commit kind and every load reaches core's admission point, with or without the authored capability, and only the bridge sends a repair back without rewriting the blocks around it |
| `ElementIdPlugin` sets `unique`, keeps its index and checks only the ids a commit writes | Plate | `platejs` | Core's repair now guards the law the plugin's duplicate throws and whole-document walk guarded, and the plugin's index already answers reads inside an update |

[Settle shown block ids wherever their last suggestion is decided](../2026-10-24-shown-settlement.md) puts its changes in these layers:

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Shown values settle in a stage after admission's other repairs, on every commit and last on every load | Plite | `plitejs` core (`core/public-state.ts`, `core/document-admission.ts`) runs it; `plitejs/authored` (`facts/admission.ts`, `tree/shown.ts`) implements it | Core owns the commit and load sequences, and admission's repairs already reach the room |
| One holder index for the closing pass and settlement | Plite | `plitejs/authored` (`tree/holders.ts`, `ledger/ledger.ts`) | The ledger already owns `StoredBlocks`, memoized by each top-level block's node, so a read after a commit recomputes only the blocks that commit replaced. Until settlement reads it on every commit, a plain keystroke reads none of it |
| A commit whose settlement changed anything gets its own history entry, closed to later merges | Plite | `plitejs/history` (`history/history-plugin.ts`) | History alone decides what one entry composes |

[Settle shown values at the cost of what a commit changed](../2026-10-25-settle-readiness.md) puts its changes in these layers:

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| A quiet gate before the settle stage moves any index | Plite | `plitejs/authored` (`tree/holders.ts`, `facts/admission.ts`) | The settle hook already receives the commit's change and `before` |
| `decidedIn`, shared by admission and the gate | Plite | `plitejs/authored` (`facts/facts.ts`) | Facts own verdicts and insertion counts |
| `ShownBook`, the per-value readiness record | Plite | `plitejs/authored` (`tree/readiness.ts`, `ledger/ledger.ts`) | The ledger owns editor-lifetime authored state |
| Owners read from element properties | Plite | `plitejs` core (`core/element-owned-root-index.ts`) exports `ownedRootsOf` | Core owns the declaration reader |

[Redo a settling decision by taking settlement back](../2026-10-25-redo-settlement.md) puts its changes in these layers:

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Core records what the settle stage and the closing pass wrote when a commit's settle stage changed the document | Plite | `plitejs` core (`core/public-state.ts`, `core/commit.ts`) | Core runs the settle hook and builds the commit |
| History keeps the inverse of that change on the undo step and composes it into the redo step it builds | Plite | `plitejs/history` (`history-plugin.ts`, `history-state.ts`, `history-codec.ts`, `history.ts`) | History owns its steps; it already imports `core/commit` and `core/document-admission`, so the entrypoint graph gains no edge |
| One write per property against a base document | Plite | `plitejs` core (`core/change/root-change.ts`) | Only the change module knows how a change encodes property writes; history already imports it |

[Resolve only what a spare record change can reach](../2026-10-26-spare-resolve.md) puts its changes in these layers:

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| `readsRootSpares`, `Run.spares`, `RunContext.spares` | Plite | `plitejs/authored` (`ledger/runs.ts`) | The run owns what it resolved against, as its `verdicts` already does |
| `unpendedSpareReaders` | Plite | `plitejs/authored` (`ledger/projection.ts`, `level.ts` exports `isLevelRun`) | The projection owns the slot tree whose ends are the readers |
| `ModeProjection.sync` merges readers into touched ranks; `RootProjection.sync` loses `respared` | Plite | `plitejs/authored` (`ledger/ledger.ts`, `ledger/projection.ts`) | The ledger already diffs the spare record set once per commit |
| `seedUniqueIndex` at load | Plite | `plitejs` core (`core/public-state.ts`) | Core owns the index and the load publish |
| The advance reads `node` and `presence` keys per root | Plite | `plitejs` core (`core/public-state.ts`, `core/unique-values.ts`) | The index is keyed by node, not path |

## Hard cuts and app migration

- `at` on a preview takes a node's key or path and names a node of the preview, a block or one of its texts. A key resolves only in the view. A point or a range throws `AuthoredPlaceError`, exported from `plitejs/authored`, on a preview, because no product code reads one there; on an intent view both keep their meaning. The owner editor reads its own preview the same way, and no option reads stored places from a preview. An app that read a preview with a stored place, such as a record's `ranges`, reads through an intent view instead.
- A page cursor from a read with `at` works only on a view with the same root and preview mode. A cursor from a read without `at` works on any view.
- `AuthoredChange.revision` covers no position except a split or join's path inside its top-level block, so a change's `ranges` can move while its revision stays the same. An app that caches `ranges` reads them again after each document change. A decision on a structure change stays valid after someone types or formats text inside it, and still refuses after its child blocks change.
- `AuthoredChangesDelta.blocks` names, on every view, each top-level block whose cards a change reached or left. Rejecting an insertion names the block it sat in, a merge that renames a block names both blocks, and a split that renames the blocks before the key names each of them. An app that read `blocks` as only the blocks a commit wrote also wakes the blocks a card left.
- Records keep their shape. `AuthoredChange.ranges` and the location fields of `details` stay places of the stored document, so an app never paints them into a preview; `packages/plitejs/test/react/decoration-manager-contract.test.ts` asserts a hidden insertion's id on Accepted and paints no stored range there.
- The edits beside a pending join that Rules lists refuse and roll back whole. An app that sends a format, a select-all Delete, typing or paste beside a joined line handles the `unrepresentable` refusal and its reason.
- A command that names a place of its own, such as `BaseLinkPlugin.upsert` with `insertNodesOptions.at`, is not refused for a selection the preview cannot place, as on next, so when it also edits at that selection it can change text outside it. Its edits at the places it names still refuse as Rules lists. A format such as Bold over a moved piece formats what the proposed preview shows between the selection's ends, so it can format text stored outside the selection or leave moved text stored inside it plain. owner: the owner; stop: the frame's selection-consumption task lands or the owner drops it.
- The top-level block a preview adds to complete the document reads no card, so a deleted only block's card shows only in Editing. One it adds inside a container can still read the hidden block it replaces. owner: the owner; stop: the filler card task lands or the owner drops it.

## Native behavior and proof

[Settle shown block ids wherever their last suggestion is decided](../2026-10-24-shown-settlement.md) proves these behaviors at its steps:

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Undo of a decision that settled | Undo replays the inverse of the decision and its settle repair, so the block gets back its fresh id and its note, and the settle stage finds the group pending again | jsdom test with the history plugin, step 3 |
| Redo of a decision | Redo replays the decision without its settlement, so a loser's note and a winner's earlier id and note come back, and the settle stage settles the group again, so a holder added meanwhile keeps the group waiting, and a group that turned ready settles in the same commit | jsdom test with the history plugin and with a Yjs peer, step 3 |
| A settling decision inside an explicit history merge | It starts its own undo step, and the edit after it starts another | jsdom test with the history plugin, step 3 |
| Undo after a peer settled the group | The block keeps the settled id beside its restored claim, a valid state, and each later verdict gives what it would have given | Two Yjs peers in jsdom, step 3 |

[Settle shown values at the cost of what a commit changed](../2026-10-25-settle-readiness.md) proves this behavior at its steps:

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Undo and redo of a settling decision | Nothing: the settle repair and the closed history entry stay, and the record never enters history | jsdom tests with the history plugin, `authored-shown.test.ts`, steps 2 and 4 |

[Redo a settling decision by taking settlement back](../2026-10-25-redo-settlement.md) proves these behaviors at its steps:

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Redo of a settling decision after a skipped edit adds a pending holder | Stores what its reference stores, where it stored a wrong or duplicate id | jsdom tests with the history plugin in `authored-shown.test.ts`, step 3 |
| Redo of an update that writes a shower's id directly and settles it | Keeps the written id under the shown one while a holder is pending, where it restored the old id | jsdom tests, step 3 |
| A peer's write to a shower's own id while the step waits on either stack | Redo keeps the peer's id while a holder is pending, as the same edits store with no undo, where it lost a format the peer's write made. With no holder pending and the step on the undo stack, the undo writes over the peer's id. Redo writes it back, then settling stores the shown id over it, as deciding again on the undone document does | jsdom tests, step 3 |
| A skipped edit removes all that a settling redo would change | Redo skips the step, as a fresh decision would change nothing, where a second field would have replayed settlement | jsdom tests, step 3 |
| Undo then redo of an update the uniqueness repair renamed | None; the renamed id comes back, with or without a skipped edit that removed the collision | jsdom tests in `unique-values.test.ts` and `authored-shown.test.ts`, step 3 |
| Redo of an insertion whose undo settled a shown id | Brings back the document from before the undo, which the same edits store with no undo or redo | jsdom tests, step 3 |
| Redo of an insertion after a skipped edit lets another element store the id it shows | Keeps what was recorded: the redone element shows the id and keeps its own once accepted, where a fresh insertion stores the shown id | jsdom tests, step 3 |
| A skipped edit after the undo takes the id the undo's settling freed | The skipped edit keeps it; under unique ids the redone block takes a fresh one | jsdom tests, step 3 |
| Undo of a settling decision | Nothing | The existing describe block 'history replaying a settled decision' |
| Redo in a Yjs room | Both peers' Yjs documents and a late joiner store what the reference stores, with no duplicate id | Two editors with Yjs documents exchanged by hand, step 3 |
| A saved history reloaded on either side of the undo | Redoes the same as one never saved | jsdom codec round trip, step 4 |

[Resolve only what a spare record change can reach](../2026-10-26-spare-resolve.md) proves these behaviors at its steps:

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Undo and redo of a write that stores a spare | Nothing a user sees: a reader the undo brings back resolves against the current records | jsdom tests with the history plugin in `authored-tree-spares.test.ts`, step 1 |
| A peer's records-only import through Yjs | Nothing a user sees: only the root's readers resolve again | `authored-spare-collaboration.test.ts`, step 1 |

## Rules

These rules bind this feature alone, so they live here instead of in `docs/vision/`.

- Authored changes are one optional native document capability. The stored
  document is the review tree. Pending insertions and deletions stay in place,
  and each node carries its own claims. Text written inside another pending
  change carries one `in` member that names an immutable context record
  listing the changes it depends on. Context records live in the
  `authored-contexts` record set, and one verdict per decided incarnation
  lives in `authored-verdicts`. Every collaborator shares both sets, and
  `read.value()` holds them in `records` beside the content. Code outside the authored
  owner reads a node's pending claims through `reviewOf` instead of parsing
  `authored`.
  Review reads take a place of the document the view shows.
  `read.groups({ at })` returns every card touching it, and
  `read.changes({ at })` pages the changes there in document order, so no read
  walks every pending change. With no preview the place is stored. On a
  preview it is a node's key or path of the shown document, and the read
  returns the changes on the stored content that node shows, with what the
  preview hides inside it and the changes on each element around it that the
  preview takes away. Content the preview hides between two texts of a block
  reads on the block, never on either text. A joined line reads a hidden
  block between its two halves. A top-level block the preview adds to
  complete the document, as when its only block is deleted, reads nothing,
  and one it adds inside a container can read the hidden block it replaces.
  Otherwise no
  block reads the changes of a top-level block the preview hides, and an `edit` or `propose` view reads
  them. A nested block's path returns its own changes and those of a
  container around it that the preview takes away, never the pending wrap or
  unwrap of a container the view still shows, which that container's own
  read returns. A key the preview lacks reads nothing, and on a view of a
  content root the preview leaves out every key and path reads nothing. A
  point or a range throws `AuthoredPlaceError`, which `plitejs/authored`
  exports. A page cursor from a read with `at` works only on a view with the
  same root and preview, and a cursor from a read without `at` works on any
  view. A change's `ranges` and the locations in `details` stay places of the
  stored document on every view. A card is the adjacent pending changes of
  one author, named by its oldest pending change, so every peer and reload
  names it alike. A pending join or split stands for the line break it removes
  or adds, so changes on either side of it are adjacent. A change whose last
  part is, or lies inside, a whole block it inserts or deletes ends where that
  block ends, so it is adjacent to a change inside that block and to a change
  to the next block at the same depth, such as another added or struck line.
  A change follows the
  text, not the undo history. Repeated Backspace within a line grows one
  deletion. Text or a line break written inside or at the edge of one's own
  pending insertion becomes part of it, so rejecting the typing removes the
  break too. Plite stores no color; Plate derives one from that name. A
  decision takes the changes or cards it read and refuses one that moved since.
  Except for a split or join inside a top-level block, no revision covers
  where a change sits, so an edit before it keeps the revision while its
  `ranges` move. A join, split, wrap or unwrap's revision ignores the text
  and leaves inside its element. It changes when the element's own fields
  change, when a child block is added or removed or changes its shape, or
  when children of different shapes swap, and swapping two children of the
  same shape keeps it. So a decision on a structure change stays valid while
  someone types or formats text inside it, and refuses as stale after its
  child blocks change. The revision of a split or join inside a top-level
  block, such as a quote, also covers its path inside that block, because a
  decision merges its line into the block before it. That path counts
  blocks, so it does not say which block comes before the line. Inside that
  block, a block that lands among or leaves from the blocks before the line,
  or before one of its ancestors, changes the revision. After the blocks
  before it change order, or one of them is replaced or changes type, a
  decision read before still applies and merges the line into the block now
  before it. A block that lands between the halves of a top-level split or
  join also keeps the revision, and a decision read before merges the line
  into that block (Open work).
  `api.subscribeChanges` hands each view one frozen delta per commit that
  changes the review. Its `blocks` names the view's top-level blocks whose
  read of changes or cards may differ, which under a preview are blocks the
  preview shows, so a block's badge wakes for what its read shows. They are
  each block a change reached or left and each block holding a change whose
  card ID changed. A change to a card's summary alone names no block, so a
  block's copy of a card's `changeCount` or `revision` can trail until it
  reads again.
  A view either writes, with intent `edit` or `propose`, or previews the
  document with every pending change accepted (`proposed`) or rejected
  (`accepted`). A preview throws on a plain edit, but some other writes still
  change the document through it, such as an update that makes a decision,
  and undo and redo; t_f485ac77 (owner zbeyens) decides which of them a
  preview refuses. Remote collaboration changes land whatever the view. View
  state never becomes another saved document or a global mode. Suggesting
  records each write under its author,
  and a write inside another pending change depends on that change's context, so
  rejecting the outer change removes it too. Editing records the same way and
  accepts the writer's own claims in the same commit. Editing refuses a
  carried value that is not the left-out default, while proposing and then
  accepting the same change drops it where it lands. It leaves every other
  author's claims pending, so text it writes inside another author's pending
  insertion joins that insertion. A format write in Editing stacks an accepted
  claim over the format claims on that property, replacing only its writer's
  own Editing claim, and never takes a suggestion back, its writer's own
  included, so deciding a suggestion under it never undoes the Editing value.
  A format write that left its property still counts under a claim over it
  only while it was accepted or written in Editing. One landed record per
  write says so, and undoing its decision voids that record. An accepted or
  Editing claim stays stored, unseen, while a write under it neither stays on
  the property nor landed. An undo or redo that takes a claim off sets the
  property to what rejecting that claim gives now. It repairs each node from
  the characters the undo kept of it, or from its kept opening when the node
  is an element or an empty text. Suggestions on both sides
  of an Editing write still wait on each other, a question suggested task
  `t_7314eae0` holds. These fourteen cases are known to give the wrong value,
  the first seven as before, and the list is not complete. Rejecting a
  peer's suggestion written beside an accept it never saw loses the accepted
  value. Rejecting a suggestion written at the same time as an Editing write
  restores what its writer saw. A suggestion redone over a stack whose
  claims changed meanwhile lands what its writer saw. When part of a change
  is withdrawn while a peer suggests over that part, or undoes a suggestion
  there and redoes it after the rest is accepted, rejecting the peer's
  suggestion after that accept lands the withdrawn value. An undo or
  withdrawal at the same time as an accept of the same change counts as
  accepted. A value
  accepted and then undone by its writer after it left the property still
  counts. A decision or withdrawal whose write wins the merge over a
  concurrent Editing write drops the Editing value; suggested task
  `t_b8a4ce47`, owned by the project owner, holds its fix. A decision on a
  suggestion, or its writer's undo, at the same time as the Editing writer's
  undo of a write over it leaves a rejected or undone value as plain text,
  because only the undoing client repairs the property. Undoing a reject
  after the Editing write over that suggestion was undone brings the
  suggestion back without its value, so accepting it writes nothing. Suggested
  task `t_b8a4ce47` holds the fix for these two as well.
  Characters another writer typed inside the undone write keep the value
  that history replays. A block or empty text
  whose opening the undo replaced keeps the replayed values, and so does the text of a
  block the undone commit wrapped or unwrapped. When an Editing commit replaced a
  block and another author then suggested a format on the new one, the
  undo brings back the old block with that pending claim. Suggested task
  `t_128bbd1d`, owned by the project owner, decides these four. Undoing
  one's own suggestion after an Editing commit pressed Enter inside it
  leaves its claim on the half the Enter split off. Suggested task
  `t_ecea0fff`, owned by the project owner, holds that one. A
  decision removes the decided claims and appends a verdict for each
  incarnation it decides in one transaction. Admission settles any claim that a peer's late
  edit brings in after the verdict.
  A content root lives as long as its owner. An exclusive root goes with its
  owner, and a shared one goes with its last owner in a closed schema and
  stays in an open one. Suggesting an owner's deletion strikes the owner and
  leaves its roots unmarked, and Editing leaves another author's pending
  deletion of an owner in place with its roots, as it leaves a struck
  paragraph. Every projection, decision and load drops each root this rule
  leaves without an owner, and a write whose implicit target lies in such a
  root writes nothing. Removing one's own pending owner in a later update
  strikes it when one of its roots holds anything but that author's own
  pending insertions, because nothing in a root says who wrote its unmarked
  content. Suggesting still refuses deleting a root no element owns.
  Undo is local inverse history. It restores document facts, decisions
  included, and proposes nothing.
  On the review tree, commands and plugin update methods decide on the
  proposed projection, the document with every pending change accepted, and
  the recorder lifts their result back into authored changes. A command or method whose input holds a stored location declares
  where each location lands in that document, that it holds none, or that it
  only moves the selection. An undeclared one throws on the review tree, and
  an undeclared plugin update method that takes arguments throws on every
  call, because its declaration also picks the root it runs in. A base-editor
  plugin call decides on the proposed projection of that root. A plugin call
  made inside the frame keeps its arguments as given, because its caller read
  them in the projection, and a key the projection hides skips it when the
  method's locator places that key, as it skips a direct call. A call through a
  view stays unframed and decides on the stored document, so a hidden key
  still reaches its body. A core transform called directly inside `update`
  runs on the stored tree. Input paths dispatch commands. A read of a root a pending deletion drops sees it
  empty, and the frame refuses a write or a selection there, so a call that
  writes only other roots still runs. Point
  stepping has no option that skips hidden content, because commands on the
  review tree never see it.
  Persistence saves the whole `read.value()`, records included. Every
  document passes one admission owner before anyone reads it. Admission
  validates claims and context references, compacts stacked legacy insertions
  into contexts and settles claims against verdicts. Loading never replays
  edits. `projectAuthoredDocument` returns one accepted or proposed document
  with its pending count and diagnostics.
- Changing authored input intent creates no document or history change, and a
  composition finishes under the intent it started with.
- An accepted join merges its line into the nearest line before it that the
  decision keeps, and the merged line keeps that line's type and properties,
  whatever that line still shows.
- A rejected split rejoins its pieces into the piece before it while that
  piece keeps content, and into the piece after it otherwise. When the
  decision removes the piece before it, the split looks further back for the
  nearest block the decision keeps. Only the first container it meets that
  the decision keeps but empties, or whose children it lifts out, can take
  the later piece. The later piece takes the place of that container's line
  only when the decision does not lift the container's children, the
  container has no prefix slot, completion would rebuild it as one empty
  line with exactly the later piece's properties, and the later piece
  carries no format tag.
  Deciding the removal first gives the same result, because the split then
  rejoins the empty line that completion builds there. Otherwise no
  container further back can take the later piece. This is current
  behavior, not law, until the split-order task decides it. When the piece
  before it keeps no content, the piece after it stands in the emptied
  piece's place with its own values, so rejecting an Enter at a line's start
  loses every value the split dropped, the line's block id among them. The
  Construction values plan owns the fix.
- A deletion Editing records applies in that commit, a pending join beside it
  included.
- A framed step whose removals take the last live content out of a wrapper
  a pending unwrap dissolves, and land no live node inside it, marks that
  wrapper deleted under the writer's change, so it goes once nothing inside
  it survives, whichever way the unwrap is decided. A block with no pending
  deletion that keeps its opening or its end is live content at any depth,
  so a line that joins out of a nested wrapper keeps it until the join
  lands, and another author's pending deletion of the wrapper never stands
  in for the writer's. Deciding the unwrap then waits on that deletion, as
  it does on any pending deletion of the wrapper.
  Once the unwrap is rejected, decisions follow the recorded edit, not a
  replay of the command, so a framed removal of the last line as a node,
  with no merge, loses the wrapper there. A raw write inside `update` acts
  on stored positions, so where its stored result, once accepted, differs
  from its result on the accepted document, such as a range that struck
  text keeps off a block's edge, a plain editor on the accepted document
  cannot stand in for it.
- A pending join can show a block away from where it is stored. The proposed
  preview shows a block split off the joined line, or inserted between the
  join's halves, after the joined line. Both intents record Backspace or
  Delete across a moved block's edge, and a deletion over moved blocks, as
  the merges they make. Suggesting refuses that Backspace, with no reason,
  when the moved line holds the owner of an exclusive content root, because
  the merge would give the root two owners; Editing records it. An Editing
  delete that reaches a pending join's follower with no shown line between
  records the plain merge. Select-all covers every block the preview shows,
  a moved last block included. Both intents refuse these edits and store
  nothing for them.
  - Enter or a new block where a moved block meets its neighbours, with
    `crosses`.
  - Enter after an earlier break in its line, such as at the end of a joined
    line that a moved block follows, with `reordered`. On the crossed-deletion
    test document, 7 of 12 Enter positions refuse in both intents, 2 of them
    with `reordered`.
  - An edit where the preview shows none of the selected letters between the
    selection's ends, but shows some of them elsewhere, with `crosses`. When
    the preview hides the selected letters, such as struck text, the
    selection becomes a caret instead.
  - A format that starts or ends inside a text where a moved block meets its
    neighbours, and a letter typed there with a mark toggled on, with
    `crosses`, because each splits that text at the break. Where the break
    falls between two texts, such as beside a link, the marked letter goes
    into a new text there and records. With Bold toggled on, all 48 carets of
    the two link test shapes record, and only the 8 flat carets that split a
    text at the break refuse.
  - Select-all Delete, typing or paste beside a joined line and its
    follower, at the top level or in a quote, with `crosses`.
  - A range whose image runs backward, a whole-root replacement across
    breaks, an unsupported structural crossing and a backward removal, with
    `crosses`; a final resolution that shows another block order, with
    `reordered`; an ordered run the range meets without exact alignment, with
    `unaligned`; and a final resolution that differs in content or
    structure, with `diverged`.
  A format such as Bold over a moved piece formats what the proposed preview
  shows between the selection's ends and saves that. A range end inside a
  block the preview hides whole places at that block's edge. A command that
  names a place of its own, such as a link inserted at a given point, is not
  refused for the selection it started with, so when it also edits at that
  selection it can change text outside it. Its edits at the places it names
  still refuse this way. Typing at a caret inside the joined line
  still applies. A refused edit rolls back the whole update and reaches
  `subscribeRefusals` as `unrepresentable` with its reason.
- Completion keeps a struck element as the line its root or container needs
  only when no pending join past it would land in it. An accepted join whose
  target the decision removes reads the pending content that target holds,
  so an Editing join into a line that holds another author's pending move
  stays pending until that move is decided.
- When accepting leaves a root or a container short of the lines its schema
  needs, the preview adds empty lines that nothing stores. The resolver hands
  the map every line it built, and the map sets them aside before it pairs
  stored content with the preview, so no stored place pairs with an added
  line. A caret placed in an added line is stored at the end of the text
  before it, leaning forward, and commands act there. The preview draws that
  caret in the last added line after the text only while the preview's own
  placement stands, in every preview of the kind that placed it; any other
  caret stored there draws at the end of the text. A write inside an added
  line records as that whole line. Wherever a window or a rebuilt root held
  an added line, the ledger compares what accepting a framed write gives
  with what its commands wrote, and refuses a mismatch with `diverged`, or
  `reordered` when only the order differs. Added lines left untouched at the
  end of what the commands wrote may be gone once accepted.
- Settling applies a claim as a decision would. Deleted text goes, and an
  element whose deletion is accepted goes once none of its content survives,
  inline or block, its pending cuts moving to its other pieces. A level it
  leaves short completes as deciding completes it. Settle keeps the emptied
  element where deciding that claim alone would wait, or where no removed
  element can become the node the completion builds. Settle records each
  decision as a deletion or a property write at the node it read, and that
  change is the repair storage lowers.

## Main changes

- `packages/plitejs/src/authored/tree/` turns each write into review marks on the stored document (`record.ts`, `record-completion.ts`), decides changes by rewriting that document (`resolve.ts`) and builds the previews (`proposed.ts`). `cuts.ts` reads the cut marks of pending splits and joins the fragments of a rejected one, and `layers.ts` decides pending property writes. The resolver merges an accepted join into its target, which keeps its type and properties, and reports `placements`, the landings that pass a shown line or change a shown container, and `hidden`, the blocks a preview hides whole with the shown block each collapses into. Projections leave out the `held` member, which only the resolutions written back to storage keep. The recorder reads the breaks of the lines a step touches from the ledger's map, where a break is a place the view shows two stored pieces side by side, and splits a frame step that crosses one into sub-steps that each map in stored order. A property-only step maps each token on its own through `rebaseProperties`. The recorder refuses a crossing it cannot split, a block merge whose right line holds or ends at a break, a block inserted beside a moved line and a removal mapped backward, stores nothing for them, and names each refusal's reason (`docs/plans/2026-10-17-command-law-moved-content.md`).
- `packages/plitejs/src/authored/facts/` owns the review records saved in the document's `records` and admits them when a document loads or a peer sends them (`records.ts`, `admission.ts`).
- `settle.ts` in that folder records each settle decision as a section of one change at the node it read, and `admission.ts` composes the rejected-tag replay, claim compaction, that change and the cut relinks into the repair a load or commit returns. `retractionOf` in `packages/plitejs/src/core/change/retraction.ts` reads which stored elements and characters the repair deletes. `readEmptyText` in `packages/plitejs/src/core/editor-schema.ts` gives what an element left with no stored text reads as, for settle's donor check and the Yjs writer alike (`packages/plitejs/src/yjs/core/retraction.ts`).
- Settle and the resolver's `waitOnPrefix` share `slotDecidingInsertions` in `packages/plitejs/src/authored/tree/resolve.ts`, so settle waits at a level's front where deciding waits. The decision-order gate also loads each state it builds through production settle and compares it with the resolver model (`packages/plitejs/scripts/authored-decision-order.ts`).
- `packages/plitejs/src/authored/ledger/` reads the marks into changes and cards and keeps them per top-level block, so a read or a change delta costs work in proportion to the edit, not the document (`ledger.ts`, `cards.ts`, `work.ts`). Each preview mode has one projection, a `Level` per sibling list (`level.ts`), and each run in it keeps a map of which stored content each preview place shows, built from the resolver's placements (`places.ts`). `level.ts` and `places.ts` own each run's order, its breaks and range placement, for the command frame, the recorder, review reads and the delta. Placements and hidden blocks build in both previews, because Accepted reads use them, and the frame and the recorder read only the proposed preview's map. A written run keeps no order. A placement that names a block its run does not hold or holds twice, or lands a block inside itself, fails as an invariant and never falls back to an ordinary diff (`runs.ts`). A window holding a follower claim or a move source resolves and is checked against that resolution, and refuses with `reordered` or `diverged` on a mismatch. Review reads turn a view key or path into the stored spans its node shows. Publication names the top-level view blocks whose reads changed, and follows a block held across an edit to the view block that holds its node key. Reads and range placement binary-search a run's order, and `orderedRunsIn` is the only search for ordered runs that a key reaches, counted as `breakRuns`. `pairs.ts` keeps a block's pending joins and splits as `joinsAndSplits`, and `breaks` names only the map's breaks. The first key after a load does equal work at 96 and 4,992 blocks, because a preview's snapshot builds no whole child array (`packages/plitejs/src/core/public-state.ts`); a later key still reads the whole root (Open work).
- `CommandProjectionMap` in `packages/plitejs/src/core/command-document.ts` has `moved`, `nodePath`, `projectRange` and `reorders`. On a root the projection reorders, the command frame binds a moved block's key when it builds its index fresh, places a node selection or a node command's `at` through `nodePath`, and places every caret and range through `projectRange`, which returns a placement or a refusal reason. A range from the root's stored start to its stored end places over the whole projected root, so select-all keeps a moved last block. The frame holds a stored selection it cannot place and refuses only a command body that places no location of its own. It refuses a property-only step with `crosses` only where the step overlaps the image of a range that shows other content than it stores.
- `packages/plitejs/src/core/root-ownership.ts` judges which content roots lose their last owner, counting an exclusive root's owners from the roots a change touched. The recorder, resolution, decisions, load admission and the review ledger drop the roots it names.
- `packages/plitejs/src/authored/authored.ts` is the plugin, with its views, its reads, `update.decide`, `api.subscribeChanges` and `api.subscribeRefusals`. Its reads place `at` through the view (`placeIds`), and on a preview a point or a range throws `AuthoredPlaceError`, which `packages/plitejs/src/authored/index.ts` and `packages/platejs/src/authored/index.ts` export. A refusal reaches an Editing write too, as `unrepresentable`, and the suggestion kit's toast asks that writer to accept or reject the pending suggestion first.
- The Yjs binding carries review marks as node properties in the shared tree, and review records in one shared map per record set that peers merge by id (`packages/plitejs/src/yjs/core/controller.ts`).
- `packages/platejs/src/authored/AuthoredPlugin.ts` stamps writes with the editor's `userId` and takes no options. `BaseSuggestionPlugin` maps Editing and Suggesting to view intents and writes the `data-editor-authored-*` attributes, and `useSuggestionGroups(blockKey)` reads the cards of the block with that key (`packages/platejs/src/react/features/suggestion/useSuggestion.ts`).

- `packages/plitejs/src/authored/facts/records.ts` adds the `authored-landed` record set, which maps a format write's id to the change that wrote it. Decisions, admission's repair and the recorder store one record for each commit that removes accepted format tags or writes an Editing tag over pending ones. `facts.ts` lets a stacked tag's link to a tag that left stand only while its record counts.
- `recordFormats` in `packages/plitejs/src/authored/tree/layers.ts` records every format write. An Editing write over pending tags stacks its writer's accepted tag on top and leaves them pending.
- Admission repairs each node an undo or redo replays from the nodes its kept tokens came from. `keptRunsOf` in `packages/plitejs/src/core/change/root-change.ts` gives those runs, and `applyIndexed` there merges an insertion with the replacement that starts where it ends, so a split repair applies in place instead of rebuilding the root.
- The Yjs split write in `packages/plitejs/src/yjs/core/canonical-split.ts` writes the right half's text properties onto the runs it moves, through `rewriteTextRuns` in `text-runs.ts`, so a split that also formats its new block reaches other clients with that format.
- **Property edits in place.** `lowerAgainstMirror` in `yjs/core/event-change-bridge.ts` runs a pre-pass before `lowerJoins` and `lowerStructure`. `splitAncestorPropertyEdits` takes out of the change each property modification, a `-2` section, that sits on the opening token of an element both documents keep with its `type`, when that element's token range holds another structural section of the same commit. A join's absorbed block, whose opening token disappears, and a wrap's new ancestor are never peeled. The pre-pass then lowers the rest with today's detectors, read against the middle document with those properties applied. After the rest lowers, `lowerAncestorProperties` writes the peeled properties with `setYjsElementAttributes` on each peeled element whose Y element survived it, member by member for set-valued keys such as `authored`. An element the rest recreated already carries them, because the bridge encodes it from the document after the commit, so no attribute write lands on an element that is then deleted, and no detector needs a dry run. The same pre-pass fixes app Editing commits that set an element's property and remove or insert one of its children, which base rewrites in the room today.
- **Each changed region on its own.** When the rest of a change spans top-level children that an unchanged child separates, `windowOf` returns `'many'` and `lowerStructure` skips the nested detectors today. `lowerRegions` now lowers each region the way `lowerStructure` lowers one window: a region that keeps its shape goes straight to compatible replacement, and any other runs through the nested detectors, `findNestedChildSplice` and its siblings, first. When a region's element is one both documents keep and its changes fall in more than one of its children, as with two quotes inside one column, each changed child that both documents keep lowers on its own, at every depth, and the children inserted or removed between them lower as a splice. A region's children are removed and recreated only when no detector and no compatible replacement can lower it, so one accept that spans two quotes keeps both quotes, side by side or inside one container.
- **The receiving editor.** `RootChange.between` keeps an element's key when its type stays, its properties and children both change, and the alignment pairs it. `createStructurallyAlignedChanges` already pairs such an element and emits its property section and its child edits, but `between` used that result only when an element moved. Such an element now counts too. A received change, an app's value replace and an admission repair that change one block's properties and children all keep the block's key while one of its lines stays in it. The alignment pairs elements only through shared text, so a decision that empties a container and builds its line from a spare still gives the container a new key in a receiving editor, as on base. A probe of this change counted 782 calls in the non-React plitejs suites and 4,622 in the decision-order check that now return the aligned change. It changed no test's result except the red receive test's, and each of 21,087 aligned returns applied to its target exactly.
- **A line only the editors hold.** When a received change leaves a container below its minimum, as when two peers each accept a different deletion of its last lines, each editor's canonical pass builds the line, and the room keeps the container empty, as on base. Under a schema that stores spares, the line comes from the container's unbuilt spare, the one decisions take, whose node comes first in canonical JSON, so every editor builds the same line, and the pass marks that spare built, the root's spare record included, as a decision that takes it does. No later completion then builds the same spare again, so a container whose minimum is two lines builds two different lines, and a decision that empties the container again after the line leaves it builds from a new spare. That holds for every canonical pass the Yjs plugin runs on room content, the plugin's own `canonicalize` and the controller's `canonicalizeDocument` included. An emptied root reads as empty instead of taking `binding.emptyValue` first, so its canonical pass builds from the root's unbuilt spare record, and `emptyValue` applies only to a root with no such spare. When a change touches a node the mirror holds and the room lacks, or changes the children of a container whose Y element lacks children the mirror holds, the bridge first inserts each missing node into its parent's Y element, and then lowers the change. It inserts the highest missing node on each path, such as a quote an emptied root built with its line, and writes the spare's built mark with it, on the container's `authored` set or the root's spare record. So the first edit in, on or beside such a line writes it to the room, including a write to the container's own properties and a decision that drops its spare. Two people who do that at once each insert their own copy and write the same built mark. The unique repair gives the second copy a new id. Two people typing into the line therefore keep both letters, on two lines, or in two quotes when the missing node is a quote, and two decisions elsewhere that each drop the spare leave the container a second empty line, the same in every editor and in the room. When the room holds only part of a root's children, the bridge inserts each missing child beside the ones it holds. A commit that writes one of a root's stored spare records counts as changing that root, so the root's line and its records reach the room together. Every path that writes the root writes them, the reconcile included. When a fresh read no longer builds a line the editors built before, as when the room's root came to hold another, the controller sets the editor's copies of the records that line wrote back to the room's values. A room's read completes every short container of each block it reads. A container that lacks no child reads no spare, so a remote keystroke reads none. This holds under every schema, so the line base leaves after two concurrent Editing deletions also stops copying its container when someone types in it.
- **Unique values.** An element property can declare `unique: true`, which sets `copy` and `split` to `'drop'`. Its type and the compiler refuse it without a generator, on a set, on a text property, on a prefix key, with `copy` or `split` other than `'drop'`, with `landing` other than `'preserve'`, with `typeChange` other than `'preserve-if-allowed'`, on a property that is not metadata, on a target that depends on place, on a target that misses a type that can take a held type's place, and on a key that a second declaration also names, because every holder's fresh value comes from one generator. A type change keeps a node in its place, so the compiler checks every element's and root's content. When a content admits a type the target holds, every type it admits must be one the target holds, an undeclared type included where the schema preserves one. The refusal names the content that breaks the rule. So no type change or move drops a unique value, and no rejection has one to bring back. A line that takes the place of a piece a decision empties takes that piece's values for the keys `handoverKeysOf` in core returns, the keys a split drops that no retype can drop. Every unique key is one of them, so a unique id narrowed to blocks moves to the line too. The emptied-place comparison ignores every key `splitDroppedKeysOf` returns. The compiler repeats each refusal for hand-built declarations, as it does for `copy` with `required`. Suggesting writes a unique value in place, with no format tag, as it already does on the writer's own pending insertion, because an id names its block rather than its content. The recorder's format writes in `command-values.ts`, `record.ts`, `carried.ts` and `record-completion.ts` skip unique keys. `splitHistoryTags` keeps its tag on a unique key a split drops, because a rejected cut reads that tag to give the joined halves the left half's id in every decision order. No rejection can then bring back a value another block holds, except on the two paths Open work names, so no decision repeats a unique value whatever its order. Core keeps an index from each unique value to the elements that store it, built when a document loads and updated from the node keys each commit adds, removes or changes, so a keystroke deep in a quote touches the path to it, not the quote ([Spare resolve](../2026-10-26-spare-resolve.md)). A spare or an `as` value is not a stored holder. The settle stage writes a shown value once its group waits on nothing, and only when no other element stores it. An unbuilt spare that can bring the value in, a container's or a root's, is a pending holder, so the group waits for it. Once the group settles, every other element that shows the value drops it, as does one whose decided type and place cannot hold it. Core's admission point runs the repair as a stage of its own, after any admission a plugin contributes, whenever the schema has a unique property, so an editor without the authored capability gets it too. Every commit and every load checks each unique value it inserts or sets. When another element already stores it, a commit not tagged `collaboration` keeps the value on every holder it did not write on that key and gives each holder it wrote on that key a fresh value from the generator. A commit tagged `collaboration`, a load, and a commit that wrote every holder of the value keep it on the first holder in document order and rename the rest. Document order reads `main` first, then the other roots by key in code-point order, then blocks by order and path, so peers whose documents agree rename the same copies. When the generator returns a value some element holds, the repair calls it again, and after eight draws it throws an error that names the property and says its generator repeats values. Today the controller hands the bridge's mirror the document after admission's repair, so a repair lowered against that mirror would write nothing. Instead, the controller accepts each import into the mirror with the document the import produced before admission's repair, then lowers that import's repair, the unique repair's renames included, against that mirror at once, before the next import. The renames reach the room as attribute writes on the Y elements the room holds, and the mirror reaches the repaired document only through that lowering. Whole-document imports do the same. The whole-root reconcile in `lowerRemoteCommitRepairs` runs only when the bridge cannot lower the repair, and the race at 10,000 paragraphs measures both. A schema with no unique property builds no index and does no repair work. `unique` counts in the schema fingerprint and the generated contract, because it changes what a Suggesting write stores, so editors that disagree on it never share a room, and the contract diff counts adding or removing it as a change that needs a migration. `ElementIdPlugin` gains it in the landing that adds phase B's storage revision 2, so Plate documents migrate once for both.
- **ElementIdPlugin.** It sets `unique` on its id and drops `copy` and `split` from its call. It keeps its own index, which answers `read.entry` and `read.id` inside an update by reading the draft. It discards an index such a read builds when that update commits, so the next read rebuilds it from the stored document. It drops its two duplicate throws and its correction's whole-document walk, since core's repair now guards the law they guarded. Its rule that an id is a non-empty string reads only the ids a commit's changed nodes store, as a transaction guard that runs on every commit before it publishes, imports included, so no decision or export calls a check per id. An explicit insert of an id another block stores gets a fresh id instead of an error. Inside the update that inserts it, `read.entry` of that id can name either block; after the commit it names the block that kept it.
- **Settlement runs after admission.** `DocumentAdmission` gains an optional `settle` hook. `admitTransactionDraft` runs it once per commit, after the admission loop and the unique repair, and admits its repair through `commit` once, as it admits the unique repair. `repairLoadedDocument` runs it last. Authored admission implements it with `settleShown`, which reads the admitted value, the stored value the commit started from, the facts and the ledger's holder index. It writes each winner's shown value as an ordinary property change by path, so the value reaches the room the way every admission repair does, and the Yjs code does not change. Settlement keeps every node it does not change identical, so a commit in a document whose showers all wait gets no repair. It writes a value only where no element stores it, so the unique repair has nothing to do after it, and settling its own output writes nothing. The resolver loses its settlement tail, `settledOf`, `heldShownMembers` and the alias term of `dropsValue`, so a decision's own view no longer shows settled values, and the settle stage writes them in the same commit.
- **Every ready group settles.** After every admitted commit and load, no ready group keeps an alias. The ledger's holder index lists every element that shows a value, across roots and unbuilt spares. A verdict, an insertion count, a spare record or a root owner that turns a group ready settles it in that commit. Settlement reads each group once per commit, however many of its elements show a value. The settling loop is a worklist keyed by each value a winner releases, so a chain of showers, each waiting for the next one's value, visits each contender once per release instead of once per pass. An alias lives only while a holder of its group is pending, and typing adds none. In a document with no pending copy, settlement reads no group. The whole-document form, which walks every root instead of the index, serves the order checker and the invariant test.
- **A wider holder.** `ValueHolders` replaces `StoredBlocks`. Each holder records its block-local standing. That is the stored claims on it or above it in its block, retained ones included, the contexts it belongs to, the type tags on it and every ancestor, its own tags on the key, and whether it is inside an unbuilt spare. `isPendingHolder` reads that standing against the facts. A holder inside a content root also waits on the elements that own that root. Their standing lives in other blocks, so the memo keeps none of it. At settle time settlement judges each such root once. The holder is pending while any owner is pending, each owner judged the same way, up to the main root. Settlement keeps each root's standing until it ends, and a root it reaches again while judging that same root adds nothing. So a cycle of shared roots ends, and a root with 1,000 owners is judged once, not once per holder. That waits longer than needed for a shared root that another owner keeps, which is rare. A root lives as long as its owners, and Suggesting an owner's deletion leaves the root's blocks unmarked. Without that term, a value in a card's body would settle while the card's deletion can still remove it. The closing pass reads only stored-element holders, as the Command values law says; settlement also reads container-spare holders.
- **History replays are judged again.** Undo keeps a settling commit's settle writes apart and builds the redo step without them, so redo brings back each loser's `as` key and each winner's earlier stored value and `as` key. The settle stage then judges those groups under the current document, as it judges a fresh commit. [Redo a settling decision by taking settlement back](../2026-10-25-redo-settlement.md) builds this. A redo with no new holder writes the decision's bytes, and a redo after someone added or removed a holder settles as a fresh decision would.
- **A settling commit is its own undo step.** Core tags a commit whose settle stage changed anything. The history plugin starts a new entry for it, as it does for `history-push`, and closes that entry, so the next commit starts another one. No entry then composes an alias's creation with its settlement and loses the alias that redo brings back. No later edit composes into a settlement either, where taking the settlement back on redo would also take back the edit. History merges a commit into an earlier entry only under an explicit `history-merge`, or for native text input inside the merge window (`history-plugin.ts:749-800`). So the only undo steps that split are an app's explicit merge into or out of a settling commit, and typing that deletes a group's last pending holder, with the keystroke after it.
- **Load settles once, last.** `authoredAdmission.load` no longer settles. `repairLoadedDocument` runs the authored load, the unique repair and the orphan-root removal, then the settle stage, so no settlement sees a root the load drops, and loading the result again changes nothing. The stage runs even when the earlier repairs change nothing. A load with no editor or ledger, such as a DOCX import or a migration through the `repair` capability (`authored.ts:1502`), settles with the whole-document form.
- **Placement is judged once.** A ready group judges each element that shows a value at its decided type and place, and drops a value that place cannot hold. Since a pending type tag above the element keeps the group waiting, no later decision can change that place.
- **Peers write the same bytes.** Settlement calls no generator, orders roots by `documentRootsOf`, merges several `as` members per key in canonical set order and writes one member or none, so every editor that admits the same document writes the same repair, and settling its own output writes nothing.
- **The round 3 spare fixes ship here, corrected.** The round 3 patch used one set, every key a split drops, for two jobs. The emptied-place comparison ignores those keys when it asks whether an empty line matches a split line, and the line-start handover moves their values. Core now keeps two sets. `splitDroppedKeysOf` returns element keys that every declaration drops on split, content keys included. The comparison and its format veto ignore them, since the two halves of a split always differ on them. `handoverKeysOf` returns those of them that `retypeDropOf` passes, the check `unique` already requires, and only the handover moves them. `retypeDropOf` passes only element metadata, so no content value moves. A quote's emptied last line then takes back the text of a rejected split below it in every decision order. For a key the handover does not move, the rejoined line keeps the value of the line its text came from. Joining the text into the quote one decision at a time keeps the same value, and step 2's two narrowed-id cases store it in every order. So a narrowed id such as `target.group('block')` beside an inline type still hands over and the line takes the quote's spare id, an id narrowed to `target.type('paragraph')` stays with the text's own line, and a content value never moves. A `unique` key always hands over, because the compiler refuses a `unique` property that `retypeDropOf` rejects. So Plate's block id, which is unique, still moves under a schema that keeps unknown types. A key that is not unique stays with its own line when the schema keeps unknown types in a place that admits them, and step 2 changed that case's expected value. No retype can drop a handed-over key from either line, so the handover keeps its rule of no wait and no place check. The round 3 patch also took content keys and keys a retype drops. A container's prefix check reads each child's required value through the schema, so an omitted default counts. The spare iteration's third diff panel logged both patches open with this build as their stop.
- **A quiet gate runs first.** Before the settle stage moves any index, it asks whether the commit can change an input of any group's readiness. A commit can do that only through an element's properties or structure, a verdict, a spare record, a root's creation or deletion, or an insertion count that turns a decided mark's outcome. An undo or redo changes readiness only through these same inputs, so the gate does not check for one. A commit that does none of these leaves every group as it was, so every shown group still waits and the stage returns null. Typing, in Editing or Suggesting, local or imported, touches text leaves only, so it reads no holder and no group.
- **Insertion counts are an input.** A rejected format or deletion mark stays pending while its replacement insertion exists. Deleting that insertion's last character is a text-only keystroke that writes no verdict, yet it can make a group ready. Admission then rewrites the holder's block, so the gate sees the flip in the admitted change. `decidedIn` names each decided incarnation whose insertion count changed sign, and both the gate and admission read it.
- **A per-value record.** Each value keeps a slot of counts, and a holder that cannot wait counts only as a storer. The stage reads only the values whose slots the commit moved, plus those that a decided mark or a moved owner reaches, so readiness is judged from the change. The worklist, the place check, the block rebuild and the closed history entry stay as built.
- **Owners come from the document.** A root's owners are the elements whose type declares a content root and whose `childRoots` names it, so no binding path history decides readiness.
- **The record is saved on success.** The record moves inside the transaction and becomes the ledger's only once the transaction commits.
- **The oracle and two new checks.** The whole-document oracle keeps running as a transaction guard. A test-only guard also checks that a fresh record built at each committed document equals the ledger's. A differential check settles each commit's pre-settlement document with both the fast path and the whole-document form, and expects the same output, which catches an alias dropped too early or a wrong winner.
- **Settlement is recorded apart.** When a commit's settle stage changes the document, core composes what the settle stage and the closing pass wrote after the uniqueness repair, and keeps it on the commit. History reads it only on the steps it saves, so core does not repeat history's rule for which commits those are. When that change writes anything but element properties, the commit keeps none and core reports a lifecycle error. That commit's redo then replays its settle writes with nothing to take them back, and the tests fail on the error. Only history reads it. A commit that does not settle pays nothing, which is every keystroke the quiet gate passes.
- **Undo builds a redo without settlement.** Such an undo step keeps the inverse of that change as `unsettle`. When the undo completes, history composes the actual undo's inverse with `unsettle`. Core's change module turns each element property the result writes into one write from the undone document, drops a write that ends where that document has it, and writes a set-valued property as the members it adds and removes. That is the redo step's `change`. It brings back the document from before the undo, without what the original's settle stage wrote. The older redo steps take `unsettle` as a mapping, so each still starts where the one above it ends. Any undo or redo whose step comes out empty, with no effects, pushes no step on the other stack. The copy that builds the redo step from the undo step (`history-plugin.ts:694-698`) drops `unsettle`, so a redo step never carries it.
- **Redo replays without settlement.** Redo applies the step's `change` in one historic update, as today, so the document it hands to admission is the one the original commit had before it settled, with skipped edits mapped in. The settle stage then decides those values as it does for a fresh commit. The first pass's repairs, the uniqueness repair's renames and what the recorder recorded replay as stored, as on `next`, and the uniqueness repair checks every replayed id again. The redo records `unsettle` from its own commit when it settles.
- **The field moves with its step.** `unsettle` starts at its step's base, and a skipped edit maps it beside the step's change with the skipped edit's priority, so a key a later edit wrote drops out of it. The step's change keeps the replay's priority, so undo restores what it restores today. The correction that completes an undo against the document it reached (`history-state.ts:1118`) writes a set-valued property as the members it adds and removes. `settlePendingHistoryReplay`, which copies a step with a new change, drops `unsettle`.
- **Spare readers.** One predicate, `readsRootSpares(part, context)`, holds for a root-level run whose part is the head or fills a share of the root's minimum. `unpendedSpareReaders` reads the two ends of the root's slot tree and keeps each end that is a run, not a level run, whose part passes the predicate, mapped through the root's changed children so a reader the commit's own ranges reach pends anyway. A respared root's readers join its touched ranks, and the projection resolves them like any touched window. With no readers, nothing resolves and no cache entry is dropped.
- **Spare-stamped cache.** `RunContext.spares` carries the spare record set's version, which the ledger already reads. A new run records it as `Run.spares`. `resolveRun` reuses a cached reader only when its `spares` is the current version, so a reader brought back by an undo or a re-cut window resolves against the current records. A run that is not a reader keeps today's check.
- **No whole build for spares.** `RootProjection.sync` builds the whole root only when the schema changes. A respared root gets a null `written`: the frame wrote before the commit's record writes, so its slice can show a spare those writes replaced.
- **The unique index at load.** `seedUniqueIndex` builds the index where core publishes a loaded document, the initial value and each reconfiguration, when the schema has a unique property. `uniqueIndexOf` stays the only builder, and its version check stays as the fallback, so a commit after load finds the index at its previous version and builds nothing.
- **Advance by identity.** Each commit's guard reads the `node` and `presence` keys of every root, never `path`, as (root, key) pairs. It drops each removed key from the root that held it before it adds any present key, so a node a commit moves between roots ends up held in the root it lands in.

- The resolution carries `unstored`, the nodes completion built that its final children still hold, each canonical copy in place of its source (`packages/plitejs/src/authored/tree/resolve.ts`). The recording map wraps its alignment chain in `settledChange`, which sets those subtrees aside before any matching and composes their insertion after (`packages/plitejs/src/authored/tree/alignment.ts`). A run the commands wrote is not reused for a window that holds a slot whose run built a line, so a normal resolve supplies the set (`packages/plitejs/src/authored/ledger/level.ts`).

- `packages/plitejs/src/authored/ledger/preview-lens.ts` draws a forward caret at the end of a text in the last added line after it only when the authored plugin asks, which it does while core's placement generation equals the one a preview's own placement in an added line got. `packages/plitejs/src/authored/ledger/projection.ts` compares each window and rebuilt root that held an added line with what the commands wrote, through the registry of built lines in `runs.ts`, and `packages/plitejs/src/authored/tree/record.ts` records a step that writes only inside an added line as that whole line.

## What other editors do

Read from local checkouts and vendor docs on 2026-10-08. Every editor that lets the caret into deleted text keeps that text in the tree its input edits.

| Editor | Where deleted text lives | Caret and typing in deleted text | Accept and reject | Clean content for exports and features |
| --- | --- | --- | --- | --- |
| prosemirror-suggest-changes `653fba7` | Same tree, `deletion` mark on text or node mark on blocks | Suggesting moves typed text to the deletion's end; outside suggesting the step passes through | Plain tree edits on one transform | An unexported apply helper; features see deleted text |
| y-prosemirror and Yjs 14 (BlockNote) | A suggestion Y.Doc forked from the base; deletions render into the one ProseMirror doc as attributed nodes | Typing splits the deletion; writes into pending-deleted nodes are reverted | CRDT update transfer between the two Y.Docs | The base doc; features see rendered deleted nodes and needed patches |
| manuscripts track-changes `62f4d19` | Same tree, `tracked_delete` mark or `dataTracked` node attribute | Each transaction is inverted and reapplied as tracked steps | Status change, then plain edits | An exported filtered traversal |
| LibreOffice Writer | In the body, under a redline range | Typing splits the deletion in either mode; hidden deletions are unreachable | Delete or drop the redline range | Layout-merged paragraphs and model readers that skip deletions; moving deleted text out of the body was replaced in 2018 |
| ONLYOFFICE `72b0421` | Same tree, each run has a review type | Typing creates a new run that splits the removed run | Plain edits on run review types | Final and Original views accept or reject in the model and lock co-editing |
| Word (OOXML) | Same tree, `w:del` around `w:delText` runs | Inserts split a deletion in the format | Accept or reject commands | Deleted text has its own element, so a plain text reader skips it |
| Google Docs (API) | One index space; runs carry suggested deletion IDs | Not documented | Accept or reject by ID | Preview modes for accepted and original content; only the inline mode is valid for writes |
| CKEditor 5 (commercial, docs only) | Model markers over in-tree content | Not documented | Accept and discard commands | Accepted data is built in a temporary editor |

For an Editing edit over another author's pending format, [Format suggestions keep the values that landed](../2026-10-18-editing-format-gone-links.md) read the docs of Google Docs, Word and CKEditor 5 and the source of prosemirror-suggest-changes at 653fba70, and searched Slate at 945a484df, Lexical at dd5c41b13 and Tiptap at 91c51be53 for a tracked-changes model by file name, and ran none of them. None documents what a direct edit does to another author's pending format suggestion.

| Editor | Stores a pending format change | Records the value it wrote | Direct edit over another author's pending format | Rejecting it afterwards |
| --- | --- | --- | --- | --- |
| Google Docs | yes | not documented | not documented | not documented |
| Word (OOXML) | yes, `w:rPrChange` | no, only the previous property set | not documented | restoring the stored set would undo the direct edit (inferred) |
| CKEditor 5 (commercial) | yes | yes, `oldValue` and `newValue` | not documented | not documented |
| prosemirror-suggest-changes | yes, as a replaced copy | yes, the copy holds it | the suggestion stays (source read) | the direct edit is lost (source read) |
| ProseMirror core, prosemirror-changeset | no pending suggestions | no | no | no |
| Slate, Lexical, Tiptap open source | no tracked changes (file-name search) | no | no | no |
| Plite | yes | yes | the suggestion stays | the direct edit stays |

Plite's DOCX export of a stack with an Editing tag on top writes a format revision whose old and new values are both the Editing value. The pending suggestion under it has no OOXML form, because OOXML keeps one previous property set per run (inferred from `w:rPrChange`).

For undo, [Undo finds what each node was](../2026-10-18-undo-repair-nodes.md) read ProseMirror history and transform, y-prosemirror with Yjs, Lexical history, Slate history and Tiptap's collaboration extension at the revisions in its frontmatter, and ran none of them. None has a review layer that decides values after the change, so none faces this repair. The closest is Yjs refusing a redo that conflicts with a later write.

| Editor | How undo finds the content it changes | What formatting does on undo | Re-decides a value after undo |
| --- | --- | --- | --- |
| ProseMirror | Stores each step's inverse with its position map and rebases it through later maps (`history/src/history.ts:88`, `:58`); a position inside a deleted range comes back through mirror maps (`transform/src/map.ts:264`) | Marks are values on the content, so the inverse step puts the old marks back | No |
| Tiptap | ProseMirror history, or y-prosemirror's undo under collaboration (`extension-collaboration/src/collaboration.ts:175`) | As ProseMirror or Yjs | No |
| Slate | Applies each stored operation's inverse in reverse order (`slate-history/src/with-history.ts:53`) | Properties are values on the node | No |
| Lexical | Restores a whole saved editor state (`lexical-history/src/index.ts:444`); under collaboration, Yjs's UndoManager | The snapshot's values | No |
| Yjs with y-prosemirror | Item ids; a redo re-creates deleted items linked to their old ids | Formatting attributes follow the characters | Refuses a redo of a map key another client wrote after (`yjs/src/structs/Item.js:236`) |
| Plite | The kept sections of the undo's own change, since stored values carry no node ids | History's values, then admission's repair | Yes, from the decisions made since the write |

For review reads on a preview, [One map of a preview's places](../2026-10-19-preview-places-on-next.md) read local checkouts on 2026-10-17 (BlockNote `1e26f1c`, prosemirror-suggest-changes `653fba7`, manuscripts track-changes `62f4d19`, CKEditor 5 `14e73cc31b`, ONLYOFFICE `72b0421`, EigenPal DOCX editor `84c4622`) and vendor docs for Google Docs, Word and CKEditor 5's commercial track changes, and ran none of them. Google Docs, Word's Original view and CKEditor 5's final-content preview hide review cards in a clean preview, and Google Docs requires inline indexes for any write. EigenPal keeps its review queue in both previews and places each card by the stored paragraph ids its layout keeps, a merged fragment indexing every paragraph it shows; content the preview drops gets no anchor. No editor documents a map from a preview position back to its stored suggestions, and none documents typing a suggestion inside a preview that reorders paragraphs.

| Editor | Preview modes | Cards in a preview | A preview place to its stored suggestions | Block identity across a preview | Source |
| --- | --- | --- | --- | --- | --- |
| Google Docs | Suggestions accepted, suggestions rejected | Hidden; the clean previews show no comments or suggestions | None documented; writes need inline indexes | Not documented | [Suggestions API guide](https://developers.google.com/workspace/docs/api/how-tos/suggestions), [SuggestionsViewMode](https://developers.google.com/workspace/docs/api/reference/rest/v1/documents#SuggestionsViewMode) |
| Microsoft Word | No Markup, Original | Original hides tracked changes and comments | Not documented | Not documented | [Track changes in Word](https://support.microsoft.com/en-gb/word/training/track-changes-in-word) |
| CKEditor 5 (commercial, docs only) | Final content in a modal; accepted or discarded data | Not documented; the modal shows content only | None; a temporary editor serializes the result | No shared model objects | [Preview final content](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/track-changes/track-changes-preview.html) |
| EigenPal DOCX editor `84c4622` | Proposed result, original | Kept; the review queue reads the stored tree in both modes | Stored paragraph ids and offsets that layout fragments keep; a merged fragment indexes every paragraph it shows | Yes, by stored paragraph id; dropped content gets no anchor | `eigenpal/docx-editor@84c4622:packages/core/src/store/store/review-reads.ts`; `eigenpal/docx-editor@84c4622:packages/pro/src/review/review-model.ts` |
| BlockNote `1e26f1c` | Viewing suggestions, base document; no accept-all preview | Suggestion marks stay in viewing mode | Mark ranges and CRDT ids | Raw block ids kept, sometimes duplicated | `TypeCellOS/BlockNote@1e26f1c:packages/core/src/y/extensions/Suggestions.ts` |
| prosemirror-suggest-changes `653fba7` | None built in; `applySuggestionsToNode` returns the accepted document | No sidebar | None returned | No block ids | `handlewithcarecollective/prosemirror-suggest-changes@653fba7:src/commands.ts` |

For the lines a preview adds, [Typing at the end of a line a pending join pulls up](../2026-10-24-authored-joined-line-end.md) read `prosemirror-changeset` at e215757 in source. Each step's map records the ranges it inserted and deleted, and content matching runs only inside a changed range, to shrink it to the real difference; its docs say that match can shift with range boundaries. Plite takes the same split. The resolver says which lines it added, and matching runs only on the rest. Lexical and Slate have no review mode in core, and Tiptap's review features were not read.

For a commit that changes an element's attributes and children in a shared room, and for a unique id repeated after a merge, [Spare blocks in a shared room](../2026-10-24-spare-collaboration.md) compared these editors. A Codex explorer read these from local checkouts on 2026-10-24 and ran none of them. The lead cloned lib0 so it could read y-prosemirror's diff. Every binding that keeps an element's identity patches its attributes and children in place, and none guarantees unique ids after a merge.

| Editor | Attributes and children changed in one transaction | A unique id repeated after a merge |
| --- | --- | --- |
| y-prosemirror `9200946`, lib0 `1.0.0-rc.13` (pinned) and `rc.36` | Modifies the existing element whenever the node name matches, attributes changed or not (`delta.js:4738` in rc.36, `:2537` in rc.13) | No repair found; ids are ordinary attributes |
| slate-yjs `69f3e0e` | Keeps the parent: `set_node` sets attributes, and child inserts and removes run inside it (`setNode.ts:16`, `removeNode.ts:10`) | No repair found |
| Lexical `dd5c41b13` | An element with the same key keeps its shared type; properties sync, then children (`CollabElementNode.ts:457`) | No repair found; internal keys never sync (`Utils.ts:65`) |
| Tiptap UniqueID `91c51be53` | Out of its scope | Skips remote transactions after the first sync; that first sync keeps the first copy and regenerates later ones (`unique-id.ts:216`, `:196`) |
| BlockNote UniqueID `1e26f1c` | Out of its scope | Regenerates newly inserted duplicates inside the changed ranges only; no whole-document guarantee, and copies under a suggested deletion may repeat (`UniqueID.ts:224`, `:179`) |
| Yjs `da052300` | A modify op patches the existing shared type (`ytype.js:1049`) | Two equal inserted elements both survive; one map key keeps one value by client order (`Item.js:490`, `:533`) |
| Plite | Property edits of an element that keeps its key write in place, then each changed region's child edits lower on their own; a receiving editor keeps the element's key while a line stays in it | Every commit and load gives a repeated unique value a fresh one, on the copies a local commit wrote or, after a merge or a load, on every copy after the first in document order |

For a value that waits on several decisions, [Settle shown block ids wherever their last suggestion is decided](../2026-10-24-shown-settlement.md) compared these editors. A Codex explorer read these from local checkouts on 2026-10-25 and ran none of them. None stores a value that waits on several decisions. Each applies a decision on the client that makes it, and the receiving peers that repair ids, in BlockNote and CKEditor 5, repair duplicates, not values that wait.

| Editor | Suggestions | A value that waits on several decisions | Where a decision's write runs |
| --- | --- | --- | --- |
| prosemirror-suggest-changes `653fba7` | Yes, attributes included | Not found; a new suggestion on an attribute replaces the earlier one (`attrStep.ts:29`) | The deciding client's command; sync transactions bypass the plugin (`withSuggestChanges.ts:201`) |
| manuscripts-track-changes-plugin `62f4d19` | Yes, node attributes included | Nearest case, an id that stays prefixed while any shadow range covers its node (`normalizeShadowIds.ts:35`) | The deciding client's `appendTransaction`; rebased remote transactions skip it (`plugin.ts:99`) |
| BlockNote `1e26f1c` | Yes, through `@y/prosemirror`, whose decision code is not in the checkout | Not found; copies share a stored id and get computed identities (`getBlockInfoFromPos.ts:51`) | The invoking client; UniqueID repairs missing and duplicate ids in changed ranges after local and remote transactions (`UniqueID.ts:149`) |
| Tiptap `91c51be53` | Not in the open-source packages | Not found | UniqueID skips sync transactions after the first sync (`unique-id.ts:208`) |
| CKEditor 5 `14e73cc31b` | Commercial; source not present | Not determined | The open-source list post-fixer repairs duplicate list item ids on every change (`postfixers.ts:123`) |
| y-prosemirror `9200946` | Attribution-aware rendering; accept and reject not in the checkout | Not found | Each receiving binding writes imported attributes (`sync-utils.js:241`) |
| Lexical `dd5c41b13` | None | Nearest case, a comment mark that unwraps once its last thread id goes (`CommentPlugin/index.tsx:752`) | The deleting client; peers import with transforms skipped (`SyncEditorStates.ts:212`) |
| docx-redline-js `616b7f5`, eigenpal docx editor `84c4622` | Property revisions | Not found; a new proposal replaces the earlier one | The operation that decides; peers receive its result (`document-session.ts:640`) |
| Plite | Yes | Shown ids wait on every holder of their group | A settle stage after admission, on every commit and load of every editor |

For the work a settle stage does after a change, [Settle shown values at the cost of what a commit changed](../2026-10-25-settle-readiness.md) compared these editors. A Codex explorer read the first five from local checkouts on 2026-10-25 for the shown-settlement plan, and the lead read Slate's normalizer at `945a484df`. None was run. Each scopes its per-change repair to what the change touched, or skips peers' changes, and none keeps a value that waits on several decisions.

| Editor | What runs after a change | What it reads |
| --- | --- | --- |
| Slate `945a484df` | Normalization | Only the paths each operation dirties (`normalize.ts:12`, `DIRTY_PATHS`) |
| BlockNote `1e26f1c` | UniqueID repair of missing and duplicate ids | Changed ranges, after local and remote transactions (`UniqueID.ts:149`) |
| Tiptap `91c51be53` | UniqueID | Skips sync transactions after the first sync (`unique-id.ts:208`) |
| manuscripts-track-changes-plugin `62f4d19` | Its `appendTransaction` | Skips rebased remote transactions (`plugin.ts:99`) |
| Lexical `dd5c41b13` | Node transforms | Skipped on a peer's import (`SyncEditorStates.ts:212`) |
| Plite | The settle stage | Nothing on a commit the quiet gate passes; otherwise only the values the commit's change reaches |

For redo after a fixup wrote a value, [Redo a settling decision by taking settlement back](../2026-10-25-redo-settlement.md) compared these editors. A Codex explorer read eight editors from local checkouts on 2026-10-25, at the revisions below, and ran none. ProseMirror, Slate and CKEditor 5 replay the stored change on redo and run their fixups again on the current document. None takes back a value a fixup wrote, and none keeps block ids unique after a redo without a fixup that runs again.

| Editor | What an undo step stores | Fixups on undo and redo | Unique block ids after a redo |
| --- | --- | --- | --- |
| ProseMirror (history `768b742`, state `57d4a96`) | Inverse steps, fixup steps appended to the transaction included | `appendTransaction` runs on history transactions, and its steps join the opposite event (`history.ts:265`, `state.ts:137`) | No built-in check |
| Slate `945a484df` | The batch's operations, normalization included | Normalization runs again after a redo, outside saving (`with-history.ts:20`) | No built-in check |
| CKEditor 5 `14e73cc31b` | The batch, post-fixers included; redo stores the actual undo batch (`undoediting.ts:114`) | Post-fixers run again, with an undo flag | The list post-fixer mints a new id for a duplicate list id (`postfixers.ts:131`) |
| Lexical `dd5c41b13` | Editor state snapshots locally; Yjs's undo manager in collaboration | Transforms may run on a restored snapshot (`LexicalEditor.ts:1723`); collaboration skips them | No built-in check |
| Tiptap `91c51be53` | ProseMirror's history | UniqueID runs again on the changed range and skips sync transactions (`unique-id.ts:214`) | UniqueID re-mints a duplicate |
| BlockNote `1e26f1c` | ProseMirror's history; its collaborative undo lives in an external package the explorer could not read | UniqueID runs on undo, redo and remote transactions with no origin filter (`UniqueID.ts:149`) | UniqueID re-mints a duplicate |
| Yjs `da052300` | Sets of CRDT items | No fixup; redo copies the content back (`Item.js:235`) | Can duplicate |
| y-prosemirror `9200946` | Yjs items | ProseMirror append hooks may run | No built-in check |
| Plite | The commit's inverse, plus on a settling commit the inverse of what the settle stage wrote; the redo step's change is the actual undo's inverse with that taken back | Redo replays the change without settlement; admission, the uniqueness repair and the settle stage run on the result | The uniqueness repair checks every replayed write, renames included, as Tiptap's UniqueID re-mints only a duplicate |

For the work after a spare record change and the unique index, [Resolve only what a spare record change can reach](../2026-10-26-spare-resolve.md) compared these editors. A Codex explorer read these from local checkouts on 2026-10-25 for the [Settle readiness](../2026-10-25-settle-readiness.md) plan, and the lead read Slate's normalizer at `945a484df`. None was run for that plan. Each scopes its per-change work to what the change touched.

| Editor | What runs after a change | What it reads |
| --- | --- | --- |
| Slate `945a484df` | Normalization | Only the paths each operation dirties (`normalize.ts:12`, `DIRTY_PATHS`) |
| BlockNote `1e26f1c` | UniqueID repair of missing and duplicate ids | The changed ranges of each transaction (`UniqueID.ts:149`) |
| Tiptap `91c51be53` | UniqueID | Skips sync transactions after the first sync (`unique-id.ts:208`) |
| Plite | The review view after a spare record change | The root's first and last runs, only when they can take a spare |
| Plite | The unique index | Every element once at load, then every node a commit added, removed or changed |

## Open work

- Suggesting a move of a block that owns an exclusive content root fails validation, which reports two owners of its root. owner: the owner, through session card `task_04df43cd`. stop: that session lands or is dropped.
- Removing one's own pending card in a later update strikes it instead of removing it, because a root's content carries no marks that say who wrote it. owner: the owner, through session card `task_78ec84d8`. stop: that session lands or is dropped.
- Three ownership judges infer the owners of roots a change did not touch, and the projected judge falls back to a full judgment when an owner moves between an exclusive and a shared slot. owner: the owner, through session card `task_97fe3a33`. stop: that session lands or is dropped.
- Line T was not measured on the final bytes, because the host stayed loaded past its limit. owner: the owner, through suggested task `t_8ce3c935`. stop: that task lands or is dropped.
- The diff of [authored root deletion](../2026-10-17-authored-root-deletion.md) had only Opus seats, because Codex is signed in with a ChatGPT account that lacks the review models. owner: the owner, through that plan's Codex login question. stop: a Codex seat reviews the diff, or the owner drops it.
- The 8-key work gate leaves work that grows with a long session's key count ungated. owner: the owner, through suggested task `t_240c8c44`. stop: that task lands or is dropped.

- A decision or withdrawal at the same time as an Editing write can lose the edit, as on next (C15). Suggested task t_b8a4ce47 owns the fix and holds the arena's put-back sketch. owner: the owner. stop: t_b8a4ce47 lands or is dropped.
- A wrong value can still come back after an undo in four cases. Characters another writer typed keep the replayed value, and so do a block whose opening the undo replaced and the text of a block the undone commit wrapped or unwrapped. Undoing an Editing commit that replaced a block brings back the old block with any format another author then suggested on the new one. Suggested task t_128bbd1d decides these four. owner: the owner. stop: t_128bbd1d lands or is dropped.
- A decision or undo at the same time as an Editing writer's undo leaves a rejected or undone value as plain text (R12, R17), and undoing a reject after that undo brings the suggestion back without its value (R13b). Suggested task t_b8a4ce47 holds both. owner: the owner. stop: t_b8a4ce47 lands or is dropped.
- A partial withdrawal racing a suggestion over it gives a result that depends on decision order, and next gives the withdrawn value in both orders. A host that drops a document's records loses its Editing values with no error. The discussion button keeps a stale count after a decision that changes only `authored`, as on next. Suggested tasks t_a0284bee, t_f1233d76 and t_1ccd8173 hold them, in that order. owner: the owner. stop: each task lands or is dropped.
- Suggestions on both sides of an Editing edit wait on each other. Suggested task t_7314eae0 owns the question. owner: the owner. stop: t_7314eae0 lands or is dropped.
- The accepted line join that blocks decisions on the same block stays with suggested task t_a269db34. owner: the owner. stop: t_a269db34 lands or is dropped.
- The many-records reject line of step 7 is inconclusive, and its next probe counts landed-record reads before it times the line again on a quiet host. Suggested task t_541200bb runs it, and t_a7c7c429 owns core's rebuild of the records JSON on each record write. owner: the owner. stop: each task lands or is dropped.
- Undoing one's own suggestion after another writer's Enter split it leaves the suggestion's tag on the half the Enter split off. It is suggested task t_ecea0fff. owner: the owner. stop: t_ecea0fff lands or is dropped.
- Undo reads the whole document about ten times through history's replay and redo record. It is suggested task t_d78c9655. owner: the owner. stop: t_d78c9655 lands or is dropped.
- Returning any repair costs 2 more whole reads in core admission's orphan check, and settle copies the whole root when a decision settles blocks. Suggested task t_1a6aacfb holds both. owner: the owner. stop: t_1a6aacfb lands or is dropped.
- A peer's typing in the right half of a block another client splits lands in the left half, and a peer's edit in a child the split moves whole is lost. Typing is also lost when the split formats that half at offset 0, when Enter lands at a block's end, or when the commit also changes the left block, formats only part of the first text it moves or changes anything it moves after that text. A split before two inline elements copies them into both halves while a peer types, and the peers differ. A cut where two leaves meet leaves the writer's editor and the shared document different, and a replacement whose left block keeps the old letters and format reaches peers as a split. All of it happens at 01da933d63 or on next. Suggested task t_649d2131 decides how a split keeps its moved letters. owner: the owner. stop: t_649d2131 lands a fix or is dropped.
- A type change in place that unsets a property set-valued only on the old type leaves it in the Yjs document, and the peers' editors differ. It is suggested task t_0242f13b. owner: the owner. stop: t_0242f13b lands or is dropped.
- `writeTextRuns` finds each changed run's place in the Yjs text chain by scanning from the chain's start, so formatting many runs over a block that holds many Yjs texts, as repeated merges leave, reads the chain once per run. It is suggested task t_3c33e35c. owner: the owner. stop: t_3c33e35c lands or is dropped.
- Where Enter, block merges and an inserted block land among a pending join's moved lines, which the recorder refuses today, and where accepting puts a moved line that the joins after it merge into, which it drops as before. Select-all Delete beside a joined line and its follower also refuses, at the top level and in a quote, and recording it needs the recorder to replace a whole root across its breaks. owner: zbeyens; stop: t_bdec706b lands or is dropped; tracked: the suggested-task ledger.
- A moved line's place after its join when another join on it is decided alone. owner: zbeyens; stop: t_a9d89ef3 lands or is dropped; tracked: the suggested-task ledger.
- A mark applied across the whole of a pending join's joined line. owner: zbeyens; stop: t_9bd5d71a lands or is dropped; tracked: the suggested-task ledger.
- Other authors' pending claims on a lowered merge's landed copy. owner: zbeyens; stop: t_e623a723 lands or is dropped; tracked: the suggested-task ledger.
- What a text drag over a line moved between a pending join's halves moves. owner: zbeyens; stop: t_7765642d lands or is dropped; tracked: the suggested-task ledger.
- Rejecting one's own split in a pending join's target. owner: zbeyens; stop: t_3b905704 lands or is dropped; tracked: the suggested-task ledger.
- The caret after a link when Backspace merges a line into one that ends in a link. owner: zbeyens; stop: t_b483ab66 lands or is dropped; tracked: the suggested-task ledger.
- A token cursor query for the elements strictly open at a position. owner: zbeyens; stop: t_4b8c1202 lands or is dropped; tracked: the suggested-task ledger.
- The recording law that throws "Only a block follows a join". owner: zbeyens; stop: t_04797f74 lands or is dropped; tracked: the suggested-task ledger.
- The ledger laws at seeds 207, 101 and 20261015 over moved content, which next's own ledger failure stops before any framed step. owner: zbeyens; stop: t_5706461c lands or is dropped; tracked: the suggested-task ledger.
- Which intent a refused change ran in, so the toast names the right mode for a proposal forced from Editing. owner: zbeyens; stop: t_4b729b20 lands or is dropped; tracked: the suggested-task ledger.
- This subject's page, which the renderer refuses while it shows a fold of an open plan. owner: zbeyens; stop: t_d4caeb74 lands or is dropped; tracked: the suggested-task ledger.
- When peers receive a late claim that empties a level and the verdict on one of its sibling claims in different orders, each deletes the other's kept block, so the level ends empty in storage and two peers typing into it store two lines (R6 of [settle repair identity](../2026-10-26-settle-repair-identity.md)). A peer that imports storage again receives both at once, which is one such order. owner: zbeyens. stop: a donor every peer agrees on whatever verdicts it knows, or a binding that keeps an emptied level.
- A letter a peer types inside a block an admission repair removes is lost, because the deletion wins. owner: zbeyens. stop: the owner asks for a fix or drops it.
- Each mark rewrite an admission repair makes stores one mark record per admitting peer. owner: zbeyens. stop: the owner asks for a fix or drops it.
- Settle keeps an emptied element, with its accepted claim, where its level needs a node that no removed element can become by deletions and property writes, or where the one that could stores no text and the level's empty text has a generated property. The next decision removes it. owner: zbeyens. stop: the owner asks for a fix or drops it.
- A line deleted with its boundary, such as by selecting it and pressing Backspace twice or by a selection from the end of the line before it, leaves an empty line when its verdict arrives before its claim, because settle keeps an accepted join unlanded. Deciding it at once removes the line. owner: zbeyens; stop: t_e3dcf88b lands or is dropped; tracked: the suggested-task ledger.
- No test fails without the Yjs writer's check that a stored block still reads as the repair's base, because the binding's stale-write check catches a peer's update that lands while an import notifies its commit first. A peer update that joins the repair's own Yjs transaction reaches the check, which refuses and rewrites the root, a limit the collaboration subject's Open work names. No test reaches settle's rule that keeps Editing's claim on a block that goes with a pending join. owner: zbeyens. stop: a case that reaches each, or deleting it.
- Exact node placement, undo keys and anchors near moved lines, and own acceptance's change when it reorders, which stay coarse. owner: zbeyens; stop: a recording law fails on one, which offers its task; tracked: `docs/plans/2026-10-17-command-law-moved-content.md`.
- A container the parent groups with a sibling resolves whole on each key while the link stands. A framed step of the ledger laws resolves or adopts one whole on 22 of 168 framed steps. Cutting it at its edge belongs with the edits beside a container and the claim keys a key inside a container copies (rows 158 and 159 of `docs/plans/2026-10-17-preview-review-origins.decisions.tsv`). owner: zbeyens, through a suggested task. stop: that task lands or is dropped.
- `ledger.carry` advances every preview mode a reader ever indexed on each owner commit, even with no view showing it (`packages/plitejs/src/authored/ledger/ledger.ts`). It limits the line "A preview mode costs nothing per commit while no view shows it" in `docs/plans/2026-10-13-review-tree-pivot.md`. owner: zbeyens, through a suggested task. stop: that task lands or is dropped.
- A later key on a loaded document reads the whole root through the caret read and, in Editing, the saved baseline (row 190 of `docs/plans/2026-10-17-preview-review-origins.decisions.tsv`). owner: zbeyens; stop: t_1a6aacfb lands or is dropped; tracked: the suggested-task ledger.
- The recording laws leave out two documents that the recorder cannot record, the identity law's two Editing-join documents, with `REORDERED`'s proposed floor at 41 instead of 44. owner: zbeyens; stop: t_084ac465 lands or is dropped; tracked: the suggested-task ledger.
- The emptied-wrapper check visits each of the wrapper's children to tell blocks from text and reads each block before the first live one, the writer's own pending deletions included, so deleting a long quote's lines one at a time from the top costs more with each line. owner: zbeyens; stop: t_c2ca1bf8 lands or is dropped; tracked: the suggested-task ledger.
- The plain-editor command law skips a raw write whose stored result, once accepted, differs from the plain editor's, instead of asserting that stored result. owner: zbeyens; stop: t_6100e44c lands or is dropped; tracked: the suggested-task ledger.
- A split or join card's revision does not cover the block a decision merges it into (rows 191 and 206 of `docs/plans/2026-10-17-preview-review-origins.decisions.tsv`). It limits this subject's revision rule and the revision paragraphs of `content/docs/(guides)/authored-changes.mdx` and `content/docs/plite/libraries/plite-authored.mdx` with their Chinese twins. Covering the keys of the blocks before it costs work that grows with them on each key, so it needs a design of its own. owner: zbeyens, through a suggested task. stop: that task lands or is dropped.
- A hand-written document with two followers of one join, one of them a join target with its own follower, shows only its first paragraph under Proposed. owner: zbeyens, through a suggested task. stop: that task lands or is dropped.
- The ledger laws fail on 30 of 72 hunt seeds for reasons older than the preview map, and a nested root in the second ledger law fails six seeds the same way without it. owner: zbeyens, through a suggested task. stop: that task lands or is dropped.
- A follower that an edit moves keeps its follower claim, so Proposed puts it back after the joined line wherever the edit put it. Whether a move should drop the claim is a product call. owner: zbeyens, through a suggested task. stop: that task lands or is dropped.
- With Bob's pending subscript on a superscript `A`, Dave typing `Z` after `A` under Suggesting gives the live Proposed preview `AZ` in subscript, while a fresh load shows `Z` in superscript, at top level and inside a quote. owner: zbeyens, through a suggested task. stop: that task lands or is dropped.
- A delete over a range whose image reaches content it does not store may strike that content; a probe strikes Alice's `c` the same way without the preview map. owner: zbeyens, through a suggested task. stop: that task lands or is dropped.
- The `unaligned` refusal's message names no action, and `rebaseProperties` throws a plain `Error`. owner: zbeyens, through a suggested task. stop: that task lands or is dropped.
- The planted `crosses` control for typing at a caret fails on a Backspace the case must apply before it reaches the typed-caret assertion, so it does not yet prove that assertion. owner: zbeyens, through a suggested task. stop: before the next change to the frame's caret refusal.
- `RunPlaces.toProjected` moves a stored position inside blocks the preview hides whole to their edge, because `orderOf` in `packages/plitejs/src/authored/ledger/runs.ts` groups a hidden block with the order segment after it. owner: zbeyens, through a suggested task. stop: that task lands or is dropped.
- A remote commit that moves and shifts nodes under a pending range delete reports an empty review delta, where the kernel counts the delete as changed, as on next. owner: zbeyens; stop: t_235e0cbb lands or is dropped; tracked: the suggested-task ledger.
- The undo law's floor of 24 compared histories fails at some random fast-check seeds, because the generator sometimes samples too few undoable histories, as on next. The every-order decision law's floor of 12 compared decision orders fails the same way, and next and the joined-line-end build both compare exactly 12 at fast-check seed 7. owner: zbeyens; stop: the next change to either law; tracked: `docs/plans/2026-10-24-authored-joined-line-end.md`.
- Enter beside a line the preview adds stays with suggested task t_9cb6f7a6, apart from Enter at the end of a line joined into a quote. Enter in the first line, at the start or end of a joined line and at the end of the last line records what accepting gives, because accepting may drop added lines left untouched at the end. Enter at the end of a required title before a line another author deletes stores what next stores, and the test-only law still throws there, because the registry does not hold the line the preview adds. owner: zbeyens; stop: t_9cb6f7a6 lands or is dropped; tracked: the suggested-task ledger.
- A line added after a line another author deletes, when the root needs that line, is refused with `diverged`, where next stored it and the test-only law threw. owner: zbeyens; stop: t_9cb6f7a6 lands or is dropped; tracked: the suggested-task ledger, word store the line.
- A Delete that changes nothing visible can store empty paragraphs. A Suggesting removal of ef, in ab, cd joined, then ef in a root that needs 3 lines, stores ef as deleted and two empty paragraphs alice inserted, so the editor shows two suggested empty lines; decisions agree in every order a seat tried. owner: zbeyens; stop: t_9cb6f7a6 lands or is dropped; tracked: the suggested-task ledger.
- A caret placed after a link before a decision rejects the link's insertion lands in the link, as on next. owner: zbeyens; stop: a report or a test that needs that caret kept out; tracked: `docs/plans/2026-10-24-authored-joined-line-end.md`, word decision lean.
- A caret placed in the first of two or more added lines shows in the last one, as on next. owner: zbeyens; stop: a report or a test that needs that caret; tracked: `docs/plans/2026-10-24-authored-joined-line-end.md`, word caret number.
- The authored work test ran 5,518 ms under a parallel load, past Bun's 5,000 ms deadline, while alone it ran 3.6 s and 3.7 s on the joined-line-end build and 3.4 s and 4.0 s on slice 1. owner: zbeyens; stop: a run of the test past its deadline alone; tracked: `docs/plans/2026-10-24-authored-joined-line-end.md`.
- A block or mark toggle, or an explicit edit at the caret, at a caret a preview placed in an added line changes the line above while the preview still draws the caret in the added line. owner: zbeyens; stop: a report or a test that needs the caret moved; tracked: `docs/plans/2026-10-25-authored-added-line-caret.md`, word end on use.
- A view that parks and restores a caret a preview placed in an added line ends the drawing, though the caret did not move, because the restore places it again as a view caret. Keeping the drawing needs core's caret restore and the React restore to carry the preview's placement. owner: zbeyens; stop: a report or a test that parks and restores that caret; tracked: `docs/plans/2026-10-25-authored-added-line-caret.md`, word end on use.
- The preview can move its drawn caret without a commit, when the editor sets the same caret again or a preview places a caret where one already is. React's selection hooks update only on commits, so after the editor sets its own caret again, `useSelectionPaths` and `useTopLevelSelectionIndex` still point at the added line, and they still do after the next letter. That letter's commit starts from where a view last read the caret, not from where the hooks last saw it. Fixing it means each preview commit starts from the caret its listeners last got, and the preview commits when only its drawing changes, which changes how every preview commit starts. owner: zbeyens; stop: an app reports a selection highlight stuck on the added line, or work that changes how preview commits start; tracked: `docs/plans/2026-10-25-authored-added-line-caret.md`.
- A backward range whose anchor is in an added line reads its anchor back at the end of the joined line, as on next. owner: zbeyens; stop: a report or a test that needs that range; tracked: `docs/plans/2026-10-25-authored-added-line-caret.md`.
- A frame that appends a line and removes the first, beside an added line, is refused with `reordered`, where next records it. owner: zbeyens; stop: a report or a test that needs it; tracked: `docs/plans/2026-10-25-authored-added-line-caret.md`, word take it.
- An app that shows a preview and sends keys to the editor acts on the line above a caret the preview draws in an added line, because previews are read-only and the editor keeps the caret there. Typing lands at the end of that line, and Backspace deletes its last letter, where next's Backspace did nothing. owner: zbeyens; stop: an app that needs edits in the added line; tracked: `docs/plans/2026-10-25-authored-added-line-caret.md`, word act there.
- A refusal a caller catches inside an update, such as `crosses` or `unaligned` from a frame, lets the rest of the update commit with no notice, as on next. owner: zbeyens; stop: a report or a test that needs the notice; tracked: `docs/plans/2026-10-25-authored-added-line-caret.md`, word drop all.
- A command that inserts a line between a joined line and the added line after it stores nothing and refuses nothing, as on next, and so does one between x and a line another author deletes after it, in a root that needs 2 lines. A plugin insert before an added line is refused. owner: zbeyens; stop: a report or a test that needs it; tracked: `docs/plans/2026-10-25-authored-added-line-caret.md`.
- The registry recognizes an added line by its object, and the accepted document can reuse that object for an equal empty line the write saved. So if a recording lost a saved empty line at the end, next to an added line, both checks would miss it. This was found by reading the code, not measured. Tracking added lines by their position in the level, or never reusing an added line's object for a saved line, would close it. owner: zbeyens; stop: a report or a test that loses such a line; tracked: `docs/plans/2026-10-25-authored-added-line-caret.md`.
- A retype plus a child change in one commit still rewrites the element in the room, as on base, since child encoding reads the element's type. owner: zbeyens. stop: none in the spare-collaboration plan.
- A schema with content roots reconciles its root by rewriting any block whose skeleton changes, as on base; no shipped feature declares one. owner: zbeyens. stop: the first feature that declares a content root.
- A property change on an element with several changed children, such as a table column insert, keeps today's path when the rest still falls to `range`, as on base. owner: zbeyens. stop: none in the spare-collaboration plan.
- Two peers can each repair one duplicate with their own fresh value; Yjs keeps one per element, so the rooms converge, as concurrent Editing does. owner: zbeyens. stop: none in the spare-collaboration plan.
- A concurrent accept and reject of one change keeps the accept's built block and both verdict records. owner: zbeyens. stop: none in the spare-collaboration plan.
- A line only the editors hold reaches the room when someone first edits in, on or beside it, or a decision drops its spare, so until then the room keeps its container empty, as on base. owner: zbeyens. stop: none in the spare-collaboration plan.
- Suggesting refuses writes under an element generator until the construction-values plan's step 10, so the spare-collaboration plan's step 4 in-place id write and decision schedules run through a module mock of that refusal, and its step 3 Suggesting move waits. owner: zbeyens. stop: the construction-values plan's step 10, which drops the mock and runs both through a real editor.
- One commit that sets a top-level block's property and moves another top-level block leaves the room without the property, as at `2493189e74`. owner: zbeyens. stop: suggested task t_c313ad28, which this run folded it into (the set-move-room probe fails at `989c703aa5` and `ee0b38ca07`).
- No test fails when the bridge writes a container's line without the built mark on the container's `authored` set; a root's spare records have their tests. The mark matters once a later build can take the same spare, such as a suggested deletion that empties the container again. owner: zbeyens. stop: the construction-values plan's step 10, which lets Suggesting run under a generated element id.
- A collaboration repair the bridge cannot lower still reconciles the whole root, as every admission repair does today. owner: zbeyens. stop: a repair that falls back in the race tests or a miss of the construction-values plan's step 8 budget on the race at 10,000 paragraphs.
- A decision that empties a container and builds its line from a spare gives the container a new node key in a receiving editor, as on base, because the alignment pairs elements only through shared text. owner: zbeyens. stop: none in the spare-collaboration plan.
- Peers whose documents differ, such as one with an unsynced move, can rank two copies in different orders and each rename a different one, so no copy keeps the value; the room still converges. owner: zbeyens. stop: none in the spare-collaboration plan.
- A rejected cut whose left fragment is gone gives the merged block that fragment's id even when an app has since stored it elsewhere, and the repair then renames the merged block inside the decision. owner: zbeyens. stop: an app that reuses a removed block's id.
- A document saved before its schema marked a key unique can hold format tags on that key, and rejecting one can bring back a value another block stores, which the repair then renames inside the decision. Adding `unique` changes the fingerprint, so such a document goes through a migration, and that migration keeps the tags. `ElementIdPlugin` gains `unique` in the landing that first lets Suggesting run under it, so no Plate document holds such a tag. owner: zbeyens. stop: an app that adds `unique` to a key with stored suggestions.
- A change whose element changes type, or whose alignment finds no shared text or too many sibling pairs, still arrives flat and rewrites the element, as on base. owner: zbeyens. stop: none in the spare-collaboration plan.
- The remote-repair reconcile in `lowerRemoteCommitRepairs` writes a root's stored spare records too, so every path that writes the root writes them. No test reaches it, because the build found no schedule where a remote commit's repair rewrites a root whose line only the editors hold. owner: zbeyens. stop: a schedule that reaches it.
- An Editing insertion that copies a value only an unbuilt spare holds stores it, because the recorder's closing pass in `command-values.ts` counts no spare as a holder, so building that spare later stores the value twice. The bytes do not depend on decision order, and the repair renames a unique value. owner: zbeyens. stop: a non-unique property whose copies must stay single.
- Resolution checks a value that a rejected inline split gives back through its cut's kept properties against the joined element's place only when the place or a format changed; both halves share one type. owner: zbeyens. stop: a split whose halves differ in type.
- When a peer changes only a link's text and types after it, the undo caret jumps past the peer's letter, because the receiving editor gets a flat change rather than an aligned one. owner: zbeyens. stop: none in the spare-collaboration plan.
- The spare-collaboration plan did not check the list and code-block plugins' commit-updated caches for the draft-read defect `ElementIdPlugin` had. owner: zbeyens. stop: none in the spare-collaboration plan.
- A public lookup by a unique value waits for a second first-party unique property; `ElementIdPlugin` keeps its own index until then. owner: zbeyens. stop: the second unique property.
- A retained join that two peers' rejections both unblock at once stays stored with nothing pending until an unrelated decision, and its group waits with it. owner: zbeyens. stop: suggested task t_03e8029f lands or the owner drops it.
- When one peer creates a shower while another peer's decision makes that shower's group ready, the two peers can settle two different elements to the same value. The room converges. Under a unique key, the unique repair renames the later holder. Under a generated value that is not unique, which the shown-settlement plan's step 6 large-group cohort uses, two elements keep one value for good. owner: zbeyens. stop: none in the shown-settlement plan.
- A commit that both creates a shower and settles it keeps its settle writes apart like any settling commit, so its redo settles again, but no case covers it. No Suggesting command does this, because the suggestion that creates a shower is pending. owner: zbeyens. stop: none in the shown-settlement plan.
- An undo can restore an original holder whose value a peer's settlement gave away, and the unique repair then renames the restored original. owner: zbeyens. stop: none in the shown-settlement plan.
- `createEditor` runs the authored load repair twice, at `create-editor.ts:358` and `plugin.ts:2357`, so every load settles twice and the second pass hides a load that settles too early. owner: zbeyens. stop: none in the shown-settlement plan.
- The closing pass does not count unbuilt spare holders, so a copy whose frame value only an unbuilt spare holds gets no alias, as the Command values law says. owner: zbeyens. stop: none in the shown-settlement plan.
- A structural edit to one member of a group of many links searches that group's links once per commit. owner: zbeyens. stop: a cohort shows it matters.
- One element object at two places in a document counts as two storers, and as a shower keeps one home. The settle stage runs after the uniqueness repair and writes a value only where no element stores it, and nothing checks uniqueness after it; no case covers a shower object at two places. owner: zbeyens. stop: a case or a report shows one.
- A move applies each root's drops only after the roots before it have taken their homes. So when one history replay moves a block out of a content root into main as the same object, a nested shower's home may stay on a stale block, and the decision that settles it would then throw. No case moves a block between roots. owner: zbeyens. stop: a probe that replays such a move.
- A decision's settlement scans each root from its first block to its last shower's block. At 10,000 paragraphs an accept took a median of 708 ms with the shower first and 743 ms with it last, 7 runs each, a gap within the runs' spread (`places-rank-probe-a1.log`, probe `places-rank-probe.test.ts`). No counter counts the scan. owner: zbeyens. stop: a cohort that times a decision at 10,000 blocks.
- The abort case has no content root and no nested shower, so a journal that rolls back only main and top-level showers passes it. owner: zbeyens. stop: a change to `ShownBook`'s journal.
- An invariant in the `authored-decision-order` checker that settlement writes element properties only, over every document up to its bound, beside core's assertion on the cases that run. owner: zbeyens. stop: a settle stage that writes structure.
- A skipped insertion at the place a redo inserts drops that redo step, at `26b1d3efab` as well, so the import case of the redo-settlement plan's step 3 puts its insertion elsewhere. owner: zbeyens. stop: a report or a case that needs that redo.
- History saved on `next` under Plate's id plugin likely fails the schema identity check once this run makes that id unique (the redo-settlement plan's Premises). owner: construction-values step 12. stop: construction-values step 12, whose migration note checks and states it.
- Undo takes back a format edit skipped after the commit when that commit wrote the same mark twice and also wrote text in another root, on `ee0b38ca07` too (Astra, diff round 3, `r3-astra2-base-ee0b-a1.log`). Composing the two writes drops the root's classification, and history's text-only replay path reads the classifications left as if they covered every root. A commit that also creates a root and writes in it escapes only because that compose diffs the whole document and classifies every root again. owner: zbeyens, tracked as t_6430ff19 in the suggested-task ledger. stop: that task lands.
- `DocumentChange.compose` asks for the source value whenever two changes touch a root that one of them creates or deletes. So a commit that creates a root and writes in it composes through a diff of the whole document (Opus, diff round 2). The composes in `commitRecordedDraft`, `admit` and the settlement capture pass no source value, so a framed command that writes in a root a plain write created in the same update, or deletes one the frontier wrote in, likely throws (Opus, diff rounds 2 and 3, untested). Narrowing the guard to a root the first change creates broke the replay path above. owner: zbeyens. stop: the replay fix, or a report of the throw.
- The fresh-record guard's fingerprint leaves out where a shower sits inside its block, so a stale record whose container kept its properties and reordered its children passes it (Astra, diff round 1). owner: zbeyens. stop: a stale-record report or the next change to `readiness.ts`.
- The redo cases read every generated id as the order it first appears in, an id the starting document already held included, so a redo that gives an element a fresh generated id in place of its own passes them. Their contested ids are literal, which compare exactly (Sol, diff round 1). owner: zbeyens. stop: a redo case whose contested id is generated.
- Deleting a root scans every unique holder. owner: zbeyens. stop: a cohort that deletes a root under a unique schema.
- `ElementIdPlugin`'s runtime index stores paths and moves them on `path` keys once a `read.entry` builds it, so each top-level insertion then moves every later sibling's entry. No step 8 cohort reads an entry. owner: zbeyens. stop: a cohort that reads an entry after an insertion.
- A keystroke in a named content root builds that root's snapshot index each commit once the unique index exists, because `getEditorCommitSnapshot` makes a fresh index for a named root. Before the spare-resolve plan that began at the first unique write; the load-time seed starts it at load. owner: zbeyens. stop: a scale gate that times typing in a named content root under a unique property.
- An editor that never writes, such as a read-only or server editor under `ElementIdPlugin`, builds the unique index at load. owner: zbeyens. stop: a cohort that measures such an editor's load.
- A command that writes a spare record itself fails the test build's frame law, at 53fa46d0f1 too, because its frame holds the build from before that write; its case turns the law off. The plugin's own writers store the value the view showed. owner: zbeyens. stop: a product command that writes a spare record inside its frame.
- When settling an accepted removal builds a root's line from its spare record, settle marks that record built but never drops the root's spare records once nothing pending in the root needs them, as a decision does, so a load or a peer that settles the verdict can keep records the deciding editor dropped. Dropping them needs every pending claim in the root, which settle does not read per commit. owner: zbeyens. stop: a peer or load whose records differ from the deciding editor's after a settled removal.
- Three completions take stored spares through their own copy of the same callback, which takes a spare, records its slot and holds its node: a decision's in `tree/resolve.ts`, the canonical pass's in `tree/spare-lines.ts` and settle's in `facts/settle.ts`. A change to one that misses the others makes settling build a different line than deciding. owner: zbeyens. stop: the next change to how a completion takes a spare.
- The Enter still reads about 3,007 and 30,007 whole nodes, the id property's own Editing cost (`how/whole-reads.md`), which the budget's factors allow. owner: zbeyens. stop: a budget that excludes the id property's cost.
