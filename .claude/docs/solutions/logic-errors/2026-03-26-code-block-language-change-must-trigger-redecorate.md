---
module: Code Block
date: 2026-03-26
problem_type: logic_error
component: editor_transforms
symptoms:
  - "Changing a code block language left old syntax highlighting on untouched lines"
  - "Editing a line made highlighting catch up, which made the bug look like a partial render issue"
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - code-block
  - syntax-highlighting
  - redecorate
  - decorate
  - slate
  - react
---

# Code block language change must trigger redecorate

## Problem

Changing `code_block.lang` updated the node value, but syntax highlighting for the block did not fully refresh right away.

Only after editing a line did the stale tokens disappear, so the bug looked like a per-line highlight problem instead of a decorate lifecycle gap.

## Root cause

`withCodeBlock.apply` cleared `CODE_LINE_TO_DECORATIONS` when `lang` changed, but it stopped there.

That removed cached ranges, but Plate's React `decorate` function was still memoized behind `versionDecorate`. Without `editor.api.redecorate()`, Slate kept rendering with the old decoration pass until another change forced a fresh decorate cycle.

The original check also only looked at truthy `operation.newProperties.lang`, which missed some real transitions such as clearing or resetting the language.

## Fix

Treat language changes as a two-step operation inside `withCodeBlock.apply`:

1. Detect a real `lang` transition by comparing previous and next values.
2. Clear cached line decorations before `apply(operation)`.
3. Call `editor.api.redecorate?.()` after `apply(operation)` completes.

That makes these transitions all behave the same way:

- `javascript -> json`
- `javascript -> plaintext`
- `undefined -> javascript`
- `javascript -> undefined`

## Verification

These checks passed:

```bash
bun test packages/code-block/src/lib/withCodeBlock.spec.tsx packages/code-block/src/lib/BaseCodeBlockPlugin.spec.ts packages/code-block/src/lib/setCodeBlockToDecorations.spec.ts
pnpm install
pnpm turbo build --filter=./packages/code-block
pnpm turbo typecheck --filter=./packages/code-block
pnpm lint:fix
```

## Prevention

When a plugin caches decoration state outside Slate nodes, clearing the cache is not enough. Also verify what actually triggers the next decorate pass.

For regressions around `decorate`, add one test that changes the underlying node data and asserts any explicit refresh hook is called. In this case, the stable seam is `withCodeBlock.apply`, not the UI combobox that calls `setNodes({ lang })`.
