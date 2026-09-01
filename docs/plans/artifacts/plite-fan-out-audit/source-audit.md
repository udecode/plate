# Plite fan-out ownership audit

Status: the fan-out audit and proven runtime repairs are complete. Strict correctness passes. Broad performance clearance is not green: the remaining compiler and timing failures are explicit below. Nothing is committed or released.

## Scope and method

Scope is `packages/plitejs/src/**`, including core, React, DOM, history, pagination, and the Plate Yjs adapter where it drives Plite. The audit follows commit publication, selection, source refresh, layout invalidation, and teardown into their subscribers. Pure transforms, detached queries, constructors, serialization, and explicit full-document maintenance are checked separately from typing.

The discovery pass inventories 412 source files and global traversal sites. The review traces hot entrypoints and the owners below; it does not claim line-by-line review of every source file. Scale evidence belongs to the registered targets, not to this document. The goal plan records exact commands, source fingerprints, red/green receipts, and deferred diagnoses. `target-coverage.json` accounts for all 46 registered targets without treating uninvoked comparisons as passes.

The strongest cut is shared affected-work ownership, not another plugin or facade. Twenty-one measured runtime causes received repairs: twenty have accepted exact target results; one retained locality repair has complete-target acceptance deferred because its separate Plate compiler budget fails. The only added public query kind is node `presence` in the existing commit API.

## Owner decisions

| Owner | Trigger and work boundary | Verdict and proof |
|---|---|---|
| `core/anchor-state.ts`, `core/anchor.ts` | Transaction begin, change, commit, release | Replaced per-handle broadcast with affected identity/root buckets and lazy checkpoints. Distributed edits visit one bucket; 10k co-located handles legitimately all change. Their repeated endpoint calculations share the existing per-change memo, while returned handle values remain independent. `core-anchors-projection` counts actual visits, repeated mappings and later-affected handles. |
| `core/commit.ts`: aggregate queries | Repeated readers of the same immutable commit | Cache one ordered result and membership set per kind. `core-query-anchor-observation` checks 10k membership reads and immutable result identity. |
| `core/commit.ts`: presence | Added/removed identity consumers | Traverse changed representation ranges, not every shifted path. Whole-value replacement explicitly compares complete roots. Widget deletion and structural/root contracts verify exact membership. |
| `core/commit.ts`: selection | Expanded or collapsed selection queries | Use the canonical bounded node iterator, deduplicate endpoint ancestors, and return empty document details for selection-only commits. Two-leaf queries through 100k blocks do not enumerate complete indexes. |
| `core/commit.ts`: structural details | Path, root-order, node and text consumers | Delete unused range/LIS derivation and repeated complete index enumeration. Skip unchanged immutable subtrees; use presence to avoid looking up newly added keys in the old snapshot. Real shifts still report all affected paths. |
| `core/snapshot-index.ts` | Identity mapping and lazy lookup | Explicit identities, prepared placements, relocations and canonical changes own continuation; the duplicate all-source/all-target text guesser is deleted. Canonical replacement has a linear node-read guard. Known deleted mapped keys return null without materialization. Cold construction does not collect element types; the first actual type query or full enumeration owns that work. Arbitrary cold reverse lookup and explicit `entries()` remain full-index jobs. |
| `core/change/document-index.ts`: cached reads | Resolve a known immutable root | Consult the existing WeakMap before native immutability validation. `Object.isFrozen` enumerates a wide array in this runtime; known immutable cache hits require zero property enumeration through 100k blocks. Unknown inputs still validate/clone. |
| `core/change/root-change.ts`: text batches | Apply one canonical change with multiple leaf edits | Reuse the grouped node-update trie to publish common ancestors once. Multiple edits in one leaf apply in reverse source-offset order. Structural/mixed fallback stays separate; 120 edits through 10k blocks have one root publication, exact inverse/replay, and a 16.67 ms owner budget. |
| `core/change/root-change.ts`: splits and generic diffs | Split one node; infer a canonical change between values | Encode a split as its two-token close/open boundary, matching direct merge ownership. No whole-document diff is needed for a known split. Generic diffs retain exact unchanged sibling boundaries for whole-node gaps. Content-preserving text-run splits and merges retain characters and change only boundaries, so formatting preserves selected text and direction. Runtime keys, serialized mapping, properties and history are independent correctness guards. |
| `core/public-state.ts`: explicit replacement | Discard identities in one replaced subtree | Walk that subtree only. Prior lazy indexes remain lazy; unrelated and historical identities survive. `core-node-transforms` owns the 100/1k/10k guard. |
| `core/public-state.ts`: publication | Publish a coherent immutable value and commit | Installed extension callbacks and explicitly global subscribers remain O(actual consumers). Root snapshots are shared. Persistent ancestor-array publication remains width-dependent; this is not an Anchor cost and is not claimed constant. |
| `core/public-state.ts`: value reads; `core/get-content-slice.ts` | Read an already canonical immutable value or a small selected slice | Delete repeated native freeze validation of canonical root arrays. Resolve owned roots only when selected nodes require them. A two-node clipboard read at 1k/50k visits zero unrelated root properties; external input cloning, historical values and missing-root behavior stay intact. The enclosing schema target still has a separate Plate compile-time budget failure. |
| `core/listener-state.ts` | Source classification and subscription | Finite source kinds, pruned empty buckets, explicit global commit/snapshot subscriptions. No per-node global listener registry added. |
| `core/change-events.ts` | Semantic extension change events | Changed-range candidates and exact relocation feed identity comparison. The ordering algorithm works on candidates, not the entire runtime index. Cost follows affected entries and registered callbacks. |
| `core/editor-read-runtime.ts`, transaction targets | Read construction, generic transaction composition | Source-first read-view and transaction targets check no-op allocation, shared runtime views, publication count, and identical result values. Full requested query results remain full work. |
| Core schema, extension and command owners | Compile, install, reconfigure, correct, dispatch | Configuration is cold work. Sparse validation and correction use changed ranges; dispatch follows installed handler depth, not document node count. Independent schema/document-width and correction-work counters remain required. |
| `core/editor-schema.ts`: copy policy | Export a selected slice or copy a node | The immutable compiled lifecycle table determines whether any property can change on copy. Preserve-only schemas return the input without visiting node properties. Active drop policies retain exact target/ancestor behavior; preserve/drop/preserve reconfiguration and old slices are tested. |
| `range-projection.ts` | Project a committed range into leaf segments | Deleted the whole-document text index and full-block collector. Canonical bounded text traversal visits selected leaves only. Wide-block and cross-block two-leaf queries pass through 100k leaves. One weakly owned last result per immutable snapshot avoids repeating identical projection work; copied input coordinates prevent caller mutation from poisoning the result. |
| `react/stable-id-mapped-source.ts` | Trusted changed-ID delta or explicit external refresh | Persistent entity/output snapshots, incremental unresolved IDs, indexed memberships, and grouped dirty buckets. Reuse existing output-key indexes and unchanged ordered bucket IDs; no shadow membership Sets or unconditional sort. Byte-bounded branches count actual copied child entries, not just nodes; divergent Unicode prefixes and long IDs are covered. Single-ID work follows changed key length through 100k entities; full-array refresh remains explicitly O(input). Shared-bucket/all-changed cohorts prove zero copied membership entries and preserve remove/restore ordering. |
| `react/annotation-store.ts`, `mapped-view-store.ts` | Document mapping and annotation metadata | Reuse editor-known IDs; publish one private changed-ID batch. Public immutable reads, source refresh, order and fault atomicity remain intact. |
| `react/widget-store.ts` | Node presence, selection, annotation metadata | Separate target indexes. Text edits do not resolve node-presence targets; one annotation batch resolves only its dependent widgets. Foreign stores without delta support retain an explicit full-read fallback. |
| `react/decoration-source.ts` | Compose sources for a keyed or aggregate read | Keyed reads compose that key's input slices only. Weak input-array caching preserves unchanged identity without retaining deleted logical IDs. Full `getSnapshot()` alone builds the aggregate. |
| `react/projection-store.ts`, keyed deltas | Replace external source data | Changed-key publication uses the shared mapping owner. An opaque external source can require reading its entire returned array; trusted editor deltas must not take that path. |
| `react/hooks/use-editor-selector.tsx` | Route one commit to node/path/render/selection listeners | Indexed listener buckets consume shared commit queries. Explicit global listeners and explicit complete invalidation stay global. Deferred callbacks share one microtask batch. React breadth targets verify actual renders. |
| `react/hooks/use-plite-node-ref.tsx` | Synchronize model paths/text to mounted DOM | Provided affected keys restrict routing. A null key set explicitly means all mounted bindings; disconnected bindings are removed. Shifted paths genuinely require updates. |
| `react/editable/runtime-root-engine.ts` | Programmatic selection and pending native input | Flush mounted editable runtimes owned by the same editor, not every logical node. Multiple live DOM representations can each hold native work. |
| `react/editable/selection-projected-dom.ts` | Resolve a content-root boundary point | Walk from the requested edge without copying/reversing every sibling first. Empty-subtree fallback and start/end direction remain unchanged; root-navigation/browser contracts own behavior. |
| `react/editable/content-root-navigation.ts` | Deferred focus after crossing a content-root boundary | Keep the existing scheduler, but discard a callback after the requesting commit or projected selection changes. An old callback cannot reclaim a later selection. The deterministic owner regression and 30 retry-free native repeats pass. |
| `react/widget-geometry.ts` | Scroll, resize, layout and targeted geometry requests | One coordinator per editor/document, one scheduled DOM-read batch. Viewport changes can invalidate every mounted rectangle; this is measured layout work, not semantic Widget target resolution. |
| `dom/plugin/dom-phase-scheduler.ts` | Schedule, replace, cancel and flush DOM tasks | Insertion-ordered Set and pending-frame count replace repeated array search/splice/scans. 50k-task flush, cancellation and keyed replacement retain phase order and cleanup. |
| `dom/plugin/dom-integrity-observer.ts` | Native DOM mutations and repair | One observer per owned root, work from actual records, bounded repair passes, composition-aware ownership. Final strict Chromium proof covers the current native behavior. |
| `dom/plugin/dom-editor.ts`: missing DOM | Resolve a model node or range to DOM | A missing or disconnected editor root makes descendant DOM resolution impossible. Return null before model identity lookup; headless copy must not materialize the complete identity index. Direct root lookup, mounted containment, strict errors and remount behavior stay intact. |
| `react/inactive-selection.ts` | Focus movement and retained selection paint | One document-level coordinator routes active/pending state. Concurrent work owns this file; this audit does not modify it. |
| History branch and mapping journal | Local history publication, skipped remote changes, undo, clipping | Persistent branches and lazy mapping journal avoid walking retained undo depth on remote commits. Explicit undo/serialization resolves the requested history. Depth and retained-memory targets own scale and exact restore proof. |
| Collaboration / Yjs adapter | Sparse remote update, awareness, reconnect | Fit changed nodes through isolated schema fitting, not detached live-root transactions. Resolve schema property context lazily in affected regions; text-only imports read no unrelated types. Canonical changes drive mapping; awareness decoding and runtime wakes are separate from document projection. Distance, payload, reconnect and teardown targets own scale. |
| Clipboard and slice fitter | Copy/paste, cut, detached slice fit | Full copied/pasted payload is real work; a small cut in a large document must stay local. Existing 50k-block cut and source-width fitter targets distinguish them. |
| `react/editable/clipboard-input-strategy.ts` | Native cut of a selected inline void | Compose deletion and final caret placement in one existing transaction. One native action publishes one coherent document/selection change. The existing native mention-cut regression, package contracts and Chrome cut/undo replay pass. |
| Pagination | Layout composition, page reflow, viewport projection | Full layout output and downstream reflow can affect all pages. Immutable block measurements are cached; no added debounce hides composition. Three existing character-burst cases and 120 real interactions pass. The 800-row case keeps three mounted page surfaces; full-operation latency is reported separately from per-character timing. |

## Guardrails

- Count actual visits, copies, resolutions and notifications. Timing alone cannot prove locality.
- Pair each unchanged-read check with a later affected read; missed notifications are not optimization.
- Keep historical snapshots immutable, batch publication atomic, and teardown exact.
- Do not claim an absolute one-frame editor budget from a relative owner-overhead pass.
- Whole-document replacement, explicit aggregate reads, full selected ranges and actual global layout invalidation are not small edits.

## Measured result

These are owner microbenchmarks, not keyboard latency. Each row uses 20 samples per version; the table reports observed p95. The raw distributions and deterministic work counters are linked by `final-metrics.json`.

| Operation | Before | Final | Work removed |
|---|---|---|---|
| Selection query group, 100k blocks | 667.62 ms | 0.04 ms | 1.6 million unrelated index entries become zero; four required identity reads remain |
| 120 text edits, 10k blocks | 524.21 ms | 6.42 ms | 120 root publications become one |
| Keyed DOM task replacement, 50k tasks | 327.12 ms | 20.00 ms | Repeated queue search/splice becomes keyed ordered-set maintenance |

The original Comments consumer passes twice with 10k co-located annotations: 70.620/70.143 ms p95 against the unchanged 100 ms budget. A distributed 10k edit takes 7.572 ms p95, updates one annotation/bucket, wakes once and touches no unrelated annotation. All 10k annotations really change in the co-located case; that work is not constant.

The final 30-target owner matrix contains 29 passes and the separate compiler-budget failure. Production 5k typing records 18.7/36.8 ms observed p95 on default/virtualized surfaces in the pinned integrated run. Further native select-all/delete/type/undo proof passes for automatic, staged and virtualized DOM; full deletion takes 84-87 ms to paint and undo restores the full document.

## Correctness and provenance

- `pnpm check:plite` passes all package/type gates and 710 Chromium tests, with eight explicit skips and zero coverage gaps.
- Final runner proof passes 232 Node and 25 Bun contracts, the 46-target registry check, package builds and public package typechecks. Scoped lint passes; donor benchmarks outside lint inclusion are covered by executable runs.
- Final manual replay covers Annotation mapping/teardown, Comments metadata and read-only behavior, four-peer Yjs typing/undo, native Chrome cut/paste/undo and exact selected-word formatting.
- All 412 Plite and 830 Plate runtime source files still match the strict proof. The production browser build, source identities and 23 proof artifacts are fingerprinted in `final-proof.json`.
- Best API, layer-plan and worker skill bodies match all eight checked source rules. Plate Next doctrine v135 and resource parity validate.

## Remaining cost and next owner

| Result | Verdict | Next work |
|---|---|---|
| Plate compiler: 10,468,015 type instantiations and 1.407 GB at 1,000 plugins | Existing compiler budgets fail; Plite runtime locality and public type correctness pass | Attribute the expanding Plate generic before a Best API cut |
| Core ten-insertion bursts: start/middle p75 5.24/11.16 ms against 5 ms | Frozen integrated timing gate remains red; this is not native key latency | Exact-engine allocation/GC and immutable-publication attribution |
| React whole-document replacement: one 923.89 ms sample, four at 60.8-82.2 ms | Tail is unresolved, not proved global rendering fan-out; the strict comparison remains red | Separate per-lane lifecycle allocation from replacement work; preserve the failed sample |
| Full output: canonical 10k replacement about 2.983 seconds; pagination interactions up to 190.8 ms | Linear work is not necessarily fast; no one-frame or constant-time claim | Measure the explicit full-output owner before changing its representation |

The diagnostic replacement run did not reproduce the 923.89 ms sample. It showed GC overlap in some mount tails, but did not establish the cause of the earlier replacement tail. No budget was raised and no green diagnostic replaced a red acceptance result.

This closes the scoped architecture audit and proven fan-out repairs, not a claim that every operation meets every latency budget. No commit, push, release or deployment is implied.
