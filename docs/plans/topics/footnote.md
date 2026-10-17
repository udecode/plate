# Footnotes

Page: https://claude.ai/artifact/33TdvAEdhCbAbnG1YC5ZaN

A footnote is two nodes that share a stored `ref`: an inline void `footnoteReference` in the text and a root-level `footnoteDefinition` block that holds the note. `platejs/footnote` ships `BaseFootnotePlugin` and `BaseFootnoteDefinitionPlugin`. The reference plugin owns the reads, built once per document revision, ref allocation, insertion, duplicate renumbering and the two selection moves. The definition plugin owns the block, its Markdown mapping and a transfer veto that keeps moved definitions at the root. `platejs/footnote/react` adds `focusDefinition` and `focusReference`, which select, focus, scroll and flash the target in an editable view and return `false` in a read-only one. The copied `footnote` registry item adds the reference chip with a hover preview, the definition's back link, the duplicate warning and the `[^` picker, and `footnote-static` draws `[ref]` with no link. Markdown round-trips through `remark-gfm`; neither plugin has an HTML mapping. The ledger asks how references and content keep their identity and navigation. The 2026-10-04 audit said Pursue, and no plan adopted it. `node tooling/scripts/review-ledger.mjs show footnote` prints the history.

## Public API

Insert a reference at the caret. It creates the matching definition at the end of the document; `focusDefinition: false` keeps the caret in the text.

```tsx
// content/docs/(plugins)/(elements)/footnote.mdx
editor.update((tx) => tx.footnote.insert({ focusDefinition: false }));
```

Create the missing definition of an unresolved reference.

```tsx
// content/docs/(plugins)/(elements)/footnote.mdx
editor.update((tx) => tx.footnote.createDefinition({ ref: '3' }));
```

Jump between a reference and its definition from the mounted view `useEditor()` returns.

```tsx
// content/docs/(plugins)/(elements)/footnote.mdx
editor.api.footnote.focusDefinition({ ref: '3' });
editor.api.footnote.focusReference({ ref: '3', index: 1 });
```

Renumber a later duplicate definition.

```tsx
// content/docs/(plugins)/(elements)/footnote.mdx
editor.update((tx) =>
  tx.footnote.normalizeDuplicateDefinition({
    path: duplicatePath,
  })
);
```

The copied definition renderer asks the reads whether a definition is a later duplicate and lists its references.

```tsx
// apps/www/src/registry/components/editor/footnote.tsx
const isDuplicateDefinition =
  !!path && !!footnoteApi.isDuplicateDefinition?.({ path });
const referenceItems =
  !isDuplicateDefinition && ref
    ? footnoteApi.references({ ref }).map((entry, index) => ({
        index,
        label: getReferenceContextLabel(editor, entry[1], index),
      }))
    : [];
```

## Main changes

- One registry per document revision answers every read. `read` memoizes the definitions and references by ref against `state.children()`, so a render that asks many questions walks the document once.
- The first definition of a ref is canonical. Later duplicates stay in the document, are flagged by `isDuplicateDefinition` and renumber only on `normalizeDuplicateDefinition`, so pasted content never loses a note.
- A `transferVeto` contribution keeps a definition at the root during a transfer: a move or drop that would land one inside another block, or inside a side wrap, is refused. Paste lands through `replaceSlice`, which runs no transfer veto, so a definition pasted with the caret in a table cell or a quote lands inside it.
- `insert`, `createDefinition` and `normalizeDuplicateDefinition` declare where they edit through `txLocate`, and `selectDefinition` and `selectReference` through `txSelection`, so a selection move never changes content.
- The React adapter runs its jumps in the calling view: it commits the selection, focuses, scrolls and then flashes through `NavigationFeedbackPlugin`. Plite refuses any update from a read-only view, so the adapter returns `false` there before it tries.

## What other editors do

Read from source, not run: Milkdown `6a4db480b0`, Lexical `dd5c41b131`, ProseMirror website `a16b4ece45`, CKEditor 5 `14e73cc31b`, Tiptap `91c51be53c`, BlockNote `1e26f1c5e1`, Slate `945a484df2` and micromark `6577c20015` for GitHub's rendered footnote HTML. Only Milkdown and a Lexical example keep a reference and a separate definition linked by a label, as Plate does. No editor read here writes linked footnote HTML on export or reads GitHub's footnote HTML on paste.

| Editor | Model and link key | Jump in an editable view | Jump in a read-only or rendered view | HTML export | HTML paste |
| --- | --- | --- | --- | --- | --- |
| Milkdown | Inline atom and a separate `block+` definition, linked by `label` (`zbeyens/milkdown@6a4db480b00db8dd0322b517117dfa2154f3e2e2:packages/plugins/preset-gfm/src/node/footnote/definition.ts:10`) | None | None | `<sup data-type="footnote_reference">` and `<dl><dt><dd>`, no `id` or `href` (`reference.ts:33`, `definition.ts:35`) | Only its own markup, not GitHub's (`reference.ts:21`, `definition.ts:22`) |
| Lexical (dev example, not a package) | Inline node and definitions in a root slot, linked by the lowercased label (`dev-examples/mdast-editor/src/extensions/MdastFootnoteExtension.ts:362`, `:452`) | Native `#fn-a` anchors, then a caret move and focus (`:151`, `:203`) | Same path; a browser test expects the jump after `setEditable(false)` (`src/__tests__/browser/MdastEditorChrome.test.ts:449`) | `sup[data-footnote-ref]` and `div[data-footnote-def]`; the live anchors are not exported (`:427`, `:550`) | Only its own markup; GitHub's `data-footnote-ref` sits on a different element (`:908`) |
| ProseMirror (website example) | The note's text lives inside the inline node; no key (`example/footnote/index.js:5`) | Selecting the node opens a nested editor (`:63`) | No separate path | `<footnote>text</footnote>` | Only `<footnote>` |
| CKEditor 5 | The footnote feature's source is not in the open checkout; Word paste normalizes to `sup > a` and `ol > li` with ids (`ckeditor/ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da:packages/ckeditor5-paste-from-office/src/filters/replacemsfootnotes.ts:57`) | Not readable | Not readable | Not readable | Word only, not GitHub |
| Tiptap, BlockNote, Slate | No footnote support found by `git grep -i footnote` | None | None | None | None |
| GitHub (micromark readme) | Rendered GFM: `<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref>`, then `section[data-footnotes] > ol > li#user-content-fn-1` with a `data-footnote-backref` link (`readme.md:1084`) | Not an editor | Native anchors | The shape a reader's paste brings | Not an editor |
