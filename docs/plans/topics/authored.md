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

## Main changes

- `packages/plitejs/src/authored/tree/` turns each write into review marks on the stored document (`record.ts`, `record-completion.ts`), decides changes by rewriting that document (`resolve.ts`) and builds the previews (`proposed.ts`). `cuts.ts` reads the cut marks of pending splits and joins the fragments of a rejected one, and `layers.ts` decides pending property writes. The resolver lands a join whose target holds no live content in the target's place, with the target's followers after it, and reports the nodes it lands out of stored order. Projections leave out the `held` member, which only the resolutions written back to storage keep. The recorder splits a frame step that crosses a break, a place where the view shows two stored pieces side by side, into sub-steps that each map in stored order. It refuses a crossing it cannot split, a block merge whose right line holds or ends at a break, a block inserted beside a moved line and a removal mapped backward, and stores nothing for them (`docs/plans/2026-10-17-command-law-moved-content.md`).
- `packages/plitejs/src/authored/facts/` owns the review records saved in the document's `records` and admits them when a document loads or a peer sends them (`records.ts`, `admission.ts`).
- `packages/plitejs/src/authored/ledger/` reads the marks into changes and cards and keeps them per top-level block, so a read or a change delta costs work in proportion to the edit, not the document (`ledger.ts`, `cards.ts`, `work.ts`). A run whose blocks store a line moved between a join's halves before the joined line maps positions through a run order read from the resolver's landing, and the frame map reports its breaks (`order.ts`).
- `packages/plitejs/src/authored/authored.ts` is the plugin, with its views, its reads, `update.decide`, `api.subscribeChanges` and `api.subscribeRefusals`. A refusal reaches an Editing write too, as `unrepresentable`, and the suggestion kit's toast asks that writer to accept or reject the pending suggestion first.
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

## Open work

- Where Enter, block merges and an inserted block land among a pending join's moved lines, which the recorder refuses today, and where accepting puts a moved line that the joins after it merge into, which it drops as before. owner: zbeyens; stop: t_bdec706b lands or is dropped; tracked: the suggested-task ledger.
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
