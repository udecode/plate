# Findings & Decisions

## Requirements
- Improve the test suite without adding coverage work.
- Remove useless or overlapping tests.
- Prefer smaller seams over broad Slate integration tests.
- Keep testing style consistent and documented for future contributors.
- Avoid slow e2e or browser testing in this phase.

## Research Findings
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

## Technical Decisions
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
| For plugin composition suites, extract helper functions before adding more inline editor setup | Sorting and option-store cases are easier to read as `getSortedKeys(...)` and `createStoreEditor(...)` than 15 repeated editor constructions |
| Pure plugin API and transform composition tests should also use `createSlateEditor` | If no React hook, provider, or Plate-only wiring is involved, the Plate seam is just noise |
| Commented-out tests should be deleted, not parked in the file | They rot, confuse matrix scans, and are worse than an honest missing test |
| Rule-override suites should use one helper and table-drive repeated node-type cases | `withBreakRules` dropped from 725 lines to 472 without losing any behavior |
| Rule-action helpers should return the editor, not assert internally | Keeps setup DRY without tripping Biome's misplaced-assertion rule |
| Parser, deserializer, DnD, and `insertData` contract tests should default to `createSlateEditor` | Plugin stores and transforms are enough; React adds nothing there |
| Markdown package tests must configure `MarkdownPlugin` locally instead of importing `MarkdownKit` from `apps/www` | Package tests should not depend on app registries |
| Remaining `createPlateEditor` files should be treated as a reviewed allowlist, not a future cleanup queue | Those files are now legitimate React/provider/render/store or Plate-only boundary suites |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| Comparing a real Slate editor object with `toEqual` pulled in editor methods and blew up the diff | Compare `children` and root-property boundaries instead |
| Auto-generated planning docs would have duplicated the existing pass log | Kept the root planning files short and pointed them at the detailed `.claude` plan |
| `bun test -u` left dead snapshot keys in markdown after title renames | Deleted the affected snapshot files and regenerated them from scratch |
| Markdown serializer snapshots contained meaningful trailing spaces, so `git diff --check` flagged them | Replaced those two cases with explicit string assertions instead of snapshots |
| The planning skill's catchup script points at `~/.codex/skills/planning-with-files`, but this repo has the skill under the marketplace path | Use the existing planning files directly until the skill path is fixed |
| `moveSelection` and `shiftSelection` looked like easy seam reductions but failed when switched to `createSlateEditor` | Keep them on Plate and document the exception instead of cargo-culting the rule |
| The markdown helper imported `MarkdownKit` from `apps/www` | Replace it with local `MarkdownPlugin.configure(...)` plus remark plugins |

## Resources
- `.claude/skills/testing/testing.mdc`
- `.claude/docs/plans/2026-03-06-test-suite-cleanup-plan.md`
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

## Visual/Browser Findings
- None. This cleanup phase stayed fully local and terminal-based.
