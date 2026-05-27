---
title: Registry API routes need output file tracing for source-backed code tabs
date: 2026-05-26
category: runtime-errors
module: apps/www registry API
problem_type: runtime_error
component: tooling
symptoms:
  - "BlockViewer code tabs work locally but can 500 in standalone production"
  - "`/api/registry/[name]` reads registry source files through `fs` at request time"
  - "Next output tracing can miss `src/registry/**` when the route include is removed"
root_cause: missing_include
resolution_type: config_change
severity: medium
tags: [nextjs, output-file-tracing, registry, block-viewer, standalone]
---

# Registry API routes need output file tracing for source-backed code tabs

## Problem

The registry API route powers lazy code-tab hydration for docs and block viewers. In a standalone Next production build, that route needs explicit output tracing for the source files it reads dynamically.

Without the include, local dev still works, but deployed `/api/registry/[name]` responses can fail when `getRegistryItem()` tries to read files that were not bundled.

## Symptoms

- `BlockViewer` has enough prefetched data for the initial file, then calls `/api/registry/[name]` for full highlighted source.
- `apps/www/src/app/api/registry/[name]/route.ts` calls `getRegistryItem(name)` and `highlightFiles(item.files)`.
- `getRegistryItem()` resolves dependencies and calls `fs.readFile(...)` against `src/registry/**`.
- A branch can pass local focused tests while standalone production lacks those source files.

## What Didn't Work

- Only tracing docs pages. `/docs/[[...slug]]` and `/cn/docs/[[...slug]]` need registry files for MDX-rendered previews, but the API route is a separate runtime entry.
- Relying on local dev or unit tests. The filesystem is complete locally, so missing standalone trace includes do not reproduce there.
- Treating the route as static enough because it has `dynamic = 'force-static'`. Static generation still needs the files that the route's code reads while generating JSON.

## Solution

Keep an explicit tracing include for the registry API route in `apps/www/next.config.ts`:

```ts
outputFileTracingIncludes: {
  '/api/registry/[name]': ['./src/registry/**/*', './public/r/**/*'],
  '/cn/docs/[[...slug]]': ['./src/registry/**/*', './public/r/**/*'],
  '/docs/[[...slug]]': ['./src/registry/**/*', './public/r/**/*'],
}
```

That include belongs next to the docs route includes because they all consume the same source-backed registry graph.

## Why This Works

Next output file tracing follows static imports, but `getRegistryItem()` builds file paths from registry metadata and reads them through `fs`. Those paths are data-driven, so the standalone bundle needs an explicit include.

`/api/registry/[name]` is the route that hydrates non-initial code-tab files. Bundling `src/registry/**` for docs pages alone does not cover that API entry.

## Prevention

- When changing `outputFileTracingIncludes`, search for every runtime route that calls `getRegistryItem()` or reads registry files:

```bash
rg -n "getRegistryItem\\(|fs\\.readFile|src/registry" apps/www/src apps/www/scripts
```

- Keep `/api/registry/[name]`, `/docs/[[...slug]]`, and `/cn/docs/[[...slug]]` tracing aligned unless a route no longer reads registry source.
- Include the registry API route in code-review checklists for BlockViewer, ComponentPreview, and docs-code changes.
- Local tests prove the route logic, not standalone bundling. Use `next.config.ts` tracing assertions or review checks for production bundle coverage.

## Related Issues

- [Shadcn registry install commands should use configured namespaces](../developer-experience/2026-05-24-shadcn-registry-install-commands-should-use-configured-namespaces.md)
- [Registry routes must not pull client-only trailing block helpers into the server graph](../developer-experience/2026-04-06-next-turbopack-needs-client-boundaries-at-react-package-entrypoints.md)
