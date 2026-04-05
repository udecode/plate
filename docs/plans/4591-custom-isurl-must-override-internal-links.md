# Issue 4591: custom isUrl must override internal links

## Tracker

- Source type: GitHub issue
- Source id: `#4591`
- Title: `don't want insert internal links starting with /`
- URL: `https://github.com/udecode/plate/issues/4591`
- Task type: bug
- Expected outcome: a user-provided `isUrl` option can veto autolinking for internal paths like `/aaa` and anchor links like `#top`, while the default link behavior still accepts those shortcuts when no custom override is provided
- Browser surface: no; the stable seam is `packages/link` URL validation and paste/autolink tests

## Relevant area

- `packages/link/src/lib/utils/validateUrl.ts`
- `packages/link/src/lib/utils/validateUrl.spec.ts`
- `packages/link/src/lib/BaseLinkPlugin.ts`
- any paste/autolink tests that prove the user-facing behavior, if needed

## Learnings

- Current `main` still returns early for `/...` and `#...` before consulting `isUrl`, so the issue is still real
- `platejs` default `isUrl` returns `false` for `/aaa` and `#top`, so a naive reorder would break the plugin's intended internal-link and anchor-link shortcuts
- Recent link-validation work already had to special-case `/` handling to exclude `//`; this fix should stay minimal and avoid reopening that regression

## Plan

1. Add a failing validator test that proves custom `isUrl` cannot currently veto `/...` and `#...`.
2. Implement the smallest fix that only gives priority to custom `isUrl`, not the default `platejs` validator.
3. Re-run targeted tests for `packages/link`.
4. If the fix is meaningful and verified, create/update the PR and post back to the issue.

## Progress

- Fetched the issue and comments.
- Read the task, planning-with-files, learnings-researcher, and tdd skill docs.
- Searched `docs/solutions` and read the recent link-validation learning about `//` internal-path regressions.
- Verified `validateUrl` still bypasses custom `isUrl` for `/...` and `#...`.
- Confirmed the old Claude branch exists remotely, but there is no PR for `#4591`.
- Checked out `main`, pulled latest, and branched to `codex/4591-custom-isurl-internal-links`.
- Added red coverage in `validateUrl.spec.ts` and `upsertLink.spec.tsx`, then confirmed current `main` failed those expectations.
- Updated `validateUrl` so only custom `isUrl` overrides can veto `/...` and `#...`, while the default `platejs` validator still preserves existing internal-link and anchor-link behavior.
- Verified with:
  - `bun test packages/link/src/lib/utils/validateUrl.spec.ts packages/link/src/lib/transforms/upsertLink.spec.tsx packages/link/src/lib/withLink.spec.tsx`
  - `pnpm install`
  - `pnpm turbo build --filter=./packages/link`
  - `pnpm turbo typecheck --filter=./packages/link`
  - `pnpm lint:fix`
- Added `.changeset/link-custom-isurl-internal-links.md`.

## Errors

- `planning-with-files` session catchup script path from the generated skill is missing locally, so catchup could not run in this repo.
