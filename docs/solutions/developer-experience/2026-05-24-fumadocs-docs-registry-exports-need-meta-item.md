---
title: Fumadocs docs registry exports need meta item
date: 2026-05-24
category: developer-experience
module: apps/www docs registry
problem_type: developer_experience
component: documentation
symptoms:
  - "docs registry export scanned MDX files but omitted Fumadocs meta.json"
  - "build-docs-registry still carried stale docsConfig/pathMap generation scaffolding"
  - "installed docs could miss the navigation authority used by the app"
root_cause: missing_workflow_step
resolution_type: code_fix
severity: medium
tags: [fumadocs, registry, meta-json, shadcn, docs]
---

# Fumadocs docs registry exports need meta item

## Problem

After docs navigation moves to Fumadocs `meta.json` and `pageTree`, the docs registry export must publish that metadata too. Exporting only MDX files leaves installed docs without the navigation source the app itself relies on.

## Symptoms

- `build-docs-registry.mts` created registry items from `content/**/*.mdx`, but did not include `content/meta.json`.
- The script still imported `docsConfig` and carried old pathMap/meta generation code that was not part of the active export path.
- `check-docs-source-parity.mts` asserted representative MDX docs and aggregate dependencies, but not the Fumadocs metadata file.

## What Didn't Work

- Keeping a commented sidecar `docs-meta.json` writer. It would bypass shadcn registry dependency resolution instead of making metadata a first-class registry item.
- Rebuilding metadata from `docsConfig` inside the registry export. That recreates the old TypeScript navigation authority after the app has already moved to committed Fumadocs metadata.

## Solution

Publish `content/meta.json` as a normal registry item:

```ts
const docsMetaItem: RegistryItem = {
  description: `Fumadocs metadata for ${NAME} documentation`,
  files: [
    {
      path: `${RELATIVE_SOURCE_DIR}/meta.json`,
      target: `content/docs/${NAME}/meta.json`,
      type: 'registry:file',
    },
  ],
  name: 'docs-meta',
  title: 'Documentation metadata',
  type: 'registry:file',
};
```

Then make the aggregate docs item depend on it through the same namespace resolver as the MDX docs:

```ts
registryDependencies: [docsMetaItem, ...items].map((item) =>
  toRegistryDependencySpecifier(item.name)
);
```

Extend the parity check so `www` typecheck proves the metadata export:

```ts
assert(itemsByName.has('docs-meta'), 'Expected registry docs meta item');
assert(
  docsItem?.registryDependencies?.includes('@plate/docs-meta'),
  'Expected docs aggregate item to depend on @plate/docs-meta'
);
```

## Why This Works

Fumadocs `meta.json` is not auxiliary output; it is part of the docs source contract. Making it a registry item keeps the install graph self-contained and lets shadcn v4 resolve it with the same `@plate/*` namespace behavior used for the rest of the Plate docs registry.

Removing the stale `docsConfig` generation branch matters because it prevents two navigation authorities from quietly diverging again.

## Prevention

- Treat metadata files as installable source, not build artifacts outside the registry graph.
- Keep `build-docs-registry.mts` reading committed Fumadocs source and metadata instead of regenerating navigation from TS config.
- Assert representative metadata items in `check-docs-source-parity.mts` so `pnpm --filter www typecheck` catches export drift.
- Do not restore sidecar registry files unless shadcn cannot represent the dependency as a normal registry item.

## Related Issues

- [Fumadocs pageTree search needs locale-safe metadata](./2026-05-24-fumadocs-page-tree-search-needs-locale-safe-metadata.md)
- [Shadcn registry install commands should use configured namespaces](./2026-05-24-shadcn-registry-install-commands-should-use-configured-namespaces.md)
- [Shadcn v4 registry schema needs source-only validation](./2026-05-24-shadcn-v4-registry-schema-needs-source-only-validation.md)
