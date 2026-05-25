---
title: Slate v2 pathRef must invalidate on replace
date: 2026-04-08
category: logic-errors
module: slate-v2 headless refs
problem_type: logic_error
component: testing_framework
symptoms:
  - pathRef kept returning [0] after explicit snapshot replacement even though the old logical node was gone
  - runtime-id-based path tracking silently rebound to unrelated replacement content
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [slate-v2, pathref, replace, runtime-id, refs]
---

# Slate v2 pathRef must invalidate on replace

## Problem

`pathRef` was implemented on top of runtime IDs, which works well for moves and
sibling shifts. But explicit snapshot replacement reuses path-based IDs, so the
ref could silently point at unrelated replacement content.

## Symptoms

- a `pathRef` created for an old node still returned `[0]` after
  `Editor.replace(...)`
- the behavior looked superficially stable while actually referring to a new
  node

## What Didn't Work

- tracking only `runtimeId -> current path`
- assuming replace would naturally invalidate refs the same way move/remove do

## Solution

Track a replace epoch in core and bind each `pathRef` to the epoch it was
created in:

```ts
const replaceEpoch = getCurrentReplaceEpoch(editor)

get current() {
  return detached || getCurrentReplaceEpoch(editor) !== replaceEpoch
    ? null
    : cloneNullablePath(getCurrentPathForRuntimeId(editor, runtimeId))
}
```

Increment the epoch only when an explicit snapshot replacement survives the
transaction and publishes.

## Why This Works

Moves and sibling shifts preserve logical node identity, so runtime IDs are the
right anchor there. Explicit replace is a different boundary: the old document
identity is gone. The replace epoch stops runtime-id reuse from masquerading as
stable ref identity.

## Prevention

- treat `replace` as an identity reset, not just another tree mutation
- when building ref helpers on runtime IDs, define the invalidation boundary up
  front
- test ref behavior across `move`, `remove`, and `replace`, not just one of
  them

## Related Issues

- [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)
- [2026-04-08-slate-v2-public-core-diff-closure.md](../../plans/2026-04-08-slate-v2-public-core-diff-closure.md)
