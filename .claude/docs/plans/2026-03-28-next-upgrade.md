# Next upgrade plan

## Goal

Upgrade `apps/www` to the latest stable Next release using the official Next/Vercel upgrade path, then fix any repo-local fallout and verify the app still passes the required checks.

## Relevant learnings

- `apps/www` has custom Next dev aliasing and TS path behavior for workspace packages; do not casually rewrite those configs.
- `next-env.d.ts` is generated and may differ between dev and prod typegen paths.
- Template sync/check flows already have TS6-era config carve-outs; avoid regressing those while upgrading the app.

## Steps

1. Confirm latest stable Next version and official upgrade guidance.
2. Inspect all Next-dependent files in `apps/www`.
3. Apply the upgrade with the official path.
4. Fix any generated/config/API fallout.
5. Verify with build-first typecheck sequence plus lint.

## Notes

- User asked to use “next mcp”; using official Vercel/Next docs plus the repo-local app/package state.
- Latest stable resolved to `next@16.2.1`.
- The official upgrader also bumped `react` and `react-dom` in `apps/www` from `19.2.3` to `19.2.4`.
- `pnpm -C apps/www exec next upgrade . --revision latest --verbose` updated manifests and the lockfile, but its internal `pnpm install` failed on the repo's existing root `prepare` script (`bun x skiller@latest apply` -> invalid `claude` agent config). I finished install sync with `pnpm install --ignore-scripts`.
- The upgrade exposed a latent SSR issue in `@platejs/dnd`: pages that prerender client editor demos (`/cn`, `/dev`, `/blocks/editor-ai`) crashed with `Invariant Violation: Expected drag drop context`.
- Root cause was not missing providers in `apps/www`; `react-dnd` hooks were still being called during server prerender. The fix is package-level: `@platejs/dnd` now returns inert drag/drop connectors when DOM DnD is unavailable.
- The homepage hydration mismatch came from static demo values generating random node IDs plus unstable `createdAt` metadata across server and client.
- The first fix lived in `apps/www`, but the user wants that normalization moved into the package layer.
- Keep `normalizeNodeId` focused on IDs. Export a separate helper from `@platejs/core` for hydration-safe static demo normalization.

## Outcome

- Upgraded `apps/www` to `next@16.2.1` and `@next/third-parties@16.2.1`.
- Kept the fix in `packages/dnd` so app routes do not need `dynamic(..., { ssr: false })` wrappers just to survive prerender.
- Static demo normalization is being moved from `apps/www` into `@platejs/core` so docs/demo consumers can use a package API instead of app-local glue.

## Verification

- `bun test /Users/zbeyens/git/plate/packages/dnd/src/components/useDraggable.spec.tsx`
- `pnpm --filter @platejs/dnd build`
- `pnpm --filter @platejs/dnd typecheck`
- `pnpm -C apps/www build`
- `pnpm -C apps/www typecheck`
- `pnpm lint:fix`
