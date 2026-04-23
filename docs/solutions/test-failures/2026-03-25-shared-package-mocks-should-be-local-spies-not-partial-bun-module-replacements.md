---
title: Shared package mocks should be local spies, not partial Bun module replacements
type: solution
date: 2026-03-25
status: completed
category: test-failures
---

# Shared package mocks should be local spies, not partial Bun module replacements

## Problem

A broad Bun package-graph run failed in random places with nonsense like:

- `editor.tf` undefined inside [SlateExtensionPlugin.ts](packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.ts)
- missing exports from [packages/table/src/lib/index.ts](packages/table/src/lib/index.ts)
- unrelated specs passing alone but failing when paired

The product code was mostly innocent. The failures only appeared when certain React specs ran in the same Bun process as unrelated package specs.

## Root Cause

Two specs were mocking shared package surfaces too broadly:

- [floatingLinkTriggers.spec.ts](packages/link/src/react/utils/floatingLinkTriggers.spec.ts) replaced the whole `platejs` module just to fake `getEditorPlugin`
- [useTableMergeState.spec.tsx](packages/table/src/react/hooks/useTableMergeState.spec.tsx) replaced the whole `../../lib` barrel with a tiny export subset

That poisoned later imports depending on module load order. Bun then made unrelated specs look broken.

## Fix

- Stop mocking the whole shared module when the test only needs one or two functions.
- Import the real module namespace and `spyOn(...)` the specific exports you need.
- Keep `mock.module(...)` only for narrow local modules where replacing the whole surface will not leak across unrelated specs.
- Restore spies in `afterEach`.

## Rule

If a Bun spec touches a shared package entrypoint or barrel like `platejs`, `platejs/react`, or a package `lib/index.ts`, default to local spies on real exports.

Partial `mock.module(...)` replacements on shared surfaces are suite-pollution bait.
