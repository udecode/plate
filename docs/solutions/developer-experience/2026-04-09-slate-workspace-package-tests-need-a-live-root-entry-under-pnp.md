---
title: Slate workspace package tests need a live root entry under PnP
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
  - tests
  - hyperscript
  - package-entry
---

# Problem

The `slate-hyperscript` fixture suite imported the package by name:

```ts
import { jsx } from 'slate-hyperscript'
```

Under the current Yarn PnP workspace, that resolved through the package's
published entry fields to `dist/index.js`, which does not exist before a build.

So the contributor-facing fixture suite was dead even though the source package
itself was fine.

# Root Cause

The package had source under `src/`, but no live root entry for workspace-time
resolution.

PnP did exactly what it was told:

- look at the package root
- follow the package entry fields
- fail on missing `dist/`

# Solution

Add a tiny live root entry:

```ts
export * from './src'
```

at [packages/slate-hyperscript/index.ts](/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/index.ts).

That keeps the workspace package importable from source without changing the
real authored module surface.

# Why This Works

The fixture suite wants package-name imports, not relative `../src` cheats.

A root `index.ts` gives Node+Babel+PnP a source-resolvable fallback after the
dead `dist/` path fails, so workspace tests can run without forcing a build
step just to import the current source.

# Prevention

- If a workspace package test imports the package by name, give it a live root
  source entry or a real source-aware export map.
- Do not assume package tests are green just because the source files look
  unchanged.
- Dead `dist/` resolution under PnP is a packaging seam bug, not a flaky test.
