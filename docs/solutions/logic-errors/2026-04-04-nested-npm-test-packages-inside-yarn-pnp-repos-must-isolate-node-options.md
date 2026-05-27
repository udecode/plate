---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: config_error
title: Nested npm test packages inside Yarn PnP repos must isolate NODE_OPTIONS
tags:
  - testing
  - yarn-pnp
  - playwright
  - vitest
  - bun
severity: medium
---

# Nested npm test packages inside Yarn PnP repos must isolate NODE_OPTIONS

## What happened

The `slate-browser` POC used a nested support package with its own `npm`
install, Vitest browser config, and Playwright dependency, but the parent Slate
repo runs on Yarn PnP.

That caused two real integration failures:

1. root `NODE_OPTIONS` / Yarn PnP loader polluted nested npm + Vitest execution
2. Playwright browser install had to match the repo’s Playwright version, not an
   ad hoc `npx playwright install`

## What fixed it

1. Root scripts explicitly unset `NODE_OPTIONS` before entering the nested npm
   package.
2. Browser provisioning uses the repo-scoped Playwright binary:
   `yarn exec playwright install chromium`

## Reusable rule

If a Yarn PnP repo hosts a nested npm-based testing package:

- do not assume root env is harmless
- isolate `NODE_OPTIONS`
- install Playwright browsers with the repo’s own Playwright version

Otherwise the test stack will look fine until the first real browser lane runs,
then fail for reasons that have nothing to do with the product code.
