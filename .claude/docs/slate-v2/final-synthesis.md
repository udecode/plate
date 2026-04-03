---
date: 2026-04-03
topic: slate-v2-final-synthesis
---

# Slate v2 Final Synthesis

## Purpose

This is the settled read after the comparison pass.

It answers one question:

- what is the best `slate-v2` direction after looking at the actual alternatives instead of fantasizing about them?

## Inputs

- [overview.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/overview.md)
- [engine.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/engine.md)
- [cohesive-program-plan.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/cohesive-program-plan.md)
- [react-runtime-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/react-runtime-spec.md)
- [dom-runtime-boundary-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/dom-runtime-boundary-spec.md)
- [slate-v2-plate-v2-architecture-research.md](/Users/zbeyens/git/plate-2/.claude/docs/analysis/slate-v2-plate-v2-architecture-research.md)
- [slate-v2-gap-matrix.md](/Users/zbeyens/git/plate-2/.claude/docs/analysis/slate-v2-gap-matrix.md)

## What The Comparison Work Confirmed

1. Keep the split package architecture.
   - `slate-v2`
   - `slate-dom-v2`
   - `slate-react-v2`
   - `slate-history-v2`

2. Keep `slate-v2` data-model-first and op-first externally.

3. Keep transactions as the internal execution model.

4. Keep `slate-react-v2` explicitly React `19.2+`, selector-first, and snapshot-driven.
   Large-document behavior is part of the default runtime target, not a later courtesy pass.

5. Keep `slate-dom-v2` as the browser boundary owner.

6. Keep history transaction-aware and separate from the core runtime.

7. Keep adapters explicit.
   Headless references were useful, but none of them justified collapsing ownership back into one bucket.

## What The Comparison Work Rejected

1. Do not collapse everything into a single headless package.
   `edix` was useful. It was not a blueprint for the whole stack.

2. Do not pivot the core toward ProseMirror or Lexical-style identity/model semantics.
   They validated package discipline and update semantics, not a full ontology swap.

3. Do not treat Tiptap packaging wins as engine wins.
   That belongs to future `plate-v2`, not `slate-v2`.

4. Do not move pagination, measurement, or page composition into `slate-v2`.
   `Pretext` and `Premirror` made that line much clearer, not fuzzier.

5. Do not pull semantic-service architecture into `slate-v2`.
   `TanStack DB`, `urql`, `VS Code`, and `LSP` all point upward into `plate-v2`.

6. Do not treat lightweight text surfaces as a reason to dilute Slate core.
   `rich-textarea` is a good native-surface model.
   `markdown-editor` is a good warning.

7. Do not treat `EditContext` as magic.
   It is a future DOM/input candidate, not a substitute for selection, clipboard, accessibility, or undo.

## The Settled Package Read

### `slate-v2`

Owns:

- document semantics
- operations
- transactions
- immutable committed snapshots
- runtime identity sidecar

Does not own:

- DOM translation
- React subscription policy
- pagination
- semantic-service architecture

### `slate-dom-v2`

Owns:

- DOM point/path translation
- selection bridge
- composition and `beforeinput`
- clipboard browser boundary
- nested editor and shadow DOM rules

Later import worth watching:

- `EditContext`, if browser support and accessibility story become strong enough

### `slate-react-v2`

Owns:

- snapshot store wiring
- selector subscriptions
- stable editor instance semantics
- controlled replacement
- React-lifecycle wiring for the DOM bridge
- default large-document-safe rendering posture

Does not own:

- browser semantics
- DOM point translation
- effect-driven editor mirroring

Default posture:

- active-slice invalidation
- semantic render islands
- active editing corridor
- default occlusion outside the corridor

Measurement split:

- active corridor uses live DOM geometry
- inactive islands may use deterministic planning geometry
- `Pretext` is a candidate for that planning layer, not a replacement for DOM truth

Not:

- broad rerender then rescue it with chunking

### `slate-history-v2`

Owns:

- transaction-aware undo units
- grouping rules
- committed-state restore

Later import worth watching:

- ProseMirror-style selection bookmarks
- Lexical-style update tags and dirty summaries

## The Remaining Slate v2 Structural Work

The architecture phase is not done yet.

One structural seam is still open:

1. explicit clipboard-boundary proof

That seam belongs inside:

- `slate-v2`
- `slate-dom-v2`

Not in a new `slate-clipboard-v2` package yet.

Why:

- clipboard is still mostly a browser-boundary and internal-fragment ownership problem
- a separate package would be premature abstraction right now

## The Next Execution Order

1. finish the clipboard-boundary proof
2. only then declare the package architecture phase complete
3. then cash out on the chronic runtime gaps:
   - decorations / annotation anchors
   - zero-width / DOM selection anchor debt
   - virtualization and large-doc breadth

Important:

- large-document behavior is already a default design target for the runtime
- the later work here is about finishing the remaining chronic lanes, not starting to care about scale for the first time
- the most likely planning primitive for inactive-region geometry is `Pretext`, used selectively and never as the active editing geometry source

Strong rule:

- do not jump to bug-family cleanup before the clipboard seam is proved

## What Belongs To Plate v2 Instead

The comparison work made this much clearer.

### 1. Layout And Pagination

- deterministic measurement
- page composition
- paged editing UX

This is where `Pretext` still points mostly upward into `plate-v2`.

But the comparison work also says one narrower thing for `slate-react-v2`:

- use `Pretext` selectively for inactive-region planning
- do not turn it into the active editing geometry source

### 2. Semantic-Service Layer

- diagnostics
- completions
- analyzers
- AI tooling
- relation-aware derived views

This should probably smell like:

- TanStack DB projections
- urql-style execution stages
- VS Code per-feature hosting
- LSP-shaped service contracts

### 3. Lightweight Native Surfaces

- decorated textareas
- native suggestions
- masking
- rich-enough inputs that should never become full Slate editors

This should bias toward:

- native `input` / `textarea`
- overlay or future platform primitives
- Open UI Richer Text Fields

Not:

- contenteditable hack stacks by default

## Bottom Line

The best `slate-v2` did not get more exotic after comparison.

It got stricter.

The final read is:

- keep the core boring and strong
- keep the package boundaries explicit
- finish clipboard
- make active-slice performance the default runtime posture
- do not let Plate concerns leak downward

That is the highest-confidence `slate-v2` direction we have now.
