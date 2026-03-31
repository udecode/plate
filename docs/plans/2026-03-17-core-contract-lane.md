---
title: Core Contract Lane
type: testing
date: 2026-03-17
status: in_progress
---

# Core Contract Lane

## Goal

Complete ordered slice 1 only:

- deepen `@platejs/core` compile-only contract coverage
- add narrow runtime specs for parser pipes, chunking, and affinity selection
- keep `/react` out

## Scope

- `packages/core/type-tests/*`
- `packages/core/src/internal/plugin/*`
- `packages/core/src/lib/plugins/chunking/*`
- `packages/core/src/lib/plugins/affinity/transforms/*`

## Findings

- the current type lane covers only the simpler plugin and editor contracts
- there are no runtime specs for `pipeTransformData`, `pipeTransformFragment`, `pipeInsertFragment`, `withChunking`, or `setAffinitySelection`
- targeted verification should stay local: new core specs, `pnpm test:types`, and the touched core package build/typecheck/lint path
- `pnpm test:types` depends on built package exports, so the stable path is `pnpm install` -> `pnpm turbo build --filter=./packages/core` -> `pnpm turbo typecheck --filter=./packages/core` -> `pnpm test:types`
- inside plugin extension callbacks, cross-plugin typed access should go through `editor.getApi(...)` and `editor.getPlugin(...)`; the eventual merged `editor.api` and `editor.transforms` surface is for the created editor, not for extension-time typing

## Progress

- [x] add focused type fixtures
- [x] add focused runtime specs
- [x] run targeted verification

## Verification

- `bun test packages/core/src/internal/plugin/pipeTransformData.spec.ts packages/core/src/internal/plugin/pipeTransformFragment.spec.ts packages/core/src/internal/plugin/pipeInsertFragment.spec.ts packages/core/src/lib/plugins/chunking/withChunking.spec.ts packages/core/src/lib/plugins/affinity/transforms/setAffinitySelection.spec.ts`
- `pnpm install`
- `pnpm turbo build --filter=./packages/core`
- `pnpm turbo typecheck --filter=./packages/core`
- `pnpm lint:fix`
- `pnpm test:types`
