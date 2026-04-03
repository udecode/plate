---
date: 2026-04-03
topic: slate-v2-plate-v2-architecture-research
---

# Slate v2 / Plate v2 Architecture Research

## Purpose

This is the cumulative research ledger for architecture ideas gathered from external editor and non-editor references.

The priority order is:

1. strengthen `slate-v2`
2. capture future `plate-v2` ideas without letting them distort `slate-v2`

## Locked Context

These constraints are not under review:

- `slate-v2` is data-model-first
- operations stay first-class externally
- transactions are the internal execution model
- runtime stays split across dedicated packages
- `slate-react-v2` is intentionally React `19.2+` and React-perfect

That means:

- framework-agnostic purity is not the winning metric
- React 18 compatibility is not the winning metric
- headless-first is not the winning metric

## Classification Keys

Every idea should land in exactly one bucket:

- `adopt-now-for-slate-v2`
- `adopt-later-for-slate-v2`
- `better-fit-for-plate-v2`
- `interesting-but-reject`

## Repo Order

1. Slate
2. ProseMirror
3. Lexical
4. Tiptap
5. Pretext
6. Premirror
7. edix
8. use-editable
9. rich-textarea
10. markdown-editor
11. TanStack DB
12. urql
13. VS Code
14. Language Server Protocol
15. EditContext API
16. Open UI Richer Text Fields

## Current Baseline

Already proven in `../slate`:

- `slate-v2`
- `slate-dom-v2`
- `slate-react-v2`
- `slate-history-v2`

Still missing structurally:

- explicit clipboard-boundary proof

## Findings

### edix

Status: `completed`

#### Core engine

- Headless imperative editor core with a microtask transaction queue in [editor.ts](/Users/zbeyens/git/edix/src/editor.ts)
- Pure operations and selection rebasing in [doc/edit.ts](/Users/zbeyens/git/edix/src/doc/edit.ts)

Classification:

- `adopt-later-for-slate-v2`

Reason:

- the shape validates headless adapter seams and operation purity
- but our current `slate-v2` core is already stronger on transaction discipline and history direction

#### DOM bridge

- DOM selection is explicitly serialized into framework-agnostic selection snapshots in [dom/index.ts](/Users/zbeyens/git/edix/src/dom/index.ts)
- DOM binding is a clear adapter step, not implicit renderer magic

Classification:

- `adopt-now-for-slate-v2`

Reason:

- this reinforces the current `slate-dom-v2` direction
- good evidence for keeping DOM ownership explicit and adapter-like

#### React runtime

- The React example in [App.tsx](/Users/zbeyens/git/edix/examples/react/src/App.tsx) is a thin imperative adapter using `useEffect`, `useRef`, and `useState`

Classification:

- `interesting-but-reject`

Reason:

- good for a tiny demo
- not a better renderer architecture than selector-first `slate-react-v2`

#### History

- Edix history in [history.ts](/Users/zbeyens/git/edix/src/history.ts) is time-window batched

Classification:

- `interesting-but-reject`

Reason:

- this is weaker than the transaction-aware `slate-history-v2` direction

#### Clipboard / external formats

- Explicit internal clipboard ownership via [internalCopy](/Users/zbeyens/git/edix/src/extensions/copy/internal.ts) and [internalPaste](/Users/zbeyens/git/edix/src/extensions/paste/internal.ts)

Classification:

- `adopt-now-for-slate-v2`

Reason:

- strong support for the next missing `slate-v2` structural seam:
  explicit clipboard-boundary ownership

#### Plugin / extension model

- Small `apply` and `mount` plugin hooks in [plugins/types.ts](/Users/zbeyens/git/edix/src/plugins/types.ts)

Classification:

- `better-fit-for-plate-v2`

Reason:

- interesting for lightweight composition
- too thin by itself for the long-term Slate runtime package stack

#### Layout / composition / pagination

- nothing especially strong here

Classification:

- `interesting-but-reject`

#### Summary

Edix is a good adapter-and-clipboard reference.

It is not the renderer blueprint and not the history blueprint.

## Open Slots

### Slate

Status: `covered-in-baseline`

Summary:

- current `slate-v2` planning already came from direct Slate inheritance pressure plus the issue corpus
- we are not re-spending time on broad Slate archaeology unless a specific legacy seam needs it

### ProseMirror

Status: `completed`

#### Core engine

- The package split is brutally disciplined:
  - `model`
  - `transform`
  - `state`
  - `view`
  - `history`
  - `collab`
- `EditorState` is persistent and immutable in [state.ts](/Users/zbeyens/git/prosemirror/state/src/state.ts)
- `Transaction` is a first-class state update object in [transaction.ts](/Users/zbeyens/git/prosemirror/state/src/transaction.ts)
- transforms are their own package in [transform](/Users/zbeyens/git/prosemirror/transform)

Classification:

- `adopt-now-for-slate-v2`

Reason:

- this strongly reinforces the split package direction we already chose
- it validates keeping `slate-v2` focused on model plus transactions instead of collapsing runtime concerns back inward

#### DOM bridge

- `view` is explicitly separate from state and transform
- DOM selection, DOM observer, input handling, clipboard, and rendering all live under [view/src](/Users/zbeyens/git/prosemirror/view/src)
- there is no confusion about whether the core or the DOM layer owns browser behavior

Classification:

- `adopt-now-for-slate-v2`

Reason:

- this strongly supports the current `slate-dom-v2` package boundary

#### React runtime

- ProseMirror has no React runtime story in core modules

Classification:

- `interesting-but-reject`

Reason:

- great editor architecture benchmark
- not a better `slate-react-v2` renderer model

#### History

- `history` is its own package
- it stores undo/redo branches as structured items, not just raw snapshots
- it uses selection bookmarks and explicit event grouping in [history.ts](/Users/zbeyens/git/prosemirror/history/src/history.ts)
- it also exposes an explicit `historyPreserveItems` contract for collab rebasing

Classification:

- `adopt-later-for-slate-v2`

Reason:

- our current `slate-history-v2` proof is simpler and right-sized for now
- but ProseMirror’s selection-bookmark approach is a serious later refinement target

#### Collaboration

- `collab` is its own package
- unconfirmed local steps are tracked separately
- remote changes are rebased through explicit collab state in [collab.ts](/Users/zbeyens/git/prosemirror/collab/src/collab.ts)
- collaboration tells history to preserve items

Classification:

- `adopt-later-for-slate-v2`

Reason:

- strong evidence for a future dedicated collaboration package or seam
- not something to fold into the current history proof too early

#### Clipboard / external formats

- clipboard lives in `view`, not in core state
- serialization and parsing are explicit functions in [clipboard.ts](/Users/zbeyens/git/prosemirror/view/src/clipboard.ts)
- ProseMirror uses explicit internal metadata (`data-pm-slice`) rather than accidental format leakage
- there are explicit transform hooks:
  - `transformCopied`
  - `clipboardSerializer`
  - `clipboardTextSerializer`
  - `transformPastedText`
  - `clipboardTextParser`
  - `clipboardParser`
  - `transformPastedHTML`
  - `transformPasted`

Classification:

- `adopt-now-for-slate-v2`

Reason:

- this is the strongest direct reference for the next missing clipboard-boundary proof

#### Plugin / extension model

- state plugins can define fields in [plugin.ts](/Users/zbeyens/git/prosemirror/state/src/plugin.ts)
- there are explicit hooks:
  - `filterTransaction`
  - `appendTransaction`
  - state field `init` / `apply`
  - `view`

Classification:

- split:
  - `adopt-later-for-slate-v2`
  - `better-fit-for-plate-v2`

Reason:

- the state/plugin contract is one of the strongest things here
- but a lot of the richer extension story is more useful for future Plate packaging than the first stable Slate v2 core

#### Layout / composition / pagination

- no strong special advantage here

Classification:

- `interesting-but-reject`

#### Summary

ProseMirror is the strongest external validation of the package split and the strongest direct reference for the next clipboard-boundary seam.

It does not change our React runtime direction.
It does make the package architecture look even more correct.

### Lexical

Status: `completed`

#### Core engine

- Lexical splits the editor into:
  - core engine in `lexical`
  - React integration in `@lexical/react`
  - history in `@lexical/history`
  - clipboard in `@lexical/clipboard`
  - selection in `@lexical/selection`
  - extension system in `@lexical/extension`
  - headless helpers in `@lexical/headless`
- Editor state is explicitly immutable after commit in [LexicalEditorState.ts](/Users/zbeyens/git/lexical/packages/lexical/src/LexicalEditorState.ts)
- Updates use a double-buffering model in [LexicalEditorState.ts](/Users/zbeyens/git/lexical/packages/lexical/src/LexicalEditorState.ts) and [LexicalUpdates.ts](/Users/zbeyens/git/lexical/packages/lexical/src/LexicalUpdates.ts)
- Core owns its own reconciler in [LexicalReconciler.ts](/Users/zbeyens/git/lexical/packages/lexical/src/LexicalReconciler.ts)

Classification:

- `adopt-later-for-slate-v2`

Reason:

- this strongly validates immutable committed state and explicit package seams
- but Lexical’s bespoke reconciler and node model are too far from our locked `slate-v2` constraints to copy directly

#### React runtime

- `@lexical/react` is a dedicated package, not an afterthought
- `LexicalComposer` creates the editor and owns provider setup in [LexicalComposer.tsx](/Users/zbeyens/git/lexical/packages/lexical-react/src/LexicalComposer.tsx)
- update subscriptions are exposed via [useLexicalSubscription.tsx](/Users/zbeyens/git/lexical/packages/lexical-react/src/useLexicalSubscription.tsx)
- `OnChangePlugin` filters update notifications by tags and dirty sets in [LexicalOnChangePlugin.ts](/Users/zbeyens/git/lexical/packages/lexical-react/src/LexicalOnChangePlugin.ts)

Classification:

- split:
  - `adopt-now-for-slate-v2`
  - `interesting-but-reject`

Reason:

- adopt now:
  - dedicated runtime package
  - explicit update payloads
  - explicit dirty/tag filtering
- reject:
  - `useLexicalSubscription` still uses `useState` plus `useLayoutEffect`, not `useSyncExternalStore`
  - that is good enough for Lexical, but weaker than our chosen React `19.2+` renderer direction

#### History

- `@lexical/history` is its own package
- history decisions are tag-aware and change-type-aware in [index.ts](/Users/zbeyens/git/lexical/packages/lexical-history/src/index.ts)
- it uses explicit update tags like `HISTORY_MERGE_TAG`, `HISTORY_PUSH_TAG`, and `HISTORIC_TAG`

Classification:

- `adopt-later-for-slate-v2`

Reason:

- our current `slate-history-v2` proof is intentionally smaller
- but Lexical’s explicit tag vocabulary is a very good refinement target for later transaction metadata

#### Clipboard / external formats

- `@lexical/clipboard` is its own package
- clipboard import/export is explicit and layered in [clipboard.ts](/Users/zbeyens/git/lexical/packages/lexical-clipboard/src/clipboard.ts)
- it prioritizes internal format, then HTML, then plain text
- it has explicit insertion hooks and update behavior

Classification:

- `adopt-now-for-slate-v2`

Reason:

- this is exactly the seam we still need to prove next
- Lexical, like ProseMirror and Edix, validates giving clipboard its own explicit boundary

#### Selection

- `@lexical/selection` is its own package
- selection helpers are not blurred into React or clipboard ownership

Classification:

- `adopt-later-for-slate-v2`

Reason:

- our current `slate-dom-v2` proof already split DOM selection ownership correctly
- Lexical strengthens the case for selection being treated as its own serious subsystem

#### Extension / plugin model

- `@lexical/extension` is its own package
- `LexicalBuilder` composes extensions and dependencies explicitly in [LexicalBuilder.ts](/Users/zbeyens/git/lexical/packages/lexical-extension/src/LexicalBuilder.ts)
- extension dependencies, peer dependencies, and conflicts are first-class

Classification:

- split:
  - `adopt-later-for-slate-v2`
  - `better-fit-for-plate-v2`

Reason:

- the dependency-aware extension graph is very strong
- but the richer package-builder ergonomics feel more relevant to a future `plate-v2` than to the next core Slate package seam

#### Headless

- `@lexical/headless` is a real package, not a side effect

Classification:

- `better-fit-for-plate-v2`

Reason:

- useful as a product/package precedent
- not a reason to back away from our explicit React-perfect runtime choice

#### Summary

Lexical is the strongest validation of:

- dedicated runtime packages
- immutable editor state
- explicit update semantics
- clipboard and history as real packages

It does **not** beat the current `slate-react-v2` decision to use `useSyncExternalStore` and React `19.2+` as the target runtime model.

### Tiptap

Status: `completed`

#### Core engine

- `@tiptap/core` is a ProseMirror wrapper, not a fresh editor engine, in [Editor.ts](/Users/zbeyens/git/tiptap/packages/core/src/Editor.ts)
- `@tiptap/pm` repackages the ProseMirror module set behind one dependency surface in [package.json](/Users/zbeyens/git/tiptap/packages/pm/package.json)

Classification:

- `better-fit-for-plate-v2`

Reason:

- this is a strong packaging and DX move
- it is not a reason to redesign `slate-v2` core around someone else’s wrapper

#### DOM bridge

- DOM ownership still comes from ProseMirror `EditorView`, just behind Tiptap’s wrapper in [Editor.ts](/Users/zbeyens/git/tiptap/packages/core/src/Editor.ts)

Classification:

- `interesting-but-reject`

Reason:

- useful to confirm Tiptap is not winning through a different browser bridge
- no new structural lesson beyond what ProseMirror already taught us

#### React runtime

- `@tiptap/react` is a dedicated runtime package in [package.json](/Users/zbeyens/git/tiptap/packages/react/package.json)
- `useEditor` uses an instance manager plus `useSyncExternalStore` shim in [useEditor.ts](/Users/zbeyens/git/tiptap/packages/react/src/useEditor.ts)
- `useEditorState` uses `useSyncExternalStoreWithSelector` in [useEditorState.ts](/Users/zbeyens/git/tiptap/packages/react/src/useEditorState.ts)

Classification:

- split:
  - `adopt-later-for-slate-v2`
  - `interesting-but-reject`

Reason:

- dedicated runtime package plus selector subscriptions are the right general direction
- the exact lifecycle shape still carries SSR and React 17/18/19 compatibility baggage that we explicitly do not want in `slate-react-v2`

#### History

- no distinct history architecture beyond wrapped ProseMirror packages

Classification:

- `interesting-but-reject`

#### Clipboard / external formats

- no distinct clipboard boundary lesson beyond the underlying ProseMirror stack

Classification:

- `interesting-but-reject`

#### Plugin / extension model

- the real value is the extension surface:
  - `Extension` base class in [Extension.ts](/Users/zbeyens/git/tiptap/packages/core/src/Extension.ts)
  - `ExtensionManager` composition of commands, keymaps, input rules, paste rules, ProseMirror plugins, node views, and dispatch middleware in [ExtensionManager.ts](/Users/zbeyens/git/tiptap/packages/core/src/ExtensionManager.ts)

Classification:

- split:
  - `adopt-later-for-slate-v2`
  - `better-fit-for-plate-v2`

Reason:

- there is real value here for later Slate middleware and extension seams
- but the richer extension ergonomics, catalog shape, and wrapper-first DX belong much more to future `plate-v2`

#### Product / DX / packaging

- Tiptap’s strongest move is productization:
  - single-dependency PM wrapper
  - clean React package
  - huge extension catalog
  - easy “headless but batteries included” adoption path

Classification:

- `better-fit-for-plate-v2`

Reason:

- this is exactly the kind of pressure that should sharpen `plate-v2`
- it is why Tiptap feels fast to adopt, even though the underlying engine story is still ProseMirror

#### Layout / composition / pagination

- nothing special here

Classification:

- `interesting-but-reject`

#### Summary

Tiptap is fast mostly because it packages ProseMirror extremely well.

That matters a lot for `plate-v2`.
It matters much less for `slate-v2`, except as a reminder not to confuse product packaging wins with engine/runtime wins.

### Pretext

Status: `completed`

#### Core engine

- Pretext is not an editor core. It is a deterministic text-measurement primitive with an opaque prepared handle and a hot-path layout phase in [layout.ts](/Users/zbeyens/git/pretext/src/layout.ts)
- the split is explicit:
  - `prepare(...)` for one-time segmentation and measurement
  - `layout(...)` for cheap repeated width/height calculation

Classification:

- `adopt-later-for-slate-v2`
- `better-fit-for-plate-v2`

Reason:

- the two-phase prepared-handle model is strong
- but its strongest fit is future layout, pagination, and virtualization layers rather than the immediate `slate-v2` package plan

#### DOM bridge

- Pretext side-steps DOM reflow-driven measurement entirely in [README.md](/Users/zbeyens/git/pretext/README.md)
- it uses canvas measurement plus cached calibration instead of `getBoundingClientRect` roulette

Classification:

- `better-fit-for-plate-v2`

Reason:

- this is excellent evidence for keeping measurement outside browser-layout hot paths
- but it sharpens future layout systems more than the current `slate-dom-v2` work

#### React runtime

- no React runtime model here

Classification:

- `interesting-but-reject`

#### History

- nothing relevant

Classification:

- `interesting-but-reject`

#### Clipboard / external formats

- nothing relevant

Classification:

- `interesting-but-reject`

#### Plugin / extension model

- nothing relevant

Classification:

- `interesting-but-reject`

#### Layout / composition / pagination

- `prepareWithSegments`, `layoutWithLines`, `walkLineRanges`, and `layoutNextLine` expose deterministic line-fitting primitives in [README.md](/Users/zbeyens/git/pretext/README.md)
- Pretext explicitly calls out virtualization, shrink-wrap layout, scroll-anchor stability, and browser-free layout verification as first-class use cases

Classification:

- split:
  - `adopt-later-for-slate-v2`
  - `better-fit-for-plate-v2`

Reason:

- the deterministic measurement model is genuinely useful for future large-doc rendering and layout hints
- but the strongest fit is a future page/layout layer above Slate, not the current `slate-v2` runtime stack

#### Summary

Pretext is a serious measurement primitive.

It strengthens the case for deterministic layout math above the editor, not inside it.
Useful later for virtualization and layout-heavy systems.
Not a reason to distort the current `slate-v2` package plan.

### Premirror

Status: `completed`

#### Core engine

- Premirror keeps ProseMirror as document truth and derives layout as a separate deterministic model in [design-proposal.md](/Users/zbeyens/git/premirror/docs/design-proposal.md)
- the core contracts make that split explicit:
  - `UnmeasuredDocumentSnapshot`
  - `MeasuredDocumentSnapshot`
  - `LayoutInput`
  - `LayoutOutput`
  - `MappingIndex`
  in [packages/core/src/index.ts](/Users/zbeyens/git/premirror/packages/core/src/index.ts)

Classification:

- `adopt-now-for-slate-v2`

Reason:

- this is the strongest evidence yet that pagination and composition should stay above editor truth instead of leaking into the editor core

#### DOM bridge

- the ProseMirror adapter owns snapshot extraction, run measurement, invalidation, commands, and schema extensions in [packages/prosemirror-adapter/src/index.ts](/Users/zbeyens/git/premirror/packages/prosemirror-adapter/src/index.ts)
- invalidation is explicit plugin state, not hand-wavy rerender hope

Classification:

- split:
  - `adopt-later-for-slate-v2`
  - `better-fit-for-plate-v2`

Reason:

- explicit snapshot extraction and invalidation discipline is valuable
- but the full adapter stack belongs to a higher page/layout layer, not the immediate `slate-dom-v2` scope

#### React runtime

- the React layer runs `snapshot -> measure -> compose` in `usePremirrorEngine` and renders page viewports plus projected selections in [packages/react/src/index.tsx](/Users/zbeyens/git/premirror/packages/react/src/index.tsx)
- fragments are expected to be visually positioned by decorations while a single `contenteditable` root stays authoritative

Classification:

- `better-fit-for-plate-v2`

Reason:

- this is a product-layer paged renderer
- it is useful as future Plate architecture pressure, not as a better base runtime for `slate-react-v2`

#### History

- nothing materially stronger than what ProseMirror already taught us

Classification:

- `interesting-but-reject`

#### Clipboard / external formats

- not the interesting seam here

Classification:

- `interesting-but-reject`

#### Plugin / extension model

- the runtime bundle exposes plugins, keymaps, commands, and schema extensions from the adapter in [packages/prosemirror-adapter/src/index.ts](/Users/zbeyens/git/premirror/packages/prosemirror-adapter/src/index.ts)

Classification:

- `better-fit-for-plate-v2`

Reason:

- strong precedent for feature bundles layered above document truth
- better fit for future Plate-owned layout products than immediate Slate core

#### Layout / composition / pagination

- the composer package is the point: pagination, manual page breaks, widow/orphan control, mapping, frames, and obstacles in [packages/composer/src/index.ts](/Users/zbeyens/git/premirror/packages/composer/src/index.ts)
- the README architecture is clean:
  - `EditorState -> snapshot -> measure (pretext) -> compose -> LayoutOutput`
- that is exactly the right shape for page-aware editing systems

Classification:

- `better-fit-for-plate-v2`

Reason:

- Premirror is the clearest proof so far that page composition is its own engine
- this belongs above `slate-v2`, likely in future `plate-v2` or a sibling layout stack

#### Summary

Premirror is not “better Slate.”

It is the best evidence so far that page-aware editing should be built as:

- document truth
- measurement
- composition
- rendering / overlays

That architecture sharpens the `slate-v2` plan by keeping pagination out of the core, and it sharpens the future `plate-v2` plan by giving it a serious high-layer target shape.

### use-editable

Status: `completed`

#### Core engine

- `use-editable` is not an engine. It is a tiny hook that turns a single `contenteditable` element into a text surface in [useEditable.ts](/Users/zbeyens/git/use-editable/src/useEditable.ts)
- that minimalism is the point

Classification:

- `better-fit-for-plate-v2`

Reason:

- this is a useful lower bound for lightweight surfaces
- it is not a serious candidate to replace the main `slate-v2` model/runtime stack

#### DOM bridge

- the hook watches DOM mutations, rolls them back, then reports plain text plus caret position to React in [useEditable.ts](/Users/zbeyens/git/use-editable/src/useEditable.ts)
- caret and selection are rebuilt with explicit `Range` helpers instead of model-backed mapping

Classification:

- `interesting-but-reject`

Reason:

- clever technique
- but it depends on DOM-owned truth and mutation rollback, which cuts directly against the locked `slate-v2` constraints

#### React runtime

- runtime ownership is plain hook state plus `useLayoutEffect`, not an external-store model, in [useEditable.ts](/Users/zbeyens/git/use-editable/src/useEditable.ts)
- the returned `Edit` handle is explicitly imperative: `update`, `insert`, `move`, `getState`

Classification:

- `interesting-but-reject`

Reason:

- nice for a tiny API
- wrong shape for the React-perfect `slate-react-v2` target

#### History

- undo/redo is a local time-window stack inside the hook in [useEditable.ts](/Users/zbeyens/git/use-editable/src/useEditable.ts)

Classification:

- `interesting-but-reject`

Reason:

- good enough for a tiny text surface
- nowhere near the transaction-aware history seam we want

#### Clipboard / external formats

- paste is plain text only in [useEditable.ts](/Users/zbeyens/git/use-editable/src/useEditable.ts)

Classification:

- `interesting-but-reject`

#### Plugin / extension model

- there is no real plugin model

Classification:

- `interesting-but-reject`

#### Product / DX / packaging

- the surface is tiny and direct:
  - one hook
  - one ref
  - one `onChange`
  - one small imperative handle
- the README makes the point cleanly in [README.md](/Users/zbeyens/git/use-editable/README.md)

Classification:

- `better-fit-for-plate-v2`

Reason:

- this is strong pressure for future Plate taxonomy:
  not every editable deserves the full Slate stack
- some code/plaintext/token-input experiences should probably live in lighter product surfaces

#### Layout / composition / pagination

- nothing relevant

Classification:

- `interesting-but-reject`

#### Summary

`use-editable` is a useful lower bound and a useful warning.

It shows how small a React editing surface can be.
It also shows exactly why that trickbox should not be mistaken for the main architecture of `slate-v2`.

### rich-textarea

Status: `completed`

#### Core engine

- `rich-textarea` is not an editor engine. It is a decorated native textarea surface with a mirrored render layer in [textarea.tsx](/Users/zbeyens/git/rich-textarea/src/textarea.tsx)
- that is the right level of ambition for many lightweight text experiences

Classification:

- `better-fit-for-plate-v2`

Reason:

- this is a strong product-surface pattern for plaintext-plus-decoration editors
- it is not a reason to distort the model-first `slate-v2` stack

#### DOM bridge

- the DOM bridge is intentionally boring:
  - real `<textarea>` for input truth in [textarea.tsx](/Users/zbeyens/git/rich-textarea/src/textarea.tsx)
  - mirrored backdrop layer for highlights and decorations in [textarea.tsx](/Users/zbeyens/git/rich-textarea/src/textarea.tsx)
  - `ResizeObserver` and cloned mouse events in [observer.ts](/Users/zbeyens/git/rich-textarea/src/observer.ts)
- this avoids contenteditable chaos completely

Classification:

- `better-fit-for-plate-v2`

Reason:

- for plain text with overlays, textarea-plus-backdrop is cleaner than contenteditable trickery
- useful lesson for lightweight Plate surfaces, not for Slate rich-document core

#### React runtime

- runtime is ordinary React state plus controlled/uncontrolled textarea props in [textarea.tsx](/Users/zbeyens/git/rich-textarea/src/textarea.tsx)
- selection is tracked separately and exposed as caret geometry in [selection.ts](/Users/zbeyens/git/rich-textarea/src/selection.ts)

Classification:

- `interesting-but-reject`

Reason:

- good for a tiny surface
- not remotely the right runtime shape for `slate-react-v2`

#### History

- no serious history subsystem

Classification:

- `interesting-but-reject`

#### Clipboard / external formats

- no separate clipboard architecture; it rides native textarea behavior

Classification:

- `interesting-but-reject`

#### Plugin / extension model

- extension model is renderer-first:
  - `children` render function
  - regex renderers
  - custom highlight renderer helpers
  in [index.ts](/Users/zbeyens/git/rich-textarea/src/index.ts)

Classification:

- `better-fit-for-plate-v2`

Reason:

- this is the right kind of API for tiny decorated textareas
- useful as a future lightweight Plate surface pattern

#### Product / DX / packaging

- the package is small, SSR-aware, form-friendly, and tries very hard to preserve native textarea behavior in [README.md](/Users/zbeyens/git/rich-textarea/README.md)
- that restraint is part of why it is good

Classification:

- `better-fit-for-plate-v2`

Reason:

- this is a strong benchmark for “small but useful” editing products
- it sharpens future `plate-v2` taxonomy more than `slate-v2` architecture

#### Layout / composition / pagination

- nothing relevant

Classification:

- `interesting-but-reject`

#### Summary

`rich-textarea` is the strongest lightweight-surface reference so far.

Its lesson is simple:

- if the problem is plaintext plus decoration, use a native text control and overlay the visuals
- do not drag the full Slate stack into that problem unless you actually need rich-document semantics

### markdown-editor

Status: `completed`

#### Core engine

- `markdown-editor` is not an engine. It is a markdown-specific contenteditable projection layer over a string model in [MarkdownEditor.tsx](/Users/zbeyens/git/markdown-editor/src/MarkdownEditor/MarkdownEditor.tsx)
- markdown is parsed with `unified` and turned into React nodes in [MarkdownCompiler.ts](/Users/zbeyens/git/markdown-editor/src/MarkdownEditor/MarkdownCompiler.ts)

Classification:

- `interesting-but-reject`

Reason:

- narrow markdown-focused projection can be useful
- but this implementation is too brittle to treat as an architecture target

#### DOM bridge

- the DOM bridge is homemade contenteditable management with manual node counting, caret mapping, drag/drop handling, and selection math in [CustomEditor.tsx](/Users/zbeyens/git/markdown-editor/src/CustomEditor/CustomEditor.tsx)
- the README openly documents structural constraints:
  - custom components break if character counts change
  - `display:block` breaks layout assumptions
  in [README.md](/Users/zbeyens/git/markdown-editor/README.md)

Classification:

- `interesting-but-reject`

Reason:

- this is exactly the kind of fragile DOM-owned projection stack we should avoid

#### React runtime

- runtime is local state, local event bus control, and contenteditable event interception in [CustomEditor.tsx](/Users/zbeyens/git/markdown-editor/src/CustomEditor/CustomEditor.tsx)
- external control via `use-local-event` is interesting, but the core runtime is still imperative and DOM-driven

Classification:

- split:
  - `better-fit-for-plate-v2`
  - `interesting-but-reject`

Reason:

- the tiny external command/event seam is mildly interesting for lightweight surfaces
- the underlying runtime shape is not something we should emulate for `slate-v2`

#### History

- undo/redo is a local string snapshot array in [CustomEditor.tsx](/Users/zbeyens/git/markdown-editor/src/CustomEditor/CustomEditor.tsx)

Classification:

- `interesting-but-reject`

Reason:

- fine for a tiny toy editor
- not serious enough to influence `slate-history-v2`

#### Clipboard / external formats

- paste and cut are handled manually as plain text in [CustomEditor.tsx](/Users/zbeyens/git/markdown-editor/src/CustomEditor/CustomEditor.tsx)

Classification:

- `interesting-but-reject`

#### Plugin / extension model

- markdown rendering is customizable via markdown-component overrides in [MarkdownCompiler.ts](/Users/zbeyens/git/markdown-editor/src/MarkdownEditor/MarkdownCompiler.ts)

Classification:

- `better-fit-for-plate-v2`

Reason:

- markdown-specific rendering customization is a useful product concern
- but the implementation is too tightly coupled to fragile positional assumptions to borrow much from it

#### Product / DX / packaging

- the public surface is simple:
  - `MarkdownEditor`
  - optional controlled mode
  - optional external command event
- but the caveats are loud enough that the ergonomics are less impressive than they first look in [README.md](/Users/zbeyens/git/markdown-editor/README.md)

Classification:

- `interesting-but-reject`

Reason:

- simplicity is nice
- hidden fragility is not

#### Layout / composition / pagination

- nothing relevant

Classification:

- `interesting-but-reject`

#### Summary

`markdown-editor` is more warning than blueprint.

Useful lesson:

- if a lightweight editor depends on manual DOM-position accounting and character-count invariants, it will get brittle fast

So the lightweight-surface lane should bias toward `rich-textarea`-style native-control overlays, not markdown-specific contenteditable projection hacks.

### TanStack DB

Status: `completed`

#### Core engine

- `@tanstack/db` is a normalized collection store with explicit query builder, live-query collections, indexes, and optimistic mutation seams in [index.ts](/Users/zbeyens/git/db/packages/db/src/index.ts)
- live queries compile into a differential-dataflow-style pipeline via `@tanstack/db-ivm` in [compiler/index.ts](/Users/zbeyens/git/db/packages/db/src/query/compiler/index.ts) and [db-ivm/README.md](/Users/zbeyens/git/db/packages/db-ivm/README.md)
- index ownership is first-class, not incidental, in [collection/indexes.ts](/Users/zbeyens/git/db/packages/db/src/collection/indexes.ts)

Classification:

- split:
  - `adopt-later-for-slate-v2`
  - `better-fit-for-plate-v2`

Reason:

- this is the strongest projection/indexing import so far
- but it fits best as a higher semantic layer over editor truth, not as a replacement for `slate-v2` core

#### DOM bridge

- no DOM bridge lesson here

Classification:

- `interesting-but-reject`

#### React runtime

- framework bindings are thin packages over one core store, with `useSyncExternalStore`-style live-query subscription in [useLiveQuery.ts](/Users/zbeyens/git/db/packages/react-db/src/useLiveQuery.ts)

Classification:

- split:
  - `adopt-later-for-slate-v2`
  - `better-fit-for-plate-v2`

Reason:

- good precedent for derived projection hooks over a non-React core
- but the immediate value is future semantic/query layers more than the base editor runtime

#### History

- optimistic writes and transaction seams exist, but they are not a replacement for editor undo/redo history

Classification:

- `interesting-but-reject`

#### Clipboard / external formats

- nothing relevant

Classification:

- `interesting-but-reject`

#### Plugin / extension model

- this is less “plugin system” and more “extensible data plane”:
  collection utils, persistence adapters, framework wrappers, and query collections

Classification:

- `better-fit-for-plate-v2`

Reason:

- useful for future semantic-service composition
- not a reason to turn Slate core into a client database

#### Product / DX / packaging

- the package split is clean:
  - core DB
  - React/Solid/Vue bindings
  - query-backed collections
  - persistence adapters
- that is excellent product architecture pressure

Classification:

- `better-fit-for-plate-v2`

Reason:

- this is the strongest current model for how a future Plate semantic layer could stay modular without becoming mush

#### Layout / composition / pagination

- nothing relevant

Classification:

- `interesting-but-reject`

#### Summary

TanStack DB is the best current reference for:

- normalized client collections
- explicit indexes
- incremental derived views
- thin framework bindings over one core

That is powerful future `plate-v2` pressure.
For `slate-v2`, it is only a later import for derived projection/index layers, not a core architectural pivot.

### urql

Status: `completed`

#### Core engine

- `urql` is a client/event hub built around keyed operations and results in [client.ts](/Users/zbeyens/git/urql/packages/core/src/client.ts)
- its core architecture is explicit:
  bindings -> client -> exchanges
  in [architecture.md](/Users/zbeyens/git/urql/docs/architecture.md)

Classification:

- split:
  - `adopt-later-for-slate-v2`
  - `better-fit-for-plate-v2`

Reason:

- the event-hub plus pipeline shape is excellent
- but it is a service/execution architecture import, not an editor-core import

#### DOM bridge

- no DOM bridge lesson here

Classification:

- `interesting-but-reject`

#### React runtime

- framework bindings are intentionally thin wrappers over `@urql/core`, as seen in [index.ts](/Users/zbeyens/git/urql/packages/react-urql/src/index.ts)

Classification:

- `better-fit-for-plate-v2`

Reason:

- strong packaging precedent
- not enough by itself to change `slate-react-v2`

#### History

- nothing relevant

Classification:

- `interesting-but-reject`

#### Clipboard / external formats

- nothing relevant

Classification:

- `interesting-but-reject`

#### Plugin / extension model

- exchanges are the real architectural prize:
  - explicit composition in [compose.ts](/Users/zbeyens/git/urql/packages/core/src/exchanges/compose.ts)
  - cache as one exchange in [cache.ts](/Users/zbeyens/git/urql/packages/core/src/exchanges/cache.ts)
  - authoring rules in [authoring-exchanges.md](/Users/zbeyens/git/urql/docs/advanced/authoring-exchanges.md)
- the strongest specific lessons are:
  - explicit forward/return contracts
  - do not drop unknown operations
  - synchronous-first, asynchronous-last ordering

Classification:

- split:
  - `adopt-later-for-slate-v2`
  - `better-fit-for-plate-v2`

Reason:

- this is one of the best middleware/exchange references for future service and extension architecture
- later Slate middleware could learn from it, but the biggest win is future Plate semantic pipelines

#### Product / DX / packaging

- `urql` keeps one core and many thin wrappers, with optional exchanges and optional normalized cache
- Graphcache’s normalized caching model in [normalized-caching.md](/Users/zbeyens/git/urql/docs/graphcache/normalized-caching.md) is also a useful reference for relation-aware client views

Classification:

- `better-fit-for-plate-v2`

Reason:

- this is strong evidence for layered optional capabilities instead of giant one-size-fits-all packages

#### Layout / composition / pagination

- nothing relevant

Classification:

- `interesting-but-reject`

#### Summary

`urql` is the best exchange-pipeline import so far.

The reusable lessons are:

- central client/event hub
- explicit operation/result pipeline
- optional exchanges instead of hard-coded behavior
- hard rules about ordering and forwarding

That should influence future semantic and extension architecture far more than base editor runtime.

### VS Code

Status: `completed`

#### Core engine

- VS Code keeps a serious text model separate from editor rendering in [textModel.ts](/Users/zbeyens/git/vscode/src/vs/editor/common/model/textModel.ts)
- it also has explicit model syncing to workers via [textModelSync.protocol.ts](/Users/zbeyens/git/vscode/src/vs/editor/common/services/textModelSync/textModelSync.protocol.ts) and [textModelSync.impl.ts](/Users/zbeyens/git/vscode/src/vs/editor/common/services/textModelSync/textModelSync.impl.ts)

Classification:

- split:
  - `adopt-later-for-slate-v2`
  - `better-fit-for-plate-v2`

Reason:

- the model-vs-service split is strong and reusable
- but this is much more relevant to future semantic/editor services than to the immediate `slate-v2` core

#### DOM bridge

- no reusable DOM bridge lesson here

Classification:

- `interesting-but-reject`

#### React runtime

- not relevant

Classification:

- `interesting-but-reject`

#### History

- not the useful seam here

Classification:

- `interesting-but-reject`

#### Clipboard / external formats

- not the useful seam here

Classification:

- `interesting-but-reject`

#### Plugin / extension model

- VS Code does not use one giant plugin bucket. It has per-feature registries in [languageFeatureRegistry.ts](/Users/zbeyens/git/vscode/src/vs/editor/common/languageFeatureRegistry.ts) and [languageFeaturesService.ts](/Users/zbeyens/git/vscode/src/vs/editor/common/services/languageFeaturesService.ts)
- providers are selected and prioritized by selector, score, exclusivity, and recency in [languageFeatureRegistry.ts](/Users/zbeyens/git/vscode/src/vs/editor/common/languageFeatureRegistry.ts)
- feature latency is treated as a first-class concern with adaptive debouncing in [languageFeatureDebounce.ts](/Users/zbeyens/git/vscode/src/vs/editor/common/services/languageFeatureDebounce.ts)
- extension host and main thread communication is explicit RPC, not ambient magic, in [extHost.protocol.ts](/Users/zbeyens/git/vscode/src/vs/workbench/api/common/extHost.protocol.ts)
- feature providers are adapted one-by-one in [extHostLanguageFeatures.ts](/Users/zbeyens/git/vscode/src/vs/workbench/api/common/extHostLanguageFeatures.ts)

Classification:

- split:
  - `adopt-later-for-slate-v2`
  - `better-fit-for-plate-v2`

Reason:

- the best lesson here is not “copy VS Code”
- it is:
  - use per-feature registries instead of one mega plugin interface
  - isolate host/process boundaries explicitly
  - adapt providers per feature type instead of forcing one abstraction to fit all

#### Product / DX / packaging

- the extension ecosystem is huge, but the reusable architectural point is that host/runtime boundaries are explicit and typed, not implicit

Classification:

- `better-fit-for-plate-v2`

Reason:

- this is strong pressure for a future Plate semantic layer and tool ecosystem
- not for reshaping `slate-v2` itself

#### Layout / composition / pagination

- nothing relevant

Classification:

- `interesting-but-reject`

#### Summary

VS Code is the strongest reference so far for semantic feature architecture inside a tool:

- text model stays separate
- services talk to the model, not the DOM
- providers are organized per feature
- cross-boundary communication is explicit RPC

That should influence future `plate-v2` semantics much more than `slate-v2` runtime.

### Language Server Protocol

Status: `completed`

#### Core engine

- LSP standardizes a separate-process semantic service model over JSON-RPC in [overview.md](/Users/zbeyens/git/language-server-protocol/_overviews/lsp/overview.md)
- the protocol is deliberately built on neutral primitives like document URIs, positions, ranges, edits, diagnostics, and capabilities, not language-specific AST contracts

Classification:

- `better-fit-for-plate-v2`

Reason:

- this is a semantic-service contract, not an editor core
- but it is the best current evidence for how to keep semantic tooling decoupled from editor internals

#### DOM bridge

- no DOM bridge lesson here

Classification:

- `interesting-but-reject`

#### React runtime

- not relevant

Classification:

- `interesting-but-reject`

#### History

- not relevant

Classification:

- `interesting-but-reject`

#### Clipboard / external formats

- not relevant

Classification:

- `interesting-but-reject`

#### Plugin / extension model

- LSP’s strongest reusable ideas are protocol discipline:
  - initialize exactly once and capability negotiation first in [initialize.md](/Users/zbeyens/git/language-server-protocol/_specifications/lsp/3.18/general/initialize.md)
  - document ownership and versioned sync in [didChange.md](/Users/zbeyens/git/language-server-protocol/_specifications/lsp/3.18/textDocument/didChange.md)
  - pull diagnostics for client-prioritized work in [pullDiagnostics.md](/Users/zbeyens/git/language-server-protocol/_specifications/lsp/3.18/language/pullDiagnostics.md)
  - lazy `completionItem/resolve` for expensive details in [completion.md](/Users/zbeyens/git/language-server-protocol/_specifications/lsp/3.18/language/completion.md)
  - cancellation and `ContentModified` handling for stale requests in [specification-3-14.md](/Users/zbeyens/git/language-server-protocol/_specifications/specification-3-14.md)

Classification:

- `better-fit-for-plate-v2`

Reason:

- this is the strongest protocol reference for semantic services:
  capability-negotiated, cancellable, version-aware, and latency-conscious

#### Product / DX / packaging

- the protocol makes semantic tooling portable across tools because it standardizes the seam, not the implementation

Classification:

- `better-fit-for-plate-v2`

Reason:

- that is exactly the right architectural instinct for future Plate semantic features

#### Layout / composition / pagination

- nothing relevant

Classification:

- `interesting-but-reject`

#### Summary

LSP’s main lesson is brutal and useful:

- semantic services should speak documents, positions, edits, diagnostics, and capabilities
- they should not speak your editor’s internal node model

That is a future `plate-v2` architecture lesson, not a reason to complicate `slate-v2`.

### EditContext API

Status: `completed`

#### Core engine

- EditContext is not an editor engine. It is a platform text-input primitive that decouples text input from the DOM view in [explainer.md](/Users/zbeyens/git/edit-context/explainer.md) and the current spec in [index.html](/Users/zbeyens/git/edit-context/index.html)

Classification:

- split:
  - `adopt-later-for-slate-v2`
  - `better-fit-for-plate-v2`

Reason:

- this is the strongest current platform candidate for future input decoupling
- but it is a DOM/input seam, not a replacement for editor architecture

#### DOM bridge

- the key platform shift is real:
  - text input updates `EditContext`, not the DOM
  - authors receive `textupdate` and `textformatupdate`
  - the DOM host still receives `beforeinput` intent
  in [explainer.md](/Users/zbeyens/git/edit-context/explainer.md)
- the current spec also says that when an `EditContext` is active the user agent must not directly update the DOM, fire `input`, or fire composition events on the host as a direct result of user action
- but caret navigation and selection remain tricky:
  - selection can stay in DOM space
  - authors may need to map DOM selection back into EditContext plain-text offsets

Classification:

- `adopt-later-for-slate-v2`

Reason:

- this is a real future candidate for `slate-dom-v2` input ownership
- but it does not magically solve selection, decoration anchors, or browser editing parity

#### React runtime

- not relevant

Classification:

- `interesting-but-reject`

#### History

- the explainer is explicit that editors are expected to provide their own undo in [explainer.md](/Users/zbeyens/git/edit-context/explainer.md)

Classification:

- `interesting-but-reject`

Reason:

- EditContext is not a history subsystem

#### Clipboard / external formats

- clipboard, drag/drop, spellcheck replacement, and other user-facing editing behaviors remain outside the core EditContext promise in [explainer.md](/Users/zbeyens/git/edit-context/explainer.md) and [open-issues.md](/Users/zbeyens/git/edit-context/open-issues.md)

Classification:

- `interesting-but-reject`

Reason:

- this does not replace the clipboard-boundary seam

#### Plugin / extension model

- nothing relevant

Classification:

- `interesting-but-reject`

#### Product / DX / packaging

- EditContext is strongest for custom surfaces that do not want DOM-owned text editing:
  canvas, custom layout, or specialized controls
- its main value is reducing hidden-textarea and contenteditable hacks if browser support matures

Classification:

- `better-fit-for-plate-v2`

Reason:

- future custom Plate surfaces could benefit a lot
- but current gaps around accessibility, selection, and platform coverage keep this out of the immediate core plan

#### Layout / composition / pagination

- nothing directly relevant

Classification:

- `interesting-but-reject`

#### Summary

EditContext is real and interesting.

It is not magic.
It can decouple text input from DOM mutation, but it does not replace:

- selection mapping
- spellcheck
- clipboard/drop
- accessibility work
- undo/history

So it is a later `slate-dom-v2` candidate and a future custom-surface tool, not the answer to today’s structural seams.

### Open UI Richer Text Fields

Status: `completed`

#### Core engine

- this is not an editor engine. It is a proposal bundle for making native `<input>` and `<textarea>` much more capable in [richer-text-fields.explainer.mdx](/Users/zbeyens/git/open-ui/site/src/pages/components/richer-text-fields.explainer.mdx)
- the four main themes are:
  - `InputRange`-style range extraction
  - CSS highlights on native text fields
  - suggestions / ghost text
  - input masking

Classification:

- `better-fit-for-plate-v2`

Reason:

- this is platform pressure for lightweight native text controls
- it does almost nothing for the main `slate-v2` rich-document core

#### DOM bridge

- the proposal is explicitly trying to keep developers away from overlay hacks and `contenteditable` for many richer text-field use cases in [richer-text-fields.explainer.mdx](/Users/zbeyens/git/open-ui/site/src/pages/components/richer-text-fields.explainer.mdx)
- the most interesting pieces are:
  - `InputRange()` as a boundary layer for live input/textarea values
  - CSS highlights on those ranges
  - suggestion APIs on `HTMLInputElement` / `HTMLTextAreaElement`
  - a presentational `mask` attribute

Classification:

- `better-fit-for-plate-v2`

Reason:

- if these land, many `rich-textarea`-style surfaces get dramatically simpler and sturdier

#### React runtime

- not relevant

Classification:

- `interesting-but-reject`

#### History

- the explainer is useful here mainly because it documents how current hacks break undo/redo

Classification:

- `better-fit-for-plate-v2`

Reason:

- this is a platform case for keeping presentational masking and suggestions out of app-managed text mutations when possible

#### Clipboard / external formats

- the masking section also calls out copy/paste and deletion problems in today’s multi-input and injected-character hacks

Classification:

- `better-fit-for-plate-v2`

Reason:

- native field primitives would preserve more sensible browser behavior than current workaround soup

#### Plugin / extension model

- nothing relevant

Classification:

- `interesting-but-reject`

#### Product / DX / packaging

- this is the strongest platform direction yet for the lightweight-surface lane:
  richer native inputs instead of forcing `contenteditable` or full editor frameworks

Classification:

- `better-fit-for-plate-v2`

Reason:

- exactly the right pressure for future small Plate-owned surfaces

#### Layout / composition / pagination

- nothing relevant

Classification:

- `interesting-but-reject`

#### Summary

Open UI Richer Text Fields strengthens one conclusion hard:

- if the job is still basically an input or textarea, the platform should grow there
- we should not default to `contenteditable` or Slate for every richer text interaction

So this is a strong future `plate-v2` action area, not a `slate-v2` architectural pivot.
