---
module: Registry Automation
date: 2026-04-06
problem_type: developer_experience
component: tooling
symptoms:
  - "Template CI failed with `Module not found` for helper files that existed in `apps/www`"
  - "Registry UI/plugin refactors looked correct locally, but generated templates still imported missing files"
  - "Helpers added beside registry items were not reaching `templates/plate-template` or `templates/plate-playground-template`"
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: high
tags:
  - templates
  - registry
  - shadcn
  - tooling
  - dependencies
  - ci
---

# Registry helper refactors must update template registry dependencies

## Problem

Template CI started failing after a batch of registry refactors in `apps/www`.

The application source was fine, but generated template code was not. `templates/plate-template` and `templates/plate-playground-template` were missing helper modules such as `block-discussion-index`, `get-annotation-click-target`, and `trailing-block-kit`. That made the break look like a template-only issue even though the real bug lived in registry wiring.

## What Didn't Work

### 1. Looking only at the app source imports

The local source files already existed, so it was easy to assume the refactor was complete.

That missed the real contract: registry items must explicitly carry every helper file and registry dependency that generated consumers need.

### 2. Treating template CI as a stale install problem

The failures were deterministic `Module not found` errors in generated template source, not random package resolution noise.

Reinstalling dependencies would not fix a file that was never copied into the generated template in the first place.

### 3. Adding helper files without checking whether they could be inlined

Two new files, `ui/suggestion-line-break-anchor.tsx` and `ui/suggestion-styles.ts`, were only supporting `ui/suggestion-node.tsx`.

Keeping them separate would have meant teaching the registry about two more files for no lasting design benefit.

## Solution

### 1. Add registry coverage for every new helper that stays separate

When a registry item starts importing a new local helper, update the registry definition at the same time.

For this fix, the important additions were:

- `ui/block-discussion-index.ts` under the `block-discussion` registry item
- `lib/get-annotation-click-target.ts` as its own registry lib item
- `trailing-block-kit.ts` as its own registry kit item
- matching `registryDependencies` from `comment-kit`, `suggestion-kit`, `editor-kit`, and `editor-ai`

That makes generated consumers install the same dependency graph that `apps/www` uses.

### 2. Inline one-off helpers back into the owning registry file

If a helper only exists for one registry component, prefer folding it back into that file instead of growing the registry surface.

In this case, `SuggestionLineBreakAnchor`, `suggestionVariants`, and `getBlockSuggestionWrapperClassName` moved into:

- [`apps/www/src/registry/ui/suggestion-node.tsx`](/Users/felixfeng/Desktop/repos/plate-copy/apps/www/src/registry/ui/suggestion-node.tsx)

That let the extra helper files disappear entirely instead of teaching templates about more moving parts.

### 3. Rebuild the registry output before judging the result

After registry wiring changes, regenerate the local registry payload:

```bash
pnpm --filter www rd
```

This is the fastest way to confirm the generated JSON no longer points at deleted or missing helpers.

## Why This Works

Template generation is driven by registry metadata, not by whatever happens to exist in `apps/www/src`.

That means every local helper used by a registry item must be represented in one of two ways:

1. inline inside the owning registry file
2. explicitly listed as a registry file or registry dependency

Once that rule is followed, the generated templates stop drifting behind the app source and CI stops reporting missing modules that only exist outside the template install graph.

## Gotchas

### `rg` on app source is not enough

A clean local import tree in `apps/www` does not prove the templates have the same files.

The real source of truth for generated consumers is the registry definition plus the rebuilt registry JSON.

### One-off helpers are often better inlined

If a helper is only used once, keeping it separate increases registry bookkeeping and CI blast radius.

Inline it unless the helper is genuinely shared.

### `pnpm turbo build --filter=./apps/www` can fail for unrelated reasons

For this change, registry rebuild, typecheck, and lint passed, but full `apps/www` build still hit an existing Turbopack/RSC boundary issue in `packages/core`.

That failure should not be mistaken for evidence that the registry helper fix is wrong.

## Verification

These commands were used while fixing the issue:

```bash
pnpm install
pnpm --filter www rd
pnpm turbo typecheck --filter=./apps/www
pnpm lint:fix
```

`pnpm turbo build --filter=./apps/www` still failed, but on unrelated `packages/core` React Server Component errors rather than registry helper resolution.

## Related Docs

- See also: [Template update and check need an arg-safe wrapper, template-scoped lint, and a TS6 `baseUrl` opt-out](/Users/felixfeng/Desktop/repos/plate-copy/docs/solutions/developer-experience/2026-03-25-templates-update-check-need-arg-safe-wrapper-template-scoped-lint-and-ts6-baseurl-opt-out.md)
- See also: [Template local package overrides must cover transitive exports](/Users/felixfeng/Desktop/repos/plate-copy/docs/solutions/developer-experience/2026-03-28-template-local-package-overrides-must-cover-transitive-exports.md)
