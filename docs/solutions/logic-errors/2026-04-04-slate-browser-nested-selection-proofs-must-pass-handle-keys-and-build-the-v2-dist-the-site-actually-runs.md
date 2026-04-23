---
date: 2026-04-04
problem_type: logic_error
component: testing_framework
root_cause: logic_error
title: Slate browser nested selection proofs must pass handle keys and build the v2 dist the site actually runs
tags:
  - slate-browser
  - playwright
  - slate-v2
  - selection
  - build
severity: medium
---

# Slate browser nested selection proofs must pass handle keys and build the v2 dist the site actually runs

## What happened

The mixed-inline browser proof exposed two separate lies in the test layer:

1. the nested selection helper could succeed in the page and still report
   `null` in the assertion helper
2. the browser copy proof could stay red even after core and DOM clipboard
   tests were green

Those were not the same bug.

## What fixed it

Two fixes made the browser proof honest:

1. `slate-browser/playwright` page-eval selection snapshots now pass the
   browser-handle key explicitly into the page context, and the helper waits a
   beat for handle hydration before falling back
2. `build:slate-browser:playwright` now rebuilds `slate-v2` alongside the
   other v2 packages, because the site examples consume built package dist files

Without the first fix, nested-path selection assertions could return `null`
even while the real page selection was correct.

Without the second, the browser lane could run stale `slate-v2` fragment logic
and make clipboard proofs look broken after the core contract was already green.

## Why this works

Playwright page-eval functions do not get free access to module locals.

If a helper depends on a key like `__slateBrowserHandle`, that key has to be
serialized into the browser function explicitly.

Likewise, if the site runs built package outputs, browser proofs are only as
fresh as the dist artifacts they load.

That means browser truth depends on both:

- correct browser-context serialization
- rebuilding every package dist the site actually imports

## Reusable rule

For `slate-browser` and site-example browser proofs:

- never rely on module-scope values inside page-eval without passing them in
- if the site imports package dist files, rebuild every touched package before
  trusting browser results

If core tests are green but the browser proof still looks red, check for stale
dist output before rewriting working logic.

## Related issues

- [2026-04-04-slate-browser-playwright-helpers-must-normalize-zero-width-selection-and-wait-for-selection-sync.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-slate-browser-playwright-helpers-must-normalize-zero-width-selection-and-wait-for-selection-sync.md)
- [2026-04-04-workspace-package-subpath-consumers-may-need-a-targeted-build-before-playwright.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-workspace-package-subpath-consumers-may-need-a-targeted-build-before-playwright.md)
