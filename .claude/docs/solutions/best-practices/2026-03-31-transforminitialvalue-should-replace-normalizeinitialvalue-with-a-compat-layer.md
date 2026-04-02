---
title: `transformInitialValue` should replace `normalizeInitialValue` with a compat layer
date: 2026-03-31
last_updated: 2026-03-31
category: docs/solutions/best-practices
module: Plugin API design
problem_type: best_practice
component: tooling
symptoms:
  - "Plugin hooks used `normalizeInitialValue`, which sounded like Slate runtime normalization instead of an initial value transform seam"
  - "The codebase still needed legacy plugin compatibility because the old hook name was threaded through plugin cache, edit-only config, and tests"
  - "The desired long-term direction was a pure initial-value transform API with a strict returned-value contract, but a hard rename would have created needless churn"
root_cause: inadequate_documentation
resolution_type: code_fix
severity: medium
tags:
  - api-design
  - plugins
  - initial-value
  - compatibility
  - editor
  - plate
---

# `transformInitialValue` should replace `normalizeInitialValue` with a compat layer

## Problem

The plugin hook name `normalizeInitialValue` was muddy. It sounded like Slate
runtime normalization, but the hook actually existed to transform the initial
editor value before the editor was ready.

That naming drift matters because it nudges people toward imperative mutation
when the better long-term seam is a value-to-value transform.

## Symptoms

- Plugin authors had to guess whether `normalizeInitialValue` meant:
  - mutate `editor.children`
  - return a new value
  - behave like runtime normalization
- The hook name was embedded in:
  - plugin type definitions
  - plugin cache wiring
  - edit-only config
  - tests and internal init pipeline
- A hard rename would have broken downstream plugins for very little real gain.

## What Didn't Work

- Doing nothing. The old name kept the semantic confusion alive.
- Hard-cut renaming the hook immediately. That would have forced churn through
  the plugin ecosystem without solving any runtime problem.

## Solution

Add the better name first, then let the old one decay.

### 1. Add `transformInitialValue`

`transformInitialValue` is now the preferred plugin hook name. It says what the
hook actually does: transform the initial value.

The hook accepts the same context and must return the next value:

```ts
type TransformInitialValue = (ctx: {
  editor: SlateEditor;
  value: Value;
}) => Value;
```

### 2. Keep `normalizeInitialValue` as a compatibility alias

Legacy plugins still work. The init pipeline resolves hooks like this:

```ts
const transformInitialValue =
  plugin.transformInitialValue ?? plugin.normalizeInitialValue;
```

That keeps the old hook name alive without freezing the new API in the past:

- `transformInitialValue` must return the next value
- deprecated `normalizeInitialValue` may either return the next value or mutate
  `value` in place
- when both names are present, `transformInitialValue` wins

The `nodeId` option got the same treatment:

- preferred: `initialValueIds`
- deprecated alias: `normalizeInitialValue`
- mapping:
  - `false` -> `'if-needed'`
  - `true` -> `'always'`
  - `null` -> `false`

### 3. Prefer the new hook internally

Built-in plugin surfaces that own this behavior should use the new name now.
That includes:

- the init pipeline
- internal plugin cache wiring
- built-in plugins like `nodeId` and `table`

## Why This Works

It fixes the naming without forcing a fake migration emergency.

The new hook name makes the desired design direction obvious:

- initial value work is a transform seam
- runtime editor fixes use transform APIs
- a returned value is required

The compatibility layer keeps the old name working while still making the new
contract obvious and preferable.

## Prevention

- If a hook is meant to transform a value before startup, name it as a
  transform, not as normalization.
- When a clearer API name emerges, add it first and prefer it internally before
  deleting the old name.
- Keep compatibility local to the pipeline or option resolver. Do not spread
  alias logic everywhere.
- Legacy mutation semantics are acceptable only behind the deprecated alias.
  The new name should stay strict.

## Related Issues

- Related learning: [2026-03-31-plate-nodeid-should-use-setnodesbatch-only-for-live-normalization.md](/Users/zbeyens/git/plate-2/.claude/docs/solutions/performance-issues/2026-03-31-plate-nodeid-should-use-setnodesbatch-only-for-live-normalization.md)
