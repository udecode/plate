---
module: Docs App
date: 2026-03-28
problem_type: developer_experience
component: tooling
symptoms:
  - "Next production build started failing while prerendering `/cn`, `/dev`, and `/blocks/editor-ai`"
  - "Build output showed `Invariant Violation: Expected drag drop context`"
  - "Client editor demo routes only failed during prerender, not during normal browser interaction"
root_cause: config_error
resolution_type: config_change
severity: high
tags:
  - nextjs
  - react-dnd
  - ssr
  - prerender
  - dnd
  - plate
---

# Next prerendered client editors need DnD hooks to noop on the server

## Problem

Upgrading `apps/www` from `next@16.1.6` to `next@16.2.1` exposed a latent prerender failure in editor demo pages that include Plate drag-and-drop UI.

The failure was not that the app forgot to render a `DndProvider`. The app already wrapped relevant trees with `DndProvider`, but `@platejs/dnd` still executed `react-dnd` hooks during server prerender, where browser drag-and-drop does not exist.

## What Didn't Work

### 1. Treating this like an app-level provider bug

That diagnosis was wrong.

`apps/www` already had `DndProvider` wrappers in:

- [`apps/www/src/registry/components/editor/plugins/dnd-kit.tsx`](/Users/zbeyens/git/plate/apps/www/src/registry/components/editor/plugins/dnd-kit.tsx)
- [`apps/www/src/components/context/providers.tsx`](/Users/zbeyens/git/plate/apps/www/src/components/context/providers.tsx)

Adding more provider plumbing would only shuffle the problem around.

### 2. Hiding affected routes behind `dynamic(..., { ssr: false })`

That avoids the crash, but it is the wrong layer.

The bug lives in the package behavior, not in the route definitions. If a browser-only DnD hook cannot survive server prerender, the DnD package should degrade gracefully instead of forcing every app surface to opt out of prerender manually.

## Solution

Make `@platejs/dnd` return inert drag/drop connectors when DOM DnD is unavailable.

Add a small environment utility:

- [`packages/dnd/src/utils/dndEnvironment.ts`](/Users/zbeyens/git/plate/packages/dnd/src/utils/dndEnvironment.ts)

Then guard the hook entry points:

- [`packages/dnd/src/hooks/useDragNode.ts`](/Users/zbeyens/git/plate/packages/dnd/src/hooks/useDragNode.ts)
- [`packages/dnd/src/hooks/useDropNode.ts`](/Users/zbeyens/git/plate/packages/dnd/src/hooks/useDropNode.ts)
- [`packages/dnd/src/hooks/useDndNode.ts`](/Users/zbeyens/git/plate/packages/dnd/src/hooks/useDndNode.ts)

The essential behavior is:

```ts
if (!canUseDomDnd()) {
  return inertStateAndNoopConnectors;
}
```

That keeps drag-and-drop fully active in the browser while making prerender paths safe.

Add a regression test:

- [`packages/dnd/src/components/useDraggable.spec.tsx`](/Users/zbeyens/git/plate/packages/dnd/src/components/useDraggable.spec.tsx)

The test forces the no-DOM path and asserts that `react-dnd` hooks are not called.

## Why This Works

`react-dnd` is a browser interaction layer. Server prerender has no real drag backend, so calling `useDrag` / `useDrop` there is a category error.

The correct contract is:

- on the server: no-op DnD state
- in the browser: real DnD behavior

Once the package follows that contract, prerendered client editor routes stop exploding and app routes do not need ad hoc lazy-loading wrappers.

## Gotchas

### Provider presence can be a red herring

If build output says `Expected drag drop context`, do not assume the app forgot `DndProvider`.

First check whether the failing path is server prerender. If it is, the more likely issue is that a browser-only hook is being called too early.

### Fix the package, not every route

If the same editor surface appears in multiple routes, route-level `ssr: false` wrappers become whack-a-mole fast. A package-level no-op path is the durable fix.

### The official Next upgrader may surface unrelated repo script failures

In this repo, `next upgrade` updated the manifest and lockfile correctly, but its install step failed on the root `prepare` script because of an existing `skiller` config problem unrelated to Next itself.

## Verification

These commands passed after the fix:

```bash
bun test /Users/zbeyens/git/plate/packages/dnd/src/components/useDraggable.spec.tsx
pnpm --filter @platejs/dnd build
pnpm --filter @platejs/dnd typecheck
pnpm -C apps/www build
pnpm -C apps/www typecheck
pnpm lint:fix
```
