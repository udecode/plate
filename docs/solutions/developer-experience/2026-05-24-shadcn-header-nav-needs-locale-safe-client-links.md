---
title: Shadcn header nav needs locale-safe client links
date: 2026-05-24
category: developer-experience
module: apps/www docs
problem_type: developer_experience
component: documentation
symptoms:
  - "cn mobile header links could route back to English pages"
  - "command-menu fallback links used raw hrefs outside Fumadocs search"
  - "external Plate Plus links risked being locale-prefixed"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [shadcn, header, mobile-nav, command-menu, i18n, fumadocs]
---

# Shadcn header nav needs locale-safe client links

## Problem

After moving docs navigation to Fumadocs pageTree, header surfaces still had client-side locale work to do. The server can pass page-tree-shaped data into `MobileNav` and `CommandMenu`, but those client components own the current pathname locale and must localize their fallback links before navigation.

## Symptoms

- `/cn` mobile nav rendered docs entries from the shared tree but could point internal links at `/docs` instead of `/cn/docs`.
- Command-menu fallback groups used raw `href` values even when the current route was Chinese.
- A simple prefix helper would also break special cases: `/` should become `/cn`, existing `/cn/*` should stay unchanged, and absolute external links should never receive a locale prefix.

## What Didn't Work

- Passing Fumadocs-derived nav data into header components without localizing it in the client. PageTree gives structure; it does not magically know which client route prefix a click should use.
- Prefixing every href when `locale === 'cn'`. That double-prefixes existing CN links and corrupts absolute external URLs.
- Only testing desktop docs pages. The regression sits behind the mobile menu and command dialog.

## Solution

Make `hrefWithLocale` the single href normalizer for docs/header links:

```ts
const ABSOLUTE_HREF_REGEX = /^[a-z][a-z\d+\-.]*:/i;

export const hrefWithLocale = (href: string, locale: string) => {
  if (
    locale !== 'cn' ||
    href.startsWith('/cn') ||
    href.startsWith('#') ||
    ABSOLUTE_HREF_REGEX.test(href)
  ) {
    return href;
  }

  if (href === '/') {
    return '/cn';
  }

  return `/cn${href}`;
};
```

Use that helper from `MobileNav`, `MainNav`, `Logo`, and `CommandMenu`. For display text, read `titleCn` / `labelCn` in client components based on `useLocale()`. Keep external links explicit:

```tsx
<MobileLink
  href={href}
  rel={external ? 'noreferrer' : undefined}
  target={external ? '_blank' : undefined}
>
  {getNavTitle(item, locale)}
</MobileLink>
```

Move the header breakpoint to the upstream shadcn shape: mobile nav remains available until `lg`, while desktop logo/nav starts at `lg`.

## Why This Works

Fumadocs owns docs ordering and page discovery, but locale selection is a route-state concern in the rendered app. Normalizing hrefs at the click surface keeps Fumadocs metadata reusable across English and Chinese routes without duplicating the whole header tree.

The external-link guard matters because product links such as Plate Plus are part of the header too. A locale helper that corrupts external URLs is worse than no helper; it quietly breaks the product path.

## Prevention

- Treat Fumadocs pageTree as structure, not as the final client href for localized routes.
- Keep locale href rules in one helper and make it safe for `/`, `/cn/*`, hash links, and absolute URLs.
- Browser-test both `/` and `/cn` at mobile width after header/nav changes.
- Browser-test command-menu fallback navigation separately from Fumadocs search results.

## Related Issues

- [Fumadocs pageTree search needs locale-safe metadata](./2026-05-24-fumadocs-page-tree-search-needs-locale-safe-metadata.md)
- [Shadcn app shell footer visibility needs nearest layout group](./2026-05-24-shadcn-app-shell-footer-visibility-needs-nearest-layout-group.md)
- [Shadcn docs restarts need a keep/throw comparison first](../best-practices/2026-05-23-shadcn-docs-restart-comparison.md)
