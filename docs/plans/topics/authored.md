# Authored changes and selective reversal

Page: https://claude.ai/artifact/9cWhXkwmQrpyrwSVkbZkcM

Plite's native authored capability records who changed what, keeps pending suggestions reviewable, and decides them atomically. The ledger asks which native contract should retain authorship and reversible edits without requiring a particular review UI (`docs/research/review-scopes/authored.json`). Pending changes live in the editor's one stored document as review marks: inserted content carries an insert mark, and struck content stays in place under a delete mark (`packages/plitejs/src/authored/tree/record.ts`). Accepting or rejecting a change rewrites that document (`packages/plitejs/src/authored/tree/resolve.ts`), and the accepted and proposed previews are read-only views of it (`packages/plitejs/src/authored/tree/proposed.ts`). The document's `records` hold the review facts marks cannot show (`packages/plitejs/src/authored/facts/records.ts`), and a ledger reads the marks into changes and cards, a card being one author's adjacent pending changes (`packages/plitejs/src/authored/ledger/cards.ts`). The review-tree pivot (`docs/plans/2026-10-13-review-tree-pivot.md`) replaced the earlier design, in which a second, projected document held pending changes and every write became an operation in a causal graph. Suggestions, AI review and copied review UI build on this capability; `docs/plans/topics/suggestions.md` covers the Plate side. `node tooling/scripts/review-ledger.mjs show authored` prints the scope's full history.

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

A preview shows every pending change accepted, or every one rejected, and takes no writes.

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

Exports pick a projection explicitly.

```tsx
// content/docs/(guides)/authored-changes.mdx
const markdown = editor.api.markdown.serialize({ projection: "proposed" });
```

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
  (`accepted`) and takes no writes. View state never becomes another saved
  document or a global mode. Suggesting records each write under its author,
  and a write inside another pending change depends on that change's context, so
  rejecting the outer change removes it too. Editing records the same way and
  accepts the writer's own claims in the same commit. It leaves every other
  author's claims pending, so text it writes inside another author's pending
  insertion joins that insertion. A decision removes the decided claims and
  appends a verdict for each incarnation it decides in one transaction.
  Admission settles any claim that a peer's late edit brings in after the
  verdict.
  Undo is local inverse history. It restores document facts, decisions
  included, and proposes nothing.
  On the review tree, commands and plugin update methods decide on the
  proposed projection, the document with every pending change accepted, and
  the recorder lifts their result back into authored changes. A command or method whose input holds a stored location declares
  where each location lands in that document, that it holds none, or that it
  only moves the selection. An undeclared one throws on the review tree. Point
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
- `packages/plitejs/src/authored/authored.ts` is the plugin, with its views, its reads, `update.decide`, `api.subscribeChanges` and `api.subscribeRefusals`.
- The Yjs binding carries review marks as node properties in the shared tree, and review records in one shared map per record set that peers merge by id (`packages/plitejs/src/yjs/core/controller.ts`).
- `packages/platejs/src/authored/AuthoredPlugin.ts` stamps writes with the editor's `userId` and takes no options. `BaseSuggestionPlugin` maps Editing and Suggesting to view intents and writes the `data-editor-authored-*` attributes, and `useSuggestionGroups(blockKey)` reads the cards touching a block (`packages/platejs/src/react/features/suggestion/useSuggestion.ts`).

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
