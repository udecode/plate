---
module: Suggestion
date: 2026-04-05
problem_type: logic_error
component: tooling
symptoms:
  - "Rejecting a remove suggestion on a link kept the red delete styling on the inline element"
  - "Rejecting an inline-element suggestion cleared text-node metadata but left the element-level suggestion flag behind"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - suggestion
  - rejectSuggestion
  - inline
  - link
  - regression
---

# `rejectSuggestion` must clear inline element metadata

## Problem

Rejecting a suggestion on a link could leave the link styled as a deletion even after the suggestion was rejected.

The visible symptom was a red link that no longer had an active suggestion card.

## Root cause

`rejectSuggestion` only cleared inline suggestion metadata from text nodes and block suggestion elements.

That missed inline elements like links, even though inline suggestion metadata can live directly on the element node. `acceptSuggestion` already handled that shape, so the reject path was inconsistent with the accept path.

## Fix

Treat inline elements the same way as text nodes in the reject cleanup paths:

- when unsetting rejected `remove` suggestion metadata
- when removing rejected `insert` suggestion nodes

The key branch is:

```ts
if (
  TextApi.isText(n) ||
  (ElementApi.isElement(n) && editor.api.isInline(n))
) {
  const suggestionData = getInlineSuggestionData(n as TSuggestionText);
  // clear or remove matching inline suggestion metadata
}
```

Add regression coverage with a real inline link element, not only leaf text nodes.

## Verification

These checks passed:

```bash
bun test packages/suggestion/src/lib/transforms/rejectSuggestion.spec.tsx
pnpm install
pnpm turbo build --filter=./packages/link --filter=./packages/suggestion
pnpm turbo typecheck --filter=./packages/link --filter=./packages/suggestion
pnpm lint:fix
```

## Prevention

When suggestion metadata can live on both leaf text nodes and inline elements, keep `acceptSuggestion` and `rejectSuggestion` structurally symmetric.

If a regression only shows up on rendered inline UI like links or mentions, add one test with a real inline element. Text-only coverage is not enough.
