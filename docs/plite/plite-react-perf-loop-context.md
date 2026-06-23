---
date: 2026-04-21
topic: slate-react-huge-doc-perf-loop-context
---

# Plite React Huge-Doc Perf Loop Context

Use this as the reusable source of truth for the `plite-react` huge-document
perf loop. The loop prompt should link here instead of repeating this whole
context.

## Workspace

- Control/docs repo: `/Users/zbeyens/git/plate-2`
- Code repo: `/Users/zbeyens/git/plate-2`
- Active private-alpha checkout for current `plate-2` loops:
  `/Users/zbeyens/git/plate-2`
- Legacy comparison repo: `/Users/zbeyens/git/slate`
- Draft evidence:
  - `/Users/zbeyens/git/plite-draft`
  - `docs/plite-draft/**`

## Scope

Planning/docs writes are allowed in:

- `docs/plite/**`
- `docs/plite-draft/**`
- `docs/plans/**`

Code reads are allowed across:

- `/Users/zbeyens/git/plate-2/packages/plite/**`
- `/Users/zbeyens/git/plate-2/packages/plite-dom/**`
- `/Users/zbeyens/git/plate-2/packages/plite-react/**`
- `/Users/zbeyens/git/plate-2/packages/browser/**`
- `/Users/zbeyens/git/plate-2/apps/www/src/app/(app)/examples/plite/_examples/**`
- `/Users/zbeyens/git/plate-2/apps/plite/tests/plite-browser/donor/examples/**`
- `/Users/zbeyens/git/plate-2/benchmarks/plite/donor/**`
- `/Users/zbeyens/git/plate-2/package.json`
- `/Users/zbeyens/git/slate/**`

Code edits are allowed when measurement proves ownership:

- benchmark/package command work:
  - `/Users/zbeyens/git/plate-2/benchmarks/plite/donor/**`
  - `/Users/zbeyens/git/plate-2/package.json`
- React runtime work:
  - `/Users/zbeyens/git/plate-2/packages/plite-react/**`
- core work:
  - `/Users/zbeyens/git/plate-2/packages/plite/**` only when measured evidence
    proves core ownership

Do not work on:

- `/Users/zbeyens/git/plate-2/packages/plite-history`
- `/Users/zbeyens/git/plate-2/packages/plite-hyperscript`

## Source Docs

Read these before deciding or claiming closure:

- `docs/plans/2026-04-21-plite-react-huge-doc-perf-plan.md`
- `docs/plite/master-roadmap.md`
- `docs/plite/release-readiness-decision.md`
- `docs/plite/true-slate-rc-proof-ledger.md`
- `docs/plite/replacement-gates-scoreboard.md`
- `docs/plite/decoration-roadmap.md`
- `docs/plite/references/architecture-contract.md`
- `docs/plite/references/chunking-review.md`
- `docs/plite/ledgers/example-parity-matrix.md`
- `docs/plite-draft/decoration-roadmap.md`
- `docs/plite-draft/true-slate-rc-proof-ledger.md`
- relevant `docs/solutions/performance-issues/**`
- relevant `docs/solutions/logic-errors/**`

## Current Truth

- Tranche 5 / 6 runtime closure is green and not the blocker.
- `bench:react:rerender-breadth:local` exists and proves useful locality facts.
- `bench:react:huge-document-overlays:local` exists and proves corridor/overlay
  locality facts.
- `bench:react:huge-document:legacy-compare:local` exists and stays the direct
  legacy diagnostic. The current private-alpha product gate is stricter:
  `HUGE_DOC_FULL_STRICT_BUDGET=1 bun run bench:react:huge-document:full:local`.
- Latest strict product proof is green with zero failures and zero budget
  failures. The latest broad direct legacy diagnostic is also current-green:
  worst p95 ratio `0.77`, default `auto` `middleBlockSelectThenTypeMs`
  `69.78ms` vs legacy `90.42ms`; explicit `v2DomPresent` is `44.56ms` on the
  same lane.
- Latest cross-editor huge-doc smoke shows the current Plite auto lane winning
  middle typing and DOM budget against ProseMirror and Lexical:
  `24.4ms` vs `57.3ms` / `77.8ms`, DOM p95 `753` vs `5001` / `10001`.
  Repeated vertical Shift+Down remains a narrower caveat at `22.8ms` vs
  ProseMirror `15.9ms` and Lexical `15.9ms`.
- Latest 10k staged keyboard proof is behavior-green with full-DOM parity:
  repeated Shift+Down p95 is `21.4ms` / `21.7ms` with no long tasks. The
  remaining hot lane is undo after select-all delete: fresh one-surface
  undo-delete paint p95 is `58.3ms`; two-surface p95 is `67.5ms` /
  `64.3ms`, with long-task p95 `0ms` after the history normalize and
  view-selection restore repairs.
- `1000` blocks is smoke/debug only. It is not a closure or superiority proof
  gate for this lane.
- Therefore the current perf lane is not a generic red lane. It is
  green/private-alpha with narrower caveats: tiny select-all deltas, repeated
  vertical Shift+Down, and select-all-delete undo residual p95 / bulk-restore
  cost. Do not restart broad architecture from old 5000/10000 shell-island
  notes unless a fresh benchmark reproduces that loss.

## Constraint Hierarchy

- Best v2 performance and best v2 API shape beat legacy-compatible
  implementation shape.
- Legacy compatibility is a public-boundary target, not permission to dirty the
  rewrite with old runtime constraints.
- If a legacy-shaped API blocks the measured v2 performance goal, hard-cut or
  reshape that API.
- Do not preserve `Editor.getSnapshot()` as an urgent hot read path if it blocks
  chunking-on superiority.

## North Star

- v2 `plite-react` should be faster than legacy chunking/no-chunk on important
  huge-doc user lanes.
- React 19.2, selector-first runtime, semantic islands, active corridor,
  occlusion, and overlay stores should produce a genuinely better runtime.
- Do not make child-count chunking foundational again.
- Do not collapse overlays back into one `decorate` story.
- Preserve one overlay kernel with decorations, annotations, widgets, and shared
  projection plumbing.
- Optimize for real user-lane latency and locality, not benchmark cosmetics.

## Testing Truth

- Legacy tests are evidence, not commandments.
- Draft tests and docs are evidence, not commandments.
- Benchmark existence is not perf closure.
- Locality proof is not latency proof.
- v2 perf-superiority requires direct comparison against relevant legacy
  baselines.
- Compare equivalent workloads.
- If the benchmark is unfair, fix the benchmark before optimizing code.
- If v2 loses, classify whether the loss is:
  - core-owned
  - React runtime-owned
  - DOM/browser-owned
  - benchmark-owned
  - accepted/deferred with explicit rationale

## Current Driver Gates

Run from the active private-alpha checkout, normally
`/Users/zbeyens/git/plate-2`. Use
`/Users/zbeyens/git/plate-2` only when that checkout is intentionally the
active code repo for the loop.

```sh
HUGE_DOC_FULL_STRICT_BUDGET=1 bun run bench:react:huge-document:full:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
bun run bench:react:rerender-breadth:local
bun run bench:react:huge-document-overlays:local
```

If `packages/plite/**` changes, also run:

```sh
bun test ./packages/plite/test/snapshot-contract.ts --bail 1
bun run bench:plite:6038:local
bun run bench:core:normalization:compare:local
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

If `packages/plite-react/**` changes, also run:

```sh
bun test ./packages/plite-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/plite-react/test/provider-hooks-contract.tsx --bail 1
bun test ./packages/plite-react/test/projections-and-selection-contract.tsx --bail 1
bun run bench:react:rerender-breadth:local
bun run bench:react:huge-document-overlays:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

## Current Measured Next Owner

- Do not restart with generic selector dirtiness; that experiment did not move
  the 5000 lane and regressed locality.
- Next useful work is narrow and evidence-triggered:
  - keep behavior/native-selection proof green before perf work;
  - investigate default `auto` middle select-then-type again only if a fresh
    run regresses it below legacy;
  - investigate repeated vertical Shift+Down against ProseMirror/Lexical only
    if the browser behavior oracle stays native-equivalent;
  - investigate select-all-delete undo only from the saved kernel/profiler
    evidence; do not optimize a 10k-block history restore blindly;
  - reopen hard-cut hot reads only if a fresh focused probe proves urgent
    text/node rendering is still rediscovering data through full immutable
    `Editor.getSnapshot()`, descendant/text selector fanout, child
    subscriptions, or missing live path/runtime-id reads.
- Current implementation should start in:
  - `/Users/zbeyens/git/plate-2/packages/plite-react/**` for node/text read
    model changes
  - `/Users/zbeyens/git/plate-2/packages/plite-react/**` when
    the active loop is running from the `plate-2` private-alpha checkout
  - `/Users/zbeyens/git/plate-2/packages/plite/**` only if a focused probe
    proves the blocker is core read/index ownership
- Current closure:
  - `auto` remains bounded partial-DOM, not a hidden alias for `staged`
  - private-alpha product proof is green
  - direct legacy superiority is current-green in the latest diagnostic but
    remains claim-scoped, not release-scoped
  - cross-editor huge-doc smoke currently favors Plite auto for middle typing
    and DOM budget, with repeated vertical Shift+Down still tracked as a
    narrower caveat
  - select-all-delete undo has a saved profiler owner and is not closed as a
    long-task lane
  - bounded partial-DOM promotion uses coarse 32-block groups and a smaller
    active mounted window; the accepted 2026-06-06 packet keeps an 8-block
    window because it cut mounted text hosts from 32 to 8 and selector
    subscriptions from 44 to 21 without breaking browser proof
  - the 4-block window probe is cut: promotion p95 stayed about flat and
    promote+type regressed because the target block could stay unmounted
  - browser editing proof uses generated gauntlets for model state, visible DOM,
    DOM selection/caret where observable, focus owner, commit metadata, trace
    legality, replayability, and follow-up typing
  - generated `plite-dom/dist/index.d.ts` aliasing is fixed; `plite-dom` and
    `plite-react` build/typecheck are green

## Perf Decision Rules

- If benchmark validity is suspect, fix the benchmark first.
- If v2 loses twice on the same fair lane, pivot to the measured owner.
- If a tactic does not move the direct compare, cut it.
- If v2 loses only on a lane we might accept, explicitly mark it
  accepted/deferred before closure.
- Never call the perf lane closed from rerender/locality evidence alone.
- Never call the perf lane closed from command existence alone.
- Never stop while any important lane is red and has a named next owner.

## Memory And Self-Documentation

Treat `docs/plans/2026-04-21-plite-react-huge-doc-perf-plan.md` as the
mutable memory ledger for this lane.

After every slice, append a checkpoint with:

- exact commands run
- artifact paths
- measured numbers
- hypothesis tested
- decision:
  - keep
  - pivot
  - cut
  - defer
- owner classification
- files changed
- reverted or rejected tactics and why
- next concrete action

Record failed probes too. A failed optimization that was cut is valuable
evidence, not noise.

If stable lane truth changes, update this file in the same turn.

Do not rely on chat history for memory. If it matters, write it to the plan.

## Completion Rules

The perf lane is complete only when:

- v2 DOM-present auto wins or matches the important huge-doc lanes against
  legacy chunking-on/off, or
- remaining losing lanes are explicitly accepted/deferred with rationale, and
- required correctness/perf checks have run or hard blockers are named exactly.

`SYNC_TIMER: 30m` is allowed only when:

- the perf lane is actually complete
- a hard blocker prevents all autonomous progress, with exact missing evidence
  or user decision named
- the user explicitly asks to pause/cool down

Do not output `SYNC_TIMER` when the checkpoint names a next move.
