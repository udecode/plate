---
title: Keep insert streaming session state out of AIChatPlugin options
type: solution
date: 2026-03-31
status: completed
category: best-practices
module: ai
tags:
  - ai
  - streaming
  - architecture
  - aichatplugin
  - session
  - apps-www
---

# Problem

Insert-mode streaming was storing runtime bookkeeping in `AIChatPlugin` options:

- `_blockChunks`
- `_blockPath`
- `_mdxName`

Those fields are not workflow state. They are private session state used while one markdown stream is in flight.

# Symptoms

- Plugin options mixed UI state and transport-derived runtime state.
- Reset and finish call sites had to know internal cleanup fields.
- Demo code, package code, and tests all reached into the same private-looking options.
- The next sessionization step would have to keep threading internal state through public plugin surfaces.

# Solution

Move insert streaming runtime ownership into a package-private session helper and keep `AIChatPlugin` focused on workflow state.

We introduced `markdownStreamSession.ts` in `packages/ai/src/react/ai-chat/streaming/` and moved these responsibilities there:

- accumulated markdown source
- current streaming path
- MDX literal-mode name
- replay runtime state

Then we applied the same rule across the callers:

- `streamInsertChunk` reads and writes the private session instead of plugin options
- `streamDeserializeMd` keeps MDX literal-mode state in the private session
- `resetAIChat` clears the private session
- app-level callers use `resetStreamInsertChunk(editor)` instead of setting `_blockChunks`, `_blockPath`, and `_mdxName` directly

# Why This Works

`AIChatPlugin` should own user-facing workflow state such as:

- `mode`
- `toolName`
- `streaming`
- chat message state

It should not also own low-level parser and replay bookkeeping for one active stream.

Once the streaming runtime state is private:

- cleanup becomes one operation instead of three leaked fields
- package internals can evolve without pushing more state into public plugin options
- demo code and package code can share the same insert-session contract
- the next transport/session refactor has a clear seam to build on

# Verification

## Tests

```bash
bun test packages/ai/src/react/ai-chat/streaming/markdownStreamSession.spec.ts
bun test packages/ai/src/react/ai-chat/utils/aiChatActions.spec.ts
bun test ./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx
bun test ./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx
```

Result: passing

## Workspace checks

```bash
pnpm install
pnpm turbo build --filter=./packages/ai --filter=./apps/www
pnpm turbo typecheck --filter=./packages/ai --filter=./apps/www
pnpm lint:fix
pnpm exec biome check packages/ai/src/react/ai-chat/AIChatPlugin.ts packages/ai/src/react/ai-chat/streaming/streamDeserializeMd.ts packages/ai/src/react/ai-chat/streaming/streamInsertChunk.ts packages/ai/src/react/ai-chat/streaming/markdownStreamSession.ts packages/ai/src/react/ai-chat/streaming/markdownStreamSession.spec.ts packages/ai/src/react/ai-chat/utils/resetAIChat.ts packages/ai/src/react/ai-chat/utils/aiChatActions.spec.ts apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx apps/www/src/app/dev/markdown-stream-perf/page.tsx apps/www/src/registry/components/editor/plugins/ai-kit.tsx apps/www/src/registry/examples/markdown-streaming-demo.tsx
```

The build, typecheck, and targeted Biome check passed.

`pnpm lint:fix` still failed because of existing repository-wide Biome diagnostics in `packages/mdast-util-from-markdown` and `packages/remark-parse`, outside this sessionization change.

## Browser smoke

Verified with `agent-browser`:

- `http://localhost:3002/dev/markdown-stream-perf`
- `http://localhost:3002/blocks/markdown-streaming-demo`

The perf page streamed successfully. The registry demo also handled `Play -> Reset` correctly after the new session cleanup path.

# Working Rule

If state only exists to support one active insert-mode markdown stream, keep it in a package-private streaming session, not in `AIChatPlugin` options.
