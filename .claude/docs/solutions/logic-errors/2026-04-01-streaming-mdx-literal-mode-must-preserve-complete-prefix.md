---
title: Streaming MDX literal mode must preserve the complete prefix
date: 2026-04-01
last_updated: 2026-04-01
category: logic-errors
module: packages/ai streamDeserializeMd
problem_type: logic_error
component: assistant
symptoms:
  - Completed `callout` content could make the next markdown chunk stay literal during insert streaming
  - A later incomplete MDX tag could keep already-complete markdown or MDX content from being parsed normally
  - The markdown streaming demo could show `**after**` as raw text after a completed `callout`
  - While streaming an incomplete `column_group`, new inner text like `- Keep the editor...` could temporarily disappear until more MDX arrived
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - ai
  - streaming
  - mdx
  - callout
  - markdown
  - plate
---

# Streaming MDX literal mode must preserve the complete prefix

## Problem

Insert-mode streaming kept a private `mdxName` session flag to avoid parsing obviously incomplete MDX too early.

That guard was too broad. Once a completed chunk started with `<callout>`, the session could stay in MDX literal mode even though the same chunk had already closed the tag. Later markdown chunks then stayed literal, and a later incomplete MDX tail could make the already-complete prefix look unstable.

## Symptoms

- After streaming `<callout>one</callout>\n\n`, the next chunk `**after**\n\n` could render as raw `**after**` text instead of bold markdown.
- The markdown streaming demo showed the completed callout, but the following markdown stayed unparsed until more MDX arrived.
- In the `MDX Callout Props And Columns` preset, the right editor could show `<column_group ...>` and `<column ...>` but hide the newly streamed list text for several steps.
- A regression test around `streamInsertChunk` failed once the stream contained:

```ts
[
  '<callout>one</callout>\n\n',
  '**after**\n\n',
  '<callout type="note">',
]
```

## What Didn't Work

- Treating the whole replay slice as literal text whenever `mdxName` was set was too coarse.
- Looking at batching or replay frequency did not explain the behavior. The bug was in MDX session state and fallback scope, not in how often `streamInsertChunk` ran.
- Relying on [`markdownToSlateNodesSafely`](/Users/felixfeng/Desktop/repos/plate/packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.ts) to inline-deserialize a multiline incomplete MDX tail still lost visible text for nested containers like `column_group`.

## Solution

Fix `streamDeserializeMd` so MDX session state tracks only the *pending* incomplete MDX tail.

In [`streamDeserializeMd.ts`](/Users/felixfeng/Desktop/repos/plate/packages/ai/src/react/ai-chat/streaming/streamDeserializeMd.ts):

- derive the pending MDX name from [`splitIncompleteMdx`](/Users/felixfeng/Desktop/repos/plate/packages/markdown/src/lib/deserializer/utils/splitIncompleteMdx.ts) instead of from any chunk that merely starts with `<tag>`
- clear stale `mdxName` when the current input no longer ends with an incomplete MDX tail
- when the session is still inside the same unfinished MDX tag *and* the input already contains a complete prefix, reuse [`markdownToSlateNodesSafely`](/Users/felixfeng/Desktop/repos/plate/packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.ts) so only the incomplete tail falls back to text
- normalize safe-deserializer output back into block nodes before `streamInsertChunk` post-processing

We also added two regression tests:

- [`streamInsertChunk.slow.tsx`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx)
  - proves completed markdown and MDX stay structured before a later incomplete MDX tail
- [`streamDeserializeMd.slow.tsx`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/__tests__/package-integration/ai-chat-streaming/streamDeserializeMd.slow.tsx)
  - proves a chunk that already closes `<callout>` does not leave the next markdown chunk stuck in literal mode

For multiline incomplete MDX tails, tighten the markdown fallback too.

In [`markdownToSlateNodesSafely.ts`](/Users/felixfeng/Desktop/repos/plate/packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.ts):

- compare the visible inline-deserialized text with the full stripped tail text
- if a multiline incomplete MDX tail would lose user-visible content, keep the whole tail literal instead of partially inline-deserializing it
- reuse the trailing empty paragraph created by the complete prefix so the literal tail stays in the expected block instead of creating an extra blank block

We also added two more regressions:

- [`markdownToSlateNodesSafely.spec.tsx`](/Users/felixfeng/Desktop/repos/plate/packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.spec.tsx)
  - proves a complete prefix plus incomplete multiline column tail keeps the full literal tail visible
- [`streamInsertChunk.slow.tsx`](/Users/felixfeng/Desktop/repos/plate/apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx)
  - proves insert streaming keeps newly arrived column text visible before the MDX container closes

## Why This Works

The streaming parser needs two different behaviors:

- If the stream currently ends with an unfinished MDX opener, protect only that unfinished tail.
- If the stream no longer ends inside that tag, clear the MDX literal-mode flag and parse normally.

The old code conflated those two states. It remembered only that a tag had started at some point, so later chunks inherited literal mode even after the completed prefix was already safe to parse.

By basing the session flag on `splitIncompleteMdx(input)`, the parser asks a better question: does the current replay slice still *end* inside unfinished MDX? If yes, preserve the complete prefix and literalize only the tail. If no, clear the flag and return to normal markdown parsing.

The remaining subtlety is that “literalize only the tail” must still preserve all user-visible text. Nested multiline MDX containers are not safe to squeeze through the inline fallback because that path strips block structure and can drop the newest text. Comparing the visible inline output to the stripped tail catches that loss early and falls back to the full literal tail instead.

## Prevention

- Do not let streaming session flags describe historical state. They must describe the current unfinished tail only.
- For streaming MDX regressions, add at least one test with this shape:
  - completed MDX block
  - normal markdown after it
  - later incomplete MDX opener
- If a fallback needs to protect incomplete MDX, prefer `splitIncompleteMdx`-style prefix preservation over whole-input stringification.
- If a safe fallback handles multiline incomplete MDX, assert that every newly streamed visible character still appears somewhere in the fallback output.
- Verify package-level streaming fixes in the browser with pasted raw chunks, not only with preset scenarios.

## Verification

These checks passed:

```bash
bun test ./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamDeserializeMd.slow.tsx
bun test ./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx
bun test packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.spec.tsx
bun test ./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx
corepack pnpm install
corepack pnpm turbo build --filter=./packages/markdown --filter=./apps/www
corepack pnpm turbo typecheck --filter=./packages/markdown --filter=./apps/www
corepack pnpm lint:fix
```

Browser verification also passed on `http://localhost:3002/blocks/markdown-streaming-demo` by pasting:

```json
[
  "<callout>one</callout>\n\n",
  "**after**\n\n",
  "<callout type=\"note\">"
]
```

The final `Editor tree` kept:

- a structured `callout` node for `one`
- a bold paragraph node for `after`
- only the unfinished tail as literal text

Browser verification also passed on the `MDX Callout Props And Columns` preset by stepping through the previously broken window. At steps 37-40 the editor text kept advancing through:

- `- K`
- `- Kee`
- `- Keep the`
- `- Keep the editor`

## Related Issues

- Related learning: [Stream insert preview range must not consume trailing blocks](/Users/felixfeng/Desktop/repos/plate/.claude/docs/solutions/logic-errors/2026-04-01-stream-insert-preview-range-must-not-consume-trailing-blocks.md)
- Related learning: [Keep insert streaming session state out of AIChatPlugin options](/Users/felixfeng/Desktop/repos/plate/.claude/docs/solutions/best-practices/2026-03-31-insert-streaming-session-state-should-not-live-in-aichatplugin-options.md)
- Related learning: [Demo MDX presets must use editor-supported custom tags](/Users/felixfeng/Desktop/repos/plate/.claude/docs/solutions/logic-errors/2026-04-01-demo-mdx-presets-must-use-editor-supported-custom-tags.md)
