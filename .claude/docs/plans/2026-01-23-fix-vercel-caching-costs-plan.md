---
title: Fix Vercel Caching - $50+ Monthly Overage
type: fix
date: 2026-01-23
deepened: 2026-01-23
---

# Fix Vercel Caching - $50+ Monthly Overage

## Enhancement Summary

**Deepened on:** 2026-01-23
**Sources:** Vercel React Best Practices, 3 reviewer agents (DHH, Kieran, Simplicity)

### Key Improvements
1. Expanded scope to include ALL locale-dependent files (18 files, not 3)
2. Added Vercel-specific caching guidance (LRU vs React.cache)
3. Fixed `generateStaticParams` issues for CN route
4. Added client-side utility migrations

### Critical Findings from Reviewers
- Home page ALSO uses `searchParams` - must fix
- `useLocale.ts` uses `useSearchParams()` - needs migration to `usePathname()`
- Dual encoding (`/cn/...?locale=cn`) is redundant - remove query params entirely

---

## Overview

Docs pages have **0% cache hit rate** causing $50+ Vercel overage. Every request hits origin server, running expensive SSR (code highlighting, file tree generation).

## Problem Statement

**Symptoms from Vercel dashboard:**
- 0% cache hit rate on `/docs/[[...slug]]`
- $22.84 Fluid Active CPU (178 hours)
- $20.43 Fast Origin Transfer (338 GB)
- 99.5% traffic from single region (iad1)
- Spike started ~Jan 7

**Root Cause:**
```tsx
// apps/www/src/app/(app)/docs/[[...slug]]/page.tsx:35-37
type DocPageProps = {
  searchParams: Promise<{ locale: string }>;  // <-- THIS FORCES DYNAMIC RENDERING
};
```

Using `searchParams` in Next.js App Router **forces dynamic rendering** - pages cannot be statically generated or cached, even with `generateStaticParams()`.

### Vercel Best Practices Context

From Vercel's React Best Practices guide (Section 3.3 - Cross-Request LRU Caching):

> "React.cache() only works within one request. For data shared across sequential requests, use an LRU cache."

However, for **static documentation sites**, the better approach is:
1. **Static Generation** via `generateStaticParams()` - already exists but bypassed
2. **Remove dynamic triggers** - `searchParams` forces dynamic mode
3. **Vercel Edge CDN** will cache static pages automatically

The current `React.cache()` calls in [registry-cache.ts](apps/www/src/lib/registry-cache.ts) only deduplicate within a single request - they don't help with CDN caching.

## Proposed Solution

Move locale from query param (`?locale=cn`) to path segment (`/cn/docs/...`).

**Why this approach:**
- Enables full static generation + CDN caching
- Better SEO (separate URLs for each locale)
- Follows Next.js i18n best practices
- No runtime locale detection overhead

## Technical Approach

### Files to Modify (Complete List)

| File | Change |
|------|--------|
| `apps/www/src/app/(app)/docs/[[...slug]]/page.tsx` | Remove `searchParams`, add locale prop |
| `apps/www/src/app/(app)/page.tsx` | Remove `searchParams` (home page!) |
| `apps/www/src/app/cn/docs/[[...slug]]/page.tsx` | NEW - CN docs route |
| `apps/www/src/app/cn/page.tsx` | NEW - CN home page |
| `apps/www/src/hooks/useLocale.ts` | Use `usePathname()` not `useSearchParams()` |
| `apps/www/src/lib/withLocale.ts` | Remove `?locale=cn` suffix |
| `apps/www/src/components/languages-dropdown-menu.tsx` | Remove query param setting |
| `apps/www/next.config.ts` | Replace rewrites with redirects |

### Step 1: Fix English Docs Page

Remove `searchParams` from page props:

```tsx
// apps/www/src/app/(app)/docs/[[...slug]]/page.tsx

// BEFORE
type DocPageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ locale: string }>;  // DELETE THIS
};

// AFTER
type DocPageProps = {
  params: Promise<{ slug: string[] }>;
  locale?: 'en' | 'cn';  // Optional prop, defaults to 'en'
};

export const dynamic = 'force-static';

// Update getDocFromParams
async function getDocFromParams({ params, locale = 'en' }: DocPageProps) {
  const slugParam = (await params).slug;
  // Use locale prop instead of searchParams
  if (locale === 'cn') {
    // Chinese logic...
  }
  // ...
}
```

### Step 2: Create CN Docs Route

```tsx
// apps/www/src/app/cn/docs/[[...slug]]/page.tsx
import { DocContent } from '@/app/(app)/docs/[[...slug]]/doc-content';
import { allDocs } from 'contentlayer/generated';
// ... other imports from main page

export const dynamic = 'force-static';

// IMPORTANT: Generate params for CN docs specifically
export function generateStaticParams() {
  return allDocs
    .filter((doc) => doc._raw.sourceFileName?.endsWith('.cn.mdx'))
    .map((doc) => ({
      slug: doc.slugAsParams.replace(/\.cn$/, '').split('/').slice(1),
    }));
}

export default async function CNDocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  // Render with locale='cn'
  // ... (copy rendering logic with locale hardcoded to 'cn')
}
```

### Step 3: Fix Client-Side Locale Detection

```tsx
// apps/www/src/hooks/useLocale.ts

// BEFORE - forces client-side hydration issues
import { useSearchParams } from 'next/navigation';

export const useLocale = () => {
  const searchParams = useSearchParams();
  const locale = searchParams?.get('locale') || 'en';
  return locale;
};

// AFTER - derive from pathname
import { usePathname } from 'next/navigation';

export const useLocale = () => {
  const pathname = usePathname();
  return pathname?.startsWith('/cn') ? 'cn' : 'en';
};
```

### Step 4: Fix Locale Link Helper

```tsx
// apps/www/src/lib/withLocale.ts

// BEFORE - adds redundant query param
export const hrefWithLocale = (href: string, locale: string) => {
  if (locale === 'cn') {
    return `/cn${href}?locale=${locale}`;  // Redundant!
  }
  return href;
};

// AFTER - path only
export const hrefWithLocale = (href: string, locale: string) => {
  if (locale === 'cn') {
    return `/cn${href}`;
  }
  return href;
};
```

### Step 5: Update Next.js Config

```ts
// apps/www/next.config.ts

// REMOVE these rewrites:
rewrites: async () => {
  return [
    { source: '/cn', destination: '/?locale=cn' },           // DELETE
    { source: '/cn/:path*', destination: '/:path*?locale=cn' }, // DELETE
  ];
},

// ADD these redirects for old URLs:
redirects: async () => {
  return [
    // ...existing redirects...

    // Redirect old ?locale=cn URLs to /cn/* paths
    {
      source: '/',
      has: [{ type: 'query', key: 'locale', value: 'cn' }],
      destination: '/cn',
      permanent: true,
    },
    {
      source: '/docs/:path*',
      has: [{ type: 'query', key: 'locale', value: 'cn' }],
      destination: '/cn/docs/:path*',
      permanent: true,
    },
  ];
},
```

### Step 6: Fix Home Page (Also Uses searchParams!)

```tsx
// apps/www/src/app/(app)/page.tsx

// BEFORE
export default async function IndexPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const locale = ((await searchParams).locale || 'en') as keyof typeof i18n;
  // ...
}

// AFTER - remove searchParams, default to 'en'
export const dynamic = 'force-static';

export default async function IndexPage() {
  const locale = 'en';  // English home page
  // ...
}

// Create separate /cn/page.tsx for Chinese home
```

## Acceptance Criteria

- [x] Remove `searchParams` from docs page props
- [x] Remove `searchParams` from home page props
- [x] Create `/cn/docs/[[...slug]]/page.tsx` with proper `generateStaticParams`
- [x] Create `/cn/page.tsx` for Chinese home
- [x] Update `useLocale.ts` to use `usePathname()`
- [x] Update `withLocale.ts` to remove query params
- [x] Update language dropdown to use path-only navigation
- [x] Replace rewrites with redirects in next.config.ts
- [ ] Verify `x-vercel-cache: HIT` header after deploy
- [ ] Verify cache hit rate > 90% in Vercel dashboard
- [ ] Verify costs return to ~$20/month baseline

## Testing Checklist

- [x] Verify build output shows pages as "Static" not "Dynamic"
- [ ] Test language switcher navigates to `/cn/*` without query params
- [ ] Test internal doc links preserve locale context
- [ ] Verify 301 redirects work for old `?locale=cn` URLs
- [ ] Check no hydration warnings in browser console

## Alternative Approaches Considered

| Approach | Pros | Cons |
|----------|------|------|
| Path segments (chosen) | Full caching, SEO-friendly | Route restructuring needed |
| Cookies for locale | No URL changes | Still dynamic, no caching |
| ISR with short TTL | Quick fix | Still hits origin frequently |
| Remove CN support | Simplest | Loses Chinese users |

## Risk Analysis

- **Low risk:** Route restructuring is well-documented Next.js pattern
- **Migration:** Old `?locale=cn` URLs need 301 redirects to preserve SEO
- **Testing:** Verify both locales render correctly before deploy

## References

### Internal Files
- [apps/www/src/app/(app)/docs/[[...slug]]/page.tsx](apps/www/src/app/(app)/docs/[[...slug]]/page.tsx) - Docs page
- [apps/www/src/app/(app)/page.tsx](apps/www/src/app/(app)/page.tsx) - Home page
- [apps/www/src/hooks/useLocale.ts](apps/www/src/hooks/useLocale.ts) - Client locale hook
- [apps/www/src/lib/withLocale.ts](apps/www/src/lib/withLocale.ts) - Locale link helper
- [apps/www/next.config.ts](apps/www/next.config.ts) - Next.js config

### External Documentation
- [Next.js i18n Routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Vercel React Best Practices - Server Caching](/.claude/rules/vercel-react-best-practices/AGENTS.md#33-cross-request-lru-caching)
- [Next.js Static Generation](https://nextjs.org/docs/app/building-your-application/rendering/server-components#static-rendering-default)
