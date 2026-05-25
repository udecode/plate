---
date: 2026-04-12
problem_type: developer_experience
component: tooling
root_cause: missing_tooling
title: Package type publishing should sync lib declarations into dist in one build step
tags:
  - slate-v2
  - rollup
  - typescript
  - declarations
  - packaging
severity: high
---

# Package type publishing should sync lib declarations into dist in one build step

## What happened

`slate-react` and `slate-dom` publish runtime files from `dist/`, but their
package `types` entry also points into `dist/`.

The build pipeline was producing declarations under `lib/`, not under `dist/`.
That left local builds in a stupid state:

- runtime bundles were fresh
- published type paths were stale or missing
- `site` only saw the new types after a manual declaration copy

That manual copy was not a product fix.
It was a packaging gap.

## What fixed it

Make declaration syncing part of the normal Rollup build.

The clean version here is:

1. keep Rollup producing the runtime bundles
2. let the TypeScript side keep emitting declarations under `lib/`
3. after Rollup finishes, run one repo-level sync step that:
   - reads each package `types` path from `package.json`
   - maps `dist/...` to the matching `lib/...` declaration tree
   - removes stale declaration files from the target
   - copies only `.d.ts` and `.d.ts.map` files into the published `dist/` path

That keeps the published package layout honest without needing manual local
commands.

## Why this matters

When package type paths drift from package runtime paths, local verification
lies.

The build can look green while downstream packages still read stale public
types.

## Reusable rule

If a package publishes JS from `dist/` but TypeScript declarations are emitted
under `lib/`, do not rely on ad-hoc manual copying.

Make the declaration sync a real build step and verify downstream consumers
against the published `types` path, not against internal compiler output.
