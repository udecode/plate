---
date: 2026-04-18
topic: slate-v2-proof-ledger
status: active
---

# Slate v2 Proof Ledger

## Current Read

The fresh-branch program now has package-runtime proof for `slate-dom`,
`slate-react`, and the public read/update runtime spine.

The next mainline blocker is final same-turn gate closure, not missing DOM,
React, public API, kernel, gauntlet, mobile-scope, or huge-doc perf owners.

Not:

- blind source rewrite
- rewrite-avoidance theater
- support-package churn before the core API is settled

The live `packages/slate` core benchmark package now exists.

Latest read:

- the broad write-path regression story is no longer the main blocker
- explicit normalization is no longer the blocker
- observation and huge-document core typing are still slower than legacy, but
  now in a bounded class instead of a catastrophic one

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
- `slate-dom` package-runtime proof is materially closed enough:
  - `bridge.ts`
  - `clipboard-boundary.ts`
- `slate-react` package-runtime proof is materially closed enough:
  - focused runtime owners
  - required v2-only example/browser rows in Chromium
  - command-backed north-star perf owners
- generated cursor/caret gauntlets are replayable and release-blocking for
  cursor/caret claims
- mobile/IME transport proof is scoped by explicit claim metadata and
  descriptor classification
- final benchmark/root-proof claim width is classified; final same-turn gate
  closure is still open

## V2 North-Star Proof Lanes

These are the current reads:

- overlay architecture closure is materially real in package/runtime/example
  form
- source-scoped overlay invalidation has a command-backed owner
- React rerender locality under overlay churn has a command-backed owner
- huge-document overlay cost and corridor-first posture have a command-backed
  owner
- direct v2-vs-legacy huge-document perf superiority is closed for important
  lanes:
  - `bench:react:huge-document:legacy-compare:local` directly compares legacy
    chunking-on, legacy chunking-off, and v2
  - the 5000-block direct comparison is the proof gate and is green on
    important lanes
  - 1000-block runs are smoke/debug only and do not close the lane
  - direct model-only typing into an unpromoted middle shell is an accepted
    caveat, not the user editing corridor
  - promoted middle-block typing is the user editing corridor and beats
    chunking-on
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
  - shell-backed fragment paste preserves Slate fragment semantics
  - undo after direct DOM sync works through the history hotkey path
- `huge-document` same-path parity is an explicit cut:
  - the same-path example remains the legacy chunking playground
  - v2 huge-doc runtime behavior is owned by `large-document-runtime` browser
    rows and the 5000-block legacy compare gate
- required v2-only example/proof rows are real in Chromium:
  - `highlighted-text`
  - `persistent-annotation-anchors`
  - `external-decoration-sources`
  - `review-comments`
- same-path `custom-placeholder`, `paste-html`, `richtext`, `editable-voids`,
  and `images` are recovered rows with current Chromium proof.

## Rule

Do not upgrade this ledger from runtime proof to RC readiness until the final
integration, build, typecheck, lint, and perf gates run in the active closeout
slice.

Green harness rows, narrow browser proof, source closeness, or same-path
examples do not close blanket claim-width or parity by themselves.

Legacy parity does not close the north-star lane by itself either.

## Current Support-Package Read

- `slate-history` is now materially closed enough on top of settled core
  `slate`:
  - direct kept-row proof lives in
    `packages/slate-history/test/history-contract.ts`
  - batching / save / merge / stack-write / commit-order proof lives in
    `packages/slate-history/test/integrity-contract.ts`
  - the live compare owner exists again:
    `bun run bench:history:compare:local`
  - current compare read is still slower than legacy, but in a bounded class:
    - typing undo: `+29.35ms`
    - typing redo: `+20.04ms`
    - fragment undo: `+25.29ms`
    - fragment redo: `+31.77ms`
- `slate-hyperscript` is now materially closed enough on top of settled core
  `slate` and settled support-package `slate-history`:
  - package-local test/build/typecheck/lint are green
  - fixture parsing and cursor/selection construction stay owned by
    `packages/slate-hyperscript/test/index.spec.ts`
  - draft smoke rows now have a direct Bun-owned proof owner in
    `packages/slate-hyperscript/test/smoke-contract.ts`
  - the small public creation surface stays preserved:
    - `createHyperscript`
    - `createEditor`
    - `createText`
    - `jsx`
- support-package closure is no longer the main blocker; the remaining work is
  broader claim-width and RC-ledger truth
