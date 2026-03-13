# Block Selection Core Migration Design Draft

## Background

- The current block selection implementation lives in [BlockSelectionPlugin.tsx](/Users/felixfeng/Desktop/udecode/plate/packages/selection/src/react/BlockSelectionPlugin.tsx).
- The implementation is already on the right track: state is lightweight, the core data is `selectedIds: Set<string>`, and it provides per-id selectors.
- In contrast, table selection takes a heavier path:
  - [useSelectedCells.ts](/Users/felixfeng/Desktop/udecode/plate/packages/table/src/react/components/TableElement/useSelectedCells.ts) recomputes the table/cell grid and writes `selectedCells` / `selectedTables`
  - [useIsCellSelected.ts](/Users/felixfeng/Desktop/udecode/plate/packages/table/src/react/components/TableCellElement/useIsCellSelected.ts) makes every cell subscribe to the entire selection state
- The long-term direction: selection becomes a core editor capability, and block selection / table selection both build on top of it.
- Phase 1 does not address table selection. It only completes the block selection migration, but the design must leave room for table extension.

## Problem Definition

Although the current block selection works, it is still "a complete selection state and behavior set owned by a plugin", which causes several structural issues:

1. Selection is a feature-level capability, not a core-level capability
2. Other selection modes cannot reuse the same underlying model
3. Table selection will likely grow another parallel state set instead of reusing unified selection infrastructure

We need to take the first step: move block selection state ownership down to core, without immediately changing the base semantics of `editor.selection`.

## Goals

- Make block selection a core-backed capability
- Keep existing block selection interactions and external behavior unchanged
- Do not modify `editor.selection` in Phase 1
- Introduce a core model that can accommodate future non-text selection
- Keep Phase 1 within a scope that can be landed and verified independently

## Non-Goals

- Do not redo table selection in this phase
- Do not change Slate's `editor.selection` to `Range | Range[]`
- Do not require all transforms to understand multi-range discrete ranges in Phase 1
- Do not detail table merge / border implementation in this document

## Phase 1 Scope

Phase 1 does one thing: migrate block selection from "plugin-owned state" to "core-owned state".

Expected outcome after this phase:

- Block selection state is registered and managed by core
- Block selection UI can remain in the selection package
- Existing block selection commands continue to work, but delegate to core internally
- External callers no longer treat block plugin options as the ultimate source of truth

## Proposed Core State Model

The Phase 1 model should be minimal — do not prematurely include the full table shape.

```ts
type EditorSelectionState = {
  primary: Range | null;
  block: {
    anchorId: string | null;
    selectedIds: Set<string>;
    isSelecting: boolean;
    isSelectionAreaVisible: boolean;
  };
};
```

Notes:

- `primary` continues to correspond to the current text selection
- `block` is a new core selection channel, not a plugin-private store
- `selectedIds` continues to use `Set<string>` because it is already the correct data shape: cheap per-id lookups, low-cost membership checks
- Phase 1 does not add a table descriptor, but the state boundary must not be hardcoded to "only block as an extra selection type"

## API Direction

Core should expose a thin selection API layer, and block selection adapts on top of it.

```ts
editor.api.selection.getPrimary()
editor.api.selection.setPrimary(range)

editor.api.selection.block.get()
editor.api.selection.block.clear()
editor.api.selection.block.set(ids)
editor.api.selection.block.add(ids)
editor.api.selection.block.delete(ids)
editor.api.selection.block.has(id)
editor.api.selection.block.isSelecting()
```

Existing block-facing helpers can be retained, but their semantics should change:

- `editor.getApi(BlockSelectionPlugin).blockSelection.add(...)`
- `editor.getApi(BlockSelectionPlugin).blockSelection.clear()`
- `editor.getApi(BlockSelectionPlugin).blockSelection.getNodes(...)`

These helpers should become compatibility wrappers rather than continuing to hold their own real state.

## Rendering Layer Direction

Phase 1 does not need to rewrite block selection visual interactions — only migrate state ownership.

- Block selection area UI can remain in the selection package
- [useBlockSelected.ts](/Users/felixfeng/Desktop/udecode/plate/packages/selection/src/react/hooks/useBlockSelected.ts) switches to reading a core-backed selector
- `BlockSelectionPlugin` shrinks to an adapter: event wiring, render integration, and compatibility layer API

This approach carries significantly lower risk than "rewriting the entire interaction model at once".

## Migration Steps

### Step 1: Introduce core block selection state

- Add block selection state structure in core
- Expose minimal selectors and mutators
- Keep `editor.selection` behavior unchanged

### Step 2: Redirect block selection API

- Redirect reads/writes of `selectedIds`, `anchorId`, `isSelecting`, etc. behind the core API
- Continue exposing the existing block selection command surface externally

### Step 3: Redirect hooks and render

- Hooks like [useBlockSelected.ts](/Users/felixfeng/Desktop/udecode/plate/packages/selection/src/react/hooks/useBlockSelected.ts) switch to consuming the core-backed selector
- UI behavior remains unchanged

### Step 4: Reduce plugin state ownership

- `BlockSelectionPlugin` retains:
  - Event wiring
  - Adapter APIs
  - Rendering integration
- Core becomes the sole state owner

## Compatibility Strategy

To keep the blast radius under control, Phase 1 should adhere to these rules:

- `editor.selection` continues to be `Range | null`
- Not all editing commands are required to understand block selection immediately
- Block-specific operations continue to explicitly read block selection state
- Avoid introducing large-scale type modifications in Phase 1

This allows the migration to be incremental rather than affecting the entire Slate / Plate command surface at once.

## Why This Step First

The value of this phase:

- Reclaim selection ownership into core
- Remove a feature-level state owner
- Provide a unified foundation for other future selection modes

It is also low-risk because block selection's current data model is already relatively healthy — the main issue is "where the state lives", not "what the state looks like".

## Table Direction as Design Constraint Only

Table is not in Phase 1 scope, but Phase 1 design must avoid blocking future table work.

Phase 1 should explicitly avoid:

- Hardcoding core selection to serve only block ids
- Treating "flat id set" as the only non-text selection shape
- Letting future table selection still depend on materialized node arrays

Future table selection will likely need:

- A table-scoped descriptor instead of `selectedCells: TElement[]`
- Keyed selectors instead of each cell subscribing to the entire selection
- Expressive power for non-contiguous / grid-shaped selection semantics

No need to detail the table design here — just ensure Phase 1 state boundaries and API do not prevent Phase 2 from extending in this direction.

## Open Questions

- Should core selection expose a channeled model (`block` / `table` / `primary`) or a more generic descriptor registry?
- After migration, which `BlockSelectionPlugin` APIs are still worth keeping as public interfaces?
- Should block selection render logic stay in `packages/selection` long-term, or continue moving toward core?

## Phase 1 Acceptance Criteria

- Block selection state is owned by core
- Existing block selection interaction behavior remains consistent
- `useBlockSelected` and related selectors switch to reading core-backed state
- Existing block selection commands continue to work, delegating to core via compatibility wrappers
- Phase 1 does not require any changes to table selection behavior
