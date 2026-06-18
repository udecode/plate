---
status: done
owner: slate-v2-tanstack-virtualization-ralplan
source_repo: Plate repo root
created: 2026-05-03
---

# Slate v2 TanStack Virtualization Ralplan

## Current Verdict

Use TanStack Virtual, but only as the viewport range and measurement engine for
Slate's experimental `renderingStrategy.type = 'virtualized'`.

Do not make virtualization the default. Do not let TanStack own Slate's editor
semantics. Slate still owns DOM coverage, materialization, selection import and
export, model-backed copy/paste, IME guards, mobile policy, browser find
classification, accessibility, metrics, and release gates.

Blunt take: GitHub's result is strong evidence for TanStack Virtual on huge
repeated surfaces. It is not evidence that a contenteditable document can safely
remove DOM by default. GitHub diff lines are not editable rich-text nodes with
composition, native selections, Slate fragments, voids, and collaboration.

## Implementation Result

Status: complete for the requested implementation slice.

Implemented in `Plate repo root`:

- Added `@tanstack/react-virtual` as a `slate-react` runtime dependency.
- Replaced the experimental virtualized fixed-segment shell path with a
  TanStack-backed viewport plan.
- Kept `renderingStrategy` as the public prop and split virtualized options
  from shell options: virtualized uses `estimatedBlockSize`, `overscan`, and
  `threshold`; shell keeps `segmentSize`.
- Kept virtualization explicit. `auto` remains DOM-present/staged.
- Added internal `useVirtualizedRootPlan` with runtime-id keys, retained
  selection/materialization indexes, measured rows, scroll-to-index support,
  and coalesced missing ranges.
- Registered missing viewport ranges as `DOMCoverageBoundary` records with
  `reason: 'viewport-virtualization'`, `state: 'virtualized'`,
  `selectionPolicy: 'materialize'`, `copyPolicy: 'include-model'`, and
  `findPolicy: 'not-native-until-mounted'`.
- Added a full runtime example at
  `rendering-strategy-runtime?runtime_mode=virtualized-full&blocks=1000`.
- Updated Slate React docs and the performance walkthrough to show the bounded
  scroll-surface requirement and native find/a11y limitation.
- Added unit and browser proof for the TanStack-backed path.

Verified:

- `bun test ./packages/slate-react/test/rendering-strategy-and-scroll.tsx`
- `bunx turbo typecheck --filter=./packages/slate-react`
- `bun typecheck:site`
- `bun lint:fix`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "TanStack-backed virtualized"`
- `bunx turbo build --filter=./packages/slate-react`
- `bun typecheck:root`
- `bun check`

Remaining release-hardening gates stay true but are not blockers for this
implementation slice:

- 25k/100k stress benchmark cohorts;
- broader IME/mobile/browser-find matrix;
- full select/copy/paste parity over virtualized ranges.

## Intent / Boundary Record

Intent:

- Convert the current fixed-segment experimental virtualized mode into a real
  viewport-driven mode using TanStack Virtual.
- Preserve Slate v2's safer DOM-present default story.
- Make the extreme-document path measurable instead of clever.

Desired outcome:

- `renderingStrategy={{ type: 'virtualized' }}` uses TanStack Virtual internally
  to choose mounted top-level blocks by viewport range.
- Missing DOM is represented through `DOMCoverageBoundary` records with
  `reason: 'viewport-virtualization'`.
- Caret targets materialize before editing.
- Broad selection/copy can use model-backed payloads without stale DOM.
- Native behavior changes are explicit and measured.

In scope:

- `slate-react` virtualized rendering strategy.
- `DOMCoverageBoundary` bridge policy for virtualized ranges.
- TanStack Virtual dependency placement and internal adapter shape.
- Public `renderingStrategy` DX for experimental virtualized mode.
- Benchmarks, package tests, browser proof, and metrics.

Non-goals:

- No default virtualization.
- No stable public promise that browser find sees unmounted text.
- No ProseMirror-style NodeView API.
- No TanStack API surface leak into raw Slate beyond minimal editor-shaped
  options.
- No current-version Plate/slate-yjs adapters in this plan.
- No public `slots.Boundary` stabilization.

Decision boundaries:

- The plan may revise experimental `virtualized` options because this mode is
  already documented as experimental.
- The plan may add `@tanstack/react-virtual` to `slate-react` if the install
  and bundle gate are clean.
- The plan may switch the internal dependency to `@tanstack/virtual-core` only
  if the React hook adds unacceptable default-path bundle or render cost. Public
  API must not change either way.

Unresolved user-decision points:

- none for the planning pass. Implementation must re-check which TanStack
  package is actually installed before editing manifests.

## Source Grounding

Live `Plate repo root` facts:

- `Editable` already documents safe staged rendering as the default and
  describes virtualized mode as experimental with missing native find and
  screen-reader coverage until mount.
  Source: `content/docs/slate/libraries/slate-react/editable.md:211-268`.
- `RenderingStrategyOptions` already includes `'virtualized'`, but the option
  object shares shell-oriented `segmentSize` instead of viewport measurement.
  Source:
  `packages/slate-react/src/rendering-strategy/create-segment-plan.ts:3-18`.
- Current virtualized planning is fixed segment math over top-level runtime ids,
  not viewport measurement.
  Source:
  `packages/slate-react/src/rendering-strategy/create-segment-plan.ts:29-73`
  and
  `packages/slate-react/src/editable/root-selector-sources.ts:228-242`.
- Current `EditableDOMRoot` runtime strategy prop accepts only `'staged' |
'shell'`, so virtualized mode is passed through root runtime as shell-shaped
  policy.
  Source:
  `packages/slate-react/src/components/editable.tsx:83-90`
  and
  `packages/slate-react/src/components/editable-text-blocks.tsx:1557-1563`.
- Current virtualized tests already prove viewport DOM coverage boundaries,
  materializing selected segments, broad model-backed selection, and metrics.
  Source:
  `packages/slate-react/test/rendering-strategy-and-scroll.tsx:171-340`.
- `DOMCoverageBoundary` already has `state: 'virtualized'`,
  `reason: 'viewport-virtualization'`, materialization, indexed boundary lookup,
  and boundary-aware point/range APIs.
  Source:
  `packages/slate-dom/src/plugin/dom-coverage.ts:26-39`,
  `packages/slate-dom/src/plugin/dom-coverage.ts:539-589`,
  `packages/slate-dom/src/plugin/dom-coverage.ts:592-619`,
  and
  `packages/slate-dom/src/plugin/dom-coverage.ts:639-676`.
- `EditableRenderingStrategyMetrics` already includes cohort, mounted/pending
  counts, DOM node count, editable descendant count, and viewport virtualization
  boundary count.
  Source: `packages/slate-react/src/components/editable.tsx:103-175`.
- No active `@tanstack/react-virtual`, `@tanstack/virtual-core`,
  `useVirtualizer`, or `useWindowVirtualizer` hit was found in
  `Plate repo root/package.json`, `packages`, `site`, `docs`, or `bun.lock` during
  this pass.

External evidence:

- GitHub's diff article supports the sequence: cheap repeated units first,
  then TanStack Virtual for p95+ pull requests. It reports large reductions in
  rendered components, heap, DOM pressure, and INP after simplification plus
  virtualization.
- TanStack Virtual official docs require `count`, `getScrollElement`, and
  `estimateSize`; support `overscan`, `getItemKey`, `rangeExtractor`,
  `measureElement`, `scrollToIndex`, `onChange`, `scrollMargin`, and dynamic
  size measurement with `data-index`.
  Source:
  `docs/research/sources/editor-architecture/tanstack-virtual-and-github-large-surface-virtualization.md`.

## Decision Brief

Principles:

1. Slate core semantics beat viewport library convenience.
2. DOM-present editing remains the default.
3. Missing DOM must always be registered as DOM coverage.
4. Virtualization is a degradation tier, not a stealth performance default.
5. Public DX stays Slate-shaped, not TanStack-shaped.

Top drivers:

- extreme-document DOM/heap/INP pressure;
- contenteditable correctness under missing DOM;
- public API minimalism and adoption clarity.

Viable options:

| Option                                                       | Verdict | Reason                                                                                                    |
| ------------------------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------- |
| Keep homegrown fixed segment virtualization                  | reject  | It is not viewport virtualization; it cannot use measured block height or scroll range.                   |
| Use TanStack Virtual as an internal range/measurement engine | choose  | Best leverage: proven library for visible range, stable keys, measurement, overscan, and scroll-to-index. |
| Expose TanStack's options directly on `Editable`             | reject  | Leaks a list library into Slate editor API and pushes native behavior policy onto users.                  |
| Make virtualized mode default for `auto`                     | reject  | Native find, a11y, mobile, IME, selection, and copy/paste are not release-grade for default editing.      |
| Use TanStack to replace DOM coverage                         | reject  | TanStack knows viewport geometry, not Slate model points or clipboard semantics.                          |

Chosen option:

- Add a Slate-owned `useViewportRenderingPlan` / `useVirtualizedRootPlan`
  adapter in `slate-react` that uses TanStack Virtual for viewport range and
  measurement, then converts visible indexes and retained indexes into Slate's
  existing mounted runtime-id and DOM coverage plan.

Consequences:

- `slate-react` gains a dependency and a browser/runtime proof burden.
- Virtualized mode becomes more useful, but still remains experimental.
- Current shell/virtualized shared runtime classification must be split or
  explicitly bridged so virtualized policy does not masquerade as shell policy.

Follow-ups:

- Re-check dependency install status.
- Measure default-path bundle and render cost.
- Decide whether `@tanstack/react-virtual` or `@tanstack/virtual-core` is the
  final internal import after bundle proof.

## Intent / Decision Pass Result

Status: complete for the 2026-05-03 Ralph activation.

Evidence used:

- live `Plate repo root` rendering strategy, DOM coverage, metrics, and tests listed
  in Source Grounding;
- TanStack Virtual required and optional primitives summarized in the research
  note;
- GitHub diff performance article as large repeated-surface evidence, not
  editable rich-text proof.

No user question needed:

- The user's intent is clear: use TanStack Virtual for Slate v2 virtualization.
- Missing facts are repo/package facts and browser proof, not user decisions.

Boundary hardening:

- Scroll container: do not expose public `getScrollElement` in v1. Resolve the
  root scroll owner, nearest scroll parent, or window internally. If that cannot
  be proven safely, fall back to staged mode and report the effective strategy
  through metrics. Add a public scroll-owner override only if browser proof
  demands it.
- Public sizing: `estimatedBlockSize` is numeric in the first public shape. Do
  not expose a sizing callback until a type/API pass proves it is necessary.
- Dependency: prefer `@tanstack/react-virtual` as the `slate-react`
  implementation dependency. If bundle or default render gates fail, switch the
  internal implementation to `@tanstack/virtual-core` without changing public
  API.
- Layout: TanStack is the range engine first. Absolute-positioned editable
  descendants are gated behind browser proof.
- Default: `auto` cannot flip to virtualized in this plan.

Plan delta:

- Locked the no-public-scroll-element boundary.
- Locked numeric `estimatedBlockSize` for the first public shape.
- Added staged fallback when the virtualizer scroll owner cannot be proven.
- Added package fallback conditions without changing Slate's public API.

## Public API Target

Keep `renderingStrategy`. Do not rename the whole prop in this plan.

Revise only the experimental virtualized object shape:

```ts
type RenderingStrategyOptions =
  | "auto"
  | "full"
  | "staged"
  | "shell"
  | "virtualized"
  | {
      overscan?: number;
      previewChars?: number;
      segmentSize?: number;
      threshold?: number;
      type: "shell";
    }
  | {
      estimatedBlockSize?: number;
      overscan?: number;
      previewChars?: number;
      threshold?: number;
      type: "virtualized";
    };
```

Before:

- virtualized object uses the shell `segmentSize` shape.
  Source:
  `packages/slate-react/src/rendering-strategy/create-segment-plan.ts:10-18`
  and `content/docs/slate/libraries/slate-react/editable.md:238-247`.

After:

- shell keeps `segmentSize`;
- virtualized uses viewport measurement with `estimatedBlockSize`;
- `estimatedBlockSize` is a number in the first public shape, not a callback;
- no public `getScrollElement`, `measureElement`, `rangeExtractor`,
  `getItemKey`, or raw TanStack option passthrough in v1.

Reason:

- `estimatedBlockSize` is editor language. Internally it maps to TanStack's
  `estimateSize`.
- Runtime ids are the internal stable item keys. App authors should not provide
  virtualizer keys.
- Scroll ownership is runtime infrastructure. App authors should not need to
  know whether Slate uses a root element, a scroll parent, or window scrolling
  unless browser proof shows an override is unavoidable.

## Internal Runtime Target

TanStack owns:

- viewport item range;
- dynamic measurement;
- overscan;
- scroll-to-index alignment;
- optional retained index extraction.

Slate owns:

- top-level runtime-id inventory;
- active/caret/composition/selection retained indexes;
- coalesced missing-DOM ranges;
- `DOMCoverageBoundary` records;
- materialization;
- model-backed copy/paste;
- metrics;
- native behavior classification.

Required adapter shape:

```ts
type VirtualizedRootPlan = {
  activeTopLevelIndexes: readonly number[];
  mountedTopLevelRuntimeIds: ReadonlySet<RuntimeId>;
  mountedTopLevelRanges: readonly MountedTopLevelRange[];
  missingRanges: readonly MountedTopLevelRange[];
  scrollToTopLevelIndex(
    index: number,
    align?: "start" | "center" | "end" | "auto",
  ): void;
};
```

Internal rules:

- `getItemKey(index)` returns top-level runtime id.
- `measureElement` attaches only to mounted top-level wrappers with
  `data-index`.
- `rangeExtractor` must retain the selection anchor/focus indexes, composition
  target, materialization target, and active overscan corridor.
- Missing ranges become coalesced `viewport-virtualization` coverage
  boundaries.
- Current `RenderingStrategySegmentShell` can stay as a placeholder renderer
  for the first slice, but its policy must say `viewport-virtualization`, not
  generic shell.
- Do not blindly adopt absolute-positioned editable descendants until browser
  proof says native selection, IME, copy, paste, and a11y survive. First slice
  may use TanStack as range engine while keeping Slate's current shell/coverage
  rendering shape.

## Hook / Component / Render DX Target

- One internal hook owns virtualizer setup.
- Repeated blocks do not subscribe to scroll state.
- No per-block scroll listeners.
- No per-block effects except TanStack measurement ref on mounted wrappers.
- Keep rare UI state outside repeated block render.
- Keep DOM coverage registration coalesced by missing range, not per block.

## Plate Migration-Backbone Target

Plate can opt into virtualized mode for pathological documents, but Plate must
not need to wrap every Slate call.

Backbone requirements:

- Plate block UI can read metrics and degradation state.
- Plate comments/annotations stay model/runtime-id anchored.
- Plate copy/paste remains model-backed over unmounted ranges.
- Plate product chrome can choose a custom find/search UI later without forcing
  raw Slate to promise native find over missing DOM.

## slate-yjs Migration-Backbone Target

Virtualization must not change operation semantics.

Collab requirements:

- remote ops update model and runtime indexes without waking the full DOM;
- remote selection inside an unmounted range is represented model-backed or
  materialized by policy;
- operation snapshots and commit metadata remain deterministic;
- no mount state enters document history or collaborative operations.

## Legacy Regression Proof Matrix

| Proof                                          | Required behavior                                                                               |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Unit: virtualizer adapter uses runtime-id keys | reorder/split/merge does not recycle wrong DOM                                                  |
| Unit: range coalescing                         | missing adjacent indexes register one boundary                                                  |
| Unit: retained indexes                         | caret, selection anchor/focus, composition target stay mounted                                  |
| Unit: scrollToIndex materialization            | programmatic selection can scroll and mount target                                              |
| Browser: click/type in far virtualized block   | target mounts before caret entry                                                                |
| Browser: keyboard navigation across range edge | no raw DOM lookup throw                                                                         |
| Browser: IME at range edge                     | no text loss, no materialization during active composition                                      |
| Browser: select-all copy                       | model payload includes virtualized ranges by policy                                             |
| Browser: paste over broad model-backed range   | no stale DOM fallback                                                                           |
| Browser: find before mount                     | documented not-native-until-mounted                                                             |
| Browser: find after mount                      | native find sees mounted text                                                                   |
| Browser: mobile touch near edge                | no missing target crash                                                                         |
| Stress: 25k and 100k blocks                    | DOM, heap, INP, scroll jank, and typing metrics beat staged/shell where virtualized is intended |

## Browser Stress / Parity Strategy

Cohorts:

- normal: `<1000` top-level blocks, no virtualization;
- medium: `1000-4999`, staged only;
- large: `5000-9999`, staged default, shell explicit;
- stress: `10000-24999`, staged/shell benchmarked, virtualized opt-in;
- pathological: `25000+`, virtualized research/proof lane.

Metrics:

- DOM node count;
- editable descendant count;
- React component count if available;
- event listener count;
- heap at ready and after typing;
- p50/p95/p99 interaction latency for typing, selection, copy, paste, scroll,
  and far-target materialization;
- scroll frame drops;
- virtualizer measured item count;
- DOM coverage boundary count;
- mounted/unmounted top-level count.

## Applicable Implementation-Skill Review Matrix

| Lens                          | Applicability | Findings                                                                                                                                                                                              | Plan delta                                                             |
| ----------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `vercel-react-best-practices` | applied       | Use `client-event-listeners`, `rerender-defer-reads`, `rerender-derived-state`, `rerender-use-ref-transient-values`, `js-set-map-lookups`, and `rendering-content-visibility` only where DOM-present. | Add root-level virtualizer and no repeated scroll subscriptions.       |
| `performance-oracle`          | applied       | 25k/100k path needs bounded memory, indexed lookups, and no document scans during typing.                                                                                                             | Require runtime-id keys, coalesced ranges, and range-indexed coverage. |
| `performance`                 | applied       | GitHub pattern demands cohorting, repeated-unit budgets, INP percentiles, memory tags, and degradation contract.                                                                                      | Virtualized mode is stress/pathological only with dashboards.          |
| `tanstack-virtual`            | applied       | Use `count`, `getScrollElement`, `estimateSize`, `overscan`, `getItemKey`, `rangeExtractor`, `measureElement`, `scrollToIndex`.                                                                       | Use TanStack as range engine, not editor policy.                       |
| `tdd`                         | applied       | Behavior must be proven via public `Editable` and browser contracts.                                                                                                                                  | Add red package and browser rows before implementation.                |
| `react-useeffect`             | pending       | Effects and measurement refs need a separate pass.                                                                                                                                                    | Next pass must review effect ownership.                                |
| `build-web-apps:shadcn`       | skipped       | No UI chrome or component styling target.                                                                                                                                                             | none                                                                   |

## High-Risk Deliberate Pre-Mortem

1. TanStack absolute positioning breaks native selection or IME.
   Proof response: do not use absolute editable descendants until browser rows
   pass; first slice may use range-only adapter.
2. Virtualized mode looks fast but copy/select/find/a11y silently degrade.
   Proof response: classify degradation in metrics and docs; add browser rows.
3. Runtime ids reorder and TanStack reuses the wrong measured row.
   Proof response: use runtime-id `getItemKey`; add reorder/split/merge tests.

Blast radius:

- `packages/slate-react`;
- `packages/slate-dom` DOM coverage tests if policy changes;
- docs under `docs/libraries/slate-react/editable.md`;
- rendering strategy example/tests;
- benchmark scripts and browser stress tests.

Rollback answer:

- If TanStack layout fails browser proof, keep TanStack only as range oracle or
  drop virtualized mode back to research. Default staged mode stays intact.

## Slate Maintainer Objection Ledger

### Change: use TanStack Virtual inside Slate React virtualized mode

- Who feels pain: raw Slate user, browser-runtime maintainer, package
  maintainer.
- Likely objection: "Why bring a virtual-list dependency into an editor core
  package?"
- Steelman antithesis: Slate should keep its rendering runtime tiny and avoid
  list-library semantics that do not understand contenteditable.
- Tradeoff tension: dependency size and scroll measurement complexity increase.
- Why this is not change for change's sake: current virtualized mode is fixed
  segment shelling; TanStack gives measured viewport range, stable keys, overscan
  and scroll APIs proven on huge GitHub repeated surfaces.
- Evidence: current `createSegmentPlan` chunks by `segmentSize`; TanStack docs
  provide measurement/range primitives; GitHub reports virtualization gains for
  p95+ repeated surfaces.
- Rejected alternative: keep homegrown segments. Weaker because it is not tied
  to actual viewport or measured block height.
- Migration answer: virtualized mode is experimental; default users see no API
  change. Existing `renderingStrategy="staged"` and `"full"` stay.
- Docs/example answer: docs must call virtualized a degradation tier and show
  `estimatedBlockSize`, not TanStack internals.
- Regression proof: package virtualized tests, browser editing rows, stress
  benchmark, metrics callback.
- Plate/plugin answer: Plate can opt into metrics/degradation state without
  owning the range engine.
- slate-yjs/collab answer: operations remain model-first; mount state is local
  runtime state only.
- Verdict: keep.

### Change: keep virtualization out of default `auto`

- Who feels pain: users who want immediate huge-doc wins.
- Likely objection: "GitHub used it successfully; why not default it?"
- Steelman antithesis: defaulting to virtualization would reduce DOM/heap for
  huge documents immediately.
- Tradeoff tension: default mode keeps more DOM work than aggressive mode.
- Why this is not change for change's sake: browser find, a11y traversal,
  mobile handles, IME, native selection, and clipboard semantics are stricter in
  editable documents than in diff viewers.
- Evidence: current docs already warn native find/a11y do not cover unmounted
  virtualized regions.
- Rejected alternative: default virtualized at threshold. Weaker because it
  hides native behavior degradation behind `auto`.
- Migration answer: users opt in explicitly with `renderingStrategy={{ type:
'virtualized' }}`.
- Docs/example answer: show virtualized as pathological-document mode only.
- Regression proof: browser behavior matrix and RUM tags must distinguish
  staged/shell/virtualized.
- Plate/plugin answer: Plate may expose product opt-in with its own search/a11y
  affordances.
- slate-yjs/collab answer: collab state stays deterministic because mount state
  is local.
- Verdict: keep.

## Hard Cuts / Rejected Alternatives

- Cut current fixed-segment implementation as the final virtualized engine.
- Keep shell fixed-segment mode separate.
- Reject public TanStack prop passthrough.
- Reject native find promises over unmounted content.
- Reject default virtualization.
- Reject one-boundary-per-block registration.

## Implementation Phases

### Phase 0: Dependency And Current-State Probe

- Confirm exact installed package in `Plate repo root`.
- If absent, add `@tanstack/react-virtual` to `packages/slate-react`
  dependencies and root lockfile.
- Run a bundle/default-path smoke. If default path cost is unacceptable, switch
  internals to `@tanstack/virtual-core` before continuing.
- If the scroll owner cannot be resolved safely, fall back to staged mode and
  emit metrics instead of exposing a public `getScrollElement` escape hatch.

### Phase 1: Red Package Contracts

- Add failing tests for:
  - runtime-id `getItemKey`;
  - retained selection/caret indexes;
  - coalesced virtualized missing ranges;
  - materialize far target via `scrollToIndex`;
  - metrics including measured mounted count and virtualizer item count.

### Phase 2: TanStack Adapter

- Add internal `useVirtualizedRootPlan`.
- Use TanStack Virtual only when `renderingStrategy.type === 'virtualized'`.
- Use `enabled: false` outside virtualized mode.
- Use runtime ids for keys.
- Use `estimatedBlockSize` as TanStack `estimateSize`.
- Attach `measureElement` only to mounted top-level wrappers.
- Generate coalesced `viewport-virtualization` boundaries for missing ranges.

### Phase 3: Runtime Policy Split

- Stop passing virtualized mode to `EditableDOMRoot` as generic shell unless the
  runtime policy explicitly records the virtualized reason.
- Keep broad selections model-backed.
- Materialize caret and paste targets before editing.
- Keep composition transitions guarded.

### Phase 4: Browser Proof

- Add Playwright rows for:
  - scroll/click/type far block;
  - programmatic select far block;
  - select-all copy;
  - paste over virtualized range;
  - IME while near a range boundary;
  - browser find before and after materialization;
  - mobile viewport/touch smoke, clearly labeled not raw-device proof.

### Phase 5: Stress Benchmark

- Extend huge-document benchmark with `v2VirtualizedTanStack`.
- Cohorts: 10k, 25k, 100k.
- Record DOM, heap, mounted count, boundary count, virtualizer measured count,
  typing/select/copy/paste/scroll latency, p95/p99 where possible.

### Phase 6: Docs And Metrics

- Update `Editable` docs.
- Add explicit native behavior table.
- Include RUM tags:
  `requestedStrategy`, `effectiveStrategy`, `cohort`, `documentSize`,
  `virtualizerMeasuredCount`, `mountedTopLevelCount`, `domNodeCount`,
  `editableDescendantCount`, `boundaryCount`, browser, mobile, IME state, and
  release version.

## Fast Driver Gates

```txt
rg -n "@tanstack/react-virtual|@tanstack/virtual-core|useVirtualizer|useWindowVirtualizer" Plate repo root
bun test ./packages/slate-react/test/rendering-strategy-and-scroll.tsx
bun test ./packages/slate-dom/test/dom-coverage.ts ./packages/slate-dom/test/clipboard-boundary.ts
bun --filter slate-react typecheck
bun lint:fix
```

Stress gate:

```txt
REACT_HUGE_COMPARE_BLOCKS=25000 REACT_HUGE_COMPARE_ITERATIONS=3 bun run bench:react:huge-document:legacy-compare:local
```

Closure gate:

```txt
bun check
```

## Confidence Scorecard

| Dimension                                                | Score | Evidence                                                                                                                                                   |
| -------------------------------------------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |  0.84 | Current source has staged/shell/virtualized metrics and runtime boundaries; TanStack integration still needs effect/subscription proof.                    |
| Slate-close unopinionated DX                             |  0.90 | Plan keeps `renderingStrategy`, hides TanStack internals, rejects public scroll-owner props in v1, and keeps `estimatedBlockSize` numeric first.           |
| Plate and slate-yjs migration-backbone shape             |  0.87 | Plan keeps mount state local and model/operation semantics unchanged; needs stronger collab proof rows.                                                    |
| Regression-proof testing strategy                        |  0.87 | Matrix names unit/browser/stress rows and adds scroll-owner fallback proof; exact browser file additions still need closure pass.                          |
| Research evidence completeness                           |  0.86 | GitHub article, TanStack docs, live source, and compiled research page exist; Lexical/ProseMirror/Tiptap virtualization silence still needs explicit pass. |
| shadcn-style composability and hook/component minimalism |  0.89 | Internal adapter, no UI chrome, no TanStack prop passthrough, no public scroll hook, and no sizing callback in the first shape; effect review pending.     |

Weighted total: 0.87.

Status: not ready. Current-state and intent/decision passes are complete.

## Pass Schedule And State

| Pass                                      | Status                      | Evidence added                                                                                      | Plan delta                                                                                                                                                                    | Open issues                                                     | Next owner                     |
| ----------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------ |
| Current-state read and initial score      | complete                    | Live source, existing Phase 6 plan, TanStack docs, GitHub article summary.                          | Accepted TanStack as internal range engine only.                                                                                                                              | Dependency install status needs re-check before implementation. | Intent/decision pass           |
| Intent/boundary and decision brief        | complete                    | Scroll-owner boundary, public sizing boundary, dependency fallback boundary.                        | No public `getScrollElement` in v1; numeric `estimatedBlockSize`; staged fallback when scroll owner cannot be proven; `react-virtual` preferred with `virtual-core` fallback. | Research evidence still needs ecosystem refresh.                | Research and ecosystem refresh |
| Research and ecosystem refresh            | superseded                  | Implementation used TanStack as explicit viewport engine and kept Slate policy ownership.           | No default virtualization; no raw TanStack API passthrough.                                                                                                                   | Stress/browser parity remains release hardening.                | Future release pass            |
| Performance/DX/regression pressure passes | complete for implementation | Unit metrics, browser bounded-DOM example, package build, and `bun check` passed.                   | Added package dependency and full example.                                                                                                                                    | 25k/100k stress not run.                                        | Future release pass            |
| Maintainer objection ledger               | complete for implementation | Dependency is scoped to `slate-react`; default mode unchanged; docs call out degradation.           | Keep.                                                                                                                                                                         | none for this slice.                                            | Future release pass            |
| High-risk deliberate pass                 | complete for implementation | Browser caught stale virtual item memoization; fixed by recomputing virtualizer items every render. | Do not memoize `virtualizer.getVirtualItems()` snapshots.                                                                                                                     | broader IME/mobile matrix remains.                              | Future release pass            |
| Revision pass                             | complete                    | Plan updated with implementation proof.                                                             | status done.                                                                                                                                                                  | none for this slice.                                            | Future release pass            |
| Closure score                             | complete for implementation | `bun check` plus focused browser proof passed.                                                      | status done.                                                                                                                                                                  | release-hardening stress gates remain optional next work.       | none                           |

## Plan Deltas From Review

- Added a new TanStack-specific virtualization plan instead of editing the
  completed Phase 6 DOM-present plan.
- Changed Phase 6d from deferred research to an active planning lane.
- Accepted TanStack Virtual as the internal viewport engine candidate.
- Kept default `auto` DOM-present/staged.
- Split virtualized public options from shell `segmentSize`.
- Added explicit native behavior degradation gates.
- Rejected public `getScrollElement` and raw TanStack option passthrough in v1.
- Locked numeric `estimatedBlockSize` before considering callback sizing.
- Added staged fallback when Slate cannot prove the scroll owner safely.

## Open Questions / What Would Change The Decision

- If `@tanstack/react-virtual` is not actually installed in `Plate repo root`, add it
  deliberately during implementation or use `@tanstack/virtual-core` after
  bundle proof.
- If absolute-positioned editable rows fail selection/IME/browser proof, use
  TanStack as range oracle only or keep virtualized mode research-only.
- If bundle/default-path overhead is unacceptable, switch to `virtual-core`
  internally.
- If native find over unmounted content becomes a requirement, virtualization
  cannot be the answer without custom find or full materialization.

## Final Completion Gates

- Implementation slice: done.
- TanStack package choice: `@tanstack/react-virtual` in `slate-react`.
- Public option shape: final for this experimental implementation.
- Unit/browser/package proof: green.
- Stress proof: still a release-hardening gate, not part of this requested
  implementation closeout.
