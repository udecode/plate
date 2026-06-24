---
title: Plite headless proof tests must declare cross-package workspace deps under PnP
type: solution
date: 2026-04-09
status: completed
category: developer-experience
module: plite
tags:
  - slate
  - plite
  - yarn-pnp
  - workspace
  - tests
  - headless
  - package-entry
---

# Problem

The new headless owner test in `packages/plite/test/headless-contract.ts`
needed to import `plite-history` and `plite-hyperscript` by package name to
prove real workspace headless composition.

Under Yarn PnP, that failed immediately.

# Symptoms

- `Error: Your application tried to access slate-history, but it isn't declared in your dependencies`
- the test was correct, but the package graph was not

# What Didn't Work

- assuming the root workspace or the other package's own dependencies were
  enough
- relying on package-name imports without declaring them in
  `packages/plite/package.json`

# Solution

Declare the cross-package workspace dependencies on the package that owns the
test:

```json
"devDependencies": {
  "@babel/runtime": "^7.23.2",
  "plite-history": "workspace:*",
  "plite-hyperscript": "workspace:*"
}
```

Then rerun `yarn install` so PnP updates the dependency graph before running
the proof command again.

# Why This Works

The test is proving package-split usage from `packages/plite`.

Under PnP, package-name imports are only sound when the importing package
declares them. Workspace root entries help source resolution after a package is
allowed to load, but they do not bypass the dependency contract itself.

# Prevention

- If a package-owned proof imports another workspace package by name, declare
  that workspace package in the importing package's dependencies or
  devDependencies.
- Do not confuse source-resolvable root entries with permission to import.
- When a new workspace proof suddenly fails under PnP before any behavior runs,
  check the package graph first.
