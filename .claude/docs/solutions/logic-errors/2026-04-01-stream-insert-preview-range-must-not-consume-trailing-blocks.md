---
title: Stream insert preview range must not consume trailing blocks
date: 2026-04-01
category: logic-errors
module: packages/ai streamInsertChunk
problem_type: logic_error
component: assistant
symptoms:
  - Homepage AI execution removed top-level blocks after the insertion point
  - The AI menu anchor felt offset because streamed content started from the wrong top-level path
  - A streamed insert regression test failed once the editor had blocks after the cursor
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - ai
  - streaming
  - preview
  - homepage
  - blocks
  - plate
---

# Stream insert preview range must not consume trailing blocks

## Problem

The new `streamInsertChunk` replay implementation tracked markdown session state correctly, but it diffed against the wrong document slice.

On the homepage AI editor, running an insert-style command near the top of the document could treat every top-level block after the cursor as part of the streamed preview. That made later blocks disappear while the preview was still streaming.

## Symptoms

- Running AI on the homepage could remove blocks that came after the insertion point.
- The behavior was easiest to notice in long documents like the homepage playground because many unrelated blocks sat below the cursor.
- The AI menu anchor also felt wrong because the streamed preview started from the selected block path instead of the actual streamed insertion path.
- This targeted regression test failed before the fix:

```bash
bun test ./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx
```

## What Didn't Work

- Looking only at the new homepage batching controller in [`ai-kit.tsx`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/components/editor/plugins/ai-kit.tsx) was misleading. The timer changed chunk frequency, but it did not decide which existing blocks belonged to the streamed preview.
- Blaming the adaptive `16/32ms` batching window also did not line up with the code path. The destructive behavior came from the package-level diff range inside [`streamInsertChunk.ts`](/Users/felixfeng/Desktop/repos/plate/packages/ai/src/react/ai-chat/streaming/streamInsertChunk.ts), not from when chunks were flushed.

## Solution

Fix the streamed range at the package boundary.

The broken logic used:

- `getInsertPreviewStart(editor).path` as the stream start path for fresh streams
- `editor.children.slice(startIndex)` as the current streamed region

That was too broad for insert mode. For a non-empty current block, the preview should start at the *next* top-level path, and the current streamed region should be only the preview-owned range.

We fixed it in [`streamInsertChunk.ts`](/Users/felixfeng/Desktop/repos/plate/packages/ai/src/react/ai-chat/streaming/streamInsertChunk.ts) by adding two helpers:

1. `getInsertStreamStartPath(editor)`
   - uses the current block path only when the insertion starts in an empty paragraph
   - otherwise starts at `PathApi.next(path)` so the preview begins after the current block

2. `getCurrentStreamBlocks(editor, startPath, currentPath)`
   - prefers the tracked preview end path from the markdown stream session
   - falls back to scanning contiguous top-level nodes marked with `AI_PREVIEW_KEY`
   - never slices from the insertion point to the end of the document

That keeps the diff window limited to the active preview range and leaves unrelated trailing blocks alone.

We also added a regression test in [`streamHistory.slow.tsx`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx) that starts streaming from the first block of a multi-block document, accepts the preview, and asserts that the trailing blocks still exist.

## Why This Works

Insert-mode streaming has two different coordinates:

- the block that currently holds the cursor
- the top-level range that belongs to the streamed preview

The old `_blockPath` implementation implicitly tracked the preview range. The replay rewrite switched to a session-based model, but it accidentally reused the cursor block path as the preview start and then diffed against the whole remaining document.

By restoring the real preview start path and scoping diffs to preview-owned blocks only, the replay algorithm can still do shared-prefix reuse and partial reparse without mutating unrelated content.

## Prevention

- When replacing a per-call mutable path like `_blockPath` with session state, keep the old ownership boundary explicit. Session state should know the *preview range*, not just the markdown source.
- For insert-mode AI work, always test with blocks both before and after the insertion point. Empty-editor tests alone will miss this class of bug.
- If the streamed preview is marked with `AI_PREVIEW_KEY`, treat that marker as the source of truth for range ownership during diffing.
- Verify homepage or playground behavior with real browser runs after package-level streaming changes, even when the visible change started in app code.

## Related Issues

- Related learning: [Insert-stream batching must run in AIKit, not only in the demo surface](/Users/felixfeng/Desktop/repos/plate/.claude/docs/solutions/performance-issues/2026-04-01-insert-stream-batching-must-run-in-ai-kit.md)
- Related learning: [Insert streaming session state should not live in AIChatPlugin options](/Users/felixfeng/Desktop/repos/plate/.claude/docs/solutions/best-practices/2026-03-31-insert-streaming-session-state-should-not-live-in-aichatplugin-options.md)
