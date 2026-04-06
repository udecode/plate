---
module: Suggestion
date: 2026-04-06
problem_type: logic_error
component: tooling
symptoms:
  - "Typing inside a table in suggestion mode created an unexpected `Add: Paragraph` suggestion below the table"
  - "Normalization-generated trailing paragraphs were treated like user-authored suggestion inserts"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - suggestion
  - trailing-block
  - normalizeNode
  - withoutSuggestions
  - table
  - regression
---

# Trailing block normalize inserts must run without suggestions

## Problem

In suggestion mode, typing inside a table could create an unrelated `Add: Paragraph` suggestion under the table.

The extra suggestion came from the editor's trailing-block normalization, not from the user's input.

## Root cause

`TrailingBlockPlugin` inserted its fallback paragraph directly inside `normalizeNode`.

That insert ran through the normal editor transform pipeline, so suggestion tracking could record it as a user change when the editor was in suggestion mode.

## Fix

Make trailing-block insertion pluggable instead of hard-coding the transform:

- add an optional `insert(editor, { at, insert, type })` hook to `TrailingBlockPlugin`
- keep the default behavior unchanged when no hook is provided
- in app editor kits, configure that hook to wrap the insert with `SuggestionPlugin.withoutSuggestions(insert)`

This keeps `packages/utils` generic while letting the app opt specific normalize-generated inserts out of suggestion tracking.

## Verification

These checks passed:

```bash
bun test packages/utils/src/lib/plugins/trailing-block/withTrailingBlock.spec.tsx
pnpm install
pnpm turbo build --filter=./packages/utils --filter=./apps/www
pnpm turbo typecheck --filter=./packages/utils --filter=./apps/www
pnpm lint:fix
```

Browser check:

- on `http://127.0.0.1:3051/blocks/playground`
- switch the editor to `Suggestion`
- type `1` inside a table cell
- confirm the page does not show `Add: Paragraph`

## Prevention

When a plugin inserts nodes during normalization, do not assume those transforms should be tracked like direct user edits.

Prefer a small escape hatch at the plugin boundary, then let the app layer decide whether that insert should run inside `withoutSuggestions`, `withoutNormalizing`, or another wrapper.
