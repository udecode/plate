# Editor performance phase 2

Status: complete locally. Ten retained work reductions have causal and correctness evidence; all five candidate dispositions are resolved. Final original schema proof passes 67/67 predicates. Final production Playground Enter passes the unchanged 16/32 ms budgets at 14.3/17.7 ms p95. Strict, packed, full browser matrix, native routes and both locality controls pass on reconciled final source. Phase 3 remains unstarted.

Objective:
Resolve selected shared runtime and schema costs with causal proof while retaining canonical changes, exact editing behavior, inference and frozen budgets.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-07-editor-performance-phase-2.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

Applied packs:
- none

## Benchmark Source

- request: User go after Phase 1 completion; accepted five-phase plan, Phase 2 only.
- scope: Shared mount/edit/update/change/publication/correction costs and U02/U10/U12/U26/U33.
- invocation: $benchmark only Phase 2 selected shared runtime and schema targets
- candidate-identity: fingerprint: next at a6afd55c30e97c74fe895d1ad005ca75413110f3; intake-source.json captures current Phase 1 baseline and target inputs.
- plate-main-identity: f366c3f35dd903bd346dc21ac60d9ce46be2dafe; historical identity only, main comparison not selected.
- plite-identity: fingerprint: Same current source as Plate; exact intake and per-packet fingerprints.
- slate-identity: N/A: selected Phase 2 is a current-owner intervention, no new external-editor comparison.
- named-symptom: Default update overhead, canonical change/replay ratios, sparse publication at 50k, collaboration replacement at 10k, inline normalization at 250, schema migration/type graph, mount/split/join/replacement/Enter.
- final-artifacts: artifact: docs/plans/artifacts/2026-09-07-editor-performance-phase-2/results.md; ten retained changes, five candidate dispositions, schema 67/67, production 14.3/17.7 ms, final strict/packed/matrix/native/control proof and command-policy-final-source-audit.json

First checkpoint:
- Copy every explicit requirement into checkable rows before measurement or
  code changes.
- Resolve source identities, host/build freshness, fixture/action comparability,
  correctness guards, and every default lane's applicability.
- All applicable lanes are selected by default. Only an explicit `only`
  invocation may mark otherwise relevant lanes
  `N/A: only - <reason>`. Use `N/A: inapplicable - <reason>` only for a lane
  that genuinely cannot apply.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: Finish Phase 2, report and stop
- start / deadline: 2026-09-07; no deadline
- final loop closure: All selected findings resolved or invalid comparisons replaced by verified contracts; remaining genuine failure prevents completion.

Completion threshold:
- All four accepted Phase 2 rows have complete evidence. Every required existing failure passes its frozen valid contract or has a source-proven invalid-comparison repair. Every candidate has keep/reject/inconclusive disposition without automatic fallback adoption. Native and type/schema correctness remain exact.
- Every applicable lane is complete or N/A with evidence.
- Every kept fix passes its exact benchmark rerun and correctness guard.
- Benchmark plan validation passes with `--complete` and the Autogoal checker passes. Autoreview is N/A on `next` under Task's explicit branch rule.

Verification surface:
- benchmark commands / artifacts: Original commands and frozen thresholds in target-contracts.json; immutable per-packet receipts in artifacts/2026-09-07-editor-performance-phase-2.
- correctness commands: Selected target correctness commands plus exact context, replay, fitting and input-inference guards; each completed row records its actual command and result.
- Browser / Chrome / device proof: Existing full-DOM cross-editor runner for matched measurements; owned Playground input runner after clock repair; actual normal/large routes through browser controls and existing Plite native specs. No raw-device claim.
- source/ref/fingerprint proof: Intake source and before/after hashes for each packet; final source/host readback remains required.

Constraints:
- Correctness and native editor behavior outrank metric movement.
- Do not hide latency with debounce, delayed work, changed fixtures, degraded
  DOM, or a narrower action.
- Do not create another benchmark target registry or permanent run ledger.
- A conclusive cause pauses later lanes; it does not complete the goal.
- A proven cause selects the best long-term durable target, not the cheapest
  compatible patch. Before stability, hard-cut API or architecture when that
  buys materially better lasting value; preserve only a named hard correctness,
  security, serialized-data, native-behavior, or runtime law.
- After a fix, rerun the exact red lane and correctness guard before breadth.
- Do not commit, push, open a PR, comment, publish, or release unless separately
  authorized.

Boundaries:
- allowed runtime/packages/apps: Existing Plite/Plate shared owners and affected www/plite routes.
- allowed benchmark/tests/fixtures: Existing registered targets/runners and scoped correctness guards; phase-specific receipts under artifacts/2026-09-07-editor-performance-phase-2.
- allowed baseline checkouts/hosts: Current root checkout only; same-source controls/source overrides and temporary owned hosts.
- non-goals: Phases 3–5, except a Phase 5 allocation/mapping/layout experiment proven necessary under the accepted pivot; no commits, pushes, PRs, external messages, release, scheduling or worktree.

Output budget strategy:
- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:
- A required host/correctness contract or user-only design decision is unavailable after independent probes are exhausted; repeated unchanged timing is never an acceptable substitute for causal evidence.

## Continuation audit

This historical continuation starts with seven measured owner changes and preserves rejected
experiments. The original 26-file handoff still matches in 25 files; the
concurrent type-only plugin update overload is preserved and identified in
`schema-reconfiguration-final-source.json`, together with the newly retained
editor-extension owner. The goal stays open under its original threshold.

- [x] Reconcile the full Poteto principles, Benchmark method and current plan.
- [x] Revalidate source and preserved failures without unchanged timing retries.
- [x] Probe deletion of the compiler's second canonical-model traversal.
  The private model has fixed fields; arbitrary property defaults still use
  `canonicalJson`. Preserve exact serialized bytes through an independently
  evaluated old-path oracle before timing. No public shape or lifetime changes.
- [x] Decide this candidate using six fixed B,C,C,B,B,C original-prefix packets,
  three warmups and thirty samples each; require at least 20% and 2 ms p95
  improvement beyond twice the larger IQR. A miss rejects the prototype.
- [x] If retained, rerun the original complete schema command and owning
  correctness checks; otherwise preserve the failure and select a different
  evidence-backed action. Do not repeat unchanged samples until green.
- [x] Complete a React fiber/component inventory for Playground Enter using
  the existing input runner with a disposable diagnostic hook. Existing
  installed profiler hooks cover selectors but do not establish a complete
  component denominator. Preserve native oracles, recorded compiler miss and
  original timing failures; instrumentation timings remain diagnostic.
- [x] Resolve the measured mark-state predecessor search: 180 searches consume
  128.6 ms across twenty Enter actions in the diagnostic. At the first text
  descendant of a block, no previous text can belong to that block. Test
  deleting that impossible search while retaining existing previous-node,
  void, inclusive-property, range and root semantics elsewhere. This is an
  internal implementation candidate owned by `getSelectionMarks` in
  `public-state.ts`; no cache, public API or notification policy is proposed.
  Before adoption require original semantic guards, eliminated search counts,
  and six fixed B,C,C,B,B,C full Playground Enter packets at the original
  five warmups/twenty measured actions. Keep requires >=20% and >=2 ms mutation
  p95 reduction beyond twice the larger IQR; original 16/32 ms gates remain.
- [x] Probe repeated mark resolution for the same published snapshot. Nine
  formatting selectors account for 130.7 ms across twenty Enter actions in
  `playground-selector-diagnostic.json`. A disposable private snapshot-derived
  result may remove repeated computation; keep transactions uncached, bind the
  compiled schema, and preserve independent returned values. No public state,
  subscription or notification contract changes. First prove actual repeated
  computation counts and the original mark/read/transaction/root laws. Before
  adoption require six fixed B,C,C,B,B,C original Playground packets, >=20%
  and >=2 ms mutation p95 improvement beyond twice the larger IQR. Keep the
  original 16/32 ms gates. A miss rejects the prototype, without timing retries.
- [x] Probe U02's repeated drag-handle table-selection subscriptions through
  the existing `DndInteractionContext` in registry `dnd.tsx`. Preserve the same
  table query, optional-table behavior, synchronous updates, root/view scope,
  lazy drag activation and cleanup. Move no table algorithm or feature state.
  The repeated unit is one handle; one root selector should replace the
  identical per-handle commit selectors. Keep only with >=25% fewer global
  checks and neutral latency (no >5% p95 regression), or >=15% p95 gain, using
  the original U02 gate. First count with the current listener probe; then
  six fixed B,C,C,B,B,C original Playground Enter packets. Validate absent
  tables, expanded/collapsed table selection, separate editors and unmount.
  Final production rerun, registry generation and exact browser proof remain
  required after a passing pre-acceptance receipt.
- [x] Diagnose equivalent schema reconfiguration at
  `prepareRecordPublication` in `editor-extension.ts`. The current code builds
  a declarative registry before resolving API factories, then builds the final
  registry. Prove how much of the equivalent-schema operation the first build
  consumes when no installed extension has an API factory. A disposable
  internal probe may omit that preparatory build only when no factory uses it;
  preserve factory context, schema validation, migration, atomic publication,
  lifecycle callbacks and compiler identity. Before adoption require six fixed
  B,C,C,B,B,C original-prefix packets with thirty reconfigurations each, at least
  20% and 0.5 ms p95 reduction beyond twice the larger IQR. Keep the original
  full-command schema budgets and correctness guards.
- [x] Probe exact-first property resolution in `schema-compiler.ts`. The
  current resolver constructs all prefix candidates before checking an exact
  key. Preserve exact-key precedence, sorted prefix precedence, contextual
  target checks and null fallbacks. Delete eager candidate-array construction
  and prefix checks after a successful exact match; add no cache or public
  shape. Count actual prefix checks for both arms and compare against the
  original resolver over exact, prefix, unmatched and contextual cases before
  timing. Use six fixed B,C,C,B,B,C original query-prefix packets with all
  fifteen samples of fifty thousand queries and two thousand warmup queries.
  Keep requires >=20% and >=20 ns exact-query p50 reduction beyond twice the
  larger IQR, with no >5% p50 regression in either prefix cohort. Preserve all
  original complete-command limits and require final-source correctness.
- [x] Attribute the remaining original compilation failure with exclusive
  compiler-phase durations and allocation counts on the unchanged full-prefix
  corpus, three warmups and thirty samples. Preserve final source through
  source-bound diagnostic overrides. Instrumentation is diagnostic only;
  select a further intervention only from measured ownership and hard laws.
- [x] Probe native JSON key ordering for the compiler-owned canonical model.
  The exclusive diagnostic locates 28.2% of compile work in canonical string
  construction and 13.2% in unchanged FNV hashing. Replace only the model's
  temporary canonical clone with native JSON serialization plus ordered object
  keys; retain the public/default canonical JSON path and exact UTF-16 hash.
  Prove every serialized byte against the original path over compiler/model
  laws and adversarial JSON defaults before timing. Count removed array/object
  canonicalization work. Six fixed B,C,C,B,B,C original compile-prefix packets
  retain three warmups/thirty samples and original typecheck/GC setup. Keep
  requires >=20% and >=2 ms p95 improvement beyond twice the larger IQR;
  otherwise reject without timing retries. No persistent cache or API change.
- [x] Verify the Playground build-mode contract before further notification
  changes. The existing failed packets use `next dev`; Benchmark's product
  comparison method requires production-mode hosts. Keep the actual
  `/blocks/playground` route, complete EditorKit, native/model handle, original
  five warmups/twenty actions and 16/32 ms limits. Capture one current-source
  development control, then build current package artifacts and the same
  production route. Record all source/build/asset identities and preserve the
  development failure. This is a host-contract investigation, not a product
  speedup claim or permission to substitute smaller fixtures.
- [x] Probe streaming the compiler-owned canonical model directly into the
  existing exact UTF-16 FNV fingerprint. Keep the public JSON/default path,
  integer-key ordering, escapes, array holes and immutable schema identity.
  Delete temporary canonical container clones and the complete intermediate
  string; retain eager fingerprint completion inside the measured compile.
  First compare every streamed hash with the original serializer/hash over
  compiler laws and adversarial JSON defaults. A cheap isolated phase probe
  may reject the candidate before full sampling. Adoption requires the same
  fixed six original-prefix packets, >=20% and >=2 ms p95 improvement beyond
  twice the larger IQR, followed by the unchanged full-command gate.
- [x] Probe direct serialization from the already compiled structures, without
  constructing the temporary canonical model. Preserve all sorted array order,
  fixed object-key order, generic/default JSON validation and exact eager FNV
  bytes. Use native JSON serialization for complete leaf structures. First
  compare serialized bytes against the original model across all existing
  compiler/contract/default laws, then use an isolated phase probe to reject
  an unpromising result cheaply. Adoption retains the fixed six original-prefix
  packets and >=20%, >=2 ms, twice-IQR gate and original full-command proof.

The DnD subscription target passes pre-acceptance on frozen production builds.
Delete the identical selector from each handle and reuse the existing private
root context; table state and table algorithms retain their current owner.
The root remains necessary for editor/view scope, drag activation and cleanup.
No public API or second store is introduced. Diagnostic callbacks fall from
137 to 78 per Enter (43.07%). Six fixed production packets preserve 120 trusted
actions and all original 16/32 ms gates. Pooled mutation p95 is 16.0/15.8 ms;
this is neutral latency, not a claimed speedup. Matching workspace source maps,
identical emitted CSS and immutable asset hashes isolate the DnD intervention.
The exact final source passes the original native runner at 15.4/28.0 ms p95,
four lifecycle cases, two native Chromium cases, source-first integration types
and scoped lint. Registry generation emits the single shared selector.
Interactive desktop Enter/undo and a 390px row-selection check pass.
Registry changelog N/A: private subscription placement preserves behavior,
installation shape and public API; there is no latency speedup claim.
`dnd-shared-selection-final-source.json` records the source and proof hashes.

The exact-first lookup target passes pre-acceptance. All six packets preserve
the complete static runtime source identity and original query loops. Exact
query p50 falls from 1654.245 to 759.01834 ns: 54.12%, with an 895.22666 ns
reduction above the predeclared 883.55336 ns noise floor. Both prefix cohorts
remain neutral; their individual reductions are not separate causal claims.
Actual prefix checks fall from 10000 to zero across 1000 exact queries, and
from 10000 to 5500 in each prefix cohort. All 48 focused tests pass, including
1081 queries compared against the original resolver. Benchmark owns this
`internal-implementation` change in `schema-compiler.ts`; no public shape or
layer plan changes. The strongest valid cut is to delete eager prefix work
and candidate-array allocation while retaining contextual fallback order.
The final original command passes exact lookup at ratio 0.188578 <=0.5 and
66 of all 67 predicates. Compilation is the sole remaining schema failure,
at 25.022417 ms p95 versus 16. All 48 final tests, 11 typecheck tasks, scoped
lint and four native browser tests pass on the exact measured source. All
254 complete-command runtime/configuration inputs remain stable. See
`property-lookup-final-source.json` and `property-lookup-final-gate-audit.json`.

The preparatory-registry target passes pre-acceptance. The six fixed packets
retain all 180 samples, including long pauses: baseline/candidate p95 is
10.07375/4.838542 ms, a 51.97% reduction beyond the 2.726334 ms noise floor.
Independent original-corpus counts fall from sixty registry builds to thirty
across thirty exact reconfigurations. All 90 focused tests pass through the
source-bound override. This is an `internal-implementation` change owned by
Benchmark at `prepareRecordPublication` in `editor-extension.ts`; no public
API, persistent cache or runtime layer changes. The strongest valid cut is to
omit an unused API-context build. Retain that build when an API factory needs
the guarded candidate contributions, and retain the final validated registry
for every publication. The original full command passes reconfiguration at
3.902458 ms p95, ratio 1.043717 <=1.05. The retained source passes 90 focused
tests, 11 typecheck tasks, scoped lint and four native Chromium tests. Exact
post-check fingerprints are in `schema-reconfiguration-final-source.json`.
The full schema command passes 64 of 67 original predicates; compilation,
exact-property lookup and the 1000-contribution previous-revision cache still
fail. Direct evaluation of the original validator corrects the earlier
hand-counted audit to 65 of 67, preserving its same two failures and raw receipt.

The raw timing source guards retain their failures. Separate static runtime
and actual type-program inventories prove the Yjs, drawing and tag edits
unreachable from this measured runtime. A concurrent type-only plugin update
overload emits no runtime code, but changes the source for the independent
type-budget proof. No timing sample was discarded or repeated when resuming
the fixed sequence. See `schema-reconfiguration-source-exclusions-v5.json`,
`schema-reconfiguration-comparison-results.json` and
`continuation-owned-source-readback.json`.

The complete diagnostic fiber walk records 6,732 fibers in 400 component
families and 179.3 ms of exclusive render work across twenty measured Enter
actions. The separate listener probe records 137 commit callbacks per action,
132 from runtime-state selectors. The selector-family probe locates 66 repeated
table-selection checks per action in the drag handles, but these account for
only 14.0 ms across twenty actions; formatting selectors dominate elapsed
selector work. Four compiled-model-revision hook call sites do not establish
that model publication is the main notification cost. Diagnostic durations
from different probes are not a comparable baseline or additive total.

The remaining compilation diagnostic accounts for every exclusive phase of
thirty original corpus compilations. Splitting the fingerprint phase locates
28.2% in canonical serialization and 13.2% in the unchanged UTF-16 hash;
relations/lookups account for 12.9%, and model construction for 8.8%.
Classification and selector conflict scans account for 3.7% and 3.6%; those
counts do not justify a new optimization as the main residual cause. The
native JSON prototype removes 13523 generic canonicalization visits,
including 764 array clones, and retains 1425 ordered temporary objects per
compilation. Its original-byte oracle passes all 1470 comparisons in 64 tests,
including integer-like keys, Unicode, null-prototype objects and nested JSON
defaults. A sparse-array test input was rejected by the unchanged public
schema builder; that invalid fixture was corrected before the passing run.
The native JSON candidate is rejected. All 180 fixed samples and complete
runtime identities are preserved; baseline/candidate p95 is 18.547792 /
13.906625 ms. The 25.02% reduction passes the percentage and absolute gates
but misses the 9.934084 ms noise floor. No production serializer change is
retained and no unchanged timing retry is authorized. See
`native-model-json-comparison-results.json`, `compiler-hash-phases-summary.json`,
`native-model-json-count-results.json` and
`native-model-json-oracle-correctness-02.log`.

The first-text predecessor-search prototype is rejected. The final fixed six
packets have mutation p95 27.7/28.2 ms for baseline/candidate, a 0.5 ms
regression inside the 4.4 ms noise floor. All 120 measured Enter actions retain
exact native/model results and stable source identities within and between
packets. The candidate passes 153 focused semantic tests but fails the
predeclared timing requirement; its source was restored byte-for-byte. The
earlier packet interrupted by concurrent math edits remains invalid. This is
a rejected intervention, not resolution of the original Playground budget.

The private mark-snapshot prototype is also rejected. It reduces actual mark
computations from 180 to 20 over twenty Enter actions, but the fixed six-packet
comparison yields p95 35.7/31.2 ms: 12.61% versus 20% required, with a 6.4 ms
noise floor exceeding the 4.5 ms reduction. All 120 measured actions pass native
guards. A 156-test comparison against the original computation covers result
independence, draft rollback and named-root behavior. The first CLI preload
did not apply the prototype; only the later source-bound wrapper proves it.
The first timing set was invalidated by concurrent block-list source edits;
the final set has stable source within and between all six packets. Product
source is restored; no new cache is retained.

The second-model-traversal prototype is rejected. Six fixed packets give
baseline/candidate p95 17.67125/17.37175 ms, a 1.69% reduction versus 20%
required, with a 7.09817 ms noise floor. The original corpus contract hash is
unchanged. All 58 compiler/model/law tests pass through a wrapper that imports
the source override explicitly and records its applied hash. The first two
flag-based test runs never applied the override, and a third invocation ran
no tests; those receipts do not prove prototype correctness. No product source
changed. See `schema-model-comparison-results.json`,
`schema-model-oracle-correctness-04.log` and
`schema-model-oracle-applied-04.jsonl`.

## Interaction Coverage

- first-interaction: pass: command-policy-final-native-smoke.json covers six Plate/Plite full-DOM cohorts at 100/1000/10000 blocks and 48 exact native actions; command-policy-final-route-normal.json and command-policy-final-route-large.json verify both actual routes at 1000/10000 blocks
- settled-interaction: pass: command-policy-final-production.json preserves twenty exact Enter/model guards after five warmups; command-policy-final-interactive.json records trusted pointer Enter, two undos/two redos and narrow typing with exact restoration
- route-scope: pass: /dev/editor-perf and /examples/plite/huge-document on verified final production build vyXsXVgGwIOhBhCn4YHD8, port 3339; /blocks/playground on build 6SIdKk5nUtvvugGYF1e0z, port 3338; owned hosts stopped, viewport restored and own tab closed
- reporter-profile: N/A: no live reporter profile specified; unrelated user tabs preserved. Physical-device behavior and universal caret visibility are outside the proved claims.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | Current next and per-packet fingerprints | Same runtime with explicit harness version | artifact: intake-source.json and per-packet sources-before/after.json |
| lockfile / package manager | pnpm 9.15.0; unchanged lockfile | Same lockfile and runtime | artifact: environment.json and per-packet source fingerprints |
| build mode / host / port | Source-first Bun headless; browser build captured at route intake | Same host, no concurrent owned timing jobs | artifact: environment.json; per-target command.log |
| browser / machine / viewport / DPR | macOS-26.3.1-arm64-arm-64bit-Mach-O; Bun 1.3.12 | Same machine/runtime; browser metadata required before browser packets | artifact: environment.json, command-policy-final-production.json and command-policy-final-routes-receipt.json record the actual final hosts and browser packets |
| route / fixture / document / plugins | Live registered target cohorts | Same cohort; semantic contract repaired explicitly where invalid | artifact: target-contracts.json and update-policy-semantic-probe.json |
| setup / action / DOM strategy | Exact registered commands; no DOM in headless targets | Equal semantic action in all update-policy lanes; original mismatch retained | artifact: target-contracts.json and six update-policy packets |
| warmups / samples / interleave order | Original registered sampling, no narrowed defaults | Same packet rotated lanes; fixed three-run policy aggregation | artifact: update-policy-results-checkpoint.json; target sources |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Accepted parent Phase 2 and requirement rows P2-R1 through P2-PROOF below |
| Timed checkpoint parsed | yes | No requested duration; finish Phase 2 and stop |
| `benchmark` source and methodology read | yes | Benchmark and methodology read at intake; relevant performance lenses and Poteto principles refreshed |
| Task plan reused; standing Autogoal request or explicit opt-out resolved | yes | This single phase plan owns the active native goal under the standing request |
| Candidate and baseline identities recorded | yes | intake-source.json, exact original-owner backups and per-packet source fingerprints |
| Target/runner discovery completed from current source | yes | target-contracts.json resolves ten selected registered targets; existing browser runners identified |
| Host/build/fixture freshness proved | yes | environment.json and headless before/after source hashes; browser host freshness required at its lane intake |
| Correctness oracle identified | yes | Original registered semantic guards plus exact contextual/default, projected-root, replay and inference checks |
| All default lanes inventoried | yes | Nine ordered lanes below; only external/main comparisons excluded by the selected phase |
| `only` narrowing explicitly authorized or N/A | yes | User selected execution of parent Phase 2 only |
| Browser/native proof strategy selected | yes | Verify Plate source-first owned app, existing native specs, interactive controls and full-DOM benchmark |
| Output budget strategy recorded | yes | see above |
| Commit/PR/release authority recorded | yes | no mutation authorized by default |

Work Checklist:
- [x] Every explicit scope, comparison, timing, stop condition, deliverable,
      verification surface, and success criterion is recorded.
- [x] Short objective, threshold, verification, constraints, boundaries, and
      blocked condition are concrete.
- [x] Default lanes remain in diagnostic order; every N/A row has a reason.
- [x] Candidate/baseline signatures prove comparable source, fixture, action,
      build, browser, machine, and sampling.
- [x] Primary metrics match the visible user operation; proxies stay labeled.
- [x] Samples expose p50/p75/p95/p99 only when sample count supports them,
      plus max, absolute/relative delta, and noise evidence.
- [x] Red lanes are not called causal without the conclusive-cause gate.
- [x] A proven cause pauses later lanes before another expensive benchmark.
- [x] Every proven cause records its fix class, best long-term target, decision
      owner, layer plan, compatibility verdict, and implementation owner.
- [x] `public-api` and `runtime-architecture` causes run `best-api`, then
      `plite-plan`, `plate-plan`, or both before implementation. Broad accepted
      execution may use `task autonomous`; target selection may not.
- [x] One isolated owner is fixed, then the exact benchmark and correctness
      guard rerun before breadth resumes.
- [x] Failed reruns invalidate or continue the same cause; they do not skip to
      a different green metric.
- [x] Green reruns resume the first pending applicable lane.
- [x] Every packet has keep/revert/invalidate/quarantine/defer and next-owner
      evidence.
- [x] Harness/metric/host defects are repaired before product optimization.
- [x] Final handoff reports candidate/baseline identities, lane status, first
      conclusive cause, metrics, fix/reruns, resumed breadth, and residual risk.

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | Intake and immutable per-packet identities; command-policy-final-source-audit.json matches all final proof inputs and frozen outputs | Owned production hosts stopped; no source or publication transition |
| 2 | current-vs-main-product-smoke | no | N/A: only - current-owner interventions selected | Accepted Phase 2 selects current-owner interventions; no new main or external comparison | Excluded by selected phase |
| 3 | plate-vs-plite-decomposition | yes | complete | Equal-command/prepared-input repairs and sparse causal comparison; preserved matched Plate/Plite distributions and final native refresh | Retain measured fingerprints; no additional cross-editor speed claim |
| 4 | owner-microbench-and-trace | yes | complete | Ten retained work reductions and five candidate dispositions; final original schema passes 67/67 and production Enter passes 14.3/17.7 ms | Preserve all prior failed/rejected packets and source-specific causal claims |
| 5 | product-mount-matrix | yes | complete | 180 measured mounts and six decomposition rows at recorded source; final native smoke refreshes both editors at 100/1000/10000 blocks | Matched distributions remain descriptive; final smoke is correctness proof, not a new timing distribution |
| 6 | trusted-editing-matrix | yes | complete | 1440 measured actions at recorded source; final 48 native smoke actions, actual normal/large routes and twenty original production Enter guards pass | Original 16/32 ms production limits pass; retain frame and caret-visibility limits |
| 7 | plite-vs-pinned-slate | no | N/A: only - current-owner interventions selected | Accepted Phase 2 selects current-owner interventions; no new main or external comparison | Excluded by selected phase |
| 8 | example-breadth | yes | complete | Final actual routes plus canonical matrix: Chromium 743/8, Firefox 636/115, WebKit 657/94, mobile 345/406 and mobile WebKit 2/0 pass/skip | All 3006 selected rows accounted for; no missing, duplicate or unexpected outcomes |
| 9 | large-and-stress | yes | complete | Final 10k native routes and schema migration/clipboard/locality pass; original Yjs 10k control and all 18 membership/query guards pass on 1321 stable inputs each | Original sparse/correction causal evidence retained; no Phase 5 adoption |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: all retained causes have terminal evidence in Cause History; no active cause
- lane: N/A: all retained causes have terminal evidence in Cause History; no active cause
- comparable-baseline: N/A: all retained causes have terminal evidence in Cause History; no active cause
- material-delta: N/A: all retained causes have terminal evidence in Cause History; no active cause
- isolated-owner: N/A: all retained causes have terminal evidence in Cause History; no active cause
- causal-intervention: N/A: all retained causes have terminal evidence in Cause History; no active cause
- correctness-guard-result: N/A: all retained causes have terminal evidence in Cause History; no active cause
- fix-class: N/A: all retained causes have terminal evidence in Cause History; no active cause
- long-term-target: N/A: all retained causes have terminal evidence in Cause History; no active cause
- decision-owner: N/A: all retained causes have terminal evidence in Cause History; no active cause
- layer-plan: N/A: all retained causes have terminal evidence in Cause History; no active cause
- compatibility-verdict: N/A: all retained causes have terminal evidence in Cause History; no active cause
- fix-owner: N/A: all retained causes have terminal evidence in Cause History; no active cause
- benchmark-command: N/A: all retained causes have terminal evidence in Cause History; no active cause
- benchmark-rerun: N/A: all retained causes have terminal evidence in Cause History; no active cause
- benchmark-rerun-result: N/A: all retained causes have terminal evidence in Cause History; no active cause
- correctness-command: N/A: all retained causes have terminal evidence in Cause History; no active cause
- correctness-rerun: N/A: all retained causes have terminal evidence in Cause History; no active cause
- correctness-rerun-result: N/A: all retained causes have terminal evidence in Cause History; no active cause
- resume-lane: N/A: all retained causes have terminal evidence in Cause History; no active cause

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P2-POLICY-CONTRACT | plate-vs-plite-decomposition | kept | internal-implementation | Compare equal semantic command dispatch under unchanged update-policy thresholds | benchmark | N/A: benchmark repair, no runtime architecture change | N/A: internal benchmark repair preserves runtime command semantics | benchmarks/slate-v2/donor/core/current/update-policy.mjs | Original proxy/callback dispatch zero commands; one-shot dispatches one; equal-command repair removes ratio failure without changing runtime | pass: semantic probe and existing command boundary contract | bun --preload ./config/plite-source-aliases.ts benchmarks/slate-v2/donor/core/current/update-policy.mjs | pass: corrected median-of-three default ratio 1.033653 <=1.05; all policy ratios <=1.15 | bun test --preload ./config/plite-source-test-setup.ts ./packages/plitejs/test/update-policy-contract.ts ./packages/plitejs/test/command-spec.test.ts | pass: 66/66 tests | update-policy-results-checkpoint.json; update-policy-semantic-probe.json; six immutable run receipts |
| P2-CHANGE-CONTRACT | plate-vs-plite-decomposition | kept | internal-implementation | Compare canonical changes on the same prepared immutable input while measuring cold construction separately | benchmark | N/A: benchmark repair, no runtime architecture change | N/A: internal benchmark repair preserves serialization and immutable input laws | benchmarks/slate-v2/donor/core/current/document-change.mjs | Mutable input reconstructs the entire index; prepared input reuses exact index and untouched node identities; all ratios pass under original limits | pass: change-preparation-probe.json across 100/1k/10k with exact replay and identity | bun --preload ./config/plite-source-aliases.ts benchmarks/slate-v2/donor/core/current/document-change.mjs | pass: final three-run maximum ratio 0.84 <=2 and all text-batch p95 <16.67 ms | bun test --preload ./config/plite-source-test-setup.ts ./packages/plitejs/test/document-change.test.ts ./packages/plitejs/test/document-change-laws.test.ts | pass: change-correctness.log | change-results.json; three immutable packets with source overrides and final-source proof |
| P2-SPARSE-CANONICALIZATION | plate-vs-plite-decomposition | kept | runtime-architecture | Delete repeated subtree canonicalization under the existing schema/representation owner using the already validated immutable before-root | best-api | plite-plan | preserve: correctness - canonical JSON and schema context; exact defaults, targets, revision, replay and immutable identity remain authoritative; private mechanics only | packages/plitejs/src/core/editor-schema.ts and packages/plitejs/src/core/representation.ts | Source-isolated node visits 537 to 13; final pooled p95 gain 57–78 percent across all four cohorts exceeds twice IQR | pass: 86 prototype tests with verified source overrides; exact replay/context probe | PLITE_SCHEMA_CONSTRUCTION_STRICT=1 bun --preload ./config/plite-source-aliases.ts benchmarks/editor/benchmarks/plite-schema-construction-benchmark.ts --output=tmp/plite-schema-construction-benchmark.json | pass: all six final packets and all four materiality guards; source-bound changed span 2 and boundary identity | bun test --timeout 60000 --preload ./config/plite-source-test-setup.ts packages/plitejs/test/incremental-schema-validation.test.ts packages/plitejs/test/schema-target-runtime.test.ts packages/plitejs/test/schema-validation-diagnostics.test.ts packages/plitejs/test/schema-laws.test.ts packages/plitejs/test/slice-fit-contract.test.ts benchmarks/editor/benchmarks/plite-schema-construction-benchmark.test.ts | pass: 88 tests; all 11 source-first type tasks | sparse-final-comparison-results.json; sparse-final-count-probe.json; sparse-final-correctness-02.log; sparse-typecheck.log |
| P2-TYPE-EVALUATION | owner-microbench-and-trace | kept | public-api | Keep exact nominal descriptor inputs and deferred schema/context projections without repeated full structural evaluation | best-api | plate-plan | preserve: correctness - exact callback inference, negative authoring inputs and nominal runtime identity remain mandatory | packages/platejs/src/lib/plugin/BasePlugin.ts, defineBasePlugin.ts, defineBasePlugin.internal.ts and Plite schema/extension witness types | Original 16-owner control reproduces 11.44m instantiations; final original fixture has 4.82m and stable source hashes | pass: constructor/source contracts and baseline-matched negative type controls | PLITE_SCHEMA_ARCHITECTURE_STRICT=1 PLITE_SCHEMA_TYPECHECK_BUDGET=1 bun --expose-gc --preload ./config/plite-source-aliases.ts benchmarks/editor/benchmarks/plite-schema-architecture-benchmark.ts --output=tmp/plite-schema-architecture-benchmark.json | pass: all five original deterministic type gates; full command retains independent runtime timing failures | pnpm check:plite; node tooling/scripts/check-plite-release-artifacts.mjs --keep | pass: strict source-first package checks and packed semantic consumers; exact bundle-size snapshots independently fail | type-final-control.json; type-final-ingress-package-comparison.json; final original schema receipt; type-packed-consumers-final.log; Best API source and Plate Next v163 |
| P2-ROOT-FIT-PASSES | owner-microbench-and-trace | kept | internal-implementation | Fit primary and declared root grammars once while preserving projected-root refitting | benchmark | N/A: private loop deletion under already accepted schema owner | N/A: no public schema or selection contract change | packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts | Root counts 2 to 1 and 4 to 2; nested projected refits preserved; paired 10k migration p95 improves 49.21 percent beyond twice IQR | pass: 184 exact source-overridden fitter/root/replay/history tests and mapped-selection probe | PLITE_SCHEMA_ARCHITECTURE_STRICT=1 PLITE_SCHEMA_TYPECHECK_BUDGET=1 bun --expose-gc --preload ./config/plite-source-aliases.ts benchmarks/editor/benchmarks/plite-schema-architecture-benchmark.ts --output=tmp/plite-schema-architecture-benchmark.json | pass: final 10k migration p95 1296.44 ms <2000 and width ratio 11.9463 <=15; full command's independent compile/equivalent timing gates fail | bun test --timeout 60000 --preload ./config/plite-source-test-setup.ts ./packages/plitejs/test/state-tx-public-api-contract.ts; pnpm check:plite | pass: 223 focused restored-fitter tests and final strict lane | fit-roots-comparison-results.json; fit-roots-candidate-probe-02.json; fit-index-reverted-correctness.log; final original schema receipt |
| P2-COMPILED-MEMBERSHIP | owner-microbench-and-trace | kept | internal-implementation | Index simple property targets using existing compiled type/group membership; retain contextual solver for its independent job | benchmark | N/A: private compiler indexing loop | N/A: identical complete compiled schema output and public query contracts | packages/plitejs/src/core/schema-compiler.ts | 22000 general satisfiability calls removed; identical serialized schema hash; final fixed six-packet p95 improves 28.51 percent beyond twice IQR | pass: 77 compiler/model/generated-law/schema tests on exact prototype source | Six fixed original full-prefix compile packets preserved in schema-compile-final-comparison-results.json; full original strict schema command in target-contracts.json | pass: paired p95 21.5435 to 15.4006 ms, delta 6.1429 ms >4.1287 ms noise; independent final full-command absolute gate fails | bun test --timeout 60000 --preload ./config/plite-source-test-setup.ts ./packages/plitejs/test/schema-compiler.test.ts ./packages/plitejs/test/schema-target-model-oracle.test.ts ./packages/plitejs/test/schema-compiler-laws.test.ts; pnpm check:plite | pass: exact compiler laws, original schema contract hash and strict final lane | schema-compile-final-comparison-results.json; schema-compile-membership-prototype-02.json; final original schema receipt |
| P2-FITTED-INDEX-REUSE | owner-microbench-and-trace | reverted | internal-implementation | Preserve canonical replay sharing when direct splice contains fresh JSON-equal nodes | benchmark | N/A: rejected private optimization | N/A: original immutable sharing contract restored | packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts | Six timing packets improved migration but final state/tx identity oracle fails only with index reuse | pass: original 187 selected fitter/root/history tests; later strict state/tx case exposed missing coverage | Fixed six migration packets in fit-index-comparison-results.json | fail: timing candidate invalidated by required immutable sharing failure | bun test --timeout 60000 --preload ./config/plite-source-test-setup.ts ./packages/plitejs/test/state-tx-public-api-contract.ts | pass: exact original fitter restored; 223 tests and final strict lane pass | replacement-identity-current-02.log; replacement-identity-fitter-control.log; fit-index-reverted-correctness.log |
| P2-API-CONTEXT-REGISTRY | owner-microbench-and-trace | kept | internal-implementation | Omit unused preparatory registry construction; retain guarded API-factory context and final validated publication | benchmark | N/A: private redundant build deletion under the existing registry owner | N/A: no public API or lifetime change | packages/plitejs/src/core/editor-extension.ts | Original thirty reconfigurations perform sixty registry builds versus thirty; all 180 fixed samples retained with 51.97 percent p95 gain beyond twice IQR | pass: 90 focused source-bound candidate tests | Original full strict plite-schema-architecture command with type budget enabled | pass: exact equivalent reconfiguration p95 3.902458 ms and ratio 1.043717 <=1.05; full command retains three independent failures | bun test --timeout 60000 schema-reconfiguration-final.test.ts; pnpm turbo typecheck --filter=./packages/plitejs; scoped lint; existing Plite Chromium schema specs | pass: 90 tests, 11 type tasks and four native Chromium tests on exact retained source | schema-reconfiguration-comparison-results.json; schema-reconfiguration-count-results.json; schema-reconfiguration-final-full.json; schema-reconfiguration-final-source.json |
| P2-EXACT-PROPERTY-LOOKUP | owner-microbench-and-trace | kept | internal-implementation | Resolve exact matches first and preserve contextual prefix fallback order without eager candidate arrays | benchmark | N/A: private resolver loop deletion | N/A: no public shape or compiled model change | packages/plitejs/src/core/schema-compiler.ts | 1000 exact queries perform zero rather than 10000 prefix checks; six fixed packets reduce p50 54.12 percent beyond twice IQR | pass: 48 tests including 1081 original-resolver oracle comparisons | Original full strict plite-schema-architecture command with type budget enabled | pass: exact-property ratio 0.188578 <=0.5; compilation remains the sole independent failure of 67 predicates | bun test --timeout 60000 on compiler, target oracle, compiler laws and schema-property-lookup; source-first types; scoped lint; existing native schema specs | pass: 48 tests, 11 type tasks and four native Chromium tests on exact measured source | property-lookup-comparison-results.json; property-lookup-count-results.json; property-lookup-final-source.json; property-lookup-final-gate-audit.json |
| P2-DND-SHARED-SELECTION | owner-microbench-and-trace | kept | internal-implementation | Delete per-handle table-selection subscriptions and reuse the existing editor-root context | benchmark | N/A: private subscription consolidation reviewed with Plate UI; no public shape or table owner change | N/A: private context and unchanged table state owner | apps/www/src/registry/components/editor/dnd.tsx | Diagnostic callbacks fall 137 to 78 per Enter; fixed six production packets preserve all 120 trusted actions and neutral p95 | pass: both source arms pass native DnD/table cases | Existing homepage input runner on the full production Playground; five warmups and twenty Enter actions | pass: pre-acceptance p95 16.0/15.8 ms, final original runner 15.4/28.0 ms within unchanged 16/32 limits | Four lifecycle cases, two native Chromium cases, source-first integration types, scoped lint, registry generation and interactive desktop/narrow controls | pass: exact retained owner matches measured candidate and generated payload | dnd-frozen-comparison-results.json; dnd-shared-selection-final-source.json |

| P2-ELEMENT-PATH-SCOPING | owner-microbench-and-trace | kept | public-api | Keep element payload and derived path reads under their existing independent owners; delete global cell-coordinate subscriptions | best-api | plate-plan | preserve: correctness - exact descriptor inference, derived equality, live row index, table spans, selection and lifecycle | packages/platejs/src/react/stores/element/useElementSelector.ts, usePath and registry table.tsx | Global callbacks 79 to 55; cell-index queries 480 to zero; zero added row/cell renders; fixed p95 16.9/16.8 ms passes U02 neutrality | pass: original selector laws and measured render counterfactual | Existing full production Playground runner, six fixed B,C,C,B,B,C packets | pass: 30.38 percent fewer callbacks with neutral latency; final original integration passes 14.3/17.7 ms | Native table suite, paint controls, source-first type contracts and final actual routes | pass: 12 native cases, five retry-free paint runs, 40 unit tests and final native route guards | element-path-production-comparison-results.json; element-path-adopted-proof.json; element-path-ready-table-v2-browser-receipt.json; command-policy-final-production.json; doctrine v164 |
| P2-AUTHORED-METHOD-LOWERING | owner-microbench-and-trace | kept | internal-implementation | Lower authored update methods once and combine compiler-owned defaults directly | benchmark | N/A: private duplicate lowering deletion under existing plugin construction owner | N/A: no public call shape or transaction lifetime change | packages/platejs/src/lib/utils/resolvePlugins.ts | General merger property visits 157920 to 50400, 68.09 percent reduction; all 7080 factories and twenty method calls retained | pass: 49 exact differential cases and 320 focused tests | Existing full production Playground runner, six fixed B,C,C,B,B,C packets | pass: frozen work and latency-neutrality gates; p95 delta inside noise so no latency-gain claim | Final differential corpus, focused package tests and source-first type tasks | pass: all 49 cases, 320 tests and 79 type tasks; superseding final strict and native checks pass | transaction-lowering-production-results.json; transaction-lowering-final-receipt.json; transaction-lowering-final-ast-parity.json |
| P2-COMMAND-POLICY | owner-microbench-and-trace | kept | public-api | Keep private break/delete policy in command handlers and omit empty prepared-spec metadata views | best-api | plate-plan and plite-plan | preserve: correctness - draft reads, schema fitting, exact rollback, metadata, callback inference and canonical history | OverridePlugin.ts, coreEditorCapabilityDefinition.ts and public-state.ts | Transaction group construction 7080 to 4640, 34.46 percent reduction; four isolated native arms attribute both deletions with no shifted work | pass: 196 baseline comparisons, 552 tests and 79 type tasks before adoption | Existing full production Playground runner, six fixed paired packets then original final-source command | pass: paired p95 21.5/20.1 ms inside noise; work/neutrality gates pass; final original 14.3/17.7 ms meets 16/32 limits | Final source-bound corpus, focused laws, source-first types, strict package and actual native routes | pass: 196 cases, 552 tests, 79 type tasks, twenty original native guards and full final strict lane | command-policy-profile-results.json; command-policy-production-results.json; command-policy-final-receipt.json; command-policy-final-production.json; doctrine v165 |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| Equal-command policy, original and corrected fixed triples | plate-vs-plite-decomposition | Original comparator bypasses command dispatch | Final default ratio 0.96830 <=1.05; three optional ratios <=1.15 | 66 focused cases plus strict final lane | keep benchmark repair | No runtime speed claim |
| Prepared canonical-change input | plate-vs-plite-decomposition | Mutable baseline pays different preparation | All three-run original <=2 ratios pass; 10k text-batch p95 11.54 ms | Exact replay and strict final lane | keep benchmark repair | Keep cold preparation separate |
| Sparse B,C,C,B,B,C prototype and final packets | plate-vs-plite-decomposition | Repeated canonicalization of untouched descendants | Four pooled p95 gains 57–78 percent, beyond twice IQR | Context/default/replay/identity guards | keep two-owner implementation | Residual immutable mapping/publication remains |
| Type graph variants and original-owner control | owner-microbench-and-trace | Repeated structural type evaluation | 11.44m to 4.82m instantiations; all original deterministic budgets pass | Exact callback/negative contracts; packed semantic consumers pass | keep nominal/deferred exact type changes; other variants reverted | Final reviewed size snapshots and plain packed check pass |
| Primary/named fit and compiler membership fixed six-packet comparisons | owner-microbench-and-trace | Duplicate root fit and satisfiability work | 10k migration p95 reduction 49.21 percent; compile paired reduction 28.51 percent | Exact nested-root/selection/compiler laws | keep measured owner reductions | Final original full schema passes all 67 predicates |
| Fitted-index reuse | owner-microbench-and-trace | Avoid repeated decoding with direct-splice index | Timing gain invalidated by required immutable sharing failure | Focused 187 missed state/tx identity; strict test detects it; reverted source passes 223 | reverted | Canonical replay retains sharing authority |
| Compilation order and temporary freezing | owner-microbench-and-trace | Suspected residual compilation owner | Both six-packet comparisons fail materiality/noise gates | Byte-exact source restored | reject | No unchanged timing retries |
| Final native/decomposition and actual routes | trusted-editing-matrix | Preserve native behavior and identify residual owners | Six decomposition attempts/48 actions pass; actual 1k/10k routes pass editing; final Playground timing passes | Final strict Chromium 743 pass, 8 skip; exact text/selection/focus | keep proof with explicit visual/timing limits | Final native correctness refresh preserves recorded distributions |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| Sparse structural publication, 50k | 60 per arm | p95 1276.03 ms; full distribution in artifact | p95 284.19 ms; full distribution in artifact | -991.84 ms, -77.73 percent | Exceeds frozen percent/absolute/twice-IQR gates | sparse-final-comparison-results.json |
| Compiler original full prefix | 90 per arm | p50 18.7342, p75 19.7926, p95 21.5435, max 25.236 ms; no p99 claim | p50 11.1498, p75 12.4626, p95 15.4006, max 16.4602 ms; no p99 claim | -6.1429 ms, -28.51 percent | IQR 1.8169/2.0643 ms; noise floor 4.1287 ms | schema-compile-final-comparison-results.json |
| Latest original schema compilation | 30, after three warmups | Same frozen corpus and 16 ms absolute gate | p50 6.891208, p95 9.739375 ms | Absolute gate passes | 1046 captured runtime/type/config path entries unchanged; integration result, no new causal gain claim | command-policy-full-schema.json |
| Latest Playground Enter | 20 after five warmups | Original 16 ms mutation and 32 ms second-frame limits | Mutation p50 12.8 ms, p95 14.3 ms, max 14.4 ms; second frame p95 17.7 ms | Both absolute gates pass | 806 verified production sources, byte-exact HTTP assets and 20 exact native/model transitions; no paint or causal latency-gain claim | command-policy-final-production.json |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Preserve frozen original metrics and correctness gates | pass: final schema 67/67; compile 9.739375 ms <16; clipboard fragment width 0.645636835 <=1.5; final production mutation/frame 14.3/17.7 ms within 16/32 |
| Benchmark plan structural validation | yes | Run normal semantic validator at checkpoints | pass: normal validator passes after the terminal cause/history reconciliation |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | pass: seven applicable lanes complete, two explicit scope exclusions, zero open lanes |
| Exact post-fix benchmark reruns | yes | Rerun kept owners against original contracts | pass: retained source-isolated controls, final original full schema and original production packet; source-bound historical evidence is not relabeled as current timing |
| Correctness/native behavior reruns | yes | Run named package and native proof | pass: final 196 differential cases, 552 focused tests, 79 type tasks, strict Plite lane, 48 native smoke actions and actual normal/large/narrow routes |
| Final source/host identity | yes | Reconcile final effective inputs against preserved receipts | pass: command-policy-final-source-audit.json matches schema 1046, strict/packed 3532 each, production 806 scripts, routes 659 scripts, native 839 sources, both 1321-input controls, canonical browser digest and frozen files; hosts stopped |
| Benchmark target/metric honesty | yes | Verify fixture, clocks, sample math and provenance | pass: semantic-command/prepared-input/frame repairs; all 108 final browser cells recomputed; source guard not overwritten |
| Durable fix decision | yes | Record technical owners, hard laws and strongest justified deletion | pass: Cause History and accepted targets below; five conditional candidate dispositions in results.md |
| Package/type/build proof | yes | Verify affected packages and consumer classes | pass: transaction-lowering-strict-commandpolicyfinal-receipt.json and transaction-lowering-packed-commandpolicyfinal-receipt.json; 3532 stable paths in each, 82 subpaths and 40 peer closures |
| Browser surface proof | yes | Inspect actual normal/large/narrow routes and canonical matrix | pass: actual routes and interactive Playground; command-policy-final-browser-matrix-summary.json accounts for 2383 passes and 623 declared skips with no missing/duplicate/unexpected rows |
| Changeset/release artifact | yes | Apply branch/package policy and preserve packed gate | pass: public selector changeset retained; tenth-change API names absent from origin/main so no additional changeset; all 29 reviewed size rows reproduced by generator and plain packed check |
| Agent rule/skill sync | yes | Regenerate Best API teaching and Plate Next version source | pass: Best API command-policy teaching, pnpm install, barrel/registry generation and doctrine v165 validation; prior package attestations preserved |
| Benchmark plan complete validation | yes | Run validator with --complete before completion | pass: command-policy-plan-complete.log and final document readback both exit zero |
| Final lint | yes | Run scoped formatting and lint checks | pass: earlier 45-file scoped lint plus command-policy-final-lint-renamed.log; final source is syntax-tree-bound to measured candidate; doctrine JSON validates |
| Timed checkpoint | no | N/A: no duration or deadline requested | Current packets close without starting Phase 3 |
| P1 autoreview | no | N/A: on next - Task prohibits Autoreview on this branch | Branch confirmed next before nontrivial mutation; no publication requested |
| Goal plan complete | yes | Run the Autogoal completion checker before marking the native goal complete | pass: command-policy-autogoal-complete.log and final document readback both exit zero |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | frozen targets, scope and source identities | No authority expansion |
| Ordered diagnosis | complete | three comparator/clock repairs and ten retained work reductions; five candidate dispositions | Preserve all failed/rejected experiments |
| Fix and exact rerun | complete | Final schema 67/67 and production 14.3/17.7 ms pass; ten retained changes have causal controls and exact correctness proof | No further intervention or unchanged timing retry |
| Remaining breadth | complete | Full canonical matrix, actual routes, final packed proof and two original locality controls pass with source identity | No further applicable lane |
| Review and closeout | complete | All original requirements map to immutable receipts, final source matches, and completion commands are recorded below | No Autoreview on next; report and stop before Phase 3 |

Findings:
- The original update-policy default/proxy median-of-three p95 ratio is 1.639263. Its baseline calls primitive tx.text.insert and bypasses semantic handlers; the current one-shot path deliberately dispatches a command. The corrected equal-command benchmark passes all original ratio limits with unchanged runtime. No runtime speedup is claimed.
- Canonical change/replay raw-input maximum ratio reaches 7.58; prepared-input final benchmark passes every three-run ratio with maximum 0.84, while preserving cold setup measurements. No runtime speedup is claimed.

Decisions and tradeoffs:
- Retain the existing schema, document, change and checked plugin-constructor owners. Delete repeated work; preserve canonical replay sharing. No second cache, state store, public runtime flag or renderer is introduced.
- Five conditional candidate dispositions and source-linked tradeoffs are recorded in results.md. Earlier shared-host failures remain preserved; final integration and verified production results are identified separately. No threshold or fixture is relaxed.

Harness/methodology repairs:
- Update policy artifact version 3 gives every lane the same semantic command and asserts final text/selection/semantic tags. Original six timings and source identities remain separate; no threshold change. Phase 2 runner reuses the previous serial archive wrapper and live registry with only output-directory relocation.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| Bun source override not applied in an early test attempt | 1 | Verify exact loader receipts before accepting proof | Corrected preload order proves original/transformed hashes; invalid receipt retained |
| Fresh JSON-equal root identity failure from fitted-index reuse | 1 | Restore only the fitter and replay the exact state/tx assertion | Candidate reverted byte-exactly; 223 focused tests and strict final lane pass |
| Promotion overscan assertion races real timeout; separate 5k semantic test times out | 1 strict packet | Control the documented overscan clock and use a semantic fixture timeout | Fake-clock focused test and strict final lane pass; product/budgets unchanged |
| Schema full-command timing failures | Multiple source-specific packets | Preserve failures; only changed-owner or predeclared fixed comparisons run | Resumed original full command passes 67/67 after actual runtime/type/config changes, with 1046 stable path entries; earlier failures remain preserved |
| Packed entrypoint-size mismatch | Multiple source-specific package packets | Preserve each golden, review exact dependency/source deltas and use the owned generator | Final 29 rows are accounted for; generator and canonical plain packed readback pass on stable final source |
| Concurrent source edits during closure | Multiple preserved builds and browser packets detailed below | Preserve interrupted receipts; execute final proof only on stable effective inputs | Final strict, packed, production, full matrix and source readback pass; all interruptions retain their original invalidated status |

Verification evidence:
- Final command-policy receipts: strict source-first package types/tests and runner contracts; canonical packed proof with all reviewed sizes; full five-project browser matrix; actual normal/large/narrow routes and final native smoke.
- The ten original headless targets retain their appropriate causal, semantic or diagnostic scope. Final original schema, Yjs and query/membership commands pass at current source; remaining unchanged-owner controls keep their original measurement identities. All source-isolated controls are linked from results.md.

Final handoff contract:
- goal plan / scope: This plan, Phase 2 only; complete local work and evidence; no publication
- candidate / baseline identities: intake-source.json and source-isolated controls retain measured identities; final builds 6SIdKk5nUtvvugGYF1e0z and vyXsXVgGwIOhBhCn4YHD8, exact emitted sources and command-policy-final-source-audit.json bind current proof
- completed / N/A / pending lanes: seven complete, two explicitly excluded, zero pending
- first conclusive cause: update-policy baseline bypassed semantic commands; repaired comparator without changing runtime
- baseline / latest / best metrics: results.md and immutable per-packet distributions; final original schema compile 9.739375 ms and production Enter 14.3/17.7 ms; no best-packet selection
- fix owner / changed files: ten retained schema/type/fitting/registry/lookup/subscription/selector/lowering/command-policy work reductions; table paint baseline repair and three comparator/clock repairs; exact owners in Cause History
- exact benchmark and correctness reruns: ten original target dispositions; final original full schema and production command; exact differential/focused/type guards; strict, packed, five-project matrix, actual routes and original Yjs/query controls
- resumed breadth: final 48 native smoke actions, actual 1000/10000-block Plate/Plite routes, 390px Playground interaction and source-stable original locality controls
- packet decisions: retained, rejected and invalidated evidence in Packet ledger, Cause History, decisions.tsv and results.md
- harness/methodology repairs: equal semantic dispatch, equal prepared input and frame clocks after expected mutation; raw browser source freshness failure preserved with supplemental byte-identical build proof
- residual claim limits / next owner: no selected Phase 2 budget or required behavior remains unresolved. Paired work reductions inside noise are not latency gains. Frame callbacks do not certify painting; universal caret visibility and physical devices remain outside the claims. Phase 3 requires its own request.

Timeline:
- 2026-09-07T13:07:00.874Z Benchmark goal plan created.
- 2026-09-08T10:01:27Z Final source audit matches every final proof inventory after original locality controls and full matrix.
- 2026-09-08 Final Benchmark --complete and Autogoal completion commands pass; Phase 2 closes locally before Phase 3.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | All selected Phase 2 performance, correctness, package, browser and source gates pass; final completion commands close this record |
| Where am I going? | Report completed Phase 2 and stop; Phase 3 remains unstarted |
| What is the goal? | Resolve selected shared runtime/schema costs under frozen budgets and native laws |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Actual performance-route fixed UI can obscure the caret; no universal visual visibility claim is made. Production frame callbacks do not prove completed painting; mobile viewport proof is not physical-device proof. All selected final package, performance, browser and control checks pass.

## Phase 2 obligations and frozen decisions

Source: [accepted phase plan](2026-09-07-editor-performance-phases.md), Phase 2; [experimental queue](artifacts/2026-09-07-editor-performance-research/wordgard-prosekit/unified-experiment-queue.md); Task workflow; Benchmark methodology; Autogoal checklist retention.

- [x] P2-R1: Re-measure normal/large full DOM mount, split/join, replacement and actual playground Enter; distinguish construction, conversion, correction, publication and DOM/layout.
- [x] P2-R2: Resolve default update policy and canonical change/replay budget failures; separately attribute 50k sparse publication, 10k collaboration replacement and 250-block inline normalization.
- [x] P2-R3: Resolve U02/U10/U12/U26 via counters and one-owner causal experiments; reject absent or ineffective opportunities.
- [x] P2-R4: Resolve U33 migration and deterministic type-instantiation/memory budgets, preserving callback inference and packed consumers.
- [x] P2-PROOF: Exact replay/correction/schema tests, source-first types, normal and large native route proof; preserve fast membership and Yjs locality controls.
- [x] P2-CLOSE: Reconcile this ledger and source checklists; semantic Benchmark validator and Autogoal checker; final source fingerprints; report and stop before Phase 3.

Frozen contracts: target-contracts.json records the live registry. Update policy uses 240 samples of 25 edits, round-robin lanes and median of three runs: default/legacy p95 <=1.05 and history/tagged/callback/default <=1.15. Canonical change retains three-run <=2 transaction/replay ratios and <16.67 ms text-batch p95. U33 retains <5,000,000 instantiations, <1,342,177,280 bytes, <=1.25 instantiation ratio and migration width <=15. Existing other strict target thresholds remain unchanged.

Candidate entry/keep gates: U02 requires counted global callbacks; >=25% fewer checks with neutral latency or >=15% p95 improvement, no normal >5% regression. U10 requires redundant DOM work; >=20% applicable p95 gain and no >10% retained-memory increase, exact R4/native laws. U12 requires route setup >5% of edit; >=20% correction and >=10% full-operation gain. U26 requires unreachable/unneeded feature or duplicate setup evidence at equal schema/plugin/command/view capabilities; >=15% setup or >=10% bytes gain. No candidate implementation is presumed.

Matched browser comparisons reuse frozen Phase 1 protocol: 100/1k/10k paragraphs, same-host interleaved baseline/candidate, full DOM, retained Plite and Plate, warmups 3 and measured 15 per arm, material improvement >=20% and >=8 ms outside twice larger IQR; native guard retries disabled. Headless phase diagnostics may use disposable instrumentation separately from timing. Setup/serialization/model transforms remain owner proxies. If no existing honest phase budget applies, freeze >=20% and >=1 ms outside twice larger IQR before candidate timing; retain existing stricter budgets. No lucky retry or relaxed threshold.

One append-only decision trail: artifacts/2026-09-07-editor-performance-phase-2/decisions.tsv. No substantive agent-workflow or public API change at intake; Best API/layer adoption and doctrine repair become required if source diagnosis crosses those boundaries. No Autoreview on next. No changeset for unpublished Plite v2 internals unless affected published package policy says otherwise. Barrel/registry/rule generation only when source triggers apply. Methods already loaded in Phase 1 remain applicable; Benchmark methodology and Task workflow refreshed at this intake.

Checkpoint: both required shared ratio failures were invalid comparison contracts. The final corrected benchmarks and their exact correctness guards pass. Continue to actual sparse publication/normalization/collaboration costs; do not infer those are resolved.

## Historical implementation checkpoints

The following sections preserve decisions and pending obligations at each recorded checkpoint. Final results and remaining closure work are summarized above; intermediate failures retain their original source identities.

The following checkpoints preserve decisions and failures at their recorded source revisions. Current results and remaining closure work are reported above.

### Sparse-publication investigation

The source-fingerprinted uninstrumented registered target passes its changed-span/identity guards but records 2.38/11.51/120.66/618.33 ms medians at 100/1k/10k/50k nested blocks. This is real remaining latency, with no existing absolute timing budget on this diagnostic. Original 20-iteration cohorts remain frozen.

A separate diagnostic uses the existing core profiler, cohort labels around only the timed edits, and disposable correction-route timing. At 50k, 20 edits total 18,452 ms in transaction-finalize-representation, including 17,826 ms in representation-window-apply. Runtime identity mapping adds 2,515 ms inside the separate mutation callback. Inclusive phases overlap and must not be added. Schema validation totals 2.86 ms, notification 0.204 ms; no correction-route setup runs in this fixture. Neither U02 notification routing nor U12 route caching is established as the sparse-publication cause.

Current source lead: constructCanonicalDocumentChange builds radius-two windows, including an ancestor window containing the large section for structural text-leaf insertion. replaceCanonicalChildWindow calls schema.canonicalizeChildren before and after representation repair. That method recursively visits every descendant, even unchanged immutable branches. Its fourth boolean means dropMisplaced, not shallow traversal. No product intervention has been measured or adopted.

Best API decision is provisional. Strongest target: avoid repeated canonicalization of unchanged immutable branches under the existing schema/representation owner, preserving ancestor type/root/schema context invalidation. Reject a second document store/index, a signals runtime, or a general cache as the default fix. First investigate reuse of the existing validated immutable baseline and canonical change windows; a disposable identity-pruning or shared-window prototype must pass exact contextual schema/representation laws and the frozen >=20% / >=1 ms / twice larger IQR materiality rule before adoption. Runtime architecture changes require Best API and Plite Plan in this same plan. Exact normal/large native proof remains open.

Artifacts: sparse-baseline-01.log; headless-run-2026-09-07T13-25-19.366Z-FtJ063/plite-schema-construction; sparse-profile-01.json; sparse-profile-overrides.json; headless-run-2026-09-07T13-25-55.330Z-wdYsG4/plite-schema-construction. The diagnostic uses source overrides only; package runtime remains unchanged.

## Method and throughput checkpoint

- [x] Read Poteto principles before implementation; relevant leaves already read in Phase 1 and refreshed where needed. Fix Root Causes selected comparator repair instead of changing required command behavior. Laziness Protocol selects deletion of repeated canonicalization before adding a cache. Model the Domain keeps commands, primitive transactions and prepared immutable input as distinct contracts. Sequence Verifiable Units requires each exact benchmark/correctness rerun before another repair.
- [x] Complete Best API source/vision reads and the relevant Plite Plan acceptance/proof rows before accepting a runtime architecture intervention: sparse prototype acceptance below.
- [x] Reconcile principle and playbook obligations at closure, including actual final production-source timing and native guard; all applicable owner, hard-law, comparable-measurement, source, doctrine and generation duties are recorded in the final checklist audit below.

Throughput: one heavy measurement at a time on the shared host; independent source reads and artifact preparation during measurements. Reuse the registered targets, serial archival wrapper and current profiler. Disposable source overrides fingerprint both original and transformed bytes and assert every recipe executes. No unrequested agent fan-out or new checkout. No environment timing retries without a changed diagnostic or required fixed aggregation.

## Sparse canonicalization prototype gate

Best API and Plite Plan reads are complete for this private schema/representation responsibility. No public call, runtime cache, schema flag, or new state owner is proposed. The target deletes recursive property canonicalization of reference-identical subtrees by comparing against the already validated immutable before-root. Baseline authority must match the current compiled schema; the same root and ancestor-type context is mandatory. New nodes, moved/changed context, untrusted or merely frozen arrays, and schema revision changes take full canonicalization. The existing schema owner keeps defaults, targeted properties and canonical JSON; representation keeps structural repair. Plate/collaboration adopt the existing runtime by identity; public docs/API doctrine are unchanged.

The supported input is the registered 100/1k/10k/50k nested-section sparse-edit workload already accepted and processed by the whole editor, plus ordinary structural edits. The first disposable target cuts canonical node visits from 57/537 at 8/128 paragraphs to 13/13; exact text, canonical replay, ancestor-context defaults and untrusted frozen-input canonicalization pass in `sparse-count-probe-{baseline,candidate}.json`. The first uninstrumented prototype records a 50k median of 381.89 ms versus original 618.33 ms, with noisy small cohorts; this does not yet pass acceptance.

Timing acceptance is frozen to three alternating baseline/candidate packets in order B,C,C,B,B,C, each retaining original 20 samples and all 100/1k/10k/50k cohorts. An output-only override preserves every sample for IQR; no warmup or measured action changes. Apply the existing >=20%, >=1 ms and outside twice larger IQR gate. Full final source must rerun the same contract. A separate inclusive profiler diagnostic must confirm the removed owner, and context/replay guards must pass before adoption.

Three realistic failures: trusting shallow frozen input can retain missing defaults; retaining identity across an ancestor type or schema revision change can preserve illegal contextual properties; failing to align selected-window offsets can skip the wrong subtree. Focused proof covers these plus multi-step edits, cross-root replay and existing fitter/validation laws. Rollback removes the private baseline reuse only; no compatibility branch or public migration exists.

An attempted prototype `bun test` run did not load Bun source overrides (no application receipts); it is invalid as candidate proof. Its existing generated schema law also hit Bun's default 5-second timeout under a busy shared host. Direct executable probes do load and assert both overrides. Run package tests on the actual candidate source after pre-acceptance timing; preserve the invalid attempt, and use an explicit appropriate timeout for generated-law tests.

### Accepted sparse target and implementation checkpoint

The six fixed pre-acceptance packets pass all guards. Pooled baseline/candidate p95 at 100/1k/10k/50k: 23.56/7.07, 58.58/18.66, 380.36/93.59 and 2534.92/762.03 ms. Every reduction exceeds 20%, 1 ms and twice the larger IQR. The shared host is busy; absolute times are host-dependent, while the counter probe and the isolated representation phase establish the owner. Separate 50k diagnostic representation-window duration falls from 17,826 to 1,540 ms over 20 edits; inclusive phases are not added. The actual overridden package path passes 86 tests across fitter, schema/context/generated laws and the registered benchmark guard (`sparse-prototype-correctness-02.log`); preload ordering was repaired so both source override hashes are proved.

Decision: rearchitect this private responsibility by reusing the validated before-root; accepted for local implementation. Strongest justified cut is repeated descendant property canonicalization. Keep the existing immutable document baseline, compiled schema and representation windows for correctness; reject a new cache, state store, public flag or feature runtime. No public break or doctrine repair trigger. Implementation is the two current owning files with context/authority guards; exact callback inference is unchanged. Final-source correctness, source-first types, benchmark rerun and eventual browser/native proof remain mandatory.

Applied the target to `packages/plitejs/src/core/editor-schema.ts` and `representation.ts`, retaining one validated baseline and resetting descendant reuse on ancestor type changes. Added current-schema and shallow-frozen-input guards plus an atomic sparse-edit/ancestor-change replay test in `incremental-schema-validation.test.ts`. Final-source proof is running; do not treat the prototype as final proof.

Final-source correctness: 88 tests pass across six files, and `pnpm turbo typecheck --filter=./packages/plitejs` passes all 11 tasks. The added stale-schema test initially omitted required explicit migration; the same failure is reproduced on the baseline (`sparse-new-guard-baseline.log`). Its setup now uses the existing typed `migrate: ({ document, next }) => next.fitDocument(document)` contract. This was a test-fixture error; product code did not change to accommodate it. The final counted probe still performs 13 canonical node visits at both 8 and 128 paragraphs. Six fixed final source versus byte-exact original-owner packets are running with unchanged cohorts, action, samples and output-only sample capture.

Sparse packet kept after final-source rerun: 60 samples per arm/cohort, baseline/candidate p95 10.90/3.18 ms at 100, 31.10/9.61 at 1k, 235.48/100.39 at 10k and 1276.03/284.19 at 50k. All gains pass the frozen percent, absolute and twice-IQR gates; every packet has unchanged source fingerprints, changed span 2 and boundary identity. This is a headless sparse structural-edit claim. The remaining large cost includes immutable publication/runtime identity mapping; no zero-cost or constant-time publication claim. Broad browser proof remains open. Resume the selected correction/collaboration/schema microbenchmarks, then mount/native breadth.

## Remaining headless owner attribution

- Inline normalization: original 250-block three-sample median 2606.60 ms; full diagnostic shows identity mapping (2542 ms over four iterations) and representation finalization (1575 ms), including 1000 local reconcile windows (89 ms). No extension corrections execute. Adjacent-text replacement and observed typing remain separate rows. Mapping/allocation is the residual owner for Phase 5 unless a selected Phase 2 hard budget requires it; a correction cache cannot fix this lane.
- Correction worklist: unchanged strict target passes exactly two matching callbacks per property write and zero children callbacks at 100/1k/10k/50k. Route indexing totals 0.043/0.061/0.049/0.060 ms over 20 edits. Even divided by only the transaction callback time (a lower bound on whole edit), its share is at most 0.52%, below U12's 5% entry gate. Reject U12 route-cache adoption for the selected headless workloads; retain exact fixed-point/classification/cycle laws. Real route attribution remains in browser breadth.
- Collaboration readiness: original full four-cohort command passes every canonical/anchor/history/cleanup guard and replacement node-read limit (stress 289999 <=640000). The 10k replacement median is 4908.5 ms, but that metric includes editor/document setup. A separate existing replacement-mode diagnostic separates setup from replacement. For four stress operations, setup callbacks total 8889 ms and replacement callbacks 8662 ms; each includes 12 slice-fit canonicalizations. Runtime mapping is separately visible and cannot be called the sole cause. No timing gain is claimed.
- Source lead for U26/migration: fitDocumentInput fits every root twice although its second pass exists for projected-root grammar. Primary/named root grammar is already explicit. Investigate that repeated work under equal features; preserve projected root resolution and external selection mapping. No intervention accepted yet.
- U33 baseline: full original strict command records 100/1000 fixture instantiations 7628075/11443306, memory 1918705664/2294327296 bytes, ratio 1.500156; deterministic limits fail. Migration width ratio 10.95357 passes 15, but 10k p95 2524.99 ms exceeds 2000. Compile p95 43.15 ms also exceeds 16 on this busy host; preserve all original thresholds. Root-import-only compiler diagnosis already costs 6987356 instantiations, so a 1000-call shortcut alone cannot close the total budget. The original fixture and TypeScript 7.0.2 compiler stay unchanged.

Artifacts: normalization-baseline-01.log and normalization-profile-01.json; correction-baseline-01.log and correction-profile-01.json; collab-baseline-01.log and collab-profile-01.json; schema-architecture-baseline-01.log and type-budget-baseline.json. Every headless run has its immutable source/command receipt. Type-root trace is diagnostic only, with trace-emission timing excluded from budget comparisons.

## Type-graph causal experiment

Best API and Plate Plan select deletion of unnecessary type evaluation at the existing constructor boundary. The public authoring grammar, precise definition witness, callbacks and plugin capabilities remain mandatory. An internal dynamic root configuration has no inference job: use the same checked runtime constructor directly. Its existing implementation moves to the private `.internal.ts` sibling, shared by the public constructor and editor creation, with no duplicate normalization or public export. Root/common/Plate vision are reaffirmed; no new authoring concept or durable doctrine change. The whole-root trace identifies `Reflect.apply(defineBasePlugin, ...)` as a 6.06-second structural comparison. This is trace attribution, not a budget result.

The first actual-source prototype preserves the original 100/1000 fixtures and compiler. Instantiations fall from 7,628,075/11,443,306 to 6,735,635/10,550,897; 1000-plugin memory falls from 2.29 GB to 1.68 GB. All five strict type-budget checks still fail. Keep this as an unaccepted causal experiment while repairing the same owning graph, not a completed fix. Byte-exact originals and source hashes are archived. Next isolate eager evaluation of optional native callback fields in `BasePluginConstructorRestInput`; only provided keys require contextual typing. Preserve every accepted input, negative excess-field check, callback inference, stage capability and declaration output. No widened caller annotation, size heuristic, second overload, cast or compatibility path is allowed.

The keyed rest-input prototype passes all 38 constructor/source-resolution tests and the complete existing type/declaration contract suite. It reduces 1000-plugin instantiations to 9,884,300 and memory to 1,314,069,504 bytes, satisfying memory but not the count or ratio limits. A diagnostic that removes only the application expressions attributes 3,056,035 extra instantiations to assigning the 1000 descriptors to the heterogeneous plugin array. Its runtime owner already rejects non-nominal descriptors. Reusing `PluginReference` for `BasePluginInput` and replacing definition-valued defaults with actual core descriptors reduces total instantiations to 8,356,382; still not accepted as complete. The existing private definition witness preserves exact descriptor capabilities. Raw normalized definitions have no runtime installation job and are removed from the input type.

Rejected experiments are removed from source: broader callback-field `Pick` loses API/dependency inference; explicit descriptor variance and nominal portal constraints have negligible count impact; relocating schema-provider constraints saves only 14k instantiations, and relocating node-provider constraints increases them. Preserve their diagnostic receipts without adopting them. The 1000-descriptor trace is the next causal input.

An unrelated table implementation changed between type-suite runs. The current table contract fails TS2589 identically with this prototype and with byte-exact original type owners (`type-contracts-baseline-control.json/.log`); do not attribute that failure to this work or silently accept it at final verification. The measured 100/1000 budget source graph does not include the table files (`type-budget-source-graph.txt`), so those unrelated changes do not explain its counts. Final source contracts remain open.

Deferred schema witnesses avoid eagerly expanding the installed schema and own declaration while retaining both exact jobs. Reuse the existing deferred node/value-provider pattern: carry a factory type and unwrap it at the schema query. Installed schema deferral records 5,437,480/6,712,171 instantiations, 1.23443 scaling, 1,092,542,464 bytes and 4,264 ms for 1000 plugins. Deferring the own declaration additionally records 5,429,107/6,537,298, 1.20412 scaling, 1,084,692,480 bytes and 4,217 ms. Both remain unaccepted prototypes: the absolute instantiation budget still fails. Their source contract run has only the independently reproduced table failure. Exact schema inference, negative capability checks and packed consumers remain required.

Further rejected type experiments preserve receipts and restore source: aliasing the Base descriptor as an intersection increases counts; dropping the duplicate underlying Plite editor intersection increases counts; removing the portal from author context changes its public job; reusing the Base descriptor for resolved plugins saves only 314k; deferring the generic extension witness does not help. Removing repeated full-editor constraints from callback context carriers saves only 3,610 instantiations, so it is rejected. The current root-only trace still records 5,075,252 instantiations and repeated 300–362 ms variance computation for `BasePluginContextEditor<C>`. Next isolate a named interface for that exact existing context, preserving its full editor surface, instead of repeatedly expanding an intersection alias.

### Type target and proof checkpoint

Best API and Plate Plan retain the complete descriptor/context jobs. A named invariant `BasePluginContextEditor` and mapped invariant `BasePluginContext` let comparisons reuse their exact shape. Author context projects directly from the resolved descriptor, avoiding consumer methods immediately replaced by author capabilities. Deferring the lowered definition at `EditorExtensionWitnessFor` retains the existing capability/public/internal definition witnesses and drops the 1000-plugin count below the original limit. All source providers remain type-only; only the checked constructor implementation changes runtime file location. There is no new public authoring noun, callback annotation or permissive overload.

Additional rejected prototypes restore source: whole-editor interfaces save only 7k or increase counts; literal context-exclusion keys add 1.01m; mapping the consumer portal saves only 915; explicit covariance on schema providers saves only 16. Only the measured owning reductions remain.

The complete original-type-owner control (`type-final-control.json`) restores all 16 original files for measurement and the declaration suite, then verifies byte-exact candidate restoration. It reproduces the original 7,628,075/11,443,306 instantiations exactly and the same single table TS2589. After formatting and regeneration, `type-final-budget.json` passes every unchanged limit: 4,702,743/4,822,879 instantiations, ratio 1.025546, 928,484,352 bytes and 1,996 ms at 1000 plugins. Source hashes are stable during both packets; fixture hashes are unchanged.

Source proof: 59 runtime tests across six real files pass (`type-final-runtime.log` and `type-final-runtime-internal.log`; the initial invocation selected four files, then the two correct internal paths were run separately). Plite generic and public contracts pass. Final nominal-input contracts cover raw descriptors at headless, React and static constructors, while preserving heterogeneous arrays. Plate's declaration contracts retain only the independently reproduced table failure (`type-final-ingress-contracts.log`). Package test types match the exact 58 baseline diagnostics with no additions (`type-final-ingress-package-comparison.json`). The final input constraints retain all original type budgets: 4,702,740/4,822,876 instantiations, 928,520,192 bytes and 2,619 ms at 1000 plugins (`type-input-constraint-budget.json`).

All four package builds pass (`type-packed-build.log`). The packed runner completes NodeNext/Bundler declaration checks, runtime imports, SSR and unused import elimination; only its exact entrypoint-size snapshots fail, including unrelated feature output drift (`type-packed-consumers.log`). Preserve that failure separately from the passing semantic checks. Final runtime/type edits still require fresh package artifacts and packed consumers. U33 remains open until migration and runtime schema budgets pass.

Best API's doctrine repair records nominal heterogeneous inputs and deferred exact projections in its source rule. The affected Plate/Plite planning, plugin, UI and public-doc teaching owners contain no obsolete provider or raw-definition installation example; their existing exact-inference laws remain unchanged. Vision's current nominal identity and private normalization rules are reaffirmed, with no durable-taste change. Plate Next v163 appends concrete migration checks without changing any package attestation. `pnpm install` regenerates sources and resources; the version validator passes. Barrel generation and scoped lint pass. Changesets remain relative to main: Plite and these v2 authoring APIs are branch-only, so there is no branch-local removal/migration entry.

## Root fitting target and acceptance

Best API and Plite Plan select deletion of the second fit for primary and declared roots in the existing compiled slice fitter. `getDocumentRootProgram` returns their compiled grammar before consulting projected owners. Only projected roots depend on owner installation order, so their second pass remains. No schema policy, public API, cache, document representation or feature changes. Keep the compiled schema as authority; no doctrine change is needed.

The source-counted probe preserves primary/named document output, deeply nested projected roots whose child sorts before its owner, immutable external input and mapped selection through wrapping. Calls fall from 2 to 1 for primary roots and 4 to 2 for primary plus named roots; nested projected calls fall from 6 to 5, preserving both projected refits. The exact overridden source passes 184 tests across seven fitter, root, configuration, change and history files (`fit-roots-prototype-correctness.log`).

Six predeclared B,C,C,B,B,C packets retain the original 1000/10000 migration fixture, action, warmup, rotating ten samples and commit/version guards. At 10k, pooled p95 falls from 3737.05 to 1897.90 ms: 49.21%, 1839.15 ms, beyond the 1352.97 ms noise floor, and below the original 2000 ms limit. Width ratio is 11.53, below 15. The 1k p95 is neutral (358.89/356.03 ms); no gain is claimed for that cohort. Final source must rerun the original strict target before closure.

The separate setup clocks are a negative causal control: counted editor creation performs zero root fits, and candidate migration performs one. Therefore apparent setup timing differences are host noise, not this intervention or U26 evidence (`fit-roots-setup-control-*.json`, `fit-roots-migration-count-candidate.log`). U26 stays conditional until real setup/feature attribution.

Three failure risks govern final proof: skipping a root whose grammar truly depends on projected owners, losing a nested projected root when its child sorts first, and mapping selection against an unfinished fit. Preserve explicit grammar precedence and existing projected refits; add exact nested/selection guards. Rollback is the one private loop change. Acceptance permits this local implementation; final original benchmark, source-first types, native/browser and packed proof remain open.

### Original-command failure and frozen-source diagnosis

The implemented fitter is byte-identical to the measured prototype (sha256:1c7d9084558493a825074a2bac1d67644d65a93af4cc92e8f627bf6392b9eca0). Final source passes 187 tests across eight files and all 11 source-first Plite type tasks. The full original schema command still fails (`schema-architecture-final-01.log`, receipt `headless-run-2026-09-07T15-57-39.824Z-kul1zR`): compile p95 41.92 ms exceeds 16, 10k migration p95 2369.63 ms exceeds 2000, exact-property ratio 0.573 exceeds 0.5 and equivalent-reconfiguration ratio 2.420 exceeds 1.05. Migration width ratio 12.549 and all five original TypeScript budgets pass. The focused migration result remains valid only for that focused packet; it cannot certify the complete target. No U33 completion or kept root-fitting disposition is granted.

Regression's routing was checked at the failed final gate. This is a performance optimization with passing behavioral oracles, and its source explicitly routes performance diagnosis to Benchmark; it is not a claimed behavior repair or reporter contradiction. Keep the existing Benchmark cause open, freeze product bytes and diagnose before further changes. No new Regression corpus, workflow change, or reset of review budget is justified.

On unchanged compiler bytes, the exact compile corpus/call/three warmups/thirty samples still fails 16 ms under CPU profiling (`schema-compile-frozen-source.*`). The trace attributes about 31% inclusive time to property-by-type target satisfiability and another substantial share to canonical JSON cloning/freezing. The FNV hash already uses exact 32-bit arithmetic; do not invent a hash-algorithm change. Next isolate unnecessary satisfiability work for type/group targets using the existing compiled membership maps, preserving general contextual targets and every compiled fingerprint. No compiler intervention applied yet.

### Compiled property membership target

The isolated compiler prototype deletes 22,000 general satisfiability calls per compile by reusing known type/group membership while indexing simple property targets. Null targets use all declared element types; type/types/group targets use their existing known members intersected with the destination map. Parent, root and Boolean targets retain the exact satisfiability solver. No compiled field, ordering, identity, cache lifetime or public shape changes. This is the strongest justified cut under Best API and Plite Plan; the general solver retains its independent contextual-law job.

Baseline and candidate produce the identical complete serialized schema contract hash `de323cc826817633a9a64b3b0c9e02934879d6763712bf356b6ff530e8367702`. Both pass 77 compiler/model-oracle/generated-law/validation tests across five files. Six fixed alternating compile packets, each retaining three warmups and thirty original corpus compilations, give pooled p95 23.75/14.85 ms (37.48%, 8.90 ms, beyond 5.43 ms noise). One individual candidate packet is 16.025 ms, so the full original strict gate remains required and open; the pooled result is not a complete-target pass.

Risk proof preserves unknown-type exclusion, group membership and contextual/Boolean targets through existing compiler/model oracles. The change only replaces the owning property-index loop; rollback restores that loop. Adopt this local implementation target, then rerun final source and diagnose remaining migration cost before full-target closure.

Final compiler source passes the same 77 tests, scoped lint and all 11 source-first Plite type tasks. Its focused compile packet still fails at 29.91 ms p95 (`schema-compile-final-probe.json`), with the identical compiled-contract hash. The prototype gain remains causal evidence, but neither compilation nor the full schema target is closed. Concurrent unowned CPU workloads are recorded; no unrelated processes are stopped and no timing limit is waived.

### Existing fitted-index reuse experiment

The frozen migration profile identifies duplicate local decoding inside `prepareFittedDocument`: `reconcileChildrenStep` already returns the resulting immutable `DocumentIndex`, but the fitter discards it and `ChangeDraft.apply` reconstructs it. The existing `indexedAfter` option already owns reuse with full canonical construction and validation. Best API and Plite Plan select that existing responsibility; no public option, trust flag, cache or parallel fit engine is added. Projected-root rules and external-selection mapping remain unchanged.

The disposable source override passes 187 tests across eight fitting, root, configuration, replay and history files, with the exact applied-source receipt (`fit-index-reuse-correctness.log`). Six fixed B,C,C,B,B,C packets retain the original migration fixture, rotating samples and correctness guards. Final source adoption requires material timing and a separate phase/counter proof; full original-command closure remains mandatory.

The six packets pass the frozen materiality gate at both sizes: pooled migration p95 is 165.56/81.08 ms at 1k and 1951.99/929.93 ms at 10k. The 10k reduction is 52.36%, beyond 534.61 ms twice-IQR noise. Separate diagnostic `change-set-apply` calls fall from 10 to zero while all 30 full validation passes remain; `slice-fit-canonicalize` is 5063/2134 ms inclusive across ten operations. Setup is an unchanged negative control, so its apparent 1k timing movement is not an intervention claim.

The existing-index target is accepted and applied locally. The actual formatted source passes all 187 tests and 11 source-first type tasks. Full original command receipt `headless-run-2026-09-07T16-27-46.608Z-NNDz5y` records migration 10k p95 845.10 ms and width ratio 12.191, both passing. Original property/reconfiguration ratios and all TypeScript budgets also pass. Compilation alone still fails at 34.77 ms p95; a focused profile with the same compile corpus and sampling is 12.07 ms. Diagnose full-command initialization versus isolated compilation on frozen bytes before further product edits. The overall schema target remains open.

## Playground frame-contract repair

The archived original runner completes its second frame before the expected Enter DOM mutation in 14 of 20 measured rows (`playground-frame-contract-baseline.json`). That clock does not measure the selected operation. The runner schedules both animation-frame callbacks only after the exact expected DOM mutation, records callback execution with `performance.now()`, and verifies monotonic keydown/mutation/frame times. Result fields use frame terminology and retain raw row clocks; frame callbacks do not certify completed painting. The 16 ms mutation, 32 ms second-frame and zero-long-task limits remain unchanged. Actual-route native proof is required before this harness repair is kept.

### Frozen compilation disposition

The exact original-command prefix reproduces the slow compilation with all original imports, TypeScript fixtures, forced GC, three warmups and thirty samples. The fixed six-packet order experiment does not establish an ordering cause: moving the same TypeScript work after compilation gives pooled p95 30.87/27.91 ms, only 9.57%, inside the 15.64 ms noise floor (`schema-order-comparison-results.json`). Reject the order change; the registered command and GC contract remain unchanged.

A separate six-packet source override omits freezing temporary canonical objects consumed immediately by stringification. All 77 semantic tests pass, but pooled p95 is 22.28/27.76 ms, with 13.49 ms noise (`schema-stringify-comparison-results.json`). Reject this product candidate; it was never applied to product source. Original fingerprint serialization and immutable defaults remain unchanged.

Compilation latency is quarantined as an unresolved original-budget failure, not declared an invalid budget or fixed by host attribution. No further compiler product edits or unchanged timing retries are justified by these packets. Frozen-source browser/native checks are independent required correctness work for the accepted changes and continue while this timing gate stays open. Full Phase 2 completion is still prohibited until the original budget passes or an actual invalid contract is proved.

Final-source matched control: six fixed original-prefix packets restore the original compiler only in the baseline and use actual formatted product bytes in the candidate. Both arms retain original imports, both TypeScript fixtures, forced GC, three warmups and thirty compilations. Pooled p95 is 21.54/15.40 ms, a 28.51% reduction beyond 4.13 ms twice-IQR noise; each candidate packet is below 16 ms (`schema-compile-final-comparison-results.json`). This is new paired final-source evidence, distinct from the rejected order/freezing experiments. It authorizes one full original-command verification to test complete-target closure; earlier failed receipts remain intact.

## Browser checkpoint

The original retained full-DOM comparison runs all four current/original-owner arms, 100/1k/10k paragraphs, three warmups and fifteen measured samples. All 216 attempts and 1,728 native actions including warmups pass; 180 measured mounts and 1,440 measured actions cover 108 cells. All 864 loaded source entries are stable (`runtime-distributions-01.json`, `runtime-results.json`, `runtime-results.csv`). Both arms preserve Phase 1 history. Nine p95 tail comparisons cross the frozen numeric threshold; with fifteen samples p95 is the maximum. The corresponding medians are mostly neutral and the flags are not yet causal regressions. Preserve them without claiming universal neutrality or a browser speedup.

Counter attribution (`runtime-counter-attribution.json`) shows constant 77 selector events for seven-character replacement at 100 and 10k. Split/join at 10k notify 4,999/5,000 retained text flows after the insertion point. These subscriptions already use node keys; shifted paths enter the existing node channel and update retained records and `data-plite-path`, which native mapping and input consumers use. Blindly switching these consumers to render-only routing violates current path freshness. The clean-paint certificate already avoids segment reconstruction on unchanged text; no redundant validation/write has yet passed U10's entry gate.

The diagnostic-only existing adapter adds adjacent conversion, construction and React-to-handle clocks, with separate esbuild emission metadata. All six native diagnostic attempts pass. At 10k, Plite construction is 47.6 ms and React-to-handle 397.7 ms; Plate is 238.7/772.0 ms. Input conversion is 0.3/0.2 ms. Schema timing is nested and is not added. No math/code-block/AI/DnD/table/comments feature modules contribute emitted code in these selected minimal bundles. HTML is an explicitly installed core clipboard capability. No U26 feature deletion is justified from bundle size alone (`runtime-decomposition-summary.json` and exact metafiles).

## Correctness-driven index rejection

The final03 original schema command passed every unchanged strict gate: compile p95 15.361917 ms, migration 10k p95 862.792417 ms and width 13.1232, plus all five original type budgets. Its source receipt remains valid for that candidate only. The subsequent strict package gate exposed an additional existing identity contract outside the earlier eight-file fitter selection: `state-tx-public-api-contract.ts` requires replacement to retain reference-identical unchanged nodes, including a newly allocated but structurally equal input node.

Frozen candidate reproduction fails that exact assertion. Restoring only the original fitter makes all 36 state/tx tests pass; the other current runtime owners remain loaded. Source inspection establishes the cause: `reconcileChildrenStep.after` comes from a direct splice, while applying its canonical change preserves equal unchanged nodes through retained ranges. Equal serialized output is insufficient to authorize reusing that index.

Disposition: revert the entire fitted-index optimization, byte-identically restoring `fit-index-baseline-compiled-slice-fitter.ts`. Keep the separately measured primary/named single-pass root fitting. This is rejection of an unclosed performance candidate, not a retry of a claimed behavior repair; Benchmark owns the revert and Regression's failed-claimed-bug-fix workflow is not triggered. No new runtime workaround or workflow rule is needed. The existing strict gate found the defect as required.

After reversion, 223 tests across the exact state/tx case and the eight fitter/root/configuration/history files pass. The rejected source is preserved in `fit-index-rejected-compiled-slice-fitter.ts`; its timing gains are excluded from final claims. Earlier browser distributions include the rejected optimization and therefore remain diagnostics until refreshed on the final correct source. The original headless commands and strict browser/package gates are being rerun against this source. The first two focused CLI attempts omitted the required `./` path prefix for Bun's nonstandard test filename and executed no tests; those failed discovery logs are preserved and do not count as behavioral proof.

The original command on corrected source (`headless-run-2026-09-07T17-12-42.446Z-HwwuUu`) passes migration 10k p95 1296.44 ms and width 11.9463. All five deterministic type budgets pass at 4,702,760/4,822,896 instantiations and 928,417,792 bytes for 1000 plugins. Compilation fails at p95 29.834458 ms (p50 14.412959 ms), and equivalent reconfiguration is 1.058003 versus 1.05. Other legacy query/heap ratios pass. No unchanged retry is authorized by this result. These actual budget failures remain open; previous green and matched compiler packets are causal/contextual evidence, not substitutes for the final full-command failure. Independent native and negative-control correctness work continues without another compiler edit.

## Strict verification and actual-route checkpoint

All eight remaining original headless commands execute successfully with stable source receipts: correction worklist, Yjs event bridge, normalization, canonical changes, membership/anchor observation, editor store, collaboration readiness and update policy (`headless-final-controls-summary.json`). Execution is distinct from timing acceptance. Update policy's complete final three-run aggregate passes all original limits (`update-policy-final-results.json`); preserve the individual failed single-run ratios. The kept sparse intervention already has six final matched packets on unchanged effective schema/representation owners.

The second strict check passes all 87 source-first type tasks and the core identity contract. Its React partition passes 1222 tests but fails two partial-DOM rows. On unchanged source, the complete 55-test DOM-strategy file passes independently. Source diagnosis identifies a proof race: the promotion test expects two mounted nodes before the existing 120 ms overscan timer, but uses real timers during asynchronous React act; a busy suite can already have reached the valid settled six-node state. The test now controls time explicitly and checks both the two-node promotion state and the six-node settled state. The separate 5000-block model-insertion fixture gets a 15-second test timeout; this is a semantic test process limit, not an editing or benchmark budget. No product DOM strategy changed. All 55 focused tests pass after this verifier repair; the strict aggregate still requires a fresh run.

The actual source-first www server is bound to PID 36404, cwd `apps/www`, port 3297, with ready output and HTTP 200 for `/blocks/playground`. Interactive native typing preserves text and caret; Enter changes 34 blocks to 35, undo returns 34, redo returns 35, and the table remains intact. Browser console errors are empty. Narrow layout has an actual 433-CSS-pixel viewport under the browser's existing zoom; text editing works, but resizing placed the caret beneath the sticky toolbar until the heading was selected again. Preserve that observation without claiming viewport-resize caret correctness (`playground-interactive.json`, `playground-interactive-narrow.png`). The owned runner supplies exact model and per-action assertions separately.

Selected browser skip audit: the only conditional return in the huge-document gestures performs the mobile semantic insertion before returning; other returns are helper values or animation-frame completion. Explicit mobile/Firefox/Chromium skips remain scoped with their existing reasons. No skipped row counts as native-device proof (`selected-browser-skip-scan.txt`).

## Current production closure investigation

The final-map-3 build is source-stable and matches 807 workspace scripts; all 18 HTTP assets match frozen bytes. Its one original full Enter packet preserves every native/model guard but records mutation p95 16.3 ms (>16). Its frame limit passes. Earlier final-map-1 production passes remain valid for their recorded source; the new failure is not replaced by those passes. The first attempted invocation used unsupported equals-style options and failed navigation before measurement; the corrected command is the first measured current-source packet.

The built-in diagnostic covers five warmups plus twenty measured Enter actions, each followed by undo. Its 185.8 ms commit-notification duration is nested inside 487.5 ms total keydown handling over those fifty actions. These inclusive totals must not be added or described as twenty measured Enter durations. A production mark-read count/phase diagnostic will select or reject the next experiment.

- [x] Isolate production mark-read counts and exclusive owner time on the exact current full Playground, filtering to the twenty measured Enter actions.
- [x] Only if this owner is material, test snapshot-derived read reuse under the production contract. Preserve the earlier development-host rejection. The new host class changes React/runtime cost proportions; it does not excuse a weaker gate. Keep the same >=20 percent and >=2 ms p95 improvement beyond twice the larger IQR, six fixed B,C,C,B,B,C packets, five warmups/twenty native actions per packet and exact guards.
- [x] Preserve explicit marks, draft reads, named-root reads, schema replacement, mutation isolation and editor lifetime. Reuse existing runtime/snapshot ownership; no public API or alternate state store. Acceptance requires proof before source adoption. Disposition: the target is rejected before adoption; production semantics remain unchanged.
- [x] Final adopted source passes the original absolute gates and final strict/matrix/packed proof; rejected experiments retain their recorded dispositions.

The production diagnostic records 180 mark computations over twenty measured
Enter actions, taking 50.8 ms total (2.54 ms per action). Commit notification
takes 96.6 ms and keydown handling 236.7 ms over those same actions; these
durations are nested. All twenty actions preserve the native/model guards.
This is single-source attribution: concurrent private import changes separate
the profile build from final-map-3, so their timings are not a causal pair.
See `marks-production-diagnostic-summary.json`.

The disposable production candidate reuses an existing cached snapshot; it
does not create a snapshot for a cold read. Draft and explicit pending-mark
reads still execute the original computation. Derived mark bags stay fresh,
and their nested immutable document values retain identity. A deep-copying
prototype failed that identity guard before adoption. The revised candidate
passes two ownership cases and 156 original-computation oracle cases with
verified source-loader receipts. Earlier invocations that eagerly loaded the
baseline before the override are baseline-only evidence and are excluded.

The first baseline/candidate build pair also differs in three concurrently
edited Plate hook files and is excluded before timing. The rebuilt baseline
and candidate differ only in `public-state.ts` workspace source; emitted CSS
and shared dependency source bytes match. Frozen assets, compiled source maps,
HTTP responses and loaded browser assets identify every measured packet.
Modern Chromium omits the HTML's `nomodule` polyfill, which is optional in the
asset preflight; this correction occurred before any timing samples.

The six fixed production packets reject snapshot mark reuse: pooled baseline/candidate mutation p95 is 17.4/14.5 ms, a 16.67% improvement and 2.9 ms delta, below the 20% and 4.0 ms noise gates. All 120 native actions pass. No candidate source is adopted; all candidate-only tests remain in the artifact directory. Additional adoption-only schema/cache lifecycle checks are unnecessary for this rejected target. The interval-corrected diagnostic (`marks-production-diagnostic-summary-v2.json`) excludes the Meta keydown before undo: 20 Enter handlers take 234.1 ms, while 180 mark computations still take 50.8 ms.

- [x] Attribute remaining production reads using disposable instrumentation of internal selection copying, table-cell index queries and commit callbacks. Preserve the full Playground and twenty exact Enter intervals (keydown through second frame). This is diagnostic only. A later U02 cell-subscription proposal may reuse the existing element provider; table geometry, selection and resize algorithms remain outside this Phase 2 intervention. No candidate or timing gate is accepted by this diagnostic.

## Provisional node-only element selector

`read-production-diagnostic-summary.json` records 78 global commit callbacks
per Enter, including 24 cell-index reads (0.76 ms per action). All internal
selection copies total only 0.335 ms per action; selection-copy optimization is
rejected as immaterial. The diagnostic retains twenty exact native/model
actions on a source-stable production build. Its instrumented timing is not an
acceptance measurement.

Best API's provisional target removes path payload and path invalidation from
`useElementSelector`. The existing `usePath` remains the path owner. Element
selection remains scoped by the existing provider and plugin descriptor,
with exact node inference, previous derived value, equality, latest closure,
missing-provider fallback and cleanup. The normal call is
`useElementSelector(TableRowPlugin, node => node.height)` from `platejs/react`;
path consumers use `usePath()` from that same entrypoint. No new hook, store,
cache, provider, scheduled work or table algorithm is proposed.

The maximum-value cut removes the entry tuple from this element-only API and
removes every cell's global editor selector. Deleting the element selector
itself would discard scoped derived equality and per-consumer updates; plain
context cannot preserve that independent current job. Replacing the existing
table query with path arithmetic would break spanning-cell semantics, so the
canonical table query remains. Moving cell coordinates into resize context
would broaden resize-triggered rendering, so that alternative is rejected.
Plate UI owns the component/hook law; this section is the Plate Plan adoption
packet inside the existing Phase 2 plan. The target is provisional until the
following evidence passes.

- [x] Prototype the node-only selector and migrate the two live path-reading
  call sites to `usePath`. Route cell indices through the existing scoped table
  element selector. Keep candidate sources outside production until acceptance.
- [x] Before timing, prove scope/fallback, path-only skips, changed-node reads,
  equality, previous value, closure replacement, detach/remount and editor
  isolation; retain exact descriptor inference and negative type contracts.
- [x] Count all global callbacks and actual cell-index computations on both
  production arms. Keep the existing U02 gate: >=25% fewer global checks with
  no >5% p95 regression, or >=15% p95 gain. A change that only shifts the same
  query work into local callbacks does not qualify. Use six fixed B,C,C,B,B,C
  packets, five warmups/twenty full native Enter actions each, frozen builds
  differing only in the accepted intervention, and unchanged 16/32 ms limits.
- [x] The revised element/derived-path target passes acceptance and adoption; prove table span/row/column
  changes, moves, undo/redo, separate editors, normal/large routes, strict and
  matrix checks. Repair API teaching in the smallest source rule/Vision owner,
  append the required immutable Plate Next doctrine version, regenerate mirrors
  and registry, then refresh final packed artifacts and source readback.

The node-only selector prototype passes seven focused tests, including path-only query skips with independent `usePath` updates, current node reads, scope/fallback, previous value, equality, changed closures, StrictMode detach/remount and editor isolation. Applied-source receipts identify both the hook and migrated existing tests. Source-first React and descriptor-contract checks pass, with all temporary candidate source restored. The frozen profile pair isolates the hook and table consumer: global callbacks fall from 79 to 55 per Enter (30.38%), and cell-index computations fall from 480 to zero across twenty actions. Both arms preserve every native/model guard. A concurrent NodeSelection update adds one baseline observer; the older 78-callback diagnostic is not the denominator for this candidate. See `element-selector-production-count-results.json`.

The fixed six uninstrumented production packets meet the U02 callback-plus-neutral-latency gate: pooled baseline/candidate mutation p95 is 16.5/16.8 ms, a 1.82% regression within the original 5% limit. All 120 native actions pass; every candidate packet still fails the original absolute 16 ms budget. This is provisional materiality evidence, not API adoption or phase closure (`element-selector-production-comparison-results.json`).

Before adoption, check the existing derived-path job: replacing the row's equality-filtered index selector with full `usePath()` may add renders when only an ancestor path prefix changes. Count actual row and cell function executions on both frozen production arms with identical disposable instrumentation and original native guards. React Fiber commit flags alone are not accepted as fresh function-execution counts. Table coordinates remain scoped to the table element identity, which changes with table content; actual row/column/span/move and lifecycle proof remains required if the target survives this render check.

Disposition: reject the node-only API candidate before adoption. Direct function-entry instrumentation confirms zero baseline row renders versus eight candidate row renders on every measured Enter, 160 added executions across twenty actions. Both builds execute their counters at mount (baseline 16 row/48 cell startup events), contain identical instrumentation, differ only in the hook/table source and preserve all forty native guards. Neither arm executes cell components during the measured actions. See `element-selector-render-results.json`, frozen build/source/HTTP receipts and raw events. Filtering table-relative row index changes is an independent current job, so the proposed path migration fails the adoption contract despite passing the global callback threshold.

The next bounded target retains the current entry selector and its derived-path filtering. Test whether its existing previous-value argument can reuse cell coordinates while the enclosing table identity is unchanged. This would delete only each cell's global subscription, add no public hook or store, and keep path-sensitive consumers intact. Exact descriptor/previous-value inference must work without callback annotations. No new target is accepted by this source proposal; count, timing and table correctness gates still precede adoption.

The previous-value call does not infer its self-referential result on the existing API; adding `NoInfer` to the previous argument also fails. Both source-first contract attempts are preserved, with temporary source restored (`element-selector-previous-type-original.log`, `element-selector-previous-type-noinfer.log`). Do not add callback annotations or redesign the generic API for this consumer experiment.

The existing element store already exposes field-specific derived subscriptions. The next disposable consumer uses `useElementStore(TablePlugin.name).useValue('element', selector, equalityFn, [editor, element])`. This retains path filtering in `useElementSelector`, observes only table payload changes for cell coordinates, and creates at most the existing lazy atom store per table. It adds no public surface, private cache, store type, provider or table algorithm. Best API selects reuse of this existing field owner over another selector mode or a new path-projection API. Plate UI owns the consumer adoption. Before acceptance, prove scope and closure/lifecycle semantics, count global callbacks and actual row/cell/query work, then use the unchanged six-packet U02 and absolute gates. A store that shifts or delays the same work does not qualify; normal and large table behavior remain required.

That field-store proposal is rejected at the public import boundary. Thirty-five internal store tests pass, but the actual production build fails because `useElementStore` is absent from the curated `platejs/react` entrypoint. The earlier proposal incorrectly treated an internal barrel as public. Preserve the failed build and restored-source receipt; do not export the internal store to make this consumer compile.

Revised provisional target: node selection uses `useElementSelector(TablePlugin, node => ...)`; path projection uses `usePath(path => path.at(-1))`, with optional derived-value equality. The latter preserves the proven row-index job in the existing public path owner. The current selector cache moves into one private helper used by element and fallback-path selectors; no atom store or second cache is created. Native path updates reuse the existing keyed `useNodeSelector` through Plate's private adapter; no Plite public shape changes. Full path reads remain fresh and copied, provider-only reads retain fallback behavior, and custom selectors cannot mutate the source path. Prototype and source-first inference/native checks precede the same direct render/query counters and unchanged six-packet U02 gate. The rejected first prototype's performance receipts do not accept this revised target.

The revised prototype passes 32 focused tests, React entrypoint types, explicit positive/negative descriptor and path-projection contracts, and the www source-first package-integration type program. One intermediate type fixture incorrectly expected a mutable path; the API correctly rejected it, and the final fixture asserts the existing readonly contract. Temporary sources are restored (`element-path-proof.json`). Direct production counters retain 79/55 global callbacks and eliminate all 480 cell-index queries, while both arms execute zero row and cell functions in all twenty measured Enter intervals. Both instruments execute at startup (16 row and 48 cell entries per arm), and all forty native guards pass (`element-path-profile-results.json`). The isolated source-map difference includes the shared private selector helper, the two public hooks and the table consumer; the former raw path hook becomes unreachable in the candidate bundle. CSS and shared dependency source bytes match. Uninstrumented timing and table adoption remain pending.

The revised fixed six-packet comparison passes U02 materiality with pooled p95 16.9/16.8 ms and 30.38% fewer global callbacks. All 120 native guards pass. Every candidate packet still fails the unchanged absolute 16 ms gate; no latency speedup is claimed (`element-path-production-comparison-results.json`).

Table adoption uses a separate manifest preserving the concurrent same-editor row-drop guard (`element-path-adoption-manifest.json`). Eleven of twelve native table cases pass: spanning cells, row/column insertion, undo/redo, table path movement, desktop/narrow resize, cancellation, toolbar focus, 301-row resize and four selection cases. The only before/after source difference is an unrelated DnD test file, not runtime code (`element-path-table-browser-source-changes.json`). The paint case fails its positive control on both candidate and baseline. An initial dev-host attempt hit another server's lock after a temporary config change; all source was restored. Subsequent hosts use Next's serialized-config environment override and their own output directory without changing the project config or stopping the other server.

Paint diagnosis: DnD inserts an inert preview before the live block and strips its node keys. The test's first-table queries target that clone, leaving the live cell highlights visible during the absent control and producing an empty duplicate layer. Selecting the table by cells with live node keys repairs the test target; the corrected baseline then exposes one table-wide layer in addition to sixteen cell layers, against the existing `{ cell: 16, table: 0 }` assertion. The source renders both `TableElement`'s `isSelectingTable` overlay and the per-cell overlays. This is a baseline product defect, not a proven selector regression. Patch owns deleting the redundant table-wide highlight and its render-only selection read, with the corrected existing paint oracle. No product or verifier repair is adopted yet; preserve `element-path-paint-baseline.json`, the diagnostic observations and `element-path-paint-control-fixed.json`. The public selector proposal and original absolute mutation budget remain open.

## Table selection paint repair

Case `table:paint-only-selected-cells` is a Plate registry rendering defect on `/blocks/table-demo`: pointer-down on the live table block handle selects all sixteen cells. The current oracle requires sixteen cell layers, no additional table layer, cell-only actual pixels, stable absent pixels and a detectable duplicate-layer control. The corrected live-table target produces red `{cell:16,table:1}` on the baseline. The allowed edit is deletion of TableElement's redundant overlay and its selection subscription, plus correcting the existing verifier to exclude inert DnD clones. Keep tableNodeKey because two independent table-selection views still use it. Table algorithms, fixtures and numeric pixel thresholds stay unchanged. Source receipts identify the dirty `next` inputs. Require fresh-host exact replay, five retry-free warm paint cases and native row/column/span/resize/selection checks before adoption.

Deleting only the overlay exposes DOM-integrity rollback of the cell layers: the node hooks read the correct committed node selection, but the live table contains no layers after the guard removes them. Direct baseline DOM proof retains sixteen live cell layers plus one table layer. A disposable PlateElement commit-claim probe preserves sixteen cell layers and passes the positive pixel control, but the guard removes the test's injected duplicate layer. This isolates DOM ownership rather than subscription invalidation. Reject the broad PlateElement claim addition; mark only the non-editable cell overlay as root chrome, using the existing resize-control pattern, and give the injected duplicate control the same marker before insertion. Preserve `paint-dom-*`, `paint-selection-trace-v2`, and `paint-claim` diagnostics. The first selection trace was invalidated by a concurrent registry CodeMirror export addition; fresh isolated hosts rebuild source aliases with the canonical workspace helper. No unrelated package or runtime source changed for this repair.

The chrome-marker repair passes the original exact paint case on stable source. The strengthened case then passes five consecutive fresh-page warm runs with zero retries, all positive/absent/duplicate/actual pixel controls, retained paint after pointer release, native typing and exact model undo. `table-selection-chrome-warm-summary.json` records every duration and pixel count. Retain the small TableElement deletion and cell chrome marker; do not retain the diagnostic PlateElement-wide claim. The revised selector's native adoption manifest preserves this repair and renames its shared helper to `.internal.ts`, matching the existing barrel exclusion; this is private code rather than an accidental generated export. Full table proof and five final paint runs are underway before API adoption.

The first revised native adoption run passes eleven of twelve cases; the remaining case's only failure is a browser compilation error when a concurrent registry build temporarily removes `public/r/registry.json`. Its native assertions pass, but the runtime-error gate correctly rejects the packet. The registry exists again; the next fresh run also fingerprints that generated entry. Preserve `element-path-ready-table-browser.json` and the concurrent-source list. No product retry or weaker runtime-error assertion is applied.

Adoption is complete locally after the fresh native packet passes all twelve cases and five additional paint runs with stable source and registry. The shared helper stays private under `.internal.ts`; owned tests cover payload/path independence, equality, prior value, lifecycle, editor isolation and readonly paths, and the two native span/movement cases live in `table-element-subscriptions.spec.ts`. Forty tests and 95 assertions pass. React, exact public contracts and www source-first integration types pass. The first contract invocation raced its emitted-declaration prerequisite and is preserved; the required sequential replay passes. `pnpm install`, `pnpm brl`, registry generation (366 payloads/15 overlays) and immutable doctrine v164 validation pass. API teaching and the existing path changeset are updated; package attestations retain their previous versions. See `element-path-adopted-proof.json`.

Final production closure uses an isolated output directory without editing next.config.ts or restarting other servers. A rejected serialized-config build cannot preserve Next's function-valued build configuration. The corrected builder keeps the original Next CLI and loads only the two recorded config overrides (source maps and output directory) through a SHA-guarded Node preload. It records each actual config read, preserves all source files, and freezes the completed build before the original native timing run. No timing samples were collected by failed build attempts.

The isolated production builder completes without changing project config and records the exact config reads. Its first completed build is excluded from current-source timing: two emitted Excalidraw workspace sources precede concurrent edits, while all adopted selector/paint owners match. The raw before/after change list and compiled-source readback preserve this evidence. No timing was run on that stale artifact (`playground-element-path-adopted-v2-source-changes.json`, `playground-element-path-adopted-v2-workspace-source-readback.json`). The replacement build uses the same original Next flags and isolated loader.

## Adopted-source handoff in progress

Final scoped lint passes over 45 selected files. The strict lane first passes package types/tests, then exposes two stale clipboard benchmark calls to the removed `defineHostCodec`; migration to direct objects under the existing `hostCodecs` owner passes four focused cases and the complete contracts lane. A second strict run stops on a concurrently added widget fixture using an internal key helper with a broader editor type. Its existing public `editor.read(state => state.key(path))` query preserves inference and passes the Plite test typecheck. Full strict replay and the closure matrix remain required.

Four production builds contain stale concurrent Excalidraw input by source preflight and collect no timing samples. The sixth build has stable source and 805 matching emitted workspace scripts. Its first packet stops before measurement because the disposable asset check treated a source-map filename as the script filename; actual script sourceMappingURL association repairs that check. Original runner semantics, warmups, action count and 16/32 ms limits are unchanged. The corrected asset check produces a valid current-source packet with all twenty native/model guards: mutation p95 16.9 ms exceeds 16 ms; frame p95 25.8 ms passes 32 ms. Keep the absolute failure and do not repeat unchanged timings. The earlier schema receipt has seven changed runtime/config inputs at readback and cannot establish current integration timing; rebuild its source graph before one final original-command run.

Evidence: `element-path-final-source-lint.log`, `element-path-final-check-plite.log`, `element-path-final-check-plite-v2.log`, `element-path-final-contracts.log`, `element-path-widget-types-repair.log`, `element-path-adopted-build-preflight-summary.json`, `element-path-adopted-production-v2-receipt.json`, `element-path-schema-input-readback.json`.

Current interactive proof passes native Enter, follow-up typing, two undos and 390px table-row selection on frozen v6, with no console errors (`element-path-interactive-proof.json`, `element-path-interactive-narrow.png`). The strict v3 command passes types, package tests and contracts, then stops at one external-text drop follow-up character assertion. Exact replay passes; five parallel repeats pass; five complete two-file diagnostic runs pass all 155 cases. No product fix or resolved-flake claim is made. Original test source stays unchanged and the diagnostic copy is removed (`external-drop-diagnostic-receipt.json`). Strict v4 resumes bounded proof.

Projected clipboard work is equal across the exact 1000/50000-block fixture: ten diagnostic reads each visit fourteen node paths/fourteen path steps, four fragment nodes, thirteen JSON records/23 keys and seven JSON arrays/eight items. All 252 inputs remain stable. The original 1.693518 timing ratio stays red; no product or timing-contract change is accepted (`element-path-projected-clipboard-work-v2.json`). The first diagnostic invented an object-wrapper identity requirement and failed before a complete count packet; its logs remain preserved, and the corrected diagnostic retains the original deep-value oracle.

The packed facade repair adds four intentionally omitted Plite aliases to the exact expected list; twenty focused verifier tests pass. All 28 size rows are reviewed and the owned generator passes 81 public subpaths and 40 exact optional-peer closures. Its expected golden update and concurrent Copilot runtime change are recorded separately; plain packed readback remains required. A second matrix attempt stops on a package AI unit-test edit with no failed browser assertion. The existing conservative proof-input inventory is preserved.

Final canonical packed closure passes (`pnpm plite:release:packages --keep`): 1332 unchanged inputs, 748 emitted workspace sources matching current bytes, 81 public subpaths and 40 exact optional-peer closures. The earlier direct checker used a stale Copilot build; retain it as historical evidence and use `element-path-packed-final-v2-*` for final source proof. All 28 reviewed size deltas reproduce, the helper passes scoped lint, and the current plan validator passes. The third matrix is source-interrupted after complete Chromium and Firefox batch 88; its exact counts are recorded below.

Third matrix outcome: Chromium completes with 743 passes/eight skips; Firefox stops at source-changed during batch 88 (`ai-menu.tsx`), retaining 466 passes/108 skips/177 missing. Three projects are unstarted. This is the third source interruption across attempts, not three goal turns; the native blocked threshold is not satisfied. Packed proof and clipboard work attribution are concrete progress in this goal turn. No fourth immediate matrix attempt or new runtime optimization is accepted without a different basis. A stable source window is required for full matrix and refreshed production proof. The three frozen timing failures remain separate open requirements.

The own-workload overlap audit gives no basis to invalidate the schema timing packet: strict completion precedes it and the matrix starts after it. Preserve the 65/67 result and identify a new isolating hypothesis before any further timing packet (`element-path-schema-host-overlap-audit.json`).

## Clipboard sampling-order probe

The 1k/50k clipboard comparison creates and measures each editor serially, so document width and measurement order are coupled. Before changing the harness or product, run one six-packet F,R,R,F,F,R diagnostic using the exact original clipboard fixture, preflight, five fragment reads and five host writes per width. Reverse only cohort execution order; preserve raw samples, clocks, selected nodes, payload and runtime source. This isolated owner probe omits earlier unrelated schema workloads and cannot replace the original complete command. A convincing order signal requires forward median width ratio above 1.5, reverse median ratio below 1, a forward-minus-reverse ratio delta above twice the larger packet IQR, and the same ordering in at least two of three packets per arm. Otherwise leave this hypothesis inconclusive or rejected without another unchanged packet or a harness change. A positive result only authorizes a full-prefix causal confirmation, not a budget pass or automatic comparator adoption.

Sampling-order diagnostic disposition: inconclusive. All six F,R,R,F,F,R packets preserve 252 runtime/configuration inputs and all original clipboard guards. Forward ratios are 1.010478, 0.504836, 0.668212; reverse ratios are 1.258893, 1.424242, 2.141899. Median forward/reverse ratios are 0.668212/1.424242, opposite the predicted failure direction, and the delta is below the 1.766011 twice-IQR floor. The selected original 1.693518 failure is not explained by this isolated probe. Keep the original comparator, fixture and budgets unchanged; do not proceed to a full-prefix order confirmation (`element-path-projected-clipboard-order-results.json`).

Current-source production refresh is permitted by actual reachable source changes since v6: AI menu/use-chat/AIChat and subsequent Copilot work. One isolated build named element-path-current-v7 is started through current package builds and the existing SHA-guarded Next config loader. Its purpose is current integration proof, not a retry of unchanged timing inputs. Require raw-source stability, exact emitted-source/HTTP preflight and one original native packet only if those pass; preserve all failures. The closure matrix remains source-interrupted, and the other task is still active on readback.

The v7 production refresh completes with stable raw inputs, build ID `P5GAtSqVZKShXIffOn4yw`, 806 exact workspace script sources and byte-exact served assets. The original five warmups/twenty measured Enter actions preserve all native/model guards and report zero runtime errors. Mutation p95 is 16.5 ms (>16); second-frame p95 is 23.1 ms (<32). Preserve this integration failure and all earlier packets without attributing the timing difference to a Phase 2 intervention. The owned host is stopped. At 03:29 UTC, all 806 production inputs and 735 schema inputs still match; one of the packed packet's 1332 inputs, `CopilotPlugin.tsx`, has changed. The earlier packed pass remains valid for its captured source and does not prove that later edit (`element-path-v7-closeout-source-readback.json`).

## Current blocked audit

The previous goal turn made progress: it completed the fixed clipboard-order probe and the v7 production integration packet. This turn revalidates the same source-integrity blocker for the third consecutive goal turn. At 03:35:47 UTC, five of the v7 production packet's 806 inputs and six of the packed packet's 1332 inputs differ. Fresh AI/suggestion runtime and test edits occurred at 03:30–03:35 UTC; the other task is confirmed active. All 735 schema inputs still match. These changes prevent current-checkout closure, while the archived passing assertions remain valid at their captured sources (`element-path-third-turn-source-audit.json`).

The independent diagnostics have reached their recorded dispositions: compiler serialization/fingerprint candidates and mark reuse are rejected; element/path and DnD reductions are adopted; clipboard work counts are identical and its fixed ordering probe is inconclusive. They do not establish an optimization ceiling or resolve the three original timing limits. No further intervention has a new causal basis. Repeating full verification into the observed edit stream or sampling unchanged timings for a pass would not supply the missing evidence.

The native goal is blocked until the external source state permits current-checkout proof. No product edit, fourth matrix attempt, timing rerun, checkout change or interruption of the other task is performed in this audit. After the source settles, reconcile the affected runtime/package inputs, complete canonical packed and full browser matrix proof, and resume the unresolved timing investigation on identified source. The original completion threshold, budgets and Phase 2 scope remain unchanged.

## Resumed source and semantic proof

The resumed goal starts a fresh blocked audit. Current source reads show 20 production, 25 packed and 12 full-schema inputs changed from the recorded packets, including Plite block insertion behavior, Plate plugin resolution and type configuration. The element/path adoption's twelve files and exact-property proof's eleven files still match. The compiler, sparse-publication and fitter implementations remain retained; source changes in their dependencies require integration proof without discarding the measured controls.

Existing schema, sparse-publication, fitting, identity and state/transaction guards pass **171 tests across ten files** with all **1747 captured inputs stable** (`resumed-schema-owner-correctness-receipt.json`). The original type-budget helper then passes all five unchanged limits with **725 stable inputs**, including 691 actual TypeScript program files. The 1000-plugin fixture records 4,827,380 instantiations, 938,488,832 bytes and 977 ms check time; the instantiation ratio is 1.025521 (`resumed-original-type-budget-receipt.json`). These are current scoped correctness and type proofs, not full schema or browser closure.

Run one complete original strict schema command after these actual reachable runtime/type/configuration changes. Refresh the static runtime and actual type-program inventories first, preserve the original corpus, operation counts, GC and typecheck prefix, and bind before/after source hashes. This is a current integration refresh, not an unchanged timing retry or an additional causal gain. Preserve earlier failures; any source change invalidates the new current-source claim. No production optimization is accepted by this checkpoint.

The resumed full schema command passes **67/67 original predicates** with **1046 captured entries unchanged** (323 static runtime inputs and 691 type-program files before de-duplicating overlaps and adding configuration). Compilation p95 is 9.0295 ms, equivalent reconfiguration p95 is 1.3745 ms with zero compilations, and projected clipboard document/host width ratios are 0.751636/0.633632. The 10k migration p95 is 728.401084 ms with width ratio 12.756224. The original guards, fixtures and thresholds are unchanged (`resumed-full-schema-gate-audit.json`). The broader runtime inventory includes conservative barrel inputs; its count change is an inventory change, not a claimed runtime expansion. The failed 65/67 packet remains preserved at its earlier source. No new compiler or clipboard speedup is claimed.

Twenty reachable source files differ from the v7 production packet. Refresh current package artifacts and build one isolated production Playground as `resumed-current-v8`; preserve raw source, exact emitted-source/HTTP preflight, the original five warmups/twenty native Enter actions and 16/32 ms gates. This closes current-source integration proof only if all checks pass. No unchanged production timing retry or product optimization is authorized by a failed packet.

The v8 production build and original packet preserve 806 exact emitted workspace sources and byte-exact HTTP assets. All twenty native/model transitions pass with zero runtime errors. Mutation p95 remains above the unchanged limit at 16.3 ms; second-frame p95 passes at 19.5 ms. The owned host is stopped (`resumed-current-v8-production-receipt.json`). The latest captured production inputs have not been edited for twelve minutes and packed inputs for fifteen minutes, with complete schema and production packets source-stable during this interval. This is a different observed source window from the earlier interrupted attempts. Run one canonical full browser matrix now, retaining its source guards and all interrupted receipts. No source-ignore change or new timing retry is proposed.

## Reverse read traversal diagnosis

The remaining mark-read profile points to an untested shared read owner:
`previous.ts` requests one reverse match, while `editor/nodes.ts` enumerates
the forward range and buffers every match before yielding in reverse order.
`NodeApi.nodes` already supports directed traversal. First count actual visits
and match calls at several document widths with unchanged public results.
Compare a disposable directed-traversal probe against the original for lowest
and highest modes, retaining all-mode and universal semantics unchanged. Cover
nested nodes, endpoints, void/read-only boundaries, selection kinds and early
termination. This source lead authorizes diagnosis only; public callback order,
exact query results and original native budgets remain mandatory. No runtime
change, acceptance gate or new production timing packet is selected yet.

The diagnostic preserves all 9450 result comparisons and reduces visits for a
single reverse text match from 19/199/1999 at widths 10/100/1000 to five.
Its conservative callback-order screen rejects a general adoption: custom
predicates run in a different order. The frozen result and that observation
remain in `reverse-read-diagnostic.json`; neither is a timing measurement.

Best API's owning contract review selects a bounded directed-read experiment.
The normal call remains `editor.read(state => state.nodes.find({ at: [],
reverse: true, mode: 'lowest', match: node => TextApi.isText(node) }))`, using
`createEditor` and `TextApi` from `plitejs`. Customization keeps deterministic
node/path predicates; all-mode and universal reads retain their existing exact
output and traversal path. The existing replayable-read law is in Best API's
schema-and-identity capability table. Query tests require exact reverse results
and lazy first-match reads; no source documents forward callback order for a
reverse query as an independent job. Callback evaluation counts/order are an
observable adoption change and will be reported, not claimed identical.

The maximum-value cut removes buffered forward enumeration from non-universal
lowest/highest reverse queries and reuses the existing directed `NodeApi.nodes`
iterator. The generic node-query owner stays because type, schema, void,
read-only, range and match semantics are current jobs. All-mode buffering stays
for exact inverse order; universal buffering stays for whole-range validity.
No public noun, flag, store, cache, package or additional traversal owner is
introduced. Plite Plan adoption remains in this existing phase plan.

- [x] Before timing, prove original query, state-query, previous-node, marks,
      root, void/read-only, Unicode and selection contracts through a verified
      source override. Extend the differential corpus with structural selectors,
      disjoint selections, boundaries and early termination. Reject on a result
      or native law failure; preserve the changed callback-order observation.
- [x] Count original measured Playground Enter intervals on source-isolated
      production arms. Require fewer visited nodes and no shifted/deferred work.
- [x] N/A after rejection at the native work-count gate: do not run six fixed
      B,C,C,B,B,C original production packets with five warmups
      and twenty native actions each. Keep only with at least 20% and 2 ms
      mutation p95 improvement beyond twice the larger IQR. The original
      16/32 ms gates and normal/large correctness guards remain unchanged.
      Reject a miss without unchanged timing retries or fallback adoption.
- [x] N/A after rejection before timing: no source adoption or teaching change.
      The conditional requirement was to adopt only after acceptance, preserve exact
      reverse-result and lazy-read tests, reconcile callback teaching as needed,
      and complete current package, production and full browser closure.


## Resumed package and browser checkpoint

The resumed matrix completes Chromium at 743 passes/eight skips and Firefox at
636 passes/115 skips. A Markdown snapshot update invalidates mobile batch 99;
98 credited batches retain 299 passes/363 skips/89 missing. WebKit is interrupted
after batch 56, and mobile WebKit is unstarted. No old WebKit summary is used.
The source guard and failed packet remain intact (`resumed-matrix-interruption-summary.json`).

The first strict refresh passes package types/tests but fails four verifier
expectations. Three predate the canonical `platejs/find` feature export; one
incorrectly treats TypeScript source aliases as public import authority. The
repair records the exact 29 feature sizes/13 headless plugin runtimes and checks
all public Plite aliases against canonical source entries. Existing import
restrictions stay with Oxlint. All 52 focused tests and scoped lint pass. The
second strict run passes every step on 3527 stable captured paths and reuses
743/eight Chromium proof through the canonical runner's matching fingerprint
(`resumed-strict-v2-receipt.json`).

The canonical packed refresh first preserves a missing-golden failure for Find.
Review covers all 29 size rows and 19 emitted source changes; 750 packed sources
match the checkout. Suggestion's namespace grows by 496895 bytes because its
new review hook reaches the existing React runtime. Named-plugin proof changes
only 870271 to 871170 bytes; the hook alone is 1367141 bytes. The hook remains
tree-shakable for plugin-only consumers. The owned generator then passes four
packages, 82 subpaths, 77 runtime imports, 42 React-free imports, one SSR renderer
and 40 exact optional-peer closures. All 29 generated values equal the reviewed
values; source capture and golden readback are separate receipts. These are
current-checkout integration results including concurrent feature work, not
Phase 2 bundle-size gains (`resumed-packed-size-review.json`,
`resumed-packedupdate-receipt.json`, `resumed-packed-golden-readback.json`).

The reverse-read candidate's verified source override passes 474 existing tests
across nine query/state/root/marks/transaction files. The 9450-case differential
probe and this scoped pass do not satisfy its remaining extended corpus, native
count, paired timing or adoption gates. Production remains unchanged.


The extended reverse-read semantic comparison passes 266640 cases with identical
result digests over nine documents, two roots, all modes, universal/void policies,
pure pass pruning, type selectors, path/span endpoints and text/node selections.
Every early first-match result equals its full result head. The source override
also passes 533 existing contracts across thirteen files; all 2768 captured
source/configuration inputs remain stable (`reverse-read-extended-v6-receipt.json`).
Earlier disposable-fixture/schema/path-loader failures are preserved separately;
none executes a candidate timing packet or changes the product. The native-count
stage is next, using two isolated production builds with identical visit counters.


The reverse-read native count gate rejects the candidate. Both frozen production
arms preserve all twenty native/model transitions and visit exactly 6760 nodes
in 680 query calls, including 540 visits in 180 reverse queries. All work ends
within the second-frame interval, with zero later visits; whole-page totals are
also identical at 15358 visits. The caret is near the document start, so this
query is only three visits in either direction. The six plain timing packets
and adoption gates are N/A for this rejected candidate; they are not waived for
an adopted change. Diagnostic timings remain in their packets and cannot replace
the original uninstrumented production failure (`reverse-read-profile-results.json`).
Both owned hosts are stopped and the runtime source is restored exactly.

The canonical matrix resumes with its own matching proof and source guards.
No source filtering or missing-test accounting changes. During this continuation,
inspection of `positions.ts` identifies a separate predecessor cost: a range
crossing two top-level blocks collects every text entry in the entire document,
then evaluates atomic/read-only ancestry before discarding out-of-range entries.
The target is to collect only the intersecting top-level blocks using the existing
live-entry helper. Keep the complete first/last blocks so atomic and Unicode
segment semantics remain with their current owners. No cache, public API or new
traversal owner is proposed. Existing same-leaf and same-block cases stay intact.

For this new range-window experiment, require source-bound visit/ancestry counts,
full position/previous/marks semantics over forward/reverse ranges, every unit,
void/read-only/atomic/inline boundaries, named roots and Unicode. Only a passing
native count stage unlocks six fixed B,C,C,B,B,C original Enter packets. Keep
only with at least 20 percent and 2 ms mutation p95 reduction beyond twice the
larger IQR, preserving the original 16/32 ms limits and normal/large native guards.
A miss rejects it without unchanged timing retries. No product mutation or build
override is permitted while the active browser matrix reads the checkout.


The resumed canonical browser matrix exits zero at 06:09:10 UTC. Current
per-project readback has complete coverage and no missing cases: Chromium
743 passed/eight skipped, Firefox 636/115, WebKit 657/94, mobile viewport 345/406,
and mobile WebKit two/zero. This owned run and subsequent matching summary reuse
are distinguished in `resumed-matrix-v2-readback.json`. The source guard stays
unchanged. The result proves the restored pre-candidate checkout; a later adopted
position change would require fresh matching browser proof.

The range-window semantic prototype preserves 65444 position/predecessor results
and 533 existing tests on 2768 stable captured inputs. The width probe preserves
exact before/previous answers and reduces atomic-ancestry checks for an early
cross-block range from 10/100/1000 to two, while a range ending at the last block
retains the full-width count. The initial `nodes` diagnostic counter measures
collector callbacks and excludes the reused top-level helper lookup; production
instrumentation explicitly counts both helper roots and collected descendants.
The two source-isolated native profile builds are underway after matrix completion.


The position-window native-count gate passes. The original twenty Enter actions
visit 44100 collector/top-level nodes and perform 22740 atomic-ancestry checks;
the candidate visits 720 nodes and performs 600 checks. All forty native/model
transitions pass, with zero events shifted beyond the second frame. Whole-page
counts also decrease (55125 to 900 nodes and 28425 to 750 checks). Source maps
bind 806 workspace script inputs; the sole workspace difference is the
instrumented `positions.ts` owner, CSS is identical and served/loaded assets are
verified. Instrumented latency remains diagnostic only. The two hosts are stopped.
The six fixed plain production timing packets are now unlocked; all frozen
materiality, noise, absolute and correctness gates stay unchanged
(`position-window-profile-results.json`).


The position-window experiment is rejected by the six original plain packets.
All 120 native/model transitions pass with exact frozen/served source identity.
Pooled baseline/candidate mutation p95 is 22.1/21.9 ms: a 0.2 ms reduction
(0.90 percent), below both materiality limits and the 5.4 ms twice-IQR floor.
Every candidate packet misses the unchanged 16 ms mutation budget. Median
19.6/17.4 ms and reduced work counts do not replace the failed tail contract.
All packets remain preserved; no product code is adopted and both hosts are
stopped (`position-window-production-results.json`). No unchanged timing retry.

The next diagnostic will capture one CPU profile and browser timeline around the
original native action loop on the existing verified baseline production build.
Map samples to the twenty measured Enter intervals with a shared browser timing
marker, keeping warmups and undo separately identifiable. Source-mapped exclusive
costs will distinguish predicate/position work, commit observers, React, GC and
layout before another implementation is chosen. Profiler timings are diagnostic
and cannot satisfy the original uninstrumented budget or rehabilitate either
rejected candidate. No new product source or observer policy is selected.


## Transaction-group construction diagnosis

The source-mapped CPU diagnostic attributes 77.208 ms inclusively to
`getUpdateView` across the twenty exact Enter mutation windows. This is sampled
ownership evidence, not an expected gain or acceptance timing. A separate
source-bound counter build establishes the actual repeated work: 100 detached
spec views and twenty update views each construct all 59 registered update
groups. Across these 7,080 constructions, only twenty guarded plugin methods
are invoked, all from `override`. No construction or method invocation is
shifted past the second frame. All twenty native/model transitions pass.

The build changes only `public-state.ts` for counters and restores its original
SHA-256 `acb4067d54de538c0d51407925ccc8372dc7be27bd8faf0c5fb72b91fba9f119`.
All 806 emitted workspace scripts match the current source except that declared
instrumentation; normalized CSS content matches the preceding frozen baseline.
All served script/CSS bytes and loaded owner assets are verified. The first
source-map extraction compared raw CSS source-map comments; the corrected
extraction strips only those comments, retaining frozen byte verification.
See `transaction-groups-profile-results.json`, its full native packet and
`playground-transaction-groups-baseline-profile-build-receipt.json`. Diagnostic
mutation/frame p95 is 17.5/20.9 ms and cannot replace the original production gate.

Best API hard-cut examination: keep the existing direct `tx.<name>` and Plate
`tx.plugin(Plugin)` calls. Namespace deletion would remove independently owned
capabilities; another public cache or portal has no user job. The current loop
also enforces protocol validation for unused groups: the existing extension
portal test rejects an empty update when an installed factory returns nested
`then` or `toJSON`. Merely deferring all factories would weaken that existing
validation boundary and is rejected as a target. Reusing an immutable method
topology is an unresolved alternative: it must preserve per-transaction local
state, detached-spec isolation, escaped-method rejection, named roots,
`afterCommit`, reconfiguration and descriptor identity without retaining an old
draft. No cache, public law change or runtime implementation is accepted by this
diagnostic. The next bounded action is to probe those lifetime laws against a
concrete reusable topology or identify a smaller deletion that preserves them.


### Single lowering of authored update methods

The next disposable target preserves every factory invocation and transaction
lifetime. `resolvePluginCapability` already validates, merges and freezes all
constructor/extension-authored update contributions. `resolvePlugins` then
recursively merges that result again with synthesized defaults. Every default
is an owner-generated plain function at one root key; a root-level overwrite
therefore has the same merge semantics as the general recursive merger.
Normalize any direct factory branch once through `mergePluginCapabilities`,
freeze the generated functions, and combine the two flat root records once.
No cache, validation escape, public option, method binding, factory invocation
policy or Plite guard changes. The canonical merger retains arbitrary authored
method-tree validation. This is the largest selected cut that preserves the
measured transaction-local factory job and eager invalid-group rejection.

Pre-acceptance gates, frozen before candidate execution: compare authored
method trees, ordinary element/mark defaults, nested overrides, own prototype
keys, callable members, factory-local state, active/spec methods, escaped
methods, invalid groups and descriptor reconfiguration. Count general merger
property visits in the unchanged twenty native Enter actions for both arms;
require at least 25 percent and 1,000 fewer visits, with unchanged factory and
method-use counts and no work shifted after the second frame. Then run six
fixed B,C,C,B,B,C original production packets, five warmups and twenty actions
per packet. Pooled mutation/frame p95 must not regress by more than 5 percent;
a smaller apparent improvement is not a latency claim. Original 16/32 ms and
zero-long-task limits remain required for final-source handoff. A miss rejects
the candidate with no fallback or unchanged rerun. The normal/large native,
package/type, packed and matrix gates apply after a retained source change.


### Single-lowering acceptance and final-source checkpoint

The candidate passes 49 baseline/candidate semantic comparisons and 320 focused
cases across twelve files, including eager protocol rejection, descriptor
publication, transaction-local state, spec isolation, roots and after-commit
behavior. All 79 source-first type tasks pass. The initial proof invocation
omitted its override environment variable; a separate corpus draft incorrectly
expected after-commit hooks for a no-op update. Those harness failures remain
preserved; the corrected mutation-bearing corpus and source-bound receipt are
`transaction-lowering-semantics-receipt.json`, with 2,768 stable inputs.

Both frozen native instruments preserve all forty native/model actions.
General update-merger property visits fall from 157,920 to 50,400 (68.09 percent,
107,520 visits removed). The 120 views, 7,080 factories and twenty method uses
are unchanged; there are no visits shifted past the second frame. All 806
workspace scripts, identical CSS content, declared instrumentation, HTTP asset
bytes and loaded owner assets are accounted for. The two profile hosts stopped.

Six fixed original production packets pass the frozen work/neutral-latency
contract with all 120 native guards. Pooled mutation p95 is 21.6/20.3 ms and frame
p95 26.1/24.5 ms. The 1.3 ms mutation difference is inside the 3.6 ms noise floor;
no latency gain is claimed. The candidate is retained for deleting measured
redundant work. Original absolute limits remain mandatory for phase completion.

`resolvePlugins.ts` is adopted locally. Scoped `pnpm lint:fix` passes. Its final
SHA-256 is `56a58fae32419c48f9ce484f34d4b7e093089622d7a33a6ab3e1268f432df5a9`;
a parsed syntax-tree comparison proves that formatting changed no program
structure relative to the measured candidate. Final source again passes all
49 comparisons, 320 tests and 79 type tasks with 2,768 stable inputs. The new
frozen build matches all 806 emitted workspace scripts. Its one original
production packet preserves all twenty native/model guards but still fails
mutation at 24.1 ms; frame p95 passes at 28.7 ms. The final outer log path collided
with the runner log path; preserve that mixed-writer log and use the intact
structured native JSON and packet/source receipts as authoritative. The host
is stopped. No unchanged timing retry follows this failure.

A read-only process snapshot immediately after the packet shows substantial
unowned CPU activity, including about 190 percent from the active game. That
snapshot does not prove causality or waive the failure. The user has been asked
whether they can pause the game for one controlled check; package verification
continues independently. No other application is paused or terminated. Final
strict/package, schema and full browser proofs must be refreshed for the newly
retained owner before Phase 2 can close.


### Placeholder proof checkpoint

The first strict refresh fails in the default host case of
`BlockPlaceholderPlugin.spec.tsx`: after blur, the placeholder attribute is gone
but the next assertion observes its class. All 3,532 captured inputs remain
stable. Source-first type checks pass; the package lane stops at one failure
among the React core partition's 294 cases. This packet does not prove the
remaining strict runner or browser gates.

The original single-file test passes on both the adopted owner and the exact
pre-lowering owner. Six fixed B,C,B,C,B,C runs of the canonical 41-file React
core partition also pass all eighteen original host assertions, with diagnostic
render/focus and post-assertion convergence readback. This does not establish
that the strict failure was unrelated to the candidate or prove a race cause.
The original red receipt and every diagnostic result remain intact.

The verifier now waits for the placeholder and class together, preserving both
positive and negative assertions and the existing timeout. No runtime source,
latency threshold or native guard changes. This strengthens the complete
settled-state predicate rather than treating one attribute as a synchronization
signal for another. The original assertion failure remains unexplained; the
refreshed strict gate must still pass on the adopted runtime. This is a scoped
Task closure proof repair, not a claimed placeholder product fix.


### Command policy and prepared-spec work probe

The existing exact-window CPU trace identifies six transaction-view call paths
per Enter. Two are internal policy overhead: OverridePlugin creates a detached
transaction merely to return false for an absent/default action; prepared-spec
continuation asks for a complete update view solely to iterate empty metadata.
The trace attributes 11.708 ms and 12.709 ms inclusively to those view paths
across twenty Enter actions, respectively. These sampled values identify the
next owner; they are not a gain forecast.

Best API's maximum-value cut is to delete OverridePlugin's update group and
its three interpreter fragments. The production consumer scan finds one owner
with five calls, all in OverridePlugin; the only other named consumer is the
private core capability type projection. The plugin survives as the existing
compiled node-rule interpreter: it owns command rules, merge read policy and
normalization. Removing that policy would remove current behavior. Custom
rules remain declarative `rules.break`, `rules.delete`, `rules.match` and
command contributions; no forwarding methods or aliases are added. The normal
public operation remains `editor.update.command(editorCommands.insertBreak)` from
`platejs`; advanced command composition retains `state.transaction` and
`next.after`. The three generic interpreter method names have no independent
production job and are not retained as a customization API. Their private
implementation moves directly into the owning commands with inferred `tx`.

Plite independently skips update-view construction when an already-prepared
spec has neither annotations nor tags. Explicit public update/spec callbacks
still construct and validate all installed method groups eagerly. Metadata
ordering, annotation reduction, selection, effects, named roots, continuation
isolation, rollback, history and escaped-method guards remain unchanged. A
private replay context is not an additional public update callback. There is
no lazy factory mechanism, cache, scheduler or new public noun.

Pre-acceptance sequence: create disposable source overrides, run existing
command/input-rule/override/transaction/history and invalid-group laws, and
compare baseline/candidate result corpora covering rule actions, continuation
metadata and rollback. Then collect one original native counter packet for
four fixed arms: baseline, metadata-only, override-only, combined. This
attributes each deletion without accepting either arm as a fallback. Combined
acceptance requires at least 30 percent and 2,000 fewer group factories across
the original twenty native Enter actions, with no new post-frame work and
exact native/model transitions. Compare only baseline and combined in six
fixed B,C,C,B,B,C production packets with the original five warmups/twenty
actions. Mutation and frame p95 must remain within five percent of baseline;
no speedup is claimed inside the noise floor. Original 16/32 ms and zero-long-
task limits remain required for final completion. A miss rejects this probe
without an automatic fallback or unchanged timing retry.

The touched owners are Plate's rule interpreter and private capability type
projection, and Plite's internal prepared-spec replay. No Phase 3 feature
work is included. Acceptance must precede adoption. A retained public method
cut requires Best API doctrine reconciliation, the Plate Next version record,
barrel regeneration and exact final package/native/normal-large/browser proof.
Earlier strict proof is allowed to finish while only process-local prototypes
are evaluated; production source remains unchanged during that packet.


### Ninth-change strict readback and policy prototype correctness

`transaction-lowering-strict-joint-receipt.json` records a passing original
`pnpm check:plite`: source-first package types, all package tests, runner
contracts and 743 Chromium cases with eight declared skips, in 120 bounded
batches. All 3,532 source inputs remain unchanged throughout. The earlier
placeholder failure is retained; this pass proves the joint settled-state
assertion, not a retrospective diagnosis of the original observation.

The command-policy prototype passes 552 focused cases across nineteen files
and all 79 source-first type tasks. Its 196-case differential corpus preserves
exact documents, selections, command results, metadata, undo/redo and rejection
behavior. Nine lift attempts correctly violate a root that permits only its
wrapper; the first corpus draft wrongly expected no rejections. The v2 corpus
retains those nine exact schema errors and asserts rollback. Baseline and
candidate output hashes are identical. All overrides are disposable and source
bound; the type probe restores each of its three owners byte-for-byte. Four
frozen profile builds are the next causal gate; no policy change is adopted.


### Command-policy adoption checkpoint

Four native diagnostic packets prove each deletion: baseline 120 views/7,080
factories; metadata-only 100/5,900; override-only 100/5,800; combined 80/4,640.
All eighty native/model transitions pass. The combined result removes 2,440
factories (34.46 percent), retains twenty active update views and every other
installed group, and moves no work past the second frame. All 806 emitted
workspace scripts and HTTP assets match the declared source; only the two
runtime owners differ. The capability projection is type-only.

The fixed B,C,C,B,B,C production comparison passes all 120 native guards and
the unchanged work/latency-neutrality contract. Pooled mutation p95 is
21.5/20.1 ms and frame p95 is 25.9/24.1 ms. The 1.4 ms mutation difference is
inside the 2 ms noise floor; no latency gain is claimed. The original 16 ms
mutation gate is still unmet. No timing packet is dropped or retried.

The exact prototype is adopted in its three source owners. Scoped lint first
rejects two shadowed exit-branch variables; renaming only those lexical
bindings fixes lint. A Babel scope-aware comparison proves the final syntax
trees identical to the measured prototype after those two alpha renames and
formatting metadata are accounted for. The current source is therefore bound
to the accepted work comparison, but final semantic/package/type/packed,
schema, original native and normal/large/full-matrix proof remain required.
Best API doctrine v165, generated mirrors and barrel generation pass. The final
196-case oracle, 552 focused tests and 79 source-first type tasks pass on 2768
stable inputs (`command-policy-final-receipt.json`). All four
profile hosts and both plain hosts are stopped.


## Final command-policy proof checkpoint

Best API source teaching names command ownership without changing workflow
routing. Existing Vision and plugin-authoring laws already reject publishing
private fragments; the bounded dependent-rule and mirror scan contains none of
the three removed methods or their exported type. Plate Next v165 validates,
with both package attestations unchanged. `pnpm brl` and `pnpm install` pass.
The final adopted source matches all 196 baseline scenarios and passes 552
focused cases plus 79 type tasks on 2768 stable inputs. See
`command-policy-final-receipt.json`, `command-policy-doctrine-validate.log`,
`command-policy-final-barrels.log` and `command-policy-final-install.log`.

The final production build captures stable source and all 806 emitted workspace
scripts match it. A wrong archived server variant fails static-asset preflight
with HTTP 404 before any sample is collected. The host is stopped and replaced
by the existing verified custom-server runner; preserve the failure in
`command-policy-final-production-wrapper.log`. Original five-warmup/twenty-action
measurement and 16/32 ms limits remain unchanged.

The final original production packet passes mutation p95 **14.3 ms** and
second-frame p95 **17.7 ms**, with all twenty native/model guards, zero runtime
errors and zero long tasks. The exact adopted work cut remains a work-count
result: its paired p95 difference is inside noise. All 67 original schema
assertions pass on 1046 stable inputs; compilation is 9.739375 ms p95 and the
1000-plugin fixture uses 4,809,573 instantiations and 937,253,888 bytes.
See `command-policy-final-production.json`, `command-policy-full-schema.json`
and `command-policy-full-schema-gate-audit.json`.

Final source-first strict proof passes package types/tests, runner contracts
and 743 Chromium cases with eight declared skips across 120 bounded batches.
The plain canonical packed command passes four packages, 82 subpaths, 77
runtime imports, 42 React-free imports, one SSR renderer and 40 exact peer
closures on 3532 stable captured paths. All 29 golden changes were reviewed;
28 entries shrink by 156 bytes and resizable/react grows by 45 bytes through
the shared prepared-spec owner. The owned generator and subsequent plain
check reproduce every value. See `transaction-lowering-strict-commandpolicyfinal-receipt.json`,
`transaction-lowering-packed-commandpolicyfinal-receipt.json` and
`command-policy-packed-size-review.json`. The full browser matrix passes; final coverage is recorded in the completion audit below.

The bounded native refresh passes six attempts and 48 actions. The existing
actual-route runner verifies full 1000/10000-block DOM coverage and start/middle
typing for both Plate and Plite on 659 exact emitted workspace scripts.
Interactive Playground proof preserves heading/table content, native pointer
Enter, exact two-step undo/redo and 390px typing with exact undo. All owned
hosts stop, the viewport resets and the task tab closes. These are native
correctness checks; the small diagnostic sample is not a new timing comparison.
See `command-policy-final-native-smoke.json`, `command-policy-final-routes-receipt.json`,
`command-policy-final-interactive.json` and `command-policy-final-hosts-stopped.json`.


## Final completion audit

All six original obligation rows are resolved without narrowing Phase 2.
P2-R1 has the frozen matched mount/edit distributions, decomposition and current
normal/large/native route refresh. P2-R2 has the exact comparator repairs,
sparse causal proof and separate normalization/collaboration attribution.
P2-R3 records all four conditional dispositions; P2-R4 has current original
67-predicate schema proof, exact inference and packed consumers. P2-PROOF has
final strict, native, matrix and original locality controls. P2-CLOSE binds
those receipts to current source, reconciles every source-linked checklist,
and stops before Phase 3.

The final canonical matrix accounts for **3006 selected project/test rows**:
**2383 pass and 623 declared skips**. Four optional stress-artifact replay rows
are excluded by the existing runner because no stress artifact is supplied.
Chromium reuses the exact matching final strict proof; Firefox, WebKit, mobile
and mobile WebKit execute. All project fingerprints, full case identities,
skip/exclusion reasons and coverage are archived in
`command-policy-final-browser-matrix-summary.json` and its five linked raw
summaries. There are no missing, duplicate or unexpected outcomes.

The two explicitly required controls run once, serially after the matrix,
with original cohorts and thresholds. Query/membership passes **18/18 guards**;
Yjs uses **10000 blocks and five samples**, with local/sync distance ratios
**1.041236/1.190836 <2**, node-key p95 **0.137958 ms <1**, zero detached batch
transactions and six passing property-context rows. Each command preserves
1321 captured inputs. See `command-policy-final-controls-summary.json`.

Current-source readback passes every captured package, schema, production,
route, native and control inventory, both native bundle hashes and the
canonical browser-run digest. Both production builds retain all frozen files.
The original route receipt lacks a captured trace-runner hash; its application
and asset fingerprints are complete, and its timings remain diagnostic.
See `command-policy-final-source-audit.json`. No later source mutation is
required; final report edits do not change these effective inputs.

Method obligations are reconciled: strongest justified owner cuts precede
implementation; exact laws and callback inference remain; fixed sampling and
noise gates decide adoption; rejected prototypes stay outside production;
failed raw receipts remain preserved; final source is measured or reconciled
without unchanged timing retries. Best API/Plate/Plite ownership, doctrine
versions 163–165, generated mirrors/barrels/registry, branch changeset policy,
packed consumers and scoped lint all have receipts. Technical teaching did
not change general workflow, so Maintain Workflow and Agent Native Reviewer
are inapplicable. Autoreview is inapplicable on `next`; publication and later
phases remain outside the authorized scope.

Final completion commands pass: `command-policy-plan-complete.log` reports
`Benchmark plan: complete`; `command-policy-autogoal-complete.log` reports this
plan complete. The final document/source readback receipt binds these outcomes
to the closed report. No required Phase 2 work remains.
