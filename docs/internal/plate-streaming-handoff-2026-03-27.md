# Plate Streaming Handoff

Last updated: 2026-03-27

Primary repos:
- Plate: `/Users/felixfeng/Desktop/udecode/plate`
- Streamdown proving ground: `/Users/felixfeng/Desktop/udecode/Streamdown`

## Main Goal

The goal is **not** “perfect markdown text round-trip”.

The real goal is:

1. Make Plate AI streaming more stable.
2. Make Plate AI streaming faster on long documents.
3. Remove a large portion of the hacks in:
   - `packages/ai/src/react/ai-chat/streaming/streamDeserializeMd.ts`
   - `packages/ai/src/react/ai-chat/streaming/streamSerializeMd.ts`
4. Keep the final solution as close to upstream Plate as possible.

The practical target is:

`AI raw chunks -> joiner -> streamInsertChunk -> correct Plate editor state`

We are intentionally **not** optimizing for this stronger goal right now:

`AI raw chunks -> Plate nodes -> serializeMd -> exact original markdown text`

Why:
- it is much harder
- many failures are serializer canonicalization, not real streaming bugs
- it forces too much “pending markdown surface syntax” into the Plate node model
- it is not the shortest path to improving actual Plate streaming UX

## Current Strategy

### 1. Keep the primary success metric on Plate editor state

Success means:
- the demo does not crash
- chunks are not lost
- structure is reasonable
- performance is acceptable
- Plate final nodes are stable

Not required right now:
- exact source-preserving markdown round-trip
- preserving every raw markdown surface detail through `Slate -> mdast -> markdown`

### 2. Use the smallest local fork surface possible

In Plate, only the parse-side local packages were introduced:
- `packages/remark-parse`
- `packages/mdast-util-from-markdown`

We did **not** localize everything.

Intent:
- keep npm versions for packages we did not actually modify
- only localize packages that are required to support streaming-specific parser behavior

### 3. Do not push adapter-only behavior into forks unless clearly worth it

Some logic is still adapter-ish and that is acceptable for now.

Examples:
- underline-like HTML handling
- list restart / list continuation tweaks

If moving these lower clearly increases parser complexity or fork fragility, keep them above the fork layer.

## What Streamdown Was Used For

Streamdown became the proving ground where we could:
- vendor the relevant remark/micromark/mdast repos
- experiment with pending-tail parser behavior
- build a richer streaming demo
- test random AI chunk streams quickly

Important result:
- we proved out parse-side “pending tail” handling for things like trailing spaces, blank lines, and unfinished delimiters
- but not all of that metadata survives all the way through Plate’s `mdast -> Slate -> mdast` path

## What Was Applied Back To Plate

### 1. `streamInsertChunk` direction changed

We moved away from heavy reliance on:
- deserialize
- serialize back
- compare
- retry/fallback logic

The newer direction is closer to:
- maintain streaming source
- use parser-derived boundaries
- replay the unstable tail
- patch only the changed suffix

Important file:
- `/Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/streaming/streamInsertChunk.ts`

### 2. `streamDeserializeMd` hacks were reduced

We removed a large chunk of manual tail fixes from:
- `/Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/streaming/streamDeserializeMd.ts`

Instead, we now rely more on parse-side metadata plus a small plugin:
- `/Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/streaming/remarkStreamdownPendingTail.ts`

Important nuance:
- `streamSerializeMd.ts` still exists
- but it is no longer central to the hot path in the same way

### 3. Plate markdown now uses the local parse fork

Relevant files:
- `/Users/felixfeng/Desktop/udecode/plate/packages/markdown/package.json`
- `/Users/felixfeng/Desktop/udecode/plate/packages/markdown/src/lib/deserializer/deserializeMd.ts`

Current state:
- parse side is localized
- stringify side is still mostly npm

That is intentional.

### 4. Plate demos were upgraded

Dev page:
- `/Users/felixfeng/Desktop/udecode/plate/apps/www/src/app/dev/markdownStreamDemo.tsx`

Registry block example:
- `/Users/felixfeng/Desktop/udecode/plate/apps/www/src/registry/examples/markdown-streaming-demo.tsx`

Capabilities added:
- AI prompt input
- model selector
- generate/stop AI
- copy/paste chunks
- editor crash isolation
- richer debugging panes

Important UX decision for the registry block example:
- show **raw chunks before the joiner**
- not just joined chunks

Reason:
- we need to see the actual incoming AI chunk boundaries
- otherwise we lose visibility into what the joiner is masking

## Demo Intent

### `/dev`

This is the richer local debugging page.

Use it for:
- arbitrary AI prompts
- pasting captured chunk arrays
- inspecting raw markdown and editor tree

### `/blocks/markdown-streaming-demo`

This is the important Plate example page.

Intent:
- keep the improved debugging workflow
- preserve more of the original Plate chunk-viewing mindset
- especially showing raw chunks before joiner

## Testing Position

### What we trust

Most important validations:
- `streamDeserializeMd` integration tests
- `streamSerializeMd` integration tests
- `streamInsertChunk` integration tests
- `@platejs/ai` package test/build/typecheck
- `www` build/typecheck

Recent commands that passed:
- `bun test /Users/felixfeng/Desktop/udecode/plate/apps/www/src/__tests__/package-integration/ai-chat-streaming/streamDeserializeMd.slow.tsx`
- `bun test /Users/felixfeng/Desktop/udecode/plate/apps/www/src/__tests__/package-integration/ai-chat-streaming/streamSerializeMd.slow.tsx`
- `bun test /Users/felixfeng/Desktop/udecode/plate/apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx`
- `corepack pnpm --filter @platejs/ai test`
- `corepack pnpm --filter @platejs/ai build`
- `corepack pnpm --filter @platejs/ai typecheck`
- `corepack pnpm --filter www typecheck`
- `corepack pnpm --filter www build`

### What we are explicitly not treating as primary right now

Strict assertions like:

`raw chunks -> Plate nodes -> serializeMd -> exact original markdown`

That path surfaced real differences, but many were not actually the bugs we care about.

Examples:
- `*` becoming `_`
- table spacing canonicalization
- list spacing normalization
- final newline insertion

These are textual differences, but not necessarily streaming correctness failures.

## Performance Insight

We proved a key point:

- a naive “always reparse full prefix” adapter is too expensive on large docs
- a more limited “replay unstable tail / patch suffix” direction is much better

Most important rule going forward:

**Do not use full `setValue` on every step for large streaming documents.**

## Open Questions

### 1. How much more should move into forks?

Current answer:
- parser-specific pending-tail logic: yes, forks are appropriate
- editor-model-specific cleanup logic: probably not, unless it clearly belongs lower

### 2. Should strict markdown round-trip come back later?

Maybe, but only if one of these becomes a real requirement:
- exporting streaming intermediate state back to markdown
- using Plate nodes as a markdown-preserving IR
- stronger replay/persistence guarantees

For now: not the main line.

### 3. How much of the demo work should stay in registry examples?

Current answer:
- AI prompt + model + copy/paste + raw chunks are useful enough to keep
- but the example should still feel like a Plate example, not a separate app

## Files Worth Reading First

### Core Plate changes
- `/Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/streaming/streamInsertChunk.ts`
- `/Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/streaming/streamDeserializeMd.ts`
- `/Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/streaming/remarkStreamdownPendingTail.ts`
- `/Users/felixfeng/Desktop/udecode/plate/packages/markdown/src/lib/deserializer/deserializeMd.ts`
- `/Users/felixfeng/Desktop/udecode/plate/packages/markdown/src/lib/deserializer/deserializeMd.spec.ts`

### Plate demos
- `/Users/felixfeng/Desktop/udecode/plate/apps/www/src/app/dev/markdownStreamDemo.tsx`
- `/Users/felixfeng/Desktop/udecode/plate/apps/www/src/registry/examples/markdown-streaming-demo.tsx`
- `/Users/felixfeng/Desktop/udecode/plate/apps/www/src/app/api/dev/markdown-stream/route.ts`

### Plate tests
- `/Users/felixfeng/Desktop/udecode/plate/apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx`
- `/Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/utils/aiChatActions.spec.ts`

### Streamdown proving-ground context
- `/Users/felixfeng/Desktop/udecode/Streamdown/apps/www/src/lib/simple-stream-insert-chunk.ts`
- `/Users/felixfeng/Desktop/udecode/Streamdown/apps/www/src/lib/markdown-joiner-transform.ts`
- `/Users/felixfeng/Desktop/udecode/Streamdown/apps/www/src/lib/raw-ai-chunk-contracts.test.ts`
- `/Users/felixfeng/Desktop/udecode/Streamdown/apps/www/src/cases/raw-ai-chunk-contracts.ts`

## Recommended Next Step

If reopening this work on a fresh branch:

1. Re-open the Plate branch work.
2. Verify current behavior at:
   - `http://localhost:3002/dev`
   - `http://localhost:3002/blocks/markdown-streaming-demo`
3. Focus on real streaming correctness and performance regressions.
4. Avoid reopening the “strict markdown text round-trip” rabbit hole unless requirements change.

## One-Sentence Summary

We are building a **smaller, more stable, less hacky Plate AI streaming path**, backed by a **minimal local parse-side remark fork**, while keeping evaluation centered on **correct Plate editor state and streaming UX**, not exact markdown text preservation.
