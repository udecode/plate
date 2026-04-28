---
title: Slate transform namespaces should be hard-cut to editor methods
type: solution
date: 2026-04-09
last_updated: 2026-04-25
status: completed
category: developer-experience
module: slate-v2
problem_type: developer_experience
component: tooling
symptoms:
  - transform namespace helpers still looked like first-class public API
  - internals and fixtures kept importing Transforms after docs moved to editor.update
  - codemodding Transforms.insertText to editor.insertText created recursion
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags:
  - slate
  - slate-v2
  - transforms
  - public-surface
  - architecture
  - editor-update
---

# Slate transform namespaces should be hard-cut to editor methods

## Problem

Slate v2 cannot claim `editor.update(...)` and editor methods as the primary
runtime while `Transforms.*` remains exported, imported in fixtures, or used in
runtime code.

## Symptoms

- `Transforms.*` stayed green in contract tests after docs/examples were clean.
- Legacy transform fixtures imported `Transforms` from `slate`, keeping the old
  mental model alive.
- Removing the namespace mechanically exposed a real recursion bug:
  `editor.insertText` called itself when the old low-level
  `Transforms.insertText` path was replaced blindly.

## What Didn't Work

- Keeping `Transforms` as thin sugar. That preserved a second-looking public
  write surface.
- Treating this as docs-only cleanup. The namespace survived in runtime imports,
  tests, and fixtures.
- A blind codemod from `Transforms.foo(editor, ...)` to `editor.foo(...)`.
  Most calls were fine, but `editor.insertText` needed an internal low-level
  text insertion helper.

## Solution

Hard-cut the public namespace and migrate callers:

- Stop exporting `Transforms`, `GeneralTransforms`, `NodeTransforms`,
  `SelectionTransforms`, and `TextTransforms` from the root `slate` surface.
- Use editor primitives such as `editor.setNodes(...)`,
  `editor.insertText(...)`, `editor.select(...)`, and
  `editor.applyOperations(...)`.
- Keep transform implementation modules internal only.
- Add a public-surface contract that fails if the root package re-exports the
  deleted namespaces.
- Preserve `editor.insertText` by routing its low-level text path through an
  internal `applyInsertText(...)` helper instead of recursively calling the
  semantic method.

## Why This Works

The public runtime has one write story:

```ts
editor.update(() => {
  editor.setNodes({ type: 'heading-one' })
})
```

Operations and implementation helpers still exist, but users and tests do not
reach for a second `Transforms.*` namespace. The `insertText` split matters
because semantic text insertion owns marks and command dispatch, while the
internal text helper owns exact text operations.

## Prevention

- Keep a root-surface test asserting the deleted namespace names are absent.
- Grep for `Transforms.*` outside generated historical output before claiming
  closure.
- Do not replace low-level helper calls blindly inside semantic editor methods.
- Use `editor.applyOperations(...)` for raw operation replay and editor methods
  inside `editor.update(...)` for document writes.
