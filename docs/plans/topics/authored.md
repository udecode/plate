# Authored changes and selective reversal

Page: https://claude.ai/artifact/LzfdwnVufGpA4S1r9qnDmv

Plite's native authored capability records who changed what, keeps pending suggestions reviewable, and decides them atomically. The ledger asks which native contract should retain authorship and reversible edits without requiring a particular review UI (`docs/research/review-scopes/authored.json`). Pending changes live in the editor's one stored document as review marks: inserted content carries an insert mark, and struck content stays in place under a delete mark (`packages/plitejs/src/authored/tree/record.ts`). Accepting or rejecting a change rewrites that document (`packages/plitejs/src/authored/tree/resolve.ts`), and the accepted and proposed previews are views of it that throw on a plain edit (`packages/plitejs/src/authored/tree/proposed.ts`). Some other writes still change the document through them, such as an update that makes a decision, and undo and redo; t_f485ac77 (owner zbeyens) decides which of them a preview refuses. Remote collaboration changes land whatever the view. The document's `records` hold the review facts marks cannot show (`packages/plitejs/src/authored/facts/records.ts`), and a ledger reads the marks into changes and cards, a card being one author's adjacent pending changes (`packages/plitejs/src/authored/ledger/cards.ts`). The review-tree pivot (`docs/plans/2026-10-13-review-tree-pivot.md`) replaced the earlier design, in which a second, projected document held pending changes and every write became an operation in a causal graph. Suggestions, AI review and copied review UI build on this capability; `docs/plans/topics/suggestions.md` covers the Plate side. `node tooling/scripts/review-ledger.mjs show authored` prints the scope's full history.

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

An app reads a page of pending changes in document order and decides the changes it read.

```tsx
// content/docs/(guides)/authored-changes.mdx
const page = authored.read.changes({ authorId: "alice", limit: 50 });
const result = authored.update.decide({
  action: "accept",
  changes: page.items,
});
```

Copied review UI reads the cards touching a top-level block, then decides a card together with the changes a `blocked` result named.

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

The undo repair of [Undo finds what each node was](../2026-10-18-undo-repair-nodes.md) puts its changes in these layers:

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| The split write | Plite | `plitejs/yjs` | The bridge decides how a commit reaches the Yjs document |
| Kept runs of a change | Plite | `plitejs` core change | It walks the change's private sections, beside the other mapping functions |
| Applying an insertion beside a deletion in place | Plite | `plitejs` core change | The localized apply decides which changes apply without a token rebuild |
| Which node a replayed node was, and its repair | Plite | `plitejs/authored` admission | Only admission sees the decisions made since the write together with the change |

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
  Review reads take a place. `read.groups({ at })` returns every card touching
  it, and `read.changes({ at })` pages the changes there in document order, so
  no read walks every pending change. A card is the adjacent pending changes of
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
  `api.subscribeChanges` hands each view one frozen delta per commit that
  changes the review.
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
  still reaches its body. A read of a root a pending deletion drops sees it
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

## Main changes

- `packages/plitejs/src/authored/tree/` turns each write into review marks on the stored document (`record.ts`, `record-completion.ts`), decides changes by rewriting that document (`resolve.ts`) and builds the previews (`proposed.ts`). `cuts.ts` reads the cut marks of pending splits and joins the fragments of a rejected one, and `layers.ts` decides pending property writes.
- `packages/plitejs/src/authored/facts/` owns the review records saved in the document's `records` and admits them when a document loads or a peer sends them (`records.ts`, `admission.ts`).
- `packages/plitejs/src/authored/ledger/` reads the marks into changes and cards and keeps them per top-level block, so a read or a change delta costs work in proportion to the edit, not the document (`ledger.ts`, `cards.ts`, `work.ts`).
- `packages/plitejs/src/core/root-ownership.ts` judges which content roots lose their last owner, counting an exclusive root's owners from the roots a change touched. The recorder, resolution, decisions, load admission and the review ledger drop the roots it names.
- `packages/plitejs/src/authored/authored.ts` is the plugin, with its views, its reads, `update.decide`, `api.subscribeChanges` and `api.subscribeRefusals`.
- The Yjs binding carries review marks as node properties in the shared tree, and review records in one shared map per record set that peers merge by id (`packages/plitejs/src/yjs/core/controller.ts`).
- `packages/platejs/src/authored/AuthoredPlugin.ts` stamps writes with the editor's `userId` and takes no options. `BaseSuggestionPlugin` maps Editing and Suggesting to view intents and writes the `data-editor-authored-*` attributes, and `useSuggestionGroups(blockKey)` reads the cards touching a block (`packages/platejs/src/react/features/suggestion/useSuggestion.ts`).

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
