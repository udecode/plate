---
date: 2026-04-03
topic: slate-v2-gap-matrix
---

# Slate v2 Gap Matrix

## Purpose

This file tracks the major unresolved gaps surfaced by the Slate issue corpus and ongoing comparison research.

It is the missing bridge between:

- issue pressure
- package proofs already completed
- external architecture references still worth studying

The goal is not to dump every bug family into one list.

The goal is to keep a disciplined answer to:

1. what gap is still structurally unresolved?
2. which package should own it?
3. which reference repos are most likely to teach us something useful?
4. is it a `slate-v2` priority now, a later `slate-v2` concern, or really a `plate-v2` concern?

## Status Key

- `proved`
- `structural-next`
- `research-next`
- `later`
- `better-fit-for-plate-v2`

## Gap Matrix

### 1. Decorations, Marks, And Annotation Anchors

Status: `research-next`

Primary package owners:

- `slate-react-v2`
- `slate-v2`
- secondarily `slate-dom-v2`

Why it matters:

- render-time mark projection
- decoration invalidation breadth
- cross-node decoration semantics
- annotation/comment anchors on selections

Current evidence:

- issue cluster explicitly names this as a recurrent cross-cutting seam in [issue-clusters.md](/Users/zbeyens/git/plate-2/docs/slate-issues/issue-clusters.md)
- direct issue pressure includes `#5987`, `#3354`, `#3352`, `#3383`, `#2465`, `#4477`

Current proof status:

- `slate-react-v2` proves selector-first runtime and id-backed subscriptions
- it does **not** yet prove decoration or annotation projection

Best references to analyze:

1. `Lexical`
2. `ProseMirror`
3. `Tiptap`
4. current `slate-react`

Likely fit:

- `adopt-later-for-slate-v2`

Notes after research:

- Lexical strengthens the case for explicit update payloads and renderer discipline, but not for dropping `useSyncExternalStore`.

### 2. Invisible Nodes, Zero-Width Sentinels, And DOM Selection Anchors

Status: `research-next`

Primary package owners:

- `slate-dom-v2`
- `slate-v2`

Why it matters:

- Slate still relies on DOM-visible anchor hacks for selection
- empty blocks and inline boundaries need legal caret positions
- the current DOM layer still pays for invisible node strategy choices

Current evidence:

- `#1971`
- `#2597`
- `#5760`
- `#4839`
- `#6034`

Current proof status:

- `slate-dom-v2` proves identity-backed DOM lookup and editor containment
- it does **not** yet prove a replacement for the current invisible-node / zero-width strategy

Best references to analyze:

1. `Slate`
2. `ProseMirror`
3. `Lexical`
4. `edix`
5. `EditContext API`

Likely fit:

- `adopt-later-for-slate-v2`

Notes after research:

- EditContext is promising because it decouples text input from DOM mutation.
- But it does not auto-solve selection mapping, accessibility, spellcheck, clipboard, or undo.
- So it is a later input-boundary candidate, not a silver bullet for the current DOM/selection seam.

### 3. Clipboard Fragment Ownership And External Format Boundaries

Status: `structural-next`

Primary package owners:

- `slate-dom-v2`
- `slate-v2`

Why it matters:

- internal fragment format ownership
- editor identity across copy/paste
- HTML/plaintext import/export seams
- avoiding accidental `data-slate-fragment` coupling

Current evidence:

- `#5233`
- `#5328`
- `#5630`
- `#1024`
- `#4440`

Current proof status:

- not yet structurally proved
- this is the next missing Phase 4 seam

Best references to analyze:

1. `ProseMirror`
2. `edix`
3. `Tiptap`
4. current `slate-dom`

Likely fit:

- `adopt-now-for-slate-v2`

Notes after research:

- ProseMirror is the strongest direct reference here because clipboard lives in its `view` package and exposes explicit serializer/parser transform hooks.
- Edix is still valuable because it makes internal clipboard ownership explicit with a minimal adapter seam.

### 4. Pagination, Layout, And Deterministic Measurement

Status: `better-fit-for-plate-v2`

Primary package owners:

- future `plate-v2`
- maybe future higher-layer layout packages

Why it matters:

- page-aware composition
- deterministic layout measurement
- pagination without DOM-reflow roulette

Current evidence:

- issue pressure like `#5944`
- wider known demand for page-layout editing

Current proof status:

- intentionally not in the current `slate-v2` proof stack

Best references to analyze:

1. `Pretext`
2. `Premirror`
3. `ProseMirror` only as document truth substrate

Likely fit:

- `better-fit-for-plate-v2`

Notes after research:

- Pretext is the strongest measurement reference here because its `prepare -> layout` split gives deterministic text sizing without DOM reflow.
- Premirror is the strongest architecture reference here because it keeps document truth, measurement, composition, and rendering as separate layers.
- The combined lesson is blunt:
  pagination belongs above `slate-v2`, not inside the core/runtime packages.

### 5. Virtualization And Huge-Document Rendering

Status: `research-next`

Primary package owners:

- `slate-react-v2`
- maybe future `plate-v2` view layers

Why it matters:

- very large documents
- initial render cost
- offscreen rendering strategy
- interaction between virtualization and DOM lookup

Current evidence:

- `#790`
- `#4056`
- `#5216`
- `#5131`
- existing benchmark lanes in [benchmark-candidate-map.md](/Users/zbeyens/git/plate-2/docs/slate-issues/benchmark-candidate-map.md)

Current proof status:

- selector-first runtime and id-based DOM lookup are proved
- virtualization itself is not

Best references to analyze:

1. `Lexical`
2. `ProseMirror`
3. `Pretext` / `Premirror`
4. `edix` only as a lightweight contrast

Likely fit:

- split:
  - `adopt-later-for-slate-v2` for renderer fundamentals
  - `better-fit-for-plate-v2` for full productized huge-doc experiences

Notes after research:

- Lexical is the strongest next reference for renderer invalidation discipline and update metadata.
- Pretext matters here too because deterministic text height unlocks better occlusion and scroll-anchor stability without DOM measurement thrash.
- Premirror suggests page/layout snapshots and mapping indexes are the right kind of prerequisite if virtualization ever grows page-aware, but that still smells more like `plate-v2` than near-term Slate core work.

### 6. Plugin / Extension Architecture

Status: `research-next`

Primary package owners:

- `slate-v2`
- `plate-v2`

Why it matters:

- Slate still wants a cleaner plugin story than wrapper soup
- Plate likely wants a richer product-layer extension surface than Slate core should carry

Current evidence:

- current package proofs intentionally deferred the full plugin model

Current proof status:

- not structurally proved yet

Best references to analyze:

1. `ProseMirror`
2. `Tiptap`
3. `Lexical`
4. `urql`
5. current `Plate`

Notes after research:

- ProseMirror already proves a serious state/plugin boundary with `filterTransaction`, `appendTransaction`, and plugin-owned state fields.
- That strengthens the case for later Slate middleware evolution, but richer extension ergonomics still fit Plate better than Slate core.
- Lexical adds a strong extension dependency graph and builder model, which is more likely to influence `plate-v2` than the next `slate-v2` package seam.
- Premirror adds a useful high-layer precedent: feature bundles that package schema extensions, commands, invalidation, and rendering helpers together without pretending they belong in document core.
- Tiptap makes the same product-layer point from the opposite angle:
  packaging, extension catalogs, and wrapper DX can make an editor feel fast without changing the underlying engine story much.
- urql adds the strongest pipeline discipline here:
  explicit exchange contracts, sync-first ordering, and a hard rule against silently dropping unknown operations.
- VS Code adds the strongest provider-registry discipline here:
  per-feature registries, scored provider selection, explicit host RPC, and adaptive feature debouncing.

### 8. Update Metadata And Dirty-Signal Discipline

Status: `research-next`

Primary package owners:

- `slate-react-v2`
- `slate-history-v2`

Why it matters:

- change tags
- dirty element/leaf summaries
- filtering update reactions without broad rerenders
- history grouping and onChange semantics that are explicit, not guessed

Current evidence:

- our proofs are still thinner here than Lexical’s model

Best references to analyze:

1. `Lexical`
2. `ProseMirror`

Likely fit:

- `adopt-later-for-slate-v2`

Likely fit:

- split:
  - `adopt-later-for-slate-v2` for core middleware seams
  - `better-fit-for-plate-v2` for rich extension UX

Notes after research:

- Tiptap adds a useful runtime caution:
  selector subscriptions in a dedicated React package are good, but carrying broad compatibility baggage is exactly what we are allowed to avoid with the `slate-react-v2` React `19.2+` choice.

### 7. Service / Semantic Layer Architecture

Status: `better-fit-for-plate-v2`

Primary package owners:

- `plate-v2`

Why it matters:

- semantic linting
- AI analyzers
- completions
- diagnostics
- document reasoning services

Best references to analyze:

1. `VS Code`
2. `Language Server Protocol`
3. `TanStack DB`
4. `urql`

Likely fit:

- `better-fit-for-plate-v2`

Notes after research:

- TanStack DB is the strongest current reference for semantic projections:
  normalized collections, explicit indexes, and incremental live-query compilation.
- urql is the strongest current reference for execution pipelines:
  one client hub, many exchanges, strict ordering rules.
- VS Code is the strongest current reference for tool-side feature hosting:
  text model separate from view, per-feature registries, explicit host boundaries.
- LSP is the strongest current reference for external semantic-service contracts:
  versioned text sync, capability negotiation, cancellable requests, pull diagnostics, and lazy resolve flows.
- The combined lesson is strong:
  if `plate-v2` grows a semantic-service layer, it should probably look like
  normalized projection stores plus exchange-like execution stages, with per-feature registries and protocol-shaped service boundaries instead of ad hoc plugin soup.

### 9. Lightweight Editable Surfaces

Status: `research-next`

Primary package owners:

- `plate-v2`

Why it matters:

- not every editable needs the full Slate package stack
- code-like, plaintext, or token-input surfaces want much smaller APIs
- forcing Slate onto tiny text surfaces is how architecture gets bloated

Current proof status:

- no dedicated lightweight-surface strategy exists yet

Best references to analyze:

1. `use-editable`
2. `rich-textarea`
3. `markdown-editor`

Likely fit:

- `better-fit-for-plate-v2`

Notes after research:

- `use-editable` is the current lower bound:
  a tiny hook, mutation rollback, selection repair, and a plain-text-first API.
- That is useful product pressure for `plate-v2`.
- It is not a reason to collapse `slate-v2` into DOM-owned text editing.
- `rich-textarea` is the strongest positive reference in this lane:
  native textarea truth plus mirrored decoration layer is a much cleaner fit for lightweight text surfaces.
- `markdown-editor` is mostly the cautionary example:
  manual contenteditable projection with character-count and layout invariants gets brittle fast.
- Open UI Richer Text Fields is the strongest platform direction for this lane:
  `InputRange`, CSS highlights, suggestions, and mask primitives would let many “rich enough” surfaces stay native.
- If those primitives land, more cases should stay out of Slate entirely.

## What Is Already Proved

These should stay out of the gap list unless new evidence reopens them:

- `slate-v2` transaction-first core
- `slate-dom-v2` identity-backed DOM lookup and containment
- `slate-react-v2` selector-first runtime and controlled replacement
- `slate-history-v2` transaction-aware undo units

## Next Research Order

To improve this matrix honestly:

1. final `slate-v2` synthesis
2. explicit `plate-v2` action memo

That order keeps pressure on the unresolved product and extension seams without drifting into random repo tourism.
