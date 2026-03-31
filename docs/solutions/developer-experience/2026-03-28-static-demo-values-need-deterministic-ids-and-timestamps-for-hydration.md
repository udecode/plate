---
title: Static demo values need deterministic IDs and timestamps for hydration
date: 2026-03-28
last_updated: 2026-03-28
problem_type: developer_experience
component: tooling
module: Docs App
severity: medium
tags:
  - nextjs
  - hydration
  - ssr
  - plate
  - table
  - node-id
  - demo-data
---

## Problem

The homepage playground hydrated with a React mismatch warning after the Next 16 upgrade. The visible diff was `data-table-cell-id`, where server and client rendered different table cell IDs for the same demo content.

## Symptoms

- React console error during hydration on `/`
- Diff showed `data-table-cell-id` changing between server and client
- The mismatch surfaced inside `PlaygroundDemo` and the table cell render path

## Root cause

Static demo values were being fed into editors without deterministic normalization.

- Missing node IDs were filled by `NodeIdPlugin` using random `nanoid()` values during editor setup
- Some static example values also contained `createdAt: Date.now()` at module evaluation time
- Server and client each created their own copy of the same demo content, so random IDs and timestamps diverged across hydration

## Fix

Normalize static example values through a package helper before editor creation:

- deep-clone the input value
- assign deterministic sequential node IDs
- replace `createdAt` metadata with a fixed timestamp

The helper lives at:

- `packages/core/src/lib/plugins/node-id/normalizeStaticValue.ts`

It is exported through:

- `@platejs/core`
- `platejs`

It is used by:

- `apps/www/src/registry/examples/playground-demo.tsx`
- `apps/www/src/registry/blocks/editor-ai/components/editor/plate-editor.tsx`
- `apps/www/src/registry/blocks/editor-basic/components/editor/plate-editor.tsx`
- `apps/www/src/registry/blocks/slate-to-html/page.tsx`

## Prevention

- Never use default random ID generation for static demo content that can render on both server and client
- Never leave `Date.now()` in module-scoped example values that may hydrate on the client
- For docs/demo fixtures, normalize once through `normalizeStaticValue` before creating the editor
- Keep `normalizeNodeId` focused on node IDs only. Hydration-safe demo normalization is a separate concern and should stay a separate API.
- If a hydration diff mentions DOM data attributes backed by editor node metadata, inspect demo value generation before touching React rendering code

## Verification

- `bun test packages/core/src/lib/plugins/node-id/normalizeStaticValue.spec.ts`
- `pnpm -C apps/www build`
- `pnpm -C apps/www typecheck`
- `pnpm lint:fix`
- `dev-browser` reload of `http://localhost:3000/` with no hydration console error
