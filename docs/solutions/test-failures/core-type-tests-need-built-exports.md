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

There was a second typing trap in the new fixtures: reads and writes use different composition surfaces. Declared plugin dependencies contribute their reads to `editor.api`, while writes compose through the active transaction.

## Solution

Use the build-first verification path for core contract work:

```bash
pnpm install
pnpm turbo build --filter=./packages/core
pnpm turbo typecheck --filter=./packages/core
pnpm lint:fix
pnpm test:types
```

In type fixtures, declare the dependency and compose its write through the
transaction passed to `.extendTx(...)`:

```ts
const DependencyPlugin = createBasePlugin({
  key: 'dependency',
})
  .extendEditorApi(() => ({
    dependencyValue: () => 'dependency' as const,
  }))
  .extendTx(() => () => ({
    runDependency: () => undefined,
  }));

const DependentPlugin = createBasePlugin({
  dependencies: [DependencyPlugin],
  key: 'dependent',
}).extendTx(({ editor }) => (tx) => ({
  runDependent: () => {
    const dependencyValue = editor.api.dependencyValue();

    tx.dependency.runDependency();
    void dependencyValue;
  },
}));
```

Use the scoped plugin update portal for a one-shot write. Keep related writes
on one active transaction:

```ts
editor.plugin(DependencyPlugin).update.runDependency();

editor.update((tx) => {
  tx.dependency.runDependency();
  tx.dependent.runDependent();
});
```

## Prevention

- Do not trust `pnpm test:types` failures on package subpaths until the affected package graph is built.
- Declare plugin dependencies before reading their APIs through `editor.api`.
- Define plugin writes with `.extendTx(...)` and compose dependencies through `tx.<pluginKey>.*`.
- Use `editor.plugin(Plugin).update.*` for one-shot calls and `editor.update((tx) => ...)` when several writes must share one transaction.
