# Issue 4625: video inserted via URL does not render

## Source Of Truth

- GitHub issue: https://github.com/udecode/plate/issues/4625
- Title: `Video：It is not render, when I add a video from “Insert Via URL ”`
- Type: bug
- Expected outcome: inserting a video from `Insert Via URL` should render a usable video element instead of disappearing behind upload-only logic.

## Scope

- Confirm the current insert path for `video -> Insert Via URL`.
- Identify whether the bug lives in node insertion, derived media state, or video UI rendering.
- Add the smallest sane regression test at the real seam.
- Implement the minimal fix.
- Run targeted verification plus required package checks.

## Findings

- Issue screenshots suggest the node is inserted with a `url` but without `isUpload`, and the current render path likely hides non-upload videos unless they parse as supported embeds.
- No obviously relevant prior solution doc surfaced from `docs/solutions/`.
- `apps/www/src/registry/ui/media-toolbar-button.tsx` inserts `video` nodes directly for `Insert via URL`, so the missing `isUpload` flag is expected on that path.
- `apps/www/src/registry/ui/media-video-node.tsx` rendered only YouTube embeds or `isUpload` videos, which made plain video URLs and non-YouTube providers disappear.
- `apps/www/src/registry/ui/media-video-node-static.tsx` already rendered direct video URLs correctly, so the bug was limited to the live React node.
- The smallest honest regression seam was a component test with mocked editor/media hooks, not a parser test in `packages/media`.

## Progress

- [x] Fetch issue and comments
- [x] Load required workflow skills
- [x] Start persistent plan doc
- [x] Read affected implementation and tests
- [x] Add failing regression test
- [x] Implement fix
- [x] Verify

## Verification Plan

- Targeted test for the affected media/video seam
- `pnpm install`
- `pnpm --filter www build:registry`
- `pnpm --filter www typecheck`
- `pnpm lint:fix`
- `pnpm check` before PR if code changes ship

## Verification Results

- `bun test apps/www/src/registry/ui/media-video-node.spec.tsx`
- `pnpm install` hit an existing `prepare` failure in `bun x skiller@latest apply` after confirming the workspace was already up to date
- `pnpm --filter www build:registry`
- `pnpm --filter www typecheck`
- `pnpm lint:fix`
- `pnpm check`

## ce-compound Evaluation

- Skip. This was a targeted renderer fallback bug once the insert path and live node were read together.
