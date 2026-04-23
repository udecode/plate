---
title: Next 16 example imports must use explicit maps and drop next config eslint
date: 2026-04-16
category: developer-experience
module: slate-v2 site upgrade
problem_type: developer_experience
component: tooling
symptoms:
  - upgrading the slate-v2 site from Next 14 to Next 16 exposed an invalid `eslint` key in `next.config.js`
  - the example page's template-string dynamic import caused Next 16 to bundle `site/examples/ts/custom-types.d.ts` as if it were a route module
  - the site build stayed red even though package build, typecheck, lint, and tests were already green under React 19.2
root_cause: config_error
resolution_type: dependency_update
severity: medium
tags: [slate-v2, next-16, webpack, dynamic-import, custom-types, react-19]
---

# Next 16 example imports must use explicit maps and drop next config eslint

## Problem

The tranche-2 upgrade moved `slate-v2` to Next 16.

That exposed two stale assumptions from the older site setup: `next.config.js`
still carried a now-invalid `eslint` block, and the example page still used a
template-string dynamic import that let the route bundle crawl files it should
never try to compile.

## Symptoms

- `next build` warned that `eslint` is no longer a supported `next.config.js`
  option.
- The production build failed on
  `site/examples/ts/custom-types.d.ts` with `Module parse failed: Unexpected token`.
- The import trace pointed back to `site/pages/examples/[example].tsx`.

## What Didn't Work

- Keeping the old `eslint.ignoreDuringBuilds` config and hoping Next 16 would
  ignore it.
- Using `dynamic(() => import(\`../../examples/ts/${path}\`))` for the example
  page loader.

That template string was too broad for the newer Next 16 pass. It let the build
pull `.d.ts` files into the route bundle.

## Solution

Fix the site at the exact Next 16 compatibility points:

1. Remove the unsupported `eslint` key from
   [next.config.js](/Users/zbeyens/git/slate-v2/site/next.config.js).
2. Drop the forced `--webpack` path and let Next 16 run on its default
   Turbopack build/dev lane.
3. Replace the template-string dynamic import in
   [site/pages/examples/[example].tsx](/Users/zbeyens/git/slate-v2/site/pages/examples/[example].tsx)
   with an explicit importer map.

Shape of the fix:

```tsx
const EXAMPLE_IMPORTERS: Record<
  string,
  () => Promise<{ default: React.ComponentType }>
> = {
  richtext: () => import('../../examples/ts/richtext'),
  tables: () => import('../../examples/ts/tables'),
  // ...
}

dynamic(EXAMPLE_IMPORTERS[path], {
  loading: path === 'huge-document' ? HugeDocumentLoader : ComponentLoader,
})
```

## Why This Works

Next 16 is stricter about site config and about what its route bundler will
include from a dynamic import context.

Removing the invalid config gets the build back onto a supported path.
Using an explicit importer map narrows the bundle graph to real example modules
only, so declaration files like `custom-types.d.ts` stop being treated like
runtime code.

## Prevention

- When upgrading Next majors, assume `next.config.js` keys may have moved or
  died; do not carry old config forward on faith.
- For route-level dynamic imports in example galleries, prefer explicit importer
  maps over template-string import contexts.
- If a Next 16 build starts parsing `.d.ts` files as modules, check for a broad
  dynamic import before touching the declaration file itself.

## Related Issues

- [Slate custom types path recovery must not reintroduce global ambient site augmentation](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-15-slate-custom-types-path-recovery-must-not-reintroduce-global-ambient-site-augmentation.md)
- [Slate v2 fresh-branch migration plan](/Users/zbeyens/git/plate-2/docs/slate-v2/fresh-branch-migration-plan.md)
