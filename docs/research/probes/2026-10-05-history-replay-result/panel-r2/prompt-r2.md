You are an adversarial reviewer on round 2 of a plan panel. This is a read-only review. Do not edit, create or delete any file in the repository, and do not run anything that writes (no test suites, installs, builds, formatters or probes that write files). Reading files and running read-only commands such as `git show`, `git diff`, `git grep`, `rg` and `sed -n` is fine. If a check you want needs writes, say "not run" and describe it.

The repository is `/Users/zbeyens/git/plate-2` (branch `next`). Other sessions edit the working tree, so read every file from the frozen round-2 commit `ed99668287101a779b041102c11af0ade926d055` with `git show ed996682:<path>`. Round 1 reviewed `eca7f8e90bedef25610956e3b1c95ca6b9823c42`; round 2's commit is round 1's plus the fixes.

## Scope of this round

Re-review only what changed since round 1. Get the delta with:

`git diff eca7f8e9 ed996682 -- docs/plans/2026-10-05-history-sync-replay-result.md docs/plans/topics/history.md docs/research/decisions/history-ownership.md`

Read the round-1 findings and how the lead applied them: `git show ed996682:docs/research/probes/2026-10-05-history-replay-result/panel-r1/r1-opus.md` (and `r1-astra.md`, `r1-sol.md`), and the `panel` rows in `git show ed996682:docs/plans/2026-10-05-history-sync-replay-result.decisions.tsv`. New receipts: `history-timing.txt`, `settle-failure.txt`, `settlement.ts` and `settlement.txt` under `docs/research/probes/2026-10-05-history-replay-result/`.

Attack: whether each round-1 fix actually removes its finding; whether any fix introduced a new defect or a contradiction elsewhere in the plan; and whether the new rules (split replay-failure default, claim version in History's private receipt, `reportError` fallback for a `history` lifecycle-error variant, Comments `publish` isolating listener errors, unchanged mounted timing, one phase) are each correct, needed, and proven by the step that claims them. Do not re-raise a round-1 finding the delta already fixed unless the fix is wrong.

## Intent

The owner's words (2026-10-05, verbatim): "wow wow i should not need to do "void" editor.api.history.undo!! should we disable the lint? harsh honest feedback /best-api-review async editor operations, is it not dangerous for the sync expetations, do full research on whether to support async api like history, from first principles"

Invariants to attack (do not assume they hold):

1. Every TaskHub-22 law holds (`docs/plans/2026-09-19-taskhub-22-comment-creation-undo-redo-regression.md`): shared C/B/A undo and A/B/C redo order; remote or diverged comment state is never deleted or skipped past; a refused, stale, thrown or concurrent replay never consumes the entry; Comments persistence stays server-first.
2. No caller has to know the hidden batch kind before calling, and the return value tells the truth about whether the effect already happened.
3. No rejection or error goes unobserved, and the floating-promise lint is not weakened.
4. "Public updates are synchronous and cannot nest" and every other Plite history law in `docs/research/decisions/history-ownership.md` still holds.
5. The plan beats keeping the incumbent `Promise<HistoryResult>`.
6. Each Default is the right default and none leaves the owner's stated goal unmet.
7. The steps reach every caller, doc and doctrine owner, and each step's proof would fail for the defect it targets.

Source the plan relies on: `packages/plitejs/src/history/history-plugin.ts`, `packages/plitejs/src/history/history-state.ts`, `packages/plitejs/src/interfaces/editor.ts`, `packages/plitejs/src/core/lifecycle-error.ts`, `packages/plitejs/src/core/public-state.ts` (replay receipt near 722-772), `packages/plitejs/src/react/editable/editable-dom-runtime.ts`, `packages/platejs/src/features/comments/BaseCommentsPlugin.ts`.

## Output

For each finding: severity (`critical`, `warning` or `nit`), location, the concrete problem, evidence with the source line or execution path, and an optional suggestion.

```
## Findings

### 1. [severity] Short title
**Location**: ...
**Finding**: ...
**Evidence**: ...
**Suggestion**: ...
```

If you find nothing, say "no findings". Then one line listing any check you wanted but did not run because it writes. Keep the reply under 1200 words.
