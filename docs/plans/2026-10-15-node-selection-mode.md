---
review_scopes:
  - selection
  - media
review_basis: []
work_kind: implementation
review_commit: 3d75aa701f08d529b25bc2e426d85ce3a33328eb
review_inputs:
  - packages/plitejs/test/selection-protocol.test.ts
  - packages/plitejs/test/react/object-selection.test.tsx
  - packages/plitejs/test/react/use-element-selected.test.tsx
  - packages/platejs/src/react/components/NodeSelection.spec.tsx
  - apps/www/tests/browser/node-selection-input.spec.ts
  - apps/www/tests/browser/media-caption.spec.ts
---

# Node selection mode: block selection versus object selection

Status: built: hand drive waits on a Chrome that can open this machine's localhost
Page: https://claude.ai/artifact/MaW1Ce8eqL9SLAewNkdAJC
Playbook: plan

The owner's words, after a marquee over an image, a file and an audio block: "blcok selection应该是蓝色的样式，而且不显示 toolbar". After a marquee over the file alone: "但是单独一个点的时候 还有问题". Asked how to fix it, the owner picked option 1, the selection value records how it was made: "1".

## Brief

### What will change?

Built. A box drag, the drag handle or block arrows now paint any block blue with no toolbar, even one file. Clicking an image still shows its ring and toolbar. Browser tests and screenshots prove both.

### What could go wrong?

My own hand check in Chrome is still open, because your Chrome could not reach this machine. Three review rounds found and fixed five bugs; a few rare arrow cases next to hidden content stay open.

## Teach

A node selection is how the editor picks whole things instead of text, such as an image you clicked or blocks you boxed with the mouse. Today it only stores which things are picked. It does not store how you picked them.

So one file picked by a box drag looks exactly like a clicked file. The file shows its gray ring and its toolbar, and the next arrow key may jump into the caption instead of moving to the next block.

After this change every node selection also says whether it is a block pick or an object pick. Box drags, the drag handle, the block menu, block arrow keys and drag and drop make block picks, which paint blue with no toolbar. Clicking or arrowing into an image, file, audio, video or embed makes an object pick, which keeps the ring and toolbar.

## Public API

Every node selection stores its mode. An object pick holds exactly one path.

```ts before
// packages/plitejs/src/interfaces/selection.ts
export type NodeSelection = Readonly<{
  anchorPath: Path;
  focusPath: Path;
  kind: 'node';
  paths: readonly [Path, ...Path[]];
  root?: NamedRootKey;
}>;
```

```ts after
// packages/plitejs/src/interfaces/selection.ts
export type NodeSelectionMode = 'block' | 'object';

export type NodeSelection = Readonly<{
  anchorPath: Path;
  focusPath: Path;
  kind: 'node';
  root?: NamedRootKey;
}> &
  (
    | Readonly<{ mode: 'block'; paths: readonly [Path, ...Path[]] }>
    | Readonly<{ mode: 'object'; paths: readonly [Path] }>
  );
```

The low-level constructor requires the mode, so a rebuild that forgets it does not compile. It takes `mode: NodeSelectionMode` and checks at runtime, so it throws when the mode is missing or when an object pick holds more than one path after duplicate and nested paths merge.

```ts before
// packages/plitejs/src/react/editable/selection-void-target.ts
return start
  ? SelectionApi.nodes([path], start.root ? { root: start.root } : {})
  : null;
```

```ts after
// packages/plitejs/src/react/editable/selection-void-target.ts
return start
  ? SelectionApi.nodes([path], {
      mode: 'object',
      ...(start.root ? { root: start.root } : {}),
    })
  : null;
```

The gesture write defaults to a block pick; an object writer passes `mode: 'object'`.

```ts before
// apps/www/src/registry/components/editor/media-audio.tsx
onFocus={() => {
  editor.update.selection.setNodes([props.element]);
}}
```

```ts after
// apps/www/src/registry/components/editor/media-audio.tsx
onFocus={() => {
  editor.update.selection.setNodes([props.element], { mode: 'object' });
}}
```

`setNodes` options take the mode with or without a direction.

```ts before
// packages/plitejs/src/interfaces/editor.ts
export type EditorSelectionSetNodesOptions = Readonly<{
  anchor: Descendant | NodeKey | Path;
  focus: Descendant | NodeKey | Path;
}>;
```

```ts after
// packages/plitejs/src/interfaces/editor.ts
export type EditorSelectionSetNodesOptions = Readonly<
  { mode?: NodeSelectionMode } & (
    | { anchor?: never; focus?: never }
    | {
        anchor: Descendant | NodeKey | Path;
        focus: Descendant | NodeKey | Path;
      }
  )
>;
```

A named read returns the mode without exposing it on the singular range read.

```ts before
// packages/plitejs/src/interfaces/editor.ts (EditorStateSelectionApi)
nodes: () => NodeEntry[];
```

```ts after
// packages/plitejs/src/interfaces/editor.ts (EditorStateSelectionApi)
nodes: () => NodeEntry[];
nodeMode: () => NodeSelectionMode | null;
```

Media asks for an object pick, so a block pick of the same image leaves its ring and toolbar off.

```ts before
// apps/www/src/registry/components/editor/media-image.tsx
const selected = useElementSelected({ mode: 'node' });
```

```ts after
// apps/www/src/registry/components/editor/media-image.tsx
const selected = useElementSelected({ mode: 'object' });
```

A void or inline element that paints a caret-entry ring asks for a text selection only, so it never lights up under a block-picked parent.

```ts before
// apps/www/src/registry/components/editor/horizontal-rule.tsx
const selected = useElementSelected();
```

```ts after
// apps/www/src/registry/components/editor/horizontal-rule.tsx
const selected = useElementSelected({ mode: 'text' });
```

## What other editors do

Read lexical `8ee00ad53`, tiptap `79fc8b7ce`, slate `0265b7cb`, y-prosemirror `ab83f0e`, Plate v1 `main` `97dabdb9f3`, and the published prosemirror-state 1.4.4, prosemirror-view 1.42.1, prosemirror-history 1.5.0 and prosemirror-tables 1.8.5 sources; BlockNote and Notion were not read. Every editor that tells the two picks apart keeps the difference in the selection value or keeps only one of them.

| Editor | Object pick | Block pick | One picked block: how the renderer tells | Edits, undo, collaboration |
| --- | --- | --- | --- | --- |
| ProseMirror | `NodeSelection` class | none in core; `CellSelection` is the multi-node precedent | by class: only `NodeSelection` gets `selectNode()` | each kind maps itself and ships its own bookmark |
| Tiptap | PM `NodeSelection` | `NodeRangeSelection` class (Shift+Arrow, Mod-a, drag handle) | plugin level by class; React node views use coverage, so a one-block range lights the image ring, the bug this plan fixes | bookmark drops `depth`; no registered JSON id |
| Lexical | `NodeSelection` key set | none | image checks `$isNodeSelection(sel) && sel.has(key)` for its toolbar | stable keys; history snapshots the state; awareness only for ranges |
| Slate | none (`useSelected` is range overlap) | none | cannot tell | range only |
| Plate v1 | Slate range | plugin state `selectedIds` beside the selection | by source, because the editor selection is blurred while block selecting | not in undo, not shared |

Evidence: `docs/plans/artifacts/2026-10-15-node-selection-mode/grounding-prior-art.md`.

## Document shape

The selection envelope codec (`NODE_SELECTION_PERSISTENCE`, read by history persistence and selection persistence) moves to version 5 and stores `mode` on every node selection. Version 4 becomes a legacy decoder that yields a block pick, beside the existing 1 to 3. The history codec's own version stays 4.

```json before
{ "kind": "node", "version": 4, "value": { "anchorPath": [3], "focusPath": [3], "kind": "node", "paths": [[3]] } }
```

```json after
{ "kind": "node", "version": 5, "value": { "anchorPath": [3], "focusPath": [3], "kind": "node", "mode": "object", "paths": [[3]] } }
```

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| `NodeSelection.mode`, `SelectionApi.nodes` requires mode, `isNode`, codec v5, mapping, `read.selection.nodeMode()` | Plite | `plitejs` root (`interfaces/selection.ts`, `core/`) | Plite owns the one selection model (`docs/vision/plite.md:286-288`) |
| Object writers on click and arrow-in; caret-engine caption entry and horizontal stepping by mode | Plite | `plitejs/react` (`react/editable/`) | the owner gestures already live there |
| `useElementSelected` modes `'object'` and `'text'` | Plite | `plitejs/react` | the existing selection hook owner |
| Marquee, block arrows, right-click conversion, overlay excludes object picks, table and AI writers | Plate | `platejs/react`, `platejs` (table, ai) | Plate owns block selection UX |
| `NodeSelectionMode` re-export by identity | Plate | `platejs` facade and generated barrels | Plate re-exports Plite by identity |
| Media, void, inline, handle and block-menu components | Registry | `apps/www/src/registry/components/editor` | copied UI owns paint and toolbars |

## Hard cuts and app migration

Nothing is removed. Breaking changes an app sees:

- `SelectionApi.nodes(paths, options)` requires `options.mode`. A node selection literal without `mode` fails `SelectionApi.isNode` and every write that checks it.

```ts before
// content/docs/api/selection.mdx style call
editor.update.selection.set(SelectionApi.nodes([[0], [2]]));
```

```ts after
editor.update.selection.set(SelectionApi.nodes([[0], [2]], { mode: 'block' }));
```

- `editor.update.selection.setNodes(targets)` keeps working and makes a block pick.
- `NodeSelectionHighlight` paints block picks only. A component that opted out with `data-node-selection-highlight="self"` only to avoid the blue overlay drops the opt-out.
- Persisted selections encode version 5; version 4 and older still decode, as block picks. An older build cannot read version 5.

Copied registry code that changes. `media-toolbar.tsx` loses `useMediaSelection` and `mediaBlockSelectedClassName`, which this run added and never released. `media-image`, `media-file`, `media-audio`, `media-video` and `media-embed` drop the `self` opt-out and read `useElementSelected({ mode: 'object' })`; `media-audio` and `media-video` write object picks on focus. `toc`, `math`, `horizontal-rule`, `code-drawing`, `excalidraw`, `upload`, `mention`, `tag`, `footnote` and the inline equation read `mode: 'text'` for their caret-entry ring. `dnd.tsx` `selectBlocks` and `block-menu.tsx` convert an object pick to a block pick even when membership already matches.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Marquee over one file | blue overlay, no ring, no toolbar | Chromium Playwright `apps/www/tests/browser/node-selection-input.spec.ts` plus a screenshot; hand drive |
| Marquee over image, file and audio | blue on each, no toolbar | same |
| Click an image | ring and toolbar, no blue | `apps/www/tests/browser/media-caption.spec.ts` and `media-select.spec.ts`, whose click and arrow-in expectations gain `mode: 'object'` |
| Handle click or right-click on a clicked image | turns blue, toolbar closes | `node-selection-input.spec.ts` |
| ↓ on a block-picked image | moves to the next block, not into the caption | `packages/platejs/src/react/components/NodeSelection.spec.tsx` and `packages/plitejs/test/react/object-selection.test.tsx` (jsdom) |
| ↓ on a clicked image | enters the caption, as today | same |
| ←/→ on a block-picked image | leaves the pick the way ↑/↓ already does: ← goes before the first picked block, → steps past the last; a neighboring image becomes an object pick instead of a hidden caption caret; at the document edge the key is consumed and the pick stays | `packages/plitejs/test/react/caret-engine-contract.test.ts` (LTR, RTL, edge, image neighbor) and a Chromium case with follow-up typing |
| ←/→ on a table cell pick | collapses into the first picked cell (←) or the last (→) | `packages/platejs/src/react/features/table/TablePlugin.navigation.spec.tsx` |
| ←/→ on a clicked image | steps into or out of it, as today | same |
| Drag an image and drop it | the landed image is a block pick (blue) | `node-selection-input.spec.ts` |
| Focus native audio or video controls | object pick: ring and toolbar | `media-caption.spec.ts` |
| Undo after deleting a clicked image | the restored image is an object pick | `packages/plitejs/test/history/history-persistence-contract.spec.ts` |
| ⌫ at the start of the block after an image (`EDIT-MEDIA-*`) | object pick on the image if a writer exists; otherwise recorded as spec drift | located in step 1.4 before its edit |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Node selection origin | not stored; readers guess from count and schema | required `mode: 'block' \| 'object'` on the one `NodeSelection`; object holds one path | `plitejs` root | owner's pick; law allows one built-in NodeSelection and no parallel store | every writer in `grounding-writers.md`; codec v5 | `selection-protocol.test.ts` | a site writes the wrong mode | rearchitect |
| Rebuild sites | field-by-field rebuilds through `SelectionApi.nodes` | `SelectionApi.nodes` requires `mode`; each rebuild forwards its source's mode | `plitejs` core | a forgotten field fails to compile | the 12 reachable sites and the keyboard root site in step 1.2; about 135 test calls by codemod | typecheck plus lifecycle cases | a test codemod hides a real block/object choice | rearchitect |
| Dead history root branch | `history-state.ts:276-281` and the node side of `history-codec.ts:189-196` test `root === 'main'`, which `isNode` rejects | deleted | `plitejs/history` | unreachable | none | typecheck | none | cut |
| Mapping an object pick | none | stays object while its one node survives as a selectable non-void object or atom; otherwise block; all paths deleted means null | `plitejs` core `mapSelectionWithContext` | an object pick must point at an object | none | mapping cases | wrong role check | rearchitect |
| Object writers | `SelectionApi.nodes([path])` | `mode: 'object'` at `selection-void-target.ts:109, 136` and native media focus | Plite React, registry | the gestures that pick the object itself | none | `object-selection.test.tsx`, browser | a writer left at block | rearchitect |
| Block writers | `setNodes(paths)` | unchanged calls (block default); right-click and handle convert same-membership object picks | Plate, registry | block gestures | none | `NodeSelection.spec.tsx`, browser | same-membership guard skips the write | rearchitect |
| Drag and drop | drag start and landing write node picks | unchanged API; both write block picks | `plitejs/dom`, `plitejs` core transfer | moving content is a block operation; transfer membership already expands lists and groups | none | browser drop case | a clicked image lands blue | keep |
| Vertical keys | `paths.length === 1 && isObject` in `NodeSelection.tsx:810-818`, `caret-engine.ts:525-540` | `nodeMode() === 'object'` | Plate, Plite React | the count cannot see the pick | none | keyboard cases | block arrows trap in captions | rearchitect |
| Horizontal keys | object guard at `caret-engine.ts:762-773`; non-range picks fall through at `:884` | object picks step in or out as today; block picks reuse the ↑/↓ exit (`getObjectReverseEntryTarget`, `getStepPastTarget`, `caret-engine.ts:526-560`) in reading direction, and the key is consumed at the document edge; table cell picks collapse into their first or last cell in `TablePlugin` before the caret engine runs | `plitejs/react` caret engine, `platejs` table | a block pick has no native range | none | caret-engine, table and browser cases | RTL direction | rearchitect |
| Blue overlay | paints every node pick; media and table opt out with `self` | paints block picks; its subscribed selector returns nothing for an object pick; media drops `self` | `platejs/react` | one blue owner | registry media | `NodeSelection.spec.tsx`, browser | stale memo when only mode changes | rearchitect |
| Caret-entry and inline rings | `selected && !nodeSelected`, or plain intersects | hook mode `'text'`: a text selection intersects the element; false under any node pick; projected view selection keeps today's intersects behavior | `plitejs/react` hook, registry | rings showed under a block-picked parent | registry void and inline components | `use-element-selected.test.tsx` | none | rearchitect |
| AI capture and restore | `captureTarget` reads the range; `resetEditor` restores the range anchor; `restoreTarget` rebuilds from keys; `resolveAIChatRequestContext` (`AIChatRequestContext.ts:49`) rebuilds from `AIChatRequestNodeSelection`, which drops root and mode | all four keep the captured node pick and its mode | `platejs` ai | restore is not a new gesture | none | show then hide for `resetEditor`; submit and reload in `AIChatPlugin.submit.slow.ts` for `restoreTarget` and the request context | none | rearchitect |
| Table cell picks | node selection of cells; plain ←/→ unhandled | block picks; plain ←/→ collapse into the first or last picked cell | `platejs` table | cells are not objects, and the new block ←/→ would land outside the pick | none | `TablePlugin.navigation.spec.tsx` | none | rearchitect |
| Yjs import | remote import overwrites any local node pick with a range (pre-existing, mode-independent) | out of this plan; `sanitizeImportSelection` forwards mode for explicit imports | `plitejs/yjs` | the defect predates the plan and needs one rule for text and node picks | sibling bug fix, see Open work | explicit adapter import case in the lifecycle file | collaboration claim narrowed | defer |
| Remote presence | awareness sends a range | unchanged | `plitejs/yjs` | peers draw no remote toolbar | none | none | none | keep |

## Main changes

- Every node selection carries `mode`, and the constructor requires it, so mapping, history, snapshots, views, authored mapping and root qualification forward it or fail to compile.
- Object-pick admission lives in the editor write path: an object pick must be one selectable non-void object or atom, or the write throws.
- `NodeSelectionHighlight` reads the mode in its subscribed selector, so a mode-only change repaints.
- Block picks get model-owned ←/→ that leave the picked blocks.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How a block pick is stored | every node pick stores block or object | only object picks store it | object only | small |
| `setNodes` without a mode | block pick | must always say | require mode | small |
| Left and right on table cells | land inside the first or last picked cell | leave the table | cells exit | detail |
| Dragging and dropping an image | becomes a block pick, blue after drop (look) | stays an object pick | keep object drag | small |
| Closing the equation editor | stays a block pick | caret like a click | equation caret | detail |
| AI restore | keeps the captured pick | always a block pick | AI block | detail |
| Blue on picked media | shared blue overlay | media paints its own blue | own blue | small |
| Rings under a block-picked paragraph | hidden for mentions, tags, footnotes and voids | keep them | keep rings | small |
| Collaboration bug | its own bug fix after this plan (look) | fixed inside this plan | fix collab here | big |
| Voids on click or arrow | keep the caret, never an object pick | make voids object picks | void objects | small |
| Left and right on a block pick | leave the picked blocks | do nothing | arrows inert | small |
| Release notes | fold into the unreleased selection notes | a new breaking note | separate note | detail |
| Arrow past hidden text with nothing visible beyond | keep the pick and swallow the key | land in the hidden text | land hidden | detail |
| Hand check browser | Browser 1, your pick | Browser 2 | use browser 2 | detail |

## Steps

Phase 1. Plite model. Keep when every lifecycle case passes and the plitejs suite is green; otherwise revert the phase.

- [x] 1.1 Add `NodeSelectionMode` and the `mode` union; `SelectionApi.nodes(paths, { mode, anchorPath?, focusPath?, root? })` with `mode: NodeSelectionMode` required and checked at runtime; `isNode` requiring `mode`; codec version 5 with a version-4 legacy decoder producing block. Proof: `packages/plitejs/test/selection-protocol.test.ts` cases for `nodes()` throwing on a missing mode and on an object pick whose paths do not merge to one, `isNode` rejecting a record without mode, a v5 object round trip, and v4 decoding as block.
- [x] 1.2 Forward the source's mode at the 12 reachable rebuild sites: `selection-state.ts:31`, `transforms-selection/select.ts:58`, `selection-protocol.ts:784, 816`, `history-selection.ts:31`, `public-state.ts:11067, 11195, 11272`, `editor-runtime-view.ts:681`, `replace-children.ts:134`, `authored/authored.ts:377`, `yjs/core/editor-adapter.ts:71`. `keyboard-input-strategy.ts:218` forwards mode too, with typecheck as its only proof, because committed node picks in a named root already carry their root (`selection-state.ts:30`) and no supported input reaches it. Delete the dead root branches in `history-state.ts:276-281` and `history-codec.ts:189-196`; mapping keeps object only while the one node survives with its role. Migrate test calls with a codemod that passes `mode: 'block'`, then hand-check the object cases. Proof: `pnpm --filter plitejs typecheck` passes, and a new `packages/plitejs/test/selection-mode-lifecycle.test.ts` asserts `mode: 'object'` after each public boundary an object pick crosses (set, change mapping with a wrap, delete, role loss, undo and redo after a delete, history persistence round trip, `value.replace`, a view root, replace children, authored mapping, an explicit Yjs adapter import). Each mutant from `.agents/pstack/mutate.mjs` replaces one site's forwarded mode with `mode: 'block'`, so it stays valid, and must turn a case red.
- [x] 1.3 `setNodes` options per the Public API pair, with block as the default; object admission in the write path; `read.selection.nodeMode()`; `useElementSelected` modes `'object'` and `'text'`. Proof: `packages/plitejs/test/react/use-element-selected.test.tsx` cases for a same-path block to object switch repainting and `'text'` false under a node pick of the parent; `packages/plitejs/test/state-tx-public-api-contract.ts` for admission throwing on a void and on a paragraph.
- [x] 1.4 Plite React writers and keys: `selection-void-target.ts:109, 136` write object; `caret-engine.ts:525-540` checks `nodeMode() === 'object'`; `caret-engine.ts:762-773` keeps object stepping and adds block-pick ←/→ that reuse the ↑/↓ exit in reading direction, consuming the key at the document edge; locate the writer for the `EDIT-MEDIA-*` ⌫-after-media rule and give it object mode, or record spec drift. Proof: `packages/plitejs/test/react/object-selection.test.tsx` (a click writes object; ↓ enters the caption only for an object pick) and `packages/plitejs/test/react/caret-engine-contract.test.ts` (←/→ on a block pick in LTR and RTL, at the document edge, and beside an image, which becomes an object pick).

Phase 2. Plate and registry. Keep when the user's cases pass in Chromium; otherwise revert the phase and keep phase 1.

- [x] 2.1 `NodeSelection.tsx`: the onKey yield checks object mode; right-click on a selected object converts it to a block pick; `NodeSelectionHighlight`'s subscribed selector returns no targets for an object pick; table writers make block picks and `TablePlugin` collapses plain ←/→ on a cell pick into the first or last picked cell; AI `captureTarget`, `resetEditor`, `restoreTarget` and `AIChatRequestNodeSelection` keep the captured node pick and mode; `platejs` re-exports `NodeSelectionMode` and `pnpm brl` regenerates barrels. Proof: `packages/platejs/src/react/components/NodeSelection.spec.tsx` (↓ from a block-picked image selects the next block; a same-membership mode switch repaints the overlay) and `AIChatPlugin` cases: object-pick an image, show, hide, assert the object pick; then extend `AIChatPlugin.submit.slow.ts:170` to submit and reload from an object pick and assert the restored object pick and the request context's mode; `TablePlugin.navigation.spec.tsx` for ←/→ on a cell pick.
- [ ] 2.2 Registry per Hard cuts; `caption.tsx` guard reads `nodeMode() !== null`. Proof: registry specs (`media-toolbar.spec.tsx`, `media-image.spec.tsx`, `media-file.spec.tsx`, `toc.spec.tsx`), then `PLAYWRIGHT_BASE_URL=<doctored url> pnpm --filter www test:www-browser:chromium tests/browser/node-selection-input.spec.ts tests/browser/media-caption.spec.ts` with new cases for a one-file marquee, a three-media marquee, an image click, a handle click, an image drop and audio focus, each asserting the overlay, the ring and the toolbar; then `verify`'s hand drive with screenshots read.
- [x] 2.3 Docs, law and release: run `plate-docs` on `content/docs/(guides)/selection.mdx`, `content/docs/api/selection.mdx`, `content/docs/api/editor-transforms.mdx`, `content/docs/api/react-hooks.mdx` (the five hook modes and how `'node'`, `'object'` and `'text'` differ), `content/docs/api/core/plate-components.mdx`, `content/docs/api/element.mdx`, `content/docs/api/dom.mdx` (drag start makes a block pick), `content/docs/(plugins)/(elements)/media.mdx`, `content/docs/(plugins)/(functionality)/block-menu.mdx` and `content/docs/(plugins)/(functionality)/dnd.mdx`, plus each existing Chinese twin; update the JSDoc in `packages/plitejs/src/dom/plugin/dom-editor.ts:269`; amend `docs/vision/plite.md:355-358` (NodeSelection stores mode; collaboration keeping node picks is open per this plan's Open work) through `best-api repair`; revise `EDIT-SEL-BLOCK-ARROW-001`, `-SHIFT-001`, `-YIELD-001` and the media ownership section of `docs/editor-behavior/markdown-editing-spec.md`, adding a one-block marquee rule and a block-pick ←/→ rule (document edge, RTL, image neighbor), and tag the proving tests; narrow the block-arrow row from PR 5156 in `docs/plans/topics/correct.md`'s Open work; `changeset` for `plitejs` and `platejs` and the registry changelog entry. Proof: `pnpm --filter www build:source`, `pnpm --filter www check:docs`, `pnpm --filter www build:registry --check`, `pnpm kb check`, changeset files present.

## Open work

- Hand drive: the agent's own Chrome pass over the 94 desktop pages `hand-drive.mjs scope` lists. Browser 1, the owner's pick, refused `localhost:3519` and `127.0.0.1:3519` twice, with the drive server started inside and outside the sandbox, so it runs on another machine or network. The 69 load cells, the route records and Playwright screenshots of the two reported cases are done. owner: Felix, who opens the drive server in a Chrome on this machine or picks Browser 2. stop: `node tooling/scripts/hand-drive.mjs check` passes on the plan's file list.
- Caret steps next to hidden content: a step past a skip-policy boundary can land in an undrawn object caption, and a node target inside hidden content is not checked (diff round 3, opus). The text-caret path predates this plan. owner: Felix. stop: a caret pass on hidden boundaries beside objects lands with tests, or the owner drops it.
- Table keys: Left and Right on picked cells ignore RTL, and the Safari IME composition branch still reads the projected cell count (diff rounds 1 and 2). owner: Felix. stop: a table keyboard pass covers RTL and Safari IME.
- Yjs import keeps an object pick after checking only that its path exists, so an import whose change dropped the object role throws (diff round 1). Folded into the Yjs item below. owner: Felix. stop: as below.
- A root view's `value.replace` with a node selection checks ranges against the main root; it fails at base too (decision log, phase 1). owner: Felix. stop: a bug fix with that case lands, or the owner drops it.
- Handle click, actions menu, Escape, then ArrowDown: focus stays off the editable, so the key is ignored, at base too; the browser case starts from a marquee instead. owner: Felix. stop: a focus fix for the actions menu lands with that browser case.
- `⌫` after media spec drift: recorded in `docs/editor-behavior/current-evidence.md` with this run's browser evidence. owner: zbeyens. stop: the spec note and the shipped key agree, proved by a test.
- Docs gaps the forward test found that predate this plan: `tx.selection.set`'s signature in `api/editor-transforms.mdx`, `collapsed` mode under a node selection in `api/react-hooks.mdx`, and the `/docs/examples/node-selection` link. owner: zbeyens. stop: the docs owner revises those pages.
- Yjs remote import replaces any local node selection with a range (`yjs/core/editor-adapter.ts:177-182` after `controller.ts:1256-1259`), for block and object picks alike, while text picks keep their old paths on purpose (`wrap-nodes-contract.spec.ts:159`). This plan is its tracker. owner: Felix (the owner), who decides one rule for text and node picks. stop: a bug-fix plan with an adapter contract test lands, or the owner drops it.

## Panel rounds

Round 1 (opus, gpt-6-astra @xhigh, gpt-6.1-sol) on frozen commit `499f89e70d`. Challenge delta: improved. Moved from optional stored mode to a required mode at the constructor and in the stored value; deleted the drag `mode` option (drag and drop make block picks); added block-pick ←/→; moved the Yjs fix out to Open work; deleted two dead history branches; widened the docs set and the AI restore routes. Details in the decision log.

Round 2 (same seats) on frozen commit `97320c9dcc`. No critical finding, so no round 3. Challenge delta: improved. Block ←/→ reuses the ↑/↓ exit so a neighboring image becomes an object pick; table cell picks keep ←/→ inside the table; mutants write `'block'` instead of dropping the field; `nodes()` checks mode at runtime; the AI proof covers submit, reload and the request context; the keyboard root site leaves the mutation list; this plan tracks the Yjs item.

Diff round 1 (same seats, `api-build`) on frozen commit `10dc6ad353`. Three critical findings, all applied: a block pick's Left or Right exit could land in a collapsed Details body; the table branch caught whole-table picks and missed one-cell picks; AI restore replayed a stale object mode. The drop test now proves the drop happened.

Diff round 2 on frozen commit `67fb9a88e4`. Two critical findings in round 1's fixes, both applied by replacing the approach: AI restore now checks the resolved node's role, which works in views and named roots; a hidden-only exit keeps the pick instead of writing a text range.

Diff round 3 on frozen commit `9d3b51a6e2`, the cap. No critical finding. The overlapping-boundary warning is applied; the object-caption and hidden-node warnings are open work.

## Completion Gates

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Plan panel | yes | A panel on this plan (`api-plan`) | two rounds, `docs/plans/artifacts/2026-10-15-node-selection-mode/panel-r1-*.md` and `panel-r2-*.md`; round 2 had no critical finding |
| Blast radius | yes | `pstack:blast-radius` before code moves | `docs/plans/artifacts/2026-10-15-node-selection-mode/blast-radius.md` |
| Base controls | yes | Each step's cheapest control at base in a detached worktree | `docs/plans/artifacts/2026-10-15-node-selection-mode/base/base-control.log`: at base a block-gesture pick of one object sends ArrowDown into the caption |
| Writing passes | yes | `deslop` and `no-comments` on code; `unslop` on docs and this plan | `docs/plans/artifacts/2026-10-15-node-selection-mode/comment-sicko/reply.md`; decision-log `writing` rows for the build and each diff round |
| Diff panel | yes | A panel on the build's diff (`api-build`) | three rounds, `docs/plans/artifacts/2026-10-15-node-selection-mode/panel-d1-*.md`, `panel-d2-*.md`, `panel-d3-*.md`; round 3 had no critical finding |
| Best API repair | yes | `best-api repair` for the changed public API | `docs/vision/plite.md` NodeSelection law amended; teaching sweep clean; forward test `docs/plans/artifacts/2026-10-15-node-selection-mode/forward-test/reply.md` |
| Docs | yes | `plate-docs` on each page step 2.3 names | `build:source` and docs source parity pass; `api-reference:check` passes after classifying the new type; `build:registry --check` fresh |
| Release notes | yes | `changeset` for `plitejs` and `platejs`, registry changelog | unreleased `single-selection-authority-plite`, `-plite-react` and `-plate` changesets amended; registry entry `2026-10-14-block-void-selection` amended, `--check` passes |
| Hand drive | yes | `node tooling/scripts/hand-drive.mjs check` on the www files | partial: 69 load cells and route records done; 94 desktop cells open because the owner's Chrome cannot reach this machine; Playwright frames `docs/plans/artifacts/2026-10-15-node-selection-mode/final-marquee-file.png` and `final-image-click.png` read |
| Last lint fix | yes | `pnpm lint:task` on the task's code files | `docs/plans/artifacts/2026-10-15-node-selection-mode/lint-task-2.log`: the only errors left are on lines this task did not write, and the same 9 fail at base (`docs/plans/artifacts/2026-10-15-node-selection-mode/lint-base-a1.log`) |
| Full check | yes | `pnpm check` once on the settled change | partial: `docs/plans/artifacts/2026-10-15-node-selection-mode/final-pnpm-check.log`, 14 of 25 steps red; no failure names a line this task wrote; the slow table and Markdown cases, the entrypoint graph, the yjs partition and the lint lines fail the same way at base |

## Proof

- Phase 1: `bun test` on the plitejs files named in steps 1.1 to 1.4, the mutation checks for 1.2, and `pnpm --filter plitejs typecheck`.
- Phase 2: the platejs and registry specs, the Chromium browser specs on a doctored www instance, and the hand drive (`node tooling/scripts/hand-drive.mjs check`).
- Before the build: each step's cheapest control at base in a detached worktree.
- At the end: `pnpm lint:task` on the task's paths, and `pnpm check` once for the settled change.

Execution playbook: Build (`.agents/playbooks/build.md`).

## Demo

1. Open `/docs/media` on the www dev server. Drag a box from the left margin over the `sample.pdf` row only. The row turns blue, with no gray ring and no toolbar. ![before](artifacts/2026-10-15-node-selection-mode/marquee-file-3298.png) ![after](artifacts/2026-10-15-node-selection-mode/final-marquee-file.png)
2. Drag a box over the image, the file and the audio together. All three turn blue, and none shows a toolbar.
3. Click the image itself. It shows its ring and the Edit link, Preview, Caption and delete toolbar. ![after](artifacts/2026-10-15-node-selection-mode/final-image-click.png)
4. With the image clicked, click its drag handle. The ring and toolbar go away and the image turns blue.
5. Box-select one paragraph and press Left or Right. The caret leaves the paragraph before or after it, and a neighboring image gets its ring.

## Close

Reversals and deviations first:

- AI restore checks the object role inline with the public schema reads instead of the shared Plite predicate, because the entrypoint rules forbid `platejs/ai/react` from importing `plitejs/internal`. Same rule, proved by the same tests and mutants.
- `caption.tsx` keeps `nodes().length > 0` instead of `nodeMode() !== null`; the two are equivalent.
- The browser ArrowDown case starts from a marquee, not a handle click, because the actions menu leaves focus off the editable at base too.
- The `api-reference` config now also classifies `SchemaRoot` and `SchemaRootInput`, which another change left unclassified, so the docs check could run.

What landed: every Plite node selection stores `mode`, block or object. Block gestures make block picks, which the shared blue highlight paints; clicking or arrowing onto media makes object picks, which keep the ring and toolbar. Plain Left and Right leave a block pick, table cell picks land inside the cells, and AI keeps the pick and its mode. Docs, the editor-behavior spec, the Plite law and the unreleased release notes teach the new shape.

Proof and its limits:

- Plite model: selection-protocol and lifecycle tests, 12 lifecycle mutants caught on the final frozen code `e7909ad6bd` (`mutate-final.log`); scope: model, codec, mapping, history, snapshots, views, authored and an explicit Yjs import.
- Keys: jsdom keyboard and object-selection tests, including skip-boundary exits, edges and overlapping boundaries, with their mutants caught; scope: jsdom key dispatch, no native caret.
- Plate: NodeSelection, TablePlugin navigation and AIChatPlugin submit specs with mutants caught; scope: package specs, no browser.
- Browser: 41 of 42 Chromium cases in `media-caption`, `media-select` and `node-selection-input` pass on the drive server at `:3519`; the failing `ArrowDown scrolls each newly selected block into view` fails the same way at base. Two cases that failed on the cold first run passed warm.
- Package suites: every plitejs and platejs partition passes except the five that fail at base the same way (yjs exclusive property 8, ai-react suggestions 2, basic-nodes authored tree 14, code-block 1, migrations typecheck).
- Full check: `pnpm check` has 14 red steps. None names a line this task wrote. At base in a detached worktree, the slow table-cell list case, the Markdown blockquote case and the entrypoint graph fail the same way, as do the yjs partition and the lint lines. The www type errors sit in Markdown, docx and AI prompt files this task did not touch, and were not rerun at base.
- Not proven: the agent's own Chrome hand drive of the 94 desktop pages, see Open work. `/pstack:reflect` did not run: the owner corrected nothing in this run.

Counts: 18 items, 7 steps and 11 gates. 15 done, 3 partial, 0 skipped, 0 blocked, 0 open. The partial ones are step 2.2 and the Hand drive gate, both waiting on the Chrome pass, and the Full check gate.

Open work: see `## Open work`, each item with its owner and stop.
