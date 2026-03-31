# Root Typecheck Cleanup

## Goal

Restore a passing root `pnpm typecheck` after the Turbo `typecheck` graph started building dependencies first.
Keep `bun run test` green as well.

## Scope

- Reproduce the current root failure.
- Reproduce the current fast-test failure set.
- Fix blockers package by package.
- Move app-shaped integration tests into `apps/www/src/__tests__/package-integration` instead of patching package manifests or non-test source.
- Stop only when root `pnpm typecheck` and `bun run test` pass or a new external blocker appears.

## Constraints

- Keep `typecheck` honest. No fake green by weakening checks.
- Use minimal targeted fixes.
- No package.json churn to make tests compile.
- No non-test `src` typing hacks.
- Integration coverage belongs in `apps/www` when package-local seams stop being honest.

## Progress

- `completed`: establish cleanup strategy and constraints
- `completed`: move invalid `docx` integration tests into `apps/www` and relocalize package-only helpers
- `completed`: make root `pnpm typecheck` use a warm-build wrapper plus Turbo `typecheck --only`
- `completed`: rerun `bun run test` and root `pnpm typecheck`

## Notes

- This cleanup surfaced two real classes of failures:
  - package-local app-shaped `docx` integration tests living under `packages/docx/src/lib/__tests__`
  - root build or typecheck races caused by peer-only workspace edges, especially through `platejs` and `@udecode/react-hotkeys`
- User explicitly rejected:
  - non-test `src` typing patches
  - package manifest edits used only to prop up test imports
- The final root wrapper fix is in `package.json`: `g:typecheck` now does `(pnpm g:build || pnpm g:build) && turbo --filter "./packages/**" typecheck --only`.
