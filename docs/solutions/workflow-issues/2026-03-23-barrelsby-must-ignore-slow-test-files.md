---
module: Tooling
date: 2026-03-23
problem_type: workflow_issue
component: tooling
symptoms:
  - "CI failed on the barrel drift step after moving tests to the `*.slow.ts[x]` lane"
  - "`pnpm brl` regenerated package index files that exported slow test files"
root_cause: missing_workflow_step
resolution_type: code_change
severity: medium
tags:
  - barrels
  - barrelsby
  - slow-tests
  - ci
  - tooling
---

# Barrelsby must ignore slow test files

## Problem

The repo now uses two explicit test lanes:

- fast: `*.spec.ts[x]`
- slow: `*.slow.ts[x]`

CI runs `pnpm brl` before `check` and fails the PR if barrel generation changes tracked package files.

After the slow-lane migration, `pnpm brl` started exporting `*.slow` files from package index barrels like:

```ts
export * from './Plate.slow';
export * from './cleanDocx.slow';
```

That is pure garbage. Slow tests are not runtime exports.

## Root cause

`tooling/scripts/brl.sh` already excluded `spec` files, but not `slow` files:

```sh
common_excludes='.*__tests__.*|(.*(fixture|template|spec|internal).*)|(.*\.d\.ts$)'
```

So once tests were renamed from `*.spec.*` to `*.slow.*`, barrelsby treated them as normal source files and generated export lines for them.

## Fix

Exclude `slow` the same way `spec` is excluded:

```sh
common_excludes='.*__tests__.*|(.*(fixture|template|spec|slow|internal).*)|(.*\.d\.ts$)'
```

After that, rerunning `pnpm brl` removes the bogus `export * from './*.slow'` entries and CI stops failing on barrel drift.

## Verification

These checks passed:

```bash
pnpm brl
pnpm check
```

## Prevention

When the repo adds a new test-file suffix, update barrel-generation exclusions in the same change.

If the naming model is:

- runtime files
- `*.spec.*`
- `*.slow.*`

then barrel tooling must explicitly ignore both test suffixes, not just the old one.
