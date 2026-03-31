---
module: Tooling
date: 2026-03-26
last_updated: 2026-03-28
problem_type: workflow_issue
component: tooling
symptoms:
  - "Template sync updates direct `@platejs/*` packages, but `platejs` lags behind and `/editor` prerender crashes with `Cannot read properties of undefined (reading 'api')`"
  - "A consumer install resolves both top-level `@platejs/core@52.3.9` and nested `@platejs/core@52.3.4` under `@platejs/utils`"
  - "Removing only the nested old core under `@platejs/utils` makes the same template build pass unchanged"
root_cause: config_error
resolution_type: dependency_update
severity: high
tags:
  - platejs
  - pnpm
  - bun
  - template-sync
  - dependency-graph
  - workspace-protocol
  - umbrella-package
---

# platejs umbrella package should publish compatible workspace ranges

## Problem

Template sync on `main` started failing after release even though the generated template source itself was fine.

The failure only showed up after `bun update --latest` moved direct `@platejs/*` dependencies forward while `platejs` stayed on an older published version.

## Symptoms

- `bun run build -- --debug-prerender` in `templates/plate-playground-template` fails on `/editor`
- the stack points at `TurnIntoToolbarButton` calling `useSelectionFragmentProp(...)`
- the installed graph contains:
  - top-level `platejs@52.3.9`
  - top-level `@platejs/utils@52.3.4`
  - top-level `@platejs/core@52.3.9`
  - nested `@platejs/core@52.3.4` under `@platejs/utils`

## What didn't work

Patching the template or registry source would have treated the symptom, not the graph problem.

The useful debugging step was deleting only `node_modules/@platejs/utils/node_modules/@platejs/core` in the failing template install. The build passed immediately, which proved the real issue was the split dependency graph.

## Solution

Make the umbrella package publish compatible internal ranges instead of exact workspace pins:

```json
{
  "dependencies": {
    "@platejs/core": "workspace:^",
    "@platejs/slate": "workspace:^",
    "@platejs/utils": "workspace:^",
    "@udecode/react-hotkeys": "workspace:^",
    "@udecode/react-utils": "workspace:^",
    "@udecode/utils": "workspace:^"
  }
}
```

Also republish `@platejs/utils` so its published manifest carries the current core range from source:

```json
{
  "dependencies": {
    "@platejs/core": "^52.3.9"
  }
}
```

Add a manifest guard so `platejs` cannot regress back to `workspace:*` for internal runtime deps.

## Why this works

`workspace:*` in `packages/plate/package.json` publishes exact internal pins. That is too brittle for an umbrella package that gets installed alongside direct `@platejs/*` packages.

When direct packages moved to `52.3.10` but `platejs` stayed on `52.3.9`, Bun resolved an old `@platejs/utils` and then nested an old `@platejs/core` under it. That stale nested core triggered the prerender crash.

Publishing `platejs` with `workspace:^` makes the umbrella package compatible with the current internal graph instead of freezing an old one. Republishing `@platejs/utils` with the current core range removes the stale nested-core resolution path.

## Prevention

1. Do not use `workspace:*` for internal runtime dependencies in umbrella packages like `platejs`.
2. Add a manifest check that fails if `packages/plate/package.json` regresses to exact internal workspace pins.
3. When template sync fails after release, inspect the installed package tree before touching template source:

```bash
npm view platejs version dependencies --json
npm view @platejs/utils version dependencies --json
```

4. If the failure smells like a stale install graph, prove it fast:

```bash
cd templates/plate-playground-template
bun run build -- --debug-prerender
```

Then remove only the suspected nested stale package and rerun once. If the build flips from red to green, fix the published manifests instead of adding defensive template hacks.

5. Do not assume Changesets `linked` groups force the umbrella package to publish when only an internal package gets a direct changeset. `linked` keeps published linked packages aligned, but it does not guarantee every package in the group gets versioned.
6. Changesets also exposes `___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH.updateInternalDependents: "always"`. That adds dependents to the release even when their current range still satisfies the new version. In Plate this cascades from `@platejs/core` to `@platejs/utils`, `platejs`, and then almost every package that peers on `platejs`, so treat it as a broad release policy, not a precise umbrella-package fix.
