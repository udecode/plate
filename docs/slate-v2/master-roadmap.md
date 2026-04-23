---
date: 2026-04-18
topic: slate-v2-master-roadmap
status: active
---

# Slate v2 Master Roadmap

## Purpose

Canonical tranche order for porting `../slate-v2-draft` into the fresh
`../slate-v2` clone.

## Execution Doctrine

- build one merged contract corpus per package from:
  - legacy exact tests/docs
  - draft contract tests/docs
  - current proof owners
- legacy rows are the default truth
- draft rows are kept when they represent intended v2 behavior and do not
  conflict with kept legacy rows
- for core engine files, test-backed contract coverage outranks current source
  shape
- rewrite is allowed, and required when necessary, for kept rows
- same-path/source-close pressure stays strongest for docs, examples, and
  public package surfaces
- the program has two non-negotiable gates:
  - parity gate
  - v2 north-star gate

## Tranche Order

### [x] Tranche 1: Root, Tooling, Docs

- package manager reset to `bun`
- Turbo-owned build/type graph
- Biome + flat ESLint
- Bun-owned test discovery + lockfile
- package-manifest build/type owners
- docs split:
  - live `docs/slate-v2/**`
  - archived `docs/slate-v2-draft/**`

Review stop:

- before any package source recovery starts

### [x] Tranche 2: React 19.2 And Low-Risk Compatibility

- React 19.2.5 baseline
- Next 16.2.4 baseline for the site/runtime surface
- TypeScript 6.0.3 baseline
- forced compatibility fallout only
- package-src HMR proof without package rebuilds
- no semantic behavior changes
- early `slate-browser` landing stayed non-conflicting and is now live

Ownership rule:

- landed here, not in tranche 1
- React and Next fallout stayed in one review lane so failures remained
  attributable to runtime compatibility instead of root-tooling drift

Review stop:

- before engine package recovery starts

### [x] Tranche 3: `slate` Native Transaction Core And Public API Reset

- settle `slate` around the best end-state API, not the most conservative
  retrofit
- move the core toward:
  - native transactions as the primary write model
  - snapshot/store-first reads
  - cleaner store/runtime boundaries
  - compatibility mirrors only where they still earn their keep
- allow hard cuts where old public seams block the better API
- keep the package split explicit while the core changes
- hold the existing correctness and perf floors as hard guardrails

Landed inside tranche 3:

- package-local closeout is green on:
  - `bun test ./packages/slate/test`
  - `bunx turbo build --filter=./packages/slate`
  - `bunx turbo typecheck --filter=./packages/slate`
  - `bun run lint:fix`
  - `bun run lint`
- current direct owners that are present and green:
  - `query-contract.ts`
  - `operations-contract.ts`
  - `legacy-editor-nodes-fixtures.ts`
  - `legacy-interfaces-fixtures.ts`
  - `legacy-transforms-fixtures.ts`
  - accessor/transaction seam in `accessor-transaction.test.ts`

Important correction:

- standalone `snapshot-contract.ts` is a broad oracle owner, not part of the
  package-closeout proof by default
- `bun test ./packages/slate/test` being green does **not** mean standalone
  `snapshot-contract.ts` is green
- do not cite `snapshot-contract.ts` as green in tranche-3 closeout until it is
  rerun directly and repaired

Tranche-3 closeout read:

- canonical public surface hierarchy is now settled for the live claim:
  - `getSnapshot`
  - `subscribe`
  - `replace`
  - `reset`
  - `withTransaction`
  - `Editor.apply(editor, op)`
- mutable editor state hierarchy is now classified:
  - `editor.children` survives as a compatibility mirror, not a primary read seam
  - `editor.selection` survives as a compatibility mirror, not a primary read seam
  - `editor.marks` survives as a compatibility mirror, not a primary read seam
  - RC judgment:
    keep the mirrors through RC
  - later hard-cut judgment stays open after sibling packages migrate
- write hierarchy:
  - instance `editor.apply(op)` is now classified as compatibility-only
  - RC judgment:
    keep it through RC as compatibility-only
  - later hard-cut judgment stays open
- compatibility-baggage decisions:
  - instance `editor.onChange()` is now classified as compatibility-only
  - RC judgment:
    keep it through RC as compatibility-only
  - later hard-cut judgment stays open
- explicit normalization claim width is settled:
  - heavier adjacent-text/spacer cleanup stays explicit-only
  - owner: `packages/slate/test/fixture-claim-overrides.ts`
- standalone `snapshot-contract.ts` is green again and included in the same-turn
  proof stack
- remaining hard-cut debate is post-RC, not a tranche-3 blocker

Tranche-3 progress also landed:

- `packages/slate/test/range-ref-contract.ts`
- `scripts/benchmarks/slate/6038-transaction-execution.mjs`
- `bun run bench:slate:6038:local`

Current tranche-3 doctrine:

- package-local suite and standalone `snapshot-contract.ts` are green again
- support-package work is unblocked by core API direction, but still pending by
  tranche order
- the active mutable execution owner is:
  - [2026-04-19-slate-absolute-api-replan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-19-slate-absolute-api-replan.md)
- explicit-cut family now exists for legacy ordinary-op adjacent-text/spacer
  canonicalization rows:
  - owner: `/Users/zbeyens/git/slate-v2/packages/slate/test/fixture-claim-overrides.ts`
- the perfect redesign is now the live direction, not a deferred later lane
- the `slate` core API direction is now settled enough to become the live claim
- remaining mutable-field / callback / instance-apply cut judgments are
  explicitly deferred post-RC

### [x] Tranche 4: `slate-history`, `slate-hyperscript` Lossless Closure

- build support-package merged corpora now that the `slate` core redesign is
  honestly settled
- targeted recovery or explicit skip only for kept seams
- preserve both legacy and draft-supported rows that still belong in the claim

Current tranche-4 read:

- `slate-history` is now settled enough to stop being the blocker:
  - direct kept-row proof lives in `history-contract.ts`
  - batching / save / merge / stack-write / commit-order proof lives in
    `integrity-contract.ts`
  - the live compare owner exists again:
    `bench:history:compare:local`
  - current perf is slower than legacy but bounded, not blocker-shaped
- `slate-hyperscript` is now also settled enough to stop being the blocker:
  - fixture parsing and cursor/selection construction stay owned by
    `index.spec.ts`
  - draft smoke rows now have a direct Bun-owned owner:
    `smoke-contract.ts`
  - package-local test/build/typecheck/lint are green
- the next package in order is now:
  - `slate-dom`

### [x] Tranche 5: `slate-dom` Owned Runtime Closure

- DOM transport/runtime ownership
- targeted DOM recovery after kept core/support seams are settled
- runtime/browser proof tied to kept corpus rows, not just same-path files
- decorated DOM offset, selection, and clipboard truth must stay explicit

Current tranche-5 read:

- direct DOM proof owners are live and green:
  - `bridge.ts`
  - `clipboard-boundary.ts`
- the DOM package no longer survives only as implicit glue through
  `slate-react`
- end-state gates that touch the package are green

### [x] Tranche 6: `slate-react` Owned Runtime Closure

- React runtime recovery after core + DOM ownership are already settled
- browser/input proof tied back to kept corpus rows
- same-path example/source recovery where user-facing parity still matters
- React runtime locality remains mandatory:
  - selector-first subscriptions
  - overlay locality
  - no broad rerender by default

Current tranche-6 read:

- focused React proof owners are live and green:
  - provider/hooks
  - ReactEditor
  - primitives
  - editable behavior
  - projections / annotations / widgets
  - app-owned customization
  - large-document runtime
  - with-react
- required v2-only example/browser rows are real in Chromium:
  - `highlighted-text`
  - `external-decoration-sources`
  - `persistent-annotation-anchors`
  - `review-comments`
- kept north-star perf owners are now command-backed:
  - `bench:react:rerender-breadth:local`
  - `bench:react:huge-document-overlays:local`
- package/runtime closure is no longer the main blocker

### [ ] Tranche 7: Examples, Benchmarks, Added Value

- contributor-facing example parity from the same merged-corpus doctrine
- benchmark/root-proof ownership cleanup
- non-conflicting draft value adoption
- required v2-only north-star proof rows are already landed:
  - `highlighted-text`
  - `persistent-annotation-anchors`
  - `external-decoration-sources`
  - `review-comments`

Current tranche-7 read:

- the kept v2-only example/browser rows are real
- the kept tranche-5 / tranche-6 perf owners are real
- what remains is broader contributor-facing parity and claim-width cleanup,
  not missing DOM/React runtime owners
- highest-signal same-path parity rows still open:
  - `code-highlighting`
  - `custom-placeholder`
  - `huge-document`
  - `markdown-preview`
  - `markdown-shortcuts`
  - `scroll-into-view`
  - `shadow-dom`
  - `styling`
  - `tables`
- highest-signal mixed rows still open:
  - `editable-voids`
  - `images`
  - `paste-html`
  - `richtext`
- stronger slate-react perf-superiority is command-owned and closed for the
  huge-doc runtime lane:
  - `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
  - the 5000-block proof gate is green on important lanes
  - 1000-block runs are smoke/debug only and do not close the lane
  - first shelled-block activation versus chunking-on is the accepted
    occlusion/corridor tradeoff

### [ ] Tranche 8: RC Ledger Closure

- final readiness statement
- final `post RC` register

## Package Order

1. `slate`
2. `slate-history`
3. `slate-hyperscript`
4. `slate-dom`
5. `slate-react`

Early additive lane:

- `slate-browser` (landed)

## Review Rule

Stop after each tranche.

Inside approved package tranches, stop after each package.

If the merged corpus changes the active claim, sync the control docs before the
next package starts.
