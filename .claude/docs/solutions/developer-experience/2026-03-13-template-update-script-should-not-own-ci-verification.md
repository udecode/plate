---
module: Registry Automation
date: 2026-03-13
problem_type: developer_experience
component: tooling
symptoms:
  - "`registry.yml` failed inside `pnpm templates:update --local` before workflow-level template checks even ran"
  - "`update-template.sh` died on `bun lint:fix` with template-local Biome unresolved-import noise"
  - "GitHub Actions could fail inside `shadcn add` with `ERR_MODULE_NOT_FOUND` for `tinyexec`"
root_cause: workflow_boundary_error
resolution_type: tooling_change
severity: medium
tags:
  - templates
  - shadcn
  - registry
  - github-actions
  - ci
  - tooling
---

# Template updater should generate, not own CI verification

## Problem

`registry.yml` was calling `pnpm templates:update --local`, and that helper script was also running its own `bun lint:fix` and `bun typecheck`.

That meant the workflow could fail inside the updater before the actual workflow checks ran. The failure looked like a registry sync problem, but it was really a bad boundary: the helper script was trying to be a mini CI pipeline.

## Root cause

Two things were wrong:

1. `update-template.sh` mixed generation with verification.
2. local shadcn installs still had sharp edges:
   - `npx shadcn@latest` was not reliable in CI and could blow up on transitive module resolution
   - local-file installs could write relative imports with `.ts` or `.tsx` extensions back into generated files
   - generated template files needed to be lint-fixed and committed, or `ci-templates` would fail on formatting drift

The first issue made the workflow brittle. The second made the updater noisy and flaky.

## Fix

Keep verification at the workflow layer.

In `tooling/scripts/update-template.sh`:

- use `pnpm dlx shadcn@latest add ...` instead of `npx`, which avoided the Actions-only `tinyexec` module failure
- normalize relative `.ts` and `.tsx` import specifiers after local-file installs
- always run `bun lint:fix` so generated template files are normalized immediately
- support `TEMPLATE_SKIP_VERIFY=true` to skip only the script-local `bun typecheck`

In the workflows:

- set `TEMPLATE_SKIP_VERIFY=true` when running `pnpm templates:update --local`
- run template `bun lint` and `bun run build` checks after sync at the workflow level instead of inside the helper
- reproduce the registry and template paths with `gh act` before pushing a fix when CI behavior is unclear

That keeps the updater focused on generation and keeps CI responsible for CI.

## Why this works

The workflow now has one clear boundary:

- updater script: mutate template files and normalize them with `bun lint:fix`
- workflow: decide what to verify and when to fail

So a registry sync no longer dies because the helper script wandered into unrelated typecheck noise, while the generated output is still cleaned up before CI checks it.

## Gotchas

### Don’t patch template-local Biome config as a workaround

That just moved the mess around and widened lint scope in ugly ways. The problem was not “templates need special Biome config.” The problem was “the wrong layer was running verification.”

### Template Biome needs two rules off

For generated templates, Biome was also a bad source of false failures:

- `noUnresolvedImports` flagged valid package imports, alias imports, and even `eslint.config.mjs` imports
- `useImportExtensions` re-added relative `.ts` and `.tsx` extensions that break the template TypeScript config on build

The stable fix was to disable both rules in the template `biome.jsonc` files and let `update-template.sh` run `bun lint:fix` immediately after generation.

### Generated template churn is part of the fix

`templates:update --local` plus `bun lint:fix` can legitimately rewrite a lot of generated template files. If CI is failing on template lint after a registry sync, that churn usually belongs in the commit. Pretending it is unrelated just leaves `ci-templates` red.

## Verification

These commands passed after the fix:

```bash
pnpm lint
pnpm --filter www rd
TEMPLATE_SKIP_VERIFY=true pnpm templates:update --local
cd templates/plate-template && bun lint && bun run build
cd templates/plate-playground-template && bun lint && bun run build
gh act pull_request -W .github/workflows/ci-templates.yml -j ci
gh act pull_request -W .github/workflows/registry.yml -j validate-registry
```

The full repo gate also passed:

```bash
bun check
```

Before Docker was available, `gh act` failed immediately with:

```text
Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

After Docker was up, both local workflow reproductions passed:

```bash
cd templates/plate-template && bun run build
cd templates/plate-playground-template && bun run build
bash -n tooling/scripts/update-template.sh
```
