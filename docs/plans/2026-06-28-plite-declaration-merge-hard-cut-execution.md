# plite declaration merge hard cut execution

Objective:
Execute Plite declaration-merge hard cut; done when no ambient Plite merge
remains and focused Plite/Core gates pass.

Completion threshold:
- No active `declare module '@platejs/plite'`, `EditorStateExtensionGroups`,
  `EditorTxExtensionGroups`, or declaration-merge-specific `check:core` path
  remains outside historical changelog text.
- Plite extension groups infer from installed extension values, including
  history and React default history, without global augmentation.
- Focused package/Core proof passes.
- `check-complete` passes.

Scope boundaries:
- Edited only Plite, Plite History, Plite React, the Core/Plite test gate
  script, focused contracts, and this plan.
- Did not touch browser/docs/routes because this is a type/runtime API packet
  with no browser-facing UI surface.
- Did not run autoreview because this is not a commit/release handoff; proof is
  the package/Core gate set below.

Verification surface:
- Source audit over `packages/plite`, `packages/plite-history`,
  `packages/plite-react`, `packages/core`, and `tooling/scripts`.
- Focused Plite direct lifecycle runtime contracts.
- Plite, Plite History, Plite React, and Core package typecheck.
- Plite, Plite History, Plite React, Core, and generated test-file gates through
  `pnpm check:core`.

Constraints:
- No public compat aliases.
- No public runtime shims.
- No ambient module augmentation.
- No fake casts that hide inference loss.
- Dynamic `editor.extend()` remains runtime-only unless a separate API plan
  reopens static widening.

Boundaries:
- In scope: Plite extension type inference, history/react extension provider
  typing, direct read/update group runtime support, and Core/Plite test gate
  cleanup.
- Out of scope: Plate v2 API redesign, docs copy, browser proof, and release
  packaging.

Blocked condition:
- Stop only if TypeScript could not preserve installed extension group inference
  from extension values without declaration merging, or if `check:core` surfaced
  unrelated Core migration debt outside this packet. Neither blocker happened.

Changed files:
- `packages/plite/src/interfaces/editor.ts`
- `packages/plite/src/core/editor-lifecycle-api.ts`
- `packages/plite/src/index.ts`
- `packages/plite/test/extension-namespace-contract.ts`
- `packages/plite/test/generic-extension-install-contract.ts`
- `packages/plite/test/generic-extension-namespace-contract.ts`
- `packages/plite-history/src/history-extension.ts`
- `packages/plite-history/test/generic-history-contract.ts`
- `packages/plite-react/src/plugin/with-react.ts`
- `tooling/scripts/check-core.mjs`
- `docs/plans/2026-06-28-plite-declaration-merge-hard-cut-execution.md`

Implementation decisions:
- Cut ambient `EditorStateExtensionGroups` / `EditorTxExtensionGroups`
  declaration merging from Plite source and exports.
- Added a hidden `EditorExtensionTypeProvider` brand for packages that need to
  publish extension type output without global augmentation.
- Made installed `editor.read` / `editor.update` extension groups derive from
  the installed extension tuple.
- Kept dynamic `editor.extend()` runtime-only; static type widening still comes
  from creation-time installed extensions.
- Filtered broad `EditorExtension` slot records out of inference so generic
  extension types and state-field extensions cannot create fake string-indexed
  groups.
- Fixed duplicate-name resolution to dedupe only literal extension names; broad
  names no longer drop earlier literal extensions such as `history`.
- Added direct extension lifecycle sugar:
  `editor.read.blockSelection.selectedPath()`,
  `editor.update.blockSelection.removeSelected()`,
  `editor.read.history.undos()`, and `editor.update.history.undo()`.
- Made direct read groups support nested objects/properties, and direct update
  groups support nested tx methods while returning the transaction method result.
- Removed the `check:core` isolated declaration-merge path and replaced it with
  the normal package test typecheck batch.

Audit:
- Command:
  `rg -n "declare module '@platejs/plite'|EditorStateExtensionGroups|EditorTxExtensionGroups|requiresIsolatedTestTypecheck|isolated declaration-merge" packages/plite packages/plite-history packages/plite-react packages/core tooling/scripts --glob '!**/dist/**' --glob '!**/node_modules/**'`
- Result: one historical changelog example remains at
  `packages/plite/CHANGELOG.md:588`; no active source/test/tooling path remains.

Focused proof:
- `pnpm --filter @platejs/plite exec bun test ./test/extension-namespace-contract.ts ./test/read-update-contract.ts`
  - Result: 8 pass.
- `pnpm --filter @platejs/plite-history exec bun test ./test/generic-history-contract.ts`
  - Result: 0 runtime tests; file is type-only.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/plite-history --filter=./packages/plite-react --filter=./packages/core`
  - Result: 12 successful tasks.
- `pnpm --filter @platejs/plite test`
  - Result: 1008 pass, 85 skip, 0 fail.
- `pnpm --filter @platejs/plite-history test`
  - Result: 18 pass, 0 fail.
- `pnpm --filter @platejs/plite-react test`
  - Result: 60 files passed, 833 tests passed.
- `pnpm check:core`
  - Result: pass. It covered Core + Plite typecheck, generated Core/Plite test
    typecheck, Core lint, Plite lint, Core tests, and Plite tests.

Findings repaired during proof:
- `plite-react` initially widened `ReactExtension` through broad
  `EditorExtension<Editor>`, which made `read` look string-indexed. Fixed by
  making `ReactExtension` exact for the slots React actually owns.
- `check:core` caught test files that normal package typecheck missed. Fixed by
  keeping all tested files in the generated typecheck lane and removing the old
  isolated declaration-merge special case.
- State fields had broad string extension names and broad extension slots. Fixed
  slot filtering plus literal-name-only dedupe so `history()` is not dropped
  when installed next to state fields.

Scorecard:
| Dimension | Score | Evidence |
|-----------|------:|----------|
| No ambient merge remains active | 1.00 | hard-cut audit has only historical changelog text |
| Extension inference from installed values | 0.97 | generic extension, history, React, Core typecheck contracts green |
| Runtime behavior | 0.95 | Plite direct namespace tests plus package tests green |
| Tooling simplification | 0.95 | `check:core` no longer has isolated declaration-merge branch and passes |
| Migration risk | 0.92 | Core + Plite generated test typecheck and package tests green |

Final verdict:
The declaration-merge hard cut is complete. Remaining risk is only historical
changelog text that still shows old augmentation syntax; it is not active
source, tests, docs, or tooling.

Work Checklist:
- [x] Explicit requirements, scope boundaries, stop condition, and proof gates
      copied into the plan.
- [x] Ambient Plite declaration merge symbols removed from active source,
      tests, exports, and tooling.
- [x] History and React extension inference preserved without global
      augmentation.
- [x] Direct `editor.read.<group>` and `editor.update.<group>` lifecycle methods
      covered.
- [x] `check:core` includes tested package files and has no isolated
      declaration-merge path.
- [x] Focused typecheck, package tests, and `check:core` passed.
- [x] Browser proof skipped with reason: no browser-facing UI behavior changed.
- [x] Autoreview skipped with reason: no commit/release handoff requested and
      proof gates are green.
- [x] Final handoff ready.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Current-source audit | complete | hard-cut `rg` audit found no active source/test/tooling rows |
| Type inference implementation | complete | provider branding, literal slot filtering, and literal-name-only dedupe patched |
| Focused runtime/type contracts | complete | direct lifecycle contract tests and typecheck passed |
| Package/Core proof | complete | Plite, History, React tests and `pnpm check:core` passed |
| Plan closure | complete | this plan records final evidence and remaining risk |

Verification evidence:
| Command | Result |
|---------|--------|
| `rg -n "declare module '@platejs/plite'|EditorStateExtensionGroups|EditorTxExtensionGroups|requiresIsolatedTestTypecheck|isolated declaration-merge" packages/plite packages/plite-history packages/plite-react packages/core tooling/scripts --glob '!**/dist/**' --glob '!**/node_modules/**'` | only historical changelog text remains |
| `pnpm --filter @platejs/plite exec bun test ./test/extension-namespace-contract.ts ./test/read-update-contract.ts` | 8 pass |
| `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/plite-history --filter=./packages/plite-react --filter=./packages/core` | 12 successful tasks |
| `pnpm --filter @platejs/plite test` | 1008 pass, 85 skip, 0 fail |
| `pnpm --filter @platejs/plite-history test` | 18 pass, 0 fail |
| `pnpm --filter @platejs/plite-react test` | 60 files passed, 833 tests passed |
| `pnpm check:core` | pass |

Reboot status:
- Current. If resumed, continue from final handoff only; no open implementation
  work remains for this packet.

Open risks:
- Historical `packages/plite/CHANGELOG.md` still contains an old augmentation
  snippet. It is not active API/doc/tooling, but a future docs cleanup may prune
  it if the repo wants zero textual examples.
