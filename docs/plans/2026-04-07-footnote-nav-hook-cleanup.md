# Footnote Nav Hook Cleanup

## Goal

Clean up `apps/www/src/registry/ui/footnote-node.tsx` by moving local
navigation-highlight logic out of the app file and replacing `as any` access
with typed plugin-driven access.

## Scope

- move `useNavigationHighlight(path)` into core nav-feedback React code
- use typed `getApi/getTransforms(FootnoteReferencePlugin)` access in the
  footnote UI
- keep behavior unchanged

## Outcome

- added `useNavigationHighlight(path)` in
  `packages/core/src/react/plugins/navigation-feedback/useNavigationHighlight.ts`
- exported it through the core React navigation-feedback barrel
- removed local `useNavigationHighlight` from
  `apps/www/src/registry/ui/footnote-node.tsx`
- replaced footnote `api/tf` `as any` access with typed helper access based on
  `FootnoteConfig` and `FootnoteReferencePlugin`
- switched element path reads to `usePath()` in the footnote UI

## Verification

- `pnpm brl`
- `bun test apps/www/src/registry/ui/footnote-node.spec.tsx`
- `pnpm turbo build --filter=./packages/core --filter=./packages/footnote`
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/footnote`
- `pnpm lint:fix`
