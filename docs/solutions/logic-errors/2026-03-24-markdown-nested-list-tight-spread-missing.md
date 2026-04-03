---
module: Markdown
date: 2026-03-24
problem_type: logic_error
component: markdown_serializer
symptoms:
  - "`serializeMd(...)` inserted a blank line between nested indented list items"
  - "Direct `listToMdastTree` specs passed while markdown string output still failed for tight nested lists"
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - markdown
  - serializer
  - lists
  - mdast
  - remark-stringify
  - spread
  - testing
---

# Markdown nested indented lists need explicit `listItem.spread`

## Problem

`serializeMd` should emit tight nested lists for indented list nodes:

```text
* parent
  * child
```

Instead, the serializer emitted:

```text
* parent

  * child
```

The failure only showed up at the final markdown string layer. The helper that built the intermediate mdast tree still passed its existing assertions.

## Root cause

The indented-list path in `listToMdastTree` built `listItem` nodes without a `spread` property. The classic list serializer already emitted `listItem.spread: false`, so the two serializer paths did not produce the same mdast shape.

That difference matters because `remark-stringify` treats nested lists as loose when `listItem.spread` is missing, even if the parent `list.spread` is `false`. The result is the extra blank line between parent and child items.

## Solution

Normalize the mdast output so every generated `listItem` gets an explicit `spread` value:

```ts
const listItem: MdListItem = {
  checked: null,
  children: [
    {
      children: convertNodesSerialize(
        node.children,
        options
      ) as MdParagraph['children'],
      type: 'paragraph',
    },
  ],
  spread: options.spread ?? false,
  type: 'listItem',
};
```

Apply the same shape in both code paths:

- the standard indented-list builder
- the block-id wrapper path in `processListWithBlockIds(...)`

Next, update helper expectations so the direct mdast assertions catch this contract in the future. We also added a serializer regression for ordered nested indented lists so the fix is not bullet-only by accident.

## Verification

These checks passed after the change:

```bash
bun test packages/markdown/src/lib/serializer/standardList.spec.tsx
bun test packages/markdown/src/lib/serializer/listToMdastTree.spec.ts
bun test packages/markdown/src/lib/serializer/convertNodesSerialize.spec.ts
bun test packages/markdown/src/lib/serializer
bun test packages/markdown/src
pnpm install
pnpm turbo build --filter=./packages/markdown
pnpm turbo typecheck --filter=./packages/markdown
pnpm lint:fix
```

## Prevention

When two serializer paths are supposed to build the same mdast node type, assert the full shape in helper specs instead of checking only the final markdown string or a subset of fields.

For list serialization in particular, treat `listItem.spread` as part of the mdast contract, not optional metadata. If a nested list suddenly becomes loose in markdown output, compare the intermediate AST against a known-good path before changing stringify expectations.
