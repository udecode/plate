# Repair Custom BaseEditor Types

Objective:
Repair places where cleanup had replaced `BaseEditor` with narrow custom editor
types, without weakening the Plate/Plite API boundary.

Completion threshold:
- [x] Fake editor aliases and getType/read-only replacement types are removed
      where a real editor type fits.
- [x] Production helpers use `BaseEditor`, `PlateRuntimeEditor`, or an explicit
      tiny package protocol only when the real editor types do not overlap yet.
- [x] Tests are updated to mock the current direct editor API instead of old
      `getBasePlugin` context wrappers.
- [x] Focused package typechecks and runtime tests pass.
- [x] Source scan has no remaining bad replacement types.

Scope:
- Core/Plate helper types, Plite DOM/React runtime editor generics, layout
  transform helpers, link/selection/cursor tests, and package type fallout.

Non-goals:
- No public API design beyond repairing the current type boundary.
- No PR, commit, changeset, or docs rendering.
- No browser proof; this is package/type/test surface only.

Verification surface:
- Source scan for fake replacement editor types.
- Focused package typechecks for core, layout, dnd, link, table, tag, cursor,
  selection, plite-react, and plite-dom.
- Focused runtime tests for core, layout, dnd, link, table, tag, cursor, and
  selection.
- Scoped lint fixes for edited packages.

Constraints:
- Preserve current runtime behavior.
- Prefer real editor owner types over local structural aliases.
- Keep test-only casts local to fixtures when they cap TypeScript recursion.
- Do not commit, push, or create a PR.

Boundaries:
- Source of truth: current package source under `packages/**`.
- Allowed edit scope: editor helper types, runtime helper callers, tests, and
  generated barrels affected by moved layout transform exports.
- Browser surface: N/A, no rendered route changed.
- Release artifact: N/A, this is unreleased migration cleanup.

Blocked condition:
- None. If `PlateRuntimeEditor` must become assignable to Core `BaseEditor`,
  that is a separate Plate runtime boundary lane.

Work Checklist:
- [x] Capture explicit requirement: repair custom `BaseEditor` replacement
      types.
- [x] Replace fake aliases with `BaseEditor` where structurally correct.
- [x] Use a real runtime owner or tiny protocol only where `BaseEditor` does
      not yet fit.
- [x] Repair package type fallout from stricter editor/plugin types.
- [x] Update tests to mock the current direct editor API.
- [x] Run source scan, focused typechecks, focused tests, lint fixes, and barrel
      generation.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Requirement copied into checklist |
| Active goal | yes | Goal created for this plan |
| Browser decision | yes | N/A because no route or UI changed |
| Release artifact decision | yes | N/A because unreleased migration cleanup |

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Source scan, typechecks, tests, lint, brl recorded below |
| TypeScript changed | yes | Combined touched-package `turbo typecheck` passed |
| Package exports changed | yes | `pnpm --filter @platejs/layout brl` passed |
| Browser changed | no | No rendered route/UI changed |
| Changeset | no | Unreleased migration cleanup |
| PR/tracker | no | No PR/tracker requested |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Intake | done | Requirement captured in plan |
| Implementation | done | Replacement types repaired across touched packages |
| Verification | done | Typechecks/tests/source scan passed |
| Closeout | done | Plan updated for check-complete |

Changed files / areas:
- `packages/core/src/lib/utils/isType.ts`: uses `BaseEditor`.
- `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts`: uses `BaseEditor`.
- `packages/core/src/react/plugins/PliteReactExtensionPlugin.ts`: uses
  `BaseEditor`.
- `packages/core/src/lib/utils/hotkeys.ts`: uses `BaseEditor`.
- `packages/core/src/react/components/PlateContentEffects.tsx`: accepts the
  runtime editor shape needed by the React bridge.
- `packages/core/src/react/editor/createPlateRuntimeEditor.ts`: capped
  list-helper typing to avoid recursive runtime-editor expansion.
- `packages/core/src/internal/plugin/resolvePlugins.ts`,
  `packages/core/src/lib/plugin/createBasePlugin.ts`,
  `packages/core/src/static/pluginRenderLeafStatic.tsx`,
  `packages/core/src/static/pluginRenderTextStatic.tsx`,
  `packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.ts`: repaired
  plugin variance fallout from the BasePlugin/BaseEditor cleanup.
- `packages/layout/src/lib/transforms/*`: replaced `ColumnEditor` with
  `LayoutTransformEditor`, deleted the old narrow owner, and kept transforms on
  `editor.read` / `editor.update`.
- `packages/dnd/src/transforms/onDropNode.ts`,
  `packages/link/src/lib/LinkRules.ts`,
  `packages/link/src/lib/transforms/upsertLink.ts`,
  `packages/table/src/lib/utils/findTableNodePath.ts`,
  `packages/tag/src/lib/isEqualTags.ts`,
  `packages/tag/src/react/useSelectEditorCombobox.ts`,
  `packages/cursor/src/queries/getSelectionRects.ts`,
  `packages/selection/src/react/queries/getSelectionRects.ts`: removed narrow
  local editor replacement types.
- `packages/plite-dom/src/plugin/dom-editor.ts`,
  `packages/plite-react/src/plugin/react-editor.ts`,
  `packages/plite-react/src/hooks/use-plite-runtime.tsx`,
  `packages/plite-react/src/hooks/focus-plite-editable.ts`: preserved runtime
  extension tuple typing through DOM/React editor wrappers.
- `packages/link/src/react/*` and link specs: removed old `getBasePlugin`
  trigger path where direct editor option/API calls are the current API.
- `packages/selection/src/react/*` and selection specs: updated block
  selection helpers/tests to use direct plugin option and `editor.api`
  extension paths.
- `packages/cursor/src/queries/getSelectionRects.spec.ts`: updated mocks to use
  `editor.read`.

Important decision:
- `LayoutTransformEditor` remains as a tiny transform protocol because current
  `PlateRuntimeEditor` is not assignable to Core `BaseEditor` without dragging
  the whole Plate runtime type graph into `@platejs/layout`. This is not a
  fake getType-only alias; it names the exact read/update/getType protocol the
  layout transforms need. Broader unification belongs to the Plate runtime
  boundary lane.

Source scan:
- [x] Command:
  `rg -n 'Pick<BaseEditor|RuntimeReadable.*Editor|SelectionRectsEditor|TagReadableEditor|ColumnEditor|ComposingEditor|PliteReactKeyDownEditor|PliteEditableFocusEditor|editor: \{ read: BaseEditor|editor: \{ getType' packages -g '*.ts' -g '*.tsx'`
- [x] Result: only `packages/markdown/src/lib/columnSurface.spec.ts` local test
  factory `createColumnEditor`, which is not an editor replacement type.

Verification:
- [x] `pnpm --filter @platejs/core typecheck`
- [x] `pnpm --filter @platejs/layout typecheck`
- [x] `pnpm --filter @platejs/selection typecheck`
- [x] `pnpm --filter @platejs/dnd typecheck`
- [x] `pnpm --filter @platejs/link typecheck`
- [x] `pnpm --filter @platejs/table typecheck`
- [x] `pnpm --filter @platejs/tag typecheck`
- [x] `pnpm --filter @platejs/cursor typecheck`
- [x] `pnpm --filter @platejs/plite-react typecheck`
- [x] `pnpm --filter @platejs/plite-dom typecheck`
- [x] `pnpm turbo typecheck --filter=./packages/core --filter=./packages/layout --filter=./packages/dnd --filter=./packages/link --filter=./packages/table --filter=./packages/tag --filter=./packages/cursor --filter=./packages/selection --filter=./packages/plite-react --filter=./packages/plite-dom`
- [x] `pnpm --filter @platejs/layout brl`
- [x] `pnpm --filter @platejs/link lint:fix`
- [x] `pnpm --filter @platejs/selection lint:fix`
- [x] `pnpm --filter @platejs/cursor lint:fix`
- [x] `pnpm --filter @platejs/layout lint:fix`
- [x] `pnpm --filter @platejs/core test`
- [x] `pnpm --filter @platejs/layout test`
- [x] `pnpm --filter @platejs/dnd test`
- [x] `pnpm --filter @platejs/link test`
- [x] `pnpm --filter @platejs/table test`
- [x] `pnpm --filter @platejs/tag test`
- [x] `pnpm --filter @platejs/cursor test`
- [x] `pnpm --filter @platejs/selection test`

Verification notes:
- One attempted parallel verification ran package tests while the combined
  turbo typecheck/build was rewriting dependency `dist` output. Link/selection
  tests saw transient missing built modules. Rerunning after the build settled
  passed.
- Core tests still log existing duplicate-core / DOM coverage warnings, but the
  suite passes: 733 pass, 0 fail.

Verification evidence:
- Final source scan returned only the local test factory
  `packages/markdown/src/lib/columnSurface.spec.ts:createColumnEditor`.
- Final combined typecheck completed with 23 successful turbo tasks.
- Final rerun after lint/build concurrency: link tests 85 pass, selection tests
  102 pass.
- Earlier focused tests passed for core 733, layout 32, dnd 40, table 219, tag
  6, cursor 9.

Reboot status:
- Current. No reboot/compaction blocker remains; the summary handoff was
  continued and final verification reran in this turn.

Open risks:
- Low. `LayoutTransformEditor` is still a tiny structural transform protocol
  because making `PlateRuntimeEditor` assignable to Core `BaseEditor` is a
  broader runtime type-boundary job.

Completion gates:
- [x] Prompt requirements captured: repair all custom `BaseEditor`
      replacements.
- [x] Timed checkpoint: N/A, no duration requested.
- [x] Browser proof: N/A, no rendered/browser surface changed.
- [x] Changeset: N/A, this is unreleased migration cleanup and no release note
      was requested.
- [x] Agent-native review: N/A, no agent/rule/skill source changed.
- [x] PR/tracker sync: N/A, no PR/tracker action requested.
- [x] Output budget: broad command output was split by package; accidental
      parallel verification failure was recorded and rerun cleanly.
- [x] Goal plan complete: run check-complete before closing.

Final handoff:
- Outcome: custom replacement editor aliases are removed or narrowed to a real
  owner, and package checks pass.
- Caveat: `LayoutTransformEditor` is intentionally a tiny protocol until the
  Plate runtime editor is made structurally assignable to Core `BaseEditor`.
- Needs attention: only if you want zero structural protocols anywhere, that is
  a bigger Plate runtime type-boundary lane, not a local cleanup.
