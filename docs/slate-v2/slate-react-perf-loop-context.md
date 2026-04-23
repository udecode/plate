---
date: 2026-04-21
topic: slate-react-huge-doc-perf-loop-context
---

# Slate React Huge-Doc Perf Loop Context

Use this as the reusable source of truth for the `slate-react` huge-document
perf loop. The loop prompt should link here instead of repeating this whole
context.

## Workspace

- Control/docs repo: `/Users/zbeyens/git/plate-2`
- Code repo: `/Users/zbeyens/git/slate-v2`
- Legacy comparison repo: `/Users/zbeyens/git/slate`
- Draft evidence:
  - `/Users/zbeyens/git/slate-v2-draft`
  - `docs/slate-v2-draft/**`

## Scope

Planning/docs writes are allowed in:

- `docs/slate-v2/**`
- `docs/slate-v2-draft/**`
- `docs/plans/**`

Code reads are allowed across:

- `/Users/zbeyens/git/slate-v2/packages/slate/**`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/**`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/**`
- `/Users/zbeyens/git/slate-v2/packages/slate-browser/**`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/**`
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/**`
- `/Users/zbeyens/git/slate-v2/scripts/benchmarks/**`
- `/Users/zbeyens/git/slate-v2/package.json`
- `/Users/zbeyens/git/slate/**`

Code edits are allowed when measurement proves ownership:

- benchmark/package command work:
  - `/Users/zbeyens/git/slate-v2/scripts/benchmarks/**`
  - `/Users/zbeyens/git/slate-v2/package.json`
- React runtime work:
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/**`
- core work:
  - `/Users/zbeyens/git/slate-v2/packages/slate/**` only when measured evidence
    proves core ownership

Do not work on:

- `/Users/zbeyens/git/slate-v2/packages/slate-history`
- `/Users/zbeyens/git/slate-v2/packages/slate-hyperscript`

## Source Docs

Read these before deciding or claiming closure:

- `docs/plans/2026-04-21-slate-v2-react-huge-doc-perf-plan.md`
- `docs/slate-v2/master-roadmap.md`
- `docs/slate-v2/release-readiness-decision.md`
- `docs/slate-v2/true-slate-rc-proof-ledger.md`
- `docs/slate-v2/replacement-gates-scoreboard.md`
- `docs/slate-v2/decoration-roadmap.md`
- `docs/slate-v2/references/architecture-contract.md`
- `docs/slate-v2/references/chunking-review.md`
- `docs/slate-v2/ledgers/example-parity-matrix.md`
- `docs/slate-v2-draft/decoration-roadmap.md`
- `docs/slate-v2-draft/true-slate-rc-proof-ledger.md`
- relevant `docs/solutions/performance-issues/**`
- relevant `docs/solutions/logic-errors/**`

## Current Truth

- Tranche 5 / 6 runtime closure is green and not the blocker.
- `bench:react:rerender-breadth:local` exists and proves useful locality facts.
- `bench:react:huge-document-overlays:local` exists and proves corridor/overlay
  locality facts.
- `bench:react:huge-document:legacy-compare:local` exists and closes the
  stronger perf-superiority claim for important lanes, with first shelled-block
  activation accepted as the explicit occlusion tradeoff.
- `1000` blocks is smoke/debug only. It is not a closure or superiority proof
  gate for this lane.
- Latest 5000-block proof gate:
  - v2 wins ready hard
  - v2 wins steady typing/select-type lanes
  - v2 wins select-all
  - v2 wins full-document text replacement and full-document fragment insertion
  - v2 loses only first activation of a shelled block
    (`middleBlockPromoteThenTypeMs`) by a small amount against chunking-on
  - first activation of a shelled block is accepted as the explicit occlusion /
    corridor-first tradeoff unless product later requires this one-time
    activation to beat chunking-on too
  - paste is split into text replacement and fragment insertion; neither row is
    native clipboard/browser paste transport
- Therefore the perf lane must target actual v2 superiority over legacy
  chunking-on and chunking-off, not command ownership.

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

- v2 `slate-react` should be faster than legacy chunking/no-chunk on important
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

Run from `/Users/zbeyens/git/slate-v2`:

```sh
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
bun run bench:react:rerender-breadth:local
bun run bench:react:huge-document-overlays:local
```

If `packages/slate/**` changes, also run:

```sh
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun run bench:slate:6038:local
bun run bench:core:normalization:compare:local
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

If `packages/slate-react/**` changes, also run:

```sh
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/provider-hooks-contract.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bun run bench:react:rerender-breadth:local
bun run bench:react:huge-document-overlays:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

## Current Measured Next Owner

- Do not restart with generic selector dirtiness; that experiment did not move
  the 5000 lane and regressed locality.
- Next useful work is hard-cut hot reads:
  - urgent text/node rendering must not rediscover data through full immutable
    `Editor.getSnapshot()`
  - collapse descendant/text selector fanout
  - avoid child subscriptions when parent already resolved text/marks/runtime id
  - introduce direct live path/runtime-id reads or an incremental index if
    measurement proves core ownership
- Current implementation should start in:
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/**` for node/text read
    model changes
  - `/Users/zbeyens/git/slate-v2/packages/slate/**` only if a focused probe
    proves the blocker is core read/index ownership
- Current closure:
  - perf lane is closed with first shelled-block activation accepted as the
    explicit occlusion tradeoff
  - browser editing proof is green in Chromium for DOM-owned typing,
    custom-render/projection fallbacks, IME composition, shell activation,
    shell-backed fragment paste, and undo after direct DOM sync
  - generated `slate-dom/dist/index.d.ts` aliasing is fixed; `slate-dom` and
    `slate-react` build/typecheck are green

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

Treat `docs/plans/2026-04-21-slate-v2-react-huge-doc-perf-plan.md` as the
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

- v2 wins the important huge-doc lanes against legacy chunking-on/off, or
- remaining losing lanes are explicitly accepted/deferred with rationale, and
- required correctness/perf checks have run or hard blockers are named exactly.

`SYNC_TIMER: 30m` is allowed only when:

- the perf lane is actually complete
- a hard blocker prevents all autonomous progress, with exact missing evidence
  or user decision named
- the user explicitly asks to pause/cool down

Do not output `SYNC_TIMER` when the checkpoint names a next move.
