# AI Preview Localized Rollback

## Goal

Replace full-document AI preview snapshotting with localized insert-mode rollback so preview accept/cancel only touch the preview block range, while preserving current undo/redo and selection behavior.

## Checklist

- [completed] Read current localized stream path, accept path, and preview tests
- [completed] Add failing tests for localized preview ownership and rollback
- [completed] Implement localized preview state and marker-based range handling
- [completed] Run targeted verification for touched packages and tests
- [blocked] Run `check`, then create or update the PR

## Verification

- `bun test packages/ai/src/lib/transforms/aiStreamSnapshot.spec.ts packages/ai/src/lib/transforms/undoAI.spec.ts apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx`
- `pnpm install`
- `pnpm turbo build --filter=./packages/ai --filter=./apps/www`
- `pnpm turbo typecheck --filter=./packages/ai`
- `pnpm build`
- `pnpm turbo typecheck --filter=./packages/ai --filter=./apps/www` after root build
- `pnpm lint:fix`
- `agent-browser open http://localhost:3100/blocks/editor-ai`

## Blocker

- `pnpm check` still fails outside this diff in existing fast AI chat tests:
  - `packages/ai/src/react/ai-chat/hooks/useAIChatEditor.spec.tsx`
  - `packages/ai/src/react/ai-chat/hooks/useEditorChat.spec.tsx`
  - `packages/ai/src/react/ai-chat/utils/getLastAssistantMessage.spec.ts`
- The failure is a `SyntaxError` from missing exports in `packages/plate/src/react/index.tsx`, so PR creation is blocked by repo rules.

## Agreed Design

- Keep the public surface on `tf.ai.*`
- Optimize insert-mode preview only
- Keep preview state private and editor-scoped
- `beginPreview` accepts `{ originalBlocks }`
- `selectionBefore` is still captured inside `beginPreview`
- Preview-owned content is tracked by transient top-level block markers
- `cancelPreview` restores the exact original block slice plus selection
- `acceptPreview` localizes cleanup/commit and never rebuilds the whole document
- Untouched blocks should keep identity because preview accept/cancel stop using full-doc `setValue`

## Open Implementation Notes

- Mark preview-owned top-level blocks with `aiPreview: true`
- Do not mark the `aiChat` anchor block as preview-owned
- If preview starts by removing an empty paragraph, capture that exact block in `originalBlocks`
- If preview inserts after existing content, capture `[]`
- Derive the current preview range from contiguous marked top-level blocks
- If preview range is invalid/non-contiguous, fall back safely instead of silently guessing
