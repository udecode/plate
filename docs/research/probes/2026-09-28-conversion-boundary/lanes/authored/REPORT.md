# Lane authored: corrections fold into authored document replacement

## Defect

`editor.update.value.replace(doc)` threw "Document replacement cannot mix with ordinary writes." on authored editors whenever a correction wrote in the same transaction after the replacement. With EditorKit, TrailingBlockPlugin inserts a paragraph after a final table or columnGroup, so the registry `markdown-to-editor-demo` failed for Markdown ending in either.

## Root cause

- `runEditorTransaction` runs the update callback and then settles the draft. Settlement reconciles element-owned roots, finalizes representation, runs `correctDocument` corrections and applies plugin publication. Only after that does it call `authoredTransaction.finish`.
- The authored runtime marked the load complete ('loaded') as soon as `replace(apply)` returned, which is still inside the callback. It then treated every later write as an ordinary author write:
  - `on.transactionChange` threw (authored.ts:3009 before the fix);
  - `finish` rejected any document change other than the one captured at load.
- Core exposed no boundary between the callback and settlement, and no existing phase or flag separates correction writes from author writes:
  - the transaction-change context carries no origin;
  - `skipCorrections` only turns corrections off;
  - `editor.update.value.replace` runs through the same update callback as `tx.value.replace`.

## Decision

Option A, approved by the lead: core exposes its existing settlement boundary to the authored runtime.

Rejected:
- Authored running corrections itself inside `replace`. That makes a second owner of settlement, runs corrections twice and ignores `skipCorrections`.
- A public origin field on the transaction-change context. That is public surface for one internal consumer.

## Fix

- `packages/plitejs/src/core/authored-runtime.ts`: add `settle?: () => void` to `NativeAuthoredTransaction`.
- `packages/plitejs/src/core/public-state.ts`: add `authoredTransaction?.settle?.();` right after `assertSynchronousTransactionAuthorResult(result);` in `runEditorTransaction`. That is the only line I changed in this file; the `isFrozenArray` edits in the same file are P1's.
- `packages/plitejs/src/authored/authored.ts`: a replacement now moves through three phases:
  - **'loading'** while `apply` runs.
  - **'loaded'** for the rest of the update callback. Ordinary writes still throw "Document replacement cannot mix with ordinary writes.", and authored writes and decisions still throw their existing errors.
  - **'settling'** once core calls `settle()`. Writes in this phase fold into the load. Authored reads during it throw "Authored reads require a completed document load.", the same as during 'loading'.
- The replacement record keeps the loaded authored state and document value. `loadAuthoredProjection` derives the projection:
  - on demand, for authored reads inside the callback;
  - at `finish`, the cached projection is reused only if settlement left the document untouched. Otherwise it is derived once from the settled document.
- The result is recorded as the document replaced by the corrected document: one commit, no authored operation, and history reset as for any replacement.
- If settlement changed a loaded document that carries retained authored operations, `finish` throws "Corrections cannot change a loaded document with authored changes." and the transaction rolls back.

## Files changed

- packages/plitejs/src/core/authored-runtime.ts (+1 line)
- packages/plitejs/src/core/public-state.ts (+1 line)
- packages/plitejs/src/authored/authored.ts
- packages/plitejs/test/authored-ingress-contract.test.ts (4 new tests)
- docs/research/probes/2026-09-28-conversion-boundary/lanes/authored/editorkit-replace.repro.test.ts
- docs/research/probes/2026-09-28-conversion-boundary/lanes/authored/replace-cost.probe.test.ts

## Tests added (packages/plitejs/test/authored-ingress-contract.test.ts)

- **`folds schema corrections into a loaded document with accepted input`** and **`... with proposed input`**. With a trailing-paragraph correction installed, loading [Intro, Quote] gives:
  - exactly 1 commit;
  - accepted and proposed views both equal the corrected document [Intro, Quote, empty paragraph];
  - no authored change, and the load doesn't need an author ID (the authorId function returns null during the load);
  - undos and redos both 0;
  - a later proposal undoes back to the corrected document, redoes, and is accepted into accepted content.
- **`rejects an ordinary write after a corrected document replacement`**: `tx.value.replace` followed by `tx.text.insert` still throws "Document replacement cannot mix with ordinary writes." and the value is unchanged.
- **`loads authored changes only when corrections keep their saved content`**:
  - a saved proposal document ending in a quote throws "Corrections cannot change a loaded document with authored changes." and leaves the editor unchanged;
  - a saved proposal document that corrections leave unchanged loads with its proposal.
- Before the fix, 3 of the 4 fail with "Document replacement cannot mix with ordinary writes." The ordinary-write rejection test passes both before and after.

## Commands and results (repository root, final code)

- `bun test --preload ./config/plite-source-test-setup.ts ./packages/plitejs/test/authored-*.test.ts`: 421 pass, 0 fail across 20 files. That is the 417 baseline plus the 4 new tests.
- `bun test docs/research/probes/2026-09-28-conversion-boundary/lanes/authored/editorkit-replace.repro.test.ts`: 5 pass, 0 fail. Before the fix: 4 fail, 1 pass. It covers table-ending and columnGroup-ending Markdown through both `editor.update.value.replace` and a nested `editor.update(tx => tx.value.replace(doc))`, plus the ordinary-write rejection.
- `pnpm --filter plitejs test`: 21/21 turbo tasks, 0 failures. Per partition:

  | Partition | Tests passed |
  | --- | --- |
  | core | 1698 |
  | authored | 421 |
  | dom | 257 + 10 |
  | history | 151 |
  | diff | 49 |
  | testing | 44 |
  | pagination | 37 |
  | yjs | 274 |
  | react (Vitest) | 1325 |
  | react-virtualized | 8 |

- `pnpm --filter plitejs typecheck`: 13/13 tasks pass.
- `pnpm exec ultracite check` on the touched files: formatting and lint are clean. The repo's oxfmt/oxlint config excludes `docs/**`.
- Consumer specs: `bun test packages/platejs/src/authored/authored.api.spec.ts packages/platejs/src/features/suggestion/BaseSuggestionPlugin.spec.ts apps/www/src/registry/examples/markdown-streaming-demo.spec.tsx`: 17 pass, 0 fail.
- `tsc -p packages/plitejs/test/tsconfig.json` reports no errors in the touched files. That project is not a gate: it has 2,705 errors in other files.
- Not run: `pnpm check:plite:dev`. Because of the whole working tree, its dry run selects typecheck and tests for plitejs, platejs, @platejs/test and plite, plus browser smoke. The plitejs suites above are the proof you asked for.

## Open gaps

1. **Correction on a loaded document with retained authored operations.** The replacement fails atomically with "Corrections cannot change a loaded document with authored changes." Mapping saved positions through a correction would need an operation identity for content the correction inserts, plus projected-side mapping; neither exists. This case threw before the fix as well. Plain loads (Markdown import, streaming, markdown-to-editor) are unaffected.
2. **Cost of a correction after a full replacement.** When a correction writes after a full replacement, core representation finalization gets much more expensive. Receipt: `replace-cost.probe.test.ts`, EditorKit, 33 KB Markdown with 300 tables, median of 5 measured runs after 3 warmups.
   - Prototype measurement: finalization 36 ms → 246 ms.
   - Final code:

     | | Ends in a paragraph (no write) | Ends in a table (TrailingBlock writes) |
     | --- | --- | --- |
     | Median `value.replace` | 729 ms | 963 ms |
     | `transaction-finalize-representation` (3 calls) | 41 ms | 223 ms (incl. 140 ms `representation-window-apply`) |
     | Incremental schema validation | 41 ms | 78 ms |
     | Corrections | 72 ms | 98 ms |

   - Authored adds one `authored-restore` of about 22 ms in both cases.
   - Owner: Plite core (P1's area).

## Notes for the lead

- No public API shape changed. `NativeAuthoredTransaction` is internal to core and authored.
- What does change is behavior: replacing an authored document now loads the corrected document. Whether docs or doctrine should say so is your call.
- The Stop hook auto-staged my lane files. Three scratch files I later deleted show as `AD` in the index; the hook stages deletions (`git add -A`), so it should clear them at the end of my turn. I did not stage or unstage anything myself.
