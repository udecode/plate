# Markdown Stream Perf Baseline

## Goal

Measure the current markdown streaming performance from the new `/dev/markdown-stream-perf` page and record the numbers in an internal document.

## Measurement Scope

- route: `/dev/markdown-stream-perf`
- dataset: `liveMarkdownEditorsArticleChunks`
- primary baseline:
  - measured runs: 5
  - warmup runs: 2
  - burst size: 5
- if stable and cheap enough, add one comparison run with a smaller burst size

## Findings So Far

- The perf page already exposes the exact data we need in the DOM:
  - dataset summary
  - run config
  - end-to-end stream stats
  - burst-step stats
  - `streamInsertChunk` call stats
  - joiner stats
  - render duration stats
- `agent-browser` supports `eval`, so we can read the rendered text directly instead of scraping screenshots.
- There is no existing `performance-issues/` solutions directory, so this measurement will create the first performance baseline note there.

## Plan

1. Start the local `www` server on port `3002`.
2. Open `/dev/markdown-stream-perf`.
3. Run the default benchmark and wait for completion.
4. Read the rendered metrics text from the page.
5. Write a dated internal performance-baseline doc under `.claude/docs/solutions/performance-issues/`.
6. Verify the doc file content and report the measured numbers back to the user.

## Status

- [completed] Reload relevant skills and inspect doc patterns
- [completed] Create a measurement plan file
- [in_progress] Run the benchmark and capture numbers
- [pending] Write the internal baseline document
