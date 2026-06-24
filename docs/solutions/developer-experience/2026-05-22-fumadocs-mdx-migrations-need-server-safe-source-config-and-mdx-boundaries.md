---
title: Fumadocs MDX migrations need server-safe source config and MDX boundaries
date: 2026-05-22
category: developer-experience
module: apps/www docs
problem_type: developer_experience
component: documentation
symptoms:
  - "fumadocs-mdx failed after the source config imported the generated registry component graph"
  - "next build failed with Invalid element at key component: expected a Zod schema"
  - "prerender failed when PackageInfo called Jotai from a server-rendered MDX component"
  - "Radix AccordionItem crashed when APIItem children were rendered outside an Accordion root"
  - "typecheck rejected source.config.ts because unified plugin versions exposed incompatible vfile types"
root_cause: config_error
resolution_type: migration
severity: medium
tags: [fumadocs, mdx, next-build, registry, zod, docs]
---

# Fumadocs MDX migrations need server-safe source config and MDX boundaries

## Problem

Migrating `apps/www` docs from Contentlayer to Fumadocs MDX exposed several build-only failures that did not show up when the `.source` index generated successfully.

The migration worked only after the source config, registry helpers, and MDX component map were treated as separate contracts instead of one broad shared graph.

## Symptoms

- `fumadocs-mdx` tried to load registry/client code through the source config and failed in unrelated transitive imports.
- `next build` failed on every MDX page with `Invalid element at key "component": expected a Zod schema`.
- Prerender failed with `Attempted to call useAtom() from the server` for `<PackageInfo>`.
- Prerender failed with ``AccordionItem` must be used within `Accordion`` for API docs.
- `tsc` rejected `source.config.ts` because rehype/remark plugin packages carried incompatible `vfile` type versions.

## What Didn't Work

- Importing all registry helpers from one file. That pulled `src/__registry__/index.tsx` into Fumadocs source generation even though the compiler only needed metadata and file helpers.
- Importing `z` from `zod`. Fumadocs v13 validates with Zod v4, so a Zod v3 schema object looks like a non-schema at build time.
- Assuming Contentlayer's `useMDXComponent` client wrapper mapped directly to Fumadocs' compiled `page.data.body`. Fumadocs renders the compiled MDX as a server component, so hook-based MDX components need explicit client boundaries.

## Solution

Keep Fumadocs source generation server-safe. Split registry metadata helpers from runtime component lookup:

```ts
// src/lib/rehype-utils.ts
export function getRegistryDefinition(name: string, isShadcn?: boolean) {
  const registryTarget = isShadcn ? registryShadcn : registry;

  return registryTarget.items.find((item) => item.name === name);
}
```

```tsx
// src/lib/registry-component.tsx
import * as React from 'react';
import { Index } from '@/__registry__';

export function getRegistryComponent(name: string) {
  if (name === 'plite-to-html') {
    return React.lazy(() => import('@/registry/blocks/slate-to-html/page'));
  }

  return Index[name]?.component;
}
```

Use Fumadocs' generated source as the page source and keep raw markdown from `getText("raw")`:

```ts
export const source = loader({
  baseUrl: '/docs',
  i18n: {
    defaultLanguage: 'en',
    hideLocale: 'default-locale',
    languages: ['en', 'cn'],
  },
  source: docs.toFumadocsSource(),
});
```

Use Zod v4 in `source.config.ts`:

```ts
import { z } from 'zod/v4';
```

Make hook-based MDX components client components:

```tsx
'use client';

export function PackageInfo({ children }: { children: React.ReactNode }) {
  const [packageInfo] = usePackageInfo();
  // ...
}
```

Do not rely on function-name detection for MDX children once components cross the server/client boundary. Treat `APIList` children as items when they exist and only clone valid React elements:

```tsx
const hasItems = childCount > 0;

{React.Children.map(children, (child, i) =>
  React.isValidElement(child)
    ? React.cloneElement(child as any, {
        className: 'pt-4',
        value: i.toString(),
      })
    : child
)}
```

For source-config plugin typing, prefer local casts over fighting old unified package type mismatches:

```ts
rehypePlugins: (plugins) =>
  [
    rehypeSlug,
    rehypeComponent,
    // ...
    ...plugins,
  ] as any,
```

## Why This Works

Fumadocs source generation and Next prerender run through different parts of the graph:

- `fumadocs-mdx` needs source metadata, MDX transforms, and files.
- Next prerender executes the compiled MDX component tree.
- Browser runtime hydrates client MDX components.

If the source config imports app runtime or generated registry UI, the MDX compiler inherits dependencies it should never evaluate. If the MDX component map exposes hook-based components as server components, prerender fails even when source generation succeeds.

Splitting registry metadata from registry component rendering keeps the compiler path server-safe, while explicit client boundaries keep Fumadocs' server-rendered MDX compatible with existing interactive docs widgets.

## Prevention

- Keep `source.config.ts` imports boring: MDX plugins, schema, and server-safe helpers only.
- Do not import `src/__registry__/index.tsx` from files used by source config, route handlers, or registry JSON builders.
- For Fumadocs v13 schemas, import `z` from `zod/v4`.
- During Contentlayer-to-Fumadocs migrations, run both generator and production build. `fumadocs-mdx` passing does not prove prerender-safe MDX components.
- Audit MDX components that use hooks and mark them with `'use client'`.
- When MDX children may cross client/server boundaries, do not detect child types with `child.type.name`; use data shape or valid-element guards.

## Related Issues

- [Next Turbopack needs client boundaries at React package entrypoints](./2026-04-06-next-turbopack-needs-client-boundaries-at-react-package-entrypoints.md)
- [Registry helper refactors must update template registry dependencies](./2026-04-06-registry-helper-refactors-must-update-template-registry-dependencies.md)
- [Generated MDX markers must use JSX comments](./2026-04-27-mdx-generated-markers-must-use-jsx-comments.md)
