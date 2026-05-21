# Release PR Auto-Release Fix

## Goal

Fix the follow-up release PR behavior after PR #4957:

- Do not add the managed `Auto release` checkbox to PRs whose title contains `Version packages`.
- Unblock generated release PR auto-merge by letting the required `CI` check run instead of skipping it.
- Remove the stray checkbox from PR #4961.

## Findings

- PR #4961 title is `[Release] Version packages`.
- PR #4961 has auto-merge enabled, but `mergeStateStatus` is `BLOCKED`.
- The active ruleset for `main` requires `CI` and `Vercel`.
- PR #4961 has `Vercel` success and `CI` skipped.
- `.github/workflows/ci.yml` skips pull requests whose title is exactly `[Release] Version packages`.
- `.github/workflows/changeset-auto-release.yml` currently manages any PR with a `.changeset/*.md` filename, including generated release PRs that delete changesets.
- `bun test tooling/scripts/auto-release-pr.test.mjs` failed before the helper export existed, then passed after adding the title guard helper.
- Editing PR #4961 before this workflow fix lands triggers the old `Sync auto-release checkbox` workflow, which re-adds the block because it still runs on `[Release] Version packages`.

## Plan

1. [complete] Confirm the root cause with PR metadata and repo rulesets.
2. [complete] Add helper coverage for release PR title detection and block removal.
3. [complete] Skip checkbox management for `Version packages` PR titles.
4. [complete] Let CI run on release PR pull_request events.
5. [complete] Verify with targeted tests and repo checks.
6. [in_progress] Commit, push, open PR.
7. [pending] Clean up PR #4961 body after the workflow fix lands.

## Verification

- `bun test tooling/scripts/auto-release-pr.test.mjs` failed before implementation, then passed after the helper/workflow fix.
- `node --check tooling/scripts/auto-release-pr.mjs && node --check tooling/scripts/auto-release-pr.test.mjs` passed.
- `ruby -e 'require "yaml"; ...' .github/workflows/ci.yml .github/workflows/changeset-auto-release.yml` passed.
- `git diff --check` passed.
- `pnpm lint:fix` passed with no fixes.
- `pnpm check` passed. Existing warning: `apps/www/src/registry/ui/footnote-node.tsx` hook dependency warning.
