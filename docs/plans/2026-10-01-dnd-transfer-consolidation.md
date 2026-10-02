---
review_scopes:
  - dnd
  - clipboard
  - uploads
  - history
  - accessibility
review_basis:
  - 2026-10-01-dnd-transfer-interrogation
  - 2026-10-01-dnd-native-transfer-ownership
  - 2026-09-13-clipboard-transfer-convergence
  - 2026-09-23-history-session-effect-authoring-final
  - 2026-09-21-uploads-browser-provider-naming
  - 2026-09-12-accessibility-owner-boundaries
work_kind: implementation
---

# Drag and drop transfer consolidation

Status: done; phases 1, 2 and 3 kept. Its review record is `docs/research/probes/2026-10-01-dnd-transfer/review-record.md`.

## Outcome

One Plite action moves or copies blocks and text. Inside one document, across its views and roots, a drag moves. Between independent editors it copies. Every drag, the keyboard move and any custom driver call that action, so the transfer laws hold in one place. A move lands whole or refuses and keeps the source. Plate keeps list, column, table and Upload landing policy as middleware on two Plite reads. Copied UI keeps the handles, preview, indicator and block actions. React DnD, `DndPlugin` and the 15 public nouns of `platejs/dnd/react` are deleted, and block dragging uses the native drag events Plite already owns for text and files.

Phase 1 closes every open data-loss defect by routing today's two gestures through `editor.api.transfer` and the feature landing rules, before the non-drag move or the gesture change. The execution playbook is `.agents/playbooks/build.md`, run on the user's "go" after the cross-model review.

## Public API

A drag handle starts a native drag instead of wiring React DnD refs.

```ts before
const { handleRef, isAboutToDrag, isDragging } = useDraggable({
  element,
  multiplePreviewRef: previewRef,
  nodeRef,
});
const { dropLine } = useDropLine();
```

```ts after
onDragStart={(event) => {
  if (!editor.api.dom.drag.start(event.nativeEvent, { node: element })) {
    event.preventDefault();
  }
}}
const indicator = useDropIndicator();
```

A feature's drop rule becomes a landing rule or a veto that every drag, keyboard move and transfer call obeys.

```ts before
useDraggable({
  element,
  canDropNode: ({ dragEntry, dropEntry }) =>
    PathApi.equals(PathApi.parent(dragEntry[1]), PathApi.parent(dropEntry[1])),
});
```

```ts after
definePlugin('pinned', {
  contributions: [
    transferVeto.of(({ edge, target: [node] }) => edge === 'before' && node.pinned === true),
  ],
});
```

File drops move from `DndPlugin` to the Upload plugin.

```ts before
DndPlugin.configure({
  initialState: {
    onDropFiles: ({ dragItem, edge, editor, key }) => {
      editor.plugin(UploadPlugin).update.submit(
        dragItem.files,
        edge === 'before' ? { before: key } : { after: key }
      );
    },
  },
});
```

```ts after
UploadPlugin.configure({ initialState: { nativeDrop: true } });
```

Code moves blocks through one action that reports its outcome.

```ts before
editor.update.nodes.move({ at: dragPath, to });
```

```ts after
const outcome = editor.api.transfer.move({
  nodes: [editor.key(element)],
  to: { edge: 'after', key: editor.key(target) },
});
```

## Main changes

- One Plite `transfer` action owns every move and copy. A move inside one document lands whole in one undo step or refuses; a drop into another editor copies.
- The Editable owns block drag sessions. It resolves each `dragover` and `drop` through the transfer dry pass, paints a per-view indicator and settles its own session before plugin drag handlers run.
- List, column, table row and Upload rules are read middleware and vetoes on the transfer, replacing per-gesture React DnD callbacks.
- `platejs/dnd/react`, `DndPlugin`, its store and the `react-dnd` dependencies are deleted; the copied `dnd` kit renders handles, the action menus and the indicator.
- The move check runs on the corrected draft in the projection the update wrote, before the authored runtime turns it into a proposal or accepted content, through an internal draft guard in `packages/plitejs/src/core/public-state.ts`.

## Scope

In scope:

- the Plite transfer action, document identity, move admission, keyed block edges and the Plite repairs they need;
- the native drag strategy in `packages/plitejs/src/react/editable/`;
- `packages/platejs/src/dnd/`, the List, ColumnItem, TableRow and Upload landing rules, and the copied `dnd.tsx`, `column.tsx`, `table.tsx`, `media-image.tsx`, `media-video.tsx` and `block-menu.tsx`;
- the docs that teach React DnD or `DndKit`, the doctrine line on supplied DnD managers, and the `EDIT-DRAG-*` behavior family.

Out of scope: touch drag gestures, the Upload lifecycle, paste behavior, the selection model, text drag selection, Yjs move lowering, and anchor relocation across roots and inside moved text. The last three are open findings with owners.

User constraints: fix data-loss defects before the consolidation; the user owns commits.

## Hard laws

1. A move never loses content. Before publication, the transferred interval at the admitted edge must equal the payload, with the same text, marks, inline and block nodes, types and properties apart from keys. Every reachable named root must also hold the same contents after renames. Otherwise the update aborts and publishes nothing. A copy follows paste, landing what fits and reporting the loss with the existing `DataTransferDiagnostic`. Fitting never commits partial root state. Under collaboration this holds for local state (open finding 2). In a view that shows proposals, the guard checks the corrected content in that view's projection before the move becomes a proposal, so a lossy move records nothing.
2. Copy intent never removes the source. Intent is Alt on Apple platforms and Ctrl elsewhere, read from the native drop event; React DnD's `dropEffect` is ignored.
3. A read-only source view is never mutated, including one that turned read-only during the drag. A document-override view is always read-only.
4. Document identity is the runtime owner, the document override, the authored projection and the authoring intent. Equal identity is one document across all its roots, and a drag inside it moves. Independent editors and identity mismatches copy. A drop from another DOM document is external data on the paste path.
5. A transfer publishes one update and one undo entry. A refused transfer publishes nothing and leaves selection and focus alone.
6. A move acts on live content at drop. It resolves blocks by `NodeKey` and re-extracts text from an `inward` range anchor with `deletion: 'drop'` through the source view; a dropped or collapsed anchor counts as a vanished source. A remote edit elsewhere never turns a move into a copy. A source that no longer resolves refuses the move.
7. A move whose target lies inside its payload refuses. That covers the payload's reachable named roots and, for text, a point inside the dragged range.
8. A block move inside one root keeps node keys and anchors, so comments and in-flight Upload tasks follow it. A move across roots keeps persisted properties but mints keys and drops anchors, as today (open finding 1).
9. Only a transfer that saw its landing removes a source. `deleteByDrag` never deletes, so a text drag into another application copies.
10. Integration is per mounted Editable. It holds zero listeners before readiness and after detach, and at most the current five owned registrations per attached view (`docs/plans/2026-09-06-kit-owned-ai-and-dnd-lifetimes.md:265-267, 577-579`). A running drag adds only transient listeners, removed on every terminal path.

## Current state

The audit and its interrogation are reconciled in `docs/research/decisions/dnd-ownership.md`, whose defect table lists four working-tree fixes and six open defects. Measured claims cite `docs/research/probes/2026-10-01-dnd-transfer/substrate.result.txt` (T1-T14), rerun with the command at the top of `substrate.probe.ts`.

- **Two runtimes.** Plate's React DnD path moves within an editor with `tx.nodes.move`, inserts raw elements across editors and settles at drag end (`packages/platejs/src/dnd/react/useDndNode.ts:101-123, 584-636, 672`). Plite's native path deletes and inserts in one update, lands the slice captured at dragstart, and throws a private `REFUSED_MOVE` sentinel to refuse (`packages/plitejs/src/react/editable/clipboard-input-strategy.ts:123, 728-744, 749-933`).
- **Loss is invisible.** A `maxLength` cut reports success (T1). Range fits drop their lossy repairs (`packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2004`). Corrections run after the fit (`packages/plitejs/src/core/public-state.ts:9097-9130`). `at: Path` on an existing block merges text (T2).
- **`maxLength` counts a move twice.** The budget reads committed text (`packages/plitejs/src/core/insert-limit.ts:31-63`). A same-update move at the limit refuses its insert and still commits its removal (T12).
- **Abort works.** A spec built in a read and never applied publishes nothing (T3). A throw from a correction rolls the update back with no undo entry (T10). Plite's existing pre-publication guard, `registerEditorTransactionGuard` (`packages/plitejs/src/core/public-state.ts:1033`), runs after corrections, and its rejection publishes nothing and leaves no undo entry (T14).
- **Keys, anchors and ids.** `tx.nodes.move` keeps keys and anchors between siblings (T4) but collapses anchors when the parent changes (T13). Remove plus reinsert keeps keys and collapses anchors (T5). Slice extraction drops `copy: 'drop'` properties such as persisted ids (T11). An ancestor plus its descendant in one payload duplicates (T7). A card moved into its own body commits an unreachable cycle (T6).
- **Undo coupling is unbuildable.** A session history effect cannot share an update with content (T8), and a blocked effect-only entry wedges every earlier undo (T9).
- **Identity.** No predicate exists; `assertAnchorView` compares owner and root (`packages/plitejs/src/core/anchor.ts:107-115`). Views carry authored projection and intent (`packages/plitejs/src/interfaces/editor.ts:1841-1864`).
- **`deleteByDrag`** reaches `delete-fragment` through the expanded-selection branch of `getBeforeInputDeleteCommand` (`packages/plitejs/src/react/editable/editing-kernel.ts:716-726`) and the Android manager (`packages/plitejs/src/react/hooks/android-input-manager/android-input-manager.ts:850`). `packages/plitejs/test/react/model-input-strategy-contract.test.ts:836` asserts that it deletes.
- **Session.** `cross-editor-drag-session.ts` already keys sessions by `Document` and matches a per-drag token in `DataTransfer`.
- **Policy.** `canDropNode` in `column.tsx:46-55` and `table.tsx:796-822`, React DnD item types, `DndStorePlugin.read.dragEntries` for list families (`packages/platejs/src/dnd/react/internal/DndStorePlugin.ts:73-94`), and drop targets at root, column-child and cell-child depth (`apps/www/src/registry/components/editor/dnd.tsx:203-232`). Lists are flat (`listType` plus `indent`).
- **React DnD cost.** Two listeners per drag source and three per drop target (installed dependency `react-dnd-html5-backend@16.0.1`, `dist/HTML5BackendImpl.js:94-121`, not tracked by git). One shared `active` flag mounts a runtime on every block once a handle is hovered (`dnd.tsx:123,135,586`). The window `dragover` handler prevents default on every drag it sees, native text drags included (`HTML5BackendImpl.js:469-500`), which likely hides the text drop caret (inferred).
- **No non-drag move** for blocks, columns or rows. The block menu is a right-click `ContextMenu` disabled on touch (`block-menu.tsx:150, 162, 220-245`); the column handle suppresses clicks and the row handle's click selects the row (`column.tsx:96-104`, `table.tsx:868-875`).
- **Behavior law.** The protocol matrix names Notion as the block-drag authority (`docs/editor-behavior/editor-protocol-matrix.md:120`); `EDIT-DRAG-*` covers only container clamping (`docs/editor-behavior/markdown-editing-spec.md:1912-1917`).

## Decisions

### Target and comparison

`pstack:architect` ran three Opus runners on three whole shapes, and an Opus cross-judge scored them (same model family). The candidate designs lived in session scratch that a restart deleted; their decisive measurements are rerun in the probe.

| Candidate | Shape | Judge | Result |
| --- | --- | --- | --- |
| Native-first | Plite owns the native drag; React DnD deleted | 21 | Base |
| Command-first | One transfer command; pointer-event block drags with touch; native drag for text and files | 20 | Grafted |
| Gesture adapters | Transfer core; React DnD kept as the copied kit's block adapter | 17 | Rejected |

Native-first wins because native drag is the event system Plite already keeps for text, files and cross-editor drags, so block drags add no second gesture system. The pointer gesture pays only for Android touch drag, which has no consumer and no device proof. The cross-editor example uses a shared HTML5 manager. Phase 3 preserves its three-editor interaction with native sessions and removes the provider. No touch or custom backend consumer was found by `git grep TouchBackend` and the backend inventory below.

Grafted from command-first: one action for drags, keyboard and custom drivers; live content at drop; a hover dry pass so the indicator only paints admitted edges. Grafted from both others: fix data loss on today's gestures first.

### Public calls

```ts
import { transfer } from 'plitejs';

createEditor({ plugins: [transfer()] });   // headless; React editors install it through react()

editor.api.transfer.move({
  to: { key, edge: 'after' },   // or { point } for text, or 'previous' | 'next'
  from: sourceView,             // default: this editor
  nodes: [key1, key2],          // block payload; default: selected blocks
  range,                        // text payload in `from`, instead of `nodes`
}): TransferOutcome;
editor.api.transfer.copy({ to, from, nodes, range }): TransferOutcome;

type TransferOutcome =
  | { status: 'moved'; at: NodeSelection | Range }
  | { status: 'copied'; at: NodeSelection | Range;
      reason: 'intent' | 'read-only-source' | 'independent' | 'identity';
      diagnostics: readonly DataTransferDiagnostic[] }
  | { status: 'refused';
      reason: 'read-only-target' | 'policy' | 'schema' | 'lossy' | 'inside-source' | 'no-op' | 'source-missing' };

editorReads.transfer.source   // NodeSelection -> NodeSelection; List adds item families
editorReads.transfer.landing  // { payload, target, edge, relation, intent }
                              //   -> { admit: true; target?: { key; edge } } | { admit: false }
transferVeto                  // definePluginPoint; plugins contribute vetoes, and every
                              //   entry runs on the final target:
                              //   ({ from, payload, target, edge, relation, intent }, view) => boolean
                              //   (shipped: true refuses with 'policy'; open finding 7)
```

Publication follows Plite's plugin rule that an `api` factory returns an object published as `editor.api[plugin.name]` (`packages/plitejs/src/core/plugin.ts:1705-1727`), so the action is the `transfer` plugin's `move` and `copy` methods, not a callable group. `transfer()` is exported from `plitejs` with its `TransferPlugin` type. The `react()` plugin lists it as a dependency, because the Editable's native drop calls it, so every React editor has `editor.api.transfer` and its type. A headless editor installs `transfer()` for the keyboard move or a custom driver, and its absence is a type error. Plate's core plugin set includes it. The two reads and the veto point ship in phase 1 with the action, together with the four feature rules below, so no temporary policy exists.

`relation` is one document, `independent` or `identity`, and `intent` is `move` or `copy`, the method called after the Relation and intent step. `payload` is `{ kind: 'nodes'; nodes: readonly Element[]; parents }`, `{ kind: 'text' }` or `{ kind: 'files'; types }`, materialized so a foreign landing never resolves source keys in the target. `at` names the landed content. A drag selects it: a node selection for blocks, the landed range for text. A keyboard or menu move keeps the user's selection by key, so a caret stays a caret.

Phase 3 adds the native gesture:

```ts
editor.api.dom.drag.start(event, { node }): { previews; origin } | null;
editor.api.dom.resolveDropTarget(event | { clientX, clientY, from?, nodes? }):
  { key; edge; axis: 'x' | 'y' } | { point } | null;
useDropIndicator(): { key; edge; axis; line: DOMRectReadOnly } | null;   // one host per view
<Editable onDropResult={(outcome) => …} />
```

Copied UI, phase 3:

```tsx
<div
  draggable
  role="button"
  tabIndex={0}
  aria-label="Drag to move, or open block actions"
  onDragStart={(event) => {
    const drag = editor.api.dom.drag.start(event, { node: element });
    if (drag) event.dataTransfer.setDragImage(fillPreview(drag.previews), drag.origin.x, drag.origin.y);
  }}
  onClick={() => openBlockActions(element)}
  onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && openBlockActions(element)}
/>
```

Column, table row, image and video handles use the same `onDragStart`, with no orientation, item type or `canDropNode`. A custom driver calls `resolveDropTarget` and then `editor.api.transfer.move` or `.copy`, and inherits every law, because both run `transfer.source`, the landing chain and the vetoes on explicit input too. `onDropResult` reports every drop the Editable settles, including external data on the paste path, with the same diagnostics. `onPasteResult` stays for paste.

Internal: `DocumentIdentity`, keyed-edge placement, the move lifecycle and the move guard. Nothing goes through `plitejs/internal`. `slice.replace` keeps its public `at` contract.

### Transfer law

The `transfer` plugin lives in `packages/plitejs/src/core/transfer.ts`. Each call to `move` or `copy` opens exactly one update and returns an explicit outcome (`docs/vision/plite.md:300-303`). In order:

1. **Source.** Resolve `nodes` by key in `from`, or re-extract the text payload from its `inward` range anchor with `deletion: 'drop'`. Run `transfer.source`, drop any key whose ancestor is also in the payload, and sort by document order. A source that no longer resolves, including a dropped or collapsed text anchor, refuses with `source-missing`.
2. **Relation and intent.** One document when identity is equal (law 4); otherwise `independent`, or `identity` for a mismatch on one owner. The effective intent is `copy` when `copy` was called, the source view is read-only, or the relation is anything other than one document. Otherwise it is `move`.
3. **Landing.** Run the `transfer.landing` middleware chain. Middleware only widens or retargets. It may admit an edge the default refuses, or move the edge. A retarget runs the chain once more on the new edge, and a second retarget refuses with `policy`. The default, at the end of the chain, admits edges beside root-level blocks and any text point. Then every `transferVeto` contribution runs on the final edge, in plugin order, and any veto refuses with its reason. No middleware result can skip a veto.
4. **Plite checks** that middleware cannot override: the target view is editable; the payload is schema-legal at the final edge, else `schema`; and for a move, `inside-source` (law 7) and `no-op`.
5. **Build, in one update.** A block move inside one root chains `tx.nodes.move`: the first payload node goes to the edge, anchored on the non-payload target key, and each next node goes after the one before. Every other transfer fits a slice at the keyed edge or point. A move extracts the slice with a move lifecycle that keeps `copy: 'drop'` properties, and removes the source in the same update. A copy uses the copy lifecycle. The `maxLength` budget reads the draft, so a same-update removal frees its length.
6. **Move guard.** A move registers a one-shot guard with `registerEditorTransactionGuard`, which runs after corrections and before publication. The guard compares the transferred interval in the draft with the payload. For text that is the landed range extracted as a slice, so a move into an existing paragraph compares only what landed. For blocks it is the landed nodes. It also compares every reachable named root after renames. A mismatch rejects the update, which publishes nothing (T14), with `lossy`, or with `schema` when the content landed away from the admitted edge. A destination whose corrections rewrite moved content therefore refuses the move, and a copy stays available. A copy reports its fit and paste diagnostics instead.
7. **Outcome.** Return `at`, and select it for drags.

Hover runs steps 1 to 4 as a dry pass, so the indicator paints only edges that pass landing, vetoes and the Plite checks. `maxLength` and correction refusals are known only at drop and reach the copied UI through `onDropResult`. Scope the memo to the exact source and target views and roots. Its key includes the drag, target key and edge, effective intent, both current document identities, the source and target document versions, the plugin policy revision and both views' read-only state. Read each identity's override, authored projection and authoring intent at hover, not just at drag start. An authored-mode change can hide the source without a document commit, so versions alone cannot preserve admission. A browser fires `dragover` repeatedly under a still pointer, so a modifier change, remote edit or authored-mode change takes effect on the next one. Phase 1 uses the pass for React DnD's `canDrop`; phase 3 builds `resolveDropTarget` on it.

### Landing policy

Each feature owns its rule through `readMiddleware`, as `BaseTablePlugin.ts:2114` does for slice reads. Widening rules reproduce today's drop depth exactly (`dnd.tsx:203-232`).

| Owner | Read | Rule |
| --- | --- | --- |
| `BaseListPlugin` | `transfer.source` | expand list items with their indented family |
| `BaseListPlugin` | `transfer.landing` | retarget so the item after the landing gap is never deeper than the payload's first indent; `previous` and `next` step over whole families |
| `BaseColumnItemPlugin` | `transfer.landing` | a column-item payload lands beside a column item with the same parent on the `x` axis; a block payload lands beside blocks inside a column item of a root-level column group |
| `BaseTableRowPlugin` | `transfer.landing` | a row payload lands beside a row of the same table; a block payload lands beside blocks inside a cell of a root-level table |
| `BaseTableRowPlugin` | `transferVeto` | a row move where either row intersects a row span |
| `UploadPlugin` | `transfer.landing` | a `files` payload lands beside blocks the chain admits |
| `UploadPlugin` | `transferVeto` | a move of a payload holding an `upload` draft, unless it stays in one root, the only case where its `NodeKey` and task survive |

The DOM layer derives the axis. Siblings laid out side by side take `x`, and the rest take `y`.

### Gesture, hover, preview and autoscroll (phase 3)

`drag.start` is the handle's block-drag claimant. The Editable still opens its own session for a void block dragged by its body (open finding 7). It resolves membership through `transfer.source`, selects it, marks payload hosts with `data-editor-dragging`, captures inert preview clones and their origin (moved from `DndStorePlugin.api.prepareDrag`), and extends the existing per-`Document` session with the source view and keys. The session never holds a content snapshot. A read-only source view starts a copy-only drag (`effectAllowed: 'copy'`); the kit still hides handles in read-only views.

On `dragover`, the Editable reads the session marker from `DataTransfer.types`, since drag data is protected until drop. It walks from the event target through its `[data-editor-node-key]` hosts, innermost first, running the dry pass until an edge is admitted. A move-only refusal stops the walk instead of climbing to the parent. Over a gap it takes the nearest host inside the innermost container under the pointer. `dropEffect` follows copy intent. The view's indicator publishes only when the key, edge, axis or line changes. Autoscroll reuses `getDragAutoScrollTarget` (`packages/plitejs/src/react/editable/drag-auto-scroll-target.ts`), fed from `dragover`. It keeps scrolling under a still pointer and re-resolves the target after each scroll.

Terminal paths: drop, `dragend` on the source element and on the document, Editable detach, the next `dragstart`, and the first `pointermove` after a drag, which catches a source unmounted mid-drag whose `dragend` never arrives. A virtualized host that unmounts during autoscroll does not end the session, because the session is keyed. Every terminal path releases the session's text anchor. A drop first captures the session and marks its local token consumed before removing the active session. A repeated drop carrying that consumed token is handled without falling through to paste or Upload, and drag end cannot settle it again. Tokens originating in another DOM document still follow the external-data law. The settling call keeps the captured anchor alive for live source extraction and releases it in `finally`, whether the transfer succeeds, refuses or throws. Other terminal paths release it immediately. Leaving the window or a window blur suspends autoscroll and clears the indicator, and keeps the session for re-entry. Upload's `on.drop` yields when the session token matches.

### Files and Upload

DnD stops routing files. The Upload kit, not `DndKit`, sets `UploadPlugin.configure({ initialState: { nativeDrop: true } })`. Upload's `on.drop` calls `resolveDropTarget` with a `files` payload and submits at the keyed edge the indicator painted, the `{ key, edge }` placement its protocol already defines. A drop that the session or Upload resolved and refused is consumed. It never falls through to `insertData`, whose Upload interceptor would submit without landing policy. Copying an unresolved draft keeps the existing law, which gives the copy a fresh runtime identity (`docs/editor-behavior/editor-protocol-matrix.md:357`).

### Non-drag move

`editor.api.transfer.move({ to: 'previous' | 'next' })` moves the selected blocks, or the blocks containing the selection, past the nearest sibling edge the landing chain admits. Each copied handle opens its actions on click, tap, Enter or Space. The block handle offers Move up, Move down and Cut, the column handle Move left and Move right, and the row handle Move up and Move down. The right-click block menu gains the same items. `Mod+Shift+ArrowUp` and `Mod+Shift+ArrowDown` move the blocks containing the selection, as Notion does, the protocol matrix's block-drag authority. That gives up the native select-to-boundary shortcut, recorded as a matrix row. A successful move announces itself with `screenReaderAnnouncementEffect` in the move's commit; the effect skips history, so the move stays one update and one undo entry. A refused move changes nothing.

Handles stay visible for the selected block under `(hover: none)`, and their content no longer swaps on hover, so a first tap lands on stable content. With a desktop pointer this meets WCAG 2.2 SC 2.5.7. The Move items reorder, and Cut plus the platform paste moves content into another container or editor. Touch stays unverified (device gap).

### React DnD and touch

Delete React DnD from `platejs`, the registry and the app, with no backend option:

- the HTML5 backend runs on the same native events, so deleting it removes no device support;
- no `TouchBackend`, custom backend or application drag item exists in the repository (`git grep`). The only supplied manager is the shared HTML5 provider in the cross-editor example (`apps/www/src/app/(app)/examples/plite/_examples/plate-dnd-cross-editor.tsx:108-128`). It exists because React DnD allows one HTML5 backend per window. Native sessions are per `Document`, so phase 3 drops that provider and the example keeps its three editors;
- custom block sources write only `application/json {}` (`HTML5BackendImpl.js:367`), so no cross-window block drag is lost;
- the backend registers per block and prevents default on every native drag.

On touch, iOS uses native drag with a real-dimension preview, and every touch device has the handle actions. Native drag on Android is reported broken by CKEditor, which disables it, and by Lexical issue 3872. No device proof exists here. An app that needs a touch drag gesture writes a pointer driver: pointer events with `touch-action: none` on the handle, `resolveDropTarget` on move, `editor.api.transfer.move` or `.copy` on release.

Doctrine:

- Phase 1 extends `EDIT-DRAG-*` with the behavior it changes: copies between editors, live-content moves, refused lossy moves and a non-deleting `deleteByDrag`.
- Phase 1 extends `docs/vision/plite.md:317-320` through Best API's doctrine-repair method, because the action ships then: a move commits its whole content or nothing, and a copy follows paste reporting.
- Phase 3 replaces "Reuse an application-supplied DnD manager" in `docs/vision/plate.md:836-850` with the native transfer law and the custom-driver route. It keeps "Keep optional SDKs and backends out of generic editor components", which also governs AI.
- Phase 3 marks the supplied-manager and default-backend laws of `docs/plans/2026-09-06-kit-owned-ai-and-dnd-lifetimes.md` superseded.

### Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Transfer | Two runtimes | `transfer()` plugin with `move` and `copy`, a `react()` dependency | Plite | One owner per law | Phase 1, both gestures routed | Failing-first entry-point tests; type and runtime calls through raw Plite, React and Plate editors | High: history, selection, collaboration | rearchitect |
| Document identity | Editor equality; owner and root | Owner, override, projection, authoring intent | Plite | Laws 3, 4 | Phase 1 | Two-view and document-view tests | Medium | rearchitect |
| Independent editors | Move, settled at drag end | Copy | Plite | No third holder keeps the content: history is opt-in and the source can unmount; session-effect coupling fails (T8, T9) | Phase 1; cross-editor tests change | Cross-editor copy tests | Low | rearchitect |
| Move admission | Boolean; loss invisible | Interval and root-closure guard before publication | Plite | Law 1 | Phase 1 | Lossy-move tests with a dropping correction; text move into a paragraph | Medium | rearchitect |
| `maxLength` budget | Committed text | Draft text | Plite | T12 | Phase 1 | Move at the limit succeeds; `max-length-contract` green | Medium: every insert | rearchitect |
| Cross-parent anchors | Collapse (T13) | Mapped through `nodes.move` | Plite change model | Law 8 | Phase 1 | Root-to-blockquote anchor test | Medium: every `nodes.move` caller | rearchitect |
| Move lifecycle | Slices drop persisted ids (T11) | Keep `copy: 'drop'` props for moves | Plite | Ids survive moves | Phase 1 | Cross-root id test | Low | rearchitect |
| Freshness | Whole-document `children`; dragstart slice | Live keys; re-extracted text | Plite and Plate | Law 6 | Phase 1 | Edits inside, before and elsewhere | Low | cut |
| `deleteByDrag` | Deletes | No-op | Plite input | Law 9 | Phase 1 | Flipped model-input test | Low | cut |
| Refusal | `REFUSED_MOVE` throw | Abort inside `transfer` | Plite | Law 5 | Phase 1 | Refused transfer publishes nothing | Low | cut |
| Landing policy | `canDropNode`, item types, `dragEntries` | `transfer.source`, `transfer.landing`, `transferVeto` | List, ColumnItem, TableRow, Upload | Feature owns its rule | Phase 1, with the action | Policy tests per feature; a veto beats an admission | Low | move |
| Hover dry pass | Path math in `useDndNode` | Steps 1-4, memoized | Plite | Indicator never lies | Phase 1, as React DnD's `canDrop` | Hover Benchmark lane | Medium: O(payload) per hover | gate |
| Non-drag move | None | `transfer` to `previous`/`next`, handle actions, shortcut | Plite action, copied UI | WCAG 2.2 SC 2.5.7 | Phase 2 | Keyboard and pointer specs | Low | rearchitect |
| Gesture | React DnD for blocks | Native for all | Plite DOM | One event system | Phase 3 | Browser specs, five warm runs | High: hit testing, engines | gate |
| Indicator | Owner-shared store, per-block `useDropLine` | Per-view `useDropIndicator` | Plite React | O(1) hosts | Phase 3 | Benchmark receipt | Medium | gate |
| Drag paint | `isDragging`, body `dragging` class | `data-editor-dragging` | Plite DOM, copied CSS | One source | Phase 3 | Specs that read it, rewritten | Low | move |
| Preview | `prepareDrag` in Plate | `drag.start` previews and origin | Plite DOM | Mounted-view origin | Phase 3 | www preview-origin case | Low | move |
| Files | `DndPlugin.onDropFiles(monitor)` | Upload `nativeDrop`, keyed edge | Upload | Upload owns admission | Phase 3 | `dnd-upload.spec.tsx` rewritten | Low | move |
| Autoscroll | `DndScroller` overlays and options | Plite drag autoscroll | Plite React | Nested scrollports | Phase 3 | Browser autoscroll case | Medium | gate |
| `platejs/dnd/react`, `DndPlugin` | 15 public nouns | Deleted; kit-local plugin | Copied kit | No independent job | Phase 3 | Removed public nouns table | Medium: public break | cut |
| React DnD dependencies | Optional peers, patch, test backend | Deleted | n/a | No consumer | Phase 3 | Install e2e | Low | cut |
| Touch drag | Promised by docs | Handle actions; pointer driver on demand | Apps | No consumer or device proof | Phase 3 docs | Device gap row | Medium | defer |

Every `gate` row needs a Benchmark receipt against frozen budgets before its phase keeps (`.agents/rules/benchmark/templates/performance-observability.md`). The transfer itself runs once per drop over its payload and is not scale-sensitive (inferred).

### Removed public nouns and duties

| Removed | Behavior it carried | Replacement or proven redundancy | Regression proof |
| --- | --- | --- | --- |
| `DndPlugin`, `DndDefinition`, `DndPluginState` | Store, native-drop claim, list payload, preview prep, file route, scroller slot | Kit-local plugin for slots; one event system needs no claim; `transfer.source`; `drag.start`; Upload | Copied `dnd.lifecycle.spec.tsx` |
| `useDraggable`, `UseDraggableOptions`, `DraggableState` | Handle, source, target and preview registration; `isDragging` paint | Handle `onDragStart`, Plite hit-testing, `data-editor-dragging` | www `dnd.spec.ts` |
| `useDropLine`, `DropLineDirection` | Indicator edge per block | `useDropIndicator` per view | www indicator case |
| `useDndPlugin` | Clears hover on owner-document drag leave and drop | Session terminal paths | Cancel and unmount browser cases |
| `DndScrollerOptions` | Overlay autoscroll configuration | Plite autoscroll | Autoscroll browser case |
| `DRAG_ITEM_BLOCK`, `DragItemNode`, `ElementDragItemNode`, `FileDragItemNode` | React DnD item payloads | Session source; `DataTransfer` stays at the boundary | None needed: types only |
| `CanDropCallback`, `onDropHandler` | Container policy; row selection after drop | `transfer.landing`; the drag selects `at` | Column and row policy tests |
| `REFUSED_MOVE`, whole-children freshness | Refusal and stale-move detection | Abort inside `transfer`; live content at drop | Plite drop contract tests |
| Hover-time focus and selection collapse (`useDndNode.ts:761-767`) | Side effect during hover | Removed; hover never mutates selection | Follow-up typing browser case |
| Body `dragging` class | Read by `plate-dnd-cross-editor.test.ts:116` and `tooling/e2e/homepage-dnd.test.ts:61` | `data-editor-dragging` | Those specs, rewritten |

### Three realistic failures

1. **Gaps and nesting.** Margins, padding and table borders put the pointer outside every node host, or the walk picks the wrong level. Blast radius: every block drag, as friction without loss. Answer: the in-container nearest-host fallback and a browser geometry case per container.
2. **Copy negotiation differs by engine.** Firefox or WebKit report modifiers differently at drop, so intended copies move. Blast radius: modifier users on those engines, who lose nothing and must undo. Answer: a per-engine modifier case with a keep gate on it.
3. **The postcondition refuses moves users expect.** A correction rewrites moved content in its new context, such as an indent clamp, so the move refuses. Blast radius: moves into contexts whose corrections rewrite content; nothing is lost and a copy still works. Answer: a phase 1 inventory of the Plate kit corrections that rewrite moved content, each with a test showing the refusal. Corrections get no exemptions, because an exemption would let a move lose content.

Rollback: each phase 1 Plite repair (the draft `maxLength` budget, cross-parent anchor mapping, the move lifecycle, the `deleteByDrag` guard) fixes today's code on its own and reverts on its own. Reverting `transfer` and both entry points reopens only the defects they close. Reverting phase 2 removes the non-drag targets and actions menus; the action, reads, vetoes, feature rules and both phase 1 callers stay. Phase 3 reverts to the phase 2 tree, which still has React DnD.

### Challenge delta

Improved four times. The target, Plite-owned native-first transfer with React DnD deleted, held through every attack. The mechanics changed.

Interrogate pass 1 (three Opus reviewers, measured):

- **Deleted:** the destination-undo session effect (T8, T9), relocation by remove and reinsert (T5, T7) and collision-only root remap.
- **Merged:** copy admission into paste semantics.
- **Moved:** data-loss fixes to come before the public API.

Replay (three fresh Opus reviewers, measured):

- **Cut moves between independent editors to copies,** deleting cut-and-paste undo, the two-update foreign path and its doctrine exception.
- **Replaced the fit-report loss owner** with a postcondition after corrections (T10).
- **Added Plite repairs today's code already needs:** a draft `maxLength` budget (T12), cross-parent anchor mapping (T13) and a move lifecycle for ids (T11).
- **Made schema legality** a Plite check on every edge.
- **Let landing middleware retarget,** which the List family rule needs.
- **Kept sessions alive** across virtualized unmounts and window exits, with a post-drag pointer sentinel instead.
- **Added a hover dry pass,** column and row actions, and text re-extraction at drop.
- **Fixed `deleteByDrag`'s actual branch.**
- **Phase 1 now routes one internal transfer,** so the gestures are integrated once.

Cross-model review (Codex gpt-6.1-sol, ten findings, all applied):

- **Moved the move check to Plite's pre-publication guard** (T14), comparing the transferred interval and the reachable root closure instead of whole subtrees, so text moves into existing paragraphs pass.
- **Split vetoes from widening,** so an admission can never skip Upload's or TableRow's veto, and a retarget is revalidated once.
- **Published `editor.api.transfer` in phase 1** instead of an internal bridge through the already-published `plitejs/internal`, which `VISION.md:132` rules out as an escape path.
- **Added a private phase 1 policy port** so column and row reordering keep working before phase 2.
- **Narrowed the indicator guarantee** and gave the memo a full key.
- **Consumed refused file drops,** used `deletion: 'drop'` for text anchors, released the anchor on every terminal path, and suspended autoscroll on window exit.
- **Replaced a non-discriminating read-only test** and qualified the supplied-manager claim.

Second cross-model review (Codex gpt-6.1-sol): it repaired seven gaps in the plan itself, logged in the decision log, and raised two blockers, both applied:

- **Specified publication** as a `transfer()` plugin whose API group holds `move` and `copy`, a dependency of `react()`, because plugin publication rejects a callable API.
- **Published the policy hooks and feature rules in phase 1,** deleting the private policy port that had no way to cross the package boundary.

Execution review (Codex gpt-6.1-sol, round 2), one P1 and one P2, both applied:

- **Checked moves in views that show proposals.** A Suggesting-mode move skipped the guard, so a correction could truncate the proposed content and acceptance kept the loss. The guard now reads the corrected draft before the authored runtime reduces it, and `transfer-contract.test.ts` runs the correction-loss case in edit and propose views.
- **Widened the drag listener proof** to every way a drag ends (dragend, pointermove, drop, and a new drag replacing it) and to a view detaching mid-drag. The tests track live `document` and `window` listeners by type, function and capture flag, and each fails when its release path is removed or released with the wrong flag (`r2-red-*.log`). Each drag session mints a random token, and a document remembers only the latest consumed one instead of a set that grew with every drop.

Proof on the round 2 bytes is `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/r2-summary.txt`: Plite and Plate packages, and the Plite drag specs five times in three engines. The www specs, the homepage e2e, the registry build, create-install and the benchmark predate this round.

After the round 2 review, a docs pass on `/docs/dnd` added the Multiple editors and Tables and columns examples, and its browser proof found two column-drag defects, both fixed:

- **Firefox could not start a column drag,** because the copied column handle sat in editable content. Its wrapper is now `contentEditable={false}`, like the block and row handles.
- **A drop over column text refused,** because `resolveEventRange` took its block-fragment branch at drop, where drag data is readable, and landed in the dragged neighbor column. The drop caret now resolves from coordinates only (open finding 10).

`dnd.spec.ts` gained 'drags a column right by its handle' and the Plite drag spec 'moves a block between two views of one document'. Proof: `docs/plans/artifacts/2026-10-02-dnd-docs/final2-summary.txt`.

## Execution

The user's "go" on 2026-10-01, after the second cross-model review, authorizes Build to run every slice of all three phases without pausing between them. It grants no commit, push, message or shared-resource authority. The packet is this plan, its decision log and `docs/research/probes/2026-10-01-dnd-transfer/`. Slices land in the order below, each with its focused proof first.

## Steps

### Phase 1: one transfer under today's gestures

- [x] Reuse the existing entry-point coverage and add tests for the named defects it does not catch. At `applyEditableDrop` (`packages/plitejs/test/react/dom-coverage-native-bridge-contract.test.ts`):
  - a same-editor text move at the `maxLength` limit succeeding;
  - a move whose landing a correction would cut refusing;
  - two views of one document moving once;
  - an edit inside, before and elsewhere of the dragged range;
  - a text drop inside its own range refusing;
  - a cross-editor drop copying;
  - a cross-editor copy into a `maxLength` limit landing what fits and returning a lossy diagnostic;
  - a text move into an existing paragraph succeeding;
  - dragged text deleted before the drop refusing with nothing published;
  - two views of one document where the source view turns read-only mid-drag and its writable sibling is the target copying. This replaces the independent-editor lock-during-drag case, which a copy makes non-discriminating.

  At `useDndNode`'s drop (`packages/platejs/src/dnd/react/useDndNode.spec.ts`):
  - a card dropped into its own body refusing;
  - a cross-root block move keeping its persisted id;
  - two views moving once;
  - a document-view source copying;
  - a same-editor Alt-copy keeping the source;
  - a cross-editor drop copying with its card body;
  - ordinary column and table-row reordering still working through the feature rules;
  - a column item crossing editors with an equal parent path refusing;
  - both spellings of a list landing that would adopt children landing after the family;
  - a row move across a row span refusing;
  - a block payload over a column item and a row payload over a cell block refusing;
  - an `upload` draft moving across roots refusing;
  - a ColumnItem admission failing to override Upload's draft veto, and a List retarget revalidated by the vetoes.

  Also split the `it.each` at `model-input-strategy-contract.test.ts:836` so `deleteByCut` still deletes and `deleteByDrag` deletes nothing with an expanded selection, and add a Plite core test for an anchor following a root-to-blockquote `tx.nodes.move`.

  Proof: each added defect test fails for its named defect before the fix. Cases that preserve already-working behavior remain green before and after the refactor. Reuse the existing text-drop-into-paragraph test in `dom-coverage-native-bridge-contract.test.ts:733` and the existing column and row coverage; add coverage only where no existing test reaches the new policy path.

  Closed: `dom-coverage-native-bridge-contract.test.ts` adds edit before, edit inside, deleted before drop, drop inside the range, two views and the read-only source view, and rewrites the cross-editor copy and repeated-drop cases (35 pass); `useDndNode.spec.ts` adds the 16 Plate cases above, each red before routing (53 pass with the two hover cases); `model-input-strategy-contract.test.ts` and `range-anchor-contract.ts` carry the `deleteByDrag` and root-to-blockquote cases. skip: the `maxLength`-at-limit move, the correction-cut refusal and the lossy cross-editor copy stay at `transfer-contract.test.ts` and `max-length-contract.test.ts`, because the entry point adds no failure mode those action tests miss; "edit elsewhere" is the existing Plate case "keeps same-editor drag routing after an unrelated document edit".
- [x] Build the Plite repairs, each as its own revertable change: the draft `maxLength` budget, cross-parent anchor mapping in `tx.nodes.move`, the move lifecycle, lossy reporting from range and edge fits for copy diagnostics, `DocumentIdentity`, keyed-edge placement, schema legality, the move guard and the `deleteByDrag` guard in `getBeforeInputDeleteCommand` and the Android manager. Proof: the new tests pass, and because anchor mapping and the draft budget reach every move and insert, `pnpm --filter plitejs test` passes in full.
  Closed: the decision log's build rows name each repair and its failing-first test; `pnpm --filter plitejs test` refuses to run without partition caches, so each partition ran directly: core 1720, react 1375, dom 257 and 10, history 151, authored 422, yjs 274, all 0 fail. `DocumentIdentity` is `relationOf` in `packages/plitejs/src/core/transfer.ts`, not a separate noun.
- [x] Publish the `transfer()` plugin with `move` and `copy`, add it to `react()`'s dependencies and Plate's core plugin set, and publish `editorReads.transfer.source`, `transfer.landing` and the `transferVeto` point with the default landing. Add the List, ColumnItem, TableRow and Upload rules, which reproduce today's drop depths and rules. Route both gestures through the action. Switch `useDndNode`'s `canDrop` to the memoized hover dry pass and its `dragEntries` to `transfer.source`, and delete `canDropNode` from `column.tsx` and `table.tsx`. Plite's native drop calls it for internal sessions and keeps `insertData` for external data. Plate's drop records intent from the native event in `DndStorePlugin` `on.drop`, resets it at drag start, and calls `editor.api.transfer`. Delete `REFUSED_MOVE`, whole-children freshness, raw cross-editor inserts and `completeCrossEditorDrag`. Proof: `pnpm exec vitest run --config ./vitest.config.mjs test/react/dom-coverage-native-bridge-contract.test.ts` in `packages/plitejs`; `pnpm --filter platejs test:partition:dnd-react`; runtime tests calling `editor.api.transfer.move` directly on a headless editor with `transfer()`, a default React editor and a Plate editor; a type test with `@ts-expect-error` on a headless editor without `transfer()`.
  Closed: `packages/plitejs/src/core/transfer.ts`, `useDndNode.ts`, `DndStorePlugin.ts`, the four feature files and the two copied handles; vitest native bridge 35 pass; `pnpm --filter platejs test:partition:dnd-react` 62 pass; `transfer-contract.test.ts` (headless), the native bridge (React) and `useDndNode.spec.ts` (Plate) call the action; the `@ts-expect-error` case in `packages/plitejs/test/generic-editor-api-contract.ts` fails when removed. Two calls differ from this step: copy intent is recorded on every native dragover and drop rather than reset at drag start, and Upload's `files` landing rule waits for phase 3, when a files payload first reaches the action. A public `editor.read.transfer.source` lets Plate run the source read.
- [x] Rewrite the browser cases that asserted the old behavior: the move cases in `cross-editor-drag.test.ts`, including "degrades to copy after the source document changes" (`:291-311`), and `plate-dnd-cross-editor.test.ts`. Add one www Chromium case for a same-editor Alt-copy of a block through React DnD. Run the Plite drag specs (`cross-editor-drag`, `plate-dnd-cross-editor`, `embeds`, `editable-voids`, `plaintext`) serially in Chromium, Firefox and WebKit, five warm runs each. Proof: `pnpm --filter plite test:plite-browser:project <project> <spec>` and `pnpm --filter www test:www-browser:chromium tests/browser/dnd.spec.ts` logs under `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/`.
  Closed: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/plite-matrix-forced-summary.txt`, `plite-webkit-noembeds-summary.txt`, `plite-chromium-final.log` and `www-dnd-chromium-final-run{1..5}.log`. WebKit's `embeds.test.ts` fails three cases the same way at `HEAD` (`head-webkit-embeds.log`), so it is excluded from the WebKit count.
- [x] Write the Benchmark plan from `.agents/rules/benchmark/templates/benchmark.md` with a hover lane: React DnD dragover cost with a 1,000-block payload against current `next`. Proof: baseline and candidate receipts within p95 current plus max(1 ms, 5%), plus React DnD hover cases where a modifier change or a remote edit under a still pointer updates the indicator, and switching a proposal-only source to accepted mode clears admission without a document commit.
  Closed: `docs/plans/2026-10-01-dnd-transfer-benchmark.md`, validated complete; the hover cases are in `useDndNode.spec.ts` (hover describe) and `transfer-contract.test.ts` ("rechecks a hovered edge when the source view leaves proposal mode").
- [x] Extend `EDIT-DRAG-*` through `docs/editor-behavior/commands/reconsolidate-law-stack.md` for phase 1's behavior changes, apply Best API's doctrine repair to `docs/vision/plite.md:317-320` for the public action, and update the decision page's defect table. Proof: the command's output and a `current-evidence.md` row naming the tests.
  Closed: `docs/editor-behavior/markdown-editing-spec.md` (Mouse Drag And Selection notes), six rows in `editor-protocol-matrix.md`, a `current-evidence.md` row, `docs/vision/plite.md` and `.agents/rules/best-api.mdc`; `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` exact; the defect table in `docs/research/decisions/dnd-ownership.md` marks every row fixed.
- [x] Gate: keep, or revert phase 1. Artifact: `docs/plans/2026-10-01-dnd-transfer-consolidation.decisions.tsv`.
  Closed: keep. Every phase 1 proof above passed; the open items are open finding 4 and the pre-existing WebKit embeds failure.

### Phase 2: the non-drag move

- [x] Add the non-drag move: `editor.api.transfer.move({ to: 'previous' | 'next' })`, the handle actions for blocks, columns and rows, Cut, the right-click items, the shortcut, touch-visible handles with stable content, and the success announcement. Proof: platejs tests for one undo entry per move and a kept caret; www Chromium specs for a keyboard move and a pointer move through each handle's actions.
  Closed: `packages/plitejs/src/core/transfer.ts` step targets and `announce`; `transfer-contract.test.ts` covers one undo entry with a kept caret, the first-block refusal and the announcement; `BaseListPlugin.spec.tsx` covers family steps; copied `dnd.tsx` (kit shortcut, block actions, `HandleActionsMenu`, `cutBlocks`), `column.tsx`, `table.tsx` and `block-menu.tsx`; www `dnd.spec.ts` keyboard and handle cases with `table-selection.spec.ts`, five warm Chromium runs in `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/www-phase2-chromium-run{1..5}.log`; registry changelog `apps/www/src/registry/changelog/entries/2026-10-01-block-move-actions.mdx`. Cut writes HTML and plain text to the clipboard and removes the blocks only after the write succeeds; it has no browser case, because Playwright grants clipboard permissions only in Chromium and the paste path is already covered.
- [x] Run two-peer Yjs package cases with and without content roots: a move with a concurrent remote edit inside the moved block and one in an unmoved block between source and target. Proof: results recorded as open finding 2's evidence. Artifact: `docs/research/probes/2026-10-01-dnd-transfer/yjs-concurrent-move.result.txt`.
  Closed: `docs/research/probes/2026-10-01-dnd-transfer/yjs-concurrent-move.probe.ts` and its `.result.txt`, recorded under open finding 2; the content-root divergence reproduces with plain `nodes.move` at `HEAD`.
- [x] Extend `EDIT-DRAG-*` with the non-drag move and the shortcut trade. Proof: the reconsolidation command's output. Artifact: `docs/editor-behavior/editor-protocol-matrix.md`.
  Closed: two rows in `docs/editor-behavior/editor-protocol-matrix.md` and a note in `docs/editor-behavior/markdown-editing-spec.md`.
- [x] Gate: keep, or revert phase 2. Artifact: `docs/plans/2026-10-01-dnd-transfer-consolidation.decisions.tsv`.
  Closed: keep. The Yjs divergence predates this work and stays with its owner.

### Phase 3: native block drag replaces React DnD

- [x] Extend the Benchmark plan and freeze budgets against current `next` with `DndKit`. Measure owned listeners and registrations at rest and on activation, dragover hit-test and indicator publication per frame at 1,000 and 5,000 blocks, preview preparation, drop and teardown. Proof: the baseline receipt.
  Closed: `apps/www/scripts/run-dnd-perf.mts` on `apps/www/src/app/dev/dnd-perf/page.tsx`; baseline receipts `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/native-bench-baseline-{1000,5000}-{1,2,3}.json` from the `cf15725603` worktree.
- [x] Build `drag.start`, `resolveDropTarget`, the session extension and terminal paths, `data-editor-dragging`, `useDropIndicator`, `onDropResult`, preview clones and drag autoscroll; make Upload yield to a matching session and consume a refused drop. Proof: Plite package tests for every terminal path releasing the session's text anchor, including a successful text drop that resolves its live source before release, a source unmounted mid-drag and a virtualized source that stays alive; a repeated drop with the same consumed local token that adds no second insertion or undo entry; a refused file landing that publishes no content and creates no upload task.
  Closed: `packages/plitejs/src/dom/plugin/dom-drag.ts`, `dom/utils/drag-session.ts`, `dom/utils/drop-indicator.ts`, `react/hooks/use-drop-indicator.ts` and the Editable drag strategy; `packages/plitejs/test/react/dom-coverage-native-bridge-contract.test.ts` (41 pass) covers the terminal paths, the unmounted host, the repeated drop and indicator clearing at drag end; `packages/platejs/src/react/features/upload/UploadPlugin.spec.ts` covers the consumed refused file landing. Browser runs added three repairs: Upload resolves and submits through the handler's view (`files-sdk.spec.ts`), drag end clears every view's indicator (Escape case), and `drag.start` blurs a focused source view (WebKit).
- [x] Rewrite the copied `dnd.tsx` kit, the column, table, image and video handles and `apps/www/src/app/(app)/examples/plite/_examples/plate-dnd-cross-editor.tsx`, and move `nativeDrop` to the Upload kit. Delete:
  - `packages/platejs/src/dnd/` and the `platejs/dnd/react` export;
  - the `test:partition:dnd-react`, `lint:partition:dnd-react` and `typecheck:partition:dnd-react` scripts;
  - `packages/platejs/tsconfig.entrypoints/dnd-react.json`;
  - the `dnd-react` entries in `packages/platejs/tsdown.config.mts`, `packages/platejs/turbo.json`, `tooling/entrypoints/entrypoint-dag.mjs`, `tooling/config/tsconfig.test.json`, `tooling/config/tsconfig.type-tests.json` and `tooling/scripts/check-plate-schema-adoption.mjs`;
  - the React DnD peers, `patches/react-dnd@16.0.1.patch` and `react-dnd-test-backend`.

  Update `apps/www/src/__tests__/package-integration/kit-lifetime-probe/baseline-dnd.tsx`, `lifetime-browser-probe.tsx` and the mocks in `media-image.spec.tsx` and `media-video.spec.tsx`. Run `pnpm brl` and `pnpm --filter www build:registry`, and regenerate `apps/plite/src/runtime-entrypoint-proof.generated.ts`. Proof: `pnpm --filter www test:create-install dnd table` and the rewritten copied specs.
  Closed: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/p3c3-create-install.log` on the final bytes (Base/Nova and Radix/Luma, after `pnpm plite:packages:build`); `pnpm --filter platejs typecheck` (90 tasks) and `test` (138 tasks); www `tsc` for both projects; `apps/www/src/registry/components/editor/dnd.spec.tsx`. The feature landing cases moved to `BaseColumnPlugin.spec.ts`, `BaseTablePlugin.transfer.spec.ts`, `BaseListPlugin.spec.tsx`, `BaseUploadPlugin.spec.ts` and `UploadPlugin.spec.ts`, and the card copy case to `transfer-contract.test.ts`. Porting them exposed a cross-root move into a content-root view that removed the wrong node, fixed in `transfer.ts` `removeSource`. `kit-lifetime-probe/baseline-dnd.tsx` and `dnd-upload.spec.tsx` are deleted; the probe uses the native kit in both variants. `media-image.spec.tsx` and `media-video.spec.tsx` fail the same way at `HEAD` (their mocked editor has no callable `read`).
- [x] Rewrite `dnd.mdx`, `dnd.cn.mdx`, `media.mdx:388`, the `DndKit` teaching in `table.mdx` and their Chinese twins through Plate Docs, and apply the `plate.md` doctrine repair. Proof: rendered docs routes and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`.
  Closed: `/docs/dnd` and `/cn/docs/dnd` render the new sections on the 3297 source server; `pnpm --filter www check:docs` passes after classifying the transfer exports in `apps/www/api-reference.config.json`; `docs/vision/plate.md`, `.agents/rules/plate-ui.mdc` and doctrine version 256 in `.agents/rules/plate-next/versions.json` (`version.mjs validate` passes); the supplied-manager law in `docs/plans/2026-09-06-kit-owned-ai-and-dnd-lifetimes.md` is marked superseded; `sync-resources.mjs --check` exact.
- [x] Run these specs in Chromium, Firefox and WebKit, five warm runs each: Artifact: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/p3final2-summary.txt`.
  - www `dnd.spec.ts`, `table-selection.spec.ts`, `suggestion.spec.ts`, `files-sdk.spec.ts` and `kit-lifetime-probe.spec.ts`;
  - Plite's drag specs;
  - `tooling/e2e/homepage-dnd.test.ts` and `mention-dnd.test.ts`.

  Cover:
  - a real `page.mouse` drag where the engine supports it;
  - the copy modifier per engine;
  - Escape;
  - a handle unmounted mid-drag;
  - leaving and re-entering the window mid-drag, with autoscroll suspended while outside;
  - a modifier change and a remote edit under a still pointer updating the indicator;
  - two views of one document, each painting only its own indicator;
  - the handle staying out of native selection (the existing `dnd.spec.ts` case);
  - nested-scrollport autoscroll under a still pointer;
  - preview origin;
  - the native text drop caret with the kit mounted;
  - follow-up typing and undo.

  Proof: logs and inspected screenshots under the artifacts folder.
  Closed: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/p3final2-summary.txt`, `p3c3-summary.txt` and their run logs on the final bytes. `embeds.test.ts` passes 5/5 in Chromium and Firefox, and fails in WebKit only cases that fail the same way at `HEAD`. Under the same load, the Firefox homepage drag times out in its `networkidle` wait once in five runs on both sides. The Plite drag specs pass 5/5 in all three engines, and the www and e2e drag cases 5/5 in Chromium. Firefox and WebKit fail only cases that fail the same way at `HEAD` (open finding 5 and the decision log). `plate-dnd-cross-editor.test.ts` now covers Escape, two views of one document, a source removed mid-drag, a modifier change, page autoscroll and undo. A still pointer, leaving the window and a text-selection drag have no Playwright path (open finding 6). The kit lifetime probe is blocked by its AI step at `HEAD` too. `mention-dnd.test.ts` fails at `HEAD` because the mention never starts a drag.
- [x] Run the candidate Benchmark: p95 at most current plus max(1 ms, 5%), and no more owned listeners at rest than current. Proof: the candidate receipt. Artifact: `docs/plans/2026-10-01-dnd-transfer-benchmark.md`.
  Closed: `docs/plans/2026-10-01-dnd-transfer-benchmark.md`, validated complete, with receipts `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/native-bench5-{baseline,candidate}-{1000,5000}-{1,2,3}.json`. Two causes were fixed on the way, a caret point resolved on every dragover and an indicator repainted through layout.
- [x] Record the device gap. No iOS or Android device is available, so the iOS native drag and touch handle-action claims stay unverified. Proof: a `gap` row in the decision log. Artifact: `docs/plans/2026-10-01-dnd-transfer-consolidation.decisions.tsv`.
  Closed: the `gap` row "Record the device gap for touch drag" in `docs/plans/2026-10-01-dnd-transfer-consolidation.decisions.tsv`.
- [x] Gate: keep, or revert to the phase 2 tree. Artifact: `docs/plans/2026-10-01-dnd-transfer-consolidation.decisions.tsv`.
  Closed: keep. The browser matrix, the benchmark and the package partitions pass on the final bytes, per the decision log rows "Phase 3 five-run browser matrix on the final bytes" and "Phase 3 benchmark budget".

## Proof

Package claims use the package partitions and contract tests above. Browser claims use the existing Plite and www Playwright runners. Synthetic `DragEvent` cases prove event handling, not OS drag negotiation, and Playwright WebKit is not Safari. Drag-and-drop proof runs five warm times without retries, and one failure keeps its case open. Mobile emulation is a proxy and never certifies raw Android or iOS input. Evidence stays under `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/`, with conclusions in this plan.

## Open findings

1. Anchors are root-bound (`packages/plitejs/src/core/anchor.ts:107-115`). So a move across roots of one document mints keys and drops anchors, and a text move collapses anchors inside the moved text (T5). Both match today's behavior, and an in-flight Upload draft refuses a cross-root move. owner: Plite anchor and change model, review scope `annotations`. Tracked here and in `docs/research/decisions/dnd-ownership.md`.
2. Yjs lowering takes the incremental bridge, which carries relocations, when one root changed and the schema has no content roots (`packages/plitejs/src/yjs/core/controller.ts:651-680`). Otherwise it rewrites every root child between the unchanged prefix and suffix (`packages/plitejs/src/yjs/core/change-bridge.ts:140-176`). Measured in phase 2 (`docs/research/probes/2026-10-01-dnd-transfer/yjs-concurrent-move.result.txt`): without content roots, an offline move with concurrent remote edits inside the moved block and in a block between source and target converges with both edits. With a content-root schema the peers diverge: the editing peer keeps both edits and loses the move, the moving peer keeps the move and loses both edits. Plain `editor.update.nodes.move` fails the same way at `HEAD`, so the defect is in Yjs move lowering, not in `transfer`. owner: review scope `collaboration`. Tracked here and in the decision page.
3. Touch device proof is unavailable, so the iOS native drag and the touch handle actions stay unverified. owner: review scope `accessibility`. Tracked here.
4. A drag that lands blocks node-selects them. After a cross-editor copy, a click into the gap between blocks keeps that node selection, End keeps it, and typing replaces the selected block. Same-editor drags on `next` already end node-selected, because `prepareDrag` selects the payload. owner: Plite selection, review scope `selection`. Tracked here and in the decision log.

5. Pre-existing failures met during phase 3 proof, each failing the same way in the `cf15725603` worktree: seven `suggestion.spec.ts` cases (lines 463, 538, 898, 1855, 2220, 2561, 2628), `tooling/e2e/mention-dnd.test.ts` (the inline mention never starts a native drag), the kit lifetime probe's AI streaming step in both variants, and `media-image.spec.tsx` / `media-video.spec.tsx`. owner: review scopes `suggestion`, `mention`, `ai` and `media`. Tracked here.
6. Playwright's emulated drag cannot hold a still pointer, leave the window or start a drag from a text selection, so window leave and re-entry, a remote edit under a still pointer and the text drop caret with the kit mounted have no browser case. Paced 1 px moves stand in for a still pointer; no kit code listens for document `dragover`, which removes the mechanism that hid the text caret. Nested-scrollport autoscroll has no browser case either; page autoscroll does. `suggestion.spec.ts` ran only its image cases five times in Chromium, and once in full in Chromium, where seven cases fail the same way at `HEAD`. WebKit's homepage drag stops at a resource error the same way at `HEAD`, so its follow-up typing runs only in Chromium and Firefox. owner: review scope `dnd`. Tracked here and in the decision log.

7. Interrogate findings kept open after the phase 3 review (three Opus reviewers, same family): `onDropResult` has no consumer in the copied kit, so a refused drop gives no visible feedback; the Editable's void-block drag start opens a session beside `drag.start`; Upload repeats the Editable's dragover and drop protocol through `drag.indicate` and `resolveDropTarget({ files })`, where an Editable-owned files landing would delete both; landing middleware reads the target view as `state` while a veto receives it as an argument and returns a boolean instead of a reason; and `drag.start` leaves the source view blurred after Escape or a refused drop, as the React DnD path did. owner: `best-api` review of scope `dnd`, tracked here and in the decision log.

8. The phase 3 benchmark runs React development builds behind source-mode dev servers on both sides, and the baseline's drop and teardown split into two modes (about 102 and 6 ms, or 258 and 60 ms, at 1,000 blocks) for an unexplained reason. The candidate is faster than either mode. owner: review scope `dnd`, tracked here and in `docs/plans/2026-10-01-dnd-transfer-benchmark.md`.

9. 'native authored changes > preserves attribution through replacement, rollback and removal' fails intermittently in the full authored partition and passes all 40 isolated runs. Authored stamps changes with `Date.now()` and breaks ties by a random UUID (`packages/plitejs/src/authored/authored.ts:3184-3193`), so two inserts in the same millisecond list in random order. With `Date.now` pinned the test fails 9 of 20 runs, and 0 of 20 unpinned (`docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/r2-authored-pinned-now.log`). The test calls no transfer API, and the authored source and test match `HEAD`; it was not run at `HEAD`. owner: review scope `suggestion`, tracked here and in the decision log.

10. `resolveDOMDropTarget` resolves its caret through `pointAt` (`packages/plitejs/src/dom/plugin/dom-drag.ts`), which strips drop data before calling `resolveEventRange`. That method also picks a block-fragment landing when the event carries readable fragment data, which happens only at drop, so a drop over column text resolved into the neighboring column. Splitting caret lookup from fragment landing in `resolveEventRange` would delete `pointAt`. owner: `best-api` review of scope `dnd`, tracked here and in the decision log.

## Reversible defaults

- Drops between independent editors copy, as ProseMirror (`../prosemirror-view/src/input.ts:740`) and CKEditor (`../ckeditor5/packages/ckeditor5-clipboard/src/dragdrop.ts:375-379`) do. This changes shipped behavior and the cross-editor example. Reverse with: move, with the source removal in its own history batch, copying when the source has no history.
- An identity mismatch on one owner lands as a copy. Reverse with: apply the removal under the source view's authoring.
- A source edited during the drag moves its live content, and a source deleted during the drag refuses the move. This replaces the decision page's stale-source degradation to copy (`docs/research/decisions/dnd-ownership.md:94-95`). Reverse with: copy when the dragged content changed during the drag.
- `Mod+Shift+ArrowUp` and `ArrowDown` move blocks, following Notion. Reverse with: keep the native select-to-boundary shortcut and bind the move only while blocks are node-selected.
