# AI Chat Text Stream Followups

## Goal

Finish the partially landed AI chat text-stream refactor by making the text-event path instance-safe, transport-aware, and consistent across docs and generated registry payloads.

## Source Of Truth

- User request in thread
- Review finding: text-stream events can bleed across editors that share a chat id
- `.claude/docs/plans/2026-03-31-plate-ai-next-architecture.md`
- `.claude/docs/solutions/best-practices/2026-03-31-insert-streaming-session-state-should-not-live-in-aichatplugin-options.md`
- `packages/ai/src/react/ai-chat/hooks/useChatChunk.ts`
- `packages/ai/src/react/ai-chat/streaming/chatTextStreamTransport.ts`
- `apps/www/src/registry/components/editor/use-chat.ts`
- `docs/(plugins)/(ai)/ai.mdx`
- `docs/(plugins)/(ai)/ai.cn.mdx`

## Phases

| Phase | Status | Notes |
| --- | --- | --- |
| Load skills and restate fix scope | complete | Loaded `task`, `learnings-researcher`, `planning-with-files`, `tdd`, `react` |
| Gather existing learnings and nearby plan context | complete | Reviewed prior sessionization doc and architecture plan before continuing the seam |
| Add failing tests for transport isolation / capability seam | complete | Added transport isolation test and raw-text-stream hook coverage |
| Implement transport/session fixes | complete | Transport now owns instance-scoped channels and the package exposes transport metadata instead of an app-only boolean |
| Sync docs and generated registry payloads | complete | Updated AI docs and regenerated registry payloads under `apps/www/public/r` |
| Verify touched packages/apps | complete | `bun test` passed, build passed, package-scoped typecheck passed, targeted Biome passed, repo-wide `pnpm lint:fix` still fails on pre-existing diagnostics outside this seam |

## Working Notes

- This is bug/follow-up work, not a new major-task analysis pass.
- Fix the seam, not just the current app caller.
- Public docs and generated `public/rd` payloads need to match the shipped API.
- Full verification:
  - `corepack pnpm install`
  - `corepack pnpm turbo build --filter=./packages/ai --filter=./apps/www`
  - `corepack pnpm turbo typecheck --filter=./packages/ai --filter=./apps/www`
  - `bun test ./packages/ai/src/react/ai-chat/streaming/chatTextStreamTransport.spec.ts ./packages/ai/src/react/ai-chat/hooks/useChatChunk.slow.tsx`
  - `corepack pnpm exec biome check /Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/streaming/chatTextStreamTransport.ts /Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/streaming/chatTextStreamTransport.spec.ts /Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/hooks/useChatChunk.ts /Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/hooks/useChatChunk.slow.tsx /Users/felixfeng/Desktop/udecode/plate/packages/ai/src/react/ai-chat/AIChatPlugin.ts /Users/felixfeng/Desktop/udecode/plate/apps/www/src/registry/components/editor/use-chat.ts`
- Repo-wide lint status:
  - `corepack pnpm lint:fix` still fails because of existing Biome diagnostics in `packages/mdast-util-from-markdown/**` and `packages/remark-parse/index.d.ts`, outside the text-stream transport follow-up.
