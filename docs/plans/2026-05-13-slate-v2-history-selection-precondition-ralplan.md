# Slate v2 History Selection Precondition Ralplan

Date: 2026-05-13

Status: `done`

Owner: `slate-ralplan`

Completion:
`.tmp/019e1fc0-dba0-7de1-9236-b484a144cda6/completion-check.md`

## Ralph Execution Ledger

| Time                 | Pass                                      | Owner                                  | Status   | Evidence                                                                                                                                                                                                                        |
| -------------------- | ----------------------------------------- | -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-13T05:44:53Z | `ralph-history-selection-precondition`    | `.tmp/slate-v2/packages/slate-history` | started  | Completion state set back to `pending`; continuation prompt refreshed with repo-relative gates.                                                                                                                                 |
| 2026-05-13T05:48:06Z | `ralph-history-selection-precondition`    | `.tmp/slate-v2/packages/slate-history` | complete | Added mixed-commit package red/green tests, fixed batch precondition capture, kept trailing selection ops, and passed focused package/type/browser/lint gates.                                                                  |
| 2026-05-13T06:39:00Z | `ralph-scroll-into-view-caret-regression` | `.tmp/slate-v2/packages/slate-react`   | complete | Added strict scroll-into-view Playwright row for repeated manual scroll-away, delayed undo, restored selection, and third typing target; repaired model-owned history caret ownership and passed focused browser/package gates. |

Implementation files:

- `.tmp/slate-v2/packages/slate-history/src/with-history.ts`
- `.tmp/slate-v2/packages/slate-history/test/history-contract.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/input-controller.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/mutation-controller.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/runtime-selection-engine.ts`
- `.tmp/slate-v2/packages/slate-react/src/editable/selection-controller.ts`
- `.tmp/slate-v2/playwright/integration/examples/scroll-into-view.test.ts`

Implementation proof:

- `bun test ./packages/slate-history/test/history-contract.ts --bail 1`
  - red before fix: undo restored `[0,0]@0` instead of `[0,0]@3`.
  - green after fix: `26 pass`.
- `bun test ./packages/slate/test/commit-metadata-contract.ts ./packages/slate/test/collab-history-runtime-contract.ts --bail 1`
  - `14 pass`.
- `bun --filter slate-history typecheck`
  - exited `0`.
- `bun --filter slate typecheck`
  - exited `0`.
- `bun --filter slate-react typecheck`
  - exited `0`.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/plaintext.test.ts playwright/integration/examples/richtext.test.ts --project=chromium --grep "keyboard undo restores caret after middle-line typing|undoes inserted text|undo restores deleted selected text"`
  - `3 passed`.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/scroll-into-view.test.ts --project=chromium --grep "keeps caret at the edited block end" --reporter=line --trace=off`
  - red before final repair/test hardening: delayed undo left selection at `[4,0]@0`.
  - green after fix: `1 passed`.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/scroll-into-view.test.ts --project=chromium --grep "keeps caret at the edited block end" --reporter=line --trace=off`
  - `1 passed`.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/scroll-into-view.test.ts --project=chromium --reporter=line --trace=off`
  - `2 passed`.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/plaintext.test.ts playwright/integration/examples/richtext.test.ts --project=chromium --grep "keyboard undo restores caret after middle-line typing|undoes inserted text|undo restores deleted selected text|repairs DOM after Mac keyboard undo" --reporter=line --trace=off`
  - `4 passed`.
- `bun --filter slate-react build`
  - exited `0`.
- `bun --filter slate-react test:vitest -- selection-side-effect-policy-contract`
  - `2 passed`.
- `bun lint:fix`
  - exited `0`; Biome fixed one file.

Implementation verdict:

- `Batch.selectionAfter` stayed deferred.
- Public history API stayed unchanged.
- Leading selection imports are trimmed from stored batch operations after they
  update `batch.selectionBefore`.
- Selection operations after the first saveable operation remain replayed and
  preserve redo's explicit post-edit selection.
- `udecode/slate#9` stays fork-local accounting only; no upstream PR claim line
  was added.
- Compound note captured at
  `docs/solutions/logic-errors/2026-05-13-slate-history-leading-selection-imports-are-batch-preconditions.md`.
- Scroll-into-view caret proof now asserts the restored model selection and
  follow-up typing target after delayed undo; the previous text-visible-only row
  was too weak.

## Current Verdict

The undo/redo selection regression is real, but it is not a reason to rewrite
the whole history model.

Accepted target:

```txt
history batch selectionBefore
  = selection immediately before the first saveable operation
  not the commit-wide selectionBefore when leading set_selection ops import DOM
```

The first implementation slice should:

1. Add a failing package test where one commit replays
   `set_selection(start -> middle)` followed by `insert_text` and undo must
   restore `middle`, not `start`.
2. Build each new history batch from the first saveable operation.
3. Apply leading non-saveable `set_selection` operations to the commit
   `selectionBefore` before storing `batch.selectionBefore`.
4. Trim those leading `set_selection` operations out of `batch.operations`.
5. Keep `set_selection` operations that occur after the first saveable
   operation, because they are part of the edit result and matter for redo.

Do not add a public history API. Do not add `Batch.selectionAfter` in the first
slice unless redo proof fails after the precondition fix.

Closure verdict: Ralph execution complete.

## Intent Boundary

| Field                | Decision                                                                                                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent               | Fix undo after typing at a DOM-imported caret so history restores the edit point, not the stale model selection from before selection import.                                                      |
| Desired outcome      | Typing in the middle of a block, undoing, and then typing again leaves selection at the original edit point across package and browser proof.                                                      |
| In scope             | `slate-history` batch construction, leading `set_selection` handling inside mixed commits, undo/redo package contracts, focused React browser rows, local fork issue `udecode/slate#9` accounting. |
| Non-goals            | Public history API, ProseMirror integer positions, Lexical snapshot history, broad DOM selection rewrite, raw mobile/IME claims, unrelated history memory work.                                    |
| Decision boundary    | Slate Ralplan may choose the internal history target and proof gates; `ralph` owns source/test edits later.                                                                                        |
| User decision needed | None.                                                                                                                                                                                              |

Pressure test:

- If this only fixed the one browser example by forcing DOM export after undo,
  it would be too shallow. The failing package repro proves the bad selection is
  already stored in the history batch before React gets involved.

## Live Source Evidence

| Surface              | Current owner                                                             | Current shape                                                                                                                        | Verdict                                                                              |
| -------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| History batch shape  | `.tmp/slate-v2/packages/slate-history/src/history.ts:9-12`                | `Batch` stores `operations` and `selectionBefore`.                                                                                   | Keep the shape for now; compute `selectionBefore` correctly.                         |
| Undo                 | `.tmp/slate-v2/packages/slate-history/src/with-history.ts:56-78`          | Replays inverse batch operations, then sets `batch.selectionBefore`.                                                                 | Correct order, wrong value when the batch start selection is stale.                  |
| Redo                 | `.tmp/slate-v2/packages/slate-history/src/with-history.ts:33-54`          | Sets `batch.selectionBefore`, then replays original operations.                                                                      | Can stay if leading selection imports are trimmed or made harmless.                  |
| Batch capture        | `.tmp/slate-v2/packages/slate-history/src/with-history.ts:140-148`        | New batch stores all `committedOps` and `change.selectionBefore`.                                                                    | Root bug: commit-wide `selectionBefore` predates leading DOM-import `set_selection`. |
| Save policy          | `.tmp/slate-v2/packages/slate-history/src/with-history.ts:219-228`        | `set_selection` does not make a commit saveable.                                                                                     | Reuse this distinction to find the first saveable op.                                |
| Commit metadata      | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:943-983`           | Commits include operations, metadata, tags, `selectionBefore`, and `selectionAfter`.                                                 | Enough data exists; no public API needed.                                            |
| Commit dirtiness     | `.tmp/slate-v2/packages/slate/src/core/public-state.ts:659-827`           | Text commits may include `set_selection` and text ops in one commit.                                                                 | History must understand mixed commits.                                               |
| Existing browser row | `.tmp/slate-v2/playwright/integration/examples/plaintext.test.ts:271-300` | Plaintext middle-line typing undo restores caret.                                                                                    | Useful guard, but not enough; it does not catch the mixed-commit package bug.        |
| Existing history row | `.tmp/slate-v2/packages/slate-history/test/history-contract.ts:356-396`   | Covers selection import sharing a later text commit, but starts from `null` and does not assert stale model selection before import. | Keep, then add the exact red.                                                        |

Verification evidence from `/Users/zbeyens/git/slate-v2`:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/plaintext.test.ts --project=chromium --grep "keyboard undo restores caret after middle-line typing" --reporter=line
```

Result: passed, `1 passed (8.1s)`.

Inline package repro:

```bash
bun --eval "/* set_selection(start->middle) then insert_text, undo expects middle */"
```

Result: failed as expected. Actual undo selection was `[0,0]@0`; expected was
`[0,0]@3`.

## Decision Brief

Principles:

1. History units follow saveable model operations, not incidental selection
   import operations.
2. Selection-only operations before the first content operation are preconditions
   for that content operation.
3. Selection operations after content operations are part of the user-visible
   edit result and must remain replayable.
4. History remains operation-first for collaboration and replay.
5. Browser repair is not allowed to hide a bad package-level history batch.

Top drivers:

- The failing repro matches the user report: undo restores the stale start of
  the block.
- Legacy Slate captured `selectionBefore` at the first saveable operation.
- ProseMirror stores a bookmark at the start of a history event, not at an
  earlier selection-only precondition.
- Lexical snapshot history avoids this by storing full editor states, but that
  would be too heavy and not Slate-like for v2.

Viable options:

| Option                                                                | Pros                                                               | Cons                                                               | Verdict |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------- |
| Force DOM selection export after undo                                 | May mask browser symptoms quickly.                                 | Leaves wrong package history state and redo/replay risk.           | reject  |
| Add `Batch.selectionAfter` immediately                                | Gives explicit redo target.                                        | Extra model surface before the failing class requires it.          | defer   |
| Store full snapshots like Lexical                                     | Robust selection restore.                                          | Too much memory and abandons operation-first history/collab shape. | reject  |
| ProseMirror-style public selection bookmarks                          | Durable mapping story.                                             | Public API churn and integer-position mismatch.                    | reject  |
| Compute batch start selection from leading non-saveable selection ops | Small, Slate-close, fixes root cause, preserves operation history. | Needs careful partial `set_selection` helper.                      | choose  |

Chosen consequence:

- `withHistory` needs a small pure helper, not a public API:

```ts
prepareHistoryBatch(change.selectionBefore, committedOps);
```

It should return:

```ts
{
  operations: committedOps.slice(firstSaveableIndex),
  selectionBefore: applyLeadingSelectionOps(
    change.selectionBefore,
    committedOps.slice(0, firstSaveableIndex)
  ),
}
```

## Public API Target

No public API change.

Keep:

- `withHistory(editor)`
- `HistoryEditor.undo(editor)` / `HistoryEditor.redo(editor)`
- `editor.undo()` / `editor.redo()` compatibility methods
- update tags and metadata already accepted by the runtime

Reject:

- public `SelectionBookmark`
- public `historyTransaction`
- public `Batch.selectionAfter`
- public `normalizeSelection`
- browser-only undo hooks as the primary fix

## Internal Runtime Target

Target algorithm:

```txt
on commit
  committedOps = change.operations
  firstSaveable = index of first operation where shouldSave(op)
  if none: do not push history
  batchSelectionBefore =
    apply leading set_selection ops to change.selectionBefore
  batchOperations = committedOps from firstSaveable onward
  merge decision uses saveable operations as today
  if merge: append batchOperations to last batch
  else: push { operations: batchOperations, selectionBefore: batchSelectionBefore }
```

Required details:

- `applyLeadingSelectionOps` must support `newProperties: null`, full range
  creation from `null`, and partial anchor/focus patches against an existing
  range.
- It must reject or ignore impossible selection patches the same way operation
  apply does; do not invent permissive history-only selection semantics.
- Rebase logic must transform the new `selectionBefore` as it already does in
  `rebaseBatch`.
- Redo must pass for:
  - leading selection import plus text insert;
  - text insert plus trailing explicit selection;
  - structural range replacement;
  - remote rebase after local history.

## Hook And Browser Runtime Target

React/browser work is a verification surface, not the first fix owner.

Keep current history hotkey paths:

- `keyboard-input-strategy.ts` handles undo/redo hotkeys.
- `mutation-controller.ts` dispatches `editor.undo()` / `editor.redo()`.
- `selection-reconciler.ts` exports model selection to DOM after model-owned
  changes.

Add browser proof only after package red/green passes:

- Plaintext middle-line typing undo.
- Richtext middle-block typing after mouse/DOM selection undo.
- Repeat flow: type in middle, undo, type again, undo again.
- Partial selected text replacement undo.

## Plate Migration Backbone

Plate needs operation-based history that treats toolbar/imported selection as
the precondition for the content command, not as a separate undoable edit. This
plan strengthens the substrate without adding Plate input-rule or command-chain
policy to raw Slate.

## Slate-Yjs Migration Backbone

The plan keeps serialized operation records unchanged. It also preserves the
current remote-rebase path in `with-history.ts:457-497`, where local undo/redo
batches and `selectionBefore` are transformed across remote operations.

Ralph must keep `collab-history-runtime-contract.ts` green and add no runtime id
or DOM data to history entries.

## Ecosystem Strategy Synthesis

| System       | Source                                                                                                                                          | Mechanism                                                                                                   | Avoids                                                                   | Steal                                                         | Reject                                                         | Slate target                                                           | Verdict |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- | ------- |
| Legacy Slate | `../slate/packages/slate-history/src/with-history.ts:69-116`                                                                                    | History wraps `editor.apply`; `set_selection` is skipped; first saveable op captures the current selection. | Storing stale selection from before DOM import.                          | Capture batch precondition at first saveable op.              | Mutable public editor fields and op-by-op plugin interception. | Compute the same precondition from v2 commit operations.               | agree   |
| ProseMirror  | `../raw/prosemirror/packages/history/src/history.ts:15-19`, `:82-109`, `:331-343`; `../raw/prosemirror/packages/state/src/selection.ts:173-203` | Event start stores a selection bookmark; history maps bookmarks through changes and resolves on replay.     | Selection restore tied to stale document or selection-only transactions. | Event-start selection discipline and mapping proof.           | Integer position model and public bookmarks for Slate.         | Internal range precondition plus existing range transform/rebase.      | partial |
| Lexical      | `../lexical/packages/lexical-history/src/index.ts:52-60`, `:356-410`, `:466-486`                                                                | History entries store whole `EditorState`; undo/redo swaps snapshots with a historic tag.                   | Partial replay selection drift.                                          | Historic-tag skip and dirty/change classification discipline. | Full snapshot history for Slate core.                          | Keep operation history; use `historic`/metadata only as proof support. | partial |
| Tiptap       | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`                                                                | Product commands wrap transaction semantics.                                                                | App commands fighting history grouping.                                  | Keep future command sugar over one transaction.               | Command-first history fix.                                     | No public API; fix core batch semantics.                               | diverge |

## Issue-Ledger Accounting

ClawSweeper status: skipped as a live GitHub pass. This is a local fork issue
regression slice, and cached ledgers already contain the relevant upstream
history clusters and `udecode/slate#9` dossier rows. No broad `gh issue list`
or `gh search issues` was needed.

| Issue             | Cluster                                      | Claim                | Why                                                                                                                                                                            | Proof route                                                             | V2 sync ledger           | PR line             |
| ----------------- | -------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------ | ------------------- |
| `udecode/slate#9` | v2-dom-selection / history-selection-restore | Improves after Ralph | The exact user report is caret jump after text undo. The simple plaintext browser row passes, but the package mixed-commit red now proves the underlying history capture hole. | new `slate-history` red/green, plaintext and richtext browser undo rows | fork dossier append only | no upstream PR line |
| #3534             | undo-selection-state-corruption              | Preserve fixed claim | Existing claim is multi-block Enter undo. This plan must not weaken it.                                                                                                        | `history-contract.ts` and coverage matrix existing row                  | unchanged                | unchanged           |
| #3551             | undo-selection-state-corruption              | Preserve fixed claim | Existing claim is `moveNodes` undo tree and selection restore. This plan must not weaken it.                                                                                   | existing history/core proof                                             | unchanged                | unchanged           |
| #3921             | history-set-selection-errors                 | Related              | The leading partial/full `set_selection` handling is adjacent, but this plan does not claim the original refocus issue.                                                        | new package helper tests only                                           | unchanged                | related only        |

PR reference status: unchanged. This plan adds no new upstream fixed issue claim
until Ralph proof passes and the user accepts claim wording.

Fork dossier status: appended a new `udecode/slate#9` regression planning row.

## Regression Proof Matrix

| Contract                         | Must prove                                                                                               |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Leading selection import red     | One commit with `set_selection(start -> middle)` then `insert_text` undoes to `middle`.                  |
| Leading selection import trimmed | The stored batch does not need to replay the leading `set_selection` to undo/redo correctly.             |
| Trailing selection preserved     | `insert_text` followed by `set_selection` redoes to the explicit post-edit selection.                    |
| Contiguous typing merge          | Normal consecutive text input still merges into one undo unit.                                           |
| Non-contiguous typing split      | Moving caret and typing elsewhere starts a new batch unless explicit merge metadata says otherwise.      |
| Partial set_selection guard      | Partial selection patches before first saveable op work only when a current range exists.                |
| Structural history               | Existing range replace, move_node, insertBreak, marked Enter, and deleteFragment undo rows remain green. |
| Collaboration rebase             | Remote skip/rebase contracts still transform `selectionBefore`.                                          |
| Browser caret                    | Plaintext/richtext middle typing undo restores caret and allows repeat typing/undo.                      |

## Applicable Review Matrix

| Lens                          | Applicability | Finding                                                                | Plan delta                                                      |
| ----------------------------- | ------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| `tdd`                         | applied       | The package red is precise and currently fails.                        | Ralph must start with the mixed-commit red before source edits. |
| `performance-oracle`          | applied       | The helper is O(number of leading selection ops), usually 0 or 1.      | Do not scan document or allocate snapshots.                     |
| `vercel-react-best-practices` | applied       | React must stay a projection layer; package history owns the root fix. | Browser rows are verification, not the primary implementation.  |
| `high-risk-deliberate-pass`   | applied       | History replay touches undo/redo correctness and collaboration rebase. | Add pre-mortem and broad gates.                                 |
| `steelman-pass`               | applied       | The strongest alternative is `Batch.selectionAfter`.                   | Defer until redo proof demands it.                              |
| `react-useeffect`             | skipped       | No effects are proposed.                                               | None.                                                           |
| `build-web-apps:shadcn`       | skipped       | No UI surface.                                                         | None.                                                           |
| `performance`                 | skipped       | No production/RUM claim.                                               | None.                                                           |

## High-Risk Deliberate Mode

Trigger: history selection semantics and undo/redo replay behavior.

Pre-mortem:

1. Trimming leading `set_selection` fixes undo but breaks redo after structural
   commands that rely on a selection precondition.
2. Partial `set_selection` patches against `null` become silently accepted and
   hide invalid operation logs.
3. Collaboration rebase transforms the adjusted `selectionBefore` incorrectly
   after remote edits.

Expanded proof plan:

- Unit/package: new mixed-commit red/green in `slate-history`.
- Unit/package: redo counterpart and trailing-selection preservation.
- Existing package sweep: `history-contract.ts`,
  `collab-history-runtime-contract.ts`, `commit-metadata-contract.ts`.
- Browser: plaintext and richtext undo selection rows on Chromium; expand to
  WebKit/Firefox if the model fix changes React history behavior.
- Typecheck: `slate`, `slate-history`, `slate-react`.

Rollback/hard-cut answer:

- If trimming leading selection ops breaks redo, revise to store
  `selectionAfter` internally. Do not expose it publicly.

## Slate Maintainer Objection Ledger

| Change                                                            | Likely objection                                                 | Steelman antithesis                                                           | Tradeoff tension                                           | Answer                                                                                                                                                   | Migration answer         | Docs/example answer                                     | Regression proof                               | Verdict |
| ----------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------- | ---------------------------------------------- | ------- |
| Compute `batch.selectionBefore` after leading `set_selection` ops | "Commit selectionBefore is supposed to be the before state."     | History should use the commit as the atomic unit.                             | History now has a small commit-internal precondition rule. | The first saveable operation is the undoable event. Leading selection import is not user content and legacy Slate already behaved this way.              | No public migration.     | No docs needed unless history internals are documented. | Mixed-commit red/green plus browser undo rows. | keep    |
| Trim leading selection-only ops from history operations           | "Operation history should preserve the exact commit operations." | Exact operation logs are easier to reason about.                              | Batch operations differ from commit operations.            | History already ignores selection-only commits; trimming only precondition selection ops makes undo/redo less noisy while preserving content operations. | No public migration.     | None.                                                   | Leading/trailing selection tests.              | keep    |
| Defer `Batch.selectionAfter`                                      | "Redo should have an explicit final selection."                  | ProseMirror stores bookmarks for both branch directions through addTransform. | Redo relies on replay semantics for now.                   | The current bug is the start selection. Add `selectionAfter` only if a focused redo red proves replay is insufficient.                                   | Internal only if needed. | None.                                                   | Redo counterpart gate.                         | keep    |

## Hard Cuts And Rejected Alternatives

- Cut: browser-only repair as the root fix.
- Cut: public selection bookmark API.
- Cut: full snapshot history.
- Cut: changing operation serialization.
- Cut: using stale plan facts from
  `docs/plans/2026-05-06-slate-v2-core-history-selection-undo-ralplan.md`
  as current source evidence; live `with-history.ts` is the authority.

## Implementation Phases For Ralph

1. Add red tests in `.tmp/slate-v2/packages/slate-history/test/history-contract.ts`:
   - leading `set_selection` plus `insert_text` undo restores the imported
     caret;
   - redo returns to the post-insert caret;
   - trailing `set_selection` after saveable op remains replayed.
2. Add a pure helper in `with-history.ts` for leading selection preconditions.
3. Use the helper when creating new batches.
4. Keep merge behavior stable by using existing saveable-op filtering.
5. Run package gates.
6. Run focused browser gates.
7. Update fork dossier and PR reference only after proof; no upstream fixed
   issue claim by default.

## Fast Driver Gates

From `/Users/zbeyens/git/slate-v2`:

```bash
bun test ./packages/slate-history/test/history-contract.ts --bail 1
bun test ./packages/slate/test/commit-metadata-contract.ts ./packages/slate/test/collab-history-runtime-contract.ts --bail 1
bun --filter slate-history typecheck
bun --filter slate typecheck
bun --filter slate-react typecheck
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/plaintext.test.ts playwright/integration/examples/richtext.test.ts --project=chromium --grep "keyboard undo restores caret after middle-line typing|undoes inserted text|undo restores deleted selected text|history selection precondition"
bun lint:fix
```

From `/Users/zbeyens/git/plate-2`:

```bash
bun run completion-check
```

## Scorecard

| Dimension                                                | Score | Evidence                                                                                                            |
| -------------------------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |  0.93 | React remains projection; helper is package-level and O(leading selection ops).                                     |
| Slate-close unopinionated DX                             |  0.95 | No public API; keeps operation history and `withHistory`.                                                           |
| Plate and slate-yjs migration-backbone shape             |  0.93 | Operation serialization unchanged; rebase path preserved; Plate gets deterministic command history substrate.       |
| Regression-proof testing strategy                        |  0.95 | Current failing inline repro, package red/green plan, existing history suite, collab suite, and browser rows named. |
| Research evidence completeness                           |  0.94 | Live v2 source, legacy Slate, ProseMirror, Lexical, existing research decisions, and issue ledgers cited.           |
| shadcn-style composability and hook/component minimalism |  0.92 | No UI/API surface added; hook/component surfaces untouched.                                                         |

Weighted total: `0.94`.

Status: `done`. The plan is ready for Ralph execution.

## Pass-State Ledger

| Pass                                 | Status   | Evidence added                                                                             | Plan delta                                                                  | Open issues               | Next owner |
| ------------------------------------ | -------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------- | ---------- |
| Current-state read and initial score | complete | live `with-history.ts`, history tests, commit metadata, existing browser row               | root cause narrowed to commit-wide selectionBefore versus first saveable op | none                      | closure    |
| Research and ecosystem pass          | complete | legacy Slate, ProseMirror history/bookmarks, Lexical snapshot history, prior v2 research   | chose precondition capture over snapshots/bookmarks/public API              | none                      | closure    |
| Issue-ledger pass                    | complete | cached upstream history clusters and `udecode/slate#9` dossier rows                        | no upstream fixed claim; fork dossier append                                | no live GitHub needed     | ralph      |
| Closure score and final gates        | complete | inline package repro failed as expected; focused plaintext browser row passed; gates named | plan ready for implementation                                               | source edits still needed | ralph      |

## Plan Deltas From Review

- Added a precise package-level red for the user's caret jump symptom.
- Reclassified the simple plaintext browser row as supporting proof, not full
  closure for `udecode/slate#9`.
- Chose first-saveable-operation precondition capture as the root fix.
- Rejected browser-only repair and full snapshot history.
- Deferred internal `selectionAfter` until redo proof requires it.

## Open Questions

None for the first implementation slice.

## Final Completion Gates

- Live source owners recorded.
- Inline failing repro recorded.
- Existing browser proof recorded.
- Ecosystem strategy synthesis complete.
- Issue accounting complete without broad live GitHub discovery.
- No public API left in maybe language.
- Ralph gates named with cwd.
