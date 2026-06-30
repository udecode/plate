# plite try catch audit

Objective:
Audit `packages/plite` try/catch usage and remove broad exception-control-flow where explicit guards already exist.

Goal plan:
docs/plans/2026-06-27-plite-try-catch-audit.md

Template:
docs/plans/templates/architecture-cleanup.md

Cleanup source:
- type: user prompt
- id / link: chat
- title: Plite try/catch audit
- requested surface: `packages/plite`
- cleanup intent: keep only necessary `try/catch` and `try/finally`
- acceptance criteria: source audit complete, unnecessary catches removed, behavior-safe tests and `check:core` pass

First checkpoint:
- Explicit requirement: inspect the many `try/catch` sites in `packages/plite`.
- Scope: Plite package source first; tests audited for obvious proof debt.
- Non-goal: do not remove rollback/finally guards that protect runtime state.
- Success: broad catches around expected query misses are replaced with explicit guards.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence / cleanliness score: 0.78
- improvement loop: classify source sites, patch safe query catches, repair one orphan contract test, run focused and broad proof
- final score / loop closure: 0.95

Completion threshold:
- Every source `try/catch` / `try/finally` in `packages/plite/src` is classified.
- Broad catches that masked expected missing-path query misses are removed.
- Remaining source sites are justified as cleanup, rollback, registration rollback, generator cleanup, profiler cleanup, or debug formatting fallback.
- Focused query tests, standalone repaired contract test, typecheck/lint, and `check:core` pass.

Verification surface:
- `rg -n "\btry\b\s*\{|\bcatch\b\s*\(" packages/plite/src -g '*.{ts,tsx}'`
- focused Plite helper/query tests
- standalone `state-tx-public-api-contract.ts`
- `pnpm --filter @platejs/plite typecheck`
- `pnpm --filter @platejs/plite lint:fix`
- `pnpm check:core`

Constraints:
- Do not change public API.
- Do not change visible behavior.
- Preserve safe query-miss behavior where tests require `undefined` or `''`.
- Keep malformed paths loud.
- Keep rollback and cleanup guards.

Boundaries:
- Source of truth: `packages/plite/src`, Plite query/helper tests, root `VISION.md`, `docs/vision/common.md`, `docs/vision/plite.md`.
- Allowed edit scope: Plite source query helpers, Plite tests, goal plan.
- Plite / Plate boundary: Plite-only packet; no Plate product logic.
- Public API boundary: unchanged.
- Browser surface: N/A.
- Package/API surface: no exported type or package boundary changed.
- Non-goals: broad runtime redesign, public API rename, browser proof, changeset.

Output budget strategy:
- Search output scoped to `packages/plite/src` and focused test files.
- High-volume test output capped by tool budgets; final evidence records pass/fail and key counts.

Blocked condition:
- Block only if a catch protects observable query-miss behavior and no explicit guard exists. That did not happen for the patched sites.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A
- goal_status: complete

Current verdict:
- verdict: keep packet
- cleanliness confidence: high
- next owner: Plite package owner
- keep / revert / quarantine call: keep
- reason: four broad catches removed, remaining catches are justified owner guards, proof is green

Completion rule:
- Complete only after all checklist rows and completion gates below are resolved and check-complete passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint records the exact try/catch audit requirement. |
| Timed checkpoint parsed | no | No duration requested. |
| `architecture-cleanup` loaded | yes | Read `.agents/skills/architecture-cleanup/SKILL.md`. |
| Active goal checked or created | yes | Created this plan with the architecture-cleanup template. |
| Source of truth read before analysis | yes | Read Plite source sites and tests. |
| VISION fit gate read | yes | Read `VISION.md`, `docs/vision/common.md`, and `docs/vision/plite.md`. |
| Plite / Plate boundary selected | yes | Plite-only cleanup. |
| Cleanup surface selected | yes | `packages/plite/src` and related tests. |
| Non-goals recorded | yes | No API, behavior, browser, or Plate product change. |
| Output budget strategy recorded | yes | Scoped `rg` and focused commands. |
| Implementation authority decided | yes | Safe behavior-neutral cleanup packet. |
| Proof strategy selected | yes | Focused helper tests, standalone contract test, typecheck/lint, `check:core`. |

Work Checklist:
- [x] First checkpoint complete: prompt requirement, scope, non-goals, stop condition, and proof surface recorded.
- [x] Source map records owner files: `editor/previous.ts`, `editor/next.ts`, `editor/last.ts`, `core/public-state.ts`, runtime cleanup owners, and tests.
- [x] Deslop inventory records broad query catches as removable exception-control-flow.
- [x] Candidate matrix ranks the named try/catch candidates.
- [x] Every candidate has a decision: simplify, keep, or repair proof.
- [x] Agent-navigation score recorded in candidate matrix.
- [x] Anti-confetti rule applied: no split accepted.
- [x] Merge/delete/inline considered: simplify won; no extraction.
- [x] VISION fit recorded: explicit guards beat catch-all masking.
- [x] Implementation packets are behavior-neutral and public-API-neutral.
- [x] Each implementation packet ends keep.
- [x] Source-owner oracle repaired: standalone state/tx contract imports fixed.
- [x] Focused proof run before broad proof.
- [x] Broad proof run after cleanup: `pnpm check:core`.
- [x] Workspace authority recorded: `/Users/zbeyens/git/plate-2`.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source audit and proof commands | Source `rg` audit, focused tests, typecheck/lint, `check:core`. |
| Source map complete | yes | Record current owners | Candidate matrix and packet ledger. |
| Deslop inventory complete | yes | Record concrete catch-all sites | Query-helper broad catches classified and patched. |
| Candidate matrix complete | yes | Rank candidates | Candidate matrix filled. |
| Agent-navigation score complete | yes | Record before/after effect | Query misses now use explicit guards instead of hidden catch blocks. |
| Anti-confetti gate | yes | Prove no split accepted | No split made. |
| Delete / merge / inline gate | yes | Record simplifications | Simplified four catches; no extraction. |
| VISION fit gate | yes | Confirm fit | Explicit runtime ownership, no aliases, no hidden masking. |
| Implementation packet gate | yes | Record keep/revert/quarantine | Packet kept after green proof. |
| Source-owner oracle gate | yes | Repair relevant proof | `state-tx-public-api-contract.ts` standalone imports fixed. |
| Public API / behavior safety gate | yes | Prove no API or behavior change | Typecheck, focused query behavior tests, `check:core`. |
| Package/API proof | yes | Run package checks | `pnpm --filter @platejs/plite typecheck`; `pnpm check:core`. |
| Browser proof | no | Record reason | No browser-visible behavior changed. |
| Final lint/check | yes | Run lint/typecheck/test gate | `pnpm --filter @platejs/plite lint:fix`; `pnpm check:core`. |
| Output budget discipline | yes | Confirm scoped output | Searches scoped; high-volume output capped. |
| Timed checkpoint | no | Record reason | No duration requested. |
| Final handoff contract | yes | Fill changed list and proof | Filled below. |
| Goal plan complete | yes | Run check-complete | Planned after this ledger patch. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read skills, vision, and source sites. | done |
| Source map | complete | Source `rg` audit. | done |
| Deslop inventory | complete | Broad query catches identified. | done |
| Candidate matrix | complete | Candidate rows below. | done |
| Cleanup packets / owner routing | complete | One safe cleanup packet plus one test repair. | done |
| Verification | complete | Focused tests and `check:core` passed. | done |
| Closeout | complete | Ledger updated. | done |

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | Strong | Missing previous sibling catches | `packages/plite/src/editor/previous.ts` | `PathApi.hasPrevious` and `NodeApi.has` cover expected miss. | Easier: no hidden catch for expected query miss. | simplify | Plite query helpers | upstream helper loss contract | simplify |
| 2 | Strong | Missing child traversal catch | `packages/plite/src/editor/next.ts` | `NodeApi.has(editor, childPath)` covers expected child miss. | Easier: child-start behavior is explicit. | simplify | Plite query helpers | query contract | simplify |
| 3 | Strong | Missing `last` location catch | `packages/plite/src/editor/last.ts` | Missing paths are expected safe query miss; malformed paths should still throw. | Easier: one local guard explains behavior. | simplify | Plite query helpers | upstream helper loss contract | simplify |
| 4 | Strong | `state.text.string` catch-all | `packages/plite/src/core/public-state.ts` | `hasLocationPath` already exists and preserves stale path as `''`. | Easier: safe string query no longer masks arbitrary runtime errors. | simplify | Plite state view | query contract | simplify |
| 5 | Strong | Runtime cleanup / rollback guards | `public-state.ts`, `editor-extension.ts`, `editor-schema.ts`, middleware files | They restore depth/root/context, roll back transactions, or undo failed extension/schema registration. | Same but justified: required runtime safety. | keep | Plite runtime | `check:core` | keep |
| 6 | Worth keeping | Debug formatting fallback | `utils/format-debug-value.ts` | Accepts unknown values and must not throw while formatting diagnostics. | Same but justified: defensive boundary. | keep | Plite diagnostics | source audit | keep |
| 7 | Strong | Orphan standalone state/tx proof | `packages/plite/test/state-tx-public-api-contract.ts` | Direct focused run exposed missing internal helper imports. | Better: proof file can run by itself. | repair proof | Plite tests | standalone file run | simplify |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Result | Next |
|--------|--------|-------|-------|-------|--------|------|
| Query miss guards | simplify | Plite query helpers | `previous.ts`, `next.ts`, `last.ts`, `public-state.ts` | focused helper/query tests, typecheck, `check:core` | keep | none |
| Standalone contract proof | repair proof | Plite tests | `state-tx-public-api-contract.ts` | standalone test passed | keep | none |

Cleanup counts:
- delete: 0
- merge: 0
- inline: 0
- simplify: 5
- split: 0
- keep: 22 source guard groups
- defer: 0
- reject: 0
- plan: 0

Changed list:
- code/runtime/API: `packages/plite/src/editor/previous.ts`, `packages/plite/src/editor/next.ts`, `packages/plite/src/editor/last.ts`, `packages/plite/src/core/public-state.ts`
- tests/oracles: `packages/plite/test/state-tx-public-api-contract.ts`
- docs/plans: `docs/plans/2026-06-27-plite-try-catch-audit.md`
- skills/workflow: none
- reverted/quarantined: none

Needs review:
- None. Remaining source catches are runtime-safety guards, not style debt.

Verification evidence:
- `rg -n "\btry\b\s*\{|\bcatch\b\s*\(" packages/plite/src -g '*.{ts,tsx}'` audited remaining source sites.
- `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/upstream-slate-helper-loss-contract.ts ./test/query-contract.ts ./test/read-update-contract.ts` passed: 104 tests.
- `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/state-tx-public-api-contract.ts` passed: 21 tests.
- `pnpm --filter @platejs/plite typecheck` passed.
- `pnpm --filter @platejs/plite lint:fix` passed with no fixes after final edit shape.
- `pnpm check:core` passed.

Open risks:
- `state-tx-public-api-contract.ts` was not part of the default Plite discovery used by `check:core`; it now runs standalone, but the broader test discovery policy may still need a separate cleanup if we want all `*-contract.ts` files in default package tests.

Final handoff contract:
- Source roots inspected: `packages/plite/src`, `packages/plite/test`.
- Candidate count and top recommendation: 7 candidates; top recommendation was replacing broad query catches with explicit path guards.
- Cleanup counts: 5 simplify, 22 keep groups, 0 split.
- Agent-navigation score changes: missing-path behavior is now readable at the guard site instead of hidden in catch blocks.
- Packets applied with keep/revert/quarantine result: two packets, both keep.
- Proof commands/source audits: listed above.
- Rejected/deferred candidates: none.
- Needs-review list: none.
- Residual risks: default test discovery may skip some `*-contract.ts` files.
- Next owner and exact first command/file: if tightening discovery, inspect `packages/plite/package.json` and `tooling/scripts/check-core.mjs`.

Timeline:
- 2026-06-27 Architecture-cleanup goal plan created.
- 2026-06-27 Source try/catch audit completed, cleanup applied, proof green.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Keep only necessary Plite try/catch usage. |
| What have I learned? | Most source sites are necessary cleanup/rollback/finally guards; four broad query catches were unnecessary and are removed. |
