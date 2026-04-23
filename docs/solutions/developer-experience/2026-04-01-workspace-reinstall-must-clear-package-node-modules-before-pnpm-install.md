---
module: Workspace Tooling
date: 2026-04-01
problem_type: developer_experience
component: tooling
symptoms:
  - '`pnpm test` or `pnpm check` fails before React specs run with `ENOENT reading ".../packages/<pkg>/node_modules/react"`'
  - "Direct Bun package test commands fail even though the same code worked earlier"
  - "`pnpm install` reports the lockfile is up to date but the broken package-local React path stays broken"
root_cause: incomplete_setup
resolution_type: tooling_addition
severity: medium
tags:
  - pnpm
  - bun
  - node-modules
  - react
  - reinstall
  - monorepo
---

# Workspace reinstall must clear package node_modules before pnpm install

## Problem

Local Bun test failures started exploding before the actual spec code ran. The error blamed package-local React paths like `packages/dnd/node_modules/react`, even though the repo installed successfully and the DnD code itself was fine.

## Symptoms

- `bun test packages/dnd/src/DndPlugin.spec.tsx` fails with `ENOENT reading "/Users/.../packages/dnd/node_modules/react"`
- `pnpm check` dies in the fast test lane before reaching the original task
- `pnpm install` says the lockfile is already up to date, but the broken package-local path does not recover

## What Didn't Work

- Re-running `pnpm install` alone. That reused the existing workspace layout and left the dead package-local symlinks in place.
- Looking at DnD code first. The failure happened before the spec even executed, so changing product code would have been cargo cult nonsense.

## Solution

Clear the local JS install state across the workspace, then reinstall once.

This repo now has a dedicated helper:

```bash
pnpm run reinstall
```

The script lives at [`tooling/scripts/reinstall.sh`](tooling/scripts/reinstall.sh). It removes:

- root `node_modules`
- workspace package `node_modules`
- app `node_modules`
- `.turbo`
- `apps/www/.next`
- `apps/www/.contentlayer`
- `tsconfig.tsbuildinfo`

Then it runs:

```bash
pnpm install
```

After that, the previously failing DnD test path worked again:

```bash
bun test packages/dnd/src/DndPlugin.spec.tsx
pnpm --filter @platejs/dnd test src/DndPlugin.spec.tsx
pnpm test
```

## Why This Works

The broken paths were stale package-local symlinks, not missing dependencies in source.

The key clue was that `packages/dnd/node_modules/react` existed as a symlink, but its target under `root/node_modules/.bun/...` no longer existed. `pnpm install` by itself did not repair that state because the workspace install was considered current enough to reuse.

A real reinstall works because it deletes the stale package-local `node_modules` trees before rebuilding the workspace dependency graph.

## Prevention

- When Bun or fast-suite failures complain about `ENOENT` on package-local `node_modules/react`, treat it as local install corruption first.
- Run `pnpm run reinstall` once before touching product code.
- Do not use reinstall as a lazy substitute for real code fixes. If the reinstall does not change the failure shape, go back to normal debugging.

## Related Issues

- [TypeScript 6 upgrade needs explicit paths and Bun test typing](docs/solutions/developer-experience/2026-03-25-typescript-6-upgrade-needs-explicit-paths-and-bun-test-typing.md)
- [Bun module mocks must export a consistent surface across related specs](docs/solutions/test-failures/2026-03-24-bun-module-mocks-must-export-a-consistent-surface-across-related-specs.md)
