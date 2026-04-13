---
module: Docs App Registry
date: 2026-04-06
problem_type: developer_experience
component: tooling
symptoms:
  - "`pnpm --filter ./apps/www build` failed with `You're importing a module that depends on useEffect/useRef into a React Server Component module`"
  - "The stack trace pointed at `packages/core/src/react/**` even though the immediate app files were already client components"
  - "A registry item that imported `@platejs/suggestion/react` without its own client boundary poisoned the server-visible registry graph"
root_cause: config_error
resolution_type: config_change
severity: high
tags:
  - nextjs
  - turbopack
  - rsc
  - registry
  - workspace-packages
  - platejs
---

# Registry routes must not pull client-only trailing block helpers into the server graph

## Problem

`apps/www` production build failed with a React Server Component error that
looked like a package-entry problem:

```text
You're importing a module that depends on `useEffect` into a React Server Component module.
```

The reported files lived under `packages/core/src/react/**`, which made it
tempting to blame `platejs/react`.

That diagnosis was wrong.

## Root Cause

The server-side registry route imports [`src/lib/rehype-utils.ts`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/lib/rehype-utils.ts), and that file statically imports the generated registry index:

- [`src/__registry__/index.tsx`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/__registry__/index.tsx)

Once `trailing-block-kit` was added as a registry item, the generated index
started exposing:

- [`src/registry/components/editor/plugins/trailing-block-kit.tsx`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/components/editor/plugins/trailing-block-kit.tsx)

That helper imports `@platejs/suggestion/react`, which pulls the React editor
graph into a server build path. Turbopack then reports the first hook-using
files it sees in `packages/core/src/react/**`.

The package entrypoint was only the messenger. The real bug was that a
client-only helper became part of the server-visible registry graph.

## What Did Not Fix It

### 1. Adding `'use client'` to `platejs/react`

That masks the bad import graph instead of removing it.

### 2. Moving the directive to `@platejs/core/react` files

That also masks the graph problem and broadens client boundaries for the wrong
reason.

### 3. Treating the error as a generic app-page issue

The page trace was real, but the decisive server-only signal was the registry
route path:

- [`src/app/api/registry/[name]/route.ts`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/app/api/registry/%5Bname%5D/route.ts)
- [`src/lib/rehype-utils.ts`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/lib/rehype-utils.ts)
- [`src/__registry__/index.tsx`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/__registry__/index.tsx)

## Solution

Make `trailing-block-kit` a real client-only kit before exposing it through the
registry.

Concretely:

- implement [`src/registry/components/editor/plugins/trailing-block-kit.tsx`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/components/editor/plugins/trailing-block-kit.tsx) as a `'use client'` file
- keep the `SuggestionPlugin` access inside that client boundary
- let [`EditorKit`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/components/editor/editor-kit.tsx) consume `TrailingBlockKit`
- expose the kit through [`src/registry/registry-kits.ts`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/registry-kits.ts) only after that boundary exists

The problem was not that `trailing-block-kit` existed. The problem was that it
was exposed as a server-visible registry item without declaring that it was
client-only.

## Why This Works

The generated registry index is read by server code. Any registry item added
there must either be server-safe or mark its own client boundary.

With `'use client'` on `trailing-block-kit.tsx`, Turbopack stops treating that
helper as server-safe while keeping the kit available as registry surface.

## Verification

These commands passed after converting the kit to a client-only registry item:

```bash
pnpm install
pnpm --filter ./apps/www build
pnpm turbo typecheck --filter=./apps/www
pnpm lint:fix
```

## Related Docs

- See also: [Registry helper refactors must update template registry dependencies](/Users/felixfeng/Desktop/repos/plate/docs/solutions/developer-experience/2026-04-06-registry-helper-refactors-must-update-template-registry-dependencies.md)
- See also: [Next Turbopack + React Compiler + workspace packages](/Users/felixfeng/Desktop/repos/plate/docs/solutions/developer-experience/2026-03-11-next-turbopack-react-compiler-workspace-aliases.md)
