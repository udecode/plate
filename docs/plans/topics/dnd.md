# Drag and drop

Page: https://claude.ai/artifact/CYzConr7Z3AdVJGgyqZM4u

Block drag and drop in Plite and Plate. `node tooling/scripts/review-ledger.mjs show dnd` prints the scope's full review and plan history.

## Public API

A drag handle starts a native drag, and each view paints its own drop indicator.

```ts
onDragStart={(event) => {
  if (!editor.api.dom.drag.start(event.nativeEvent, { node: element })) {
    event.preventDefault();
  }
}}
const indicator = useDropIndicator();
```

A block lands wherever the schema accepts it. A feature narrows that with a veto, which every drag, keyboard move and transfer call obeys.

```ts
definePlugin('pinned', {
  contributions: [
    transferVeto.of(({ edge, target: [node] }) => edge === 'before' && node.pinned === true),
  ],
});
```

Table keeps the limits its grid cannot state in the schema as vetoes, such as cells never transferring.

```ts
transferVeto.of(({ payload }) => {
  const cellType = editor.plugin(BaseTableCellPlugin).schema.type;

  return (
    payload.kind === 'nodes' &&
    payload.nodes.some((node) => ElementApi.isElementType(node, cellType))
  );
}),
```

A veto sees the wrap a side drop builds, so Footnote keeps definitions at the root as payload and as target.

```ts
// packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.ts
transferVeto.of(
  ({ payload, target: [, path], wrap }) =>
    payload.kind === 'nodes' &&
    (path.length > 1 || wrap !== undefined) &&
    payload.nodes.some((node) => ElementApi.isElementType(node, type))
),
```

A landing middleware only redirects an edge; the default keeps it.

```ts
around(editorReads.transfer.landing, ({ input, next, state }) =>
  input.edge === 'before'
    ? { edge: 'after' as const, key: state.key([2])! }
    : next()
),
```

A side read decides what a drop beside a block builds. Column builds or joins a column group; without a contributor a side target refuses with `policy`, and the DOM driver skips strips.

```ts
// packages/platejs/src/features/layout/lib/BaseColumnPlugin.ts
around(editorReads.transfer.side, ({ input, next, state }) => {
  const {
    payload,
    side,
    target: [target, path],
  } = input;
  // … builds a column group, or joins one, else calls next()
}),
```

A copied handle asks the schema which blocks it may drag.

```ts
match: ({ editor, element }) =>
  !editor.read.view.isReadOnly() &&
  editor.read.schema.isBlockContent(element) &&
  editor.read.nodes.isSelectable(element),
```

A handle, a keyboard move and Cut read the same blocks.

```ts
const nodes = () => editor.read.transfer.nodes({ node: element });
editor.api.transfer.move({ announce, nodes: nodes(), to });
```

A handle menu asks the hover's dry run before it offers Move beside previous or next.

```ts
// apps/www/src/registry/components/editor/dnd.tsx, besideOf
const to = { key, side };

return editor.read.transfer.check({ nodes: keys, to }).admitted
```

The action then moves the blocks beside their sibling with the same call the drop makes.

```ts
// apps/www/src/registry/components/editor/dnd.tsx, besideOf
editor.api.transfer.move({
  announce: 'Moved beside',
  nodes: keys,
  to,
});
```

The React Upload plugin owns file drops and lands them at the edge under the pointer, with no option to set. The DnD kit draws the line.

```tsx
// apps/www/src/registry/examples/upload-demo.tsx
plugins: [
  ParagraphPlugin.configure({ component: ParagraphElement }),
  ...DndKit,
  ...MediaKit,
  ...UploadKit,
  ...(browserUploads?.plugins ?? []),
],
```

Code moves blocks through one action that reports its outcome.

```ts
const outcome = editor.api.transfer.move({
  nodes: [editor.key(element)],
  to: { edge: 'after', key: editor.key(target) },
});
```

The Editable drop passes a resolved block target through, side or edge, instead of rebuilding an edge; a custom driver does the same.

```ts
// packages/plitejs/src/react/editable/clipboard-input-strategy.ts
? resolved && 'key' in resolved
  ? 'side' in resolved
    ? resolved
    : { edge: resolved.edge, key: resolved.key }
  : null
```

A plugin marks the properties that follow where content lands. `rebase` lets a text landing change one, such as a depth, and `adopt` also lets a block copy take it from where it lands, such as a list.

```ts
// packages/platejs/src/features/list/lib/BaseListPlugin.ts
listId: schema.elementProperty(property.string(), {
  landing: 'adopt',
  target: target.types(targetElementTypes),
  typeChange: 'preserve-if-allowed',
}),
```

The paste landing read now says whether it lands a copy or a move, so List keeps moved items in their own list.

```ts
// packages/platejs/src/features/list/lib/listPaste.internal.ts
const placement = intent === 'move' ? 'move' : 'paste';
const kept = landListContent(
  state,
  blocks,
  { block: target.block?.[0], kind: 'kept' },
  { headingType, placement }
);
```

A plugin can set its `adopt` properties on copied blocks, based on where a drag drops them. List uses this to give the copies a list.

```ts
// packages/platejs/src/features/list/lib/BaseListPlugin.ts
around(editorReads.transfer.adopt, ({ editor, input, next, state }) =>
  adoptListBlocks(state, input, next(), {
    headingType: getHeadingType(editor),
  })
),
```

The Public API pairs in `docs/plans/2026-10-01-dnd-transfer-consolidation.md`, `docs/plans/2026-10-02-dnd-schema-derived-landing.md`, `docs/plans/2026-10-06-dnd-side-drop-columns.md` and `docs/plans/2026-10-15-list-drag-landing.md` show the call each of these replaced or added.

A text move lands what deleting its range removes, so a range that ends at a later line's start lands only its text.

```ts
// packages/plitejs/test/transfer-contract.test.ts
[
  "ends at a block's start, landing only its text and keeping that block once",
  endChecked(),
  textRange([0, 0], [1, 0]),
  [paragraph(''), { ...paragraph('cd'), checked: true }, paragraph('eabf')],
],
```

## What other editors do

The October 2 library review read five editors and three drag libraries at the commits below without running any of them, and found that each editor keeps semantic transfer in its own engine, so Plite keeps the transfer and the native driver, Pragmatic Drag and Drop is deferred, and React DnD and modern dnd-kit are rejected.

| Editor or library | Drag session | Drop commit and target | Cross-editor drop | Files and external data | Touch and keyboard | Limit | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ProseMirror: prosemirror-view `ca4c78e9`, dropcursor `061f64ac` (read, not run) | Native `DataTransfer`; keeps the slice and selection | Engine commits a schema-aware drop; a modifier copies | Copies (`src/input.ts:740`) | not in the sources | not in the sources | No OS or mobile parity proof; canonical forge `f9ac9362` unread | `README`; `repo-registry.tsv`; `plan` Reversible defaults; `ownership record` |
| Tiptap `91c51be5` (read, not run) | Native drag handle; Floating UI positions it | ProseMirror commits the drop | not in the sources | Handle clears transfer data; writes no rich external payload | not in the sources | Clone predates remote tip `c402400e` | `README`; `repo-registry.tsv` |
| BlockNote `1e26f1c5` (read, not run) | Native handles with custom serialization | ProseMirror integration; engine keeps the transfer | not in the sources | not in the sources | Keyboard move shortcuts | Inspected drag tests skip Firefox | `README`; `repo-registry.tsv`; `lead-ledger.tsv` |
| Lexical `dd5c41b1` (read, not run) | Native text drag and a native React block plugin | Engine keeps the transfer | not in the sources | Separate file command | Android native drag reported broken (issue 3872) | Block tests skip Firefox and collaboration; text test Chromium-only | `README`; `lead-ledger.tsv`; `plan` React DnD and touch |
| Slate, fork `zbeyens/slate` `945a484d` (read, not run) | Native React handlers | Engine maps ranges and transports fragments | not in the sources | not in the sources | No dedicated touch or keyboard reorder controller found | Fork; canonical upstream `0f847cb9` unread | `README`; `repo-registry.tsv` |
| CKEditor 5, revision not recorded (cited in the plan, not run) | not in the sources | not in the sources | Copies (`ckeditor5-clipboard/src/dragdrop.ts:375-379`) | not in the sources | Disables native drag on Android | Not in the library review's registry | `plan` Reversible defaults, React DnD and touch |
| Notion (not read) | not in the sources | not in the sources | not in the sources | not in the sources | `Mod+Shift+ArrowUp/Down` moves blocks | Cited only as the block-drag behavior authority | `plan` Current state, Non-drag move |
| Pragmatic Drag and Drop `abd224dd`, library (read, not run; deferred) | Adapters own the native lifecycle; recover leaked Firefox pointer events | Editor commits; every accepted nested target receives the drop | not in the sources | Text payload is a Text node; external adapter skips local drags | App builds the accessible alternatives | Text-selection test returns early outside Firefox; globals make iframe mounting an open question | `README`; `lead-ledger.tsv`; `read-log.tsv` |
| Modern `@dnd-kit/dom` `e522d9c6` (0.5.0), library (read, not run; rejected as default) | Manager with Pointer and Keyboard sensors; `DragSensor` unexported | Editor commits; `DragSensor` has no native `drop` handler | not in the sources | Native text, files and apps need another driver | Pointer, touch and pen activation; keyboard drag | Feedback, selection and scrolling also write the DOM | `README`; `rejected-ledger.tsv` |
| React DnD `1de654eb` (npm 16.0.1), library (read, not run; reintroduction rejected) | Manager and monitors; HTML5 backend registers per block | Editor commits; block sources write only `application/json {}` | One HTML5 backend per window; needed a shared provider | Native HTML5 payloads; file shape disagreed with Plate types | Separate touch backend; keyboard option only cancels | Window `dragover` prevents default on every drag | `README`; `plan` React DnD and touch; `dnd-ownership.md` |

Sources: `README` is `docs/plite/research/2026-10-02-dnd-library-choice/README.md`, and the `.tsv` ledgers sit beside it. `plan` is `docs/plans/2026-10-01-dnd-transfer-consolidation.md`. `ownership record` is `docs/research/review-records/2026-10-01-dnd-native-transfer-ownership.json`. The editor pattern supports engine-owned mutation. It does not prove that hand-written browser mechanics are cheapest (`README`).

The landing review read seven editors in local source at the revisions below, without running them. It found that the schema decides where a dragged block may land everywhere except Lexical, and that "rows stay in their table" lives in a dedicated table or column gesture, never in the generic block drop.

| Editor | Where a block may land | Which nodes get a handle | Per-container limit | Hover check | Source |
| --- | --- | --- | --- | --- | --- |
| ProseMirror: view `ca4c78e9`, transform `662b7a93` (read, not run) | `dropPoint` walks up from the pointer depth to the first depth whose content accepts the slice; cells, list items and details take drops | `NodeSpec.draggable` only lets a node drag unselected | None in the core | `posAtCoords`, then `dropPoint`, per dragover, unthrottled | `structure.ts:324-349` |
| Tiptap `91c51be5` (read, not run) | ProseMirror's `dropPoint` | Root children by default; `nested` scores ancestors and excludes rows, cells and list wrappers | None on the target side | One `requestAnimationFrame` per hover | drag handle extension |
| BlockNote `1e26f1c5` (read, not run) | Schema-derived; blocks sit only in block groups and columns, never in table cells | Every block container; column and column list never | Rows and columns move only inside their table; merged cells refuse | not recorded | `TableHandles.ts:358-500` |
| Lexical `dd5c41b1` (read, not run) | Root children only | Root children only | Playground keeps table columns in their table | Rect walk over root keys per move | `DraggableBlockPlugin_EXPERIMENTAL` |
| ProseKit `3fbfe790` (read, not run) | Every block boundary is a geometric candidate; the schema applies at commit | Descent stops at the first textblock, atom or isolating node | A list cannot drop as a list's first child; table handles move by index | Sorts every candidate per move | `prosemirror-drop-indicator` `ed1d5c91` |
| Slate fork `945a484d` (read, not run) | No block drag; a drop merges into the block under the caret | None | None | None | mentions example |
| CKEditor 5 `14e73cc3` (read, not run) | Before or after the closest `isBlock` element, or inside a container that accepts `$block`, checked by `insertContent` | Widgets, blocks via the block toolbar, text | No table row or column drag | `getComputedStyle` per child in a gap; markers throttled to 40ms | `ckeditor5-clipboard` drag and drop |

Source: `docs/plite/research/2026-10-02-dnd-landing-policy/editors.tsv`.

The same landing review found that only BlockNote builds columns from a side drop. The others have no side target, because their landing is before or after a block.

| Editor | Side drop | Structure it builds | Emptied source | Source |
| --- | --- | --- | --- | --- |
| BlockNote `1e26f1c5`, `xl-multi-column` (read, not run) | The left edge or the right 10% of a block | A column list from a block's edge, or a new column with width normalization; a column's whole content dropped on its own edge is a no-op | not recorded | `docs/plite/research/2026-10-02-dnd-landing-policy/editors.tsv:18`, citing `multiColumnDropCursor.ts:18-74` and `multiColumnHandleDropPlugin.ts:45-197` |
| ProseMirror, Tiptap, ProseKit, Lexical, Slate fork, CKEditor 5 (read, not run) | None | None | not applicable | `docs/plite/research/2026-10-02-dnd-landing-policy/editors.tsv` |
| Notion (not read) | The side strip of any block, shown as a vertical bar, as in the user's screenshot | Columns around both blocks | not in the sources | The user's screenshot, 2026-10-06 |
| Plate Plus, `../plate-pro` at `9ecc0bb85` (read, not run) | None. `block-draggable.tsx` drags columns by handle only | None | not applicable | `../plate-pro/src/registry/ui/block-draggable.tsx:32` |

The list drag review read four editors in local source, without running them. Every editor lands a text drag-move as a delete followed by its paste path, and every editor with nested lists makes a dropped item join the list it lands in or start a new one. Their lists are trees, so nesting decides membership, and none of them settles a flat list's identity. Word and Google Docs, the spec's authorities for list identity, were not run.

| Editor | Text drag that moves | Hook that reshapes dropped content | Dropped list item's list |
| --- | --- | --- | --- |
| ProseMirror view `ca4c78e` | Deletes the source, then `replaceRange` at the drop point, as a paste fits | `transformPasted`, the paste hook, runs on internal drags, moves and copies alike | The list the fit puts it in, or a new list the fit wraps it in |
| Tiptap `91c51be53` | ProseMirror's drop | ProseMirror's | As ProseMirror |
| Lexical `dd5c41b13` | Removes the dragged range, then inserts through `$insertDataTransferForRichText`, the paste path | The paste path's import hooks | A `ListItemNode` needs a `ListNode` parent, so it joins the list it lands in or gets a new one |
| Slate `945a484df` | Deletes the dragged range, then `insertData`, the paste call | `insertData` overrides | No list model in core |
| Notion (not read) | not read | not read | Positional numbering: a dropped numbered block numbers with the run it lands in |

Source: `docs/plans/artifacts/2026-10-15-list-drag-landing/prior-art.md`.

The move guard review read the same four editors' paste paths for what checks a move after it lands. None compares what landed with what moved, so none refuses a move a paste hook changed (inferred from those paste paths; no editor was run).

| Editor | What a move lands | Check after the landing |
| --- | --- | --- |
| ProseMirror | The source is deleted, then `replaceRange` fits the dragged slice, after `transformPasted` | None |
| Tiptap | ProseMirror's drop | None |
| Lexical | The range is removed, then `$insertDataTransferForRichText`, the paste path, inserts it | None |
| Slate | The range is deleted, then `insertData`, the paste call, inserts it | None |
| Plite | The paste plan with intent `move`, then a guard after corrections | Text and marks, and every block the move carries, an empty last block included, except the block the moved text joins at the drop point and the blocks that hold it |

Source: `docs/plans/artifacts/2026-10-15-move-landing-guard/prior-art.md`.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| `transfer()` plugin with `move` and `copy` | Plite | `plitejs`, `src/core/transfer.ts` | One owner for every move and copy law (`plan` ledger) |
| Transfer installed by default | Plite and Plate | `plitejs` `react()` dependency; `platejs` core plugin set | The Editable's native drop calls it (`plan` Public calls) |
| Document identity (`relationOf`) | Plite | `plitejs`, `src/core/transfer.ts` | Laws 3 and 4; a Plate-side fix was reverted (`plan`; `interrogation record`) |
| Independent editors copy | Plite | `plitejs` | No third holder keeps the content (T8, T9) (`plan` ledger) |
| Move guard on the corrected draft | Plite | `plitejs`, `src/core/public-state.ts` | Law 1, including views that show proposals (`plan`; `repair record`) |
| `maxLength` budget reads the draft | Plite | `plitejs`, `src/core/insert-limit.ts` | A same-update move counted twice (T12) (`plan` ledger) |
| Anchors mapped across parents in `tx.nodes.move` | Plite | `plitejs` change model | Law 8 (`plan` ledger) |
| Move lifecycle keeps `copy: 'drop'` properties | Plite | `plitejs` | Persisted ids survive moves (T11) (`plan` ledger) |
| Live keys and re-extracted text at drop | Plite | `plitejs` | Law 6; cuts whole-children freshness (`plan` ledger) |
| `deleteByDrag` deletes nothing | Plite | `plitejs` input, `editing-kernel.ts` and Android manager | Law 9 (`plan` ledger) |
| Refusal aborts inside `transfer` | Plite | `plitejs` | Law 5; cuts `REFUSED_MOVE` (`plan` ledger) |
| `transfer.source` and `transfer.landing` reads, `transferVeto` point | Plite | `plitejs` | `transfer.source` expands, `transfer.landing` only redirects, `transferVeto` refuses, and the schema admits (`landing plan` Landing law) |
| Hover dry pass | Plite | `plitejs` | The indicator paints only admitted edges (`plan` ledger) |
| List family source and landing | Plate | `platejs`, `src/features/list` | The feature owns its rule (`plan` Landing policy) |
| Upload `files` landing and draft veto | Plate | `platejs`, `src/features/upload` and `src/react/features/upload` | Upload owns file admission (`plan` ledger) |
| Native block drag: `drag.start`, `resolveDropTarget`, sessions | Plite | `plitejs`, `src/dom/plugin/dom-drag.ts`, `src/dom/utils/drag-session.ts` | One event system for text, files and blocks (`plan` ledger) |
| Per-view `useDropIndicator` | Plite | `plitejs`, `src/react/hooks/use-drop-indicator.ts` | One indicator host per view (`plan` ledger) |
| `data-editor-dragging` paint | Plite, with copied CSS | `plitejs` DOM; registry `dnd.tsx` | One source for drag paint (`plan` ledger) |
| Preview clones and origin | Plite | `plitejs`, `drag.start` | Mounted-view origin; moved from `prepareDrag` (`plan` ledger) |
| Drag autoscroll | Plite | `plitejs`, `src/react/editable/drag-auto-scroll-target.ts` | Nested scrollports (`plan` ledger) |
| Non-drag move to `'previous'` or `'next'` | Plite action; Plate copied UI | `plitejs`; registry `dnd.tsx`, `column.tsx`, `table.tsx`, `block-menu.tsx` | WCAG 2.2 SC 2.5.7 (`plan` ledger) |
| Kit-local `DndPlugin`, handles, menus, shortcuts | Plate copied registry | `apps/www/src/registry/components/editor/dnd.tsx` | Optional product UI, unrelated to npm dnd-kit (`README`) |
| `cutBlocks` clipboard write, then delete | Plate copied registry | `dnd.tsx`, imported by `block-menu.tsx` | A clipboard ownership concern, not a drag engine (`README`; `dnd-ownership.md`) |
| Touch drag gesture | App | App code | No consumer or device proof; a pointer driver on demand (`plan` ledger) |
| Browser driver replacement (PDD) | Plite, deferred | `plitejs`, private if adopted | Adopt only if it deletes responsibility (`README`; `library record`) |
| Schema-derived landing default and `landAt` | Plite | `plitejs`, `src/core` | One law for every transfer path (`landing plan` Decision ledger) |
| `canPlaceAt` placement predicate | Plite | `plitejs`, `src/core/editor-schema.ts` | The schema owns content prefixes and `max` (`landing plan` Decision ledger) |
| Hover geometry: a center-line hit test, then one mounted search per level; bands; indexed coverage reads | Plite | `plitejs`, `src/dom/plugin/dom-drag.ts` | The mounted view owns geometry (`landing plan` Decision ledger) |
| `editor.read.transfer.nodes` | Plite | `plitejs` | One home for the handle and keyboard blocks (`landing plan` Payload read) |
| Column, Table, Details and Footnote vetoes | Plate | `platejs`, `src/features` | Limits the schema cannot state stay with their feature (`landing plan` Feature rules) |
| Slot-aware Upload `replaceEmpty` | Plate | `platejs`, `src/features/upload` | The drop performs the edit the law admitted (`landing plan` Feature rules) |
| Handles from `isBlockContent` and `isSelectable` | Plate copied registry | `dnd.tsx` | Handles follow the schema (`landing plan` Public API) |
| `TransferSide` target and the `transfer.side` read with a `TransferWrap` result | Plite | `plitejs`, `src/core/transfer-types.ts`, `src/core/editor-reads.ts`, `src/core/landing.ts` | A side drop creates structure, which a redirect cannot express; Plite commits a shell the feature describes and never names a column |
| Wrap commit as an insert of an empty shell plus moves, inside `runTransfer`'s one update | Plite | `plitejs`, `src/core/transfer.ts` | One undo step and kept keys, measured by probe P1 |
| `editor.read.transfer.check` | Plite | `plitejs`, `src/core/transfer.ts` | A menu and a custom driver need the hover's dry run, so there is no second admission law |
| Side strips and the `{ key, side }` arm of `DOMDropTarget` | Plite | `plitejs`, `src/dom/plugin/dom-drag.ts` | The mounted view owns geometry; a strip is arithmetic on the anchor rect `edgeOf` already reads |
| Column side policy, a drop cap of 5 and over-full width rescaling | Plate | `platejs`, `src/features/layout` | Product opinion stays with the feature; the group descriptor owns every group-scoped rule |
| Footnote veto reads `wrap` | Plate | `platejs`, `src/features/footnote` | A definition must not land inside a new column, as payload or as target |
| "Move beside" handle actions | Plate copied registry | `apps/www/src/registry/components/editor/dnd.tsx` | WCAG 2.2 SC 2.5.7 single-pointer path, shown only when `check` admits |
| Scroll refresh of the drop line during a block drag | Plite | `plitejs`, `src/dom/utils/drag-session.ts` for the listener's lifetime, `src/react/editable/clipboard-input-strategy.ts` for the last dragover | The session already owns every transient drag listener and its cleanup |
| Outside side zones beside top-level blocks | Plite | `plitejs`, `src/dom/plugin/dom-drag.ts` | The mounted view owns geometry; Column still decides what a side builds |
| Element properties declare `landing: 'rebase'` or `'adopt'` | Plite | `plitejs` root entry, `src/core/schema-definition.ts`, `src/core/schema-compiler.ts` | Each property's owner knows whether where content lands decides it |
| The landing read's input carries `intent` | Plite | `plitejs` root entry, `src/core/slice-landing-types.ts`, `src/core/slice-landing.ts` | A landing hook must tell a move from a copy to keep moved identity |
| A text move lands through the paste plan | Plite | `plitejs` root entry, `src/core/transfer.ts` | Transfer owns the move; the paste plan owns landing mechanics |
| A move may change only declared properties | Plite | `plitejs` root entry, `src/core/transfer-guard.ts` | The guard owns "refuse rather than lose" |
| `editorReads.transfer.adopt` and its patch types | Plite | `plitejs` root entry, `src/core/editor-reads.ts`, `src/core/transfer-types.ts`, `src/index.ts` | A neutral read inside admission; Plite checks patches against the declarations before placement and vetoes |
| The hover check cache keeps one result per edge | Plite | `plitejs` root entry, `src/core/transfer.ts` | Hover checks several candidate edges per dragover, and one slot made them evict each other |
| List and Indent declare their positional properties | Plate | `platejs` core entry, `src/features/list/lib/BaseListPlugin.ts`, `src/features/indent/lib/BaseIndentPlugin.ts` | The properties' owners |
| List identity for moved text and dropped block copies | Plate | `platejs` core entry, `src/features/list/lib/` | List policy stays in Plate |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Keeping React DnD, or adopting modern dnd-kit | Neither earns default adoption: one HTML5 backend per window, a window `dragover` on every drag, and payload types that disagreed with Plate's. |
| A Plate-side second transfer, move and settlement protocol | Turned copy into move, deleted read-only sources and attached a transferred content owner to a colliding target root. |
| A Plate-side two-view fix comparing runtime owner and root | Lost copy intent, skipped the source view's permission and moved an unrelated block; Plite owns document identity. |
| Root-only landing with per-feature widening middleware | Column and Table repeated near-identical widening and blockquote, details and footnote content got no drop; the schema decides. |
| Stale sources degrading to copy, and lossy moves degrading to copy | A move resolves live keys at drop and refuses when its source is gone or its landing is lossy. |
| Cross-editor moves with coupled undo | Independent editors copy, so no third holder keeps the content. |
| A session manager or backend framework for custom drivers | A custom driver calls `resolveDropTarget` and `transfer`. |

Sources: `plan` is `docs/plans/2026-10-01-dnd-transfer-consolidation.md` and `landing plan` is `docs/plans/2026-10-02-dnd-schema-derived-landing.md`. The last eight rows come from `docs/plans/2026-10-15-list-drag-landing.md`. `README` is `docs/plite/research/2026-10-02-dnd-library-choice/README.md`. The records are in `docs/research/review-records/`: `interrogation record` is `2026-10-01-dnd-transfer-interrogation.json`, `repair record` is `2026-10-02-dnd-transfer-consolidation-review-repair-execution.json` and `library record` is `2026-10-02-dnd-library-choice.json`.

## Hard cuts and app migration

Phase 3 deleted React DnD and `platejs/dnd/react`, and left no backend option. The landing plan deleted the landing read's admission result and `editor.read.transfer.source`; a copied `dnd.tsx` in a downstream app keeps its depth policy until it syncs. The consolidation plan's Public API pairs cover every code change the sources show, so this section adds no pair. The sources contain no `pstack:blast-radius` output. The callers below come from the plan's phase 3 step and its removed-nouns table.

**Deleted**

| Deleted | Replacement | Source |
| --- | --- | --- |
| `packages/platejs/src/dnd/` and the `platejs/dnd/react` export | Plite native drag and the copied kit | `plan` Phase 3 |
| `DndPlugin`, `DndDefinition`, `DndPluginState` | Kit-local plugin, `transfer.nodes`, `drag.start`, Upload | `plan` Removed public nouns; `landing plan` |
| `useDraggable`, `UseDraggableOptions`, `DraggableState` | Handle `onDragStart`, Plite hit-testing, `data-editor-dragging` | `plan` Removed public nouns |
| `useDropLine`, `DropLineDirection` | `useDropIndicator`, one per view | `plan` Removed public nouns |
| `useDndPlugin` | Session terminal paths | `plan` Removed public nouns |
| `DndScrollerOptions` | Plite drag autoscroll | `plan` Removed public nouns |
| `DRAG_ITEM_BLOCK`, `DragItemNode`, `ElementDragItemNode`, `FileDragItemNode` | Session source; `DataTransfer` stays at the boundary | `plan` Removed public nouns |
| `CanDropCallback`, `onDropHandler` | `transferVeto`; the drag selects `at` | `plan` Removed public nouns; `landing plan` |
| `onDropFiles` state | The React `UploadPlugin`, which lands every file drop | `dnd-ownership.md`; `plan` Files and Upload; [uploads review](../2026-10-09-uploads-review.md) |
| Body `dragging` class | `data-editor-dragging` | `plan` Removed public nouns |
| Hover-time focus and selection collapse | None; hover never mutates selection | `plan` Removed public nouns |
| `REFUSED_MOVE`, whole-children freshness, raw cross-editor inserts, `completeCrossEditorDrag` | Abort inside `transfer`; live content at drop | `plan` Phase 1 |
| `canDropNode` in copied `column.tsx` and `table.tsx` | Column and Table vetoes | `plan` Phase 1; `landing plan` |
| React DnD peers, `patches/react-dnd@16.0.1.patch`, `react-dnd-test-backend` | None | `plan` Phase 3 |
| `dnd-react` partition scripts, entrypoint tsconfig, build and DAG entries | None | `plan` Phase 3 |
| Shared HTML5 provider in `plate-dnd-cross-editor.tsx` | Per-`Document` native sessions | `plan` React DnD and touch |
| `kit-lifetime-probe/baseline-dnd.tsx`, `dnd-upload.spec.tsx` | Native kit probe; Upload specs | `plan` Phase 3 |
| Doctrine "Reuse an application-supplied DnD manager" | Native transfer law and the custom-driver route | `plan` Doctrine |
| `TransferLanding` | A landing middleware returns a `TransferEdge`; vetoes refuse | `landing plan` Removed public nouns |
| `editor.read.transfer.source` | `editor.read.transfer.nodes({ node? })`; the `editorReads.transfer.source` middleware stays for features | `landing plan` Removed public nouns |
| Column and Table landing middleware | Column and Table vetoes | `landing plan` Feature rules |
| Copied `UNDRAGGABLE_PLUGINS`, `getDraggableContainer`, `payloadOf` and the `container` prop | Handles from `isBlockContent` and `isSelectable`, blocks from `transfer.nodes` | `landing plan` Public API |

**Callers that break**

| Caller | Breaks because | Change | Source |
| --- | --- | --- | --- |
| App code importing `platejs/dnd/react` | The export is gone | Copy the native kit; see Public API | `plan` Phase 3 |
| Apps configuring `DndPlugin` `onDropFiles` | The option is gone | Install the React `UploadPlugin`; see Public API | `plan` Files and Upload; [uploads review](../2026-10-09-uploads-review.md) |
| Apps supplying a React DnD manager or backend | No backend option remains | Custom driver: `resolveDropTarget`, then `transfer.move` or `.copy` | `plan` React DnD and touch |
| Headless editors adopting `editor.api.transfer` | A missing plugin is a type error | Add `transfer()`; `react()` and Plate already include it | `plan` Public calls |
| Copied `dnd.tsx` | It imports deleted hooks and the plugin, and restates handle depths | Re-copy: native handle from the schema, indicator, actions menu, shortcut | `plan` Phase 3; `README`; `landing plan` |
| Copied `column.tsx`, `table.tsx` | `canDropNode`, item types and orientation are gone | Native `onDragStart`; rules live in features | `plan` Phase 1, Gesture |
| Copied `media-image.tsx`, `media-video.tsx` | Their custom handles used React DnD | The same native `onDragStart` | `plan` Scope, Gesture |
| Copied `block-menu.tsx` | Not broken; gains items | Move up, Move down and Cut | `plan` Non-drag move |
| Upload kit | `DndKit` no longer routes files | None; the React `UploadPlugin` lands file drops itself | `plan` Files and Upload; [uploads review](../2026-10-09-uploads-review.md) |
| CSS and tests reading body `.dragging` | The class is no longer set | Read `data-editor-dragging` | `plan` Removed public nouns |
| A landing middleware returning `{ admit, to }`: Column, List and Table here, and any app middleware | `TransferLanding` is gone | Return an edge or call `next()`; refuse through `transferVeto` | `landing plan` Blast radius |
| A caller of `editor.read.transfer.source`: copied `dnd.tsx` and the docs | The read is gone | Call `editor.read.transfer.nodes({ node })` | `landing plan` Blast radius |
| A custom driver that rebuilds `{ edge: target.edge, key: target.key }` from `resolveDropTarget` without `files` | `DOMDropTarget` gains a `{ key, side }` arm | Pass the target through, or narrow with `'edge' in target` | `side drop plan` Public API |
| Code that switches exhaustively over `TransferTarget` or `TransferLandingTarget` | A new arm | Handle the side arm or pass it through | `transfer-types.ts:15`, `:21` |
| Readers of `TransferCheck.to`, including `landed()` in `dom-drag.ts` | An admitted side reports the requested `{ key, side }` | Narrow with `'side' in to` | `transfer-types.ts:104` |
| A veto that judges depth from `target` alone | A wrap lands deeper than its edge: two levels for a new group, one for an added column | Read `wrap`; every in-tree veto gets a case | `landing.ts:227-229` |

The side drop deleted nothing; four types widened. A files drop never resolves to a side, but the return type still includes one, so Upload narrows with `'edge' in target` (`UploadPlugin.tsx:51`). `DropIndicator` keeps its shape. A side publishes `axis: 'x'`, the physical edge, the target's key and a zero-width line at that rect side (`side drop plan` Hard cuts).

Repo callers updated in phase 3: `plate-dnd-cross-editor.tsx`, `lifetime-browser-probe.tsx`, the mocks in `media-image.spec.tsx` and `media-video.spec.tsx`, `plate-dnd-cross-editor.test.ts:116`, `tooling/e2e/homepage-dnd.test.ts:61`, and `dnd.mdx`, `media.mdx`, `table.mdx` with their Chinese twins (`plan` Phase 3).

**Behavior apps see**

| Behavior | Before | After | Reverse with | Source |
| --- | --- | --- | --- | --- |
| Drop between independent editors | Moved, settled at drag end | Copies | Move, with source removal in its own history batch | `plan` ledger, Reversible defaults |
| Source edited during the drag | Degraded to copy | Moves live content; a deleted source refuses | Copy when the dragged content changed | `plan` Reversible defaults |
| Lossy move | Deleted the whole source | Refuses; a copy reports its loss | not recorded | `dnd-ownership.md` defect table |
| `Mod+Shift+ArrowUp` and `ArrowDown` | Native select to boundary | Move the blocks containing the selection | Bind the move only while blocks are node-selected | `plan` Non-drag move, Reversible defaults |
| Text dragged into another application | `deleteByDrag` deleted the source | Copies | not recorded | `plan` law 9, ledger |
| Copy modifier | React DnD Alt; Plite Ctrl off Apple | Alt on Apple, Ctrl elsewhere | not recorded | `dnd-ownership.md`; `plan` law 2 |
| Upload draft moved across roots | not in the sources | Refuses | not recorded | `plan` Landing policy |
| Blocks landed by a cross-editor drop | not in the sources | Node-selected; typing replaces them (open finding 4) | not recorded | `plan` open finding 4 |
| Touch drag | Promised by docs | Handle actions; an app-written pointer driver | not recorded | `plan` ledger |
| Paste of a footnote definition | not in the sources | Can still nest a definition; a transfer lands one only at the top level | not recorded | `landing plan` Open findings |
| Insert after an empty details summary | not in the sources | A command insertion still replaces the summary; a file drop lands beside it | not recorded | `landing plan` Open findings |
| Details summary placement | not in the sources | Paste and insert can put a summary after the first child; a transfer keeps it first | not recorded | `landing plan` Open findings |

Sources: `plan` is `docs/plans/2026-10-01-dnd-transfer-consolidation.md`, `landing plan` is `docs/plans/2026-10-02-dnd-schema-derived-landing.md` and `side drop plan` is `docs/plans/2026-10-06-dnd-side-drop-columns.md`. `dnd-ownership.md` is the retired decision page, read with `git show 2e865a0bc4:docs/research/decisions/dnd-ownership.md`. `README` is `docs/plite/research/2026-10-02-dnd-library-choice/README.md`.

## Native behavior and proof

| Behavior | What changes | Proof surface | Source |
| --- | --- | --- | --- |
| Selection | Drags select what landed; keyboard moves keep selection by key; hover never mutates it | `transfer-contract.test.ts` kept caret; follow-up typing in Playwright Chromium and Firefox | `plan` Public calls, Phase 2, open finding 6 |
| Selection after a cross-editor copy | Landed blocks stay node-selected; a gap click keeps it; typing replaces them | unproven: open finding 4, no fix | `plan` open finding 4 |
| IME | Unchanged; the drag handoff stays inside native-input authority | No IME case in the sources | `ownership record` reconciliation |
| Clipboard: drag out | `deleteByDrag` deletes nothing, so dragged-out text copies | Package test `model-input-strategy-contract.test.ts`; OS drag and Android unproven | `plan` law 9, Phase 1 |
| Clipboard: Cut action | Cut writes HTML and plain text, then removes the blocks | unproven: no browser case | `plan` Phase 2 |
| Lossy landing | A lossy move refuses, in edit and propose views; a copy reports its loss | `transfer-contract.test.ts`, `max-length-contract.test.ts`; red log `r2-red-propose-skip.log` | `repair record`; `plan` law 1 |
| Undo | One update and one undo entry per transfer; a refusal records nothing | `transfer-contract.test.ts`; `plate-dnd-cross-editor.test.ts` undo in Playwright, three engines | `plan` law 5, Phases 2 and 3 |
| Focus | `drag.start` blurs a focused source view; it stays blurred after Escape or refusal | A Playwright WebKit run drove the blur; restoring focus is open (finding 7) | `plan` Phase 3, open finding 7 |
| Drag preview | `drag.start` returns inert clones and origin; the handle sets the drag image | www `dnd.spec.ts` preview origin, Playwright Chromium, five runs | `plan` Gesture, Phase 3; `execution record` |
| Drop indicator | One indicator per view paints only admitted edges, clears at drag end, re-resolves after each scroll and paints while the pointer is on a control inside the editor | Native bridge package test; two-view case in Playwright, three engines; www `dnd.spec.ts` scroll and button cases, three engines, five runs each; still pointer unproven | `plan` Phase 3, open finding 6; `side zones plan` Steps 1 and 2 |
| Hover cost | `dragover` p95 0.8 ms native against 0.2 ms React DnD at 5,000 blocks; `resolveDropTarget` takes 0.03 to 0.04 ms over a block and in the root gutter, flat from 300 to 15,000 blocks, with 3,000 closed details too; the cases where a dragover still scales are in `landing plan` Open findings | Benchmark on React development builds, within the baseline-plus-1-ms budget; no production build; `resolveDropTarget` in a Playwright Chromium probe on the homepage view and a virtualized 5,000-block document | `README`; `execution record`; `landing plan` dragover lane |
| Cross-editor drop | Independent editors copy; views and roots of one document move | `cross-editor-drag`, `plate-dnd-cross-editor` in Playwright Chromium, Firefox, WebKit, 15 runs | `plan` law 4; `repair record` |
| Copy modifier | Alt on Apple, Ctrl elsewhere, read from the native drop event | Playwright modifier cases in three engines; OS negotiation unproven | `plan` law 2, Proof; `dnd-ownership.md` |
| File drop | Upload lands files at the painted keyed edge and consumes refused drops; a drop checks one block per dropped file against the parent's content, with the limits in `landing plan` Open findings | `UploadPlugin.spec.ts` package test; `dom-drag-geometry.test.ts` multi-file case; www `files-sdk.spec.ts` in Playwright Chromium | `plan` Files and Upload, Phase 3 |
| Native text drop caret | No kit code prevents default on document `dragover` now | unproven: Playwright cannot start a text-selection drag | `plan` Current state, open finding 6 |
| Autoscroll | Plite autoscroll follows nested scrollports and pauses outside the window | Page autoscroll in Playwright; nested scrollport and window leave unproven | `plan` Gesture, open finding 6 |
| Cancel and cleanup | Every terminal path ends the session and removes transient listeners | Escape and mid-drag removal in Playwright, three engines; listener package tests, 76 pass | `repair record`; `plan` Phase 3 |
| Non-drag move | Handle actions, `Mod+Shift+ArrowUp/Down` and a success announcement; steps stay among siblings, inside containers too, and a step whose blocks span parents or whose landing redirect leaves the parent refuses | `transfer-contract.test.ts`, including the mixed-parent and redirect refusals; www keyboard and handle cases, Playwright Chromium; no screen reader run | `plan` Phase 2; `landing plan` Proof |
| Touch | Handles stay visible under `(hover: none)`; touch drag is no longer promised | unproven: no iOS or Android device ran | `plan` Non-drag move, open finding 3 |
| Drop into containers | A block lands inside a blockquote, details body, footnote definition, column item or table cell | www `dnd.spec.ts` blockquote, cell and column cases, Playwright Chromium, Firefox and WebKit, five runs each; details body and footnote by package spec | `landing plan` Proof |
| Drop beside containers | Below a quote, after a trailing table, after a table inside a quote, a nested quote dragged out below its quote, a heading's top margin, the gutter beside a list item, below the last block | www `dnd.spec.ts`, three engines, five runs each | `landing plan` Proof |
| Grab and release | A handle grab and release moves nothing, even where a container's band overlaps the dragged block or its handle's gutter; an Alt-drag onto the dragged block still copies | `dom-drag-geometry.test.ts` payload stop, band overlap and handle gutter; www `dnd.spec.ts` copy onto itself, three engines | `landing plan` Proof |
| Collapsed details | A closed details takes drops only beside itself; one with only a summary still takes a drop into its hidden body, and a custom driver that computes its own edge can land in a collapsed body (open: `landing plan` Open findings) | www `dnd.spec.ts` closed details, three engines; the summary-only case is an open finding | `landing plan` Proof, Open findings |
| Handles at any depth | Every selectable block shows a handle on hover, only the innermost one, and a selected table keeps the editor's handles | `dnd.spec.tsx`; www `dnd.spec.ts` single handle and nested drag, three engines | `landing plan` Proof |
| Side drop | A block dropped on the innermost block's side strip lands beside it as a column; a strip that does not admit falls through to today's edges | `dom-drag-geometry.test.ts` and www `dnd.spec.ts`, Playwright Chromium, Firefox and WebKit, five runs each | `side drop plan` Phase 2 |
| Undo after a side drop | One undo entry restores the original blocks and keys | `transfer-contract.test.ts`; www `dnd.spec.ts` | `side drop plan` probe P1 |
| Selection after a side drop | The landed blocks are node-selected, as for any move | `transfer-contract.test.ts` | `transfer.ts` `landed` |
| Non-drag beside | "Move beside" handle actions, by click and keyboard | www `dnd.spec.ts`, Playwright Chromium; no screen reader run | `side drop plan` Phase 1 |
| Hover cost with strips | A copy or file drag runs no strip check. A move's strip check refuses fast when nothing builds a side, and the check cache keeps one result per checked target, so a pointer resting in a strip adds no uncached admission after the first dragover and no rect reads | Benchmark dragover p95 in four cohorts, with and without Column; admissions counted only in the geometry test, not in the browser | `side drop plan` Phase 2 |
| Collaboration | A wrap keeps local keys. Concurrent remote text edits survived in a plain schema for both this commit and a remove-then-insert control, so no test claims the commit shape protects them | none; probe P5 recorded as partial | `side drop plan` probe P5 |
| Outside side zones | A block dropped in the padding beside a top-level block lands beside it, once the pointer is 20 px past where the drag started on that side, so a straight drag from a handle in the padding lands above or below | `dom-drag-geometry.test.ts`; www `dnd.spec.ts` in three engines, five runs each | `side zones plan` Step 3; `origin plan` |
| Marquee beside side zones | A pointerdown in the padding still starts block selection | www `dnd.spec.ts` `dnd:block-selection-from-side-padding`, three engines, five runs each | `side zones plan` Step 3 |
| Text drag that moves list items | Items land at the drop item's depth and keep their own list unless they join the drop item's; the emptied source blocks leave as today | List spec case A and the Word-continued case; Chromium dispatched drag on `/blocks/list-demo` | `list drag plan` |
| Text drag that moves plain text | Unchanged, because the default landing hook returns the slice as given | Existing transfer contract cases, which pass unchanged with the move-as-paste spike, and again on the final patch | `list drag plan` |
| Text drag whose landing would change an undeclared property | Refuses and changes nothing | Raw Plite refusal cases | `list drag plan` |
| Undo after a move or a copy | One step, as before | The new contract and List cases undo once | `list drag plan` |
| Block drag that copies list items | Copies keep their depth and join the list beside them or start their own | List spec cases C, D2, E and the nested, head and long-family cases; Chromium handle drag with the copy modifier on `/blocks/list-demo` with rendered numbers | `list drag plan` |
| Hover indicator | Paints only edges the drop admits; for a block copy or move it runs the adopt hook once per edge | Existing hover cases, the title-role refusal case and the work-count case for a copy and a move | `list drag plan`, `list move plan` |
| Block drag that moves | A block moved beside another list of its kind joins it; one moved inside its own list, or beside no list of its kind, keeps its list and starts | List spec move cases; Chromium handle drag on `/blocks/list-demo` with rendered numbers | `list move plan` |
| Keyboard move into another list | A step that lands beside another list of its kind joins it; stepping back past a paragraph rejoins its old list, while a step back out of a list right next to its own stays in the list it joined | List spec step cases; Chromium `Mod+Shift+ArrowDown` on `/blocks/list-demo` with rendered numbers | `list move plan` |
| Text drag whose landing changes the block that holds the range's end, empty or not, or a block containing it | Refuses and changes nothing | Step 1's raw Plite cases, through a landing read and through a correction | `move guard plan` Step 1 |
| Text drag whose range ends at the start of a block the source merges away, from inside a block or from a block's end | Lands, with that block's settings around the drop point's following text. Before, such a range refused when a whole block sat between its ends (F3) | Step 1's controls; probes F3 and A2 (`proof/p1-d3-probes-a1.log`, `proof/p1-v5-probes-a1.log`) | `move guard plan` Step 1 |
| Text drag or Option-drag copy whose range starts at a block's end or ends at a block's start | The returned range and the selection after the drop start at the end of the drop point's text block, or end at the start of the block that holds the drop point's following text | Step 1's copy-range and empty-edge cases; the copy run (`docs/plans/artifacts/2026-10-15-move-landing-guard/proof/v7/oracle-copies.log`) | `move guard plan` Step 1 |
| Text drag or Option-drag copy with an end at a link's edge | The returned range and the selection cover the link the landing wrote, and stop outside a link the drop splits | Step 1's link cases; the copy run | `move guard plan` Step 1 |
| Option-drag copy that starts at a block's end or ends at a block's start | Lands without saying that some content does not fit (486 copies in the copy run). A copy that holds no characters and ends at a link's start, dropped at the end of a link's text, now says it (14 copies), though it lands the same | Step 1's copy cases compare the whole outcome; the copy run | `move guard plan` Step 1 |
| Text drag of whole list items out of a quote into an empty paragraph | Lands at the drop's depth; one undo restores the source | Step 2's List case | `move guard plan` Step 2 |
| Delete, Backspace, cut or typing over a selection across blocks, with an empty block right after the block the selection ends in | The empty block stays. Before, the delete removed it, and a text drop into it landed in the block above (C9) | Step 1's raw `deleteText` and move cases | t_057f43b6 |
| Delete or a text move whose selection ends inside an inline void, such as a mention, at the start of a later block | The void goes with the selection, and the blocks merge. Before, the delete kept the void and the move landed a second copy | Step 1's cases; the void sweep rerun | t_8b0aa6dc |
| Delete or a text move whose selection starts or ends inside an inline void across blocks | The blocks merge after the void goes. Before, they stayed apart | Step 1's cases | t_8b0aa6dc |
| Text move whose selection starts at a block's start and ends at a later block's start | Only the text moves; the start block stays, emptied, and the end block keeps its settings once. Before, the move landed a second copy of the end block's settings | Step 2's rewritten case | t_6ef9e292 |
| Text move whose landing a correction deletes beside identical text | Refuses and changes nothing, on a plain editor and in Editing and Suggesting views | Step 3's cases | t_33ab69a9 |
| Text move that carries no characters, such as a line break between closed titles or a link's opening edge | Lands the document the final bytes of `move guard plan` landed, adding an empty title or an empty link. Its returned range now covers what it added, where those bytes returned a point inside the original link | Step 3's cases from diff round 1 of `move guard plan` | t_45a9856d |
| Forward Delete at a line's end, before an empty line and then another author's pending empty line | One empty line goes. Before, both went | Step 1's authored law in `authored-tree-commands.test.ts` | t_057f43b6 |
| Text move dropped at either edge of what its deletion removes, such as right after a mention its selection ends inside | Refuses as `no-op`. Before, it reported a move and changed nothing, or landed a second mention or empty block | Step 1's case; the oracle | t_8b0aa6dc |
| Text move whose deletion removes nothing, such as a selection of only an empty line | Refuses as `no-op`. Before, it added a line break or an empty link at the drop, or reported a move and changed nothing | Step 2's case; the oracle | t_6ef9e292 |
| Text move whose selection ends at a link's opening edge | Moves the text before the link. Before, it also landed an empty copy of the link | The oracle | t_8b0aa6dc |
| Text move from one block to the start of the line after a nested quote, dropped inside a line's text | Refuses as `schema`, as pasting the same text there does. Before, it landed and kept a second copy of the end block | The oracle | t_6ef9e292 |
| Text move whose selection still has an edge inside a non-editable element other than an inline void, such as a read-only block, a read-only inline or an atom, once an end at a line's start is pulled back | Refuses as `lossy` and changes nothing. Before, it lost the block's other text, copied a character or the atom's text, or turned the drop line into a heading | `transfer-contract.test.ts` read-only block cases for a start and an end edge; `d2-cases` | panel rounds 2 and 3 |
| Delete across blocks with an edge inside a block void nested in a container, or inside a read-only inline that is not a void | The blocks stay apart and the inline stays, as at `dc4e679307`. The build's first merge rule had merged them | `delete-contract.ts` nested block void and read-only inline cases | panel rounds 1 to 3 |

Playwright WebKit is not Safari, and synthetic `DragEvent` cases prove event handling, not OS drag negotiation (`plan` Proof). The www specs, homepage e2e, registry build, create-install and benchmark ran before the round 2 repairs (`repair record`).

Sources: `plan` is `docs/plans/2026-10-01-dnd-transfer-consolidation.md`, `landing plan` is `docs/plans/2026-10-02-dnd-schema-derived-landing.md`, `side drop plan` is `docs/plans/2026-10-06-dnd-side-drop-columns.md`, `side zones plan` is `docs/plans/2026-10-07-dnd-side-zones-and-scroll.md`, `origin plan` is `docs/plans/2026-10-07-dnd-left-zone-from-drag-origin.md`, `list drag plan` is `docs/plans/2026-10-15-list-drag-landing.md`, `move guard plan` is `docs/plans/2026-10-15-move-landing-guard.md` and `list move plan` is `docs/plans/2026-10-15-list-move-landing.md`. The records are in `docs/research/review-records/`: `execution record` is `2026-10-02-dnd-transfer-consolidation-execution.json`, `repair record` is `2026-10-02-dnd-transfer-consolidation-review-repair-execution.json` and `ownership record` is `2026-10-01-dnd-native-transfer-ownership.json`. `README` is `docs/plite/research/2026-10-02-dnd-library-choice/README.md`. `text move plan` is `docs/plans/2026-10-15-text-move-landing.md`.

## Main changes

- One Plite `transfer` action owns every move and copy. A move inside one document lands whole in one undo step or refuses; a drop into another editor copies.
- The Editable owns block drag sessions. It resolves each `dragover` and `drop` through the transfer dry pass, paints a per-view indicator and settles its own session before plugin drag handlers run.
- A block lands wherever the compiled schema places it. List redirects an edge through read middleware, and Column, Table, Details, Footnote and Upload keep their limits as vetoes, replacing per-gesture React DnD callbacks.
- `platejs/dnd/react`, `DndPlugin`, its store and the `react-dnd` dependencies are deleted; the copied `dnd` kit renders handles, the action menus and the indicator.
- The move check runs on the corrected draft in the projection the update wrote, before the authored runtime turns it into a proposal or accepted content, through an internal draft guard in `packages/plitejs/src/core/public-state.ts`.
- **One per-edge law.** `landAt`, in its own module beside `packages/plitejs/src/core/transfer.ts`, replaces `checkNodeLanding` and the landing half of `resolveLanding`; `checkFilesLanding` stays as the files request over `landAt`. It checks the input edge's target and identity, applies the landing redirect, then checks the final edge's target, identity, placement and every veto. Placement checks what lands: the payload for an in-place move, the content slice the transfer inserts for a node copy or a move into another root, and one block per dropped file. The check and the execution share that slice. The drop's fitter alone decides a text range at a block edge, because the range's slice keeps open ancestors that the fitter merges or unwraps.
- **One placement predicate in the schema.** A new internal `canPlaceAt` in `packages/plitejs/src/core/editor-schema.ts` simulates the parent's children after the transfer and checks the prefix window, the payload positions and `max`. The landing law uses it; commits already refuse a shifted prefix, so the validator stays as it was.
- **Schema legality is the default.** The root-only default goes. A nested edge is admitted where the target's parent has a compiled content program, or the root for root edges; without one, the landing stays root-only.
- **Hover geometry follows one rule at every level.** `packages/plitejs/src/dom/plugin/dom-drag.ts` finds the level's child under the pointer with one hit test on the level's center line, falls back to a binary search over its mounted children that skips unmounted ranges, bands container edges, and returns no target while a move's pointer is over or alongside its own blocks, the handle's gutter included, before any band. On the mounted homepage cohorts a dragover reads 3 to 8 rects over a block, a nested block or the gutter, and 17 to 23 in margins and below the content, where the fallback search grows with log n; the virtualized 5,000-block gutter reads 14.
- **Copied handles follow the schema.** `dnd.tsx` gives every selectable block-content element a handle, shows only the innermost hovered one, keeps the hover flag off React state and keeps a nested gutter out of layout until it is hovered or node-selected. On a device without hover, a selection holding the block also lays it out. A selected table no longer hides the editor's handles.
- **A keyboard step stays in one parent.** `resolveStep` refuses a payload whose blocks span parents and a landing redirect that leaves their parent.
- **Upload replaces only an empty block-content block.** A file dropped after an empty details summary lands beside it, because the summary is not block content.
- **A feature read decides what a side target builds.** `{ key, side }` resolves through the new `editorReads.transfer.side` read to a `TransferWrap` or `null`. Without a contributor the read refuses `policy`. The landing read keeps its redirect-only law and List's middleware does not change.
- **`TransferWrap` is one of two shapes.** `{ shell, payload, target }` takes the target's place and moves the target into its slot. `{ shell, payload, ancestor, edge }` lands the shell at `edge` of the target's ancestor `ancestor` levels up, as Column does to add a column beside a block's column. A feature never names a key: a read's state keys belong to the runtime owner, and a view editor resolves its own (`side drop plan` decision log, root cause row). `landBeside` resolves the anchor to a live key, and admission carries one tagged landing for an edge, a point or a wrap.
- **`transfer.ts` keeps the commit; `transfer-guard.ts` holds the draft guard.** The relocate and wrap commits share one move chain, and the file drops below its base size.
- **Column width correction rescales an over-full group.** When widths sum above 100 beyond float noise (1e-6), which only an inserted column produces, the correction scales every width by `100 / sum`. Below 100 it keeps today's additive rule. A joined column gets the mean width, so it ends at `100 / (n + 1)` and the others keep their ratios.
- **`landAt` judges every block a wrap moves.** Identity skips the contiguity no-op for a side. The target moves alone. A target whose `editorReads.transfer.source` expansion holds more than itself, such as a list item with deeper items, refuses `policy`. A target that is a payload entry or an ancestor of one refuses `inside-source`. Placement checks the filled shell in the anchor's parent, removing the payload's indices there and, for a new group, the target's index. It then checks each slot's content. Vetoes run once for the payload. For a new group they run again for the target, with `payload` as `{ kind: 'nodes', nodes: [target], parentKeys: [its parent's key] }`, `from` as the view, `intent: 'move'`, `relation: 'document'`, and the anchor's `target` and `edge`. Both runs set `wrap`. The draft guard expects the target and the payload in their slots.
- **`runTransfer` commits a wrap inside its one update.** It inserts the shell at the anchor edge, moves the target into its slot for a new group, then moves the payload into its slot. A side admits only a payload that relocates by `tx.nodes.move`, the transfer's no-slice case. A copy, a cross-editor drop, a read-only source and a cross-root move on a side refuse `policy`.
- **The DOM driver finds side strips without schema knowledge.** Only the innermost block under the pointer has a strip, at its inline end only: the drift gate showed a start strip catches a straight drag down. The strip runs only for a move; without a `transfer.side` contributor its check refuses at once. It is the outer `min(24px, width / 4)` of that block's rect, excluding its top and bottom quarters, where y edges and container bands win. The block's computed `direction` decides which physical side is its end.
- **The check cache keeps one result per target.** `checkTransfer` caches each checked side or edge per editor until the document, either view's read-only state or the plugin configuration changes, so a dragover's candidate edges and a strip's side check stop evicting each other.
- **The drop line re-resolves on scroll.** While a block drag session is active, a capture `scroll` listener on the document re-runs `resolveDOMDropTarget` for the last view that handled a dragover, with that dragover's pointer and copy intent, at most once per animation frame. The session's `release` removes it, and a view drops its repaint on `dragleave`. The repaint runs through the DOM phase scheduler under one key, so a frame resolves once. The resolver hit-tests with `elementFromPoint` on this path, because the old event target may have scrolled away. Autoscroll then needs no reorder, because its scroll fires the same listener.
- **Block drags pass through interactive elements.** `applyEditableDragOver` and `applyEditableDrop` skip the `isInteractiveInternalTarget` refusal when the session is a block drag. Text and file drags keep it.
- **Top-level blocks get outside side zones.** When the pointer is outside the root's content column, the resolver tests the anchor's padding zones before the edge loop. The anchor is the root-level block `probeAt` already finds. Each zone covers the block's full height and counts once the pointer is 20 px past where the drag started on that side, so a straight drag from a handle in the padding stays above or below. Its side is `end` or `start` by the block's computed direction. A zone that does not admit falls through to the edge loop, as the inner strip does. Blocks inside a column, cell, quote or details get no outside zone.
- **A padding side zone is measured from the drag's start.** `drag.start` records the pointer's x, kept until the session settles because `takeDragSession` removes the session before the drop resolves its target. Without a recorded start, as for a custom driver, the whole padding counts.
- **A copied text drop lands as a paste.** `runTransfer` in `packages/plitejs/src/core/transfer.ts` sends a copy to a `point` through `readAtSliceFitTarget`, `limitSliceToLength`, `landSlice`, the `replaceEmpty` attempt and `withCommandSliceFit`, in the order the `replaceSlice` command runs them, without command handlers. The landing guard checks the content that actually landed, and a copy the length limit cuts reports a `lossy` diagnostic itself. Every edge or wrap landing keeps its path.
- **A text move lands as a paste.** `runTransfer` sends a text move to a point through the same paste plan with `intent: 'move'`, inside the move's landing role, after the source range is removed. The move guard in `packages/plitejs/src/core/transfer-guard.ts` then refuses any change to the moved content other than to properties declared `landing: 'rebase'` or `'adopt'`.
- **Admission runs the adopt read for a block copy or move.** `landAt` in `packages/plitejs/src/core/landing.ts` resolves the edge, then `adoptAt` asks `editorReads.transfer.adopt` for patches and checks each against the declarations before `judgeLanding` runs placement and vetoes on the adopted blocks. A move patch that sets `null` refuses with `policy`, because `tx.nodes.set` removes a `null` property. A keyboard step does the same in `resolveStep`. Hover and drop share that admission, and the check cache limits it to once per edge.
- **List keeps moved items in their list and places dropped copies.** `landListContent` in `packages/platejs/src/features/list/lib/listPaste.internal.ts` keeps moved items' ids unless they join the drop item's compatible list. `adoptListBlocks` in `listIdentity.internal.ts` joins at most one copied list to the list beside the drop edge, checking the item before it, after it, then the item it lands under, and gives every other copied list a fresh id.
- **A move's guard compares what landed with what moved.** `carryMove` in `packages/plitejs/src/core/transfer-guard.ts` runs once, right after a text move lands. It lines up the moved slice and the slice the fit wrote by their head chains, and exempts the shells the source keeps that the landing read peeled or the fit merged. On every plain guard pass, `landsMoved` lines the landed fragment up the same way, skips the block the head merged into and the blocks that hold it, and compares each other landed block with its moved block. It skips the properties declared to follow the drop where the block landed. `LandingShape` and `landingTokens` go.
- **`deleteText` decides what a text move carries.** `resolveDeletedRange` in `packages/plitejs/src/transforms-text/delete-text.ts` returns the range a delete removes, and `runTransfer` slices that range, so a hanging range moves as its unhung range and an inline void the range enters goes with it. It returns `null` when an edge stays inside another non-editable element, and the move refuses. `deleteText` merges after nudging an edge only out of an inline void and sizes its structural cleanup by the top-level blocks the merge removed.
- **The landing reports where it wrote, and the guard follows it.** The fitter in `packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` reports where the slice's own tokens land when the move asks. `packages/plitejs/src/core/draft-track.ts` carries those positions through later draft steps, the recorder's commit and a command frame's commit, and the guard in `packages/plitejs/src/core/transfer-guard.ts` reads the landed range or each landed block from that track. `landedRange`, `openEdge`, `outsideInlines`, `mapDraft` and `measureDraftInsertion` go.
- **List joins a copied list by the item at the join's depth.** `adoptListBlocks` in `packages/platejs/src/features/list/lib/listIdentity.internal.ts` checks the kind of the copied item at the join's depth nearest the drop edge, not the first copied item.
- **A relocating move sets its patches on its own nodes.** After `moveChain`, `runTransfer` in `packages/plitejs/src/core/transfer.ts` sets each patch on the moved node it addresses, by key plus the patch's inner path, through read-only ancestors, in the same update. The move guard expects the patched nodes and compares their properties whatever the key order, in `transfer-guard.ts`. A move into another root lands the patched slice, as a copy does.
- **List joins a moved list only to another list.** `adoptListBlocks` in `packages/platejs/src/features/list/lib/listIdentity.internal.ts` skips the moving nodes in its walk, returns no patch when the move stays in its root and the block beside the gap on either side is an item of the moved list's own list, and gives unjoined moved lists no fresh id. A copy reads the item after the gap only when the item before it does not join.
- **Adoption counts its copying.** `adoptAt` in `packages/plitejs/src/core/landing.ts` adds the child entries it copies along each patch path to `landingMetrics.copiedEntries`, which the work case reads. It catches repeated child-array copies, not other work per patch.

## Open findings

- **Details summary prefix grammar.** A content prefix would keep the summary first for paste and insert too, but stored details with a non-first or second summary would fail to load until a pre-validation repair moves or demotes them. Owner: Plate Details, tracked in the `landing plan` decision log.
- **Root-only footnote definitions in the schema.** Paste can still nest a definition. Owner: Plate Footnote, tracked in the `landing plan` decision log.
- **Custom drivers and collapsed content.** A driver that computes its own edge can land a block in a collapsed body. Owner: Plite DOM, tracked in the `landing plan` decision log.
- **A closed details with only a summary.** A drop after its summary lands in its hidden body, because coverage has no empty range: a reversed `from 1, to 0` range is flipped and covers the summary itself. Owner: Plite DOM coverage (`packages/plitejs/src/dom/plugin/dom-coverage.ts`), tracked in the `landing plan` decision log.
- **Inserting after an empty summary.** A command insertion after an empty details summary still replaces it, because `isReplaceableEmptyBlock` does not check block content. Owner: Plate block insertion (`packages/platejs/src/internal/plugin/blockInsertion.ts`), tracked in the `landing plan` decision log.
- **Empty-anchor replacement on file drops.** A drop after an empty block-content block replaces it through Upload's `replaceEmpty`, outside `canPlaceAt`, so an empty block in a prefix slot can be replaced. Owner: Plite transfer (`packages/plitejs/src/core/landing.ts`) with Plate Upload, tracked in the `landing plan` decision log (panel round 1).
- **Collapse and unmounted landings.** The collapse refusal runs only in DOM hover, on the edge before the redirect, and a redirect to an unmounted block accepts a drop with no indicator. Owner: Plite DOM, tracked in the `landing plan` decision log (panel round 1).
- **Coverage lookups inside one container.** The coverage index buckets boundaries by top-level block, so a dragover inside one large container reads all of its boundaries. Owner: Plite DOM coverage (`packages/plitejs/src/dom/plugin/dom-coverage.ts`), tracked in the `landing plan` decision log (panel round 1).
- **Non-list blocks between list items.** A paragraph dropped after a parent item splits it from its deeper items, as before this plan. Owner: Plate List, tracked in the `landing plan` decision log (panel round 1).
- **Source middleware idempotence.** A drag expands its keys at start and again at drop, so `editorReads.transfer.source` middleware must be idempotent, which its JSDoc does not say. Owner: Plite transfer, tracked in the `landing plan` decision log (panel round 1).
- **A family moving past a family.** A keyboard step that crosses a family of K items while moving a family of P items does K times P membership work. Owner: Plate List, tracked in the `landing plan` decision log (panel round 2).
- **The file stand-in.** Every stand-in block has kind `file`, while `submit` creates each block with its file's own kind. An engine that hides `dataTransfer` items during dragover also checks one block for an N-file drop. Owner: Plate Upload, tracked in the `landing plan` decision log (panel round 2).
- **Two selection subscriptions per handle.** Each `Draggable` subscribes to the intersecting and the node selection. Owner: Plate UI `dnd.tsx`, tracked in the `landing plan` decision log (panel round 2).
- **Why a dragged block keeps its gutter laid out.** The copied handle keeps a node-selected block's gutter laid out during a drag. The likely reason, a native drag losing its source when the gutter leaves layout, is unverified, so the comment states only the mechanism. Owner: Plate UI `dnd.tsx`, tracked in the `landing plan` decision log.
- **WebKit setup sees the editor hidden.** Some WebKit runs of `apps/www/tests/browser/dnd.spec.ts` fail one or two cases in `ready()`, before any action, with the editor reported hidden for 20 seconds; 50 probe loads did not reproduce it. Owner: Plate test harness (`packages/test/src/playwright/ready.ts`), tracked in the `landing plan` decision log.
- **Table row admission scans every grid anchor.** The Table vetoes compile the grid once, then test every anchor for a split or spanned row, so one check against a 3,000-row table visits 6,000 anchors. Owner: Plate Table (`packages/platejs/src/features/table/lib/BaseTablePlugin.ts`), tracked in the `landing plan` decision log (panel round 1).
- **The horizontal fallback reads every mounted sibling.** A column group or table row with no hit under the pointer falls back to reading every mounted child's rect, and neither schema caps that count. Owner: Plite DOM (`packages/plitejs/src/dom/plugin/dom-drag.ts`), tracked in the `landing plan` decision log (panel round 1).
- **The 10-01 plan's landing promise.** `docs/plans/2026-10-01-dnd-transfer-consolidation.md:241` says "Middleware only widens or retargets"; this plan's landing read only redirects, so that line is superseded. Owner: the 10-01 plan's owner (zbeyens), tracked in the `landing plan` decision log.
- **Handle actions inside a containing selection.** `openActions` keeps a node-selected table when a cell block's handle opens its menu. Owner: Plate UI `dnd.tsx`, tracked in the `landing plan` decision log (panel round 1).
- **RTL handle side.** The copied gutter has no RTL variant, so in right-to-left text the handle may sit inside the block's right edge, and `HANDLE_CLEARANCE` assumes a left handle. No RTL browser case ran. Owner: Plate UI `dnd.tsx`, tracked in this plan's decision log (RTL deferral row).

## Open work

Each item is tracked here; `side drop plan` is `docs/plans/2026-10-06-dnd-side-drop-columns.md`, `list landing plan` is `docs/plans/2026-10-14-transfer-list-landing.md`, `list drag plan` is `docs/plans/2026-10-15-list-drag-landing.md` and `move guard plan` is `docs/plans/2026-10-15-move-landing-guard.md`. `text move plan` is `docs/plans/2026-10-15-text-move-landing.md`.

- **Side-drop proof gaps.** The side drop shipped with ten steps only partly proven: no cross-root side test, no x-axis geometry case, no browser count of admissions, no browser case for the menu in an editor without Column, no Vision forward test, and most mutation controls ran on bytes before the last restructure. The docs check was red at HEAD when it closed. From the `side drop plan` Close. owner: zbeyens. stop: each gap gets its case, or zbeyens accepts the gap.
- **Pragmatic Drag and Drop.** A private PDD driver is deferred until it deletes responsibility: a candidate must keep native text, one nested-view recipient, iframe mounting and same-window custom MIME before its production cost is compared with native. owner: Benchmark. stop: that bounded experiment runs, or zbeyens drops it.
- **Emptied-column cleanup.** Dragging the last block out of a column leaves a padded empty column, and a group never drops below two columns. A cleanup at transfer time loses a concurrent remote insert into the removed column. In Plate Column, the `layout` review scope. owner: zbeyens. stop: the `layout` review decides the cleanup, or zbeyens drops it.
- **List's landing redirect returns owner keys.** `BaseListPlugin.ts` returns `state.key(...)`, the mechanism that made the side read refuse from a view editor. Inferred, not reproduced. In Plite transfer read state (`packages/plitejs/src/core/landing.ts`). owner: zbeyens. stop: a view-editor case reproduces or clears it.
- **Read middleware handlers get no contextual return type.** Column's side read needs `as const` on its edge literals because `PluginReadContext.around` (`packages/plitejs/src/interfaces/editor.ts`) does not type the handler's return. owner: zbeyens. stop: the read typing infers the return, or zbeyens drops it.
- **Vetoes infer landing depth from `wrap`.** A veto input that named the landing parent would let Footnote read depth directly. In Plite transfer (`packages/plitejs/src/core/transfer-types.ts`). owner: zbeyens. stop: the veto input names the parent, or zbeyens drops it.
- **Cross-view node identity in Column's no-op check.** `onlyTradesPlaces` compares node objects. In Plate Column (`packages/platejs/src/features/layout`). owner: zbeyens. stop: it compares keys, or a view case shows no defect.
- **Nested list items as targets.** A nested item without deeper items can be wrapped mid-family, as an edge drop can today. In Plate List (`packages/platejs/src/features/list`). owner: zbeyens. stop: List refuses or accepts it on purpose.
- **Side-landing veto coverage.** Table, Details and Upload have no side-landing cases. Their vetoes are safe today only because Column's side read admits roots and columns alone. In Plite transfer. owner: zbeyens. stop: each veto gets a side case, or a second side contributor lands first and adds them.
- **Production-path benchmark.** Rerun the four side-strip dragover cohorts on a production build with a budget sized to the baseline and a planted-slowdown control. owner: zbeyens. stop: the rerun lands in the `side drop plan` decision log.
- **One landing helper.** Move the read, trim, land, replace and fit steps into `packages/plitejs/src/core/slice-landing.ts`, so the `replaceSlice` command and `runTransfer` call one function, give `editorReads.slice.landing` and `SliceLandingInput.source` their JSDoc, and share the `lossy` message that `landAsPaste` repeats from `transfer-guard.ts`. Tracked as task_db3cd1c2 in `docs/plans/suggested-tasks.decisions.tsv`; from the `list landing plan`. owner: zbeyens. stop: the helper lands, or zbeyens dismisses the task.
- **List drag review warnings left for later.** A property declared both `copy: 'drop'` and `landing: 'adopt'` makes a copy report a false loss; no schema declares that pair. Only the forward join requires a list item at the copy's edge, and a keyboard step judges a copy or a move both before and after adoption, so a veto or required property that reads an adopted value refuses a step that a drag to the same edge lands; no List veto or schema rule reads one. From the `list drag plan`. owner: zbeyens. stop: a session takes them, or zbeyens drops them.
- **List drag side findings.** These predate the `list drag plan`. `tx.blocks.duplicate` copies `listRestart`, so duplicating a restarted item numbers 1, 1. The hover check cache key leaves out the source editor's configuration revision. The public `editor.read.transfer.check` always asks for a move, so a custom driver cannot dry-run a copy. A list's start lives on its first item, so deleting, cutting or moving that item leaves the rest counting from 1. Lists inside a copied object's content roots keep their source ids, on paste and block copy alike. owner: zbeyens. stop: a session takes them, or zbeyens drops them.
- **The vision line.** `docs/vision/plite.md` does not yet say that a copied text drop runs the landing read without command handlers. From the `list landing plan`. owner: zbeyens. stop: the line lands, or zbeyens drops it.
- **A shared drag helper.** The dispatched drag in `apps/www/tests/browser/list-keys.spec.ts` belongs in `packages/test` once a second spec needs it. From the `list landing plan`. owner: zbeyens. stop: a second spec needs it, or zbeyens drops it.
- **What a text move carries at a whole line, the last line and a link's edges.** A whole-line selection leaves its block empty where Delete removes it, a move to the document's last line carries that line's settings, a move over only a link's opening edge lands an empty link, a drop at a link's closing edge leaves an empty link, and a cut of a hanging range carries the end block's shell. From the `text move plan`. owner: zbeyens. tracked: suggested task t_c95ad786. stop: t_c95ad786 lands, or zbeyens drops it.
- **A paste that ends open inside a nested quote mid-line refuses as `schema`.** A text move from one block to the start of the line after a nested quote refuses there too. From the `text move plan`. owner: zbeyens. tracked: suggested task t_1b4352d1. stop: t_1b4352d1 lands, or zbeyens drops it.
- **The guard does not check after a recorder's final rewrite.** An internal recorder whose last rewrite deletes the landing commits, as before. From the `text move plan`. owner: zbeyens. tracked: suggested task t_ece8e967. stop: t_ece8e967 lands, or zbeyens drops it.
- **The review-tree alignment's join-close drop has no test.** The authored case that reached it now keeps the empty line. From the `text move plan`. owner: zbeyens. tracked: suggested task t_3050b578. stop: t_3050b578 lands, or zbeyens drops it.
- **Moves a paste lands inside a new wrapper.** The guard refuses them, though the law forbids only changing a carried block. From the `move guard plan`. owner: zbeyens. stop: a Plate kit or Plite example lands a text move inside a created wrapper, or zbeyens accepts the refusal.
