---
module: Code Block
date: 2026-03-27
problem_type: logic_error
component: editor_transforms
symptoms:
  - "Formatting a JSON code block removed syntax highlighting from the formatted output"
  - "Only the first visual line could still receive decorations after formatting introduced newlines"
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - code-block
  - formatter
  - syntax-highlighting
  - redecorate
  - code-line
  - slate
---

# Code block format must rebuild code lines

## Problem

`formatCodeBlock` formatted valid JSON, but syntax highlighting broke immediately afterward.

The bug showed up most clearly when formatting one-line JSON into multi-line JSON from the code-block toolbar.

## Root cause

`formatCodeBlock` wrote the formatted string back with `insertText(..., { at: element })`.

That kept the code block as a single `code_line` node containing embedded `\n` characters instead of rebuilding separate `code_line` elements. The syntax highlighter maps decorations by code-line element, so once the formatter collapsed multiple visual lines into one structural line, only the first line had a node that decorations could target.

## Fix

Route formatted code through a shared code-block content transform inside the
formatter's active update. The helper receives that transaction and replaces
the block children with real `code_line` nodes.

```ts
export const setCodeBlockContent = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { code, element }: { code: string; element: TCodeBlockElement }
) => {
  tx.nodes.replaceChildren(
    code.split('\n').map((line) => ({
      children: [{ text: line }],
      type: editor.getType(KEYS.codeLine),
    })),
    {
      at: element,
    }
  );
};
```

## Verification

These checks passed:

```bash
bun test packages/code-block/src/lib
pnpm install
pnpm turbo build --filter=./packages/code-block
pnpm turbo typecheck --filter=./packages/code-block
pnpm lint:fix
```

## Prevention

When a formatter can introduce line breaks, do not treat the result as plain text insertion. Rebuild the editor structure that downstream plugins depend on.

For code-block regressions, add one formatter test that asserts both:

- multi-line output becomes multiple `code_line` nodes
- formatting applies the structural replacement through one active transaction
