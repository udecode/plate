---
date: 2026-04-03
topic: plite-plate-v2-comparative-research-plan
---

# Plite / Plate v2 Comparative Research Plan

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/master-roadmap.md).

## Goal

Run a phased architecture study across the shortlisted editor and non-editor references so we can sharpen:

- the absolute best `plite` plan first
- the future `plate-v2` architecture second

This is not a market map.

This is not repo sightseeing.

The point is to extract only the ideas that survive contact with our locked constraints.

## Locked Constraints

These are already decided and the research should not “rediscover” them:

1. `plite` stays data-model-first.
2. Operations stay first-class externally.
3. Transactions are the internal execution model.
4. Runtime ownership stays split:
   - `plite`
   - `plite-dom-v2`
   - `plite-react-v2`
   - `plite-history-v2`
5. `plite-react-v2` is explicitly React `19.2+` and React-perfect by intent.
6. We prefer that tradeoff over headless-first purity and React 18 support.

That means the research is not asking “should Plite become framework-agnostic again?”

It is asking:

- what package and runtime techniques strengthen that chosen direction?
- what should still stay more relevant to a future `plate-v2` than to `plite`?

## Outputs

This research should continuously update:

1. [editor-architecture-candidates.md](/Users/zbeyens/git/plate-2/docs/analysis/editor-architecture-candidates.md)
   - candidate order and why the order is what it is
2. [plite-plate-v2-architecture-research.md](/Users/zbeyens/git/plate-2/docs/analysis/plite-plate-v2-architecture-research.md)
   - the cumulative ledger of useful ideas
3. [plite-gap-matrix.md](/Users/zbeyens/git/plate-2/docs/analysis/plite-gap-matrix.md)
   - the unresolved structural and product-layer gaps
4. [plite](/Users/zbeyens/git/plate-2/docs/plite)
   - only when a finding is strong enough to actually tighten the current plan

## Capture Rules

For every repo or reference, capture ideas under these buckets:

1. Core engine
2. DOM bridge
3. React runtime
4. History
5. Clipboard / external formats
6. Plugin / extension model
7. Product / DX / packaging
8. Layout / composition / pagination

For each idea, classify it as exactly one of:

- `adopt-now-for-plite`
- `adopt-later-for-plite`
- `better-fit-for-plate-v2`
- `interesting-but-reject`

Do not leave findings in a mushy “maybe useful” state.

In parallel, every major unresolved Plite pressure area should also be captured in the gap matrix with:

- owner package
- issue evidence
- proof status
- best reference repos
- likely fit (`plite` now/later vs `plate-v2`)

## Research Order

This is the order that best sharpens the current plan:

### Phase 0: Current Baseline

- current `plite` proof stack
- current package split and proof results
- already completed `edix` pass

Purpose:

- know exactly what we already proved
- stop the comparison work from solving problems we already solved

### Phase 1: Inheritance And Benchmark Baseline

1. `Plite`
2. `ProseMirror`

Purpose:

- understand what we are preserving from Plite
- compare that directly against the strongest disciplined editor architecture

### Phase 2: Runtime Architecture Pressure

3. `Lexical`
4. `Tiptap`

Purpose:

- `Lexical` for runtime/update/identity/render discipline
- `Tiptap` for productization, extension UX, and packaging strategy

### Phase 3: Layout And Composition Futures

5. `Pretext`
6. `Premirror`

Purpose:

- decide what belongs in future `plite`
- decide what is better treated as `plate-v2` or a higher-layer system

### Phase 4: Lightweight Surface Pressure

7. `use-editable`
8. `rich-textarea`
9. `markdown-editor`

Purpose:

- pressure-test where the full package stack is overkill
- identify ideas better suited to lighter Plate-owned surfaces than Plite core/runtime

### Phase 5: Cross-Domain Architecture Imports

10. `TanStack DB`
11. `urql`
12. `VS Code`
13. `Language Server Protocol`
14. `EditContext API`
15. `Open UI Richer Text Fields`

Purpose:

- projections and indexing
- pipeline/exchange architecture
- semantic service boundaries
- future platform primitives

## Working Rule

Plite is the priority.

So every pass should answer in this order:

1. what improves `plite` directly?
2. what is useful but better deferred to `plate-v2`?
3. what should be rejected even if it looks clever?

If a finding mostly helps `plate-v2`, keep it, but do not let it distort the `plite` package plan.

## Done Condition

This research is complete when:

1. every candidate in the shortlist has a crisp ledger entry
2. the `plite` doc set reflects the strongest direct findings
3. the remaining ideas clearly sorted into:
   - `plite now`
   - `plite later`
   - `plate-v2`
4. we can do one final pass on `plite` with actual confidence instead of fashionable repo-envy

## Progress

### 2026-04-03

- `edix`: completed
- `ProseMirror`: completed
- `Lexical`: completed
- `Tiptap`: completed
- `Pretext`: completed
- `Premirror`: completed
- `use-editable`: completed
- `rich-textarea`: completed
- `markdown-editor`: completed
- `TanStack DB`: completed
- `urql`: completed
- `VS Code`: completed
- `Language Server Protocol`: completed
- `EditContext API`: completed
- `Open UI Richer Text Fields`: completed
- strongest direct next-step implication:
  - do the clipboard-boundary proof next
  - keep the package split
  - do not rethink the React runtime based on ProseMirror or Lexical
  - but do mine Lexical later for update-tag and extension-graph ideas
  - keep pagination, deterministic measurement, and page composition above `plite`
  - treat `Pretext` as a measurement primitive and `Premirror` as a future `plate-v2` / higher-layer architecture reference, not as excuses to bloat Plite core
  - treat `Tiptap` as a `plate-v2` product-layer benchmark more than a `plite` engine benchmark
  - keep a future lightweight-surface lane in mind for `plate-v2`; `use-editable` is a good reminder that some editables should stay tiny
  - bias that lightweight-surface lane toward native-control overlays like `rich-textarea`, not brittle contenteditable projection like `markdown-editor`
  - future `plate-v2` semantic architecture should probably look closer to TanStack DB plus urql:
    normalized projection stores, incremental derived views, and exchange-like execution stages
  - host semantic features per capability, not via one mega extension surface; VS Code’s per-feature registries are the right smell
  - keep semantic services speaking documents, positions, edits, diagnostics, and capabilities; LSP is the right abstraction pressure there
  - treat EditContext as a later DOM/input seam candidate, not a substitute for selection, clipboard, accessibility, or undo work
  - treat Open UI Richer Text Fields as strong evidence that many future Plate surfaces should stay native `<input>` / `<textarea>` based if the platform grows the right primitives
  - none of that changes the immediate `plite` structural next step, which is still the clipboard-boundary proof
