# Drag and drop

Page: https://claude.ai/artifact/WddBEy4mfjBjRLp3FwVqRz

Block drag and drop in Plite and Plate. The scope's full review and plan history is in the ledger hub.

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

A landing middleware only redirects an edge; the default keeps it.

```ts
around(editorReads.transfer.landing, ({ input, next, state }) =>
  input.edge === 'before'
    ? { edge: 'after' as const, key: state.key([2])! }
    : next()
),
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

The Upload plugin owns file drops.

```ts
UploadPlugin.configure({ initialState: { nativeDrop: true } });
```

Code moves blocks through one action that reports its outcome.

```ts
const outcome = editor.api.transfer.move({
  nodes: [editor.key(element)],
  to: { edge: 'after', key: editor.key(target) },
});
```

The Public API pairs in `docs/plans/2026-10-01-dnd-transfer-consolidation.md` and `docs/plans/2026-10-02-dnd-schema-derived-landing.md` show the call each of these replaced.

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
| Upload `files` landing, draft veto, `nativeDrop` | Plate | `platejs`, `src/features/upload` and `src/react/features/upload` | Upload owns file admission (`plan` ledger) |
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

Sources: `plan` is `docs/plans/2026-10-01-dnd-transfer-consolidation.md` and `landing plan` is `docs/plans/2026-10-02-dnd-schema-derived-landing.md`. `README` is `docs/plite/research/2026-10-02-dnd-library-choice/README.md`. The records are in `docs/research/review-records/`: `interrogation record` is `2026-10-01-dnd-transfer-interrogation.json`, `repair record` is `2026-10-02-dnd-transfer-consolidation-review-repair-execution.json` and `library record` is `2026-10-02-dnd-library-choice.json`.

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
| `onDropFiles` state | Upload `nativeDrop` | `dnd-ownership.md`; `plan` Files and Upload |
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
| Apps configuring `DndPlugin` `onDropFiles` | The option is gone | Upload `nativeDrop: true`; see Public API | `plan` Files and Upload |
| Apps supplying a React DnD manager or backend | No backend option remains | Custom driver: `resolveDropTarget`, then `transfer.move` or `.copy` | `plan` React DnD and touch |
| Headless editors adopting `editor.api.transfer` | A missing plugin is a type error | Add `transfer()`; `react()` and Plate already include it | `plan` Public calls |
| Copied `dnd.tsx` | It imports deleted hooks and the plugin, and restates handle depths | Re-copy: native handle from the schema, indicator, actions menu, shortcut | `plan` Phase 3; `README`; `landing plan` |
| Copied `column.tsx`, `table.tsx` | `canDropNode`, item types and orientation are gone | Native `onDragStart`; rules live in features | `plan` Phase 1, Gesture |
| Copied `media-image.tsx`, `media-video.tsx` | Their custom handles used React DnD | The same native `onDragStart` | `plan` Scope, Gesture |
| Copied `block-menu.tsx` | Not broken; gains items | Move up, Move down and Cut | `plan` Non-drag move |
| Upload kit | `DndKit` no longer routes files | Set `nativeDrop: true` in the Upload kit | `plan` Files and Upload |
| CSS and tests reading body `.dragging` | The class is no longer set | Read `data-editor-dragging` | `plan` Removed public nouns |
| A landing middleware returning `{ admit, to }`: Column, List and Table here, and any app middleware | `TransferLanding` is gone | Return an edge or call `next()`; refuse through `transferVeto` | `landing plan` Blast radius |
| A caller of `editor.read.transfer.source`: copied `dnd.tsx` and the docs | The read is gone | Call `editor.read.transfer.nodes({ node })` | `landing plan` Blast radius |

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

Sources: `plan` is `docs/plans/2026-10-01-dnd-transfer-consolidation.md` and `landing plan` is `docs/plans/2026-10-02-dnd-schema-derived-landing.md`. `dnd-ownership.md` is `docs/research/decisions/dnd-ownership.md`. `README` is `docs/plite/research/2026-10-02-dnd-library-choice/README.md`.

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
| Drop indicator | One indicator per view paints only admitted edges and clears at drag end | Native bridge package test; two-view case in Playwright, three engines; still pointer unproven | `plan` Phase 3, open finding 6 |
| Hover cost | `dragover` p95 0.8 ms native against 0.2 ms React DnD at 5,000 blocks; `resolveDropTarget` takes 0.03 to 0.04 ms over a block and in the root gutter, flat from 300 to 15,000 blocks, with 3,000 closed details too | Benchmark on React development builds, within the baseline-plus-1-ms budget; no production build; `resolveDropTarget` in a Playwright Chromium probe on the homepage view and a virtualized 5,000-block document | `README`; `execution record`; `landing plan` dragover lane |
| Cross-editor drop | Independent editors copy; views and roots of one document move | `cross-editor-drag`, `plate-dnd-cross-editor` in Playwright Chromium, Firefox, WebKit, 15 runs | `plan` law 4; `repair record` |
| Copy modifier | Alt on Apple, Ctrl elsewhere, read from the native drop event | Playwright modifier cases in three engines; OS negotiation unproven | `plan` law 2, Proof; `dnd-ownership.md` |
| File drop | Upload lands files at the painted keyed edge and consumes refused drops; a drop checks one block per dropped file against the parent's content | `UploadPlugin.spec.ts` package test; `dom-drag-geometry.test.ts` multi-file case; www `files-sdk.spec.ts` in Playwright Chromium | `plan` Files and Upload, Phase 3 |
| Native text drop caret | No kit code prevents default on document `dragover` now | unproven: Playwright cannot start a text-selection drag | `plan` Current state, open finding 6 |
| Autoscroll | Plite autoscroll follows nested scrollports and pauses outside the window | Page autoscroll in Playwright; nested scrollport and window leave unproven | `plan` Gesture, open finding 6 |
| Cancel and cleanup | Every terminal path ends the session and removes transient listeners | Escape and mid-drag removal in Playwright, three engines; listener package tests, 76 pass | `repair record`; `plan` Phase 3 |
| Non-drag move | Handle actions, `Mod+Shift+ArrowUp/Down` and a success announcement; steps stay among siblings, inside containers too, and a step whose blocks span parents or whose landing redirect leaves the parent refuses | `transfer-contract.test.ts`, including the mixed-parent and redirect refusals; www keyboard and handle cases, Playwright Chromium; no screen reader run | `plan` Phase 2; `landing plan` Proof |
| Touch | Handles stay visible under `(hover: none)`; touch drag is no longer promised | unproven: no iOS or Android device ran | `plan` Non-drag move, open finding 3 |
| Drop into containers | A block lands inside a blockquote, details body, footnote definition, column item or table cell | www `dnd.spec.ts` blockquote, cell and column cases, Playwright Chromium, Firefox and WebKit, five runs each; details body and footnote by package spec | `landing plan` Proof |
| Drop beside containers | Below a quote, after a trailing table, after a table inside a quote, a nested quote dragged out below its quote, a heading's top margin, the gutter beside a list item, below the last block | www `dnd.spec.ts`, three engines, five runs each | `landing plan` Proof |
| Grab and release | A handle grab and release moves nothing, even where a container's band overlaps the dragged block; an Alt-drag onto the dragged block still copies | `dom-drag-geometry.test.ts` payload stop and band overlap; www `dnd.spec.ts` copy onto itself, three engines | `landing plan` Proof |
| Collapsed details | A closed details takes drops only beside itself; one with only a summary still takes a drop into its hidden body, and a custom driver that computes its own edge can land in a collapsed body (open: `landing plan` Open findings) | www `dnd.spec.ts` closed details, three engines; the summary-only case is an open finding | `landing plan` Proof, Open findings |
| Handles at any depth | Every selectable block shows a handle on hover, only the innermost one, and a selected table keeps the editor's handles | `dnd.spec.tsx`; www `dnd.spec.ts` single handle and nested drag, three engines | `landing plan` Proof |

Playwright WebKit is not Safari, and synthetic `DragEvent` cases prove event handling, not OS drag negotiation (`plan` Proof). The www specs, homepage e2e, registry build, create-install and benchmark ran before the round 2 repairs (`repair record`).

Sources: `plan` is `docs/plans/2026-10-01-dnd-transfer-consolidation.md` and `landing plan` is `docs/plans/2026-10-02-dnd-schema-derived-landing.md`. The records are in `docs/research/review-records/`: `execution record` is `2026-10-02-dnd-transfer-consolidation-execution.json`, `repair record` is `2026-10-02-dnd-transfer-consolidation-review-repair-execution.json` and `ownership record` is `2026-10-01-dnd-native-transfer-ownership.json`. `README` is `docs/plite/research/2026-10-02-dnd-library-choice/README.md`.

## Main changes

- One Plite `transfer` action owns every move and copy. A move inside one document lands whole in one undo step or refuses; a drop into another editor copies.
- The Editable owns block drag sessions. It resolves each `dragover` and `drop` through the transfer dry pass, paints a per-view indicator and settles its own session before plugin drag handlers run.
- A block lands wherever the compiled schema places it. List redirects an edge through read middleware, and Column, Table, Details, Footnote and Upload keep their limits as vetoes, replacing per-gesture React DnD callbacks.
- `platejs/dnd/react`, `DndPlugin`, its store and the `react-dnd` dependencies are deleted; the copied `dnd` kit renders handles, the action menus and the indicator.
- The move check runs on the corrected draft in the projection the update wrote, before the authored runtime turns it into a proposal or accepted content, through an internal draft guard in `packages/plitejs/src/core/public-state.ts`.
- **One per-edge law.** `landAt`, in its own module beside `packages/plitejs/src/core/transfer.ts`, replaces `checkNodeLanding` and the landing half of `resolveLanding`; `checkFilesLanding` stays as the files request over `landAt`. It checks the input edge's target and identity, applies the landing redirect, then checks the final edge's target, identity, placement and every veto. Placement checks what lands: the payload for an in-place move, else the content slice the transfer inserts, which the check and the execution share, and one block per dropped file.
- **One placement predicate in the schema.** A new internal `canPlaceAt` in `packages/plitejs/src/core/editor-schema.ts` simulates the parent's children after the transfer and checks the prefix window, the payload positions and `max`. The landing law uses it; commits already refuse a shifted prefix, so the validator stays as it was.
- **Schema legality is the default.** The root-only default goes. A nested edge is admitted where the target's parent has a compiled content program, or the root for root edges; without one, the landing stays root-only.
- **Hover geometry follows one rule at every level.** `packages/plitejs/src/dom/plugin/dom-drag.ts` finds the level's child under the pointer with one hit test on the level's center line, falls back to a binary search over its mounted children that skips unmounted ranges, bands container edges, and returns no target while a move's pointer is over its own blocks, before any band. A dragover reads 3 to 8 rects over a block, a nested block or the gutter, and 17 to 23 in margins and below the content, where the fallback search grows with log n.
- **Copied handles follow the schema.** `dnd.tsx` gives every selectable block-content element a handle, shows only the innermost hovered one, keeps the hover flag off React state and keeps a nested gutter out of layout until hovered or node-selected. A selected table no longer hides the editor's handles.
- **A keyboard step stays in one parent.** `resolveStep` refuses a payload whose blocks span parents and a landing redirect that leaves their parent.
- **Upload replaces only an empty block-content block.** A file dropped after an empty details summary lands beside it, because the summary is not block content.
