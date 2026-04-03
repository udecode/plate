# Editor Performance Master Plan

## Goal

Keep Plate performance brutally honest over time.

This plan owns the full editor-performance program:

- Slate comparison
- Plate core overhead
- `nodeId`
- Huge Document parity/demo surface
- `/dev/editor-perf` benchmark harness
- Layer 0 baselines
- future single-plugin census
- future bundle and stress lanes
- table selection stress

It replaces the earlier split perf-plan docs so the work stops scattering across
half a dozen files.

## Explicit Exclusion

Do **not** merge the separate Slate batching track into this document.

That work stays in:

- [slate-batch-engine.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/slate-batch-engine.md)

That is a different lane with a different owner.

## Decision

Slate is the standing reference floor on equivalent workloads.

Plate does **not** need to imitate Slate’s architecture, but every extra
millisecond above Slate needs a reason. If the cost buys real framework value,
budget it tightly. If it does not, kill it.

Default optimization order:

1. remove wasted work
2. move hooks/providers/subscriptions behind slower branches
3. precompute stable values
4. add internal fast paths for plain cases
5. redesign internal seams only when measurement proves the seam is the ceiling

Do not rip out `jotai-x`, `zustand-x`, plugin composition, or the framework
model just to win one screenshot. That is fake progress.

Execution order from here:

1. get core baseline lanes green
2. get core rich/provider-backed lanes green enough
3. freeze Layer 0 again
4. only then resume plugin-by-plugin work

Do not run a plugin census on top of unresolved core tax. That just blames the
wrong layer.

## Current State

### Release snapshot (`2026-04-03`)

- core baseline is good enough versus Slate for release
- insert-text perf is good enough
- `CodePlugin` was the last real core-plugin embarrassment and got a major cut
  from the hard-affinity redesign:
  - code census: `386.96 ms -> 248.19 ms`
  - direct code plugin leaf lane: `334.55 ms -> 264.41 ms`
  - full code leaf/text pipe: `392.68 ms -> 295.71 ms`
- remaining newly-benchmarked `basic-nodes` plugins split like this:
  - green enough: `KbdPlugin`, `SubscriptPlugin`, `SuperscriptPlugin`
  - still red: `HighlightPlugin`, `StrikethroughPlugin`
- after release, the next real performance backlog is:
  - `HighlightPlugin`
  - `StrikethroughPlugin`
  - table selection

### What already exists

- A real benchmark harness at
  [editor-perf/page.tsx](/Users/zbeyens/git/plate-2/apps/www/src/app/dev/editor-perf/page.tsx)
- A benchmark runner at
  [run-editor-perf.mts](/Users/zbeyens/git/plate-2/apps/www/scripts/run-editor-perf.mts)
- A real table benchmark harness at
  [table-perf/page.tsx](/Users/zbeyens/git/plate-2/apps/www/src/app/dev/table-perf/page.tsx)
- A table benchmark runner at
  [run-table-perf.mts](/Users/zbeyens/git/plate-2/apps/www/scripts/run-table-perf.mts)
- A manual parity/demo page at
  [huge-document-demo.tsx](/Users/zbeyens/git/plate-2/apps/www/src/registry/examples/huge-document-demo.tsx)
- A custom docs route at
  [page.tsx](</Users/zbeyens/git/plate-2/apps/www/src/app/(app)/docs/examples/huge-document/page.tsx>)
- A shared Huge Document config/query-param contract at
  [huge-document-config.ts](/Users/zbeyens/git/plate-2/apps/www/src/lib/huge-document-config.ts)
- One-command Layer 0 smoke and full presets in
  [package.json](/Users/zbeyens/git/plate-2/apps/www/package.json)

### What we already proved

- The original Plate-vs-Slate gap was mostly mount-path waste and `nodeId`
  initialization, not construction cost.
- `zustand-x` creation cost is real but small.
- `jotai-x` had redundant sync work worth trimming, but it was not the whole
  bottleneck.
- Plain render paths were paying wrapper/provider/hook tax they did not need.
- The exported element-hook surface was still expensive after those cuts:
  `useElement()` and `usePath()` were reading through the per-node atom store
  even when they only needed nearest-node context.
- `nodeId` init was catastrophically wrong when it used one Slate transform per
  missing id.
- The Huge Document docs page and `/dev/editor-perf` were drifting until they
  shared one config seam.
- Side-by-side docs metrics are useful for manual parity, but they are not
  honest enough to replace the benchmark harness.

### Biggest shipped wins so far

- Plain element render path fast paths
- Plain leaf/text render path fast paths
- `ElementProvider` / `useElement` path cuts where context was unnecessary
- `getRenderNodeProps(...)` plain-node fast path
- `nodeId` initial-value rewrite moved to a pure value path
- `nodeId` live normalization moved to batch updates
- `data-block-id` stopped paying a mounted-store gate
- `jotai-x` sync hydration stopped doing redundant mount-time work
- `useElement()` and `usePath()` now prefer a cheap chained React context from
  `ElementProvider`; the atom-store path remains for `useElementSelector()` and
  exported store consumers
- Layer 0 smoke can now be frozen with one command and writes a compact summary

### Latest core-rich finding

The remaining provider-backed red zone was the exported element-hook surface,
not generic rich rendering in the abstract.

Fresh `5,000` blockquote `core-mount` numbers before the context-first hook fix:

- no-hook control:
  [editable-element-plugin-precomputed-no-element-hook-5000-blockquote-fresh.json](/Users/zbeyens/git/plate-2/tmp/editable-element-plugin-precomputed-no-element-hook-5000-blockquote-fresh.json)
  `434.65 ms`
- provider-backed hook lane:
  [editable-element-plugin-render-node-hooks-5000-blockquote-fresh.json](/Users/zbeyens/git/plate-2/tmp/editable-element-plugin-render-node-hooks-5000-blockquote-fresh.json)
  `485.81 ms`
- same hook body on plain context:
  [editable-element-plugin-render-node-hooks-plain-context-5000-blockquote-fresh.json](/Users/zbeyens/git/plate-2/tmp/editable-element-plugin-render-node-hooks-plain-context-5000-blockquote-fresh.json)
  `317.58 ms`
- same hook body on raw Jotai:
  [editable-element-plugin-render-node-hooks-jotai-provider-5000-blockquote-fresh.json](/Users/zbeyens/git/plate-2/tmp/editable-element-plugin-render-node-hooks-jotai-provider-5000-blockquote-fresh.json)
  `367.46 ms`

Take:

- the common element/path reads themselves are not the real villain
- raw Jotai still adds real cost
- Plate's element-store/provider path adds another large chunk on top

The compatibility-preserving fix was to keep `ElementProvider` and the exported
store surface, but let `useElement()` and `usePath()` read a cheap chained React
context first.

Same-batch rerun after that fix:

- no-hook control:
  [editable-element-plugin-precomputed-no-element-hook-5000-blockquote-after-context-fix.json](/Users/zbeyens/git/plate-2/tmp/editable-element-plugin-precomputed-no-element-hook-5000-blockquote-after-context-fix.json)
  `472.92 ms`
- provider-backed hook lane:
  [editable-element-plugin-render-node-hooks-5000-blockquote-after-context-fix.json](/Users/zbeyens/git/plate-2/tmp/editable-element-plugin-render-node-hooks-5000-blockquote-after-context-fix.json)
  `490.41 ms`

That shrank the within-batch hook-consumer gap from `51.16 ms` to `17.49 ms`.

Summary artifacts:

- `editor-perf-5000-hook-consumer-context-summary.json` and
  `editor-perf-5000-hook-consumer-context-after.json` were older compact
  summaries that were not retained after the raw-artifact move

### Latest selector/store finding

The next red seam was not `useElement()` or `usePath()` anymore. It was the
selector/store consumer path.

Two facts came out of that slice:

- `ElementProvider` was relying on the generic `createAtomProvider(...)`
  hydration path for `element`, `entry`, and `path`, even though it already
  owned those live props
- `useElementSelector()` was paying an extra derived-atom layer through
  `selectAtom(...)` before it ever hit the store

The first fix was correctness-first:

- `ElementProvider` now seeds its own per-node store immediately and syncs later
  prop changes in a layout effect
- that keeps `ElementProvider`, `elementStore`, `useElementStore()`, and
  `useElementSelector()` intact for compatibility
- it also fixes the selector path seeing `entry = null` on first read in the
  focused tests

The second fix was the real selector perf cut:

- `useElementSelector()` now uses `useEntryValue(...)` directly instead of
  `selectAtom(...) + useStoreAtomValue(...)`

Fresh `5,000` blockquote selector numbers:

- before:
  [editable-element-plugin-render-node-selector-5000-blockquote-before.json](/Users/zbeyens/git/plate-2/tmp/editable-element-plugin-render-node-selector-5000-blockquote-before.json)
  `459.72 ms`
- after the store-ownership correctness fix only:
  [editable-element-plugin-render-node-selector-5000-blockquote-after.json](/Users/zbeyens/git/plate-2/tmp/editable-element-plugin-render-node-selector-5000-blockquote-after.json)
  `469.84 ms`
- after the direct `useEntryValue(...)` rewrite:
  [editable-element-plugin-render-node-selector-5000-blockquote-after-direct-entry.json](/Users/zbeyens/git/plate-2/tmp/editable-element-plugin-render-node-selector-5000-blockquote-after-direct-entry.json)
  `449.81 ms`
- same selector body on plain context:
  [editable-element-plugin-render-node-selector-plain-context-5000-blockquote-after.json](/Users/zbeyens/git/plate-2/tmp/editable-element-plugin-render-node-selector-plain-context-5000-blockquote-after.json)
  `326.85 ms`
- same selector body on raw Jotai:
  [editable-element-plugin-render-node-selector-jotai-provider-5000-blockquote-after.json](/Users/zbeyens/git/plate-2/tmp/editable-element-plugin-render-node-selector-jotai-provider-5000-blockquote-after.json)
  `383.86 ms`

Take:

- the store-ownership change was the right correctness fix, not the perf win
- the direct selector rewrite is a small but real cut:
  `459.72 ms -> 449.81 ms`
- the selector/store lane is still red:
  - about `122.96 ms` over plain context
  - about `65.95 ms` over raw Jotai
- the next honest seam is store resolution and remaining selector subscription
  cost, not `useElement()` / `usePath()` anymore

The next follow-up finally killed the fake extra provider tax:

- `ElementProvider` no longer wraps every node in the redundant
  `ElementStoreProvider` layer
- focused rerun:
  [editor-perf-5000-selector-provider-after-provider-cut.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-selector-provider-after-provider-cut.json)
  `384.33 ms`
- that moves the provider-backed selector lane from:
  `449.81 ms -> 384.33 ms`
- and it leaves the selector lane basically tied with the raw Jotai lower
  bound:
  `384.33 ms` vs `383.86 ms`

That changed the conclusion:

- Plate-specific selector/provider tax is mostly dead in this lane
- the remaining gap is mostly raw Jotai versus plain context, not extra Plate
  wrapper overhead

One more idea got tested and rejected:

- replacing the selector’s Jotai atom subscription with a custom per-provider
  entry subscription looked elegant and benchmarked worse
- rejected artifact:
  [editor-perf-5000-selector-provider-after-entry-store-cut.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-selector-provider-after-entry-store-cut.json)
  `397.81 ms`
- keep the provider-cut win; do not ship the custom selector store

Updated selector/store take:

- plain context is still the floor:
  `326.85 ms`
- raw Jotai is the current hot-path ceiling we keep hitting:
  `383.86 ms`
- provider-backed Plate selector is now basically on that ceiling:
  `384.33 ms`
- the next real move is not more Plate wrapper trimming; it is either deeper
  Jotai-level work or a deliberate architecture change for hot selector paths

That architecture change landed next:

- `ElementProvider` no longer creates a Jotai store on the hot path
- it now owns a tiny scoped runtime store for:
  - `element`
  - `entry`
  - `path`
- `useElementSelector()` reads that runtime store directly

### Latest table finding

The next honest red lane is table selection, not mount.

The new `/dev/table-perf` runner can now measure:

- mount
- input
- multi-cell selection

Real selection numbers on plain unmerged tables showed the problem scales badly:

- `20x20`, select `5x5` (`25` cells): `55.50 ms`
- `40x40`, select `10x10` (`100` cells): `224.51 ms`
- `60x60`, select `15x15` (`225` cells): `454.39 ms`

Two obvious ideas were tested and rejected:

- row/table block-selection context fan-out reduction in
  [table-node.tsx](/Users/zbeyens/git/plate-2/apps/www/src/registry/ui/table-node.tsx)
- reusing `useSelectedCells()` inside
  [useTableSelectionDom.ts](/Users/zbeyens/git/plate-2/packages/table/src/react/components/TableElement/useTableSelectionDom.ts)

Neither moved the real lane enough to keep.

The kept win is in
[getTableGridByRange.ts](/Users/zbeyens/git/plate-2/packages/table/src/lib/queries/getTableGridByRange.ts):
unmerged tables no longer pay the merge-aware selection-grid path.

Kept artifacts:

- before:
  `table-perf-selection-60x60-15x15-summary.json`
  `454.39 ms`
- after:
  `table-perf-selection-60x60-15x15-current-summary.json`
  `419.67 ms`

Take:

- unmerged tables were still paying merge-specific query work
- that was real waste
- fixing it helps medium and large selections
- table selection is still red enough to deserve its own next slice
- `useElementStore()` still works, but it now lazily materializes a bridged
  Jotai store only when someone actually asks for it
- that keeps the front API intact while opting out of Jotai cost for normal
  node rendering

Focused artifacts:

- selector lane after runtime-store opt-out:
  [editor-perf-5000-selector-provider-after-runtime-store.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-selector-provider-after-runtime-store.json)
  `385.05 ms`
- per-node provider/store lane after runtime-store opt-out:
  [editor-perf-5000-element-provider-only-after-runtime-store.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-element-provider-only-after-runtime-store.json)
  `317.90 ms`

Interpretation:

- selector lane stays basically tied with raw Jotai:
  `384.33 ms -> 385.05 ms`
- that means the lazy bridge did not regress the exported selector path
- the per-node provider lane did improve:
  - previous kept provider-only element lane:
    `368.10 ms`
  - runtime-store opt-out:
    `317.90 ms`
  - cut:
    `-50.20 ms`

Take:

- hot-path Jotai opt-out is the right architecture here
- the public surface survives:
  `useElement`, `usePath`, `useElementSelector`, `useElementStore`, and
  `elementStore`
- future work on this seam should only happen if a real consumer needs more
  from the lazy bridge or if a new benchmark shows a remaining hot-path gap

### Dedicated jotai-x benchmark

There is now a dedicated store-alternatives benchmark in:

- [bench-store-alternatives.cjs](/Users/zbeyens/git/jotai-x/packages/jotai-x/scripts/bench-store-alternatives.cjs)
- output:
  [store-alternatives.perf.json](/Users/zbeyens/git/jotai-x/packages/jotai-x/store-alternatives.perf.json)

It compares:

- plain context
- raw Jotai seeded store
- `jotai-x` provider
- `jotai-x` store API
- `jotai-x` direct keyed hook

Across:

- provider-only
- value-consumer
- selector-consumer
- mount+update selector-consumer

Headline numbers at `1,000` nodes:

- provider-only:
  - plain context: `1.44 ms`
  - raw Jotai seeded: `8.39 ms`
  - `jotai-x` provider: `12.38 ms`
  - `jotai-x` store API: `11.93 ms`
  - `jotai-x` direct keyed hook: `12.82 ms`
- value-consumer:
  - plain context: `2.08 ms`
  - raw Jotai seeded: `12.84 ms`
  - `jotai-x` provider: `18.94 ms`
  - `jotai-x` store API: `22.80 ms`
  - `jotai-x` direct keyed hook: `23.66 ms`
- selector-consumer:
  - plain context: `2.18 ms`
  - raw Jotai seeded: `15.52 ms`
  - `jotai-x` provider: `20.45 ms`
  - `jotai-x` store API: `25.05 ms`
  - `jotai-x` direct keyed hook: `23.74 ms`
- mount+update selector-consumer:
  - plain context: `4.28 ms`
  - raw Jotai seeded: `32.85 ms`
  - `jotai-x` provider: `39.73 ms`
  - `jotai-x` store API: `39.25 ms`
  - `jotai-x` direct keyed hook: `42.61 ms`

Take:

- `jotai-x` is a real extra tax over raw Jotai in every lane
- raw Jotai itself is already a real tax over plain context
- the store API object shape is not a silver bullet and is still among the
  slower consumer paths in heavier lanes
- this proves the remaining Plate selector/store wall is not just “Plate glue”
  and not just “Jotai in theory”; both layers matter

Two library cuts shipped with that benchmark work:

- `createAtomStore(...).useXValue()` now bypasses `selectAtom(...)` entirely
  when no selector/equalityFn is provided
- selector-based store reads now memoize the derived `selectAtom(...)` atom
  instead of recreating it on every render

Those are worth keeping. The benchmark says the remaining wall is bigger than
one dumb helper branch.

Implementation note:

- the benchmark pins React/Jotai resolution to the repo root before importing
  the built package
- that is required because this repo can otherwise resolve a stray package-local
  React 19 graph from `packages/jotai-x/node_modules`, which makes the harness
  lie or crash

## Benchmark Surfaces

### 1. Manual parity page

Use `/docs/examples/huge-document` for:

- visual parity
- interaction gut-checks
- manual compare between `Plate + Slate`, `Plate only`, and `Slate only`

Do **not** use it as the source of truth for benchmark numbers.

### 2. Measurement harness

Use `/dev/editor-perf` for:

- mount numbers
- prebuilt mount
- init dissection
- input latency
- targeted seam reruns
- Layer 0 baselines
- future plugin census

### 3. Bridge between them

The Huge Document page exposes `Open in benchmark mode`, which deep-links into
`/dev/editor-perf` with the current shared config.

That is the intended workflow:

1. inspect parity on Huge Document
2. jump into `/dev/editor-perf`
3. record the real numbers there

## Workload Model

### Core workload family

These workloads exist now and should remain the base family:

- `huge-mixed-block`
- `huge-paragraph`
- `huge-heading`
- `huge-blockquote`
- `huge-dense-text`
- `huge-dense-inline-props`
- `huge-paragraph-fallback`

### Size ladder

- `1,000` blocks: smoke and seam work
- `5,000` blocks: primary comparison lane
- `10,000` blocks: stress lane

### View modes

- chunked
- no chunking

Chunked is realistic.
No chunking is the honesty test.

## Layer Model

### Layer 0: Core health

Layer 0 answers one question continuously:

- how far is Plate above or below the equivalent Slate lane?

The Layer 0 baseline family is:

- Slate baseline
- Plate core
- Plate core + `nodeId`
- Plate core + `nodeId` seeded
- Plate basic

Layer 0 also includes the activated-core family:

- paragraph-heavy
- heading-heavy
- blockquote-heavy
- mixed-block
- `nodeId` seeded
- `nodeId` unseeded init

The dense text-heavy lanes stay in the program, but they are not baseline gate
material anymore:

- dense-text
- dense-inline-props

#### Layer 0 commands

- `pnpm --filter ./apps/www perf:editor:layer0-smoke`
- `pnpm --filter ./apps/www perf:editor:layer0`
- `pnpm --filter ./apps/www perf:editor:stress-core`

#### Layer 0 artifacts

Current smoke artifacts:

- `editor-perf-layer0-smoke-summary.json` (historical compact summary not retained)
- raw smoke dump: `tmp/editor-perf-layer0-smoke.json` (local, gitignored)

Current full-run artifacts:

- `editor-perf-layer0-summary.json` (historical compact summary not retained)
- raw full dump: `tmp/editor-perf-layer0.json` (local, gitignored)
- [editor-perf-5000-plugin-render-element-plugin-context.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-plugin-render-element-plugin-context.json)
- [editor-perf-5000-plugin-render-element-precomputed-wrappers.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-plugin-render-element-precomputed-wrappers.json)

#### Latest smoke numbers

From the retained smoke snapshot notes:

- mixed `1k` chunked:
  - Slate mount: `65.85 ms`
  - Plate core mount: `57.67 ms`
  - Plate core + `nodeId`: `61.43 ms`
  - Plate core + `nodeId` seeded: `66.08 ms`
  - Plate basic: `59.67 ms`
- paragraph `1k` chunked:
  - Slate mount: `59.05 ms`
  - Plate core mount: `58.99 ms`
- heading `1k` chunked:
  - Slate mount: `59.79 ms`
  - Plate core mount: `76.21 ms`
- blockquote `1k` chunked:
  - Slate mount: `62.91 ms`
  - Plate core mount: `63.55 ms`
- `nodeId` init `5k`:
  - raw: `8.24 ms`
  - seeded: `4.85 ms`
  - skip initial normalize: `4.11 ms`

#### Current Layer 0 take

- full Layer 0 now completes cleanly on the trimmed baseline preset
- mixed `5k` chunked is basically parity:
  - Slate: `311.94 ms`
  - Plate core: `312.30 ms`
- paragraph `5k` chunked is green:
  - Slate: `347.07 ms`
  - Plate core: `336.26 ms`
- heading `5k` chunked is the only small red core-activated lane left:
  - Slate: `326.40 ms`
  - Plate core: `331.57 ms`
- blockquote `5k` chunked is green after the fallback-path cut:
  - Slate: `347.05 ms`
  - Plate core: `317.38 ms`
- mixed `5k` no-chunk is green:
  - Slate: `419.17 ms`
  - Plate core: `385.24 ms`
- `nodeId` init is no longer the giant cliff it used to be
- plain core is close enough to call mostly green, but the provider-rich active
  lane is still not green
- the current rich-path evidence says the remaining tax is still per-node
  provider/store work, not a store-brand problem:
  - provider-only `5k`: plain context `254.92 ms`, raw Jotai `308.17 ms`,
    `ElementProvider` `351.46 ms`
  - rich fast-node-props `5k`: plain context `349.40 ms`, raw Jotai
    `372.01 ms`, `ElementProvider` `412.93 ms`
- the blockquote-heavy Layer 0 gap was not the `render.as` plugin path after
  all; it was the unknown-element `renderElement` fallback still forcing
  `useNodePath` even though `RenderElementProps.path` is optional
- removing that fallback-path lookup cut the targeted `5k` blockquote rerun
  from `425.99 ms` to `301.66 ms`, and the clean full Layer 0 rerun kept the
  lane green at `317.38 ms`
- the next rich-path win is smaller but real:
  - direct `pluginRenderElement` with precomputed paths:
    `504.70 ms` -> `484.80 ms`
  - delta: `-19.90 ms` (`-3.94%`)
  - seam: stop rebuilding `getEditorPlugin(...)` context on every node for a
    fixed plugin render path
- the next `jotai-x` cut was dumb but real:
  - `createAtomProvider(...)` was calling `createStore()` eagerly inside
    `useState(...)`
  - that means every provider render still paid store construction even though
    React only kept the first result
  - switching to `useState(() => createStore())` moved the clean sequential
    direct rich lane:
    - `484.80 ms` -> `453.39 ms`
    - delta: `-31.41 ms` (`-6.48%`)
  - the simpler provider-only lane stayed roughly flat:
    - old baseline: `351.46 ms`
    - clean rerun: `353.56 ms`
  - takeaway:
    - keep the lazy-store fix
    - stop pretending helper churn is the remaining wall
    - the remaining wall is still the per-node element store/provider shape
- the obvious “precompute wrapper plugin arrays and skip empty BelowRootNodes”
  idea was benchmarked and rejected:
  - same rich lane: `504.70 ms` -> `516.94 ms`
  - keep that as a dead end, not a future todo
- Layer 0 itself exposed two harness bugs worth keeping separate from the perf
  work:
  - the runner must not tie Puppeteer `protocolTimeout` to the benchmark timeout
  - `/dev/editor-perf` must not SSR default query-param state and hydrate a
    different workload on the client
- dense-text and dense-inline-props are still valuable, but they are stress
  truth, not baseline gate truth

### Layer 3: Stress truth

Use Layer 3 for lanes that are worth measuring but too heavy or too volatile to
serve as the always-on baseline gate.

Current core-stress workloads:

- dense-text `5k` chunked
- dense-inline-props `5k` chunked

### Layer 1: Single-plugin census

Layer 1 is live for the first cheap core batch.

Current harness coverage:

- `BlockquotePlugin`
- `HeadingPlugin`
- `BoldPlugin`
- `ItalicPlugin`
- `UnderlinePlugin`

Each plugin now runs:

- one inactive lane
- one activated lane
- three comparison scenarios:
  - Slate
  - Plate core
  - Plate + plugin

Current artifacts:

- `editor-perf-layer1-core-plugins-smoke-summary.json` (historical compact summary not retained)
- `editor-perf-layer1-core-plugins-summary.json` (historical compact summary not retained)
- [editor-perf-layer1-bold-only-after-text-fast-path.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-layer1-bold-only-after-text-fast-path.json)
- [editor-perf-layer1-bold-only-after-simple-text-fast-path.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-layer1-bold-only-after-simple-text-fast-path.json)
- [editor-perf-layer1-italic-only.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-layer1-italic-only.json)
- [editor-perf-layer1-italic-only-after-simple-text-fast-path.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-layer1-italic-only-after-simple-text-fast-path.json)
- [editor-perf-layer1-underline-only.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-layer1-underline-only.json)
- [editor-perf-layer1-underline-only-after-simple-text-fast-path.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-layer1-underline-only-after-simple-text-fast-path.json)
- [editor-perf-layer1-code-only.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-layer1-code-only.json)
- [editor-perf-5000-code-direct-renderers-core-mount.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-code-direct-renderers-core-mount.json)
- [editor-perf-5000-code-plugin-leaf-direct-core-mount.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-code-plugin-leaf-direct-core-mount.json)
- [editor-perf-5000-code-leaf-text-pipe-core-mount.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-code-leaf-text-pipe-core-mount.json)
- `editor-perf-5000-code-dissection-summary.json` (historical compact summary not retained)
- [editor-perf-5000-code-plateleaf-direct-core-mount.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-code-plateleaf-direct-core-mount.json)
- [editor-perf-5000-code-plugin-leaf-direct-core-mount-after-hard-affinity-fast-path.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-code-plugin-leaf-direct-core-mount-after-hard-affinity-fast-path.json)
- `editor-perf-5000-code-hard-affinity-fast-path-summary.json` (historical compact summary not retained)

Every shipped plugin gets:

- one inactive lane
- one activated lane
- one performance class
- one budget

#### Inactive lane

The plugin is loaded but the document does not activate it.

This answers:

- what tax do we pay just for enabling the plugin?

#### Activated lane

The document actually contains the nodes/marks/decorations/overlays that the
plugin handles.

This answers:

- what tax do we pay when the plugin does real work?

#### Plugin classes

Assign each plugin to a primary class:

- cheap structural renderers
- cheap marks/text wrappers
- behavioral plugins with low render surface
- heavy structural plugins
- overlay/decoration/annotation plugins
- environment/integration-heavy plugins

The class decides:

- default activated workload
- expected metrics
- budget shape

#### First batch result

- The full `layer-1-core-plugins` batch is now healthy on the real Plate dev
  server at `http://localhost:3011/dev/editor-perf`
  - the old `localhost:3001` hang was a dead-server assumption, not a benchmark
    seam
- `BlockquotePlugin` is green in the refreshed `5k` batch
  - inactive delta vs core: `-19.69 ms`
  - activated delta vs core: `-14.49 ms`
- `HeadingPlugin` is green in the refreshed `5k` batch
  - inactive delta vs core: `-4.66 ms`
  - activated delta vs core: `-17.33 ms`
- `BoldPlugin`, `ItalicPlugin`, and `UnderlinePlugin` are still the live cheap
  mark family seam, but the text-path cut changed the shape
  - new `pipeRenderText(...)` split:
    - simple `render.as` text plugins no longer pay a per-plugin hook/function
      call stack inside the outer text pipe
    - that preserves behavior and attacks the remaining `isDecoration: false`
      mark path directly
  - focused `5k` one-off reruns:
    - `BoldPlugin`: inactive `+6.19 ms`, activated `+15.00 ms`
    - `ItalicPlugin`: inactive `-0.51 ms`, activated `+14.11 ms`
    - `UnderlinePlugin`: inactive `+6.49 ms`, activated `+17.10 ms`
  - refreshed official `5k` batch:
    - `BoldPlugin`: inactive `+4.46 ms`, activated `+13.67 ms`
    - `ItalicPlugin`: inactive `+3.17 ms`, activated `+15.71 ms`
    - `UnderlinePlugin`: inactive `+7.36 ms`, activated `+19.44 ms`
  - take:
    - the cheap-mark text path was real and worth cutting
    - bold and italic are no longer catastrophically red; they are now
      mid-teens activated tax instead of mid/high twenties
    - underline is still the worst sibling in the clean batch
  - durable artifacts:
    - [editor-perf-layer1-bold-only-after-simple-text-fast-path.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-layer1-bold-only-after-simple-text-fast-path.json)
    - [editor-perf-layer1-italic-only-after-simple-text-fast-path.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-layer1-italic-only-after-simple-text-fast-path.json)
    - [editor-perf-layer1-underline-only-after-simple-text-fast-path.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-layer1-underline-only-after-simple-text-fast-path.json)
- Underline got its own `5k` dissection before any more underline-specific
  surgery:
  - direct lower bound on `huge-underline`:
    - `Editable + underline direct renderers`: `254.70 ms`
  - isolated active underline plugin path:
    - `Editable + underline plugin leaf direct`: `251.01 ms`
  - real production underline lane:
    - `Editable + underline leaf/text pipes`: `267.41 ms`
  - take:
    - `pluginRenderLeaf(underline)` is basically already at the lower bound
    - underline is not a special red inner-plugin seam
    - the remaining cost is generic leaf/text pipe work, about `12.71 ms`
      above the direct `<u>` lower bound and `16.40 ms` above the isolated
      plugin-leaf lane
  - durable artifacts:
    - [editor-perf-5000-underline-direct-renderers.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-underline-direct-renderers.json)
    - [editor-perf-5000-underline-plugin-leaf-direct.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-underline-plugin-leaf-direct.json)
    - [editor-perf-5000-underline-pipe.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-underline-pipe.json)
    - `editor-perf-5000-underline-dissection-summary.json` (historical compact summary not retained)
  - widening check on the next sibling mark says the cheap-mark story is done:
    - targeted `5k` Layer 1 `CodePlugin` rerun:
      - inactive delta vs core: `-4.29 ms`
      - activated delta vs core: `+154.06 ms`
    - targeted `5k` chunked `huge-code` dissection on the correct
      `core-mount` path:
      - `Editable + code direct renderers`: `257.29 ms`
      - `Editable + code plugin leaf direct`: `367.82 ms`
      - `Editable + code leaf/text pipes`: `392.68 ms`
    - take:
      - `CodePlugin` is the next real core target
      - the active code leaf path itself is the wall, about `110.54 ms` above
        the direct `<code>` lower bound
      - the generic text-pipe tail is secondary, about `24.85 ms`
      - so the next optimization pass should target code-mark-specific
        leaf composition / affinity-related props, not another generic
        `pipeRenderText(...)` cleanup
  - durable artifacts:
    - [editor-perf-layer1-code-only.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-layer1-code-only.json)
    - [editor-perf-5000-code-direct-renderers-core-mount.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-code-direct-renderers-core-mount.json)
    - [editor-perf-5000-code-plugin-leaf-direct-core-mount.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-code-plugin-leaf-direct-core-mount.json)
    - [editor-perf-5000-code-leaf-text-pipe-core-mount.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-code-leaf-text-pipe-core-mount.json)
    - `editor-perf-5000-code-dissection-summary.json` (historical compact summary not retained)
  - the next safe cut shipped in `pluginRenderLeaf(...)`:
    - simple `render.as` leaves with `affinity: 'hard'` now skip
      `getRenderNodeProps(...)` and go straight to `PlateLeaf`
    - fresh `5k` chunked `huge-code` rerun:
      - `Editable + code PlateLeaf direct`: `337.39 ms`
      - `Editable + code plugin leaf direct`: `334.55 ms`
      - previous `Editable + code plugin leaf direct`: `367.82 ms`
    - take:
      - the node-prop composition tax is gone for the simple hard-affinity
        code path
      - `pluginRenderLeaf(code)` is now basically at the `PlateLeaf` floor
      - the remaining gap is the hard-affinity leaf body itself, about
        `77.26 ms` above the direct `<code>` lower bound
      - given the current no-breakage bias, the next move is not more
        `pluginRenderLeaf(...)` surgery; it is deciding whether the hard-edge
        DOM shape is worth redesigning at all
  - durable artifacts:
    - [editor-perf-5000-code-plateleaf-direct-core-mount.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-code-plateleaf-direct-core-mount.json)
    - [editor-perf-5000-code-plugin-leaf-direct-core-mount-after-hard-affinity-fast-path.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-code-plugin-leaf-direct-core-mount-after-hard-affinity-fast-path.json)
    - `editor-perf-5000-code-hard-affinity-fast-path-summary.json` (historical compact summary not retained)
    That changes the next move. Stop treating `UnderlinePlugin` as a unique target.
    The next cheap-mark cut is no longer generic `pluginRenderLeaf(...)`. That part
    of the active `CodePlugin` path is basically green. The remaining question is
    whether the hard-affinity leaf body itself is worth a riskier redesign.

### Layer 2: Bundle lanes

After the single-plugin census:

- writing
- docs
- comments
- tables
- media
- collab

Bundle lanes exist to catch interaction cliffs between plugins that look cheap
in isolation.

### Layer 3: Stress truth

Layer 3 exists to catch lies from smaller lanes:

- `5k` no chunk
- `10k` init
- selected `10k` mount
- heavy overlay lanes
- heavy collab lanes

## Current Architecture Decisions

### Benchmark harness shape

Keep the benchmark harness narrow:

- mount one scenario at a time
- expose page-side benchmark APIs for automation
- avoid synthetic DOM fiddling when the page can be controlled directly

### Huge Document shape

Huge Document should mirror Slate’s control surface and workload semantics, but
remain honest about engine isolation.

That means:

- same seeded faker workload semantics
- shared common knobs
- per-engine isolated state and stats
- `Mounted editors` control so the docs surface can be honest when needed

### Element context compatibility

The next provider-rich core fix is not a free-for-all rewrite.

Today, core still exports:

- `ElementProvider`
- `useElementStore`
- `elementStore`
- `useElement`
- `usePath`
- `useElementSelector`

That means a lighter element-context architecture needs one of two shapes:

- preserve the exported Jotai-flavored surface and move the hot path away from
  it internally
- or make the break explicit instead of accidentally breaking users during a
  perf refactor

Do not pretend this is “just internal” if the export surface says otherwise.

### `nodeId` shape

Keep the split explicit:

- init-time value normalization is a pure value rewrite
- live `nodeId.normalize()` is editor-operation work

Do not collapse those two paths into one abstraction just because they both
touch ids.

### Transform-initial-value contract

Initial-value hooks are value transforms, not half-imperative side-effect seams.

That means:

- `transformInitialValue` is `Value -> Value`
- built-ins return a next value
- deprecated compatibility can stay, but the real contract should be pure

## Current Baseline Artifacts Worth Keeping

The raw JSON pile can stay. It is useful archaeology.

The main artifacts that matter right now:

- older compact summaries and baseline JSONs from `.claude/docs/plans/` were
  not retained after the raw-artifact move
- use the matching retained raw artifacts in [tmp/](/Users/zbeyens/git/plate-2/tmp/)
  when you need those older lanes
- [editor-perf-5000-plugin-render-element-lazy-store-seq.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-plugin-render-element-lazy-store-seq.json)
- [editor-perf-5000-element-provider-lazy-store-seq.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-element-provider-lazy-store-seq.json)
- `editor-perf-5000-render-as-summary.json`
- `editor-perf-5000-bold-leaf-wrapper-summary.json`
- [editor-perf-5000-bold-text-pipe-after-text-fast-path.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-bold-text-pipe-after-text-fast-path.json)
- [editor-perf-5000-bold-pipe-after-text-fast-path.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-bold-pipe-after-text-fast-path.json)
- `editor-perf-5000-nodeid-mounted-gate-summary.json`
- `editor-perf-layer0-smoke-summary.json`
- [editor-perf-5000-blockquote-after-path-cut.json](/Users/zbeyens/git/plate-2/tmp/editor-perf-5000-blockquote-after-path-cut.json)
- `editor-perf-layer1-core-plugins-smoke-summary.json`
- `editor-perf-layer1-core-plugins-summary.json`

## Benchmark Findings That Still Matter

### The original diagnosis

The early harness proved:

- Plate construction cost was not the dominant problem
- the big cliffs were mount-path wrapper work and `nodeId`

### The render-path diagnosis

The render-path dissection proved:

- plain element/leaf/text cases were paying wrapper/provider/hook tax they did
  not need
- the unknown-element `renderElement` fallback was also paying path-lookup tax
  it did not need, because `RenderElementProps.path` is optional
- `ElementProvider` and `getRenderNodeProps(...)` mattered in richer paths
- `PlateElement` was not free, but it was not the whole wall
- one provider/store per node is still the real cost center in richer plugin
  paths

### The store diagnosis

The store-tech split proved:

- raw Jotai and `zustand-x` were not meaningfully better than the provider-per-
  node pattern
- swapping store brands is not the plan
- reducing per-node provider/store work is the real seam
- the later lazy-store fix proved `jotai-x` still had some dumb mount-time
  waste, but not enough to change that conclusion
- the next real core fix candidate is a lighter element-context architecture
  that keeps `useElement`, `usePath`, and `useElementSelector` semantics while
  removing the per-node Jotai store from the hot path

### The `nodeId` diagnosis

The `nodeId` investigation proved:

- the old init path was wrong because it paid one Slate transform per missing id
- pure value normalization is the correct init seam
- live normalization is where batch updates belong
- once init and block-id mount waste were removed, `Plate core + nodeId`
  stopped trailing Slate on the main huge-doc lane

### The docs-page diagnosis

The Huge Document work proved:

- `ComponentPreview` was the wrong shell for a page this heavy
- side-by-side stats are nice for humans and bad as benchmark truth
- docs page and benchmark harness must share config semantics or they drift

## Open Work

### Immediate next slices

1. Keep cutting the generic cheap-mark text path
   - bold and italic are down into the mid-teens
   - underline is still around `+19 ms` activated in the clean batch
   - the next win should be generic, not plugin-specific theater
2. Stop doing underline-specific surgery
   - underline dissection says the active underline path is already basically at
     the lower bound
   - the remaining cheap-mark gap is generic leaf/text pipe tax
3. Add the next cheap batch entries that are not just more of the same seam
   - `HrPlugin`
   - one affinity-bearing mark such as `CodePlugin` or `StrikethroughPlugin`
4. Add touched-plugin smoke selection for future PR gating
5. Only after the cheap batch is mostly green, widen to heavier structural and
   overlay classes

### Layer 1 build-out

Completed:

- plugin manifest format
- workload registry mapping
- runner presets
- summary output that compares against Plate core

Still open:

- freeze real per-class budgets instead of provisional guesses
- widen the manifest beyond the first cheap batch
- add touched-plugin selection for PR smoke

### PR gate shape

PR automation should run:

- Layer 0 smoke
- touched plugin lanes
- affected bundle lane when relevant

Do **not** run the whole matrix on every PR unless you enjoy wasting compute and
ignoring flaky noise.

## Budgets

Start provisional, then freeze after the first real census.

Current stance:

- cheap core-activated deltas should stay in the small single-digit or low
  double-digit millisecond class
- provider-rich core lanes need their own honesty bar before Layer 1:
  if plain-context lower bounds are materially below the real provider-backed
  lane, keep fixing core and do not shift attention to plugins yet
- seeded `nodeId` should stay close to core
- unseeded `nodeId` init gets its own init budget, not hidden inside mount
- plugins should be judged against Plate core first and Slate second

The comparison hierarchy is:

1. Slate vs Plate core
2. Plate core vs Plate + one plugin
3. one plugin vs real bundle

If you skip step 2, you blame the wrong thing.

## Operational Rules

- Re-run the lane that matches the seam. Do not rerun giant suites by ritual.
- Keep raw artifacts, but always write a compact summary artifact too.
- The benchmark harness is the truth surface for numbers.
- The Huge Document docs page is the parity and manual-inspection surface.
- If the page-side automation API can drive a benchmark, prefer that over DOM
  click cosplay.
- Do not let stale plan docs fork the strategy again. This file is the source of
  truth for the editor-performance program.

## Verification State

This master plan is a docs consolidation. It does not change runtime behavior.

Relevant runtime verification already exists in the generated artifacts and the
recent smoke/full runs:

- `editor-perf-layer0-smoke-summary.json`
- `editor-perf-layer1-core-plugins-smoke-summary.json`
- `editor-perf-layer1-core-plugins-summary.json`

## Related Solution Docs

- [plate-vs-slate-benchmarks.md](/Users/zbeyens/git/plate-2/.claude/docs/performance/plate-vs-slate-benchmarks.md)
- [2026-03-31-plate-nodeid-should-use-setnodesbatch-only-for-live-normalization.md](/Users/zbeyens/git/plate-2/.claude/docs/solutions/performance-issues/2026-03-31-plate-nodeid-should-use-setnodesbatch-only-for-live-normalization.md)
- [2026-04-01-huge-document-demo-and-benchmark-should-share-a-query-param-config-contract.md](/Users/zbeyens/git/plate-2/.claude/docs/solutions/performance-issues/2026-04-01-huge-document-demo-and-benchmark-should-share-a-query-param-config-contract.md)
- [2026-04-01-side-by-side-editor-demos-should-support-single-engine-mount-for-honest-metrics.md](/Users/zbeyens/git/plate-2/.claude/docs/solutions/performance-issues/2026-04-01-side-by-side-editor-demos-should-support-single-engine-mount-for-honest-metrics.md)
- [2026-04-01-layer0-runner-should-write-summary-json-in-the-same-pass.md](/Users/zbeyens/git/plate-2/.claude/docs/solutions/performance-issues/2026-04-01-layer0-runner-should-write-summary-json-in-the-same-pass.md)
