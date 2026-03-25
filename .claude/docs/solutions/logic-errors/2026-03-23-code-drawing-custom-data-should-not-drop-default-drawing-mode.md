---
module: Code Drawing
date: 2026-03-23
problem_type: logic_error
component: editor_transforms
symptoms:
  - "Inserting a code drawing with custom `props.data` dropped default fields like `drawingMode`"
  - "Default insert cases worked, which hid the bug until custom data was passed"
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - code-drawing
  - transforms
  - defaults
  - object-spread
  - testing
---

# Code drawing custom data should not drop default drawing mode

## Problem

`insertCodeDrawing` is supposed to start with sane defaults and then let callers override only the fields they care about.

Passing custom `props.data` like `{ drawingType: 'Graphviz', code: '...' }` silently dropped the default `drawingMode: 'Both'`.

## Root cause

The function did merge defaults first:

```ts
data: {
  drawingType: 'Mermaid',
  drawingMode: 'Both',
  code: '',
  ...props.data,
},
```

But it then spread `...props` after that, which overwrote the whole `data` object with the caller's partial object.

## Fix

Split `props.data` from the rest of `props` first:

- merge defaults with `propsData`
- spread only the remaining top-level props afterward

That keeps top-level overrides working without nuking the nested default fields.

## Verification

These checks passed:

```bash
bun test packages/code-drawing/src
pnpm test:slowest -- --top 20 packages/code-drawing/src
pnpm turbo build --filter=./packages/code-drawing
pnpm turbo typecheck --filter=./packages/code-drawing
```

## Prevention

Whenever a helper merges nested defaults and also spreads the whole parent object, add one test with partial nested overrides.

That bug pattern is easy to miss and stupidly easy to ship.
