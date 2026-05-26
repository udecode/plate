---
title: Docs sidebar active scroll needs a DOM current query
date: 2026-05-25
category: docs/solutions/ui-bugs
module: apps/www docs
problem_type: ui_bug
component: documentation
symptoms:
  - "The docs sidebar matched the shadcn grouped visual style but stayed scrolled to the top on deep routes"
  - "The active docs item existed in the DOM but was outside the visible sidebar scroll area"
  - "Manual browser scroll math worked while the React ref-based effect did nothing"
root_cause: wrong_api
resolution_type: code_fix
severity: medium
tags:
  - docs
  - sidebar
  - shadcn
  - aria-current
  - scroll
  - next-link
---

# Docs sidebar active scroll needs a DOM current query

## Problem

The docs sidebar can look visually correct while still opening deep pages with
the active item hidden below the fold. A ref attached through `next/link` is not
the most reliable source for active-scroll handoff in this docs sidebar.

## Symptoms

- `/docs/components/ai-menu` rendered the correct active `AI Menu` link, but the
  sidebar stayed at `scrollTop: 0`.
- Browser inspection showed the active link around 3000px below the top of the
  nav while the sidebar viewport ended around 720px.
- Running the same scroll calculation manually in the browser moved the sidebar
  correctly, so the scroll math was not the problem.

## What Didn't Work

- Passing a React ref through the exact active `Link` and calling
  `scrollIntoView`. The active DOM node existed, but the effect did not reliably
  get the element and the sidebar did not move.
- Letting `scrollIntoView` choose the scroll container. The docs page has a
  nested sidebar scroller, so relying on the browser to pick the right container
  is fragile.

## Solution

Mark the real sidebar scroll container in the docs layouts:

```tsx
<div className="scrollbar-hide h-full overflow-auto" data-docs-sidebar-scroll>
  <DocsNav sidebarNav={sidebarNav} />
</div>
```

In `DocsNav`, keep a ref on the nav root and query the rendered current link
after route changes:

```tsx
const activeElement = navElement?.querySelector<HTMLAnchorElement>(
  'a[aria-current="page"]'
);
```

Then scroll the nearest `[data-docs-sidebar-scroll]` container explicitly:

```tsx
const offset =
  itemRect.top -
  areaRect.top -
  scrollArea.clientHeight / 2 +
  itemRect.height / 2;

scrollArea.scrollTo({
  top: Math.max(0, scrollArea.scrollTop + offset),
});
```

## Why This Works

`aria-current="page"` is the rendered truth for the exact active route. Querying
that DOM state avoids depending on ref forwarding through a framework link
component, and scrolling the marked container avoids accidentally moving the
document body or doing nothing when the active link sits inside a nested
overflow area.

## Prevention

- For docs navigation, make `aria-current` the browser-verifiable active route
  marker.
- When auto-scrolling an active nav item, mark the intended scroll container and
  scroll it directly.
- Browser-test deep docs routes, not just `/docs`, after sidebar changes.
- Verify both the visual style and the scroll state: active item visible,
  nonzero sidebar `scrollTop`, and no full-page scroll jump.

## Related Issues

- [Fumadocs pageTree search needs locale-safe metadata](../developer-experience/2026-05-24-fumadocs-page-tree-search-needs-locale-safe-metadata.md)
- [Docs code blocks need light Shiki tokens on light surfaces](./2026-05-25-docs-code-block-light-theme-must-use-light-shiki-tokens.md)
