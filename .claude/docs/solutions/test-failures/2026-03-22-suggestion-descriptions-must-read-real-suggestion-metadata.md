---
title: Suggestion descriptions must read real suggestion metadata
category: test-failures
date: 2026-03-22
tags:
  - suggestion
  - coverage
  - regression
  - helper
---

# Suggestion descriptions must read real suggestion metadata

## Problem

`getActiveSuggestionDescriptions` looked covered, but the existing spec mocked the helper chain and hid a real runtime failure.

On a real editor, active suggestion descriptions could return the wrong `userId`, miss deletion text entirely, and fail to find sibling suggestion nodes for the same suggestion id.

## Root Cause

Three helpers were built around fake assumptions instead of the stored suggestion shape:

- `getSuggestionNodeEntries` matched `n.suggestionId`, but real inline suggestions are stored under dynamic keys like `suggestion_<id>`
- `getSuggestionUserIds` treated the dynamic key suffix as a user id, even though the suffix is the suggestion id
- `getActiveSuggestionDescriptions` classified deletions from `node.suggestionDeletion`, but real suggestion type lives inside the stored metadata object

The old mocked spec passed because it invented node shapes that matched those assumptions.

## Solution

Make the helper chain read the real metadata shape:

```ts
const suggestionKey = getSuggestionKey(suggestionId);

const nodes = Array.from(getSuggestionNodeEntries(editor, suggestionId)).map(
  ([node]) => node
);

const insertions = nodes.filter(
  (node: any) => node[suggestionKey]?.type === 'insert'
);
const deletions = nodes.filter(
  (node: any) => node[suggestionKey]?.type === 'remove'
);
```

And fix the helpers below it:

- `getSuggestionNodeEntries` matches by `getSuggestionKey(suggestionId)`
- `getSuggestionUserIds` reads `userId` from the stored suggestion data
- `findSuggestionProps` checks the previous block line-break suggestion even when there is no `nextPoint`

## Prevention

- Do not trust mocked helper-chain specs for suggestion metadata. Add at least one real-editor spec.
- When metadata is stored under dynamic keys, test the actual stored shape instead of inventing convenience fields.
- If a helper returns ids or users, prove it against runtime data once before using it to build higher-level descriptions.
