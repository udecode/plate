---
date: 2026-04-18
topic: plite-gates-scoreboard
status: active
---

# Plite Replacement Gates Scoreboard

## Tranche Gates

| Gate | Status | Note |
| --- | --- | --- |
| tranche 1 root/tooling port | `complete` | root graph is green under Bun/Turbo/Biome with Bun-owned test discovery |
| tranche 1 docs split | `complete` | archive lane exists; live docs own the fresh program |
| tranche 1 package-manifest owners | `complete` | package build/type owners landed without source recovery drift |
| tranche 2 React 19.2 + Next runtime/site upgrade | `complete` | React 19.2.5 + Next 16.2.4 + TypeScript 6.0.3 are green with behavior-preserving fallout only |
| slate read/update transaction runtime | `complete` | `packages/plite` package-local, public-surface, read/update, primitive method, transaction target, commit metadata, bookmark, build, typecheck, lint, and core perf-floor gates are green; the live claim is settled around `editor.read`, `editor.update`, primitive editor methods, `EditorCommit`, and hard-cut public stale-state pressure |
| support package lossless closure | `complete` | `plite-history` and `plite-hyperscript` package/runtime owners are green and no longer the blocker |
| DOM owned runtime closure | `complete` | tranche 5 package/runtime owners are green and verified by the full end-state gates |
| React owned runtime closure | `complete` | tranche 6 focused owners, examples, perf owners, and end-state gates are green |
| examples/benchmarks/value-add + root proof closure | `complete / private-alpha` | generated cursor/caret gauntlets, scoped mobile proof, huge-doc perf caveat, and same-turn integration/build/type/lint/perf closure are command-backed for the current tree after the latest `plite-browser/playwright` helper and Playwright wrapper-script edits |
| proof ledger closure | `scoped / private-alpha` | proof ledger is current for continuous private alpha; no release, publish, or PR readiness claim |

## V2 North-Star Gates

| Gate | Status | Current owner | Current proof / command owner | Current read |
| --- | --- | --- | --- | --- |
| overlay architecture closure | `complete` | [decoration-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/decoration-roadmap.md) | focused runtime owners, v2-only examples, and end-state gates | the kept overlay architecture is real in package/runtime/example form across decorations, annotations, widgets, shared projection plumbing, and corridor-first large-doc behavior |
| source-scoped overlay invalidation | `complete` | [decoration-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/decoration-roadmap.md) | `bun run bench:react:rerender-breadth:local` | the command-backed owner proves selective source recompute by dirtiness class; remaining same-store subscriber fan-out is a stronger follow-up question, not a missing-owner blocker |
| React runtime locality | `complete` | [references/architecture-contract.md](/Users/zbeyens/git/plate-2/docs/plite/references/architecture-contract.md) | `bun run bench:react:rerender-breadth:local` | the live locality owner measures selection breadth, many-leaf sibling stability, deep-ancestor locality, decoration-source toggle breadth, hidden-pane `Activity`, annotation-backed widget churn, and source-dirtiness isolation |
| huge-document overlay posture | `complete` | [references/chunking-review.md](/Users/zbeyens/git/plate-2/docs/plite/references/chunking-review.md) and [decoration-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/decoration-roadmap.md) | `bun run bench:react:huge-document-overlays:local` | the command-backed owner proves corridor-first huge-doc behavior on the real `Editable largeDocument` surface without reviving child-count chunking as the main story |
| slate-react perf superiority vs legacy chunking | `green / claim-scoped` | [docs/plans/2026-05-01-plite-universal-large-document-performance-ralplan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-05-01-plite-universal-large-document-performance-ralplan.md) and [absolute-architecture-release-claim.md](/Users/zbeyens/git/plate-2/docs/plite/absolute-architecture-release-claim.md) | private-alpha product gate: `HUGE_DOC_FULL_STRICT_BUDGET=1 bun run bench:react:huge-document:full:local`; universal diagnostic: `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local` | strict product wrapper is green with zero failures and zero budget failures; latest broad diagnostic worst p95 ratio is `0.77`, with `v2DefaultRenderAuto middleBlockSelectThenTypeMs` at `69.78ms` vs legacy `90.42ms`; explicit `v2DomPresent` is `44.56ms` on the same lane |
| generated browser gauntlet claim | `complete` | [absolute-architecture-release-claim.md](/Users/zbeyens/git/plate-2/docs/plite/absolute-architecture-release-claim.md) | richtext generated release rows plus `bun test:integration-local` | cursor/caret claims require model, DOM, DOM-selection/caret, focus, commit metadata, legal kernel trace, replayability/shrink payloads, and follow-up typing; semantic mobile and raw native mobile proof remain separate claim classes |
| required v2-only example set | `complete / current-owner proof` | [ledgers/example-parity-matrix.md](/Users/zbeyens/git/plate-2/docs/plite/ledgers/example-parity-matrix.md) | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/code-highlighting.test.ts playwright/integration/examples/decorations-async.test.ts playwright/integration/examples/persistent-annotation-anchors.test.ts playwright/integration/examples/comment-mode.test.ts --project=chromium` | current overlay/value-add owners are live and green in Chromium: `search-highlighting`, `code-highlighting`, `decorations-async`, `persistent-annotation-anchors`, and `comment-mode`; older draft-only `highlighted-text`, `external-decoration-sources`, and `review-comments` files were deleted and are not current proof owners |

## Command Reality

Current live runnable gate commands:

- `bun run test`
- `bun run test:integration-local`
- `bun run bench:plite:6038:local`
- `bun run bench:core:transaction:local`
- `bun run bench:core:normalization:local`
- `bun run bench:core:query-ref-observation:local`
- `bun run bench:core:node-transforms:local`
- `bun run bench:core:text-selection:local`
- `bun run bench:core:editor-store:local`
- `bun run bench:core:refs-projection:local`
- `bun run bench:core:normalization:compare:local`
- `bun run bench:core:observation:compare:local`
- `bun run bench:core:huge-document:compare:local`
- `bun run bench:react:rerender-breadth:local`
- `bun run bench:react:huge-document-overlays:local`
- `HUGE_DOC_FULL_STRICT_BUDGET=1 bun run bench:react:huge-document:full:local`
- `bun run bench:react:huge-document:legacy-compare:local`

Current `slate` core compare read:

- normalization compare is no longer the blocker
- observation compare is bounded-but-still-slower
- huge-document core typing compare is bounded-but-still-slower

Coverage read:

- core perf benchmark coverage is complete for current-only family ownership
- core current-vs-legacy regression coverage is complete for the kept blocker
  lanes:
  - normalization
  - observation
  - huge-document typing
- this is complete-but-selective coverage, not exhaustive current-vs-legacy
  compare coverage for every exported helper family

Open command-backed north-star owners:

- none for generated cursor/caret gauntlets or scoped mobile claim
  classification
- direct huge-document comparison is current-green in the latest 5000-block
  diagnostic: worst p95 ratio `0.77`; keep tiny select-all deltas, repeated
  vertical Shift+Down, and select-all-delete undo residual p95 / bulk-restore
  cost as narrower caveats, not broad architecture blockers
- release/publish/PR readiness is outside the continuous private-alpha proof
  claim

## Rules

- a gate is not green because nearby proof is green
- a gate is not green because draft value exists
- a gate is green only when the owning tranche exits honestly
- parity success does not close a north-star gate automatically
