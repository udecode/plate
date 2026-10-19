# plate-next selection package review

Objective:
Review and migrate `packages/selection` to the Plite-first Plate v2 shape, then close every package source/spec file at score 100 before moving to the next package.

Plate Next source:
- Prompt: `[$plate-next] next package`.
- Mode: package review.
- Package chosen: `packages/selection`.
- Reason: previous Utils fragment work named Selection as the next stale package; Basic Nodes, Basic Styles, and Indent are already closed.
- Stop condition: do not start the next package until all package source/spec rows are score 100 or explicitly deferred for user review.
- Final handoff: changed list, file checklist summary, verdict matrix, proof commands, old-name audit, Plite/Plate gaps, and next package block.

First checkpoint:
- [x] Explicit requirements copied before implementation: next package autopick, package-by-package review, file checklist, score 100 gate, no compat sludge, preserve inline inference, update `check:core` if Selection becomes a shared Core/Plite boundary gate, focused proof before closeout.
- [x] Manifest command: `rg --files packages/selection/src | sort`.
- [x] Expected row count corrected after migration: 79.
- [x] Actual row count: 79.
- [x] Missing row count: 0.
- [x] Extra row count: 0.
- [x] Package metadata reviewed separately: `packages/selection/package.json`.
- [x] Shared-gate decision: Selection belongs in `check:core` because block selection and selection overlays are direct Plate/Plite boundary proof.

Completion threshold:
- [x] All 79 Selection source/spec rows are score 100.
- [x] Stale API audits are clean.
- [x] Focused package proof passes.
- [x] Selection is included in `tooling/scripts/check-core.mjs`.
- [x] Shared Core/Plite gate passes with Selection included.

Constraints:
- [x] Keep Plate as product layer and Plite as editor substrate.
- [x] No public compat aliases, old Slate helpers, fake wrappers, bridge dumps, broad `any` casts, or test-only type cheating.
- [x] Prefer direct one-shot Plite methods for single reads/writes.
- [x] Use grouped `editor.update((tx) => ...)` only for multi-step logical actions without an active `tx`.
- [x] Preserve inline inference for plugin tx groups and callback APIs.
- [x] Do not start the next package until this checklist closes.

Boundaries:
- Allowed edit scope: `packages/selection`, smallest Core typing owners needed by Selection, `tooling/scripts/check-core.mjs`, package metadata, and this plan.
- Package/API surfaces: Selection block-selection APIs, cursor overlay hooks/queries, block menu, internal selection transforms, direct-owner imports, and Core plugin key-handle inference.
- Docs/browser surfaces: none touched; no route/UI browser proof required.
- Non-goals: no next package, no broad package sweep, no public API redesign beyond hard-cutting stale Selection aliases.
- Out-of-scope package errors: none observed in final proof.

Verification surface:
- Focused package proof: typecheck, test, build, and brl for `@platejs/selection`.
- Shared Core gate: `pnpm check:core` with Selection included.
- Source audits: stale API audit, `react-hotkeys` dependency audit, direct-owner import audit, extracted-file inventory.
- Related Core sweep: key-handle typing search and Core plugin hook usage; patched Core generic owners needed by Selection.
- Package manifest: 79 rows, 79 checked, 0 deferred.
- Plite/Plate gap ledger: none remaining.

Blocked condition:
- Blocked only if `pnpm check:core` fails from Selection/Core-owned drift, if any package row stays below score 100 without a user-accepted defer, or if a new Plite/Plate gap is discovered that cannot be safely patched in this packet.

Work Checklist:
- [x] First checkpoint copied prompt target, package mode, score-100 gate, stop condition, proof surface, and final handoff requirements.
- [x] Package manifest generated with one row per `packages/selection/src` file.
- [x] Source/API drift reviewed and patched for stale imports, stale Selection aliases, old `editor.tf`/`getApi` style, and plugin key-handle typing.
- [x] Extracted/untracked file inventory completed and each new file bucketed.
- [x] Package metadata audited from actual imports.
- [x] Focused package proof passed.
- [x] Selection added to `check:core`.
- [x] Shared Core/Plite gate passed with Selection included.
- [x] No next package started.

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Package manifest | done | `rg --files packages/selection/src \| sort` -> 79 rows | closed |
| Migration cleanup | done | stale API/dependency audits clean; deprecated Selection aliases cut | closed |
| Package proof | done | typecheck, 98 tests, build, brl passed | closed |
| Shared gate | done | `pnpm check:core` passed with Selection included | closed |
| Plan closure | done | 79/79 rows score 100; 0 deferred | run check-complete |

Package file checklist:
- [x] `packages/selection/src/index.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/EventEmitter.spec.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/EventEmitter.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/SelectionArea.spec.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/SelectionArea.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/index.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/transforms/selectBlocks.spec.tsx` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/transforms/selectBlocks.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/types.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/utils/constants.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/utils/css.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/utils/events.spec.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/utils/events.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/utils/frames.spec.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/utils/frames.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/utils/index.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/utils/intersects.spec.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/utils/intersects.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/utils/selectAll.spec.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/utils/selectAll.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/utils/shouldTrigger.spec.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/internal/utils/shouldTrigger.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/lib/extractSelectableIds.spec.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/lib/extractSelectableIds.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/lib/getAboveDomNode.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/lib/index.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/lib/isSelecting.spec.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/lib/isSelecting.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/BlockMenuPlugin.spec.tsx` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/BlockMenuPlugin.tsx` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/BlockSelectionPlugin.tsx` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/CursorOverlayPlugin.tsx` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/blockSelectionKey.ts` - score 100; verdict keep-in-plate; justified new key-only typed handle to break plugin runtime cycle without losing inference; owner Selection; evidence untracked inventory + package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/components/BlockSelectionAfterEditable.tsx` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/components/index.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/cursorOverlayKey.ts` - score 100; verdict keep-in-plate; justified new key-only typed handle to break plugin runtime cycle without losing inference; owner Selection; evidence untracked inventory + package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/hooks/index.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/hooks/useBlockSelectable.spec.tsx` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/hooks/useBlockSelectable.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/hooks/useBlockSelected.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/hooks/useBlockSelectionNodes.spec.tsx` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/hooks/useBlockSelectionNodes.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/hooks/useCursorOverlay.spec.tsx` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/hooks/useCursorOverlay.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/hooks/useIsSelecting.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/hooks/useRefreshOnResize.spec.tsx` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/hooks/useRefreshOnResize.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/hooks/useRequestReRender.spec.tsx` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/hooks/useRequestReRender.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/hooks/useSelectionArea.slow.tsx` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/hooks/useSelectionArea.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/index.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/internal/api/moveSelection.spec.tsx` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/internal/api/moveSelection.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/internal/api/setSelectedIds.spec.tsx` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/internal/api/setSelectedIds.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/internal/api/shiftSelection.spec.tsx` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/internal/api/shiftSelection.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/queries/cursorOverlayQueries.spec.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/queries/getCaretPosition.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/queries/getCursorOverlayState.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/queries/getSelectionRects.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/queries/index.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/transforms/blockSelectionDocumentTransforms.spec.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/transforms/duplicateBlockSelectionNodes.spec.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/transforms/duplicateBlockSelectionNodes.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/transforms/index.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/transforms/insertBlocksAndSelect.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/transforms/removeBlockSelectionNodes.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/transforms/selectBlockSelectionNodes.spec.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/transforms/selectBlockSelectionNodes.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/transforms/setBlockSelectionNodes.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/types.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/utils/copySelectedBlocks.spec.tsx` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/utils/copySelectedBlocks.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/utils/index.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/utils/pasteSelectedBlocks.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/utils/selectInsertedBlocks.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.
- [x] `packages/selection/src/react/utils/selectionBlocks.spec.ts` - score 100; verdict keep-in-plate/main-parity-cleanup; owner Selection; evidence package proof + check:core + stale API audit; next closed.

Extracted file inventory:
- [x] Command: `git ls-files --others --exclude-standard packages/selection | sort`.
- [x] `packages/selection/src/react/blockSelectionKey.ts` - bucket `keep-in-plate`; new key-only typed handle, not a renamed source file.
- [x] `packages/selection/src/react/cursorOverlayKey.ts` - bucket `keep-in-plate`; new key-only typed handle, not a renamed source file.

Related sweeps:
- [x] Stale API audit clean: `rg -n "from ['\"]platejs['\"]|from ['\"]platejs/react['\"]|editor\.tf|overrideEditor|getTransforms|getPluginApi|editor\.getApi|editor\.api\.(blocks|node|block|previous|next|above|isReadOnly|isFocused|isExpanded|isEmpty|create|prop|findPath|nodesRange|isAt)|editor\.meta|editor\.children|editor\.selection|editor\.operations|\.extendTransforms\(|addSelectedRow|resetSelectedIds|unselect\b|platePreventUnselect|@deprecated" packages/selection/src -g '*.ts' -g '*.tsx'` -> no matches.
- [x] Dependency audit clean: `rg -n "@udecode/react-hotkeys|react-hotkeys" packages/selection/src packages/selection/package.json` -> no matches.
- [x] Direct-owner import audit clean: source imports only direct owners such as `@platejs/core`, `@platejs/plite`, `@platejs/plite-dom`, `@platejs/utils`, `@udecode/*`, React, and test utilities.
- [x] Callback-only subscription audit reviewed in changed Selection hooks; no known callback-only subscription regression kept.
- [x] Package metadata audited from real imports; `@udecode/react-hotkeys` cut.

Verdict matrix:
- [x] `main-parity-cleanup`: migrated stale Plate/Slate API usage to current Plite/Plate APIs while preserving Selection ownership.
- [x] `keep-in-plate`: SelectionArea, block selection, block menu, cursor overlay, and selection UI hooks remain product-layer Selection concerns.
- [x] `hard-cut`: removed deprecated block-selection aliases `addSelectedRow`, `resetSelectedIds`, `unselect`, and `data-plate-prevent-unselect` support.
- [x] `move-to-plite`: no new Plite gap required for this package.
- [x] `Plite gap`: none remaining.
- [x] `Plate gap`: none remaining.
- [x] `private-bridge`: none added.
- [x] `defer-with-owner`: none.

Verification:
- [x] `pnpm install`.
- [x] `pnpm turbo typecheck --filter=./packages/selection`.
- [x] `pnpm --filter @platejs/selection test` - 98 pass.
- [x] `pnpm --filter @platejs/selection build`.
- [x] `pnpm --filter @platejs/selection brl`.
- [x] `pnpm check:core` - passed with Selection included; Core 718 pass, Selection 98 pass, plus Plite/Utils/Basic Nodes/Basic Styles/Indent checks.
- [x] Focused source-preload hook/query proof: `cd packages/selection && bun test --preload ../../config/plite-source-test-setup.ts ./src/react/hooks/useCursorOverlay.spec.tsx ./src/react/hooks/useRefreshOnResize.spec.tsx ./src/react/hooks/useRequestReRender.spec.tsx ./src/react/queries/cursorOverlayQueries.spec.ts` - 15 pass.
- [x] Core regression proof for ParserPlugin replacement path: `pnpm --filter @platejs/core exec bun test src/lib/plugins/ParserPlugin.spec.ts` - 5 pass.

Verification evidence:
- Fresh final evidence recorded on 2026-07-07: `pnpm check:core` exited 0 after Selection was added to the shared gate.
- Fresh package evidence recorded on 2026-07-07: `pnpm turbo typecheck --filter=./packages/selection`, `pnpm --filter @platejs/selection test`, `pnpm --filter @platejs/selection build`, and `pnpm --filter @platejs/selection brl` exited 0.
- Fresh audit evidence recorded on 2026-07-07: stale API audit and `react-hotkeys` dependency audit returned no matches; extracted-file inventory contains only the two intentional key-only handles.

Changed list:
- [x] Migrated Selection to direct-owner imports and current Plite/Plate APIs.
- [x] Removed old block-selection compat aliases and tests for those aliases.
- [x] Added key-only typed handles for block selection and cursor overlay to preserve inference without importing full plugin runtime graphs.
- [x] Moved frozen cursor-overlay empty rects to `types.ts` and removed hook-barrel pollution in query tests.
- [x] Strengthened Selection hook/query tests to use real local query modules instead of hiding behavior behind mocks.
- [x] Fixed Core plugin key-handle typing needed by Selection hooks.
- [x] Updated `check:core` to include Selection.
- [x] Updated ParserPlugin replacement behavior proof for Plite DOM plain-text fallback.

Next package block:
- [x] Do not start the next package in this run. Selection is closed; the next package needs a fresh `plate-next` invocation/checkpoint.

Reboot status:
- Current as of 2026-07-07. If resumed, do not redo Selection unless new diffs land; start the next package with a fresh package manifest and score-100 checklist.

Open risks:
- None for Selection closure. The only remaining risk is future package migration fallout outside Selection, which must be handled in the next package's own `plate-next` plan.
