---
title: PR lint fails on code not present on the branch
category: build-errors
date: 2026-03-18
tags:
  - ci
  - lint
  - github-actions
  - biome
  - merge-commit
---

# PR lint fails on code not present on the branch

## Problem

GitHub Actions reported a `pnpm lint` failure in `apps/www/src/registry/ui/font-color-toolbar-button.tsx`, but the failing line did not exist on the branch being tested.

## Root cause

The PR workflow was effectively linting the merge result against `main`, not just the branch head.

The branch still had an older copy of `font-color-toolbar-button.tsx`, while `origin/main` had a newer implementation with this line:

```tsx
isSelected={!!color && normalizeColor(color) === normalizeColor(value)}
```

Biome wanted that prop wrapped across multiple lines. Because the branch did not touch the file, the merge-state workflow picked up the `main` version and failed there.

## How to verify

Check the failed run and compare the branch file with the base branch file.

```bash
gh run view <run-id> --log-failed
git show HEAD:apps/www/src/registry/ui/font-color-toolbar-button.tsx | rg -n "normalizeColor"
git show origin/main:apps/www/src/registry/ui/font-color-toolbar-button.tsx | rg -n "normalizeColor"
```

If the failing code only appears in `origin/main`, the CI job is failing on merge-state content.

## Fix

Bring the file in sync with `origin/main`, then format the offending prop with Biome.

```tsx
isSelected={
  !!color && normalizeColor(color) === normalizeColor(value)
}
```

## Verification

Run the same checks CI runs, then verify the app package still builds and typechecks.

```bash
corepack pnpm lint
corepack pnpm turbo build --filter=./apps/www
corepack pnpm turbo typecheck --filter=./apps/www
```

## Prevention

- When a PR error references code that is missing from the branch, inspect the failed Actions run before editing local files.
- Compare `HEAD` and `origin/main` for the reported file before assuming the branch is out of sync with local reproduction.
- If the problem only exists in merge-state, rebase or merge `main` early so the PR diff and CI input match.
