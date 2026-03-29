# Plate Streaming Handoff Plan

## Goal

Use `/Users/felixfeng/Desktop/udecode/plate/docs/internal/plate-streaming-handoff-2026-03-27.md` as the active handoff for the next Plate AI streaming work.

Optimize for:

- stable streaming editor state
- faster long-document streaming
- less hacky streaming code in `@platejs/ai`
- smallest possible divergence from upstream Plate

Do not optimize for:

- exact markdown text round-trip during intermediate streaming
- preserving every raw markdown surface detail through the full Slate/mdast/markdown cycle

## Active Constraints

- Treat `AI raw chunks -> joiner -> streamInsertChunk -> correct Plate editor state` as the main contract.
- Keep parse-side fork surface small.
- Prefer local parse-side behavior in:
  - `packages/remark-parse`
  - `packages/mdast-util-from-markdown`
- Avoid moving editor-adapter cleanup into forks unless the parser boundary clearly owns it.
- Do not use full `setValue` on every streaming step for large docs.
- Keep the final approach close to upstream Plate behavior and structure.

## Files To Read First

### Core streaming path

- `/Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/streaming/streamInsertChunk.ts`
- `/Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/streaming/streamDeserializeMd.ts`
- `/Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/streaming/remarkStreamdownPendingTail.ts`
- `/Users/felixfeng/Desktop/udecode/plate/packages/markdown/src/lib/deserializer/deserializeMd.ts`
- `/Users/felixfeng/Desktop/udecode/plate/packages/markdown/src/lib/deserializer/deserializeMd.spec.ts`

### Demo and integration surface

- `/Users/felixfeng/Desktop/udecode/plate/apps/www/src/app/dev/markdownStreamDemo.tsx`
- `/Users/felixfeng/Desktop/udecode/plate/apps/www/src/registry/examples/markdown-streaming-demo.tsx`
- `/Users/felixfeng/Desktop/udecode/plate/apps/www/src/app/api/dev/markdown-stream/route.ts`

### High-value tests

- `/Users/felixfeng/Desktop/udecode/plate/apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx`
- `/Users/felixfeng/Desktop/udecode/plate/apps/www/src/__tests__/package-integration/ai-chat-streaming/streamDeserializeMd.slow.tsx`
- `/Users/felixfeng/Desktop/udecode/plate/apps/www/src/__tests__/package-integration/ai-chat-streaming/streamSerializeMd.slow.tsx`
- `/Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/utils/aiChatActions.spec.ts`

## Immediate Read Order

1. Read `streamInsertChunk.ts` to confirm the current suffix-patch / unstable-tail flow.
2. Read `streamDeserializeMd.ts` and `remarkStreamdownPendingTail.ts` together to separate parse-owned behavior from adapter cleanup.
3. Read `deserializeMd.ts` to confirm how the local parse fork is wired into Plate markdown.
4. Read the three slow streaming integration tests to identify the current behavior contract.
5. Read the demo files last, mainly to understand debugging affordances and reproduce issues quickly.

## Current Working Theory

- The biggest wins are still in the parse-plus-suffix-patch lane, not in serializer round-trip perfection.
- The main danger is reintroducing full-document reparsing or editor-wide replacement while fixing edge cases.
- Adapter-level hacks should keep shrinking, but only when parse-side metadata can absorb them cleanly.
- Demo visibility matters: raw chunks before the joiner should stay visible because they explain bugs that the joiner can hide.

## Relevant Prior Learnings

### Markdown parser edges

- `splitIncompleteMdx` style scanners need an explicit delimiter-found signal at EOF.
  - Source: `/Users/felixfeng/Desktop/udecode/plate/.claude/docs/solutions/logic-errors/2026-03-25-markdown-split-incomplete-mdx-must-not-treat-a-final-closing-angle-as-incomplete.md`
- Trim/fallback helpers need explicit whitespace-only coverage.
  - Source: `/Users/felixfeng/Desktop/udecode/plate/.claude/docs/solutions/logic-errors/2026-03-24-markdown-inline-fallback-must-not-duplicate-whitespace-only-input.md`

### Markdown structure contracts

- Intermediate mdast shape matters; `remark-stringify` can change output semantics when contract fields are omitted.
  - Source: `/Users/felixfeng/Desktop/udecode/plate/.claude/docs/solutions/logic-errors/2026-03-24-markdown-nested-list-tight-spread-missing.md`

## First Execution Slice

- Confirm the actual invariants inside `streamInsertChunk`.
- Identify which tail-state data is parse-owned versus editor-repair-owned.
- List the remaining hacks in `streamDeserializeMd.ts`.
- Map each hack to one of:
  - keep in adapter
  - move to parse-side fork
  - delete because the current suffix-patch flow already supersedes it
- Re-run the existing streaming integration tests before changing behavior.

## Verification Standard

For any real code change in this area, use this baseline:

- `bun test /Users/felixfeng/Desktop/udecode/plate/apps/www/src/__tests__/package-integration/ai-chat-streaming/streamDeserializeMd.slow.tsx`
- `bun test /Users/felixfeng/Desktop/udecode/plate/apps/www/src/__tests__/package-integration/ai-chat-streaming/streamSerializeMd.slow.tsx`
- `bun test /Users/felixfeng/Desktop/udecode/plate/apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx`
- `pnpm install`
- `pnpm turbo build --filter=./packages/ai --filter=./packages/markdown --filter=./apps/www`
- `pnpm turbo typecheck --filter=./packages/ai --filter=./packages/markdown --filter=./apps/www`
- `pnpm lint:fix`

If the UI/demo surface changes, also verify in browser via the Plate demo pages before calling the work complete.

## Open Questions To Resolve During Execution

- Which current `streamDeserializeMd` behaviors still compensate for real parser gaps?
- Which pending-tail behaviors should move lower into parse-side forks without making the fork too fragile?
- Can more suffix replay logic live in `streamInsertChunk` while keeping demo/editor behavior predictable?
- Which debug affordances belong in the registry example versus only in `/dev`?

## Status

- [completed] Read the March 27 handoff doc
- [completed] Pull forward the most relevant markdown/parser learnings
- [completed] Create an execution-ready plan file under `.claude/docs/plans/`
- [pending] Read the core streaming files in code
- [pending] Reconfirm the current behavior contract from tests
- [pending] Choose the next smallest code slice
