---
review_scopes:
  - dnd
review_basis:
  - 2026-10-02-dnd-schema-derived-landing
work_kind: implementation
---

# Schema-derived block landing

Status: executed; the user's "build" on 2026-10-02 ran Phases 1 to 3 without the cross-model plan review, and the commits are the owner's.
Page: https://claude.ai/artifact/WddBEy4mfjBjRLp3FwVqRz

## Outcome

A dragged block lands wherever the schema lets it live: inside a blockquote, a details body, a footnote definition, a column item or a table cell, at any depth. Hover, drop, keyboard move, file drops and custom drivers ask one Plite law, so the indicator never shows an edge the drop refuses. Features keep only what the schema cannot state, as small vetoes: rows and cells stay in their table, columns stay in their group and editor, the details summary stays first, footnote definitions stay at root, upload drafts stay in one root, and list items move with their family. Column and Table lose their widening middleware, and the copied `dnd.tsx` loses its depth table, its plugin list and its payload copy.

Phase 1 lands the law, the vetoes and the hover geometry together, because a nested default without the geometry would make the edge beside a container unreachable. The execution playbook is `.agents/playbooks/build.md`, run on the user's "build", which skipped the cross-model plan review.

## Defaults

- **Keyboard moves stay among siblings.** Move up and Move down never leave or enter a container, and a step whose payload spans parents refuses. Pointer drags move across levels. The alternative, stepping out at the last sibling, makes Move up fail to undo Move down, because the step never descends. Reverse word: "step out".
- **The details grammar stays as it is.** A Details veto keeps the summary first and keeps it from being dragged. The alternative, a content prefix for the summary, also fixes paste and insert, but it changes which stored documents load and needs its own migration. Reverse word: "prefix summary".
- **Footnote definitions stay at root for transfers.** A Footnote veto refuses a definition payload anywhere but the root. Paste can still nest a definition, which the schema allows. The alternative is a schema change that also closes paste, with the same stored-document cost. Reverse word: "nest footnotes".
- **Content models stay as they are.** Paste and insert already put tables, quotes and details inside cells and quotes, so drop adds a path to existing states, not a new state. Reverse word: "narrow cells".
- **A collapsed container takes drops only beside itself.** An edge inside a range unmounted for collapse is refused; virtualization ranges are not. The alternative lands blocks in a body the user cannot see. Reverse word: "drop into closed". Exception: a summary-only details (Open findings).
- **The container band is 8px, clamped to a quarter of the container, shared only among edges that admit the payload.** The alternative reaches outer edges through padding and gaps only. Phase 1 settles the number in a browser. Reverse word: "no band".
- **Schemaless editors land only at root.** A Plite editor without a declarative schema cannot widen landing any more, because the landing read only redirects. The alternative keeps an opt-in for schemaless parents. Reverse word: "schemaless opt-in".
- **The read that names a transfer's blocks is `editor.read.transfer.nodes`.** It returns the keys `TransferInput.nodes` takes. The alternative keeps `source` with a second contract beside the `transfer.source` middleware. Reverse word: "keep source".

## Public API

A landing middleware only redirects. It returns an edge instead of an admission, and refusal moves to vetoes.

```ts before
around(editorReads.transfer.landing, ({ input, next, state }) => {
  const landing = next();

  if (landing.admit || payload.kind === 'text') return landing;

  return isColumn(node) ? { admit: true } : landing;
}),
```

```ts after
around(editorReads.transfer.landing, ({ input, next, state }) =>
  input.edge === 'before'
    ? { edge: 'after' as const, key: state.key([2])! }
    : next()
),
```

A copied handle asks the schema which blocks it may drag instead of restating plugin types and path depths.

```ts before
const UNDRAGGABLE_PLUGINS = [BaseColumnItemPlugin, BaseTableRowPlugin, BaseTableCellPlugin];

const getDraggableContainer = (editor: Editor, path: Path) => {
  if (path.length === 1) return 'root';
  // depth 3 under a column item, depth 4 under a table
};
```

```ts after
match: ({ editor, element }) =>
  !editor.read.view.isReadOnly() &&
  editor.read.schema.isBlockContent(element) &&
  editor.read.nodes.isSelectable(element),
```

A handle, a keyboard move and Cut read the same blocks instead of a copy of `startDOMDrag`'s rule.

```ts before
const payloadOf = (editor: Editor, element: Element) => {
  const selected = editor.read.selection.nodes().map(([, path]) => path);
  // the selection if it holds the element, else the element
  return editor.read.transfer.source(SelectionApi.nodes(paths)).paths.flatMap(/* ... */);
};
```

```ts after
const nodes = () => editor.read.transfer.nodes({ node: element });
editor.api.transfer.move({ announce, nodes: nodes(), to });
```

Column and Table keep their limits as vetoes instead of widening the default.

```ts before
around(editorReads.transfer.landing, ({ input, next, state }) => {
  const landing = next();
  if (landing.admit || payload.kind === 'text') return landing;
  if (isRow(node)) return sameTable ? { admit: true } : landing;
  return insideCell ? { admit: true } : landing;
}),
```

```ts after
transferVeto.of(({ payload }) => {
  const cellType = editor.plugin(BaseTableCellPlugin).schema.type;

  return (
    payload.kind === 'nodes' &&
    payload.nodes.some((node) => ElementApi.isElementType(node, cellType))
  );
}),
```

## Main changes

- **One per-edge law.** `landAt`, in its own module beside `packages/plitejs/src/core/transfer.ts`, replaces `checkNodeLanding` and the landing half of `resolveLanding`; `checkFilesLanding` stays as the files request over `landAt`. It checks the input edge's target and identity, applies the landing redirect, then checks the final edge's target, identity, placement and every veto. Placement checks what lands: the payload for an in-place move, else the content slice the transfer inserts, which the check and the execution share, and one block per dropped file.
- **One placement predicate in the schema.** A new internal `canPlaceAt` in `packages/plitejs/src/core/editor-schema.ts` simulates the parent's children after the transfer and checks the prefix window, the payload positions and `max`. The landing law uses it; commits already refuse a shifted prefix, so the validator stays as it was.
- **Schema legality is the default.** The root-only default goes. A nested edge is admitted where the target's parent has a compiled content program, or the root for root edges; without one, the landing stays root-only.
- **Hover geometry follows one rule at every level.** `packages/plitejs/src/dom/plugin/dom-drag.ts` finds the level's child under the pointer with one hit test on the level's center line, falls back to a binary search over its mounted children that skips unmounted ranges, bands container edges, and returns no target while a move's pointer is over its own blocks, before any band. A dragover reads 3 to 8 rects over a block, a nested block or the gutter, and 17 to 23 in margins and below the content, where the fallback search grows with log n.
- **Copied handles follow the schema.** `dnd.tsx` gives every selectable block-content element a handle, shows only the innermost hovered one, keeps the hover flag off React state and keeps a nested gutter out of layout until hovered or node-selected. A selected table no longer hides the editor's handles.
- **A keyboard step stays in one parent.** `resolveStep` refuses a payload whose blocks span parents and a landing redirect that leaves their parent.
- **Upload replaces only an empty block-content block.** A file dropped after an empty details summary lands beside it, because the summary is not block content.

## What other editors do

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

| Delta | Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- | --- |
| added | Schema-derived landing default and `landAt` | Plite | `plitejs`, `src/core` | One law for every transfer path (`landing plan` Decision ledger) |
| added | `canPlaceAt` placement predicate | Plite | `plitejs`, `src/core/editor-schema.ts` | The schema owns content prefixes and `max` (`landing plan` Decision ledger) |
| added | Hover geometry: a center-line hit test, then one mounted search per level; bands; indexed coverage reads | Plite | `plitejs`, `src/dom/plugin/dom-drag.ts` | The mounted view owns geometry (`landing plan` Decision ledger) |
| added | `editor.read.transfer.nodes` | Plite | `plitejs` | One home for the handle and keyboard blocks (`landing plan` Payload read) |
| added | Column, Table, Details and Footnote vetoes | Plate | `platejs`, `src/features` | Limits the schema cannot state stay with their feature (`landing plan` Feature rules) |
| added | Slot-aware Upload `replaceEmpty` | Plate | `platejs`, `src/features/upload` | The drop performs the edit the law admitted (`landing plan` Feature rules) |
| added | Handles from `isBlockContent` and `isSelectable` | Plate copied registry | `dnd.tsx` | Handles follow the schema (`landing plan` Public API) |
| changed | `transfer.source` and `transfer.landing` reads, `transferVeto` point | Plite | `plitejs` | `transfer.source` expands, `transfer.landing` only redirects, `transferVeto` refuses, and the schema admits (`landing plan` Landing law) |
| removed | Column item landing | Plate | `platejs`, `src/features/layout` | Replaces copied `canDropNode` (`plan` Landing policy) |
| removed | Table row landing and row-span veto | Plate | `platejs`, `src/features/table` | Replaces copied `canDropNode` (`plan` Landing policy) |

`landing plan` is this plan; `plan` is `docs/plans/2026-10-01-dnd-transfer-consolidation.md`.

## Hard cuts and app migration

A schemaless Plite editor can no longer widen its landing. A copied `dnd.tsx` in a downstream app keeps its depth policy until it syncs.

| Delta | Deleted | Replacement | Source |
| --- | --- | --- | --- |
| added | `TransferLanding` | A landing middleware returns a `TransferEdge`; vetoes refuse | `landing plan` Removed public nouns |
| added | `editor.read.transfer.source` | `editor.read.transfer.nodes({ node? })`; the `editorReads.transfer.source` middleware stays for features | `landing plan` Removed public nouns |
| added | Column and Table landing middleware | Column and Table vetoes | `landing plan` Feature rules |
| added | Copied `UNDRAGGABLE_PLUGINS`, `getDraggableContainer`, `payloadOf` and the `container` prop | Handles from `isBlockContent` and `isSelectable`, blocks from `transfer.nodes` | `landing plan` Public API |
| changed | `DndPlugin`, `DndDefinition`, `DndPluginState` | Kit-local plugin, `transfer.nodes`, `drag.start`, Upload | `plan` Removed public nouns; `landing plan` |
| changed | `CanDropCallback`, `onDropHandler` | `transferVeto`; the drag selects `at` | `plan` Removed public nouns; `landing plan` |
| changed | `canDropNode` in copied `column.tsx` and `table.tsx` | Column and Table vetoes | `plan` Phase 1; `landing plan` |

| Delta | Caller | Breaks because | Change | Source |
| --- | --- | --- | --- | --- |
| added | A landing middleware returning `{ admit, to }`: Column, List and Table here, and any app middleware | `TransferLanding` is gone | Return an edge or call `next()`; refuse through `transferVeto` | `landing plan` Blast radius |
| added | A caller of `editor.read.transfer.source`: copied `dnd.tsx` and the docs | The read is gone | Call `editor.read.transfer.nodes({ node })` | `landing plan` Blast radius |
| changed | Copied `dnd.tsx` | It imports deleted hooks and the plugin, and restates handle depths | Re-copy: native handle from the schema, indicator, actions menu, shortcut | `plan` Phase 3; `README`; `landing plan` |

## Native behavior and proof

| Delta | Behavior | What changes | Proof surface | Source |
| --- | --- | --- | --- | --- |
| added | Drop into containers | A block lands inside a blockquote, details body, footnote definition, column item or table cell | www `dnd.spec.ts` blockquote, cell and column cases, Playwright Chromium, Firefox and WebKit, five runs each; details body and footnote by package spec | `landing plan` Proof |
| added | Drop beside containers | Below a quote, after a trailing table, after a table inside a quote, a nested quote dragged out below its quote, a heading's top margin, the gutter beside a list item, below the last block | www `dnd.spec.ts`, three engines, five runs each | `landing plan` Proof |
| added | Grab and release | A handle grab and release moves nothing, even where a container's band overlaps the dragged block; an Alt-drag onto the dragged block still copies | `dom-drag-geometry.test.ts` payload stop and band overlap; www `dnd.spec.ts` copy onto itself, three engines | `landing plan` Proof |
| added | Collapsed details | A closed details takes drops only beside itself; one with only a summary still takes a drop into its hidden body, and a custom driver that computes its own edge can land in a collapsed body (open: `landing plan` Open findings) | www `dnd.spec.ts` closed details, three engines; the summary-only case is an open finding | `landing plan` Proof, Open findings |
| added | Handles at any depth | Every selectable block shows a handle on hover, only the innermost one, and a selected table keeps the editor's handles | `dnd.spec.tsx`; www `dnd.spec.ts` single handle and nested drag, three engines | `landing plan` Proof |
| changed | Non-drag move | Handle actions, `Mod+Shift+ArrowUp/Down` and a success announcement; steps stay among siblings, inside containers too, and a step whose blocks span parents or whose landing redirect leaves the parent refuses | `transfer-contract.test.ts`, including the mixed-parent and redirect refusals; www keyboard and handle cases, Playwright Chromium; no screen reader run | `plan` Phase 2; `landing plan` Proof |
| changed | File drop | Upload lands files at the painted keyed edge and consumes refused drops; a drop checks one block per dropped file against the parent's content | `UploadPlugin.spec.ts` package test; `dom-drag-geometry.test.ts` multi-file case; www `files-sdk.spec.ts` in Playwright Chromium | `plan` Files and Upload, Phase 3 |
| changed | Hover cost | `dragover` p95 0.8 ms native against 0.2 ms React DnD at 5,000 blocks; `resolveDropTarget` takes 0.03 to 0.04 ms over a block and in the root gutter, flat from 300 to 15,000 blocks, with 3,000 closed details too | Benchmark on React development builds, within the baseline-plus-1-ms budget; no production build; `resolveDropTarget` in a Playwright Chromium probe on the homepage view and a virtualized 5,000-block document | `README`; `execution record`; `landing plan` dragover lane |

Native OS drag mechanics do not change; Playwright and the Chrome extension start no native drag.

## Scope

In scope:

- Plite: `transfer.ts` and the new landing module, `transfer-types.ts`, `editor-reads.ts`, `editor-schema.ts` (`canPlaceAt` and the incremental validator), `dom-drag.ts`, the transfer contract tests and the hover tests.
- Plate: `BaseColumnPlugin`, `BaseTablePlugin`, `BaseListPlugin`, `BaseFootnotePlugin`, `BaseDetailsPlugin` (veto only), `BaseUploadPlugin` (`replaceEmpty`) and their specs; `TransferPlugin` types.
- Registry: `dnd.tsx`, `block-menu.tsx`, `details.tsx` (collapsed boundary for a summary-only details), and generated registry output.
- Docs and law: `content/docs/(plugins)/(functionality)/dnd.mdx`, its Chinese twin, `content/docs/api/dom.mdx`, the editor-behavior law, `docs/vision/plite.md`, a Plate Next doctrine version, changesets and the registry changelog.

Out of scope:

- The drag library choice, which `2026-10-02-dnd-library-choice` deferred.
- Touch drag, which stays an app driver over `resolveDropTarget`.
- The details summary prefix grammar and a root-only footnote schema, per Defaults; tracked under Open findings.
- `cutBlocks` moving into a package. It writes the async clipboard from a menu and has two callers, both in copied UI.

## Hard laws

1. A move never loses content. The draft guard refuses a landing that differs from the payload.
2. Schema legality holds at the final edge, including content prefixes and `max`, for the nodes that actually land. Exception: a multi-file drop counts as one block against `max` (Open findings).
3. Hover and drop agree. The edge the indicator shows is the edge the drop uses, and the drop performs the edit the law admitted.
4. Grabbing and releasing a handle moves nothing; a copy onto the dragged block still shows its edge.
5. Inside-source and no-op refuse on the final edge, after any redirect, for a move within one document.
6. Read-only targets and independent editors copy; vetoes run on the final edge.
7. Without a compiled content program, nested edges stay refused.
8. A dragover does no work proportional to the document.

## Current state

- **Root-only default.** `resolveLanding` falls back to `path.length === 1 ? { admit: true } : { admit: false }` (`packages/plitejs/src/core/transfer.ts:264-265`).
- **Widening middleware.** Column (`BaseColumnPlugin.ts:135-165`) and Table (`BaseTablePlugin.ts:494-525`) widen it to depth 3 and depth 4 inside root-level containers.
- **Containers left out.** Blockquote, details bodies and footnote definitions declare block content but get no handle, no drop and no keyboard move.
- **Copied policy.** `dnd.tsx` restates the depths in `getDraggableContainer` and the types in `UNDRAGGABLE_PLUGINS`, and `payloadOf` repeats `startDOMDrag` (`dom-drag.ts:387-398`).
- **Final-edge identity.** Inside-source and no-op run on the final edge after a redirect (`transfer.ts:322-357`), which List's family retarget depends on.
- **Hover walk.** `candidatesAt` takes the nearest child of the deepest block host and falls back to the caret point; with no host it scans every root child (`dom-drag.ts:158-224`).
- **Validator gap.** Commit validation checks only changed indexes (`validateContentIndexes`, `editor-schema.ts:3905`), so an insertion that shifts a prefix sibling out of its slot commits a document that fails to load. Withdrawn in build: commits already refuse a shifted prefix; the contract case for it passed at `HEAD` and was not kept (decision-log row "Dropped the incremental-validator half of the canPlaceAt step").
- **Measured.** The mounted hover dry pass costs about 0.03ms over a block and 0.05 to 0.07ms in the root gutter, growing 1.45x from 300 to 15,000 blocks. The model-side walk drops from two checks to one under the target (`docs/plans/artifacts/2026-10-02-dnd-schema-derived-landing/hover-walk-probe.txt`, local).

## Decisions

### Target and comparison

The target is a Plite-owned, schema-derived landing law with features reduced to vetoes. Three Opus runners designed it from different starting points: the current pipeline with an admit-all default (C1), one drop-point resolver walking a ladder of candidate edges (C2), and per-element transfer roles in the schema (C3). An Opus cross-judge scored C2 21, C1 20 and C3 18 of 24 on six criteria and picked C2 as the base, because a new law then lands in one function. Grafts: the cell veto, the element-only host selector and the key-returning read from C1; the Details hazards and probes from C3. C3's role facet and `transfer.draggable` read lost: `blockContent: false` already marks rows, cells and column items, and the facet restates content models. The arena record is in the session scratchpad, `arena-landing/synthesis.md` with `synthesis-v1.md`.

### Landing law

`landAt(editor, admission, inputEdge)` runs, in order:

1. The input edge's target is a live element.
2. Inside-source and no-op on the input edge, for a move within one document.
3. The landing read maps the edge. A moved edge must map to itself, else it refuses `policy`.
4. The final edge's target is a live element.
5. Inside-source and no-op on the final edge, for a move within one document. A pointer walk stops on a refusal from step 2 or step 5.
6. Placement: `canPlaceAt(parent, fit, index, { removing })` on the nodes that actually land. For a copy those are the copy-normalized nodes, checked against the strict content program, not the lenient validation fallback. The fit is the payload nodes, or one file block per dropped file.
   Built after panel round 1: the fit is the content slice the transfer inserts, with the source's copy lifecycle, for a copy, a text range or a move into another root; an in-place move fits the payload nodes. The slice is cached per payload and intent and handed to the execution, so the check and the drop read the same nodes. A files drop fits one block per `dataTransfer` item of kind `file`.
7. Every `transferVeto`.

`canPlaceAt` builds the parent's children as they will be after the transfer. It removes the payload nodes when the move stays in that parent and inserts the fit at the index in post-removal coordinates. Then it runs `contentAllowsAt` over every position below the prefix length plus the payload positions, and checks `max`. It costs O(prefix length + fit). The incremental validator uses it for the window an insertion shifts. Without a compiled content program for the parent, nested edges refuse. A placement refusal reports `schema`; a veto or a redirect that moves twice reports `policy`. Built: the validator is unchanged.

### Hover geometry

1. **Level.** The level is the nearest `[data-editor-node="element"]:not([data-editor-inline])` host above the pointer that resolves in this view, climbing past nested editors and fragment views. A hit on a copied-UI wrapper maps to the host it wraps. With no host, the level is the root.
2. **Anchor.** One rule applies at every level, root included. A binary search runs over the level's mounted children on the flow axis, clamped to the first and last mounted child; side-by-side children get a linear scan on x. A pointer below every block maps to the last block's after edge. Unmounted ranges and windows outside a virtualized view are never searched.
   Built: one `elementFromPoint` on the level's center line comes first, so a pointer in a gutter or padding costs one hit test; the binary search is the fallback and jumps over coverage-unmounted ranges (deviation row). This reverses Challenge delta pass 2, which replaced a pointer-x `elementFromPoint` anchor; the probe runs on the level's center line, and the binary search keeps the margin and padding cases that pass found.
3. **Candidates.** The anchor's edge, then the level host's edge, then its block ancestors outward.
4. **Bands.** A container is banded when the pointer is within 8px of its edge on the flow axis, clamped to a quarter of its extent. Where nested containers share an edge within 2px, the band is shared only among the containers whose edge admits this payload. Bands are tested first.
5. **Stop.** For a move within one document, drop any banded container that is the payload or inside it. When no band admits and the anchor is inside the payload, return null.
   Built: no separate check. The anchor's own edge refuses `inside-source` or `no-op` in `landAt`, the candidate loop stops on those reasons, and a payload container's band refuses the same way.
   Built after panel round 1: a move whose pointer is over its own blocks returns null before the bands are tested, because an ancestor's band that overlaps the dragged block otherwise moved it out on a grab and release (deviation row).
6. **Collapsed content.** An edge inside a range unmounted for `app-collapse` or `app-hidden`, ends included, is refused. Virtualization ranges keep their edges. A summary-only details registers an empty collapsed range so the gap after its summary is covered.
   Reverted: coverage has no empty range, so a drop after a closed summary-only details lands in its hidden body (deviation row; Open findings).
7. **Edge.** The pointer's half of the candidate's rect is the edge. Text payloads keep the caret point.
8. **Cache.** The walk result is cached by its candidate list plus the transfer check's own key: intent, source editor, both snapshots, read-only state and registry revision.
   Not built: the measured walk stays at or under 0.09ms per call with no linear growth (`dragover-final.txt`) (deviation row).

Custom drivers that compute their own edge skip rule 6; the collapsed-range refusal belongs to the mounted view.

### Payload read

`editor.read.transfer.nodes({ node? })` returns `readonly NodeKey[]`. With `node` it returns a handle's blocks, which are the node selection when it holds the node, else the node alone. Without `node` it returns a keyboard move's blocks, which are the selected blocks or the blocks holding the selection. Both run List's family expansion through the unchanged `editorReads.transfer.source` middleware. `startDOMDrag`, the default of `transfer.move` and Cut share it. `TransferInput` gains no `node` option.

### Feature rules

- **Column** deletes its landing middleware. One veto keeps a column payload beside columns of its own group in the same document.
- **Table** deletes its landing middleware. One veto refuses any cell payload, keeps rows in their own table and document, and keeps the row-span rules. Built: three vetoes, one per limit (deviation row).
- **List** keeps its source expansion. Its landing middleware returns `{ edge: 'after', key }` or `next()`. Built: it reads the family end from a run index per sibling list and indent, so a check costs the same at any family size.
- **Details** keeps its grammar and gains one veto that refuses landing index 0 inside a details and refuses a summary payload. The summary gets `blockContent: false`, so it shows no handle.
- **Footnote** gains one veto, so a definition payload lands only at root.
- **Upload** keeps its cross-root draft veto. Its `submit` replaces an empty target only when the file block fits that target's slot, so a file dropped after an empty summary inserts instead of replacing the summary.

### Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Landing default | Root only | Compiled schema; root only without a content program | Plite | Hard laws 2, 7 | Phase 1 | Contract tests per container; schemaless test | High: every transfer caller | rearchitect |
| Per-edge law | `resolveLanding`, `checkNodeLanding`, `checkFilesLanding` | `landAt` in its own module | Plite | One law for every path (hard law 3) | Phase 1 | List family specs; final-edge identity test | High | rearchitect |
| Placement | Index-local `canContainAt`; validator checks changed indexes | `canPlaceAt` over the post-transfer prefix window and `max` | Plite schema | Hard law 2 | Phase 1 | Shifted-prefix, copy-into-full and cross-editor unknown-type tests | Medium | rearchitect |
| Landing result | `TransferLanding` `{ admit, to }` | `TransferEdge` | Plite public type | One refusal mechanism | Phase 1; List adopts | Type tests; List specs | Medium: public break | cut |
| Hover walk | Innermost-first with caret fallback; root scan | One mounted binary search per level, bands first, payload stop | Plite DOM | Hard laws 3, 4, 8 | Phase 1 | Browser reachability cases; dragover lane | High: native drag | gate: the current-owner baseline is measured; the target passes the frozen Phase 1 dragover budget or reverts |
| Column widening | Landing middleware | Same-group, same-document veto | Plate | Schema covers the rest | Phase 1 | Column specs, including the cross-editor refusal | Low | cut |
| Table widening | Landing middleware | Cell, own-table and row-span veto | Plate | Grid width is not schema | Phase 1 | Table transfer specs | Low | cut |
| Details | Summary is block content | Summary-first and summary-payload veto; summary not block content | Plate | Keeps stored documents loading | Phase 1 | Details specs | Low | rearchitect |
| Footnote | None | Root-only definition veto | Plate | End matter | Phase 1 | Footnote spec | Low | rearchitect |
| Upload `replaceEmpty` | Replaces any empty target | Replaces only where the file block fits the slot | Plate | Hard law 3 | Phase 1 | File drop after an empty summary | Low | rearchitect |
| Transfer read | `source(selection)` and copied `payloadOf` | `nodes({ node? })` | Plite public read | One home for the handle rule | Phase 2 | Read and handle tests | Medium: public break | rename |
| Copied handles | Depth and type lists | Schema read; innermost handle | Plate registry | Handles follow the schema | Phase 2 | www unit and browser tests | Medium: render cost | rearchitect |
| Teaching | Feature landing middleware | Schema default plus vetoes | Docs, Vision, Plate Next | Docs teach the current API | Phase 3 | Docs checks; mirror check | Low | rearchitect |

### Removed public nouns and duties

- **`TransferLanding`.** It carried admission and redirect. Admission moves to the schema default and vetoes; redirect stays as a `TransferEdge` result. Proof: List family specs and a type test that a boolean admission no longer compiles.
- **`editor.read.transfer.source`.** It carried selection expansion for the copied handle. `editor.read.transfer.nodes({ node? })` replaces it for callers, and the `editorReads.transfer.source` middleware keeps expansion for features. Proof: read tests and the List family drag spec.
- **Widening a schemaless editor's landing.** The landing read can no longer admit an edge, so `transfer-contract.test.ts:66` (a widened unschema'd quote) is deleted with this decision, per Defaults.
- **Column and Table landing middleware.** They carried nested admission and same-parent limits. The schema default replaces the first and vetoes keep the second. Proof: the existing Column and Table specs, plus the new cell and own-table cases.
- **Copied `UNDRAGGABLE_PLUGINS`, `getDraggableContainer`, `payloadOf` and the `container` prop.** They carried handle eligibility, handle width and the payload. `isBlockContent` with `isSelectable`, a CSS ancestor variant and the `nodes` read replace them. Proof: the www handle unit test and the browser cases.

### Three realistic failures

1. **A redirect lands on the payload's own gap.** List's retarget moves an edge onto the dragged item's gap, so the indicator paints an edge the drop refuses. Steps 4 and 5 of the landing law rerun identity on the final edge, and the walk stops there. Proof: `steps a list item up past a whole family` and a hover-then-drop case.
2. **A drop zone between or below blocks shows nothing.** Without the caret fallback, margins, the gutter beside indented blocks and the editor's bottom padding would find no anchor. The anchor rule searches mounted children at every level, root included, and clamps to the last block. Proof: browser cases in a heading's top margin, beside a list item in the gutter, and below the last block.
3. **The drop performs a different edit than the law admitted.** A file dropped after an empty summary replaced the summary through `replaceEmpty`. Upload replaces only where the file block fits the slot. Proof: a file drop after an empty summary.

### Blast radius

- **Consumers.** `TransferLanding` and the landing read: `BaseColumnPlugin.ts:136`, `BaseListPlugin.ts:1717`, `BaseTablePlugin.ts:495` and three `transfer-contract.test.ts` cases (`:69`, `:101`, `:176`). `editor.read.transfer.source`: copied `dnd.tsx`, the docs at `dnd.mdx:240` and `dnd.cn.mdx:238`, generated `apps/www/public/r/dnd-docs.json`, `registry-docs.json` and `registry.json`, and the unreleased `.changeset/plite-transfer.md`.
- **Doctrine.** Plate Next doctrine version 256 teaches landing middleware that admits, retargets or refuses (`.agents/rules/plate-next/versions.json:2976`). Its history is immutable, so a new version supersedes it.
- **Stored documents.** None change, because the details grammar and the footnote schema stay. Copied `dnd.tsx` in downstream apps keeps its depth policy until synced through `sync-plate-ui`; `templates/**` regenerates in CI.
- **Proven fact.** Plate never falls under the schemaless guard. A script ran `canContainAt` on an `EditorKit` editor. It refuses a paragraph directly in a table, a row and a column group, and admits one in a cell, a column item and a blockquote. Those answers come from compiled content programs (session scratchpad, `zz-guard4.probe.spec.tsx`).

### Challenge delta

Improved twice. The target held, a schema-derived Plite law with features reduced to vetoes.

Interrogate pass 1, three Opus reviewers with probes on the live tree:

- **Moved:** identity checks run again on the final edge after a redirect. All three reviewers showed List's retarget onto the payload's own gap passing as a move.
- **Added:** the schemaless guard, because `canContainAt`'s heuristic fallback admits any block into any element without inline content; a cardinality check; refusal of collapsed ranges; a mounted-only search.
- **Replaced:** pass 1's prefix-slot law, which refused legal moves in forced-layout's `[title, paragraph]` prefix, with a sequence check.
- **Merged:** the keyboard step back to siblings only.

Interrogate pass 2, three fresh Opus reviewers with probes:

- **Replaced:** the root `elementFromPoint` anchor with one mounted binary search at every level. All three showed heading margins, the gutter beside indented blocks and the bottom padding finding no anchor.
- **Moved:** the sequence and `max` checks into one schema predicate, `canPlaceAt`, which simulates the post-transfer window, counts copies correctly and also closes the incremental validator's blind spot. (The validator half was withdrawn in build.)
- **Re-ordered:** bands before the payload stop, with the stop gated on a move within one document, so a copy onto the dragged block keeps its edge and dragging a container's last child out stays possible.
- **Added:** Upload's slot-aware `replaceEmpty`, the strict content check for copies, collapse-keyed range refusal, and a full cache key.
- **Deleted:** the empty payload for prefix children, which blocked legal moves the placement check admits; and the details prefix grammar from this plan, which needs a stored-document migration, replaced by a Details veto.

## Steps

### Phase 1: the landing law, the vetoes and hover

- [x] Run `verify` for the phase's proof selection before writing tests. Closed by the "Proof selection for Phase 1" row in `docs/plans/2026-10-02-dnd-schema-derived-landing.decisions.tsv`.
- [x] Write the failing Plite contract tests in `packages/plitejs/test/transfer-contract.test.ts`, each naming its defect: a block lands inside a container the parent content accepts; a redirect onto the payload's own gap refuses `no-op`; a copy into a full `max` parent refuses at hover; an insertion that shifts a prefix sibling refuses; a block of a type the target editor never compiled refuses at hover; a schemaless editor refuses a nested edge. Closed by `packages/plitejs/test/transfer-contract.test.ts` `describe('schema-derived landing')`; the shifted-prefix validator case passed at `HEAD` and was withdrawn (decision-log row "Dropped the incremental-validator half of the canPlaceAt step").
- [x] Build `canPlaceAt` in `editor-schema.ts` and use it in the incremental validator. Proof: the shifted-prefix and `max` tests; Plite's non-React suite, `bun test --preload ../../config/plite-source-test-setup.ts --path-ignore-patterns 'test/react/**'` in `packages/plitejs`. Closed by `canPlaceAt` in `packages/plitejs/src/core/editor-schema.ts` and the bun run of 2,980 tests; the validator half was dropped because commits already refuse a prefix shift (decision-log row).
- [x] Build `landAt` and the redirect-only landing read; delete `TransferLanding`, `checkNodeLanding`, `checkFilesLanding` and the schemaless widening test. Proof: the contract tests go green. Closed by `packages/plitejs/src/core/landing.ts` and `transfer-contract.test.ts` (23 pass); `checkFilesLanding` stays as a files request over `landAt` (deviation row).
- [x] Replace Column and Table middleware with vetoes, add the Details and Footnote vetoes, give the summary `blockContent: false`, adapt List's middleware, and make Upload's `replaceEmpty` slot-aware. Proof: Column, Table, List, Details, Footnote and Upload specs, with new cases for a cell payload, a row into another table, a drop before a summary, a definition into a cell and a file after an empty summary. Closed by the Column, Table, List, Details, Footnote and Upload specs in `packages/platejs/src`, with mutation checks on the new cases, and the full `TURBO_FORCE=1 pnpm --filter platejs test` run (138 tasks, scratchpad `dnd-build/platejs-test-forced.txt`).
- [x] Build the hover geometry in `dom-drag.ts`. Proof: Plite DOM tests for the payload stop, a copy onto the dragged block, the root gutter, a collapsed range and the cache key; `pnpm --filter plite exec vitest run --config ./vitest.config.mjs`. Closed by `packages/plitejs/test/react/dom-drag-geometry.test.ts` (7 pass, each mutation-checked) and the full Plite vitest run (92 files); the cache-key proof is skipped because rule 8's cache is not built (deviation row).
- [x] Run the frozen dragover benchmark through the Benchmark performance pack: `resolveDropTarget` per call stays at or under 0.1ms at 15,000 blocks over a block and in the root gutter, and grows at most 1.5x from 300 to 15,000 blocks, in Chromium on the mounted homepage view and on a virtualized 5,000-block document. Proof: the artifact under `docs/plans/artifacts/2026-10-02-dnd-schema-derived-landing/`. Closed by `docs/plans/artifacts/2026-10-02-dnd-schema-derived-landing/dragover-lane.txt` (packet 1 red, packet 2 green) and, on the final hover code, `dragover-final.txt` and `dragover-details-after.txt` (local): 0.03 to 0.04ms over a block and in the gutter, flat from 300 to 15,000 blocks, 0.052ms in the virtualized gutter, and flat with 3,000 closed details.
- [x] Prove in Chromium, Firefox and WebKit with `apps/www/tests/browser/dnd.spec.ts`, five warm runs: drops into a blockquote, a table cell and a column item; below a blockquote; after a trailing table; after a trailing table inside a blockquote; a quote's last paragraph dragged out below it; a heading's top margin; the gutter beside a list item; below the last block; below a closed details from its summary; and an Alt-drag onto the dragged block. Settle the band width here. Closed by `docs/plans/artifacts/2026-10-02-dnd-schema-derived-landing/browser-final-warm-runs.txt` (local): 21 cases, five clean runs in Chromium and Firefox, and in WebKit five of seven, two runs losing one case each to the harness seeing the editor hidden before any action; the band stays 8px. "A quote's last paragraph dragged out" runs as the nested quote dragged out by its own handle.
- [x] Keep, revert or quarantine Phase 1, logged in the decision log. Closed by the "Keep Phase 1" row in `docs/plans/2026-10-02-dnd-schema-derived-landing.decisions.tsv`.

### Phase 2: the transfer read and the copied handles

- [x] Replace `editor.read.transfer.source` with `editor.read.transfer.nodes({ node? })` and share it with `startDOMDrag` and the default of `transfer.move`; refuse a keyboard step whose blocks span parents. Proof: read tests with a selection that holds the node and one that does not, a mixed-parent step test, and the List family drag spec. Closed by `transferNodes` in `packages/plitejs/src/core/transfer.ts`, `describe('transfer nodes read')` in `transfer-contract.test.ts` (27 pass, each new case failing first) and the List spec in the platejs transfer run (141 pass).
- [x] Rewrite copied `dnd.tsx`: delete `UNDRAGGABLE_PLUGINS`, `getDraggableContainer`, `payloadOf` and the `container` prop; match handles on `isBlockContent` and `isSelectable`; show only the innermost hovered gutter; give nested gutters a hover bridge so their buttons stay reachable; fit the gutter inside the cell padding; mount the actions menu on open; make `cutBlocks` take keys and block-menu Cut call `nodes()`. Register an empty collapsed range in `details.tsx` for a summary-only details. Proof: `apps/www/src/registry/components/editor/dnd.spec.tsx` gains one case for a single visible handle on a nested block, and the browser cases rerun. Closed by `apps/www/src/registry/components/editor/dnd.tsx`, `details.tsx` and `block-menu.tsx`; `dnd.spec.tsx` (2 pass, with 'a selected table keeps the editor handles'); the single-handle and nested-drag cases in `apps/www/tests/browser/dnd.spec.ts`, which fail with the old hover rule; (deviation rows for the hover bridge and the "Handle render lane" row for the handle mounting). The summary-only details range was reverted after review: it covered the summary itself (deviation row; Open findings).
- [x] Measure the render and style-recalc cost of handles in a 50-row table against today, through the Benchmark performance pack, with the budget stated before the run. Proof: the artifact. Closed by `docs/plans/artifacts/2026-10-02-dnd-schema-derived-landing/handle-render-*.txt` (local) under the budget row logged before the baseline: the unpaired final run measured hover script 1.54x to 1.59x at load average 7.8; the paired Phase 1 against final run gave task 1.14x to 1.20x, style 0.92x to 0.97x and hover script 1.10x to 1.31x (`handle-render-paired.txt`).
- [x] Run `pnpm --filter www build:registry` and include its output. Proof: `git diff --stat apps/www/public/r`. Closed by `pnpm --filter www build:registry` (generation `17657a40`, rerun after the review fixes) and its six changed files under `apps/www/public/r`.
- [x] Keep, revert or quarantine Phase 2. Closed by the "Keep Phase 2" row in `docs/plans/2026-10-02-dnd-schema-derived-landing.decisions.tsv`.

### Phase 3: docs, doctrine and law

- [x] Run `plate-docs` on `content/docs/(plugins)/(functionality)/dnd.mdx` and its Chinese twin: the landing section, the `nodes` read, the custom handle example and the claim about handles in table cells; then `content/docs/api/dom.mdx`. Proof: the docs checks and a preview of both locales. Closed by `pnpm --filter www build:source` and `pnpm --filter www check:docs` (after removing `TransferLanding` from `apps/www/api-reference.config.json`), and `/docs/dnd`, `/cn/docs/dnd` and `/docs/api/dom` answering 200 with the new text; the embedded demos were not opened.
- [x] Apply Best API's doctrine repair: a new Plate Next doctrine version that teaches the schema default with vetoes and a redirect-only landing read, then `pnpm install` and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`. Proof: the mirror check passes. Closed by version 257 in `.agents/rules/plate-next/versions.json`, `version.mjs validate` (v257 valid) and `sync-resources.mjs --check` (exact).
- [x] Update `docs/vision/plite.md` where it describes landing, and run `docs/editor-behavior/commands/reconsolidate-law-stack.md` on `markdown-editing-spec.md:1926-1929` and `editor-protocol-matrix.md:496`. Proof: the law stack diff. Closed by `docs/vision/plite.md`, `docs/vision/plate.md`, `markdown-editing-spec.md` (`EDIT-DRAG-*` notes), `editor-protocol-matrix.md` (block drag rows) and `current-evidence.md`.
- [x] Amend `.changeset/plite-transfer.md`, add Plate changesets for Column, Table, Details, Footnote and Upload, and add a registry changelog entry for `dnd.tsx`. Proof: the changeset check. Closed by `.changeset/plite-transfer.md` and the unreleased `.changeset/plate-transfer-landing-rules.md`, amended instead of adding duplicates, and `apps/www/src/registry/changelog/entries/2026-10-02-schema-block-handles.mdx` with `generate-ui-changelog-entries.mjs --check` and `pnpm changeset status` passing after the amendments.
- [x] Flag the superseded promise in `docs/plans/2026-10-01-dnd-transfer-consolidation.md:241` ("Middleware only widens or retargets") in the reply; that plan is done and owned by its session. Closed by `git grep -n "widens or retargets" -- docs/plans` (only that line), flagged in the build's final reply.
- [x] Run `pnpm check` once for the settled change. Closed by `docs/plans/artifacts/2026-10-02-dnd-schema-derived-landing/pnpm-check.txt` and its per-step logs (local): typecheck passes; lint, type-aware lint and `test:all` fail in other sessions' or the 10-01 plan's files, attributed in the decision log.

## Proof

- **Plite.** Contract tests in `packages/plitejs/test/transfer-contract.test.ts`; the full Plite non-React and React suites.
- **Plate.** Feature specs for Column, Table, List, Details, Footnote and Upload; the full `pnpm --filter platejs test`.
- **Browser.** `apps/www/tests/browser/dnd.spec.ts` in three engines, five warm runs, and `tooling/e2e/homepage-dnd.test.ts`.
- **Native drag.** A real OS drag in a browser by hand, because Playwright and the Chrome extension start no native drag. Without it, the native claim stays limited to synthetic drag events.
- **Performance.** The dragover lane and the table render-cost lane, with budgets frozen in the steps above before their runs.

## Open findings

- **Details summary prefix grammar.** A content prefix would keep the summary first for paste and insert too, but stored details with a non-first or second summary would fail to load until a pre-validation repair moves or demotes them. Owner: Plate Details, tracked in this plan's decision log.
- **Root-only footnote definitions in the schema.** Paste can still nest a definition. Owner: Plate Footnote, tracked in this plan's decision log.
- **Custom drivers and collapsed content.** A driver that computes its own edge can land a block in a collapsed body. Owner: Plite DOM, tracked in this plan's decision log.
- **A closed details with only a summary.** A drop after its summary lands in its hidden body, because coverage has no empty range: a reversed `from 1, to 0` range is flipped and covers the summary itself. Owner: Plite DOM coverage (`packages/plitejs/src/dom/plugin/dom-coverage.ts`), tracked in this plan's decision log.
- **Inserting after an empty summary.** A command insertion after an empty details summary still replaces it, because `isReplaceableEmptyBlock` does not check block content. Owner: Plate block insertion (`packages/platejs/src/internal/plugin/blockInsertion.ts`), tracked in this plan's decision log.
- **Empty-anchor replacement on file drops.** A drop after an empty block-content block replaces it through Upload's `replaceEmpty`, outside `canPlaceAt`, so an empty block in a prefix slot can be replaced. Owner: Plite transfer (`packages/plitejs/src/core/landing.ts`) with Plate Upload, tracked in this plan's decision log (panel round 1).
- **Per-dragover check cache.** `checkTransfer` keeps one entry per editor, and a dragover checks two or more edges, so it misses on every dragover. Owner: Plite DOM (`packages/plitejs/src/dom/plugin/dom-drag.ts`), tracked in this plan's decision log (panel round 1).
- **Collapse and unmounted landings.** The collapse refusal runs only in DOM hover, on the edge before the redirect, and a redirect to an unmounted block accepts a drop with no indicator. Owner: Plite DOM, tracked in this plan's decision log (panel round 1).
- **Coverage lookups inside one container.** The coverage index buckets boundaries by top-level block, so a dragover inside one large container reads all of its boundaries. Owner: Plite DOM coverage (`packages/plitejs/src/dom/plugin/dom-coverage.ts`), tracked in this plan's decision log (panel round 1).
- **Non-list blocks between list items.** A paragraph dropped after a parent item splits it from its deeper items, as before this plan. Owner: Plate List, tracked in this plan's decision log (panel round 1).
- **Source middleware idempotence.** A drag expands its keys at start and again at drop, so `editorReads.transfer.source` middleware must be idempotent, which its JSDoc does not say. Owner: Plite transfer, tracked in this plan's decision log (panel round 1).
- **Handle actions inside a containing selection.** `openActions` keeps a node-selected table when a cell block's handle opens its menu. Owner: Plate UI `dnd.tsx`, tracked in this plan's decision log (panel round 1).

## Notes

- Governing review: `docs/research/review-records/2026-10-02-dnd-schema-derived-landing.json`.
- Research: `docs/plite/research/2026-10-02-dnd-landing-policy/` holds the editor survey and the code facts.
- Decision log: `docs/plans/2026-10-02-dnd-schema-derived-landing.decisions.tsv`.
- Page sections live in `docs/plans/topics/dnd.md` under this iteration's headings.
