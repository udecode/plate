---
review_scopes:
  - history
review_basis:
  - 2026-09-23-history-session-effect-authoring-final
work_kind: implementation
---

# Session history effect authoring

Status: Complete

Objective:
Make a fallible session-history replay one impossible-to-split `history` value,
adopt the shape across Plite and Plate Comments, remove the old public split API,
and preserve the accepted replay lifecycle and branch behavior.

Goal plan:
`docs/plans/2026-09-23-session-history-effect-authoring.md`

Template:
`docs/plans/templates/task.md`

Task source:
- The user accepted the final Best API review and authorized full execution.
- Governing review: `docs/research/review-records/2026-09-23-history-session-effect-authoring-final.json`.
- Governing decision: `docs/research/decisions/history-ownership.md`.

Completion threshold:
- `defineEffect` accepts local session replay only as `history: { replay }`.
- The normalized descriptor preserves that discriminant and rejects shared session
  replay in both TypeScript and runtime validation.
- The `history: "session"`, sibling `historyReplay`, and
  `EditorEffectHistoryPolicy` surfaces are deleted without aliases.
- Plate Comments and every affected Plite contract use the new shape with unchanged
  replay behavior.
- Public exports/reference data, release note, durable decision, and review ledger
  reflect the shipped API.
- Focused type, runtime, React, Yjs, package, registry, and lint proof pass.

Verification surface:
- Plite effect types and authoring runtime: `packages/plitejs/src/interfaces/editor.ts`
  and `packages/plitejs/src/core/transaction-values.ts`.
- Registry/history runtime: `packages/plitejs/src/core/plugin-registry.ts` and
  `packages/plitejs/src/history/**`.
- Production consumer: `packages/platejs/src/features/comments/BaseCommentsPlugin.ts`.
- Existing History, React, Yjs, package-type, and registry generation commands.

Constraints:
- Preserve the accepted one-replay-at-a-time lifecycle, pending-state API,
  branch settlement table, blocked result, and private request-to-claim map.
- Keep `EditorEffectHistoryReplayResult<TValue>` public for extracted replay owners.
- The replay callback receives public `Editor`; no new public session-history noun,
  factory, registry, or compatibility alias.
- Work in the authorized `next` checkout. No commit, push, PR, or publication.

Boundaries:
- Own the Plite descriptor/type/runtime contract, Plate Comments adoption, directly
  affected tests, public exports/reference generation, changeset, and ledger closure.
- Do not redesign History replay scheduling, Comments persistence, blocked-head
  policy, or collaboration transport.

Timing:
N/A.

Blocked condition:
Only an unavailable required tool or an irreconcilable behavior conflict with the
accepted history decision blocks completion.

Task state:
- current_phase: complete
- next: none

Work Checklist:
- [x] Capture the accepted outcome, scope, authority, and hard laws.
- [x] Inspect the current type, runtime, export, consumer, and proof owners.
- [x] Encode local session replay as one discriminated `history` value.
- [x] Migrate History, Comments, and all affected tests; delete old names.
- [x] Regenerate barrels/reference output and add the required release note.
- [x] Run focused and closure proof; repair in-scope failures.
- [x] Reconcile durable teaching and close the review-ledger execution.
- [x] Run final lint fixing and reconcile every original acceptance criterion.

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Session replay authoring | History decision and final review | `history: { replay }` for local effects; `"push" | "skip"` for shared effects | Independent `historyReplay`, bare callback, named session type/factory | Type contract plus package typecheck |
| Runtime representation | Plite effect descriptor | Freeze a normalized nested replay object and validate forged/erased descriptors | Preserve caller object identity or trust TypeScript alone | Registry and effect runtime contracts |
| Replay lifecycle | Accepted history plan | Preserve pending state, one replay at a time, and request-to-claim mapping | Queue, editor lock, or Comments-owned history | Existing History/React/Yjs suites |
| Durable teaching | Existing type-system and first-principles doctrine | Keep the product-specific choice in the History decision; no doctrine bump unless implementation reveals a reusable new law | Add a broad rule for one local API shape | Final doctrine scan and Plate Next validation |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Public type contract | passed | Compile valid local shape and invalid shared/split combinations | `pnpm --filter plitejs typecheck`, including `test/effect-authoring-contract.ts`, passed 13/13 partitions |
| Runtime behavior | passed | Run affected History and registry suites | Core passed 1,686 tests; History passed 150 tests; strict package gate passed 159 tasks |
| React integration | passed | Run affected Plite React history suites | Focused React files passed 36 tests; repaired runtime contract passed 27 tests after the final focus guard |
| Collaboration | passed | Run the affected Yjs history contract | Yjs partition passed 274 tests |
| Plate adoption | passed | Typecheck/test Plate Comments owner | Plate typecheck passed 88/88 partitions; focused Comments suites passed 61 tests |
| Public package/reference | passed | Regenerate barrels and www registry/reference data | `pnpm brl`, package builds, `build:source`, `build:registry`, `api-reference`, and `api-reference:check` passed |
| Release and doctrine | passed | Add changeset; verify teaching/Plate Next state | Existing Plite History changeset includes the authoring API; Plate Next v235 validates and generated mirrors are current |
| Repository hygiene | passed | Final lint fix and diff checks | `pnpm lint:fix`, removed-surface scan, and `git diff --check` passed |
| Review execution | passed | Record and render immutable ledger execution | `2026-09-24-history-session-effect-authoring-implementation`; ledger refresh, render, and check passed |

Verification evidence:

- `pnpm check:plite` passed the strict gate: 98 typecheck tasks, 159 package
  tasks, 256 tooling contracts, 25 benchmark contracts, 55 benchmark targets,
  public package types/builds, and 748 Chromium tests across 70 bounded batches;
  7 browser cases remained intentionally skipped.
- Exact browser replays passed for `forced-layout paste-normalize-undo` and the
  two multi-root focus cases before the aggregate Chromium run.
- `pnpm --filter plitejs test:partition:core -- effect-registry.test.ts`,
  `test:partition:history`, `test:partition:yjs`, the focused React contracts,
  and the focused Plate Comments suites all passed.
- The API/reference scan finds no `EditorEffectHistoryPolicy`, sibling
  `historyReplay`, or `history: "session"` surface outside historical records.
- `pnpm --filter www check:docs`, `api-reference:check`, Plate Next validation,
  final lint fixing, and diff hygiene passed.

Findings and remaining work:

- `EditorEffectType` and `defineEffect` now express local fallible replay as one
  `history: { replay }` value. Shared effects cannot select that branch, and
  runtime validation rejects malformed or forged JavaScript descriptors.
- Plate Comments and all History, React, persistence, and collaboration fixtures
  use the same shape. The old literal, sibling callback, and exported policy type
  have no aliases.
- Strict Chromium proof exposed two pre-existing regressions in the accepted
  replay work. Open multiline paste reused a required prefix shell in later
  positional slots, and disabling the initiating undo control could blur it before
  focus repair. Slice fitting now validates positional grammar and adapts only open
  contextual shells; mounted history presentation now invalidates only on a later
  focus or pointer interaction. Focused contracts and the full browser matrix prove
  both repairs.
- Permanently blocked-head recovery remains the separate decision already named by
  the governing History record. No release or publication was performed.

Final handoff:

- Outcome and owning fix: Plite owns one discriminated history value, normalized
  and frozen at effect definition; History consumes it directly and Plate Comments
  supplies its external replay owner there.
- Proof and limits: the strict Plite gate and focused Plate/docs/reference checks
  pass. Physical-device IME behavior and a blocked-head recovery action remain
  outside this API cut.
- Local / integrated / published state: complete in the authorized `next` checkout;
  no commit, push, PR, release, or deployment was performed.
- Next action or completion: complete.

Timeline:

- 2026-09-23: Plan created from the accepted final History API review.
- 2026-09-24: Implemented the API cut, repaired two strict-browser regressions,
  completed package/reference/doctrine adoption, and passed closure proof.

Open risks:

- `EditorEffectType` is a widely indexed public descriptor; its discriminated union
  must preserve existing indexed-access inference for collaboration options.
- History persistence must exclude object-valued replay effects exactly as it excluded
  the old session literal.
