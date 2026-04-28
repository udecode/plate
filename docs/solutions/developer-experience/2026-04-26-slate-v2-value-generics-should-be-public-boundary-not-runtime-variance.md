---
title: Slate v2 value generics should be public boundary not runtime variance
date: 2026-04-26
category: docs/solutions/developer-experience
module: slate-v2 slate slate-react slate-dom slate-history
problem_type: developer_experience
component: tooling
symptoms:
  - generic compile contracts caught erased `V extends Value` in editor APIs
  - making every instance callback fully generic caused TypeScript variance explosions
  - `Editor<V>` stopped flowing through internal helpers typed as unparameterized `Editor`
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [slate-v2, generics, editor-types, value, variance, typescript]
---

# Slate v2 value generics should be public boundary not runtime variance

## Problem

Slate v2 replaced declaration merging with `Value`-first generics, but some
public APIs still erased the concrete `V extends Value`. The first attempted fix
made internal instance callbacks too generic and TypeScript correctly turned the
runtime into an invariant mess.

## Symptoms

- `Editor.getChildren(editor)` preserved the custom value shape, but operations,
  commits, extension listeners, and React selectors still collapsed toward base
  `Value`.
- Adding `Operation<V>`, `EditorCommit<V>`, and `EditorTransaction<V>` to every
  instance method made calls like `someHelper(editor)` fail because
  `Editor<CustomValue>` was no longer assignable to unparameterized `Editor`.
- The error shape was noisy and misleading:
  `Value is assignable to the constraint of type V, but V could be instantiated
  with a different subtype`.

## What Didn't Work

- Threading `V` through every runtime instance callback.
- Treating `BaseEditor` as the only generic enforcement point.
- Letting runtime weak maps and low-level helpers require exact app value types.

## Solution

Keep exact generics at public and static API boundaries, and keep runtime
instance parameters structurally broad where TypeScript variance would otherwise
poison internal helpers.

Good boundary:

```ts
const children: CustomValue = Editor.getChildren(editor)
const operations: readonly Operation<CustomValue>[] =
  Editor.getOperations(editor)
const commit: EditorCommit<CustomValue> | null = Editor.getLastCommit(editor)
```

Good extension contract:

```ts
defineEditorExtension<typeof editor>({
  name: 'generic-extension',
  operationMiddlewares: [
    (context, next) => {
      const operation: Operation<CustomValue> = context.operation
      next(operation)
    },
  ],
  commitListeners: [
    (commit, snapshot) => {
      const children: CustomValue = snapshot.children
      void commit
      void children
    },
  ],
})
```

Runtime internals can stay broad:

```ts
withTransaction: (fn: (transaction: EditorTransaction<any>) => void) => void
subscribe: (listener: SnapshotListener<any>) => () => void
```

The public static wrapper casts at the boundary after the runtime has done its
structural work:

```ts
withTransaction<V extends Value>(
  editor: Editor<V>,
  fn: (transaction: EditorTransaction<V>) => void
) {
  editor.withTransaction(fn as (transaction: EditorTransaction<any>) => void)
}
```

## Why This Works

TypeScript function parameters are contravariant under strict checking. If an
internal editor instance says it only accepts `Operation<CustomValue>`, it cannot
also be used where a helper expects an editor that accepts base `Operation<Value>`.

The runtime does not need exact app value types to mutate weak maps, reconcile
snapshots, or dispatch transactions. Consumers do need exact app value types at
the public API boundary. That is where the generic contract belongs.

## Prevention

- Add compile contracts for every generic boundary: editor statics, helper
  aliases, extension middleware/listeners, package wrappers, and React selectors.
- Do not use runtime instance methods as the only proof of generic precision.
- If `Editor<V>` stops flowing into internal helpers, check for `V` in parameter
  positions before weakening the public API.
- Keep `ValueOf<typeof editor>`, `Operation<V>`, `EditorCommit<V>`, and
  `EditorSnapshot<V>` precise at public boundaries.
- Treat `WithEditorFirstArg` and unparameterized `Editor` aliases as likely
  generic erasure points.

## Related Issues

- [Slate v2 Plate Generics Type System Plan](/Users/zbeyens/git/plate-2/docs/plans/2026-04-26-slate-v2-plate-generics-type-system-plan.md)
- [Slate package declaration merging recovery must start from base aliases not example casts](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-15-slate-package-declaration-merging-recovery-must-start-from-base-aliases-not-example-casts.md)
