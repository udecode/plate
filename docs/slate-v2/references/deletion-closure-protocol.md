---
date: 2026-04-18
topic: slate-v2-deletion-closure-protocol
status: active
---

# Deletion Closure Protocol

## Purpose

Keep deletion closure honest across:

- batch scope
- file truth
- parent/child package rows
- front-door roadmap wording

## Core Rules

### 1. Batch name must match audited scope

Use exact package or family scope.
Do not use vague “package closure” language.

### 2. Parent/child closure is mandatory

Closing `packages/slate-react/test/**` does not close
`packages/slate-react/**`.

### 3. Freeze the deleted inventory first

Before refreshing wording:

1. freeze the deleted path inventory
2. classify each path as:
   - closed here
   - already closed
   - still open
   - explicit skip

### 4. Deletion closure is not behavior closure

Deleted-file accounting does not close:

- example parity
- runtime behavior parity
- API parity

### 5. Front-door docs must follow file truth

If open child rows remain, the parent package stays open in:

- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
- [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
