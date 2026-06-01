---
title: Shadcn app shell footer visibility needs nearest layout group
date: 2026-05-24
category: developer-experience
module: apps/www docs shell
problem_type: developer_experience
component: documentation
symptoms:
  - "docs route rendered the layout-owned footer after the app shell moved footer ownership into the shared layout"
  - "browser smoke reported one visible footer on /docs even though the docs page had data-slot=\"docs\""
root_cause: config_error
resolution_type: migration
severity: medium
tags: [shadcn, app-shell, footer, tailwind, browser-smoke]
---

# Shadcn app shell footer visibility needs nearest layout group

## Problem

Moving Plate's docs app toward the upstream shadcn shell means the layout owns the shared footer instead of individual pages. That exposed a footer visibility bug: docs pages should hide the layout footer, but the first implementation only copied the upstream body-level `group-has` selector and left the footer visible on `/docs`.

## Symptoms

- `/` and `/cn` each rendered one footer as expected.
- `/docs` rendered one visible footer even though the docs page contains `data-slot="docs"`.
- Browser smoke returned `visibleFooters: 1` for `/docs` where the expected value was `0`.
- No console errors appeared, so static type/lint checks did not catch the regression.

## What Didn't Work

- Only using the upstream body-level selector:

```tsx
<footer className="group-has-[[data-slot=docs]]/body:hidden" />
```

In Plate's current app shell, that selector was too indirect to rely on as the only hiding rule during the migration.

## Solution

Put the shell marker and footer in the same layout group:

```tsx
<div
  data-slot="layout"
  className="group/layout relative z-10 flex min-h-svh flex-col bg-background"
>
  <main className="flex min-h-0 flex-1 flex-col">{children}</main>
  <SiteFooter />
</div>
```

Then hide the footer through the nearest layout group while keeping the body selector as a compatibility fallback:

```tsx
<footer className="group-has-[[data-slot=docs]]/layout:hidden group-has-[[data-slot=docs]]/body:hidden" />
```

Browser smoke should assert both the shell and footer behavior:

```ts
const visibleFooters = await page.locator('footer:visible').count();
const shellCount = await page.locator('[data-slot="layout"]').count();
```

For Plate, `/` and `/cn` should have one visible footer, while `/docs` should have zero visible footers.

## Why This Works

The layout group is the closest stable ancestor shared by the page content and the footer. When a descendant page renders `data-slot="docs"`, Tailwind's `group-has-.../layout` variant can hide the sibling footer through that direct shell group.

The body-level selector is still harmless as a fallback, but it is not the only enforcement point. That matters during an app-shell migration, where the exact upstream body/provider stack is not fully adopted yet.

## Prevention

- When moving footer/header ownership into a shared layout, smoke-test a normal landing page and at least one docs page.
- Assert footer visibility in browser tests; typecheck cannot prove route-descendant CSS behavior.
- Prefer the nearest named group for route-specific shell behavior, then keep broader body-level selectors only as fallbacks.
- Keep page-owned footers out of pages once the shell owns the footer, or duplicate footers will slip through route-by-route.

## Related Issues

- [Fumadocs pageTree search needs locale-safe metadata](./2026-05-24-fumadocs-page-tree-search-needs-locale-safe-metadata.md)
- [Shadcn docs restarts need a keep/throw comparison first](../best-practices/2026-05-23-shadcn-docs-restart-comparison.md)
