You are an adversarial reviewer on a code panel. This is a read-only review. Do not edit, create or delete any file in the repository, and do not run anything that writes (no test suites, installs, builds, formatters, typechecks that emit, or probes that write files). Reading files and running read-only commands such as `git show`, `git diff`, `git grep`, `rg` and `sed -n` is fine. If a check you want needs writes, say "not run" and describe it exactly.

The repository is `/Users/zbeyens/git/plate-2` (branch `next`, the Plate v2 beta; breaking public APIs are allowed). Other sessions edit the working tree, so read source from the frozen review commit `36edccc43f3ec3bde272bac6740ab42909bdef99` with `git show 36edccc4:<path>`. Its parent is HEAD `36c2f43170`.

## What to review

This run's own hunks, excluding other sessions' unrelated hunks in the same files:

- `docs/plans/artifacts/2026-10-05-history-sync-replay-result/task.diff`: product code, the core tests, docs, doctrine, changeset and the Plate Next version entry.
- `docs/plans/artifacts/2026-10-05-history-sync-replay-result/sweep.diff`: the mechanical caller migration across about 90 test and example files (dropping `void`/`await` before history calls, sync `act` wrappers, Comments tests reading `settled`). Several of these files carried another session's uncommitted sweep that added `void`; this run removed it again.

The approved plan is `docs/plans/2026-10-05-history-sync-replay-result.md` (read it at the frozen commit, including Defaults and the Panel gate), its decision log `docs/plans/2026-10-05-history-sync-replay-result.decisions.tsv`, and the subject `docs/plans/topics/history.md`.

Callers and entry points whose behavior the change can break; read them at the frozen commit: `packages/plitejs/src/react/hooks/use-plite-history.ts`, `packages/plitejs/src/react/editable/keyboard-input-strategy.ts`, `packages/plitejs/src/react/editable/mutation-history.ts`, `packages/plitejs/src/react/editable/external-text-runtime.ts`, `packages/plitejs/src/react/editable/browser-handle.ts`, `packages/plitejs/src/react/components/editable.tsx`, `packages/platejs/src/lib/plugins/HistoryPlugin.ts`, `packages/platejs/src/features/comments/BaseCommentsPlugin.ts`, `packages/plitejs/src/core/transaction-values.ts`, `tooling/entrypoints/entrypoint-dag.mjs`.

## Intent

The owner's words (2026-10-05, verbatim): "wow wow i should not need to do "void" editor.api.history.undo!! should we disable the lint? harsh honest feedback /best-api-review async editor operations, is it not dangerous for the sync expetations, do full research on whether to support async api like history, from first principles"

After two plan-panel rounds the owner chose Build now. The build implements the plan: `editor.api.history.undo()`/`redo()` return a synchronous `HistoryResult`; a replay that waits on an external owner returns `{ status: 'pending', settled }`; failures after the claim settle `failed`, keep the entry and report through the lifecycle error sink with a `reportError` fallback; mounted repair and callback timing stay as before.

Invariants to attack (try to break each; do not assume they hold):

1. Every TaskHub-22 law (`docs/plans/2026-09-19-taskhub-22-comment-creation-undo-redo-regression.md`): shared C/B/A undo and A/B/C redo order; remote or diverged comment state never deleted or skipped past; a refused, stale, thrown or concurrent replay never consumes the entry; Comments persistence stays server-first.
2. `settled` never rejects, and `pending()` is always cleared after an owner or settlement failure unless the clearing update itself throws.
3. No error goes unobserved and none is reported twice, on the headless path and the mounted path (`dispatchHistory`), with and without a `lifecycleErrorSink`.
4. A synchronous owner result settles inside the call with the same branch placement the four-case settlement table gives an async one; a claim observer or owner that publishes before settlement cancels mounted focus repair.
5. Mounted repair and `onHistoryReplay` timing match HEAD for document batches, and the `focusin`/`pointerdown` guards are always removed, including when the replay call throws.
6. The migration reaches every caller, test, doc and doctrine owner, changes no test's meaning beyond the new contract, and leaves no `await` or `void` on a history call outside callers that wait on `settled`.
7. The public types are exactly what the plan promised, are exported from the root entrypoint, and no import path that a consumer used for `HistoryResult` or `HistoryApi` is broken without the plan saying so.

## Review rubric

- Correctness: trace execution paths for any bug you claim, including activation retirement, history replacement or restore while pending, a redo claim detached by an edit, and reentrancy from subscribers.
- Root causes vs. symptoms; structural integrity; legacy dual paths.
- Verification: would each new or changed test fail for its named defect? Is any test weakened?
- Complexity budget and code quality: anything added without a current job, any duplicated logic, any wrong-layer logic.

## Output

For each finding: severity (`critical`, `warning` or `nit`), location (file and line at the frozen commit), the concrete problem, evidence with the execution path or source line, and an optional suggestion.

```
## Findings

### 1. [severity] Short title
**Location**: ...
**Finding**: ...
**Evidence**: ...
**Suggestion**: ...
```

If you find nothing, say "no findings". End with one line listing any check you wanted but did not run because it writes. Keep the reply under 1500 words.
