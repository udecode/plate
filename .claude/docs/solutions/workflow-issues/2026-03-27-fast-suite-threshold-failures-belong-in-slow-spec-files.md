---
module: Testing
date: 2026-03-27
problem_type: workflow_issue
component: ci
symptoms:
  - "`pnpm check` failed in GitHub Actions even though the affected specs passed locally"
  - "The `test:slowest` step reported `Fast-suite threshold exceeded` for AI chat specs"
  - "CI suggested moving the offending files to `*.slow.ts[x]`"
root_cause: incorrect_file_lane
resolution_type: code_change
severity: medium
tags:
  - ci
  - tests
  - slow-tests
  - bun
  - ai-chat
---

# Fast-suite threshold failures belong in `*.slow` spec files

## Problem

GitHub Actions failed `pnpm check` on PR `#4902`, but the failing specs were not logically broken. The CI log showed the real issue:

- `packages/ai/src/react/ai-chat/hooks/useAIChatEditor.spec.tsx`
- `packages/ai/src/react/ai-chat/hooks/useEditorChat.spec.tsx`
- `packages/ai/src/react/ai-chat/utils/getLastAssistantMessage.spec.ts`
- `packages/ai/src/react/ai-chat/utils/submitAIChat.spec.ts`

Each one tripped the fast-suite runtime threshold on GitHub runners.

## Root cause

This repo treats `*.spec.ts[x]` as the fast lane and `*.slow.ts[x]` as the slow lane. Those four AI chat specs had become slow enough that CI started rejecting them, even though they still passed.

The misleading part is that the failure lands inside `pnpm check`, so it smells like a generic CI or typecheck problem until you read the `test:slowest` output.

## Fix

Move the offenders into the slow lane without changing their assertions:

```text
useAIChatEditor.spec.tsx -> useAIChatEditor.slow.tsx
useEditorChat.spec.tsx -> useEditorChat.slow.tsx
getLastAssistantMessage.spec.ts -> getLastAssistantMessage.slow.ts
submitAIChat.spec.ts -> submitAIChat.slow.ts
```

That keeps the fast lane honest and lets `pnpm check` pass on GitHub runners.

## Verification

These checks passed after the rename:

```bash
bun test ./packages/ai/src/react/ai-chat/hooks/useAIChatEditor.slow.tsx
bun test ./packages/ai/src/react/ai-chat/hooks/useEditorChat.slow.tsx
bun test ./packages/ai/src/react/ai-chat/utils/getLastAssistantMessage.slow.ts
bun test ./packages/ai/src/react/ai-chat/utils/submitAIChat.slow.ts
pnpm install
pnpm turbo build --filter=./packages/ai
pnpm turbo typecheck --filter=./packages/ai
pnpm lint:fix
pnpm check
```

## Prevention

When CI says `Fast-suite threshold exceeded`, do not waste time treating it like a logic regression.

Read the `test:slowest` output first. If the spec is just too heavy for the fast lane, rename it to `*.slow.ts[x]` and keep moving. The bug is usually the file lane, not the assertions.
