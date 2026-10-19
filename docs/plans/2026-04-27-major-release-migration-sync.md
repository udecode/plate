# Release Workflow and Docs Sync

## Goal

Hard cut Plate's generated release-doc body sync and move to a Better Auth-style release architecture: Changesets publishes packages, the workflow creates one global GitHub Release with deterministic package-changelog notes plus Claude polish, and `/docs/releases` renders GitHub Releases instead of storing giant generated changelog blobs in MDX.

## Scope

- Release automation only.
- Source of truth: Changesets version output and package `CHANGELOG.md` sections for the published package versions.
- Target: GitHub Releases as the release-note CMS, with `/docs/releases` fetching and rendering recent repo-level releases.
- Keep: Plate's `prepare-release-changesets` step, auto-release checkbox flow, and post-publish registry/template sync jobs.
- Cut: generated release body sync into `content/releases/index.mdx`, repo compare links, the temporary `global-release` helper, Better Auth beta/LTS/snapshot branch support, and Better Auth's product-domain `pr-analyzer`.
- Verification: focused script tests, workflow assertions, docs typecheck, lint, and Browser Use verification for `/docs/releases`.

## Plan

1. Research current release workflow and Changesets hooks. - complete
2. Implement a deterministic migration sync script. - complete
3. Wire release workflow to run the script during version PR generation. - complete
4. Add focused tests for release extraction and no-op cases. - complete
5. Run targeted verification. - complete
6. Check Base UI release docs pattern and expose a manual sync command. - complete
7. Copy Base UI release timeline design into the releases overview. - superseded
8. Move the release overview to `/docs/releases` and sidebar Get Started. - complete
9. Replace the timeline with a compact release index and split release details into `v*.mdx` pages. - superseded by 12
10. Expand release docs from major-only to major/minor/patch package entries. - complete
11. Auto-prune release docs to the last year and link older releases to GitHub. - complete
12. Replace generated detail pages with a Better Auth-style expanded feed. - complete
13. Create a repo-level GitHub Release from the Version Packages PR body. - complete
14. Hard cut the generated release-doc body sync and temporary global-release helper. - complete
15. Copy Better Auth's release workflow/script architecture as the starting point. - complete
16. Prune Better Auth branch modes: `next`, `release/**`, maintenance dist-tags, main-to-next sync, and snapshot releases. - complete
17. Keep the Claude AI release-note rewrite path and adapt its prompt to Plate. - complete
18. Replace Better Auth's `pr-analyzer` with a Plate package-changelog parser. - complete
19. Generate deterministic raw notes from `PUBLISHED_PACKAGES` and each package's matching `CHANGELOG.md` section. - complete
20. Validate AI output preserves package headings, change-type headings, PR links, entry count, and migration notes. - complete
21. Create or update a global `vX.Y.Z` GitHub Release from the validated AI notes, falling back to raw notes. - complete
22. Convert `/docs/releases` to fetch GitHub Releases with revalidation and a GitHub-link fallback. - superseded by 25
23. Keep Plate's registry/template post-release job and auto-release checkbox behavior. - complete
24. Add focused tests for release-note parsing, workflow pruning, AI-output validation, and docs fetch mapping. - complete
25. Stop runtime fetching releases and generate `/docs/releases` from the Version Packages PR body. - complete
26. Change `Full changelog` links to GitHub compare links using the preferred package tag per version. - complete
27. Verify generated docs, focused tests, typecheck, lint, and Browser Use. - complete

## Findings

- `.github/workflows/release.yml` uses `changesets/action@v1` to create `[Release] Version packages`.
- The old release overview lived at `content/migration/index.mdx` and contained the raw Changesets release-PR intro, which suggests release PR body content was copied into the page instead of curated by automation.
- `tooling/scripts/prepare-release-changesets.mjs` runs before `changesets/action`; it prepares extra changesets but cannot see the generated changelogs/versioned package files.
- The right insertion point is a custom Changesets `version` command: run `pnpm changeset version`, then sync release changelog sections into `content/releases/index.mdx`.
- `changesets/action@v1` supports a `version` input for the command that updates package versions and changelogs.
- `tooling/scripts/sync-release-docs.mjs` parses package changelogs after versioning, extracts `### Major Changes`, `### Minor Changes`, and `### Patch Changes`, and writes typed package entries.
- Base UI keeps release docs at `docs/src/app/(docs)/react/overview/releases`: an overview timeline page, one `page.mdx` per release, and `docs/src/data/releases.ts` metadata.
- Base UI does not have a full release-doc sync script. Its `scripts/README.md` says to run `pnpm release:changelog:docs`, create the release page manually, and update `releases.ts`.
- Base UI's changelog generation comes from `@mui/internal-code-infra` through `pnpm release:changelog` and `pnpm release:changelog:docs`, with `scripts/changelog.config.mjs` formatting docs output.
- For Plate's current Changesets setup, the matching first step is a manual `pnpm release:releases` wrapper around the sync script, then redesign the docs shape later.
- The first Base UI-inspired timeline pass rendered, but the shape was wrong for Plate's monorepo release payload.
- Plate needs generated release data because this repo is a monorepo. A curated single-product timeline does not fit; the useful shape is a typed expanded feed with fade/expand for long releases.
- Contentlayer rejects HTML comment markers in MDX. Generated markers must use `{/* ... */}` comments.
- The alternating Base UI timeline does not fit Plate's release payload. It works for short curated release summaries, not for broad Changesets output across dozens of packages.
- The all-release sync must not cross-multiply package versions. Each package parses its own current version, plus explicit historical major pages the docs already own.
- Release docs use package tag dates for retention. Version-PR output has no tag yet, so new generated entries use the current sync date.
- Better Auth's reusable changelog pieces are the exact-release GitHub link, dashed feed rhythm, markdown rendering, and fade/expand body. The sticky marketing panel does not belong inside Plate's docs shell.
- `content/releases/index.mdx` is now the canonical retained-release store. The sync parses generated `<ReleaseIndex />` data back on the next run, then deletes any remaining generated `v*.mdx` pages.
- Repo-level tag comparisons such as `v53.0.1...v53.0.2` are empty for Changesets package-only releases, so they are the wrong docs target.
- The release workflow can create or update a repo-level GitHub Release named `vX.Y.Z` after publish, using the merged Version Packages PR body as the one-click full changelog.
- Better Auth does not write release notes into docs files. Its workflow writes GitHub Releases, and `docs/app/changelog/page.tsx` fetches `https://api.github.com/repos/better-auth/better-auth/releases` with `next: { revalidate: 3600 }`.
- Better Auth's Claude action uses `claude_code_oauth_token`. Keep this path in the plan, but keep deterministic raw notes as the fallback and validation source of truth.
- Better Auth's snapshot job publishes temporary package versions with `changeset version --snapshot` and `changeset publish --no-git-tag --tag "$SNAPSHOT_TAG"`. Plate should prune this for now.
- Better Auth's `pr-analyzer.ts` maps conventional commit scopes, PR labels, and changed files to Better Auth product domains and packages. Plate should not copy it because Plate's reliable grouping already exists in Changesets package changelogs.
- Plate uses a linked Changesets group, not Better Auth's fixed group. Released linked packages align versions, but unchanged packages do not necessarily publish on every release.

## Hard-Cut Implementation Plan

### 1. Workflow Baseline

Start from Better Auth's `.github/workflows/release.yml`, then adapt it for Plate:

- Keep `push` on `main`.
- Keep `workflow_dispatch` only for release-note preview once the deterministic script exists.
- Keep `concurrency`, pinned actions, job-scoped permissions, GitHub App token support, and `persist-credentials: false`.
- Set `changesets/action` `createGithubReleases: false`.
- Keep Plate's `node tooling/scripts/prepare-release-changesets.mjs` before `changesets/action`.
- Keep Plate's auto-release checkbox detection and Version Packages PR merge path, using an app token or `API_TOKEN_GITHUB`, not default `GITHUB_TOKEN`.
- Keep Plate's `sync-release-artifacts` job after publish.

Prune from Better Auth:

- `next` branch trigger and guard.
- `release/**` branch trigger and maintenance dist-tags.
- `Sync main to next via PR`.
- Snapshot input and whole snapshot job.
- Better Auth blog-post injection.
- Better Auth package/domain classifier.

### 2. Release Commands

Add or adapt root scripts:

- `ci:version`: `pnpm changeset version && pnpm install --no-frozen-lockfile`
- `ci:release`: current Plate publish path, still building before `changeset publish`

Remove `pnpm release:releases` from the Changesets `version` command once `/docs/releases` no longer stores generated release bodies.

### 3. Deterministic Notes

Create a Plate-specific release-note script, likely under `.github/scripts/release-notes.ts` or `tooling/scripts/release-notes.mjs`:

- Input: `PUBLISHED_PACKAGES` from `changesets/action`.
- Determine global version from the highest published package version.
- Build a workspace package map from package manifests.
- For each published package, find its package directory and matching `CHANGELOG.md`.
- Extract the section for the published version.
- Preserve `### Major Changes`, `### Minor Changes`, and `### Patch Changes`.
- Emit markdown grouped by package.
- Add per-package `CHANGELOG.md` links pinned to `GITHUB_SHA`.
- Do not emit repo compare links.
- Optionally collect contributors from PR links in the extracted changelog body.

Do not copy Better Auth's `pr-analyzer.ts`. If a helper is needed, make it a small package-map/changelog parser, not a product-domain classifier.

### 4. Claude Polish

Keep Better Auth's Claude rewrite shape:

- Generate raw release notes.
- Build a prompt from `.github/prompts/release-notes-rewrite.md`.
- Run Claude with `claude_code_oauth_token`.
- Validate output.
- Use AI notes only if validation passes; otherwise use raw notes.

Adapt the prompt for Plate:

- Plate is a rich-text editor framework.
- Preserve package headings.
- Preserve Major/Minor/Patch headings.
- Preserve PR links and package `CHANGELOG` links.
- Preserve migration notes, especially breaking changes.
- Do not add or remove entries.
- Do not add repo compare links.

Validation must check:

- Same package headings as raw notes.
- Same change-type headings where entries exist.
- PR-link count is not lower than raw notes.
- Entry count is not lower than raw notes.
- Migration-note blocks under breaking changes are still present.

### 5. Global GitHub Release

After publish:

- Determine `VERSION` from release-note output or `PUBLISHED_PACKAGES`.
- Create `refs/tags/v${VERSION}` at `GITHUB_SHA` if missing.
- Create or update GitHub Release `v${VERSION}`.
- Use AI notes if valid, raw notes otherwise.
- Treat release creation failure as a real failure, because docs now depend on GitHub Releases.

### 6. Docs Page

Convert `/docs/releases` to GitHub Releases as the data source:

- Fetch `https://api.github.com/repos/udecode/plate/releases`.
- Use `next: { revalidate: 3600 }`.
- Use `GITHUB_TOKEN` when present.
- Filter prereleases for now.
- Render latest 20-ish releases.
- Keep Better Auth-style fade/expand markdown rendering.
- Add a fallback state linking to GitHub Releases if the fetch fails.
- Stop embedding all release bodies in `content/releases/index.mdx`.

### 7. Tests and Verification

Focused tests:

- Release-note script resolves the global version from `PUBLISHED_PACKAGES`.
- Package changelog extraction finds the exact published version section.
- Major/minor/patch sections are preserved.
- No repo compare URL is emitted.
- AI validation rejects removed package headings, removed PR links, removed entries, or dropped migration notes.
- Workflow is main-only and contains `createGithubReleases: false`.
- Workflow does not contain `next`, `release/**`, snapshot job, or Better Auth `pr-analyzer`.
- Docs fetch mapper filters prereleases and handles fetch failure.

Verification commands:

- `node --test` for focused release workflow/docs tests.
- `pnpm lint:fix`.
- `pnpm --filter www typecheck`.
- Browser Use check for `/docs/releases`.

## Progress

- 2026-04-27: Started from user request, inspected release workflow, migration doc, changeset config, and existing release helper tests.
- 2026-04-27: Added the release-doc sync script, focused node tests, and wired release workflow `version` command.
- 2026-04-27: Ran focused node tests successfully. Ran sync script; it backfilled five `53.0.0` package sections into the generated major releases page.
- 2026-04-27: Fixed idempotence, added a workflow wiring assertion, reran tests and lint successfully. Final script run reported the page was already up to date.
- 2026-04-27: Inspected Base UI release docs and release scripts. Added a manual release-doc sync command and changed the workflow to call it after `pnpm changeset version`.
- 2026-04-27: Verified the manual sync command, focused node tests, and `pnpm lint:fix`.
- 2026-04-27: Added `ReleaseTimeline`, registered it for MDX, and updated the sync script to generate the timeline block above the release sections.
- 2026-04-27: Verified focused node tests, release sync, `pnpm lint:fix`, `pnpm --filter www typecheck`, and `browser-use` desktop/mobile screenshots for the release page.
- 2026-04-27: Captured the MDX marker learning in `docs/solutions/developer-experience/2026-04-27-mdx-generated-markers-must-use-jsx-comments.md`.
- 2026-04-27: Moved the overview file to `content/releases/index.mdx`, exposed `/docs/releases`, and moved the sidebar item to Get Started after Installation.
- 2026-04-27: Verified `/docs/releases` rendered the release timeline, `Releases` appeared immediately after `Installation` in the sidebar, and `/docs/migration` no longer rendered the old release overview.
- 2026-04-27: Replaced `ReleaseTimeline` with `ReleaseIndex`, refactored `pnpm release:releases` to generate compact index metadata plus `content/releases/v53.mdx` and `content/releases/v49.mdx`, and kept the script idempotent.
- 2026-04-27: Verified focused script tests, release sync idempotence, `pnpm lint:fix`, `pnpm --filter www typecheck`, and `browser-use` desktop/mobile checks for `/docs/releases` and `/docs/releases/v53`.
- 2026-04-27: Captured the monorepo release-doc shape in `docs/solutions/developer-experience/2026-04-27-monorepo-release-docs-need-index-and-detail-pages.md`.
- 2026-04-27: Expanded the generator to all change types, added typed package badges, added full-version slugs for minor/patch pages, and fixed a cross-version parsing bug caught by tests.
- 2026-04-28: Removed visible change-type text from package chips and fixed callout icons by using stroked lucide icons instead of filled SVGs.
- 2026-04-30: Added one-year release-doc retention, package-tag date lookup, old-page pruning, and an older releases GitHub link.
- 2026-04-30: Replaced generated `v*.mdx` pages with an expanded Better Auth-style feed, added exact GitHub release links, preserved retained inline bodies through generator parsing, and deleted the remaining generated detail pages.
- 2026-04-30: Removed generated repo compare links because Changesets publishes package tags. Added a post-publish global GitHub Release step that copies the merged Version Packages PR body into `vX.Y.Z`.
- 2026-04-30: Updated the next plan to hard cut generated release-doc bodies, keep Claude AI rewrite, skip Better Auth's product-specific `pr-analyzer`, and use package changelog sections as the deterministic release-note source.
- 2026-04-30: Hard cut `sync-release-docs` and `global-release`, added `tooling/scripts/release-notes.mjs`, added the Claude rewrite prompt, and rewired `release.yml` to create one repo-level `vX.Y.Z` GitHub Release after publish.
- 2026-04-30: Converted `/docs/releases` to load recent GitHub Releases through a cached same-origin API route. Current package-only GitHub Releases are grouped by version until the next repo-level releases exist.
- 2026-04-30: Verified focused release tests, `pnpm lint:fix`, `pnpm --filter www typecheck`, and Browser Use on `http://localhost:3001/docs/releases`.
- 2026-04-30: Superseded runtime GitHub Release fetching with generated `apps/www/src/generated/release-index.json` from Version Packages PR bodies. `Full changelog` now links to package-tag compare URLs, using `platejs@version` when present and the first package tag otherwise.
- 2026-04-30: Verified the generated release page in Browser Use after restarting the dev server to clear a stale deleted route/chunk. `v53.0.3` links to compare `%40platejs/list@53.0.2...platejs@53.0.3`, and `CHANGELOG` links to Version Packages PR #4969.

## Errors

- `pnpm lint:fix` failed on first run because Biome requires regex literals in the release-doc sync script to be module-level constants. Moved regexes to top-level constants.
- `pnpm --filter www typecheck` failed once because Contentlayer does not accept HTML comments in MDX. Switched generated markers to JSX comments and kept legacy marker replacement.
- `pnpm --filter www build` was started accidentally and ran the CI-owned registry build before the Next build completed. Restored the generated `apps/www/public/r/*` outputs and used the targeted typecheck path instead.
