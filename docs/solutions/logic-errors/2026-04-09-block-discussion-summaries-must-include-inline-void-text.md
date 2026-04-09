---
module: Discussion
date: 2026-04-09
problem_type: logic_error
component: tooling
symptoms:
  - "Suggestion cards showed surrounding delete text but dropped inline mentions, dates, or inline equations"
  - "Delete summaries rendered strings like `dates like  or use inline equations: ` with the inline void content missing"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - discussion
  - suggestion
  - inline-void
  - mention
  - date
  - inline-equation
  - regression
---

# Block discussion summaries must include inline void text

## Problem

`BlockSuggestionCard` rendered its `Delete:` summary from `ResolvedSuggestion.text`, but the summary builder only concatenated text leaves and block suggestion tokens.

That meant inline void suggestion elements such as mentions, dates, and inline equations vanished from the summary even though they were visibly part of the deleted content.

## Symptoms

- Delete summaries preserved surrounding text but omitted inline void display values
- Mention values disappeared from summaries like `Hello Ada!`, leaving `Hello !`
- Date and inline equation summaries lost both the date label and the TeX expression

## What Didn't Work

- Treating inline suggestion elements like block suggestions only
- Assuming text-leaf aggregation was enough for all suggestion summaries

## Solution

Teach `block-discussion-index.ts` how to extract display text from inline suggestion elements before the block-suggestion branch:

```ts
const getInlineSuggestionElementText = (node: TElement) => {
  if (typeof node.value === 'string' && node.value.length > 0) {
    return node.value;
  }

  if (typeof node.date === 'string' && node.date.length > 0) {
    return formatSuggestionDateText(node.date);
  }

  if (
    typeof (node as TElement & { texExpression?: unknown }).texExpression ===
      'string' &&
    (node as TElement & { texExpression: string }).texExpression.length > 0
  ) {
    return (node as TElement & { texExpression: string }).texExpression;
  }
};
```

Then, when a suggestion entry is an element and matches the current suggestion id, append that inline text into `text` or `newText` based on suggestion type.

Do not add a separate summary protocol for this. The discussion layer should reuse the inline void node's existing display-facing properties instead of introducing another configuration surface just for summaries.

## Why This Works

Inline void elements do not contribute text leaves the same way normal inline text does, so leaf-only aggregation undercounts what the user actually deleted.

By mapping the element itself to its visible label, the resolved suggestion summary matches what the editor shows on screen.

## Verification

These checks passed:

```bash
bun test apps/www/src/registry/ui/block-discussion-index.spec.tsx
bun test packages/suggestion/src/lib/withSuggestion.spec.tsx
pnpm install
pnpm turbo build --filter=./apps/www
pnpm turbo typecheck --filter=./apps/www
pnpm lint:fix
```

Browser check:

- `dev-browser --connect http://127.0.0.1:9222`
- confirmed `http://localhost:3001/docs/discussion` opens and reports title `Discussion - Plate`

## Prevention

- If a suggestion summary is built from editor entries, do not assume all user-visible content lives in text leaves
- Add regression coverage for any inline void element that has a display label but empty text children
- Prefer one helper that converts inline suggestion elements into summary text so mentions, dates, and equations stay consistent
- Do not introduce a separate summary protocol when the node already has display text in existing fields like `value`, `date`, or `texExpression`

## Related Issues

- `docs/solutions/logic-errors/2026-04-08-suggestion-delete-backward-must-mark-inline-voids.md`
