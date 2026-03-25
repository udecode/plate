---
title: Markdown Contract Coverage Pass
type: testing
date: 2026-03-23
status: completed
---

# Goal

Do one narrow non-React `@platejs/markdown` pass after the March 14 helper/fallback work.

# Highest-Value Seams

- `MarkdownPlugin`
- `deserializeMd`
- `convertNodesDeserialize`
- `serializeMd`
- `convertNodesSerialize`

# Scope

- direct plugin API and parser contract
- direct deserializer behavior for custom rule wrapping, memoized output, and `onError` + `withoutMdx`
- serializer passthrough for editor value and `remarkStringifyOptions`
- one deserializer edge lane for conflicting filters and unknown nodes
- one serializer edge lane for conflicting filters and `withBlockId`

# Explicit Deferrals

- `defaultRules` deep sweep
- broader mdx/list/mention matrices already covered elsewhere
- `/react`

# Verification Plan

- targeted `bun test` on touched markdown specs
- `bun test packages/markdown/src`
- `pnpm test:profile -- --top 15 packages/markdown/src`
- `pnpm test:slowest -- --top 15 packages/markdown/src`
- `pnpm install`
- `pnpm turbo build --filter=./packages/markdown`
- `pnpm turbo typecheck --filter=./packages/markdown`
- `pnpm lint:fix`

# Result

- added direct `MarkdownPlugin` contract coverage for defaults, bound API, and parser deserialization
- added direct `deserializeMd` coverage for top-level text wrapping, memoized output, and `onError` + `withoutMdx`
- added serializer coverage for direct `serializeMd` output and `remarkStringifyOptions`
- added deserializer and serializer edge coverage for conflicting filters, unknown nodes, and `withBlockId`
- no runtime bug surfaced; this stayed test-only
