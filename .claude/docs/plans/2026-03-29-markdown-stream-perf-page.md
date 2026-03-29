# Markdown Stream Perf Page Plan

## Goal

Add a dev-only markdown streaming performance page that uses the captured live chunk list as the fixed baseline dataset.

Expose it from `/dev` with a clear button/link, and show repeatable numbers instead of relying on subjective playback feel.

## Scope

- add a dedicated dev route similar to `/dev/table-perf`
- benchmark the real streaming path used by the demo:
  - raw chunks
  - markdown joiner
  - `streamInsertChunk`
  - editor render work
- keep the benchmark dataset fixed to `liveMarkdownEditorsArticleChunks`
- add a small pure test seam for benchmark helpers

## Findings

- `/Users/felixfeng/Desktop/udecode/plate/apps/www/src/app/dev/table-perf/page.tsx` is a standalone perf lab with:
  - a `Profiler`
  - repeatable warmup/measured runs
  - metrics state kept mostly in refs during measurement
- `/Users/felixfeng/Desktop/udecode/plate/apps/www/src/app/dev/markdownStreamDemo.tsx` already contains the streaming helpers we need:
  - `resetStreamingState`
  - `applyChunk`
  - local `transformChunks`
- current demo hot path mixes editor work with heavy debug UI work, so the new page should stay narrower and benchmark the streaming path itself
- `.claude/docs/solutions/patterns/critical-patterns.md` does not exist in this repo, so there was no extra global pattern file to read

## Plan

1. Add a shared helper for:
   - transforming raw markdown chunks with `MarkdownJoiner`
   - summarizing the fixed dataset
   - calculating stats for measured samples
2. Add a spec for those helpers first.
3. Build `/dev/markdown-stream-perf` with:
   - dataset summary
   - configurable benchmark iterations and burst size
   - benchmark button
   - profiled editor preview
4. Add a clear entry button from `/dev`.
5. Verify with tests, build, typecheck, lint, and browser.

## Verification

- `bun test` for the new helper spec
- `pnpm install` or fallback `pnpm install --ignore-scripts` if the existing prepare hook still fails
- `pnpm turbo build --filter=./apps/www`
- `pnpm turbo typecheck --filter=./apps/www`
- `pnpm lint:fix`
- browser verification on:
  - `http://localhost:3002/dev`
  - `http://localhost:3002/dev/markdown-stream-perf`

## Status

- [completed] Recover context after compaction
- [completed] Re-read relevant skills and existing perf/demo files
- [completed] Search existing learnings
- [in_progress] Add helper test seam and perf route
- [pending] Verify code and browser behavior
