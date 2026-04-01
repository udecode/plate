---
module: Markdown
date: 2026-04-01
problem_type: logic_error
component: markdown_deserializer
symptoms:
  - "Quoted markdown lists like `> - aaa` lost their list structure during deserialize"
  - "Blockquotes flattened nested markdown blocks into inline text with newline sentinels"
  - "Docs, demos, and plugin behavior still modeled blockquotes as direct-text nodes"
root_cause: flat_blockquote_contract
resolution_type: code_change
severity: medium
tags:
  - markdown
  - blockquote
  - deserializer
  - serializer
  - lists
  - basic-nodes
  - nested-blocks
---

# Markdown blockquotes must round-trip as container blocks

## Problem

Plate's markdown layer treated blockquotes like flat text blocks even though the editor model already allows blockquotes to wrap block children.

That mismatch broke real markdown content. Input like:

```md
Hello!
> some thing is reference
> - aaa
> - bbb
```

lost the nested list because the blockquote seam collapsed everything into text before the list structure could survive.

## What Didn't Work

- Treating this as a list-only parser bug
- Preserving list metadata without changing the blockquote node shape
- Updating markdown deserialize alone while leaving toggle/docs/example values on the old flat contract

## Solution

Make blockquote a real container contract across the whole surface:

- deserialize markdown blockquotes as block children
- group only legacy inline children into paragraphs for compatibility
- serialize blockquote children directly instead of forcing a single paragraph wrapper
- change `tf.blockquote.toggle()` to wrap and unwrap blocks
- remove stale text-block break rules from `BaseBlockquotePlugin`
- update docs and seeded example values to use nested paragraph children

The critical deserialize seam became:

```ts
const children = groupInlineChildrenIntoParagraphs(
  editor,
  convertNodesDeserialize(mdastNode.children, deco, options)
);

return [
  {
    children,
    type: editor.getType(KEYS.blockquote),
  },
];
```

The transform seam changed from block replacement to wrapper semantics:

```ts
toggle: () => {
  editor.tf.toggleBlock(type, { wrap: true });
};
```

## Why This Works

The bug was never just "lists inside blockquotes." The real problem was that markdown, plugin transforms, and docs disagreed about what a blockquote is.

Once blockquote is treated as a container everywhere, nested paragraphs and lists survive deserialize, serialize, seeded values, and user transforms on the same shape.

## Verification

These checks passed:

```bash
bun test packages/markdown/src/lib/deserializer/deserializeMd.spec.ts packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx packages/markdown/src/lib/serializer/convertNodesSerialize.spec.ts packages/basic-nodes/src/lib/BaseBlockquotePlugin.spec.ts apps/www/src/__tests__/package-integration/markdown-deserializer/deserializeMd.slow.tsx apps/www/src/__tests__/package-integration/markdown-deserializer/deserializeMdParagraphs.spec.tsx
pnpm turbo build --filter=./packages/markdown --filter=./packages/basic-nodes
pnpm turbo typecheck --filter=./packages/markdown --filter=./packages/basic-nodes
pnpm lint:fix
```

## Prevention

- If a markdown element can contain blocks, do not flatten it into text at any intermediate seam
- Keep deserialize, serialize, transform, docs, and seeded values on the same node contract
- Add at least one full-path regression that proves nested markdown content survives deserialize and one that proves legacy flat content still serializes sanely

## Related Issues

- `#4898`
- `#4831`
- Related learning: [2026-03-30-markdown-ordered-list-restarts-must-emit-listrestartpolite.md](./2026-03-30-markdown-ordered-list-restarts-must-emit-listrestartpolite.md)
