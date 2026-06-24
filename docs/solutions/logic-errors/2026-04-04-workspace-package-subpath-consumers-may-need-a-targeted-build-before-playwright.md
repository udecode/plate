---
date: 2026-04-04
problem_type: logic_error
component: testing_framework
root_cause: missing_workflow_step
title: Workspace package subpath consumers may need a targeted build before Playwright
tags:
  - plite-browser
  - playwright
  - yarn-pnp
  - workspace
  - exports
severity: medium
---

# Workspace package subpath consumers may need a targeted build before Playwright

## What happened

After `plite-browser` moved into `packages/` and gained real subpath exports,
repo Playwright tests started importing:

- `plite-browser/playwright`

That import resolved through the package `exports` map to built files under
`dist/playwright/...`.

The package itself was valid.
The tests still failed, because those built subpath files did not exist yet.

## What fixed it

Do not force a full repo build for one package-shaped browser test.

Instead:

1. add a targeted build command for the package
2. run that command before the Playwright slices that import the built subpath

In `Plate repo root` that became:

- `yarn build:plite-browser`
- then `yarn test:plite-browser:e2e`
- `yarn test:plite-browser:ime`
- `yarn test:plite-browser:clipboard`
- `yarn test:plite-browser:anchors`

## Reusable rule

If repo-local Playwright tests consume a workspace package through its public
subpath exports, and those exports point at `dist`, then the package must be
built before those tests run.

Do not “solve” this by falling back to local relative helpers again.

Build the package, not the whole repo, unless the package really depends on a
broader build graph.
