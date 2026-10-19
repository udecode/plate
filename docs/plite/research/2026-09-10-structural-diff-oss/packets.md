# Promoted research packets

All 11 leads meet the Plite Research priority threshold. Scores rank investigation value, not architectures. Grade A means pinned local source and an exact behavior or runnable proof idea; it does not mean production passes.

## P01 — diff:content-continuity:composite-effects

- Evidence: grade A; [primary source](https://github.com/GumTreeDiff/gumtree/blob/dc2088281765e456b3574d230881c5a25ff93481/core/src/main/java/com/github/gumtreediff/matchers/MappingStore.java); exact slices and supporting sources in [read log](read-log.tsv).
- Finding: Move, split/merge, wrapper changes and text/property edits must compose on span correspondence rather than compete for one node-kind tag.
- Owner: Best API / Plite Plan. Packet: plan-packet.
- Adoption: [existing structural diff plan](../../../plans/2026-09-10-structural-document-diff.md), F36; native authored changes remains prerequisite.
- Verification: future: bun test packages/plitejs/src/diff; extend current native change/schema tests for F36.
- Baseline: the current annotated diff lacks this complete contract; the existing model probe only proves its declared bounded representation.
- Keep criterion: the named law and visible/native consequences pass on final implementation. A stub, absent test match or unchanged model witness cannot pass production.
- Failure decision: retain the requirement; reject or quarantine the failing candidate under its owning implementation/proof method.
- Status: promoted into design/proof requirements; production implementation is future work.

## P02 — diff:three-way-review:branch-contributions

- Evidence: grade A; [primary source](https://github.com/bhousel/node-diff3/blob/8226c27e074909241d72276c21215505a931665f/src/diff3.mjs); exact slices and supporting sources in [read log](read-log.tsv).
- Finding: Retain both branch deltas and all three alternatives before resolution, including clean deletions and shared edits.
- Owner: Best API / native authored. Packet: plan-packet.
- Adoption: [existing structural diff plan](../../../plans/2026-09-10-structural-document-diff.md), F35; native authored changes remains prerequisite.
- Verification: bun docs/plite/research/2026-09-10-structural-diff-oss/sources/semantic-probe.mjs (upstream witness only); future: authored/diff production cases.
- Baseline: the current annotated diff lacks this complete contract; the existing model probe only proves its declared bounded representation.
- Keep criterion: the named law and visible/native consequences pass on final implementation. A stub, absent test match or unchanged model witness cannot pass production.
- Failure decision: retain the requirement; reject or quarantine the failing candidate under its owning implementation/proof method.
- Status: promoted into design/proof requirements; production implementation is future work.

## P03 — diff:history-is-not-presentation:provenance

- Evidence: grade A; [primary source](https://github.com/ProseMirror/prosemirror-changeset/blob/e215757276357b64cf74f536552f3a5ef292fa1a/src/changeset.ts); exact slices and supporting sources in [read log](read-log.tsv).
- Finding: Native recorded identity and historical attribution cannot depend on inferred display simplification or update batching.
- Owner: Plite change/authored / Testing. Packet: test-packet.
- Adoption: [existing structural diff plan](../../../plans/2026-09-10-structural-document-diff.md), F19,F43; native authored changes remains prerequisite.
- Verification: future: bun test packages/plitejs/src/diff; extend current native change/schema tests for F19,F43.
- Baseline: the current annotated diff lacks this complete contract; the existing model probe only proves its declared bounded representation.
- Keep criterion: the named law and visible/native consequences pass on final implementation. A stub, absent test match or unchanged model witness cannot pass production.
- Failure decision: retain the requirement; reject or quarantine the failing candidate under its owning implementation/proof method.
- Status: promoted into design/proof requirements; production implementation is future work.

## P04 — diff:exact-baseline:atomic-import

- Evidence: grade A; [primary source](https://github.com/benjamine/jsondiffpatch/blob/a60db8a232f92ee4b987c14f43f77402885d1a5a/packages/jsondiffpatch/src/filters/arrays.ts); exact slices and supporting sources in [read log](read-log.tsv).
- Finding: Matching IDs or fuzzy patch success cannot authorize changes on a different content/frontier baseline.
- Owner: Native authored / Testing. Packet: test-packet.
- Adoption: [existing structural diff plan](../../../plans/2026-09-10-structural-document-diff.md), F21,F22; native authored changes remains prerequisite.
- Verification: bun docs/plite/research/2026-09-10-structural-diff-oss/sources/semantic-probe.mjs (upstream witness only); future: authored/diff production cases.
- Baseline: the current annotated diff lacks this complete contract; the existing model probe only proves its declared bounded representation.
- Keep criterion: the named law and visible/native consequences pass on final implementation. A stub, absent test match or unchanged model witness cannot pass production.
- Failure decision: retain the requirement; reject or quarantine the failing candidate under its owning implementation/proof method.
- Status: promoted into design/proof requirements; production implementation is future work.

## P05 — diff:readable-output:quality-corpus

- Evidence: grade A; [primary source](https://github.com/Wilfred/difftastic/blob/274d0a8f57291477cfbfb27bace0d82395d15c97/src/diff/shortest_path.rs); exact slices and supporting sources in [read log](read-log.tsv).
- Finding: Exact reconstruction alone cannot certify readable change markup; require the combined structural quality scenarios and ambiguous-wrapper examples.
- Owner: Verify Plate / Benchmark. Packet: test-packet.
- Adoption: [existing structural diff plan](../../../plans/2026-09-10-structural-document-diff.md), F39,F40; native authored changes remains prerequisite.
- Verification: future: pnpm --filter plite test:plite-browser:chromium --grep 'structural diff'; requires registered F37-F40 cases.
- Baseline: the current annotated diff lacks this complete contract; the existing model probe only proves its declared bounded representation.
- Keep criterion: the named law and visible/native consequences pass on final implementation. A stub, absent test match or unchanged model witness cannot pass production.
- Failure decision: retain the requirement; reject or quarantine the failing candidate under its owning implementation/proof method.
- Status: promoted into design/proof requirements; production implementation is future work.

## P06 — diff:schema-semantics:logical-structure

- Evidence: grade A; [primary source](https://codeberg.org/mergiraf/mergiraf/src/commit/b9a78df83d48a89961310dde67898dd1b355690e/src/matching.rs); exact slices and supporting sources in [read log](read-log.tsv).
- Finding: Matching and topology validation need schema-owned structural meaning; generic tree shape or commutative-order defaults are insufficient.
- Owner: Plite schema / Plite Plan. Packet: plan-packet.
- Adoption: [existing structural diff plan](../../../plans/2026-09-10-structural-document-diff.md), F06,F15,F41; native authored changes remains prerequisite.
- Verification: future: bun test packages/plitejs/src/diff; extend current native change/schema tests for F06,F15,F41.
- Baseline: the current annotated diff lacks this complete contract; the existing model probe only proves its declared bounded representation.
- Keep criterion: the named law and visible/native consequences pass on final implementation. A stub, absent test match or unchanged model witness cannot pass production.
- Failure decision: retain the requirement; reject or quarantine the failing candidate under its owning implementation/proof method.
- Status: promoted into design/proof requirements; production implementation is future work.

## P07 — diff:native-moves:concurrent-continuity

- Evidence: grade A; [primary source](https://github.com/loro-dev/loro/blob/d5da57dd2a91d735656808cbbe2a3f1c755c2441/crates/loro/src/lib.rs); exact slices and supporting sources in [read log](read-log.tsv).
- Finding: Move identity must survive competing placements, ancestor deletion, edits, serialization and reload; delete/insert simulation is not sufficient.
- Owner: Plite change / Yjs / Testing. Packet: test-packet.
- Adoption: [existing structural diff plan](../../../plans/2026-09-10-structural-document-diff.md), F20,F42; native authored changes remains prerequisite.
- Verification: future: bun test packages/plitejs/src/diff; extend current native change/schema tests for F20,F42.
- Baseline: the current annotated diff lacks this complete contract; the existing model probe only proves its declared bounded representation.
- Keep criterion: the named law and visible/native consequences pass on final implementation. A stub, absent test match or unchanged model witness cannot pass production.
- Failure decision: retain the requirement; reject or quarantine the failing candidate under its owning implementation/proof method.
- Status: promoted into design/proof requirements; production implementation is future work.

## P08 — diff:exact-payload:rendered-alternatives

- Evidence: grade A; [primary source](https://github.com/slab/delta/blob/dc17ca03e1d68ee729c8cd1ff790ebf96eb0fbec/src/Delta.ts); exact slices and supporting sources in [read log](read-log.tsv).
- Finding: Preserve formatting, atom payloads, real text sentinels and lossless coordinates; validate each rendered/resolved alternative against its source meaning.
- Owner: Schema / formats / Verify Plate. Packet: test-packet.
- Adoption: [existing structural diff plan](../../../plans/2026-09-10-structural-document-diff.md), F13,F14,F27,F41; native authored changes remains prerequisite.
- Verification: future: bun test packages/plitejs/src/diff; extend current native change/schema tests for F13,F14,F27,F41.
- Baseline: the current annotated diff lacks this complete contract; the existing model probe only proves its declared bounded representation.
- Keep criterion: the named law and visible/native consequences pass on final implementation. A stub, absent test match or unchanged model witness cannot pass production.
- Failure decision: retain the requirement; reject or quarantine the failing candidate under its owning implementation/proof method.
- Status: promoted into design/proof requirements; production implementation is future work.

## P09 — diff:presentation:granularity-count-filter

- Evidence: grade A; [primary source](https://github.com/ProseMirror/prosemirror-changeset/blob/e215757276357b64cf74f536552f3a5ef292fa1a/src/changeset.ts); exact slices and supporting sources in [read log](read-log.tsv).
- Finding: Presentation granularity and counts must retain exact effects, stable review IDs and full dependency selections.
- Owner: Plate UI / native authored. Packet: plan-packet.
- Adoption: [existing structural diff plan](../../../plans/2026-09-10-structural-document-diff.md), F37,F38; native authored changes remains prerequisite.
- Verification: future: pnpm --filter plite test:plite-browser:chromium --grep 'structural diff'; requires registered F37-F40 cases.
- Baseline: the current annotated diff lacks this complete contract; the existing model probe only proves its declared bounded representation.
- Keep criterion: the named law and visible/native consequences pass on final implementation. A stub, absent test match or unchanged model witness cannot pass production.
- Failure decision: retain the requirement; reject or quarantine the failing candidate under its owning implementation/proof method.
- Status: promoted into design/proof requirements; production implementation is future work.

## P10 — diff:bounded-work:quality-preserving-fallback

- Evidence: grade A; [primary source](https://github.com/Wilfred/difftastic/blob/274d0a8f57291477cfbfb27bace0d82395d15c97/src/diff/shortest_path.rs); exact slices and supporting sources in [read log](read-log.tsv).
- Finding: Measure candidate growth, alignment, canonical construction and rendering with explicit precision loss; source-code thresholds cannot define document semantics.
- Owner: Benchmark. Packet: benchmark-packet.
- Adoption: [existing structural diff plan](../../../plans/2026-09-10-structural-document-diff.md), F18,F28,F29,F39; native authored changes remains prerequisite.
- Verification: future: substitute production compare in docs/plans/artifacts/structural-document-diff/model-probe.mjs and run F28-F30 through Benchmark.
- Baseline: the current annotated diff lacks this complete contract; the existing model probe only proves its declared bounded representation.
- Keep criterion: the named law and visible/native consequences pass on final implementation. A stub, absent test match or unchanged model witness cannot pass production.
- Failure decision: retain the requirement; reject or quarantine the failing candidate under its owning implementation/proof method.
- Status: promoted into design/proof requirements; production implementation is future work.

## P11 — diff:topology-conflicts:preserve-order

- Evidence: grade A; [primary source](https://github.com/ASSERT-KTH/spork/blob/c1b35d81c44d61d883da7ca91ae0088b6b8f3f2f/src/main/kotlin/se/kth/spork/base3dm/TdmMerge.kt); exact slices and supporting sources in [read log](read-log.tsv).
- Finding: Content compatibility does not establish valid ordering or ancestry; conflicting placement and schema constraints require explicit decisions.
- Owner: Plite Plan / schema / Testing. Packet: plan-packet.
- Adoption: [existing structural diff plan](../../../plans/2026-09-10-structural-document-diff.md), F32,F41; native authored changes remains prerequisite.
- Verification: future: bun test packages/plitejs/src/diff; extend current native change/schema tests for F32,F41.
- Baseline: the current annotated diff lacks this complete contract; the existing model probe only proves its declared bounded representation.
- Keep criterion: the named law and visible/native consequences pass on final implementation. A stub, absent test match or unchanged model witness cannot pass production.
- Failure decision: retain the requirement; reject or quarantine the failing candidate under its owning implementation/proof method.
- Status: promoted into design/proof requirements; production implementation is future work.


The seven executable upstream witnesses cover jsondiffpatch, node-diff3 and diff-match-patch only. They demonstrate library contracts and failure modes, not Plite correctness. No Java/Rust suite, product browser implementation or proprietary comparison corpus ran.

All 14 structural quality scenarios become original fixtures under existing owners at S2/S4. Final package/native/browser closure follows Verify Plate; this research creates no second permanent feature or benchmark inventory.
