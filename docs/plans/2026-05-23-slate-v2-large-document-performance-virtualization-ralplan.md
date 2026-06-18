---
date: 2026-05-23
topic: slate-v2-large-document-performance-virtualization
status: done-ralph-execution-with-scoped-stress-backlog
skill: slate-ralplan
score: 0.89
next_pass: none
---

# Slate v2 Large-Document Performance / Virtualization Ralplan

## Verdict

Keep the current architecture direction. Do not rewrite large-document rendering
around virtualization as the default.

The best long-term shape is:

1. default `auto`: DOM-present staged rendering with separate
   `interactiveReady` and `nativeSurfaceComplete` metrics;
2. explicit `staged`: force the safe large-document DOM-present path;
3. explicit `full`: debug and comparison path;
4. explicit object-only `virtualized`: pathological-document mode with named
   native-behavior limits;
5. future `slate-layout` / Pretext snapshots feed layout sizes and hit regions,
   but Slate React still owns DOM materialization, selection import/export, DOM
   coverage, copy/paste, IME, and mobile proof.

TanStack Virtual is an internal viewport/range engine for `virtualized`. It
should not leak into Slate's public API.

## Intent

Create the execution lane for the remaining large-document performance and
virtualization issue family:

- preserve the 5000-block DOM-present default claim already proven;
- stop implying the 10000-block immediate far-selection stress row is fixed;
- keep virtualization explicit and experimental;
- tighten benchmark, browser, memory, and native-behavior proof;
- keep issue accounting honest for `#5945`, `#4056`, `#5992`, `#2051`, and
  `#790`.

## In Scope

- Slate v2 large-document React rendering policy.
- DOM strategy API posture.
- Virtualized mode proof requirements.
- TanStack Virtual internal usage rules.
- Performance cohorts, repeated-unit budgets, memory tags, and interaction rows.
- Issue-ledger and PR-reference wording for the current perf state.
- Ralph handoff for implementation/test/proof execution in `Plate repo root`.

## Non-goals

- No Slate v2 source edits from this planning pass.
- No claim that virtualization is production-ready.
- No claim that `#790` is fixed or improved.
- No `Fixes #5945`, `Fixes #4056`, or `Fixes #5992` promotion.
- No new public TanStack-shaped options.
- No broad GitHub issue sweep. Use the existing ledgers first.

## Current Evidence

Read surfaces:

- `docs/plans/2026-05-01-slate-v2-universal-large-document-performance-ralplan.md`
- `docs/slate-v2/replacement-gates-scoreboard.md`
- `docs/slate-v2/slate-react-perf-loop-context.md`
- `docs/slate-issues/benchmark-candidate-map.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/references/pr-description.md`
- `apps/www/src/app/(app)/examples/slate/_examples/huge-document.tsx`
- `packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts`
- `packages/slate-react/src/components/editable-text-blocks.tsx`
- `benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs`
- `apps/www/tests/slate-browser/donor/examples/huge-document.test.ts`
- `content/docs/slate/libraries/slate-react/experimental-virtualized-rendering.md`

Reusable learnings applied:

- DOM strategy needs production metrics, not lab artifacts only.
- TanStack Virtual item snapshots must be read live during render; do not
  memoize `virtualizer.getVirtualItems()` by virtualizer identity.
- Large paste and huge cut performance must remain logical operations, not
  direct snapshot replacement.
- Legacy compare rows must prove the legacy surface exists.
- Shell/virtualized modes must fail closed for broad operations and name their
  native behavior limits.
- DOM-present staging needs document epoch and target-range materialization.

## Issue Accounting

| Issue | Current claim | This plan |
| --- | --- | --- |
| `#5945` slow large plaintext paste | `Improves` | Preserve. Issue-size 10,000-line plaintext paste is one logical operation. Exact browser reproduction closure still needs a 10,000-line browser artifact. |
| `#4056` copy/paste very large text | `Improves` | Preserve. Populated 10,000-block copy and 10,000-line middle paste have benchmark proof; exact full-book browser reproduction remains open. |
| `#5992` huge-document cut cost | `Improves` | Preserve. 10,000-block cut remains within the issue target thresholds, but the fresh 50,000-block artifact is red while still preserving one logical operation. Exact closure remains backlog. |
| `#2051` leaf rerender breadth | `Related` / performance guardrail | Keep as guardrail. Rerender breadth is represented by benchmark gates, not exact issue closure. |
| `#790` dynamic rendering | `Related` proof-route backlog | Keep backlog. Virtualized rendering directly targets the problem, but claim requires mount/edit/scroll benchmark, DOM coverage proof, and browser native-behavior proof. |

No new fixed issue claims. No new improved issue claims.

## Decision Brief

### Principles

- Default Slate must behave like a native editable document.
- Missing DOM is a named mode, not a hidden optimization.
- Performance wins need cohort-specific proof, not one impressive ready number.
- Benchmarks must measure user interactions: typing, selection, copy, paste,
  cut, scroll, and follow-up typing.
- Layout and DOM materialization are separate systems.

### Options

| Option | Decision | Reason |
| --- | --- | --- |
| Make virtualization the default | Reject | It breaks native full-document DOM assumptions for browser find, screen readers, selection, clipboard, IME, and mobile unless the editor owns replacements for all of them. |
| Keep DOM-present staged as default | Accept | It preserves native behavior while making the 5000-block release target fast enough. |
| Keep `virtualized` as explicit experimental object mode | Accept | It is the right pathological-document escape hatch and the right place to use TanStack Virtual. |
| Expose TanStack options publicly | Reject | That makes Slate's API depend on a list virtualizer instead of editor behavior. |
| Feed virtualizer sizes from `slate-layout` / Pretext | Accept as future target | Layout-derived sizes are better than estimates, but DOM coverage and selection policy remain Slate-owned. |

### Current perf truth

The default 5000-block release gate is good enough to claim within scope:

- `v2DefaultOmitted` ready around `19.44ms`;
- middle type around `8.92ms`;
- select/type around `31.55ms`;
- promote/type around `35.93ms`;
- replace around `14ms` or less in the current coalesced/default family;
- legacy chunk-on remains around `295ms` ready, `35ms` type, and `31-35ms`
  selection/promotion rows depending on run.

The 10000-block stress gate is still red:

- `v2DefaultOmitted` select/type around `69.03ms`;
- `v2DefaultOmitted` promote/type around `72.29ms`;
- legacy chunk-on select/type around `34.70ms`;
- legacy chunk-on promote/type around `35.75ms`.

Do not hide that. The next owner is 10000-block selection-inclusive
materialization/selection repair cost, not raw typing and not local group-size
tuning.

## Architecture Target

### Public API

Keep:

```tsx
<Editable domStrategy="auto" />
<Editable domStrategy="staged" />
<Editable domStrategy="full" />
<Editable
  domStrategy={{
    estimatedBlockSize: 32,
    overscan: 4,
    threshold: 25_000,
    type: 'virtualized',
  }}
  style={{ height: 480, overflowY: 'auto' }}
/>
```

Rules:

- `auto` is the default and remains DOM-present first.
- `staged` is the explicit safe large-document path.
- `full` is debug/comparison.
- `virtualized` stays object-only and experimental.
- No public `getScrollElement`, `measureElement`, `rangeExtractor`, item key,
  or TanStack virtualizer instance.
- Option objects normalize by primitive fields inside `Editable`; callers should
  not need `useMemo` for stable behavior.

### Internal DOM Strategy Boundary

`EditableTextBlocks` owns the materialization plan:

- root groups for staged DOM-present;
- coalesced pending placeholders;
- DOM coverage boundaries for missing regions;
- virtualized rows for viewport-only mounting;
- metrics for requested/effective strategy and coverage counts.

`useVirtualizedRootPlan` owns only the virtual range:

- use TanStack Virtual for viewport range, measurement, scroll-to-index, and
  dynamic size support;
- read `virtualizer.getVirtualItems()` live during render;
- retain selected and promoted indexes in the virtual range;
- accept layout-derived item sizes when available;
- never own Slate selection semantics.

`slate-layout` / Pretext future:

- produce block and line layout snapshots;
- expose per-block offsets and sizes for virtualizer estimates;
- expose hit rectangles for layout-driven caret mapping;
- remain independent from whether DOM is full, staged, or virtualized.

## Performance Lens

### Cohorts

| Cohort | Blocks | Default posture |
| --- | ---: | --- |
| normal | `0-500` | Full DOM, no large-doc behavior needed. |
| medium | `500-2000` | `auto` can remain full or staged depending on threshold. |
| large | `2000-10000` | `auto` uses staged DOM-present with eventual DOM coverage. |
| stress | `10000-50000` | Keep default staged; run stress gates separately. |
| pathological | `50000+` | `virtualized` may be used explicitly with degraded-mode labeling. |

### Repeated Unit Budget

Repeated unit: top-level block/root group.

Target budget:

- one stable root-group wrapper per staged group;
- no per-block global listeners;
- no per-block editor-wide subscriptions when parent already has node data;
- one DOM coverage boundary per coalesced missing range, not per pending block;
- virtualized mode mounts visible/retained rows only;
- layout size maps are keyed by index/runtime id and rebuilt from layout
  snapshot changes, not every keystroke.

### Interaction Matrix

Required rows:

- interactive ready;
- native surface complete;
- middle type;
- middle select then type;
- promote then type;
- model-beforeinput;
- select-then-model-beforeinput;
- select all;
- full-document replacement visible commit;
- fragment insertion visible commit;
- scroll to far block;
- click far block then type;
- copy/cut/paste across mounted and missing ranges.

Report p50/p75/p95/p99 where the harness supports it. Do not use a single mean
as a release argument.

### Memory / DOM Tags

Every perf artifact for this lane must include:

- heap used;
- DOM node count;
- Slate element/text/leaf counts;
- editable descendant count;
- root group count;
- mounted group count;
- pending group count;
- DOM coverage boundary count;
- viewport virtualization boundary count;
- event listener active count;
- selected/promoted retained virtual row count.

### Degradation Contract

`staged`:

- production path;
- DOM-present eventual coverage;
- stale far DOM must be absent after replacement;
- selection materializes target group before local edit;
- browser find/screen-reader coverage is only complete after native surface
  completion.

`virtualized`:

- explicit experimental path;
- mounted DOM is viewport/retained range only;
- browser find sees mounted content only;
- screen readers traverse mounted content only;
- broad selection and clipboard must be model-backed;
- IME and mobile selection are release-blocking proof rows.

## Execution Plan For Ralph

### Phase 1 - Stabilize current proof names

Owner: benchmark/docs.

- Ensure benchmark surfaces still emit `v2DefaultOmitted`,
  `v2DefaultRenderAuto`, `v2AutoExplicit`, `v2DomPresent`,
  `v2VirtualizedExperimental`, and no stale `v2NoIsland`.
- Ensure `domStrategyType` is present in every huge-doc trace.
- Ensure virtualized rows include `virtualizationEnabled: true`.

Verification:

```bash
cd Plate repo root
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

### Phase 2 - Lock 5000 default and preserve 10000 stress truth

Owner: slate-react performance.

- Keep the existing 5000-block default gate green.
- Add or refresh an explicit 10000 stress artifact and keep it as stress, not
  release scope.
- If optimizing the 10000 row, target selection-inclusive materialization and
  selection repair, not group-size tuning. Group `25` and immediate background
  mounting were already rejected.

Verification:

```bash
cd Plate repo root
REACT_HUGE_COMPARE_BLOCKS=10000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

### Phase 3 - Virtualized mode hardening

Owner: slate-react DOM strategy.

- Keep TanStack Virtual internal.
- Keep `virtualizer.getVirtualItems()` live, not memoized by virtualizer
  identity.
- Prove dynamic height backward scroll stability.
- Prove far scroll materializes target block.
- Prove selected/promoted blocks stay retained even if outside viewport.
- Feed layout-derived sizes when a layout snapshot exists; fall back to
  `estimatedBlockSize`.

Verification:

```bash
cd Plate repo root
cd packages/slate-react
bun run test:vitest test/dom-strategy-and-scroll.test.tsx
cd ../..
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/huge-document.test.ts --project=chromium --grep "virtualized|Huge Document"
```

### Phase 4 - Native behavior gate

Owner: slate-browser / slate-react.

Add or refresh browser rows for:

- active DOM-present typing;
- virtualized far block click then type;
- virtualized broad model-backed copy;
- virtualized cut over missing range;
- virtualized paste over model-backed selection;
- browser find limitation documented and tested as limitation;
- IME composition near mounted/virtualized boundary;
- mobile touch selection near mounted/virtualized boundary if raw device lane is
  available.

Verification:

```bash
cd Plate repo root
STRESS_FAMILIES=huge-document-cut,paste-normalize-undo PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/stress/generated-editing.test.ts -g "huge-document-cut|paste-normalize-undo" --project=chromium
```

### Phase 5 - Clipboard issue proof refresh

Owner: slate core / slate-dom.

Refresh issue-size clipboard artifacts before any maintainer-facing claim text:

```bash
cd Plate repo root
bun run bench:slate:5945:issue
SLATE_CLIPBOARD_BENCH_HUGE_CUT_BLOCKS=50000 SLATE_CLIPBOARD_BENCH_ISSUE_TARGETS=1 bun ./scripts/benchmarks/slate/5945-large-plaintext-paste.mjs
```

Keep the claims:

- `Improves #5945`;
- `Improves #4056`;
- `Improves #5992`.

Do not promote them to `Fixes` without browser reproduction acceptance.

### Phase 6 - Closeout verification

Required before the lane can be marked done:

```bash
cd Plate repo root
bun run bench:react:rerender-breadth:local
bun run bench:react:huge-document-overlays:local
CORE_HUGE_BENCH_LEGACY_REPO=<legacy-slate-checkout> bun run bench:core:huge-document:compare:local
bun lint:fix
bun typecheck:root
bun check
```

Run `bun check:full` only if the execution slice makes browser/release-quality
claims that need the full local browser sweep.

## Plan Review Matrix

| Lens | Status | Notes |
| --- | --- | --- |
| slate-ralplan | applied | Keeps implementation untouched and routes execution to Ralph. |
| clawsweeper | applied | Issue accounting is ledger-first; no broad live GitHub sweep. |
| performance | applied | Cohorts, repeated-unit budget, INP rows, memory tags, degradation contract, and native behavior gates are explicit. |
| tanstack-virtual | applied | TanStack is internal range/measurement engine only. |
| learnings-researcher | applied | Existing perf solution notes were checked before writing the lane. |
| goal workflow | applied | This file is the durable plan artifact. |
| tdd | deferred to Ralph | Planning pass only. Execution must add/refresh focused tests before code changes. |
| visual/browser proof | deferred to Ralph | Required for virtualized and native behavior claims. |

## Score

Overall score: `0.89`.

Breakdown:

| Criterion | Score | Reason |
| --- | ---: | --- |
| Architecture clarity | 0.93 | Boundaries are clear: layout, DOM materialization, virtualization, selection, and metrics have separate owners. |
| DX | 0.90 | Public API stays editor-shaped and avoids TanStack leakage. |
| Performance strategy | 0.91 | Cohorts and interaction rows are explicit; 10000 stress debt is not hidden. |
| Native behavior safety | 0.84 | Good contract, but virtualized mode still needs more browser/mobile/IME proof. |
| Issue accounting | 0.91 | Existing `Improves`/`Related` status is preserved with exact non-claim boundaries. |
| Execution readiness | 0.87 | Commands and phases are concrete; runtime proof still belongs to the next Ralph pass. |

## Ralph Execution Result

Ralph execution patched the current huge-document React benchmark harness and
closed the verification lane with scoped proof.

Implementation changes in `Plate repo root`:

- `scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs` imports
  `createReactEditor` from the current `slate-react` package instead of the
  removed `withReact` wrapper, replaces benchmark editor creation accordingly,
  and restores the missing `shellEnabled` trace flag.
- `packages/slate-react/src/hooks/use-slate-history.ts` avoids React ref
  reads/writes during render by keeping the last selected history root inside a
  stable runtime selector.

Fresh proof:

- `REACT_HUGE_COMPARE_MODE=current-only REACT_HUGE_COMPARE_SURFACES=v2DefaultOmitted REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=1 REACT_HUGE_COMPARE_TYPE_OPS=2 bun run bench:react:huge-document:legacy-compare:local`
  - artifact:
    `tmp/slate-react-huge-document-legacy-compare-benchmark-current-only-v2DefaultOmitted-blocks-5000-iters-1-ops-2-combined-selection-no-profile.json`
- `REACT_HUGE_COMPARE_MODE=current-only REACT_HUGE_COMPARE_SURFACES=v2DefaultOmitted REACT_HUGE_COMPARE_BLOCKS=10000 REACT_HUGE_COMPARE_ITERATIONS=1 REACT_HUGE_COMPARE_TYPE_OPS=2 bun run bench:react:huge-document:legacy-compare:local`
  - artifact:
    `tmp/slate-react-huge-document-legacy-compare-benchmark-current-only-v2DefaultOmitted-blocks-10000-iters-1-ops-2-combined-selection-no-profile.json`
  - stress row remains red: middle type `150.17ms`, middle select/type
    `306.44ms`, middle promote/type `280.46ms`, native surface complete
    `3113.55ms`.
- `REACT_HUGE_COMPARE_MODE=current-only REACT_HUGE_COMPARE_SURFACES=v2VirtualizedExperimental REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=1 REACT_HUGE_COMPARE_TYPE_OPS=2 bun run bench:react:huge-document:legacy-compare:local`
  - artifact:
    `tmp/slate-react-huge-document-legacy-compare-benchmark-current-only-v2VirtualizedExperimental-blocks-5000-iters-1-ops-2-combined-selection-no-profile.json`
  - explicit virtualized row remains a degraded mode: `nativeSurfaceCompleteAt:
    null`, `virtualizationEnabled: true`.
- `bun run bench:react:rerender-breadth:local`
  - sibling/ancestor render breadth stayed at `0` for the key repeated-unit
    rows.
- `bun run bench:react:huge-document-overlays:local`
  - overlay toggle and active edit rows stayed scoped to the active/far
    projection surfaces without broad text rerenders.
- `CORE_HUGE_BENCH_LEGACY_REPO=/Users/zbeyens/git/slate bun run bench:core:huge-document:compare:local`
  - passed, but exposed core v2 operation debt at 1000 blocks: current
    start/middle type around `86.95ms` / `83.78ms` versus legacy around
    `0.72ms` / `0.68ms`.
- `bun run bench:slate:5945:issue`
  - 10,000-line paste `51.45ms`, populated full-selection copy `46.33ms`,
    populated middle paste into 10,000 blocks `248ms`, 10,000-block two-node
    cut thresholds passed with one operation.
- `SLATE_CLIPBOARD_BENCH_HUGE_CUT_BLOCKS=50000 SLATE_CLIPBOARD_BENCH_ISSUE_TARGETS=1 bun ./scripts/benchmarks/slate/5945-large-plaintext-paste.mjs`
  - 10,000-line paste `35.69ms`, populated copy `39.81ms`, populated middle
    paste `285.79ms`.
  - 50,000-block cut stayed one operation but missed thresholds:
    `cutTwoBlocksEditMs` `552.21ms` vs `150ms`,
    `cutTwoBlocksMs` `382.5ms` vs `250ms`.
- `cd packages/slate-react && bun run test:vitest test/dom-strategy-and-scroll.test.tsx`
  - `37` tests passed.
- `cd packages/slate-react && bun run test:vitest test/use-slate-history.test.tsx`
  - `3` tests passed.
- `PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/huge-document.test.ts --project=chromium --grep "virtualized|Huge Document"`
  - `6` Chromium tests passed.
- `STRESS_FAMILIES=huge-document-cut,paste-normalize-undo PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/stress/generated-editing.test.ts -g "huge-document-cut|paste-normalize-undo" --project=chromium`
  - `4` Chromium stress rows passed.
- `node --check scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`
  - passed.
- `bun lint:fix`, `bun lint`, `bun typecheck:root`, `bun check`
  - passed. `bun check` ran package/site/root typecheck plus Bun and Vitest
    suites: `1157` Bun tests passed, `95` skipped; `25` slate-layout tests
    passed; `39` slate-react Vitest files / `355` tests passed.

Closeout truth:

- The benchmark harness drift is fixed.
- The explicit virtualized path has current browser and unit proof.
- The 10,000 stress artifact exists and stays scoped as stress/backlog.
- The 50,000 cut artifact is red and must not be described as fixed.
- Core operation performance at 1000 blocks is a separate follow-up lane.

## Completion State

Current pass: `ralph-large-document-performance-virtualization-execution`.

Current pass status: complete.

Lane status: done.

Next pass: none.

Next action: none. Keep `#5945`, `#4056`, and `#5992` as `Improves`; track the
10000 selection-inclusive stress debt, 50000 cut threshold miss, and core
operation regression as follow-up lanes rather than hidden closure claims.
