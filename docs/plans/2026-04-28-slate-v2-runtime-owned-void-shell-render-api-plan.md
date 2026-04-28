# Slate v2 Runtime-Owned Void Shell And Render API Plan

## Status

Done.

Execution started from `complete-plan` on 2026-04-28.

Current next owner: none. The lane passed its completion target.

## Goal

Remove the remaining public void-rendering footgun.

The target is not "make `VoidElement` safer." The target is to make app and
plugin authors unable to own hidden spacer, hidden anchor, `contentEditable`,
selection mapping, or void shell placement by default.

This plan covers only:

1. Runtime-owned void and atom shells.
2. A first-class content-only `renderVoid` API.
3. Generated browser contracts for void/atom operation families.

No internal compatibility lane. `VoidElement` and `InlineVoidElement` are not
kept as normal authoring APIs after this cut.

## North Star

Normal elements stay close to Slate:

```tsx
renderElement({ attributes, children, element }) {
  return <p {...attributes}>{children}</p>
}
```

Voids stop pretending hidden children are user interface:

```tsx
renderVoid({ element, selected, focused, actions }) {
  return <ImageCard src={element.url} onRemove={actions.remove} />
}
```

`slate-react` owns the browser contract:

```tsx
<ElementShell data-slate-node="element" data-slate-void>
  <VoidContent contentEditable={false}>{visibleContent}</VoidContent>
  <HiddenTextAnchor>{hiddenChildren}</HiddenTextAnchor>
</ElementShell>
```

## Non-Goals

- Do not introduce Plate specs into Slate core.
- Do not preserve `VoidElement` / `InlineVoidElement` as public authoring
  routes.
- Do not add deprecated aliases or migration shims.
- Do not change Slate document shape: void nodes still have text children.
- Do not use examples as the primary proof surface.
- Do not claim legacy browser parity until generated legacy-vs-v2 rows exist.

## Target Public API

### Editable

```tsx
<Editable
  renderElement={renderElement}
  renderLeaf={renderLeaf}
  renderText={renderText}
  renderVoid={renderVoid}
/>
```

### Render Void Props

```ts
type RenderVoidProps<TElement extends Element = Element> = {
  actions: {
    focus: () => void
    remove: () => void
    select: () => void
  }
  element: TElement
  focused: boolean
  selected: boolean
}
```

No `attributes`.
No `children`.
No `contentEditable`.
No spacer prop.
No hidden anchor prop.
No path prop by default.

If authors need path-like targeting, expose actions or runtime-id based hooks,
not `ReactEditor.findPath` as the normal flow.

### Void Kinds

`isVoid` remains the legacy model predicate, but `slate-react` needs explicit
render/runtime kinds:

```ts
type VoidRenderKind =
  | 'block'
  | 'inline'
  | 'markable-inline'
  | 'editable-island'
```

Expose it as editor/runtime configuration, not as Plate-style node specs:

```ts
editor.voidKind = (element) => {
  switch (element.type) {
    case 'image':
    case 'video':
      return 'block'
    case 'mention':
      return 'markable-inline'
    case 'editable-void':
      return 'editable-island'
    default:
      return null
  }
}
```

Default behavior:

- `Editor.isVoid(editor, element) && Editor.isInline(editor, element)` maps to
  `inline`
- `Editor.isVoid(editor, element)` maps to `block`
- `editor.markableVoid(element)` upgrades inline voids to `markable-inline`
- editable islands require explicit `editable-island`

## Phase 1: Runtime-Owned Void Shells

Purpose: make the DOM contract owned by `slate-react` before changing public
author APIs.

Actions:

- Add internal shell components or runtime helpers:
  - `SlateVoidShell`
  - `SlateInlineVoidShell`
  - `SlateEditableIslandShell`
  - `VoidContent`
  - `HiddenTextAnchor`
- Move spacer/hidden-anchor placement out of app-owned renderers.
- Make `EditableDescendantNode` choose the shell when `Editor.isVoid(...)`
  returns true.
- Keep normal elements on the existing `renderElement` flow.
- Ensure void shell rendering owns:
  - `data-slate-node="element"`
  - `data-slate-void`
  - `data-slate-inline` when needed
  - `contentEditable={false}` around visible content
  - hidden text anchor/spacer
  - platform-specific inline anchor order
  - render-profiler event for void nodes
- Remove `VoidHiddenChildrenContext` from public renderer responsibility.

Hard cuts:

- Delete public `VoidElement` export.
- Delete public `InlineVoidElement` export.
- Delete examples that import those helpers and rewrite them to the new shape
  in the same lane.
- Delete tests whose only purpose is preserving old helper shape.

Acceptance:

- App renderers cannot place spacer/hidden-anchor children through the normal
  API.
- Void shell shape is identical across examples and plugins.
- Inline void Mac hidden-anchor order remains runtime-owned.
- Static guards fail on public `VoidElement` / `InlineVoidElement` imports.

Driver gates:

```sh
bun --filter slate-react test:vitest test/surface-contract.test.tsx test/rendered-dom-shape-contract.test.tsx test/primitives-contract.test.tsx
bun --filter slate-react typecheck
```

## Phase 2: First-Class `renderVoid`

Purpose: give authors the best DX without a compatibility detour.

Actions:

- Add `renderVoid` to `EditableProps`.
- Add `RenderVoidProps` types beside `RenderElementProps`.
- Route void nodes through `renderVoid` instead of `renderElement`.
- Keep non-void nodes on `renderElement`.
- Add runtime actions:
  - `select`
  - `focus`
  - `remove`
- Add `selected` and `focused` state using node/runtime-id selectors, not broad
  editor subscriptions.
- Keep markable inline void rendering compatible with mark styling without
  exposing hidden text children.
- Handle `editable-island` as a distinct kind. Its visible content may include
  internal inputs or nested editors, but the outer hidden anchor remains
  runtime-owned.

Hard cuts:

- If a void node has no `renderVoid`, render a minimal runtime-owned fallback
  shell, not the old `renderElement` children path.
- Do not auto-call `renderElement` for voids as a fallback.
- Do not expose `renderVoidShellUnsafe` in this lane unless a current example
  genuinely cannot be represented. If it is added, it must require explicit
  browser contracts and must not be documented as normal DX.

Acceptance:

- Image, embed, mention, paste-html image, editable-void, and large-document
  runtime void examples use `renderVoid`.
- `renderElement` docs/tests prove it is for non-void elements.
- `renderVoid` props do not include `attributes` or `children`.
- Selection changes dirty only affected void/runtime ids.
- Type tests reject `children` access in `renderVoid`.

Driver gates:

```sh
bun --filter slate-react test:vitest test/surface-contract.test.tsx test/provider-hooks-contract.test.tsx test/render-profiler-contract.test.tsx
bun --filter slate-react typecheck
```

## Phase 3: Generated Void/Atom Browser Contracts

Purpose: stop finding void regressions by hand.

Actions:

- Add `slate-browser` contract builders for:
  - block void navigation
  - inline void boundary navigation
  - markable inline void formatting and navigation
  - editable island native-owned focus
  - hidden spacer non-layout
  - mouse click select
  - delete selected void
  - paste before/after void
  - undo/redo around void insertion/deletion
- Generate rows for:
  - images
  - embeds
  - mentions
  - editable voids
  - paste-html image
  - large-document runtime void
- Add DOM-shape assertions:
  - hidden anchor exists
  - hidden anchor contributes no visible layout for block voids
  - visible content is `contentEditable=false`
  - editable island internal controls remain native-owned
- Add selection assertions:
  - arrow left/right enters/exits inline voids from both sides
  - arrow movement around block voids preserves model and DOM selection
  - table and void boundary rows do not regress each other
- Add commit/kernel assertions:
  - operation family is recorded
  - follow-up typing works
  - focus owner is expected

Fast CI subset:

```sh
bun test
bun --filter slate-react test:vitest test/surface-contract.test.tsx test/rendered-dom-shape-contract.test.tsx
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/images.test.ts playwright/integration/examples/embeds.test.ts playwright/integration/examples/mentions.test.ts playwright/integration/examples/editable-voids.test.ts --project=chromium
```

Sparing stress gate:

```sh
bun test:stress
```

Release closure:

```sh
bun check:full
```

Acceptance:

- Every void/atom family has generated browser coverage.
- Every prior human-reported void regression has a row:
  - hidden spacer layout
  - keyboard navigation around images
  - keyboard navigation before/after inline void mentions
  - editable void native input focus
  - embed hidden spacer after URL input
- Failing rows produce replayable artifacts.
- `bun check:full` passes before this lane is marked done.

## File Targets

Likely Slate v2 files:

- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `../slate-v2/packages/slate-react/src/components/void-element.tsx`
- `../slate-v2/packages/slate-react/src/components/inline-void-element.tsx`
- `../slate-v2/packages/slate-react/src/components/slate-element.tsx`
- `../slate-v2/packages/slate-react/src/components/slate-spacer.tsx`
- `../slate-v2/packages/slate-react/src/index.ts`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- `../slate-v2/packages/slate-react/test/rendered-dom-shape-contract.tsx`
- `../slate-v2/packages/slate-react/test/primitives-contract.tsx`
- `../slate-v2/playwright/stress/generated-editing.test.ts`
- `../slate-v2/packages/slate-browser/src/**`
- `../slate-v2/site/examples/ts/images.tsx`
- `../slate-v2/site/examples/ts/embeds.tsx`
- `../slate-v2/site/examples/ts/mentions.tsx`
- `../slate-v2/site/examples/ts/editable-voids.tsx`
- `../slate-v2/site/examples/ts/paste-html.tsx`
- `../slate-v2/site/examples/ts/large-document-runtime.tsx`

## Static Guards

Add or update guards that fail when:

- `VoidElement` is exported from `slate-react`.
- `InlineVoidElement` is exported from `slate-react`.
- site examples import `VoidElement` or `InlineVoidElement`.
- `renderVoid` props include `children`.
- `renderVoid` props include `attributes`.
- void rendering falls back to `renderElement`.
- block void hidden spacer has visible layout.
- inline void hidden anchor is app-owned.

## Completion Target

This lane is done only when:

- public void rendering is content-only through `renderVoid`
- runtime owns all void shells, spacers, anchors, and editable-content wrappers
- `VoidElement` and `InlineVoidElement` are gone as public APIs
- all first-party void examples use `renderVoid`
- generated browser rows cover block void, inline void, markable inline void,
  and editable island families
- focused browser rows pass
- `bun check:full` passes

## Stop Rule

Do not stop at Phase 1. The shell cut without `renderVoid` leaves DX awkward.

Do not stop at Phase 2. The new DX without generated browser contracts is just
a prettier way to reintroduce the same bugs.

Stop only when Phase 3 closure proof passes, or when a real blocker prevents
all autonomous progress.

## Execution Ledger

### 2026-04-28 Activation

Actions:

- Activated this plan through `complete-plan`.
- Set `tmp/completion-check.md` to `status: pending`.
- Refreshed `tmp/continue.md` for this lane.
- Confirmed prior `EditableDOMRoot` / root selector review findings are stale
  for this lane because the root-runtime selector guard lane is already done.

Commands:

- None yet.

Evidence:

- Prior root runtime selector guard lane completion state was `done`.
- This lane is now the active completion-check owner.

Changed files:

- `tmp/completion-check.md`
- `tmp/continue.md`
- `docs/plans/2026-04-28-slate-v2-runtime-owned-void-shell-render-api-plan.md`

Decision:

- Start with Phase 1. No compatibility bridge. Public helper authoring paths
  are cut, not preserved.

Rejected tactics:

- Do not resume the old root-runtime selector plan from the pasted review
  findings. That lane already completed.
- Do not keep `VoidElement` / `InlineVoidElement` as public APIs while adding
  `renderVoid`.

Next action:

- Add or update `slate-react` surface contracts that fail if public void helper
  authoring paths remain, then implement runtime-owned void shell ownership.

### 2026-04-28 Phase 1/2 Core Cut Checkpoint

Actions:

- Added failing surface contracts for public void helper removal and
  content-only `renderVoid`.
- Added internal `SlateVoidShell` and `SlateInlineVoidShell`.
- Routed void nodes through runtime-owned shells instead of `renderElement`.
- Added `renderVoid({ element, selected, focused, actions })`.
- Added node-local actions: `focus`, `select`, `remove`, and `setElement`.
- Deleted public `VoidElement` / `InlineVoidElement` implementations and
  exports.
- Migrated first-party image, embed, mention, paste-html image, editable-void,
  and large-document runtime void examples to `renderVoid`.
- Added the missing `.test.tsx` entrypoint for the rendered DOM shape contract.

Commands:

- `bun --filter slate-react test:vitest test/surface-contract.test.tsx test/primitives-contract.test.tsx test/render-profiler-contract.test.tsx`
- `bun --filter slate-react typecheck`
- `bun typecheck:site`
- `bun --filter slate-react test:vitest test/surface-contract.test.tsx test/rendered-dom-shape-contract.test.tsx test/primitives-contract.test.tsx test/render-profiler-contract.test.tsx`
- `bun biome check --write packages/slate-react/src/components/editable-text-blocks.tsx site/examples/ts/embeds.tsx site/examples/ts/paste-html.tsx site/examples/ts/images.tsx site/examples/ts/mentions.tsx site/examples/ts/editable-voids.tsx site/examples/ts/large-document-runtime.tsx site/examples/ts/custom-types.d.ts packages/slate-react/src/components/slate-void-shell.tsx packages/slate-react/src/index.ts packages/slate-react/src/context.tsx packages/slate-react/test/surface-contract.tsx packages/slate-react/test/primitives-contract.tsx packages/slate-react/test/render-profiler-contract.test.tsx packages/slate-react/test/rendered-dom-shape-contract.test.tsx`
- `bun lint`

Evidence:

- Focused slate-react contract gate passed with 4 files and 23 tests.
- `slate-react` typecheck passed.
- Site typecheck passed after first-party example migration.
- Biome lint passed across 1602 files.
- Static grep only finds the old helper names inside the new surface guard and
  unrelated `EditableVoidElement` model type.

Changed files:

- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `../slate-v2/packages/slate-react/src/components/slate-void-shell.tsx`
- `../slate-v2/packages/slate-react/src/components/void-element.tsx`
- `../slate-v2/packages/slate-react/src/components/inline-void-element.tsx`
- `../slate-v2/packages/slate-react/src/context.tsx`
- `../slate-v2/packages/slate-react/src/index.ts`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- `../slate-v2/packages/slate-react/test/primitives-contract.tsx`
- `../slate-v2/packages/slate-react/test/render-profiler-contract.test.tsx`
- `../slate-v2/packages/slate-react/test/rendered-dom-shape-contract.test.tsx`
- `../slate-v2/site/examples/ts/custom-types.d.ts`
- `../slate-v2/site/examples/ts/images.tsx`
- `../slate-v2/site/examples/ts/embeds.tsx`
- `../slate-v2/site/examples/ts/mentions.tsx`
- `../slate-v2/site/examples/ts/paste-html.tsx`
- `../slate-v2/site/examples/ts/editable-voids.tsx`
- `../slate-v2/site/examples/ts/large-document-runtime.tsx`

Decision:

- Keep the lane `pending`. Phase 1/2 core DX is verified, but Phase 3 generated
  browser contracts are still required before completion.

Rejected tactics:

- Do not keep public helper shims.
- Do not make embed URL editing reach for `path` or `ReactEditor.findPath`.
  Use node-local `actions.setElement(...)`.
- Do not let first-party examples keep app-owned hidden children.

Next action:

- Start Phase 3 by finding the existing `slate-browser` generated contract
  builders and adding void/atom family rows for the migrated examples.

### 2026-04-28 Phase 3 Closure Checkpoint

Actions:

- Added generated browser stress rows for block voids, inline voids, markable
  inline voids, editable islands, paste-html image voids, and large-document
  runtime void shells.
- Persisted stress surface metadata into replay artifacts.
- Fixed paste-html image replay detection so native paste results are not
  mistaken for missing text.
- Fixed runtime shell DOM for block void content and markable inline void
  anchors.
- Added `renderVoid` to the large-document runtime void editor.
- Updated hand-authored embed navigation render budgets to allow the runtime
  void shell projection while still rejecting editable-root rerenders.
- Fixed native-control blur handoff from editable void inputs so raw
  `root.focus()` restores the outer editor selection instead of landing in the
  nested editor.

Commands:

- `bun biome check --write packages/slate-react/src/editable/runtime-focus-mouse-events.ts packages/slate-react/src/editable/runtime-event-engine.ts packages/slate-react/src/editable/selection-reconciler.ts playwright/integration/examples/embeds.test.ts`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --project=firefox --project=webkit`
- `STRESS_FAMILIES=editable-island-native-focus,block-void-navigation PLAYWRIGHT_WORKERS=1 PLAYWRIGHT_RETRIES=0 bun test:stress`
- `bun --filter slate-react typecheck`
- `bun --filter slate-browser typecheck`
- `bun typecheck:site`
- `bun typecheck:root`
- `bun lint`
- `bun check:full`

Evidence:

- Focused editable-voids and embeds integration proof passed across Chromium,
  Firefox, and WebKit: 36 tests.
- Focused generated stress proof passed for images, embeds, and editable voids:
  3 rows.
- `slate-react`, `slate-browser`, site, and root typechecks passed.
- Biome lint passed across 1601 files.
- `bun check:full` passed: package lint/type/unit/vitest, release discipline,
  slate-browser proof contracts, scoped mobile proof, persistent-profile soak,
  and full integration/local browser sweep.
- Full browser sweep result: 644 passed, 4 skipped replay rows.

Changed files:

- `../slate-v2/packages/slate-react/src/components/slate-void-shell.tsx`
- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `../slate-v2/packages/slate-react/src/editable/input-controller.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-focus-mouse-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- `../slate-v2/packages/slate-browser/src/playwright/index.ts`
- `../slate-v2/playwright/stress/generated-editing.test.ts`
- `../slate-v2/playwright/stress/replay.test.ts`
- `../slate-v2/playwright/stress/stress-utils.ts`
- `../slate-v2/playwright/integration/examples/embeds.test.ts`
- `../slate-v2/site/examples/ts/large-document-runtime.tsx`
- `tmp/completion-check.md`
- `docs/plans/2026-04-28-slate-v2-runtime-owned-void-shell-render-api-plan.md`

Decision:

- Mark the lane done. The public void-rendering API is content-only, runtime
  shells own hidden anchors and spacers, first-party void examples migrated,
  generated browser rows cover the required families, and `bun check:full`
  passed.

Rejected tactics:

- Do not weaken the editable-void focus test to use the semantic browser
  handle. The real regression was raw keyboard input after `root.focus()`.
- Do not make native input focus immediately export the outer DOM selection; it
  steals focus before typing. Export on native-control blur when there was no
  pointer intent instead.
- Do not keep zero-render assertions for void shell movement. The correct bar is
  no editable-root rerender and bounded shell projection.

Next action:

- None for this lane.
