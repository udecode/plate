# Repair remaining check failures

Status: done, all 25 local check steps pass
Playbook: bug-fix

## Brief

### What will change?

All 25 local check steps pass. The repairs cover the history test, API-reference output, clean-checkout web checks and one invalid knowledge citation.

### What could go wrong?

The timing-sensitive table test remains unchanged. The trail review used a same-family fallback after the cross-family reviewer failed. The changes remain uncommitted.

## Scope

The owner asked to fix the remaining `pnpm check` failures reported for lint, test-slow and www. The current initial run passes lint and fails test-slow and www. The intake commit is `592ec285782d1760d680cace34121fc579f125d5`.

## Main changes

The collaborative-history regression waits for the pending replay's settlement before asserting completion. The API-reference decisions account for the four public history types absent from the root entrypoint's existing exclude list. Their exclusion follows the config's existing reason that no curated reference page owns these symbols.

Registry check mode compares the committed production registry, overlays, metadata and generation marker. Normal generation still writes both production and ignored development registries. The Next configuration uses Webpack's string replacement option. Its existing test asserts the dynamic alias and the absence of aliases separately so Bun's matcher overloads typecheck.

The authored topic retains its content and drops one citation to an ignored run-local reply. Three Lexical source pages added after the aggregate run cite their tracked historical research records instead of external source paths that looked local to Plate. Their unpinned historical limits remain explicit. Pre-edit copies are saved in the run directory.

## Steps

- [x] Reproduce and classify the reported checks. Proof: `pnpm check lint test-slow www`, `base-history-a1.log` and `base-api-build-a1.log` in the run directory.
- [x] Repair the history assertion and regenerate the API manifest from an isolated fresh build. Proof: `candidate-history-a1.log` and `candidate-api-build-a1.log` in the run directory.
- [x] Diagnose the table timing failure and any failures the full gate exposes. Proof: `docs/plans/artifacts/check-failures/table-before-a1.log`, `docs/plans/artifacts/check-failures/slow-after-a1.log` and `docs/plans/artifacts/check-failures/full-a2.log`.
- [x] Run writing passes and scoped formatting, then final acceptance. Proof: writing decision rows, `docs/plans/artifacts/check-failures/candidate-www-final-a1.log` and `docs/plans/artifacts/check-failures/full-a2.log`.
- [x] Render the result page. Proof: `docs/plans/artifacts/check-failures/page-render-a1.log` and `docs/plans/artifacts/2026-10-08-check-failures.html`.
- [x] Review the late citation repair and completion scope. Proof: `docs/plans/artifacts/check-failures/citation-review/reply.txt`.

## Evidence

Initial commands and clean controls are recorded in `docs/plans/artifacts/check-failures/`. Both detached worktrees used their own offline dependency installations and copied environment files. The worktrees were removed after preserving their logs and candidate fingerprints.

## Verification

The unchanged runtime already applies remote text while a session replay is pending. The failing assertion compares the pending handle to an applied outcome instead of awaiting its settlement. The API export drift probe compares every configured entrypoint's built declarations with its include/exclude decisions.

The final full gate passes all 25 steps. The first full run passed 23 of 25 steps and exposed the final web typing errors and the ignored knowledge citation. Those failures are repaired. The isolated final web candidate also passes its entire typecheck and production build chain. Another session then added three Lexical source pages with invalid citations. Their citation-only repair passes `pnpm check knowledge`; unaffected code proofs remain valid.

## Close

The history test awaits the pending replay's settlement and preserves its assertions about remote updates. All 15 collaborative-history tests pass in the independently installed candidate. No history runtime code changed.

The API config accounts for all four missing history exports. The regenerated manifest passes the configured-entrypoint check after fresh isolated builds. Registry check mode accepts a clean checkout without ignored development output and still rejects stale committed production output. Static, dynamic and async config tests pass with supported Webpack replacement and typed assertions.

The complete local gate passes all 25 steps, including lint, type-aware lint, test-slow, core-audits, knowledge and www. Its receipt is `docs/plans/artifacts/check-failures/full-a2.log`. The clean candidate web receipt is `docs/plans/artifacts/check-failures/candidate-www-final-a1.log`. All six task code/config/generated files match the candidate exactly, recorded in `docs/plans/artifacts/check-failures/candidate-final-fingerprints.tsv`.

Both temporary worktrees were removed after their logs were saved. The authored topic's saved pre-edit copy confirms that only its ignored-file citation changed. Other sessions' work remains intact. The changes are uncommitted, and no push or CI publication was performed.

After the full run, three newly added Lexical source pages needed citation repairs. Their claims and unpinned historical limits remain intact. The final knowledge receipt is `docs/plans/artifacts/check-failures/knowledge-final-a2.log`. The knowledge gate honors its existing baseline. This run did not perform new external-editor research or a whole-corpus compliance audit.

The 14 todo items close as 11 done and 3 skipped. The skipped items are owner-controlled commits, opening an unrequested PR and workflow reflection fan-out for one-off issues already covered by the followed skills. No item is partial, blocked or open.

### Attention

Reviewed by gpt-6.1-sol, same-family fallback. The Opus invocation exited without a reply. The fallback trail reviewer found no flags in the recorded repairs and completed controls. This was a trail review, not a code panel or an exhaustive semantic audit of the generated manifest. The final aggregate check completed after that review and passed.

The supplementary same-family reviewer also found no flags in the late citation repairs and proof reuse. Historical Lexical behavior and the research corpus were outside that review.
