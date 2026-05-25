# Slate v2 Performance / Scalability Slate-Issues Ralplan

Date: 2026-05-08

Status: `done`

Current pass: `closure`

Current score: `0.95`

Completion file:
`.tmp/completion-checks/slate-v2-performance-scalability-slate-issues-ralplan.md`

Continuation prompt: `active goal state`

## Ralph Execution Slice 1

Status: `done`.

Scope: shared percentile artifacts only.

Files changed in `.tmp/slate-v2`:

- `scripts/benchmarks/shared/stats.mjs`
- `scripts/benchmarks/shared/react-benchmark.tsx`
- `scripts/benchmarks/core/current/editor-store.mjs`

Result:

- Shared core summaries now emit `p75`, `p95`, and `p99`.
- Shared React summaries now emit `p75`, `p95`, and `p99`.
- `bench:core:editor-store:local` now runs on the current transaction API and
  writes percentile fields to `.tmp/slate-editor-store-benchmark.json`.
- `bench:react:huge-document-overlays:local` writes percentile fields to
  `packages/slate-react/tmp/slate-react-huge-document-overlays-benchmark.json`.
- `bun check` passes in `.tmp/slate-v2`.
- No editor behavior, browser behavior, release threshold, or issue claim
  changed.

Stale benchmark note:

- Several existing core benchmark callers still use removed public write aliases
  such as `editor.insertText`, `editor.select`, `Editor.withTransaction`, and
  `Editor.setChildren`. Slice 1 repaired only `editor-store.mjs` because the
  accepted scope was one core caller plus shared percentile helpers. The broader
  benchmark API drift should be a later bounded slice, not hidden in this one.

## Intent

Create an execution-grade performance and scalability plan for Slate v2 from the
`docs/slate-issues` corpus. This is not one giant "make Slate fast" plan. That
would be dumb and impossible to execute cleanly.

The plan must split performance work by owner:

- core batch and operation execution;
- large paste, cut, copy, and dirty tracking;
- React rerender breadth and subscription locality;
- large-document rendering strategy and native-behavior contracts;
- overlay, annotation, widget, and decoration invalidation;
- Safari/browser selection latency;
- history memory retention;
- production performance observability.

## Desired Outcome

After this ralplan reaches `>= 0.92`, `ralph` can execute bounded slices without
reopening architecture every time.

The execution plan should tell the next agent:

- which issue families are in scope;
- which issue claims are already `Improves`, `Related`, or `Not claimed`;
- which live `.tmp/slate-v2` benchmark/test owner proves each claim;
- which missing rows block any `Fixes #...` promotion;
- which benchmark families should be extended instead of duplicated;
- which bounded `ralph` slice should run first;
- which proof families must not be batched together;
- which runtime APIs are safe long-term architecture and which are emergency
  local patches.

## Scope

In scope:

- `docs/slate-issues` performance and scalability issues;
- current `docs/slate-v2/ledgers/issue-coverage-matrix.md` performance rows;
- live `.tmp/slate-v2` benchmark commands and browser/package tests;
- performance docs and research that already corrected false large-document
  claims;
- pass-gated planning only.

Out of scope for this skill:

- patching `.tmp/slate-v2` implementation;
- promoting issue claims without fresh proof;
- treating `plate-2` checks as Slate v2 source verification;
- current Plate or slate-yjs public API compatibility;
- one plan per issue cluster;
- performance theater based on averages only.

## Decision Boundaries

- A benchmark row can support `Improves` without supporting `Fixes`.
- Browser/user-path proof is required before promoting large-document paste,
  copy, cut, selection, or rendering-strategy claims.
- Shell or virtualized modes are degradation contracts, not silent defaults.
- Broad hooks such as `useSlate` can stay broad by contract if a narrow selector
  path exists and is documented.
- Rendering strategy proof must include native behavior rows, not only timing.
- Performance proof must separate recompute selectivity, subscriber locality,
  rerender breadth, DOM weight, heap, and interaction latency.
- Percentile release thresholds must be calibrated from repeated current and
  legacy fixture runs before becoming hard failure gates.
- Public metrics must stay additive, optional, and vendor-neutral.
- Collaboration, history memory, rendering strategy, and clipboard stress are
  separate execution owners.
- `pending` is the correct state while the next pass is runnable.

## Source Map

### Issue Corpus

- `docs/slate-issues/benchmark-candidate-map.md:25-51` identifies `#6038` as
  the batch execution lane and explicitly says not to merge operation families.
- `docs/slate-issues/benchmark-candidate-map.md:55-105` identifies `#5992` as a
  huge-document cut lane with current `Improves`, not `Fixes`, proof.
- `docs/slate-issues/benchmark-candidate-map.md:108-134` identifies `#5945` as
  the large plaintext paste lane.
- `docs/slate-issues/benchmark-candidate-map.md:139-165` identifies `#4483` as
  dynamic decoration invalidation pressure.
- `docs/slate-issues/benchmark-candidate-map.md:169-199` identifies `#3656` as
  many-leaf rerender breadth inside one block.
- `docs/slate-issues/benchmark-candidate-map.md:205-235` identifies `#3430` as
  single-paragraph many-inline editing.
- `docs/slate-issues/benchmark-candidate-map.md:265-295` identifies `#4056` as
  populated-editor large paste/copy.
- `docs/slate-issues/benchmark-candidate-map.md:298-324` identifies `#3752` as
  history memory retention, not latency.
- `docs/slate-issues/benchmark-candidate-map.md:328-358` identifies `#5216` as
  Safari long-paragraph backward selection.
- `docs/slate-issues/benchmark-candidate-map.md:361-387` identifies `#5131` as
  selection-driven rerender count.
- `docs/slate-issues/benchmark-candidate-map.md:390-449` groups `#4210` and
  `#4141` into one reusable rerender-breadth family.
- `docs/slate-issues/benchmark-candidate-map.md:456-482` identifies `#2195` as
  dirty-path tracking pressure during large paste.
- `docs/slate-issues/benchmark-candidate-map.md:486-512` identifies `#2051` as
  simple typing rerender breadth.
- `docs/slate-issues/benchmark-candidate-map.md:516-542` identifies `#790` as
  large-document virtualization/initial render, with fair fixture proof still
  missing.

### Current Claim Accounting

- `docs/slate-v2/ledgers/issue-coverage-matrix.md:81-89` currently records:
  `#6038`, `#3656`, `#4141`, `#5945`, `#4056`, and `#5992` as `Improves`;
  `#5131` and `#3430` as `Not claimed`; `#3752` as `Related`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:112-113` keeps dirty tracking
  pressure as related to large-document range delete work.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:130-132` keeps zero-width and
  decoration-performance claims narrow.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:227` records `#2051` as
  represented by v2 render/runtime performance gates, without exact closure.

### Live Slate v2 Owners

- `.tmp/slate-v2/package.json:11-27` exposes stable benchmark commands for core,
  React, `#6038`, and `#5945`.
- `.tmp/slate-v2/package.json:29-31` keeps `bun check` separate from
  `bun check:full`.
- `.tmp/slate-v2/scripts/benchmarks/README.md:23-57` defines benchmark family
  ownership: browser React locality, core current measurements, and current-vs-
  legacy compare lanes.
- `.tmp/slate-v2/scripts/benchmarks/README.md:130-157` lists the current run
  commands and the issue-size `#5945/#5992` gate.
- `.tmp/slate-v2/scripts/benchmarks/README.md:159-165` says not to widen
  benchmarks unless they change a decision.
- `.tmp/slate-v2/docs/walkthroughs/09-performance.md:3-11` defines the public
  performance frame around large documents and typing INP.
- `.tmp/slate-v2/docs/walkthroughs/09-performance.md:48-54` documents narrow
  hooks for hot editor UI.
- `.tmp/slate-v2/docs/walkthroughs/09-performance.md:73-97` documents staged,
  shell, virtualized, and projection-store performance guidance.
- `.tmp/slate-v2/docs/walkthroughs/09-performance.md:98-104` keeps DOM painting
  and content visibility separate from editor runtime work.
- `.tmp/slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx`
  contains package proof for shell, staged, virtualized, select-all,
  shell-backed paste, fragment preservation, and composition guard behavior.
- `.tmp/slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`
  contains browser proof for DOM-present typing, bounded virtualized DOM,
  shell-backed paste/copy, remote rebase, native drag selection, keyboard shell
  activation, and composition interactions.

### Research And Prior Corrections

- `docs/research/README.md:130-139` requires reading compiled research before
  dropping to raw sources.
- `docs/research/index.md:75-129` indexes the editor architecture lane,
  including Lexical, ProseMirror, Tiptap, React, and Slate v2 decisions.
- `docs/research/log.md:207-222` records that huge-document performance still
  needed hardening around direct DOM text sync, shell activation, shell-backed
  paste, and accessibility.
- `docs/research/log.md:518-527` records the correction that shell islands win
  ready/full-document lanes but lose steady typing/select lanes to legacy
  chunking-on.
- `docs/research/decisions/slate-v2-overlay-superiority-vs-legacy-and-field.md:94-100`
  warns not to turn overlay superiority into a large-document typing superiority
  claim.
- `docs/research/decisions/slate-v2-architecture-verdict-after-human-stress-sweep.md:155-175`
  says React 19.2 makes Slate v2 serious, not automatically better than
  ProseMirror/Lexical/VS Code.
- `docs/research/decisions/slate-v2-architecture-verdict-after-human-stress-sweep.md:193-214`
  says regression freedom still needs wider operation-family coverage, Plate/Yjs
  migration rows, real devices, and legacy browser parity.

### Local Learnings

- `docs/solutions/performance-issues/2026-04-11-slate-v2-huge-document-typing-needs-selector-fanout-cuts-before-islands.md:30-44`
  says the 5000-block browser typing loss was React/runtime fanout after core
  cost collapsed.
- `docs/solutions/performance-issues/2026-04-11-slate-v2-huge-document-typing-needs-selector-fanout-cuts-before-islands.md:77-90`
  records measured 5000-block and 1000-block results.
- `docs/solutions/performance-issues/2026-04-11-slate-v2-huge-document-typing-needs-selector-fanout-cuts-before-islands.md:115-127`
  says subscription counts matter before jumping to islands.
- `docs/solutions/performance-issues/2026-04-20-source-scoped-overlay-invalidation-proof-must-separate-recompute-selectivity-from-subscriber-fan-out.md:92-117`
  proves recompute selectivity while keeping subscriber fanout open.
- `docs/solutions/performance-issues/2026-05-03-slate-rendering-strategy-needs-production-rum-metrics.md:20-35`
  says local benchmark artifacts are not production observability.
- `docs/solutions/performance-issues/2026-05-03-slate-rendering-strategy-needs-production-rum-metrics.md:49-70`
  lists rendering-strategy metrics and dashboard tags.
- `docs/solutions/performance-issues/2026-05-01-slate-v2-large-document-shell-policy-must-be-explicit-and-corridor-mounted.md:20-35`
  says shell policy was useful but the old API hid the risk.
- `docs/solutions/performance-issues/2026-05-01-slate-v2-large-document-shell-policy-must-be-explicit-and-corridor-mounted.md:102-120`
  says DOM-present grouping is the safe default and shell is an explicit
  aggressive mode.
- `docs/solutions/workflow-issues/2026-04-15-overlay-perf-coverage-must-include-annotation-widget-churn.md:51-90`
  says overlay performance must include annotation-backed widget churn.

## Initial Score

| Axis                                       | Score | Reason                                                                                                                                                                                                         |
| ------------------------------------------ | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance             |  0.70 | Strong benchmark family and selector/projection direction exist, but source-scoped invalidation still separates recompute from subscriber locality, and large-doc typing loses to legacy chunking-on at scale. |
| Slate-close unopinionated DX               |  0.68 | Performance docs expose `renderingStrategy`, selectors, and projection stores without forcing product APIs, but shell/virtualized risk still needs sharper user-facing contract rows.                          |
| Plate / slate-yjs migration backbone       |  0.58 | Core operation and commit facts help, but this performance lane has not yet mapped collaborative update, annotation, remote update, and history memory rows as migration substrate proof.                      |
| Regression-proof browser behavior          |  0.62 | Good package/browser owners exist, but full performance closure needs Safari, mobile/IME-adjacent native behavior, legacy parity, and broad copy/paste/select follow-up rows.                                  |
| Research evidence                          |  0.68 | Compiled research already corrected false superiority claims and compares Lexical/ProseMirror/Tiptap, but this specific performance plan has not refreshed performance-owner lessons from local clones.        |
| shadcn-style composability / minimal props |  0.65 | Raw Slate mostly stays unopinionated and exposes narrow hooks, but rendering strategy and performance metrics need a cleaner "simple default, advanced escape hatch" docs shape.                               |

Weighted current score: `0.66`.

This is not ready for `ralph` execution. It is good enough to know the real
owners and bad enough that pretending closure now would be self-delusion.

## Current Score After Pass 2

Current score: `0.71`.

The ClawSweeper pass improved issue coverage, not architecture confidence. The
score rises because the related issue map is less likely to miss a known
performance-adjacent row. It stays far below execution-ready because claim
accounting, research refresh, performance pressure, and test strategy are still
open.

## Current Score After Pass 3

Current score: `0.77`.

The plan now knows which performance-adjacent issues can be claimed, which stay
related, which are explicit non-claims, and which ledgers need sync. It still is
not execution-ready because the next hard part is policy: claim boundaries,
degradation boundaries, and user-path proof requirements must be made impossible
to misread before `ralph` touches code.

## Current Score After Pass 4

Current score: `0.82`.

The intent and boundary pass reduced the biggest misuse risk: later work now
has clear promotion rules, mode boundaries, and non-goals. The score still stays
below execution-ready because the plan has not refreshed external editor
mechanisms for this lane or pressure-tested the performance architecture with
thresholds, p95/p99 rows, and memory policy.

## Current Score After Pass 5

Current score: `0.86`.

The research refresh improved confidence in the owner model: Lexical,
ProseMirror, Tiptap, and legacy Slate all point toward dirty-scoped rendering,
selector-local React updates, explicit composition protection, and benchmark
families tied to user-path cohorts. The score stays below execution-ready
because thresholds, p95/p99 budgets, memory-retention policy, native-behavior
rows, and final ledger sync are still open.

## Current Score After Pass 6

Current score: `0.89`.

The performance pressure pass turned the lane from "these are the right
families" into explicit release gates: cohort thresholds, repeated-unit budgets,
percentile requirements, memory/DOM tags, native-behavior rows, and RUM tags.
It still cannot score `>= 0.92` because the test-strategy pass has not yet
selected exact new/extended tests, the maintainer/high-risk passes are still
open, and issue ledgers are not synced.

## Current Score After Pass 7

Current score: `0.91`.

The test-strategy pass turns the performance gates into exact benchmark and
behavior-proof rows. It is still not ready to mark `done`: maintainer
objections, high-risk browser/API pressure, final revision, and ledger sync are
still open. Closing now would be one of those polished-but-fake endings.

## Current Score After Pass 8

Current score: `0.92`.

The maintainer objection pass makes the plan execution-grade on benchmark
credibility and claim honesty, but not closure-ready. High-risk browser/API
pressure, revision, issue sync, and final closure still remain. Status stays
`pending` because reaching the numeric target without those passes would be a
cheap trick.

## Current Score After Pass 9

Current score: `0.93`.

The high-risk pass turns the remaining scary parts into bounded execution
rules: public metrics are additive and vendor-neutral, shell/virtualized modes
stay explicit, browser proof owns issue promotion, collaboration/history work
is split from rendering work, and thresholds are calibrated before enforcement.
The plan is stronger, but still not `done`: revision, issue sync, and final
closure are still open.

## Current Score After Pass 10

Current score: `0.94`.

The revision pass applies the accepted objections back into the executable plan:
first slice, split boundaries, claim-promotion rules, threshold calibration, and
vendor-neutral metrics policy are now explicit. This is ready for issue sync,
not done. The remaining work is ledger sync and closure review.

## Current Score After Pass 11

Current score: `0.95`.

The issue sync pass aligned the performance lane with the coverage matrix, fork
dossier, live ledger policy, and PR reference policy without promoting claims.
The plan is closure-ready, not implementation-ready: pass 12 still has to check
that no required review owner remains before completion can move to `done`.

## Current Score After Pass 12

Current score: `0.95`.

The closure pass accepts the plan for user review and later `ralph` execution.
No required planning owner remains open. The first implementation slice is still
shared percentile artifacts only, and all Slate v2 source/runtime proof must be
run in `/Users/zbeyens/git/slate-v2` when that later implementation slice
touches code.

## Performance Lens

- applicability: `applied`
- Vercel rules used:
  - `rerender-defer-reads`
  - `rerender-derived-state`
  - `rerender-split-combined-hooks`
  - `rerender-use-ref-transient-values`
  - `rendering-content-visibility`
  - `rendering-activity`
  - `js-index-maps`
  - `js-combine-iterations`
  - `js-early-exit`
- extra rules used:
  - `cohort-segmentation`
  - `repeated-unit-budget`
  - `interaction-inp-matrix`
  - `memory-dom-tagging`
  - `degradation-contract`
  - `staged-readiness`
  - `production-rum-dashboard`
  - `editor-native-behavior-proof`
  - `react-19-runtime-proof`
  - `effect-subscription-budget`
  - `event-delegation-budget`
  - `css-layout-hotpath`
- repeated units:
  - block
  - text leaf
  - inline-heavy paragraph
  - decoration/projection source
  - annotation-backed widget
  - top-level rendering group
  - shell/virtualized boundary
  - history operation payload
- cohorts:
  - normal: `0-500` blocks, low decorations, DOM-present
  - medium: `500-2000` blocks, DOM-present with strict repeated-unit budgets
  - large: `2000-10000` blocks, staged/DOM-present default with native behavior
    guarded
  - stress: `10000-50000` blocks, explicit shell/virtualized candidates
  - pathological: many inline nodes, custom renderers, annotations/widgets,
    remote updates, hidden boundaries, mobile/IME/Safari
- interaction metrics:
  - type
  - select
  - select then type
  - select-all
  - copy
  - cut
  - paste
  - drag selection
  - scroll to far group
  - click far group then type
  - materialize hidden content
  - remote update
- memory tags:
  - heap delta
  - retained operation payload count
  - detached DOM node count
  - DOM node count
  - editable descendant count
  - subscription count
  - selector count
  - projection-store recompute count
  - mounted group count
  - boundary count by reason
- degradation contract:
  - `full`: native by default, performance limited at stress size
  - `staged`: safe default for large documents, must reach native completion
  - `shell`: explicit aggressive mode, broad selections are model-backed or
    materialize-first
  - `virtualized`: experimental stress path only; cannot hide native behavior
    changes behind faster ready time
- dashboard/RUM gap:
  - Slate should expose metrics, not a vendor integration.
  - Products should tag interaction name, cohort, strategy, document size, DOM
    weight, heap, browser, mobile/IME, release, and degradation mode.

## Issue Family Table

| Family                            | Issues                                               | Current state                                                          | Next proof question                                                             |
| --------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Core batch execution              | `#6038`                                              | `Improves`; benchmark exists, no accepted threshold                    | Define operation-family thresholds and mixed-batch pass/fail gates.             |
| Large paste/cut/copy              | `#5945`, `#5992`, `#4056`, `#2195`                   | Mostly `Improves`/`Related`; package proof stronger than browser proof | Add browser/user-path rows and dirty-window timing.                             |
| React rerender breadth            | `#3656`, `#4141`, `#4210`, `#2051`, `#5131`, `#3430` | Several `Improves`; `#5131` and `#3430` intentionally not claimed      | Extend the existing rerender family by workload shape, not new benchmark blobs. |
| Decorations / overlays            | `#4483` plus annotation/widget family                | `Improves`; projection stores and local subscriptions exist            | Keep recompute selectivity and subscriber locality separately measured.         |
| Large-document rendering strategy | `#790` plus current shell/staged/virtualized docs    | Active architecture, not claim-complete                                | Prove native behavior matrix per mode and cohort.                               |
| Safari selection latency          | `#5216`                                              | Benchmark-ready but missing stable Safari harness                      | Build Safari-specific backward-selection lane before cross-browser claims.      |
| History memory retention          | `#3752`                                              | `Related`; no leak benchmark                                           | Add memory-retention benchmark with detached-node/object-retention evidence.    |
| Production observability          | no single issue                                      | Metrics API exists, but dashboard contract is not release law          | Turn lab tags into required RUM/dashboard rows.                                 |

## ClawSweeper Related-Issue Discovery Pass

Status: complete.

Evidence:

- `gitcrawl --version` returned `0.2.1`.
- `gitcrawl doctor --json` reported `617` clusters, `659` open threads, one
  repository, and no GitHub token.
- `docs/slate-issues/gitcrawl-live-open-ledger.md` remains the local live
  ledger source. It is archive-current to the May 4, 2026 sync, not fresh live
  GitHub proof.
- Gitcrawl neighbor reads were run for `#6038`, `#5945`, `#4483`, `#4210`,
  `#3752`, and `#790`.
- Gitcrawl searches were run for large-document paste/copy/cut, history memory
  leaks, Safari selection lag, dynamic rendering, and dirty-tracking language.

### Added Performance-Primary Rows

| Issue   | Status           | Bucket                     | Why it matters                                                                                                                                                          |
| ------- | ---------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#2733` | `cluster-synced` | `v2-performance-benchmark` | ApplyOperation performance is the older sibling of `#6038`; route through batch/core operation benchmarks, not a separate API plan.                                     |
| `#2669` | `issue-reviewed` | `v2-performance-benchmark` | User Timing API pressure belongs to the profiling/RUM layer. It should inform instrumentation requirements, not become a raw browser-vendor integration.                |
| `#2405` | `related`        | `v2-core-engine`           | Command-scoped schema/normalization pressure belongs to dirty-window and normalization benchmarking. It is already matrix-accounted as related.                         |
| `#5592` | `needs-repro`    | `v2-react-runtime`         | `EDITOR_TO_FORCE_RENDER` memory retention is the React-side memory sibling of `#3752`, but current v2 proof needs a focused retained-object benchmark before any claim. |
| `#4202` | `related`        | `v2-react-runtime`         | Placeholder rendering performance belongs to repeated render-unit budgets and placeholder lifecycle proof.                                                              |
| `#5420` | `related`        | `v2-react-runtime`         | Slow placeholder reappearance after clearing content is render-timing/perceived-latency pressure, not a core throughput benchmark.                                      |

### Added Rerender / React Runtime Guards

| Issue   | Status    | Bucket             | Why it matters                                                                                                                     |
| ------- | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `#3748` | `related` | `v2-react-runtime` | `wrapNodes`/`unwrapNodes` parent rerender pressure belongs to the existing rerender-breadth family.                                |
| `#4317` | `related` | `v2-react-runtime` | `onSelect` firing when `renderLeaf` changes is a selection/event guard for render churn.                                           |
| `#5274` | `related` | `v2-dom-selection` | Click selection ignored while rendering is not a perf benchmark, but it is a native-behavior guard for rerender fixes.             |
| `#5433` | `related` | `v2-input-runtime` | Rerender during composition moving the cursor is a hard native-behavior guard for any React performance work.                      |
| `#5349` | `related` | `v2-react-runtime` | Empty-editor `renderElement` churn is a narrow repeated-unit budget row.                                                           |
| `#5697` | `related` | `v2-dom-selection` | `ReactEditor.findPath` reliability without losing efficiency stays DOM bridge/path metadata pressure, not a standalone perf issue. |

### Added Clipboard / Large Payload Guards

| Issue   | Status             | Bucket                       | Why it matters                                                                                                                        |
| ------- | ------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `#4857` | `improves-claimed` | `v2-clipboard-serialization` | Already coverage-matrix accounted as foreign HTML select-all paste import boundary; use as browser user-path guard, not perf closure. |
| `#5479` | `related`          | `v2-clipboard-serialization` | GitBook paste belongs to external-format ingestion proof; it can guard large paste work but should not distort the performance lane.  |
| `#4802` | `improves-claimed` | `v2-clipboard-serialization` | Inline void copy/paste is already matrix-accounted; keep as native clipboard guard.                                                   |
| `#5616` | `related`          | `v2-clipboard-serialization` | Empty-line preservation in external paste targets is serialization fidelity, not throughput.                                          |
| `#3926` | `related`          | `v2-clipboard-serialization` | Safari void paste is browser clipboard behavior; it belongs in closure gates for clipboard-heavy perf claims.                         |

### Added Decoration / Mark / Static Rendering Guards

| Issue   | Status             | Bucket               | Why it matters                                                                                                             |
| ------- | ------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `#3354` | `related`          | `v2-react-runtime`   | Stable decoration arrays causing infinite render loops belongs to decoration invalidation and memoization proof.           |
| `#3382` | `improves-claimed` | `v2-react-runtime`   | Already matrix-accounted through projection slices keyed by runtime text ranges.                                           |
| `#2465` | `related`          | `v2-api-dx`          | Mark rendering ergonomics are DX pressure; carry as proof that render performance cannot leak raw internal leaf splitting. |
| `#2564` | `related`          | `v2-api-dx`          | Mark/inline distinction pressure stays public model/DX, not a perf closure claim.                                          |
| `#4025` | `related`          | `v2-react-runtime`   | Static renderer pressure belongs to readonly/static render output and large-surface render strategy.                       |
| `#3177` | `not-claimed`      | `v2-api-dx`          | RenderElement composability is product/plugin DX pressure; keep out of perf claims unless a public render API changes.     |
| `#3892` | `not-claimed`      | `ecosystem-boundary` | Custom layout engine advice is outside raw Slate performance closure.                                                      |
| `#2572` | `related`          | `v2-react-runtime`   | Accessibility is a release guard for shell/virtualized rendering; no perf win can bypass it.                               |

### Excluded From This Performance Lane

| Issue / PR                | Classification                        | Reason                                                                                                                               |
| ------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `#6050`, `#5939`, `#5800` | excluded                              | Pull requests or implementation references, not open issue rows to classify in this pass.                                            |
| `#4236`                   | `triage-closed` / stale               | IE11-specific typing slowness should not shape the v2 performance architecture unless legacy browser support is explicitly reopened. |
| `#5129`, `#3808`, `#4261` | `related` but not performance-primary | Transform API and normalization design pressure; use only when the core operation pass needs them.                                   |
| `#4440`                   | `related` but clipboard-DX            | Plain-text/HTML output customization belongs to clipboard API design, not throughput closure.                                        |

### Pass 2 Delta

- Added `#2733`, `#2669`, `#2405`, `#5592`, `#4202`, and `#5420` to the
  performance-primary watch list.
- Added rerender/native-behavior guards around `#3748`, `#4317`, `#5274`,
  `#5433`, `#5349`, and `#5697`.
- Added clipboard user-path guards around `#4857`, `#5479`, `#4802`, `#5616`,
  and `#3926`.
- Confirmed the next pass must be full issue-ledger accounting, not
  implementation.

## Full Issue-Ledger Accounting Pass

Status: complete.

Evidence:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md` owns current PR-slice claim
  language for `Improves`, `Related`, and `Not claimed` rows.
- `docs/slate-v2/ledgers/fork-issue-dossier.md` owns long-form fork-local issue
  sections and has some drift against the matrix.
- `docs/slate-v2/references/pr-description.md` currently mentions only
  clipboard/large-payload performance claims for `#5945`, `#4056`, and `#5992`.
- `docs/slate-issues/gitcrawl-live-open-ledger.md` intentionally contains live
  gitcrawl fields only, so this pass does not add classification columns there.
- Live Slate v2 command owners were re-read from `.tmp/slate-v2/package.json` and
  `.tmp/slate-v2/scripts/benchmarks/README.md`.

### Claim Accounting By Family

| Family                                    | Issues                                               | Claim status                                                          | Proof owner                                                                                   | Sync decision                                                                                                                              |
| ----------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Core batch execution                      | `#6038`                                              | `Improves`                                                            | `bench:slate:6038:local`, `bench:core:transaction:local`                                      | Already in matrix and dossier; no promotion without accepted threshold.                                                                    |
| Core operation ancestry                   | `#2733`                                              | `Related` / `cluster-synced`                                          | Same batch/transaction family as `#6038`                                                      | Add matrix/dossier sync later; no PR claim.                                                                                                |
| Performance instrumentation               | `#2669`                                              | `Related`                                                             | Future metrics/RUM instrumentation contract                                                   | Add dossier sync later; no raw User Timing API requirement in Slate core.                                                                  |
| Dirty-path normalization                  | `#2195`, `#2405`                                     | `Related`                                                             | `bench:slate:5945:local`, normalization/dirty-window gates                                    | Already in matrix and dossier; keep as guard rows.                                                                                         |
| Large paste/copy/cut                      | `#5945`, `#4056`, `#5992`                            | `Improves`                                                            | `bench:slate:5945:local`, clipboard large-payload artifact, browser stress rows where present | Already in matrix, dossier, and PR description; keep exact `Fixes` blockers.                                                               |
| Clipboard guard rows                      | `#4857`, `#4802`, `#5479`, `#5616`, `#3926`          | `#4857`/`#4802` `Improves`; others `Related`                          | `slate-dom` clipboard runtime/tests plus later browser clipboard rows                         | Matrix has `#4857`/`#4802`; add related sync for `#5479`, `#5616`, `#3926` only if clipboard performance claims widen.                     |
| React rerender breadth                    | `#3656`, `#4141`, `#4210`, `#2051`, `#3748`, `#5349` | `#3656`/`#4141`/`#2051` `Improves`; `#4210`/`#3748`/`#5349` `Related` | `bench:react:rerender-breadth:local`                                                          | Matrix/dossier drift exists for `#2051`; pass 11 should align to `Improves` or deliberately downgrade both.                                |
| Selection-driven subscriptions            | `#5131`, `#4317`, `#5274`, `#5697`                   | `#5131` `Not claimed`; others `Related`                               | `bench:react:rerender-breadth:local`, DOM selection/focus bridge tests                        | Keep broad hooks broad; no closure until selector and browser selection rows cover the original paths.                                     |
| Composition and placeholder render guards | `#5433`, `#4202`, `#5420`                            | `Related`                                                             | Input-runtime composition proof and placeholder render timing rows                            | Existing mobile/IME matrix keeps `#5433`/`#5420` as future proof; add `#4202` only if placeholder timing becomes an implementation target. |
| Decorations and projections               | `#4483`, `#3382`, `#3354`                            | `#4483`/`#3382` `Improves`; `#3354` `Related`                         | `bench:react:huge-document-overlays:local`, projection contract tests                         | Matrix has `#4483`/`#3382`; pass 11 should add or explicitly defer `#3354`.                                                                |
| Render API / mark DX pressure             | `#2465`, `#2564`, `#3177`                            | `Not claimed` for this lane                                           | Public render API / plugin DX, not performance closure                                        | Keep out of performance claims; resolve dossier wording that currently says `Related` for `#2465`/`#2564`.                                 |
| Static/read-only rendering                | `#4025`                                              | `Related`                                                             | Static/readonly rendering strategy proof                                                      | Dossier has a related row; matrix sync optional unless static rendering enters execution scope.                                            |
| Accessibility guard                       | `#2572`                                              | `Related` guard                                                       | Shell/virtualized/native behavior accessibility rows                                          | Keep as release guard for degraded rendering strategies, not a performance win.                                                            |
| Custom layout engine                      | `#3892`                                              | `Not claimed`                                                         | Ecosystem/product boundary                                                                    | Already dossier-accounted as not claimed.                                                                                                  |
| Large-document rendering strategy         | `#790`                                               | `Related` / proof-needed                                              | rendering strategy package/browser tests and huge-document compare benchmark                  | Add matrix/dossier sync later; no `Improves` until native behavior plus fair fixture proof exists.                                         |
| Safari selection latency                  | `#5216`                                              | `Related` / proof-needed                                              | Safari-specific browser harness                                                               | Add matrix/dossier sync later; no cross-browser claim.                                                                                     |
| History memory retention                  | `#3752`, `#5592`                                     | `#3752` `Related`; `#5592` `needs-repro`                              | `bench:history:compare:local` plus future retained-object/heap proof                          | Matrix/dossier have `#3752`; add `#5592` only after a retained-object route is selected.                                                   |

### Ledger Sync Decisions

| Surface                                          | Decision                      | Reason                                                                                                                                                                                                              |
| ------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/slate-issues/benchmark-candidate-map.md`   | sync later, narrowly          | It already owns primary benchmark-ready issues. Add only decision-changing entries such as `#2733`, `#2669`, `#5592`, `#4202`, `#5349`, or `#3354` if the execution plan actually creates those benchmark families. |
| `docs/slate-v2/ledgers/issue-coverage-matrix.md` | sync needed in pass 11        | It is missing some pass-2 classified rows and has matrix-only buckets that should become explicit performance-lane accounting if implementation scope widens.                                                       |
| `docs/slate-v2/ledgers/fork-issue-dossier.md`    | sync needed in pass 11        | It has useful long-form sections, but drift exists around `#2051`, `#2465`, and `#2564`; missing rows should be added only after boundary policy is locked.                                                         |
| `docs/slate-v2/references/pr-description.md`     | no change now                 | No new fixed or improved implementation claim landed in this planning pass. Updating PR prose now would create claim noise.                                                                                         |
| `docs/slate-issues/gitcrawl-live-open-ledger.md` | no manual classification edit | The file says it intentionally contains live gitcrawl fields only. Keep planning classifications in the plan, matrix, and dossier.                                                                                  |

### Pass 3 Delta

- Converted the pass-2 discovery list into claim accounting by owner family.
- Preserved every current `Fixes` blocker; no issue was promoted.
- Identified concrete ledger drift without editing generated/live gitcrawl
  surfaces.
- Made intent/boundary hardening the next pass because claim policy is now the
  weak point.

## Intent Boundary Hardening Pass

Status: complete.

Evidence used:

- active plan intent, scope, decision boundaries, issue-family table, and pass
  schedule;
- pass-3 claim accounting by owner family;
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` claim vocabulary;
- `docs/slate-v2/references/pr-description.md` exact `Improves` language for
  large clipboard payloads;
- `.tmp/slate-v2/docs/walkthroughs/09-performance.md` rendering strategy docs.

### Intent Boundary Record

| Field                | Record                                                                                                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Intent               | Produce an execution-grade performance/scalability plan for Slate v2 issue-ledger work, not a marketing claim that v2 is generically faster.                                                                                                     |
| Desired outcome      | A later `ralph` pass can implement bounded owners with exact issue-claim rules and known proof commands.                                                                                                                                         |
| In scope             | Core operation batching, dirty-window normalization, large clipboard payloads, React subscription breadth, decoration/projection invalidation, rendering strategies, Safari selection latency, history memory retention, and observability tags. |
| Non-goals            | One plan per issue, `Fixes` promotion from benchmarks alone, default shell/virtualized rendering, product-specific editor UX policy, legacy browser reopening, and current Plate/slate-yjs public API compatibility.                             |
| Decision boundary    | Any performance gain that changes native editing behavior, accessibility, selection semantics, clipboard fidelity, IME stability, or collaboration replay semantics is not acceptable until the behavior change is explicit and proven.          |
| User-decision points | None for the next planning pass. The conservative decision is already clear: raw Slate defaults stay native-first; aggressive rendering modes remain opt-in.                                                                                     |
| Question asked       | None. The missing facts are repo-evidence and research tasks, not user preferences.                                                                                                                                                              |
| Remaining ambiguity  | Exact performance thresholds, p95/p99 budgets, external-framework lessons, and final ledger sync policy are still open for later scheduled passes.                                                                                               |

### Claim Promotion Rules

| Status        | Allowed when                                                                                                                                              | Forbidden when                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `Fixes`       | The original repro is matched, the user path is covered, the owner command passes in `/Users/zbeyens/git/slate-v2`, and the ledger has exact proof links. | Only a benchmark, package test, architecture plan, or adjacent issue family is green.                          |
| `Improves`    | The implementation materially reduces the reported cost or failure mode, but exact original repro closure is not proven.                                  | The improvement is only speculative, docs-only, or does not hit the issue's reported workload.                 |
| `Related`     | The issue is architecture pressure or a guardrail for a touched owner.                                                                                    | The row is being used to imply closure or PR marketing value.                                                  |
| `Not claimed` | The issue is outside the performance lane, product/plugin policy, ecosystem advice, or a public API/DX concern not changed by this lane.                  | A later implementation actually changes and proves the reported behavior; then reclassify through ClawSweeper. |
| `needs-repro` | The issue has a plausible owner but no trusted v2 route or reproducible current proof.                                                                    | A later pass has a stable repro, benchmark, or browser artifact.                                               |

### Rendering Strategy Boundaries

| Mode          | Boundary                                                                                                                                                      | Required proof before stronger claims                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `full`        | Native-first baseline. It may be slower at stress sizes, but it is the behavior reference.                                                                    | Timings by cohort and browser; no hidden behavior tradeoff.                                                |
| `staged`      | Safe large-document default when it reaches native completion and does not skip user-visible editing behavior.                                                | Typing, selection, select-all, copy, paste, scroll, and materialization rows.                              |
| `shell`       | Explicit aggressive mode for very large documents. It can use model-backed operations for inactive regions, but cannot pretend to be pure native DOM editing. | Accessibility, selection, clipboard, IME/composition, search/find, drag selection, and remote-update rows. |
| `virtualized` | Experimental stress path. It is not the generic answer to `#790`.                                                                                             | Fair fixture, DOM lookup behavior, native interaction limits, and clear opt-in documentation.              |

### Pressure Test

Weak assumption tested: "If a performance benchmark is green, the issue can be
claimed."

Verdict: false. The plan keeps `#5945`, `#4056`, and `#5992` at `Improves`
because the reported user path is browser-visible and exact closure still needs
browser or maintainer-equivalent proof. This is the right conservative shape.

### Pass 4 Delta

- Added the explicit intent/boundary record required by Slate Ralplan.
- Turned claim language into enforceable promotion rules.
- Locked rendering strategy boundaries around native behavior, accessibility,
  and opt-in degradation.
- Recorded that no user question is needed before the research-refresh pass.

## Research Refresh Pass

Status: complete.

Evidence used:

- `../lexical/packages/lexical/src/LexicalReconciler.ts:787-815` passes
  dirty elements/leaves and dirty type into root reconciliation.
- `../lexical/packages/lexical/src/LexicalUpdates.ts:524-610` gates reconcile
  on dirty state, disconnects the observer during reconciliation, resets dirty
  sets, and garbage-collects detached decorators.
- `../lexical/packages/lexical/src/LexicalUpdates.ts:861-983` separates update
  queuing, selection transforms, dirty transforms, and detached-node garbage
  collection.
- `../lexical/packages/lexical-playground/src/plugins/TypingPerfPlugin/index.ts:34-80`
  measures keypress and beforeinput latency with `performance.now()` and avoids
  assuming requestAnimationFrame timing is comparable across browsers.
- `../prosemirror/view/src/viewdesc.ts:130-137` defines a view tree with dirty
  levels, not one undifferentiated dirty flag.
- `../prosemirror/view/src/viewdesc.ts:767-852` updates children while
  protecting local composition before DOM replacement.
- `../prosemirror/view/src/viewdesc.ts:1167-1348` reuses existing mark and node
  descs when possible.
- `../prosemirror/view/src/decoration.ts:265-358` keeps persistent decoration
  sets that map through document changes and return the same set when unchanged.
- `../prosemirror/view/src/input.ts:435-558` contains browser-specific
  composition guards, including Safari and Android timing behavior.
- `../prosemirror/view/src/domobserver.ts:174-246` turns DOM mutations into
  dirty ranges and flushes the view only when needed.
- `../tiptap/packages/react/src/useEditor.ts:20-29` exposes React render
  controls including `shouldRerenderOnTransaction`.
- `../tiptap/packages/react/src/useEditor.ts:365-375` avoids wrapper rerenders
  on every transaction by default.
- `../tiptap/packages/react/src/useEditorState.ts:118-173` uses
  `useSyncExternalStoreWithSelector` for selector-based editor state.
- `../tiptap/packages/react/src/EditorContent.tsx:25-31` and
  `../tiptap/packages/react/src/EditorContent.tsx:118-146` isolate node-view
  portal updates from parent renders.
- `../tiptap/demos/src/Experiments/CollaborationMappingPerformance/React/index.tsx:153-160`
  measures position mapping cost by position count.
- `../tiptap/demos/src/Experiments/CollaborationMappingPerformance/React/index.tsx:246-254`
  measures full transaction duration and document size.
- `../tiptap/demos/src/Experiments/CollaborationMappingPerformance/React/index.tsx:353-363`
  exercises typing simulation with decoration count.
- `../slate/docs/walkthroughs/09-performance.md:3-11` frames performance around
  large documents, typing INP, and uncovered non-typing operations.
- `../slate/docs/walkthroughs/09-performance.md:21-45` gives the legacy
  bottleneck triage model across DOM painting, normalization, and React.
- `../slate/docs/walkthroughs/09-performance.md:68-84` documents chunking and
  `content-visibility` as a large-document strategy.
- `../slate/docs/walkthroughs/09-performance.md:116-118` warns that
  `content-visibility` can affect accessibility behavior.
- `../slate/site/examples/ts/huge-document.tsx:41-75`,
  `../slate/site/examples/ts/huge-document.tsx:190-200`, and
  `../slate/site/examples/ts/huge-document.tsx:466-472` expose the huge-doc
  fixture knobs for block count, chunk size, chunk rendering, and
  `content-visibility`.
- `../slate/playwright/integration/examples/huge-document.test.ts:8-12` asserts
  the huge-doc example has 10,000 blocks and 10 chunks at chunk size 1000.

## Ecosystem Strategy Synthesis

This is the mechanism map to steal, reject, or deliberately diverge from. It is
not a generic editor survey.

| Reference    | Steal                                                                                                                                                                                       | Reject                                                                                       | Diverge deliberately                                                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Lexical      | Dirty leaves/elements as first-class reconciliation input; phase-tagged update cycles; detached decorator/node garbage collection; interaction timing that respects browser event ordering. | A black-box state/update model that would hide raw Slate operations behind framework policy. | Keep raw Slate deterministic operations and snapshots visible while making dirty windows, projection invalidation, and update phases measurable.                   |
| ProseMirror  | Dirty view-tree levels; persistent decoration sets; DOM mutation ranges; node/mark desc reuse; explicit composition protection before DOM replacement.                                      | A ProseMirror-style opaque view-desc/plugin runtime as the public model.                     | Keep the DOM bridge internal and Slate-close, but require performance fixes to preserve composition, selection, decoration, and accessibility behavior.            |
| Tiptap       | React selector subscriptions through external stores; no editor-wrapper rerender on every transaction; isolated portal/node-view subscriptions; collaboration mapping benchmarks.           | React integration that makes framework-specific conveniences the raw Slate API.              | Expose narrow Slate hooks and metrics while keeping product-level ergonomics in Plate or wrappers.                                                                 |
| Legacy Slate | Bottleneck triage across DOM painting, normalization, and React; huge-doc fixture knobs; chunking and `content-visibility` as a baseline; accessibility warnings.                           | Treating chunking or `content-visibility` as the whole large-document answer.                | Use legacy chunking as the fair comparison target, then require v2 staged/shell/virtualized modes to prove native behavior, accessibility, and browser user paths. |

### Mechanisms By Performance Family

| Family                                   | External lesson                                                                          | Slate v2 plan consequence                                                                                                                 |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Core batching and dirty windows          | Lexical and ProseMirror both make dirty scope explicit before rendering.                 | Add phase-separated timings for op apply, normalization, dirty range creation, projection invalidation, and DOM commit.                   |
| React rerender breadth                   | Tiptap and legacy Slate both avoid broad rerenders through selector-local reads.         | Keep broad hooks legal, but hot paths must prove narrow selectors and wrapper-stable transactions.                                        |
| Decorations and projections              | ProseMirror maps persistent decoration sets; Lexical passes dirty leaves into reconcile. | Keep recompute selectivity and subscriber locality as separate benchmark rows.                                                            |
| Large-document rendering                 | Legacy Slate chunking is a serious baseline, not an obsolete toy.                        | Compare staged/shell/virtualized modes against chunking-on, not against a strawman full-DOM fixture.                                      |
| Native behavior during performance fixes | ProseMirror protects composition during DOM updates.                                     | Every render-strategy and rerender optimization needs IME/composition, selection, clipboard, accessibility, and remote-update guard rows. |
| History and retained objects             | Lexical garbage-collects detached decorators/nodes as part of update cleanup.            | Add heap and retained-object evidence before promoting history memory rows such as `#3752` or `#5592`.                                    |
| Collaboration and remote updates         | Tiptap measures transaction cost and position mapping by document/position count.        | Add remote update, rebase, and mapping-cost rows before claiming migration-substrate performance strength.                                |

### Pass 5 Delta

- Refreshed performance/scalability lessons from local Lexical, ProseMirror,
  Tiptap, and legacy Slate checkouts.
- Added the Slate Ralplan-required ecosystem strategy synthesis.
- Confirmed that dirty-scope, selector-local subscriptions, persistent
  decoration/projection models, and composition-safe DOM updates are the
  highest-value mechanisms to steal.
- Preserved the conservative stance that v2 must beat or justify divergence
  from legacy chunking with fair fixture and native-behavior proof.
- Made performance architecture pressure the next required pass.

## Performance Architecture Pressure Pass

Status: complete.

Evidence used:

- `.tmp/slate-v2/package.json:11-27` owns the current benchmark command surface.
- `.tmp/slate-v2/scripts/benchmarks/README.md:23-57` owns current benchmark
  family placement.
- `.tmp/slate-v2/scripts/benchmarks/README.md:130-165` says benchmark coverage
  should widen only when it changes a decision.
- `.tmp/slate-v2/scripts/benchmarks/shared/stats.mjs:7-23` currently summarizes
  generic benchmark samples with mean, median, min, and max only.
- `.tmp/slate-v2/scripts/benchmarks/shared/react-benchmark.tsx:15-40` currently
  summarizes React benchmark metrics with mean, median, min, max, and samples.
- `.tmp/slate-v2/scripts/benchmarks/core/current/clipboard-large-payload.mjs:143-231`
  already records p50, p95, and heap deltas for large clipboard payload lanes.
- `.tmp/slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx:386-427`
  proves staged metrics include cohort, document size, mounted/pending counts,
  DOM coverage boundary counts, DOM node count, and editable descendant count.
- `.tmp/slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts:639-691`
  proves DOM-present staged input can use browser-native typing.
- `.tmp/slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts:694-730`
  proves the virtualized example has bounded DOM and delayed far content.
- `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs:2160-2184`
  currently computes mean deltas against legacy chunking baselines.

### Architecture Verdict

The benchmark family layout is basically right. The weak spot is not missing
folders; it is weak acceptance math. Most existing lanes still need percentile
and pressure tags before they can support release-grade claims.

Policy:

- extend existing benchmark families before adding new files;
- add p95 and p99 to shared benchmark summaries where the family uses repeated
  samples;
- keep mean/median as diagnostics, not acceptance gates;
- pair every large/stress timing with heap, DOM, mounted count, subscription,
  and hidden-boundary tags;
- reject any shell or virtualized win that lacks native-behavior rows.

### Cohort Release Gates

These are target gates for later execution, not current pass/fail claims.

| Cohort                                                                                  | Default mode                                | Latency target                                                                                            | Native surface target                                | Required tags                                                                    |
| --------------------------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| normal: `0-500` blocks, low complexity                                                  | DOM-present / `full`                        | type/select p95 <= `100ms`, p99 <= `150ms`; paste/copy p95 <= `200ms`                                     | native immediately                                   | interaction, block count, DOM count, subscription count, browser                 |
| medium: `500-2000` blocks                                                               | DOM-present or `staged` when docs choose it | active typing p95 <= `100ms`, p99 <= `200ms`; select-all/copy/paste p95 <= `350ms`                        | `nativeSurfaceComplete` tracked, no stale DOM        | pending group count, mounted group count, DOM count, editable descendant count   |
| large: `2000-10000` blocks                                                              | staged DOM-present default                  | active corridor type p95 <= `100ms`; far materialization p95 <= `250ms`; copy/paste/select p95 <= `750ms` | native completion required before stronger claims    | boundary reason, materialization reason, DOM coverage, heap delta                |
| stress: `10000-50000` blocks                                                            | explicit shell or virtualized candidate     | `interactiveReady` p95 <= `2s`; active corridor type p95 <= `120ms`; materialize far group p95 <= `500ms` | degraded rows explicit; no silent native equivalence | mode, hidden boundary count, model-backed operation count, accessibility status  |
| pathological: custom renderers, annotations, widgets, remote updates, Safari/mobile/IME | complexity-tagged, no global default        | budget per tagged family, never averaged into generic large-doc claims                                    | native row required for touched behavior             | renderer flags, decoration/widget count, IME/mobile/browser, remote update count |

### Repeated-Unit Budgets

| Unit                               | Budget                                                                                                                                        | Current owner                                                                   | Gate decision                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| top-level block/group              | No effects or store subscriptions in inert repeated blocks; handlers delegated when possible; DOM/component counts recorded by cohort.        | rendering-strategy metrics and `bench:react:huge-document:legacy-compare:local` | Extend existing metrics; no new benchmark family.                                 |
| text leaf / inline-heavy paragraph | Rerender only dirty target and necessary ancestors; selector paths O(1) or dirtiness-aware; no document-wide allocation on single text input. | `bench:react:rerender-breadth:local` and `bench:core:text-selection:local`      | Add p95/p99, leaf-count tags, selection-span tags.                                |
| projection / decoration source     | Recompute by changed source/runtime bucket; subscriber wakeups separated from recompute count; annotation/widget churn included.              | `bench:react:huge-document-overlays:local` and projection metrics               | Extend existing family with subscriber-locality thresholds.                       |
| rendering boundary                 | Track mounted/pending groups, DOM coverage boundaries, materialization cost, and stale DOM count.                                             | rendering strategy package/browser tests                                        | Add threshold rows, not a new architecture.                                       |
| clipboard payload                  | p95 and heap deltas already exist; browser user-path proof still required for stronger claims.                                                | `bench:slate:5945:local` and clipboard browser rows                             | Keep existing family; add browser follow-up rows.                                 |
| history payload                    | Undo/redo timing exists, but retained object/heap proof is still missing.                                                                     | `bench:history:compare:local`                                                   | Extend with heap/retained-object tags before claiming `#3752`/`#5592`.            |
| event/listener surface             | Hot repeated blocks should not carry per-block pointer/selection/listener closures unless measured.                                           | React benchmark counts and browser trace rows                                   | Add handler/listener count to repeated-unit artifacts when code changes handlers. |
| layout/selection geometry          | No mixed read/write loop during typing, drag selection, or overlay movement; transforms over layout-changing moves.                           | browser trace and selection runtime tests                                       | Add trace rows only for touched layout-sensitive owners.                          |

### Benchmark Family Threshold Decisions

| Family                                   | Existing owner                                                                                       | Threshold decision                                                                                             | New family?                                          |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| core transaction / `#6038`               | `bench:slate:6038:local`, `bench:core:transaction:local`                                             | Add p95/p99 and op-family tags; compare mixed batch, insert, delete, split/merge, and dirty scope separately.  | No.                                                  |
| normalization / dirty window             | `bench:core:normalization:local`, `bench:core:normalization:compare:local`, `bench:slate:5945:local` | Add dirty-path count, normalized ancestor count, and line/block count tags.                                    | No.                                                  |
| large clipboard payload                  | `bench:slate:5945:local`                                                                             | Keep existing p95/heap lane; add browser copy/paste/select-all user-path rows before `Fixes`.                  | No.                                                  |
| React rerender breadth                   | `bench:react:rerender-breadth:local`                                                                 | Add p95/p99 by leaf count, depth, selector type, selection span, and subscriber count.                         | No.                                                  |
| overlays / decorations                   | `bench:react:huge-document-overlays:local`                                                           | Add annotation/widget churn, runtime subscriber wake count, and source subscriber wake count thresholds.       | No.                                                  |
| huge-doc legacy compare                  | `bench:react:huge-document:legacy-compare:local`, `bench:core:huge-document:compare:local`           | Add p95/p99 and memory/DOM tags; compare against legacy chunking-on as the honest target.                      | No.                                                  |
| rendering strategy native behavior       | package/browser rendering-strategy tests                                                             | Keep behavior tests; add perf thresholds around materialization, pending groups, and stale DOM count.          | No unless missing user path.                         |
| Safari long-paragraph backward selection | no stable focused owner yet                                                                          | Needs Safari-specific browser row with interaction timing and DOM selection proof.                             | Yes, likely focused browser harness.                 |
| history memory retention                 | `bench:history:compare:local`                                                                        | Add heap delta, retained operation payload count, retained editor object count, and detached DOM/object probe. | Extend or add sibling memory lane.                   |
| production observability                 | metrics docs/runtime                                                                                 | Define RUM tags and product-facing metric payload; local lab proof is not enough.                              | New metrics-contract doc/test, not benchmark sludge. |

### Native Behavior Matrix

| Mode          | Browser find                                                               | Selection                                                            | Copy/paste                                              | IME/composition                         | Accessibility                                     | Collaboration/remote update                                         |
| ------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------- |
| `full`        | native                                                                     | native                                                               | native                                                  | native                                  | native                                            | model and DOM stay aligned                                          |
| `staged`      | native after `nativeSurfaceComplete`; active corridor native during warmup | active native; far ranges materialize-first                          | active native; far content materialize-first            | native only where DOM is fresh          | must not expose stale old DOM                     | remote updates must mark pending groups and materialization reasons |
| `shell`       | explicit opt-in; far content may be shell text or model-backed             | active native; far/broad selection model-backed or materialize-first | model-backed or materialize-first with visible contract | active corridor only until proven wider | shell semantics and `aria-hidden` policy required | remote update rows required before migration claims                 |
| `virtualized` | intentionally limited unless materialized                                  | active viewport native; far ranges materialize-first                 | model-backed/materialize-first only                     | opt-in stress path only                 | explicit limitation, not default docs             | remote update behavior cannot be assumed                            |

### React 19.2 Runtime Policy

- `Activity` may hide sidebars, inspectors, previews, and likely-next panels.
  It must not be used as the hidden editable-content primitive.
- `startTransition` and deferred values are valid for overlays, search results,
  secondary projections, metrics panels, and non-urgent UI.
- typing, DOM text sync, DOM selection import/export, caret repair,
  composition, and clipboard import/export stay urgent.
- `useSyncExternalStore` selectors and target-scoped hooks are the subscription
  backbone for hot editor UI.
- React Performance Tracks prove render breadth and scheduler priority only.
  They do not prove dirty scope, DOM mapping, IME safety, or native behavior.

### Performance-Oracle Complexity Gates

| Owner                    | Complexity rule                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| single text input        | O(touched text + ancestors + dirty projections), never O(document blocks).                                |
| selection move           | O(selection span + mapped boundaries), not O(all runtime targets).                                        |
| decoration refresh       | O(changed source ranges + affected runtime buckets), not O(all leaves \* all sources).                    |
| paste/cut/copy           | O(payload + affected dirty window), with browser row for DOM serialization cost.                          |
| history                  | Retained payloads bounded by history policy; heap evidence required for large fragments.                  |
| shell/staged/virtualized | Memory/DOM may drop, but model-backed operations and materialization cost become first-class budget rows. |

### Production RUM Contract

Slate should expose enough metric data for products to build the dashboard. It
should not ship a vendor-specific Datadog client in raw Slate.

Required tags:

- interaction name;
- cohort and document size;
- mode: `full`, `staged`, `shell`, `virtualized`;
- visible DOM node count and editable descendant count;
- hidden boundary count and reason;
- decoration/comment/annotation/widget count;
- custom renderer flags;
- browser, mobile, IME/composition state;
- release/version and benchmark/runtime owner.

Required metrics:

- p50, p75, p95, p99 interaction latency;
- `interactiveReady` and `nativeSurfaceComplete`;
- materialization duration;
- heap delta and retained payload count;
- mounted group count and pending group count;
- listener/subscription count;
- projection recompute count and subscriber wake count;
- React render/mount count where available.

### Pass 6 Delta

- Converted the performance lane into explicit cohort, repeated-unit,
  percentile, memory, DOM, native-behavior, and RUM gates.
- Confirmed the current benchmark family architecture is right, but mean-only
  summaries are too weak for release claims.
- Declared that new benchmark files are justified only for Safari
  backward-selection, history retained-object memory proof, or a metrics
  contract that existing families cannot express.
- Made test strategy the next required pass because the plan now knows which
  rows need tests, but not the exact test list.

## Test Strategy Pass

Status: complete.

TDD rule applied:

- Use public behavior, public commands, public benchmark artifacts, or
  documented runtime metrics as the proof surface.
- Do not test private implementation shape unless the existing repo already
  exposes an internal contract test for that owner.
- Do not write a giant horizontal batch. Implement proof as vertical slices:
  one failing proof row, one implementation change, one focused verification.

Evidence used:

- `.agents/skills/tdd/SKILL.md` behavior-through-public-interfaces rule.
- `docs/slate-issues/benchmark-candidate-map.md:25-542` for benchmark-ready
  issue families and issue-specific workload notes.
- `.tmp/slate-v2/package.json:11-27` for current benchmark commands.
- `.tmp/slate-v2/scripts/benchmarks/README.md:23-67` for benchmark family owners.
- `.tmp/slate-v2/scripts/benchmarks/README.md:83-103` for stable command and
  shared-helper policy.
- `.tmp/slate-v2/scripts/benchmarks/README.md:105-165` for artifact names,
  commands, issue-size clipboard gate, and the "decision-changing only" rule.
- `.tmp/slate-v2/scripts/benchmarks/shared/stats.mjs:7-23` and
  `.tmp/slate-v2/scripts/benchmarks/shared/react-benchmark.tsx:15-40` for the
  current mean/median-only summaries.
- `.tmp/slate-v2/scripts/benchmarks/core/current/clipboard-large-payload.mjs:143-231`
  for existing p50/p95/heap coverage.
- `.tmp/slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx:386-427`
  for rendering-strategy metric assertions.
- `.tmp/slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx:1368-1631`
  for shell-backed select-all, render-plan, paste, and fragment package proof.
- `.tmp/slate-v2/packages/slate-react/test/render-profiler-contract.test.tsx:41-85`
  for current render-count instrumentation.
- `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx:105-220`
  for public projection/decorations behavior.
- `.tmp/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx:69-124`
  for DOM coverage boundary behavior.
- `.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts:29-112`
  and `.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts:114-198`
  for commit metadata, dirty runtime ids, history, and remote replay behavior.
- `.tmp/slate-v2/packages/slate/test/clipboard-contract.ts:20-213` for headless
  fragment and delete behavior.
- `.tmp/slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts:639-730`
  for browser-native staged typing and bounded virtualized DOM proof.
- `.tmp/slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts:766-907`
  and `.tmp/slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts:1035-1180`
  for IME/browser behavior proof.
- `.tmp/slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts:1410-1610`
  for model changes during active composition.
- `.tmp/slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts:2058-2315`
  for shell-backed paste, copy, selection bookmark rebase, and rich HTML paste
  browser proof.

### Exact Test And Benchmark Plan

| Proof row                     | Extend existing owner                                                                                                                                              | Add new owner? | Public behavior / artifact                                                                                                                                  | Issue mapping                                        | Closure blocker                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| Shared percentile artifacts   | `scripts/benchmarks/shared/stats.mjs`, `scripts/benchmarks/shared/react-benchmark.tsx`                                                                             | No             | Every repeated-sample benchmark artifact exposes p75/p95/p99 in addition to mean/median.                                                                    | All performance lanes                                | No release claim may rely on mean-only artifacts.                              |
| Core transaction / `#6038`    | `scripts/benchmarks/core/current/transaction-execution.mjs`; wrapper `scripts/benchmarks/slate/6038-transaction-execution.mjs`                                     | No             | `bench:core:transaction:local` and `bench:slate:6038:local` report p95/p99 by op family and mixed-batch shape.                                              | `#6038`, `#2733`                                     | Accepted thresholds per op family.                                             |
| Dirty normalization           | `scripts/benchmarks/core/current/normalization.mjs`, `scripts/benchmarks/core/compare/normalization.mjs`                                                           | No             | Artifacts include dirty-path count, normalized ancestor count, document size, and p95/p99.                                                                  | `#2195`, `#2405`                                     | Dirty-window proof tied to large paste/cut workloads.                          |
| Large clipboard payload       | `scripts/benchmarks/core/current/clipboard-large-payload.mjs`; wrapper `scripts/benchmarks/slate/5945-large-plaintext-paste.mjs`                                   | No             | Existing p50/p95/heap lane gains p99 and issue-size artifact assertions.                                                                                    | `#5945`, `#5992`, `#4056`                            | Browser user-path proof still required before `Fixes`.                         |
| Clipboard browser behavior    | `playwright/integration/examples/rendering-strategy-runtime.test.ts` and `packages/slate-react/test/rendering-strategy-and-scroll.test.tsx`                        | No             | Shell-backed paste/copy/select-all preserve Slate fragment, plain text, rich HTML, and model-backed ranges.                                                 | `#5945`, `#5992`, `#4056`, clipboard guard rows      | Need stress-size browser row or accepted equivalence to issue-size benchmark.  |
| React rerender breadth        | `scripts/benchmarks/browser/react/rerender-breadth.tsx`; `packages/slate-react/test/render-profiler-contract.test.tsx`                                             | No             | Bench artifact reports p95/p99 by leaf count, nested depth, selector type, selection-only change, and subscriber wake count.                                | `#3656`, `#4141`, `#4210`, `#2051`, `#5131`, `#3430` | Hot selector rows pass; broad hook rows stay documented non-claims.            |
| Projection/decorations        | `scripts/benchmarks/browser/react/huge-document-overlays.tsx`; `packages/slate-react/test/projections-and-selection-contract.test.tsx`                             | No             | Artifact separates recompute count, runtime subscriber wake count, source subscriber wake count, annotation/widget count, and p95/p99.                      | `#4483`, `#3382`, `#3354`                            | Annotation/widget churn included; recompute and subscriber locality both pass. |
| Large-document strategy       | `scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`, `scripts/benchmarks/core/compare/huge-document.mjs`, rendering-strategy package/browser tests | No             | Compare against legacy chunking-on; record p95/p99, DOM count, mounted/pending groups, materialization latency, and stale DOM count.                        | `#790`                                               | Native behavior rows pass per mode and cohort.                                 |
| Safari backward selection     | New focused browser test under `playwright/integration/examples/` with WebKit project and long-paragraph fixture                                                   | Yes            | Backward drag selection over a 300+ word paragraph records event-to-selection latency and resulting DOM/model selection.                                    | `#5216`                                              | Stable WebKit/Safari row exists; no video-only proof.                          |
| History retained memory       | Prefer new `scripts/benchmarks/core/current/history-memory.mjs`; keep `bench:history:compare:local` for latency/compare                                            | Yes            | Current-only artifact records heap delta, retained operation payload count, retained editor object count, undo/redo stack size, fragment size.              | `#3752`, `#5592`                                     | Retention is bounded or intentionally policy-limited.                          |
| Rendering metrics contract    | `packages/slate-react/test/rendering-strategy-and-scroll.test.tsx`                                                                                                 | No             | `onRenderingStrategyMetrics` emits RUM-ready tags: interaction name, cohort, document size, mode, DOM count, boundary count/reason, mounted/pending groups. | `#2669`, `#790`                                      | Product can build dashboard without raw Slate importing a vendor client.       |
| Collaboration / remote update | `packages/slate/test/collab-history-runtime-contract.ts`; rendering-strategy Playwright remote rows                                                                | No             | Remote replay keeps commit metadata, dirty runtime ids, shell-backed bookmarks, and clipboard/caret behavior coherent.                                      | collaboration substrate for performance claims       | High-risk pass accepts remote-update budget and behavior rows.                 |

### Vertical TDD Slice Order

1. Shared percentile summaries.
   - Red: artifact schema assertion fails because p75/p95/p99 are missing in
     one shared-helper benchmark.
   - Green: add percentile summary once, then update one benchmark artifact.
   - Proof: run one core and one React benchmark owner.
2. Core transaction threshold row.
   - Red: `#6038` artifact lacks op-family percentile rows.
   - Green: extend the existing transaction family only.
   - Proof: `bun run bench:slate:6038:local` and
     `bun run bench:core:transaction:local`.
3. React rerender breadth row.
   - Red: artifact lacks selector/depth/leaf percentile rows or subscriber
     wake counts.
   - Green: extend `rerender-breadth.tsx`.
   - Proof: `bun run bench:react:rerender-breadth:local`.
4. Overlay/projection churn row.
   - Red: artifact cannot distinguish recompute selectivity from subscriber
     locality under annotation/widget churn.
   - Green: extend `huge-document-overlays.tsx`.
   - Proof: `bun run bench:react:huge-document-overlays:local`.
5. Large-document strategy row.
   - Red: legacy compare artifact lacks percentile and DOM/memory tags.
   - Green: extend existing compare families and package metrics assertions.
   - Proof: `bun run bench:react:huge-document:legacy-compare:local`,
     `bun run bench:core:huge-document:compare:local`, and focused
     rendering-strategy package tests.
6. Clipboard user-path row.
   - Red: browser shell-backed clipboard proof lacks stress-size or accepted
     equivalence to issue-size benchmark.
   - Green: extend existing browser rows or the runtime fixture, not a new
     clipboard framework.
   - Proof: focused Playwright rows in
     `playwright/integration/examples/rendering-strategy-runtime.test.ts`.
7. Safari backward-selection row.
   - Red: no stable WebKit/Safari harness for `#5216`.
   - Green: add one focused browser row with a long paragraph and backward drag
     selection.
   - Proof: WebKit/Safari project only, with event-to-selection timing.
8. History memory-retention row.
   - Red: `bench:history:compare:local` proves latency/compare, not retained
     memory.
   - Green: add a current-only memory benchmark or sibling lane.
   - Proof: artifact includes heap and retained payload tags.
9. Metrics/RUM contract row.
   - Red: rendering metrics cannot populate the pass-6 dashboard tags.
   - Green: extend the public metrics payload and contract test.
   - Proof: focused `slate-react` package test, no vendor integration.

### Verification Commands For Later Execution

Run from `/Users/zbeyens/git/slate-v2`, not `plate-2`.

Focused benchmark commands:

```bash
bun run bench:slate:6038:local
bun run bench:core:transaction:local
bun run bench:core:normalization:local
bun run bench:core:normalization:compare:local
bun run bench:slate:5945:local
bun run bench:react:rerender-breadth:local
bun run bench:react:huge-document-overlays:local
bun run bench:react:huge-document:legacy-compare:local
bun run bench:core:huge-document:compare:local
bun run bench:history:compare:local
```

Focused package/browser commands:

```bash
bun test ./packages/slate-react/test/rendering-strategy-and-scroll.test.tsx
bun test ./packages/slate-react/test/render-profiler-contract.test.tsx
bun test ./packages/slate-react/test/projections-and-selection-contract.test.tsx
bun test ./packages/slate-react/test/dom-coverage-boundary-contract.test.ts
bun test ./packages/slate/test/collab-history-runtime-contract.ts
bun test ./packages/slate/test/clipboard-contract.ts
playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts
playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=webkit --grep "backward selection"
```

### Pass 7 Delta

- Selected exact benchmark/test owners for every pass-6 performance gate.
- Kept existing benchmark families as the default path and justified only two
  new proof owners: Safari backward selection and history retained memory.
- Mapped each proof row to public behavior, issue claim, and closure blocker.
- Made maintainer objection pass the next required pass.

## Decision Brief

Principles:

- Keep raw Slate unopinionated.
- Split performance by owner; do not create global benchmark sludge.
- A faster mode that breaks native editor behavior is not a win.
- Browser proof beats benchmark optimism for user-visible operations.
- Large-document claims need cohort and complexity tags.
- Use existing benchmark families unless a new family changes a decision.

Decision drivers:

- issue-ledger truth;
- current `.tmp/slate-v2` benchmark command contract;
- corrected research on legacy chunking and shell behavior;
- local Lexical dirty reconciliation and update-phase evidence;
- local ProseMirror dirty view tree, persistent decoration, and composition
  protection evidence;
- local Tiptap React subscription and collaboration-mapping evidence;
- legacy Slate chunking, `content-visibility`, and accessibility caveats;
- React runtime fanout evidence;
- native browser behavior risk in shell/virtualized modes;
- migration substrate pressure from collaboration/history/operation metadata.

Chosen direction:

- Plan performance closure as a small set of owner lanes, not issue-by-issue
  execution.
- Keep `staged`/DOM-present as the safe large-document baseline.
- Treat `shell` and `virtualized` as explicit modes with native-behavior proof.
- Extend existing benchmark owners:
  - `bench:slate:6038:local`
  - `bench:slate:5945:local`
  - `bench:react:rerender-breadth:local`
  - `bench:react:huge-document-overlays:local`
  - `bench:react:huge-document:legacy-compare:local`
  - core current and compare benchmark commands
- Add missing proof where the corpus says the issue is benchmark-ready but live
  proof is absent.

Rejected directions:

- One plan per cluster.
  Reason: it explodes planning into the work.
- One giant benchmark lane.
  Reason: it hides which owner regressed.
- Shell/virtualized as default large-document answer.
  Reason: native behavior and accessibility risk must be explicit.
- `Fixes #...` promotions from package-only proof.
  Reason: the user path is browser-visible for paste/copy/cut/selection.
- New benchmark files for every small variant.
  Reason: existing families already own most variants.

## Maintainer Objection Pass

Status: complete.

Skills applied:

- `slate-ralplan`
- `steelman-pass`
- `high-risk-deliberate-pass`
- `performance`
- `performance-oracle`

Evidence used:

- `.tmp/slate-v2/package.json:11-30` exposes current benchmark commands and keeps
  `bun check` separate from `bun check:full`.
- `.tmp/slate-v2/scripts/benchmarks/README.md:23-67` defines live benchmark family
  ownership and keeps issue wrappers under `scripts/benchmarks/slate/`.
- `.tmp/slate-v2/scripts/benchmarks/README.md:130-165` lists run commands and
  bans benchmark files that do not change a decision.
- `.tmp/slate-v2/scripts/benchmarks/shared/stats.mjs:7-23` and
  `.tmp/slate-v2/scripts/benchmarks/shared/react-benchmark.tsx:15-40` still expose
  mean/median/min/max summaries, so percentile gates are not already done.
- `.tmp/slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx:386-427`
  proves rendering-strategy metrics already carry document size, cohort,
  mounted/pending counts, DOM boundary counts, DOM node count, and editable
  descendant count.
- `.tmp/slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx:1368-1412`
  proves shell-backed broad selection is explicit instead of silently native.
- `.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts:29-112`
  proves commit metadata, operation batching, dirty ids, and history share one
  commit truth, but not retained-memory closure.
- `.tmp/slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts:639-730`
  proves DOM-present staged typing and bounded virtualized DOM in browser rows.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:81-89` keeps the key
  performance issues as `Improves`, `Related`, or `Not claimed`; it does not
  record `Fixes` for these rows.

### Maintainer Objection Ledger

| Objection                                                                            | Verdict                                           | Evidence                                                                                                                                                                                                                                                                                                                    | Plan delta                                                                                                                                                           |
| ------------------------------------------------------------------------------------ | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "This is still benchmark-first architecture. Where is the editor behavior contract?" | Accept                                            | The plan has benchmark owners, but browser/native behavior is still the real release gate for paste, copy, cut, selection, IME, and shell/virtualized modes. Browser proof already exists for staged typing and virtualized DOM in `rendering-strategy-runtime.test.ts:639-730`, but it is not complete across every claim. | Keep browser/user-path rows as closure blockers. Do not promote any issue from benchmark-only proof.                                                                 |
| "The percentile thresholds look invented."                                           | Accept                                            | Shared helpers currently expose mean/median/min/max only in `stats.mjs:7-23` and `react-benchmark.tsx:15-40`. The pass-6 budgets are target gates, not validated baselines.                                                                                                                                                 | First execution slice must add percentile artifacts, then calibrate thresholds from current/legacy baselines and repeat variance before enforcing release pass/fail. |
| "Why not just virtualize everything and move on?"                                    | Reject as default, accept as explicit stress mode | Package/browser tests prove virtualized DOM can be bounded, but shell/virtualized content changes native expectations. Shell-backed selection is explicitly marked in `rendering-strategy-and-scroll.tsx:1368-1412`.                                                                                                        | Keep `staged`/DOM-present as the safe default. `shell` and `virtualized` stay opt-in with visible degradation and native-behavior rows.                              |
| "New Safari and history-memory owners violate the no-new-benchmark rule."            | Reject                                            | The benchmark README bans files that do not change decisions, not decision-changing owners. Safari backward selection and retained history memory lack stable current owners; existing commands do not cover them.                                                                                                          | Allow exactly two new proof owners unless pass 9 finds a lower-risk extension path.                                                                                  |
| "Do not claim `#5992`, `#5945`, or `#4056` fixed from headless benchmarks."          | Accept                                            | The issue matrix records `#5945`, `#4056`, and `#5992` as `Improves`, with browser closure blockers still named at `issue-coverage-matrix.md:86-88`.                                                                                                                                                                        | Keep these as `Improves` until browser stress proof or an explicit maintainer equivalence decision exists.                                                           |
| "`useSlate` broadness can regress apps even if selectors exist."                     | Accept with boundary                              | The issue matrix keeps `#5131` as `Not claimed` because broad hooks remain broad by contract.                                                                                                                                                                                                                               | Docs/examples must steer hot UI to selector hooks and keep broad hooks documented as convenience, not a performance path.                                            |
| "The plan claims migration substrate but collaboration is under-proved."             | Accept                                            | `collab-history-runtime-contract.ts:29-112` proves one commit truth and dirty runtime ids, but not remote-update cost, retained-memory bounds, or shell-backed bookmark behavior under stress.                                                                                                                              | Pass 9 must add remote-update, history-memory, and shell bookmark risks to the high-risk table before closure.                                                       |
| "Legacy chunking may still beat v2 for large steady typing."                         | Accept                                            | Earlier research already corrected the false superiority claim; pass 6 requires legacy chunking-on comparisons.                                                                                                                                                                                                             | Large-document claims must compare against legacy chunking-on for the same cohort and complexity tag.                                                                |
| "The RUM contract could bloat raw Slate or force Datadog."                           | Reject vendor coupling, accept payload risk       | The plan says Slate exposes metrics, not a vendor client. Rendering-strategy metrics already exist as a callback payload in package tests.                                                                                                                                                                                  | Keep metrics opt-in and vendor-neutral; pass 9 must check payload stability and overhead.                                                                            |
| "This is too many gates for one `ralph` run."                                        | Accept                                            | The TDD slice order already splits proof vertically. A single implementation pass would either sprawl or fake coverage.                                                                                                                                                                                                     | `ralph` should execute bounded slices under this plan, starting with shared percentile artifacts or one benchmark family, not the whole lane.                        |

## High-Risk Deliberate Pass

Status: complete.

Skills applied:

- `high-risk-deliberate-pass`
- `slate-ralplan`
- `steelman-pass`
- `performance`
- `performance-oracle`

Evidence used:

- `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx:86-96` exposes
  `renderingStrategy`, `renderingStrategyMetrics`, and
  `onRenderingStrategyMetrics` as public React props.
- `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx:117-145`
  defines the current public rendering-strategy metrics payload.
- `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx:248-278`
  emits metrics from a layout effect via a queued microtask.
- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:1384-1449`
  owns shell and virtualized option normalization.
- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:1674-1754`
  computes cohort, mounted/pending counts, effective strategy, and
  `nativeSurfaceComplete`.
- `.tmp/slate-v2/docs/walkthroughs/09-performance.md:73-104` documents staged as
  the safe large-document default, shell as aggressive mounting control, and
  virtualized rendering as experimental.
- `.tmp/slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx:1204-1238`
  proves shell interaction does not promote during composition.
- `.tmp/slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts:2058-2157`
  proves shell-backed paste and copy user paths in the browser.
- `.tmp/slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts:2159-2238`
  proves shell-backed selection bookmarks rebase through remote text
  operations.
- `.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts:114-198`
  proves remote replay metadata and history skip behavior.
- `.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts:200-298`
  proves `replace_children` paste replay and range-delete history batching.
- `.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts:300-390`
  proves bookmarks and runtime ids rebase or null through remote operations.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:81-89` keeps the relevant
  performance rows below `Fixes`.

### High-Risk Trigger Table

| Risk                                                                          | Blast radius                                                                                            | Pre-mortem                                                                                                                                                         | Expanded proof                                                                                                                                 | Remediation                                                                                                                        | Verdict                    |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Public metrics payload grows into a vendor API or hot render cost.            | `slate-react` public props, metric types, docs, package tests, product dashboards.                      | Products couple to unstable fields; callback fires too often; raw Slate accidentally ships Datadog-shaped policy.                                                  | Package contract test for additive fields, benchmark overhead row, docs showing vendor-neutral payload only.                                   | Add fields behind existing optional callback; no vendor client; split payload changes from benchmark thresholds.                   | Keep, additive only.       |
| Shell/virtualized rendering changes editor-native behavior.                   | `Editable` API, DOM coverage, selection import/export, clipboard, IME, accessibility, docs examples.    | Product enables shell by default, browser find misses hidden content, IME promotion corrupts text, copy/paste silently drops far content.                          | Package rows for shell selection/composition plus browser rows for paste/copy/select; add accessibility/browser-find rows before broad claims. | Keep `staged`/DOM-present as default; label shell/virtualized as explicit stress modes; materialize or mark model-backed behavior. | Keep with hard guardrails. |
| Issue promotion outruns browser proof.                                        | Coverage matrix, PR reference, release narrative, benchmark artifacts, browser stress tests.            | `Fixes #5992` or `Fixes #5945` lands from a headless benchmark and a user hits the original browser repro.                                                         | Exact browser stress row or maintainer-approved equivalence record, plus issue-size benchmark artifact.                                        | Keep `Improves` until issue sync pass; require explicit promotion diff.                                                            | Split from benchmark work. |
| Collaboration and shell-backed selection interact badly under remote updates. | Core replay, commit metadata, history skip, runtime ids, bookmarks, browser shell selection.            | Remote import rebases model ranges but shell bookmark/copy path stays stale; undo history captures remote operations; runtime ids leak into serialized operations. | Existing collab-history package rows plus browser shell bookmark remote-rebase row; add performance budget for remote update at scale.         | Keep collaboration proof separate from rendering proof; require remote-update benchmark before migration-performance claims.       | Keep, split owner.         |
| History memory retention is treated as latency.                               | `slate` history stacks, operation payloads, fragment retention, GC behavior, large paste/delete claims. | Undo/redo benchmarks pass while detached nodes or large fragments remain retained; `#3752` gets over-claimed.                                                      | Current-only memory benchmark with heap delta, retained operation payload count, retained editor object count, fragment size, and GC notes.    | Keep `#3752` as `Related` until memory evidence exists; do not bundle with transaction latency.                                    | Split owner.               |
| Percentile release thresholds become noisy local theater.                     | Shared benchmark helpers, artifacts, CI/release gates, docs thresholds.                                 | p95/p99 gates flap across machines; old/new comparison uses different fixtures; local targets become fake release law.                                             | Add percentile output first, collect repeat variance, compare current and legacy with same fixture, then decide enforceable thresholds.        | Calibrate before hard failure gates; use thresholds as review evidence until variance is known.                                    | Revise threshold wording.  |
| One `ralph` tries to execute every performance row.                           | All benchmark families, package tests, Playwright rows, ledgers.                                        | Implementation becomes a kitchen-sink patch nobody can review; failures are impossible to attribute.                                                               | One vertical slice per proof family, with focused command and plan delta after each slice.                                                     | First slice should be shared percentile artifacts or one benchmark family, not all rows.                                           | Split execution.           |

### Bounded Ralph Slice Decisions

| Slice                             | Scope                                                                   | Allowed?       | Reason                                                                    |
| --------------------------------- | ----------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------- |
| Shared percentile artifacts       | Extend shared benchmark summary helpers and one core/React caller pair. | Yes, first.    | It de-risks every later benchmark without touching editor behavior.       |
| Core transaction / `#6038`        | Op-family tags and percentile artifact rows.                            | Yes, separate. | Headless core owner, focused verification.                                |
| React rerender breadth            | Selector/depth/leaf/subscriber artifact rows.                           | Yes, separate. | React hot path; failures should not mix with clipboard or shell behavior. |
| Rendering strategy behavior       | Staged/shell/virtualized metrics plus browser native-behavior rows.     | Yes, separate. | Public API and browser behavior risk deserve their own review.            |
| Clipboard large payload           | Existing benchmark family plus browser stress proof.                    | Yes, separate. | This is the only route toward `#5945/#5992/#4056` claim promotion.        |
| Safari backward selection         | WebKit/Safari-focused browser row.                                      | Yes, separate. | New proof owner; do not hide it inside generic selection work.            |
| History retained memory           | Current-only memory benchmark.                                          | Yes, separate. | Memory-retention owner, not latency owner.                                |
| All performance rows in one patch | Everything above.                                                       | No.            | That would be review poison and almost certainly dishonest.               |

## Revision Pass

Status: complete.

### Revised Execution Guidance

First `ralph` slice:

1. Implement shared percentile artifacts only.
2. Extend `scripts/benchmarks/shared/stats.mjs` and
   `scripts/benchmarks/shared/react-benchmark.tsx`.
3. Update one core benchmark and one React benchmark caller enough to prove the
   shared artifact shape.
4. Run one focused core benchmark and one focused React benchmark from
   `/Users/zbeyens/git/slate-v2`.
5. Do not change rendering strategy behavior, browser tests, issue claims, or
   ledgers in that first slice unless the benchmark helper change forces it.

Hard split rules for later `ralph` runs:

- Core transaction thresholds are separate from React rerender breadth.
- React rerender breadth is separate from projection/decorations churn.
- Rendering strategy behavior is separate from clipboard stress proof.
- Clipboard stress proof is separate from issue-claim promotion.
- Safari backward selection is a dedicated WebKit/Safari browser row.
- History retained memory is a current-only memory benchmark, not a latency
  benchmark.
- Collaboration/remote-update performance is separate from shell rendering
  behavior, even when both touch bookmarks.

### Revised Claim-Promotion Rules

- No `Fixes #6038` until op-family percentile artifacts have accepted
  thresholds.
- No `Fixes #5945`, `Fixes #5992`, or `Fixes #4056` from headless benchmarks
  alone. Promotion needs browser stress proof or an explicit maintainer
  equivalence record.
- No `Fixes #3752` until retained memory is measured with heap and retained
  payload evidence.
- No large-document superiority claim unless the same cohort is compared against
  legacy chunking-on.
- `#5131` remains `Not claimed` while broad hooks remain broad by contract.

### Rewritten Weak Rows

- "RUM contract" means optional Slate metrics payload only, not Datadog or any
  vendor integration.
- "Virtualized" means experimental stress mode only, not the default answer to
  large documents.
- "Threshold" means calibrated review gate until repeat variance proves it can
  be a release failure gate.
- "Migration substrate" means commit/operation/history/remote-update behavior
  rows, not current Plate or slate-yjs API compatibility.

## Issue Sync Pass

Status: complete.

Evidence used:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md` current fixed claims,
  related matrix, and macro sync sections.
- `docs/slate-v2/ledgers/fork-issue-dossier.md` current long-form performance
  rows and the appended macro sync section.
- `docs/slate-v2/references/pr-description.md` existing performance prose for
  `#5945`, `#4056`, and `#5992`.
- `docs/slate-issues/gitcrawl-live-open-ledger.md` live-archive rows for the
  performance and scalability issue set.
- `docs/slate-issues/benchmark-candidate-map.md` benchmark-ready primary rows.

### Sync Decisions

| Surface                                          | Pass 11 action                                                    | Claim decision                                                                                                                               |
| ------------------------------------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/slate-v2/ledgers/issue-coverage-matrix.md` | Added `Performance/Scalability Macro Planning Sync - 2026-05-08`. | No new fixed claims and no new improved claims. Existing explicit rows stay authoritative.                                                   |
| `docs/slate-v2/ledgers/fork-issue-dossier.md`    | Added a matching macro planning sync section.                     | No new long-form per-issue closure sections because no issue claim changed in this planning pass.                                            |
| `docs/slate-v2/references/pr-description.md`     | No edit.                                                          | Existing `#5945`, `#4056`, and `#5992` text remains exact; adding more PR prose now would be claim noise.                                    |
| `docs/slate-issues/gitcrawl-live-open-ledger.md` | No edit.                                                          | This file carries live gitcrawl fields only; planning classifications live in the matrix, dossier, and plan.                                 |
| `docs/slate-issues/benchmark-candidate-map.md`   | No edit.                                                          | It already owns primary benchmark-ready rows; proof-route backlog rows should be added only when execution creates those benchmark families. |

### Exact Rows Held Conservative

| Row group                           | Issues                                                                                                              | Final pass-11 status                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Existing explicit matrix rows       | `#6038`, `#3656`, `#4141`, `#5131`, `#3430`, `#5945`, `#4056`, `#5992`, `#3752`, `#2195`, `#2405`, `#4483`, `#2051` | Preserve current `Improves`, `Related`, and `Not claimed` statuses.              |
| Matrix macro / future-proof guards  | `#5433`, `#5420`, `#5274`, `#4317`, `#3354`, `#3926`, `#5697`                                                       | Keep as future proof pressure or guard rows; no PR auto-close text.              |
| Performance proof-route backlog     | `#2733`, `#2669`, `#790`, `#5216`, `#5592`, `#4202`, `#4210`, `#3748`, `#5349`, `#4025`                             | Related, proof-needed, or needs-repro until an execution slice adds exact proof. |
| Policy/API/accessibility non-claims | `#2465`, `#2564`, `#3177`, `#3892`, `#2572`                                                                         | Keep out of fixed/improved performance language.                                 |

### Pass 11 Delta

- Synced the performance plan into the coverage matrix and fork dossier without
  promoting any issue.
- Preserved the PR reference as-is because no implementation claim changed.
- Confirmed the live gitcrawl ledger should not receive manual classification
  columns.
- Made the closure pass the next required pass.

## Closure Pass

Status: complete.

Closure verdict: accepted for user review before `ralph`.

Evidence checked:

- pass schedule: passes 1 through 11 are complete and pass 12 is the current
  closure pass;
- score history: current score is `0.95`, above the `0.92` target;
- issue sync: coverage matrix and fork dossier both contain
  `Performance/Scalability Macro Planning Sync - 2026-05-08`;
- PR reference: unchanged by design because no implementation claim changed;
- live issue ledger: unchanged by design because it carries live gitcrawl fields
  rather than manual planning classifications;
- execution bridge: first `ralph` slice remains shared percentile artifacts
  only.

Remaining planning owners: none.

Implementation owners intentionally left for `ralph`:

- shared percentile artifact helpers;
- core transaction thresholds;
- React rerender breadth thresholds;
- projection/decorations churn;
- large-document rendering strategy behavior;
- clipboard browser stress;
- Safari backward selection;
- history retained memory.

These are not closure blockers for the planning lane. They are execution slices.

Slate v2 verification decision:

- Not run in this closure pass.
- Reason: this skill changed planning, matrix, dossier, and completion-state
  artifacts only. It did not patch `.tmp/slate-v2` source and does not promote any
  issue to `Fixes`.
- Later `ralph` implementation must run the focused `/Users/zbeyens/git/slate-v2`
  commands named in the verification policy for the touched owner.

### Pass 12 Delta

- Accepted the plan for user review.
- Moved the completion state to `done`.
- Preserved the first `ralph` slice as shared percentile artifacts only.
- Preserved all conservative issue-claim boundaries.

## Pass Schedule

Each activation may complete at most one scheduled pass unless the user
explicitly allows batching.

| Pass                                    | Owner                                                              | Status   | Exit condition                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------- |
| 1. Current-state read and initial score | `slate-ralplan`                                                    | complete | Plan scaffold, source map, score, completion state, next pass.                                                   |
| 2. Related issue discovery              | `clawsweeper`                                                      | complete | Related performance issues grouped from local ledger and gitcrawl archive; no implementation.                    |
| 3. Full issue-ledger accounting         | `slate-ralplan`                                                    | complete | Claim table updated for `Fixes`/`Improves`/`Related`/`Not claimed`, with proof owners.                           |
| 4. Intent and boundary hardening        | `intent-boundary-pass`                                             | complete | Non-goals, claim boundaries, degradation boundaries, and user decision points are explicit.                      |
| 5. Research refresh                     | `slate-ralplan`                                                    | complete | Local Lexical/ProseMirror/Tiptap/legacy Slate performance mechanisms refreshed only where they affect this lane. |
| 6. Performance architecture pressure    | `performance`, `performance-oracle`, `vercel-react-best-practices` | complete | Cohorts, repeated-unit budgets, p95/p99 rows, memory tags, native behavior rows, and RUM tags are in the plan.   |
| 7. Test strategy pass                   | `tdd`                                                              | complete | Behavior-facing tests/benchmarks are selected by public contract, not internals.                                 |
| 8. Maintainer objection pass            | `slate-ralplan`                                                    | complete | Objection ledger has accepted, rejected, or deferred answers with evidence.                                      |
| 9. High-risk deliberate pass            | `slate-ralplan`                                                    | complete | Public API, browser behavior, rendering strategy, and migration risks are pressure-tested.                       |
| 10. Revision pass                       | `slate-ralplan`                                                    | complete | Plan deltas recorded; weak rows strengthened or explicitly cut.                                                  |
| 11. Issue sync pass                     | `clawsweeper`                                                      | complete | Active ledger, fork dossier, coverage matrix, and PR reference changes are named if needed.                      |
| 12. Closure pass                        | `slate-ralplan`                                                    | complete | Score `>= 0.92`; completion can move to `done` for user review before `ralph`.                                   |

## Required Next Pass

None. The planning lane is done.

Next user-visible action:

- review this plan;
- then run `ralph` against it when ready to execute the first implementation
  slice.

## Verification Policy

Planning checks in `plate-2`:

- `pnpm lint:fix`
- `bun run completion-check -- --file .tmp/completion-checks/slate-v2-performance-scalability-slate-issues-ralplan.md`

Pass 1 verification:

- `pnpm lint:fix` passed.
- `bun run completion-check -- --file .tmp/completion-checks/slate-v2-performance-scalability-slate-issues-ralplan.md`
  failed as expected because top-level status is `pending`.

Pass 2 verification:

- `pnpm lint:fix` passed.
- `bun run completion-check -- --file .tmp/completion-checks/slate-v2-performance-scalability-slate-issues-ralplan.md`
  failed as expected because top-level status is `pending`.

Pass 3 verification:

- `pnpm lint:fix` passed.
- `bun run completion-check -- --file .tmp/completion-checks/slate-v2-performance-scalability-slate-issues-ralplan.md`
  failed as expected because top-level status is `pending`.

Pass 4 verification:

- `pnpm lint:fix` passed.
- `bun run completion-check -- --file .tmp/completion-checks/slate-v2-performance-scalability-slate-issues-ralplan.md`
  failed as expected because top-level status is `pending`.

Pass 5 verification:

- `pnpm lint:fix` passed.
- `bun run completion-check -- --file .tmp/completion-checks/slate-v2-performance-scalability-slate-issues-ralplan.md`
  failed as expected because top-level status is `pending`.

Pass 6 verification:

- `pnpm lint:fix` passed.
- `bun run completion-check -- --file .tmp/completion-checks/slate-v2-performance-scalability-slate-issues-ralplan.md`
  failed as expected because top-level status is `pending`.

Pass 7 verification:

- `pnpm lint:fix` passed.
- `bun run completion-check -- --file .tmp/completion-checks/slate-v2-performance-scalability-slate-issues-ralplan.md`
  failed as expected because top-level status is `pending`.

Pass 8 verification:

- `pnpm lint:fix` passed.
- `bun run completion-check -- --file .tmp/completion-checks/slate-v2-performance-scalability-slate-issues-ralplan.md`
  failed as expected because top-level status is `pending`.

Pass 9 verification:

- `pnpm lint:fix` passed.
- `bun run completion-check -- --file .tmp/completion-checks/slate-v2-performance-scalability-slate-issues-ralplan.md`
  failed as expected because top-level status is `pending`.

Pass 10 verification:

- `pnpm lint:fix` passed.
- `bun run completion-check -- --file .tmp/completion-checks/slate-v2-performance-scalability-slate-issues-ralplan.md`
  failed as expected because top-level status is `pending`.

Pass 11 verification:

- `pnpm lint:fix` passed.
- `bun run completion-check -- --file .tmp/completion-checks/slate-v2-performance-scalability-slate-issues-ralplan.md`
  failed as expected because top-level status is `pending`.

Pass 12 verification:

- `pnpm lint:fix` passed.
- `bun run completion-check -- --file .tmp/completion-checks/slate-v2-performance-scalability-slate-issues-ralplan.md`
  passed because top-level status is `done`.

Slate v2 verification for later execution or closure:

- run in `/Users/zbeyens/git/slate-v2`, not `plate-2`;
- focused commands first:
  - `bun run bench:slate:6038:local`
  - `bun run bench:slate:5945:local`
  - `bun run bench:react:rerender-breadth:local`
  - `bun run bench:react:huge-document-overlays:local`
  - `bun run bench:react:huge-document:legacy-compare:local`
  - `bun run bench:core:huge-document:compare:local`
  - `bun run bench:history:compare:local`
  - matching package/browser tests by touched owner
- broad gate only when a closure/release-quality claim is being made:
  - `bun check`
  - `bun check:full` when browser sweep is required

## Plan Deltas From This Pass

- Created the performance/scalability lane as its own `slate-issues` ralplan.
- Kept the score low enough to prevent premature execution.
- Split performance into owner families instead of one broad plan.
- Recorded existing `Improves`/`Related`/`Not claimed` rows before any new claim.
- Made ClawSweeper related-issue discovery the next required pass.
- Preserved `pending` completion semantics because a safe next move exists.

Pass 2:

- Completed ClawSweeper archive-first related issue discovery.
- Added performance-primary watch rows and adjacent guard rows.
- Kept all findings in the plan; no implementation or issue-claim promotion.
- Made full issue-ledger accounting the next required pass.

Pass 3:

- Completed full issue-ledger accounting by performance owner family.
- Preserved all non-claims and `Fixes` blockers.
- Identified coverage matrix and dossier sync needs for the later issue sync
  pass.
- Made intent and boundary hardening the next required pass.

Pass 4:

- Completed intent and boundary hardening.
- Added exact claim promotion rules.
- Locked rendering strategy boundaries around native-first defaults and opt-in
  aggressive modes.
- Made research refresh the next required pass.

Pass 5:

- Completed local external editor performance research refresh.
- Added ecosystem strategy synthesis with steal/reject/diverge decisions.
- Strengthened dirty-scope, selector-local, decoration/projection,
  composition-safe DOM update, memory-retention, and collaboration mapping
  rows.
- Made performance architecture pressure the next required pass.

Pass 6:

- Completed performance architecture pressure.
- Added cohort release gates, repeated-unit budgets, benchmark threshold
  decisions, native-behavior matrix, React 19.2 policy, performance-oracle
  complexity gates, and RUM contract.
- Kept existing benchmark family architecture and named only decision-changing
  new proof families.
- Made test strategy the next required pass.

Pass 7:

- Completed test strategy.
- Selected exact benchmark/test owners for every pass-6 performance gate.
- Kept existing benchmark families as the default path and justified only two
  new proof owners.
- Mapped proof rows to public behavior, issue claims, closure blockers, and
  later verification commands.
- Made maintainer objection pass the next required pass.

Pass 8:

- Completed maintainer objection pass.
- Accepted benchmark credibility, browser/user-path, broad-hook, collaboration,
  legacy chunking, and bounded-execution objections into plan law.
- Rejected virtualization as a default answer while preserving it as explicit
  stress-mode architecture.
- Kept new proof owners limited to Safari backward selection and history
  retained memory.
- Raised the score to `0.92` but kept status `pending` because high-risk,
  revision, issue-sync, and closure passes remain.
- Made high-risk deliberate pass the next required pass.

Pass 9:

- Completed high-risk deliberate pass.
- Recorded public metrics, shell/virtualized behavior, issue promotion,
  collaboration/remote update, history memory, threshold noise, and
  kitchen-sink execution as explicit risks.
- Split execution into bounded `ralph` slices.
- Kept metrics additive, vendor-neutral, and opt-in.
- Kept `staged`/DOM-present as the safe default and shell/virtualized as
  explicit stress modes.
- Made revision pass the next required pass.

Pass 10:

- Completed revision pass.
- Added first `ralph` slice guidance: shared percentile artifacts only.
- Added hard split rules so later implementation cannot turn into one giant
  performance patch.
- Rewrote claim-promotion rules around browser proof, retained-memory proof,
  legacy chunking comparisons, and broad-hook non-claims.
- Reframed RUM, virtualization, thresholds, and migration substrate rows to
  prevent over-claiming.
- Made issue sync pass the next required pass.

Pass 11:

- Completed issue sync pass.
- Added performance/scalability macro planning sync to the coverage matrix and
  fork dossier.
- Preserved the PR reference as-is because no implementation claim changed.
- Preserved the live gitcrawl ledger as a live field ledger, not a manual
  classification file.
- Made closure pass the next required pass.

Pass 12:

- Completed closure pass.
- Accepted the plan for user review before `ralph`.
- Set completion state to `done`.
- Preserved the first implementation slice and verification policy.

## Current State

`done`.

Passes 1 through 12 are complete. The planning lane is ready for user review.

Next move: run `ralph` only when the user wants implementation.
