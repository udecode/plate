---
date: 2026-04-01
topic: slate-v2-benchmark-candidate-map
pilot: true
pilot_scope: 682 open issues
repo: ianstormtaylor/slate
---

# Slate v2 Benchmark Candidate Map

## Purpose

This file is the benchmark handoff layer.

It exists so a maintainer can choose a performance issue and start a reproducible workload lane without rereading the full GitHub thread.

Live-state note:

- research snapshot: `682` open issues
- post-Batch-A live repo state: `628` open issues
- Batch A queue execution status: `54/54` closed

---

## Issue #6038

- package: `slate`
- benchmark readiness: `ready-now`
- public benchmark seam: `packages/slate/test/perf/set-nodes-bench.js`

### Why This Is Benchmark-Ready

This issue is already framed as a benchmark-driven engine problem. The workload class, success criteria, and active implementation seam are all explicit.

### Minimal Workload Shape

- repeated tree updates over a large editor state
- exact-path `set_node` batches
- mixed structural batches where planner and draft behavior matter

### Primary Metric

- end-to-end batch runtime against the replay baseline

### Secondary Metric

- semantic parity between `Transforms.applyBatch(...)` and manual `Editor.withBatch(...)`

### Notes

Do not turn this into one giant benchmark lane. Keep it split by operation family and mixed-batch shape.

---

## Issue #5992

- package: `slate`
- benchmark readiness: `ready-with-minor-setup`
- public benchmark seam: huge-document cut benchmark

### Why This Is Not Ready Yet

The user pain is obvious, but the workload still needs to be normalized into a stable harness lane instead of living as one anecdotal report.

### Minimal Workload Shape

- large document, likely tens of thousands of blocks
- selection spanning a small range inside that large document
- cut operation through the public editor surface

### Primary Metric

- cut latency as document size increases

### Secondary Metric

- any visible selection or normalization amplification during the cut path

### Current Blocker

The exact harness shape is not yet extracted into an existing perf file. It needs a stable fixture and a public-operation sequence that matches the real report.

### Best Next Step

Build one narrow benchmark lane first:

- fixed large-document generator
- fixed two-node selection
- cut through the same public transform path users hit

---

## Issue #5945

- package: `slate`
- benchmark readiness: `ready-now`
- public benchmark seam: large plaintext paste benchmark

### Why This Is Benchmark-Ready

The issue already has a reproducible workload and contributor profiling that points at the expensive seams.

### Minimal Workload Shape

- generate large plain text with many newline splits
- paste into the plaintext example or equivalent public insert-data path
- measure the full ingest cost

### Primary Metric

- paste latency for large plain-text payloads

### Secondary Metric

- time spent in normalization and editor validation during ingest

### Notes

Do not benchmark “paste is slow” as one opaque blob. Break out the normalization-heavy path and the editor-validation path if the harness can expose both.

---


## Issue #4483

- package: `slate-react`
- benchmark readiness: `ready-now`
- public benchmark seam: dynamic decorations rerender cost

### Why This Is Benchmark-Ready

The issue already has a concrete workload, a performance claim with before/after numbers, and a narrow renderer seam.

### Minimal Workload Shape

- moderately-sized document with dynamic decorations driven by external state
- edits confined to one logical region that force redecorating elsewhere
- compare global `decorate` churn versus local per-node decoration rendering

### Primary Metric

- end-to-end edit latency when decoration inputs change

### Secondary Metric

- rerender breadth across unrelated elements

### Notes

This is not a generic “decorations are slow” complaint. It is specifically about the global invalidation model in `slate-react`.

---

## Issue #3656

- package: `slate-react`
- benchmark readiness: `ready-with-minor-setup`
- public benchmark seam: leaf rerender breadth inside one block element

### Why This Is Benchmark-Ready

The issue has a concrete workload and the thread already frames the core complaint as rerender breadth, not vague slowness.

### Minimal Workload Shape

- one block containing many leaves with distinct marks or properties
- edit one leaf repeatedly through the public editor surface
- measure rerender spread across sibling leaves in the same block

### Primary Metric

- rerender count or render breadth per keystroke inside the block

### Secondary Metric

- end-to-end typing latency as leaf count grows within one block

### Current Blocker

The harness still needs one lane that isolates leaf breadth inside a single block instead of whole-editor rerender pressure.

### Best Next Step

Add one narrow `slate-react` perf lane for many-leaf blocks and a single edited leaf.

---

---

## Issue #3430

- package: `slate-react`
- benchmark readiness: `ready-now`
- public benchmark seam: single-paragraph many-inline typing benchmark

### Why This Is Benchmark-Ready

The issue already frames a concrete workload: one paragraph, lots of inline nodes, then normal typing, paste, and backspace falling off a cliff.

### Minimal Workload Shape

- one paragraph containing many inline nodes
- repeated typing or backspace inside that paragraph
- measure rerender spread and end-to-end latency as inline count grows

### Primary Metric

- typing latency per keystroke inside the heavily inline paragraph

### Secondary Metric

- rerender breadth across leaves in the same paragraph

### Current Blocker

The harness still needs a narrow lane for one-inline-heavy paragraph instead of whole-editor rerender pressure.

### Best Next Step

Add one `slate-react` perf lane for a single paragraph with many inlines and edit one inline repeatedly.

## Pilot Note

The pilot already proves benchmark extraction is a separate artifact, not a footnote under TDD. Performance issues want workload capture, metrics, and harness seams, not fake red-test prose.

The 25-issue expansion did not add new benchmark-worthy issues beyond the existing large-document and batch-engine lanes. That is useful signal too. Most of the new batch was correctness, input-method, or ecosystem triage, not hidden perf work.

The 76-issue mark still says the same thing. Even the stronger runtime-design issues in the new batch, like `#5697`, are architecture and correctness pressure first, not benchmark-first workload reports.

The 101-issue mark still did not add a genuine new benchmark issue. That is good discipline: not every painful bug deserves a perf harness, and this batch was overwhelmingly runtime semantics, browser integration, and API shape.

The 251-issue mark still did not produce a cleaner new benchmark target than the existing large-document, selection, and batch-engine lanes. This batch was mostly DOM ownership, mobile input, plugin seam, and API-shape pressure rather than hidden perf work.

The 301-issue mark still does not surface a cleaner new benchmark target than the existing large-document, selection, and batch-engine lanes. This 50-issue tranche was mostly DOM bridge, mobile input, typing, docs/example debt, and plugin/runtime seam pressure rather than fresh hidden perf work.

The 351-issue mark still does not produce a cleaner benchmark target than the existing large-document, selection, and batch-engine lanes. This tranche was dominated by runtime-boundary, clipboard-strategy, mobile input, and docs/example pressure rather than fresh performance reports.

The 401-issue mark finally adds one clean new benchmark lane: dynamic decorations in `slate-react` from `#4483`. Most of the rest of that tranche still leaned runtime-boundary, mobile input, Shadow DOM, and docs/example pressure rather than hidden perf work.

The 451-issue mark adds one more real renderer-performance lane: rerender breadth in `#4210`, with `#4141` as the depth-sensitive variant of the same problem. The rest of this tranche is still dominated by selection, composition, plugin-surface, and example/process noise.

The 501-issue mark adds one older but still legitimate large-document clipboard lane from `#4056`. Most of this tranche still reinforced IME, focus, iframe, readonly, and docs/process pressure rather than surfacing a pile of new perf work.

The 551-issue mark adds one real history-memory benchmark lane from `#3752`. Most of this tranche still leaned history semantics, cross-window runtime ownership, IME, and docs/example pressure rather than a flood of fresh perf reports.

The 601-issue mark adds one older but still useful `slate-react` renderer lane from `#3656`: leaf rerender breadth inside a single block. Most of the rest of this tranche still reinforced focus ownership, Android/input debt, history semantics, and structural delete failures rather than surfacing a pile of new perf work.

---

## Issue #4056

- package: `cross-package`
- benchmark readiness: `ready-with-minor-setup`
- public benchmark seam: large text paste/copy into a populated editor

### Why This Is Benchmark-Ready

The workload is concrete and user-visible, and the thread keeps pointing back to large-document ingest cost rather than one weird payload.

### Minimal Workload Shape

- large plain-text or rich-text payload
- paste or cut/copy path through the public editor surface
- editor state large enough for normalization and rerender cost to matter

### Primary Metric

- end-to-end paste/cut latency as document size grows

### Secondary Metric

- normalization and rerender amplification during ingest

### Current Blocker

The existing perf harness still needs a lane that matches this older clipboard-heavy workload more directly.

### Best Next Step

Add one benchmark lane for large-payload paste/cut through the public insert-data path.

---
## Issue #3752

- package: `slate-history`
- benchmark readiness: `ready-now`
- public benchmark seam: history memory retention under edit churn

### Why This Is Benchmark-Ready

The issue has a concrete reproduction path, a measurable memory symptom, and a strong hint about where retained references are coming from.

### Minimal Workload Shape

- rich text editor with slate-history enabled
- repeated edit churn followed by undo stack growth
- memory inspection focused on detached DOM nodes or retained editor-linked objects

### Primary Metric

- retained memory or detached node count after repeated edit churn

### Secondary Metric

- whether cloning or stripping retained operation payloads changes retention significantly

### Notes

This is a memory-retention lane, not a latency lane. Treat it like a leak benchmark, not a typing benchmark.

---

## Issue #5216

- package: `slate-dom` and `slate-react`
- benchmark readiness: `ready-with-minor-setup`
- public benchmark seam: Safari long-paragraph backward selection

### Why This Is Benchmark-Ready

The workload is tight: one browser, one document shape, one user-visible lag path.

### Minimal Workload Shape

- long paragraph in Safari, well over 300 words
- backward text selection where focus trails anchor
- repeated drag selection over the same paragraph

### Primary Metric

- selection latency and visible lag under backward selection

### Secondary Metric

- whether the lag scales with paragraph length

### Current Blocker

This still needs a stable Safari harness, not just a screen recording.

### Best Next Step

Build one browser-scoped lane first instead of pretending this should be cross-browser by default.

---
## Issue #5131

- package: `slate-react`
- benchmark readiness: `ready-now`
- public benchmark seam: selection-driven rerender count

### Why This Is Benchmark-Ready

This is a clean subscription-granularity question: how much work does `useSlate` do when only selection changes?

### Minimal Workload Shape

- editor subtree using `useSlate`
- rapid selection changes without content edits
- render count instrumentation around the subscribed subtree

### Primary Metric

- rerender count per selection change

### Secondary Metric

- commit time amplification versus a more selective hook shape

### Notes

This is not about micro-optimizing hooks in the abstract. It is about whether `slate-react` subscriptions are too broad.

---
## Issue #4210

- package: `slate-react`
- benchmark readiness: `ready-now`
- public benchmark seam: selection/edit rerender breadth benchmark

### Why This Is Benchmark-Ready

The issue is already a clean renderer invalidation complaint with a public repro path and an obvious measurement target.

### Minimal Workload Shape

- moderately sized editor tree with many rendered elements
- tiny edits and pure selection changes through the public editor surface
- render instrumentation or React profiling around rerender breadth

### Primary Metric

- rerender breadth per edit or selection change

### Secondary Metric

- commit time amplification versus a more selective subscription/runtime shape

### Notes

This is the same family as the later nested-block rerender issues, so it should become one reusable renderer benchmark lane, not five nearly identical ones.

---
## Issue #4141

- package: `slate-react`
- benchmark readiness: `ready-with-minor-setup`
- public benchmark seam: nested-block rerender breadth benchmark

### Why This Is Benchmark-Ready

The pain is concrete, but the benchmark should be framed as a depth-sensitive variant of the broader rerender-breadth lane instead of its own silo.

### Minimal Workload Shape

- deeply nested block tree
- edit confined to one low-level text node
- measure rerender breadth up the ancestor chain

### Primary Metric

- number of rerendered ancestors and siblings per low-level edit

### Secondary Metric

- end-to-end edit latency as nesting depth increases

### Current Blocker

It still needs a stable public harness instead of screenshots from React devtools alone.

### Best Next Step

Add one depth-aware variant to the rerender benchmark lane instead of inventing a separate perf harness.


The 651-issue mark adds one real older `slate-react` perf lane from `#3430`: single-paragraph many-inline editing where render breadth and typing latency collapse together. The rest of this tranche mostly reinforced focus ownership, placeholder behavior, decoration invalidation, Android input, and extension-surface pressure instead of surfacing a pile of new benchmark work.

---

## Issue #2195

- package: `slate`
- benchmark readiness: `ready-now`
- public benchmark seam: large paste dirty-path tracking benchmark

### Why This Is Benchmark-Ready

The issue already names the hot path and ties it to a reproducible large-paste workload.

### Minimal Workload Shape

- large plain-text or fragment paste that creates many inserted text nodes
- normalization path that recalculates dirty entries repeatedly
- measurement isolated to the public insert path, not synthetic internals

### Primary Metric

- paste latency under heavy dirty-path churn

### Secondary Metric

- time spent recalculating dirty entries during normalization

### Notes

This should stay narrow. The useful comparison is dirty-path tracking cost, not “paste is slow” as one opaque blob.

---

## Issue #2051

- package: `slate-react`
- benchmark readiness: `ready-now`
- public benchmark seam: simple typing rerender breadth benchmark

### Why This Is Benchmark-Ready

The issue directly frames a measurable runtime problem: simple native edits should not force broad rerender work.

### Minimal Workload Shape

- simple character insertion and deletion in a document with many leaves or decorated spans
- comparison of rerender breadth across unrelated leaves or siblings
- public typing path, not synthetic direct DOM mutation

### Primary Metric

- end-to-end edit latency for simple typing

### Secondary Metric

- rerender breadth across leaves or custom rendering islands

### Notes

This lane is about runtime invalidation breadth. Do not mix it with IME correctness or spellcheck behavior.

---

## Issue #790

- package: `slate-react`
- benchmark readiness: `ready-with-minor-setup`
- public benchmark seam: large-document virtualization and initial render benchmark

### Why This Is Not Ready Yet

The issue has an obvious workload and user pain, but it still needs a stable harness shape for windowing or deferred render comparisons.

### Minimal Workload Shape

- very large multi-block document with realistic element rendering
- initial mount plus first interaction or first scroll
- optional comparison between full render and staged or windowed render strategies

### Primary Metric

- initial render latency for very large documents

### Secondary Metric

- DOM node count and first-edit latency after mount

### Current Blocker

The benchmark still needs a stable huge-document fixture and a fair comparison seam. Windowing strategies that break DOM lookup are not useful baselines.
