# Core runtime adapter checkpoint

Context:
- Safe package-by-package Slate v2 primitive migration is mostly closed.
- `packages/core` and `packages/plate` still depend on `@platejs/slate-legacy`.
- `packages/plate` stays green because it re-exports the legacy surface.
- After loop 312, migration scanner reports only the intentional
  `packages/slate-legacy` owner: 5391 scanned files, 1 owner, 2621 hits, 0
  missing direct current Slate deps.
- Command-surface scanner still reports 312 rows across 30 owners; the remaining
  rows are classified runtime/API/side-effect owners, not simple package import
  cleanup.
- Latest package-facing proof after the loop 312 root node wrapper packet:
  core + aggregate package typecheck/build, core runtime tests, public app
  package-integration test, `www` typecheck, migration scanners, anti-cast
  audit, and the focused Chromium playground edit proof all pass.

Current hard boundary:
- Do not cut `packages/plate/src/index.tsx` `export * from '@platejs/slate-legacy'` until `@platejs/core` owns the Plate editor runtime on top of `@platejs/slate`.
- Do not bulk-rewrite `packages/core` imports. Previous attempted runtime clusters failed because current `SlateEditor`, plugin contracts, React adapter, decorator/store types, and transform options still assume the legacy editor shape.
- Latest proof repeated the same boundary in smaller form: v2 `NodeApi` expects a v2 `Node`/editor root, while current Plate `SlateEditor` lacks v2 runtime methods such as `read`, `subscribe`, `subscribeCommit`, `update`, and `extend`. Keep pure `PathApi`/`PointApi`/`RangeApi` migrations, but treat any helper that calls `NodeApi.*(editor, ...)` or passes `EditableProps['decorate']` as runtime-adapter-owned.
- App proof repeated the boundary from the browser side: `/blocks/playground`
  can be proven with the current `@platejs/playwright` adapter, but does not
  expose the new `@platejs/browser` `__slateBrowserHandle` because Plate still
  renders through the legacy runtime/React bridge. Do not call this a
  playground bug; route new-handle unification to the runtime adapter plan.
- `HistoryPlugin` is now an explicit typed current-runtime bridge around legacy
  `withHistory`, not a broad `as any` wrapper. That narrows the quarantine but
  does not make current Plate history v2-native; the v2 runtime path still owns
  Slate v2 history through `createReactEditor` / `history()`.
- Public `usePlateEditor({ runtime: 'slate-v2' })` now routes through the v2
  runtime without injecting legacy `onReady`, preserves inferred tx groups from
  `createPlatePlugin(...).extendTx(...)` through `platejs/react`, and does not
  require `(editor as any).update((tx: any) => ...)` call-site bridges.
- Public `createPlateEditor({ runtime: 'slate-v2' })` now accepts synchronous
  root initialization options (`transformInitialValue`, `autoSelect`,
  `shouldNormalizeEditor`, `onReady`) without fake legacy root-plugin shims.
- Public `createPlateEditor({ runtime: 'slate-v2' })` now accepts root wrapper
  render metadata for `aboveSlate`, `aboveEditable`, `beforeEditable`, and
  `afterEditable`.
- Public `createPlateEditor({ runtime: 'slate-v2' })` now accepts root
  `components` overrides, and `PlateRuntimeEditable` renders plugin-owned
  element components through Slate v2 `Editable.renderElement` using real v2
  path context. It does not fake legacy `PlateElement` APIs.
- Public `createPlateEditor({ runtime: 'slate-v2' })` now accepts the narrow
  root handler subset, and `PlateRuntimeSlate` pipes provider `onChange`
  through runtime plugin handlers before the external Slate callback.
- Public `createPlateEditor({ runtime: 'slate-v2' })` now accepts root node
  wrapper render metadata for `aboveNodes`, `belowNodes`, and `belowRootNodes`;
  `PlateRuntimeElementContent` applies them with v2 element path context and no
  legacy `PlateElement` facade.

Remaining owner groups:
- Runtime bootstrap: `withSlate`, `withPlate`, `withStatic`, `SlateEditor`, `PlateEditor`, fallback/test editors.
- React adapter: `packages/core/src/react/slate-react.ts`, `PlateSlate`, `PlateContent`, `withPlateReact`, render leaf/text/element helpers.
- Proof adapter: `@platejs/playwright` currently proves Plate runtime routes;
  `@platejs/browser` proves new Slate v2 routes. The adapter plan should decide
  whether Plate routes grow the new Slate-browser handle, keep a Plate-specific
  proof adapter, or expose a bridge during Plate v2 migration.
- Plugin contracts: `BasePlugin`, `SlatePlugin`, `PlatePlugin`, `EditableProps`, `PlateStore`, element store, decorate/on-change pipes.
- Runtime API helpers: node-id, slate-extension, override rules, affinity, navigation feedback, DOM, chunking.
- Pure primitive helpers: path/point/range equality and structural spec ranges can use `@platejs/slate` now when they do not pass a Plate editor as a v2 root.
- Tests/type contracts: core specs and type-tests that still create legacy editors.
- Aggregate package: `packages/plate/src/index.tsx` legacy re-export.

Recommended next strategy:
1. Treat this as a hard checkpoint, not another package-import loop.
2. Create an explicit Plate runtime adapter map before source edits:
   - current public Plate editor API;
   - Slate v2 runtime/editor API target;
   - required compatibility cuts;
   - test fixture replacement plan;
   - proof adapter path for `@platejs/playwright` vs `@platejs/browser`.
3. Move one bootstrap entrypoint first:
   - choose `withSlate`/`SlateEditor` or `withPlate`/`PlateEditor`, not both blindly.
   - prove with focused core specs before broad package tests.
4. Replace `react/slate-react.ts` as a deliberate adapter packet:
   - current file re-exports upstream `slate-react`;
   - target must route through `@platejs/slate-react` or a Plate-owned bridge.
5. Cut the aggregate legacy export last:
   - only after core typecheck, core tests, `platejs` typecheck/test/build, and `apps/www` typecheck/browser route proof pass.

Deferred Plate v2 notes:
- Public `T*` Plate element aliases should be cut package-by-package only when their owning package is isolated or the shared public owner is accepted.
- Docs under `content/docs` still describe legacy Plate API shape. Rewrite after the runtime owner exists, not before.
- App raw upstream `slate` imports are comparison/perf lanes, not migration blockers unless the route is promoted to production docs/examples.
