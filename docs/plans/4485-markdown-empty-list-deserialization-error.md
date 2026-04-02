# 4485 Markdown Empty List Deserialization Error

## Goal

Finish issue `#4485` end-to-end:

- keep the markdown deserializer fix and regression
- keep the task branch-rule clarification
- finish verification after moving unrelated slow fast-lane specs into `*.slow.tsx`
- commit remaining changes
- push branch
- open PR
- sync back to the GitHub issue if PR exists

## Current State

- Branch: `codex/4485-markdown-empty-list-deserialization-error`
- Pushed commit already on branch: `dfb11f375`
- Remaining uncommitted changes are the fast-lane threshold fix:
  - moved `packages/dnd/src/DndPlugin.spec.tsx` -> `packages/dnd/src/DndPlugin.slow.tsx`
  - moved `packages/table/src/lib/merge/tableMergeBehavior.spec.tsx` -> `packages/table/src/lib/merge/tableMergeBehavior.slow.tsx`

## What Is Done

1. Fixed classic markdown empty list item deserialization so `li` always contains `lic`.
2. Added regression coverage for `foo\n\n*\n\nbar`.
3. Tightened `.agents/rules/task.mdc` so unrelated non-`main` branches are not reused for new tasks.
4. Synced generated task skill with `bun install`.
5. Repaired local env drift with `pnpm run reinstall`.
6. Moved two unrelated threshold offenders to slow lane.

## Verified Evidence So Far

- `bun test ./apps/www/src/__tests__/package-integration/markdown-deserializer/deserializeMd.slow.tsx`
- `pnpm install`
- `pnpm turbo build --filter=./packages/markdown`
- `pnpm turbo typecheck --filter=./packages/markdown`
- `pnpm lint:fix`
- `pnpm run reinstall`
- `bun test ./packages/udecode/react-utils/src/useStableFn.spec.tsx`
- `bun test ./packages/table/src/lib/merge/tableMergeBehavior.slow.tsx`
- `bun test ./packages/dnd/src/DndPlugin.slow.tsx`
- `pnpm test:slowest -- --top 10`

## Open Items

1. Run or confirm final `pnpm check` after slow-lane moves.
2. If green, stage all current task changes.
3. Commit slow-lane move fix.
4. Push branch.
5. Open PR with final handoff as body.
6. Post concise issue comment pointing to PR.
7. Evaluate whether a `ce:compound` doc is worth writing.

## Risks / Notes

- The slow-lane move is unrelated to issue `#4485`, but repo PR gate requires `check`, so it is part of the ship path now.
- Do not reopen branch hygiene rabbit holes. Current branch is already correct.
