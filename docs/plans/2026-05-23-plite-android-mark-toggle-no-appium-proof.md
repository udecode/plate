# Plite Android Mark Toggle No-Appium Proof

## Goal

Process cluster 9 as far as we honestly can without adding Appium.

## Source

- Issue: `#6022` `[Android] Soft keyboard dismisses and cursor jumps when typing after toggling a mark on a collapsed selection`
- Upstream PR evidence: `#6027`
- Current local owner: `packages/plite-react/src/hooks/android-input-manager/android-input-manager.ts`

## Evidence

- The issue video shows the keyboard dismissing immediately after toolbar bold toggles and subsequent typing/focus attempts.
- The issue comments include operation logs where Android typing after a collapsed mark toggle inserts a marked node and then selection oscillates between the old and inserted text paths.
- Upstream `#6027` identifies the same owner: Android scheduled a follow-up selection from the pre-insert text point after marked insertion changed the leaf structure.

## Non-Appium Boundary

Without real Android IME/device artifacts, this lane must not claim `Fixes #6022`.

Allowed proof now:

- package contract for marked collapsed typing through the Android input manager
- model selection after marked insertion
- no stale old-leaf selection restoration after Plite splits the text node

Not allowed proof now:

- keyboard visibility
- Android Chrome/WebView IME stability
- raw-device issue closure

## Work Plan

1. Add the missing package contract for collapsed mark typing through the Android input manager.
2. Fix `android-input-manager.ts` only if that contract proves red in current Plite.
3. Run focused `plite-react` verification.
4. Update issue ledger status as `supporting proof improved`, not `fixed`, unless raw device proof exists later.

## Progress

- [x] Issue and PR source read.
- [x] Existing Android input manager source and tests read.
- [x] Video transcript helper run successfully.
- [x] Focused package contract added.
- [x] Red proof captured: the new contract failed with selection restored to raw `[0,0]@2` after marked insertion.
- [x] Implementation fixed: scheduled Android diff flush keeps the normalized `at` point but no longer runs a second raw selection write.
- [x] Focused contract verified.
- [x] Ledger updated with honest no-Appium status.

## Changed Files

- `packages/plite-react/src/hooks/android-input-manager/android-input-manager.ts`
- `packages/plite-react/test/android-input-manager-contract.test.ts`
- `docs/plite-issues/gitcrawl-v2-sync-ledger.md`
- `docs/plite/ledgers/fork-issue-dossier.md`
- `docs/plite/ledgers/issue-coverage-matrix.md`
- `docs/solutions/ui-bugs/2026-05-23-slate-react-android-marked-inserts-must-not-replay-raw-old-leaf-selection.md`

## Verification

- Red: `packages/plite-react: bun test:vitest test/android-input-manager-contract.test.ts`
  failed because selection was `[0,0]@2` instead of `[0,1]@1`.
- Green: `packages/plite-react: bun test:vitest test/android-input-manager-contract.test.ts`
  passed with `7` tests.
- `Plate repo root: bun --filter plite-react typecheck` passed.
- `Plate repo root: bun lint:fix` passed.
- `Plate repo root: bun test:mobile-device-proof` passed and confirmed semantic/proxy rows cannot satisfy raw Android/iOS claims.
- `plate-2: node tooling/scripts/completion-check.mjs` passed.

## Remaining Proof Gap

Do not close or auto-claim `#6022` until a raw Android Chrome/WebView lane proves
keyboard visibility, IME stability, selection, and follow-up typing for the
exact collapsed mark-toggle flow.
