---
module: Layout
date: 2026-03-23
problem_type: logic_error
component: editor_normalization
symptoms:
  - "Normalizing an invalid `column_group` with plain block children could throw instead of recovering"
  - "Normalizing a `column_group` with no valid columns could drop user content"
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - layout
  - columns
  - normalization
  - testing
  - slate
---

# Layout invalid column groups should unwrap content instead of dropping it

## Problem

`withColumn` is supposed to clean up broken `column_group` trees. That recovery path had two bad behaviors.

First, the code path for a group that only wrapped a paragraph tried to unwrap the paragraph child itself. That leaves invalid content under the group and can explode during the next normalization step.

Second, the fallback branch for groups with no valid columns called `removeNodes`, which silently dropped the group's content even though the comment said the group should be unwrapped.

## Root cause

The implementation mixed up two different recovery actions:

- dropping the wrapper
- dropping the content

It also unwrapped the wrong node for the paragraph-only case.

The broken shape looked like this:

```ts
if (node.children.length === 1 && firstChild.type === editor.getType(KEYS.p)) {
  editor.tf.unwrapNodes({ at: PathApi.child(path, 0) });
}

if (!node.children.some((child) => ElementApi.isElement(child) && child.type === type)) {
  editor.tf.removeNodes({ at: path });
}
```

That sequence can both corrupt the tree and discard the user's block content.

## Fix

Unwrap the `column_group` itself in both recovery paths and return immediately:

```ts
if (node.children.length === 1 && firstChild.type === editor.getType(KEYS.p)) {
  editor.tf.unwrapNodes({ at: path });
  return;
}

if (!node.children.some((child) => ElementApi.isElement(child) && child.type === type)) {
  editor.tf.unwrapNodes({ at: path });
  return;
}
```

Now invalid column wrappers recover to plain blocks instead of crashing or eating content.

## Verification

These checks passed:

```bash
bun test packages/layout/src
pnpm test:slowest -- --top 20 apps/www/src/__tests__/package-integration/ai-utils apps/www/src/__tests__/package-integration/markdown-rich apps/www/src/__tests__/package-integration/markdown-deserializer packages/layout/src
pnpm turbo build --filter=./packages/layout
pnpm turbo typecheck --filter=./packages/layout
```

## Prevention

When a normalizer says it will "unwrap" invalid content, add one direct test that proves the content survives.

For wrapper-like nodes such as `column_group`, cover these recovery shapes explicitly:

- wrapper with one valid child
- wrapper with one plain block child
- wrapper with no valid children

That catches the easy bug where cleanup logic removes the container and the content with it.
