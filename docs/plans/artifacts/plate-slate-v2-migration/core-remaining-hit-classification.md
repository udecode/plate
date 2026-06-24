# Core remaining hit classification

Status after packet 44:
- `packages/core` has 77 actionable migration hits.
- Core typecheck/test/build are green after all kept primitive packets.
- `platejs` typecheck/test/build are green, but only because the aggregate package still exports `@platejs/slate-legacy`.

Hard finding:
- Safe primitive migration is mostly exhausted.
- Remaining core hits are runtime/editor-contract work. Import churn here is fake progress unless it starts from a Plate runtime adapter design.

Why:
- `@platejs/slate` `NodeApi` expects a v2 editor/root.
- Current Plate `SlateEditor` is still the legacy editor shape and lacks v2 runtime methods such as `read`, `subscribe`, `subscribeCommit`, `update`, and `extend`.
- Current React/static/plugin contracts still have legacy editor method, plugin
  API/transform, operation, and old `slate-react` surfaces.
- Public Plate React no longer re-exports old upstream `withReact`,
  `useSlateStatic`, or `DefaultPlaceholder`; remaining old `slate-react`
  imports are explicit current-runtime adapter or upstream comparison rows.
- `HistoryPlugin` still uses the legacy current-runtime `withHistory` wrapper,
  but the wrapper is now a named typed bridge instead of a broad `as any`
  escape hatch.
- Current Plate app routes prove through `@platejs/playwright`, not the new
  `@platejs/browser` handle. The playground can edit, undo, and redo in the
  current proof lane, but new-handle parity waits for the runtime/React adapter.
- Plate-side plugin tx inference is guarded: `extendTx` metadata reaches
  `createPlateEditor(...).update((tx) => tx.pluginGroup.*)` without a local
  `tx: any` annotation. The erased `AnyPluginConfig` carrier is still broad by
  design and needs a separate core plugin-type redesign if it is tightened.

Remaining groups:

| Group | Files | Why not a safe primitive packet | Next owner |
|-------|-------|----------------------------------|------------|
| Runtime bootstrap | `SlateEditor.ts`, `withSlate.ts`, `withPlate.ts`, `withStatic.tsx`, `PlateEditor.ts`, fallback/test editors, type tests | These construct or expose the Plate editor runtime. They decide whether Plate wraps v2 runtime, adapts legacy shape temporarily, or becomes a new Plate v2 runtime. | Plate runtime adapter plan |
| React adapter | `react/slate-react.ts`, `Plate.slow.tsx`, React plugin specs, `useSlateProps.ts` | Current exports and props are old `slate-react`/legacy editor contracts. Repointing to `@platejs/slate-react` without adapting Plate runtime would type green only by casts or break behavior. | Plate runtime adapter plan |
| Plugin contracts | `BasePlugin.ts`, `SlatePlugin.ts`, `PlatePlugin.ts`, `EditableProps.ts`, `PlateStore.ts`, element store | Public/internal plugin callback contracts decide node/range/value/editor shape for all Plate packages. This is Plate v2 API work. | Plate API/runtime plan |
| Runtime helpers that pass editor roots to legacy APIs | affinity, navigation flash target, node-id runtime, slate-extension transforms, render leaf, decorate, chunking, DOM scroll | These call APIs like `NodeApi.get(editor, path)` or depend on legacy operation/selection/decorate behavior. They need an adapter or direct v2 runtime replacement. | Plate runtime adapter implementation |
| Tests and harness | core editor specs and plugin type tests | The old upstream Slate test harness is removed, but some specs still create legacy editors or assert direct `.children`/`.selection` fixture shape. Move those only with focused runtime/fixture proof. | Test harness adapter plan |
| Browser proof adapter | `packages/playwright`, `packages/browser`, `apps/www/tests/slate-browser/playground.spec.ts` | Current Plate routes expose the old Plate proof adapter; new Slate v2 routes expose `__slateBrowserHandle`. Mixing the two without a runtime adapter creates false negatives. | Runtime/proof harness unification plan |
| Aggregate package | `packages/plate/src/index.tsx`, `packages/plate/package.json` | Cutting `export * from '@platejs/slate-legacy'` before core owns v2 runtime breaks current public Plate. | Last step after core adapter proof |
| Docs/app comparison lanes | `content/docs/**`, raw upstream `slate` comparison imports in app perf examples | Docs should not be rewritten to a runtime that is not accepted yet. Upstream comparison imports are benchmark/perf scaffolding, not product runtime. | Docs after runtime adapter |

Accepted deferral:
- Keep `@platejs/slate-legacy` as a tracked migration scaffold for current Plate.
- Do not publish changesets for Plate packages in this lane.
- Continue publishing Slate beta packages independently.

Next implementation strategy:
1. Write a focused Plate runtime adapter plan before more code:
   - target editor creation API;
   - value/root/selection shape;
   - `slate-react` replacement boundary;
   - plugin callback type migration;
   - test fixture replacement;
   - aggregate export cut gates.
2. Implement one bootstrap entrypoint first:
   - either `withSlate`/`SlateEditor` or `withPlate`/`PlateEditor`;
   - prove with focused core specs, then full core typecheck/test/build.
3. Replace React adapter deliberately:
   - `react/slate-react.ts` must route through `@platejs/slate-react` only after editor runtime shape is decided.
4. Cut `packages/plate` legacy export last:
   - require core proof, aggregate proof, apps/www typecheck, and playground/browser proof.

Recommended stopping checkpoint:
- Pause before code that changes `SlateEditor`, `withPlate`, `withSlate`, `PlateEditor`, plugin contracts, or `react/slate-react.ts`.
- Resume under a Plate runtime adapter/Plate v2 autogoal checkpoint, not another import cleanup packet.
