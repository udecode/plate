# Editor Behavior Major Execution

## Task

- Source of truth:
  - [.omx/plans/prd-editor-behavior-major.md](.omx/plans/prd-editor-behavior-major.md)
  - [.omx/plans/test-spec-editor-behavior-major.md](.omx/plans/test-spec-editor-behavior-major.md)
- Goal: execute the breaking markdown-first editor-behavior major, starting with Batch 1 structural ownership.
- Constraints:
  - prioritize breaking cleanup over minor new features
  - fix real seams, not local symptoms
  - start red-first
  - do not balloon into full multi-profile editor emulation
  - treat streaming as deferred unless a current-feature change regresses it

## Phases

| Phase                                         | Status   | Notes                                                                                                                                                                                    |
| --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ground approved PRD + test spec               | complete | `.omx` plan is the execution contract                                                                                                                                                    |
| Mine existing learnings + current test seams  | complete | blockquote/container lessons loaded                                                                                                                                                      |
| Batch 1 red tests                             | complete | quote/list structural ownership locked                                                                                                                                                   |
| Batch 1 implementation                        | complete | `liftBlock` seam + blockquote rewiring landed                                                                                                                                            |
| Batch 2 tab ownership cleanup                 | complete | plain and quoted paragraph `Tab` stay editor-owned through indent; reverse `Tab` exhausts paragraph indent before quote lift                                                             |
| Existing-feature markdown-native parity batch | complete | table round-trip, nested quote coverage, heading coverage, ordered-list restart coverage, image/title fixes, and affinity policy landed                                                  |
| Full existing-feature matrix expansion        | complete | broader existing-feature gate was reopened, then closed after the block-editor-native, styling/layout, media/caption, and collaboration lanes were either covered or explicitly deferred |
| Verification + review                         | complete | package tests/build/typecheck/lint and browser checks green; `apps/www` full type lane remains separately noisy                                                                          |

## Current Status

This is a historical execution note.

Current gate truth lives in
[docs/editor-behavior/markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md),
which currently says the active major-release gate is closed and the remaining
lanes are release-prep or later-release follow-up.

## Findings

- Existing local learnings already confirm the last visible bugs were seam bugs, not isolated blockquote bugs:
  - markdown must treat blockquote as a container contract
  - app transforms must preserve nested selection paths
  - autoformat must wrap, not retag, nested quotes
- The real quote keyboard behavior needs a different structural primitive than `exit`:
  - `exit` inserts a sibling paragraph after the container
  - quote empty-`Enter`, quote start-`Backspace`, and quote `Shift+Tab` need to lift the current block out of one quote level instead
- Quote `Backspace@start` needed one more guard after the container rewrite:
  - non-empty quoted paragraphs should still lift one quote level
  - first empty quoted paragraphs should still exit one quote level
  - empty non-first quoted paragraphs should not lift; they should delete or merge inside the same quote first
- Heading `Backspace@start` needed a real plugin rule instead of generic Slate merge behavior:
  - non-empty headings should reset to paragraphs before any merge
  - empty headings should reset to empty paragraphs instead of disappearing into the previous block
- The remaining Batch 1 destructive rows were mostly coverage debt, not more seam debt:
  - quoted-list two-step `Backspace` already removed list first, then quote
  - empty whole code block already reset to a plain paragraph
  - table-cell `Backspace` already stayed inside the current cell
- The next parity batch was also mostly coverage debt, not fresh product bugs:
  - markdown table serialization already produced stable canonical column padding
  - nested quote exit and nested `Backspace` behavior were already correct once directly tested
  - heading middle-split behavior already held through the shared split-reset seam
  - ordered-list restart serialization already worked; it just lacked a mixed-document regression test
- The follow-up parity batch stayed on the same pattern:
  - raw fenced-code deserialize was already correct outside the list seam
  - task-list checked-state round-trip was already correct, with canonical `*` bullets on serialize
  - raw nested blockquote deserialize already produced nested quote containers
  - raw heading deserialize already mapped deeper heading depths correctly
- The broader CommonMark package-surface batch stayed in the same lane:
  - plain links already round-tripped correctly through package deserialize and serialize
  - markdown images already serialized canonically with the caption mirrored into the title field
  - emphasis and inline code already round-tripped correctly at the package surface
  - hard line breaks already preserved the direct package-surface contract
- The follow-on cleanup clarified the remaining debt even more:
  - richer image attributes were missing package-local rule coverage, not runtime support
  - blockquote trailing-break parity was missing a package-surface assertion, not a serializer fix
  - link and mark affinity already had real core coverage; the remaining gap is policy, not mechanics
- The affinity pass turned that policy call into code:
  - bold and italic now default to directional affinity like the other soft markdown marks
  - inline code stays hard-edged
  - links stay directional
- The image pass also fixed a real serializer bug:
  - markdown images no longer invent a title from the caption
  - explicit image titles now round-trip as actual markdown titles
- The final active markdown gate turned out to be mostly closure work:
  - richer link/image fixture matrices are now package-local instead of hidden behind app snapshots
  - nested blockquote + hard-break parity is directly covered
  - richer image attribute precedence is directly covered
  - the markdown-native release gate is closed
- That did not finish the major by itself:
  - the broader matrix still needs full existing-feature coverage for block-editor-native elements, table/document behavior, styling/layout, and collaboration/editor-only surfaces
  - the authority model had to widen beyond Typora/Milkdown to include Notion and Google Docs by feature family
- The first reopened TDD slices confirm the broader gate is a mix of test debt and spec debt:
  - table already had most mechanics, but selection-clamp behavior needed a direct test seam
  - toggle had real structural `Enter` behavior in `withToggle.ts` with almost no direct coverage
- The first reopened family pass reduced uncertainty fast:
  - table behavior is already far more covered than the old matrix admitted
  - styling plugins already had working transforms; they mostly needed direct behavior assertions
  - callout already honored its reset and soft-break rules through the shared override path
- The Notion-style lane is mixed:
  - mention, date, TOC, and columns currently look more like explicit spec debt than fresh runtime bugs
  - toggle is deferred to a rewrite lane instead of incremental patching in this major
  - mention already has insertion and markdown round-trip coverage
  - date already has insertion and adjacency coverage
  - TOC already has insert and hook-level selection/scroll coverage
  - columns already have transform and normalization coverage
- The media + caption lane also landed mostly as coverage and one real markdown fix:
  - file/audio/video markdown round-trip now has package-surface coverage
  - caption movement behavior is explicitly covered for allowed and disallowed blocks
  - MDX media attribute expressions no longer get JSON-stringified during markdown serialization
- The collaboration lane also looks more like scope hygiene than hidden bugs:
  - comment already has solid plugin + util coverage
  - suggestion already has deep transform coverage, including break/delete flows
  - the real weak spots are discussion and yjs policy, not suggestion mechanics
- The mention/date/TOC slice also came back cleaner than feared:
  - mention already had strong insert + markdown round-trip behavior
  - date already had strong insert + adjacency behavior
  - TOC already behaved like an atomic void block for deletion
  - the useful work there was locking boundary/delete behavior into the spec and tests
- The columns slice also stayed in the "spec closure, not bug hunt" bucket:
  - transform and normalization behavior was already strong
  - markdown package round-trip for column groups is now explicit
  - the remaining work is only per-key behavior if the major decides columns need stricter editor UX rules
- Final re-evaluation:
  - the active major-release gate is closed once toggle and the collaboration lane are explicitly deferred
  - the remaining partial rows are either non-blocking spec depth or later-release lanes
- `unwrapNodes({ split: true })` already gives the correct one-level quote split behavior when wrapped in a focused transform.
- The planning skill's default `critical-patterns.md` lookup does not exist in this repo. Use real local `docs/solutions/**`, `docs/editor-behavior/**`, and `docs/plans/**` artifacts instead.
- The approved PRD explicitly chooses the narrow architecture move:
  - strengthen core `Enter` / `Backspace` / `Tab` arbitration
  - then rewire blockquote / indent / autoformat / app helpers
  - defer feature-gap rows unless they become blockers
- The active post-Batch-1 gate is narrower than the parity matrix looked:
  - stay on existing-feature markdown debt
  - defer new feature rows like autolink, footnote, date MDX, and media/embed
  - defer streaming-specific work unless a current-feature change regresses it
- Full-package build clears after the change, and targeted unit/integration suites pass.
- Relevant package typecheck also clears for the touched package graph:
  - `@platejs/core`
  - `@platejs/basic-nodes`
  - `@platejs/indent`
  - `@platejs/list`
  - `@platejs/code-block`
  - `@platejs/table`
  - `@platejs/markdown`
- The broader `apps/www` type lane still shows unrelated `platejs` export drift when included, but that is outside the current diff and not a blocker for this package-scoped seam.
- Browser verification on the live playground confirms the intended structural behavior:
  - empty `Enter` on a top-level quoted paragraph exits the quote
  - empty `Enter` on a nested quoted paragraph exits one quote level and lands at the parent quote depth

## Progress Log

- 2026-04-02: Reloaded Ralph execution context after compaction.
- 2026-04-02: Re-read `ralph`, `major-task`, `planning-with-files`, `tdd`, and `learnings-researcher` instructions.
- 2026-04-02: Re-read the approved `.omx` PRD and test-spec artifacts.
- 2026-04-02: Loaded relevant prior artifacts:
  - `docs/plans/4898-blockquote-markdown-first.md`
  - `docs/solutions/logic-errors/2026-04-01-markdown-blockquotes-must-round-trip-as-container-blocks.md`
  - `docs/solutions/ui-bugs/2026-04-02-blockquote-transforms-must-keep-selection-inside-the-new-quote.md`
  - `docs/solutions/ui-bugs/2026-04-02-blockquote-autoformat-must-wrap-nested-quotes.md`
- 2026-04-02: Added Batch 1 red tests in core override, blockquote, and list seams.
- 2026-04-02: Added `editor.tf.liftBlock(...)` and rewired quote Enter/Backspace to use one-level lift semantics.
- 2026-04-02: Corrected `Tab` ownership to follow Typora-style editor-owned paragraph indent instead of letting plain `Tab` fall out of the editor.
- 2026-04-02: Added quote `Shift+Tab` behavior through `BlockquotePlugin` and updated public docs + changesets for the new `lift` action.
- 2026-04-02: Tightened reverse-`Tab` ownership so indent only claims it when a paragraph indent exists; otherwise quoted paragraphs fall through to quote lift.
- 2026-04-02: Verified targeted unit/integration suites, `pnpm build`, and `pnpm lint:fix`.
- 2026-04-02: Re-ran package-only typecheck for the touched package graph and it passed.
- 2026-04-02: Browser-verified top-level quote exit and nested quote one-level exit on `http://localhost:3001/blocks/editor-ai`.
- 2026-04-02: Browser-verified plain and quoted paragraph `Tab` stay editor-owned and add paragraph indent on `http://localhost:3001/blocks/editor-ai`.
- 2026-04-02: Added red coverage for `Backspace@start` on empty quoted paragraphs and narrowed blockquote delete matching so only first/only empty quoted paragraphs lift; empty non-first quoted paragraphs now delete in place inside the quote.
- 2026-04-02: Added red coverage for heading `Backspace@start` with a real `BaseH1Plugin` seam and wired headings to `delete.start: 'reset'` so one `⌫` resets the heading before any merge.
- 2026-04-02: Added direct coverage for quoted-list two-step `⌫`, empty whole code-block `⌫`, and table-cell `⌫`; all three behaviors were already correct, so this slice tightened the matrix instead of changing package code.
- 2026-04-02: Added direct markdown package table coverage and locked canonical table serialization plus semantic re-deserialize behavior.
- 2026-04-02: Added nested blockquote coverage for one-level exit and nested empty-paragraph delete-in-place behavior.
- 2026-04-02: Added heading middle-split and broader H4-H6 serializer coverage.
- 2026-04-02: Added mixed-document ordered-list restart serialization coverage and updated the parity matrix to reflect the closed gaps.
- 2026-04-02: Added direct raw-markdown deserialize coverage for nested blockquotes, fenced code blocks, and multi-depth headings in `packages/markdown`.
- 2026-04-02: Added package-surface task-list checked-state round-trip coverage and locked the current canonical serializer output with `*` bullets.
- 2026-04-02: Updated the parity matrix to move the next gate off fenced-code/task-list/raw-quote/raw-heading rows and onto remaining existing-feature inline/media parity rows.
- 2026-04-02: Added a broader CommonMark package-surface fixture lane for plain links, markdown images, emphasis, inline code, and hard line breaks in `packages/markdown/src/lib/commonmarkSurface.spec.ts`.
- 2026-04-02: Locked canonical serializer output for those rows where the package contract is stable, then updated the parity matrix to move the next gate onto affinity- and attribute-specific debt instead of missing package-surface fixtures.
- 2026-04-02: Added package-local markdown rule coverage for image attribute precedence in `packages/markdown/src/lib/defaultRules.spec.ts`.
- 2026-04-02: Added package-surface coverage for trailing blockquote breaks in `packages/markdown/src/lib/commonmarkSurface.spec.ts`.
- 2026-04-02: Repointed the parity matrix to existing core `AffinityPlugin` evidence for links and marks so the remaining affinity row is framed as a profile decision instead of fake missing tests.
- 2026-04-02: Locked the markdown-profile affinity decision in code by making `BaseBoldPlugin` and `BaseItalicPlugin` directional by default and added direct `AffinityPlugin` coverage for those defaults.
- 2026-04-02: Fixed markdown image serialization so title comes from `node.title` instead of being mirrored from the caption, then updated package/app tests to match the new canonical output.
- 2026-04-02: Expanded `commonmarkSurface.spec.ts` and `defaultRules.spec.ts` into the final release-blocking matrix for plain links, images, marks, hard breaks, nested blockquotes, and image attribute precedence.
- 2026-04-03: Rewrote the parity matrix around the full existing-feature scope instead of the markdown-native gate only.
- 2026-04-03: Updated the standards doc to use feature-family authorities: Typora for markdown-native behavior, Notion for block-editor-native elements, Google Docs for table/document/review behavior, Milkdown as the open-source cross-check.
- 2026-04-03: Reopened the major execution gate around the broader existing-feature matrix: block-editor-native elements, styling/layout, and collaboration/editor-only behavior still need explicit spec coverage.
- 2026-04-03: Added direct table selection-clamp coverage in `packages/table/src/lib/withApplyTable.spec.tsx`.
- 2026-04-03: Added direct toggle `Enter` behavior coverage in `packages/toggle/src/react/withToggle.spec.tsx` for open and closed toggles.
- 2026-04-03: Updated the broader matrix to include the new table/toggle evidence and keep the next order focused on Notion-style elements, then media/caption, then styling, then collaboration.
- 2026-04-03: Started the first reopened TDD slice in the table lane by locking `Enter` inside a cell and making the multi-paragraph cell markdown policy explicit: serialize as `<br/>`, deserialize back to one paragraph with an inline break instead of pretending plain markdown tables can round-trip block children.
- 2026-04-03: Added direct behavior assertions for text align and line height transforms in `packages/basic-styles`.
- 2026-04-03: Added override-layer callout coverage for empty `↵`, non-empty `↵`, and start `⌫` in `packages/core`.
- 2026-04-03: Expanded the matrix evidence for table, styling, callout, mention, date, columns, media, caption, comment, and suggestion so the next batches start from real current coverage instead of placeholders.
- 2026-04-03: Tightened the matrix language for mention, date, TOC, and columns so the remaining work is framed as spec closure and policy, not fake missing mechanics.
- 2026-04-03: Marked toggle as deferred to a rewrite lane instead of continuing incremental fixes in this major branch.
- 2026-04-03: Added package-surface media round-trip coverage for file/audio/video nodes in `packages/markdown/src/lib/mediaSurface.spec.ts`.
- 2026-04-03: Added media node contract tests in `packages/media/src/lib/BaseMediaPluginContracts.spec.ts` and expanded caption movement coverage in `packages/caption/src/lib/withCaption.spec.tsx`.
- 2026-04-03: Fixed markdown `propsToAttributes` so MDX attribute value expressions are preserved instead of being JSON-stringified during media serialization.
- 2026-04-03: Reframed the collaboration lane so suggestion/comment stop looking like blank space and the remaining work is focused on discussion + yjs policy.
- 2026-04-03: Added direct delete-boundary behavior tests for mention, date, and TOC, and locked those behaviors in the editing spec and matrix.
- 2026-04-03: Added direct markdown package round-trip coverage for column groups in `packages/markdown/src/lib/columnSurface.spec.ts` and removed the duplicate `audit` column rows from the editing spec.
- 2026-04-03: Reclassified the media + caption lane as mostly coverage/spec debt after the MDX attribute-expression serializer bug was fixed; remaining work is per-type selection/deletion policy rather than a broad runtime seam.
- 2026-04-03: Final matrix re-evaluation: deferred toggle plus the full collaboration/editor-only lane, marked the active major-release gate closed, and reclassified the remaining partial rows as non-blocking follow-up.
- 2026-04-08: Reconsolidated roadmap truth with the parity matrix and marked this execution note as historical instead of the current gate source.
