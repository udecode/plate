# PR 4903: test + merge

## Goal

Add the missing static-render path coverage to PR `#4903`, verify it with the repo's build-first sequence, then commit, push, and merge the PR.

## Status

- [completed] Resolve branch tip and diff against base
- [completed] Inspect changed files and tests
- [completed] Check out PR branch and add the missing coverage with TDD
- [completed] Implement the minimal fix needed by the new test
- [completed] Run verification: install, build, typecheck, lint, targeted tests, check
- [pending] Commit, push, and merge the PR

## Findings

- Review finding carried forward: the new precomputed `path` only reaches element rendering; static text/leaf renderers still hit `getRenderNodeStaticProps` without a path and can fall back to `findPath`.
- No relevant `docs/solutions/` match for this specific static render path issue.
- `critical-patterns.md` was not present under `docs/solutions/patterns/`.
- Red test: `bun test packages/core/src/static/components/PlateStatic.spec.tsx` failed with `text findPath should not be needed during static render`.
- Green fix: threaded `path` through `LeafStatic`, `RenderLeafProps`, `RenderTextProps`, `pluginRenderLeafStatic`, and `pluginRenderTextStatic`.
- Verification:
  - `pnpm install`
  - `pnpm turbo build --filter=./packages/core`
  - `pnpm turbo typecheck --filter=./packages/core`
  - `pnpm lint:fix`
  - `bun test packages/core/src/static/components/PlateStatic.spec.tsx packages/core/src/static/pluginRenderLeafStatic.spec.tsx packages/core/src/static/pluginRenderTextStatic.spec.tsx packages/core/src/static/utils/getRenderNodeStaticProps.spec.ts`
  - `pnpm check`

## Notes

- Switch from read-only review to implementation on user request.
- TDD target: add a failing spec that proves static text/leaf injection can consume a precomputed path instead of falling back to `findPath`.
