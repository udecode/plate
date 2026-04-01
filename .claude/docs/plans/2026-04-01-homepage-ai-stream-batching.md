# Homepage AI Stream Batching

## Goal

Make the homepage AI editor consume the burst-batching win without copying the demo UI. Keep first-token responsiveness while reducing `streamInsertChunk` call count in the real insert-mode path.

## Source Of Truth

- User request in thread: continue from the adaptive batching proposal and make sure the homepage AI editor surface eats the optimization
- Repo instructions in `AGENTS.md`
- Browser rules for persistent `dev-browser --connect http://127.0.0.1:9222`
- [apps/www/src/registry/components/editor/plugins/ai-kit.tsx](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/components/editor/plugins/ai-kit.tsx)
- [apps/www/src/registry/examples/markdown-streaming-demo.tsx](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/examples/markdown-streaming-demo.tsx)
- [packages/ai/src/react/ai-chat/hooks/useChatChunk.ts](/Users/felixfeng/Desktop/repos/plate/packages/ai/src/react/ai-chat/hooks/useChatChunk.ts)

## Constraints

- Keep the shipped package surface unchanged for this pass.
- Only change the real `apps/www` editor path, not `templates/**`.
- Preserve insert-mode preview history behavior.
- Verify with build-first checks and real browser proof before handoff.

## Findings

- The homepage editor path already uses package-level `streamInsertChunk`, but `ai-kit.tsx` still calls it once per incoming chunk.
- Demo and perf pages already proved the big win comes from lower update count, not from cheaper single-call cost.
- Measured benchmark on `http://localhost:3002/dev/markdown-stream-perf`:
  - `burst=5`: end-to-end `1442.04 ms`, render count `114`
  - `burst=1`: end-to-end `6311.12 ms`, render count `527`
- `useChatChunk` already gives a clean seam for app-level batching:
  - ordered `text-delta` callbacks
  - `isFirst`
  - finish callback when the stream ends or loading drops
- Existing learnings say insert-stream runtime state should stay package-private. That points to app-level batching glue here, not new plugin option state.

## Plan

| Phase | Status | Notes |
| --- | --- | --- |
| Review learnings, demo batching, and real editor path | complete | Confirmed `ai-kit.tsx` is the narrowest integration seam |
| Capture the approach in a repo-local planning file | complete | This file |
| Add a small tested batching controller | complete | Added first-chunk immediate flush plus 16/32ms adaptive batching |
| Wire the controller into `ai-kit.tsx` insert-mode streaming | complete | Homepage/editor-kit path now consumes the batching controller |
| Fix homepage regression in streamed insert range tracking | complete | `streamInsertChunk` now scopes itself to the preview range instead of `editor.children.slice(startIndex)` |
| Run tests and required workspace verification | complete | `bun test ./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx`, `pnpm turbo build --filter=./packages/ai --filter=./apps/www`, `pnpm turbo typecheck --filter=./packages/ai --filter=./apps/www`, `pnpm lint:fix` |
| Verify the homepage AI editor with `dev-browser` | complete | Reused persistent Chrome and confirmed homepage blocks are preserved after AI execution |

## Design Direction

- First insert chunk flushes immediately.
- Later chunks buffer in a short timer window.
- Window starts at `16ms` and stretches to `32ms` after slow flushes.
- Finish always flushes buffered text before `resetStreamInsertChunk`.
- Immediate flush for structural boundaries if the chunk contains line breaks or likely heavy markdown delimiters.

## Progress Log

- 2026-04-01: Reviewed relevant learnings and confirmed the real editor path still streams one chunk at a time.
- 2026-04-01: Confirmed a small controller + `ai-kit` wiring is the lowest-risk way to ship this without changing package contracts.
- 2026-04-01: Added a regression test proving insert-mode streaming must preserve trailing top-level blocks after the insertion point.
- 2026-04-01: Root cause was not the batch timer. The new `streamInsertChunk` implementation used the current selection block as `startPath` and sliced `editor.children` from that index to the end, so accepted preview updates could consume unrelated trailing blocks.
- 2026-04-01: Fixed `streamInsertChunk` to use the true streamed insertion start path and only diff the existing preview-owned range.
