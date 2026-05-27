---
title: Shell-backed large-document selection must fail closed in DOM and run broad ops through the model
date: 2026-04-11
category: docs/solutions/performance-issues
module: Slate v2 React runtime
problem_type: performance_issue
component: frontend_stimulus
symptoms:
  - "Shell-only large-document islands removed far descendant work, but full-document broad ops still depended on DOM selection that no longer covered the whole document"
  - "Ctrl+A over a partially mounted document would otherwise select only the mounted DOM subset"
  - "Browser-default paste on a shell-backed selection would target the wrong DOM region or force a fake whole-tree fallback"
root_cause: logic_error
resolution_type: code_fix
severity: critical
tags:
  - slate-v2
  - slate-react
  - performance
  - huge-document
  - islands
  - selection
  - paste
  - ctrl-a
---

# Shell-backed large-document selection must fail closed in DOM and run broad ops through the model

## Problem

Once far islands stop mounting editable descendants, the browser no longer owns
truth for whole-document selection.

That breaks the default assumptions behind `Ctrl+A`, selection sync, and paste.

## Symptoms

- `Ctrl+A` on a shell-backed document would otherwise select only the mounted
  editable DOM
- DOM selection sync would keep trying to project a Slate range through
  unmounted islands
- browser-default paste on a shell-backed selection would be wrong even if the
  model selection was right

## What Didn't Work

- treating broad ops as “just browser behavior” after introducing shells
- continuing to call `DOMBridge.toDOMRange(...)` for selections that span
  unmounted islands
- allowing paste to fall back to browser default when the mounted DOM no longer
  represents the full model selection

## Solution

In
[editable.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx):

- intercept `Ctrl+A` in large-document mode
- map it directly to the full-document model range
- mark shell-backed selection state on the root
- skip DOM range projection for shell-backed selections and clear native DOM
  selection instead
- route paste through `ReactEditor.insertData(...)`
- if selection is shell-backed, prevent browser default even when clipboard
  insertion fails, so the runtime fails closed instead of corrupting the wrong
  mounted subset

## Why This Works

The moment the runtime stops mounting the whole editable tree, broad operations
must stop trusting the browser to describe the whole document.

The browser still owns local live editing inside mounted islands.
It no longer owns whole-document selection semantics.

So the runtime split has to become explicit:

- mounted local edits: DOM truth
- shell-backed broad ops: model truth

That keeps shells cheap while preserving correct editor behavior.

## Prevention

- any shell or occlusion layer must audit `Ctrl+A`, paste, and selection sync
  explicitly
- if a selection spans unmounted content, do not project it back into DOM as if
  the whole tree still exists there
- shell-backed broad ops should fail closed in DOM and stay model-driven
- do not let browser-default paste touch a partially mounted document when the
  model selection is larger than the mounted DOM

## Related Issues

- [2026-04-11-slate-v2-large-document-broad-ops-batch.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-large-document-broad-ops-batch.md)
- [2026-04-11-slate-v2-proof-first-large-document-layer-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-proof-first-large-document-layer-plan.md)
