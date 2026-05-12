---
module: Markdown
date: 2026-04-03
last_updated: 2026-05-11
problem_type: logic_error
component: markdown_serializer
symptoms:
  - "Bare URL links serialized as bracket links instead of staying plain URLs."
  - "Bare URL links ignored `remarkStringifyOptions.resourceLink = true`."
  - "Footnote references disappeared during markdown deserialization."
  - "Unsupported GFM constructs silently lost the user-visible syntax even when the text itself still mattered."
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - markdown
  - gfm
  - autolink
  - resource-link
  - footnote
  - serializer
  - fallback
---

# GFM extension fallbacks must preserve user-visible syntax

## Problem

Two GFM seams were lying in different ways:

- autolink literals parsed as links, but serialized back as `[url](url)`
- footnote references and definitions were not modeled, so the fallback dropped
  the `[^id]` marker entirely

Both failures broke the same rule: if Plate cannot preserve the exact feature
model yet, it still has to preserve the syntax users actually typed.

## Root Cause

- The markdown link serializer always emitted a normal `link` node, which let
  `remark-stringify` choose bracket-link output.
- The footnote fallback only flattened definition children into paragraphs and
  left `footnoteReference` without a deserializer, so the marker vanished.

## Solution

### Autolink literal

When a link node is just a plain URL with identical text and href, serialize it
as raw markdown text instead of a normal link node, unless the caller explicitly
forces resource links:

```ts
const isBareAutolinkLiteral =
  children.length === 1 &&
  children[0]?.type === 'text' &&
  children[0].value === node.url &&
  options.remarkStringifyOptions?.resourceLink !== true &&
  BARE_AUTOLINK_PROTOCOL_REGEX.test(node.url ?? '');

if (isBareAutolinkLiteral) {
  return {
    type: 'html',
    value: node.url,
  };
}
```

That preserves:

```md
https://platejs.org
```

instead of degrading to:

```md
[https://platejs.org](https://platejs.org)
```

But when the caller sets `remarkStringifyOptions.resourceLink = true`, return
the normal mdast `link` node and let `remark-stringify` emit:

```md
[https://platejs.org](https://platejs.org)
```

### Footnote fallback

Until Plate has a first-class footnote model:

- deserialize `[^id]` references into literal text nodes
- deserialize definitions into plain paragraphs with the label on the first
  block

That keeps the visible syntax alive:

```md
[^1]

[^1]: Footnote text
```

instead of silently dropping the reference marker.

## Why This Works

There are two levels of correctness:

1. full semantic support
2. syntax-preserving fallback

If full support is not there yet, fallback still needs to preserve what the
user sees and typed. Losing the marker or rewriting a URL into a different link
form is data drift, not a harmless implementation detail.

Serializer fallbacks also have to stay below caller-controlled stringify
options. If an option like `resourceLink` exists specifically to force a
markdown wire shape, the Plate shortcut should yield the normal mdast node and
let `remark-stringify` honor that setting.

## Prevention

- For every unsupported or partially supported markdown extension, define an
  explicit fallback contract.
- Fallback contracts should preserve user-visible syntax before they preserve
  internal shape convenience.
- Before returning raw markdown/html from a serializer shortcut, check whether
  `remarkStringifyOptions` already exposes the caller's requested wire shape.
- Add package-surface tests for:
  - parse
  - serialize
  - deserialize after serialize
  - explicit `remarkStringifyOptions` overrides for the same surface
- Do not accept "the text is still there somewhere" as good enough when the
  syntax itself carries meaning.

## Verification

These checks passed:

```bash
bun test packages/markdown/src/lib/gfmSurface.spec.ts packages/markdown/src/lib/commonmarkSurface.spec.ts packages/markdown/src/lib/defaultRules.spec.ts apps/www/src/__tests__/package-integration/markdown-rich/defaultRule.spec.ts packages/link/src/lib/withLink.spec.tsx
pnpm lint:fix
```

Additional resource-link regression:

```bash
pnpm exec bun test packages/markdown/src/lib/gfmSurface.spec.ts
pnpm turbo build --filter=./packages/markdown
pnpm build
pnpm turbo typecheck --filter=./packages/markdown
pnpm lint:fix
```
