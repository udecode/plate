# RSC Client Boundary Root-Cause Investigation

## Goal

Find the real reason `apps/www` needs a package-level React client boundary on this branch, even though `origin/main` builds without it in the same environment.

## Current Facts

- `origin/main` clean worktree builds `apps/www` without `packages/plate/src/react/index.tsx` containing `'use client'`.
- This branch fails if that line is removed.
- The stable failure stays on:
  - `packages/core/src/react/components/EditorHotkeysEffect.tsx`
  - `packages/core/src/react/components/PlateContent.tsx`
  - `packages/core/src/react/plugins/event-editor/useFocusEditorEvents.ts`
- The first known bad commit is `1efb71b9a Simplify discussion UI`.

## Already Ruled Out

- local build cache
- `playground-demo.tsx` console logging
- `suggestion-shared.ts` / static helper placement
- `TrailingBlockKit`
- app-local proxy entry experiments
- simple `tsconfig` alias rewrites
- `serverExternalPackages`
- `slate` version drift alone

## Best Current Hypothesis

Something introduced by `1efb71b9a` changes the app import graph enough that Next/Turbopack starts analyzing the `platejs/react` graph as part of a server path on this branch but not on `origin/main`.

## Next Checks

1. Compare the exact import graph changes introduced by `1efb71b9a` around app routes, registry exposure, and generated registry output.
2. Identify the first server-side entry that starts pulling `platejs/react` on this branch.
3. Fix that graph edge instead of keeping `'use client'` at the package entry if possible.

## Result

- The misleading page trace was not the root cause.
- The decisive server path was:
  - `src/app/api/registry/[name]/route.ts`
  - `src/lib/rehype-utils.ts`
  - generated `src/__registry__/index.tsx`
- `trailing-block-kit` being exposed as a registry item pulled `@platejs/suggestion/react` into that server graph.
- The durable fix was not deleting the kit forever.
- The durable fix was converting `trailing-block-kit` into a real client-only kit (`.tsx` + `'use client'`) before exposing it through the registry.
