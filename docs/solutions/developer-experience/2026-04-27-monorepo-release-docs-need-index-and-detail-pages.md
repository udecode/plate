---
title: Monorepo release docs need a typed expanded feed
date: 2026-04-27
category: docs/solutions/developer-experience
module: Docs release automation
problem_type: developer_experience
component: tooling
symptoms:
  - The release overview became a long package changelog instead of a navigable index.
  - The Base UI alternating timeline pattern was too narrow for Plate's monorepo release payload.
  - Major-only extraction hid minor and patch package changes from the generated release docs.
  - Keeping every generated release page forever would make docs carry stale patch/minor history that GitHub already archives.
  - Repo-level tag comparisons were empty because Changesets publishes package tags, not a single monorepo release diff.
  - Runtime release fetching made `/docs/releases` feel slow and could leave stale route/client chunks in local dev.
root_cause: scope_issue
resolution_type: tooling_addition
severity: medium
tags: [release-docs, changesets, mdx, monorepo, tooling, github-releases]
last_updated: 2026-05-01
---

# Monorepo release docs need a typed expanded feed

## Problem

Plate's Changesets output is package-granular and typed by package. Copying a single-product release timeline made the overview look nice, but it forced too much package detail into one page and hid minor and patch changes when the docs only extracted `### Major Changes`.

The durable version is to use the Version Packages PR body as the docs source and keep `/docs/releases` as a generated recent feed. The workflow copies the PR description into checked-in release data, so the docs page renders immediately without fetching GitHub at runtime.

## Symptoms

- `/docs/releases` needed one-click access to the full release notes without per-package links.
- Timeline cards worked for short curated summaries, but Plate needed room for package-level migration notes.
- Package badges could not show whether a package entry was major, minor, or patch.
- Wrapped Changesets bullets put the PR link in the middle of generated prose when continuation lines were formatted separately.

## What Didn't Work

- A Base UI-style left/right timeline looked good for two cards, but it compressed real Plate releases into tiny alternating blocks.
- Deriving card summaries from the first bullet of each package changelog was fake structure. Changesets gives package sections, not curated release abstracts.
- Keeping every package changelog on `/docs/releases` made the page scale badly as releases accumulate.
- Extracting only major sections dropped legitimate package release notes from mixed releases.
- Storing generated release dates as arbitrary frontmatter made Contentlayer warn because `date` is not part of the `Doc` schema.
- Linking to repo compare URLs such as `v53.0.1...v53.0.2` produced empty changelogs for package-only Changesets releases.
- Fetching release data at runtime made a static docs page depend on GitHub response time and local dev route cache invalidation.

## Solution

Generate release docs from the Version Packages PR body:

- `.github/workflows/release.yml` sets `changesets/action` `createGithubReleases: false`.
- After `changesets/action` creates or updates `[Release] Version packages`, the workflow checks out that PR and runs `tooling/scripts/sync-version-package-releases.mjs --pr <number>`.
- `tooling/scripts/sync-version-package-releases.mjs` parses the PR description's `# Releases` section, groups package headings by version, and writes `apps/www/src/generated/release-index.json`.
- For historical backfills, run `node tooling/scripts/sync-version-package-releases.mjs --latest <count> --from v49` so the docs include every generated release entry from v49 onward without pulling older history.
- The generated entry keeps the Better Auth-style body, points `CHANGELOG` at the selected package's `CHANGELOG.md` when a repo-level GitHub Release exists, falls back to the Version Packages PR otherwise, and stores a preferred package tag for compare links.
- Preferred tags use `platejs@version` when that package published, otherwise the first package tag in the release PR body.
- `Full changelog` links compare the previous generated release's preferred package tag to the current release's preferred package tag.
- `tooling/scripts/release-notes.mjs` reads `PUBLISHED_PACKAGES`, resolves the matching package directories, extracts each package's exact `CHANGELOG.md` section, and emits deterministic raw notes grouped by package with one bottom `For detailed changes, see CHANGELOG` link plus one `Full changelog` compare link.
- The parser folds indented continuation lines into the same bullet before moving `[#1234] by @user` metadata to the end of the sentence.
- `.github/prompts/release-notes-rewrite.md` lets Claude polish the raw notes, but validation keeps package headings, change-type headings, PR links, the full changelog link, entry count, and migration notes intact.
- The release workflow creates or updates one repo-level `vX.Y.Z` GitHub Release using the validated AI notes or the raw notes.
- `content/releases/index.mdx` renders `<ReleaseIndex />`; the component imports the generated JSON directly.

The release-note generator shape is:

```md
## `@platejs/table`

### Major Changes

- [#4941](https://github.com/udecode/plate/pull/4941) by [@zbeyens](https://github.com/zbeyens) – ...

For detailed changes, see [`CHANGELOG`](https://github.com/udecode/plate/blob/<commit>/<package>/CHANGELOG.md)

Full changelog: [`v53.0.4...v53.0.5`](https://github.com/udecode/plate/compare/<previous-tag>...<current-tag>)
```

## Why This Works

The feed answers "what changed recently?" without inventing summaries. Each release row carries all package changes inline, with Better Auth-style fade/expand behavior for long releases. Released rows link the title to the GitHub Release, link `CHANGELOG` to the selected package changelog file, and keep the compare footer; unreleased generated rows can fall back to the Version Packages PR.

Package-tag compares solve the one-click diff problem without relying on nonexistent repo tags. When `platejs` is published, the compare uses `platejs@version`; otherwise it uses the first published package tag for that version.

Checked-in JSON avoids GitHub API latency and Vercel runtime fetch cost entirely. The client component stays inside the existing MDX component registry but renders static data.

## Prevention

- Do not generate prose summaries from Changesets package bullets unless a real curated summary source exists.
- Backfill with a version floor, not a fixed page-size assumption. Verify the generated JSON count plus first and last tags before checking the browser.
- Do not fetch GitHub Releases at docs runtime for the main release feed. Generate the feed from the Version Packages PR body.
- Do not copy Better Auth's product-domain `pr-analyzer` into Plate. Plate's reliable grouping source is each package's Changesets changelog section.
- Do not link release docs to repo `vX.Y.Z` comparisons for Changesets package releases. Compare package tags instead.
- Keep AI release-note rewrites behind deterministic raw notes and validation. AI can polish, but package headings, PR links, the full changelog link, entry counts, and migration notes are structural truth.
- Test wrapped Changesets bullets directly. A multi-line bullet should render the full sentence first and append the PR link after the folded summary.
- If the docs component is rendered through the client MDX component registry, prefer checked-in generated data over a runtime fetch.
- While historical GitHub Releases are package-tagged, keep one row per version and never expose one primary click per package.

## Related Issues

- [Generated MDX markers must use JSX comments](./2026-04-27-mdx-generated-markers-must-use-jsx-comments.md)
