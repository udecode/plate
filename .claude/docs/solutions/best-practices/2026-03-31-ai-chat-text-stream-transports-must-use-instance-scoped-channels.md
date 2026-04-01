---
module: AI
date: 2026-03-31
problem_type: best_practice
component: assistant
symptoms:
  - "Two AI editors can consume each other's raw text deltas when they share the same chat id"
  - "Passing a custom text-stream transport can silently fall back to assistant-message diffing"
  - "Docs and app glue drift because the package does not expose transport capability as a first-class contract"
root_cause: scope_issue
resolution_type: code_fix
severity: high
tags:
  - ai
  - streaming
  - transport
  - usechatchunk
  - session-scope
  - docs
---

# AI chat text-stream transports must use instance-scoped channels

## Problem

The first pass of the AI chat streaming refactor moved insert-session state out of `AIChatPlugin`, but the text-event seam was still only half-shaped.

Raw `text-start` / `text-delta` / `text-end` events were broadcast through a global listener map keyed by `chatId`, and the app only enabled that path with a private boolean on one specific caller. That meant the package surface still leaked app assumptions into what should have been a transport-level contract.

## Symptoms

- Two editors with the same `chatId` could subscribe to the same text stream bucket and receive each other's deltas.
- `useChatChunk` only used raw transport events when the chat object happened to carry an app-private flag, so explicitly passing the same transport from another caller could fall back to assistant-message diffing.
- Public docs still showed `DefaultChatTransport`, which meant the documented integration path missed the new text-stream seam entirely.

## What Didn't Work

### Using `chatId` as the bus key

`chatId` is useful for request identity, but it is not unique enough to represent one live transport instance.

As soon as two editors reuse the same id, a global listener map keyed only by `chatId` turns into a shared bucket.

### Hiding capability behind an app-private boolean

The earlier bridge set `__plateTextStreamEvents` only when the app created the default transport locally.

That fixed one caller, but it did not make transport capability discoverable from the package contract. A caller could still pass the same transport explicitly and lose the raw-event path.

## Fix

Make the transport own an instance-scoped channel and let the package annotate the returned chat helpers with that channel metadata.

### 1. Give each transport instance its own channel

In [`chatTextStreamTransport.ts`](/Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/streaming/chatTextStreamTransport.ts), the listener bus now uses a generated `channelId` instead of plain `chatId`.

Each `AIChatTextStreamTransport` instance creates its own channel:

```ts
const createChatTextStreamChannelId = (chatId: string) =>
  `${chatId}:${++nextChatTextStreamChannelId}`;
```

And streamed text events emit against `this.channelId`, not a shared editor id.

### 2. Make transport capability first-class

The package now exposes two small helpers:

- `getAIChatTextStreamChannelId(transport)`
- `withAIChatTextStream(chat, transport)`

`withAIChatTextStream` annotates the returned `UseChatHelpers` object with `__plateTextStreamChannelId` when the transport supports raw text events. That turns capability detection into a package-owned contract instead of app-specific glue.

### 3. Teach `useChatChunk` to prefer raw text events

In [`useChatChunk.ts`](/Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/hooks/useChatChunk.ts), the hook now:

- subscribes to `subscribeChatTextStream(textStreamChannelId, ...)` when a channel id is present
- accumulates streamed text locally from `text-delta` events
- still falls back to assistant-message diffing when no text-stream channel is available

That keeps compatibility for non-text-stream transports while making the preferred path explicit.

### 4. Move the app wrapper onto the package seam

In [`use-chat.ts`](/Users/felixfeng/Desktop/udecode/plate/apps/www/src/registry/components/editor/use-chat.ts), the editor integration now:

- creates or accepts a transport
- wraps the returned helpers with `withAIChatTextStream`
- syncs the plugin chat option with `useEffectEvent` instead of an ignored dependency lint escape hatch

### 5. Update docs to show the real contract

The AI docs now demonstrate `createAIChatTextStreamTransport(...)` plus `withAIChatTextStream(...)`, so the public reference matches the package behavior that `useChatChunk` expects.

## Why This Works

This fix restores the right ownership boundaries:

- transport instances own raw stream identity
- package helpers expose transport capability
- hooks consume the package contract
- app code wires the pieces together without inventing a private side-channel

That separation matters because streaming bugs at this layer are subtle. If transport identity and hook capability are not first-class, the code can look correct in one demo while still being unsafe for multiple editors or custom callers.

## Prevention

- Do not key a raw-event observer bus by a reusable app identifier when the real lifetime is one transport instance.
- If a hook depends on a transport capability, expose that capability from the package surface instead of teaching one app to set a private marker.
- Add a behavior test for "same chat id, different transport instances" any time you build shared streaming infrastructure.
- Keep docs aligned with the shipped seam. If the package expects `withAIChatTextStream`, the docs should show it.

## Verification

These checks passed while landing the fix:

```bash
bun test ./packages/ai/src/react/ai-chat/streaming/chatTextStreamTransport.spec.ts ./packages/ai/src/react/ai-chat/hooks/useChatChunk.slow.tsx
corepack pnpm turbo build --filter=./packages/ai --filter=./apps/www
corepack pnpm turbo typecheck --filter=./packages/ai --filter=./apps/www
corepack pnpm exec biome check /Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/streaming/chatTextStreamTransport.ts /Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/streaming/chatTextStreamTransport.spec.ts /Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/hooks/useChatChunk.ts /Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/hooks/useChatChunk.slow.tsx /Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/AIChatPlugin.ts /Users/felixfeng/Desktop/udecode/plate/apps/www/src/registry/components/editor/use-chat.ts
```

`corepack pnpm lint:fix` still failed because of existing repo-wide Biome diagnostics in `packages/mdast-util-from-markdown/**` and `packages/remark-parse/index.d.ts`, outside this text-stream follow-up.

## Related Issues

- Related learning: [Keep insert streaming session state out of AIChatPlugin options](/Users/felixfeng/Desktop/udecode/plate/.claude/docs/solutions/best-practices/2026-03-31-insert-streaming-session-state-should-not-live-in-aichatplugin-options.md)
