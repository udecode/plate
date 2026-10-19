---
title: Emoji Coverage Pass
date: 2026-03-23
---

# `emoji` Coverage Pass

## Summary

Do one tiny non-React pass on `@platejs/emoji`.

Real seams:

- `BaseEmojiPlugin`
- `insertEmoji`

That is enough. Anything broader is `/react` or combobox spillover.

## Constraints

- fast lane only
- no `/react`
- no `withTriggerCombobox` re-testing here

## Planned Coverage

1. `BaseEmojiPlugin.spec.ts`
   - emoji input plugin is inline, void, and edit-only
   - base emoji plugin ships the default trigger and default node builders
   - base emoji plugin includes the nested emoji-input plugin

2. `insertEmoji.spec.ts`
   - default insert writes the first native skin text
   - configured `createEmojiNode` overrides the inserted node shape

## Verification

- targeted `bun test` on touched `emoji` specs
- `bun test packages/emoji/src/lib`
- `pnpm test:profile -- --top 20 packages/emoji/src/lib`
- `pnpm test:slowest -- --top 20 packages/emoji/src/lib`
- `pnpm install`
- `pnpm turbo build --filter=./packages/emoji`
- `pnpm turbo typecheck --filter=./packages/emoji`
- `pnpm lint:fix`

## Deferred

- `/react`
- picker state, storage, floating library, and observer utilities
