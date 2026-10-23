# Authored changes and selective reversal

Page: https://claude.ai/artifact/C5zrU46DjyucvH1hwC3jHP

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

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Plite | Contribution identity, retained content, positions, atomic review decisions and the accepted and proposed views. |
| Plate | Review workflow and presentation. |
| Applications | The ordinary `initialValue` and `editor.read.value()` calls; there is no public authored loader, cache, trusted-input mode, worker protocol or background replay controller. Authentication and access policy stay outside the engine. |
| Writer identity | Every non-empty write through the capability needs a current author ID, accepted edits included, so accepted and proposed writes share one path. A resolver may return `null` while an editor only reads; the first write validates a non-empty ID. Plite never invents an anonymous or system author. |

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

## Hard cuts and app migration

- `at` on a preview takes a node's key or path and names a node of the preview, a block or one of its texts. A key resolves only in the view. A point or a range throws `AuthoredPlaceError`, exported from `plitejs/authored`, on a preview, because no product code reads one there; on an intent view both keep their meaning. The owner editor reads its own preview the same way, and no option reads stored places from a preview. An app that read a preview with a stored place, such as a record's `ranges`, reads through an intent view instead.
- A page cursor from a read with `at` works only on a view with the same root and preview mode. A cursor from a read without `at` works on any view.
- `AuthoredChange.revision` covers no position except a split or join's path inside its top-level block, so a change's `ranges` can move while its revision stays the same. An app that caches `ranges` reads them again after each document change. A decision on a structure change stays valid after someone types or formats text inside it, and still refuses after its child blocks change.
- `AuthoredChangesDelta.blocks` names, on every view, each top-level block whose cards a change reached or left. Rejecting an insertion names the block it sat in, a merge that renames a block names both blocks, and a split that renames the blocks before the key names each of them. An app that read `blocks` as only the blocks a commit wrote also wakes the blocks a card left.
- Records keep their shape. `AuthoredChange.ranges` and the location fields of `details` stay places of the stored document, so an app never paints them into a preview; `packages/plitejs/test/react/decoration-manager-contract.test.ts` asserts a hidden insertion's id on Accepted and paints no stored range there.
- The edits beside a pending join that Rules lists refuse and roll back whole. An app that sends a format, a select-all Delete, typing or paste beside a joined line handles the `unrepresentable` refusal and its reason.
- A command that names a place of its own, such as `BaseLinkPlugin.upsert` with `insertNodesOptions.at`, is not refused for a selection the preview cannot place, as on next, so when it also edits at that selection it can change text outside it. Its edits at the places it names still refuse as Rules lists. A format such as Bold over a moved piece formats what the proposed preview shows between the selection's ends, so it can format text stored outside the selection or leave moved text stored inside it plain. owner: the owner; stop: the frame's selection-consumption task lands or the owner drops it.
- The top-level block a preview adds to complete the document reads no card, so a deleted only block's card shows only in Editing. One it adds inside a container can still read the hidden block it replaces. owner: the owner; stop: the filler card task lands or the owner drops it.

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
  accepts the writer's own claims in the same commit. It leaves every other
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
  piece keeps content, and into the piece after it otherwise. This is current
  behavior, not law, until the split-order task decides it.
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
- Settling applies a claim as a decision would. Deleted text goes, and an
  inline element whose deletion is accepted goes once none of its content
  survives, its pending cuts moving to its other pieces.

## Main changes

- `packages/plitejs/src/authored/tree/` turns each write into review marks on the stored document (`record.ts`, `record-completion.ts`), decides changes by rewriting that document (`resolve.ts`) and builds the previews (`proposed.ts`). `cuts.ts` reads the cut marks of pending splits and joins the fragments of a rejected one, and `layers.ts` decides pending property writes. The resolver merges an accepted join into its target, which keeps its type and properties, and reports `placements`, the landings that pass a shown line or change a shown container, and `hidden`, the blocks a preview hides whole with the shown block each collapses into. Projections leave out the `held` member, which only the resolutions written back to storage keep. The recorder reads the breaks of the lines a step touches from the ledger's map, where a break is a place the view shows two stored pieces side by side, and splits a frame step that crosses one into sub-steps that each map in stored order. A property-only step maps each token on its own through `rebaseProperties`. The recorder refuses a crossing it cannot split, a block merge whose right line holds or ends at a break, a block inserted beside a moved line and a removal mapped backward, stores nothing for them, and names each refusal's reason (`docs/plans/2026-10-17-command-law-moved-content.md`).
- `packages/plitejs/src/authored/facts/` owns the review records saved in the document's `records` and admits them when a document loads or a peer sends them (`records.ts`, `admission.ts`).
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
| EigenPal DOCX editor `84c4622` | Proposed result, original | Kept; the review queue reads the stored tree in both modes | Stored paragraph ids and offsets that layout fragments keep; a merged fragment indexes every paragraph it shows | Yes, by stored paragraph id; dropped content gets no anchor | `eigenpal/docx-editor@84c4622:packages/core/src/store/store/review-reads.ts`; `packages/pro/src/review/review-model.ts` |
| BlockNote `1e26f1c` | Viewing suggestions, base document; no accept-all preview | Suggestion marks stay in viewing mode | Mark ranges and CRDT ids | Raw block ids kept, sometimes duplicated | `TypeCellOS/BlockNote@1e26f1c:packages/core/src/y/extensions/Suggestions.ts` |
| prosemirror-suggest-changes `653fba7` | None built in; `applySuggestionsToNode` returns the accepted document | No sidebar | None returned | No block ids | `handlewithcarecollective/prosemirror-suggest-changes@653fba7:src/commands.ts` |

## Open work

- Suggesting a move of a block that owns an exclusive content root fails validation, which reports two owners of its root. owner: the owner, through session card `task_04df43cd`. stop: that session lands or is dropped.
- Removing one's own pending card in a later update strikes it instead of removing it, because a root's content carries no marks that say who wrote it. owner: the owner, through session card `task_78ec84d8`. stop: that session lands or is dropped.
- Three ownership judges infer the owners of roots a change did not touch, and the projected judge falls back to a full judgment when an owner moves between an exclusive and a shared slot. owner: the owner, through session card `task_97fe3a33`. stop: that session lands or is dropped.
- Line T was not measured on the final bytes, because the host stayed loaded past its limit. owner: the owner, through suggested task `t_8ce3c935`. stop: that task lands or is dropped.
- The diff of [authored root deletion](../2026-10-17-authored-root-deletion.md) had only Opus seats, because Codex is signed in with a ChatGPT account that lacks the review models. owner: the owner, through that plan's Codex login question. stop: a Codex seat reviews the diff, or the owner drops it.
- A Yjs import in a closed schema, in which two peers each removed one owner of a shared root, fails validation before the orphan drop, and the 8-key work gate leaves work that grows with a long session's key count ungated. owner: the owner, through suggested tasks `t_ba83b625` and `t_240c8c44`. stop: each task lands or is dropped.

- A decision or withdrawal at the same time as an Editing write can lose the edit, as on next (C15). Suggested task t_b8a4ce47 owns the fix and holds the arena's put-back sketch. owner: the owner. stop: t_b8a4ce47 lands or is dropped.
- A wrong value can still come back after an undo in four cases. Characters another writer typed keep the replayed value, and so do a block whose opening the undo replaced and the text of a block the undone commit wrapped or unwrapped. Undoing an Editing commit that replaced a block brings back the old block with any format another author then suggested on the new one. Suggested task t_128bbd1d decides these four. owner: the owner. stop: t_128bbd1d lands or is dropped.
- A decision or undo at the same time as an Editing writer's undo leaves a rejected or undone value as plain text (R12, R17), and undoing a reject after that undo brings the suggestion back without its value (R13b). Suggested task t_b8a4ce47 holds both. owner: the owner. stop: t_b8a4ce47 lands or is dropped.
- A partial withdrawal racing a suggestion over it gives a result that depends on decision order, and next gives the withdrawn value in both orders. A host that drops a document's records loses its Editing values with no error. The discussion button keeps a stale count after a decision that changes only `authored`, as on next. Suggested tasks t_a0284bee, t_f1233d76 and t_1ccd8173 hold them, in that order. owner: the owner. stop: each task lands or is dropped.
- Suggestions on both sides of an Editing edit wait on each other. Suggested task t_7314eae0 owns the question. owner: the owner. stop: t_7314eae0 lands or is dropped.
- The accepted line join that blocks decisions on the same block stays with suggested task t_a269db34. owner: the owner. stop: t_a269db34 lands or is dropped.
- The many-records reject line of step 7 is inconclusive, and its next probe counts landed-record reads before it times the line again on a quiet host. Suggested task t_541200bb runs it, and t_a7c7c429 owns core's rebuild of the records JSON on each record write. owner: the owner. stop: each task lands or is dropped.
- The recording law suite fails two laws, the same way on next. Suggested tasks t_cbe5346a and t_820a6175 own them. owner: the owner. stop: each task lands or is dropped.
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
