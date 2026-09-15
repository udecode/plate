# Remaining authored reload cost versus ProseMirror

Status: Complete

Objective:
Answer the user's follow-up, “Still a lot vs prosemirror no? Benchmark and find the cause,” with matched saved-document measurements and causal attribution of the remaining Plite cost.

Completion threshold:
Pin actual local loaded implementations; compare plain content and explicitly identified tracked-change representations at 100/1,000/10,000 changes; profile the full authored load and prove or reject its dominant owner with an isolated measurement. Preserve output content, attribution and continued editing checks. Use three decisive fresh-process samples for the 10,000 cohort, no percentile tails from small samples. A material intervention must exceed 20% and 1 second at 10,000 changes with nonoverlapping sample ranges.

Verification surface:
Headless saved JSON parse, editor construction and complete content reads, in both Bun and Node. The prior saved authored fixture is reused. No browser mount speed claim. ProseMirror plain/marked documents must never be described as equivalent to Plite's causal operation graph when they omit its semantics.

Constraints:
Current checkout; no publication. Two optimization trials were used in the preceding repair (first reverted, second kept). Preserve that tally and stop after the third trial if unsuccessful. Read-only profiling and comparison fixture variants are diagnostics; a changed implementation benchmark counts as the remaining third trial. Root owns all measurement and changes; reload_owner maps ProseMirror source read-only. No new public API or architecture is selected without its owning method.

Boundaries:
Saved-document load comparison and remaining cause. Previous receive-budget and whole-app-build issues are separate. Existing runtime authorization persists, but this follow-up's deliverable is a measured comparison and cause, not an unbounded redesign.

Blocked condition:
Unavailable equivalent ProseMirror tracked-change implementation is a comparison limitation, not a reason to substitute plain loading as full feature parity. Preserve mixed-workload and source-drift failures.

Source obligations:
User request above; Benchmark methodology owns parity, provenance, profiling and causal proof. Task workflow owns scope and final checks; Autogoal owns this acceptance ledger. Prior measurements and trial tally are retained in docs/plans/2026-09-12-authored-reload-performance.md.

## Benchmark Source

- request: Benchmark remaining reload versus ProseMirror and find the cause
- scope: Headless JSON document and tracked-change restoration
- invocation: $benchmark authored reload versus ProseMirror
- candidate-identity: fingerprint: comparison-after.mjs.sources.json records 262 loaded inputs and immutable bundle d8f2876482ced52642ab2ca7747205ff536c08b06845a8705b6ea0c939f05098
- plate-main-identity: N/A: main has no matching native authored persistence contract
- plite-identity: fingerprint: comparison-before.mjs.sources.json and comparison-after.mjs.sources.json; only positions.ts and decisions.ts differ in product source
- slate-identity: N/A: selected comparator is ProseMirror; Slate has no matching native authored contract
- named-symptom: 7.3-second Bun median after independent insertion batching; Node roughly 8 seconds
- final-artifacts: artifact: docs/plans/artifacts/authored-reload-prosemirror/

## Interaction Coverage

- first-interaction: pass: every fresh-process load packet verifies full content and a continued edit; headless only
- settled-interaction: pass: 113 existing document/ingress/checkpoint/change guards and position-batch differential tests; headless only
- route-scope: N/A: saved-document headless load, not navigation or DOM mount
- reporter-profile: N/A: previous reported figure comes from headless Bun

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | Complete source manifest and frozen bundle | Local ProseMirror revisions, package versions and actual source hashes | artifact: build manifests |
| lockfile / package manager | Same machine and runtime per pair; pinned loaded dependencies | Same runtime per pair | artifact: environment and source manifest |
| build mode / host / port | Source-built frozen bundles | Same | artifact: bundle hashes; no server |
| browser / machine / viewport / DPR | Bun and Node separately; Apple M5 Max | Same | artifact: per-packet environment |
| route / fixture / document / plugins | 100/1,000/10,000 paragraph documents, native authored or plain | Equivalent visible text; marked-change comparator explicitly narrower | artifact: fixture hashes and content oracles |
| setup / action / DOM strategy | Parse, construct, complete reads | Parse, construct, complete reads | artifact: stage timings; setup excluded |
| warmups / samples / interleave order | Fresh process; three samples at10,000, smaller diagnostic cohorts | Same | artifact: ordered packets |

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | Before/after bundles, 262-input manifests, summary.json dependency revisions; Bun 1.3.12 and Node 22.22.1 | none |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - main lacks matching native authored load | Exact original headless metric | none |
| 3 | plate-vs-plite-decomposition | yes | complete | Plain Plite 59/61 ms; empty authored 163/124 ms; full prior authored 6153/7026 ms, Bun/Node medians | none |
| 4 | owner-microbench-and-trace | yes | complete | Trial3 removes repeated position publication; Bun 6223 to 2544 ms, Node 7239 to 2435 ms, nonoverlapping ranges; profiles identify remaining decode/map work | none |
| 5 | product-mount-matrix | no | N/A: inapplicable - no page load or mount claim in this comparison | Scope headless | none |
| 6 | trusted-editing-matrix | no | N/A: inapplicable - internal headless restoration change makes no native-input or browser speed claim | Programmatic continued edits, durable anchors, retained deletions and checkpoint reload guards | none |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - selected comparator ProseMirror; Slate lacks native authored contract | ProseMirror comparison in owner trace lane | none |
| 8 | example-breadth | yes | complete | 70 comparison packets; 337 authored/Yjs tests; dense/sparse/moved-fragment/deleted-anchor/checkpoint guards; semantic limits below | none |
| 9 | large-and-stress | yes | complete | 100/1,000/10,000 cohorts; three paired 10,000 samples in both runtimes; original source target 2532 ms and unchanged source hashes | none |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: terminal cause recorded in Cause History
- lane: N/A: terminal cause recorded in Cause History
- comparable-baseline: N/A: terminal cause recorded in Cause History
- material-delta: N/A: terminal cause recorded in Cause History
- isolated-owner: N/A: terminal cause recorded in Cause History
- causal-intervention: N/A: terminal cause recorded in Cause History
- fix-class: N/A: terminal cause recorded in Cause History
- long-term-target: N/A: terminal cause recorded in Cause History
- decision-owner: N/A: terminal cause recorded in Cause History
- layer-plan: N/A: terminal cause recorded in Cause History
- compatibility-verdict: N/A: terminal cause recorded in Cause History
- fix-owner: N/A: terminal cause recorded in Cause History
- benchmark-command: N/A: terminal cause recorded in Cause History
- benchmark-rerun: N/A: terminal cause recorded in Cause History
- benchmark-rerun-result: N/A: terminal cause recorded in Cause History
- correctness-command: N/A: terminal cause recorded in Cause History
- correctness-rerun: N/A: terminal cause recorded in Cause History
- correctness-guard-result: N/A: terminal cause recorded in Cause History
- correctness-rerun-result: N/A: terminal cause recorded in Cause History
- resume-lane: N/A: terminal cause recorded in Cause History

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| reload-3 | owner-microbench-and-trace | kept | internal-implementation | Publish one final immutable position index per dense independent insertion batch through the existing position and record-tree owners | benchmark | N/A: internal implementation within existing owners | N/A: no public API or persistence-format change; durable origin/offset anchors, deleted ancestry and full validation preserved | packages/plitejs/src/authored/positions.ts; existing caller in decisions.ts | Two product files differ; same native fixture and complete-load oracle; isolated bulk position publication removes 59–66% of load time | pass: prior pre-fix guard and every baseline comparison packet validate full accepted/proposed content and continued editing | node docs/plans/artifacts/authored-reload-prosemirror/run-trial3.mjs | pass: trial3-run-order.json and summary.json; frozen 20% plus 1 second threshold passed in both runtimes | four-file guard in Commands | pass: trial3-guards.log 113 tests; positions-tests.log 5 tests including dense/sparse/checkpoint differential guards | comparison-before/after.mjs.sources.json; trial3-run-order.json; current-profile.md; after-profile.md |

Work Checklist:

- [x] Preserve request, previous evidence and trial limit.
- [x] Pin comparison implementations and document semantic parity.
- [x] Measure plain/marked/native load by runtime and cohort.
- [x] Isolate the remaining owner using profile and causal measurements.
- [x] Verify behavior and finish source-linked cause explanation.
- [x] Reconcile final artifacts and both plan validators.

## Comparison and parity

All timings are headless parse + construction + complete content readiness, with setup/fixture encoding and filesystem reads excluded. Plite includes accepted and proposed materialization; ProseMirror includes `Node.check()`, editor-state construction and complete text traversal. The marked arm also calls the suggestion plugin's decoration builder. No timer defers Plite validation or projection. Post-timer assertions verify full text, applicable attribution and operation counts, continued insertion, and unchanged previous content.

The fixture contains 10,000 paragraphs, 10,000 pending `q` insertions and 55 later pending `x` insertions. Native Plite restores the original 17,124,373-byte saved checkpoint, SHA-256 `ce7fd2af5239095064ece91c7ca2a07c19d94f4370f8684e81efcf35a673de6a`. ProseMirror marked JSON is 1,624,420 bytes; its changeset arm is 2,599,062 bytes. These are independently constructed equivalents of the accepted/proposed text, not equivalent causal histories.

| Representation at 10,000 paragraphs | Bun 1.3.12 median | Node 22.22.1 median | Meaning |
|---|---:|---:|---|
| ProseMirror plain document | 8.2 ms | 11.1 ms | Content, full schema check, state, complete text read |
| Plite plain document | 58.8 ms | 60.7 ms | Content, schema, runtime indexes, complete children read |
| Plite with empty authored extension | 162.6 ms | 123.7 ms | No saved changes; authored initialization overhead |
| ProseMirror suggestion marks | 16.6 ms | 31.8 ms | Accepted text derivable from insertion marks, proposal text, IDs/authors, plugin decorations |
| ProseMirror ChangeSet | 14.6 ms | 30.1 ms | Accepted/current documents and attributed changed ranges |
| Plite native authored, before trial 3 | 6152.5 ms | 7025.8 ms | Full persisted operations, causal metadata, accepted positions and proposal reconstruction |
| Plite native authored, after trial 3 | 2544.3 ms | 2435.3 ms | Same full native contract; paired candidate cohort |

Each 10,000 row uses three fresh processes. Plain-versus-plain exposes a separate 5–7x construction/read gap, but does not account for the multi-second history cost. The suggestion and ChangeSet rows omit Plite's causal dependencies, closed history and projection reconstruction. Their numerical gap is real; interpreting it as an equivalent-feature speed ratio would be false. No browser rendering or interaction latency is measured. All local ProseMirror package versions/revisions and MIT license metadata are in `summary.json`; actual loaded source bytes are independently hashed in both build manifests, including orderedmap 2.1.1. No third-party source was copied into product code.

## Cause and trial 3

The before CPU profile attributes about 3.9 seconds to the position-update loop inside `applyTextBatch`. That loop calls `replaceAuthoredPositions` for every insertion, repeatedly copying AVL paths, writing locator/origin record pages and validating/freezing intermediate snapshots. The document changes were already batched by trial 2; position publication was still incremental. The strongest cut is deleting those intermediate publications. The existing position and record-tree owners build one final balanced index, preserving all durable span metadata and the previous deletion ancestry. Sparse batches retain the incremental path when rebuilding all existing spans would cost more. No cache, new runtime owner, public API, stored-format change or deferred validation is introduced.

| Paired native reload | Before median (range) | After median (range) | Reduction |
|---|---:|---:|---:|
| Bun | 6222.9 ms (6191.9–6255.7) | 2544.3 ms (2498.1–2563.9) | 59.11%, 3679 ms |
| Node | 7239.1 ms (7210.0–7755.8) | 2435.3 ms (2394.8–2440.7) | 66.36%, 4804 ms |

Sample order alternates before/after and runtime order; source manifests differ in exactly two production files: `positions.ts` and its `decisions.ts` caller. The benchmark's only other source change is formatting and its optional profiling counter's equivalent increment spelling. The frozen 20% plus 1 second threshold is passed with nonoverlapping ranges in both runtimes. At 100 changes, exploratory single samples are Bun 83.6→78.0 ms / Node 85.8→78.0 ms; at 1,000, Bun 534.1→300.2 ms / Node 511.6→293.6 ms. These small-cohort samples are not tail estimates.

The post-fix profile still measures 2527 ms total: JSON parse 20.9 ms, construction 2505.4 ms, final view/read about 1 ms. The existing profiler records 1252.6 ms in proposal restoration, including 10055 canonical mapping calls totaling 551.1 ms. It also records 10056 state-reduction calls totaling 549.2 ms during checkpoint reconstruction. CPU samples show approximately 1.1 seconds under checkpoint record decoding; this includes nested validation/reduction and must not be added to its children. A separate whole-payload snapshot diagnostic takes 208 ms Bun / 350 ms Node including parse, so one strict ingress clone alone cannot explain the full load. Repeated history/index work remains the next measured target. Remaining profile attribution is a diagnosis, not another proven optimization or a claim that 2.5 seconds is acceptable.

## Commands

The build helper resolves the pinned local sibling source repositories into one shared dependency graph. Every worker validates its immutable bundle digest. Artifacts and full process order are retained in `docs/plans/artifacts/authored-reload-prosemirror/`.

```sh
bun docs/plans/artifacts/authored-reload-prosemirror/build-comparison.mjs \
  docs/plans/artifacts/authored-reload-prosemirror/comparison-after.mjs
node docs/plans/artifacts/authored-reload-prosemirror/run-comparison.mjs
node docs/plans/artifacts/authored-reload-prosemirror/run-trial3.mjs

# Exact original source reload target after trial 3:
bun --preload ./config/plite-source-aliases.ts \
  benchmarks/editor/benchmarks/plite-authored-reload-benchmark.ts \
  --size=10000 \
  --fixture=docs/plans/artifacts/authored-reload-performance/fixture-10000-proposed.json \
  --output=docs/plans/artifacts/authored-reload-prosemirror/final-original-target.json

# Four-file guard:
bun test --preload ./config/plite-source-test-setup.ts \
  packages/plitejs/test/document-change.test.ts \
  packages/plitejs/test/authored-ingress-contract.test.ts \
  packages/plitejs/test/authored-position-checkpoint-contract.test.ts \
  packages/plitejs/test/authored-changes-contract.test.ts
bun test --preload ./config/plite-source-test-setup.ts \
  packages/plitejs/test/authored-*-contract.test.ts \
  packages/plitejs/test/yjs/authored-contract.spec.ts
pnpm --filter plitejs typecheck
```

Do not rebuild `comparison-before.mjs` from candidate source. Its baseline bytes and manifest are retained. `run-comparison.mjs` intentionally measures that frozen baseline; `run-trial3.mjs` measures both preserved bundles. The one failed initial PM build used a nonexistent changeset `src/index.ts`; the successful builder uses its actual `src/changeset.ts` entrypoint.

Verification evidence:
`trial3-guards.log`: 113 passes. `positions-tests.log`: 5 passes, including dense and sparse batches, origin fragments in different document order, placement/properties, retained deletion ancestry, every durable anchor, checkpoint encode/decode and continued edits. `full-authored-yjs-final.log`: 337 passes across 17 files. Source-first package types: 13 successful tasks; affected lint passes. `final-original-target.json`: 2532 ms with full content/count/continued-edit checks and unchanged source hashes. No browser speed claim.

The first broad run's 336-pass/1-fail result is preserved in `full-authored-yjs.log`. Its format test assumed chronological order even when two edits share a millisecond and IDs break the tie. `format-baseline-reproduction-fixed-control.log` reproduces the failure with the pre-trial position caller, a tied clock and descending IDs. The test now verifies the actual author-to-ID mapping and insertion marker without assuming timestamp separation. The same tied-clock control passes (`format-tied-clock-proof.log`), then the full suite passes. This is a test-oracle repair, not another performance trial. The initial control's formatting-pattern miss remains in its separate log.

Decision trail: `.audit/authored-reload-prosemirror.tsv`. No active workspace transcript path was supplied; trail self-audit uses the current conversation and the cited execution artifacts rather than unrelated private task history.

Open risks:
2.5-second native reload remains materially slower than ProseMirror's narrower marked representation. The matched repair proves independent insertion restoration only; dependent, structural, inverse and property replay are not claimed faster. No memory/retention, new browser, full collaboration receive-budget or production app-build claim. Prior accepted-receive and unrelated production-build failures remain preserved in the preceding plan. Two prior trials plus this kept trial are recorded; no fourth implementation trial was opened.

Next action: None for this benchmark. Remaining history reconstruction/mapping is documented as a subsequent optimization target, with no fourth trial opened.
