---
module: Workspace TypeScript
date: 2026-03-25
problem_type: developer_experience
component: tooling
symptoms:
  - "TypeScript 6 fails immediately on `baseUrl` and `moduleResolution=node` deprecations"
  - "Standalone tsconfigs that relied on ambient type auto-discovery lose `bun:test` types under TypeScript 6"
  - "`apps/www` typecheck starts failing on CSS side-effect imports and Bun spy typings after the version bump"
root_cause: config_error
resolution_type: dependency_update
severity: high
tags:
  - typescript
  - ts6
  - tsconfig
  - bun
  - contentlayer
  - tooling
---

# TypeScript 6 upgrade needs explicit paths and Bun test typing

## Problem

Upgrading this repo from TypeScript `5.8.3` to `6.0.2` does not fail because the codebase suddenly forgot how to type.

It fails because TypeScript 6 tightened config behavior in a few specific places the repo was leaning on:

- `baseUrl` is deprecated and treated as an error
- `moduleResolution: "node"` is deprecated
- standalone tsconfigs no longer get ambient `@types` packages for free
- side-effect CSS imports are checked by default

Once those config issues are cleared, the remaining failures are real and small.

## What Didn't Work

### 1. Bumping `typescript` first and hoping the rest would sort itself out

The first TS6 dry run failed before touching any code:

- root `tsconfig.json` died on deprecated `baseUrl`
- `packages/udecode/depset/tsconfig.json` died on deprecated `baseUrl` and `moduleResolution=node`
- `apps/www/scripts/tsconfig.scripts.json` also surfaced the deprecated `baseUrl`

That is the wrong moment to start chasing random type errors.

### 2. Removing `baseUrl` without rewriting path targets

This is the subtle one.

In configs like `tooling/config/tsconfig.test.json`, deleting `baseUrl` was not enough. Path targets like:

```json
"@/components/*": ["apps/www/src/components/*"]
```

stopped working because TypeScript 6 requires those targets to be explicitly relative when `baseUrl` is gone.

They had to become:

```json
"@/components/*": ["../../apps/www/src/components/*"]
```

### 3. Trusting the global `spyOn` type in `apps/www`

The package-integration test in [`HtmlPlugin.slow.tsx`](apps/www/src/__tests__/package-integration/core-html/HtmlPlugin.slow.tsx) used:

```ts
let jsonParseSpy: ReturnType<typeof spyOn>;
```

Under TypeScript 6, that resolved to a broad `Spy` type that no longer exposed `mockReturnValue`. The runtime behavior was fine. The type was the liar.

## Solution

### 1. Upgrade the actual TypeScript pins

Update both workspace pins to `6.0.2`:

- [`package.json`](package.json)
- [`apps/www/package.json`](apps/www/package.json)

### 2. Remove deprecated `baseUrl` usage from repo tsconfigs

These configs no longer use `baseUrl`:

- [`tsconfig.json`](tsconfig.json)
- [`apps/www/tsconfig.json`](apps/www/tsconfig.json)
- [`apps/www/scripts/tsconfig.scripts.json`](apps/www/scripts/tsconfig.scripts.json)
- [`tooling/config/tsconfig.test.json`](tooling/config/tsconfig.test.json)
- [`packages/udecode/depset/tsconfig.json`](packages/udecode/depset/tsconfig.json)

For the test config, rewrite every path target to an explicit relative path.

### 3. Switch `depset` to modern resolution and restore Bun test types explicitly

In [`packages/udecode/depset/tsconfig.json`](packages/udecode/depset/tsconfig.json):

- change `moduleResolution` from `"node"` to `"bundler"`
- add `"types": ["bun-types"]`

That second line matters because TS6 no longer auto-discovers ambient types the way TS5 did.

### 4. Keep side-effect CSS imports legal in this repo

In [`tsconfig.json`](tsconfig.json), set:

```json
"noUncheckedSideEffectImports": false
```

Without that, `apps/www` starts failing on imports like:

- `@/app/globals.css`
- `@excalidraw/excalidraw/index.css`
- `katex/dist/katex.min.css`

Those imports are intentional. This repo uses bundler-managed CSS side effects all over the place.

### 5. Fix the one real TS6 code regression

In [`packages/docx-io/src/lib/html-to-docx.ts`](packages/docx-io/src/lib/html-to-docx.ts), `new Blob([buffer])` started failing because TS6 no longer accepts the `Uint8Array<ArrayBufferLike>` result directly as a `BlobPart`.

Copy it into a plain `Uint8Array` first:

```ts
const buffer = await resultZip.generateAsync({ type: "uint8array" });
const blobBuffer = new Uint8Array(buffer);

return new Blob([blobBuffer], {
  type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
});
```

### 6. Force the package-integration test onto Bun's `spyOn` type

In [`apps/www/src/__tests__/package-integration/core-html/HtmlPlugin.slow.tsx`](apps/www/src/__tests__/package-integration/core-html/HtmlPlugin.slow.tsx):

- import `spyOn` from `bun:test`
- type the spy as `Mock<typeof JSON.parse>`

That avoids the wrong global overload and restores `mockReturnValue` / `mockRestore`.

## Why This Works

The upgrade only becomes noisy when TS6 is allowed to reinterpret old assumptions:

- `baseUrl` was doubling as a silent path prefix
- standalone tsconfigs were silently inheriting ambient types
- CSS side-effect imports were silently ignored
- the global `spyOn` symbol was silently picking a fuzzier overload than the test intended

Making those assumptions explicit gets the repo back onto honest ground.

After that, the remaining TS6 breakage shrinks to a single real code fix and a single test typing fix.

## Gotchas

### `apps/www` prebuild still warns about Contentlayer

`pnpm --filter www typecheck` now passes, but Contentlayer prints this warning during prebuild:

```text
Config option `compilerOptions.baseUrl` not found in "tsconfig.json".
```

That warning is non-blocking. The build still completes.

### Raw root `tsc -p tsconfig.json` still crashes under TS6

`pnpm --package=typescript@6.0.2 dlx tsc -p tsconfig.json --noEmit` still hits a TypeScript `Debug Failure` in `_tsc.js`.

That path is not part of the repo's normal verification flow, so it does not block the upgrade work here, but it is worth remembering if someone later decides to use raw root `tsc` as a CI gate.

### The ecosystem is not fully caught up on peer ranges

`pnpm install` succeeds, but these packages still declare TypeScript `<6` peer ranges:

- `@typescript-eslint/*`
- `typescript-eslint`
- `tsdown@0.16.6`

Those warnings did not block the verified build and typecheck flow in this repo.

## Verification

These commands passed after the fix:

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm --filter www typecheck
pnpm --filter www build:registry
pnpm lint:fix
pnpm lint
```

## Related Issues

- See also: [TypeScript workspace subpath aliases in `apps/www`](docs/solutions/developer-experience/2026-03-12-typescript-workspace-subpath-aliases-in-apps-www.md)
- See also: [Turbo filtered typecheck can lie when package typecheck passes](docs/solutions/test-failures/2026-03-24-turbo-filtered-typecheck-can-lie-when-package-typecheck-passes.md)
