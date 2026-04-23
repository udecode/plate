---
date: 2026-04-18
topic: slate-v2-slate-accessor-batch-wave
status: completed
---

# Goal

Recover the next highest-leverage `slate` API seam that is actually backed by
the real draft in `../slate-v2-draft`:

- `getChildren`
- `setChildren`
- `Editor.getSnapshot(...)`
- `Editor.replace(...)`
- `Editor.reset(...)`
- `Editor.subscribe(...)`
- `Editor.withTransaction(...)`
- `Transforms.applyBatch(...)`

# Source Of Truth

Primary truth, in order:

1. legacy source and docs under `../slate/packages/slate/**` and
   `../slate/docs/**`
2. current `../slate-v2/packages/slate/**`
3. real draft source under `../slate-v2-draft/packages/slate/**`
4. banked cut decisions already recorded in live docs/ledgers

Hard rule:

- do not let the current narrowed surface win by default
- do not pretend the draft kept seams it actually deleted
- recover the public API shape first
- keep previously cut failure semantics cut unless explicitly reopened

# Why This Wave

The source-first audit for:

- `Editor.before(...)`
- `Editor.after(...)`
- `Editor.positions(...)`

showed those runtime files were already effectively same-path close to legacy.

By contrast, the accessor/transaction surface was still a real shipped
narrowing:

- current `slate-v2` had dropped `getChildren` / `setChildren`
- current `slate-v2` had no public snapshot/listener seam
- current `slate-v2` had no public transaction seam
- current `slate-v2` had no `Transforms.applyBatch(...)`
- the real draft still exposed:
  - `getChildren`
  - `setChildren`
  - `Editor.withTransaction(...)`
  - `Transforms.applyBatch(...)`

# TDD Posture

Use
[$tdd](/Users/zbeyens/git/plate-2/.agents/skills/tdd/SKILL.md).

Execution shape:

- pull focused draft-backed tests first as RED
- keep relevant current tests green
- recover the minimum public seam to make those tests pass
- refactor only after the focused red set is green

Draft-backed RED slices pulled first:

- accessor routing from `surface-contract.ts`
- transaction visibility and publish-on-exit from `transaction-contract.ts`
- rollback-on-throw from `transaction-contract.ts`
- `applyBatch(...)` parity with manual `withTransaction(...)`

Current tests kept alive:

- [index.spec.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/index.spec.ts)

# Landed Implementation

## Public interface

Recovered in
[interfaces/editor.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts):

- `getChildren`
- `setChildren`
- `getSnapshot`
- `replace`
- `reset`
- `subscribe`
- `withTransaction`
- snapshot types

## Runtime seam

Added lightweight public transaction/accessor state in
[public-state.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts)
instead of importing the whole draft batching subsystem.

Recovered in
[create-editor.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts):

- public accessor methods
- enumerable `children` accessor routed through those methods
- snapshot/listener methods
- transaction methods

Recovered in
[general.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/general.ts):

- `Transforms.applyBatch(...)` as thin sugar over
  `Editor.withTransaction(...)`

Updated
[apply.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/apply.ts)
to suppress ordinary flush scheduling inside an active transaction and publish
once at commit.

## Tests

Added focused public-seam coverage in
[accessor-transaction.test.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/accessor-transaction.test.ts):

- children accessor routes through `getChildren` / `setChildren`
- `Editor.setChildren(...)` routes through the overrideable instance method
- `Editor.withTransaction(...)` keeps replacement state visible and publishes
  once on exit
- `Transforms.applyBatch(...)` matches manual
  `Editor.withTransaction(...)` for:
  - duplicate exact-path `set_node`
  - mixed text/selection/node ops
  - structural insert/move/set batches
- `withTransaction(...)` rolls back staged changes on throw

Also restored 108 same-path legacy JSX fixture files under
`packages/slate/test/**` so the current `index.spec.ts` harness was honest
again instead of failing on broken fixture imports.

# Explicit Boundary

The real draft transaction seam is `Editor.withTransaction(...)`.

`Editor.withBatch(...)` is **not** in the real draft source of truth.

This wave therefore does **not** claim `withBatch(...)` is recovered. If we
want that legacy compatibility name later, it should be a separate explicit
decision.

Exact legacy partial-commit-on-throw batch semantics remain cut.

# Verification

- `cd /Users/zbeyens/git/slate-v2 && bun install`
- `cd /Users/zbeyens/git/slate-v2 && bunx turbo build --filter=./packages/slate`
- `cd /Users/zbeyens/git/slate-v2 && bunx turbo typecheck --filter=./packages/slate`
- `cd /Users/zbeyens/git/slate-v2 && bun run lint:fix`
- `cd /Users/zbeyens/git/slate-v2/packages/slate && bun test ./test/accessor-transaction.test.ts`
- `cd /Users/zbeyens/git/slate-v2/packages/slate && bun test ./test/index.spec.ts`

# Result

The draft-backed accessor/transaction/applyBatch wave is green.

The next tranche-3 move should be chosen by rereading the ledgers against this
landed seam, not by reusing the stale pre-wave queue.
