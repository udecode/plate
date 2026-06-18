# Slate v2 Insert Fragment Explicit Target Ralplan

Date: 2026-05-07

## 1. Current Verdict

Ready for Ralph.

The next lane is core `insertFragment` explicit target and caret placement:
`#5412` and `#5429`.

This beats `#5080`, `#3891`, and `#5129` as the immediate next move:

- `#5412` is `ready-now`, core-only, and points at a real transform regression:
  explicit `insertFragment({ at })` must not ignore the provided target.
- `#5429` is the sibling caret-placement case: inserting into an empty node must
  leave selection after the inserted content.
- `#5080` is a clean query-order bug, but it is isolated and does not advance
  the fragment/clipboard cluster already carrying open PR debt.
- `#3891` and `#5129` are API design requests, not direct red-test targets.

## 2. Intent And Boundary

Intent: close the next high-confidence core transform regression without
turning fragment insertion into a broad paste-policy rewrite.

Desired outcome:

- explicit `insertFragment(..., { at })` writes at the supplied location even
  when current selection points elsewhere;
- fragment insertion into an empty text block leaves a deterministic collapsed
  selection after the inserted content;
- related paste/fragment rows are classified without speculative closure.

In scope:

- `packages/slate/src/transforms-text/insert-fragment.ts`;
- package tests under `packages/slate/test/`;
- issue ledger, fork dossier, and PR reference accounting.

Non-goals:

- no public replace/rewrap transform for `#5129`;
- no public multi-node remove-range helper for `#3891`;
- no `Editor.nodes({ reverse: true })` traversal fix for `#5080`;
- no broad clipboard customization or product paste policy for `#3557`/`#4542`;
- no browser closure unless Ralph adds browser proof later.

Decision boundary:

- Ralph may patch core `insertFragment` target or selection behavior after a
  failing package test.
- Ralph may claim `Fixes #5412` only after explicit-target package proof lands.
- Ralph may claim `Fixes #5429` only after empty-node insertion caret proof
  lands.
- Keep `#5089`, `#4542`, `#5151`, `#3557`, and `#3155` related or improved
  unless exact repro proof lands.

## 3. Decision Brief

Principles:

- Explicit target options must beat ambient selection.
- Core insertion must publish deterministic model selection.
- Clipboard/browser policy cannot hide a core transform bug.
- Public API should stay Slate-close: fix the existing transform contract
  before inventing helper APIs.

Drivers:

- The issue corpus marks `#5412` and `#5429` `ready-now`.
- Current source already routes through `tx.resolveTarget({ at: options.at })`,
  so the likely failure is a narrow target or post-insert selection path.
- Existing tests cover omitted transaction targets, rich fragment shape, and
  target-block preservation, but not the exact explicit-target regression.

Options:

1. Patch `insertFragment` directly after red package tests.
   - Wins because it owns the current transform behavior.
   - Risk is overfitting one issue while leaving fragment selection inconsistent.
2. Add a broader transform target abstraction.
   - Too much for this lane. The transaction target resolver already exists.
3. Treat this as DOM clipboard behavior.
   - Wrong owner. `#5412` is a core `Transforms.insertFragment(..., { at })`
     regression.

Chosen: option 1, with tests that cover both explicit target insertion and
empty-node caret placement.

## 4. Live Source Grounding

Current source:

- `packages/slate/src/transforms-text/insert-fragment.ts` owns
  `insertFragment`.
- `applyInsertFragment` resolves `options.at` through
  `tx.resolveTarget({ at: options.at })`.
- `packages/slate/src/core/public-state.ts` returns explicit
  `options.at` unchanged from `resolveTarget`.
- `insert-fragment.ts` has several fast replacement paths before the legacy
  split/insert path, then only performs final `transforms.select(end)` when
  `!options.at`.
- `packages/slate/test/primitive-method-runtime-contract.ts` covers
  omitted transaction targets for `tx.fragment.insert`, not the explicit `at`
  issue.
- `packages/slate/test/clipboard-contract.ts` covers many fragment
  replacement shapes, including target-block preservation, but not `#5412`.

Live current shape exists. This is not a fake migration from old Slate; it is a
current v2 transform contract gap.

## 5. Issue Ledger Accounting

Target fixed claims after Ralph proof:

- `#5412`: selected active target. `Fixes` only after package proof shows
  explicit `at` is honored.
- `#5429`: selected active target. `Fixes` only after package proof shows empty
  node insertion places selection after inserted content.

Related rows:

- `#5089`: related. Multi-block fragment shape pressure, but exact closure needs
  a middle-paragraph multi-block insertion proof.
- `#4542`: related. Empty-block paste policy is adjacent, but broad browser
  paste behavior is not this lane.
- `#5151`: improved by existing target-block preservation proof; exact browser
  closure remains unclaimed.
- `#3557`: related. Extension method override pressure belongs to clipboard and
  extension API design, not this core transform fix.
- `#3155`: related. Fragment non-merging policy is broader than explicit target
  correctness.

Excluded next candidates:

- `#5080`: next possible package lane for `Editor.nodes({ reverse: true })`;
  separate query-order owner.
- `#3891`: not a direct test candidate; separate API design.
- `#5129`: not a direct test candidate; separate replace/rewrap transform API.

Live gitcrawl ledger:

- `docs/slate-issues/gitcrawl-live-open-ledger.md` carries generated live issue
  fields only. Claim state is synced in this plan,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md`, and
  `docs/slate-v2/references/pr-description.md`.

## 6. Confidence Score

| Dimension                          | Score | Evidence                                                                                                                         |
| ---------------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance     |  0.90 | React is out of scope unless browser paste proof becomes necessary.                                                              |
| Slate-close unopinionated DX       |  0.94 | Existing `insertFragment` option behavior is the public contract; no new API is proposed.                                        |
| Plate/slate-yjs migration backbone |  0.90 | Operation and transaction proof stay core-owned; no Plate adapter required.                                                      |
| Regression-proof testing strategy  |  0.95 | `#5412` and `#5429` are `ready-now`; package tests can assert model children and selection.                                      |
| Research evidence completeness     |  0.91 | Current issue dossiers, candidate maps, and live v2 source were read. External systems are not needed for this local regression. |
| shadcn-style composability         |  0.90 | Not a UI lane; minimal public options avoid component/API sprawl.                                                                |

Total: 0.92.

## 7. Ecosystem Strategy

No external ecosystem source is used as decisive evidence here. That is
intentional. The failure is local to Slate's own transform contract and issue
corpus.

Mechanism to keep: transaction-owned core write with deterministic selection.

Mechanism to reject: using browser paste behavior or app override hooks as a
substitute for a correct raw core transform.

## 8. Ralph Execution Plan

1. Add the `#5412` package test.
   - Use an editor with current selection in one paragraph.
   - Call `Editor.insertFragment(editor, fragment, { at })` with `at` pointing
     somewhere else.
   - Assert inserted content lands at `at`, not current selection.
2. Add the `#5429` package test.
   - Insert a text-block fragment into an empty text block.
   - Assert the selection lands after inserted content.
3. If either test fails, patch the smallest owner in
   `insert-fragment.ts`.
4. Keep `#5089` and `#4542` as related unless the same package proof exactly
   covers their repros.
5. Sync the coverage matrix, fork dossier, PR reference, active plan row, and
   completion file.

## 9. Fast Gates

Ralph should run:

```bash
bun test ./packages/slate/test/clipboard-contract.ts -t "insertFragment"
bun test ./packages/slate/test/primitive-method-runtime-contract.ts -t "insertFragment"
bun --filter slate typecheck
bun lint:fix
```

If implementation touches browser or DOM clipboard code, add focused DOM/browser
proof before any fixed browser claim.

## 10. Pass State Ledger

| Pass                    | Status   | Evidence added                                                                                                                                                                                                                                     | Plan delta                                                                                | Next owner                            |
| ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------- |
| current-state read      | complete | Read issue maps, dossiers, coverage rows, PR reference, `insert-fragment.ts`, `public-state.ts`, and current tests.                                                                                                                                | Selected `#5412`/`#5429`.                                                                 | Ralph TDD                             |
| related issue discovery | complete | Reviewed `#5089`, `#4542`, `#5151`, `#3557`, `#3155`, `#5080`, `#3891`, `#5129`.                                                                                                                                                                   | Kept non-targets bounded.                                                                 | Ralph TDD                             |
| closure score           | complete | Score `0.92`, no dimension below `0.90`.                                                                                                                                                                                                           | Ready for execution.                                                                      | Ralph                                 |
| Ralph execution start   | complete | `.tmp/completion-checks/slate-v2-insert-fragment-at-location-execution.md`; `active goal state`.                                                                                                                                                    | Activated TDD pass for `#5412` and `#5429`.                                               | Package tests                         |
| TDD proof               | complete | `packages/slate/test/clipboard-contract.ts` adds exact package proof for explicit `insertFragment({ at })` and empty-block caret placement.                                                                                          | Current source already satisfies both issue-shaped contracts; no production patch needed. | Verification sweep                    |
| Verification sweep      | complete | `bun test ./packages/slate/test/clipboard-contract.ts -t "insertFragment"`; `bun test ./packages/slate/test/primitive-method-runtime-contract.ts -t "insertFragment"`; `bun --filter slate typecheck`; `bun lint:fix`; `bun run completion-check`. | `#5412` and `#5429` moved to `Fixes`; non-target rows remain bounded.                     | Next `slate-ralplan` bucket selection |

## 11. Final Completion Gates

The lane is ready for Ralph when:

- this plan exists;
- `.tmp/completion-checks/slate-v2-insert-fragment-at-location-ralplan.md` is
  `done`;
- coverage matrix, fork dossier, and PR reference record target and related
  issue accounting;
- `bun run completion-check` passes.

The later execution lane is done only after:

- `#5412` and `#5429` have exact package proof or explicit non-claim evidence;
- focused package tests pass;
- `bun --filter slate typecheck` passes;
- `bun lint:fix` passes;
- issue ledgers and PR reference are synced.

## 12. Execution Result

Ralph execution landed exact package proof for both active targets:

- `#5412`: `insertFragment(..., { at })` writes at the supplied target instead
  of ambient selection.
- `#5429`: `insertFragment` into an empty text block leaves selection after the
  inserted content.

No implementation patch was needed because current source already satisfied the
two contracts once the issue-shaped tests were added. Keep `#5089`, `#4542`,
`#5151`, `#3557`, and `#3155` related or improved only; this lane does not add
browser paste, method override, or multi-block middle-paragraph paste closure.
