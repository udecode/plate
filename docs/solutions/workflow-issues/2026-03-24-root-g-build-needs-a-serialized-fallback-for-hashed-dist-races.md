---
title: Root G Build Needs A Serialized Fallback For Hashed Dist Races
type: solution
date: 2026-03-24
status: completed
category: workflow-issues
---

# Root G Build Needs A Serialized Fallback For Hashed Dist Races

## Problem

`bun check` got past lint and tests, then died during the warm build step used by root typecheck.

The failure shape looked like this:

- `Could not load ../slate/dist/index.d.ts`
- `Could not resolve './index-<hash>' in ../core/dist/index.d.ts`

It bounced between different packages like `list`, `suggestion`, and `media`, which is the giveaway that the workspace was racing, not that those packages were suddenly broken.

## Root Cause

The repo-wide parallel Turbo build can start a package while a peer workspace dependency still has unstable generated `dist` output.

With `tsdown` and hashed declaration chunks, that means a dependent package can read a `dist` reference before the referenced file exists.

The old wrapper for root typecheck was:

```json
"g:typecheck": "(pnpm g:build || pnpm g:build) && turbo --filter \"./packages/**\" typecheck --only"
```

That is not a fix. It is just two blind retries of the same race.

## Fix

Make [g:build](/Users/zbeyens/git/plate/package.json) smart enough to stabilize itself:

- try the normal parallel Turbo build first
- if it fails, rerun the same build serialized with `--concurrency=1`

Then make `g:typecheck` call that stabilized wrapper once.

## Rule

If a root workspace build fails with shifting hashed-dist import errors, treat it as a build race first.

Do not keep stacking identical parallel retries and calling it strategy. Use a serialized fallback.
