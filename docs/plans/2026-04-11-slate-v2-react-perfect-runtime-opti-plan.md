---
date: 2026-04-11
topic: slate-v2-react-perfect-runtime-opti-plan
status: active
source_repos:
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/plate-2
---

# Slate v2 React-Perfect Runtime Optimization Plan

## Goal

Make the `slate-v2` rewrite earn the “React-perfect runtime” claim honestly.

That means:

- the React runtime is selector-first, predictable, and local by default
- huge documents do not need legacy chunking as the main rescue story
- the core does not sabotage the runtime with absurd transaction and read costs
- perf claims are backed by stable lanes, not heroic one-off reruns

## Harsh Current Read

The current situation is blunt:

1. richtext blocker is fixed enough for the current curated RC gate
2. explicit normalization is no longer the big cliff
3. **core huge-document typing is still bad**
4. **core read-after-write observation is still bad**
5. legacy chunking still beats current v2 badly on huge-document typing at
   `5000` and `10000` blocks

So the next work is not:

- more normalization tinkering
- more richtext polish
- more drift census work
- or pretending chunking is irrelevant just because the docs say it should be

The next work is:

- fix the core/runtime architecture enough that the React runtime can actually
  become the right story

## Non-Goals

Do not do these in this plan:

- import `slate-batch-engine`
- make child-count chunking foundational again
- widen the public contract just to hit a benchmark
- chase low-value microbench wins that do not move real user-facing lanes
- add another giant hook surface to paper over runtime leaks

## Current Evidence

### Runtime/blocker surface

From
[api-drift-perf-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/api-drift-perf-scoreboard.md):

- richtext blocker is green again
- placeholder is green
- markdown/table are green
- huge-document remains mixed because typing is still slower

### Core-only evidence

From
[2026-04-10-slate-v2-core-perf-batch.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-10-slate-v2-core-perf-batch.md):

- explicit normalization:
  - adjacent-text `134.20ms -> 3.08ms`
  - inline flatten `1779.73ms -> 10.36ms`
- core huge-document typing at `5000` blocks is still bad:
  - start-block `370.97ms -> 348.03ms`
  - middle-block `368.58ms -> 297.34ms`
- core observation at `5000` blocks is still bad:
  - `editor.children.length` `940.18ms -> 784.01ms`
  - `Editor.nodes(...)` `1275.18ms -> 796.95ms`
  - `Editor.positions(...)` `1013.11ms -> 693.64ms`

### Chunking comparison

Measured separately:

- at `5000` and `10000` blocks, legacy chunking still wins hard on typing
- current v2 wins hard on select-all and paste

That means:

- the runtime story is not coherent enough yet
- chunking is still outperforming us exactly where the current docs say it
  should become unnecessary

## Root-Cause Ranking

### Tier 1: Core transaction model

Most likely remaining wall:

- full draft bootstrap cost per outer op
- expensive snapshot publication cost
- too much per-op structural work for simple text edits

If this stays bad, React cannot save it.

### Tier 2: Core read/observation paths

Still ugly:

- `editor.children`
- `Editor.nodes(...)`
- `Editor.positions(...)`
- runtime-id / index access patterns

This matters because the React-perfect runtime depends on cheap committed reads
and narrow subscriptions. If core reads are gross, selectors become expensive
too.

### Tier 3: React invalidation and render breadth

This is the layer the rewrite is supposed to win on:

- selector-first subscriptions
- local rerender boundaries
- semantic islands
- active editing corridor
- adaptive occlusion

But this layer only matters after Tier 1 and Tier 2 stop poisoning it.

## Program Decision

The optimization program should run in this order:

1. stabilize and keep the current benchmark truth
2. attack core transaction cost
3. attack core observation/read cost
4. then attack React/render invalidation
5. only then build the huge-doc escalation layer

Anything else is backwards.

## Execution Plan

### Phase 0: Freeze Truth

Goal:

- stop the benchmark surface from drifting while we optimize

Required artifacts:

- [api-drift-perf-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/api-drift-perf-scoreboard.md)
- a kept huge-doc vs chunking benchmark lane:
  - `pnpm bench:replacement:huge-document:chunking:compare:local`
- kept core-only huge-doc typing lane
- kept core-only observation lane

Work:

- promote the current ad hoc huge-doc chunking comparison into a repo-owned
  script with stable outputs
- keep the core-only compare scripts in `slate-v2/scripts/`
- ensure every lane writes JSON to `tmp/`

Acceptance:

- no more temp harness dependence for roadmap truth

### Phase 1: Kill Per-Op Core Bootstrap Cost

Goal:

- make plain collapsed text inserts stop paying whole-world transaction setup

Why first:

- huge-doc typing is still catastrophic at core level
- this is the strongest sign that every edit is still bootstrapping too much

Likely files:

- [with-transaction.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/with-transaction.ts)
- [apply.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/apply.ts)
- [apply-operation.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/apply-operation.ts)
- [draft-helpers.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/draft-helpers.ts)
- [replace-snapshot.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/replace-snapshot.ts)

Required ideas to evaluate:

- a fast outer-op path for simple collapsed `insert_text` / `remove_text`
- partial draft reuse instead of full `createDraftTree(...)` on every outer op
- smaller publication work for unchanged subtrees

Guardrails:

- range refs stay correct
- selection stays correct
- snapshot immutability stays real
- no hidden mutation of committed snapshots

Acceptance:

- core huge-document typing lane shows a large step down
- no contract regressions

### Phase 2: Kill Core Observation Cost

Goal:

- make observation reads cheap enough that selector-first runtime is plausible

Likely files:

- [get-current-children.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-current-children.ts)
- [get-current-index.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-current-index.ts)
- [get-current-node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-current-node.ts)
- [editor.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/editor.ts)

Work:

- cache transaction reads only where the cache is mutation-version-safe
- remove accidental full-tree cloning on read paths where possible
- make `Editor.nodes(...)` and `Editor.positions(...)` honestly lazy only after
  measuring a design that preserves current behavior

Guardrails:

- do not leak draft metadata into public reads
- do not regress snapshot-contract rows
- do not accept clever fast paths that win one microbench and corrupt helper
  semantics

Acceptance:

- core observation lane steps down materially
- package tests stay green

### Phase 3: React Runtime Narrowing

Goal:

- make the runtime behave like the architecture contract says it should

Reference:

- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)

Work:

- keep `useSyncExternalStore` selector-first
- remove broad rerender defaults
- make leaf and element subscriptions local by default
- keep derived UI off broad editor subscriptions

Likely lanes:

- `#5131`-style selection subscription breadth
- `#3656`-style leaf rerender breadth
- `#4141`-style ancestor rerender breadth

Acceptance:

- React lanes improve without chunking becoming the main story

### Phase 4: Huge-Doc Escalation Layer

Goal:

- beat legacy chunking where it still wins, without making chunking the
  foundational v2 story

Reference:

- [chunking-review.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md)

Work:

- semantic islands, not numeric chunks
- active editing corridor
- adaptive occlusion outside the corridor
- optional `<Activity>` / hidden-tree posture where it helps
- optional planning layer later, but DOM truth stays authoritative in the
  active corridor

Acceptance:

- huge-doc typing at `5000` and `10000` is no longer badly behind legacy
  chunking

## Verification Stack

For every phase:

1. targeted contract tests
2. full `slate` package tests
3. build
4. typecheck
5. core-only compare lanes
6. if React/runtime changed, user-facing replacement lanes

Do not claim a win without:

- before numbers
- after numbers
- proof that behavior stayed intact

## Regression Policy

Hard no:

- draft metadata leaks into public reads
- weakened range-ref behavior
- weakened clipboard behavior
- weakened snapshot immutability
- broad live normalization reopening by accident

When an optimization regresses contract behavior:

- revert it immediately
- keep the idea in notes as rejected
- do not “fix later” unless the regression is already understood and bounded

## Harsh Feedback

The rewrite says it wants a React-perfect runtime.

Right now the harsh truth is:

- the React story is better than legacy on some user-facing flows
- the core still does too much work per edit
- huge-doc typing is not remotely good enough
- chunking still embarrasses us on typing at scale

So stop pretending the next move is another cute hook or another normalization
rule.

The next move is boring, deep engine work:

- transaction bootstrap
- snapshot publish
- transaction reads
- then runtime invalidation
- then semantic islands / active corridor

If the core keeps rebuilding too much state per keystroke, the React-perfect
runtime is just branding.

## Success Condition

This program is done when all of these are true:

1. core huge-doc typing no longer looks ridiculous versus legacy
2. core observation reads are no longer absurdly expensive
3. React rerender breadth lanes are locally scoped by default
4. huge-doc typing no longer needs legacy chunking as the main rescue story
5. the remaining perf debt is small enough to be honest follow-up work, not
   architectural failure
