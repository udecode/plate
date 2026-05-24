---
title: Fumadocs pageTree search needs locale-safe metadata
date: 2026-05-24
last_updated: 2026-05-24
category: developer-experience
module: apps/www docs
problem_type: developer_experience
component: documentation
symptoms:
  - "docs navigation still read docsConfig after the Fumadocs source cutover"
  - "command-menu search needed to move from client-only nav filtering to Fumadocs search"
  - "searching with the cn locale crashed Orama with Language \"cn\" is not supported"
root_cause: config_error
resolution_type: migration
severity: medium
tags: [fumadocs, page-tree, search, i18n, docs, orama]
---

# Fumadocs pageTree search needs locale-safe metadata

## Problem

After the docs source cutover, `apps/www` still used `docsConfig` as the runtime source for sidebar navigation, pager links, and command-menu docs search. Moving those surfaces to Fumadocs exposed a separate i18n search problem: Plate's `cn` locale is not a valid Orama tokenizer language.

## Symptoms

- `DocsNav`, pager, mobile docs nav, and command-menu docs entries were still driven by `docsConfig`.
- Fumadocs pageTree had no useful ordering until `content/docs/meta.json` existed.
- `docs-page-tree.ts` still imported `docsConfig/docsMap` after the pageTree switch, keeping the old TS nav graph in runtime code for descriptions, labels, keywords, and CN labels.
- Browser search for `table` hit `/api/search?query=table`, then the dev server logged:

```text
Error: Language "cn" is not supported.
```

## What Didn't Work

- Only wiring `source.getPageTree()` into components. Without metadata, the tree falls back to filesystem order and loses Plate's product navigation shape.
- Calling `createFromSource(source)` with no options. With Fumadocs i18n enabled, it builds per-locale Orama indexes and passes locale names through as tokenizer languages.
- Treating `docsConfig` as gone immediately. Registry-derived and app-only docs links still need a migration overlay until they become Fumadocs metadata or registry source.

## Solution

Generate a root metadata file from the existing navigation data, then read Fumadocs pageTree at runtime:

```ts
export function getSidebarNavFromPageTree(locale: string = 'en') {
  const tree = source.getPageTree(locale);
  // convert separators and page nodes into SidebarNavItem sections
}
```

Use the same pageTree for pager neighbours:

```ts
const neighbours = findNeighbour(source.getPageTree(locale), href);
```

Replace client-only docs search with the Fumadocs search API:

```ts
import { createFromSource } from 'fumadocs-core/search/server';

import { source } from '@/lib/source';

export const { GET } = createFromSource(source, {
  localeMap: {
    cn: 'english',
  },
});
```

Keep `docsConfig` only as migration data for labels, Chinese titles, and the metadata generator until those values live in first-class Fumadocs or registry sources.

Move runtime-only overlay data into the committed metadata file itself. The generator can still consume `docsConfig` temporarily, but runtime code should read `content/docs/meta.json`:

```json
{
  "root": true,
  "pages": ["---Get Started---", "[Introduction](/docs)"],
  "_plate": {
    "sections": {
      "Get Started": "开始"
    },
    "items": {
      "/docs/plugin-shortcuts": {
        "label": "Updated",
        "titleCn": "插件快捷键"
      }
    }
  }
}
```

Then centralize overlay lookup beside the Fumadocs pageTree adapter:

```ts
import docsMeta from '../../../../content/docs/meta.json';

const docsOverlay = (docsMeta as { _plate?: DocsMetaOverlay })._plate ?? {};

export function getDocsNavMeta(href: string) {
  return docsOverlay.items?.[normalizeDocsHref(href)];
}
```

## Why This Works

Fumadocs `meta.json` is the pageTree ordering contract. Root `pages` entries can include separators and links, which lets Plate represent app-only and registry-derived docs routes without pretending every route is a physical MDX file. Keep that metadata under `content/docs/` with the MDX files, matching the upstream shadcn/Fumadocs content root.

Fumadocs' built-in meta schema only exposes fields such as `pages`, `title`, and `description` to the pageTree. Keeping Plate-specific overlay fields under `_plate` lets the app read them directly from the committed metadata file while Fumadocs continues to ignore unknown data during source generation.

Fumadocs search delegates tokenization to Orama. Orama supports `english`, not Plate's locale key `cn`; mapping `cn` to a supported tokenizer keeps the i18n search index buildable while preserving `/cn/docs/*` routing.

## Prevention

- Add `content/docs/meta.json` before switching visible navigation to `source.pageTree`.
- For Fumadocs i18n search, explicitly map custom locale keys to tokenizer languages supported by Orama.
- Keep temporary `docsConfig` usage centralized in metadata generation/parity scripts, not runtime page rendering.
- Assert representative `_plate.sections` and `_plate.items` values in docs parity so regenerated metadata cannot silently drop labels or CN titles.
- Browser-test both `/docs` and `/cn/docs/*` after changing search or pageTree code.

## Related Issues

- [Fumadocs MDX migrations need server-safe source config and MDX boundaries](./2026-05-22-fumadocs-mdx-migrations-need-server-safe-source-config-and-mdx-boundaries.md)
- [Shadcn docs restarts need a keep/throw comparison first](../best-practices/2026-05-23-shadcn-docs-restart-comparison.md)
