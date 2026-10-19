# Bounded streaming evidence probe

Status: Completed bounded evidence review; production acceptance and matched browser scale claim unproven

User authority: 2026-09-28 bounded streaming evidence review. Product read-only;
all writes confined to this directory. Branch checked: `next`. No staging,
commits, ledger updates, product repairs or engine replacement. Autogoal applied
under the standing request. No native subagent capability is available; evidence
is collected sequentially, not represented as independent review.

Acceptance:

- [x] Trace joiner thresholds, full parse/fit, preview publication and Plite identity — REPORT.md and dependencies.json.
- [x] Discover existing benchmark/browser proof owners and source identities — source manifests, initial-run-status.json and browser-doctor.json.
- [x] Compare 10 KB and 50 KB ASCII streams, 64-byte chunks, separate parse/fit/publication when possible — benchmark.json and benchmark-rich.json; frozen sampling partial, not a production pass.
- [x] Disposable current-grammar prototype for independent blocks; every preview compared with full partial parse, including references, footnotes, fences, lists, tags and seeded random chunkings — correctness.json, 1,996 previews; rich grammar uses full fallback.
- [x] Strict final parse, stable identity observations, explicit unsupported/general-correctness limits — 309 committed-prefix identity assertions; stronger unchanged-node promise fails (identity-oracle.json).
- [x] Chromium publish/render feasibility checked; explicit unmeasured gap — stale built inputs, no exact-route host, normal preparation writes outside permitted scope.
- [x] Previous-result versus handle comparison: owner, fingerprint, retention and invalidation — REPORT.md.

Frozen comparison: same source, plugins, fixture, chunks and process; one warmup,
five interleaved packets per size initially. A speed claim requires median delta
over 20% and 5 ms cumulative, outside observed paired variation. Report per-stream
totals and per-update p50/p95, deterministic parsed bytes and identity reuse.
No p99 claim from five streams. Correctness precedes interpretation of speed.

This is an embedded pre-acceptance architecture probe, not the comprehensive
Benchmark repair workflow. Applicable lanes: source readiness, owner microbench,
10/50 KB scale, publication identity and conditional Chromium. Main/Slate
comparison, mount breadth, typing matrix and unrelated examples are outside the
explicit bounded request. No production implementation acceptance follows.

Sampling checkpoint: five matched pairs completed for plain 10 KB. Plain 50 KB
stopped after one matched pair (exit 130 during next pair; ~88 seconds of timed
operations in first pair). Original five-pair target remains incomplete. A
separate explicitly diagnostic rich run used one pair per size and no warmups.
Its results do not replace the frozen target. Source hashes unchanged across
both measurement intervals. No 3.2-second or production pipeline-total claim.

User corrections retained: syntax dependency region is not the last text block;
oracle includes diagnostics/coordinates and unchanged-node identity; callbacks
and global transforms invalidate reuse; Plite's existing model/key retention
is distinct from parser allocation; fit and publish independently refit and
must not be summed as a production pipeline; partial sampling is preserved.

## Interaction Coverage

- first-interaction: N/A for headless conversion; exact-route browser action unexecuted, gap preserved.
- settled-interaction: headless value replacement observed; DOM/React/paint unmeasured.
- route-scope: exact demo/spec identified, no fresh authorized host established.
- reporter-profile: N/A; no user browser profile or native-input complaint supplied.

Next: deliver evidence and public-contract recommendation. No downstream design
or implementation is authorized by this review.

User scope expansion: owned source-first www development host and necessary
generated registry/package/app outputs are now authorized. No hand product
edits, staging or commits. Two informed setup/runtime attempts maximum. Exact
route is `/blocks/markdown-streaming-demo`; use existing harness and report any
missing publication/React measurement entry point precisely. Own and stop the
server. First Playwright attempt failed before launch because this artifact
directory is CommonJS and `import.meta.dirname` was used; second attempt uses
`__dirname`. Editable demo policy corrected: strict every prefix via default
`final: true`; static demo is permissive partial throughout, without final transition.

Browser closure: registry/test-package preparation succeeded; owned www server
3297 served current source. Attempt 2 passed both exact-route Chromium modes
with DOM and profiler observations; attempt 1 config failure preserved. Existing
surface cannot inject arbitrary 10/50 KB transcripts or candidate parser output
into the actual preview publisher, and has no React commit callback. This exact
instrumentation gap is retained in BROWSER-REPORT.md rather than replaced with
generic value-change timings. No product hooks added. Server PID 3639 stopped.
HEADLESS-REPORT.md preserves the headless evidence with corrected demo policies.
