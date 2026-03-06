# Task Plan: Test Suite Cleanup

## Goal
Raise the Plate test suite quality by replacing low-signal Slate integration tests with smaller unit or contract tests, while keeping pass history and decisions on disk.

## Current Phase
Complete

## Phases

### Phase 1: Audit and Taxonomy
- [x] Scan the repo for skips, editor-harness hotspots, and `__tests__` misuse
- [x] Define the test taxonomy in `testing.mdc`
- [x] Capture initial findings in `findings.md`
- **Status:** complete

### Phase 2: First Cleanup Waves
- [x] Clean `core`, `table`, `link`, `list-classic`, `selection`, `markdown`, and `udecode/utils`
- [x] Remove dead skips and placeholder tests in the first hotspot batch
- [x] Record completed passes in `.claude/docs/plans/2026-03-06-test-suite-cleanup-plan.md`
- **Status:** complete

### Phase 3: Naming and Structure Cleanup
- [x] Enforce `.spec.ts[x]` for file-scoped tests
- [x] Move file-scoped specs out of `__tests__` where appropriate
- [x] Keep helper and fixture suites in `__tests__`
- **Status:** complete

### Phase 4: Current Refactor Batch
- [x] Rewrite `streamInsertChunk.spec.tsx` around smaller seams
- [x] Collapse `mergeDeepToNodes` into one adjacent unit spec
- [x] Shrink `withAutoformat/trigger.spec.tsx` to `createSlateEditor` plus `it.each`
- **Status:** complete

### Phase 5: Verification and Next Targets
- [x] Run targeted tests, build, and core typecheck for touched packages
- [x] Update `progress.md` with current verification results
- [x] Pick the next hotspot from the matrix
- **Status:** complete

### Phase 6: Autoformat Hotspot Cleanup
- [x] Add one shared helper for focused `withAutoformat` specs
- [x] Rewrite the `text`, `markup`, `ignoreTrim`, `multiple-marks`, `trigger`, and `singleCharTrigger` hotspots around local rules or `KEYS`
- [x] Remove the remaining React-only `.key` imports from the failing autoformat specs
- [x] Clear the `@platejs/autoformat` package typecheck blocker
- **Status:** complete

### Phase 7: Remaining Queue
- [x] Refactor the remaining `withAutoformat` block and simple mark specs away from `www` kit imports
- [x] Continue title-debt cleanup in `Plate.spec.tsx` and remaining package hotspots
- **Status:** complete

### Phase 8: Post-Autoformat Queue
- [x] Continue title-debt cleanup in `Plate.spec.tsx`
- [x] Clean the remaining `should ...` pockets in `core`, `code-block`, `media`, `slate`, and `markdown`
- [x] Re-scan the repo for the remaining highest-signal contract and title cleanup
- **Status:** complete

### Phase 9: Repo-wide Title and Snapshot Hardening
- [x] Run a file-by-file matrix scan for hidden title debt and stale snapshot keys
- [x] Clean the remaining config-name, verb-title, and typo debt in `Plate`, `init`, `removeMarks`, `serializeMd`, and `deserializeMdList`
- [x] Replace whitespace-sensitive snapshot assertions with explicit string assertions where snapshots were fighting `git diff --check`
- [x] Delete and regenerate stale markdown snapshot files after the title renames
- [x] Re-run repo-wide changed-spec verification, build, typecheck, and Biome
- **Status:** complete

### Phase 10: Core Plugin Composition Cleanup
- [x] Run a new matrix scan after pass 9 to find the remaining editor-heavy hotspots
- [x] Shrink the `resolvePlugins` hotspot with helper functions and `it.each` for deterministic sort cases
- [x] Move pure plugin store tests in `resolvePlugins-store.spec.tsx` to `createSlateEditor` and delete the overlapping rerender case
- [x] Re-verify the touched core specs plus core build and typecheck
- **Status:** complete

### Phase 11: Pure Plugin API Seam Cleanup
- [x] Re-scan the hotspot matrix after pass 10 to confirm what still looked fake-integration-heavy
- [x] Move `extendApi.spec.ts` from the Plate editor seam to `createSlateEditor`
- [x] Keep the pass focused on pure plugin composition instead of touching the larger React and transform boundary suites
- [x] Re-verify the touched core specs plus core build and typecheck
- **Status:** complete

### Phase 12: Dead Commented Spec Cleanup
- [x] Run a repo-wide scan for commented-out `it`, `test`, and `describe` blocks in spec files
- [x] Delete the dead commented test blocks in the remaining hotspots
- [x] Re-verify the touched specs plus package build and typecheck for affected packages
- **Status:** complete

### Phase 13: Override Rule Matrix Cleanup
- [x] Re-scan the top editor-heavy hotspots after the commented-spec pass
- [x] Refactor `withBreakRules.spec.tsx` around one local helper and `it.each` for duplicated node-type cases
- [x] Re-verify the touched core spec plus core build and typecheck
- **Status:** complete

### Phase 14: Delete Rule Sibling Cleanup
- [x] Refactor `withDeleteRules.spec.tsx` with the same helper-plus-matrix pattern used for `withBreakRules`
- [x] Keep assertions in `it()` bodies while using helpers only for editor setup and actions
- [x] Re-verify the touched core spec plus core build and typecheck
- **Status:** complete

### Phase 15: Core and Table Seam Narrowing
- [x] Move the remaining deterministic core and table transform specs to `createSlateEditor`
- [x] Keep the one real component-override case in `resolvePlugins.spec.tsx` on the Plate seam
- [x] Re-verify the touched core, basic-nodes, and table packages
- **Status:** complete

### Phase 16: HTML and Selection Boundary Sweep
- [x] Move HTML parser and deserializer specs to `createSlateEditor`
- [x] Move pure selection helpers to `createSlateEditor`
- [x] Keep `moveSelection` and `shiftSelection` on Plate after proving they are genuinely Plate-bound
- [x] Re-verify the touched core and selection packages
- **Status:** complete

### Phase 17: Code Block and Plugin Utility Cleanup
- [x] Move the remaining deterministic `code-block` specs to `createSlateEditor`
- [x] Move the pure `DebugPlugin` and `getEditorPlugin` specs to `createSlateEditor`
- [x] Re-verify the touched code-block and core packages
- **Status:** complete

### Phase 18: Non-Core Package Seam Cleanup
- [x] Move deterministic `date`, `dnd`, `layout`, `link`, `media`, `slate`, `list`, and markdown rule/deserializer specs to `createSlateEditor`
- [x] Move `normalizeDescendantsToDocumentFragment.spec.tsx` to `createSlateEditor` and `createSlatePlugin`
- [x] Re-verify the touched packages with targeted Bun tests plus build and typecheck
- **Status:** complete

### Phase 19: Markdown Helper and Final Intentional Plate Matrix
- [x] Replace the markdown package helper import of `apps/www` `MarkdownKit` with local markdown plugin configuration
- [x] Delete the tiny `defaultRule` snapshot file in favor of explicit string assertions
- [x] Re-scan the repo and confirm the remaining `createPlateEditor` usages are intentional React/provider or Plate-only boundary suites
- **Status:** complete

### Phase 20: Final No-Change Audit
- [x] Re-run repo-wide scans for skips, placeholder titles, commented-out tests, cross-spec imports, and `createPlateEditor`
- [x] Confirm the remaining `createPlateEditor` files are the intentional allowlist
- [x] Confirm the remaining `__tests__/` specs are fixture-heavy or intentionally split multi-file suites
- **Status:** complete

## Key Questions
1. Which editor-level specs still earn their keep after the title cleanup is done?
2. Which remaining fixture-heavy suites should collapse only after their contracts are rewritten?
3. How do we keep snapshot-backed title renames from leaving dead keys behind?

## Decisions Made
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

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| Biome flagged an assertion hidden inside a helper in `streamInsertChunk.spec.tsx` | 1 | Returned `{ editor, expected }` and asserted inside `it()` |
| Plain object editor roots changed `NodeApi` and `ElementApi` behavior in `mergeDeepToNodes` tests | 1 | Used a real editor object for editor-root cases and asserted on `children` instead of the whole editor |
| `pnpm turbo typecheck --filter=./packages/autoformat` failed on unresolved imports in untouched autoformat specs | 1 | Replaced React-only `.key` imports with `KEYS` and rewrote the hotspot specs around local rules; package typecheck passes now |
| `planning-with-files` catchup script expected `~/.codex/skills/planning-with-files`, but this repo uses the marketplace install path | 1 | Skipped the broken helper script and used the existing root planning files directly |
| `bun test -u` kept stale snapshot keys after test-title renames | 1 | Deleted the snapshot files and regenerated them from scratch |
| `git diff --check` failed on markdown snapshots with meaningful trailing spaces | 1 | Replaced the whitespace-sensitive snapshot cases with explicit `toBe(...)` assertions |
| `moveSelection.spec.tsx` and `shiftSelection.spec.tsx` broke when forced onto `createSlateEditor` | 1 | Reverted both files and documented them as intentional Plate-only exceptions |
| `packages/markdown/src/lib/__tests__/createTestEditor.tsx` still imported `MarkdownKit` from `apps/www` | 1 | Replaced it with local `MarkdownPlugin.configure(...)` plus the same remark plugins |

## Notes
- The detailed pass log lives in `.claude/docs/plans/2026-03-06-test-suite-cleanup-plan.md`.
- The live testing rules live in `.claude/skills/testing/testing.mdc`.
