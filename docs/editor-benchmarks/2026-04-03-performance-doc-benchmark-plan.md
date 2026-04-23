# Performance Doc Benchmark Plan

## Goal

Plan a production-grade Performance doc under `content/` that makes strong
claims only where the benchmark design is honest enough to survive scrutiny.

This is not a marketing page with benchmark glitter. It needs to read like an
engineering artifact that happens to be public.

## Recommendation

Do **not** lead with “Plate vs every popular editor.”

Lead with:

- Plate vs Slate as the primary benchmark story
- Plate internal lane breakdown as the credibility layer
- broader editor comparisons only as a secondary, tightly-scoped reference
  matrix

That is the Daishi-style move: benchmark the real decision, isolate the axes,
and refuse one giant vanity score.

## Why This Matters

Right now we have good performance evidence, but it is scattered across:

- internal performance docs
- one-off benchmark artifacts
- focused plugin or `nodeId` investigations

That is useful for us and weak as public documentation.

The new doc should answer:

1. What exactly do we benchmark?
2. Why are those workloads fair?
3. What does Plate beat, match, or lose at?
4. What tradeoffs buy the wins?
5. How can someone reproduce it?

## Repo Context

Current source material already exists:

- [editor-performance-master-plan.md](/Users/zbeyens/git/plate-2/docs/performance/editor-performance-master-plan.md)
- [plate-vs-slate-benchmarks.md](/Users/zbeyens/git/plate-2/docs/performance/plate-vs-slate-benchmarks.md)
- [editor-architecture-candidates.md](/Users/zbeyens/git/plate-2/docs/analysis/editor-architecture-candidates.md)
- the real harness in
  [editor-perf/page.tsx](/Users/zbeyens/git/plate-2/apps/www/src/app/dev/editor-perf/page.tsx)
- the real runner in
  [run-editor-perf.mts](/Users/zbeyens/git/plate-2/apps/www/scripts/run-editor-perf.mts)

That means the doc should not invent a new benchmark universe. It should
productize the one we already trust.

## Daishi Patterns Worth Copying

The benchmark design habits worth copying are not “state libraries are fast.”
They are the way Daishi frames the problem.

### 1. Compare equivalent implementations of the same scenario

In `react-redux-benchmarks`, each library gets the same benchmark app shape and
the same stressor. The harness compares implementations, not vibes.

Useful pattern for us:

- one workload
- one stressor
- one implementation per editor/runtime
- same output contract

Do not compare Plate rich plugins against a stripped baseline in another editor
and call it fair.

### 2. Benchmark multiple scenarios, not one magic number

Daishi’s benchmark repos split scenarios by what they stress:

- many components
- many updates
- expensive renders
- external events
- concurrency behavior

Useful pattern for us:

- mount
- typing latency
- large paste/import
- selection churn
- plugin activation tax

Do not publish one “Plate is X% faster” number without saying **at what**.

### 3. Treat correctness and performance as separate gates

`will-this-react-global-state-work-in-concurrent-rendering` is not a speed
benchmark first. It is a correctness-under-pressure benchmark.

Useful pattern for us:

- do not count a lane as a performance win if the behavior is subtly broken
- keep browser/caret/selection verification beside the numeric lane
- especially for `affinity`, `nodeId`, selection, and table behavior

### 4. Make the harness configurable and reproducible

Daishi-style repos tend to expose:

- versions
- workload knobs
- run duration or count
- visible benchmark app code

Useful pattern for us:

- publish the exact route and runner command
- expose workload size, chunking, and scenario
- show the current benchmark version and artifact shape

### 5. Avoid benchmark theater

The strongest Daishi-inspired lesson is restraint:

- benchmark what users actually choose between
- isolate axes
- explain caveats
- do not overclaim from microbenchmarks

For editor benchmarks, this is critical. The fastest way to lose credibility is
to benchmark rich-text editors like generic text inputs.

## External References To Use

These are the right inspiration sources:

- `dai-shi/react-redux-benchmarks`
  - implementation-per-library, same-scenario design
  - URL: [https://github.com/dai-shi/react-redux-benchmarks](https://github.com/dai-shi/react-redux-benchmarks)
- `dai-shi/will-this-react-global-state-work-in-concurrent-rendering`
  - correctness-under-pressure matrix before speed claims
  - URL: [https://github.com/dai-shi/will-this-react-global-state-work-in-concurrent-rendering](https://github.com/dai-shi/will-this-react-global-state-work-in-concurrent-rendering)
- `dai-shi/lets-compare-global-state-with-react-hooks`
  - scenario matrix and dimension framing, not just one score
  - URL: [https://github.com/dai-shi/lets-compare-global-state-with-react-hooks](https://github.com/dai-shi/lets-compare-global-state-with-react-hooks)

## Benchmark Scope Recommendation

### Tier 1: Headline benchmark

This is the public core story.

Compare:

- Plate
- Slate

Why:

- same lineage
- same mental model
- easiest fairness argument
- strongest evidence that Plate’s extra framework layer is not dead weight

Primary workloads:

1. Large-document mount
2. Large-document typing latency
3. `nodeId` init and duplicate-paste costs
4. plugin activation tax for representative core plugins

This is the benchmark that should carry the headline.

### Tier 2: Cross-editor reference benchmark

This is the optional secondary matrix.

Compare only if each editor gets an honest equivalent implementation:

- Plate
- Slate
- Lexical
- ProseMirror
- Tiptap

But only on **narrow interoperable workloads**:

1. Plain large-document mount
2. Plain paragraph typing
3. Large paste/import of plain structured content

Do **not** try to force:

- Plate plugin richness
- `nodeId`
- Plate-specific selection semantics
- table or markdown-specific behavior

into the cross-editor headline.

That matrix should be explicitly labeled as:

> “cross-editor reference workloads on a shared minimal feature set”

not:

> “full editor benchmark”

### Tier 3: Internal decomposition

This is where Plate earns credibility.

Show:

- core without `nodeId`
- core with `nodeId`
- basic plugin bundle
- representative expensive plugin lanes
- `nodeId` tax separated from non-`nodeId` wins

This is the best antidote to “the benchmark hid the real bottleneck.”

## Proposed Public Doc Structure

Target path:

- `content/(guides)/performance.mdx`

Optional later:

- `content/(guides)/performance.cn.mdx`

Recommended sections:

1. **What we benchmark**
   - the workload families
   - why they matter

2. **How we benchmark**
   - route
   - runner
   - production mode vs dev mode
   - run counts
   - hardware caveat

3. **Primary results: Plate vs Slate**
   - mount
   - input
   - `nodeId`
   - representative plugins

4. **Where the wins come from**
   - separate `nodeId`
   - separate render/mount cuts
   - separate plugin tax cuts

5. **Cross-editor reference matrix**
   - only if we build the narrow fair harness

6. **How to reproduce**
   - commands
   - route
   - artifact output

7. **Caveats**
   - what the benchmark does not claim

## Benchmark Design Rules

### Rules to keep

- Use production builds for public headline numbers.
- Keep raw JSON artifacts.
- Use the same workload factory for every comparable lane.
- Report median or trimmed mean, not lucky best-case garbage.
- Publish the scenario definitions in code.
- Keep one benchmark result per workload family, not one global score.
- Separate Plate internal decomposition from cross-editor comparison.

### Rules to avoid

- no “all editors” chart built from mismatched feature sets
- no single synthetic score
- no dev-mode headline numbers
- no mixing correctness-broken lanes into perf claims
- no comparing Plate rich markup against plain-text competitors and calling it
  fair

## What We Should Benchmark

### Core public lanes

1. **Large document mount**
   - `1k`, `5k`, `10k`
   - mixed block workload

2. **Typing latency**
   - chunked and no-chunk
   - one realistic large-doc lane
   - one dense single-block lane later if needed

3. **`nodeId`**
   - off
   - on
   - seeded
   - duplicate paste/import lane

4. **Plugin tax**
   - `BlockquotePlugin`
   - `HeadingPlugin`
   - `BoldPlugin`
   - `CodePlugin`
   - maybe `HighlightPlugin` / `StrikethroughPlugin` as current red lanes

### Optional cross-editor lanes

Only after fairness proof exists:

1. plain mixed block mount
2. plain paragraph typing
3. plain large paste/import

## Popular Editor Comparison Take

Do we compare all popular editors?

My answer: **yes, but not in the headline and not all at once.**

Do it in phases:

### Phase A

Publish Plate vs Slate first.

This is the defensible benchmark story right now.

### Phase B

Add a cross-editor appendix or second section with:

- Plate
- Slate
- Lexical
- ProseMirror
- Tiptap

on the narrow shared workload set.

### Phase C

If the appendix is stable and honest, it can graduate into a stronger public
story later.

But do not block the Performance doc on building all five engines perfectly on
day one.

## Phased Execution Plan

### Phase 1: Benchmark spec

Write the benchmark contract first:

- workloads
- metrics
- environments
- fairness rules
- allowed claims

### Phase 2: Public headline extraction

Turn existing Plate vs Slate evidence into:

- clean tables
- reproducible commands
- caveats

### Phase 3: Cross-editor pilot

Build one narrow shared benchmark with:

- Plate
- Slate
- Lexical

If that survives contact with reality, widen later.

### Phase 4: Publish content doc

Write `content/(guides)/performance.mdx`.

Do not write the Chinese version until the English benchmark story is stable.

## Open Questions

### Resolve before planning

- Should the first public Performance doc ship with only Plate vs Slate, or
  should it also include a small cross-editor appendix on day one?

### Defer to planning

- whether the public doc should embed live benchmark tables or consume frozen
  generated JSON
- whether the cross-editor appendix belongs in the same doc or a separate
  “benchmark methodology” doc
- whether we need a CI benchmark snapshot job for public numbers

## My Call

Think like Daishi, not like marketing:

- benchmark one decision at a time
- use scenario matrices
- separate correctness from speed
- make the harness public
- publish caveats
- refuse one big fake score

So the first doc should be:

> **Performance**
>
> Plate vs Slate on real editor workloads, with an internal breakdown showing
> exactly where the wins come from.

Then, if we still want broader editor comparison, add it as a second,
explicitly narrower benchmark layer.

That is the strongest, most credible move.
