# plite history control api execution

Objective:
Execute the accepted Plite history-control API cut: remove public
`editor.api.history.run`, expose explicit `tx.history.*` and
`editor.update.history.*` controls, update docs/tests, and prove focused
packages green.

Goal plan:
docs/plans/2026-07-02-plite-history-control-api-execution.md

Completion threshold:
Done when stale public history API references are gone from Plite docs/README,
history tests cover skip/merge/newBatch direct controls, Plite history/react
typechecks pass, Core typechecks pass, docs parity passes, and the autogoal
checker passes.

Verification surface:
Focused package tests and contracts for `@platejs/plite-history`; typechecks for
`@platejs/plite-history`, `@platejs/plite-react`, and `@platejs/core`; docs
source parity for `www`; source grep for stale public `editor.api.history`.

Constraints:
No commit or push. No public compat alias. Keep low-level history metadata only
for substrate/internal callers that cannot require the history extension.

Boundaries:
Allowed files were Plite history source/tests/README, Plite React type
contracts, Plite docs, and Core type contracts touched by the API cut.
Core runtime source stayed on low-level metadata where history is optional.

Blocked condition:
Blocked only if the new history-control API requires a larger Plite transaction
architecture change than can be proven with focused history/core type and
contract tests. That did not happen.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used accepted `plite-plan` decision from `docs/plans/2026-07-02-plite-history-control-api.md`. |
| Active goal checked or created | yes | Active goal created for this execution lane. |
| Source of truth read before edits | yes | Read history extension, history contracts, React type contract, Core node-id, and Plite docs. |
| Live repo grounding needed | yes | All implementation and proof commands ran in `/Users/zbeyens/git/plate-2`. |

Work Checklist:
- [x] Remove public `editor.api.history.run` implementation from `@platejs/plite-history`.
- [x] Add explicit `tx.history.skip`, `tx.history.merge`, `tx.history.newBatch`.
- [x] Add direct `editor.update.history.skip`, `editor.update.history.merge`, `editor.update.history.newBatch` type coverage.
- [x] Update Plite history README and docs to teach only current API.
- [x] Update Plite React and Core type contracts away from `api.history`.
- [x] Preserve low-level metadata for internal/substrate callers where the history extension is optional.
- [x] Repair skipped non-main split undo/redo contract exposed by the new direct helper.
- [x] Run focused package tests, explicit history contracts, typechecks, docs parity, and stale API audits.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused tests/typechecks/docs/audit. | Commands recorded in Verification evidence. |
| Plite source/package/public API claim | yes | Prove with tests and typechecks. | Plite history tests/contracts and typechecks passed. |
| Docs changed | yes | Run docs parity. | `pnpm --filter www check:docs` passed. |
| Core type surface changed | yes | Run Core typecheck. | `pnpm --filter @platejs/core typecheck` passed. |
| Autoreview for uncommitted implementation changes | no | Not requested for this focused execution packet. | N/A; no review skill invoked. |
| Final user-review handoff | yes | Summarize changed list, proof, and risk. | Final response pending. |
| Goal plan complete | yes | Run autogoal checker. | Pending final checker command. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read | complete | Found remaining `history.run` in docs/tests/contracts. | API cut |
| API source cut | complete | Removed `HistoryControlApi` / `HistoryRunOptions` public API and added tx controls. | tests |
| Test and docs migration | complete | README/docs/contracts moved to `tx.history` / `editor.update.history`. | verification |
| Regression repair | complete | Added narrow historic undo no-op guard for already-normalized single split batch. | verification |
| Verification | complete | Focused tests/typechecks/docs/audits run. | final handoff |

Scorecard:
| Dimension | Score | Evidence |
|-----------|------:|----------|
| Public API clarity | 0.96 | Public docs and README no longer mention `editor.api.history`. |
| Type safety | 0.94 | Plite history/react/Core typechecks pass. |
| Regression coverage | 0.95 | 70 explicit history contracts plus package smoke pass. |
| Boundary discipline | 0.92 | Core history-optional internal path kept metadata instead of unsafe `tx.history` dependency. |

Decision brief:
Chosen API:
- `tx.history.skip()`, `tx.history.merge()`, `tx.history.newBatch()` for active transactions.
- `editor.update.history.skip(fn)`, `.merge(fn)`, `.newBatch(fn)` for one direct controlled update.
- `editor.update.history.undo()` and `.redo()` stay as direct command helpers.

Rejected:
- `editor.api.history.run(...)`: ambient API command surface; cut.
- `editor.update(fn, { history: "skip" })`: hides history policy in options; rejected.
- Casting Core node-id to `tx.history`: wrong because node-id can run without the history extension.

Verification evidence:
- `pnpm --filter @platejs/plite-history test` passed.
- `pnpm --filter @platejs/plite-history exec bun test --preload ../../config/plite-source-test-setup.ts ./test/history-contract.ts ./test/integrity-contract.ts ./test/document-state-history-contract.ts` passed, 70 tests.
- `pnpm --filter @platejs/plite-history typecheck` passed.
- `pnpm --filter @platejs/plite-react typecheck` passed.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter www check:docs` passed.
- `rg -n "api\\.history|history\\.run\\(|editor\\.api\\.history|isSaving\\(|isMerging\\(" packages/plite-history packages/plite-react packages/core/src packages/core/type-tests content/docs/plite packages/plite-history/README.md` returned no matches.
- Browser docs route proof was attempted with `pnpm --filter www dev --port 3002`
  and blocked by unrelated `apps/www` compile errors from stale Plate package
  imports such as `withLink`, `withTable`, `createTSlatePlugin`,
  `toTPlatePlugin`, `useFocused`, and `useReadOnly`.

Reboot status:
Current packet complete pending final handoff. Continue with broader Plate/Core
cleanup only after user asks; no hidden follow-on work is required for this
history-control API cut.

Open risks:
Low for the history-control API. Low-level `metadata.history` remains in Plite
internals/tests and a history-optional Core normalizer. That is intentional
substrate, not public API. Browser route proof is blocked until unrelated
Plate package compile drift is cleaned up in `apps/www`.
