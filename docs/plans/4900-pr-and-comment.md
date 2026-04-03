# PR And Comment 4900

## Goal

Open or update the PR for the current checkout, then update the existing GitHub issue comment for issue `#4900` with the PR URL.

## Checklist

- [completed] Load the PR workflow and record the task plan
- [completed] Run `check`
- [completed] Inspect branch and PR state
- [completed] Commit and push the full current checkout
- [completed] Open or update the PR
- [completed] Update the existing `#4900` issue comment with the PR link

## Findings

- Repo rules require `check` before any PR create or update.
- Repo rules also require using the entire current checkout as-is, including unrelated changes.
- The first `check` run failed in `packages/ai/src/react/ai-chat/utils/aiChatActions.spec.ts` because `resetAIChat.ts` imported `clearAIStreamSnapshot` through the AI lib barrel, which pulled in markdown serializer exports the test mock did not provide.
- Narrowing that import to `../../../lib/transforms/aiStreamSnapshot` fixed the failing spec without changing behavior.
- `pnpm check` passed after the import fix.
- Opened PR: `https://github.com/udecode/plate/pull/4902`
- Updated issue comment: `https://github.com/udecode/plate/issues/4900#issuecomment-4136090707`
