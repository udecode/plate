## Findings

### 1. [warning] The new thenable check throws on a non-object owner result after the claim, so history gets stuck
**Location**: `packages/plitejs/src/history/history-plugin.ts:1026`
**Finding**: The check `if (!('then' in ownerResult)) …` runs outside the `try` that wraps the owner call. If an owner returns `undefined`, `null` or a primitive, the `in` operator throws a `TypeError`. The claim was already published at lines 942–945, so `pending()` stays set. The throw also escapes `undo()` without ever reaching `fail`. After that, every undo and redo returns `busy` until the activation is replaced. That breaks the plan's rule that "every failure after the claim settles failed and reports once". It also breaks TaskHub-22's C22-SAFETY follow-up oracle ("next undo targets B again").

This is a regression against round 1's tree. There, `undefined instanceof Promise` was `false`, so the value went to `settle`. `settle` read `ownerResult.status` inside its `try`, which routed the `TypeError` to `fail`: the claim was cleared, the error reported once, and the result was `failed`. HEAD wedges the same way (`ownerResult.status` after the `await` sits outside its try), so this is not new relative to HEAD. Round 1's fix just walked back into it.
**Evidence**: In-memory `node -e`: `'then' in undefined`, `null`, `'applied'` and `1` each throw `TypeError: Cannot use 'in' operator…`. Path: lines 1020–1024 assign the result, the `try` ends, then line 1026 throws. `fail` and `settleBlocked` never run.

Reaching this needs an owner that breaks its TS return type: a JS plugin, an `any` cast, or a branch that forgets to `return`. Comments, the only production owner, is `async` and always returns a Promise. The outcome is recoverable by reload, so I rate it warning, not critical.
**Suggestion**: Use `typeof (ownerResult as { then?: unknown } | null | undefined)?.then === 'function'`, which sends a non-object to `settle` and from there to `fail`. Or run the classification inside the existing `try`. Either is a one-line change to round 1's fix. If it misses the cap, log it as `open` with this patch.

### 2. [nit] The reordered `fail` reports the retry's error first, and the changeset still says "once"
**Location**: `history-plugin.ts:967-976` and `988`; `.changeset/plite-history-persistence.md:18`
**Finding**: When `settleBlocked()` throws E1 at line 988, `settle`'s catch calls `fail(E1)`. The claim is still held, so `fail` retries `settleBlocked()`, which throws E2. Because the clear now runs before the report, the sink receives E2, the incidental retry error, before E1, the root cause. A sink that keeps only the first error per replay, such as a single toast, now shows the wrong one. The changeset's "Report a failed replay once" is false on this path. The lead kept the double report on purpose; the reorder makes its order worse.
**Suggestion**: Skip the retry when the update that failed was `settleBlocked` itself, or drop "once" from the changeset.

### 3. [nit] The foreign-realm test only passes because Bun compares loosely
**Location**: `packages/plitejs/test/history/history-branch-contract.spec.ts:570-573`
**Finding**: `settle` returns the owner's foreign-realm object as the `blocked` settlement. Node's `assert/strict` `deepEqual` compares `[[Prototype]]` with `===`, so it rejects that object against a local literal. Bun's implementation does not.
**Evidence**: In-memory check: Node gives `FAIL Values have same structure but are not reference-equal`, and Bun passes. The partition runner is Bun (`run-entrypoint-task.mjs:58`), so CI stays green, but the test is tied to its runner.
**Suggestion**: Assert `status` and `reason` separately, or spread the result first: `assert.deepEqual({ ...result }, …)`.

### 4. [nit] "Both" now points at the wrong pair
**Location**: `docs/plite/reference/public-docs/libraries/plite-history/history-editor.mdx:66`
**Finding**: The new fallback sentence sits between "`blocked`… `failed`…" and "Both keep that batch at the branch head". "Both" now reads as `reportError` and `console.error`. In `content/docs/api/react-hooks.mdx` the edited line is also left unwrapped.

### Round-1 fixes that hold
- **Foreign promise (round 1's critical).** The fix removes it. `Promise.resolve` keeps a same-realm native promise's identity (checked in memory), so Comments' timing is unchanged. The red receipt ("false == true") matches the `settled` helper's `pending` assertion firing on the old `instanceof` path.
- **Synchronous throw test.** It fails when the try/catch is removed, per the mutation receipt. It also pins `pending() === null` and exactly one sink call.
- **`settled` never rejects.** `reportEditorLifecycleError` wraps the sink, and neither `reportError` nor `console.error` throws, so `fail` cannot throw from the rejection handler.
- **Entrypoint graph.** `facade.ts`, `lib/editor` and `lib/plugins` fall into `core`, which may import `plitejs` (`entrypoint-dag.mjs`, `fallbackEntrypoint: 'core'`). Plate's history proxy now imports only `plitejs/history`. `facade.ts` is not re-exported publicly, so `HistoryApi` is not exported twice.
- **Receipt leak.** None on the `fail` paths. Receipts exist only for applied settlements: a claim or a blocked settlement returns no identity.
- **Benchmark.** The synchronous row map is equivalent, since the old async body never awaited.

Not run because they write: the Bun history partition with `'then' in` swapped for the guarded `typeof` form, and a test with an owner that returns `undefined` (it should fail at 59e7c44b with `busy` on the second `undo()` and pass after the fix).
