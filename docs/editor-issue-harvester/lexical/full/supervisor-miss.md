# Supervisor Miss: Matrix-Only Closure

The first all-issues Lexical harvest stopped at cluster coverage and a
create/refactor/defer matrix. That was not closure.

Failure:

- 2741 Lexical issues were classified.
- 1905 relevant issues still had no per-issue test audit.
- Cluster rows named likely owners, but did not prove that any specific issue
  was already covered or newly tested.

Correct closure:

- Every relevant issue needs a checkmark in `issue-closure-ledger.tsv`.
- A checkmark requires one of:
  - `covered-by-existing-test` with exact file, line, test name, and focused
    verification command.
  - `test-written` with exact file, line, test name, and focused verification
    command.
  - `plate-owned-covered` with the Plate owner and exact proof.
  - `deferred-with-owner` with a real owner and why no Slate v2 test belongs in
    this loop.
  - `invalid-skip` only for irrelevant or non-portable issues.

Current repair:

- `slate-auto`, `editor-test-harvester`, and `slate-north-star` now state
  that "all issues" means issue-by-issue closure, not cluster-level summary.
- `issue-closure-ledger.tsv` is the closure queue.
- `issue-closure-overrides.json` records durable issue-level closures.
- Lexical #7 is closed as `test-written` by
  `.tmp/slate-v2/packages/slate/test/text-units-contract.ts:259`.
