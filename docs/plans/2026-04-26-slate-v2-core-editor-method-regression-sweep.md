# Slate v2 Core Editor Method Regression Sweep

## Goal

Sweep `../slate-v2/packages/slate/src/editor/**` for methods with the same failure class as `insertBreak`: manual structural rewrites that bypass the primitive seam that already owns selection, nested containers, merge/split semantics, transactions, commits, or command middleware.

## Constraints

- Source truth is current `../slate-v2`, compared against legacy `../slate`.
- Prefer fixes that route through editor primitives and existing transform seams.
- Do not revive `Transforms.*` as public API.
- Do not create a second transaction, commit, or history model.
- If a concrete same-class bug is found, add a focused behavior test before the fix when practical.

## Review Checklist

- [x] Inventory all core editor methods and legacy equivalents.
- [x] Classify methods by risk: query-only, thin primitive wrapper, exact operation helper, structural rewrite.
- [x] Inspect structural rewrites for nested block, inline, void, mark, selection, and transaction target drift.
- [x] Fix any concrete P0/P1 regression found during the sweep.
- [x] Run focused package tests and relevant type/lint checks.

## Findings

- `packages/slate/src/transforms-text/delete-text.ts`: concrete same-class regression risk. The collapsed cross-block delete helper had a private `mergeBlocksAtPoint` implementation that manually merged block children and cleaned ancestors. That duplicated the `mergeNodes` seam that already owns nested container, id preservation, and selection rebasing behavior. Replaced it with `mergeNodes(editor, { at: point, hanging: true, voids })`.
- `packages/slate/src/transforms-node/lift-nodes.ts`: concrete same-class ownership leak. `liftNodeAtPath` accepted an optional transaction and fell back to `editor.apply`; one range branch called it without the active tx. Made the helper require tx and routed every operation through `tx.apply`.
- `packages/slate/src/editor/insert-text.ts`: stale-target preflight smell. The read-only/void ignore guard checked `command.options?.at ?? Editor.getLiveSelection(editor)` before transaction target resolution. Moved the guard behind `tx.resolveTarget({ at })` so implicit selection-sensitive writes use the transaction-resolved target.
- Static guard found no remaining matches in `packages/slate/src/editor`, `packages/slate/src/transforms-node`, or `packages/slate/src/transforms-text` for direct `editor.apply`, optional tx apply fallback, stale `shouldIgnoreTarget` preflight, or `Transforms.*`.
- Broad `snapshot-contract.ts` and `transaction-contract.ts` still contain older direct-write rows that now trip the write-boundary guard. Those are existing test-suite migration debt, not failures introduced by this sweep.

## Verification

- `bun test ./packages/slate/test/primitive-method-runtime-contract.ts --bail 1` passed.
- `bun test ./packages/slate/test/transforms-contract.ts -t "liftNodes" --bail 1` passed after updating the row to use `editor.update`.
- `bun test ./packages/slate/test/snapshot-contract.ts -t "adjacent nested block boundaries" --bail 1` passed.
- `bun test ./packages/slate/test/write-boundary-contract.ts --bail 1` passed.
- `bunx turbo build --filter=./packages/slate --force` passed.
- `bunx turbo typecheck --filter=./packages/slate --force` passed.
- `bun run lint:fix` passed.
- `bun run lint` passed.
- `rg -n "editor\\.apply\\(|\\bapply\\s*=\\s*tx\\?|shouldIgnoreTarget\\(editor, (command\\.options|requestedTarget|Editor\\.getLiveSelection)|Transforms\\." packages/slate/src/editor packages/slate/src/transforms-node packages/slate/src/transforms-text` returned no matches.

## Residual Risk

- The largest remaining correctness surface is still `delete-text` and fragment insertion around deeply nested/void/inline combinations. The sweep removed the obvious duplicate merge path, but exhaustive confidence still depends on the generated editor-method gauntlets.
- Full-file `snapshot-contract.ts` and `transaction-contract.ts` need a separate test modernization pass to wrap legacy direct writes in `editor.update` or replace them with current public contracts.

## Progress

- 2026-04-26: Started sweep after `insertBreak` nested code-block regression. Loaded prior Slate v2 learnings on transform hard cuts, wrapper preservation, cross-block delete merge seam, structural key ownership, and apply/onChange hard cuts.
- 2026-04-26: Completed core sweep for the same regression class. Patched delete cross-block merge routing, lift-node transaction ownership, and insert-text target freshness. Added/updated focused contracts and verified package build/type/lint.
- 2026-04-26: Compounding check found high overlap with the existing cross-block delete merge-seam learning. Updated that learning with the editor-method sweep guard instead of creating a duplicate solution doc.
