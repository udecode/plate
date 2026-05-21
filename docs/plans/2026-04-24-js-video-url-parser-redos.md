# js-video-url-parser ReDoS Fix

## Goal

Remove or neutralize `js-video-url-parser` CVE-2026-5986 exposure from `@platejs/media`.

## Source

- Advisory: https://advisories.gitlab.com/npm/js-video-url-parser/CVE-2026-5986/
- Task: `js-video-url-parser` has a ReDoS vulnerability, used by `@platejs/media`.

## Scope

- Published package: `packages/media`
- Release artifact: changeset required if package output/user-visible dependency changes
- Browser surface: none for verification; media embed parsing is library behavior

## Plan

1. [complete] Identify exact dependency usage.
2. [complete] Replace/remove vulnerable package.
3. [complete] Preserve YouTube/Vimeo/embed parsing behavior with tests.
4. [complete] Add changeset.
5. [complete] Verify with targeted tests, build-first typecheck, lint, and PR gate if shipping PR.
6. [complete] Evaluate reusable knowledge for `ce-compound`.
7. [complete] Add auto-release opt-in for changeset PRs.

## Findings

- `pnpm-lock.yaml` pins `js-video-url-parser@0.5.1`.
- `packages/media/package.json` declares `js-video-url-parser`.
- Current known affected versions include `0.5.0` and `0.5.1`; there is no safe bump target in the advisory context.
- Durable fix should remove dependency and own the small parser surface Plate needs.

## Progress

- Loaded `task`, `planning-with-files`, `learnings-researcher`, `tdd`, and `changeset`.
- Checked `docs/solutions`; no direct `js-video-url-parser` solution found.
- Reproduced ReDoS shape: `bun test packages/media/src/lib/media-embed/parseVideoUrl.spec.ts` failed at ~360ms against a 25-digit invalid `t=` value.
- Replaced dependency-backed parser with URL API parsing for YouTube, Vimeo, Dailymotion, Youku, and Coub.
- Focused parser test passed after implementation.
- Cloned `../jsVideoUrlParser` to cross-check upstream provider variants before finalizing tests.
- `pnpm install` removed `js-video-url-parser@0.5.1` from `pnpm-lock.yaml`.
- Added `.changeset/media-video-url-parser-redos.md`.
- Verified `bun test packages/media/src/lib/media-embed/parseVideoUrl.spec.ts`.
- Verified `pnpm turbo build --filter=./packages/media`.
- Verified `pnpm turbo typecheck --filter=./packages/media`.
- Verified `pnpm lint:fix`.
- Verified `pnpm check` before compound doc creation.
- Added `docs/solutions/security-issues/2026-04-24-media-video-url-parser-redos.md`.
- User asked to add a checkbox that auto-merges the follow-up Version Packages PR.
- Chosen design: PR-body checkbox for author intent; release workflow reads the merged PR and enables auto-merge on the generated release PR.
- Added shared helper coverage for detecting changeset PRs, preserving the managed checkbox state, and ignoring stray checkbox text outside the managed block.
- Added `.github/workflows/changeset-auto-release.yml` to keep the checkbox present on changeset PRs.
- Updated `.github/workflows/release.yml` to detect checked merged PRs and enable auto-merge on `[Release] Version packages`.
- Verified `bun test tooling/scripts/auto-release-pr.test.mjs`, `node --check`, `git diff --check`, YAML parsing, `pnpm lint:fix`, and `pnpm check`.
