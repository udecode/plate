---
date: 2026-04-18
topic: plite-proof-ledger
status: active
---

# Plite Proof Ledger

## Current Read

The current private-alpha program has package-runtime proof for `plite-dom`,
`plite-react`, and the public read/update runtime spine.

Same-turn private-alpha gate closure is green for the current tree after the
latest `plite-browser/playwright` helper and Playwright wrapper-script edits.
The open boundary is claim width: release, publish, PR readiness, and raw-device
mobile proof remain unclaimed unless a run explicitly owns them.

Not:

- blind source rewrite
- rewrite-avoidance theater
- support-package churn before the core API is settled

The live `packages/plite` core benchmark package now exists.

Latest read:

- the broad write-path regression story is no longer the main blocker
- explicit normalization is no longer the blocker
- observation and huge-document proof are claim-scoped instead of broadly red:
  the latest broad direct legacy diagnostic is current-green, while narrower
  caveats remain tracked explicitly

Tranche 1 proof is only:

- root command graph ownership on Bun/Turbo/Biome
- Bun-owned test discovery + Bun lockfile ownership
- docs ownership reset
- package-manifest build/type owners

Tranche 2 proof is only:

- React 19.2.5 compatibility baseline
- Next 16.2.4 site/runtime compatibility baseline
- TypeScript 6.0.3 compiler baseline
- package-src HMR proof without package rebuilds
- green Bun/Vitest/Playwright split

## Runtime Proof Lanes

These are the current reads:

- `slate` core settlement is materially closed enough for sibling-package work
- `plite-dom` package-runtime proof is materially closed enough:
  - `bridge.ts`
  - `clipboard-boundary.ts`
- `plite-react` package-runtime proof is materially closed enough:
  - focused runtime owners
  - required v2-only example/browser rows in Chromium
  - command-backed north-star perf owners
- generated cursor/caret gauntlets are replayable and release-blocking for
  cursor/caret claims
- mobile/IME transport proof is scoped by explicit claim metadata and
  descriptor classification
- final benchmark/root-proof claim width is classified; same-turn
  private-alpha closure is green for the current tree after the latest
  `plite-browser/playwright` helper and Playwright wrapper-script edits

## V2 North-Star Proof Lanes

These are the current reads:

- overlay architecture closure is materially real in package/runtime/example
  form
- source-scoped overlay invalidation has a command-backed owner
- React rerender locality under overlay churn has a command-backed owner
- huge-document overlay cost and corridor-first posture have a command-backed
  owner
- direct v2-vs-legacy huge-document perf is claim-scoped:
  - `HUGE_DOC_FULL_STRICT_BUDGET=1 bun run bench:react:huge-document:full:local`
    is the private-alpha product gate
  - `bench:react:huge-document:legacy-compare:local` is the universal diagnostic
    that directly compares legacy chunking-on, legacy chunking-off, and v2
  - strict 5000-block product proof is green with zero failures and zero budget
    failures
  - the latest broad diagnostic worst p95 ratio is `0.77`
  - `v2DefaultRenderAuto middleBlockSelectThenTypeMs` is `69.78ms` vs legacy
    `90.42ms`
  - explicit `v2DomPresent` is `44.56ms` on that same lane
  - default `auto` remains bounded partial-DOM, not a hidden alias for staged or
    a reason to replace behavior proof with a forced strategy switch
  - repeated Shift+Down is behavior-green with no long tasks but remains slower
    than ProseMirror/Lexical by about `7ms` p95
  - select-all-delete undo on 10k staged surfaces is a residual p95 /
    bulk-restore caveat with long-task p95 `0ms`; benchmark artifacts include
    kernel/profiler summaries for that lane
- read/update public lifecycle proof is live:
  - public hard-cut contracts guard examples and public teaching paths
  - primitive method runtime contracts cover implicit target behavior
  - extension method contracts cover method-first plugin power without direct
    monkeypatching
- generated browser gauntlet proof is live:
  - rows assert model, DOM, DOM selection/caret where observable, focus owner,
    commit metadata, trace legality, replayability, shrink payloads, and
    follow-up typing
- native mobile proof is scoped:
  - Playwright mobile viewport and semantic handles are not raw Android/iOS
    keyboard or clipboard proof
  - Appium Android/iOS descriptors are direct-device proof candidates
  - agent-browser iOS is proxy evidence
- data-model-first / React-perfect huge-doc runtime safety is closed in
  Chromium:
  - direct DOM sync has explicit capability checks
  - custom render/projection/IME paths fall back safely
  - shell focus does not mutate selection
  - keyboard shell activation intentionally publishes selection
  - shell-backed fragment paste preserves Plite fragment semantics
  - undo after direct DOM sync works through the history hotkey path
- `huge-document` same-path parity is an explicit cut:
  - the same-path example remains the legacy chunking playground
  - v2 huge-doc runtime behavior is owned by `large-document-runtime` browser
    rows and the 5000-block legacy compare gate
- required current v2-only example/proof owners are real in Chromium:
  - `search-highlighting`
  - `code-highlighting`
  - `decorations-async`
  - `persistent-annotation-anchors`
  - `comment-mode`
- same-path `custom-placeholder`, `paste-html`, `richtext`, `editable-voids`,
  and `images` are recovered rows with current Chromium proof.

## Rule

Do not upgrade this ledger from private-alpha runtime proof to RC, release,
publish, PR, or raw-device readiness without an explicit run that owns that
claim width.

Green harness rows, narrow browser proof, source closeness, or same-path
examples do not close blanket claim-width or parity by themselves.

Legacy parity does not close the north-star lane by itself either.

## Current Support-Package Read

- `plite-history` is now materially closed enough on top of settled core
  `slate`:
  - direct kept-row proof lives in
    `packages/plite-history/test/history-contract.ts`
  - batching / save / merge / stack-write / commit-order proof lives in
    `packages/plite-history/test/integrity-contract.ts`
  - the live compare owner exists again:
    `bun run bench:history:compare:local`
  - latest compare read is faster than legacy across the measured p95 lanes:
    - typing undo: `0.41ms` vs legacy `0.46ms`
    - typing redo: `0.11ms` vs legacy `1.73ms`
    - fragment undo: `0.55ms` vs legacy `3.86ms`
    - fragment redo: `0.73ms` vs legacy `5.94ms`
    - worst p95 ratio: `0.89`
- `plite-hyperscript` is now materially closed enough on top of settled core
  `slate` and settled support-package `plite-history`:
  - package-local test/build/typecheck/lint are green
  - fixture parsing and cursor/selection construction stay owned by
    `packages/plite-hyperscript/test/index.spec.ts`
  - draft smoke rows now have a direct Bun-owned proof owner in
    `packages/plite-hyperscript/test/smoke-contract.ts`
  - the small public creation surface stays preserved:
    - `createHyperscript`
    - `createEditor`
    - `createText`
    - `jsx`
- support-package closure is no longer the main blocker; the remaining work is
  broader claim-width and private-alpha proof-ledger truth
