---
title: Plate init routes should return shadcn registry base items
date: 2026-05-24
category: developer-experience
module: apps/www registry init
problem_type: developer_experience
component: tooling
symptoms:
  - "The shadcn restart comparison called out init/create flow, but Plate had no /init route"
  - "A tempting Plate /init shape was a components.json endpoint, which the shadcn CLI does not treat as init"
  - "MCP docs still showed @platejs while templates and install commands use @plate"
root_cause: wrong_api
resolution_type: migration
severity: medium
tags: [shadcn, registry, init, namespace, docs]
---

# Plate init routes should return shadcn registry base items

## Problem

Upstream shadcn's `/init` route is part of the CLI bootstrap contract. It returns a `registry:base` item whose `config` is merged into `components.json`; it is not a generic `components.json` download endpoint.

Plate needed an init surface for the shadcn-base restart, but copying upstream v0/create behavior would bring in the wrong product flow.

## Symptoms

- `apps/www` had `/view/[name]` parity but no `/init` or `/init.md` route.
- The comparison doc explicitly kept upstream init/create rewrites only when useful for Plate.
- Plate templates and UI used `@plate`, while `content/docs/installation/mcp*.mdx` still documented `@platejs`.

## What Didn't Work

- Returning raw `components.json` from `/init`. The shadcn CLI expects a registry item there; a config-only endpoint would look useful in a browser and still be the wrong installer API.
- Porting upstream `/init/v0`. Plate does not own the v0 generation flow, and keeping v0 routes is fork residue.
- Treating the MCP docs typo as harmless. The namespace is the install contract, so `@platejs` sends users and agents toward a registry that templates do not configure.

## Solution

Add a shared Plate registry config and expose it through a shadcn `registry:base` item:

```ts
export const plateComponentsJsonConfig = {
  $schema: 'https://ui.shadcn.com/schema.json',
  style: 'new-york',
  rsc: true,
  tsx: true,
  tailwind: {
    config: '',
    css: 'src/app/globals.css',
    baseColor: 'neutral',
    cssVariables: true,
    prefix: '',
  },
  aliases: {
    components: '@/components',
    utils: '@/lib/utils',
    ui: '@/components/ui',
    lib: '@/lib',
    hooks: '@/hooks',
  },
  iconLibrary: 'lucide',
  registries: {
    '@plate': 'https://platejs.org/r/{name}.json',
  },
} as const;
```

Then validate the init payload with the upstream shadcn schema:

```ts
export const plateInitRegistryItem = registryItemSchema.parse({
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'plate',
  title: 'Plate',
  description: 'Initialize a shadcn project with the Plate registry.',
  type: 'registry:base',
  extends: 'none',
  config: plateComponentsJsonConfig,
  registryDependencies: ['@plate/editor-basic'],
});
```

Expose:

- `/init` -> JSON `registry:base`
- `/init/md` -> markdown instructions
- `/init.md` -> rewrite to `/init/md`

Keep `/init/v0` absent, and fix MCP docs snippets to use `@plate`.

## Why This Works

`shadcn init --preset https://platejs.org/init` resolves the first component as a registry item. When that item is `registry:base`, the CLI extracts its `config`, merges it into `components.json`, filters built-in registries, and then installs the item dependencies.

That gives Plate the one bootstrap it actually needs: configure the `@plate` namespace and install `@plate/editor-basic`, while leaving upstream create/v0 product features out of the Plate docs app.

## Prevention

- For init routes, check upstream shadcn CLI source before inventing endpoint shapes. The relevant path is `packages/shadcn/src/commands/init.ts` and `packages/shadcn/src/preset/presets.ts`.
- Validate Plate init payloads with `registryItemSchema` from `shadcn/schema`.
- Add a narrow test that asserts `type: "registry:base"`, `extends: "none"`, `config.registries["@plate"]`, and the `@plate/editor-basic` dependency.
- Smoke `/init`, `/init.md`, and `/init/v0` together. The last one should stay 404 unless Plate intentionally adopts a real v0 flow.
- Search docs for stale namespace snippets when changing install contracts:

```bash
rg -n '"@platejs"|@platejs": "https://platejs.org/r' content/docs apps/www/src
```

## Related Issues

- [Shadcn registry install commands should use configured namespaces](./2026-05-24-shadcn-registry-install-commands-should-use-configured-namespaces.md)
- [Shadcn v4 registry schema needs source-only validation](./2026-05-24-shadcn-v4-registry-schema-needs-source-only-validation.md)
- [Shadcn docs restarts need a keep/throw comparison first](../best-practices/2026-05-23-shadcn-docs-restart-comparison.md)
