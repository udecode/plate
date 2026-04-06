# Fix template CI registry helper deps

## Goal

Make `plate-template` and `plate-playground-template` build again after the registry UI/plugin refactors added helper-file imports.

## Plan

- [completed] Find which registry items are missing helper files or helper dependencies.
- [completed] Patch registry definitions so generated template installs include those files.
- [in_progress] Rebuild registry output and update local templates.
- [in_progress] Run template build verification and summarize.

## Findings

- CI is failing in generated templates, not in `apps/www`.
- The missing modules are all helper files introduced or depended on by registry items:
  - `block-discussion-index`
  - `get-annotation-click-target`
  - `suggestion-line-break-anchor`
  - `suggestion-styles`
  - `trailing-block-kit`

## Progress

- Loaded learnings/task/react/planning-with-files/tdd.
- Confirmed the break is in registry/template dependency wiring, not app-local imports.
- Added registry coverage for `block-discussion-index`, `get-annotation-click-target`, and `trailing-block-kit`.
- Inlined `suggestion-line-break-anchor` and `suggestion-styles` into `ui/suggestion-node.tsx`, then removed the extra registry file entries.
- Rebuilt `apps/www` registry output with `pnpm --filter www rd`.
- `pnpm turbo typecheck --filter=./apps/www` and `pnpm lint:fix` passed.
- Investigated the separate Vercel failure and reproduced it locally with `pnpm turbo build --filter=./apps/www`.
- The first fix used `packages/core/src/react/index.ts`, but `pnpm brl` rewrote that generated barrel and reintroduced drift.
- Moved the durable client boundary to `packages/plate/src/react/index.tsx`, which survives `pnpm brl`.
- `pnpm brl` and `pnpm turbo build --filter=./apps/www` now both pass together.
