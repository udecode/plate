---
title: Stop must force-flush buffered AI stream chunks
date: 2026-04-01
last_updated: 2026-04-01
category: logic-errors
module: apps/www ai-kit and packages/ai useChatChunk
problem_type: logic_error
component: assistant
symptoms:
  - Pressing Stop during insert-mode AI streaming could drop the last buffered characters
  - The real AI editor could preserve most of the response but lose the final short tail when the user interrupted quickly
  - Unit tests around the batcher passed for normal finish while the interrupted stop path still lost text
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - ai
  - streaming
  - batching
  - stop
  - apps-www
  - packages-ai
---

# Stop must force-flush buffered AI stream chunks

## Problem

Insert-mode AI streaming now batches later deltas in a short `16ms` or `32ms` window before calling `streamInsertChunk`.

That improved throughput, but it also created a new edge case. If the user pressed Stop while one of those batched tails was still waiting in memory, the app could flip `streaming` to `false` before the batcher drained. The final characters had already arrived from the transport, but they never reached the editor preview.

## Symptoms

- The real `editor-ai` page could stream normally, then lose the final few buffered characters after Stop.
- The batcher logic looked correct for normal completion, but the interrupted path behaved differently because Stop happens before the transport reaches a normal `text-end`.
- A browser smoke test that compared document size right before Stop and after settle could catch a shrink on interrupted runs.

## What Didn't Work

- Flushing buffered text only in the normal `onFinish` path was not enough.
- Looking only at `AIChatPlugin.stop()` suggested the stream had stopped cleanly, but it hid the fact that app-level buffered text still existed.
- Guarding `applyChunk` with `if (!streaming) return` was correct for stale callbacks, but it also blocked the one final interrupted flush that should have been allowed through.

## Solution

Teach the interrupted finish path to carry intent all the way to the batcher.

In [`useChatChunk.ts`](/Users/felixfeng/Desktop/repos/plate/packages/ai/src/react/ai-chat/hooks/useChatChunk.ts):

- extend `onFinish` so it can report `{ interrupted?: boolean }`
- when the raw text stream stops loading without a normal `text-end`, call `onFinish({ interrupted: true })`
- keep normal completions on `interrupted: false`

In [`ai-stream-batching.ts`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/lib/ai-stream-batching.ts):

- let `flush()` forward an optional `{ force: true }` flag to the `applyChunk` callback

In [`ai-kit.tsx`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/components/editor/plugins/ai-kit.tsx):

- allow `applyChunk` to bypass the `streaming` guard when the flush is forced
- on finish, flush the batcher once with `{ force: true }` before resetting stream state

This keeps the normal stale-callback protection, but still lets the interrupted stop path deliver the buffered tail that was already received.

## Why This Works

There are two different meanings behind “streaming is false”:

- the stream is truly over and no more buffered text matters
- the user interrupted the stream, but one short buffered tail still needs to be committed

The old code treated both cases the same. Once Stop flipped `streaming` off, every later batcher callback looked stale and got dropped.

The fix separates those cases. An interrupted finish explicitly says “flush one last buffered chunk even though streaming is already false.” That preserves the text the transport already delivered without reopening the stream or allowing arbitrary late writes.

## Prevention

- When batching async editor updates, design the interrupted path separately from the normal finish path.
- If a stop action flips a shared state flag, check whether any app-local buffer still needs a one-shot drain.
- Add one regression test for the transport seam and one for the batcher seam:
  - interrupted finish metadata reaches the caller
  - forced flush forwards through the batcher
- For streaming UI fixes, verify both with tests and with a browser run that interrupts mid-stream.

## Verification

These checks passed:

```bash
bun test ./packages/ai/src/react/ai-chat/hooks/useChatChunk.slow.tsx
bun test apps/www/src/registry/lib/ai-stream-batching.spec.ts
bun test ./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx
corepack pnpm install
corepack pnpm turbo build --filter=./packages/ai --filter=./apps/www
corepack pnpm turbo typecheck --filter=./packages/ai --filter=./apps/www
corepack pnpm lint:fix
```

Browser verification also passed on `http://localhost:3002/blocks/editor-ai` using the real page editor instance and the real `aiChat.submit()` plus `aiChat.stop()` APIs. Three interrupted runs showed no shrink after Stop:

- run 1: `deltaAfterStop = +1`
- run 2: `deltaAfterStop = 0`
- run 3: `deltaAfterStop = +24`

That is the expected result: Stop may preserve the current text exactly or land the final buffered tail, but it should not roll the document backward.

## Related Issues

- Related learning: [Insert-stream batching must run in AIKit, not only in the demo surface](/Users/felixfeng/Desktop/repos/plate/.claude/docs/solutions/performance-issues/2026-04-01-insert-stream-batching-must-run-in-ai-kit.md)
- Related learning: [Stream insert preview range must not consume trailing blocks](/Users/felixfeng/Desktop/repos/plate/.claude/docs/solutions/logic-errors/2026-04-01-stream-insert-preview-range-must-not-consume-trailing-blocks.md)
