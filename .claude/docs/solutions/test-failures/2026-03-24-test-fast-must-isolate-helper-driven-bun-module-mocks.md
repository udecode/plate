---
title: Test Fast Must Isolate Helper-Driven Bun Module Mocks
type: solution
date: 2026-03-24
status: completed
category: test-failures
---

# Test Fast Must Isolate Helper-Driven Bun Module Mocks

## Problem

`bun tooling/scripts/test-fast.mjs` was still failing in the shared batch even after isolating specs that directly contained `mock.module(`.

The ugly part was that the visible failures showed up far away from the cause:

- `layout` transforms started seeing nodes without `children`
- `diff` tests started picking up stray `id: 'node'`
- `BlockPlaceholderPlugin` saw `editor.dom` as `undefined`

Those were not 142 product bugs. They were suite pollution.

## Root Cause

The runner only checked each spec file's own source for `mock.module(`.

That missed specs like:

- [useContentObserver.spec.tsx](/Users/zbeyens/git/plate/packages/toc/src/react/hooks/useContentObserver.spec.tsx)

That spec looked clean, but it imported:

- [tocHookMocks.ts](/Users/zbeyens/git/plate/packages/toc/src/react/hooks/tocHookMocks.ts)

And that helper registered multiple top-level `mock.module(...)` calls.

So the spec stayed in the shared batch, leaked module mocking into unrelated tests, and made the full suite fail in nonsense places.

## Fix

Update [test-fast.mjs](/Users/zbeyens/git/plate/tooling/scripts/test-fast.mjs) so isolation is based on the local import graph, not just the spec file body.

The runner now:

- scans each selected spec for local `import`, `export ... from`, dynamic `import(...)`, and `require(...)`
- resolves local source files recursively
- marks a spec as isolated if any file in that local graph contains `mock.module(`

That catches helper-driven mocks like `tocHookMocks.ts` and keeps those specs out of the shared batch.

## Rule

If Bun module mocks can live in helper files, test-runner isolation must follow local imports.

Scanning only the spec file body is too naive and will lie to you.
