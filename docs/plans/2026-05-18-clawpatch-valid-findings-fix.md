# 2026-05-18 Clawpatch Valid Findings Fix

## Goal

Fix every valid finding from `.tmp/slate-v2/.clawpatch/reports/20260517T152655-41ac65.md`, skip false positives with evidence, and revalidate with Clawpatch where the CLI can verify the result.

## Source Of Truth

- Clawpatch docs: `https://clawpatch.ai/`
- Report: `.tmp/slate-v2/.clawpatch/reports/20260517T152655-41ac65.md`
- Findings state: `.tmp/slate-v2/.clawpatch/findings/*.json`
- Implementation repo: `.tmp/slate-v2`

## Finding Verdicts

### Skip

- `fnd_sig-feat-config-7528cb5b98-803e5_f667febcaf`: invalid. Bun runs `bun build:packages` as a package script in this repo shape.
- `fnd_sig-feat-config-7528cb5b98-d0ed1_4b11b04171`: invalid for the same Bun script premise.

### Fix

- `fnd_sig-feat-config-97ea478330-260ce_3dcd7e6956`: add Turbo dependency build ordering.
- `fnd_sig-feat-library-11f4ffa46a-14e0_d86e6f80e7`: make delete command direction overrides authoritative.
- `fnd_sig-feat-library-11f4ffa46a-628d_a21faa0720`: preserve inherited leaf marks when adding marks at collapsed selections.
- `fnd_sig-feat-library-1500b3b292-0556_baf4468d3c`: restore selection-less `insertText` document-end fallback.
- `fnd_sig-feat-library-1500b3b292-fce7_cb27429e5b`: route `insertSoftBreak` through command middleware.
- `fnd_sig-feat-library-1666dd96c4-4881_c0ca15e804`: honor clipboard copy policies instead of treating all non-exclude boundaries as full model copy.
- `fnd_sig-feat-library-1666dd96c4-5c6c_9ad91dd722`: include normally indexed boundaries in large-range DOM coverage queries.
- `fnd_sig-feat-library-1666dd96c4-6b51_632f2477be`: sync native selection for ShadowRoot editors.
- `fnd_sig-feat-library-1666dd96c4-700a_958eb511cb`: recompute clipboard fragment attach after end-void expansion.
- `fnd_sig-feat-library-1ad0792837-4126_f98b8e0f71`: keep nested fragment insertion selection paths under the insertion ancestor.
- `fnd_sig-feat-library-1ad0792837-4f94_0a007c2f8a`: preserve explicit-at selection behavior in full-document text replacement.
- `fnd_sig-feat-library-1cb6969464-5166_a44235f975`: fully apply decoration source option changes.
- `fnd_sig-feat-library-1cb6969464-878a_1156739a83`: return real SSR snapshots when annotation/widget stores exist.
- `fnd_sig-feat-library-1cb6969464-8ec1_369bb0b7b8`: count all synced text operations, not unique paths.
- `fnd_sig-feat-library-1df7d53a39-0f57_7b3750fb7a`: add persistent soak to release proof; keep raw mobile proof in the dedicated raw-device lane.
- `fnd_sig-feat-library-1df7d53a39-7e80_d46152f4d7`: reject low persistent soak iteration thresholds by default.
- `fnd_sig-feat-library-1eb3ef0dd3-5156_17851c1f19`: run generator cleanup inside query middleware write guards.
- `fnd_sig-feat-library-1eb3ef0dd3-5fa0_02e1296506`: invalidate runtime indexes after transaction rollback restores children.

## Execution Plan

1. Run Clawpatch CLI against each valid finding where it can operate safely.
2. If Clawpatch refuses because of repo state, keep its report as the source and land manual patches with focused regression tests.
3. Run focused package tests for every changed surface.
4. Run package typecheck/lint according to the touched package set.
5. Add one changeset per published package with user-visible behavior changes.
6. Run `clawpatch revalidate` for fixed findings and record any false-positive or still-open results.

## Verification Targets

- Focused `packages/slate` tests for editor command, mark, insertion, fragment, query, and runtime rollback behavior. Done: `bun test ./packages/slate/test/primitive-method-runtime-contract.ts ./packages/slate/test/snapshot-contract.ts ./packages/slate/test/query-extension-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts ...` passed.
- Focused `packages/slate-dom` tests for coverage, clipboard, focus, and DOM text sync. Done: included `./packages/slate-dom/test/dom-coverage.ts` and `./packages/slate-dom/test/clipboard-boundary.test.ts`; passed.
- Focused Slate browser release-script contract. Done: included `./packages/slate-browser/test/core/scenario.test.ts`; passed.
- `bun typecheck:packages`: passed.
- `bun lint:fix`: passed.
- `bun lint`: passed with one pre-existing `packages/slate-react/src/components/slate.tsx` hook warning and no errors.
- `bun test`: passed.
- `bun test:vitest`: passed.
- `bun check`: passed.
- `clawpatch revalidate --finding fnd_sig-feat-library-1666dd96c4-4881_c0ca15e804 --json`: outcome `fixed`.
- `clawpatch status --json`: `openFindings: 0`.

## Notes

- `clawpatch` was installed from the published npm package (`0.2.0`) because it was not present on PATH.
- The Clawpatch docs state that `fix --finding` is explicit and clean-worktree-gated by default. After the first applied fix, subsequent fixes were blocked by the first Clawpatch edit itself. For the fix pass, `.clawpatch/config.json` was temporarily set to `requireCleanWorktreeForFix: false`, then restored to `true`.
- Clawpatch applied the Turbo build-order finding plus the first four core editor findings, each with its configured `npm run typecheck`, `npm run lint`, and `npm run test` validation.
- Clawpatch failed on `fnd_sig-feat-library-1666dd96c4-4881_c0ca15e804` because the provider stream/auth failed before completion; no files were changed for that finding. Continue manually from the report and revalidate with Clawpatch after direct patches.
- Direct fixes covered the remaining valid findings. The two Bun-script findings were marked `false-positive` with Clawpatch triage. All valid findings were marked `fixed` with Clawpatch triage after `bun check`.

## 2026-05-18 Follow-Up Review Batch

Fresh Clawpatch review run `20260518T023214-469527` found three open `slate-react` findings under feature `feat_library_1fd6f4c229`:

- `fnd_sig-feat-library-1fd6f4c229-ba19_84c65afa29`: collapsed projection slices inside text are dropped.
- `fnd_sig-feat-library-1fd6f4c229-0200_75cb9399be`: `onBeforeInput` is typed as a React event but routed through native `InputEvent`.
- `fnd_sig-feat-library-1fd6f4c229-3086_837d3573b9`: renderElement coverage assertion treats missing browser `process` as development.

Execution target:

1. Run `clawpatch fix --finding ... --json` for each open finding, sequentially.
2. Inspect any Clawpatch changes before accepting them.
3. Run focused `slate-react` Vitest rows for projections, editable behavior, and surface contracts.
4. Run `bun --filter slate-react typecheck`, `bun lint:fix`, and `bun check`.
5. Add or update one `slate-react` changeset if user-visible package behavior changes.
6. Revalidate the three findings with Clawpatch and record final status.

Result:

- `fnd_sig-feat-library-1fd6f4c229-ba19_84c65afa29`: fixed. Current `HEAD` already includes zero-length projection boundaries and the focused collapsed-projection regression.
- `fnd_sig-feat-library-1fd6f4c229-0200_75cb9399be`: fixed. Current `HEAD` already keeps React `onBeforeInput` on the React path and native `beforeinput` on `onDOMBeforeInput`, with regression coverage.
- `fnd_sig-feat-library-1fd6f4c229-3086_837d3573b9`: fixed in this slice. `isSlateReactDevelopmentEnvironment` now treats missing `process.env.NODE_ENV` as production-safe, with regression coverage.
- Removed one unrelated Clawpatch-added static assertion from `packages/slate-react/test/surface-contract.tsx`.
- Restored `.clawpatch/config.json` to `requireCleanWorktreeForFix: true`.
- Added `.changeset/slate-react-browser-dev-guard.md`.

Verification:

- `bun --filter slate-react test:vitest -- projections-and-selection-contract editable-behavior dom-coverage-boundary-contract surface-contract`: 4 files, 65 tests passed.
- `bun --filter slate-react typecheck`: passed.
- `bun lint:fix`: passed, no fixes applied.
- `bun check`: passed with the existing `packages/slate-react/src/components/slate.tsx` hook warning only.
- `clawpatch revalidate --finding fnd_sig-feat-library-1fd6f4c229-ba19_84c65afa29 --json`: `fixed`.
- `clawpatch revalidate --finding fnd_sig-feat-library-1fd6f4c229-0200_75cb9399be --json`: `fixed`.
- `clawpatch revalidate --finding fnd_sig-feat-library-1fd6f4c229-3086_837d3573b9 --json`: `fixed`.
- `clawpatch status --json`: `openFindings: 0`.

## 2026-05-18 Higher-Limit Clawpatch Fix Batch

Source review:

- `clawpatch review --json --limit 50`
- Run: `20260518T033126-00862f`
- Report: `.tmp/slate-v2/.clawpatch/reports/20260518T033126-00862f.md`
- Result before this fix batch: 72 open findings.

Execution target:

1. Temporarily set `.tmp/slate-v2/.clawpatch/config.json` `git.requireCleanWorktreeForFix` to `false` so later Clawpatch fixes are not blocked by earlier Clawpatch edits.
2. Run `clawpatch fix --finding <id> --json` in controlled chunks.
3. Inspect Clawpatch changes after each chunk; stop on validation failure, provider failure, or broad suspicious edits.
4. Restore `requireCleanWorktreeForFix: true` before handoff.
5. Run focused verification by touched package, then `bun lint:fix` and `bun check` if source edits survive review.
6. Revalidate remaining findings and record final `clawpatch status --json`.

Result:

- Fixed and revalidated all remaining valid findings from `20260518T033126-00862f`.
- Final Clawpatch state in `.tmp/slate-v2`: `findings: 95`, `openFindings: 0`, `activeLocks: 0`.
- `clawpatch report --status open --json`: returned no items.
- Restored `.tmp/slate-v2/.clawpatch/config.json` to `"requireCleanWorktreeForFix": true`.

Final same-turn verification:

- `npm run typecheck`: passed across packages, site, and root.
- `npm run lint`: passed with one existing warning in `packages/slate-react/src/components/slate.tsx` and no errors.
- `npm run test`: passed; Bun package tests `1022 pass`, `95 skip`, `0 fail`; slate-react Vitest `34 files`, `304 tests` passed.

## 2026-05-19 Fresh Clawpatch Review Batch

Source state before review:

- `clawpatch status --json`: `findings: 95`, `openFindings: 0`, `activeLocks: 0`, `lockFiles: 0`.
- `.tmp/slate-v2/.clawpatch/config.json`: `"requireCleanWorktreeForFix": true`.

Execution target:

1. Run `clawpatch review --json --limit 50` in `.tmp/slate-v2`.
2. Inspect the generated report and `clawpatch status --json`.
3. Record new findings, or record a zero-open result if the review produces none.
4. Keep `.tmp/019e362b-c486-7372-84c1-1c04fef96ff6/completion-check.md` pending until this review batch is closed.

Result:

- `clawpatch review --json --limit 50`: run `20260519T143737-1f263b`.
- Report: `.tmp/slate-v2/.clawpatch/reports/20260519T143737-1f263b.md`.
- Reviewed `31` features and produced `12` new open findings.
- `clawpatch status --json`: `findings: 107`, `openFindings: 12`, `activeLocks: 0`, `lockFiles: 0`.
- Quick source pass: no obvious false positives. Treat the 12 findings as valid enough for a fix batch unless a targeted repro proves otherwise.

Open findings:

- `fnd_sig-feat-release-a235aa99b1-4903_035655915a`: site typecheck omits `--noEmit`.
- `fnd_sig-feat-test-suite-cb681e102d-7_cccedbe3b1`: slate-browser aggregate test runs selection browser suite twice.
- `fnd_sig-feat-ui-flow-6a27e982ce-f94c_532ec95c63`: inline void shell child order can differ between SSR and Mac client render.
- `fnd_sig-feat-ui-flow-6feb103d8d-ae72_f0494f2e0b`: placeholder `as` type accepts void HTML elements that cannot render children.
- `fnd_sig-feat-ui-flow-7e14dc4c24-2e7d_8a458c669b`: shelled segment preview/coverage can go stale after hidden content changes.
- `fnd_sig-feat-ui-flow-b96511949d-48f1_601dca3f51`: deferred selector callback can flush after unsubscribe.
- `fnd_sig-feat-ui-flow-b96511949d-b05d_5266b77c35`: mount-time editor commits can happen before Slate subscribes.
- `fnd_sig-feat-ui-flow-cfa3a8c90a-ae9f_505553d0bf`: default selection scrolling misses scroll containers outside a shadow root.
- `fnd_sig-feat-ui-flow-cfa3a8c90a-b4c0_f3acc7896c`: documented `zIndex` workaround is emitted as ignored `zindex` DOM attribute.
- `fnd_sig-feat-ui-flow-d9b2f7f1a2-c714_b31cf1ed14`: bound text can stay stale when skipped React render is not DOM-synced.
- `fnd_sig-feat-ui-flow-e1e5bc9333-e201_2053767467`: `SlateElement` does not rebind DOM maps when its path changes.
- `fnd_sig-feat-ui-flow-f991203b7d-e62d_fdbe54b63d`: `domSyncReason` is attached when `domSync` is false and suppressed when true.

## 2026-05-19 Clawpatch Fix Batch

Source report:

- `.tmp/slate-v2/.clawpatch/reports/20260519T143737-1f263b.md`

Validity pass:

- All 12 open findings are valid enough to fix. No false positives identified before the fix batch.

Execution target:

1. Temporarily set `.tmp/slate-v2/.clawpatch/config.json` `git.requireCleanWorktreeForFix` to `false` so multiple Clawpatch fixes can run in one dirty working tree.
2. Run `clawpatch fix --finding <id> --json` for the 12 valid findings.
3. Stop and inspect manually if a fix fails validation, looks too broad, or touches an unrelated surface.
4. Restore `requireCleanWorktreeForFix: true` before handoff.
5. Revalidate all fixed findings and record final `clawpatch status --json`.
6. Run relevant package checks and the Plate completion-check gate.

Result:

- Fixed 11 valid findings from run `20260519T143737-1f263b`.
- Marked `fnd_sig-feat-ui-flow-f991203b7d-e62d_fdbe54b63d` false-positive: `domSyncReason` is intentionally emitted only when DOM sync is disabled; inverting it broke the existing rendering-strategy DOM sync contract.
- Rebuilt `slate-react` so the fixed source paths are reflected in `packages/slate-react/dist/index.js`.
- Restored `/Users/zbeyens/git/slate-v2/.clawpatch/config.json` to `"requireCleanWorktreeForFix": true`.
- Added `/Users/zbeyens/git/slate-v2/.changeset/slate-react-clawpatch-ui-flow-fixes.md`.
- `clawpatch report --status open --json`: `findings: 0`.
- `clawpatch status --json`: `openFindings: 0`, `activeLocks: 0`, `lockFiles: 0`.

Revalidation:

- `fnd_sig-feat-ui-flow-6a27e982ce-f94c_532ec95c63`: fixed after rebuilding `slate-react` dist.
- `fnd_sig-feat-ui-flow-6feb103d8d-ae72_f0494f2e0b`: fixed.
- `fnd_sig-feat-ui-flow-7e14dc4c24-2e7d_8a458c669b`: fixed.

Final verification:

- `npm run typecheck`: passed.
- `npm run lint:fix`: passed, no fixes applied.
- `npm run lint`: passed.
- `npm run test`: passed (`bun test`: 1022 pass, 95 skip, 0 fail; `slate-react` Vitest: 35 files, 312 tests passed).

## 2026-05-19 Unlimited Clawpatch Review

Source state before review:

- Previous Clawpatch closeout: `openFindings: 0`.
- `/Users/zbeyens/git/slate-v2/.clawpatch/config.json`: `"requireCleanWorktreeForFix": true`.

Command:

- `clawpatch review --json`

Result:

- Run: `20260519T174319-47a168`.
- Report: `/Users/zbeyens/git/slate-v2/.clawpatch/reports/20260519T174319-47a168.md`.
- Reviewed `0` features and produced `0` new findings.
- `clawpatch report --status open --json`: `findings: 0`.
- `clawpatch status --json`: `findings: 107`, `openFindings: 0`, `activeLocks: 0`, `lockFiles: 0`.

Note:

- No fix work was done in this pass. The review command ran with no `--limit`, but Clawpatch had no pending review features to process.

## 2026-05-20 Force Re-Review Blocker

Requested state:

- Force re-review every known Clawpatch feature in `/Users/zbeyens/git/slate-v2`.

Current filesystem state:

- `/Users/zbeyens/git/slate-v2` no longer contains the full Slate v2 checkout or prior Clawpatch project state.
- Current files under that path are only `.clawpatch/features/feat_ui-flow_6feb103d8d.json` and `.clawpatch/runs/20260520T083030-e09d29.json`.
- `clawpatch status --json`: failed with `error: not initialized; run clawpatch init`.
- Current feature count from `.clawpatch/features/*.json`: `1`, not the expected `92`.
- Existing run `20260520T083030-e09d29` already reviewed `feat_ui-flow_6feb103d8d` and completed with `findingIds: []`.

Result:

- Marked this pass blocked. The requested 92-feature force re-review cannot be completed from the current `/Users/zbeyens/git/slate-v2` filesystem state without restoring the full checkout or Clawpatch state.
