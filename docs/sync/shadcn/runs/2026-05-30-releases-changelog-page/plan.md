# Releases Page Changelog Sync

Date: 2026-05-30

Scope: smart-merge shadcn `/docs/changelog` page structure into Plate `/docs/releases`.

## Decision

Pull:

- RSS action in the page title row.
- Latest five entries rendered inline.
- `More Updates` section for older entries.
- Docs-page shell and right-side page anchors.

Preserve:

- Plate `/docs/releases` route and title.
- Plate generated release data and RSS feed.
- Plate release markdown rendering.
- No v0 CTA.

Remove:

- `For major breaking changes through v48, see the v48 migration guide.`

## Implementation Result

- Added a dedicated `/docs/releases` app route for the shadcn-style page shell.
- Split `ReleaseIndex` into latest releases plus a `More Updates` card grid.
- Added release anchor helpers shared by the page and release index.
- Left the MDX release source as a fallback/content source without the v48 intro.

## Visual Evidence

- `screenshots/plate-docs-releases.png`
- `screenshots/shadcn-docs-changelog.png`

## Verification

- `pnpm --filter www exec eslint src/components/release-index.tsx 'src/app/(app)/docs/releases/page.tsx' --fix`
- `pnpm --filter www typecheck`
- Browser proof at `http://localhost:3002/docs/releases`:
  - `h1` is `Releases`
  - RSS action links to `/rss.xml`
  - 5 inline release articles
  - `More Updates` section present with 130 older release cards
  - v48 migration intro absent
  - docs shell present
  - no horizontal overflow at 1175px viewport

## Baseline

This is a scoped partial sync. It does not advance `lastSyncedCommit`.
