---
module: Link
date: 2026-03-28
problem_type: logic_error
component: tooling
symptoms:
  - "Pasting code that starts with // could create a link node instead of plain text"
  - "Code comments pasted into code blocks were rendered as links before code-block paste handling could run"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - link
  - autolink
  - paste
  - code-block
  - validation
  - url
---

# Link validation must not treat double-slash as an internal path

## Problem

The link validator treated any string starting with `/` as an internal path.

That accidentally included protocol-relative and comment-style `//...` text, which let the link plugin autolink pasted code before the code-block plugin could normalize it into plain code lines.

## Root cause

`validateUrl` returned `true` immediately for `url.startsWith('/')`.

That single-slash shortcut was meant for internal app paths like `/docs`, but it also matched `//example.com` and `// this is a comment`. Once that happened, `withLink.insertData` wrapped the pasted text in a link node and returned early, so the downstream code-block paste logic never ran.

## Fix

Only treat single-slash paths as internal links. Reject double-slash input from the internal-path fast path.

```ts
if (url.startsWith('/') && !url.startsWith('//')) {
  return true;
}
```

Regression coverage should live at two levels:

- direct validator coverage for `//example.com`
- paste coverage with `BaseCodeBlockPlugin` and `BaseLinkPlugin` together, asserting `//` comments stay plain code

## Verification

These checks passed:

```bash
bun test packages/code-block/src/lib/withInsertDataCodeBlock.spec.tsx packages/link/src/lib/utils/validateUrl.spec.ts
pnpm install
pnpm turbo build --filter=./packages/code-block --filter=./packages/link
pnpm turbo typecheck --filter=./packages/code-block --filter=./packages/link
pnpm lint:fix
```

## Prevention

When link validation has shortcuts for internal routing, explicitly exclude lookalike external or non-link prefixes such as `//`.

For paste regressions that combine plugins, add one integration-style test with the real plugin pair instead of only unit-testing the validator in isolation.
