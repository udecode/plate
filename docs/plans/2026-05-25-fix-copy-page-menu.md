---
title: Fix Copy Page menu item layout
date: 2026-05-25
status: complete
---

## Goal

Fix the Copy Page dropdown so icons and labels align horizontally.

## Findings

- The screenshot shows desktop dropdown items rendering as plain anchors, with icons stacked above labels.
- `DocsCopyPageItem` is used under `DropdownMenuItem asChild` and `Button asChild`.
- The wrapper does not forward Radix/Button props to the anchor, so menu item classes are dropped.
- No relevant existing `docs/solutions` note was found for this exact UI bug.

## Plan

1. Update `DocsCopyPageItem` to forward props/ref into the anchor.
2. Verify the component typechecks/lints.
3. Browser-check the dropdown layout.

## Progress

- 2026-05-25: Located root cause in `apps/www/src/components/docs-copy-page.tsx`.
- 2026-05-25: Fixed `DocsCopyPageItem` by forwarding `asChild` props/ref to the anchor.
- 2026-05-25: Verified with `pnpm install`, `pnpm --filter www build:source`, `pnpm --filter www typecheck`, `pnpm lint:fix`, and Chrome on `localhost:3001/docs/installation`.

## Knowledge Capture

No `ce-compound` doc created. This is a narrow Radix `asChild` wrapper bug with an obvious local fix and no new project-specific debugging pattern.
