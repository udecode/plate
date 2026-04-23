---
date: 2026-04-04
problem_type: logic_error
component: testing_framework
root_cause: missing_workflow_step
title: Workspace package subpath consumers may need a targeted build before Playwright
tags:
  - slate-browser
  - playwright
  - yarn-pnp
  - workspace
  - exports
severity: medium
---

# Workspace package subpath consumers may need a targeted build before Playwright

## What happened

After `slate-browser` moved into `packages/` and gained real subpath exports,
repo Playwright tests started importing:

- `slate-browser/playwright`

That import resolved through the package `exports` map to built files under
`dist/playwright/...`.

The package itself was valid.
The tests still failed, because those built subpath files did not exist yet.

## What fixed it

Do not force a full repo build for one package-shaped browser test.

Instead:

1. add a targeted build command for the package
2. run that command before the Playwright slices that import the built subpath

In `../slate-v2` that became:

- `yarn build:slate-browser`
- then `yarn test:slate-browser:e2e`
- `yarn test:slate-browser:ime`
- `yarn test:slate-browser:clipboard`
- `yarn test:slate-browser:anchors`

## Reusable rule

If repo-local Playwright tests consume a workspace package through its public
subpath exports, and those exports point at `dist`, then the package must be
built before those tests run.

Do not “solve” this by falling back to local relative helpers again.

Build the package, not the whole repo, unless the package really depends on a
broader build graph.
