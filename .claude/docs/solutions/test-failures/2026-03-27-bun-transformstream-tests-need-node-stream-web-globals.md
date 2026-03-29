---
title: Bun tests for TransformStream helpers need node stream web globals
category: test-failures
date: 2026-03-27
tags:
  - bun
  - tests
  - streams
  - registry
  - ai
---

# Bun tests for TransformStream helpers need node stream web globals

## Problem

A new spec for `apps/www/src/registry/lib/markdown-joiner-transform.ts` passed in an ad-hoc `bun -e` probe, but failed inside `bun test`.

The failures looked unrelated to the helper logic itself:

- `pipeThrough` rejected the returned transform with `TypeError: readable should be ReadableStream`
- direct `stream.writable.getWriter()` access failed because `getWriter` was missing in the test environment

That made it look like the new tests were wrong, even though the helper behavior was fine.

## Root Cause

The registry helper constructs a `TransformStream` from globals at runtime.

In the Bun test runner, the active global Web Streams implementation did not behave like the standard stream constructors that the helper expected. The mismatch only showed up in the test harness layer, not in the production logic.

That means the failure was not “the joiner transform is broken.” The real issue was “the test runner global stream constructors are not a stable harness for this helper.”

## Solution

Keep the production helper untouched. Fix the test harness instead.

In the spec:

1. Import `ReadableStream` and `TransformStream` from `node:stream/web`
2. Temporarily assign those constructors onto `globalThis`
3. Construct the readable stream and the transform while those globals are active
4. Restore the original globals in a `finally` block

This keeps the test focused on public behavior while avoiding test-runner-specific stream incompatibilities.

The working pattern looks like this:

```ts
import type { TextStreamPart, ToolSet } from 'ai';
import {
  ReadableStream as WebReadableStream,
  TransformStream as WebTransformStream,
} from 'node:stream/web';

type Chunk = TextStreamPart<ToolSet>;

const readStream = async (chunks: Chunk[]) => {
  const originalTransformStream = globalThis.TransformStream;
  const originalReadableStream = globalThis.ReadableStream;

  globalThis.ReadableStream =
    WebReadableStream as unknown as typeof ReadableStream;
  globalThis.TransformStream =
    WebTransformStream as unknown as typeof TransformStream;

  try {
    const stream = new ReadableStream<Chunk>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk);
        controller.close();
      },
    }).pipeThrough(markdownJoinerTransform()());

    const reader = stream.getReader();
    const output: Chunk[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      output.push(value as Chunk);
    }

    return output;
  } finally {
    globalThis.ReadableStream = originalReadableStream;
    globalThis.TransformStream = originalTransformStream;
  }
};
```

## Prevention

- If a stream helper passes in `bun -e` but fails in `bun test`, check the stream constructors before changing product code.
- For registry or demo helpers that build `TransformStream` from globals, prefer a harness that pins `ReadableStream` and `TransformStream` explicitly.
- Keep the shim inside the test file unless the same issue starts repeating across many specs.

## Verification

These checks passed with the harness fix in place:

```bash
bun test apps/www/src/__tests__/package-integration/ai-chat-streaming/markdownJoinerTransform.spec.ts
pnpm turbo build --filter=./apps/www
pnpm turbo typecheck --filter=./apps/www
```

Repo-wide `pnpm lint:fix` still failed on unrelated existing diagnostics outside this slice.
