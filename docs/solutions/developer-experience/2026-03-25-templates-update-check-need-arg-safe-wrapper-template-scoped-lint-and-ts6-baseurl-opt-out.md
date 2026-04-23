---
module: Registry Automation
date: 2026-03-25
problem_type: developer_experience
component: tooling
symptoms:
  - "`pnpm templates:update` failed immediately with `EXTRA_ARGS[@]: unbound variable`"
  - "Template lint from inside `templates/plate-template` walked the repo root instead of the template"
  - "TypeScript 6 stopped template `tsc --noEmit` on `baseUrl` deprecation"
  - "Generated playground template files still needed Biome `--unsafe` rewrites after `shadcn add`"
root_cause: config_error
resolution_type: workflow_improvement
severity: high
tags:
  - templates
  - shadcn
  - biome
  - typescript
  - ts6
  - registry
  - tooling
---

# Template update and check need an arg-safe wrapper, template-scoped lint, and a TS6 `baseUrl` opt-out

## Problem

`pnpm templates:update` and `pnpm templates:check` were failing for several different reasons, and the failures stacked on top of each other in a way that made the whole path look more mysterious than it was.

The first break was a shell bug in the wrapper script. After that was fixed, the next breaks were template-local lint and typecheck issues exposed by TypeScript 6 and by generated code that needed stronger normalization than the current `lint:fix` path was doing.

## What Didn't Work

### 1. Treating the first `templates:update` failure as a template problem

The command was dying before template generation even started:

```text
./tooling/scripts/update-templates.sh: line 7: EXTRA_ARGS[@]: unbound variable
```

That had nothing to do with shadcn, Biome, or TypeScript. The wrapper was just expanding an empty array under `set -euo pipefail`.

### 2. Running `biome check .` inside template packages

From inside `templates/plate-template`, both of these still walked the repo root:

```bash
bun run lint:fix
pnpm lint
```

That meant template lint was reporting errors from files like `.codex/skills/...` instead of only checking the template.

### 3. Hoping TypeScript 6 would tolerate template `baseUrl`

Once template typecheck actually ran, TS6 stopped on:

```text
Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0.
```

The templates still need `@/*`, so simply deleting `baseUrl` was the wrong move for this repo shape.

### 4. Fixing only the local registry source

The generated playground template kept reintroducing this Biome warning:

```text
if (!code || !code.trim() || !drawingType)
```

Even after patching the local source and rebuilding `apps/www/public/r`, default `pnpm templates:update` still pulled the stale version. That was the tell: the default updater path was not consuming the local rebuilt registry payload.

## Solution

### 1. Make the wrapper script safe when no CLI args are passed

In [`tooling/scripts/update-templates.sh`](tooling/scripts/update-templates.sh), do not splat an empty array under `set -u`.

Use a simple branch instead:

```bash
if (($# > 0)); then
  "$SCRIPT_DIR/update-template.sh" "$@" basic
  "$SCRIPT_DIR/update-template.sh" "$@" ai
else
  "$SCRIPT_DIR/update-template.sh" basic
  "$SCRIPT_DIR/update-template.sh" ai
fi
```

That gets `templates:update` into the real work instead of dying in shell plumbing.

### 2. Make template lint explicitly template-scoped

In both template package manifests:

- [`templates/plate-template/package.json`](templates/plate-template/package.json)
- [`templates/plate-playground-template/package.json`](templates/plate-playground-template/package.json)

replace `biome check .` with explicit paths:

```json
"lint": "biome check src biome.jsonc components.json tsconfig.json eslint.config.mjs next.config.ts postcss.config.mjs && eslint"
```

and make `lint:fix` use the same explicit scope.

That keeps Biome inside the template instead of letting it drift up to the git root.

### 3. Let template normalization use `--unsafe`

For generated template files, safe fixes were not enough. The updater was still failing on rules like `useOptionalChain` that Biome only rewrites in unsafe mode.

So the template `lint:fix` scripts should be:

```json
"lint:fix": "biome check src biome.jsonc components.json tsconfig.json eslint.config.mjs next.config.ts postcss.config.mjs --fix --unsafe"
```

This is the right place for the stronger rewrite. These files are generated and normalized output, not hand-written library code.

### 4. Silence TS6 `baseUrl` deprecation where the repo intentionally keeps aliases

In both template tsconfigs:

- [`templates/plate-template/tsconfig.json`](templates/plate-template/tsconfig.json)
- [`templates/plate-playground-template/tsconfig.json`](templates/plate-playground-template/tsconfig.json)

add:

```json
"ignoreDeprecations": "6.0"
```

while keeping:

```json
"baseUrl": ".",
"paths": {
  "@/*": ["src/*"]
}
```

That matches the decision to keep alias-based imports instead of rewriting the templates to relative paths.

### 5. Fix the stale playground Biome config

In [`templates/plate-playground-template/biome.jsonc`](templates/plate-playground-template/biome.jsonc), use the same preset path shape as the other template:

```json
"extends": [
  "ultracite/biome/core",
  "ultracite/biome/react",
  "ultracite/biome/next"
]
```

Without that, template-local Biome resolution was broken before lint even had a chance to check code.

### 6. Patch the registry source anyway

The upstream source still had the lint-triggering condition:

- [`apps/www/src/registry/ui/code-drawing-node.tsx`](apps/www/src/registry/ui/code-drawing-node.tsx)

Change:

```ts
if (!code || !code.trim() || !drawingType) {
```

to:

```ts
if (!code?.trim() || !drawingType) {
```

This did not fix default `templates:update` by itself, but it still keeps the source registry component honest and prevents the same drift in local registry builds.

## Why This Works

The failures were coming from four separate layers:

1. shell wrapper execution
2. template-local lint scope
3. TS6 config deprecations
4. generated-file normalization strength

Each layer needed its own fix.

Once the wrapper stopped exploding, Biome was constrained to template files, TS6 deprecation noise was explicitly silenced where aliases are still intentional, and generated files were allowed to take unsafe normalization rewrites, both commands became boring again:

- `pnpm templates:update`
- `pnpm templates:check`

That is exactly what you want here.

## Gotchas

### Default `templates:update` is not the same as local registry reproduction

Rebuilding `apps/www/public/r` did not change the generated playground template during the default updater flow.

So if you need to prove a local registry fix end-to-end, use the local path explicitly rather than assuming the default updater is reading your rebuilt local payload.

### Template `lint:fix` is not regular hand-written-code lint

For templates, `lint:fix` is part of generation cleanup. Using `--unsafe` here is justified because the command is normalizing generated output, not rewriting product code behind a developer's back.

### Keeping `baseUrl` means opting out explicitly

If the repo chooses to keep `@/*` in template tsconfigs, TypeScript 6 needs the opt-out spelled out. Otherwise `tsc --noEmit` will keep failing before it checks any real types.

## Verification

These commands passed after the fix:

```bash
pnpm templates:update
pnpm templates:check
pnpm --filter www build:registry
pnpm --filter www typecheck
pnpm lint:fix
```

## Related Issues

- See also: [Template updater should generate, not own CI verification](docs/solutions/developer-experience/2026-03-13-template-update-script-should-not-own-ci-verification.md)
- See also: [TypeScript 6 upgrade needs explicit paths and Bun test typing](docs/solutions/developer-experience/2026-03-25-typescript-6-upgrade-needs-explicit-paths-and-bun-test-typing.md)
