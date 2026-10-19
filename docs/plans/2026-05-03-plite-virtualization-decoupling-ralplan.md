---
status: done
owner: plite-virtualization-decoupling-ralplan
source_repo: Plate repo root
created: 2026-05-03
score: 0.94
next_owner: ralph-execution
---

# Plite Virtualization Decoupling Ralplan

## Current Verdict

Keep TanStack Virtual. Refactor the integration until virtualization is a small
private strategy adapter, not a cross-cutting branch inside the normal
`EditableTextBlocks` body.

The current implementation is a real functional win: TanStack is installed,
`useVirtualizedRootPlan` exists, DOM coverage boundaries exist, package tests
exist, and the full browser example exists. The remaining problem is
architecture hygiene. Right now virtualization still leaks into public option
types, shell segment placeholders, root-source planning, keyboard naming,
materialization ownership, metrics, and the giant render branch.

Blunt take: if the next patch only moves files around, it is fake decoupling.
The real refactor is to make shell, staged, and virtualized rendering share only
root sources, DOM coverage policy, materialization plumbing, and metrics
contracts. TanStack belongs behind one virtualized adapter.

Closure verdict:

- Plan is ready for user review and later Ralph execution.
- No user decision is needed before implementation.
- The first implementation move is Phase 0 red decoupling guards, not file
  movement.

## Intent / Boundary Record

Intent:

- Make the TanStack virtualization integration clean enough to maintain.
- Keep the working full example and regression proof.
- Make virtualized mode look and behave like an independent rendering strategy,
  not like shell mode with viewport-flavored labels.

Desired outcome:

- `EditableTextBlocks` resolves the requested strategy and delegates the
  virtualized branch to a focused virtualized root module.
- TanStack-specific imports are confined to the virtualized strategy module.
- Shell segment code cannot register `viewport-virtualization` boundaries.
- Virtualized public options do not include shell-only props.
- Materialization has one active owner per editor surface.
- Metrics are built from a strategy-neutral plan state.

In scope:

- `packages/plite-react/src/rendering-strategy/**`
- `packages/plite-react/src/components/editable-text-blocks.tsx`
- `packages/plite-react/src/components/editable.tsx`
- `packages/plite-react/src/editable/*rendering*`, keyboard, and runtime
  strategy policy where virtualized is currently classified as shell.
- Existing rendering strategy tests and browser example.

Non-goals:

- No default virtualization.
- No public TanStack option passthrough.
- No new Plate product API.
- No `slots.Boundary` work.
- No rewrite of DOM coverage internals unless the materializer ownership split
  proves the current hook cannot be made single-owner.
- No large-doc Phase 6 convergence in this refactor.

Decision boundaries:

- The plan may remove `previewChars` from the experimental virtualized option
  shape.
- The plan may rename internal helpers that currently say `shell` but mean
  "DOM-incomplete strategy".
- The plan may add private strategy folders and move existing files.
- The plan may keep the public `renderingStrategy` prop name.

Unresolved user-decision points:

- none. The best shape can be chosen from live source and existing plan law.

## Live Source Grounding

Current facts from `Plate repo root`:

- `@tanstack/react-virtual` is already a `plite-react` dependency.
  Source: `packages/plite-react/package.json:18-23`.
- `RenderingStrategyOptions` is owned by `create-segment-plan.ts`, and the
  virtualized object still exposes `previewChars`.
  Source:
  `packages/plite-react/src/rendering-strategy/create-segment-plan.ts:3-25`.
- The TanStack hook is real and uses `useVirtualizer`, runtime-id item keys,
  retained selected/promoted indexes, coalesced missing ranges, `scrollToIndex`,
  and `measureElement`.
  Source:
  `packages/plite-react/src/rendering-strategy/use-virtualized-root-plan.ts:1-6`,
  `:89-179`, and `:181-293`.
- `EditableTextBlocksInner` imports virtualized types/hooks/components directly,
  stores virtualized state, calls the TanStack plan hook, owns virtualized
  materialization, computes virtualized metrics, and renders virtualized rows
  inline.
  Source:
  `packages/plite-react/src/components/editable-text-blocks.tsx:47-54`,
  `:1260-1377`, `:1436-1478`, `:1580-1664`, and `:1714-1761`.
- The same component still contains a virtualized-flavored shell fallback:
  `RenderingStrategySegmentShell` receives `coverageReason:
'viewport-virtualization'`.
  Source:
  `packages/plite-react/src/components/editable-text-blocks.tsx:1762-1794`.
- `RenderingStrategySegmentShell` itself accepts
  `'shell-aggressive' | 'viewport-virtualization'`, derives selection policy
  from that reason, and records `state: 'virtualized'`.
  Source:
  `packages/plite-react/src/rendering-strategy/segment-shell.tsx:58-111`.
- `root-selector-sources.ts` is generic by name but imports
  `createSegmentPlan`, owns shell config with `previewChars`, and returns
  `segmentPlan`.
  Source:
  `packages/plite-react/src/editable/root-selector-sources.ts:7-14`
  and `:208-272`.
- Keyboard strategy classifies virtualized as shell-backed through
  `isShellRenderingStrategy`.
  Source:
  `packages/plite-react/src/editable/keyboard-input-strategy.ts:55-60`,
  `:152-164`, and `:209-220`.
- Tests prove the current behavior: virtualized mode registers viewport DOM
  coverage, keeps broad selections model-backed, reports metrics, and has a
  full browser example with bounded DOM.
  Source:
  `packages/plite-react/test/rendering-strategy-and-scroll.tsx:171-364`
  and
  `apps/www/tests/plite-browser/donor/examples/rendering-strategy-runtime.test.ts:329-365`.
- The full example is present.
  Source:
  `apps/www/src/app/(app)/examples/plite/_examples/rendering-strategy-runtime.tsx:32-37`
  and `:380-417`.

Research evidence:

- The refreshed research page now records the current live shape and the
  decoupling gap.
  Source:
  `docs/research/sources/editor-architecture/tanstack-virtual-and-github-large-surface-virtualization.md`.
- GitHub's diff article supports using TanStack Virtual for the p95+ tail after
  cheap repeated-unit work, not as proof for default editable DOM removal.

## Decision Brief

Principles:

1. TanStack is a private viewport range engine.
2. Plite owns DOM coverage, selection, clipboard, IME, a11y, and metrics.
3. Shell and virtualized modes are separate policies over the same
   DOM-incomplete substrate.
4. The hot default path must not import, subscribe to, or render through
   virtualized machinery.
5. Experimental public API can be tightened when it removes shell leakage.

Top drivers:

- Maintainability of `EditableTextBlocks`.
- Browser correctness under missing DOM.
- Performance isolation for the normal path.
- Clear public DX for shell vs viewport virtualization.

Viable options:

| Option                                             | Verdict | Reason                                                                    |
| -------------------------------------------------- | ------- | ------------------------------------------------------------------------- |
| Cosmetic file split only                           | reject  | Leaves materialization, metrics, shell fallback, and naming coupled.      |
| Extract virtualized strategy adapter and renderer  | choose  | Smallest refactor that makes TanStack private and keeps current behavior. |
| Rewrite all rendering strategies into a new engine | reject  | Too much blast radius for a decoupling pass.                              |
| Move virtualization into `plite-dom`               | reject  | `plite-dom` should own DOM coverage, not React/TanStack hooks.            |
| Expose a public virtualizer plugin                 | reject  | Leaks implementation and makes app authors own editor correctness.        |

Chosen option:

- Add a private virtualized strategy module that owns TanStack setup, mounted
  virtual rows, missing viewport boundaries, materialization, and virtualized
  metrics contribution.
- Leave shared Plite policy in strategy-neutral helpers.
- Remove virtualized policy from shell segment files.

Consequences:

- More files, less cross-branch logic.
- A small internal strategy interface must be named and tested.
- Some tests become decoupling guards, not only behavior proof.

## Full Ralph Closure Pass

Status: complete.

Intent/boundary result:

- Intent is not "make virtualization work"; it already works.
- Intent is "make virtualization cleanly decoupled enough to execute without
  turning shell/staged rendering into a junk drawer."
- Scope is narrow to `plite-react` rendering strategy ownership.
- Non-goals are explicit: no default virtualization, no public TanStack API, no
  Plate product API, no `slots.Boundary`, no Phase 6 large-doc convergence.

Steelman result:

- The strongest objection is valid: splitting working code into more files can
  be overengineering.
- The objection does not win because the current coupling is semantic, not only
  visual. Shell code can register viewport boundaries, keyboard code calls
  virtualized shell-backed, root source hooks build segment plans, and
  `EditableTextBlocksInner` owns every branch.
- The chosen plan wins because it removes policy coupling while preserving the
  existing public mode and proof.

High-risk result:

- Risk is real because this touches browser-runtime selection,
  materialization, and DOM presence.
- Risk is bounded because the first implementation phase is red guard tests and
  the fallback is the current working TanStack implementation.
- No code should move before shell/virtualized separation tests fail correctly.

Performance/DX result:

- Default and staged paths must not pay TanStack or scroll-state costs.
- Public DX stays Plite-shaped: `renderingStrategy`, `estimatedBlockSize`,
  `overscan`, `threshold`.
- `previewChars` is cut from virtualized mode because it is a shell-preview
  concept. Keeping it would be a polite lie.

Regression result:

- Existing unit/browser proofs are enough to preserve current behavior.
- New decoupling guards are required before refactor:
  shell cannot register `viewport-virtualization`, virtualized has no shell DOM,
  default/staged/shell do not mount virtualizer DOM, and virtualized options
  reject `previewChars`.

Plan changes from closure:

- Raised status to `done`.
- Raised score to `0.94`.
- Locked Phase 0 as mandatory red guards before implementation.
- Marked all review passes complete.
- Set next owner to `ralph-execution`.

## Architecture North Star

Target ownership:

```txt
EditableTextBlocks
  resolves public renderingStrategy
  reads shared root sources
  owns placeholder/render props
  delegates to one active strategy surface

rendering-strategy/options.ts
  public strategy option types and normalization

rendering-strategy/root-sources.ts
  root runtime ids, document epoch, selection top-level index
  no shell segment planning

rendering-strategy/staged/*
  DOM-present root group planning and placeholders

rendering-strategy/shell/*
  fixed segment plan and shell preview placeholders only

rendering-strategy/virtualized/*
  TanStack hook
  virtualized root surface
  virtualized missing-range boundaries
  virtualized materialization

rendering-strategy/materialization.ts
  one materialize-handler owner that delegates to the active strategy

rendering-strategy/metrics.ts
  strategy-neutral metrics assembly
```

Shared contract:

```ts
type EditableRenderingPlan =
  | { type: 'plain'; mountedTopLevelRuntimeIds: null }
  | { type: 'staged'; materializeBoundary(...): boolean; ... }
  | { type: 'shell'; materializeBoundary(...): boolean; ... }
  | { type: 'virtualized'; materializeBoundary(...): boolean; ... }
```

Do not over-abstract this into a public plugin system. Keep it private until
there are at least two external rendering strategies that need the same
extension point.

## Public API Target

Keep:

```ts
<Editable renderingStrategy={{ type: "virtualized", estimatedBlockSize: 32 }} />
```

Revise the option ownership:

```ts
type RenderingStrategyOptions =
  | RenderingStrategyType
  | ShellRenderingStrategyOptions
  | VirtualizedRenderingStrategyOptions;

type ShellRenderingStrategyOptions = {
  type: "shell";
  overscan?: number;
  previewChars?: number;
  segmentSize?: number;
  threshold?: number;
};

type VirtualizedRenderingStrategyOptions = {
  type: "virtualized";
  estimatedBlockSize?: number;
  overscan?: number;
  threshold?: number;
};
```

Hard cut:

- `previewChars` is shell-only. Cut it from virtualized options.
- No public `getScrollElement`.
- No public `measureElement`.
- No public `rangeExtractor`.
- No public `getItemKey`.
- No raw TanStack option bag.

Reason:

- `previewChars` describes shell previews. Virtualized mode renders actual
  mounted rows and hidden DOM coverage boundaries, not preview snippets.
- Plite can keep public DX editor-shaped while using TanStack internally.

## Internal Runtime Target

Virtualized module responsibilities:

- normalize virtualized config;
- validate scroll root;
- call `useVirtualizer`;
- use runtime ids as `getItemKey`;
- retain selected and promoted top-level indexes;
- coalesce missing ranges;
- render mounted virtual rows;
- register hidden viewport boundaries;
- expose one materialization callback.

Non-responsibilities:

- shell preview text;
- staged root group scheduling;
- generic `EditableDOMRoot` event handling;
- public API option parsing for other strategies.

Single-owner materialization rule:

- `EditableTextBlocks` installs at most one `DOMCoverage.setMaterializeHandler`
  per editor surface.
- Active strategy provides `materializeBoundary` or `null`.
- Staged and virtualized effects must not independently overwrite each other.

Terminology rule:

- Rename internal predicates that mean "DOM may be incomplete" away from
  `shell`.
- Current `isShellRenderingStrategy` includes `virtualized`; target name should
  be closer to `isDOMIncompleteRenderingStrategy` or
  `usesModelBackedSelectionStrategy`.

## Hook / Component / Render DX Target

Current good seed:

- `EditableTextBlocks` already uses separate wrappers so the TanStack hook is
  only called in the virtualized wrapper.
  Source:
  `packages/plite-react/src/components/editable-text-blocks.tsx:1845-1860`.

Target:

- Expand that wrapper into `EditableTextBlocksVirtualized`, a real component
  that owns:
  - virtualized scroll root state;
  - `useVirtualizedRootPlan`;
  - virtualized materialization;
  - virtualized row rendering;
  - virtualized metrics contribution.
- Keep `EditableTextBlocksInner` free of:
  - `@tanstack/react-virtual`;
  - `useVirtualizedRootPlan`;
  - `RenderingStrategyVirtualizedRangeBoundary`;
  - virtualized row CSS;
  - virtualized-specific materialization state.

Do not duplicate the repeated descendant render prop soup by hand in three
places. Introduce a private render helper or prop bag for
`EditableDescendantNode` only if it reduces the giant branch.

## Plate Migration-Backbone Target

This refactor improves Plate's migration story because Plate can see
virtualized mode as one explicit strategy with metrics and degradation state.

Requirements:

- Plate block UI reads `requestedStrategy`, `effectiveStrategy`, cohort, mounted
  count, boundary count, and native completeness from metrics.
- Plate comments/annotations remain runtime-id/model anchored.
- Plate does not import TanStack or shell segment internals.

No current-version Plate adapter is required.

## slate-yjs Migration-Backbone Target

No operation semantics change.

Requirements:

- mount state remains local runtime state;
- runtime ids remain item keys but do not enter collaborative operations;
- model-backed selection/copy over unmounted ranges stays deterministic;
- remote changes inside unmounted ranges update model and indexes without
  waking the whole document.

No current-version slate-yjs fixture is required for this refactor.

## Legacy Regression Proof Matrix

| Proof                        | Required result                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| Type: virtualized options    | `previewChars` rejected for `type: 'virtualized'`.                                    |
| Unit: shell boundary         | `RenderingStrategySegmentShell` cannot register `viewport-virtualization`.            |
| Unit: virtualized boundary   | viewport missing ranges still register `viewport-virtualization`.                     |
| Unit: strategy normalization | shell, staged, and virtualized configs normalize independently.                       |
| Unit: materialization owner  | only one active `DOMCoverage` materializer is installed.                              |
| Unit: broad selection        | virtualized select-all still becomes model-backed where ranges are unmounted.         |
| Unit: metrics                | virtualized metrics survive after moving metrics builder out of `EditableTextBlocks`. |
| Browser: full example        | full virtualized example still renders bounded DOM and scrolls to block 1000.         |
| Browser: no shell leak       | virtualized full example has no `[data-plite-rendering-strategy-shell]`.              |
| Browser: typing              | mounted virtualized row typing still goes through the normal editor path.             |
| Stress: normal path          | non-virtualized modes do not mount virtualizer DOM or viewport boundaries.            |

Keep existing proofs green:

- `packages/plite-react/test/rendering-strategy-and-scroll.tsx:171-364`
- `playwright/integration/examples/rendering-strategy-runtime.test.ts:329-365`

## Browser Stress / Parity Strategy

Run targeted first, broad later:

- targeted package rendering strategy tests;
- browser full example grep for TanStack-backed virtualized;
- browser smoke for default/staged/shell paths to prove the refactor did not
  route them through virtualized machinery;
- later release-hardening rows for IME, mobile, browser find, select/copy/paste,
  25k and 100k cohorts.

This refactor is allowed to finish without 25k/100k release-hardening only if
it does not claim virtualization is release-grade default behavior.

## Applicable Implementation-Skill Review Matrix

| Lens                          | Applicability | Findings                                                                                                                                                                                                      | Plan delta                                                                                                                  |
| ----------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `vercel-react-best-practices` | applied       | Relevant rules: `bundle-conditional`, `client-event-listeners`, `rerender-defer-reads`, `rerender-derived-state`, `rerender-use-ref-transient-values`, `rerender-split-combined-hooks`, `js-set-map-lookups`. | Keep TanStack and scroll state out of non-virtualized surfaces; isolate transient scroll/measurement in virtualized module. |
| `performance-oracle`          | applied       | Current hook uses maps and coalescing, but `EditableTextBlocks` still computes all strategy metrics inline.                                                                                                   | Move metrics to strategy-neutral builder and keep lookup O(1)/range-coalesced.                                              |
| `performance`                 | applied       | GitHub lesson: cheap repeated units first, virtualization for p95+ tail.                                                                                                                                      | Decoupling must not add default-path component, handler, effect, or subscription cost.                                      |
| `tanstack-virtual`            | applied       | Use `count`, `getScrollElement`, `estimateSize`, `overscan`, `getItemKey`, `rangeExtractor`, `measureElement`, `scrollToIndex`; keep these private.                                                           | Virtualized adapter owns these.                                                                                             |
| `react-useeffect`             | applied       | Effects are valid only for DOMCoverage external sync, ResizeObserver, and virtualizer measurement.                                                                                                            | Replace competing materialization effects with one active strategy handler.                                                 |
| `tdd`                         | applied       | Refactor should be protected through public `Editable` behavior and browser example, not private implementation snapshots.                                                                                    | Add behavior tests for shell/virtualized separation before moving code.                                                     |
| `build-web-apps:shadcn`       | skipped       | No UI styling or shadcn component surface.                                                                                                                                                                    | none.                                                                                                                       |

## Performance Pass

- repeated unit: top-level editable block / mounted virtual row.
- current risk: virtualized mode reduces DOM, but `EditableTextBlocksInner`
  carries virtualized state and branch cost across strategy orchestration.
- target budget:
  - default/staged/shell paths import no TanStack hook;
  - no per-block scroll listeners;
  - no per-block effects except TanStack measurement ref in virtualized rows;
  - missing DOM boundaries are coalesced by range, not per block;
  - normal path has zero viewport virtualization boundaries.
- cohorts:
  - normal `<1000`;
  - medium `1000-4999`;
  - large `5000-9999`;
  - stress `10000-24999`;
  - pathological `25000+`.
- degradation contract:
  - virtualized mode remains explicit;
  - native browser find and screen-reader traversal do not cover unmounted rows
    until mounted;
  - copy/select/paste must use Plite policy, not stale DOM.
- dashboard/RUM gap:
  - keep tags for requested/effective strategy, cohort, document size,
    mounted top-level count, pending count, virtualizer measured count, DOM node
    count, boundary count, browser, mobile, and IME state.

## High-Risk Deliberate Pre-Mortem

Trigger:

- browser-runtime refactor across rendering strategy, selection policy,
  materialization, and virtualized DOM presence.

Blast radius:

- `plite-react` public types;
- editable rendering surface;
- DOM coverage materialization;
- shell/staged/virtualized metrics;
- full runtime example and browser tests.

Failure scenarios:

1. Virtualized behavior still works but shell now accidentally registers
   viewport boundaries.
   Proof: unit guard that shell boundary reasons are shell-only.
2. Materialization handler gets cleared by a sibling strategy effect.
   Proof: single-owner materializer test and browser far-target materialization.
3. The refactor makes default/staged render load virtualizer state.
   Proof: no virtualizer DOM/boundaries in default/staged/shell tests and no
   TanStack import outside the virtualized module.

Rollback answer:

- Revert to current functional TanStack implementation if decoupling breaks
  browser behavior. Do not preserve a cleaner file layout that weakens editor
  correctness.

## Plite Maintainer Objection Ledger

### Change: split virtualized strategy into its own module

- Who feels pain: slate-react maintainer.
- Likely objection: "The implementation works. Why add more files?"
- Steelman antithesis: fewer files can be easier to debug while the feature is
  experimental.
- Tradeoff tension: internal file count rises.
- Why this is not change for change's sake: current `EditableTextBlocksInner`
  owns virtualized config, hook, materialization, metrics, and render branch.
  That makes every future shell/staged change re-evaluate virtualized behavior.
- Evidence: `editable-text-blocks.tsx:1260-1761`.
- Rejected alternative: cosmetic barrel split. Weaker because coupling remains.
- Migration answer: private refactor, no app migration except the
  `previewChars` type cut for experimental virtualized options.
- Docs/example answer: full example stays the public proof.
- Regression proof: rendering strategy tests and browser full example.
- Verdict: keep.

### Change: remove `viewport-virtualization` from shell segment placeholders

- Who feels pain: runtime maintainer.
- Likely objection: "Reusing shell placeholder code was convenient."
- Steelman antithesis: one placeholder component reduces code.
- Tradeoff tension: virtualized needs its own hidden boundary component.
- Why this is not change for change's sake: shell preview and virtualized
  missing range are different policies. Shell renders a preview; virtualized
  registers hidden viewport gaps and renders measured rows.
- Evidence: `segment-shell.tsx:58-111` and
  `editable-text-blocks.tsx:1762-1794`.
- Rejected alternative: keep `coverageReason` prop. Weaker because it makes
  shell own virtualized policy.
- Migration answer: private implementation only.
- Docs/example answer: no public doc change beyond clearer native behavior
  wording.
- Regression proof: shell boundary unit test and virtualized browser no-shell
  assertion.
- Verdict: keep.

### Change: cut `previewChars` from virtualized options

- Who feels pain: early virtualized experiment user.
- Likely objection: "It was accepted by the type before."
- Steelman antithesis: keeping it avoids even experimental breakage.
- Tradeoff tension: small experimental API break.
- Why this is not change for change's sake: virtualized mode does not expose
  shell previews, so accepting `previewChars` lies about behavior.
- Evidence: virtualized object type has `previewChars` in
  `create-segment-plan.ts:19-25`, but the virtualized branch renders measured
  rows and hidden boundaries in `editable-text-blocks.tsx:1714-1761`.
- Rejected alternative: silently ignore it. Weaker DX for agents and humans.
- Migration answer: remove the prop; use shell mode if previews are desired.
- Docs/example answer: virtualized example shows only
  `estimatedBlockSize`, `overscan`, and `threshold`.
- Regression proof: type test / ts-expect-error row.
- Verdict: keep.

## Hard Cuts / Rejected Alternatives

- No public TanStack option passthrough.
- No public virtualizer ref.
- No virtualized `previewChars`.
- No `viewport-virtualization` reason inside `RenderingStrategySegmentShell`.
- No `isShellRenderingStrategy` predicate that returns true for virtualized
  without a better name.
- No parallel materialization effects that overwrite each other.
- No broad rewrite of staged rendering in this pass.
- No default virtualization.

## Implementation Phases

### Phase 0: Red Decoupling Guards

- Add or adjust tests that fail on current coupling:
  - virtualized options reject `previewChars`;
  - shell segment cannot register `viewport-virtualization`;
  - virtualized mode has no shell placeholder DOM;
  - default/staged/shell modes have no virtualizer DOM or viewport boundaries.

### Phase 1: Public Type Ownership Split

- Move `RenderingStrategyType`, `RenderingStrategyOptions`,
  `ShellRenderingStrategyOptions`, and `VirtualizedRenderingStrategyOptions` out
  of `create-segment-plan.ts`.
- Keep `createSegmentPlan` shell-only.
- Cut `previewChars` from virtualized options.

### Phase 2: Root Source Split

- Make root runtime id, document epoch, placeholder, and selection-index hooks
  strategy-neutral.
- Move shell segment planning out of `root-selector-sources.ts`.
- Keep `RenderingStrategyRootConfig` shell-specific or rename it to
  `ShellRenderingStrategyConfig`.

### Phase 3: Virtualized Module Extraction

- Create private virtualized module ownership:
  - `normalize-virtualized-config.ts`;
  - `use-virtualized-root-plan.ts`;
  - `virtualized-range-boundary.tsx`;
  - `editable-virtualized-root.tsx`.
- Move TanStack imports into that module only.
- Move virtualized row rendering out of `EditableTextBlocksInner`.

### Phase 4: Materialization And Metrics Split

- Add one active strategy materialization owner.
- Strategy surfaces return or register a `materializeBoundary` delegate.
- Move metrics assembly into a helper that accepts a strategy plan summary.
- Keep DOM metrics in `EditableDOMRoot` because it owns the actual root element.

### Phase 5: Terminology Cleanup

- Rename shell-backed predicates that also apply to virtualized selection.
- Use "DOM-incomplete" or "model-backed selection" terminology internally.
- Keep public metrics values `shell` and `virtualized` unchanged.

### Phase 6: Example And Browser Proof

- Keep the full virtualized example route stable:
  `rendering-strategy-runtime?runtime_mode=virtualized-full&blocks=1000`.
- Run the existing browser proof.
- Add a default/staged/shell smoke after refactor to prove decoupling did not
  route everything through virtualized machinery.

### Phase 7: Verification

- `bun test ./packages/plite-react/test/rendering-strategy-and-scroll.tsx`
- `bunx turbo typecheck --filter=./packages/plite-react`
- `bun typecheck:site`
- `bun lint:fix`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "TanStack-backed virtualized"`
- targeted default/staged/shell browser smoke if added
- `bun check`

## Fast Driver Gates

```txt
rg -n "@tanstack/react-virtual|useVirtualizer|Virtualized" packages/plite-react/src
```

Expected after refactor:

- TanStack hits only under `rendering-strategy/virtualized/**`.
- `EditableTextBlocksInner` has no `useVirtualizedRootPlan` import.
- `segment-shell.tsx` has no `viewport-virtualization`.
- virtualized options have no `previewChars`.

## Confidence Scorecard

Total score: `0.94`.

| Dimension                                 | Score | Evidence                                                                                                                                                                     |
| ----------------------------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance            |  0.94 | TanStack is kept in the virtualized adapter; default/staged/shell paths get explicit no-virtualizer guards; transient scroll/measurement state stays out of repeated blocks. |
| Plite-close unopinionated DX              |  0.95 | Public prop stays `renderingStrategy`; public options stay editor-shaped; raw TanStack options are rejected; `previewChars` becomes shell-only.                              |
| Plate and slate-yjs migration backbone    |  0.91 | Mount state remains local, runtime ids stay internal keys, operations/collab semantics do not change, and Plate reads metrics instead of importing strategy internals.       |
| Regression-proof testing strategy         |  0.94 | Existing behavior proof stays; Phase 0 adds red decoupling guards before any file movement.                                                                                  |
| Research evidence completeness            |  0.93 | Live source, refreshed TanStack/GitHub research, package tests, and browser example all agree on current state and target gap.                                               |
| shadcn-style composability and minimalism |  0.94 | No UI chrome surface; private component split is minimal and avoids public plugin over-abstraction.                                                                          |

Ready for `done`: all review passes are complete, no dimension is below `0.85`,
and the remaining work is implementation, not planning.

## Pass Schedule And State Ledger

| Pass                                 | Status   | Evidence added                                                                                | Plan delta                                                                          | Next owner      |
| ------------------------------------ | -------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------- |
| Current-state read and initial score | complete | Live source refs for options, hook, component, shell, root sources, keyboard, tests, example. | New decoupling plan created.                                                        | done            |
| Intent/boundary and decision brief   | complete | Full Ralph Closure Pass.                                                                      | No user decision needed; implementation may proceed later.                          | done            |
| Performance/DX/regression pressure   | complete | Performance Pass and Full Ralph Closure Pass.                                                 | Phase 0 red guards locked before refactor.                                          | done            |
| Plite maintainer objection ledger    | complete | Three accepted objection rows.                                                                | Keep extraction, cut virtualized `previewChars`, remove viewport reason from shell. | done            |
| High-risk deliberate closure         | complete | Pre-mortem plus rollback answer.                                                              | Current working TanStack implementation is the rollback baseline.                   | done            |
| Closure score                        | complete | Scorecard raised to `0.94`.                                                                   | Completion state may be `done`.                                                     | ralph-execution |

## Plan Deltas From This Review

- Added a dedicated decoupling plan rather than mutating the completed TanStack
  implementation plan.
- Refreshed the research note that still said TanStack was absent.
- Accepted TanStack as implementation, not the problem.
- Identified current coupling owners: public option union, shell segment,
  root-source hook, keyboard shell predicate, materialization effects, metrics,
  and inline virtualized render branch.
- Added hard cut: no `previewChars` in virtualized options.
- Added hard cut: shell segment cannot own `viewport-virtualization`.
- Added hard cut: one active materialization owner.

## Open Questions / What Would Change The Decision

No open user questions remain.

- If moving TanStack imports behind the virtualized module increases bundle
  complexity without reducing default-path work, keep fewer files but still
  enforce shell/virtualized policy separation.
- If `previewChars` is used by a documented example or package test not found
  in this pass, move the cut behind a deprecation note only if the API is no
  longer experimental.
- If single-owner materialization requires `plite-dom` API changes, split that
  into a smaller DOM coverage patch instead of hiding the collision.

## Final User-Review Handoff Outline

When this ralplan reaches `done`, report:

- keep TanStack;
- extract virtualized module;
- split public options from segment plan;
- cut virtualized `previewChars`;
- remove viewport virtualization from shell segment;
- install one materialization owner;
- move metrics to strategy-neutral helper;
- rename shell-backed predicates that include virtualized;
- keep full example and tests green;
- keep virtualization explicit and non-default.

## Completion Gates

Completion is `done` for planning. Execution has not started.

Passed gates:

- pass-state ledger has closure rows complete;
- no objection ledger row is unresolved;
- score is `>=0.92` and no dimension is below `0.85`;
- source-backed current/before shape remains accurate;
- red decoupling guard tests are accepted as implementation gates;
- `active goal state` no longer has a runnable slate-ralplan pass.

Next implementation owner:

- `ralph-execution`, starting at Phase 0 red decoupling guards.
