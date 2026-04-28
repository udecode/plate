# Slate v2 Internal Runtime Projection Firewall Plan

## Status

In progress. Phase 2 decoration impact facts, Phase 3 projection subscription
facts, real source scoping, selector hook APIs, descendant/bound text selector
adoption, source-key projection refresh, and selection export policy extraction
landed. The first hard-cut shell cleanup slice landed for runtime-owned
`VoidElement` spacer children, and the second landed for runtime-owned
`InlineVoidElement` hidden anchor children. The runtime-owned void/atom shell
owner is complete; shell, event, repair, composition, and generated
`slate-browser` replay contracts remain the next broader lane.

## Harsh Call

Do not change the public node API first.

The current regressions are not caused by `renderElement` syntax being ugly.
They are caused by weak runtime ownership: void shells leak layout, selection
movement leaks into React rendering, decorations can steal focus, and examples
can accidentally own browser-critical DOM.

A shiny `defineElement` API on top of that would only make the bugs easier to
ship. The first serious move is an internal runtime/projection firewall behind
the current API.

## Goal

Make Slate v2 browser-correct and React 19.2-fast before public API redesign.

The editor runtime owns:

- DOM shells and hidden anchors
- editable content slots
- selection import/export
- mutation filtering and DOM repair
- composition and native-input state
- decoration projection
- dirty commit facts
- granular subscription invalidation

React owns:

- visible UI
- app renderer composition
- shadcn/product controls
- cheap derived presentation state

React must not be the editing engine.

## Non-Goals

- No public `defineElement` / `defineMark` rollout in the first slice.
- No example-by-example patching as the main strategy.
- No placeholder-only testing lane.
- No slow full browser matrix in default iteration.
- No copying ProseMirror NodeViews, Lexical subclasses, or Tiptap React
  NodeViews as the default authoring model.
- No broad editor-tree rerender as an acceptable tradeoff.

## Current Inputs

Research decisions already accepted:

- `docs/research/decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md`
- `docs/research/systems/editor-node-text-mark-dx-landscape.md`

Current Slate v2 code assets to reuse:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/*`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/*`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/*`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/stores/*`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/*`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/*`
- `/Users/zbeyens/git/slate-v2/packages/slate-browser/src/*`
- `/Users/zbeyens/git/slate-v2/playwright/stress/*`

## Current Core API Fact

Do not repeat the old hard-cut slogan as if all direct mutable editor fields
still exist.

Already cut as normal core API:

- `editor.children`
- `editor.selection`
- `editor.marks`
- `editor.operations`

The live `BaseEditor` uses accessor and transaction surfaces instead:

- `Editor.getChildren(editor)` / `editor.getChildren()`
- `Editor.getSelection(editor)` / `editor.getSelection()`
- `Editor.getSnapshot(editor)` / `editor.getSnapshot()`
- `Editor.getOperations(editor)` / `editor.getOperations()`
- `editor.withTransaction((tx) => ...)`

Remaining cleanup is not "remove mutable fields" again. The remaining cleanup
is to make the blessed model unambiguous:

- keep transaction/snapshot APIs as the normal write/read path
- demote or privatize public-looking escape hatches such as instance
  `editor.apply(op)`, reset-style `setChildren`, and broad live accessors
- treat `<Slate onChange>` as a React adapter callback, not a core editor field
- do not reintroduce field-style compatibility mirrors before publish

This distinction matters. The architecture plan should cut the real remaining
footguns, not spend another tranche fighting ghosts.

Current browser regressions to use as canaries:

- `/examples/hovering-toolbar`: mouse selection does not show the toolbar.
- `/examples/mentions`: inline void navigation from both sides is wrong.
- `/examples/search-highlighting`: typing in the search input decorates but
  loses focus.
- `/examples/tables`: ArrowRight from first cell lands in second cell at
  offset `1` instead of `0`.
- `/examples/images`: keyboard navigation around images is broken.
- `/examples/images`: void image shell can create visible empty layout above
  the image.
- `/examples/embeds`: editable void spacer/layout differs from legacy.

## Architecture Doctrine

### `packages/slate`

Own the model, operations, transaction lifecycle, normalization, path/runtime id
mapping, and dirty commit facts.

Required output per commit:

- operation list
- changed paths
- changed runtime ids
- changed text ranges when available
- selection before/after
- selection impact set
- normalization impact set
- stable commit id

### `packages/slate-browser`

Own browser proof and browser contracts.

This package should be the proof spine for:

- DOM selection import/export
- zero-width and hidden-anchor behavior
- beforeinput and composition expectations
- native paste/input replay
- generated navigation contracts
- model-vs-DOM agreement

### `packages/slate-dom`

Own DOM lookup primitives and low-level editor DOM helpers.

This package should not know React. It should provide stable lookup and mapping
utilities that the React runtime can call without owning browser behavior.

### `packages/slate-react`

Own projection only.

React components render stable islands and subscribe to explicit runtime facts.
They do not derive browser state by reading broad editor snapshots during
render.

## Internal Runtime Shape

Create an internal runtime object before public API work:

```ts
interface EditorRuntime {
  commit: CommitRuntime
  composition: CompositionRuntime
  decorations: DecorationRuntime
  dom: DomRuntime
  events: EventRuntime
  mutation: MutationRuntime
  projection: ProjectionRuntime
  selection: SelectionRuntime
  shells: ShellRuntime
}
```

This is internal first. The name can change. The contract matters.

### Commit Runtime

Turns model updates into cheap facts.

```ts
interface CommitFacts {
  id: number
  dirtyNodeIds: ReadonlySet<string>
  dirtyTextIds: ReadonlySet<string>
  dirtyShellIds: ReadonlySet<string>
  selectionAfter: Range | null
  selectionBefore: Range | null
  selectionImpactIds: ReadonlySet<string>
  decorationImpactIds: ReadonlySet<string>
  normalizationImpactIds: ReadonlySet<string>
}
```

No React component should need to scan the whole editor to know if it changed.

### Projection Runtime

Owns subscription keys by runtime id and source.

Projection facts should be small:

- `selected`
- `focused`
- `readOnly`
- `composing`
- `attrsHash`
- `childrenIdentity`
- `decorationHash`
- `annotationHash`
- `shellState`

React hooks subscribe to derived values, not giant editor objects.

### Shell Runtime

Owns all browser-critical DOM structure:

- editor root attrs
- element shell attrs
- text shell attrs
- leaf shell attrs
- editable content slot
- void/atom hidden anchor
- spacer placement
- drag/focus/select attrs
- DOM refs

App renderers receive visible props only. For containers, they receive a
branded content slot. For void/atom elements, they do not receive raw hidden
children.

## React 19.2 Performance Rules

Use React 19.2 where it helps. Do not make it responsible for correctness.

- Use `useSyncExternalStore`-style subscriptions for runtime facts.
- Use selector hooks that return primitive or stable derived values.
- Use `useEffectEvent` for DOM listener bridges so handlers stay fresh without
  resubscribing global listeners.
- Use refs for transient high-frequency facts such as native selection,
  composition state, and pointer drag state.
- Use `startTransition` for non-urgent projection work such as search
  decorations, expensive overlays, and analytics.
- Use `useDeferredValue` only where visual lag is acceptable, never for core
  text input or selection authority.
- Use `Activity` for hidden secondary surfaces, inactive floating UI, or
  secondary editor panels. Do not wrap the active editor body in Activity.
- Use React Performance Tracks to prove render breadth.
- Hoist static JSX and static config out of render paths.
- Avoid barrel imports on hot editor surfaces where they inflate bundles.

Rules from Vercel guidance that directly apply:

- `rerender-defer-reads`
- `rerender-derived-state`
- `rerender-derived-state-no-effect`
- `rerender-split-combined-hooks`
- `rerender-use-ref-transient-values`
- `rerender-transitions`
- `rerender-use-deferred-value`
- `rendering-hoist-jsx`
- `rendering-activity`
- `client-event-listeners`
- `bundle-barrel-imports`

## Performance Budgets

These budgets are the bar for the internal runtime.

| Scenario | Budget |
| --- | --- |
| Type one character in plain text | touched text/leaf projection only; editor body does not rerender |
| Delete selected text | affected text/leaf projection only; toolbar can update separately |
| Arrow across block void | old selected shell and new selected shell update; no full tree rerender |
| Arrow around inline void | adjacent text and inline atom projection update only |
| Type in search input | input keeps DOM focus; decoration projection updates separately |
| IME composition | composition refs update without broad React invalidation |
| Mouse selection for toolbar | toolbar anchor updates without remounting editor content |
| Table cell ArrowRight | target cell offset is model-correct and DOM selection agrees |
| Image selection | hidden anchor never creates visible layout |

Render counts must be measured, not guessed.

## Test Strategy

Default iteration stays fast.

Fast lane:

- focused unit tests in touched packages
- focused Playwright grep for the current canary
- `bun check` when a slice touches core package behavior

Opt-in stress lane:

- `bun test:stress`
- `STRESS_ROUTES=... STRESS_FAMILIES=... bun test:stress`
- `STRESS_REPLAY=... bun test:stress:replay`

Closure lane:

- `bun check:full`

Do not put the full generated browser matrix into default `bun check`.

## Phase 0: Baseline And Instrumentation

### Work

1. Add render-count instrumentation behind a dev/test flag.
2. Capture counts for editor body, element shell, text shell, leaf, void shell,
   toolbar, and decoration overlays.
3. Add a small proof helper that records:
   - model selection
   - DOM selection
   - focused element
   - rendered text
   - selected runtime ids
   - render counts
   - console/page errors
4. Add canary browser scripts for:
   - images
   - embeds
   - mentions
   - search-highlighting
   - tables
   - hovering-toolbar

### Acceptance

- Canary runs can fail honestly and produce readable artifacts.
- Render counts are available per canary.
- Each canary asserts model and DOM state, not screenshots alone.

## Phase 1: Runtime Ownership Map

### Work

1. Map current owners for selection, mutation repair, composition, shell DOM,
   decorations, widgets, annotations, and void spacers.
2. Document which code is allowed to write browser-critical DOM attrs.
3. Identify duplicate ownership in:
   - `editable.tsx`
   - `editable-element.tsx`
   - `slate-element.tsx`
   - `slate-text.tsx`
   - `slate-leaf.tsx`
   - `void-element.tsx`
   - `projection-store.ts`
   - `widget-store.ts`
   - `annotation-store.ts`
4. Create the internal `EditorRuntime` entrypoint or equivalent module.

### Acceptance

- There is one internal runtime owner for each browser-critical responsibility.
- React components can import runtime facts, but do not own those facts.
- No public API changes.

### Current Ownership Map

| Responsibility | Current owner | Current problem | Target owner |
| --- | --- | --- | --- |
| DOM selection import/export | `packages/slate-react/src/components/editable.tsx`, `editable/input-controller.ts`, `editable/selection-reconciler.ts` | `EditableDOMRoot` wires native listeners, model preference, import/export, shell-backed state, and trace recording in one component. | Internal `SelectionRuntime` called by `EditableDOMRoot`. |
| Mutation and DOM repair | `editable.tsx`, `editable/dom-repair-queue.ts`, input strategies | Repair queue is created in React render scope and request plumbing is scattered across beforeinput/input/keyboard/paste/drop handlers. | Internal `MutationRuntime` plus `DomRepairRuntime`. |
| Composition and IME state | `editable.tsx`, `editable/composition-state.ts`, Android input manager hooks | Composition state still forces React state through `setIsComposing`; high-frequency facts should mostly stay in refs/runtime. | Internal `CompositionRuntime`; React exposes stable projection facts only. |
| Native event ownership | `editable.tsx`, `editable/editing-kernel.ts`, input-router hooks | Kernel decisions are useful, but `EditableDOMRoot` still orchestrates every event family directly. | Internal `EventRuntime` with per-family handlers. |
| Shell DOM attrs and refs | `slate-element.tsx`, `slate-text.tsx`, `slate-leaf.tsx`, `slate-spacer.tsx`, `void-element.tsx`, `use-slate-node-ref.tsx` | Primitive components own browser-critical attrs directly; `VoidElement` still requires app authors to pass spacer children. | Internal `ShellRuntime`; primitives render runtime-owned attrs/content slots. |
| Void spacer placement | `void-element.tsx`, `slate-spacer.tsx`, app `renderElement` functions | Better than raw `{children}`, still too footgunny because app-visible void content and hidden spacer are coupled by component convention. | `ShellRuntime` owns hidden anchor/spacer; app renderers provide visible content only. |
| Decoration projection | `projection-store.ts`, `use-slate-projections.tsx`, `EditableText` | Projection store is a good internal shape, but dirtiness is source-level and recomputes snapshots by runtime id after full source refresh. | `ProjectionRuntime` consuming commit facts and source-specific invalidation. |
| Annotation projection | `annotation-store.ts` | Good separate store; resolves bookmarks and projects by runtime id, but still separate from commit facts. | `AnnotationRuntime` layered onto `ProjectionRuntime`. |
| Floating widgets | `widget-store.ts` | Good external-store shape; selection/node/annotation anchors are explicit. Node dirtiness is currently broad via `isSlateSourceDirty('node')`. | `WidgetRuntime` using selection/runtime-id impact facts. |
| Render breadth proof | `render-profiler.ts`, `slate-browser/playwright` helpers | New proof spine exists; selected runtime ids are measurable. | Keep in `slate-browser` as proof infrastructure; do not expose as app API. |

### Phase 1 First Code Target

Do not start by moving all event code.

First extraction should be shell ownership because it is the highest-leverage
DX and regression owner:

1. Create an internal shell-runtime module in `slate-react`.
2. Move primitive browser attrs into shell helpers:
   - editor root attrs
   - element attrs
   - text attrs
   - leaf attrs
   - spacer attrs
   - runtime id/path binding naming
3. Keep current public components working.
4. Add tests proving shell helpers produce the same DOM contract.
5. Only after shell helpers exist, tighten `VoidElement` so app authors do not
   manually own spacer placement in normal usage.

Reason: selection/runtime extraction before shell ownership would still leave
void spacers and hidden anchors as app-renderer footguns. Shell ownership is the
smallest API-neutral move that attacks the repeated regressions directly.

## Phase 2: Commit Facts And Dirty Runtime Ids

### Work

1. Promote dirty path information into runtime-id facts usable by React.
2. Add selection impact calculation:
   - old anchor/focus affected nodes
   - new anchor/focus affected nodes
   - void/atom boundary nodes
   - table cell boundary nodes
3. Add decoration impact calculation:
   - dirty text ranges
   - source-specific changed ranges
   - old/new decoration coverage
4. Expose a stable commit id for external-store subscriptions.

### Acceptance

- A React selector can answer "did this node projection change?" in O(1) or
  near-O(1) for normal cases.
- Selection-only commits do not invalidate the full editor tree.
- Decoration-only commits do not invalidate unrelated nodes.

## Phase 3: Granular Projection Store

### Work

1. Consolidate projection subscriptions around runtime ids and source keys.
2. Provide selector hooks:
   - `useEditorSelector`
   - `useNodeSelector`
   - `useTextSelector`
   - `useDecorationSelector`
3. Ensure selectors subscribe to derived primitives or stable structs.
4. Split hooks that currently combine unrelated concerns.
5. Add equality checks that reject accidental object churn.

### Acceptance

- Typing a character does not rerender the editor body.
- Selection movement does not rerender nodes outside the selection impact set.
- Search decoration updates can rerender decorated ranges without stealing focus.

## Phase 4: Runtime-Owned Shells Behind Current API

### Work

1. Introduce internal shell components:
   - `EditorShell`
   - `ElementShell`
   - `TextShell`
   - `LeafShell`
   - `VoidShell`
   - `ContentSlot`
2. Keep existing public `renderElement`, `renderLeaf`, and `renderPlaceholder`
   contracts active.
3. Adapt current renderers into shell-managed output.
4. Move hidden void anchors and spacer placement into `VoidShell`.
5. Make app void renderers responsible only for visible content.
6. Add a development error when a container renderer omits the content slot
   after the future API exists. For this internal phase, preserve compatibility.

### Acceptance

- Images have no visible empty layout above the image.
- Embeds match legacy spacing for editable voids.
- App renderers cannot accidentally drop the hidden anchor.
- Void shell behavior is tested through model, DOM, and visual-layout asserts.

## Phase 5: Selection, DOM Repair, And IME Ownership

### Work

1. Move DOM selection import/export into runtime controllers.
2. Use `useEffectEvent` for React listener bridges.
3. Keep native selection and composition state in refs/runtime, not React state.
4. Explicitly route:
   - browser-native movement
   - model-owned movement
   - table movement
   - inline void boundary movement
   - block void movement
5. Ensure DOM repair never creates visible layout artifacts.

### Acceptance

- Mention inline void navigation works from left and right.
- Image keyboard navigation works before, on, and after the image.
- Table ArrowRight enters the next cell at offset `0`.
- Hovering toolbar appears on mouse selection.
- IME composition has no broad rerender path.

## Phase 6: Decorations, Annotations, And Search Focus

### Work

1. Move decoration projection into source-scoped runtime data.
2. Ensure search input state is native/app-owned and urgent.
3. Apply decoration recalculation in a transition when possible.
4. Keep editor focus changes explicit; decoration updates must not call focus.
5. Reconcile annotation/widget stores with the same projection model.

### Acceptance

- `/examples/search-highlighting` keeps focus in the search input while typing.
- Decoration changes update only affected text ranges.
- Toolbar/widget updates do not remount editor content.

## Phase 7: Generated Browser Contracts

### Work

1. Extend `slate-browser` proof helpers to express node-family contracts:
   - block atom navigation
   - inline atom navigation
   - editable void layout
   - table boundary movement
   - decoration focus retention
   - mark boundary insertion
   - paste/import/export round trip
2. Generate sparse fast canaries from internal descriptors.
3. Generate full replayable stress artifacts for `test:stress`.
4. Keep artifacts small and replayable.

### Acceptance

- Fast canaries cover the reported regression families.
- `test:stress` can replay a failure without rerunning the full matrix.
- The browser proof asserts model, DOM selection, focus, layout, and render
  count where relevant.

## Phase 8: Public DX Gate

Only start this after Phases 0-7 prove the runtime.

Public API target:

- `defineElement`
- `Content`
- atom/void renderers without raw hidden children
- `defineMark`
- `defineTextBehavior`
- `defineExtension`
- generated browser contracts per extension

Migration stance:

- Existing Slate-style renderers keep working through an adapter.
- Plate plugins migrate feature by feature.
- Yjs syncs document content and typed node state.
- Runtime ids, shell DOM, selection import/export, and hidden anchors remain
  local runtime facts.

### Acceptance

- The new API improves DX without weakening browser ownership.
- No app/plugin author has to remember spacer or hidden-anchor placement.
- Public examples get simpler, not more magical.

## First Implementation Slice

Start here.

1. Add render-count and state-proof instrumentation.
2. Add focused canaries for:
   - images void layout and keyboard navigation
   - mentions inline void left/right navigation
   - search-highlighting focus retention
3. Add the internal runtime/projection entrypoint.
4. Move only the minimum shell ownership needed to make image/void layout and
   selection proof honest.
5. Do not change public renderer API.
6. Verify with focused package tests and focused browser canaries.
7. Update this plan with evidence before continuing.

## Files Likely Touched First

In `/Users/zbeyens/git/slate-v2`:

- `packages/slate-react/src/components/editable.tsx`
- `packages/slate-react/src/components/editable-element.tsx`
- `packages/slate-react/src/components/slate-element.tsx`
- `packages/slate-react/src/components/slate-text.tsx`
- `packages/slate-react/src/components/slate-leaf.tsx`
- `packages/slate-react/src/components/void-element.tsx`
- `packages/slate-react/src/stores/projection-store.ts`
- `packages/slate-react/src/hooks/use-generic-selector.tsx`
- `packages/slate-react/src/hooks/use-slate-selector.tsx`
- `packages/slate-react/src/editable/selection-controller.ts`
- `packages/slate-react/src/editable/mutation-controller.ts`
- `packages/slate-react/src/editable/composition-state.ts`
- `packages/slate-browser/src/*`
- `playwright/stress/*`

## Verification Gates

Per implementation slice:

- focused unit tests for touched packages
- focused browser canary for changed behavior
- `bun run lint:fix`
- package typecheck for touched packages

Before claiming runtime closure:

- `bun check`
- focused reported-regression canaries all green
- render budgets recorded
- `bun test:stress` green for curated routes/families
- `bun check:full` green when making a release-quality architecture claim

## Stop Conditions

Stop and replan if any of these happen:

- render counts prove selection movement rerenders the editor body
- a canary passes with DOM-only assertions while the Slate model is wrong
- the shell abstraction requires public API churn before internal proof
- hidden anchors fix one void example but break another void family
- search focus is fixed by suppressing decoration updates instead of isolating
  projection ownership

## Done Definition

This plan is complete when:

- all listed canary regressions are green
- runtime-owned shells are the default internal path
- selector subscriptions enforce narrow render invalidation
- `slate-browser` owns replayable contracts for the regression families
- public API design can proceed without carrying spacer/selection/render
  footguns forward

## Next Hard-Cut Cleanup Lane

This is the clean architecture/DX lane after the completed runtime/projection
tranche.

### 1. Runtime-Owned Void And Atom Shells

Hard cut normal app responsibility for void spacers and hidden anchors.

- Runtime owns hidden anchor placement.
- Runtime owns spacer placement.
- App renderers render visible content only.
- Normal app renderers do not receive raw hidden children.
- Any escape hatch is internal or explicitly advanced, with browser proof.

Acceptance:

- Image, embed, and inline-void examples do not pass spacer props in ordinary
  render code.
- Browser proof covers layout, focus, DOM selection, model selection, and render
  count.

### 2. Selector-Only Hot React Paths

Hard cut broad React subscriptions on hot editor paths.

- Hot components use node/text/decoration/source selector hooks.
- Ad hoc component-local `useSlateSelector` filtering is removed from mounted
  node/text/leaf/void paths once a specific selector exists.
- Broad editor selectors remain only for cold app surfaces or explicitly
  advanced use.

Acceptance:

- Typing, arrowing across voids, table cell movement, and decoration refreshes
  do not rerender the editable root.
- Tests assert both rerender budget and model/DOM state.

### 3. Selection Runtime Owns Selection Policy

Hard cut selection import/export policy from React components.

- `Editable` wires runtime modules, but does not decide selection authority.
- DOM-owned native selection stays DOM-owned.
- App/programmatic model selection exports through the selection runtime.
- IME/composition state is handled as runtime state, not React render state.

Acceptance:

- Selection policy is testable without rendering the full editor tree.
- Hovering toolbar, mentions, images, and tables keep browser proof green.

### 4. Core Public Surface Final Cut

Do not cut the already-cut field APIs again. They are not the current problem.

Already cut as normal API:

- `editor.children`
- `editor.selection`
- `editor.marks`
- `editor.operations`

Remaining candidates:

- demote or remove instance `editor.apply(op)` as a normal write path
- demote or remove reset-style `setChildren` from ordinary public DX
- keep `Editor.apply(editor, op)` only if replay/import needs an explicit
  single-op API
- fence `getLiveNode`, `getLiveText`, and `getLiveSelection` as internal or
  advanced runtime tools
- keep `<Slate onChange>` only as React adapter output, not core ownership

Acceptance:

- Public docs teach transactions and snapshots first.
- Normal examples never use raw single-op apply, `setChildren`, or live
  accessors.
- Core package tests prove transaction replay/import separately from normal app
  editing.

### 5. No Compatibility Aliases Before Publish

Hard cut wrong unpublished APIs.

- No deprecated aliases.
- No migration shims.
- No fallback props that preserve the old wrong renderer shape.
- No tests that exist only to prove deleted behavior still limps along.

Acceptance:

- Grep proves deleted names are gone from exports, examples, docs, and tests.
- The surviving API reads as one system, not three eras stacked together.

### 6. Browser Contracts Beat Example Patches

Hard cut example-specific fixes as the safety net.

- Examples stay demos and smoke surfaces.
- `slate-browser` owns generated replay contracts by operation family.
- Stress tests live in `test:stress`, not default fast CI.
- Failures emit replayable artifacts.

Acceptance:

- Reported regression families map to generated operation/navigation contracts.
- Default CI stays fast.
- `test:stress` can replay human-like editing scenarios without manual bug
  reports for every variant.

## Full Plan For Remaining Hard-Cut Items 4-6

This is the execution plan for the remaining cleanup after runtime-owned
void/atom shells. It starts with inventory because stale claims already caused
bad guidance once. The first rule is simple: cut the live footguns, not the
ghosts.

### Non-Goals

- Do not retest placeholder-only behavior as the main lane.
- Do not put generated stress in default `bun check`.
- Do not keep compatibility aliases for unpublished APIs.
- Do not patch examples as the primary safety net.
- Do not rewrite transforms before the public write/read contract is nailed.
- Do not call the architecture complete because example canaries pass.

### Execution Order

1. Item 4 inventory and public-surface contracts.
2. Item 4 core write/read hard cut.
3. Item 4 React adapter callback boundary.
4. Item 5 alias and fallback deletion.
5. Item 5 release-discipline guard.
6. Item 6 operation-family browser contract expansion.
7. Item 6 CI split and replay workflow.

Item 6 scenario design can be drafted while item 4 is in progress, but code
changes should not depend on the old public surface.

### 4A. Inventory The Actual Public Surface

Owner: `packages/slate`.

Read first:

- `packages/slate/src/interfaces/editor.ts`
- `packages/slate/src/create-editor.ts`
- `packages/slate/src/core/public-state.ts`
- `packages/slate/src/core/editor-extension.ts`
- `packages/slate/test/surface-contract.ts`
- `packages/slate/test/write-boundary-contract.ts`
- `packages/slate/test/accessor-transaction.test.ts`
- `packages/slate/test/generic-editor-api-contract.ts`
- current docs and examples that mention raw editor write/read APIs

Inventory commands:

```bash
rg -n "readonly apply|applyOperations|setChildren|getLiveNode|getLiveSelection|getLiveText|reset:|replace:" packages/slate/src packages/slate/test
rg -n "editor\\.apply|Editor\\.apply|setChildren|getLiveNode|getLiveSelection|getLiveText|onChange|deprecated|compat|legacy|fallback|alias" packages docs site playwright
```

Classify every surfaced API into one bucket:

| Bucket | Meaning | Examples |
| --- | --- | --- |
| Normal public | Human and app-author API | `editor.update`, transforms, snapshots, transactions |
| Explicit replay/import | Low-level operation ingestion | `applyOperations` or a renamed replay writer |
| Advanced runtime | Runtime-owned escape hatch, not app DX | live node/text/selection reads if they survive |
| Internal only | Package-private implementation detail | direct live reads used by DOM/runtime code |
| Delete | Unpublished wrong shape | compatibility aliases, fallback renderer props |

Current inventory after the 2026-04-27 activation pass:

| Surface | Current fact | Bucket | Next move |
| --- | --- | --- | --- |
| `editor.update(...)` and transforms | Existing write-boundary contract routes ordinary edits through `editor.update`. | Normal public | Keep as the app-author write path. |
| `editor.withTransaction((tx) => ...)` / `tx.apply(op)` | Transaction surface exists and `tx.apply(op)` is already the intended transaction-owned single-op primitive. | Normal public inside transaction | Keep, then migrate any direct single-op tests/callers that should be transaction-owned. |
| `editor.applyOperations(...)` / `Editor.applyOperations(...)` | Existing contracts prove it imports operations and publishes one commit. | Explicit replay/import | Keep as the public replay/import writer unless a better final name wins before publish. |
| instance `editor.apply(op)` | Cut from `BaseEditor`, `createEditor`, instance runtime shape, tests, and editor detection. Operation fixtures use `applyOperations(...)`; transaction tests use `transaction.apply(...)`. | Deleted from normal public | Keep deleted. Continue with `getLive*` fencing. |
| `Editor.apply(editor, op)` | Cut from `EditorInterface`; operations docs now teach `applyOperations`. Snapshot tests still use instance `editor.apply`, not the static helper. | Deleted | Keep deleted. Do not reintroduce a static single-op helper. |
| `setChildren` / `Editor.setChildren` | Cut from `BaseEditor`, `EditorInterface`, `createEditor`, docs, tests, and the root package barrel. Raw child replacement is fenced behind `slate/internal` as `setEditorChildren` for Slate-owned package setup only. | Deleted from normal public; internal-only fixture/runtime tool | Keep root deleted. Continue with instance `editor.apply(op)` and `getLive*` fencing. |
| `replace` / `reset` | Snapshot-level writers exist beside `setChildren`. | Normal or explicit snapshot writer | Keep only if documented as full snapshot replacement, not child-list mutation. |
| `getChildren`, `getSelection`, `getSnapshot`, `getOperations` | These are the already-cut field replacements and current normal read APIs. | Normal public | Keep and teach first. |
| `getLiveNode`, `getLiveText`, `getLiveSelection` | `BaseEditor`, `EditorInterface`, surface tests, docs, React/DOM runtime, and core helpers still expose/use them. | Advanced runtime or internal only | Fence from ordinary app/docs; keep internal runtime use where snapshot reads are stale. |
| core `editor.onChange` | `apply-onChange` contract already proves no instance `onChange` key. | Already deleted | Keep deleted. |
| React `<Slate onChange>` / `onValueChange` | React docs still describe callback API and an alias. | React adapter output | Pick one final callback story before publish; remove alias if the duplicate is only compatibility. |
| compatibility and legacy inventories | `escape-hatch-inventory-contract` already tracks stale `editor.apply`/field/API pressure, but many rows are still compatibility or historical buckets. | Burn-down guard | Tighten after item 4 final public surface lands. |

Acceptance:

- The plan has a checked inventory table before code cuts begin.
- Every current `BaseEditor` and `EditorInterface` write/read escape hatch has
  an owner bucket.
- Tests describe the target surface before implementation starts.

### 4B. Hard Cut The Core Write Boundary

Target API shape:

- Normal app writes go through `editor.update(...)`, transforms, or
  `editor.withTransaction((tx) => ...)`.
- Operation replay/import goes through one explicit API, preferably
  `editor.applyOperations(...)` / `Editor.applyOperations(...)`.
- `tx.apply(op)` remains valid inside transaction-owned code.
- Instance `editor.apply(op)` is not a normal public write path.
- `Editor.apply(editor, op)` survives only if replay/import genuinely needs a
  single-op public helper; otherwise delete it too.
- `setChildren` is not ordinary public DX. Prefer `replace`/`reset` with a
  full snapshot-shaped input, or an explicitly named test/import utility.

Implementation slices:

1. Add or update public-surface tests that fail on the target contract:
   - `BaseEditor` does not expose ordinary `apply`.
   - normal docs/examples do not call `editor.apply`.
   - normal docs/examples do not call `setChildren`.
   - replay/import tests use the explicit replay writer.
2. Move extension override points from `apply` to the kept replay/operation
   boundary, or prove why a wrapper hook still belongs.
3. Replace internal single-op callers with transaction-owned `tx.apply(op)` or
   explicit replay helpers.
4. Delete or demote `Editor.apply` after the replay/import contract is green.
5. Delete or demote instance `setChildren`. Keep `replace`/`reset` only if they
   read as snapshot-level operations, not arbitrary child mutation.
6. Update docs to teach transactions and snapshots first.

Tests:

```bash
bun test ./packages/slate/test/surface-contract.ts ./packages/slate/test/write-boundary-contract.ts ./packages/slate/test/transaction-contract.ts --bail 1
```

Acceptance:

- App-level write examples use transforms, `update`, or transactions.
- Replay/import has one explicit public path.
- Extension wrapping does not require overriding normal `editor.apply`.
- No package test asserts `setChildren` as the blessed public state path.

### 4C. Fence Broad Live Reads

Target API shape:

- Normal reads use `Editor.getSnapshot(editor)`, `editor.getSnapshot()`,
  `Editor.getChildren(editor)`, `Editor.getSelection(editor)`, and dedicated
  selector/runtime APIs.
- `getLiveNode`, `getLiveText`, and `getLiveSelection` are runtime tools.
- React/DOM internals may use live reads when they are proving immediate DOM or
  input-state authority.
- App renderers and examples do not use broad live reads.

Implementation slices:

1. Split public type exposure from internal runtime exposure if needed.
2. Move broad live reads behind an internal module or explicitly advanced
   namespace.
3. Replace app-facing call sites with snapshot or selector APIs.
4. Keep internal browser/runtime call sites only when a snapshot would be stale
   for the operation being handled.
5. Add a contract proving userland examples do not depend on live reads.

Acceptance:

- `getLive*` no longer reads like ordinary app DX.
- Hot React paths use node/text/decoration/source selectors.
- Internal live reads have tight ownership and focused tests.

### 4D. Keep `<Slate onChange>` As Adapter Output Only

Target API shape:

- Core editor state has no public `onChange` field.
- React `<Slate onChange>` is a component callback that receives adapter output
  after committed editor changes.
- Programmatic core usage relies on snapshots, transactions, and subscribers.
- If a better React name is chosen, use it directly before publish; do not keep
  both names as compatibility aliases.

Implementation slices:

1. Inventory `<Slate onChange>`, `onValueChange`, and subscriber usage.
2. Define the final React adapter naming.
3. Remove duplicate names or compatibility aliases before publish.
4. Add React adapter tests proving callbacks receive committed snapshots and
   never become core editor state.

Acceptance:

- Docs present one blessed React callback story.
- Core packages do not expose callback-owned mutable state.
- Adapter tests prove callback timing against transactions.

### 5A. Alias, Fallback, And Legacy Inventory

Owner: all public packages touched by the hard cut.

Inventory commands:

```bash
rg -n "deprecated|compat|legacy|fallback|alias|shim|migration|previously|old API|children.*spacer|spacer=.*children|renderElement.*children" packages docs site playwright
rg -n "SlateReactCompat|useSlateSelector|VoidElement.*children|InlineVoidElement.*children|editor\\.apply|Editor\\.apply|setChildren|getLive" packages docs site playwright
```

Classify results:

- Delete: unpublished wrong API, fallback renderer shape, dead docs, dead tests.
- Internal test utility: allowed only if it is not exported or taught as API.
- Explicit advanced namespace: allowed only if the name screams low-level
  runtime use and docs prove normal users should not start there.

Acceptance:

- Inventory has no "keep because backward compatibility" row unless the API is
  already published and intentionally supported.
- Wrong unpublished names die instead of getting warnings.

### 5B. Delete Compatibility Paths

Implementation slices:

1. Remove deprecated exports, aliases, fallback props, and dual names.
2. Remove docs that explain the cut API.
3. Remove tests that exist only to keep the deleted path alive.
4. Replace any useful behavioral coverage with tests against the surviving API.
5. Regenerate barrels only if exported files move or public exports change.

Acceptance:

- Public exports read as one coherent API.
- No normal example imports a compatibility namespace.
- No test asserts a deleted name still exists.
- Docs describe the current API only.

### 5C. Add Release-Discipline Guards

The guard should be cheap and static. It belongs in the release-discipline lane,
not the slow browser stress lane.

Guard responsibilities:

- Public-surface inventory for forbidden normal APIs.
- Export inventory for compatibility aliases.
- Docs/examples grep for deleted names.
- Package-level type/API contracts for the final public shape.

Likely command shape:

```bash
bun test ./packages/slate/test/surface-contract.ts ./packages/slate/test/write-boundary-contract.ts --bail 1
bun test ./packages/slate-browser/test/core/release-proof.test.ts --bail 1
```

Acceptance:

- A reintroduced normal `editor.apply`, `setChildren`, app-owned void spacer
  prop, or compatibility alias trips a fast test or guard.
- The guard checks names and exports, not browser behavior.

### 6A. Build The Operation-Family Contract Map

Owner: `packages/slate-browser` plus Playwright stress routes.

Map reported regressions to generated contract families:

| Family | Routes | Contract |
| --- | --- | --- |
| inline-void-boundary-navigation | `mentions` | arrow from left/right, delete, select across atom, model/DOM agreement |
| block-void-navigation | `images`, `embeds` | enter/exit void, vertical/horizontal arrows, delete/backspace, layout shell integrity |
| table-cell-boundary-navigation | `tables` | ArrowRight/Left/Up/Down across cells lands at expected offset |
| external-decoration-refresh | `search-highlighting`, `external-decoration-sources` | focus owner preserved, decoration output updated, render budget respected |
| mouse-selection-toolbar | `hovering-toolbar` | native mouse drag keeps DOM selection, model selection, toolbar visibility |
| paste-normalize-undo | `richtext`, `plaintext`, `forced-layout` | paste, normalize, undo, redo, replay artifact |
| selection-repair-ime | focused IME/mobile routes | composition state, DOM repair, selection export/import ownership |

The placeholder family stays a low-priority canary unless it reappears as part
of a broader empty-block or composition contract.

Acceptance:

- Every user-reported regression class has a named operation family.
- Each family defines model state, DOM state, focus owner, and render-budget
  assertions.
- The map lives near the stress generator, not only in this plan.

### 6B. Make Stress Generated And Replayable

Target shape:

- `bun test:stress` remains opt-in.
- `STRESS_ROUTES`, `STRESS_FAMILIES`, and `STRESS_SEED` select focused runs.
- Every failure emits a replayable artifact.
- Replay uses `bun test:stress:replay` with `STRESS_REPLAY=...`.
- Artifacts include route, family, seed, steps, model selection, DOM selection,
  focus owner, commit trace, render counts, and reduction candidates.

Implementation slices:

1. Extend generated stress cases beyond paste/type/delete.
2. Add route-family builders for the table, void, inline-void, decoration, and
   mouse-selection classes.
3. Require every generated step to serialize through `createScenarioReplay`.
4. Add shrink/reduction candidates for failing multi-step cases.
5. Add focused replay docs in the test file header or a short test README.

Acceptance:

- A failing stress run gives a concrete replay command.
- Replayed artifacts do not need manual browser clicking.
- Stress data is deterministic by seed.

### 6C. Keep CI Fast, Keep Release Proof Serious

Default fast gates:

- package unit contracts
- public-surface/static guards
- focused browser canaries for known hot paths
- no generated stress matrix

Opt-in/release gates:

- `bun test:stress`
- `bun test:stress:replay`
- `bun check:full`
- `bun test:integration-local` only for full local closure or explicit request

Acceptance:

- Default CI catches reintroduced architectural footguns quickly.
- Slow human-like browser sweeps are available without making every commit
  painful.
- Release-quality claims require `bun check:full`, not vibes.

### 6D. Demote Examples Back To Demos

Policy:

- Examples are smoke surfaces and user-facing demos.
- A regression is not closed by an example-only fix.
- Every closed regression class gets a `slate-browser` contract row or a clear
  reason it is not generalizable.
- Example-specific markup changes are acceptable only after the owning runtime
  contract exists.

Acceptance:

- Reported browser bugs turn into operation-family contracts.
- Example tests remain readable.
- `slate-browser` owns the replay contract for variant coverage.

### First Executable Slice

Start with item 4, not browser stress.

1. Add a current public-surface inventory table to this plan.
2. Add failing/target tests for `editor.apply`, `setChildren`, and `getLive*`
   ownership.
3. Cut the write boundary first: replay/import API, transaction-owned
   `tx.apply`, no normal app-owned `editor.apply`.
4. Then fence live reads.
5. Then run the alias deletion sweep.
6. Only then expand generated browser stress over the regression families.

First-slice verification:

```bash
bun test ./packages/slate/test/surface-contract.ts ./packages/slate/test/write-boundary-contract.ts ./packages/slate/test/transaction-contract.ts --bail 1
bun check
```

Closure verification for the whole items 4-6 lane:

```bash
bun check
STRESS_FAMILIES=inline-void-boundary-navigation,block-void-navigation,table-cell-boundary-navigation,external-decoration-refresh bun test:stress
bun test:stress:replay
bun check:full
```

Do not run the closure commands during every slice. Run them before claiming the
architecture lane is done.

## Execution Ledger

### 2026-04-27: Activate Items 4-6 Hard-Cut Lane

Slice name: complete-plan activation and item 4A inventory.

Owner classification: `packages/slate` public surface and replay/import
boundary.

Actions taken:

- Generated `tmp/continue.md` from the active items 4-6 plan.
- Set `tmp/completion-check.md` to `pending` for the new lane.
- Read the completed void/atom lane state before activating the next owner.
- Ran the item 4A public-surface inventory commands against `../slate-v2`.
- Added the current public-surface inventory table above.

Commands run:

- `rg -n "readonly apply|applyOperations|setChildren|getLiveNode|getLiveSelection|getLiveText|reset:|replace:" packages/slate/src packages/slate/test`
- `rg -n "editor\\.apply|Editor\\.apply|setChildren|getLiveNode|getLiveSelection|getLiveText|onChange|deprecated|compat|legacy|fallback|alias" packages docs site playwright --glob '!**/CHANGELOG.md'`

Evidence:

- `BaseEditor` still exposes readonly `apply`, `setChildren`, and `getLive*`.
- `EditorInterface` still exposes `Editor.apply`, `Editor.setChildren`, and
  `Editor.getLive*`.
- `applyOperations` already has focused replay/import contract coverage.
- Core `editor.onChange` is already cut by contract.
- `escape-hatch-inventory-contract.ts` already exists but still includes
  compatibility burn-down rows.

Decision:

- Start the code cut with public-surface contracts for the actual remaining
  footguns, not old field APIs.
- Keep `applyOperations` as the explicit replay/import path for now.
- Treat `setChildren` as the ugliest remaining public DX leak.

Rejected tactics:

- Do not start item 6 stress expansion before the item 4 public surface stops
  moving.
- Do not keep `Editor.apply` merely because old operations docs teach it.
- Do not classify `getLive*` as normal app DX.

Next action:

- Update or add target contracts that make the final item 4 surface explicit:
  no normal public `editor.apply`, no ordinary `setChildren`, and fenced
  `getLive*` ownership.

### 2026-04-27: Item 4B Static Apply Cut

Slice name: remove public static `Editor.apply`.

Owner classification: `packages/slate` replay/import public surface.

Actions taken:

- Removed `EditorInterface.apply`.
- Removed the `Editor.apply` implementation from the `Editor` namespace object.
- Changed the internal reducer helper type so `core/apply.ts` no longer depends
  on `Editor['apply']`.
- Updated operations and transforms docs to use `editor.applyOperations(...)`.
- Added a surface contract proving `Editor.apply` is not public.
- Updated stale transaction/surface tests that were still writing outside
  `editor.update`.

Commands run:

- `rg -n "Editor\\.apply\\(" packages/slate/src packages/slate/test docs/concepts docs/api site playwright --glob '!docs/general/changelog.md'`
- `bun test ./packages/slate/test/surface-contract.ts ./packages/slate/test/write-boundary-contract.ts ./packages/slate/test/transaction-contract.ts --bail 1`
- `bun check`

Evidence:

- Focused item 4 tests pass: 36 pass, 0 fail.
- `bun check` passes: lint, package/site/root typecheck, Bun tests, and
  slate-react Vitest suite.
- Remaining `Editor.apply` grep hits are false positives from variables named
  `directEditor` / `transactionEditor` using instance `editor.apply`.

Decision:

- `applyOperations` remains the explicit replay/import public path.
- Static single-op replay is gone; transaction-owned single-op use is
  `transaction.apply`.

Rejected tactics:

- Do not keep static `Editor.apply` as a convenience alias.
- Do not treat instance `editor.apply` as solved by this slice.

Next action:

- Cut ordinary public `setChildren` and route setup/reset examples through
  snapshot-level `replace`/`reset` or test-only helpers.

### 2026-04-27: Item 4B Public SetChildren Fence

Slice name: remove public `setChildren` and raw state setters from the root
package surface.

Owner classification: `packages/slate` root export contract and Slate-owned
internal runtime bridge.

Actions taken:

- Added a surface contract proving root `slate` does not export
  `setChildren`, `setCurrentSelection`, `setCurrentMarks`, `setOperations`, or
  `setTargetRuntime`.
- Removed the `public-state` wildcard export from `packages/slate/src/core`.
- Added `slate/internal` as the explicit Slate-owned package bridge for
  `setEditorChildren`, `setEditorMarks`, `setEditorSelection`, and
  `setEditorTargetRuntime`.
- Updated `slate-react` and `slate-hyperscript` to import raw runtime setters
  from `slate/internal`, not root `slate`.
- Added a `slate` multi-entry build config and package export for
  `./internal`.
- Removed the generic `root.setChildren(...)` fallback from `utils/modify`.
- Added the matching TypeScript and Vitest aliases for `slate/internal`.

Commands run:

- `bun test ./packages/slate/test/surface-contract.ts --bail 1`
- `bun test ./packages/slate/test/surface-contract.ts ./packages/slate/test/accessor-transaction.test.ts ./packages/slate/test/editor-methods-contract.ts ./packages/slate/test/primitive-method-runtime-contract.ts ./packages/slate/test/transaction-target-runtime-contract.ts ./packages/slate-hyperscript/test/index.spec.ts --bail 1`
- `bun --filter slate build`
- `bun --filter slate typecheck`
- `bun --filter slate-react typecheck`
- `bun --filter slate-hyperscript typecheck`
- `bun lint:fix`
- `bun test:vitest`
- `bun check`

Evidence:

- The first surface-contract run failed because root `slate` still exported
  `setChildren`.
- Focused hard-cut tests pass: 70 pass, 0 fail.
- `slate` package build passes and emits the new internal subpath.
- Scoped typechecks pass for `slate`, `slate-react`, and
  `slate-hyperscript`.
- `bun check` passes: lint, package/site/root typecheck, Bun tests, and
  slate-react Vitest suite.

Decision:

- Root `slate` is now clean of raw state setters.
- `slate/internal` is a fenced Slate-owned bridge for sibling packages, not an
  app-author API.

Rejected tactics:

- Do not leave raw setters in the root barrel and rely on naming discipline.
- Do not use a broad `root.setChildren(...)` fallback in mutation utilities.
- Do not add the subpath without build and Vitest resolver proof.

Next action:

- Cut instance `editor.apply(op)` from the normal public write path.

### 2026-04-27: Item 4B Instance Apply Cut

Slice name: remove instance `editor.apply(op)` from the normal public write
path.

Owner classification: `packages/slate` public write boundary and operation
replay/import contract.

Actions taken:

- Added a surface contract proving editor instances do not expose `apply`.
- Removed `readonly apply` from `BaseEditor`.
- Removed the `createEditor` instance `apply` method and property descriptor.
- Kept `setBaseApply(...)` internal so operation middleware and
  `transaction.apply(...)` still dispatch through the core operation reducer.
- Updated `Editor.isEditor`, `Node.isEditor`, and `Element.isElement` detection
  so editor recognition no longer depends on an `apply` property.
- Updated operation and fixture tests to use `applyOperations(...)` for
  replay/import-style writes and `transaction.apply(...)` inside transaction
  tests.
- Updated legacy Element fixtures from the old fake `apply()` marker to the
  current `applyOperations()` editor shape.

Commands run:

- `bun test ./packages/slate/test/surface-contract.ts --bail 1`
- `bun test ./packages/slate/test/surface-contract.ts ./packages/slate/test/write-boundary-contract.ts ./packages/slate/test/apply-onchange-hard-cut-contract.ts ./packages/slate/test/operations-contract.ts ./packages/slate/test/read-update-contract.ts ./packages/slate/test/accessor-transaction.test.ts --bail 1`
- `bun --filter slate typecheck`
- `bun --filter slate-react typecheck`
- `bun --filter slate-hyperscript typecheck`
- `bun lint:fix`
- `bun --filter slate build`
- `bun test`
- `bun check`

Evidence:

- The first surface-contract run failed because editor instances still exposed
  `apply`.
- Focused apply-boundary tests pass: 37 pass, 0 fail.
- Scoped package typechecks pass for `slate`, `slate-react`, and
  `slate-hyperscript`.
- `slate` package build passes.
- Default Bun tests pass: 1050 pass, 95 skip, 0 fail.
- `bun check` passes: lint, package/site/root typecheck, Bun tests, and
  slate-react Vitest suite.

Decision:

- Single-operation app-facing writes are not an instance method.
- Replay/import uses `applyOperations(...)`.
- Transaction-owned single-operation writing stays `transaction.apply(...)`.

Rejected tactics:

- Do not keep a sealed-but-visible `editor.apply` method.
- Do not use `apply` as an editor-shape marker in node/element detection.
- Do not turn `applyOperations(...)` into a rejected primitive write; it is the
  explicit replay/import boundary.

Next action:

- Fence broad `getLiveNode`, `getLiveText`, and `getLiveSelection` accessors
  from ordinary app-facing API.

### 2026-04-27: Item 4C Live Read Fence

Slice name: fence broad `getLive*` reads from ordinary public API.

Owner classification: `packages/slate` public read surface and Slate-owned
runtime bridge.

Actions taken:

- Removed `getLiveNode`, `getLiveText`, and `getLiveSelection` from
  `BaseEditor`, `EditorInterface`, editor instances, and normal surface
  contracts.
- Added `getEditorLiveNode`, `getEditorLiveText`, and
  `getEditorLiveSelection` to the fenced `slate/internal` bridge.
- Updated `slate-react` and `slate-dom` runtime call sites to use the internal
  live-read aliases where immediate DOM/input authority requires live state.
- Updated public docs/examples/tests to use `Editor.getSelection(...)` or
  snapshot-style reads instead of `Editor.getLiveSelection(...)`.
- Rewrote the surface contract so root `slate`, editor instances, and
  `EditorInterface` all reject broad `getLive*` as ordinary app-facing API.

Commands run:

- `bun test ./packages/slate/test/surface-contract.ts --bail 1`
- `bun --filter slate typecheck`
- `bun --filter slate-react typecheck`
- `bun --filter slate-dom typecheck`
- `bun test ./packages/slate/test/surface-contract.ts ./packages/slate/test/write-boundary-contract.ts ./packages/slate/test/apply-onchange-hard-cut-contract.ts ./packages/slate/test/operations-contract.ts ./packages/slate/test/read-update-contract.ts ./packages/slate/test/accessor-transaction.test.ts --bail 1`
- `bun lint:fix`
- `bun --filter slate build`
- `bun check`

Evidence:

- Focused public-surface tests pass: 37 pass, 0 fail.
- Scoped typechecks pass for `slate`, `slate-react`, and `slate-dom`.
- `slate` package build passes with the `slate/internal` live-read bridge.
- `bun check` passes: lint, package/site/root typecheck, Bun tests, and
  slate-react Vitest suite.
- Grep over public docs/examples/tests has no user-facing
  `Editor.getLive*` teaching path; remaining raw `getLive*` names are core
  internals, internal bridge aliases, or negative public-surface assertions.

Decision:

- Normal app reads use snapshots, children, selection, and selector/runtime
  APIs.
- Broad live reads are runtime tools, not ordinary public DX.
- Runtime packages may keep internal live reads only where snapshot state can
  be stale for DOM/input ownership.

Rejected tactics:

- Do not keep live reads on editor instances as an advanced-looking but
  discoverable app API.
- Do not leave React/DOM runtime imports pointing at root `slate`.
- Do not teach `getLive*` in docs/examples while claiming it is fenced.

Next action:

- Inventory `<Slate onChange>`, `onValueChange`, and subscriber usage, then
  make the React adapter callback story one final public shape before the item
  5 alias deletion sweep.

### 2026-04-27: Item 4D React Adapter Callback Cut

Slice name: remove ambiguous `<Slate onChange>` and keep explicit adapter
callbacks.

Owner classification: `packages/slate-react` adapter callback surface and
public docs/examples.

Actions taken:

- Removed the `onChange` prop from `<Slate>`.
- Added `onSnapshotChange(snapshot, commit)` for integrations that need every
  committed editor snapshot from the React adapter.
- Kept `onValueChange(value)` for committed document changes.
- Kept `onSelectionChange(selection)` for committed selection changes.
- Updated mention-trigger example code to use `onSnapshotChange` because it
  derives UI from both selection and text.
- Updated saving docs to use `onValueChange` directly instead of filtering
  operations inside a broad callback.
- Updated Slate React component docs to document the current callback surface
  only.
- Fixed stale public docs that still taught `Editor.getLiveSelection(...)`.

Commands run:

- `bun --filter slate-react test:vitest -- editable-behavior react-editor-contract`
  - Red first after target test update because `onSnapshotChange` did not
    exist.
  - Green after implementation.
- `bun --filter slate-react typecheck`
- `cd site && bunx tsc --project tsconfig.json`
- `bun --filter slate-react test:vitest -- surface-contract editable-behavior react-editor-contract provider-hooks-contract`
- `bun lint:fix`
- `bun check`

Evidence:

- Focused React adapter tests pass: 17 pass, 0 fail across 4 files.
- `slate-react` typecheck passes.
- Site typecheck passes, proving examples no longer rely on the removed
  `<Slate onChange>` prop.
- `bun check` passes: lint, package/site/root typecheck, Bun tests, and
  slate-react Vitest suite.
- Grep has no public docs/examples teaching `<Slate onChange>` or
  `Editor.getLiveSelection(...)`; remaining `onChange` names are DOM form
  events, changelog text, or internal selector callback names.

Decision:

- The React adapter callback story is explicit:
  `onSnapshotChange` for every committed snapshot, `onValueChange` for document
  changes, and `onSelectionChange` for selection changes.
- No compatibility alias is kept for `<Slate onChange>`.
- Core editor state remains callback-free.

Rejected tactics:

- Do not keep `onChange` as a broad alias for all commits.
- Do not keep docs that tell users to filter operation lists just to save
  document changes.
- Do not hide the every-commit callback behind a value-shaped name.

Next action:

- Run item 5A alias/fallback inventory across public packages, docs, examples,
  and browser tests; delete unpublished wrong shapes instead of preserving them.

### 2026-04-27: Item 5 Public Alias And Fallback Cut

Slice name: delete unpublished compatibility aliases and add the fast guard.

Owner classification: public package exports, docs/examples, and
release-discipline contracts.

Actions taken:

- Ran the broad alias/fallback inventory over packages, docs, site examples,
  and Playwright rows.
- Deleted the public `SlateReactCompat` namespace export.
- Deleted the decorate compatibility adapter and its stale tests/docs.
- Deleted the `useEditor` alias and kept `useSlateStatic` as the single static
  editor hook.
- Renamed internal/browser trace reason values away from `compat` wording.
- Converted stale `editor.apply` docs/tests/fixtures to
  `applyOperations(...)` or operation replay/import language.
- Added `packages/slate/test/compat-alias-hard-cut-contract.ts` to keep
  deleted aliases out of public source, docs, and examples.
- Added `compat-alias-hard-cut-contract` to the release-discipline guard list
  and root `test:release-discipline` script.
- Updated the escape-hatch inventory ledger to the new measured counts after
  the public-surface cuts.

Commands run:

- `rg -n "deprecated|compat|legacy|fallback|alias|shim|migration|previously|old API|children.*spacer|spacer=.*children|renderElement.*children" packages docs site playwright ...`
- `rg -n "SlateReactCompat|useSlateSelector|VoidElement.*children|InlineVoidElement.*children|editor\\.apply|Editor\\.apply|setChildren|getLive" packages docs site playwright ...`
- `bun --filter slate-react test:vitest -- projections-and-selection-contract provider-hooks-contract surface-contract editable-behavior react-editor-contract with-react-contract editing-kernel-contract`
- `bun test ./packages/slate-browser/test/core/release-proof.test.ts ./packages/slate/test/interfaces-contract.ts ./packages/slate/test/surface-contract.ts ./packages/slate/test/apply-onchange-hard-cut-contract.ts --bail 1`
- `bun --filter slate-react typecheck`
- `bun --filter slate-browser typecheck`
- `bun --filter slate typecheck`
- `bun lint:fix`
- `bun --filter slate-react build`
- `bun --filter slate-browser build`
- `bun --filter slate build`
- `bun test ./packages/slate/test/compat-alias-hard-cut-contract.ts --bail 1`
- `bun test:release-discipline`
- `bun check`

Evidence:

- `compat-alias-hard-cut-contract` passes.
- `test:release-discipline` passes: 83 pass, 0 fail across 8 files.
- Focused `slate-react`, `slate-browser`, and `slate` tests/typechecks pass.
- Touched package builds pass; `slate-react` still has the known external
  `is-hotkey` warning.
- `bun check` passes: lint, package/site/root typecheck, Bun tests, and
  slate-react Vitest suite.
- Public alias grep has no `SlateReactCompat`, decorate compat adapter,
  `useEditor`, public `Editor.getLive*`, or public `<Slate onChange>` hits.

Decision:

- The item 4 public surface is now guarded by a fast item 5 static contract.
- Unpublished compatibility aliases are deleted instead of deprecated.
- Browser/projection tests cover the surviving typed projection API, not the
  deleted callback adapter.

Rejected tactics:

- Do not keep `SlateReactCompat` as a "temporary" namespace.
- Do not keep a decorate compatibility adapter beside typed projection sources.
- Do not leave `useEditor` as a deprecated alias.
- Do not rely on grep notes in this plan without a release-discipline test.

Next action:

- Expand generated `slate-browser` operation-family contracts and replay
  artifacts for the reported browser regression families while keeping stress
  out of default `bun check`.

### 2026-04-27: Item 6 Generated Browser Contract Closure

Slice name: make reported browser regression families generated, replayable,
and release-proof without slowing default `bun check`.

Owner classification: `slate-browser` operation-family contracts, React
runtime projection/render ownership, and static-site browser proof.

Actions taken:

- Added generated operation-family stress contracts for inline void navigation,
  block void navigation, table-cell boundary navigation, external decoration
  refresh, mouse-selection toolbar, paste/normalize/undo, and IME repair.
- Added replay artifacts and reduction metadata for generated stress rows.
- Kept stress coverage opt-in through `test:stress` and out of default
  `bun check`.
- Hardened clipboard fallback for denied browser clipboard writes by routing
  paste through the editor browser handle instead of a fake paste event.
- Fixed synthetic shortcut replay for explicit `Control`/`Meta` shortcuts so
  generated undo rows exercise Slate-owned history instead of browser-native
  DOM undo.
- Kept generic runtime selector hooks model-correct, while mounted editor
  text/block renderers opt out of rerendering after directly synced text-only
  commits.
- Avoided broad React force renders for text-only history commits already
  handled by direct DOM text sync.

Commands run:

- `bun --filter slate-browser typecheck`
- `bun --filter slate-browser build`
- `bun --filter slate-react typecheck`
- `bun --filter slate-react build`
- `bun --filter slate-react test:vitest -- provider-hooks-contract projections-and-selection-contract`
- `bun build:next`
- `PLAYWRIGHT_BASE_URL=http://localhost:3101 PLAYWRIGHT_RETRIES=0 STRESS_ROUTES=plaintext STRESS_FAMILIES=paste-normalize-undo bunx playwright test playwright/stress/generated-editing.test.ts --project=mobile --reporter=line`
- `bun lint:fix`
- `bun check`
- `bun check:full`

Evidence:

- Focused mobile plaintext paste/normalize/undo stress row passes.
- Provider hook contracts still prove public runtime selectors report model
  text changes.
- Projection contracts still pass after force-refresh and selector changes.
- `bun check` passes.
- `bun check:full` passes: release discipline, slate-browser proof contracts,
  scoped mobile proof guard, persistent-profile soak, and 628 Playwright rows
  passed with 4 skipped replay-placeholder rows.

Decision:

- Items 4, 5, and 6 are complete for this hard-cut lane.
- The safety net is no longer example-specific patches only; the reported
  regression families now have generated browser contracts.
- Default CI stays fast; release/full proof owns the slow browser sweep.

Rejected tactics:

- Do not make generic `useNodeSelector` / `useTextSelector` stale for app code
  just to save render work in mounted editor internals.
- Do not replay mobile undo through browser-native contenteditable history when
  the contract is Slate-owned operation history.
- Do not restore Android character-data mutations broadly; direct DOM text sync
  already owns text-only commits.

### 2026-04-27: Start Phase 0

Slice name: continuation prompt and first instrumentation owner.

Owner classification: Phase 0 browser/runtime proof infrastructure.

Actions taken:

- Generated `tmp/continue.md` from this active plan.
- Set `tmp/completion-check.md` to `pending`.
- Started execution instead of stopping at prompt generation.

Current hypothesis:

- The fastest honest tracer is not a public API change. It is a small render
  and state proof harness around current examples, then runtime-owned shell
  fixes against the first failing canary.

Rejected tactics:

- Do not start with `defineElement`.
- Do not patch one example's markup without render/state proof.
- Do not add the slow stress matrix to default `bun check`.

Next action:

- Inspect existing `../slate-v2` Playwright/stress and `slate-browser` helpers,
  then add the first focused canary/instrumentation slice for image void layout
  and keyboard navigation.

### 2026-04-27: Phase 0 Baseline Canary Sweep

Slice name: reported-regression canary baseline.

Owner classification: browser proof infrastructure and server freshness.

Actions taken:

- Read existing `../slate-v2` Playwright integration examples and stress
  helpers.
- Ran focused canaries for embeds, hovering toolbar, images, mentions,
  search-highlighting, and tables.
- Investigated a red cluster before changing code.

Commands run:

- `bunx playwright test playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line`
  - Result against reused Playwright server `3101`: 10 failed, 14 passed.
  - Failure cluster matched reported families, but this server was stale.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line`
  - Result against live dev server `3100`: 24 passed.

Evidence:

- Direct browser probe on `3100` showed image ArrowRight moves from
  `[0,0]@113` to `[1,0]@0`.
- The focused canary suite is already present and green on the live dev server.
- The red `3101` run is not trustworthy for product behavior because the
  Playwright config reused an existing server.

Decision:

- Do not patch image/embed/mention/table/search/toolbar behavior from the
  stale `3101` red run.
- Continue Phase 0 with render-count/state instrumentation and make future
  canary runs pin `PLAYWRIGHT_BASE_URL=http://localhost:3100` during local dev
  browser work.

Rejected tactics:

- Do not change `Editor.positions` from the stale server failures; the core
  block-void movement contract already passes.
- Do not treat a reused Playwright server as source truth when the user-facing
  dev server disagrees.

Next action:

- Add render-count/state proof instrumentation around the existing canaries so
  green behavior also proves narrow React projection and stable focus/selection
  ownership.

### 2026-04-27: Phase 0 Render Profiler Tracer

Slice name: internal render profiler and first browser render-budget canary.

Owner classification: `slate-react` render projection instrumentation plus
`slate-browser` Playwright proof helper.

Files changed:

- `../slate-v2/packages/slate-react/src/render-profiler.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/components/slate-element.tsx`
- `../slate-v2/packages/slate-react/src/components/slate-leaf.tsx`
- `../slate-v2/packages/slate-react/src/components/slate-spacer.tsx`
- `../slate-v2/packages/slate-react/src/components/slate-text.tsx`
- `../slate-v2/packages/slate-react/src/components/void-element.tsx`
- `../slate-v2/packages/slate-react/test/render-profiler-contract.test.tsx`
- `../slate-v2/packages/slate-browser/src/playwright/index.ts`
- `../slate-v2/playwright/integration/examples/search-highlighting.test.ts`

Actions taken:

- Added a private `slate-react` render profiler that is a no-op unless
  `globalThis.__SLATE_REACT_RENDER_PROFILER__` is installed.
- Instrumented editable root, element, text, leaf, spacer, and void primitive
  render paths.
- Added a focused `slate-react` contract test proving absent-profiler no-op
  behavior and installed-profiler primitive counts.
- Added `slate-browser/playwright` helpers to install, reset, and snapshot the
  profiler before a page loads.
- Added a combined `takeSlateBrowserRenderStateSnapshot(...)` helper that
  returns the editor snapshot and render counts as one browser proof artifact.
- Upgraded the search-highlighting focus canary to assert that typing in the
  search input preserves focus, decorates text, and does not rerender the
  editable root, element shells, or void shells.

Commands run:

- `bun --filter slate-react test:vitest -- render-profiler-contract`
  - First run: red on missing `../src/render-profiler`, as intended.
  - Final run: 2 tests passed.
- `bun --filter slate-react typecheck`
  - Result: passed.
- `bun --filter slate-browser typecheck`
  - Result: passed.
- `bun --filter slate-browser build`
  - Result: passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/search-highlighting.test.ts --project=chromium --reporter=line`
  - Result: 2 passed.
- `bun lint:fix`
  - Result after final edits: no fixes applied.

Evidence:

- The render profiler has zero app-visible behavior when not installed.
- The live `3100` search-highlighting canary proves the user-reported focus
  regression stays covered while also enforcing a narrow render budget for the
  decoration refresh path.
- The search canary now captures focus owner and render counts through one
  `slate-browser` helper, which is the reusable shape for the other examples.
- The Playwright helper records render counts in the browser without making
  `slate-browser` import private `slate-react` modules.

Rejected tactics:

- Do not expose the profiler as public API.
- Do not count React test double-renders as production browser truth.
- Do not use a green focus assertion alone as proof that decoration updates are
  architecturally scoped.

Remaining risks:

- The combined snapshot does not yet include selected runtime ids or a compact
  selected-shell summary.
- Only search-highlighting has a render-budget canary so far.

Next action:

- Extend the proof helper to emit one combined browser snapshot, then add
  render/state budget assertions to images, embeds, mentions, tables, and
  hovering-toolbar canaries.

### 2026-04-27: Phase 0 Image Navigation Render Budget

Slice name: image void horizontal navigation render/state budget.

Owner classification: image void browser navigation proof.

Files changed:

- `../slate-v2/playwright/integration/examples/images.test.ts`

Actions taken:

- Installed the render profiler before the images example loads.
- Added combined render/state snapshots to the horizontal image navigation
  canary.
- Asserted model selection, focus owner, DOM selection target, and render budget
  after moving into and out of the image void.

Commands run:

- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/images.test.ts --project=chromium --reporter=line -g "moves horizontally"`
  - First run: failed because the test expected at least one render.
  - Finding: ArrowRight into the image produced zero React renders.
  - Final run: 1 passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/images.test.ts playwright/integration/examples/search-highlighting.test.ts --project=chromium --reporter=line`
  - Result: 9 passed.
- `bun lint:fix`
  - Result: no fixes applied.
- `bun typecheck`
  - Result: passed.

Evidence:

- Horizontal navigation into the image void and out to the next block both keep
  model and DOM selection synchronized.
- The first two horizontal void crossings require zero React renders in the
  measured live browser path.
- The existing image spacer layout, vertical movement, delete, and shift-select
  rows remain green with the profiler installed.

Rejected tactics:

- Do not enforce "some render happened" as a proof of instrumentation. For this
  path, zero renders is the better architecture.

Remaining risks:

- Vertical image movement and shift selection are still behavior-only rows; they
  do not yet assert render budgets.
- Mentions, tables, embeds, and hovering-toolbar still need render/state budget
  assertions.

Next action:

- Add render/state budget assertions to tables and mentions navigation, then
  cover hovering-toolbar and embeds.

### 2026-04-27: Phase 0 Reported-Family Render Budget Sweep

Slice name: render/state budget coverage for all reported regression families.

Owner classification: browser proof infrastructure and focused regression
canaries.

Files changed:

- `../slate-v2/playwright/integration/examples/embeds.test.ts`
- `../slate-v2/playwright/integration/examples/hovering-toolbar.test.ts`
- `../slate-v2/playwright/integration/examples/mentions.test.ts`
- `../slate-v2/playwright/integration/examples/tables.test.ts`

Actions taken:

- Added render profiler installation to embeds, hovering-toolbar, mentions, and
  tables example tests.
- Added combined render/state snapshots to:
  - table ArrowRight from first empty cell
  - mentions inline void navigation from both sides
  - hovering toolbar real mouse selection
  - embed void horizontal navigation
- Asserted no editable-root rerender on table, mentions, hovering-toolbar, and
  embed canary paths.
- Asserted zero total React renders for table cell ArrowRight and embed void
  horizontal crossings.

Commands run:

- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/tables.test.ts --project=chromium --reporter=line -g "moves right"`
  - Result: 1 passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts --project=chromium --reporter=line -g "arrow keys|moves right"`
  - Result: 2 passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts --project=chromium --reporter=line`
  - Result: 9 passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line -g "real mouse|moves from"`
  - Result: 2 passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line`
  - Result: 6 passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line`
  - Result: 24 passed.
- `bun --filter slate-react test:vitest -- render-profiler-contract`
  - Result: 2 passed.
- `bun typecheck`
  - Result: passed.
- `bun lint:fix`
  - Result: no fixes applied.

Evidence:

- Search-highlighting preserves search input focus, renders highlights, and
  does not rerender editable root, element shells, or void shells.
- Image horizontal void navigation keeps model/DOM selection synchronized and
  produces zero React renders while crossing into and out of the image.
- Table ArrowRight from the first empty cell lands at second cell offset `0`,
  keeps DOM offset `0`, and produces zero React renders.
- Mentions inline void navigation from both sides keeps the editable root from
  rerendering.
- Real mouse selection shows the hovering toolbar and keeps the editable root
  from rerendering.
- Embed void navigation keeps model/DOM selection synchronized and produces
  zero React renders while crossing into and out of the embed.

Rejected tactics:

- Do not make a slow stress matrix the default proof for these examples.
- Do not accept focus/selection behavior alone as the performance proof.

Remaining risks:

- The combined snapshot still lacks selected runtime-id summaries.
- Vertical image movement and shift-selection have behavior coverage but not
  render-count assertions.
- Phase 1 runtime ownership mapping has not started.

Next action:

- Add selected runtime-id/shell summary to the combined snapshot helper, then
  start Phase 1 ownership mapping from `editable.tsx`, primitives, projection
  store, widget store, and annotation store.

### 2026-04-27: Phase 0 Selected Shell Snapshot

Slice name: selected runtime-id and shell summary proof.

Owner classification: browser proof metadata and React DOM binding.

Files changed:

- `../slate-v2/packages/slate-react/src/hooks/use-slate-node-ref.tsx`
- `../slate-v2/packages/slate-browser/src/playwright/index.ts`
- `../slate-v2/playwright/integration/examples/embeds.test.ts`
- `../slate-v2/playwright/integration/examples/images.test.ts`
- `../slate-v2/playwright/integration/examples/mentions.test.ts`
- `../slate-v2/playwright/integration/examples/tables.test.ts`

Actions taken:

- Added internal `data-slate-runtime-id` DOM binding beside the existing
  `data-slate-path` binding.
- Extended `takeSlateBrowserRenderStateSnapshot(...)` with
  `selectionShells`, including anchor/focus node shell, nearest element shell,
  and involved runtime ids.
- Made shell snapshot lookup prefer the live DOM selection and fall back to
  model path lookup. The first path-only attempt failed on shell-backed
  selections, which is exactly why this helper should exist.
- Added selected-shell assertions to image, embed, table, and mention canaries.

Commands run:

- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/images.test.ts playwright/integration/examples/embeds.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/mentions.test.ts --project=chromium --reporter=line -g "moves horizontally|moves from|moves right|arrow keys"`
  - First run: failed because model-path lookup alone missed shell-backed DOM
    selections.
  - Final run: 4 passed.
- `bun --filter slate-browser typecheck`
  - Result: passed.
- `bun --filter slate-browser build`
  - Result: passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line`
  - Result: 24 passed.
- `bun --filter slate-react test:vitest -- render-profiler-contract`
  - Result: 2 passed after formatting.
- `bun typecheck`
  - Result: passed after formatting.
- `bun lint:fix`
  - Result after final run: no fixes applied.

Evidence:

- Image and embed void selections now prove selected text shell path/runtime id
  plus nearest void element shell path.
- Table ArrowRight now proves the selected text shell path/runtime id and cell
  element shell path, while preserving offset `0`.
- Mention inline void navigation now proves selected shell metadata on both
  sides of inline void movement.
- The helper exposed a real proof gap: model-path shell lookup is insufficient
  for shell-backed selections unless it checks live DOM selection too.

Rejected tactics:

- Do not infer selected shell identity from the model path alone.
- Do not treat `data-slate-path` as enough browser proof when runtime ids are
  the future subscription key.

Remaining risks:

- Phase 1 ownership mapping has not yet been written.
- Runtime-owned shell construction is still not centralized; this slice only
  made the current shell identity measurable.

Next action:

- Start Phase 1 ownership mapping from code: selection, mutation repair,
  composition, shell DOM, decorations, widgets, annotations, and void spacers.

### 2026-04-27: Phase 1 Ownership Map And Shell Runtime Tracer

Slice name: ownership map plus first shell-runtime extraction.

Owner classification: shell DOM ownership.

Files changed:

- `../slate-v2/packages/slate-react/src/shell-runtime.ts`
- `../slate-v2/packages/slate-react/src/components/slate-element.tsx`
- `../slate-v2/packages/slate-react/src/components/slate-leaf.tsx`
- `../slate-v2/packages/slate-react/src/components/slate-spacer.tsx`
- `../slate-v2/packages/slate-react/src/components/slate-text.tsx`
- `../slate-v2/packages/slate-react/test/shell-runtime-contract.test.tsx`

Actions taken:

- Mapped current runtime ownership in Phase 1:
  - `editable.tsx` currently owns too much event, selection, repair,
    composition, and trace orchestration.
  - `projection-store.ts`, `annotation-store.ts`, and `widget-store.ts` are
    already closer to the desired external-store shape.
  - primitive shell DOM attrs are still scattered through React components.
- Added the first internal `shell-runtime.ts` helper for primitive shell attrs:
  element, text, leaf, and spacer.
- Switched primitive components to use shell-runtime helpers without changing
  public exports.
- Added a focused shell-runtime contract test.
- Attempted editor-root shell attr extraction, then rejected it because the
  live render-budget canaries started recording editable-root renders across
  selection-driven paths.

Commands run:

- `bun --filter slate-react test:vitest -- shell-runtime-contract`
  - First run: red on missing `../src/shell-runtime`, as intended.
- `bun --filter slate-react test:vitest -- shell-runtime-contract primitives-contract render-profiler-contract`
  - Result after formatting: 3 files passed, 12 tests passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line`
  - First run after shell-runtime extraction: 23 passed, 1 failed.
  - Failure: image canary expected zero total renders, but selecting the image
    correctly rerendered only the selected image element and spacer.
  - Second run after root-attr extraction: 18 passed, 6 failed because
    editable-root renders appeared in selection-driven rows.
  - Final run: 24 passed.
- `bun typecheck`
  - Result after formatting: passed.
- `bun lint:fix`
  - Result after final run: no fixes applied.

Evidence:

- Primitive shell attrs now have one internal owner while preserving DOM output.
- Reported-regression canaries remain green after the first shell-runtime
  extraction.
- The image render-budget correction is important: examples that render
  selection UI with `useSelected`/`useFocused` should allow selected shell
  rerender, but still forbid editable-root or broad tree rerender.
- Current measured selection-driven rows still allow bounded editable-root
  renders:
  - embed/image/table: at most 1 editable-root render
  - mentions/hovering-toolbar: at most 2 editable-root renders
  - search typing after setup: editable-root render budget remains 0
- This is not the final architecture bar. It is a quantified debt marker that
  Phase 2/3 must reduce with commit facts and selector-owned projection.

Rejected tactics:

- Do not claim total-zero renders for selected UI nodes. That is fake rigor.
- Do not jump into selection-runtime extraction before shell attrs have an
  internal owner.
- Do not move editor-root attrs into `shell-runtime` by simple object spreading
  unless render-budget canaries stay green. The first attempt did not.

Remaining risks:

- Editor root attrs are still assembled in `EditableDOMRoot`.
- `VoidElement` still exposes spacer placement through component convention.
- Selection, repair, composition, and event runtimes are still embedded in
  `EditableDOMRoot`.

Next action:

- Design the API-neutral path for runtime-owned void spacer placement.
- Treat editable-root renders on selection-driven paths as active Phase 2/3
  performance debt, not as accepted final behavior.

### 2026-04-27: Phase 1 Void Spacer Children Slot

Slice name: API-neutral void spacer ownership step.

Owner classification: shell DOM ownership and void spacer DX.

Current-state correction:

- This was an intermediate slice, not the current `VoidElement` API.
- The current API no longer accepts normal `children` or `spacer` props on
  `VoidElement`; see `Runtime-Owned VoidElement Spacer Children` below.
- Do not use this section as current implementation guidance.

Files changed:

- `../slate-v2/packages/slate-react/src/shell-runtime.ts`
- `../slate-v2/packages/slate-react/src/components/void-element.tsx`
- `../slate-v2/packages/slate-react/test/shell-runtime-contract.test.tsx`
- `../slate-v2/packages/slate-react/test/primitives-contract.tsx`
- `../slate-v2/packages/slate-react/test/render-profiler-contract.test.tsx`
- `../slate-v2/site/examples/ts/images.tsx`
- `../slate-v2/site/examples/ts/embeds.tsx`
- `../slate-v2/site/examples/ts/paste-html.tsx`
- `docs/solutions/developer-experience/2026-04-27-slate-react-void-renderers-should-not-own-hidden-spacer-children.md`
- `../slate-v2/playwright/integration/examples/images.test.ts`

Actions taken:

- Added `resolveSlateVoidSpacerChildren(...)` to the internal shell runtime.
- Changed `VoidElement` so normal `children` populate the hidden spacer slot.
- Kept `spacer` as an optional advanced escape hatch that overrides
  `children`.
- Migrated current image, embed, paste-html, primitive, and profiler examples
  away from `spacer={children}`.
- Tightened the image canary around the measured selected-shell render shape:
  editable root, void wrapper, selected element, and spacer are each allowed at
  most one render while total stays at most four.

Commands run:

- `PLAYWRIGHT_BASE_URL=http://localhost:3100 bun -e "...takeSlateBrowserRenderStateSnapshot..."`
  - Result: image ArrowRight into and out of the void records exactly
    editable + void + selected element + spacer render events.
- `bun --filter slate-react test:vitest -- shell-runtime-contract primitives-contract render-profiler-contract`
  - Result: 3 files passed, 13 tests passed.
- `bun lint:fix`
  - Result: no fixes applied.
- `bun typecheck`
  - Result: passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line`
  - Result: 24 passed.

Evidence:

- `VoidElement` no longer makes normal callers spell the hidden spacer slot as
  `spacer={children}`.
- The advanced `spacer` prop still works for callers that need to override the
  hidden anchor content explicitly.
- The live `3100` reported-regression browser set remains green after the
  void-spacer DX change.
- The image render-budget change is evidence-backed: the extra render event is
  the selected `VoidElement` wrapper itself, not a broad editor-tree rerender.

Rejected tactics:

- Do not fake completion by marking `tmp/completion-check.md` done while
  selector-owned projection work remains.
- Do not overfit the image budget back to total three after moving spacer
  placement into `VoidElement`; that undercounts the wrapper the profiler now
  measures.
- Do not start public API redesign yet. This slice is still an internal
  compatibility step.

Remaining risks:

- App authors still pass `{children}` to `VoidElement`; the next DX step is a
  runtime-owned visible-content API where normal void renderers never see the
  hidden anchor at all.
- Editor-root renders still appear on some selection-driven paths. Phase 2/3
  must reduce that with commit facts and selector-owned projection.

Next action:

- Start Phase 2 by deriving commit facts and selection-impact runtime ids that
  let selection movement update selected shells without rerendering the
  editable root.

### 2026-04-27: Phase 2 Selection Sync Without Editable Root Renders

Slice name: selector-owned selection sync tracer.

Owner classification: selection projection and editable-root render budget.

Files changed:

- `../slate-v2/packages/slate-react/src/editable/caret-engine.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/hooks/use-slate-selector.tsx`
- `../slate-v2/packages/slate-react/dist/index.js`
- `../slate-v2/playwright/integration/examples/images.test.ts`
- `../slate-v2/playwright/integration/examples/embeds.test.ts`
- `../slate-v2/playwright/integration/examples/mentions.test.ts`
- `../slate-v2/playwright/integration/examples/tables.test.ts`
- `../slate-v2/playwright/integration/examples/hovering-toolbar.test.ts`

Actions taken:

- Tightened the image horizontal navigation canary to require zero
  editable-root renders.
- Confirmed the RED: ArrowRight into the image still rendered the editable root
  once.
- Removed `forceRender` from model-owned caret `sync-selection` repair.
- Updated the editable-root selector filter so plain `set_selection` operations
  do not invalidate `EditableDOMRoot`.
- Added microtask flushing for deferred selector listeners so `useSelected`
  updates selected shells without relying on an editable-root render as the
  flush trigger.
- Rebuilt `slate-react` dist because the local examples load the package
  artifact.
- Tightened image, embed, mention, table, and hovering-toolbar reported
  canaries to assert zero editable-root renders where the measured path now
  supports it.

Commands run:

- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/images.test.ts --project=chromium --reporter=line -g "moves horizontally"`
  - RED before implementation: expected editable renders `0`, received `1`.
  - GREEN after implementation and `slate-react` build: 1 passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 bun -e "...takeSlateBrowserRenderStateSnapshot..."`
  - Result: embed, table, mention, and hovering-toolbar selection rows all
    record zero React render events after the selector-owned selection sync
    change.
- `bun --filter slate-react build`
  - Result: passed; warning kept `is-hotkey` external.
- `bun --filter slate-react test:vitest -- use-selected surface-contract provider-hooks-contract shell-runtime-contract primitives-contract render-profiler-contract`
  - Result: 6 files passed, 24 tests passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line`
  - Result after tightened budgets: 24 passed.
- `bun lint:fix`
  - Result: no fixes applied.
- `bun typecheck`
  - Result: passed.

Evidence:

- Model-owned horizontal caret movement no longer needs editable-root renders
  to sync DOM selection and selected-shell UI.
- Deferred `useSelected` listeners can flush independently of
  `EditableDOMRoot`.
- Reported selection/navigation canaries now prove zero editable-root renders
  for image, embed, mention, table, and hovering-toolbar paths.
- Search typing already had an editable-root render budget of zero and remains
  covered in the same canary set.

Rejected tactics:

- Do not keep the editable-root render as the deferred selector flush
  mechanism. That was the performance bug.
- Do not trust browser canaries after changing `slate-react` source without
  rebuilding `dist`; the examples import the package artifact.
- Do not broaden this into public API work yet.

Remaining risks:

- Commit facts still need explicit selection-impact runtime ids instead of
  relying on selector recomputation plus equality checks.
- Normal void renderers still receive `{children}`. The full DX target remains:
  app authors render visible void content only, while the runtime owns hidden
  anchors/spacers.
- `EditableDOMRoot` still owns too much event, selection, repair, and
  composition orchestration.

Next action:

- Add explicit selection-impact runtime-id facts to the runtime/commit layer
  and wire selected shell subscriptions toward those facts instead of broad
  selector wakeups.

### 2026-04-27: Phase 2 Selection-Impact Runtime Facts

Slice name: commit-owned selection-impact runtime ids.

Owner classification: core commit facts plus selected-shell subscription
filtering.

Files changed:

- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/packages/slate-react/src/components/slate.tsx`
- `../slate-v2/packages/slate-react/src/hooks/use-selected.ts`
- `../slate-v2/packages/slate-react/src/hooks/use-slate-selector.tsx`
- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`

Actions taken:

- Added `selectionImpactRuntimeIds` to core commit output.
- Added core selection-impact calculation over old/new selection shells,
  including paths inside expanded selections.
- Passed commit facts through the `slate-react` selector bridge.
- Changed `useSelected` so selected-shell listeners wake only when their
  runtime id is in the commit impact set, while replace/unknown commits still
  take the conservative path.
- Added core and React contract tests for selection-only dirtiness and commit
  fact delivery to selector `shouldUpdate`.
- Fixed a typecheck bug by making selection-impact helpers accept both snapshot
  indexes and live runtime indexes without casting.

Commands run:

- `bun test ./packages/slate/test/snapshot-contract.ts -t "publishes selection-only dirtiness"`
  - RED before implementation: `selectionImpactRuntimeIds` was missing.
  - GREEN after implementation: 1 passed.
- `bun --filter slate-react test:vitest -- provider-hooks-contract use-selected surface-contract`
  - RED while expanded selection impact only looked at endpoints.
  - GREEN after including indexed paths covered by the range: 3 files passed,
    12 tests passed.
- `bun lint:fix`
  - First run: fixed 1 file.
  - Final run: no fixes applied.
- `bun typecheck`
  - First run: failed because live runtime indexes use `Map` while snapshot
    indexes use records.
  - Final run: passed across packages, site, and root.
- `bun --filter ./packages/slate build && bun --filter slate-react build`
  - Result: passed; `slate-react` still warns that `is-hotkey` is external.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line`
  - Result: 24 passed.

Evidence:

- Selection-only commits now publish an explicit old/new selected shell impact
  set while keeping `touchedRuntimeIds` empty.
- `useSelected` no longer has to recompute and compare for every selected-shell
  subscriber on every selection-only commit.
- Expanded selections update middle selected shells because the impact set
  includes indexed paths covered by the selected range.
- The reported browser regression suite still passes with zero editable-root
  render assertions on the tightened selection/navigation paths.

Rejected tactics:

- Do not cast live indexes to snapshot indexes; the helper needs the real
  dual-shape contract.
- Do not restrict selection impact to anchor/focus endpoints; `useSelected`
  must work for elements inside expanded selections.
- Do not mark the plan done after this slice. Phase 2 still needs
  decoration/source impact facts, and Phase 3 still needs the broader
  projection store cleanup.

Remaining risks:

- Decoration impact is still weaker than the selection-impact path.
- Projection subscriptions are narrower for `useSelected`, but the general
  node/text/decoration selector API is not yet complete.
- `EditableDOMRoot` still owns event, selection, repair, and composition
  orchestration that belongs behind internal runtime controllers.

Next action:

- Continue Phase 2 with decoration/source impact facts, then move into Phase 3
  granular projection subscriptions by runtime id and source key.

### 2026-04-27: Phase 2 Decoration Facts And Runtime Projection Subscriptions

Slice name: decoration-impact commit facts plus runtime-id projection
subscriptions.

Owner classification: core decoration impact facts and first Phase 3 projection
fanout cut.

Files changed:

- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/packages/slate-react/src/hooks/use-slate-projections.tsx`
- `../slate-v2/packages/slate-react/src/projection-store.ts`
- `../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`

Actions taken:

- Added `decorationImpactRuntimeIds` to core commit output.
- Made text commits publish dirty decoration runtime ids for the changed text
  path and ancestor shell path.
- Made selection commits reuse the explicit selection impact set for
  selection-dependent decoration sources.
- Kept replace and structural commits conservative with `null` broad
  invalidation.
- Added projection-store runtime-id subscriptions.
- Changed `useSlateProjections(runtimeId)` to subscribe to that runtime id
  instead of the whole projection snapshot when the store supports it.
- Added a React contract proving a projection change for runtime id B does not
  rerender a hook subscriber for runtime id A.

Commands run:

- `bun test ./packages/slate/test/snapshot-contract.ts -t "publishes touched runtime ids|publishes selection-only dirtiness|publishes replace-level broad invalidation"`
  - RED before implementation: `decorationImpactRuntimeIds` was missing.
  - GREEN after implementation: 3 passed.
- `bun --filter slate-react test:vitest -- projections-and-selection-contract -t "notifies only subscribers"`
  - RED before implementation: first runtime-id subscriber rendered twice.
  - GREEN after runtime-id subscriptions: 1 passed.
- `bun --filter slate-react test:vitest -- projections-and-selection-contract provider-hooks-contract use-selected surface-contract`
  - Result: 4 files passed, 19 tests passed.
- `bun lint:fix`
  - Result: passed after removing an obsolete empty snapshot helper.
- `bun typecheck`
  - First run caught a readonly helper return mismatch and a generic empty
    projection snapshot mismatch.
  - Final run: passed across packages, site, and root.
- `bun --filter ./packages/slate build && bun --filter slate-react build`
  - Result: passed; `slate-react` still warns that `is-hotkey` is external.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line`
  - Result: 24 passed.

Evidence:

- Core commit facts now distinguish selection impact from decoration impact.
- Text commits carry enough runtime ids for decoration projection to target the
  changed text and its ancestor shell.
- Runtime-id projection subscribers no longer rerender when a different runtime
  id's projection slices change.
- The reported browser canary suite remains green after rebuilding package
  output for the dev app.

Rejected tactics:

- Do not make structural decoration impact look precise yet. Path shifts and
  ancestor-dependent decoration sources still need broad invalidation until
  source-key contracts are stronger.
- Do not rely only on commit facts while `useSlateProjections` still subscribes
  to the whole snapshot. The store fanout had to be cut too.
- Do not call this projection closure. Source recompute filtering is still
  broad.

Remaining risks:

- Projection sources still recompute as a whole once their dirtiness class says
  dirty.
- Source-key invalidation is not yet encoded, so multiple projection sources
  cannot be independently budgeted.
- The public projection-store API now has runtime-id subscription methods;
  source-key APIs still need a cleaner final shape before public DX work.

Next action:

- Continue Phase 3 by adding source-key recompute filtering so decoration
  sources can skip recompute when `decorationImpactRuntimeIds` proves their
  runtime ids are unaffected.

### 2026-04-27: Phase 3 Source Runtime-Scope Filtering

Slice name: projection source runtime-scope recompute guard.

Owner classification: Phase 3 source recompute filtering.

Files changed:

- `../slate-v2/packages/slate-react/src/projection-store.ts`
- `../slate-v2/packages/slate-react/src/index.ts`
- `../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`

Actions taken:

- Added `SlateProjectionRuntimeScope`.
- Added `runtimeScope` to projection-store options.
- Used `change.decorationImpactRuntimeIds` to skip source recompute when a
  text/selection commit misses the source runtime scope.
- Kept broad recompute for unknown changes, replace commits, structural commits,
  external refreshes, and sources without a declared scope.
- Added a contract proving a source scoped to runtime id A does not recompute
  when only runtime id B changes, but recomputes when A changes.

Commands run:

- `bun --filter slate-react test:vitest -- projections-and-selection-contract -t "skips source recompute"`
  - RED before implementation: source called twice after unrelated runtime id
    changed.
  - GREEN after implementation: 1 passed.
- `bun test ./packages/slate/test/snapshot-contract.ts -t "publishes touched runtime ids|publishes selection-only dirtiness|publishes replace-level broad invalidation"`
  - Result: 3 passed.
- `bun --filter slate-react test:vitest -- projections-and-selection-contract provider-hooks-contract use-selected surface-contract`
  - Result: 4 files passed, 20 tests passed.
- `bun lint:fix`
  - Result: passed after formatting one file.
- `bun typecheck`
  - Result: passed across packages, site, and root.
- `bun --filter ./packages/slate build && bun --filter slate-react build`
  - Result: passed; `slate-react` still warns that `is-hotkey` is external.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line`
  - Result: 24 passed.

Evidence:

- Projection sources now have a principled opt-in scope instead of guessing from
  current projected slices.
- Runtime-id hook fanout and source recompute filtering are separate controls:
  one avoids rerendering unrelated subscribers, the other avoids calling the
  source at all.
- Conservative broad invalidation remains for structural changes where path
  shifts can change future coverage.

Rejected tactics:

- Do not infer source scope from current projection output. A source can start
  decorating previously undecorated text after a text edit.
- Do not skip recompute for structural commits yet; path movement and ancestor
  predicates still make that unsafe.

Remaining risks:

- Existing app sources do not automatically provide `runtimeScope`.
- Legacy decorate compatibility still scans all nodes unless the caller supplies
  a scoped source.
- Phase 3 still needs the final selector API shape for node, text, decoration,
  and source-key subscriptions.

Next action:

- Apply `runtimeScope` to a real projection source path, starting with
  search-highlighting or legacy decorate compatibility, and prove the browser
  focus/render canary still holds.

### 2026-04-27: Phase 3 Real Projection Source Scoping

Slice name: scoped projection sources in live examples.

Owner classification: Phase 3 real source adoption and browser proof.

Files changed:

- `../slate-v2/site/examples/ts/search-highlighting.tsx`
- `../slate-v2/site/examples/ts/code-highlighting.tsx`

Actions taken:

- Added all-text runtime scope to the search-highlighting projection source.
- Added code-text runtime scope to the code-highlighting projection source.
- Kept search external refresh broad, because changing the search input can
  affect every text match.
- Let code-highlighting skip Prism recompute for text edits outside code-line
  runtime ids.

Commands run:

- `bun lint:fix`
  - Result: formatted the two example files.
- `bun --filter slate-react test:vitest -- projections-and-selection-contract provider-hooks-contract use-selected surface-contract`
  - Result before example wiring: 4 files passed, 20 tests passed.
- `bun typecheck`
  - Result: passed across packages, site, and root.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/code-highlighting.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line`
  - Result: 26 passed.

Evidence:

- Search-highlighting still preserves input focus and render budget on the
  reported path.
- Code-highlighting still renders semantic token projections and preserves
  code-line Enter behavior after runtime scoping.
- Real examples now exercise the `runtimeScope` option instead of leaving it as
  only a contract-test hook.

Rejected tactics:

- Do not narrow search input refresh. The search string is external app state
  and can change matches anywhere.
- Do not make code-highlighting infer scope from current token output. Scope is
  code text ownership, not the current projection result.

Remaining risks:

- Legacy decorate compatibility still needs a scoped helper story.
- Phase 3 selector API is still incomplete for first-class node/text/decoration
  subscriptions.
- Event, mutation, selection, repair, and composition controllers still need
  runtime extraction after projection fanout is tighter.

Next action:

- Continue Phase 3 with the public/internal selector API shape:
  `useNodeSelector`, `useTextSelector`, `useDecorationSelector`, and source-key
  subscriptions, keeping the existing browser canaries as the regression floor.

### 2026-04-27: Phase 3 Runtime Selector Hook API

Slice name: node/text/decoration selector hooks.

Owner classification: Phase 3 selector API shape and commit-fact filtering.

Files changed:

- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/packages/slate-react/src/hooks/use-node-selector.tsx`
- `../slate-v2/packages/slate-react/src/hooks/use-decoration-selector.tsx`
- `../slate-v2/packages/slate-react/src/index.ts`
- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`
- `../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`

Actions taken:

- Added `nodeImpactRuntimeIds` to core commit output.
- Kept node impact conservative: replace/structural commits invalidate broadly,
  text commits include changed text plus ancestor shell runtime ids, and
  selection/mark commits do not wake node selectors.
- Added `useNodeSelector` and `useTextSelector` with runtime-id based
  invalidation using `nodeImpactRuntimeIds`.
- Added `useDecorationSelector` that derives from one runtime id's projection
  entries without subscribing to the whole projection snapshot.
- Exported selector hook types and APIs from the `slate-react` barrel.
- Added contracts proving node/text selectors skip unrelated runtime-id text
  commits and decoration selectors skip sibling projection changes.

Commands run:

- `bun --filter slate-react test:vitest -- provider-hooks-contract -t "runtime selector hooks"`
  - RED before implementation: `useNodeSelector` was not exported.
  - GREEN after implementation and text selector memoization: 1 passed.
- `bun --filter slate-react test:vitest -- projections-and-selection-contract -t "useDecorationSelector"`
  - RED before implementation: `useDecorationSelector` was not exported.
  - GREEN after implementation and initial selector-call expectation fix:
    1 passed.
- `bun test ./packages/slate/test/snapshot-contract.ts -t "publishes touched runtime ids|publishes selection-only dirtiness|publishes replace-level broad invalidation|publishes marks-only"`
  - Result: 4 passed.
- `bun --filter slate-react test:vitest -- provider-hooks-contract projections-and-selection-contract use-selected surface-contract`
  - Result: 4 files passed, 22 tests passed.
- `bun lint:fix`
  - First run formatted 3 files.
  - Final run: no fixes applied.
- `bun typecheck`
  - Result: passed across packages, site, and root.
- `bun --filter ./packages/slate build && bun --filter slate-react build`
  - Result: passed; `slate-react` still warns that `is-hotkey` is external.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/code-highlighting.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line`
  - Result: 26 passed.

Evidence:

- Node/text selectors no longer need caller-written `shouldUpdate` predicates
  for the common runtime-id case.
- A text edit in runtime id B does not call node/text selectors scoped to
  runtime id A.
- A projection change for runtime id B does not rerender or reselect a
  decoration selector scoped to runtime id A.
- Existing user-reported browser regression canaries stay green.

Rejected tactics:

- Do not build node selectors on `decorationImpactRuntimeIds`; node data needed
  an explicit `nodeImpactRuntimeIds` fact.
- Do not infer that hook APIs alone close Phase 3. Internal hot render paths
  still need to move onto the new hooks.

Remaining risks:

- `EditableTextBlocks` and `EditableText` still use custom selector code in hot
  paths instead of the new hooks.
- Source-key subscriptions are still not a first-class store API.
- Structural commits still use broad invalidation, which is correct but leaves
  room for future path-shift-aware precision.

Next action:

- Migrate one hot internal path, starting with bound text or descendant binding,
  onto `useNodeSelector` / `useTextSelector` and prove the reported canaries
  plus focused render-budget tests stay green.

### 2026-04-27: Phase 3 Descendant Binding Selector Adoption

Slice name: descendant binding on `useNodeSelector` plus selection export guard.

Owner classification: Phase 3 internal hot-path selector adoption.

Files changed:

- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `docs/solutions/ui-bugs/2026-04-27-slate-react-selection-export-listeners-must-skip-dom-owned-selection.md`

Actions taken:

- Migrated `EditableDescendantNodeInner` from custom `useSlateSelector`
  `shouldUpdate` logic to `useNodeSelector({ runtimeId })`.
- Removed the now-dead descendant path walker and text-DOM-sync predicate from
  `editable-text-blocks.tsx`.
- Kept descendant child runtime-id derivation inside one selector result so one
  mounted descendant pays one runtime-id subscription.
- Preserved DOM node binding for descendant shells by rejecting editor/root
  nodes and requiring a non-null descendant path.
- Added a direct selector-runtime listener in `EditableDOMRoot` for
  selection-only commits so app/programmatic `editor.select(...)` exports to
  DOM without forcing an editable-root rerender.
- Tightened that listener after the hovering-toolbar canary caught a mouse
  selection regression: native DOM-owned selection imports are skipped so mouse
  drag remains browser-owned.
- Captured the reusable selection-export lesson in `docs/solutions/ui-bugs/`.

Commands run:

- `bun --filter slate-react test:vitest -- app-owned-customization -t "scrollSelectionIntoView"`
  - RED after the first descendant selector move: app-owned
    `scrollSelectionIntoView` saw no DOM range.
  - GREEN after adding the selection-only runtime listener: 1 passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/hovering-toolbar.test.ts -g "real mouse selection" --project=chromium --reporter=line`
  - RED after the first selection listener: DOM selection stayed empty because
    the listener exported over native mouse selection.
  - GREEN after skipping DOM-owned/native-user selection imports: 1 passed.
- `bun --filter slate-react test:vitest -- provider-hooks-contract projections-and-selection-contract use-selected surface-contract app-owned-customization rendered-dom-shape-contract`
  - Result after final fix: 5 files passed, 26 tests passed.
- `bun test ./packages/slate/test/snapshot-contract.ts -t "publishes touched runtime ids|publishes selection-only dirtiness|publishes replace-level broad invalidation|publishes marks-only"`
  - Result: 4 passed.
- `bun lint:fix`
  - Result after final edits: no fixes applied.
- `bun typecheck`
  - Result after selector typing fix: passed across packages, site, and root.
- `bun --filter ./packages/slate build && bun --filter slate-react build`
  - Result: passed; `slate-react` still warns that `is-hotkey` is external.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/code-highlighting.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line`
  - Result: 26 passed.
- `dev-browser --connect http://127.0.0.1:9222`
  - Result on `/examples/hovering-toolbar`: real mouse drag produced expanded
    model selection `[0,0]@1 -> [0,0]@32`, non-empty DOM selection, and visible
    positioned toolbar (`opacity` about `0.99`, top `89.5px`, left
    `348.082px`).

Evidence:

- Descendant rendering now uses the same runtime-id selector primitive as the
  new public/internal hook API.
- Programmatic/app-owned selection export is independent of editable-root
  rerender.
- Native mouse selection remains DOM-owned; the listener no longer flattens the
  hovering-toolbar drag path.
- The full reported-regression browser set remains green against the live
  `3100` server after rebuilding package output.

Rejected tactics:

- Do not keep custom per-component `shouldUpdate` logic when commit facts can
  drive the runtime-id selector.
- Do not solve app-owned selection forwarding by re-enabling editable-root
  rerenders on every selection commit.
- Do not export model selection back into the DOM for native mouse selection
  imports.

Remaining risks:

- `BoundEditableText` still has a custom `useSlateSelector` binding and should
  move onto `useTextSelector`.
- Source-key subscriptions are still not a first-class projection-store API.
- The selection-only listener is still in `EditableDOMRoot`; the later
  selection runtime extraction should own it.

Next action:

- Migrate `BoundEditableText` onto `useTextSelector`, then continue source-key
  subscription design.

### 2026-04-27: Phase 3 Bound Text Selector Adoption

Slice name: bound text on `useTextSelector`.

Owner classification: Phase 3 internal hot-path selector adoption.

Files changed:

- `../slate-v2/packages/slate-react/src/components/editable-text.tsx`

Actions taken:

- Migrated `BoundEditableText` from direct `useSlateSelector` binding to
  `useTextSelector`.
- Preserved path-only behavior by resolving the current path to a runtime id
  before subscribing, then letting structural broad invalidation refresh the
  resolved id if the path changes under the component.
- Kept explicit `text` and `marks` overrides working while node/path/runtime id
  data comes from the runtime-id text selector context.

Commands run:

- `bun --filter slate-react test:vitest -- provider-hooks-contract projections-and-selection-contract use-selected surface-contract app-owned-customization rendered-dom-shape-contract`
  - Result: 5 files passed, 26 tests passed.
- `bun test ./packages/slate/test/snapshot-contract.ts -t "publishes touched runtime ids|publishes selection-only dirtiness|publishes replace-level broad invalidation|publishes marks-only"`
  - Result: 4 passed.
- `bun lint:fix`
  - First run formatted one file.
  - Final run: no fixes applied.
- `bun typecheck`
  - First run caught missing selector callback parameter types.
  - Final run: passed across packages, site, and root.
- `bun --filter ./packages/slate build && bun --filter slate-react build`
  - Result: passed; `slate-react` still warns that `is-hotkey` is external.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/code-highlighting.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line`
  - Result: 26 passed.
- `dev-browser --connect http://127.0.0.1:9222`
  - Result on `/examples/search-highlighting`: search input stayed focused with
    value `a`, and `[data-cy="search-highlighted"]` count was `12`.

Evidence:

- Both hot text-block descendants and bound text nodes now use the runtime-id
  selector hook family.
- The text rendering path still preserves the reported browser regression floor
  after rebuilding package output.
- Search-highlighting keeps external input focus and visible decorations in
  persistent Chrome after the bound-text selector move.

Rejected tactics:

- Do not keep the custom bound-text `useSlateSelector` path after the selector
  hook exists.
- Do not drop path-only binding behavior; standalone text rendering still needs
  to resolve from `path` when no runtime id is passed.

Remaining risks:

- Source-key subscriptions are still not a first-class projection-store API.
- Structural commits still use broad node invalidation, which is safe but not
  yet as precise as the final runtime can be.
- The selection-only listener still belongs in the later selection runtime
  extraction.

Next action:

- Continue Phase 3 source-key subscription design.

### 2026-04-27: Phase 3 Source-Key Projection Refresh

Slice name: targeted source-key projection refresh.

Owner classification: Phase 3 projection-store invalidation narrowing.

Files changed:

- `../slate-v2/packages/slate-react/src/projection-store.ts`
- `../slate-v2/packages/slate-react/src/hooks/use-slate-projections.tsx`
- `../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`
- `../slate-v2/site/examples/ts/search-highlighting.tsx`
- `../slate-v2/site/examples/ts/external-decoration-sources.tsx`

Actions taken:

- Added `refresh({ sourceId })` so external decoration refreshes can target one
  projection source instead of recomputing every source.
- Added `subscribeSourceId(sourceId, listener)` to let source-local subscribers
  update without waking unrelated projection readers.
- Kept default refresh broad when no `sourceId` is passed.
- Updated search-highlighting and external-decoration-sources to pass stable
  source ids from external controls.

Commands run:

- `bun --filter slate-react test:vitest -- projections-and-selection-contract -t "targeted source refresh"`
  - Result: 1 passed.
- `bun --filter slate-react test:vitest -- projections-and-selection-contract provider-hooks-contract use-selected surface-contract app-owned-customization rendered-dom-shape-contract`
  - Result: 5 files passed, 27 tests passed.
- `bun test ./packages/slate/test/snapshot-contract.ts -t "publishes touched runtime ids|publishes selection-only dirtiness|publishes replace-level broad invalidation|publishes marks-only"`
  - Result: 4 passed.
- `bun lint:fix`
  - Result: no fixes applied.
- `bun typecheck`
  - Result: passed across packages, site, and root.
- `bun --filter ./packages/slate build && bun --filter slate-react build`
  - Result: passed; `slate-react` still warns that `is-hotkey` is external.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/code-highlighting.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line`
  - Result: 26 passed.
- `dev-browser --connect http://127.0.0.1:9222`
  - Result on `/examples/external-decoration-sources`: beta diagnostics updated
    the source snapshot, last update text reported
    `refresh({ reason: "external", sourceId: "external-diagnostics" })`, and
    only warm diagnostics were visible.

Evidence:

- Wrong-source refreshes do not recompute or notify a projection store.
- Matching source refreshes recompute and notify global, runtime-id, and
  source-id listeners.
- External decoration examples can drive focused projection refresh without
  rebuilding the editor or losing input ownership.

Rejected tactics:

- Do not use broad external refresh as the long-term default when the caller
  knows the decoration source.
- Do not recreate projection stores from React control state.

Remaining risks:

- Structural commits still use conservative invalidation in places where final
  commit facts can become narrower.
- This is a projection-store primitive, not the final `slate-browser` replay
  contract layer.

Next action:

- Extract the selection-only DOM export policy out of `EditableDOMRoot`.

### 2026-04-27: Phase 5 Selection Runtime Policy Extraction

Slice name: selection-only DOM export policy extraction.

Owner classification: Phase 5 internal selection runtime extraction.

Files changed:

- `../slate-v2/packages/slate-react/src/editable/selection-runtime.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/test/selection-runtime-contract.test.ts`

Actions taken:

- Added an internal selection runtime module for the selection-only DOM export
  policy.
- Moved the policy deciding whether model selection may export to the DOM out
  of `EditableDOMRoot`.
- Kept the native-user and DOM-current guard so real mouse selection stays
  browser-owned.
- Added contract coverage for policy predicates, selection-only commit
  matching, subscription wiring, and cleanup.

Commands run:

- `bun --filter slate-react test:vitest -- selection-runtime-contract`
  - Result: 1 file passed, 3 tests passed.
- `bun --filter slate-react test:vitest -- selection-runtime-contract provider-hooks-contract projections-and-selection-contract use-selected surface-contract app-owned-customization rendered-dom-shape-contract`
  - Result: 6 files passed, 30 tests passed.
- `bun test ./packages/slate/test/snapshot-contract.ts -t "publishes touched runtime ids|publishes selection-only dirtiness|publishes replace-level broad invalidation|publishes marks-only"`
  - Result: 4 passed.
- `bun lint:fix`
  - Result: no fixes applied.
- `bun typecheck`
  - Result: passed across packages, site, and root.
- `bun --filter ./packages/slate build && bun --filter slate-react build`
  - Result: passed; `slate-react` still warns that `is-hotkey` is external.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/code-highlighting.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --reporter=line`
  - Result: 26 passed.
- `dev-browser --connect http://127.0.0.1:9222`
  - Result on `/examples/hovering-toolbar`: real mouse drag produced expanded
    model selection, non-empty DOM selection, and visible toolbar opacity.

Evidence:

- App/programmatic model selection can export to DOM from a selector-runtime
  listener without forcing editable-root rerenders.
- DOM-owned native mouse selection is not overwritten by the model export
  listener.
- Selection export policy is now a testable internal unit instead of inline
  component code.

Rejected tactics:

- Do not put selection export policy back into `EditableDOMRoot`.
- Do not solve selection-only commits by making the editable root rerender.

Remaining risks:

- Shell, event, repair, composition, and replayable `slate-browser` contracts
  still need a dedicated Phase 4/5 lane.
- Source-key refresh and selection export are internal proof, not the public
  node/text/mark authoring API redesign.

Next action:

- Start a new Phase 4/5 lane for runtime-owned shell/event/repair/composition
  extraction and `slate-browser` replay contracts.

### 2026-04-27: Runtime-Owned VoidElement Spacer Children

Slice name: runtime-owned `VoidElement` spacer children.

Owner classification: hard-cut shell cleanup, runtime-owned void structure.

Files changed:

- `../slate-v2/packages/slate-react/src/context.tsx`
- `../slate-v2/packages/slate-react/src/components/void-element.tsx`
- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `../slate-v2/packages/slate-react/src/shell-runtime.ts`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- `../slate-v2/packages/slate-react/test/primitives-contract.tsx`
- `../slate-v2/packages/slate-react/test/shell-runtime-contract.test.tsx`
- `../slate-v2/packages/slate-react/test/render-profiler-contract.test.tsx`
- `../slate-v2/site/examples/ts/images.tsx`
- `../slate-v2/site/examples/ts/embeds.tsx`
- `../slate-v2/site/examples/ts/paste-html.tsx`

Actions taken:

- Added `VoidSpacerChildrenContext` so the runtime provides hidden spacer
  children while ordinary app renderers render visible void content only.
- Removed `children` and `spacer` from the public `VoidElement` props.
- Deleted `resolveSlateVoidSpacerChildren`.
- Wrapped custom element rendering with the runtime spacer context for void
  nodes.
- Updated image, embed, paste-html examples and slate-react tests to stop
  passing app-owned hidden children into `VoidElement`.
- Captured the reusable DX rule in `docs/solutions`.

Commands run:

- `bun --filter slate-react test:vitest -- surface-contract -t "void renderers do not pass"`
  - Result: failed before the runtime context existed, then passed after the
    implementation.
- `bun --filter slate-react test:vitest -- surface-contract primitives-contract shell-runtime-contract render-profiler-contract`
  - Result: 4 files passed, 16 tests passed.
- `bun --filter slate-react test:vitest -- selection-runtime-contract provider-hooks-contract projections-and-selection-contract use-selected surface-contract app-owned-customization rendered-dom-shape-contract primitives-contract shell-runtime-contract render-profiler-contract`
  - Result: 9 files passed, 43 tests passed.
- `bun lint:fix`
  - First run caught a missing test image dimension.
  - Final run: no fixes applied.
- `bun typecheck`
  - Result: passed across packages, site, and root.
- `bun --filter ./packages/slate build && bun --filter slate-react build`
  - Result: passed; `slate-react` still warns that `is-hotkey` is external.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/images.test.ts playwright/integration/examples/embeds.test.ts playwright/integration/examples/mentions.test.ts --project=chromium --reporter=line`
  - Result: 14 passed.
- `dev-browser --connect http://127.0.0.1:9222`
  - Result on `/examples/images`: ArrowRight moved into DOM path `1,0`,
    editor focus stayed active, the image void had one spacer and one
    zero-width node, and visible content offset was `0`.
  - Result on `/examples/embeds`: iframe was visible, the embed void had one
    spacer and one zero-width node, and input-to-next-paragraph gap was `16`.
- `rg -n "resolveSlateVoidSpacerChildren|spacer=|spacer\\?:|children\\?: ReactNode|<VoidElement[^\\n]*>" packages/slate-react/src packages/slate-react/test site/examples/ts/images.tsx site/examples/ts/embeds.tsx site/examples/ts/paste-html.tsx`
  - Result: no `VoidElement` spacer prop, helper, or `children` prop remains;
    non-void generic `children?: ReactNode` props still exist where expected.

Evidence:

- Ordinary `VoidElement` renderers no longer receive or pass hidden spacer
  children.
- Runtime context provides the spacer children only while rendering a void
  node.
- Image and embed layout canaries preserve the reported regression floor.
- Persistent Chrome proof agrees with the automated canaries for selected image
  layout and embed spacing.

Rejected tactics:

- No compatibility `spacer` prop.
- No `children` alias on `VoidElement`.
- No example-local spacer workaround.
- No broad editor-tree rerender to make spacer placement safe.

Remaining risks:

- Inline atom renderers such as mentions still pass hidden children manually.
- Event, repair, and composition ownership still need the dedicated Phase 4/5
  runtime lane.
- `slate-browser` still needs generated replay contracts over operation
  families, not only curated example canaries.

Next action:

- Cut app-owned inline atom hidden children next, starting with mentions and
  inline void navigation canaries.

### 2026-04-27: Runtime-Owned InlineVoidElement Hidden Children

Slice name: runtime-owned `InlineVoidElement` hidden anchor children.

Owner classification: hard-cut shell cleanup, runtime-owned inline atom
structure.

Files changed:

- `../slate-v2/packages/slate-react/src/context.tsx`
- `../slate-v2/packages/slate-react/src/components/inline-void-element.tsx`
- `../slate-v2/packages/slate-react/src/components/slate-element.tsx`
- `../slate-v2/packages/slate-react/src/components/void-element.tsx`
- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `../slate-v2/packages/slate-react/src/index.ts`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- `../slate-v2/site/examples/ts/mentions.tsx`
- `docs/solutions/developer-experience/2026-04-27-slate-react-void-renderers-should-not-own-hidden-spacer-children.md`

Actions taken:

- Renamed the internal void children context to
  `VoidHiddenChildrenContext`, because the same runtime-owned children feed
  block void spacers and inline void hidden anchors.
- Added `InlineVoidElement` as the visible-content primitive for inline voids.
- Moved platform-specific hidden child placement into `InlineVoidElement`.
- Broadened `SlateElement` pass-through DOM props while keeping Slate shell
  attributes owned by the primitive.
- Updated the mentions example so the renderer passes only visible mention
  content, not raw hidden children.
- Added surface contract coverage proving an inline void renderer can omit
  hidden children while the runtime still renders a zero-width anchor.
- Updated the reusable solution doc to include inline void hidden anchors.

Commands run:

- `bun --filter slate-react test:vitest -- surface-contract -t "inline void renderers"`
  - Result: failed before the primitive/context implementation, then passed.
- `bun --filter slate-react test:vitest -- surface-contract primitives-contract shell-runtime-contract render-profiler-contract`
  - Result: 4 files passed, 17 tests passed.
- `bun --filter slate-react test:vitest -- selection-runtime-contract provider-hooks-contract projections-and-selection-contract use-selected surface-contract app-owned-customization rendered-dom-shape-contract primitives-contract shell-runtime-contract render-profiler-contract`
  - Result: 9 files passed, 44 tests passed.
- `bun lint:fix`
  - First run fixed two files and caught a top-level regex rule.
  - Final run: no fixes applied.
- `bun typecheck`
  - Result: passed across packages, site, and root.
- `bun --filter ./packages/slate build && bun --filter slate-react build`
  - Result: passed; `slate-react` still warns that `is-hotkey` is external.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/mentions.test.ts --project=chromium --reporter=line`
  - Result: 4 passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/images.test.ts playwright/integration/examples/embeds.test.ts playwright/integration/examples/mentions.test.ts --project=chromium --reporter=line`
  - Result: 14 passed.
- `dev-browser --connect http://127.0.0.1:9222`
  - Result on `/examples/mentions`: `mention-R2-D2` rendered as
    `data-slate-inline="true"` and `data-slate-void="true"` with
    `contenteditable="false"`, one zero-width hidden anchor, and text path
    `1,1,0`; ArrowRight from the preceding text landed at DOM path `1,2`
    offset `0` with editor focus still active.
- `rg -n "VoidSpacerChildrenContext|spacer=|spacer\\?:|children.*@|@.*children|IS_MAC|utils/environment|VoidHiddenChildrenContext|InlineVoidElement" ...`
  - Result: no stale app-owned mention child placement, old context name, or
    spacer prop path remains in the ordinary image/embed/mention surface.

Evidence:

- Mentions no longer decide hidden anchor placement in app code.
- Runtime-owned context feeds both block void spacer children and inline void
  hidden anchor children.
- Browser canaries preserve image, embed, and mention regression coverage after
  the new primitive.
- Persistent Chrome proof confirms inline void shell attributes, hidden anchor
  count, DOM navigation, and focus.

Rejected tactics:

- No compatibility `children` path for mention renderers.
- No app-owned Mac/Android hidden child branch.
- No one-off mention patch without a reusable primitive.
- No broad React rerender to make inline void navigation safe.

Remaining risks:

- `editable-voids` and large-document runtime demos still contain advanced
  renderer-owned content patterns and need a separate decision before cutting;
  they are not ordinary visible-content-only void renderers.
- Shell event, mutation repair, composition, and generated replay contracts are
  still a broader Phase 4/5 lane.

Next action:

- Open a new owner lane for generated `slate-browser` replay contracts over
  void/atom operation families, or for shell event/repair/composition
  extraction. The runtime-owned ordinary void/atom shell owner is complete.
