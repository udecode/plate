---
date: 2026-04-18
topic: plite-file-review-ledger
status: active
---

# Plite Release File Review Ledger

## Purpose

Per-file migration truth for the fresh-branch program.

Status words:

- `ported`
- `adapted`
- `pending`
- `archived`
- `post RC`

## Tranche 1 Root And Tooling Files

| File                                           | Status     | Note                                                                                                                                                                     |
| ---------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Plate repo root/bunfig.toml`                    | `ported`   | root Bun test discovery owner                                                                                                                                            |
| `Plate repo root/bun.lock`                       | `ported`   | live lockfile owner                                                                                                                                                      |
| `Plate repo root/turbo.json`                     | `ported`   | build/type task graph                                                                                                                                                    |
| `Plate repo root/biome.jsonc`                    | `ported`   | live formatting/lint owner                                                                                                                                               |
| `Plate repo root/eslint.config.mjs`              | `adapted`  | flat config landed; repo-wide source enforcement stays staged beyond tranche 1                                                                                           |
| `Plate repo root/.gitignore`                     | `adapted`  | Bun/Turbo ignore entries added; no Yarn/PnP ignore lane kept                                                                                                             |
| `Plate repo root/package.json`                   | `adapted`  | Bun/Turbo/Biome graph landed; root now runs Bun 1.3.12, React 19.2.5, Next 16.2.4, TypeScript 6.0.3, hard-cuts Rollup, and drives package builds through ESM-only tsdown |
| `Plate repo root/config/babel/register.cjs`      | `adapted`  | source alias layer restored without `plite-browser` assumption                                                                                                           |
| `Plate repo root/config/bun-test-setup.ts`       | `ported`   | Bun preload owns the workspace test bridge and path filtering                                                                                                            |
| `Plate repo root/config/tsconfig.test.json`      | `adapted`  | Bun test typing now lives on the shared bundler-resolution test config                                                                                                   |
| `Plate repo root/config/tsdown.config.mts`       | `ported`   | shared ESM-only package build owner                                                                                                                                      |
| `Plate repo root/tsconfig.json`                  | `adapted`  | bundler resolution, Bun test globals, and the live package refs are now the root TS owner, including `plite-browser`                                                     |
| `Plate repo root/.npmrc`                         | `archived` | pnpm-only config removed from the live repo                                                                                                                              |
| `Plate repo root/pnpm-workspace.yaml`            | `archived` | pnpm workspace owner removed from the live repo                                                                                                                          |
| `Plate repo root/pnpm-lock.yaml`                 | `archived` | Bun lockfile replaces it                                                                                                                                                 |
| `Plate repo root/.yarnrc.yml`                    | `archived` | Yarn owner removed from live repo                                                                                                                                        |
| `Plate repo root/yarn.lock`                      | `archived` | Bun lockfile replaces it                                                                                                                                                 |
| `Plate repo root/config/rollup/rollup.config.js` | `archived` | Rollup owner removed from live repo                                                                                                                                      |
| `tooling/plite/donor/sync-package-types.mjs` | `archived` | declaration sync step removed with the tsdown cut                                                                                                                        |

## Tranche 1 Site And Workflow Files

| File                                              | Status    | Note                                                                                                                                      |
| ------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/www/next.config.js`               | `adapted` | Next 16-compatible turbopack config landed; invalid build-time eslint config and the old webpack-only branch are gone                     |
| `apps/www/pages/api/index.ts`           | `ported`  | site path handling matches modern repo layout                                                                                             |
| `apps/www/next-env.d.ts`                | `adapted` | stays generated; tranche 2 route typing now comes from `.next/types` inclusion in site tsconfig instead of a manual import                |
| `apps/www/tsconfig.json`                | `adapted` | Next 16 site TS surface now uses bundler resolution, React JSX, explicit React types, and `.next/types` inclusion                         |
| `apps/www/src/app/(app)/examples/plite/[example].tsx` | `adapted` | explicit example importer map replaced the template-string dynamic import so Next 16 stops bundling `custom-types.d.ts` as a route module |
| `Plate repo root/playwright.config.ts`              | `adapted` | exported-site Playwright flow now builds and serves through Bun on port 3101                                                              |
| `Plate repo root/.github/workflows/ci.yml`          | `ported`  | Bun CI owner                                                                                                                              |
| `Plate repo root/.github/workflows/comment.yml`     | `ported`  | Bun snapshot workflow                                                                                                                     |
| `Plate repo root/.github/workflows/release.yml`     | `ported`  | Bun/changesets release owner                                                                                                              |
| `Plate repo root/README.md`                         | `ported`  | Bun/Turbo repo description                                                                                                                |
| `Plate repo root/Readme.md`                         | `ported`  | same                                                                                                                                      |
| `content/docs/plite/general/contributing.md`      | `ported`  | contributor instructions match tranche 1 graph                                                                                            |

## Tranche 1 Package Manifest Files

| File                                                       | Status    | Note                                                                                                    |
| ---------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| `packages/plite/package.json`                | `adapted` | build now runs through tsdown and publishes ESM-only `dist/index.js` + `dist/index.d.ts`                |
| `packages/plite-history/package.json`        | `adapted` | build now runs through tsdown and publishes ESM-only `dist/index.js` + `dist/index.d.ts`                |
| `packages/plite-hyperscript/package.json`    | `adapted` | package is now explicitly module-typed and publishes ESM-only output through tsdown                     |
| `packages/browser/package.json`        | `adapted` | private proof package now publishes ESM-only multi-subpath output through a package-local tsdown config |
| `packages/plite-dom/package.json`            | `adapted` | build now runs through tsdown and publishes ESM-only `dist/index.js` + `dist/index.d.ts`                |
| `packages/plite-react/package.json`          | `adapted` | build now runs through tsdown, publishes ESM-only output, and keeps React 19.2.5 / React 19 peer floor  |
| `packages/browser/README.md`           | `adapted` | package docs now describe the Bun-era package-local and root convenience commands only                  |
| `packages/browser/tsconfig.build.json` | `ported`  | build-time declaration owner for the proof package                                                      |
| `packages/browser/tsconfig.test.json`  | `adapted` | source + browser-test typecheck owner without cross-runtime Bun/Vitest global conflicts                 |
| `packages/browser/tsdown.config.mts`   | `adapted` | package-local multi-entry build owner for `browser`, `core`, `playwright`, and `transports` subpaths    |
| `packages/plite-history/tsconfig.build.json` | `ported`  | build-time declaration owner                                                                            |
| `packages/plite-dom/tsconfig.build.json`     | `ported`  | build-time declaration owner                                                                            |
| `packages/plite-react/tsconfig.build.json`   | `ported`  | build-time declaration owner                                                                            |

## Tranche 2 Runtime And Compatibility Files

| File                                                                                              | Status    | Note                                                                                                                                     |
| ------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `Plate repo root/config/typescript/tsconfig.json`                                                   | `adapted` | TS6 baseline moved the repo onto bundler resolution and dropped the deprecated node resolver                                             |
| `Plate repo root/playwright/tsconfig.json`                                                          | `adapted` | Playwright TS now matches the modern ESM/Bundler toolchain, TS6 baseline, and explicit Node typing                                       |
| `apps/www/tsconfig.example.json`                                                        | `adapted` | example TS config now matches the live bundler-resolution baseline                                                                       |
| `packages/plite-react/src/components/editable.tsx`                                  | `adapted` | React 19 type fallout was closed with strict `useRef` init and input-event typing fixes only                                             |
| `packages/plite-react/src/components/restore-dom/restore-dom.tsx`                   | `adapted` | null-aware ref typing landed for React 19 without changing restore timing                                                                |
| `packages/plite-react/src/hooks/android-input-manager/use-android-input-manager.ts` | `adapted` | ref typing widened to the real DOM-ref shape under React 19                                                                              |
| `packages/plite-react/src/hooks/use-generic-selector.tsx`                           | `adapted` | stricter React 19 `useRef` initialization landed without selector behavior drift                                                         |
| `packages/plite-react/src/hooks/use-mutation-observer.ts`                           | `adapted` | null-aware ref typing landed without mutation-observer behavior drift                                                                    |
| `packages/plite-hyperscript/src/creators.ts`                                        | `adapted` | TS6 tightened `find()` results, so the selection creator now narrows `anchor` and `focus` honestly before use                            |
| `apps/www/src/app/(app)/examples/plite/_examples/code-highlighting.tsx`                                            | `adapted` | TS6 tightened `Transforms.setNodes` inference, so the example now narrows the code-block setNodes call explicitly without behavior drift |

## Docs Split

| Path                     | Status    | Note                           |
| ------------------------ | --------- | ------------------------------ |
| `docs/plite-draft/**` | `ported`  | archived prior doc stack       |
| `docs/plite/**`       | `adapted` | rewritten live ownership stack |

## Deferred Rows

| Row                                                    | Status    | Note                                                                                                |
| ------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------- |
| plite-browser root e2e/proof/benchmark command surface | `post RC` | package-local suite landed; broader root proof lanes still wait on owned example/benchmark adoption |
| repo-wide ESLint source enforcement                    | `post RC` | package-by-package rollout after source recovery starts                                             |

## Remaining-Work Rule

Remaining package/source work is merged-corpus-driven and row-scoped.

This ledger does not authorize a blanket same-path rewrite of the remaining
packages.

It also does not authorize rewrite-avoidance as a value.

The next honest step is:

1. settle `packages/plite` around the native transaction / snapshot-store API
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
      note: headless composition across `slate`, `plite-history`, and
      `plite-hyperscript` is a kept live claim
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

- [x] `packages/plite/test/**`
      proof owner: `true-slate-rc-proof-ledger.md`
      note: deleted core test-family bucket is closed as archaeology; kept rows are
      now being re-driven through the merged corpus
- [x] `packages/plite-react/**`
      proof owner: `release-file-review-ledger.md`
      note: deleted family closure is banked; kept runtime behavior is still owned
      by the live API/example/browser lanes
- [x] `packages/plite-history/**`
      proof owner: `release-file-review-ledger.md`
      note: deleted family closure is banked; direct `history-contract.ts`,
      `integrity-contract.ts`, and `bench:history:compare:local` are now live, so
      this package is no longer the tranche-4 blocker
- [x] `playwright/integration/examples/**`
      proof owner: `docs/plite-browser/proof-lane-matrix.md`
      note: deleted-file accounting is closed; example parity remains open

## Current Recovery Rows

### `packages/plite`

- `packages/plite/test/query-contract.ts`
  disposition: restored
  proof owner: `true-slate-rc-proof-ledger.md`
  note: direct query owner is back in the live repo and green
- `packages/plite/test/legacy-editor-nodes-fixtures.ts`
  disposition: restored
  proof owner: `true-slate-rc-proof-ledger.md`
  note: direct `Editor.nodes/**` legacy oracle owner is back and green
- `packages/plite/test/legacy-interfaces-fixtures.ts`
  disposition: restored
  proof owner: `true-slate-rc-proof-ledger.md`
  note: direct non-Editor interface oracle owner is back and green
- `packages/plite/test/legacy-fixture-utils.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: legacy fixture loading now runs on the Bun-era toolchain instead of
  dead Babel assumptions
- `packages/plite/src/editor/unhang-range.ts`
  disposition: adapted
  proof owner: `query-contract.ts`
  note: current void-aware unhang behavior now matches the restored query rows
- `packages/plite/src/editor/positions.ts`
  disposition: adapted
  proof owner: `query-contract.ts`
  note: current positions iterator now matches the restored `voids` row
- `packages/plite/src/editor/fragment.ts`
  disposition: adapted
  proof owner: `query-contract.ts`
  note: collapsed fragment reads now fail closed to `[]` on the restored query
  seam

### `packages/plite-history`

- `packages/plite-history/src/history.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: live `History` / `HistoryBatch` surface is restored in place
- `packages/plite-history/src/history-editor.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: history helper surface carries merge/save/split-once state
- `packages/plite-history/src/with-history.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: commit-time history capture now derives from the committed publish seam,
  and undo/redo replay runs inside one outer transaction per history batch
- `packages/plite-history/test/history-contract.ts`
  disposition: created
  proof owner: `true-slate-rc-proof-ledger.md`
  note: kept undo/redo parity rows now have a direct owner
- `packages/plite-history/test/integrity-contract.ts`
  disposition: created
  proof owner: `true-slate-rc-proof-ledger.md`
  note: batching, save/merge flags, stack-write seam, and commit-before-onChange
  capture now have a direct owner
- `benchmarks/plite/donor/core/compare/history.mjs`
  disposition: created
  proof owner: `true-slate-rc-proof-ledger.md`
  note: live `plite-history` compare owner is restored under Bun

### `packages/plite-react`

- `packages/plite-react/src/components/editable.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: mounted root, clipboard, and current Editable behavior are reviewed as
  live seams
- `packages/plite-react/src/plugin/react-editor.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: current ReactEditor helper namespace is a real kept surface
- `packages/plite-react/src/plugin/with-react.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: withReact remains a real compatibility construction helper
- `packages/plite-react/test/provider-hooks-contract.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused provider/hooks proof is now real and green
- `packages/plite-react/test/react-editor-contract.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused ReactEditor proof is now real and green
- `packages/plite-react/test/surface-contract.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused surface proof now owns translate policy, mount identity, and
  path-rebasing stability
- `packages/plite-react/test/editable-behavior.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused Editable proof now owns callback partition and current value-vs-selection change behavior
- `packages/plite-react/test/projections-and-selection-contract.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused projection/runtime proof now owns overlap-safe splitting, ancestor/editor propagation, and path-shift stability
- `packages/plite-react/src/annotation-store.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: first source-backed annotation store now exists over core bookmarks and projected runtime-id slices
- `packages/plite-react/src/projection-context.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: source-backed projection provider context now exists instead of keeping projection wiring implicit inside one hook file
- `packages/plite-react/src/projection-store.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: source-backed projection store now exists as a public runtime surface instead of hiding projection logic behind local hooks only
- `packages/plite-react/src/context.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: runtime-id and element-path contexts now exist as first-class public support surface
- `packages/plite-react/src/hooks/use-plite-node-ref.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: runtime-id DOM binding hook now also seeds plain-editor DOM key maps so
  app-owned selection/scroll rows can resolve text nodes honestly
- `packages/plite-react/src/hooks/use-slate-selector.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: selector context now wakes plain editors as well as withReact editors
- `packages/plite-react/src/components/slate.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: provider no longer churns runtime ids on auto-wrapped app-owned
  surfaces, and plain-editor changes now reach selector subscribers
- `packages/plite-react/src/components/editable-text-blocks.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: public `Editable` now keeps projection/runtime ids stable,
  forwards app-owned block behavior honestly, and owns the shell/promotion
  large-document surface
- `packages/plite-react/src/large-document/create-island-plan.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: island planning now exists as an explicit large-document runtime seam
- `packages/plite-react/src/large-document/classify-island-kind.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: shell previews now classify island semantics instead of rendering flat
  anonymous shells
- `packages/plite-react/src/large-document/island-shell.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: inactive large-document islands now have a real shell owner with
  preview and promotion behavior
- `packages/plite-react/src/large-document/large-document-commands.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: shell-backed selection and full-document large-doc commands now have a
  named runtime owner
- `packages/plite-react/src/hooks/use-slate-annotation-store.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: source-backed annotation-store hook now exists as its own public surface
- `packages/plite-react/src/hooks/use-slate-widget-store.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: source-backed widget-store hook now exists as its own public surface
- `packages/plite-react/src/components/slate-element.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public element host surface is now real
- `packages/plite-react/src/components/slate-spacer.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public spacer surface is now real
- `packages/plite-react/src/components/slate-leaf.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public leaf surface is now real
- `packages/plite-react/src/components/slate-text.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public text-node surface is now real
- `packages/plite-react/src/components/slate-placeholder.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public placeholder surface is now real
- `packages/plite-react/src/components/text-string.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public text-string surface is now real
- `packages/plite-react/src/components/zero-width-string.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public zero-width surface is now real
- `packages/plite-react/src/components/editable-element.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public editable element wrapper is now real
- `packages/plite-react/src/components/void-element.tsx`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: low-level public void wrapper surface is now real
- `packages/plite-react/test/primitives-contract.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused primitive proof now owns the recovered low-level public runtime surface
- `packages/plite-react/test/annotation-store-contract.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused annotation proof now owns bookmark-backed range rebasing and projection-slice publication
- `packages/plite-react/src/widget-store.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: first source-backed widget store now exists for selection-driven widget visibility with local subscriptions
- `packages/plite-react/test/widget-layer-contract.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused widget proof now owns local widget visibility and no-text-rerender selection widget behavior
- `packages/plite-react/test/app-owned-customization.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused app-owned proof now owns markdown projections, markdown
  shortcuts, forced layout, and app-owned scroll forwarding
- `packages/plite-react/test/large-doc-and-scroll.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused large-document proof now owns shelling, shell promotion,
  shell-backed full-document selection, shell-backed paste, and the kept scroll
  forwarding seam
- `packages/plite-react/test/with-react-contract.tsx`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: focused withReact proof now owns the Android pending-selection
  compatibility seam directly

### `packages/plite-dom`

- `packages/plite-dom/src/plugin/dom-editor.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: mounted DOM bridge behavior still lives here, but it now also has a
  direct package proof owner
- `packages/plite-dom/src/plugin/with-dom.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: clipboard boundary behavior still lives here, and shifted node keys are
  now preserved across insert/remove paths so mounted React surfaces keep their
  DOM identity; decorated multi-leaf clipboard export also strips render-only
  wrappers from copied HTML
- `packages/plite-dom/test/bridge.ts`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: direct package bridge proof now owns path/point/range translation and
  decorated offset behavior
- `packages/plite-dom/test/clipboard-boundary.ts`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: direct package clipboard-boundary proof now owns fragment payload, HTML
  fallback, and plain-text fallback behavior

### `packages/plite-browser`

- `packages/browser/src/playwright/index.ts`
  disposition: adapted
  proof owner: `docs/plite-browser/proof-lane-matrix.md`
  note: editor-first Playwright harness owns current example e2e, IME, anchor,
  and replacement matrix routing

### `packages/plite-hyperscript`

- `packages/plite-hyperscript/src/index.ts`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: public hyperscript export surface still matches the kept package claim
- `packages/plite-hyperscript/src/hyperscript.ts`
  disposition: preserved
  proof owner: `true-slate-rc-proof-ledger.md`
  note: factory and shorthand creation surface remains source-compatible
- `packages/plite-hyperscript/test/index.spec.ts`
  disposition: adapted
  proof owner: `true-slate-rc-proof-ledger.md`
  note: fixture parsing and cursor/selection construction stay owned by the Bun fixture runner
- `packages/plite-hyperscript/test/smoke-contract.ts`
  disposition: added
  proof owner: `true-slate-rc-proof-ledger.md`
  note: draft smoke rows now have a direct Bun-owned proof owner instead of stale Mocha-only closure language

## V2 North-Star Rows

These rows are not optional value-add.
Broader browser/input parity that does not currently map to live repo files
stays tracked in `true-slate-rc-proof-ledger.md`, not as fake file rows here.

| Row                                                                                   | Status    | Why it matters                                                                                                         |
| ------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `apps/www/src/app/(app)/examples/plite/_examples/highlighted-text.tsx`                                 | `adapted` | overlap-safe highlight rendering now exists on the kept `createPliteProjectionStore` + `Editable` surface              |
| `apps/www/src/app/(app)/examples/plite/_examples/persistent-annotation-anchors.tsx`                    | `adapted` | durable annotation anchors now exist on the kept annotation store + projection store + annotation-widget surface       |
| `apps/www/src/app/(app)/examples/plite/_examples/external-decoration-sources.tsx`                      | `adapted` | explicit external overlay sources now exist on the kept projection-store + external refresh surface                    |
| `apps/www/src/app/(app)/examples/plite/_examples/review-comments.tsx`                                  | `adapted` | comments/review UI now exists on the kept annotation store + widget store + inline review slice surface                |
| `apps/www/tests/plite-browser/donor/examples/highlighted-text.test.ts`              | `adapted` | Chromium proof now owns highlight overlap selection, typing, and clipboard semantics without wrapper leakage           |
| `apps/www/tests/plite-browser/donor/examples/persistent-annotation-anchors.test.ts` | `adapted` | Chromium proof now owns bookmark-backed anchor persistence across fragment and text edits                              |
| `apps/www/tests/plite-browser/donor/examples/external-decoration-sources.test.ts`   | `adapted` | Chromium proof now owns explicit external overlay refresh behavior                                                     |
| `apps/www/tests/plite-browser/donor/examples/review-comments.test.ts`               | `adapted` | Chromium proof now owns comment creation, inline review slices, sidebar state, and annotation-backed widget visibility |
| `packages/plite-react/test/projections-and-selection-contract.tsx`      | `adapted` | explicit projection/runtime contract owner is green on the kept overlay runtime                                        |
| `packages/plite-react/test/annotation-store-contract.tsx`               | `adapted` | explicit annotation runtime contract owner is green on the kept annotation store path                                  |
| `packages/plite-react/test/widget-layer-contract.tsx`                   | `adapted` | explicit widget runtime contract owner is green on the kept widget-store path                                          |
| `packages/plite-react/test/large-doc-and-scroll.tsx`                    | `adapted` | explicit large-doc runtime contract owner is green on the kept semantic-islands corridor surface                       |

## Current Read

This ledger is no longer infra-only.

- tranche 1/2 root and compatibility truth still stands
- package/runtime recovery rows are now explicitly represented here
- further runtime closure still belongs to the merged corpora, package API
  ledgers, and proof owners, not to hand-wavy family closure language
