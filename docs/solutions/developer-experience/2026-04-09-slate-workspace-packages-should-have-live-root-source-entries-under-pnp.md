---
title: Slate workspace packages should have live root source entries under PnP
type: solution
date: 2026-04-09
status: completed
category: developer-experience
module: slate-v2
tags:
  - slate
  - slate-v2
  - yarn-pnp
  - workspace
  - package-entry
  - source-resolution
---

# Problem

The first failure showed up in `slate-hyperscript`, but the underlying issue was
broader: workspace package-name imports were leaning on built `dist/` entries.

That works until it doesn't.

Under Yarn PnP, once a package root resolves through dead or stale `dist/`
output, tests and source-time tooling can fail for reasons that have nothing to
do with the actual source package.

# Root Cause

Most workspace packages had `src/index.ts`, but no root `index.ts`.

That left package-name imports overly dependent on published-entry metadata and
prebuilt output even inside the workspace itself.

# Solution

Use both:

1. a tiny live root source entry in each workspace package:

```ts
export * from './src'
```

for:

- `slate`
- `slate-history`
- `slate-react`
- `slate-dom`
- `slate-browser`
- `slate-hyperscript`

2. a test-time module alias layer for Babel/Mocha lanes so package-name imports
   resolve to live source instead of stale `dist/` when `dist/` happens to
   exist

# Why This Works

The root entry gives the workspace a source-resolvable package fallback without
changing the real authored module surface.

The Babel alias closes the other half of the trap: if `dist/` exists, Node/PnP
can still prefer it. For source-time proof lanes, the alias forces live source.

# Prevention

- If a workspace package is meant to be imported by package name during local
  proof or test work, give it a live root source entry.
- If source-time test lanes use Babel/Mocha, alias package names to source so
  stale `dist/` cannot silently win.
- Do not let workspace reliability depend on `dist/` luck.
- Tiny package-root files beat mysterious resolution failures every time.
