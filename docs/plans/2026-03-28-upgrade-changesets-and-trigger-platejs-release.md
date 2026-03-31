# Upgrade Changesets And Trigger Platejs Release

## Goal

Upgrade Changesets to the latest release used by this repo, then add a core patch changeset so the next Version Packages run has another shot at versioning `platejs`.

## Context

- User wants the upgrade done first
- `../changesets` exists for upstream source review
- Current repo pin surfaced in root `package.json`:
  - `@changesets/cli`: `2.29.7`
  - `@changesets/get-github-info`: `0.6.0`
- This work touches release tooling, not runtime code

## Relevant Learnings

- `docs/solutions/workflow-issues/2026-03-26-platejs-umbrella-package-should-publish-compatible-workspace-ranges.md`

## Plan

1. Read the release-related learning and current release config
2. Determine the latest Changesets versions worth upgrading to
3. Apply the dependency upgrade and lockfile update
4. Add a new core patch changeset
5. Run focused verification for Changesets tooling

## Progress

- [x] Started investigation
- [x] Located current Changesets pins
- [ ] Read release learning and upstream context
- [ ] Upgrade Changesets
- [ ] Add core patch changeset
- [ ] Verify

## Notes

- No browser surface
- Need exact latest version data, not stale memory
