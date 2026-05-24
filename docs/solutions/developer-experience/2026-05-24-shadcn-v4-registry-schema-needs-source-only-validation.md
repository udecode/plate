---
title: Shadcn v4 registry schema needs source-only validation
date: 2026-05-24
category: developer-experience
module: apps/www registry
problem_type: developer_experience
component: tooling
symptoms:
  - "Plate docs migration still imported registry schema and types from shadcn/registry after upgrading toward shadcn v4"
  - "The comparison doc called for shadcn v4 registry behavior, but apps/www still depended on shadcn@2.6.3"
  - "Local verification needed registry contract coverage without running the CI-owned registry build"
root_cause: wrong_api
resolution_type: migration
severity: medium
tags: [shadcn, registry, schema, migration, tooling]
---

# Shadcn v4 registry schema needs source-only validation

## Problem

Shadcn v4 moved the registry schema and registry item types to the `shadcn/schema` export. Keeping Plate on `shadcn@2.6.3` and `shadcn/registry` meant the docs migration could look aligned with upstream while still compiling against the old registry contract.

Plate also cannot use a local registry build as the normal proof point, because registry build output is CI-owned in this repo.

## Symptoms

- Registry builders and registry-consuming UI imported `Registry`, `RegistryItem`, `registryItemSchema`, and `registryItemFileSchema` from `shadcn/registry`.
- `apps/www/package.json` still pinned `shadcn` to `2.6.3`, while the upstream comparison target uses `shadcn@4.8.0`.
- `build-registry.mts` validated only the item array, not the full registry shape that shadcn v4 validates.
- There was no source-only check proving Plate's authored registry composition still satisfied the shadcn v4 schema.

## What Didn't Work

- Treating namespace fixes as enough. `@plate/*` dependency specifiers align installer behavior, but they do not prove the package-level schema contract is v4.
- Running the local registry build as the default check. That violates the repo rule that registry build output belongs to CI.
- Validating raw `registry` export directly. `build-registry.mts` adds `plate-ui` to block dependencies before validation, so the check has to mirror the builder composition.

## Solution

Upgrade `apps/www` to the upstream shadcn package version and move schema/type imports to the v4 export:

```ts
import {
  type Registry,
  type RegistryItem,
  registrySchema,
} from 'shadcn/schema';
```

Validate the full generated registry object in the registry builders:

```ts
const registry: Registry = registrySchema.parse({
  name: 'plate',
  homepage: 'https://platejs.org',
  items: registryItems.map((item) => ({
    ...item,
    registryDependencies: item.registryDependencies?.map(
      toRegistryDependencySpecifier
    ),
  })),
});
```

Add a source-only check that mirrors the builder's authored registry composition without writing generated output:

```ts
const normalizedRegistry = registrySchema.parse({
  homepage: 'https://platejs.org',
  name: 'plate',
  items: [
    ...registryInit,
    ...registryUI,
    ...registryComponents,
    ...registryBlocks.map((block) => ({
      ...block,
      registryDependencies: ['plate-ui', ...(block.registryDependencies ?? [])],
    })),
    ...registryLib,
    ...registryStyles,
    ...registryHooks,
    ...registryExamples,
  ].map((item) => ({
    ...item,
    registryDependencies: item.registryDependencies?.map(
      toRegistryDependencySpecifier
    ),
  })),
});
```

Wire that check into `apps/www` typecheck so every PR validates the v4 contract:

```json
{
  "typecheck": "pnpm build:source && tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-docs-source-parity.mts && tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts && tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.package-integration.json"
}
```

## Why This Works

The `shadcn/schema` export is the v4 registry data contract. Moving imports there makes TypeScript and runtime validation fail if Plate drifts back to the old package shape.

`registrySchema.parse` validates the same top-level registry shape that the CLI consumes: `name`, `homepage`, and validated `items`. The source-only check gives local confidence without generating or committing registry output.

Mirroring the builder's block dependency injection matters because raw registry source and emitted registry payload are not identical. The contract that users and templates receive is the normalized builder output.

## Prevention

- For shadcn v4 registry work, import schemas and registry types from `shadcn/schema`, not `shadcn/registry`.
- Keep a source-only registry validation script in typecheck; do not use local `build:registry` as the everyday proof.
- When a builder normalizes authored registry data, test the normalized shape rather than the raw export.
- Search for old schema imports before finishing registry work:

```bash
rg -n 'shadcn/registry' apps/www --glob '!apps/www/public/**'
```

## Related Issues

- [Shadcn docs restarts need a keep/throw comparison first](../best-practices/2026-05-23-shadcn-docs-restart-comparison.md)
- [Shadcn registry install commands should use configured namespaces](./2026-05-24-shadcn-registry-install-commands-should-use-configured-namespaces.md)
- [Registry helper refactors must update template registry dependencies](./2026-04-06-registry-helper-refactors-must-update-template-registry-dependencies.md)
