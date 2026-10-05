# Thermo-nuclear review: synchronous history replay result

Verdict: approve after one applied simplification. Detail: 01_history.md.

The diff deletes more than it adds (147 insertions, 149 deletions across five files). It removes the async `replayNow` path, the `Promise.resolve` wrappers, the mounted runtime's `pending` re-read and version arithmetic, the hand-copied `ModelHistoryResult` union, two `as unknown as` casts and a dead `replayBatch` parameter. No file crosses 1,000 lines: `history-plugin.ts` was already 1,232 lines at HEAD and is 1,231 now, and `editable-dom-runtime.ts` shrank from 1,430 to 1,417.

Applied: `settle` and `fail` each wrote the same blocked-settlement update; one local `settleBlocked` now owns it.

Accepted with reasons. `reportEditorLifecycleError` gains a four-line `history` branch for the `reportError` fallback. Making `reportError` the fallback for every source would remove the branch, but it changes how observer failures surface in browsers and test runners, so it stays open work on the subject page. `EditorHistoryReplayReceipt.claimVersion` is optional and the runtime reads `claimVersion ?? version`; a receipt discriminated by replay kind would remove the fallback, but the receipt is a private bridge with one consumer, so the cost exceeds the gain now.
