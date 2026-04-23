---
date: 2026-04-04
problem_type: logic_error
component: testing_framework
root_cause: config_error
title: Vitest browser workspace packages under Yarn PnP may need packageExtensions for vite
tags:
  - slate-browser
  - vitest
  - yarn-pnp
  - vite
  - packageextensions
severity: medium
---

# Vitest browser workspace packages under Yarn PnP may need packageExtensions for vite

## What happened

After moving `slate-browser` from a nested npm island into a real workspace
package, the Bun lane still passed and the Playwright lanes still passed.

The Vitest browser lane broke under Yarn PnP with:

- `@vitest/mocker tried to access vite`

This was not the package forgetting to depend on Vitest.
It was the browser stack relying on `vite` through a chain Yarn PnP considered
undeclared.

## What fixed it

The minimal fix was a Yarn package extension in [`../slate-v2/.yarnrc.yml`](/Users/zbeyens/git/slate-v2/.yarnrc.yml):

```yml
packageExtensions:
  "@vitest/mocker@*":
    dependencies:
      vite: "*"
```

After that:

- `yarn workspace slate-browser test` worked as a real workspace command
- the browser contract lane stopped needing the old nested npm escape hatch

## Reusable rule

If a Vitest browser lane moves from a nested npm package into a Yarn PnP
workspace package, expect hidden undeclared dependency assumptions to surface.

Do not immediately retreat back to a sidecar npm island.

First check whether the failure is really a PnP package-extension problem and
fix that at the Yarn boundary.
