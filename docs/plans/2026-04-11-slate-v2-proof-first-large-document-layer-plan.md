---
date: 2026-04-11
topic: slate-v2-proof-first-large-document-layer-plan
status: active
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
---

# Slate v2 Proof-First Large-Document Layer Plan

## Goal

Build a real large-document runtime layer for `slate-react` that improves
`10000`-block behavior without regressing the current baseline on normal docs
or broad document operations.

This is the corrected follow-up to the rejected first semantic-islands attempt.

## Harsh Read

The rejected prototype proved one thing clearly:

- grouped wrappers plus CSS hints are not enough

Why it failed:

- far islands still rendered the full descendant tree
- broad operations (`Ctrl+A`, paste) fell back into expensive whole-tree work
- the layer paid complexity cost without actually removing runtime work

The next attempt has to be more honest:

- far islands must stop rendering editable descendants
- broad document operations must stay model-driven and cheap
- activation must promote only the needed island, not the whole tree

## Non-Negotiable Rules

1. Chunking stays non-foundational.
2. Local subscriptions remain the base layer.
3. The active corridor still uses live DOM truth.
4. `Pretext` remains planning-only, not active-editing truth.
5. DOM stays present enough for browser behavior; do not jump straight to
   virtualization.
6. Do not ship another wrapper-only prototype.

## The Actual Design

### Island Kinds

Keep the first version intentionally narrow:

- top-level paragraph/block group
- table subtree
- void/embed block
- list subtree

Do not infer sections from headings yet.

## Shell Model

The key correction is this:

- **active / near islands** render the real editable descendant tree
- **far islands** render a cheap shell, not editable descendants

The shell must still expose useful DOM:

- visible text content for scroll and coarse reading
- stable shell root attributes for activation
- intrinsic height hints

The shell must **not** mount:

- `EditableDescendantNode`
- `EditableText`
- per-leaf subscriptions
- expensive overlay projection work

That is the real win. Everything else is theater.

## Broad-Op Contract

The previous version died here. So this gets its own contract.

### `Ctrl+A`

When the large-document layer is active:

- intercept `Ctrl+A` / `Cmd+A`
- set the editor model selection directly to the full-document range
- do **not** expand all far islands into full editable trees
- reflect “whole-doc selected” visually through shell/near/active state, not by
  forcing every island to mount

### Paste

When the current model selection is full-doc or intersects shell-backed ranges:

- handle paste through the model selection directly
- do **not** require DOM reconstruction of every far island first
- do **not** `flushSync` into the full tree

### Selection Expansion

When a user clicks, drags, or keyboards into a far island:

- synchronously promote that island and its immediate corridor to active/near
- then let DOM selection resolution proceed against the real active DOM

This is the only synchronous promotion path that should exist.

## Phase Plan

### Phase 0: Freeze Clean Baselines

Before the next code attempt, rerun and store:

- `pnpm bench:replacement:huge-document:local`
- `REPLACEMENT_HUGE_BLOCKS=5000 REPLACEMENT_BENCH_ITERATIONS=3 pnpm bench:replacement:huge-document:chunking:compare:local`
- `REPLACEMENT_HUGE_BLOCKS=10000 REPLACEMENT_BENCH_ITERATIONS=3 pnpm bench:replacement:huge-document:chunking:compare:local`
- `pnpm bench:react:rerender-breadth:local`

Do not build on stale artifacts.

### Phase 1: Planner And Shell-Only Proof

Deliver:

- internal island planner
- shell renderer for far islands
- no integration with broad ops yet

Files:

- `packages/slate-react/src/large-document/create-island-plan.ts`
- `packages/slate-react/src/large-document/classify-island-kind.ts`
- `packages/slate-react/src/large-document/island-shell.tsx`
- `packages/slate-react/src/components/editable-text-blocks.tsx`

Acceptance:

- small docs bypass the layer entirely
- far islands do not render editable descendants
- active/near islands still render the current tree unchanged

### Phase 2: Activation Path

Deliver:

- shell click/focus/pointerdown promotion
- corridor expansion around the promoted island
- DOM point resolution retries against the promoted DOM

Files:

- `packages/slate-react/src/components/editable.tsx`
- `packages/slate-react/src/plugin/react-editor.ts`
- `packages/slate-react/src/large-document/use-active-corridor.ts`
- `packages/slate-react/src/large-document/promote-island.ts`

Acceptance:

- clicking a far shell promotes only the needed island region
- active editing stays on live DOM truth
- `#4141` breadth does not regress

### Phase 3: Broad-Op Model Fast Paths

Deliver:

- model-driven full-doc select-all
- model-driven paste over full-doc or shell-intersecting selections
- zero whole-tree fallback

Files:

- `packages/slate-react/src/components/editable.tsx`
- maybe a new helper:
  `packages/slate-react/src/large-document/large-document-commands.ts`

Acceptance:

- `10000` select-all and paste do not regress versus current baseline
- ideally they improve

### Phase 4: Overlay Policy

Deliver:

- far islands skip heavy overlays
- near islands keep light overlays
- active islands keep full overlays

This includes:

- decorations
- highlights
- diagnostics
- annotation projections

Acceptance:

- overlay surfaces do not reactivate broad subtree work
- browser/runtime proof remains green

### Phase 5: Optional Planning Geometry

Only if Phase 1-4 still leave a big gap.

Allowed:

- height estimation for far shells
- scroll-anchor stabilization
- inactive-island planning

Not allowed:

- active selection geometry
- IME correctness
- cursor placement truth

## Exact Test Plan

### Unit / Runtime Tests

Add focused tests for:

1. small docs do not activate the layer
2. far island renders shell only
3. far island shell contains readable text content
4. far island shell does not mount editable descendants
5. click/pointerdown on far shell promotes that island only
6. selection crossing into a far shell promotes the corridor correctly
7. `Ctrl+A` sets full-doc model selection without expanding all islands
8. paste over full-doc selection stays model-driven
9. broad ops do not remount the whole document tree
10. `#3656` and `#4141` stay green

### Browser / Perf Lanes

Keep:

- `pnpm bench:replacement:huge-document:local`
- `pnpm bench:replacement:huge-document:chunking:compare:local`
- `pnpm bench:react:rerender-breadth:local`

Add:

- `pnpm bench:replacement:huge-document:islands:local`

That lane should measure:

- shell promotion latency
- active typing inside promoted island
- select-all
- paste
- ready

## Keep / Kill Bars

The next attempt is worth keeping only if all of these are true:

1. `1000` gate stays green
2. `5000` typing stays at or better than the current baseline
3. `5000` select-all and paste do not regress
4. `10000` select-all and paste do not regress
5. `10000` typing improves materially or the ready bill drops materially
6. `#3656` and `#4141` breadth stay green

If broad ops regress again:

- reject the attempt immediately
- do not widen the rollout

## Rollout Strategy

1. internal only
2. huge-document example only
3. query-param gate if needed for A/B runs
4. no default rollout across all `EditableBlocks` until the bars above are met

## File Map

Core likely touchpoints:

- [editable-text-blocks.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx)
- [editable.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx)
- [react-editor.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/src/plugin/react-editor.ts)
- [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)
- [huge-document.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/huge-document.tsx)

New internal module area:

- `packages/slate-react/src/large-document/`

## Recommendation

Do not retry the old grouped-wrapper idea.

The next robust attempt should start with a hard mechanical constraint:

- far islands render cheap shells only
- broad ops remain model-driven
- promotion is local, not whole-tree

That is the shortest path toward a large-document layer that might actually beat
the current baseline instead of just looking architectural.
