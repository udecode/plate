# Plite staged architecture cleanup ralplan

Status: done
Runtime id: `019e46be-4ec4-7d11-bc6e-9fcf033a8803`
Scope: staged changes in `Plate repo root`
Skill: `plite-ralplan`

## Intent

Review the staged Plite rewrite slice for the cleanest long-term architecture,
API, DX, and test shape before it is treated as shippable.

This pass does not edit Plite implementation code. It records the cleanup
lane Ralph should execute next.

## Evidence Read

- `git diff --cached --stat` and `git diff --cached --name-only` in
  `Plate repo root`: 164 staged files, 15,854 insertions, 1,715 deletions.
- Root/runtime/state:
  - `packages/plite/src/internal/root-location.ts`
  - `packages/plite/src/interfaces/path-ref.ts`
  - `packages/plite/src/editor/path-ref.ts`
  - `packages/plite/src/transforms-text/delete-text.ts`
  - `packages/plite/src/transforms-text/insert-text.ts`
  - `packages/plite-history/src/history-extension.ts`
- Layout/rendering:
  - `packages/plite-layout/src/index.ts`
  - `packages/plite-layout/src/react.tsx`
  - `packages/plite-layout-pretext/*`
  - `packages/plite-react/src/components/editable-text-blocks.tsx`
  - `packages/plite-react/src/components/editable.tsx`
  - `packages/plite-react/src/dom-strategy/create-segment-plan.ts`
- Public/examples:
  - `site/examples/ts/pagination.tsx`
  - `site/examples/ts/multi-root-document.tsx`
  - `site/examples/ts/document-state.tsx`
  - `packages/plite-react/test/surface-contract.tsx`

## Verdict

Not absolute best yet.

The macro architecture is correct:

- runtime/view split is the right backbone for multi-root editors;
- state fields are the right home for document-owned non-node state;
- Pretext belongs inside `plite-layout`;
- default DOM should stay native/full enough for normal editing;
- virtualization should remain explicit because it is a degraded editing mode.

The staged diff still has avoidable architecture dirt:

- root ownership is centralized in one file, but not yet consumed consistently;
- `PathRef` leaks root metadata publicly while `PointRef` and `RangeRef` hide it;
- text transforms and history duplicate root-location helpers;
- `plite-layout-pretext` is a package-shaped alias with no ownership;
- layout options expose `page` and `settings` for the same concept;
- internal DOM strategy still leaks `shell` vocabulary after the public API cut;
- public virtualized options include `previewChars`, which belongs to staged
  partial-DOM previews, not viewport virtualization.

Score before cleanup: 8.1 / 10 staged.
Score after cleanup: 9.3 / 10 staged.

## Accepted Cleanup Decisions

### 1. Root Location Authority

Keep `packages/plite/src/internal/root-location.ts` as the single authority, but
finish the job.

Ralph should:

- remove `root?: string` from public `PathRef`;
- add PathRef root metadata to the same internal WeakMap pattern used by
  PointRef and RangeRef;
- replace local root helpers in insert/delete text transforms with internal
  root-location helpers;
- export the internal root helpers needed by `plite-history` from
  `plite/internal`;
- remove `MAIN_ROOT_KEY`, `getOperationRoot`, and range-root clones duplicated
  in `plite-history`.

Public DX target:

```ts
const ref = Editor.pathRef(editor, [0])
ref.current
ref.unref()
```

No public `ref.root`. Root binding is runtime metadata.

### 2. Layout Package Boundary

Cut `plite-layout-pretext`.

Pretext is not an optional peer strategy here; it is the Plite layout engine.
Keeping a wrapper package only adds install/docs/API surface without giving users
a real choice.

Target:

```ts
import { usePliteLayout } from 'plite-layout/react'
```

No:

```ts
import { pretextPageLayoutEngine } from 'plite-layout-pretext'
```

### 3. Layout API Shape

Collapse the public layout API to one obvious path.

Preferred public call:

```ts
const layout = usePliteLayout(editor, {
  page: pageSettings,
  root: 'main',
  typography,
})
```

Rules:

- `page` is the page settings source, either a state field or a literal value;
- drop `settings` as an alias;
- keep engine override internal or explicitly advanced;
- do not expose an engine-first `usePlitePageLayout` path as the default docs
  story unless a real second engine exists.

### 4. DOM Strategy Vocabulary

Keep the public boundary clear:

- default: native Plite React DOM;
- `domStrategy="full"`: force full DOM;
- `domStrategy="staged"`: progressive full-DOM materialization;
- `domStrategy={{ type: 'virtualized' }}`: explicit degraded viewport-only DOM.

Cut `shell` as strategy vocabulary.

Ralph should rename internal strategy values/reasons:

- `type: 'shell'` -> internal `type: 'partial-dom'` or `type: 'staged-preview'`;
- `shell-aggressive` -> `partial-dom-aggressive` or `staged-preview`;
- metrics variable names like `shellCount` -> partial-DOM coverage names.

Do not rename `SlateVoidShell`; that is a void-element component concept, not
DOM strategy vocabulary.

Also remove `previewChars` from public `{ type: 'virtualized' }` options unless
viewport virtualization actually consumes it.

### 5. Editable Strategy Internals

Do one extraction only if it reduces real complexity:

```ts
const domPlan = useEditableDOMStrategyPlan(...)
```

It should own strategy normalization, partial-DOM/staged config, virtualizer
config, runtime payload, metrics, and materialization callbacks.

Do not create tiny helper functions just to look tidy. Extract the planning
block because `EditableTextBlocks` currently mixes editor rendering with strategy
selection.

## Required Coverage

Ralph should add or tighten tests for:

- PathRef root metadata:
  - rootless public ref shape stays rootless;
  - header-created ref ignores main-root operations;
  - explicit-root ref survives transform/unref without leaking metadata.
- Text transforms:
  - insert/delete with explicit non-main `at` mutates that root only;
  - implicit selection-root insert/delete still works in non-main views.
- History:
  - undo/redo restores selection roots through document and state-field changes;
  - no root helper duplication in `plite-history`.
- Layout public surface:
  - no `plite-layout-pretext` workspace/package/API;
  - docs/examples import Pretext-backed layout only from `plite-layout`.
- DOM strategy:
  - public type excludes `shell`;
  - source-level contract scans strategy files for `type: 'shell'` and
    `shell-aggressive`;
  - virtualized options do not expose unused preview props.

## Non-Goals

- Do not rewrite runtime/view/state fields again.
- Do not cut pagination, Pretext, or explicit virtualization.
- Do not make Plate-owned page/document APIs part of raw Plite.
- Do not introduce another layout package unless a real independently supported
  engine exists.

## Ralph Handoff

Next owner: none

Expected implementation order:

1. Root-location authority cleanup.
2. `plite-layout-pretext` hard cut and package/test script cleanup.
3. Layout API simplification.
4. DOM strategy vocabulary cleanup.
5. Focused tests, package typechecks, lint, and relevant browser/example proof.

Lane is closed. The cleanup was executed in `Plate repo root` and verified with:

- `bun test ./packages/plite/test/root-location-contract.ts ./packages/plite/test/rooted-operation-contract.ts ./packages/plite-history/test/history-contract.ts ./packages/plite-history/test/document-state-history-contract.ts ./packages/plite-layout/test/page-layout-contract.test.ts ./packages/plite-layout/test/pretext-page-layout-engine.test.ts ./packages/plite-react/test/surface-contract.tsx ./packages/plite-react/test/dom-strategy-and-scroll.test.tsx`
- `bun --filter ./packages/plite typecheck`
- `bun --filter ./packages/plite-history typecheck`
- `bun --filter ./packages/plite-dom typecheck`
- `bun --filter ./packages/plite-layout typecheck`
- `bun --filter ./packages/plite-react typecheck`
- `bun lint:fix`
- `bun --filter ./packages/plite-layout test`
- `bun --filter ./packages/plite-react test:vitest`

## Post-Closure Staged Re-Audit

Current staged scope in `Plate repo root`: 184 files, 19,110 insertions, 2,117
deletions.

Verdict: no further architecture refactor is justified.

Additional staged surfaces reviewed after the cleanup lane closed:

- extension slots: `EditorExtensionEditorGroups` and `editor?` setup output were
  cut; `state`, `tx`, `operations.apply`, `clipboard.insertData`, `normalizers`,
  `transforms`, and `onCommit` are the right raw Plite extension slots;
- schema terms: keep `isolating`, `selectable`, `keyboardSelectable`,
  `readOnly`, `atom`, and `void`; the names are explicit and unopinionated;
- debug formatting: hard cut `ScrubberApi`; keep `DebugValueScrubber` and
  `setDebugValueScrubber` as the narrower debugging surface;
- DOM strategy: public `shell` vocabulary is gone; remaining partial-DOM naming
  is internal and accurate;
- layout: keep `usePliteLayout(editor, { page, root, typography })` as the
  default path and `usePlitePageLayout` as the advanced engine-injection path.

Non-blocking release-note nit: `.changeset/shell-backed-partial-paste.md`
still has a stale filename, but its content says partial-DOM-backed. Rename it
only as release hygiene; it is not an architecture or DX blocker.
