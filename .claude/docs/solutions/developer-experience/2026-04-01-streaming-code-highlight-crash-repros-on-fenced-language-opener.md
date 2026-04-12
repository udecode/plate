---
title: Streaming code-highlight crashes can reproduce on the fenced language opener
type: solution
date: 2026-04-01
last_updated: 2026-04-02
status: completed
category: developer-experience
module: apps/www markdown streaming demo
tags:
  - apps-www
  - demo
  - markdown
  - streaming
  - code-block
  - highlight
  - python
  - repro
---

# Problem

We had a user-provided markdown stream that triggered `CODE_HIGHLIGHT`, but the failure mode was still ambiguous.

The open question was whether the crash came from incomplete streamed code syntax, from `streamInsertChunk`, or from the code-block highlighter itself.

# Symptoms

- The homepage and demo could both surface a `Runtime PlateError` tagged as `CODE_HIGHLIGHT`.
- Earlier reports made it look like an incomplete streamed code block might be the trigger.
- The markdown streaming demo did not have a built-in preset for this exact stream, so the repro path was noisy.
- In dev mode, repeated streaming replays could still flood the server/browser log bridge with large `CODE_HIGHLIGHT` warnings even after the fatal overlay was removed.

# Solution

Normalize the SSE transcript into the demo's raw chunk format, replay it on the markdown streaming demo as a dedicated preset scenario, then make registered-language highlight failures fall back to plaintext without throwing, retrying, or logging the full regex payload on every chunk.

The useful part of the transcript is only the ordered `text-delta` payloads. The demo's paste helper accepts `JSON.stringify(string[])`, not raw `data: {...}` lines, so the transcript first had to be converted into a plain string array.

For a stable browser repro, we added `highlightErrorRepro` to [markdown-streaming-demo.tsx](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/examples/markdown-streaming-demo.tsx) and then replayed it on:

- `http://localhost:3002/blocks/markdown-streaming-demo`

The important finding came from stepping the scenario forward one joined chunk at a time. The crash occurs on the chunk that opens the fenced language block:

```ts
"```python\\n"
```

In this dataset, that is step `73` in the demo's joined-chunk playback.

Once the failing boundary was clear, the actual fix lived in [setCodeBlockToDecorations.ts](/Users/felixfeng/Desktop/repos/plate/packages/code-block/src/lib/setCodeBlockToDecorations.ts).

That helper already tries to fall back to plaintext when highlighting fails. The problem was that the registered-language branch called `editor.api.debug.error(...)` before returning the empty highlight result. In development, `debug.error(...)` throws a `PlateError`, so the fallback never executes.

The first fix is to log this case with `debug.warn(...)` instead:

```ts
editor.api.debug.warn(
  `Failed to highlight language "${effectiveLanguage}". Falling back to plaintext`,
  'CODE_HIGHLIGHT',
  error
);
highlighted = { value: [] };
```

This keeps the code block editable and lets the render path continue with plaintext decorations.

The follow-up fix is to treat the failing registered language as disabled for the current `lowlight` instance after the first failure. That prevents every later streaming normalization pass from calling `lowlight.highlight(...)` again for the same broken language.

We also sanitize the warning detail. Some runtimes include the full invalid regex source in `error.message`, which makes the warning payload enormous. Instead of logging the whole regex, collapse it to a short reason such as:

```txt
Invalid regular expression (Range out of order in character class)
```

# Why This Works

This isolates the code-path boundary much better than looking at the final rendered document or at the fully completed stream.

The demo applies `streamInsertChunk` incrementally. By stepping the joined chunks, we can see whether the failure appears:

- before the code fence exists
- exactly when the language fence arrives
- only after incomplete code lines appear

For this stream, the failure starts as soon as the fenced language opener lands. That means the primary trigger is not an incomplete Python statement like `def hello_world():` or `print(...)`.

Instead, the failing boundary is the moment the block becomes a syntax-highlighted `python` code block. In the reproduced run, the browser surfaced:

```txt
[CODE_HIGHLIGHT] SyntaxError: Invalid regular expression ... Range out of order in character class
```

That points investigation toward the code-highlight path itself, not toward markdown body incompleteness.

After the fix, the same stream still reaches the `python` opener, but the editor stays alive because highlight failures no longer escalate into a fatal dev overlay, repeated streaming passes stop retrying the same broken language, and the warning payload stays small enough for Turbopack dev logging to tolerate.

# Verification

## Browser verification

Verified with `dev-browser` against the persistent Chrome session:

- loaded `http://localhost:3002/blocks/markdown-streaming-demo`
- selected `Highlight Error Repro`
- replayed with `Burst size = 1`
- confirmed the original crash on the fenced language opener chunk `````python\n``` at step `73`
- replayed again after the fix
- completed the scenario to `104/104`
- confirmed `Sample Markdown Document` and the Python code body rendered with no runtime overlay

## Workspace checks

```bash
corepack pnpm install
corepack pnpm turbo build --filter=./packages/code-block --filter=./apps/www
corepack pnpm turbo typecheck --filter=./packages/code-block --filter=./apps/www
corepack pnpm lint:fix
bun test packages/code-block/src/lib/setCodeBlockToDecorations.spec.ts
```

All five commands passed.

Additional follow-up verification on `2026-04-02`:

- `corepack pnpm turbo build --filter=./packages/code-block --filter=./apps/www`
- `corepack pnpm turbo typecheck --filter=./packages/code-block --filter=./apps/www`
- `corepack pnpm lint:fix`
- `bun test packages/code-block/src/lib/setCodeBlockToDecorations.spec.ts`
- replayed `http://localhost:3010/blocks/markdown-streaming-demo` and `http://localhost:3010/dev/markdown-stream-perf`
- confirmed the dev server warning shrank to:
  `Invalid regular expression (Range out of order in character class)`
- refreshed `/dev/markdown-stream-perf` five times without another `RangeError: Map maximum size exceeded`

# Working Rule

When a streamed markdown repro seems to implicate incomplete code syntax, do not trust the final rendered output alone.

First replay the stream step by step in the markdown streaming demo. If the crash starts on the fenced language opener itself, focus on the code-highlight path before debugging incomplete code-body syntax.

For highlight failures in a registered language, prefer a non-fatal warning plus plaintext fallback over a thrown dev-time error. The editor should keep streaming even when syntax highlighting cannot.

If a registered language is known to fail in the current runtime, stop retrying that language for the same `lowlight` instance and keep the warning detail compact. Replaying the same broken highlight on every streamed chunk can turn a recoverable syntax-highlighting issue into a dev-server stability problem.
