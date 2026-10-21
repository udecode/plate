---
review_scopes: [runtime]
verdict: pursue
review_basis: [2026-10-04-runtime-audit, 2026-10-17-named-root-targeting]
work_kind: implementation
review_commit: a28e4eecbe75238a877d013930570d749a582fa0
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plite.md, docs/vision/plate.md, docs/plans/2026-10-19-plite-feature-specs-intake.md, docs/plans/2026-10-17-named-root-targeting.md, packages/plitejs/src/react/hooks/root-selection-cache.ts, packages/plitejs/src/react/hooks/use-plite-runtime.tsx, packages/plitejs/src/react/editable/root-interaction-controller.ts, packages/plitejs/src/react/editable/selection-controller.ts, packages/plitejs/src/react/editable/selection-reconciler.ts, packages/plitejs/src/react/components/plite.tsx, packages/plitejs/src/react/components/editable-text-blocks.tsx, packages/plitejs/src/react/components/windowed-editable.internal.tsx, packages/plitejs/src/react/view-selection.ts, packages/plitejs/src/core/anchor.ts, packages/plitejs/src/core/anchor-state.ts, packages/plitejs/src/core/authored-runtime.ts, packages/plitejs/src/core/command-registry.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/core/plugin-dispatch.ts, packages/plitejs/src/editor-runtime-view.ts, packages/plitejs/src/interfaces/editor.ts, packages/plitejs/src/utils/node-keys.ts, packages/plitejs/test/react/use-plite-root-chrome.test.tsx, packages/platejs/src/internal/plugin/pluginStore.ts, packages/platejs/src/internal/plugin/insertionAnchor.ts, packages/platejs/src/react/stores/plate/usePluginStore.ts, packages/platejs/src/react/components/PlateRoot.internal.tsx, packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts, packages/platejs/src/features/details/lib/BaseDetailsPlugin.spec.ts, packages/platejs/src/features/upload/lib/BaseUploadPlugin.ts, packages/platejs/src/react/features/suggestion/suggestion-view.internal.tsx, apps/www/src/registry/components/editor/details.tsx, apps/www/src/registry/components/editor/toc.tsx, apps/www/src/registry/components/editor/link.tsx, apps/www/src/registry/examples/find-demo.tsx, apps/www/src/app/(app)/examples/plite/_examples/authored-changes.tsx]
review_upstreams: ['../codemirror-language@8e9700018446d46f23267f6e31da56628d5117c0', '../codemirror-state@9c801279cb83011e6f92af778f4443406e8f1200', '../codemirror-view@fbff59ba004d80d8c914f64c42586387b08706ac', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../prosemirror-state@ffad5d9450a0b93438be53a801deee1a223a81bf', '../prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../vscode@df2411cf7d8f2e0cfc79109a3bc8eaab2c69165b']
---

# Views of one document: what each view owns

Status: partial: built and proven; the Phase 1 exit timing waits on t_43ad4bac
Playbook: plan

**Pursue.** Two `EditorRoot`s on one editor already show one document in two views, as the find demo does, and each `EditorRoot` gets its own view editor. Each view owns its focus, composition and read-only state, but two things a user sees per view are still kept once per editor. When chrome or a blank click reactivates a view, it restores a caret from a per-root cache that records every commit from every view. So view A restores view B's caret, and the saved range never moves through later edits (t_f7956c53). Details open state sits in a plugin store every view shares. Collapsing a section in one view collapses it in the other, and `api.setOpen` moves another view's caret out of the body it hides. This plan gives each mounted view both: its own caret, kept as an anchor while another view holds the live caret, and its own Details open state in a new Plate view store that commands read. The live selection stays one per document, so the spec's `selection: 'shared' | 'own'` option is not needed. The execution playbook is Build.

## Brief

### What will change?

With two views open, clicking a view's blank space or tabbing into it brings back that view's own caret, moved by the other view's edits. Collapsing a section in one view leaves it open in the other.

### What could go wrong?

The view store is new public API. Apps reading Details' plugin store must switch. Code setting a caret through a view's editor gives that view the caret. Typing speed with resting carets is still untimed.

## Teach

A Plite editor holds one document, its history and one live caret. Each editor root mounts a view of that document, so two roots show it side by side, as in the find demo. The editables inside one root are parts of that root's view.

After this change, Plite remembers which view last placed the live caret, by a click, a key, a tab or that view's code. Edits that only shift the caret do not count. When another view takes the caret, Plite keeps the old view's caret as an anchor, which moves with every edit. Clicking or tabbing back into that view brings it back. A saved caret inside a section its view collapsed lands at the end of the section's title.

Plate plugins get a view store beside their plugin store. Details keeps open sections there, one set per view. Enter, Backspace, Delete and file drops next to a section read the view they happen in.

## Public API

Each Details block reads whether it is open in its own view.

```ts before
// apps/www/src/registry/components/editor/details.tsx
const openKeys = usePluginStore(BaseDetailsPlugin, 'openKeys');
const { api } = useEditor().plugin(BaseDetailsPlugin);
const open = detailsKey !== undefined && openKeys.has(detailsKey);
```

```ts after
// apps/www/src/registry/components/editor/details.tsx
const { api } = useEditor().plugin(BaseDetailsPlugin);
const open = useViewStore(
  BaseDetailsPlugin,
  (state) => detailsKey !== undefined && state.openKeys.has(detailsKey)
);
```

A heading jump opens the collapsed sections around the heading in the view that jumped, not in every view.

```ts before
// apps/www/src/registry/components/editor/toc.tsx
return detailsKey && !details.store.get('openKeys').has(detailsKey)
  ? [detailsKey]
  : [];
```

```ts after
// apps/www/src/registry/components/editor/toc.tsx
return detailsKey && !details.api.isOpen(detailsKey) ? [detailsKey] : [];
```

A plugin declares per-view state next to its plugin state.

```ts before
// packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts
initialState: (): BaseDetailsPluginState => ({
  openKeys: new Set(),
}),
```

```ts after
// packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts
initialViewState: (): BaseDetailsViewState => ({
  openKeys: new Set(),
}),
```

A command reads the view state of the view it runs in, through the state it receives.

```ts before
// packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts
if (!store.get('isOpen', detailsKey)) return exitAfterDetails();
```

```ts after
// packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts
if (!viewStoreOf(state).get('openKeys').has(detailsKey)) {
  return exitAfterDetails();
}
```

## What other editors do

A Codex read of nine checkouts, named with their revisions in this page's front matter, read source and ran none of them. Every editor that shows one document twice gives each view its own caret, and VS Code also maps a resting view's caret through the other view's edits with tracked ranges. Fold state is per view wherever an editor builds it in, except Lexical's playground, which writes `open` into the document.

| Editor | Two views of one document | Where each view's caret lives | Where fold or collapse state lives |
| --- | --- | --- | --- |
| ProseMirror | App wiring: separate states that forward steps, or one shared state | `EditorState`, so per view only with separate states | Nothing built in; a plugin decides |
| Lexical | Separate editors synced through Yjs | Each editor's state | The playground's collapsible writes `open` into the document |
| Slate | No built-in split | `editor.selection`, one per editor object | Nothing built in |
| Tiptap | Separate editors synced through Collaboration | Each editor's ProseMirror state | Details keeps it per node view unless `persist: true` writes it into the document |
| CodeMirror 6 | Separate states that forward changes | `EditorState.selection`, mapped through forwarded changes | `foldState` per state, mapped through changes |
| VS Code | One text model, one view model per split | Per split, tracked by model markers so it follows edits | Per split's folding model, saved with its view state |
| Plite after this plan | One document, one view editor per `EditorRoot` | One live selection; each view that does not hold it keeps its own caret as an anchor | Details open state per mounted view, in Plate's view store |

## Layer and owner

| Delta | Responsibility | Decision |
| --- | --- | --- |
| changed | Views | `editor-runtime-view.ts` reuses the owner's registry and state, projects reads and writes to one root, and owns view-local focus, composition and read-only state; extension API factories receive the actual view. Each view also carries a private presentation, one per root component an app renders. Every public `EditorRoot` starts a new one, whatever editor it is given. The Editables inside it, the roots Plite mounts for its own surfaces and the `EditorContent`s inside one Plate `EditorRoot` share it, through a headless carrier in `plitejs/internal`. |
| added | Live selection | One per document and the commit truth. Plite records which presentation and root placed it last. A pair that loses it keeps its caret as an anchor and gets it back when reactivated. |
| added | Plugin view state | Plate keeps a view store per plugin and presentation, declared with `initialViewState`; plugin stores and history stay model-owned. |

| Delta | Alternative | Why it lost |
| --- | --- | --- |
| added | An option on each view choosing a shared or own caret | No view wants another view's caret, and the shared mode keeps today's defect as a setting. |
| added | One live selection per view | Plite owns one selection model with no parallel selection state; every command, history entry and collaboration cursor would have to pick a selection. |
| added | Ownership taken only by focus and clicks | Every sequence that sets a caret and then focuses gets the wrong owner, `focusRoot` included, and headless views would have no owner. |
| added | Details open state in a plugin store every view shares | Vision forbids editor-global plugin state for a view-local presentation choice, and the shared set already forces `setOpen` to move another view's caret. |
| added | Details open state in the document | Toggling would become an undoable edit, a read-only viewer could not toggle, and Details HTML round-trips without persisted UI state. |
| added | A private store inside each feature | A third-party plugin could keep per-view state only in React, where its headless commands cannot read it, and each first-party feature would repeat the store, its subscriptions and its view lookup. |

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| Presentation identity, caret owner and parked carets | Plite | `plitejs` root (`core/view-presentation.ts`, `core/view-carets.ts`), reached by Plate through headless carriers in `plitejs/internal` | Carets must park inside the commit before any listener runs, and Plate's `setOpen`, which is headless code, reads the owner without React. |
| Mounted lifetime, restore and each root's presentation | Plite | `plitejs/react` (`react/editable/view-caret-restore.ts`, `components/plite.tsx`) | Only React knows which surfaces are mounted and which Editable a click lands in. |
| Routed root transactions and projected input keep the caller's presentation | Plite | `plitejs` root (`core/plugin-dispatch.ts`, `editor-runtime-view.ts`) and `plitejs/react` (`react/editable/mutation-controller.ts`) | A command run in another root still reads the view that started it. |
| View store | Plate | `platejs` core (`internal/plugin/pluginStore.ts`, `lib/plugin`) and `platejs/react` (`useViewStore`) | One owner for every plugin's per-view state. |
| Details open state | Plate | `platejs/details` | It is per-view presentation. |

## Main changes

- `packages/plitejs/src/react/hooks/root-selection-cache.ts` goes. Plite core records the caret's owner as the presentation and root that placed the live selection. When the owner changes, the old pair parks its caret as a range anchor, or as node keys plus a fallback anchor for a block selection. The parked caret is the selection before the commit, mapped through it. Parking runs in the commit's anchor initialization, so the anchor starts mapping after this commit and exists before any listener runs. The commit runs that one initialization when a plugin publication or a park needs it, and both share the call. A claim outside an update parks from the live selection at once. A clear parks the owner's caret and leaves no owner, so a restore after Escape or an outside press still has a caret to bring back. A base placement that moves the live selection into another root does the same, because it overwrites the owner's only caret. A base placement that selects in a root and leaves no owner drops every view's parked caret in that root, because it is newer than all of them, so the next view to restore there takes it.
- Only presentations that a mounted `EditorRoot` retains claim or park. A view no root retains never holds the caret, so headless apps keep today's behavior. Core tests retain their views through the private carrier `EditorRoot` uses, and release them.
- The owner moves on an explicit caret placement, credited to the presentation that made it. A view's update names its presentation to the base update, a dispatched command names the dispatching editor's, and a base update names none. A read-only view's native selection import, clear and outside press run a base update that names the view's presentation as placer without lending it write authority. The transaction carries the placer, so nothing outside it reads the placer. Each placement records the presentation that made it, and the last placement through a view in a transaction sets the owner, so a base update that wraps a view's placement credits the view. A routed call into another root keeps the caller's presentation. One private helper, `setSelectionAsView`, writes a selection a view places. Inside a running update it writes through that update and credits the view. Outside one, a read-only view writes through that base update and a writable view through its own update.
- A private placed mark records where a caller asks for a selection: `tx.selection.*`, the `select` command, the transforms that set a selection on purpose, a `select: true` option on node inserts and replacements, and the selection given to `value.replace`. A transform that re-applies a mapped selection, as `nodes.remove` with no `at` does, never sets it, and neither do spec application, mapping, `next.after` continuations and `setCurrentMarks`. The core step starts with a census of every selection writer, each classed as a placement or a re-application, kept in the run directory. A command frame's commit carries the mark to the outer spec. Mapped selections, remote edits, base-editor writes, an update that throws and a discarded command probe never move the owner. A placement at the caret's current spot still moves it, because settling also runs when an update changes nothing. Every placement and claim bumps a placement generation.
- Three mounted events claim the caret. Focus that no click in that Editable started claims and restores. Typing in an Editable whose surface does not hold the caret claims in `editable-dom-runtime.ts`'s `beforeinput` handler and types at that view's own caret, which the [caret placement plan](2026-10-20-view-caret-placement.md) brings back first. `focusRoot` claims. When they adopt the live caret, all three go through one path. When the view hides the live caret, such as inside a section it collapsed, that path first moves the caret out as a restore does, even when the view already holds it. A native selection equal to the live one claims nothing, so the echo of Plite's own DOM export leaves the owner alone. That holds for the echo in the holder's own view. Selection events from other views still break these claims in five ways. The caret placement plan lists them with their red cases, and the [selection import plan](2026-10-21-view-selection-import.md) fixes them. A mouse press in an Editable ends at a release, cancel or drag end anywhere in the document, or when the window loses focus, so a press released outside the Editable never blocks a later focus restore.
- Every public `EditorRoot` starts a new presentation, whatever editor it is given, so a configured view mounted by two roots gives two views. Sharing is explicit. `plitejs/internal`'s headless `withMountedPresentation(editor, view)` returns a view of `editor` that an `EditorRoot` mounts under `view`'s presentation. The five roots Plite mounts for its own surfaces pass one: `editable-text-blocks.tsx:406` and `:1654`, `windowed-editable.internal.tsx:97`, `virtualized.tsx:125` and `pagination/react.tsx:1404`. Plate's `PlateRoot.internal.tsx:55` passes one built from the model editor and its Plate root's view, so every `EditorContent` in one Plate `EditorRoot` shares that root's presentation, as Editables in one Plite root do. Each content keeps its own view editor, so `useEditor()` still returns the exact view `docs/vision/plate.md` asks for, and Plite's root hooks in Plate chrome find the content of their root, as the roots guide teaches.
- `createEditorView(view)` keeps its source's presentation, so `BaseListPlugin`'s projections of a mounted view keep theirs. `getView`, `useRootEditor` and `useRootState` build from the owner and take only the nearest surface's presentation, so they inherit no read-only or authored policy. Mounted-view lookup, the content-root owner registries and the registered root-view fallback that content-root navigation uses key on root and presentation. The view-selection store keys on presentation, so `setPliteViewSelectionStoreKey`, `getLastSelectionForRoot` and `focusRoot`'s `forceSelection` option go.
- `focusRoot` and keyboard focus restore by placing the view's caret once. A restore takes the parked caret, moves it out of any section that view has collapsed, places it and focuses the Editable. The clamp reads the coverage the surface last published, and a restore waits for a publication still pending. It places only while the placement generation is the one it read before waiting, so a placement any view or the base editor makes meanwhile wins. In an authored view, a caret inside text the projection hides restores to the nearest visible point. The restore places through `writeRuntimeSelection`, so a read-only view restores through the path its selection import uses. There is no second try. In Chromium, the focus a restore causes keeps the restored caret, on script focus, a chrome press, and Shift+Tab followed by a keystroke (`panel-diff-1/probes/replay-ab.md`).
- A mounted surface's presentation is retained from its `EditorRoot`'s first insertion effect to its real unmount, so StrictMode replays and an Activity hide keep its parked carets (`probes/premises/lifetime-a1.log`). Releasing a presentation drops its parked carets and its view stores.
- Named-root dispatch and projected input share one root-transaction builder. It builds a transaction from the owner for the target root, carrying the caller's presentation, and caches it by presentation and root. Projected paste, Enter and typing run their commands through it for the target's root instead of through the owner's raw transaction. They keep the owner's policy, land in the target root and read the calling view's state.
- Plate keeps view stores in the same owner entry as plugin stores, keyed by presentation. A write takes effect at once, as plugin store writes do, and reconfiguration clears both. Each presentation's view store has its own subscribers, so a toggle in one view runs no selector in another. Open state lives as long as its presentation. Remounting an `EditorContent` keeps it, and remounting the root component starts with every section closed. `viewStoreOf(state)` returns a reader and `viewStoreOf(tx)` a writer, so a read stays pure. A write from an update that throws or from a discarded command probe stays, as a plugin store write does. A fresh key is never handed out twice (`probes/premises/key-reuse-a1-a1.log`), but a node an app kept from a thrown update and inserts again keeps its key, so it comes back with the open state that update wrote. A close followed by a throw leaves the section closed with the caret still in its body, and the next restore or keystroke in that view moves the caret out.
- Inside an update, `setOpen` reads the active transaction's selection and moves the caret through `setSelectionAsView`, credited to the view that calls it. A close that view b runs inside view a's update leaves b the owner. A close right after a placement in the same update sees the placement.
- Upload's file drop stops building its own caret view. The drop handler routes `submit` to the caret's root with the dropping view's presentation, and `submit` finds the caret anchor in that transaction. A drop through a view of the main root while the caret sits in `note` reads that view's open state in `note`.

## Hard cuts and app migration

- `BaseDetailsPluginState`, `openKeys` in `BaseDetailsPlugin`'s plugin store and the `isOpen` store selector go. `usePluginStore(BaseDetailsPlugin, 'openKeys')`, `store.get('openKeys')` and `store.get('isOpen', key)` stop working. The callers are the registry `details.tsx` and `toc.tsx`, `details.mdx` and `details.cn.mdx` (the store example at lines 187 and 189), the `BaseDetailsPluginState` entry in `api-reference.config.json`, and six spec files: `BaseDetailsPlugin.spec.ts`, `BaseDetailsCommands.spec.ts`, `BaseDetailsConversion.spec.ts`, `BaseCodeBlockPlugin.spec.tsx`, `block-insertion.spec.ts` and the registry `details.spec.tsx`. An app reads a view's open state with `useViewStore` or `api.isOpen`, as the Public API pairs show. Vision already rules this cut, because it forbids editor-global plugin state for a view-local presentation choice.
- `api.setOpen` called on the base editor changes the base editor's own open state, which no mounted view shows. App code calls it on the view editor that `useEditor()` returns. Closing a section moves the live caret out of its body only when the calling editor is writable and holds that caret, or no view holds it. A read-only view's close no longer moves the selection, so the read-only close case in `BaseDetailsPlugin.spec.ts` changes its expectation.
- An `EditorRoot` an app nests inside another root no longer shares its parent's caret, whatever editor it is given, and a configured view mounted by two roots gives two views. The authored-changes example's named-root sample and the editor-perf dev page each nest a root given the editor, and those become independent views, as the authored-changes main-root sample already is. `docs/vision/plite.md` already says each public `EditorRoot` owns an independent mounted view.
- Plite's public API keeps its shape. `createEditorView(view)` now keeps its source's caret and view state. `plitejs/internal` gains headless presentation carriers that Plate reads, `withMountedPresentation` among them, and no React code enters it.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Blank-click or chrome reactivation of the second view in the find demo | Restores that view's own caret, moved by the other view's edits, instead of the other view's | jsdom Plite tests R1 to R9; Chromium hand drive of `/docs/find`'s demo, five warm runs |
| Tab into a view whose caret is parked | Restores that view's own caret instead of taking the live one | jsdom R10; Chromium hand drive, five warm runs |
| Header and main chrome restore under one `EditorRoot` | Unchanged | The existing `use-plite-root-chrome.test.tsx` cases, R27 among them |
| Root chrome outside an `EditorContent`, as Plate's roots guide teaches | Restores that content's own caret and focuses it, as today | R26; the multi-editor browser suite |
| Block selection restore | A view gets its own block selection back, in its own direction | jsdom R7 |
| A restored caret inside a section the view collapsed | Lands at the end of the section's title with a visible caret, and the section stays closed | Registry R23 in jsdom; Chromium hand drive |
| Enter, Backspace and Delete beside a section collapsed in one view only | Each follows the open state of the view the key went to | Headless Plate specs R13 to R15; Chromium hand drive with a toggle inserted through the slash menu |
| Collapsing a section while the other view's caret sits in its body | The other view's model and native selection, focus and scroll stay | Mounted Plate spec R17; Chromium hand drive |
| A file dropped on a section's title | Lands at the top of the body when the dropping view shows it open, after the section when closed | Headless spec R20 |
| A read-only view closes a section holding its caret | The selection stays, and no native selection lands in the hidden body | Registry R25 |
| Undo after a restore | A restore adds no undo step | Headless Plite case in R1 |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Caret when a view comes back | Its own last caret, moved by edits made elsewhere (look) | The last caret placed in any view, as today | shared caret | big |
| What makes a view the caret's owner | Placing the caret in that view by a click, a key, a tab or code. Edits that only shift the caret, and code on the base editor or on a view no root keeps, never take it (look) | Only focus and clicks, so code that sets a caret through a view leaves the owner alone | owner by focus | big |
| A setting for a shared caret | No setting, because no view needs another view's caret (look) | The spec's shared or own setting on each view | caret setting | small |
| Showing a resting view's caret | Not shown; only the live caret paints, as Plite's paint rule says (look) | Paint each resting view's caret, which needs a doctrine change | paint resting caret | small |
| Details open state | Each view keeps its own (look) | One open state for every view, as today | shared open state | big |
| Where plugins keep per-view state | A Plate view store next to each plugin's store, which any plugin can declare (look) | A private store inside each feature, which a third-party plugin's commands could not read | feature stores | big |
| When a view-store change takes effect | At once, as plugin store changes do today, so a later read in the same update sees it (look) | Only when the whole update succeeds, which needs a new journal in Plite core | held view-store writes | small |
| Which roots share a caret | Each root an app renders keeps its own caret, whatever editor it is given. Editables in one Plite root, and content areas in one Plate root, share their root's caret (look) | A root given a view shares that view's caret | view shares caret | small |
| Content areas inside one Plate editor root | They share their root's view, as editables inside one Plite root do, so root chrome outside a content area keeps working (look) | Each content area is its own view with its own caret and open state | contents split | small |
| Open state when a view remounts | Remounting a content area keeps it. Remounting the whole root starts with sections closed, because open state lives as long as the root that shows it (look) | Keep each view's open state after the view goes away | keep open state | small |
| A restoring view's focus | The restore places once, because in Chromium the focus it causes keeps the restored caret (look) | Place again after focus settles, in case a browser moves the selection on focus | restore replay | detail |
| Views with no mounted root | Never hold the caret, so closing a section from headless code still moves a caret out of its body, as today (look) | A headless view holds the caret until it is disposed | headless owner | small |
| Typing in a view after another view's code took the caret | Types at the live caret and makes this view the owner, as today. When this view hides that caret, the caret first moves out as a restore moves it (look). The caret placement plan replaced this pick, so the view's own caret comes back first | Bring back this view's own caret first, then type | typing restores | detail |
| Opening a section from the base editor | Changes only the base editor's own state, which no view shows (look) | Opens it in every view | base opens all | small |
| A read-only view closing a section that holds its caret | The caret stays, because a read-only view's close never writes the selection (look) | Move the caret out through the base editor, as today | read-only moves caret | small |
| A Details inserted in one view | Open in that view, closed in the others (look) | Open in every view | open everywhere | detail |
| Focus that enters a view without a click | Brings back that view's own caret, as a chrome click does (look) | Takes the live caret, as today | keep focus adopting | small |
| A restored caret inside a section its view collapsed | Lands at the end of the section's title, and the section stays closed (look) | Reopens the section | reopen on restore | small |
| Suggestion's per-view store | Stays this run, because it works. Suggestion keeps its state per Editable, so a suggested task redesigns it on the view store (safe) | Move it in this run | move suggestion now | small |
| The link toolbar's open state, shared across views | A suggested task moves it to the view store, because it is a separate fix with its own proof (safe) | Fix it in this run | fix link now | small |
| Typing cost of resting carets | The timing gate runs on the shipped code at the Phase 1 exit and must pass before landing; a clear miss sends the design back to architect (look) | Accept on the anchor work counts alone | accept on counts | detail |
| Stress and pathological timing cohorts | 8 views over 500 blocks and 32 views over 125, 4,000 rendered blocks each, because at 2,000 blocks per view a garbage-collection pause of 35 to 80 ms lands inside random keystrokes and flips the median, and neither arm's typing work depends on blocks per view (look) | Keep 2,000 blocks per view | keep 2000 blocks | small |
| Timing estimator | Each arm's time for a cohort is the smallest median of five fresh processes, because one process ran up to 10% faster or 30% to 80% slower than another on the same code, and the minimum of five cut the 90th-percentile gap between same-code arms from 8%–32% to 4%–13%, chosen before any candidate run (look) | The median of three processes | median of three | small |
| How the work lands | One landing that carries the caret and the Details change (safe) | Two landings, one per phase | split landings | detail |
| The runtime page's link | https://claude.ai/artifact/ShFXKHw7H89pDkPnZTAc8f no longer opens, so the page now lives at https://claude.ai/artifact/6VCechKZD3ocNEf5zMY6TZ (look) | Drop the new page, if the old one was deleted on purpose | drop new page | detail |
| The find demo's hand drive | Each case checked once by hand in Chromium, plus five runs of the multi-editor and authored-changes tests. t_0bc74410 adds the section cases to the browser tests, which run five times in Chromium, Firefox and WebKit (look) | Check the caret and section cases by hand five times before landing | spec the drive | small |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Root selection cache | Per-provider clone of every commit's selection | Deleted | none | Records other views' carets and never maps | Internal; 4 callers of `getLastSelectionForRoot` | R1, chrome tests | low | cut |
| Caret owner | None | The presentation and root that placed the live selection last, moved by placements credited at the update or command that made them and by four mounted claims | Plite core `core/view-carets.ts`; claims in Plite React | Mapping, remote edits and base-editor writes never claim; a placement at the same spot still does | Internal | R3 to R6, R8, R11 | med | rearchitect |
| Placement credit | `selectionWritten`, set for mapped selections too | A placer named by each update and command entry, the read-only selection path included; the last placement through a view in a transaction wins; a placed mark set wherever a caller asks for a selection, from a census of every selection writer | Plite core `public-state.ts`, `command-registry.ts`, `editor-runtime-view.ts`; Plite React `runtime-mutation-state.ts` | A spec's selection cannot tell placing from mapping once built, and some transforms re-apply a mapped selection | Internal | R1, R3, R4, R6 | med | rearchitect |
| Projected input | The owner's raw transaction under a root scope | The shared root-transaction builder for the target's root, carrying the view's presentation | Plite React `mutation-controller.ts`; Plite core `plugin-dispatch.ts` | Paste, Enter and typing land in the target root and read the calling view's state | Internal | R13 | low | rearchitect |
| Parking time | None | Inside the commit after anchors publish and before listeners, from the live selection for a claim outside an update, and at a clear or a base placement into another root | Plite core | No anchor is ever built from an older document, and no root's only caret is overwritten | Internal | R5, R28, R31 | low | add |
| Parked caret | None | Per presentation and root: a range anchor, or node keys with anchor and focus keys plus a fallback point anchor | Plite core | One live selection; VS Code tracks a resting split's cursor the same way | Internal | R1, R2, R7 | med | add |
| Presentation lifetime | None | Retained by a public `EditorRoot` from its first insertion effect to its unmount | Plite React | Only mounted surfaces park; StrictMode and Activity keep them | Internal | R12 | low | add |
| Restore | Captured range applied twice | One placement after any pending render, moved out of a collapsed section, through the selection path a read-only view also uses, and skipped when a newer placement came while it waited | Plite React `view-caret-restore.ts` | A restore must not steal the caret or land in hidden content | Internal | R1, R8, R23 | med | rearchitect |
| Surface identity | Projected view-selection alias, set for any root nested with a `root` prop | `ViewState.presentation`; every public `EditorRoot` starts one, and a view from `withMountedPresentation` keeps its source's | Plite core and React | `docs/vision/plite.md` independent public roots; a configured view is an input to a mount, not a mounted view | Five Plite roots and Plate's `PlateRoot` pass the carrier, so Plate contents share their root's view; the alias map deleted; the authored-changes example and the editor-perf page | R9, R26, R27 | med | rearchitect |
| Mounted-view lookup | One active view per root across a provider | Root and presentation, for mounted views, content-root owners and the registered root-view fallback | Plite React | Root alone hands A's restore and A's navigation to B | `focusRoot`, `useCommand`, input routing, content-root navigation | R9, R29 | low | rearchitect |
| Keyboard focus | Adopts the live caret | Restores the parked caret, else adopts the live one | Plite React | Same defect as chrome restore | Internal | R10 | low | rearchitect |
| Routed root transaction | Fresh owner view cached by root | Fresh owner view carrying the caller's presentation, cached by presentation and root, shared with projected input | Plite core `plugin-dispatch.ts`, `editor-runtime-view.ts` | Per-view reads follow the dispatching view | The named-root plan's open timing gate measures the final dispatcher | R13, R19, R20 | low | rearchitect |
| Plugin view state | Each feature hand-rolls it, or shares it by accident | `initialViewState`, `viewStore`, `viewStoreOf`, `useViewStore`; writes take effect at once; subscribers per presentation; dropped when the presentation is released | Plate `internal/plugin/pluginStore.ts`, `lib/plugin`, `react/stores/plate` | `VISION.md` forbids editor-global state for a view-local choice; one way for every plugin | New public API; four docs pages; changeset; `api-reference.config.json`; `docs/vision/plate.md` | View-store spec and type test, R21, R22 | med | add |
| Details open state | `openKeys` in the shared plugin store, `isOpen` selector | `initialViewState.openKeys`, `api.isOpen`, command reads through `viewStoreOf` | Plate `BaseDetailsPlugin` | Per-view presentation | Hard cut listed above; six spec files; two docs pages | R13 to R19 | med | move |
| `setOpen` caret move | Picks a writable editor and moves the shared selection | Moves the live selection only when the calling editor is writable and holds it, or no view holds it, reading the active transaction inside an update | Plate `BaseDetailsPlugin` | A collapse touches only its own view's caret, and a read-only view borrows no write authority | `details.mdx`; the read-only close spec | R17, R18, R25 | low | rearchitect |
| Upload caret anchor | A caret view built from the base editor | The drop routes `submit` to the caret's root with the dropping view's presentation, and `submit` finds the anchor there | Plate `BaseUploadPlugin` | A drop must read the dropping view's open state | Deletes the handler's own caret view | R20 | low | cut |
| Registry Details and TOC | Shared plugin store | `useViewStore` selector and `api.isOpen` | Copied UI | Per-view presentation | Registry changelog; generated registry output | R22, R24 | low | move |
| Suggestion active id | Private per-view store bound to its provider | Unchanged this run | Plate React suggestion | Works today; one-way cleanup needs its own proof | None | Missing: a move with its suggestion specs; next owner: suggested task | low | defer |
| Link floating state | Shared store keyed by `editor.id`, which views inherit | Unchanged this run | Registry `link.tsx` | A separate fix with its own two-view proof | None | Missing: a two-view link case; next owner: suggested task | low | defer |
| Find query and matches | Shared store | Unchanged | `BaseFindPlugin` | `docs/vision/plate.md` says Find's query is shared | None | Existing Find specs | none | keep |
| Painting a resting caret | None | None | Plite paint rule | `docs/vision/plite.md` inactive paint | None | R1 asserts no extra paint source | none | keep |
| `selection: 'shared' \| 'own'` | Proposed in the spec | Not added | none | No view wants another view's caret | None | None | none | cut |
| Cost of parking | One selection clone per provider per commit | An owner comparison per commit; anchor mapping only for resting carets | Plite core | Runs on every keystroke | None | Work-count test; paired timing at the Phase 1 exit | med | gate |

## Steps

The Build playbook runs these steps. Every step that edits code runs the writing passes before its review. Each step writes one red case, makes it pass, then takes the next. The build runs on suggested task t_01e4e980 under Autopilot, with `trunk` delivery. Delegates write the code, and the lead reviews and proves each diff. The first core step runs as two units: presentation identity first, then the caret owner beside the Plate view store.

### Before the build

- [x] Run the base controls in a detached worktree at `a28e4ee`: the caret test R1 and the Details test R13 fail for the reported reason. Proof: `proof-worktree.mjs` logs with `--expect-fail`, `base-r1-caret-a1.log` and `base-r7-details-a1.log` in the run directory.

### Phase 1: each view keeps its own caret

- [x] Add the presentation and caret owner in Plite core. First write the census of every selection writer, each classed as a placement or a re-application, to the run directory, and land `retainViewPresentation` and `withMountedPresentation` with no behavior, so each core case goes red for its behavior and not for a missing import. Then add `core/view-presentation.ts` with a base presentation per owner, `ViewState.presentation`, `createEditorView(view)` sharing its source's and `createEditorView(base)` making a new one, and the carrier. Add `core/view-carets.ts` with the owner pair, the placer that each update and command entry puts on its transaction, the last placement through a view winning, the placed mark at the census's placement sites and across a frame's commit, the placement generation, settling inside the commit's anchor initialization and on the no-change branch, parking on a clear and on a base placement into another root, claims and parked carets. Proof: `packages/plitejs/test/core/view-carets.test.ts` runs R2 to R7, R11 and R31 on views it retains and releases, plus one case where views no root retains never take the caret; `pnpm --filter plitejs test:partition:core` passes.
- [x] Wire Plite React and Plate's root: every public `EditorRoot` starts a presentation and retains it from its insertion effect, and releases its carets and view stores at unmount; the five Plite roots and Plate's `PlateRoot` pass `withMountedPresentation`; `getView`, `useRootEditor` and `useRootState` build from the owner with the surface's presentation; mounted-view lookup, the content-root owner registries and the root-view fallback key on presentation; the restore ticket placing through `writeRuntimeSelection`, with its generation check, the focus side-effect rule, the collapsed-section clamp and the authored fallback; focus restore; the claims at their named sites, the typing claim's clamp included; the read-only selection path naming its presentation. Delete `root-selection-cache.ts`, `getLastSelectionForRoot`, `setPliteViewSelectionStoreKey` and `forceSelection`, and rewrite `view-selection-contract.test.ts`, which imports `setPliteViewSelectionStoreKey`. Proof: `packages/plitejs/test/react/view-carets.test.tsx` runs R1, R8 to R12 and R26 to R30, and a `platejs/react` spec runs R26's Plate cases; `use-plite-root-chrome.test.tsx` and `editor-root-lifetime.test.tsx` stay green; `pnpm --filter plitejs test:partition:react` and `test:partition:pagination` pass, and so does the `platejs` partition that holds `src/react`.
- [x] Add a work-count test: 20 keystrokes in the view that holds the caret make no owner change and create no anchor; anchor visits are 0 with every resting caret outside the typed block, and 2 per resting caret inside it, across 2, 8 and 32 views. Proof: the test fails when parking runs on every write, and passes on the shipped code.
- [ ] Build the timing harness in the run directory: it takes a source tree, mounts N sibling `EditorRoot`s with real Editables from that tree, places each view's caret through its own `useRootEditor`, and times one view's dispatched `insertText`, the command a `beforeinput` runs, plus the React flush. It fails when a loaded module path is outside its tree. Proof: a run on a planted 15% slowdown fails with the probe's own assertion text.
- [ ] Phase 1 exit: run the frozen paired-timing contract on the shipped code, base arm from a `proof-worktree.mjs` worktree at `a28e4ee`, candidate from this tree, plus a same-code arm and a planted arm. Cohorts normal, large, stress and pathological (2, 2, 8 and 32 views over 100, 2000, 500 and 125 blocks, the pathological cohort with all 31 resting carets in the typed block), median microseconds per update at most 1.05 of base, load limit 9. If the profile puts a miss in `anchor-state.ts`'s per-commit preparation with no anchor visited, skip that preparation when no anchor's node changed and rerun once. Proof: `paired-timing.mjs` passes on every cohort. An inconclusive run on a loaded host keeps the gate open and blocks landing; a conclusive miss sends the design back to architect.

### Phase 2: each view keeps its own Details open state

- [x] Add the Plate view store: `initialViewState` on plugin definitions, `viewStore` on portals and the API factory context, `viewStoreOf(state | tx)` in the `.extend` context, `useViewStore` in `platejs/react`, view stores beside plugin stores in one owner entry with subscribers per presentation, reconfiguration clearing both, and a released presentation dropping its stores. Proof: a view-store spec covers two views, the base editor, a later read in the same update, an update that changes only view state, reconfiguration, a content remount that keeps its state and a release that returns the store count to its start; a type test shows the `.extend` context has no bare `viewStore` and `viewStoreOf` refuses an editor; `pnpm --filter platejs test:partition:core` and `typecheck:partition:core` pass.
- [x] Move Details open state to the view store: `initialViewState.openKeys`, `api.isOpen`, every command and the insertion anchor reading `viewStoreOf`, insert and wrap opening the new section in the inserting view, and `setOpen` moving the live caret only when the calling editor is writable and holds it, or no view holds it, reading the active transaction inside an update. Migrate the six spec files, check the five more that call `setOpen` (`BaseDetailsLanding.spec.ts`, `AIChatPlugin.details.spec.ts`, `DetailsPlugin.spec.tsx`, `UploadPlugin.spec.ts` and the registry `slash.spec.tsx`), and change the read-only close case's expectation. Proof: `BaseDetailsViews.spec.ts` runs R13's headless cases, R14 to R16 and R21, and `BaseDetailsViews.mounted.spec.tsx` runs R17 and R18 on mounted roots; `pnpm --filter platejs test:partition:details` and `typecheck:partition:details` pass.
- [x] Named-root dispatch and projected paste, Enter and typing share one root-transaction builder that carries the caller's presentation, cached by presentation and root. Add a line to the named-root plan's open timing gate saying its routed cohort measures this dispatcher, and change its step 1.1 to say the cache keys on presentation and root. Proof: R19 in `BaseDetailsViews.spec.ts` and R13's mounted cases in `BaseDetailsViews.mounted.spec.tsx`; `plugin-dispatch.test.ts` and `projected-command-contract.test.ts` stay green.
- [x] Route Upload's drop to the caret's root with the dropping view's presentation, find the anchor inside `submit`, and widen the insertion anchor's state type so a contribution can read view state. Proof: R20 in `BaseDetailsViews.spec.ts`; the upload specs stay green.
- [x] Move the registry `details.tsx` to `useViewStore` and `toc.tsx` to `api.isOpen`, rebuild the registry and amend the unreleased changelog entries. Proof: `details.spec.tsx` renders two real views for R22, R23 and R25; `toc.navigation.spec.tsx` renders real views for R24, because `toc.spec.tsx` mocks all of `platejs/react`; `pnpm --filter www build:registry` writes the generated output.
- [x] Run `plate-docs` on `content/docs/(plugins)/(elements)/details.mdx` and its Chinese twin: the open-state section, the store example and the base-editor note. Proof: the `plate-docs` checks and a preview of the page.
- [x] Run `plate-docs` on `content/docs/(guides)/plugin-context.mdx` and its Chinese twin: `viewStore` and `viewStoreOf`. Proof: the `plate-docs` checks and a preview of the page.
- [x] Run `plate-docs` on `content/docs/api/core/plate-plugin.mdx` and its Chinese twin: `initialViewState`. Proof: the `plate-docs` checks and a preview of the page.
- [x] Run `plate-docs` on `content/docs/api/core.mdx` and its Chinese twin: `useViewStore`. Proof: the `plate-docs` checks and a preview of the page.
- [x] Amend `docs/vision/plate.md`'s plugin-store sentences (near lines 221, 722 and 745) to name view stores as view-owned and to say the `EditorContent`s of one `EditorRoot` share its caret and view state, and `docs/vision/plite.md`'s nested-root sentence to say every public `EditorRoot` starts its own presentation, which the Editables inside it share. Replace `BaseDetailsPluginState` in `api-reference.config.json` and regenerate its manifest. Run `best-api repair` on the view store. Proof: `best-api repair` names no artifact still teaching the shared `openKeys` store.
- [x] Write the changesets for `plitejs` and `platejs` with the `changeset` skill. Proof: the `changeset` skill's check passes.

### Close

- [ ] Hand drive the find demo in Chromium: two views, caret restore after the other view's edits by Tab and by typing, a toggle collapsed in one view only with Enter at its summary in each view, and a caret restored into a section its view collapsed. Run the authored-changes example's browser suite and the multi-editor browser suite (`apps/www/tests/browser/multi-editor.spec.ts`). Proof: `hand-drive.mjs check` passes and the screenshots of each cell are read; the caret and toggle cases pass five warm runs.
- [ ] Rerun the affected partitions and land through `land.mjs` with `pnpm check --affected`. Proof: the landing log.

## Performance gates

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Performance pack selected | yes | Parking adds an owner comparison per commit and anchors for resting carets on every keystroke; view stores add subscriptions per Details block. |
| User-facing operation and runtime owner identified | yes | A keystroke in one view of a many-view page. Today each provider's cache record in `use-plite-runtime.tsx` runs on it; after, the owner comparison and anchor mapping in Plite core do. |
| Scale variables and cohorts fixed | yes | Mounted views 2, 2, 8 and 32 over 100, 2000, 500 and 125 blocks; the pathological cohort puts all 31 resting carets in the typed block. Stress and pathological were 2000 blocks per view until the harness showed garbage-collection pauses flipping their medians, before any candidate run (Defaults: keep 2000 blocks). |
| Budget frozen before target measurement | yes | Median microseconds per update, candidate over base at most 1.05 per cohort, load limit 9, frozen in `probes/scale/paired.config.json` before any run. |
| Baseline and target probe selected | yes | The Phase 1 harness runs real `EditorRoot`s from each arm's own tree and times a dispatched `insertText`. The round-1 prototype `probes/scale/park.bench.ts` timed a stand-in and no longer counts as evidence. |
| Correctness guard selected | yes | After the timed keystrokes, the typed text lands in both arms and each candidate view's chrome restores its own mapped caret. |
| Production detector decision recorded | N/A | No production detector covers editor keystrokes; the work-count test in `pnpm check` guards the work. |

- [ ] Performance pack: inspect query/render/subscription fan-out, result cardinality, pagination, repeated reads, and retained work before adding infrastructure.
- [ ] Performance pack: optimize the measured owner; do not add pooling, caches, indexes, projections, stores, or schedulers without evidence that they own the work.
- [ ] Performance pack: add or extend a deterministic regression harness when the changed path lacked one.
- [ ] Performance pack: record every budget override with baseline, owner, reason, and expiry; permanent unexplained exceptions are forbidden.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Pre-acceptance scale proof | gate | Paired timing of the shipped parking code against `a28e4ee` at the Phase 1 exit | The round-1 prototype timed a stand-in from one checkout on a host at load 21.18, so it is inconclusive and does not count. Its work counts hold for the target: no anchor visit per keystroke with resting carets outside the typed block, 62 with 31 inside it. |
| Warm latency budget | pending | The Phase 1 exit run | pending |
| Large/stress scaling | pending | The same run's large, stress and pathological cohorts | pending |
| Cold and failure paths | N/A | Mounting creates no anchor until another view takes the caret, and an unmounted view releases its anchors | R12 covers release |
| Payload and fan-out | pending | A Details toggle re-renders only the toggled block in the toggling view and runs no open-state selector in another view | R22 counts renders and selector runs |
| Production-path rerun | pending | The Phase 1 exit run | pending |
| Correctness guard | pending | R1 to R12 on the shipped code | pending |
| Before/after receipt | pending | Base and shipped paired-timing logs | pending |
| Detector and privacy | N/A | No production detector covers editor keystrokes | none |
| Performance regression check | pending | The work-count test in `pnpm check` | pending |
| Slice review | skip | skip: the `api-build` row owes a panel on the diff, and every seat applies both review lenses | none |
| Check steps | pending | The `pnpm check <step>` steps the edits reach, before the acceptance runs | pending |
| Type-aware lint | pending | `oxlint --type-aware` on the task's files before the diff panel | pending |
| Diff panel | pending | The `api-build` panel on the diff before landing | pending |
| Docs | pending | `plate-docs` on the four pages and their Chinese twins | pending |
| Public API repair | pending | `best-api repair` on the view store | pending |
| Changesets | pending | `plitejs` and `platejs` through the `changeset` skill | pending |
| Hand drive | pending | `hand-drive.mjs check` after the last page edit | pending |
| Playtest | pending | `playtest.mjs scope` on the plan's files, then its spec runner on each feature it names | pending |
| Feature check | pending | `check-plate-feature.mjs` on this plan | pending |

## Layer gates

| Gate | Answer |
| --- | --- |
| Plite React input | Focus without a click now restores the view's caret, and typing in a non-owning Editable claims the caret. Typing first moves a caret its view hides, even in the view that holds it. A restore places once. A mouse press ends wherever it is released. A read-only view's selection import and restore name its presentation. `EditorRoot` retains its presentation for its lifetime. |
| Plate proxy | Plate's internal `PlateRoot` passes `withMountedPresentation` built from the model editor and its Plate root's view, so the contents of one Plate root share its presentation; `useEditor()` still returns the selected content's view. |
| Copied-UI policy owner | Registry `details.tsx` owns the toggle and its content boundary; `toc.tsx` owns the reveal on a heading jump. |
| Deleted surfaces | `openKeys` in the plugin store, the `isOpen` selector, `BaseDetailsPluginState`, `setOpen`'s cross-view caret move and its writable fallback, Upload's own caret view, `root-selection-cache.ts`, `getLastSelectionForRoot`, `setPliteViewSelectionStoreKey` and `forceSelection`. |
| Multi-view proof | R1 to R31, the authored-changes and multi-editor browser suites and the Chromium hand drive of the find demo. |
| Native-selection non-interference | R17 and the hand drive: collapsing in one view leaves the other view's native selection, focus and scroll. |
| Three realistic failures | A new package root passes a plain view instead of `withMountedPresentation`, so R26 checks each package root by behavior. A remote edit applied through a view takes the owner, so R11 checks the Yjs path. Many resting carets in one block slow typing, so the Phase 1 timing gate must pass before landing. |
| Blast radius | Four internal callers of `getLastSelectionForRoot`, three of `setPliteViewSelectionStoreKey`, five Plite roots and Plate's `PlateRoot`, the content-root registries and their fallback, projected paste, Enter and typing, the read-only selection path, the authored-changes example and the editor-perf page's nested root, one root-transaction builder, the command and update entries that name a placer, and the views of views that AI and static rendering build, which keep their source's presentation; for Details, two registry files, two docs pages, six spec files to migrate and five more that call `setOpen`, Upload's drop handler and the generated registry output. A Codex census in the run directory lists every site, and a probe proved a Plate editor is its own Plite owner (`probes/blast/owner-a4.log`). |
| Rollback | Phase 1 is internal and reverts cleanly. Phase 2's store cut is ruled by `VISION.md`; reverting it brings back the shared set. |

## Feature delivery

Flow mode:

- existing package plus React/registry

Feature Manifest:
| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- |
| API | yes | `best-api` | `initialViewState`, `viewStore`, `viewStoreOf`, `useViewStore` and `api.isOpen`; the `openKeys` plugin store and `isOpen` selector deleted | Plugin authors and app code | `best-api repair` on the view store and the view-store type test | pending |
| Package | yes | `plate-plugins` | `packages/plitejs/src/core`, `packages/platejs/src/internal/plugin`, `packages/platejs/src/lib/plugin`, `packages/platejs/src/features/details` and `packages/platejs/src/features/upload` | Plate and Plite consumers | The core, details and upload partition tests and typechecks | pending |
| React adapter | yes | `plate-plugins` | `useViewStore` in `packages/platejs/src/react/stores/plate`, `PlateRoot.internal.tsx` and Plite's `react/components/plite.tsx` | React apps | The `platejs` and `plitejs` react partitions with R1, R8 to R12 and R26 to R30 | pending |
| Registry UI | yes | `plate-ui` | `apps/www/src/registry/components/editor/details.tsx` and `toc.tsx` | Registry installers | `details.spec.tsx` for R22, R23 and R25, and `toc.spec.tsx` for R24 | pending |
| Composition | yes | `plate-ui` | The find demo's two views of one editor, `apps/www/src/registry/examples/find-demo.tsx` | Registry installers | The Chromium hand drive of the find demo | pending |
| Scale proof | yes | benchmark | `probes/scale/paired.config.json`, the Phase 1 timing harness and its base and shipped logs | users/maintainers | The Phase 1 exit paired timing, rerun on the final production path | pending |
| Registry metadata/examples | yes | `plate-ui` | Generated `apps/www/public/r` and `apps/www/src/__registry__`, and the registry changelog | Registry installers | `pnpm --filter www build:registry` | pending |
| Docs | yes | `plate-docs` | `details.mdx`, `plugin-context.mdx`, `plate-plugin.mdx` and `api/core.mdx`, each with its Chinese twin | Docs readers | The `plate-docs` checks and a preview of each page | pending |
| Release artifacts | yes | `changeset` | `.changeset` entries for `plitejs` and `platejs` | Package consumers | The `changeset` skill's check | pending |

Package boundary contract:
| Contract | Decision | Evidence |
| --- | --- | --- |
| shared Plate host | N/A: no package manifest changes | N/A: no `package.json` edits |
| Plite ownership | `platejs` reads presentations and the caret owner through `plitejs/internal`, which it already imports | An import audit of the diff |
| external dependency ownership | N/A: no new dependency | N/A: no `package.json` edits |
| entrypoint runtime | `plitejs/internal` stays headless, and `useViewStore` lives in `platejs/react` | The entrypoint runtime matrix in `pnpm check` |
| Oxlint coverage | N/A: every new file sits under globs the current overrides cover | Scoped lint on the task's files |

## Red cases

Plite, in `packages/plitejs/test/react/view-carets.test.tsx`. The core cases in `packages/plitejs/test/core/view-carets.test.ts` retain their views through the carrier `EditorRoot` uses, and release them:

- R1. Two sibling `EditorRoot`s: A places its caret, B places its own, B inserts text above both, A's chrome reactivates. A gets its own caret back, shifted by the insert, and the restore adds no undo step. At base A gets B's caret (`base-r1-caret-a1.log`). Again with B read-only, where B takes the caret by a click: A's chrome restores A's own caret, and when A then takes the caret back, B's chrome restores B's caret through the read-only selection path.
- R2. B deletes the paragraph holding A's caret. A restores to the nearest point without throwing. In Plite core, a parked caret inside text an authored projection hides resolves to the nearest visible point. No mounted view reaches that case, because a preview view reads no selection and an intent view hides no text.
- R3. A holds at 1, B at 8. A runs a command that inserts at an explicit spot before both. B keeps the live caret at 9, and A's chrome restores 2. The same holds when the command continues through `next.after`, when A is an authored view, and when the command places through a routed call into the `note` root. A `nodes.remove` with no `at`, and a `lift` and an `unwrap` with an explicit `at`, run through A while B holds the caret, leave B the owner.
- R4. A places its caret exactly where B's live caret sits, which commits nothing, then B places elsewhere. A's chrome restores A's spot. A placement in an update that throws, and one in a discarded command probe, leave the owner alone. A `nodes.replace` with `select: true` and a `value.replace` with an explicit selection make A the owner when run through A, and leave the owner alone when run through the base editor.
- R5. A plugin commit listener answers B's placement by inserting text above A's caret. A's chrome restores A's caret shifted by that insert.
- R6. A's update commits, and its commit callback sets the selection through the base editor. The owner does not become A. A throwaway view that no root retains sets the selection, and the owner stays. A base update that wraps A's update, where A places, makes A the owner. In one update, A places and then B's `select` command places, and B becomes the owner.
- R7. A holds a backward block selection. B clicks, and A's chrome restores both ends, so Shift with an arrow key extends from A's focus.
- R8. A's focus restore waits for a pending render, and a placement lands in the same tick. After the render, the caret is still at that placement. A `useCommand(…, { focus: 'restore-root' })` command that places after A's restore keeps its placement, and so do a placement through A's editor and one through the base editor. Typing after a chrome restore, with focus moved away and back, lands at the restored caret.
- R9. Two `EditorRoot`s nested in one outer `EditorRoot` run R1, once given the editor and once given `useEditorContext()`, on the main root and with `root="note"`. Each restores its own caret. One configured view mounted by two roots, as `editor-root-lifetime.test.tsx` mounts it, gives two views with their own carets.
- R10. A holds at 1, B at 8. Focusing A's Editable without a click restores 1. It still does after a press in A's Editable that was released outside it.
- R11. A remote edit applied through the Yjs binding leaves the owner unchanged. Undo run through B, while A holds the caret, makes B the owner.
- R12. B unmounts while holding the caret. The owner clears, the anchor count returns to its starting value, and A restores its own caret. Under StrictMode, and after an Activity hide and show, A's resting caret survives. Giving an `EditorRoot` another editor releases the old editor's resting carets.
- R26. Each root Plite mounts for itself keeps its surface's presentation: an Editable, a `VirtualizedEditable`, a windowed Editable and a `PagedEditable`, each rendered with `root=` and chrome outside the content, and an element-owned content root. Under each, a chrome restore brings back that surface's own caret. In a `platejs/react` spec: two Plate `EditorRoot`s on one editor keep separate carets; inside one Plate `EditorRoot`, `useRootChrome('header')` on a section around the header's `EditorContent`, as the roots guide teaches, restores the header content's caret and focuses it; a toolbar placement through `useRootEditor(activeRoot)` makes that root's content the owner; and remounting an `EditorContent` keeps its open sections.
- R27. The existing chrome test with header and main Editables under one `EditorRoot`: the caret moves from the header at 3 to main, and the header's chrome restores 3.
- R28. A holds its caret at 4, and the selection clears, once by Escape and once by an outside press in a read-only view. A's chrome restores 4.
- R29. Two views each render the same element-owned content root. Arrow-key navigation into it from A lands in A's copy, and history focus stays in A. The same holds when the keyed lookups miss and navigation takes the registered root-view fallback.
- R30. The echo of Plite's DOM export in a surface that does not hold the caret leaves the owner alone. B types while A's code holds the caret, so the text lands at the live caret and B becomes the owner. When B shows a section closed that A shows open and A's code places the caret in its body, B's next keystroke first moves the caret to the end of the section's title, so no text lands in the hidden body.
- R31. A holds `header` at 3, and the base editor places the caret at 8 in `note`. No view owns the caret, and A's chrome restores `header` at 3. When B then places in `note`, A's header caret survives. When the base editor clears the caret A holds and then places it at 6 with no owner, A's focus restores 6 and typing lands there.

Plate, in `packages/platejs/src/features/details/lib/BaseDetailsViews.spec.ts`, with R17 and R18 in `BaseDetailsViews.mounted.spec.tsx` on mounted roots:

- R13. Views a and b; a opens a section. Enter at the end of its summary through b inserts a block after the section; through a it enters the body. At base b enters the body (`base-r7-details-a1.log`, named when this case was R7). In `BaseDetailsViews.mounted.spec.tsx`, projected paste, Enter and typing whose insertion point sits in another root land in that root and follow the calling view's open state, in a writable view and in an authored view.
- R14. Backspace at the start of the block after the section lands at the summary end through the view where it is closed, and merges into the body through the view where it is open.
- R15. Forward Delete at the summary end skips the body in the view where the section is closed.
- R16. `setOpen` then a command on the base editor, and `setOpen` then a command on one view, each act on that editor's own open state.
- R17. b holds the selection inside the body and a closes the section. b's selection stays.
- R18. a holds the selection and closes the section. The selection moves to the summary end. With no view holding it, the base editor's close moves it too. Inside b's own update, b places its caret in the body and closes the section, and the caret ends at the summary end. In the headless spec, where no root retains a view, a's close moves a caret out of the body, as today. When b's close runs inside a's update while b holds the caret in the body, the caret moves to the summary end, b stays the owner, and a's focus restores a's own caret.
- R19. A section inserted in the `note` root through view v is open in v and closed for the base editor, and the insertion anchor at its title reads v's state.
- R20. A file dropped at the title of a section open in v lands at the top of its body; dropped through a view where it is closed, it lands after the section. Both hold in the main root and in the `note` root, and when v's editor sits in main while the caret sits in `note`.
- R21. In one update through a: opening a section and reading it back sees it open; inserting a section and then inserting again from its title lands inside it; a commit listener that closes a just-inserted section wins. Reconfiguring the plugin is not a case, because Plate refuses to reconfigure plugins after its model publishes. A discarded command probe that closes an open section leaves it closed, as the plan accepts.

Registry:

- R22. `details.spec.tsx` renders two views; collapsing in A leaves B's `aria-expanded` true, re-renders only A's block and runs no open-state selector in B.
- R23. `details.spec.tsx`: A's resting caret sits in a section's body, A collapses that section, and A's chrome restore lands at the end of the summary with a non-empty native selection.
- R24. `toc.spec.tsx` with real views: a heading jump in A opens the section only in A.
- R25. `details.spec.tsx`: a read-only view takes the caret in a section's body by a click and closes the section. The selection stays, and no native selection lands in the hidden body. When writable A closes the section instead, the read-only view's selection stays too.
## Design

Three `architect` runners sketched a design in each of two rounds, Opus 5.5, gpt-6-astra and gpt-6.1-sol, all at xhigh, and an Opus cross-judge scored each round's label-hidden candidates.

**Round 1** settled the data model: one live selection, carets kept per root as anchors, and per-view open state in one Plate view store. The judge scored the Opus candidate 21, the Astra candidate 21 and the Sol candidate 20, and picked the Opus candidate as the base. The panel on the resulting plan then found that its mechanism failed, as the Challenge delta says.

**Round 2** redesigned the mechanism with the panel's findings as hard constraints. All three candidates picked explicit placement as the signal for who owns the caret, parking in core before any listener, and a restore that moves a caret out of a collapsed section. All three rejected ownership by focus alone and keeping the owner's caret anchored at all times.

The round-2 judge scored the Astra candidate 25, the Sol candidate 25 and the Opus candidate 19, and picked the Astra candidate as the base because it needs the fewest cuts. It ruled the three forks the same way the lead had. A read takes view state from the state or transaction it is given, a placement through the base editor never takes the caret, and view-store writes take effect at once. The lead had first picked the Opus candidate. The Opus candidate lost its points on an ambient acting view, a budget change, parked carets that an Activity hide drops and a `useRootState` read that would see an empty view store, all pieces the lead had already cut or replaced. The lead also runs on the same model as that candidate, so the plan takes the judge's base.

The Astra base has literal reads, a placer carried on the transaction and its spec, block selections kept as node keys plus a fallback point anchor, parking through the commit's single anchor initialization, and a view-store reader for state with a writer for transactions.

Grafts into the Astra base:

- From Opus: view-store writes take effect at once, with no journal.
- From Opus: a placement through the base editor never takes the caret, and when no view holds the caret, the calling editor acts.
- From Opus: the restore ticket. The Astra candidate's replay only exports the live selection and rejects focus echoes, so it must recognize each focus-induced import in each browser. The ticket instead places the anchor's position again after whatever import the browser made.
- From Opus: the list of package root sites, `virtualized.tsx:125` included, and Upload's fix as a deletion.
- From Sol: a surface is retained from its `EditorRoot`'s insertion effect to its unmount, so StrictMode and Activity keep its resting carets (`probes/premises/lifetime-a1.log`).
- From Sol: `createEditorView(view)` keeps its source's surface, as `BaseListPlugin`'s projections need, and `useRootState` takes the nearest surface's presentation.
- From Sol: focus retries check the restore ticket, a restore waits for a pending coverage publication, and the read-only close expectation in `BaseDetailsPlugin.spec.ts` changes.
- From Sol: its guard list, added to R4, R6, R8, R11, R12 and R20.
- From all three: a pre-registered repair of `anchor-state.ts`'s per-commit preparation, used only if the harness pins a miss there.

The lead's additions, which no candidate had:

- Plate's internal `PlateRoot` renders a public `EditorRoot` for every `EditorContent`, and passes a view from `withMountedPresentation` so the contents of one Plate root share that root's presentation.
- The authored-changes example nests a public root given the editor with `root=`, so its named-root sample becomes two independent views, and its browser suite runs at close.
- A placement by a view that no root retains never takes the caret, for the same reason a base placement does not. The judge found that no candidate covered this.

Rejected:

- Astra and Sol's journal for view-store writes, which publishes only when an update succeeds and isolates discarded command probes. Plugin stores already write at once, keys from a discarded draft are never handed out again (`probes/premises/key-reuse-a1-a1.log`), and the journal adds spec and rebase machinery for cases that need a thrown update or a discarded probe. The Defaults row "held view-store writes" reverses it.
- Astra and Sol's base claim, where a caret placed through the base editor makes the base editor the owner. In a one-view app, toolbar code on the base editor would then park the view's caret, and a later Tab would bring back the old caret. Base-editor writes leave the owner alone.
- Opus's ambient acting view for reads, which stays set while listeners run, so a base read in a listener would see the acting view.
- Opus's linear budget for the pathological cohort. The 1.05 budget was frozen before any target run, and a budget does not change after seeing a result.
- Sol's shared anchor captures and its ordered transition list, which the round-1 failures do not need. The pathological cohort parks every caret at one spot, so capture sharing would pass that gate without scaling.
- A private projected-root component for the package roots, which the judge's base had. Exporting it to Plate would put React code in `plitejs/internal`, a headless entry. The headless `withMountedPresentation` carrier gives the same sharing with no React in that entry.
- An `EditorRoot` that keeps the presentation of any view it is given, which round 2 picked. A configured view is an input to a mount, and a test already mounts one in two roots, so both would share a caret. The Defaults row "view shares caret" reverses it.
- A source scan that fails when a package renders an `EditorRoot`, which the judge suggested. A scan would have to judge each `editor=` expression; R26 checks every package root by behavior instead.
- Each Plate `EditorContent` as its own view, which round 2 picked. It broke the root chrome Plate's roots guide teaches, reset open state whenever a content remounted, and credited placements to a view with no surface. Two visible copies of one root in one Plate root now share a caret, as two Editables of one root in one Plite root do. The Defaults row "contents split" reverses it.
- Keying routed transactions by the originating runtime. The routed view is built from the owner, so the caller's read-only and authored policy never enter it; presentation and root is enough for per-view reads.
- Moving Link's and Suggestion's per-view state in this run. Both stay suggested tasks, as the Defaults say.

## Challenge delta

**Round 1: improved.** The panel ran on the round-1 plan with three seats, Opus 5.5, gpt-6-astra and gpt-6.1-sol at xhigh, and every critical finding the lead checked held in source.

- Deleted: crediting the caret to a view through the transaction's `selectionWritten` flag and the update view, which a command's mapped selection, a nested base update and a placement at the same spot all fooled; parking from an ordinary commit listener, which anchored stale positions when a plugin listener committed first; and holding view-store writes until `afterCommit`, which dropped updates with no document change and hid writes from later reads.
- Moved: parking into Plite core, inside the commit; ownership to explicit placements and four mounted claims; the projected root out of every public `EditorRoot`; Upload's caret anchor into `submit`.
- Added: a restore ticket whose replay cannot steal the caret, a clamp out of collapsed sections, focus restore, node-key block bookmarks, and a timing harness that runs real code from each tree.
- Re-scored against the incumbent, today's cache and shared set, the synthesis still wins: the incumbent fails R1, R13 and the nested-root law, and costs one selection clone per provider per commit.

**Round 2: improved.** The panel ran on the round-2 plan with the same three seats. Each critical finding the lead checked held in source.

- Deleted: the private projected-root component and its export through `plitejs/internal`. An `EditorRoot` now takes its presentation from the editor it is given, and all five Plite roots, `PagedEditable`'s included, already pass their surface's view. Each Plate `EditorContent` is its own view, so Plate's `PlateRoot` needs no change, and Plite's root hooks in Plate chrome outside the content become a listed cut.
- Moved: R17 and R18 into a mounted Plate spec, because a view no root retains never holds the caret.
- Added: a placement generation that stops a replay after any newer placement; a read-only selection path that names its view; content-root registries and projected paste and Enter keyed by presentation; a `setOpen` that reads the active transaction; the owner as a presentation and root pair; a clear that parks; the placed mark set where code places a selection.
- Kept: one live selection, explicit placement, parking inside the commit and immediate view-store writes.

**Round 3: improved.** The panel ran on the round-2 plan with the same three seats, and each critical finding the lead checked held in source.

- Deleted: the rule that a root given a view keeps that view's caret, which let a configured view mounted twice share one; each Plate `EditorContent` as its own view, with the cut of Plite's root hooks in Plate chrome it needed; the first placer winning a joined transaction.
- Moved: projected paste, Enter and typing onto the routed root transaction; the contents of one Plate root back under that root's presentation.
- Added: the headless `withMountedPresentation` carrier, a census of selection writers, parking at a base placement into another root, a focus side-effect rule for the restore's second try, a typing clamp for hidden carets, Upload routing to the caret's root, read-only restore through the selection path, and view-store subscribers and release per presentation.
- Kept: one live selection, explicit placement, parking inside the commit and immediate view-store writes.

Round 3 was the last round the panel cap allows, so the build starts from this plan.

## Evidence

Model: claude-opus-5-5 @xhigh.

- 2026-10-04-runtime-audit: this review reopens it, because its Stop did not see a caret and Details open state kept once per editor while two views show one document; its one runtime per document with per-view interaction state still holds.
- 2026-10-17-named-root-targeting: this review retains it, because its dispatcher stays; a routed command now carries the presentation of the view that started it, so per-view state follows that view.

### Requirements

- One live selection per document, with no parallel selection state ([Plite vision](../vision/plite.md), the selection model).
- Inactive paint shows only the live selection and creates no second selection state ([Plite vision](../vision/plite.md), inactive canonical-selection paint).
- Each public `EditorRoot` owns an independent mounted view ([Plite vision](../vision/plite.md), roots and views).
- Mounted-view presentation has its own owner, and no editor-global plugin state carries a view-local presentation choice (`VISION.md`, canonical state and mounted-view presentation).
- Schema, plugin stores and history stay model-owned across views; only view presentation moves ([Plate vision](../vision/plate.md), view ownership).
- An API factory binds the exact view that exposes it, and a base editor never selects another mounted view ([Plate vision](../vision/plate.md), API factories).
- Chrome reactivation restores the root's previous caret (`packages/plitejs/test/react/use-plite-root-chrome.test.tsx`, "restores a root's previous selection when chrome reactivates it").
- A restored caret stays valid after edits made elsewhere (t_f7956c53).

### Lanes

- **Each mounted view keeps its own caret and its own Details open state in a Plate view store (picked).** It deletes the per-root cache and `setOpen`'s cross-view caret move, keeps one live selection, and puts each fact with the view that shows it.
- **Each feature keeps a private per-view store.** It adds no generic API, but a third-party plugin's commands cannot read per-view state it keeps in React, and each feature repeats the store, its subscriptions and its view lookup.
- **Delete the restore entirely (the strongest deletion).** Reactivation would keep the live selection. It loses the tested chrome restore for header and main Editables under one `EditorRoot`, where the live selection has moved to another root, so it loses.
- **Keep today's cache and shared open state.** It keeps both defects: a view restores another view's caret at a range that never followed edits, and a toggle in one view changes every view.
- **The spec's shared or own setting with resting-caret paint.** The shared mode keeps a defect as a setting, and painting a resting caret breaks Plite's paint rule.
- **One live selection per view.** It breaks Plite's one selection model; commands, history and collaboration would each pick a selection.
- **Keep Details open state shared and amend Vision.** Authored projections already broke the shared set, which stopped pruning in 44a71e0c11, and VS Code, CodeMirror and Tiptap keep fold state per view.

Proof limits: source reads at `a28e4eecbe`, Codex reads of nine checkouts, two red tests run at base, two premise probes, and one paired-timing run of a stand-in on a loaded host. The build's red cases, the timing harness and the hand drive prove behavior.

### Dependents

- `react`: `root-selection-cache.ts` and `use-plite-runtime.tsx` are its members; the cache goes, and a provider stops recording every view's commits as its own.
- `callout`: `BaseDetailsPlugin.ts` and the registry `details.tsx` move open state to the view store, and Details commands read the dispatching view's state.
- `toc`: `toc.tsx` opens collapsed sections in the view that jumped.
- `authored`: the authored-changes example nests a public `EditorRoot` given the editor with `root=` in its named-root sample, so its accepted and proposed panes become independent views with their own carets, and its browser suite runs at close.
- `ui` is unaffected, because `apps/www/src/app/(app)/examples/plite/[example]/page.tsx` mounts one view per editor and the multi-root example keeps today's chrome restore.
- `search`: `find-demo.tsx` is the two-view page the proof drives. Find's bar is already per Editable, and its query stays shared.

## Close

Reversals and deviations come first.

- The second diff panel found seven critical defects in how a caret placement is credited, how the old owner's caret is parked and how a parked caret comes back. The [caret placement plan](2026-10-20-view-caret-placement.md) redesigned all three, and the [selection import plan](2026-10-21-view-selection-import.md) then changed how a native selection reaches the model. All three plans land in one commit.
- The Phase 1 exit timing and its harness never ran, because the host's load stayed above the limit of 9. t_43ad4bac owns both, and the plan claims no typing speed.
- The hand drive ran each cell once in Chromium. The browser spec in t_0bc74410 owns the section cases' five warm runs in all three engines (Defaults "spec the drive").

Each `EditorRoot` on one editor is now its own view, with its own caret and its own Details open state. The Editables and content areas inside one root share that root's view. A Plate plugin declares per-view state with `initialViewState` and reads it through `viewStore`, `viewStoreOf` and `useViewStore`. Details keeps its open keys there, and the registry's `toc.tsx` reads `api.isOpen`. `root-selection-cache.ts`, `getLastSelectionForRoot`, `setPliteViewSelectionStoreKey` and `forceSelection` are gone.

Of the 19 steps, 15 are done, 2 wait on t_43ad4bac (the timing harness and the Phase 1 exit timing), 1 accepted a narrower proof (the hand drive), and the landing step closes with this commit.

Proof:

- `view-carets.test.tsx` runs R1, R8 to R12 and R26 to R30 and passes 188 of 188 on the selection import plan's last fixes. `pnpm plite:test` passes all 152 `plitejs`, `platejs` and `@platejs/test` test tasks (`close-checks/check-affected-a1.log`).
- `multi-editor.spec.ts` passes 45 of 45 in Chromium over five runs, and `authored-changes.spec.ts` passes 190 of 190 over five runs, both with no retries (`close-checks/multi-editor-chromium-a1.log`, `authored-changes-chromium-direct-a2.log`).
- The four docs pages and their Chinese twins serve their view store sections, and the Details preview loads in both languages (`close-checks/docs-previews.md`). `api-reference:check`, the registry build and its check exit 0.
- The close drive's ten cells hold in Chromium (`hand-drive/close-drive-cells.md`).

Limits:

- The typing cost of resting carets is unmeasured until t_43ad4bac runs.
- The section cases are unproven in Firefox and WebKit until t_0bc74410 lands.
- The link toolbar's open state is still shared across views (t_0ece45e8), and Suggestion keeps its active id per Editable (t_bc43305f).

## Open work

- Build the timing harness and run the Phase 1 exit timing on a quiet host. owner: zbeyens. stop: suggested task t_43ad4bac lands or is dropped. Tracked in the suggested-task ledger.
- Run the section and restore cases in Chromium, Firefox and WebKit through the browser spec. owner: zbeyens. stop: suggested task t_0bc74410 lands or is dropped. Tracked in the suggested-task ledger.
- Keep the link toolbar's open state per view. owner: zbeyens. stop: suggested task t_0ece45e8 lands or is dropped. Tracked in the suggested-task ledger.
- Keep the suggestion view's active id in the view store. owner: zbeyens. stop: suggested task t_bc43305f lands or is dropped. Tracked in the suggested-task ledger.
