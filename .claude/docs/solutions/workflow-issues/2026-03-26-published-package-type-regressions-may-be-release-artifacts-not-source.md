---
module: Tooling
date: 2026-03-26
problem_type: workflow_issue
component: tooling
symptoms:
  - "A consumer upgrade reports that a plugin exported from `dist/react/index.d.ts` is typed as `any`"
  - "Downstream `.configure(...)` callbacks lose inference even though the authored plugin source still uses typed `toPlatePlugin(...)` calls"
  - "A local rebuild from the same release line produces correct declarations while the published tarball stays broken"
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: high
tags:
  - publishing
  - npm-pack
  - typescript
  - declarations
  - tsdown
  - tooling
  - table
---

# Published package type regressions may be release artifacts, not source

## Problem

Issue `#4895` reported that upgrading `@platejs/table` from `52.0.11` to `52.3.6` turned `TablePlugin` into `any` in the published React declaration entrypoint.

That matters because once `TablePlugin` becomes `any`, every downstream `.configure(...)` callback loses real parameter inference. Users then start seeing implicit-`any` fallout in their own code even though the plugin source itself may still look fine.

## What misleads you

The authored source for the plugin was not obviously wrong:

```ts
export const TablePlugin = toPlatePlugin(BaseTablePlugin, {
  handlers: {
    onKeyDown: onKeyDownTable,
  },
  plugins: [TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin],
});
```

If you stop there, you will waste time chasing the wrong layer.

The bug lived in the published artifact:

```ts
declare const TablePlugin: any;
```

## Root cause

The release workflow let a bad declaration artifact ship.

The key evidence was:

- the published `52.3.6` tarball contains `declare const TablePlugin: any;`
- the published `52.0.11` tarball preserves the full `PlatePlugin<PluginConfig<...>>` type
- a local rebuild from the `52.3.6` release line produces the typed declaration again
- the relevant source and build-config files did not differ from the release tag in any way that explained the published `any`

That means the regression was not caused by the handwritten `TablePlugin.tsx` source. The problem was that the packed release artifact did not match what the source rebuilt into locally.

The concrete repo-level trigger was simpler than it first looked:

- `tsdown` was bundling declaration output
- package builds were resolving through built `platejs` exports
- `@platejs/table` no longer carried a local `devDependencies.platejs` edge

That left the declaration bundler free to run before `platejs` had produced the type surface it needed, so the exported plugin contract collapsed to `any`.

## Investigation that worked

### 1. Inspect the published tarballs directly

Use `npm pack` on both the last good version and the reported bad version, then compare the generated declaration entrypoint:

```bash
mkdir -p /tmp/plate-4895
cd /tmp/plate-4895

npm pack @platejs/table@52.0.11
tar -xzf platejs-table-52.0.11.tgz
mv package table-52.0.11

npm pack @platejs/table@52.3.6
tar -xzf platejs-table-52.3.6.tgz
mv package table-52.3.6

sed -n '1,40p' table-52.0.11/dist/react/index.d.ts
sed -n '1,40p' table-52.3.6/dist/react/index.d.ts
```

That immediately showed the regression was real in the published package, not just in a consumer's local setup.

### 2. Add a temporary negative type assertion in a consumer-shaped template

In the playground template, a minimal type-only assertion made the failure obvious:

```ts
import { TablePlugin } from '@platejs/table/react';

type AssertFalse<T extends false> = T;
type IsAny<T> = 0 extends 1 & T ? true : false;

type _tablePluginShouldNotBeAny = AssertFalse<IsAny<typeof TablePlugin>>;
```

Running the template typecheck failed with:

```txt
Type 'true' does not satisfy the constraint 'false'.
```

That is the cleanest proof that the consumer-facing export collapsed to `any`.

### 3. Rebuild the package locally before blaming source

The local `packages/table/dist/react/index.d.ts` rebuilt with the correct `PlatePlugin<PluginConfig<...>>` type surface.

That told us the source could still generate the right declaration. So the investigation had to move away from authored code and toward the release artifact path.

## Why this works

This workflow separates three different truths that often get mixed together:

- source truth: what the authored TypeScript says
- local build truth: what the repo generates right now
- published contract truth: what consumers actually install

A regression report from users is about the third one.

If the published tarball is wrong but a local rebuild is correct, the problem is not "TypeScript is confused." The problem is that the release workflow shipped a poisoned contract.

## Prevention

When a package type regression lands in a release:

1. Compare the published tarball against the last known good tarball before editing source.
2. Add a tiny consumer-facing negative type assertion in a template or integration surface to prove the export really degraded.
3. Rebuild the package locally and compare the generated `dist` declaration with the published one.

If published and local outputs disagree, treat it as a release-artifact problem first.

The workflow guard that was missing here is simple: verify the packed tarball, not just the workspace source build. A release can look healthy in-repo and still ship broken declarations to users.

In this repo there is a second guard worth keeping:

1. if a workspace package declares `peerDependencies.platejs`
2. and its source compiles against `platejs` exports
3. then it should also declare `devDependencies.platejs = workspace:^`

That creates an explicit build edge so Turbo builds `platejs` before declaration bundling runs for dependent packages.
