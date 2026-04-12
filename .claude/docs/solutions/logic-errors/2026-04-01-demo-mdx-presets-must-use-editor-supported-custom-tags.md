---
module: Markdown
date: 2026-04-01
problem_type: logic_error
component: markdown_deserializer
symptoms:
  - "New markdown streaming demo MDX presets rendered `<Callout>` and `<Steps>` as literal paragraph text in `Editor tree`"
  - "Lowercase `<callout type=\"warning\">` parsed into a node with `type: \"warning\"` instead of `type: \"callout\"`"
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - markdown
  - mdx
  - callout
  - streaming-demo
  - deserializer
  - testing
---

# Demo MDX presets must use editor-supported custom tags

## Problem

The markdown streaming demo added several new MDX presets to stress the streaming parser.

The browser did not crash, but the `Editor tree` showed that the new MDX presets were not being parsed into structured nodes. Uppercase docs-site tags such as `<Callout>` and `<Steps>` landed as plain paragraph text, and lowercase `<callout type="warning">` still had a hidden parser bug where the MDX attribute overwrote the Slate node type.

## Root cause

There were two separate mismatches:

- The editor markdown parser supports Plate custom MDX tags such as `<callout>`, `<column>`, and `<column_group>`, not the docs-site React components `<Callout>` and `<Steps>`.
- The `callout` deserializer parsed MDX attributes and spread them after setting the Slate node `type`, so a source like `<callout type="warning">` overwrote `type: "callout"` with `type: "warning"`.

## Fix

First, replace the broken demo presets with editor-supported MDX structures:

```md
<column_group layout="[50,50]">
<column width="50%">
### Install Plate
</column>
<column width="50%">
### Stream chunks
</column>
</column_group>

<callout type="note">
This preset mixes markdown headings with supported MDX block components.
</callout>
```

Next, keep the callout node type stable during deserialization and map the legacy MDX `type` attribute into `variant`:

```ts
const props = parseAttributes(mdastNode.attributes);
const variant = props.variant ?? props.type;
const { type: _legacyType, ...rest } = props;

return {
  children: convertChildrenDeserialize(mdastNode.children, deco, options),
  ...rest,
  type: getPluginType(options.editor!, KEYS.callout),
  ...(variant ? { variant } : {}),
};
```

That keeps `type: "callout"` intact while still preserving the semantic variant from markdown.

## Verification

These checks passed:

```bash
bun test apps/www/src/registry/lib/markdown-streaming-demo-data.spec.ts packages/markdown/src/lib/mdx.spec.tsx
corepack pnpm install
corepack pnpm turbo build --filter=./packages/markdown --filter=./apps/www
corepack pnpm turbo typecheck --filter=./packages/markdown --filter=./apps/www
corepack pnpm lint:fix
```

Browser verification on `http://localhost:3002/blocks/markdown-streaming-demo` also passed. The repaired presets now produce `callout`, `column_group`, and `code_block` nodes in `Editor tree`, with no literal `<Callout>` or `<Steps>` left in the output.

## Prevention

When adding demo markdown or MDX fixtures for the editor:

- Use the editor parser contract, not the docs-site MDX contract.
- Prefer Plate custom tags such as `<callout>` and `<column_group>` when the fixture is meant to round-trip through the editor.
- Add one thin deserialization test that checks for the expected structured node types instead of only checking that the page does not crash.
- Be careful with MDX attribute names that collide with Slate fields. If a custom tag needs a semantic `type`, map it to a safer Slate field such as `variant`.
