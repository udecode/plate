---
module: Input Rules
date: 2026-04-18
problem_type: best_practice
component: tooling
symptoms:
  - "Custom `blockStart` rules had to thread `range: TRange` through `resolveMatch` just to delete matched marker text"
  - "Modern list and blockquote rules repeated boilerplate that core already knew"
  - "Forgetting that boilerplate leaked shorthand marker text into the final node"
root_cause: inadequate_documentation
resolution_type: code_change
severity: medium
tags:
  - input-rules
  - api-design
  - blockStart
  - createRuleFactory
  - matcher
---

# blockStart resolveMatch should return extras while core provides base match

## Problem

The old `blockStart` API made every custom rule manually preserve the base
match payload:

- `range`
- `text`

That was backwards. Core already computes that match.

## Solution

Hard-cut the API so `resolveMatch(...)` returns only rule-specific extras, and
core merges those extras onto the base block-start match before `apply(...)`
runs.

Before:

```ts
resolveMatch: ({ match, range }) => ({
  range,
  start: Number((match as RegExpMatchArray)[1]),
})
```

After:

```ts
resolveMatch: ({ match }) => ({
  start: Number((match as RegExpMatchArray)[1]),
})
```

And `apply(...)` still receives:

```ts
{
  range,
  text,
  start,
}
```

## Why This Works

Matcher primitives belong in core. Feature rules should only describe their
feature-owned data.

That split keeps the API honest:

- core owns editor-state matching
- feature packages own semantic extras like `start`

## Prevention

- If multiple rule families keep passing the same matcher data through
  `resolveMatch`, the API is wrong.
- `resolveMatch` should not have to re-state base payload just to keep it alive.
- Prefer:
  - core returns base match
  - feature returns extras
  - core merges them once

## Verification

```bash
bun test packages/core/src/lib/plugins/input-rules/createRuleFactory.spec.ts
bun test packages/list/src/lib/inputRules.spec.tsx
bun test packages/basic-nodes/src/lib/BaseBlockquoteInputRules.spec.tsx
bun test packages/link/src/lib/internal/inputRules.spec.tsx
pnpm build
pnpm lint:fix
```
