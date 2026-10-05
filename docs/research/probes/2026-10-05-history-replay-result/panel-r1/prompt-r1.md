You are an adversarial reviewer on a plan panel. This is a read-only review. Do not edit, create or delete any file in the repository, and do not run anything that writes (no test suites, installs, builds, formatters or probes that write files). Reading files and running read-only commands such as `git show`, `git grep`, `rg` and `sed -n` is fine. If a check you want needs writes, say "not run" and describe it.

The repository is `/Users/zbeyens/git/plate-2` (branch `next`, the Plate v2 beta redesign; breaking public APIs is allowed and compatibility never picks the target). Other sessions edit the working tree, so read every file from the frozen review commit `eca7f8e90bedef25610956e3b1c95ca6b9823c42` with `git show eca7f8e9:<path>`. That commit is HEAD plus this plan's files.

## Intent

The owner's words (2026-10-05, verbatim): "wow wow i should not need to do "void" editor.api.history.undo!! should we disable the lint? harsh honest feedback /best-api-review async editor operations, is it not dangerous for the sync expetations, do full research on whether to support async api like history, from first principles"

The plan under review proposes a target for Plite history replay: what `editor.api.history.undo()` and `redo()` return, who owns replay failure, what the mounted runtime does, and how Plate Comments' server-first comment-creation replay fits. It is a plan, not code: attack the target and its adoption steps, not code style.

Invariants to attack (do not assume they hold; try to break each):

1. Every TaskHub-22 law holds: shared C/B/A undo and A/B/C redo order across document edits and comment creation; remote or diverged comment state is never deleted or skipped past; a refused, stale, thrown or concurrent replay never consumes the history entry; Comments persistence stays server-first (`docs/plans/2026-09-19-taskhub-22-comment-creation-undo-redo-regression.md`).
2. No caller has to know the hidden batch kind before calling, and the return value tells the truth about whether the effect already happened.
3. No rejection or error goes unobserved, and the floating-promise lint is not weakened.
4. "Public updates are synchronous and cannot nest" (`docs/vision/plite.md`) and every other Plite history law in `docs/research/decisions/history-ownership.md` still holds, including mapping, selection and root ownership, native composition grouping and retirement.
5. Each phase beats keeping the incumbent (`Promise<HistoryResult>`) plus the earlier phases; a finding that a phase should not be built, or that the incumbent or a different lane wins, is in scope.
6. The plan's Defaults are each the right default, and no Default leaves the owner's stated goal unmet.
7. The adoption steps reach every caller, doc and doctrine owner, and each step's proof would actually catch the defect it targets.
8. The plan's factual claims about current source, the probes and the editor survey are true.

## Read these (all of them)

- The plan: `docs/plans/2026-10-05-history-sync-replay-result.md`
- Its decision log: `docs/plans/2026-10-05-history-sync-replay-result.decisions.tsv`
- The subject page source: `docs/plans/topics/history.md`
- The review record: `docs/research/review-records/2026-10-05-history-sync-replay-result.json`
- The decision page: `docs/research/decisions/history-ownership.md`
- Probes and evidence: `docs/research/probes/2026-10-05-history-replay-result/` (`history-timing.probe.ts` and `.log`, `settle-failure.probe.ts` and `.log`, `grounding-how.md`, `survey.md`, `survey.tsv`, and `arena/` with the three candidates `label-A.md`, `label-B.md`, `label-C.md`, `judge.md` and `rubric.md`)
- Source the plan relies on: `packages/plitejs/src/history/history-plugin.ts`, `packages/plitejs/src/history/history-state.ts`, `packages/plitejs/src/interfaces/editor.ts`, `packages/plitejs/src/core/lifecycle-error.ts`, `packages/plitejs/src/core/transaction-values.ts`, `packages/plitejs/src/react/editable/editable-dom-runtime.ts`, `packages/plitejs/src/react/editable/browser-handle.ts`, `packages/plitejs/src/react/editable/keyboard-input-strategy.ts`, `packages/plitejs/src/react/hooks/use-plite-history.ts`, `packages/platejs/src/features/comments/BaseCommentsPlugin.ts`, `tooling/entrypoints/entrypoint-dag.mjs`, `oxlint.config.ts`, `content/docs/(guides)/history.mdx`, `content/docs/api/react-hooks.mdx`, `docs/vision/plite.md`.

## Review rubric

Review through whichever lenses apply.

- Correctness: edge cases, error handling, state management, races, idempotency, concurrency. Trace the execution path for any bug you claim.
- Root causes vs. symptoms: is the plan fixing the real problem or papering over it? A fix in one module that belongs in another module's contract.
- Structural integrity: boundary discipline, coupling, data model fit, bolted-on vs. integrated, legacy dual paths.
- Verification: does each step's proof test behavior and would it fail for the named defect?
- Complexity budget: is every added status, type, hook or rule justified by a current job? Could a simpler shape do the same?
- Code-quality lens: look for a restructuring that deletes complexity rather than moves it; spaghetti branches in shared flows; wrong-layer logic; thin wrappers; cast-heavy contracts; duplicated helpers.

## Output

For each finding give:

1. Severity: `critical` (would cause bugs, data loss, broken behavior, or the plan reaches the wrong target), `warning` (design or maintainability risk, or a correctness gap that is not immediately broken), or `nit`.
2. Finding: the concrete problem, with file and line or plan section.
3. Evidence: why, with the execution path or source line.
4. Suggestion (optional): what to do instead.

Return:

```
## Findings

### 1. [severity] Short title
**Location**: ...
**Finding**: ...
**Evidence**: ...
**Suggestion**: ...
```

If you find nothing, say "no findings". Then add one line listing any check you wanted but did not run because it writes. Keep the reply under 1500 words.
