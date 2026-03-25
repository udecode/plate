---
module: Code Block
date: 2026-03-23
problem_type: logic_error
component: editor_transforms
symptoms:
  - "Pressing Tab on a multi-line code-block selection only indented or outdented the first selected line"
  - "Code-block tab behavior looked partially correct in single-line cases, which hid the bug"
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - code-block
  - tab
  - selection
  - transforms
  - testing
  - slate
---

# Code block tab should indent every selected line

## Problem

`withCodeBlock.tab` is supposed to indent or outdent every selected code line.

In practice, a selection spanning multiple code lines only changed the first one. Single-line tab cases still worked, which made the bug easy to miss.

## Root cause

The implementation queried nodes using the code-block type instead of the code-line type:

```ts
const _codeLines = editor.api.nodes<TElement>({
  match: { type },
});
```

Inside `withCodeBlock`, `type` is the plugin type for the block itself. That returns the code block entry, not the individual code lines.

The later loop then fed that block entry into `indentCodeLine` / `outdentCodeLine`, so only the start of the block moved.

## Fix

Query explicit code-line entries first:

```ts
const codeLineType = editor.getType('code_line');
const _codeLines = editor.api.nodes<TElement>({
  match: { type: codeLineType },
});
```

That makes the loop operate on every selected line, which matches the transform’s intent.

## Verification

These checks passed:

```bash
bun test packages/code-block/src
pnpm test:slowest -- --top 20 packages/code-block/src
pnpm turbo build --filter=./packages/code-block
pnpm turbo typecheck --filter=./packages/code-block
```

## Prevention

For block-level keyboard overrides, add one multi-line selection test, not just single-cursor coverage.

If a loop variable is named `codeLines`, verify the query actually returns code lines and not the container node. Names lie; tests don’t.
