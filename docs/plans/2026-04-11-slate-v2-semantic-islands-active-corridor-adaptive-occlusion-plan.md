---
date: 2026-04-11
topic: slate-v2-semantic-islands-active-corridor-adaptive-occlusion-plan
status: active
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
---

# Slate v2 Semantic Islands / Active Corridor / Adaptive Occlusion Plan

## Goal

Read the full `docs/slate-v2` corpus and synthesize one concrete plan for:

- semantic islands
- active editing corridor
- adaptive occlusion

The plan must follow current roadmap truth instead of drifting back toward:

- foundational chunking
- virtualization-first design
- active-surface geometry fakes
- generic rerender cleanup that the runtime has already mostly solved

## Corpus Read

I read all `36` files currently under `docs/slate-v2`.

The highest-signal sources for this plan were:

- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
- [chunking-review.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md)
- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
- [perf-gate-package.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/perf-gate-package.md)
- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [archive/cohesive-program-plan.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/cohesive-program-plan.md)
- [archive/final-synthesis.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/final-synthesis.md)

## Harsh Current Read

The docs and current perf evidence point to one clear conclusion:

1. local invalidation is mostly fixed already
2. chunking is **not** the desired foundational story
3. the remaining large-document gap is now mainly a view-layer / layout-policy
   problem
4. the next honest step is the large-document runtime layer:
   semantic islands, active corridor, adaptive occlusion

The same-turn rerender-breadth lane backs that read:

- `#5131`: only `useSlate()` is broad, by contract
- `#3656`: sibling-leaf rerender breadth is green
- `#4141`: ancestor-chain rerender breadth is green

So another generic rerender cleanup pass would be cargo cult.

## Current Execution Note

The first production attempt at this layer was **rejected and reverted**.

What was tried:

- grouped top-level wrappers in `EditableBlocks`
- corridor-driven visibility state
- `content-visibility` / intrinsic-size occlusion on inactive groups

Why it was rejected:

- it did not actually remove descendant render work
- broad operations still degraded badly at `10000` blocks
- the architect verdict was to reject/revert the runtime batch and keep only
  the measurement infrastructure

Hard rule for the next implementation attempt:

- far islands must render a cheap shell only, not descendant nodes
- `Ctrl+A` / paste must not fall back into a synchronous full-tree mode

## Non-Negotiable Constraints From The Corpus

### 1. Chunking is not foundational

From [chunking-review.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md):

- child-count chunking is a historical optimization, not the v2 runtime story
- if v2 still needs chunking for ordinary nested edits, the runtime redesign
  failed
- chunking-like view optimization may still survive as a **secondary** tactic
  for huge block-only documents

Implication:

- do not introduce `getChunkSize()`-style public control as the main design
- do not organize the implementation around numeric bucketing

### 2. Local subscriptions stay the base layer

From [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md):

- `slate-react` remains selector-first
- broad editor-wide rerenders are failure, not baseline
- large-document handling should be “active-slice invalidation + default
  occlusion,” not “broad rerender + rescue chunking”

Implication:

- islands are a second layer over local subscriptions, not a replacement for
  them

### 3. Active corridor uses live DOM truth

From both
[architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
and
[chunking-review.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md):

- the active editing corridor must trust live DOM geometry
- `Pretext` or any deterministic planner is only for inactive islands
- do not route active editing through planning geometry

Implication:

- no fake measurement in the selected/composing zone
- no offscreen estimation allowed to decide active selection correctness

### 4. `<Activity>` is allowed, but not as an active-surface crutch

From
[architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md):

- `<Activity>` is first-class for hidden/background UI
- it is not a fix for active editable-surface correctness

Implication:

- use `<Activity>` only for inactive editors, side panes, inspectors, or
  background-prepared surfaces
- do not hide the active corridor behind `Activity`

### 5. Default occlusion must keep DOM present

From [chunking-review.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md):

- outside the active corridor, prefer:
  - `content-visibility: auto`
  - `contain-intrinsic-size`
  - cheaper render mode
  - deferred overlays
- this is explicitly positioned as safer than virtualization because the DOM
  stays present

Implication:

- start with occlusion, not full virtualization
- keep browser-native behaviors intact by leaving DOM mounted

### 6. Overlay systems must stay separate

From [chunking-review.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md):

- decorations, highlights, diagnostics, and annotations should not force broad
  text-tree rerenders
- they belong in projection layers

Implication:

- the large-document layer must not bake overlays into island ownership
- overlays need corridor-aware throttling, not ownership of the text tree

## Recommended Plan

### Phase 0: Freeze The Measurement Surface

Goal:

- make the large-document layer answer to fixed evidence instead of vibes

Keep and use:

- `pnpm bench:replacement:huge-document:local`
- `pnpm bench:replacement:huge-document:chunking:compare:local`
- `pnpm bench:react:rerender-breadth:local`

Add one more kept lane before heavy implementation:

- `pnpm bench:replacement:huge-document:islands:local`

That new lane should compare:

- current default huge-doc runtime
- islands/corridor/occlusion runtime
- legacy chunking on
- legacy chunking off

At minimum on:

- `1000`
- `5000`
- `10000`

Primary metrics:

- ready
- type
- select-all
- paste
- per-island activation / corridor-shift timing

Secondary metrics:

- number of fully-active islands
- number of occluded islands
- scroll-anchor stability failures

### Phase 1: Introduce A Minimal Semantic Island Model

Goal:

- add stable view-layer grouping without turning chunking back into the story

Design:

- island identity is anchored to committed snapshot/runtime ids
- island boundaries follow document semantics, not child counts
- initial island kinds should be intentionally small:
  - top-level block
  - table subtree
  - void/embed block
  - list subtree

Do **not** start with:

- section inference from headings
- adaptive island splitting by size
- pagination-aware planning
- user-configurable island boundaries

Why:

- the docs repeatedly prefer the smallest durable layer first
- top-level block / table / void / list boundaries cover most huge-doc cost
  without new magic

Likely files:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- new folder:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/`
- possible helpers:
  - `create-island-plan.ts`
  - `classify-island-kind.ts`
  - `island-types.ts`

Implementation rules:

- island plans derive from committed snapshots only
- island ids remain stable as long as root runtime ids remain stable
- island planning stays internal first; do not ship a broad public API yet

### Phase 2: Add Active Editing Corridor

Goal:

- keep only the actually relevant islands fully live

Corridor inputs:

- current selection
- active composition
- drag/drop target
- focused editable root

Corridor contents:

- selected island(s)
- direct ancestor island path
- nearby sibling islands
- any island intersecting expanded selection

Recommended starting posture:

- collapsed selection:
  - active island
  - `2` sibling islands before
  - `2` sibling islands after
- expanded selection:
  - every intersecting island
  - direct ancestor path
  - `1` sibling island on each side
- composition/drag:
  - widen one step more than the collapsed-selection posture

Do not expose these numbers publicly yet.
They are runtime tuning knobs, not user-facing API.

Likely files:

- `packages/slate-react/src/large-document/create-corridor-plan.ts`
- `packages/slate-react/src/large-document/use-active-corridor.ts`
- integration into `editable-text-blocks.tsx`

Critical rule:

- active-corridor correctness must be driven by live DOM truth, not estimates

### Phase 3: Add Adaptive Occlusion Outside The Corridor

Goal:

- make inactive islands cheap without removing them from the DOM

Default outside-corridor posture:

- wrap inactive islands with:
  - `content-visibility: auto`
  - `contain-intrinsic-size`
- suspend or cheapen non-critical overlay work
- keep inactive islands mounted and structurally correct

Recommended three-state model:

- `active`
  - full DOM truth
  - all overlays
  - all event wiring
- `near`
  - mounted
  - light overlays only
  - still easy to promote to active
- `far`
  - mounted
  - occluded
  - no expensive overlay projection work

This is better than a binary active/inactive split because it avoids flapping
when the user moves locally through a large doc.

Likely files:

- `packages/slate-react/src/large-document/island-shell.tsx`
- `packages/slate-react/src/large-document/get-island-visibility-state.ts`
- `packages/slate-react/src/large-document/island-style.ts`

### Phase 4: Optional Planning Geometry Layer

Goal:

- stabilize offscreen large-doc layout without polluting active editing

Allowed uses:

- estimated inactive-island height
- scroll-anchor preservation
- future pagination/planning research

Not allowed:

- cursor placement
- active selection correctness
- IME/composition correctness
- live editing boundary decisions

If this layer lands, keep it explicitly optional and isolated behind internal
helpers. The docs are too clear on this point to ignore.

### Phase 5: Activity For Hidden/Background Surfaces Only

Goal:

- use React `19` where it actually helps

Use `<Activity>` for:

- inactive editors in tabs/panes
- inspectors
- side-by-side surfaces that prepare in background

Do not use it for:

- the active huge-document corridor
- active island visibility control
- selection correctness

This should be a separate follow-up batch unless the implementation naturally
needs a small internal hook boundary for it.

## Verification Plan

### Required proof before calling Phase 1-3 done

1. `pnpm bench:react:rerender-breadth:local`
   - many-leaf and deep-ancestor lanes must stay green
2. `pnpm bench:replacement:huge-document:local`
   - `1000`-block gate must stay green
3. `pnpm bench:replacement:huge-document:chunking:compare:local`
   - `5000` and `10000` typing must improve materially
4. package proof:
   - `pnpm turbo build --filter=./packages/slate-react`
   - `pnpm turbo typecheck --filter=./packages/slate-react`
   - `pnpm --filter slate-react test`
   - `pnpm lint:fix`

### Success bars

Minimum bar for keeping the large-document layer:

- `5000` typing improves materially over current default
- `10000` typing improves materially over current default
- `1000` gate does not regress into red
- `#3656` and `#4141` breadth do not regress
- no new focus/selection/IME failures appear in `slate-react` runtime tests

Recommended “actually worth it” bar:

- `5000` ready no longer loses to chunking
- `5000` typing gap to chunking shrinks substantially
- `10000` typing gap shrinks enough that the next remaining bill is clearly
  view/paint, not invalidation chaos

## Risks

### 1. Wrong island boundaries

Risk:

- list/table boundaries that look semantic on paper may still be wrong for real
  editing locality

Mitigation:

- start with the smallest obvious set
- make island classification internal and swappable

### 2. Scroll jumps

Risk:

- `contain-intrinsic-size` guesses can destabilize scroll anchor

Mitigation:

- start with conservative intrinsic sizes
- measure scroll-anchor drift explicitly
- keep optional planning geometry separate

### 3. Overlay leaks

Risk:

- search highlights / diagnostics / annotation projections may still light up
  occluded islands

Mitigation:

- add corridor-aware overlay throttling as part of Phase 3, not later

### 4. Overbuilding

Risk:

- section inference, custom APIs, pagination hooks, and user-configurable island
  policies can balloon the scope immediately

Mitigation:

- hard-cap Phase 1 to four island kinds
- no public API until the internal lane proves its worth

## Recommended Execution Order

1. add internal island plan + shell
2. add corridor derivation
3. add occlusion states and CSS behavior
4. add huge-doc islands benchmark lane
5. tune corridor width and inactive posture
6. only then evaluate whether a planning-geometry layer is still needed

## Expected Decision After Phase 3

If the new huge-doc lane still loses badly after semantic islands + corridor +
occlusion, then:

- the next work is planning geometry / Pretext-style estimation for inactive
  islands

If the lane improves enough, then:

- stop there
- keep `<Activity>` as a separate hidden/background surface improvement

## Final Recommendation

Do **not** build a giant “large document framework.”

Build the smallest internal `slate-react` layer that does this:

- semantic top-level grouping
- corridor-based active set
- default occlusion outside the corridor
- DOM truth inside the corridor
- optional planning geometry later

That is the most complete plan the corpus supports without drifting back into
legacy chunking or forward into premature virtualization.
