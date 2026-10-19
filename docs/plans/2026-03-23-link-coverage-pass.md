---
title: Link Coverage Pass
date: 2026-03-23
---

# `link` Coverage Pass

## Summary

Do one narrow non-React pass on `@platejs/link`.

Focus on the remaining real seams:

- `BaseLinkPlugin`
- `withLink.normalizeNode`
- `wrapLink`
- `unwrapLink`
- `upsertLinkText`

Do not broaden this into a `/react` pass or another `upsertLink` rewrite.

## Constraints

- fast lane only
- no `/react`
- no wrapper vanity coverage
- fix a runtime bug only if the new direct tests expose one

## Planned Coverage

1. `BaseLinkPlugin.spec.tsx`
   - valid html link parse
   - invalid or missing href rejected

2. `withLink.spec.tsx`
   - `normalizeNode` inserts a trailing text leaf after a terminal link

3. `wrapLink.spec.tsx`
   - wraps expanded text with a link element and preserves surrounding text

4. `unwrapLink.spec.tsx`
   - unwraps a whole link
   - split mode only unwraps the selected fragment inside a link

5. `upsertLinkText.spec.tsx`
   - replaces children when text changes
   - preserves marks from the first text child
   - no-op when text is unchanged or missing

## Verification

- targeted `bun test` on touched `link` specs
- `bun test packages/link/src`
- `pnpm test:profile -- --top 20 packages/link/src`
- `pnpm test:slowest -- --top 20 packages/link/src`
- `pnpm install`
- `pnpm turbo build --filter=./packages/link`
- `pnpm turbo typecheck --filter=./packages/link`
- `pnpm lint:fix`

## Deferred

- `/react` components and floating-link helpers
- utility files that already have direct specs
- more `withLink` branches unless these direct tests expose real debt
