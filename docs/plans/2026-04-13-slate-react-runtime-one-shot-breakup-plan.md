---
date: 2026-04-13
topic: slate-react-runtime-one-shot-breakup-plan
status: completed
---

# Slate React Runtime One-Shot Breakup Plan

## Requirements Summary

Break up the former `packages/slate-react/test/runtime.tsx` runtime landfill
into behavior-domain proof owners.

The plan must:

- preserve current green behavior
- move tests by behavior domain, not by arbitrary line chunks
- keep shared mount/test plumbing in one reusable helper
- keep `surface-contract.tsx` on API/surface ownership
- leave explicit behavior-domain proof owners instead of one runtime bucket

## Current State

Current files:

- [surface-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx)
  `496` lines
- [provider-hooks-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx)
  `560` lines
- [react-editor-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/react-editor-contract.tsx)
  `542` lines
- [primitives-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/primitives-contract.tsx)
  `985` lines
- [editable-behavior.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/editable-behavior.tsx)
  `755` lines
- [projections-and-selection-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx)
  `302` lines
- [app-owned-customization.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/app-owned-customization.tsx)
  `639` lines
- [large-doc-and-scroll.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx)
  `424` lines
- [runtime-fixtures.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime-fixtures.ts)
  `1174` lines
- [test-utils.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/test/test-utils.ts)
  `106` lines

What is now real:

- `runtime.tsx` is gone
- provider/hooks, `withReact` / `ReactEditor`, primitives, mounted editable
  behavior, projection/ref behavior, app-owned customization, and large-doc
  lanes now have explicit owners
- mount helpers are shared in `test-utils.ts`
- runtime fixtures are centralized in `runtime-fixtures.ts`

## Source Learnings

- `ReactEditor` and `withReact` should ride the mounted bridge, not a fake old
  plugin stack:
  [2026-04-09-slate-v2-reacteditor-should-ride-the-mounted-bridge-and-keep-base-components-standalone.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-09-slate-v2-reacteditor-should-ride-the-mounted-bridge-and-keep-base-components-standalone.md)
- renderer contracts should move into stable owner surfaces instead of living
  forever as proof-file copy-paste:
  [2026-04-04-v2-renderer-primitives-should-own-node-shapes-not-example-markup.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-renderer-primitives-should-own-node-shapes-not-example-markup.md)

## Target File Architecture

After the one-shot breakup, `packages/slate-react/test/` should look like:

- `surface-contract.tsx`
  API-facing surface and low-level public behavior already split out
- `test-utils.ts`
  shared JSDOM mount helpers only
- `large-doc-and-scroll.tsx`
  large-document shells, promotion, full-doc select-all/paste, scroll behavior
- `provider-hooks-contract.tsx`
  provider/editor lifecycle, `useSlateStatic`, `useSlateSelector`,
  `useSlateWithV`, editor/readOnly/focused/composing hooks, element hooks
- `react-editor-contract.tsx`
  `withReact`, `ReactEditor`, DOM translation, root/window/shadow-root helpers,
  mounted bridge seam
- `primitives-contract.tsx`
  `ZeroWidthString`, `TextString`, `SlateText`, `SlateLeaf`, `SlateElement`,
  `SlateSpacer`, `SlatePlaceholder`, `EditableText`, `EditableTextBlocks`,
  `VoidElement`
- `editable-behavior.tsx`
  root mounting, DOM-to-snapshot reconciliation, keydown/paste forwarding,
  readOnly, controlled replacement, rich-inline anchor reset/refocus
- `projections-and-selection-contract.tsx`
  projection store behavior, range-ref-backed projections, root/node ref hooks,
  selector invalidation locality
- `app-owned-customization.tsx`
  markdown preview, markdown shortcuts, forced layout, styling, hovering
  toolbar, image/embed actions, table rendering

`runtime.tsx` is gone.

## Exact Test Ownership

### 1. `provider-hooks-contract.tsx`

Move these runtime rows:

- `selector subscriptions stay slice-scoped across a transaction`
- `useSlateStatic returns the provider editor and updates when the provider editor changes`
- `Slate initializes fresh editors from initialValue and re-initializes when the provider editor changes`
- `Slate publishes onChange, onValueChange, and onSelectionChange on the current snapshot seam`
- `slate-react hook surface exposes editor, selection, readOnly, and current boolean contexts`
- `slate-react focused and readOnly hooks stay correct outside Editable descendants`
- `slate-react element hooks expose current element context and selected state`
- `useSlateSelector keeps referential stability when custom equality says values are equal`
- `useSlateWithV exposes the provider editor with the current snapshot version`
- `switching provider editor instances updates subscribers to the new editor`

Why:

- one domain: provider and hook contract
- no need to open DOM bridge or render primitive files for hook regressions

### 2. `react-editor-contract.tsx`

Move these runtime rows:

- `withReact and ReactEditor expose the current compatibility seam`
- `withReact composes with withLinks and honors wrapper-owned inline behavior`
- `withReact composes with withMentions and honors wrapper-owned insertMention behavior`
- `withReact composes with runtime forced-layout behavior`
- `ReactEditor DOM target and event helpers expose the current mounted bridge seam`
- `ReactEditor root/window helpers expose the mounted document boundary`
- `ReactEditor root/window helpers expose the mounted shadow-root boundary`

Why:

- one domain: mounted bridge and ReactEditor compatibility surface
- matches the repo learning exactly

### 3. `primitives-contract.tsx`

Move these runtime rows:

- `slate-react exports the current named render and component prop types`
- `ZeroWidthString renders line-break placeholders without FEFF by default`
- `ZeroWidthString retains FEFF for non-linebreak placeholders`
- `TextString repairs stale native text on rerender`
- `SlateText and SlateLeaf own the v2 text-node shape`
- `SlateElement and SlateSpacer own the v2 element and spacer shape`
- `SlatePlaceholder owns the v2 placeholder overlay shape`
- `SlatePlaceholder supports arbitrary intrinsic tags through as`
- `EditableText composes text, zero-width, and optional placeholder branches`
- `EditableText forwards arbitrary intrinsic placeholder tags`
- `EditableText supports renderPlaceholder`
- `EditableText supports renderText`
- `EditableText splits a text node into projected leaves and refreshes segment data`
- `EditableText exposes text and leafPosition to renderLeaf`
- `EditableText exposes leaf marks to renderSegment`
- `EditableBlocks exposes renderLeaf`
- `EditableBlocks forwards renderText`
- `EditableBlocks exposes renderElement attributes`
- `EditableBlocks preserves existing text marks during DOM reconciliation`
- `EditableText renders zero-length projection slices as mark placeholders`
- `EditableText can derive text and runtime binding from a path`
- `EditableTextBlocks can render from the public editor + projectionStore surface`
- `EditableBlocks aliases the public top-level text-block surface`
- `EditableBlocks can render mixed inline descendants through the public surface`
- `EditableBlocks falls back to editor.isInline when no isInline prop is supplied`
- `EditableElement owns the minimal editable element wrapper shape`
- `EditableElement supports arbitrary intrinsic tags through as`
- `VoidElement owns the minimal void wrapper and spacer shape`
- `VoidElement supports arbitrary intrinsic tags for wrapper and content`

Why:

- one domain: render and primitive surface
- directly follows the renderer-primitive learning

### 4. `editable-behavior.tsx`

Move these runtime rows:

- `Editable owns root mounting and DOM-to-snapshot reconciliation`
- `EditableBlocks survives text-to-inline replacement on the same path without hook-order crashes`
- `EditableBlocks forwards keydown handlers to app-owned keyboard policy`
- `EditableBlocks forwards paste handlers to app-owned paste policy`
- `EditableBlocks supports readOnly on the structured editing surface`
- `optional Activity boundary preserves local state and resumes on latest committed snapshot`
- `controlled replacement works through package hooks without effect mirroring`
- `EditableBlocks rich-inline anchor reset establishes a new history boundary without effect mirroring`
- `EditableBlocks rich-inline anchor restores DOM selection on refocus after reset`
- `EditableBlocks rich-inline anchor keeps selector invalidation local`
- `EditableBlocks keeps unchanged text segments stable across top-level prepends`

Why:

- one domain: mounted editing surface behavior

### 5. `projections-and-selection-contract.tsx`

Move these runtime rows:

- `root and node ref hooks delegate DOM ownership to slate-dom`
- `projection subscriptions stay local when external decoration state changes`
- `selection-derived annotation projections track committed selection changes`
- `range-ref-backed projections support persistent annotation anchors`

Why:

- one domain: projection and ref-locality semantics
- separate from general provider hooks and from rendering primitives

### 6. `app-owned-customization.tsx`

Move these runtime rows:

- `EditableBlocks supports app-owned markdown preview projections`
- `EditableBlocks supports app-owned markdown shortcuts`
- `EditableBlocks supports app-owned forced layout enforcement`
- `EditableBlocks forced layout restores the second paragraph when only a title remains`
- `EditableBlocks supports app-owned styling surfaces`
- `EditableBlocks supports app-owned hovering toolbar state`
- `VoidElement supports app-owned editable void controls without mutating editor content`
- `EditableBlocks supports app-owned image and embed void actions`

Why:

- one domain: app-owned extension and customization surface

### 7. Keep As-Is

- [surface-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx)
- [large-doc-and-scroll.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx)
- [test-utils.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/test/test-utils.ts)

## Execution Order

Executed order:

1. Extract `provider-hooks-contract.tsx`
2. Extract `react-editor-contract.tsx`
3. Extract `primitives-contract.tsx`
4. Extract `editable-behavior.tsx`
5. Extract `projections-and-selection-contract.tsx`
6. Extract `app-owned-customization.tsx`
7. Delete `runtime.tsx`

## Editing Rules

1. Do not duplicate `mountApp` or `mountAppInShadowRoot`.
   Use [test-utils.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/test/test-utils.ts).
2. Keep imports local to each file’s domain.
3. If a moved test needs shared factory data, extract only the narrow helper.
4. Do not mix `ReactEditor` bridge rows into provider-hook files.
5. Do not mix app-owned customization rows into primitive files.
6. If one file still crosses two domains after extraction, split again in the
   same pass.

## Verification

After the full breakup:

1. `pnpm turbo build --filter=./packages/slate-react`
2. `pnpm turbo typecheck --filter=./packages/slate-react`
3. `pnpm --filter slate-react test`
4. `pnpm lint:fix`
5. LSP diagnostics on every new file
6. architect review on:
   - `surface-contract.tsx`
   - `provider-hooks-contract.tsx`
   - `react-editor-contract.tsx`
   - `primitives-contract.tsx`
   - `editable-behavior.tsx`
   - `projections-and-selection-contract.tsx`
   - `app-owned-customization.tsx`
   - `large-doc-and-scroll.tsx`
   - `test-utils.ts`

## Acceptance Criteria

- `runtime.tsx` no longer acts as the default owner for unrelated React package
  behavior
- each extracted file has one dominant behavior domain
- no helper file is matched as a test file
- package tests stay green without hidden fixture duplication
- a future agent can find the owner for a `withReact`, `ReactEditor`,
  `projection`, `primitive`, `editable behavior`, or `app-owned customization`
  regression in one file open

## Risks

- too much helper extraction turns into a utility swamp
  mitigation:
  only share mount/setup code and narrow fixture factories
- app-owned customization rows may still hide cross-domain subgroups
  mitigation:
  split again only if that file becomes another landfill
- `surface-contract.tsx` still contains some mounted behavior rows
  mitigation:
  leave it alone in this one-shot pass unless they clearly belong in one of the
  extracted files; do not widen the plan into churn for churn’s sake

## Hard Read

If you do this one-shot pass well, `runtime.tsx` stops being “the React bucket”
and becomes either tiny or dead.

That is the point.
