# Progress Log

## Session: 2026-03-06

### Phase 1: Audit and Taxonomy
- **Status:** complete
- Actions taken:
  - Audited test hotspots by file and by `__tests__` directory.
  - Defined the unit / contract / golden I/O taxonomy.
  - Logged completed waves in the detailed `.claude` plan.
- Files created/modified:
  - `.claude/skills/testing/testing.mdc`
  - `.claude/docs/plans/2026-03-06-test-suite-cleanup-plan.md`

### Phase 2: Current Refactor Batch
- **Status:** complete
- Actions taken:
  - Rewrote `streamInsertChunk.spec.tsx` to remove skips, snapshots, and oversized fixture noise.
  - Collapsed `mergeDeepToNodes` into one adjacent unit spec with plain object fixtures.
  - Switched `withAutoformat/trigger.spec.tsx` from `createPlateEditor` to `createSlateEditor` and removed duplicated setup.
- Files created/modified:
  - `packages/ai/src/react/ai-chat/streaming/streamInsertChunk.spec.tsx`
  - `packages/ai/src/react/ai-chat/streaming/__snapshots__/streamInsertChunk.spec.tsx.snap`
  - `packages/core/src/lib/utils/mergeDeepToNodes.spec.ts`
  - `packages/core/src/lib/utils/__tests__/mergeDeepToNodes/*`
  - `packages/autoformat/src/lib/__tests__/withAutoformat/trigger.spec.tsx`

### Phase 3: Verification
- **Status:** complete
- Actions taken:
  - Ran targeted Bun tests for the rewritten AI, core utils, and autoformat specs.
  - Ran package-level build verification for `ai`, `core`, and `autoformat`.
  - Ran package-level typecheck verification for `ai` and `core`.
  - Isolated and then cleared the existing `autoformat` typecheck blocker in untouched specs.
- Files created/modified:
  - `task_plan.md`
  - `findings.md`
  - `progress.md`

### Phase 4: Autoformat Hotspot Cleanup
- **Status:** complete
- Actions taken:
  - Added `createAutoformatEditor.ts` under the `withAutoformat` suite and reused it across the focused hotspot specs.
  - Rewrote `text.spec.tsx`, `markup.spec.tsx`, `ignoreTrim.spec.tsx`, `mark/multiple-marks.spec.tsx`, `trigger.spec.tsx`, and `block/singleCharTrigger.spec.tsx` around package-local rules or `KEYS`.
  - Removed the `@platejs/basic-nodes/react` and `@platejs/link/react` test imports that were only used for `.key`.
  - Cleared the `@platejs/autoformat` package typecheck failure without adding broader integration coverage.
- Files created/modified:
  - `packages/autoformat/src/lib/__tests__/withAutoformat/createAutoformatEditor.ts`
  - `packages/autoformat/src/lib/__tests__/withAutoformat/text.spec.tsx`
  - `packages/autoformat/src/lib/__tests__/withAutoformat/markup.spec.tsx`
  - `packages/autoformat/src/lib/__tests__/withAutoformat/ignoreTrim.spec.tsx`
  - `packages/autoformat/src/lib/__tests__/withAutoformat/mark/multiple-marks.spec.tsx`
  - `packages/autoformat/src/lib/__tests__/withAutoformat/block/singleCharTrigger.spec.tsx`
  - `packages/autoformat/src/lib/__tests__/withAutoformat/trigger.spec.tsx`
  - `.claude/skills/testing/testing.mdc`
  - `.claude/docs/plans/2026-03-06-test-suite-cleanup-plan.md`

### Phase 5: Autoformat Block and Basic Mark Cleanup
- **Status:** complete
- Actions taken:
  - Rewrote the remaining `withAutoformat` block specs around local rules and the minimum base plugins they actually need.
  - Collapsed the four one-case basic mark specs into `mark/basic-marks.spec.tsx`.
  - Deleted the remaining `AutoformatKit`, `createPlateEditor`, and placeholder-title usage from the whole `withAutoformat` suite.
  - Removed the extra app-coupled toggle case from the list-focused package suite.
- Files created/modified:
  - `packages/autoformat/src/lib/__tests__/withAutoformat/block/list.spec.tsx`
  - `packages/autoformat/src/lib/__tests__/withAutoformat/block/code-block.spec.tsx`
  - `packages/autoformat/src/lib/__tests__/withAutoformat/block/heading.spec.tsx`
  - `packages/autoformat/src/lib/__tests__/withAutoformat/block/blockquote.spec.tsx`
  - `packages/autoformat/src/lib/__tests__/withAutoformat/block/preFormat.spec.tsx`
  - `packages/autoformat/src/lib/__tests__/withAutoformat/invalid.spec.tsx`
  - `packages/autoformat/src/lib/__tests__/withAutoformat/mark/basic-marks.spec.tsx`
  - `packages/autoformat/src/lib/__tests__/withAutoformat/mark/bold.spec.tsx`
  - `packages/autoformat/src/lib/__tests__/withAutoformat/mark/italic.spec.tsx`
  - `packages/autoformat/src/lib/__tests__/withAutoformat/mark/code.spec.tsx`
  - `packages/autoformat/src/lib/__tests__/withAutoformat/mark/strikethrough.spec.tsx`
  - `.claude/skills/testing/testing.mdc`
  - `.claude/docs/plans/2026-03-06-test-suite-cleanup-plan.md`

### Phase 6: Repo-wide Title and Snapshot Hardening
- **Status:** complete
- Actions taken:
  - Ran a file-by-file matrix scan for hidden title debt in plain strings, `it.each` format strings, and snapshot keys.
  - Cleaned the remaining title debt in `Plate.spec.tsx`, `init.spec.ts`, `removeMarks.spec.tsx`, `serializeMd.spec.tsx`, and `deserializeMdList.spec.tsx`.
  - Replaced the two whitespace-sensitive markdown serializer snapshot assertions with explicit string assertions.
  - Deleted and regenerated the markdown snapshot files so dead keys from renamed tests were actually removed.
  - Re-ran repo-wide changed-spec verification plus package build/typecheck for `core`, `slate`, and `markdown`.
- Files created/modified:
  - `packages/core/src/react/components/Plate.spec.tsx`
  - `packages/core/src/lib/plugins/slate-extension/transforms/init.spec.ts`
  - `packages/slate/src/internal/transforms-extension/removeMarks.spec.tsx`
  - `packages/markdown/src/lib/serializer/serializeMd.spec.tsx`
  - `packages/markdown/src/lib/serializer/__snapshots__/serializeMd.spec.tsx.snap`
  - `packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx`
  - `packages/markdown/src/lib/deserializer/__snapshots__/deserializeMdList.spec.tsx.snap`
  - `.claude/skills/testing/testing.mdc`
  - `task_plan.md`
  - `findings.md`
  - `progress.md`
  - `.claude/docs/plans/2026-03-06-test-suite-cleanup-plan.md`

### Phase 7: Core Plugin Composition Cleanup
- **Status:** complete
- Actions taken:
  - Re-scanned the suite file by file after the title pass to find the remaining editor-heavy hotspots.
  - Refactored `resolvePlugins.spec.tsx` around `getResolvedKeys(...)`, `getSortedKeys(...)`, and `it.each(...)` for the deterministic plugin ordering cases.
  - Moved the pure option-store and selector-extension cases in `resolvePlugins-store.spec.tsx` to `createSlateEditor`.
  - Deleted the overlapping rerender test in `resolvePlugins-store.spec.tsx` and kept the more focused hook-level rerender coverage under `usePluginOption`.
- Files created/modified:
  - `packages/core/src/internal/plugin/resolvePlugins.spec.tsx`
  - `packages/core/src/internal/plugin/resolvePlugins-store.spec.tsx`
  - `.claude/skills/testing/testing.mdc`
  - `task_plan.md`
  - `findings.md`
  - `progress.md`
  - `.claude/docs/plans/2026-03-06-test-suite-cleanup-plan.md`

### Phase 8: Pure Plugin API Seam Cleanup
- **Status:** complete
- Actions taken:
  - Re-scanned the matrix after the core plugin-composition pass and confirmed `extendApi.spec.ts` was still using the Plate seam for pure plugin API and transform composition.
  - Switched `extendApi.spec.ts` to `createSlateEditor` via one local helper and kept the file scoped to pure plugin composition behavior.
  - Left the remaining big suites alone after the rescan because they now read as legitimate React or transform boundary coverage rather than obvious fake integration.
- Files created/modified:
  - `packages/core/src/lib/utils/extendApi.spec.ts`
  - `.claude/skills/testing/testing.mdc`
  - `task_plan.md`
  - `findings.md`
  - `progress.md`
  - `.claude/docs/plans/2026-03-06-test-suite-cleanup-plan.md`

### Phase 9: Dead Commented Spec Cleanup
- **Status:** complete
- Actions taken:
  - Ran a repo-wide scan for commented-out `it`, `test`, and `describe` blocks in spec files.
  - Deleted the dead commented blocks from `shortcuts`, `useEditableProps`, `EditorMethodsEffect`, `pluginDeserializeHtml`, `SlateExtensionPlugin`, `withList`, `setSelectedCellsBorder`, `cleanDocx`, `withImageUpload`, and `computeDiff`.
  - Extended `testing.mdc` so future cleanup passes scan and delete commented-out test corpses instead of preserving them as junk comments.
- Files created/modified:
  - `packages/core/src/react/utils/shortcuts.spec.tsx`
  - `packages/core/src/react/hooks/useEditableProps.spec.tsx`
  - `packages/core/src/react/components/EditorMethodsEffect.spec.tsx`
  - `packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.spec.ts`
  - `packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.spec.tsx`
  - `packages/list-classic/src/lib/withList.spec.tsx`
  - `packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.spec.tsx`
  - `packages/docx/src/lib/docx-cleaner/cleanDocx.spec.ts`
  - `packages/media/src/lib/image/withImageUpload.spec.tsx`
  - `packages/diff/src/lib/computeDiff.spec.ts`
  - `.claude/skills/testing/testing.mdc`
  - `task_plan.md`
  - `findings.md`
  - `progress.md`
  - `.claude/docs/plans/2026-03-06-test-suite-cleanup-plan.md`

### Phase 10: Override Rule Matrix Cleanup
- **Status:** complete
- Actions taken:
  - Re-scanned the top editor-heavy hotspots after the commented-spec pass.
  - Refactored `withBreakRules.spec.tsx` around `createElementPlugin(...)`, `runInsertBreak(...)`, and `it.each(...)` for the duplicated empty-reset and default-behavior cases.
  - Renamed the raw config-driven `describe(...)` blocks to semantic behavior groups and kept the remaining edge cases as focused one-off tests.
- Files created/modified:
  - `packages/core/src/lib/plugins/override/withBreakRules.spec.tsx`
  - `.claude/skills/testing/testing.mdc`
  - `task_plan.md`
  - `findings.md`
  - `progress.md`
  - `.claude/docs/plans/2026-03-06-test-suite-cleanup-plan.md`

### Phase 11: Delete Rule Sibling Cleanup
- **Status:** complete
- Actions taken:
  - Refactored `withDeleteRules.spec.tsx` around `createElementPlugin(...)`, `getEditorAfterAction(...)`, and `it.each(...)` for the repeated start/default cases.
  - Kept assertions in the test bodies and used helpers only for editor setup and delete actions so the file stays Biome-clean.
  - Renamed the raw config-driven groups to semantic behavior groups.
- Files created/modified:
  - `packages/core/src/lib/plugins/override/withDeleteRules.spec.tsx`
  - `.claude/skills/testing/testing.mdc`
  - `task_plan.md`
  - `findings.md`
  - `progress.md`
  - `.claude/docs/plans/2026-03-06-test-suite-cleanup-plan.md`

### Phase 12: Final No-Change Audit
- **Status:** complete
- Actions taken:
  - Re-ran repo-wide scans for skipped tests, placeholder titles, commented-out tests, cross-spec imports, and remaining `createPlateEditor` seams.
  - Confirmed the remaining `createPlateEditor` list is the intentional React/provider/render/store and Plate-only allowlist already captured in the detailed `.claude` plan.
  - Confirmed the remaining `__tests__/` specs are the expected fixture-heavy or intentionally split suites.
- Files created/modified:
  - `task_plan.md`
  - `findings.md`
  - `progress.md`
  - `.claude/docs/plans/2026-03-06-test-suite-cleanup-plan.md`

## Test Results
| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
| AI streaming specs | `bun test packages/ai/src/react/ai-chat/streaming/streamInsertChunk.spec.tsx packages/ai/src/react/ai-chat/streaming/streamDeserializeMd.spec.tsx packages/ai/src/react/ai-chat/streaming/streamSerializeMd.spec.tsx` | Rewritten streaming suite passes | 27 pass, 0 fail | ✓ |
| AI build | `pnpm turbo build --filter=./packages/ai` | Package builds | Passed | ✓ |
| AI typecheck | `pnpm turbo typecheck --filter=./packages/ai` | Package typechecks | Passed | ✓ |
| Core + autoformat build | `pnpm turbo build --filter=./packages/core --filter=./packages/autoformat` | Packages build | Passed | ✓ |
| Core utils + autoformat specs | `bun test packages/core/src/lib/utils/mergeDeepToNodes.spec.ts packages/autoformat/src/lib/__tests__/withAutoformat/trigger.spec.tsx` | Rewritten suites pass | 11 pass, 0 fail | ✓ |
| Core typecheck | `pnpm turbo typecheck --filter=./packages/core` | Package typechecks | Passed | ✓ |
| Autoformat hotspot specs | `bun test packages/autoformat/src/lib/__tests__/withAutoformat/text.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/markup.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/ignoreTrim.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/mark/multiple-marks.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/block/singleCharTrigger.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/trigger.spec.tsx` | Rewritten suites pass | 18 pass, 0 fail | ✓ |
| Autoformat build | `pnpm turbo build --filter=./packages/autoformat` | Package builds | Passed | ✓ |
| Autoformat typecheck | `pnpm turbo typecheck --filter=./packages/autoformat` | Package typechecks | Passed | ✓ |
| Autoformat touched-file Biome | `pnpm exec biome check --write packages/autoformat/src/lib/__tests__/withAutoformat/createAutoformatEditor.ts packages/autoformat/src/lib/__tests__/withAutoformat/text.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/markup.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/ignoreTrim.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/mark/multiple-marks.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/block/singleCharTrigger.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/trigger.spec.tsx` | Formatting and lint pass | Passed, 1 file auto-fixed | ✓ |
| Autoformat suite sweep | `bun test packages/autoformat/src/lib/__tests__/withAutoformat/block/list.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/block/code-block.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/block/heading.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/block/blockquote.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/block/preFormat.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/invalid.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/mark/basic-marks.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/mark/multiple-marks.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/text.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/markup.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/ignoreTrim.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/block/singleCharTrigger.spec.tsx packages/autoformat/src/lib/__tests__/withAutoformat/trigger.spec.tsx` | Rewritten block and mark suites pass | 36 pass, 0 fail | ✓ |
| Autoformat rebuild after block cleanup | `pnpm turbo build --filter=./packages/autoformat` | Package builds after final test edits | Passed | ✓ |
| Autoformat re-typecheck after block cleanup | `pnpm turbo typecheck --filter=./packages/autoformat` | Package typechecks after final test edits | Passed | ✓ |
| Title-hardening targeted sweep | `bun test packages/core/src/react/components/Plate.spec.tsx packages/core/src/lib/plugins/slate-extension/transforms/init.spec.ts packages/slate/src/internal/transforms-extension/removeMarks.spec.tsx packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx packages/markdown/src/lib/serializer/serializeMd.spec.tsx` | Cleaned suites pass with regenerated snapshots | 79 pass, 0 fail | ✓ |
| Markdown snapshot regeneration | `bun test -u packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx packages/markdown/src/lib/serializer/serializeMd.spec.tsx` | Snapshot files recreated without stale keys | 18 pass, 0 fail | ✓ |
| Repo-wide changed-spec sweep | `git diff --name-only -- packages | rg '\.spec\.' | xargs bun test` | All changed specs still pass | 1590 pass, 0 fail | ✓ |
| Core + slate + markdown build | `pnpm turbo build --filter=./packages/core --filter=./packages/slate --filter=./packages/markdown` | Packages build | Passed | ✓ |
| Core + slate + markdown typecheck | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/slate --filter=./packages/markdown` | Packages typecheck | Passed | ✓ |
| Repo-wide touched-file Biome | `git diff --name-only -- . ':(exclude)pnpm-lock.yaml' | xargs pnpm exec biome check --write` | Formatting and lint pass on changed files | Checked 211 files, fixed 4 | ✓ |
| Title-debt scan | `rg -n '^[[:space:]]*(it|test|describe)\([^\n]*(should|fixures|qoute)|^[[:space:]]*\]\)\([^\n]*(should|fixures|qoute)' packages --glob '*.spec.*'` | No tracked title debt remains | No matches | ✓ |
| Snapshot-key scan | `rg -n 'exports\[\`.*(should |fixures|qoute|serialize a |deserialize a )' packages --glob '*.snap'` | No stale snapshot keys remain | No matches | ✓ |
| Diff check | `git diff --check` | No whitespace or patch-format issues | Clean | ✓ |
| Core plugin-composition specs | `bun test packages/core/src/internal/plugin/resolvePlugins.spec.tsx packages/core/src/internal/plugin/resolvePlugins-store.spec.tsx` | Refactored core plugin specs pass | 52 pass, 0 fail | ✓ |
| Core rebuild after plugin-composition cleanup | `pnpm turbo build --filter=./packages/core` | Package builds after refactor | Passed | ✓ |
| Core re-typecheck after plugin-composition cleanup | `pnpm turbo typecheck --filter=./packages/core` | Package typechecks after refactor | Passed | ✓ |
| Pure plugin API seam sweep | `bun test packages/core/src/lib/utils/extendApi.spec.ts packages/core/src/internal/plugin/resolvePlugins.spec.tsx packages/core/src/internal/plugin/resolvePlugins-store.spec.tsx` | Refactored pure core composition specs pass | 72 pass, 0 fail | ✓ |
| Core rebuild after pure seam cleanup | `pnpm turbo build --filter=./packages/core` | Package builds after seam narrowing | Passed | ✓ |
| Core re-typecheck after pure seam cleanup | `pnpm turbo typecheck --filter=./packages/core` | Package typechecks after seam narrowing | Passed | ✓ |
| Dead commented-spec sweep | `bun test packages/core/src/react/utils/shortcuts.spec.tsx packages/core/src/react/hooks/useEditableProps.spec.tsx packages/core/src/react/components/EditorMethodsEffect.spec.tsx packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.spec.ts packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.spec.tsx packages/list-classic/src/lib/withList.spec.tsx packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.spec.tsx packages/docx/src/lib/docx-cleaner/cleanDocx.spec.ts packages/media/src/lib/image/withImageUpload.spec.tsx packages/diff/src/lib/computeDiff.spec.ts` | Touched cleanup specs still pass after comment deletion | 90 pass, 0 fail | ✓ |
| Dead commented-spec package build | `pnpm turbo build --filter=./packages/core --filter=./packages/table --filter=./packages/list-classic --filter=./packages/docx --filter=./packages/media --filter=./packages/diff` | Affected packages build | Passed | ✓ |
| Dead commented-spec package typecheck | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/table --filter=./packages/list-classic --filter=./packages/docx --filter=./packages/media --filter=./packages/diff` | Affected packages typecheck | Passed | ✓ |
| Commented test scan | `rg -n '^\\s*//\\s*(it|test|describe)\\(' packages --glob '*.spec.ts' --glob '*.spec.tsx'` | No commented-out test blocks remain | No matches | ✓ |
| Override-rule matrix cleanup | `bun test packages/core/src/lib/plugins/override/withBreakRules.spec.tsx` | Refactored break-rule suite still passes | 15 pass, 0 fail | ✓ |
| Override-rule core build | `pnpm turbo build --filter=./packages/core` | Core still builds after break-rule refactor | Passed | ✓ |
| Override-rule core typecheck | `pnpm turbo typecheck --filter=./packages/core` | Core still typechecks after break-rule refactor | Passed | ✓ |
| Delete-rule sibling cleanup | `bun test packages/core/src/lib/plugins/override/withDeleteRules.spec.tsx` | Refactored delete-rule suite still passes | 14 pass, 0 fail | ✓ |
| Delete-rule core build | `pnpm turbo build --filter=./packages/core` | Core still builds after delete-rule refactor | Passed | ✓ |
| Delete-rule core typecheck | `pnpm turbo typecheck --filter=./packages/core` | Core still typechecks after delete-rule refactor | Passed | ✓ |
| Core + table seam narrowing | `bun test packages/core/src/lib/utils/overrideEditor.spec.ts packages/core/src/lib/editor/SlateEditorMethods.spec.ts packages/basic-nodes/src/lib/BaseHeadingPlugin.spec.ts packages/core/src/lib/plugin/createSlatePlugin.spec.ts packages/table/src/lib/transforms/insertTable.spec.tsx packages/table/src/lib/transforms/insertTableColumn.spec.tsx packages/table/src/lib/transforms/deleteColumn.spec.tsx packages/table/src/lib/transforms/insertTableRow.spec.tsx` | Deterministic core and table seams pass on `createSlateEditor` | 93 pass, 0 fail | ✓ |
| Core + table seam build | `pnpm turbo build --filter=./packages/core --filter=./packages/basic-nodes --filter=./packages/table` | Touched packages build after seam narrowing | Passed | ✓ |
| Core + table seam typecheck | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/basic-nodes --filter=./packages/table` | Touched packages typecheck after seam narrowing | Passed | ✓ |
| HTML + selection sweep | `bun test packages/core/src/lib/plugins/html/HtmlPlugin.spec.tsx packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.spec.ts packages/core/src/lib/plugins/html/utils/deserializeHtml.spec.tsx packages/core/src/lib/plugins/html/utils/deserializeHtmlElement.spec.tsx packages/core/src/lib/plugins/html/utils/deserializeHtmlNode.spec.tsx packages/core/src/lib/plugins/html/utils/deserializeHtmlNodeGoogleDocs.spec.tsx packages/core/src/lib/plugins/html/utils/htmlElementToLeaf.spec.tsx packages/core/src/lib/plugins/html/utils/htmlElementToElement.spec.tsx packages/core/src/lib/plugins/html/utils/htmlBodyToFragment.spec.tsx packages/selection/src/internal/transforms/selectBlocks.spec.tsx packages/selection/src/react/internal/api/setSelectedIds.spec.tsx packages/selection/src/react/utils/copySelectedBlocks.spec.tsx packages/selection/src/react/internal/api/moveSelection.spec.tsx packages/selection/src/react/internal/api/shiftSelection.spec.tsx` | HTML seams narrowed; selection exceptions verified | 90 pass, 0 fail | ✓ |
| HTML + selection typecheck | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/selection` | Touched packages typecheck after seam and exception validation | Passed | ✓ |
| Code-block seam cleanup | `bun test packages/code-block/src/lib/queries/isCodeBlockEmpty.spec.tsx packages/code-block/src/lib/queries/isSelectionAtCodeBlockStart.spec.tsx packages/code-block/src/lib/setCodeBlockToDecorations.spec.ts packages/code-block/src/lib/transforms/indentCodeLine.spec.tsx packages/code-block/src/lib/transforms/insertCodeBlock.spec.tsx packages/code-block/src/lib/transforms/insertCodeLine.spec.tsx packages/code-block/src/lib/transforms/insertEmptyCodeBlock.spec.tsx packages/code-block/src/lib/transforms/outdentCodeLine.spec.tsx packages/code-block/src/lib/transforms/toggleCodeBlock.spec.tsx packages/code-block/src/lib/transforms/unwrapCodeBlock.spec.tsx packages/code-block/src/lib/withCodeBlock.spec.tsx packages/code-block/src/lib/withInsertDataCodeBlock.spec.tsx packages/code-block/src/lib/withInsertFragmentCodeBlock.spec.tsx packages/code-block/src/lib/withNormalizeCodeBlock.spec.tsx packages/code-block/src/react/CodeBlockPlugin.spec.tsx packages/core/src/lib/plugins/debug/DebugPlugin.spec.ts packages/core/src/lib/plugin/getEditorPlugin.spec.ts` | Deterministic `code-block` and pure plugin utility seams pass | 49 pass, 0 fail | ✓ |
| Code-block seam build | `pnpm turbo build --filter=./packages/code-block --filter=./packages/core` | Touched packages build after seam cleanup | Passed | ✓ |
| Code-block seam typecheck | `pnpm turbo typecheck --filter=./packages/code-block --filter=./packages/core` | Touched packages typecheck after seam cleanup | Passed | ✓ |
| Non-core seam sweep | `bun test packages/date/src/lib/BaseDatePlugin.spec.tsx packages/dnd/src/transforms/onHoverNode.spec.ts packages/dnd/src/transforms/onDropNode.spec.ts packages/layout/src/lib/transforms/setColumns.spec.tsx packages/layout/src/lib/transforms/toggleColumnGroup.spec.tsx packages/link/src/lib/withLink.spec.tsx packages/link/src/react/utils/getLinkAttributes.spec.ts packages/media/src/lib/image/withImageUpload.spec.tsx packages/slate/src/internal/editor/isEmpty.spec.tsx packages/slate/src/interfaces/node-children.spec.tsx packages/core/src/lib/utils/normalizeDescendantsToDocumentFragment.spec.tsx packages/markdown/src/lib/rules/defaultRule.spec.ts packages/markdown/src/lib/deserializer/deserializeMd.spec.tsx packages/list/src/lib/ListPlugin.spec.tsx` | Deterministic package seams pass on `createSlateEditor` | 119 pass, 0 fail | ✓ |
| Non-core seam build | `pnpm turbo build --filter=./packages/date --filter=./packages/dnd --filter=./packages/layout --filter=./packages/link --filter=./packages/media --filter=./packages/slate --filter=./packages/core --filter=./packages/markdown --filter=./packages/list` | Touched packages build after the final seam cleanup | Passed | ✓ |
| Non-core seam typecheck | `pnpm turbo typecheck --filter=./packages/date --filter=./packages/dnd --filter=./packages/layout --filter=./packages/link --filter=./packages/media --filter=./packages/slate --filter=./packages/core --filter=./packages/markdown --filter=./packages/list` | Touched packages typecheck after the final seam cleanup | Passed | ✓ |
| Final no-change audit: skips | `rg -n "\\b(it|test)\\.skip\\b|\\bdescribe\\.skip\\b" packages --glob "*.spec.ts" --glob "*.spec.tsx"` | No skipped tests remain in package specs | No matches | ✓ |
| Final no-change audit: title debt | `rg -n "^[[:space:]]*(it|test|describe)\\([^\\n]*(should|fixures|qoute)|^[[:space:]]*\\]\\)\\([^\\n]*(should|fixures|qoute)" packages --glob "*.spec.ts" --glob "*.spec.tsx"` | No tracked placeholder titles remain | No matches | ✓ |
| Final no-change audit: commented tests | `rg -n "^\\s*//\\s*(it|test|describe)\\(" packages --glob "*.spec.ts" --glob "*.spec.tsx"` | No commented-out tests remain | No matches | ✓ |
| Final no-change audit: cross-spec imports | `rg -n "(\\.spec|\\.test)['\\\"]|from ['\\\"][^'\\\"]*\\.spec|from ['\\\"][^'\\\"]*\\.test" packages --glob "*.spec.ts" --glob "*.spec.tsx"` | No spec imports another spec | No matches | ✓ |
| Final no-change audit: intentional Plate allowlist | `rg -n "createPlateEditor\\(" packages --glob "*.spec.ts" --glob "*.spec.tsx"` | Remaining usages are intentional React/provider/render/store or Plate-only suites | Allowlist only | ✓ |
| Final no-change audit: markdown helper leak | `rg -n "MarkdownKit|apps/www/src/registry/components/editor/plugins/markdown-kit" packages/markdown/src -g '!**/*.snap'` | Markdown package no longer imports app registry helpers | No matches | ✓ |

## Error Log
| Timestamp | Error | Attempt | Resolution |
|-----------|-------|---------|------------|
| 2026-03-06 | `streamInsertChunk.spec.tsx` helper triggered `noMisplacedAssertion` | 1 | Moved the assertion back into each `it()` |
| 2026-03-06 | `mergeDeepToNodes.spec.ts` editor-root cases compared whole editor objects | 1 | Used a real editor and asserted on `children` plus root boundaries |
| 2026-03-06 | `autoformat` typecheck failed on unresolved imports from `@platejs/basic-nodes/react` and `@platejs/link/react` in existing specs | 1 | Removed the React-only `.key` imports from the hotspot specs and typecheck passed |
| 2026-03-06 | `planning-with-files` catchup script pointed at a missing `~/.codex/skills/planning-with-files` path | 1 | Used the existing root planning files and continued without the helper script |
| 2026-03-06 | `bun test -u` kept stale markdown snapshot keys after title renames | 1 | Deleted the snapshot files and regenerated them from scratch |
| 2026-03-06 | `git diff --check` flagged meaningful trailing spaces in markdown snapshots | 1 | Replaced those two snapshot assertions with explicit string assertions |
| 2026-03-06 | The post-title matrix still showed core plugin-composition tests rebuilding editors inline | 1 | Refactored `resolvePlugins.spec.tsx` with helpers and moved pure store cases in `resolvePlugins-store.spec.tsx` to `createSlateEditor` |
| 2026-03-06 | `extendApi.spec.ts` was still using the Plate editor seam despite having no React behavior in scope | 1 | Switched the file to `createSlateEditor` through a local helper and left the real React boundary suites untouched |
| 2026-03-06 | `moveSelection.spec.tsx` and `shiftSelection.spec.tsx` failed after a forced `createSlateEditor` conversion | 1 | Reverted both files and recorded them as intentional Plate-only exceptions |
| 2026-03-06 | The markdown package helper still imported `MarkdownKit` from `apps/www` | 1 | Replaced it with local `MarkdownPlugin.configure(...)` plus the same remark plugins |

## 5-Question Reboot Check
| Question | Answer |
|----------|--------|
| Where am I? | Cleanup pass complete |
| Where am I going? | No open title or snapshot debt remains in the tracked patterns, and the remaining big suites now mostly look like legitimate boundary coverage |
| What's the goal? | Replace low-signal tests with smaller, clearer seams |
| What have I learned? | See `findings.md` |
| What have I done? | See the phase logs above |
