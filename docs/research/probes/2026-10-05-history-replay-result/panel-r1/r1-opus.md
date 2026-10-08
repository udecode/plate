## Findings

### 1. [warning] Replay failures become less visible than they are today
**Location**: the Layer and owner table (third row), the Replay failure row of Defaults, and the Hard cuts row that removes "Rejection from `undo()`".
**Finding**: Failures move to `reportEditorLifecycleError`. When an app sets no sink, that function only calls `globalThis.console?.error(error)` (last line of `core/lifecycle-error.ts`). Today a mounted failure goes through `globalThis.reportError` (`editable-dom-runtime.ts:1133-1149`), and a headless `void undo()` raises `unhandledrejection`. Both reach window-level error monitors by default. After this change, an app without `lifecycleErrorSink` sees a Cmd+Z owner failure only in the console. That weakens invariant 3: the probe's "1 unhandled rejection" was an error someone could see, not a lost one.
**Evidence**:
- The plan never says what happens to document-path errors. Today `applyReplay` throws synchronously (`history-plugin.ts:1057`). If that stays, a caller needs `try/catch` for document batches and the sink for session batches, so it has to know the hidden batch kind to handle errors.
- The sink's JSDoc covers "observers that run after authoritative state is published" (`interfaces/editor.ts:1900`), not replay failure.
- The plan's example `error.source === "history"` does not compile: the plugin-listener variant of `EditorLifecycleError` has no `source` field.

**Suggestion**: For `source: 'history'`, fall back to `reportError` when it exists, as the dispatcher does today. State the error rule for the document path. Fix the JSDoc and the example.

### 2. [warning] After the owner has applied, `failed` keeps the entry, so undo blocks at it for good
**Location**: the Replay failure row of Defaults.
**Finding**: This is the P7 path. The owner applies: Comments' `setThread` (`BaseCommentsPlugin.ts:809`) has already removed the thread on the server and locally. Then the settle step throws. The plan clears `pending` and keeps B at the head. The next undo that reaches B runs `replayCreation`, which finds `current` (null) ≠ `transition.previous` (`:829-841`). It returns `blocked comments-thread-changed` on every attempt, so A and everything older can't be reached until reload.
**Evidence**: This is the editor-wide fault barrier the plan rejected from astra, scoped to one entry. It is also the "fork local state" that AC5 forbids. The plan's own survey says VS Code "clears the affected stacks" on failure. The judge flagged this case, and the plan deferred it under `stage comments` while still picking the default that guarantees the stuck head.
**Suggestion**: Split the two cases:
- The owner threw or refused: keep the entry, as the plan does.
- The owner applied and then settlement threw: drop the claimed entry from its branch, push nothing to redo, and report `failed`.

The second case is a subtractive change and keeps AC5 for real owner failures.

### 3. [warning] Phase 1 already makes focus repair synchronous; the browser proof is in Phase 2; and synchronous repair has no job
**Location**: Phase 1 step 4, Phase 2 steps 1-2, and the first row of the native behavior table.
**Finding**:
- **Phase 1 changes the timing.** `replayHistory` is `async` and has no `await` before `run()` (`editable-dom-runtime.ts:1016-1063`). "Awaiting `settled` only for pending" means a settled result runs lines 1096-1118 (`writePliteViewSelection` and `historyFocusHandler`) inside the keydown call already in Phase 1. Risk 2 therefore ships in Phase 1 with only `test:partition:react` as proof, and "revert to the Phase 1 adapter" doesn't undo it.
- **Synchronous repair has no job.** `grounding-how.md:128` says only microtasks can run in that gap, so repairing inside the call is not visible to the user. The plan's Defaults keep the guards and keep callbacks in a microtask. Deleting the casts, the union and the version arithmetic doesn't depend on repair timing.
- **Synchronous owners lose focus repair.** Phase 1 keeps `version + (pending === direction ? 2 : 1)` and reads `pending` after the call. A synchronous owner now settles inside the call, so `pending` is null and the expected version is `version + 1`, while the receipt is `version + 2`. Focus repair is skipped silently. No mounted test has a synchronous owner: both fixtures `await gate.promise` (`editable-dom-runtime-contract.test.tsx:67-68`, `use-plite-history.test.tsx:52-53`). Phase 2's "claim version only on pending" doesn't say what check a settled session result gets.

**Suggestion**: Repair in one microtask in both phases, the same timing as the callbacks. Replace the arithmetic with a check that the receipt is the last commit, and add a mounted case with a synchronous owner. Otherwise, move the Chromium proof into Phase 1.

### 4. [warning] The proposed `HistorySettlement` type has no `applied` member
**Location**: the "after" block under Public API.
**Evidence**: `Extract<HistoryOutcome, {status:'applied'|'failed'} | {reason:string}>` is checked member by member. The member `{status:'applied'|'empty'|'busy'}` is not assignable to `{status:'applied'|'failed'}`, so it drops out. The result is `blocked`-with-reason or `failed`, so `settled` can never resolve to `applied`. Arena candidate label-A kept `applied` as its own member (`label-A.md:70-78`); the plan merged it with `empty` and `busy` and broke the `Extract`.
**Suggestion**: Make `applied` its own member, or write `HistorySettlement` as an explicit union.

### 5. [warning] The plan describes uncommitted work from another session, not the frozen commit
**Location**: the verdict ("275 `void` and 91 `await`"), the Public API "before" block, and Hard cuts.
**Evidence**:
- At `eca7f8e9`, no code calls `void …history.undo(`. `git grep` finds that string only in the plan, the topic page, the probe and the review record. `yjs-collaboration.tsx:1168` reads `editor.api.history.undo();`.
- The roughly 280 `void`s, the new `tooling/scripts/check.mjs` with its `lint-type-aware` step (status `A`), and the `ci.yml` changes exist only in the working tree. HEAD's CI does not run the type-aware lint at all.
- So "keep the lint as configured" and the migration list both depend on work that hasn't landed. Phase 1's "migrate every caller" would edit about 290 files that hold someone else's uncommitted changes, which AGENTS.md says to copy to scratch first.
- The review record says "all 6 production callers"; the plan says 12.

**Suggestion**: State the base the plan assumes. If the `void` sweep hasn't landed, the cheapest migration is not to land it.

### 6. [warning] Doctrine is only partly reconciled
**Location**: the last step of Phase 1, and the review record's `reconciliation` list.
**Evidence**:
- `history-ownership.md:92-94` still says "Do not restore synchronous replay, return a sync-or-Promise union". The new paragraph supersedes only sentences that keep `Promise<HistoryResult>`.
- The record reconciles only `2026-10-04-history-audit`. It skips `2026-09-23-history-async-replay-api`, whose requirements were "one statically honest return type" and "avoid conditional timing". A result discriminated on `pending` is a tagged sync-or-async union. A caller that ignores the result now gets no signal at all, where the lint used to force them to acknowledge it. The plan may still win this argument, but it has to make it against that record.
- The adoption steps miss `.agents/rules/best-api.mdc:683-686`. That rule teaches an awaited replay that "blocks on … failure", which contradicts the new `failed` status.
- They also miss `c70bacbd4a:docs/editor-behavior/editor-protocol-matrix.md:397` (`EDIT-COMMENT-HISTORY-PENDING-001`), and the editor-behavior reconciliation that AGENTS.md requires for a change to Cmd+Z focus timing.

### 7. [nit] The migration grep misses the plugin-portal call sites
The pattern `(void|await) [^;]*history\.(undo|redo)\(` does not match `historyPortal.api.undo()`. That misses `document-state.tsx:149,151,214,223` and `authored-changes.tsx:356,365`, which the plan itself lists as call sites to migrate.

### 8. [nit] The decisive evidence logs are gitignored
`history-timing.log` and `settle-failure.log` match `*.log` (`.gitignore:91`) and are not in `eca7f8e9`. The decision-log row, the record's `references` and the plan's "Decisive evidence" section all cite them. The `.probe.ts` files are committed, so the result can be reproduced, but the plan should say so.

### 9. [nit] The finalizer can't promise to clear `pending` on "any throw"
Clearing `pending` is itself an `editor.update`, so a transaction guard or validation throw can repeat on that update. Risk 3 mentions this, but the step still promises "clears `pending` on any throw". Specify a fallback or narrow the claim.

Not run because they write files: typechecking the proposed types in a scratch file, rerunning the probes, and a mounted run with a synchronous owner under the Phase 1 adapter.
