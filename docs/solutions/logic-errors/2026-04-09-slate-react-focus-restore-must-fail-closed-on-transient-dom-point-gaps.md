---
date: 2026-04-09
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Slate React focus restore must fail closed on transient DOM point gaps
tags:
  - slate-v2
  - slate-react
  - reacteditor
  - editable
  - focus
  - dom-bridge
severity: medium
---

# Slate React focus restore must fail closed on transient DOM point gaps

## What happened

The restored deleted `slate-react` focus tests exposed a fake-green bug.

`ReactEditor.focus(...)` correctly initialized selection from `null`, but the
focus path still ran through `Editable.handleFocus(...)`, which tried to
restore DOM selection immediately. During a mid-transform focus, the mounted
DOM tree had not fully caught up yet, so `setDomSelection(...)` could still
throw:

- `Cannot resolve a DOM point from Slate point`

The package test run stayed green, but stderr still got sprayed with the stack.

## What fixed it

Make the focus-time restore path fail closed on that specific transient error in
[editable.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx).

Instead of letting `setDomSelection(...)` throw during the immediate focus
restore, swallow only the known transient DOM-point failure and let the later
retry / normal selection-sync pass finish the job.

## Why this works

During focus, the mounted bridge and the DOM selection are allowed to be
temporarily out of sync.

That is not a real contract failure.
It is just an intermediate state while the tree settles.

Throwing there is wrong because it converts a recoverable timing gap into a
visible runtime error.

Failing closed is the right behavior:

- preserve the logical Slate selection
- avoid logging a fake error
- let the follow-up restore path succeed once the DOM catches up

## Reusable rule

For `slate-react` focus and selection-sync code:

- treat unresolved DOM-point errors during immediate focus restore as transient
  bridge gaps, not fatal failures
- only throw when the error means the contract is actually impossible, not just
  temporarily early
- deleted test-family closure is useful because it catches these stderr-only
  lies that broad happy-path proof can miss

## Related issues

- [2026-04-09-slate-v2-reacteditor-should-ride-the-mounted-bridge-and-keep-base-components-standalone.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-09-slate-v2-reacteditor-should-ride-the-mounted-bridge-and-keep-base-components-standalone.md)
- [2026-04-04-v2-editable-roots-should-own-mount-selection-sync-and-dom-commit.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-roots-should-own-mount-selection-sync-and-dom-commit.md)
