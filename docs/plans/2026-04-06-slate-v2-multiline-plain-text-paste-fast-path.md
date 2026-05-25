---
date: 2026-04-06
topic: slate-v2-multiline-plain-text-paste-fast-path
status: completed
---

# Slate v2 Multiline Plain-Text Paste Fast Path

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Replace the current multiline plain-text clipboard fallback path so it no longer
routes through generic `insert_fragment` machinery.

The intent is not to invent a new clipboard abstraction.

The intent is to give `slate-v2` a real multiline plain-text insertion seam
that matches the engine direction in
[Part I. Engine North Star](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-i-engine-north-star).

## Decision

The best long-term choice is:

- add an internal-first dedicated multiline plain-text insertion intent inside
  `slate-v2`
- call it only from the plain-text branch in
  [clipboard.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom-v2/src/clipboard.ts)
- keep browser parsing in `slate-dom-v2`
- keep insertion semantics in `slate-v2`
- keep existing single-point `insert_text` semantics narrow

Do **not** keep disguising multiline plain text as a block fragment.

## Why This Wins

1. It fits the intent-layer model in
   [Part I. Engine North Star](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-i-engine-north-star).
2. It keeps package ownership clean:
   - `slate-dom-v2` reads clipboard data
   - `slate-v2` owns multiline plain-text insertion semantics
3. It lines up with the strong references:
   - legacy Slate dedicated plain-text insertion branch in
     [with-dom.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/with-dom.ts)
   - ProseMirror `asText` clipboard branch in
     [clipboard.ts](/Users/zbeyens/git/prosemirror/view/src/clipboard.ts)
   - Lexical plain-text insertion branch in
     [clipboard.ts](/Users/zbeyens/git/lexical/packages/lexical-clipboard/src/clipboard.ts)
4. It avoids overloading `insert_text` with multiline/range-replacement meaning
   before that broader API is actually earned.

## Decision Drivers

1. Preserve trusted semantics unless evidence says otherwise.
2. Move performance work onto a better engine seam, not a browser trick.
3. Avoid widening the public API unless the new seam proves generally useful.

## Viable Options

### Option A: Keep Using `insert_fragment`

- Pros:
  - no new engine concept
  - existing semantics already work
- Cons:
  - the current benchmark loser path stays on the generic fragment machinery
  - plain text keeps masquerading as structured fragment intent
  - cheap optimizations on this path already failed to help

### Option B: Reuse `insert_text` For Multiline Plain Text

- Pros:
  - smaller public surface than a new intent
  - the name is already established
- Cons:
  - current `insert_text` is point-scoped and narrow
  - multiline/range-replacement semantics would make the name and operation
    meaning fuzzy
  - would quietly widen a public API under clipboard pressure

### Option C: Internal-First Dedicated Multiline Plain-Text Insert Intent

- Pros:
  - best fit for the engine’s intent-layer model
  - keeps browser read path and engine insert path separated cleanly
  - preserves room to keep it internal until a second caller earns
    publicization
- Cons:
  - adds a new engine concept
  - could still miss the real hotspot if the benchmark cost is mostly snapshot
    publication

## Architect Steelman

The strongest argument against this plan:

- maybe the benchmark loser is not fragment intent itself
- maybe it is snapshot publication or index rebuild after any large insert

That means the dedicated intent could be the right model and still fail to move
the benchmark enough.

The plan must therefore require explicit benchmark proof, not just API purity.

## Chosen Shape

Land the new seam as **internal-first**.

That means:

- add the new intent/op inside `slate-v2`
- wire it from the plain-text fallback branch in `slate-dom-v2`
- do **not** advertise it broadly from public transforms until a second caller
  proves it is more than clipboard plumbing

## Scope

1. Add the new multiline plain-text insert intent/op to `slate-v2`.
2. Implement the core fast path for simple text-block insertion/replacement.
3. Route `slate-dom-v2` plain-text clipboard fallback through the new path.
4. Preserve current multiline plain-text fallback semantics already locked by
   tests.
5. Re-run the huge-document benchmark and verify the paste lane moves without
   regressing ready/type/select-all.

## Non-Goals

- no new public browser helper API
- no broad `slate-browser` changes
- no generic fragment-path rewrite
- no semantics rewrite unless tests and evidence explicitly support it
- no public export of the new intent unless a second caller earns it

## Acceptance Criteria

1. Plain-text clipboard fallback in
   [clipboard.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom-v2/src/clipboard.ts)
   no longer routes multiline text through generic `insert_fragment`.
2. Existing multiline plain-text semantics in
   [clipboard-boundary.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom-v2/test/clipboard-boundary.ts)
   stay green.
3. Relevant `slate-v2` clipboard contract tests stay green.
4. The huge-document benchmark in
   [phase6-hardening.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/phase6-hardening.md)
   improves materially on `pasteMs` at the frozen `1000`-block, `5`-iteration
   lane without making `readyMs`, `typeMs`, or `selectAllMs` regress beyond
   noise.
   Concrete bar:
   - `pasteMs` mean improves by at least `15%` versus the current v2 baseline,
     or by at least `10ms`
   - `readyMs`, `typeMs`, and `selectAllMs` do not regress by more than `10%`
     each
5. The new seam remains internal-first unless a second caller is discovered.
6. Verification includes one direct proof that the multiline plain-text branch
   no longer falls back to generic `insert_fragment`.

## Verification Matrix

### Unit / Contract

- [clipboard-boundary.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom-v2/test/clipboard-boundary.ts)
- [clipboard-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate-v2/test/clipboard-contract.ts)

### Performance

- `yarn bench:phase6:huge-document:local`

### Broader Regression

- any existing browser lane directly affected by clipboard/plain-text insert
  semantics

### Observability

- record current vs new huge-document benchmark JSON
- compare paste mean directly
- reject fake wins where paste improves only by regressing ready/type/select-all
- capture one direct routing proof:
  either a focused test or instrumentation that distinguishes the dedicated
  plain-text path from generic `insert_fragment`

## Proof Required vs Direct Work

Proof required for:

- semantic parity of multiline plain-text fallback
- benchmark improvement on huge-document paste
- any claim that the new seam should become public API

Direct work allowed for:

- new op/interface plumbing
- internal engine/core refactor to support the new fast path
- DOM bridge wiring in the plain-text branch

## Legacy / Candidate Repo Use

Use legacy Slate, ProseMirror, and Lexical only as shape references:

- legacy Slate:
  proves a dedicated plain-text branch is sane
- ProseMirror:
  proves a distinct `asText` clipboard path is sane
- Lexical:
  proves plain-text insertion can stay separate from rich fragment insertion

Do **not** copy:

- exact APIs
- exact operation names
- exact internal data structures

## Pre-Mortem

1. The new intent lands cleanly but doesn’t move the benchmark because snapshot
   publication is still the dominant cost.
2. The new path “wins” only by accidentally changing multiline semantics.
3. The new intent leaks into public API too early and becomes clipboard-shaped
   baggage.

## First Execution Tranche

1. Red tests first:
   - add or tighten plain-text fallback coverage in
     [clipboard-boundary.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom-v2/test/clipboard-boundary.ts)
   - extend `slate-v2` clipboard contract only if the new intent becomes
     visible at the contract layer
2. Add the new internal-first op/seam in:
   - [interfaces.ts](/Users/zbeyens/git/slate-v2/packages/slate-v2/src/interfaces.ts)
   - [transforms-text.ts](/Users/zbeyens/git/slate-v2/packages/slate-v2/src/transforms-text.ts)
   - [index.ts](/Users/zbeyens/git/slate-v2/packages/slate-v2/src/index.ts)
   - [core.ts](/Users/zbeyens/git/slate-v2/packages/slate-v2/src/core.ts)
3. Rewire the plain-text branch in:
   - [clipboard.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom-v2/src/clipboard.ts)
4. Benchmark loop:
   - run `yarn bench:phase6:huge-document:local`
   - compare paste mean and the three non-paste means
   - keep only the change if it wins honestly

## Exit Rule

If the dedicated intent still fails to move the paste benchmark materially, the
next seam is not “more intent modeling”.

It is snapshot publication / index rebuild after large multiline inserts.

That should be treated as a new decision, not silently folded into this one.

Do not keep iterating on the new intent just because it is architecturally
clean. If semantics stay green and routing is proven but the benchmark bar is
still missed, stop and reframe the seam.
