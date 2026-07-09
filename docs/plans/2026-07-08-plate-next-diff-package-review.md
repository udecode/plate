# plate-next diff package review

Objective:
Review `packages/diff` as the next Plate Next package because `packages/suggestion` was blocked by Diff's old Plate/Slate API usage.

Mode:
- Package review mode.
- Scope: `packages/diff` plus the smallest Plite owner needed for Diff proof.
- Non-goals: no docs, no `apps/www`, no browser proof, no package callers outside Diff.
- Completion: every Diff source row checked at score 100, package proof green, and Core/Plite shared gate updated when justified.

Completion threshold:
- Every `packages/diff/src` file has a checked score-100 row.
- No stale `platejs`, old Slate type names, `editor.tf`, `editor.children`, React dependency, or public compat shim remains in Diff source/metadata.
- Diff package typecheck, lint, test, and build pass.
- Plite internal export smoke passes for the new internal owner.
- `pnpm check:core` passes with Diff included.

Verification surface:
- Package-local Diff tests, typecheck, lint, and build.
- Plite internal export test and typecheck for the internal range-ref owner.
- Shared `check:core` gate after adding Diff.
- Source audits for stale old API names and untracked extracted files.

Constraints:
- Package review only.
- No docs, app, registry, browser, or unrelated package migration.
- No rename churn.
- No public root Plite API promotion for internal range refs.
- No compatibility aliases or old Plate/Slate wrappers.

Boundaries:
- Diff owns document diff behavior.
- Plite owns range-ref transaction substrate.
- `@platejs/plite/internal` may expose first-party internals; `@platejs/plite` root stays app-safe.
- Suggestion remains out of scope and becomes the next package.

Blocked condition:
- None. The package review closed with proof.

Verdict:
- `packages/diff`: main-parity-cleanup.
- `packages/plite/src/internal/index.ts`: move-to-plite/internal export, not root public API.
- `packages/plite/src/transforms-node/set-nodes.ts`: move-to-plite source-owner fix for explicit split text ranges ending at offset `0`.
- `tooling/scripts/check-core.mjs`: Core-adjacent gate update.
- Keep/revert/quarantine: keep.

Why Diff Is Core-Adjacent:
- Diff is pure Plite document substrate behavior.
- Suggestion depends on Diff and was blocked by Diff migration debt.
- Diff now protects Plite range-ref, text diff, mark diff, line-break, inline-node, and fragment behavior in the shared Core gate.

Package Manifest:
- command: `rg --files packages/diff/src | sort`
- expected rows: 27
- actual rows: 27
- missing rows: 0
- extra rows: 0
- unchecked rows: 0
- deferred rows: 0

Work Checklist:
- [x] Capture package manifest before closure.
- [x] Review and patch Diff old API migration debt.
- [x] Patch smallest Plite owner for live internal range refs.
- [x] Cut stale package metadata.
- [x] Add Diff to `check:core`.
- [x] Run package-local proof.
- [x] Run shared Core/Plite proof.
- [x] Record out-of-scope next package.

Phase / pass table:
| Phase | Status | Evidence |
| --- | --- | --- |
| Baseline blocker | done | Suggestion was blocked by Diff old API usage |
| Diff migration | done | Direct Plite imports, tx-owned change tracker, no stale umbrella imports |
| Plite owner patch | done | `createInternalRangeRef` exported from `@platejs/plite/internal` only |
| Metadata cleanup | done | Diff dependencies/peers match real source imports |
| Shared gate | done | `pnpm check:core` passed with Diff included |

File Checklist:
- [x] `packages/diff/src/index.ts` | score 100 | verdict main-parity-cleanup | evidence package export unchanged, package proof green | next none
- [x] `packages/diff/src/internal/transforms/transformDiffDescendants.spec.ts` | score 100 | verdict main-parity-cleanup | evidence full Diff tests green | next none
- [x] `packages/diff/src/internal/transforms/transformDiffDescendants.ts` | score 100 | verdict main-parity-cleanup | evidence no old `platejs` import, full Diff tests green | next none
- [x] `packages/diff/src/internal/transforms/transformDiffNodes.spec.ts` | score 100 | verdict main-parity-cleanup | evidence full Diff tests green | next none
- [x] `packages/diff/src/internal/transforms/transformDiffNodes.ts` | score 100 | verdict main-parity-cleanup | evidence typed properties as `Record<string, unknown>`, full Diff tests green | next none
- [x] `packages/diff/src/internal/transforms/transformDiffTexts.spec.ts` | score 100 | verdict main-parity-cleanup | evidence focused and full Diff tests green | next none
- [x] `packages/diff/src/internal/transforms/transformDiffTexts.ts` | score 100 | verdict main-parity-cleanup | evidence Plite operation replay strictness preserved, line-break proxy tests green | next none
- [x] `packages/diff/src/internal/utils/diff-nodes.spec.ts` | score 100 | verdict main-parity-cleanup | evidence full Diff tests green | next none
- [x] `packages/diff/src/internal/utils/diff-nodes.ts` | score 100 | verdict main-parity-cleanup | evidence direct Plite imports, full Diff tests green | next none
- [x] `packages/diff/src/internal/utils/dmp.ts` | score 100 | verdict keep-in-plate | evidence unchanged utility, full Diff tests green | next none
- [x] `packages/diff/src/internal/utils/get-properties.ts` | score 100 | verdict main-parity-cleanup | evidence return type tightened to `Record<string, unknown>`, full Diff tests green | next none
- [x] `packages/diff/src/internal/utils/inline-node-char-map.spec.ts` | score 100 | verdict main-parity-cleanup | evidence full Diff tests green | next none
- [x] `packages/diff/src/internal/utils/inline-node-char-map.ts` | score 100 | verdict main-parity-cleanup | evidence direct Plite imports, full Diff tests green | next none
- [x] `packages/diff/src/internal/utils/is-equal.spec.ts` | score 100 | verdict main-parity-cleanup | evidence full Diff tests green | next none
- [x] `packages/diff/src/internal/utils/is-equal.ts` | score 100 | verdict keep-in-plate | evidence unchanged utility, full Diff tests green | next none
- [x] `packages/diff/src/internal/utils/string-char-mapping.spec.ts` | score 100 | verdict main-parity-cleanup | evidence full Diff tests green | next none
- [x] `packages/diff/src/internal/utils/string-char-mapping.ts` | score 100 | verdict main-parity-cleanup | evidence direct Plite import, full Diff tests green | next none
- [x] `packages/diff/src/internal/utils/unused-char-generator.spec.ts` | score 100 | verdict main-parity-cleanup | evidence full Diff tests green | next none
- [x] `packages/diff/src/internal/utils/unused-char-generator.ts` | score 100 | verdict keep-in-plate | evidence unchanged utility, full Diff tests green | next none
- [x] `packages/diff/src/internal/utils/with-change-tracking.spec.ts` | score 100 | verdict main-parity-cleanup | evidence old change-tracking behavior covered by focused tests | next none
- [x] `packages/diff/src/internal/utils/with-change-tracking.ts` | score 100 | verdict main-parity-cleanup | evidence no old editor monkey-patch, active `tx` used, internal Plite range refs preserve transaction behavior, no local text-range workaround remains | next none
- [x] `packages/diff/src/lib/computeDiff.spec.ts` | score 100 | verdict main-parity-cleanup | evidence 35 compute fixtures green | next none
- [x] `packages/diff/src/lib/computeDiff.ts` | score 100 | verdict main-parity-cleanup | evidence public metadata types use `Record<string, unknown>`, full Diff tests/typecheck green | next none
- [x] `packages/diff/src/lib/index.ts` | score 100 | verdict main-parity-cleanup | evidence barrel unchanged, package build green | next none
- [x] `packages/diff/src/lib/types.ts` | score 100 | verdict main-parity-cleanup | evidence `DiffUpdate` avoids `any`, typecheck green | next none
- [x] `packages/diff/src/lib/withGetFragmentExcludeDiff.spec.ts` | score 100 | verdict main-parity-cleanup | evidence helper behavior green | next none
- [x] `packages/diff/src/lib/withGetFragmentExcludeDiff.ts` | score 100 | verdict main-parity-cleanup | evidence direct helper now uses `ElementApi` narrowing, no fake OverrideEditor shim | next none

Changes Made:
- Migrated Diff source from the old `platejs` umbrella / legacy editor APIs to direct Plite owners.
- Replaced old editor monkey-patching in change tracking with explicit `applyOperation(tx, op)` and `commitChangesToDiffs(tx)`.
- Added `createInternalRangeRef` to `@platejs/plite/internal` for first-party algorithms that need live range refs inside an active transaction.
- Preserved public root Plite API shape: no root export was added.
- Moved explicit split text-range end trimming into Plite `setNodes`; Diff applies update/insert metadata with direct `tx.nodes.set(...)`.
- Encoded line breaks in the synthetic diff editor so Plite strict operation replay validates correctly.
- Cut stale Diff package metadata: no `platejs`, React, React DOM, or `react-compiler-runtime` dependency/peer.
- Added Diff to `tooling/scripts/check-core.mjs`.

Related Scoped Sweeps:
- query: `rg -n "from 'platejs'|from \"platejs\"|EditorTransforms|LegacyEditorMethods|editor\.tf|editor\.children|TText|TElement|OverrideEditor|react-compiler-runtime|react-dom|\breact\b|\bslate\b" packages/diff/src packages/diff/package.json --glob '!**/dist/**'`
  - active scope: `packages/diff`
  - match count: 0
  - patched count: 0 after final audit
  - deferred count: 0
- query: `git ls-files --others --exclude-standard packages/diff packages/plite/test/public-package-import-smoke.test.ts packages/plite/src/internal/index.ts tooling/scripts/check-core.mjs docs/plans/2026-07-08-plate-next-diff-package-review.md`
  - active scope: Diff plus touched Plite/check-core owners
  - untracked count: 0
  - patched count: 0
  - deferred count: 0
- query: `rg -n "setTextProps|end\\.offset === 0|PathApi\\.previous\\(end\\.path\\)|tx\\.nodes\\.set\\(.*getInsertProps|tx\\.nodes\\.set\\(.*getUpdateProps" packages/diff/src packages/plite/src packages/plite/test --glob '!**/dist/**'`
  - active scope: Diff plus touched Plite owner
  - match count: 4
  - patched count: 1 Plite owner fix and 1 Diff workaround removal
  - deferred count: 0

Verification evidence:
- `pnpm --filter @platejs/plite build` passed.
- `pnpm --filter @platejs/diff exec bun test --preload ../../tooling/config/bunTestSetup.ts src/internal/utils/with-change-tracking.spec.ts src/internal/transforms/transformDiffTexts.spec.ts src/lib/computeDiff.spec.ts -t 'addMark|insertTextAddMark|insertWithLineBreakChar|mergeRemoveText|removeWithLineBreakChar|withChangeTracking|transformDiffTexts'` passed: 14 pass.
- `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/transforms-contract.ts -t "setNodes with split does not include"` passed: 1 pass.
- `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/index.spec.ts -t "mark-void-range-hanging"` passed: 1 pass.
- `pnpm --filter @platejs/plite test` passed: 1023 pass, 85 skip.
- `pnpm --filter @platejs/diff test` passed: 62 pass.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/diff` passed.
- `pnpm --filter @platejs/diff lint` passed.
- `pnpm --filter @platejs/diff build` passed.
- `pnpm --filter @platejs/plite lint` passed.
- `pnpm --filter @platejs/plite typecheck` passed.
- `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts test/public-package-import-smoke.test.ts -t '@platejs/plite/internal'` passed: 1 pass.
- `pnpm check:core` passed with Diff included.

Reboot status:
- Current. Resume at `packages/suggestion`; do not redo Diff unless new failures appear.

Open risks:
- None for Diff closure.

Out-Of-Scope Matches:
- `packages/suggestion` remains the next package candidate. Its earlier failure was caused by Diff, so rerun Suggestion as the next package rather than patching it in this Diff packet.

Needs Review:
- `withGetFragmentExcludeDiff` is an ugly legacy name, but rename churn is forbidden during package review. Add it to a later rename pass only if desired.
- The `@platejs/plite/internal` export is intentionally internal-package surface, not app API.

Goal complete.
