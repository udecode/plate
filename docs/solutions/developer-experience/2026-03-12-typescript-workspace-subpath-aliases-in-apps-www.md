---
module: Docs App
date: 2026-03-12
problem_type: developer_experience
component: tooling
symptoms:
  - "`apps/www` typecheck mixes `packages/*/src` and `packages/*/dist` types after pnpm workspace linking"
  - "`platejs/react` resolves to package source while `@platejs/ai/react` and similar imports fall back to package `dist`"
  - "TypeScript reports deep `SlateEditor` and plugin incompatibilities that disappear or move when local package `dist` is rebuilt"
root_cause: config_error
resolution_type: config_change
severity: high
tags:
  - typescript
  - tsconfig-paths
  - pnpm-workspace
  - nextjs
  - hmr
  - tooling
---

# TypeScript workspace subpath aliases in `apps/www`

## Problem

After `apps/www` moved to pnpm workspace packages, dev and typecheck stopped talking about the same code.

In dev, `next.config.ts` already pointed workspace imports at package `src` entrypoints for HMR. But `tsc` in `apps/www` still resolved many `@platejs/*/react` imports through the linked package exports in `dist`.

That created a split-brain graph:

- dev/HMR used package source
- TypeScript used a mix of package source and package `dist`
- once `src` and `dist` both entered the same program, the error output became nonsense-heavy and misleading

The clearest symptom was that `platejs/react` resolved to source while imports like `@platejs/ai/react` resolved to `packages/ai/dist/react/index.d.ts`.

## What Didn't Work

### 1. Copying the dev alias idea into tsconfig with wildcard subpath rules

This looked reasonable:

- `@platejs/*/react`
- `@platejs/*/static`

But TypeScript did not treat those rules like the bundler alias map.

The broad `@platejs/*` rule absorbed imports like `@platejs/core/react` with `* = core/react`, so the intended `/react` rule never actually won. TypeScript then fell back to the linked package export and loaded `dist`.

### 2. Chasing the resulting type errors inside package source

Once `src` and `dist` types were mixed, the app started throwing huge incompatibility chains involving `SlateEditor`, plugin config types, and internal generated `dist` symbols.

Those errors were downstream noise. Rebuilding package `dist` could change which errors appeared, but it did not fix the actual resolution split.

## Fix

Use a split typecheck strategy and make the app tsconfig explicit:

1. Keep `apps/www` app code on a source graph.
2. Keep package-integration tests on the built package contract.
3. Stop relying on wildcard subpath aliases for `react` and `static`.

In `apps/www/package.json`, the typecheck flow stays split:

- `tsconfig.json` checks the app and its workspace-source graph
- `tsconfig.package-integration.json` checks `src/__tests__/package-integration/**` against linked package `dist`

In `apps/www/tsconfig.json`:

- keep the broad `@platejs/*` rule only for package root imports
- add exact aliases for:
  - `platejs/react`
  - `platejs/static`
  - every real `@platejs/<pkg>/react`
  - every real `@platejs/<pkg>/static`
- include package-side ambient declarations:
  - `../../packages/*/src/**/*.d.ts`
  - `../../packages/udecode/*/src/**/*.d.ts`

That second part matters. Once the app typechecks package source directly, ambient declarations that package builds normally see must also be in the app TS program. A concrete example is `packages/code-drawing/src/types/viz.d.ts`, which provides the missing declarations for `viz.js/full.render`.

## Why This Works

The fix removes ambiguity.

Before the change, the app had two competing truths:

- Next dev resolved package subpaths through explicit source aliases
- TypeScript tried to emulate that with wildcard `paths`, but its matching behavior was different enough to leak `dist`

After the change:

- app/runtime imports resolve to exact source entrypoints
- package-integration tests resolve to built package exports on purpose
- source and `dist` no longer enter the same TypeScript program by accident

That puts HMR, editor types, and `tsc` back on the same page.

## Gotchas

### Exact aliases are the important part

If you only add more wildcard rules, you are still gambling on TypeScript path matching semantics. Use exact `@platejs/<pkg>/react` and `@platejs/<pkg>/static` entries instead.

### Include ambient `.d.ts` files from package source

Source-only typecheck can surface missing module declarations that package builds already know about. If those declarations live in package source, the app tsconfig must include them.

### Sanity-check the program, not just the error list

This command is a fast truth serum:

```bash
pnpm --dir apps/www exec tsc --noEmit -p tsconfig.json --listFilesOnly | rg '/packages/.*/dist/'
```

For the app source graph, it should print nothing.

## Verification

These commands passed after the fix:

```bash
pnpm --dir apps/www exec tsc --noEmit -p tsconfig.json
pnpm --dir apps/www exec tsc --noEmit -p tsconfig.package-integration.json
pnpm --dir apps/www typecheck
bun lint:fix
bun typecheck
```

## Related Issues

- See also: [Next Turbopack + React Compiler + workspace packages](./2026-03-11-next-turbopack-react-compiler-workspace-aliases.md)
