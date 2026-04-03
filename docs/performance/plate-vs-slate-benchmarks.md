---
module: Editor performance
date: 2026-03-30
problem_type: performance_issue
component: tooling
symptoms:
  - "Plate had repeated perf complaints versus Slate on huge documents, but no repeatable harness could decompose the gap"
  - "Suspicions around zustand-x and jotai-x were hand-wavy because construction cost and DOM mount cost were blended together"
  - "The first benchmark draft returned fake zero mount times and a false no-chunk stress lane until the harness itself was debugged"
  - "The first benchmark pass still could not cleanly separate Plate's React wrapper cost from nodeId initialization cost or prove whether jotai-x provider/setup was actually involved"
root_cause: missing_tooling
resolution_type: tooling_addition
severity: high
tags:
  - performance
  - benchmark
  - slate
  - plate
  - nodeid
  - zustand-x
  - jotai-x
  - huge-document
  - init
  - react
---

# Plate vs Slate benchmarks should separate construction tax from nodeId mount tax

## Problem

Plate needed a fair huge-document benchmark against Slate, not another vibes-based perf argument.

The missing piece was a harness that separated editor construction cost from DOM mount cost, isolated `nodeId`, and let us rerun the same workload without rewriting ad hoc scripts every time.

## Symptoms

- Huge-document perf complaints existed, but the repo only had demos, not repeatable measurements.
- It was impossible to tell whether the main tax came from plugin/store creation, React subscriptions, `nodeId`, or simple plugin count.
- The first automation pass lied twice:
  - mount samples came back as zeros
  - the supposed no-chunk stress lane was still chunked
- A later runner pass found a third automation lie: waiting for “no running
  label” immediately after a benchmark click can race React state and falsely
  treat “not started yet” as “already done.”
- A later Layer 0 smoke pass found a fourth harness lie: using
  `http://127.0.0.1:<port>` against a Next dev server running on `localhost`
  can leave the page effectively unhydrated because dev resources are blocked
  cross-origin by default.
- A full `10,000`-block `construction + mount + input` run exceeded the runner's default `180000 ms` timeout.
- A later full Layer 0 pass found two more harness faults:
  - the runner tied Puppeteer's `protocolTimeout` to the app benchmark timeout,
    so the browser could kill a valid long run before the harness timeout did
  - the benchmark page server-rendered default query-param state and then
    hydrated a different workload from `document.location.search`, causing
    workload-specific hydration mismatches under runner-driven URLs
- A later blockquote-heavy Layer 0 rerun exposed another plain-core tax: the
  unknown-element `renderElement` fallback still resolved `path` for every node
  even though `RenderElementProps.path` was already optional

## What Didn't Work

- `hundreds-blocks-demo` was a useful side-by-side demo, but not a benchmark harness.
- Reusing the table-perf measurement pattern without adapting the remount mechanics caused fake mount results: the editor subtree remounted, but the `React.Profiler` did not, so measured runs never hit `phase === 'mount'`.
- Setting a controlled checkbox with `input.checked = false` plus a synthetic change event did not reliably update React state in the runner. The exported config exposed that the “stress” lane was still chunked.
- Driving the benchmark page like a normal form in headless Chromium was still
  too brittle. Even when the page was hydrated, synthetic control mutation was
  the wrong seam for a perf harness.

## Solution

Build a reusable benchmark lane around the huge-document workload and make it scriptable.

### 1. Add a dedicated dev benchmark page

`apps/www/src/app/dev/editor-perf/page.tsx` compares four controlled scenarios:

- Slate baseline
- Plate core with no user plugins and `nodeId: false`
- Plate core with default `nodeId`
- Plate basic with blocks and marks plugins

It mounts exactly one huge editor at a time. That matters. Rendering four huge editors at once turns the benchmark page into the main bottleneck and poisons the comparison.

### 2. Separate construction from mount

The page now runs three different lanes:

- construction: plain editor creation, batched to avoid sub-millisecond quantization
- mount: React `Profiler` timing on a keyed remount
- input: `Transforms.insertText` plus double-RAF settle

The key fix for mount was remounting the profiler itself:

```tsx
<React.Profiler
  key={`${activeScenarioId}:${mountVersion}`}
  id={activeScenarioId}
  onRender={onRender}
>
  <ScenarioEditor ... />
</React.Profiler>
```

Without that key, repeated runs looked like updates instead of mounts and the benchmark happily returned zeros.

### 3. Add machine-readable export and a reusable runner

The page exports structured JSON in a hidden `<pre>` and the repo now has:

- `apps/www/scripts/run-editor-perf.mts`
- `apps/www/package.json` script: `perf:editor`

The runner applies page controls, runs selected benchmarks, and writes JSON to disk. The checkbox fix was to use a real click when controlled state needs flipping:

```ts
if (input.checked !== checked) {
  input.click();
}
```

The next runner fix was about the benchmark-start race. The runner now captures
the JSON export before clicking, then:

- waits for the running label to appear and disappear when it actually shows up
- otherwise waits for the export JSON to change

That closes the “not started yet == finished” hole.

The next harness improvement was equally practical:

- the page now exposes a `Core mount stage` selector plus `Run active core mount stage`
- the runner now accepts `--core-mount-case <id>`

That turned `core-mount` from a full-zoo rerun into a usable seam tool for
`5,000`-block investigation.

The next scaling lesson was about preset shape, not just code:

- a full Layer 0 run at `5,000` blocks is a real comparison job
- it is not a cheap smoke loop
- the long-term program should keep a smaller Layer 0 smoke path instead of
  pretending the full Layer 0 matrix belongs in every quick automation pass

The next runner fix was more fundamental:

- the page now exposes a small page-side harness API on `window`
- the runner configures workloads and starts benchmarks through that API
  instead of pretending to be a user clicking form controls
- local runs must use the same origin as the dev server, for example
  `http://localhost:3000/dev/editor-perf`, unless Next `allowedDevOrigins`
  explicitly allows another host

That killed two fake problems at once:

- dead controls caused by `127.0.0.1` vs `localhost` origin mismatch in Next
  dev
- flaky control automation for benchmark-only state

The next runner fix was lower-level but just as important:

- `protocolTimeout` must be larger than the app-level benchmark timeout and the
  longest preset job timeout
- a timed-out `Promise.race` does **not** cancel `page.evaluate(...)`
- if the runner reloads the page after a timeout, the stale evaluation can
  later reject with `Execution context was destroyed` and crash the process

The runner now:

- computes a separate protocol timeout with headroom for long preset jobs
- treats `Runtime.callFunctionOn timed out` as recoverable
- swallows late `page.evaluate(...)` rejections after the timeout branch already
  won

The next page fix was about URL-driven state correctness:

- `/dev/editor-perf` now initializes from a server-safe default config
- it reads search params after mount
- it only writes benchmark search params back to the URL after that hydration
  step completes

That removes the `huge-mixed-block` vs workload-specific hydration mismatch
that showed up in Next dev logs when the runner switched scenario URLs.

The next plain-core fix was smaller but high leverage:

- `pipeRenderElement(...)` no longer forces `useNodePath(...)` before calling a
  custom `renderElement` fallback
- `RenderElementProps.path` is optional already, so this lookup was pure tax in
  fallback-heavy lanes like `huge-blockquote`

That one-line cut materially moved the lane it targeted:

- old full Layer 0 `core-blockquote-5k-chunk`:
  - Slate mount mean: `334.58 ms`
  - Plate core mount mean: `425.99 ms`
- targeted rerun after the fallback path cut:
  - Slate mount mean: `346.75 ms`
  - Plate core mount mean: `301.66 ms`

The exact numbers will drift by run, but the direction did not: removing the
fallback path lookup pulled Plate core out of the red on that lane.

### 6. Add a table-specific perf lane instead of pretending huge-doc tells the whole story

`/dev/editor-perf` is the right harness for editor-core and plugin-overhead
questions. It is the wrong place to diagnose table-selection cost.

The repo now also has:

- `apps/www/src/app/dev/table-perf/page.tsx`
- `apps/www/scripts/run-table-perf.mts`
- `apps/www/package.json` script: `perf:table`

That harness measures three different table workloads:

- mount
- input
- multi-cell selection

The first honest result was that selection, not mount, is the red lane:

- `20x20`, select `5x5`: `55.50 ms`
- `40x40`, select `10x10`: `224.51 ms`
- `60x60`, select `15x15`: `454.39 ms`

Two “probably this” ideas got tested and reverted:

- reducing block-selection context fan-out in the registry table UI
- reusing `useSelectedCells()` inside `useTableSelectionDom()`

Neither produced a real win.

The kept cut was lower and much less glamorous:

- `getTableGridByRange(...)` no longer routes plain unmerged tables through the
  merge-aware grid query path
- merged tables still go through the merge-aware branch

That moved the actual lane:

- `60x60`, select `15x15`:
  `454.39 ms -> 419.67 ms`
- `40x40`, select `10x10`:
  `224.51 ms -> 192.24 ms`

So the lesson is simple: do not chase table perf from the React shell first if
the query layer is still doing merge-specific work on non-merged tables.

### 4. Add deeper dissection lanes

The follow-up version adds three more lenses:

- `prebuiltMount`: create and initialize the editor first, then measure only the React/provider/render mount
- `initDissection`: split Plate into `constructOnly`, `initOnly`, `createWithValue`, and pure `normalizeNodeId(value)`
- `coreMount`: split the prebuilt Plate mount into provider only, `PlateSlate` only, `useEditableProps` only, `Editable` with static props, minimal editable mount, and full `PlateContent`
- then split the expensive `Editable` path again into `pipeRenderElement` only, `pipeRenderLeaf` + `pipeRenderText` only, and all render pipes together

That lets the harness answer two different questions cleanly:

- how much baseline Plate-vs-Slate tax exists even before `nodeId`
- how much `nodeId` cost comes from traversal versus runtime editor operations
- whether the remaining prebuilt mount gap lives in provider/setup, the raw hook call, or the actual `Editable` mount with `useEditableProps` outputs

### 5. Use small, controlled benchmark matrices first

These runs were enough to answer the important questions:

- `1,000` blocks, chunked
- `5,000` blocks, chunked
- `5,000` blocks, no chunking, no `content-visibility`
- `1,000` blocks, chunked, `prebuiltMount + initDissection`
  - `5,000` blocks, chunked, `prebuiltMount + initDissection`
  - `10,000` blocks, chunked, `initDissection`
  - `5,000` blocks, chunked, store fan-out at `250` and `1,000` subscribers

Key results:

- Construction mean per editor:
  - Slate: ~`0.0003 ms`
  - Plate core: ~`0.38-0.42 ms`
  - Plate basic: ~`0.65 ms`
- Mount mean at `5,000` chunked:
  - Slate: `255.57 ms`
  - Plate core: `616.24 ms` (`2.41x` Slate)
  - Plate core + `nodeId`: `1678.65 ms` (`2.72x` Plate core)
  - Plate basic: `636.40 ms` (`1.03x` Plate core)
- Mount mean at `5,000` no chunking:
  - Slate: `274.59 ms`
  - Plate core: `612.61 ms`
  - Plate core + `nodeId`: `1583.68 ms`
  - Plate basic: `623.44 ms`
- Input mean at `5,000` no chunking:
  - everyone lands around `39-40 ms`
- Prebuilt mount mean:
  - `1,000` blocks:
    - Slate: `66.18 ms`
    - Plate core: `125.06 ms`
  - `5,000` blocks:
    - Slate: `271.74 ms`
    - Plate core: `650.34 ms`
- Plate `initDissection`:
  - nodeId off `initOnly`:
    - `1,000`: `0.81 ms`
    - `5,000`: `3.93 ms`
    - `10,000`: `7.73 ms`
  - nodeId raw `initOnly`:
    - `1,000`: `1.10 ms`
    - `5,000`: `5.29 ms`
    - `10,000`: `10.83 ms`
  - nodeId pre-seeded `initOnly`:
    - `1,000`: `0.90 ms`
    - `5,000`: `4.73 ms`
    - `10,000`: `8.73 ms`
  - pure `normalizeNodeId(value)`:
    - `1,000`: `1.21 ms`
    - `5,000`: `6.10 ms`
    - `10,000`: `12.03 ms`
  - ids assigned in raw nodeId lane:
    - `1,000`: `1000`
    - `5,000`: `5000`
    - `10,000`: `10000`
  - nodeId with `normalizeInitialValue: null` now truly disables initial normalization:
    - `1,000`: `0.78 ms`, `0` ids assigned
    - `5,000`: `3.66 ms`, `0` ids assigned
    - `10,000`: `8.19 ms`, `0` ids assigned
  - store fan-out at `5,000` chunked:
    - zero extra subscribers already mount around `602-638 ms`
    - `250` subscribers:
      - `useEditorState`: `0.71 ms` update
      - `useEditorValue`: `0.68 ms` update
      - `useEditorSelector`: `1.11 ms` update
      - `usePluginOption`: `1.83 ms` update and `2` commits
      - mixed: `3.77 ms` update and `2` commits
    - `1,000` subscribers:
      - `useEditorState`: `2.85 ms` update
      - `useEditorValue`: `3.52 ms` update
      - `useEditorSelector`: `4.04 ms` update
      - `usePluginOption`: `4.61 ms` update and `2` commits
      - mixed: `13.95 ms` update and `2` commits
- Plate `coreMount`:
  - `1,000` blocks:
    - provider only: `0.19 ms`
    - `PlateSlate` only: `0.37 ms`
    - `useEditableProps` only: `0.46 ms`
    - `Editable` static props: `52.02 ms`
    - `Editable + element pipe`: `92.89 ms`
    - `Editable + fallback element pipe`: `57.45 ms`
    - `Editable + plugin element (precomputed path)`: `96.43 ms`
    - `Editable + leaf/text pipes`: `63.91 ms`
    - `Editable + render pipes`: `114.54 ms`
    - minimal editable: `112.69 ms`
    - full `PlateContent`: `115.48 ms`
  - `5,000` blocks:
    - provider only: `0.26 ms`
    - `PlateSlate` only: `0.69 ms`
    - `useEditableProps` only: `0.49 ms`
    - `Editable` static props: `273.26 ms`
    - `Editable + element pipe`: `473.55 ms`
    - `Editable + fallback element pipe`: `278.45 ms`
    - `Editable + plugin element (precomputed path)`: `502.07 ms`
    - `Editable + leaf/text pipes`: `358.38 ms`
    - `Editable + render pipes`: `573.85 ms`
    - minimal editable: `568.57 ms`
    - full `PlateContent`: `546.49 ms`
  - delta from static `Editable`:
    - `pipeRenderElement` only:
      - `1,000`: `+40.86 ms`
      - `5,000`: `+200.29 ms`
    - fallback element branch:
      - `1,000`: `+5.43 ms`
      - `5,000`: `+5.19 ms`
    - paragraph plugin with precomputed paths:
      - `1,000`: `+44.40 ms`
      - `5,000`: `+228.81 ms`
    - `pipeRenderLeaf` + `pipeRenderText` only:
      - `1,000`: `+11.89 ms`
      - `5,000`: `+85.11 ms`
    - all render pipes together:
      - `1,000`: `+62.51 ms`
      - `5,000`: `+300.59 ms`

## Iteration 1 fix

The first code fix landed in `packages/core/src/react/utils/pipeRenderElement.tsx`.

The important false lead was this:

- a lazy fallback `renderElement` path sounded plausible
- the benchmark split killed it
- Plate core minimal still routes most huge-document blocks through the built-in `p` plugin
- the fallback branch sits almost on top of static `Editable`, so it was never the main tax

The added benchmark cases made that obvious:

- `Editable + fallback element pipe`
- `Editable + plugin element (precomputed path)`

That showed:

- the paragraph plugin wrapper is the real element-path culprit
- precomputing paths does not collapse the cost, so `useNodePath` is not the main story

The landed fast path now skips the heavier `pluginRenderElement` wrapper when the matched element plugin is plain:

- no `render.node`
- no `render.as`
- no global `aboveNodes` / `belowNodes` wrappers

It still preserves plugin class injection, `BelowRootNodes`, and edit-only behavior.

Guard tests live in `packages/core/src/react/utils/pipeRenderElement.spec.tsx`.

Measured improvement versus the previous iteration:

- `1,000` blocks:
  - `Editable + element pipe`: `118.15 ms` -> `92.89 ms` (`-21.4%`)
  - minimal editable: `117.42 ms` -> `112.69 ms` (`-4.0%`)
- `5,000` blocks:
  - `Editable + element pipe`: `528.44 ms` -> `473.55 ms` (`-10.4%`)
  - minimal editable: `590.65 ms` -> `568.57 ms` (`-3.7%`)
  - full `PlateContent`: `581.84 ms` -> `546.49 ms` (`-6.1%`)

## Iteration 2 find

The next split decomposed the remaining paragraph path into:

- one `ElementProvider` per node
- `ElementProvider` + `PlateElement`
- `getRenderNodeProps` + `PlateElement`, but no provider

That made the answer much less hand-wavy.

- `1,000` blocks, pre-fix:
  - static `Editable`: `49.04 ms`
  - provider only: `67.77 ms` (`+18.74 ms`)
  - provider + `PlateElement`: `87.67 ms` (`+38.64 ms`)
  - `getRenderNodeProps`, no provider: `76.25 ms` (`+27.21 ms`)
  - full element pipe: `97.14 ms` (`+48.10 ms`)
- `5,000` blocks, pre-fix:
  - static `Editable`: `257.36 ms`
  - provider only: `369.55 ms` (`+112.19 ms`)
  - provider + `PlateElement`: `367.14 ms` (`+109.78 ms`)
  - `getRenderNodeProps`, no provider: `341.27 ms` (`+83.91 ms`)
  - full element pipe: `460.26 ms` (`+202.90 ms`)

That means:

- the per-node `ElementProvider` is a real scaling term
- `PlateElement` itself is basically not the problem in this lane
- `getRenderNodeProps` is also expensive, but smaller than the provider tax
- provider tax plus node-prop composition almost reconstruct the old element-path cliff

## Iteration 2 fix

The second code fix also landed in `packages/core/src/react/utils/pipeRenderElement.tsx`.

The same plain-element fast path from iteration 1 no longer mounts
`ElementProvider`.

That is safe in this path because:

- `getRenderNodeProps` already ran before any provider existed
- `PlateElement` does not read element context
- `BelowRootNodes` only reads editor context
- the path still excludes `render.node`, `render.as`, and global node wrappers

Measured improvement versus the previous iteration:

- `1,000` blocks:
  - `Editable + element pipe`: `97.14 ms` -> `82.42 ms` (`-15.1%`)
  - `Editable + render pipes`: `117.15 ms` -> `93.51 ms` (`-20.2%`)
  - minimal editable: `115.38 ms` -> `92.79 ms` (`-19.6%`)
  - full `PlateContent`: `116.36 ms` -> `94.19 ms` (`-19.1%`)
- `5,000` blocks:
  - `Editable + element pipe`: `460.26 ms` -> `347.39 ms` (`-24.5%`)
  - `Editable + render pipes`: `539.51 ms` -> `432.90 ms` (`-19.8%`)
  - minimal editable: `530.54 ms` -> `427.49 ms` (`-19.4%`)
  - full `PlateContent`: `533.34 ms` -> `425.71 ms` (`-20.2%`)

The benchmark now contains its own control:

- the normal `pipeRenderElement` lane lands at `347.39 ms`
- the direct `pluginRenderElement` lane with precomputed paths still lands at `476.45 ms`

Same plugin, same document, same path-lookup story. The important difference is
that the direct `pluginRenderElement` lane still pays the old per-node provider
tax while the new fast path does not.

## Iteration 3 find

The next split stopped treating `PlateElement` like one opaque blob and measured
three isolated no-provider lanes:

- static `Editable` plus a local wrapper with no `data-block-id`
- the same local wrapper with `data-block-id`, but no `useEditorMounted()`
- the real `PlateElement`

That answered the narrower question: was the remaining isolated `PlateElement`
tax actually the wrapper markup, the block-id check, or the plate-store
subscription used to gate `data-block-id` until mount?

- `1,000` blocks, pre-fix:
  - static `Editable`: `49.55 ms`
  - local wrapper, no block-id: `56.13 ms`
  - local wrapper, block-id but no mounted subscription: `53.10 ms`
  - real `PlateElement`, no provider: `64.39 ms`
- `5,000` blocks, pre-fix:
  - static `Editable`: `266.79 ms`
  - local wrapper, no block-id: `274.98 ms`
  - local wrapper, block-id but no mounted subscription: `275.60 ms`
  - real `PlateElement`, no provider: `325.70 ms`

That means:

- the plain wrapper markup is cheap
- the `data-block-id` check is cheap
- the extra isolated `PlateElement` tax was mostly the unconditional
  `useEditorMounted()` subscription on every node
- in the huge-document core-minimal lane, where nodes have no ids, those
  subscriptions were pure waste

## Iteration 3 fix

The third code fix landed in `packages/core/src/react/components/plate-nodes.tsx`
with focused coverage in
`packages/core/src/react/components/plate-nodes.spec.tsx`.

`PlateElement` now computes whether a node can ever emit `data-block-id`
before touching the plate store:

- if the element has no id, or is not a block, it renders through a hook-free
  body path
- only real block-id candidates still call `useEditorMounted()`
- mounted behavior stays intact for the nodes that actually need hydration-safe
  block ids

Guard coverage now proves:

- no-id elements render without a Plate store
- block ids stay hidden before mount
- block ids appear after mount

Measured confirmation versus the pre-fix isolated `PlateElement` lane:

- `1,000` blocks:
  - `Editable + PlateElement, no provider`: `64.39 ms` -> `57.47 ms`
    (`-10.7%`)
- `5,000` blocks:
  - `Editable + PlateElement, no provider`: `325.70 ms` -> `308.82 ms`
    (`-5.2%`)

The broader element path barely moved in the same rerun:

- `5,000` blocks:
  - `Editable + element pipe`: `347.39 ms` -> `346.00 ms`

That is the useful takeaway:

- the `PlateElement` subscription was real and worth removing
- it was an isolated tax, not the main remaining cliff
- the next dominant non-`nodeId` seam is still `getRenderNodeProps` plus the
  older direct `pluginRenderElement` path

## Iteration 4 find

The next `nodeId` pass instrumented the raw init path directly instead of
talking about “editor ops” as a blob.

The benchmark wrapped `editor.api.node` and `editor.tf.setNodes` during
`tf.init(...)` and measured both call counts and total time.

That showed the real bomb immediately:

- `editor.api.node(path)` was almost irrelevant
  - `5,000` blocks: `5000` calls, `1.50 ms`
  - `10,000` blocks: `10000` calls, `3.07 ms`
- `editor.tf.setNodes(...)` was almost the whole old init path
  - `5,000` blocks: `5000` calls, `431.05 ms` out of `441.45 ms`
  - `10,000` blocks: `10000` calls, `1631.13 ms` out of `1651.86 ms`

That means the issue was not “nodeId traversal is inherently slow.” The issue
was using a live Slate transform once per missing id during initial load, where
the editor already owned the whole value.

## Iteration 4 fix

The fourth code fix landed in
`packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts` with focused coverage
in `packages/core/src/lib/plugins/node-id/NodeIdPlugin.spec.tsx`.

`normalizeInitialValue` now walks `editor.children` directly and assigns ids in
place using editor-aware block checks.

Important boundary:

- runtime `tf.nodeId.normalize()` stays intact for live editor-operation paths
- only the initial-value path stopped using per-node `setNodes(...)`
- `normalizeInitialValue: null` remains a real hard disable
- inline nodes still stay skipped by default, guarded by a new link test

Measured confirmation versus the instrumented pre-fix path:

- `1,000` blocks:
  - raw `initOnly`: `29.51 ms` -> `1.10 ms`
- `5,000` blocks:
  - raw `initOnly`: `441.45 ms` -> `5.29 ms`
- `10,000` blocks:
  - raw `initOnly`: `1651.86 ms` -> `10.83 ms`

The stronger proof is structural, not just “faster”:

- raw init still assigns all ids
- `editor.api.node` calls drop to `0`
- `setNodes` calls drop to `0`
- raw init now lands on top of the pure `normalizeNodeId(value)` lane instead
  of the old live-transform cliff

## Iteration 5 targeted reruns and render-pipe fast paths

The new `--core-mount-case` runner support made the next live seam much less
fuzzy.

Targeted `5,000`-block reruns showed:

- provider only: `0.33 ms`
- `PlateSlate` only: `0.80 ms`
- `useEditableProps` only: `0.66 ms`
- `Editable` static props: `262.65 ms`
- `Editable + element pipe`: `326.81 ms`
- `Editable + leaf/text pipes`: `357.46 ms`
- `Editable + render pipes`: `417.14 ms`
- minimal editable: `411.26 ms`
- full `PlateContent`: `407.71 ms`

That means the live cliff was still the render layer, not provider setup,
`useEditableProps`, or `PlateContent`.

The same targeted reruns also killed the last broad `useNodePath` suspicion:

- plain plugin object only, no provider: `307.26 ms`
- plain fast element pipe with precomputed paths: `311.89 ms`
- live plain element pipe: `324.01 ms`

So live path lookup was only worth about `12 ms` in that lane.

Core-minimal had no leaf plugins, no text plugins, and no injected node props,
but Plate still paid `getRenderNodeProps(...)` on every leaf and text node.

The fix in `pipeRenderLeaf.tsx` and `pipeRenderText.tsx` was simple:

- if there is no plugin work and no injected node props, return the caller's
  renderer directly
- if there is no caller renderer either, render the default `PlateLeaf` /
  `PlateText` directly without `getRenderNodeProps`

Focused tests now guard:

- direct passthrough of custom `renderLeaf` / `renderText`
- `leafProps` behavior
- `textProps` behavior

Targeted `5,000`-block reruns after that fix:

- `Editable + leaf/text pipes`: `357.46 ms` -> `298.81 ms`
- `Editable + render pipes`: `417.14 ms` -> `360.40 ms`
- minimal editable: `411.26 ms` -> `357.80 ms`
- full `PlateContent`: `407.71 ms` -> `368.43 ms`

## Iteration 6 plain-element body fast path

The next targeted probe compared:

- local benchmark wrapper, no block-id logic: `257.56 ms`
- local benchmark wrapper, block-id but no mounted subscription: `268.14 ms`
- real `PlateElement`, no provider: `304.26 ms`

That means the remaining plain-element tax was no longer mounted state or
block-id logic. It was mostly the internal `PlateElement` wrapper path itself.

The fix stayed inside `pipeRenderElement.tsx`:

- if the matched plugin is plain
- and no block id needs hydration
- and no directional selection-affinity inset is needed

then the plain fast path renders the element body directly instead of paying the
full `PlateElement` component path.

Targeted `5,000`-block reruns after that fix:

- `Editable` static props: `256.31 ms`
- `Editable + element pipe`: `285.86 ms`
- `Editable + render pipes`: `323.18 ms`
- minimal editable: `317.98 ms`
- full `PlateContent`: `316.73 ms`

## Iteration 7 leaf/text plain-span fast path

The next targeted probe split the remaining leaf/text seam with a new benchmark
case:

- `Editable` static props: `266.40 ms`
- `Editable + leaf/text pipes`: `297.48 ms`
- `Editable + leaf/text plain renderers`: `250.64 ms`

That case still runs through `pipeRenderLeaf(...)` and `pipeRenderText(...)`,
but it passes plain `<span>` renderers in. So the comparison isolates the
default leaf/text wrapper path itself.

The important implication:

- the remaining `46.84 ms` leaf/text tax in the no-plugin lane was not a store
  issue
- it was not `PlateContent`
- it was the default `PlateLeaf` / `PlateText` zero-work wrapper path

This slice also exposed a benchmark harness bug first:

- the new benchmark case crashed with
  `ReferenceError: leafTextBenchmarkMode is not defined`
- root cause: `BenchmarkEditableMount` used the new prop but never destructured
  it
- fix: add the missing prop destructure in
  [page.tsx](/Users/zbeyens/git/plate-2/apps/www/src/app/dev/editor-perf/page.tsx)

The production fix stayed in `pipeRenderLeaf.tsx` and `pipeRenderText.tsx`:

- if there is no plugin work
- and no injected node props
- and no caller-provided renderer

then render a plain `<span {...attributes}>` directly.

The guarded cases stay on the old path:

- custom `renderLeaf` / `renderText`
- `leafProps` / `textProps`
- injected node props
- real plugin leaf/text renderers

Focused tests now also assert that the zero-work default leaf/text path still
lands on a plain `SPAN`.

Targeted `5,000`-block reruns after that fix:

- `Editable + leaf/text pipes`: `297.48 ms` -> `248.76 ms`
- `Editable + render pipes`: `323.18 ms` -> `309.80 ms`
- minimal editable: `317.98 ms` -> `301.21 ms`
- full `PlateContent`: `316.73 ms` -> `298.19 ms`

The strongest proof is not just “smaller number”:

- the fixed `Editable + leaf/text pipes` lane lands on top of the earlier plain
  renderer probe (`248.76 ms` vs `250.64 ms`)
- that means the old default wrapper tax is actually gone

## Iteration 8 pluginRenderElement hook cut

The next targeted probe moved to the richer `pluginRenderElement(...)` path.

At `5,000` blocks:

- direct `pluginRenderElement` with precomputed paths: `487.64 ms`
- same path, but reading attributes from props instead of `useElement()`:
  `456.26 ms`

That is a real signal. `ElementContent` was paying per-node element-store
consumer cost just to read the same element object that it already had in
props.

The seam was narrow:

- `pluginRenderElement` mounts `ElementProvider`
- `ElementContent` immediately called `useElement()`
- but only used that value to read `element.attributes`
- `props.element` already contains that same element

So the fix did not try to remove `ElementProvider`. That would be a different,
broader change. The first cut only removed the pointless self-read inside the
provider-backed path.

Production fix:

- file:
  [pluginRenderElement.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pluginRenderElement.tsx)
- keep `ElementProvider`
- keep custom node components and their access to element context
- stop calling `useElement()` inside `ElementContent`
- read `props.element.attributes` directly instead

Guard test:

- [pluginRenderElement.spec.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pluginRenderElement.spec.tsx)
- verifies default paragraph rendering still works
- verifies custom `render.node` components still receive element context through
  the provider

Targeted `5,000`-block reruns after the production fix:

- direct `pluginRenderElement`: `487.64 ms` -> `436.41 ms`

Best proof:

- after the production fix, the real `pluginRenderElement` lane converges
  toward the earlier no-`useElement` probe
- that means the gain is exactly the hook read we isolated, not unrelated noise

## Iteration 9 ElementProvider path-gating cut

The next split proved the remaining provider-heavy tax was not “Jotai
somewhere.” It was the effect path inside `ElementProvider`.

The benchmark only changed one thing: gate `FirstBlockEffect` from the incoming
`path` prop instead of calling `usePath()` inside every provider.

At `5,000` blocks:

- raw provider lane:
  - `Editable + element provider only`: `426.01 ms`
  - `Editable + provider + prop effect`: `383.13 ms`
  - delta: `-42.89 ms`
- real rich plugin lane:
  - `Editable + plugin element (precomputed path)`: `510.69 ms`
  - `Editable + plugin element + prop effect`: `479.40 ms`
  - delta: `-31.29 ms`

That is the exact shape you want before touching production code: same provider,
same store hydration, same children, less pointless work.

Production fix:

- file:
  [useElementStore.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/stores/element/useElementStore.tsx)
- keep `elementStore` and `useElementStore`
- stop exporting the generic effect-backed provider from `createAtomStore`
- build a no-effect provider with `createAtomProvider('element', elementStore.atom)`
- wrap it in a custom `ElementProvider`
- gate `FirstBlockEffect` from `path` props instead of subscribing to `path`
  from the per-node store

The production numbers carried through:

- provider-only lane:
  - `426.01 ms -> 368.10 ms`
- rich plugin lane:
  - `510.69 ms -> 457.39 ms`

Best proof:

- post-fix prop-gated probe: `366.85 ms`
- post-fix production provider lane: `368.10 ms`

That convergence says the probe was isolating the real seam, not inventing an
artificial fast path.

## Iteration 10 getRenderNodeProps plain-node fast path

After the provider path-gating cut, the richer paragraph-plugin path was still
slower than the manual “fast node props” probe.

The decisive split at `5,000` blocks:

- no-provider plugin-context baseline:
  - `Editable + PlateElement + plugin ctx`: `328.39 ms`
- no-provider `getRenderNodeProps` lane:
  - `Editable + render-node props, no provider`: `341.87 ms`
  - delta: `+13.49 ms`
- rich manual fast-node-props lane:
  - `Editable + plugin element, fast node props`: `415.92 ms`
- real rich plugin lane:
  - `Editable + plugin element (precomputed path)`: `444.36 ms`
  - delta: `+28.44 ms`

That made the next seam precise:

- `getRenderNodeProps(...)` still had a real plain-plugin tax
- the provider stack magnified that tax once the richer path consumed the
  heavier props object

Production fix:

- file:
  [getRenderNodeProps.ts](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/getRenderNodeProps.ts)
- add a fast path that only triggers when:
  - no inject node props are active
  - the plugin has no `node.props`
  - the plugin has no `dangerouslyAllowAttributes`
- in that lane:
  - keep the editor/plugin context
  - merge the Slate class name directly
  - preserve the existing attributes
  - keep the empty-style cleanup
  - skip the heavier `getPluginNodeProps(...)` path entirely

Guard coverage:

- file:
  [getRenderNodeProps.spec.ts](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/getRenderNodeProps.spec.ts)
- keep the plain paragraph fast path behavior
- keep the full path for plugin props, allowed attrs, and injected node props

Measured carry-through at `5,000` blocks:

- no-provider lane:
  - `341.87 ms -> 334.35 ms`
- rich plugin lane:
  - `444.36 ms -> 422.40 ms`

Residual gap after the cut:

- no-provider gap over plugin-context baseline:
  - `5.96 ms`
- rich gap over the manual fast-node-props probe:
  - `6.48 ms`

That is the right shape. The old `getRenderNodeProps(...)` tax is mostly gone,
and the remaining rich-plugin cost has moved downstream again.

## Iteration 11 plugin context precompute

The next rich-path split stayed on the same direct `pluginRenderElement(...)`
lane and asked a narrower question:

- the plugin is fixed for the whole render handler
- why are we rebuilding `getEditorPlugin(editor, plugin)` on every node?

The first tempting cut was the wrong one:

- precompute the wrapper-plugin arrays once
- skip the empty `BelowRootNodes` wrapper when there are no root children

That looked neat and benchmarked worse:

- direct `pluginRenderElement` lane:
  - `504.70 ms -> 516.94 ms`

So that patch was reverted. It was not the seam.

The next cut went after repeated plugin-context allocation instead:

- file:
  [pluginRenderElement.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pluginRenderElement.tsx)
- file:
  [getRenderNodeProps.ts](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/getRenderNodeProps.ts)
- compute `pluginContext = getEditorPlugin(editor, plugin)` once per
  `pluginRenderElement(...)` closure
- thread that object into `getRenderNodeProps(...)`
- keep the existing fallback behavior when no precomputed context is provided

Guard coverage:

- [pluginRenderElement.spec.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pluginRenderElement.spec.tsx)
- [getRenderNodeProps.spec.ts](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/getRenderNodeProps.spec.ts)

Measured carry-through at `5,000` blocks:

- direct `pluginRenderElement` with precomputed paths:
  - `504.70 ms -> 484.80 ms`
  - delta: `-19.90 ms`
  - improvement: `-3.94%`

Interpretation:

- rebuilding the plugin context object on every node was real tax
- it is smaller than the earlier `useElement()` cut, but still worth taking
- the remaining rich-path wall is still provider-backed work, not wrapper-array
  lookup theater

## Why This Works

The harness answers the right question in the right order.

Construction numbers tell us `zustand-x` and plugin-store creation are real, but small. They do not explain a jump from hundreds of milliseconds to well over a second.

Mount numbers tell us where the real damage is:

- Plate core already pays a large wrapper tax over Slate
- `nodeId` is the dominant multiplier on top of that
- basic plugin count barely moves the needle in this lane

That shifts the next investigation away from “maybe it’s just plugin count” and toward:

- `nodeId` initial-value processing
- React/Jotai subscription fan-out
- mount-time prop composition and editable wiring

The no-chunk stress lane also shows that turning chunking off hurts typing for everyone roughly equally. That means this benchmark's main framework delta is mount/setup, not keystroke latency.

The deeper split sharpens the take:

- Plate has a real React/provider/render tax even before `nodeId`. Prebuilt mount is already roughly `1.9x` Slate at `1,000` blocks and `2.39x` Slate at `5,000`.
- `nodeId` does not materially change prebuilt mount. That means `nodeId` is not a React mount problem.
- The old `nodeId` blow-up was almost entirely init-time work when ids were missing.
- Pre-seeding ids collapses `nodeId` init cost back to the baseline nodeId-off path.
- Pure `normalizeNodeId(value)` stays cheap compared with the old live init path. That proved the expensive part was not traversal itself; it was the runtime editor-operation path in `tf.nodeId.normalize()`.
- The op breakdown made that precise: `setNodes(...)` consumed almost the entire old init budget, while `editor.api.node(...)` was basically noise.
- Iteration 4 fixes the right seam by switching only the initial-value path to a direct walk over `editor.children`.
- After that fix, raw nodeId init lands near the pure normalize lane instead of exploding:
  - `1,000`: `1.10 ms`
  - `5,000`: `5.29 ms`
  - `10,000`: `10.83 ms`
- `normalizeInitialValue: null` is now a true disable path in practice, not just in the comment.
- The upstream Slate follow-up closes the `setNodes(...)` question:
  - benchmark file: [set-nodes-bench.js](/Users/zbeyens/git/slate/packages/slate/test/perf/set-nodes-bench.js)
  - flat `5,000` paragraphs:
    - `setNodes` per path: `73.35 ms`
    - direct `apply(set_node)`: `44.62 ms`
    - bare `modifyDescendant`: `37.01 ms`
  - grouped `5,000` paragraphs under `100` parent sections:
    - `setNodes` per path: `22.09 ms`
    - direct `apply(set_node)`: `9.11 ms`
    - bare `modifyDescendant`: `2.38 ms`
  - flat `10,000` paragraphs:
    - `setNodes` per path: `241.36 ms`
    - direct `apply(set_node)`: `147.71 ms`
    - bare `modifyDescendant`: `140.11 ms`
  - grouped `10,000` paragraphs:
    - `setNodes` per path: `66.19 ms`
    - direct `apply(set_node)`: `22.16 ms`
    - bare `modifyDescendant`: `7.25 ms`
  - timed `apply` breakdown:
    - `transformMs` dominates
    - `normalizeMs`, dirty-path work, and ref transforms stay tiny
    - one-pass rewrites land around `0.35-0.61 ms`
  - interpretation:
    - the expensive part is Slate's immutable branch rewrite path on wide sibling arrays
    - the old nodeId init bug was paying that cost once per missing id on a flat huge document
    - repeated `setNodes(...)` should not default to a normalization investigation; benchmark flat vs grouped shapes first
- The new fan-out lane answers the `zustand-x` / `jotai-x` suspicion more cleanly:
  - broad subscriber count is mostly an update-scaling problem, not the main mount bottleneck
  - zero extra subscribers already cost almost the full Plate prebuilt mount tax
  - adding hundreds or even `1,000` null-rendering subscribers barely moves mount time
  - `usePluginOption` is the heaviest single-hook update lane here and the only one that consistently causes two commits on its own
  - `useEditorValue` scales worse than `useEditorState` once subscriber count gets large
  - `useEditorSelector` is more expensive than plain tracked editor reads, but it still does not explain the mount cliff by itself
- The new core-mount lane answers the rest of the `jotai-x` suspicion:
  - provider-only stays around `0.2 ms`
  - `PlateSlate` plus `useSlateProps` stays under `1 ms`
  - `useEditableProps` by itself also stays under `1 ms`
  - so provider wiring and raw hook execution are not the mount cliff
- The real non-`nodeId` cliff is now narrower than "`useEditableProps`":
  - `Editable` with direct static props lands essentially on top of Slate-level prebuilt mount
  - the fallback element branch also lands near static `Editable`, so the first lazy-fallback theory is dead
  - the plain paragraph plugin path still accounts for most of the gap
  - `pipeRenderLeaf` + `pipeRenderText` add a smaller but still meaningful second chunk
  - all render pipes together already reproduce the full Plate core prebuilt mount number at both `1,000` and `5,000`
- The precomputed-path comparison says the remaining paragraph-plugin cost is not mostly `useNodePath`.
- The next split and fix make the remaining element-path story much tighter:
  - the per-node `ElementProvider` was a large part of the paragraph-plugin cliff
  - `getRenderNodeProps` is the other large part
  - once the plain-element fast path stops mounting `ElementProvider`, the normal `pipeRenderElement` lane collapses toward the no-provider `getRenderNodeProps` lane
  - the direct `pluginRenderElement` lane stays slow, which means that older provider-heavy path is still present and measurable
- The third split sharpens `PlateElement` itself:
  - after the provider tax was removed, `PlateElement` still carried a real isolated mount cost
  - that cost was mostly the unconditional `useEditorMounted()` subscription on every node, even when nodes had no ids
  - removing that pointless subscription helps the isolated lane, but barely changes the full element-pipe number
  - so `PlateElement` is no longer the main remaining target either
- Iteration 8 sharpens the richer plugin path too:
  - direct `pluginRenderElement` was still paying for a needless `useElement()`
    read inside `ElementContent`
  - removing just that read drops the synthetic rich-plugin lane by about
    `51 ms` at `5,000`
  - the provider is still expensive, but it is no longer paying for a
    pointless self-read on top of its own store cost
- That means the expensive thing is not hook memoization or the `PlateContent` effect stack. It is the mount-time work inside the plain paragraph plugin render path itself.
- In the no-plugin core lane, `pipeDecorate` is effectively irrelevant because it is undefined. The data does not support spending the next fix round there first.
- `PlateContent` itself is not the villain. Its extra effects and wrappers add basically noise on top of minimal editable mount.
- After the targeted reruns plus the new fast paths, the current live
  `5,000`-block stack is much tighter:
  - static `Editable`: `255.22 ms`
  - `Editable + element pipe`: `285.86 ms`
  - `Editable + leaf/text pipes`: `248.76 ms`
  - `Editable + render pipes`: `309.80 ms`
  - minimal editable: `301.21 ms`
  - full `PlateContent`: `298.19 ms`
- That shifts the next suspect list again:
  - `ElementProvider` itself in richer plugin paths, which is still a large
    chunk of the direct `pluginRenderElement` lane
  - any remaining `getRenderNodeProps(...)` work in richer non-plain plugin
    paths once the needless hook read is gone
  - only after that, any residual hook memo or handler wiring cost
- The next false seam is now clear too:
  - plain-context controls already showed a big `ElementProvider` gap:
    - provider-only: `362.83 ms` vs `255.18 ms`
    - rich fast-node-props: `406.54 ms` vs `335.54 ms`
  - a local Plate-side linked-store experiment removed scoped lookup while
    keeping one Jotai store per node
  - that barely helped provider-only (`354.60 ms`) and made richer lanes worse:
    - rich fast-node-props: `444.65 ms`
    - rich no-`useElement`: `437.32 ms`
  - that kills the “maybe it is mostly the scoped `Map` lookup” theory
  - the remaining `ElementProvider` tax is dominated by per-node Jotai store
    creation, hydration, and subscription work, not scope lookup
  - the experiment was reverted; the useful part is the conclusion
  - durable artifact:
    - `.claude/docs/plans/editor-perf-5000-element-store-experiment.json`
- The next split answers the “how much is raw Jotai vs `jotai-x` glue” question:
  - provider-only trio at `5,000` blocks:
    - plain React context: `244.15 ms`
    - raw Jotai provider + store: `303.59 ms`
    - `ElementProvider`: `343.04 ms`
  - rich fast-node-props trio at `5,000` blocks:
    - plain React context: `326.01 ms`
    - raw Jotai provider + store: `366.67 ms`
    - `ElementProvider`: `408.47 ms`
  - that splits the remaining provider tax into two real chunks:
    - provider-only:
      - raw Jotai provider/store: `+59.44 ms` over plain context
      - extra `jotai-x` glue: `+39.45 ms`
    - rich fast-node-props:
      - raw Jotai provider/store: `+40.66 ms` over plain context
      - extra `jotai-x` glue: `+41.80 ms`
  - interpretation:
    - one Jotai provider/store per node is already a large part of the wall
    - `jotai-x` still adds a real second tax, but it is not the whole story
    - future perf work should not start with tiny `HydrateAtoms` or
      `useSyncStore` rewrites unless the provider count problem is already
      reduced elsewhere
  - durable artifact:
    - `.claude/docs/plans/editor-perf-5000-jotai-provider-split.json`
- The next store-tech split answers the “what if we swap this hot path to
  `zustand-x` instead” question:
  - provider-only quartet at `5,000` blocks:
    - plain React context: `254.92 ms`
    - raw Jotai provider + store: `308.17 ms`
    - `zustand-x` store: `310.81 ms`
    - `ElementProvider`: `351.46 ms`
  - rich fast-node-props quartet at `5,000` blocks:
    - plain React context: `349.40 ms`
    - raw Jotai provider + store: `372.01 ms`
    - `zustand-x` store: `400.08 ms`
    - `ElementProvider`: `412.93 ms`
  - interpretation:
    - `zustand-x` is basically tied with raw Jotai in the provider-only lane
    - `zustand-x` is clearly worse in the richer lane by about `28 ms`
    - the hot-path problem is still provider/store count, not “wrong store
      brand”
    - `jotai-x` remains a measurable extra tax on top of raw Jotai, but a
      Jotai-to-Zustand swap is not the first move worth making
  - durable artifact:
    - `.claude/docs/plans/editor-perf-5000-store-tech-split.json`
- I also tried the obvious local `jotai-x` fix: replace the cloned-`Map` scope
  registry in `createAtomProvider` with a linked scope chain
  - that patch was benchmarked and reverted
  - provider-only extra `jotai-x` glue over raw Jotai got worse:
    - baseline: `+39.45 ms`
    - linked-scope experiment: `+60.90 ms`
  - rich fast-node-props got a little better:
    - baseline: `+41.80 ms`
    - linked-scope experiment: `+36.56 ms`
  - interpretation:
    - `Map` cloning may look suspicious, but it is not the whole `jotai-x`
      story
    - the remaining tax is more likely the extra provider layer and atom
      hydration/sync semantics themselves
    - this was not a stable enough win to ship
  - durable artifact:
    - `.claude/docs/plans/editor-perf-5000-jotaix-linked-scope-experiment.json`
- The next `jotai-x` fix went after the smaller helper tax that the provider
  split had already exposed:
  - `HydrateAtoms` still hydrates `{ ...initialValues, ...props }` during render
  - `useSyncStore` now batches sync writes through one writer atom instead of
    paying one `useSetAtom` hook and one `useEffect` per atom
  - `HydrateAtoms` also tells `useSyncStore` to skip the redundant first
    controlled sync when hydration already wrote the same prop values
  - at `5,000` blocks on a fresh dev server:
    - provider-only:
      - raw Jotai: `305.17 ms` -> `298.88 ms`
      - hydrate-only: `316.34 ms` -> `319.73 ms`
      - hydrate-sync: `328.60 ms` -> `314.22 ms`
      - full `ElementProvider`: `346.86 ms` -> `338.06 ms`
    - rich fast-node-props:
      - raw Jotai: `369.92 ms` -> `364.54 ms`
      - hydrate-only: `374.37 ms` -> `373.64 ms`
      - hydrate-sync: `383.54 ms` -> `380.85 ms`
      - full `ElementProvider`: `407.14 ms` -> `404.70 ms`
  - interpretation:
    - the helper tax is real and at least part of it was redundant
    - the sync-layer cut is worth keeping because it improves the exact lane it
      targeted without changing the larger conclusion
    - it does not magically fix the rich-plugin wall; provider count still
      dominates there
  - durable artifact:
    - `.claude/docs/plans/editor-perf-5000-jotaix-sync-batch.json`
- The next `jotai-x` fix was uglier because it was so stupid:
  - `createAtomProvider(...)` was calling `createStore()` eagerly inside
    `useState(...)`
  - React only keeps the first initializer result, but the expression still ran
    on every provider render
  - the fix was:

```tsx
const [storeState, setStoreState] = React.useState<JotaiStore>(() =>
  createStore()
);
```

  - clean sequential reruns on `http://localhost:3001/dev/editor-perf` showed:
    - direct rich `pluginRenderElement` lane:
      - `484.80 ms` -> `453.39 ms`
      - delta: `-31.41 ms` (`-6.48%`)
      - artifact:
        `tmp/editor-perf-5000-plugin-render-element-lazy-store-seq.json`
    - provider-only lane:
      - baseline from `.claude/docs/plans/editor-perf-5000-store-tech-split.json`:
        `351.46 ms`
      - clean rerun:
        `353.56 ms`
      - artifact:
        `tmp/editor-perf-5000-element-provider-lazy-store-seq.json`
  - interpretation:
    - keep the lazy-store fix
    - this was a real hot-path bug in `jotai-x`
    - it still does **not** change the larger conclusion
    - the remaining provider-backed wall is the per-node element store
      architecture, not one more tiny helper cut
- The next split asked the more precise question that the older provider lanes
  were still muddying:
  - how expensive is the exported element-hook surface itself when a custom node
    actually calls `useElement()` and `usePath()`?
  - the harness added five targeted `5,000`-block blockquote cases:
    - no-hook control:
      `editable-element-plugin-precomputed-no-element-hook`
    - real provider-backed hook lane:
      `editable-element-plugin-render-node-hooks`
    - same hook body on plain React context:
      `editable-element-plugin-render-node-hooks-plain-context`
    - same hook body on raw Jotai:
      `editable-element-plugin-render-node-hooks-jotai-provider`
    - same hook body on the extra `jotai-x` hydration variants
  - fresh results before the fix:
    - no-hook control: `434.65 ms`
    - provider-backed hook lane: `485.81 ms`
    - plain context: `317.58 ms`
    - raw Jotai: `367.46 ms`
    - hydrate-only: `384.95 ms`
    - hydrate-sync: `402.25 ms`
    - artifact:
      `.claude/docs/plans/editor-perf-5000-hook-consumer-context-summary.json`
  - interpretation:
    - the common element/path reads are not the problem by themselves
    - raw Jotai is measurably slower than plain context, but still far below
      the full Plate element-provider path
    - the real red zone is the exported `useElement()` / `usePath()` hot path
      riding through the per-node atom store
- The fix that actually fits the repo constraints was small and boring:
  - keep `ElementProvider`, `useElementStore()`, `elementStore`, and
    `useElementSelector()` intact for compatibility
  - add a cheap chained React context inside `ElementProvider`
  - make `useElement()` and `usePath()` read that context first instead of
    always going through `useAtomStoreValue(...)`
  - this keeps the exported store surface alive for selector/store consumers
    while removing store work from the common hot-path reads
  - same-batch reruns after the fix:
    - no-hook control: `472.92 ms`
    - provider-backed hook lane: `490.41 ms`
    - plain-context hook lane: `442.69 ms`
    - artifact:
      `.claude/docs/plans/editor-perf-5000-hook-consumer-context-after.json`
  - interpretation:
    - absolute rerun numbers drifted upward in that batch, so the right read is
      the within-batch delta, not the raw means
    - before the fix, the hook-consumer gap over the no-hook control was
      `51.16 ms`
    - after the fix, that same gap was `17.49 ms`
    - that is the real win: the exported element-hook hot path got much
      cheaper without breaking the public store surface
- The next split asked the follow-up question that the hook-path fix left
  behind:
  - what does the selector/store consumer path cost when a custom node calls
    `useElementSelector(...)` instead of `useElement()` / `usePath()`?
  - the harness added targeted `5,000`-block blockquote lanes for:
    - the provider-backed selector path
    - the same selector body on plain context
    - the same selector body on raw Jotai
  - the first result was not a speedup. It was a correctness bug:
    - the focused selector tests started failing because the first selector read
      could see `entry = null`
    - root cause:
      `ElementProvider` was still relying on the generic
      `createAtomProvider(...)` hydration path for `element`, `entry`, and
      `path`, even though it already owned those live props
  - the compatibility-preserving fix was to make `ElementProvider` own that
    path directly:
    - create and seed the per-node store immediately
    - sync later prop changes in a layout effect
    - keep `ElementProvider`, `elementStore`, `useElementStore()`, and
      `useElementSelector()` intact
  - that fixed the selector correctness failures, but the first benchmark rerun
    proved it was not the perf win by itself:
    - before:
      `tmp/editable-element-plugin-render-node-selector-5000-blockquote-before.json`
      `459.72 ms`
    - after the store-ownership fix only:
      `tmp/editable-element-plugin-render-node-selector-5000-blockquote-after.json`
      `469.84 ms`
  - the real selector perf cut was the next one:
    - `useElementSelector(...)` stopped building an extra
      `selectAtom(...) + useStoreAtomValue(...)` layer
    - it now calls `useEntryValue(...)` directly on the resolved store
    - rerun after that cut:
      `tmp/editable-element-plugin-render-node-selector-5000-blockquote-after-direct-entry.json`
      `449.81 ms`
  - lower-bound reruns in the same phase:
    - plain context:
      `tmp/editable-element-plugin-render-node-selector-plain-context-5000-blockquote-after.json`
      `326.85 ms`
    - raw Jotai:
      `tmp/editable-element-plugin-render-node-selector-jotai-provider-5000-blockquote-after.json`
      `383.86 ms`
  - interpretation:
    - the store-ownership rewrite was the right correctness fix and had to
      happen first
    - the direct selector rewrite was the first real selector-path perf win:
      `459.72 ms -> 449.81 ms`
    - the remaining selector/store gap is still large:
      - `+122.96 ms` over plain context
      - `+65.95 ms` over raw Jotai
    - so the next seam is store resolution and selector subscription overhead,
      not the common `useElement()` / `usePath()` reads anymore
  - the next focused rerun exposed one last fake tax:
    - `ElementProvider` was still wrapping every node in a redundant
      `ElementStoreProvider` layer even though it already owned the per-node
      store directly
    - removing that layer was a real cut:
      `tmp/editor-perf-5000-selector-provider-after-provider-cut.json`
      `384.33 ms`
    - that moves the provider-backed selector lane from:
      `449.81 ms -> 384.33 ms`
    - at that point the Plate selector path is basically tied with the raw
      Jotai lower bound:
      `384.33 ms` vs `383.86 ms`
  - one more idea looked smart and lost:
    - replacing the Jotai atom subscription in `useElementSelector(...)` with
      a custom per-provider entry subscription
    - rejected rerun:
      `tmp/editor-perf-5000-selector-provider-after-entry-store-cut.json`
      `397.81 ms`
    - do not ship that path; it regresses mount cost
  - revised take:
    - the remaining selector/store gap is no longer mostly Plate wrapper tax
    - it is mostly the raw Jotai-vs-context gap
    - the next real move is either deeper Jotai-level work or a deliberate hot-
      path architecture change, not more trimming around `ElementProvider`
  - the next architecture slice took that explicit opt-out route:
    - `ElementProvider` stopped creating a Jotai store on the default hot path
    - it now owns a tiny scoped runtime store for `element`, `entry`, and
      `path`
    - `useElementSelector(...)` subscribes to that runtime store directly
    - `useElementStore()` still works through a lazy compatibility bridge that
      only materializes a Jotai store when a caller asks for it
  - focused reruns after that change:
    - selector lane:
      `tmp/editor-perf-5000-selector-provider-after-runtime-store.json`
      `385.05 ms`
    - per-node provider/store lane:
      `tmp/editor-perf-5000-element-provider-only-after-runtime-store.json`
      `317.90 ms`
  - interpretation:
    - the selector lane stayed effectively flat against the already-good
      provider-cut result:
      `384.33 ms -> 385.05 ms`
    - the per-node provider/store lane got meaningfully cheaper:
      `368.10 ms -> 317.90 ms`
    - that proves the runtime-store opt-out preserves the public API while
      removing default Jotai work from the hot path
- The next split moved back to Plate and asked whether the new `render.as`
  fast path was real or just benchmark theater:
  - the harness added three `5,000`-block chunked lanes on a blockquote-only
    document with `BasicBlocksPlugin` loaded:
    - the old `render.as` provider-backed shape
    - the providerless lower bound
    - the real `pipeRenderElement(...)` lane on a basic-plugin editor
  - results:
    - `Editable + render.as, provider`: `418.07 ms`
    - `Editable + render.as, no provider`: `281.89 ms`
    - `Editable + element pipe (render.as)`: `289.28 ms`
  - interpretation:
    - the old provider-backed branch costs about `136.19 ms` more than the
      providerless lower bound at `5,000` blocks
    - the real production lane lands only `7.39 ms` above the lower bound, so
      the fast path is doing the intended work in practice
    - this matters beyond the benchmark page because basic block and mark
      plugins include many `render.as`-only surfaces
  - durable artifacts:
    - `tmp/editor-perf-5000-render-as-provider.json`
    - `tmp/editor-perf-5000-render-as-no-provider.json`
    - `tmp/editor-perf-5000-render-as-pipe.json`
    - `.claude/docs/plans/editor-perf-5000-render-as-summary.json`
- The next split moved into the mark path and asked where the remaining
  `render.as`-only mark tax actually lives:
  - the harness added seven `5,000`-block chunked lanes on a bold-only
    document:
    - direct bold lower bound
    - `PlateLeaf` only
    - `getRenderNodeProps(...)` + `PlateLeaf`
    - `pipeRenderLeaf(...)` only with the full basic mark stack
    - `pipeRenderLeaf(...)` only with `BoldPlugin` alone
    - `pipeRenderText(...)` only
    - the real combined leaf/text lane
  - results:
    - `Editable + bold direct renderers`: `231.64 ms`
    - `Editable + bold PlateLeaf direct`: `266.93 ms`
    - `Editable + bold leaf node props`: `301.58 ms`
    - `Editable + bold leaf pipe`: `381.96 ms`
    - `Editable + bold leaf pipe (bold only)`: `366.73 ms`
    - `Editable + bold text pipe`: `246.96 ms`
    - `Editable + bold leaf/text pipes`: `375.66 ms`
  - interpretation:
    - the mark cliff is leaf-side, not text-side; `pipeRenderText(...)` lands
      close to the direct lower bound
    - `PlateLeaf` and `getRenderNodeProps(...)` both cost real time, but they
      are not the whole wall
    - the biggest remaining mark-side seam is the active
      `pipeRenderLeaf(...)` / `pluginRenderLeaf(...)` path itself
    - trimming unused mark-plugin fan-out helps only a little, so the next fix
      should target the active bold path before chasing plugin-count theory
  - durable artifacts:
    - `tmp/editor-perf-5000-bold-direct-renderers.json`
    - `tmp/editor-perf-5000-bold-plugin-leaf-direct.json`
    - `tmp/editor-perf-5000-bold-plateleaf-direct.json`
    - `tmp/editor-perf-5000-bold-leaf-node-props.json`
    - `tmp/editor-perf-5000-bold-leaf-pipe.json`
    - `tmp/editor-perf-5000-bold-leaf-pipe-bold-only.json`
    - `tmp/editor-perf-5000-bold-leaf-pipe-plain-outer.json`
    - `tmp/editor-perf-5000-bold-text-pipe.json`
    - `tmp/editor-perf-5000-bold-pipe.json`
    - `.claude/docs/plans/editor-perf-5000-bold-summary.json`
- The next split proved the remaining bold-mark wall was mostly the outer
  fallback wrapper in `pipeRenderLeaf(...)`, not the inner active bold plugin
  path:
  - the harness added two more `5,000`-block bold-only lanes:
    - direct `pluginRenderLeaf(bold)` with plain text rendering
    - `pipeRenderLeaf(...)` with a plain outer `<span>` instead of the default
      outer `getRenderNodeProps(...)` + `PlateLeaf`
  - pre-fix results:
    - `Editable + bold plugin leaf direct`: `305.87 ms`
    - `Editable + bold leaf pipe (plain outer)`: `321.65 ms`
    - `Editable + bold leaf pipe (bold only)`: `371.89 ms`
  - interpretation:
    - the inner active bold plugin path is basically not the problem
    - adding a plain outer shell costs only `15.78 ms`
    - the outer default wrapper costs another `50.24 ms`, which is where the
      real remaining waste lived
  - fix:
    - in [pipeRenderLeaf.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pipeRenderLeaf.tsx),
      when there is no `renderLeafProp`, no inject-node-props work, and no
      `leafProps`, return the plain outer `<span>` fallback instead of the
      outer `getRenderNodeProps(...)` + `PlateLeaf` path
  - post-fix results:
    - `Editable + bold leaf pipe (bold only)`: `371.89 ms` -> `331.42 ms`
    - `Editable + bold leaf/text pipes`: `375.66 ms` -> `331.14 ms`
  - interpretation:
    - the cut removes about `40-45 ms` from the real bold-mark lanes at `5,000`
      blocks
    - after the fix, the bold-only leaf-pipe lane lands only `9.77 ms` above
      the plain-outer lower bound, so the wrapper theater is mostly gone
  - durable artifacts:
    - `tmp/editor-perf-5000-bold-plugin-leaf-direct.json`
    - `tmp/editor-perf-5000-bold-leaf-pipe-plain-outer.json`
    - `.claude/docs/plans/editor-perf-5000-bold-leaf-wrapper-summary.json`
- The next bold cut was on the text side, not the leaf side:
  - `pipeRenderText(...)` still always paid the outer `PlateText` path even
    when there was no inject-node-props work, no `textProps`, and no custom
    `renderText`
  - the fix mirrored the existing leaf fast path:
    - in [pipeRenderText.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pipeRenderText.tsx),
      when there is no `renderTextProp`, no inject-node-props work, and no
      `textProps`, return the plain outer `<span>` fallback instead of the
      outer `getRenderNodeProps(...)` + `PlateText` path
  - post-fix targeted reruns:
    - `Editable + bold text pipe`: `249.52 ms`
    - `Editable + bold leaf/text pipes`: `258.22 ms`
  - interpretation:
    - the text-side wrapper still had about `14.21 ms` of real tax left in the
      current tree
    - the narrow Layer 1 `BoldPlugin` rerun moved the activated delta from
      `+30.06 ms` to `+26.01 ms`
    - that is a real win, but the active bold lane is still red
  - durable artifacts:
    - `tmp/editor-perf-5000-bold-text-pipe-after-text-fast-path.json`
    - `tmp/editor-perf-5000-bold-pipe-after-text-fast-path.json`
    - `tmp/editor-perf-layer1-bold-only-after-text-fast-path.json`
- The next kept bold cut stayed inside the inner mark renderers, not the outer
  pipe shell:
  - problem:
    - plain `render.as` mark plugins like `BoldPlugin` were still paying
      `getRenderNodeProps(...)` plus `PlateLeaf` / `PlateText` inside
      `pluginRenderLeaf(...)` and `pluginRenderText(...)` even when the plugin
      had no node props, no dangerous attributes, and no selection-affinity
      behavior
  - fix:
    - in
      [pluginRenderLeaf.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pluginRenderLeaf.tsx)
      and
      [pluginRenderText.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pluginRenderText.tsx),
      keep the existing hook behavior but return a plain intrinsic
      `render.as` element for those simple mark cases instead of routing
      through `getRenderNodeProps(...)` and `PlateLeaf` / `PlateText`
  - post-fix targeted reruns:
    - `Editable + bold plugin leaf direct`: `250.65 ms`
    - narrow Layer 1 `BoldPlugin` rerun:
      - inactive delta vs core: `+6.21 ms`
      - activated delta vs core: `+16.21 ms`
  - interpretation:
    - the simple inner mark wrapper work was still a real chunk of the active
      bold tax
    - this is the first bold-only Layer 1 cut that moved the activated lane by
      a double-digit amount without changing the outer leaf/text DOM shape
  - durable artifacts:
    - `tmp/editor-perf-5000-bold-plugin-leaf-direct-plain-inner.json`
    - `tmp/editor-perf-layer1-bold-only-plain-inner.json`
- One more bold idea got tested and rejected immediately after:
  - idea:
    - once the inner plain mark element existed, hoist Slate's outer
      leaf/text attributes onto it and drop the extra outer wrapper in
      `pipeRenderLeaf(...)` / `pipeRenderText(...)`
  - result:
    - the synthetic `Editable + bold leaf/text pipes` case improved to
      `267.17 ms`
    - but the actual Layer 1 `BoldPlugin` rerun did not improve cleanly enough
      to justify the DOM-shape change:
      - inactive delta vs core: `+10.33 ms`
      - activated delta vs core: `+19.94 ms`
  - decision:
    - revert the outer-wrapper hoist
    - keep the safer inner plain-mark fast path only
  - rejected artifacts:
    - `tmp/editor-perf-5000-bold-pipe-hoisted-outer.json`
    - `tmp/editor-perf-layer1-bold-only-hoisted-outer.json`
- The next Layer 1 move was not more bold-only surgery. It was widening the
  cheap-mark census to the sibling plain `render.as` marks:
  - harness additions:
    - `ItalicPlugin`
    - `UnderlinePlugin`
    - workloads:
      - `huge-italic`
      - `huge-underline`
  - result:
    - targeted `5k` one-off `ItalicPlugin` rerun:
      - inactive delta vs core: `+10.86 ms`
      - activated delta vs core: `+11.04 ms`
    - targeted `5k` one-off `UnderlinePlugin` rerun:
      - inactive delta vs core: `+22.29 ms`
      - activated delta vs core: `+16.06 ms`
  - interpretation:
    - the inner plain-mark fast path does generalize beyond `BoldPlugin`
    - the cheap-mark family is still not uniformly green
    - underline currently looks like the worst sibling lane
  - caveat:
    - the full `layer-1-core-plugins` preset still hung after the heading job
      on `localhost:3001` in this session, so these sibling-mark numbers are
      directional one-off probes, not a fresh frozen batch summary yet
  - durable artifacts:
    - `tmp/editor-perf-layer1-italic-only.json`
    - `tmp/editor-perf-layer1-underline-only.json`
- The next kept cheap-mark cut stayed in `pipeRenderText(...)`, not in
  underline-specific code:
  - implementation:
    - split simple `render.as` text plugins from the generic text-plugin path
    - simple `isDecoration: false` marks now render inline inside the outer text
      pipe without paying a per-plugin hook/function stack
  - focused `5k` one-off reruns:
    - `BoldPlugin`: inactive `+6.19 ms`, activated `+15.00 ms`
    - `ItalicPlugin`: inactive `-0.51 ms`, activated `+14.11 ms`
    - `UnderlinePlugin`: inactive `+6.49 ms`, activated `+17.10 ms`
  - refreshed clean full `5k` Layer 1 batch on the real Plate dev server at
    `http://localhost:3011/dev/editor-perf`:
    - `BlockquotePlugin`: inactive `-19.69 ms`, activated `-14.49 ms`
    - `HeadingPlugin`: inactive `-4.66 ms`, activated `-17.33 ms`
    - `BoldPlugin`: inactive `+4.46 ms`, activated `+13.67 ms`
    - `ItalicPlugin`: inactive `+3.17 ms`, activated `+15.71 ms`
    - `UnderlinePlugin`: inactive `+7.36 ms`, activated `+19.44 ms`
  - interpretation:
    - the batch hang was the dead `localhost:3001` assumption, not a runner seam
    - the cheap-mark text path was still real and worth cutting
    - bold and italic moved out of the mid/high twenties into the mid-teens
    - underline remained the worst sibling, but still looks like generic
      text-pipe tax, not a unique underline path
  - durable artifacts:
    - `.claude/docs/plans/editor-perf-layer1-core-plugins-summary.json`
    - `tmp/editor-perf-layer1-bold-only-after-simple-text-fast-path.json`
    - `tmp/editor-perf-layer1-italic-only-after-simple-text-fast-path.json`
    - `tmp/editor-perf-layer1-underline-only-after-simple-text-fast-path.json`
- Before touching `UnderlinePlugin` itself, the right move was to dissect the
  underline lane the same way bold had been dissected:
  - targeted `5k` chunked `huge-underline` runs:
    - `Editable + underline direct renderers`: `254.70 ms`
    - `Editable + underline plugin leaf direct`: `251.01 ms`
    - `Editable + underline leaf/text pipes`: `267.41 ms`
  - interpretation:
    - the isolated active underline plugin path is already basically at the
      lower bound
    - underline is not a unique red seam inside `pluginRenderLeaf(...)`
    - the remaining tax is generic leaf/text pipe work, about `12.71 ms` above
      the direct `<u>` lower bound and `16.40 ms` above the isolated
      `pluginRenderLeaf(underline)` lane
  - durable artifacts:
    - `tmp/editor-perf-5000-underline-direct-renderers.json`
    - `tmp/editor-perf-5000-underline-plugin-leaf-direct.json`
    - `tmp/editor-perf-5000-underline-pipe.json`
    - `.claude/docs/plans/editor-perf-5000-underline-dissection-summary.json`
- Widening to the next sibling mark proved the cheap-mark family had already
  told us what it could:
  - targeted `5k` Layer 1 `CodePlugin` rerun:
    - inactive delta vs core: `-4.29 ms`
    - activated delta vs core: `+154.06 ms`
  - targeted `5k` chunked `huge-code` dissection on the correct `core-mount`
    benchmark:
    - `Editable + code direct renderers`: `257.29 ms`
    - `Editable + code plugin leaf direct`: `367.82 ms`
    - `Editable + code leaf/text pipes`: `392.68 ms`
  - interpretation:
    - `CodePlugin` itself is the next real core seam
    - the active code leaf path adds about `110.54 ms` above the direct
      `<code>` lower bound
    - the generic text-pipe tail is smaller, about `24.85 ms`
    - so the next cut should target code-mark-specific leaf composition /
      affinity-related props, not more generic `pipeRenderText(...)` cleanup
  - durable artifacts:
    - `tmp/editor-perf-layer1-code-only.json`
    - `tmp/editor-perf-5000-code-direct-renderers-core-mount.json`
    - `tmp/editor-perf-5000-code-plugin-leaf-direct-core-mount.json`
    - `tmp/editor-perf-5000-code-leaf-text-pipe-core-mount.json`
    - `.claude/docs/plans/editor-perf-5000-code-dissection-summary.json`
- The next safe cut on the active code lane was to keep the hard-affinity
  semantics but skip `getRenderNodeProps(...)` for the simple `render.as`
  branch:
  - implementation:
    - `pluginRenderLeaf(...)` now has a dedicated simple hard-affinity fast
      path that renders `PlateLeaf` directly for plain `render.as` marks
    - that preserves the `hard` edge behavior while cutting the plugin-context
      composition work
  - fresh `5k` chunked `huge-code` reruns:
    - `Editable + code PlateLeaf direct`: `337.39 ms`
    - `Editable + code plugin leaf direct`: `334.55 ms`
    - previous `Editable + code plugin leaf direct`: `367.82 ms`
  - interpretation:
    - the extra `getRenderNodeProps(...)` tax is gone; the plugin path is now
      effectively at the `PlateLeaf` floor
    - the remaining cost is the hard-affinity leaf body itself, about
      `77.26 ms` above the direct `<code>` lower bound
    - with a strong no-breakage bias, the next question is no longer
      `pluginRenderLeaf(...)`; it is whether the hard-edge DOM shape is worth a
      deeper redesign at all
  - durable artifacts:
    - `tmp/editor-perf-5000-code-plateleaf-direct-core-mount.json`
    - `tmp/editor-perf-5000-code-plugin-leaf-direct-core-mount-after-hard-affinity-fast-path.json`
    - `.claude/docs/plans/editor-perf-5000-code-hard-affinity-fast-path-summary.json`
- The next split came back to the core paragraph path and proved the remaining
  “plain element” wall was still living inside the fast branch itself:
  - current `5,000`-block chunked numbers before the fix:
    - `Editable + static Editable`: `266.71 ms`
    - `Editable + element pipe`: `298.72 ms`
    - `Editable + leaf/text pipes`: `250.30 ms`
    - `Editable + render pipes`: `334.79 ms`
  - probe lanes:
    - `Editable + bare plain fast path`: `251.26 ms`
    - `Editable + fast pipe (no belowRootNodes)`: `298.34 ms`
  - interpretation:
    - the remaining element cliff was real: about `47.46 ms` between the live
      element pipe and the bare lower bound
    - empty `BelowRootNodes` was not the answer
    - the real waste was the fast-branch shape itself: the paragraph path still
      paid hook-driven `readOnly` and path work before it knew it needed those
      hooks
  - fix:
    - in [pipeRenderElement.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pipeRenderElement.tsx),
      split the paragraph path into a hook-free direct-tag branch and a smaller
      helper that only pays `useNodePath()` when block-id or directional
      affinity behavior actually needs `PlateElement`
  - post-fix results:
    - `Editable + element pipe`: `298.72 ms` -> `255.89 ms`
    - `Editable + render pipes`: `334.79 ms` -> `244.56 ms`
    - `Minimal editable`: `325.28 ms` -> `242.18 ms`
    - `Full PlateContent`: `326.59 ms` -> `239.89 ms`
  - scoreboard rerun at `5,000` chunked:
    - Slate baseline: `247.65 ms`
    - Plate core minimal: `246.05 ms`
    - Plate core + `nodeId`: `317.83 ms`
    - Plate basic plugins: `237.07 ms`
  - durable artifacts:
    - `tmp/editor-perf-5000-editable-element-pipe-post-fast-branch.json`
    - `tmp/editor-perf-5000-render-pipes-post-element-fast-branch.json`
    - `tmp/editor-perf-5000-minimal-editable-post-element-fast-branch.json`
    - `tmp/editor-perf-5000-plate-content-post-element-fast-branch.json`
    - `tmp/editor-perf-5000-chunk-post-element-fast-branch.json`
    - `.claude/docs/plans/editor-perf-5000-element-fast-branch-summary.json`
- The next seeded `nodeId` split showed the remaining mount gap was the mounted
  block-id gate itself:
  - seeded `5,000`-block probes before the fix:
    - `Editable + bench element, no block-id`: `263.50 ms`
    - `Editable + bench element, no mounted sub`: `264.64 ms`
    - `Editable + bench mounted block-id`: `281.33 ms`
    - `Editable + bench element + node attrs`: `285.04 ms`
    - `Editable + element pipe`, seeded: `284.40 ms`
  - interpretation:
    - the earlier seeded lower bound was too generous because it never paid the
      `useEditorMounted()` subscription
    - the exact mounted-gate probe landed within `3.08 ms` of the real seeded
      production lane, which pinned the remaining `nodeId` mount tax on that
      one hook
    - the mounted gate was only hiding a static `data-block-id` attribute until
      after mount; it was not doing meaningful editor work
  - fix:
    - remove the mounted gating from
      [pipeRenderElement.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pipeRenderElement.tsx)
      so the plain block-id fast path emits `data-block-id` immediately
    - remove the same gate from
      [plate-nodes.tsx](/Users/zbeyens/git/plate-2/packages/core/src/react/components/plate-nodes.tsx)
      so `PlateElement` no longer fans out per-node subscriptions just to decide
      whether to print that attribute
  - post-fix results:
    - `Editable + element pipe`, seeded: `284.40 ms` -> `259.49 ms`
    - scoreboard rerun at `5,000` chunked:
      - Slate baseline: `254.36 ms`
      - Plate core minimal: `227.80 ms`
      - Plate core + `nodeId`: `246.85 ms`
      - Plate basic plugins: `236.66 ms`
  - durable artifacts:
    - `tmp/editor-perf-5000-nodeid-mounted-block-element-seeded.json`
    - `tmp/editor-perf-5000-nodeid-element-pipe-post-mounted-gate-removal.json`
    - `tmp/editor-perf-5000-chunk-post-mounted-gate-removal.json`
    - `.claude/docs/plans/editor-perf-5000-nodeid-mounted-gate-summary.json`

## Prevention

- Benchmark one scenario at a time. Multiple huge editors on one page make garbage numbers.
- Always separate construction from mount. Blending them makes store-creation suspicions impossible to test.
- Key the `React.Profiler` when the thing you want is true mount cost.
- Verify runner-applied controls from exported JSON. Do not trust UI automation blindly.
- Add a prebuilt-mount lane when the question is framework wrapper cost. Otherwise init work gets blamed on React.
- Add an init-only lane when plugins mutate the initial value. Otherwise plugin transforms get blamed on DOM mount.
- Re-run the lane that matches the seam. `core-mount` is for render-path work. `init-dissection` is for `nodeId` and initial-value work. Reusing the wrong lane by habit is how perf work turns into theater.
- Add a fan-out lane when the argument is really about store hooks. Without that, mount-time core cost and post-mount subscription cost get mixed together and people end up blaming the wrong state library.
- Add a core-mount lane when the argument is really about the remaining prebuilt mount cliff. Without that, provider/setup, `Editable`, and hook-consumed render plumbing all get blamed together.
- If a plugin mutates the initial value and already owns `editor.children`, do not default to live per-node Slate transforms. The `nodeId` init bug was exactly that mistake.
- If the suspect is a repeated Slate transform, benchmark the same op in `../slate` with both flat and grouped document shapes before blaming React or store glue. Shape-sensitive collapse is a strong sign that immutable ancestor-array cloning is the real cost.
- If the remaining culprit is still too broad, split the `Editable` path again. Static `Editable`, element-only pipe, leaf/text-only pipes, and full render-pipe stack together are enough to tell whether the first fix should land in element wrappers or leaf/text wrappers.
- If a component only needs mounted state to gate an optional DOM attribute, do not subscribe every node by default. Split the mounted-only path so non-candidate nodes stay hook-free.
- Keep both a realistic chunked lane and a no-chunk stress lane.
- Treat timeout at larger sizes as signal. If `10,000` blocks cannot finish the full suite inside `180000 ms`, that is already a scaling result.
- If Puppeteer is used for long stress lanes, set the protocol timeout explicitly. Otherwise the harness can fail before the benchmark does.
- Make runner knobs scriptable. The fan-out lane needed `--fanout-subscribers` or it would be reusable in theory and annoying in practice.
- Make single-stage reruns scriptable too. `--core-mount-case` turned
  `core-mount` from a periodic snapshot tool into an actual fix loop.
- When adding a new benchmark mode, smoke-test the active rerun button once
  before trusting the runner. The `leafTextBenchmarkMode` bug would have looked
  like a flaky perf harness if the page error had not been checked directly.
- In provider-backed render paths, benchmark “same provider, fewer consumers”
  before redesigning the store. The `pluginRenderElement` slice showed that one
  pointless `useElement()` read was worth about `51 ms` on its own.
- If a provider effect only needs current props, gate it from props. Do not
  hydrate a per-node store and then subscribe to that same store just to learn
  “not this node” thousands of times.
- If a provider-backed lane is still too broad, add a raw-Jotai control before
  editing `jotai-x`. That split tells you whether the main wall is your glue or
  the underlying “one provider/store per node” architecture.
- If you add a benchmark inside a sibling package, pin React and Jotai
  resolution to one known runtime before importing the built package. The
  dedicated `jotai-x` benchmark only became trustworthy once it stopped picking
  up a stray package-local React 19 graph from
  `packages/jotai-x/node_modules`.
- If a store helper defaults to “identity selector,” do not still build a
  `selectAtom(...)` wrapper for it. The dedicated `jotai-x` benchmark proved
  that plain value reads deserve a direct `useAtomValue(...)` fast path.
- If a selector helper memoizes the selector function but recreates the
  `selectAtom(...)` derived atom every render anyway, it is still wasting work.
  Memoize the derived atom too or stop pretending the selector is memoized.
- If the next tempting idea is “just swap Jotai for Zustand,” add a store-tech
  split before touching runtime code. The `5,000`-block lane showed
  `zustand-x` was basically tied with raw Jotai in provider-only work and worse
  in the richer path, so store swapping is not the first-order fix.
- If a `jotai-x` change only improves one lane while making the simpler lane
  worse, revert it. The linked-scope registry experiment looked elegant and did
  not earn a stable benchmark win.
- If controlled props are already hydrated into a store during render, do not
  pay a second mount-time sync pass to write the same values again. That was a
  measurable `jotai-x` tax all by itself.
- If a render path has no plugin node props, no allowed attrs, and no inject
  node props, do not run the full node-prop composition machinery anyway.
  Merge the class and return. Anything else is paying abstraction tax for
  literally nothing.
- If a plugin only sets `render.as`, benchmark that seam separately before
  assuming the remaining rich-plugin tax still applies. The blockquote split
  showed the real `pipeRenderElement(...)` lane can collapse almost all the way
  to the providerless lower bound once the provider-heavy branch is skipped.
- If a path is supposed to be fast, keep the fast branch hook-free. The
  paragraph path only collapsed once `useReadOnly()` and `useNodePath()` moved
  behind the slower branch that actually needed them.
- If a per-node hook only exists to hide a static DOM attribute until after
  mount, benchmark the same branch without that gate. The seeded `nodeId` split
  showed that one mounted-store subscription can still cost about `25 ms` at
  `5,000` blocks for no meaningful runtime value.
- Next follow-ups should target:
  - then the remaining direct `pluginRenderElement` provider/context cost after
    the path-gating cut
  - only after that, the residual `getRenderNodeProps(...)` work in richer
    plugin paths that really do have `node.props`, allowed attrs, or injected
    node props
  - only after that, any residual `useEditableProps` memo or handler wiring cost
  - runtime `tf.nodeId.normalize()` only if a real non-init hot path appears
  - dense element-store fan-out (`useElement`, `useElementSelector`) only after the main mount tree is no longer a black box
  - larger plugin-count scaling beyond the basic bundle

## Related Issues

- Benchmark plan: [editor-performance-master-plan.md](/Users/zbeyens/git/plate-2/.claude/docs/performance/editor-performance-master-plan.md)
- Benchmark outputs:
  - `.claude/docs/plans/editor-perf-1000-chunk.json`
  - `.claude/docs/plans/editor-perf-5000-chunk.json`
  - `.claude/docs/plans/editor-perf-5000-nochunk.json`
  - `.claude/docs/plans/editor-perf-1000-dissection.json`
  - `.claude/docs/plans/editor-perf-5000-dissection.json`
  - `.claude/docs/plans/editor-perf-10000-init-dissection.json`
  - `.claude/docs/plans/editor-perf-5000-fanout-250.json`
  - `.claude/docs/plans/editor-perf-5000-fanout-1000.json`
  - `.claude/docs/plans/editor-perf-1000-core-mount.json`
  - `.claude/docs/plans/editor-perf-5000-core-mount.json`
  - `.claude/docs/plans/editor-perf-5000-core-mount-targeted-summary.json`
  - `tmp/editor-perf-5000-plugin-render-element-plugin-context.json`
  - `tmp/editor-perf-5000-plugin-render-element-precomputed-wrappers.json`
  - `.claude/docs/plans/editor-perf-5000-jotai-provider-split.json`
  - `.claude/docs/plans/editor-perf-5000-store-tech-split.json`
  - `.claude/docs/plans/editor-perf-5000-jotaix-linked-scope-experiment.json`
  - `.claude/docs/plans/editor-perf-5000-element-fast-branch-summary.json`
- Upstream transform benchmark:
  - `/Users/zbeyens/git/slate/packages/slate/test/perf/set-nodes-bench.js`
