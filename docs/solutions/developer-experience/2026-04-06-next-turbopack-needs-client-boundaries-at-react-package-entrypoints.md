---
module: Core React Package
date: 2026-04-06
problem_type: developer_experience
component: tooling
symptoms:
  - "Vercel preview deploy failed while GitHub Actions CI still passed"
  - "`pnpm turbo build --filter=./apps/www` failed with `You're importing a module that depends on useEffect/useRef into a React Server Component module`"
  - "The error pointed at hook-using files inside `packages/core/src/react/**` even though the consuming pages were client components"
root_cause: config_error
resolution_type: config_change
severity: high
tags:
  - nextjs
  - turbopack
  - rsc
  - use-client
  - workspace-packages
  - platejs
---

# Next Turbopack needs client boundaries at React package entrypoints

## Problem

`apps/www` started failing its production build in the same way Vercel preview was failing.

The visible error looked like a React hook misuse inside `packages/core`:

```text
You're importing a module that depends on `useEffect` into a React Server Component module.
```

The misleading part was that the consuming pages were already client components. The real issue was that the workspace package entry for `@platejs/core/react` did not declare a client boundary, so Turbopack kept walking into hook-heavy source files as if they were server-safe.

## What Didn't Work

### 1. Treating this like another app-route bug

That was the wrong layer.

The failing stack traces mentioned:

- `packages/core/src/react/components/EditorHotkeysEffect.tsx`
- `packages/core/src/react/components/PlateContent.tsx`
- `packages/core/src/react/plugins/event-editor/useFocusEditorEvents.ts`

Those are package internals. Fixing route files in `apps/www` would only hide the real seam.

### 2. Scattering `use client` across individual hook files first

That would work, but it is the wrong abstraction.

The problem is not that those specific files forgot they are client-only. The problem is that the package entrypoint exporting the React surface failed to tell Next that the whole `react` subpath is client territory.

## Solution

Mark the React entrypoint of `@platejs/core` as a client boundary:

- [`packages/core/src/react/index.ts`](/Users/felixfeng/Desktop/repos/plate-copy/packages/core/src/react/index.ts)

Add:

```ts
'use client';
```

at the top of that file.

That is enough because consumers import the React surface through `platejs/react` or `@platejs/core/react`, both of which flow through this entry.

## Why This Works

Next and Turbopack reason about client/server boundaries from module entrypoints.

`@platejs/core/react` is the React surface of the package. Once that entrypoint is marked with `'use client'`, Next stops trying to treat downstream hook-using modules as server-safe code paths.

That fixes the real contract:

- package React entry: client
- package static/non-React entrypoints: can remain server-safe if designed that way

## Gotchas

### A client page can still surface package-boundary mistakes

The failing app routes were already client pages, but the package they imported still needed its own client boundary.

Do not assume page-level `'use client'` is enough for workspace package internals.

### Vercel can catch this even when other checks are green

In this case:

- GitHub Actions CI passed
- Validate Registry passed
- Vercel failed

That made it easy to misclassify the deploy failure as external noise. It was not noise; it was the only check exercising the real Next production build path that mattered here.

## Verification

These commands passed after the fix:

```bash
pnpm install
pnpm turbo build --filter=./packages/core
pnpm turbo typecheck --filter=./packages/core
pnpm turbo build --filter=./apps/www
pnpm lint:fix
```

## Related Docs

- See also: [Next prerendered client editors need DnD hooks to noop on the server](/Users/felixfeng/Desktop/repos/plate-copy/docs/solutions/developer-experience/2026-03-28-next-prerendered-client-editors-need-dnd-hooks-to-noop-on-the-server.md)
- See also: [Next Turbopack + React Compiler + workspace packages](/Users/felixfeng/Desktop/repos/plate-copy/docs/solutions/developer-experience/2026-03-11-next-turbopack-react-compiler-workspace-aliases.md)
