# Plate Next: Yjs closure

Objective:
Close `@platejs/yjs` as the final Plate Next package: every current package file scores 100, old Plate/Slate collaboration compatibility is removed, Plite owns editor substrate behavior, and the package plus owning Plite gate pass.

Completion threshold:
All 58 current package files are checked at score 100; the eight obsolete files are hard-cut; public exports, direct read/update APIs, root ownership, history semantics, React DOM behavior, changeset, focused package proof, Chromium proof, `pnpm check:plite`, scoped autoreview, and this plan checker are green.

Verification surface:
`rg --files packages/yjs`; Yjs lint, typecheck, build, and tests; focused Plite/React/history regressions; focused Chromium collaboration/root/void rows; full `pnpm check:plite`; scoped source audits; scoped autoreview; final autogoal checker.

Constraints:
Best Plate v2 shape only. No compatibility aliases, fake capability types, helper dumps, one-statement update callbacks where direct APIs exist, callback annotations that hide inference failures, duplicated provider/history ownership, generated registry edits, unrelated package cleanup, staging, committing, pushing, or PR creation.

Boundaries:
Primary scope is `packages/yjs/**`. Shared edits are limited to the smallest Plite, Plite React, Plite History, app proof, package metadata, and root alias owners required by failures exposed through Yjs and `check:plite`. `check:core` is not the owner because Yjs is a Plite collaboration satellite covered by `check:plite`.

Blocked condition:
Blocked only if a reproducible Yjs or owning Plite failure cannot be repaired inside these boundaries, or a required external service prevents proof. Neither condition remains.

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Package review | yes | `@platejs/yjs` was the only remaining package named by the continuation |
| Manifest | yes | Initial inventory 66 files; eight hard cuts; current `rg --files packages/yjs` inventory 58 |
| Browser | yes | Shared collaboration, root-view, projection, and editable-void behavior has runnable Chromium coverage |
| Changeset | yes | Major public migration recorded in `.changeset/plite-yjs-attribute-keys.md` |
| Core gate | no | Yjs belongs to the Plite collaboration lane and `check:plite` |

Work Checklist:
- [x] Preserve every current Yjs behavior that belongs in the Plite-native package.
- [x] Remove old Plate/Slate plugin wrappers and duplicate private history ownership.
- [x] Remove the duplicate `@platejs/yjs/internal` subpath and every local alias.
- [x] Replace stale one-shot reads and updates with direct APIs.
- [x] Keep only grouped transaction callbacks and the generic React selector adapter.
- [x] Use the real `ReactEditor` DOM API instead of structural capability types.
- [x] Repair rejected/fallback collaboration commits before history records them.
- [x] Repair shared root-view and model-owned DOM synchronization exposed by the full Plite gate.
- [x] Record the breaking public migration as a major changeset.
- [x] Score `packages/yjs/README.md` at 100.
- [x] Score `packages/yjs/package.json` at 100.
- [x] Score `packages/yjs/src/core/attributes.ts` at 100.
- [x] Score `packages/yjs/src/core/awareness-adapter.ts` at 100.
- [x] Score `packages/yjs/src/core/awareness.ts` at 100.
- [x] Score `packages/yjs/src/core/controller.ts` at 100.
- [x] Score `packages/yjs/src/core/document.ts` at 100.
- [x] Score `packages/yjs/src/core/editor-adapter.ts` at 100.
- [x] Score `packages/yjs/src/core/editor-yjs.ts` at 100.
- [x] Score `packages/yjs/src/core/extension.ts` at 100.
- [x] Score `packages/yjs/src/core/index.ts` at 100.
- [x] Score `packages/yjs/src/core/json-equality.ts` at 100.
- [x] Score `packages/yjs/src/core/operations.ts` at 100.
- [x] Score `packages/yjs/src/core/path.ts` at 100.
- [x] Score `packages/yjs/src/core/provider-lifecycle-adapter.ts` at 100.
- [x] Score `packages/yjs/src/core/provider.ts` at 100.
- [x] Score `packages/yjs/src/core/record.ts` at 100.
- [x] Score `packages/yjs/src/core/replacement.ts` at 100.
- [x] Score `packages/yjs/src/core/selection.ts` at 100.
- [x] Score `packages/yjs/src/core/split-history-adapter.ts` at 100.
- [x] Score `packages/yjs/src/core/split-history.ts` at 100.
- [x] Score `packages/yjs/src/core/text-delta.ts` at 100.
- [x] Score `packages/yjs/src/core/types.ts` at 100.
- [x] Score `packages/yjs/src/core/undo-manager-adapter.ts` at 100.
- [x] Score `packages/yjs/src/index.ts` at 100.
- [x] Score `packages/yjs/src/react/index.ts` at 100.
- [x] Score `packages/yjs/test/attributes-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/awareness-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/delete-fragment-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/document-id-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/insert-fragment-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/json-equality-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/lift-nodes-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/merge-node-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/move-node-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/operation-exhaustiveness-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/package-config-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/provider-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/react-contract.spec.tsx` at 100.
- [x] Score `packages/yjs/test/record-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/remote-import-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/remove-node-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/replace-fragment-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/selection-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/set-node-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/simple-operations-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/split-history-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/split-merge-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/split-node-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/structural-soak-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/support/collaboration.ts` at 100.
- [x] Score `packages/yjs/test/support/provider.ts` at 100.
- [x] Score `packages/yjs/test/undo-manager-adapter-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/unwrap-nodes-contract.spec.ts` at 100.
- [x] Score `packages/yjs/test/wrap-nodes-contract.spec.ts` at 100.
- [x] Score `packages/yjs/tsconfig.build.json` at 100.
- [x] Score `packages/yjs/tsconfig.json` at 100.
- [x] Score `packages/yjs/tsdown.config.mts` at 100.
- [x] Run focused and shared proof.
- [x] Run scoped autoreview and resolve accepted findings.
- [x] Run the final plan checker.

Manifest accounting:
- Command: `rg --files packages/yjs | sort`.
- Initial rows: 66.
- Hard cuts: 8.
- Expected current rows: 58.
- Actual current rows: 58.
- Checked rows: 58.
- Deferred rows: 0.
- Missing rows: 0.
- Extra rows: 0.

Hard-cut ledger:
- `packages/yjs/src/core/history.ts`: duplicate private history implementation; Plite History owns editor history.
- `packages/yjs/src/internal/index.ts`: duplicate branch-only internal export.
- `packages/yjs/src/lib/withPlateYjs.spec.ts`: test for deleted compatibility wrapper.
- `packages/yjs/src/lib/withPlateYjs.ts`: old Plate plugin compatibility wrapper.
- `packages/yjs/src/lib/withTCursors.ts`: old Slate enhancer compatibility wrapper.
- `packages/yjs/src/lib/withTYHistory.ts`: old Slate enhancer compatibility wrapper.
- `packages/yjs/src/lib/withTYjs.ts`: old Slate enhancer compatibility wrapper.
- `packages/yjs/test/history-contract.spec.ts`: contract for the deleted duplicate history implementation; collaboration history regression moved to the owning merge/provider contract.

Scoped sweep:
- Legacy names and internal subpath: `withPlateYjs|withTYjs|withTYHistory|withTCursors|WithYjs|@platejs/yjs/internal`; 0 current matches.
- Fake capability and cast smells: `DOMCapableEditor|YjsDOMApi|plugin(...).editor|.editorApi|as WithRequiredKey|as PluginConfig|as any`; 0 current matches.
- Direct callback writes: 107 one-statement callbacks replaced; 13 current callbacks are grouped multi-operation transactions or the test helper that exposes one Yjs transaction.
- Direct callback reads: the history count uses `editor.read.history.undos()`; the one remaining source callback is the generic React selector adapter over installed Yjs extension state.
- Explicit `EditorUpdateTransaction`: one public controller method boundary receives the operation middleware transaction; no callback annotation hides inference.
- Debug artifacts and extracted helper files: 0.

Plite gap ledger:
- No unresolved API gap.
- `OperationApi.root(operation)` publicly resolves implicit main-root and
  explicit sibling-root operations for collaboration/history adapters.
- `EditableContentRootSlotOptions` forwards `domStrategy` and `maxLength`.
- Operation-root children honor an actively rerooted runtime owner even when a mounted view shares the operation root.
- The path-to-DOM registry supports every mounted element for a path.
- Model-owned history repairs DOM immediately without suppressing the following React model render.
- The Plite app declares the native TypeScript preview package explicitly so Next proof does not mutate package metadata.

Attempt ledger:
- The first autoreview found a P1 where sibling-root operations could be
  interpreted against the bound Yjs document. Yjs now filters by
  `OperationApi.root`, sibling-root awareness clears the bound-root cursor,
  and content/selection regressions cover both paths.
- A first strict-root repair compared `operation.root` directly and failed
  because main-root operations are intentionally rootless. It was replaced by
  the Plite-owned `OperationApi.root` query; the temporary failure never
  survived a proof gate.
- Rejected selection-restoration, deferred/global selector dispatch, projection range-transform opt-in, broad root render epochs, cached full-root node APIs, and the editable-void focus effect because focused/full proof exposed incorrect ownership or regressions.
- The accepted fixes live at the owning root-view, DOM registry, model-owned history, and example focus boundaries.
- Root `pnpm lint:fix` reports 214 pre-existing diagnostics outside this packet and made no packet changes; owning package lint and `check:plite` are green.

Phase / pass table:

| Phase | Status | Evidence |
| --- | --- | --- |
| Inventory | complete | 58 current rows match 58 checked score-100 rows |
| Yjs migration | complete | Eight compatibility/duplicate files hard-cut; direct APIs and real editor types retained |
| Shared owner repair | complete | Root-view, multi-element DOM, model-owned history, and app metadata regressions fixed at owners |
| Package proof | complete | Lint, typecheck, build, and 242 Yjs tests pass |
| Browser proof | complete | Focused collaboration/root/void rows and the full Chromium lane pass |
| Shared gate | complete | `pnpm check:plite` exits 0 |
| Review | complete | Scoped autoreview completed with accepted findings resolved |
| Goal check | complete | Final checker exits 0 |

Verification evidence:
- `pnpm --filter @platejs/yjs lint:fix`: 57 linted files, exit 0.
- `pnpm turbo typecheck --filter=./packages/yjs`: exit 0.
- `pnpm --filter @platejs/yjs build`: exit 0.
- `pnpm --filter @platejs/yjs test`: 27 files, 242 tests passed.
- Focused Plite root contract: 25 tests pass, including implicit-main and
  explicit-sibling `OperationApi.root` behavior.
- `pnpm --filter @platejs/plite-react test`: 61 files, 842 tests passed.
- Focused Plite runtime-view regression: matching root views remain scoped during operation children reads.
- Focused Chromium packet: seven collaboration/root/projection rows passed.
- Focused editable-void Chromium packet: child-root editing, focus retention, and copy/cut passed.
- `pnpm check:plite`: package typechecks/tests pass; Chromium runs pass with 587 passed and 7 skipped, then serial runs with 3 passed, 45 passed, and 46 passed with 1 skipped; exit 0.
- Major Yjs/minor Plite changeset records `createYjsExtension`, app-owned
  `YjsProviderLike`, React subpath hooks, `plite:*` metadata, and
  `OperationApi.root`.
- Scoped source audits report no legacy export, internal subpath, fake editor capability, dirty plugin portal, or debug-artifact match.
- Scoped autoreview: completed against current checkout; no unresolved actionable finding.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-yjs.md`: exit 0.

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Every package file scores 100 | yes | 58 of 58 checked; 0 deferred |
| Focused package proof | yes | Yjs lint, typecheck, build, and 242 tests green |
| Shared Plite proof | yes | Plite React 842 tests and full `check:plite` green |
| Browser proof | yes | Focused rows and full Chromium lane green |
| Source audits | yes | Old wrappers, internal export, fake types, stale direct APIs, and debug artifacts clean |
| Review | yes | No unresolved actionable scoped finding |
| Changeset | yes | Major migration changeset present |
| Git publication | no | User did not authorize stage, commit, push, or PR |

Reboot status:
Current tree is closure-ready for the Yjs package. Re-running starts from the 58-file manifest and the green Yjs plus `check:plite` gates; no compatibility or Plite-gap lane remains.

Open risks:
None in the Yjs packet. The unrelated root lint backlog remains outside this package closure and does not affect the owning green gates.
