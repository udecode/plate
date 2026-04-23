---
date: 2026-04-03
topic: slate-v2-plate-v2-comparative-research-plan
---

# Slate v2 / Plate v2 Comparative Research Plan

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Run a phased architecture study across the shortlisted editor and non-editor references so we can sharpen:

- the absolute best `slate-v2` plan first
- the future `plate-v2` architecture second

This is not a market map.

This is not repo sightseeing.

The point is to extract only the ideas that survive contact with our locked constraints.

## Locked Constraints

These are already decided and the research should not “rediscover” them:

1. `slate-v2` stays data-model-first.
2. Operations stay first-class externally.
3. Transactions are the internal execution model.
4. Runtime ownership stays split:
   - `slate-v2`
   - `slate-dom-v2`
   - `slate-react-v2`
   - `slate-history-v2`
5. `slate-react-v2` is explicitly React `19.2+` and React-perfect by intent.
6. We prefer that tradeoff over headless-first purity and React 18 support.

That means the research is not asking “should Slate become framework-agnostic again?”

It is asking:

- what package and runtime techniques strengthen that chosen direction?
- what should still stay more relevant to a future `plate-v2` than to `slate-v2`?

## Outputs

This research should continuously update:

1. [editor-architecture-candidates.md](/Users/zbeyens/git/plate-2/docs/analysis/editor-architecture-candidates.md)
   - candidate order and why the order is what it is
2. [slate-v2-plate-v2-architecture-research.md](/Users/zbeyens/git/plate-2/docs/analysis/slate-v2-plate-v2-architecture-research.md)
   - the cumulative ledger of useful ideas
3. [slate-v2-gap-matrix.md](/Users/zbeyens/git/plate-2/docs/analysis/slate-v2-gap-matrix.md)
   - the unresolved structural and product-layer gaps
4. [slate-v2](/Users/zbeyens/git/plate-2/docs/slate-v2)
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

- `adopt-now-for-slate-v2`
- `adopt-later-for-slate-v2`
- `better-fit-for-plate-v2`
- `interesting-but-reject`

Do not leave findings in a mushy “maybe useful” state.

In parallel, every major unresolved Slate pressure area should also be captured in the gap matrix with:

- owner package
- issue evidence
- proof status
- best reference repos
- likely fit (`slate-v2` now/later vs `plate-v2`)

## Research Order

This is the order that best sharpens the current plan:

### Phase 0: Current Baseline

- current `slate-v2` proof stack
- current package split and proof results
- already completed `edix` pass

Purpose:

- know exactly what we already proved
- stop the comparison work from solving problems we already solved

### Phase 1: Inheritance And Benchmark Baseline

1. `Slate`
2. `ProseMirror`

Purpose:

- understand what we are preserving from Slate
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

- decide what belongs in future `slate-v2`
- decide what is better treated as `plate-v2` or a higher-layer system

### Phase 4: Lightweight Surface Pressure

7. `use-editable`
8. `rich-textarea`
9. `markdown-editor`

Purpose:

- pressure-test where the full package stack is overkill
- identify ideas better suited to lighter Plate-owned surfaces than Slate core/runtime

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

Slate is the priority.

So every pass should answer in this order:

1. what improves `slate-v2` directly?
2. what is useful but better deferred to `plate-v2`?
3. what should be rejected even if it looks clever?

If a finding mostly helps `plate-v2`, keep it, but do not let it distort the `slate-v2` package plan.

## Done Condition

This research is complete when:

1. every candidate in the shortlist has a crisp ledger entry
2. the `slate-v2` doc set reflects the strongest direct findings
3. the remaining ideas clearly sorted into:
   - `slate-v2 now`
   - `slate-v2 later`
   - `plate-v2`
4. we can do one final pass on `slate-v2` with actual confidence instead of fashionable repo-envy

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
  - keep pagination, deterministic measurement, and page composition above `slate-v2`
  - treat `Pretext` as a measurement primitive and `Premirror` as a future `plate-v2` / higher-layer architecture reference, not as excuses to bloat Slate core
  - treat `Tiptap` as a `plate-v2` product-layer benchmark more than a `slate-v2` engine benchmark
  - keep a future lightweight-surface lane in mind for `plate-v2`; `use-editable` is a good reminder that some editables should stay tiny
  - bias that lightweight-surface lane toward native-control overlays like `rich-textarea`, not brittle contenteditable projection like `markdown-editor`
  - future `plate-v2` semantic architecture should probably look closer to TanStack DB plus urql:
    normalized projection stores, incremental derived views, and exchange-like execution stages
  - host semantic features per capability, not via one mega extension surface; VS Code’s per-feature registries are the right smell
  - keep semantic services speaking documents, positions, edits, diagnostics, and capabilities; LSP is the right abstraction pressure there
  - treat EditContext as a later DOM/input seam candidate, not a substitute for selection, clipboard, accessibility, or undo work
  - treat Open UI Richer Text Fields as strong evidence that many future Plate surfaces should stay native `<input>` / `<textarea>` based if the platform grows the right primitives
  - none of that changes the immediate `slate-v2` structural next step, which is still the clipboard-boundary proof
