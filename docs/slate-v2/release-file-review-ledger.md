---
date: 2026-04-18
topic: slate-v2-file-review-ledger
status: active
---

# Slate v2 Release File Review Ledger

## Purpose

Per-file migration truth for the fresh-branch program.

Status words:

- `ported`
- `adapted`
- `pending`
- `archived`
- `post RC`

## Tranche 1 Root And Tooling Files

| File | Status | Note |
| --- | --- | --- |
| `../slate-v2/bunfig.toml` | `ported` | root Bun test discovery owner |
| `../slate-v2/bun.lock` | `ported` | live lockfile owner |
| `../slate-v2/turbo.json` | `ported` | build/type task graph |
| `../slate-v2/biome.jsonc` | `ported` | live formatting/lint owner |
| `../slate-v2/eslint.config.mjs` | `adapted` | flat config landed; repo-wide source enforcement stays staged beyond tranche 1 |
| `../slate-v2/.gitignore` | `adapted` | Bun/Turbo ignore entries added; no Yarn/PnP ignore lane kept |
| `../slate-v2/package.json` | `adapted` | Bun/Turbo/Biome graph landed; root now runs Bun 1.3.12, React 19.2.5, Next 16.2.4, TypeScript 6.0.3, hard-cuts Rollup, and drives package builds through ESM-only tsdown |
| `../slate-v2/config/babel/register.cjs` | `adapted` | source alias layer restored without `slate-browser` assumption |
| `../slate-v2/config/bun-test-setup.ts` | `ported` | Bun preload owns the workspace test bridge and path filtering |
| `../slate-v2/config/tsconfig.test.json` | `adapted` | Bun test typing now lives on the shared bundler-resolution test config |
| `../slate-v2/config/tsdown.config.mts` | `ported` | shared ESM-only package build owner |
| `../slate-v2/tsconfig.json` | `adapted` | bundler resolution, Bun test globals, and the live package refs are now the root TS owner, including `slate-browser` |
| `../slate-v2/.npmrc` | `archived` | pnpm-only config removed from the live repo |
| `../slate-v2/pnpm-workspace.yaml` | `archived` | pnpm workspace owner removed from the live repo |
| `../slate-v2/pnpm-lock.yaml` | `archived` | Bun lockfile replaces it |
| `../slate-v2/.yarnrc.yml` | `archived` | Yarn owner removed from live repo |
| `../slate-v2/yarn.lock` | `archived` | Bun lockfile replaces it |
| `../slate-v2/config/rollup/rollup.config.js` | `archived` | Rollup owner removed from live repo |
| `../slate-v2/scripts/sync-package-types.mjs` | `archived` | declaration sync step removed with the tsdown cut |

## Tranche 1 Site And Workflow Files

| File | Status | Note |
| --- | --- | --- |
| `../slate-v2/site/next.config.js` | `adapted` | Next 16-compatible turbopack config landed; invalid build-time eslint config and the old webpack-only branch are gone |
| `../slate-v2/site/pages/api/index.ts` | `ported` | site path handling matches modern repo layout |
| `../slate-v2/site/next-env.d.ts` | `adapted` | stays generated; tranche 2 route typing now comes from `.next/types` inclusion in site tsconfig instead of a manual import |
| `../slate-v2/site/tsconfig.json` | `adapted` | Next 16 site TS surface now uses bundler resolution, React JSX, explicit React types, and `.next/types` inclusion |
| `../slate-v2/site/pages/examples/[example].tsx` | `adapted` | explicit example importer map replaced the template-string dynamic import so Next 16 stops bundling `custom-types.d.ts` as a route module |
| `../slate-v2/playwright.config.ts` | `adapted` | exported-site Playwright flow now builds and serves through Bun on port 3101 |
| `../slate-v2/.github/workflows/ci.yml` | `ported` | Bun CI owner |
| `../slate-v2/.github/workflows/comment.yml` | `ported` | Bun snapshot workflow |
| `../slate-v2/.github/workflows/release.yml` | `ported` | Bun/changesets release owner |
| `../slate-v2/README.md` | `ported` | Bun/Turbo repo description |
| `../slate-v2/Readme.md` | `ported` | same |
| `../slate-v2/docs/general/contributing.md` | `ported` | contributor instructions match tranche 1 graph |

## Tranche 1 Package Manifest Files

| File | Status | Note |
| --- | --- | --- |
| `../slate-v2/packages/slate/package.json` | `adapted` | build now runs through tsdown and publishes ESM-only `dist/index.js` + `dist/index.d.ts` |
| `../slate-v2/packages/slate-history/package.json` | `adapted` | build now runs through tsdown and publishes ESM-only `dist/index.js` + `dist/index.d.ts` |
| `../slate-v2/packages/slate-hyperscript/package.json` | `adapted` | package is now explicitly module-typed and publishes ESM-only output through tsdown |
| `../slate-v2/packages/slate-browser/package.json` | `adapted` | private proof package now publishes ESM-only multi-subpath output through a package-local tsdown config |
| `../slate-v2/packages/slate-dom/package.json` | `adapted` | build now runs through tsdown and publishes ESM-only `dist/index.js` + `dist/index.d.ts` |
| `../slate-v2/packages/slate-react/package.json` | `adapted` | build now runs through tsdown, publishes ESM-only output, and keeps React 19.2.5 / React 19 peer floor |
| `../slate-v2/packages/slate-browser/README.md` | `adapted` | package docs now describe the Bun-era package-local and root convenience commands only |
| `../slate-v2/packages/slate-browser/tsconfig.build.json` | `ported` | build-time declaration owner for the proof package |
| `../slate-v2/packages/slate-browser/tsconfig.test.json` | `adapted` | source + browser-test typecheck owner without cross-runtime Bun/Vitest global conflicts |
| `../slate-v2/packages/slate-browser/tsdown.config.mts` | `adapted` | package-local multi-entry build owner for `browser`, `core`, `playwright`, and `transports` subpaths |
| `../slate-v2/packages/slate-history/tsconfig.build.json` | `ported` | build-time declaration owner |
| `../slate-v2/packages/slate-dom/tsconfig.build.json` | `ported` | build-time declaration owner |
| `../slate-v2/packages/slate-react/tsconfig.build.json` | `ported` | build-time declaration owner |

## Tranche 2 Runtime And Compatibility Files

| File | Status | Note |
| --- | --- | --- |
| `../slate-v2/config/typescript/tsconfig.json` | `adapted` | TS6 baseline moved the repo onto bundler resolution and dropped the deprecated node resolver |
| `../slate-v2/playwright/tsconfig.json` | `adapted` | Playwright TS now matches the modern ESM/Bundler toolchain, TS6 baseline, and explicit Node typing |
| `../slate-v2/site/tsconfig.example.json` | `adapted` | example TS config now matches the live bundler-resolution baseline |
| `../slate-v2/packages/slate-react/src/components/editable.tsx` | `adapted` | React 19 type fallout was closed with strict `useRef` init and input-event typing fixes only |
| `../slate-v2/packages/slate-react/src/components/restore-dom/restore-dom.tsx` | `adapted` | null-aware ref typing landed for React 19 without changing restore timing |
| `../slate-v2/packages/slate-react/src/hooks/android-input-manager/use-android-input-manager.ts` | `adapted` | ref typing widened to the real DOM-ref shape under React 19 |
| `../slate-v2/packages/slate-react/src/hooks/use-generic-selector.tsx` | `adapted` | stricter React 19 `useRef` initialization landed without selector behavior drift |
| `../slate-v2/packages/slate-react/src/hooks/use-mutation-observer.ts` | `adapted` | null-aware ref typing landed without mutation-observer behavior drift |
| `../slate-v2/packages/slate-hyperscript/src/creators.ts` | `adapted` | TS6 tightened `find()` results, so the selection creator now narrows `anchor` and `focus` honestly before use |
| `../slate-v2/site/examples/ts/code-highlighting.tsx` | `adapted` | TS6 tightened `Transforms.setNodes` inference, so the example now narrows the code-block setNodes call explicitly without behavior drift |

## Docs Split

| Path | Status | Note |
| --- | --- | --- |
| `docs/slate-v2-draft/**` | `ported` | archived prior doc stack |
| `docs/slate-v2/**` | `adapted` | rewritten live ownership stack |

## Deferred Rows

| Row | Status | Note |
| --- | --- | --- |
| slate-browser root e2e/proof/benchmark command surface | `post RC` | package-local suite landed; broader root proof lanes still wait on owned example/benchmark adoption |
| repo-wide ESLint source enforcement | `post RC` | package-by-package rollout after source recovery starts |

## Remaining-Work Rule

Remaining package/source work is merged-corpus-driven and row-scoped.

This ledger does not authorize a blanket same-path rewrite of the remaining
packages.

It also does not authorize rewrite-avoidance as a value.

The next honest step is:

1. settle `packages/slate` around the native transaction / snapshot-store API
2. classify compatibility baggage explicitly instead of preserving it by reflex
3. only then reopen the support packages against that settled core

## Runtime Recovery Snapshot

These rows bring the live control ledger back into line with the stronger
package/runtime truth already captured in the draft stack.

- [x] extension model / behavior interception
  proof owner: `true-slate-rc-proof-ledger.md`
  note: closed on the current instance-method and transaction-boundary model
- [x] schema / normalization extensibility
  proof owner: `true-slate-rc-proof-ledger.md`
  note: current default-vs-explicit normalization split is the live contract
- [x] non-React / headless core usability
  proof owner: `true-slate-rc-proof-ledger.md`
  note: headless composition across `slate`, `slate-history`, and
  `slate-hyperscript` is a kept live claim
- [x] operation-history-collaboration integrity
  proof owner: `true-slate-rc-proof-ledger.md`
  note: local operation/history substrate is closed; external collaboration
  adapters remain external
- [ ] broad API / public surface reconciliation
  proof owner: `true-slate-rc-proof-ledger.md`
  note: still open under the merged-corpus audit because helper presence and
  nearby green harness rows are not enough
- [x] major file/test deletion review
  proof owner: `release-file-review-ledger.md`
  note: deletion closure is materially done; example parity is a different lane

## Package-Level Deletion And Recovery Trees

- [x] `packages/slate/test/**`
  proof owner: `true-slate-rc-proof-ledger.md`
  note: deleted core test-family bucket is closed as archaeology; kept rows are
  now being re-driven through the merged corpus
- [x] `packages/slate-react/**`
  proof owner: `release-file-review-ledger.md`
  note: deleted family closure is banked; kept runtime behavior is still owned
  by the live API/example/browser lanes
- [x] `packages/slate-history/**`
  proof owner: `release-file-review-ledger.md`
  note: deleted family closure is banked; direct `history-contract.ts`,
  `integrity-contract.ts`, and `bench:history:compare:local` are now live, so
  this package is no longer the tranche-4 blocker
- [x] `playwright/integration/examples/**`
  proof owner: `docs/slate-browser/proof-lane-matrix.md`
  note: deleted-file accounting is closed; example parity remains open

## Current Recovery Rows

### `packages/slate`

- `../slate-v2/packages/slate/test/query-contract.ts`
  disposition: restored
  proof owner: `true-slate-rc-proof-ledger.md`
  note: direct query owner is back in the live repo and green
- `../slate-v2/packages/slate/test/legacy-editor-nodes-fixtures.ts`
  disposition: restored
  proof owner: `true-slate-rc-proof-ledger.md`
  note: direct `Editor.nodes/**` legacy oracle owner is back and green
- `../slate-v2/packages/slate/test/legacy-interfaces-fixtures.ts`
  disposition: restored
  proof owner: `true-slate-rc-proof-ledger.md`
  note: direct non-Editor interface oracle owner is back and green
- `../slate-v2/packages/slate/test/legacy-fixture-utils.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: legacy fixture loading now runs on the Bun-era toolchain instead of
  dead Babel assumptions
- `../slate-v2/packages/slate/src/editor/unhang-range.ts`
  disposition: adapted
  proof owner: `query-contract.ts`
  note: current void-aware unhang behavior now matches the restored query rows
- `../slate-v2/packages/slate/src/editor/positions.ts`
  disposition: adapted
  proof owner: `query-contract.ts`
  note: current positions iterator now matches the restored `voids` row
- `../slate-v2/packages/slate/src/editor/fragment.ts`
  disposition: adapted
  proof owner: `query-contract.ts`
  note: collapsed fragment reads now fail closed to `[]` on the restored query
  seam

### `packages/slate-history`

- `../slate-v2/packages/slate-history/src/history.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: live `History` / `HistoryBatch` surface is restored in place
- `../slate-v2/packages/slate-history/src/history-editor.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: history helper surface carries merge/save/split-once state
- `../slate-v2/packages/slate-history/src/with-history.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: commit-time history capture now derives from the committed publish seam,
  and undo/redo replay runs inside one outer transaction per history batch
- `../slate-v2/packages/slate-history/test/history-contract.ts`
  disposition: created
  proof owner: `true-slate-rc-proof-ledger.md`
  note: kept undo/redo parity rows now have a direct owner
- `../slate-v2/packages/slate-history/test/integrity-contract.ts`
  disposition: created
  proof owner: `true-slate-rc-proof-ledger.md`
  note: batching, save/merge flags, stack-write seam, and commit-before-onChange
  capture now have a direct owner
- `../slate-v2/scripts/benchmarks/core/compare/history.mjs`
  disposition: created
  proof owner: `true-slate-rc-proof-ledger.md`
  note: live `slate-history` compare owner is restored under Bun

### `packages/slate-react`

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: mounted root, clipboard, and current Editable behavior are reviewed as
  live seams
- `../slate-v2/packages/slate-react/src/plugin/react-editor.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: current ReactEditor helper namespace is a real kept surface
- `../slate-v2/packages/slate-react/src/plugin/with-react.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: withReact remains a real compatibility construction helper
- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused provider/hooks proof is now real and green
- `../slate-v2/packages/slate-react/test/react-editor-contract.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused ReactEditor proof is now real and green
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused surface proof now owns translate policy, mount identity, and
  path-rebasing stability
- `../slate-v2/packages/slate-react/test/editable-behavior.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused Editable proof now owns callback partition and current value-vs-selection change behavior
- `../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused projection/runtime proof now owns overlap-safe splitting, ancestor/editor propagation, and path-shift stability
- `../slate-v2/packages/slate-react/src/annotation-store.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: first source-backed annotation store now exists over core bookmarks and projected runtime-id slices
- `../slate-v2/packages/slate-react/src/projection-context.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: source-backed projection provider context now exists instead of keeping projection wiring implicit inside one hook file
- `../slate-v2/packages/slate-react/src/projection-store.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: source-backed projection store now exists as a public runtime surface instead of hiding projection logic behind local hooks only
- `../slate-v2/packages/slate-react/src/context.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: runtime-id and element-path contexts now exist as first-class public support surface
- `../slate-v2/packages/slate-react/src/hooks/use-slate-node-ref.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: runtime-id DOM binding hook now also seeds plain-editor DOM key maps so
  app-owned selection/scroll rows can resolve text nodes honestly
- `../slate-v2/packages/slate-react/src/hooks/use-slate-selector.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: selector context now wakes plain editors as well as withReact editors
- `../slate-v2/packages/slate-react/src/components/slate.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: provider no longer churns runtime ids on auto-wrapped app-owned
  surfaces, and plain-editor changes now reach selector subscribers
- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: public `Editable` now keeps projection/runtime ids stable,
  forwards app-owned block behavior honestly, and owns the shell/promotion
  large-document surface
- `../slate-v2/packages/slate-react/src/large-document/create-island-plan.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: island planning now exists as an explicit large-document runtime seam
- `../slate-v2/packages/slate-react/src/large-document/classify-island-kind.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: shell previews now classify island semantics instead of rendering flat
  anonymous shells
- `../slate-v2/packages/slate-react/src/large-document/island-shell.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: inactive large-document islands now have a real shell owner with
  preview and promotion behavior
- `../slate-v2/packages/slate-react/src/large-document/large-document-commands.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: shell-backed selection and full-document large-doc commands now have a
  named runtime owner
- `../slate-v2/packages/slate-react/src/hooks/use-slate-annotation-store.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: source-backed annotation-store hook now exists as its own public surface
- `../slate-v2/packages/slate-react/src/hooks/use-slate-widget-store.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: source-backed widget-store hook now exists as its own public surface
- `../slate-v2/packages/slate-react/src/components/slate-element.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public element host surface is now real
- `../slate-v2/packages/slate-react/src/components/slate-spacer.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public spacer surface is now real
- `../slate-v2/packages/slate-react/src/components/slate-leaf.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public leaf surface is now real
- `../slate-v2/packages/slate-react/src/components/slate-text.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public text-node surface is now real
- `../slate-v2/packages/slate-react/src/components/slate-placeholder.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public placeholder surface is now real
- `../slate-v2/packages/slate-react/src/components/text-string.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public text-string surface is now real
- `../slate-v2/packages/slate-react/src/components/zero-width-string.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public zero-width surface is now real
- `../slate-v2/packages/slate-react/src/components/editable-element.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public editable element wrapper is now real
- `../slate-v2/packages/slate-react/src/components/void-element.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public void wrapper surface is now real
- `../slate-v2/packages/slate-react/test/primitives-contract.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused primitive proof now owns the recovered low-level public runtime surface
- `../slate-v2/packages/slate-react/test/annotation-store-contract.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused annotation proof now owns bookmark-backed range rebasing and projection-slice publication
- `../slate-v2/packages/slate-react/src/widget-store.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: first source-backed widget store now exists for selection-driven widget visibility with local subscriptions
- `../slate-v2/packages/slate-react/test/widget-layer-contract.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused widget proof now owns local widget visibility and no-text-rerender selection widget behavior
- `../slate-v2/packages/slate-react/test/app-owned-customization.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused app-owned proof now owns markdown projections, markdown
  shortcuts, forced layout, and app-owned scroll forwarding
- `../slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused large-document proof now owns shelling, shell promotion,
  shell-backed full-document selection, shell-backed paste, and the kept scroll
  forwarding seam
- `../slate-v2/packages/slate-react/test/with-react-contract.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused withReact proof now owns the Android pending-selection
  compatibility seam directly

### `packages/slate-dom`

- `../slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: mounted DOM bridge behavior still lives here, but it now also has a
  direct package proof owner
- `../slate-v2/packages/slate-dom/src/plugin/with-dom.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: clipboard boundary behavior still lives here, and shifted node keys are
  now preserved across insert/remove paths so mounted React surfaces keep their
  DOM identity; decorated multi-leaf clipboard export also strips render-only
  wrappers from copied HTML
- `../slate-v2/packages/slate-dom/test/bridge.ts`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: direct package bridge proof now owns path/point/range translation and
  decorated offset behavior
- `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: direct package clipboard-boundary proof now owns fragment payload, HTML
  fallback, and plain-text fallback behavior

### `packages/slate-browser`

- `../slate-v2/packages/slate-browser/src/playwright/index.ts`
  disposition: adapted
  proof owner: `docs/slate-browser/proof-lane-matrix.md`
  note: editor-first Playwright harness owns current example e2e, IME, anchor,
  and replacement matrix routing

### `packages/slate-hyperscript`

- `../slate-v2/packages/slate-hyperscript/src/index.ts`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: public hyperscript export surface still matches the kept package claim
- `../slate-v2/packages/slate-hyperscript/src/hyperscript.ts`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: factory and shorthand creation surface remains source-compatible
- `../slate-v2/packages/slate-hyperscript/test/index.spec.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: fixture parsing and cursor/selection construction stay owned by the Bun fixture runner
- `../slate-v2/packages/slate-hyperscript/test/smoke-contract.ts`
  disposition: added
  proof owner: `true-slate-rc-proof-ledger.md`
  note: draft smoke rows now have a direct Bun-owned proof owner instead of stale Mocha-only closure language

## V2 North-Star Rows

These rows are not optional value-add.
Broader browser/input parity that does not currently map to live repo files
stays tracked in `true-slate-rc-proof-ledger.md`, not as fake file rows here.

| Row | Status | Why it matters |
| --- | --- | --- |
| `../slate-v2/site/examples/ts/highlighted-text.tsx` | `adapted` | overlap-safe highlight rendering now exists on the kept `createSlateProjectionStore` + `Editable` surface |
| `../slate-v2/site/examples/ts/persistent-annotation-anchors.tsx` | `adapted` | durable annotation anchors now exist on the kept annotation store + projection store + annotation-widget surface |
| `../slate-v2/site/examples/ts/external-decoration-sources.tsx` | `adapted` | explicit external overlay sources now exist on the kept projection-store + external refresh surface |
| `../slate-v2/site/examples/ts/review-comments.tsx` | `adapted` | comments/review UI now exists on the kept annotation store + widget store + inline review slice surface |
| `../slate-v2/playwright/integration/examples/highlighted-text.test.ts` | `adapted` | Chromium proof now owns highlight overlap selection, typing, and clipboard semantics without wrapper leakage |
| `../slate-v2/playwright/integration/examples/persistent-annotation-anchors.test.ts` | `adapted` | Chromium proof now owns bookmark-backed anchor persistence across fragment and text edits |
| `../slate-v2/playwright/integration/examples/external-decoration-sources.test.ts` | `adapted` | Chromium proof now owns explicit external overlay refresh behavior |
| `../slate-v2/playwright/integration/examples/review-comments.test.ts` | `adapted` | Chromium proof now owns comment creation, inline review slices, sidebar state, and annotation-backed widget visibility |
| `../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx` | `adapted` | explicit projection/runtime contract owner is green on the kept overlay runtime |
| `../slate-v2/packages/slate-react/test/annotation-store-contract.tsx` | `adapted` | explicit annotation runtime contract owner is green on the kept annotation store path |
| `../slate-v2/packages/slate-react/test/widget-layer-contract.tsx` | `adapted` | explicit widget runtime contract owner is green on the kept widget-store path |
| `../slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx` | `adapted` | explicit large-doc runtime contract owner is green on the kept semantic-islands corridor surface |

## Current Read

This ledger is no longer infra-only.

- tranche 1/2 root and compatibility truth still stands
- package/runtime recovery rows are now explicitly represented here
- further runtime closure still belongs to the merged corpora, package API
  ledgers, and proof owners, not to hand-wavy family closure language
