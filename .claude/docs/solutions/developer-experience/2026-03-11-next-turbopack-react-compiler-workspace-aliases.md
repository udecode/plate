---
module: Docs App
date: 2026-03-11
problem_type: developer_experience
component: tooling
symptoms:
  - "Docs app crashes in dev with useMemoCache size mismatch under React Compiler"
  - "Workspace package edits do not participate in app HMR"
  - "Turbopack mixes or stalls on workspace package resolution"
root_cause: config_error
resolution_type: config_change
severity: high
tags:
  - nextjs
  - turbopack
  - react-compiler
  - pnpm-workspace
  - hmr
---

# Next Turbopack + React Compiler + workspace packages

## Problem

The docs app runs inside a pnpm workspace and consumes many local packages.

Two dev setups both break in different ways:

1. `dist` in dev with React Compiler on:
   - package `dist` files already contain `react-compiler-runtime`
   - Turbopack recompiles the app graph
   - React Compiler hook cache shapes drift and explode with `useMemoCache` size mismatch
2. `src` aliases in tsconfig with React Compiler on:
   - the app can still end up with an unstable workspace graph
   - HMR and compiler behavior get flaky fast

## Fix

Use a split dev/prod strategy in `apps/www`:

- dev:
  - `reactCompiler: false`
  - `experimental.externalDir: true`
  - `turbopack.resolveAlias` points workspace package imports to package `src` entrypoints
  - keep `apps/www/tsconfig.json` boring; do not use package path remaps there
- prod:
  - `reactCompiler: true`
  - normal package resolution through package exports / `dist`

## Why

- Dev wants source entrypoints so package edits flow through the app graph and participate in HMR.
- Prod wants the normal package contract and can safely compile once.
- Putting workspace package remaps in app tsconfig is the wrong layer. `better-convex` keeps tsconfig local-only and lets the bundler own package resolution.

## Gotcha

Turbopack `resolveAlias` targets must be app-relative import paths, not absolute filesystem paths.

Absolute paths produced errors like:

- `Module not found: Can't resolve './Users/.../packages/core/src/index.ts'`
- `server relative imports are not implemented yet`

Use relative paths from `apps/www`, normalized to forward slashes.

## Verification

- fresh `next dev` on `http://localhost:3000` served `/` with `200 OK`
- browser loaded without the `useMemoCache` overlay
- `.next/dev/static/chunks` contained `packages_*_src_*` chunks, proving dev now resolves package source files instead of package `dist`

