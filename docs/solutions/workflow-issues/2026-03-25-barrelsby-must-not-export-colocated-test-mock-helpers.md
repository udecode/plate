---
module: Tooling
date: 2026-03-25
problem_type: workflow_issue
component: tooling
symptoms:
  - "`pnpm brl` generated `export * from './tocHookMocks'` inside a public hooks barrel"
  - "A shared test helper became part of the package export surface"
root_cause: missing_workflow_step
resolution_type: code_change
severity: medium
tags:
  - barrels
  - barrelsby
  - test-helpers
  - mocks
  - toc
---

# Barrelsby must not export colocated test mock helpers

## Problem

A shared React hook test helper lived beside real hook source at:

```ts
packages/toc/src/react/hooks/tocHookMocks.ts
```

Because it sat in normal source, `pnpm brl` treated it like runtime code and generated:

```ts
export * from './tocHookMocks';
```

inside the public hooks barrel.

That is garbage. Mock helpers are not package API.

## Root cause

The helper was not under `__tests__` and did not use a test suffix, so the existing barrel exclusions had no reason to ignore it.

Barrelsby did exactly what it was told: export every normal source file in that folder.

## Fix

Move the helper under `__tests__` and update the specs to import it from there:

```ts
packages/toc/src/react/hooks/__tests__/tocHookMocks.ts
```

Then rerun `pnpm --filter @platejs/toc brl` so the generated barrel drops the bogus export.

## Verification

These checks passed:

```bash
pnpm --filter @platejs/toc brl
bun test packages/toc/src/react/hooks/useContentController.spec.tsx packages/toc/src/react/hooks/useContentObserver.spec.tsx packages/toc/src/react/hooks/useTocElement.spec.tsx packages/toc/src/react/hooks/useTocSideBar.spec.tsx
pnpm install
pnpm turbo build --filter=./packages/toc
pnpm turbo typecheck --filter=./packages/toc
pnpm lint:fix
```

## Prevention

If a file exists only to help specs, keep it under `__tests__` or give it a test-only suffix.

Do not colocate shared mocks beside runtime hooks unless you want barrelsby to ship your test junk to users.
