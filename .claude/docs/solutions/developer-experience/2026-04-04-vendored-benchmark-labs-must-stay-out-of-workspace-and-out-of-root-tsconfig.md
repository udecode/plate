---
date: 2026-04-04
problem_type: developer_experience
component: tooling
root_cause: missing_tooling
title: Vendored benchmark labs must stay out of workspace and out of root tsconfig
tags:
  - benchmarks
  - workspace
  - nextjs
  - tsconfig
  - monorepo
severity: medium
---

# Vendored benchmark labs must stay out of workspace and out of root tsconfig

## What happened

The standalone editor benchmark lab was moved into `plate-2` under
`benchmarks/editor` to keep it close to local package code without polluting the
main workspace.

The copy itself was fine.
The first root viewer build was not.

`next build` in the moved lab started typechecking `apps/plate/src/App.tsx`
and `apps/slate/src/App.tsx` through the root Next app config, even though
those target apps are separate subprojects with their own installs.

That produced a fake cross-project type failure.

## What fixed it

Keep the lab isolated at two layers:

1. repo-level isolation
   - do not add it to `pnpm-workspace.yaml`
   - do not add it to Turbo
   - keep its own lockfile and installs
2. tsconfig isolation
   - the root viewer `tsconfig.json` must exclude sibling target apps and other
     unrelated subprojects
   - in this case:
     - `apps`
     - `tests`
     - `website`

Once the root viewer stopped typechecking the target apps, the moved lab built
cleanly from its new location.

## Reusable rule

If you vendor a standalone benchmark or lab app inside a larger repo:

- keep it outside the main workspace graph
- keep its target apps outside the root app’s TypeScript include set

Otherwise the parent app will start typechecking subprojects with the wrong
dependency graph and you’ll get bullshit failures that look like real debt.
