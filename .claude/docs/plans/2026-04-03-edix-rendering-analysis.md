---
date: 2026-04-03
topic: edix-rendering-analysis
---

# Edix Rendering Analysis

## Goal

Analyze `../edix` for rendering and runtime techniques that could improve the `slate-v2` package stack, especially the long-term `slate-react-v2` renderer.

## Decision

Not a generic repo review.

The point is to answer:

1. Does `edix` have a better rendering/runtime architecture worth stealing?
2. Which ideas map cleanly into `slate-v2`?
3. Which ideas are incompatible with our locked principles?

## Scope

- `../edix` local clone only
- renderer/runtime architecture
- store/subscription model
- selection and DOM ownership model
- large-document / rerender-control techniques
- any pagination or composition tricks only if they affect rendering architecture

## Non-Goals

- no internet comparison yet
- no code changes
- no docs rewrites yet
- no vague “edix seems cool” summary

## Phases

### Phase 1: Repo Grounding

Status: `in_progress`

- identify stack and workspace layout
- find editor/runtime packages
- locate rendering/store/selection code

### Phase 2: Rendering Architecture Extraction

Status: `completed`

- map editor state model
- map React subscription model
- map DOM bridge ownership
- map rerender-scope control

### Phase 3: Slate-v2 Comparison

Status: `completed`

- compare against current `slate-v2`, `slate-dom-v2`, and `slate-react-v2` proofs
- separate:
  - worth stealing now
  - worth stealing later
  - incompatible with locked principles

### Phase 4: Recommendation

Status: `completed`

- produce a concise “what next” recommendation for the Slate v2 plan

## Progress Log

### 2026-04-03

- started focused rendering/runtime analysis of `../edix`
- grounded `../edix` as a small framework-agnostic contenteditable state manager, not a React-first editor framework
- key useful findings:
  - the core editor is a headless imperative state machine with a microtask transaction queue in [editor.ts](/Users/zbeyens/git/edix/src/editor.ts)
  - document edits are represented as pure operations inside [doc/edit.ts](/Users/zbeyens/git/edix/src/doc/edit.ts)
  - DOM selection is serialized into framework-agnostic selection snapshots in [dom/index.ts](/Users/zbeyens/git/edix/src/dom/index.ts)
  - clipboard ownership is explicit and extensible through internal copy/paste extensions in [extensions/copy/internal.ts](/Users/zbeyens/git/edix/src/extensions/copy/internal.ts) and [extensions/paste/internal.ts](/Users/zbeyens/git/edix/src/extensions/paste/internal.ts)
  - history is time-batched in [history.ts](/Users/zbeyens/git/edix/src/history.ts), which is exactly the part we should *not* copy
- strongest take:
  - Edix has good ideas for `slate-dom-v2` and future clipboard boundaries
  - Edix does **not** show a better React renderer architecture than the one we are already building
  - its React example is just a thin imperative adapter using `useEffect`, `useRef`, and `useState` in [App.tsx](/Users/zbeyens/git/edix/examples/react/src/App.tsx), not a selector-first rendering model
- what is worth stealing:
  - explicit headless DOM binding as an adapter concept
  - explicit internal clipboard format ownership
  - pure operation/selection rebasing in the core
- what is not worth stealing:
  - time-window history grouping
  - the React integration shape
  - any assumption that “small and headless” automatically means “best renderer”
