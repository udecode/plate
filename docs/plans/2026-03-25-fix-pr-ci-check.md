# Fix PR CI Check

## Goal

Get PR `#4882` CI green by fixing the actual failing job, not guessing.

## Phases

- [x] Inspect PR head and failing job
- [x] Pull failing logs and relevant prior learnings
- [x] Reproduce the failure locally
- [x] Implement the fix
- [x] Verify with the relevant gate

## Findings

- PR head matches local `HEAD`, so CI is not behind a missing push.
- Prior repo learnings already cover barrel drift, helper-driven module mocks, and build fallback races.
- The current CI failure is `pnpm test:slowest`, not lint, build, or typecheck.
- Three fast-lane React specs crossed the hard `75ms/test` line in CI and need the slow lane.
- Local prediction needed a warning band below CI thresholds; otherwise fast machines hide drift.
- `tooling/scripts/test-slow.mjs` had the same helper-driven `mock.module(...)` pollution risk that `test-fast.mjs` already solved.
- One moved callout slow spec also needed local spies instead of shared module replacement.

## Verification

- `pnpm prepare`
- `pnpm test:slow -- packages/ai/src/react/ai-chat/hooks/useChatChunk.slow.tsx packages/callout/src/react/hooks/useCalloutEmojiPicker.slow.tsx packages/selection/src/react/hooks/useSelectionArea.slow.tsx`
- `pnpm turbo build --filter=./packages/callout`
- `pnpm turbo typecheck --filter=./packages/callout`
- `pnpm lint:fix`
- `pnpm install`
- `bun check`
