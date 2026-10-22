# Document runtime and views

Page: https://claude.ai/artifact/TBgmnQqQjBpGCdLdgYWwy1

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

An app's editor runs a DOM call in a mounted view of the root the call is about, so focusing it works once a view shows.

```ts
// content/docs/api/dom.mdx
import { createEditor } from "platejs/react";

const editor = createEditor();

// Once <EditorRoot editor={editor}> shows an EditorContent, this focuses the
// view that holds the caret, or the only view.
editor.api.dom.focus();
```

A root editor runs its DOM calls in its own `EditorRoot`'s view of that root.

```tsx
// content/docs/api/react-hooks.mdx
const note = useRootEditor("note");

return <button onClick={() => note.api.dom.focus()}>Edit note</button>;
```

To act on one of several views, an app holds that view's editor.

```tsx
// content/docs/api/dom.mdx
import { EditorContent, EditorRoot, useEditor } from "platejs/react";

function FocusThisView() {
  const view = useEditor();

  return <button onClick={() => view.api.dom.focus()}>Focus</button>;
}

<>
  <EditorRoot editor={editor}>
    <EditorContent />
    <FocusThisView />
  </EditorRoot>
  <EditorRoot editor={editor}>
    <EditorContent />
    <FocusThisView />
  </EditorRoot>
</>
```

A test that holds a root editor focuses its view through it.

```ts
// packages/plitejs/test/react/view-carets.test.tsx
const { a, b, registry } = renderTwoRoots();
// ...
b.api.dom.focus();
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
| Which view a DOM call reaches | Plite, `plitejs/dom`. `dom/plugin/dom-root-runtime.ts` keeps the index of mounted view editors by document and holds `resolveDOMReach`, the one rule that maps an editor handle and a call's target to the view editor the call runs on. `dom/plugin/dom-editor.ts` runs every `DOMEditor` method through it by the method's kind. It sits in the DOM layer because only that layer knows which Editables are mounted. |
| The root a document-editor call with no target runs in | Plite core. `core/public-state.ts` gains `getBaseCallRoot`, which `plugin-dispatch.ts` computed inline, so a command and a DOM call on the document's editor pick the same root. `core/view-carets.ts` gains `subscribeCaretOwner`, which fires when the caret owner's presentation or root changes. |
| Keyboard navigation's native clear | Plite, `plitejs/react` (`react/editable/content-root-navigation.ts`). The clear takes its tree and scheduler from the Editable that got the key, because mounted Editables share their view's focus and selection state. |
| Editable code that reads editor-wide DOM lookups | A `plate/editable-own-dom-tree` lint rule under `tooling/oxlint`, with a baseline, over `packages/plitejs/src/react/editable`. |

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
- `DOMEditor` is a forward table over the method bodies in `DOMEditorImpl`, typed `DOMEditorInterface`, so a method added without a forward fails typecheck. Each forward runs its method on the view editor that `resolveDOMReach` in `packages/plitejs/src/dom/plugin/dom-root-runtime.ts` returns for the method's kind, or that `resolveDOMTargetView` returns for a DOM node. `resolveRange` and `assertRange` run on the handle as passed. The `editor.api.dom` capability routes its own members by hand.
- A view that React's `Activity` hides, or whose last Editable unmounts, leaves the mounted views while the caret owner still names it, so the document's editor reaches no view of that root until it shows again or another view takes the caret.
- The document's editor's DOM scope hooks, `useEditorRootElement`, `useEditorEditableElement` and `useEditorScrollElement`, follow view mounts, focus, the caret owner and a commit that moves the selection to another root.
- `resolveDropTarget` with no target, for a block or files drop, and `drag.autoScroll`, hit-test the pointer in the document where the picked view last rendered an Editable, through shadow roots but not iframes, and the drop resolver hit-tests in the view's own page or shadow root.
- Keyboard navigation's native clear reads its tree from the key event's Editable, and `plate/editable-own-dom-tree` keeps editor-wide DOM lookups out of `packages/plitejs/src/react/editable`.

## What other editors do

The 2026-10-17 named-root review read the Lexical (`dd5c41b13`), ProseMirror (`prosemirror-view` `ca4c78e`, `prosemirror-website` footnote example), Slate (`945a484df`) and Tiptap (`91c51be53`) checkouts and ran none of them. Only Lexical keeps a second content tree as its own editor, and it runs a command in the editor it was dispatched on before its parents. The [editor comparison](editor-comparison.md) holds the other cross-editor reads.

| Editor | Where a second content tree lives | Which tree a command writes when the caret sits in the second tree |
| --- | --- | --- |
| ProseMirror | One document; a nested view such as the footnote example keeps its own state and maps each step into the outer document by offset | The view's own state; the footnote view offsets its steps by `getPos() + 1` before the outer view applies them |
| Lexical | A nested editor with `_parentEditor` set | The dispatching editor runs its listeners in its own update, then each parent in its own (`triggerCommandListeners`, `packages/lexical/src/LexicalUpdates.ts:878`) |
| Slate | One tree; no second root | Paths always address that tree |
| Tiptap | One ProseMirror document | Commands act on `editor.state` |
| Plite | Named roots of one document, each read and written through a view | The root of the editor or view the command was called on, except a key or rooted target, which routes to its own root |

The 2026-10-22 DOM view lookups review read the ProseMirror (`prosemirror-view` `ca4c78e`), CodeMirror (`codemirror-view` `fbff59b`), Lexical (`dd5c41b13`) and Slate (`945a484df`) checkouts and ran none of them. In each, the object that answers DOM calls is one view, and no document object with several mounted views answers them.

| Editor | Who answers focus and root lookups | Second view of the same content |
| --- | --- | --- |
| ProseMirror | `EditorView.focus()` and `view.root` (`prosemirror-view/src/index.ts:337`, `:348`); the app holds each view | A separate `EditorView`; the app calls the one it means |
| CodeMirror | `EditorView.focus()` and `view.root` (`codemirror-view/src/editorview.ts:856`, `:125`) | A separate `EditorView` with its own state |
| Lexical | `editor.focus()` and `editor.getRootElement()` (`lexical/packages/lexical/src/LexicalEditor.ts:1863`, `:1605`); one editor, one root element | A nested editor, which answers for itself |
| Slate | `DOMEditor.focus(editor)` (`slate/packages/slate-dom/src/plugin/dom-editor.ts:420`); one editor, one Editable | Not supported |
| Plite | Each mounted view's editor; the document's editor and a root editor run the call in the view they reach | A second `EditorRoot` gives the view its own editor |

## Open work

- The Stop rejects replacements; it certifies no projection, cache or mounted-view path at scale. owner: Benchmark. stop: a change to runtime machinery brings its matched scale probe.
- t_44e3acfa Make pointer lookups find the view under the pointer in iframes, shadow roots and nested editors. It holds the seven pointer cases the [DOM view lookups plan](../2026-10-22-runtime-dom-view-lookups.md) left open, and the capability routes of `textToCaret`, `resolveVisualPoint`, `resolveDropTarget` and `drag.autoScroll` on the document's editor, which no test checks. owner: the owner, from the suggested-task ledger. stop: started or dismissed.
- t_6c238731 Resolve a DOM target in its own mirror and keep the focus record after a canceled press. It also owns two limits of the DOM reach rule: `resolveRange` and `assertRange` run on the editor called, and a root editor's `resolveNode`, `resolvePoint` and `resolveRange` turn another same-root view's text into the shared model node. owner: the owner, from the suggested-task ledger. stop: started or dismissed.
- t_3fd19637 Find why Shift+ArrowDown out of a synced root collapses the selection, which the DOM view lookups run found on `/examples/plite/synced-blocks` and which predates it. owner: the owner, from the suggested-task ledger. stop: started or dismissed.
- t_aff1384b Show the www mention menu above the app shell with one item per row, which the DOM view lookups run found on `/examples/plite/mentions` and which predates it. owner: the owner, from the suggested-task ledger. stop: started or dismissed.
