---
title: Code Drawing Coverage Pass
date: 2026-03-23
---

# `code-drawing` Coverage Pass

## Summary

Do one small non-React pass on `@platejs/code-drawing`.

Real seams:

- `BaseCodeDrawingPlugin`
- `insertCodeDrawing`
- `renderers`

Skip `/react` and skip browser download plumbing unless the direct renderer tests expose a real issue.

## Constraints

- fast lane only
- no `/react`
- no fake smoke coverage

## Planned Coverage

1. `BaseCodeDrawingPlugin.spec.ts`
   - code drawing nodes are void elements

2. `insertCodeDrawing.spec.ts`
   - inserts default node shape and data
   - respects configured node type
   - merges custom data while keeping defaults

3. `renderers.spec.ts`
   - `renderPlantUml` encodes, fetches SVG, and returns a data URL
   - `renderMermaid` initializes once and returns a data URL
   - `renderCodeDrawing` returns empty string for blank content
   - `renderCodeDrawing` throws for unsupported drawing types

## Verification

- targeted `bun test` on touched `code-drawing` specs
- `bun test packages/code-drawing/src`
- `pnpm test:profile -- --top 20 packages/code-drawing/src`
- `pnpm test:slowest -- --top 20 packages/code-drawing/src`
- `pnpm install`
- `pnpm turbo build --filter=./packages/code-drawing`
- `pnpm turbo typecheck --filter=./packages/code-drawing`
- `pnpm lint:fix`

## Deferred

- `/react`
- `downloadImage`
- Graphviz and Flowchart renderer internals
