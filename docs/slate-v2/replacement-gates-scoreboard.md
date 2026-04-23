---
date: 2026-04-18
topic: slate-v2-gates-scoreboard
status: active
---

# Slate v2 Replacement Gates Scoreboard

## Tranche Gates

| Gate | Status | Note |
| --- | --- | --- |
| tranche 1 root/tooling port | `complete` | root graph is green under Bun/Turbo/Biome with Bun-owned test discovery |
| tranche 1 docs split | `complete` | archive lane exists; live docs own the fresh program |
| tranche 1 package-manifest owners | `complete` | package build/type owners landed without source recovery drift |
| tranche 2 React 19.2 + Next runtime/site upgrade | `complete` | React 19.2.5 + Next 16.2.4 + TypeScript 6.0.3 are green with behavior-preserving fallout only |
| slate native transaction/store-first redesign | `complete` | `packages/slate` package-local, standalone snapshot, build, typecheck, lint, and core perf-floor gates are green; the live claim is now settled around explicit transaction/store seams with compatibility-only mirrors kept through RC |
| support package lossless closure | `complete` | `slate-history` and `slate-hyperscript` package/runtime owners are green and no longer the blocker |
| DOM owned runtime closure | `complete` | tranche 5 package/runtime owners are green and verified by the full end-state gates |
| React owned runtime closure | `complete` | tranche 6 focused owners, examples, perf owners, and end-state gates are green |
| examples/benchmarks/value-add + root proof closure | `pending` | same-path open rows still include `code-highlighting`, `custom-placeholder`, `huge-document`, `markdown-preview`, `markdown-shortcuts`, `scroll-into-view`, `shadow-dom`, `styling`, and `tables`; mixed rows still include `editable-voids`, `images`, `paste-html`, and `richtext`; final root-proof claim width is also still open |
| RC ledger closure | `pending` | tranche 8 |

## V2 North-Star Gates

| Gate | Status | Current owner | Current proof / command owner | Current read |
| --- | --- | --- | --- | --- |
| overlay architecture closure | `complete` | [decoration-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/decoration-roadmap.md) | focused runtime owners, v2-only examples, and end-state gates | the kept overlay architecture is real in package/runtime/example form across decorations, annotations, widgets, shared projection plumbing, and corridor-first large-doc behavior |
| source-scoped overlay invalidation | `complete` | [decoration-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/decoration-roadmap.md) | `bun run bench:react:rerender-breadth:local` | the command-backed owner proves selective source recompute by dirtiness class; remaining same-store subscriber fan-out is a stronger follow-up question, not a missing-owner blocker |
| React runtime locality | `complete` | [references/architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md) | `bun run bench:react:rerender-breadth:local` | the live locality owner measures selection breadth, many-leaf sibling stability, deep-ancestor locality, decoration-source toggle breadth, hidden-pane `Activity`, annotation-backed widget churn, and source-dirtiness isolation |
| huge-document overlay posture | `complete` | [references/chunking-review.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md) and [decoration-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/decoration-roadmap.md) | `bun run bench:react:huge-document-overlays:local` | the command-backed owner proves corridor-first huge-doc behavior on the real `Editable largeDocument` surface without reviving child-count chunking as the main story |
| slate-react perf superiority vs legacy chunking | `complete / accepted first-activation tradeoff` | [docs/plans/2026-04-21-slate-v2-data-model-first-react-perfect-runtime-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-21-slate-v2-data-model-first-react-perfect-runtime-plan.md) | `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local` | direct 5000-block comparison is the proof gate and is green on important lanes; 1000-block runs are smoke/debug only; the only accepted 5000 mean loss is first shelled-block activation versus chunking-on, which is the explicit occlusion/corridor tradeoff |
| required v2-only example set | `complete` | [ledgers/example-parity-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/example-parity-matrix.md) | `bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium`, `bunx playwright test ./playwright/integration/examples/external-decoration-sources.test.ts --project=chromium`, `bunx playwright test ./playwright/integration/examples/persistent-annotation-anchors.test.ts --project=chromium`, `bunx playwright test ./playwright/integration/examples/review-comments.test.ts --project=chromium` | all four v2-only example/browser rows are live and green in Chromium |

## Command Reality

Current live runnable gate commands:

- `bun run test`
- `bun run test:integration-local`
- `bun run bench:slate:6038:local`
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

Missing command-backed north-star owners:

- none for the direct huge-document comparison; remaining release work is
  broader claim-width and contributor-facing example parity, not this perf lane

## Rules

- a gate is not green because nearby proof is green
- a gate is not green because draft value exists
- a gate is green only when the owning tranche exits honestly
- parity success does not close a north-star gate automatically
