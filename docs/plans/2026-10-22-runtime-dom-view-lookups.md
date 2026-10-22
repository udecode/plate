---
review_scopes: [runtime]
verdict: pursue
review_basis: [2026-10-21-view-selection-import]
work_kind: implementation
review_commit: d25c19a0ba52ae6411497209cf561e93de86bd0b
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plite.md, docs/plans/topics/dom-lookup-names.md, docs/plans/topics/correct.md, docs/plans/2026-10-20-dom-lookup-names.md, docs/plans/2026-10-20-runtime-view-state.md, docs/plans/2026-10-06-root-editor-readonly-bypass.md, packages/plitejs/src/dom/plugin/dom-root-runtime.ts, packages/plitejs/src/dom/plugin/dom-editor.ts, packages/plitejs/src/dom/utils/weak-maps.ts, packages/plitejs/src/react/components/plite.tsx, packages/plitejs/src/react/hooks/use-plite-runtime.tsx, packages/plitejs/src/react/hooks/use-runtime-focus-state.ts, packages/plitejs/src/react/editable/content-root-navigation.ts, packages/plitejs/src/react/editable/editable-dom-runtime.ts, packages/plitejs/src/core/view-carets.ts, packages/plitejs/src/editor-runtime-view.ts, packages/plitejs/test/react/view-carets.test.tsx, packages/plitejs/test/react/external-text-contract.test.tsx, packages/plitejs/test/react/use-plite-history.test.tsx, packages/platejs/src/react/internal/plate-context.tsx, packages/platejs/src/react/stores/plate/useEditor.ts, packages/platejs/src/react/stores/plate-controller/document-focus.internal.ts, content/docs/api/dom.mdx, content/docs/api/react-hooks.mdx, content/docs/(guides)/roots.mdx, content/docs/plite/libraries/plite-react/react-editor.mdx, apps/www/src/registry/examples/controlled-demo.tsx, 'apps/www/src/app/(app)/examples/plite/_examples/mentions.tsx', 'apps/www/src/app/(app)/examples/plite/_examples/iframe.tsx', 'apps/www/src/app/(app)/examples/plite/_examples/tables.tsx', 'apps/www/src/app/(app)/examples/plite/_examples/yjs-collaboration.tsx', packages/platejs/src/react/internal/createPlateTargetScope.ts, packages/platejs/src/react/components/Plate.tsx, packages/platejs/src/lib/plugins/dom/DOMPlugin.ts]
review_upstreams: ['../codemirror-view@fbff59ba004d80d8c914f64c42586387b08706ac', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534', '../slate@945a484df2497e4c448b33f417b0de2a49840032']
---

# Which view an editor's DOM calls reach

Status: building: Phase 1 landed in 7f2eacb6eb and Phase 2 lands next; Phase 3 follows
Playbook: plan

Every `DOMEditor` call runs on the editor its handle reaches, by one rule. A view's editor reaches itself, and answers `null` for a lookup about a root it does not show. A `useRootEditor` editor reaches the mounted view of its own `EditorRoot` and root, and no other. The document's editor reaches a view that shows the root the call is about, which is its target's root, else the caret's root, else main. Among the views of that root it takes the one that placed the caret last, and nothing while React hides that view. With no caret there, it takes the only view, else the focused one, else nothing. A lookup about a root no view shows answers `null`. A call with a DOM target reaches the view that owns the target when that view belongs to the handle. Today, once `EditorRoot` mounts a view, `editor.api.dom.focus()` on the editor `createEditor` returns focuses nothing, and the same holds for a `useRootEditor` editor (probes A and B). The DOM API page teaches that call, the controlled-value demo's buttons leave focus on the button, and the Plite mentions popup never moves on screen, all in a real browser. The rule picks the root the way core already routes the document editor's commands (`docs/vision/plite.md:840-843`) and reads core's caret owner (`packages/plitejs/src/core/view-carets.ts:906`) to pick a view, so it adds no public name and no new state of record. This plan continues the Pursue verdict below; architect's arena picked the target and the panel reviews this plan before the build.

## Brief

### What will change?

Screen calls like focus on your app's editor will run in a view showing the root they target, else the caret's root, picking the view where the caret was last placed. The docs example, demo buttons and mention popup work.

### What could go wrong?

Your app's editor does nothing when no view shows the caret's root, the caret's view is hidden or lost its editing area, or several views show that root with neither focus nor caret.

## Teach

A Plite editor holds one document. Each mounted editor root shows a view of it, with its own editor. Code inside a view gets that view's editor. App code usually holds the document's editor, and a toolbar may hold a root editor.

Today a screen call, like focus, looks for a screen only under the editor it was called on. Only a view's own editor has one. So the same call on the document's editor, or on a toolbar's root editor, does nothing.

After this change, each screen call finds a view, then runs there. A view's editor finds itself, and a toolbar's root editor finds the view it was made in. The document's editor finds a view showing the root of the point or node passed, or else the caret's root, preferring the view where the caret was placed last. If no view fits, the call still does nothing. To act on one chosen view, hold that view's editor.

## Public API

The DOM API page teaches focusing the editor `createEditor` returns. The code stays. Today the call does nothing once `EditorRoot` mounts a view; after the change it focuses the view that placed the caret last, or the only view.

```ts before
// content/docs/api/dom.mdx
import { createEditor } from "platejs/react";

const editor = createEditor();

editor.api.dom.focus();
```

```ts after
// content/docs/api/dom.mdx
import { createEditor } from "platejs/react";

const editor = createEditor();

// Once <EditorRoot editor={editor}> mounts, this focuses the view that
// placed the caret last, or the only view.
editor.api.dom.focus();
```

The hooks page gains an example of a root editor focusing its own view, which it cannot do today.

```tsx before
// content/docs/api/react-hooks.mdx
```

```tsx after
// content/docs/api/react-hooks.mdx
const note = useRootEditor("note");

note.update((tx) => tx.text.insert("!"));
note.api.dom.focus();
```

The DOM API page also shows how an app picks one view out of several. A view's own editor already works today (probe A), so this example is new to the docs, not new behavior.

```tsx before
// content/docs/api/dom.mdx
```

```tsx after
// content/docs/api/dom.mdx
function FocusThisView() {
  const view = useEditorContext();

  return <button onClick={() => view.api.dom.focus()}>Focus</button>;
}

<EditorRoot editor={editor}>
  <Editable />
  <FocusThisView />
</EditorRoot>
<EditorRoot editor={editor}>
  <Editable />
  <FocusThisView />
</EditorRoot>
```

The caret tests hold one root editor per view but reach into the mounted Editable to focus it, because focus on the held editor does nothing. They call the held editor instead. Tests that hold no root editor, such as "a main view's focus inside a note view's update gives that view the caret in main" (`view-carets.test.tsx:605`), keep `mountedView`, because nothing public returns a view's editor from outside that view.

```ts before
// packages/plitejs/test/react/view-carets.test.tsx
const { a, b, registry } = renderTwoRoots();
// ...
mountedView('B editor').api.dom.focus();
```

```ts after
// packages/plitejs/test/react/view-carets.test.tsx
const { a, b, registry } = renderTwoRoots();
// ...
b.api.dom.focus();
```

An app still names one view by holding that view's editor, which `useEditorContext()` in Plite and `useEditor()` in Plate return inside it. No call gains a view or root option.

## What other editors do

Read from the four checkouts in `review_upstreams`, as source, with nothing run. In each of them, the object that answers DOM calls is one view, and no document object with several mounted views answers them.

| Editor | Who answers focus and root lookups | Second view of the same content |
| --- | --- | --- |
| ProseMirror | `EditorView.focus()` and `view.root` (`prosemirror-view/src/index.ts:337`, `:348`); the app holds each view | A separate `EditorView`; the app calls the one it means |
| CodeMirror | `EditorView.focus()` and `view.root` (`codemirror-view/src/editorview.ts:856`, `:125`) | A separate `EditorView` with its own state |
| Lexical | `editor.focus()` and `editor.getRootElement()` (`lexical/packages/lexical/src/LexicalEditor.ts:1863`, `:1605`); one editor, one root element | A nested editor, which answers for itself |
| Slate | `DOMEditor.focus(editor)` (`slate/packages/slate-dom/src/plugin/dom-editor.ts:420`); one editor, one Editable | Not supported |
| Plite today | Each mounted view's editor; the document's editor and unmounted views answer nothing | A second `EditorRoot` gives the view its own editor |
| Plite after | Each mounted view's editor; the document's editor and a root editor run the call on the view they reach | Unchanged |

## Layer and owner

| Delta | Responsibility | Decision |
| --- | --- | --- |
| added | Which view a DOM call reaches | Plite, `plitejs/dom`. `dom/plugin/dom-root-runtime.ts` keeps the index of mounted view editors by document and holds `resolveDOMReach`, the one rule that maps an editor handle and a call's target to the view editor the call runs on. `dom/plugin/dom-editor.ts` runs every `DOMEditor` method through it by the method's kind. It sits in the DOM layer because only that layer knows which Editables are mounted. |
| added | The root a document-editor call with no target runs in | Plite core. `core/public-state.ts` gains `getBaseCallRoot`, which `plugin-dispatch.ts` computed inline, so a command and a DOM call on the document's editor pick the same root. `core/view-carets.ts` gains `subscribeCaretOwner`, which fires when the caret owner's presentation or root changes. |
| added | Keyboard navigation's native clear | Plite, `plitejs/react` (`react/editable/content-root-navigation.ts`). The clear takes its tree and scheduler from the Editable that got the key, because mounted Editables share their view's focus and selection state. |
| added | Editable code that reads editor-wide DOM lookups | A `plate/editable-own-dom-tree` lint rule under `tooling/oxlint`, with a baseline, over `packages/plitejs/src/react/editable`. |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| `focus()` on the document's editor with one view mounted | Focuses that view's Editable, where it did nothing | jsdom case (a); browser re-drive of `/docs/controlled` in Chromium |
| `focus()` on the document's editor with three views of main, after a caret was placed in the third and then the second | Focuses the second view | jsdom case (b) |
| `focus()` on the document's editor after a caret was placed in a root no mounted view shows | Unchanged: focuses nothing | jsdom control, which the plan's first rule fails by focusing the only view |
| A point or a live node of `note` passed to the document's editor | Resolves in the view that shows `note`, where it resolved nothing | jsdom cases for a point and a live node |
| A point of `note` passed to the document's editor while only main is mounted, at a path main also has | Answers `null`, and `assertDOMPoint` throws; the reviewed draft resolved main's text | jsdom case |
| A point or range of `note` passed to main's view editor | Answers `null`, and `assertDOMPoint` throws; the round-3 draft resolved main's text at the same path | jsdom cases, with a control that the `note` view's editor still resolves a point naming `note` |
| Another editor's text passed to the document's editor | Answers `null`; the round-3 draft resolved it in that editor's view | jsdom case |
| A DOM range passed to the document's editor or a root editor | Unchanged from base. It runs on that editor, so a range in the `note` view comes back as a main range at the same path. Diff review round 3 undid the pick of a view from the range's ends, and t_6c238731 owns the fix | The four round-3 seat cases, which answer as at base after the revert (log row "panel") |
| A DOM point in the `note` view, passed to the document's editor | Answers with `root: 'note'`, so it maps back to the same text | jsdom round-trip case |
| A DOM node of a view, passed to the document's editor and to another view's root editor | The document's editor answers for that view; the root editor still answers `false` | jsdom case and control; the control fails under a mutant that checks the node before the handle's own view |
| Another view's text, passed to a root editor's `resolveNode` or `resolvePoint` | Unchanged, as at base. It answers the shared model node or point, while `hasDOMNode` answers `false`. This stays open, and t_6c238731 owns it | The seat's probe at base and on the built rule |
| `focus()` on a `useRootEditor` editor inside an `EditorRoot` | Focuses that root's Editable in its own view | The caret tests that swap `mountedView(...)` for the held editor; each fails at base |
| `resolveRangeRect` on the document's editor | Returns the caret's box in its view, so the mentions popup moves beside the caret | Browser re-drive of `/examples/plite/mentions` in Chromium |
| `deselect()` on the document's editor | Clears the editor's selection as today, and also the native selection in the reached view's document, under a read-only view too | jsdom case under `<EditorRoot readOnly>`; browser re-drive of `/examples/plite/iframe` in Chromium |
| `scroll()` on the document's editor with a scroll container registered on it, as an app may, and as Plate's `PlateContainer` does before its inner view mounts | Unchanged. It returns that container | jsdom control, which the plan's first rule fails |
| `focus()` on the document's editor while React's `Activity` hides the caret's view | Does nothing; the reviewed draft moved focus to another view of the root | jsdom case |
| `focus()` on the document's editor after the caret's Editable unmounts while its `EditorRoot` stays | Does nothing until another view takes the caret | jsdom case, which a mutant that falls back to another view fails |
| Three views of main, the caret owner cleared by a value replace while the second holds focus | The document's editor and its element hook reach the focused view | jsdom case, which fails under a mutant that drops the focus fallback |
| A view inside a closed shadow root holds focus beside a view on the page, with no caret owner | The document's editor reaches the shadow root's view | jsdom case, which fails under a mutant that reads only the page's focused element, and on the reviewed Phase 2 draft, whose focus chain entered only open shadow roots |
| `useEditorEditableElement(editor)` after a write moves the selection into `note` with no caret owner | Follows it to the `note` view | jsdom case |
| `hasRange` on the document's editor with a range of `note` | Reads `note` | jsdom case |
| A drag started from a read-only root editor, and `drag.indicate(null)` on the document's editor | Copy only, with the selection left alone; the clear reaches the view that painted the indicator | jsdom cases |
| `drag.indicate` on a read-only root editor | Paints nothing; the round-3 draft painted an indicator in the view it reached | jsdom case |
| Two views, no caret placed, none focused | Unchanged: nothing answers | jsdom control (d), which a mutant that picks the first view fails |
| Two Editables in one view, calls about the whole view | Unchanged: the focused Editable, else the only one | Existing shadow-DOM and focus-lifecycle tests |
| A block drop over view A's text, passed to view B's root editor | Answers `null`, as at base; the built diff returned a block edge in B's view | jsdom case, which fails on the built diff and passes at base |
| DOM calls on an editor that the DOM bridge wires to an element without an `EditorRoot` view | Unchanged: it answers for itself, and a node lookup builds no lookup index | The bun `test/dom` suite, whose seven bridge cases failed on the built diff |
| `resolveDropTarget` with coordinates and no target, and `drag.autoScroll`, on the document's editor | Resolve in the view under the pointer, found in the window of the view a whole-view call reaches and through the shadow roots above views, else in that view. The drop resolver hit-tests in that view's own page or shadow root, because a page hit test stops at a shadow host. With no view reached, they answer as at base. A block drag with a DOM target over a view in a shadow root now takes the probe's hit in that tree, where it used to fall back to the search. The Editable's repaint during auto-scroll now resolves a target there, where it used to clear the indicator (inferred from the code, diff panel Phase 2 round 2) | Managed browser test of a block drop over the `note` view, which sits in a closed shadow root, with the caret in another view. It fails on Phase 1's pick, and in all three engines on the reviewed Phase 2 draft, whose resolver hit-tested the page. No case drives `drag.autoScroll`, or a block drag and its repaint over a view in a shadow root |
| A view in a same-origin iframe or a shadow root inside another view's Editable holds focus, with no caret owner | Reaches that inner view. Phase 1 answered nothing, because the page and the inner tree named different views | jsdom case for the shadow root and a managed browser test for the iframe, each failing on Phase 1's pick |
| Shift+arrow across content roots in a view inside an open shadow root | Unchanged on screen. Chromium, Firefox and WebKit clear the shadow tree's selection along with the page's, so the old clear already left no native range showing (measured). The clear now runs in, and records its write on, the tree of the Editable that got the key, as Defaults "nav tree" of the view-selection-import plan asked. Only the shadow tree's own Editable reads that record. A second view of the same editor on the page reads the page document's record, which the clear no longer writes. With that view mounted, the native selections, highlights, model selections and typed text matched base in all three engines (measured). The cleared tree differs only when one view's Editables sit in two documents | None in the browser. Managed tests of both presses, with that view alone and with a second view on the page, passed at base in all three engines, so the Tests rule cut them and their pages. `plate/editable-own-dom-tree` flags the old read on the historical file |
| Undo, IME, clipboard and selection import | Unchanged; they run on a view's own editor, which reaches itself | The plitejs React suite and the platejs suite |

## Main changes

- `DOMEditor` becomes a forward table over the method bodies, renamed `DOMEditorImpl`. The table is typed `DOMEditorInterface`, so a method added without a forward fails typecheck. Each forward runs its method on the editor that `resolveDOMReach` returns for the method's kind. The `editor.api.dom` capability routes its own members by hand, and no type checks those routes. Case (f) calls on the document's editor the five members whose answers jsdom can paint. `textToCaret`, `resolveVisualPoint`, `resolveDropTarget` and `drag.autoScroll` answer `null` under jsdom on every handle, so no test checks their routes.

| Kind | Runs on | Methods |
| --- | --- | --- |
| view | The view the handle reaches with no target | `androidPendingDiffs`, `androidScheduleFlush`, `blur`, `focus`, `editable` with no `root` argument, `resolveDocumentOrShadowRoot`, `assertDocumentOrShadowRoot`, `getWindow`, `isComposing`, `isFocused`, `isReadOnly`, `root`, `clipboard.writeSelection`, and the capability's `drag.autoScroll`, which reads `root` |
| target root | A view that shows its target's root, read from a key or live node by `getNodeTargetRoot` when the handle has no mounted root, and from a point, range or path by `getPublicExplicitLocationRoot`, which gives the handle's own root for a bare one; with no such view the call answers `null`, and its `assert*` twin throws | `editable` with a `root` argument; `resolveDOMNode` and `assertDOMNode`, which on the handle itself resolve the reached view's Editable; `resolveDOMPoint`, `assertDOMPoint`, `resolveDOMRange`, `assertDOMRange` and `resolveRangeRect`; the DOM capability's painted point and range, `textToCaret`, `resolveVisualPoint`, `drag.start` and `drag.indicate` |
| DOM target | The view whose Editable owns the DOM node passed; a point or range answer carries that view's root when it differs from the handle's | `hasDOMNode`, `hasEditableTarget`, `hasSelectableTarget`, `hasTarget`, `isTargetInsideNonReadonlyVoid`, `resolveNode`, `assertNode`, `resolvePoint`, `assertPoint`, `resolveEventRange`, `assertEventRange`, and the capability's `resolveDropTarget` |
| scroll | The scroll element registered on the handle itself, else the reached view's | `scroll` |
| model | The handle as passed, while the DOM calls inside the method reach a view | `findKey`, `assertPath`, `resolvePath`, `hasRange`, which reads each point's own root, `deselect`, `scrollIntoView`, `clipboard.insertData`, `clipboard.insertFragmentData`, `clipboard.insertTextData`, and the capability's `clipboard.readSlice` and `clipboard.writeSlice`, whose window read falls back to the global window as today |
| handle | The handle as passed, point lookups included, as at base | `resolveRange` and `assertRange` |

The capability's `visibleRect` reads only the element it gets, so it has no kind.

- `resolveDOMReach(handle, request)` decides in order. A handle with a mounted DOM root runs as itself for a call about its own root, which costs one weak-map read and a root comparison, and answers `null` for a call about another root. A view handle that owns a presentation, which a `useRootEditor` editor shares with its `EditorRoot` (probe F), reaches only the mounted view at its own presentation and root, and nothing for a target in another root. Its `has*` checks refuse a DOM node of another view. Its `resolveNode`, `resolvePoint` and `resolveRange` still turn another same-root view's text into the shared model node, as at base, while its `resolveEventRange` answers `null` for an event over another view. Panel round 2 left that open, and t_6c238731 owns it. Only the document's editor reaches further. It takes the call's root, which is the target's root, else `getBaseCallRoot`, the caret's root, else main. When the caret owner sits at that root, it takes the owner's view and no other. Otherwise it takes the only view of that root, else the view whose Editable holds focus. To find that view it follows the focus chain from each top document that holds one of the document's Editables, down through iframes and shadow roots, open or closed, that hold focus, and takes the nearest view of that root above the focused element, across shadow hosts and frames. When two top documents name different views, it takes none. When the rule reaches no view, a view call runs on the handle and answers as today, and a target-root call answers `null`. An editor whose document has no mounted view, such as one the DOM bridge wires to an element directly, runs a target-root call on itself, as at base, and never reads the target's root.
- `resolveDOMTargetView(handle, node)` picks the view for a call with a DOM node. A handle with a mounted DOM root runs as itself. Otherwise it takes the view whose Editable owns the node, when that view belongs to the handle. For the document's editor that is any mounted view of its document, and for a root editor only its own view. Otherwise the call runs on the handle and answers as at base. `resolveEventRange` answers `null` for a target inside an editor's content that the handle does not reach. `resolveRange` runs on the handle, as at base. Diff review round 3 found that both of this run's ways to pick a view from a range's two ends let another editor's text through or refused a valid range.
- A view that `Activity` hides leaves the mounted views, because hiding runs its Editable's layout cleanup, while the caret owner still names it. The same holds when the view's last Editable unmounts while its `EditorRoot` stays. The document's editor then reaches nothing at that root until the view shows again or another view takes the caret. Picking another view of the root instead would send DOM calls away from the caret that the next command edits.
- `DOMRootRuntime` registration adds its view editor to the index of mounted views by document, records the page or shadow root its Editable sits in, removes both on unregister, and notifies the document's DOM scope listeners. It also records each shadow root above the view in a weak map keyed by its host, because a closed shadow root is reachable only from inside it. Focus events never write the index.
- Core gains `getBaseCallRoot(editor)` in `core/public-state.ts`, which `plugin-dispatch.ts` computed inline, and `subscribeCaretOwner(editor, listener)` in `core/view-carets.ts`, which fires when the caret owner's presentation or root changes. `getBaseCallRoot` reads the selection without cloning it, because the reach rule calls it on every call of the document's editor. Finding a key's or node's root tries the current, main and last-hit roots before it lists every root, so a node in one of them costs no list of roots.
- DOM-to-model answers on a handle, from `resolvePoint`, `resolveEventRange`, `resolveDropTarget` and `resolveVisualPoint`, carry the reached view's root when it differs from the handle's, so the answer addresses the same text.
- `drag.start` on a handle starts the drag in the reached view, copy-only when the handle or that view is read-only. `drag.indicate` remembers the view it painted, so a clear with `null` clears that view. A read-only handle paints no indicator and finds no drop target in a view other than itself. `resolveDropTarget` with no target, and `drag.autoScroll`, use the view under the pointer: the element `elementFromPoint` finds in the reached view's window, through the shadow roots above views, mapped by `resolveDOMTargetView`, else the reached view. The drop resolver then hit-tests in that view's own page or shadow root. Its probe for a drop with a DOM target uses the same hit test, so a block drag over a view in a shadow root takes the probe's answer where it used to fall back to the search.
- `getMountedEditableDOMRuntime`'s fallback to another view editor of the same root and presentation goes through `resolveDOMReach`, or through `resolveDOMTargetView` when the caller passes a DOM node, so the one rule answers there too.
- `subscribeEditorDOMScope` on a handle with no mounted root also notifies when any view of its document mounts, unmounts or changes focus. On the document's editor it also notifies when the caret owner moves and when a commit moves the selection to another root, so `useEditorRootElement`, `useEditorEditableElement` and `useEditorScrollElement` on the document's editor update.
- `useRuntimeFocusState` stays as it is. On Plate's outer view, which has no Editable, its `isFocused` read now reaches the inner view, and only a view-state notice refreshes it. Plate exports its own `useEditorFocused`, which reads Plate's view facts and returns `false` outside `PlateContent` at base and with the rule (lead probe, log row "panel"). Plite's focus context on the outer view has one reader, `BlockPlaceholderPlugin`, which renders inside the Editable and reads the inner view's provider.
- The React provider stops computing `focused` and `focusVersion` on every commit. Nothing reads them, and through the reach rule their per-commit `isFocused` read broke two caret tests, "a selection across content roots that a newer placement in another view overtakes still types at its anchor" and R45 in `view-carets.test.tsx`.
- Keyboard navigation's clear reads its tree from the key event's `currentTarget` and its scheduler from that Editable's runtime. This holds on the key path. The command path through `applyContentRootSelectionMoveCommand` (`mutation-controller.ts:751-762`) is reached only by tests today, because no production key or input path sends a `move-selection` command, so it takes the Editable of the browser handle that sent the command, through `applyEditableCommand`'s `element`, and clears nothing when a caller passes none. The microtask and frame passes stop when that Editable has disconnected and never resolve a replacement view. Nothing changes on screen for an Editable in an open shadow root, because all three engines clear that tree's selection with the page's. The clear's write record now sits on the shadow root, which only the shadow tree's own Editable reads. A second view of the same editor on the page reads the page document's record, which the clear no longer writes. Its selection claim reaches the same decision with or without that record, and a page with both views matched base in all three engines (measured). The cleared tree itself differs only when one view's Editables sit in two documents, such as the page and an iframe, which no test builds.
- A `plate/editable-own-dom-tree` rule refuses `resolveLastEditorWindow`, reads of `EDITOR_TO_WINDOW`, `EDITOR_TO_ELEMENT` and `EDITOR_TO_DOM_EDITABLE`, `findEditorDOMRootRuntime`, `getMountedEditableDOMRuntime` called with no DOM node or with `undefined`, `root`, `editable`, `getWindow`, `resolveDocumentOrShadowRoot`, `scroll` and `deselect` called through `.api.dom.`, `DOMEditor.` or `ReactEditor.` by name or string key, and `resolveDOMNode` or `assertDOMNode` given the editor itself, which answers `editable`, under `packages/plitejs/src/react/editable`, outside tests. Today's calls go into the baseline. The rule does not report a cast or non-null assertion, a template-literal key, a computed `api` or `dom` key or `void 0` for the DOM node, and its enforcement row names those forms.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where calls on the app's editor go | The caret's view among those showing the call's root, else the only one (look) | Only a focused view, else the only one; nothing otherwise | focus only | big |
| Screen calls on editors outside a view | Keep them and send them to a view | Remove them from every editor that is not a mounted view | cut dom | big |
| Several views of one root, none holding the caret | The focused one, else nothing, so no view gets picked by chance | Use the view mounted first | first view | small |
| The caret sits in a root no view on screen shows | Do nothing (look) | Use the only view on screen, whatever root it shows | any root | small |
| How an app picks one view | Hold that view's editor, as today | Add a view option to each call | view option | small |
| Two areas in one view, calls about the whole view | The focused area, else the only one, as today | The area that holds the view's caret | caret area | small |
| A toolbar's root editor made outside any view | Answers nothing, as today | Reach the view of the main root | main view | detail |
| Clearing the page selection when the app's editor deselects | Clear the editor's own selection, then the page selection in the reached view's page (look) | Clear only the editor's own selection, as today | model deselect | small |
| Plite's focus state on a view with no editable area, such as Plate's outer view | Leave the hook alone. It now reads the inner view's focus, but updates only when the view's state changes | Also update it on every focus change, which re-renders that view's children | live outer focus | detail |
| The caret's view while React hides it, or after its last editing area unmounts | Do nothing until it shows again or another view takes the caret | Use another view of the same root | visible view | detail |
| The last plan review found the way we pick the focused view too slow | Use the faster replacement architect picked, and let the code review check it (look) | Run a fourth plan review on the replacement first | pivot iteration | small |
| A view sitting inside another view of the same root has focus | Use the inner view, across a shadow root or an iframe too | Use neither, as when two views have focus | nested focus | detail |
| An editing area moved into another page or shadow root without remounting | The focus lookup misses it, just as its page facts already go stale today | Recheck its page on every focus event | moved area | detail |
| Another view's text passed to a root editor | Turn it into the shared document's node, as today. Only the checks that ask whether a page node belongs to this editor say no (look) | Refuse it in every lookup that takes a page node. That adds an ownership check before three text shortcuts on the typing path, and a timing line for them | own text | small |
| Arrow-key clear in a view inside a shadow root | Clear the selection where the key was pressed. Its browser test passed before the change in all three browsers, which clear a shadow tree's selection with the page's, so the run cut it. A second test with another view of the editor on the page also matched before and after, and the run cut it too. The new lint check keeps the old read out (look) | Build a page with one view's editing areas on the page and in an iframe, where the old clear would miss | two-document test | detail |
| Unused focus state in the React provider | Delete it | Keep computing it on every change | keep focus state | detail |
| A check that keeps editable code on its own screen | Add it, with today's calls listed as known | No check | no lint | detail |
| Finding the focused area of a view with several areas | Remember the area that got focus last, as today | Ask every area whether it has focus, on each call | live focus | detail |
| A drop or pointer event over another view, passed to a root editor | Answer nothing, as today | Resolve it in the root editor's own view, as the first built version did | event own view | detail |
| A page lookup of a range whose two ends sit in different roots | Throw, as every other location read does | Answer nothing | range null | detail |
| A page range passed to the app's editor or a root editor | Run it on that editor, as before this plan. Two fixes tried to pick a view from where the range starts and ends. Each one let another editor's text in or turned away a good range, and after a second miss the review rules say to revert (look) | Pick each end's view only after the end lands in text. That is a third try, which the review rules leave to a new plan, and t_6c238731 owns it | range ends | detail |
| When to build a better range pick | Later, in t_6c238731. No shipped code asks the app's editor or a root editor for a range inside a named root's view | Plan it now and hold this phase until it lands | verdict range | detail |
| A drop target found from pointer coordinates alone, on the app's editor | Use the view under the pointer, looked up in the window of the view the editor reaches. With no view reached, such as several views with no caret and none focused, answer as today | Use the caret's view, as other calls with no page node do | caret drop | detail |
| Focus moves between views while element hooks on the app's editor are mounted | Accept about 80 microseconds more per focus change with 8 views and 8 hooks, likely the hooks rendering the newly focused view's elements (look) | Notify those hooks only when the caret or the selection's root moves | caret-only hooks | small |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DOM calls on a handle with no mounted root | Answer `null` or do nothing (probes A and B) | Run on the view editor the handle reaches | `resolveDOMReach` in `dom/plugin/dom-root-runtime.ts`, run from `dom/plugin/dom-editor.ts` | One rule answers which view, and it picks the root the way core routes the document editor's commands (`docs/vision/plite.md:840-843`) | No call site changes; dom.mdx gains a comment and a two-view example, react-hooks.mdx a root editor example | The dom-view-reach cases fail at base, and its controls fail under the plan's first rule; the swapped caret tests fail at base | A call lands in a view the app did not mean | rearchitect |
| Which view the document editor reaches | None | A view that shows the call's root, by its target, else the caret's root, else main; the caret owner's view there, else the only one, else the only focused one | `resolveDOMReach`, reading `getBaseCallRoot` and `getCaretOwner` | The caret owner is core's record of the last placement, and focusing an Editable also sets it (probe E). A view of another root would move the call out of the caret's root (panel round 1) | None | jsdom case (b), control (d), the unmounted-root control, and the named-root point and node cases | A base value replace clears the owner, so two views of one root then answer only through focus until a caret is placed (probe E) | rearchitect |
| A `useRootEditor` editor's DOM calls | Answer `null` | Its own `EditorRoot`'s mounted view at its root, and nothing for a target in another root; its `has*` checks refuse another view's DOM, and its text conversions still accept it, as at base (open; t_6c238731 owns it) | `resolveDOMReach`'s address check | Its presentation already names that view (probe F) | The caret tests drop `mountedView` where they hold a root editor | Swapped caret tests; the control that it does not claim another view's DOM node, which fails under a mutant that checks the node first; the case for a point in another root | Outside any `EditorRoot` it still answers nothing; the docs say so | rearchitect |
| DOM focus record | Set on focusin and pointerdown, dropped on a stale read | Unchanged | `dom/plugin/dom-root-runtime.ts` | It matched a live focus scan on all 31,519 platejs lookups and differed in two plitejs lookups, for which the probe logged no stack, and no test failed on them. A full scan missed both mirror lines of the Scale gate. A memo that scans on a miss pays that full scan on every call while a view with several Editables is blurred, which is gate A's 2.153 on calls-mirror8 | None | Equivalence probe; Scale gate | A lookup made while the record is stale in a view with several Editables answers `null`, as today | keep |
| The focused view among several of one root, with no caret owner | None; the round-3 draft checked every view's focus on each call | One focus chain per top document that holds the document's Editables, through iframes and shadow roots, open or closed, mapped to the nearest view above the focused element | `dom/plugin/dom-root-runtime.ts`, with the top documents recorded at registration | The scan missed calls-doc-views8-noowner, 1.592 against 1.25. Three architect seats proposed this pick on their own, and each rejected a record of the last focused view, which a canceled press can leave wrong (log rows "architect") | None | The no-owner and shadow-root cases and their mutants; gate-p1b rerun | An editing area moved to another page without remounting is not found | rearchitect |
| Root of a document-editor call with no target | Computed inline in `plugin-dispatch.ts` | `getBaseCallRoot` in `core/public-state.ts`, called by dispatch and by the reach rule | Plite core | A command and a DOM call on the document's editor must pick the same root | None | The plitejs suite | None found | rearchitect |
| `deselect`, `scrollIntoView` and `scroll` on the document's editor | Run on the handle | Still on the handle, with their inner DOM calls reaching a view; `scroll` reads the handle's own registered element first | `dom/plugin/dom-editor.ts` | A read-only view's `update` throws (`editor-runtime-view.ts:1396`). An app may register a scroll container on the editor `createEditor` returns, and Plate registers its container on `useEditor()`, which is that editor until the inner view mounts (`PlateContainer.tsx:33`, `Plate.tsx:98`) | None | jsdom cases under a read-only view and with a registered container, each failing under the plan's first rule | None found | keep |
| Plite's focus state on a view with no Editable of its own | Always `false` | The hook unchanged; its read reaches the inner view and refreshes on view-state notices only | `react/hooks/use-runtime-focus-state.ts` | Plate exports its own `useEditorFocused`, which this change does not touch, and Plite's context there has one reader, inside the Editable (panel round 2) | None | None | A Plite app that nests `EditorRoot`s can read the inner view's focus late | keep |
| A DOM target inside one view's mirrors | The view's focused Editable, else the only one, so a node in a blurred mirror answers `false` | Unchanged | `dom/plugin/dom-editor.ts` | The reach rule picks a view, not an Editable; carrying the target's Editable into the method is a separate change (panel round 1) | None | None | A document-editor call on a node in a blurred mirror answers as the view's editor does today | keep |
| Mounted Editable fallback | Another view editor of the same root and presentation, if focused | Through `resolveDOMReach` | `react/editable/editable-dom-runtime.ts` | One rule; 15 plitejs and 12 platejs fallback hits, all on view editors | None | The equivalence-affected tests rerun green | A fallback caller gets a different view | rearchitect |
| A module-scoped DOM pin | None; the arena base proposed `withDOMRoot` | Not added | None | A hidden current-scope global, which another runner forbade | None | None | None | cut |
| Provider focus state | `focused` and `focusVersion` computed on every commit, never read | Deleted | `react/hooks/use-plite-runtime.tsx` | No reader in the repository; the type is internal (`use-plite-runtime.tsx:136`) | None | Typecheck and the plitejs React suite | None found | cut |
| Provider active view map | Last activated view per root and presentation | Kept | `react/hooks/use-plite-runtime.tsx` | Deleting it changes `useCommand` on mirror input, outside the ask | None | None | None | keep |
| DOM scope subscription on an unmounted handle | Never notified | Notified on any view mount, unmount or focus change, and on caret moves | `dom/plugin/dom-editor.ts` | The public element hooks read the document's editor too | None | jsdom cases (e1) and (e2) fail at base | Extra renders for subscribers on the document's editor | rearchitect |
| Keyboard navigation's native clear | The page document of the editor's last window | The tree and scheduler of the Editable that got the key on the key path, and of the browser handle's Editable on the command path, which only tests reach | `react/editable/content-root-navigation.ts` | A per-Editable rule carries the Editable; owns view-selection-import's "nav tree" row | None | The lint rule flags the old read on the historical file; shadow-root browser tests with one view and with two passed at base in three engines and were cut | None found | rearchitect |
| Editable code reading editor-wide lookups | Unchecked; content-root navigation read the page document | A baseline lint rule | `tooling/oxlint` plate rules | The correct.md item waits on this rule of reach | Baseline of today's calls | Rule cases and the lint baseline | A false positive on a legitimate whole-view read | rearchitect |
| Docs that teach DOM calls | dom.mdx teaches a call that does nothing | Same code with a comment; a `useRootEditor` example; a law sentence in plite.md | `plate-docs`, `best-api repair` | The pages describe the new answer | Four docs pages, no Chinese twins | Docs checks; browser re-drives | None | keep |
| Plate's per-root view pick | Last focused view, else primary | Unchanged | `platejs/react` | Outside this question; `useEditor()` keeps returning that view's editor | None | The platejs suite | Plate's pick and the caret disagree for the document editor | keep |

## Steps

Each phase lands as its own commit, ends with a keep or revert decision, and the next phase starts only after its proof passes.

### Phase 1: one reach rule

- [x] Write the tests in `packages/plitejs/test/react/dom-view-reach.test.tsx`, each on the editor `createEditor` returns unless it names another. In (a), with one view mounted, `editor.api.dom.focus()` focuses its Editable. In (b), with three views and a caret placed in the first, then the third, then the second, `focus()` focuses the second. In (e1), `useEditorEditableElement(editor)` returns the view's Editable once it mounts, and in (e2) it follows the caret through the same order. `resolveDOMNode(editor)` returns the view's Editable. A DOM node of view B belongs to the document's editor after a caret is placed in A. A point and a live node of `note` resolve in the view that shows `note`, the node case comparing the first block's text. Round 2 of the panel added these cases. `editable('note')` answers the `note` view while the caret sits in main. A `note` point with only main mounted answers `null`, and `assertDOMPoint` throws. A root editor's point in another root answers `null`. A DOM point in the `note` view round-trips with `root: 'note'`. `hasRange` reads a `note` range. A caret in a view that `Activity` hides leaves focus on the page. `useEditorEditableElement(editor)` follows a write that moves the selection into `note`. A drag from a read-only root editor is copy-only and leaves the selection alone. `drag.indicate(null)` clears the view that painted. `deselect()` under `<EditorRoot readOnly>` clears the selection and the view's native selection. Round 3 of the panel added these cases. Main's view editor answers `null` for a `note` point and range and throws on asserting the point, while the `note` view's editor still resolves a point that names `note`. The document's editor answers `null` for another editor's text. A read-only root editor paints no drop indicator. Removing the caret's Editable leaves focus on the page until another view takes the caret. In (f), with the caret in main and a `note` view mounted, the capability's `resolveDOMPoint`, `assertDOMPoint`, `resolveDOMRange`, `assertDOMRange` and `drag.start` on the document's editor answer in the `note` view. The new focus pick added two cases. After a value replace clears the caret owner, the document's editor and its element hook reach the focused one of three views. A focused view inside a shadow root is reached beside a view on the page. The controls are these four. In (d), two views and no caret, `focus()` leaves focus where it was. A caret placed through `useRootEditor('note')` while no view shows `note` leaves focus on the page. View B's root editor does not claim view A's node. A scroll container registered on the document's editor stays its scroll element. The diff panel added these cases. A root editor answers `null` for a block drop over another view's text and resolves one over its own view's text. The document's editor and a root editor resolve a DOM range that ends just past the Editable, and one that starts just before it. Proof: each case fails for its named defect on a tree without its fix, the round-1 cases at `d25c19a0ba` in a detached worktree, the round-2 cases on the reviewed draft and the round-3 cases on the round-3 draft (log rows "panel"). The two focus-pick cases fail when the pick drops its focus fallback, and the shadow-root case also fails when the pick reads only the page's focused element (log rows "architect"). Each control passes at base and fails under a mutant: (d) under one that picks the first mounted view, the root editor's control under one that checks the DOM node before the handle's own view, and the unmounted-root and scroll controls under the plan's first rule. The self lookup also fails under a mutant that drops its swap. The mutant scripts are `mutate.py` in the run directory's `panel-plan-2/mutants`, `panel-plan-3/mutants` and `pivot` folders.
- [x] In `view-carets.test.tsx`, replace each `mountedView(...)` call made on a view whose root editor the test holds with that editor. Tests that hold no root editor keep the helper. Proof: the edited tests fail at base and pass after the rule.
- [x] Add `getBaseCallRoot` to `core/public-state.ts` and call it from `plugin-dispatch.ts`, and add `subscribeCaretOwner` to `core/view-carets.ts`. Proof: the plitejs suite.
- [x] Add the index of mounted views and the pages or shadow roots they sit in, `resolveDOMReach` and `resolveDOMTargetView` to `dom/plugin/dom-root-runtime.ts`, and the forward table and the capability's routes to `dom/plugin/dom-editor.ts`. Proof: the tests above pass, and a spike that drops one forward from the table fails typecheck.
- [x] Route `getMountedEditableDOMRuntime`'s fallback through `resolveDOMReach`. Proof: the three equivalence-affected tests rerun, "resolves the surviving mounted DOM owner after the focused third view unmounts" in `external-text-contract.test.tsx` and "reports keyboard replay only to the initiating editable" in `use-plite-history.test.tsx`, and any changed expectation shows that focus truly left.
- [x] Notify DOM scope subscribers of a handle with no mounted root on view mount, unmount, focus change, caret owner moves and a commit that moves the selection to another root. Proof: cases (e1) and (e2), and the case where a write moves the selection into `note`.
- [x] Delete the provider's `focused` and `focusVersion`. Proof: typecheck, the plitejs React suite, and the two caret tests that failed while the provider read focus through the rule.
- [x] Run the Scale gate on the final Phase 1 tree. The five first lines run against base with their frozen budgets, 1.10 for each calls line and 1.05 for each typing line. Focus-hop-views8 runs against base, and both arms of calls-doc-views8 and calls-doc-views8-roots1000 against the view editor's path on the same tree, with the budgets the Scale gate gives them. Proof: `paired-timing.mjs` exits 0 on both configs with every planted arm failing. An inconclusive typing line stays a gate, named in Open work. A conclusive miss on any line sends the target back to `architect`.
- [x] Keep or revert Phase 1. Keep when every box above holds and the plitejs React suite, the plitejs bun suite and the platejs suite pass.

### Phase 2: navigation's own tree, and the check

- [x] Clear navigation's native selection in the tree of the key event's `currentTarget`, with that Editable's scheduler, on the key path, and in the tree of the browser handle's Editable on the command path, which only tests reach, and stop the deferred passes when that Editable disconnects. Proof: `plate/editable-own-dom-tree` flags the old read on the historical file, and the content-root navigation contracts and the synced-blocks browser file pass.
- [x] Make the focus pick follow one focus chain from each top document, down through iframes and shadow roots that hold focus, and record at registration each shadow root above a view, so the chain enters a closed one too. Proof: with the caret owner cleared, the document's editor reaches a focused view in an open shadow root hosted in another view's Editable, a jsdom case, and a focused view in a same-origin iframe inside another view's Editable, a managed browser test; each fails on Phase 1's pick. Phase 1's case for a view in a shadow root beside the page now uses a closed root, and it fails on the reviewed draft, which entered only open ones. Once focus moves to the page, an iframe's own focused element goes back to its body in all three engines (measured), so a view on the page beside an iframe that once held focus already worked on Phase 1's pick and has no case.
- [x] Make a drop target found from pointer coordinates alone, and `drag.autoScroll`, on the document's editor use the view under the pointer instead of the caret's view. Make the drop resolver hit-test in the view's own page or shadow root. Proof: with the caret in the page view, the document's editor resolves a block drop at coordinates over the `note` view, which sits in a closed shadow root, with no target, in the `note` view. It fails on Phase 1's pick, on the reviewed draft in all three engines, and in Chromium when either the map of shadow roots or the own-tree hit test is reverted alone. A text drop resolves nothing from coordinates alone on any view, so the case drags a block. No case drives `drag.autoScroll`, because jsdom has no layout and the browser test has no scroll container.
- [x] Check on a proof-only page with content roots inside an open shadow root whether Shift with an arrow key across content roots leaves a native range showing at base. Proof: a managed browser test reads the page's and the shadow tree's selection after each press. Both presses passed at base in Chromium, Firefox and WebKit, because each engine clears the shadow tree's selection with the page's, so the Tests rule cut the test and its page (log row "test"). The diff panel asked for the same presses with a second view of the editor on the page, which reads the page document's record that the old clear wrote. Native selections, highlights, model selections and typed text matched base in all three engines, so the run cut that test too.
- [x] Add `plate/editable-own-dom-tree` with valid and invalid cases and today's calls in its baseline, and add its row to `docs/development/enforcement.md`. Proof: the rule's cases, a string key, an explicit `undefined` and `resolveDOMNode` given the editor among them, and `pnpm lint:baseline`.
- [x] Rerun gate p1b, calls-doc-views8 with its no-owner arm and calls-doc-views8-roots1000, on the final Phase 2 tree through `benchmark`, because the focus chain runs on each call of the document's editor that has no caret owner. Proof: `paired-timing.mjs` exits 0 within the 1.25 budgets, with every planted arm failing.
- [x] Keep or revert Phase 2.

### Phase 3: docs and law

- [ ] Run `plate-docs` on `content/docs/api/dom.mdx`, with its comment and its two-view example, `content/docs/plite/libraries/plite-react/react-editor.mdx`, `content/docs/api/react-hooks.mdx` and `content/docs/(guides)/roots.mdx`; none has a Chinese twin. Proof: the docs checks and each page's rendered body in the docs app.
- [ ] Rewrite the JSDoc of `resolveDocumentOrShadowRoot`, `root` and `editable` to say which view answers. Proof: the docs build reads them.
- [ ] Run `best-api repair` to write the reach rule into `docs/vision/plite.md` beside the core routing law, with its open limit that a root editor's text conversions still accept another view's text, which t_6c238731 owns, and fix every artifact that still teaches the null answer. Proof: a teaching sweep for the old wording.
- [ ] Check the `plitejs` changesets Phases 1 and 2 amended against the final behavior per `changeset`. Proof: its check.
- [ ] Re-drive `/docs/controlled`, `/examples/plite/mentions` and `/examples/plite/iframe` in Chromium from a source-served docs app. Proof: Replace Value and Reset Editor leave focus in the editor with the caret at the end, and text typed after each appears there; the mention popup sits beside the caret, and choosing a mention inserts it; the iframe example clears its selection on blur.
- [ ] Keep or revert Phase 3.

## Completion gates

Phase 1 runs under the owner's "go" from the Pursue verdict, as one packet landed by `land.mjs`. The lead wrote the draft during plan review, and the diff panel reviews it instead of a code delegate.

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Blast radius | yes | Run `pstack:blast-radius` on the change before the port | done: log row "blast-radius" |
| Guards reproduced | yes | Each new case fails for its named defect on a tree without its fix | done: log rows "proof", "panel" and "test" |
| Forward table spike | yes | Dropping one forward fails typecheck | done: log row "proof", the blur forward |
| Equivalence-affected tests | yes | The three named tests rerun | done: log row "proof" |
| Changeset | yes | Load `changeset` and add what it requires for `plitejs` | done: log row "changeset", amended in each diff round |
| Writing passes | yes | `deslop`, then `no-comments`, on the final diff | done: log rows "writing" |
| Cheap checks | yes | Type-aware oxlint on the task's files and the `pnpm check` steps the edits reach | done: log row "proof", with `pnpm check --affected` at landing |
| Diff panel | yes | The `api-build` and `push` rows | done: three rounds, log rows "panel" |
| Scale gate | yes | Gate p1a and gate p1b on the final tree, through `benchmark` | done: log row "probe" |
| Suites | yes | The plitejs React suite, the plitejs bun suite and the platejs suite | done: log row "proof" |
| Thermos | skip | The diff panel applies both lenses | skip: the `api-build` and `push` rows owe a panel on the diff |
| Hand drive | skip | Phase 1 edits no page | skip: Phase 3 re-drives the three routes after its docs edits |
| Playtest | skip | `playtest.mjs scope` on the task's files | skip: it names no scenario catalog for these files |
| Land | yes | `land.mjs --check 'pnpm check --affected'` | done: this commit |

Phase 2 runs under the same "go" and the owner's 2026-10-22 word to build every phase in one session, "we want to autopilot one shot". Its packet is the Phase 2 steps, built by three delegates in their own worktrees and landed as one commit.

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Reachability | yes | Reproduce each Phase 2 guard's state through its public entry before building it | done: log rows "build" and "test", each lane's reach check before its build |
| Guards reproduced | yes | Each new case fails at base or on Phase 1's pick for its named defect | done: log rows "test" and "panel" |
| Browser matrix | yes | Five warm runs of each new browser test in Chromium, Firefox and WebKit | done: log rows "proof", 15 of 15 runs on round 1's fixed tree |
| Lint rule | yes | Rule cases, baseline, enforcement row, and a historical file it flags with its fixed copy as control | done: log rows "build" and "proof" |
| Scale gate | yes | Gate p1b on the final Phase 2 tree, through `benchmark` | done: log row "probe", replanted on the final bytes |
| Changeset | yes | Amend the `plitejs` changeset per `changeset` | done: log row "changeset" |
| Writing passes | yes | `deslop`, then `no-comments`, on the final diff | done: log rows "writing" |
| Cheap checks | yes | Type-aware oxlint on the task's files and the `pnpm check` steps the edits reach | done: log rows "proof", with `pnpm check --affected` at landing |
| Diff panel | yes | The `api-build` and `push` rows, after a `built:` row for Phase 1 | done: two rounds, log rows "panel" |
| Suites | yes | The plitejs React suite, the plitejs bun suite and the platejs suite | done: log rows "proof" |
| Thermos | skip | The diff panel applies both lenses | skip: the `api-build` and `push` rows owe a panel on the diff |
| Hand drive | yes | `hand-drive.mjs check` on the plan's files | done: log row "proof", 7 of 7 cells |
| Land | yes | `land.mjs --check 'pnpm check --affected'` | done: this commit |

## Scale gate

The reach rule adds work to every `DOMEditor` call, and the focus record decides how a view with several Editables finds the focused one. A run-only probe, `dom-reach.bench.probe.test.tsx` in the run directory, measures both under jsdom. Each cohort mounts real `EditorRoot`s and either times a burst of six `editor.api.dom` calls on a view editor or times one typed `beforeinput` per operation. Before timing, it reads back the number of Editables and views, the blocks each renders, which one holds focus and that every call resolved in it, and it fails when one differs from what the cohort's name claims. Run on one mirror or view too many, it fails on that readback. `paired-timing.mjs` runs base and candidate in six packets, three mirrored pairs, with a planted arm each line must reject and a same-code arm that measures noise. The lead froze the budgets from base-against-base runs before any gate read a candidate. Each calls line allows 1.10 and each typing line 1.05, as the median paired ratio over base (log rows "probe").

Both gates carry the reach wrapper. Gate A drops the focus record and scans every Editable's root on each lookup. Gate B remembers the scan's answer and scans again only when that answer no longer holds focus.

| Cohort | What one operation does | Gate A, full scan | Gate B, memo |
| --- | --- | --- | --- |
| calls-1 | Six DOM calls on a view with one Editable | 0.967, noise 0.097, pass | 0.888, noise 0.039, pass |
| calls-mirror2 | The same calls on a view with two Editables, the last one focused | 1.209, noise 0.085, miss | 1.032, noise 0.062, pass |
| calls-mirror8 | The same with eight Editables | 2.153, noise 0.322, miss | 1.009, noise 0.047, pass |
| type-1 | One typed character in a view with one Editable | 0.922, noise 0.186, inconclusive | 1.136, noise 0.086, inconclusive |
| type-views8 | One typed character in the middle one of eight `EditorRoot`s on one editor | 1.095, noise 0.039, miss by the runner's rule | 1.017, noise 0.076, inconclusive |

Calls-1 passed in both gates, but that does not show the wrapper's own cost. The probe's candidate returned the only Editable without the focus check base makes on its record, and it timed only a view editor's own path, where the rule reads one map (panel round 1). The full scan doubles a burst at eight Editables, from 22 to 46 microseconds. The likely cause is that each lookup checks every Editable's focus instead of one record, which is inferred from the code and not profiled. The full scan is rejected.

The memo passes every calls line, but it is not the pick. While a view with several Editables is blurred, it scans every Editable on each call, which is gate A's cost on calls-mirror8, 2.153. The two lookups it would fix differ from the record only while it is stale, the probe logged no stack for them, and no test fails on them. The focus record therefore stays as it is.

The typing lines do not read the focus record, because each view there has one Editable, and gates A and B run the same code on them. Type-views8 read 1.095 in one gate and 1.017 in the other, so these lines move by more than the runner's noise estimate. Per keystroke, the only extra work is one map read per DOM call, plus a root read for a call about a point or range, about 41 calls in type-1 and 61 in type-views8, plus one and eight slow-path calls from the provider's unused `isFocused` read, which Phase 1 deletes. The typing lines stay a gate. Phase 1's rerun runs all five lines on the final tree with these budgets, and a conclusive miss sends the target back to `architect`.

The first gates timed only a view editor's own path, so Phase 1's rerun adds two lines. Focus-hop-views8 moves focus between two of eight `EditorRoot`s on one editor while eight `useEditorEditableElement(editor)` hooks on the document's editor are mounted, against base, with a budget of 1.10, because it runs once per focus change and sends the new scope notices. Calls-doc-views8 times the six-call burst through the document's editor against the same burst through the middle view's own editor, of eight, on the same final tree. It has two arms. In one, the caret sits in the middle view. In the other, a value replace clears the caret owner while the middle view holds focus, so each call takes the focus pick. Each arm's budget is 1.25, because the document's editor adds an index read, a selection read and, with no caret owner, the focus pick to each call. The selection read no longer clones the selection. Each new line first runs its base arm against itself, and the lead freezes its budget then, before any candidate runs. When the base arm nears its budget, the lead restates the line before freezing it.

On the round-3 draft the caret arm passed at 1.078, noise 0.019. The no-owner arm missed at 1.592, noise 0.048, with its planted arm at 2.459. That draft's pick asked every view of the root whether it held focus, on every call. Architect replaced it with one focused-element read per page or shadow root (log rows "architect"). On the new pick, run once before Phase 1, the caret arm read 1.100, noise 0.008, and the no-owner arm 1.097, noise 0.024, and both planted arms read about 2.1. Phase 1 runs the whole gate again on the final tree.

The diff panel's first round added a third document-editor line, calls-doc-views8-roots1000. It runs the caret arm of calls-doc-views8 on a document that also holds 1,000 named roots no view shows. Finding a key's or node's root had listed every root on each call of the document's editor, and no line had more than the main root. Its view arm against itself read 0.999, noise 0.010, and its planted arm read 2.030, so its budget is 1.25, like the other two document-editor lines (log row "probe"). A smoke run had timed the document editor's arm once before that calibration, and the budget did not come from it. With round 1's listing of every root, the document's editor reads 2.376 on this line, so the line sees that cost.

On the final Phase 1 tree both gates passed (log row "probe"). Against base, calls-1 read 1.031, calls-mirror2 1.015, calls-mirror8 1.018, type-1 0.988, type-views8 0.991 and focus-hop-views8 0.396, with same-code noise from 0.002 to 0.020. Against the view editor's path, calls-doc-views8 read 1.108, its no-owner arm 1.098 and calls-doc-views8-roots1000 1.113, with noise from 0.014 to 0.024. Every planted arm read between 1.28 and 3.05, so each line could fail. A six-call burst takes 19.5 microseconds at base and 20.0 on the final tree. Through the document's editor it takes 25.2, against 22.8 through the view's own editor. Focus-hop reads below 1 because Phase 1 deletes the provider's focus state, which it recomputed on every commit. One focus change takes 1,145 microseconds at base and 451 on the final tree. Against a base with only that deletion, the line read 1.233 in an earlier run, above its 1.10 budget, and the Defaults row with the word "caret-only hooks" records that call.

## Failure modes, blast radius and rollback

Three realistic failures:

1. A call on the document's editor lands in the wrong view. Code places a caret in a hidden or background view, and a later `focus()` on the document's editor follows it. The root is the one the document editor's commands already run in, the view is the caret's, case (b) pins the order, and a view of another root is never picked.
2. A caller relied on `null` from the document's editor to mean "not mounted". The blast-radius census below lists every call on a handle with no mounted root while a view is mounted, across the plitejs React and platejs suites, and names each caller whose answer changes.
3. Mirrored Editables pay for the focus lookup on every DOM call, and the document's editor pays an index read and, with no caret owner, one focused-element read per page or shadow root. The Scale gate measures both; the pick there keeps a view editor's path at one record check.

Blast radius. A census at `d25c19a0ba` wrapped every `DOMEditor` method and logged each call made on a handle that has no mounted root of its own while a view of its document is mounted. It ran the plitejs React suite, 1,856 tests, and the platejs suite, and both passed. It logged 437 distinct calls, counted once per method, call stack and test, in 60 caller groups:

- 210 are `isFocused` reads through `use-runtime-focus-state.ts:18-21`. 161 come from the provider's focus state on the document's editor, which Phase 1 deletes. 49 come from `EditorRuntimeView` (`plite.tsx:349`) on a view handle with no Editable of its own, and they stay. Under the reach rule they read the inner view's focus. Plate's exported `useEditorFocused` does not read them, and Plite's focus context there has one reader, inside the Editable (panel round 2).
- 98 read a mounted root or Editable. They come from the DOM element hooks after a scope notice (`dom-root-runtime.ts:93`), Plate's target provider (`plate-context.tsx:97`, `:138` and `:181`) and navigation feedback (`NavigationFeedbackPlugin.ts:101`). On the document's editor these answer `null` today however many views are mounted, because no view registers a root on it. Under the reach rule they answer the reached view, as cases (e1) and (e2) require. Plate's target provider turns this answer into `useEditorMounted`. Its one shipped reader, `media-video.tsx:52`, renders inside an Editable, where the target is the view's own editor, so its answer does not change.
- 10 are plugin calls on the document's editor that do nothing today. `FootnotePlugin.tsx:30` returns early on a `null` root, and `AIChatPlugin.ts:1523` calls `focus()` from `hide()`. Under the reach rule they act on the caret's view, which is the ask's `focus()` case.
- 24 are plitejs's own calls on a view handle with no root of its own, in `root-interaction-controller.ts:458` and `:681`, `focus-plite-editable.ts:38`, `:125` and `:143`, `keyboard-input-strategy.ts:237` and `:410`, and `mutation-controller.ts:1009`. Their tests nest a root inside a view (R9), mount a root only under another view (R30) or restore the caret after Escape (R28). Such a handle keeps its presentation and root, so its answer changes only when another editor at that same address has a mounted root.
- 24 run on the handle as today: 19 `scroll` calls from one NodeSelection spec, which read the handle's own registered element first, three `clipboard.insertData` calls and two path lookups.
- 38 are the `root` and `editable` calls inside those 19 `scroll` calls. `scroll` falls back to them when no scroll element is registered (`dom-editor.ts:2025-2029`), so under the reach rule that spec's `scroll()` returns the reached view's root instead of `null`.
- 33 come from test code.

The census shows which calls the rule reaches, not that each new answer is right. On the pivot draft both suites pass. A probe there logged every call that asks a mounted view's own editor about another root, and found only the three new cases that assert its `null` (log row "blast-radius"). So no tested caller relied on today's `null`, and none asks a view's editor about another root.

Rollback: each phase is one commit. Reverting Phase 1 restores today's answers; Phases 2 and 3 revert alone without touching it.

## Evidence

### Requirements

- Chip t_78091f8f asks to decide which view each DOM lookup resolves in and how an app names one, to fix the DOM API page's example, and to settle which tree keyboard navigation clears.
- App code that holds the editor `createEditor` or `useEditor` returns can focus, scroll and read DOM once a view is mounted. The DOM API page teaches `editor.api.dom.focus()` on it (`content/docs/api/dom.mdx:9-17`).
- Code inside a view acts on that view. Plite's `useEditorContext()` and Plate's `useEditor()` return the view's editor (`packages/platejs/src/react/internal/plate-context.tsx:50-70`).
- Root-scoped toolbar code acts on its surface's view of that root. The docs offer `useRootEditor(root)` for root-specific toolbar and sidebar commands (`content/docs/api/react-hooks.mdx:278-286`, `content/docs/(guides)/roots.mdx:104-105`).
- Each `EditorRoot` owns one independent mounted view, and the Editables, windowed and paged surfaces and content roots inside it share that view's presentation (`docs/vision/plite.md:220-233`).
- A call with no target runs in a view's own root, or in the caret's root from the base editor (`docs/vision/plite.md:840-843`).
- Foreign, removed and unmounted lookups fail closed with `null`, and each `assert*` lookup throws while DOM is missing (`docs/vision/plite.md:860-866`).
- Overlay geometry keeps its exact `editableRef`, and no active view is guessed among mirrors (`docs/plans/2026-08-30` ruling, unchanged).

### Probes at `HEAD`

A run-only Vitest probe under jsdom, from `packages/plitejs` at `d25c19a0ba`, mounted four setups and called each lookup on each editor handle (log row "probe", `probe-head-a2`).

| Setup | Handle | `resolveDocumentOrShadowRoot` | A block's DOM node | `focus()` moves focus to | `isFocused()` while its view has focus |
| --- | --- | --- | --- | --- | --- |
| A: one `EditorRoot` | editor from `createEditor` | `null` | `null` | nowhere | `false` |
| A | view editor from `useEditorContext()` | `document` | the Editable's block | the Editable | `true` |
| B: one `EditorRoot` | editor from `useRootEditor()` | `null` | `null` | nowhere | `false` |
| C: two `EditorRoot`s on one editor, none focused | each view editor | `document` | its own Editable's block | its Editable | n/a |
| C | editor from `createEditor` | `null` | `null` | nowhere | `false` |
| D: one `EditorRoot`, two Editables in two shadow roots, none focused | view editor | `null` | `null` | nowhere | n/a |
| D, right Editable focused | view editor | the right shadow root | the right Editable's block | n/a | `true` |

Two more probes test the premises the target reads (log rows "probe"). Probe E: the caret owner is set by a view write or by focusing an Editable, kept by a later base write on the same root, and cleared by a base value replace, a cleared selection and unmount; with two views after a value replace it is null, which is the named limit. Probe F: the document's editor owns no presentation, a `useRootEditor` editor shares its `EditorRoot`'s, and two `EditorRoot`s own different ones, so the address names a root editor's view without new metadata.

The same call fails in a real browser. On `/docs/controlled`, served from this checkout with source packages, a real click on Replace Value replaces the text and leaves focus on the button with no selection on the page, and Reset Editor does the same (log row "proof", `browser-head-controlled`). Both buttons call `focus()` on the `useCreateEditor` editor (`apps/www/src/registry/examples/controlled-demo.tsx:46`, `:55`). On `/examples/plite/mentions`, typing `@l` key by key fills the mention popup, but the popup stays at its starting box, x and y -9999 (log row "proof", `browser-head-mentions`). The example positions it with `resolveRangeRect` on the editor `useEditor({...})` creates (`apps/www/src/app/(app)/examples/plite/_examples/mentions.tsx:109`, `:217`).

The cause is one map. `DOMRootRuntime` registers each Editable under the view editor it got from context (`packages/plitejs/src/dom/plugin/dom-root-runtime.ts:684-695`), and `findEditorDOMRootRuntime` answers only for that object (`dom-root-runtime.ts:160-182`). The document's editor and `useRootEditor`'s fresh view have no entry, so every lookup on them falls through to `null`.

The focus record and a live focus scan agree on every lookup in the platejs suite, 31,519 of them, and differ in two plitejs lookups, where the record had gone stale and the live scan returned the focused root (log row "probe", equivalence). Three unmount decisions in two plitejs tests differ and rerun in Phase 1.

### Callers at `HEAD`

A read-only census of direct `.api.dom.*` and `DOMEditor.*` call spellings found 368 calls (log row "how"): 120 on an editor from `createEditor` or `useCreateEditor`, 22 on a mounted view's editor, none on a `useRootEditor` editor, and 226 untraced. Aliased and destructured calls are not counted. The ones that need a view are the docs examples (`content/docs/api/dom.mdx:16`, `content/docs/plite/libraries/plite-react/react-editor.mdx:16`, `react-editor-setup.mdx:28`), the controlled demo's two buttons, mentions' `resolveRangeRect` and iframe's `deselect()` on blur (`iframe.tsx:83`). The 90 registry calls run on Plate's `useEditor()`, which returns a view already. Keyboard navigation's clear gets no element and clears in the window cached for the editor (`packages/plitejs/src/react/editable/content-root-navigation.ts:163-195`).

### Lanes

- **Keep the code and fix the docs.** Teach `useEditorContext()` and document that the document's editor answers nothing once a view mounts. It adds nothing, and the typed `editor.api.dom` on the editor every app holds stays a call that never works.
- **Cut DOM from every editor that is not a mounted view**, the strongest deletion. Code outside React holds only the document's editor, so it would need a new public handle to a view, and the editor type would split in two. It adds concepts to remove one bad answer.
- **Follow focus only.** Widen today's rule across views to the focused view, else the only view, else nothing. A call after focus moves to a toolbar outside two views still does nothing, while the same toolbar's commands run in the caret's root.
- **A view or root option on each call.** A root does not name a view, because two views can show one root, and a view option duplicates holding the view's editor.
- **An `at(editable)` handle and uniqueness only**, the two Codex runners' shape in the arena. It adds a public method and a second answer for the document's editor, and every shipped call site would change to reach a view.
- **The pick.** One reach rule on every `DOMEditor` call: a view's editor reaches itself, a root editor reaches its own view, and the document's editor reaches the caret's view, else the only view. It adds no public name and reads the caret owner core already keeps.

Predicted benefit of the pick, for the plan's Close to mark held or falsified: probes A and B answer with the view's DOM, the DOM API page's example works as written, the controlled demo's buttons focus the editor, the mention popup shows beside the caret, and the caret tests drop their helper. The "rule is wrong" lane has no candidate here, because the `null` answer for several views comes from the 2026-10-20 JSDoc, which documented the behavior it found and left this question open (`docs/plans/2026-10-20-dom-lookup-names.md:138`, `:266`).

### Dependents

- `ui`: unaffected. `apps/www/src/app/(app)/examples/plite/[example]/page.tsx`, `plite-example-client.tsx` and `plite-examples-shell.tsx` mount examples through `EditorRoot` and call no DOM lookup.

This plan retains [2026-10-21-view-selection-import](2026-10-21-view-selection-import.md), whose Pursue on which view a native selection belongs to stands; its Defaults row "nav tree" moves here. It retains [2026-10-20-runtime-view-state](2026-10-20-runtime-view-state.md), whose caret owner the rule reads. It answers Open work items 2 and 3 of [the DOM lookups plan](2026-10-20-dom-lookup-names.md) in scope `dom-lookup-names`, whose verdict it leaves alone.

Model: claude-opus-5-5

## Challenge delta

Against the verdict, architect's arena changed three things (log row "architect"). The verdict's "a view with two editing areas will answer without focus first" is falsified: mirrors render every block and the same caret, so whole-view and model calls keep today's focused-else-only answer, and calls with a DOM target reach that target's view. The verdict's caret-test pair was wrong: those tests focus the mounted Editable through a helper, not by hand. The verdict's plan to delete the provider's active view map is dropped, because `useCommand` reads it on mirror input. The Scale gate then kept the DOM focus record that the synthesis deleted, because the live scan that replaced it missed both mirror lines.

The panel's first round changed four things (log rows "panel"), each reproduced on a draft of the plan's first rule. A point, range or node passed to the document's editor now reaches a view of that target's root, because the first rule ignored a point's own root. The document's editor never reaches a view of another root, because a caret in a root no view shows sent focus into main. `deselect`, `scrollIntoView` and `scroll` stay on the handle, because a read-only view throws on `update` and a scroll container can be registered on the document's editor. The plan now gives each method its kind. Building the draft also moved the provider's focus state into the same step as the rule, because its per-commit `isFocused` read through the rule broke two caret tests.

The panel's second round changed five things (log rows "panel"), and the lead reproduced each on the reviewed draft. A lookup about a root no view shows now answers `null`. Before, it fell back to the handle and found a `note` point in main's text. A point or range read from a named root's page now says which root it is in. While React hides the caret's view, the document's editor reaches no view, where the draft moved focus to another view. The page-element hooks now follow a write that moves the selection to another root. The plan no longer claims Plate's focus hook changes, because Plate has its own hook, which the rule does not touch. One critical finding stays open. A root editor still turns another same-root view's text into the shared model node, as at base, and t_6c238731 owns it.

The panel's third round, its last, changed seven things (log rows "panel"). A view's own editor now answers `null` for a point or range in a root it does not show, where the draft answered from its own root's text at the same path. A call with a DOM node reaches that node's view only when the view belongs to the handle, so the document's editor answers `null` for another editor's text. A read-only root editor paints no drop indicator in another view. Removing the caret's Editable now leaves the document's editor reaching nothing until another view takes the caret, as a stated limit. A root editor reads a key's or node's root only when it has no mounted root. Case (f) now runs the capability's members on a `note` view. The lead reproduced the DOM-node case and the read-only indicator. Two seats' event and drop cases did not reproduce under jsdom, and the same node check covers them. The no-caret focus pick missed its timing budget, 1.592 against 1.25. Architect replaced it with one focused-element read per page or shadow root, which all three seats proposed on their own (log rows "architect").

The diff panel's first round changed seven things (log rows "panel"). A DOM range that ends in another editor answered `null`, where the built diff resolved both ends in the view its start reached. An editor that the DOM bridge wires to an element without an `EditorRoot` view answers for itself again. The built diff failed seven bun `test/dom` cases, a suite no earlier run covered. A root editor answers `null` for a block drop over another view's text, as at base. A drop target found from coordinates alone on the document's editor reaches a view. The editable runtime's fallback keeps the view of a DOM node its caller passes. Finding a node's root no longer lists every root when the node sits in the current, main or last-hit root, and the Scale gate gains a line with 1,000 named roots. The changeset now names each behavior an upgrading user would notice. All three seats found that the focus pick answers nothing when an iframe or a nested shadow root holds focus beside the page. Phase 2 owns that, because jsdom never releases an iframe's focused element.

The diff panel's second round changed three things (log rows "panel"). A DOM range with one end outside every editor, such as just past or just before the Editable, resolved again on the document's editor and on a root editor, as at base. Round 1's fix compared the views both raw ends reached and refused that range, whichever end sat outside. Range and event lookups then shared one rule. An end outside every editor took the other end's view, and an end in another editor's content refused. The changeset now says that calls with a DOM node run in that node's view, and that a view's own editor answers `null` for another root. It also says that a range across roots throws only while a view is mounted. Phase 2 gains a step that makes a pointer-only drop target use the view under the pointer.

The diff panel's third round, its last, reverted the range rule (log rows "panel"). Astra and Sol each put a range's end on a wrapper outside every editor, where the lookup moves it into another editor's text. Round 2's rule picked the view from the raw end, so the `note` view read that text as a `note` range. Astra also showed that the rule refused a valid range inside an editor nested in another editor's void. The lead reproduced Astra's and Sol's other-editor cases and Opus's two cases under jsdom. Each answered a `note` range on the reviewed bytes and answers `null` at base. The nested case was not mounted, and the revert runs base's code on it. Round 2's rule was the range pick's one replacement, so the review rules revert it. `resolveRange` runs on the handle again, point lookups included, and every case answers as at base. On the document's editor, a range in a named root's view comes back as a main range at the same path, as at base. t_6c238731 owns the fix and starts from Opus's suggestion to pick each end's view after the end moves into text.

Phase 2's diff panel, in its first round, changed four things (log rows "panel"). Astra and Sol found that the focus chain lost a view in a closed shadow root, which Phase 1's scan reached, and that a drop from coordinates over a view in a shadow root answered `null`, because the resolver hit-tested the page. The lead reproduced both on the reviewed bytes. Registration now records each shadow root above a view, and the resolver hit-tests in the view's own tree. Opus and Sol found spellings the lint rule missed, and it now catches a string key, an explicit `undefined` and `resolveDOMNode` given the editor. Its baseline gains 11 sites. Navigation's clear reads its tree when it runs. Opus asked whether the clear's moved record changes a page with two views, and a two-view page in three engines showed that it changes nothing on screen.

Phase 2's second round found nothing critical and changed text only (log rows "panel"). All three seats found more spellings the lint rule misses: casts, non-null assertions, template-literal keys and computed `api` or `dom` keys. The enforcement row now names them. Opus corrected which Editable reads the clear's record, and named two pointer cases the Open work row lacked.

## Open work

- Build Phases 2 and 3 through the Build playbook, each landing as its own commit. owner: the lead. stop: Phase 3 lands or a panel replaces the target.
- Phase 2 leaves six pointer cases open.
  - With two views of one root, `resolveDropTarget` from coordinates picks the view under the pointer while `drag.indicate` on the document's editor paints in the caret's view, as target drops already did after Phase 1 (diff panel Phase 2 round 1, Opus W4).
  - A pointer over another editor nested in a view, in its void or in an open or closed shadow root, maps to no view of the document's editor, so the pointer calls fall back to the caret's view. The drop then answers `null`, and `drag.autoScroll` scrolls that view, as on Phase 1's pick. A root editor's pointer calls hit-test once more per call (round 1, Opus N3; round 2, Opus N1).
  - A text drop into a view inside a shadow root gets no caret from coordinates, because `caretPositionFromPoint` in `dom-geometry.ts` reads the page.
  - Root chrome's hit test in `root-interaction-controller.ts` reads the page.
  - A pointer over a view inside an iframe resolves in the host view.
  - No test drives a block drag with auto-scroll over a view in a shadow root, where the drop probe and the Editable's repaint now hit-test in the view's own tree (round 2, Opus N3).

  owner: a suggested task offered at the close. stop: started or dismissed.
- No test checks the routes of the capability's `textToCaret`, `resolveVisualPoint`, `resolveDropTarget` and `drag.autoScroll` on the document's editor, because each answers `null` under jsdom on every handle. owner: the lead. stop: the Close names them unproven unless a browser drive covers them.
- t_6c238731 Resolve a DOM target in its own mirror and keep the focus record after a canceled press. owner: the owner, from the suggested-task ledger. stop: started or dismissed. It waits on this run, because it writes the same two files. It also owns panel round 2's open finding, that a root editor's `resolveNode`, `resolvePoint` and `resolveRange` accept another same-root view's text, as at base. The lead folded two diff-review findings into it, both as at base. The document's editor turns another editor's text into a point in its own main root through the text index whenever main has text at that path (round 1, Opus 3). The document's editor and a root editor resolve a DOM range on themselves, so a range in a named root's view comes back as a main range (round 3). When it lands, the reach-order paragraph in Main changes, the `useRootEditor` ledger row and the law sentence Phase 3 writes say again that a root editor refuses every other view's DOM.
