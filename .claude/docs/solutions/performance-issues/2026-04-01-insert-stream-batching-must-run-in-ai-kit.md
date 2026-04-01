---
module: ai
date: 2026-04-01
problem_type: performance_issue
component: assistant
symptoms:
  - "The markdown streaming demo and perf page feel faster than the real AI editor path"
  - "Insert-mode AI streaming still calls streamInsertChunk once per text delta in ai-kit"
  - "Burst-size benchmarks show end-to-end time is dominated by update count, not just single-call cost"
root_cause: scope_issue
resolution_type: code_fix
severity: medium
tags:
  - ai
  - streaming
  - performance
  - apps-www
  - streaminsertchunk
  - batching
  - ai-kit
---

# Insert-stream batching must run in AIKit, not only in the demo surface

## Problem

The markdown streaming demo and `/dev/markdown-stream-perf` already proved that burst batching lowers end-to-end cost, but the real insert-mode AI editor path was still streaming every incoming text delta straight into `streamInsertChunk`.

That meant the benchmark looked better while the user-facing editor path still paid the old update count.

## Symptoms

- `/dev/markdown-stream-perf` showed a large gap between `burst=1` and `burst=5`, but the homepage and playground AI editor path did not consume that optimization automatically.
- [`ai-kit.tsx`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/components/editor/plugins/ai-kit.tsx) still called `streamInsertChunk(editor, chunk)` for each `useChatChunk` delta.
- Real editor UX risk stayed concentrated in insert-mode streaming: too many parser/editor passes, too many paints, and a rougher long-response path.

## What Didn't Work

- Keeping burst batching only in [`markdown-streaming-demo.tsx`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/examples/markdown-streaming-demo.tsx) and [`page.tsx`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/app/dev/markdown-stream-perf/page.tsx) improved the debug surfaces only.
- Copying the demo's fixed burst behavior straight into the user-facing editor would have traded too much first-token responsiveness for throughput.

## Solution

Add a small app-level batching controller and wire it into the real insert-mode integration in [`ai-kit.tsx`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/components/editor/plugins/ai-kit.tsx).

The controller lives in [`ai-stream-batching.ts`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/lib/ai-stream-batching.ts) and applies four rules:

```ts
if (isFirst) {
  reset();
  pendingChunk = chunk;
  flush();
  return;
}

pendingChunk += chunk;

if (shouldFlushAIStreamChunkImmediately(chunk)) {
  flush();
  return;
}

if (!timer) {
  timer = schedule(() => {
    timer = null;
    flush();
  }, batchWindowInMs);
}
```

Key behavior:

- first chunk flushes immediately
- later chunks batch in a short timer window
- slow flushes stretch the next window from `16ms` to `32ms`
- line breaks and heavy markdown delimiters flush immediately
- `onFinish` flushes buffered text before `resetStreamInsertChunk(editor)`

## Why This Works

The useful optimization boundary is not "the demo page" and not "the parser internals". It is the real insert-stream integration seam where transport deltas become editor mutations.

Putting batching there preserves the shipped package contract while letting the real AI editor path consume the same update-count win that the benchmark already measured.

Using "first chunk immediate, later chunks short-window batched" keeps the typing feel responsive while still collapsing most redundant `streamInsertChunk` calls on longer responses.

## Prevention

- If a perf win comes from lowering update count, apply it at the real integration seam, not only in the benchmark harness.
- For insert-mode AI streaming, keep package runtime state private and keep app-level batching glue in the app integration.
- Verify both kinds of surfaces:
  - benchmark surface for call-count and wall-clock behavior
  - real editor surface for `Writing... -> ready -> Accept` flow

## Related Issues

- Related learning: [Batch joined chunks per burst before calling streamInsertChunk](/Users/felixfeng/Desktop/repos/plate/.claude/docs/solutions/performance-issues/2026-03-31-markdown-stream-burst-batching.md)
- Related learning: [Keep insert streaming session state out of AIChatPlugin options](/Users/felixfeng/Desktop/repos/plate/.claude/docs/solutions/best-practices/2026-03-31-insert-streaming-session-state-should-not-live-in-aichatplugin-options.md)
