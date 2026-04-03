# Issue 4935 useTocSideBarState Type Regression

## Task

- Source: GitHub issue `#4935`
- Title: ``useTocSideBarState` now returns any instead of the state' type`
- Type: bug
- Goal: restore the public `@platejs/toc/react` hook contract so consumers get real inference again

## Plan

1. Read issue details, repo rules, relevant learnings, and current TOC hook code.
2. Add a consumer-shaped type contract test for `useTocSideBarState`.
3. Reproduce the regression through the new type test.
4. Remove the `any` seam in the hook.
5. Run package build/typecheck, type-test verification, and lint.

## Findings

- Issue body points at `packages/toc/src/react/hooks/useTocSideBar.ts`.
- The hook currently returns `: any` even though the docs promise a typed object shape.
- Existing repo learning from `#4895` says consumer-facing type regressions need a public-contract assertion, not just source inspection.
- Templates consume `@platejs/toc`, but they do not currently call `useTocSideBarState`; package type-tests are the tighter seam here.
- `docs/solutions/patterns/critical-patterns.md` does not exist in this repo, so there was no extra critical-pattern file to load.
- The cleanest regression guard in this repo is a compile-time `IsAny` assertion inside `useTocSideBar.spec.tsx`, then package-scoped build/typecheck.
- `pnpm test:types` still crashes with a TypeScript 6 `Debug Failure`, so repo-wide type-tests are not a usable verification lane for this task.
- Direct Bun execution of `packages/toc/src/react/hooks/useTocSideBar.spec.tsx` fails on an existing monorepo `ENOENT .../node_modules/react` resolution problem unrelated to this change.

## Progress

- 2026-04-01: Loaded `task`, `planning-with-files`, `learnings-researcher`, and `tdd`.
- 2026-04-01: Fetched issue `#4935`, inspected the TOC hook, found the explicit `: any`, and checked relevant learnings.
- 2026-04-01: Added `IsAny` compile assertions to `packages/toc/src/react/hooks/useTocSideBar.spec.tsx`.
- 2026-04-01: Reproduced the regression with `pnpm install`, `pnpm turbo build --filter=./packages/toc`, and `pnpm turbo typecheck --filter=./packages/toc`; the new assertions failed while `useTocSideBarState` returned `any`.
- 2026-04-01: Removed the explicit `: any` from `packages/toc/src/react/hooks/useTocSideBar.ts`.
- 2026-04-01: Verified green with `pnpm turbo build --filter=./packages/toc`, `pnpm turbo typecheck --filter=./packages/toc`, and `pnpm lint:fix`.
- 2026-04-01: `pnpm check` is blocked by an unrelated fast-test failure in `packages/dnd/src/DndPlugin.spec.tsx` (`ENOENT .../packages/dnd/node_modules/react`), so no PR was opened from this turn.
- 2026-04-01: User asked to add a reinstall helper from `../informed`; the matching sibling repo here is `../informed-fe-v3`, which already had `scripts/reinstall.sh`.
- 2026-04-01: Root cause for the DnD failure was stale package-local `node_modules/react` symlinks pointing into missing `root/node_modules/.bun/...` targets; `pnpm install` alone did not repair them.
- 2026-04-01: Added `tooling/scripts/reinstall.sh` and exposed it as `pnpm run reinstall`.
- 2026-04-01: Ran `pnpm run reinstall`, then verified `bun test packages/dnd/src/DndPlugin.spec.tsx`, `pnpm --filter @platejs/dnd test src/DndPlugin.spec.tsx`, `pnpm test`, and `pnpm lint:fix` all pass.
