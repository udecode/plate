---
title: Batch joined chunks per burst before calling streamInsertChunk
type: solution
date: 2026-03-31
status: completed
category: performance-issues
module: ai
tags:
  - markdown
  - streaming
  - performance
  - ai
  - apps-www
  - benchmark
---

# Problem

The markdown streaming demos already grouped raw AI chunks into animation-frame flushes, but the editor path still replayed every joined chunk one by one inside each flush.

That meant the UI paid the full `streamInsertChunk` cost for every joined chunk even when the browser only painted once per burst.

# Symptoms

- The live AI demo still felt much faster and rougher than the preset playback.
- `/dev/markdown-stream-perf` showed multi-second wall-clock time for the captured article stream.
- The old `burst size=5` benchmark still executed `860` `streamInsertChunk` calls across `5` measured runs.

# Solution

Batch the joined chunks that belong to the same burst into one combined markdown string, then call `streamInsertChunk` once for that burst.

We applied that rule in two places:

- the registry demo at [markdown-streaming-demo.tsx](/Users/felixfeng/Desktop/udecode/plate/apps/www/src/registry/examples/markdown-streaming-demo.tsx)
- the benchmark page at [page.tsx](/Users/felixfeng/Desktop/udecode/plate/apps/www/src/app/dev/markdown-stream-perf/page.tsx)

The key change is simple:

```ts
const chunkBatch = chunks.slice(startIndex, endIndex).join('');

if (chunkBatch.length > 0) {
  applyChunk(editor, chunkBatch);
}
```

The same idea also replaces replay loops. When we need to rebuild the editor for a prefix, we now replay the whole prefix as one concatenated markdown batch instead of one chunk at a time.

# Why This Works

The important cost on this page is not the joiner. It is the number of `streamInsertChunk` calls.

Each burst already represents a visual update boundary. If five joined chunks are going to land before the next paint anyway, feeding those five chunks to `streamInsertChunk` separately only adds parser and editor work without creating any extra visible value.

The regrouping tests already covered this contract. The streaming core produces the same final editor state for equivalent markdown content even when chunk boundaries move. That made burst-level batching a safe optimization for the demos and the benchmark route.

The result is that the average single call became slightly heavier, but the total number of calls dropped much more sharply:

- old `streamInsertChunk` samples: `860`
- new `streamInsertChunk` samples: `175`

That is why end-to-end time dropped even though per-call mean went from `24.38 ms` to `28.53 ms`.

# Verification

We verified the change in four ways.

## 1. Streaming tests

```bash
bun test apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx apps/www/src/registry/lib/markdown-streaming-chunks.spec.ts apps/www/src/app/dev/markdown-stream-perf/perf-helpers.spec.ts
```

Result: passing

## 2. Workspace checks

```bash
pnpm install
pnpm turbo build --filter=./apps/www
pnpm turbo typecheck --filter=./apps/www
pnpm lint:fix
```

The first three commands passed.

`pnpm lint:fix` still reported existing repository-wide `biome` diagnostics in `packages/mdast-util-from-markdown` and `packages/remark-parse`, outside this batching change.

## 3. Browser benchmark

Route:

- `http://localhost:3002/dev/markdown-stream-perf`

Controls:

- measured runs: `5`
- warmup runs: `2`
- burst size: `5`

Old baseline:

- end-to-end mean: `5039.60 ms`
- burst-step mean: `143.99 ms`
- `streamInsertChunk` mean: `24.38 ms`

New result:

- end-to-end mean: `1682.28 ms`
- burst-step mean: `48.06 ms`
- `streamInsertChunk` mean: `28.53 ms`

## 4. Browser smoke

Both pages loaded correctly after the change:

- `http://localhost:3002/dev`
- `http://localhost:3002/blocks/markdown-streaming-demo`

# Working Rule

When the UI only needs one visual update per burst, batch the joined markdown for that burst before calling `streamInsertChunk`.

If you only compare per-call mean, you can miss the real win. Track call count and end-to-end wall-clock time together.
