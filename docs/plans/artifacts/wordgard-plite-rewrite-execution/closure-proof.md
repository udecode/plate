# Wordgard to Plite architecture closure proof

## Architecture

- `DocumentChange` is the only mutation, mapping, inversion, history, and
  collaboration truth. Transactions construct immutable `TransactionSpec`
  values and publish canonical changes atomically.
- Compiled schema tables, fitted open slices, canonical leaf construction, and
  changed-range correction own validity. No representation-normalizer loop or
  operation-derived commit reconstruction remains.
- Extension reconfiguration is transactional. Host codecs, the private mapped
  view-store kernel, and versioned field/effect/history codecs have one owning
  boundary each.
- Yjs translates remote events into canonical incremental changes and lowers
  changes outbound. Replay-validated intents are optional adapter metadata, not
  document truth.
- Plain JSON, structural sharing, roots, anchors, extensible selections,
  explicit facets, lazy changed queries, the DOM phase scheduler, and the
  React/DOM/input/layout boundaries remain intact.

Exact active-source/current-doc scans return zero matches for
`EditorCommitImpact`, `EditorOperation*`, `OperationApi`, transaction
`.operations`, operation queues/middleware, and operation-as-truth doctrine.
The imperative renderer is the sole accepted deferral.

## Package, documentation, and browser proof

- `pnpm check:plite`: passed after all architecture and input-ownership fixes;
  source-first typechecks, package suites, and all Chromium functional,
  mutation, huge-document, and pagination rows passed: 682 passed, 7 skipped,
  zero retries.
- `@platejs/plite-react`: 63 files / 867 tests passed; source-first Turbo
  typecheck passed.
- Focused Firefox 20,000-block virtualized typing: 10/10 passed with one worker,
  zero retries. The regression locks repaired-model ownership across stale DOM
  target ranges without disabling the native text fast path.
- `pnpm check:plite:browser-matrix`: Chromium 682 passed / 7 skipped,
  Firefox 578 / 111, mobile 321 / 368, and WebKit 594 / 95, all with zero
  retries.
- In-app Browser proved rich-text edit/undo, fitted rich paste plus follow-up
  typing, persistent annotation projection, multi-root edit/undo, 15-page
  pagination, and four-peer Yjs convergence. Exercised final routes had zero
  console errors.
- New `DocumentChange` and canonical-substrate docs routes render; deleted
  operation routes return 404. `pnpm --filter www build:source` and the
  source-first www typecheck passed.

## Benchmark proof

All 13 current Plite benchmark runners execute against live source. The
10,000-block / 250-anchor / 250-edit cohort constructs one canonical
`DocumentChange` and applies it once to the shared anchor registry rather than
rebuilding document indexes for each anchor. The dedicated bulk lane passes
exact anchor/offset correctness with 513.35 ms setup, 495.16 ms anchor
creation, 141.78 ms change construction, 610.91 ms rebase, and 0.04 ms
resolution.

The benchmark is calibration-only: it records equivalent workloads and does
not invent a release SLO. The rejected commit-batched shortcut remains deleted
because it violated browser selection semantics.

- Middle-document typing in a 1,000-page virtualized document gates both p95
  text observation and event-to-paint latency against a measured-frame-cadence
  budget clamped to 24–32 ms; maximum event-to-paint latency stays at or below
  120 ms.
- Benchmark source contracts: 17/17 passed.
- `pnpm bench:targets:check`: passed for the live target registry.

## Release and generation proof

- Ten package-scoped changesets cover Plite core/DOM/React/history/layout,
  Browser, Yjs, Core host-codec adoption, Markdown host-codec adoption, and
  Plate transaction closeout.
- `pnpm changeset status`: exit 0. Existing beta-version dependency warnings
  are workspace baseline, not missing architecture coverage.
- `pnpm brl`: passed after public file/export changes.
- `pnpm lint:fix`: passed across 4,793 files with no fixes.
- `pnpm check`: passed under Node 22. The 22-case table column-transform matrix
  remains intact in its slow-suite owner and passes 22/22 without violating the
  fast-suite timing contract.
- `autoreview`: the full-bundle first pass found one P3 limited to unfilled
  proof placeholders in this artifact; those placeholders were replaced with
  exact results. The identical full-bundle rerun reported no accepted or
  actionable findings.
- Templates and CI-owned registry JSON were not edited. Registry source
  generation remains CI-owned by repository doctrine.

## Residual boundary

The first-party imperative renderer remains deferred until a non-React host has
measurable parity and performance requirements. No compatibility alias, dual
transaction engine, or operation-era runtime remains to support that future
work.
