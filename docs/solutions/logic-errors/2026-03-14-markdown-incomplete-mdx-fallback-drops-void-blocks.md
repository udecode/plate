---
module: Markdown
date: 2026-03-14
problem_type: logic_error
component: markdown_deserializer
symptoms:
  - "Incomplete MDX fallback dropped already-parsed content when the complete prefix ended in a void node"
  - "`markdownToSlateNodesSafely('<hr /><u>')` returned only the fallback paragraph and lost the horizontal rule"
root_cause: fallback_replacement_error
resolution_type: code_change
severity: medium
tags:
  - markdown
  - mdx
  - deserializer
  - void-nodes
  - fallback
  - testing
---

# Markdown incomplete-MDX fallback should append after void blocks

## Problem

`markdownToSlateNodesSafely` is the recovery path when full markdown deserialization fails and the input ends with incomplete MDX.

That fallback already handled two sane cases:

- no complete blocks yet: return a new paragraph with the inline fallback text
- last complete block is non-void: append the fallback inline nodes to that block

But the void-block case was wrong. If the complete prefix ended in a void element like a horizontal rule, the function returned only the fallback paragraph and threw away the already-parsed nodes.

## Root cause

The void-node branch returned:

```ts
return [newBlock];
```

That replaced the full `completeNodes` array instead of preserving it.

## Fix

Append the fallback paragraph after the complete nodes:

```ts
if (ElementApi.isElement(lastBlock) && editor.api.isVoid(lastBlock)) {
  return [...completeNodes, newBlock];
}
```

Now the safe fallback keeps the parsed prefix and still exposes the incomplete MDX tail as literal text.

## Verification

These checks passed:

```bash
bun test packages/markdown/src/lib/deserializer/utils/markdownToSlateNodesSafely.spec.tsx
bun test packages/markdown/src
bun run test:slowest -- --top 15 packages/markdown/src
```

The package build lane was blocked by an external tooling issue unrelated to this fix:

```text
TypeError [ERR_INVALID_ARG_VALUE]: ... node:util.styleText ... Received [ 'underline', 'gray' ]
```

## Prevention

When a fallback path combines “complete parsed output” with “literal recovery output,” add one test for each final-block shape:

- empty result
- non-void last block
- void last block

That catches the easy mistake where the recovery branch accidentally replaces the result instead of extending it.
