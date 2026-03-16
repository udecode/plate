---
name: internal-workspace-devdeps-hoist
description: >-
  Removes internal @platejs/* devDependencies from individual package.json files and hoists
  shared workspace tooling deps to root package.json with workspace:^ protocol. Verifies
  changes via pnpm install, typecheck, and lint. Trigger terms: "hoist devdeps", "workspace
  dependencies", "internal devDependencies", "monorepo deps cleanup". Use when internal
  platejs devDependencies appear in packages/*/package.json and need consolidation at root.
---

# Internal Workspace DevDeps Hoisting

## Overview

Consolidates internal `@platejs/*` devDependencies from individual packages to the workspace
root, preventing typecheck resolution failures in the monorepo.

## Workflow

1. **Remove** internal `platejs` / `@platejs/*` `devDependencies` from each `packages/*/package.json`.
2. **Hoist** any shared workspace packages still needed for test or typecheck tooling to root `package.json` `devDependencies` using `workspace:^`.
3. **Verify** the changes:
   - Scan `packages/*/package.json` for remaining internal `devDependencies`
   - `pnpm install`
   - `bun typecheck`
   - `bun lint:fix`

## Why This Matters

Removing package-level internal dev deps without hoisting shared workspace tooling deps to
root breaks package typecheck resolution. `@platejs/combobox` was the canary case via
`@platejs/test-utils`.

## Example

```bash
# Check for remaining internal devDeps after cleanup
grep -r '"@platejs/' packages/*/package.json | grep devDependencies
```

