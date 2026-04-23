---
title: Local registry validation must pack new workspace package dependencies
date: 2026-04-23
category: workflow-issues
module: Registry Automation
problem_type: workflow_issue
component: tooling
symptoms:
  - "`Registry / Validate Registry` fails inside `pnpm templates:update --local`"
  - "`shadcn add editor-ai.json` runs `bun add @platejs/footnote`"
  - "Bun returns `GET https://registry.npmjs.org/@platejs%2ffootnote - 404`"
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: medium
tags:
  - registry
  - templates
  - shadcn
  - github-actions
  - workspace-packages
  - npm
---

# Local registry validation must pack new workspace package dependencies

## Problem

Registry validation can install registry items that depend on packages introduced by the same PR. Those packages are valid locally, but npm does not know about them until after release.

## Symptoms

- `Registry / Validate Registry` is the only failing PR check.
- The failing step is `pnpm templates:update --local`.
- `shadcn add editor-ai.json` reaches `bun add @platejs/footnote`.
- Bun fails with `GET https://registry.npmjs.org/@platejs%2ffootnote - 404`.

## What Didn't Work

- Running the existing local workspace package override after `templates:update --local` is too late. Shadcn has already called `bun add` for registry `dependencies`.
- Removing the package from registry dependencies would hide the CI failure by shipping a broken registry item to users.
- Adding the new package directly to template `package.json` is wrong because templates would try to resolve an unpublished package during normal dependency updates.

## Solution

Give the local registry preparation step enough context to rewrite changed workspace package dependencies before shadcn installs them.

In the PR validation workflow, pass the base ref into `pnpm templates:update --local`:

```yaml
env:
  TEMPLATE_LOCAL_PACKAGE_BASE_REF: origin/${{ github.base_ref }}
  TEMPLATE_SKIP_VERIFY: 'true'
```

Then make `prepare-local-template-registry.mjs` collect workspace package names from registry `dependencies`, intersect them with packages changed since the base ref, build and pack those packages, and rewrite matching dependencies to file tarball specs:

```json
{
  "dependencies": [
    "@platejs/footnote@file:/repo/node_modules/.cache/template-local-packages/platejs-footnote-52.3.10.tgz"
  ]
}
```

That makes shadcn run `bun add @platejs/footnote@file:/...` instead of asking npm for a package that cannot exist yet.

## Why This Works

The failure happens during registry item installation, not during the later template CI step. Local package overrides must therefore be available before `shadcn add` resolves dependencies.

The base-ref filter keeps the fix targeted: published registry dependencies keep using npm, while changed workspace packages in the PR get local tarballs.

## Prevention

- When a registry item depends on a package added by the same PR, make registry validation install that dependency from a local tarball.
- Keep user-facing registry `dependencies` accurate. Do not delete dependencies just to appease CI.
- Test local registry preparation with a fixture that includes a changed workspace package dependency and assert the output uses `package@file:/...`.
- Keep the post-update template override step; it still matters for changed packages already present in template package manifests.

## Related Issues

- [Template updater should generate, not own CI verification](../developer-experience/2026-03-13-template-update-script-should-not-own-ci-verification.md)
