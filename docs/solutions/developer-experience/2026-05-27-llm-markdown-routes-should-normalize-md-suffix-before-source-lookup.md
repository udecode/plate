---
title: LLM markdown routes should normalize md suffix before source lookup
date: 2026-05-27
category: developer-experience
module: apps/www docs
problem_type: developer_experience
component: documentation
symptoms:
  - "Ask in ChatGPT should share a public .md URL"
  - "direct /llm/... .md requests returned 404"
  - "rewritten /docs/... .md requests and direct /llm/... .md requests behaved differently"
root_cause: route_normalization
resolution_type: bugfix
severity: medium
tags: [fumadocs, llm, markdown, docs, i18n]
---

# LLM markdown routes should normalize md suffix before source lookup

## Problem

Public markdown links need to keep the `.md` suffix so agents receive a stable URL like `/docs/installation/mcp.md`.

Fumadocs page lookup should not receive that suffix. `source.getPage(['installation', 'mcp.md'])` looks for a page named `mcp.md`, while the real slug is `mcp`.

## Symptoms

- The copy menu needed `.md` links for ChatGPT and Claude.
- `/docs/installation/mcp.md` could be rewritten to an LLM route.
- Direct `/llm/installation/mcp.md` requests missed the page because the route passed the raw slug to `source.getPage`.
- Chinese markdown routes had the same risk when falling back to English docs.

## Solution

Normalize only the route params used for source lookup:

```ts
export const stripMarkdownSuffixFromSlug = (slug: string[] = []) => {
  if (slug.length === 0) return slug;

  const last = slug.at(-1);

  if (!last?.endsWith('.md')) return slug;

  return [...slug.slice(0, -1), last.slice(0, -3)];
};
```

Keep the public URL builder unchanged. The shared URL should stay `/docs/... .md`; only the internal lookup slug should become `/docs/...`.

## Why This Works

There are two contracts:

- Public markdown URLs include `.md` because that is the user-facing and agent-facing document format.
- Fumadocs source lookup uses normalized content slugs without file extensions.

Keeping those contracts separate makes rewritten docs markdown URLs and direct LLM route URLs behave the same way, including localized `/cn` routes.

## Prevention

Test both entry points:

- `/docs/installation/mcp.md`
- `/llm/installation/mcp.md`

For localized docs, test both localized markdown output and English fallback lookup.
