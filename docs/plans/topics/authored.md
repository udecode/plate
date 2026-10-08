# Authored changes and selective reversal

Page: https://claude.ai/artifact/YXUw7v6yMGstbkq62brFsd

Plite's native authored capability records who changed what, keeps pending suggestions reviewable, and decides them atomically. The ledger asks which native contract should retain authorship and reversible edits without requiring a particular review UI (`docs/research/review-scopes/authored.json`). Today the editor's own document is the accepted content. A second full document, the projected one, holds accepted content plus pending changes, and each run of pending-deleted (struck) text is rebuilt as its own small read-only document that markup views paint beside the projected one (`packages/plitejs/src/authored/markup.ts`, `packages/plitejs/src/core/authored-fragment-view.ts`). Every write, accepted edits included, becomes an authored operation in a causal graph, and accept or reject replays operations onto the other document (`packages/plitejs/src/authored/decisions.ts`). The direct checkpoint (2026-09-12) loads that state without replay, and the 2026-10-04 audit kept the contract with a Stop. Suggestions, AI review and copied review UI build on it; `docs/plans/topics/suggestions.md` covers the Plate side. `node tooling/scripts/review-ledger.mjs show authored` prints the scope's full history.

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

A mounted view picks its input intent and which projection it shows.

```tsx
// content/docs/(plugins)/(collaboration)/suggestion.mdx
<EditorRoot
  editor={editor}
  authored={{ intent: 'propose', projection: 'markup' }}
>
```

Copied review UI decides a change, or resolves it when concurrent decisions conflict.

```tsx
// apps/www/src/registry/components/editor/discussion.tsx
const input = {
  action,
  selection: authored.read.select({ ids }),
};
const result =
  latest.status === 'conflicted'
    ? authored.update.resolve(input)
    : authored.update.decide(input);
```

An app that keeps closed edit bodies can revert one accepted contribution later.

```tsx
// apps/www/src/registry/examples/version-history-demo.tsx
const result = editor.update.authored.revert({
  selection: editor.read.authored.select({ ids: [change.id] }),
});
```

Exports pick a projection explicitly.

```tsx
// content/docs/(guides)/authored-changes.mdx
const markdown = editor.api.markdown.serialize({ projection: "proposed" });
```

## Main changes

- `packages/plitejs/src/authored/` owns change identity, the operation log, both position indexes, decisions, retained content and the codec. `authored.ts` holds the transaction finish that captures every write and the fragment edit path; `decisions.ts` replays decisions; `markup.ts` compiles struck fragments.
- `packages/plitejs/src/core/authored-runtime.ts` and `authored-fragment-view.ts` give React one read-only view editor per struck run.
- `packages/plitejs/src/react/editable/` routes caret, selection, typing, paste, IME and deletes in struck text through view selections and fragment-aware command paths.
- With authored installed, the Yjs binding writes no shared XML tree; authored operations and checkpoints travel as shared effect log entries (`packages/plitejs/src/yjs/core/controller.ts`, `shared-effect-log.ts`).
- `packages/platejs/src/authored/AuthoredPlugin.ts` stamps writes with the editor's `userId`; `BaseSuggestionPlugin` maps Editing and Suggesting to view intents and paints changes.

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
