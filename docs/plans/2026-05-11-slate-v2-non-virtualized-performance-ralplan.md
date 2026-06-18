# Slate v2 Non-Virtualized Performance Ralplan

Date: 2026-05-11

Status: `done`

Owner: `slate-ralplan`

Completion:
`active goal state`

## Verdict

No, not absolute best yet.

Slate v2 has the right performance architecture and the default non-virtualized
`auto` path is now strong enough to keep. Do not rewrite the kernel. Do not
revive legacy child-count chunking as the main story. Do not promote
virtualization; it stays paused / experimental.

The hard truth:

- default `auto` beats legacy chunking-on on the fresh 5,000-block
  current-vs-legacy means for the main direct compare lanes;
- rerender breadth is excellent and no longer the primary blocker;
- explicit `shell` is not the best non-virtualized answer for the current
  steady selection/promote lanes;
- raw staged / DOM-present still has middle-selection and promote tails that
  are not clean enough to call field-best;
- current huge-document proof is still mostly jsdom/direct-model proof, not
  browser INP, trace, layout/paint, native clipboard, mobile, IME, or real
  Safari proof;
- the huge-document compare still emits mean/median/min/max but not p75/p95/p99,
  so "absolute best" would be bullshit until the artifact quality catches up.

Current answer:

> Best current default architecture: yes.
> Absolute best non-virtualized performance proof: no.
> Next work: harden benchmark artifacts, add real browser trace/interaction
> proof, then fix the staged selection/promote tails.

## Intent Boundary

| Field                | Decision                                                                                                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent               | Decide whether Slate v2 has the absolute best performance possible without the paused / experimental virtualization path, and write the execution-grade plan for the remaining work.                                          |
| Desired outcome      | A later `ralph` pass can edit benchmark scripts and runtime code without reopening the whole architecture argument.                                                                                                           |
| In scope             | Slate v2 core and `slate-react` non-virtualized performance, default `auto`, staged / DOM-present, explicit shell, rerender breadth, large-document compare, native-behavior proof, memory/DOM tags, issue-ledger accounting. |
| Non-goals            | Implementing from `slate-ralplan`, stabilizing virtualization, broad GitHub issue rediscovery, product-specific Plate APIs, claiming current Slate v2 closes every upstream performance issue.                                |
| Decision boundary    | A mode can be fast but still not be the default if it changes browser-native behavior, accessibility, clipboard, selection, IME, mobile, or collaboration semantics.                                                          |
| User decision needed | None. The planning gate is closed; execution should run through `ralph`.                                                                                                                                                      |

## Current Source Read

| Surface                    | Current read                                                                                                                                            | Verdict                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Selector substrate         | `packages/slate-react/src/hooks/use-generic-selector.tsx` uses `useSyncExternalStore` and preserves equality filtering plus error replay. | Keep. The previous biggest React substrate concern is handled.             |
| Selector fanout            | `useEditorSelectorContext` indexes runtime listeners by runtime id and fans out through `affectedNodeRuntimeIds` / `nodeImpactRuntimeIds`.              | Keep. This is the right direction.                                         |
| Mounted node rendering     | `useMountedNodeRenderSelector` can skip synced text render for text / selection ops.                                                                    | Keep, but benchmark selector invocation counts, not only rerenders.        |
| Default rendering strategy | `EditableTextBlocks` uses grouped staged mounting with `ROOT_GROUP_SIZE = 16`, active group first, background mount batches, and stale group tracking.  | Keep as default baseline.                                                  |
| Native completion          | Default/staged records `interactiveReady` separately from `nativeSurfaceComplete`.                                                                      | Keep, but make this a release gate with p95/p99 and browser behavior rows. |
| DOM text sync              | `dom-text-sync.ts` opts out on empty text, projections, custom leaf, custom segment, and custom text.                                                   | Keep. Fast path is guarded.                                                |
| Virtualized strategy       | `create-segment-plan.ts` keeps `{ type: 'virtualized' }` object-only and experimental.                                                                  | Excluded from this plan. Do not use it to satisfy this performance goal.   |
| Explicit shell             | Shell is non-virtualized but degrades DOM presence / native behavior. Fresh numbers show it loses important steady selection/promote lanes.             | Keep explicit only. Do not make it the default performance answer.         |

## Fresh Benchmark Evidence

All commands ran from `/Users/zbeyens/git/slate-v2`.

### Rerender Breadth

Command:

```bash
bun run bench:react:rerender-breadth:local
```

Result: pass.

Key rows:

| Lane                       | Result                                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| selection breadth          | broad renders `0`, left block renders `0`, right block renders `0`, selection p95 `5.45ms`            |
| many-leaf edit             | block renders `0`, sibling leaf renders `0`, edited leaf renders `1`, edit p95 `4.14ms`               |
| deep ancestor edit         | ancestor render events `0`, sibling branch/leaf renders `0`, deep leaf renders `1`, edit p95 `3.86ms` |
| source-scoped invalidation | unrelated recomputes stay `0` for text, selection, and external lanes                                 |

Conclusion: React invalidation breadth is not the remaining P0. Stop blaming
"rerenders" generically.

### Default And Staged Direct Compare

Command:

```bash
REACT_HUGE_COMPARE_SKIP_BUILD=1 \
REACT_HUGE_COMPARE_DISPOSE_DELAY_MS=0 \
REACT_HUGE_COMPARE_SURFACES=v2DefaultRenderAuto,v2DomPresent \
REACT_HUGE_COMPARE_BLOCKS=5000 \
REACT_HUGE_COMPARE_ITERATIONS=5 \
REACT_HUGE_COMPARE_TYPE_OPS=10 \
bun run bench:react:huge-document:legacy-compare:local
```

Result: pass.

`v2DefaultRenderAuto` versus legacy chunking-on:

| Lane                            | legacy chunk-on mean | v2 default `auto` mean | Verdict                     |
| ------------------------------- | -------------------: | ---------------------: | --------------------------- |
| interactive ready               |           `318.40ms` |              `23.20ms` | v2 wins hard                |
| select all                      |             `0.95ms` |               `0.26ms` | v2 wins                     |
| start block type                |            `52.04ms` |              `14.23ms` | v2 wins                     |
| start select then type          |            `47.87ms` |              `12.67ms` | v2 wins                     |
| middle block type               |            `42.73ms` |              `12.89ms` | v2 wins                     |
| middle select then type         |            `37.87ms` |              `34.41ms` | v2 wins narrowly            |
| middle promote then type        |            `38.64ms` |              `37.72ms` | v2 wins barely              |
| replace full document with text |           `131.03ms` |               `6.77ms` | v2 wins hard                |
| insert fragment full document   |           `118.38ms` |               `5.47ms` | v2 wins hard                |
| native surface complete         |                  n/a |            `1534.94ms` | must be budgeted separately |

`v2DomPresent` / staged versus legacy chunking-on:

| Lane                            | legacy chunk-on mean | v2 staged mean | Verdict                     |
| ------------------------------- | -------------------: | -------------: | --------------------------- |
| interactive ready               |           `318.40ms` |      `22.81ms` | v2 wins hard                |
| select all                      |             `0.95ms` |       `0.22ms` | v2 wins                     |
| start block type                |            `52.04ms` |      `10.54ms` | v2 wins                     |
| start select then type          |            `47.87ms` |      `16.82ms` | v2 wins                     |
| middle block type               |            `42.73ms` |       `9.86ms` | v2 wins                     |
| middle select then type         |            `37.87ms` |      `49.50ms` | red                         |
| middle promote then type        |            `38.64ms` |      `46.68ms` | red                         |
| replace full document with text |           `131.03ms` |       `7.43ms` | v2 wins hard                |
| insert fragment full document   |           `118.38ms` |       `5.58ms` | v2 wins hard                |
| native surface complete         |                  n/a |    `1647.77ms` | must be budgeted separately |

Conclusion: default `auto` is green enough to keep. Staged / DOM-present is not
clean enough to claim "absolute best" because the middle select/promote lanes
still lose to chunking-on.

### Split Selection Direct Compare

Command:

```bash
REACT_HUGE_COMPARE_SKIP_BUILD=1 \
REACT_HUGE_COMPARE_DISPOSE_DELAY_MS=0 \
REACT_HUGE_COMPARE_SPLIT_SELECTION=1 \
REACT_HUGE_COMPARE_SURFACES=v2DefaultRenderAuto,v2DomPresent \
REACT_HUGE_COMPARE_BLOCKS=5000 \
REACT_HUGE_COMPARE_ITERATIONS=5 \
REACT_HUGE_COMPARE_TYPE_OPS=10 \
bun run bench:react:huge-document:legacy-compare:local
```

Result: pass.

Important owner split:

| Lane                     | v2 default `auto` delta vs chunk-on | v2 staged delta vs chunk-on | Read                                                     |
| ------------------------ | ----------------------------------: | --------------------------: | -------------------------------------------------------- |
| start select             |                           `+3.74ms` |                   `+0.11ms` | default still pays more selection setup than chunking-on |
| middle select            |                           `+8.50ms` |                   `+8.85ms` | both pay more far selection setup                        |
| middle type after select |                          `-14.65ms` |                  `-10.14ms` | follow-up typing is good                                 |
| middle select then type  |                           `-7.48ms` |                   `-2.57ms` | combined lane is acceptable but narrow                   |
| middle promote then type |                           `-4.87ms` |                  `+12.74ms` | staged promotion is the real red tail                    |

The split run also exposed outlier noise: staged `startBlockTypeAfterSelectMs`
had samples at `287.26ms` and `312.95ms` even though its combined
`startBlockSelectThenTypeMs` lane stayed green. That is exactly why this plan
requires p95/p99 artifacts and trace tags before any stronger claim.

### Explicit Shell Direct Compare

Command:

```bash
REACT_HUGE_COMPARE_SKIP_BUILD=1 \
REACT_HUGE_COMPARE_DISPOSE_DELAY_MS=0 \
REACT_HUGE_COMPARE_SURFACES=v2ShellExplicitRadius0,v2ShellExplicitRadius1 \
REACT_HUGE_COMPARE_BLOCKS=5000 \
REACT_HUGE_COMPARE_ITERATIONS=5 \
REACT_HUGE_COMPARE_TYPE_OPS=10 \
bun run bench:react:huge-document:legacy-compare:local
```

Result: pass.

Shell radius 0 versus legacy chunking-on:

| Lane                            | legacy chunk-on mean | shell r0 mean | Verdict |
| ------------------------------- | -------------------: | ------------: | ------- |
| ready                           |           `358.80ms` |     `42.96ms` | v2 wins |
| start block type                |            `39.95ms` |     `21.28ms` | v2 wins |
| middle block type               |            `44.60ms` |     `10.22ms` | v2 wins |
| middle select then type         |            `38.79ms` |     `58.63ms` | red     |
| middle promote then type        |            `42.57ms` |     `68.19ms` | red     |
| replace full document with text |           `116.52ms` |      `7.31ms` | v2 wins |
| insert fragment full document   |           `116.56ms` |     `10.03ms` | v2 wins |

Shell radius 1 versus legacy chunking-on:

| Lane                            | legacy chunk-on mean | shell r1 mean | Verdict |
| ------------------------------- | -------------------: | ------------: | ------- |
| ready                           |           `358.80ms` |     `50.45ms` | v2 wins |
| start block type                |            `39.95ms` |     `19.54ms` | v2 wins |
| middle block type               |            `44.60ms` |     `13.81ms` | v2 wins |
| middle select then type         |            `38.79ms` |     `90.08ms` | red     |
| middle promote then type        |            `42.57ms` |     `84.33ms` | red     |
| replace full document with text |           `116.52ms` |      `9.26ms` | v2 wins |
| insert fragment full document   |           `116.56ms` |     `10.94ms` | v2 wins |

Conclusion: shell is an explicit stress/degradation mode. It is not the best
non-virtualized default, and radius 1 cannot be defended as a pure performance
default from these fresh rows. If radius 1 stays, defend it as editing-corridor
UX, not raw speed.

## Scorecard

| Axis                                 |  Score | Reason                                                                                                                                                 |
| ------------------------------------ | -----: | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Default non-virtualized architecture | `0.93` | `auto` beats legacy chunking-on on the fresh direct means while preserving staged native completion accounting.                                        |
| React runtime locality               | `0.96` | Fresh breadth benchmark shows zero broad/sibling/ancestor rerenders and source-scoped invalidation.                                                    |
| Staged / DOM-present tail latency    | `0.76` | Middle select/promote lanes still lose or nearly lose; split lanes show far selection/setup cost remains.                                              |
| Shell as non-virtualized perf option | `0.63` | Fast startup and full-doc ops, bad middle select/promote, degraded native behavior. Explicit only.                                                     |
| Benchmark artifact quality           | `0.70` | Fresh commands pass, but huge compare lacks p75/p95/p99 and overwrites artifacts by run.                                                               |
| Browser/user-path proof              | `0.78` | Chromium native-keyboard selected typing proof now exists with DOM/heap/long-task tags, but copy/paste/select-all, mobile/IME, and Safari remain open. |
| Memory/DOM pressure proof            | `0.72` | Trace records groups/native completion/stale count, but heap/DOM/listener/component tags are not first-class artifact rows.                            |
| Plan readiness                       | `0.94` | Evidence is current, owners are narrow, and the next `ralph` slices are executable.                                                                    |

Planning gate score: `0.94`.

Current performance-confidence score: `0.91`.

This plan can close. The performance program cannot.

## Keep

| Decision                                             | Why                                                                                                                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Keep default `auto` as the main non-virtualized path | It is the strongest current balance: fast interactive ready, good direct typing, fast full-document operations, and no shell-native behavior downgrade by default. |
| Keep staged readiness split                          | `interactiveReady` and `nativeSurfaceComplete` are different claims. Pretending otherwise would be dishonest.                                                      |
| Keep runtime-id selector fanout                      | The fresh breadth lane proves locality.                                                                                                                            |
| Keep `useSyncExternalStore` selector substrate       | React-native external-store substrate is now in place.                                                                                                             |
| Keep DOM text sync as guarded fast path              | It is fast only where safe and falls back for custom/projection/IME-sensitive surfaces.                                                                            |
| Keep shell explicit                                  | It is useful for stress scenarios but not safe or fast enough to be default.                                                                                       |
| Keep virtualization paused / experimental            | It is outside this goal and remains object-only experimental.                                                                                                      |

## Rewrite Or Tighten

| Area                         | Decision                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Huge compare artifact schema | Add p75/p95/p99 and preserve per-run artifacts instead of silently overwriting the same JSON path.                                         |
| Staged selection/promote     | Fix or classify middle selection setup and promotion cost before "absolute best" claims.                                                   |
| Shell radius policy          | Re-open radius 0 versus radius 1 as a current benchmark decision; radius 1 is not currently faster on middle select/promote.               |
| Browser trace proof          | Add real browser event-to-update and event-to-paint rows; jsdom cannot close native browser claims.                                        |
| Memory/DOM tags              | Emit heap, DOM nodes, listener count, mounted group count, pending group count, stale group count, and background completion in artifacts. |
| Production observability     | Make `onRenderingStrategyMetrics` / RUM guidance a release contract, not a nice extra.                                                     |

## Cut

| Candidate                              | Verdict                                                       |
| -------------------------------------- | ------------------------------------------------------------- |
| "Virtualized proves performance"       | Cut from this lane. User excluded it, and it is experimental. |
| "Shell is the default perf answer"     | Cut. Fresh radius 0/1 rows lose steady middle select/promote. |
| "Mean-only benchmark closure"          | Cut. Mean-only is not absolute-best proof.                    |
| "Rerender breadth is the remaining P0" | Cut. The fresh rerender benchmark says no.                    |
| Broad GitHub rediscovery               | Cut. Cached ledgers already account for this issue surface.   |

## Execution Plan For Ralph

### Slice 1: Benchmark Artifact Hardening

Owner:

- `benchmarks/slate-v2/donor/browser/react/huge-document-legacy-compare.mjs`
- `benchmarks/slate-v2/donor/shared/stats.mjs`
- `benchmarks/slate-v2/donor/shared/react-benchmark.tsx`

Goal:

Make huge-document evidence strong enough for release decisions.

Implementation:

1. Use the shared percentile helper for huge compare summaries.
2. Emit `p75`, `p95`, and `p99` for every lane.
3. Preserve artifacts per run by including surface set and split-selection mode
   in the filename or by writing a timestamped sidecar under `.tmp`.
4. Emit first-class trace tags:
   - DOM node count;
   - editable descendant count;
   - active event listener count and by-type counts;
   - process heap used;
   - mounted group count;
   - pending group count;
   - background chunk count;
   - native surface complete time;
   - stale group count;
   - rendering strategy type;
   - shell / staged / virtualized flags.
5. Keep `REACT_HUGE_COMPARE_SPLIT_SELECTION=1` as an explicit release-proof
   mode, not just a debugging option.

Acceptance:

```bash
cd /Users/zbeyens/git/slate-v2
REACT_HUGE_COMPARE_SKIP_BUILD=1 \
REACT_HUGE_COMPARE_DISPOSE_DELAY_MS=0 \
REACT_HUGE_COMPARE_SPLIT_SELECTION=1 \
REACT_HUGE_COMPARE_SURFACES=v2DefaultRenderAuto,v2DomPresent,v2ShellExplicitRadius0,v2ShellExplicitRadius1 \
REACT_HUGE_COMPARE_BLOCKS=5000 \
REACT_HUGE_COMPARE_ITERATIONS=5 \
REACT_HUGE_COMPARE_TYPE_OPS=10 \
bun run bench:react:huge-document:legacy-compare:local
```

Artifact must include p75/p95/p99 and trace tags for every selected surface.

### Slice 2: Default `auto` Release Gate

Owner:

- benchmark script above;
- `packages/slate-react/src/components/editable-text-blocks.tsx`;
- `packages/slate-react/src/editable/root-selector-sources.ts`.

Goal:

Turn current default `auto` evidence into a real release gate.

Gate:

At 5,000 blocks, default `auto` must beat legacy chunking-on at p95 or p99 for:

- interactive ready;
- select-all;
- start block type;
- start select then type;
- middle block type;
- middle select then type;
- middle promote then type;
- visible full-document text replacement;
- visible full-document fragment insertion.

Also record:

- `nativeSurfaceCompleteMs` p95/p99;
- `staleGroupCount = 0`;
- mounted group count at ready;
- pending group count at ready.

If p95/p99 exposes current mean-hidden tails, do not lower the bar. Fix the
tail.

### Slice 3: Staged Selection / Promote Tail Fix

Owner:

- `packages/slate-react/src/components/editable-text-blocks.tsx`
- `packages/slate-react/src/editable/root-selector-sources.ts`
- `packages/slate-react/src/editable/selection-controller.ts`
- DOM coverage materialization owners in `slate-dom/internal`.

Problem:

Fresh staged rows lose to legacy chunking-on on:

- `middleBlockSelectThenTypeMs`: `49.50ms` vs `37.87ms`;
- `middleBlockPromoteThenTypeMs`: `46.68ms` vs `38.64ms`;
- split middle selection setup: about `+8.85ms` versus chunking-on;
- split start type-after-select has large outliers.

Likely investigation points:

- target-range materialization cost;
- active group mounting and `startTransition` timing;
- selection import/export repair loops;
- background mounting contention;
- root group plan rebuilds;
- DOMCoverage boundary lookup and materialization path.

Acceptance:

```bash
cd /Users/zbeyens/git/slate-v2/packages/slate-react
bun test:vitest test/rendering-strategy-and-scroll.test.tsx test/projections-and-selection-contract.test.tsx
cd /Users/zbeyens/git/slate-v2
REACT_HUGE_COMPARE_SKIP_BUILD=1 \
REACT_HUGE_COMPARE_DISPOSE_DELAY_MS=0 \
REACT_HUGE_COMPARE_SPLIT_SELECTION=1 \
REACT_HUGE_COMPARE_SURFACES=v2DefaultRenderAuto,v2DomPresent \
REACT_HUGE_COMPARE_BLOCKS=5000 \
REACT_HUGE_COMPARE_ITERATIONS=5 \
REACT_HUGE_COMPARE_TYPE_OPS=10 \
bun run bench:react:huge-document:legacy-compare:local
```

`v2DomPresent` should beat legacy chunking-on for middle select+type and
promote+type at the chosen release percentile, or it must be explicitly
reclassified as diagnostic / non-default.

### Slice 4: Shell Policy Re-evaluation

Owner:

- `packages/slate-react/src/rendering-strategy/create-segment-plan.ts`
- `packages/slate-react/src/rendering-strategy/segment-shell.tsx`
- shell behavior tests.

Problem:

Fresh shell rows show:

- radius 0 loses `middleBlockSelectThenTypeMs` by `+19.84ms` and
  `middleBlockPromoteThenTypeMs` by `+25.62ms`;
- radius 1 loses `middleBlockSelectThenTypeMs` by `+51.29ms` and
  `middleBlockPromoteThenTypeMs` by `+41.76ms`;
- shell has no `nativeSurfaceCompleteMs` because far content is shell-backed.

Decision:

- keep shell explicit;
- do not use shell to justify the default performance claim;
- re-check radius 0 versus radius 1 before preserving radius 1 as the
  recommended shell default;
- if radius 1 stays, document it as corridor/UX policy, not raw performance.

Acceptance:

Shell docs and examples must state the degradation contract:

- browser find;
- screen-reader traversal;
- native selection;
- copy/paste;
- IME/composition;
- mobile touch selection;
- undo/history;
- collaboration;
- follow-up typing after materialization.

### Slice 5: Real Browser Interaction Trace Benchmark

Owner:

- new benchmark command in `benchmarks/slate-v2/donor/browser/react/**`;
- existing Playwright example fixture or a dedicated huge-document benchmark
  page.

Goal:

Close the biggest proof gap: jsdom/direct-model benchmarks are not browser INP.

Add a command shaped like:

```bash
bun run bench:react:huge-document:browser-trace:local
```

It should measure at least Chromium first, with WebKit/Safari as a separate
owner for `#5216`.

Rows:

- type;
- select;
- select then type;
- select-all;
- copy;
- paste;
- scroll to far group;
- click far group then type;
- materialize hidden content;
- model-beforeinput path;
- native-eligible input path where the browser can prove it;
- remote update if the fixture can drive it deterministically.

Metrics:

- event-to-update;
- event-to-paint;
- long tasks;
- React performance track / user timing marks where available;
- DOM node count;
- heap;
- listener count;
- native surface completion;
- stale DOM count;
- browser, device class, and release tags.

Acceptance:

Do not claim browser perf closure from this benchmark until it records p50,
p75, p95, and p99 for interaction rows.

### Slice 6: Production Metric Contract

Owner:

- `onRenderingStrategyMetrics` docs/tests;
- `EditableRenderingStrategyMetrics` type.

Goal:

Make lab and production speak the same language without adding a vendor
integration to raw Slate.

Metric fields should cover:

- interaction name;
- cohort;
- document size;
- rendering strategy requested/effective;
- mounted group count;
- pending group count;
- native surface complete;
- stale group count;
- DOM node count;
- editable descendant count;
- event listener count;
- heap;
- browser;
- mobile/IME flag;
- release id;
- degradation mode.

Acceptance:

Products can tag RUM / Datadog / whatever from Slate metrics without scraping
DOM or reverse-engineering shell/staged mode.

### Slice 7: Core And Support Tail Audit

Owner:

- `packages/slate/**`
- `packages/slate-history/**`

Goal:

The React default is not the whole editor. Before calling v2 perf field-best,
the core/support tails need current artifacts too.

Commands:

```bash
cd /Users/zbeyens/git/slate-v2
bun run bench:core:huge-document:compare:local
bun run bench:core:observation:compare:local
bun run bench:core:history-retained-memory:local
bun run bench:history:compare:local
```

Acceptance:

- no unbounded retained-memory regression;
- history memory rows stay tagged separately from latency rows;
- core observation / huge-document deltas are bounded and have clear owner
  classification;
- no core benchmark command still depends on stale public write aliases.

## Cohorts And Budgets

| Cohort                                                                       | Default stance                       | Proof required                                                 |
| ---------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------- |
| normal: `0-500` blocks                                                       | full DOM / ordinary path             | no broad rerenders, no hot effects/listeners per repeated unit |
| medium: `500-2000` blocks                                                    | DOM-present with strict budgets      | p95 interaction rows and repeated-unit budgets                 |
| large: `2000-10000` blocks                                                   | default `auto` staged DOM-present    | native completion, stale DOM `0`, browser interaction proof    |
| stress: `10000-50000` blocks                                                 | explicit degradation candidates only | named behavior degradation contract                            |
| pathological: custom renderers, heavy decorations, mobile/IME, collaboration | complexity-tagged                    | separate rows; never hidden inside block count                 |

Repeated unit budgets:

| Unit              | Budget question                                                    |
| ----------------- | ------------------------------------------------------------------ |
| top-level group   | Does one edit wake only overlapping groups?                        |
| text leaf         | Does synced text skip React rerender where safe?                   |
| element wrapper   | Are effects and event handlers absent from the repeated hot unit?  |
| projection source | Does source dirtiness prevent unrelated recompute?                 |
| selection bridge  | Does `selectionchange` avoid broad DOM scans and rich allocations? |
| shell segment     | Is shell explicit and behavior-labeled?                            |
| history payload   | Is retained operation payload bounded and measured?                |

## Ecosystem Synthesis

| System                | Steal                                                                                   | Reject                                                         | Slate v2 answer                                                           |
| --------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Legacy Slate chunking | coarse memoized chunk containment and `content-visibility` lessons                      | child-count chunking as public foundation                      | staged root groups and runtime-id selectors                               |
| Lexical               | dirty leaves/elements, update tags, listener partitions                                 | class-node identity, custom DOM reconciler as the whole editor | operations, commits, dirty runtime ids, React selectors                   |
| ProseMirror           | transaction metadata, one DOM bridge owner, selection mapping, decorations as view data | schema/view product heaviness                                  | `editor.update`, model selection, DOM bridge ownership, projection stores |
| React 19.2            | `useSyncExternalStore`, Activity, transitions, performance tracks                       | "React will solve editor invalidation"                         | React schedules UI; editor dirtiness remains the source of truth          |
| Tiptap                | clear extension packaging and docs ergonomics                                           | product opinion in raw Slate                                   | keep Slate raw; Plate owns product APIs                                   |

## Issue Accounting

No issue claim changes in this pass.

Cached ledgers were used first. Broad GitHub issue discovery was not run.

Current conservative rows stay correct:

| Surface                         | Issues                                               | Decision                                                                                                                                 |
| ------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| React rerender breadth          | `#3656`, `#4141`, `#4210`, `#2051`, `#5131`, `#3430` | Preserve existing `Improves`, `Related`, and `Not claimed` statuses. Fresh rerender proof strengthens locality but does not add `Fixes`. |
| Large document edit performance | `#5945`, `#4056`, `#5992`, `#790`                    | Preserve `Improves` / proof-needed wording. Browser repro closure still matters.                                                         |
| Core / batch performance        | `#6038`, `#2733`, `#2405`, `#2195`                   | Keep benchmark-gated. No threshold promotion from this pass.                                                                             |
| Decorations / overlays          | `#4483`, `#3382`, `#3354`                            | Keep projection/locality rows; no API claim widening.                                                                                    |
| Safari / browser selection      | `#5216`                                              | Still proof-needed. Needs browser/Safari lane, not jsdom.                                                                                |
| Memory retention                | `#3752`, `#5592`                                     | Keep memory benchmark separate from latency.                                                                                             |
| Production instrumentation      | `#2669`                                              | Related. Slate should expose metrics, not a vendor-specific integration.                                                                 |

## Maintainer Objections

| Objection                               | Answer                                                                                                                                                         |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "You only proved means."                | Correct. That blocks absolute-best claims. Slice 1 adds p75/p95/p99 before hard thresholds.                                                                    |
| "jsdom is not the browser."             | Correct. Slice 5 adds browser trace / event-to-paint proof.                                                                                                    |
| "Default `auto` hides missing far DOM." | It may during warmup, which is why `nativeSurfaceComplete` and stale DOM count are separate release gates. Stale current DOM is never acceptable.              |
| "Shell is faster."                      | Not on the fresh middle select/promote rows. It stays explicit and behavior-labeled.                                                                           |
| "Virtualization would make this easy."  | User excluded it, and it is experimental. It cannot be the answer here.                                                                                        |
| "This is over-benchmarking."            | No. The current numbers are good enough to keep the architecture, not good enough to claim absolute best. The missing proof is exactly where regressions hide. |

## Verification Commands Run

From `/Users/zbeyens/git/slate-v2`:

```bash
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_SKIP_BUILD=1 REACT_HUGE_COMPARE_DISPOSE_DELAY_MS=0 REACT_HUGE_COMPARE_SURFACES=v2DefaultRenderAuto,v2DomPresent REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
REACT_HUGE_COMPARE_SKIP_BUILD=1 REACT_HUGE_COMPARE_DISPOSE_DELAY_MS=0 REACT_HUGE_COMPARE_SPLIT_SELECTION=1 REACT_HUGE_COMPARE_SURFACES=v2DefaultRenderAuto,v2DomPresent REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
REACT_HUGE_COMPARE_SKIP_BUILD=1 REACT_HUGE_COMPARE_DISPOSE_DELAY_MS=0 REACT_HUGE_COMPARE_SURFACES=v2ShellExplicitRadius0,v2ShellExplicitRadius1 REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

All passed.

## Ralph Execution Ledger

### Benchmark Artifact Hardening

Status: complete.

Changes in `Plate repo root`:

- `scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`
  preserves run-specific artifacts, keeps a latest artifact, emits p75/p95/p99,
  and records ready-surface trace tags.
- `scripts/benchmarks/core/compare/huge-document.mjs`,
  `scripts/benchmarks/core/compare/history.mjs`, and
  `scripts/benchmarks/core/compare/observation.mjs` emit p75/p95/p99 and run
  against the current transaction API.

Fresh proof:

```bash
node --check scripts/benchmarks/core/compare/huge-document.mjs
node --check scripts/benchmarks/core/compare/history.mjs
node --check scripts/benchmarks/core/compare/observation.mjs
node --check scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs
```

All passed.

### Core Transaction Snapshot Fast Path

Status: complete, but not sufficient for full lane closure.

Change in `Plate repo root`:

- `packages/slate/src/core/public-state.ts` keeps the full previous snapshot
  path for snapshot/source subscribers, but subscriber-free transactions use the
  live runtime index plus rollback state instead of building a full immutable
  snapshot at transaction start.

Fresh proof:

```bash
bun --filter slate typecheck
bun --filter slate-history typecheck
bun --filter slate-react typecheck
bun test ./packages/slate/test/transaction-contract.ts ./packages/slate/test/commit-metadata-contract.ts ./packages/slate/test/write-boundary-contract.ts ./packages/slate/test/snapshot-contract.ts ./packages/slate-history/test/history-contract.ts ./packages/slate-history/test/integrity-contract.ts
cd packages/slate-react && bun test:vitest test/rendering-strategy-and-scroll.test.tsx test/projections-and-selection-contract.test.tsx
bun run lint:fix
CORE_HUGE_BENCH_BLOCKS=5000 CORE_HUGE_BENCH_ITERATIONS=5 CORE_HUGE_BENCH_TYPE_OPS=10 bun run bench:core:huge-document:compare:local
bun run bench:core:observation:compare:local
bun run bench:history:compare:local
REACT_HUGE_COMPARE_SKIP_BUILD=1 REACT_HUGE_COMPARE_DISPOSE_DELAY_MS=0 REACT_HUGE_COMPARE_SPLIT_SELECTION=1 REACT_HUGE_COMPARE_SURFACES=v2DefaultRenderAuto,v2DomPresent REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

All passed.

Result:

- Core 5,000-block typing improved from the previous percentile run
  `startBlockTypeMs mean=153.10ms p95=161.93ms` and
  `middleBlockTypeMs mean=152.65ms p95=156.30ms` to
  `startBlockTypeMs mean=70.16ms p95=72.82ms` and
  `middleBlockTypeMs mean=71.23ms p95=75.85ms`.
- Core full-document replacement remains green versus legacy:
  `replaceFullDocumentWithTextMs mean=18.85ms p95=21.84ms` versus legacy
  `mean=48.67ms p95=55.49ms`; fragment insertion is also green:
  `mean=19.06ms p95=21.51ms` versus legacy `mean=46.11ms p95=47.16ms`.
- Core select-all remains red versus legacy:
  `mean=25.94ms p95=26.21ms` versus legacy `mean=0.01ms p95=0.01ms`.
- Core observation remains red for fresh snapshot reads after each edit:
  `readChildrenLengthAfterEachMs mean=62.61ms p95=65.26ms`,
  `nodesAtRootAfterEachMs mean=33.73ms p95=35.78ms`, and
  `positionsFirstBlockAfterEachMs mean=22.39ms p95=22.82ms`.
- History remains a separate red owner:
  `typingUndoMs mean=26.15ms p95=29.28ms`,
  `typingRedoMs mean=27.77ms p95=28.84ms`,
  `fragmentUndoMs mean=19.66ms p95=20.49ms`, and
  `fragmentRedoMs mean=22.10ms p95=22.84ms`.
- React default/staged split compare still fails the release p95 bar:
  `v2DefaultRenderAuto.startBlockTypeMs p95=79.67ms` versus
  `legacyChunkOn p95=37.73ms`,
  `v2DefaultRenderAuto.middleBlockSelectThenTypeMs p95=66.84ms` versus
  `legacyChunkOn p95=43.91ms`, and
  `v2DomPresent.middleBlockPromoteThenTypeMs p95=78.52ms` versus
  `legacyChunkOn p95=41.71ms`.

Next owner:

- Run the split React compare with `REACT_HUGE_COMPARE_PROFILE=1` after the
  core fast path, inspect the remaining p95 outlier hot rows, then split the
  next code owner between core history/snapshot-observation and React
  selection/materialization.

### React P95 Outlier Trace And History Tail Fix

Status: complete, but not sufficient for full lane closure.

Changes in `Plate repo root`:

- `packages/slate/src/core/public-state.ts` publishes path-stable text
  snapshots for batched text commits so untouched 5,000-block siblings are not
  recloned just because a snapshot subscriber needs immutable previous/current
  state.
- `packages/slate/src/core/public-state.ts` runs commit listeners before broad
  snapshot/source listeners, and only builds listener snapshots for broad
  subscribers or two-argument commit listeners.
- `packages/slate-history/src/with-history.ts` captures history batches from
  commit listeners using `selectionBefore`, and undo/redo replay no longer
  wraps `editor.update` in a redundant normalization boundary.
- `packages/slate/test/snapshot-contract.ts` locks path-stable batched text
  snapshot publication.

Fresh proof:

```bash
bun --filter slate typecheck
bun --filter slate-history typecheck
bun --filter slate-react typecheck
bun test ./packages/slate/test/transaction-contract.ts ./packages/slate/test/commit-metadata-contract.ts ./packages/slate/test/write-boundary-contract.ts ./packages/slate/test/snapshot-contract.ts ./packages/slate-history/test/history-contract.ts ./packages/slate-history/test/integrity-contract.ts
cd packages/slate-react && bun test:vitest test/rendering-strategy-and-scroll.test.tsx test/projections-and-selection-contract.test.tsx
bun run lint:fix
bun run bench:history:compare:local
REACT_HUGE_COMPARE_SKIP_BUILD=1 REACT_HUGE_COMPARE_DISPOSE_DELAY_MS=0 REACT_HUGE_COMPARE_SPLIT_SELECTION=1 REACT_HUGE_COMPARE_SURFACES=v2DefaultRenderAuto,v2DomPresent REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
REACT_HUGE_COMPARE_SKIP_BUILD=1 REACT_HUGE_COMPARE_DISPOSE_DELAY_MS=0 REACT_HUGE_COMPARE_SPLIT_SELECTION=1 REACT_HUGE_COMPARE_SURFACES=v2DefaultRenderAuto,v2DomPresent REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 REACT_HUGE_COMPARE_PROFILE=1 bun run bench:react:huge-document:legacy-compare:local
```

All passed.

Result:

- History is materially improved:
  `typingUndoMs mean=7.62ms p95=9.82ms`,
  `typingRedoMs mean=5.94ms p95=6.31ms`,
  `fragmentUndoMs mean=6.60ms p95=6.90ms`, and
  `fragmentRedoMs mean=7.36ms p95=9.36ms`.
- Default `auto` remains strong on middle typing and full-document rows in the
  fresh split compare, but selected-start p95 is still noisy:
  `startBlockSelectThenTypeMs p95=332.62ms` versus legacy chunk-on `95.24ms`.
- `v2DomPresent` still loses selected typing p95:
  `middleBlockSelectThenTypeMs p95=68.61ms` versus chunk-on `46.73ms`.
- Profiled rows make the next owner clear: `transaction-previous-snapshot` is
  effectively zero, `next-snapshot` is single-digit to mid-teens on bad staged
  rows, and the largest spikes sit inside React/jsdom `act` around selected
  group typing/materialization.

Next owner:

- Add or run browser-native interaction proof for the same selected
  typing/materialization rows, then decide whether the staged materialization
  p95 tail is a runtime bug to fix, a jsdom harness artifact to narrow, or a
  documented non-default degradation.

### Browser Native Proof And Staged Materialization Classification

Status: complete, but not sufficient for full lane closure.

Changes in `Plate repo root`:

- `scripts/benchmarks/browser/react/huge-document-browser-trace.mjs` adds a
  Chromium huge-document browser trace benchmark.
- `package.json` adds
  `bench:react:huge-document:browser-trace:local`.
- The benchmark serves the built example app, drives real keyboard typing,
  records p75/p95/p99 rows, preserves run-specific artifacts, and tags native
  surface completion, observed mounted blocks, DOM nodes, heap, long tasks, and
  long animation frames.
- Full native-surface completion is a measured timeout/tag, not a hard
  prerequisite for selected typing rows. Selected block materialization remains
  required.

Fresh proof:

```bash
node --check scripts/benchmarks/browser/react/huge-document-browser-trace.mjs
bun run lint:fix
SLATE_BROWSER_TRACE_BLOCKS=5000 SLATE_BROWSER_TRACE_ITERATIONS=3 SLATE_BROWSER_TRACE_TYPE_OPS=10 SLATE_BROWSER_TRACE_SURFACES=defaultAuto,stagedDomPresent bun run bench:react:huge-document:browser-trace:local
```

All passed. The browser trace command ran once with a fresh `bun run
build:next`, then the final skip-build rerun wrote:

```text
tmp/slate-react-huge-document-browser-trace-benchmark-surfaces-defaultAuto-stagedDomPresent-blocks-5000-iters-3-ops-10.json
```

Result:

- Default `auto`: native surface complete `3/3`, timeout `0`, observed blocks
  `5000`, `nativeSurface.durationMs p95=298.2ms`.
- Default `auto`: start selected type-to-paint `p95=123.2ms`, middle selected
  type-to-paint `p95=139ms`, heap `p95=117.3MB`, long-task max `p95=0ms`.
- Staged DOM-present: native surface complete `3/3`, timeout `0`, observed
  blocks `5000`, `nativeSurface.durationMs p95=301.2ms`.
- Staged DOM-present: start selected type-to-paint `p95=81.5ms`, middle
  selected type-to-paint `p95=97.7ms`, heap `p95=82.4MB`, long-task max
  `p95=0ms`.

Classification:

- The staged materialization p95 tail from the jsdom/direct-model benchmark is
  not a hard runtime bug. Chromium materializes the 5,000-block native surface
  without timeout and records no long-task spike for the selected typing rows.
- The tail is still real budget work. Native selected typing p95 is not cheap
  enough to call the lane absolute-best, and the two browser fixtures are not
  strict apples-to-apples content comparisons.
- Keep default `auto` as the public default. Do not use this proof to promote
  shell or virtualization.

Next owner:

- Production-aligned rendering strategy metrics plus the native behavior matrix:
  browser find, copy, paste, select-all, scroll/click far group then type, IME,
  mobile touch selection, and Safari/WebKit.

### Production Metric Contract And Native Behavior Matrix

Status: complete for this autonomous local lane.

Changes in `Plate repo root`:

- `packages/slate-react/src/components/editable.tsx` exports
  `EditableRenderingStrategyDegradationMode`.
- `EditableRenderingStrategyMetricsBase` now includes `degradationMode`.
- `packages/slate-react/src/components/editable-text-blocks.tsx` reports:
  - `none` for complete DOM-present/default surfaces;
  - `staged-warmup` while staged DOM-present groups are still pending;
  - `shell` for shell-backed degradation;
  - `virtualized` for the experimental virtualized mode.
- `packages/slate-react/test/rendering-strategy-and-scroll.tsx` locks
  degradation mode for virtualized, staged warmup, plain, and shell surfaces.
- `docs/libraries/slate-react/editable.md`,
  `docs/libraries/slate-react/experimental-virtualized-rendering.md`, and
  `site/examples/ts/rendering-strategy-runtime.tsx` now use the metric fields
  products can actually ship to RUM: `degradationMode`, `nativeSurfaceComplete`,
  `domNodeCount`, mounted/pending counts, cohort, requested/effective strategy,
  browser/device/IME/release tags.
- `playwright/integration/examples/rendering-strategy-runtime.test.ts` now
  passes the composition transport the scenario metadata claims. Chromium keeps
  native CDP IME; mobile uses the synthetic composition lane.

Fresh proof:

```bash
bun --filter slate-react typecheck
bun typecheck:root
cd packages/slate-react && bun test:vitest test/rendering-strategy-and-scroll.test.tsx
bun run lint:fix
PLAYWRIGHT_RETRIES=0 bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "runs generated composition gauntlet without illegal kernel transitions"
PLAYWRIGHT_RETRIES=0 bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=mobile --grep "runs generated composition gauntlet without illegal kernel transitions" --timeout=60000
```

Additional browser matrix rows passed:

```bash
bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "browser-native typing"
bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "preserves Slate fragment paste over shell-backed selection|copies full shell-backed selection|copies partial shell-backed selection|preserves Slate fragment paste over partial shelled selection"
bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through the browser editing path|undoes committed IME composition as one history step"
bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=webkit --grep "deletes shell-backed selection after WebKit compositionend"
```

Result:

- Production metrics no longer require products to infer degradation from
  requested/effective strategy plus boundary counts.
- Chromium proves staged browser-native typing, shell-backed copy/paste, and
  IME rows.
- WebKit proves the shell-backed compositionend deletion row.
- Mobile semantic composition proof passes after the transport mismatch fix.
- Raw Appium/device proof remains a separate release machine lane:
  `bun test:mobile-device-proof:raw`.

## Pass Schedule

| Pass                                                           | Status   |
| -------------------------------------------------------------- | -------- |
| Skill and boundary reload                                      | complete |
| Local learning and prior-plan read                             | complete |
| Live Slate v2 source read                                      | complete |
| Cached issue-ledger read                                       | complete |
| Rerender breadth benchmark                                     | complete |
| Default/staged huge-document compare                           | complete |
| Split-selection huge-document compare                          | complete |
| Shell radius huge-document compare                             | complete |
| Execution-grade plan                                           | complete |
| Benchmark artifact hardening                                   | complete |
| Core transaction snapshot fast path                            | complete |
| React p95 outlier trace and history tail fix                   | complete |
| Browser-native proof and staged materialization classification | complete |
| Production metric contract and native behavior matrix          | complete |

## Current Handoff

Use `ralph` for execution.

No next slice remains for this local autonomous lane. Raw-device release proof
is explicitly separate and should run only on a machine/device lane.
