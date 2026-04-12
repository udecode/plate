# Fix Dev Server Highlight Log Spam

## Goal

Stop the `pnpm dev` crash where repeated streamed code-highlight failures eventually lead to `RangeError: Map maximum size exceeded` in Next/Turbopack dev mode.

## Current Hypothesis

- Registered-language highlight failures already fall back to plaintext.
- The remaining issue is repeated retries plus repeated logging of a huge `Error` object during streaming replay.
- That large warning payload likely gets mirrored through the dev server/browser logging bridge until Turbopack falls over.

## Evidence

- User repro logs show many repeated `CODE_HIGHLIGHT` warnings before the final `Map maximum size exceeded` crash.
- [setCodeBlockToDecorations.ts](/Users/felixfeng/Desktop/repos/plate/packages/code-block/src/lib/setCodeBlockToDecorations.ts) still passes the full `error` object to `debug.warn(...)`.
- Existing tests in [setCodeBlockToDecorations.spec.ts](/Users/felixfeng/Desktop/repos/plate/packages/code-block/src/lib/setCodeBlockToDecorations.spec.ts) explicitly lock in that large warning payload.

## Plan

- [completed] Add a failing regression test around repeated registered-language highlight failure behavior.
- [completed] Implement a durable fix that avoids repeated heavy logging and repeated failing highlight work.
- [completed] Run targeted tests plus build, typecheck, lint.
- [completed] Recheck the demo/perf dev-server path in browser/dev mode.

## Progress Log

- 2026-04-02: Reloaded context after compaction, re-read the code-highlight implementation, the earlier learning, and the current spec coverage.
- 2026-04-02: Added a regression that proved registered-language failures were retried on every call.
- 2026-04-02: Cached failed registered languages per `lowlight` instance and collapsed invalid-regex warnings to a short reason string.
- 2026-04-02: Verified `markdown-streaming-demo` still completes, `markdown-stream-perf` still runs, and repeated perf page refreshes no longer reproduced the `Map maximum size exceeded` crash.
