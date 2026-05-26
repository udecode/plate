---
status: done
owner: slate-v2-dom-present-large-doc-phase-6
source_repo: .tmp/slate-v2
created: 2026-05-03
---

# Slate v2 DOM-Present Large-Doc Phase 6 Plan

## Intent

Move large-document DOM-present staging toward the same `DOMCoverageBoundary`
substrate proven by hidden/collapsed content, without making virtualization,
shell mode, or stable public boundary slots the default story.

The first executable slice is Phase 6a only: read-only coverage registration and
trace visibility for large-doc mounted/pending/shell regions. No staged mounting
migration, no behavior change, no virtualization.

## Outcome

- DOM-present large-doc groups can be described as coverage regions with
  explicit `mounted`, `pending-mount`, and shell/aggressive reasons.
- Startup and typing benchmarks prove that consulting/registering coverage adds
  no meaningful default-mode regression.
- `interactiveReady` and `nativeSurfaceComplete` stay separate.
- Full-doc replace gets a stale-DOM proof before any shared bridge migration.

## Non-Goals

- Do not stabilize `slots.Boundary`.
- Do not rename or expand public large-document options.
- Do not implement viewport virtualization.
- Do not route selection/copy/paste through coverage for large-doc pending
  regions until Phase 6b.
- Do not claim native browser find over absent DOM.
- Do not claim raw mobile device proof from Playwright mobile-project rows.

## Source Grounding

Current source facts from the live sibling checkout:

- `LargeDocumentMode` is `auto | dom-present | off | shell`.
  Source: `.tmp/slate-v2/packages/slate-react/src/large-document/create-island-plan.ts`.
- Shell islands are planned separately from DOM-present root groups.
  `createIslandPlan` marks active islands and leaves far islands with no mounted
  runtime ids.
- DOM-present grouping currently lives inside
  `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`.
  Root groups use `ROOT_GROUP_SIZE = 50`, `ROOT_GROUP_THRESHOLD = 1000`,
  background initial delay `250ms`, interval `16ms`, and batch size `8`.
- DOM-present pending root groups render coalesced hidden placeholders:
  `EditableRootGroupPlaceholder` outputs `data-slate-root-group-state="pending-mount"`
  and `display: none`.
- `EditableDOMRoot` already receives `largeDocument` mounted top-level runtime
  ids/ranges for shell and DOM-present modes.
- `DOMCoverageBoundary` already supports reasons including
  `large-document-staged`, `viewport-virtualization`, and `shell-aggressive`.
  The registry is root-key indexed and exposes boundary-aware point/range APIs.
- The benchmark already records `interactiveReadyAt`,
  `nativeSurfaceCompleteAt`, mounted/pending group counts, stale group count,
  and surface-weight counters.
- The huge-document example still mounts normal `<Editable>` without the
  `largeDocument` option; performance/product proof should use the dedicated
  benchmark and large-document runtime tests, not that example alone.

## Decision Brief

Chosen path:

1. Register read-only DOM coverage for large-doc regions first.
2. Use traces and tests to prove no behavior/perf regression.
3. Only then let selection/copy/paste consult coverage for large-doc regions.
4. Only then migrate DOM-present staged mounting to coverage-owned lifecycle.

Rejected paths:

- Big-bang migration: too easy to blend collapse, shell, staging, and
  virtualization policies.
- Virtualization now: wrong first owner; the default DOM-present path is still
  the product risk.
- Stable public slots now: hidden-subtree proof is green, but stable authoring
  docs/adoption can wait.
- Idle-only background completion: `nativeSurfaceComplete` must be bounded and
  measured.

## Phase Gates

### Phase 0: Current-State Map

Status: complete for this activation.

Evidence:

- Read live large-doc owners:
  - `.tmp/slate-v2/packages/slate-react/src/large-document/create-island-plan.ts`
  - `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
  - `.tmp/slate-v2/packages/slate-react/src/large-document/large-document-commands.ts`
  - `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-coverage.ts`
  - `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`
- Read prior hidden-subtree plan and solution note.
- Confirmed Phase 6 entry gaps: stale full-doc replace, background max latency,
  large-doc selection/copy, browser find classification, IME/mobile target
  materialization, shell classification, default typing regression guard, and
  trace/debug completeness.

### Phase 6a: Read-Only Large-Doc Registration

Status: complete for DOM-present pending root groups.

Scope:

- Added internal registration for DOM-present pending root group placeholders.
- Shell island coverage registration was not added in this slice; shell already
  has explicit placeholder behavior and should be classified separately only
  when Phase 6b needs bridge parity.
- Use existing `DOMCoverageReason` values:
  - `large-document-staged` for DOM-present pending groups.
  - `shell-aggressive` for shell placeholders.
- Do not change editor behavior. Selection/copy/paste must behave the same as
  before this phase.
- Emit/debug enough metadata to explain group state, boundary id, reason,
  policy, start/end indexes, mounted group count, and pending group count.

Hard gates:

- No default typing regression beyond noise: smoke benchmark passed; one
  iteration is not a release claim.
- No behavior regression in existing large-document package tests: green.
- Coverage trace explains pending DOM-present group regions through
  `DOMCoverage.getBoundaries(editor)`.
- `DOMCoverage.getBoundaries(editor)` shows one coalesced large-doc staged
  boundary for pending DOM-present root groups in tests.
- Normal non-large-doc large-doc coverage remains unregistered by this path.

Driver tests:

```txt
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx
bun test ./packages/slate-dom/test/dom-coverage.ts
```

Benchmark smoke:

```txt
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=1 REACT_HUGE_COMPARE_TYPE_OPS=3 bun run bench:react:huge-document:legacy-compare:local
```

Evidence:

- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx`
  - 23 pass
- `bun test ./packages/slate-dom/test/dom-coverage.ts`
  - 12 pass
- `bun check`
  - lint, typecheck, unit tests, and vitest all passed
- `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=1 REACT_HUGE_COMPARE_TYPE_OPS=3 bun run bench:react:huge-document:legacy-compare:local`
  - passed
  - `v2DomPresent.readyMs.mean`: 51.73
  - `v2DomPresent.nativeSurfaceCompleteAt`: 3274.59
  - `v2DomPresent.startBlockTypeMs.mean`: 8.65
  - `v2DomPresent.middleBlockSelectThenTypeMs.mean`: 137.29
  - one-iteration smoke only; do not use as a release claim

### Phase 6b: Shared Bridge For Large-Doc Coverage

Status: complete.

Scope:

- Let selection/copy/paste consult coverage for pending/shell regions.
- Preserve existing shell-backed selection behavior unless measured evidence
  proves a better shared path.
- Model-backed copy is allowed only with explicit policy and proof.

Hard gates:

- Copy/select/paste behavior same or better than current large-doc proof.
- Programmatic selection into pending content materializes or model-backs
  deterministically.
- Browser find behavior is explicitly classified before and after
  `nativeSurfaceComplete`.

Evidence:

- DOM-present staged selection export now consults `DOMCoverage` before raw DOM
  lookup.
- Shell-backed selection stays shell-only; DOM-present no longer borrows shell
  selection policy.
- Selection materialization carries the target Slate range so large-doc staged
  coverage mounts the selected root group instead of the whole pending boundary.
- Clipboard coverage remains model-backed through the existing `DOMCoverage`
  clipboard path for non-excluded covered ranges.

### Phase 6c: Staged Mounting Convergence

Status: complete.

Scope:

- Move DOM-present staged mounting lifecycle onto coverage boundaries.
- Keep shell policy separate from DOM-present policy.

Hard gates:

- No stale old far DOM after full-doc replace.
- Default typing stays green.
- `nativeSurfaceComplete` is bounded.
- Background mounting has max-latency proof, not idle-only hope.

Evidence:

- Added a failing-then-green package proof for replacing a fully mounted
  DOM-present large document with another large document: old far DOM disappears
  immediately and fresh far ranges re-enter staged coverage.
- Added a root document epoch so full-document replacement resets staged group
  lifecycle even when runtime ids are preserved.
- `nativeSurfaceComplete` remains measured separately from `interactiveReady`.
  One-iteration 5000-block smoke: `v2DomPresent.interactiveReadyAt` 22.81 ms,
  `nativeSurfaceCompleteAt` 1141.99 ms, `pendingGroupCountAtReady` 99,
  `staleGroupCount` 0.

### Phase 6d: Virtualization Research

Status: deferred; research only, outside this completion target.

Scope:

- Experimental only.
- No default mode.

Required before even considering a product mode:

- materialize caret target;
- model-backed copy;
- IME target mounting;
- mobile selection;
- browser find strategy;
- screen-reader strategy;
- persistent caret soak.

## Performance Pass

- applicability: applied
- Vercel rules used: `js-set-map-lookups`, `js-index-maps`,
  `client-event-listeners`, `rerender-derived-state`,
  `rerender-defer-reads`, `js-request-idle-callback` only with max-latency
  fallback
- extra rules used: cohort segmentation, repeated-unit budget,
  interaction-INP matrix, memory/DOM tagging, degradation contract,
  staged-readiness, editor-native-behavior proof
- repeated unit: top-level root group and editable descendant
- cohorts: 1000, 5000, 10000, 25000+ blocks; shell explicit separately from
  DOM-present default
- budgets:
  - ordinary typing outside pending groups must not consult a document-scan
    registry;
  - pending root groups should coalesce, not register one boundary per hidden
    block in Phase 6a unless data proves safe;
  - event/effect work per root group stays near zero outside registration.
- metrics: startup, typing, select+type, full replace visible commit,
  `interactiveReady`, `nativeSurfaceComplete`, DOM nodes, editable descendants,
  root groups, shell count, heap where available
- degradation contract: DOM-present staging is temporarily absent DOM with a
  completion promise; shell is explicit aggressive mode; virtualization stays
  experimental
- dashboard/RUM gap: future production proof needs document-size, mode,
  interaction name, group counts, DOM nodes, heap, browser, mobile, IME, and
  release tags

## Current Pass

- pass: phase-6c-staged-mounting-convergence
- status: complete
- next pass: none for this lane
- next owner: none; Phase 6d virtualization research stays deferred until the
  user explicitly opens that research lane.

## Execution Ledger

| Time       | Pass                                 | Status   | Evidence                                                                                                                                                                                                                                                                                                      | Next                                            |
| ---------- | ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 2026-05-03 | phase-6-current-state-map            | complete | Live large-doc and DOM coverage owners read; prior Phase 6 gates carried forward; solution note applied                                                                                                                                                                                                       | Phase 6a read-only registration                 |
| 2026-05-03 | phase-6a-read-only-registration      | complete | Added root-owned DOM coverage support and DOM-present pending group registration; package tests, `bun check`, and one-iteration huge-doc benchmark smoke passed                                                                                                                                               | Phase 6b shared bridge                          |
| 2026-05-03 | phase-6b-shared-bridge               | complete | Added mode-specific large-document policy so shell-backed selection is shell-only; DOM-present staged selection export consults DOM coverage before raw DOM lookup; full-document model-backed guard now uses model root count as well as DOM child count; package tests, browser row, and `bun check` passed | Phase 6c staged mounting convergence            |
| 2026-05-03 | phase-6c-staged-mounting-convergence | complete | Added root document epoch and stronger stale-DOM replacement proof; narrowed selection materialization to target root groups; `bun check`, focused large-doc/DOM coverage tests, Chromium DOM-present native typing row, and 5000-block benchmark smoke passed                                                | Lane complete; virtualization research deferred |
| 2026-05-03 | ce-compound                          | complete | Captured reusable lesson in `docs/solutions/performance-issues/2026-05-03-slate-dom-present-staging-needs-document-epoch-and-range-materialization.md`                                                                                                                                                        | Completion-check                                |

## Changed Files

- `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-coverage.ts`
- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx`
- `.tmp/slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/root-selector-sources.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/runtime-keyboard-events.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/selection-controller.ts`
- `.tmp/slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`
- `.tmp/slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx`
- `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`
- `docs/plans/2026-05-03-slate-v2-dom-present-large-doc-phase-6-plan.md`
- `docs/solutions/performance-issues/2026-05-03-slate-dom-present-staging-needs-document-epoch-and-range-materialization.md`
- `active goal state`
- `active goal state`

## Completion Target

This lane is done. Completion criteria met:

- Phase 6a, 6b, and 6c gates are green or explicitly deferred in the plan;
- default DOM-present startup/typing/full-replace evidence is current;
- no stale far DOM after full-doc replace is proven;
- `interactiveReady` and `nativeSurfaceComplete` are measured and bounded;
- large-doc selection/copy/paste coverage is deterministic;
- completion state is updated to `done`.

Phase 6d virtualization research is explicitly deferred and is not part of this
completion target.
