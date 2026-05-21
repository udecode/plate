---
module: Discussion
date: 2026-04-05
problem_type: ui_bug
component: block-discussion
symptoms:
  - "After approving a block removal suggestion, the next block's suggestion UI stayed stale until typing"
  - "The discussion badge and card looked correct only after a later editor change forced another render"
root_cause: stale_path_capture
resolution_type: code_fix
severity: medium
tags:
  - discussion
  - suggestion
  - render-wrapper
  - path
  - rerender
---

# `BlockDiscussion` must resolve the current block path inside the wrapper component

## Problem

Approving a block deletion could leave the next block's suggestion UI in an old state.

The data was already updated, but the block below still rendered from the old owner path until another edit happened.

## Root cause

`BlockDiscussion` resolved `blockPath`, comment nodes, and suggestion nodes in the outer `RenderNodeWrapper` closure.

That works while sibling paths stay stable. After a block above is removed, the next block shifts left in the tree, but the wrapper can keep rendering with the old captured path.

The shared discussion index was already invalidating by editor version. The stale part was the captured `blockPath`, not the index itself.

## Fix

Move all path-derived reads into the actual React component that rerenders with editor state:

- call `editor.api.findPath(element)` inside `BlockCommentContent`
- derive `draftCommentNode`, `commentNodes`, and `suggestionNodes` there
- keep the outer wrapper thin and free of captured path state

That lets the existing `useEditorVersion()` subscription inside `useBlockDiscussionItems` recompute against the current block key after sibling paths shift.

## Verification

These checks passed:

```bash
bun test apps/www/src/registry/ui/block-discussion.spec.tsx
bun test apps/www/src/registry/ui/block-discussion-index.spec.ts
pnpm install
pnpm turbo build --filter=./apps/www
pnpm turbo typecheck --filter=./apps/www
pnpm lint:fix
```

## Prevention

Do not capture `Path`-derived ownership state in the outer `RenderNodeWrapper` closure when sibling insertions or deletions can shift paths.

If a wrapper depends on the current location of an element, resolve that location inside the rerendering component body instead.
