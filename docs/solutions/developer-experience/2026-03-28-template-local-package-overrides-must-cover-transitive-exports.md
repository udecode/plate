---
module: Registry Automation
date: 2026-03-28
problem_type: developer_experience
component: tooling
symptoms:
  - "`Validate Registry` failed in `templates/plate-template` with `Export normalizeStaticValue doesn't exist in target module`"
  - "The local `platejs` package built cleanly, but the regenerated template still behaved like the export was missing"
  - "`CI` also failed with `pnpm brl produced changes. Commit the generated barrel updates.`"
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: high
tags:
  - templates
  - registry
  - bun
  - overrides
  - platejs
  - exports
  - ci
  - turbopack
---

# Template local package overrides must cover transitive exports

## Problem

`Validate Registry` was failing even after `normalizeStaticValue` had been added to the package-level API for demo hydration work.

At first glance, the error looked simple: `platejs` did not export the symbol. That was only half true. The local source needed one export fix, but the nastier bug was in the template-local package override flow. The template was installing a local `platejs` tarball while still resolving stale published `@platejs/*` packages underneath it.

## What Didn't Work

### 1. Treating the template failure like a plain missing export

The CI error looked like this:

```text
Export normalizeStaticValue doesn't exist in target module
```

That did point at a real gap in `packages/plate/src/index.tsx`, but fixing that alone was not enough.

The misleading part was that the local `platejs` source already built successfully after the export was added. The template still failed, which meant the problem had moved from source code into dependency resolution.

### 2. Packing only the packages that templates depend on directly

The original `prepare-local-template-packages.mjs` flow only cared about direct template dependencies.

That was too narrow. When `@platejs/core` changes and `platejs` re-exports something from it, the template needs both:

- a fresh `@platejs/core` tarball
- a fresh `platejs` tarball that re-exports the updated symbol

Without walking the dependent graph upward, the script could miss the umbrella package that the template actually imports.

### 3. Trusting Bun to resolve nested workspace packages to the same local tarballs

This was the real trap.

Even when the template installed a local `platejs` tarball, Bun could still place stale published workspace packages under:

```text
node_modules/platejs/node_modules/@platejs/core
```

That created a split-brain install:

- top-level package graph was local
- nested graph under `platejs` was stale

So the template would import `platejs`, but `platejs` would in turn resolve an older `@platejs/core` that did not expose the new helper.

### 4. Ignoring the separate barrel drift failure

The `CI` job was also failing because `pnpm brl` wanted to update:

- `packages/dnd/src/utils/index.ts`

That was not related to the template export failure, but it still needed to be committed or CI would keep staying red for a second reason.

## Solution

### 1. Re-export the helper from `platejs`

In [`packages/plate/src/index.tsx`](/Users/zbeyens/git/plate/packages/plate/src/index.tsx), add an explicit umbrella export:

```ts
export {
  STATIC_VALUE_CREATED_AT,
  normalizeStaticValue,
} from '@platejs/core';

export type { NormalizeStaticValueOptions } from '@platejs/core';
```

That makes the package API honest. If the template imports from `platejs`, the symbol needs to exist there explicitly.

### 2. Select affected template packages by walking upward through local dependents

In [`tooling/scripts/prepare-local-template-packages.mjs`](/Users/zbeyens/git/plate/tooling/scripts/prepare-local-template-packages.mjs), compute the affected package set from changed packages plus their relevant local dependents.

That means a change in `@platejs/core` can pull in:

- `@platejs/basic-nodes`
- `platejs`
- any other relevant template-facing package above it

instead of only repacking the leaf package that changed.

### 3. Write template `overrides` for every packed local tarball

This is the crucial part.

When rewriting template `package.json`, do not only replace direct dependencies. Also write:

```json
"overrides": {
  "@platejs/core": "file:../../node_modules/.cache/template-local-packages/platejs-core-....tgz",
  "platejs": "file:../../node_modules/.cache/template-local-packages/platejs-....tgz"
}
```

for every packed local workspace package.

That forces Bun to resolve nested workspace dependencies inside local tarballs to the same local tarballs, instead of quietly pulling stale published copies into a nested `node_modules`.

### 4. Commit the barrel update too

Run:

```bash
pnpm brl
```

and keep the generated change in:

- [`packages/dnd/src/utils/index.ts`](/Users/zbeyens/git/plate/packages/dnd/src/utils/index.ts)

This removes the separate CI failure so the registry fix is not hidden behind unrelated red.

## Why This Works

The fix closes both halves of the failure:

1. `platejs` now really exports `normalizeStaticValue`
2. the template-local install graph now stays internally consistent

Without the explicit `platejs` export, the template import is wrong at the source.

Without the `overrides`, the source can still be right while Bun installs an older nested `@platejs/core` beneath the local `platejs` tarball. That is why the original failure was so annoying: the workspace build was correct, but the template install graph was lying.

The transitive package selection matters because local template overrides only work if the script packs the whole relevant slice of the workspace graph. If the changed leaf package is packed but the umbrella package is stale, the template still loses.

## Gotchas

### Local package tarballs are not enough by themselves

Seeing `platejs@../../node_modules/.cache/template-local-packages/...` in `bun install` output is not proof that the whole graph is local.

Check whether Bun also created nested workspace packages inside that tarball's own `node_modules`.

### Fresh Bun caches matter when verifying this path

If you reuse an old Bun cache while testing local tarball overrides, you can convince yourself the fix failed when you are really just reinstalling stale artifacts.

Use a fresh `BUN_INSTALL_CACHE_DIR` when reproducing template install issues locally.

### The template import path decides which package must be rebuilt

If the template imports from `platejs`, then changes in `@platejs/core` can still require rebuilding `platejs`. Do not treat umbrella packages like passive pass-through.

## Verification

These commands passed after the fix:

```bash
bun test tooling/scripts/prepare-local-template-packages.test.mjs packages/plate/src/index.spec.ts
pnpm install
pnpm brl
pnpm turbo build --filter=./packages/plate --filter=./packages/dnd
pnpm turbo typecheck --filter=./packages/plate --filter=./packages/dnd
pnpm --filter www build:registry
pnpm --filter www build:tw
pnpm --filter www rd
TEMPLATE_SKIP_VERIFY=true pnpm templates:update --local
TEMPLATE_LOCAL_PACKAGE_BASE_REF=origin/main node tooling/scripts/prepare-local-template-packages.mjs templates/plate-template templates/plate-playground-template
cd templates/plate-template && bun install --no-frozen-lockfile && bun lint && bun run build
cd templates/plate-playground-template && bun install --no-frozen-lockfile && bun lint && bun run build
pnpm lint:fix
```

## Related Issues

- See also: [Static demo values need deterministic IDs and timestamps for hydration](/Users/zbeyens/git/plate/docs/solutions/developer-experience/2026-03-28-static-demo-values-need-deterministic-ids-and-timestamps-for-hydration.md)
- See also: [Template update and check need an arg-safe wrapper, template-scoped lint, and a TS6 `baseUrl` opt-out](/Users/zbeyens/git/plate/docs/solutions/developer-experience/2026-03-25-templates-update-check-need-arg-safe-wrapper-template-scoped-lint-and-ts6-baseurl-opt-out.md)
