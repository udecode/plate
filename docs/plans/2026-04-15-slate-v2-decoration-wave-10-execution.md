---
date: 2026-04-15
topic: slate-v2-decoration-wave-10-execution
status: in_progress
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
---

# Goal

Execute Wave 10 from the decoration roadmap:
source dirtiness declarations.

# Scope

- additive dirtiness declarations for decoration sources
- editor-change filtering for projection, annotation, and widget stores
- explicit refresh still working for external or app-owned sources
- targeted tests and docs only where this wave forces them

# Constraints

- no scope reduction
- current simple callers must keep working
- missing dirtiness declarations must fall back to full refresh
- no fake Wave 11 spillover disguised as Wave 10
- must end with fresh verification, architect review, deslop, and post-deslop
  re-verification

# Phases

- [x] Ground context and wave scope
- [x] Choose the additive dirtiness API and audit current callers
- [x] Implement Wave 10 source-level invalidation
- [x] Verify with targeted and package-level evidence
- [x] Architect review
- [x] Deslop + post-deslop re-verification

# Findings

- Wave 9 is complete and gives this wave `SnapshotChange` metadata through
  `Editor.subscribe(...)`
- current `slate-react` overlay stores still recompute too broadly
- the roadmap locks the required source classes:
  - `always`
  - `selection`
  - `text`
  - `node`
  - `annotation`
  - `external`
  - `custom`
- local learnings say:
  - keep core range semantics separate from React overlay caching
  - stable input identity matters for annotation/widget/projection stores
- the smallest durable Wave 10 API grew beyond a single enum member:
  - `mark` had to be included because Wave 9 already publishes it
  - dirtiness declarations need array form for mixed sources like
    `['text', 'node']`
  - function form is the advanced custom predicate surface
- `createSlateProjectionStore(...)` stayed source-compatible by adding optional
  store options instead of changing the source callback signature
- `refreshSource(id)` now actually refreshes one decoration source instead of
  lying and refreshing the whole source set
- `docs/shared/agent-tiers.md` is missing in this repo
- `docs/solutions/patterns/critical-patterns.md` is missing in this repo

# Progress

## 2026-04-15

- created the Ralph context snapshot and execution note
- confirmed Wave 10 is the active next wave after the completed Wave 9 batch
- audited current source/store touchpoints across:
  - `decoration-sources.ts`
  - `annotation-store.ts`
  - `widget-store.ts`
  - `projection-store.ts`
  - `use-slate-decoration-sources.tsx`
- read the locked Wave 10 contract and the invalidation decision/concept docs
- read the two most relevant local learnings for overlay architecture and store
  identity
- audited direct call-site impact for:
  - `createSlateProjectionStore`
  - `createSlateDecorationSourceStore`
  - `useSlateDecorationSources`
  - `createSlateAnnotationStore`
  - `createSlateWidgetStore`
- landed the additive Wave 10 surface across:
  - `packages/slate-react/src/projection-store.ts`
  - `packages/slate-react/src/decoration-sources.ts`
  - `packages/slate-react/src/annotation-store.ts`
  - `packages/slate-react/src/widget-store.ts`
  - `packages/slate-react/src/hooks/use-slate-range-ref-projection-store.tsx`
  - `packages/slate-react/src/index.ts`
- updated docs to teach optional source dirtiness without forcing it on simple
  usage:
  - `docs/libraries/slate-react/hooks.md`
  - `docs/libraries/slate-react/editable.md`
- added Wave 10 proof rows in:
  - `packages/slate-react/test/projections-and-selection-contract.tsx`
  - `packages/slate-react/test/annotation-store-contract.tsx`
  - `packages/slate-react/test/widget-layer-contract.tsx`
- fresh evidence so far:
  - `pnpm install`
  - `pnpm turbo build --filter=./packages/slate-react`
  - `pnpm turbo typecheck --filter=./packages/slate-react`
  - `pnpm lint:fix`
  - `pnpm --filter slate-react test` → `95 passed`
  - targeted slate-react overlay contract slice → `9 passed`
  - `lsp_diagnostics` on all affected slate-react TS/TSX files → `0 errors`
- architect review caught one public-surface gap:
  - the new dirtiness context/helper existed in `projection-store.ts` but were
    not re-exported from the package entrypoint
- fixed the package surface in:
  - `packages/slate-react/src/index.ts`
- reran the full evidence stack after the export fix:
  - `pnpm turbo build --filter=./packages/slate-react`
  - `pnpm turbo typecheck --filter=./packages/slate-react`
  - `pnpm lint:fix`
  - `pnpm --filter slate-react test` → `95 passed`
  - `lsp_diagnostics` on `packages/slate-react/src/index.ts` → `0 errors`
- second architect pass caught one remaining Wave 10 contract bug:
  - `refreshSource(id)` still refreshed every declared source because
    `reason: 'refresh'` made all dirtiness classes look dirty
- fixed the source-scoped refresh path in:
  - `packages/slate-react/src/decoration-sources.ts`
- added the regression row that proves the fix:
  - `packages/slate-react/test/projections-and-selection-contract.tsx`
    → `refreshSource only recomputes the targeted decoration source`
- final architect outcome:
  - `APPROVED`
- deslop re-audit result:
  - no further dead code, duplicate logic, or cleanup worth changing inside the
    Ralph-owned file scope
- post-deslop re-verification:
  - `pnpm turbo build --filter=./packages/slate-react`
  - `pnpm turbo typecheck --filter=./packages/slate-react`
  - `pnpm lint:fix`
  - `pnpm --filter slate-react test` → `95 passed`

# Errors

- build initially failed on a type-narrowing hole in the new dirtiness union
  inside `projection-store.ts`
  - fixed by adding an explicit array type guard before the scalar class branch
- first architect pass rejected the batch because the new dirtiness
  context/helper were not exported from the package entrypoint
- second architect pass rejected the batch because `refreshSource(id)` still
  leaked `reason: 'refresh'` into every other source and recomputed broadly
