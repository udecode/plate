# Markdown nested list spread fix

## Goal

Fix markdown serializer so indented nested lists stringify without blank lines.

## Findings

- Added failing regression coverage in `standardList.spec.tsx` for nested indented lists; current output is `"* parent\n\n  * child\n"`.
- `remark-stringify` emits the blank line when nested `listItem.spread` is missing.
- Classic list serializer already sets `listItem.spread: false`; `listToMdastTree` needs the same mdast shape.

## Plan

1. Add explicit `spread` to list items in `listToMdastTree.ts`, including block-id path.
2. Align helper specs to the normalized mdast shape.
3. Run serializer tests, package tests, build-first typecheck, and lint.
