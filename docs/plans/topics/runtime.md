# Document runtime and views

Page: https://claude.ai/artifact/VVn5MNBokeZVoz39Deh4S6

The ledger asks which runtime and view lifetimes Plite needs. The 2026-10-04 audit stopped: one private document runtime with root-, document- and authored-bound views matches the lifetimes production code uses, the competing public React runtime is gone, and every deletion lane loses either shared-root identity or per-view interaction state. The [content-root execution](../2026-09-30-content-root-locations-execution.md) corrected view derivation over the canonical runtime, including immutable, read-only and authored binding, and validates a document once per compiled schema. `node tooling/scripts/review-ledger.mjs show runtime` prints the scope's history.

That work kept `Path` and `NodeEntry` relative to a root and made the view the root context, so a path given to the base editor addresses the main root and a path given to a view addresses that view's root. Keys are unique across one editor's roots and may target writes in any of them.

## Public API

A view scopes reads and writes to one named root of the same document.

```ts
// content/docs/plite/libraries/plite.mdx
const caption = createEditorView(preview, { root: 'caption:1' });

caption.read.children(); // the preview document's caption root
caption.read.view.isReadOnly(); // true
```

A plugin command runs in the root of the editor or view it was called on.

```ts
// packages/platejs/src/features/details/lib/BaseDetailsCodeConversion.spec.ts
const view = createEditorView(editor, { root: 'note' });

view.update.selection.set({ offset: 0, path: [0, 0, 0], root: 'note' });
view.plugin(BaseCodeBlockPlugin).update.toggle();
```

## Layer and owner

```text
application UI state                 document runtime
(panels, prompts, transient input)    (roots, fields, effects, schema, registry)
                                             ↑
                                     root-scoped view
                                     (focus, composition, read-only)
                                             ↑
                             command dispatch / atomic update
```

| Responsibility | Decision |
| --- | --- |
| Document owner | Plite, `packages/plitejs/src/core/editor-runtime.ts`: roots, document commits, registry and document state. |
| Views | `editor-runtime-view.ts` reuses the owner's registry and state, projects reads and writes to one root, and owns view-local focus, composition and read-only state; extension API factories receive the actual view. |
| Primary root | Implicit; public root validation rejects its internal name as a named root. |
| Independent editors | Separate documents, as the multiple-editors demo shows; shared blocks reuse content roots of one document. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| A public runtime object beside the editor | Another setup and identity contract with no caller work removed. |
| Deleting separate view identity | Loses independent interaction state or moves it into app adapters. |
| Roots as ordinary node metadata | Loses shared-root lifetime. |
| A global editor store, or one document per view | Loses document independence or shared roots. |

## Main changes

- The public React `Runtime` handle is gone ([react](react.md)); `createEditorView(editor, { document })` is the read-only view over one immutable document ([conversion-boundary](conversion-boundary.md)).
- `packages/plitejs/src/core/editor-runtime.ts` keeps one runtime per document in private weak maps, and `packages/plitejs/src/editor-runtime-view.ts` binds each view to it and wraps every view method in its root.
- `packages/plitejs/src/core/public-state.ts` resolves targets: a key or a rooted point, range or node selection routes to its root, while a bare path or a live node resolves in the caller's root.
- `packages/plitejs/src/core/tx-only.ts` holds the markers that say where a plugin update method's location arguments sit, which the review tree's command frame reads.
- Plate commands that may run on the base editor over a named root pass that root by hand through `packages/platejs/src/internal/utils/inRoot.ts`.

## What other editors do

The 2026-10-17 named-root review read the Lexical (`dd5c41b13`), ProseMirror (`prosemirror-view` `ca4c78e`, `prosemirror-website` footnote example), Slate (`945a484df`) and Tiptap (`91c51be53`) checkouts and ran none of them. Only Lexical keeps a second content tree as its own editor, and it runs a command in the editor it was dispatched on before its parents. The [editor comparison](editor-comparison.md) holds the other cross-editor reads.

| Editor | Where a second content tree lives | Which tree a command writes when the caret sits in the second tree |
| --- | --- | --- |
| ProseMirror | One document; a nested view such as the footnote example keeps its own state and maps each step into the outer document by offset | The view's own state; the footnote view offsets its steps by `getPos() + 1` before the outer view applies them |
| Lexical | A nested editor with `_parentEditor` set | The dispatching editor runs its listeners in its own update, then each parent in its own (`triggerCommandListeners`, `packages/lexical/src/LexicalUpdates.ts:878`) |
| Slate | One tree; no second root | Paths always address that tree |
| Tiptap | One ProseMirror document | Commands act on `editor.state` |
| Plite | Named roots of one document, each read and written through a view | The root of the editor or view the command was called on, except a key or rooted target, which routes to its own root |

## Open work

- The Stop rejects replacements; it certifies no projection, cache or mounted-view path at scale. owner: Benchmark. stop: a change to runtime machinery brings its matched scale probe.
