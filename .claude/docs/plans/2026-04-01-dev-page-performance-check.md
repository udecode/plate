# Dev Page Performance Check

## Goal

Use `dev-browser` against the persistent debug Chrome to inspect the local `dev/` surface and report concrete performance findings.

## Source Of Truth

- User request in thread: test performance on the local `dev/` page with `dev-browser`
- Repo/browser rules in `AGENTS.md`
- User browser rules for persistent debug Chrome on `127.0.0.1:9222`

## Phases

| Phase | Status | Notes |
| --- | --- | --- |
| Load skills and restate scope | complete | Loaded `task`, `planning-with-files`, `learnings-researcher`, `dev-browser`, `browser-debug-setup`, `performance-oracle`, `debug` |
| Gather nearby learnings and route context | complete | Confirmed `/dev/markdown-stream-perf` is the benchmark surface and reviewed the 2026-03-31 baseline doc |
| Connect persistent dev-browser session | complete | Direct `dev-browser --connect http://127.0.0.1:9222` succeeded; reused `persistent-main` |
| Reproduce and measure performance | complete | Ran the page benchmark with default config: measured runs `5`, warmup runs `2`, burst size `5` |
| Summarize findings | in_progress | Need compare current numbers against prior documented baseline and hand off in Chinese |

## Working Notes

- Reuse the same persistent debug Chrome.
- Do not inspect `9222` unless the direct connect fails.
- If the page redirects to `/login` or needs human action, stop and ask user to unblock.
- Browser findings:
  - `/dev` loaded correctly at `http://localhost:3002/dev`
  - `/dev/markdown-stream-perf` loaded correctly and exposed the expected benchmark controls
  - One reconnect found `persistent-main` sitting on an unrelated page in the same persistent browser, so re-navigation to the benchmark route is necessary before each scripted run
- Current benchmark result on 2026-04-01:
  - screenshot: `/Users/felixfeng/.dev-browser/tmp/markdown-stream-perf-2026-04-01.png`
  - end-to-end mean: `1416.22 ms`
  - burst-step mean: `40.46 ms`
  - `streamInsertChunk` mean: `24.90 ms`
  - joiner mean: `0.24 ms`
  - mount render mean: `32.58 ms`
  - render count per run: `114`
- Prior documented baseline from 2026-03-31:
  - end-to-end mean: `1682.28 ms`
  - burst-step mean: `48.06 ms`
  - `streamInsertChunk` mean: `28.53 ms`
