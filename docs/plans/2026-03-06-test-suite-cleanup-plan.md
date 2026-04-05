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

No blind repo-wide coverage push in this phase. No e2e or browser work.

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
- Loaded the `planning-with-files` skill and added planning-memory notes so pass history, findings, and verification live on disk outside the chat transcript too. Those notes are consolidated in this plan file.

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

### Pass 21

- Moved the `@platejs/slate` specs that were really exercising cross-package editor wiring out of `slate` and into `apps/www`, which already carries the full package surface without adding new internal package devDependencies.
- Consolidated the moved coverage into one `www` integration spec for inline-link traversal, inline `isEmpty`, mark toggling, and void delete boundaries.
- Removed the two `platejs`-only type imports from `@platejs/core` test helpers and dropped the now-unused `platejs` devDependency from `core`.

### Pass 22

- Moved the `@platejs/core` static `serializeHtml` integration specs out of `packages/core` and into `apps/www`, because they depended on `BaseEditorKit` and registry fixture values from the app anyway.
- Deleted the last `packages/core/src/static/__tests__/create-static-editor.ts` helper after moving its only remaining callers into the app-level integration folder.
- Confirmed the remaining `www`-coupled package tests still live in `docx-io` and `ai`, so the next cleanup pass should move those clusters too instead of adding more internal package devDependencies.

### Pass 23

- Moved the `@platejs/docx-io` roundtrip fixture suite out of `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx` and into `apps/www/src/__tests__/package-integration/docx-io.roundtrip.spec.tsx`, because that coverage depends on `BaseEditorKit` and `DocxExportKit` from the app registry.
- Deleted the `@/*` and `www/*` aliases from `packages/docx-io/tsconfig.json`, so package typecheck no longer drags `apps/www/src` through an app-only import seam.
- Gave `apps/www` the direct test deps the moved integration actually uses: `mammoth` for Node-side DOCX fixture import and `@types/unist` for the app's existing local `src/types/unist.ts` type import.
- Re-ran `@platejs/docx-io` typecheck on the real workspace graph with no root overrides, so the package now passes without the fake pinning detour.

### Pass 24

- Moved the entire `apps/www` app-owned package integration cluster from `src/lib/package-integration` to `src/__tests__/package-integration`.
- Kept the existing buckets under `package-integration` so cross-package contracts and static HTML coverage stay grouped without dumping everything into one root-level test folder.

### Pass 25

- Made `@platejs/slate` the explicit phase-1 priority and used the slate phase-1 execution log as the working source, while keeping this file as the canonical cleanup history.
- Mined upstream `../slate` and `slate-history` tests selectively instead of mirroring them blindly, pulling only the invariants that improved our local public-contract coverage cheaply.
- Finished the slate package at `395` passing tests, with `packages/slate/src` at `100.00%` function coverage and `96.97%` line coverage from `lcov`.
- Covered the real slate contract buckets:
  - `slate-history` and history helper behavior
  - `Path`, `Range`, `Node`, and `location-ref` contracts
  - editor query and navigation seams like `above`, `next`, `previous`, `marks`, `string`, `nodes`, `isAt`, and `getPointBefore`
  - transform and helper seams like `deleteText`, `deleteMerge`, `mergeNodes`, `toggleMark`, `setNodes`, `moveSelection`, `duplicateNodes`, and `addMarks`
- Stopped phase 1 once the remaining misses were mostly deferred DOM wrappers plus a few low-risk non-DOM files like `isEmpty`, `prop`, `getFragment`, and `queryNode`.

#### Pass 25 Methodology

- Bun-first and speed-first: `bun test` stays the default workflow; no browser or e2e coverage in this program.
- Coverage is hotspot telemetry, not a vanity target.
- For package-only truth, prefer `lcov` over Bun’s broad text summary.
- Test public behavior through editor APIs, transforms, plugin APIs, or rendered output only when the contract is actually React or DOM specific.
- Use the narrowest seam that proves the contract:
  - `createEditor` for pure Slate behavior
  - `createSlateEditor` for non-React plugin or editor wiring
  - `createPlateEditor` only when the contract is genuinely Plate-specific
- Prefer explicit assertions over snapshots; keep snapshots only when the serialized form is the contract and inline assertions would be worse.
- Put compile-only type contracts in `type-tests/`, not runtime specs.
- No aspirational skipped tests, no fake smoke tests, no cross-spec helper imports, and no app-registry imports in package tests.
- Adapt upstream Slate invariants when local runtime semantics differ; do not cargo-cult upstream fixtures.

#### Pass 25 Learnings

- Direct helper specs were worth it for custom slate code like `deleteMerge`, `location-ref`, `toggleMark`, and `mergeNodes`; indirect coverage was lying.
- Bun’s text coverage summary is noisy for targeted package runs, so `lcov` is the trustworthy package-level source of truth.
- Upstream invariants are reference material, not holy scripture; when local runtime behavior differs, keep the invariant and rewrite the fixture around the real public contract.

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
- Do not create `task_plan.md`, `findings.md`, or `progress.md` at repo root. Merge that content into this `docs/plans/...` file.

## Consolidated Planning Notes

Former repo-root planning files were merged here on 2026-03-07:

- `task_plan.md`
- `findings.md`
- `progress.md`

The phase-by-phase pass history already lives above in `## Completed`, `## Matrix Scan`, `## __tests__ Directory Scan`, and `## Current State`. The sections below preserve the extra task snapshot, findings, and verification detail that used to live in those repo-root files.

### Task Snapshot

**Goal**

Raise the Plate test suite quality by replacing low-signal Slate integration tests with smaller unit or contract tests, while keeping pass history and decisions on disk.

**Current Phase**

Complete

**Key Questions**

1. Which editor-level specs still earn their keep after the title cleanup is done?
2. Which remaining fixture-heavy suites should collapse only after their contracts are rewritten?
3. How do we keep snapshot-backed title renames from leaving dead keys behind?

### Planning Decisions

| Decision | Rationale |
|----------|-----------|
| Keep three layers only: unit, thin contract, golden I/O | Reduces fake integration coverage |
| Use `*.spec.ts[x]` for all tests | Consistent file naming and Bun behavior |
| Reserve `__tests__/` for helpers, fixtures, and intentional split suites | Keeps file-scoped tests beside the code |
| Prefer plain object fixtures for pure tree utilities | Hyperscript adds noise when structure is simple |
| Avoid snapshots unless serialized output is the contract | Snapshots were hiding behavior instead of proving it |
| Use a real editor object only for editor-root semantics | `NodeApi` and `ElementApi` do not treat plain objects like real editors |
| Package tests should use local rule lists or package exports, not app registries | Prevents cross-package coupling and cleaner seams |
| Autoformat mark tests should use `KEYS` instead of React plugin `.key` imports | The rules only need stable type strings |
| Block autoformat specs should add only the base plugins the rule actually needs | Keeps the seam honest and the setup small |
| Tiny one-case mark specs should collapse into one matrix file | Better scanability, less file noise |
| Snapshot-backed title renames should delete and regenerate the snapshot file | `bun test -u` adds and updates keys but does not reliably prune dead ones |
| Titles should describe behavior semantically, not echo raw option names | `when normalization is disabled` reads better than `when shouldNormalizeEditor false` |
| Markdown package tests must configure `MarkdownPlugin` locally | Importing `MarkdownKit` from `apps/www` is app-coupled test sludge |
| Remaining `createPlateEditor` usage is an allowlist, not a backlog | The final scan leaves only React/provider/render/store suites and known Plate-only APIs |

### Requirements

- Improve the test suite without adding coverage work.
- Remove useless or overlapping tests.
- Prefer smaller seams over broad Slate integration tests.
- Keep testing style consistent and documented for future contributors.
- Avoid slow e2e or browser testing in this phase.

### Research Findings

- `streamInsertChunk.spec.tsx` was the highest-ROI remaining AI hotspot: 864 lines, 5 skips, 2 snapshots, and heavy overlap with markdown parser behavior.
- The `mergeDeepToNodes` suite was eight tiny hyperscript specs for one pure helper. The split added noise without adding seams.
- `NodeApi.isDescendant` and `ElementApi.isElement` behave differently on a real editor object than on a plain `{ children: [...] }` object. Editor-root tests need a real editor when that distinction matters.
- `withAutoformat/trigger.spec.tsx` was using `createPlateEditor` even though the contract is pure Slate behavior.
- The `autoformat` package typecheck blocker was self-inflicted test debt: package specs were importing `@platejs/basic-nodes/react` and `@platejs/link/react` just to read `.key`.
- `withAutoformat` text and mark specs get cleaner fast when they use package-local rule arrays plus one shared `createAutoformatEditor` helper.
- Importing `AutoformatKit` from `www` is fine for true app-level integration coverage, but it is the wrong seam for file-scoped package specs.
- Block autoformat specs only needed a few base plugins: `BaseListPlugin` + `BaseIndentPlugin` for list rules, and `BaseCodeBlockPlugin` for code-block rules.
- The four one-off basic mark specs added zero signal as separate files. One matrix file is strictly better.
- The whole `withAutoformat` suite now has zero `AutoformatKit`, `createPlateEditor`, bad React-only key imports, or placeholder `should ...` titles.
- Hidden title debt survives naive greps. The remaining pockets were in `it.each(...)('...')`, `String.raw\`...\`` titles, config names echoed inside test descriptions, and snapshot keys generated from those titles.
- `serializeMd.spec.tsx` had a small but stupid snapshot trap: two assertions were only there to prove whitespace-sensitive string output, and the snapshot file itself started failing `git diff --check` because those strings ended with meaningful spaces.
- `bun test -u` updates snapshot files but does not reliably prune old keys after title renames. If snapshot-backed titles change in bulk, deleting and regenerating the snapshot file is faster and cleaner than trusting Bun to do the right thing.
- The repo-wide title debt scan is now clean for the tracked patterns: no `should ...`, `fixures`, or `qoute` matches remain in spec titles or snapshot keys.
- After the title pass, the remaining hotspots were mostly concentrated in core plugin composition tests. The best remaining cleanup was not more title churn; it was narrowing pure option-store tests to `createSlateEditor` and table-driving deterministic plugin-order cases.
- The post-pass matrix looks healthy enough now: the biggest remaining files are still large, but they are mostly real plugin or transform boundary suites rather than skipped, duplicated, or obviously fake unit coverage.
- A second post-matrix pass confirmed the same pattern for `extendApi.spec.ts`: it was still using the Plate editor seam for pure plugin API composition with zero React behavior in scope. Dropping it to `createSlateEditor` was the right cleanup.
- The last obvious non-runtime junk was dead commented-out tests. They were scattered across `core`, `table`, `list-classic`, `docx`, `media`, and `diff`, and they added zero signal while making scans look worse than reality.
- After the commented-spec cleanup, the best remaining hotspot was `withBreakRules.spec.tsx`: not fake integration, but still bloated with duplicated node-type cases and repeated editor setup.
- `withDeleteRules.spec.tsx` had the same sibling pattern: real boundary coverage, but too much repeated plugin setup and repeated delete action scaffolding.
- `createSlateEditor` works cleanly for more than the early hotspots: HTML deserializers, `code-block`, `date`, `dnd`, `layout`, `link`, `media`, `slate` utilities, table transforms, and markdown parser contracts all passed after seam narrowing.
- The selection holdouts are real exceptions, not laziness. `moveSelection` and `shiftSelection` depend on Plate-only capabilities, and forcing them onto `createSlateEditor` breaks the contract.
- The markdown package helper was still cheating by importing `MarkdownKit` from `apps/www`, but that kit was just `MarkdownPlugin.configure(...)` plus remark plugins. The package tests do not need the app registry at all.
- After the final repo-wide seam scan, the only remaining `createPlateEditor` usages are in React/provider/render/store suites, Plate plugin conversion tests, and the two known Plate-only selection APIs.
- A final no-change audit found no remaining skips, placeholder titles, commented-out tests, or cross-spec imports in package specs.
- The remaining `__tests__/` specs are the expected ones: fixture-heavy `docx` and `docx-io`, plus the intentionally split `withAutoformat` suite.

### Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Rewrite large hotspot specs before chasing broad title debt | Bigger signal gain per pass |
| Collapse single-helper split suites into one adjacent spec with `it.each` | Easier to scan, less duplicated setup |
| Keep one mixed-document smoke case for streaming markdown | Proves the broad contract without giant hand-written trees |
| Use explicit assertions instead of snapshots for AI streaming | Easier to read and less fragile |
| Use `KEYS` or base plugins for mark and link type strings in package tests | Avoids React-only import churn and typecheck failures |
| Build focused autoformat tests from local rule arrays before reaching for `AutoformatKit` | Cleaner contract, less duplicate setup |
| Add only the base plugins a block rule needs in package tests | Avoids app-level coupling while keeping behavior real |
| Collapse multiple one-case mark specs into one matrix file | Keeps the suite dense without losing behavior coverage |
| Describe behavior semantically instead of mirroring raw option names in titles | `when normalization is disabled` is clearer than `when shouldNormalizeEditor false` |
| Use explicit `toBe(...)` assertions for tiny whitespace-sensitive serializer outputs | Easier to read, avoids snapshot churn, and keeps `git diff --check` happy |
| Delete and regenerate snapshot files after broad title renames | Bun snapshot updates keep dead keys around |
| Use `createSlateEditor` for pure plugin option-store tests and selector extension | Plate React wiring adds noise when hooks and providers are not under test |
| For plugin composition suites, extract helper functions before adding more inline editor setup | Sorting and option-store cases are easier to read as `getSortedKeys(...)` and `createStoreEditor(...)` than repeated editor constructions |
| Pure plugin API and transform composition tests should also use `createSlateEditor` | If no React hook, provider, or Plate-only wiring is involved, the Plate seam is just noise |
| Commented-out tests should be deleted, not parked in the file | They rot, confuse matrix scans, and are worse than an honest missing test |
| Rule-override suites should use one helper and table-drive repeated node-type cases | `withBreakRules` dropped from 725 lines to 472 without losing any behavior |
| Rule-action helpers should return the editor, not assert internally | Keeps setup DRY without tripping Biome's misplaced-assertion rule |
| Parser, deserializer, DnD, and `insertData` contract tests should default to `createSlateEditor` | Plugin stores and transforms are enough; React adds nothing there |
| Markdown package tests must configure `MarkdownPlugin` locally instead of importing `MarkdownKit` from `apps/www` | Package tests should not depend on app registries |
| Remaining `createPlateEditor` files should be treated as a reviewed allowlist, not a future cleanup queue | Those files are now legitimate React/provider/render/store or Plate-only boundary suites |

### Verification Log

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
| Repo-wide changed-spec sweep | `git diff --name-only -- packages | rg '\\.spec\\.' | xargs bun test` | All changed specs still pass | 1590 pass, 0 fail | ✓ |
| Core + slate + markdown build | `pnpm turbo build --filter=./packages/core --filter=./packages/slate --filter=./packages/markdown` | Packages build | Passed | ✓ |
| Core + slate + markdown typecheck | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/slate --filter=./packages/markdown` | Packages typecheck | Passed | ✓ |
| Repo-wide touched-file Biome | `git diff --name-only -- . ':(exclude)pnpm-lock.yaml' | xargs pnpm exec biome check --write` | Formatting and lint pass on changed files | Checked 211 files, fixed 4 | ✓ |
| Title-debt scan | `rg -n '^[[:space:]]*(it|test|describe)\\([^\\n]*(should|fixures|qoute)|^[[:space:]]*\\]\\)\\([^\\n]*(should|fixures|qoute)' packages --glob '*.spec.*'` | No tracked title debt remains | No matches | ✓ |
| Snapshot-key scan | `rg -n 'exports\\[\\`.*(should |fixures|qoute|serialize a |deserialize a )' packages --glob '*.snap'` | No stale snapshot keys remain | No matches | ✓ |
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
| DOCX app integration roundtrip | `bun test apps/www/src/__tests__/package-integration/docx-io.roundtrip.spec.tsx` | Moved app-level `docx-io` roundtrip suite still passes | 5 pass, 0 fail | ✓ |
| DOCX package build | `pnpm turbo build --filter=./packages/docx-io` | `@platejs/docx-io` builds after removing app aliases | Passed | ✓ |
| DOCX package typecheck | `pnpm --filter @platejs/docx-io typecheck` | `@platejs/docx-io` typechecks without pulling `apps/www/src` | Passed | ✓ |
| App typecheck after moved DOCX seam | `pnpm --filter www typecheck` | `www` typechecks after owning the moved DOCX integration and direct deps | Passed | ✓ |
| Repo package typecheck after DOCX seam cleanup | `pnpm typecheck` | Workspace packages still typecheck on the real graph | Passed | ✓ |
| Repo lint fix after DOCX seam cleanup | `bun lint:fix` | Formatting and Biome checks stay clean after the move | Checked 2585 files, 0 fixes | ✓ |

### Error Log

| Timestamp | Error | Attempt | Resolution |
|-----------|-------|---------|------------|
| 2026-03-06 | `streamInsertChunk.spec.tsx` helper triggered `noMisplacedAssertion` | 1 | Moved the assertion back into each `it()` |
| 2026-03-06 | `mergeDeepToNodes.spec.ts` editor-root cases compared whole editor objects | 1 | Used a real editor and asserted on `children` plus root boundaries |
| 2026-03-06 | `autoformat` typecheck failed on unresolved imports from `@platejs/basic-nodes/react` and `@platejs/link/react` in existing specs | 1 | Removed the React-only `.key` imports from the hotspot specs and typecheck passed |
| 2026-03-06 | `planning-with-files` catchup script pointed at a missing `~/.codex/skills/planning-with-files` path | 1 | Used the existing planning notes directly and later consolidated them into this plan file |
| 2026-03-06 | `bun test -u` left dead snapshot keys in markdown after title renames | 1 | Deleted the affected snapshot files and regenerated them from scratch |
| 2026-03-06 | Markdown serializer snapshots contained meaningful trailing spaces, so `git diff --check` flagged them | 1 | Replaced those two cases with explicit string assertions instead of snapshots |
| 2026-03-06 | `moveSelection` and `shiftSelection` looked like easy seam reductions but failed when switched to `createSlateEditor` | 1 | Kept them on Plate and documented the exception instead of cargo-culting the rule |
| 2026-03-06 | The markdown helper imported `MarkdownKit` from `apps/www` | 1 | Replaced it with local `MarkdownPlugin.configure(...)` plus remark plugins |
| 2026-03-09 | Moving the DOCX roundtrip spec into `www` broke on `Cannot find package 'mammoth'` and then exposed `src/types/unist.ts` missing direct types | 2 | Added `mammoth` and `@types/unist` to `apps/www` so the moved app-owned integration and existing app types both resolve honestly |

### Resources

- `.agents/rules/testing.mdc`
- `docs/plans/2026-03-06-test-suite-cleanup-plan.md`
- `packages/ai/src/react/ai-chat/streaming/streamInsertChunk.spec.tsx`
- `packages/core/src/lib/utils/mergeDeepToNodes.spec.ts`
- `packages/autoformat/src/lib/__tests__/withAutoformat/trigger.spec.tsx`
- `packages/autoformat/src/lib/__tests__/withAutoformat/createAutoformatEditor.ts`
- `packages/autoformat/src/lib/__tests__/withAutoformat/text.spec.tsx`
- `packages/autoformat/src/lib/__tests__/withAutoformat/markup.spec.tsx`
- `packages/autoformat/src/lib/__tests__/withAutoformat/block/list.spec.tsx`
- `packages/autoformat/src/lib/__tests__/withAutoformat/block/code-block.spec.tsx`
- `packages/autoformat/src/lib/__tests__/withAutoformat/mark/basic-marks.spec.tsx`
- `packages/core/src/react/components/Plate.spec.tsx`
- `packages/core/src/lib/plugins/slate-extension/transforms/init.spec.ts`
- `packages/slate/src/internal/transforms-extension/removeMarks.spec.tsx`
- `packages/markdown/src/lib/serializer/serializeMd.spec.tsx`
- `packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx`
- `packages/core/src/internal/plugin/resolvePlugins.spec.tsx`
- `packages/core/src/internal/plugin/resolvePlugins-store.spec.tsx`
- `packages/core/src/lib/utils/extendApi.spec.ts`
- `packages/markdown/src/lib/__tests__/createTestEditor.tsx`
- `packages/date/src/lib/BaseDatePlugin.spec.tsx`
- `packages/dnd/src/transforms/onHoverNode.spec.ts`
- `packages/dnd/src/transforms/onDropNode.spec.ts`
- `packages/layout/src/lib/transforms/setColumns.spec.tsx`
- `packages/layout/src/lib/transforms/toggleColumnGroup.spec.tsx`
- `packages/link/src/lib/withLink.spec.tsx`
- `packages/link/src/react/utils/getLinkAttributes.spec.ts`
- `packages/media/src/lib/image/withImageUpload.spec.tsx`
- `packages/slate/src/internal/editor/isEmpty.spec.tsx`
- `packages/slate/src/interfaces/node-children.spec.tsx`
- `packages/core/src/lib/utils/normalizeDescendantsToDocumentFragment.spec.tsx`
- `packages/markdown/src/lib/rules/defaultRule.spec.ts`
- `packages/markdown/src/lib/deserializer/deserializeMd.spec.tsx`
- `packages/list/src/lib/ListPlugin.spec.tsx`

### Visual or Browser Findings

- None. This cleanup phase stayed fully local and terminal-based.

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
- `packages/docx-io/tsconfig.json` no longer aliases `apps/www`, so package typecheck stops pulling app-only registry code into the package graph.
- `apps/www/src/__tests__/package-integration/docx-io.roundtrip.spec.tsx` now owns the DOCX export/import roundtrip coverage that depends on app kits and static registry components.
- `apps/www/src/__tests__/package-integration` is the home for app-owned cross-package integration tests; buckets stay local under that folder instead of spreading through `src/lib`.
