# DnD missing-context runtime guard

## Goal

Prevent `@platejs/dnd` from throwing `Expected drag drop context` when a Plate surface renders without an active `react-dnd` manager, while keeping normal browser DnD behavior intact.

## Findings

- `apps/www` already wraps the app tree in [`Providers`](apps/www/src/components/context/providers.tsx) with `DndProvider`.
- The editor DnD plugin also wraps `aboveSlate` in [`dnd-kit.tsx`](apps/www/src/registry/components/editor/plugins/dnd-kit.tsx) with `DndProvider`.
- Prior repo learning in [`2026-03-28-next-prerendered-client-editors-need-dnd-hooks-to-noop-on-the-server.md`](docs/solutions/developer-experience/2026-03-28-next-prerendered-client-editors-need-dnd-hooks-to-noop-on-the-server.md) already established that this error is often a runtime-environment contract bug, not missing provider plumbing.
- Current package fix: guard `useDragNode` and `useDropNode` on both DOM availability and `DndContext.dragDropManager`.

## Plan

1. Confirm the hook-level guard is the right durable fix.
2. Run remaining verification for touched surfaces.
3. State clearly whether the duplicate-deps hypothesis is supported by evidence.

## Progress

- Added a missing-context guard in [`useDragNode.ts`](packages/dnd/src/hooks/useDragNode.ts) and [`useDropNode.ts`](packages/dnd/src/hooks/useDropNode.ts).
- Switched the guard to import `DndContext` from `react-dnd/dist/core/index.js` because Bun did not reliably surface that export from the package root during tests.
- Extended [`useDraggable.spec.tsx`](packages/dnd/src/components/useDraggable.spec.tsx) with a missing-context regression case.
- Initial targeted Bun test hit the repo's known mixed `.bun` / `.pnpm` React invalid-hook-call failure mode; `pnpm run reinstall` cleared it.
- Final verification passed:
  - `pnpm --filter @platejs/dnd test -- useDraggable.spec.tsx`
  - `bun test packages/dnd/src/components/useDraggable.spec.tsx`
  - `pnpm turbo build --filter=./packages/dnd --filter=./apps/www`
  - `pnpm turbo typecheck --filter=./packages/dnd --filter=./apps/www`
  - `pnpm lint:fix`
  - `dev-browser --connect http://127.0.0.1:9222` verification on `/` and `/cn` with no console errors, no page errors, and no `Expected drag drop context` crash text
