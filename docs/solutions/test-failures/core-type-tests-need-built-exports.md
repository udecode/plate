---
title: Core type tests need built package exports
category: test-failures
date: 2026-03-17
tags:
  - core
  - type-tests
  - build
  - plate-plugin
---

# Core type tests need built package exports

## Problem

`pnpm test:types` failed on `@platejs/core` fixtures with `Cannot find module '@platejs/core/react'` and a cascade of fake `any`-driven errors.

## Root Cause

The type-test lane resolves package entrypoints through built package exports. Running `pnpm test:types` before the affected package graph is built makes subpath imports like `@platejs/core/react` look broken even when the fixture is fine.

There was a second typing trap in the new fixtures: inside plugin extension callbacks, cross-plugin methods are not typed through the eventual merged `editor.api` or `editor.transforms` surface. They stay typed through `editor.getApi(...)` and `editor.getPlugin(...)`.

## Solution

Use the build-first verification path for core contract work:

```bash
pnpm install
pnpm turbo build --filter=./packages/core
pnpm turbo typecheck --filter=./packages/core
pnpm lint:fix
pnpm test:types
```

In type fixtures, use this pattern inside extension callbacks:

```ts
.extendEditorApi(({ editor }) => ({
  describeFormat: () => editor.getApi(FormatPlugin).format(),
}))
.extendEditorTransforms(({ editor }) => ({
  setFriendly: () => {
    editor.getPlugin(FormatPlugin).transforms.setTone('friendly');
  },
}))
```

## Prevention

- Do not trust `pnpm test:types` failures on package subpaths until the affected package graph is built.
- In extension callbacks, use `editor.getApi(...)` and `editor.getPlugin(...)` for cross-plugin typing. Save merged `editor.api` and `editor.transforms` assertions for the created editor value.
