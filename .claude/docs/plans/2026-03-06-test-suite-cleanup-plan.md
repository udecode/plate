---
title: Test Suite Cleanup Strategy
type: refactor
date: 2026-03-06
status: active
---

# Test Suite Cleanup Strategy

## Goal

Push the suite toward three layers only:

- Pure unit tests for deterministic logic.
- Thin editor or plugin contract tests for real Plate or Slate wiring.
- Golden input or output tests for serializer and parser behavior.

No coverage push in this phase. No e2e or browser work.

## Completed

### Pass 1

- Rebuilt the first hotspot batch around smaller behavior seams in `core`, `table`, `link`, `list-classic`, `markdown`, and `udecode/utils`.
- Removed low-signal tests like `getHandler.spec.ts`.
- Removed the old markdown snapshot for `deserializeMd`.
- Added initial testing taxonomy and helper-placement rules to `testing.mdc`.

### Pass 2

- Replaced dead skipped selection tests with direct API coverage in `packages/selection/src/react/internal/api/setSelectedIds.spec.tsx`.
- Standardized `NormalizeTypesPlugin` and `TrailingBlockPlugin` specs around a shared `normalizeRoot` helper.
- Cleaned small query specs in `list-classic`, `slate`, and `core` so titles describe behavior instead of placeholder text.
- Removed the misleading `resolvePlugin` “deep clone” test that asserted the opposite of its own title.

### Pass 3

- Moved the shared table helper out of `withNormalizeTable.spec.tsx` into `packages/table/src/lib/__tests__/getTestTablePlugins.ts`.
- Repointed table specs to the real helper module instead of importing from another spec file.
- Deleted `packages/table/src/react/onKeyDownTable.spec.tsx`, which had zero active tests and only commented or skipped intent.
- Deleted `packages/docx-io/src/lib/__tests__/lists.spec.tsx`, which was a fully skipped unsupported case.
- Removed the skipped unsupported link case from `streamDeserializeMd.spec.tsx`.
- Removed the skipped mixed-line-break case from `splitLineBreaks.spec.tsx` and compressed the active cases into a small matrix.
- Trimmed `Plate.spec.tsx` by deleting dead skipped cases, removing one duplicate id test, and renaming the remaining low-signal titles.
- Extended `testing.mdc` with cleanup-matrix guidance and a hard rule against aspirational skipped tests.

### Pass 4

- Moved the file-scoped static serializer specs out of `packages/core/src/static/__tests__/` into adjacent `serializeHtml.*.spec.*` files and left `create-static-editor.ts` behind as the only helper there.
- Removed the no-op placeholder from the old static `node-to-props` spec while moving it into `serializeHtml.node-props.spec.ts`.
- Moved `packages/udecode/react-hotkeys/src/__tests__/HotkeysProvider.test.tsx` to `packages/udecode/react-hotkeys/src/internal/HotkeysProvider.spec.tsx`, switched it to `.spec`, and trimmed one overlapping scope test.
- Replaced the old `find-replace` `__tests__/decorateSearchHighlight` specs with `packages/find-replace/src/lib/decorateFindReplace.spec.ts`, shifting most cases to direct unit tests and keeping one plugin wiring smoke test.
- Extended `testing.mdc` with explicit `.spec` naming rules and a `__tests__/` placement rule.

### Pass 5

- Rewrote `packages/ai/src/react/ai-chat/streaming/streamInsertChunk.spec.tsx` from a giant mixed-purpose integration file into a smaller contract suite with one chunk helper, targeted chunk-boundary assertions, and `it.each` markdown parity cases.
- Deleted all five skipped `streamInsertChunk` cases instead of preserving wishful thinking.
- Deleted the `streamInsertChunk` snapshot file and replaced both snapshot cases with explicit assertions.
- Removed the prompt-specific “skills and weather” fixture and the giant hand-written expected tree in favor of one smaller mixed markdown smoke case.
- Extended `testing.mdc` with a hard rule against casual snapshots and a streaming-markdown pattern for future tests.

### Pass 6

- Collapsed the eight-file `mergeDeepToNodes` split suite under `packages/core/src/lib/utils/__tests__/mergeDeepToNodes/` into one adjacent unit file at `packages/core/src/lib/utils/mergeDeepToNodes.spec.ts`.
- Replaced hyperscript fixtures in `mergeDeepToNodes` with plain object fixtures and one real editor object for the editor-root cases where `NodeApi` and `ElementApi` semantics differ.
- Upgraded the old source-factory coverage from a trivial single-node case to a multi-node assertion that proves the factory runs once per matched node.
- Refactored `packages/autoformat/src/lib/__tests__/withAutoformat/trigger.spec.tsx` to use `createSlateEditor`, `it.each`, and behavior titles instead of the old repeated `createPlateEditor` setup.
- Loaded the `planning-with-files` skill and added root planning-memory files so pass history, findings, and verification live on disk outside the chat transcript too.

### Pass 7

- Added `packages/autoformat/src/lib/__tests__/withAutoformat/createAutoformatEditor.ts` so focused `withAutoformat` specs share one small editor helper instead of cloning setup in every file.
- Rewrote `text.spec.tsx` around package-local rule arrays, explicit behavior titles, and one matrix plus one sequential percent case.
- Rewrote `markup.spec.tsx`, `ignoreTrim.spec.tsx`, `mark/multiple-marks.spec.tsx`, `trigger.spec.tsx`, and `block/singleCharTrigger.spec.tsx` to use `KEYS` or local rules instead of `@platejs/basic-nodes/react`, `@platejs/link/react`, or `www` app-kit imports.
- Cleared the `@platejs/autoformat` package typecheck blocker by removing the bad React-only key imports from the remaining failing hotspot specs.
- Extended `testing.mdc` with a hard rule against app-registry imports in package tests and a rule to use `KEYS` or base plugins instead of React plugin `.key` access.

### Pass 8

- Rewrote `block/list.spec.tsx`, `block/code-block.spec.tsx`, `block/heading.spec.tsx`, `block/blockquote.spec.tsx`, `block/preFormat.spec.tsx`, and `invalid.spec.tsx` around local rules plus only the base plugins each rule actually needs.
- Removed the last `AutoformatKit`, `createPlateEditor`, React-only `.key`, and placeholder-title usage from the entire `withAutoformat` suite.
- Collapsed the four one-case mark files into one matrix file at `mark/basic-marks.spec.tsx` and deleted the old `bold`, `italic`, `code`, and `strikethrough` spec files.
- Deleted the app-coupled toggle case from `block/list.spec.tsx` instead of keeping a misleading extra seam in a list-focused package suite.
- Extended `testing.mdc` with a rule to collapse one-case mark or block specs into one matrix and to add only the base plugins a block rule actually needs.

### Pass 9

- Ran a repo-wide file-by-file title scan that included plain string titles, `it.each(...)('...')` format strings, `String.raw\`...\`` titles, and snapshot keys derived from those titles.
- Cleaned the remaining title debt in `Plate.spec.tsx`, `init.spec.ts`, `removeMarks.spec.tsx`, `serializeMd.spec.tsx`, and `deserializeMdList.spec.tsx`.
- Replaced the two whitespace-sensitive markdown serializer snapshot assertions with direct `toBe(...)` string assertions.
- Deleted and regenerated the markdown snapshot files after the title renames because `bun test -u` kept the dead keys.
- Extended `testing.mdc` with the hidden-title scan rule and the Bun snapshot regeneration rule.

### Pass 10

- Re-ran the hotspot matrix after the title pass and focused the next cleanup on core plugin composition tests instead of chasing already-acceptable boundary suites.
- Refactored `resolvePlugins.spec.tsx` around `getResolvedKeys(...)`, `getSortedKeys(...)`, and `it.each(...)` for the deterministic plugin ordering cases.
- Moved the pure option-store and selector-extension cases in `resolvePlugins-store.spec.tsx` to `createSlateEditor`.
- Deleted the overlapping rerender test in `resolvePlugins-store.spec.tsx` and kept the more focused React hook rerender coverage.
- Extended `testing.mdc` with a rule to use `createSlateEditor` for non-React plugin store tests and to extract helpers for plugin-composition hotspots.

### Pass 11

- Re-ran the hotspot matrix after pass 10 and confirmed `extendApi.spec.ts` was still using the Plate editor seam for pure plugin API and transform composition.
- Switched `extendApi.spec.ts` to `createSlateEditor` via one local helper and left the file scoped to pure plugin composition behavior.
- Re-verified `extendApi.spec.ts` alongside the two refactored core plugin-composition specs.
- Left the remaining large suites untouched after the matrix showed they are now mostly genuine React or transform boundary coverage rather than obvious fake integration.

### Pass 12

- Ran a repo-wide scan for commented-out `it(...)`, `test(...)`, and `describe(...)` blocks inside spec files.
- Deleted the dead commented test blocks from `shortcuts`, `useEditableProps`, `EditorMethodsEffect`, `pluginDeserializeHtml`, `SlateExtensionPlugin`, `withList`, `setSelectedCellsBorder`, `cleanDocx`, `withImageUpload`, and `computeDiff`.
- Extended `testing.mdc` with a hard rule to delete commented-out tests and to include them in dead-spec cleanup scans.
- Re-verified the touched specs plus build and typecheck for the affected packages.

### Pass 13

- Re-ran the hotspot matrix after the commented-spec pass and picked `withBreakRules.spec.tsx` as the last worthwhile cleanup target.
- Rewrote `withBreakRules.spec.tsx` around `createElementPlugin(...)`, `runInsertBreak(...)`, and `it.each(...)` for the duplicated empty-reset and default-behavior cases.
- Renamed the raw config-driven `describe(...)` blocks to semantic behavior groups and kept the remaining edge cases as focused one-off tests.
- Re-verified the touched core spec plus core build and typecheck.

### Pass 14

- Picked `withDeleteRules.spec.tsx` as the obvious sibling of the break-rule hotspot after the `withBreakRules` cleanup worked.
- Rewrote `withDeleteRules.spec.tsx` around `createElementPlugin(...)`, `getEditorAfterAction(...)`, and `it.each(...)` for the repeated start-reset and default-behavior cases.
- Kept assertions inside `it()` bodies and used helpers only for setup and actions so the file stays Biome-clean.
- Re-verified the touched core spec.

### Pass 15

- Moved the remaining pure core and table transform specs from `createPlateEditor` to `createSlateEditor`, including `overrideEditor`, `SlateEditorMethods`, `BaseHeadingPlugin`, `createSlatePlugin`, `LengthPlugin`, `insertTable`, `insertTableColumn`, `deleteColumn`, `insertTableRow`, `withGetFragmentTable`, `setBorderSize`, `withTableCellSelection`, `getSelectedCellsBorders`, `getSelectedCellsBoundingBox`, `setCellBackground`, `withDeleteTable`, `isTableBorderHidden`, `withInsertTextTable`, and `setSelectedCellsBorder`.
- Left the single real component-override case in `resolvePlugins.spec.tsx` on the Plate seam.
- Cleaned the duplicate/sloppy titles in `TPlateEditor.spec.ts` and `TPlateEditorCore.spec.ts` without widening those suites.

### Pass 16

- Moved the HTML parser and deserializer specs to `createSlateEditor`.
- Moved `selectBlocks`, `setSelectedIds`, and `copySelectedBlocks` to `createSlateEditor`.
- Tried `moveSelection` and `shiftSelection` on `createSlateEditor`, proved that both files are genuinely Plate-bound, and reverted them.
- Documented the selection exception in `testing.mdc` instead of pretending the generic rule has no limits.

### Pass 17

- Moved the remaining deterministic `code-block` specs to `createSlateEditor`.
- Moved the pure `DebugPlugin` and `getEditorPlugin` specs to `createSlateEditor`.
- Re-verified the touched `code-block` and core packages.

### Pass 18

- Moved deterministic `date`, `dnd`, `layout`, `link`, `media`, `slate`, and `list` specs to `createSlateEditor`.
- Moved `normalizeDescendantsToDocumentFragment.spec.tsx` to `createSlateEditor` and `createSlatePlugin`.
- Re-verified the touched packages with targeted Bun tests plus package build and typecheck.

### Pass 19

- Replaced the markdown package helper import of `apps/www` `MarkdownKit` with local `MarkdownPlugin.configure(...)` plus the same remark plugins.
- Moved `defaultRule.spec.ts` and `deserializeMd.spec.tsx` to `createSlateEditor`.
- Replaced the tiny `defaultRule` snapshot assertions with explicit string assertions and deleted the snapshot file.
- Re-ran the repo-wide seam scan and confirmed the remaining `createPlateEditor` files are now intentional.

### Pass 20

- Re-ran repo-wide scans for skipped tests, placeholder titles, commented-out tests, cross-spec imports, and remaining `createPlateEditor` seams.
- Found no new actionable cleanup.
- Confirmed the remaining `createPlateEditor` files are still the intentional React/provider/render/store allowlist plus the two Plate-only selection APIs.
- Confirmed the remaining `__tests__/` specs are the expected fixture-heavy `docx` and `docx-io` suites plus the intentionally split `withAutoformat` suite.

## Matrix Scan

Snapshot taken during pass 3 before edits:

| File | Lines | Skips | `createPlateEditor` | `createSlateEditor` | `jsxt` hits | Placeholder hits | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `packages/core/src/react/components/Plate.spec.tsx` | 690 | 2 | 23 | 0 | 0 | 14 | High ROI React/provider cleanup |
| `packages/table/src/react/onKeyDownTable.spec.tsx` | 535 | 4 | 0 | 0 | 3 | 0 | Dead file: only skipped/commented cases |
| `packages/ai/src/react/ai-chat/streaming/streamInsertChunk.spec.tsx` | 864 | 5 | 0 | 2 | 3 | 2 | Large future pass |
| `packages/ai/src/react/ai-chat/streaming/streamDeserializeMd.spec.tsx` | 81 | 1 | 0 | 0 | 3 | 0 | Easy skip cleanup |
| `packages/markdown/src/lib/deserializer/splitLineBreaks.spec.tsx` | 147 | 1 | 0 | 0 | 3 | 0 | Easy skip cleanup |
| `packages/docx-io/src/lib/__tests__/lists.spec.tsx` | 66 | 1 | 0 | 0 | 0 | 0 | Fully skipped unsupported case |

Snapshot taken during pass 5 before edits:

| File | Lines | Skips | `createPlateEditor` | `createSlateEditor` | `jsxt` hits | Placeholder hits | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `packages/ai/src/react/ai-chat/streaming/streamInsertChunk.spec.tsx` | 864 | 5 | 0 | 3 | 4 | 18 | Main cleanup target |
| `packages/autoformat/src/lib/__tests__/withAutoformat/text.spec.tsx` | 289 | 0 | 0 | 9 | 4 | 8 | Heavy editor-harness text cases |
| `packages/autoformat/src/lib/__tests__/withAutoformat/trigger.spec.tsx` | 150 | 0 | 4 | 0 | 4 | 3 | React/editor seam likely too wide |
| `packages/core/src/lib/utils/__tests__/mergeDeepToNodes/default-options.spec.tsx` | 33 | 0 | 0 | 0 | 4 | 1 | Pure logic still living in `__tests__` |
| `packages/core/src/lib/utils/__tests__/mergeDeepToNodes/elements-text.spec.tsx` | 26 | 0 | 0 | 0 | 4 | 1 | Pure logic still using hyperscript |

Snapshot taken during pass 6 after edits:

| File | Lines | Skips | `createPlateEditor` | `createSlateEditor` | `jsxt` hits | Placeholder hits | `it.each` | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `packages/core/src/lib/utils/mergeDeepToNodes.spec.ts` | 216 | 0 | 0 | 0 | 0 | 0 | 2 | Collapsed 8 tiny specs into one unit suite |
| `packages/autoformat/src/lib/__tests__/withAutoformat/trigger.spec.tsx` | 103 | 0 | 0 | 1 | 4 | 0 | 1 | Same contract, smaller seam, no React editor |

Snapshot taken during pass 7 after edits:

| File | Lines | Skips | `createPlateEditor` | `createSlateEditor` | `jsxt` hits | Placeholder hits | `it.each` | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `packages/autoformat/src/lib/__tests__/withAutoformat/text.spec.tsx` | 227 | 0 | 0 | 0 | 4 | 0 | 1 | Uses package-local text rules instead of `AutoformatKit` |
| `packages/autoformat/src/lib/__tests__/withAutoformat/markup.spec.tsx` | 56 | 0 | 0 | 0 | 4 | 0 | 1 | One matrix covers both match shapes |
| `packages/autoformat/src/lib/__tests__/withAutoformat/ignoreTrim.spec.tsx` | 78 | 0 | 0 | 0 | 4 | 0 | 0 | Focused mark-rule contract only |
| `packages/autoformat/src/lib/__tests__/withAutoformat/mark/multiple-marks.spec.tsx` | 90 | 0 | 0 | 0 | 4 | 0 | 0 | No `www` app-kit import left |
| `packages/autoformat/src/lib/__tests__/withAutoformat/block/singleCharTrigger.spec.tsx` | 58 | 0 | 0 | 1 | 4 | 0 | 0 | Uses `KEYS.link`, no React plugin import |
| `packages/autoformat/src/lib/__tests__/withAutoformat/trigger.spec.tsx` | 100 | 0 | 0 | 0 | 4 | 0 | 1 | Shared helper plus `KEYS`, package typecheck now passes |

Snapshot taken during pass 8 after edits:

| File | Lines | Skips | `createPlateEditor` | `createSlateEditor` | `jsxt` hits | Placeholder hits | `it.each` | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `packages/autoformat/src/lib/__tests__/withAutoformat/block/list.spec.tsx` | 149 | 0 | 0 | 0 | 4 | 0 | 1 | Local list rules plus `BaseListPlugin` and `BaseIndentPlugin` only |
| `packages/autoformat/src/lib/__tests__/withAutoformat/block/code-block.spec.tsx` | 148 | 0 | 0 | 0 | 4 | 0 | 1 | Local code-block rule plus `BaseCodeBlockPlugin` only |
| `packages/autoformat/src/lib/__tests__/withAutoformat/block/heading.spec.tsx` | 60 | 0 | 0 | 0 | 4 | 0 | 1 | No app-kit dependency left |
| `packages/autoformat/src/lib/__tests__/withAutoformat/block/blockquote.spec.tsx` | 35 | 0 | 0 | 0 | 4 | 0 | 0 | Single focused block rule |
| `packages/autoformat/src/lib/__tests__/withAutoformat/block/preFormat.spec.tsx` | 39 | 0 | 0 | 0 | 4 | 0 | 0 | Focused nested-block contract only |
| `packages/autoformat/src/lib/__tests__/withAutoformat/invalid.spec.tsx` | 85 | 0 | 0 | 0 | 4 | 0 | 1 | Duplicate invalid case deleted |
| `packages/autoformat/src/lib/__tests__/withAutoformat/mark/basic-marks.spec.tsx` | 105 | 0 | 0 | 0 | 4 | 0 | 1 | Replaces 4 tiny one-case mark files |

Snapshot taken during pass 9 before edits:

| File | Title hits | Snapshot stale keys | Other issues | Notes |
| --- | ---: | ---: | --- | --- |
| `packages/core/src/react/components/Plate.spec.tsx` | 1 | 0 | echoed raw option name in `describe` | Semantic rename only |
| `packages/core/src/lib/plugins/slate-extension/transforms/init.spec.ts` | 2 | 0 | one misleading `does not call ...` title | Needed behavior-title cleanup |
| `packages/slate/src/internal/transforms-extension/removeMarks.spec.tsx` | 1 | 0 | raw option name in title | Semantic rename only |
| `packages/markdown/src/lib/serializer/serializeMd.spec.tsx` | 0 | 12 | `fixures`, `qoute`, base-verb titles, whitespace-sensitive snapshots | Needed title cleanup plus snapshot rewrite |
| `packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx` | 0 | 2 | `deserialize a ...` grammar | Snapshot regeneration required |

Snapshot taken during pass 10 after pass 9 cleanup:

| File | Editors | Lines | `it.each` | Notes |
| --- | ---: | ---: | ---: | --- |
| `packages/core/src/lib/plugins/affinity/AffinityPlugin.spec.tsx` | 27 | 1190 | 0 | Large, but still a real mark/link boundary contract suite |
| `packages/core/src/internal/plugin/resolvePlugins-store.spec.tsx` | 13 | 419 | 0 | Reduced pure-store cases to `createSlateEditor`; remaining React hook coverage is legitimate |
| `packages/core/src/lib/utils/extendApi.spec.ts` | 20 | 589 | 0 | Still large, but largely public API composition behavior |
| `packages/core/src/react/components/Plate.spec.tsx` | 18 | 618 | 0 | React/provider boundary coverage |
| `packages/core/src/internal/plugin/resolvePlugins.spec.tsx` | 14 | 678 | 2 | Deterministic sort cases collapsed into `it.each` |

Snapshot taken during pass 11 after pass 10 cleanup:

| File | Editors | Helper calls | Lines | Notes |
| --- | ---: | ---: | ---: | --- |
| `packages/core/src/lib/plugins/affinity/AffinityPlugin.spec.tsx` | 27 | 0 | 1190 | Still large, but clearly a mark/link boundary suite |
| `packages/core/src/react/components/Plate.spec.tsx` | 18 | 0 | 618 | React/provider boundary coverage |
| `packages/core/src/lib/plugins/override/withBreakRules.spec.tsx` | 16 | 0 | 725 | Transform boundary coverage |
| `packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.spec.tsx` | 16 | 0 | 535 | Plugin wiring boundary coverage |
| `packages/core/src/lib/utils/extendApi.spec.ts` | 1 | 21 | 561 | Dropped to the Slate seam with a local helper |

Snapshot taken during pass 12 before edits:

| File | Commented test blocks | Notes |
| --- | ---: | --- |
| `packages/core/src/react/utils/shortcuts.spec.tsx` | 9 | Biggest remaining junk pocket after the seam cleanup |
| `packages/core/src/react/hooks/useEditableProps.spec.tsx` | 1 | Dead redecorate block |
| `packages/core/src/react/components/EditorMethodsEffect.spec.tsx` | 2 | Dead redecorate follow-ups |
| `packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.spec.ts` | 1 | No-op commented type experiment |
| `packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.spec.tsx` | 1 | Legacy commented case next to its active replacement |
| `packages/list-classic/src/lib/withList.spec.tsx` | 2 | Dead nested-list cases |
| `packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.spec.tsx` | 2 | Dead `border: none` branch attempts |
| `packages/docx/src/lib/docx-cleaner/cleanDocx.spec.ts` | 2 | One unsupported list case and one no-op stylesheet placeholder |
| `packages/media/src/lib/image/withImageUpload.spec.tsx` | 1 | Dead async upload placeholder |
| `packages/diff/src/lib/computeDiff.spec.ts` | 1 | Giant commented fixture fossil |

Snapshot taken during pass 13 before edits:

| File | Editors | Lines | `it.each` | Notes |
| --- | ---: | ---: | ---: | --- |
| `packages/core/src/lib/plugins/override/withBreakRules.spec.tsx` | 16 | 725 | 0 | Real boundary suite, but still repetitive enough to compress |

Snapshot taken during pass 14 before edits:

| File | Editors | Lines | `it.each` | Notes |
| --- | ---: | ---: | ---: | --- |
| `packages/core/src/lib/plugins/override/withDeleteRules.spec.tsx` | 15 | 648 | 0 | Same sibling pattern as `withBreakRules`: real contract, too much repeated setup |

Snapshot taken during pass 19 after the repo-wide seam sweep:

| File | Decision | Reason |
| --- | --- | --- |
| `packages/selection/src/react/internal/api/moveSelection.spec.tsx` | Keep Plate | The API is genuinely `PlateEditor`-bound |
| `packages/selection/src/react/internal/api/shiftSelection.spec.tsx` | Keep Plate | The API is genuinely `PlateEditor`-bound |
| `packages/core/src/react/editor/TPlateEditorCore.spec.ts` | Keep Plate | Intentional API comparison between Slate and Plate editors |
| `packages/core/src/react/editor/TPlateEditor.spec.ts` | Keep Plate | Intentional API comparison between Slate and Plate editors |
| `packages/core/src/react/hooks/useEditableProps.spec.tsx` | Keep Plate | React hook and provider behavior |
| `packages/core/src/react/plugin/toPlatePlugin.spec.ts` | Keep Plate | Plate plugin conversion is the contract |
| `packages/core/src/react/utils/pipeRenderLeaf.spec.tsx` | Keep Plate | React render pipeline is the contract |
| `packages/core/src/react/utils/shortcuts.spec.tsx` | Keep Plate | React hotkey wiring and `createPlatePlugin` behavior |
| `packages/core/src/react/components/PlateControllerEffect.spec.tsx` | Keep Plate | React controller/provider wiring |
| `packages/core/src/react/components/EditorHotkeysEffect.spec.tsx` | Keep Plate | React hotkey effect wiring |
| `packages/core/src/react/components/EditorMethodsEffect.spec.tsx` | Keep Plate | React effect attaches methods on mount |
| `packages/core/src/react/stores/element/useElementStore.spec.tsx` | Keep Plate | React context/store behavior |
| `packages/core/src/react/components/Plate.spec.tsx` | Keep Plate | Plate provider behavior |
| `packages/core/src/react/plugins/react/ReactPlugin.spec.ts` | Keep Plate | React plugin override behavior |
| `packages/core/src/internal/plugin/resolvePlugins-store.spec.tsx` | Mixed | Pure store cases already moved to Slate; remaining cases are React hook rerender coverage |
| `packages/core/src/internal/plugin/resolvePlugins.spec.tsx` | Mixed | One remaining component-override case is legitimately Plate-specific |
| `packages/core/src/internal/plugin/pipeNormalizeInitialValue.spec.tsx` | Keep Plate | `Plate` plus `useEditorValue` are the contract |

## `__tests__` Directory Scan

Snapshot taken during pass 4 before edits:

| Directory | Specs | Helpers or fixtures | Decision |
| --- | ---: | ---: | --- |
| `packages/core/src/static/__tests__` | 6 | 1 | Move file-scoped specs out, keep helper |
| `packages/udecode/react-hotkeys/src/__tests__` | 1 | 0 | Move lone file-scoped spec out |
| `packages/find-replace/src/lib/__tests__` | 2 | 0 | Replace with adjacent unit spec |
| `packages/autoformat/src/lib/__tests__` | 16 | 0 | Keep for now as a split multi-file behavior suite |
| `packages/core/src/lib/utils/__tests__` | 8 | 0 | Keep for now as a split multi-file matrix suite |
| `packages/docx/src/lib/__tests__` | 21 | 47 | Keep as fixture-heavy integration suite |
| `packages/docx-io/src/lib/__tests__` | 6 | 1 | Keep as fixture-backed integration suite |

## Current Standards

- Use JSX hyperscript only when tree shape or selection shape is the contract.
- Use plain object fixtures for option and state tests.
- Use `*.spec.ts[x]` for all tests. File-scoped specs live beside the implementation.
- Put shared helpers in `__tests__/`, never in another spec file.
- Keep `__tests__/` only for helpers, fixture banks, and intentionally split multi-file or integration suites.
- Avoid snapshots unless serialized text or AST output is the contract.
- When renaming many snapshot-backed tests, delete and regenerate the snapshot file. `bun test -u` updates and adds keys, but it does not reliably prune dead ones.
- Collapse tiny split helper suites into one table-driven file when the only variation is fixture shape.
- For streaming markdown, keep one mixed-document smoke case and a few explicit chunk-boundary tests. Do not hide behavior behind snapshots or giant manual trees.
- For plugin option stores, selector extension, and other non-React plugin composition tests, use `createSlateEditor`. Reserve `createPlateEditor` for React hooks, providers, and Plate-only wiring.
- Pure plugin API and transform composition tests should also use `createSlateEditor`.
- Parser, deserializer, HTML `insertData`, and DnD contract tests should also default to `createSlateEditor` unless React rendering is literally the behavior under test.
- Markdown package tests must configure `MarkdownPlugin` locally in the package helper. Do not import `MarkdownKit` or other app registries from `apps/www`.
- Delete dead `skip` tests instead of preserving wishful thinking.
- For cleanup waves, score files first instead of skimming randomly.
- For title cleanup waves, scan plain titles, `it.each` format strings, `String.raw` titles, and snapshot keys together.
- For dead-spec cleanup waves, scan for commented-out `it`, `test`, and `describe` blocks too.
- For plugin composition hotspots, extract helpers like `getSortedKeys(...)` or `createStoreEditor(...)` before adding more inline editor setup.
- For rule-override hotspots, extract one editor helper and table-drive repeated node-type cases instead of cloning the same transform assertions.
- Action helpers may create the editor and perform the transform, but assertions stay in the `it()` body.

## Current State

- Repo-wide changed-spec sweep: `1590 pass`, `0 fail` across `209` files.
- `pnpm turbo build --filter=./packages/core --filter=./packages/slate --filter=./packages/markdown` passed.
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/slate --filter=./packages/markdown` passed.
- `git diff --check` is clean.
- The tracked title-debt scan for `should`, `fixures`, and `qoute` in spec titles returns no matches.
- The snapshot-key scan for stale pre-cleanup titles returns no matches.
- The remaining largest specs are mostly boundary suites, not obvious dead-weight integration tests.
- `extendApi.spec.ts` is no longer using the Plate seam for pure plugin composition.
- Repo-wide scan for commented-out `it`, `test`, and `describe` blocks in `packages/**/*.spec.*` returns no matches.
- `withBreakRules.spec.tsx` dropped from 725 lines to 472 while keeping the same contract coverage.
- `withDeleteRules.spec.tsx` dropped from 648 lines to 496 while keeping the same contract coverage.
- The repo-wide `createPlateEditor` scan is now an intentional allowlist of React/provider/render/store suites plus the two Plate-only selection APIs.
- `packages/markdown/src/lib/__tests__/createTestEditor.tsx` no longer imports `apps/www`.
